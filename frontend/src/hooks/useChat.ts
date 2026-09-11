import { useCallback, useMemo, useState } from 'react';
import { sendChatMessage } from '../api/chatApi';
import { sessionService } from '../services/sessionService';
import type { ChatResponse } from '../types/chat.types';

interface UseChatState {
  isLoading: boolean;
  error: string | null;
  response: ChatResponse | null;
  sessionId: string;
  sendMessage: (message: string) => Promise<ChatResponse | null>;
  clearError: () => void;
  reset: () => void;
}

export const useChat = (sessionIdOverride?: string | null): UseChatState => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ChatResponse | null>(null);

  const sessionId = useMemo(
    () => sessionIdOverride || sessionService.getOrCreateSessionId(),
    [sessionIdOverride],
  );

  const sendMessage = useCallback(async (message: string): Promise<ChatResponse | null> => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      const validationError = 'Message cannot be empty.';
      setError(validationError);
      throw new Error(validationError);
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await sendChatMessage({
        user_id: sessionService.getOrCreateUserId(),
        session_id: sessionId,
        message: trimmedMessage,
      });

      setResponse(result);
      return result;
    } catch (caughtError) {
      const messageText = caughtError instanceof Error ? caughtError.message : 'Something went wrong while contacting the AI backend.';
      setError(messageText);
      throw new Error(messageText);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

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
