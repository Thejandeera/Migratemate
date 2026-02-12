import React, { useState, useEffect } from 'react';
import { getMyBookings } from '../../utils/bookingApi';
import { Loader2 } from 'lucide-react';

const BookingHistory = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const data = await getMyBookings();
                setBookings(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching booking history:", err);
                setError("Failed to load booking history.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    // Calculate Stats
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
    const totalSpent = bookings
        .filter(b => b.status === 'COMPLETED')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    
    // Mock rating for now as backend doesn't return it yet
    const avgRating = 5.0; 

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
                <p className="text-red-600">{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
                >
                    Try Again
                </button>
            </div>
        );
    }

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
                        <div className="text-2xl font-bold text-gray-900">{completedBookings}</div>
                        <div className="text-xs text-gray-500 font-medium">Completed</div>
                    </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                        <span className="font-bold text-lg">$</span>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</div>
                        <div className="text-xs text-gray-500 font-medium">Total Spent</div>
                    </div>
                </div>
                {/* 
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{avgRating}</div>
                        <div className="text-xs text-gray-500 font-medium">Avg Rating Given</div>
                    </div>
                </div>
                */}
            </div>

            <div className="space-y-4">
                {bookings.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No bookings found.</p>
                    </div>
                ) : (
                    bookings.map((booking) => (
                        <div key={booking.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                        <img 
                                            src={booking.providerAvatar || `https://ui-avatars.com/api/?name=${booking.providerName}&background=random`} 
                                            alt={booking.providerName} 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{booking.serviceTitle}</h4>
                                        <div className="text-xs text-gray-500 mb-1">
                                            by <span className="text-gray-900 font-medium">{booking.providerName}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {new Date(booking.requestedDate).toLocaleDateString()}
                                            </span>
                                            <span className="font-bold text-gray-900">
                                                {booking.totalAmount} {booking.currency}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <span className={`
                                    text-[10px] uppercase font-bold px-2 py-1 rounded-full flex items-center gap-1
                                    ${booking.status === 'COMPLETED' ? 'bg-green-500 text-white' : 
                                      booking.status === 'PENDING' ? 'bg-yellow-500 text-white' :
                                      booking.status === 'ACCEPTED' ? 'bg-blue-500 text-white' :
                                      'bg-gray-500 text-white'}
                                `}>
                                    {booking.status}
                                </span>
                            </div>
                           
                           {/* Add Contact/Info if Accepted */}
                           {(booking.status === 'ACCEPTED' || booking.status === 'COMPLETED') && (
                                <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
                                     <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                         <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                         Provider Contact Details
                                     </h5>
                                     
                                     <div className="grid grid-cols-2 gap-3 mb-4">
                                         {booking.providerPhone ? (
                                             <>
                                                 <a href={`tel:${booking.providerPhone}`} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-700 border border-gray-200 hover:border-green-200 rounded-lg transition-all text-sm font-medium">
                                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                     Call
                                                 </a>
                                                 <a href={`https://wa.me/${booking.providerPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-700 border border-gray-200 hover:border-green-200 rounded-lg transition-all text-sm font-medium">
                                                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                                     WhatsApp
                                                 </a>
                                             </>
                                         ) : (
                                            <div className="col-span-2 text-center py-2 text-gray-400 text-sm border border-dashed rounded-lg">
                                                No phone number provided
                                            </div>
                                         )}

                                          {booking.providerEmail ? (
                                             <a href={`mailto:${booking.providerEmail}`} className="col-span-2 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-200 rounded-lg transition-all text-sm font-medium">
                                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                 Email Provider
                                             </a>
                                         ) : (
                                            <div className="col-span-2 text-center py-2 text-gray-400 text-sm border border-dashed rounded-lg">
                                                No email provided
                                            </div>
                                         )}
                                     </div>
                                </div>
                           )}

                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BookingHistory;
