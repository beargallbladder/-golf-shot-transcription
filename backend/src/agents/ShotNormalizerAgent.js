/**
 * ShotNormalizerAgent - Data Standardization
 * Converts various shot data formats into unified structure
 */

class ShotNormalizerAgent {
  constructor() {
    this.standardUnits = {
      speed: 'mph',
      distance: 'yards',
      spin: 'rpm',
      angle: 'degrees'
    };
  }

  async normalize(rawData, context = {}) {
    try {
      console.log('⚙️ ShotNormalizerAgent: Starting normalization');
      
      const normalizedShot = {
        // Core metrics
        speed: this.normalizeSpeed(rawData.speed),
        distance: this.normalizeDistance(rawData.distance),
        spin: this.normalizeSpin(rawData.spin),
        launchAngle: this.normalizeLaunchAngle(rawData.launchAngle),
        club: this.normalizeClub(rawData.club),
        
        // Enhanced metrics
        smashFactor: this.calculateSmashFactor(rawData),
        ballFlight: this.normalizeBallFlight(rawData.ballFlight || rawData.aiInsights?.ballFlight),
        carryDistance: this.calculateCarryDistance(rawData),
        rollDistance: this.calculateRollDistance(rawData),
        peakHeight: this.calculatePeakHeight(rawData),
        descentAngle: this.calculateDescentAngle(rawData),
        
        // Dispersion analysis
        dispersion: this.calculateDispersion(rawData),
        
        // Environmental factors
        conditions: this.normalizeConditions(rawData.conditions || context.conditions),
        
        // Equipment details
        equipment: this.normalizeEquipment(rawData.equipment || context.equipment),
        
        // Metadata
        source: rawData.source || 'unknown',
        confidence: rawData.confidence || 0.5,
        timestamp: new Date().toISOString(),
        
        // Context
        userId: context.user?.id,
        sessionId: context.sessionId,
        courseId: context.courseId
      };
      
      // Validate normalized data
      const validation = this.validateNormalizedData(normalizedShot);
      if (!validation.isValid) {
        console.warn('⚙️ Normalization validation failed:', validation.errors);
      }
      
      console.log('⚙️ Shot normalization complete');
      return normalizedShot;
      
    } catch (error) {
      console.error('⚙️ ShotNormalizerAgent error:', error);
      throw new Error(`Shot normalization failed: ${error.message}`);
    }
  }

  normalizeSpeed(speed) {
    if (!speed) return null;
    
    // Convert to mph if needed
    if (typeof speed === 'string' && speed.includes('km/h')) {
      return parseFloat(speed) * 0.621371;
    }
    
    const numSpeed = parseFloat(speed);
    return numSpeed > 0 && numSpeed < 300 ? Math.round(numSpeed * 10) / 10 : null;
  }

  normalizeDistance(distance) {
    if (!distance) return null;
    
    // Convert to yards if needed
    if (typeof distance === 'string' && distance.includes('m')) {
      return parseFloat(distance) * 1.09361;
    }
    
    const numDistance = parseFloat(distance);
    return numDistance > 0 && numDistance < 500 ? Math.round(numDistance) : null;
  }

  normalizeSpin(spin) {
    if (!spin) return null;
    
    const numSpin = parseFloat(spin);
    return numSpin > 0 && numSpin < 10000 ? Math.round(numSpin) : null;
  }

  normalizeLaunchAngle(angle) {
    if (!angle) return null;
    
    const numAngle = parseFloat(angle);
    return numAngle >= -10 && numAngle <= 60 ? Math.round(numAngle * 10) / 10 : null;
  }

  normalizeClub(club) {
    if (!club) return 'unknown';
    
    const clubStr = club.toString().toLowerCase();
    
    // Standardize club names
    const clubMap = {
      'dr': 'driver',
      'driver': 'driver',
      '3w': '3-wood',
      '5w': '5-wood',
      '3h': '3-hybrid',
      '4h': '4-hybrid',
      '5h': '5-hybrid',
      'pw': 'pitching-wedge',
      'sw': 'sand-wedge',
      'lw': 'lob-wedge',
      'putter': 'putter'
    };
    
    // Check for iron numbers
    const ironMatch = clubStr.match(/(\d+)[-\s]?iron/);
    if (ironMatch) {
      return `${ironMatch[1]}-iron`;
    }
    
    // Check for direct number (assume iron)
    const numberMatch = clubStr.match(/^(\d+)$/);
    if (numberMatch && parseInt(numberMatch[1]) >= 3 && parseInt(numberMatch[1]) <= 9) {
      return `${numberMatch[1]}-iron`;
    }
    
    return clubMap[clubStr] || clubStr;
  }

  calculateSmashFactor(data) {
    if (!data.speed || !data.clubSpeed) return null;
    
    const smash = data.speed / data.clubSpeed;
    return smash > 0.5 && smash < 2.0 ? Math.round(smash * 100) / 100 : null;
  }

