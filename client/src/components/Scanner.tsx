"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';

interface ScannerProps {
    onCapture: (imageSrc: string) => void;
    onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Prefer back camera
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const captureFrame = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/png');
                // Stop camera and return image
                stopCamera();
                onCapture(dataUrl);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
            <div className="relative w-full h-full max-w-md bg-black">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Controls */}
                <div className="absolute top-4 right-4">
                    <button onClick={onClose} className="p-2 bg-white/20 rounded-full text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                    <button
                        onClick={captureFrame}
                        className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                    >
                        <Camera size={32} className="text-black" />
                    </button>
                </div>

                <div className="absolute top-10 left-0 right-0 text-center">
                    <p className="text-white bg-black/50 px-3 py-1 inline-block rounded-lg">
                        Align code or label in frame
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Scanner;
