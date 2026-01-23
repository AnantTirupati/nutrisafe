"use client";
import React, { useState, useEffect } from 'react';
import { User, LogOut, Activity, Phone, Mail, Edit2, X, Check, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../services/api';

const DISEASES = ['Diabetes', 'Hypertension', 'Celiac', 'Lactose Intolerance', 'Heart Disease', 'Kidney Disease', 'Thyroid'];

export default function UserProfile() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Edit Form State
    const [formData, setFormData] = useState<any>({
        name: '',
        profile: {
            diseases: [],
            allergies: [],
            age: '',
            weight: ''
        }
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            // Initialize form data
            setFormData({
                name: parsed.name,
                profile: parsed.profile || { diseases: [], allergies: [], age: '', weight: '' }
            });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth/login');
    };

    const toggleDisease = (disease: string) => {
        const current = formData.profile.diseases || [];
        if (current.includes(disease)) {
            setFormData({
                ...formData,
                profile: { ...formData.profile, diseases: current.filter((d: string) => d !== disease) }
            });
        } else {
            setFormData({
                ...formData,
                profile: { ...formData.profile, diseases: [...current, disease] }
            });
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const { data } = await authAPI.updateProfile(formData);
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            setIsEditing(false);
        } catch (error) {
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white/10 hover:bg-black/5 p-2 rounded-full transition-all"
            >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                </span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>

                    <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200 cursor-default">

                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                            {!isEditing ? (
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg font-bold shrink-0">
                                        {user.name?.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="font-bold text-gray-900 truncate">{user.name}</h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                            {user.email ? <><Mail size={10} /> {user.email}</> : <><Phone size={10} /> {user.phone}</>}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full">
                                    <label className="text-xs font-bold text-gray-500 uppercase">My Name</label>
                                    <input
                                        type="text"
                                        className="w-full text-lg font-bold border-b border-gray-300 focus:border-blue-500 outline-none pb-1"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            )}

                            {/* Edit Toggle */}
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="text-gray-400 hover:text-blue-600 p-1"
                            >
                                {isEditing ? <X size={18} /> : <Edit2 size={16} />}
                            </button>
                        </div>

                        {/* Body */}
                        <div className="mb-4 space-y-4 max-h-[60vh] overflow-y-auto pr-1">

                            {/* DISEASES SECTION */}
                            <div>
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">My Conditions</h4>
                                {isEditing ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            {DISEASES.map(d => (
                                                <button
                                                    key={d}
                                                    onClick={() => toggleDisease(d)}
                                                    className={`text-[10px] px-2 py-1.5 rounded border text-left flex items-center gap-1 transition-all ${formData.profile?.diseases?.includes(d)
                                                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                                                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {formData.profile?.diseases?.includes(d) && <Check size={8} />} {d}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Custom Input */}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Add other (e.g. Peanut Allergy)"
                                                className="flex-1 text-xs border-b border-gray-300 focus:border-blue-500 outline-none py-1"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const val = e.currentTarget.value.trim();
                                                        if (val && !formData.profile.diseases.includes(val)) {
                                                            setFormData({
                                                                ...formData,
                                                                profile: { ...formData.profile, diseases: [...formData.profile.diseases, val] }
                                                            });
                                                            e.currentTarget.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>

                                        {/* Chip List for Custom/Selected */}
                                        <div className="flex flex-wrap gap-1">
                                            {formData.profile.diseases.filter((d: string) => !DISEASES.includes(d)).map((d: string) => (
                                                <span key={d} className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] rounded-full border border-purple-100 flex items-center gap-1">
                                                    {d}
                                                    <button onClick={() => toggleDisease(d)}><X size={10} /></button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {user.profile?.diseases?.length > 0 ? (
                                            user.profile.diseases.map((d: string) => (
                                                <span key={d} className={`px-2 py-1 text-xs rounded-md font-medium border flex items-center gap-1 ${DISEASES.includes(d) ? 'bg-red-50 text-red-600 border-red-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                                                    <Activity size={10} /> {d}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">No conditions explicitly listed.</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* STATS SECTION (Age/Weight) */}
                            {isEditing && (
                                <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded-lg">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400">Age</label>
                                        <input
                                            type="number"
                                            className="w-full text-sm font-bold bg-transparent border-b border-gray-300 outline-none"
                                            value={formData.profile?.age || ''}
                                            onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, age: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400">Weight (kg)</label>
                                        <input
                                            type="number"
                                            className="w-full text-sm font-bold bg-transparent border-b border-gray-300 outline-none"
                                            value={formData.profile?.weight || ''}
                                            onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, weight: e.target.value } })}
                                        />
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Actions */}
                        {isEditing ? (
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                            >
                                {loading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                            </button>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut size={16} /> Sign Out
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
