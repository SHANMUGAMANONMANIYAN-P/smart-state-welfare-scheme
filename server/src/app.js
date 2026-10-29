import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import eligibilityRoutes from './routes/eligibilityRoutes.js';
import savedSchemeRoutes from './routes/savedSchemeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import importRoutes from './routes/importRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import { getDbStatus } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check and database status endpoints
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Smart Welfare Scheme Eligibility Prediction Engine API',
    version: '1.0.0',
    database: getDbStatus(),
  });
});

app.get('/api/v1/db-status', (req, res) => {
  res.json({
    success: true,
    data: getDbStatus(),
  });
});

// Mount Version 1 REST API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/schemes', schemeRoutes);
app.use('/api/v1/eligibility', eligibilityRoutes);
app.use('/api/v1/saved-schemes', savedSchemeRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/admin/import', importRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/chatbot', chatbotRoutes);


// Serve static frontend build if dist folder exists
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      next();
    }
  });
});

// Centralized error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
