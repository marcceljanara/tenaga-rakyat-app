import api from './axios';
import type {
  ApiResponse,
  CreditBalanceResponse,
  ListPostingPackageResponse,
  PostingPackageResponse,
  TopupCreditRequest,
  TopUpResponse,
  PostingCreditPurchaseResponse,
  AddPostingCreditPackageRequest,
  EditPostingCreditPackageRequest,
  PagingResponse,
} from '../types';

export const creditsService = {
  // ========================================
  // Posting Credits (Job Provider)
  // ========================================

  // Get credit balance
  getCreditBalance: async (): Promise<ApiResponse<CreditBalanceResponse>> => {
    const response = await api.get('/api/credits');
    return response.data;
  },

  // Get credit purchase history
  getCreditHistory: async (page?: number, limit?: number): Promise<PagingResponse<PostingCreditPurchaseResponse[]>> => {
    const response = await api.get('/api/credits/history', {
      params: { page, size: limit },
    });
    return response.data;
  },

  // Top up / Purchase posting credits
  topUpCredit: async (data: TopupCreditRequest): Promise<ApiResponse<TopUpResponse>> => {
    const response = await api.post('/api/credits/topup', data);
    return response.data;
  },

  // Get available posting credit packages (Job Provider)
  getPostingCreditPackages: async (): Promise<ApiResponse<ListPostingPackageResponse>> => {
    const response = await api.get('/api/credits/posting-credit');
    return response.data;
  },

  // ========================================
  // Posting Credits (Admin)
  // ========================================

  // Create posting credit package
  createPostingCreditPackage: async (data: AddPostingCreditPackageRequest): Promise<ApiResponse<PostingPackageResponse>> => {
    const response = await api.post('/api/admin/posting-credit', data);
    return response.data;
  },

  // Get all posting credit packages (including inactive)
  getAllPostingCreditPackages: async (): Promise<ApiResponse<ListPostingPackageResponse>> => {
    const response = await api.get('/api/admin/posting-credit');
    return response.data;
  },

  // Update posting credit package
  updatePostingCreditPackage: async (
    id: number | string,
    data: EditPostingCreditPackageRequest
  ): Promise<ApiResponse<PostingPackageResponse>> => {
    const response = await api.put(`/api/admin/posting-credit/${id}`, data);
    return response.data;
  },

  // Delete posting credit package
  deletePostingCreditPackage: async (id: number | string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/api/admin/posting-credit/${id}`);
    return response.data;
  },
};
