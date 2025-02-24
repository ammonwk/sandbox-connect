// routes/users.js
import express from 'express';
import multer from 'multer';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { uploadFile } from '../services/s3.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB limit (will be resized if needed)
  }
});

// GET /api/users/dashboard - Get list of users for the dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    // You could add query filtering and sorting here
    const users = await User.find({});
    res.json({ users });
  } catch (error) {
    logger.error('Dashboard error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/:id - Get a single user profile
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    logger.error('Get user error', { error: error.message, userId: req.params.id });
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users/profile - Update the authenticated user's profile
router.post('/profile', protect, upload.single('photo'), async (req, res) => {
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
    
    // Validate maximum lengths
    if (intro && intro.length > 250) {
      return res.status(400).json({ error: 'Intro exceeds 250 characters' });
    }
    
    if (background && background.length > 5000) {
      return res.status(400).json({ error: 'Background exceeds 5000 characters' });
    }
    
    // If a file is uploaded, upload it to S3
    if (req.file) {
      try {
        photoUrl = await uploadFile(req.file);
      } catch (uploadError) {
        return res.status(400).json({ error: uploadError.message });
      }
    }
    
    // Parse team needs if provided
    let teamNeeds = {};
    if (rawTeamNeeds) {
      try {
        teamNeeds = typeof rawTeamNeeds === 'string' ? JSON.parse(rawTeamNeeds) : rawTeamNeeds;
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
    
    // Update user fields
    if (name) user.name = name;
    if (intro) user.intro = intro;
    if (background) user.background = background;
    if (photoUrl) user.photo = photoUrl;
    
    // Handle skills array
    if (skills) {
      try {
        user.skills = Array.isArray(skills) ? skills : JSON.parse(skills);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid skills format' });
      }
    }
    
    // Handle role
    if (role) user.role = role;
    
    // Handle hours per week
    if (hoursPerWeek) {
      const hours = parseInt(hoursPerWeek);
      if (isNaN(hours) || hours < 15 || hours > 65) {
        return res.status(400).json({ error: 'Hours per week must be between 15 and 65' });
      }
      user.hoursPerWeek = hours;
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
      
      const mappedStatus = ideaStatusMap[ideaStatus.toLowerCase()];
      if (!mappedStatus) {
        return res.status(400).json({ error: 'Invalid idea status' });
      }
      user.ideaStatus = mappedStatus;
    }
    
    // Handle contact information
    if (contact) {
      try {
        const contactData = typeof contact === 'string' ? JSON.parse(contact) : contact;
        user.contact = {
          email: contactData.email || user.contact?.email,
          phone: contactData.phone || user.contact?.phone,
          slack: contactData.slack || user.contact?.slack
        };
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
    
    res.json({ user });
  } catch (error) {
    logger.error('Update profile error', { error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;