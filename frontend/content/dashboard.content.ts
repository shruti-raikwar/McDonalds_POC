export const DASHBOARD_CONTENT = {
    greeting: {
        morning: "Good morning",
        afternoon: "Good afternoon",
        evening: "Good evening",
        fallback: "Welcome!"
    },
    subtitle: "What would you like to work on today?",
    searchPlaceholder: "Ask anything or describe what you need...",
    sections: {
        tools: "Your Top Tools",
        performance: "Today's Performance",
        news: "McDonald's in the News"
    },
    tools: [
        { id: 'briefing', title: 'Briefing', desc: 'Create new briefs, faster.', color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { id: 'research', title: 'Research & Insights', desc: 'Gather insights for briefing.', color: 'text-orange-500', bg: 'bg-orange-50' },
        { id: 'audiences', title: 'Audiences', desc: 'Test with synthetic personas.', color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'analysis', title: 'Campaign Analysis', desc: 'Monitor performance, live.', color: 'text-green-500', bg: 'bg-green-50' },
    ]
};
