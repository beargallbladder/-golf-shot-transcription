const config = {
  // Authentication
  jwtSecret: process.env.JWT_SECRET,
  sessionSecret: process.env.SESSION_SECRET,
  
  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
  
  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY,
  
  // Retailer Access Control
  retailerBetaEmails: process.env.RETAILER_BETA_EMAILS 
    ? process.env.RETAILER_BETA_EMAILS.split(',').map(email => email.trim().toLowerCase())
    : [],
  
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
  
  // Stripe (for future)
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
};

// Validation
const requiredEnvVars = [
  'JWT_SECRET',
  'SESSION_SECRET', 
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'DATABASE_URL',
  'OPENAI_API_KEY'
];

const validateEnvironment = () => {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.error('📋 Please set these environment variables and restart the server');
    process.exit(1);
  }
  
  // Warn about retailer beta access
  if (!process.env.RETAILER_BETA_EMAILS) {
    console.warn('⚠️ RETAILER_BETA_EMAILS not set - retailer features will be disabled');
  }
  
  console.log('✅ Environment configuration validated');
};

module.exports = { config, validateEnvironment }; 