import { Router } from 'express';
import {
  createInspection,
  getInspections,
  getInspectionById,
  updateInspection,
  deleteInspection,
  getHighRiskInspections,
} from '../controllers/compliance.controller';
import { authenticate, authorize, requireAdmin } from '../middleware';
import { UserRole } from '../types';

const router = Router();

// POST /api/safety/inspection
router.post(
  '/inspection',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INSPECTOR),
  createInspection
);

// GET /api/safety/:projectId — list all inspections for a project
// Must be before /inspection/:id to avoid route conflict
router.get('/:projectId', authenticate, (req, _res, next) => {
  req.query.projectId = req.params.projectId;
  next();
}, getInspections);

// GET /api/safety/:projectId/high-risk — unresolved High/Critical inspections
router.get('/:projectId/high-risk', authenticate, getHighRiskInspections);

// GET /api/safety/inspection/:id
router.get('/inspection/:id', authenticate, getInspectionById);

// PUT /api/safety/inspection/:id
router.put(
  '/inspection/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INSPECTOR),
  updateInspection
);

// DELETE /api/safety/inspection/:id (ADMIN only)
router.delete('/inspection/:id', authenticate, requireAdmin(), deleteInspection);

export default router;
