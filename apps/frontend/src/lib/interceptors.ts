import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { tokenManager } from './api';
export interface ApiError {
  message: string;
  status?: number;
  errors?: string[];
}
export function attachInterceptors(instance: AxiosInstance): void {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenManager.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (
      error: AxiosError<{
        message?: string;
        errors?: string[];
      }>
    ) => {
      if (error.response?.status === 401 && tokenManager.getToken()) {
        tokenManager.removeToken();
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      const apiError: ApiError = {
        message: error.response?.data?.message ?? error.message ?? 'An unexpected error occurred',
        status: error.response?.status,
        errors: error.response?.data?.errors,
      };
      return Promise.reject(apiError);
    }
  );
}
