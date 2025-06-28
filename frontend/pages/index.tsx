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


        {/* Header */}
        <header className="bg-white shadow-lg border-b-2 border-green-600">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setActiveTab('upload')}
                className="hover:opacity-80 transition-opacity"
              >
                <BeatMyBagLogo size="md" className="group-hover:text-golf-green transition-colors" />
              </button>
              
              {/* EMERGENCY LOGOUT - TEMPORARY */}
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1 rounded text-sm"
              >
                LOGOUT
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-4 py-2">
                {user.profilePicture && (
                  <Image
                    src={user.profilePicture}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-green-600"
                  />
                )}
                <div>
                  <div className="text-gray-800 font-bold text-sm">{user.name}</div>
                  <div className="text-gray-500 text-xs">Golfer</div>
                </div>
              </div>
              
              {/* OBVIOUS LOGOUT BUTTON */}
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg transition-colors shadow-lg"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </header>

        {/* BADASS GOLF NAVIGATION */}
        <nav className="bg-gradient-to-r from-green-800 to-green-600 shadow-2xl">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* UPLOAD SHOT - MAIN ACTION */}
              <button
                onClick={() => setActiveTab('upload')}
                className={`p-4 rounded-lg text-center transition-all transform hover:scale-105 font-bold ${
                  activeTab === 'upload'
                    ? 'bg-white text-green-800 shadow-xl border-2 border-yellow-400'
                    : 'bg-green-700 hover:bg-green-600 text-white border border-green-500'
                }`}
              >
                <div className="text-2xl mb-1">🏌️</div>
                <div className="text-sm">UPLOAD SHOT</div>
              </button>

              {/* MY BAG - PERSONAL BESTS */}
              <button
                onClick={() => setActiveTab('mybag')}
                className={`p-4 rounded-lg text-center transition-all transform hover:scale-105 font-bold relative ${
                  activeTab === 'mybag'
                    ? 'bg-white text-green-800 shadow-xl border-2 border-yellow-400'
                    : 'bg-gradient-to-br from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white border border-yellow-400'
                }`}
              >
                <div className="text-2xl mb-1">🎒</div>
                <div className="text-sm">MY BAG</div>
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">NEW</div>
              </button>

              {/* MY SHOTS HISTORY */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`p-4 rounded-lg text-center transition-all transform hover:scale-105 font-bold ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-green-800 shadow-xl border-2 border-yellow-400'
                    : 'bg-green-700 hover:bg-green-600 text-white border border-green-500'
                }`}
              >
                <div className="text-2xl mb-1">📈</div>
                <div className="text-sm">MY SHOTS</div>
              </button>

              {/* LEADERBOARD COMPETITION */}
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`p-4 rounded-lg text-center transition-all transform hover:scale-105 font-bold ${
                  activeTab === 'leaderboard'
                    ? 'bg-white text-green-800 shadow-xl border-2 border-yellow-400'
                    : 'bg-green-700 hover:bg-green-600 text-white border border-green-500'
                }`}
              >
                <div className="text-2xl mb-1">🏆</div>
                <div className="text-sm">LEADERBOARD</div>
              </button>

              {/* EMERGENCY LOGOUT BUTTON */}
              <button
                onClick={logout}
                className="p-4 rounded-lg text-center transition-all transform hover:scale-105 font-bold bg-red-600 hover:bg-red-700 text-white border border-red-500"
              >
                <div className="text-2xl mb-1">🚪</div>
                <div className="text-sm">LOGOUT</div>
              </button>
            </div>
          </div>
        </nav>

        {/* GOLF-FOCUSED PAGE HEADERS */}
        <div className="bg-gradient-to-r from-green-900 to-green-700 text-white border-b-4 border-yellow-400">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">
                {activeTab === 'upload' && '🏌️'}
                {activeTab === 'mybag' && '🎒'}
                {activeTab === 'dashboard' && '📈'}
                {activeTab === 'leaderboard' && '🏆'}
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wide">
                  {activeTab === 'upload' && 'CRUSH YOUR NEXT SHOT'}
                  {activeTab === 'mybag' && 'BEAT YOUR BAG'}
                  {activeTab === 'dashboard' && 'YOUR GOLF HISTORY'}
                  {activeTab === 'leaderboard' && 'WHO\'S THE BEST?'}
                </h1>
                <p className="text-sm opacity-90 font-medium">
                  {activeTab === 'upload' && 'Upload simulator shots • Get instant AI analysis • Track every yard'}
                  {activeTab === 'mybag' && 'Personal bests with every club • Beat your records • Build your bag'}
                  {activeTab === 'dashboard' && 'All your shots • Performance stats • Share your best drives'}
                  {activeTab === 'leaderboard' && 'Global rankings • Compete with golfers worldwide • Claim the top spot'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 relative z-10">
          {activeTab === 'upload' && <ShotUpload />}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'leaderboard' && <Leaderboard />}
          {activeTab === 'mybag' && <MyBag />}
        </main>
      </div>
    </>
  )
} 