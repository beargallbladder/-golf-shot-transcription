const express = require('express');
const { requireJWT } = require('../middleware/auth');
const { query } = require('../database/db');

const router = express.Router();

// GET /api/retailer/analytics - Get retailer analytics data
router.get('/analytics', requireJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;
    
    // Check if user is a retailer
    const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    
    if (user.account_type !== 'retailer') {
      return res.status(403).json({
        error: 'Retailer access required',
        message: 'This endpoint is only available for retailer accounts'
      });
    }

    const daysInt = parseInt(days);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysInt);

    // Get basic metrics
    const [
      totalCustomersResult,
      totalSessionsResult,
      totalShotsResult,
      fittingShotsResult
    ] = await Promise.all([
      // Total unique customers (based on customer_email)
      query(`
        SELECT COUNT(DISTINCT customer_email) as count
        FROM shots 
        WHERE user_id = $1 
        AND customer_email IS NOT NULL
        AND created_at >= $2
      `, [userId, startDate.toISOString()]),
      
      // Total fitting sessions
      query(`
        SELECT COUNT(DISTINCT fitting_session_id) as count
        FROM shots 
        WHERE user_id = $1 
        AND fitting_session_id IS NOT NULL
        AND created_at >= $2
      `, [userId, startDate.toISOString()]),
      
      // Total shots
      query(`
        SELECT COUNT(*) as count
        FROM shots 
        WHERE user_id = $1
        AND created_at >= $2
      `, [userId, startDate.toISOString()]),
      
      // Fitting shots (shots with customer data)
      query(`
        SELECT COUNT(*) as count
        FROM shots 
        WHERE user_id = $1 
        AND is_fitting_data = true
        AND created_at >= $2
      `, [userId, startDate.toISOString()])
    ]);

    // Get top clubs by volume
    const topClubsResult = await query(`
      SELECT 
        club,
        COUNT(*) as count,
        ROUND(AVG(distance)) as averageDistance
      FROM shots 
      WHERE user_id = $1 
      AND club IS NOT NULL
      AND created_at >= $2
      GROUP BY club
      ORDER BY count DESC
      LIMIT 10
    `, [userId, startDate.toISOString()]);

    // Get performance trends (daily averages)
    const trendsResult = await query(`
      SELECT 
        DATE(created_at) as date,
        ROUND(AVG(distance)) as averageDistance,
        COUNT(DISTINCT fitting_session_id) as sessionCount
      FROM shots 
      WHERE user_id = $1
      AND created_at >= $2
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `, [userId, startDate.toISOString()]);

    // Calculate average session length (mock data for now)
    const averageSessionLength = 45; // minutes - would need session tracking

    // Calculate fitting success rate (mock data)
    const fittingSuccessRate = Math.round(85 + Math.random() * 10); // 85-95%

    // Mock revenue metrics (would integrate with payment system)
    const revenueMetrics = {
      totalRevenue: Math.round(12000 + Math.random() * 8000),
      averageSessionValue: Math.round(150 + Math.random() * 100),
      monthlyGrowth: Math.round(5 + Math.random() * 15)
    };

    const analyticsData = {
      totalCustomers: parseInt(totalCustomersResult.rows[0].count) || 0,
      totalSessions: parseInt(totalSessionsResult.rows[0].count) || 0,
      totalShots: parseInt(totalShotsResult.rows[0].count) || 0,
      averageSessionLength,
      topClubsByVolume: topClubsResult.rows.map(row => ({
        club: row.club,
        count: parseInt(row.count),
        averageDistance: parseInt(row.averagedistance) || 0
      })),
      customerPerformanceTrends: trendsResult.rows.map(row => ({
        date: row.date,
        averageDistance: parseInt(row.averagedistance) || 0,
        sessionCount: parseInt(row.sessioncount) || 0
      })),
      fittingSuccessRate,
      revenueMetrics
    };

    res.json(analyticsData);

  } catch (error) {
    console.error('Retailer analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
});

// GET /api/retailer/dashboard - Get retailer dashboard data
router.get('/dashboard', requireJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user is a retailer
    const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    
    if (user.account_type !== 'retailer') {
      return res.status(403).json({
        error: 'Retailer access required',
        message: 'This endpoint is only available for retailer accounts'
      });
    }

    // Get all basic stats in a single optimized query
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_shots,
        COUNT(CASE WHEN is_fitting_data = true THEN 1 END) as fitting_shots,
        COUNT(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as shots_this_month,
        COUNT(DISTINCT customer_email) FILTER (WHERE customer_email IS NOT NULL) as total_customers,
        COUNT(DISTINCT customer_email) FILTER (WHERE customer_email IS NOT NULL AND created_at >= CURRENT_DATE - INTERVAL '30 days') as new_customers,
        COUNT(DISTINCT fitting_session_id) FILTER (WHERE fitting_session_id IS NOT NULL) as total_sessions,
        COUNT(DISTINCT fitting_session_id) FILTER (WHERE fitting_session_id IS NOT NULL AND created_at >= CURRENT_DATE - INTERVAL '7 days') as active_sessions
      FROM shots 
      WHERE user_id = $1
    `, [userId]);

    // Get recent fitting sessions
    const sessionsResult = await query(`
      SELECT 
        fitting_session_id as id,
        customer_email as customerEmail,
        MAX(created_at) as createdAt,
        COUNT(*) as shotCount,
        'active' as status
      FROM shots 
      WHERE user_id = $1 
      AND fitting_session_id IS NOT NULL
      GROUP BY fitting_session_id, customer_email
      ORDER BY MAX(created_at) DESC
      LIMIT 10
    `, [userId]);

    const statsRow = statsResult.rows[0];
    const stats = {
      totalShots: parseInt(statsRow.total_shots) || 0,
      fittingShots: parseInt(statsRow.fitting_shots) || 0,
      shotsThisMonth: parseInt(statsRow.shots_this_month) || 0,
      totalCustomers: parseInt(statsRow.total_customers) || 0,
      newCustomers: parseInt(statsRow.new_customers) || 0,
      totalSessions: parseInt(statsRow.total_sessions) || 0,
      activeSessions: parseInt(statsRow.active_sessions) || 0
    };

    const sessions = sessionsResult.rows.map(row => ({
      id: row.id,
      customerName: row.customeremail?.split('@')[0] || 'Unknown',
      customerEmail: row.customeremail,
      status: row.status,
      createdAt: row.createdat,
      shotCount: parseInt(row.shotcount)
    }));

    res.json({
      stats,
      sessions
    });

  } catch (error) {
    console.error('Retailer dashboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      message: error.message
    });
  }
});

module.exports = router; 