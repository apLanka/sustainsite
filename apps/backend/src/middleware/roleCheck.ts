import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';

/**
 * Middleware to check if user has one of the specified roles
 * @param roles - Array of allowed roles
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user has ANY of the specified roles
 * (Alias for authorize for better readability)
 * @param roles - Array of allowed roles
 */
export const requireAnyRole = (...roles: UserRole[]) => {
  return authorize(...roles);
};

/**
 * Middleware to check if user has ALL of the specified roles
 * Note: In most cases, users have only one role, so this is rarely used
 * @param roles - Array of required roles
 */
export const requireAllRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    // Check if user has all required roles
    const hasAllRoles = roles.every((role) => req.user!.role === role);

    if (!hasAllRoles) {
      res.status(403).json({
        success: false,
        error: `Access denied. All required roles: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
};

/**
 * Check if user is an ADMIN
 * Convenience method for common admin-only operations
 */
export const requireAdmin = () => {
  return authorize(UserRole.ADMIN);
};

/**
 * Check if user is ADMIN or PROJECT_MANAGER
 * Common pattern for management operations
 */
export const requireManager = () => {
  return authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER);
};

/**
 * Check if user is ADMIN, PROJECT_MANAGER, or INSPECTOR
 * Common pattern for data entry operations
 */
export const requireDataEntry = () => {
  return authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.INSPECTOR);
};
