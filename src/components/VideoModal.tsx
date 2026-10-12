'use client';

import React, { useEffect } from 'react';

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl?: string;
}

export default function VideoModal({
    isOpen,
    onClose,
    videoUrl = 'https://youtu.be/ibcMs4KUvTw?si=vOz28UsNwqHbu-fg',
}: VideoModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Helper function to auto-convert any YouTube URL to an Embed URL
    const getEmbedUrl = (url: string) => {
        if (!url) return '';
        if (url.includes('youtube.com/embed/')) return `${url}?autoplay=1`;

        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);

        if (match && match[2].length === 11) {
            return `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`;
        }
        return url;
    };

    const embedSrc = getEmbedUrl(videoUrl);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-3 sm:p-6 backdrop-blur-2xl">
            {/* Overlay backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className="glass-card-pro relative w-full max-w-3xl sm:max-w-4xl max-h-[90vh] rounded-3xl p-4 sm:p-5 border-cyan-500/40 z-10 flex flex-col justify-between space-y-3 shadow-[0_0_50px_rgba(56,189,248,0.25)]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
                        <h3 className="text-xs sm:text-sm font-extrabold text-slate-100 uppercase tracking-wider">
                            Course Preview Video
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:text-slate-100 hover:border-cyan-400 transition"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Video Player Frame with Aspect Ratio */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shrink-0">
                    {embedSrc ? (
                        <iframe
                            src={embedSrc}
                            title="AxR Course Preview"
                            className="absolute inset-0 h-full w-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center p-6 text-center text-xs text-slate-400 font-mono">
                            የቪዲዮው ሊንክ አልተገኘም። እባክዎ የትክክለኛውን ቪዲዮ ሊንክ ያስገቡ።
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}