import { UserRole } from '@/types/auth';
import type { Project } from '@/types/project';

/** Roles allowed to call GET /projects (matches backend `project.routes`). */
export const PROJECT_LIST_ROLES = [
  UserRole.ADMIN,
  UserRole.PROJECT_MANAGER,
  UserRole.INSPECTOR,
  UserRole.VIEWER,
] as const;

export const MANAGER_ROLES = [UserRole.ADMIN, UserRole.PROJECT_MANAGER] as const;

export const DATA_ENTRY_ROLES = [
  UserRole.ADMIN,
  UserRole.PROJECT_MANAGER,
  UserRole.INSPECTOR,
] as const;

export function hasRole(role: string | undefined, ...allowed: readonly string[]): boolean {
  if (!role) return false;
  return (allowed as readonly string[]).includes(role);
}

export function canAccessProjectDirectory(role?: string): boolean {
  return hasRole(role, ...PROJECT_LIST_ROLES);
}

export function canCreateProject(role?: string): boolean {
  return hasRole(role, UserRole.ADMIN, UserRole.PROJECT_MANAGER);
}

export function canLogSustainabilityMetrics(role?: string): boolean {
  return hasRole(role, ...DATA_ENTRY_ROLES);
}

export function canManageResourcesWrite(role?: string): boolean {
  return hasRole(role, ...MANAGER_ROLES);
}

/** Create / update / delete suppliers, create equipment, create materials, etc. */
export function canManageInventory(role?: string): boolean {
  return hasRole(role, ...MANAGER_ROLES);
}

/** Only ADMIN may delete materials/equipment/suppliers on backend. */
export function canAdminDeleteResource(role?: string): boolean {
  return role === UserRole.ADMIN;
}

export function canUpdateMaterialStatus(role?: string): boolean {
  return hasRole(role, UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.SUPPLIER);
}

export function isReadOnlyViewer(role?: string): boolean {
  return role === UserRole.VIEWER;
}

export function isSupplier(role?: string): boolean {
  return role === UserRole.SUPPLIER;
}

export function canAccessAdminUsers(role?: string): boolean {
  return role === UserRole.ADMIN;
}

export function canApproveDocuments(role?: string): boolean {
  return hasRole(role, UserRole.ADMIN, UserRole.INSPECTOR);
}

/**
 * Backend `checkProjectManager`: only the assigned project manager may update project / milestones.
 * ADMIN is not exempt in middleware — UI still offers actions for ADMIN; API may 403 if not PM.
 */
export function isAssignedProjectManager(project: Project | null | undefined, userId: string | undefined): boolean {
  if (!project || !userId) return false;
  const pm = project.projectManager;
  const pmId = typeof pm === 'string' ? pm : pm?._id;
  return pmId === userId;
}

/** Status dropdown + non-delete project menu actions (intended PM). */
export function canManageProjectSettings(project: Project | null | undefined, userId: string | undefined): boolean {
  return isAssignedProjectManager(project, userId);
}

/** Delete project — backend `requireAdmin`. */
export function canDeleteProject(role?: string): boolean {
  return role === UserRole.ADMIN;
}

export function loginHomePath(role?: string): string {
  if (isSupplier(role)) return '/supplier/materials';
  return '/dashboard';
}
