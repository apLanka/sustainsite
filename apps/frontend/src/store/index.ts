import { create } from 'zustand';
import type { User } from '@/types/auth';
import type { Project, Milestone, Pagination, ProjectFilters } from '@/types/project';
import type { ProjectDocument, DocumentFilters, DocumentPagination } from '@/types/document';
import type { ComplianceChecklist, SafetyInspection, ChecklistFilters, InspectionFilters, CompliancePagination, } from '@/types/compliance';
import type { DashboardData } from '@/types/dashboard';
interface AuthSlice {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    clearAuth: () => void;
}
export const useAuthStore = create<AuthSlice>()((set) => ({
    user: null,
    token: null,
    setAuth: (user, token) => set({ user, token }),
    clearAuth: () => set({ user: null, token: null }),
}));
const DEFAULT_FILTERS: ProjectFilters = { search: '', status: '', page: 1, limit: 10 };
interface ProjectSlice {
    projects: Project[];
    selectedProject: Project | null;
    pagination: Pagination | null;
    filters: ProjectFilters;
    isLoading: boolean;
    isDetailLoading: boolean;
    setProjects: (projects: Project[], pagination: Pagination) => void;
    setSelectedProject: (project: Project | null) => void;
    appendMilestone: (milestone: Milestone) => void;
    updateMilestoneInStore: (milestoneId: string, patch: Partial<Milestone>) => void;
    removeProject: (id: string) => void;
    updateProjectInList: (id: string, patch: Partial<Project>) => void;
    setFilters: (filters: Partial<ProjectFilters>) => void;
    setLoading: (v: boolean) => void;
    setDetailLoading: (v: boolean) => void;
    resetFilters: () => void;
}
export const useProjectStore = create<ProjectSlice>()((set) => ({
    projects: [],
    selectedProject: null,
    pagination: null,
    filters: DEFAULT_FILTERS,
    isLoading: false,
    isDetailLoading: false,
    setProjects: (projects, pagination) => set({ projects, pagination }),
    setSelectedProject: (project) => set({ selectedProject: project }),
    appendMilestone: (milestone) => set((state) => {
        if (!state.selectedProject)
            return state;
        return {
            selectedProject: {
                ...state.selectedProject,
                milestones: [...(state.selectedProject.milestones ?? []), milestone],
            },
        };
    }),
    updateMilestoneInStore: (milestoneId, patch) => set((state) => {
        if (!state.selectedProject)
            return state;
        return {
            selectedProject: {
                ...state.selectedProject,
                milestones: (state.selectedProject.milestones ?? []).map((m) => m._id === milestoneId ? { ...m, ...patch } : m),
            },
        };
    }),
    removeProject: (id) => set((state) => ({ projects: state.projects.filter((p) => p._id !== id) })),
    updateProjectInList: (id, patch) => set((state) => ({
        projects: state.projects.map((p) => (p._id === id ? { ...p, ...patch } : p)),
    })),
    setFilters: (partial) => set((state) => ({ filters: { ...state.filters, ...partial } })),
    setLoading: (v) => set({ isLoading: v }),
    setDetailLoading: (v) => set({ isDetailLoading: v }),
    resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
const DEFAULT_DOC_FILTERS: DocumentFilters = { projectId: '', documentType: '', status: '', tag: '', page: 1, limit: 10 };
interface DocumentSlice {
    documents: ProjectDocument[];
    selectedDocument: ProjectDocument | null;
    docPagination: DocumentPagination | null;
    docFilters: DocumentFilters;
    isDocLoading: boolean;
    isUploading: boolean;
    setDocuments: (docs: ProjectDocument[], pagination: DocumentPagination) => void;
    setSelectedDocument: (doc: ProjectDocument | null) => void;
    appendDocument: (doc: ProjectDocument) => void;
    updateDocumentInStore: (id: string, patch: Partial<ProjectDocument>) => void;
    removeDocument: (id: string) => void;
    setDocFilters: (partial: Partial<DocumentFilters>) => void;
    setDocLoading: (v: boolean) => void;
    setUploading: (v: boolean) => void;
    resetDocFilters: (projectId?: string) => void;
}
export const useDocumentStore = create<DocumentSlice>()((set) => ({
    documents: [],
    selectedDocument: null,
    docPagination: null,
    docFilters: DEFAULT_DOC_FILTERS,
    isDocLoading: false,
    isUploading: false,
    setDocuments: (docs, pagination) => set({ documents: docs, docPagination: pagination }),
    setSelectedDocument: (doc) => set({ selectedDocument: doc }),
    appendDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
    updateDocumentInStore: (id, patch) => set((state) => ({
        documents: state.documents.map((d) => (d._id === id ? { ...d, ...patch } : d)),
        selectedDocument: state.selectedDocument?._id === id
            ? { ...state.selectedDocument, ...patch }
            : state.selectedDocument,
    })),
    removeDocument: (id) => set((state) => ({ documents: state.documents.filter((d) => d._id !== id) })),
    setDocFilters: (partial) => set((state) => ({ docFilters: { ...state.docFilters, ...partial } })),
    setDocLoading: (v) => set({ isDocLoading: v }),
    setUploading: (v) => set({ isUploading: v }),
    resetDocFilters: (projectId = '') => set({ docFilters: { ...DEFAULT_DOC_FILTERS, projectId } }),
}));
const DEFAULT_CHECKLIST_FILTERS: ChecklistFilters = { projectId: '', category: '', page: 1, limit: 50 };
const DEFAULT_INSPECTION_FILTERS: InspectionFilters = { projectId: '', riskLevel: '', actionStatus: '', inspectionType: '', isResolved: '', page: 1, limit: 10 };
interface ComplianceSlice {
    checklists: ComplianceChecklist[];
    selectedChecklist: ComplianceChecklist | null;
    checklistPagination: CompliancePagination | null;
    checklistFilters: ChecklistFilters;
    isChecklistLoading: boolean;
    inspections: SafetyInspection[];
    inspectionPagination: CompliancePagination | null;
    inspectionFilters: InspectionFilters;
    isInspectionLoading: boolean;
    setChecklists: (data: ComplianceChecklist[], pagination: CompliancePagination) => void;
    setSelectedChecklist: (c: ComplianceChecklist | null) => void;
    appendChecklist: (c: ComplianceChecklist) => void;
    updateChecklistInStore: (id: string, patch: Partial<ComplianceChecklist>) => void;
    removeChecklist: (id: string) => void;
    setChecklistFilters: (partial: Partial<ChecklistFilters>) => void;
    setChecklistLoading: (v: boolean) => void;
    setInspections: (data: SafetyInspection[], pagination: CompliancePagination) => void;
    appendInspection: (i: SafetyInspection) => void;
    updateInspectionInStore: (id: string, patch: Partial<SafetyInspection>) => void;
    removeInspection: (id: string) => void;
    setInspectionFilters: (partial: Partial<InspectionFilters>) => void;
    setInspectionLoading: (v: boolean) => void;
    resetComplianceFilters: (projectId?: string) => void;
}
export const useComplianceStore = create<ComplianceSlice>()((set) => ({
    checklists: [],
    selectedChecklist: null,
    checklistPagination: null,
    checklistFilters: DEFAULT_CHECKLIST_FILTERS,
    isChecklistLoading: false,
    inspections: [],
    inspectionPagination: null,
    inspectionFilters: DEFAULT_INSPECTION_FILTERS,
    isInspectionLoading: false,
    setChecklists: (data, pagination) => set({ checklists: data, checklistPagination: pagination }),
    setSelectedChecklist: (c) => set({ selectedChecklist: c }),
    appendChecklist: (c) => set((state) => ({ checklists: [c, ...state.checklists] })),
    updateChecklistInStore: (id, patch) => set((state) => ({
        checklists: state.checklists.map((c) => (c._id === id ? { ...c, ...patch } : c)),
        selectedChecklist: state.selectedChecklist?._id === id
            ? { ...state.selectedChecklist, ...patch }
            : state.selectedChecklist,
    })),
    removeChecklist: (id) => set((state) => ({
        checklists: state.checklists.filter((c) => c._id !== id),
        selectedChecklist: state.selectedChecklist?._id === id ? null : state.selectedChecklist,
    })),
    setChecklistFilters: (partial) => set((state) => ({ checklistFilters: { ...state.checklistFilters, ...partial } })),
    setChecklistLoading: (v) => set({ isChecklistLoading: v }),
    setInspections: (data, pagination) => set({ inspections: data, inspectionPagination: pagination }),
    appendInspection: (i) => set((state) => ({ inspections: [i, ...state.inspections] })),
    updateInspectionInStore: (id, patch) => set((state) => ({
        inspections: state.inspections.map((i) => (i._id === id ? { ...i, ...patch } : i)),
    })),
    removeInspection: (id) => set((state) => ({ inspections: state.inspections.filter((i) => i._id !== id) })),
    setInspectionFilters: (partial) => set((state) => ({ inspectionFilters: { ...state.inspectionFilters, ...partial } })),
    setInspectionLoading: (v) => set({ isInspectionLoading: v }),
    resetComplianceFilters: (projectId = '') => set({
        checklistFilters: { ...DEFAULT_CHECKLIST_FILTERS, projectId },
        inspectionFilters: { ...DEFAULT_INSPECTION_FILTERS, projectId },
    }),
}));
interface DashboardSlice extends DashboardData {
    isDashboardLoading: boolean;
    setDashboard: (data: Partial<DashboardData>) => void;
    setDashboardLoading: (v: boolean) => void;
}
export const useDashboardStore = create<DashboardSlice>()((set) => ({
    projects: [],
    activeCount: 0,
    pendingApprovals: 0,
    highRiskCount: 0,
    avgSustainability: 0,
    upcomingDueDates: [],
    isDashboardLoading: false,
    setDashboard: (data) => set((state) => ({ ...state, ...data })),
    setDashboardLoading: (v) => set({ isDashboardLoading: v }),
}));
export const useAppStore = create(() => ({}));
