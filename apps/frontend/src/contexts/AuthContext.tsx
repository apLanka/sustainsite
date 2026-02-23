import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, tokenManager } from '@/lib/api';
import type { User, AuthContextType, RegisterRequest } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = tokenManager.getToken();
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // Verify token is still valid by fetching current user
        try {
          const response = await authApi.getCurrentUser();
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          // Token is invalid, clear auth state
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

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });

      const { token: newToken, ...userData } = response.data;

      // Store token and user data
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

  // Register function
  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);

      const { token: newToken, ...userData } = response.data;

      // Store token and user data
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

  // Logout function
  const logout = useCallback(() => {
    tokenManager.removeToken();
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const response = await authApi.getCurrentUser();
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      // If refresh fails, logout
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
