const axios = require('axios');

// Configure axios defaults for internal API calls
const configureAxios = () => {
  // Request interceptor to add auth headers automatically
  axios.interceptors.request.use(
    (config) => {
      // Add any default headers or auth tokens here if needed
      console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('❌ Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  axios.interceptors.response.use(
    (response) => {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      console.error('❌ API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
      return Promise.reject(error);
    }
  );

  console.log('✅ Axios interceptors configured');
};

module.exports = { configureAxios }; 