import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { TrophyIcon, FireIcon, BoltIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://golf-shot-transcription.onrender.com'

interface ClubBest {
  club: string
  hasBest: boolean
  distance: number | null
  speed: number | null
  spin: number | null
  launch_angle: number | null
  shot_date: string | null
  shot_id: number | null
}

interface BagStats {
  totalClubs: number
  clubsWithData: number
  clubsRemaining: number
  avgDistance: number
  maxDistance: number
  minDistance: number
  clubs200Plus: number
  completionPercentage: number
}

const MyBag: React.FC = () => {
  const [bag, setBag] = useState<ClubBest[]>([])
  const [stats, setStats] = useState<BagStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyBag()
  }, [])

  const fetchMyBag = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/shots/my-bag`)
      setBag(response.data.bag)
      setStats(response.data.stats)
    } catch (error) {
      console.error('Fetch my bag error:', error)
      toast.error('Failed to load your bag')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getClubIcon = (club: string) => {
    if (club.includes('Driver')) return '🏌️'
    if (club.includes('Wood')) return '🌳'
    if (club.includes('Iron')) return '⚡'
    if (club.includes('Wedge')) return '🎯'
    return '⛳'
  }

  const getPerformanceColor = (distance: number | null) => {
    if (!distance) return 'text-gray-400'
    if (distance >= 250) return 'text-green-600'
    if (distance >= 200) return 'text-blue-600'
    if (distance >= 150) return 'text-yellow-600'
    return 'text-orange-600'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-golf-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header and Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">🎒 My Bag</h2>
            <p className="text-gray-600">Your personal best shots with each club</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-golf-green">{stats?.completionPercentage || 0}%</div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{stats?.clubsWithData || 0} clubs with data</span>
            <span>{stats?.clubsRemaining || 0} remaining</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-golf-green h-3 rounded-full transition-all duration-500"
              style={{ width: `${stats?.completionPercentage || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && stats.clubsWithData > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-golf-green">{stats.maxDistance}</div>
              <div className="text-xs text-gray-600">Longest Shot</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-golf-green">{stats.avgDistance}</div>
              <div className="text-xs text-gray-600">Average Distance</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-golf-green">{stats.clubs200Plus}</div>
              <div className="text-xs text-gray-600">200+ Yard Clubs</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl font-bold text-golf-green">{stats.clubsWithData}</div>
              <div className="text-xs text-gray-600">Total Clubs</div>
            </div>
          </div>
        )}
      </div>

      {/* Bag Grid */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Club Performance</h3>
        </div>

        {bag.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <TrophyIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Build Your Bag</h3>
            <p className="text-gray-600">Upload shots with different clubs to start tracking your personal bests!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {bag.map((clubData) => (
              <div
                key={clubData.club}
                className={`p-6 flex items-center space-x-4 transition-colors ${
                  clubData.hasBest ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-60'
                }`}
              >
                {/* Club Icon and Name */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
                    clubData.hasBest ? 'bg-golf-green text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {clubData.hasBest ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      <XCircleIcon className="w-6 h-6" />
                    )}
                  </div>
                </div>

                {/* Club Name */}
                <div className="flex-shrink-0 w-32">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getClubIcon(clubData.club)}</span>
                    <div>
                      <div className="font-medium text-gray-900">{clubData.club}</div>
                      {clubData.shot_date && (
                        <div className="text-xs text-gray-500">{formatDate(clubData.shot_date)}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Performance Data */}
                <div className="flex-grow">
                  {clubData.hasBest ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getPerformanceColor(clubData.distance)}`}>
                          {clubData.distance || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Distance (yds)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-700">
                          {clubData.speed ? clubData.speed.toFixed(1) : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Speed (mph)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-700">
                          {clubData.spin || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Spin (rpm)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-700">
                          {clubData.launch_angle ? `${clubData.launch_angle.toFixed(1)}°` : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">Launch Angle</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-gray-400 font-medium">No data yet</div>
                      <div className="text-xs text-gray-500">Upload a shot with this club to set your personal best</div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                  {clubData.hasBest && clubData.shot_id ? (
                    <a
                      href={`/share/shot/${clubData.shot_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 text-sm bg-golf-green text-white rounded-lg hover:bg-golf-lightgreen transition-colors"
                    >
                      View Shot
                    </a>
                  ) : (
                    <div className="px-3 py-1 text-sm bg-gray-200 text-gray-400 rounded-lg">
                      Upload Shot
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      {stats && stats.clubsWithData < stats.totalClubs && (
        <div className="bg-gradient-to-r from-golf-green to-golf-lightgreen rounded-xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Keep Building Your Bag! 🚀</h3>
          <p className="mb-4">
            You have {stats.clubsRemaining} more clubs to track. Upload shots to beat your bag!
          </p>
          <p className="text-sm opacity-90">
            💡 Pro tip: Try different clubs at the driving range to complete your bag faster
          </p>
        </div>
      )}
    </div>
  )
}

export default MyBag 