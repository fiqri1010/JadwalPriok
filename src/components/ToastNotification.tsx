import React, { useEffect } from 'react';
import { Undo2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppTheme } from '../types';

export interface ToastItem {
    id: string;
    message: string;
    description?: string;
    showUndo?: boolean;
}

interface ToastNotificationProps {
    toasts: ToastItem[];
    lastResetBackupState?: { year: number; month: number } | null;
    areAllLocked?: boolean;
    onUndoReset?: () => void;
    onCloseToast: (id: string) => void;
    theme?: AppTheme;
}

interface ToastCardProps {
    toast: ToastItem;
    theme: AppTheme;
    lastResetBackupState?: { year: number; month: number } | null;
    areAllLocked?: boolean;
    onUndoReset?: () => void;
    onClose: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({
    toast,
    theme,
    lastResetBackupState,
    areAllLocked = false,
    onUndoReset,
    onClose,
}) => {
    // Aturan notifikasi hilang setelah 3 detik sejak pertama kali muncul
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(toast.id);
        }, 3000);
        return () => clearTimeout(timer);
    }, [toast.id, onClose]);

    const isWinamp = theme === 'winamp';
    const isDark = theme === 'dark';
    const isVista = theme === 'vista';
    const isPaperSketch = theme === 'paperSketch';

    // Helper styling berdasarkan tema aktif
    const getCardThemeClasses = () => {
        if (isPaperSketch) {
            return 'bg-[#fffefb] border-2 border-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b] rounded-lg text-[#2b2b2b]';
        }
        if (isWinamp) {
            return 'bg-black border-2 border-[#00FF00] shadow-[0_0_15px_rgba(0,255,0,0.3)] rounded-none text-[#00FF00] font-mono';
        }
        if (isVista) {
            return 'bg-white/85 backdrop-blur-2xl border border-white/90 shadow-[0_12px_32px_rgba(14,116,224,0.25)] rounded-xl text-slate-800 ring-1 ring-sky-300/40';
        }
        if (isDark) {
            return 'bg-[#232531] border border-slate-700/80 shadow-2xl rounded-lg text-white';
        }
        // Default light theme
        return 'bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl rounded-xl text-slate-900';
    };

    const getIconBoxThemeClasses = () => {
        if (isPaperSketch) {
            return 'text-[#2ec4b6] bg-[#2ec4b6]/15 border-2 border-[#2b2b2b] rounded-md';
        }
        if (isWinamp) {
            return 'text-[#00FF00] bg-zinc-900 border border-[#00FF00]/50 rounded-none';
        }
        if (isVista) {
            return 'text-sky-600 bg-sky-500/10 border border-sky-400/30 rounded-lg';
        }
        if (isDark) {
            return 'text-[#2b9875] bg-white/5 backdrop-blur-xl border border-white/5 rounded-lg';
        }
        // Default
        return 'text-[#2b9875] bg-emerald-50 border border-emerald-200/70 rounded-lg';
    };

    const getTitleThemeClasses = () => {
        if (isPaperSketch) return 'text-[#2b2b2b] font-bold font-sketch-title tracking-wide';
        if (isWinamp) return 'text-[#00FF00] font-bold tracking-wide font-mono';
        if (isVista) return 'text-slate-900 font-bold';
        if (isDark) return 'text-white font-bold';
        return 'text-slate-900 font-bold';
    };

    const getDescThemeClasses = () => {
        if (isPaperSketch) return 'text-stone-600 font-medium font-sketch-hand';
        if (isWinamp) return 'text-[#00FF00]/70 font-mono';
        if (isVista) return 'text-slate-600';
        if (isDark) return 'text-gray-400';
        return 'text-slate-500';
    };

    const getCloseButtonThemeClasses = () => {
        if (isPaperSketch) return 'text-stone-600 hover:bg-stone-200/80 hover:text-black border border-[#2b2b2b]/30 rounded-md';
        if (isWinamp) return 'text-[#00FF00]/60 hover:bg-[#00FF00]/20 hover:text-[#00FF00] rounded-none';
        if (isVista) return 'text-slate-500 hover:bg-white/40 hover:text-slate-900 rounded-md';
        if (isDark) return 'text-gray-400 hover:bg-white/5 hover:text-white rounded-md';
        return 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-md';
    };

    const displayDescription = toast.description || 'Status jadwal kerja terkini';

    return (
        <div
            className={`succsess-alert pointer-events-auto cursor-default inline-flex items-center justify-between w-auto min-w-[200px] max-w-full min-h-[44px] sm:min-h-[50px] px-3 py-1.5 gap-2.5 select-none ${getCardThemeClasses()}`}
        >
            {/* Left Side: Close Button & Undo Action */}
            <div className="flex items-center gap-1.5 shrink-0">
                <button
                    type="button"
                    onClick={() => onClose(toast.id)}
                    className={`p-1 transition-colors duration-150 ease-linear cursor-pointer ${getCloseButtonThemeClasses()}`}
                    title="Tutup notifikasi"
                    aria-label="Tutup notifikasi"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.8"
                        stroke="currentColor"
                        className="w-4 h-4 sm:w-4.5 sm:h-4.5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>

                {(toast.showUndo || (lastResetBackupState !== null && !areAllLocked)) && onUndoReset && (
                    <button
                        type="button"
                        onClick={() => {
                            onUndoReset();
                            onClose(toast.id);
                        }}
                        className={`px-2 py-1 text-[10.5px] font-bold transition-all duration-150 cursor-pointer flex items-center gap-1 shrink-0 ${
                            isPaperSketch
                                ? 'bg-[#ffb4b8] text-[#2b2b2b] border border-[#2b2b2b] rounded-md shadow-[1px_1px_0px_#2b2b2b] hover:bg-[#ff999f]'
                                : isWinamp
                                ? 'bg-black text-[#00FF00] border border-[#00FF00] rounded-none hover:bg-[#00FF00]/20'
                                : 'bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-2xs'
                        }`}
                        title="Batalkan reset jadwal"
                    >
                        <Undo2 className="h-3 w-3" />
                        <span>Batal</span>
                    </button>
                )}
            </div>

            {/* Right Side: Texts (Right-Aligned) and Mirrored Icon */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-end">
                {/* Texts - Dynamic width according to content */}
                <div className="min-w-0 text-right leading-tight">
                    <p className={`text-[11px] sm:text-xs leading-snug whitespace-nowrap ${getTitleThemeClasses()}`} title={toast.message}>
                        {toast.message}
                    </p>
                    {displayDescription && (
                        <p className={`text-[9.5px] sm:text-[10.5px] mt-0.5 leading-tight opacity-80 truncate max-w-[200px] sm:max-w-[260px] ${getDescThemeClasses()}`} title={displayDescription}>
                            {displayDescription}
                        </p>
                    )}
                </div>

                {/* Mirrored Icon Container on the right */}
                <div className={`p-1 shrink-0 flex items-center justify-center ${getIconBoxThemeClasses()}`}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-4.5 h-4.5 sm:w-5 sm:h-5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export const ToastNotification: React.FC<ToastNotificationProps> = ({
    toasts,
    lastResetBackupState,
    areAllLocked = false,
    onUndoReset,
    onCloseToast,
    theme = 'default',
}) => {
    return (
        <div
            className="fixed bottom-20 md:bottom-6 left-3 sm:left-6 right-auto z-[100001] flex flex-col-reverse items-start gap-2.5 w-auto max-w-[calc(100vw-1.5rem)] sm:max-w-md pointer-events-none"
            aria-live="polite"
        >
            <AnimatePresence mode="popLayout" initial={false}>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        layout
                        initial={{ opacity: 0, y: 28, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -16, scale: 0.92, transition: { duration: 0.25, ease: 'easeIn' } }}
                        transition={{
                            layout: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }, // Animasi transisi slide lembut 0.6 detik saat bergeser ke atas
                            opacity: { duration: 0.25, ease: 'easeOut' },
                            y: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                            scale: { duration: 0.3, ease: 'easeOut' },
                        }}
                        className="w-auto pointer-events-auto"
                    >
                        <ToastCard
                            toast={toast}
                            theme={theme}
                            lastResetBackupState={lastResetBackupState}
                            areAllLocked={areAllLocked}
                            onUndoReset={onUndoReset}
                            onClose={onCloseToast}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
