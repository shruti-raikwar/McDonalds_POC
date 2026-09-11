import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../../context/AppContext';
import { ROUTES } from '../../../routes/routePaths';
import { useChat } from '../../../src/hooks/useChat';
import { useCampaignGeneration } from '../../../src/hooks/useCampaignGeneration';
import type { CampaignResponse } from '../../../src/types/campaign.types';
import type { AiDrawerMode } from '../../../types';

const PREDEFINED_BUSINESS_GOALS = [
  'Drive weekday lunch traffic for the new spicy chicken wrap',
];

interface CampaignPreview {
  businessGoal?: string;
  objective?: string;
  targetSegments: string[];
  keyInsights: string[];
  recommendedChannels: string[];
  proposedKpis: string[];
  lowConfidenceSections: string[];
  overallConfidence?: string;
}

type DrawerMessage = {
  id: string;
  role: 'user' | 'ai';
  kind: 'text' | 'error' | 'preview' | 'confirmation';
  text?: string;
  preview?: CampaignPreview;
};

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

const buildPreviewFromResponse = (response: CampaignResponse | null | undefined): CampaignPreview | null => {
  if (!response || !response.brief) return null;

  const brief = response.brief;
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
        .map((item) => {
          if (typeof item !== 'object' || !item) return '';
          const why = 'why' in item ? String(item.why).trim() : 'justification' in item ? String(item.justification).trim() : '';
          return why;
        })
        .filter(Boolean)
    : [];

  const proposedKpis = Array.isArray(brief.proposed_kpis)
    ? brief.proposed_kpis.map((item) => String(item).trim()).filter(Boolean)
    : [];

  const lowConfidenceSections = Array.isArray(response.evaluation?.low_confidence_sections)
    ? response.evaluation!.low_confidence_sections.map((item) => String(item).trim()).filter(Boolean)
    : [];

  return {
    businessGoal: response.business_goal?.trim() || undefined,
    objective: typeof brief.objective === 'string' ? brief.objective.trim() : undefined,
    targetSegments,
    keyInsights,
    recommendedChannels,
    proposedKpis,
    lowConfidenceSections,
    overallConfidence: response.evaluation && typeof response.evaluation.overall_confidence !== 'undefined'
      ? String(response.evaluation.overall_confidence).trim()
      : undefined,
  };
};

const isSuccessfulResponse = (response: CampaignResponse | null | undefined): boolean => {
  if (!response) return false;
  if (response.error) return false;
  return response.status === 'pending_review' || !!response.brief || !!response.business_goal || !!response.trace_id;
};

