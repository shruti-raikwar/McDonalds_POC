import { apiClient, unwrapApiResponse } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { HealthResponse } from '../types';

export const healthService = {
  getHealth: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>(API_ENDPOINTS.HEALTH);
    return unwrapApiResponse(response);
  },
};
