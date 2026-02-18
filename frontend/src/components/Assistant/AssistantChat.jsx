import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, X, MessageSquare, Loader2, Bot, Sparkles, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { API_URL } from '../../utils/api';
import { getUserData } from '../../utils/auth';
import { motion, AnimatePresence } from 'framer-motion';

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
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 p-4 bg-gradient-to-tr from-green-600 to-emerald-500 text-white rounded-full shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 hover:scale-110 active:scale-95 transition-all duration-300 z-50 group"
                    >
                        <Bot className="w-7 h-7" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", bounce: 0.25 }}
                        className="fixed bottom-0 right-0 w-full h-full sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[600px] bg-white sm:rounded-3xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 shadow-md relative overflow-hidden">
                            {/* Decorative circles */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

                            <div className="flex items-center justify-between mb-3 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-inner">
                                        <Bot className="text-white w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg leading-tight">MigrateMate AI</h3>
                                        <div className="flex items-center gap-2 text-xs text-green-50 font-medium">
                                            <span className="flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse shadow-[0_0_5px_rgba(134,239,172,0.8)]"></span>
                                                Online
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-white/80 hover:bg-white/10 hover:text-white rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Usage Stats (Glassmorphism card) */}
                            {usageStats ? (
                                <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-xl p-2 px-3 border border-white/10 text-xs text-white relative z-10">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-yellow-300" />
                                        <span>{usageStats.remaining}/{usageStats.limit} Free Chats</span>
                                    </div>
                                    <span className="opacity-80">Resets {getResetTime()}</span>
                                </div>
                            ) : (
                                <div className="h-8 bg-white/10 rounded-xl animate-pulse relative z-10"></div>
                            )}
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scroll-smooth custom-scrollbar">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                        <Bot className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h4 className="text-gray-900 font-bold text-lg mb-2">How can I help you?</h4>
                                    <p className="text-sm text-gray-500 max-w-xs">
                                        I can help you find services, understand migration procedures, or suggest communities.
                                    </p>

                                    <div className="mt-6 space-y-2 w-full">
                                        {['Find improved housing options', 'How to apply for visa?', 'Connect with local communities'].map((suggestion, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setInput(suggestion)}
                                                className="w-full p-2.5 bg-white border border-gray-200 hover:border-green-300 hover:bg-green-50 text-sm text-gray-700 rounded-xl transition-all text-left"
                                            >
                                                "{suggestion}"
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-[slideUp_0.3s_ease-out]`}>
                                    <div className={`max-w-[85%] flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${msg.sender === 'user' ? 'bg-gray-200' : 'bg-green-100'
                                            }`}>
                                            {msg.sender === 'user' ? <User className="w-4 h-4 text-gray-600" /> : <Bot className="w-4 h-4 text-green-600" />}
                                        </div>

                                        <div className={`p-3.5 rounded-2xl text-sm shadow-sm ${msg.sender === 'user'
                                            ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-tr-none'
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
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
                                            <div className={`text-[10px] mt-1 flex justify-end opacity-70 ${msg.sender === 'user' ? 'text-gray-300' : 'text-gray-400'}`}>
                                                {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start animate-[fadeIn_0.3s_ease-out]">
                                    <div className="flex gap-2 max-w-[85%]">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                                            <Bot className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-1.5">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100 relative z-20">
                            {usageStats?.remaining === 0 ? (
                                <div className="text-center p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 animate-pulse">
                                    <p className="font-bold">Daily Limit Reached</p>
                                    <p className="text-xs mt-1 opacity-80">Chat resets at {getResetTime()}</p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition-all shadow-sm">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder="Ask specific questions..."
                                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400 px-2 min-w-0"
                                        disabled={loading || usageStats?.remaining === 0}
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim() || loading || usageStats?.remaining === 0}
                                        className={`p-2.5 rounded-xl transition-all duration-300 flex-shrink-0 ${input.trim() && !loading && (usageStats?.remaining === undefined || usageStats?.remaining > 0)
                                                ? 'bg-green-600 text-white shadow-lg shadow-green-200 hover:bg-green-700 hover:scale-105 active:scale-95'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AssistantChat;
