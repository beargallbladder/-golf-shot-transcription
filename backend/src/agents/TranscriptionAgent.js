/**
 * TranscriptionAgent - AI-Powered Shot Analysis
 * Uses GPT-4o Vision for intelligent shot data extraction
 */

const OpenAI = require('openai');

class TranscriptionAgent {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.supportedLanguages = ['en', 'es', 'fr', 'de'];
  }

  async transcribe(mediaData, context = {}) {
    try {
      console.log('🧠 TranscriptionAgent: Starting AI analysis');
      
      if (mediaData.type === 'simulator') {
        return await this.processSimulatorData(mediaData, context);
      }
      
      if (mediaData.type === 'image') {
        return await this.analyzeImage(mediaData, context);
      }
      
      if (mediaData.type === 'voice') {
        return await this.transcribeVoice(mediaData, context);
      }
      
      return await this.fallbackAnalysis(mediaData, context);
      
    } catch (error) {
      console.error('🧠 TranscriptionAgent error:', error);
      throw new Error(`AI transcription failed: ${error.message}`);
    }
  }

  async processSimulatorData(mediaData, context) {
    console.log('🧠 Processing simulator data with AI enhancement');
    
    // Enhance simulator data with AI insights
    const enhancedData = {
      ...mediaData.data,
      aiInsights: {
        ballFlight: this.analyzeBallFlight(mediaData.data),
        clubRecommendation: this.recommendClub(mediaData.data),
        improvementTips: this.generateTips(mediaData.data)
      },
      confidence: mediaData.confidence
    };
    
    return enhancedData;
  }

  async analyzeImage(mediaData, context) {
    console.log('🧠 Analyzing image with GPT-4o Vision');
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this golf shot data image. Extract:
                - Ball speed (mph)
                - Distance (yards)
                - Spin rate (rpm)
                - Launch angle (degrees)
                - Club type
                - Any other visible metrics
                
                Language: ${context.language || 'en'}
                User context: ${JSON.stringify(context.user || {})}`
              },
              {
                type: "image_url",
                image_url: {
                  url: mediaData.imageData.url || `data:${mediaData.imageData.type};base64,${mediaData.imageData.base64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      });

      const analysis = this.parseGPTResponse(response.choices[0].message.content);
      
      return {
        ...analysis,
        confidence: 0.85,
        source: 'gpt4o_vision',
        originalResponse: response.choices[0].message.content
      };
      
    } catch (error) {
      console.error('🧠 GPT-4o Vision error:', error);
      return this.fallbackImageAnalysis(mediaData, context);
    }
  }

  async transcribeVoice(mediaData, context) {
    console.log('🧠 Transcribing voice note');
    
    // Mock voice transcription
    return {
      transcription: "7-iron, 150 yards, slight draw",
      extractedData: {
        club: "7-iron",
        distance: 150,
        ballFlight: "draw"
      },
      confidence: 0.80,
      source: 'voice_transcription'
    };
  }

  parseGPTResponse(response) {
    // Parse GPT response and extract structured data
    const data = {
      speed: this.extractNumber(response, /ball speed.*?(\d+\.?\d*)/i),
      distance: this.extractNumber(response, /distance.*?(\d+\.?\d*)/i),
      spin: this.extractNumber(response, /spin.*?(\d+\.?\d*)/i),
      launchAngle: this.extractNumber(response, /launch angle.*?(\d+\.?\d*)/i),
      club: this.extractClub(response)
    };
    
    return data;
  }

  extractNumber(text, regex) {
    const match = text.match(regex);
    return match ? parseFloat(match[1]) : null;
  }

  extractClub(text) {
    const clubs = ['driver', 'wood', 'hybrid', 'iron', 'wedge', 'putter'];
    const lowerText = text.toLowerCase();
    
    for (const club of clubs) {
      if (lowerText.includes(club)) {
        return club;
      }
    }
    
    return 'unknown';
  }

  analyzeBallFlight(data) {
    if (!data.launchAngle || !data.spin) return 'unknown';
    
    if (data.launchAngle > 15 && data.spin > 3000) return 'high_spin';
    if (data.launchAngle < 10 && data.spin < 2000) return 'low_penetrating';
    return 'optimal';
  }

  recommendClub(data) {
    if (!data.distance) return 'unknown';
    
    if (data.distance > 250) return 'driver';
    if (data.distance > 150) return 'iron';
    if (data.distance > 100) return 'wedge';
    return 'putter';
  }

  generateTips(data) {
    const tips = [];
    
    if (data.smashFactor && data.smashFactor < 1.4) {
      tips.push('Focus on center contact for better efficiency');
    }
    
    if (data.launchAngle && data.launchAngle < 8) {
      tips.push('Try to get the ball airborne with a higher launch angle');
    }
    
    if (data.spin && data.spin > 4000) {
      tips.push('Reduce spin for more distance');
    }
    
    return tips;
  }

  async fallbackAnalysis(mediaData, context) {
    console.log('🧠 Using fallback analysis');
    return {
      confidence: 0.50,
      source: 'fallback',
      needsManualReview: true,
      rawData: mediaData
    };
  }

  async fallbackImageAnalysis(mediaData, context) {
    console.log('🧠 Using fallback image analysis');
    return {
      speed: null,
      distance: null,
      spin: null,
      launchAngle: null,
      club: 'unknown',
      confidence: 0.30,
      source: 'fallback_image',
      error: 'GPT-4o Vision unavailable'
    };
  }

  async healthCheck() {
    try {
      // Test OpenAI API connection
      await this.openai.models.list();
      return {
        status: 'healthy',
        openai: 'connected',
        supportedLanguages: this.supportedLanguages.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'degraded',
        openai: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = TranscriptionAgent; 