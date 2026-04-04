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
export enum UserRole {
    ADMIN = 'ADMIN',
    PROJECT_MANAGER = 'PROJECT_MANAGER',
    INSPECTOR = 'INSPECTOR',
    SUPPLIER = 'SUPPLIER',
    VIEWER = 'VIEWER'
}
export enum ProjectStatus {
    PLANNING = 'Planning',
    IN_PROGRESS = 'In Progress',
    ON_HOLD = 'On Hold',
    COMPLETED = 'Completed'
}
export enum MilestoneStatus {
    PENDING = 'Pending',
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed'
}
export enum DocumentType {
    BLUEPRINT = 'Blueprint',
    PERMIT = 'Permit',
    CERTIFICATE = 'Certificate',
    SAFETY_REPORT = 'Safety Report',
    CONTRACT = 'Contract',
    OTHER = 'Other'
}
export enum DocumentStatus {
    DRAFT = 'Draft',
    UNDER_REVIEW = 'Under Review',
    APPROVED = 'Approved',
    REJECTED = 'Rejected'
}
export enum MaterialStatus {
    ORDERED = 'Ordered',
    IN_TRANSIT = 'In Transit',
    DELIVERED = 'Delivered',
    IN_STOCK = 'In Stock',
    USED = 'Used',
    CANCELLED = 'Cancelled'
}
export enum EquipmentStatus {
    AVAILABLE = 'Available',
    IN_USE = 'In Use',
    UNDER_MAINTENANCE = 'Under Maintenance',
    DAMAGED = 'Damaged',
    RETIRED = 'Retired'
}
export enum RiskLevel {
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    CRITICAL = 'Critical'
}
export enum ScoreCategory {
    RED = 'Red',
    YELLOW = 'Yellow',
    GREEN = 'Green'
}
export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
    supplierId?: string;
}
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
