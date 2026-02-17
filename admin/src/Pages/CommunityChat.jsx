import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Loader, MessageSquare } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { getAuthData } from '../utils/auth';

// Adjust if you have a central config
const API_BASE_URL = "http://localhost:8080/api";

const CommunityChat = () => {
    const { id: communityId } = useParams();
    const navigate = useNavigate();
    const [community, setCommunity] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const pollingInterval = useRef(null);

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
            // Even if token is missing, we try, but usually it's needed.
            // If the backend requires auth for GET /communities/:id (which it does via getCurrentUserEmail), we must send it.

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
        if (!newMessage.trim()) return;

        // Admin sending a message
        // CAUTION: Backend might expect a valid 'senderId' that exists in the 'User' table.
        // If admins are in a separate table, this might fail unless backend handles it.
        // We will try sending the admin's ID. If it fails, we might need a workaround or backend change.

        try {
            const token = sessionStorage.getItem("token");
            // Assuming admin.id is compatible or we use a sophisticated logic
            // For now, let's try to send simple text

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
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <Loader className="w-8 h-8 text-green-600 animate-spin" />
            </div>
        );
    }

    if (!community) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <p className="text-gray-500 mb-4">Community not found.</p>
                <button
                    onClick={() => navigate('/communities')}
                    className="text-green-600 hover:underline flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Communities
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/communities')}
                    className="mb-6 flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors w-fit px-3 py-2 rounded-lg hover:bg-white/50"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Communities
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[70vh] overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                                <img
                                    src={community.coverImageUrl || "https://placehold.co/100x100"}
                                    alt={community.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900">{community.name}</h2>
                                <p className="text-xs text-gray-500">{community.memberCount} members</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-green-100/50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Admin View
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                                <p>No messages in this community yet.</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = msg.senderId === adminData.id;
                                return (
                                    <div key={idx} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                        <div className="flex-shrink-0">
                                            {msg.senderAvatar ? (
                                                <img
                                                    src={msg.senderAvatar}
                                                    alt={msg.senderName}
                                                    className="w-8 h-8 rounded-full shadow-sm mt-1 object-cover"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold mt-1">
                                                    {msg.senderName?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end flex flex-col' : ''}`}>
                                            <div className="flex items-center gap-2">
                                                {!isMe && <span className="text-xs font-bold text-gray-700">{msg.senderName}</span>}
                                                <span className="text-[10px] text-gray-400">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className={`px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
                                                ? 'bg-green-600 text-white rounded-tr-none'
                                                : 'bg-white border border-gray-100 rounded-tl-none text-gray-800'
                                                }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message as Admin..."
                                className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:bg-white transition-all outline-none"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityChat;
