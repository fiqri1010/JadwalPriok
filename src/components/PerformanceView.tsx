import React, { useState, useMemo } from 'react';
import {
    Award,
    Calendar,
    Clock,
    TrendingUp,
    Download,
    FileSpreadsheet,
    FileText,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    Info,
    CalendarDays,
    Layers,
    ArrowUpRight,
    Check,
    BarChart3,
    RotateCcw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { DayData, ShiftType, CeisaScoreResult, PeriodPerformanceSummary, AppTheme } from '../types';
import {
    calculateCeisaScore,
    calculatePeriodPerformance,
    getPredikatPerformance,
    calculateDayResult
} from '../lib/calculator';
import { getIndonesianHoliday } from '../data/holidays';
import { saveFileWithDialog } from '../lib/fileDownload';

interface PerformanceViewProps {
    daysState: Record<string, DayData>;
    selectedYear: number;
    selectedMonth: number;
    theme?: AppTheme;
    onYearChange: (year: number) => void;
    onMonthChange: (month: number) => void;
}

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

type ViewPeriodType = 'month' | 'quarter' | 'semester' | 'year';

export const PerformanceView: React.FC<PerformanceViewProps> = ({
    daysState,
    selectedYear,
    selectedMonth,
    theme = 'default',
    onYearChange,
    onMonthChange,
}) => {
    const [periodType, setPeriodType] = useState<ViewPeriodType>('month');
    const [selectedQuarter, setSelectedQuarter] = useState<number>(() => Math.ceil(selectedMonth / 3)); // 1, 2, 3, 4
    const [selectedSemester, setSelectedSemester] = useState<number>(() => selectedMonth <= 6 ? 1 : 2); // 1 or 2
    const [exportSuccess, setExportSuccess] = useState<string | null>(null);

    const isDark = theme === 'dark';
    const isVista = theme === 'vista';
    const isWinamp = theme === 'winamp';

    // Outer Containers
    let headerBoxClass = 'bg-white border-slate-200 text-slate-900';
    let tabListClass = 'bg-slate-100/90 text-slate-600';
    let tabActiveClass = 'bg-white text-indigo-700 shadow-xs';
    let tabInactiveClass = 'text-slate-600 hover:text-slate-900';
    let selectorBoxClass = 'bg-slate-50 border-slate-200 text-slate-800';

    // 1. Kotak Rata-Rata Skala (Card 1)
    let avgCardClass = 'bg-white border-slate-200 text-slate-900 shadow-xs';
    let avgLabelClass = 'text-slate-500 font-bold';
    let avgIconBoxClass = 'bg-slate-100 text-teal-600 border border-slate-200';
    let avgValueClass = 'text-slate-900';
    let avgSubClass = 'text-slate-500';

    // 2. Kotak Hari Terhitung (Card 2)
    let countCardClass = 'bg-white border-slate-200 text-slate-900 shadow-xs';
    let countLabelClass = 'text-slate-500';
    let countIconBoxClass = 'bg-slate-100 text-slate-600';
    let countValueClass = 'text-slate-900';
    let countSubClass = 'text-slate-500';

    // 3. Indikator Patuh Sangat Patuh (Card 3)
    let patuhCardClass = 'bg-white border-slate-200 text-slate-900 shadow-xs';
    let patuhLabelClass = 'text-slate-500';
    let patuhPill4Class = 'bg-emerald-50 text-emerald-900';
    let patuhPill3Class = 'bg-blue-50 text-blue-900';

    // 4. Indikator Kurang & Tidak Patuh (Card 4)
    let nonPatuhCardClass = 'bg-white border-slate-200 text-slate-900 shadow-xs';
    let nonPatuhLabelClass = 'text-slate-500';
    let nonPatuhPill2Class = 'bg-amber-50 text-amber-900';
    let nonPatuhPill1Class = 'bg-rose-50 text-rose-900';

    // 5. Aturan Logika Penilaian (Outer Box) & 3 Inner Boxes
    let rulesOuterBoxClass = 'bg-indigo-50/70 border-indigo-100 text-indigo-950';
    let rulesTitleClass = 'text-indigo-900';
    let rulesInnerBoxClass = 'bg-white/80 border-indigo-100/60 shadow-2xs text-slate-700';

    // 6. Section Performa Antar Kuartal (Outer & 7 Inner Boxes)
    let quarterOuterClass = 'bg-white border-slate-200 text-slate-900 shadow-xs';
    let quarterItemClass = 'bg-slate-50/70 border-slate-200 text-slate-900';
    let quarterYearItemClass = 'bg-indigo-50 border-indigo-200 text-indigo-950';
    let quarterItemLabelClass = 'text-slate-500';
    let quarterItemValClass = 'text-slate-900';
    let quarterItemSubClass = 'text-slate-600';

    // 7. Tabel Container
    let tableCardClass = 'bg-white border-slate-200 text-slate-900 shadow-xs';
    let tableHeaderBgClass = 'bg-slate-50 border-slate-200 text-slate-900';
    let tableThBgClass = 'bg-slate-100/80 border-slate-200 text-slate-700';
    let tableThHoverClass = 'hover:bg-slate-200/80';
    let tableRowBorderClass = 'border-slate-100';

    if (isDark) {
        headerBoxClass = 'bg-[#181818] border-[#333333] text-slate-100';
        tabListClass = 'bg-[#222222] text-slate-300 border border-[#333333]';
        tabActiveClass = 'bg-indigo-600 text-white shadow-xs';
        tabInactiveClass = 'text-slate-400 hover:text-slate-100';
        selectorBoxClass = 'bg-[#222222] border-[#444444] text-slate-100';

        avgCardClass = 'bg-[#1E1E1E] border-[#333333] text-slate-100 shadow-md';
        avgLabelClass = 'text-slate-400';
        avgIconBoxClass = 'bg-[#252525] border border-[#383838] text-teal-400';
        avgValueClass = 'text-white';
        avgSubClass = 'text-slate-400';

        countCardClass = 'bg-[#1E1E1E] border-[#333333] text-slate-100 shadow-md';
        countLabelClass = 'text-slate-400';
        countIconBoxClass = 'bg-[#252525] text-slate-300';
        countValueClass = 'text-slate-100';
        countSubClass = 'text-slate-400';

        patuhCardClass = 'bg-[#1E1E1E] border-[#333333] text-slate-100 shadow-md';
        patuhLabelClass = 'text-slate-400';
        patuhPill4Class = 'bg-[#0d2818] border border-emerald-700/60 text-emerald-300';
        patuhPill3Class = 'bg-[#131b2e] border border-blue-700/60 text-blue-300';

        nonPatuhCardClass = 'bg-[#1E1E1E] border-[#333333] text-slate-100 shadow-md';
        nonPatuhLabelClass = 'text-slate-400';
        nonPatuhPill2Class = 'bg-[#2a2010] border border-amber-700/60 text-amber-300';
        nonPatuhPill1Class = 'bg-[#2b1216] border border-rose-700/60 text-rose-300';

        rulesOuterBoxClass = 'bg-[#1E1E1E] border-[#333333] text-slate-100 shadow-md';
        rulesTitleClass = 'text-indigo-300';
        rulesInnerBoxClass = 'bg-[#252525] border-[#383838] shadow-sm text-slate-200';

        quarterOuterClass = 'bg-[#1E1E1E] border-[#333333] text-slate-100 shadow-md';
        quarterItemClass = 'bg-[#252525] border-[#333333] text-slate-100';
        quarterYearItemClass = 'bg-[#252525] border-indigo-500/70 text-indigo-100 shadow-sm';
        quarterItemLabelClass = 'text-slate-400';
        quarterItemValClass = 'text-slate-100';
        quarterItemSubClass = 'text-slate-400';

        tableCardClass = 'bg-[#181818] border-[#333333] text-slate-200 shadow-lg';
        tableHeaderBgClass = 'bg-[#202020] border-[#333333] text-slate-100';
        tableThBgClass = 'bg-[#1E1E1E] border-[#333333] text-slate-300';
        tableThHoverClass = 'hover:bg-[#282828]';
        tableRowBorderClass = 'border-[#2A2A2A]';
    } else if (isVista) {
        headerBoxClass = 'bg-white/40 backdrop-blur-md border-white/60 text-[#0F172A] shadow-md';
        tabListClass = 'bg-white/30 backdrop-blur-xs text-slate-800 border border-white/40';
        tabActiveClass = 'bg-white/80 text-blue-900 shadow-sm font-black';
        tabInactiveClass = 'text-slate-700 hover:text-slate-950';
        selectorBoxClass = 'bg-white/40 backdrop-blur-xs border-white/50 text-[#0F172A]';

        avgCardClass = 'bg-white/40 backdrop-blur-md border-white/50 text-[#0F172A] shadow-md';
        avgLabelClass = 'text-slate-600 font-bold';
        avgIconBoxClass = 'bg-white/50 text-blue-900 border border-white/40';
        avgValueClass = 'text-slate-900 drop-shadow-xs';
        avgSubClass = 'text-slate-600';

        countCardClass = 'bg-white/40 backdrop-blur-md border-white/50 text-[#0F172A] shadow-md';
        countLabelClass = 'text-slate-600';
        countIconBoxClass = 'bg-white/50 text-blue-900 border border-white/40';
        countValueClass = 'text-slate-900';
        countSubClass = 'text-slate-600';

        patuhCardClass = 'bg-white/40 backdrop-blur-md border-white/50 text-[#0F172A] shadow-md';
        patuhLabelClass = 'text-slate-600';
        patuhPill4Class = 'bg-emerald-500/25 border border-emerald-400/40 text-emerald-950 font-black';
        patuhPill3Class = 'bg-blue-500/25 border border-blue-400/40 text-blue-950 font-black';

        nonPatuhCardClass = 'bg-white/40 backdrop-blur-md border-white/50 text-[#0F172A] shadow-md';
        nonPatuhLabelClass = 'text-slate-600';
        nonPatuhPill2Class = 'bg-amber-500/25 border border-amber-400/40 text-amber-950 font-black';
        nonPatuhPill1Class = 'bg-rose-500/25 border border-rose-400/40 text-rose-950 font-black';

        rulesOuterBoxClass = 'bg-slate-900/65 backdrop-blur-md border-white/30 text-white shadow-md';
        rulesTitleClass = 'text-sky-300';
        rulesInnerBoxClass = 'bg-white/15 backdrop-blur-xs border-white/20 text-white shadow-xs';

        quarterOuterClass = 'bg-white/40 backdrop-blur-md border-white/50 text-[#0F172A] shadow-md';
        quarterItemClass = 'bg-white/20 backdrop-blur-xs border-white/30 text-[#0F172A]';
        quarterYearItemClass = 'bg-sky-500/30 backdrop-blur-xs border-white/50 text-[#0F172A] font-black shadow-xs';
        quarterItemLabelClass = 'text-slate-600 font-bold';
        quarterItemValClass = 'text-slate-900';
        quarterItemSubClass = 'text-slate-700';

        tableCardClass = 'bg-white/40 backdrop-blur-md border-white/60 text-[#0F172A] shadow-lg';
        tableHeaderBgClass = 'bg-white/50 backdrop-blur-xs border-white/50 text-slate-900';
        tableThBgClass = 'bg-white/60 border-white/50 text-slate-900';
        tableThHoverClass = 'hover:bg-white/40';
        tableRowBorderClass = 'border-white/40';
    } else if (isWinamp) {
        headerBoxClass = 'bg-black border-2 border-[#333333] text-[#00FF00] font-mono rounded-none';
        tabListClass = 'bg-black text-[#00FF00] border border-[#555555] font-mono rounded-none';
        tabActiveClass = 'bg-[#00FF00] text-black font-mono font-black';
        tabInactiveClass = 'text-[#00FF00] hover:bg-zinc-900';
        selectorBoxClass = 'bg-black border-2 border-[#555555] text-[#00FF00] font-mono rounded-none';

        avgCardClass = 'bg-black border-2 border-[#00FF00] text-[#00FF00] font-mono rounded-none shadow-[0_0_10px_rgba(0,255,0,0.4)]';
        avgLabelClass = 'text-[#00FF00]';
        avgIconBoxClass = 'bg-black border border-[#00FF00] text-[#00FF00] rounded-none';
        avgValueClass = 'text-[#00FF00]';
        avgSubClass = 'text-[#00FF00]/80';

        countCardClass = 'bg-black border-2 border-[#555555] text-[#00E5FF] font-mono rounded-none shadow-none';
        countLabelClass = 'text-[#00E5FF]';
        countIconBoxClass = 'bg-zinc-950 text-[#00E5FF] border border-[#555555]';
        countValueClass = 'text-[#00E5FF]';
        countSubClass = 'text-[#00E5FF]/80';

        patuhCardClass = 'bg-black border-2 border-[#00FF00]/60 text-[#00FF00] font-mono rounded-none shadow-none';
        patuhLabelClass = 'text-[#00FF00]';
        patuhPill4Class = 'bg-black border border-[#00FF00] text-[#00FF00]';
        patuhPill3Class = 'bg-black border border-[#00E5FF] text-[#00E5FF]';

        nonPatuhCardClass = 'bg-black border-2 border-[#FF3366]/60 text-[#FF3366] font-mono rounded-none shadow-none';
        nonPatuhLabelClass = 'text-[#FF3366]';
        nonPatuhPill2Class = 'bg-black border border-[#FFCC00] text-[#FFCC00]';
        nonPatuhPill1Class = 'bg-black border border-[#FF3366] text-[#FF3366]';

        rulesOuterBoxClass = 'bg-black border-2 border-[#00FF00] text-[#00FF00] font-mono rounded-none';
        rulesTitleClass = 'text-[#00FF00]';
        rulesInnerBoxClass = 'bg-black border border-[#00FF00]/40 text-[#00FF00] font-mono rounded-none';

        quarterOuterClass = 'bg-black border-2 border-[#333333] text-[#00FF00] font-mono rounded-none';
        quarterItemClass = 'bg-black border border-[#333333] text-[#00FF00] font-mono rounded-none';
        quarterYearItemClass = 'bg-black border-2 border-[#00FF00] text-[#00FF00] font-mono rounded-none';
        quarterItemLabelClass = 'text-[#888888]';
        quarterItemValClass = 'text-[#00FF00]';
        quarterItemSubClass = 'text-[#00E5FF]';

        tableCardClass = 'bg-black border-2 border-[#333333] text-[#00FF00] font-mono rounded-none shadow-none';
        tableHeaderBgClass = 'bg-[#1C1C1E] border-[#333333] text-[#FACC15] font-mono';
        tableThBgClass = 'bg-[#000000] border-[#333333] text-[#00FF00] font-mono';
        tableThHoverClass = 'hover:bg-[#181818]';
        tableRowBorderClass = 'border-[#222222]';
    }

    // Derivasi Tahun yang memiliki data aktual + Tahun yang sedang dipilih
    const availableYears = useMemo(() => {
        const yearSet = new Set<number>();
        Object.keys(daysState).forEach((key) => {
            const val = daysState[key];
            if (val && (val.shift || val.isMasuk || val.jamMasuk || val.jamPulang || val.absenCeisa || val.note)) {
                const parts = key.split('-');
                if (parts.length >= 2) {
                    const y = parseInt(parts[0], 10);
                    if (!isNaN(y)) yearSet.add(y);
                }
            }
        });
        yearSet.add(selectedYear);
        return Array.from(yearSet).sort((a, b) => a - b);
    }, [daysState, selectedYear]);

    // Derivasi Bulan untuk tahun terpilih: Bulan dengan data + Bulan yang sedang aktif dipilih
    const availableMonthsForSelectedYear = useMemo(() => {
        const monthSet = new Set<number>();
        Object.keys(daysState).forEach((key) => {
            const val = daysState[key];
            if (val && (val.shift || val.isMasuk || val.jamMasuk || val.jamPulang || val.absenCeisa || val.note)) {
                const parts = key.split('-');
                if (parts.length >= 2) {
                    const y = parseInt(parts[0], 10);
                    const m = parseInt(parts[1], 10);
                    if (y === selectedYear && !isNaN(m) && m >= 1 && m <= 12) {
                        monthSet.add(m);
                    }
                }
            }
        });
        // Selalu pastikan selectedMonth disertakan agar tidak ter-reset atau terpental ke bulan lain
        monthSet.add(selectedMonth);
        return Array.from(monthSet).sort((a, b) => a - b);
    }, [daysState, selectedYear, selectedMonth]);

    // Derive active months based on periodType
    const activeMonths = useMemo(() => {
        switch (periodType) {
            case 'month':
                return [selectedMonth];
            case 'quarter':
                return [(selectedQuarter - 1) * 3 + 1, (selectedQuarter - 1) * 3 + 2, (selectedQuarter - 1) * 3 + 3];
            case 'semester':
                return selectedSemester === 1 ? [1, 2, 3, 4, 5, 6] : [7, 8, 9, 10, 11, 12];
            case 'year':
                return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        }
    }, [periodType, selectedMonth, selectedQuarter, selectedSemester]);

    const periodLabel = useMemo(() => {
        switch (periodType) {
            case 'month':
                return `Bulan ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;
            case 'quarter':
                return `Kuartal ${selectedQuarter} (Q${selectedQuarter}) ${selectedYear}`;
            case 'semester':
                return `Semester ${selectedSemester} (${selectedSemester === 1 ? 'Jan - Jun' : 'Jul - Des'}) ${selectedYear}`;
            case 'year':
                return `Tahun ${selectedYear} Penuh`;
        }
    }, [periodType, selectedMonth, selectedQuarter, selectedSemester, selectedYear]);

    // Main Period Performance Summary
    const currentSummary: PeriodPerformanceSummary = useMemo(() => {
        return calculatePeriodPerformance(daysState, selectedYear, activeMonths, periodLabel, periodType);
    }, [daysState, selectedYear, activeMonths, periodLabel, periodType]);

    // Comparison Summaries for Cards
    const monthSummary = useMemo(() => {
        return calculatePeriodPerformance(daysState, selectedYear, [selectedMonth], MONTH_NAMES[selectedMonth - 1], 'month');
    }, [daysState, selectedYear, selectedMonth]);

    const q1Summary = useMemo(() => calculatePeriodPerformance(daysState, selectedYear, [1, 2, 3], 'Q1 (Jan-Mar)', 'quarter'), [daysState, selectedYear]);
    const q2Summary = useMemo(() => calculatePeriodPerformance(daysState, selectedYear, [4, 5, 6], 'Q2 (Apr-Jun)', 'quarter'), [daysState, selectedYear]);
    const q3Summary = useMemo(() => calculatePeriodPerformance(daysState, selectedYear, [7, 8, 9], 'Q3 (Jul-Sep)', 'quarter'), [daysState, selectedYear]);
    const q4Summary = useMemo(() => calculatePeriodPerformance(daysState, selectedYear, [10, 11, 12], 'Q4 (Okt-Des)', 'quarter'), [daysState, selectedYear]);

    const sem1Summary = useMemo(() => calculatePeriodPerformance(daysState, selectedYear, [1, 2, 3, 4, 5, 6], 'Semester 1', 'semester'), [daysState, selectedYear]);
    const sem2Summary = useMemo(() => calculatePeriodPerformance(daysState, selectedYear, [7, 8, 9, 10, 11, 12], 'Semester 2', 'semester'), [daysState, selectedYear]);
    const yearSummary = useMemo(() => calculatePeriodPerformance(daysState, selectedYear, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], `Tahun ${selectedYear}`, 'year'), [daysState, selectedYear]);

    // Detailed Daily Entries for the active period
    const dailyEntries = useMemo(() => {
        const list: Array<{
            dateStr: string;
            dateKey: string;
            day: number;
            month: number;
            year: number;
            dayName: string;
            shift: ShiftType;
            isMasuk: boolean;
            isHoldDokumen: boolean;
            absenCeisa: string;
            scoreResult: CeisaScoreResult;
            note: string;
            holidayName: string | null;
            isManualHoliday: boolean;
        }> = [];

        activeMonths.forEach((m) => {
            const daysInMonth = new Date(selectedYear, m, 0).getDate();
            for (let d = 1; d <= daysInMonth; d++) {
                const key = `${selectedYear}-${m}-${d}`;
                const data = daysState[key] || {
                    shift: 'Graha',
                    isMasuk: true,
                    jamMasuk: '',
                    jamPulang: '',
                    absenCeisa: '',
                    isManualHoliday: false,
                    isSuratTugasTambahan: false,
                    note: '',
                    isHoldDokumen: false,
                    isLocked: false,
                };

                const dateObj = new Date(selectedYear, m - 1, d);
                const dayOfWeek = dateObj.getDay();
                const dayName = INDONESIAN_DAYS[dayOfWeek];
                const holidayName = getIndonesianHoliday(selectedYear, m, d);
                const isHold = !!data.isHoldDokumen;
                const scoreResult = calculateCeisaScore(data.shift, data.absenCeisa, data.isMasuk, isHold);

                list.push({
                    dateStr: `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${selectedYear}`,
                    dateKey: key,
                    day: d,
                    month: m,
                    year: selectedYear,
                    dayName,
                    shift: data.shift,
                    isMasuk: data.isMasuk,
                    isHoldDokumen: isHold,
                    absenCeisa: data.absenCeisa,
                    scoreResult,
                    note: data.note,
                    holidayName,
                    isManualHoliday: data.isManualHoliday,
                });
            }
        });

        return list;
    }, [activeMonths, selectedYear, daysState]);

    // Client-side Sorting State for Log Absen CEISA & Nilai Harian Table
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: string) => {
        setSortConfig((prev) => {
            if (prev && prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const sortedDailyEntries = useMemo(() => {
        if (!sortConfig) return dailyEntries;
        const { key, direction } = sortConfig;
        const modifier = direction === 'asc' ? 1 : -1;

        return [...dailyEntries].sort((a, b) => {
            let aVal: string | number = '';
            let bVal: string | number = '';

            switch (key) {
                case 'date':
                    aVal = new Date(a.year, a.month - 1, a.day).getTime();
                    bVal = new Date(b.year, b.month - 1, b.day).getTime();
                    break;
                case 'dayName':
                    aVal = a.dayName;
                    bVal = b.dayName;
                    break;
                case 'shift':
                    aVal = (a.shift || '').toLowerCase();
                    bVal = (b.shift || '').toLowerCase();
                    break;
                case 'status':
                    aVal = a.isHoldDokumen ? 'Hold' : (a.isMasuk ? 'Masuk' : 'Off');
                    bVal = b.isHoldDokumen ? 'Hold' : (b.isMasuk ? 'Masuk' : 'Off');
                    break;
                case 'absenCeisa':
                    aVal = a.absenCeisa || '';
                    bVal = b.absenCeisa || '';
                    break;
                case 'score':
                    aVal = a.isHoldDokumen ? -1 : (a.scoreResult.isEligible ? a.scoreResult.score : 0);
                    bVal = b.isHoldDokumen ? -1 : (b.scoreResult.isEligible ? b.scoreResult.score : 0);
                    break;
                case 'category':
                    aVal = (a.scoreResult as any).category || a.scoreResult.grade || '';
                    bVal = (b.scoreResult as any).category || b.scoreResult.grade || '';
                    break;
                case 'ruleDescription':
                    aVal = a.scoreResult.ruleDescription || '';
                    bVal = b.scoreResult.ruleDescription || '';
                    break;
                case 'note':
                    aVal = (a.note || '').toLowerCase();
                    bVal = (b.note || '').toLowerCase();
                    break;
                default:
                    return 0;
            }

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return (aVal - bVal) * modifier;
            }

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return aVal.localeCompare(bVal, 'id', { numeric: true, sensitivity: 'base' }) * modifier;
            }

            if (aVal < bVal) return -1 * modifier;
            if (aVal > bVal) return 1 * modifier;
            return 0;
        });
    }, [dailyEntries, sortConfig]);

    const renderSortIndicator = (colKey: string) => {
        if (sortConfig?.key !== colKey) {
            return (
                <span className="inline-block ml-1 text-slate-400 opacity-40 group-hover:opacity-100 text-[10px] select-none transition-opacity">
                    ⇅
                </span>
            );
        }
        return (
            <span className="inline-block ml-1 text-indigo-600 font-black text-xs select-none">
                {sortConfig.direction === 'asc' ? '▲' : '▼'}
            </span>
        );
    };

    // Helper trigger download (Mendukung Desktop Tauri, Mobile Capacitor, dan Browser)
    const triggerDownload = async (
        blob: Blob,
        filename: string,
        description: string = 'File Laporan',
        extension: string = 'xlsx',
        mimeType: string = 'application/octet-stream'
    ) => {
        await saveFileWithDialog({
            blob,
            filename,
            description,
            extension,
            mimeType,
        });
    };

    // 1. Export Excel Data Performance
    const handleExportExcel = () => {
        try {
            const workbook = XLSX.utils.book_new();

            // Sheet 1: Detail Harian
            const detailRows = dailyEntries.map((row) => ({
                'Tanggal': row.dateStr,
                'Hari': row.dayName,
                'Shift': row.shift,
                'Status Masuk': row.isMasuk ? 'Masuk' : 'Off / Libur',
                'Absen CEISA': row.absenCeisa || '-',
                'Nilai Skala (1-4)': row.scoreResult.isEligible ? row.scoreResult.score : '-',
                'Kategori / Grade': row.scoreResult.grade,
                'Keterangan Evaluasi': row.scoreResult.ruleDescription,
                'Catatan': row.note || '-',
            }));

            const wsDetail = XLSX.utils.json_to_sheet(detailRows);
            XLSX.utils.book_append_sheet(workbook, wsDetail, 'Detail_Absen_CEISA');

            // Sheet 2: Rekapitulasi Periode
            const rekapRows = [
                {
                    'Periode': `Bulan ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`,
                    'Hari Terhitung': monthSummary.totalDaysEvaluated,
                    'Total Nilai': monthSummary.totalScore,
                    'Rata-rata Skala': Number(monthSummary.averageScore.toFixed(2)),
                    'Skala 4 (Sangat Patuh)': monthSummary.countScore4,
                    'Skala 3 (Patuh)': monthSummary.countScore3,
                    'Skala 2 (Kurang Patuh)': monthSummary.countScore2,
                    'Skala 1 (Tidak Patuh)': monthSummary.countScore1,
                    'Predikat': monthSummary.predikat,
                },
                {
                    'Periode': `Kuartal 1 (Jan - Mar ${selectedYear})`,
                    'Hari Terhitung': q1Summary.totalDaysEvaluated,
                    'Total Nilai': q1Summary.totalScore,
                    'Rata-rata Skala': Number(q1Summary.averageScore.toFixed(2)),
                    'Skala 4 (Sangat Patuh)': q1Summary.countScore4,
                    'Skala 3 (Patuh)': q1Summary.countScore3,
                    'Skala 2 (Kurang Patuh)': q1Summary.countScore2,
                    'Skala 1 (Tidak Patuh)': q1Summary.countScore1,
                    'Predikat': q1Summary.predikat,
                },
                {
                    'Periode': `Kuartal 2 (Apr - Jun ${selectedYear})`,
                    'Hari Terhitung': q2Summary.totalDaysEvaluated,
                    'Total Nilai': q2Summary.totalScore,
                    'Rata-rata Skala': Number(q2Summary.averageScore.toFixed(2)),
                    'Skala 4 (Sangat Patuh)': q2Summary.countScore4,
                    'Skala 3 (Patuh)': q2Summary.countScore3,
                    'Skala 2 (Kurang Patuh)': q2Summary.countScore2,
                    'Skala 1 (Tidak Patuh)': q2Summary.countScore1,
                    'Predikat': q2Summary.predikat,
                },
                {
                    'Periode': `Kuartal 3 (Jul - Sep ${selectedYear})`,
                    'Hari Terhitung': q3Summary.totalDaysEvaluated,
                    'Total Nilai': q3Summary.totalScore,
                    'Rata-rata Skala': Number(q3Summary.averageScore.toFixed(2)),
                    'Skala 4 (Sangat Patuh)': q3Summary.countScore4,
                    'Skala 3 (Patuh)': q3Summary.countScore3,
                    'Skala 2 (Kurang Patuh)': q3Summary.countScore2,
                    'Skala 1 (Tidak Patuh)': q3Summary.countScore1,
                    'Predikat': q3Summary.predikat,
                },
                {
                    'Periode': `Kuartal 4 (Okt - Des ${selectedYear})`,
                    'Hari Terhitung': q4Summary.totalDaysEvaluated,
                    'Total Nilai': q4Summary.totalScore,
                    'Rata-rata Skala': Number(q4Summary.averageScore.toFixed(2)),
                    'Skala 4 (Sangat Patuh)': q4Summary.countScore4,
                    'Skala 3 (Patuh)': q4Summary.countScore3,
                    'Skala 2 (Kurang Patuh)': q4Summary.countScore2,
                    'Skala 1 (Tidak Patuh)': q4Summary.countScore1,
                    'Predikat': q4Summary.predikat,
                },
                {
                    'Periode': `Semester 1 (Jan - Jun ${selectedYear})`,
                    'Hari Terhitung': sem1Summary.totalDaysEvaluated,
                    'Total Nilai': sem1Summary.totalScore,
                    'Rata-rata Skala': Number(sem1Summary.averageScore.toFixed(2)),
                    'Skala 4 (Sangat Patuh)': sem1Summary.countScore4,
                    'Skala 3 (Patuh)': sem1Summary.countScore3,
                    'Skala 2 (Kurang Patuh)': sem1Summary.countScore2,
                    'Skala 1 (Tidak Patuh)': sem1Summary.countScore1,
                    'Predikat': sem1Summary.predikat,
                },
                {
                    'Periode': `Semester 2 (Jul - Des ${selectedYear})`,
                    'Hari Terhitung': sem2Summary.totalDaysEvaluated,
                    'Total Nilai': sem2Summary.totalScore,
                    'Rata-rata Skala': Number(sem2Summary.averageScore.toFixed(2)),
                    'Skala 4 (Sangat Patuh)': sem2Summary.countScore4,
                    'Skala 3 (Patuh)': sem2Summary.countScore3,
                    'Skala 2 (Kurang Patuh)': sem2Summary.countScore2,
                    'Skala 1 (Tidak Patuh)': sem2Summary.countScore1,
                    'Predikat': sem2Summary.predikat,
                },
                {
                    'Periode': `Tahun ${selectedYear} Penuh`,
                    'Hari Terhitung': yearSummary.totalDaysEvaluated,
                    'Total Nilai': yearSummary.totalScore,
                    'Rata-rata Skala': Number(yearSummary.averageScore.toFixed(2)),
                    'Skala 4 (Sangat Patuh)': yearSummary.countScore4,
                    'Skala 3 (Patuh)': yearSummary.countScore3,
                    'Skala 2 (Kurang Patuh)': yearSummary.countScore2,
                    'Skala 1 (Tidak Patuh)': yearSummary.countScore1,
                    'Predikat': yearSummary.predikat,
                },
            ];

            const wsRekap = XLSX.utils.json_to_sheet(rekapRows);
            XLSX.utils.book_append_sheet(workbook, wsRekap, 'Ringkasan_Kuartal_Semester');

            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            triggerDownload(blob, `Rekap_Performance_CEISA_${periodType}_${selectedYear}.xlsx`);
            setExportSuccess('excel');
            setTimeout(() => setExportSuccess(null), 3000);
        } catch (e) {
            console.error('Error export excel:', e);
        }
    };

    // 2. Export PDF Laporan Performance
    const handleExportPDF = async () => {
        try {
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            // Title & Header
            doc.setFillColor(15, 23, 42); // slate-900
            doc.rect(0, 0, 210, 32, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('LAPORAN PERHITUNGAN PERFORMANCE CEISA', 14, 14);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Periode: ${periodLabel}  |  Dicetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 23);

            // Box Rangkuman Nilai
            doc.setDrawColor(203, 213, 225);
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(14, 38, 182, 34, 3, 3, 'FD');

            doc.setTextColor(30, 41, 59);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('RANGKUMAN PENILAIAN PERFORMA', 20, 47);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Rata-rata Skala : ${currentSummary.averageScore.toFixed(2)} / 4.00 (${currentSummary.predikat})`, 20, 56);
            doc.text(`Total Hari Dievaluasi : ${currentSummary.totalDaysEvaluated} Hari`, 20, 64);

            doc.text(`Distribusi Skala : 4 (${currentSummary.countScore4}x) | 3 (${currentSummary.countScore3}x) | 2 (${currentSummary.countScore2}x) | 1 (${currentSummary.countScore1}x)`, 105, 56);
            doc.text(`Total Akumulasi Poin : ${currentSummary.totalScore}`, 105, 64);

            // Tabel Detail Harian (Sample rows / Header)
            let y = 80;
            doc.setFillColor(226, 232, 240);
            doc.rect(14, y, 182, 7, 'F');
            doc.setFontSize(8.5);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text('Tgl', 16, y + 5);
            doc.text('Hari', 36, y + 5);
            doc.text('Shift', 58, y + 5);
            doc.text('Absen CEISA', 76, y + 5);
            doc.text('Skala', 106, y + 5);
            doc.text('Grade', 122, y + 5);
            doc.text('Evaluasi / Aturan', 148, y + 5);

            y += 8;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);

            dailyEntries.slice(0, 31).forEach((entry, idx) => {
                if (y > 275) {
                    doc.addPage();
                    y = 20;
                }

                if (idx % 2 === 1) {
                    doc.setFillColor(248, 250, 252);
                    doc.rect(14, y - 4, 182, 6, 'F');
                }

                doc.setTextColor(30, 41, 59);
                doc.text(entry.dateStr.slice(0, 5), 16, y);
                doc.text(entry.dayName, 36, y);
                doc.text(entry.shift, 58, y);
                doc.text(entry.absenCeisa || '-', 76, y);
                doc.setFont('helvetica', 'bold');
                doc.text(entry.scoreResult.isEligible ? `${entry.scoreResult.score}` : '-', 108, y);
                doc.setFont('helvetica', 'normal');
                doc.text(entry.scoreResult.grade, 122, y);
                doc.text(entry.scoreResult.ruleDescription.slice(0, 26), 148, y);

                y += 6;
            });

            const pdfBlob = doc.output('blob');
            await saveFileWithDialog({
                blob: pdfBlob,
                filename: `Laporan_Performance_CEISA_${periodType}_${selectedYear}.pdf`,
                description: 'Dokumen PDF Laporan',
                extension: 'pdf',
                mimeType: 'application/pdf',
            });
            setExportSuccess('pdf');
            setTimeout(() => setExportSuccess(null), 3000);
        } catch (e) {
            console.error('Error export PDF:', e);
        }
    };

    return (
        <div className="space-y-4 max-w-7xl mx-auto animate-in fade-in duration-150">
            {/* 1. Header Kontrol Periode & Filter */}
            <div className={`rounded-2xl p-3.5 sm:p-5 border shadow-xs ${headerBoxClass} ${isWinamp ? 'rounded-none font-mono' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-xs ${isWinamp ? 'bg-black border border-[#00FF00] text-[#00FF00] rounded-none' : isDark ? 'bg-[#252525] border border-[#383838] text-teal-400' : 'bg-[#297373]'}`}>
                                <Award className="h-4 w-4" />
                            </span>
                            <div>
                                <h1 className="text-base sm:text-lg font-black tracking-tight">
                                    Perhitungan Performance Absen CEISA
                                </h1>
                                <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : isVista ? 'text-slate-700' : isWinamp ? 'text-[#00FF00]/70' : 'text-slate-500'}`}>
                                    Kalkulasi nilai dan rekapitulasi performa kehadiran berdasarkan aturan shift kerja
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Action Export Buttons */}
                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={handleExportExcel}
                            className={`flex items-center space-x-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer ${isWinamp
                                    ? 'bg-black border-2 border-[#00FF00] text-[#00FF00] font-mono rounded-none hover:bg-[#00FF00] hover:text-black'
                                    : isDark
                                        ? 'bg-[#0d2818] border-emerald-700/80 text-emerald-300 hover:bg-[#133822]'
                                        : isVista
                                            ? 'bg-emerald-500/20 backdrop-blur-xs border-emerald-300/40 text-emerald-950 hover:bg-emerald-500/30'
                                            : 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100 text-emerald-800'
                                }`}
                            title="Unduh Rekap Excel"
                        >
                            {exportSuccess === 'excel' ? <Check className="h-4 w-4 text-emerald-600" /> : <FileSpreadsheet className="h-4 w-4 text-emerald-600" />}
                            <span>{exportSuccess === 'excel' ? 'Tersimpan!' : 'Excel (.xlsx)'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleExportPDF}
                            className={`flex items-center space-x-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer ${isWinamp
                                    ? 'bg-black border-2 border-[#FF3366] text-[#FF3366] font-mono rounded-none hover:bg-[#FF3366] hover:text-black'
                                    : isDark
                                        ? 'bg-[#2b1216] border-rose-700/80 text-rose-300 hover:bg-[#38181d]'
                                        : isVista
                                            ? 'bg-rose-500/20 backdrop-blur-xs border-rose-300/40 text-rose-950 hover:bg-rose-500/30'
                                            : 'bg-rose-50 border-rose-300 hover:bg-rose-100 text-rose-800'
                                }`}
                            title="Unduh Laporan PDF"
                        >
                            {exportSuccess === 'pdf' ? <Check className="h-4 w-4 text-rose-600" /> : <FileText className="h-4 w-4 text-rose-600" />}
                            <span>{exportSuccess === 'pdf' ? 'Tersimpan!' : 'PDF Laporan'}</span>
                        </button>
                    </div>
                </div>

                {/* Filter Period Tabs & Selector */}
                <div className={`mt-4 pt-4 border-t flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${isDark ? 'border-[#2A2A2A]' : isVista ? 'border-white/30' : isWinamp ? 'border-[#333333]' : 'border-slate-100'}`}>
                    {/* Mode Switcher: Bulan / 3 Bulan / Semester / Tahun */}
                    <div className={`flex items-center p-1 rounded-xl overflow-x-auto ${tabListClass} ${isWinamp ? 'rounded-none' : ''}`}>
                        <button
                            type="button"
                            onClick={() => setPeriodType('month')}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${isWinamp ? 'rounded-none' : ''} ${periodType === 'month' ? tabActiveClass : tabInactiveClass
                                }`}
                        >
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Per Bulan</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setPeriodType('quarter')}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${isWinamp ? 'rounded-none' : ''} ${periodType === 'quarter' ? tabActiveClass : tabInactiveClass
                                }`}
                        >
                            <Layers className="h-3.5 w-3.5" />
                            <span>Per 3 Bulan (Kuartal)</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setPeriodType('semester')}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${isWinamp ? 'rounded-none' : ''} ${periodType === 'semester' ? tabActiveClass : tabInactiveClass
                                }`}
                        >
                            <BarChart3 className="h-3.5 w-3.5" />
                            <span>Per Semester</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setPeriodType('year')}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${isWinamp ? 'rounded-none' : ''} ${periodType === 'year' ? tabActiveClass : tabInactiveClass
                                }`}
                        >
                            <TrendingUp className="h-3.5 w-3.5" />
                            <span>Per Tahun</span>
                        </button>
                    </div>

                    {/* Sub-selector for active period */}
                    <div className="flex items-center space-x-2 self-start lg:self-auto">
                        {/* Year Selector */}
                        <select
                            value={selectedYear}
                            onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
                            className={`rounded-xl border px-3 py-1.5 text-xs font-black focus:outline-none cursor-pointer ${selectorBoxClass} ${isWinamp ? 'rounded-none' : ''}`}
                        >
                            {availableYears.map((yr) => (
                                <option key={yr} value={yr} className={isDark || isWinamp ? 'bg-black text-white' : 'bg-white text-slate-900'}>
                                    Tahun {yr}
                                </option>
                            ))}
                        </select>

                        {/* If Per Bulan */}
                        {periodType === 'month' && (
                            <select
                                value={selectedMonth}
                                onChange={(e) => onMonthChange(parseInt(e.target.value, 10))}
                                className={`rounded-xl border px-3 py-1.5 text-xs font-black focus:outline-none cursor-pointer ${selectorBoxClass} ${isWinamp ? 'rounded-none' : ''}`}
                            >
                                {availableMonthsForSelectedYear.map((m) => (
                                    <option key={m} value={m} className={isDark || isWinamp ? 'bg-black text-white' : 'bg-white text-slate-900'}>
                                        {MONTH_NAMES[m - 1]}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* If Per Kuartal */}
                        {periodType === 'quarter' && (
                            <div className={`flex items-center space-x-1 p-1 rounded-xl border ${selectorBoxClass} ${isWinamp ? 'rounded-none' : ''}`}>
                                {[1, 2, 3, 4].map((q) => (
                                    <button
                                        key={q}
                                        type="button"
                                        onClick={() => setSelectedQuarter(q)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${isWinamp ? 'rounded-none' : ''} ${selectedQuarter === q
                                                ? isWinamp ? 'bg-[#00FF00] text-black font-black' : 'bg-indigo-600 text-white shadow-2xs'
                                                : isDark ? 'text-slate-400 hover:bg-[#333333]' : isWinamp ? 'text-[#00FF00] hover:bg-zinc-900' : 'text-slate-600 hover:bg-slate-200/60'
                                            }`}
                                    >
                                        Q{q}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* If Per Semester */}
                        {periodType === 'semester' && (
                            <div className={`flex items-center space-x-1 p-1 rounded-xl border ${selectorBoxClass} ${isWinamp ? 'rounded-none' : ''}`}>
                                <button
                                    type="button"
                                    onClick={() => setSelectedSemester(1)}
                                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${isWinamp ? 'rounded-none' : ''} ${selectedSemester === 1
                                            ? isWinamp ? 'bg-[#00FF00] text-black font-black' : 'bg-indigo-600 text-white shadow-2xs'
                                            : isDark ? 'text-slate-400 hover:bg-[#333333]' : isWinamp ? 'text-[#00FF00] hover:bg-zinc-900' : 'text-slate-600 hover:bg-slate-200/60'
                                        }`}
                                >
                                    Sem 1 (Jan-Jun)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedSemester(2)}
                                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${isWinamp ? 'rounded-none' : ''} ${selectedSemester === 2
                                            ? isWinamp ? 'bg-[#00FF00] text-black font-black' : 'bg-indigo-600 text-white shadow-2xs'
                                            : isDark ? 'text-slate-400 hover:bg-[#333333]' : isWinamp ? 'text-[#00FF00] hover:bg-zinc-900' : 'text-slate-600 hover:bg-slate-200/60'
                                        }`}
                                >
                                    Sem 2 (Jul-Des)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Key Performance Metrics Banner & Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Card 1: Nilai Rata-Rata */}
                <div className={`rounded-2xl p-4 border relative overflow-hidden flex flex-col justify-between ${avgCardClass} ${isWinamp ? 'rounded-none font-mono' : ''}`}>
                    <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${avgLabelClass}`}>
                            Rata-Rata Skala CEISA
                        </span>
                        <span className={`rounded-lg p-1.5 ${avgIconBoxClass}`}>
                            <Award className="h-4 w-4" />
                        </span>
                    </div>

                    <div className="my-2">
                        <div className="flex items-baseline space-x-1.5">
                            <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${avgValueClass}`}>
                                {currentSummary.averageScore > 0 ? currentSummary.averageScore.toFixed(2) : '0.00'}
                            </span>
                            <span className={`text-sm font-bold ${avgSubClass}`}>/ 4.00</span>
                        </div>
                        <div className="mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${isWinamp
                                    ? 'bg-black border border-[#00FF00] text-[#00FF00] rounded-none font-mono'
                                    : isDark
                                        ? currentSummary.averageScore >= 3.75
                                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60'
                                            : currentSummary.averageScore >= 3.0
                                                ? 'bg-blue-950/60 text-blue-300 border border-blue-700/60'
                                                : currentSummary.averageScore >= 2.0
                                                    ? 'bg-amber-950/60 text-amber-300 border border-amber-700/60'
                                                    : 'bg-rose-950/60 text-rose-300 border border-rose-700/60'
                                        : isVista
                                            ? currentSummary.averageScore >= 3.75
                                                ? 'bg-emerald-500/20 text-emerald-950 border border-emerald-400/40 font-black'
                                                : currentSummary.averageScore >= 3.0
                                                    ? 'bg-blue-500/20 text-blue-900 border border-blue-400/40 font-black'
                                                    : currentSummary.averageScore >= 2.0
                                                        ? 'bg-amber-500/20 text-amber-900 border border-amber-400/40 font-black'
                                                        : 'bg-rose-500/20 text-rose-900 border border-rose-400/40 font-black'
                                            : currentSummary.averageScore >= 3.75
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-black'
                                                : currentSummary.averageScore >= 3.0
                                                    ? 'bg-blue-100 text-blue-800 border border-blue-200 font-black'
                                                    : currentSummary.averageScore >= 2.0
                                                        ? 'bg-amber-100 text-amber-800 border border-amber-200 font-black'
                                                        : 'bg-rose-100 text-rose-800 border border-rose-200 font-black'
                                }`}>
                                {currentSummary.predikat}
                            </span>
                        </div>
                    </div>

                    <div className={`text-[10px] font-medium ${avgSubClass}`}>
                        {periodLabel}
                    </div>
                </div>

                {/* Card 2: Total Hari Terhitung */}
                <div className={`rounded-2xl p-4 border flex flex-col justify-between ${countCardClass} ${isWinamp ? 'rounded-none font-mono' : ''}`}>
                    <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${countLabelClass}`}>
                            Hari Terhitung Absensi
                        </span>
                        <span className={`rounded-lg p-1.5 ${countIconBoxClass} ${isWinamp ? 'rounded-none' : ''}`}>
                            <CalendarDays className="h-4 w-4" />
                        </span>
                    </div>

                    <div className="my-2">
                        <div className={`text-3xl font-black font-mono ${countValueClass}`}>
                            {currentSummary.totalDaysEvaluated} <span className={`text-sm font-bold ${countLabelClass}`}>Hari</span>
                        </div>
                        <div className={`text-[11px] font-medium mt-1 ${countSubClass}`}>
                            Akumulasi poin: <strong className="font-mono">{currentSummary.totalScore} Poin</strong>
                        </div>
                    </div>

                    <div className={`text-[10px] ${countLabelClass}`}>
                        Dari seluruh hari aktif pada periode ini
                    </div>
                </div>

                {/* Card 3: Skala Sangat Patuh (4) & Patuh (3) */}
                <div className={`rounded-2xl p-4 border flex flex-col justify-between ${patuhCardClass} ${isWinamp ? 'rounded-none font-mono' : ''}`}>
                    <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${patuhLabelClass}`}>
                            Patuh (Skala 4 & 3)
                        </span>
                        <span className={`rounded-lg p-1.5 ${isWinamp ? 'bg-black border border-[#00FF00] text-[#00FF00] rounded-none' : isDark ? 'bg-[#0d2818] border border-emerald-800/60 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                            <CheckCircle2 className="h-4 w-4" />
                        </span>
                    </div>

                    <div className="my-2 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                            <span className={isDark ? 'text-emerald-400' : isWinamp ? 'text-[#00FF00]' : 'text-emerald-700'}>Skala 4 (Sangat Patuh):</span>
                            <span className={`font-mono font-black px-2 py-0.5 rounded ${patuhPill4Class} ${isWinamp ? 'rounded-none' : ''}`}>
                                {currentSummary.countScore4}x
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold">
                            <span className={isDark ? 'text-blue-400' : isWinamp ? 'text-[#00E5FF]' : 'text-blue-700'}>Skala 3 (Patuh):</span>
                            <span className={`font-mono font-black px-2 py-0.5 rounded ${patuhPill3Class} ${isWinamp ? 'rounded-none' : ''}`}>
                                {currentSummary.countScore3}x
                            </span>
                        </div>
                    </div>

                    <div className={`w-full rounded-full h-1.5 overflow-hidden ${isDark ? 'bg-[#252525]' : isWinamp ? 'bg-zinc-900' : 'bg-slate-100'}`}>
                        <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{
                                width: `${currentSummary.totalDaysEvaluated > 0 ? ((currentSummary.countScore4 + currentSummary.countScore3) / currentSummary.totalDaysEvaluated) * 100 : 0}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Card 4: Skala Kurang Patuh (2) & Tidak Patuh (1) */}
                <div className={`rounded-2xl p-4 border flex flex-col justify-between ${nonPatuhCardClass} ${isWinamp ? 'rounded-none font-mono' : ''}`}>
                    <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${nonPatuhLabelClass}`}>
                            Kurang / Tidak Patuh (Skala 2 & 1)
                        </span>
                        <span className={`rounded-lg p-1.5 ${isWinamp ? 'bg-black border border-[#FF3366] text-[#FF3366] rounded-none' : isDark ? 'bg-[#2b1216] border border-rose-800/60 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
                            <AlertCircle className="h-4 w-4" />
                        </span>
                    </div>

                    <div className="my-2 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                            <span className={isDark ? 'text-amber-400' : isWinamp ? 'text-[#FFCC00]' : 'text-amber-700'}>Skala 2 (08:01-08:45):</span>
                            <span className={`font-mono font-black px-2 py-0.5 rounded ${nonPatuhPill2Class} ${isWinamp ? 'rounded-none' : ''}`}>
                                {currentSummary.countScore2}x
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold">
                            <span className={isDark ? 'text-rose-400' : isWinamp ? 'text-[#FF3366]' : 'text-rose-700'}>Skala 1 (&gt; 08:45):</span>
                            <span className={`font-mono font-black px-2 py-0.5 rounded ${nonPatuhPill1Class} ${isWinamp ? 'rounded-none' : ''}`}>
                                {currentSummary.countScore1}x
                            </span>
                        </div>
                    </div>

                    <div className={`w-full rounded-full h-1.5 overflow-hidden ${isDark ? 'bg-[#252525]' : isWinamp ? 'bg-zinc-900' : 'bg-slate-100'}`}>
                        <div
                            className="bg-rose-500 h-1.5 rounded-full"
                            style={{
                                width: `${currentSummary.totalDaysEvaluated > 0 ? ((currentSummary.countScore2 + currentSummary.countScore1) / currentSummary.totalDaysEvaluated) * 100 : 0}%`,
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* 3. Aturan Logika Penilaian Absen CEISA (Info Box) */}
            <div className={`rounded-2xl p-3.5 sm:p-4 border ${rulesOuterBoxClass} ${isWinamp ? 'rounded-none font-mono' : ''}`}>
                <div className="flex items-start space-x-2.5">
                    <Info className={`h-4 w-4 mt-0.5 shrink-0 ${isWinamp ? 'text-[#00FF00]' : isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    <div className="text-xs space-y-1.5 w-full">
                        <div className={`font-black ${rulesTitleClass}`}>
                            Aturan Logika Penilaian Skala Absen CEISA & Pengecualian:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 text-[11px]">
                            {/* Kotak 1: Shift Pagi (G, L, N, PM) */}
                            <div className={`rounded-xl p-2.5 border ${rulesInnerBoxClass} ${isWinamp ? 'rounded-none font-mono' : ''}`}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className={`font-black ${isDark ? 'text-teal-300' : isWinamp ? 'text-[#00FF00]' : 'text-teal-800'}`}>Shift Pagi (G, L, N, PM):</span>
                                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${isDark ? 'bg-teal-950/60 text-teal-300 border border-teal-800/60' : isWinamp ? 'bg-black text-[#00FF00] border border-[#00FF00]' : 'bg-teal-50 text-teal-700 border border-teal-200'}`}>Pagi</span>
                                </div>
                                <ul className="space-y-0.5">
                                    <li>• Jam &le; 07:30 &rarr; <strong className={isDark ? 'text-emerald-400' : isWinamp ? 'text-[#00FF00]' : 'text-emerald-700'}>Skala 4 (Sangat Patuh)</strong></li>
                                    <li>• Jam 07:31 - 08:00 &rarr; <strong className={isDark ? 'text-blue-400' : isWinamp ? 'text-[#00E5FF]' : 'text-blue-700'}>Skala 3 (Patuh)</strong></li>
                                    <li>• Jam 08:01 - 08:45 &rarr; <strong className={isDark ? 'text-amber-400' : isWinamp ? 'text-[#FFCC00]' : 'text-amber-700'}>Skala 2 (Kurang Patuh)</strong></li>
                                    <li>• Jam &gt; 08:45 &rarr; <strong className={isDark ? 'text-rose-400' : isWinamp ? 'text-[#FF3366]' : 'text-rose-700'}>Skala 1 (Tidak Patuh)</strong></li>
                                </ul>
                            </div>

                            {/* Kotak 2: Shift SM (Siang) - Kotak Khusus Sendiri */}
                            <div className={`rounded-xl p-2.5 border ${rulesInnerBoxClass} ${isWinamp ? 'rounded-none font-mono' : ''}`}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className={`font-black ${isDark ? 'text-amber-300' : isWinamp ? 'text-[#FFCC00]' : 'text-amber-800'}`}>Shift SM (Siang):</span>
                                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${isDark ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60' : isWinamp ? 'bg-black text-[#FFCC00] border border-[#FFCC00]' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>Siang</span>
                                </div>
                                <ul className="space-y-0.5">
                                    <li>• Jam &le; 13:00 &rarr; <strong className={isDark ? 'text-emerald-400' : isWinamp ? 'text-[#00FF00]' : 'text-emerald-700'}>Skala 4 (Sangat Patuh)</strong></li>
                                    <li>• Jam 13:01 - 13:15 &rarr; <strong className={isDark ? 'text-blue-400' : isWinamp ? 'text-[#00E5FF]' : 'text-blue-700'}>Skala 3 (Patuh)</strong></li>
                                    <li>• Jam 13:16 - 13:30 &rarr; <strong className={isDark ? 'text-amber-400' : isWinamp ? 'text-[#FFCC00]' : 'text-amber-700'}>Skala 2 (Kurang Patuh)</strong></li>
                                    <li>• Jam &gt; 13:30 &rarr; <strong className={isDark ? 'text-rose-400' : isWinamp ? 'text-[#FF3366]' : 'text-rose-700'}>Skala 1 (Tidak Patuh)</strong></li>
                                </ul>
                            </div>

                            {/* Kotak 3: Shift M (Malam) */}
                            <div className={`rounded-xl p-2.5 border ${rulesInnerBoxClass} ${isWinamp ? 'rounded-none font-mono' : ''}`}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className={`font-black ${isDark ? 'text-blue-300' : isWinamp ? 'text-[#00E5FF]' : 'text-blue-800'}`}>Shift M:</span>
                                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${isDark ? 'bg-blue-950/60 text-blue-300 border border-blue-800/60' : isWinamp ? 'bg-black text-[#00E5FF] border border-[#00E5FF]' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>Malam</span>
                                </div>
                                <ul className="space-y-0.5">
                                    <li>• Otomatis mendapat <strong className={isDark ? 'text-emerald-400' : isWinamp ? 'text-[#00FF00]' : 'text-emerald-700'}>Skala 4 (Sangat Patuh)</strong> (bebas jam absen CEISA)</li>
                                </ul>
                            </div>

                            {/* Kotak 4: Hold Dokumen & Pengecualian */}
                            <div className={`rounded-xl p-2.5 border ${rulesInnerBoxClass} ${isWinamp ? 'rounded-none font-mono' : ''}`}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className={`font-black ${isDark ? 'text-rose-300' : isWinamp ? 'text-[#FF3366]' : 'text-rose-800'}`}>Hold Dokumen:</span>
                                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${isDark ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60' : isWinamp ? 'bg-black text-[#FF3366] border border-[#FF3366]' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>Pengecualian</span>
                                </div>
                                <ul className="space-y-0.5">
                                    <li>• Jika <strong className={isDark ? 'text-rose-300' : isWinamp ? 'text-[#FF3366]' : 'text-rose-700'}>Hold Dokumen aktif</strong> atau <strong className={isDark ? 'text-rose-300' : isWinamp ? 'text-[#FF3366]' : 'text-rose-700'}>OFF/Cuti</strong>, hari tersebut <strong className={isDark ? 'text-rose-300' : isWinamp ? 'text-[#FF3366]' : 'text-rose-700'}>TIDAK DIHITUNG</strong> dalam penilaian & pembagi rata-rata.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Rekapitulasi Per Kuartal & Semester Grid Overview */}
            <div className={`rounded-2xl p-4 sm:p-5 border shadow-xs space-y-3 ${quarterOuterClass} ${isWinamp ? 'rounded-none font-mono' : ''}`}>
                <h2 className="text-sm sm:text-base font-black flex items-center justify-between">
                    <span>Perbandingan Performa Antar Kuartal & Semester ({selectedYear})</span>
                    <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : isWinamp ? 'text-[#00FF00]/60' : 'text-slate-400'}`}>Tahun {selectedYear}</span>
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                    {[
                        { label: 'Q1 (Jan-Mar)', data: q1Summary },
                        { label: 'Q2 (Apr-Jun)', data: q2Summary },
                        { label: 'Q3 (Jul-Sep)', data: q3Summary },
                        { label: 'Q4 (Okt-Des)', data: q4Summary },
                        { label: 'Semester 1', data: sem1Summary },
                        { label: 'Semester 2', data: sem2Summary },
                        { label: `Tahun ${selectedYear}`, data: yearSummary },
                    ].map((item, idx) => (
                        <div
                            key={item.label}
                            className={`rounded-xl p-3 border text-center transition-all ${isWinamp ? 'rounded-none font-mono' : ''} ${idx === 6
                                    ? `${quarterYearItemClass} col-span-2 sm:col-span-4 lg:col-span-1`
                                    : quarterItemClass
                                }`}
                        >
                            <div className={`text-[10px] font-extrabold uppercase truncate ${quarterItemLabelClass}`}>
                                {item.label}
                            </div>
                            <div className={`text-lg sm:text-xl font-mono font-black mt-1 ${quarterItemValClass}`}>
                                {item.data.averageScore > 0 ? item.data.averageScore.toFixed(2) : '-'}
                            </div>
                            <div className={`text-[10px] font-bold mt-0.5 truncate ${quarterItemSubClass}`}>
                                {item.data.totalDaysEvaluated} Hari
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. Detail Log Harian CEISA (Tabel Lengkap) */}
            <div className={`rounded-2xl border shadow-xs overflow-hidden ${tableCardClass} ${isWinamp ? 'rounded-none font-mono' : ''}`}>
                <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${tableHeaderBgClass}`}>
                    <div>
                        <h2 className="text-sm sm:text-base font-black">
                            Log Absen CEISA & Nilai Harian
                        </h2>
                        <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : isVista ? 'text-slate-700' : isWinamp ? 'text-[#00FF00]/70' : 'text-slate-500'}`}>
                            Daftar seluruh hari pada periode {periodLabel} (Klik kolom untuk mengurutkan)
                        </p>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        {sortConfig && (
                            <button
                                type="button"
                                onClick={() => setSortConfig(null)}
                                className={`flex items-center space-x-1 px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${isWinamp
                                        ? 'rounded-none bg-black border border-[#00FF00] text-[#00FF00] hover:bg-[#00FF00] hover:text-black font-mono'
                                        : isDark
                                            ? 'rounded-lg bg-[#252525] text-indigo-300 hover:bg-[#303030] border border-white/10'
                                            : 'rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                    }`}
                                title="Kembalikan urutan tanggal normal"
                            >
                                <RotateCcw className="h-3 w-3" />
                                <span>Reset Urutan</span>
                            </button>
                        )}
                        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${selectorBoxClass} ${isWinamp ? 'rounded-none' : ''}`}>
                            Total {dailyEntries.length} Hari
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className={`border-b font-black text-[11px] ${tableThBgClass}`}>
                                <th
                                    onClick={() => handleSort('date')}
                                    className={`py-2.5 px-3 cursor-pointer ${tableThHoverClass} transition-colors select-none group whitespace-nowrap`}
                                    title="Klik untuk mengurutkan berdasarkan Tanggal"
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Tanggal</span>
                                        {renderSortIndicator('date')}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('dayName')}
                                    className={`py-2.5 px-3 cursor-pointer ${tableThHoverClass} transition-colors select-none group whitespace-nowrap`}
                                    title="Klik untuk mengurutkan berdasarkan Hari"
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Hari</span>
                                        {renderSortIndicator('dayName')}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('shift')}
                                    className={`py-2.5 px-3 text-center cursor-pointer ${tableThHoverClass} transition-colors select-none group whitespace-nowrap`}
                                    title="Klik untuk mengurutkan berdasarkan Shift"
                                >
                                    <div className="flex items-center justify-center space-x-1">
                                        <span>Shift</span>
                                        {renderSortIndicator('shift')}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('status')}
                                    className={`py-2.5 px-3 text-center cursor-pointer ${tableThHoverClass} transition-colors select-none group whitespace-nowrap`}
                                    title="Klik untuk mengurutkan berdasarkan Status Kehadiran"
                                >
                                    <div className="flex items-center justify-center space-x-1">
                                        <span>Status</span>
                                        {renderSortIndicator('status')}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('absenCeisa')}
                                    className={`py-2.5 px-3 text-center cursor-pointer ${tableThHoverClass} transition-colors select-none group whitespace-nowrap`}
                                    title="Klik untuk mengurutkan berdasarkan Absen CEISA"
                                >
                                    <div className="flex items-center justify-center space-x-1">
                                        <span>Absen CEISA</span>
                                        {renderSortIndicator('absenCeisa')}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('score')}
                                    className={`py-2.5 px-3 text-center cursor-pointer ${tableThHoverClass} transition-colors select-none group whitespace-nowrap`}
                                    title="Klik untuk mengurutkan berdasarkan Nilai Skala (1 - 4)"
                                >
                                    <div className="flex items-center justify-center space-x-1">
                                        <span>Nilai Skala</span>
                                        {renderSortIndicator('score')}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('category')}
                                    className={`py-2.5 px-3 cursor-pointer ${tableThHoverClass} transition-colors select-none group whitespace-nowrap`}
                                    title="Klik untuk mengurutkan berdasarkan Kategori Kepatuhan"
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Kategori</span>
                                        {renderSortIndicator('category')}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('ruleDescription')}
                                    className={`py-2.5 px-3 cursor-pointer ${tableThHoverClass} transition-colors select-none group whitespace-nowrap`}
                                    title="Klik untuk mengurutkan berdasarkan Evaluasi / Aturan"
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Evaluasi / Aturan</span>
                                        {renderSortIndicator('ruleDescription')}
                                    </div>
                                </th>
                                <th
                                    onClick={() => handleSort('note')}
                                    className={`py-2.5 px-3 cursor-pointer ${tableThHoverClass} transition-colors select-none group whitespace-nowrap`}
                                    title="Klik untuk mengurutkan berdasarkan Catatan"
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Catatan</span>
                                        {renderSortIndicator('note')}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${tableRowBorderClass}`}>
                            {sortedDailyEntries.map((row) => {
                                const isHoliday = row.holidayName !== null || row.isManualHoliday;
                                return (
                                    <tr
                                        key={row.dateKey}
                                        className={`transition-colors ${isDark
                                                ? isHoliday ? 'bg-rose-950/30 hover:bg-rose-900/40' : 'hover:bg-[#252525]'
                                                : isWinamp
                                                    ? isHoliday ? 'bg-zinc-900 hover:bg-zinc-800' : 'hover:bg-zinc-900'
                                                    : isVista
                                                        ? isHoliday ? 'bg-rose-500/15 hover:bg-rose-500/25' : 'hover:bg-white/30'
                                                        : isHoliday ? 'bg-rose-50/20 hover:bg-rose-50/40' : 'hover:bg-slate-50/80'
                                            }`}
                                    >
                                        <td className={`py-2 px-3 font-mono font-bold whitespace-nowrap ${isDark ? 'text-slate-200' : isWinamp ? 'text-[#00FF00]' : 'text-slate-800'}`}>
                                            {row.dateStr}
                                        </td>
                                        <td className={`py-2 px-3 font-semibold whitespace-nowrap ${isDark ? 'text-slate-300' : isWinamp ? 'text-[#00FF00]' : 'text-slate-700'}`}>
                                            {row.dayName}
                                            {row.holidayName && (
                                                <span className={`ml-1.5 text-[10px] font-bold block sm:inline ${isDark || isWinamp ? 'text-rose-400' : 'text-rose-700'}`}>
                                                    🚩 {row.holidayName}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2 px-3 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded font-black text-[10px] font-mono ${isWinamp
                                                    ? 'bg-black border border-[#00FF00] text-[#00FF00] rounded-none'
                                                    : isDark
                                                        ? 'bg-[#252525] border border-[#383838] text-slate-200'
                                                        : isVista
                                                            ? 'bg-slate-800/80 text-white'
                                                            : 'bg-slate-800 text-white'
                                                }`}>
                                                {row.shift}
                                            </span>
                                        </td>
                                        <td className="py-2 px-3 text-center whitespace-nowrap">
                                            {row.isHoldDokumen ? (
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-black ${isWinamp
                                                        ? 'bg-black border border-[#FFCC00] text-[#FFCC00] rounded-none font-mono'
                                                        : isDark
                                                            ? 'bg-[#2a2010] text-amber-300 border border-amber-700/60'
                                                            : isVista
                                                                ? 'bg-amber-500/25 text-amber-950 border border-amber-400/40'
                                                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                                                    }`}>
                                                    Hold Dokumen
                                                </span>
                                            ) : (
                                                <span
                                                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${isWinamp
                                                            ? row.isMasuk
                                                                ? 'bg-black text-[#00FF00] border border-[#00FF00] rounded-none font-mono'
                                                                : 'bg-black text-[#888888] border border-[#555555] rounded-none font-mono'
                                                            : isDark
                                                                ? row.isMasuk
                                                                    ? 'bg-[#0d2818] text-emerald-300 border border-emerald-700/60'
                                                                    : 'bg-[#252525] text-slate-400 border border-[#383838]'
                                                                : isVista
                                                                    ? row.isMasuk
                                                                        ? 'bg-emerald-500/20 text-emerald-950 border border-emerald-400/40'
                                                                        : 'bg-white/40 text-slate-600'
                                                                    : row.isMasuk
                                                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                                        : 'bg-slate-100 text-slate-500'
                                                        }`}
                                                >
                                                    {row.isMasuk ? 'Masuk' : 'Off'}
                                                </span>
                                            )}
                                        </td>
                                        <td className={`py-2 px-3 text-center font-mono font-bold whitespace-nowrap ${isDark ? 'text-slate-100' : isWinamp ? 'text-[#00FF00]' : 'text-slate-900'
                                            }`}>
                                            {row.absenCeisa || (
                                                <span className={isDark ? 'text-slate-600 font-normal' : isWinamp ? 'text-[#555555] font-normal' : 'text-slate-300 font-normal'}>--:--</span>
                                            )}
                                        </td>
                                        <td className="py-2 px-3 text-center whitespace-nowrap">
                                            {row.isHoldDokumen ? (
                                                <span className={`${isWinamp ? 'text-[#FFCC00]' : 'text-amber-500'} font-mono text-xs font-bold`} title="Tidak Masuk Penilaian">-</span>
                                            ) : row.scoreResult.isEligible ? (
                                                <span
                                                    className={`inline-flex items-center justify-center h-6 w-6 rounded-full font-mono text-xs font-black shadow-2xs ${isWinamp ? 'rounded-none border' : ''
                                                        } ${row.scoreResult.score === 4
                                                            ? isWinamp ? 'bg-black border-[#00FF00] text-[#00FF00]' : 'bg-emerald-600 text-white'
                                                            : row.scoreResult.score === 3
                                                                ? isWinamp ? 'bg-black border-[#00E5FF] text-[#00E5FF]' : 'bg-blue-600 text-white'
                                                                : row.scoreResult.score === 2
                                                                    ? isWinamp ? 'bg-black border-[#FFCC00] text-[#FFCC00]' : 'bg-amber-500 text-slate-950 font-black'
                                                                    : isWinamp ? 'bg-black border-[#FF3366] text-[#FF3366]' : 'bg-rose-600 text-white'
                                                        }`}
                                                >
                                                    {row.scoreResult.score}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 font-mono text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="py-2 px-3 font-bold whitespace-nowrap">
                                            {row.isHoldDokumen ? (
                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${isWinamp
                                                        ? 'bg-black border border-[#FFCC00] text-[#FFCC00] rounded-none font-mono'
                                                        : isDark
                                                            ? 'bg-[#2a2010] text-amber-300 border border-amber-700/60'
                                                            : isVista
                                                                ? 'bg-amber-500/25 text-amber-950 border border-amber-400/40'
                                                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                                                    }`}>
                                                    Hold Dokumen
                                                </span>
                                            ) : (
                                                <span
                                                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${isWinamp
                                                            ? row.scoreResult.score === 4
                                                                ? 'bg-black text-[#00FF00] border border-[#00FF00] rounded-none font-mono'
                                                                : row.scoreResult.score === 3
                                                                    ? 'bg-black text-[#00E5FF] border border-[#00E5FF] rounded-none font-mono'
                                                                    : row.scoreResult.score === 2
                                                                        ? 'bg-black text-[#FFCC00] border border-[#FFCC00] rounded-none font-mono'
                                                                        : row.scoreResult.score === 1
                                                                            ? 'bg-black text-[#FF3366] border border-[#FF3366] rounded-none font-mono'
                                                                            : 'text-zinc-600'
                                                            : isDark
                                                                ? row.scoreResult.score === 4
                                                                    ? 'bg-[#0d2818] text-emerald-300 border border-emerald-700/60'
                                                                    : row.scoreResult.score === 3
                                                                        ? 'bg-[#131b2e] text-blue-300 border border-blue-700/60'
                                                                        : row.scoreResult.score === 2
                                                                            ? 'bg-[#2a2010] text-amber-300 border border-amber-700/60'
                                                                            : row.scoreResult.score === 1
                                                                                ? 'bg-[#2b1216] text-rose-300 border border-rose-700/60'
                                                                                : 'text-slate-600'
                                                                : row.scoreResult.score === 4
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : row.scoreResult.score === 3
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : row.scoreResult.score === 2
                                                                            ? 'bg-amber-100 text-amber-900'
                                                                            : row.scoreResult.score === 1
                                                                                ? 'bg-rose-100 text-rose-800'
                                                                                : 'text-slate-400'
                                                        }`}
                                                >
                                                    {row.scoreResult.grade}
                                                </span>
                                            )}
                                        </td>
                                        <td className={`py-2 px-3 text-[11px] ${row.isHoldDokumen
                                                ? isWinamp ? 'font-black text-[#FFCC00]' : isDark ? 'font-black text-amber-400' : 'font-black text-amber-800'
                                                : isWinamp ? 'text-[#00FF00]/80 font-medium' : isDark ? 'text-slate-300 font-medium' : 'text-slate-600 font-medium'
                                            }`}>
                                            {row.scoreResult.ruleDescription}
                                        </td>
                                        <td className={`py-2 px-3 text-[11px] max-w-xs truncate ${isWinamp ? 'text-[#00FF00]/50' : isDark ? 'text-slate-400' : 'text-slate-500'
                                            }`}>
                                            {row.note || '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
