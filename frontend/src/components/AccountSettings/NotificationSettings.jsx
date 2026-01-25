import React, { useState } from 'react';
import { Bell, MessageSquare, Star, Settings, Mail, Smartphone, Check, Trash2, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationSettings = () => {
    // Mock settings state
    const [preferences, setPreferences] = useState({
        bookingAlerts: true,
        messageAlerts: true,
        reviewAlerts: true,
        systemAlerts: true,
        emailNotifications: true,
        pushNotifications: false,
    });

    const togglePreference = (key) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Mock notification data (shared structure with Navbar ideally)
    const notifications = [
        {
            id: 1,
            title: 'New Booking Request',
            description: 'Amara Silva wants to book your translation service',
            type: 'booking',
            color: 'green',
            read: false,
            timestamp: new Date(Date.now() - 1000 * 60 * 10) // 10 mins ago
        },
        {
            id: 2,
            title: 'New Message',
            description: 'Ravi Kumar sent you a message about their order',
            type: 'message',
            color: 'green',
            read: false,
            timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
        },
        {
            id: 3,
            title: 'New Review',
            description: 'Lisa Wong left a 5-star review for your meal service',
            type: 'review',
            color: 'yellow',
            read: true,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
        },
        {
            id: 4,
            title: 'KYC Verified',
            description: 'Your identity verification has been approved!',
            type: 'system',
            color: 'gray',
            read: true,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
        },
        {
            id: 5,
            title: 'Booking Confirmed',
            description: 'John Smith accepted your airport pickup booking',
            type: 'booking',
            color: 'green',
            read: true,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48) // 2 days ago
        }
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'booking': return <Bell className="w-5 h-5 text-green-600" />;
            case 'message': return <MessageSquare className="w-5 h-5 text-green-600" />;
            case 'review': return <Star className="w-5 h-5 text-yellow-500" />;
            case 'system': return <Settings className="w-5 h-5 text-gray-500" />;
            default: return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'booking': return 'bg-green-100';
            case 'message': return 'bg-green-100';
            case 'review': return 'bg-yellow-100';
            case 'system': return 'bg-gray-100';
            default: return 'bg-gray-100';
        }
    };

    return (
        <div className="space-y-8">
            {/* Preferences Section */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
                    <p className="text-sm text-gray-500">Choose which notifications you want to receive</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded text-green-600">
                                <BoxIcon />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900">Booking Alerts</div>
                                <div className="text-xs text-gray-500">New bookings & updates</div>
                            </div>
                        </div>
                        <Switch checked={preferences.bookingAlerts} onChange={() => togglePreference('bookingAlerts')} />
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded text-green-600">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900">Message Alerts</div>
                                <div className="text-xs text-gray-500">New messages from users</div>
                            </div>
                        </div>
                        <Switch checked={preferences.messageAlerts} onChange={() => togglePreference('messageAlerts')} />
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-50 rounded text-yellow-600">
                                <Star className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900">Review Alerts</div>
                                <div className="text-xs text-gray-500">New reviews & ratings</div>
                            </div>
                        </div>
                        <Switch checked={preferences.reviewAlerts} onChange={() => togglePreference('reviewAlerts')} />
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 rounded text-gray-600">
                                <Settings className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900">System Alerts</div>
                                <div className="text-xs text-gray-500">Account & security updates</div>
                            </div>
                        </div>
                        <Switch checked={preferences.systemAlerts} onChange={() => togglePreference('systemAlerts')} />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Delivery Methods</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded shadow-sm text-gray-600">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Email Notifications</div>
                                    <div className="text-xs text-gray-500">Receive alerts via email</div>
                                </div>
                            </div>
                            <Switch checked={preferences.emailNotifications} onChange={() => togglePreference('emailNotifications')} />
                        </div>
                        <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded shadow-sm text-gray-600">
                                    <Smartphone className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Push Notifications</div>
                                    <div className="text-xs text-gray-500">Browser push alerts</div>
                                </div>
                            </div>
                            <Switch checked={preferences.pushNotifications} onChange={() => togglePreference('pushNotifications')} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification History */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">All Notifications</h3>
                        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">2 unread</span>
                    </div>
                    <div className="flex gap-2">
                        <button className="text-xs font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-gray-50 transition">
                            <CheckCheck className="w-3 h-3" />
                            Mark all read
                        </button>
                        <button className="text-xs font-semibold text-red-500 hover:text-red-600 border border-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-red-50 transition">
                            <Trash2 className="w-3 h-3" />
                            Clear all
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    {notifications.map((notif) => (
                        <div key={notif.id} className={`p-4 rounded-xl border transition-colors flex items-start justify-between gap-4 ${notif.read ? 'bg-white border-gray-100' : 'bg-green-50/30 border-green-100'}`}>
                            <div className="flex gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getBgColor(notif.type)}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h4 className={`text-sm font-semibold ${notif.read ? 'text-gray-900' : 'text-gray-900'}`}>{notif.title}</h4>
                                        {!notif.read && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
                                    </div>
                                    <p className="text-xs text-gray-600 mb-1">{notif.description}</p>
                                    <p className="text-[10px] text-gray-400">{formatDistanceToNow(notif.timestamp, { addSuffix: true })}</p>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-red-500 p-1">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Helper for switch toggle
const Switch = ({ checked, onChange }) => (
    <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${checked ? 'bg-green-500' : 'bg-gray-200'}`}
    >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

// Fallback icon
const BoxIcon = () => (
    <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

export default NotificationSettings;
