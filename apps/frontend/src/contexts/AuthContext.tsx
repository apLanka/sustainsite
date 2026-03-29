import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, tokenManager } from '@/lib/api';
import type { User, AuthContextType, RegisterRequest } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Configuration ---
const USE_MOCK_AUTH = true; // Set to true to bypass login for development
// --------------------

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // If mock auth is enabled, set a default user and bypass checks
      if (USE_MOCK_AUTH) {
        const mockUser: User = {
          userId: 'mock-123',
          fullName: 'Sarah Jenkins',
          email: 'sarah@sustainsite.com',
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date(),
        };
        setUser(mockUser);
        setToken('mock-token');
        setIsLoading(false);
        return;
      }

      const storedToken = tokenManager.getToken();
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        try {
          const response = await authApi.getCurrentUser();
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          tokenManager.removeToken();
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });

      const { token: newToken, ...userData } = response.data;

      tokenManager.setToken(newToken);
      setToken(newToken);

      const userObj: User = {
        userId: userData.userId,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
        isActive: true,
        createdAt: new Date(),
      };

      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);

      const { token: newToken, ...userData } = response.data;

      tokenManager.setToken(newToken);
      setToken(newToken);

      const userObj: User = {
        userId: userData.userId,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
        isActive: true,
        createdAt: new Date(),
      };

      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    tokenManager.removeToken();
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const response = await authApi.getCurrentUser();
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {

      logout();
    }
  }, [token, logout]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
