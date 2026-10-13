'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { Student } from '@/types';
import { sendStudentStatusEmail } from '@/lib/resendEmail';

export default function AdminDashboardPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [adminRole, setAdminRole] = useState('assistant');
  const [adminName, setAdminName] = useState('Admin');
  const [loading, setLoading] = useState(true);

  // System Controls
  const [currentRound, setCurrentRound] = useState(2);
  const [isRegActive, setIsRegActive] = useState(true);

  // Student Data & Filters
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'Verified' | 'Discard'>('ALL');

  // Receipt Modal State
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);

  // Discard Reason Modal State
  const [discardingStudent, setDiscardingStudent] = useState<Student | null>(null);
  const [discardReason, setDiscardReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Verify Modal State
  const [verifyingStudent, setVerifyingStudent] = useState<Student | null>(null);
  const [entranceLink, setEntranceLink] = useState('');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch system settings safely
      const { data: settingsData, error: settingsErr } = await supabase.from('settings').select('*');
      if (!settingsErr && settingsData) {
        settingsData.forEach((item) => {
          if (item.key === 'current_round' && item.value) setCurrentRound(Number(item.value));
          if (item.key === 'is_registration_active' && item.value) setIsRegActive(item.value === 'true');
        });
      }

      // 2. Fetch all students safely
      const { data: studentsData, error: studentsErr } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (!studentsErr && studentsData) {
        setStudents(studentsData as Student[]);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error('Failed to fetch admin data safely:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('admin_role');
    const name = localStorage.getItem('admin_full_name') || localStorage.getItem('admin_username');
    if (!role) {
      router.push('/axr-secure-gate/login');
      return;
    }
    setAdminRole(role);
    setAdminName(name || 'Admin');

    fetchDashboardData();
  }, [router, fetchDashboardData]);

  if (!mounted) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-4 bg-slate-950 text-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
          Loading Control Panel...
        </p>
      </div>
    );
  }

  // Toggle Registration Status (Active / Closed)
  const toggleRegistrationStatus = async () => {
    const nextStatus = !isRegActive;
    setIsRegActive(nextStatus);
    try {
      await supabase.from('settings').upsert({
        key: 'is_registration_active',
        value: String(nextStatus),
      });
    } catch (e) {
      console.error('Toggle status error:', e);
    }
  };

  // Change Active Round
  const changeRound = async (newRound: number) => {
    setCurrentRound(newRound);
    try {
      await supabase.from('settings').upsert({
        key: 'current_round',
        value: String(newRound),
      });
    } catch (e) {
      console.error('Change round error:', e);
    }
  };

  // Handle Approve / Verify Student
  const handleConfirmVerify = async () => {
    if (!verifyingStudent || !entranceLink.trim()) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('students')
        .update({
          status: 'Verified',
          admin_message: entranceLink.trim(),
          handled_by: adminName,
        })
        .eq('user_id', verifyingStudent.user_id);

      if (error) throw new Error(error.message);

      if (verifyingStudent.email) {
        await sendStudentStatusEmail({
          toEmail: verifyingStudent.email,
          studentName: verifyingStudent.full_name,
          customId: verifyingStudent.student_custom_id || `STU-${verifyingStudent.user_id}`,
          status: 'Verified',
          entranceLink: entranceLink.trim(),
        });
      }

      setVerifyingStudent(null);
      setEntranceLink('');
      await fetchDashboardData();
    } catch (err: unknown) {
      const error = err as Error;
      alert(`ስህተት አጋጥሟል፦ ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Discard Student
  const handleConfirmDiscard = async () => {
    if (!discardingStudent || !discardReason.trim()) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('students')
        .update({
          status: 'Discard',
          admin_message: discardReason.trim(),
          handled_by: adminName,
        })
        .eq('user_id', discardingStudent.user_id);

      if (error) throw new Error(error.message);

      if (discardingStudent.email) {
        await sendStudentStatusEmail({
          toEmail: discardingStudent.email,
          studentName: discardingStudent.full_name,
          customId: discardingStudent.student_custom_id || `STU-${discardingStudent.user_id}`,
          status: 'Discard',
          adminMessage: discardReason.trim(),
        });
      }

      setDiscardingStudent(null);
      setDiscardReason('');
      await fetchDashboardData();
    } catch (err: unknown) {
      const error = err as Error;
      alert(`ስህተት አጋጥሟል፦ ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered Students List safely
  const filteredStudents = (students || []).filter((s) => {
    if (!s) return false;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const cleanSearch = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !cleanSearch ||
      (s.full_name && s.full_name.toLowerCase().includes(cleanSearch)) ||
      (s.phone && s.phone.includes(cleanSearch)) ||
      (s.email && s.email.toLowerCase().includes(cleanSearch)) ||
      (s.student_custom_id && s.student_custom_id.toLowerCase().includes(cleanSearch));

    return matchesStatus && matchesSearch;
  });

  const totalCount = (students || []).length;
  const verifiedCount = (students || []).filter((s) => s?.status === 'Verified').length;
  const pendingCount = (students || []).filter((s) => s?.status === 'Pending').length;

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:py-12 space-y-8 text-slate-100 animate-fade-in-up">

      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 18H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 12h11.25" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-100">Admin Control Dashboard</h1>
          </div>
          <p className="text-xs text-slate-400">
            Logged in as: <b className="text-cyan-400">{adminName}</b> ({adminRole.toUpperCase()})
          </p>
        </div>

        {/* Quick Nav Actions */}
        <div className="flex flex-wrap gap-2.5 text-xs font-bold">
          {adminRole === 'owner' && (
            <Link
              href="/axr-secure-gate/owner-panel"
              className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-950/40 px-4 py-2.5 text-indigo-300 transition hover:bg-indigo-900/60"
            >
              <svg className="h-4 w-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              <span>Owner Access</span>
            </Link>
          )}
          <Link
            href="/axr-secure-gate/post-job"
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-2.5 text-emerald-300 transition hover:bg-emerald-900/60"
          >
            <svg className="h-4 w-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 013.75 18.4V14.15m16.5 0a2.25 2.25 0 00-2.25-2.25H4.875a2.25 2.25 0 00-2.25 2.25m16.5 0v-4.25a2.25 2.25 0 00-2.25-2.25H4.875a2.25 2.25 0 00-2.25 2.25v4.25m16.5 0h-16.5M12 6.75A2.25 2.25 0 0114.25 4.5h2.25a2.25 2.25 0 012.25 2.25v2.25H12V6.75z" />
            </svg>
            <span>Post Job</span>
          </Link>
          <Link
            href="/axr-secure-gate/export"
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800"
          >
            <svg className="h-4 w-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Export CSV</span>
          </Link>
        </div>
      </div>

      {/* SYSTEM CONTROLS & STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card-pro rounded-2xl p-5 space-y-2 border-cyan-500/20 bg-slate-900/80">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Active Batch / Round
          </span>
          <div className="flex items-center justify-between font-mono font-bold text-lg text-slate-100">
            <span>Round {currentRound}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((r) => (
                <button
                  key={r}
                  onClick={() => changeRound(r)}
                  className={`px-2 py-0.5 text-xs rounded transition ${currentRound === r
                    ? 'bg-cyan-400 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                >
                  R{r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card-pro rounded-2xl p-5 space-y-2 border-cyan-500/20 bg-slate-900/80">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Portal Status
          </span>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isRegActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className={`font-mono font-bold text-xs uppercase tracking-wider ${isRegActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isRegActive ? 'Registration Open' : 'Registration Closed'}
              </span>
            </div>
            <button
              onClick={toggleRegistrationStatus}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-bold text-slate-300 transition hover:border-cyan-500/40 hover:text-cyan-400"
            >
              Toggle
            </button>
          </div>
        </div>

        <div className="glass-card-pro rounded-2xl p-5 space-y-1 border-amber-500/20 bg-slate-900/80">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Pending Review
          </span>
          <p className="font-mono text-2xl font-black text-amber-400">{pendingCount}</p>
        </div>

        <div className="glass-card-pro rounded-2xl p-5 space-y-1 border-emerald-500/20 bg-slate-900/80">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            Total Verified
          </span>
          <p className="font-mono text-2xl font-black text-emerald-400">{verifiedCount} / {totalCount}</p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="glass-card-pro flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl p-4 border-cyan-500/20 bg-slate-900/80">
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          {(['ALL', 'Pending', 'Verified', 'Discard'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-4 py-2 transition ${statusFilter === st
                ? 'bg-cyan-400 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <svg className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search ID, Name, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
          />
        </div>
      </div>

      {/* STUDENTS TABLE */}
      <div className="glass-card-pro overflow-hidden rounded-3xl border-cyan-500/20 bg-slate-900/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/90 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Student ID / Name</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Method / Receipt</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 font-mono">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent mb-2" />
                    መረጃው እየተጫነ ነው...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    ምንም የተገኘ ተማሪ የለም።
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.user_id} className="transition hover:bg-slate-900/90">
                    <td className="p-4">
                      <p className="font-bold text-slate-100">{st.full_name}</p>
                      <p className="font-mono text-[11px] text-cyan-400 font-semibold">{st.student_custom_id || `ID: ${st.user_id}`}</p>
                    </td>
                    <td className="p-4 font-mono text-xs">
                      <p className="text-slate-200">{st.phone}</p>
                      <p className="text-slate-500 text-[11px]">{st.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-300">{st.payment_method || 'CBE'}</span>
                      {st.screenshot_file_id && (
                        <button
                          type="button"
                          onClick={() => setSelectedReceiptUrl(st.screenshot_file_id || null)}
                          className="ml-2.5 inline-flex items-center gap-1 font-bold text-cyan-400 hover:text-cyan-300 underline transition"
                        >
                          <svg className="h-3.5 w-3.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                          <span>View Receipt</span>
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${st.status === 'Verified'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : st.status === 'Discard'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                        {st.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {st.status !== 'Verified' && (
                        <button
                          type="button"
                          onClick={() => {
                            setVerifyingStudent(st);
                            setEntranceLink('https://t.me/+AXR_PRIVATE_JOIN_LINK');
                          }}
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-1.5 font-black text-slate-950 transition hover:bg-emerald-400"
                        >
                          <svg className="h-3.5 w-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          <span>Verify</span>
                        </button>
                      )}
                      {st.status !== 'Discard' && (
                        <button
                          type="button"
                          onClick={() => setDiscardingStudent(st)}
                          className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 font-bold text-white transition hover:bg-rose-500"
                        >
                          <svg className="h-3.5 w-3.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Discard</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECEIPT VIEW MODAL */}
      {selectedReceiptUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-2xl transition-all">
          <div className="glass-card-pro relative max-w-xl w-full max-h-[85vh] rounded-3xl p-5 border-cyan-500/40 bg-slate-900 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">
                Receipt Image Preview
              </h3>
              <button
                type="button"
                onClick={() => setSelectedReceiptUrl(null)}
                className="rounded-xl border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-slate-100 transition"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative aspect-square w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
              <Image src={selectedReceiptUrl} alt="Receipt" fill unoptimized className="object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* VERIFY MODAL */}
      {verifyingStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-2xl transition-all">
          <div className="glass-card-pro max-w-md w-full rounded-3xl p-6 space-y-5 border-emerald-500/40 bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold font-mono text-emerald-400 uppercase tracking-wider">
                Verify Student Payment
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ለተማሪው <b className="text-slate-100">{verifyingStudent.full_name}</b> የሚላከውን የቴሌግራም የመግቢያ ሊንክ ያስገቡ፦
            </p>
            <input
              type="text"
              value={entranceLink}
              onChange={(e) => setEntranceLink(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-100 focus:border-emerald-400 focus:outline-none transition"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setVerifyingStudent(null)}
                className="w-1/2 rounded-xl border border-slate-800 bg-slate-950 py-3 text-xs font-bold text-slate-300 hover:bg-slate-900 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVerify}
                disabled={actionLoading}
                className="w-1/2 rounded-xl bg-emerald-400 py-3 text-xs font-black text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
              >
                {actionLoading ? 'Verifying...' : 'Confirm Verify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISCARD MODAL */}
      {discardingStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-2xl transition-all">
          <div className="glass-card-pro max-w-md w-full rounded-3xl p-6 space-y-5 border-rose-500/40 bg-slate-900">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="text-sm font-bold font-mono text-rose-400 uppercase tracking-wider">
                Discard Student Application
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ለተማሪው <b className="text-slate-100">{discardingStudent.full_name}</b> የሚላከውን የውድቅ መደረጊያ ምክንያት ያስገቡ፦
            </p>
            <textarea
              rows={3}
              placeholder="ምክንያት ይጻፉ..."
              value={discardReason}
              onChange={(e) => setDiscardReason(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-100 focus:border-rose-400 focus:outline-none transition"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDiscardingStudent(null)}
                className="w-1/2 rounded-xl border border-slate-800 bg-slate-950 py-3 text-xs font-bold text-slate-300 hover:bg-slate-900 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                disabled={actionLoading}
                className="w-1/2 rounded-xl bg-rose-600 py-3 text-xs font-bold text-white transition hover:bg-rose-500 disabled:opacity-50"
              >
                {actionLoading ? 'Discarding...' : 'Confirm Discard'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}