// utils/logger.js
import winston from 'winston';
import config from '../config/index.js';

// Define log format
const logFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let meta = '';
  if (Object.keys(metadata).length > 0) {
    meta = JSON.stringify(metadata);
  }
  return `${timestamp} [${level}]: ${message} ${meta}`;
});

// Create the logger
const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    logFormat
  ),
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // File output in production
    ...(config.nodeEnv === 'production' ? [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' })
    ] : [])
    ],
    // Catch uncaught exceptions and unhandled rejections
    exceptionHandlers: [
    new winston.transports.Console(),
      ...(config.nodeEnv === 'production' ? [
        new winston.transports.File({ filename: 'logs/exceptions.log' })
      ] : [])
    ],
    // Don't exit on uncaught exceptions
    exitOnError: false
});

export default logger;