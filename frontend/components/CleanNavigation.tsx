import React from 'react'
import { 
  CameraIcon, 
  ChartBarIcon, 
  TrophyIcon, 
  ShoppingBagIcon,
  BuildingStorefrontIcon 
} from '@heroicons/react/24/outline'

interface CleanNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  user: any
}

const CleanNavigation: React.FC<CleanNavigationProps> = ({ activeTab, onTabChange, user }) => {
  const isRetailer = user?.accountType === 'retailer'
  
  const tabs = [
    { id: 'upload', label: 'Upload', icon: CameraIcon },
    { id: 'dashboard', label: 'My Shots', icon: ChartBarIcon },
    { id: 'mybag', label: 'My Bag', icon: ShoppingBagIcon },
    { id: 'leaderboard', label: 'Leaderboard', icon: TrophyIcon },
    { 
      id: 'retailer', 
      label: isRetailer ? 'Dashboard' : 'Retailer', 
      icon: BuildingStorefrontIcon 
    }
  ]
  
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col items-center py-4 px-3 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-golf-green border-b-2 border-golf-green'
                      : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default CleanNavigation 