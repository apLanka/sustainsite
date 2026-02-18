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
import {
  authenticate,
  requireDataEntry,
  requireAdmin,
  authorize,
} from '../middleware';
import { UserRole } from '../types';

const router = Router();

// ==================== Compliance Checklists ====================

/**
 * @route   POST /api/compliance/checklists
 * @desc    Create a compliance checklist
 * @access  ADMIN, PROJECT_MANAGER, INSPECTOR
 */
router.post('/checklists', authenticate, requireDataEntry(), createChecklist);

/**
 * @route   GET /api/compliance/checklists
 * @desc    Get all compliance checklists
 * @access  Authenticated users
 */
router.get('/checklists', authenticate, getChecklists);

/**
 * @route   GET /api/compliance/checklists/:id
 * @desc    Get checklist by ID
 * @access  Authenticated users
 */
router.get('/checklists/:id', authenticate, getChecklistById);

/**
 * @route   PUT /api/compliance/checklists/:id
 * @desc    Update compliance checklist
 * @access  ADMIN, PROJECT_MANAGER, INSPECTOR
 */
router.put('/checklists/:id', authenticate, requireDataEntry(), updateChecklist);

/**
 * @route   DELETE /api/compliance/checklists/:id
 * @desc    Delete compliance checklist
 * @access  ADMIN only
 */
router.delete('/checklists/:id', authenticate, requireAdmin(), deleteChecklist);

// ==================== Safety Inspections ====================

/**
 * @route   POST /api/compliance/inspections
 * @desc    Create a safety inspection
 * @access  ADMIN, INSPECTOR
 */
router.post(
  '/inspections',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INSPECTOR),
  createInspection
);

/**
 * @route   GET /api/compliance/inspections
 * @desc    Get all safety inspections
 * @access  Authenticated users
 */
router.get('/inspections', authenticate, getInspections);

/**
 * @route   GET /api/compliance/inspections/:id
 * @desc    Get inspection by ID
 * @access  Authenticated users
 */
router.get('/inspections/:id', authenticate, getInspectionById);

/**
 * @route   PUT /api/compliance/inspections/:id
 * @desc    Update safety inspection
 * @access  ADMIN, INSPECTOR
 */
router.put(
  '/inspections/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.INSPECTOR),
  updateInspection
);

/**
 * @route   DELETE /api/compliance/inspections/:id
 * @desc    Delete safety inspection
 * @access  ADMIN only
 */
router.delete('/inspections/:id', authenticate, requireAdmin(), deleteInspection);

export default router;
