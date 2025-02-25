// routes/auth.js
import express from 'express';
import {
  registerUser,
  confirmRegistration,
  resendConfirmationCode,
  loginUser,
  forgotPassword,
  confirmForgotPassword,
  getUserInfo
} from '../services/cognito.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { validateRegistration, validateLogin } from '../utils/validators.js';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /api/auth/register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, preferred_username } = req.body;
    
    // Validate input
    const validationError = validateRegistration(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    
    // Register with Cognito - without the custom attribute
    const cognitoResult = await registerUser(email, password, { preferred_username });
    
    if (!cognitoResult.success) {
      return res.status(400).json({ error: cognitoResult.error });
    }

    // Add user to the appropriate group
    // Note: For auto-confirmed users, add them immediately
    // For users requiring verification, you might want to add them after verification
    if (cognitoResult.userConfirmed) {
      const groupResult = await addUserToGroup(email, 'Users'); // Default group
      if (!groupResult.success) {
        logger.warn('Failed to add user to group', { email, error: groupResult.error });
        // Continue anyway since the user was created
      }
    }
    
    // Success response
    res.status(201).json({
      message: 'User registered. Please check your email for verification code.',
      userSub: cognitoResult.userSub,
      userConfirmed: cognitoResult.userConfirmed
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// GET /api/auth/verify - Confirm registration via link
router.get('/verify', async (req, res) => {
  try {
    const { code, username } = req.query;
    
    if (!username || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }
    
    // Confirm with Cognito
    const result = await confirmRegistration(username, code);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    // Add the verified user to the Users group
    const groupResult = await addUserToGroup(username, 'Users');
    if (!groupResult.success) {
      logger.warn('Failed to add verified user to group', { email: username, error: groupResult.error });
    }
    
    // Check if user already exists in our database before creating
    let user = await User.findOne({ email: username });
    
    if (!user) {
      // Create a new user entry in our database only if they don't exist
      console.log("Verify", userInfo.user)
      user = new User({
        cognitoId: userInfo.user.sub,
        email,
        name: userInfo.user.preferred_username || email.split('@')[0],
        photo: userInfo.user.picture || null,
        role: userInfo.user['custom:role'] || 'Undecided', // Changed from 'member' to match ROLES in frontend
        contact: {
          email: email,
          phone: userInfo.user.phone_number || null,
          slack: userInfo.user['custom:slack'] || null
        },
        skills: userInfo.user['custom:skills'] ? userInfo.user['custom:skills'].split(',') : [],
        intro: '', // Add default intro field instead of bio
        teamNeeds: {
          needsPM: false,
          needsDev: false
        },
        ideaStatus: 'few' // Set default to match enum
      });      
      
      await newUser.save();
    }
    
    // Redirect the user to the login page with a success message
    res.redirect('/sandbox-headstart/?verified=true');
  } catch (error) {
    logger.error('Verification error', { error: error.message });
    res.redirect('/sandbox-headstart/?verified=false&error=' + encodeURIComponent(error.message));
  }
});

// POST /api/auth/resend-code - Resend verification code
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const result = await resendConfirmationCode(email);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json({ message: 'Verification code has been resent to your email' });
  } catch (error) {
    logger.error('Resend verification code error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    const validationError = validateLogin(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    
    // Authenticate with Cognito
    const result = await loginUser(email, password);
    
    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }
    
    // Get user info using the access token
    const userInfo = await getUserInfo(result.tokens.accessToken);
    
    if (!userInfo.success) {
      return res.status(500).json({ error: 'Failed to retrieve user information' });
    }
    
    // Find or create user in our database
    let user = await User.findOne({ cognitoId: userInfo.user.sub });

    if (!user) {
      user = await User.findOne({ 'contact.email': email });
      
      // If found by email but cognitoId doesn't match, update it
      if (user && user.cognitoId !== userInfo.user.sub) {
        user.cognitoId = userInfo.user.sub;
        // Log this unusual situation
        logger.warn('User found by email but cognitoId was different - updated', {
          email,
          oldCognitoId: user.cognitoId,
          newCognitoId: userInfo.user.sub
        });
      }
    }    
    
    if (!user) {
      // Create new user with schema-compliant fields
      console.log("Login", userInfo.user)
      user = new User({
        cognitoId: userInfo.user.sub,
        email,
        name: userInfo.user.preferred_username || email.split('@')[0],
        photo: userInfo.user.picture || null,
        role: userInfo.user['custom:role'] || 'Undecided', // Changed from 'member' to match ROLES in frontend
        contact: {
          email: email,
          phone: userInfo.user.phone_number || null,
          slack: userInfo.user['custom:slack'] || null
        },
        skills: userInfo.user['custom:skills'] ? userInfo.user['custom:skills'].split(',') : [],
        intro: '', // Add default intro field instead of bio
        teamNeeds: {
          needsPM: false,
          needsDev: false
        },
        ideaStatus: 'few' // Set default to match enum
      });      
      await user.save();
    } else {
      // Update existing user
      user.lastLogin = new Date(); // Add this field to schema if you need it
      user.groups = userInfo.user.groups || [];
      user.name = userInfo.user.name || user.name;
      user.photo = userInfo.user.picture || user.photo;
      user.contact.email = email;
      if (userInfo.user.phone_number) user.contact.phone = userInfo.user.phone_number;
      if (userInfo.user['custom:slack']) user.contact.slack = userInfo.user['custom:slack'];
      if (userInfo.user['custom:skills']) user.skills = userInfo.user['custom:skills'].split(',');
      await user.save();
    }
    
    // Return tokens and user info
    res.json({
      tokens: result.tokens,
      user: {
        id: user._id,
        cognitoId: user.cognitoId,
        email: user.email,
        name: user.name,
        photo: user.photo,
        intro: user.intro,
        role: user.role,
        teamNeeds: user.teamNeeds,
        skills: user.skills,
        contact: user.contact,
        matchPercentage: user.matchPercentage,
        background: user.background,
        hoursPerWeek: user.hoursPerWeek,
        ideaStatus: user.ideaStatus,
        groups: user.groups
      }
    });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    res.status(500).json({ error: 'Server error during login' });
  }
});

// POST /api/auth/forgot-password - Send password reset code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const result = await forgotPassword(email);
    
    // Always return success to prevent user enumeration
    res.json({ message: 'If your email exists in our system, a password reset code has been sent' });
  } catch (error) {
    logger.error('Forgot password error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/reset-password - Reset password with code
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }
    
    const result = await confirmForgotPassword(email, code, newPassword);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    logger.error('Reset password error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me - Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findOne({ cognitoId: req.user.id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    logger.error('Get current user error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;