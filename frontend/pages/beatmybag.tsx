import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import Link from 'next/link';

const BeatMyBag = () => {
  const router = useRouter();
  const [params, setParams] = useState({
    retailer: '',
    sim: '',
    source: ''
  });

  useEffect(() => {
    // Extract URL parameters
    const { retailer, sim, source } = router.query;
    setParams({
      retailer: retailer as string || '',
      sim: sim as string || '',
      source: source as string || ''
    });

    // Track the QR code scan event
    if (source === 'qr-simulator') {
      // Analytics tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'qr_code_scan', {
          retailer_id: retailer || 'unknown',
          simulator_id: sim || 'unknown',
          source: 'golf_simulator'
        });
      }
    }
  }, [router.query]);

  const handleStartCapture = () => {
    // Build capture URL with tracking parameters
    const captureParams = new URLSearchParams();
    if (params.retailer) captureParams.append('retailer', params.retailer);
    if (params.sim) captureParams.append('sim', params.sim);
    if (params.source) captureParams.append('source', params.source);
    
    router.push(`/capture?${captureParams.toString()}`);
  };

  const handleViewLeaderboard = () => {
    const leaderboardParams = new URLSearchParams();
    if (params.retailer) leaderboardParams.append('retailer', params.retailer);
    
    router.push(`/leaderboard?${leaderboardParams.toString()}`);
  };

  return (
    <>
      <NextSeo
        title="Beat My Bag - Golf Simulator Challenge | GolfSimple"
        description="Challenge yourself! Capture your golf simulator shots and compete with golfers worldwide. AI-powered analysis and real-time leaderboards."
        canonical="https://golfsimple.com/beatmybag"
        openGraph={{
          title: 'Beat My Bag - Golf Simulator Challenge',
          description: 'Challenge yourself! Capture your golf simulator shots and compete with golfers worldwide.',
          images: [
            {
              url: 'https://golfsimple.com/images/og/beatmybag-challenge.jpg',
              width: 1200,
              height: 630,
              alt: 'Beat My Bag - Golf Simulator Challenge'
            }
          ]
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              {/* Retailer Badge */}
              {params.retailer && (
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
                  🏌️ Playing at {params.retailer.replace(/[-_]/g, ' ').toUpperCase()}
                  {params.sim && (
                    <span className="ml-2 px-2 py-1 bg-green-200 rounded text-xs">
                      {params.sim.toUpperCase()}
                    </span>
                  )}
                </div>
              )}

              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Beat My Bag
                </span>
                <div className="text-4xl md:text-5xl mt-2">🏌️⚡</div>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Challenge yourself on the golf simulator! Capture your shots, get AI analysis, 
                and climb the leaderboards. Let's see what you've got! 🎯
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button
                  onClick={handleStartCapture}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-bold rounded-xl hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  📱 Start Capturing Shots
                </button>
                
                <button
                  onClick={handleViewLeaderboard}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  🏆 View Leaderboard
                </button>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Analysis</h3>
                  <p className="text-gray-600">
                    AI-powered shot analysis gives you distance, club recommendations, and improvement tips in seconds.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="text-4xl mb-4">🏆</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Live Competition</h3>
                  <p className="text-gray-600">
                    Compete in real-time leaderboards for distance, accuracy, and consistency challenges.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="text-4xl mb-4">🎒</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">My Bag Analytics</h3>
                  <p className="text-gray-600">
                    Track every club's performance and get personalized equipment recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600">10K+</div>
                <div className="text-gray-600 text-sm">Shots Analyzed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">500+</div>
                <div className="text-gray-600 text-sm">Active Golfers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">95%</div>
                <div className="text-gray-600 text-sm">Accuracy Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">30+</div>
                <div className="text-gray-600 text-sm">Golf Simulators</div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works 🚀</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📱</span>
                </div>
                <h3 className="text-xl font-bold mb-2">1. Scan QR Code</h3>
                <p className="text-gray-600">
                  Use your phone camera to scan the QR code on the golf simulator
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎥</span>
                </div>
                <h3 className="text-xl font-bold mb-2">2. Capture Shots</h3>
                <p className="text-gray-600">
                  Record your golf shots with voice notes or upload images
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold mb-2">3. Get Analysis</h3>
                <p className="text-gray-600">
                  Receive instant AI-powered analysis and compete on leaderboards
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Beat Your Bag? ⚡
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Join thousands of golfers improving their game with AI-powered analysis
            </p>
            
            <button
              onClick={handleStartCapture}
              className="px-12 py-4 bg-white text-green-600 text-xl font-bold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              🚀 Start Your Challenge Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BeatMyBag;