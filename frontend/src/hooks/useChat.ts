import { useCallback, useEffect, useState } from 'react';
import { sendDashboardCampaignMessage } from '../api/dashboardCampaignApi';
import { sessionService } from '../services/sessionService';
import type { DashboardCampaignResponse } from '../types/chat.types';
import type { AssistantContext } from '../../types';

interface UseChatState {
  isLoading: boolean;
  error: string | null;
  response: DashboardCampaignResponse | null;
  sessionId: string;
  sendMessage: (message: string) => Promise<DashboardCampaignResponse | null>;
  clearError: () => void;
  reset: () => void;
}

const isValidSessionId = (sessionId: string | null | undefined): sessionId is string => {
  return typeof sessionId === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId);
};

const getDashboardSessionId = (sessionId: string | null | undefined): string => {
  return isValidSessionId(sessionId) ? sessionId : sessionService.createSessionId();
};

export const useChat = (sessionIdOverride?: string | null, assistantContext?: AssistantContext): UseChatState => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<DashboardCampaignResponse | null>(null);

  const [sessionId, setSessionId] = useState(
    () => getDashboardSessionId(sessionIdOverride),
  );

  useEffect(() => {
    setSessionId(getDashboardSessionId(sessionIdOverride));
  }, [sessionIdOverride]);

  const sendMessage = useCallback(async (message: string): Promise<DashboardCampaignResponse | null> => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      const validationError = 'Message cannot be empty.';
      setError(validationError);
      throw new Error(validationError);
    }

    setIsLoading(true);
    setError(null);

    try {
      if (assistantContext !== 'insight' && assistantContext !== 'segment') {
        if (import.meta.env.DEV) console.error('Unsupported dashboard assistant context:', assistantContext);
        throw new Error('This AI assistant is not configured for the current page.');
      }

      console.log('Sending message to Campaign Assistant API:', { message: trimmedMessage, agent_call: assistantContext, session_id: sessionId });
      const result = await sendDashboardCampaignMessage({
        query: trimmedMessage,
        user_id: 'api-user',
        session_id: crypto.randomUUID(),
        agent_call: assistantContext,
      });

      if (isValidSessionId(result.session_id)) setSessionId(result.session_id);
      setResponse(result);
      return result;
    } catch (caughtError) {
      const messageText = caughtError instanceof Error ? caughtError.message : 'Something went wrong while contacting the AI backend.';
      setError(messageText);
      throw new Error(messageText);
    } finally {
      setIsLoading(false);
    }
  }, [assistantContext, sessionId]);

  const clearError = useCallback(() => setError(null), []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResponse(null);
  }, []);

  return {
    isLoading,
    error,
    response,
    sessionId,
    sendMessage,
    clearError,
    reset,
  };
};

export default useChat;
