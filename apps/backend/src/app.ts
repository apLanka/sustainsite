import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/errorHandler';
import logger from './utils/logger';

dotenv.config();

// Swagger is optional — only mount if packages are installed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let swaggerUi: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let swaggerSpec: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  swaggerUi = require('swagger-ui-express');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { swaggerSpec: spec } = require('./config/swagger');
  swaggerSpec = spec;
} catch {
  // swagger-jsdoc / swagger-ui-express not yet installed — /api-docs will be unavailable
}

const app: Application = express();

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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (process.env.DISABLE_RATE_LIMIT || process.env.NODE_ENV === 'test') ? 10000 : 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Stricter limiter for auth endpoints: 5 requests per 15 minutes per IP
// Disabled in test environment to prevent 429s during integration tests
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (process.env.DISABLE_RATE_LIMIT || process.env.NODE_ENV === 'test') ? 10000 : 5,
  message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' },
});

if (!process.env.DISABLE_RATE_LIMIT) {
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

// Apply stricter rate limit to auth login/register before global limiter
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sustainability', sustainabilityRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/resources', resourceRoutes);

// Spec-path aliases (additive — existing /api/resources/... still works)
app.use('/api/materials', materialRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/suppliers', supplierRoutes);

// Admin user management
app.use('/api/users', userRoutes);

logger.info(`API routes registered — env: ${process.env.NODE_ENV || 'development'}`);

app.use(notFound);

app.use(errorHandler);

export default app;
