import { Router } from 'express';
import {
  createInspection,
  getInspections,
  getInspectionById,
  updateInspection,
  deleteInspection,
  getHighRiskInspections,
} from '../controllers/compliance.controller';
import { authenticate, authorize } from '../middleware';
import { UserRole } from '../types';
const router = Router();
router.post(
  '/inspection',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INSPECTOR),
  createInspection
);
router.get(
  '/:projectId',
  authenticate,
  (req, _res, next) => {
    Object.defineProperty(req, 'query', {
      value: { ...req.query, projectId: req.params.projectId },
      writable: true,
      configurable: true,
    });
    next();
  },
  getInspections
);
router.get('/:projectId/high-risk', authenticate, getHighRiskInspections);
router.get('/inspection/:id', authenticate, getInspectionById);
router.put(
  '/inspection/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INSPECTOR),
  updateInspection
);
router.delete('/inspection/:id', authenticate, authorize(UserRole.ADMIN, UserRole.INSPECTOR), deleteInspection);
export default router;
