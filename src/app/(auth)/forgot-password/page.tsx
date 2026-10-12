'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function ForgotPasswordPage() {
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim()) {
            setErrorMsg('እባክዎ Student ID ወይም የተመዘገበ ኢሜይል አድራሻ ያስገቡ።');
            return;
        }

        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const cleanInput = identifier.trim().toLowerCase();

            // Search student record by Custom ID or Email
            const { data, error } = await supabase
                .from('students')
                .select('email, full_name, student_custom_id')
                .or(`student_custom_id.ilike.${cleanInput},email.ilike.${cleanInput}`)
                .maybeSingle();

            if (error || !data) {
                throw new Error('በዚህ መረጃ የተመዘገበ ተማሪ አልተገኘም። እባክዎ መረጃዎን በትክክል ያረጋግጡ።');
            }

            if (data.email) {
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
                    redirectTo: `${window.location.origin}/login`,
                });

                if (resetError) {
                    setSuccessMsg(
                        `የይለፍ ቃል ማስተካከያ ጥያቄዎ ለተማሪ መታወቂያ ${data.student_custom_id || data.full_name} ተመዝግቧል። እባክዎ በቴሌግራም ወይም በስልክ ደጋፊ ቡድናችንን ያግኙ።`
                    );
                } else {
                    setSuccessMsg(`የይለፍ ቃል ማስተካከያ ሊንክ ወደ ${data.email} ተልኳል። እባክዎ ኢሜይልዎን ያረጋግጡ።`);
                }
            }
        } catch (err: unknown) {
            const error = err as Error;
            setErrorMsg(error.message || 'ጥያቄውን ማስተላለፍ አልተቻለም። እባክዎ ደግመው ይሞክሩ።');
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black text-slate-100 sm:text-3xl">Forgot Password</h1>
                    <p className="text-xs text-slate-400">የተሳሳተ ወይም የተረሳ የይለፍ ቃል ለመቀየር መረጃዎን ያስገቡ</p>
                </div>

                {/* Success Alert */}
                {successMsg && (
                    <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-300 backdrop-blur-md">
                        <svg className="h-4 w-4 shrink-0 text-emerald-400 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* Error Alert */}
                {errorMsg && (
                    <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs font-semibold text-rose-300 backdrop-blur-md">
                        <svg className="h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleResetRequest} className="mt-6 space-y-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                            Student ID / Email Address
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 py-3.5 text-sm font-black text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.25)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] disabled:opacity-50"
                    >
                        <span>{loading ? 'እየተላከ ነው...' : 'Reset Password'}</span>
                        {!loading && (
                            <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        )}
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs">
                    <Link href="/login" className="font-bold text-cyan-400 hover:underline">
                        Back to Sign In
                    </Link>
                    <Link href="/register" className="font-semibold text-slate-400 hover:text-slate-200">
                        Register New Account
                    </Link>
                </div>

            </div>
        </div>
    );
}