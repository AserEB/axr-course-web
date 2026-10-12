'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SITE_CONFIG } from '@/lib/constants';

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-cyan-500/15 bg-slate-950/80 backdrop-blur-2xl transition-all">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">

                {/* Brand Logo & Identity */}
                <Link href="/" className="group flex items-center gap-3 transition-opacity hover:opacity-95">
                    <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-cyan-500/40 bg-slate-900 shadow-[0_0_15px_rgba(56,189,248,0.15)] transition-all duration-300 group-hover:border-cyan-400 group-hover:shadow-[0_0_25px_rgba(56,189,248,0.35)]">
                        <Image
                            src="/assets/images/axr-logo.png"
                            alt="AxR Logo"
                            fill
                            className="object-contain p-1"
                            priority
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300 bg-clip-text text-lg font-black tracking-tight text-transparent">
                            {SITE_CONFIG.name}
                        </span>
                        <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                            AI & Prompt Academy
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-300 md:flex">
                    <Link href="/" className="transition hover:text-cyan-400">Home</Link>
                    <Link href="/#curriculum" className="transition hover:text-cyan-400">Syllabus</Link>
                    <Link href="/#team" className="transition hover:text-cyan-400">Instructors</Link>
                    <Link href="/student/certificate" className="transition hover:text-cyan-400">Verify Certificate</Link>
                    <Link href="/student/jobs" className="transition hover:text-cyan-400">VIP Jobs</Link>
                </nav>

                {/* Desktop Auth CTA Buttons */}
                <div className="hidden items-center gap-3 md:flex">
                    <Link
                        href="/login"
                        className="rounded-xl border border-cyan-500/30 bg-slate-900/90 px-4.5 py-2 text-xs font-bold text-cyan-300 transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-950/40 hover:shadow-[0_0_20px_rgba(56,189,248,0.25)]"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/register"
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 px-5 py-2 text-xs font-black text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all duration-300 hover:scale-105 hover:from-cyan-400 hover:to-indigo-500 hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] active:scale-95"
                    >
                        <span>Enroll Now</span>
                        <svg className="h-3.5 w-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                </div>

                {/* Mobile Hamburger Button */}
                <button
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 text-slate-400 transition hover:border-cyan-500/40 hover:text-cyan-400 md:hidden"
                    aria-label="Toggle Navigation Menu"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {mobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu Drawer */}
            {mobileMenuOpen && (
                <div className="border-b border-cyan-500/20 bg-slate-950/95 px-5 pt-4 pb-7 backdrop-blur-2xl md:hidden space-y-5 animate-fade-in-up">
                    <nav className="flex flex-col gap-3 text-sm font-semibold text-slate-200">
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="py-2.5 border-b border-slate-900 transition hover:text-cyan-400">Home</Link>
                        <Link href="/#curriculum" onClick={() => setMobileMenuOpen(false)} className="py-2.5 border-b border-slate-900 transition hover:text-cyan-400">Syllabus & Curriculum</Link>
                        <Link href="/#team" onClick={() => setMobileMenuOpen(false)} className="py-2.5 border-b border-slate-900 transition hover:text-cyan-400">Instructors & Team</Link>
                        <Link href="/student/certificate" onClick={() => setMobileMenuOpen(false)} className="py-2.5 border-b border-slate-900 transition hover:text-cyan-400">Verify Certificate</Link>
                        <Link href="/student/jobs" onClick={() => setMobileMenuOpen(false)} className="py-2.5 border-b border-slate-900 transition hover:text-cyan-400">VIP Jobs</Link>
                    </nav>
                    <div className="flex flex-col gap-3 pt-2">
                        <Link
                            href="/register"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 active:scale-98"
                        >
                            <span>Enroll Now</span>
                            <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                        <Link
                            href="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full text-center rounded-xl border border-cyan-500/30 bg-slate-900/90 py-3 text-sm font-bold text-cyan-300"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}