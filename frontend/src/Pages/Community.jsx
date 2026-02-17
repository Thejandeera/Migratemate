import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Users, MapPin, ArrowRight, Loader, Filter } from 'lucide-react';
import { API_URL } from '../utils/api';
import { getAuthData, isAuthenticated } from '../utils/auth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Mock data for fallback/development if backend is empty
const MOCK_COMMUNITIES = [
    {
        id: '1',
        name: 'Sri Lankans in Australia',
        originCountry: 'Sri Lanka',
        destinationCountry: 'Australia',
        description: 'Connect with Sri Lankan migrants in Australia. Share tips, find housing, and build friendships.',
        memberCount: 2450,
        isJoined: false,
        image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80'
    },
    {
        id: '2',
        name: 'Indian Techies in Silicon Valley',
        originCountry: 'India',
        destinationCountry: 'USA',
        description: 'A community for Indian tech professionals working in the Bay Area.',
        memberCount: 1200,
        isJoined: true,
        image: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80'
    },
    {
        id: '3',
        name: 'British Expats in Spain',
        originCountry: 'UK',
        destinationCountry: 'Spain',
        description: 'Enjoy the sun and connect with fellow Brits living in Spain.',
        memberCount: 850,
        isJoined: false,
        image: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80'
    }
];

const CommunityCard = ({ community, onJoin, isJoined }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
            <div className="h-40 bg-gray-200 relative">
                <img
                    src={community.coverImageUrl || community.image || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"}
                    alt={community.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1" title={community.name}>{community.name}</h3>
                </div>

                <div className="flex items-center gap-2 mb-3 text-xs font-medium text-gray-500">
                    {community.destinationCountry && (
                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                            {community.destinationCountry}
                        </span>
                    )}
                    {community.originCountry && (
                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                            From {community.originCountry}
                        </span>
                    )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                    {community.description || "Join this community to connect with like-minded people."}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                    <div className="flex items-center text-gray-500 text-xs">
                        <Users className="w-4 h-4 mr-1" />
                        {community.memberCount || 0} members
                    </div>
                    {isJoined ? (
                        <Link
                            to={`/community/${community.id}`}
                            className="text-sm font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors"
                        >
                            Open
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <button
                            onClick={() => onJoin(community.id)}
                            className="text-sm font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors"
                        >
                            Join
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const Community = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'my'
    const [communities, setCommunities] = useState([]);
    const [myCommunities, setMyCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const checkAuth = () => {
            if (!isAuthenticated()) {
                // navigate('/login'); // Optional: redirect if not logged in
                // For browsing, maybe we allow it? But joining requires auth.
            } else {
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
                if (json.success) {
                    setCommunities(json.data || []);
                }
            } else {
                // Fallback for demo if API fails/is empty
                console.warn("API request failed, check backend.");
                // setCommunities(MOCK_COMMUNITIES); 
            }
        } catch (error) {
            console.error("Error fetching communities:", error);
            // setCommunities(MOCK_COMMUNITIES);
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
                if (json.success) {
                    setMyCommunities(json.data || []);
                }
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
                // Optimistically update UI
                setCommunities(prev => prev.map(c =>
                    c.id === communityId ? { ...c, isJoined: true } : c
                ));

                // Force refresh of my communities even if tab isn't active yet
                await fetchMyCommunities();

                // Optional: Ask user if they want to go to the community or stay
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

    // Determine if a community is joined (simple check for Browse tab)
    // NOTE: The GET /communities API might not return 'isJoined' status for the user. 
    // We might need to cross-reference with 'myCommunities' if we fetched them, 
    // or relying on backend to provide that flag. 
    // For now, in 'Browse', we just show 'Join'.
    // If the user attempts to join an already joined community, backend should handle it gracefully or we check locally.

    return (<>
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />

            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2 flex items-center gap-2">
                            <span className="bg-green-100 p-2 rounded-lg text-green-600">
                                <MapPin className="w-6 h-6" />
                            </span>
                            Communities
                        </h1>
                        <p className="text-gray-500 text-lg">
                            Join migrant communities around the world. Connect, chat, and support each other.
                        </p>
                    </div>
                </div>

                {/* Request Community Placeholder */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 rounded-xl p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Don't see your community?</h3>
                        <p className="text-gray-600">
                            We are constantly adding new communities. If you don't see yours, request one and we'll set it up!
                        </p>
                    </div>
                    <a
                        href="mailto:support@migratemate.com?subject=New Community Request"
                        className="whitespace-nowrap px-6 py-3 bg-white text-green-600 font-semibold rounded-lg shadow-sm border border-green-200 hover:bg-green-50 transition-colors flex items-center gap-2"
                    >
                        Request a Community
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </div>

                {/* Stats / Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-green-600">{communities.length}</p>
                            <p className="text-sm text-gray-500 font-medium">Total Communities</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-full text-green-600">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-green-600">{communities.reduce((acc, curr) => acc + (curr.memberCount || 0), 0)}</p>
                            <p className="text-sm text-gray-500 font-medium">Total Members</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-full text-green-600">
                            <Users className="w-6 h-6 transform translate-x-1" />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-green-600">{Math.floor(Math.random() * 200) + 100}</p>
                            <p className="text-sm text-gray-500 font-medium">Currently Online</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-full text-green-600">
                            <div className="w-6 h-6 flex items-center justify-center">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-6 border-b border-gray-200 mb-8">
                    <button
                        onClick={() => setActiveTab('browse')}
                        className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'browse' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Marketplace (All)
                        {activeTab === 'browse' && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 rounded-t-full"></span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('my')}
                        className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === 'my' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        My Community
                        {activeTab === 'my' && (
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 rounded-t-full"></span>
                        )}
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search communities by country..."
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full pl-10 p-2.5 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader className="w-8 h-8 text-green-600 animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            <div className="col-span-full py-20 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-medium text-gray-900">No communities found</h3>
                                <p className="text-sm">Try adjusting your search terms or look for other countries.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
        <Footer />
    </>
    );
};

export default Community;
