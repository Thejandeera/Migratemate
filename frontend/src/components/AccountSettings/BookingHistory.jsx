import React from 'react';

const BookingHistory = () => {
    const history = [
        {
            id: 1,
            service: 'Safe Airport Pickup - Sydney',
            helper: 'John Smith',
            helperAvatar: 'https://ui-avatars.com/api/?name=John+Smith&background=random',
            date: '2024-01-10',
            amount: '50 AUD',
            status: 'Completed',
            review: {
                rating: 5,
                comment: "John was incredibly helpful and punctual. Made my arrival so smooth!"
            }
        },
        {
            id: 2,
            service: 'Document Translation Services',
            helper: 'Priya Kumar',
            helperAvatar: 'https://ui-avatars.com/api/?name=Priya+Kumar&background=random',
            date: '2024-01-05',
            amount: '75 AUD',
            status: 'Completed',
            review: {
                rating: 5,
                comment: "Professional and accurate translation. Highly recommended!"
            }
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">My Booking History</h3>
                <p className="text-sm text-gray-500">Services you've booked from other helpers</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">2</div>
                        <div className="text-xs text-gray-500 font-medium">Completed</div>
                    </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                        <span className="font-bold text-lg">$</span>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">$125</div>
                        <div className="text-xs text-gray-500 font-medium">Total Spent</div>
                    </div>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">5.0</div>
                        <div className="text-xs text-gray-500 font-medium">Avg Rating Given</div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {history.map((booking) => (
                    <div key={booking.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                    <img src={booking.helperAvatar} alt={booking.helper} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{booking.service}</h4>
                                    <div className="text-xs text-gray-500 mb-1">
                                        by <span className="text-gray-900 font-medium">{booking.helper}</span> • <span className="text-green-600 hover:underline cursor-pointer flex-inline items-center gap-0.5"><svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg> View Profile</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            {booking.date}
                                        </span>
                                        <span className="font-bold text-gray-900">{booking.amount}</span>
                                    </div>
                                </div>
                            </div>
                            <span className="bg-green-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {booking.status}
                            </span>
                        </div>

                        {booking.review && (
                            <div className="bg-yellow-50/50 rounded-lg p-3 border border-yellow-100 mt-4">
                                <div className="flex items-center gap-1 text-yellow-500 mb-1">
                                    <span className="text-xs font-semibold text-gray-900 mr-2">Your Review:</span>
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className={`w-3 h-3 ${i < booking.review.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-700 italic">"{booking.review.comment}"</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookingHistory;
