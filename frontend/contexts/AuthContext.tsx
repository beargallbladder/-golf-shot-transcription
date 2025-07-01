import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://golf-shot-transcription.onrender.com'

interface User {
  id: number
  name: string
  email: string
  profilePicture: string
  accountType?: string
  isAdmin?: boolean
  retailerInfo?: {
    businessName: string
    location: string
    subscriptionStatus: string
    subscriptionPlan: string
    dailyLimit: number
  } | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, showWelcome?: boolean) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Configure axios defaults and check for existing session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = Cookies.get('auth_token')
        if (storedToken) {
          setToken(storedToken)
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
          
          try {
            // Validate token and get user info with timeout
            const response = await Promise.race([
              axios.get(`${API_URL}/auth/me`),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Auth timeout')), 10000)
              )
            ]) as any
            setUser(response.data.user)
          } catch (error) {
            // Token is invalid, clear it
            console.log('Token validation failed, clearing auth state:', error)
            Cookies.remove('auth_token')
            setToken(null)
            delete axios.defaults.headers.common['Authorization']
          }
        } else {
          // No token found, user is not logged in
          console.log('No auth token found, user not logged in')
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (newToken: string, showWelcome: boolean = true) => {
    try {
      console.log('🔐 Login called with token:', newToken ? 'Present' : 'Missing')
      console.log('📋 Show welcome:', showWelcome)
      
      setToken(newToken)
      Cookies.set('auth_token', newToken, { expires: 7 }) // 7 days
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      // Fetch user info
      console.log('📡 Fetching user info from:', `${API_URL}/auth/me`)
      const response = await axios.get(`${API_URL}/auth/me`)
      console.log('✅ User info received:', response.data.user)
      
      setUser(response.data.user)
      
      // Only show welcome message for new logins, not session restoration
      if (showWelcome) {
        toast.success(`Welcome back, ${response.data.user.name}! 🏌️‍♂️`, {
          duration: 3000,
          icon: '👋',
        })
      }
    } catch (error: any) {
      console.error('❌ Login error:', error)
      toast.error('Failed to sign in. Please try again.')
      logout()
    }
  }

  const logout = () => {
    const userName = user?.name || 'golfer'
    setUser(null)
    setToken(null)
    Cookies.remove('auth_token')
    delete axios.defaults.headers.common['Authorization']
    toast.success(`See you on the course, ${userName}! 👋`, {
      duration: 2000,
      icon: '🏌️‍♂️',
    })
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 