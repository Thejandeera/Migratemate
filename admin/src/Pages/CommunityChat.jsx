import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Loader, MessageSquare, MoreVertical, Users, Shield } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { getAuthData } from '../utils/auth';
import { motion, AnimatePresence } from 'framer-motion';

// Adjust if you have a central config
const API_BASE_URL = import.meta.env.VITE_API_URL;

const CommunityChat = () => {
    const { id: communityId } = useParams();
    const navigate = useNavigate();
    const [community, setCommunity] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const pollingInterval = useRef(null);
    const [sending, setSending] = useState(false);

    const adminData = getAuthData();

    useEffect(() => {
        fetchCommunityDetails();
        fetchMessages();

        // Polling
        pollingInterval.current = setInterval(fetchMessages, 3000);
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [communityId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchCommunityDetails = async () => {
        try {
            const token = adminData?.token;
            const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
            const response = await axios.get(`${API_BASE_URL}/communities/${communityId}`, config);
            if (response.data.success) {
                setCommunity(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching community details:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const token = adminData?.token;
            if (!token) return;
            const response = await axios.get(`${API_BASE_URL}/messages/community/${communityId}?size=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                const sorted = (response.data.data || []).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                setMessages(sorted);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const token = sessionStorage.getItem("token");
            const payload = {
                senderId: adminData.id,
                communityId: communityId,
                content: newMessage,
                type: 'TEXT'
            };

            await axios.post(`${API_BASE_URL}/messages`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            setNewMessage('');
            fetchMessages();
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message. Note: Admins might not have chat privileges yet.");
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50/30 font-sans">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center pt-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading chat...</p>
                </div>
            </div>
        );
    }

    if (!community) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50/30 font-sans">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center pt-20 px-4 text-center">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Community Not Found</h2>
                        <p className="text-gray-500 mb-6">The community you are trying to access does not exist or has been deleted.</p>
                        <button
                            onClick={() => navigate('/communities')}
                            className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-bold flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to Communities
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50/30 overflow-hidden">
            <Navbar />

            <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-8 flex flex-col h-screen">
                {/* Chat Container */}
                <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col relative h-full">

                    {/* Header */}
                    <div className="bg-white/80 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-20 sticky top-0">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/communities')}
                                className="p-2 -ml-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            <div className="relative">
                                <img
                                    src={community.coverImageUrl || "https://placehold.co/100x100"}
                                    alt={community.name}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>

                            <div>
                                <h1 className="font-bold text-gray-900 leading-tight">{community.name}</h1>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                    <Users size={12} />
                                    {community.memberCount} members
                                    <span className="mx-1 text-gray-300">•</span>
                                    {community.originCountry}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-100 flex items-center gap-1.5">
                                <Shield className="w-3 h-3" />
                                Admin Mode
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 scroll-smooth">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                    <MessageSquare className="w-10 h-10" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">No messages yet</h3>
                                <p className="text-gray-500 max-w-xs">Be the first to start the conversation in this community.</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = msg.senderId === adminData.id;
                                const isConsecutive = idx > 0 && messages[idx - 1].senderId === msg.senderId;

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} ${isConsecutive ? 'mt-1' : 'mt-4'}`}
                                    >
                                        {!isConsecutive && (
                                            <div className="flex-shrink-0 w-8">
                                                {!isMe && (
                                                    msg.senderAvatar ? (
                                                        <img
                                                            src={msg.senderAvatar}
                                                            alt={msg.senderName}
                                                            className="w-8 h-8 rounded-full shadow-sm object-cover ring-2 ring-white"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm">
                                                            {msg.senderName?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                        {isConsecutive && <div className="w-8" />}

                                        <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            {!isConsecutive && !isMe && (
                                                <span className="text-xs font-bold text-gray-500 ml-1 mb-1">{msg.senderName}</span>
                                            )}

                                            <div
                                                className={`px-5 py-3 text-sm leading-relaxed shadow-sm transition-all ${isMe
                                                        ? 'bg-gradient-to-br from-green-600 to-green-500 text-white rounded-2xl rounded-tr-none'
                                                        : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-none'
                                                    }`}
                                            >
                                                {msg.content}
                                            </div>

                                            <span className={`text-[10px] text-gray-400 mt-1 font-medium ${isMe ? 'mr-1' : 'ml-1'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </motion.div>
                                )
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100 z-20">
                        <form onSubmit={handleSendMessage} className="flex gap-3 items-end max-w-3xl mx-auto w-full">
                            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-3xl p-1.5 focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500 transition-all flex items-center shadow-inner">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message as Admin..."
                                    className="flex-1 bg-transparent border-0 px-4 py-2.5 focus:ring-0 text-gray-900 placeholder-gray-400"
                                    disabled={sending}
                                />
                                {sending && <Loader className="w-5 h-5 text-gray-400 animate-spin mr-3" />}
                            </div>
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className="bg-green-600 hover:bg-green-700 text-white p-3.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200 hover:shadow-xl active:scale-95 flex-shrink-0"
                            >
                                <Send className="w-5 h-5 ml-0.5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityChat;
