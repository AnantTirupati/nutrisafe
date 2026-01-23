"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../../../services/api';
import Link from 'next/link';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        loginRequest(email, password);
    };

    const loginRequest = async (emailVal: string, passVal: string) => {
        setLoading(true);
        try {
            // Determine if input is phone or email roughly
            const isPhone = /^\+?[0-9\s-]{7,15}$/.test(emailVal) && !emailVal.includes('@');
            const payload = isPhone ? { phone: emailVal, password: passVal } : { email: emailVal, password: passVal };

            // For real login
            const { data } = await authAPI.login(payload);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            router.push('/scan');
        } catch (err) {
            alert('Login Failed. Check credentials.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const demoLogin = async () => {
        setLoading(true);
        try {
            try {
                const { data } = await authAPI.login({ email: 'demo@user.com', password: 'password123' });
                localStorage.setItem('token', data.token);
                router.push('/scan');
            } catch (e) {
                // If login fails, try register
                const userProfile = {
                    name: "Demo User",
                    email: "demo@user.com",
                    password: "password123",
                    profile: {
                        diseases: ["Diabetes", "Hypertension"],
                        allergies: ["Peanuts"],
                        age: 30,
                        weight: 70
                    }
                };
                const { data } = await authAPI.register(userProfile);
                localStorage.setItem('token', data.token);
                router.push('/scan');
            }
        } catch (err: any) {
            alert("Demo Login Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-center mb-6">Welcome Back</h2>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email or Phone</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
                    >
                        {loading ? 'Processing...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 flex flex-col gap-3">
                    <button
                        onClick={demoLogin}
                        className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition"
                    >
                        Start Demo Mode (Diabetes Profile)
                    </button>

                    <div className="flex items-center gap-2 my-2">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className="text-gray-400 text-sm">Or</span>
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
                                        localStorage.setItem('user', JSON.stringify(data));
                                        router.push('/scan');
                                    } catch (err: any) {
                                        alert("Google Login Failed: " + (err.response?.data?.message || err.message));
                                    } finally {
                                        setLoading(false);
                                    }
                                }
                            }}
                            onError={() => {
                                console.log('Login Failed');
                            }}
                        />
                    </div>
                </div>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Don't have an account? <Link href="/auth/register" className="text-blue-600 font-bold">Sign up</Link>
                </p>
            </div>
        </div>
    );
}
