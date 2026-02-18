import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { AlertCircle, Phone, MapPin, User, Clock, CheckCircle, X, Navigation, Shield, Radio, Locate, Loader2 } from 'lucide-react';
import { getUserData, getAuthData } from '../utils/auth';
import { API_URL } from '../utils/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const sosIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

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

    useEffect(() => {
        const baseUrl = API_URL.replace('/api', '');
        const socket = new SockJS(`${baseUrl}/ws`);
        const client = Stomp.over(() => socket);

        client.connect({}, () => {
            console.log('✅ WebSocket Connected');

            client.subscribe('/topic/sos-alerts', (message) => {
                const alert = JSON.parse(message.body);
                handleAlertUpdate(alert);
            });

            if (userData?.id) {
                client.subscribe('/user/queue/sos-notifications', (message) => {
                    const notification = JSON.parse(message.body);
                    toast(notification.message, { icon: '🔔', duration: 5000 });
                });
            }

            setStompClient(client);
        }, (error) => {
            console.error('WebSocket Connection Error:', error);
        });

        return () => {
            if (client && client.connected) {
                client.disconnect();
            }
        };
    }, [userData?.id]);

    const handleAlertUpdate = (alert) => {
        if (alert.status === 'ACTIVE') {
            setSosAlerts(prev => {
                const index = prev.findIndex(a => a.id === alert.id);
                if (index !== -1) {
                    const updated = [...prev];
                    updated[index] = alert;
                    return updated;
                }
                return [alert, ...prev];
            });

            if (alert.userId === userData?.id) {
                setHasActiveAlert(true);
                setActiveAlertId(alert.id);
            }

            if (alert.userId !== userData?.id && !sosAlerts.find(a => a.id === alert.id)) {
                toast.error(`🚨 ${alert.userName} needs help!`, { duration: 5000, position: 'top-right' });
            }

        } else if (alert.status === 'RESOLVED' || alert.status === 'CANCELLED') {
            setSosAlerts(prev => prev.filter(a => a.id !== alert.id));

            if (alert.userId === userData?.id) {
                setHasActiveAlert(false);
                setActiveAlertId(null);
                toast.success(`SOS Alert ${alert.status === 'RESOLVED' ? 'Resolved' : 'Cancelled'}`);
            }
        }
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    setUserLocation(location);

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
                    toast.error('Please enable location services to use SOS features');
                }
            );
        }
    }, []);

    useEffect(() => {
        const authData = getAuthData();
        if (authData?.token) {
            fetchActiveSosAlerts();
            checkUserActiveAlert();
        }
    }, []);

    const fetchActiveSosAlerts = async () => {
        try {
            const authData = getAuthData();
            if (!authData?.token) return;
            const response = await fetch(`${API_URL}/sos/active`, {
                headers: { 'Authorization': `Bearer ${authData.token}` }
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
            const authData = getAuthData();
            if (!authData?.token) return;
            const response = await fetch(`${API_URL}/sos/my-alerts`, {
                headers: { 'Authorization': `Bearer ${authData.token}` }
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
            const authData = getAuthData();
            if (!authData?.token) {
                toast.error('Authentication error. Please login again.');
                return;
            }
            const response = await fetch(`${API_URL}/sos/alert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authData.token}`
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
                if (response.status === 400 && result.message?.toLowerCase().includes('already have an active')) {
                    toast.error('You already have an active SOS alert!');
                    checkUserActiveAlert();
                } else {
                    toast.error(result.message || 'Failed to send SOS');
                }
            }
        } catch (error) {
            console.error('SOS Error:', error);
            toast.error('Failed to send SOS. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleResolveSOS = async () => {
        if (!activeAlertId) return;

        try {
            const authData = getAuthData();
            if (!authData?.token) return;
            const response = await fetch(`${API_URL}/sos/${activeAlertId}/resolve`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${authData.token}` }
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
            const authData = getAuthData();
            if (!authData?.token) return;
            const response = await fetch(`${API_URL}/sos/${activeAlertId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authData.token}` }
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
            const authData = getAuthData();
            if (!authData?.token) {
                toast.error('Please login to respond');
                return;
            }
            const response = await fetch(`${API_URL}/sos/${sosId}/respond`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authData.token}` }
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

    const handleGetDirections = (alert) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${alert.latitude},${alert.longitude}`;
        window.open(url, '_blank');
        handleRespondToSOS(alert.id);
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
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <div className="flex-grow pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden">
                {/* Background red pulse for emergency feel */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-red-50 to-transparent -z-10" />

                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-10"
                    >
                        <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-full mb-4 animate-pulse">
                            <Shield className="w-8 h-8 text-red-600" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-2">
                            Emergency <span className="text-red-600">Response</span>
                        </h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Quickly alert nearby users and emergency contacts when you need urgent help.
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Control Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-1 space-y-6"
                        >
                            {/* SOS Action Card */}
                            <div className={`rounded-3xl shadow-xl overflow-hidden border-2 transition-colors ${hasActiveAlert ? 'bg-red-600 border-red-700' : 'bg-white border-red-100'}`}>
                                <div className="p-8 text-center">
                                    {hasActiveAlert ? (
                                        <div className="text-white">
                                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-ping-slow">
                                                <Radio className="w-12 h-12 text-white" />
                                            </div>
                                            <h2 className="text-2xl font-bold mb-2">SOS Active!</h2>
                                            <p className="text-white/80 mb-8">Alert sent to nearby community. Help is on the way.</p>

                                            <div className="grid gap-3">
                                                <button
                                                    onClick={handleResolveSOS}
                                                    className="w-full bg-white text-green-600 font-bold py-4 px-6 rounded-xl shadow-lg hover:bg-green-50 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                    I'm Safe Now
                                                </button>
                                                <button
                                                    onClick={handleCancelSOS}
                                                    className="w-full bg-red-800/50 text-white font-semibold py-3 px-6 rounded-xl hover:bg-red-800 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <X className="w-5 h-5" />
                                                    Cancel Alert
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Need Help?</h2>

                                            <div className="mb-6 text-left">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className={`w-2 h-2 rounded-full ${userLocation ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`} />
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Location</span>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start gap-3">
                                                    <Locate className="w-5 h-5 text-gray-400 mt-0.5" />
                                                    <p className="text-sm text-gray-700 font-medium break-words">
                                                        {address || 'Detecting location...'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mb-6 text-left">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Emergency Message</label>
                                                <textarea
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    placeholder="Describe the emergency..."
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all resize-none text-sm"
                                                    rows="2"
                                                />
                                            </div>

                                            <button
                                                onClick={handleSendSOS}
                                                disabled={loading || !userLocation}
                                                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-200 flex items-center justify-center gap-3 group"
                                            >
                                                <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
                                                    <AlertCircle className="w-6 h-6" />
                                                </div>
                                                <span className="text-lg">SEND SOS ALERT</span>
                                            </button>
                                            <p className="mt-4 text-xs text-gray-400">
                                                Pressing this will instantly alert all nearby MigrateMate users.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Active Alerts List */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        Active Alerts
                                    </h3>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sosAlerts.length > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {sosAlerts.length} Active
                                    </span>
                                </div>

                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                    {sosAlerts.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <Shield className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500 font-medium">No active emergencies nearby</p>
                                        </div>
                                    ) : (
                                        sosAlerts.map((alert) => (
                                            <motion.div
                                                key={alert.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedAlert?.id === alert.id
                                                    ? 'bg-red-50 border-red-200 ring-1 ring-red-200'
                                                    : 'bg-white border-gray-100 hover:border-red-100 hover:shadow-md'
                                                    }`}
                                                onClick={() => setSelectedAlert(alert)}
                                            >
                                                <div className="flex gap-3">
                                                    <div className="relative">
                                                        <img
                                                            src={alert.userAvatar || `https://ui-avatars.com/api/?name=${alert.userName}`}
                                                            alt={alert.userName}
                                                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                                        />
                                                        <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="font-bold text-gray-900 text-sm truncate">{alert.userName}</h4>
                                                            <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded">
                                                                {getTimeSince(alert.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 truncate mb-2">{alert.address}</p>

                                                        {alert.userId !== userData?.id && (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleGetDirections(alert); }}
                                                                    className="flex-1 bg-gray-900 text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-1"
                                                                >
                                                                    <Navigation className="w-3 h-3" /> Directions
                                                                </button>
                                                                {alert.userPhone && (
                                                                    <a
                                                                        href={`tel:${alert.userPhone}`}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="flex-1 bg-green-50 text-green-700 text-[10px] font-bold py-1.5 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                                                                    >
                                                                        <Phone className="w-3 h-3" /> Call
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}

                                                        {alert.helperName && (
                                                            <div className="mt-2 text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3" /> {alert.helperName} is responding
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

                        {/* Map View */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative"
                        >
                            <div className="h-[500px] lg:h-[calc(100vh-250px)] w-full">
                                {userLocation ? (
                                    <MapContainer
                                        center={[userLocation.latitude, userLocation.longitude]}
                                        zoom={14}
                                        style={{ height: '100%', width: '100%' }}
                                        scrollWheelZoom={true}
                                        zoomControl={false}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />

                                        <MapUpdater center={selectedAlert ? [selectedAlert.latitude, selectedAlert.longitude] : null} />

                                        {/* User Location */}
                                        <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
                                            <Popup className="custom-popup">
                                                <div className="text-center p-2">
                                                    <div className="font-bold text-blue-600 mb-1">You are here</div>
                                                    <p className="text-xs text-gray-500">{address}</p>
                                                </div>
                                            </Popup>
                                        </Marker>

                                        {/* SOS Markers */}
                                        {sosAlerts.map((alert) => (
                                            <Marker key={alert.id} position={[alert.latitude, alert.longitude]} icon={sosIcon}>
                                                <Popup className="custom-popup">
                                                    <div className="min-w-[200px] p-1">
                                                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                                                            <img
                                                                src={alert.userAvatar || `https://ui-avatars.com/api/?name=${alert.userName}`}
                                                                alt={alert.userName}
                                                                className="w-8 h-8 rounded-full bg-gray-100"
                                                            />
                                                            <div>
                                                                <div className="font-bold text-gray-900 leading-tight">{alert.userName}</div>
                                                                <div className="text-xs text-red-500 font-medium">SOS Active</div>
                                                            </div>
                                                        </div>

                                                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg mb-2 italic">"{alert.message}"</p>
                                                        <div className="text-xs text-gray-500 mb-3 flex items-start gap-1">
                                                            <MapPin className="w-3 h-3 mt-0.5" />
                                                            {alert.address}
                                                        </div>

                                                        {alert.userId !== userData?.id && (
                                                            <button
                                                                onClick={() => handleGetDirections(alert)}
                                                                className="w-full bg-gray-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-1"
                                                            >
                                                                <Navigation className="w-3 h-3" /> Get Directions
                                                            </button>
                                                        )}
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        ))}
                                    </MapContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                                        <Loader2 className="w-10 h-10 animate-spin mb-3 text-red-600" />
                                        <p className="font-medium">Acquiring detailed location...</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

// Add this to your global CSS or styles to handle Leaflet z-index issues if they arise
// .leaflet-pane { z-index: 0 !important; }
// .leaflet-bottom { z-index: 0 !important; }

export default SosPage;