import { Router } from 'express';
import {
  createChecklist,
  getChecklists,
  getChecklistById,
  updateChecklist,
  deleteChecklist,
  createInspection,
  getInspections,
  getInspectionById,
  updateInspection,
  deleteInspection,
} from '../controllers/compliance.controller';
import { authenticate, requireDataEntry, requireAdmin, authorize } from '../middleware';
import { UserRole } from '../types';

const router = Router();

router.post('/checklists', authenticate, requireDataEntry(), createChecklist);

router.get('/checklists', authenticate, getChecklists);

router.get('/checklists/:id', authenticate, getChecklistById);

router.put('/checklists/:id', authenticate, requireDataEntry(), updateChecklist);

router.delete('/checklists/:id', authenticate, requireAdmin(), deleteChecklist);

router.post(
  '/inspections',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INSPECTOR),
  createInspection
);

router.get('/inspections', authenticate, getInspections);

router.get('/inspections/:id', authenticate, getInspectionById);

router.put(
  '/inspections/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INSPECTOR),
  updateInspection
);

router.delete('/inspections/:id', authenticate, requireAdmin(), deleteInspection);

export default router;
