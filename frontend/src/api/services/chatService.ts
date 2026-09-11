import { apiClient, unwrapApiResponse } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type { ChatRequest, ChatResponse } from '../types';

export const chatService = {
  sendMessage: async (payload: ChatRequest): Promise<ChatResponse> => {
    const response = await apiClient.post<ChatResponse>(API_ENDPOINTS.CHAT, payload);
    return unwrapApiResponse(response);
  },
};
