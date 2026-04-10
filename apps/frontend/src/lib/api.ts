import axios, {type AxiosInstance} from 'axios';
import type {AuthResponse, UserResponse} from '@/types/auth';
import type {
  CreateMilestonePayload,
  CreateProjectPayload,
  Milestone,
  Project,
  ProjectFilters,
  UpdateMilestonePayload,
  UpdateProjectPayload,
} from '@/types/project';
import type {
  DocumentFilters,
  DocumentPagination,
  ProjectDocument,
  UpdateDocumentPayload,
  UploadDocumentPayload,
} from '@/types/document';
import type {
  ChecklistFilters,
  ComplianceChecklist,
  CompliancePagination,
  CreateChecklistPayload,
  CreateInspectionPayload,
  InspectionFilters,
  SafetyInspection,
  UpdateChecklistPayload,
  UpdateInspectionPayload,
} from '@/types/compliance';
import type {
  CreateEquipmentPayload,
  CreateMaterialPayload,
  CreateSupplierPayload,
  EquipmentAsset,
  MaterialAsset,
  ResourceSummary,
  Supplier,
} from '@/types/resources';
import type {SustainabilityMetric, SustainabilityScore, SustainabilityTrend} from '@/types/sustainability';
import {attachInterceptors} from './interceptors';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

attachInterceptors(api);

export const authApi = {
  register: async (data: {
    fullName: string;
    email: string;
    password: string;
    role: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>('/auth/me');
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.patch('/auth/change-password', data);
  },

  updateProfile: async (data: { fullName: string; email: string; jobTitle?: string }): Promise<UserResponse> => {
    const response = await api.patch<UserResponse>('/auth/profile', data);
    return response.data;
  },
};

export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token');
  },

  // remember=true  → persists across browser restarts (localStorage)
  // remember=false → cleared when the tab/browser closes (sessionStorage)
  setToken: (token: string, remember = true): void => {
    if (remember) {
      localStorage.setItem('auth_token', token);
      sessionStorage.removeItem('auth_token');
    } else {
      sessionStorage.setItem('auth_token', token);
      localStorage.removeItem('auth_token');
    }
  },

  removeToken: (): void => {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
  },
};

// ---------------------------------------------------------------------------
// Shared response shapes
// ---------------------------------------------------------------------------

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface DocumentPaginatedResponse {
  success: boolean;
  data: ProjectDocument[];
  pagination: DocumentPagination;
}

interface SingleResponse<T> {
  success: boolean;
  data: T;
}

// ---------------------------------------------------------------------------
// Project API
// ---------------------------------------------------------------------------

export const projectApi = {
  getProjects: async (filters: Partial<ProjectFilters> = {}): Promise<PaginatedResponse<Project>> => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    const response = await api.get<PaginatedResponse<Project>>(`/projects?${params.toString()}`);
    return response.data;
  },

  getProjectById: async (id: string): Promise<SingleResponse<Project>> => {
    const response = await api.get<SingleResponse<Project>>(`/projects/${id}`);
    return response.data;
  },

  createProject: async (data: CreateProjectPayload): Promise<SingleResponse<Project>> => {
    const response = await api.post<SingleResponse<Project>>('/projects', data);
    return response.data;
  },

  updateProject: async (id: string, data: UpdateProjectPayload): Promise<SingleResponse<Project>> => {
    const response = await api.put<SingleResponse<Project>>(`/projects/${id}`, data);
    return response.data;
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  addMilestone: async (projectId: string, data: CreateMilestonePayload): Promise<SingleResponse<Milestone>> => {
    const response = await api.post<SingleResponse<Milestone>>(`/projects/${projectId}/milestones`, data);
    return response.data;
  },

  updateMilestone: async (
    projectId: string,
    milestoneId: string,
    data: UpdateMilestonePayload
  ): Promise<SingleResponse<Milestone>> => {
    const response = await api.put<SingleResponse<Milestone>>(
      `/projects/${projectId}/milestones/${milestoneId}`,
      data
    );
    return response.data;
  },

  getTimeline: async (id: string): Promise<SingleResponse<{ project: Partial<Project>; milestones: Milestone[] }>> => {
    const response = await api.get(`/projects/${id}/timeline`);
    return response.data;
  },

  getFinancialSummary: async (id: string): Promise<SingleResponse<{
    projectId: string;
    projectName: string;
    budget: number;
    totalSpend: number;
    remainingBudget: number;
    spendPercentage: number;
    remainingValue: number;
    materialCount: number;
    allocationMix: { category: string; cost: number; percentage: number }[];
  }>> => {
    const response = await api.get(`/projects/${id}/financial-summary`);
    return response.data;
  },
};

