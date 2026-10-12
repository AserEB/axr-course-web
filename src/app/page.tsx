'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import VideoModal from '@/components/VideoModal';
import { calculateUserDiscount } from '@/lib/discountEngine';
import { SITE_CONFIG } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

export default function HomePage() {
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [inviteCount, setInviteCount] = useState(2);

    // Typewriter Animation Logic
    const fullText = "Master AI & Prompt Engineering";
    const [typedText, setTypedText] = useState('');
    const [isTypingComplete, setIsTypingComplete] = useState(false);

    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            if (index <= fullText.length) {
                setTypedText(fullText.slice(0, index));
                index++;
            } else {
                setIsTypingComplete(true);
                clearInterval(timer);
            }
        }, 65);

        return () => clearInterval(timer);
    }, []);

    const discountInfo = calculateUserDiscount(inviteCount, inviteCount, SITE_CONFIG.courseFee);
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const faqs = [
        {
            q: 'ይህ ኮርስ ለማን የተዘጋጀ ነው? የቀደመ የ IT ወይም Coding እውቀት ያስፈልጋል?',
            a: 'አያስፈልግም! ኮርሱ ከዜሮ ጀምሮ ለተማሪዎች፣ ለተመራቂዎች፣ ለፍሪላንሰሮች እና ስራቸውን በ AI ማፍጠን ለሚፈልጉ በሙሉ የተዘጋጀ ነው። ምንም አይነት የኮዲንግ እውቀት አይጠይቅም።',
        },
        {
            q: 'የክፍያ ቅናሽ በ Referral/Coins እንዴት ማግኘት እችላለሁ?',
            a: 'ከተመዘገቡ በኋላ የሚሰጥዎትን የራሶትን መጋበዣ ሊንክ ለጓደኞችዎ ሲያጋሩ እና እነሱ ሲመዘገቡ ለእያንዳንዱ ተጋባዥ 1 Coin (10% Discount) ያገኛሉ። 10 ሰዎችን በመጋበዝ ኮርሱን 100% በነፃ መማር ይችላሉ!',
        },
        {
            q: 'ትምህርቱ በምን መልኩ ነው የሚሰጠው?',
            a: 'ትምህርቱ በተግባራዊ የቪዲዮ ትምህርቶች፣ የቀጥታ (Live) የጥያቄና መልስ ሰለጣናዎች እና በየሳምንቱ በሚሰጡ Assignmentዎች በቅንጅት የሚሰጥ ነው።',
        },
        {
            q: 'ሰርተፊኬት የሚሰጠው እንዴት ነው?',
            a: 'ኮርሱን እና የሳምንቱን ፕሮጀክቶች አጠናቀው ሲጨርሱ በዌብሳይቱ ላይ Verify የሚደረግ እና በ HD ጥራት የሚወርድ ዲጂታል ሰርተፊኬት ይደርስዎታል።',
        },
    ];

    return (
        <div className="space-y-16 sm:space-y-24 pb-16">

            {/* 1. HERO SECTION */}
            <section className="relative pt-6 lg:pt-14 animate-fade-in-up">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">

                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-500/30 bg-slate-900/90 px-4 py-1.5 backdrop-blur-xl shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                        <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                        <span className="text-[11px] font-bold tracking-widest text-cyan-300 uppercase font-mono sm:text-xs">
                            Round {SITE_CONFIG.currentRound} Registration Is Live
                        </span>
                    </div>

                    {/* Typewriter Main Title */}
                    <div className="min-h-[100px] sm:min-h-[140px] flex items-center justify-center">
                        <h1 className="max-w-4xl text-3xl font-black tracking-tight text-slate-100 sm:text-5xl lg:text-6xl leading-[1.2]">
                            <span className="bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-500 bg-clip-text text-transparent">
                                {typedText}
                            </span>
                            {!isTypingComplete && (
                                <span className="inline-block w-1 h-8 sm:h-12 ml-1 bg-cyan-400 animate-cursor align-middle" />
                            )}
                        </h1>
                    </div>

                    <p className="mx-auto max-w-2xl text-xs sm:text-base text-slate-300 leading-relaxed px-2">
                        በአዲሱ የ AI ዘመን ትልቅ እና ውድ ሁነቱን AIን በትክክል የማዘዝ እና የማሰራራት ጥበብ በ 1 ወር ውስጥ ይማሩ! ከሀገር ውስጥ እና ከዓለም አቀፍ የ Remote AI ስራዎች ጋር ይገናኙ።
                    </p>

                    {/* Action CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                        <Link
                            href="/register"
                            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 px-8 py-3.5 text-sm font-black text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(56,189,248,0.5)] active:scale-95"
                        >
                            <span>Enroll Now</span>
                            <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>

                        <button
                            type="button"
                            onClick={() => setIsVideoOpen(true)}
                            className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl border border-cyan-500/30 bg-slate-900/90 px-6 py-3.5 text-sm font-bold text-slate-200 backdrop-blur-xl transition hover:border-cyan-400 hover:bg-slate-800 hover:text-cyan-400"
                        >
                            <svg className="h-4 w-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                            Watch Preview Video
                        </button>
                    </div>

                    {/* Key Stat Cards */}
                    <div className="grid grid-cols-2 gap-3 pt-6 sm:grid-cols-4 max-w-4xl mx-auto">
                        <div className="glass-card-pro rounded-2xl p-4 text-center">
                            <p className="text-xl font-black text-cyan-400 font-mono sm:text-2xl">1,200+</p>
                            <p className="text-[11px] font-semibold text-slate-400 mt-0.5 sm:text-xs">Active Students</p>
                        </div>
                        <div className="glass-card-pro rounded-2xl p-4 text-center">
                            <p className="text-xl font-black text-sky-400 font-mono sm:text-2xl">98%</p>
                            <p className="text-[11px] font-semibold text-slate-400 mt-0.5 sm:text-xs">Satisfaction Rate</p>
                        </div>
                        <div className="glass-card-pro rounded-2xl p-4 text-center">
                            <p className="text-xl font-black text-indigo-400 font-mono sm:text-2xl">100%</p>
                            <p className="text-[11px] font-semibold text-slate-400 mt-0.5 sm:text-xs">Practical Projects</p>
                        </div>
                        <div className="glass-card-pro rounded-2xl p-4 text-center">
                            <p className="text-xl font-black text-emerald-400 font-mono sm:text-2xl">VIP Gigs</p>
                            <p className="text-[11px] font-semibold text-slate-400 mt-0.5 sm:text-xs">Job Opportunities</p>
                        </div>
                    </div>

                </div>
            </section>

            {/* 2. INSTRUCTOR SPOTLIGHT */}
            <section id="team" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="glass-card-pro rounded-3xl p-6 sm:p-10 relative overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                        <div className="lg:col-span-5 relative">
                            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950 shadow-2xl image-glow-hover">
                                <Image
                                    src="/assets/images/team/biruk-girma.jpg"
                                    alt="Biruk Girma"
                                    fill
                                    className="object-cover transition-transform duration-700 hover:scale-105"
                                />
                            </div>
                            <div className="absolute -bottom-3 -right-3 rounded-2xl border border-slate-700 bg-slate-950/90 p-3.5 backdrop-blur-xl shadow-2xl">
                                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Lead Instructor</p>
                                <p className="text-xs font-extrabold text-slate-100">Biruk Girma</p>
                            </div>
                        </div>

                        <div className="lg:col-span-7 space-y-4">
                            <div className="inline-block rounded-lg bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                                Meet Your Lead Instructor
                            </div>
                            <h2 className="text-2xl font-extrabold text-slate-100 sm:text-3xl">
                                Biruk Girma — Tech & AI Expert
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                ቢሩክ ግርማ በ AI፣ Prompt Engineering እና በዲጂታል ቴክኖሎጂ ዘርፍ በብዙ ሺህ የሚቆጠሩ ሰዎችን ያሰለጠነና ያስተማረ የዘርፉ ባለሙያ ነው። በ AxR Academy በኩል አዳዲስ የ AI ቴክኖሎጂዎችን በቀላሉ ለሁሉም ሰው ተaccessible በማድረግ ለወጣቶች የኢኮኖሚ እና የስራ እድል መክፈት ላይ ይሰራል።
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-300">
                                <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
                                    <svg className="h-4 w-4 text-cyan-400 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    <span>5+ Years Tech Training</span>
                                </div>
                                <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
                                    <svg className="h-4 w-4 text-cyan-400 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    <span>AI Prompt Architecture</span>
                                </div>
                                <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
                                    <svg className="h-4 w-4 text-cyan-400 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    <span>Direct Student Mentorship</span>
                                </div>
                                <div className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
                                    <svg className="h-4 w-4 text-cyan-400 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    <span>Real-World Workflows</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 3. SYLLABUS */}
            <section id="curriculum" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-extrabold text-slate-100 sm:text-3xl">
                        የ 4 ሳምንታት ሙሉ የስልጠና ካሪኩለም
                    </h2>
                    <p className="text-xs text-slate-400 max-w-xl mx-auto">
                        ከመሰረታዊ የመግቢያ እውቀት እስከ ከፍተኛ ደረጃ የ AI Prompt Engineering እና የገቢ ማስገኛ መንገዶች
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                    <div className="glass-card-pro rounded-2xl p-5 space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                            <span className="text-xs font-mono font-bold text-cyan-400">WEEK 01</span>
                            <span className="text-[10px] font-mono text-slate-500">Fundamentals</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-100">AI Foundations & Prompt Architecture</h3>
                        <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside leading-relaxed">
                            <li>LLM models (ChatGPT, Claude, Gemini) አሰራር</li>
                            <li>Role-based, Context-based Prompting</li>
                            <li>Zero-shot & Few-shot Prompting Techniques</li>
                        </ul>
                    </div>

                    <div className="glass-card-pro rounded-2xl p-5 space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                            <span className="text-xs font-mono font-bold text-sky-400">WEEK 02</span>
                            <span className="text-[10px] font-mono text-slate-500">Advanced</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-100">Advanced Prompting Frameworks</h3>
                        <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside leading-relaxed">
                            <li>Chain-of-Thought (CoT) Prompting</li>
                            <li>Tree-of-Thoughts & Structured Output Format</li>
                            <li>AI hallucination የመቆጣጠር ስልቶች</li>
                        </ul>
                    </div>

                    <div className="glass-card-pro rounded-2xl p-5 space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                            <span className="text-xs font-mono font-bold text-indigo-400">WEEK 03</span>
                            <span className="text-[10px] font-mono text-slate-500">Content & Dev</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-100">AI Content Creation & Workflows</h3>
                        <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside leading-relaxed">
                            <li>የቪዲዮ Script፣ Copywriting & Marketing ህጎች</li>
                            <li>AI ፎቶዎችና ግራፊክሶች ማፍለቂያ (Midjourney)</li>
                            <li>የስራ ሂደቶችን በ AI ማፍጠን (Automation)</li>
                        </ul>
                    </div>

                    <div className="glass-card-pro rounded-2xl p-5 space-y-3">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                            <span className="text-xs font-mono font-bold text-emerald-400">WEEK 04</span>
                            <span className="text-[10px] font-mono text-slate-500">Monetization</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-100">Monetization & Remote AI Jobs</h3>
                        <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside leading-relaxed">
                            <li>Upwork, Fiverr & Remote AI Gigs</li>
                            <li>የ ሀገር ውስጥ የ 24 ሰዓት የስራ እድሎች</li>
                            <li>የመጨረሻ Capstone Project ማጠናቀቅ</li>
                        </ul>
                    </div>

                </div>
            </section>

            {/* 4. INTERACTIVE CALCULATOR */}
            <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="glass-card-pro rounded-3xl p-6 sm:p-10 space-y-6 border-cyan-500/30">
                    <div className="text-center space-y-1.5">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">
                            Interactive Referral & Coin Calculator
                        </h2>
                        <p className="text-xs text-slate-400">
                            ጓደኞችዎን በመጋበዝ የሚሰበስቡትን Coin እና የሚኖረውን የክፍያ ቅናሽ በስላይደሩ ይሞክሩት!
                        </p>
                    </div>

                    <div className="max-w-md mx-auto space-y-5">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-300">
                                <span>የሚጋብዟቸው ሰዎች ብዛት (Invites):</span>
                                <span className="font-mono text-cyan-400">{inviteCount} People ({inviteCount} Coins)</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                value={inviteCount}
                                onChange={(e) => setInviteCount(Number(e.target.value))}
                                className="w-full accent-cyan-500 cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                                <span>0 (0%)</span>
                                <span>5 Invites (50% Off)</span>
                                <span>10 Invites (100% FREE)</span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2.5 font-mono text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Regular Fee:</span>
                                <span className="text-slate-200">{formatCurrency(SITE_CONFIG.courseFee)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">My Coins:</span>
                                <span className="text-amber-400 font-bold">{discountInfo.coins} Coins</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Discount Percentage:</span>
                                <span className="text-emerald-400 font-bold">-{discountInfo.percent}% ({formatCurrency(discountInfo.discountAmount)})</span>
                            </div>
                            <div className="border-t border-slate-800 pt-2.5 flex justify-between text-sm">
                                <span className="text-slate-100 font-bold">Final Payable Amount:</span>
                                <span className="text-cyan-400 font-extrabold">{formatCurrency(discountInfo.finalFee)}</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3 text-xs font-black text-slate-950 hover:from-cyan-400 shadow-md shadow-cyan-500/20"
                            >
                                <span>በዚህ ቅናሽ አሁኑኑ ይመዝገቡ</span>
                                <svg className="h-3.5 w-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. SUPPORT TEAM */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="glass-card-pro rounded-3xl p-6 sm:p-10 relative overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

                        <div className="space-y-3">
                            <span className="inline-block rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-400 uppercase">
                                24/7 Student Assistance
                            </span>
                            <h2 className="text-2xl font-extrabold text-slate-100">
                                የተማሪዎች ደጋፊ እና አስተባባሪ ቡድናችን
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                በትምህርቱ ወቅት ለሚነሱብዎት ማንኛውም አይነት የቴክኒክ፣ የከፍያ ወይም የትምህርት ጥያቄዎች ዝግጁ የሆነ የተማሪዎች ደጋፊ ቡድናችን በቴሌግራም እና በስልክ ድጋፍ ያደርግልዎታል።
                            </p>
                        </div>

                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl image-glow-hover">
                            <Image
                                src="/assets/images/team/support-team.jpg"
                                alt="Support Team"
                                fill
                                className="object-cover transition-transform duration-700 hover:scale-105"
                            />
                        </div>

                    </div>
                </div>
            </section>

            {/* 6. FAQ */}
            <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-extrabold text-slate-100">ተደጋግመው የሚጠየቁ ጥያቄዎች (FAQ)</h2>
                </div>

                <div className="space-y-3">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="glass-card-pro rounded-2xl overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                className="w-full flex justify-between items-center p-4 text-left text-xs sm:text-sm font-bold text-slate-100 hover:text-cyan-400 transition"
                            >
                                <span>{faq.q}</span>
                                <span className="text-cyan-400 font-mono text-base">{openFaq === idx ? '−' : '+'}</span>
                            </button>
                            {openFaq === idx && (
                                <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* 7. FINAL CTA BANNER */}
            <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="rounded-3xl bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-700 p-8 sm:p-10 text-center text-white shadow-2xl space-y-4">
                    <h2 className="text-2xl sm:text-4xl font-black">
                        የ AI እና የቴክኖሎጂ ጉዞዎን ዛሬ ይጀምሩ
                    </h2>
                    <p className="max-w-xl mx-auto text-xs sm:text-sm text-cyan-100">
                        ከ 1,200+ በላይ ተማሪዎች ጋር በመቀላቀል የዘመኑን ውድ ህሎት Prompt Engineeringን ያዳብሩ።
                    </p>
                    <div>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-8 py-3.5 text-xs font-black text-cyan-400 transition hover:bg-slate-900 hover:scale-105 shadow-xl"
                        >
                            <span>Enroll Now</span>
                            <svg className="h-3.5 w-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            <VideoModal
                isOpen={isVideoOpen}
                onClose={() => setIsVideoOpen(false)}
                videoUrl={SITE_CONFIG.promoVideoUrl}
            />

        </div>
    );
}