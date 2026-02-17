import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Users, MoreVertical, LogOut, Loader, Image as ImageIcon, MapPin } from 'lucide-react';
import { API_URL } from '../utils/api';
import { getAuthData, isAuthenticated } from '../utils/auth';
import Navbar from '../components/Navbar';
import { formatDistanceToNow } from 'date-fns';

const CommunityDetails = () => {
    const { id: communityId } = useParams();
    const navigate = useNavigate();
    const [community, setCommunity] = useState(null);
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [showMembers, setShowMembers] = useState(false); // Toggle for mobile/sidebar
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
        scrollToBottom();
    }, [messages]);

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
            // Assuming pagination exists but for now fetching default page
            const response = await fetch(`${API_URL}/messages/community/${communityId}?size=100`, {
                headers: { 'Authorization': `Bearer ${authData.token}` }
            });
            if (response.ok) {
                const json = await response.json();
                // Ensure unique messages if appending, or just replace for simple polling
                if (json.success) {
                    // Sort by timestamp if functionality requires
                    // data is usually sorted by backend, ensuring valid order here
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
                console.error("Failed to send message");
                setNewMessage(tempMsg); // Restore on failure
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setNewMessage(tempMsg);
        }
    };

    const handleLeaveCommunity = async () => {
        if (!window.confirm("Are you sure you want to leave this community?")) return;

        try {
            const authData = getAuthData();
            const response = await fetch(`${API_URL}/communities/${communityId}/leave/${authData.id || authData.userId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authData.token}` }
            });

            if (response.ok) {
                navigate('/community');
            } else {
                alert("Failed to leave community");
            }
        } catch (error) {
            console.error("Error leaving community:", error);
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
                    onClick={() => navigate('/community')}
                    className="text-green-600 hover:underline flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Communities
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden font-sans">
            <Navbar />

            {/* Main Content Area - constrained to be below navbar with padding-top to avoid overlap */}
            <div className="flex-1 flex pt-20 h-screen overflow-hidden">
                {/* Chat Area */}
                <div className={`flex-1 flex flex-col bg-white relative shadow-xl rounded-tl-2xl overflow-hidden transition-all duration-300 border-t border-l border-gray-200 ${showMembers ? 'mr-0 md:mr-80' : ''}`}>

                    {/* Chat Header */}
                    <div className="h-20 border-b border-gray-100 flex items-center justify-between px-6 bg-white/95 backdrop-blur-md z-10 sticky top-0 shadow-sm">
                        <div className="flex items-center gap-4">
                            {/* Back Button for everyone */}
                            <button
                                onClick={() => navigate('/community')}
                                className="flex items-center gap-2 text-gray-500 hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-all group"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="hidden sm:inline font-medium">Back</span>
                            </button>

                            <div className="relative group cursor-pointer flex items-center gap-3">
                                <div className="relative">
                                    <img
                                        src={community.coverImageUrl || "https://ui-avatars.com/api/?name=" + community.name}
                                        alt={community.name}
                                        className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-white group-hover:ring-green-100 transition-all"
                                    />
                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
                                </div>
                                <div className="hidden sm:block">
                                    <h2 className="font-bold text-gray-900 text-lg truncate max-w-[200px] sm:max-w-md">{community.name}</h2>
                                    <p className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full inline-block">
                                        {community.memberCount} members active
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowMembers(!showMembers)}
                                className={`p-2.5 rounded-full transition-all duration-200 ${showMembers ? 'bg-green-50 text-green-600' : 'text-gray-400 hover:bg-gray-100'}`}
                                title="Toggle Members"
                            >
                                <Users className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleLeaveCommunity}
                                className="hidden md:flex items-center gap-2 text-xs font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-full transition-all border border-red-100 hover:border-red-200"
                            >
                                <LogOut className="w-4 h-4" />
                                Leave
                            </button>
                        </div>
                    </div>

                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gray-50/50 scroll-smooth">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                                    <Send className="w-8 h-8 text-green-600 ml-1" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Welcome to {community.name}!</h3>
                                <p className="text-gray-500 max-w-xs">{community.description || "Start the conversation by sending a friendly message."}</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isMe = msg.senderId === (userData?.id || userData?.userId);
                                return (
                                    <div key={msg.id || index} className={`flex gap-4 group ${isMe ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                        <img
                                            src={msg.senderAvatar || `https://ui-avatars.com/api/?name=${msg.senderName || 'U'}`}
                                            alt={msg.senderName}
                                            className="w-10 h-10 rounded-full object-cover shadow-sm self-end mb-1 border-2 border-white"
                                        />
                                        <div className={`flex flex-col max-w-[75%] sm:max-w-[60%] ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-2 mb-1 px-1">
                                                {!isMe && <span className="text-xs font-bold text-gray-700">{msg.senderName}</span>}
                                                <span className="text-[10px] text-gray-400">
                                                    {msg.timestamp ? formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true }) : 'Just now'}
                                                </span>
                                            </div>
                                            <div
                                                className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${isMe
                                                    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-tr-none'
                                                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                                    }`}
                                            >
                                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 sm:p-5 bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-20">
                        <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-4xl mx-auto">
                            <button type="button" className="p-3 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-50 transition-all">
                                <ImageIcon className="w-6 h-6" />
                            </button>
                            <div className="flex-1 bg-gray-100 rounded-3xl flex items-center shadow-inner focus-within:ring-2 focus-within:ring-green-500/50 focus-within:bg-white transition-all">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 border-0 rounded-3xl px-6 py-4 focus:ring-0"
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="mr-2 p-2.5 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:scale-90 transition-all shadow-md transform active:scale-95"
                                >
                                    <Send className="w-5 h-5 ml-0.5" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar - Desktop Layout: Fixed width, Mobile: Slide over */}
                <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 pt-16
                    ${showMembers ? 'translate-x-0' : 'translate-x-full'} 
                    md:relative md:translate-x-0 md:shadow-none md:border-l md:border-gray-100 md:pt-0
                    ${!showMembers && 'md:hidden'} 
                `}>
                    <div className="h-full flex flex-col">
                        <div className="h-20 border-b border-gray-100 flex items-center justify-between px-6 bg-white">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Community Info</h3>
                                <p className="text-xs text-gray-500">View members & details</p>
                            </div>
                            <button onClick={() => setShowMembers(false)} className="md:hidden p-2 hover:bg-gray-100 rounded-full">
                                <ArrowLeft className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Community Details Block */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <h4 className="font-semibold text-gray-800 mb-2">About</h4>
                                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                    {community.description || "A safe space for migrants to connect and share experiences."}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {community.originCountry && <span className="text-xs font-medium bg-white px-2 py-1 rounded border border-gray-200 text-gray-600">From: {community.originCountry}</span>}
                                    {community.destinationCountry && <span className="text-xs font-medium bg-white px-2 py-1 rounded border border-gray-200 text-gray-600">To: {community.destinationCountry}</span>}
                                </div>
                            </div>

                            {/* Members List */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Members</h4>
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">{members.length}</span>
                                </div>
                                <div className="space-y-3">
                                    {members.map(member => (
                                        <div key={member.userId} className="flex items-center gap-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer">
                                            <div className="relative">
                                                <img
                                                    src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.fullName || 'User'}`}
                                                    alt={member.fullName}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-green-200 transition-all"
                                                />
                                                {/* Status dot placeholder */}
                                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-gray-300 border-2 border-white rounded-full"></span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {member.fullName || "Unknown User"}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {member.location || "Global"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Mobile Footer */}
                        <div className="p-6 border-t border-gray-100 md:hidden">
                            <button
                                onClick={handleLeaveCommunity}
                                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 py-3 rounded-xl transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Leave Community
                            </button>
                        </div>
                    </div>
                </div>

                {/* Overlay for mobile sidebar */}
                {showMembers && (
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
                        onClick={() => setShowMembers(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default CommunityDetails;
