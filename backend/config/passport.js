const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user');

module.exports = function() {
  // Google Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
    scope: ['profile', 'email']
  }, 
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: profile.emails[0].value });
      
      if (!user) {
        // Create new user if doesn't exist
        user = new User({
          email: profile.emails[0].value,
          password: 'socialauth', // This is just a placeholder, not actually used for login
          provider: 'google',
          providerId: profile.id
        });
        await user.save();
      } else if (!user.providerId) {
        // Update existing user with provider info
        user.provider = 'google';
        user.providerId = profile.id;
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
  
  // GitHub Strategy
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/api/auth/github/callback`,
    scope: ['user:email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Get primary email from GitHub
      const email = profile.emails && profile.emails[0].value;
      
      if (!email) {
        return done(new Error('No email available from GitHub'), null);
      }
      
      // Check if user already exists
      let user = await User.findOne({ email: email });
      
      if (!user) {
        // Create new user
        user = new User({
          email: email,
          password: 'socialauth', // This is just a placeholder
          provider: 'github',
          providerId: profile.id
        });
        await user.save();
      } else if (!user.providerId) {
        // Update existing user with provider info
        user.provider = 'github';
        user.providerId = profile.id;
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};