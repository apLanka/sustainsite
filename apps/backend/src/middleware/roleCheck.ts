import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
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
export const requireAnyRole = (...roles: UserRole[]) => {
    return authorize(...roles);
};
export const requireAllRoles = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated',
            });
            return;
        }
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
export const requireAdmin = () => {
    return authorize(UserRole.ADMIN);
};
export const requireManager = () => {
    return authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER);
};
export const requireDataEntry = () => {
    return authorize(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.INSPECTOR);
};
