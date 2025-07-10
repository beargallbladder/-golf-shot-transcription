import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for GolfSimple E2E Testing
 * Comprehensive end-to-end testing with visual regression
 */

export default defineConfig({
  // Test directory
  testDir: './e2e/__tests__',
  
  // Global test timeout
  timeout: 30000,
  
  // Expect timeout for assertions
  expect: {
    timeout: 10000,
    // Visual comparison threshold
    threshold: 0.2,
    // Animation handling
    toHaveScreenshot: {
      threshold: 0.2,
      mode: 'binary'
    }
  },
  
  // Test execution configuration
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'e2e-report' }],
    ['json', { outputFile: 'e2e-results.json' }],
    ['junit', { outputFile: 'e2e-junit.xml' }],
    ['line'],
    ['allure-playwright']
  ],
  
  // Global setup and teardown
  globalSetup: require.resolve('./e2e/global-setup.ts'),
  globalTeardown: require.resolve('./e2e/global-teardown.ts'),
  
  // Use configuration
  use: {
    // Base URL for tests
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    // Browser context options
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Geolocation for testing
    geolocation: { latitude: 40.7128, longitude: -74.0060 },
    permissions: ['geolocation'],
    
    // Timezone
    timezoneId: 'America/New_York',
    
    // Locale
    locale: 'en-US',
    
    // Color scheme
    colorScheme: 'light',
    
    // Viewport
    viewport: { width: 1280, height: 720 },
    
    // Action timeout
    actionTimeout: 10000,
    
    // Navigation timeout
    navigationTimeout: 30000,
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9'
    }
  },

  // Test projects for different browsers and devices
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /.*mobile.*.spec.ts/
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: /.*mobile.*.spec.ts/
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: /.*mobile.*.spec.ts/
    },

    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /.*mobile.*.spec.ts|.*responsive.*.spec.ts/
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      testMatch: /.*mobile.*.spec.ts|.*responsive.*.spec.ts/
    },

    // Tablet devices
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
      testMatch: /.*tablet.*.spec.ts|.*responsive.*.spec.ts/
    },

    // API testing
    {
      name: 'api',
      testMatch: /.*api.*.spec.ts/,
      use: {
        baseURL: process.env.API_BASE_URL || 'http://localhost:8000',
        extraHTTPHeaders: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    },

    // Performance testing
    {
      name: 'performance',
      testMatch: /.*performance.*.spec.ts/,
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--enable-precise-memory-info',
            '--disable-web-security',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection'
          ]
        }
      }
    },

    // Visual regression testing
    {
      name: 'visual-regression',
      testMatch: /.*visual.*.spec.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Consistent screenshot settings
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1
      }
    },

    // Accessibility testing
    {
      name: 'accessibility',
      testMatch: /.*a11y.*.spec.ts/,
      use: {
        ...devices['Desktop Chrome']
      }
    }
  ],

  // Web server configuration
  webServer: process.env.CI ? undefined : [
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
      cwd: './frontend'
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:8000/health',
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
      cwd: './backend'
    }
  ],

  // Test metadata
  metadata: {
    product: 'GolfSimple',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'test',
    branch: process.env.GITHUB_REF_NAME || 'local',
    commit: process.env.GITHUB_SHA || 'local'
  }
});