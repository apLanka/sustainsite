// Type definitions for environment variables
export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
  SENDGRID_API_KEY?: string;
  FROM_EMAIL?: string;
  GOOGLE_MAPS_API_KEY?: string;
  CARBON_INTERFACE_API_KEY?: string;
  FRONTEND_URL: string;
}

// User role types
export enum UserRole {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  INSPECTOR = 'INSPECTOR',
  SUPPLIER = 'SUPPLIER',
  VIEWER = 'VIEWER'
}

// Project status types
export enum ProjectStatus {
  PLANNING = 'Planning',
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed'
}

// Milestone status types
export enum MilestoneStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed'
}

// Document types
export enum DocumentType {
  BLUEPRINT = 'Blueprint',
  PERMIT = 'Permit',
  CERTIFICATE = 'Certificate',
  SAFETY_REPORT = 'Safety Report',
  CONTRACT = 'Contract',
  OTHER = 'Other'
}

// Document status
export enum DocumentStatus {
  DRAFT = 'Draft',
  UNDER_REVIEW = 'Under Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

// Material status
export enum MaterialStatus {
  ORDERED = 'Ordered',
  IN_TRANSIT = 'In Transit',
  DELIVERED = 'Delivered',
  IN_STOCK = 'In Stock',
  USED = 'Used',
  CANCELLED = 'Cancelled'
}

// Equipment status
export enum EquipmentStatus {
  AVAILABLE = 'Available',
  IN_USE = 'In Use',
  UNDER_MAINTENANCE = 'Under Maintenance',
  DAMAGED = 'Damaged',
  RETIRED = 'Retired'
}

// Risk levels
export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

// Score categories
export enum ScoreCategory {
  RED = 'Red',
  YELLOW = 'Yellow',
  GREEN = 'Green'
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
