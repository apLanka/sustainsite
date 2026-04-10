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

// ── Generic metric CRUD ──────────────────────────────────────────────────────
router.post('/', authenticate, requireDataEntry(), createMetric);

// T-09: /metrics alias (spec path) — maps to same createMetric handler
router.post('/metrics', authenticate, requireDataEntry(), createMetric);

router.get('/', authenticate, getMetrics);

router.get('/:id', authenticate, getMetricById);

router.put('/:id', authenticate, requireDataEntry(), updateMetric);

router.delete('/:id', authenticate, requireAdmin(), deleteMetric);

// ── Project-scoped routes ────────────────────────────────────────────────────
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

// T-06: Enriched score endpoint
router.get(
  '/projects/:projectId/score',
  authenticate,
  checkProjectMembership('params.projectId'),
  getProjectSustainabilityScore
);

// T-07: Aggregated trends with period/interval params
router.get(
  '/projects/:projectId/trends',
  authenticate,
  checkProjectMembership('params.projectId'),
  getProjectTrends
);

// T-08: Industry comparison
router.get(
  '/projects/:projectId/compare',
  authenticate,
  checkProjectMembership('params.projectId'),
  compareWithIndustry
);

// ── Impact calculator ────────────────────────────────────────────────────────
router.post('/calculate-impact', authenticate, calculateImpact);

export default router;
