import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Users, MoreVertical, LogOut, Loader, Image as ImageIcon, MapPin, CheckCircle, Clock } from 'lucide-react';
import { API_URL } from '../utils/api';
import { getAuthData, isAuthenticated } from '../utils/auth';
import Navbar from '../components/Navbar';
import { formatDistanceToNow, isAfter, subMinutes } from 'date-fns';

const CommunityDetails = () => {
    const { id: communityId } = useParams();
    const navigate = useNavigate();
    const [community, setCommunity] = useState(null);
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'members'

    const messagesEndRef = useRef(null);
    const [userData, setUserData] = useState(null);
    const pollingInterval = useRef(null);

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        setUserData(getAuthData());
        fetchCommunityDetails();
        fetchMessages();
        fetchMembers();

        // Polling for new messages every 3 seconds
        pollingInterval.current = setInterval(fetchMessages, 3000);

        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [communityId]);

    useEffect(() => {
        if (activeTab === 'chat') {
            scrollToBottom();
        }
    }, [messages, activeTab]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchCommunityDetails = async () => {
        try {
            const authData = getAuthData();
            const response = await fetch(`${API_URL}/communities/${communityId}`, {
                headers: { 'Authorization': `Bearer ${authData.token}` }
            });
            if (response.ok) {
                const json = await response.json();
                if (json.success) setCommunity(json.data);
            }
        } catch (error) {
            console.error("Error fetching community details:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const authData = getAuthData();
            const response = await fetch(`${API_URL}/messages/community/${communityId}?size=100`, {
                headers: { 'Authorization': `Bearer ${authData.token}` }
            });
            if (response.ok) {
                const json = await response.json();
                if (json.success) {
                    const sorted = (json.data || []).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                    setMessages(sorted);
                }
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const fetchMembers = async () => {
        try {
            const authData = getAuthData();
            const response = await fetch(`${API_URL}/communities/${communityId}/members`, {
                headers: { 'Authorization': `Bearer ${authData.token}` }
            });
            if (response.ok) {
                const json = await response.json();
                if (json.success) setMembers(json.data.members || []);
            }
        } catch (error) {
            console.error("Error fetching members:", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const tempMsg = newMessage;
        setNewMessage(''); // Optimistic clear

        try {
            const authData = getAuthData();
            const payload = {
                senderId: authData.id || authData.userId,
                communityId: communityId,
                content: tempMsg,
                type: 'TEXT'
            };

            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authData.token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                fetchMessages(); // Refresh immediately
            } else {
                setNewMessage(tempMsg); // Restore on failure
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setNewMessage(tempMsg);
        }
    };

    const isUserOnline = (lastActiveAt) => {
        if (!lastActiveAt) return false;
        const fiveMinutesAgo = subMinutes(new Date(), 5);
        return isAfter(new Date(lastActiveAt), fiveMinutesAgo);
    };

    const onlineMembers = members.filter(m => isUserOnline(m.lastActiveAt));
    const offlineMembers = members.filter(m => !isUserOnline(m.lastActiveAt));

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
                    onClick={() => navigate('/community')}
                    className="text-green-600 hover:underline flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Communities
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-10">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/community')}
                    className="mb-6 flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors w-fit px-3 py-2 rounded-lg hover:bg-white/50"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Communities
                </button>

                {/* Hero Header */}
                <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-lg mb-8 group">
                    <img
                        src={community.coverImageUrl || "https://via.placeholder.com/1200x400"}
                        alt={community.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">
                                {community.originCountry} → {community.destinationCountry}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 shadow-sm">{community.name}</h1>
                        <p className="text-gray-200 max-w-2xl text-lg line-clamp-2 mb-4">{community.description}</p>
                        <div className="flex items-center gap-6 text-sm font-medium text-gray-300">
                            <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                <Users className="w-4 h-4" />
                                {community.memberCount} Members
                            </div>
                            <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                {onlineMembers.length} Online
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Left Column: Navigation/Tabs (Desktop) or Top Bar (Mobile) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 sticky top-24">
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all mb-1 ${activeTab === 'chat'
                                        ? 'bg-green-50 text-green-700 font-bold shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Send className="w-5 h-5" />
                                Public Chat
                            </button>
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'members'
                                        ? 'bg-green-50 text-green-700 font-bold shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Users className="w-5 h-5" />
                                Members
                                <span className="ml-auto bg-gray-100 text-gray-500 text-xs py-0.5 px-2 rounded-full">{members.length}</span>
                            </button>
                        </div>

                        {/* About Block */}
                        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-60 hidden lg:block">
                            <h3 className="font-bold text-gray-900 mb-4">About Community</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">{community.description}</p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <MapPin className="w-4 h-4" />
                                    <span>From: <span className="font-medium text-gray-900">{community.originCountry}</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                    <MapPin className="w-4 h-4" />
                                    <span>To: <span className="font-medium text-gray-900">{community.destinationCountry}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Content */}
                    <div className="lg:col-span-3">
                        {activeTab === 'chat' ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[600px] flex flex-col overflow-hidden">
                                {/* Chat Header */}
                                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="font-bold text-gray-700">Community Chat</span>
                                    </div>
                                    <span className="text-xs text-gray-400">Real-time</span>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                                    {messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                            <Send className="w-12 h-12 mb-2 opacity-20" />
                                            <p>No messages yet. Say hello!</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, idx) => {
                                            const isMe = msg.senderId === (userData?.id || userData?.userId);
                                            return (
                                                <div key={idx} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                    <img
                                                        src={msg.senderAvatar || `https://ui-avatars.com/api/?name=${msg.senderName}`}
                                                        alt={msg.senderName}
                                                        className="w-8 h-8 rounded-full shadow-sm mt-1"
                                                    />
                                                    <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end flex flex-col' : ''}`}>
                                                        <div className="flex items-center gap-2">
                                                            {!isMe && <span className="text-xs font-bold text-gray-700">{msg.senderName}</span>}
                                                            <span className="text-[10px] text-gray-400">{formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}</span>
                                                        </div>
                                                        <div className={`px-4 py-2 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 rounded-tl-none shadow-sm text-gray-800'
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

                                {/* Input */}
                                <div className="p-4 bg-white border-t border-gray-100">
                                    <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
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
                        ) : (
                            <div className="space-y-6">
                                {/* Online Members */}
                                {onlineMembers.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            Online <span className="text-green-500">●</span>
                                            <span className="text-gray-400 text-sm font-normal">({onlineMembers.length})</span>
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {onlineMembers.map(member => (
                                                <div key={member.userId} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 cursor-pointer">
                                                    <div className="relative">
                                                        <img
                                                            src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.fullName}`}
                                                            alt={member.fullName}
                                                            className="w-12 h-12 rounded-full object-cover"
                                                        />
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1">
                                                            {member.fullName}
                                                            {member.isVerified && <CheckCircle className="w-3 h-3 text-blue-500" />}
                                                        </h4>
                                                        <p className="text-xs text-gray-500">{member.isHelper ? 'Helper' : 'Member'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Offline Members */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        Offline <span className="text-gray-400">●</span>
                                        <span className="text-gray-400 text-sm font-normal">({offlineMembers.length})</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {offlineMembers.map(member => (
                                            <div key={member.userId} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100 cursor-pointer opacity-80 hover:opacity-100">
                                                <div className="relative">
                                                    <img
                                                        src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.fullName}`}
                                                        alt={member.fullName}
                                                        className="w-12 h-12 rounded-full object-cover grayscale"
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1">
                                                        {member.fullName}
                                                        {member.isVerified && <CheckCircle className="w-3 h-3 text-blue-500" />}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">{member.isHelper ? 'Helper' : 'Member'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityDetails;
