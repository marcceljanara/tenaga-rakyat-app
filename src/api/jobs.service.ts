import api from './axios';
import type {
    ApiResponse,
    PaginatedResponse,
    Job,
    CreateJobData,
    UpdateJobData,
    JobSearchParams,
    ProviderJobHistoryParams,
    Jobs,
} from '../types';

export const jobsService = {
    // ========================================
    // Public Endpoints
    // ========================================

    // Search jobs - public endpoint with filtering and pagination
    search: async (params?: JobSearchParams): Promise<ApiResponse<Jobs> | PaginatedResponse<Job>> => {
        const response = await api.get('/api/jobs', { params });
        return response.data;
    },

    // Get all jobs - alias for search with default params
    getAll: async (params?: JobSearchParams): Promise<ApiResponse<Jobs>> => {
        const response = await api.get('/api/jobs', { params });
        return response.data;
    },

    // Get job detail - PUBLIC endpoint (for job listings, anyone can access)
    // Does not include worker/provider contact info (email, phone)
    getPublicDetail: async (jobId: number | string): Promise<ApiResponse<Job>> => {
        const response = await api.get(`/api/jobs/${jobId}/public`);
        return response.data;
    },

    // Get job detail - PRIVATE endpoint (for employer/worker involved in the job)
    // Includes worker and provider contact info (email, phone_number)
    // Only accessible by: job provider OR accepted worker
    getPrivateDetail: async (jobId: number | string): Promise<ApiResponse<Job>> => {
        const response = await api.get(`/api/jobs/${jobId}/private`);
        return response.data;
    },

    // ========================================
    // Employer (Job Provider) Endpoints
    // ========================================

    // Create new job posting
    create: async (data: CreateJobData): Promise<ApiResponse<Job>> => {
        const response = await api.post('/api/jobs', data);
        return response.data;
    },

    // Update job information
    update: async (jobId: number | string, data: UpdateJobData): Promise<ApiResponse<Job>> => {
        const response = await api.put(`/api/jobs/${jobId}`, data);
        return response.data;
    },

    // Delete job posting
    delete: async (jobId: number | string): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.delete(`/api/jobs/${jobId}`);
        return response.data;
    },

    // Get active jobs (OPEN, ASSIGNED, IN_PROGRESS)
    getProviderActive: async (): Promise<ApiResponse<Jobs>> => {
        const response = await api.get('/api/jobs/provider/active');
        return response.data;
    },

    // Get completed jobs (COMPLETED, CANCELLED, APPROVED)
    getProviderCompleted: async (): Promise<ApiResponse<Jobs>> => {
        const response = await api.get('/api/jobs/provider/completed');
        return response.data;
    },

    // Get job history with filtering
    getProviderHistory: async (params?: ProviderJobHistoryParams): Promise<ApiResponse<Jobs>> => {
        const response = await api.get('/api/jobs/provider/history', { params });
        // console.log(response.data.jobs);
        return response.data;
    },

    // Update job status (Employer)
    // - CANCELLED: Cancel job (if no worker assigned)
    // - REJECTED: Reject completed work (max 3 times)
    // - APPROVED: Approve work and release escrow
    updateStatusEmployer: async (
        jobId: number | string,
        status: 'CANCELLED' | 'REJECTED' | 'APPROVED'
    ): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.patch(`/api/jobs/${jobId}/status/employer`, { status });
        return response.data;
    },

    // ========================================
    // Worker Endpoints
    // ========================================

    // Update job status (Worker)
    // - IN_PROGRESS: Start working on job
    // - COMPLETED: Mark job as completed
    updateStatusWorker: async (
        jobId: number | string,
        status: 'IN_PROGRESS' | 'COMPLETED'
    ): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.patch(`/api/jobs/${jobId}/status/worker`, { status });
        return response.data;
    },
};
