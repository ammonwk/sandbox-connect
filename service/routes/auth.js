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
import { body, query, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiters for authentication endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP
  message: { error: 'Too many login attempts, please try again later' }
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per IP
  message: { error: 'Too many password reset attempts, please try again later' }
});

// Security helper function to sanitize MongoDB fields
const sanitizeMongoObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  // Replace MongoDB operators in keys
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const safeKey = key.replace(/^\$/, '');
    sanitized[safeKey] = typeof value === 'object' && value !== null 
      ? sanitizeMongoObject(value) 
      : value;
  }
  return sanitized;
};

// POST /api/auth/register - Register a new user
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('preferred_username').trim().escape().optional()
  ],
  async (req, res) => {
    try {
      // Validate with express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }
      
      const { email, password, preferred_username } = req.body;
      
      // Additional validation from existing validators
      const validationError = validateRegistration(req.body);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }
      
      // Register with Cognito - without the custom attribute
      const cognitoResult = await registerUser(email, password, { 
        preferred_username: preferred_username?.substring(0, 50) // Limit username length
      });
      
      if (!cognitoResult.success) {
        return res.status(400).json({ error: cognitoResult.error });
      }

      // Add user to the appropriate group
      if (cognitoResult.userConfirmed) {
        const groupResult = await addUserToGroup(email, 'Users'); // Default group
        if (!groupResult.success) {
          logger.warn('Failed to add user to group', { email, error: groupResult.error });
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
  }
);

// GET /api/auth/verify - Confirm registration via link
router.get(
  '/verify',
  [
    query('username').isEmail().normalizeEmail(),
    query('code').trim().escape().isLength({ min: 6, max: 6 }).isNumeric()
  ],
  async (req, res) => {
    try {
      // Validate inputs with express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.redirect('/?verified=false&error=Invalid verification parameters');
      }
      
      const { code, username } = req.query;
      
      // Confirm with Cognito
      const result = await confirmRegistration(username, code);
      
      if (!result.success) {
        return res.redirect('/?verified=false&error=Verification failed');
      }
      
      // Add the verified user to the Users group
      const groupResult = await addUserToGroup(username, 'Users');
      if (!groupResult.success) {
        logger.warn('Failed to add verified user to group', { email: username, error: groupResult.error });
      }
      
      // Check if user already exists in our database before creating
      let user = await User.findOne({ email: username });
      
      if (!user) {
        logger.info('User not found in database, creating new user', { email: username });
        // Create new user with schema-compliant fields
        const displayName = username.split('@')[0].substring(0, 50); // Limit length
        
        user = new User({
          email: username,
          name: displayName,
          role: 'Undecided',
          contact: { email: username },
          skills: [],
          intro: '',
          teamNeeds: {
            needsPM: false,
            needsDev: false
          },
          ideaStatus: 'few'
        });
        await user.save();
      }
      
      // Redirect the user to the login page with a success message
      res.redirect('/?verified=true');
    } catch (error) {
      logger.error('Verification error', { error: error.message });
      res.redirect('/?verified=false&error=Verification failed');
    }
  }
);

