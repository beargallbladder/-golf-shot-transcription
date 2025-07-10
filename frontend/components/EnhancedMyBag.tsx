import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { 
  Target, TrendingUp, Award, ChevronRight, Plus, Share2, 
  BarChart3, Wind, Cloud, Sun, CloudRain, Zap, Users
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Line, LineChart, XAxis, YAxis, Tooltip } from 'recharts';
import { useHaptic } from '../hooks/useHaptic';
import toast from 'react-hot-toast';

interface Club {
  id: string;
  type: string;
  brand?: string;
  model?: string;
  avgDistance: number;
  maxDistance: number;
  consistency: number; // Standard deviation
  totalShots: number;
  lastUsed: Date;
  personalBest: {
    distance: number;
    date: Date;
    conditions?: string;
  };
  goals?: {
    distance?: number;
    consistency?: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  gapping?: {
    previous?: number;
    next?: number;
  };
}

interface WeatherConditions {
  temperature: number;
  windSpeed: number;
  windDirection: string;
  conditions: 'sunny' | 'cloudy' | 'rainy';
  humidity: number;
}

const EnhancedMyBag: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | '3d'>('grid');
  const [showComparison, setShowComparison] = useState(false);
  const [weather, setWeather] = useState<WeatherConditions | null>(null);
  const [loading, setLoading] = useState(true);
  const { triggerHaptic } = useHaptic();
  const controls = useAnimation();

  useEffect(() => {
    fetchBagData();
    fetchWeatherData();
  }, []);

