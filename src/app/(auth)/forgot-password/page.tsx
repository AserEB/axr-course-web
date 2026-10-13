'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<1 | 2>(1);
    const [identifier, setIdentifier] = useState('');
    const [studentData, setStudentData] = useState<{ id: number; email: string; full_name: string; student_custom_id: string } | null>(null);

    // OTP & Reset Password State (7ኛ)
    const [generatedOtp, setGeneratedOtp] = useState<string>('');
    const [inputOtp, setInputOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Step 1: Verify Student Record and Generate Reset OTP Code
    const handleVerifyStudent = async (e: React.FormEvent) => {
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

            // Search student record by Custom ID or Email in students table
            const { data, error } = await supabase
                .from('students')
                .select('user_id, email, full_name, student_custom_id')
                .or(`student_custom_id.ilike.${cleanInput},email.ilike.${cleanInput}`)
                .maybeSingle();

            if (error || !data) {
                throw new Error('በዚህ መረጃ የተመዘገበ ተማሪ አልተገኘም። እባክዎ ID ወይም ኢሜይልዎን በትክክል ያረጋግጡ።');
            }

            // Generate 6-Digit Verification Code
            const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(randomCode);
            setStudentData({
                id: data.user_id,
                email: data.email,
                full_name: data.full_name,
                student_custom_id: data.student_custom_id,
            });

            setSuccessMsg(`የማረጋገጫ ቁጥር (OTP Code) ለ ተማሪ ${data.full_name} ተዘጋጅቷል።`);
            setStep(2);
        } catch (err: unknown) {
            const error = err as Error;
            setErrorMsg(error.message || 'ጥያቄውን ማስተላለፍ አልተቻለም። እባክዎ ደግመው ይሞክሩ።');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Confirm OTP & Update Password in DB
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (inputOtp.trim() !== generatedOtp) {
            setErrorMsg('የስህተት ማረጋገጫ ቁጥር (Incorrect OTP Code)! እባክዎ በትክክል ያስገቡ።');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMsg('አዲሱ Password እና ማረጋገጫው አይመሳሰሉም!');
            return;
        }

        if (newPassword.length < 6) {
            setErrorMsg('Password ቢያንስ 6 አሃዝ/ፊደል መሆን አለበት።');
            return;
        }

        if (!studentData) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('students')
                .update({ password_hash: newPassword.trim() })
                .eq('user_id', studentData.id);

            if (error) throw new Error(error.message);

            setSuccessMsg('የይለፍ ቃልዎ (Password) በተሳካ ሁኔታ ተቀይሯል! አሁን መግባት ይችላሉ።');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } catch (err: unknown) {
            const error = err as Error;
            setErrorMsg(error.message || 'Password መቀየር አልተቻለም።');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-md px-4 py-12 sm:py-20 animate-fade-in-up bg-slate-950 min-h-screen text-slate-100">
            <div className="glass-card-pro rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-cyan-500/30 bg-slate-900 shadow-[0_0_40px_rgba(56,189,248,0.1)]">

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

                {/* STEP 1: VERIFY STUDENT */}
                {step === 1 && (
                    <form onSubmit={handleVerifyStudent} className="mt-6 space-y-5">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                                Student ID / Email Address
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. AXR-STU-8821 or email"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 py-3.5 text-sm font-black text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.25)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                        >
                            <span>{loading ? 'ማረጋገጫ በመፈለግ ላይ...' : 'Verify Student Record'}</span>
                            {!loading && (
                                <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            )}
                        </button>
                    </form>
                )}

                {/* STEP 2: ENTER OTP CODE & NEW PASSWORD */}
                {step === 2 && studentData && (
                    <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/40 p-3.5 text-center space-y-1">
                            <p className="text-[10px] font-mono font-bold uppercase text-indigo-300">የእርስዎ ማረጋገጫ ቁጥር (OTP Code)፦</p>
                            <p className="text-2xl font-black font-mono tracking-widest text-cyan-300">{generatedOtp}</p>
                            <p className="text-[10px] text-slate-400">ይህንን 6-አሃዝ ቁጥር ከታች ባለው ሳጥን ያስገቡ።</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                                6-Digit OTP Code
                            </label>
                            <input
                                type="text"
                                required
                                maxLength={6}
                                placeholder="******"
                                value={inputOtp}
                                onChange={(e) => setInputOtp(e.target.value)}
                                className="mt-1.5 w-full font-mono text-center tracking-widest text-base rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-slate-100 focus:border-cyan-400 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                                አዲስ Password
                            </label>
                            <input
                                type="password"
                                required
                                placeholder="ቢያንስ 6 አሃዝ/ፊደል"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                                አዲሱን Password ያረጋግጡ
                            </label>
                            <input
                                type="password"
                                required
                                placeholder="በድጋሚ ያስገቡ"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-1/3 rounded-xl border border-slate-800 bg-slate-950 py-3 text-xs font-bold text-slate-300 hover:bg-slate-900 transition"
                            >
                                ተመለስ
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-2/3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 py-3 text-xs font-black text-slate-950 hover:scale-[1.01] transition disabled:opacity-50"
                            >
                                {loading ? 'በማዘመን ላይ...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                )}

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