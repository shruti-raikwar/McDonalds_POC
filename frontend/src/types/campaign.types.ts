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

export interface CampaignApiResponse {
  trace_id: string;
  status: string;
  business_goal: string;
  result: string;
  questions: string[] | null;
  error: string | null;
}

export interface CampaignEvaluation {
  overall_confidence?: number | string;
  low_confidence_sections?: string[];
  [key: string]: unknown;
}

export interface CampaignResponse extends CampaignApiResponse {
  llm_backend?: string;
  evaluation?: CampaignEvaluation;
  requires_human_review?: boolean;
  human_decision?: string | null;
  retrieved_campaign_ids?: string[];
  [key: string]: unknown;
}

export interface CreateBriefCampaignRequest {
  business_goal: string;
}
