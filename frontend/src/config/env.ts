const rawEnv = import.meta.env;

const validAppEnvironments = new Set(['development', 'staging', 'production']);

const toString = (value: string | boolean | undefined, key: string): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  if (typeof value === 'boolean') {
    return String(value);
  }

  throw new Error(`Missing required environment variable: ${key}. Check your .env file for ${key}.`);
};

const appEnv = toString(rawEnv.VITE_APP_ENV, 'VITE_APP_ENV');
if (!validAppEnvironments.has(appEnv)) {
  throw new Error(
    `Invalid VITE_APP_ENV value: "${appEnv}". Allowed values are: development, staging, production.`
  );
}

const apiBaseUrl = toString(rawEnv.VITE_API_BASE_URL, 'VITE_API_BASE_URL');
const campaignApiBaseUrl = toString(rawEnv.VITE_CAMPAIGN_API_BASE_URL, 'VITE_CAMPAIGN_API_BASE_URL');

for (const [key, value] of [
  ['VITE_API_BASE_URL', apiBaseUrl],
  ['VITE_CAMPAIGN_API_BASE_URL', campaignApiBaseUrl],
] as const) {
  try {
    const parsedUrl = new URL(value);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error(`${key} must be a valid HTTP/HTTPS URL. Received: ${value}`);
    }
  } catch (error) {
    if (error instanceof TypeError || error instanceof Error && error.message.includes('Invalid URL')) {
      throw new Error(`${key} must be a valid URL. Received: ${value}`);
    }
    throw error;
  }
}

const rawApiTimeout = rawEnv.VITE_API_TIMEOUT;
const apiTimeoutValue = rawApiTimeout === undefined ? 0 : Number(rawApiTimeout);
if (rawApiTimeout !== undefined && (!Number.isFinite(apiTimeoutValue) || apiTimeoutValue < 0)) {
  throw new Error(`VITE_API_TIMEOUT must be a non-negative number when provided. Received: ${rawApiTimeout}`);
}

const firebaseConfig = {
  apiKey: 'AIzaSyCAXTs8ev5xb4nRpP0Oe8WNrmK0T112sks',
  authDomain: 'geeqdmr-song-data-ai-sbox-gcp.firebaseapp.com',
  projectId: 'geeqdmr-song-data-ai-sbox-gcp',
  storageBucket: 'geeqdmr-song-data-ai-sbox-gcp.firebasestorage.app',
  messagingSenderId: '368061194181',
  appId: '1:368061194181:web:918e1313c4bc6ac66435ac',
};

export const env = Object.freeze({
  appEnv,
  apiBaseUrl,
  campaignApiBaseUrl,
  apiTimeout: apiTimeoutValue,
  app: Object.freeze({
    name: 'Feel Brief AI Assistant',
    mode: appEnv,
    isDevelopment: appEnv === 'development',
    isTest: false,
    isStaging: appEnv === 'staging',
    isProduction: appEnv === 'production',
  }),
  firebase: Object.freeze(firebaseConfig),
  features: Object.freeze({
    enableApiMocks: true,
    enableDebugLogs: true,
    enableAiAssistant: true,
    enableDocumentUpload: true,
  }),
});

export type AppEnvConfig = typeof env;
export default env;
