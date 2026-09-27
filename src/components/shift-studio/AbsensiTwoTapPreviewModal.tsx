import React from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, HelpCircle, ArrowRight } from 'lucide-react';

interface AbsensiTwoTapPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AbsensiTwoTapPreviewModal: React.FC<AbsensiTwoTapPreviewModalProps> = ({
    isOpen,
    onClose,
}) => {
    if (!isOpen || typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 sm:top-7 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="fixed inset-0 sm:top-7" onClick={onClose} />
            <div
                className="relative z-10 w-full max-w-xl rounded-xl bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200/90 dark:border-slate-700 overflow-hidden flex flex-col max-h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-current/10 shrink-0">
                    <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                            <HelpCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-bold">Petunjuk Absensi Kantor</h3>
                            <p className="text-[11px] opacity-60">Panduan Penerjemahan Data Absensi Mentah Masuk & Pulang</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer text-current/70 hover:text-current transition-colors"
                        title="Tutup (Esc)"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Skenario 1: Hari OFF setelah shift malam */}
                    <div className="p-3.5 rounded-lg bg-teal-50/40 dark:bg-zinc-800/40 border border-teal-200/60 dark:border-zinc-700/60 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-teal-700 dark:text-teal-400">Skenario 1: Hari OFF Setelah Shift Malam</h4>
                            <span className="px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-400 text-[10px] font-bold">Jam Pulang Kemarin</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2 rounded-lg bg-white/70 dark:bg-zinc-800 border border-slate-200/70 dark:border-zinc-700">
                                <span className="opacity-60 block text-[9px]">Data Mentah Kantor:</span>
                                <div className="font-mono mt-0.5 font-bold">04:30</div>
                            </div>
                            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-400">
                                <span className="opacity-80 block text-[9px]">Hasil Terjemahan:</span>
                                <div className="font-bold mt-0.5">Penutup Shift Kemarin & Tetap OFF</div>
                            </div>
                        </div>
                        <p className="text-[10px] opacity-70">
                            Sistem mengenali jam 04:30 sebagai jam pulang dinas shift malam kemarin, sehingga jadwal hari ini tetap murni OFF tanpa dianggap masuk kerja.
                        </p>
                    </div>

                    {/* Skenario 2: Masuk Ekstra di Hari Libur */}
                    <div className="p-3.5 rounded-lg bg-amber-50/40 dark:bg-zinc-800/40 border border-amber-200/60 dark:border-zinc-700/60 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400">Skenario 2: Masuk Ekstra di Hari OFF / Libur</h4>
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-bold">Dinas di Hari Libur</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2 rounded-lg bg-white/70 dark:bg-zinc-800 border border-slate-200/70 dark:border-zinc-700">
                                <span className="opacity-60 block text-[9px]">Data Mentah Kantor:</span>
                                <div className="font-mono mt-0.5 font-bold">Masuk: 08:00 | Pulang: 17:30</div>
                            </div>
                            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400">
                                <span className="opacity-80 block text-[9px]">Hasil Terjemahan:</span>
                                <div className="font-bold mt-0.5">Lembur Hari Libur Diaktifkan</div>
                            </div>
                        </div>
                        <p className="text-[10px] opacity-70">
                            Ketika terdapat pencatatan jam masuk dan pulang dinas pada hari libur, sistem mengenali Anda masuk dinas dan otomatis mengaktifkan perhitungan lembur hari libur.
                        </p>
                    </div>

                    {/* Skenario 3: Shift Beruntun (Malam lanjut Pagi) */}
                    <div className="p-3.5 rounded-lg bg-teal-50/40 dark:bg-zinc-800/40 border border-teal-200/60 dark:border-zinc-700/60 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-teal-700 dark:text-teal-400">Skenario 3: Shift Beruntun (Malam lanjut Pagi)</h4>
                            <span className="px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-400 text-[10px] font-bold">Transisi Flexi</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="p-2 rounded-lg bg-white/70 dark:bg-zinc-800 border border-slate-200/70 dark:border-zinc-700">
                                <span className="opacity-60 block text-[9px]">Data Mentah Kantor:</span>
                                <div className="font-mono mt-0.5 font-bold">Masuk: 04:30 | Pulang: 17:30</div>
                            </div>
                            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-400">
                                <span className="opacity-80 block text-[9px]">Hasil Terjemahan:</span>
                                <div className="font-bold mt-0.5">04:30 Kemarin, 07:30-17:30 Hari Ini</div>
                            </div>
                        </div>
                        <p className="text-[10px] opacity-70">
                            Jam 04:30 dialokasikan menutup shift malam kemarin, sedangkan jam masuk hari ini dipatok ke batas awal flexi (07:30/08:00) sehingga total jam kerja 9.5 jam tercapai sempurna.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-current/10 flex justify-end bg-current/5 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-bold rounded-lg bg-teal-600 text-white hover:bg-teal-700 cursor-pointer shadow-xs transition-all active:scale-95"
                    >
                        Tutup Petunjuk
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const PetunjukAbsensiModal = AbsensiTwoTapPreviewModal;
