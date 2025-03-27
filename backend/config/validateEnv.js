/**
 * Environment variable validation module
 * Checks if all required environment variables are set
 */
const validateEnv = () => {
  const requiredEnvVars = [
    'PORT',
    'MONGO_URI',
    'TOKEN_SECRET',
    'EMAIL_USER',
    'EMAIL_PASS'
  ];
  
  // Optional vars (app works without these but with reduced functionality)
  const optionalEnvVars = [
    'GEMINI_API_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    console.error('Error: Missing required environment variables:');
    missingVars.forEach(v => console.error(`- ${v}`));
    console.error('Please set these variables in your .env file');
    process.exit(1);
  }
  
  // Just log a warning for optional vars
  const missingOptionalVars = optionalEnvVars.filter(envVar => !process.env[envVar]);
  if (missingOptionalVars.length > 0) {
    console.warn('Warning: Missing optional environment variables:');
    missingOptionalVars.forEach(v => console.warn(`- ${v}`));
    console.warn('Some features may be limited or disabled');
  }
  
  return true;
};

module.exports = validateEnv;