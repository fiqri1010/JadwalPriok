import React, { useState, useMemo } from 'react';
import {
    Calendar as CalendarIcon,
    Clock,
    Lock,
    Unlock,
    Coffee,
    Building2,
    Container,
    Ship,
    Palmtree,
    Flag,
    CheckCircle2,
    AlertCircle,
    FileText,
    ChevronRight,
    Edit3,
    Filter,
    Sparkles,
    Briefcase
} from 'lucide-react';
import { DayData, LiburNasional, AppTheme, SHIFT_COLORS, normalizeShift, isPiketShift } from '../types';
import { PiketCalculationResult } from '../utils/piket';
import { ShiftDropdown } from './ShiftDropdown';
import { Tooltip } from './Tooltip';

interface CalendarListViewProps {
    selectedYear: number;
    selectedMonth: number;
    daysState: Record<string, DayData>;
    holidayMap: Map<string, LiburNasional>;
    currentTheme: AppTheme;
    piketCalculation: PiketCalculationResult;
    onUpdateDay: (dateKey: string, partial: Partial<DayData>) => void;
    onOpenDetail: (dayNum: number) => void;
    onRequestTimePick: (field: 'jamMasuk' | 'jamPulang' | 'absenCeisa', title: string, currentValue: string, dateKey: string) => void;
}

