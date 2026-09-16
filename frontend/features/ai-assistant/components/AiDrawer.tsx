import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../../context/AppContext';
import { useAuth } from '../../../providers/AuthProvider';
import { ROUTES } from '../../../routes/routePaths';
import { useChat } from '../../../src/hooks/useChat';
import { useCampaignGeneration } from '../../../src/hooks/useCampaignGeneration';
import { apiClient } from '../../../src/api/client';
import type { CampaignBrief, CampaignResponse } from '../../../src/types/campaign.types';
import type { DashboardCampaignResponse } from '../../../src/types/chat.types';
import type { AiDrawerMode } from '../../../types';

const ASSISTANT_FALLBACK_MESSAGE = "I couldn't generate a response.";

const PREDEFINED_BUSINESS_GOALS = [
  'Drive weekday lunch traffic for the new spicy chicken wrap',
];

interface CampaignPreview {
  businessGoal?: string;
  objective?: string;
  tone?: string;
  targetSegments: string[];
  keyInsights: string[];
  recommendedChannels: string[];
  proposedKpis: string[];
}

type DrawerMessage = {
  id: string;
  role: 'user' | 'ai';
  kind: 'text' | 'error' | 'preview' | 'confirmation';
  text?: string;
  preview?: CampaignPreview;
  followUpQuestions?: string[];
  isFollowUpQuestionsLoading?: boolean;
};

interface CampaignFollowUpResponse {
  agent_call: string;
  questions?: string[];
  follow_up_questions?: string[];
}

interface CampaignFollowUpRequest {
  agent_call: 'brief';
  context: string;
}

const TOOL_WELCOME_MESSAGES: Record<Extract<AiDrawerMode, 'briefing' | 'research' | 'audiences' | 'analysis'>, string> = {
  briefing: '👋 Welcome to Brief Assistant.\n\nI\'m here to help you create a complete Feel Brief.\n\nI can help you:\n\n• Create campaign briefs\n• Define business goals\n• Generate marketing goals\n• Identify target audiences\n• Generate messaging and propositions\n• Recommend channels\n• Suggest KPIs and executional mandatories\n\nTry asking:\n\n"Create a campaign brief for a spicy chicken wrap"\n\n"Generate a breakfast campaign brief"\n\n"Help define my target audience"\n\n"Generate marketing goals"\n\n"Recommend messaging and channels"',
  research: '👋 Welcome to Research & Insights Assistant.\n\nI can help you:\n\n• Discover market insights\n• Analyze campaign learnings\n• Explore consumer trends\n• Find relevant research findings\n\nTry asking:\n"Show breakfast campaign insights"\n"Find Gen Z trends"\n"Summarize audience research"',
  audiences: '👋 Welcome to Audience Assistant.\n\nI can help you:\n\n• Identify target audiences\n• Generate personas\n• Analyze consumer behaviors\n• Explore audience segments\n\nTry asking:\n"Create a Gen Z persona"\n"Identify audience for a spicy chicken wrap"\n"Show parent customer behaviors"',
  analysis: '👋 Welcome to Campaign Analysis.\n\nI can help analyze campaign performance, KPIs, channel effectiveness, and optimization opportunities.\n\nExamples:\n\n• Analyze campaign performance\n• Recommend channels\n• Compare campaign results',
};

const TOOL_TITLES: Record<keyof typeof TOOL_WELCOME_MESSAGES, string> = {
  briefing: 'AI Brief Assistant',
  research: 'AI Research Assistant',
  audiences: 'AI Audience Assistant',
  analysis: 'AI Campaign Analysis Assistant',
};

const MarkdownMessage: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="markdown-message max-w-full overflow-hidden break-words text-sm leading-7 text-slate-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          h1: ({ children }) => <h1 className="text-lg font-bold mt-4 mb-2 text-slate-900">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-bold mt-4 mb-2 text-slate-900">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-bold mt-3 mb-2 text-slate-900">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="break-words">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
          a: ({ href, children }) => <a href={href} className="text-blue-600 underline break-all" target="_blank" rel="noreferrer">{children}</a>,
          code: ({ children }) => <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] break-all">{children}</code>,
          pre: ({ children }) => <pre className="overflow-x-auto rounded-lg bg-slate-100 p-3 my-3 text-[11px]">{children}</pre>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const uniqueId = (prefix: string): string => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

