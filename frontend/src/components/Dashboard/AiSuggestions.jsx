import React, { useState, useEffect } from 'react';
import { API_URL } from '../../utils/api';
import { Sparkles, MapPin, ArrowRight, Loader2 } from 'lucide-react';

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
            <div className="bg-green-50/50 rounded-xl border border-green-100 p-6 flex flex-col items-center justify-center min-h-[200px]">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-3" />
                <p className="text-sm text-green-800 font-medium">AI is analyzing your profile...</p>
                <p className="text-xs text-green-600">Finding the best services for you</p>
            </div>
        );
    }

    if (error) {
        // Fallback or empty state
        return null;
    }

    if (suggestions.length === 0) {
        return (
            <div className="bg-green-50/50 rounded-xl border border-green-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-green-100 p-1.5 rounded-lg">
                        <Sparkles className="w-4 h-4 text-green-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">AI Suggestions</h2>
                </div>
                <p className="text-sm text-gray-500">No specific recommendations found. Explore all services!</p>
            </div>
        );
    }

    return (
        <div className="bg-green-50/50 rounded-xl border border-green-100 p-6">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <div className="bg-green-100 p-1.5 rounded-lg">
                        <Sparkles className="w-4 h-4 text-green-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">AI Suggestions for You</h2>
                </div>
                <p className="text-sm text-gray-500">Personalized recommendations based on your profile</p>
            </div>

            <div className="space-y-4">
                {suggestions.map((service) => (
                    <div key={service.id || service._id} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 bg-green-50 p-2.5 rounded-lg text-green-600 group-hover:bg-green-100 transition-colors">
                                {/* Use a generic icon or service-specific one if available */}
                                {service.pricingType === 'FIXED' ? (
                                    <span className="font-bold text-xs">{service.currency}</span>
                                ) : (
                                    <Sparkles className="w-5 h-5" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{service.title}</h3>
                                    {service.score > 5 && (
                                        <span className="text-[10px] font-medium px-1.5 py-0.5 bg-green-100 text-green-700 rounded border border-green-200 uppercase tracking-wide whitespace-nowrap">
                                            Best Match
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm text-gray-600 mb-2 leading-relaxed line-clamp-2">{service.description}</p>

                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                                    {/* <MapPin className="w-3 h-3" /> */}
                                    {/* <span>{service.destination}</span> */}
                                    <span className="bg-gray-50 px-2 py-0.5 rounded text-gray-500 border border-gray-100">
                                        {service.matchReason}
                                    </span>
                                </div>

                                <button className="text-xs font-semibold text-green-700 flex items-center gap-1 hover:underline group-hover:translate-x-1 transition-transform">
                                    View Details
                                    <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full text-center text-xs text-gray-500 mt-4 hover:text-green-700 flex items-center justify-center gap-1 transition-colors">
                View all suggestions
                <ArrowRight className="w-3 h-3" />
            </button>
        </div>
    );
};

export default AiSuggestions;