export const AiDrawer: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { isAiDrawerOpen, setAiDrawerOpen, aiDrawerQuery, aiDrawerMode, aiDrawerSessionId, setAiDrawerMode, briefDraft, updateBriefData } = useAppContext();
  const navigate = useNavigate();
  const { sendMessage, isLoading, reset: resetChat } = useChat(aiDrawerSessionId);
  const { isGenerating, campaignResult, generateCampaignFromGoal, clearResult } = useCampaignGeneration();
  const [messages, setMessages] = useState<DrawerMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [businessGoalInput, setBusinessGoalInput] = useState(briefDraft.businessGoal);
  const [isTyping, setIsTyping] = useState(false);
  const [showAction, setShowAction] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const activeSessionRef = useRef<string | null>(null);

  const isToolMode = aiDrawerMode in TOOL_WELCOME_MESSAGES;

  useEffect(() => {
    activeSessionRef.current = isAiDrawerOpen ? aiDrawerSessionId : null;
  }, [aiDrawerSessionId, isAiDrawerOpen, aiDrawerMode]);

  useEffect(() => {
    if (!isAiDrawerOpen || !isToolMode) return;

    setMessages([{ id: uniqueId(`${aiDrawerMode}-welcome`), role: 'ai', kind: 'text', text: TOOL_WELCOME_MESSAGES[aiDrawerMode as keyof typeof TOOL_WELCOME_MESSAGES] }]);
    setChatInput('');
    setIsTyping(false);
    setShowAction(false);
    resetChat();
    clearResult();
    requestAnimationFrame(() => chatInputRef.current?.focus());
  }, [aiDrawerMode, aiDrawerSessionId, isAiDrawerOpen, clearResult, isToolMode, resetChat]);

  useEffect(() => {
    setBusinessGoalInput(briefDraft.businessGoal);
  }, [briefDraft.businessGoal]);

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

        const aiText = typeof result?.response === 'string'
          ? result.response
          : typeof result?.message === 'string'
            ? result.message
            : '';

        if (!aiText) throw new Error('The AI backend returned an empty response.');

        setMessages((prev) => [...prev, { id: uniqueId('general-ai'), role: 'ai', kind: 'text', text: aiText }]);
        setShowAction(true);
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

  const handleGeneralSendMessage = async () => {
    const trimmedInput = chatInput.trim();
    if (!trimmedInput || isLoading || isTyping || (aiDrawerMode !== 'general' && !isToolMode)) return;
    const requestSessionId = activeSessionRef.current;

    setMessages((prev) => [...prev, { id: uniqueId('general-user'), role: 'user', kind: 'text', text: trimmedInput }]);
    setChatInput('');
    setIsTyping(true);
    setShowAction(false);

    try {
      const result = await sendMessage(trimmedInput);
      if (activeSessionRef.current !== requestSessionId) return;
      const aiText = typeof result?.response === 'string'
        ? result.response
        : typeof result?.message === 'string'
          ? result.message
          : '';

      if (!aiText) throw new Error('The AI backend returned an empty response.');

      setMessages((prev) => [...prev, { id: uniqueId('general-ai'), role: 'ai', kind: 'text', text: aiText }]);
      setShowAction(true);
    } catch (error) {
      if (activeSessionRef.current !== requestSessionId) return;
      const fallbackError = error instanceof Error ? error.message : 'I could not reach the AI service right now.';
      setMessages((prev) => [...prev, { id: uniqueId('general-error'), role: 'ai', kind: 'text', text: fallbackError }]);
      setShowAction(true);
    } finally {
      setIsTyping(false);
    }
  };

  const appendBusinessGoalUser = (goal: string) => {
    setMessages((prev) => [...prev, { id: uniqueId('bg-user'), role: 'user', kind: 'text', text: goal }]);
  };

  const appendBusinessGoalError = (message: string) => {
    setMessages((prev) => [...prev, { id: uniqueId('bg-error'), role: 'ai', kind: 'error', text: message }]);
  };

  const appendBusinessGoalPreview = (response: CampaignResponse | null | undefined) => {
    const preview = buildPreviewFromResponse(response);
    if (!preview) return;
    setMessages((prev) => [...prev, { id: uniqueId('bg-preview'), role: 'ai', kind: 'preview', preview }]);
  };

  const appendConfirmation = (message: string) => {
    setMessages((prev) => [...prev, { id: uniqueId('bg-confirm'), role: 'ai', kind: 'confirmation', text: message }]);
  };

  const handleSubmitBusinessGoal = async (value: string) => {
    const trimmedGoal = value.trim();
    if (!trimmedGoal || isGenerating || aiDrawerMode !== 'business-goal') return;
    const requestSessionId = activeSessionRef.current;

    appendBusinessGoalUser(trimmedGoal);
    updateBriefData({ businessGoal: trimmedGoal });
    setBusinessGoalInput('');
    setIsTyping(true);
    setShowAction(false);

    try {
      const result = await generateCampaignFromGoal(trimmedGoal);
      if (activeSessionRef.current !== requestSessionId) return;
      if (!result) throw new Error('The campaign backend returned an empty response.');
      if (result.error) {
        appendBusinessGoalError(result.error);
        return;
      }
      if (!isSuccessfulResponse(result)) {
        appendBusinessGoalError('The Business Goal campaign service returned an invalid response.');
        return;
      }
      appendBusinessGoalPreview(result);
    } catch (error) {
      if (activeSessionRef.current !== requestSessionId) return;
      const fallbackError = error instanceof Error
        ? error.message
        : 'Unable to connect to the Business Goal campaign service. Verify that the backend is running on port 8001.';
      appendBusinessGoalError(fallbackError);
    } finally {
      if (activeSessionRef.current === requestSessionId) setIsTyping(false);
    }
  };

  const handleAcceptAndApply = () => {
    if (!campaignResult || !campaignResult.brief || campaignResult.error) return;

    const nextUpdate: Partial<typeof briefDraft> = {};
    const brief = campaignResult.brief;

    const businessGoal = campaignResult.business_goal?.trim();
    const marketingGoal = typeof campaignResult?.brief?.title === 'string'
      ? campaignResult.brief.title.trim()
      : typeof brief.objective === 'string'
        ? brief.objective.trim()
        : '';
    const tone = typeof campaignResult?.brief?.tone === 'string' ? campaignResult.brief.tone.trim() : '';
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
            return 'why' in item ? String(item.why).trim() : 'justification' in item ? String(item.justification).trim() : '';
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

    appendConfirmation('Business Goal draft accepted and applied to the brief.');
  };

  const handleEditBusinessGoal = () => {
    setAiDrawerMode('business-goal');
    setAiDrawerOpen(true);
    setBusinessGoalInput(briefDraft.businessGoal);
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
        { label: 'Objective', value: message.preview.objective },
        { label: 'Target segment names', value: message.preview.targetSegments.length ? message.preview.targetSegments.join('\n') : undefined },
        { label: 'Key insight statements', value: message.preview.keyInsights.length ? message.preview.keyInsights.join(', ') : undefined },
        { label: 'Recommended channels', value: message.preview.recommendedChannels.length ? message.preview.recommendedChannels.join(', ') : undefined },
        { label: 'Proposed KPIs', value: message.preview.proposedKpis.length ? message.preview.proposedKpis.join(', ') : undefined },
        { label: 'Low-confidence sections', value: message.preview.lowConfidenceSections.length ? message.preview.lowConfidenceSections.join(', ') : undefined },
        { label: 'Overall confidence', value: message.preview.overallConfidence },
      ].filter((section) => section.value && String(section.value).trim().length > 0);

      return (
        <div className="space-y-4">
          <div className="text-sm font-semibold text-slate-900">Generated draft preview</div>
          {sections.map((section) => (
            <div key={section.label} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">{section.label}</div>
              <div className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{section.value}</div>
            </div>
          ))}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={handleAcceptAndApply}
              className="rounded-full bg-mcd-black px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              Accept and apply
            </button>
            <button
              type="button"
              onClick={() => {
                const currentGoal = briefDraft.businessGoal || businessGoalInput || '';
                if (currentGoal) {
                  void handleSubmitBusinessGoal(currentGoal);
                }
              }}
              className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Regenerate
            </button>
            <button
              type="button"
              onClick={handleEditBusinessGoal}
              className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Edit Business Goal
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

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {messages.map((message) => (
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
              </div>
            </div>
          ))}

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
                    onClick={() => void handleSubmitBusinessGoal(goal)}
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