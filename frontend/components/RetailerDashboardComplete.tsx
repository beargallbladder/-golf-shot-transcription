import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  UsersIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  CurrencyDollarIcon,
  ClockIcon,
  MapPinIcon,
  ShareIcon,
  DownloadIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface RetailerMetrics {
  totalCustomers: number;
  monthlyRevenue: number;
  conversionRate: number;
  averageOrderValue: number;
  topClubs: Array<{ club: string; sales: number; revenue: number }>;
  customerInsights: Array<{ distance: string; count: number; potential: number }>;
  salesTrends: Array<{ month: string; sales: number; revenue: number }>;
  trafficSources: Array<{ source: string; visits: number; conversions: number }>;
}

interface RetailerDashboardProps {
  retailerId: string;
}

const RetailerDashboardComplete: React.FC<RetailerDashboardProps> = ({ retailerId }) => {
  const [metrics, setMetrics] = useState<RetailerMetrics | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedView, setSelectedView] = useState<'overview' | 'customers' | 'inventory' | 'conversion'>('overview');
  const [loading, setLoading] = useState(true);

  // Sample data - replace with actual API calls
  const sampleMetrics: RetailerMetrics = {
    totalCustomers: 1247,
    monthlyRevenue: 45620,
    conversionRate: 12.3,
    averageOrderValue: 189.50,
    topClubs: [
      { club: 'Driver', sales: 89, revenue: 32450 },
      { club: '7-Iron', sales: 156, revenue: 18720 },
      { club: 'Putter', sales: 203, revenue: 24360 },
      { club: 'Sand Wedge', sales: 78, revenue: 9360 },
      { club: '3-Wood', sales: 45, revenue: 11250 }
    ],
    customerInsights: [
      { distance: '200-220 yards', count: 234, potential: 87 },
      { distance: '220-240 yards', count: 189, potential: 156 },
      { distance: '240-260 yards', count: 156, potential: 203 },
      { distance: '260-280 yards', count: 123, potential: 234 },
      { distance: '280+ yards', count: 89, potential: 167 }
    ],
    salesTrends: [
      { month: 'Jan', sales: 234, revenue: 42340 },
      { month: 'Feb', sales: 267, revenue: 48120 },
      { month: 'Mar', sales: 289, revenue: 51670 },
      { month: 'Apr', sales: 312, revenue: 56890 },
      { month: 'May', sales: 298, revenue: 53240 },
      { month: 'Jun', sales: 334, revenue: 59120 }
    ],
    trafficSources: [
      { source: 'GolfSimple App', visits: 2340, conversions: 287 },
      { source: 'Direct', visits: 1890, conversions: 234 },
      { source: 'Google', visits: 1456, conversions: 189 },
      { source: 'Social Media', visits: 987, conversions: 123 },
      { source: 'Email', visits: 567, conversions: 89 }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMetrics(sampleMetrics);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const COLORS = ['#52B788', '#40916C', '#2D6A4F', '#1B4332', '#081C15'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-golf-green border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading retailer analytics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const MetricCard = ({ title, value, change, icon: Icon, format = 'number' }: any) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-golf-green/10 rounded-xl">
          <Icon className="w-6 h-6 text-golf-green" />
        </div>
        {change && (
          <span className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">
          {format === 'currency' ? `$${value.toLocaleString()}` : 
           format === 'percentage' ? `${value}%` : 
           value.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );

  const OverviewView = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Customers"
          value={metrics.totalCustomers}
          change={8.2}
          icon={UsersIcon}
        />
        <MetricCard
          title="Monthly Revenue"
          value={metrics.monthlyRevenue}
          change={15.3}
          icon={CurrencyDollarIcon}
          format="currency"
        />
        <MetricCard
          title="Conversion Rate"
          value={metrics.conversionRate}
          change={-2.1}
          icon={TrendingUpIcon}
          format="percentage"
        />
        <MetricCard
          title="Avg Order Value"
          value={metrics.averageOrderValue}
          change={5.7}
          icon={ShoppingBagIcon}
          format="currency"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trends */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Sales Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.salesTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#52B788" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Clubs */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Top Selling Clubs</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.topClubs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="club" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#52B788" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Traffic Sources & Conversions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Source</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Visits</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Conversions</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Rate</th>
              </tr>
            </thead>
            <tbody>
              {metrics.trafficSources.map((source, index) => (
                <tr key={source.source} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">{source.source}</td>
                  <td className="text-right py-3 px-4">{source.visits.toLocaleString()}</td>
                  <td className="text-right py-3 px-4">{source.conversions}</td>
                  <td className="text-right py-3 px-4">
                    <span className="text-green-600 font-medium">
                      {((source.conversions / source.visits) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const CustomerInsightsView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Customer Distance Analysis</h3>
        <p className="text-gray-600 mb-6">
          Analyze customer performance to recommend optimal equipment upgrades
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distance Distribution */}
          <div>
            <h4 className="font-medium mb-4">Distance Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.customerInsights}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ distance, count }) => `${distance}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {metrics.customerInsights.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Upgrade Opportunities */}
          <div>
            <h4 className="font-medium mb-4">Upgrade Opportunities</h4>
            <div className="space-y-3">
              {metrics.customerInsights.map((insight, index) => (
                <div key={insight.distance} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{insight.distance}</span>
                    <span className="text-green-600 font-bold">${insight.potential * 150}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {insight.count} customers • {insight.potential} upgrade potential
                  </div>
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-golf-green h-2 rounded-full"
                        style={{ width: `${(insight.potential / insight.count) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Customer Segments</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-900">Beginners</h4>
            <p className="text-2xl font-bold text-blue-700 my-2">347</p>
            <p className="text-sm text-blue-600">Average distance: 180-220 yards</p>
            <p className="text-xs text-blue-500 mt-2">Recommend: Cavity back irons, larger drivers</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <h4 className="font-semibold text-green-900">Intermediate</h4>
            <p className="text-2xl font-bold text-green-700 my-2">623</p>
            <p className="text-sm text-green-600">Average distance: 220-260 yards</p>
            <p className="text-xs text-green-500 mt-2">Recommend: Player's irons, custom fitting</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <h4 className="font-semibold text-purple-900">Advanced</h4>
            <p className="text-2xl font-bold text-purple-700 my-2">277</p>
            <p className="text-sm text-purple-600">Average distance: 260+ yards</p>
            <p className="text-xs text-purple-500 mt-2">Recommend: Tour clubs, premium shafts</p>
          </div>
        </div>
      </div>
    </div>
  );

  const ExportButton = () => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-4 py-2 bg-golf-green text-white rounded-lg hover:bg-golf-green/90 transition-colors"
    >
      <DownloadIcon className="w-4 h-4" />
      Export Report
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Retailer Dashboard</h1>
              <p className="text-gray-600 mt-1">Golf equipment insights and customer analytics</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-golf-green"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              <ExportButton />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'customers', label: 'Customer Insights', icon: UsersIcon },
              { id: 'inventory', label: 'Inventory Analysis', icon: ShoppingBagIcon },
              { id: 'conversion', label: 'Conversion Tracking', icon: TrendingUpIcon }
            ].map(tab => (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedView(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedView === tab.id
                    ? 'bg-golf-green text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {selectedView === 'overview' && <OverviewView />}
            {selectedView === 'customers' && <CustomerInsightsView />}
            {selectedView === 'inventory' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Inventory Analysis</h3>
                <p className="text-gray-600">Coming soon - Advanced inventory optimization based on customer data</p>
              </div>
            )}
            {selectedView === 'conversion' && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                <TrendingUpIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Conversion Tracking</h3>
                <p className="text-gray-600">Coming soon - Track customer journey from app to purchase</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RetailerDashboardComplete;