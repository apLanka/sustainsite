import { NextFunction, Request, Response } from 'express';
import mongoose, { Model } from 'mongoose';
import Project from '../models/Project';
import { UserRole } from '../types';
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
      const resourceId = getNestedValue(req, resourceIdField);
      if (!resourceId) {
        res.status(400).json({
          success: false,
          error: 'Resource ID not provided',
        });
        return;
      }
      if (!mongoose.Types.ObjectId.isValid(resourceId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid resource ID',
        });
        return;
      }
      const resource = await resourceModel.findById(resourceId);
      if (!resource) {
        res.status(404).json({
          success: false,
          error: 'Resource not found',
        });
        return;
      }
      if (req.user.role === UserRole.ADMIN) {
        next();
        return;
      }
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
      const projectId = getNestedValue(req, projectIdField);
      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID not provided',
        });
        return;
      }
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid project ID',
        });
        return;
      }
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
      const isMember = projectManagerId === userId || teamMemberIds.includes(userId);
      if (req.user.role === UserRole.ADMIN) {
        next();
        return;
      }
      if (!isMember) {
        res.status(403).json({
          success: false,
          error: 'You are not a member of this project',
        });
        return;
      }
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
      const projectId = getNestedValue(req, projectIdField);
      if (!projectId) {
        res.status(400).json({
          success: false,
          error: 'Project ID not provided',
        });
        return;
      }
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid project ID',
        });
        return;
      }
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
      if (projectManagerId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Only the project manager can perform this action',
        });
        return;
      }
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
export const combinePermissions = (...checks: any[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      for (const check of checks) {
        await new Promise<void>((resolve, reject) => {
          check(req, res, (error?: any) => {
            if (error) {
              reject(error);
            } else if (res.headersSent) {
              reject(new Error('Permission denied'));
            } else {
              resolve();
            }
          });
        });
      }
      next();
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Error checking permissions',
        });
      }
    }
  };
};
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}
