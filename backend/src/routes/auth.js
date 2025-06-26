const express = require('express');
const passport = require('passport');
const { generateJWT } = require('../middleware/auth');

const router = express.Router();

// Initiate Google OAuth
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

// Google OAuth callback
router.get('/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { 
      failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/?error=oauth_failed` 
    })(req, res, (err) => {
      if (err) {
        console.error('OAuth error:', err);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?error=oauth_error`);
      }
      
      try {
        // Generate JWT token for the authenticated user
        const token = generateJWT(req.user.id);
        
        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
      } catch (error) {
        console.error('Token generation error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/?error=token_error`);
      }
    });
  }
);

// Get current user info
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        profilePicture: req.user.profile_picture
      }
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Generate JWT token for authenticated session user
router.post('/token', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const token = generateJWT(req.user.id);
  res.json({ token });
});

module.exports = router; 