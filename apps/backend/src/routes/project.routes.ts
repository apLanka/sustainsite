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

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  ADMIN, PROJECT_MANAGER
 */
router.post('/', authenticate, requireManager(), createProject);

/**
 * @route   GET /api/projects
 * @desc    Get all projects (with pagination and filters)
 * @access  ADMIN, PROJECT_MANAGER, INSPECTOR, VIEWER
 */
router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.INSPECTOR, UserRole.VIEWER),
  getProjects
);

/**
 * @route   GET /api/projects/:id
 * @desc    Get project by ID
 * @access  Project members (manager or team member)
 */
router.get('/:id', authenticate, checkProjectMembership('params.id'), getProjectById);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Project manager or ADMIN
 */
router.put('/:id', authenticate, checkProjectManager('params.id'), updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 * @access  ADMIN only
 */
router.delete('/:id', authenticate, requireAdmin(), deleteProject);

/**
 * @route   POST /api/projects/:id/milestones
 * @desc    Add milestone to project
 * @access  Project manager or ADMIN
 */
router.post('/:id/milestones', authenticate, checkProjectManager('params.id'), addMilestone);

/**
 * @route   PUT /api/projects/:id/milestones/:milestoneId
 * @desc    Update milestone
 * @access  Project manager or ADMIN
 */
router.put(
  '/:id/milestones/:milestoneId',
  authenticate,
  checkProjectManager('params.id'),
  updateMilestone
);

/**
 * @route   GET /api/projects/:id/timeline
 * @desc    Get project timeline view
 * @access  Project members
 */
router.get('/:id/timeline', authenticate, checkProjectMembership('params.id'), getProjectTimeline);

export default router;
