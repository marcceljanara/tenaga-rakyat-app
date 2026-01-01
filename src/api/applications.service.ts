import api from './axios';
import type {
    ApiResponse,
    Application,
    Applications,
    CreateApplicationData,
    ApplicationStatistics,
    ApplicationSearchParams,
    ApplicationSearchFilters,
    WorkerApplicationDetail,
} from '../types';

export const applicationsService = {
    // ========================================
    // Worker Endpoints
    // ========================================

    // Apply for a job
    apply: async (jobId: number | string, data: CreateApplicationData): Promise<ApiResponse<Application>> => {
        const response = await api.post(`/api/jobs/${jobId}/applications`, data);
        return response.data;
    },

    // Cancel application (only PENDING/UNDER_REVIEW can be cancelled)
    cancel: async (applicationId: number | string): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.delete(`/api/applications/${applicationId}`);
        return response.data;
    },

    // Get worker's application history
    getUserApplications: async (params?: ApplicationSearchParams): Promise<ApiResponse<Applications>> => {
        const response = await api.get('/api/users/applications', { params });
        return response.data;
    },

    // Search applications by keyword (job title, description, provider name)
    searchUserApplications: async (
        params: ApplicationSearchFilters
    ): Promise<ApiResponse<Applications>> => {
        const response = await api.get('/api/users/applications/search', { params });
        return response.data;
    },

    // ========================================
    // Shared Endpoints (Worker or Employer)
    // ========================================

    // Get application detail (generic)
    getDetail: async (applicationId: number | string): Promise<ApiResponse<Application>> => {
        const response = await api.get(`/api/applications/${applicationId}`);
        return response.data;
    },

    // Get application detail for worker (with provider info)
    getWorkerDetail: async (applicationId: number | string): Promise<ApiResponse<WorkerApplicationDetail>> => {
        const response = await api.get(`/api/applications/${applicationId}`);
        return response.data;
    },

    // ========================================
    // Employer Endpoints
    // ========================================

    // Get applications for a specific job with filtering and pagination
    getJobApplications: async (
        jobId: number | string,
        params?: ApplicationSearchParams
    ): Promise<ApiResponse<Applications>> => {
        const response = await api.get(`/api/jobs/${jobId}/applications`, { params });
        return response.data;
    },

    // Get application statistics for a job
    getJobStatistics: async (jobId: number | string): Promise<ApiResponse<ApplicationStatistics>> => {
        const response = await api.get(`/api/jobs/${jobId}/applications/statistics`);
        return response.data;
    },

    // Update application status (ACCEPTED/REJECTED)
    // - ACCEPTED: Creates escrow and assigns job to worker
    // - REJECTED: Rejects the application
    updateStatus: async (
        applicationId: number | string,
        status: 'ACCEPTED' | 'REJECTED'
    ): Promise<ApiResponse<Application>> => {
        const response = await api.patch(`/api/applications/${applicationId}`, { status });
        return response.data;
    },
};
