import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { TrophyIcon, FireIcon, BoltIcon, ShareIcon } from '@heroicons/react/24/outline'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://golf-shot-transcription.onrender.com'

interface LeaderboardEntry {
  id: number
  value: number
  speed: number
  distance: number
  spin: number
  launchAngle: number
  createdAt: string
  user: {
    name: string
    avatar: string
  }
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [metric, setMetric] = useState('distance')
  const [period, setPeriod] = useState('all')

  useEffect(() => {
    fetchLeaderboard()
  }, [metric, period])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/shots/leaderboard`, {
        params: { metric, period, limit: 10 }
      })
      setLeaderboard(response.data.leaderboard)
    } catch (error) {
      console.error('Fetch leaderboard error:', error)
      toast.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const getMetricIcon = (metricType: string) => {
    switch (metricType) {
      case 'distance':
        return <TrophyIcon className="w-5 h-5" />
      case 'speed':
        return <BoltIcon className="w-5 h-5" />
      case 'spin':
        return <FireIcon className="w-5 h-5" />
      default:
        return <TrophyIcon className="w-5 h-5" />
    }
  }

  const getMetricUnit = (metricType: string) => {
    switch (metricType) {
      case 'distance':
        return 'yards'
      case 'speed':
        return 'mph'
      case 'spin':
        return 'rpm'
      default:
        return ''
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const shareShot = async (entry: LeaderboardEntry) => {
    try {
      // Get enhanced sharing data from backend
      const response = await axios.get(`${API_URL}/share/shot/${entry.id}`)
      const { sharing } = response.data
      
      // Create share options
      const shareUrl = `${window.location.origin}/share/shot/${entry.id}`
      const shareText = sharing.content.shareText || `🏌️‍♂️ ${entry.distance} yards! Check this out!`
      
      // Try native sharing first (mobile)
      if (navigator.share) {
        await navigator.share({
          title: sharing.content.title,
          text: shareText,
          url: shareUrl,
        })
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
        toast.success('Share link copied to clipboard!')
      }
    } catch (error) {
      console.error('Share error:', error)
      // Fallback: basic share
      const shareUrl = `${window.location.origin}/share/shot/${entry.id}`
      const shareText = `🏌️‍♂️ ${entry.distance} yards! Check this out!`
      
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
        toast.success('Share link copied to clipboard!')
      } catch (clipboardError) {
        toast.error('Unable to share')
      }
    }
  }

  const shareToTwitter = (entry: LeaderboardEntry) => {
    const shareUrl = `${window.location.origin}/share/shot/${entry.id}`
    const shareText = `🔥 ${entry.distance} yards! Still pounding it! 💪 #golf #beatmybag`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, '_blank')
  }

  const shareToFacebook = (entry: LeaderboardEntry) => {
    const shareUrl = `${window.location.origin}/share/shot/${entry.id}`
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(facebookUrl, '_blank')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 relative overflow-hidden">
        {/* Golf Course Background */}
        <div 
          className="absolute inset-0 opacity-5 -z-10"
          style={{
            backgroundImage: 'url(/images/golf/B27AFE22-7DB3-4355-9938-75DBDDC2129A_1_105_c.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">🏆 Leaderboard</h2>
            <p className="text-gray-600">Top performers across all metrics</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Metric Filter */}
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-green focus:border-transparent"
            >
              <option value="distance">Distance</option>
              <option value="speed">Speed</option>
              <option value="spin">Spin</option>
            </select>
            
            {/* Period Filter */}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golf-green focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="day">Today</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-golf-green border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <TrophyIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No data yet</h3>
            <p className="text-gray-600">Be the first to upload a shot and claim the top spot!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`p-6 flex items-center space-x-4 ${
                  index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'hover:bg-gray-50'
                }`}
              >
                {/* Rank */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-50 text-gray-600'
                  }`}>
                    {getRankIcon(index + 1)}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-shrink-0">
                  <img
                    src={entry.user.avatar}
                    alt={entry.user.name}
                    className="w-10 h-10 rounded-full"
                  />
                </div>

                {/* User Name and Date */}
                <div className="flex-grow min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {entry.user.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(entry.createdAt)}
                  </div>
                </div>

                {/* Metric Value */}
                <div className="flex-shrink-0 text-right">
                  <div className="flex items-center space-x-2">
                    <div className="text-golf-green">
                      {getMetricIcon(metric)}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">
                        {metric === 'speed' ? entry.value.toFixed(1) : Math.round(entry.value)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getMetricUnit(metric)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Stats */}
                <div className="hidden md:block flex-shrink-0 text-right">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Speed: {entry.speed ? entry.speed.toFixed(1) : 'N/A'} mph</div>
                    <div>Distance: {entry.distance || 'N/A'} yards</div>
                    <div>Spin: {entry.spin || 'N/A'} rpm</div>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="flex-shrink-0">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => shareToTwitter(entry)}
                      className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Share on Twitter"
                    >
                      🐦
                    </button>
                    <button
                      onClick={() => shareToFacebook(entry)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Share on Facebook"
                    >
                      📘
                    </button>
                    <button
                      onClick={() => shareShot(entry)}
                      className="p-2 text-gray-400 hover:text-golf-green hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy link"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">How Rankings Work</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <TrophyIcon className="w-5 h-5 text-golf-green" />
            <span><strong>Distance:</strong> Longest shots in yards</span>
          </div>
          <div className="flex items-center space-x-2">
            <BoltIcon className="w-5 h-5 text-golf-green" />
            <span><strong>Speed:</strong> Fastest ball speed in mph</span>
          </div>
          <div className="flex items-center space-x-2">
            <FireIcon className="w-5 h-5 text-golf-green" />
            <span><strong>Spin:</strong> Highest spin rate in rpm</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard 