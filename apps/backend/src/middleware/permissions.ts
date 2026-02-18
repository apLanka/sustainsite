import { Request, Response, NextFunction } from 'express';
import mongoose, { Model } from 'mongoose';
import Project from '../models/Project';

/**
 * Middleware to check if the authenticated user owns a specific resource
 * @param resourceModel - Mongoose model of the resource
 * @param resourceIdField - Path to resource ID in request (e.g., 'params.id', 'body.projectId')
 * @param ownerField - Field name in the resource that contains the owner's user ID (default: 'createdBy')
 */
export const checkOwnership = (
  resourceModel: Model<any>,
  resourceIdField: string,
  ownerField: string = 'createdBy'
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Extract resource ID from request based on field path
      const resourceId = getNestedValue(req, resourceIdField);

      if (!resourceId) {
        res.status(400).json({
          success: false,
          error: 'Resource ID not provided',
        });
        return;
      }

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(resourceId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid resource ID',
        });
        return;
      }

      // Find the resource
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        res.status(404).json({
          success: false,
          error: 'Resource not found',
        });
        return;
      }

      // Check ownership
      const ownerId = resource[ownerField]?.toString();
      const userId = req.user.userId;

      if (ownerId !== userId) {
        res.status(403).json({
          success: false,
          error: 'You do not have permission to access this resource',
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error checking resource ownership',
      });
    }
  };
};

/**
 * Middleware to check if the authenticated user is a member of a project
 * (either project manager or team member)
 * @param projectIdField - Path to project ID in request (e.g., 'params.id', 'body.projectId')
 */
export const checkProjectMembership = (projectIdField: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Extract project ID from request
      const projectId = getNestedValue(req, projectIdField);

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID not provided',
        });
        return;
      }

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid project ID',
        });
        return;
      }

      // Find the project
      const project = await Project.findById(projectId);

      if (!project) {
        res.status(404).json({
          success: false,
          error: 'Project not found',
        });
        return;
      }

      const userId = req.user.userId;
      const projectManagerId = project.projectManager.toString();
      const teamMemberIds = project.teamMembers.map((id) => id.toString());

      // Check if user is project manager or team member
      const isMember = projectManagerId === userId || teamMemberIds.includes(userId);

      if (!isMember) {
        res.status(403).json({
          success: false,
          error: 'You are not a member of this project',
        });
        return;
      }

      // Attach project to request for use in controller
      (req as any).project = project;

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error checking project membership',
      });
    }
  };
};

/**
 * Middleware to check if the authenticated user is the project manager
 * @param projectIdField - Path to project ID in request (e.g., 'params.id', 'body.projectId')
 */
export const checkProjectManager = (projectIdField: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
        return;
      }

      // Extract project ID from request
      const projectId = getNestedValue(req, projectIdField);

      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID not provided',
        });
        return;
      }

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid project ID',
        });
        return;
      }

      // Find the project
      const project = await Project.findById(projectId);

      if (!project) {
        res.status(404).json({
          success: false,
          error: 'Project not found',
        });
        return;
      }

      const userId = req.user.userId;
      const projectManagerId = project.projectManager.toString();

      // Check if user is the project manager
      if (projectManagerId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Only the project manager can perform this action',
        });
        return;
      }

      // Attach project to request for use in controller
      (req as any).project = project;

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error checking project manager',
      });
    }
  };
};

/**
 * Combine multiple permission checks - all must pass
 * @param checks - Array of middleware functions to execute
 */
export const combinePermissions = (...checks: any[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Execute all checks sequentially
      for (const check of checks) {
        await new Promise<void>((resolve, reject) => {
          check(req, res, (error?: any) => {
            if (error) {
              reject(error);
            } else if (res.headersSent) {
              // Response was sent (permission denied)
              reject(new Error('Permission denied'));
            } else {
              resolve();
            }
          });
        });
      }
      next();
    } catch (error) {
      // Error already handled by individual checks
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Error checking permissions',
        });
      }
    }
  };
};

/**
 * Helper function to get nested value from object using dot notation
 * @param obj - Object to extract value from
 * @param path - Dot-separated path (e.g., 'params.id', 'body.projectId')
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
