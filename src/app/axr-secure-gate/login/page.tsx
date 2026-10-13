'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-redirect if already logged in
  useEffect(() => {
    const role = localStorage.getItem('admin_role');
    if (role) {
      window.location.href = '/axr-secure-gate/dashboard';
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('እባክዎ Username እና Password ያስገቡ።');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const cleanUser = username.trim();

      // 1. Direct Owner Access Check
      if (cleanUser === 'AxRCourse' && password === 'AxR_Course_2026') {
        localStorage.setItem('admin_role', 'owner');
        localStorage.setItem('admin_username', 'AxRCourse');
        localStorage.setItem('admin_full_name', 'AxR Super Owner');
        window.location.href = '/axr-secure-gate/dashboard';
        return;
      }

      // 2. Check admin_users table in Supabase
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', cleanUser)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        throw new Error('የተሳሳተ የአድሚን Username ወይም Password ነው፤ ወይም አካውንቱ ታግዷል።');
      }

      if (data.password_hash !== password) {
        throw new Error('የተሳሳተ Password ነው።');
      }

      localStorage.setItem('admin_role', data.role || 'assistant');
      localStorage.setItem('admin_username', data.username);
      localStorage.setItem('admin_full_name', data.full_name || data.username);

      window.location.href = '/axr-secure-gate/dashboard';
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'አድሚን መግባት አልተቻለም።');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-20 animate-fade-in-up">
      <div className="glass-card-pro rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(56,189,248,0.15)] bg-slate-900/90 space-y-6">

        {/* Header Icon & Title */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0112 2.714z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100">AxR Admin Portal Gate</h1>
          <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">
            Secure Access Protocol
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs font-semibold text-rose-300 backdrop-blur-md">
            <svg className="h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Admin Username
            </label>
            <input
              type="text"
              required
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 py-3.5 text-xs font-black text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.25)] transition hover:scale-[1.01] disabled:opacity-50"
          >
            <span>{loading ? 'ማረጋገጥ ላይ ነው...' : 'Enter Admin Control Hub'}</span>
            {!loading && (
              <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}