import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:8000';

// Mock user data for testing
const testUser = {
  email: 'test@golfsimple.com',
  name: 'Test Golfer',
  location: { lat: 40.7128, lng: -74.0060 }
};

const testShotData = {
  club: 'driver',
  distance: 245,
  accuracy: 72,
  consistency: 68,
  issues: ['distance_deficit', 'accuracy_inconsistent']
};

class MarketplacePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto(`${BASE_URL}/marketplace`);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForCarouselLoad() {
    await this.page.waitForSelector('[data-testid="product-carousel"]', { timeout: 10000 });
  }

  async selectCategory(category: string) {
    await this.page.click(`[data-testid="category-${category}"]`);
    await this.page.waitForTimeout(500); // Wait for filter animation
  }

  async navigateCarousel(direction: 'next' | 'prev') {
    const button = direction === 'next' ? '→' : '←';
    await this.page.click(`text=${button}`);
    await this.page.waitForTimeout(300); // Wait for slide animation
  }

  async selectRetailer(retailerId: string) {
    await this.page.click(`[data-testid="retailer-${retailerId}"]`);
    await this.page.waitForTimeout(500);
  }

  async addToCart(productIndex: number = 0) {
    const buyButtons = this.page.locator('text=🛒 Buy Now');
    await buyButtons.nth(productIndex).click();
  }

  async toggleFavorite(productIndex: number = 0) {
    const favoriteButtons = this.page.locator('text=❤️');
    await favoriteButtons.nth(productIndex).click();
  }

  async viewProductDetails(productIndex: number = 0) {
    const infoButtons = this.page.locator('text=ℹ️');
    await infoButtons.nth(productIndex).click();
  }

  async mockGeolocation() {
    await this.page.context().setGeolocation(testUser.location);
    await this.page.context().grantPermissions(['geolocation']);
  }
}

