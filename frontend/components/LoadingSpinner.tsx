import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'green' | 'white' | 'gray'
  text?: string
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'green', 
  text, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const colorClasses = {
    green: 'border-golf-green border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-300 border-t-transparent'
  }

  const containerSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }

  if (text) {
    return (
      <div className={`flex flex-col items-center space-y-3 ${className}`}>
        <div className={`${containerSizeClasses[size]} bg-golf-green rounded-full flex items-center justify-center`}>
          <div className={`${sizeClasses[size]} border-4 ${colorClasses.white} rounded-full animate-spin`}></div>
        </div>
        <div className="text-center">
          <p className="text-gray-700 font-medium">{text}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} border-4 ${colorClasses[color]} rounded-full animate-spin ${className}`}></div>
  )
}

export default LoadingSpinner 