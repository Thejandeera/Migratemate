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
    const [mode, setMode] = useState("camera"); // 'camera' or 'upload'

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

    const clearImage = () => {
        setSelectedImage(null);
        setUploadArResult(null);
        setAnalyzing(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <div className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 sm:px-6">

                <div className="text-center max-w-2xl mx-auto mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        MigrateMate <span className="text-[#22C55E]">Lens</span>
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Real-time AI analysis & object detection.
                    </p>
                </div>

                {/* Toggles */}
                <div className="bg-gray-100 p-1 rounded-xl flex gap-1 mb-8 shadow-sm">
                    <button
                        onClick={() => setMode("camera")}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${mode === "camera" ? "bg-white text-[#22C55E] shadow-sm" : "text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        <Camera className="w-4 h-4" />
                        Live Camera
                    </button>
                    <button
                        onClick={() => setMode("upload")}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${mode === "upload" ? "bg-white text-[#22C55E] shadow-sm" : "text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        <Upload className="w-4 h-4" />
                        Upload Image
                    </button>
                </div>

                <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 items-start justify-center">

                    {/* Main Viewport */}
                    <div className="relative w-full max-w-xl bg-black rounded-2xl overflow-hidden shadow-2xl ring-4 ring-gray-100 aspect-[3/4] sm:aspect-[4/3] flex items-center justify-center">

                        {/* CAMERA MODE */}
                        {mode === "camera" && (
                            <>
                                {loading && (
                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white bg-black/80">
                                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#22C55E]" />
                                        <p>Loading Camera AI...</p>
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
                                    <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md animate-pulse">
                                        <Sparkles className="w-3 h-3 text-[#22C55E]" />
                                        Scanning Scene...
                                    </div>
                                )}
                            </>
                        )}

                        {/* UPLOAD MODE */}
                        {mode === "upload" && (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 relative">
                                {analyzing && (
                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white bg-black/60 backdrop-blur-sm">
                                        <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#22C55E]" />
                                        <p>Analyzing...</p>
                                    </div>
                                )}
                                {selectedImage ? (
                                    <>
                                        <img src={selectedImage} alt="Uploaded" className="absolute w-full h-full object-contain bg-black" />
                                        <button onClick={clearImage} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-lg z-20">
                                            <X className="w-5 h-5 text-gray-800" />
                                        </button>
                                    </>
                                ) : (
                                    <label className="cursor-pointer group flex flex-col items-center p-8">
                                        <ImageIcon className="w-12 h-12 text-[#22C55E] mb-4 group-hover:scale-110 transition" />
                                        <p className="font-semibold text-gray-900">Click to Upload</p>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </label>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Results Panel - DYNAMIC */}
                    <div className="w-full lg:w-96 flex-shrink-0 space-y-4">

                        {/* LIVE INSIGHT RESULTS (Camera Only) */}
                        {mode === "camera" && (
                            <div className="space-y-4">
                                {/* Gemini Result */}
                                {liveArResult ? (
                                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up">
                                        <div className="p-3 border-b border-gray-100 bg-[#F0FDF4] flex justify-between items-center">
                                            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                                <Sparkles className="w-4 h-4 text-[#22C55E]" />
                                                Live Insight
                                            </h3>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">AI Powered</span>
                                        </div>
                                        <div className="p-4">
                                            <h2 className="text-lg font-bold text-gray-900 mb-1">{liveArResult.name || "Unknown Place"}</h2>
                                            {liveArResult.location && (
                                                <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                                                    <MapPin className="w-3 h-3" />
                                                    {liveArResult.location}
                                                </div>
                                            )}
                                            <p className="text-sm text-gray-600 leading-snug line-clamp-4">
                                                {liveArResult.description}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                                        <p className="text-sm text-gray-400 italic">Point at a landmark to verify detailed info...</p>
                                    </div>
                                )}

                                {/* TensorFlow Detections */}
                                {detections.length > 0 && (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Visible Objects</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {detections.map((det, i) => (
                                                <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium capitalize">
                                                    {det.class} ({Math.round(det.score * 100)}%)
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}


                        {/* UPLOAD RESULTS */}
                        {mode === "upload" && uploadArResult && (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 animate-fade-in-up">
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">{uploadArResult.name || "Analysis Result"}</h2>
                                {uploadArResult.location && (
                                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                                        <MapPin className="w-4 h-4" />
                                        {uploadArResult.location}
                                    </div>
                                )}
                                <p className="text-gray-700 text-sm leading-relaxed mb-4">{uploadArResult.description}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default LiveARScanner;
