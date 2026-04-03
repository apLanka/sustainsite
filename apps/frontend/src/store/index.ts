import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

export const useAuthStore = create<AuthSlice>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
    }),
    { name: 'sustainsite-auth' }
  )
);

// ---------------------------------------------------------------------------
// Generic app store — extend as new slices are added
// ---------------------------------------------------------------------------
export const useAppStore = create(() => ({}));