import axios, { AxiosError } from 'axios';
import { env } from '../config/env';
import type { CampaignRequest, CampaignResponse } from '../types/campaign.types';

export const campaignApi = axios.create({
  baseURL: env.campaignApiBaseUrl,
  timeout: 0,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const generateCampaign = async (payload: CampaignRequest): Promise<CampaignResponse> => {
  try {
    const response = await campaignApi.post<CampaignResponse>('/api/campaigns', payload);

    if (response.data && typeof response.data === 'object') {
      return response.data;
    }

    return {
      status: 'unknown',
      business_goal: payload.business_goal,
      error: 'The campaign service returned an empty payload.',
    };
  } catch (error: unknown) {
    const axiosError = error as AxiosError;

    if (axiosError.code === 'ERR_NETWORK' || !axiosError.response) {
      throw new Error('Unable to connect to the Business Goal campaign service. Verify that the backend is running on port 8001.');
    }

    const responseData = axiosError.response?.data as { detail?: string; error?: string; message?: string } | undefined;
    const backendError =
      typeof responseData === 'object' && responseData !== null
        ? responseData.detail ?? responseData.error ?? responseData.message ?? axiosError.message
        : axiosError.message;

    throw new Error(backendError || 'Failed to generate a campaign brief.');
  }
};

export default campaignApi;
