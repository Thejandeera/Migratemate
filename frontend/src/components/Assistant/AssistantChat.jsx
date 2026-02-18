import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, X, MessageSquare, Loader2, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { API_URL } from '../../utils/api';
import { getUserData } from '../../utils/auth';

const AssistantChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const user = getUserData();

    const [usageStats, setUsageStats] = useState(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen) {
            // Always try to fetch usage, defaults to guest in the function
            fetchUsage();
            // Only fetch history if we have a user ID
            if (user?.id) {
                fetchHistory();
            }
        }
    }, [isOpen]);

    const fetchUsage = async () => {
        try {
            const userId = user?.id || 'guest';
            const response = await fetch(`${API_URL}/assistant/usage/${userId}`);

            if (response.ok) {
                const data = await response.json();
                setUsageStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch usage", error);
        }
    };

    const fetchHistory = async () => {
        if (!user?.id) return;
        try {
            const response = await fetch(`${API_URL}/assistant/history/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                // ... (rest of history fetching)
                const formattedMessages = [];
                data.forEach(item => {
                    formattedMessages.push({ text: item.userMessage, sender: 'user', time: item.timestamp });
                    formattedMessages.push({ text: item.assistantResponse, sender: 'bot', time: item.timestamp });
                });
                setMessages(formattedMessages);
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { text: input, sender: 'user', time: new Date().toISOString() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/assistant/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user?.id || 'guest',
                    message: userMsg.text
                })
            });

            if (response.ok) {
                const data = await response.json();
                const botMsg = { text: data.assistantResponse, sender: 'bot', time: new Date().toISOString() };
                setMessages(prev => [...prev, botMsg]);
                fetchUsage(); // Refresh usage after message
            } else {
                setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", sender: 'bot', time: new Date().toISOString() }]);
            }

        } catch (error) {
            console.error("Chat error", error);
            setMessages(prev => [...prev, { text: "Sorry, something went wrong.", sender: 'bot', time: new Date().toISOString() }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const location = useLocation();

    // Calculate time until reset
    const getResetTime = () => {
        if (!usageStats?.nextReset) return '';
        const reset = new Date(usageStats.nextReset);
        return reset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (location.pathname !== '/dashboard') {
        return null;
    }

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all duration-300 z-50 ${isOpen ? 'bg-red-500 rotate-90' : 'bg-green-600 hover:bg-green-700 hover:scale-110'}`}
            >
                {isOpen ? <X className="text-white w-6 h-6" /> : <Bot className="text-white w-8 h-8" />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-0 right-0 w-full h-full sm:bottom-6 sm:right-6 sm:w-[450px] sm:h-[600px] bg-white sm:rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 animate-fade-in-up overflow-hidden">
                    {/* Header */}
                    <div className="bg-green-600 p-4 shadow-md z-10">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Bot className="text-white w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">Migration Assistant</h3>
                                    <div className="flex items-center gap-3 text-xs text-green-100">
                                        <p className="flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                                            Online
                                        </p>
                                        {usageStats ? (
                                            <>
                                                <span>•</span>
                                                <span>{usageStats.remaining}/{usageStats.limit} free chats</span>
                                                <span>•</span>
                                                <span>Resets {getResetTime()}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>•</span>
                                                <span className="animate-pulse">Loading limits...</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scroll-smooth">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-8">
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                                    <Bot className="w-10 h-10 text-green-500" />
                                </div>
                                <h4 className="text-gray-900 font-semibold mb-2">How can I help you?</h4>
                                <p className="text-sm">Ask me anything about services, bookings, or community.</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm ${msg.sender === 'user'
                                    ? 'bg-green-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                    }`}>
                                    {msg.sender === 'user' ? (
                                        msg.text
                                    ) : (
                                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-green">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        {usageStats?.remaining === 0 ? (
                            <div className="text-center p-2 text-sm text-red-500 bg-red-50 rounded-xl border border-red-100">
                                <p className="font-semibold">Daily Limit Reached</p>
                                <p className="text-xs mt-1">Chat resets at {getResetTime()}</p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all shadow-sm">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type your question..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 min-w-0"
                                    disabled={loading || usageStats?.remaining === 0}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || loading || usageStats?.remaining === 0}
                                    className={`p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 ${input.trim() && !loading && (usageStats?.remaining === undefined || usageStats?.remaining > 0)
                                        ? 'bg-green-600 text-white shadow-lg hover:bg-green-700 hover:scale-105 active:scale-95'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {/* Footer Usage Text */}
                        {usageStats && usageStats.remaining > 0 && (
                            <div className="text-center mt-2">
                                <span className="text-[10px] text-gray-400">
                                    {usageStats.remaining} chats remaining · Resets {getResetTime()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default AssistantChat;
