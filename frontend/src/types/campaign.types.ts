export interface CampaignTargetSegment {
  name?: string;
  [key: string]: unknown;
}

export interface CampaignKeyInsight {
  statement?: string;
  [key: string]: unknown;
}

export interface CampaignChannelRecommendation {
  channel?: string;
  why?: string;
  justification?: string;
  [key: string]: unknown;
}

export interface CampaignBrief {
  title?: string;
  objective?: string;
  tone?: string;
  target_segments?: CampaignTargetSegment[];
  key_insights?: CampaignKeyInsight[];
  recommended_channels?: CampaignChannelRecommendation[];
  proposed_kpis?: string[];
  [key: string]: unknown;
}

export interface CampaignEvaluation {
  overall_confidence?: number | string;
  low_confidence_sections?: string[];
  [key: string]: unknown;
}

export interface CampaignResponse {
  trace_id?: string;
  status?: string;
  llm_backend?: string;
  business_goal?: string;
  error?: string | null;
  brief?: CampaignBrief;
  evaluation?: CampaignEvaluation;
  requires_human_review?: boolean;
  human_decision?: string | null;
  retrieved_campaign_ids?: string[];
  [key: string]: unknown;
}

export interface CampaignRequest {
  business_goal: string;
}
