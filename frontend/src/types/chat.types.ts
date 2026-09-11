export interface ChatRequest {
  user_id: string;
  session_id: string;
  message: string;
}

export interface ChatResponse {
  // TODO: Confirm the backend response schema from the API contract.
  response?: string;
  message?: string;
  data?: unknown;
  status?: string;
  error?: string;
  [key: string]: unknown;
}

export interface ChatErrorState {
  message: string;
}
