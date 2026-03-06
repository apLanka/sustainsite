import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMilestone,
  updateMilestone,
  getProjectTimeline,
} from '../controllers/project.controller';
import {
  authenticate,
  authorize,
  requireManager,
  requireAdmin,
  checkProjectMembership,
  checkProjectManager,
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

export default router;