  const fetchBagData = async () => {
    try {
      const response = await fetch('/api/my-bag');
      const data = await response.json();
      setClubs(data.clubs);
      analyzeGapping(data.clubs);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherData = async () => {
    try {
      const response = await fetch('/api/weather/current');
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    }
  };

  const analyzeGapping = (clubList: Club[]) => {
    // Sort clubs by average distance
    const sorted = [...clubList].sort((a, b) => b.avgDistance - a.avgDistance);
    
    sorted.forEach((club, index) => {
      if (index > 0) {
        club.gapping = {
          previous: sorted[index - 1].avgDistance - club.avgDistance
        };
      }
      if (index < sorted.length - 1) {
        club.gapping = {
          ...club.gapping,
          next: club.avgDistance - sorted[index + 1].avgDistance
        };
      }
    });
  };

  const ClubCard3D = ({ club }: { club: Club }) => {
    return (
      <div className="h-64 w-full">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <OrbitControls enableZoom={false} autoRotate />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <mesh>
            <boxGeometry args={[1, 3, 0.1]} />
            <meshStandardMaterial color="#52B788" />
          </mesh>
        </Canvas>
      </div>
    );
  };

  const ClubCard = ({ club }: { club: Club }) => {
    const [showDetails, setShowDetails] = useState(false);
    const consistencyColor = club.consistency < 10 ? 'text-green-500' : club.consistency < 20 ? 'text-yellow-500' : 'text-red-500';
    const trendIcon = club.trend === 'improving' ? '📈' : club.trend === 'declining' ? '📉' : '➡️';

    return (
      <motion.div
        layout
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setSelectedClub(club);
          setShowDetails(true);
          triggerHaptic('light');
        }}
        className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-golf-green to-golf-lightgreen" />
        </div>

        {/* Club Header */}
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold">{club.type}</h3>
              {club.brand && (
                <p className="text-sm text-gray-500">{club.brand} {club.model}</p>
              )}
            </div>
            <div className="text-2xl">{trendIcon}</div>
          </div>

          {/* Distance Stats */}
          <div className="space-y-3">
            {/* Average Distance */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Distance</span>
              <span className="text-2xl font-bold">{Math.round(club.avgDistance)} yds</span>
            </div>

            {/* Consistency Meter */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600">Consistency</span>
                <span className={`text-sm font-medium ${consistencyColor}`}>
                  ±{Math.round(club.consistency)} yds
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, 100 - club.consistency * 2)}%` }}
                  className={`h-full ${
                    club.consistency < 10 ? 'bg-green-500' : 
                    club.consistency < 20 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </div>

            {/* Personal Best */}
            {club.personalBest && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-gray-600 flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  Personal Best
                </span>
                <span className="font-bold text-golf-green">
                  {club.personalBest.distance} yds
                </span>
              </div>
            )}

            {/* Gap Warning */}
            {club.gapping && (club.gapping.previous > 30 || club.gapping.next > 30) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <p className="text-xs text-yellow-800">
                  ⚠️ Large gap detected ({club.gapping.previous || club.gapping.next} yards)
                </p>
              </motion.div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                // Set goal
                triggerHaptic('medium');
              }}
              className="flex-1 p-2 bg-golf-green/10 text-golf-green rounded-lg text-sm font-medium"
            >
              Set Goal
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                // Compare with friends
                setShowComparison(true);
                triggerHaptic('medium');
              }}
              className="flex-1 p-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium"
            >
              Compare
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  const BagOverview = () => {
    const totalClubs = clubs.length;
    const avgConsistency = clubs.reduce((acc, club) => acc + club.consistency, 0) / totalClubs;
    const improvingClubs = clubs.filter(c => c.trend === 'improving').length;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-golf-green to-golf-lightgreen text-white rounded-2xl p-6 mb-6"
      >
        <h2 className="text-2xl font-bold mb-4">Your Bag Overview</h2>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{totalClubs}</div>
            <div className="text-sm opacity-80">Clubs Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">±{Math.round(avgConsistency)}</div>
            <div className="text-sm opacity-80">Avg Consistency</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{improvingClubs}</div>
            <div className="text-sm opacity-80">Improving</div>
          </div>
        </div>

        {/* Weather Adjustment */}
        {weather && (
          <div className="mt-4 p-3 bg-white/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm">Today's Conditions</span>
              <div className="flex items-center gap-2">
                {weather.conditions === 'sunny' && <Sun className="w-4 h-4" />}
                {weather.conditions === 'cloudy' && <Cloud className="w-4 h-4" />}
                {weather.conditions === 'rainy' && <CloudRain className="w-4 h-4" />}
                <span className="text-sm">{weather.temperature}°F</span>
                <Wind className="w-4 h-4" />
                <span className="text-sm">{weather.windSpeed} mph</span>
              </div>
            </div>
            <p className="text-xs mt-1 opacity-80">
              Expect -5 to -10 yards on all clubs
            </p>
          </div>
        )}
      </motion.div>
    );
  };

  const GappingVisualization = () => {
    const sortedClubs = [...clubs].sort((a, b) => b.avgDistance - a.avgDistance);
    const data = sortedClubs.map(club => ({
      name: club.type,
      distance: club.avgDistance,
      min: club.avgDistance - club.consistency,
      max: club.avgDistance + club.consistency
    }));

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-6"
      >
        <h3 className="text-xl font-bold mb-4">Distance Gapping</h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="distance" 
              stroke="#52B788" 
              strokeWidth={3}
              dot={{ fill: '#52B788', r: 6 }}
            />
            {/* Range bars */}
            {data.map((entry, index) => (
              <Line
                key={`range-${index}`}
                type="monotone"
                dataKey="min"
                stroke="#52B788"
                strokeOpacity={0.3}
                strokeDasharray="5 5"
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Gap Warnings */}
        <div className="mt-4 space-y-2">
          {sortedClubs.map((club, index) => {
            if (index === 0) return null;
            const gap = sortedClubs[index - 1].avgDistance - club.avgDistance;
            if (gap > 30) {
              return (
                <div key={club.id} className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Large gap between {sortedClubs[index - 1].type} and {club.type}: {Math.round(gap)} yards
                  </p>
                </div>
              );
            }
            return null;
          })}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <BagOverview />

      {/* View Mode Selector */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Clubs</h2>
        <div className="flex gap-2">
          {(['grid', 'list', '3d'] as const).map(mode => (
            <motion.button
              key={mode}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setViewMode(mode);
                triggerHaptic('light');
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                viewMode === mode 
                  ? 'bg-golf-green text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {mode.toUpperCase()}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Gapping Visualization */}
      <GappingVisualization />

      {/* Clubs Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-golf-green border-t-transparent" />
        </div>
      ) : (
        <div className={`
          ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : ''}
          ${viewMode === 'list' ? 'space-y-4' : ''}
        `}>
          <AnimatePresence mode="popLayout">
            {clubs.map(club => (
              <ClubCard key={club.id} club={club} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Club Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          // Add new club
          triggerHaptic('medium');
        }}
        className="fixed bottom-20 right-6 w-14 h-14 bg-golf-green text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default EnhancedMyBag;