import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { AlertCircle, Phone, MapPin, User, Clock, CheckCircle, X } from 'lucide-react';
import { getUserData } from '../utils/auth';
import { API_URL } from '../utils/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom SOS marker icon
const sosIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// User location marker icon
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const SosPage = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [address, setAddress] = useState('');
    const [message, setMessage] = useState('');
    const [sosAlerts, setSosAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasActiveAlert, setHasActiveAlert] = useState(false);
    const [activeAlertId, setActiveAlertId] = useState(null);
    const [stompClient, setStompClient] = useState(null);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const userData = getUserData();

    // Initialize WebSocket connection
    useEffect(() => {
        const socket = new SockJS(`${API_URL.replace('/api', '')}/ws`);
        const client = Stomp.over(socket);

        client.connect({}, () => {
            console.log('✅ WebSocket Connected');

            // Subscribe to SOS alerts broadcast
            client.subscribe('/topic/sos-alerts', (message) => {
                const alert = JSON.parse(message.body);
                console.log('🚨 Received SOS Alert:', alert);

                // Update or add alert
                setSosAlerts(prev => {
                    const index = prev.findIndex(a => a.id === alert.id);
                    if (index !== -1) {
                        const updated = [...prev];
                        updated[index] = alert;
                        return updated;
                    }
                    return [alert, ...prev];
                });

                // Show toast notification for new alerts
                if (alert.status === 'ACTIVE' && alert.userId !== userData?.id) {
                    toast.error(`🚨 ${alert.userName} needs help!`, {
                        duration: 5000,
                        position: 'top-right',
                    });
                }
            });

            setStompClient(client);
        });

        return () => {
            if (client && client.connected) {
                client.disconnect();
            }
        };
    }, [userData?.id]);

    // Get user's current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    setUserLocation(location);

                    // Reverse geocode to get address
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}`
                        );
                        const data = await response.json();
                        setAddress(data.display_name);
                    } catch (error) {
                        console.error('Failed to get address:', error);
                        setAddress('Location detected');
                    }
                },
                (error) => {
                    console.error('Error getting location:', error);
                    toast.error('Please enable location services');
                }
            );
        }
    }, []);

    // Fetch active SOS alerts
    useEffect(() => {
        fetchActiveSosAlerts();
        checkUserActiveAlert();
    }, []);

    const fetchActiveSosAlerts = async () => {
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const response = await fetch(`${API_URL}/sos/active`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                setSosAlerts(result.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch SOS alerts:', error);
        }
    };

    const checkUserActiveAlert = async () => {
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const response = await fetch(`${API_URL}/sos/my-alerts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                const activeAlert = result.data?.find(alert => alert.status === 'ACTIVE');
                if (activeAlert) {
                    setHasActiveAlert(true);
                    setActiveAlertId(activeAlert.id);
                }
            }
        } catch (error) {
            console.error('Failed to check user alerts:', error);
        }
    };

    const handleSendSOS = async () => {
        if (!userLocation) {
            toast.error('Waiting for location...');
            return;
        }

        if (hasActiveAlert) {
            toast.error('You already have an active SOS alert');
            return;
        }

        setLoading(true);

        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const response = await fetch(`${API_URL}/sos/alert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    address: address,
                    message: message || 'I need help!'
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success('🚨 SOS Alert sent to all users!');
                setHasActiveAlert(true);
                setActiveAlertId(result.data.id);
                setMessage('');
                fetchActiveSosAlerts();
            } else {
                toast.error(result.message || 'Failed to send SOS');
            }
        } catch (error) {
            console.error('SOS Error:', error);
            toast.error('Failed to send SOS alert');
        } finally {
            setLoading(false);
        }
    };

    const handleResolveSOS = async () => {
        if (!activeAlertId) return;

        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const response = await fetch(`${API_URL}/sos/${activeAlertId}/resolve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success('✅ SOS Alert resolved');
                setHasActiveAlert(false);
                setActiveAlertId(null);
                fetchActiveSosAlerts();
            } else {
                toast.error(result.message || 'Failed to resolve SOS');
            }
        } catch (error) {
            console.error('Failed to resolve SOS:', error);
            toast.error('Failed to resolve SOS alert');
        }
    };

    const handleCancelSOS = async () => {
        if (!activeAlertId) return;

        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const response = await fetch(`${API_URL}/sos/${activeAlertId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success('❌ SOS Alert cancelled');
                setHasActiveAlert(false);
                setActiveAlertId(null);
                fetchActiveSosAlerts();
            } else {
                toast.error(result.message || 'Failed to cancel SOS');
            }
        } catch (error) {
            console.error('Failed to cancel SOS:', error);
            toast.error('Failed to cancel SOS alert');
        }
    };

    const handleRespondToSOS = async (sosId) => {
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const response = await fetch(`${API_URL}/sos/${sosId}/respond`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success('✅ You are now responding to this SOS!');
                fetchActiveSosAlerts();
            } else {
                toast.error(result.message || 'Failed to respond');
            }
        } catch (error) {
            console.error('Failed to respond to SOS:', error);
            toast.error('Failed to respond to SOS');
        }
    };

    const MapUpdater = ({ center }) => {
        const map = useMap();
        useEffect(() => {
            if (center) {
                map.setView(center, 13);
            }
        }, [center, map]);
        return null;
    };

    const getTimeSince = (timestamp) => {
        const now = new Date();
        const alertTime = new Date(timestamp);
        const diffMs = now - alertTime;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <AlertCircle className="w-12 h-12 text-red-600" />
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                            SOS Emergency
                        </h1>
                    </div>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Send emergency alerts to all nearby users or respond to help others in need
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* SOS Alert Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        {/* Send SOS Card */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-red-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                                Send SOS Alert
                            </h2>

                            {!hasActiveAlert ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Your Location
                                        </label>
                                        <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                            <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-gray-600">
                                                {address || 'Detecting location...'}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Message (Optional)
                                        </label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Describe your emergency..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                            rows="3"
                                        />
                                    </div>

                                    <button
                                        onClick={handleSendSOS}
                                        disabled={loading || !userLocation}
                                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:transform-none flex items-center justify-center gap-2"
                                    >
                                        <AlertCircle className="w-6 h-6" />
                                        {loading ? 'Sending...' : 'SEND SOS ALERT'}
                                    </button>

                                    <p className="text-xs text-gray-500 text-center">
                                        This will notify all users in your area
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
                                            <AlertCircle className="w-5 h-5 animate-pulse" />
                                            Active SOS Alert
                                        </div>
                                        <p className="text-sm text-red-600">
                                            Your emergency alert is active. Help is on the way!
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleResolveSOS}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Mark as Resolved
                                    </button>

                                    <button
                                        onClick={handleCancelSOS}
                                        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        <X className="w-5 h-5" />
                                        Cancel Alert
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Active Alerts List */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-between">
                                <span>Active SOS Alerts</span>
                                <span className="text-sm font-normal text-red-600 bg-red-100 px-3 py-1 rounded-full">
                                    {sosAlerts.length}
                                </span>
                            </h2>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {sosAlerts.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No active alerts</p>
                                ) : (
                                    sosAlerts.map((alert) => (
                                        <motion.div
                                            key={alert.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${selectedAlert?.id === alert.id
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-gray-200 hover:border-red-300'
                                                }`}
                                            onClick={() => setSelectedAlert(alert)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <img
                                                    src={alert.userAvatar || `https://ui-avatars.com/api/?name=${alert.userName}`}
                                                    alt={alert.userName}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-red-500"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 truncate">
                                                        {alert.userName}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 truncate">
                                                        {alert.address}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {getTimeSince(alert.createdAt)}
                                                        </span>
                                                        {alert.userPhone && (
                                                            <a
                                                                href={`tel:${alert.userPhone}`}
                                                                className="flex items-center gap-1 text-green-600 hover:text-green-700"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Phone className="w-3 h-3" />
                                                                Call
                                                            </a>
                                                        )}
                                                    </div>
                                                    {alert.userId !== userData?.id && !alert.helperId && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRespondToSOS(alert.id);
                                                            }}
                                                            className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-all"
                                                        >
                                                            Respond to Help
                                                        </button>
                                                    )}
                                                    {alert.helperName && (
                                                        <div className="mt-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                                            🆘 {alert.helperName} is responding
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Map */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className="h-[600px] lg:h-[calc(100vh-200px)]">
                            {userLocation ? (
                                <MapContainer
                                    center={[userLocation.latitude, userLocation.longitude]}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%' }}
                                    scrollWheelZoom={true}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    <MapUpdater center={selectedAlert ? [selectedAlert.latitude, selectedAlert.longitude] : null} />

                                    {/* User's location */}
                                    <Marker
                                        position={[userLocation.latitude, userLocation.longitude]}
                                        icon={userIcon}
                                    >
                                        <Popup>
                                            <div className="text-center">
                                                <User className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                                                <p className="font-semibold">Your Location</p>
                                                <p className="text-sm text-gray-600">{address}</p>
                                            </div>
                                        </Popup>
                                    </Marker>

                                    {/* SOS Alerts */}
                                    {sosAlerts.map((alert) => (
                                        <Marker
                                            key={alert.id}
                                            position={[alert.latitude, alert.longitude]}
                                            icon={sosIcon}
                                        >
                                            <Popup>
                                                <div className="min-w-[200px]">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <img
                                                            src={alert.userAvatar || `https://ui-avatars.com/api/?name=${alert.userName}`}
                                                            alt={alert.userName}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                        <div>
                                                            <p className="font-bold text-red-600">{alert.userName}</p>
                                                            <p className="text-xs text-gray-500">{getTimeSince(alert.createdAt)}</p>
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-gray-700 mb-2">{alert.message}</p>

                                                    <div className="text-xs text-gray-600 mb-3">
                                                        <MapPin className="w-3 h-3 inline mr-1" />
                                                        {alert.address}
                                                    </div>

                                                    {alert.userPhone && (
                                                        <a
                                                            href={`tel:${alert.userPhone}`}
                                                            className="block text-center bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all mb-2"
                                                        >
                                                            <Phone className="w-4 h-4 inline mr-1" />
                                                            Call {alert.userName}
                                                        </a>
                                                    )}

                                                    {alert.userId !== userData?.id && !alert.helperId && (
                                                        <button
                                                            onClick={() => handleRespondToSOS(alert.id)}
                                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all"
                                                        >
                                                            I'll Help
                                                        </button>
                                                    )}

                                                    {alert.helperName && (
                                                        <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded text-center">
                                                            🆘 {alert.helperName} is responding
                                                        </div>
                                                    )}
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center bg-gray-100">
                                    <div className="text-center">
                                        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-bounce" />
                                        <p className="text-gray-600 font-medium">Detecting your location...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SosPage;