import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Insight, BriefData, INITIAL_BRIEF_DATA } from '../../../constants/app.constants';

interface BriefContextType {
    selectedInsights: Insight[];
    briefDraft: BriefData;
    isAiDrawerOpen: boolean;
    aiDrawerQuery: string;
    toggleInsight: (insight: Insight) => void;
    updateBriefData: (data: Partial<BriefData>) => void;
    setAiDrawerOpen: (isOpen: boolean) => void;
    setAiDrawerQuery: (query: string) => void;
    resetBrief: () => void;
}

const BriefContext = createContext<BriefContextType | undefined>(undefined);

export const BriefProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedInsights, setSelectedInsights] = useState<Insight[]>([]);
    const [briefDraft, setBriefDraft] = useState<BriefData>(INITIAL_BRIEF_DATA);
    const [isAiDrawerOpen, setAiDrawerOpen] = useState(false);
    const [aiDrawerQuery, setAiDrawerQuery] = useState('');

    const toggleInsight = (insight: Insight) => {
        setSelectedInsights(prev => {
            const exists = prev.find(i => i.id === insight.id);
            if (exists) {
                return prev.filter(i => i.id !== insight.id);
            }
            return [...prev, insight];
        });
    };

    const updateBriefData = (data: Partial<BriefData>) => {
        setBriefDraft(prev => ({ ...prev, ...data }));
    };

    const resetBrief = () => {
        setSelectedInsights([]);
        setBriefDraft(INITIAL_BRIEF_DATA);
    };

    return (
        <BriefContext.Provider value={{
            selectedInsights,
            briefDraft,
            isAiDrawerOpen,
            aiDrawerQuery,
            toggleInsight,
            updateBriefData,
            setAiDrawerOpen,
            setAiDrawerQuery,
            resetBrief
        }}>
            {children}
        </BriefContext.Provider>
    );
};

export const useBriefContext = () => {
    const context = useContext(BriefContext);
    if (context === undefined) {
        throw new Error('useBriefContext must be used within a BriefProvider');
    }
    return context;
};
