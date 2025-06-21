import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'

const AuthCallback: React.FC = () => {
  const router = useRouter()
  const { login } = useAuth()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { token } = router.query

      if (token && typeof token === 'string') {
        try {
          await login(token)
          router.push('/')
        } catch (error) {
          console.error('Auth callback error:', error)
          router.push('/?error=auth_failed')
        }
      } else {
        router.push('/?error=no_token')
      }
    }

    if (router.isReady) {
      handleAuthCallback()
    }
  }, [router.isReady, router.query, login, router])

  return (
    <div className="min-h-screen bg-golf-gradient flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-golf-green rounded-full flex items-center justify-center mb-4">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Signing you in...</h2>
        <p className="text-gray-600">Please wait while we complete your authentication</p>
      </div>
    </div>
  )
}

export default AuthCallback 