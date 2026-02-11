import { Router } from 'express';
import {
  createMetric,
  getMetrics,
  getMetricById,
  updateMetric,
  deleteMetric,
  getProjectMetrics,
} from '../controllers/sustainability.controller';
import {
  authenticate,
  requireDataEntry,
  requireAdmin,
  checkProjectMembership,
} from '../middleware';

const router = Router();

/**
 * @route   POST /api/sustainability/metrics
 * @desc    Create sustainability metric
 * @access  ADMIN, PROJECT_MANAGER, INSPECTOR
 */
router.post('/', authenticate, requireDataEntry(), createMetric);

/**
 * @route   GET /api/sustainability/metrics
 * @desc    Get all sustainability metrics
 * @access  Authenticated users
 */
router.get('/', authenticate, getMetrics);

/**
 * @route   GET /api/sustainability/metrics/:id
 * @desc    Get metric by ID
 * @access  Authenticated users
 */
router.get('/:id', authenticate, getMetricById);

/**
 * @route   PUT /api/sustainability/metrics/:id
 * @desc    Update sustainability metric
 * @access  ADMIN, PROJECT_MANAGER, INSPECTOR
 */
router.put('/:id', authenticate, requireDataEntry(), updateMetric);

/**
 * @route   DELETE /api/sustainability/metrics/:id
 * @desc    Delete sustainability metric
 * @access  ADMIN only
 */
router.delete('/:id', authenticate, requireAdmin(), deleteMetric);

/**
 * @route   GET /api/sustainability/projects/:projectId/metrics
 * @desc    Get all metrics for a specific project
 * @access  Project members
 */
router.get(
  '/projects/:projectId/metrics',
  authenticate,
  checkProjectMembership('params.projectId'),
  getProjectMetrics
);

export default router;
