import '../styles/globals.css'
import React from 'react'
import type { AppProps } from 'next/app'
import Script from 'next/script'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../contexts/AuthContext'
import ErrorBoundary from '../components/ErrorBoundary'

// Force deployment - retailer system v1.0
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      {/* Plausible Analytics */}
      <Script
        defer
        data-domain="beatmybag.com"
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
      <AuthProvider>
        <Component {...pageProps} />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              style: {
                background: '#059669',
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