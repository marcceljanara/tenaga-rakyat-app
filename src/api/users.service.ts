import api from './axios';
import type {
    ApiResponse,
    User,
    UpdateProfileData,
    UpdateLocationData,
    UpdateLocationResponse,
    UserPhoto,
    UserProfile,
    Application,
    ApplicationSearchParams,
    WorkerApplications,
} from '../types';

export const usersService = {
    // ========================================
    // Profile Endpoints
    // ========================================

    // Get current user profile with role, photos, and all details
    getProfile: async (): Promise<ApiResponse<User>> => {
        const response = await api.get('/api/users/profile');
        return response.data;
    },

    // Get user profile by ID (public view)
    getProfileById: async (id: string): Promise<ApiResponse<UserProfile>> => {
        const response = await api.get(`/api/users/profile/${id}`);
        return response.data;
    },

    // Update profile information (full_name, phone_number, about, cv_url, location_label)
    updateProfile: async (data: UpdateProfileData): Promise<ApiResponse<User>> => {
        const response = await api.put('/api/users/profile', data);
        return response.data;
    },

    // Update user location (latitude, longitude)
    updateLocation: async (data: UpdateLocationData): Promise<UpdateLocationResponse> => {
        const response = await api.put('/api/users/profile/location', data);
        return response.data;
    },

    // Upload or update profile picture (max 2MB, JPEG/PNG/WebP)
    uploadProfilePicture: async (file: File): Promise<ApiResponse<{ profile_picture_url: string }>> => {
        const formData = new FormData();
        formData.append('profile_picture', file);
        const response = await api.post('/api/users/profile/picture', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // Delete profile picture
    deleteProfilePicture: async (): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.delete('/api/users/profile/picture');
        return response.data;
    },

    // ========================================
    // Photo Portfolio Endpoints
    // ========================================

    // Get all photos for logged-in user (sorted by creation date, newest first)
    getPhotos: async (): Promise<ApiResponse<UserPhoto[]>> => {
        const response = await api.get('/api/users/photos');
        return response.data;
    },

    // Get specific photo details
    getPhotoDetail: async (photoId: number | string): Promise<ApiResponse<UserPhoto>> => {
        const response = await api.get(`/api/users/photos/${photoId}`);
        return response.data;
    },

    // Upload new photo to portfolio (max 5MB, JPEG/PNG/WebP)
    uploadPhoto: async (file: File, description: string): Promise<ApiResponse<UserPhoto>> => {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('description', description);
        const response = await api.post('/api/users/photos', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // Update photo description
    updatePhoto: async (photoId: number | string, description: string): Promise<ApiResponse<UserPhoto>> => {
        const response = await api.put(`/api/users/photos/${photoId}`, { description });
        return response.data;
    },

    // Delete photo from portfolio and storage
    deletePhoto: async (photoId: number | string): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.delete(`/api/users/photos/${photoId}`);
        return response.data;
    },

    // ========================================
    // Worker Application Endpoints
    // ========================================

    // Get worker's application history with filtering
    getApplications: async (params?: ApplicationSearchParams): Promise<ApiResponse<WorkerApplications>> => {
        const response = await api.get('/api/users/applications', { params });
        return response.data;
    },

    // Search applications by keyword (job title, description, provider name)
    searchApplications: async (
        keyword: string,
        params?: ApplicationSearchParams
    ): Promise<ApiResponse<Application[]>> => {
        const response = await api.get('/api/users/applications/search', {
            params: { keyword, ...params },
        });
        return response.data;
    },
};
