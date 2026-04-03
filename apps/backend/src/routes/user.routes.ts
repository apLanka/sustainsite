import { Router } from 'express';
import { getUsers, getUserById, updateUser, deactivateUser } from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middleware';
const router = Router();
router.get('/', authenticate, requireAdmin(), getUsers);
router.get('/:id', authenticate, requireAdmin(), getUserById);
router.patch('/:id', authenticate, requireAdmin(), updateUser);
router.delete('/:id', authenticate, requireAdmin(), deactivateUser);
export default router;
