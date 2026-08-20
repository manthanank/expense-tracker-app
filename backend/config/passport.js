const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user');

module.exports = function() {
  const backendUrl = process.env.BACKEND_URL || (process.env.PORT ? `http://localhost:${process.env.PORT}` : 'http://localhost:5000');

  // Google Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${backendUrl}/api/auth/google/callback`,
      scope: ['profile', 'email']
    }, 
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0]?.value;
        if (!email) {
          return done(new Error('No email provided by Google'), null);
        }
        let user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
          user = new User({
            email: email.toLowerCase(),
            password: 'socialauth',
            provider: 'google',
            providerId: profile.id
          });
          await user.save();
        } else if (!user.providerId) {
          user.provider = 'google';
          user.providerId = profile.id;
          await user.save();
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }
  
  // GitHub Strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${backendUrl}/api/auth/github/callback`,
      scope: ['user:email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0]?.value;
        
        if (!email) {
          return done(new Error('No email available from GitHub'), null);
        }
        
        let user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
          user = new User({
            email: email.toLowerCase(),
            password: 'socialauth',
            provider: 'github',
            providerId: profile.id
          });
          await user.save();
        } else if (!user.providerId) {
          user.provider = 'github';
          user.providerId = profile.id;
          await user.save();
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }
  
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