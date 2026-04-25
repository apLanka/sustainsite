import { Router } from 'express';
import {
  addMilestone,
  createProject,
  deleteProject,
  getFinancialSummary,
  getProjectById,
  getProjects,
  getProjectTimeline,
  updateMilestone,
  updateProject,
} from '../controllers/project.controller';
import {
  authenticate,
  authorize,
  checkProjectManager,
  checkProjectMembership,
  requireAdmin,
  requireManager,
} from '../middleware';
import { UserRole } from '../types';
const router = Router();
router.post('/', authenticate, requireManager(), createProject);
router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.INSPECTOR, UserRole.VIEWER),
  getProjects
);
router.get(
  '/status/:status',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.INSPECTOR, UserRole.VIEWER),
  (req, _res, next) => {
    Object.defineProperty(req, 'query', {
      value: { ...req.query, status: req.params.status },
      writable: true,
      configurable: true,
    });
    next();
  },
  getProjects
);
router.get('/:id', authenticate, checkProjectMembership('params.id'), getProjectById);
router.put('/:id', authenticate, checkProjectManager('params.id'), updateProject);
router.delete('/:id', authenticate, requireAdmin(), deleteProject);
router.post('/:id/milestones', authenticate, checkProjectManager('params.id'), addMilestone);
router.put(
  '/:id/milestones/:milestoneId',
  authenticate,
  checkProjectManager('params.id'),
  updateMilestone
);
router.get('/:id/timeline', authenticate, checkProjectMembership('params.id'), getProjectTimeline);
router.get(
  '/:id/financial-summary',
  authenticate,
  checkProjectMembership('params.id'),
  getFinancialSummary
);
export default router;
