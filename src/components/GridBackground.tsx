import React from 'react';

export default function GridBackground({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen w-full bg-transparent bg-animated-grid text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
            {/* High-Contrast Ambient Cyber Glow Orbs */}
            <div className="pointer-events-none fixed -top-40 left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-cyan-500/25 via-sky-600/20 to-blue-700/20 blur-[150px] animate-orb-1" />
            <div className="pointer-events-none fixed top-1/3 -left-48 -z-10 h-[650px] w-[650px] rounded-full bg-gradient-to-br from-blue-600/20 via-indigo-700/15 to-cyan-400/15 blur-[160px] animate-orb-2" />
            <div className="pointer-events-none fixed -bottom-40 -right-48 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-tl from-cyan-400/20 via-blue-600/15 to-transparent blur-[150px] animate-orb-1" />

            {/* Main Layout Container */}
            <div className="relative z-10 flex min-h-screen flex-col">
                {children}
            </div>
        </div>
    );
}