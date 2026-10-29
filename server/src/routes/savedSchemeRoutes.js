import express from 'express';
import { listSaved, save, remove } from '../controllers/savedSchemeController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected citizen saved schemes endpoints
router.get('/', authenticateToken, listSaved);
router.post('/', authenticateToken, save);
router.delete('/:schemeId', authenticateToken, remove);

export default router;
