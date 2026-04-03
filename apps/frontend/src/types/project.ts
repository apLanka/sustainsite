// ---------------------------------------------------------------------------
// Enums — mirror backend ProjectStatus / MilestoneStatus exactly
// ---------------------------------------------------------------------------

export const ProjectStatus = {
  PLANNING: 'Planning',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const MilestoneStatus = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
} as const;
export type MilestoneStatus = (typeof MilestoneStatus)[keyof typeof MilestoneStatus];

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Populated user reference returned by backend populate() calls */
export interface PopulatedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ProjectLocation {
  address: string;
  latitude?: number;
  longitude?: number;
}

// ---------------------------------------------------------------------------
// Milestone
// ---------------------------------------------------------------------------

export interface Milestone {
  _id: string;
  projectId: string;
  title: string;
  description?: string;
  targetDate: string;       // ISO date string
  completionDate?: string;  // ISO date string — auto-set when status = Completed
  status: MilestoneStatus;
  completionPercentage: number; // auto-set to 100 when Completed
  dependencies: string[];
  assignedTo?: string;      // User ObjectId — not populated in list responses
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------

export interface Project {
  _id: string;
  projectName: string;
  description?: string;
  location: ProjectLocation;
  startDate: string;   // ISO date string
  endDate: string;     // ISO date string
  status: ProjectStatus;
  budget: number;
  actualCost: number;
  projectManager: PopulatedUser;
  teamMembers: PopulatedUser[];
  sustainabilityScore: number;   // 0–100
  currentPhase?: string;
  completionPercentage: number;  // 0–100
  createdBy: PopulatedUser;
  daysRemaining: number;         // virtual computed by backend
  budgetVariance: number;        // virtual: budget - actualCost
  milestones?: Milestone[];      // only included in GET /projects/:id
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Request payloads
// ---------------------------------------------------------------------------

export interface CreateProjectPayload {
  projectName: string;
  description?: string;
  location: { address: string };
  startDate: string;
  endDate: string;
  budget: number;
  status?: ProjectStatus;
}

export interface UpdateProjectPayload {
  projectName?: string;
  description?: string;
  location?: Partial<ProjectLocation>;
  startDate?: string;
  endDate?: string;
  budget?: number;
  actualCost?: number;
  status?: ProjectStatus;
  currentPhase?: string;
  completionPercentage?: number;
  sustainabilityScore?: number;
}

export interface CreateMilestonePayload {
  title: string;
  description?: string;
  targetDate: string;
  status?: MilestoneStatus;
  completionPercentage?: number;
}

export interface UpdateMilestonePayload {
  title?: string;
  description?: string;
  targetDate?: string;
  completionDate?: string;
  status?: MilestoneStatus;
  completionPercentage?: number;
}

// ---------------------------------------------------------------------------
// Query / filter params
// ---------------------------------------------------------------------------

export interface ProjectFilters {
  search: string;
  status: ProjectStatus | '';
  page: number;
  limit: number;
}
