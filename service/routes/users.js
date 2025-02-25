// routes/users.js
import express from 'express';
import multer from 'multer';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { uploadFile } from '../services/s3.js';
import logger from '../utils/logger.js';
import { body, param, validationResult } from 'express-validator'; // Add this
import DOMPurify from 'dompurify'; // Add this
import { JSDOM } from 'jsdom'; // Add this for DOMPurify

const router = express.Router();
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Configure multer with file type validation
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  // Only accept images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024
  },
  fileFilter
});

// GET /api/users/dashboard - Get list of users for the dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const users = await User.find({}).select('-__v'); // Exclude sensitive fields
    res.json({ users });
  } catch (error) {
    logger.error('Dashboard error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/:id - Get a single user profile
router.get(
  '/:id',
  protect,
  [
    param('id').isMongoId().withMessage('Invalid user ID format')
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const user = await User.findById(req.params.id).select('-__v');
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ user });
    } catch (error) {
      logger.error('Get user error', { error: error.message, userId: req.params.id });
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// POST /api/users/profile - Update the authenticated user's profile
router.post(
  '/profile', 
  protect,
  [
    body('name').optional().trim().escape().isLength({ max: 100 }),
    body('intro').optional().trim().isLength({ max: 250 }),
    body('background').optional().trim().isLength({ max: 5000 }),
    body('role').optional().trim().escape().isIn(['developer', 'designer', 'manager', 'other']),
    body('hoursPerWeek').optional().isInt({ min: 15, max: 65 }),
    body('ideaStatus').optional().isString()
  ],
  upload.single('photo'),
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { 
        name, 
        intro,
        background, 
        skills,
        role,
        hoursPerWeek, 
        ideaStatus,
        contact,
        teamNeeds: rawTeamNeeds 
      } = req.body;
      
      let photoUrl;
      
      // Sanitize text fields that might contain HTML
      const sanitizedIntro = intro ? purify.sanitize(intro) : undefined;
      const sanitizedBackground = background ? purify.sanitize(background) : undefined;
      
      // Validate maximum lengths after sanitization
      if (sanitizedIntro && sanitizedIntro.length > 250) {
        return res.status(400).json({ error: 'Intro exceeds 250 characters' });
      }
      
      if (sanitizedBackground && sanitizedBackground.length > 5000) {
        return res.status(400).json({ error: 'Background exceeds 5000 characters' });
      }
      
      // If a file is uploaded, validate and upload it to S3
      if (req.file) {
        try {
          photoUrl = await uploadFile(req.file);
        } catch (uploadError) {
          return res.status(400).json({ error: uploadError.message });
        }
      }
      
      // Parse and validate team needs
      let teamNeeds = {};
      if (rawTeamNeeds) {
        try {
          const parsedNeeds = typeof rawTeamNeeds === 'string' ? JSON.parse(rawTeamNeeds) : rawTeamNeeds;
          
          // Validate the structure
          if (typeof parsedNeeds !== 'object') {
            return res.status(400).json({ error: 'Team needs must be an object' });
          }
          
          // Only allow boolean values for known team need properties
          const allowedNeeds = ['needsPM', 'needsDev', 'needsDesigner', 'needsMarketing'];
          
          Object.keys(parsedNeeds).forEach(key => {
            if (allowedNeeds.includes(key) && typeof parsedNeeds[key] === 'boolean') {
              teamNeeds[key] = parsedNeeds[key];
            } else if (allowedNeeds.includes(key)) {
              teamNeeds[key] = parsedNeeds[key] === 'true';
            }
          });
        } catch (e) {
          return res.status(400).json({ error: 'Invalid team needs format' });
        }
      } else {
        // Handle individual needsPM/needsDev fields for backward compatibility
        if (req.body.needsPM !== undefined) {
          teamNeeds.needsPM = req.body.needsPM === 'true';
        }
        if (req.body.needsDev !== undefined) {
          teamNeeds.needsDev = req.body.needsDev === 'true';
        }
      }
      
      // Find user by Cognito ID from the token
      const user = await User.findOne({ cognitoId: req.user.id });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Update user fields with sanitized data
      if (name) user.name = name; // Already escaped by express-validator
      if (sanitizedIntro) user.intro = sanitizedIntro;
      if (sanitizedBackground) user.background = sanitizedBackground;
      if (photoUrl) user.photo = photoUrl;
      
      // Handle skills array - validate and sanitize
      if (skills) {
        try {
          const parsedSkills = Array.isArray(skills) ? skills : JSON.parse(skills);
          
          // Validate skills are strings and sanitize
          if (!Array.isArray(parsedSkills)) {
            return res.status(400).json({ error: 'Skills must be an array' });
          }
          
          user.skills = parsedSkills
            .filter(skill => typeof skill === 'string')
            .map(skill => purify.sanitize(skill.trim()).substring(0, 50)); // Limit skill length
        } catch (e) {
          return res.status(400).json({ error: 'Invalid skills format' });
        }
      }
      
      // Handle role - already validated
      if (role) user.role = role;
      
      // Handle hours per week - already validated
      if (hoursPerWeek) {
        user.hoursPerWeek = parseInt(hoursPerWeek);
      }
      
      // Handle idea status
      if (ideaStatus) {
        const ideaStatusMap = {
          'one, set in stone': 'one',
          'a few of them': 'few',
          'no, open to ideas': 'none',
          'one': 'one',
          'few': 'few',
          'none': 'none'
        };
        
        const sanitizedIdeaStatus = purify.sanitize(ideaStatus.toLowerCase());
        const mappedStatus = ideaStatusMap[sanitizedIdeaStatus];
        if (!mappedStatus) {
          return res.status(400).json({ error: 'Invalid idea status' });
        }
        user.ideaStatus = mappedStatus;
      }
      
      // Handle contact information
      if (contact) {
        try {
          const contactData = typeof contact === 'string' ? JSON.parse(contact) : contact;
          
          // Validate structure
          if (typeof contactData !== 'object') {
            return res.status(400).json({ error: 'Contact must be an object' });
          }
          
          // Sanitize and validate each field
          const sanitizedContact = {
            email: contactData.email ? purify.sanitize(contactData.email.trim()).substring(0, 100) : user.contact?.email,
            phone: contactData.phone ? purify.sanitize(contactData.phone.trim()).substring(0, 20) : user.contact?.phone,
            slack: contactData.slack ? purify.sanitize(contactData.slack.trim()).substring(0, 50) : user.contact?.slack
          };
          
          // Basic email validation
          if (sanitizedContact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedContact.email)) {
            return res.status(400).json({ error: 'Invalid email format' });
          }
          
          user.contact = sanitizedContact;
        } catch (e) {
          return res.status(400).json({ error: 'Invalid contact format' });
        }
      }
      
      // Update team needs
      if (Object.keys(teamNeeds).length > 0) {
        user.teamNeeds = {
          ...user.teamNeeds,
          ...teamNeeds
        };
      }
      
      // Save the updated user
      await user.save();
      
      // Return only necessary fields
      const userResponse = user.toObject();
      delete userResponse.__v;
      
      res.json({ user: userResponse });
    } catch (error) {
      logger.error('Update profile error', { error: error.message });
      res.status(500).json({ error: 'Server error' });
    }
  }
);

export default router;