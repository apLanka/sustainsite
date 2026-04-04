import axios, { type AxiosInstance } from 'axios';
import type { AuthResponse, UserResponse } from '@/types/auth';
import type {
  Project,
  Milestone,
  ProjectFilters,
  CreateProjectPayload,
  UpdateProjectPayload,
  CreateMilestonePayload,
  UpdateMilestonePayload,
} from '@/types/project';
import { attachInterceptors } from './interceptors';

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
// Project API
// ---------------------------------------------------------------------------

interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface SingleResponse<T> {
  success: boolean;
  data: T;
}

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
};

export default api;
