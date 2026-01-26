import React, { useRef, useState, useEffect } from "react";
// Import dependencies
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { Upload, Camera, Search, X, Image as ImageIcon, Loader2 } from "lucide-react";

const LiveARScanner = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const imageRef = useRef(null);

    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState("camera"); // 'camera' or 'upload'
    const [selectedImage, setSelectedImage] = useState(null);
    const [detections, setDetections] = useState([]);

    // 1. Load the AI Model
    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready();
                const loadedModel = await cocoSsd.load();
                setModel(loadedModel);
                setLoading(false);
                console.log("AI Model Loaded");
            } catch (err) {
                console.log("Failed to load model", err);
                setLoading(false);
            }
        };
        loadModel();
    }, []);

    // 2. Camera Detection Loop
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
                    setDetections(predictions); // Update detections state
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

    // Run camera detection interval
    useEffect(() => {
        let interval;
        if (mode === "camera" && model && !loading) {
            interval = setInterval(() => {
                runCocoCamera();
            }, 100); // 100ms is enough for smoothness and better performance
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [mode, model, loading]);

    // 3. Image Detection Logic
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            setDetections([]); // Clear previous detections

            // Allow image to load before detecting
            setTimeout(() => detectImage(imageUrl), 100);
        }
    };

    const detectImage = async (imageUrl) => {
        if (model && imageRef.current) {
            try {
                const img = imageRef.current;

                // Wait for image to load naturally if needed, but setTimeout helps
                if (img.complete) {
                    runDetectOnImage(img);
                } else {
                    img.onload = () => runDetectOnImage(img);
                }
            } catch (err) {
                console.error("Image detection failed", err);
            }
        }
    };

    const runDetectOnImage = async (img) => {
        // Set canvas dimensions to match image
        const width = img.width;
        const height = img.height;

        // Limit max processing size for performance if needed, but full res is fine for now
        // Logic for responsive scaling in view is handled by CSS, but canvas needs exact match

        if (canvasRef.current) {
            canvasRef.current.width = width;
            canvasRef.current.height = height;

            const predictions = await model.detect(img);
            setDetections(predictions);

            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
                drawRect(predictions, ctx);
            }
        }
    }

    // 4. Drawing Function
    const drawRect = (detections, ctx) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        detections.forEach((prediction) => {
            const [x, y, width, height] = prediction['bbox'];
            const text = prediction['class'];

            // Theme Colors
            const color = '#22C55E'; // Green
            const textColor = '#FFFFFF';

            ctx.strokeStyle = color;
            ctx.font = 'bold 18px Inter, sans-serif';
            ctx.lineWidth = 4;
            ctx.lineJoin = "round";

            // Draw Rectangle
            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.stroke();

            // Draw Label Background
            const textWidth = ctx.measureText(text.toUpperCase()).width;
            const textHeight = 24;

            ctx.fillStyle = color;
            ctx.fillRect(x, y - textHeight, textWidth + 10, textHeight);

            // Draw Text
            ctx.fillStyle = textColor;
            ctx.fillText(text.toUpperCase(), x + 5, y - 6);
        });
    };

    // Helper for Search
    const googleSearch = (query) => {
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
    };

    const clearImage = () => {
        setSelectedImage(null);
        setDetections([]);
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <div className="flex-grow flex flex-col items-center pt-24 pb-12 px-4 sm:px-6">

                {/* Header Section */}
                <div className="text-center max-w-2xl mx-auto mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        MigrateMate <span className="text-[#22C55E]">Scanner</span>
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Instantly identify objects using your camera or upload an image.
                    </p>
                </div>

                {/* Mode Switcher */}
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

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <Loader2 className="w-10 h-10 text-[#22C55E] animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Loading AI Models...</p>
                    </div>
                ) : (
                    <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8 items-start justify-center">

                        {/* Main Viewport */}
                        <div className="relative w-full max-w-xl bg-black rounded-2xl overflow-hidden shadow-2xl ring-4 ring-gray-100 aspect-[3/4] sm:aspect-[4/3] flex items-center justify-center">

                            {/* CAMERA MODE */}
                            {mode === "camera" && (
                                <>
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
                                    {selectedImage ? (
                                        <>
                                            <img
                                                ref={imageRef}
                                                src={selectedImage}
                                                alt="Uploaded analysis"
                                                className="absolute w-full h-full object-contain bg-black"
                                            />
                                            <canvas
                                                ref={canvasRef}
                                                className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none object-contain"
                                                // Note: canvas sizing for object-contain images requires complex mapping, 
                                                // for simplicity in this responsive design we rely on drawing relative to image natural size 
                                                // and CSS scaling both img and canvas identically.
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
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
                                                <p className="text-sm text-gray-500 mb-6">or drag and drop an image here</p>
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
                        <div className="w-full lg:w-80 flex-shrink-0">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-24">
                                <div className="p-4 border-b border-gray-100 bg-gray-50">
                                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                        <Search className="w-4 h-4 text-[#22C55E]" />
                                        Detected Objects
                                    </h3>
                                </div>

                                <div className="p-4 max-h-[400px] overflow-y-auto">
                                    {detections.length > 0 ? (
                                        <div className="space-y-3">
                                            {detections.map((det, index) => (
                                                <div key={index} className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow group">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-semibold text-gray-800 capitalize text-lg">
                                                            {det.class}
                                                        </span>
                                                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                            {Math.round(det.score * 100)}%
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => googleSearch(det.class + " migration guide")}
                                                        className="w-full mt-2 text-xs font-medium text-[#22C55E] border border-[#22C55E] rounded-md px-3 py-1.5 hover:bg-[#F0FDF4] flex items-center justify-center gap-1 transition-colors"
                                                    >
                                                        <Search className="w-3 h-3" />
                                                        Search this object
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            <p className="text-sm">No objects detected yet.</p>
                                            <p className="text-xs mt-1">Point camera or upload an image.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Legend / Tip */}
                                <div className="p-3 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-500 text-center">
                                    Powered by TensorFlow.js & COCO-SSD
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            <Footer />
        </div>
    );
};

export default LiveARScanner;
