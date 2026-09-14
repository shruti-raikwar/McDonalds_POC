import axios, { AxiosError } from 'axios';
import { env } from '../config/env';
import { API_ENDPOINTS } from './endpoints';
import type { CreateBriefCampaignRequest, CampaignResponse } from '../types/campaign.types';

export const campaignApi = axios.create({
  baseURL: env.campaignApiBaseUrl,
  timeout: 0,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const generateCampaign = async (payload: CreateBriefCampaignRequest): Promise<CampaignResponse> => {
  try {
    const response = await campaignApi.post<CampaignResponse>(API_ENDPOINTS.CAMPAIGN_BRIEF, payload);

    if (response.data && typeof response.data === 'object') {
      return response.data;
    }

    throw new Error('Unexpected Campaign API response received.');
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Unexpected Campaign API response received.') {
      throw error;
    }

    const axiosError = error as AxiosError;

    if (axiosError.code === 'ERR_NETWORK' || !axiosError.response) {
      throw new Error('Unable to generate the campaign brief. Please verify that the Campaign Brief API is running and try again.');
    }

    if (axiosError.response?.status === 422) {
      if (import.meta.env.DEV) console.error('Campaign Brief API validation details:', axiosError.response.data);
      throw new Error('Unable to generate the campaign brief. Please verify that the Campaign Brief API is running and try again.');
    }

    const responseData = axiosError.response?.data as { detail?: string; error?: string; message?: string } | undefined;
    const backendError =
      typeof responseData === 'object' && responseData !== null
        ? responseData.detail ?? responseData.error ?? responseData.message ?? axiosError.message
        : axiosError.message;

    throw new Error(backendError || 'Unable to generate the campaign brief. Please verify that the Campaign Brief API is running and try again.');
  }
};

export default campaignApi;
