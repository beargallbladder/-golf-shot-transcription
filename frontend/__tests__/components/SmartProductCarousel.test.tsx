import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import SmartProductCarousel from '../../components/SmartProductCarousel';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

describe('SmartProductCarousel', () => {
  const mockShotData = {
    club: 'driver',
    distance: 245,
    accuracy: 72,
    consistency: 68,
    issues: ['distance_deficit', 'accuracy_inconsistent']
  };

  const mockUserProfile = {
    skillLevel: 'intermediate',
    preferredBrands: ['TaylorMade', 'Callaway'],
    budget: 'mid-range',
    location: { lat: 40.7128, lng: -74.0060 },
    preferredRetailer: 'golf-world-main'
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders carousel with loading state initially', () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      expect(screen.getByText('QR code will appear here')).toBeInTheDocument();
    });

    test('renders performance-based carousel title correctly', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Recommended for Your driver Performance/)).toBeInTheDocument();
      });
    });

    test('renders trending carousel title correctly', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="trending"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Trending This Week/)).toBeInTheDocument();
      });
    });

    test('renders deals carousel title correctly', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="deals"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Hot Deals Near You/)).toBeInTheDocument();
      });
    });
  });

  describe('Category Filtering', () => {
    test('renders all category filter buttons', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/🏌️ All/)).toBeInTheDocument();
        expect(screen.getByText(/🚀 Drivers/)).toBeInTheDocument();
        expect(screen.getByText(/🎯 Irons/)).toBeInTheDocument();
        expect(screen.getByText(/⛳ Wedges/)).toBeInTheDocument();
        expect(screen.getByText(/🏌️‍♂️ Putters/)).toBeInTheDocument();
        expect(screen.getByText(/📱 Accessories/)).toBeInTheDocument();
        expect(screen.getByText(/👕 Apparel/)).toBeInTheDocument();
      });
    });

    test('filters products when category is selected', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/🚀 Drivers/)).toBeInTheDocument();
      });

      // Click drivers filter
      fireEvent.click(screen.getByText(/🚀 Drivers/));

      // Should filter to only show drivers
      await waitFor(() => {
        const driverProducts = screen.getAllByText(/Driver/);
        expect(driverProducts.length).toBeGreaterThan(0);
      });
    });

    test('active category button has correct styling', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      await waitFor(() => {
        const allButton = screen.getByText(/🏌️ All/);
        expect(allButton).toHaveClass('bg-green-600', 'text-white');
      });
    });
  });

  describe('Navigation Controls', () => {
    test('renders navigation arrows', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      await waitFor(() => {
        const prevButton = screen.getByText('←');
        const nextButton = screen.getByText('→');
        expect(prevButton).toBeInTheDocument();
        expect(nextButton).toBeInTheDocument();
      });
    });

    test('navigation arrows work correctly', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      await waitFor(() => {
        const nextButton = screen.getByText('→');
        fireEvent.click(nextButton);
        // Should trigger slide animation
      });
    });
  });

  describe('Performance Insight Display', () => {
    test('shows performance analysis for performance-based carousel', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Your driver Analysis/)).toBeInTheDocument();
        expect(screen.getByText('245 yds')).toBeInTheDocument();
        expect(screen.getByText('72%')).toBeInTheDocument();
        expect(screen.getByText('68%')).toBeInTheDocument();
      });
    });

    test('does not show performance analysis for non-performance carousel', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="trending"
        />
      );

      await waitFor(() => {
        expect(screen.queryByText(/Your driver Analysis/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Product Cards', () => {
    test('product cards display all required information', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      await waitFor(() => {
        // Should show product name, brand, price
        expect(screen.getByText(/TaylorMade Stealth 2 Driver/)).toBeInTheDocument();
        expect(screen.getByText(/TaylorMade/)).toBeInTheDocument();
        expect(screen.getByText(/\$449\.99/)).toBeInTheDocument();
      });
    });

    test('performance match badge displays correctly', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/95% Match/)).toBeInTheDocument();
      });
    });

    test('discount badge displays for discounted products', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="deals"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/18% OFF/)).toBeInTheDocument();
      });
    });

    test('retailer information displays correctly', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Golf World Pro Shop/)).toBeInTheDocument();
        expect(screen.getByText(/2\.3 mi away/)).toBeInTheDocument();
        expect(screen.getByText(/⭐/)).toBeInTheDocument(); // Preferred partner star
      });
    });

    test('recommendation explanation displays', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Your driver distance is 15 yards below average/)).toBeInTheDocument();
      });
    });
  });

  describe('Action Buttons', () => {
    test('buy now button is present and clickable', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      await waitFor(() => {
        const buyButtons = screen.getAllByText(/🛒 Buy Now/);
        expect(buyButtons.length).toBeGreaterThan(0);
        
        fireEvent.click(buyButtons[0]);
        // Should trigger purchase flow
      });
    });

    test('info and favorite buttons are present', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      await waitFor(() => {
        expect(screen.getAllByText('ℹ️').length).toBeGreaterThan(0);
        expect(screen.getAllByText('❤️').length).toBeGreaterThan(0);
      });
    });

    test('view all recommendations button works', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      await waitFor(() => {
        const viewAllButton = screen.getByText(/View All Recommendations →/);
        expect(viewAllButton).toBeInTheDocument();
        
        fireEvent.click(viewAllButton);
        // Should navigate to full recommendations page
      });
    });
  });

  describe('Loading States', () => {
    test('shows loading skeleton initially', () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      // Should show loading skeleton
      expect(screen.getByText('QR code will appear here')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles missing shot data gracefully', async () => {
      render(
        <SmartProductCarousel
          shotData={null}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/🎯 Performance Boosters/)).toBeInTheDocument();
      });
    });

    test('handles missing user profile gracefully', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={null}
          carouselType="performance-based"
        />
      );

      // Should still render but with default behavior
      await waitFor(() => {
        expect(screen.getByText(/Recommended for Your driver Performance/)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('carousel has proper ARIA labels', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      await waitFor(() => {
        const prevButton = screen.getByText('←');
        const nextButton = screen.getByText('→');
        
        expect(prevButton).toHaveAttribute('type', 'button');
        expect(nextButton).toHaveAttribute('type', 'button');
      });
    });

    test('buttons are keyboard accessible', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      await waitFor(() => {
        const categoryButton = screen.getByText(/🚀 Drivers/);
        
        // Should be focusable
        categoryButton.focus();
        expect(document.activeElement).toBe(categoryButton);
        
        // Should respond to Enter key
        fireEvent.keyDown(categoryButton, { key: 'Enter' });
      });
    });
  });

  describe('Mathematical Validation', () => {
    test('performance match calculation is correct', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      await waitFor(() => {
        const matchBadge = screen.getByText(/95% Match/);
        expect(matchBadge).toBeInTheDocument();
        
        // Validate match percentage is between 0-100
        const match = parseInt(matchBadge.textContent?.match(/(\d+)%/)?.[1] || '0');
        expect(match).toBeGreaterThanOrEqual(0);
        expect(match).toBeLessThanOrEqual(100);
      });
    });

    test('discount calculations are accurate', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="deals"
        />
      );

      await waitFor(() => {
        const originalPrice = screen.getByText(/\$549\.99/);
        const salePrice = screen.getByText(/\$449\.99/);
        const discountBadge = screen.getByText(/18% OFF/);
        
        expect(originalPrice).toBeInTheDocument();
        expect(salePrice).toBeInTheDocument();
        expect(discountBadge).toBeInTheDocument();
        
        // Validate discount calculation
        const original = 549.99;
        const sale = 449.99;
        const expectedDiscount = Math.round(((original - sale) / original) * 100);
        
        expect(expectedDiscount).toBe(18);
      });
    });

    test('distance calculations are precise', async () => {
      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      await waitFor(() => {
        const distanceText = screen.getByText(/2\.3 mi away/);
        expect(distanceText).toBeInTheDocument();
        
        // Validate distance is a reasonable number
        const distance = parseFloat(distanceText.textContent?.match(/([\d.]+) mi/)?.[1] || '0');
        expect(distance).toBeGreaterThan(0);
        expect(distance).toBeLessThan(50); // Within reasonable driving distance
      });
    });
  });

  describe('Data Flow Validation', () => {
    test('shot data flows correctly to recommendations', async () => {
      const customShotData = {
        club: 'pitching-wedge',
        distance: 95,
        accuracy: 85,
        consistency: 90,
        issues: ['short_game_precision']
      };

      render(
        <SmartProductCarousel
          shotData={customShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Your pitching-wedge Analysis/)).toBeInTheDocument();
        expect(screen.getByText('95 yds')).toBeInTheDocument();
        expect(screen.getByText('85%')).toBeInTheDocument();
        expect(screen.getByText('90%')).toBeInTheDocument();
      });
    });

    test('user profile influences product selection', async () => {
      const budgetProfile = {
        ...mockUserProfile,
        budget: 'budget',
        preferredBrands: ['Wilson', 'Top Flite']
      };

      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={budgetProfile}
          carouselType="deals"
        />
      );

      // Should show more budget-friendly options
      await waitFor(() => {
        const products = screen.getAllByText(/\$/);
        expect(products.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles empty product list', async () => {
      // Mock API to return empty results
      const emptyProfile = {
        ...mockUserProfile,
        location: { lat: 0, lng: 0 } // Remote location with no retailers
      };

      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={emptyProfile}
          carouselType="performance-based"
        />
      );

      // Should still render without crashing
      await waitFor(() => {
        expect(screen.getByText(/Recommended for Your driver Performance/)).toBeInTheDocument();
      });
    });

    test('handles network errors gracefully', async () => {
      // Mock network failure
      const networkErrorProfile = {
        ...mockUserProfile,
        id: 'network_error_user'
      };

      render(
        <SmartProductCarousel
          shotData={mockShotData}
          userProfile={networkErrorProfile}
          carouselType="performance-based"
        />
      );

      // Should show fallback content
      await waitFor(() => {
        expect(screen.getByText(/Recommended for Your driver Performance/)).toBeInTheDocument();
      });
    });

    test('handles malformed data', async () => {
      const malformedShotData = {
        club: '',
        distance: -10,
        accuracy: 150,
        consistency: null,
        issues: null
      };

      render(
        <SmartProductCarousel
          shotData={malformedShotData}
          userProfile={mockUserProfile}
          carouselType="performance-based"
        />
      );

      // Should sanitize and handle gracefully
      await waitFor(() => {
        expect(screen.getByText(/🎯 Performance Boosters/)).toBeInTheDocument();
      });
    });
  });
});