import '../styles/globals.css'
import '../styles/mobile-first.css'
import React from 'react'
import type { AppProps } from 'next/app'
import Script from 'next/script'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../contexts/AuthContext'
import ErrorBoundary from '../components/ErrorBoundary'
import MobileNavigation from '../components/MobileNavigation'
import Head from 'next/head'

// 🚀 SWARM OPTIMIZED - Mobile-First Golf Experience
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <Head>
        {/* Mobile-first viewport with performance optimizations */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        
        {/* Performance preloads */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://plausible.io" />
        
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#52B788" />
        
        {/* iOS specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GolfSimple" />
        
        {/* Prevent zoom on input focus */}
        <meta name="format-detection" content="telephone=no" />
      </Head>

      {/* Plausible Analytics */}
      <Script
        defer
        data-domain="beatmybag.com"
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
      
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 safe-area-top">
          <main className="pb-20"> {/* Space for mobile navigation */}
            <Component {...pageProps} />
          </main>
          
          {/* Mobile-first navigation */}
          <MobileNavigation />
        </div>
        
        {/* Optimized toast notifications */}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000, // Reduced for mobile
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '15px',
              maxWidth: '90vw', // Mobile responsive
              padding: '12px 16px',
            },
            success: {
              style: {
                background: '#52B788', // Golf green
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#52B788',
              },
            },
            error: {
              style: {
                background: '#DC2626',
              },
            },
          }}
        />
      </AuthProvider>
    </ErrorBoundary>
  )
} 