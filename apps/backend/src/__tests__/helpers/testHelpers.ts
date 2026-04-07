import User, { IUser } from '../../models/User';
import { UserRole } from '../../types';
import { generateToken } from '../../middleware/auth';
export const createTestUser = async (overrides: Partial<IUser> = {}): Promise<IUser> => {
  const defaultUser = {
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'TestPass123',
    role: UserRole.VIEWER,
    isActive: true,
  };
  const user = await User.create({ ...defaultUser, ...overrides });
  return user;
};
export const getAuthToken = (
  userId: string,
  email: string,
  role: UserRole,
  supplierId?: string
): string => {
  return generateToken({ userId, email, role, supplierId });
};
export const testUsers = {
  admin: {
    fullName: 'Admin User',
    email: 'admin@example.com',
    password: 'AdminPass123',
    role: UserRole.ADMIN,
  },
  projectManager: {
    fullName: 'Project Manager',
    email: 'pm@example.com',
    password: 'PMPass123',
    role: UserRole.PROJECT_MANAGER,
  },
  inspector: {
    fullName: 'Inspector User',
    email: 'inspector@example.com',
    password: 'InspectorPass123',
    role: UserRole.INSPECTOR,
  },
  supplier: {
    fullName: 'Supplier User',
    email: 'supplier@example.com',
    password: 'SupplierPass123',
    role: UserRole.SUPPLIER,
  },
  viewer: {
    fullName: 'Viewer User',
    email: 'viewer@example.com',
    password: 'ViewerPass123',
    role: UserRole.VIEWER,
  },
};
export const validRegistrationData = {
  fullName: 'John Silva',
  email: 'john.silva@example.com',
  password: 'SecurePass123',
  role: UserRole.PROJECT_MANAGER,
  phoneNumber: '+94771234567',
};
export const validLoginData = {
  email: 'test@example.com',
  password: 'TestPass123',
};
