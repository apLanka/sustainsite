import axios, { AxiosError, type AxiosInstance } from 'axios';
import type { AuthResponse, UserResponse, ErrorResponse } from '@/types/auth';

// API base URL - update this to match your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    // Handle 401 Unauthorized - clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Return formatted error
    const errorMessage =
      error.response?.data?.message || error.message || 'An unexpected error occurred';

    return Promise.reject({
      message: errorMessage,
      errors: error.response?.data?.errors,
      status: error.response?.status,
    });
  }
);

// Auth API endpoints
export const authApi = {
  // Register new user
  register: async (data: {
    fullName: string;
    email: string;
    password: string;
    role: string;
    phoneNumber?: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>('/auth/me');
    return response.data;
  },
};

// Token management
export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  setToken: (token: string): void => {
    localStorage.setItem('auth_token', token);
  },

  removeToken: (): void => {
    localStorage.removeItem('auth_token');
  },
};

export default api;
