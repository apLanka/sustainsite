import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/auth.controller';
import { validateRequest, registerSchema, loginSchema } from '../validation/auth.validation';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);

router.post('/login', validateRequest(loginSchema), login);

router.get('/me', authenticate, getCurrentUser);

export default router;
