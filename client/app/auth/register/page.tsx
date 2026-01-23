"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../../../services/api';
import Link from 'next/link';
import { Mail, Phone, Activity, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const DISEASES = ['Diabetes', 'Hypertension', 'Celiac', 'Lactose Intolerance', 'Heart Disease', 'Kidney Disease', 'Thyroid'];

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [method, setMethod] = useState<'email' | 'phone'>('email');

    const [formData, setFormData] = useState<any>({
        name: '',
        email: '',
        phone: '',
        password: '',
        profile: {
            diseases: [],
            allergies: [],
            age: '',
            weight: ''
        }
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProfileChange = (field: string, value: any) => {
        setFormData({
            ...formData,
            profile: { ...formData.profile, [field]: value }
        });
    };

    const toggleDisease = (disease: string) => {
        const current = formData.profile.diseases;
        if (current.includes(disease)) {
            handleProfileChange('diseases', current.filter((d: string) => d !== disease));
        } else {
            handleProfileChange('diseases', [...current, disease]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                password: formData.password,
                ...(method === 'email' ? { email: formData.email } : { phone: formData.phone }),
                profile: {
                    ...formData.profile,
                    age: Number(formData.profile.age),
                    weight: Number(formData.profile.weight)
                }
            };

            const { data } = await authAPI.register(payload);
            localStorage.setItem('token', data.token);
            router.push('/scan');
        } catch (err: any) {
            alert("Registration Failed: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>
                <p className="text-gray-500 text-center mb-6">Step {step} of 2: {step === 1 ? 'Details' : 'Health Profile'}</p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* STEP 1: BASIC INFO */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
                            {/* Method Toggle */}
                            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                                <button
                                    type="button"
                                    onClick={() => setMethod('email')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${method === 'email' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                                >
                                    <Mail size={16} /> Email
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMethod('phone')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${method === 'phone' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                                >
                                    <Phone size={16} /> Phone
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" name="name" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={handleChange} />
                            </div>

                            {method === 'email' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input type="email" name="email" required={step === 1} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email} onChange={handleChange} />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input type="tel" name="phone" required={step === 1} placeholder="+1 234 567 8900" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.phone} onChange={handleChange} />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input type="password" name="password" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.password} onChange={handleChange} />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                >
                                    Next: Health Profile <ArrowRight size={18} />
                                </button>
                            </div>

                            <div className="my-6 flex items-center gap-2">
                                <div className="h-px bg-gray-200 flex-1"></div>
                                <span className="text-gray-400 text-sm">Or continue with</span>
                                <div className="h-px bg-gray-200 flex-1"></div>
                            </div>

                            <div className="flex justify-center w-full">
                                <GoogleLogin
                                    onSuccess={async (credentialResponse) => {
                                        if (credentialResponse.credential) {
                                            setLoading(true);
                                            try {
                                                const { data } = await authAPI.googleLogin(credentialResponse.credential);
                                                localStorage.setItem('token', data.token);
                                                router.push('/scan');
                                            } catch (err: any) {
                                                alert("Google Signup Failed: " + (err.response?.data?.message || err.message));
                                            } finally {
                                                setLoading(false);
                                            }
                                        }
                                    }}
                                    onError={() => {
                                        console.log('Signup Failed');
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 2: HEALTH PROFILE */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Conditions</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {DISEASES.map(d => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => toggleDisease(d)}
                                            className={`text-xs px-3 py-2 rounded-lg border transition-all text-left flex items-center gap-2 ${formData.profile.diseases.includes(d)
                                                ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Activity size={12} /> {d}
                                        </button>
                                    ))}
                                </div>

                                {/* Custom Input & Chips */}
                                <div className="mt-3">
                                    <input
                                        type="text"
                                        placeholder="Add other (e.g. Peanut Allergy) & Press Enter"
                                        className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const val = e.currentTarget.value.trim();
                                                if (val && !formData.profile.diseases.includes(val)) {
                                                    toggleDisease(val);
                                                    e.currentTarget.value = '';
                                                }
                                            }
                                        }}
                                    />
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.profile.diseases.filter((d: string) => !DISEASES.includes(d)).map((d: string) => (
                                            <span key={d} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-100 flex items-center gap-1 font-medium">
                                                {d}
                                                <button type="button" onClick={() => toggleDisease(d)}><X size={12} /></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 30"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.profile.age}
                                    onChange={(e) => handleProfileChange('age', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) - Optional</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 70"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.profile.weight}
                                    onChange={(e) => handleProfileChange('weight', e.target.value)}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-4 py-3 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition"
                                >
                                    {loading ? 'Creating Account...' : 'Complete Signup'}
                                </button>
                            </div>
                        </div>
                    )}

                </form>

                {step === 1 && (
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Already have an account? <Link href="/auth/login" className="text-blue-600 font-bold">Login</Link>
                    </p>
                )}
            </div>
        </div>
    );
}
