import '../styles/globals.css'
import React from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../contexts/AuthContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* Plausible Analytics */}
        <script 
          defer 
          data-domain="beatmybag.com" 
          src="https://plausible.io/js/script.js"
        ></script>
      </Head>
      <AuthProvider>
        <Component {...pageProps} />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </AuthProvider>
    </>
  )
} 