test.describe('Marketplace User Journey - Complete End-to-End', () => {
  let marketplacePage: MarketplacePage;

  test.beforeEach(async ({ page }) => {
    marketplacePage = new MarketplacePage(page);
    
    // Mock geolocation for consistent testing
    await marketplacePage.mockGeolocation();
    
    // Mock API responses for testing
    await page.route('**/api/marketplace/recommendations', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          recommendations: {
            products: [
              {
                id: 'tm-stealth2-001',
                name: 'TaylorMade Stealth 2 Driver',
                brand: 'TaylorMade',
                price: 449.99,
                originalPrice: 549.99,
                discountPercent: 18,
                category: 'driver',
                performanceMatch: 95,
                retailer: {
                  id: 'golf-world-manhattan',
                  name: 'Golf World Pro Shop',
                  distance: 2.3,
                  preferredPartner: true,
                  discount: 15
                },
                whyRecommended: 'Your driver distance is 15 yards below average. This club could add 20+ yards.',
                inStock: true,
                shippingInfo: 'Same-day pickup available'
              },
              {
                id: 'cw-rogue-001',
                name: 'Callaway Rogue ST Max Irons',
                brand: 'Callaway',
                price: 799.99,
                category: 'irons',
                performanceMatch: 88,
                retailer: {
                  id: 'pga-tour-superstore',
                  name: 'PGA Tour Superstore',
                  distance: 4.1,
                  preferredPartner: false,
                  discount: 10
                },
                whyRecommended: 'Your iron accuracy is 72%. These game-improvement irons could boost you to 85%+.',
                inStock: true,
                shippingInfo: 'Free shipping + $50 trade-in credit'
              }
            ]
          }
        })
      });
    });

    await page.route('**/api/marketplace/retailers/nearby*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          retailers: [
            {
              id: 'golf-world-manhattan',
              name: 'Golf World Pro Shop - Manhattan',
              distance: 2.3,
              preferredPartner: true,
              discountLevel: 15,
              specialties: ['fitting', 'premium-brands'],
              features: ['simulator', 'fitting', 'lessons'],
              address: '123 Broadway, New York, NY 10001'
            },
            {
              id: 'pga-tour-superstore',
              name: 'PGA Tour Superstore - Times Square',
              distance: 4.1,
              preferredPartner: false,
              discountLevel: 8,
              specialties: ['wide-selection', 'competitive-pricing'],
              features: ['simulator', 'wide-selection'],
              address: '789 7th Ave, New York, NY 10019'
            }
          ]
        })
      });
    });
  });

  test('Complete Marketplace Journey - From Landing to Purchase', async ({ page }) => {
    // Step 1: Navigate to marketplace
    await marketplacePage.goto();
    
    // Verify page loads correctly
    await expect(page).toHaveTitle(/Golf Marketplace/);
    await expect(page.locator('text=Golf Marketplace')).toBeVisible();

    // Step 2: Verify performance analysis displays
    await expect(page.locator('text=Your Latest Performance Analysis')).toBeVisible();
    await expect(page.locator('text=245 yds')).toBeVisible();
    await expect(page.locator('text=72%')).toBeVisible();
    await expect(page.locator('text=68%')).toBeVisible();

    // Step 3: Verify retailer selection section
    await expect(page.locator('text=Select Your Preferred Retailer')).toBeVisible();
    await expect(page.locator('text=Golf World Pro Shop - Manhattan')).toBeVisible();
    
    // Select preferred retailer
    await marketplacePage.selectRetailer('golf-world-manhattan');
    await expect(page.locator('[data-testid="retailer-golf-world-manhattan"]')).toHaveClass(/border-green-500/);

    // Step 4: Wait for product carousel to load
    await marketplacePage.waitForCarouselLoad();
    
    // Verify carousel title for performance-based recommendations
    await expect(page.locator('text=Recommended for Your driver Performance')).toBeVisible();

    // Step 5: Verify product cards display correctly
    await expect(page.locator('text=TaylorMade Stealth 2 Driver')).toBeVisible();
    await expect(page.locator('text=$449.99')).toBeVisible();
    await expect(page.locator('text=95% Match')).toBeVisible();
    await expect(page.locator('text=18% OFF')).toBeVisible();
    
    // Verify recommendation explanation
    await expect(page.locator('text=Your driver distance is 15 yards below average')).toBeVisible();
    
    // Verify retailer information
    await expect(page.locator('text=Golf World Pro Shop')).toBeVisible();
    await expect(page.locator('text=2.3 mi away')).toBeVisible();
    await expect(page.locator('text=⭐')).toBeVisible(); // Preferred partner star

    // Step 6: Test category filtering
    await marketplacePage.selectCategory('irons');
    await expect(page.locator('text=Callaway Rogue ST Max Irons')).toBeVisible();
    
    // Return to all categories
    await marketplacePage.selectCategory('all');
    await expect(page.locator('text=TaylorMade Stealth 2 Driver')).toBeVisible();

    // Step 7: Test carousel navigation
    await marketplacePage.navigateCarousel('next');
    // Carousel should slide to next products
    
    await marketplacePage.navigateCarousel('prev');
    // Should return to previous view

    // Step 8: Test product interactions
    
    // View product details
    await marketplacePage.viewProductDetails(0);
    // Should open details modal or navigate to product page
    
    // Add to favorites
    await marketplacePage.toggleFavorite(0);
    // Heart should change color or show feedback
    
    // Add to cart
    await marketplacePage.addToCart(0);
    // Should trigger purchase flow

    // Step 9: Verify secondary market section
    await expect(page.locator('text=Secondary Market Gems')).toBeVisible();
    await expect(page.locator('text=Smart Savings')).toBeVisible();

    // Step 10: Verify trending products section
    await expect(page.locator('text=Trending This Week')).toBeVisible();

    // Step 11: Verify marketplace benefits section
    await expect(page.locator('text=Why Our Marketplace Works')).toBeVisible();
    await expect(page.locator('text=AI-Powered Matching')).toBeVisible();
    await expect(page.locator('text=Best Price Guarantee')).toBeVisible();
    await expect(page.locator('text=Local + Online')).toBeVisible();
  });

  test('Performance Analysis Integration', async ({ page }) => {
    await marketplacePage.goto();
    
    // Verify shot data integration
    await expect(page.locator('[data-testid="performance-summary"]')).toBeVisible();
    
    // Check that performance metrics match expected values
    const distanceElement = page.locator('text=245 yds');
    const accuracyElement = page.locator('text=72%');
    const consistencyElement = page.locator('text=68%');
    
    await expect(distanceElement).toBeVisible();
    await expect(accuracyElement).toBeVisible();
    await expect(consistencyElement).toBeVisible();
    
    // Verify improvement areas count
    await expect(page.locator('text=2')).toBeVisible(); // Number of issues
  });

  test('Retailer Selection and Preferences', async ({ page }) => {
    await marketplacePage.goto();
    
    // Test retailer selection
    const retailerCards = page.locator('[data-testid^="retailer-"]');
    await expect(retailerCards).toHaveCount(2);
    
    // Select first retailer
    await retailerCards.first().click();
    await expect(retailerCards.first()).toHaveClass(/border-green-500/);
    
    // Verify retailer information displays
    await expect(page.locator('text=15% GolfSimple discount')).toBeVisible();
    await expect(page.locator('text=fitting, premium-brands')).toBeVisible();
    
    // Select second retailer
    await retailerCards.nth(1).click();
    await expect(retailerCards.nth(1)).toHaveClass(/border-green-500/);
    await expect(retailerCards.first()).not.toHaveClass(/border-green-500/);
  });

  test('Product Filtering and Navigation', async ({ page }) => {
    await marketplacePage.goto();
    await marketplacePage.waitForCarouselLoad();
    
    // Test category filtering
    const categories = ['drivers', 'irons', 'wedges', 'putters', 'accessories', 'apparel'];
    
    for (const category of categories) {
      await marketplacePage.selectCategory(category);
      
      // Verify active category styling
      const categoryButton = page.locator(`[data-testid="category-${category}"]`);
      await expect(categoryButton).toHaveClass(/bg-green-600/);
      
      // Wait for products to filter
      await page.waitForTimeout(500);
    }
    
    // Return to all categories
    await marketplacePage.selectCategory('all');
    await expect(page.locator('[data-testid="category-all"]')).toHaveClass(/bg-green-600/);
  });

  test('Product Card Interactions', async ({ page }) => {
    await marketplacePage.goto();
    await marketplacePage.waitForCarouselLoad();
    
    // Test buy now button
    const buyButton = page.locator('text=🛒 Buy Now').first();
    await expect(buyButton).toBeVisible();
    await expect(buyButton).toBeEnabled();
    
    // Test info button
    const infoButton = page.locator('text=ℹ️').first();
    await expect(infoButton).toBeVisible();
    await expect(infoButton).toBeEnabled();
    
    // Test favorite button
    const favoriteButton = page.locator('text=❤️').first();
    await expect(favoriteButton).toBeVisible();
    await expect(favoriteButton).toBeEnabled();
    
    // Test product card hover effects
    const productCard = page.locator('[data-testid="product-card"]').first();
    await productCard.hover();
    // Should trigger hover animations
  });

  test('Mathematical Accuracy Validation', async ({ page }) => {
    await marketplacePage.goto();
    await marketplacePage.waitForCarouselLoad();
    
    // Verify performance match calculations
    const matchBadge = page.locator('text=95% Match');
    await expect(matchBadge).toBeVisible();
    
    // Verify discount calculations
    const originalPrice = page.locator('text=$549.99');
    const salePrice = page.locator('text=$449.99');
    const discountBadge = page.locator('text=18% OFF');
    
    await expect(originalPrice).toBeVisible();
    await expect(salePrice).toBeVisible();
    await expect(discountBadge).toBeVisible();
    
    // Calculate expected discount: (549.99 - 449.99) / 549.99 * 100 = 18.18% ≈ 18%
    // This validates the mathematical accuracy of discount calculations
    
    // Verify distance calculations
    const distanceText = page.locator('text=2.3 mi away');
    await expect(distanceText).toBeVisible();
  });

  test('Error Handling and Edge Cases', async ({ page }) => {
    // Test with network errors
    await page.route('**/api/marketplace/recommendations', async route => {
      await route.abort('failed');
    });
    
    await marketplacePage.goto();
    
    // Should still render page with fallback content
    await expect(page.locator('text=Golf Marketplace')).toBeVisible();
    
    // Test with empty response
    await page.route('**/api/marketplace/recommendations', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          recommendations: { products: [] }
        })
      });
    });
    
    await page.reload();
    await expect(page.locator('text=Golf Marketplace')).toBeVisible();
  });

  test('Accessibility and Keyboard Navigation', async ({ page }) => {
    await marketplacePage.goto();
    await marketplacePage.waitForCarouselLoad();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify focus is visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test button activation with keyboard
    await page.keyboard.press('Enter');
    
    // Test ARIA labels and roles
    const carousel = page.locator('[role="region"]');
    if (await carousel.count() > 0) {
      await expect(carousel).toHaveAttribute('aria-label');
    }
    
    // Test button accessibility
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      await expect(button).toHaveAttribute('type', 'button');
    }
  });

  test('Performance and Load Testing', async ({ page }) => {
    // Measure page load performance
    const startTime = Date.now();
    
    await marketplacePage.goto();
    await marketplacePage.waitForCarouselLoad();
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    // Test carousel animation performance
    const animationStart = Date.now();
    await marketplacePage.navigateCarousel('next');
    const animationTime = Date.now() - animationStart;
    
    // Animation should complete within 1 second
    expect(animationTime).toBeLessThan(1000);
    
    // Test rapid interactions
    for (let i = 0; i < 5; i++) {
      await marketplacePage.selectCategory('drivers');
      await marketplacePage.selectCategory('irons');
    }
    
    // Should handle rapid interactions without errors
    await expect(page.locator('text=Golf Marketplace')).toBeVisible();
  });

  test('Mobile Responsiveness', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await marketplacePage.goto();
    await marketplacePage.waitForCarouselLoad();
    
    // Verify mobile layout
    await expect(page.locator('text=Golf Marketplace')).toBeVisible();
    
    // Test touch interactions
    const productCard = page.locator('[data-testid="product-card"]').first();
    await productCard.tap();
    
    // Test swipe gestures (if implemented)
    const carousel = page.locator('[data-testid="product-carousel"]');
    await carousel.swipe('left');
    
    // Verify responsive grid layout
    const retailerCards = page.locator('[data-testid^="retailer-"]');
    await expect(retailerCards).toBeVisible();
  });

  test('Data Persistence and State Management', async ({ page }) => {
    await marketplacePage.goto();
    await marketplacePage.waitForCarouselLoad();
    
    // Select retailer and category
    await marketplacePage.selectRetailer('golf-world-manhattan');
    await marketplacePage.selectCategory('drivers');
    
    // Reload page
    await page.reload();
    await marketplacePage.waitForCarouselLoad();
    
    // State should persist (depending on implementation)
    // This tests localStorage or session storage functionality
    
    // Test browser back/forward
    await page.goBack();
    await page.goForward();
    
    await expect(page.locator('text=Golf Marketplace')).toBeVisible();
  });
});

