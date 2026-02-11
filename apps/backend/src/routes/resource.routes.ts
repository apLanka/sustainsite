import { Router } from 'express';
import {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  updateMaterialStatus,
  recordMaterialUsage,
  createEquipment,
  getEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  assignEquipment,
  scheduleMaintenanceForEquipment,
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  rateSupplier,
} from '../controllers/resource.controller';
import {
  authenticate,
  requireManager,
  requireAdmin,
  authorize,
} from '../middleware';
import { UserRole } from '../types';

const router = Router();

// ==================== Materials ====================

/**
 * @route   POST /api/resources/materials
 * @desc    Create a material
 * @access  ADMIN, PROJECT_MANAGER
 */
router.post('/materials', authenticate, requireManager(), createMaterial);

/**
 * @route   GET /api/resources/materials
 * @desc    Get all materials
 * @access  Authenticated users
 */
router.get('/materials', authenticate, getMaterials);

/**
 * @route   GET /api/resources/materials/:id
 * @desc    Get material by ID
 * @access  Authenticated users
 */
router.get('/materials/:id', authenticate, getMaterialById);

/**
 * @route   PUT /api/resources/materials/:id
 * @desc    Update material
 * @access  ADMIN, PROJECT_MANAGER
 */
router.put('/materials/:id', authenticate, requireManager(), updateMaterial);

/**
 * @route   DELETE /api/resources/materials/:id
 * @desc    Delete material
 * @access  ADMIN only
 */
router.delete('/materials/:id', authenticate, requireAdmin(), deleteMaterial);

/**
 * @route   PUT /api/resources/materials/:id/status
 * @desc    Update material status
 * @access  ADMIN, PROJECT_MANAGER, SUPPLIER (for their materials)
 */
router.put(
  '/materials/:id/status',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.SUPPLIER),
  updateMaterialStatus
);

/**
 * @route   POST /api/resources/materials/:id/usage
 * @desc    Record material usage
 * @access  ADMIN, PROJECT_MANAGER
 */
router.post('/materials/:id/usage', authenticate, requireManager(), recordMaterialUsage);

// ==================== Equipment ====================

/**
 * @route   POST /api/resources/equipment
 * @desc    Create equipment
 * @access  ADMIN, PROJECT_MANAGER
 */
router.post('/equipment', authenticate, requireManager(), createEquipment);

/**
 * @route   GET /api/resources/equipment
 * @desc    Get all equipment
 * @access  Authenticated users
 */
router.get('/equipment', authenticate, getEquipment);

/**
 * @route   GET /api/resources/equipment/:id
 * @desc    Get equipment by ID
 * @access  Authenticated users
 */
router.get('/equipment/:id', authenticate, getEquipmentById);

/**
 * @route   PUT /api/resources/equipment/:id
 * @desc    Update equipment
 * @access  ADMIN, PROJECT_MANAGER
 */
router.put('/equipment/:id', authenticate, requireManager(), updateEquipment);

/**
 * @route   DELETE /api/resources/equipment/:id
 * @desc    Delete equipment
 * @access  ADMIN only
 */
router.delete('/equipment/:id', authenticate, requireAdmin(), deleteEquipment);

/**
 * @route   POST /api/resources/equipment/:id/assign
 * @desc    Assign equipment to project
 * @access  ADMIN, PROJECT_MANAGER
 */
router.post('/equipment/:id/assign', authenticate, requireManager(), assignEquipment);

/**
 * @route   POST /api/resources/equipment/:id/maintenance
 * @desc    Schedule maintenance for equipment
 * @access  ADMIN, PROJECT_MANAGER
 */
router.post(
  '/equipment/:id/maintenance',
  authenticate,
  requireManager(),
  scheduleMaintenanceForEquipment
);

// ==================== Suppliers ====================

/**
 * @route   POST /api/resources/suppliers
 * @desc    Create a supplier
 * @access  ADMIN, PROJECT_MANAGER
 */
router.post('/suppliers', authenticate, requireManager(), createSupplier);

/**
 * @route   GET /api/resources/suppliers
 * @desc    Get all suppliers
 * @access  Authenticated users
 */
router.get('/suppliers', authenticate, getSuppliers);

/**
 * @route   GET /api/resources/suppliers/:id
 * @desc    Get supplier by ID
 * @access  Authenticated users
 */
router.get('/suppliers/:id', authenticate, getSupplierById);

/**
 * @route   PUT /api/resources/suppliers/:id
 * @desc    Update supplier
 * @access  ADMIN, PROJECT_MANAGER
 */
router.put('/suppliers/:id', authenticate, requireManager(), updateSupplier);

/**
 * @route   DELETE /api/resources/suppliers/:id
 * @desc    Delete supplier
 * @access  ADMIN only
 */
router.delete('/suppliers/:id', authenticate, requireAdmin(), deleteSupplier);

/**
 * @route   POST /api/resources/suppliers/:id/rating
 * @desc    Rate a supplier
 * @access  ADMIN, PROJECT_MANAGER
 */
router.post('/suppliers/:id/rating', authenticate, requireManager(), rateSupplier);

export default router;
