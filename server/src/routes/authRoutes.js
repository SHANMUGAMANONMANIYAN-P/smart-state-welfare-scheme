import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  getGoogleStatus,
  initiateGoogleAuth,
  handleGoogleCallback,
  authenticateGoogleCredential,
} from '../controllers/authController.js';
import { authenticateToken, authRateLimiter } from '../middleware/authMiddleware.js';

const router = express.Router();

// Google OAuth 2.0 routes
router.get('/google/status', getGoogleStatus);
router.get('/google', initiateGoogleAuth);
router.get('/google/callback', handleGoogleCallback);
router.post('/google/verify', authenticateGoogleCredential);

// Standard auth routes (preserved for admin fallback & automated integration tests)
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/logout', logout);

// Authenticated route
router.get('/me', authenticateToken, getMe);

export default router;