  normalizeBallFlight(ballFlight) {
    if (!ballFlight) return 'straight';
    
    const flight = ballFlight.toString().toLowerCase();
    const validFlights = ['straight', 'draw', 'fade', 'hook', 'slice'];
    
    return validFlights.includes(flight) ? flight : 'straight';
  }

  calculateCarryDistance(data) {
    if (data.carryDistance) return this.normalizeDistance(data.carryDistance);
    
    // Estimate carry distance (typically 85-90% of total distance)
    if (data.distance) {
      return Math.round(data.distance * 0.87);
    }
    
    return null;
  }

  calculateRollDistance(data) {
    if (data.rollDistance) return this.normalizeDistance(data.rollDistance);
    
    // Estimate roll distance
    if (data.distance && data.carryDistance) {
      return data.distance - data.carryDistance;
    }
    
    if (data.distance) {
      return Math.round(data.distance * 0.13);
    }
    
    return null;
  }

  calculatePeakHeight(data) {
    if (data.peakHeight) return Math.round(data.peakHeight);
    
    // Estimate peak height based on launch angle and ball speed
    if (data.launchAngle && data.speed) {
      const height = (data.speed * Math.sin(data.launchAngle * Math.PI / 180)) / 2;
      return Math.round(height);
    }
    
    return null;
  }

  calculateDescentAngle(data) {
    if (data.descentAngle) return Math.round(data.descentAngle * 10) / 10;
    
    // Estimate descent angle (typically steeper than launch angle)
    if (data.launchAngle) {
      return Math.round((data.launchAngle + 10) * 10) / 10;
    }
    
    return null;
  }

  calculateDispersion(data) {
    if (data.dispersion) return data.dispersion;
    
    // Default dispersion based on club and skill level
    const clubDispersion = {
      'driver': { lateral: 25, longitudinal: 15 },
      'iron': { lateral: 15, longitudinal: 10 },
      'wedge': { lateral: 8, longitudinal: 5 }
    };
    
    const clubType = this.getClubType(data.club);
    return clubDispersion[clubType] || { lateral: 20, longitudinal: 12 };
  }

  getClubType(club) {
    if (!club) return 'iron';
    
    const clubStr = club.toLowerCase();
    if (clubStr.includes('driver')) return 'driver';
    if (clubStr.includes('wedge')) return 'wedge';
    return 'iron';
  }

  normalizeConditions(conditions) {
    if (!conditions) {
      return {
        wind: { speed: 0, direction: 0 },
        temperature: 70,
        humidity: 50,
        altitude: 0
      };
    }
    
    return {
      wind: {
        speed: Math.max(0, Math.min(50, conditions.wind?.speed || 0)),
        direction: Math.max(0, Math.min(360, conditions.wind?.direction || 0))
      },
      temperature: Math.max(-20, Math.min(120, conditions.temperature || 70)),
      humidity: Math.max(0, Math.min(100, conditions.humidity || 50)),
      altitude: Math.max(-1000, Math.min(15000, conditions.altitude || 0))
    };
  }

  normalizeEquipment(equipment) {
    if (!equipment) return null;
    
    return {
      brand: equipment.brand || 'unknown',
      model: equipment.model || 'unknown',
      loft: equipment.loft ? Math.max(0, Math.min(90, equipment.loft)) : null,
      lie: equipment.lie ? Math.max(45, Math.min(80, equipment.lie)) : null,
      shaft: equipment.shaft ? {
        type: ['steel', 'graphite'].includes(equipment.shaft.type) ? equipment.shaft.type : 'unknown',
        flex: ['L', 'A', 'R', 'S', 'X'].includes(equipment.shaft.flex) ? equipment.shaft.flex : 'R',
        weight: equipment.shaft.weight ? Math.max(30, Math.min(200, equipment.shaft.weight)) : null
      } : null,
      grip: equipment.grip || 'standard'
    };
  }

  validateNormalizedData(shot) {
    const errors = [];
    
    // Validate required fields
    if (!shot.userId) errors.push('Missing user ID');
    if (!shot.timestamp) errors.push('Missing timestamp');
    
    // Validate data ranges
    if (shot.speed && (shot.speed < 10 || shot.speed > 250)) {
      errors.push(`Invalid speed: ${shot.speed}`);
    }
    
    if (shot.distance && (shot.distance < 5 || shot.distance > 450)) {
      errors.push(`Invalid distance: ${shot.distance}`);
    }
    
    if (shot.spin && (shot.spin < 0 || shot.spin > 8000)) {
      errors.push(`Invalid spin: ${shot.spin}`);
    }
    
    if (shot.launchAngle && (shot.launchAngle < -5 || shot.launchAngle > 50)) {
      errors.push(`Invalid launch angle: ${shot.launchAngle}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  async healthCheck() {
    return {
      status: 'healthy',
      standardUnits: this.standardUnits,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ShotNormalizerAgent; 