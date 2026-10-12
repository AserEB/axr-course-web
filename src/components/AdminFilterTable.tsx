'use client';

import React from 'react';
import { Student } from '@/types';

interface AdminFilterTableProps {
    students: Student[];
    loading: boolean;
    onViewReceipt: (url: string) => void;
    onVerify: (student: Student) => void;
    onDiscard: (student: Student) => void;
}

export default function AdminFilterTable({
    students,
    loading,
    onViewReceipt,
    onVerify,
    onDiscard,
}: AdminFilterTableProps) {
    return (
        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-950/80 font-mono text-slate-400 uppercase">
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
                            <td colSpan={5} className="p-8 text-center text-slate-500">
                                መረጃው እየተጫነ ነው...
                            </td>
                        </tr>
                    ) : students.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-500">
                                ምንም የተገኘ ተማሪ የለም።
                            </td>
                        </tr>
                    ) : (
                        students.map((st) => (
                            <tr key={st.user_id} className="hover:bg-slate-950/40">
                                <td className="p-4">
                                    <p className="font-bold text-slate-100">{st.full_name}</p>
                                    <p className="font-mono text-[11px] text-cyan-400">
                                        {st.student_custom_id || `ID: ${st.user_id}`}
                                    </p>
                                </td>
                                <td className="p-4 font-mono">
                                    <p className="text-slate-200">{st.phone}</p>
                                    <p className="text-slate-500">{st.email}</p>
                                </td>
                                <td className="p-4">
                                    <span className="font-semibold text-slate-300">{st.payment_method || 'CBE'}</span>
                                    {st.screenshot_file_id && (
                                        <button
                                            onClick={() => onViewReceipt(st.screenshot_file_id!)}
                                            className="ml-2 text-cyan-400 underline hover:text-cyan-300"
                                        >
                                            🖼 View Receipt
                                        </button>
                                    )}
                                </td>
                                <td className="p-4">
                                    <span
                                        className={`rounded-full px-2.5 py-1 font-bold ${st.status === 'Verified'
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : st.status === 'Discard'
                                                ? 'bg-rose-500/20 text-rose-400'
                                                : 'bg-amber-500/20 text-amber-400'
                                            }`}
                                    >
                                        {st.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    {st.status !== 'Verified' && (
                                        <button
                                            onClick={() => onVerify(st)}
                                            className="rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-500"
                                        >
                                            ✅ Verify
                                        </button>
                                    )}
                                    {st.status !== 'Discard' && (
                                        <button
                                            onClick={() => onDiscard(st)}
                                            className="rounded-lg bg-rose-600 px-3 py-1.5 font-bold text-white hover:bg-rose-500"
                                        >
                                            ❌ Discard
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}