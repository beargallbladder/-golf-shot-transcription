import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { TrashIcon, ShareIcon, EyeIcon } from '@heroicons/react/24/outline'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Shot {
  id: number
  speed: number
  distance: number
  spin: number
  launchAngle: number
  createdAt: string
  isPublic: boolean
}

const Dashboard: React.FC = () => {
  const [shots, setShots] = useState<Shot[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalShots: 0,
    avgDistance: 0,
    maxDistance: 0,
    avgSpeed: 0
  })

  useEffect(() => {
    fetchShots()
  }, [])

  const fetchShots = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/shots/me`)
      const shotsData = response.data.shots
      setShots(shotsData)
      
      // Calculate stats
      if (shotsData.length > 0) {
        const validDistances = shotsData.filter((s: Shot) => s.distance).map((s: Shot) => s.distance)
        const validSpeeds = shotsData.filter((s: Shot) => s.speed).map((s: Shot) => s.speed)
        
        setStats({
          totalShots: shotsData.length,
          avgDistance: validDistances.length > 0 ? Math.round(validDistances.reduce((a: number, b: number) => a + b, 0) / validDistances.length) : 0,
          maxDistance: validDistances.length > 0 ? Math.max(...validDistances) : 0,
          avgSpeed: validSpeeds.length > 0 ? Math.round(validSpeeds.reduce((a: number, b: number) => a + b, 0) / validSpeeds.length * 10) / 10 : 0
        })
      }
    } catch (error) {
      console.error('Fetch shots error:', error)
      toast.error('Failed to load your shots')
    } finally {
      setLoading(false)
    }
  }

  const deleteShot = async (shotId: number) => {
    if (!confirm('Are you sure you want to delete this shot?')) return

    try {
      await axios.delete(`${API_URL}/api/shots/${shotId}`)
      setShots(shots.filter(shot => shot.id !== shotId))
      toast.success('Shot deleted successfully')
    } catch (error) {
      console.error('Delete shot error:', error)
      toast.error('Failed to delete shot')
    }
  }

  const shareShot = (shotId: number) => {
    const shareUrl = `${window.location.origin}/share/shot/${shotId}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('Share link copied to clipboard!')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-golf-green">{stats.totalShots}</div>
          <div className="text-gray-600">Total Shots</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-golf-green">{stats.avgDistance}</div>
          <div className="text-gray-600">Avg Distance (yards)</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-golf-green">{stats.maxDistance}</div>
          <div className="text-gray-600">Max Distance (yards)</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-2xl font-bold text-golf-green">{stats.avgSpeed}</div>
          <div className="text-gray-600">Avg Speed (mph)</div>
        </div>
      </div>

      {/* Shots Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Your Shots</h2>
        </div>

        {shots.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <EyeIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No shots yet</h3>
            <p className="text-gray-600">Upload your first golf shot to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Speed (mph)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance (yards)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spin (rpm)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Launch Angle (°)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shots.map((shot) => (
                  <tr key={shot.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(shot.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shot.speed ? shot.speed.toFixed(1) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shot.distance || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shot.spin || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {shot.launchAngle ? shot.launchAngle.toFixed(1) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => shareShot(shot.id)}
                          className="text-golf-green hover:text-golf-lightgreen p-1 rounded"
                          title="Share shot"
                        >
                          <ShareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteShot(shot.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title="Delete shot"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard 