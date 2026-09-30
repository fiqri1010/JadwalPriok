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
    const isDark = themeConfig.theme === 'dark';
    const isVista = themeConfig.theme === 'vista';
    const isPaperSketch = themeConfig.theme === 'paperSketch';
    const isIndustrial = themeConfig.theme === 'industrial';
    const isTechnical = themeConfig.theme === 'technical';
    const isEditorial = themeConfig.theme === 'editorial';
    const isDashboard = themeConfig.theme === 'dashboard';

    // 1. De-duplication: Pastikan judul di kiri statis dan bersih (misal "Jadwal Kerja") tanpa mengulang bulan & tahun
    const staticTitle = React.useMemo(() => {
        if (!showMonthNavigation) return title;
        const cleaned = title.replace(/\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember|\d{4})/gi, '').trim();
        return cleaned || 'Jadwal Kerja';
    }, [title, showMonthNavigation]);

    // 2 & 3. Styling Clean & Minimalist: Navigasi Tanpa Bingkai (Frameless) & Tombol Sekarang "Subtle/Ghost"
    const getMinimalistStyles = () => {
        if (isIndustrial) {
            return {
                wrapper: 'bg-transparent border-b border-[rgba(226,232,240,0.1)] py-1.5 px-1 font-[\'JetBrains_Mono\']',
                title: 'text-[#E2E8F0] font-bold text-sm sm:text-base font-[\'Syne\'] tracking-tight',
                dot: 'w-2 h-2 rounded-full bg-[#2DD4BF] shrink-0 shadow-[0_0_8px_rgba(45,212,191,0.6)]',
                navArrowBtn: 'text-[#E2E8F0]/70 hover:text-[#2DD4BF] hover:bg-white/10 rounded-md p-1.5 transition-colors',
                monthTextBtn: 'text-[#E2E8F0] hover:text-[#2DD4BF] hover:bg-white/5 rounded-md text-xs sm:text-sm font-bold px-2.5 py-1 font-[\'Syne\'] transition-colors',
                todayBtn: 'bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30 hover:bg-[#2DD4BF]/25 rounded-md px-2.5 py-1 text-xs font-bold font-[\'JetBrains_Mono\'] uppercase tracking-wider transition-all',
            };
        }
        if (isTechnical) {
            return {
                wrapper: 'bg-transparent border-b border-[#111113]/15 py-1.5 px-1 font-[\'JetBrains_Mono\']',
                title: 'text-[#111113] font-bold text-sm sm:text-base font-[\'JetBrains_Mono\'] tracking-tight',
                dot: 'w-2 h-2 rounded-full bg-[#0D9488] shrink-0',
                navArrowBtn: 'text-[#111113]/70 hover:text-[#0D9488] hover:bg-black/5 rounded-md p-1.5 transition-colors',
                monthTextBtn: 'text-[#111113] hover:text-[#0D9488] hover:bg-black/5 rounded-md text-xs sm:text-sm font-bold px-2.5 py-1 transition-colors',
                todayBtn: 'bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30 hover:bg-[#0D9488]/25 rounded-md px-2.5 py-1 text-xs font-bold font-[\'JetBrains_Mono\'] uppercase tracking-wider transition-all',
            };
        }
        if (isEditorial) {
            return {
                wrapper: 'bg-transparent border-b border-[#1a1a1a]/15 py-1.5 px-1 font-[\'Geist\']',
                title: 'text-[#1a1a1a] font-bold text-sm sm:text-base font-[\'Geist\'] tracking-tight',
                dot: 'w-2 h-2 rounded-full bg-[#2a7373] shrink-0',
                navArrowBtn: 'text-[#1a1a1a]/70 hover:text-[#2a7373] hover:bg-black/5 rounded-md p-1.5 transition-colors',
                monthTextBtn: 'text-[#1a1a1a] hover:text-[#2a7373] hover:bg-black/5 rounded-md text-xs sm:text-sm font-bold px-2.5 py-1 transition-colors',
                todayBtn: 'bg-[#2a7373]/15 text-[#2a7373] border border-[#2a7373]/30 hover:bg-[#2a7373]/25 rounded-md px-2.5 py-1 text-xs font-bold transition-all',
            };
        }
        if (isDashboard) {
            return {
                wrapper: 'bg-transparent border-b border-[rgba(1,22,39,0.08)] py-1.5 px-1 font-[\'Inter\']',
                title: 'text-[#011627] font-bold text-sm sm:text-base font-[\'Inter\'] tracking-tight',
                dot: 'w-2 h-2 rounded-full bg-[#297373] shrink-0',
                navArrowBtn: 'text-[#011627]/70 hover:text-[#297373] hover:bg-black/5 rounded-md p-1.5 transition-colors',
                monthTextBtn: 'text-[#011627] hover:text-[#297373] hover:bg-black/5 rounded-md text-xs sm:text-sm font-bold px-2.5 py-1 transition-colors',
                todayBtn: 'bg-[#297373]/10 text-[#297373] border border-[#297373]/25 hover:bg-[#297373]/20 rounded-md px-2.5 py-1 text-xs font-bold transition-all',
            };
        }
        if (isPaperSketch) {
            return {
                wrapper: 'bg-transparent border-b-2 border-dashed border-[#2b2b2b] py-1.5 px-1',
                title: 'text-[#2b2b2b] font-[\'Gochi_Hand\'] text-lg sm:text-xl font-bold tracking-wide',
                dot: 'w-2 h-2 rounded-full bg-[#ff4747] shrink-0 border border-[#2b2b2b]',
                navArrowBtn: 'text-[#2b2b2b] hover:bg-[#2ec4b6] border border-[#2b2b2b] rounded-md p-1.5 transition-colors shadow-[1.5px_1.5px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5',
                monthTextBtn: 'text-[#2b2b2b] hover:bg-[#2ec4b6]/20 font-[\'Gochi_Hand\'] text-base sm:text-lg font-bold px-2.5 py-1 transition-colors border border-transparent hover:border-[#2b2b2b] rounded-md',
                todayBtn: 'bg-[#2ec4b6] text-[#2b2b2b] border-2 border-[#2b2b2b] hover:bg-[#26a89c] rounded-md px-2.5 py-1 text-xs font-[\'Gaegu\'] text-sm font-bold shadow-[2px_2px_0px_#2b2b2b] transition-all active:translate-x-0.5 active:translate-y-0.5',
            };
        }
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
                wrapper: 'bg-transparent border-b border-white/20 py-1.5 px-1',
                title: 'text-white font-extrabold text-sm sm:text-base tracking-tight drop-shadow-sm',
                dot: 'w-2 h-2 rounded-full bg-sky-400 shrink-0 shadow-[0_0_8px_rgba(56,189,248,0.8)]',
                navArrowBtn: 'bg-white/20 hover:bg-white/35 text-white border border-white/40 rounded-lg p-1.5 transition-all active:scale-95 shadow-xs backdrop-blur-md',
                monthTextBtn: 'bg-white/20 hover:bg-white/35 text-white border border-white/40 rounded-lg text-xs sm:text-sm font-extrabold px-3 py-1 transition-all shadow-xs backdrop-blur-md',
                todayBtn: 'bg-sky-500/30 text-white border border-sky-300/80 hover:bg-sky-500/50 rounded-lg px-2.5 py-1 text-xs font-extrabold transition-all active:scale-95 shadow-sm backdrop-blur-md',
            };
        }
        // Default Clean Light Mode
        return {
            wrapper: 'bg-transparent border-b border-slate-200/90 py-1 px-1',
            title: 'text-slate-900 font-bold text-xs sm:text-sm tracking-tight',
            dot: 'w-2 h-2 rounded-full bg-teal-500 shrink-0 shadow-[0_0_6px_rgba(20,184,166,0.4)]',
            navArrowBtn: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-full p-1 transition-colors active:scale-95',
            monthTextBtn: 'text-slate-900 hover:text-teal-700 hover:bg-slate-100/80 rounded-md text-xs sm:text-[13px] font-bold px-2 py-0.5 transition-colors',
            todayBtn: 'bg-teal-500/10 text-teal-700 border border-teal-500/25 hover:bg-teal-500/15 rounded-lg px-2 py-0.5 text-[11px] sm:text-xs font-semibold transition-all active:scale-95',
        };
    };

    const styles = getMinimalistStyles();

    return (
        <div className={`w-full min-w-0 select-none flex flex-col md:flex-row items-center justify-center md:justify-between text-center md:text-left gap-2 sm:gap-2.5 ${styles.wrapper}`}>
            {/* 1. Judul Statis: Rata Tengah di Mobile, Rata Kiri di Desktop (Tanpa Dot) */}
            <div className="flex items-center justify-center md:justify-start space-x-2 min-w-0">
                <CalendarCheck2 className={`h-4.5 w-4.5 sm:h-5 sm:w-5 shrink-0 ${isVista ? 'text-sky-300 drop-shadow-xs' : 'text-teal-600 dark:text-teal-400'}`} />
                <h2 className={`${styles.title} text-sm sm:text-base md:text-md lg:text-lg font-bold tracking-tight`}>
                    {staticTitle}
                </h2>
            </div>

            {/* 2. Navigasi Tanpa Bingkai: Rata Tengah di Mobile, Rata Kanan di Desktop */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 shrink-0">
                {showMonthNavigation && (
                    <div className="flex items-center justify-center md:justify-end space-x-1.5">
                        {/* 3. Tombol "Sekarang" */}
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

                        {/* Navigasi Bulan Tanpa Bingkai */}
                        <div className="flex items-center justify-center md:justify-end space-x-0.5">
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
                                        className={`flex items-center justify-center space-x-1.5 cursor-pointer w-[130px] min-[380px]:w-[145px] sm:w-[165px] shrink-0 text-center ${styles.monthTextBtn}`}
                                    >
                                        <CalendarDays className="h-3.5 w-3.5 shrink-0 opacity-70" />
                                        <span className="truncate whitespace-nowrap text-center">
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

                {/* Right Content */}
                {rightContent && (
                    <div className="flex items-center justify-center md:justify-end space-x-1 shrink-0">
                        {rightContent}
                    </div>
                )}
            </div>
        </div>
    );
});

export default SubToolbarHeader;
