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
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
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
export interface Milestone {
    _id: string;
    projectId: string;
    title: string;
    description?: string;
    targetDate: string;
    completionDate?: string;
    status: MilestoneStatus;
    completionPercentage: number;
    dependencies: string[];
    assignedTo?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Project {
    _id: string;
    projectName: string;
    description?: string;
    location: ProjectLocation;
    startDate: string;
    endDate: string;
    status: ProjectStatus;
    budget: number;
    actualCost: number;
    projectManager: PopulatedUser;
    teamMembers: PopulatedUser[];
    sustainabilityScore: number;
    currentPhase?: string;
    completionPercentage: number;
    createdBy: PopulatedUser;
    daysRemaining: number;
    budgetVariance: number;
    milestones?: Milestone[];
    createdAt: string;
    updatedAt: string;
}
export interface CreateProjectPayload {
    projectName: string;
    description?: string;
    location: {
        address: string;
        latitude?: number;
        longitude?: number;
    };
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
export interface ProjectFilters {
    search: string;
    status: ProjectStatus | '';
    page: number;
    limit: number;
}
