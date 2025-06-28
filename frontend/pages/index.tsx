import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { useAuth } from '../contexts/AuthContext'
import { CameraIcon, ChartBarIcon, TrophyIcon } from '@heroicons/react/24/outline'
import ShotUpload from '../components/ShotUpload'
import Dashboard from '../components/Dashboard'
import Leaderboard from '../components/Leaderboard'
import MyBag from '../components/MyBag'
import GolfHero from '../components/GolfHero'
import BeatMyBagLogo from '../components/BeatMyBagLogo'

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

      <div className="min-h-screen bg-gray-50 relative">
        {/* Subtle Golf Course Background */}
        <div 
          className="fixed inset-0 opacity-3"
          style={{
            backgroundImage: 'url(/images/golf/3BB27E62-317B-474D-9651-7FEF8FEAC6DC_1_105_c.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />
        {/* Welcome Banner */}
        {showWelcome && (
          <div className="bg-gradient-to-r from-golf-green to-golf-lightgreen text-white">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">👋</span>
                  <div>
                    <p className="font-semibold">Welcome back, {user.name}!</p>
                    <p className="text-sm opacity-90">
                      Try the new <button 
                        onClick={() => {setActiveTab('mybag'); setShowWelcome(false)}} 
                        className="underline font-bold hover:bg-white hover:bg-opacity-20 px-2 py-1 rounded"
                      >
                        🎒 My Bag
                      </button> feature!
                    </p>
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

        {/* NEW FEATURE BANNER */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <span className="animate-pulse">🚀</span>
              <span className="font-bold">NEW FEATURE:</span>
              <button 
                onClick={() => setActiveTab('mybag')}
                className="underline hover:bg-white hover:bg-opacity-20 px-2 py-1 rounded"
              >
                Track your personal bests with every club in your bag!
              </button>
              <span className="animate-pulse">🎒</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <button 
              onClick={() => setActiveTab('upload')}
              className="hover:opacity-80 transition-opacity"
            >
              <BeatMyBagLogo size="md" className="group-hover:text-golf-green transition-colors" />
            </button>
            
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

        {/* BIG OBVIOUS NAVIGATION BUTTONS */}
        <nav className="bg-white border-b shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* UPLOAD SHOT - PRIMARY ACTION */}
              <button
                onClick={() => setActiveTab('upload')}
                className={`p-6 rounded-xl text-center transition-all transform hover:scale-105 ${
                  activeTab === 'upload'
                    ? 'bg-golf-green text-white shadow-xl'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="text-3xl mb-2">📷</div>
                <div className="font-bold text-lg">UPLOAD SHOT</div>
                <div className="text-sm opacity-80">Analyze your golf shots</div>
              </button>

              {/* MY BAG - NEW FEATURE */}
              <button
                onClick={() => setActiveTab('mybag')}
                className={`p-6 rounded-xl text-center transition-all transform hover:scale-105 ${
                  activeTab === 'mybag'
                    ? 'bg-golf-green text-white shadow-xl'
                    : 'bg-gradient-to-br from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 text-gray-700 border-2 border-orange-300'
                }`}
              >
                <div className="text-3xl mb-2">🎒</div>
                <div className="font-bold text-lg">MY BAG</div>
                <div className="text-sm opacity-80">Track personal bests</div>
                <div className="text-xs mt-1 px-2 py-1 bg-orange-500 text-white rounded-full inline-block">NEW!</div>
              </button>

              {/* MY SHOTS */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`p-6 rounded-xl text-center transition-all transform hover:scale-105 ${
                  activeTab === 'dashboard'
                    ? 'bg-golf-green text-white shadow-xl'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="text-3xl mb-2">📊</div>
                <div className="font-bold text-lg">MY SHOTS</div>
                <div className="text-sm opacity-80">View all your shots</div>
              </button>

              {/* LEADERBOARD */}
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`p-6 rounded-xl text-center transition-all transform hover:scale-105 ${
                  activeTab === 'leaderboard'
                    ? 'bg-golf-green text-white shadow-xl'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="text-3xl mb-2">🏆</div>
                <div className="font-bold text-lg">LEADERBOARD</div>
                <div className="text-sm opacity-80">Compete with others</div>
              </button>
            </div>
          </div>
        </nav>

        {/* CLEAR PAGE TITLE */}
        <div className="bg-gradient-to-r from-golf-green to-golf-lightgreen text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {activeTab === 'upload' && '📷'}
                {activeTab === 'mybag' && '🎒'}
                {activeTab === 'dashboard' && '📊'}
                {activeTab === 'leaderboard' && '🏆'}
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {activeTab === 'upload' && 'Upload Golf Shot'}
                  {activeTab === 'mybag' && 'My Bag - Personal Bests'}
                  {activeTab === 'dashboard' && 'My Shots History'}
                  {activeTab === 'leaderboard' && 'Global Leaderboard'}
                </h1>
                <p className="text-sm opacity-90">
                  {activeTab === 'upload' && 'Take a photo of your golf simulator and get instant AI analysis'}
                  {activeTab === 'mybag' && 'Track your personal best shots with every club in your bag'}
                  {activeTab === 'dashboard' && 'View and manage all your analyzed golf shots'}
                  {activeTab === 'leaderboard' && 'See how you rank against other golfers worldwide'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {activeTab === 'upload' && <ShotUpload />}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'leaderboard' && <Leaderboard />}
          {activeTab === 'mybag' && <MyBag />}
        </main>
      </div>
    </>
  )
} 