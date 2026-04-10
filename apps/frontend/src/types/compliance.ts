export const ComplianceCategory = {
  ENVIRONMENTAL:                'Environmental',
  SAFETY:                       'Safety',
  BUILDING_CODE:                'Building Code',
  SUSTAINABILITY_CERTIFICATION: 'Sustainability Certification',
} as const;
export type ComplianceCategory = typeof ComplianceCategory[keyof typeof ComplianceCategory];

export const InspectionType = {
  SAFETY:        'Safety',
  ENVIRONMENTAL: 'Environmental',
  QUALITY:       'Quality',
  STRUCTURAL:    'Structural',
} as const;
export type InspectionType = typeof InspectionType[keyof typeof InspectionType];

export const RiskLevel = {
  LOW:      'Low',
  MEDIUM:   'Medium',
  HIGH:     'High',
  CRITICAL: 'Critical',
} as const;
export type RiskLevel = typeof RiskLevel[keyof typeof RiskLevel];

export const ActionStatus = {
  PENDING:     'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED:   'Completed',
} as const;
export type ActionStatus = typeof ActionStatus[keyof typeof ActionStatus];

export const IssueSeverity = {
  MINOR:    'Minor',
  MODERATE: 'Moderate',
  MAJOR:    'Major',
} as const;
export type IssueSeverity = typeof IssueSeverity[keyof typeof IssueSeverity];

// ── Shared ────────────────────────────────────────────────────────────────────

export interface PopulatedUser {
  _id: string;
  name: string;
  email: string;
}

export interface AttachedDocument {
  _id: string;
  title: string;
  fileUrl: string;
  fileName?: string;
  documentType: string;
}

export interface CompliancePagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ── Checklist ─────────────────────────────────────────────────────────────────

export interface ComplianceItem {
  itemId: string;
  itemName: string;
  description?: string;
  isCompleted: boolean;
  completedDate?: string;
  completedBy?: PopulatedUser | null;
  attachedDocuments: AttachedDocument[];
  notes?: string;
}

export interface ComplianceChecklist {
  _id: string;
  projectId: string;
  checklistName: string;
  category?: ComplianceCategory;
  items: ComplianceItem[];
  totalItems: number;
  completedItems: number;
  complianceScore: number;
  createdBy?: PopulatedUser | null;
  dueDate?: string;
  lastReviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistFilters {
  projectId?: string;
  category?: ComplianceCategory | '';
  page: number;
  limit: number;
}

export interface CreateChecklistPayload {
  projectId: string;
  checklistName: string;
  category?: ComplianceCategory;
  items?: { itemId: string; itemName: string; description?: string; notes?: string }[];
  dueDate?: string;
  lastReviewDate?: string;
}

export interface UpdateChecklistPayload {
  checklistName?: string;
  category?: ComplianceCategory;
  dueDate?: string;
  lastReviewDate?: string;
  items?: ComplianceItem[];
}

// ── Inspection ────────────────────────────────────────────────────────────────

export interface IssueIdentified {
  issue: string;
  severity: IssueSeverity;
  location?: string;
}

export interface InspectionPhoto {
  url: string;
  caption?: string;
  uploadedAt: string;
}

export interface SafetyInspection {
  _id: string;
  projectId: string;
  inspectionType?: InspectionType;
  inspectionDate: string;
  inspector: PopulatedUser;
  inspectorNotes?: string;
  findings: string;
  riskLevel: RiskLevel;
  issuesIdentified: IssueIdentified[];
  actionRequired?: string;
  recommendedActions: string[];
  actionDeadline?: string;
  actionStatus: ActionStatus;
  attachments: AttachedDocument[];
  photos: InspectionPhoto[];
  followUpDate?: string;
  followUpNotes?: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionFilters {
  projectId?: string;
  riskLevel?: RiskLevel | '';
  actionStatus?: ActionStatus | '';
  inspectionType?: InspectionType | '';
  isResolved?: boolean | '';
  page: number;
  limit: number;
}

export interface CreateInspectionPayload {
  projectId: string;
  inspectionDate: string;
  findings: string;
  riskLevel: RiskLevel;
  inspectionType?: InspectionType;
  inspectorNotes?: string;
  issuesIdentified?: IssueIdentified[];
  actionRequired?: string;
  recommendedActions?: string[];
  actionDeadline?: string;
  followUpDate?: string;
  followUpNotes?: string;
}

export interface UpdateInspectionPayload {
  inspectionType?: InspectionType;
  inspectionDate?: string;
  inspectorNotes?: string;
  findings?: string;
  riskLevel?: RiskLevel;
  issuesIdentified?: IssueIdentified[];
  actionRequired?: string;
  recommendedActions?: string[];
  actionDeadline?: string;
  actionStatus?: ActionStatus;
  followUpDate?: string;
  followUpNotes?: string;
  isResolved?: boolean;
}

export interface UpdateChecklistItemPayload {
  isCompleted?: boolean;
  notes?: string;
  completedDate?: string;
}

export interface ProjectComplianceScore {
  projectId: string;
  overallScore: number;
  totalChecklists: number;
  completedChecklists: number;
  totalItems: number;
  completedItems: number;
  breakdown: {
    checklistId: string;
    checklistName: string;
    category?: string;
    complianceScore: number;
    totalItems: number;
    completedItems: number;
    dueDate?: string;
  }[];
}