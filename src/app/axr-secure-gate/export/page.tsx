'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Student } from '@/types';

export default function ExportDataPage() {
  const [exportType, setExportType] = useState<'ALL' | 'Verified' | 'Discard'>('ALL');
  const [downloading, setDownloading] = useState(false);

  const handleExportCSV = async () => {
    setDownloading(true);
    try {
      let query = supabase.from('students').select('*');
      if (exportType !== 'ALL') {
        query = query.eq('status', exportType);
      }

      const { data } = await query;
      if (!data || data.length === 0) {
        alert('ምንም የተገኘ መረጃ የለም።');
        setDownloading(false);
        return;
      }

      const students = data as Student[];
      const headers = ['Student ID', 'Full Name', 'Gender', 'Phone', 'Email', 'Payment Method', 'Status', 'Handled By'];
      const rows = students.map((s) => [
        `"${s.student_custom_id || s.user_id}"`,
        `"${s.full_name.replace(/"/g, '""')}"`,
        `"${s.gender || '-'}"`,
        `"${s.phone}"`,
        `"${s.email}"`,
        `"${s.payment_method || '-'}"`,
        `"${s.status}"`,
        `"${(s.handled_by || '-').replace(/"/g, '""')}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `axr_students_${exportType.toLowerCase()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert('CSV ማውረድ አልተቻለም።');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16 space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-100">Export Student CSV</h1>
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

      <div className="glass-card-pro rounded-3xl p-6 sm:p-8 space-y-6 border-cyan-500/30">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
            ማውረድ የሚፈልጉትን መረጃ ይምረጡ
          </label>
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => setExportType('ALL')}
              className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-xs font-bold transition ${exportType === 'ALL'
                  ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                <span>All Students Report</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500 uppercase">CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setExportType('Verified')}
              className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-xs font-bold transition ${exportType === 'Verified'
                  ? 'border-emerald-400 bg-emerald-950/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-emerald-400 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Verified Students Only</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500 uppercase">CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setExportType('Discard')}
              className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-xs font-bold transition ${exportType === 'Discard'
                  ? 'border-rose-400 bg-rose-950/40 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Discarded Students Only</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500 uppercase">CSV</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={downloading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 py-3.5 text-xs font-black text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.25)] transition hover:scale-[1.01] disabled:opacity-50"
        >
          <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          <span>{downloading ? 'በማውረድ ላይ...' : 'Download CSV File'}</span>
        </button>
      </div>
    </div>
  );
}