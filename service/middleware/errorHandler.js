// middleware/errorHandler.js
import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Uncaught exception', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  // Determine status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Send appropriate response
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};