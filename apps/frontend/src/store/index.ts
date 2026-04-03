import { create } from 'zustand';
import type { User } from '@/types/auth';
import type { Project, Milestone, Pagination, ProjectFilters } from '@/types/project';

// ---------------------------------------------------------------------------
// Auth slice
// ---------------------------------------------------------------------------
interface AuthSlice {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

// No persist — token lifecycle is owned by tokenManager (localStorage / sessionStorage).
// AuthContext.initAuth re-hydrates this store from tokenManager on every page load.
export const useAuthStore = create<AuthSlice>()((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  clearAuth: () => set({ user: null, token: null }),
}));

// ---------------------------------------------------------------------------
// Project slice
// ---------------------------------------------------------------------------

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

  appendMilestone: (milestone) =>
    set((state) => {
      if (!state.selectedProject) return state;
      return {
        selectedProject: {
          ...state.selectedProject,
          milestones: [...(state.selectedProject.milestones ?? []), milestone],
        },
      };
    }),

  removeProject: (id) =>
    set((state) => ({ projects: state.projects.filter((p) => p._id !== id) })),

  updateProjectInList: (id, patch) =>
    set((state) => ({
      projects: state.projects.map((p) => (p._id === id ? { ...p, ...patch } : p)),
    })),

  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),

  setLoading: (v) => set({ isLoading: v }),
  setDetailLoading: (v) => set({ isDetailLoading: v }),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));

// ---------------------------------------------------------------------------
// Generic app store — extend as new slices are added
// ---------------------------------------------------------------------------
export const useAppStore = create(() => ({}));