// ---------------------------------------------------------------------------
// Resources API
// ---------------------------------------------------------------------------

export const resourcesApi = {
  getMaterials: async (
      projectId: string,
      page = 1,
      limit = 10
  ): Promise<PaginatedResponse<MaterialAsset>> => {
    const params = new URLSearchParams({
      projectId,
      page: String(page),
      limit: String(limit),
    });
    const response = await api.get<PaginatedResponse<MaterialAsset>>(
        `/resources/materials?${params.toString()}`
    );
    return response.data;
  },

  createMaterial: async (data: CreateMaterialPayload): Promise<SingleResponse<MaterialAsset>> => {
    const response = await api.post<SingleResponse<MaterialAsset>>('/resources/materials', data);
    return response.data;
  },

  createEquipment: async (data: CreateEquipmentPayload): Promise<SingleResponse<EquipmentAsset>> => {
    const response = await api.post<SingleResponse<EquipmentAsset>>('/resources/equipment', data);
    return response.data;
  },

  getEquipment: async (
      projectId: string,
      status?: string,
      page = 1,
      limit = 10
  ): Promise<PaginatedResponse<EquipmentAsset>> => {
    const params = new URLSearchParams({
      projectId,
      page: String(page),
      limit: String(limit),
    });
    if (status) params.set('status', status);
    const response = await api.get<PaginatedResponse<EquipmentAsset>>(
        `/resources/equipment?${params.toString()}`
    );
    return response.data;
  },

  getAvailableEquipment: async (
      page = 1,
      limit = 10
  ): Promise<PaginatedResponse<EquipmentAsset>> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    const response = await api.get<PaginatedResponse<EquipmentAsset>>(
        `/resources/equipment/list/available?${params.toString()}`
    );
    return response.data;
  },

  getSuppliers: async (
      isActive = true,
      page = 1,
      limit = 10
  ): Promise<PaginatedResponse<Supplier>> => {
    const params = new URLSearchParams({
      isActive: String(isActive),
      page: String(page),
      limit: String(limit),
    });
    const response = await api.get<PaginatedResponse<Supplier>>(
        `/resources/suppliers?${params.toString()}`
    );
    return response.data;
  },

    createSupplier: async (data: CreateSupplierPayload): Promise<SingleResponse<Supplier>> => {
        const response = await api.post<SingleResponse<Supplier>>('/resources/suppliers', data);
        return response.data;
    },

  getCostSummary: async (projectId: string): Promise<SingleResponse<ResourceSummary>> => {
    const response = await api.get<SingleResponse<ResourceSummary>>(
        `/resources/materials/${projectId}/cost-summary`
    );
    return response.data;
  },
};

// ---------------------------------------------------------------------------
// Sustainability API
// ---------------------------------------------------------------------------

export const sustainabilityApi = {
  createMetric: async (data: {
    projectId: string;
    carbonEmissions: { transportation: number; equipment: number; materials: number };
    energyConsumption: { electricity: number; diesel: number; renewableEnergy: number };
    wasteManagement: { recyclable: number; nonRecyclable: number; hazardous: number };
    waterUsage: { municipal: number; recycled: number };
    recordedDate: string;
    notes?: string;
  }): Promise<SingleResponse<SustainabilityMetric>> => {
    const response = await api.post<SingleResponse<SustainabilityMetric>>('/sustainability', data);
    return response.data;
  },

  getProjectScore: async (projectId: string): Promise<SingleResponse<SustainabilityScore>> => {
    const response = await api.get<SingleResponse<SustainabilityScore>>(
        `/sustainability/projects/${projectId}/score`
    );
    return response.data;
  },

  getProjectTrends: async (projectId: string): Promise<SingleResponse<SustainabilityTrend[]>> => {
    const response = await api.get<SingleResponse<SustainabilityTrend[]>>(
        `/sustainability/projects/${projectId}/trends`
    );
    return response.data;
  },

  getLatestMetric: async (projectId: string): Promise<SingleResponse<SustainabilityMetric>> => {
    const response = await api.get<SingleResponse<SustainabilityMetric>>(
        `/sustainability/projects/${projectId}/metrics/latest`
    );
    return response.data;
  },

  getProjectMetrics: async (projectId: string): Promise<PaginatedResponse<SustainabilityMetric>> => {
    const params = new URLSearchParams({projectId});
    const response = await api.get<PaginatedResponse<SustainabilityMetric>>(
        `/sustainability/projects/${projectId}/metrics?${params.toString()}`
    );
    return response.data;
  },
};

