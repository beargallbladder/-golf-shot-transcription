import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import apiClient from '../config/axios'
import toast from 'react-hot-toast'
import LoadingSpinner from './LoadingSpinner'

interface AnalyticsData {
  totalCustomers: number
  totalSessions: number
  totalShots: number
  averageSessionLength: number
  topClubsByVolume: Array<{
    club: string
    count: number
    averageDistance: number
  }>
  customerPerformanceTrends: Array<{
    date: string
    averageDistance: number
    sessionCount: number
  }>
  fittingSuccessRate: number
  revenueMetrics: {
    totalRevenue: number
    averageSessionValue: number
    monthlyGrowth: number
  }
}

const RetailerAnalytics: React.FC = () => {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') // days
  const [selectedMetric, setSelectedMetric] = useState('distance')

  useEffect(() => {
    if (user?.accountType === 'retailer') {
      fetchAnalytics()
    }
  }, [user, dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/api/retailer/analytics?days=${dateRange}`)
      setAnalytics(response.data)
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (user?.accountType !== 'retailer') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Analytics dashboard is only available for retailer accounts.</p>
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading analytics..." />
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Failed to load analytics data.</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-golf-green text-white rounded-lg hover:bg-golf-lightgreen"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">📊 Analytics Dashboard</h1>
        <div className="flex space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-green"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalCustomers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fitting Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalSessions}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Shots</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalShots}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.fittingSuccessRate}%</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clubs by Volume */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Clubs by Volume</h3>
          <div className="space-y-4">
            {analytics.topClubsByVolume.map((club, index) => (
              <div key={club.club} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-golf-green text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{club.club}</p>
                    <p className="text-sm text-gray-500">{club.count} shots</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{club.averageDistance} yds</p>
                  <p className="text-sm text-gray-500">avg distance</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Trends */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance Trends</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart visualization would go here</p>
            <p className="text-xs text-gray-400 ml-2">(Chart.js integration recommended)</p>
          </div>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Revenue Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">${analytics.revenueMetrics.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">${analytics.revenueMetrics.averageSessionValue}</p>
            <p className="text-sm text-gray-600">Avg Session Value</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">+{analytics.revenueMetrics.monthlyGrowth}%</p>
            <p className="text-sm text-gray-600">Monthly Growth</p>
          </div>
        </div>
      </div>

      {/* Customer Insights */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Customer Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Average Session Length</h4>
            <p className="text-2xl font-bold text-gray-900">{analytics.averageSessionLength} minutes</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Recommendations</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Focus on driver fittings - highest engagement</li>
              <li>• Offer iron set packages for better conversion</li>
              <li>• Schedule follow-up sessions for wedge fittings</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Export & Reports</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            📊 Export to Excel
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            📈 Generate Report
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            📧 Email Summary
          </button>
        </div>
      </div>
    </div>
  )
}

export default RetailerAnalytics 