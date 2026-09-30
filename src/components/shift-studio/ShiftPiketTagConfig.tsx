import React from 'react';
import { Briefcase, CalendarCheck, ShieldCheck, Info } from 'lucide-react';
import { AppTheme } from '../../types';
import { Checkbox } from '../ui/Checkbox';

export interface ShiftPiketUpdates {
    isPiket: boolean;
    piketHariKerja: boolean;
    piketHariLibur: boolean;
    piketHariKerjaDenganOff: boolean;
}

interface ShiftPiketTagConfigProps {
    isPiket?: boolean;
    piketHariKerja?: boolean;
    piketHariLibur?: boolean;
    piketHariKerjaDenganOff?: boolean;
    onChange: (updates: ShiftPiketUpdates) => void;
    shiftKey?: string;
    theme?: AppTheme;
}

export const ShiftPiketTagConfig: React.FC<ShiftPiketTagConfigProps> = ({
    isPiket = false,
    piketHariKerja = false,
    piketHariLibur = true,
    piketHariKerjaDenganOff = false,
    onChange,
    theme = 'default',
}) => {
    // Current effective values with fallbacks
    const effectivePiketHariKerja = piketHariKerja ?? isPiket;
    const effectivePiketHariLibur = piketHariLibur ?? true;
    const effectivePiketHariKerjaDenganOff = piketHariKerjaDenganOff ?? false;

    const handleToggleHariKerja = (val: boolean) => {
        onChange({
            isPiket: val || effectivePiketHariLibur,
            piketHariKerja: val,
            piketHariLibur: effectivePiketHariLibur,
            piketHariKerjaDenganOff: val ? effectivePiketHariKerjaDenganOff : false,
        });
    };

    const handleToggleHariLibur = (val: boolean) => {
        onChange({
            isPiket: effectivePiketHariKerja || val,
            piketHariKerja: effectivePiketHariKerja,
            piketHariLibur: val,
            piketHariKerjaDenganOff: effectivePiketHariKerjaDenganOff,
        });
    };

    const handleToggleHariKerjaDenganOff = (val: boolean) => {
        onChange({
            isPiket: effectivePiketHariKerja || effectivePiketHariLibur,
            piketHariKerja: effectivePiketHariKerja,
            piketHariLibur: effectivePiketHariLibur,
            piketHariKerjaDenganOff: val,
        });
    };

    const isDashboard = theme === 'dashboard';
    const cardBgClass = isDashboard ? 'bg-[#FFF5D0] border-[#4D2A00]/20' : 'bg-white/80 dark:bg-[#161616] border border-slate-200/80 dark:border-zinc-800';
    const textTitleClass = isDashboard ? 'text-[#4D2A00]' : 'text-slate-800 dark:text-zinc-200';
    const descClass = isDashboard ? 'text-[#4D2A00]/85' : 'text-slate-700 dark:text-zinc-300';

    return (
        <div className="space-y-2 font-sans">
            {/* Switch 1: Piket hari kerja */}
            <div className={`p-2 rounded-xl shadow-2xs transition-colors ${cardBgClass}`}>
                <div className="flex items-start sm:items-center">
                    <Checkbox
                        checked={effectivePiketHariKerja}
                        onChange={(e) => handleToggleHariKerja(e.target.checked)}
                        theme={theme}
                        containerClassName="mr-2.5 shrink-0 mt-0.5 sm:mt-0"
                    />
                    <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <h4 className={`text-xs font-bold ${textTitleClass}`}>
                                Piket Hari Kerja
                            </h4>
                        </div>
                        <p className={`text-[11px] opacity-75 leading-relaxed ${descClass}`}>
                            Tetapkan shift ini sebagai dinas piket jika dijalankan pada hari kerja biasa (Senin – Jumat).
                        </p>
                    </div>
                </div>
            </div>

            {/* Switch 3: Piket Hari Kerja Dengan OFF (Dipindahkan ke tengah) */}
            <div className={`p-2 rounded-xl shadow-2xs transition-all ${cardBgClass} ${
                !effectivePiketHariKerja ? 'opacity-50' : 'opacity-100'
            }`}>
                <div className="flex items-start sm:items-center">
                    <Checkbox
                        disabled={!effectivePiketHariKerja}
                        checked={effectivePiketHariKerjaDenganOff && effectivePiketHariKerja}
                        onChange={(e) => handleToggleHariKerjaDenganOff(e.target.checked)}
                        theme={theme}
                        containerClassName="mr-2.5 shrink-0 mt-0.5 sm:mt-0"
                    />
                    <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <h4 className={`text-xs font-bold ${textTitleClass}`}>
                                Piket Hari Kerja Dengan OFF
                            </h4>
                        </div>
                        <p className={`text-[11px] opacity-75 leading-relaxed ${descClass}`}>
                            Berikan hak perolehan libur/cuti <strong>OFF Pengganti</strong> melalui antrean FIFO ketika bertugas piket pada hari kerja.
                        </p>
                    </div>
                </div>
            </div>

            {/* Switch 2: Piket Hari Libur / Tanggal Merah */}
            <div className={`p-2 rounded-xl shadow-2xs transition-colors ${cardBgClass}`}>
                <div className="flex items-start sm:items-center">
                    <Checkbox
                        checked={effectivePiketHariLibur}
                        onChange={(e) => handleToggleHariLibur(e.target.checked)}
                        theme={theme}
                        containerClassName="mr-2.5 shrink-0 mt-0.5 sm:mt-0"
                    />
                    <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                            <CalendarCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <h4 className={`text-xs font-bold ${textTitleClass}`}>
                                Piket Hari Libur / Tanggal Merah
                            </h4>
                        </div>
                        <p className={`text-[11px] opacity-75 leading-relaxed ${descClass}`}>
                            Tetapkan shift ini sebagai dinas piket jika dijalankan pada hari Sabtu, Minggu, atau Hari Libur Nasional.
                        </p>
                    </div>
                </div>
            </div>

            {/* Status Summary Banner */}
            <div className={`p-1.5 rounded-lg border flex flex-wrap items-center justify-between gap-2 text-xs ${
                isDashboard
                    ? 'bg-[#FFF5D0] border-[#4D2A00]/25 text-[#4D2A00]'
                    : 'bg-slate-50/90 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800'
            }`}>
                <span className="font-semibold opacity-80 text-[11px]">Ringkasan Hak Piket:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[9.5px] ${
                        effectivePiketHariKerja
                            ? effectivePiketHariKerjaDenganOff
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                            : isDashboard
                            ? 'bg-[#4D2A00]/10 text-[#4D2A00]/70'
                            : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}>
                        Hari Kerja: {effectivePiketHariKerja ? (effectivePiketHariKerjaDenganOff ? 'Piket (Dapat OFF)' : 'Piket (Tanpa OFF)') : 'Bukan Piket'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[9.5px] ${
                        effectivePiketHariLibur
                            ? isDashboard
                                ? 'bg-[#B45309]/15 text-[#B45309]'
                                : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                            : isDashboard
                            ? 'bg-[#4D2A00]/10 text-[#4D2A00]/70'
                            : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}>
                        Hari Libur: {effectivePiketHariLibur ? 'Piket (Dapat OFF)' : 'Bukan Piket'}
                    </span>
                </div>
            </div>

            {/* Info Kriteria & Aturan FIFO */}
            <div className={`p-2 rounded-lg border space-y-1 ${
                isDashboard
                    ? 'bg-[#FFF5D0]/60 border-[#4D2A00]/20 text-[#4D2A00]'
                    : 'bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-200/70 dark:border-zinc-800/80'
            }`}>
                <div className={`flex items-center space-x-1.5 font-bold text-xs sm:text-[12.5px] ${
                    isDashboard ? 'text-[#B45309]' : 'text-indigo-600 dark:text-indigo-400'
                }`}>
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Prinsip Penugasan Piket & Alokasi OFF:</span>
                </div>
                <ul className={`list-disc list-inside space-y-1 pl-1 leading-relaxed text-[11px] sm:text-[11.5px] opacity-95 ${
                    isDashboard ? 'text-[#4D2A00]' : 'text-slate-700 dark:text-zinc-300'
                }`}>
                    <li>Piket hari libur/tanggal merah otomatis memperoleh hak OFF Pengganti karena bertugas di luar hari kerja operasional.</li>
                    <li>Piket hari kerja dengan status <em>Dapat OFF</em> (seperti shift PM & Malam) akan mencocokkan jadwal OFF hari kerja pertama yang tersedia secara kronologis (FIFO).</li>
                </ul>
            </div>
        </div>
    );
};