interface DeserializedCampaignResponse {
  response: CampaignResponse;
  brief: CampaignBrief;
}

const isCampaignBrief = (value: unknown): value is CampaignBrief => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const deserializeCampaignResponse = (
  response: CampaignResponse | null | undefined,
): DeserializedCampaignResponse | null => {
  if (!response || response.error !== null || typeof response.result !== 'string' || !response.result.trim()) return null;

  try {
    const brief = JSON.parse(response.result) as unknown;

    return isCampaignBrief(brief) ? { response, brief } : null;
  } catch {
    return null;
  }
};

const buildPreviewFromResponse = (response: CampaignResponse | null | undefined): CampaignPreview | null => {
  const deserialized = deserializeCampaignResponse(response);
  if (!deserialized) return null;

  const { response: campaignResponse, brief } = deserialized;
  const targetSegments = Array.isArray(brief.target_segments)
    ? brief.target_segments
        .map((item) => (typeof item === 'object' && item && 'name' in item ? String(item.name).trim() : ''))
        .filter(Boolean)
    : [];

  const keyInsights = Array.isArray(brief.key_insights)
    ? brief.key_insights
        .map((item) => (typeof item === 'object' && item && 'statement' in item ? String(item.statement).trim() : ''))
        .filter(Boolean)
    : [];

  const recommendedChannels = Array.isArray(brief.recommended_channels)
    ? brief.recommended_channels
        .map((item) => (typeof item === 'object' && item && 'channel' in item ? String(item.channel).trim() : ''))
        .filter(Boolean)
    : [];

  const proposedKpis = Array.isArray(brief.proposed_kpis)
    ? brief.proposed_kpis.map((item) => String(item).trim()).filter(Boolean)
    : [];

  return {
    businessGoal: campaignResponse.business_goal?.trim() || undefined,
    objective: typeof brief.title === 'string' ? brief.title.trim() : undefined,
    tone: typeof brief.tone === 'string' ? brief.tone.trim() : undefined,
    targetSegments,
    keyInsights,
    recommendedChannels,
    proposedKpis,
  };
};

const isSuccessfulResponse = (response: CampaignResponse | null | undefined): boolean => {
  return !!deserializeCampaignResponse(response);
};

export const extractAssistantContent = (
  response: DashboardCampaignResponse | null | undefined,
): string => {
  const content = [response?.final_response, response?.draft_brief]
    .find((candidate) => typeof candidate === 'string' && candidate.trim());
  return typeof content === 'string' ? content.trim() : '';
};

export const isValidAssistantResponse = (
  response: DashboardCampaignResponse | null | undefined,
  content: string,
): boolean => {
  if (!response || !content || content.toLowerCase() === ASSISTANT_FALLBACK_MESSAGE.toLowerCase()) return false;
  if (response.error) return false;

  const normalizedStatus = typeof response.status === 'string' ? response.status.trim().toLowerCase() : '';
  return !['error', 'failed', 'failure', 'fallback'].includes(normalizedStatus);
};

export const shouldGenerateFollowUps = (
  response: DashboardCampaignResponse | null | undefined,
  content: string,
): boolean => {
  if (!response) return false;
  if (response.intent?.trim().toLowerCase() === 'other') return false;

  const normalizedContent = content.toLowerCase();
  return !normalizedContent.includes('outside the scope of the marketing campaign brief agent')
    && !normalizedContent.includes('please provide a marketing business goal');
};

