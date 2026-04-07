import type { Project } from './project';
import type { ComplianceChecklist } from './compliance';
export interface DashboardData {
    projects: Project[];
    activeCount: number;
    pendingApprovals: number;
    highRiskCount: number;
    avgSustainability: number;
    upcomingDueDates: ComplianceChecklist[];
}
