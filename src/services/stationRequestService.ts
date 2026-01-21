import api from './api';
import { StationRequest, ApiResponse, PaginatedResponse } from '@/types';

export const stationRequestService = {
  async getRequests(params?: { status?: string }): Promise<PaginatedResponse<StationRequest>> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        });
      }, 500);
    });
  },

  async getRequest(id: string): Promise<StationRequest> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({} as StationRequest);
      }, 500);
    });
  },

  async approveRequest(id: string, stationId: string): Promise<StationRequest> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({} as StationRequest);
      }, 500);
    });
  },

  async rejectRequest(id: string, reason: string): Promise<StationRequest> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({} as StationRequest);
      }, 500);
    });
  },
};
