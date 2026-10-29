import express from 'express';
import { evaluate, history, historyDetail } from '../controllers/eligibilityController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected eligibility engine evaluation routes
router.post('/evaluate', authenticateToken, evaluate);
router.get('/history', authenticateToken, history);
router.get('/history/:id', authenticateToken, historyDetail);

export default router;
