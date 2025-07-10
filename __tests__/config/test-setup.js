/**
 * Comprehensive Test Configuration for GolfSimple
 * Sets up testing environment with 100% code coverage requirements
 */

// Global test configuration
global.testConfig = {
  // API endpoints
  API_BASE_URL: process.env.TEST_API_URL || 'http://localhost:8000',
  FRONTEND_URL: process.env.TEST_FRONTEND_URL || 'http://localhost:3000',
  
  // Test timeouts
  DEFAULT_TIMEOUT: 10000,
  API_TIMEOUT: 5000,
  E2E_TIMEOUT: 30000,
  
  // Coverage thresholds
  COVERAGE_THRESHOLD: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  
  // Performance thresholds
  PERFORMANCE_THRESHOLDS: {
    pageLoad: 3000,      // 3 seconds max page load
    apiResponse: 500,    // 500ms max API response
    animation: 300,      // 300ms max animation
    carousel: 200        // 200ms max carousel transition
  },
  
  // Mathematical precision requirements
  MATH_PRECISION: {
    distance: 0.1,       // 0.1 yard precision
    percentage: 0.01,    // 0.01% precision
    currency: 0.01,      // 1 cent precision
    coordinates: 0.0001  // GPS coordinate precision
  }
};

// Mock implementations for external services
const mockImplementations = {
  // Redis cache mock
  redis: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    setex: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    healthCheck: jest.fn().mockResolvedValue({ status: 'healthy' })
  },
  
  // OpenAI API mock
  openai: {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                analysis: 'Test analysis',
                recommendations: ['Test recommendation'],
                confidence: 0.85
              })
            }
          }]
        })
      }
    }
  },
  
  // Geolocation API mock
  geolocation: {
    getCurrentPosition: jest.fn().mockImplementation((success) => {
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10
        }
      });
    }),
    watchPosition: jest.fn(),
    clearWatch: jest.fn()
  },
  
  // Web Speech API mock
  speechRecognition: {
    start: jest.fn(),
    stop: jest.fn(),
    abort: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    continuous: true,
    interimResults: true,
    lang: 'en-US'
  },
  
  // Intersection Observer mock
  intersectionObserver: {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  }
};

// Setup DOM environment for React Testing Library
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure React Testing Library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: global.testConfig.DEFAULT_TIMEOUT
});

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock geolocation
Object.defineProperty(navigator, 'geolocation', {
  writable: true,
  value: mockImplementations.geolocation
});

// Mock Speech Recognition
Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockImplementations.speechRecognition)
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockImplementations.speechRecognition)
});

// Mock Intersection Observer
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockImplementations.intersectionObserver)
});

// Mock ResizeObserver
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))
});

// Mock requestAnimationFrame
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: jest.fn().mockImplementation(cb => setTimeout(cb, 16))
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: jest.fn().mockImplementation(id => clearTimeout(id))
});

// Mock canvas for QR code generation
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  writable: true,
  value: jest.fn().mockReturnValue({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({
      data: new Array(4).fill(0)
    })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => ({})),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
  })
});

// Mock canvas toDataURL
Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  writable: true,
  value: jest.fn(() => 'data:image/png;base64,mockImageData')
});

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'mock-object-url')
});

// Custom matchers for mathematical precision
expect.extend({
  toBeCloseToWithPrecision(received, expected, precision) {
    const pass = Math.abs(received - expected) <= precision;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be close to ${expected} within ${precision}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be close to ${expected} within ${precision}`,
        pass: false,
      };
    }
  },
  
  toBeValidPercentage(received) {
    const pass = typeof received === 'number' && received >= 0 && received <= 100;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid percentage`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid percentage (0-100)`,
        pass: false,
      };
    }
  },
  
  toBeValidDistance(received) {
    const pass = typeof received === 'number' && received > 0 && received <= 400;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid golf distance`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid golf distance (1-400 yards)`,
        pass: false,
      };
    }
  },
  
  toBeValidCoordinate(received) {
    const pass = typeof received === 'object' && 
                 typeof received.lat === 'number' && 
                 typeof received.lng === 'number' &&
                 received.lat >= -90 && received.lat <= 90 &&
                 received.lng >= -180 && received.lng <= 180;
    
    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be valid coordinates`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be valid coordinates`,
        pass: false,
      };
    }
  },
  
  toBeValidPrice(received) {
    const pass = typeof received === 'number' && 
                 received > 0 && 
                 received < 10000 &&
                 Number.isFinite(received) &&
                 Math.round(received * 100) === received * 100; // Check for cent precision
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid price`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid price (positive number with cent precision)`,
        pass: false,
      };
    }
  }
});

// Global test utilities
global.testUtils = {
  // Wait for element to appear with timeout
  waitForElement: async (selector, timeout = global.testConfig.DEFAULT_TIMEOUT) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkElement = () => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        } else {
          setTimeout(checkElement, 100);
        }
      };
      
      checkElement();
    });
  },
  
  // Trigger haptic feedback (for testing)
  triggerHaptic: jest.fn(),
  
  // Mock network delay
  networkDelay: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Generate test ID
  generateTestId: (component, element) => `${component}-${element}`,
  
  // Mathematical validation utilities
  validateDiscountCalculation: (original, sale, expectedPercent) => {
    const actualPercent = Math.round(((original - sale) / original) * 100);
    return Math.abs(actualPercent - expectedPercent) <= 1; // 1% tolerance
  },
  
  validateDistanceCalculation: (lat1, lng1, lat2, lng2, expectedDistance) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const calculatedDistance = R * c;
    
    return Math.abs(calculatedDistance - expectedDistance) <= global.testConfig.MATH_PRECISION.distance;
  },
  
  // Performance measurement
  measurePerformance: async (fn, threshold) => {
    const start = performance.now();
    await fn();
    const end = performance.now();
    const duration = end - start;
    
    return {
      duration,
      withinThreshold: duration <= threshold,
      exceeded: duration > threshold ? duration - threshold : 0
    };
  }
};

// Console error handling for tests
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  // Allow certain expected errors in tests
  const allowedErrors = [
    'Warning: ReactDOM.render is deprecated',
    'Warning: componentWillReceiveProps has been renamed',
    'Warning: componentWillMount has been renamed'
  ];
  
  const errorMessage = args.join(' ');
  const isAllowed = allowedErrors.some(allowed => errorMessage.includes(allowed));
  
  if (!isAllowed) {
    originalError.apply(console, args);
    throw new Error(`Unexpected console.error: ${errorMessage}`);
  }
};

console.warn = (...args) => {
  // Allow certain expected warnings in tests
  const allowedWarnings = [
    'Warning: React.createFactory() is deprecated',
    'Warning: componentWillReceiveProps has been renamed'
  ];
  
  const warningMessage = args.join(' ');
  const isAllowed = allowedWarnings.some(allowed => warningMessage.includes(allowed));
  
  if (!isAllowed) {
    originalWarn.apply(console, args);
  }
};

// Restore console methods after tests
afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Global test cleanup
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clear any timers
  jest.clearAllTimers();
  
  // Reset DOM if needed
  document.body.innerHTML = '';
  
  // Clear localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();
});

// Export mock implementations for individual test use
export { mockImplementations };

// Export test configuration
export { testConfig } from './test-setup';