import React from 'react';

const MyGigs = () => {
    const stats = [
        { label: 'Active Gigs', value: '2', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: 'bg-green-100 text-green-600' },
        { label: 'Total Views', value: '165', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', color: 'bg-yellow-100 text-yellow-600' },
        { label: 'Total Bookings', value: '31', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'bg-green-100 text-green-600' }, // using generic calendar icon
    ];

    const gigs = [
        {
            title: 'Sinhala to English Translation',
            image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            price: '20 AUD',
            unit: 'page',
            status: 'Active',
            views: 45,
            bookings: 8,
            location: 'Remote'
        },
        {
            title: 'Home-cooked Sri Lankan Meals',
            image: 'https://images.unsplash.com/photo-1626804475297-411d8c6601df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            price: '15 AUD',
            unit: 'meal',
            status: 'Active',
            views: 120,
            bookings: 23,
            location: 'Melbourne'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">My Service Listings</h3>
                    <p className="text-sm text-gray-500">Manage the services you offer to other migrants</p>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Create New Gig
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.color}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} /></svg>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                            <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                {gigs.map((gig, idx) => (
                    <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-48 h-32 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                                <img src={gig.image} alt={gig.title} className="w-full h-full object-cover" />
                            </div>

                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-gray-900 line-clamp-1">{gig.title}</h4>
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full tracking-wide">
                                                {gig.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mb-2">
                                            Services • {gig.location}
                                        </div>
                                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                            I can help translate documents from Sinhala to English. Quick turnaround.
                                        </p>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600 p-1">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                                    <div className="font-bold text-green-600 text-sm">
                                        {gig.price}<span className="text-gray-400 font-normal text-xs">/{gig.unit}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            {gig.views}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                            {gig.bookings} bookings
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyGigs;
