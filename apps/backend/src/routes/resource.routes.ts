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
  createEquipment,
  getEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  assignEquipment,
  scheduleMaintenanceForEquipment,
  updateEquipmentStatus,
  getAvailableEquipment,
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  rateSupplier,
  getSupplierPerformance,
} from '../controllers/resource.controller';
import { authenticate, requireManager, requireAdmin, authorize } from '../middleware';
import { UserRole } from '../types';

const router = Router();

router.post('/materials', authenticate, requireManager(), createMaterial);

router.get('/materials', authenticate, getMaterials);

router.get('/materials/:id', authenticate, getMaterialById);

router.put('/materials/:id', authenticate, requireManager(), updateMaterial);

router.delete('/materials/:id', authenticate, requireAdmin(), deleteMaterial);

router.put(
  '/materials/:id/status',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.SUPPLIER),
  updateMaterialStatus
);

router.post('/materials/:id/usage', authenticate, requireManager(), recordMaterialUsage);

router.get('/materials/list/low-stock', authenticate, getLowStockMaterials);

router.get('/materials/:projectId/cost-summary', authenticate, getCostSummary);

router.post('/equipment', authenticate, requireManager(), createEquipment);

router.get('/equipment', authenticate, getEquipment);

router.get('/equipment/:id', authenticate, getEquipmentById);

router.put('/equipment/:id', authenticate, requireManager(), updateEquipment);

router.delete('/equipment/:id', authenticate, requireAdmin(), deleteEquipment);

router.post('/equipment/:id/assign', authenticate, requireManager(), assignEquipment);

router.post(
  '/equipment/:id/maintenance',
  authenticate,
  requireManager(),
  scheduleMaintenanceForEquipment
);

router.get('/equipment/list/available', authenticate, getAvailableEquipment);

router.put('/equipment/:id/status', authenticate, requireManager(), updateEquipmentStatus);

router.post('/suppliers', authenticate, requireManager(), createSupplier);

router.get('/suppliers', authenticate, getSuppliers);

router.get('/suppliers/:id', authenticate, getSupplierById);

router.put('/suppliers/:id', authenticate, requireManager(), updateSupplier);

router.delete('/suppliers/:id', authenticate, requireAdmin(), deleteSupplier);

router.post('/suppliers/:id/rating', authenticate, requireManager(), rateSupplier);

router.get('/suppliers/:id/performance', authenticate, getSupplierPerformance);

export default router;
