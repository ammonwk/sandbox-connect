// index.js
import './loadEnv.js';  // Import this first to ensure environment variables are loaded

import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/index.js';
import logger from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Initialize Express app
const app = express();

// Apply compression
app.use(compression({ level: 6 }));

// Security middlewares
app.set('trust proxy', 'loopback');
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin: [
    config.frontendUrl, 
    new URL(config.frontendUrl).origin,
    'http://localhost:7000',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true,
});
app.use(limiter);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

try {
  // Connect to MongoDB
  mongoose.connect(config.mongoURI)
    .then(() => logger.info('MongoDB connected'))
    .catch(err => logger.error('MongoDB connection error:', { error: err.message }));

  // Mount API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);

  // Serve static files
  app.use('', express.static(path.join(__dirname, '../dist')));
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });

  // Error handling middleware
  app.use(errorHandler);

  // Start the server
  const port = config.port;
  app.listen(port, () => {
    logger.info(`Server running in ${config.nodeEnv} mode on port ${port}`);
  });
} catch (error) {
  console.error('Server failed to start:', error);
}

export default app;