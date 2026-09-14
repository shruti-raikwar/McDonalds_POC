import React, { useState } from 'react';
import useChat from '../hooks/useChat';

export const ChatBot: React.FC = () => {
  const { isLoading, error, response, sessionId, sendMessage, clearError } = useChat();
  const [input, setInput] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const result = await sendMessage(input);

    if (result) {
      setInput('');
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '2rem auto', padding: '1rem', fontFamily: 'sans-serif' }}>
      <h2>AI Chat</h2>
      <p style={{ fontSize: 12, color: '#666' }}>
        Session ID: <strong>{sessionId}</strong>
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask the AI something..."
          disabled={isLoading}
          style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #ddd' }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 8,
            border: 'none',
            background: '#2563eb',
            color: '#fff',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: '#fee2e2', color: '#991b1b' }}>
          <strong>Error:</strong> {error}
          <button onClick={clearError} style={{ marginLeft: 8, background: 'transparent', border: 'none', color: '#991b1b', cursor: 'pointer' }}>
            Dismiss
          </button>
        </div>
      )}

      {response && (
        <div style={{ marginTop: 16, padding: 16, background: '#f3f4f6', borderRadius: 8 }}>
          <strong>AI Response:</strong>
          <p style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
            {response.final_response || response.draft_brief || "I couldn't generate a response."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
