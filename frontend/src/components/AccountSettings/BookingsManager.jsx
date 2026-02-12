import React, { useState, useEffect } from 'react';
import { getProviderBookings, updateBookingStatus } from '../../utils/bookingApi';

const BookingsManager = () => {
    const [activeTab, setActiveTab] = useState('Pending');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProviderBookings()
            .then(data => setBookings(Array.isArray(data) ? data : []))
            .catch(err => {
                console.error(err);
                setBookings([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleStatusUpdate = async (bookingId, newStatus) => {
        try {
            const updatedBooking = await updateBookingStatus(bookingId, newStatus);
            setBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b));
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        }
    };


    const tabs = ['Pending', 'Active', 'Past'];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">Received Bookings</h3>
                <p className="text-sm text-gray-500">Manage bookings from customers who want your services</p>
            </div>

            <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors relative ${activeTab === tab
                                ? 'text-gray-900 bg-gray-100'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        {tab === 'Pending' && (
                            <span className="inline-flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {tab}
                                <span className="w-2 h-2 rounded-full bg-yellow-500 ml-1"></span>
                            </span>
                        )}
                        {tab === 'Active' && (
                            <span className="inline-flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                {tab}
                            </span>
                        )}
                        {tab === 'Past' && (
                            <span className="inline-flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {tab}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {loading ? (
                    <p className="text-center text-gray-500 py-8">Loading requests...</p>
                ) : bookings.filter(b => {
                        if (activeTab === 'Pending') return b?.status === 'PENDING';
                        if (activeTab === 'Active') return b?.status === 'ACCEPTED' || b?.status === 'IN_PROGRESS';
                        if (activeTab === 'Past') return b?.status === 'COMPLETED' || b?.status === 'CANCELLED' || b?.status === 'DECLINED';
                        return false;
                    }).length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500 text-sm">No {activeTab.toLowerCase()} bookings found.</p>
                    </div>
                ) : (
                    bookings.filter(b => {
                        if (activeTab === 'Pending') return b?.status === 'PENDING';
                        if (activeTab === 'Active') return b?.status === 'ACCEPTED' || b?.status === 'IN_PROGRESS';
                        if (activeTab === 'Past') return b?.status === 'COMPLETED' || b?.status === 'CANCELLED' || b?.status === 'DECLINED';
                        return false;
                    }).map((booking) => (

                        <div key={booking.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                        <img 
                                            src={booking.customerAvatar || `https://ui-avatars.com/api/?name=${booking.customerName || 'User'}&background=random`} 
                                            alt={booking.customerName || 'Customer'} 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-gray-900">{booking.customerName || 'Unknown Customer'}</h4>
                                        </div>
                                        
                                        <div className="text-sm text-gray-600 mt-2 font-medium">
                                            {booking.serviceTitle || 'Service'}
                                        </div>
                                        <div className="text-xs text-gray-400 flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {booking.requestedDate ? new Date(booking.requestedDate).toLocaleDateString() : 'Date N/A'}
                                            </span>
                                            <span className="font-bold text-gray-900">{booking.currency || 'AUD'} {booking.totalAmount || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1 ${booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                    {booking.status || 'UNKNOWN'}
                                </span>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600 italic border border-gray-100 flex gap-2">
                                <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                {booking.notes || "No notes provided."}
                            </div>


                            {booking.status === 'PENDING' && (
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => handleStatusUpdate(booking.id, 'ACCEPTED')}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm font-semibold transition shadow-sm flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                        Accept
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(booking.id, 'DECLINED')}
                                        className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        Decline
                                    </button>
                                </div>
                            )}
                            {booking.status === 'ACCEPTED' && (
                                 <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
                                     <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                         <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                         Customer Contact Details
                                     </h5>
                                     
                                     <div className="grid grid-cols-2 gap-3 mb-4">
                                         {booking.customerPhone ? (
                                             <>
                                                 <a href={`tel:${booking.customerPhone}`} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-700 border border-gray-200 hover:border-green-200 rounded-lg transition-all text-sm font-medium">
                                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                     Call
                                                 </a>
                                                 <a href={`https://wa.me/${booking.customerPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-700 border border-gray-200 hover:border-green-200 rounded-lg transition-all text-sm font-medium">
                                                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                                     WhatsApp
                                                 </a>
                                             </>
                                         ) : (
                                            <div className="col-span-2 text-center py-2 text-gray-400 text-sm border border-dashed rounded-lg">
                                                No phone number provided
                                            </div>
                                         )}

                                          {booking.customerEmail ? (
                                             <a href={`mailto:${booking.customerEmail}`} className="col-span-2 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-200 rounded-lg transition-all text-sm font-medium">
                                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                 Email Customer
                                             </a>
                                         ) : (
                                            <div className="col-span-2 text-center py-2 text-gray-400 text-sm border border-dashed rounded-lg">
                                                No email provided
                                            </div>
                                         )}
                                     </div>

                                     <button 
                                        onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition shadow-md flex items-center justify-center gap-2">
                                        Mark Job as Completed
                                    </button>
                                </div>
                            )}

                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BookingsManager;
