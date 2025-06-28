import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://golf-shot-transcription.onrender.com'

interface SharedShot {
  id: number
  speed: number
  distance: number
  spin: number
  launchAngle: number
  club?: string
  createdAt: string
  imageData: string
  user: {
    name: string
    avatar: string
  }
}

interface SharingData {
  content: {
    title: string
    description: string
    shareText: string
    hashtags: string
    twitterText: string
    facebookText: string
    instagramText: string
  }
  metaTags: {
    title: string
    description: string
    ogTitle: string
    ogDescription: string
    ogType: string
    ogUrl: string
    ogSiteName: string
    twitterCard: string
    twitterTitle: string
    twitterDescription: string
    twitterSite: string
    author: string
    keywords: string
  }
  shareUrls: {
    twitter: string
    facebook: string
    linkedin: string
    whatsapp: string
    email: string
    copy: string
  }
  insights: string[]
  shareUrl: string
}

const SharedShotPage: React.FC = () => {
  const router = useRouter()
  const { id } = router.query
  const [shot, setShot] = useState<SharedShot | null>(null)
  const [sharing, setSharing] = useState<SharingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      fetchShot()
    }
  }, [id])

  const fetchShot = async () => {
    try {
      const response = await axios.get(`${API_URL}/share/shot/${id}`)
      setShot(response.data.shot)
      setSharing(response.data.sharing)
    } catch (error: any) {
      console.error('Fetch shared shot error:', error)
      setError(error.response?.data?.error || 'Failed to load shot')
    } finally {
      setLoading(false)
    }
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Share link copied to clipboard!')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-golf-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !shot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏌️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Shot Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This shot may have been deleted or made private.'}</p>
          <a 
            href="/" 
            className="px-6 py-3 bg-golf-green text-white rounded-lg hover:bg-golf-lightgreen transition-colors"
          >
            Go to Golf Shot Transcription
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{`${shot.user.name}'s Golf Shot - ${shot.distance || 'N/A'} yards`}</title>
        <meta name="description" content={`Check out this golf shot: ${shot.distance || 'N/A'} yards distance, ${shot.speed || 'N/A'} mph speed`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Enhanced Open Graph tags for social sharing */}
        <meta property="og:title" content={sharing?.metaTags.ogTitle || `${shot.user.name}'s Golf Shot`} />
        <meta property="og:description" content={sharing?.metaTags.ogDescription || `Distance: ${shot.distance || 'N/A'} yards | Speed: ${shot.speed || 'N/A'} mph | Spin: ${shot.spin || 'N/A'} rpm`} />
        <meta property="og:type" content={sharing?.metaTags.ogType || "website"} />
        <meta property="og:url" content={sharing?.metaTags.ogUrl || (typeof window !== 'undefined' ? window.location.href : '')} />
        <meta property="og:site_name" content={sharing?.metaTags.ogSiteName || "Beat My Bag"} />
        
        {/* Enhanced Twitter Card tags */}
        <meta name="twitter:card" content={sharing?.metaTags.twitterCard || "summary_large_image"} />
        <meta name="twitter:title" content={sharing?.metaTags.twitterTitle || `${shot.user.name}'s Golf Shot`} />
        <meta name="twitter:description" content={sharing?.metaTags.twitterDescription || `Distance: ${shot.distance || 'N/A'} yards | Speed: ${shot.speed || 'N/A'} mph`} />
        <meta name="twitter:site" content={sharing?.metaTags.twitterSite || "@beatmybag"} />
        
        {/* Additional meta tags */}
        <meta name="author" content={sharing?.metaTags.author || shot.user.name} />
        <meta name="keywords" content={sharing?.metaTags.keywords || "golf, shot analysis, beat my bag"} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-golf-green rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🏌️</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Golf Shot Transcription</h1>
              </div>
              <a 
                href="/" 
                className="px-4 py-2 bg-golf-green text-white rounded-lg hover:bg-golf-lightgreen transition-colors"
              >
                Try It Yourself
              </a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Shot Display */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* User Info Header */}
              <div className="bg-gradient-to-r from-golf-green to-golf-lightgreen p-6 text-white">
                <div className="flex items-center space-x-4">
                  <img
                    src={shot.user.avatar}
                    alt={shot.user.name}
                    className="w-16 h-16 rounded-full border-4 border-white"
                  />
                  <div>
                    <h2 className="text-2xl font-bold">{shot.user.name}'s Shot</h2>
                    <p className="opacity-90">{formatDate(shot.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Shot Image */}
              {shot.imageData && (
                <div className="p-6 text-center border-b">
                  <img
                    src={shot.imageData}
                    alt="Golf shot screenshot"
                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
                  />
                </div>
              )}

              {/* Shot Metrics */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Shot Analysis</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-golf-green">
                      {shot.speed ? shot.speed.toFixed(1) : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Speed (mph)</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-golf-green">
                      {shot.distance || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Distance (yards)</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-golf-green">
                      {shot.spin || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Spin (rpm)</div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-golf-green">
                      {shot.launchAngle ? `${shot.launchAngle.toFixed(1)}°` : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Launch Angle</div>
                  </div>
                </div>

                {/* Performance Insights */}
                {sharing?.insights && sharing.insights.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 text-center">Performance Insights</h4>
                    <div className="flex flex-wrap justify-center gap-2">
                      {sharing.insights.map((insight, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-golf-green text-white rounded-full text-sm font-medium"
                        >
                          {insight}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Enhanced Share Buttons */}
                <div className="space-y-4">
                  {/* Share Message */}
                  {sharing?.content.shareText && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-lg font-semibold text-gray-800 mb-2">Share this shot:</p>
                      <p className="text-golf-green font-bold text-xl">{sharing.content.shareText}</p>
                    </div>
                  )}

                  {/* Social Share Buttons */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {sharing?.shareUrls && (
                      <>
                        <a
                          href={sharing.shareUrls.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          🐦 Twitter
                        </a>
                        <a
                          href={sharing.shareUrls.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                        >
                          📘 Facebook
                        </a>
                        <a
                          href={sharing.shareUrls.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          💬 WhatsApp
                        </a>
                        <button
                          onClick={copyShareLink}
                          className="flex items-center justify-center px-4 py-3 bg-golf-green text-white rounded-lg hover:bg-golf-lightgreen transition-colors"
                        >
                          📋 Copy Link
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-8 bg-white rounded-xl shadow-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Want to analyze your own shots?</h3>
              <p className="text-gray-600 mb-6">
                Upload your golf simulator screenshots and get instant AI-powered analysis
              </p>
              <a 
                href="/" 
                className="inline-block px-8 py-4 bg-golf-green text-white rounded-lg hover:bg-golf-lightgreen transition-colors font-semibold"
              >
                🏌️ Start Analyzing Your Shots
              </a>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default SharedShotPage 