import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { AppTheme } from '../types';

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

interface ResetConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    selectedMonth: number;
    selectedYear: number;
    theme: AppTheme;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    selectedMonth,
    selectedYear,
    theme,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div
                className={`relative w-full max-w-md p-6 shadow-2xl border animate-in zoom-in-95 duration-200 ${
                    theme === 'winamp'
                        ? 'rounded-none bg-[#2C2E3B] border-2 border-[#00FF00] text-[#00FF00] font-mono'
                        : theme === 'vista'
                        ? 'rounded-2xl bg-white/75 backdrop-blur-2xl border-white/80 text-slate-900 shadow-[0_25px_60px_rgba(14,116,224,0.3)] ring-1 ring-sky-300/30'
                        : theme === 'dark'
                        ? 'rounded-2xl bg-[#1E1E1E] border-slate-700 text-[#E0E0E0]'
                        : 'rounded-2xl bg-white border-slate-200 text-[#011627]'
                }`}
            >
                <div className="flex items-start gap-3.5 mb-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                        <h3
                            className={`text-base font-extrabold ${
                                theme === 'winamp'
                                    ? 'text-[#00FF00]'
                                    : theme === 'dark'
                                    ? 'text-white'
                                    : 'text-slate-900'
                            }`}
                        >
                            Kosongkan Data Kalender?
                        </h3>
                        <p
                            className={`text-xs mt-0.5 ${
                                theme === 'winamp'
                                    ? 'text-emerald-400'
                                    : theme === 'dark'
                                    ? 'text-slate-400'
                                    : 'text-slate-500'
                            }`}
                        >
                            Bulan {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                        </p>
                    </div>
                </div>

                <p
                    className={`text-xs sm:text-sm leading-relaxed mb-6 ${
                        theme === 'winamp'
                            ? 'text-emerald-300'
                            : theme === 'dark'
                            ? 'text-slate-300'
                            : 'text-slate-600'
                    }`}
                >
                    Semua data di kalender termasuk jadwal shift, jam masuk, jam pulang, absensi CEISA, dan catatan untuk bulan{' '}
                    <strong>
                        {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                    </strong>{' '}
                    akan dikosongkan.
                    <br />
                    <br />
                    <span className="text-emerald-500 font-semibold">Catatan:</span> Anda dapat membatalkan tindakan ini
                    kapan saja dengan tombol <strong>"Batal Reset"</strong> setelah dikosongkan.
                </p>

                <div className="flex items-center justify-end space-x-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-4 py-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                            theme === 'winamp'
                                ? 'rounded-none border border-[#00FF00] bg-black text-[#00FF00] hover:bg-[#00FF00]/10'
                                : theme === 'dark'
                                ? 'rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                                : 'rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="cyber-glitch-rose flex items-center space-x-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs sm:text-sm font-bold text-white cursor-pointer shadow-xs"
                    >
                        <RotateCcw className="h-4 w-4" />
                        <span>Ya, Kosongkan Kalender</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
