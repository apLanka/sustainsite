import type { Project } from './project';
import type { ComplianceChecklist } from './compliance';

export interface DashboardData {
  projects: Project[];              // top 6 most recent
  activeCount: number;              // total Active projects
  pendingApprovals: number;         // documents with status "Under Review"
  highRiskCount: number;            // High + Critical unresolved inspections
  avgSustainability: number;        // average sustainabilityScore across all projects
  upcomingDueDates: ComplianceChecklist[]; // checklists with dueDate, sorted asc
}
