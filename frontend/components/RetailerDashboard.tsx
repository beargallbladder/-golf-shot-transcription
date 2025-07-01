import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { 
  UserGroupIcon, 
  ChartBarIcon, 
  CogIcon, 
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  ShareIcon
} from '@heroicons/react/24/outline'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://golf-shot-transcription.onrender.com'

interface RetailerStats {
  totalShots: number
  fittingShots: number
  shotsThisMonth: number
  totalCustomers: number
  newCustomers: number
  totalSessions: number
  activeSessions: number
}

interface FittingSession {
  id: number
  customerName: string
  customerEmail: string
  status: string
  createdAt: string
  shotCount: number
}

const RetailerDashboard: React.FC = () => {
  const [stats, setStats] = useState<RetailerStats | null>(null)
  const [sessions, setSessions] = useState<FittingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchRetailerData()
  }, [])

  const fetchRetailerData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/auth/retailer/dashboard`)
      setStats(response.data.stats)
      setSessions(response.data.sessions || [])
    } catch (error: any) {
      console.error('Fetch retailer data error:', error)
      if (error.response?.status === 403) {
        toast.error('Retailer access required. Please upgrade your account.')
      } else {
        toast.error('Failed to load retailer dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-golf-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <CogIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">Retailer Access Required</h3>
        <p className="text-gray-600">Please upgrade to a retailer account to access these features.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-golf-green to-golf-lightgreen rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🏪 Retailer Dashboard</h1>
            <p className="text-lg opacity-90">Manage your golf fitting business</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <div className="text-sm opacity-90">Total Customers</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-golf-green">{stats.totalShots}</div>
              <div className="text-gray-600">Total Shots</div>
            </div>
            <div className="w-12 h-12 bg-golf-green/10 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-golf-green" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {stats.fittingShots} fitting shots
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-golf-green">{stats.shotsThisMonth}</div>
              <div className="text-gray-600">This Month</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-golf-green">{stats.newCustomers}</div>
              <div className="text-gray-600">New Customers</div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Last 30 days
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-golf-green">{stats.activeSessions}</div>
              <div className="text-gray-600">Active Sessions</div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-golf-green text-golf-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sessions'
                  ? 'border-golf-green text-golf-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Fitting Sessions
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'customers'
                  ? 'border-golf-green text-golf-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Customers
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-golf-green text-golf-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800">Business Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Recent Activity</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Shots this week</span>
                      <span className="font-medium">{Math.floor(stats.shotsThisMonth * 0.25)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">New customers</span>
                      <span className="font-medium">{stats.newCustomers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active fittings</span>
                      <span className="font-medium">{stats.activeSessions}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Quick Actions</h4>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center px-4 py-2 bg-golf-green text-white rounded-lg hover:bg-golf-lightgreen transition-colors">
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Start New Fitting
                    </button>
                    <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                      <EyeIcon className="w-4 h-4 mr-2" />
                      View Reports
                    </button>
                    <button className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                      <ShareIcon className="w-4 h-4 mr-2" />
                      Share Results
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Fitting Sessions</h3>
                <button className="px-4 py-2 bg-golf-green text-white rounded-lg hover:bg-golf-lightgreen transition-colors">
                  <PlusIcon className="w-4 h-4 mr-2 inline" />
                  New Session
                </button>
              </div>

              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No fitting sessions yet</h3>
                  <p className="text-gray-600">Start your first fitting session to begin tracking customer data.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shots</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sessions.map((session) => (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{session.customerName}</div>
                              <div className="text-sm text-gray-500">{session.customerEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              session.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {session.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(session.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {session.shotCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-golf-green hover:text-golf-lightgreen mr-3">
                              View
                            </button>
                            <button className="text-gray-600 hover:text-gray-800">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800">Customer Management</h3>
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <UserGroupIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Customer features coming soon</h3>
                <p className="text-gray-600">Advanced customer management and lead tracking will be available in the next update.</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800">Retailer Settings</h3>
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <CogIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Settings panel coming soon</h3>
                <p className="text-gray-600">Business settings, branding options, and integration preferences will be available here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RetailerDashboard 