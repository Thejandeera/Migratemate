import React, { useRef, useState, useEffect } from "react";
// Import dependencies
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-cpu";
import Webcam from "react-webcam";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { Upload, Camera, Search, X, Image as ImageIcon, Loader2, MapPin, Info, Sparkles } from "lucide-react";
import { API_URL } from "../../utils/api";

const LiveARScanner = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    // State
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState("upload"); // 'camera' or 'upload'

    // Live Camera State
    const [detections, setDetections] = useState([]);
    const [liveArResult, setLiveArResult] = useState(null); // Backend result for live camera
    const [isAnalyzingLive, setIsAnalyzingLive] = useState(false); // Throttle flag

    // Upload State
    const [selectedImage, setSelectedImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [uploadArResult, setUploadArResult] = useState(null);


    // 1. Load AI Model
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

    // 2. Camera: TensorFlow Detection Loop (Fast)
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

    // 3. Camera: Backend Analysis Interval (Slow/Throttled)
    useEffect(() => {
        let interval;
        if (mode === "camera" && !loading) {
            // Fast loop for bounding boxes
            interval = setInterval(() => {
                runCocoCamera();
            }, 100);
        }
        return () => clearInterval(interval);
    }, [mode, model, loading]);

    // Separate Interval for Backend Analysis (every 5-8 seconds)
    useEffect(() => {
        let aiInterval;
        if (mode === "camera" && !loading) {
            aiInterval = setInterval(async () => {
                if (!isAnalyzingLive && webcamRef.current) {
                    await captureAndAnalyzeLive();
                }
            }, 8000); // 8 seconds to be safe with quota
        }
        return () => clearInterval(aiInterval);
    }, [mode, loading, isAnalyzingLive]);

    const captureAndAnalyzeLive = async () => {
        if (!webcamRef.current) return;
        setIsAnalyzingLive(true);

        try {
            const imageSrc = webcamRef.current.getScreenshot();
            if (!imageSrc) return;

            // Convert base64 to blob
            const blob = await (await fetch(imageSrc)).blob();
            const formData = new FormData();
            formData.append("image", blob, "live_capture.jpg");

            // Get User ID from Session Storage
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
                    setLiveArResult(data); // Only update if valid result
                }
            }
        } catch (error) {
            console.error("Live analysis failed", error);
        } finally {
            setIsAnalyzingLive(false);
        }
    };


    // 4. Image Upload & Analysis
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            setUploadArResult(null);
            setAnalyzing(true);

            const formData = new FormData();
            formData.append("image", file);

            // Get User ID from Session Storage
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

    // Helper: Draw Bounding Boxes
    const drawRect = (detections, ctx) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        detections.forEach((prediction) => {
            const [x, y, width, height] = prediction['bbox'];
            const text = prediction['class'];
            const color = '#22C55E';

            ctx.strokeStyle = color;
            ctx.font = 'bold 18px Inter, sans-serif';
            ctx.lineWidth = 4;
            ctx.lineJoin = "round";

            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.stroke();

            const textWidth = ctx.measureText(text.toUpperCase()).width;
            const textHeight = 24;

            ctx.fillStyle = color;
            ctx.fillRect(x, y - textHeight, textWidth + 10, textHeight);

            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(text.toUpperCase(), x + 5, y - 6);
        });
    };

    // 5. Fetch History
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            const userData = JSON.parse(sessionStorage.getItem("userData"));
            if (userData?.id) {
                try {
                    const res = await fetch(`${API_URL}/ar/history/${userData.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setHistory(data.reverse()); // Show newest first
                    }
                } catch (error) {
                    console.error("Failed to fetch history", error);
                }
            }
        };
        fetchHistory();
    }, [uploadArResult, liveArResult]); // Refresh when new scan happens

    const clearImage = () => {
        setSelectedImage(null);
        setUploadArResult(null);
        setAnalyzing(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <div className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 sm:px-6">

                <div className="text-center max-w-2xl mx-auto mb-8 animate-fade-in-down">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                        MigrateMate <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-700">Lens</span>
                    </h1>
                    <p className="text-gray-600 text-lg md:text-xl max-w-lg mx-auto">
                        Discover the world around you with AI-powered analysis and object detection.
                    </p>
                </div>

                {/* Toggles */}
                <div className="bg-white p-1.5 rounded-2xl flex gap-1 mb-10 shadow-md border border-gray-100">
                    <button
                        onClick={() => setMode("upload")}
                        className={`px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 ${mode === "upload" ? "bg-green-50 text-green-600 shadow-sm ring-1 ring-green-100" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                    >
                        <Upload className="w-4 h-4" />
                        Upload Image
                    </button>
                    <button
                        onClick={() => setMode("camera")}
                        className={`px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 ${mode === "camera" ? "bg-green-50 text-green-600 shadow-sm ring-1 ring-green-100" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                    >
                        <Camera className="w-4 h-4" />
                        Live Camera
                    </button>
                </div>

                <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 items-start justify-center mb-16">

                    {/* Main Viewport */}
                    <div className="relative w-full lg:flex-1 bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-gray-900/5 aspect-[4/3] sm:aspect-[16/9] lg:aspect-[4/3] flex items-center justify-center group">

                        {/* CAMERA MODE */}
                        {mode === "camera" && (
                            <>
                                {loading && (
                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white bg-black/90 backdrop-blur-sm">
                                        <Loader2 className="w-12 h-12 animate-spin mb-4 text-green-500" />
                                        <p className="font-medium tracking-wide">Initializing AI Models...</p>
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
                                {/* Scanning Indicator */}
                                {isAnalyzingLive && (
                                    <div className="absolute top-6 right-6 bg-black/60 text-white text-xs px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md border border-white/10 animate-pulse shadow-lg">
                                        <Sparkles className="w-3 h-3 text-green-400" />
                                        Analyzing Scene...
                                    </div>
                                )}
                            </>
                        )}

                        {/* UPLOAD MODE */}
                        {mode === "upload" && (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-white text-black relative">
                                {analyzing && (
                                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-white bg-black/70 backdrop-blur-md">
                                        <Loader2 className="w-14 h-14 animate-spin mb-4 text-green-500" />
                                        <p className="font-semibold text-lg">Analyzing Image...</p>
                                    </div>
                                )}
                                {selectedImage ? (
                                    <>
                                        <img src={selectedImage} alt="Uploaded" className="absolute w-full h-full object-contain bg-black/90 backdrop-blur-xl" />
                                        <button onClick={clearImage} className="absolute top-6 right-6 bg-white p-2.5 rounded-full shadow-lg z-20 hover:bg-gray-100 transition-colors">
                                            <X className="w-5 h-5 text-gray-900" />
                                        </button>
                                    </>
                                ) : (
                                    <label className="cursor-pointer group/upload flex flex-col items-center p-12 hover:bg-gray-100/50 rounded-3xl transition-all duration-300">
                                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 group-hover/upload:scale-110 transition-transform duration-300 shadow-sm">
                                            <ImageIcon className="w-8 h-8 text-green-600" />
                                        </div>
                                        <p className="font-bold text-gray-900 text-xl mb-2">Click to Upload</p>
                                        <p className="text-gray-500 text-sm">SVG, PNG, JPG or GIF (max. 10MB)</p>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Results Sidebar */}
                    <div className="w-full lg:w-[26rem] flex-shrink-0 space-y-6">

                        {/* LIVE INSIGHT RESULTS (Camera Only) */}
                        {mode === "camera" && (
                            <div className="space-y-6">
                                {/* Gemini Result */}
                                {liveArResult ? (
                                    <div className="bg-white rounded-3xl shadow-xl shadow-green-900/5 border border-green-50 overflow-hidden animate-fade-in-up">
                                        <div className="p-4 border-b border-green-50 bg-gradient-to-r from-green-50 to-white flex justify-between items-center">
                                            <h3 className="font-bold text-green-900 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-green-600" />
                                                Live Insight
                                            </h3>
                                            <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-600 font-bold uppercase tracking-wider shadow-sm border border-green-100">AI Powered</span>
                                        </div>
                                        <div className="p-6">
                                            <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{liveArResult.name || "Identified Location"}</h2>
                                            {liveArResult.location && (
                                                <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
                                                    <MapPin className="w-4 h-4 text-green-500" />
                                                    {liveArResult.location}
                                                </div>
                                            )}
                                            <p className="text-gray-600 leading-relaxed text-sm">
                                                {liveArResult.description}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                            <Camera className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Ready to Scan</h3>
                                        <p className="text-sm text-gray-500 max-w-[200px]">Point your camera at a landmark or object to get real-time insights.</p>
                                    </div>
                                )}

                                {/* TensorFlow Detections */}
                                {detections.length > 0 && (
                                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">Objects Detected</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {detections.map((det, i) => (
                                                <div key={i} className="px-3 py-1.5 bg-gray-50 text-gray-700 text-xs rounded-lg font-semibold capitalize border border-gray-100 flex items-center gap-2">
                                                    {det.class}
                                                    <span className="text-green-600 bg-green-50 px-1.5 rounded-md text-[10px]">{Math.round(det.score * 100)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}


                        {/* UPLOAD RESULTS */}
                        {mode === "upload" && uploadArResult && (
                            <div className="bg-white rounded-3xl shadow-xl shadow-green-900/5 border border-green-50 p-8 animate-fade-in-up relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Sparkles className="w-24 h-24 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2 relative z-10">{uploadArResult.name || "Analysis Result"}</h2>
                                {uploadArResult.location && (
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-5 relative z-10">
                                        <MapPin className="w-4 h-4 text-green-500" />
                                        {uploadArResult.location}
                                    </div>
                                )}
                                <p className="text-gray-700 leading-relaxed relative z-10 text-[15px]">{uploadArResult.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* HISTORY SECTION */}
                {history.length > 0 && (
                    <div className="w-full max-w-7xl animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-8 w-1 bg-green-500 rounded-full"></div>
                            <h2 className="text-2xl font-bold text-gray-900">Recent Discoveries</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {history.map((item, index) => (
                                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 group cursor-default">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-green-600 transition-colors">{item.name || "Unknown"}</h3>
                                        <span className="text-xs text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-1 rounded-md">{new Date(item.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    {item.location && (
                                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-4">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="line-clamp-1">{item.location}</span>
                                        </div>
                                    )}
                                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default LiveARScanner;
