import { Router } from 'express';
import { createInspection, getInspections, getInspectionById, updateInspection, deleteInspection, getHighRiskInspections, } from '../controllers/compliance.controller';
import { authenticate, authorize, requireAdmin } from '../middleware';
import { UserRole } from '../types';
const router = Router();
router.post('/inspection', authenticate, authorize(UserRole.ADMIN, UserRole.INSPECTOR), createInspection);
router.get('/:projectId', authenticate, (req, _res, next) => {
    req.query.projectId = req.params.projectId;
    next();
}, getInspections);
router.get('/:projectId/high-risk', authenticate, getHighRiskInspections);
router.get('/inspection/:id', authenticate, getInspectionById);
router.put('/inspection/:id', authenticate, authorize(UserRole.ADMIN, UserRole.INSPECTOR), updateInspection);
router.delete('/inspection/:id', authenticate, requireAdmin(), deleteInspection);
export default router;
