import express from 'express';
import { listSchemes, getScheme } from '../controllers/schemeController.js';

const router = express.Router();

// Public scheme discovery endpoints
router.get('/', listSchemes);
router.get('/:id', getScheme);

export default router;
