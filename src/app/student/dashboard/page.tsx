'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Student } from '@/types';
import { calculateUserDiscount } from '@/lib/discountEngine';
import { SITE_CONFIG } from '@/lib/constants';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [invitedStudents, setInvitedStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      const storedUserId = localStorage.getItem('student_user_id');
      if (!storedUserId) {
        router.push('/login');
        return;
      }

      try {
        // 1. Fetch current student profile
        const { data: studentData, error } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', Number(storedUserId))
          .single();

        if (error || !studentData) {
          router.push('/login');
          return;
        }

        setStudent(studentData as Student);

        // 2. Fetch list of friends invited by this student
        const { data: referrals } = await supabase
          .from('students')
          .select('*')
          .eq('referred_by', Number(storedUserId));

        if (referrals) {
          setInvitedStudents(referrals as Student[]);
        }
      } catch (err) {
        console.error('Error loading student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center animate-fade-in-up">
        <div className="glass-card-pro mx-auto max-w-md rounded-3xl p-8 space-y-4">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
            ዳሽቦርዱ እየተጫነ ነው...
          </p>
        </div>
      </div>
    );
  }

  if (!student) return null;

  // Referral discount calculations
  const verifiedInvites = invitedStudents.filter((s) => s.status === 'Verified').length;
  const discountInfo = calculateUserDiscount(verifiedInvites, invitedStudents.length, SITE_CONFIG.courseFee);

  const referralShareUrl = `${SITE_CONFIG.siteUrl}/register?ref=${student.student_custom_id || student.user_id}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-8 animate-fade-in-up">

      {/* 1. REALTIME STATUS BANNER */}
      {student.status === 'Pending' && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/40 p-5 text-amber-200 backdrop-blur-xl shadow-[0_0_30px_rgba(245,158,11,0.1)]">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-950/60 text-amber-400">
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-100">
                ምዝገባዎ በአድሚን በመረጋገጥ ላይ ነው (Pending Verification)
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-amber-300/80 leading-relaxed">
                የላኩት ክፍያ በ 30 ደቂቃ ውስጥ ተረጋግጦ የትምህርት መግቢያ ሊንክ በኢሜይልዎ እና እዚህ ገጽ ላይ ይላክሎታል።
              </p>
            </div>
          </div>
        </div>
      )}

      {student.status === 'Verified' && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-5 text-emerald-200 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.12)]">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-950/60 text-emerald-400">
              <svg className="h-5 w-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-100">
                ክፍያዎ ተረጋግጧል! እንኳን ደስ አለዎት (Verified)
              </h3>
              <p className="text-xs sm:text-sm text-emerald-300/80 leading-relaxed">
                ከታች ያለውን Private Entrance Link በመጫን ወደ መማሪያ ቻናላችን ይቀላቀሉ።
              </p>
              {student.admin_message && (
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-slate-950/90 p-3 font-mono text-xs text-cyan-300">
                  <svg className="h-4 w-4 shrink-0 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span>{student.admin_message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {student.status === 'Discard' && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-950/40 p-5 text-rose-200 backdrop-blur-xl shadow-[0_0_30px_rgba(244,63,94,0.12)]">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-950/60 text-rose-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-100">
                ምዝገባዎ ውድቅ ተደርጓል (Discarded)
              </h3>
              <p className="text-xs sm:text-sm text-rose-300/80 leading-relaxed">
                ምክንያት፦ <b>{student.admin_message || 'የተላከው ክፍያ ስክሪንሹት ወይም መረጃ አልተረጋገጠም።'}</b>
              </p>
              <div>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2 text-xs font-black text-white hover:bg-rose-400 transition"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span>በድጋሚ ክፍያ/መረጃ ላክ</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DIGITAL PASS CARD & PROFILE SUMMARY */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Printable Student Digital Pass */}
        <div className="lg:col-span-1 glass-card-pro rounded-3xl p-6 relative overflow-hidden border-cyan-500/30 flex flex-col justify-between space-y-6">
          <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-cyan-500/15 blur-2xl" />

          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
              AxR Official Pass
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${student.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
              {student.status}
            </span>
          </div>

          <div className="text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.26 10.147a60.436 60.436 0 01-.491-6.347A48.627 48.627 0 0112 2c2.68 0 5.308.214 7.87.625.328 1.956.162 4.156-.49 6.348m-15.12 0a48.583 48.583 0 00-2.222 10.638 48.62 48.62 0 0017.342 0 48.58 48.58 0 00-2.222-10.638m-12.9 0c1.782-.36 3.633-.585 5.518-.67 1.885.085 3.736.31 5.518.67" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-slate-100">{student.full_name}</h2>
            <p className="font-mono text-xs text-cyan-400 font-bold tracking-wider">
              {student.student_custom_id || `ID: ${student.user_id}`}
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-4 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Course:</span>
              <span className="font-semibold text-slate-200">Prompt Engineering</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Batch:</span>
              <span className="font-semibold text-slate-200">Round {student.round}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phone:</span>
              <span className="font-semibold text-slate-200">{student.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="truncate max-w-[140px] font-semibold text-slate-200">{student.email}</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/student/profile"
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 py-2.5 text-xs font-bold text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-400"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>

        {/* 3. REFERRAL & COIN ENGINE DASHBOARD */}
        <div className="lg:col-span-2 glass-card-pro rounded-3xl p-6 sm:p-8 space-y-6 border-cyan-500/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-100">
                My Coins & Referral Engine
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              ጓደኞችዎን በመጋበዝ Coin ይሰብስቡ፤ የኮርሱን ክፍያ እስከ <b className="text-cyan-300">100% Free (ነፃ)</b> ያድርጉ!
            </p>
          </div>

          {/* Coin Counter Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-center">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Joined</span>
              <p className="font-mono text-xl sm:text-2xl font-black text-slate-200">{discountInfo.total_joined}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3.5 space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Pending</span>
              <p className="font-mono text-xl sm:text-2xl font-black text-amber-400">{discountInfo.pending_count}</p>
            </div>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-3.5 space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">My Coins</span>
              <p className="font-mono text-xl sm:text-2xl font-black text-amber-400">{discountInfo.coins}</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Discount</span>
              <p className="font-mono text-xl sm:text-2xl font-black text-emerald-400">{discountInfo.percent}%</p>
            </div>
          </div>

          {/* Personal Share Link Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              የእርስዎ መጋበዣ ሊንክ (Share Link)
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                readOnly
                value={referralShareUrl}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 font-mono text-xs text-cyan-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={copyReferralLink}
                className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-cyan-400 px-5 py-2.5 text-xs font-black text-slate-950 transition hover:bg-cyan-300 shadow-md shadow-cyan-500/20"
              >
                <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {copiedLink ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" />
                  )}
                </svg>
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Invited Friends Table */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              በእርስዎ ሊንክ የተቀላቀሉ ሰዎች ({invitedStudents.length})
            </h4>
            {invitedStudents.length === 0 ? (
              <p className="text-xs text-slate-500">እስካሁን ያቀረቧቸው ተጋባዦች የሉም። ሊንክዎን ለጓደኞችዎ ያጋሩ!</p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {invitedStudents.map((invited) => (
                  <div
                    key={invited.user_id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/90 p-3 text-xs"
                  >
                    <span className="font-bold text-slate-200">{invited.full_name}</span>
                    <span className={`font-mono font-bold ${invited.status === 'Verified' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                      {invited.status === 'Verified' ? 'Verified (+1 Coin)' : 'Pending Verification'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}