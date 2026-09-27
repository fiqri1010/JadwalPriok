import React from 'react';
import { CalendarCheck2, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { ThemeConfig } from '../themeConfig';
import { Tooltip } from './Tooltip';

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

interface SubToolbarHeaderProps {
    title: string;
    themeConfig: ThemeConfig;
    showMonthNavigation?: boolean;
    selectedMonth?: number;
    selectedYear?: number;
    isCurrentMonthAndYear?: boolean;
    onJumpToToday?: () => void;
    onPrevMonth?: () => void;
    onNextMonth?: () => void;
    onOpenMonthPicker?: () => void;
    rightContent?: React.ReactNode;
}

export const SubToolbarHeader = React.memo<SubToolbarHeaderProps>(({
    title,
    themeConfig,
    showMonthNavigation = false,
    selectedMonth = 1,
    selectedYear = 2026,
    isCurrentMonthAndYear = false,
    onJumpToToday,
    onPrevMonth,
    onNextMonth,
    onOpenMonthPicker,
    rightContent,
}) => {
    const isWinamp = themeConfig.theme === 'winamp';
    const isDarkFluid = themeConfig.theme === 'darkFluid';
    const isDark = themeConfig.theme === 'dark';
    const isVista = themeConfig.theme === 'vista';

    // 1. De-duplication: Pastikan judul di kiri statis dan bersih (misal "Jadwal Kerja") tanpa mengulang bulan & tahun
    const staticTitle = React.useMemo(() => {
        if (!showMonthNavigation) return title;
        const cleaned = title.replace(/\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember|\d{4})/gi, '').trim();
        return cleaned || 'Jadwal Kerja';
    }, [title, showMonthNavigation]);

    // 2 & 3. Styling Clean & Minimalist: Navigasi Tanpa Bingkai (Frameless) & Tombol Sekarang "Subtle/Ghost"
    const getMinimalistStyles = () => {
        if (isWinamp) {
            return {
                wrapper: 'bg-[#121212] border-b border-zinc-800 py-1.5 px-2 font-mono',
                title: 'text-[#00FF00] font-mono text-xs font-bold uppercase tracking-wider',
                dot: 'w-2 h-2 rounded-none bg-[#00FF00] shrink-0',
                navArrowBtn: 'text-[#00FF00] hover:bg-zinc-800 rounded-none p-1.5 transition-colors',
                monthTextBtn: 'text-[#00FF00] hover:text-[#22c55e] font-mono text-xs font-bold px-2 py-1',
                todayBtn: 'bg-black text-[#00FF00] border border-zinc-800 hover:border-[#00FF00] rounded-none px-2.5 py-1 text-xs font-mono font-bold',
            };
        }
        if (isDarkFluid) {
            return {
                wrapper: 'bg-transparent border-b border-white/10 py-1.5 px-1',
                title: 'text-[#E6E0E9] font-bold text-sm sm:text-base tracking-tight',
                dot: 'w-2 h-2 rounded-full bg-[#D0BCFF] shrink-0 shadow-[0_0_8px_#D0BCFF]',
                navArrowBtn: 'text-[#CAC4D0] hover:text-[#D0BCFF] hover:bg-white/10 rounded-full p-1.5 transition-colors active:scale-95',
                monthTextBtn: 'text-[#E6E0E9] hover:text-[#D0BCFF] hover:bg-white/5 rounded-md text-xs sm:text-sm font-bold px-2.5 py-1 transition-colors',
                todayBtn: 'bg-[#D0BCFF]/10 text-[#D0BCFF] border border-[#D0BCFF]/25 hover:bg-[#D0BCFF]/20 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all active:scale-95',
            };
        }
        if (isDark) {
            return {
                wrapper: 'bg-transparent border-b border-slate-800 py-1.5 px-1',
                title: 'text-slate-100 font-bold text-sm sm:text-base tracking-tight',
                dot: 'w-2 h-2 rounded-full bg-teal-400 shrink-0 shadow-[0_0_8px_rgba(45,212,191,0.5)]',
                navArrowBtn: 'text-slate-400 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors active:scale-95',
                monthTextBtn: 'text-slate-100 hover:text-teal-400 hover:bg-white/5 rounded-md text-xs sm:text-sm font-bold px-2.5 py-1 transition-colors',
                todayBtn: 'bg-teal-400/10 text-teal-300 border border-teal-500/25 hover:bg-teal-400/20 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all active:scale-95',
            };
        }
        if (isVista) {
            return {
                wrapper: 'bg-transparent border-b border-sky-200/80 py-1.5 px-1',
                title: 'text-sky-950 font-bold text-sm sm:text-base tracking-tight',
                dot: 'w-2 h-2 rounded-full bg-sky-500 shrink-0 shadow-[0_0_6px_rgba(14,165,233,0.5)]',
                navArrowBtn: 'text-sky-800 hover:text-sky-950 hover:bg-sky-100/70 rounded-full p-1.5 transition-colors active:scale-95',
                monthTextBtn: 'text-sky-950 hover:text-sky-700 hover:bg-sky-50/70 rounded-md text-xs sm:text-sm font-bold px-2.5 py-1 transition-colors',
                todayBtn: 'bg-sky-500/10 text-sky-800 border border-sky-300/60 hover:bg-sky-500/20 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all active:scale-95',
            };
        }
        // Default Clean Light Mode
        return {
            wrapper: 'bg-transparent border-b border-slate-200/90 py-1.5 px-1',
            title: 'text-slate-900 font-bold text-sm sm:text-base tracking-tight',
            dot: 'w-2 h-2 rounded-full bg-teal-500 shrink-0 shadow-[0_0_6px_rgba(20,184,166,0.4)]',
            navArrowBtn: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-full p-1.5 transition-colors active:scale-95',
            monthTextBtn: 'text-slate-900 hover:text-teal-700 hover:bg-slate-100/80 rounded-md text-xs sm:text-sm font-bold px-2.5 py-1 transition-colors',
            todayBtn: 'bg-teal-500/10 text-teal-700 border border-teal-500/25 hover:bg-teal-500/15 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all active:scale-95',
        };
    };

    const styles = getMinimalistStyles();

    return (
        <div className={`w-full min-w-0 select-none flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 ${styles.wrapper}`}>
            {/* 1. Judul Statis di Kiri (De-duplication) */}
            <div className="flex items-center space-x-2 min-w-0">
                <span className={styles.dot} aria-hidden="true" />
                <CalendarCheck2 className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-teal-600 dark:text-teal-400 shrink-0" />
                <h2 className={styles.title}>
                    {staticTitle}
                </h2>
            </div>

            {/* 2. Navigasi Tanpa Bingkai (Frameless Navigation) & Aksi di Kanan */}
            <div className="flex items-center space-x-2 shrink-0">
                {showMonthNavigation && (
                    <div className="flex items-center space-x-1">
                        {/* 3. Tombol "Sekarang" (Subtle / Ghost Style) */}
                        {onJumpToToday && (
                            <Tooltip
                                content={<span>Lompat ke <strong>Hari Ini</strong></span>}
                                placement="bottom"
                            >
                                <button
                                    type="button"
                                    onClick={onJumpToToday}
                                    className={`flex items-center space-x-1.5 cursor-pointer ${styles.todayBtn} ${
                                        isCurrentMonthAndYear ? 'opacity-60 cursor-default' : ''
                                    }`}
                                    aria-label="Lompat ke hari ini (Sekarang)"
                                >
                                    <CalendarCheck2 className="h-3.5 w-3.5 shrink-0" />
                                    <span className="whitespace-nowrap">Sekarang</span>
                                </button>
                            </Tooltip>
                        )}

                        {/* Navigasi Bulan Tanpa Bingkai: [Panah Kiri] -- [Teks Bulan & Tahun] -- [Panah Kanan] */}
                        <div className="flex items-center space-x-0.5">
                            {onPrevMonth && (
                                <Tooltip content={<span>Bulan Sebelumnya</span>} placement="bottom">
                                    <button
                                        type="button"
                                        onClick={onPrevMonth}
                                        className={`cursor-pointer ${styles.navArrowBtn}`}
                                        aria-label="Bulan sebelumnya"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                </Tooltip>
                            )}

                            {onOpenMonthPicker && (
                                <Tooltip content={<span>Buka <strong>Pemilih Bulan & Tahun</strong></span>} placement="bottom">
                                    <button
                                        type="button"
                                        onClick={onOpenMonthPicker}
                                        className={`flex items-center space-x-1.5 cursor-pointer ${styles.monthTextBtn}`}
                                    >
                                        <CalendarDays className="h-3.5 w-3.5 shrink-0 opacity-70" />
                                        <span className="truncate whitespace-nowrap">
                                            {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                                        </span>
                                    </button>
                                </Tooltip>
                            )}

                            {onNextMonth && (
                                <Tooltip content={<span>Bulan Berikutnya</span>} placement="bottom">
                                    <button
                                        type="button"
                                        onClick={onNextMonth}
                                        className={`cursor-pointer ${styles.navArrowBtn}`}
                                        aria-label="Bulan berikutnya"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                )}

                {/* Right Content (misal tombol Ekspor) berdampingan harmonis */}
                {rightContent && (
                    <div className="flex items-center space-x-1 shrink-0">
                        {rightContent}
                    </div>
                )}
            </div>
        </div>
    );
});

export default SubToolbarHeader;
