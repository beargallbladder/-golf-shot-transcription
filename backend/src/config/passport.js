const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { query } = require('../database/db');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    const existingUser = await query(
      'SELECT * FROM users WHERE google_id = $1',
      [profile.id]
    );

    if (existingUser.rows.length > 0) {
      // User exists, return the user
      return done(null, existingUser.rows[0]);
    }

    // Create new user
    const newUser = await query(`
      INSERT INTO users (google_id, email, name, profile_picture)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      profile.id,
      profile.emails[0].value,
      profile.displayName,
      profile.photos[0].value
    ]);

    return done(null, newUser.rows[0]);
  } catch (error) {
    console.error('Error in Google OAuth strategy:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (user.rows.length > 0) {
      done(null, user.rows[0]);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, null);
  }
}); 