import { Router } from 'express';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';
import {
  previewUpload,
  confirmImport,
  getImportLogs,
  verifyScheme,
  downloadTemplate,
  loadPredefinedDataset,
} from '../controllers/importController.js';

const router = Router();

// Protect all import routes with admin role authorization
router.use(verifyToken, requireAdmin);

router.post('/preview', previewUpload);
router.post('/confirm', confirmImport);
router.get('/logs', getImportLogs);
router.get('/template', downloadTemplate);
router.get('/template/:format', downloadTemplate);
router.get('/predefined/:dataset', loadPredefinedDataset);
router.post('/load-predefined', loadPredefinedDataset);
router.patch('/verify/:id', verifyScheme);
router.patch('/schemes/:id/verify', verifyScheme);

export default router;
