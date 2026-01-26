import React, { useRef, useState, useEffect } from "react";
// Import dependencies
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-cpu";
import Webcam from "react-webcam";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { Upload, Camera, Search, X, Image as ImageIcon, Loader2, MapPin, Info } from "lucide-react";
import { API_URL } from "../../utils/api"; // Ensure API_URL is imported

const LiveARScanner = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const imageRef = useRef(null);

    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true); // Model loading
    const [analyzing, setAnalyzing] = useState(false); // Backend analysis loading
    const [mode, setMode] = useState("camera"); // 'camera' or 'upload'
    const [selectedImage, setSelectedImage] = useState(null);
    const [detections, setDetections] = useState([]); // For Camera
    const [arResult, setArResult] = useState(null); // For Upload (Backend Result)

    // 1. Load the AI Model (For Camera Mode)
    useEffect(() => {
        const loadModel = async () => {
            try {
                // Ensure backend is ready
                await tf.setBackend('webgl').catch(() => tf.setBackend('cpu'));
                await tf.ready();

                const loadedModel = await cocoSsd.load();
                setModel(loadedModel);
                setLoading(false);
                console.log("AI Model Loaded");
            } catch (err) {
                console.error("Failed to load model or backend", err);
                setLoading(false);
            }
        };
        loadModel();
    }, []);

    // 2. Camera Detection Loop (Client-Side)
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

            if (videoWidth === 0 || videoHeight === 0) return;

            webcamRef.current.video.width = videoWidth;
            webcamRef.current.video.height = videoHeight;

            if (canvasRef.current) {
                canvasRef.current.width = videoWidth;
                canvasRef.current.height = videoHeight;

                try {
                    const predictions = await model.detect(video);
                    setDetections(predictions);
                    const ctx = canvasRef.current.getContext("2d");
                    if (ctx) {
                        drawRect(predictions, ctx);
                    }
                } catch (error) {
                    console.error("Detection error:", error);
                }
            }
        }
    };

    useEffect(() => {
        let interval;
        if (mode === "camera" && model && !loading) {
            interval = setInterval(() => {
                runCocoCamera();
            }, 100);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [mode, model, loading]);

    // 3. Image Upload & Backend Analysis
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            setDetections([]); // Clear camera detections
            setArResult(null); // Clear previous results
            setAnalyzing(true); // Start loading

            // Create FormData for backend
            const formData = new FormData();
            formData.append("image", file);

            try {
                // Call Backend API
                const response = await fetch(`${API_URL}/ar/analyze`, {
                    method: "POST",
                    body: formData,
                    // Note: Content-Type header is set automatically for FormData
                });

                if (response.ok) {
                    const data = await response.json();
                    setArResult(data);
                } else {
                    console.error("Backend analysis failed");
                    setArResult({ description: "Failed to analyze image. Please try again." });
                }
            } catch (error) {
                console.error("Error uploading image:", error);
                setArResult({ description: "Network error. Please ensure backend is running." });
            } finally {
                setAnalyzing(false);
            }
        }
    };

    // 4. Drawing Function (Only for Camera Mode)
    const drawRect = (detections, ctx) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        detections.forEach((prediction) => {
            const [x, y, width, height] = prediction['bbox'];
            const text = prediction['class'];

            const color = '#22C55E';
            const textColor = '#FFFFFF';

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

            ctx.fillStyle = textColor;
            ctx.fillText(text.toUpperCase(), x + 5, y - 6);
        });
    };

    const clearImage = () => {
        setSelectedImage(null);
        setArResult(null);
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
                        Identify landmarks, places, and objects instantly.
                    </p>
                </div>

                <div className="bg-gray-100 p-1 rounded-xl flex gap-1 mb-8 shadow-sm">
                    <button
                        onClick={() => setMode("camera")}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${mode === "camera"
                            ? "bg-white text-[#22C55E] shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        <Camera className="w-4 h-4" />
                        Live Camera
                    </button>
                    <button
                        onClick={() => setMode("upload")}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 ${mode === "upload"
                            ? "bg-white text-[#22C55E] shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                            }`}
                    >
                        <Upload className="w-4 h-4" />
                        Upload Image
                    </button>
                </div>

                <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8 items-start justify-center">

                    {/* Viewport */}
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
                            </>
                        )}

                        {/* UPLOAD MODE */}
                        {mode === "upload" && (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 relative">
                                {analyzing && (
                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white bg-black/60 backdrop-blur-sm">
                                        <Loader2 className="w-12 h-12 animate-spin mb-4 text-[#22C55E]" />
                                        <p className="font-semibold text-lg">Analyzing Image...</p>
                                        <p className="text-sm text-gray-200">Identifying places & specialities</p>
                                    </div>
                                )}

                                {selectedImage ? (
                                    <>
                                        <img
                                            src={selectedImage}
                                            alt="Uploaded analysis"
                                            className="absolute w-full h-full object-contain bg-black"
                                        />
                                        <button
                                            onClick={clearImage}
                                            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg z-20 transition"
                                            title="Clear Image"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center p-8">
                                        <label className="cursor-pointer group flex flex-col items-center">
                                            <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <ImageIcon className="w-8 h-8 text-[#22C55E]" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Click to Upload</h3>
                                            <p className="text-sm text-gray-500 mb-6">Analyze landmarks & places</p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                            <span className="px-5 py-2 bg-[#22C55E] text-white rounded-lg text-sm font-medium hover:bg-[#16A34A] transition">
                                                Select Image
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Results Panel */}
                    <div className="w-full lg:w-96 flex-shrink-0 space-y-4">

                        {/* CAMERA RESULTS */}
                        {mode === "camera" && detections.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-gray-50">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                        <Search className="w-4 h-4 text-[#22C55E]" />
                                        Visible Objects
                                    </h3>
                                </div>
                                <div className="p-4 max-h-[300px] overflow-y-auto space-y-2">
                                    {detections.map((det, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                            <span className="capitalize font-medium text-gray-700">{det.class}</span>
                                            <span className="text-xs text-gray-400">{Math.round(det.score * 100)}% confidence</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* UPLOAD RESULTS (BACKEND AI) */}
                        {mode === "upload" && arResult && (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in-up">
                                <div className="p-4 border-b border-gray-100 bg-[#F0FDF4]">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                        <Search className="w-4 h-4 text-[#22C55E]" />
                                        Analysis Result
                                    </h3>
                                </div>
                                <div className="p-6">
                                    {arResult.name && (
                                        <div className="mb-4">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-1">{arResult.name}</h2>
                                            {arResult.location && (
                                                <div className="flex items-center gap-1 text-gray-500 text-sm">
                                                    <MapPin className="w-4 h-4" />
                                                    {arResult.location}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                                        <div className="flex items-start gap-2">
                                            <Info className="w-5 h-5 text-[#22C55E] flex-shrink-0 mt-0.5" />
                                            <p className="text-gray-700 leading-relaxed text-sm">
                                                {arResult.description}
                                            </p>
                                        </div>
                                    </div>

                                    {arResult.name && (
                                        <button
                                            onClick={() => window.open(`https://www.google.com/search?q=${arResult.name} ${arResult.location || ''} travel guide`, '_blank')}
                                            className="w-full py-3 bg-[#22C55E] text-white rounded-xl font-semibold hover:bg-[#16A34A] transition shadow-md flex items-center justify-center gap-2"
                                        >
                                            <Search className="w-4 h-4" />
                                            Explore More
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Instructions / Empty State */}
                        {mode === "upload" && !arResult && !analyzing && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Info className="w-6 h-6 text-blue-500" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-1">AI Place Identifier</h4>
                                <p className="text-sm text-gray-500">
                                    Upload a photo of a landmark, building, or street scene to get detailed information about it.
                                </p>
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
