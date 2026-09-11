export interface ChatRequest {
  user_id: string;
  session_id: string;
  message: string;
}

export interface ChatResponse {
  // TODO: Confirm the backend chat contract and replace this with the exact response schema.
  data?: unknown;
  message?: string;
  status?: string;
  [key: string]: unknown;
}

export interface HealthResponse {
  status?: string;
  [key: string]: unknown;
}
