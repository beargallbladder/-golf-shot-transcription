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
    window.location.href = `${API_URL}/auth/google`
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
            <div className="text-center text-white mb-16">
              <div className="mb-6">
                <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                  <span className="text-4xl">🏌️</span>
                </div>
              </div>
              <h1 className="text-6xl font-bold mb-6 tracking-tight">
                Golf Shot<br />
                <span className="text-golf-sand">Analytics</span>
              </h1>
              <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
                Transform your golf simulator screenshots into detailed performance insights with AI-powered analysis
              </p>
              <div className="mt-8 flex items-center justify-center space-x-8 text-sm opacity-80">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Instant Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Track Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Share Results</span>
                </div>
              </div>
            </div>

                        <div className="max-w-lg mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl p-10 backdrop-blur-sm border border-white border-opacity-20">
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-golf-green to-golf-lightgreen rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <CameraIcon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-3">Welcome to Golf Analytics</h2>
                  <p className="text-gray-600 text-lg">Sign in to start tracking your performance</p>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl px-8 py-4 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center space-x-4 shadow-md hover:shadow-lg"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-lg">Continue with Google</span>
                </button>

                <div className="mt-10 grid grid-cols-3 gap-6 text-center">
                  <div className="p-4">
                    <div className="w-12 h-12 bg-golf-green bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <CameraIcon className="w-6 h-6 text-golf-green" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Upload</p>
                  </div>
                  <div className="p-4">
                    <div className="w-12 h-12 bg-golf-green bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <ChartBarIcon className="w-6 h-6 text-golf-green" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Analyze</p>
                  </div>
                  <div className="p-4">
                    <div className="w-12 h-12 bg-golf-green bg-opacity-10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <TrophyIcon className="w-6 h-6 text-golf-green" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Improve</p>
                  </div>
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