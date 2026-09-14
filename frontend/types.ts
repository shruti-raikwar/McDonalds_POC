export interface AppUser {
    uid: string;
    email: string | null;
    displayName: string | null;
}

export interface Insight {
    id: string;
    title: string;
    source: string;
    date: string;
}

export interface BriefData {
    projectName: string;
    requestedBy: string;
    briefType: string;
    firstReviewDate: string;
    launchDate: string;
    businessGoal: string;
    marketingGoal: string;
    communicationObjective: string;
    background: string;
    targetAudience: string;
    insights: string;
    fanTruth: string;
    messageProposition: string;
    tone: string;
    strategicRole: string;
    executionalMandatories: string;
}

export type AiDrawerMode = 'general' | 'business-goal' | 'briefing' | 'research' | 'audiences' | 'analysis';

export type AssistantSourcePage = 'createBrief' | 'dashboard';
export type AssistantContext = 'briefing' | 'insight' | 'segment';

export interface AppState {
    user: AppUser | null;
    selectedInsights: Insight[];
    briefDraft: BriefData;
    isAiDrawerOpen: boolean;
    aiDrawerQuery: string;
    aiDrawerMode: AiDrawerMode;
    aiDrawerSessionId: string | null;
    assistantSourcePage: AssistantSourcePage | null;
    assistantContext: AssistantContext | null;
}
