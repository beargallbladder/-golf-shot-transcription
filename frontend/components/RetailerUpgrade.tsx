import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { CheckIcon, StarIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import apiClient from '../config/axios'
import CleanButton from './CleanButton'
import { useAuth } from '../contexts/AuthContext'

interface Plan {
  id: string
  name: string
  price: number | string
  interval: string
  features: string[]
  recommended: boolean
}

interface RetailerUpgradeProps {
  user: any
  onUpgradeComplete?: () => void
}

const RetailerUpgrade: React.FC<RetailerUpgradeProps> = ({ user, onUpgradeComplete }) => {
  console.log('🔧 RetailerUpgrade component loaded')
  console.log('👤 User data:', user)
  
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [businessName, setBusinessName] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const { token, login } = useAuth();

  // Check if this is Fairway Golf USA (first customer)
  const isFairwayGolf = user?.email?.includes('fairwaygolfusa.com')
  
  // Pre-fill business info for Fairway Golf
  useEffect(() => {
    console.log('🔄 RetailerUpgrade useEffect running')
    if (isFairwayGolf) {
      setBusinessName('Fairway Golf USA')
      setLocation('San Diego, CA')
    }
  }, [isFairwayGolf])

  useEffect(() => {
    console.log('📡 Fetching pricing plans...')
    fetchPricing()
  }, [])

  const fetchPricing = async () => {
    try {
      console.log('💰 Starting fetchPricing...')
      setLoading(true)
      
      const response = await apiClient.get('/auth/retailer/pricing')
      console.log('✅ Pricing response:', response.data)
      setPlans(response.data.plans)
      // Auto-select recommended plan
      const recommended = response.data.plans.find((p: Plan) => p.recommended)
      if (recommended) {
        setSelectedPlan(recommended.id)
      }
    } catch (error: any) {
      console.error('❌ Fetch pricing error:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to load pricing plans'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    console.log('🎯 handleUpgrade clicked!')
    console.log('📋 Form data:', { selectedPlan, businessName, location })
    
    if (!selectedPlan || !businessName.trim()) {
      console.log('❌ Validation failed')
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setUpgrading(true)
      console.log('🚀 Starting retailer upgrade for:', user?.email)
      console.log('📋 Upgrade data:', { plan: selectedPlan, businessName, location })
      
      const response = await apiClient.post('/auth/retailer/upgrade', {
        plan: selectedPlan,
        businessName: businessName.trim(),
        location: location.trim()
      })

      console.log('✅ Upgrade response:', response.data)
      toast.success('🎉 Retailer upgrade initiated! Check your email for next steps.')
      
      console.log('🔄 Refreshing user context...')
      if (token) {
        console.log('📡 Calling login with token to refresh context')
        await login(token, false)
        console.log('✅ User context refreshed')
      } else {
        console.log('❌ No token available for context refresh')
      }
      
      onUpgradeComplete?.()
    } catch (error: any) {
      console.error('❌ Upgrade error:', error)
      console.error('❌ Error response:', error.response?.data)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to process upgrade'
      toast.error(errorMessage)
    } finally {
      setUpgrading(false)
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'small_shop_basic': return '🏪'
      case 'small_shop_pro': return '🚀'
      case 'enterprise': return '🏢'
      default: return '⭐'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-golf-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        {isFairwayGolf ? (
          <>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎉 Welcome Fairway Golf USA!
            </h1>
            <p className="text-xl text-green-600 mb-2 font-semibold">
              You're our FIRST retailer partner - let's revolutionize golf fitting together!
            </p>
            <p className="text-gray-600">
              Enhanced AI transcription • Customer lead capture • Professional documentation
            </p>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🏌️ Upgrade to Retailer Account
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Transform your golf business with AI-powered fitting tools
            </p>
            <p className="text-gray-500">
              Enhanced transcription • Customer lead capture • Professional documentation
            </p>
          </>
        )}
      </div>

      {/* Pricing Plans */}
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border-2 p-8 cursor-pointer transition-all transform hover:scale-105 ${
              selectedPlan === plan.id
                ? 'border-golf-green bg-green-50 shadow-xl'
                : 'border-gray-200 hover:border-golf-green'
            } ${plan.recommended ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            {plan.recommended && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold flex items-center">
                  <StarIcon className="w-4 h-4 mr-1" />
                  RECOMMENDED
                </div>
              </div>
            )}

            <div className="text-center mb-6">
              <div className="text-4xl mb-2">{getPlanIcon(plan.id)}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold text-golf-green">
                {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                {typeof plan.price === 'number' && (
                  <span className="text-lg text-gray-500 font-normal">/{plan.interval}</span>
                )}
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-golf-green mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <div className={`w-full py-3 px-4 rounded-lg text-center font-medium transition-colors ${
              selectedPlan === plan.id
                ? 'bg-golf-green text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
              {selectedPlan === plan.id ? '✓ Selected' : 'Select Plan'}
            </div>
          </div>
        ))}
      </div>

      {/* Business Information Form */}
      {selectedPlan && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g., Pro Golf Shop"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-green focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Dallas, TX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-green focus:border-transparent"
              />
            </div>
          </div>

          <div className={`mt-8 p-6 rounded-lg ${isFairwayGolf ? 'bg-green-50 border-2 border-green-200' : 'bg-blue-50'}`}>
            <h4 className={`font-bold mb-2 ${isFairwayGolf ? 'text-green-900' : 'text-blue-900'}`}>
              {isFairwayGolf ? '🎉 FIRST CUSTOMER SPECIAL!' : '🚀 What happens next?'}
            </h4>
            <ul className={`space-y-1 text-sm ${isFairwayGolf ? 'text-green-800' : 'text-blue-800'}`}>
              {isFairwayGolf ? (
                <>
                  <li>• <strong>FREE BETA ACCESS</strong> - No payment required during testing</li>
                  <li>• Enhanced AI transcription with detailed club specs</li>
                  <li>• Direct line to Sam Kim for support and feedback</li>
                  <li>• Help shape the product roadmap as our founding partner</li>
                  <li>• Special pricing when we launch officially</li>
                </>
              ) : (
                <>
                  <li>• Your account will be upgraded to retailer status</li>
                  <li>• You'll get access to enhanced AI transcription</li>
                  <li>• Stripe payment integration (coming soon)</li>
                  <li>• Setup guide and training materials via email</li>
                  <li>• Direct support for getting started</li>
                </>
              )}
            </ul>
          </div>

          <div className="mt-8 text-center">
            <CleanButton
              onClick={handleUpgrade}
              disabled={!businessName.trim()}
              loading={upgrading}
              size="lg"
              className="mx-auto"
            >
              Upgrade to Retailer
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </CleanButton>
            
            <p className="text-sm text-gray-500 mt-4">
              * Stripe payment integration coming soon. You'll be contacted for billing setup.
            </p>
          </div>
        </div>
      )}

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-golf-green to-golf-lightgreen rounded-xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-6 text-center">Why Upgrade to Retailer?</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h4 className="font-bold mb-2">Enhanced AI Analysis</h4>
            <p className="text-sm opacity-90">
              Extract detailed club specs, shaft info, and fitting recommendations from every shot
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-3">👥</div>
            <h4 className="font-bold mb-2">Customer Lead Capture</h4>
            <p className="text-sm opacity-90">
              Share professional fitting data with customers and capture leads automatically
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-4xl mb-3">📈</div>
            <h4 className="font-bold mb-2">Business Growth</h4>
            <p className="text-sm opacity-90">
              Turn your range into a lead generation machine with professional documentation
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RetailerUpgrade 