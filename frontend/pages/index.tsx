import React, { useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { useAuth } from '../contexts/AuthContext'
import { CameraIcon, ChartBarIcon, TrophyIcon } from '@heroicons/react/24/outline'
import ShotUpload from '../components/ShotUpload'
import Dashboard from '../components/Dashboard'
import Leaderboard from '../components/Leaderboard'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function Home() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('upload')

  const handleGoogleLogin = () => {
    console.log('Redirecting to:', `${API_URL}/auth/google`)
    window.location.href = `${API_URL}/auth/google`
  }

  const testBackend = async () => {
    try {
      const response = await fetch(`${API_URL}/health`)
      if (response.ok) {
        alert('✅ Backend is working! OAuth should work now.')
      } else {
        alert('❌ Backend responded but with error. Check Render logs.')
      }
    } catch (error) {
      alert(`❌ Backend not accessible: ${API_URL}. Check if it's deployed.`)
    }
  }

  if (!user) {
    return (
      <>
        <Head>
          <title>Golf Shot Transcription - Analyze Your Shots</title>
          <meta name="description" content="Upload golf simulator screenshots and get detailed shot analysis using AI" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-golf-green to-golf-lightgreen">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-white mb-12">
              <h1 className="text-5xl font-bold mb-4">🏌️ Golf Shot Transcription</h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Upload your golf simulator screenshots and get instant AI-powered analysis of speed, distance, spin, and launch angle
              </p>
            </div>

            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-golf-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <CameraIcon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Get Started</h2>
                <p className="text-gray-600">Sign in with Google to start analyzing your golf shots</p>
              </div>

              {/* Debug Info */}
              <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
                <strong>Debug:</strong> API URL = {API_URL}
                <button 
                  onClick={testBackend}
                  className="ml-2 px-2 py-1 bg-blue-500 text-white rounded text-xs"
                >
                  Test Backend
                </button>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="w-full bg-white border-2 border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="p-3">
                  <CameraIcon className="w-8 h-8 text-golf-green mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload Screenshots</p>
                </div>
                <div className="p-3">
                  <ChartBarIcon className="w-8 h-8 text-golf-green mx-auto mb-2" />
                  <p className="text-sm text-gray-600">AI Analysis</p>
                </div>
                <div className="p-3">
                  <TrophyIcon className="w-8 h-8 text-golf-green mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Track Progress</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-golf-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏌️</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Golf Shot Transcription</h1>
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