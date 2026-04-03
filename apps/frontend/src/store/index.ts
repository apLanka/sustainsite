import { create } from 'zustand';
import type { User } from '@/types/auth';

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
// Generic app store — extend as new slices are added
// ---------------------------------------------------------------------------
export const useAppStore = create(() => ({}));