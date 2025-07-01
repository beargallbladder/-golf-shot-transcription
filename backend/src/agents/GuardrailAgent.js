/**
 * GuardrailAgent - Advanced Quality Assurance
 * Validates shot data and ensures system integrity
 */

class GuardrailAgent {
  constructor() {
    this.validationRules = {
      speed: { min: 10, max: 250 },
      distance: { min: 5, max: 450 },
      spin: { min: 0, max: 8000 },
      launchAngle: { min: -5, max: 50 },
      smashFactor: { min: 0.8, max: 2.0 }
    };
  }

  async validate(data, context = {}) {
    try {
      console.log('🔍 GuardrailAgent: Starting validation');
      
      const validations = [
        this.physicsValidation(data),
        this.consistencyCheck(data, context.userHistory),
        this.outlierDetection(data),
        this.confidenceValidation(data),
        this.privacyCompliance(data, context.user)
      ];
      
      const isValid = validations.every(v => v.passed);
      const flags = validations.filter(v => !v.passed);
      const confidence = this.calculateConfidence(validations);
      
      console.log('🔍 Validation complete');
      
      return {
        isValid,
        confidence,
        flags,
        suggestions: this.generateSuggestions(validations),
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('🔍 GuardrailAgent error:', error);
      throw new Error(`Validation failed: ${error.message}`);
    }
  }

  physicsValidation(data) {
    const errors = [];
    
    // Check basic physics constraints
    Object.keys(this.validationRules).forEach(metric => {
      if (data[metric] !== null && data[metric] !== undefined) {
        const rule = this.validationRules[metric];
        if (data[metric] < rule.min || data[metric] > rule.max) {
          errors.push(`${metric} out of valid range: ${data[metric]}`);
        }
      }
    });
    
    // Advanced physics checks
    if (data.speed && data.distance) {
      const expectedDistance = data.speed * 2.5; // Rough estimate
      if (data.distance > expectedDistance * 1.5) {
        errors.push('Distance too high for ball speed');
      }
    }
    
    return {
      passed: errors.length === 0,
      type: 'physics',
      errors
    };
  }

  consistencyCheck(data, userHistory = []) {
    if (userHistory.length < 3) {
      return { passed: true, type: 'consistency', note: 'Insufficient history' };
    }
    
    const similarShots = userHistory.filter(shot => shot.club === data.club);
    if (similarShots.length < 2) {
      return { passed: true, type: 'consistency', note: 'No similar shots' };
    }
    
    const avgDistance = similarShots.reduce((sum, shot) => sum + shot.distance, 0) / similarShots.length;
    const deviation = Math.abs(data.distance - avgDistance) / avgDistance;
    
    return {
      passed: deviation < 0.5, // 50% deviation threshold
      type: 'consistency',
      deviation,
      note: deviation > 0.5 ? 'Significant deviation from history' : 'Consistent with history'
    };
  }

  outlierDetection(data) {
    // Simple outlier detection based on typical ranges
    const outliers = [];
    
    if (data.smashFactor && data.smashFactor > 1.6) {
      outliers.push('Unusually high smash factor');
    }
    
    if (data.spin && data.spin > 6000 && data.club === 'driver') {
      outliers.push('Very high driver spin');
    }
    
    return {
      passed: outliers.length === 0,
      type: 'outlier',
      outliers
    };
  }

  confidenceValidation(data) {
    const confidence = data.confidence || 0.5;
    
    return {
      passed: confidence >= 0.3,
      type: 'confidence',
      confidence,
      note: confidence < 0.3 ? 'Low confidence in data' : 'Acceptable confidence'
    };
  }

  privacyCompliance(data, user) {
    // Basic privacy checks
    const violations = [];
    
    if (data.personalInfo) {
      violations.push('Personal information detected in shot data');
    }
    
    return {
      passed: violations.length === 0,
      type: 'privacy',
      violations
    };
  }

  calculateConfidence(validations) {
    const passedCount = validations.filter(v => v.passed).length;
    return passedCount / validations.length;
  }

  generateSuggestions(validations) {
    const suggestions = [];
    
    validations.forEach(validation => {
      if (!validation.passed) {
        switch (validation.type) {
          case 'physics':
            suggestions.push('Check measurement accuracy');
            break;
          case 'consistency':
            suggestions.push('Verify shot conditions');
            break;
          case 'outlier':
            suggestions.push('Consider re-measurement');
            break;
          case 'confidence':
            suggestions.push('Improve data source quality');
            break;
        }
      }
    });
    
    return suggestions;
  }

  async healthCheck() {
    return {
      status: 'healthy',
      validationRules: Object.keys(this.validationRules).length,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = GuardrailAgent; 