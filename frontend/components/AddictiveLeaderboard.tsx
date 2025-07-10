import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Fire, TrendingUp, Users, Clock, ChevronDown } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useHaptic } from '../hooks/useHaptic';
import { formatDistanceToNow } from 'date-fns';

interface LeaderboardEntry {
  rank: number;
  previousRank?: number;
  userId: string;
  name: string;
  avatar?: string;
  value: number;
  improvement?: number;
  isCurrentUser?: boolean;
  streak?: number;
  badge?: string;
}

interface LeaderboardProps {
  onChallenge?: (userId: string) => void;
  onShare?: (entry: LeaderboardEntry) => void;
}

const AddictiveLeaderboard: React.FC<LeaderboardProps> = ({ onChallenge, onShare }) => {
  const [category, setCategory] = useState<'distance' | 'accuracy' | 'consistency' | 'improvement'>('distance');
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all-time'>('week');
  const [filter, setFilter] = useState<'global' | 'friends' | 'local' | 'club'>('global');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const { triggerHaptic } = useHaptic();
  const ws = useWebSocket('wss://api.golfsimple.com/leaderboard');

  // Real-time updates
  useEffect(() => {
    if (ws) {
      ws.on('rank-update', (data) => {
        setEntries(prev => updateRanks(prev, data));
        if (data.userId === currentUserId && data.rank < userRank!) {
          triggerHaptic('success');
          showCelebration();
        }
      });
    }
  }, [ws, userRank]);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?category=${category}&timeframe=${timeframe}&filter=${filter}`);
      const data = await response.json();
      setEntries(data.entries);
      setUserRank(data.userRank);
    } finally {
      setLoading(false);
    }
  }, [category, timeframe, filter]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const CategoryIcon = ({ type }: { type: string }) => {
    const icons = {
      distance: '🚀',
      accuracy: '🎯',
      consistency: '📊',
      improvement: '📈'
    };
    return <span className="text-2xl">{icons[type]}</span>;
  };

  const RankChange = ({ current, previous }: { current: number; previous?: number }) => {
    if (!previous || current === previous) return null;
    
    const improved = current < previous;
    const change = Math.abs(current - previous);
    
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`flex items-center text-xs ${improved ? 'text-green-500' : 'text-red-500'}`}
      >
        <TrendingUp className={`w-3 h-3 ${!improved && 'rotate-180'}`} />
        <span>{change}</span>
      </motion.div>
    );
  };

  const LeaderboardCard = ({ entry, index }: { entry: LeaderboardEntry; index: number }) => {
    const isTop3 = entry.rank <= 3;
    const medals = ['🥇', '🥈', '🥉'];
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => triggerHaptic('light')}
        className={`
          relative p-4 rounded-2xl mb-3 backdrop-blur-md
          ${entry.isCurrentUser 
            ? 'bg-gradient-to-r from-golf-green/20 to-golf-lightgreen/20 border-2 border-golf-green' 
            : 'bg-white/80 border border-gray-200'
          }
          ${isTop3 ? 'shadow-lg' : 'shadow-sm'}
          transition-all duration-300 hover:shadow-xl
        `}
      >
        {/* Rank */}
        <div className="absolute -left-4 top-1/2 -translate-y-1/2">
          {isTop3 ? (
            <div className="text-3xl">{medals[entry.rank - 1]}</div>
          ) : (
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold">
              {entry.rank}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between ml-6">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={entry.avatar || '/api/avatar/' + entry.userId}
                alt={entry.name}
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              {entry.streak && entry.streak > 2 && (
                <div className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  <Fire className="w-3 h-3" />
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold flex items-center gap-2">
                {entry.name}
                {entry.badge && <span className="text-xs">{entry.badge}</span>}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>{formatValue(category, entry.value)}</span>
                <RankChange current={entry.rank} previous={entry.previousRank} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {entry.improvement && (
              <div className="text-green-500 text-sm font-medium">
                +{entry.improvement}%
              </div>
            )}
            {!entry.isCurrentUser && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onChallenge?.(entry.userId);
                  triggerHaptic('medium');
                }}
                className="p-2 bg-golf-green text-white rounded-lg"
              >
                <Trophy className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Progress Bar for Improvement Category */}
        {category === 'improvement' && entry.improvement && (
          <div className="mt-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(entry.improvement, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-golf-green to-golf-lightgreen"
              />
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Leaderboards</h2>
        
        {/* Category Selector */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {(['distance', 'accuracy', 'consistency', 'improvement'] as const).map(cat => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setCategory(cat);
                triggerHaptic('light');
              }}
              className={`
                p-3 rounded-xl flex flex-col items-center justify-center
                ${category === cat 
                  ? 'bg-golf-green text-white' 
                  : 'bg-gray-100 text-gray-700'
                }
                transition-all duration-200
              `}
            >
              <CategoryIcon type={cat} />
              <span className="text-xs mt-1 capitalize">{cat}</span>
            </motion.button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mb-4">
          {/* Timeframe */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="flex-1 p-2 rounded-lg border border-gray-200 text-sm"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all-time">All Time</option>
          </select>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="flex-1 p-2 rounded-lg border border-gray-200 text-sm"
          >
            <option value="global">Global</option>
            <option value="friends">Friends</option>
            <option value="local">Local</option>
            <option value="club">By Club</option>
          </select>
        </div>

        {/* User's Rank */}
        {userRank && userRank > 10 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-golf-green/10 border border-golf-green rounded-lg p-3 mb-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Your Rank</span>
              <span className="text-2xl font-bold text-golf-green">#{userRank}</span>
            </div>
            <button className="text-xs text-golf-green mt-1">
              Jump to your position <ChevronDown className="w-3 h-3 inline" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-golf-green border-t-transparent mx-auto" />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {entries.map((entry, index) => (
              <LeaderboardCard key={entry.userId} entry={entry} index={index} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Load More */}
      {!loading && entries.length >= 10 && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            // Load more entries
            triggerHaptic('light');
          }}
          className="w-full mt-4 p-3 bg-gray-100 rounded-lg text-sm text-gray-600"
        >
          Load More
        </motion.button>
      )}
    </div>
  );
};

// Helper function to format values based on category
function formatValue(category: string, value: number): string {
  switch (category) {
    case 'distance':
      return `${value} yards`;
    case 'accuracy':
      return `${value}% accurate`;
    case 'consistency':
      return `±${value} yards`;
    case 'improvement':
      return `${value}% better`;
    default:
      return String(value);
  }
}

// Helper function to update ranks with animation
function updateRanks(entries: LeaderboardEntry[], update: any): LeaderboardEntry[] {
  return entries.map(entry => {
    if (entry.userId === update.userId) {
      return {
        ...entry,
        previousRank: entry.rank,
        rank: update.newRank,
        value: update.newValue
      };
    }
    return entry;
  }).sort((a, b) => a.rank - b.rank);
}

// Show celebration animation
function showCelebration() {
  // Implement confetti or celebration animation
  console.log('🎉 Rank improved!');
}

export default AddictiveLeaderboard;