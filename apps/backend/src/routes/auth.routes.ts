import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/auth.controller';
import { validateRequest, registerSchema, loginSchema } from '../validation/auth.validation';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRequest(registerSchema), register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 */
router.post('/login', validateRequest(loginSchema), login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Protected
 */
router.get('/me', authenticate, getCurrentUser);

export default router;
