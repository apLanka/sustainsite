import { Router } from 'express';
import {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  updateMaterialStatus,
  recordMaterialUsage,
  getLowStockMaterials,
  getCostSummary,
} from '../controllers/resource.controller';
import { authenticate, requireManager, requireAdmin, authorize } from '../middleware';
import { UserRole } from '../types';

const router = Router();

router.post('/', authenticate, requireManager(), createMaterial);

router.get('/', authenticate, getMaterials);

// Must be before /:id
router.get('/list/low-stock', authenticate, getLowStockMaterials);

router.get('/:id', authenticate, getMaterialById);

router.put('/:id', authenticate, requireManager(), updateMaterial);

router.delete('/:id', authenticate, requireAdmin(), deleteMaterial);

router.put(
  '/:id/status',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.SUPPLIER),
  updateMaterialStatus
);

router.post('/:id/usage', authenticate, requireManager(), recordMaterialUsage);

router.get('/:projectId/cost-summary', authenticate, getCostSummary);

export default router;
