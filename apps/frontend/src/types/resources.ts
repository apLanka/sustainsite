export type MaterialStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'In Transit' | 'On Site';

export interface MaterialAsset {
  id: string;
  projectId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: MaterialStatus;
  supplierName: string;
  minThreshold: number;
  lastUpdated: string;
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
  id: string;
  name: string;
  category: string;
  rating: number; // 1-5
  isGreen: boolean;
  contactEmail: string;
  contactPhone: string;
  address: string;
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
