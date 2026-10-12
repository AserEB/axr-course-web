'use client';

import React from 'react';
import Link from 'next/link';
import { Student } from '@/types';

interface StudentCardProps {
  student: Student;
}

export default function StudentCard({ student }: StudentCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 shadow-2xl">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">AxR Official Pass</span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            student.status === 'Verified'
              ? 'bg-emerald-500/20 text-emerald-400'
              : student.status === 'Discard'
              ? 'bg-rose-500/20 text-rose-400'
              : 'bg-amber-500/20 text-amber-400'
          }`}
        >
          {student.status}
        </span>
      </div>

      {/* Student Profile Info */}
      <div className="mt-6 text-center space-y-2">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-500/30 bg-slate-950 text-3xl shadow-inner">
          🎓
        </div>
        <h2 className="text-xl font-extrabold text-slate-100">{student.full_name}</h2>
        <p className="font-mono text-sm font-bold text-cyan-400">
          {student.student_custom_id || `ID: ${student.user_id}`}
        </p>
      </div>

      {/* Detail Specifications */}
      <div className="mt-6 space-y-2.5 border-t border-slate-800/80 pt-4 font-mono text-xs text-slate-300">
        <div className="flex justify-between">
          <span className="text-slate-500">Course:</span>
          <span>Prompt Engineering</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Batch:</span>
          <span>Round {student.round}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Phone:</span>
          <span>{student.phone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Email:</span>
          <span className="truncate max-w-[150px]">{student.email}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 flex gap-2">
        <Link
          href="/student/profile"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 text-center text-xs font-semibold text-slate-200 transition hover:bg-slate-900"
        >
          ✏️ Edit Profile
        </Link>
      </div>
    </div>
  );
}