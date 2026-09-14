import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useChat } from '../src/hooks/useChat';

const AiDrawer: React.FC = () => {
    const { isAiDrawerOpen, setAiDrawerOpen, aiDrawerQuery, aiDrawerMode, aiDrawerSessionId } = useAppContext();
    const navigate = useNavigate();
    const { sendMessage, isLoading } = useChat(aiDrawerSessionId, aiDrawerMode);
    const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showAction, setShowAction] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const appendAiMessage = (text: string) => {
        setMessages(prev => [...prev, { role: 'ai', text }]);
    };

    const handleSendMessage = async () => {
        const trimmedInput = chatInput.trim();
        if (!trimmedInput || isLoading || isTyping) {
            return;
        }

        setMessages(prev => [...prev, { role: 'user', text: trimmedInput }]);
        setChatInput('');
        setIsTyping(true);
        setShowAction(false);

        try {
            const result = await sendMessage(trimmedInput);
            const aiText = result?.final_response || result?.draft_brief || "I couldn't generate a response.";

            if (!aiText) {
                throw new Error('The AI backend returned an empty response.');
            }

            appendAiMessage(aiText);
            setShowAction(true);
        } catch (error) {
            const fallbackError = error instanceof Error ? error.message : 'I could not reach the AI service right now.';
            appendAiMessage(fallbackError);
            setShowAction(true);
        } finally {
            setIsTyping(false);
        }
    };

    useEffect(() => {
        if (isAiDrawerOpen && aiDrawerQuery) {
            setMessages([{ role: 'user', text: aiDrawerQuery }]);
            setChatInput('');
            setIsTyping(true);
            setShowAction(false);

            let isMounted = true;
            const runChat = async () => {
                try {
                    const result = await sendMessage(aiDrawerQuery);
                    if (!isMounted) {
                        return;
                    }

                    const aiText = result?.final_response || result?.draft_brief || "I couldn't generate a response.";

                    if (!aiText) {
                        throw new Error('The AI backend returned an empty response.');
                    }

                    setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
                    setShowAction(true);
                } catch (error) {
                    if (!isMounted) {
                        return;
                    }

                    const fallbackError = error instanceof Error ? error.message : 'I could not reach the AI service right now.';
                    setMessages(prev => [...prev, { role: 'ai', text: fallbackError }]);
                    setShowAction(true);
                } finally {
                    if (isMounted) {
                        setIsTyping(false);
                    }
                }
            };

            void runChat();

            return () => {
                isMounted = false;
            };
        }
    }, [isAiDrawerOpen, aiDrawerQuery, sendMessage]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    if (!isAiDrawerOpen) return null;

    const handleContinue = () => {
        setAiDrawerOpen(false);
        navigate('/insights');
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/20 z-40 transition-opacity"
                onClick={() => setAiDrawerOpen(false)}
            />
            
            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-mcd-black font-semibold">
                        <Sparkles size={18} className="text-mcd-red" />
                        AI-Powered Search
                    </div>
                    <button 
                        onClick={() => setAiDrawerOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'ai' && (
                                <div className="w-8 h-8 rounded-full bg-mcd-yellow flex items-center justify-center mr-3 flex-shrink-0">
                                    <Sparkles size={14} className="text-white" />
                                </div>
                            )}
                            <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                                msg.role === 'user' 
                                    ? 'bg-gray-100 text-mcd-black rounded-tr-sm' 
                                    : 'bg-white border border-gray-100 shadow-sm text-mcd-black rounded-tl-sm'
                            }`}>
                                {msg.text}
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

                    {showAction && (
                        <div className="flex justify-center mt-4 animate-fade-in">
                            <button 
                                onClick={handleContinue}
                                className="bg-mcd-yellow text-mcd-black px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-yellow-400 transition-colors shadow-sm"
                            >
                                Continue to Insights
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-gray-100">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Ask a follow-up question..." 
                            value={chatInput}
                            onChange={(event) => setChatInput(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault();
                                    void handleSendMessage();
                                }
                            }}
                            disabled={isLoading || isTyping}
                            className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-mcd-yellow/50 disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                        <button
                            type="button"
                            onClick={() => void handleSendMessage()}
                            disabled={isLoading || isTyping || !chatInput.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-mcd-red rounded-full flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-red-700"
                        >
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AiDrawer;
