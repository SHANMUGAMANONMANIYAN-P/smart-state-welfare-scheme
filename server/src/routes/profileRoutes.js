import express from 'express';
import { getProfile, updateProfile, getCompletion } from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected citizen profile endpoints
router.get('/', authenticateToken, getProfile);
router.put('/', authenticateToken, updateProfile);
router.get('/completion', authenticateToken, getCompletion);

export default router;

