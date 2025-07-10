import React, { useState, useEffect } from 'react';
import { NextSeo } from 'next-seo';
import SmartProductCarousel from '../components/SmartProductCarousel';
import { motion } from 'framer-motion';

const GolfMarketplace = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [shotData, setShotData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [preferredRetailer, setPreferredRetailer] = useState(null);
  const [nearbyRetailers, setNearbyRetailers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeMarketplace();
  }, []);

  const initializeMarketplace = async () => {
    try {
      // Get user location
      await getCurrentLocation();
      
      // Load user profile and recent shot data
      await loadUserData();
      
      // Find nearby retailers
      await loadNearbyRetailers();
      
      setLoading(false);
    } catch (error) {
      console.error('Error initializing marketplace:', error);
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(location);
            resolve(location);
          },
          (error) => {
            console.warn('Location access denied, using default location');
            const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // NYC
            setUserLocation(defaultLocation);
            resolve(defaultLocation);
          }
        );
      } else {
        const defaultLocation = { lat: 40.7128, lng: -74.0060 };
        setUserLocation(defaultLocation);
        resolve(defaultLocation);
      }
    });
  };

  const loadUserData = async () => {
    // Mock user data - in production, fetch from API
    const mockShotData = {
      club: 'driver',
      distance: 245,
      accuracy: 72,
      consistency: 68,
      issues: ['distance_deficit', 'accuracy_inconsistent']
    };

    const mockUserProfile = {
      id: 'user_123',
      skillLevel: 'intermediate',
      preferredBrands: ['TaylorMade', 'Callaway'],
      budget: 'mid-range',
      location: userLocation,
      preferredRetailer: 'golf-world-manhattan',
      maxTravelDistance: 20
    };

    setShotData(mockShotData);
    setUserProfile(mockUserProfile);
    setPreferredRetailer(mockUserProfile.preferredRetailer);
  };

  const loadNearbyRetailers = async () => {
    // Mock nearby retailers - in production, fetch from retailer location service
    const mockRetailers = [
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
      },
      {
        id: 'central-park-golf',
        name: 'Central Park Golf Center',
        distance: 3.7,
        preferredPartner: true,
        discountLevel: 20,
        specialties: ['local-expertise', 'personalized-service'],
        features: ['driving-range', 'lessons', 'club-repair'],
        address: '567 Central Park West, New York, NY 10025'
      }
    ];

    setNearbyRetailers(mockRetailers);
  };

  const handleRetailerSelect = async (retailerId) => {
    setPreferredRetailer(retailerId);
    
    // In production, save to user profile
    console.log(`Setting preferred retailer to: ${retailerId}`);
    
    // Trigger carousel refresh with new retailer preference
    const updatedProfile = { ...userProfile, preferredRetailer: retailerId };
    setUserProfile(updatedProfile);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <NextSeo
        title="Golf Marketplace - AI-Powered Equipment Recommendations | GolfSimple"
        description="Discover golf equipment perfectly matched to your performance. AI recommendations from primary retailers, secondary market, and exclusive deals."
        canonical="https://golfsimple.com/marketplace"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  🛒 Golf Marketplace
                </h1>
                <p className="text-gray-600 mt-1">
                  AI-powered recommendations based on your performance
                </p>
              </div>
              
              {/* Location & Retailer Info */}
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  📍 {userLocation ? 'Current Location' : 'Default Location'}
                </div>
                {preferredRetailer && (
                  <div className="text-sm text-green-600 font-medium">
                    ⭐ Preferred: {nearbyRetailers.find(r => r.id === preferredRetailer)?.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Performance Summary */}
          {shotData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📊 Your Latest Performance Analysis
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{shotData.distance} yds</div>
                  <div className="text-sm text-gray-600">{shotData.club} Distance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{shotData.accuracy}%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{shotData.consistency}%</div>
                  <div className="text-sm text-gray-600">Consistency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{shotData.issues.length}</div>
                  <div className="text-sm text-gray-600">Improvement Areas</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Retailer Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              🏪 Select Your Preferred Retailer
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {nearbyRetailers.map((retailer) => (
                <div
                  key={retailer.id}
                  onClick={() => handleRetailerSelect(retailer.id)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    preferredRetailer === retailer.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {retailer.name}
                    </h3>
                    {retailer.preferredPartner && (
                      <span className="text-green-600 text-xl">⭐</span>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600">
                    <div>📍 {retailer.distance} miles away</div>
                    <div>💰 {retailer.discountLevel}% GolfSimple discount</div>
                    <div>🎯 {retailer.specialties.join(', ')}</div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {retailer.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Performance-Based Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SmartProductCarousel
              shotData={shotData}
              userProfile={userProfile}
              carouselType="performance-based"
            />
          </motion.div>

          {/* Hot Deals Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SmartProductCarousel
              shotData={shotData}
              userProfile={userProfile}
              carouselType="deals"
            />
          </motion.div>

          {/* Secondary Market Finds */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              🔄 Secondary Market Gems
            </h2>
            <div className="bg-orange-50 rounded-lg p-4 mb-4">
              <p className="text-orange-800 text-sm">
                💡 <strong>Smart Savings:</strong> High-quality used equipment can offer 40-60% 
                savings while delivering 95%+ of new performance. All items are certified and guaranteed.
              </p>
            </div>
            <SmartProductCarousel
              shotData={shotData}
              userProfile={userProfile}
              carouselType="deals"
            />
          </motion.div>

          {/* Trending Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <SmartProductCarousel
              shotData={shotData}
              userProfile={userProfile}
              carouselType="trending"
            />
          </motion.div>

          {/* Marketplace Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white"
          >
            <h2 className="text-2xl font-bold mb-4">🎯 Why Our Marketplace Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🤖</div>
                <h3 className="font-bold mb-2">AI-Powered Matching</h3>
                <p className="text-sm opacity-90">
                  Our AI analyzes your shot data to recommend equipment that will actually improve your game.
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-bold mb-2">Best Price Guarantee</h3>
                <p className="text-sm opacity-90">
                  We compare prices across retailers and negotiate exclusive discounts for GolfSimple members.
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏪</div>
                <h3 className="font-bold mb-2">Local + Online</h3>
                <p className="text-sm opacity-90">
                  Shop local retailers for fittings and service, or online for convenience and selection.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default GolfMarketplace;