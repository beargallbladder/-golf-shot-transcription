require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');
const rateLimit = require('express-rate-limit');

// Production-grade configuration
const { validateEnvironment, config } = require('./config/environment');
const { runMigrations } = require('./config/migrations');

// Import routes
const authRoutes = require('./routes/auth');
const shotRoutes = require('./routes/shots');
const shareRoutes = require('./routes/share');
const retailerRoutes = require('./routes/retailer');

// Import passport configuration
require('./config/passport');

// Database migration will be run in startServer() function

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(limiter);
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://golf-shot-transcription-frontend.vercel.app',
    'https://www.beatmybag.com',
    'https://beatmybag.com',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Fix for invalid cert issues
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Simple root endpoint for Render port detection
app.get('/', (req, res) => {
  res.json({ 
    message: 'Golf Shot Transcription API', 
    status: 'running',
    port: process.env.PORT || 3001,
    timestamp: new Date().toISOString() 
  });
});

// Favicon route to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/shots', shotRoutes);
app.use('/api/retailer', retailerRoutes);
app.use('/share', shareRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation Error', 
      details: err.message 
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid or missing authentication token' 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const startServer = async () => {
  try {
    // Validate environment configuration
    validateEnvironment();
    
    // Run production-grade migrations
    await runMigrations();
    console.log('✅ Database migrations completed');
    
    // Ensure we bind to 0.0.0.0 for Render
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔑 Using Google Client ID ending with: ${process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.slice(-10) : 'NOT_SET'}`);
      console.log(`📡 Server accessible at: http://0.0.0.0:${PORT}`);
      console.log(`🎯 PORT detected by Render: ${PORT}`);
      console.log(`✅ Server is ready to accept connections`);
    });
    
    // Handle server errors
    server.on('error', (err) => {
      console.error('❌ Server error:', err);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 