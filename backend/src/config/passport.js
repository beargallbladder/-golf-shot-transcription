const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { query } = require('../database/db');

passport.use(new GoogleStrategy({
  clientID: '30109835375-vqi79va1m9gdug0c9e9q9j4cvm5e93d1.apps.googleusercontent.com',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔐 OAuth callback received for user:', profile.displayName);
    
    // Check if user already exists
    const existingUser = await query(
      'SELECT * FROM users WHERE google_id = $1',
      [profile.id]
    );

    if (existingUser.rows.length > 0) {
      console.log('✅ Existing user found:', existingUser.rows[0].email);
      return done(null, existingUser.rows[0]);
    }

    console.log('🆕 Creating new user:', profile.emails[0].value);
    
    // Create new user with better error handling
    const newUser = await query(`
      INSERT INTO users (google_id, email, name, profile_picture)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      profile.id,
      profile.emails[0].value,
      profile.displayName,
      profile.photos && profile.photos[0] ? profile.photos[0].value : null
    ]);

    console.log('✅ New user created:', newUser.rows[0].email);
    return done(null, newUser.rows[0]);
  } catch (error) {
    console.error('❌ Error in Google OAuth strategy:', error);
    console.error('Profile data:', {
      id: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName
    });
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