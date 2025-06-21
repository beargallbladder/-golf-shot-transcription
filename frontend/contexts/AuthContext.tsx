import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

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

  // Configure axios defaults
  useEffect(() => {
    const storedToken = Cookies.get('auth_token')
    if (storedToken) {
      setToken(storedToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }
    setLoading(false)
  }, [])

  const login = async (newToken: string) => {
    try {
      setToken(newToken)
      Cookies.set('auth_token', newToken, { expires: 7 }) // 7 days
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      // Fetch user info
      const response = await axios.get(`${API_URL}/auth/me`)
      setUser(response.data.user)
      
      toast.success('Successfully logged in!')
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Failed to fetch user information')
      logout()
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    Cookies.remove('auth_token')
    delete axios.defaults.headers.common['Authorization']
    toast.success('Logged out successfully')
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