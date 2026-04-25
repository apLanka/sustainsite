import type { UserRole } from './auth';
export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  jobTitle?: string;
  assignedProjects: string[];
  supplierId?: string | null;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}
export interface UserFilters {
  search?: string;
  role?: UserRole | '';
  isActive?: boolean | '';
  page: number;
  limit: number;
}
export interface UpdateUserPayload {
  role?: UserRole;
  isActive?: boolean;
  jobTitle?: string;
  assignedProjects?: string[];
  supplierId?: string | null;
}
