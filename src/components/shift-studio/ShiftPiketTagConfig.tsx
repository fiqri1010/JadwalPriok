import React from 'react';
import { Briefcase, CalendarCheck, ShieldCheck, Info } from 'lucide-react';

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
}

export const ShiftPiketTagConfig: React.FC<ShiftPiketTagConfigProps> = ({
    isPiket = false,
    piketHariKerja = false,
    piketHariLibur = true,
    piketHariKerjaDenganOff = false,
    onChange,
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

    return (
        <div className="space-y-2 font-sans">
            {/* Switch 1: Piket hari kerja */}
            <div className="p-2 rounded-xl bg-white/80 dark:bg-[#161616] border border-slate-200/80 dark:border-zinc-800 shadow-2xs transition-colors">
                <div className="flex items-start sm:items-center">
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mr-2 mt-0.5 sm:mt-0">
                        <input
                            type="checkbox"
                            checked={effectivePiketHariKerja}
                            onChange={(e) => handleToggleHariKerja(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                    <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                                Piket Hari Kerja
                            </h4>
                        </div>
                        <p className="text-[11px] opacity-75 leading-relaxed">
                            Tetapkan shift ini sebagai dinas piket jika dijalankan pada hari kerja biasa (Senin – Jumat).
                        </p>
                    </div>
                </div>
            </div>

            {/* Switch 3: Piket Hari Kerja Dengan OFF (Dipindahkan ke tengah) */}
            <div className={`p-2 rounded-xl bg-white/80 dark:bg-[#161616] border border-slate-200/80 dark:border-zinc-800 shadow-2xs transition-all ${
                !effectivePiketHariKerja ? 'opacity-50' : 'opacity-100'
            }`}>
                <div className="flex items-start sm:items-center">
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mr-2 mt-0.5 sm:mt-0">
                        <input
                            type="checkbox"
                            disabled={!effectivePiketHariKerja}
                            checked={effectivePiketHariKerjaDenganOff && effectivePiketHariKerja}
                            onChange={(e) => handleToggleHariKerjaDenganOff(e.target.checked)}
                            className="sr-only peer disabled:cursor-not-allowed"
                        />
                        <div className="w-9 h-5 bg-slate-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600 peer-disabled:opacity-40"></div>
                    </label>
                    <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                                Piket Hari Kerja Dengan OFF
                            </h4>
                        </div>
                        <p className="text-[11px] opacity-75 leading-relaxed">
                            Berikan hak perolehan libur/cuti <strong>OFF Pengganti</strong> melalui antrean FIFO ketika bertugas piket pada hari kerja.
                        </p>
                    </div>
                </div>
            </div>

            {/* Switch 2: Piket Hari Libur / Tanggal Merah */}
            <div className="p-2 rounded-xl bg-white/80 dark:bg-[#161616] border border-slate-200/80 dark:border-zinc-800 shadow-2xs transition-colors">
                <div className="flex items-start sm:items-center">
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mr-2 mt-0.5 sm:mt-0">
                        <input
                            type="checkbox"
                            checked={effectivePiketHariLibur}
                            onChange={(e) => handleToggleHariLibur(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                    <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                            <CalendarCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                                Piket Hari Libur / Tanggal Merah
                            </h4>
                        </div>
                        <p className="text-[11px] opacity-75 leading-relaxed">
                            Tetapkan shift ini sebagai dinas piket jika dijalankan pada hari Sabtu, Minggu, atau Hari Libur Nasional.
                        </p>
                    </div>
                </div>
            </div>

            {/* Status Summary Banner */}
            <div className="p-1.5 rounded-lg bg-slate-50/90 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold opacity-80 text-[11px]">Ringkasan Hak Piket:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[9.5px] ${
                        effectivePiketHariKerja
                            ? effectivePiketHariKerjaDenganOff
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                            : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}>
                        Hari Kerja: {effectivePiketHariKerja ? (effectivePiketHariKerjaDenganOff ? 'Piket (Dapat OFF)' : 'Piket (Tanpa OFF)') : 'Bukan Piket'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[9.5px] ${
                        effectivePiketHariLibur
                            ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                            : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}>
                        Hari Libur: {effectivePiketHariLibur ? 'Piket (Dapat OFF)' : 'Bukan Piket'}
                    </span>
                </div>
            </div>

            {/* Info Kriteria & Aturan FIFO */}
            <div className="p-2 rounded-lg bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-200/70 dark:border-zinc-800/80 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-xs sm:text-[12.5px] text-indigo-600 dark:text-indigo-400">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>Prinsip Penugasan Piket & Alokasi OFF:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1 leading-relaxed text-[11px] sm:text-[11.5px] text-slate-700 dark:text-zinc-300 opacity-95">
                    <li>Piket hari libur/tanggal merah otomatis memperoleh hak OFF Pengganti karena bertugas di luar hari kerja operasional.</li>
                    <li>Piket hari kerja dengan status <em>Dapat OFF</em> (seperti shift PM & Malam) akan mencocokkan jadwal OFF hari kerja pertama yang tersedia secara kronologis (FIFO).</li>
                </ul>
            </div>
        </div>
    );
};