// POST /api/auth/resend-code - Resend verification code
router.post(
  '/resend-code',
  [body('email').isEmail().normalizeEmail()],
  passwordResetLimiter,
  async (req, res) => {
    try {
      // Validate inputs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Valid email is required' });
      }
      
      const { email } = req.body;
      
      const result = await resendConfirmationCode(email);
      
      // Always return success to prevent user enumeration
      res.json({ message: 'If your email exists in our system, a verification code has been sent' });
    } catch (error) {
      logger.error('Resend verification code error', { error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// POST /api/auth/login - User login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 1 })
  ],
  loginLimiter,
  async (req, res) => {
    try {
      // Validate with express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid email or password format' });
      }
      
      const { email, password } = req.body;
      
      // Additional validation from existing validators
      const validationError = validateLogin(req.body);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }
      
      // Authenticate with Cognito
      const result = await loginUser(email, password);
      
      if (!result.success) {
        return res.status(401).json({ error: 'Invalid credentials' }); // Generic error to prevent enumeration
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
        
        if (user && user.cognitoId !== userInfo.user.sub) {
          user.cognitoId = userInfo.user.sub;
          logger.warn('User found by email but cognitoId was different - updated', {
            email,
            oldCognitoId: user.cognitoId,
            newCognitoId: userInfo.user.sub
          });
        }
      }    
      
      if (!user) {
        // Sanitize and limit user data
        const displayName = (userInfo.user.preferred_username || email.split('@')[0]).substring(0, 50);
        const userSkills = userInfo.user['custom:skills'] 
          ? userInfo.user['custom:skills'].split(',').map(s => s.trim().substring(0, 50)).slice(0, 20)
          : [];
        
        // Create new user with schema-compliant fields
        user = new User({
          cognitoId: userInfo.user.sub,
          email,
          name: displayName,
          photo: userInfo.user.picture || null,
          role: userInfo.user['custom:role'] || 'Undecided',
          contact: {
            email: email,
            phone: userInfo.user.phone_number || null,
            slack: (userInfo.user['custom:slack'] || '').substring(0, 50)
          },
          skills: userSkills,
          intro: '',
          teamNeeds: {
            needsPM: false,
            needsDev: false
          },
          ideaStatus: 'few'
        });      
        await user.save();
      } else {
        // Sanitize and update existing user
        user.lastLogin = new Date();
        user.groups = Array.isArray(userInfo.user.groups) ? userInfo.user.groups.slice(0, 10) : [];
        user.name = (userInfo.user.name || user.name).substring(0, 50);
        user.photo = userInfo.user.picture || user.photo;
        user.contact.email = email;
        
        if (userInfo.user.phone_number) {
          user.contact.phone = userInfo.user.phone_number.substring(0, 20);
        }
        
        if (userInfo.user['custom:slack']) {
          user.contact.slack = userInfo.user['custom:slack'].substring(0, 50);
        }
        
        if (userInfo.user['custom:skills']) {
          user.skills = userInfo.user['custom:skills']
            .split(',')
            .map(s => s.trim().substring(0, 50))
            .slice(0, 20);
        }
        
        await user.save();
      }
      
      // Return tokens and user info (exclude sensitive fields)
      const userResponse = user.toObject();
      delete userResponse.__v;
      delete userResponse.password;
      
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
  }
);

// POST /api/auth/forgot-password - Send password reset code
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  passwordResetLimiter,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Valid email is required' });
      }
      
      const { email } = req.body;
      
      const result = await forgotPassword(email);
      
      // Always return success to prevent user enumeration
      res.json({ message: 'If your email exists in our system, a password reset code has been sent' });
    } catch (error) {
      logger.error('Forgot password error', { error: error.message });
      // Still return success to prevent user enumeration
      res.json({ message: 'If your email exists in our system, a password reset code has been sent' });
    }
  }
);

// POST /api/auth/reset-password - Reset password with code
router.post(
  '/reset-password',
  [
    body('email').isEmail().normalizeEmail(),
    body('code').trim().escape().isLength({ min: 6, max: 6 }).isNumeric(),
    body('newPassword').isLength({ min: 8 })
  ],
  passwordResetLimiter,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input parameters' });
      }
      
      const { email, code, newPassword } = req.body;
      
      const result = await confirmForgotPassword(email, code, newPassword);
      
      if (!result.success) {
        return res.status(400).json({ error: 'Password reset failed' });
      }
      
      res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
      logger.error('Reset password error', { error: error.message });
      res.status(500).json({ error: 'Password reset failed' });
    }
  }
);

// GET /api/auth/me - Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findOne({ cognitoId: req.user.id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user without sensitive fields
    const userResponse = user.toObject();
    delete userResponse.__v;
    delete userResponse.password;
    
    res.json({ user: userResponse });
  } catch (error) {
    logger.error('Get current user error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;