import axios, { AxiosError } from 'axios';
import { apiConfig } from '../config/apiConfig';
import { API_ENDPOINTS } from './endpoints';
import type { DashboardCampaignRequest, DashboardCampaignResponse } from '../types/chat.types';

const dashboardCampaignApi = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: 0,
  headers: { 'Content-Type': 'application/json' },
});

export const sendDashboardCampaignMessage = async (
  payload: DashboardCampaignRequest,
): Promise<DashboardCampaignResponse> => {
  try {
    const response = await dashboardCampaignApi.post<DashboardCampaignResponse>(API_ENDPOINTS.DASHBOARD_CAMPAIGNS, payload);
    if (response.data && typeof response.data === 'object') return response.data;
    throw new Error('Unexpected Campaign Assistant API response received.');
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unexpected Campaign Assistant API response received.') throw error;

    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 422) {
      if (import.meta.env.DEV) console.error('Campaign Assistant API validation details:', axiosError.response.data);
      throw new Error('Unable to process your request. Please verify that the Campaign Assistant API is running and try again.');
    }
    if (axiosError.code === 'ERR_NETWORK' || !axiosError.response) {
      throw new Error('Unable to process your request. Please verify that the Campaign Assistant API is running and try again.');
    }
    throw new Error('Unable to process your request. Please verify that the Campaign Assistant API is running and try again.');
  }
};

export default dashboardCampaignApi;