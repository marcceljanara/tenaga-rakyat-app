import api from './axios';
import type {
  ApiResponse,
  ReviewResponse,
  ReviewListResponse,
  CreateReviewData,
  UpdateReviewData,
} from '../types';

export const reviewsService = {
  // ========================================
  // Review Methods
  // ========================================

  // Create a review
  createReview: async (data: CreateReviewData): Promise<ApiResponse<ReviewResponse>> => {
    const response = await api.post('/api/reviews', data);
    return response.data;
  },

  // Update a review
  updateReview: async (reviewId: number | string, data: UpdateReviewData): Promise<ApiResponse<ReviewResponse>> => {
    const response = await api.put(`/api/reviews/${reviewId}`, data);
    return response.data;
  },

  // Get a specific review
  getReviewById: async (reviewId: number | string): Promise<ApiResponse<ReviewResponse>> => {
    const response = await api.get(`/api/reviews/${reviewId}`);
    return response.data;
  },

  // Get all reviews for a specific user
  getUserReviews: async (userId: string, page?: number, limit?: number): Promise<ApiResponse<ReviewListResponse>> => {
    const response = await api.get(`/api/reviews/user/${userId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get all reviews for a specific job
  getJobReviews: async (jobId: number | string): Promise<ApiResponse<ReviewResponse[]>> => {
    const response = await api.get(`/api/reviews/job/${jobId}`);
    return response.data;
  },
};
