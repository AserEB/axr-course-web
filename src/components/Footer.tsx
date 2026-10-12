'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SITE_CONFIG } from '@/lib/constants';

export default function Footer() {
    return (
        <footer className="mt-20 border-t border-cyan-500/15 bg-slate-950/90 pt-16 pb-12 text-slate-400 backdrop-blur-2xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">

                <div className="grid grid-cols-1 gap-10 md:grid-cols-4">

                    {/* Col 1: Brand Info */}
                    <div className="space-y-4 md:col-span-1">
                        <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-900 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
                                <Image
                                    src="/assets/images/axr-logo.png"
                                    alt="AxR Logo"
                                    fill
                                    className="object-contain p-1"
                                />
                            </div>
                            <span className="bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300 bg-clip-text text-lg font-black tracking-tight text-transparent">
                                {SITE_CONFIG.name}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            በኢትዮጵያ የመጀመሪያው በተግባር ላይ የተመሰረተ የ Prompt Engineering እና AI Skill ማሰልጠኛ ፖርታል።
                        </p>
                        <div className="flex items-center gap-3 pt-1">
                            <a
                                href="https://t.me/AserProduction"
                                target="_blank"
                                rel="noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-cyan-400 hover:bg-cyan-950/40 hover:text-cyan-400"
                                aria-label="Telegram"
                            >
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.119.098.152.228.166.321.015.093.033.308.018.472z" />
                                </svg>
                            </a>
                            <a
                                href="https://youtube.com"
                                target="_blank"
                                rel="noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-rose-500/50 hover:bg-rose-950/40 hover:text-rose-400"
                                aria-label="YouTube"
                            >
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Col 2: Quick Links */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200">Quick Navigation</h4>
                        <ul className="space-y-2 text-xs font-semibold">
                            <li><Link href="/" className="transition hover:text-cyan-400">Home</Link></li>
                            <li><Link href="/#curriculum" className="transition hover:text-cyan-400">Course Syllabus</Link></li>
                            <li><Link href="/#team" className="transition hover:text-cyan-400">Instructors & Team</Link></li>
                            <li><Link href="/student/certificate" className="transition hover:text-cyan-400">Verify Certificate</Link></li>
                            <li><Link href="/student/jobs" className="transition hover:text-cyan-400">VIP Job Portal</Link></li>
                        </ul>
                    </div>

                    {/* Col 3: Student Portals */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200">Student Access</h4>
                        <ul className="space-y-2 text-xs font-semibold">
                            <li><Link href="/login" className="transition hover:text-cyan-400">Student Login</Link></li>
                            <li><Link href="/register" className="transition hover:text-cyan-400">New Registration</Link></li>
                            <li><Link href="/student/dashboard" className="transition hover:text-cyan-400">My Dashboard & Coins</Link></li>
                            <li><Link href="/axr-secure-gate/login" className="transition hover:text-cyan-400 text-slate-500">Admin Control Gate</Link></li>
                        </ul>
                    </div>

                    {/* Col 4: Contact & Support */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200">Contact & Support</h4>
                        <div className="space-y-2.5 text-xs text-slate-400 font-mono">
                            <div className="flex items-center gap-2">
                                <svg className="h-4 w-4 shrink-0 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                </svg>
                                <span>Addis Ababa, Ethiopia</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="h-4 w-4 shrink-0 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                                <span>support@aserproduction.tech</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="h-4 w-4 shrink-0 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.81-.54.75.75 0 01.157-.737l1.713-2.122A8.13 8.13 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                </svg>
                                <span>Telegram: @AserSupport</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Copyright */}
                <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-900 pt-8 text-center text-xs text-slate-500 sm:flex-row">
                    <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.</p>
                    <p className="font-mono text-slate-400">Powered by Aser Academy × Remedial Hub</p>
                </div>

            </div>
        </footer>
    );
}