import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Critical: Include cookies in requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// CSRF Token Global State
let csrfToken: string | null = null;
let isFetchingCsrf = false;
let csrfQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

export const fetchCsrfToken = async (): Promise<string> => {
    if (isFetchingCsrf) {
        return new Promise((resolve, reject) => {
            csrfQueue.push({ resolve, reject });
        });
    }

    isFetchingCsrf = true;
    try {
        const response = await api.get('/api/users/csrf-token');
        csrfToken = response.data?.csrfToken || response.data?.data?.csrfToken;
        csrfQueue.forEach(prom => prom.resolve(csrfToken as string));
        csrfQueue = [];
        return csrfToken as string;
    } catch (error) {
        csrfQueue.forEach(prom => prom.reject(error));
        csrfQueue = [];
        throw error;
    } finally {
        isFetchingCsrf = false;
    }
};

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

// URLs that should NOT trigger token refresh on 401
const noRefreshUrls = [
    '/api/users/login',
    '/api/users/refresh',
    '/api/users/logout',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/verify-email',
];

// Request interceptor to attach CSRF token
api.interceptors.request.use(
    (config) => {
        if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
            if (csrfToken) {
                config.headers['x-csrf-token'] = csrfToken;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _csrfRetry?: boolean };

        // Handle CSRF Token expiration (403)
        if (error.response?.status === 403 && !originalRequest._csrfRetry) {
            const data = error.response.data as any;
            if (data && data.message === "invalid csrf token") {
                originalRequest._csrfRetry = true;
                try {
                    const newToken = await fetchCsrfToken();
                    if (originalRequest.headers) {
                        originalRequest.headers['x-csrf-token'] = newToken;
                    }
                    return api(originalRequest);
                } catch (csrfError) {
                    return Promise.reject(csrfError);
                }
            }
        }

        // Handle 401 Unauthorized errors
        const requestUrl = originalRequest?.url || '';
        const shouldSkipRefresh = noRefreshUrls.some((url) => requestUrl.includes(url));

        if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await api.post('/api/users/refresh');
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError as Error);
                window.dispatchEvent(new CustomEvent('auth:logout'));
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