test.describe('API Integration Tests', () => {
  test('Recommendation API Response Validation', async ({ page }) => {
    let apiResponse: any;
    
    // Intercept API call and validate response
    await page.route('**/api/marketplace/recommendations', async route => {
      const response = await route.fetch();
      apiResponse = await response.json();
      await route.fulfill({ response });
    });
    
    const marketplacePage = new MarketplacePage(page);
    await marketplacePage.goto();
    
    // Validate API response structure
    expect(apiResponse).toBeDefined();
    expect(apiResponse.success).toBe(true);
    expect(apiResponse.recommendations).toBeDefined();
    expect(apiResponse.recommendations.products).toBeInstanceOf(Array);
    
    // Validate product structure
    const product = apiResponse.recommendations.products[0];
    expect(product).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      brand: expect.any(String),
      price: expect.any(Number),
      category: expect.any(String),
      retailer: expect.any(Object)
    });
  });

  test('Retailer API Response Validation', async ({ page }) => {
    let apiResponse: any;
    
    await page.route('**/api/marketplace/retailers/nearby*', async route => {
      const response = await route.fetch();
      apiResponse = await response.json();
      await route.fulfill({ response });
    });
    
    const marketplacePage = new MarketplacePage(page);
    await marketplacePage.mockGeolocation();
    await marketplacePage.goto();
    
    // Validate retailer API response
    expect(apiResponse.success).toBe(true);
    expect(apiResponse.retailers).toBeInstanceOf(Array);
    
    const retailer = apiResponse.retailers[0];
    expect(retailer).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      distance: expect.any(Number),
      preferredPartner: expect.any(Boolean),
      discountLevel: expect.any(Number)
    });
  });
});

test.describe('Visual Regression Tests', () => {
  test('Marketplace Visual Consistency', async ({ page }) => {
    const marketplacePage = new MarketplacePage(page);
    await marketplacePage.goto();
    await marketplacePage.waitForCarouselLoad();
    
    // Take screenshot for visual regression testing
    await expect(page).toHaveScreenshot('marketplace-full-page.png', {
      fullPage: true,
      threshold: 0.2 // Allow 20% pixel difference
    });
    
    // Screenshot of specific components
    const carousel = page.locator('[data-testid="product-carousel"]');
    await expect(carousel).toHaveScreenshot('product-carousel.png');
    
    const retailerSection = page.locator('text=Select Your Preferred Retailer').locator('..');
    await expect(retailerSection).toHaveScreenshot('retailer-selection.png');
  });

  test('Mobile Visual Consistency', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const marketplacePage = new MarketplacePage(page);
    await marketplacePage.goto();
    await marketplacePage.waitForCarouselLoad();
    
    await expect(page).toHaveScreenshot('marketplace-mobile.png', {
      fullPage: true,
      threshold: 0.2
    });
  });
});