import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, AppUser, Insight, BriefData, AiDrawerMode, AssistantContext, AssistantSourcePage } from '../types';
import { INITIAL_BRIEF_DATA } from '../constants';
import { auth } from '../config/firebase';
import { sessionService } from '../src/services/sessionService';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    signOut 
} from 'firebase/auth';

interface AppContextType extends AppState {
    authLoading: boolean;
    isSigningUp: boolean;
    signUp: (email: string, pass: string, name: string) => Promise<void>;
    signIn: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
    reloadUser: () => Promise<void>;
    toggleInsight: (insight: Insight) => void;
    updateBriefData: (data: Partial<BriefData>) => void;
    setAiDrawerOpen: (isOpen: boolean) => void;
    setAiDrawerQuery: (query: string) => void;
    setAiDrawerMode: (mode: AiDrawerMode) => void;
    resetAiDrawerSession: (mode: AiDrawerMode) => void;
    openAiTool: (mode: Extract<AiDrawerMode, 'briefing' | 'research' | 'audiences' | 'analysis'>) => void;
    setAssistantContext: (sourcePage: AssistantSourcePage, context: AssistantContext, sessionId?: string | null) => void;
    resetBrief: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [isSigningUp, setIsSigningUp] = useState(false);
    
    const [selectedInsights, setSelectedInsights] = useState<Insight[]>([]);
    const [briefDraft, setBriefDraft] = useState<BriefData>(INITIAL_BRIEF_DATA);
    const [isAiDrawerOpen, setAiDrawerOpen] = useState(false);
    const [aiDrawerQuery, setAiDrawerQuery] = useState('');
    const [aiDrawerMode, setAiDrawerMode] = useState<AiDrawerMode>('general');
    const [aiDrawerSessionId, setAiDrawerSessionId] = useState<string | null>(null);
    const [assistantSourcePage, setAssistantSourcePage] = useState<AssistantSourcePage | null>(null);
    const [assistantContext, setAssistantContextState] = useState<AssistantContext | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName
                });
            } else {
                setUser(null);
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const reloadUser = async () => {
        if (auth.currentUser) {
            await auth.currentUser.reload();
            setUser({
                uid: auth.currentUser.uid,
                email: auth.currentUser.email,
                displayName: auth.currentUser.displayName
            });
        }
    };

    const signUp = async (email: string, pass: string, name: string) => {
        setIsSigningUp(true);
        try {
            const credential = await createUserWithEmailAndPassword(auth, email, pass);
            await updateProfile(credential.user, { displayName: name });
            await credential.user.reload();
            setUser({
                uid: credential.user.uid,
                email: credential.user.email,
                displayName: credential.user.displayName || name
            });
        } finally {
            setIsSigningUp(false);
        }
    };

    const signIn = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const logout = async () => {
        await signOut(auth);
        resetBrief();
    };

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

    const openAiTool = (mode: Extract<AiDrawerMode, 'briefing' | 'research' | 'audiences' | 'analysis'>) => {
        const context = mode === 'research' ? 'insight' : mode === 'audiences' ? 'segment' : null;
        if (!context) return;
        setAiDrawerMode(mode);
        setAiDrawerQuery('');
        setAiDrawerSessionId(sessionService.createSessionId());
        setAssistantSourcePage('dashboard');
        setAssistantContextState(context);
        setAiDrawerOpen(true);
    };

    const resetAiDrawerSession = (mode: AiDrawerMode) => {
        setAiDrawerMode(mode);
        setAiDrawerQuery('');
        setAiDrawerSessionId(null);
        setAssistantSourcePage('createBrief');
        setAssistantContextState('briefing');
    };

    const setAssistantContext = (sourcePage: AssistantSourcePage, context: AssistantContext, sessionId?: string | null) => {
        setAssistantSourcePage(sourcePage);
        setAssistantContextState(context);
        setAiDrawerSessionId(sessionId === undefined ? sessionService.createSessionId() : sessionId);
    };

    return (
        <AppContext.Provider value={{
            user,
            authLoading,
            isSigningUp,
            selectedInsights,
            briefDraft,
            isAiDrawerOpen,
            aiDrawerQuery,
            aiDrawerMode,
            aiDrawerSessionId,
            assistantSourcePage,
            assistantContext,
            signUp,
            signIn,
            logout,
            reloadUser,
            toggleInsight,
            updateBriefData,
            setAiDrawerOpen,
            setAiDrawerQuery,
            setAiDrawerMode,
            resetAiDrawerSession,
            openAiTool,
            setAssistantContext,
            resetBrief
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
