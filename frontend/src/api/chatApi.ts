import axios, { AxiosError } from 'axios';
import { apiConfig } from '../config/apiConfig';
import type { ChatRequest, ChatResponse } from '../types/chat.types';

export const chatApi = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: 0,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendChatMessage = async (payload: ChatRequest): Promise<ChatResponse> => {
  try {
    const response = await chatApi.post<ChatResponse>('/chat', payload);

    if (response.data && typeof response.data === 'object') {
      return response.data;
    }

    return { message: 'Chat request completed successfully.' };
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const responseData = axiosError.response?.data as { detail?: string; message?: string } | undefined;
    const message =
      typeof responseData === 'object' && responseData !== null
        ? responseData.detail ?? responseData.message ?? axiosError.message
        : axiosError.message;

    throw new Error(message || 'Failed to reach the AI backend.');
  }
};

export default chatApi;
