
export const UserRole = {
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  INSPECTOR: 'INSPECTOR',
  SUPPLIER: 'SUPPLIER',
  VIEWER: 'VIEWER',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  jobTitle?: string;

  assignedProjects?: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;

}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    fullName: string;
    email: string;
    role: UserRole;

    token: string;
    expiresIn?: string;
  };
}

export interface UserResponse {
  success: boolean;
  data: User;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
