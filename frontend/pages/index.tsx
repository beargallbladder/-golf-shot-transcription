import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { useAuth } from '../contexts/AuthContext'
import ShotUpload from '../components/ShotUpload'
import Dashboard from '../components/Dashboard'
import Leaderboard from '../components/Leaderboard'
import RetailerUpgrade from '../components/RetailerUpgrade'
import RetailerDashboard from '../components/RetailerDashboard'
import MyBag from '../components/MyBag'
import LoadingSpinner from '../components/LoadingSpinner'
import DebugUser from '../components/DebugUser'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://golf-shot-transcription.onrender.com'

export default function Home() {
  const { user, loading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('upload')

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner 
          size="lg" 
          text="Loading Beat My Bag..."
        />
      </div>
    )
  }

  // Show login page if not authenticated
  if (!user) {
    return (
      <>
        <Head>
          <title>Beat My Bag - AI Golf Shot Analyzer</title>
          <meta name="description" content="Analyze your golf shots with AI" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h1 className="text-6xl font-bold text-green-800 mb-4">🏌️‍♂️ Beat My Bag</h1>
              <p className="text-xl text-gray-600 mb-8">AI-powered golf shot analysis</p>
              
              <button
                onClick={handleGoogleLogin}
                className="bg-white border-2 border-gray-200 rounded-xl px-8 py-4 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center space-x-4 shadow-lg hover:shadow-xl mx-auto"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Main app for authenticated users
  return (
    <>
      <Head>
        <title>Beat My Bag - Golf Shot Analyzer</title>
        <meta name="description" content="AI-powered golf shot analysis" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  console.log('🏠 Logo clicked - navigating to home (upload)')
                  setActiveTab('upload')
                }}
                className="text-2xl font-bold text-green-800 hover:text-green-600 transition-colors cursor-pointer"
              >
                🏌️‍♂️ Beat My Bag
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
              
              {/* Sign Out Button */}
              <button
                onClick={logout}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-green-800 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-5 gap-3 max-w-5xl mx-auto">
              {/* UPLOAD SHOT */}
              <button
                onClick={() => {
                  console.log('📸 Upload tab clicked!')
                  setActiveTab('upload')
                }}
                className={`p-3 rounded-lg text-center transition-all transform hover:scale-105 font-bold ${
                  activeTab === 'upload'
                    ? 'bg-white text-green-800 shadow-xl border-2 border-yellow-400'
                    : 'bg-green-700 hover:bg-green-600 text-white border border-green-500'
                }`}
              >
                <div className="text-xl mb-1">📸</div>
                <div className="text-xs">UPLOAD</div>
              </button>

              {/* MY SHOTS */}
              <button
                onClick={() => {
                  console.log('📈 Dashboard tab clicked!')
                  setActiveTab('dashboard')
                }}
                className={`p-3 rounded-lg text-center transition-all transform hover:scale-105 font-bold ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-green-800 shadow-xl border-2 border-yellow-400'
                    : 'bg-green-700 hover:bg-green-600 text-white border border-green-500'
                }`}
              >
                <div className="text-xl mb-1">📈</div>
                <div className="text-xs">MY SHOTS</div>
              </button>

              {/* MY BAG */}
              <button
                onClick={() => {
                  console.log('🎒 MyBag tab clicked!')
                  setActiveTab('mybag')
                }}
                className={`p-3 rounded-lg text-center transition-all transform hover:scale-105 font-bold ${
                  activeTab === 'mybag'
                    ? 'bg-white text-green-800 shadow-xl border-2 border-yellow-400'
                    : 'bg-green-700 hover:bg-green-600 text-white border border-green-500'
                }`}
              >
                <div className="text-xl mb-1">🎒</div>
                <div className="text-xs">MY BAG</div>
              </button>

              {/* LEADERBOARD */}
              <button
                onClick={() => {
                  console.log('🏆 Leaderboard tab clicked!')
                  setActiveTab('leaderboard')
                }}
                className={`p-3 rounded-lg text-center transition-all transform hover:scale-105 font-bold ${
                  activeTab === 'leaderboard'
                    ? 'bg-white text-green-800 shadow-xl border-2 border-yellow-400'
                    : 'bg-green-700 hover:bg-green-600 text-white border border-green-500'
                }`}
              >
                <div className="text-xl mb-1">🏆</div>
                <div className="text-xs">LEADERBOARD</div>
              </button>

              {/* RETAILER */}
              <button
                onClick={() => {
                  console.log('🏪 Retailer tab clicked!')
                  console.log('👤 Current user:', user)
                  console.log('📊 Account type:', user?.accountType)
                  setActiveTab('retailer')
                }}
                className={`p-3 rounded-lg text-center transition-all transform hover:scale-105 font-bold ${
                  activeTab === 'retailer'
                    ? 'bg-white text-green-800 shadow-xl border-2 border-yellow-400'
                    : 'bg-green-700 hover:bg-green-600 text-white border border-green-500'
                }`}
              >
                <div className="text-xl mb-1">🏪</div>
                <div className="text-xs">{user?.accountType === 'retailer' ? 'DASHBOARD' : 'RETAILER'}</div>
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {/* Debug Panel - Remove in production */}
          <DebugUser />
          
          {activeTab === 'upload' && <ShotUpload />}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'mybag' && <MyBag />}
          {activeTab === 'leaderboard' && <Leaderboard />}
          {activeTab === 'retailer' && (
            user?.accountType === 'retailer' ? 
              <RetailerDashboard /> : 
              <RetailerUpgrade user={user} onUpgradeComplete={() => {
                console.log('🎉 Upgrade completed callback triggered')
                // Force a page refresh to update the user context
                window.location.reload()
              }} />
          )}
        </main>
      </div>
    </>
  )
} 