const INDONESIAN_DAYS_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const INDONESIAN_MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const CalendarListView: React.FC<CalendarListViewProps> = ({
    selectedYear,
    selectedMonth,
    daysState,
    holidayMap,
    currentTheme,
    piketCalculation,
    onUpdateDay,
    onOpenDetail,
    onRequestTimePick,
}) => {
    const isIndustrial = currentTheme === 'industrial';
    const isPaperSketch = currentTheme === 'paperSketch';
    const isTechnical = currentTheme === 'technical';
    const isEditorial = currentTheme === 'editorial';
    const isDashboard = currentTheme === 'dashboard';
    const isVista = currentTheme === 'vista';
    const isWinamp = currentTheme === 'winamp';
    const isDark = currentTheme === 'dark';

    const [filterCategory, setFilterCategory] = useState<'all' | 'piket' | 'off' | 'cuti'>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const daysInMonth = useMemo(() => {
        return new Date(selectedYear, selectedMonth, 0).getDate();
    }, [selectedYear, selectedMonth]);

    const daysList = useMemo(() => {
        const list = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const dateKey = `${selectedYear}-${selectedMonth}-${d}`;
            const dayData = daysState[dateKey] || {
                shift: '',
                isLocked: true,
                note: '',
                isMasuk: false,
                jamMasuk: '',
                jamPulang: '',
                absenCeisa: '',
                isManualHoliday: false,
            };

            const paddedD = String(d).padStart(2, '0');
            const paddedM = String(selectedMonth).padStart(2, '0');
            const isoDate = `${selectedYear}-${paddedM}-${paddedD}`;
            const holiday = holidayMap.get(isoDate) || holidayMap.get(dateKey);

            const dayOfWeek = new Date(selectedYear, selectedMonth - 1, d).getDay();
            const dayName = INDONESIAN_DAYS_FULL[dayOfWeek];
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            const isPiket = isPiketShift(dayData.shift, isWeekend || Boolean(holiday)) || Boolean(dayData.isMasuk);
            const isOff = dayData.shift?.toUpperCase().includes('OFF');
            const isCuti = dayData.shift?.toUpperCase().includes('CUTI') || dayData.shift?.toUpperCase() === 'CT' || dayData.shift?.toUpperCase() === 'C';

            list.push({
                dayNumber: d,
                dateKey,
                dayData,
                holiday,
                dayOfWeek,
                dayName,
                isWeekend,
                isPiket,
                isOff,
                isCuti,
            });
        }
        return list;
    }, [selectedYear, selectedMonth, daysInMonth, daysState, holidayMap]);

    // Filtered list
    const filteredDays = useMemo(() => {
        return daysList.filter((item) => {
            if (filterCategory === 'piket' && !item.isPiket) return false;
            if (filterCategory === 'off' && !item.isOff) return false;
            if (filterCategory === 'cuti' && !item.isCuti) return false;

            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchDay = item.dayNumber.toString().includes(query);
                const matchName = item.dayName.toLowerCase().includes(query);
                const matchShift = (item.dayData.shift || '').toLowerCase().includes(query);
                const matchHoliday = (item.holiday?.keterangan || '').toLowerCase().includes(query);
                const matchNote = (item.dayData.note || '').toLowerCase().includes(query);
                return matchDay || matchName || matchShift || matchHoliday || matchNote;
            }

            return true;
        });
    }, [daysList, filterCategory, searchQuery]);

    // Statistics count
    const stats = useMemo(() => {
        let piketCount = 0;
        let offCount = 0;
        let cutiCount = 0;
        let ceisaCount = 0;

        daysList.forEach((item) => {
            if (item.isPiket) piketCount++;
            if (item.isOff) offCount++;
            if (item.isCuti) cutiCount++;
            if (item.dayData.absenCeisa) ceisaCount++;
        });

        return { piketCount, offCount, cutiCount, ceisaCount, totalDays: daysList.length };
    }, [daysList]);

    const getShiftIcon = (shiftText: string) => {
        const normalized = normalizeShift(shiftText);
        if (normalized.includes('GRAHA')) return <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
        if (normalized.includes('NPCT')) return <Container className="w-3.5 h-3.5 text-teal-400 shrink-0" />;
        if (normalized.includes('TPSL') || normalized.includes('DERMAGA')) return <Ship className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
        if (normalized.includes('OFF')) return <Coffee className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
        if (normalized.includes('CUTI')) return <Palmtree className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
        return <Briefcase className="w-3.5 h-3.5 opacity-60 shrink-0" />;
    };

    return (
        <div className="w-full space-y-2.5 animate-in fade-in duration-200">
            {/* Header Mini Filter & Quick Summary */}
            <div className={`p-2 sm:p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 select-none ${
                isIndustrial
                    ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.12)] text-[#E2E8F0]'
                    : isPaperSketch
                    ? 'bg-white border-2 border-[#2b2b2b] text-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                    : isTechnical
                    ? 'bg-[#FFFFFF] dark:bg-[#0D1117] border-[1.5px] border-[#111113] dark:border-slate-700 text-[#111113] dark:text-slate-100 font-[\'JetBrains_Mono\']'
                    : isEditorial
                    ? 'bg-white border border-[#1a1a1a]/20 text-[#1a1a1a]'
                    : isDashboard
                    ? 'bg-[#FFF5D0] border border-[#4D2A00]/30 text-[#4D2A00]'
                    : isWinamp
                    ? 'bg-black border border-[#00FF00] text-[#00FF00] font-mono'
                    : isDark
                    ? 'bg-[#1E1E1E] border-slate-800 text-slate-100'
                    : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
            }`}>
                {/* Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase opacity-60 mr-1 shrink-0 flex items-center gap-1">
                        <Filter className="w-3 h-3" />
                        <span>Filter:</span>
                    </span>

                    <button
                        type="button"
                        onClick={() => setFilterCategory('all')}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded font-mono uppercase tracking-tight transition-all cursor-pointer shrink-0 border ${
                            filterCategory === 'all'
                                ? isIndustrial
                                    ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border-[#2DD4BF]/50'
                                    : 'bg-teal-500 text-white border-teal-600'
                                : 'opacity-70 hover:opacity-100 border-transparent hover:border-current/20'
                        }`}
                    >
                        Semua ({stats.totalDays})
                    </button>

                    <button
                        type="button"
                        onClick={() => setFilterCategory('piket')}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded font-mono uppercase tracking-tight transition-all cursor-pointer shrink-0 border ${
                            filterCategory === 'piket'
                                ? 'bg-blue-500/20 text-blue-500 dark:text-blue-400 border-blue-500/50'
                                : 'opacity-70 hover:opacity-100 border-transparent hover:border-current/20'
                        }`}
                    >
                        Piket ({stats.piketCount})
                    </button>

                    <button
                        type="button"
                        onClick={() => setFilterCategory('off')}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded font-mono uppercase tracking-tight transition-all cursor-pointer shrink-0 border ${
                            filterCategory === 'off'
                                ? 'bg-rose-500/20 text-rose-500 dark:text-rose-400 border-rose-500/50'
                                : 'opacity-70 hover:opacity-100 border-transparent hover:border-current/20'
                        }`}
                    >
                        Off ({stats.offCount})
                    </button>

                    <button
                        type="button"
                        onClick={() => setFilterCategory('cuti')}
                        className={`px-2 py-0.5 text-[11px] font-bold rounded font-mono uppercase tracking-tight transition-all cursor-pointer shrink-0 border ${
                            filterCategory === 'cuti'
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/50'
                                : 'opacity-70 hover:opacity-100 border-transparent hover:border-current/20'
                        }`}
                    >
                        CUTI ({stats.cutiCount})
                    </button>
                </div>

                {/* Search Box */}
                <div className="relative min-w-[140px] sm:w-48 shrink-0">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari shift / libur / catatan..."
                        className={`w-full px-2 py-1 text-xs rounded border transition-all focus:outline-none focus:ring-1 ${
                            isIndustrial
                                ? 'bg-[#0F1115] border-[rgba(226,232,240,0.18)] text-[#E2E8F0] focus:ring-[#2DD4BF]/40 focus:border-[#2DD4BF]'
                                : isPaperSketch
                                ? 'bg-white border-2 border-[#2b2b2b] text-[#2b2b2b]'
                                : isTechnical
                                ? 'bg-[#F8F7F4] dark:bg-[#0D1117] border-[#111113] dark:border-slate-700 text-[#111113] dark:text-slate-100'
                                : isWinamp
                                ? 'bg-black border border-[#00FF00] text-[#00FF00]'
                                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                        }`}
                    />
                </div>
            </div>

            {/* List Table / Cards Container */}
            <div className={`rounded-lg border overflow-hidden ${
                isIndustrial
                    ? 'bg-[#14171C]/90 border-[rgba(226,232,240,0.12)] divide-y divide-[rgba(226,232,240,0.06)]'
                    : isPaperSketch
                    ? 'bg-white border-2 border-[#2b2b2b] divide-y-2 divide-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
                    : isTechnical
                    ? 'bg-[#FFFFFF] dark:bg-[#0D1117] border-[1.5px] border-[#111113] dark:border-slate-700 divide-y divide-[#111113]/10 dark:divide-slate-800'
                    : isEditorial
                    ? 'bg-white border border-[#1a1a1a]/20 divide-y divide-[#1a1a1a]/10'
                    : isDashboard
                    ? 'bg-[#FFF4CE] border border-[#4D2A00]/30 divide-y divide-[#4D2A00]/15'
                    : isWinamp
                    ? 'bg-black border border-[#00FF00] divide-y divide-[#00FF00]/30'
                    : isDark
                    ? 'bg-[#181818] border-slate-800 divide-y divide-slate-800'
                    : 'bg-white border-slate-200 divide-y divide-slate-100 shadow-2xs'
            }`}>
                {filteredDays.length === 0 ? (
                    <div className="p-8 text-center opacity-60 font-mono text-xs">
                        Tidak ada data yang sesuai dengan filter/pencarian Anda.
                    </div>
                ) : (
                    filteredDays.map((item) => {
                        const { dayNumber, dateKey, dayData, holiday, dayName, isWeekend, isPiket, isOff, isCuti } = item;
                        const isLocked = dayData.isLocked ?? true;
                        const hasPresensi = Boolean(dayData.jamMasuk || dayData.jamPulang);
                        const hasCeisa = Boolean(dayData.absenCeisa);
                        const hasNote = Boolean(dayData.note && dayData.note.trim());

                        return (
                            <div
                                key={dateKey}
                                className={`p-2 sm:p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 transition-colors ${
                                    isWeekend
                                        ? isIndustrial
                                            ? 'bg-rose-500/[0.03] hover:bg-rose-500/[0.07]'
                                            : 'bg-rose-50/30 dark:bg-rose-950/10 hover:bg-rose-50/60'
                                        : isIndustrial
                                        ? 'hover:bg-white/[0.03]'
                                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/30'
                                }`}
                            >
                                {/* Left Section: Date & Day Badge */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <Tooltip content={holiday ? <span>{dayName}, {dayNumber} {INDONESIAN_MONTH_NAMES[selectedMonth - 1]}: <strong>{holiday.keterangan}</strong></span> : <span>{dayName}, {dayNumber} {INDONESIAN_MONTH_NAMES[selectedMonth - 1]}</span>}>
                                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex flex-col items-center justify-center font-bold shrink-0 border relative ${
                                            isWeekend
                                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                                : isIndustrial
                                                ? 'bg-[#0F1115] text-[#E2E8F0] border-[rgba(226,232,240,0.15)]'
                                                : isPaperSketch
                                                ? 'bg-white text-[#2b2b2b] border-2 border-[#2b2b2b]'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700'
                                        }`}>
                                            <span className="text-xs sm:text-sm font-black leading-none">{dayNumber}</span>
                                            <span className="text-[8px] sm:text-[9px] font-mono uppercase opacity-75 mt-0.5 leading-none">
                                                {dayName.slice(0, 3)}
                                            </span>
                                            {holiday && (
                                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-white dark:border-slate-900" title={holiday.keterangan} />
                                            )}
                                        </div>
                                    </Tooltip>
                                </div>

                                {/* Middle Section: Shift & Presensi & CEISA Badges */}
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                                    {/* Shift Dropdown / Badge */}
                                    <div className="shrink-0">
                                        <ShiftDropdown
                                            value={dayData.shift || ''}
                                            onChange={(newShift) => onUpdateDay(dateKey, { shift: newShift })}
                                            disabled={isLocked}
                                            theme={currentTheme}
                                            compact={true}
                                        />
                                    </div>

                                    {/* Jam Masuk / Jam Pulang Presensi */}
                                    <button
                                        type="button"
                                        onClick={() => onRequestTimePick('jamMasuk', `Presensi ${dayNumber} ${INDONESIAN_MONTH_NAMES[selectedMonth - 1]}`, dayData.jamMasuk || '', dateKey)}
                                        className={`px-2 py-1 rounded text-[10px] sm:text-[11px] font-mono font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                                            hasPresensi
                                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/20'
                                                : 'opacity-50 hover:opacity-80 border-dashed border-current/25'
                                        }`}
                                        title="Klik untuk ubah jam presensi"
                                    >
                                        <Clock className="w-3 h-3 shrink-0" />
                                        <span>
                                            {dayData.jamMasuk || '--:--'} - {dayData.jamPulang || '--:--'}
                                        </span>
                                    </button>

                                    {/* Absen CEISA */}
                                    <button
                                        type="button"
                                        onClick={() => onRequestTimePick('absenCeisa', `Absen CEISA ${dayNumber} ${INDONESIAN_MONTH_NAMES[selectedMonth - 1]}`, dayData.absenCeisa || '', dateKey)}
                                        className={`px-2 py-1 rounded text-[10px] sm:text-[11px] font-mono font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                                            hasCeisa
                                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                                                : 'opacity-40 hover:opacity-75 border-dashed border-current/25'
                                        }`}
                                        title="Klik untuk ubah waktu Absen CEISA"
                                    >
                                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                                        <span>CEISA: {dayData.absenCeisa || 'Belum'}</span>
                                    </button>

                                    {/* Catatan / Note badge */}
                                    {hasNote && (
                                        <div className="px-2 py-1 rounded text-[10px] font-mono flex items-center gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 max-w-[200px] truncate" title={dayData.note}>
                                            <FileText className="w-3 h-3 shrink-0 text-amber-500" />
                                            <span className="truncate">{dayData.note}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Right Section: Quick Action Buttons (Lock Toggle & Detail Modal) */}
                                <div className="flex items-center gap-1 shrink-0 self-end md:self-center">
                                    {/* Lock Toggle */}
                                    <Tooltip content={<span>{isLocked ? 'Buka Kunci Hari Ini' : 'Kunci Hari Ini'}</span>}>
                                        <button
                                            type="button"
                                            onClick={() => onUpdateDay(dateKey, { isLocked: !isLocked })}
                                            className={`p-1.5 rounded transition-all cursor-pointer border ${
                                                isLocked
                                                    ? 'opacity-60 hover:opacity-100 border-transparent hover:border-current/20'
                                                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                            }`}
                                            title={isLocked ? 'Terkunci' : 'Terbuka'}
                                        >
                                            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                        </button>
                                    </Tooltip>

                                    {/* Detail Modal Button */}
                                    <button
                                        type="button"
                                        onClick={() => onOpenDetail(dayNumber)}
                                        className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                                            isIndustrial
                                                ? 'bg-[#2DD4BF]/15 text-[#2DD4BF] border-[#2DD4BF]/30 hover:bg-[#2DD4BF]/25'
                                                : isPaperSketch
                                                ? 'bg-white border-2 border-[#2b2b2b] shadow-[1px_1px_0px_#2b2b2b] hover:bg-slate-100'
                                                : isTechnical
                                                ? 'bg-[#111113] text-[#F8F7F4] hover:bg-[#222]'
                                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        <Edit3 className="w-3 h-3" />
                                        <span>Detail</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
