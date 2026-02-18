import { UserRole } from '../types';
import { IProject } from '../models/Project';
import { IMaterial } from '../models/Material';
import { IDocument } from '../models/Document';

/**
 * Permission utility functions for use in controllers
 * These functions check if a user has permission to perform specific actions
 */

/**
 * Check if user can view a project
 * - ADMIN: Can view all projects
 * - PROJECT_MANAGER: Can view all projects
 * - INSPECTOR: Can view all projects
 * - VIEWER: Can view all projects
 * - SUPPLIER: Cannot view projects
 */
export const canViewProject = (
  user: { userId: string; role: UserRole },
  _project?: IProject
): boolean => {
  const allowedRoles = [
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.INSPECTOR,
    UserRole.VIEWER,
  ];
  return allowedRoles.includes(user.role);
};

/**
 * Check if user can edit a project
 * - ADMIN: Can edit all projects
 * - PROJECT_MANAGER: Can edit projects they manage or are team members of
 * - Others: Cannot edit projects
 */
export const canEditProject = (
  user: { userId: string; role: UserRole },
  project: IProject
): boolean => {
  // ADMIN can edit any project
  if (user.role === UserRole.ADMIN) {
    return true;
  }

  // PROJECT_MANAGER can edit if they are the manager or a team member
  if (user.role === UserRole.PROJECT_MANAGER) {
    const isManager = project.projectManager.toString() === user.userId;
    const isTeamMember = project.teamMembers
      .map((id) => id.toString())
      .includes(user.userId);
    return isManager || isTeamMember;
  }

  return false;
};

/**
 * Check if user can delete a project
 * - ADMIN: Can delete any project
 * - Others: Cannot delete projects
 */
export const canDeleteProject = (
  user: { userId: string; role: UserRole },
  _project?: IProject
): boolean => {
  return user.role === UserRole.ADMIN;
};

/**
 * Check if user can manage resources (materials, equipment)
 * - ADMIN: Can manage all resources
 * - PROJECT_MANAGER: Can manage resources for their projects
 * - Others: Cannot manage resources
 */
export const canManageResources = (
  user: { userId: string; role: UserRole },
  project?: IProject
): boolean => {
  if (user.role === UserRole.ADMIN) {
    return true;
  }

  if (user.role === UserRole.PROJECT_MANAGER && project) {
    const isManager = project.projectManager.toString() === user.userId;
    const isTeamMember = project.teamMembers
      .map((id) => id.toString())
      .includes(user.userId);
    return isManager || isTeamMember;
  }

  return false;
};

/**
 * Check if user can approve documents
 * - ADMIN: Can approve any document
 * - INSPECTOR: Can approve any document
 * - Others: Cannot approve documents
 */
export const canApproveDocuments = (user: {
  userId: string;
  role: UserRole;
}): boolean => {
  return user.role === UserRole.ADMIN || user.role === UserRole.INSPECTOR;
};

/**
 * Check if user can conduct safety inspections
 * - ADMIN: Can conduct inspections
 * - INSPECTOR: Can conduct inspections
 * - Others: Cannot conduct inspections
 */
export const canConductInspections = (user: {
  userId: string;
  role: UserRole;
}): boolean => {
  return user.role === UserRole.ADMIN || user.role === UserRole.INSPECTOR;
};

/**
 * Check if user can update material status
 * - ADMIN: Can update any material
 * - PROJECT_MANAGER: Can update materials for their projects
 * - SUPPLIER: Can update materials they supply
 * - Others: Cannot update materials
 */
export const canUpdateMaterialStatus = (
  user: { userId: string; role: UserRole },
  material: IMaterial
): boolean => {
  // ADMIN can update any material
  if (user.role === UserRole.ADMIN) {
    return true;
  }

  // PROJECT_MANAGER can update materials (will need project check in controller)
  if (user.role === UserRole.PROJECT_MANAGER) {
    return true;
  }

  // SUPPLIER can update materials they supply
  if (user.role === UserRole.SUPPLIER) {
    return material.supplier.toString() === user.userId;
  }

  return false;
};

/**
 * Check if user can create sustainability metrics
 * - ADMIN: Can create metrics
 * - PROJECT_MANAGER: Can create metrics for their projects
 * - INSPECTOR: Can create metrics
 * - Others: Cannot create metrics
 */
export const canCreateMetrics = (user: {
  userId: string;
  role: UserRole;
}): boolean => {
  return (
    user.role === UserRole.ADMIN ||
    user.role === UserRole.PROJECT_MANAGER ||
    user.role === UserRole.INSPECTOR
  );
};

/**
 * Check if user can update sustainability metrics
 * - ADMIN: Can update any metrics
 * - PROJECT_MANAGER: Can update metrics for their projects
 * - INSPECTOR: Can update any metrics
 * - Others: Cannot update metrics
 */
export const canUpdateMetrics = (user: {
  userId: string;
  role: UserRole;
}): boolean => {
  return (
    user.role === UserRole.ADMIN ||
    user.role === UserRole.PROJECT_MANAGER ||
    user.role === UserRole.INSPECTOR
  );
};

/**
 * Check if user can delete a document
 * - ADMIN: Can delete any document
 * - Owner: Can delete their own documents
 * - Others: Cannot delete documents
 */
export const canDeleteDocument = (
  user: { userId: string; role: UserRole },
  document: IDocument
): boolean => {
  if (user.role === UserRole.ADMIN) {
    return true;
  }

  // Owner can delete their own document
  return document.uploadedBy.toString() === user.userId;
};

/**
 * Check if user can manage team members
 * - ADMIN: Can manage all users
 * - PROJECT_MANAGER: Can manage team members for their projects
 * - Others: Cannot manage team members
 */
export const canManageTeamMembers = (
  user: { userId: string; role: UserRole },
  project?: IProject
): boolean => {
  if (user.role === UserRole.ADMIN) {
    return true;
  }

  if (user.role === UserRole.PROJECT_MANAGER && project) {
    return project.projectManager.toString() === user.userId;
  }

  return false;
};

/**
 * Check if user can view reports
 * - All authenticated users can view reports
 */
export const canViewReports = (_user: {
  userId: string;
  role: UserRole;
}): boolean => {
  return true; // All authenticated users can view reports
};

/**
 * Check if user can generate reports
 * - ADMIN: Can generate any report
 * - PROJECT_MANAGER: Can generate reports for their projects
 * - INSPECTOR: Can generate compliance reports
 * - VIEWER: Can generate read-only reports
 * - Others: Cannot generate reports
 */
export const canGenerateReports = (user: {
  userId: string;
  role: UserRole;
}): boolean => {
  return (
    user.role === UserRole.ADMIN ||
    user.role === UserRole.PROJECT_MANAGER ||
    user.role === UserRole.INSPECTOR ||
    user.role === UserRole.VIEWER
  );
};
