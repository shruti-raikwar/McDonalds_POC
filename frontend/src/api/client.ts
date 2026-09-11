import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { env } from '../config/env';
import { ApiError, normalizeApiError } from '../utils/apiError';

const getRequestHeaders = (config: AxiosRequestConfig): Record<string, string> => {
  const headers = config.headers ?? {};

  if (typeof headers === 'object' && !Array.isArray(headers)) {
    return Object.entries(headers).reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {});
  }

  return {};
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token?: string | null): void => {
  if (!token) {
    delete apiClient.defaults.headers.common.Authorization;
    return;
  }

  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
};

apiClient.interceptors.request.use((config) => {
  const headers = getRequestHeaders(config);

  if (!headers['Content-Type'] && !headers['content-type']) {
    config.headers = {
      ...headers,
      'Content-Type': 'application/json',
    };
  }

  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response && response.data === undefined) {
      return { ...response, data: null };
    }

    return response;
  },
  (error: unknown) => {
    const normalizedError = normalizeApiError(error);
    return Promise.reject(normalizedError);
  }
);

export const unwrapApiResponse = <T>(response: AxiosResponse<T>): T => {
  if (response && response.data !== undefined) {
    return response.data;
  }

  return null as T;
};

export const assertApiResponse = <T>(response: AxiosResponse<T>): T => {
  if (!response || !response.data) {
    throw new ApiError('The API returned an empty response.');
  }

  return response.data;
};
