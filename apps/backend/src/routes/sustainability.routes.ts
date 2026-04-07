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
  compareWithIndustry,
  calculateImpact,
} from '../controllers/sustainability.controller';
import {
  authenticate,
  requireDataEntry,
  requireAdmin,
  checkProjectMembership,
} from '../middleware';
const router = Router();
router.post('/', authenticate, requireDataEntry(), createMetric);
router.post('/metrics', authenticate, requireDataEntry(), createMetric);
router.get('/', authenticate, getMetrics);
router.get('/:id', authenticate, getMetricById);
router.put('/:id', authenticate, requireDataEntry(), updateMetric);
router.delete('/:id', authenticate, requireAdmin(), deleteMetric);
router.get(
  '/projects/:projectId/metrics',
  authenticate,
  checkProjectMembership('params.projectId'),
  getProjectMetrics
);
router.get(
  '/projects/:projectId/metrics/latest',
  authenticate,
  checkProjectMembership('params.projectId'),
  getLatestProjectMetric
);
router.get(
  '/projects/:projectId/score',
  authenticate,
  checkProjectMembership('params.projectId'),
  getProjectSustainabilityScore
);
router.get(
  '/projects/:projectId/trends',
  authenticate,
  checkProjectMembership('params.projectId'),
  getProjectTrends
);
router.get(
  '/projects/:projectId/compare',
  authenticate,
  checkProjectMembership('params.projectId'),
  compareWithIndustry
);
router.post('/calculate-impact', authenticate, calculateImpact);
export default router;
