'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { Certificate } from '@/types';

export default function CertificatePage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [cert, setCert] = useState<Certificate | null>(null);
  const [imgSrc, setImgSrc] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearchCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setCert(null);

    const clean = query.trim();
    const isNumeric = /^\d+$/.test(clean);
    const numValue = isNumeric ? Number(clean) : 0;

    try {
      // 1. First, search in 'certificates' database table
      const { data: certData } = await supabase
        .from('certificates')
        .select('*')
        .or(`certificate_id.ilike.${clean},user_id.eq.${numValue}`)
        .maybeSingle();

      if (certData) {
        const foundCert = certData as Certificate;
        setCert(foundCert);
        setImgSrc(foundCert.image_url);
        setLoading(false);
        return;
      }

      // 2. Dynamic Fallback: Search in 'students' table & generate storage link matching Student ID
      let studentQuery = supabase.from('students').select('*');
      if (isNumeric) {
        studentQuery = studentQuery.or(`user_id.eq.${numValue},student_custom_id.ilike.${clean},phone.ilike.${clean}`);
      } else {
        studentQuery = studentQuery.or(`student_custom_id.ilike.${clean},phone.ilike.${clean}`);
      }

      const { data: studentData } = await studentQuery.maybeSingle();

      if (studentData) {
        const targetId = studentData.student_custom_id || String(studentData.user_id);
        const storageBaseUrl = 'https://tjfroaccfbtpovivsrxr.supabase.co/storage/v1/object/public/certificates';
        const dynamicUrl = `${storageBaseUrl}/${targetId}.png`;

        const dynamicCert: Certificate = {
          certificate_id: targetId,
          user_id: studentData.user_id,
          student_name: studentData.full_name,
          course_name: 'Prompt Engineering & AI Tools',
          round: studentData.round || 2,
          issued_date: studentData.created_at ? studentData.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          image_url: dynamicUrl,
        };

        setCert(dynamicCert);
        setImgSrc(dynamicUrl);
      } else {
        setErrorMsg('ሰርተፊኬት ወይም ተማሪ አልተገኘም። እባክዎ Credential ID ወይም Student ID በትክክል ያስገቡ።');
      }
    } catch {
      setErrorMsg('ስህተት አጋጥሟል። እባክዎ ደግመው ይሞክሩ።');
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = () => {
    // Fallback logic: If .png image is not found, automatically try loading .jpg
    if (imgSrc.endsWith('.png')) {
      setImgSrc(imgSrc.replace('.png', '.jpg'));
    } else {
      setErrorMsg('የተማሪው መረጃ ተገኝቷል፤ ነገር ግን የሰርተፊኬት ፎቶው በ Storage ላይ አልተጫነም።');
      setCert(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16 space-y-8 animate-fade-in-up text-slate-100 min-h-screen">

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.26 10.147a60.436 60.436 0 01-.491-6.347A48.627 48.627 0 0112 2c2.68 0 5.308.214 7.87.625.328 1.956.162 4.156-.49 6.348m-15.12 0a48.583 48.583 0 00-2.222 10.638 48.62 48.62 0 0017.342 0 48.58 48.58 0 00-2.222-10.638m-12.9 0c1.782-.36 3.633-.585 5.518-.67 1.885.085 3.736.31 5.518.67" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-100">Official Certificate Portal</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          የተማሪ መታወቂያዎን (Student ID) ወይም Credential ID በማስገባት ሰርተፊኬትዎን በ HD ጥራት ያውርዱ
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearchCert} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            required
            placeholder="e.g. AXR-STU-5082 or AXR-R2-5570011875"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 px-5 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 px-7 py-3.5 text-xs font-black text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.25)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 shrink-0"
        >
          <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <span>{loading ? 'Searching...' : 'Search Credential'}</span>
        </button>
      </form>

      {/* Error Banner */}
      {errorMsg && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 text-center text-xs font-semibold text-rose-300 backdrop-blur-md">
          <svg className="h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Certificate Result Card */}
      {cert && (
        <div className="glass-card-pro rounded-3xl p-6 sm:p-8 backdrop-blur-2xl space-y-6 border border-emerald-500/40 bg-slate-900 shadow-[0_0_40px_rgba(16,185,129,0.15)] animate-fade-in-up">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
                OFFICIAL VERIFIED CREDENTIAL
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
              Round {cert.round}
            </span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-slate-100">{cert.student_name}</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Course: <span className="font-bold text-cyan-300">{cert.course_name}</span>
            </p>
            <p className="font-mono text-xs text-slate-400">
              Credential ID: <span className="text-cyan-400 font-bold">{cert.certificate_id}</span>
            </p>
          </div>

          {/* Certificate Image Preview */}
          {imgSrc && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-950">
              <Image
                src={imgSrc}
                alt={cert.student_name}
                fill
                unoptimized
                className="object-contain"
                onError={handleImageError}
              />
            </div>
          )}

          <div className="pt-2">
            <a
              href={imgSrc}
              target="_blank"
              download={`${cert.certificate_id}_Certificate`}
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-3.5 text-xs font-black text-slate-950 transition hover:bg-emerald-300 hover:scale-[1.01] shadow-lg shadow-emerald-500/20"
            >
              <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>Download HD Certificate File</span>
            </a>
          </div>
        </div>
      )}

    </div>
  );
}