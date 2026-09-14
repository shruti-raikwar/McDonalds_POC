import { apiClient, unwrapApiResponse } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { DashboardCampaignRequest, DashboardCampaignResponse } from '../types/chat.types';

export const chatService = {
  sendMessage: async (payload: DashboardCampaignRequest): Promise<DashboardCampaignResponse> => {
    const response = await apiClient.post<DashboardCampaignResponse>(API_ENDPOINTS.DASHBOARD_CAMPAIGNS, payload);
    return unwrapApiResponse(response);
  },
};
