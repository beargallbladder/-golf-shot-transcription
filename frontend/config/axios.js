import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://golf-shot-transcription.onrender.com'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to automatically add auth headers
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log API calls in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    }
    return response
  },
  (error) => {
    const { response, config } = error
    
    // Log errors
    console.error('❌ API Error:', {
      url: config?.url,
      method: config?.method,
      status: response?.status,
      message: response?.data?.message || response?.data?.error || error.message
    })
    
    // Handle specific error cases
    if (response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('auth_token')
      delete axios.defaults.headers.common['Authorization']
      
      // Redirect to login if not already on auth page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
        window.location.href = '/'
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
export { API_URL } 