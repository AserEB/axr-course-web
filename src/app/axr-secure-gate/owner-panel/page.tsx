'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

interface AdminUser {
  id: string;
  username: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function OwnerPanelPage() {
  const [mounted, setMounted] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  // Super Owner Password Change State
  const [currentOwnerPass, setCurrentOwnerPass] = useState('');
  const [newOwnerPass, setNewOwnerPass] = useState('');
  const [confirmOwnerPass, setConfirmOwnerPass] = useState('');
  const [passChanging, setPassChanging] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Admin Users Management State
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [newAdminUser, setNewAdminUser] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'assistant',
  });
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const fetchOwnerData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAdminUsers(data as AdminUser[]);
      }
    } catch (err) {
      console.error('Fetch admin users error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('admin_role');
    if (role !== 'owner') {
      window.location.href = '/axr-secure-gate/dashboard';
      return;
    }
    setIsOwner(true);
    fetchOwnerData();
  }, [fetchOwnerData]);

  if (!mounted || !isOwner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          <p className="font-mono text-xs font-bold uppercase text-indigo-400">Verifying Owner Access...</p>
        </div>
      </div>
    );
  }

  // Handle Super Owner Password Change
  const handleChangeOwnerPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (newOwnerPass !== confirmOwnerPass) {
      setPassMessage({ type: 'error', text: 'አዲሱ Password እና ማረጋገጫው አይመሳሰሉም!' });
      return;
    }

    if (newOwnerPass.length < 6) {
      setPassMessage({ type: 'error', text: 'Password ቢያንስ 6 አሃዝ/ፊደል መሆን አለበት።' });
      return;
    }

    setPassChanging(true);
    try {
      // Update Password in admin_users table for owner account 'AxRCourse'
      const { error } = await supabase
        .from('admin_users')
        .update({ password_hash: newOwnerPass.trim() })
        .eq('username', 'AxRCourse');

      if (error) throw new Error(error.message);

      setPassMessage({ type: 'success', text: 'የ Super Owner ሚስጥራዊ ቁጥር (Password) በተሳካ ሁኔታ ተቀይሯል!' });
      setCurrentOwnerPass('');
      setNewOwnerPass('');
      setConfirmOwnerPass('');
    } catch (err: unknown) {
      const error = err as Error;
      setPassMessage({ type: 'error', text: error.message || 'Password መቀየር አልተቻለም።' });
    } finally {
      setPassChanging(false);
    }
  };

  // Handle Creating New Admin Account
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUser.username.trim() || !newAdminUser.password.trim() || !newAdminUser.full_name.trim()) {
      alert('እባክዎ ሁሉንም መስኮች ይሙሉ!');
      return;
    }

    setCreatingAdmin(true);
    try {
      const { error } = await supabase.from('admin_users').insert([
        {
          username: newAdminUser.username.trim(),
          password_hash: newAdminUser.password.trim(),
          full_name: newAdminUser.full_name.trim(),
          role: newAdminUser.role,
          is_active: true,
        },
      ]);

      if (error) throw new Error(error.message);

      alert(`አዲስ አድሚን (${newAdminUser.username}) በተሳካ ሁኔታ ተፈጥሯል!`);
      setNewAdminUser({ username: '', password: '', full_name: '', role: 'assistant' });
      await fetchOwnerData();
    } catch (err: unknown) {
      const error = err as Error;
      alert(`አድሚን መፍጠር አልተቻለም፦ ${error.message}`);
    } finally {
      setCreatingAdmin(false);
    }
  };

  // Toggle Admin Active Status
  const toggleAdminStatus = async (user: AdminUser) => {
    if (user.username === 'AxRCourse') {
      alert('የ Super Owner አካውንትን መዝጋት አይቻልም!');
      return;
    }

    try {
      await supabase
        .from('admin_users')
        .update({ is_active: !user.is_active })
        .eq('id', user.id);

      await fetchOwnerData();
    } catch (err) {
      console.error('Toggle admin status error:', err);
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:py-12 space-y-8 bg-slate-950 text-slate-100 animate-fade-in-up">

      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/40 bg-indigo-950/40 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0112 2.714z" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-100">Super Owner Control Center</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            System Administration & Security Management
          </p>
        </div>

        <Link
          href="/axr-secure-gate/dashboard"
          className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:border-slate-700 hover:bg-slate-800"
        >
          <span>← Back to Dashboard</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* SUPER OWNER PASSWORD CHANGE SECTION (9ኛ) */}
        <div className="glass-card-pro rounded-3xl p-6 sm:p-8 border border-indigo-500/30 bg-slate-900/90 space-y-6 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
          <div className="border-b border-slate-800 pb-4 space-y-1">
            <h2 className="text-base font-black text-indigo-300 uppercase tracking-wider flex items-center gap-2">
              <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
              <span>Change Super Owner Password (9ኛ)</span>
            </h2>
            <p className="text-xs text-slate-400">የ AxRCourse Super Owner መግቢያ Password መቀየሪያ</p>
          </div>

          {passMessage && (
            <div className={`p-4 rounded-2xl border text-xs font-semibold ${passMessage.type === 'success' ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300' : 'border-rose-500/40 bg-rose-950/40 text-rose-300'}`}>
              {passMessage.text}
            </div>
          )}

          <form onSubmit={handleChangeOwnerPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300">አዲስ Password</label>
              <input
                type="password"
                required
                placeholder="አዲስ Password ያስገቡ"
                value={newOwnerPass}
                onChange={(e) => setNewOwnerPass(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300">አዲሱን Password ያረጋግጡ</label>
              <input
                type="password"
                required
                placeholder="አዲሱን Password በድጋሚ ያስገቡ"
                value={confirmOwnerPass}
                onChange={(e) => setConfirmOwnerPass(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={passChanging}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 py-3.5 text-xs font-black text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] transition hover:scale-[1.01] disabled:opacity-50"
            >
              {passChanging ? 'በማዘመን ላይ...' : 'Update Owner Password'}
            </button>
          </form>
        </div>

        {/* CREATE NEW ADMIN ACCOUNT SECTION */}
        <div className="glass-card-pro rounded-3xl p-6 sm:p-8 border border-cyan-500/30 bg-slate-900/90 space-y-6">
          <div className="border-b border-slate-800 pb-4 space-y-1">
            <h2 className="text-base font-black text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
              </svg>
              <span>Create Assistant Admin Account</span>
            </h2>
            <p className="text-xs text-slate-400">ለሰራተኞች ወይም ረዳቶች አዲስ የአድሚን አካውንት መፍጠሪያ</p>
          </div>

          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300">Full Name</label>
              <input
                type="text"
                required
                placeholder="ለምሳሌ፦ ዮናስ አበበ"
                value={newAdminUser.full_name}
                onChange={(e) => setNewAdminUser({ ...newAdminUser, full_name: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300">Username</label>
                <input
                  type="text"
                  required
                  placeholder="yonas_admin"
                  value={newAdminUser.username}
                  onChange={(e) => setNewAdminUser({ ...newAdminUser, username: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newAdminUser.password}
                  onChange={(e) => setNewAdminUser({ ...newAdminUser, password: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingAdmin}
              className="w-full rounded-xl bg-cyan-500 py-3.5 text-xs font-black text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.25)] transition hover:bg-cyan-400 disabled:opacity-50"
            >
              {creatingAdmin ? 'በመፍጠር ላይ...' : 'Create Admin Account'}
            </button>
          </form>
        </div>

      </div>

      {/* ADMIN USERS LIST TABLE */}
      <div className="glass-card-pro overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 space-y-4 p-6">
        <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
          Existing System Administrators List
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/90 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3">Full Name / Username</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 font-mono">
                    የአድሚን መረጃዎች እየተጫኑ ነው...
                  </td>
                </tr>
              ) : adminUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    ምንም የተመዘገበ አድሚን የለም።
                  </td>
                </tr>
              ) : (
                adminUsers.map((usr) => (
                  <tr key={usr.id} className="transition hover:bg-slate-950/60">
                    <td className="p-3">
                      <p className="font-bold text-slate-100">{usr.full_name}</p>
                      <p className="font-mono text-[11px] text-cyan-400">@{usr.username}</p>
                    </td>
                    <td className="p-3 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${usr.role === 'owner' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-300'}`}>
                        {usr.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 font-mono">
                      <span className={`text-[10px] font-bold ${usr.is_active ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {usr.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {usr.username !== 'AxRCourse' && (
                        <button
                          type="button"
                          onClick={() => toggleAdminStatus(usr)}
                          className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${usr.is_active ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30 hover:bg-rose-900' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900'}`}
                        >
                          {usr.is_active ? 'Disable' : 'Enable'}
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

    </div>
  );
}