import React, { useState, useEffect } from 'react'
import { CameraIcon, ChartBarIcon, TrophyIcon } from '@heroicons/react/24/outline'

const golfImages = [
  '/images/golf/course-water.jpg', // Golf course with water reflection
  '/images/golf/course-bridge.jpg', // Golf course with wooden bridge  
  '/images/golf/course-ocean.jpg', // Ocean golf course view
  '/images/golf/course-fairway.jpg', // Beautiful golf fairway
  '/images/golf/course-desert.jpg', // Desert golf course with mountains
  '/images/golf/course-green.jpg', // Pristine putting green
  '/images/golf/course-sunset.jpg', // Sunset golf course magic
]

interface GolfHeroProps {
  onLogin: () => void
}

const GolfHero: React.FC<GolfHeroProps> = ({ onLogin }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % golfImages.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Images with Smooth Transitions */}
      <div className="absolute inset-0">
        {golfImages.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        ))}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Hero Text */}
            <div className="text-white space-y-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="text-3xl">🏌️</span>
                  </div>
                  <div className="text-golf-sand font-bold text-xl tracking-wide">
                    BEATMYBAG.COM
                  </div>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  Track Every
                  <br />
                  <span className="text-golf-sand">Yard</span>
                </h1>
                
                <p className="text-xl lg:text-2xl opacity-90 leading-relaxed max-w-2xl">
                  Transform your golf simulator screenshots into detailed performance insights. 
                  <span className="text-golf-sand font-semibold"> AI-powered analysis</span> that helps you 
                  crush your personal records.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-8 text-sm opacity-80">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-golf-sand rounded-full animate-pulse"></div>
                  <span>Instant Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-golf-sand rounded-full animate-pulse"></div>
                  <span>Track Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-golf-sand rounded-full animate-pulse"></div>
                  <span>Beat Friends</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 py-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-golf-sand">10+</div>
                  <div className="text-sm opacity-80">Shots Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-golf-sand">227</div>
                  <div className="text-sm opacity-80">Max Distance</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-golf-sand">149</div>
                  <div className="text-sm opacity-80">Max Speed</div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Card */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-golf-green to-golf-lightgreen rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <CameraIcon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-3">Start Tracking</h2>
                    <p className="text-gray-600 text-lg">Sign in to analyze your shots</p>
                  </div>

                  <button
                    onClick={onLogin}
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-8 py-4 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center space-x-4 shadow-md hover:shadow-lg group"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-lg group-hover:text-golf-green transition-colors">Continue with Google</span>
                  </button>

                  <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="p-3">
                      <div className="w-10 h-10 bg-golf-green/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <CameraIcon className="w-5 h-5 text-golf-green" />
                      </div>
                      <p className="text-xs text-gray-600 font-medium">Upload</p>
                    </div>
                    <div className="p-3">
                      <div className="w-10 h-10 bg-golf-green/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <ChartBarIcon className="w-5 h-5 text-golf-green" />
                      </div>
                      <p className="text-xs text-gray-600 font-medium">Analyze</p>
                    </div>
                    <div className="p-3">
                      <div className="w-10 h-10 bg-golf-green/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <TrophyIcon className="w-5 h-5 text-golf-green" />
                      </div>
                      <p className="text-xs text-gray-600 font-medium">Compete</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-2">
          {golfImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'bg-golf-sand w-8' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default GolfHero 