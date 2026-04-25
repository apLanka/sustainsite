import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
interface ErrorResponse {
  success: boolean;
  error: string;
  stack?: string;
}
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(err.message, { stack: err.stack });
  const response: ErrorResponse = {
    success: false,
    error: err.message || 'Internal Server Error',
  };
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.message,
    });
    return;
  }
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    res.status(400).json({
      success: false,
      error: 'Duplicate field value entered',
    });
    return;
  }
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
    return;
  }
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Token expired',
    });
    return;
  }
  res.status(500).json(response);
};
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
};
