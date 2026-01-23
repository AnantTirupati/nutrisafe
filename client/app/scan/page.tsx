"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { scanAPI } from '../../services/api';
import Scanner from '../../components/Scanner';
import { AlertTriangle, CheckCircle, XCircle, ChevronRight, Loader2, Camera, Clock } from 'lucide-react';

import UserProfile from '../../components/UserProfile';

const COMMON_INGREDIENTS = [
    "Sugar", "High Fructose Corn Syrup", "Palm Oil",
    "Sodium Benzoate", "MSG", "Aspartame",
    "Red 40", "Hydrogenated Oil"
];

export default function ScanPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'barcode' | 'text' | 'image' | 'history'>('barcode');
    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [inputText, setInputText] = useState('');
    const [result, setResult] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const loadHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await scanAPI.getHistory();
            setHistory(data);
        } catch (e) {
            console.error(e);
            setError("Failed to load history.");
        } finally {
            setLoading(false);
        }
    };

    // Load history when tab changes to history
    React.useEffect(() => {
        if (activeTab === 'history') {
            loadHistory();
        }
    }, [activeTab]);

    const handleScan = async (code: string) => {
        setScanning(false);
        setLoading(true);
        setError(null);
        try {
            const res = await scanAPI.scanBarcode(code);
            setResult(res.data);
        } catch (err) {
            // Fallback for demo error display
            setError("Product not found. Try entering Barcode '123456' manually or use scan barcode");
        } finally {
            setLoading(false);
        }
    };

    const handleTextAnalyze = async () => {
        if (!inputText) return;
        setLoading(true);
        setError(null);
        try {
            const res = await scanAPI.analyzeText(inputText);
            setResult(res.data);
        } catch (err: any) {
            setError("Analysis failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageScan = async (imgSrc: string) => {
        setScanning(false);
        setLoading(true);
        setError(null);
        try {
            const res = await scanAPI.scanImage(imgSrc);
            setResult(res.data);
        } catch (err: any) {
            setError("Image Analysis failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setInputText('');
        setError(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm p-4 sticky top-0 z-10 flex justify-between items-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    NutriSafe AI
                </h1>
                <UserProfile />
            </header>

            {/* Main Content */}
            <main className="max-w-md mx-auto p-4">
                {!result ? (
                    <>
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <AlertTriangle size={16} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="flex bg-gray-200 rounded-lg p-1 mb-6">
                            <button
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'barcode' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('barcode')}
                            >
                                Barcode
                            </button>
                            <button
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'image' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('image')}
                            >
                                Scan Label
                            </button>
                            <button
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'text' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('text')}
                            >
                                Text
                            </button>
                            <button
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'history' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('history')}
                            >
                                History
                            </button>
                        </div>

                        {/* Input Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[300px] flex flex-col justify-center items-center">
                            {activeTab === 'barcode' && (
                                <div className="text-center w-full">
                                    <div className="mb-6">
                                        <button
                                            onClick={() => setScanning(true)}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-blue-200 shadow-xl"
                                        >
                                            Scan Barcode
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-200"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2 bg-white text-gray-500">Or type manually</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-2 w-full">
                                        <input
                                            type="text"
                                            placeholder="e.g. 123456"
                                            className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={inputText || ''}
                                            onChange={(e) => setInputText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleScan(inputText)}
                                        />
                                        <button
                                            onClick={() => handleScan(inputText)}
                                            disabled={loading || !inputText}
                                            className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-black transition disabled:opacity-50"
                                        >
                                            Search
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'image' && (
                                <div className="text-center w-full">
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500 mb-4">Take a clear photo of the ingredients label.</p>
                                        <button
                                            onClick={() => setScanning(true)}
                                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-purple-200 shadow-xl"
                                        >
                                            <Camera size={24} /> Capture Label
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'text' && (
                                <div className="w-full">
                                    <textarea
                                        className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-32"
                                        placeholder="Enter ingredients separated by commas (e.g. Sugar, Salt, Palm Oil)..."
                                        value={inputText || ''}
                                        onChange={(e) => setInputText(e.target.value)}
                                    />

                                    {/* Common Ingredients Chips */}
                                    <div className="mt-3">
                                        <p className="text-xs text-gray-500 mb-2 font-semibold">Quick Add Common Ingredients:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {COMMON_INGREDIENTS.map(ing => (
                                                <button
                                                    key={ing}
                                                    onClick={() => setInputText(prev => prev ? `${prev}, ${ing}` : ing)}
                                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md border border-gray-200 transition-colors"
                                                >
                                                    + {ing}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleTextAnalyze}
                                        disabled={loading}
                                        className="mt-4 w-full bg-blue-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Analyze Risks'}
                                    </button>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="w-full h-[300px] overflow-y-auto pr-1">
                                    {loading ? (
                                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" /></div>
                                    ) : history.length === 0 ? (
                                        <p className="text-center text-gray-400 py-10 text-sm">No scan history yet.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {history.map((item) => (
                                                <div key={item._id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-bold text-sm text-gray-800">{item.productName}</h4>
                                                        <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className={`px-2 py-1 rounded text-xs font-bold ${item.overallRisk === 'HIGH' ? 'bg-red-100 text-red-600' :
                                                        item.overallRisk === 'MODERATE' ? 'bg-yellow-100 text-yellow-600' :
                                                            'bg-green-100 text-green-600'
                                                        }`}>
                                                        {item.overallRisk}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* Results View */
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Score Card */}
                        <div className={`p-6 rounded-3xl text-white shadow-xl ${result.analysis.color === 'red' ? 'bg-red-500' :
                            result.analysis.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold">{result.analysis.overallRisk} RISK</h2>
                                    <p className="opacity-90">{result.product.name}</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                                    <span className="text-3xl font-black">{result.analysis.score}</span>/10
                                </div>
                            </div>

                            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm text-sm">
                                {result.analysis.risks.length > 0 ? (
                                    <ul className="space-y-1">
                                        {result.analysis.risks.map((risk: any, i: number) => (
                                            <li key={i} className="flex gap-2 items-center">
                                                <AlertTriangle size={16} />
                                                <span>{risk.ingredient} ({risk.severity})</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="flex gap-2 items-center">
                                        <CheckCircle size={16} />
                                        <span>No harmful ingredients detected for your profile.</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Insight */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <span>🤖</span> AI Dietitian
                            </h3>
                            {/* Rendering markdown-like response safely or simply */}
                            <div className="prose prose-sm text-gray-600">
                                <div style={{ whiteSpace: 'pre-wrap' }}>{result.aiInsight.response}</div>
                            </div>
                        </div>

                        {/* Prompt Debug (Optional) */}
                        <details className="text-xs text-gray-400 mt-4">
                            <summary>View AI Prompt (Debug)</summary>
                            <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                                {result.aiInsight.prompt}
                            </pre>
                        </details>

                        <button
                            onClick={reset}
                            className="w-full py-4 text-gray-500 font-medium hover:text-gray-800"
                        >
                            Scan Another Item
                        </button>
                    </div>
                )}
            </main>

            {/* Camera Overlay */}
            {scanning && (
                <Scanner
                    onCapture={(img) => {
                        if (activeTab === 'barcode') {
                            // Demo barcode match
                            handleScan("123456");
                        } else {
                            // Real OCR Image
                            handleImageScan(img);
                        }
                    }}
                    onClose={() => setScanning(false)}
                />
            )}
        </div>
    );
}
