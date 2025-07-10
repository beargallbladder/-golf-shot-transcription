-- Retailer activation tracking
CREATE TABLE IF NOT EXISTS retailer_activations (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  is_activated BOOLEAN DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activated_at TIMESTAMP
);

-- Retailer profiles with features and subscription info
CREATE TABLE IF NOT EXISTS retailer_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  company_logo_url VARCHAR(500),
  website_url VARCHAR(500),
  physical_locations JSONB DEFAULT '[]',
  subscription_tier VARCHAR(50) DEFAULT 'basic',
  subscription_expires_at TIMESTAMP,
  features_enabled JSONB DEFAULT '{}',
  api_key VARCHAR(255) UNIQUE,
  api_secret VARCHAR(255),
  webhook_url VARCHAR(500),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Retailer analytics events for tracking
CREATE TABLE IF NOT EXISTS retailer_analytics_events (
  id SERIAL PRIMARY KEY,
  retailer_id INTEGER REFERENCES retailer_profiles(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Retailer customer connections (for tracking conversions)
CREATE TABLE IF NOT EXISTS retailer_customer_links (
  id SERIAL PRIMARY KEY,
  retailer_id INTEGER REFERENCES retailer_profiles(id) ON DELETE CASCADE,
  customer_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  referral_code VARCHAR(50),
  first_visit_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_visit_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  conversion_value DECIMAL(10, 2),
  metadata JSONB DEFAULT '{}',
  UNIQUE(retailer_id, customer_user_id)
);

-- Indexes for performance
CREATE INDEX idx_retailer_activations_token ON retailer_activations(token);
CREATE INDEX idx_retailer_activations_email ON retailer_activations(email);
CREATE INDEX idx_retailer_profiles_user_id ON retailer_profiles(user_id);
CREATE INDEX idx_retailer_analytics_events_retailer_id ON retailer_analytics_events(retailer_id);
CREATE INDEX idx_retailer_analytics_events_created_at ON retailer_analytics_events(created_at);
CREATE INDEX idx_retailer_customer_links_retailer_id ON retailer_customer_links(retailer_id);
CREATE INDEX idx_retailer_customer_links_customer_id ON retailer_customer_links(customer_user_id);

-- Add retailer columns to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_retailer BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);