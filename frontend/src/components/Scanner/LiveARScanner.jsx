import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-cpu";
import Webcam from "react-webcam";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { Upload, Camera, Search, X, Image as ImageIcon, Loader2, MapPin, Info, Sparkles, Scan, History, ChevronRight } from "lucide-react";
import { API_URL } from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";

const LiveARScanner = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    // State
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState("upload"); // 'camera' or 'upload'
    const [detections, setDetections] = useState([]);
    const [liveArResult, setLiveArResult] = useState(null);
    const [isAnalyzingLive, setIsAnalyzingLive] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [uploadArResult, setUploadArResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [visibleCount, setVisibleCount] = useState(6);

    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.setBackend('webgl').catch(() => tf.setBackend('cpu'));
                await tf.ready();
                const loadedModel = await cocoSsd.load();
                setModel(loadedModel);
                setLoading(false);
                console.log("AI Model Loaded");
            } catch (err) {
                console.error("Failed to load model", err);
                setLoading(false);
            }
        };
        loadModel();
    }, []);

    const runCocoCamera = async () => {
        if (
            mode === "camera" &&
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video.readyState === 4 &&
            model
        ) {
            const video = webcamRef.current.video;
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;

            webcamRef.current.video.width = videoWidth;
            webcamRef.current.video.height = videoHeight;

            if (canvasRef.current) {
                canvasRef.current.width = videoWidth;
                canvasRef.current.height = videoHeight;

                try {
                    const predictions = await model.detect(video);
                    setDetections(predictions);
                    const ctx = canvasRef.current.getContext("2d");
                    if (ctx) drawRect(predictions, ctx);
                } catch (error) {
                    console.error("Detection error:", error);
                }
            }
        }
    };

    useEffect(() => {
        let interval;
        if (mode === "camera" && !loading) {
            interval = setInterval(() => {
                runCocoCamera();
            }, 100);
        }
        return () => clearInterval(interval);
    }, [mode, model, loading]);

    useEffect(() => {
        let aiInterval;
        if (mode === "camera" && !loading) {
            aiInterval = setInterval(async () => {
                if (!isAnalyzingLive && webcamRef.current) {
                    await captureAndAnalyzeLive();
                }
            }, 8000);
        }
        return () => clearInterval(aiInterval);
    }, [mode, loading, isAnalyzingLive]);

    const captureAndAnalyzeLive = async () => {
        if (!webcamRef.current) return;
        setIsAnalyzingLive(true);

        try {
            const imageSrc = webcamRef.current.getScreenshot();
            if (!imageSrc) return;

            const blob = await (await fetch(imageSrc)).blob();
            const formData = new FormData();
            formData.append("image", blob, "live_capture.jpg");

            const userData = JSON.parse(sessionStorage.getItem("userData"));
            const userId = userData?.id;
            if (userId) {
                formData.append("userId", userId);
            }

            const response = await fetch(`${API_URL}/ar/analyze`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                if (data.name) {
                    setLiveArResult(data);
                }
            }
        } catch (error) {
            console.error("Live analysis failed", error);
        } finally {
            setIsAnalyzingLive(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            setUploadArResult(null);
            setAnalyzing(true);

            const formData = new FormData();
            formData.append("image", file);

            const userData = JSON.parse(sessionStorage.getItem("userData"));
            const userId = userData?.id;
            if (userId) {
                formData.append("userId", userId);
            }

            try {
                const response = await fetch(`${API_URL}/ar/analyze`, {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    setUploadArResult(data);
                } else {
                    setUploadArResult({ description: "Failed to analyze image." });
                }
            } catch (error) {
                setUploadArResult({ description: "Network error." });
            } finally {
                setAnalyzing(false);
            }
        }
    };

    const drawRect = (detections, ctx) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        detections.forEach((prediction) => {
            const [x, y, width, height] = prediction['bbox'];
            const text = prediction['class'];
            const color = '#22C55E';

            ctx.strokeStyle = color;
            ctx.font = 'bold 16px Inter, sans-serif';
            ctx.lineWidth = 2;
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 4;

            ctx.beginPath();
            ctx.roundRect(x, y, width, height, 8);
            ctx.stroke();

            const textWidth = ctx.measureText(text.toUpperCase()).width;
            const textHeight = 24;

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(x, y - textHeight - 2, textWidth + 12, textHeight, [4, 4, 0, 0]);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(text.toUpperCase(), x + 6, y - 6);
        });
    };

    useEffect(() => {
        const fetchHistory = async () => {
            const userData = JSON.parse(sessionStorage.getItem("userData"));
            if (userData?.id) {
                try {
                    const res = await fetch(`${API_URL}/ar/history/${userData.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setHistory(data.reverse());
                    }
                } catch (error) {
                    console.error("Failed to fetch history", error);
                }
            }
        };
        fetchHistory();
    }, [uploadArResult, liveArResult]);

    const clearImage = () => {
        setSelectedImage(null);
        setUploadArResult(null);
        setAnalyzing(false);
    };

    const toggleExpand = (index) => {
        setExpandedId(expandedId === index ? null : index);
    };

    const loadMore = () => {
        setVisibleCount(prev => prev + 6);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
            <Navbar />

            <div className="flex-grow pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden">
                {/* Background ambient light */}
                {/* Background ambient light - Removed for consistency */}

                <div className="max-w-7xl mx-auto z-10 relative">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-1.5 rounded-full mb-4 shadow-sm">
                            <Sparkles className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">AI Powered Lens</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                            Discover the <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">Unseen</span>
                        </h1>
                        <p className="text-gray-600 text-lg max-w-xl mx-auto">
                            Point your camera or upload an image to instantly identify landmarks, objects, and text in real-time.
                        </p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white p-1 rounded-2xl flex gap-1 border border-gray-200 shadow-sm">
                            <button
                                onClick={() => setMode("camera")}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${mode === "camera" ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
                            >
                                <Camera className="w-4 h-4" /> Live Camera
                            </button>
                            <button
                                onClick={() => setMode("upload")}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${mode === "upload" ? "bg-gray-900 text-white shadow-lg" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
                            >
                                <Upload className="w-4 h-4" /> Upload Image
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center mb-16">
                        {/* Main Viewport */}
                        <div className="w-full lg:flex-1 bg-black rounded-3xl overflow-hidden shadow-2xl relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[4/3] group border border-gray-800">

                            {/* Scanning Overlay Grid */}
                            <div className="absolute inset-0 z-10 pointer-events-none opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

                            {/* CAMERA MODE */}
                            {mode === "camera" && (
                                <>
                                    {loading && (
                                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
                                            <Loader2 className="w-12 h-12 animate-spin mb-4 text-green-500" />
                                            <p className="font-bold text-gray-300">Initializing Neural Networks...</p>
                                        </div>
                                    )}
                                    <Webcam
                                        ref={webcamRef}
                                        muted={true}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={{ facingMode: "environment" }}
                                        className="absolute w-full h-full object-cover"
                                    />
                                    <canvas
                                        ref={canvasRef}
                                        className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none"
                                    />

                                    {/* HUD Elements */}
                                    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border ${isAnalyzingLive ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-black/40 border-white/10 text-gray-400'}`}>
                                            <div className={`w-2 h-2 rounded-full ${isAnalyzingLive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                                            <span className="text-xs font-bold uppercase">{isAnalyzingLive ? 'Scanning...' : 'Ready'}</span>
                                        </div>
                                    </div>

                                    {/* Crosshair */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-30">
                                        <Scan className="w-64 h-64 text-white stroke-1" />
                                    </div>
                                </>
                            )}

                            {/* UPLOAD MODE */}
                            {mode === "upload" && (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 relative">
                                    {analyzing && (
                                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                                            <Loader2 className="w-12 h-12 animate-spin mb-4 text-green-500" />
                                            <p className="font-bold text-gray-300">Analyzing Image...</p>
                                        </div>
                                    )}
                                    {selectedImage ? (
                                        <>
                                            <img src={selectedImage} alt="Uploaded" className="absolute w-full h-full object-contain" />
                                            <button onClick={clearImage} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-20 backdrop-blur-md border border-white/10">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer group/upload flex flex-col items-center p-12 hover:bg-white rounded-3xl transition-all duration-300 border-2 border-dashed border-gray-200 hover:border-green-500 shadow-sm hover:shadow-md">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 group-hover/upload:scale-110 transition-transform duration-300 border border-gray-100 shadow-sm">
                                                <ImageIcon className="w-8 h-8 text-gray-400 group-hover/upload:text-green-600 transition-colors" />
                                            </div>
                                            <p className="font-bold text-gray-900 text-xl mb-2">Click to Upload</p>
                                            <p className="text-gray-500 text-sm">Support for JPG, PNG</p>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Analysis Results Sidebar */}
                        <div className="w-full lg:w-[24rem] flex-shrink-0 space-y-4">
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Real-time Insights</h3>

                            {/* Live Result Card */}
                            <AnimatePresence mode="wait">
                                {(mode === "camera" && liveArResult) || (mode === "upload" && uploadArResult) ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-xl"
                                    >
                                        <div className="p-1 h-1 bg-gradient-to-r from-green-400 to-emerald-600"></div>
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <h2 className="text-xl font-bold text-gray-900 leading-tight pr-4">
                                                    {(mode === "camera" ? liveArResult.name : uploadArResult.name) || "Object Detected"}
                                                </h2>
                                                <div className="bg-green-500/10 text-green-400 p-2 rounded-full">
                                                    <Sparkles className="w-5 h-5" />
                                                </div>
                                            </div>

                                            {/* Location Tag if available */}
                                            {((mode === "camera" ? liveArResult.location : uploadArResult.location)) && (
                                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4 bg-gray-900/50 p-2 rounded-lg w-fit">
                                                    <MapPin className="w-3.5 h-3.5 text-green-500" />
                                                    {(mode === "camera" ? liveArResult.location : uploadArResult.location)}
                                                </div>
                                            )}

                                            <p className="text-gray-600 leading-relaxed text-sm">
                                                {(mode === "camera" ? liveArResult.description : uploadArResult.description)}
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-sm"
                                    >
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 mx-auto text-gray-400">
                                            <Search className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-1">Waiting for Analysis</h3>
                                        <p className="text-xs text-gray-500">
                                            {mode === "camera" ? "Point camera at objects to scan" : "Upload an image to start"}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Detections List (Camera Only) */}
                            {mode === "camera" && detections.length > 0 && (
                                <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detected Objects</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {detections.map((det, i) => (
                                            <span key={i} className="px-2 py-1 bg-gray-700 text-gray-200 text-xs rounded-md border border-gray-600 flex items-center gap-1.5">
                                                {det.class}
                                                <span className="text-green-400 text-[10px] font-mono">{Math.round(det.score * 100)}%</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* HISTORY SECTION */}
                    {history.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <History className="w-5 h-5 text-gray-500" /> Recent Scans
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {history.slice(0, visibleCount).map((item, index) => (
                                    <div key={index} className="bg-white rounded-2xl p-5 hover:shadow-lg border border-gray-100 transition-all group">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">{item.name || "Unknown"}</h3>
                                            <span className="text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">{new Date(item.timestamp).toLocaleDateString()}</span>
                                        </div>

                                        {item.location && (
                                            <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3">
                                                <MapPin className="w-3 h-3 text-gray-600" />
                                                {item.location}
                                            </div>
                                        )}

                                        <p className={`text-gray-600 text-xs leading-relaxed ${expandedId === index ? '' : 'line-clamp-2'}`}>
                                            {item.description}
                                        </p>

                                        <button
                                            onClick={() => toggleExpand(index)}
                                            className="mt-4 text-green-500 text-xs font-bold hover:text-green-400 flex items-center gap-1"
                                        >
                                            {expandedId === index ? "Show Less" : "Read More"} <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {visibleCount < history.length && (
                                <div className="mt-8 flex justify-center">
                                    <button
                                        onClick={loadMore}
                                        className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 transition-all text-sm font-semibold shadow-sm"
                                    >
                                        Load More
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default LiveARScanner;
