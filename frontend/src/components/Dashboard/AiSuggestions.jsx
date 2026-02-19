import React, { useState, useEffect } from 'react';
import { API_URL } from '../../utils/api';
import { Sparkles, MapPin, ArrowRight, Loader2, Star } from 'lucide-react';
import Card from '../ui/Card';

const AiSuggestions = ({ user }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAndRankServices = async () => {
            try {
                setLoading(true);
                // Fetch all services
                const response = await fetch(`${API_URL}/services`);

                if (!response.ok) {
                    throw new Error('Failed to fetch services');
                }

                const data = await response.json();
                const allServices = data.data || [];

                // AI / Recommendation Logic (Heuristic)
                const scoredServices = allServices.map(service => {
                    let score = 0;
                    let matchReason = "Popular service";

                    // 1. Destination Match (Highest Priority)
                    if (user.destinationCountry && service.destination &&
                        (service.destination.toLowerCase().includes(user.destinationCountry.toLowerCase()) ||
                            user.destinationCountry.toLowerCase().includes(service.destination.toLowerCase()))) {
                        score += 10;
                        matchReason = `Recommended for ${user.destinationCountry}`;
                    }

                    // 2. Origin Match
                    if (user.countryOfOrigin && service.origin &&
                        (service.origin.toLowerCase().includes(user.countryOfOrigin.toLowerCase()) ||
                            user.countryOfOrigin.toLowerCase().includes(service.origin.toLowerCase()))) {
                        score += 5;
                        matchReason = `Special for travelers from ${user.countryOfOrigin}`;
                    }

                    // 3. Category/Interest Match (Placeholder if user has interests)
                    // If user.bio contains keywords like "student", "housing", "transport"
                    if (user.bio) {
                        const bioLower = user.bio.toLowerCase();
                        if (bioLower.includes("student") && service.title.toLowerCase().includes("student")) {
                            score += 3;
                            matchReason = "Matches your student profile";
                        }
                    }

                    // 4. Default boost for "featured" or highly rated services
                    if (service.averageRating > 4.5) {
                        score += 1;
                    }

                    return { ...service, score, matchReason };
                });

                // Filter out services with 0 score if we have enough matches, otherwise keep them
                // Sort by score descending
                const ranked = scoredServices.sort((a, b) => b.score - a.score);

                // Take top 3
                setSuggestions(ranked.slice(0, 3));
                setLoading(false);

            } catch (err) {
                console.error("Error fetching suggestions:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        if (user) {
            fetchAndRankServices();
        }
    }, [user]);

    if (loading) {
        return (
            <Card className="min-h-[200px] flex flex-col items-center justify-center p-8 border-none bg-white/60">
                <Loader2 className="w-10 h-10 text-deep-green animate-spin mb-4" />
                <p className="text-sm text-neural-dark font-semibold">AI is analyzing your profile...</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">Finding the best services for you</p>
            </Card>
        );
    }

    if (error) {
        return null;
    }

    if (suggestions.length === 0) {
        return (
            <Card className="p-6 border-none bg-white/60">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-neural-bg p-2 rounded-xl text-[#1a3a1d]">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-neural-dark">AI Suggestions</h2>
                </div>
                <p className="text-sm text-gray-500 font-medium">No specific recommendations found. Explore all services!</p>
            </Card>
        );
    }

    return (
        <Card className="p-8 border-none bg-white/60">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-5 h-5 text-[#1a3a1d]" />
                        <h2 className="text-lg font-semibold text-neural-dark">AI Suggestions</h2>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Personalized for you</p>
                </div>
                <span className="text-[10px] bg-[#1a3a1d] text-white px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                    Beta
                </span>
            </div>

            <div className="space-y-4">
                {suggestions.map((service, idx) => (
                    <div
                        key={service.id || service._id}
                        className="bg-white rounded-2xl p-5 border border-white/60 shadow-sm hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="mt-1 bg-neural-bg p-3 rounded-xl text-[#1a3a1d] group-hover:bg-[#1a3a1d] group-hover:text-white transition-colors duration-300">
                                {service.pricingType === 'FIXED' ? (
                                    <span className="font-semibold text-xs">{service.currency}</span>
                                ) : (
                                    <Star className="w-5 h-5 fill-current" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-neural-dark text-sm truncate pr-2">{service.title}</h3>
                                    {service.score > 5 && (
                                        <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 bg-[#1a3a1d]/10 text-deep-green rounded-full uppercase tracking-wide">
                                            Top Pick
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-2">{service.description}</p>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className="bg-gray-50 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 border border-gray-100 line-clamp-1 max-w-[70%]">
                                        {service.matchReason}
                                    </span>
                                    
                                    <button className="text-xs font-semibold text-[#1a3a1d] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        View
                                        <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full text-center text-xs font-semibold text-gray-400 mt-6 hover:text-[#1a3a1d] flex items-center justify-center gap-1 transition-colors uppercase tracking-wide transition-all">
                View all suggestions
                <ArrowRight className="w-3 h-3" />
            </button>
        </Card>
    );
};

export default AiSuggestions;
