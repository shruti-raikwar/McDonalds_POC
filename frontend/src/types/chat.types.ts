export interface DashboardCampaignRequest {
  query: string;
  user_id: 'api-user';
  session_id: string;
  agent_call: 'insight' | 'segment';
}

export interface DashboardCampaignResponse {
  session_id?: string;
  final_response?: string;
  draft_brief?: string;
  response?: string;
  insights?: string;
  segments?: string;
  [key: string]: unknown;
}

export interface ChatErrorState {
  message: string;
}
