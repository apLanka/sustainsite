export type MaterialStatus = 'Ordered' | 'In Transit' | 'Delivered' | 'In Stock' | 'Used' | 'Cancelled';

export type MaterialCategory = 'Cement' | 'Steel' | 'Wood' | 'Aggregates' | 'Bricks' | 'Equipment' | 'Other';

export interface MaterialAsset {
  _id: string;
  projectId: string;
  materialName: string;
  category: MaterialCategory;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
  supplier: string;
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
  id: string;
  currentProjectId: string;
  equipmentName: string;
  equipmentType: EquipmentType;
  serialNumber?: string;
  assetId?: string;
  manufacturer?: string;
  equipmentModel?: string;
  status: EquipmentStatus;
  lastMaintenanceDate?: string;
  nextScheduledMaintenance?: string;
  assignedTo?: string;
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

export interface ResourceExpense {
  id: string;
  projectId: string;
  title: string;
  amount: number;
  category: 'Materials' | 'Equipment' | 'Labor' | 'Permits' | 'Other';
  date: string;
  supplierId?: string;
}

export interface ResourceSummary {
  totalInventoryValue: number;
  activeEquipmentCount: number;
  lowStockAlerts: number;
  monthlySpend: number;
}
