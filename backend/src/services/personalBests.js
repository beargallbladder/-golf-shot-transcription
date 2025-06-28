const { query } = require('../database/db');

// Standard golf clubs in order
const GOLF_CLUBS = [
  'Driver',
  '3-Wood',
  '5-Wood',
  '7-Wood',
  '3-Iron',
  '4-Iron',
  '5-Iron',
  '6-Iron',
  '7-Iron',
  '8-Iron',
  '9-Iron',
  'Pitching Wedge',
  'Gap Wedge',
  'Sand Wedge',
  'Lob Wedge'
];

/**
 * Check if a new shot is a personal best and update if so
 */
const checkAndUpdatePersonalBest = async (userId, shotData) => {
  const { id: shotId, club, distance, speed, spin, launchAngle } = shotData;
  
  if (!club || !distance) {
    return { isPersonalBest: false };
  }

  try {
    // Get current personal best for this club
    const currentBestResult = await query(`
      SELECT * FROM personal_bests 
      WHERE user_id = $1 AND club = $2
    `, [userId, club]);

    const currentBest = currentBestResult.rows[0];
    const isNewBest = !currentBest || distance > currentBest.distance;

    if (isNewBest) {
      // Insert or update personal best
      await query(`
        INSERT INTO personal_bests (user_id, club, shot_id, distance, speed, spin, launch_angle, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, club) 
        DO UPDATE SET 
          shot_id = $3,
          distance = $4,
          speed = $5,
          spin = $6,
          launch_angle = $7,
          updated_at = CURRENT_TIMESTAMP
      `, [userId, club, shotId, distance, speed, spin, launchAngle]);

      return {
        isPersonalBest: true,
        previousBest: currentBest ? currentBest.distance : null,
        newBest: distance,
        improvement: currentBest ? distance - currentBest.distance : distance,
        club
      };
    }

    return { isPersonalBest: false };
  } catch (error) {
    console.error('Error checking personal best:', error);
    return { isPersonalBest: false, error: error.message };
  }
};

/**
 * Get user's complete bag with personal bests
 */
const getUserBag = async (userId) => {
  try {
    const result = await query(`
      SELECT 
        pb.*,
        s.created_at as shot_date,
        s.image_data
      FROM personal_bests pb
      JOIN shots s ON pb.shot_id = s.id
      WHERE pb.user_id = $1
      ORDER BY 
        CASE pb.club
          WHEN 'Driver' THEN 1
          WHEN '3-Wood' THEN 2
          WHEN '5-Wood' THEN 3
          WHEN '7-Wood' THEN 4
          WHEN '3-Iron' THEN 5
          WHEN '4-Iron' THEN 6
          WHEN '5-Iron' THEN 7
          WHEN '6-Iron' THEN 8
          WHEN '7-Iron' THEN 9
          WHEN '8-Iron' THEN 10
          WHEN '9-Iron' THEN 11
          WHEN 'Pitching Wedge' THEN 12
          WHEN 'Gap Wedge' THEN 13
          WHEN 'Sand Wedge' THEN 14
          WHEN 'Lob Wedge' THEN 15
          ELSE 99
        END
    `, [userId]);

    // Create complete bag with all clubs (showing empty slots)
    const userBests = result.rows;
    const completeBag = GOLF_CLUBS.map(club => {
      const best = userBests.find(b => b.club === club);
      return {
        club,
        hasBest: !!best,
        ...(best || {
          distance: null,
          speed: null,
          spin: null,
          launch_angle: null,
          shot_date: null,
          shot_id: null
        })
      };
    });

    return completeBag;
  } catch (error) {
    console.error('Error getting user bag:', error);
    throw error;
  }
};

/**
 * Get bag statistics
 */
const getBagStats = async (userId) => {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as clubs_with_data,
        AVG(distance) as avg_distance,
        MAX(distance) as max_distance,
        MIN(distance) as min_distance,
        SUM(CASE WHEN distance >= 200 THEN 1 ELSE 0 END) as clubs_200_plus
      FROM personal_bests 
      WHERE user_id = $1
    `, [userId]);

    const stats = result.rows[0];
    return {
      totalClubs: GOLF_CLUBS.length,
      clubsWithData: parseInt(stats.clubs_with_data),
      clubsRemaining: GOLF_CLUBS.length - parseInt(stats.clubs_with_data),
      avgDistance: stats.avg_distance ? Math.round(stats.avg_distance) : 0,
      maxDistance: stats.max_distance || 0,
      minDistance: stats.min_distance || 0,
      clubs200Plus: parseInt(stats.clubs_200_plus),
      completionPercentage: Math.round((parseInt(stats.clubs_with_data) / GOLF_CLUBS.length) * 100)
    };
  } catch (error) {
    console.error('Error getting bag stats:', error);
    throw error;
  }
};

module.exports = {
  checkAndUpdatePersonalBest,
  getUserBag,
  getBagStats,
  GOLF_CLUBS
}; 