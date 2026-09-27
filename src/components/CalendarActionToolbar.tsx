import React from 'react';
import {
    ClipboardPaste,
    Undo2,
    RotateCcw,
    Lock,
    Unlock,
    SlidersHorizontal,
} from 'lucide-react';
import { AppTheme } from '../types';
import { Tooltip } from './Tooltip';

interface CalendarActionToolbarProps {
    selectedMonth: number;
    selectedYear: number;
    currentTheme: AppTheme;
    areAllLocked: boolean;
    lastResetBackupState: { year: number; month: number } | null;
    onTempelJadwal: () => void;
    onUndoReset: () => void;
    onResetCalendar: () => void;
    onToggleAllLock: () => void;
    compact?: boolean;
}

export const CalendarActionToolbar = React.memo<CalendarActionToolbarProps>(({
    selectedMonth,
    selectedYear,
    currentTheme,
    areAllLocked,
    lastResetBackupState,
    onTempelJadwal,
    onUndoReset,
    onResetCalendar,
    onToggleAllLock,
    compact = false,
}) => {
    const isWinamp = currentTheme === 'winamp';
    const isDarkFluid = currentTheme === 'darkFluid';
    const isDark = currentTheme === 'dark';
    const isVista = currentTheme === 'vista';

    const hasUndoBackup =
        lastResetBackupState !== null &&
        lastResetBackupState.year === selectedYear &&
        lastResetBackupState.month === selectedMonth;

    const canUndo = hasUndoBackup && !areAllLocked;

    const getContainerStyles = () => {
        if (compact) {
            if (isWinamp) {
                return 'bg-[#191919] border border-[#00FF00]/60 font-mono text-[#00FF00] rounded-none p-1 sm:p-1.5 shadow-[1px_1px_0_#000]';
            }
            if (isVista) {
                return 'bg-white/80 backdrop-blur-md border border-sky-300/40 text-slate-900 rounded-lg shadow-xs p-1 sm:p-1.5';
            }
            if (isDark) {
                return 'bg-[#1E1E1E]/90 border border-slate-800 text-slate-100 rounded-lg shadow-xs p-1 sm:p-1.5';
            }
            if (isDarkFluid) {
                return 'bg-[#1D1B20]/90 border border-white/10 text-[#E6E0E9] rounded-lg shadow-xs p-1 sm:p-1.5';
            }
            return 'bg-white/90 border border-slate-200 text-slate-900 rounded-lg shadow-2xs p-1 sm:p-1.5';
        }

        if (isWinamp) {
            return 'bg-[#191919] border border-[#00FF00] font-mono text-[#00FF00] rounded-none shadow-[2px_2px_0_#000] p-2 sm:p-2.5 lg:p-3';
        }
        if (isVista) {
            return 'bg-white/70 backdrop-blur-xl border border-white/80 text-slate-900 rounded-lg sm:rounded-xl shadow-[0_8px_20px_rgba(14,116,224,0.12)] ring-1 ring-sky-300/20 p-2 sm:p-2.5 lg:p-3';
        }
        if (isDark) {
            return 'bg-[#1E1E1E] border border-slate-800 text-slate-100 rounded-lg sm:rounded-xl shadow-xs p-2 sm:p-2.5 lg:p-3';
        }
        if (isDarkFluid) {
            return 'bg-[#1D1B20] border border-white/10 text-[#E6E0E9] rounded-lg sm:rounded-xl shadow-xs p-2 sm:p-2.5 lg:p-3';
        }
        return 'bg-white text-slate-900 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-black/[0.04] p-2 sm:p-2.5 lg:p-3';
    };

    return (
        <div className={`w-full select-none relative z-40 overflow-visible ${getContainerStyles()}`}>
            {/* Header Sidebar Kontrol (Hanya muncul jika bukan compact) */}
            {!compact && (
                <div className="flex items-center justify-between pb-1 sm:pb-1.5 lg:pb-2 mb-1.5 sm:mb-2 border-b border-current/10">
                    <div className="flex items-center space-x-1.5">
                        <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-80" />
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Kontrol Kalender</span>
                    </div>
                </div>
            )}

            {/* Grid 4 Tombol Aksi */}
            <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
                {/* 1. Tempel / Salin */}
                <Tooltip
                    content={<span><strong>Salin Jadwal</strong> dan Presensi</span>}
                    placement="bottom"
                    containerClassName="w-full"
                >
                    <button
                        type="button"
                        onClick={onTempelJadwal}
                        className={`w-full flex ${compact ? 'flex-row items-center justify-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 px-1.5' : 'flex-col items-center justify-center py-1 sm:py-1.5 lg:py-2 px-1'} rounded-md sm:rounded-lg border transition-all cursor-pointer ${
                            isWinamp
                                ? 'bg-black border-zinc-700 text-[#00FF00] hover:bg-[#00FF00] hover:text-black'
                                : isVista
                                ? 'bg-white/80 border-sky-200 text-teal-700 hover:bg-teal-50'
                                : isDark || isDarkFluid
                                ? 'bg-white/5 border-white/10 text-teal-300 hover:bg-white/10'
                                : 'bg-slate-50 border-slate-200 text-teal-700 hover:bg-teal-50'
                        }`}
                    >
                        <ClipboardPaste className={`${compact ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5 sm:mb-1'} shrink-0`} />
                        <span className={`${compact ? 'text-[9.5px] sm:text-[10.5px]' : 'text-[8.5px] min-[380px]:text-[9px] sm:text-[9.5px]'} font-bold leading-none whitespace-nowrap shrink-0`}>Salin</span>
                    </button>
                </Tooltip>

                {/* 2. Undo */}
                <Tooltip
                    content={
                        <span>
                            {areAllLocked
                                ? <span><strong>Buka kunci</strong> untuk Undo</span>
                                : hasUndoBackup
                                ? <span><strong>Batalkan</strong> reset bulan ini</span>
                                : <span>Tidak ada riwayat reset</span>}
                        </span>
                    }
                    placement="bottom"
                    containerClassName="w-full"
                >
                    <button
                        type="button"
                        onClick={onUndoReset}
                        disabled={!canUndo}
                        className={`w-full flex ${compact ? 'flex-row items-center justify-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 px-1.5' : 'flex-col items-center justify-center py-1 sm:py-1.5 lg:py-2 px-1'} rounded-md sm:rounded-lg border transition-all cursor-pointer ${
                            !canUndo
                                ? 'opacity-30 cursor-not-allowed pointer-events-none border-transparent'
                                : isWinamp
                                ? 'bg-black border-zinc-700 text-sky-400 hover:bg-sky-400 hover:text-black'
                                : isVista
                                ? 'bg-white/80 border-sky-200 text-sky-700 hover:bg-sky-50'
                                : isDark || isDarkFluid
                                ? 'bg-white/5 border-white/10 text-sky-300 hover:bg-white/10'
                                : 'bg-slate-50 border-slate-200 text-sky-700 hover:bg-sky-50'
                        }`}
                    >
                        <Undo2 className={`${compact ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5 sm:mb-1'} shrink-0`} />
                        <span className={`${compact ? 'text-[9.5px] sm:text-[10.5px]' : 'text-[8.5px] min-[380px]:text-[9px] sm:text-[9.5px]'} font-bold leading-none whitespace-nowrap shrink-0`}>Undo</span>
                    </button>
                </Tooltip>

                {/* 3. Reset */}
                <Tooltip
                    content={
                        <span>
                            {areAllLocked
                                ? <span><strong>Buka kunci</strong> untuk Reset</span>
                                : <span><strong>Kosongkan jadwal</strong> bulan ini</span>}
                        </span>
                    }
                    placement="bottom"
                    containerClassName="w-full"
                >
                    <button
                        type="button"
                        onClick={onResetCalendar}
                        disabled={areAllLocked}
                        className={`w-full flex ${compact ? 'flex-row items-center justify-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 px-1.5' : 'flex-col items-center justify-center py-1 sm:py-1.5 lg:py-2 px-1'} rounded-md sm:rounded-lg border transition-all cursor-pointer ${
                            areAllLocked
                                ? 'opacity-30 cursor-not-allowed pointer-events-none border-transparent'
                                : isWinamp
                                ? 'bg-black border-zinc-700 text-rose-500 hover:bg-rose-500 hover:text-white'
                                : isVista
                                ? 'bg-white/80 border-sky-200 text-rose-600 hover:bg-rose-50'
                                : isDark || isDarkFluid
                                ? 'bg-white/5 border-white/10 text-rose-400 hover:bg-white/10'
                                : 'bg-slate-50 border-slate-200 text-rose-600 hover:bg-rose-50'
                        }`}
                    >
                        <RotateCcw className={`${compact ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5 sm:mb-1'} shrink-0`} />
                        <span className={`${compact ? 'text-[9.5px] sm:text-[10.5px]' : 'text-[8.5px] min-[380px]:text-[9px] sm:text-[9.5px]'} font-bold leading-none whitespace-nowrap shrink-0`}>Reset</span>
                    </button>
                </Tooltip>

                {/* 4. Kunci / Buka Kunci */}
                <Tooltip
                    content={
                        <span>
                            {areAllLocked
                                ? <span><strong>Terkunci</strong> (Klik untuk Buka)</span>
                                : <span><strong>Terbuka</strong> (Klik untuk Kunci)</span>}
                        </span>
                    }
                    placement="bottom"
                    containerClassName="w-full"
                >
                    <button
                        type="button"
                        onClick={onToggleAllLock}
                        className={`w-full flex ${compact ? 'flex-row items-center justify-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 px-1.5' : 'flex-col items-center justify-center py-1 sm:py-1.5 lg:py-2 px-1'} rounded-md sm:rounded-lg border transition-all cursor-pointer ${
                            areAllLocked
                                ? 'bg-amber-500/20 text-amber-500 border-amber-500/50 font-bold'
                                : isWinamp
                                ? 'bg-black border-zinc-700 text-[#00FF00] hover:bg-zinc-800'
                                : isVista
                                ? 'bg-white/80 border-sky-200 text-slate-700 hover:bg-slate-100'
                                : isDark || isDarkFluid
                                ? 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        {areAllLocked ? (
                            <Lock className={`${compact ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5 sm:mb-1'} shrink-0`} />
                        ) : (
                            <Unlock className={`${compact ? 'w-3 h-3 sm:w-3.5 sm:h-3.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5 sm:mb-1'} shrink-0`} />
                        )}
                        <span className={`${compact ? 'text-[9.5px] sm:text-[10.5px]' : 'text-[8.5px] min-[380px]:text-[9px] sm:text-[9.5px]'} font-bold leading-none whitespace-nowrap shrink-0`}>
                            {areAllLocked ? 'Kunci' : 'Buka'}
                        </span>
                    </button>
                </Tooltip>
            </div>
        </div>
    );
});
