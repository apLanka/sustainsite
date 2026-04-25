import User, { IUser } from '../../models/User';
import Project, { IProject, ProjectStatus } from '../../models/Project';
import Material, { IMaterial, MaterialCategory, MaterialStatus } from '../../models/Material';
import Equipment, { IEquipment, EquipmentType, EquipmentStatus } from '../../models/Equipment';
import Supplier, { ISupplier } from '../../models/Supplier';
import { UserRole } from '../../types';
import { generateToken } from '../../middleware/auth';
import mongoose from 'mongoose';

let userCounter = 0;

export const createTestUser = async (overrides: Partial<IUser> = {}): Promise<IUser> => {
  userCounter++;
  const defaultUser = {
    fullName: 'Test User',
    email: `test${userCounter}@example.com`,
    password: 'TestPass123',
    role: UserRole.VIEWER,
    isActive: true,
  };
  const user = await User.create({ ...defaultUser, ...overrides });
  return user;
};

export const createTestProject = async (overrides: Partial<IProject> = {}): Promise<IProject> => {
  const manager = await createTestUser({ role: UserRole.PROJECT_MANAGER });
  const defaultProject = {
    projectName: 'Test Project',
    location: { address: '123 Test Street, Test City' },
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: ProjectStatus.PLANNING,
    budget: 100000,
    actualCost: 0,
    projectManager: manager._id,
    teamMembers: [],
    sustainabilityScore: 0,
    completionPercentage: 0,
    createdBy: manager._id,
  };
  const project = await Project.create({ ...defaultProject, ...overrides });
  return project;
};

export const createTestMaterial = async (overrides: Partial<IMaterial> = {}): Promise<IMaterial> => {
  const supplier = await createTestSupplier();
  const project = await createTestProject();
  const user = await createTestUser();
  const defaultMaterial = {
    projectId: project._id,
    materialName: 'Test Cement',
    category: MaterialCategory.CEMENT,
    quantity: 100,
    unit: 'bags',
    unitPrice: 10,
    totalCost: 1000,
    supplier: supplier._id,
    orderDate: new Date(),
    status: MaterialStatus.ORDERED,
    sustainabilityRating: 8,
    createdBy: user._id,
  };
  const material = await Material.create({ ...defaultMaterial, ...overrides });
  return material;
};

export const createTestEquipment = async (overrides: Partial<IEquipment> = {}): Promise<IEquipment> => {
  const defaultEquipment = {
    equipmentName: 'Test Excavator',
    equipmentType: EquipmentType.EXCAVATOR,
    status: EquipmentStatus.AVAILABLE,
    manufacturer: 'Test Manufacturer',
    equipmentModel: 'TX-100',
    yearOfManufacture: 2020,
    purchasePrice: 50000,
    currentValue: 40000,
    depreciationRate: 20,
    rentalRatePerDay: 500,
  };
  const equipment = await Equipment.create({ ...defaultEquipment, ...overrides });
  return equipment;
};

export const createTestSupplier = async (overrides: Partial<ISupplier> = {}): Promise<ISupplier> => {
  const user = await createTestUser({ role: UserRole.SUPPLIER });
  const defaultSupplier = {
    companyName: 'Test Supplier Co',
    contactPerson: 'John Doe',
    email: 'supplier@example.com',
    phoneNumber: '+94771234567',
    address: { street: '123 Supply St', city: 'Test City', country: 'Test Country' },
    totalOrders: 0,
    completedOrders: 0,
    onTimeDeliveryRate: 0,
    averageRating: 0,
    isSustainabilityCertified: false,
    isActive: true,
    isPreferred: false,
    blacklisted: false,
    addedBy: user._id,
  };
  const supplier = await Supplier.create({ ...defaultSupplier, ...overrides });
  return supplier;
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
