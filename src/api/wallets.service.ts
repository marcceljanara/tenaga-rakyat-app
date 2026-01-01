import api from './axios';
import type {
    ApiResponse,
    Wallet,
    Transactions,
    WithdrawMethodData,
    WithdrawMethods,
    CreateWithdrawMethodData,
    WithdrawRequest,
    WorkerWithdrawRequests,
    WorkerWithdrawRequestDetail,
    CreateWithdrawRequestData,
    WithdrawPreview,
    TopUpResponse,
} from '../types';

export const walletsService = {
    // ========================================
    // Wallet Core Endpoints
    // ========================================

    // Get wallet information for logged-in user
    getWallet: async (): Promise<ApiResponse<Wallet>> => {
        const response = await api.get('/api/wallets');
        return response.data;
    },

    // Get transaction history for specific wallet
    getTransactions: async (walletId: number | string): Promise<ApiResponse<Transactions>> => {
        const response = await api.get(`/api/wallets/transactions/${walletId}`);
        return response.data;
    },

    // ========================================
    // Top Up Endpoints (Employer)
    // ========================================

    // Create top-up transaction via Midtrans (minimum: 10,000)
    // Returns snap token and redirect URL for Midtrans payment
    topUp: async (balance: number): Promise<ApiResponse<TopUpResponse>> => {
        const response = await api.post('/api/wallets/topup', { balance });
        return response.data;
    },

    // ========================================
    // Withdraw Method Endpoints (Worker)
    // ========================================

    // Get all active withdraw methods for user
    getWithdrawMethods: async (): Promise<ApiResponse<WithdrawMethods>> => {
        const response = await api.get('/api/wallets/withdraw-methods');
        return response.data;
    },

    // Add bank account or e-wallet for withdrawal (max 5 methods)
    addWithdrawMethod: async (data: CreateWithdrawMethodData): Promise<ApiResponse<WithdrawMethodData>> => {
        const response = await api.post('/api/wallets/withdraw-methods', data);
        return response.data;
    },

    // Delete saved withdraw method
    deleteWithdrawMethod: async (methodId: number | string): Promise<ApiResponse<{ message: string }>> => {
        const response = await api.delete(`/api/wallets/withdraw-methods/${methodId}`);
        return response.data;
    },

    // ========================================
    // Withdraw Request Endpoints (Worker)
    // ========================================

    // Preview withdraw - calculate fees and net amount before withdrawal
    previewWithdraw: async (amount: number, methodId: number | string): Promise<ApiResponse<WithdrawPreview>> => {
        const response = await api.get('/api/wallets/withdraw/preview', {
            params: { amount, method_id: methodId },
        });
        return response.data;
    },

    // Get all withdraw requests for logged-in user (sorted by creation date, newest first)
    getWithdrawRequests: async (): Promise<ApiResponse<WorkerWithdrawRequests>> => {
        const response = await api.get('/api/wallets/withdraw-requests');
        return response.data;
    },

    // Get withdraw request detail
    getWithdrawRequestDetail: async (requestId: number | string): Promise<ApiResponse<WorkerWithdrawRequestDetail>> => {
        const response = await api.get(`/api/wallets/withdraw-requests/${requestId}`);
        return response.data;
    },

    // Create withdraw request (minimum: 10,000)
    // Deducts balance immediately, adds fee to platform wallet, creates PENDING transaction
    createWithdrawRequest: async (data: CreateWithdrawRequestData): Promise<ApiResponse<WithdrawRequest>> => {
        const response = await api.post('/api/wallets/withdraw-requests', data);
        return response.data;
    },
};
