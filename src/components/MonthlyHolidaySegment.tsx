import React from 'react';
import { LiburNasional, AppTheme, resolveHolidayCategory, HolidayCategory } from '../types';
import { CalendarDays, CalendarCheck } from 'lucide-react';

interface MonthlyHolidaySegmentProps {
    selectedMonth: number; // 1-12
    selectedYear: number;
    daftarLibur: LiburNasional[];
    theme: AppTheme;
    onSelectDate?: (dayNumber: number) => void;
    className?: string;
}

const INDONESIAN_MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const INDONESIAN_DAY_NAMES = [
    'Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'
];

export const MonthlyHolidaySegment = React.memo<MonthlyHolidaySegmentProps>(({
    selectedMonth,
    selectedYear,
    daftarLibur,
    theme,
    onSelectDate,
    className = '',
}) => {
    const isWinamp = theme === 'winamp';
    const isVista = theme === 'vista';
    const isDark = theme === 'dark';
    const isDarkFluid = theme === 'darkFluid';

    // Filter holidays for the selected month and year
    const monthHolidays = React.useMemo(() => {
        const paddedMonth = String(selectedMonth).padStart(2, '0');
        const prefixPadded = `${selectedYear}-${paddedMonth}-`;
        const prefixRaw = `${selectedYear}-${selectedMonth}-`;

        return daftarLibur
            .filter((h) => {
                if (h.tanggal.startsWith(prefixPadded) || h.tanggal.startsWith(prefixRaw)) {
                    return true;
                }
                const parts = h.tanggal.split('-');
                if (parts.length === 3) {
                    const y = parseInt(parts[0], 10);
                    const m = parseInt(parts[1], 10);
                    return y === selectedYear && m === selectedMonth;
                }
                return false;
            })
            .map((h) => {
                const parts = h.tanggal.split('-');
                const dayNum = parseInt(parts[2], 10) || 1;
                const dateObj = new Date(selectedYear, selectedMonth - 1, dayNum);
                const dayName = INDONESIAN_DAY_NAMES[dateObj.getDay()] || '';
                return {
                    ...h,
                    dayNumber: dayNum,
                    dayName,
                };
            })
            .sort((a, b) => a.dayNumber - b.dayNumber);
    }, [daftarLibur, selectedMonth, selectedYear]);

    const monthName = INDONESIAN_MONTH_NAMES[selectedMonth - 1] || '';

    // Theme Container Styles
    const getContainerStyles = () => {
        if (isWinamp) {
            return 'bg-[#191919] border border-[#00FF00] font-mono text-[#00FF00] rounded-none shadow-[2px_2px_0_#000]';
        }
        if (isVista) {
            return 'bg-white/70 backdrop-blur-xl border border-white/80 text-slate-900 rounded-xl shadow-[0_8px_20px_rgba(14,116,224,0.12)] ring-1 ring-sky-300/20';
        }
        if (isDark) {
            return 'bg-[#1E1E1E] border border-slate-800 text-slate-100 rounded-xl shadow-xs';
        }
        if (isDarkFluid) {
            return 'bg-[#1D1B20] border border-white/10 text-[#E6E0E9] rounded-xl shadow-xs';
        }
        return 'bg-white border border-slate-200 text-slate-900 rounded-xl shadow-2xs';
    };

    const getHeaderStyles = () => {
        if (isWinamp) {
            return 'border-b border-[#00FF00]/40 bg-black/40 text-[#00FF00]';
        }
        if (isVista) {
            return 'border-b border-white/60 bg-gradient-to-r from-sky-50/70 to-blue-50/70 text-slate-900';
        }
        if (isDark || isDarkFluid) {
            return 'border-b border-white/10 bg-white/5 text-slate-200';
        }
        return 'border-b border-slate-100 bg-slate-50/80 text-slate-800';
    };

    const getItemStyles = () => {
        if (isWinamp) {
            return 'hover:bg-zinc-900 border-b border-[#00FF00]/20 last:border-b-0 text-[#00FF00]';
        }
        if (isVista) {
            return 'hover:bg-white/60 border-b border-slate-100/80 last:border-b-0 text-slate-800';
        }
        if (isDark) {
            return 'hover:bg-slate-800/60 border-b border-slate-800 last:border-b-0 text-slate-200';
        }
        if (isDarkFluid) {
            return 'hover:bg-white/5 border-b border-white/5 last:border-b-0 text-[#E6E0E9]';
        }
        return 'hover:bg-slate-50 border-b border-slate-100 last:border-b-0 text-slate-800';
    };

    const getDateBoxStyles = (category: HolidayCategory) => {
        if (isWinamp) {
            return 'bg-[#00FF00]/10 text-[#00FF00] border border-[#00FF00]/40';
        }
        if (category === 'cuti_bersama') {
            if (isVista) return 'bg-amber-50 text-amber-700 border border-amber-200/70';
            if (isDark || isDarkFluid) return 'bg-amber-500/15 text-amber-400 border border-amber-500/20';
            return 'bg-amber-50 text-amber-700 border border-amber-100';
        }
        if (category === 'lainnya') {
            if (isVista) return 'bg-indigo-50 text-indigo-700 border border-indigo-200/70';
            if (isDark || isDarkFluid) return 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20';
            return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
        }
        // Libur Nasional
        if (isVista) return 'bg-rose-50 text-rose-600 border border-rose-200/60';
        if (isDark || isDarkFluid) return 'bg-rose-500/15 text-rose-400 border border-rose-500/20';
        return 'bg-rose-50 text-rose-600 border border-rose-100';
    };

    const getIndicatorBadgeStyle = (category: HolidayCategory) => {
        if (isWinamp) {
            return 'bg-[#00FF00]/15 text-[#00FF00] border border-[#00FF00]/30';
        }
        if (category === 'cuti_bersama') {
            return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40';
        }
        if (category === 'lainnya') {
            return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300/40';
        }
        // Libur Nasional
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300/40';
    };

    return (
        <div
            aria-label="Libur Nasional Bulan Terpilih"
            className={`flex flex-col overflow-hidden transition-all duration-150 ${getContainerStyles()} ${className}`}
        >
            {/* Header Ringkas */}
            <div className={`px-3 py-2 flex items-center justify-between gap-2 ${getHeaderStyles()}`}>
                <div className="flex items-center space-x-1.5 min-w-0">
                    <CalendarDays className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span className="text-xs font-bold truncate">
                        Libur Nasional {monthName}
                    </span>
                </div>
                <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md shrink-0 ${
                        isWinamp
                            ? 'bg-[#00FF00] text-black'
                            : isVista
                            ? 'bg-rose-100 text-rose-700'
                            : isDark || isDarkFluid
                            ? 'bg-white/10 text-slate-300'
                            : 'bg-slate-100 text-slate-600'
                    }`}
                >
                    {monthHolidays.length}
                </span>
            </div>

            {/* List Hari Libur / Teks Sederhana jika kosong */}
            <div className="p-1 sm:p-1.5 divide-y divide-transparent">
                {monthHolidays.length === 0 ? (
                    <div className="py-2.5 px-3 text-center flex items-center justify-center gap-1.5 opacity-60 text-[11px]">
                        <CalendarCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>Tidak ada libur nasional di bulan ini</span>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {monthHolidays.map((holiday) => {
                            const catInfo = resolveHolidayCategory({
                                keterangan: holiday.keterangan,
                                kategori: holiday.kategori,
                                isCutiBersama: holiday.isCutiBersama,
                            });

                            return (
                                <div
                                    key={holiday.tanggal}
                                    onClick={() => onSelectDate && onSelectDate(holiday.dayNumber)}
                                    className={`tooltip-container w-full px-2 py-1.5 rounded-lg flex items-start gap-2.5 cursor-pointer transition-colors ${getItemStyles()}`}
                                >
                                    {/* Tanggal dan Hari (Atas-Bawah) */}
                                    <div
                                        className={`w-7 h-7 sm:w-8 sm:h-8 flex flex-col items-center justify-center rounded-md shrink-0 leading-none ${getDateBoxStyles(catInfo.category)}`}
                                    >
                                        <span className="text-[11px] sm:text-xs font-black">
                                            {holiday.dayNumber}
                                        </span>
                                        <span className="text-[7px] sm:text-[8px] font-semibold uppercase tracking-tighter opacity-90">
                                            {holiday.dayName}
                                        </span>
                                    </div>

                                    {/* Indikator Kategori & Nama Libur */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span
                                                className={`text-[8.5px] font-extrabold px-1.5 py-0.2 rounded-sm uppercase tracking-tight leading-none ${getIndicatorBadgeStyle(catInfo.category)}`}
                                            >
                                                {catInfo.label}
                                            </span>
                                        </div>
                                        <p className="text-[11px] sm:text-xs font-semibold leading-tight line-clamp-2">
                                            {holiday.keterangan}
                                        </p>
                                    </div>
                                    <div className="tooltip">
                                        <span>Tanggal <strong>{holiday.dayNumber} {monthName}</strong> — <i>{catInfo.label}</i></span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
});
