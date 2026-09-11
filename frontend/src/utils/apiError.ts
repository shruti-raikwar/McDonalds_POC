export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly details?: unknown;
  readonly isTimeout: boolean;
  readonly isNetworkError: boolean;

  constructor(message: string, options: { status?: number; code?: string; details?: unknown; isTimeout?: boolean; isNetworkError?: boolean } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
    this.isTimeout = options.isTimeout ?? false;
    this.isNetworkError = options.isNetworkError ?? false;
  }
}

export const normalizeApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    const maybeError = error as {
      response?: { status?: number; data?: unknown };
      code?: string;
      message?: string;
      isAxiosError?: boolean;
      name?: string;
    };

    const status = maybeError.response?.status;
    const responseData = maybeError.response?.data;
    const code = maybeError.code;
    const message = maybeError.message ?? 'Request failed';

    if (code === 'ECONNABORTED' || maybeError.message?.toLowerCase().includes('timeout')) {
      return new ApiError('The request timed out.', {
        status,
        code,
        details: responseData,
        isTimeout: true,
      });
    }

    if (code === 'ERR_NETWORK' || maybeError.message?.toLowerCase().includes('network error')) {
      return new ApiError('Network error while reaching the API.', {
        status,
        code,
        details: responseData,
        isNetworkError: true,
      });
    }

    if (status && status >= 400) {
      return new ApiError(message || 'The API request failed.', {
        status,
        code,
        details: responseData,
      });
    }

    if (typeof responseData === 'string') {
      return new ApiError(responseData, { status, code, details: responseData });
    }

    return new ApiError(message || 'An unexpected API error occurred.', {
      status,
      code,
      details: responseData,
    });
  }

  return new ApiError('An unexpected API error occurred.', { details: error });
};
