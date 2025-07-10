
-- Enhanced indexes for golf shot analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shots_user_club_distance ON shots(user_id, club, distance DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shots_leaderboard_speed ON shots(speed DESC) WHERE speed IS NOT NULL;

-- Performance monitoring view
CREATE VIEW IF NOT EXISTS v_performance_metrics AS
SELECT 
  COUNT(*) as total_shots,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(distance) as avg_distance
FROM shots;
    