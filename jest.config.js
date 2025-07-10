/** @type {import('jest').Config} */
const config = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/config/test-setup.js'
  ],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.(test|spec).{js,jsx,ts,tsx}'
  ],
  
  // Coverage configuration - 100% REQUIRED
  collectCoverage: true,
  collectCoverageFrom: [
    // Frontend coverage
    'frontend/components/**/*.{js,jsx,ts,tsx}',
    'frontend/pages/**/*.{js,jsx,ts,tsx}',
    'frontend/hooks/**/*.{js,jsx,ts,tsx}',
    'frontend/utils/**/*.{js,jsx,ts,tsx}',
    
    // Backend coverage
    'backend/src/**/*.{js,ts}',
    
    // Exclude files
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/coverage/**',
    '!**/.next/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/public/**',
    '!**/*.config.{js,ts}',
    '!**/jest.setup.js'
  ],
  
  // Coverage thresholds - MATHEMATICAL PRECISION REQUIRED
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    },
    // Component-specific thresholds
    'frontend/components/SmartProductCarousel.tsx': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    },
    'backend/src/services/marketplaceAI.js': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    },
    'backend/src/services/retailerLocationService.js': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
    'json-summary'
  ],
  
  // Module name mapping for imports
  moduleNameMapping: {
    // Handle CSS imports
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__tests__/__mocks__/fileMock.js',
    
    // Handle module path mapping
    '^@/(.*)$': '<rootDir>/frontend/$1',
    '^@/backend/(.*)$': '<rootDir>/backend/src/$1',
    '^@/components/(.*)$': '<rootDir>/frontend/components/$1',
    '^@/pages/(.*)$': '<rootDir>/frontend/pages/$1',
    '^@/utils/(.*)$': '<rootDir>/frontend/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/frontend/hooks/$1',
    '^@/services/(.*)$': '<rootDir>/backend/src/services/$1',
    '^@/routes/(.*)$': '<rootDir>/backend/src/routes/$1'
  },
  
  // Transform files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript'
      ]
    }]
  },
  
  // Ignore transformation for these files
  transformIgnorePatterns: [
    'node_modules/(?!(framer-motion|@testing-library|@faker-js)/)'
  ],
  
  // Module directories
  moduleDirectories: [
    'node_modules',
    '<rootDir>/frontend',
    '<rootDir>/backend/src',
    '<rootDir>/__tests__'
  ],
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Reset module registry before each test
  resetModules: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Globals
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx'
      }
    }
  },
  
  // Test results processor
  testResultsProcessor: '<rootDir>/__tests__/processors/testResultsProcessor.js',
  
  // Custom reporters
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './coverage/html-report',
        filename: 'jest-report.html',
        pageTitle: 'GolfSimple Test Report',
        logoImgPath: './public/images/logo.png',
        hideIcon: false,
        expand: true
      }
    ],
    [
      'jest-junit',
      {
        outputDirectory: './coverage',
        outputName: 'junit.xml',
        suiteName: 'GolfSimple Test Suite'
      }
    ]
  ],
  
  // Project-specific configurations
  projects: [
    // Frontend tests
    {
      displayName: 'Frontend',
      testMatch: [
        '<rootDir>/frontend/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/frontend/**/*.(test|spec).{js,jsx,ts,tsx}'
      ],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/__tests__/config/test-setup.js'],
      moduleNameMapping: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__tests__/__mocks__/fileMock.js'
      }
    },
    
    // Backend tests
    {
      displayName: 'Backend',
      testMatch: [
        '<rootDir>/backend/**/__tests__/**/*.{js,ts}',
        '<rootDir>/backend/**/*.(test|spec).{js,ts}'
      ],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/__tests__/config/test-setup.js']
    },
    
    // Integration tests
    {
      displayName: 'Integration',
      testMatch: [
        '<rootDir>/__tests__/integration/**/*.{js,ts}'
      ],
      testEnvironment: 'node',
      testTimeout: 30000
    }
  ],
  
  // Watch mode configuration
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Snapshot configuration
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true
  },
  
  // Maximum worker processes
  maxWorkers: '50%',
  
  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Custom environment variables for tests
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  }
};

module.exports = config;