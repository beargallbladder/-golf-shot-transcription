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
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string) => void
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
      const storedToken = Cookies.get('auth_token')
      if (storedToken) {
        setToken(storedToken)
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
        
        try {
          // Validate token and get user info
          console.log('🔄 Validating existing session...')
          const response = await axios.get(`${API_URL}/auth/me`)
          console.log('✅ Session valid, user:', response.data.user.name)
          setUser(response.data.user)
          // Don't show success toast for existing sessions
        } catch (error) {
          console.log('❌ Token invalid, clearing session')
          // Token is invalid, clear it
          Cookies.remove('auth_token')
          setToken(null)
          delete axios.defaults.headers.common['Authorization']
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (newToken: string, showWelcome: boolean = true) => {
    try {
      console.log('🔄 Logging in with token...')
      setToken(newToken)
      Cookies.set('auth_token', newToken, { expires: 7 }) // 7 days
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      // Fetch user info
      console.log('🔄 Fetching user info from:', `${API_URL}/auth/me`)
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
      console.error('Error response:', error.response?.data)
      toast.error(`Failed to fetch user information: ${error.response?.data?.error || error.message}`)
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