export const AiDrawer: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { isAiDrawerOpen, setAiDrawerOpen, aiDrawerQuery, aiDrawerMode, aiDrawerSessionId, assistantSourcePage, assistantContext, setAiDrawerMode, briefDraft, updateBriefData, suggestedQuestions: dashboardSuggestedQuestions, areSuggestedQuestionsLoading: areDashboardSuggestedQuestionsLoading } = useAppContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sendMessage, isLoading, reset: resetChat } = useChat(
    assistantSourcePage === 'dashboard' ? aiDrawerSessionId : null,
    assistantSourcePage === 'dashboard' ? assistantContext ?? undefined : undefined,
  );
  const { isGenerating, generateCampaignFromGoal, clearResult } = useCampaignGeneration();
  const [messages, setMessages] = useState<DrawerMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [businessGoalInput, setBusinessGoalInput] = useState(briefDraft.businessGoal);
  const [isTyping, setIsTyping] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const [pendingCampaignResponse, setPendingCampaignResponse] = useState<CampaignResponse | null>(null);
  const [briefSuggestedQuestions, setBriefSuggestedQuestions] = useState<string[]>([]);
  const [isBriefSuggestionsLoading, setIsBriefSuggestionsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const businessGoalInputRef = useRef<HTMLTextAreaElement>(null);
  const activeSessionRef = useRef<string | null>(null);
  const activeSubmissionRef = useRef<string | null>(null);
  const hasLoadedBriefFollowUpsRef = useRef(false);

  const isToolMode = aiDrawerMode in TOOL_WELCOME_MESSAGES;

  useEffect(() => {
    activeSessionRef.current = isAiDrawerOpen ? aiDrawerSessionId : null;
  }, [aiDrawerSessionId, isAiDrawerOpen, aiDrawerMode]);

  useEffect(() => {
    if (!isAiDrawerOpen || !isToolMode) return;

    setMessages([{ id: uniqueId(`${aiDrawerMode}-welcome`), role: 'ai', kind: 'text', text: TOOL_WELCOME_MESSAGES[aiDrawerMode as keyof typeof TOOL_WELCOME_MESSAGES] }]);
    setChatInput('');
    setIsTyping(false);
    activeSubmissionRef.current = null;
    setShowAction(false);
    resetChat();
    clearResult();
    setPendingCampaignResponse(null);
    requestAnimationFrame(() => chatInputRef.current?.focus());
  }, [aiDrawerMode, aiDrawerSessionId, isAiDrawerOpen, clearResult, isToolMode, resetChat]);

  useEffect(() => {
    setBusinessGoalInput(briefDraft.businessGoal);
  }, [briefDraft.businessGoal]);

  useEffect(() => {
    if (!embedded || assistantSourcePage !== 'createBrief') {
      hasLoadedBriefFollowUpsRef.current = false;
    }

    if (isAiDrawerOpen) console.log('AI Drawer opened');
    console.log('createBriefPage mounted');
    console.log('AI Drawer Open:', isAiDrawerOpen);
    console.log('assistantMode:', aiDrawerMode);
    console.log('assistantSourcePage:', assistantSourcePage);

    if (assistantSourcePage !== 'createBrief' || !isAiDrawerOpen || aiDrawerMode !== 'briefing' || hasLoadedBriefFollowUpsRef.current) return;

    hasLoadedBriefFollowUpsRef.current = true;
    setIsBriefSuggestionsLoading(true);
    console.log('createBrief briefing suggestions triggered');
    console.log({ assistantSourcePage, aiDrawerMode, isAiDrawerOpen, embedded });
    console.log('Loading briefing follow-up questions');

    const loadBriefFollowUpQuestions = async () => {
      try {
        console.log('Calling API', {
          url: 'http://127.0.0.1:8001/api/campaign_followups',
          payload: {
            agent_call: 'brief',
          },
        });
        const response = await axios.post<CampaignFollowUpResponse>(
          'http://127.0.0.1:8001/api/campaign_followups',
          { agent_call: 'brief' },
          { headers: { 'Content-Type': 'application/json' } },
        );
        console.log('Follow-up response', response);
        setBriefSuggestedQuestions(Array.isArray(response.data.questions) ? response.data.questions : []);
      } catch {
        console.warn('Failed to load campaign follow-up questions.');
        setBriefSuggestedQuestions([]);
      } finally {
        setIsBriefSuggestionsLoading(false);
      }
    };

    void loadBriefFollowUpQuestions();
  }, [aiDrawerMode, assistantSourcePage, isAiDrawerOpen]);

  useEffect(() => {
    if (aiDrawerMode !== 'general') {
      return;
    }

    if (!isAiDrawerOpen || !aiDrawerQuery) {
      return;
    }

    let isMounted = true;
    setMessages([{ id: uniqueId('general-user'), role: 'user', kind: 'text', text: aiDrawerQuery }]);
    setChatInput('');
    setIsTyping(true);
    setShowAction(false);

    const runChat = async () => {
      try {
        const result = await sendMessage(aiDrawerQuery);
        if (!isMounted) return;

        const aiText = extractAssistantContent(result);
        if (!isValidAssistantResponse(result, aiText)) {
          setMessages((prev) => [...prev, { id: uniqueId('general-ai'), role: 'ai', kind: 'text', text: ASSISTANT_FALLBACK_MESSAGE }]);
          setShowAction(true);
          return;
        }

        const aiMessageId = uniqueId('general-ai');
        const generateFollowUps = shouldGenerateFollowUps(result, aiText);
        setMessages((prev) => [...prev, {
          id: aiMessageId,
          role: 'ai',
          kind: 'text',
          text: aiText,
          isFollowUpQuestionsLoading: generateFollowUps,
        }]);
        setShowAction(true);
        if (!generateFollowUps) return;

        const followUpQuestions = await loadFollowUpSuggestions(aiText);
        if (!isMounted) return;
        if (followUpQuestions) {
          setMessages((prev) => prev.map((message) => message.id === aiMessageId
            ? { ...message, followUpQuestions, isFollowUpQuestionsLoading: false }
            : message));
        } else {
          setMessages((prev) => prev.map((message) => message.id === aiMessageId
            ? { ...message, isFollowUpQuestionsLoading: false }
            : message));
        }
      } catch (error) {
        if (!isMounted) return;
        const fallbackError = error instanceof Error ? error.message : 'I could not reach the AI service right now.';
        setMessages((prev) => [...prev, { id: uniqueId('general-error'), role: 'ai', kind: 'text', text: fallbackError }]);
        setShowAction(true);
      } finally {
        if (isMounted) setIsTyping(false);
      }
    };

    void runChat();
    return () => {
      isMounted = false;
    };
  }, [aiDrawerMode, isAiDrawerOpen, aiDrawerQuery, sendMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const clearPreviousFollowUpQuestions = () => {
    setMessages((previous) => previous.map((message) => (
      message.followUpQuestions || message.isFollowUpQuestionsLoading
        ? { ...message, followUpQuestions: [], isFollowUpQuestionsLoading: false }
        : message
    )));
  };

  const populateSuggestionInput = (question: string) => {
    if (aiDrawerMode === 'business-goal') {
      setBusinessGoalInput(question);
      requestAnimationFrame(() => businessGoalInputRef.current?.focus());
      return;
    }

    setChatInput(question);
    requestAnimationFrame(() => chatInputRef.current?.focus());
  };

  const handleGeneralSendMessage = async () => {
    const trimmedInput = chatInput.trim();
    if (!trimmedInput || isLoading || isTyping || activeSubmissionRef.current || (aiDrawerMode !== 'general' && !isToolMode)) return;
    clearPreviousFollowUpQuestions();
    if (assistantSourcePage === 'createBrief' && aiDrawerMode === 'briefing') {
      console.log('Current Page', assistantSourcePage);
      console.log('Assistant Mode', aiDrawerMode);
      console.log('Selected Endpoint', 'http://127.0.0.1:8001/api/campaigns');
      await handleSubmitBusinessGoal(trimmedInput);
      return;
    }
    const requestSessionId = activeSessionRef.current;
    const submissionId = uniqueId('submission');
    activeSubmissionRef.current = submissionId;

    setMessages((prev) => [...prev, { id: uniqueId('general-user'), role: 'user', kind: 'text', text: trimmedInput }]);
    setChatInput('');
    setIsTyping(true);
    setShowAction(false);

    try {
      const result = await sendMessage(trimmedInput, { includeAgentCall: false });
      if (activeSessionRef.current !== requestSessionId) return;
      const aiText = extractAssistantContent(result);
      if (!isValidAssistantResponse(result, aiText)) {
        setMessages((prev) => [...prev, { id: uniqueId('general-ai'), role: 'ai', kind: 'text', text: ASSISTANT_FALLBACK_MESSAGE }]);
        setShowAction(true);
        return;
      }

      const aiMessageId = uniqueId('general-ai');
      const generateFollowUps = shouldGenerateFollowUps(result, aiText);
      setMessages((prev) => [...prev, {
        id: aiMessageId,
        role: 'ai',
        kind: 'text',
        text: aiText,
        isFollowUpQuestionsLoading: generateFollowUps,
      }]);
      setShowAction(true);
      if (!generateFollowUps) return;

      const followUpQuestions = await loadFollowUpSuggestions(aiText);
      if (followUpQuestions) {
        setMessages((prev) => prev.map((message) => message.id === aiMessageId
          ? { ...message, followUpQuestions, isFollowUpQuestionsLoading: false }
          : message));
      } else {
        setMessages((prev) => prev.map((message) => message.id === aiMessageId
          ? { ...message, isFollowUpQuestionsLoading: false }
          : message));
      }
    } catch (error) {
      if (activeSessionRef.current !== requestSessionId) return;
      const fallbackError = error instanceof Error ? error.message : 'I could not reach the AI service right now.';
      setMessages((prev) => [...prev, { id: uniqueId('general-error'), role: 'ai', kind: 'text', text: fallbackError }]);
      setShowAction(true);
    } finally {
      if (activeSubmissionRef.current === submissionId) activeSubmissionRef.current = null;
      if (activeSessionRef.current === requestSessionId) setIsTyping(false);
    }
  };

  const appendBusinessGoalUser = (goal: string) => {
    setMessages((prev) => [...prev, { id: uniqueId('bg-user'), role: 'user', kind: 'text', text: goal }]);
  };

  const appendBusinessGoalError = (message: string) => {
    setMessages((prev) => [...prev, { id: uniqueId('bg-error'), role: 'ai', kind: 'error', text: message }]);
  };

  const appendBusinessGoalPreview = (response: CampaignResponse | null | undefined): string | null => {
    const preview = buildPreviewFromResponse(response);
    if (!preview || typeof response?.result !== 'string' || !response.result.trim()) return null;
    const previewMessageId = uniqueId('bg-preview');
    setMessages((prev) => [...prev, {
      id: previewMessageId,
      role: 'ai',
      kind: 'preview',
      preview,
      followUpQuestions: [],
      isFollowUpQuestionsLoading: true,
    }]);
    return previewMessageId;
  };

  const appendConfirmation = (message: string) => {
    setMessages((prev) => [...prev, { id: uniqueId('bg-confirm'), role: 'ai', kind: 'confirmation', text: message }]);
  };

  const loadBriefFollowUpQuestions = async (finalResponse: string, previewMessageId: string) => {
    try {
      const followUpPayload: CampaignFollowUpRequest = {
        agent_call: 'brief',
        context: finalResponse,
      };
      const response = await axios.post<CampaignFollowUpResponse>(
        'http://127.0.0.1:8001/api/campaign_followups',
        followUpPayload,
        { headers: { 'Content-Type': 'application/json' } },
      );
      const questions = (Array.isArray(response.data.questions)
        ? response.data.questions
        : Array.isArray(response.data.follow_up_questions)
          ? response.data.follow_up_questions
          : [])
        .filter((question): question is string => typeof question === 'string')
        .map((question) => question.trim())
        .filter(Boolean)
        .filter((question, index, allQuestions) => allQuestions.indexOf(question) === index);

      setMessages((previous) => previous.map((message) => message.id === previewMessageId
        ? { ...message, followUpQuestions: questions, isFollowUpQuestionsLoading: false }
        : message));
    } catch (error) {
      console.warn('Failed to load campaign response follow-up questions', error);
      setMessages((previous) => previous.map((message) => message.id === previewMessageId
        ? { ...message, isFollowUpQuestionsLoading: false }
        : message));
    }
  };

  const handleSubmitBusinessGoal = async (value: string) => {
    const trimmedGoal = value.trim();
    if (!trimmedGoal || isGenerating || activeSubmissionRef.current || (aiDrawerMode !== 'business-goal' && aiDrawerMode !== 'briefing') || assistantSourcePage !== 'createBrief' || assistantContext !== 'briefing') return;
    const requestSessionId = activeSessionRef.current;
    const submissionId = uniqueId('submission');
    activeSubmissionRef.current = submissionId;

    clearPreviousFollowUpQuestions();
    appendBusinessGoalUser(trimmedGoal);
    setPendingCampaignResponse(null);
    setBusinessGoalInput('');
    setIsTyping(true);
    setShowAction(false);

    try {
      const result = await generateCampaignFromGoal(trimmedGoal);
      if (activeSessionRef.current !== requestSessionId) return;
      if (!result) throw new Error('The campaign backend returned an empty response.');
      if (result.error !== null) {
        appendBusinessGoalError('Unable to generate campaign brief.');
        return;
      }
      const deserialized = deserializeCampaignResponse(result);
      if (!isSuccessfulResponse(result) || !deserialized) {
        appendBusinessGoalError('Unable to process Campaign API response.');
        return;
      }
      setPendingCampaignResponse(result);
      const previewMessageId = appendBusinessGoalPreview(result);
      if (previewMessageId && typeof result.result === 'string' && result.result.trim()) {
        void loadBriefFollowUpQuestions(result.result, previewMessageId);
      }
    } catch (error) {
      if (activeSessionRef.current !== requestSessionId) return;
      const caughtMessage = error instanceof Error ? error.message : '';
      const fallbackError = caughtMessage.includes('Campaign Brief API is running')
        ? 'Unable to connect to Campaign Brief API.'
        : caughtMessage || 'Unable to connect to Campaign Brief API.';
      appendBusinessGoalError(fallbackError);
    } finally {
      if (activeSubmissionRef.current === submissionId) activeSubmissionRef.current = null;
      if (activeSessionRef.current === requestSessionId) setIsTyping(false);
    }
  };

  const handleAcceptAndApply = () => {
    const deserialized = deserializeCampaignResponse(pendingCampaignResponse);
    if (!deserialized) return;

    const nextUpdate: Partial<typeof briefDraft> = {};
    const { response, brief } = deserialized;

    const businessGoal = response.business_goal?.trim();
    const marketingGoal = typeof brief.title === 'string'
      ? brief.title.trim()
      : typeof brief.objective === 'string'
        ? brief.objective.trim()
        : '';
    const tone = typeof brief.tone === 'string' ? brief.tone.trim() : '';
    const targetAudience = Array.isArray(brief.target_segments)
      ? brief.target_segments
          .map((item) => (typeof item === 'object' && item && 'name' in item ? String(item.name).trim() : ''))
          .filter(Boolean)
          .join('\n')
      : '';
    const insights = Array.isArray(brief.key_insights)
      ? brief.key_insights
          .map((item) => (typeof item === 'object' && item && 'statement' in item ? String(item.statement).trim() : ''))
          .filter(Boolean)
          .join(', ')
      : '';
    const messageProposition = Array.isArray(brief.recommended_channels)
      ? brief.recommended_channels
          .map((item) => {
            if (typeof item !== 'object' || !item) return '';
            return 'rationale' in item
              ? String(item.rationale).trim()
              : 'justification' in item
                ? String(item.justification).trim()
                : '';
          })
          .filter(Boolean)
          .join(', ')
      : '';
    const strategicRole = Array.isArray(brief.recommended_channels)
      ? brief.recommended_channels
          .map((item) => (typeof item === 'object' && item && 'channel' in item ? String(item.channel).trim() : ''))
          .filter(Boolean)
          .join(', ')
      : '';
    const executionalMandatories = Array.isArray(brief.proposed_kpis)
      ? brief.proposed_kpis.map((item) => String(item).trim()).filter(Boolean).join(', ')
      : '';

    nextUpdate.projectName = 'MacDonalds';
    nextUpdate.requestedBy = user?.displayName || user?.email || '';
    if (businessGoal) nextUpdate.businessGoal = businessGoal;
    if (marketingGoal) nextUpdate.marketingGoal = marketingGoal;
    if (tone) nextUpdate.tone = tone;
    if (targetAudience) nextUpdate.targetAudience = targetAudience;
    if (insights) nextUpdate.insights = insights;
    if (messageProposition) nextUpdate.messageProposition = messageProposition;
    if (strategicRole) nextUpdate.strategicRole = strategicRole;
    if (executionalMandatories) nextUpdate.executionalMandatories = executionalMandatories;

    if (Object.keys(nextUpdate).length > 0) {
      updateBriefData(nextUpdate);
    }

    appendConfirmation('Response applied to the Feel Brief form.');
  };

  const handleCancelCampaignResponse = () => {
    appendConfirmation('Response kept in the conversation. No form fields were changed.');
    setPendingCampaignResponse(null);
  };

  const renderMessage = (message: DrawerMessage) => {
    if (message.role === 'user') {
      return <div className="whitespace-pre-wrap break-words">{message.text}</div>;
    }

    if (message.kind === 'error') {
      return <div className="text-red-700">{message.text}</div>;
    }

    if (message.kind === 'confirmation') {
      return <div className="text-green-700">{message.text}</div>;
    }

    if (message.kind === 'preview' && message.preview) {
      const sections = [
        { label: 'Business Goal', value: message.preview.businessGoal },
        { label: 'Marketing Goal', value: message.preview.objective },
        { label: 'Tone', value: message.preview.tone },
        { label: 'Target Audience', items: message.preview.targetSegments },
        { label: 'Key Insights', items: message.preview.keyInsights },
        { label: 'Recommended Channels', items: message.preview.recommendedChannels },
        { label: 'Executional Mandatories', items: message.preview.proposedKpis },
      ].filter((section) => section.items ? section.items.length > 0 : section.value && String(section.value).trim().length > 0);

      return (
        <div className="space-y-4">
          <div className="text-sm font-semibold text-slate-900">🤖 AI Generated Campaign Brief</div>
          {sections.map((section) => (
            <div key={section.label} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">{section.label}</div>
              {section.items ? (
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              ) : (
                <div className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{section.value}</div>
              )}
            </div>
          ))}

          <div className="text-sm font-medium text-slate-900">
            Would you like to use this response to populate the Feel Brief form?
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={handleAcceptAndApply}
              className="rounded-full bg-mcd-black px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              Use Response
            </button>
            <button
              type="button"
              onClick={handleCancelCampaignResponse}
              className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return message.text ? <MarkdownMessage content={message.text} /> : null;
  };

  if (!isAiDrawerOpen && !embedded) return null;

  const handleContinue = () => {
    setAiDrawerOpen(false);
    navigate(ROUTES.INSIGHTS);
  };

  const handleReviewBrief = () => {
    setAiDrawerOpen(false);
    navigate(ROUTES.CREATE_BRIEF);
  };

  const renderMessageBubble = (message: DrawerMessage) => (
    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.role === 'ai' && (
        <div className="w-8 h-8 rounded-full bg-mcd-yellow flex items-center justify-center mr-3 flex-shrink-0">
          <Sparkles size={14} className="text-white" />
        </div>
      )}
      <div className={`max-w-[90%] p-4 rounded-2xl text-sm ${
        message.role === 'user' ? 'bg-gray-100 text-mcd-black rounded-tr-sm' : 'bg-white border border-gray-100 shadow-sm text-mcd-black rounded-tl-sm'
      }`}>
        {renderMessage(message)}
        {message.role === 'ai' && (message.isFollowUpQuestionsLoading || message.followUpQuestions && message.followUpQuestions.length > 0) && (
          <div className={assistantSourcePage === 'createBrief' && message.kind === 'preview'
            ? 'mt-4 border-t border-gray-100 pt-4 pb-4'
            : 'mt-4 border-t border-gray-100 pt-3'}>
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Follow-up Questions</div>
            {message.isFollowUpQuestionsLoading ? (
              <div className={assistantSourcePage === 'createBrief' && message.kind === 'preview' ? 'text-sm leading-6 text-gray-500' : 'text-sm text-gray-500'}>
                {assistantSourcePage === 'createBrief' && message.kind === 'preview' ? 'Loading follow-up questions...' : 'Updating suggestions...'}
              </div>
            ) : (
              <div className={assistantSourcePage === 'createBrief' && message.kind === 'preview' ? 'flex w-full flex-col gap-2' : 'flex flex-wrap gap-2'}>
                {message.followUpQuestions?.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => populateSuggestionInput(question)}
                    disabled={isLoading || isTyping}
                    className={assistantSourcePage === 'createBrief' && message.kind === 'preview'
                      ? 'w-full cursor-pointer rounded-3xl border border-gray-200 bg-[#F8F8F8] px-4 py-3 text-left text-sm font-medium leading-[1.5] text-gray-700 transition-all duration-200 hover:-translate-y-px hover:border-gray-300 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60'
                      : 'rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60'}
                  >
                    <span className={assistantSourcePage === 'createBrief' && message.kind === 'preview' ? 'line-clamp-3' : undefined}>{question}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const welcomeMessage = isToolMode ? messages[0] : undefined;
  const conversationMessages = isToolMode ? messages.slice(1) : messages;

  const loadFollowUpSuggestions = async (finalResponse: string): Promise<string[] | null> => {
    if (assistantSourcePage !== 'dashboard' || (assistantContext !== 'insight' && assistantContext !== 'segment')) return null;

    try {
      const response = await apiClient.post<{ follow_up_questions?: string[] }>('/follow-up-questions', {
        agent_call: assistantContext,
        final_response: finalResponse,
      });

      if (Array.isArray(response.data.follow_up_questions)) {
        return response.data.follow_up_questions;
      }
    } catch {
      console.log('Failed to load follow-up suggestions.');
    }

    return null;
  };

  return (
    <>
      {!embedded && <div className="fixed inset-0 bg-black/20 z-40 transition-opacity" onClick={() => setAiDrawerOpen(false)} />}

      <div className={embedded
        ? 'relative w-80 h-full shrink-0 bg-white border-l border-gray-200 shadow-[-4px_0_15px_rgba(0,0,0,0.03)] z-10 flex flex-col'
        : 'fixed inset-y-0 right-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out'}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-mcd-black font-semibold">
            <Sparkles size={18} className="text-mcd-red" />
            <span>{aiDrawerMode === 'business-goal' ? 'Discussing: Business Goal' : isToolMode ? TOOL_TITLES[aiDrawerMode as keyof typeof TOOL_TITLES] : 'AI-Powered Search'}</span>
          </div>
          <button onClick={() => setAiDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {welcomeMessage && <div>{renderMessageBubble(welcomeMessage)}</div>}

        <div>
          {assistantSourcePage === 'dashboard' && (aiDrawerMode === 'research' || aiDrawerMode === 'audiences') && (
            <div className="flex flex-col gap-2">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Suggested Questions</div>
              {areDashboardSuggestedQuestionsLoading ? (
                <div className="text-sm text-gray-500">Loading suggestions...</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {dashboardSuggestedQuestions.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => populateSuggestionInput(question)}
                      disabled={isLoading || isTyping}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {assistantSourcePage === 'createBrief' && aiDrawerMode === 'briefing' && (
            <div className="flex flex-col gap-2">
              {isBriefSuggestionsLoading ? (
                <div className="text-sm text-gray-500">Loading suggestions...</div>
              ) : briefSuggestedQuestions.length > 0 ? (
                <>
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Suggested Questions</div>
                  <div className="flex flex-wrap gap-2">
                    {briefSuggestedQuestions.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => populateSuggestionInput(question)}
                        className="rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {conversationMessages.map(renderMessageBubble)}

          {isTyping && (
            <div className="flex justify-start items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-mcd-yellow flex items-center justify-center flex-shrink-0">
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="flex gap-1 bg-white border border-gray-100 shadow-sm p-4 rounded-2xl rounded-tl-sm">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          {showAction && aiDrawerMode === 'general' && (
            <div className="flex flex-col items-center gap-2 mt-4 animate-fade-in">
              <button onClick={handleReviewBrief} className="bg-white border border-mcd-yellow text-mcd-black px-4 py-2 rounded-full font-semibold hover:bg-yellow-50 transition-colors shadow-sm">
                Review generated brief
              </button>
              <button onClick={handleContinue} className="bg-mcd-yellow text-mcd-black px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-yellow-400 transition-colors shadow-sm">
                Continue to Insights
                <ArrowRight size={18} />
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        </div>

        {aiDrawerMode === 'general' || isToolMode ? (
          <div className="p-4 border-t border-gray-100">
            <div className="relative">
              <input
                ref={chatInputRef}
                type="text"
                placeholder="Ask a follow-up question..."
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void handleGeneralSendMessage();
                  }
                }}
                disabled={isLoading || isTyping}
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-mcd-yellow/50 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => void handleGeneralSendMessage()}
                disabled={isLoading || isTyping || !chatInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-mcd-red rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-red-700"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 mb-2">Predefined suggestions</div>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_BUSINESS_GOALS.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => populateSuggestionInput(goal)}
                    disabled={isGenerating}
                    className="rounded-full border border-mcd-yellow bg-yellow-50 px-3 py-2 text-xs font-medium text-mcd-black hover:bg-yellow-100 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <textarea
                ref={businessGoalInputRef}
                value={businessGoalInput}
                onChange={(event) => setBusinessGoalInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void handleSubmitBusinessGoal(businessGoalInput);
                  }
                }}
                rows={3}
                placeholder="Ask a follow-up question..."
                disabled={isGenerating}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-mcd-yellow/50 disabled:opacity-60 disabled:cursor-not-allowed resize-none"
              />
              <button
                type="button"
                onClick={() => void handleSubmitBusinessGoal(businessGoalInput)}
                disabled={isGenerating || !businessGoalInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-mcd-red text-white flex items-center justify-center hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send business goal"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AiDrawer;