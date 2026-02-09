import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorHandler, notFound } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
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
      inspections: '/api/inspections',
      materials: '/api/materials',
      equipment: '/api/equipment',
      suppliers: '/api/suppliers',
    },
  });
});

// Import routes
import authRoutes from './routes/auth.routes';

// Use routes
app.use('/api/auth', authRoutes);

// Placeholder for other routes (will be created later)
// app.use('/api/projects', projectRoutes);
// app.use('/api/sustainability', sustainabilityRoutes);
// app.use('/api/documents', documentRoutes);
// app.use('/api/compliance', complianceRoutes);
// app.use('/api/inspections', inspectionRoutes);
// app.use('/api/materials', materialRoutes);
// app.use('/api/equipment', equipmentRoutes);
// app.use('/api/suppliers', supplierRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

export default app;
