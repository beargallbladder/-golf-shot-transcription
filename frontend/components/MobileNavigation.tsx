import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon, 
  TrophyIcon, 
  CameraIcon, 
  ShoppingBagIcon, 
  UserIcon,
  PlusIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  TrophyIcon as TrophyIconSolid,
  CameraIcon as CameraIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  UserIcon as UserIconSolid
} from '@heroicons/react/24/solid';

interface NavigationProps {
  className?: string;
}

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<any>;
  iconSolid: React.ComponentType<any>;
  badge?: number;
  pulse?: boolean;
  prominent?: boolean;
}

const MobileNavigation: React.FC<NavigationProps> = ({ className = '' }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('feed');
  const [newShots, setNewShots] = useState(3);
  const [activeChallenges, setActiveChallenges] = useState(true);
  const [showCaptureOptions, setShowCaptureOptions] = useState(false);

  // Navigation items configuration
  const navItems: NavItem[] = [
    {
      id: 'feed',
      label: 'Feed',
      path: '/',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      badge: newShots
    },
    {
      id: 'compete',
      label: 'Compete',
      path: '/leaderboard',
      icon: TrophyIcon,
      iconSolid: TrophyIconSolid,
      pulse: activeChallenges
    },
    {
      id: 'capture',
      label: 'Capture',
      path: '/capture',
      icon: CameraIcon,
      iconSolid: CameraIconSolid,
      prominent: true
    },
    {
      id: 'bag',
      label: 'My Bag',
      path: '/my-bag',
      icon: ShoppingBagIcon,
      iconSolid: ShoppingBagIconSolid
    },
    {
      id: 'profile',
      label: 'Profile',
      path: '/profile',
      icon: UserIcon,
      iconSolid: UserIconSolid
    }
  ];

  // Update active tab based on current route
  useEffect(() => {
    const path = router.pathname;
    const activeItem = navItems.find(item => 
      item.path === path || (path !== '/' && path.startsWith(item.path))
    );
    if (activeItem) {
      setActiveTab(activeItem.id);
    }
  }, [router.pathname]);

  // Haptic feedback helper
  const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [50],
        heavy: [100]
      };
      navigator.vibrate(patterns[intensity]);
    }
  };

  const handleNavigation = (item: NavItem) => {
    if (item.id === 'capture') {
      setShowCaptureOptions(!showCaptureOptions);
      triggerHaptic('medium');
      return;
    }

    setActiveTab(item.id);
    triggerHaptic('light');
    router.push(item.path);

    // Clear badges when visited
    if (item.id === 'feed' && newShots > 0) {
      setNewShots(0);
    }
  };

  const handleQuickCapture = (type: 'photo' | 'video' | 'voice') => {
    triggerHaptic('heavy');
    setShowCaptureOptions(false);
    
    switch (type) {
      case 'photo':
        router.push('/capture?mode=photo');
        break;
      case 'video':
        router.push('/capture?mode=video');
        break;
      case 'voice':
        router.push('/capture?mode=voice');
        break;
    }
  };

  const TabIcon = ({ item, isActive }: { item: NavItem; isActive: boolean }) => {
    const IconComponent = isActive ? item.iconSolid : item.icon;
    
    return (
      <div className="relative">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`
            relative p-2 rounded-xl transition-all duration-200
            ${isActive ? 'bg-golf-green/20' : 'hover:bg-gray-100'}
          `}
        >
          <IconComponent 
            className={`
              w-6 h-6 transition-colors duration-200
              ${isActive ? 'text-golf-green' : 'text-gray-500'}
            `} 
          />
          
          {/* Badge */}
          {item.badge && item.badge > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center"
            >
              {item.badge > 99 ? '99+' : item.badge}
            </motion.div>
          )}
          
          {/* Pulse indicator */}
          {item.pulse && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-400 rounded-full"
            />
          )}
        </motion.div>
      </div>
    );
  };

  const ProminentCaptureButton = ({ item, isActive }: { item: NavItem; isActive: boolean }) => {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <div className={`
          w-14 h-14 rounded-full flex items-center justify-center shadow-lg
          ${isActive || showCaptureOptions 
            ? 'bg-golf-green shadow-golf-green/30' 
            : 'bg-golf-green hover:bg-golf-lightgreen'
          }
          transition-all duration-200
        `}>
          <motion.div
            animate={{ rotate: showCaptureOptions ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {showCaptureOptions ? (
              <PlusIcon className="w-8 h-8 text-white" />
            ) : (
              <CameraIcon className="w-8 h-8 text-white" />
            )}
          </motion.div>
        </div>
        
        {/* Capture options menu */}
        <AnimatePresence>
          {showCaptureOptions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2"
            >
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <motion.button
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickCapture('photo')}
                  className="flex items-center px-4 py-3 text-left w-full hover:bg-gray-50 transition-colors"
                >
                  <CameraIcon className="w-5 h-5 text-golf-green mr-3" />
                  <span className="text-sm font-medium">Photo Shot</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickCapture('video')}
                  className="flex items-center px-4 py-3 text-left w-full hover:bg-gray-50 transition-colors border-t border-gray-100"
                >
                  <div className="w-5 h-5 bg-golf-green rounded mr-3 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-sm"></div>
                  </div>
                  <span className="text-sm font-medium">Video Shot</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickCapture('voice')}
                  className="flex items-center px-4 py-3 text-left w-full hover:bg-gray-50 transition-colors border-t border-gray-100"
                >
                  <div className="w-5 h-5 bg-golf-green rounded-full mr-3 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium">Voice Note</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <>
      {/* Overlay for capture options */}
      <AnimatePresence>
        {showCaptureOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowCaptureOptions(false)}
          />
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className={`
          fixed bottom-0 left-0 right-0 z-50
          bg-white border-t border-gray-200
          safe-area-pb
          ${className}
        `}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`
                flex flex-col items-center justify-center p-2 min-w-[60px]
                ${item.prominent ? 'relative -top-4' : ''}
              `}
              whileTap={{ scale: 0.9 }}
            >
              {item.prominent ? (
                <ProminentCaptureButton item={item} isActive={activeTab === item.id} />
              ) : (
                <TabIcon item={item} isActive={activeTab === item.id} />
              )}
              
              {!item.prominent && (
                <motion.span
                  className={`
                    text-xs mt-1 transition-colors duration-200
                    ${activeTab === item.id ? 'text-golf-green font-medium' : 'text-gray-500'}
                  `}
                >
                  {item.label}
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>
        
        {/* Active tab indicator */}
        <motion.div
          className="absolute bottom-0 h-1 bg-golf-green rounded-t-full"
          initial={false}
          animate={{
            left: `${(navItems.findIndex(item => item.id === activeTab) / navItems.length) * 100}%`,
            width: `${100 / navItems.length}%`
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </motion.nav>

      {/* Safe area padding for older iOS devices */}
      <style jsx>{`
        .safe-area-pb {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  );
};

export default MobileNavigation;