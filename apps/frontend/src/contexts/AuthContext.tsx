import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, tokenManager } from '@/lib/api';
import type { User, AuthContextType, RegisterRequest } from '@/types/auth';
import { useAuthStore } from '@/store';
const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USE_MOCK_AUTH = false;
export const AuthProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const { user, token, setAuth, clearAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const initAuth = async () => {
            if (USE_MOCK_AUTH) {
                const mockUser: User = {
                    userId: 'mock-123',
                    fullName: 'Sarah Jenkins',
                    email: 'sarah@sustainsite.com',
                    role: 'ADMIN',
                    isActive: true,
                    createdAt: new Date(),
                };
                setAuth(mockUser, 'mock-token');
                setIsLoading(false);
                return;
            }
            const storedToken = tokenManager.getToken();
            if (storedToken) {
                try {
                    const response = await authApi.getCurrentUser();
                    setAuth(response.data, storedToken);
                }
                catch {
                    clearAuth();
                    tokenManager.removeToken();
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, [clearAuth, setAuth]);
    const login = useCallback(async (email: string, password: string, remember = false) => {
        setIsLoading(true);
        try {
            const response = await authApi.login({ email, password });
            const { token: newToken, userId, fullName, email: userEmail, role } = response.data;
            const userObj: User = {
                userId,
                fullName,
                email: userEmail,
                role,
                isActive: true,
                createdAt: new Date(),
            };
            tokenManager.setToken(newToken, remember);
            setAuth(userObj, newToken);
        }
        finally {
            setIsLoading(false);
        }
    }, [setAuth]);
    const register = useCallback(async (data: RegisterRequest) => {
        setIsLoading(true);
        try {
            const response = await authApi.register(data);
            const { token: newToken, userId, fullName, email, role } = response.data;
            const userObj: User = {
                userId,
                fullName,
                email,
                role,
                isActive: true,
                createdAt: new Date(),
            };
            tokenManager.setToken(newToken);
            setAuth(userObj, newToken);
        }
        finally {
            setIsLoading(false);
        }
    }, [setAuth]);
    const logout = useCallback(() => {
        tokenManager.removeToken();
        clearAuth();
    }, [clearAuth]);
    const refreshUser = useCallback(async () => {
        if (!token)
            return;
        try {
            const response = await authApi.getCurrentUser();
            setAuth(response.data, token);
        }
        catch {
            logout();
        }
    }, [token, setAuth, logout]);
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
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
