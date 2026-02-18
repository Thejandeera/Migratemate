import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Users, MoreVertical, Loader2, Image as ImageIcon, MapPin, CheckCircle, Clock } from 'lucide-react';
import { API_URL } from '../utils/api';
import { getAuthData, isAuthenticated } from '../utils/auth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { formatDistanceToNow, isAfter, subMinutes } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

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

        pollingInterval.current = setInterval(fetchMessages, 3000);

        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [communityId]);

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
        setNewMessage('');

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
                fetchMessages();
                setTimeout(scrollToBottom, 100);
            } else {
                setNewMessage(tempMsg);
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
                <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
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
        <div className="min-h-screen bg-gray-50/50 font-sans flex flex-col">
            <Navbar />

            {/* Background Decoration */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-100/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            </div>

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
                {/* Back Link */}
                <button
                    onClick={() => navigate('/community')}
                    className="mb-6 flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors w-fit px-3 py-2 rounded-xl group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Communities
                </button>

                {/* Hero Header */}
                <div className="relative h-72 md:h-80 rounded-3xl overflow-hidden shadow-2xl mb-8 group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 z-10" />
                    <img
                        src={community.coverImageUrl || "https://via.placeholder.com/1200x400"}
                        alt={community.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end p-8 z-20">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> {community.originCountry} → {community.destinationCountry}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3 tracking-tight shadow-sm">{community.name}</h1>
                        <p className="text-gray-300 max-w-2xl text-lg line-clamp-2 md:line-clamp-none leading-relaxed opacity-90">{community.description}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Navigation */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 sticky top-24 z-20">
                            <button
                                onClick={() => setActiveTab('chat')}
                                className={`w-full text-left px-5 py-3.5 rounded-xl flex items-center gap-3 transition-all font-bold ${activeTab === 'chat'
                                    ? 'bg-green-50 text-green-700 shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Send className="w-5 h-5" />
                                Public Chat
                            </button>
                            <button
                                onClick={() => setActiveTab('members')}
                                className={`w-full text-left px-5 py-3.5 rounded-xl flex items-center gap-3 transition-all font-bold ${activeTab === 'members'
                                    ? 'bg-green-50 text-green-700 shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Users className="w-5 h-5" />
                                Members
                                <span className="ml-auto bg-gray-100 text-gray-500 text-xs py-1 px-2.5 rounded-full font-bold">{members.length}</span>
                            </button>
                        </div>

                        {/* Info Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hidden lg:block">
                            <h3 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">Community Info</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Total Members</span>
                                    <span className="font-bold text-gray-900">{members.length}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Online Now</span>
                                    <span className="font-bold text-green-600 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        {onlineMembers.length}
                                    </span>
                                </div>
                                <div className="border-t border-gray-100 pt-4 mt-2">
                                    <p className="text-xs text-center text-gray-400">Created in 2024</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            {activeTab === 'chat' ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 h-[650px] flex flex-col overflow-hidden"
                                >
                                    {/* Chat Header */}
                                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">General Channel</h3>
                                                <p className="text-xs text-green-600 font-medium">{onlineMembers.length} online now</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages Area */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                                        {messages.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                    <Send className="w-8 h-8 opacity-40" />
                                                </div>
                                                <p className="font-bold text-gray-500">No messages yet</p>
                                                <p className="text-sm mt-1">Be the first to say hello!</p>
                                            </div>
                                        ) : (
                                            messages.map((msg, idx) => {
                                                const isMe = msg.senderId === (userData?.id || userData?.userId);
                                                return (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        key={idx}
                                                        className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}
                                                    >
                                                        <img
                                                            src={msg.senderAvatar || `https://ui-avatars.com/api/?name=${msg.senderName}`}
                                                            alt={msg.senderName}
                                                            className="w-10 h-10 rounded-full shadow-sm object-cover border-2 border-white"
                                                        />
                                                        <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end flex flex-col' : ''}`}>
                                                            <div className="flex items-center gap-2 mb-1 px-1">
                                                                {!isMe && <span className="text-xs font-bold text-gray-700">{msg.senderName}</span>}
                                                                <span className="text-[10px] text-gray-400 font-medium">{formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}</span>
                                                            </div>
                                                            <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
                                                                    ? 'bg-gradient-to-br from-green-600 to-green-700 text-white rounded-tr-none'
                                                                    : 'bg-white border border-gray-100 rounded-tl-none text-gray-800'
                                                                }`}>
                                                                {msg.content}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input Area */}
                                    <div className="p-4 bg-white border-t border-gray-100">
                                        <form onSubmit={handleSendMessage} className="flex gap-3 items-center relative">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type your message..."
                                                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all outline-none font-medium placeholder-gray-400"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim()}
                                                className="absolute right-2 top-2 bottom-2 bg-green-600 hover:bg-green-700 text-white px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center group"
                                            >
                                                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </form>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    {/* Online Members */}
                                    {onlineMembers.length > 0 && (
                                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                                                Online Now <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{onlineMembers.length}</span>
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {onlineMembers.map(member => (
                                                    <div key={member.userId} className="flex items-center gap-4 p-4 hover:bg-green-50/50 rounded-2xl transition-all border border-gray-100 hover:border-green-200 group cursor-pointer">
                                                        <div className="relative">
                                                            <div className="absolute inset-0 bg-green-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                                            <img
                                                                src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.fullName}`}
                                                                alt={member.fullName}
                                                                className="w-12 h-12 rounded-full object-cover border-2 border-white relative z-10"
                                                            />
                                                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full z-20"></div>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 flex items-center gap-1 group-hover:text-green-700 transition-colors">
                                                                {member.fullName}
                                                                {member.isVerified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                                                            </h4>
                                                            <p className="text-xs text-gray-500 font-medium">{member.isHelper ? 'Community Helper' : 'Member'}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* All Members */}
                                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                                            All Members <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{members.length}</span>
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {offlineMembers.map(member => (
                                                <div key={member.userId} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100 group cursor-pointer opacity-80 hover:opacity-100">
                                                    <img
                                                        src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.fullName}`}
                                                        alt={member.fullName}
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 grayscale group-hover:grayscale-0 transition-all"
                                                    />
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 flex items-center gap-1">
                                                            {member.fullName}
                                                            {member.isVerified && <CheckCircle className="w-3.5 h-3.5 text-blue-500" />}
                                                        </h4>
                                                        <p className="text-xs text-gray-500 font-medium">{member.isHelper ? 'Community Helper' : 'Member'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CommunityDetails;
