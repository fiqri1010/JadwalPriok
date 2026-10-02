import React from 'react';
import { AppTheme } from '../types';
import { PiketCalculationResult } from '../utils/piket';
import { Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { OffRelaxIcon } from './OffRelaxIcon';
import { BriefcaseIcon } from './BriefcaseIcon';
import { Tooltip } from './Tooltip';

interface MonthlyPiketSummarySegmentProps {
    selectedMonth: number; // 1-12
    selectedYear: number;
    piketCalculation: PiketCalculationResult;
    theme: AppTheme;
    onSelectDate?: (dayNumber: number) => void;
    className?: string;
    layout?: 'auto' | 'sidebar' | 'wide';
}

const INDONESIAN_MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const MonthlyPiketSummarySegment = React.memo<MonthlyPiketSummarySegmentProps>(({
    selectedMonth,
    selectedYear,
    piketCalculation,
    theme,
    onSelectDate,
    className = '',
    layout = 'auto',
}) => {
    const isWinamp = theme === 'winamp';
    const isVista = theme === 'vista';
    const isDark = theme === 'dark';
    const isPaperSketch = theme === 'paperSketch';
    const isTechnical = theme === 'technical';
    const isEditorial = theme === 'editorial';
    const isIndustrial = theme === 'industrial';
    const isDashboard = theme === 'dashboard';

    // Filter Piket matches for the current selected month
    const monthPikets = React.useMemo(() => {
        return piketCalculation.piketMatches.filter(
            (p) => p.piketYear === selectedYear && p.piketMonth === selectedMonth
        );
    }, [piketCalculation, selectedMonth, selectedYear]);

    const totalPiket = monthPikets.length;
    const matchedPiketCount = monthPikets.filter((p) => p.status === 'matched').length;
    const pendingPiketCount = monthPikets.filter((p) => p.status === 'pending' || p.status === 'accumulated_off').length;

    const piketWithOffCount = React.useMemo(() => {
        return monthPikets.filter((p) => p.earnsOff).length;
    }, [monthPikets]);

    const piketWithoutOffCount = React.useMemo(() => {
        return monthPikets.filter((p) => !p.earnsOff).length;
    }, [monthPikets]);

    // Theme Container Styles
    const getContainerStyles = () => {
        if (isIndustrial) {
            return 'bg-[#1A1D23] border border-[rgba(226,232,240,0.1)] text-[#E2E8F0] rounded-[6px]';
        }
        if (isEditorial) {
            return 'bg-[#ffffff] border border-[#1a1a1a]/10 text-[#1a1a1a] rounded-none';
        }
        if (isTechnical) {
            return 'bg-[#FFFFFF] border-[1.5px] border-[#111113] text-[#111113] rounded-none';
        }
        if (isPaperSketch) {
            return 'bg-white border-2 border-[#2b2b2b] text-[#2b2b2b] rounded-xl shadow-[4px_4px_0px_#2b2b2b]';
        }
        if (isWinamp) {
            return 'bg-[#191919] border border-[#00FF00] font-mono text-[#00FF00] rounded-none shadow-[2px_2px_0_#000]';
        }
        if (isVista) {
            return 'bg-white/70 backdrop-blur-xl border border-white/80 text-slate-900 rounded-xl shadow-[0_8px_20px_rgba(14,116,224,0.12)] ring-1 ring-sky-300/20';
        }
        if (isDark) {
            return 'bg-[#1E1E1E] border border-slate-800 text-slate-100 rounded-xl shadow-xs';
        }
        if (isDashboard) {
            return 'bg-[#FFF5D0] border border-[#4D2A00]/25 text-[#4D2A00] rounded-none shadow-2xs';
        }
        return 'bg-white text-slate-900 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-black/[0.04]';
    };

    const getJumlahPiketBoxStyles = () => {
        if (isIndustrial) {
            return 'bg-[#0F1115] border border-[rgba(226,232,240,0.1)] text-[#E2E8F0] p-2.5 rounded-[4px] font-[\'JetBrains_Mono\']';
        }
        if (isEditorial) {
            return 'bg-[#fcfbf9] border border-[#1a1a1a]/10 text-[#1a1a1a] p-2.5 rounded-none font-[\'Geist_Mono\']';
        }
        if (isTechnical) {
            return 'bg-[#F8F7F4] border-[1.5px] border-[#111113] text-[#111113] p-2.5 rounded-none font-[\'JetBrains_Mono\']';
        }
        if (isPaperSketch) {
            return 'bg-[#f2efeb] border-2 border-[#2b2b2b] text-[#2b2b2b] p-2.5 rounded-xl shadow-[2px_2px_0px_#2b2b2b] font-mono';
        }
        if (isWinamp) {
            return 'bg-black border border-[#00FF00]/50 text-[#00FF00] font-mono p-2 rounded-none';
        }
        if (isVista) {
            return 'bg-gradient-to-r from-sky-50 to-blue-50/80 border border-sky-200/90 text-slate-900 p-2.5 rounded-xl shadow-2xs';
        }
        if (isDark) {
            return 'bg-slate-800/60 border border-slate-700/80 text-slate-100 p-2.5 rounded-xl shadow-2xs';
        }
        if (isDashboard) {
            return 'bg-[#FFF0BE] border border-[#4D2A00]/30 text-[#4D2A00] p-2.5 rounded-none font-["Inter"] font-bold';
        }
        return 'bg-slate-50 border border-slate-200/60 text-slate-900 p-2.5 rounded-lg shadow-2xs';
    };

    const getHeaderStyles = () => {
        if (isIndustrial) {
            return 'border-b border-[rgba(226,232,240,0.1)] bg-[#0F1115] text-[#E2E8F0] font-[\'Syne\'] uppercase tracking-wider';
        }
        if (isEditorial) {
            return 'border-b border-[#1a1a1a]/10 bg-[#fcfbf9] text-[#1a1a1a] font-[\'Cormorant_Garamond\'] italic text-sm font-semibold';
        }
        if (isTechnical) {
            return 'border-b-[1.5px] border-[#111113] bg-[#F8F7F4] text-[#111113] font-[\'JetBrains_Mono\'] uppercase tracking-wider';
        }
        if (isPaperSketch) {
            return 'border-b-2 border-dashed border-[#2b2b2b] bg-[#f2efeb] text-[#2b2b2b] font-[\'Gochi_Hand\'] tracking-wide';
        }
        if (isWinamp) {
            return 'border-b border-[#00FF00]/40 bg-black/40 text-[#00FF00]';
        }
        if (isVista) {
            return 'border-b border-white/60 bg-gradient-to-r from-amber-50/80 to-amber-100/60 text-slate-900';
        }
        if (isDark) {
            return 'border-b border-white/10 bg-white/5 text-slate-200';
        }
        if (isDashboard) {
            return 'border-b border-[#4D2A00]/20 bg-[#FFF0BE] text-[#4D2A00] font-bold';
        }
        return 'border-b border-slate-100 bg-amber-50/60 text-slate-800';
    };

    const getItemStyles = () => {
        if (isIndustrial) {
            return 'bg-[#0F1115] hover:bg-white/5 border border-[rgba(226,232,240,0.1)] text-[#E2E8F0] rounded-[4px] font-[\'JetBrains_Mono\']';
        }
        if (isEditorial) {
            return 'bg-[#ffffff] hover:bg-[#1a1a1a]/[0.03] border border-[#1a1a1a]/10 text-[#1a1a1a] rounded-none font-[\'Geist_Mono\']';
        }
        if (isTechnical) {
            return 'bg-[#FFFFFF] hover:bg-[#111113]/5 border-[1.5px] border-[#111113] text-[#111113] rounded-none font-[\'JetBrains_Mono\']';
        }
        if (isPaperSketch) {
            return 'bg-white hover:bg-[#2ec4b6]/15 border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] text-[#2b2b2b] rounded-lg';
        }
        if (isWinamp) {
            return 'bg-black hover:bg-zinc-900 border border-[#00FF00]/40 shadow-[1px_1px_0_#00FF00] text-[#00FF00] rounded-none';
        }
        if (isDashboard) {
            return 'bg-[#FFFBF0] hover:bg-[#FFF0BE] border border-[#4D2A00]/20 text-[#4D2A00] rounded-none';
        }
        if (isVista) {
            return 'bg-white/65 hover:bg-white/90 border border-white/90 shadow-[0_2px_6px_rgba(14,116,224,0.1)] text-slate-800 backdrop-blur-xs';
        }
        if (isDark) {
            return 'bg-[#242424] hover:bg-[#2d2d2d] border border-slate-800 shadow-[0_1.5px_4px_rgba(0,0,0,0.45)] text-slate-200';
        }
        return 'bg-white hover:bg-slate-50/90 border border-slate-200/85 shadow-2xs text-slate-800';
    };

    return (
        <div className={`w-full overflow-hidden select-none ${getContainerStyles()} ${className}`}>
            {/* Header Segmen */}
            <div className={`px-3 py-2 flex items-center justify-between gap-2 min-w-0 ${getHeaderStyles()}`}>
                <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                    <BriefcaseIcon theme={theme} className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wide truncate" title={`JADWAL PIKET ${INDONESIAN_MONTH_NAMES[selectedMonth - 1].toUpperCase()}`}>
                        JADWAL PIKET {INDONESIAN_MONTH_NAMES[selectedMonth - 1].toUpperCase()}
                    </span>
                </div>
                <span className={`text-[11px] sm:text-[11.5px] font-black px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${
                    isDashboard
                        ? 'bg-[#78350F]/20 text-[#78350F] border-[#78350F]/30'
                        : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}>
                    {totalPiket} Piket
                </span>
            </div>

            {/* Content: Stat Badges + List */}
            <div className="p-2 space-y-1.5">
                {/* Unified Adaptive Grid: 2x2 pada mobile view / sidebar, dan 1x4 (4 kolom mendatar) pada layar lebar */}
                <div
                    className={`grid ${
                        layout === 'sidebar'
                            ? 'grid-cols-2'
                            : 'grid-cols-2 sm:grid-cols-4'
                    } gap-1.5 text-center`}
                >
                    {/* Box 1: Piket-Off */}
                    <Tooltip content="Piket dengan libur pengganti." containerClassName="w-full">
                        <div
                            className={`py-1.5 px-2 rounded-md border flex flex-col items-center justify-center min-h-[42px] min-w-0 cursor-help transition-all shadow-3xs w-full ${
                                isDashboard
                                    ? 'bg-[#78350F]/15 border-[#78350F]/25 text-[#78350F] hover:bg-[#78350F]/20'
                                    : 'bg-indigo-500/10 border-indigo-500/15 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/15'
                            }`}
                        >
                            <div className="text-[9px] lg:text-[10px] font-black uppercase tracking-tight opacity-90 truncate w-full flex items-center justify-center gap-0.5 leading-none">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 animate-pulse ${isDashboard ? 'bg-[#78350F]' : 'bg-indigo-500'}`} />
                                <span className="truncate font-sans font-extrabold">Piket-Off</span>
                            </div>
                            <div className={`text-[11px] lg:text-xs font-black w-full truncate mt-1 leading-none ${isDashboard ? 'text-[#78350F]' : 'text-indigo-600 dark:text-indigo-300'}`}>
                                {piketWithOffCount} Hari
                            </div>
                        </div>
                    </Tooltip>

                    {/* Box 2: Piket-no OFF */}
                    <Tooltip content="Piket tanpa libur pengganti." containerClassName="w-full">
                        <div
                            className={`py-1.5 px-2 rounded-md border flex flex-col items-center justify-center min-h-[42px] min-w-0 cursor-help transition-all shadow-3xs w-full ${
                                isDashboard
                                    ? 'bg-[#4D2A00]/10 border-[#4D2A00]/20 text-[#4D2A00] hover:bg-[#4D2A00]/15'
                                    : 'bg-slate-500/10 border-slate-500/15 text-slate-700 dark:text-slate-400 hover:bg-slate-500/15'
                            }`}
                        >
                            <div className="text-[9px] lg:text-[10px] font-black uppercase tracking-tight opacity-90 truncate w-full flex items-center justify-center gap-0.5 leading-none">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isDashboard ? 'bg-[#4D2A00]' : 'bg-slate-400'}`} />
                                <span className="truncate font-sans font-extrabold">Piket-no OFF</span>
                            </div>
                            <div className={`text-[11px] lg:text-xs font-black w-full truncate mt-1 leading-none ${isDashboard ? 'text-[#4D2A00]' : 'text-slate-600 dark:text-slate-300'}`}>
                                {piketWithoutOffCount} Hari
                            </div>
                        </div>
                    </Tooltip>

                    {/* Box 3: Off Ready */}
                    <Tooltip content="Jatah libur pengganti yang sudah terjadwal di kalender." containerClassName="w-full">
                        <div
                            className={`py-1.5 px-2 rounded-md border flex flex-col items-center justify-center min-h-[42px] min-w-0 cursor-help transition-all shadow-3xs w-full ${
                                isDashboard
                                    ? 'bg-emerald-700/15 border-emerald-700/25 text-emerald-800 hover:bg-emerald-700/20'
                                    : 'bg-emerald-500/10 border-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15'
                            }`}
                        >
                            <div className="text-[9px] lg:text-[10px] font-black uppercase tracking-tight opacity-90 truncate w-full flex items-center justify-center gap-0.5 leading-none">
                                <CheckCircle2 className={`w-2.5 h-2.5 shrink-0 ${isDashboard ? 'text-emerald-700' : 'text-emerald-500'}`} />
                                <span className="truncate font-sans font-extrabold">Off Ready</span>
                            </div>
                            <div className={`text-[11px] lg:text-xs font-black w-full truncate mt-1 leading-none ${isDashboard ? 'text-emerald-800' : 'text-emerald-600 dark:text-emerald-300'}`}>
                                {matchedPiketCount} Hari
                            </div>
                        </div>
                    </Tooltip>

                    {/* Box 4: Off Delay */}
                    <Tooltip content="Jatah libur pengganti yang belum dijadwalkan." containerClassName="w-full">
                        <div
                            className={`py-1.5 px-2 rounded-md border flex flex-col items-center justify-center min-h-[42px] min-w-0 cursor-help transition-all shadow-3xs w-full ${
                                isDashboard
                                    ? 'bg-[#78350F]/20 border-[#78350F]/30 text-[#78350F] hover:bg-[#78350F]/25'
                                    : 'bg-amber-500/10 border-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/15'
                            }`}
                        >
                            <div className="text-[9px] lg:text-[10px] font-black uppercase tracking-tight opacity-90 truncate w-full flex items-center justify-center gap-0.5 leading-none">
                                <Clock className={`w-2.5 h-2.5 shrink-0 ${isDashboard ? 'text-[#78350F]' : 'text-amber-500'}`} />
                                <span className="truncate font-sans font-extrabold">Off Delay</span>
                            </div>
                            <div className={`text-[11px] lg:text-xs font-black w-full truncate mt-1 leading-none ${isDashboard ? 'text-[#78350F]' : 'text-amber-600 dark:text-amber-300'}`}>
                                {pendingPiketCount} Hari
                            </div>
                        </div>
                    </Tooltip>
                </div>

                {/* List of Pikets in Month */}
                {totalPiket === 0 ? (
                    <div className="py-3 text-center text-xs opacity-60 italic">
                        Tidak ada jadwal piket pada bulan ini.
                    </div>
                ) : (
                    <div className="space-y-1.5 max-h-[305px] sm:max-h-[315px] overflow-y-auto no-scrollbar p-0.5">
                        {monthPikets.map((item, idx) => (
                            <div
                                key={`${item.piketDateKey}-${item.piketShift || ''}-${idx}`}
                                onClick={() => onSelectDate?.(item.piketDay)}
                                className={`w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer text-xs ${getItemStyles()}`}
                            >
                                <div className="flex items-center space-x-2.5 min-w-0">
                                    <div className="w-6 shrink-0 text-center font-mono font-black text-amber-600 dark:text-amber-400 text-[13px] tabular-nums">
                                        {item.piketDay}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold truncate text-[12px] leading-snug">
                                            {item.piketDateLabel} ({item.piketShift})
                                        </div>
                                        <div className="text-[11px] opacity-80 truncate mt-0.5">
                                            {item.status === 'no_off_entitlement' ? (
                                                <span className="text-slate-500 dark:text-slate-400 font-semibold">
                                                    ⚪ Tanpa OFF (Piket SM Hari Kerja)
                                                </span>
                                            ) : item.status === 'matched' ? (
                                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                                                    <OffRelaxIcon theme={theme} className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                    <span>OFF: {item.offDateLabel}</span>
                                                </span>
                                            ) : item.status === 'accumulated_off' ? (
                                                <Tooltip content="Jatah libur pengganti tetap didapatkan (akumulasi/saldo), tetapi belum ada jadwal OFF pasti di bulan depan">
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold cursor-help">
                                                        ⏳ OFF Tetap Didapat (Belum Terjadwal)
                                                    </span>
                                                </Tooltip>
                                            ) : (
                                                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                                    ⏳ Dijatahkan ke bulan berikutnya
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="shrink-0 ml-1">
                                    {item.status === 'no_off_entitlement' ? (
                                        <span className="text-[11.5px] font-mono font-bold text-slate-400">—</span>
                                    ) : item.status === 'matched' ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    ) : item.status === 'accumulated_off' ? (
                                        <Tooltip content="Jatah libur pengganti tetap didapatkan (akumulasi/saldo), tetapi belum ada jadwal OFF pasti di bulan depan">
                                            <AlertCircle className="w-4 h-4 text-indigo-500 cursor-help" />
                                        </Tooltip>
                                    ) : (
                                        <AlertCircle className="w-4 h-4 text-amber-500" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});
