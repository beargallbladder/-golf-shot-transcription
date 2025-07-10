const axios = require('axios');
const { cache } = require('../config/redis');

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY || 'demo-key';
    this.baseURL = 'https://api.openweathermap.org/data/2.5';
    this.cacheTimeout = 300; // 5 minutes
  }

  // Get current weather for location
  async getCurrentWeather(lat, lon) {
    const cacheKey = `weather:current:${lat}:${lon}`;
    
    try {
      // Try cache first
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Fetch from API
      const response = await axios.get(`${this.baseURL}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'imperial'
        },
        timeout: 5000
      });

      const weatherData = this.processWeatherData(response.data);
      
      // Cache the result
      await cache.set(cacheKey, weatherData, this.cacheTimeout);
      
      return weatherData;

    } catch (error) {
      console.error('❌ Weather API error:', error);
      
      // Return default weather conditions if API fails
      return this.getDefaultWeather();
    }
  }

  // Get weather by city name
  async getWeatherByCity(cityName) {
    const cacheKey = `weather:city:${cityName}`;
    
    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await axios.get(`${this.baseURL}/weather`, {
        params: {
          q: cityName,
          appid: this.apiKey,
          units: 'imperial'
        },
        timeout: 5000
      });

      const weatherData = this.processWeatherData(response.data);
      await cache.set(cacheKey, weatherData, this.cacheTimeout);
      
      return weatherData;

    } catch (error) {
      console.error('❌ Weather by city error:', error);
      return this.getDefaultWeather();
    }
  }

  // Process raw weather data
  processWeatherData(rawData) {
    const weather = {
      temperature: Math.round(rawData.main.temp),
      feelsLike: Math.round(rawData.main.feels_like),
      humidity: rawData.main.humidity,
      pressure: Math.round(rawData.main.pressure * 0.02953), // Convert to inHg
      windSpeed: Math.round(rawData.wind.speed),
      windDirection: this.getWindDirection(rawData.wind.deg),
      windGust: rawData.wind.gust ? Math.round(rawData.wind.gust) : null,
      visibility: rawData.visibility ? Math.round(rawData.visibility / 1609.34) : null, // Convert to miles
      condition: rawData.weather[0].main.toLowerCase(),
      description: rawData.weather[0].description,
      icon: rawData.weather[0].icon,
      location: {
        name: rawData.name,
        country: rawData.sys.country,
        lat: rawData.coord.lat,
        lon: rawData.coord.lon
      },
      timestamp: new Date(),
      golfConditions: this.calculateGolfConditions(rawData)
    };

    return weather;
  }

  // Calculate golf-specific conditions and adjustments
  calculateGolfConditions(weatherData) {
    const temp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;
    const pressure = weatherData.main.pressure;
    const condition = weatherData.weather[0].main.toLowerCase();

    // Calculate air density factor (affects ball flight)
    const airDensityFactor = this.calculateAirDensity(temp, pressure, humidity);
    
    // Calculate distance adjustments
    const distanceAdjustment = this.calculateDistanceAdjustment(
      temp, humidity, windSpeed, airDensityFactor, condition
    );

    // Determine playing conditions
    const playability = this.assessPlayability(condition, windSpeed, temp);

    return {
      airDensity: airDensityFactor,
      distanceAdjustment: {
        percentage: Math.round(distanceAdjustment.percentage * 100) / 100,
        yards: Math.round(distanceAdjustment.yards),
        reason: distanceAdjustment.reason
      },
      playability: {
        rating: playability.rating,
        description: playability.description,
        recommendations: playability.recommendations
      },
      windEffect: this.calculateWindEffect(windSpeed, weatherData.wind.deg),
      clothingRecommendation: this.getClothingRecommendation(temp, windSpeed, condition),
      equipmentTips: this.getEquipmentTips(temp, humidity, condition)
    };
  }

  // Calculate air density factor
  calculateAirDensity(tempF, pressureMb, humidity) {
    // Convert to metric for calculation
    const tempC = (tempF - 32) * 5/9;
    const tempK = tempC + 273.15;
    
    // Calculate air density using ideal gas law with humidity correction
    const saturationPressure = 6.11 * Math.pow(10, (7.5 * tempC) / (237.3 + tempC));
    const vaporPressure = (humidity / 100) * saturationPressure;
    const dryPressure = pressureMb - vaporPressure;
    
    const airDensity = (dryPressure * 100) / (287.05 * tempK) + 
                      (vaporPressure * 100) / (461.495 * tempK);
    
    // Standard air density at sea level (kg/m³)
    const standardDensity = 1.225;
    
    return airDensity / standardDensity;
  }

  // Calculate distance adjustment based on conditions
  calculateDistanceAdjustment(temp, humidity, windSpeed, airDensity, condition) {
    let adjustment = 0;
    let reason = [];

    // Temperature effect (every 10°F from 70°F affects distance by ~2 yards)
    const tempEffect = (temp - 70) * 0.2;
    adjustment += tempEffect;
    if (Math.abs(tempEffect) > 1) {
      reason.push(`${temp > 70 ? '+' : ''}${Math.round(tempEffect)} yds (temperature)`);
    }

    // Air density effect
    const densityEffect = (1 - airDensity) * 15; // Thin air = more distance
    adjustment += densityEffect;
    if (Math.abs(densityEffect) > 1) {
      reason.push(`${densityEffect > 0 ? '+' : ''}${Math.round(densityEffect)} yds (air density)`);
    }

    // Weather condition effects
    const conditionEffects = {
      'rain': -10,
      'drizzle': -5,
      'snow': -15,
      'mist': -3,
      'fog': -5
    };

    if (conditionEffects[condition]) {
      adjustment += conditionEffects[condition];
      reason.push(`${conditionEffects[condition]} yds (${condition})`);
    }

    return {
      percentage: adjustment / 250, // Assuming 250 yard average shot
      yards: adjustment,
      reason: reason.join(', ') || 'No significant adjustments'
    };
  }

  // Assess overall playability
  assessPlayability(condition, windSpeed, temp) {
    let rating = 'excellent';
    let description = 'Perfect conditions for golf';
    let recommendations = [];

    // Weather condition impacts
    if (['rain', 'thunderstorm'].includes(condition)) {
      rating = 'poor';
      description = 'Not recommended for play';
      recommendations.push('Wait for weather to clear');
    } else if (['drizzle', 'mist', 'fog'].includes(condition)) {
      rating = 'fair';
      description = 'Challenging conditions';
      recommendations.push('Use bright colored balls', 'Take extra clubs');
    }

    // Wind impacts
    if (windSpeed > 25) {
      rating = rating === 'excellent' ? 'poor' : rating;
      description = 'Very windy conditions';
      recommendations.push('Adjust for wind', 'Lower ball flight');
    } else if (windSpeed > 15) {
      rating = rating === 'excellent' ? 'good' : rating;
      recommendations.push('Consider wind direction');
    }

    // Temperature impacts
    if (temp < 40 || temp > 95) {
      rating = rating === 'excellent' ? 'fair' : rating;
      if (temp < 40) {
        recommendations.push('Dress warmly', 'Ball travels less');
      } else {
        recommendations.push('Stay hydrated', 'Ball travels further');
      }
    }

    return { rating, description, recommendations };
  }

  // Calculate wind effect on shots
  calculateWindEffect(windSpeed, windDirection) {
    const effects = {
      headwind: windSpeed > 10 ? `${Math.round(windSpeed * 0.8)} yards less` : 'minimal',
      tailwind: windSpeed > 10 ? `${Math.round(windSpeed * 0.6)} yards more` : 'minimal',
      crosswind: windSpeed > 10 ? `${Math.round(windSpeed * 0.5)} yards drift` : 'minimal'
    };

    return {
      speed: windSpeed,
      direction: this.getWindDirection(windDirection),
      effects,
      advice: this.getWindAdvice(windSpeed)
    };
  }

  // Get clothing recommendations
  getClothingRecommendation(temp, windSpeed, condition) {
    const recommendations = [];

    if (temp < 50) {
      recommendations.push('Long pants', 'Long sleeves', 'Light jacket');
    } else if (temp < 70) {
      recommendations.push('Long pants', 'Polo shirt');
    } else if (temp < 85) {
      recommendations.push('Shorts or pants', 'Polo shirt');
    } else {
      recommendations.push('Shorts', 'Light polo', 'Hat');
    }

    if (windSpeed > 15) {
      recommendations.push('Wind-resistant jacket');
    }

    if (['rain', 'drizzle'].includes(condition)) {
      recommendations.push('Rain gear', 'Waterproof shoes');
    }

    recommendations.push('Sunscreen', 'Sunglasses');

    return recommendations;
  }

  // Get equipment tips
  getEquipmentTips(temp, humidity, condition) {
    const tips = [];

    if (temp < 50) {
      tips.push('Use softer compression balls');
      tips.push('Consider hybrid clubs over long irons');
    } else if (temp > 85) {
      tips.push('Use harder compression balls');
    }

    if (humidity > 80) {
      tips.push('Clean grips frequently');
      tips.push('Use rosin bag or glove');
    }

    if (condition === 'rain') {
      tips.push('Use rain gloves');
      tips.push('Towel for grips and clubs');
    }

    return tips;
  }

  // Helper functions
  getWindDirection(degrees) {
    const directions = [
      'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ];
    
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  getWindAdvice(windSpeed) {
    if (windSpeed < 5) return 'Calm conditions - play normal';
    if (windSpeed < 10) return 'Light breeze - minimal impact';
    if (windSpeed < 15) return 'Moderate wind - adjust club selection';
    if (windSpeed < 25) return 'Strong wind - significant adjustments needed';
    return 'Very strong wind - consider postponing';
  }

  getDefaultWeather() {
    return {
      temperature: 72,
      feelsLike: 72,
      humidity: 50,
      pressure: 30.0,
      windSpeed: 5,
      windDirection: 'SW',
      windGust: null,
      visibility: 10,
      condition: 'clear',
      description: 'clear sky',
      icon: '01d',
      location: {
        name: 'Unknown',
        country: 'US',
        lat: 0,
        lon: 0
      },
      timestamp: new Date(),
      golfConditions: {
        airDensity: 1.0,
        distanceAdjustment: {
          percentage: 0,
          yards: 0,
          reason: 'Standard conditions'
        },
        playability: {
          rating: 'good',
          description: 'Good conditions for golf',
          recommendations: []
        },
        windEffect: {
          speed: 5,
          direction: 'SW',
          effects: {
            headwind: 'minimal',
            tailwind: 'minimal',
            crosswind: 'minimal'
          },
          advice: 'Light breeze - minimal impact'
        },
        clothingRecommendation: ['Shorts or pants', 'Polo shirt', 'Sunscreen'],
        equipmentTips: ['Standard equipment setup']
      }
    };
  }
}

module.exports = new WeatherService();