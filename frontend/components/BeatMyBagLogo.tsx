import React from 'react'

interface BeatMyBagLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const BeatMyBagLogo: React.FC<BeatMyBagLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Golf Bag Icon */}
      <div className={`${sizeClasses[size]} bg-[#2C5F41] rounded-lg flex items-center justify-center`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-2/3 h-2/3 text-white"
        >
          <path
            d="M8 2L6 4V20C6 21.1 6.9 22 8 22H16C17.1 22 18 21.1 18 20V4L16 2H8Z"
            fill="currentColor"
          />
          <path
            d="M10 1V3H14V1H10Z"
            fill="currentColor"
          />
          <path
            d="M12 6L14 8L16 6L18 8L16 10L14 8L12 10L10 8L12 6Z"
            fill="currentColor"
            opacity="0.7"
          />
        </svg>
      </div>
      
      {/* Text */}
      <div className="flex flex-col">
        <div className={`font-bold text-gray-800 ${textSizes[size]} leading-tight`}>
          BEATMY BAG
        </div>
        {size === 'lg' && (
          <div className="text-xs text-gray-500 font-medium tracking-wide">
            CA IN 2025
          </div>
        )}
      </div>
    </div>
  )
}

export default BeatMyBagLogo 