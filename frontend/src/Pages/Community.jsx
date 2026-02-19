import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Users, MapPin, ArrowRight, Loader2, Filter, Globe, MessageCircle } from 'lucide-react';
import { API_URL } from '../utils/api';
import { getAuthData, isAuthenticated } from '../utils/auth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';

const CommunityCard = ({ community, onJoin, isJoined }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            className="bg-white rounded-[2rem] premium-shadow hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-500 overflow-hidden flex flex-col h-full group"
        >
            <div className="h-64 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <img
                    src={community.coverImageUrl || community.image || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"}
                    alt={community.name}
                    className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                />
                <div className="absolute bottom-6 left-6 z-20 w-full pr-6">
                    <h3 className="text-3xl font-bold text-white leading-tight mb-3 drop-shadow-md">{community.name}</h3>
                    <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                        <span className="flex items-center gap-2 bg-white/20 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
                            {community.originCountry} <ArrowRight className="w-3.5 h-3.5 text-white/70" /> {community.destinationCountry}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-8 flex flex-col flex-grow">
                <p className="text-gray-500 text-base mb-8 line-clamp-3 leading-relaxed flex-grow font-normal">
                    {community.description || "Join this community to connect with like-minded people, share experiences, and support each other."}
                </p>

                <div className="pt-6 border-t border-gray-50 mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold bg-gray-50/80 px-4 py-2 rounded-full border border-gray-100">
                        <Users className="w-4 h-4" />
                        {community.memberCount || 0} members
                    </div>

                    {isJoined ? (
                        <Link
                            to={`/community/${community.id}`}
                            className="bg-neural-dark hover:bg-black text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            Open <MessageCircle className="w-4 h-4" />
                        </Link>
                    ) : (
                        <button
                            onClick={() => onJoin(community.id)}
                            className="bg-deep-green hover:bg-green-900 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-green-900/20 hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                        >
                            Join <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const Community = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('browse');
    const [communities, setCommunities] = useState([]);
    const [myCommunities, setMyCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const checkAuth = () => {
            if (isAuthenticated()) {
                const user = getAuthData();
                setUserData(user);
            }
        };
        checkAuth();
        fetchCommunities();
    }, []);

    useEffect(() => {
        if (userData?.id && activeTab === 'my') {
            fetchMyCommunities();
        }
    }, [activeTab, userData]);

    const fetchCommunities = async () => {
        setLoading(true);
        try {
            const authData = getAuthData();
            const headers = authData?.token ? { 'Authorization': `Bearer ${authData.token}` } : {};
            const response = await fetch(`${API_URL}/communities`, { headers });
            if (response.ok) {
                const json = await response.json();
                if (json.success) setCommunities(json.data || []);
            }
        } catch (error) {
            console.error("Error fetching communities:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyCommunities = async () => {
        if (!userData?.id) return;
        setLoading(true);
        try {
            const authData = getAuthData();
            const headers = authData?.token ? { 'Authorization': `Bearer ${authData.token}` } : {};
            const response = await fetch(`${API_URL}/communities/user/${userData.id}`, { headers });
            if (response.ok) {
                const json = await response.json();
                if (json.success) setMyCommunities(json.data || []);
            }
        } catch (error) {
            console.error("Error fetching my communities:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleJoin = async (communityId) => {
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        try {
            const authData = getAuthData();
            const headers = { 'Authorization': `Bearer ${authData.token}` };
            const response = await fetch(`${API_URL}/communities/${communityId}/join/${authData.id}`, {
                method: 'POST',
                headers
            });

            if (response.ok) {
                setCommunities(prev => prev.map(c =>
                    c.id === communityId ? { ...c, isJoined: true } : c
                ));
                await fetchMyCommunities();
                if (window.confirm("Successfully joined! Go to community now?")) {
                    navigate(`/community/${communityId}`);
                }
            } else {
                const json = await response.json();
                alert(json.message || "Failed to join");
            }
        } catch (error) {
            console.error("Error joining community:", error);
            alert("Error joining community");
        }
    };

    const filteredCommunities = (activeTab === 'browse' ? communities : myCommunities).filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.originCountry && c.originCountry.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.destinationCountry && c.destinationCountry.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans relative">
            <Navbar />

            {/* Background Decoration */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <main className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header */}
            <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                 {/* Dynamic Background Mesh */}
                 <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
                     <div className="absolute -bottom-32 right-1/3 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000"></div>
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                     <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/60 backdrop-blur-md border border-white/40 rounded-full text-deep-green text-xs font-bold uppercase tracking-wider mb-8 shadow-sm"
                    >
                        <Globe className="w-3.5 h-3.5" />
                        Global Network
                    </motion.div>
                    <h1 className="text-6xl md:text-7xl font-bold text-neural-dark mb-8 tracking-tight leading-tight">
                        Find Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-deep-green via-emerald-800 to-deep-green">
                            Community.
                        </span>
                    </h1>
                    <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
                        Connect with fellow migrants from your home country, share experiences, and build your new support network.
                    </p>
                </div>
            </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    <div className="bg-white p-8 rounded-[2rem] premium-shadow hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] border-none flex items-center justify-between group transition-all duration-500 hover:-translate-y-1">
                        <div>
                            <p className="text-5xl font-bold text-neural-dark group-hover:text-deep-green transition-colors tracking-tighter">{communities.length}</p>
                            <p className="text-base font-medium text-gray-500 mt-2">Active Communities</p>
                        </div>
                        <div className="bg-green-50/50 p-4 rounded-2xl group-hover:bg-deep-green group-hover:text-white transition-all duration-500">
                            <Globe className="w-8 h-8 text-deep-green group-hover:text-white transition-colors" />
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] premium-shadow hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] border-none flex items-center justify-between group transition-all duration-500 hover:-translate-y-1">
                        <div>
                            <p className="text-5xl font-bold text-neural-dark group-hover:text-deep-green transition-colors tracking-tighter">{communities.reduce((acc, curr) => acc + (curr.memberCount || 0), 0).toLocaleString()}+</p>
                            <p className="text-base font-medium text-gray-500 mt-2">Global Members</p>
                        </div>
                        <div className="bg-green-50/50 p-4 rounded-2xl group-hover:bg-deep-green group-hover:text-white transition-all duration-500">
                            <Users className="w-8 h-8 text-deep-green group-hover:text-white transition-colors" />
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-[2rem] premium-shadow hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] border-none flex items-center justify-between group transition-all duration-500 hover:-translate-y-1">
                        <div>
                            <p className="text-5xl font-bold text-neural-dark group-hover:text-deep-green transition-colors tracking-tighter">150+</p>
                            <p className="text-base font-medium text-gray-500 mt-2">Countries Covered</p>
                        </div>
                        <div className="bg-green-50/50 p-4 rounded-2xl group-hover:bg-deep-green group-hover:text-white transition-all duration-500">
                            <ArrowRight className="w-8 h-8 text-deep-green group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex">
                        <button
                            onClick={() => setActiveTab('browse')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'browse' ? 'bg-green-50 text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Explore All
                        </button>
                        <button
                            onClick={() => setActiveTab('my')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'my' ? 'bg-green-50 text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            My Communities
                        </button>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by country or name..."
                            className="bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 block w-full pl-11 p-3 shadow-sm transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Finding communities...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCommunities.length > 0 ? (
                            filteredCommunities.map(community => (
                                <CommunityCard
                                    key={community.id}
                                    community={community}
                                    onJoin={handleJoin}
                                    isJoined={activeTab === 'my' || myCommunities.some(my => my.id === community.id)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full py-24 text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                                    <Globe className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No communities found</h3>
                                <p className="text-gray-500 max-w-md mx-auto mb-8">We couldn't find any communities matching your search. Try looking for a different country.</p>

                                <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto shadow-sm">
                                    <h4 className="font-bold text-gray-900 text-lg mb-2">Don't see your community?</h4>
                                    <p className="text-gray-600 mb-6">Request a new community for your origin and destination countries.</p>
                                    <a
                                        href="mailto:support@migratemate.com?subject=New Community Request"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                                    >
                                        Request Community <ArrowRight className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Community;
