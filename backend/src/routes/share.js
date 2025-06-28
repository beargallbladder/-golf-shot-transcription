const express = require('express');
const { query } = require('../database/db');

const router = express.Router();

// GET /share/shot/:id - Public shot view
router.get('/shot/:id', async (req, res) => {
  try {
    const shotId = req.params.id;

    // Get shot with user info
    const result = await query(`
      SELECT 
        s.id,
        s.speed,
        s.distance,
        s.spin,
        s.launch_angle,
        s.created_at,
        s.image_data,
        u.name as user_name,
        u.profile_picture as user_avatar
      FROM shots s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `, [shotId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shot not found' });
    }

    const shot = result.rows[0];

    // Return shot data for sharing
    res.json({
      shot: {
        id: shot.id,
        speed: shot.speed ? parseFloat(shot.speed) : null,
        distance: shot.distance ? parseInt(shot.distance) : null,
        spin: shot.spin ? parseInt(shot.spin) : null,
        launchAngle: shot.launch_angle ? parseFloat(shot.launch_angle) : null,
        createdAt: shot.created_at,
        imageData: shot.image_data,
        user: {
          name: shot.user_name,
          avatar: shot.user_avatar
        }
      }
    });

  } catch (error) {
    console.error('Share shot error:', error);
    res.status(500).json({
      error: 'Failed to load shot',
      message: error.message
    });
  }
});

module.exports = router; 