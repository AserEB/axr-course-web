'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { LocalJob, RemoteJob } from '@/types';

export default function VipJobsPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  const [localJobs, setLocalJobs] = useState<LocalJob[]>([]);
  const [remoteJobs] = useState<RemoteJob[]>([
    {
      title: 'YouTube & TikTok Video Script Writer (AI Assisted)',
      company: 'Creator Studio Global',
      url: 'https://jobicy.com/jobs',
      date: 'Active Now',
      level: 'Entry-Level (Script & Copywriting)',
      source: 'Remote Worldwide',
    },
    {
      title: 'AI Prompt Evaluator & Model Reviewer',
      company: 'DataAnnotation Tech',
      url: 'https://remotive.com',
      date: 'Active Now',
      level: 'Mid-Level (AI Evaluation)',
      source: 'Remote Worldwide',
    },
    {
      title: 'Landing Page Web Developer & AI Prompt Engineer',
      company: 'TechVentures Lab',
      url: 'https://jobicy.com/jobs',
      date: 'Active Now',
      level: 'Advanced (Prompt & Web Dev)',
      source: 'Remote Worldwide',
    },
  ]);

  useEffect(() => {
    const checkAccessAndFetchJobs = async () => {
      const storedUserId = localStorage.getItem('student_user_id');
      if (!storedUserId) {
        setLoading(false);
        return;
      }

      const { data: student } = await supabase
        .from('students')
        .select('status')
        .eq('user_id', Number(storedUserId))
        .single();

      if (student && student.status === 'Verified') {
        setIsVerified(true);

        // Fetch active local jobs from Supabase
        const { data: jobs } = await supabase
          .from('local_jobs')
          .select('*')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (jobs) setLocalJobs(jobs as LocalJob[]);
      }

      setLoading(false);
    };

    checkAccessAndFetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center animate-fade-in-up">
        <div className="glass-card-pro mx-auto max-w-md rounded-3xl p-8 space-y-4">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
            የስራ እድሎች እየተጫኑ ነው...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-16 space-y-10 animate-fade-in-up">

      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 013.75 18.4V14.15m16.5 0a2.25 2.25 0 00-2.25-2.25H4.875a2.25 2.25 0 00-2.25 2.25m16.5 0v-4.25a2.25 2.25 0 00-2.25-2.25H4.875a2.25 2.25 0 00-2.25 2.25v4.25m16.5 0h-16.5M12 6.75A2.25 2.25 0 0114.25 4.5h2.25a2.25 2.25 0 012.25 2.25v2.25H12V6.75z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-100">VIP Jobs & Opportunities Portal</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          ከሀገር ውስጥ የ 24 ሰዓት ስራዎች እስከ አለም አቀፍ Remote AI ስራዎች
        </p>
      </div>

      {/* ACCESS GUARD FOR NON-VERIFIED STUDENTS */}
      {!isVerified ? (
        <div className="glass-card-pro rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden border-amber-500/30 space-y-5 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-950/40 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100">
            ይህ ክፍል ለ Verified ተማሪዎች ብቻ የተፈቀደ ነው!
          </h2>
          <p className="max-w-md mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed">
            የ VIP ስራዎችን ለማግኘት እና ለማመልከት እባክዎ መጀመሪያ ምዝገባዎን ያጠናቁ እና የአድሚን ክፍያ ማረጋገጫ (Verified) ይጠብቁ።
          </p>
          <div className="pt-2">
            <Link
              href="/student/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 px-7 py-3.5 text-xs font-black text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.25)] transition-all duration-300 hover:scale-105"
            >
              <span>ወደ ዳሽቦርድ ተመለስ</span>
              <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">

          {/* SECTION 1: ETHIOPIAN LOCAL 24-HR GIGS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-base sm:text-lg font-black text-cyan-400 uppercase tracking-wide">
                Ethiopian Local Gigs (24-Hour Active)
              </h2>
            </div>

            {localJobs.length === 0 ? (
              <div className="glass-card-pro rounded-2xl p-6 text-center text-xs text-slate-400">
                ባሁኑ ሰዓት ክፍት የሆነ የሀገር ውስጥ ስራ የለም። አዳዲስ ስራዎች ሲለቀቁ እዚህ ይበራሉ።
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {localJobs.map((job) => (
                  <div key={job.id} className="glass-card-pro rounded-2xl p-5 space-y-3 relative overflow-hidden">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-slate-100 text-sm">{job.title}</h3>
                      <span className="shrink-0 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-cyan-300">
                        Local
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Company: <b className="text-slate-200">{job.company}</b> | Salary: <b className="text-emerald-400">{job.salary}</b>
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{job.description}</p>
                    <div className="border-t border-slate-800/80 pt-3">
                      <a
                        href={job.apply_contact.startsWith('http') ? job.apply_contact : `https://t.me/${job.apply_contact.replace('@', '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 px-4 py-2 text-xs font-black text-slate-950 hover:bg-cyan-300 transition shadow-md shadow-cyan-500/20"
                      >
                        <span>ተወዳደር (Apply Now)</span>
                        <svg className="h-3.5 w-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: WORLDWIDE REMOTE AI JOBS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-950/40 text-indigo-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8" />
                </svg>
              </div>
              <h2 className="text-base sm:text-lg font-black text-indigo-400 uppercase tracking-wide">
                Worldwide Remote AI & Tech Jobs
              </h2>
            </div>

            <div className="space-y-3">
              {remoteJobs.map((rj, idx) => (
                <div key={idx} className="glass-card-pro flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl p-5 gap-4">
                  <div className="space-y-1">
                    <span className="inline-block rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 font-mono">
                      {rj.level}
                    </span>
                    <h3 className="font-bold text-slate-100 text-sm sm:text-base">{rj.title}</h3>
                    <p className="text-xs text-slate-400">
                      Company: <b className="text-slate-200">{rj.company}</b> | Source: <span className="text-cyan-400 font-semibold">{rj.source}</span>
                    </p>
                  </div>
                  <a
                    href={rj.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-cyan-500/30 bg-slate-950 px-5 py-2.5 text-xs font-bold text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-950/40 hover:shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                  >
                    <span>Apply Online</span>
                    <svg className="h-3.5 w-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}