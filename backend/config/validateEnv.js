/**
 * Environment variable validation module
 * Checks if all required environment variables are set
 */
const validateEnv = () => {
  const requiredEnvVars = [
    'MONGO_URI',
    'TOKEN_SECRET',
  ];
  
  // Optional vars (app works without these but with reduced functionality)
  const optionalEnvVars = [
    'PORT',
    'EMAIL_USER',
    'EMAIL_PASS',
    'GEMINI_API_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'FRONTEND_URL',
    'BACKEND_URL'
  ];
  
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    console.error('Error: Missing required environment variables:');
    missingVars.forEach(v => console.error(`- ${v}`));
    console.error('Please set these variables in your .env file');
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
  
  // Just log a warning for optional vars
  const missingOptionalVars = optionalEnvVars.filter(envVar => !process.env[envVar]);
  if (missingOptionalVars.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn('Notice: Some optional environment variables are not set:');
    missingOptionalVars.forEach(v => console.warn(`- ${v}`));
  }
  
  return true;
};

module.exports = validateEnv;