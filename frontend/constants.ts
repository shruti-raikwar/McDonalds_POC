import { Insight, BriefData } from './types';

export const MOCK_INSIGHTS: Insight[] = [
    {
        id: '1',
        title: 'Breakfast comp sales down 2% among households with kids',
        source: 'Sales Data',
        date: 'Sep 2026'
    },
    {
        id: '2',
        title: 'Parents crave a moment of calm before the day\'s chaos',
        source: 'Research',
        date: 'Q2 2026'
    },
    {
        id: '3',
        title: 'Mobile order use highest among parents 30 to 42',
        source: 'Panel Data',
        date: 'Oct 2026'
    },
    {
        id: '4',
        title: 'Drive-thru usage spikes 38% during holiday weeks',
        source: 'Sales Data',
        date: 'Aug 2026'
    },
    {
        id: '5',
        title: 'Value menu items see 15% lift during back-to-school season',
        source: 'Sales Data',
        date: 'Aug 2026'
    },
    {
        id: '6',
        title: 'Gen Z prefers app-exclusive drops over traditional coupons',
        source: 'Consumer Trends',
        date: 'Jul 2026'
    }
];

export const INITIAL_BRIEF_DATA: BriefData = {
    projectName: '',
    requestedBy: '',
    briefType: '',
    firstReviewDate: '',
    launchDate: '',
    businessGoal: '',
    marketingGoal: '',
    communicationObjective: '',
    background: '',
    targetAudience: '',
    insights: '',
    fanTruth: '',
    messageProposition: '',
    tone: '',
    strategicRole: '',
    executionalMandatories: ''
};

export const MOCK_NEWS = [
    {
        id: 1,
        headline: "McDonald's Q4 earnings beat expectations by 8%",
        source: "Bloomberg",
        category: "FINANCIAL",
        image: "https://picsum.photos/seed/mcd1/100/100"
    },
    {
        id: 2,
        headline: "New sustainable packaging rollout begins in Europe",
        source: "Reuters",
        category: "SUSTAINABILITY",
        image: "https://picsum.photos/seed/mcd2/100/100"
    }
];

export const PERFORMANCE_DATA = [
    { name: 'Mon', value: 40 },
    { name: 'Tue', value: 30 },
    { name: 'Wed', value: 45 },
    { name: 'Thu', value: 50 },
    { name: 'Fri', value: 65 },
    { name: 'Sat', value: 85 },
    { name: 'Sun', value: 90 },
];
