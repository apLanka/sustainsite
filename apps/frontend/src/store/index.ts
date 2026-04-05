import { create } from 'zustand';
import type { User } from '@/types/auth';
import type { Project, Milestone, Pagination, ProjectFilters } from '@/types/project';
import type { ProjectDocument, DocumentFilters, DocumentPagination } from '@/types/document';

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

  updateMilestoneInStore: (milestoneId, patch) =>
    set((state) => {
      if (!state.selectedProject) return state;
      return {
        selectedProject: {
          ...state.selectedProject,
          milestones: (state.selectedProject.milestones ?? []).map((m) =>
            m._id === milestoneId ? { ...m, ...patch } : m
          ),
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
// Document slice
// ---------------------------------------------------------------------------

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

  appendDocument: (doc) =>
    set((state) => ({ documents: [doc, ...state.documents] })),

  updateDocumentInStore: (id, patch) =>
    set((state) => ({
      documents: state.documents.map((d) => (d._id === id ? { ...d, ...patch } : d)),
      selectedDocument:
        state.selectedDocument?._id === id
          ? { ...state.selectedDocument, ...patch }
          : state.selectedDocument,
    })),

  removeDocument: (id) =>
    set((state) => ({ documents: state.documents.filter((d) => d._id !== id) })),

  setDocFilters: (partial) =>
    set((state) => ({ docFilters: { ...state.docFilters, ...partial } })),

  setDocLoading: (v) => set({ isDocLoading: v }),
  setUploading: (v) => set({ isUploading: v }),

  resetDocFilters: (projectId = '') =>
    set({ docFilters: { ...DEFAULT_DOC_FILTERS, projectId } }),
}));

// ---------------------------------------------------------------------------
// Generic app store — extend as new slices are added
// ---------------------------------------------------------------------------
export const useAppStore = create(() => ({}));