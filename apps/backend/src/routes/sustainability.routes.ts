import { Router } from 'express';
import {
  createMetric,
  getMetrics,
  getMetricById,
  updateMetric,
  deleteMetric,
  getProjectMetrics,
  getLatestProjectMetric,
  getProjectSustainabilityScore,
  getProjectTrends,
  calculateImpact
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

/**
 * @route   GET /api/sustainability/projects/:projectId/metrics/latest
 * @desc    Get most recent metrics for a specific project
 * @access  Project members
 */
router.get(
  '/projects/:projectId/metrics/latest',
  authenticate,
  checkProjectMembership('params.projectId'),
  getLatestProjectMetric
);

/**
 * @route   GET /api/sustainability/projects/:projectId/score
 * @desc    Get current sustainability score for project
 * @access  Project members
 */
router.get(
  '/projects/:projectId/score',
  authenticate,
  checkProjectMembership('params.projectId'),
  getProjectSustainabilityScore
);

/**
 * @route   GET /api/sustainability/projects/:projectId/trends
 * @desc    Get metric trends for project
 * @access  Project members
 */
router.get(
  '/projects/:projectId/trends',
  authenticate,
  checkProjectMembership('params.projectId'),
  getProjectTrends
);

/**
 * @route   POST /api/sustainability/calculate-impact
 * @desc    Calculate theoretical impact based on input body
 * @access  Authenticated users
 */
router.post(
  '/calculate-impact',
  authenticate,
  calculateImpact
);

export default router;
