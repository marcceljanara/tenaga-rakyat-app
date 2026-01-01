import api from './axios';
import type {
    ApiResponse,
    PaginatedResponse,
    Admin,
    CreateAdminData,
    UpdateAdminData,
    User,
    UserStats,
    DashboardSummary,
    WithdrawRequest,
    VerificationStatus,
    UserManagementParams,
    AdminWithdrawParams,
} from '../types';

export const adminService = {
    // ========================================
    // Reports (Admin)
    // ========================================

    // Get dashboard summary with financial data
    // Includes: total inflow, outflow, platform fees, balance, escrow, pending withdrawals
    getDashboardSummary: async (from?: string, to?: string): Promise<ApiResponse<DashboardSummary>> => {
        const response = await api.get('/api/admin/report/dashboard-summary', {
            params: { from, to },
        });
        return response.data;
    },

    // ========================================
    // User Management (Admin)
    // ========================================

    // Get user statistics for admin dashboard
    getUserStats: async (): Promise<ApiResponse<UserStats>> => {
        const response = await api.get('/api/user-management/stats');
        return response.data;
    },

    // Get all users with filtering and pagination
    getUsers: async (params?: UserManagementParams): Promise<ApiResponse<User[]> | PaginatedResponse<User>> => {
        const response = await api.get('/api/user-management', { params });
        return response.data;
    },

    // Get detailed user information including wallet and photos
    getUserDetail: async (userId: string): Promise<ApiResponse<User>> => {
        const response = await api.get(`/api/user-management/${userId}`);
        return response.data;
    },

    // Update user verification status
    updateVerification: async (
        userId: string,
        verificationStatus: VerificationStatus
    ): Promise<ApiResponse<User>> => {
        const response = await api.patch(`/api/user-management/${userId}/verification`, {
            verification_status: verificationStatus,
        });
        return response.data;
    },

    // Suspend user account and wallet
    suspendAccount: async (userId: string): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.patch(`/api/user-management/${userId}/account/suspend`);
        return response.data;
    },

    // Activate suspended user account and wallet
    activateAccount: async (userId: string): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.patch(`/api/user-management/${userId}/account/activate`);
        return response.data;
    },

    // Suspend user wallet with reason
    suspendWallet: async (userId: string, reason: string): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.patch(`/api/user-management/${userId}/wallet/suspend`, { reason });
        return response.data;
    },

    // Activate suspended wallet
    activateWallet: async (userId: string): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.patch(`/api/user-management/${userId}/wallet/activate`);
        return response.data;
    },

    // Soft delete user account
    deleteUser: async (userId: string): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.delete(`/api/user-management/${userId}`);
        return response.data;
    },

    // ========================================
    // Withdraw Request Management (Admin)
    // ========================================

    // Get all withdraw requests with filtering
    getAllWithdrawRequests: async (params?: AdminWithdrawParams): Promise<ApiResponse<WithdrawRequest[]>> => {
        const response = await api.get('/api/admin/withdraw-requests', { params });
        return response.data;
    },

    // Lock withdraw request for processing (PENDING -> PROCESSING)
    lockWithdrawRequest: async (
        requestId: number | string,
        adminNote?: string
    ): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.post(`/api/admin/withdraw-requests/${requestId}/lock`, {
            admin_note: adminNote,
        });
        return response.data;
    },

    // Unlock withdraw request (PROCESSING -> PENDING)
    unlockWithdrawRequest: async (requestId: number | string): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.post(`/api/admin/withdraw-requests/${requestId}/unlock`);
        return response.data;
    },

    // Approve withdraw request (changes to APPROVED, returns decrypted account details)
    approveWithdrawRequest: async (
        requestId: number | string,
        adminNote?: string
    ): Promise<ApiResponse<WithdrawRequest>> => {
        const response = await api.post(`/api/admin/withdraw-requests/${requestId}/approve`, {
            admin_note: adminNote,
        });
        return response.data;
    },

    // Reject withdraw request (refunds balance to user wallet)
    rejectWithdrawRequest: async (
        requestId: number | string,
        adminNote: string
    ): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.post(`/api/admin/withdraw-requests/${requestId}/reject`, {
            admin_note: adminNote,
        });
        return response.data;
    },

    // Mark withdraw as sent with transfer receipt
    sendWithdrawRequest: async (
        requestId: number | string,
        transferReceipt: string
    ): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.post(`/api/admin/withdraw-requests/${requestId}/send`, {
            transfer_receipt: transferReceipt,
        });
        return response.data;
    },

    // ========================================
    // Wallet Management (Super Admin)
    // ========================================

    // Add initial balance to user wallet
    initializeWallet: async (userId: string, balance: number): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.post('/api/admin/wallets/balance-initial', {
            user_id: userId,
            balance,
        });
        return response.data;
    },

    // ========================================
    // Admin Management (Super Admin)
    // ========================================

    // Get all admins with pagination
    getAdmins: async (page?: number, limit?: number): Promise<ApiResponse<Admin[]> | PaginatedResponse<Admin>> => {
        const response = await api.get('/api/admins', {
            params: { page, limit },
        });
        return response.data;
    },

    // Get admin details by ID
    getAdminDetail: async (adminId: string): Promise<ApiResponse<Admin>> => {
        const response = await api.get(`/api/admins/${adminId}`);
        return response.data;
    },

    // Create new admin account
    createAdmin: async (data: CreateAdminData): Promise<ApiResponse<Admin>> => {
        const response = await api.post('/api/admins', data);
        return response.data;
    },

    // Update admin information
    updateAdmin: async (adminId: string, data: UpdateAdminData): Promise<ApiResponse<Admin>> => {
        const response = await api.put(`/api/admins/${adminId}`, data);
        return response.data;
    },

    // Change admin password
    changeAdminPassword: async (adminId: string, newPassword: string): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.put(`/api/admins/${adminId}/password`, { new_password: newPassword });
        return response.data;
    },

    // Soft delete admin account
    deleteAdmin: async (adminId: string): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.delete(`/api/admins/${adminId}`);
        return response.data;
    },
};
