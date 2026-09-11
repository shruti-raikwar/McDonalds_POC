export const BRIEF_ENDPOINTS = {
    list: "/briefs",
    create: "/briefs",
    details: (briefId: string) => `/briefs/${briefId}`,
    update: (briefId: string) => `/briefs/${briefId}`,
    delete: (briefId: string) => `/briefs/${briefId}`,
    submit: (briefId: string) => `/briefs/${briefId}/submit`,
} as const;
