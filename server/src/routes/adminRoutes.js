import express from 'express';
import {
  getDashboardOverview,
  listAllAdminSchemes,
  createNewScheme,
  updateExistingScheme,
  toggleStatus,
  removeScheme,
  addSchemeCriteria,
  removeSchemeCriteria,
  addSchemeDocument,
  removeSchemeDocument,
  getCitizenRecords,
  getAdminReports,
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce authentication AND admin role on ALL /admin/* endpoints
router.use(authenticateToken);
router.use(requireRole('admin'));

// Analytics & Reports
router.get('/analytics', getDashboardOverview);
router.get('/reports', getAdminReports);

// Citizen records (legitimate administrative statistics)
router.get('/citizens', getCitizenRecords);

// Schemes CRUD
router.get('/schemes', listAllAdminSchemes);
router.post('/schemes', createNewScheme);
router.put('/schemes/:id', updateExistingScheme);
router.patch('/schemes/:id/status', toggleStatus);
router.delete('/schemes/:id', removeScheme);

// Scheme Criteria management
router.post('/schemes/:id/criteria', addSchemeCriteria);
router.delete('/criteria/:criteriaId', removeSchemeCriteria);

// Scheme Documents management
router.post('/schemes/:id/documents', addSchemeDocument);
router.delete('/documents/:docId', removeSchemeDocument);

export default router;

