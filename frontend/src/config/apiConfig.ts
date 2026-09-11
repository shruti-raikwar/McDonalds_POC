import { env } from './env';

export const apiConfig = Object.freeze({
  baseUrl: env.apiBaseUrl.replace(/\/+$/, ''),
  campaignBaseUrl: env.campaignApiBaseUrl.replace(/\/+$/, ''),
  timeout: env.apiTimeout,
});

export default apiConfig;
