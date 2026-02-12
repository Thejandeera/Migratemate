import { getProviderBookings, updateBookingStatus } from '../../utils/bookingApi';

const BookingsManager = () => {
    const [activeTab, setActiveTab] = useState('Pending');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProviderBookings()
            .then(data => setBookings(data))
            .catch(err => console.error(err))
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
                ) : bookings.filter(b => b.status === activeTab.toUpperCase()).length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500 text-sm">No {activeTab.toLowerCase()} bookings found.</p>
                    </div>
                ) : (
                    bookings.filter(b => b.status === activeTab.toUpperCase()).map((booking) => (

                        <div key={booking.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                                        <img src={booking.customerAvatar} alt={booking.customerName} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-gray-900">{booking.customerName}</h4>
                                        </div>
                                        
                                        <div className="text-sm text-gray-600 mt-2 font-medium">
                                            {booking.serviceTitle}
                                        </div>
                                        <div className="text-xs text-gray-400 flex items-center gap-3 mt-1">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {new Date(booking.requestedDate).toLocaleDateString()}
                                            </span>
                                            <span className="font-bold text-gray-900">{booking.currency} {booking.totalAmount}</span>
                                        </div>
                                    </div>
                                </div>

                                <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1 ${booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                    {booking.status}
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
                                 <button 
                                    onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold transition shadow-sm flex items-center justify-center gap-2">
                                    Mark as Completed
                                </button>
                            )}

                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default BookingsManager;
