import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrophyIcon, 
  FireIcon, 
  StarIcon, 
  BoltIcon,
  CheckBadgeIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { 
  TrophyIcon as TrophyIconSolid,
  FireIcon as FireIconSolid,
  StarIcon as StarIconSolid
} from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: Date;
  category: 'distance' | 'accuracy' | 'consistency' | 'social' | 'milestone';
  shareText?: string;
  reward?: {
    type: 'badge' | 'title' | 'theme';
    value: string;
  };
}

interface AchievementSystemProps {
  onShare?: (achievement: Achievement) => void;
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({ onShare }) => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showingUnlock, setShowingUnlock] = useState<Achievement | null>(null);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Sample achievements data
  const sampleAchievements: Achievement[] = [
    {
      id: 'first-shot',
      title: '🏌️ First Shot',
      description: 'Upload your first golf shot',
      icon: '🏌️',
      rarity: 'common',
      progress: 1,
      target: 1,
      unlocked: true,
      category: 'milestone',
      shareText: 'Just got my first shot on GolfSimple! 🏌️'
    },
    {
      id: 'distance-king',
      title: '👑 Distance King',
      description: 'Hit a drive over 300 yards',
      icon: '👑',
      rarity: 'epic',
      progress: 285,
      target: 300,
      unlocked: false,
      category: 'distance',
      shareText: 'Crushing drives over 300 yards! 💪'
    },
    {
      id: 'fire-streak',
      title: '🔥 On Fire',
      description: 'Upload shots 5 days in a row',
      icon: '🔥',
      rarity: 'rare',
      progress: 3,
      target: 5,
      unlocked: false,
      category: 'consistency',
      shareText: 'On a 5-day golf streak! 🔥'
    },
    {
      id: 'social-butterfly',
      title: '🦋 Social Butterfly',
      description: 'Share 10 shots on social media',
      icon: '🦋',
      rarity: 'rare',
      progress: 7,
      target: 10,
      unlocked: false,
      category: 'social',
      shareText: 'Sharing the golf love across social media! 🦋'
    },
    {
      id: 'perfectionist',
      title: '🎯 Perfectionist',
      description: 'Hit 10 shots within 5 yards of target',
      icon: '🎯',
      rarity: 'legendary',
      progress: 6,
      target: 10,
      unlocked: false,
      category: 'accuracy',
      shareText: 'Achieving legendary accuracy! 🎯'
    },
    {
      id: 'club-master',
      title: '⚡ Club Master',
      description: 'Use every club in your bag',
      icon: '⚡',
      rarity: 'epic',
      progress: 11,
      target: 14,
      unlocked: false,
      category: 'milestone',
      shareText: 'Mastering every club in my bag! ⚡'
    }
  ];

  useEffect(() => {
    setAchievements(sampleAchievements);
  }, []);

  // Trigger haptic feedback
  const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [50],
        heavy: [100, 50, 100]
      };
      navigator.vibrate(patterns[intensity]);
    }
  };

  // Unlock achievement animation
  const unlockAchievement = (achievement: Achievement) => {
    const updatedAchievement = {
      ...achievement,
      unlocked: true,
      unlockedAt: new Date()
    };
    
    setShowingUnlock(updatedAchievement);
    triggerHaptic('heavy');
    
    // Show celebration toast
    toast.success(`🎉 Achievement Unlocked: ${achievement.title}!`, {
      duration: 5000,
      icon: achievement.icon
    });
    
    // Auto-hide after animation
    setTimeout(() => {
      setShowingUnlock(null);
    }, 3000);
  };

  // Share achievement
  const shareAchievement = async (achievement: Achievement) => {
    triggerHaptic('medium');
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Achievement Unlocked: ${achievement.title}`,
          text: achievement.shareText || achievement.description,
          url: window.location.origin
        });
        toast.success('Shared successfully! 📤');
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      const shareText = `${achievement.shareText || achievement.description}\n\nJoin me on GolfSimple: ${window.location.origin}`;
      navigator.clipboard.writeText(shareText);
      toast.success('Copied to clipboard! 📋');
    }
    
    onShare?.(achievement);
  };

  // Get rarity color
  const getRarityColor = (rarity: Achievement['rarity']) => {
    const colors = {
      common: 'bg-gray-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-yellow-500'
    };
    return colors[rarity];
  };

  // Get rarity glow
  const getRarityGlow = (rarity: Achievement['rarity']) => {
    const glows = {
      common: 'shadow-gray-200',
      rare: 'shadow-blue-200',
      epic: 'shadow-purple-200',
      legendary: 'shadow-yellow-200'
    };
    return glows[rarity];
  };

  // Filter achievements
  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'unlocked' && !achievement.unlocked) return false;
    if (filter === 'locked' && achievement.unlocked) return false;
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">🏆 Achievements</h2>
        <p className="text-gray-600">Unlock badges and show off your golf skills!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-golf-green">
            {achievements.filter(a => a.unlocked).length}
          </div>
          <div className="text-sm text-gray-500">Unlocked</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-blue-500">
            {achievements.filter(a => !a.unlocked && a.progress > 0).length}
          </div>
          <div className="text-sm text-gray-500">In Progress</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-gray-400">
            {achievements.length}
          </div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {(['all', 'unlocked', 'locked'] as const).map(filterOption => (
          <motion.button
            key={filterOption}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              filter === filterOption
                ? 'bg-golf-green text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'distance', 'accuracy', 'consistency', 'social', 'milestone'] as const).map(category => (
          <motion.button
            key={category}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-golf-green text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredAchievements.map(achievement => (
            <motion.div
              key={achievement.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.02 }}
              className={`
                relative bg-white rounded-2xl p-6 shadow-lg transition-all
                ${achievement.unlocked ? 'border-2 border-golf-green' : 'border border-gray-200'}
                ${achievement.unlocked ? getRarityGlow(achievement.rarity) : ''}
              `}
            >
              {/* Rarity indicator */}
              <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getRarityColor(achievement.rarity)}`} />
              
              {/* Icon */}
              <div className="text-4xl mb-3">{achievement.icon}</div>
              
              {/* Title and description */}
              <h3 className={`font-bold text-lg mb-2 ${achievement.unlocked ? 'text-golf-green' : 'text-gray-700'}`}>
                {achievement.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {achievement.description}
              </p>
              
              {/* Progress */}
              {!achievement.unlocked && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">
                      {achievement.progress} / {achievement.target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="bg-golf-green h-2 rounded-full"
                    />
                  </div>
                </div>
              )}
              
              {/* Unlocked badge */}
              {achievement.unlocked && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-golf-green">
                    <CheckBadgeIcon className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Unlocked!</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => shareAchievement(achievement)}
                    className="p-2 bg-golf-green/10 text-golf-green rounded-lg hover:bg-golf-green/20 transition-colors"
                  >
                    <ShareIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
              
              {/* Rarity badge */}
              <div className={`absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-medium text-white ${getRarityColor(achievement.rarity)}`}>
                {achievement.rarity}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Achievement Unlock Modal */}
      <AnimatePresence>
        {showingUnlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white rounded-3xl p-8 text-center max-w-sm w-full"
            >
              {/* Celebration animation */}
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-6xl mb-4"
              >
                {showingUnlock.icon}
              </motion.div>
              
              <h2 className="text-2xl font-bold text-golf-green mb-2">
                Achievement Unlocked!
              </h2>
              
              <h3 className="text-xl font-semibold mb-2">
                {showingUnlock.title}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {showingUnlock.description}
              </p>
              
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowingUnlock(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
                >
                  Close
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    shareAchievement(showingUnlock);
                    setShowingUnlock(null);
                  }}
                  className="flex-1 py-3 bg-golf-green text-white rounded-xl font-medium"
                >
                  Share
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo unlock button (remove in production) */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          const lockedAchievement = achievements.find(a => !a.unlocked);
          if (lockedAchievement) {
            unlockAchievement(lockedAchievement);
          }
        }}
        className="fixed bottom-24 right-4 bg-golf-green text-white p-3 rounded-full shadow-lg"
      >
        <TrophyIcon className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default AchievementSystem;