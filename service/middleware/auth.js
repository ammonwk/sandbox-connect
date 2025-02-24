// middleware/auth.js
import jwt from 'jsonwebtoken';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import config from '../config/index.js';
import logger from '../utils/logger.js';

// Setup the Cognito JWT verifier if config values are available
let verifier;
try {
  if (config.aws?.cognito?.userPoolId && config.aws?.cognito?.clientId) {
    verifier = CognitoJwtVerifier.create({
      userPoolId: config.aws.cognito.userPoolId,
      tokenUse: 'access',
      clientId: config.aws.cognito.clientId
    });
    logger.info('Cognito JWT verifier initialized successfully');
  } else {
    logger.error('Missing Cognito configuration', { 
      userPoolId: config.aws?.cognito?.userPoolId,
      clientId: config.aws?.cognito?.clientId 
    });
  }
} catch (error) {
  logger.error('Failed to initialize Cognito JWT verifier', { error: error.message });
}

// Middleware to protect routes
export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }
    
    try {
      // Verify the JWT token with Cognito
      const payload = await verifier.verify(token);
      
      // Attach user info to the request
      req.user = {
        id: payload.sub,
        email: payload.email,
        // Include any other claims from the token you need
      };
      
      next();
    } catch (err) {
      logger.error('Token verification failed', { error: err.message });
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  } catch (error) {
    logger.error('Auth middleware error', { error: error.message });
    return res.status(500).json({ error: 'Server error' });
  }
};

// Optional middleware to check if the user is an admin
export const adminOnly = (req, res, next) => {
  if (req.user && req.user['cognito:groups'] && req.user['cognito:groups'].includes('Admins')) {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as an admin' });
  }
};