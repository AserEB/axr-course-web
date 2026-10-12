'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { AdminUser } from '@/types';

export default function OwnerPanelPage() {
  const router = useRouter();

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // New Admin Form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('admin_role');
    if (role !== 'owner') {
      router.push('/axr-secure-gate/dashboard');
      return;
    }

    fetchAdmins();
  }, [router]);

  const fetchAdmins = async () => {
    const { data } = await supabase.from('admin_users').select('*').order('created_at', { ascending: false });
    if (data) setAdmins(data as AdminUser[]);
    setLoading(false);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMsg('');

    try {
      const { error } = await supabase.from('admin_users').insert([
        {
          username: newUsername.trim(),
          password_hash: newPassword,
          full_name: newFullName.trim(),
          role: 'assistant',
          is_active: true,
        },
      ]);

      if (error) throw new Error(error.message);

      setMsg('አዲስ Assistant Admin በተሳካ ሁኔታ ተፈጥሯል!');
      setNewUsername('');
      setNewPassword('');
      setNewFullName('');
      await fetchAdmins();
    } catch (err: unknown) {
      const error = err as Error;
      setMsg(`ስህተት፦ ${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const toggleAdminActive = async (adminId: string, currentStatus: boolean) => {
    await supabase.from('admin_users').update({ is_active: !currentStatus }).eq('id', adminId);
    await fetchAdmins();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-16 space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/40 bg-indigo-950/40 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <svg className="h-5 w-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-indigo-400">Owner Management Panel</h1>
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

      {msg && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-indigo-500/30 bg-indigo-950/40 p-4 text-xs font-bold text-indigo-200 backdrop-blur-md">
          <svg className="h-4 w-4 shrink-0 text-indigo-400 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <span>{msg}</span>
        </div>
      )}

      {/* CREATE NEW ASSISTANT ADMIN */}
      <form onSubmit={handleCreateAdmin} className="glass-card-pro rounded-3xl p-6 sm:p-8 space-y-5 border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <svg className="h-4 w-4 text-indigo-400 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            አዲስ Assistant Admin መፍጠሪያ
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="Full Name"
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none transition"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Username</label>
            <input
              type="text"
              required
              placeholder="Username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none transition"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:outline-none transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={creating}
          className="flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-indigo-500/20 transition hover:bg-indigo-400 disabled:opacity-50"
        >
          <span>{creating ? 'መፍጠር ላይ ነው...' : 'Create Assistant Admin'}</span>
          {!creating && (
            <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          )}
        </button>
      </form>

      {/* ADMIN LIST */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          የአድሚኖች ዝርዝር ({admins.length})
        </h2>

        {loading ? (
          <div className="glass-card-pro rounded-2xl p-6 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent mb-2" />
            <p className="text-xs font-mono text-indigo-400">እየተጫነ ነው...</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {admins.map((adm) => (
              <div
                key={adm.id}
                className="glass-card-pro flex items-center justify-between rounded-2xl p-4 text-xs border-indigo-500/20"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-100">
                    {adm.full_name} <span className="font-mono text-indigo-400">(@{adm.username})</span>
                  </p>
                  <p className="text-slate-500 font-mono text-[10px] uppercase">Role: {adm.role}</p>
                </div>

                {adm.role !== 'owner' && (
                  <button
                    type="button"
                    onClick={() => toggleAdminActive(adm.id, adm.is_active)}
                    className={`rounded-xl px-3.5 py-1.5 font-bold transition ${adm.is_active
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                      }`}
                  >
                    {adm.is_active ? 'Revoke Access' : 'Activate Access'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}