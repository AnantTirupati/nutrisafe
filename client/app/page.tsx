import Link from 'next/link';
import { ShieldCheck, Scan, HeartPulse } from 'lucide-react';

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-blue-50 to-white">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-blue-300 shadow-xl">
                    <ShieldCheck className="text-white" size={40} />
                </div>
                <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-green-600 mb-4">
                    NutriSafe
                </h1>
                <p className="text-lg text-gray-600 max-w-lg mb-8">
                    Your Personal Food Safety Assistant.
                    Scan ingredients, detect risks based on <b>your</b> health, and get AI-powered diet advice in seconds.
                </p>

                <div className="flex gap-4">
                    <Link href="/auth/login" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition shadow-lg">
                        Get Started
                    </Link>
                    <Link href="/scan" className="px-8 py-3 bg-white text-blue-600 font-bold rounded-full border border-blue-200 hover:bg-blue-50 transition shadow-sm">
                        Try Demo Scan
                    </Link>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl text-left">
                    <FeatureCard
                        icon={<Scan className="text-blue-500" />}
                        title="Instant Scan"
                        desc="Barcode or OCR scanning to instantly analyze food labels."
                    />
                    <FeatureCard
                        icon={<ShieldCheck className="text-green-500" />}
                        title="Personalized Risk"
                        desc="Checks against your specific diseases (Diabetes, BP, Allergies)."
                    />
                    <FeatureCard
                        icon={<HeartPulse className="text-red-500" />}
                        title="AI Advice"
                        desc="Get simple, rapid advice on alternatives and portion sizes."
                    />
                </div>
            </section>

            <footer className="p-6 text-center text-gray-400 text-sm">
                <p>© 2024 NutriSafe AI. Not Medical Advice.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: any) {
    return (
        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <div className="mb-3">{icon}</div>
            <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
            <p className="text-gray-500 text-sm">{desc}</p>
        </div>
    );
}
