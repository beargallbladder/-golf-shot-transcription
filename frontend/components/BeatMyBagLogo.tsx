import React from 'react'
import Image from 'next/image'

interface BeatMyBagLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const BeatMyBagLogo: React.FC<BeatMyBagLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12', 
    lg: 'h-16'
  }

  return (
    <div className={`${className}`}>
      <Image
        src="/images/golf/logo.png"
        alt="Beat My Bag"
        width={200}
        height={60}
        className={`${sizeClasses[size]} w-auto object-contain`}
        priority
      />
    </div>
  )
}

export default BeatMyBagLogo 