// ---------------------------------------------------------------------------
// Document API
// ---------------------------------------------------------------------------

export const documentApi = {
  upload: async (payload: UploadDocumentPayload): Promise<SingleResponse<ProjectDocument>> => {
    const form = new FormData();
    form.append('file', payload.file);
    form.append('projectId', payload.projectId);
    form.append('documentType', payload.documentType);
    form.append('title', payload.title);
    if (payload.description) form.append('description', payload.description);
    if (payload.version)     form.append('version', payload.version);
    if (payload.tags?.length) form.append('tags', JSON.stringify(payload.tags));
    const response = await api.post<SingleResponse<ProjectDocument>>('/documents', form, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },

  getDocuments: async (filters: Partial<DocumentFilters>): Promise<DocumentPaginatedResponse> => {
    const params: Record<string, string> = {};
    if (filters.projectId)    params.projectId    = filters.projectId;
    if (filters.documentType) params.documentType = filters.documentType;
    if (filters.status)       params.status       = filters.status;
    if (filters.tag)          params.tag          = filters.tag;
    if (filters.page)         params.page         = String(filters.page);
    if (filters.limit)        params.limit        = String(filters.limit);
    const response = await api.get<DocumentPaginatedResponse>('/documents', { params });
    return response.data;
  },

  getById: async (id: string): Promise<SingleResponse<ProjectDocument>> => {
    const response = await api.get<SingleResponse<ProjectDocument>>(`/documents/${id}`);
    return response.data;
  },

  update: async (id: string, payload: UpdateDocumentPayload): Promise<SingleResponse<ProjectDocument>> => {
    const response = await api.put<SingleResponse<ProjectDocument>>(`/documents/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },

  approve: async (id: string): Promise<SingleResponse<ProjectDocument>> => {
    const response = await api.put<SingleResponse<ProjectDocument>>(`/documents/${id}/approve`);
    return response.data;
  },

  reject: async (id: string, rejectionReason: string): Promise<SingleResponse<ProjectDocument>> => {
    const response = await api.put<SingleResponse<ProjectDocument>>(`/documents/${id}/reject`, { rejectionReason });
    return response.data;
  },

  createVersion: async (id: string, file: File): Promise<SingleResponse<ProjectDocument>> => {
    const form = new FormData();
    form.append('file', file);
    const response = await api.post<SingleResponse<ProjectDocument>>(`/documents/${id}/version`, form, {
      headers: { 'Content-Type': undefined },
    });
    return response.data;
  },

  // Download: backend sends a 302 redirect to Cloudinary URL.
  // Use window.open() — do not call through axios.
  getDownloadUrl: (id: string): string =>
    `${API_BASE_URL}/documents/${id}/download`,
};

// ---------------------------------------------------------------------------
// Compliance API
// ---------------------------------------------------------------------------

interface CompliancePaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: CompliancePagination;
}

export const complianceApi = {
  // ── Checklists ────────────────────────────────────────────────────────────

  createChecklist: async (payload: CreateChecklistPayload): Promise<SingleResponse<ComplianceChecklist>> => {
    const res = await api.post<SingleResponse<ComplianceChecklist>>('/compliance/checklists', payload);
    return res.data;
  },

  getChecklists: async (filters: Partial<ChecklistFilters>): Promise<CompliancePaginatedResponse<ComplianceChecklist>> => {
    const params: Record<string, string> = {};
    if (filters.projectId) params.projectId = filters.projectId;
    if (filters.category)  params.category  = filters.category;
    if (filters.page)      params.page       = String(filters.page);
    if (filters.limit)     params.limit      = String(filters.limit);
    const res = await api.get<CompliancePaginatedResponse<ComplianceChecklist>>('/compliance/checklists', { params });
    return res.data;
  },

  getChecklistById: async (id: string): Promise<SingleResponse<ComplianceChecklist>> => {
    const res = await api.get<SingleResponse<ComplianceChecklist>>(`/compliance/checklists/${id}`);
    return res.data;
  },

  updateChecklist: async (id: string, payload: UpdateChecklistPayload): Promise<SingleResponse<ComplianceChecklist>> => {
    const res = await api.put<SingleResponse<ComplianceChecklist>>(`/compliance/checklists/${id}`, payload);
    return res.data;
  },

  deleteChecklist: async (id: string): Promise<void> => {
    await api.delete(`/compliance/checklists/${id}`);
  },

  // ── Inspections ───────────────────────────────────────────────────────────

  createInspection: async (payload: CreateInspectionPayload): Promise<SingleResponse<SafetyInspection>> => {
    const res = await api.post<SingleResponse<SafetyInspection>>('/compliance/inspections', payload);
    return res.data;
  },

  getInspections: async (filters: Partial<InspectionFilters>): Promise<CompliancePaginatedResponse<SafetyInspection>> => {
    const params: Record<string, string> = {};
    if (filters.projectId)      params.projectId      = filters.projectId;
    if (filters.riskLevel)      params.riskLevel      = filters.riskLevel;
    if (filters.actionStatus)   params.actionStatus   = filters.actionStatus;
    if (filters.inspectionType) params.inspectionType = filters.inspectionType;
    if (filters.isResolved !== undefined && filters.isResolved !== '')
      params.isResolved = String(filters.isResolved);
    if (filters.page)  params.page  = String(filters.page);
    if (filters.limit) params.limit = String(filters.limit);
    const res = await api.get<CompliancePaginatedResponse<SafetyInspection>>('/compliance/inspections', { params });
    return res.data;
  },

  getInspectionById: async (id: string): Promise<SingleResponse<SafetyInspection>> => {
    const res = await api.get<SingleResponse<SafetyInspection>>(`/compliance/inspections/${id}`);
    return res.data;
  },

  updateInspection: async (id: string, payload: UpdateInspectionPayload): Promise<SingleResponse<SafetyInspection>> => {
    const res = await api.put<SingleResponse<SafetyInspection>>(`/compliance/inspections/${id}`, payload);
    return res.data;
  },

  deleteInspection: async (id: string): Promise<void> => {
    await api.delete(`/compliance/inspections/${id}`);
  },
};

// ---------------------------------------------------------------------------
// Dashboard API
// ---------------------------------------------------------------------------

export const dashboardApi = {
  // Top 6 recent projects (all statuses)
  getRecentProjects: async (): Promise<PaginatedResponse<Project>> => {
    const res = await api.get<PaginatedResponse<Project>>('/projects', { params: { limit: 6 } });
    return res.data;
  },

  // Total in-progress project count only — use pagination.total
  getActiveProjectCount: async (): Promise<number> => {
    const res = await api.get<PaginatedResponse<Project>>('/projects', { params: { status: 'In Progress', limit: 1 } });
    return res.data.pagination.total;
  },

  // Total pending document approvals — use pagination.total
  getPendingApprovals: async (): Promise<number> => {
    const res = await api.get<DocumentPaginatedResponse>('/documents', { params: { status: 'Under Review', limit: 1 } });
    return res.data.pagination.total;
  },

  // High + Critical unresolved inspection count
  getHighRiskCount: async (): Promise<number> => {
    const [high, critical] = await Promise.all([
      api.get<CompliancePaginatedResponse<SafetyInspection>>('/compliance/inspections', { params: { riskLevel: 'High', isResolved: 'false', limit: 1 } }),
      api.get<CompliancePaginatedResponse<SafetyInspection>>('/compliance/inspections', { params: { riskLevel: 'Critical', isResolved: 'false', limit: 1 } }),
    ]);
    return high.data.pagination.total + critical.data.pagination.total;
  },

  // Checklists with due dates across all projects (for upcoming roadmap)
  getUpcomingChecklists: async (): Promise<CompliancePaginatedResponse<ComplianceChecklist>> => {
    const res = await api.get<CompliancePaginatedResponse<ComplianceChecklist>>('/compliance/checklists', { params: { limit: 50 } });
    return res.data;
  },
};

export default api;
