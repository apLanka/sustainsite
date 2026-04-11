export type MaterialStatus = 'Ordered' | 'In Transit' | 'Delivered' | 'In Stock' | 'Used' | 'Cancelled';

export type MaterialCategory = 'Cement' | 'Steel' | 'Wood' | 'Aggregates' | 'Bricks' | 'Equipment' | 'Other';

/** API may return a raw ObjectId string or a populated supplier document. */
export type MaterialSupplierRef =
  | string
  | { _id: string; companyName?: string; email?: string; phoneNumber?: string };

/** API may populate project with projectName. */
export type MaterialProjectRef = string | { _id?: string; projectName?: string };

export interface MaterialAsset {
  _id: string;
  projectId: MaterialProjectRef;
  materialName: string;
  category: MaterialCategory;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
  supplier: MaterialSupplierRef;
  status: MaterialStatus;
  currentStock: number;
  minimumThreshold: number;
  sustainabilityRating?: number;
  isEcoFriendly: boolean;
  recycledContent: number;
  certifications: string[];
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  lastUpdated: string;
}

export interface CreateMaterialPayload {
  projectId: string;
  materialName: string;
  category: MaterialCategory;
  quantity: number;
  unit: string;
  unitPrice: number;
  supplier: string;
  minimumThreshold?: number;
  orderDate: string;
  expectedDeliveryDate?: string;
  isEcoFriendly?: boolean;
  recycledContent?: number;
  description?: string;
}

export type EquipmentStatus = 'Available' | 'In Use' | 'Under Maintenance' | 'Damaged' | 'Retired';

export type EquipmentType = 'Excavator' | 'Crane' | 'Bulldozer' | 'Mixer' | 'Loader' | 'Other';

export interface EquipmentAsset {
  _id: string;
  currentProjectId?: string;
  equipmentName: string;
  equipmentType: EquipmentType;
  serialNumber?: string;
  assetId?: string;
  manufacturer?: string;
  equipmentModel?: string;
  yearOfManufacture?: number;
  status: EquipmentStatus;
  lastMaintenanceDate?: string;
  nextScheduledMaintenance?: string;
  assignedTo?: string;
  currentLocation?: string;
  notes?: string;
  purchasePrice?: number;
  currentValue?: number;
  depreciationRate?: number;
  rentalRatePerDay?: number;
}

export interface CreateEquipmentPayload {
  equipmentName: string;
  equipmentType: EquipmentType;
  serialNumber?: string;
  assetId?: string;
  manufacturer?: string;
  equipmentModel?: string;
  yearOfManufacture?: number;
  purchasePrice?: number;
  currentValue?: number;
  depreciationRate?: number;
  rentalRatePerDay?: number;
  currentLocation?: string;
  notes?: string;
}

export interface Supplier {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  materialsSupplied: string[];
  averageRating: number;
  isSustainabilityCertified: boolean;
  sustainabilityScore?: number;
  isActive: boolean;
  isPreferred: boolean;
  onTimeDeliveryRate: number;
  totalOrders: number;
  completedOrders: number;
}

export interface CreateSupplierPayload {
    companyName: string;
    contactPerson: string;
    email: string;
    phoneNumber: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
    };
    materialsSupplied: string[];
    isSustainabilityCertified?: boolean;
}

export interface ResourceExpense {
  id: string;
  projectId: string;
  title: string;
  amount: number;
  category: 'Materials' | 'Equipment' | 'Labor' | 'Permits' | 'Other';
  date: string;
  supplierId?: string;
}

export interface UpdateMaterialPayload {
  materialName?: string;
  category?: MaterialCategory;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  supplier?: string;
  minimumThreshold?: number;
  status?: MaterialStatus;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  isEcoFriendly?: boolean;
  recycledContent?: number;
  description?: string;
  notes?: string;
}

export interface UpdateEquipmentPayload {
  equipmentName?: string;
  equipmentType?: EquipmentType;
  serialNumber?: string;
  status?: EquipmentStatus;
  currentLocation?: string;
  notes?: string;
  nextScheduledMaintenance?: string;
  purchasePrice?: number;
  currentValue?: number;
  rentalRatePerDay?: number;
}

export interface AssignEquipmentPayload {
  projectId: string;
  operatorId?: string;
}

export interface MaintenancePayload {
  maintenanceDate: string;
  maintenanceType: 'Routine' | 'Repair' | 'Overhaul';
  description?: string;
  cost?: number;
  performedBy?: string;
  nextMaintenanceDate?: string;
}

export interface UpdateSupplierPayload {
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  materialsSupplied?: string[];
  isSustainabilityCertified?: boolean;
  isActive?: boolean;
  isPreferred?: boolean;
}

export interface ResourceSummary {
  totalInventoryValue: number;
  activeEquipmentCount: number;
  lowStockAlerts: number;
  monthlySpend: number;
}

export interface FinancialSummary {
  projectId: string;
  projectName: string;
  budget: number;
  totalSpend: number;
  remainingBudget: number;
  spendPercentage: number;
  remainingValue: number;
  materialCount: number;
  allocationMix: { category: string; cost: number; percentage: number }[];
}
