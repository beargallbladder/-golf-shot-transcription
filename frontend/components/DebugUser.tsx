import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const DebugUser: React.FC = () => {
  const { user, token } = useAuth()

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">🔍 Debug: User State</h3>
      <div className="text-sm text-yellow-700 space-y-1">
        <div><strong>User ID:</strong> {user?.id || 'null'}</div>
        <div><strong>Email:</strong> {user?.email || 'null'}</div>
        <div><strong>Name:</strong> {user?.name || 'null'}</div>
        <div><strong>Account Type:</strong> {user?.accountType || 'null'}</div>
        <div><strong>Is Admin:</strong> {user?.isAdmin ? 'true' : 'false'}</div>
        <div><strong>Retailer Info:</strong> {user?.retailerInfo ? 'Present' : 'null'}</div>
        <div><strong>Token:</strong> {token ? 'Present' : 'null'}</div>
        <div><strong>Is Retailer:</strong> {user?.accountType === 'retailer' ? 'YES' : 'NO'}</div>
      </div>
      <div className="mt-3 text-xs text-yellow-600">
        This debug panel will be removed in production
      </div>
    </div>
  )
}

export default DebugUser 