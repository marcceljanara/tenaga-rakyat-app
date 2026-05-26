import api, { fetchCsrfToken } from './axios';
import type {
    ApiResponse,
    User,
    LoginCredentials,
    RegisterData,
    EmailVerificationPurpose,
    EmailVerificationResponse,
    ResetPasswordData,
} from '../types';

export const authService = {
    // Login user - sets HTTP-only cookies (access_token, refresh_token)
    login: async (credentials: LoginCredentials): Promise<ApiResponse<{ message: string }>> => {
        // Fetch CSRF token first
        await fetchCsrfToken();

        const response = await api.post('/api/users/login', credentials);

        // Fetch new CSRF token after login since session rotation invalidates the old one
        await fetchCsrfToken();

        return response.data;
    },

    // Logout user - clears cookies and deletes refresh token from database
    logout: async (): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.post('/api/users/logout');
        return response.data;
    },

    // Refresh token - refreshes access token using refresh token from cookie
    refresh: async (): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.post('/api/users/refresh');
        return response.data;
    },

    // Register new user - creates user and wallet, sends verification email
    register: async (data: RegisterData): Promise<ApiResponse<User>> => {
        await fetchCsrfToken();
        const response = await api.post('/api/users', data);
        return response.data;
    },

    // Verify email - verifies email using token for registration or email change
    verifyEmail: async (token: string): Promise<ApiResponse<EmailVerificationResponse>> => {
        const response = await api.post('/api/auth/verify-email', { token });
        return response.data;
    },

    // Resend verification email - resends verification email to user
    resendVerification: async (purpose: EmailVerificationPurpose): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.post('/api/auth/resend-verification', { purpose });
        return response.data;
    },

    // Request password reset - sends password reset email (public endpoint)
    forgotPassword: async (email: string): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.post('/api/auth/forgot-password', { email });
        return response.data;
    },

    // Reset password - resets password using token (public endpoint)
    resetPassword: async (data: ResetPasswordData): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.post('/api/auth/reset-password', data);
        return response.data;
    },

    // Request email change - sends verification to new email address (authenticated)
    changeEmail: async (newEmail: string): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.post('/api/auth/change-email', { newEmail });
        return response.data;
    },
};
