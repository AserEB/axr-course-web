'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { SITE_CONFIG, BANK_ACCOUNTS } from '@/lib/constants';
import { calculateUserDiscount } from '@/lib/discountEngine';
import {
    generateStudentCustomId,
    generateNumericUserId,
    validateEthiopianPhone,
    validateEmail,
    formatCurrency,
} from '@/lib/utils';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB Limit in bytes

function RegisterFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Form State
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

    // Form Input Fields
    const [fullName, setFullName] = useState('');
    const [gender, setGender] = useState<'Male' | 'Female'>('Male');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'CBE' | 'Telebirr'>('CBE');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [referredBy, setReferredBy] = useState<number | null>(null);

    // Completed State
    const [generatedCustomId, setGeneratedCustomId] = useState('');

    useEffect(() => {
        const refParam = searchParams.get('ref');
        if (refParam) {
            const cleanRef = refParam.replace('ref_', '').replace('AXR-STU-', '');
            if (!isNaN(Number(cleanRef))) {
                setReferredBy(Number(cleanRef));
            }
        }
    }, [searchParams]);

    const discountInfo = calculateUserDiscount(0, 0, SITE_CONFIG.courseFee);

    const handleCopyAccount = (accNumber: string) => {
        navigator.clipboard.writeText(accNumber);
        setCopiedAccount(accNumber);
        setTimeout(() => setCopiedAccount(null), 3000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                setErrorMessage('የመረጡት ፋይል መጠን ከ 2MB ይበልጣል። እባክዎ አነስ ያለ ፎቶ/PDF ይምረጡ።');
                setReceiptFile(null);
                e.target.value = '';
                return;
            }
            setErrorMessage('');
            setReceiptFile(file);
        }
    };

    const handleNextStep1 = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim() || fullName.trim().split(' ').length < 2) {
            setErrorMessage('እባክዎ ቢያንስ ሁለት ስም (ስም እና የአባት ስም) ያስገቡ።');
            return;
        }
        setErrorMessage('');
        setStep(2);
    };

    const handleNextStep2 = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateEthiopianPhone(phone)) {
            setErrorMessage('የተሳሳተ የስልክ ቁጥር ነው። እባክዎ በ 09... ወይም 07... ወይም +251... ያስገቡ።');
            return;
        }
        if (!validateEmail(email)) {
            setErrorMessage('እባክዎ ትክክለኛ ኢሜይል አድራሻ ያስገቡ።');
            return;
        }
        if (!password || password.length < 6) {
            setErrorMessage('የይለፍ ቃል ቢያንስ 6 አሃዝ/ፊደል መሆን አለበት።');
            return;
        }
        setErrorMessage('');
        setStep(3);
    };

    const handleNextStep3 = () => {
        setErrorMessage('');
        setStep(4);
    };

    const handleSubmitRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!receiptFile) {
            setErrorMessage('እባክዎ የክፍያ ማረጋገጫ ስክሪንሹት (Receipt Image) ይምረጡ።');
            return;
        }

        if (receiptFile.size > MAX_FILE_SIZE) {
            setErrorMessage('የመረጡት ፋይል መጠን ከ 2MB ይበልጣል።');
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            const fileExt = receiptFile.name.split('.').pop();
            const fileName = `${Date.now()}_receipt.${fileExt}`;
            const filePath = `receipts/${fileName}`;

            let publicReceiptUrl = '';

            // Upload file to Supabase Storage 'receipts' bucket
            try {
                const { error: uploadError } = await supabase.storage
                    .from('receipts')
                    .upload(filePath, receiptFile, {
                        cacheControl: '3600',
                        upsert: false,
                    });

                if (uploadError) {
                    console.warn('Storage upload error:', uploadError.message);
                    publicReceiptUrl = fileName;
                } else {
                    const { data: publicUrlData } = supabase.storage
                        .from('receipts')
                        .getPublicUrl(filePath);
                    publicReceiptUrl = publicUrlData.publicUrl;
                }
            } catch (uploadException) {
                console.warn('Storage fetch exception:', uploadException);
                publicReceiptUrl = fileName;
            }

            const numericUserId = generateNumericUserId();
            const customId = generateStudentCustomId();

            let currentRound = 2;
            const { data: settingsData } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'current_round')
                .single();
            if (settingsData && settingsData.value) {
                currentRound = parseInt(settingsData.value, 10);
            }

            const studentPayload = {
                user_id: numericUserId,
                student_custom_id: customId,
                username: email.split('@')[0],
                password_hash: password,
                full_name: fullName.trim(),
                gender,
                phone: phone.trim(),
                email: email.trim().toLowerCase(),
                payment_method: paymentMethod,
                screenshot_file_id: publicReceiptUrl,
                status: 'Pending',
                round: currentRound,
                referred_by: referredBy,
            };

            const { error: insertError } = await supabase
                .from('students')
                .insert([studentPayload]);

            if (insertError) {
                if (insertError.message.includes('email')) {
                    throw new Error('ይህ ኢሜይል አድራሻ ቀድሞ ተመዝግቧል። እባክዎ Login ያድርጉ።');
                }
                throw new Error(insertError.message);
            }

            localStorage.setItem('student_user_id', String(numericUserId));
            localStorage.setItem('student_custom_id', customId);

            setGeneratedCustomId(customId);
            setStep(5);
        } catch (err: unknown) {
            const error = err as Error;
            setErrorMessage(error.message || 'ምዝገባው አልተሳካም። እባክዎ ደግመው ይሞክሩ።');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16 animate-fade-in-up">
            <div className="mb-8 text-center space-y-3">
                <h1 className="text-2xl sm:text-4xl font-black text-slate-100">
                    የኮርስ ምዝገባ (Course Registration)
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                    {SITE_CONFIG.courseName} | 1 ወር ጥልቅ ስልጠና
                </p>

                {step <= 4 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                        {[1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                className={`h-2 rounded-full transition-all duration-300 ${s === step
                                    ? 'w-10 bg-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                                    : s < step
                                        ? 'w-6 bg-emerald-400'
                                        : 'w-6 bg-slate-800'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {errorMessage && (
                <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs font-semibold text-rose-300 backdrop-blur-md">
                    <svg className="h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
                <form onSubmit={handleNextStep1} className="glass-card-pro rounded-3xl p-6 sm:p-8 space-y-6 border-cyan-500/30">
                    <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-mono font-black text-cyan-400">
                            1
                        </span>
                        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                            ደረጃ 1፦ የግል መረጃ (Personal Info)
                        </h2>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                            ሙሉ ስም (Certificate ላይ የሚፃፍ) <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="ለምሳሌ፦ ብሩክ ጊርማ ሲዮም"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                            ጾታ (Gender)
                        </label>
                        <div className="mt-2 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setGender('Male')}
                                className={`rounded-xl border py-3 text-xs font-bold transition ${gender === 'Male'
                                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                                    }`}
                            >
                                Male (ወንድ)
                            </button>
                            <button
                                type="button"
                                onClick={() => setGender('Female')}
                                className={`rounded-xl border py-3 text-xs font-bold transition ${gender === 'Female'
                                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                                    }`}
                            >
                                Female (ሴት)
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 py-3.5 text-sm font-black text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.25)] transition hover:scale-[1.01]"
                    >
                        <span>ቀጥል (Next)</span>
                        <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </button>
                </form>
            )}

            {/* STEP 2 */}
            {step === 2 && (
                <form onSubmit={handleNextStep2} className="glass-card-pro rounded-3xl p-6 sm:p-8 space-y-6 border-cyan-500/30">
                    <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-mono font-black text-cyan-400">
                            2
                        </span>
                        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                            ደረጃ 2፦ የመገናኛ መረጃ እና Password
                        </h2>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                            የስልክ ቁጥር <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="tel"
                            required
                            placeholder="09... ወይም 07... ወይም +251..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                            ኢሜይል አድራሻ (Email Address) <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="example@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                            የዌብሳይት መግቢያ ሚስጥራዊ ቁጥር (Password) <span className="text-rose-400">*</span>
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="ቢያንስ 6 አሃዝ/ፊደል"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-1/3 rounded-xl border border-slate-800 bg-slate-950 py-3.5 text-xs font-bold text-slate-300 hover:bg-slate-900 transition"
                        >
                            ተመለስ
                        </button>
                        <button
                            type="submit"
                            className="flex w-2/3 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 py-3.5 text-sm font-black text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.25)] transition hover:scale-[1.01]"
                        >
                            <span>ቀጥል (Next)</span>
                            <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </button>
                    </div>
                </form>
            )}

            {/* STEP 3 */}
            {step === 3 && (
                <div className="glass-card-pro rounded-3xl p-6 sm:p-8 space-y-6 border-cyan-500/30">
                    <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-mono font-black text-cyan-400">
                            3
                        </span>
                        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                            ደረጃ 3፦ የክፍያ መመሪያ (Payment Details)
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('CBE')}
                            className={`rounded-2xl border p-4 text-left transition ${paymentMethod === 'CBE'
                                ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                                : 'border-slate-800 bg-slate-950 text-slate-400'
                                }`}
                        >
                            <p className="font-extrabold text-sm text-slate-100">የንግድ ባንክ (CBE)</p>
                            <p className="mt-1 text-[10px] text-slate-400 font-mono">Commercial Bank of Ethiopia</p>
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('Telebirr')}
                            className={`rounded-2xl border p-4 text-left transition ${paymentMethod === 'Telebirr'
                                ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                                : 'border-slate-800 bg-slate-950 text-slate-400'
                                }`}
                        >
                            <p className="font-extrabold text-sm text-slate-100">ቴሌብር (Telebirr)</p>
                            <p className="mt-1 text-[10px] text-slate-400 font-mono">Telebirr SuperApp / USSD</p>
                        </button>
                    </div>

                    {paymentMethod === 'CBE' ? (
                        <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/90 p-5 space-y-3">
                            <p className="text-[10px] font-bold font-mono text-cyan-400 uppercase tracking-wider">
                                Commercial Bank of Ethiopia Account
                            </p>
                            <div className="flex items-center justify-between font-mono text-base sm:text-lg font-black text-slate-100">
                                <span>{BANK_ACCOUNTS.CBE.accountNumber}</span>
                                <button
                                    type="button"
                                    onClick={() => handleCopyAccount(BANK_ACCOUNTS.CBE.accountNumber)}
                                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-cyan-400 transition hover:bg-cyan-950 hover:text-cyan-300"
                                >
                                    {copiedAccount === BANK_ACCOUNTS.CBE.accountNumber ? 'Copied!' : 'Copy Number'}
                                </button>
                            </div>
                            <p className="text-xs text-slate-400">
                                Account Holder: <b className="text-slate-200">{BANK_ACCOUNTS.CBE.accountHolder}</b>
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/90 p-5 space-y-3">
                            <p className="text-[10px] font-bold font-mono text-cyan-400 uppercase tracking-wider">
                                Telebirr Account Number
                            </p>
                            <div className="flex items-center justify-between font-mono text-base sm:text-lg font-black text-slate-100">
                                <span>{BANK_ACCOUNTS.Telebirr.accountNumber}</span>
                                <button
                                    type="button"
                                    onClick={() => handleCopyAccount(BANK_ACCOUNTS.Telebirr.accountNumber)}
                                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-cyan-400 transition hover:bg-cyan-950 hover:text-cyan-300"
                                >
                                    {copiedAccount === BANK_ACCOUNTS.Telebirr.accountNumber ? 'Copied!' : 'Copy Number'}
                                </button>
                            </div>
                            <p className="text-xs text-slate-400">
                                Account Holder: <b className="text-slate-200">{BANK_ACCOUNTS.Telebirr.accountHolder}</b>
                            </p>
                        </div>
                    )}

                    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 flex justify-between items-center text-xs font-mono">
                        <span className="text-slate-400">የሚከፍሉት ትክክለኛ መጠን፦</span>
                        <span className="text-base font-extrabold text-emerald-400">{formatCurrency(discountInfo.finalFee)}</span>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            className="w-1/3 rounded-xl border border-slate-800 bg-slate-950 py-3.5 text-xs font-bold text-slate-300 hover:bg-slate-900 transition"
                        >
                            ተመለስ
                        </button>
                        <button
                            type="button"
                            onClick={handleNextStep3}
                            className="flex w-2/3 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 py-3.5 text-sm font-black text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.25)] transition hover:scale-[1.01]"
                        >
                            <span>ክፍያ ፈጽሜአለሁ</span>
                            <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
                <form onSubmit={handleSubmitRegistration} className="glass-card-pro rounded-3xl p-6 sm:p-8 space-y-6 border-cyan-500/30">
                    <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-mono font-black text-cyan-400">
                            4
                        </span>
                        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                            ደረጃ 4፦ የክፍያ ማረጋገጫ መስቀል (Upload Receipt)
                        </h2>
                    </div>

                    <div className="rounded-2xl border-2 border-dashed border-cyan-500/30 bg-slate-950/80 p-6 text-center hover:border-cyan-400 transition">
                        <input
                            type="file"
                            accept="image/*,.pdf"
                            required
                            onChange={handleFileChange}
                            className="hidden"
                            id="receipt-upload"
                        />
                        <label htmlFor="receipt-upload" className="cursor-pointer block space-y-2">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-950/30 text-cyan-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-slate-200">
                                {receiptFile ? `የተመረጠ ፋይል፦ ${receiptFile.name}` : 'የክፍያ ማረጋገጫ ፎቶ (Receipt Screenshot) ይምረጡ'}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">PNG, JPG, JPEG, or PDF (Max 2MB)</p>
                        </label>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setStep(3)}
                            disabled={loading}
                            className="w-1/3 rounded-xl border border-slate-800 bg-slate-950 py-3.5 text-xs font-bold text-slate-300 hover:bg-slate-900 transition disabled:opacity-50"
                        >
                            ተመለስ
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-2/3 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 py-3.5 text-xs font-black text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.25)] transition hover:scale-[1.01] disabled:opacity-50"
                        >
                            <span>{loading ? 'እየተላከ ነው...' : 'ምዝገባውን አጠናቅቅ'}</span>
                            {!loading && (
                                <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {/* STEP 5 */}
            {step === 5 && (
                <div className="glass-card-pro rounded-3xl p-8 sm:p-12 text-center space-y-6 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.15)] animate-fade-in-up">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                        <svg className="h-8 w-8 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-slate-100">
                        ምዝገባዎ በተሳካ ሁኔታ ተጠናቋል!
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                        የክፍያ መረጃዎ ለአድሚኖች ተልኳል። በ 30 ደቂቃ ውስጥ ተረጋግጦ የኮርሱ መግቢያ ሊንክ በኢሜይልዎ እና በዳሽቦርድዎ የሚላክ ይሆናል።
                    </p>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-6 space-y-2">
                        <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">
                            የእርስዎ ልዩ የተማሪ መታወቂያ (Unique Student ID)
                        </span>
                        <p className="font-mono text-2xl sm:text-3xl font-black text-cyan-400 tracking-wider">
                            {generatedCustomId}
                        </p>
                        <p className="text-[11px] text-slate-400">ይህንን ID ለክትትል እና ለሰርተፊኬት ማረጋገጫ ይጠቀሙበት።</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.push('/student/dashboard')}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 py-3.5 text-xs font-black text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.25)] transition hover:scale-[1.01]"
                    >
                        <span>ወደ ተማሪ ዳሽቦርድ ሂድ (Go to Dashboard)</span>
                        <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </button>
                </div>
            )}

            <p className="mt-8 text-center text-xs text-slate-400">
                አካውንት አለዎት?{' '}
                <Link href="/login" className="font-bold text-cyan-400 hover:underline">
                    Student Login
                </Link>
            </p>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense
            fallback={
                <div className="mx-auto max-w-2xl px-4 py-20 text-center animate-fade-in-up">
                    <div className="glass-card-pro rounded-3xl p-8 space-y-3">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                        <p className="text-xs font-mono font-bold text-cyan-400 uppercase">
                            መረጃው እየተጫነ ነው...
                        </p>
                    </div>
                </div>
            }
        >
            <RegisterFormContent />
        </Suspense>
    );
}