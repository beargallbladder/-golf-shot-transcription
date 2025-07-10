import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  image: string;
  category: 'driver' | 'irons' | 'wedges' | 'putters' | 'accessories' | 'apparel';
  marketType: 'primary' | 'secondary' | 'clearance';
  performanceMatch: number; // 0-100 match score based on user's shot data
  retailer: {
    id: string;
    name: string;
    distance: number; // miles from user
    preferredPartner: boolean;
    discount?: number;
  };
  features: string[];
  whyRecommended: string;
  inStock: boolean;
  shippingInfo: string;
}

interface CarouselProps {
  shotData?: {
    club: string;
    distance: number;
    accuracy: number;
    consistency: number;
    issues: string[];
  };
  userProfile?: {
    skillLevel: string;
    preferredBrands: string[];
    budget: string;
    location: { lat: number; lng: number };
    preferredRetailer?: string;
  };
  carouselType: 'performance-based' | 'trending' | 'deals' | 'new-products';
}

const SmartProductCarousel: React.FC<CarouselProps> = ({ 
  shotData, 
  userProfile, 
  carouselType 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadRecommendedProducts();
  }, [shotData, userProfile, carouselType, selectedCategory]);

  const loadRecommendedProducts = async () => {
    setLoading(true);
    
    // Simulate API call to get AI-recommended products
    const recommendedProducts = await getSmartRecommendations({
      shotData,
      userProfile,
      carouselType,
      category: selectedCategory
    });
    
    setProducts(recommendedProducts);
    setLoading(false);
  };

  // AI-powered product recommendation engine
  const getSmartRecommendations = async (params: any): Promise<Product[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockProducts: Product[] = [
      // Performance-Based Recommendations
      {
        id: 'driver-001',
        name: 'TaylorMade Stealth 2 Driver',
        brand: 'TaylorMade',
        price: 449.99,
        originalPrice: 549.99,
        discountPercent: 18,
        image: '/images/products/stealth2-driver.jpg',
        category: 'driver',
        marketType: 'primary',
        performanceMatch: 95,
        retailer: {
          id: 'golf-world-main',
          name: 'Golf World Pro Shop',
          distance: 2.3,
          preferredPartner: true,
          discount: 15
        },
        features: ['Carbon Crown', '60X Carbon Twist Face', 'Adjustable Loft'],
        whyRecommended: 'Your driver distance is 15 yards below average. This club could add 20+ yards based on similar players.',
        inStock: true,
        shippingInfo: 'Same-day pickup available'
      },
      {
        id: 'iron-001',
        name: 'Callaway Rogue ST Max Irons',
        brand: 'Callaway',
        price: 799.99,
        originalPrice: 899.99,
        discountPercent: 11,
        image: '/images/products/rogue-st-irons.jpg',
        category: 'irons',
        marketType: 'primary',
        performanceMatch: 88,
        retailer: {
          id: 'pga-tour-superstore',
          name: 'PGA Tour Superstore',
          distance: 4.1,
          preferredPartner: false,
          discount: 10
        },
        features: ['A.I. Designed Flash Face', 'Tungsten Weighting', 'Urethane Microspheres'],
        whyRecommended: 'Your iron accuracy is 72%. These game-improvement irons could boost you to 85%+.',
        inStock: true,
        shippingInfo: 'Free shipping + $50 trade-in credit'
      },
      // Secondary Market Deals
      {
        id: 'driver-used-001',
        name: 'Ping G425 Driver (Used - Excellent)',
        brand: 'Ping',
        price: 229.99,
        originalPrice: 475.00,
        discountPercent: 52,
        image: '/images/products/ping-g425-used.jpg',
        category: 'driver',
        marketType: 'secondary',
        performanceMatch: 78,
        retailer: {
          id: 'global-golf',
          name: 'Global Golf',
          distance: 0, // Online retailer
          preferredPartner: true,
          discount: 5
        },
        features: ['Forged T9S+ Face', 'Dragonfly Technology', 'Certified Pre-Owned'],
        whyRecommended: 'Budget-friendly option that still delivers excellent performance for your swing speed.',
        inStock: true,
        shippingInfo: '30-day play guarantee'
      },
      // Trending Products
      {
        id: 'wedge-001',
        name: 'Vokey SM9 60° Wedge',
        brand: 'Titleist',
        price: 179.99,
        image: '/images/products/vokey-sm9.jpg',
        category: 'wedges',
        marketType: 'primary',
        performanceMatch: 92,
        retailer: {
          id: 'golf-world-main',
          name: 'Golf World Pro Shop',
          distance: 2.3,
          preferredPartner: true,
          discount: 12
        },
        features: ['Progressive CG', 'Enhanced Spin Milled Grooves', '6 Grind Options'],
        whyRecommended: 'Your short game accuracy is 65%. A quality wedge could improve this to 80%+.',
        inStock: true,
        shippingInfo: 'Professional fitting included'
      },
      // Clearance/Promotional
      {
        id: 'apparel-001',
        name: 'Nike Dri-FIT Golf Polo',
        brand: 'Nike',
        price: 34.99,
        originalPrice: 75.00,
        discountPercent: 53,
        image: '/images/products/nike-polo.jpg',
        category: 'apparel',
        marketType: 'clearance',
        performanceMatch: 45,
        retailer: {
          id: 'dicks-sporting',
          name: "Dick's Sporting Goods",
          distance: 3.7,
          preferredPartner: false,
          discount: 20
        },
        features: ['Moisture-Wicking', 'UV Protection', 'Stretch Fabric'],
        whyRecommended: 'Complete your look with performance apparel. Limited time clearance pricing!',
        inStock: true,
        shippingInfo: 'Buy online, pickup in store'
      },
      // Accessories based on performance gaps
      {
        id: 'accessory-001',
        name: 'Arccos Caddie Smart Sensors',
        brand: 'Arccos',
        price: 179.99,
        originalPrice: 199.99,
        discountPercent: 10,
        image: '/images/products/arccos-sensors.jpg',
        category: 'accessories',
        marketType: 'primary',
        performanceMatch: 85,
        retailer: {
          id: 'golf-world-main',
          name: 'Golf World Pro Shop',
          distance: 2.3,
          preferredPartner: true,
          discount: 15
        },
        features: ['Shot Tracking', 'AI Caddie', 'Strokes Gained Analytics'],
        whyRecommended: 'Track every shot automatically to accelerate improvement beyond manual logging.',
        inStock: true,
        shippingInfo: 'Installation service available'
      }
    ];

    // Filter based on shot performance and user preferences
    return mockProducts
      .filter(product => {
        if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
        if (params.carouselType === 'performance-based' && product.performanceMatch < 70) return false;
        if (params.carouselType === 'deals' && !product.discountPercent) return false;
        return true;
      })
      .sort((a, b) => {
        // Prioritize preferred retailers and performance match
        const aScore = (a.retailer.preferredPartner ? 10 : 0) + a.performanceMatch;
        const bScore = (b.retailer.preferredPartner ? 10 : 0) + b.performanceMatch;
        return bScore - aScore;
      });
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, products.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, products.length - 2)) % Math.max(1, products.length - 2));
  };

  const getCarouselTitle = () => {
    switch (carouselType) {
      case 'performance-based':
        return shotData ? `💡 Recommended for Your ${shotData.club} Performance` : '🎯 Performance Boosters';
      case 'trending':
        return '🔥 Trending This Week';
      case 'deals':
        return '💰 Hot Deals Near You';
      case 'new-products':
        return '✨ New Arrivals';
      default:
        return '🏌️ Recommended Products';
    }
  };

  const categories = [
    { id: 'all', name: 'All', icon: '🏌️' },
    { id: 'driver', name: 'Drivers', icon: '🚀' },
    { id: 'irons', name: 'Irons', icon: '🎯' },
    { id: 'wedges', name: 'Wedges', icon: '⛳' },
    { id: 'putters', name: 'Putters', icon: '🏌️‍♂️' },
    { id: 'accessories', name: 'Accessories', icon: '📱' },
    { id: 'apparel', name: 'Apparel', icon: '👕' }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="flex space-x-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1">
                <div className="h-48 bg-gray-200 rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{getCarouselTitle()}</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            disabled={products.length <= 3}
          >
            ←
          </button>
          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            disabled={products.length <= 3}
          >
            →
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 mb-4 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedCategory === category.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      {/* Performance Insight */}
      {shotData && carouselType === 'performance-based' && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-blue-600">📊</span>
            <span className="font-medium text-blue-900">Your {shotData.club} Analysis</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Distance:</span>
              <span className="font-medium ml-1">{shotData.distance} yds</span>
            </div>
            <div>
              <span className="text-gray-600">Accuracy:</span>
              <span className="font-medium ml-1">{shotData.accuracy}%</span>
            </div>
            <div>
              <span className="text-gray-600">Consistency:</span>
              <span className="font-medium ml-1">{shotData.consistency}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Product Carousel */}
      <div className="relative overflow-hidden">
        <motion.div
          className="flex space-x-4"
          animate={{ x: -currentIndex * 320 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              className="flex-shrink-0 w-72 bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
              whileHover={{ y: -2 }}
            >
              {/* Product Image */}
              <div className="relative mb-3">
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Product Image</span>
                </div>
                
                {/* Performance Match Badge */}
                {product.performanceMatch > 80 && (
                  <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {product.performanceMatch}% Match
                  </div>
                )}

                {/* Market Type Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
                  product.marketType === 'secondary' 
                    ? 'bg-orange-100 text-orange-800'
                    : product.marketType === 'clearance'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {product.marketType === 'secondary' ? 'Used' : product.marketType === 'clearance' ? 'Clearance' : 'New'}
                </div>

                {/* Discount Badge */}
                {product.discountPercent && (
                  <div className="absolute bottom-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {product.discountPercent}% OFF
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-xs">{product.brand}</p>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-green-600">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                {/* Why Recommended */}
                <div className="bg-yellow-50 rounded p-2">
                  <p className="text-xs text-yellow-800">
                    💡 {product.whyRecommended}
                  </p>
                </div>

                {/* Retailer Info */}
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-900">
                        {product.retailer.name}
                        {product.retailer.preferredPartner && (
                          <span className="ml-1 text-green-600">⭐</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-600">
                        {product.retailer.distance > 0 
                          ? `${product.retailer.distance} mi away`
                          : 'Online only'
                        }
                      </p>
                    </div>
                    {product.retailer.discount && (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                        +{product.retailer.discount}% off
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{product.shippingInfo}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2">
                  <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                    🛒 Buy Now
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                    ℹ️
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                    ❤️
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* View All Button */}
      <div className="text-center mt-4">
        <button className="text-green-600 hover:text-green-700 font-medium text-sm">
          View All Recommendations →
        </button>
      </div>
    </div>
  );
};

export default SmartProductCarousel;