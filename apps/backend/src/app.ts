import express, { Application, Request, RequestHandler, Response } from 'express';
import { createRequire } from 'node:module';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/errorHandler';
import logger from './utils/logger';

dotenv.config();

const require = createRequire(__filename);
type SwaggerUiModule = {
  serve: RequestHandler | RequestHandler[];
  setup: (spec: object, ...args: unknown[]) => RequestHandler;
};
let swaggerUi: SwaggerUiModule | null = null;
let swaggerSpec: object | null = null;
try {
  swaggerUi = require('swagger-ui-express') as SwaggerUiModule;
  swaggerSpec = (require('./config/swagger') as { swaggerSpec: object }).swaggerSpec;
} catch {
  swaggerUi = null;
  swaggerSpec = null;
}
const app: Application = express();
app.set('etag', false);
const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    if (!origin) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}
const isRateLimitDisabled =
  process.env.DISABLE_RATE_LIMIT === 'true' ||
  process.env.NODE_ENV === 'test' ||
  process.env.NODE_ENV === 'development';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isRateLimitDisabled ? 10000 : 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isRateLimitDisabled ? 10000 : 5,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes.',
  },
});
if (!isRateLimitDisabled) {
  app.use('/api/', limiter);
}
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Sustainable Construction API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      projects: '/api/projects',
      sustainability: '/api/sustainability',
      documents: '/api/documents',
      compliance: '/api/compliance',
      safety: '/api/safety',
      materials: '/api/materials',
      equipment: '/api/equipment',
      suppliers: '/api/suppliers',
      resources: '/api/resources',
      users: '/api/users',
    },
    documentation: swaggerSpec ? '/api-docs' : 'See README.md for detailed API documentation',
  });
});
if (swaggerUi && swaggerSpec && process.env.DISABLE_SWAGGER !== 'true') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  logger.info('Swagger UI available at /api-docs');
}
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import sustainabilityRoutes from './routes/sustainability.routes';
import documentRoutes from './routes/document.routes';
import complianceRoutes from './routes/compliance.routes';
import safetyRoutes from './routes/safety.routes';
import resourceRoutes from './routes/resource.routes';
import materialRoutes from './routes/material.routes';
import equipmentRoutes from './routes/equipment.routes';
import supplierRoutes from './routes/supplier.routes';
import userRoutes from './routes/user.routes';
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sustainability', sustainabilityRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/users', userRoutes);
logger.info(`API routes registered — env: ${process.env.NODE_ENV || 'development'}`);
app.use(notFound);
app.use(errorHandler);
export default app;
