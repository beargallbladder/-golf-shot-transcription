import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { useAuth } from '../contexts/AuthContext'
import { CameraIcon, ChartBarIcon, TrophyIcon } from '@heroicons/react/24/outline'
import ShotUpload from '../components/ShotUpload'
import Dashboard from '../components/Dashboard'
import Leaderboard from '../components/Leaderboard'
import GolfHero from '../components/GolfHero'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://golf-shot-transcription.onrender.com'

export default function Home() {
  const { user, loading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('upload')
  const [showWelcome, setShowWelcome] = useState(false)

  // Show welcome message for returning users
  useEffect(() => {
    if (user && !loading) {
      const lastVisit = localStorage.getItem('lastVisit')
      const now = Date.now()
      const oneHour = 60 * 60 * 1000

      if (!lastVisit || (now - parseInt(lastVisit)) > oneHour) {
        setShowWelcome(true)
        setTimeout(() => setShowWelcome(false), 5000) // Hide after 5 seconds
      }
      localStorage.setItem('lastVisit', now.toString())
    }
  }, [user, loading])

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-golf-green rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h2>
          <p className="text-gray-600">Getting your golf data ready</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <Head>
          <title>Beat My Bag - AI-Powered Golf Shot Analysis</title>
          <meta name="description" content="Transform your golf simulator screenshots into detailed performance insights. Track every yard, beat your friends, and improve your game with AI-powered analysis." />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          
          {/* Golf-themed meta tags */}
          <meta property="og:title" content="Beat My Bag - Track Every Yard" />
          <meta property="og:description" content="AI-powered golf shot analysis. Upload screenshots, get instant insights, beat your friends!" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://www.beatmybag.com" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Beat My Bag - Track Every Yard" />
          <meta name="twitter:description" content="AI-powered golf shot analysis. Upload screenshots, get instant insights!" />
        </Head>

        <GolfHero onLogin={handleGoogleLogin} />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Golf Shot Transcription - Dashboard</title>
        <meta name="description" content="Your golf shot analysis dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Welcome Banner */}
        {showWelcome && (
          <div className="bg-gradient-to-r from-golf-green to-golf-lightgreen text-white">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">👋</span>
                  <div>
                    <p className="font-semibold">Welcome back, {user.name}!</p>
                    <p className="text-sm opacity-90">Ready to analyze some shots?</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWelcome(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-golf-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏌️</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">beatmybag.com</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user.profilePicture && (
                  <Image
                    src={user.profilePicture}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span className="text-gray-700 font-medium">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'upload'
                    ? 'border-golf-green text-golf-green'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Upload Shot
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'dashboard'
                    ? 'border-golf-green text-golf-green'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Shots
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'leaderboard'
                    ? 'border-golf-green text-golf-green'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Leaderboard
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {activeTab === 'upload' && <ShotUpload />}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'leaderboard' && <Leaderboard />}
        </main>
      </div>
    </>
  )
} 