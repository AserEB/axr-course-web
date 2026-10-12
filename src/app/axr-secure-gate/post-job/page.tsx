'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function PostJobPage() {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [applyContact, setApplyContact] = useState('');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setIsError(false);

    try {
      const { error } = await supabase.from('local_jobs').insert([
        {
          title: title.trim(),
          company: company.trim() || 'Confidential',
          salary: salary.trim() || 'Negotiable',
          description: description.trim(),
          apply_contact: applyContact.trim(),
        },
      ]);

      if (error) throw new Error(error.message);

      setMsg('ስራው በስኬት ተለጠፈ! ለ 24 ሰዓት ለተማሪዎች ይታያል።');
      setTitle('');
      setCompany('');
      setSalary('');
      setDescription('');
      setApplyContact('');
    } catch (err: unknown) {
      const error = err as Error;
      setIsError(true);
      setMsg(`ስህተት፦ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:py-16 space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <svg className="h-5 w-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 013.75 18.4V14.15m16.5 0a2.25 2.25 0 00-2.25-2.25H4.875a2.25 2.25 0 00-2.25 2.25m16.5 0v-4.25a2.25 2.25 0 00-2.25-2.25H4.875a2.25 2.25 0 00-2.25 2.25v4.25m16.5 0h-16.5M12 6.75A2.25 2.25 0 0114.25 4.5h2.25a2.25 2.25 0 012.25 2.25v2.25H12V6.75z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-emerald-400">Post 24-hr Local Job</h1>
        </div>

        <Link
          href="/axr-secure-gate/dashboard"
          className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
        >
          <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Alert Banner */}
      {msg && (
        <div
          className={`flex items-center gap-2.5 rounded-2xl border p-4 text-xs font-bold backdrop-blur-md ${isError
            ? 'border-rose-500/30 bg-rose-950/40 text-rose-300'
            : 'border-emerald-500/30 bg-emerald-950/40 text-emerald-200'
            }`}
        >
          <svg
            className={`h-4 w-4 shrink-0 ${isError ? 'text-rose-400' : 'text-emerald-400 stroke-[2.5]'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isError ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            )}
          </svg>
          <span>{msg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handlePostJob} className="glass-card-pro rounded-3xl p-6 sm:p-8 space-y-5 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Job Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. AI Prompt Specialist"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Company Name
          </label>
          <input
            type="text"
            placeholder="e.g. Aser Agency"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Salary / Payment
          </label>
          <input
            type="text"
            placeholder="e.g. 5,000 ETB"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Job Description & Requirements <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="የስራው ዝርዝር..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Apply Contact (Phone or Telegram Username) <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. @AserSupport or 09..."
            value={applyContact}
            onChange={(e) => setApplyContact(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 py-3.5 text-xs font-black text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.25)] transition hover:scale-[1.01] disabled:opacity-50"
        >
          <span>{loading ? 'መለጠፍ ላይ ነው...' : 'Post Job Now'}</span>
          {!loading && (
            <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}