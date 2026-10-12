'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
    const router = useRouter();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim() || !password) {
            setErrorMessage('እባክዎ Student ID / Email እና Password ያስገቡ።');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            const cleanInput = identifier.trim().toLowerCase();

            // Search student by Custom ID (AXR-STU-...) or Email or Phone
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .or(`student_custom_id.ilike.${cleanInput},email.ilike.${cleanInput},phone.eq.${cleanInput}`)
                .single();

            if (error || !data) {
                throw new Error('ተማሪው አልተገኘም። እባክዎ Student ID ወይም Email በትክክል መጻፉን ያረጋግጡ።');
            }

            // Verify password
            if (data.password_hash !== password) {
                throw new Error('የተሳሳተ የይለፍ ቃል (Password) ነው ያስገቡት።');
            }

            // Store student session locally
            localStorage.setItem('student_user_id', String(data.user_id));
            localStorage.setItem('student_custom_id', data.student_custom_id || '');

            router.push('/student/dashboard');
        } catch (err: unknown) {
            const error = err as Error;
            setErrorMessage(error.message || 'መግባት አልተቻለም። እባክዎ ደግመው ይሞክሩ።');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-md px-4 py-12 sm:py-20 animate-fade-in-up">
            <div className="glass-card-pro rounded-3xl p-6 sm:p-8 relative overflow-hidden border-cyan-500/30">

                {/* Header Icon & Title */}
                <div className="text-center space-y-3">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black text-slate-100 sm:text-3xl">Student Login</h1>
                    <p className="text-xs text-slate-400">ወደ ተማሪዎች ፖርታል ለመግባት መረጃዎን ያስገቡ</p>
                </div>

                {/* Error Alert */}
                {errorMessage && (
                    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs font-medium text-rose-300 backdrop-blur-md">
                        <svg className="h-5 w-5 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleLogin} className="mt-6 space-y-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                            Student ID / Email / Phone
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. AXR-STU-8821 or Email"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                                Password
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline transition"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 py-3.5 text-sm font-black text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.25)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] disabled:opacity-50"
                    >
                        <span>{loading ? 'እየገባ ነው...' : 'Sign In'}</span>
                        {!loading && (
                            <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-slate-400">
                    አዲስ ተማሪ ነዎት?{' '}
                    <Link href="/register" className="font-bold text-cyan-400 hover:underline">
                        Register Now
                    </Link>
                </p>

            </div>
        </div>
    );
}