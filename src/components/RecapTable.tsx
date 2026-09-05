import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Calendar, 
  Clock, 
  FileSpreadsheet, 
  ShieldCheck, 
  Timer,
  Award,
  Zap,
  Palmtree,
  X,
  ChevronRight,
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';
import { DayData, SHIFT_COLORS, normalizeShift, AppTheme } from '../types';
import { calculateDayResult, calculateMonthSummary } from '../lib/calculator';

interface RecapTableProps {
  selectedMonth: number;
  selectedYear: number;
  monthName: string;
  daysState: Record<string, DayData>;
  theme?: AppTheme;
  onBackToCalendar?: () => void;
  onOpenExport: () => void;
}

export const RecapTable: React.FC<RecapTableProps> = ({
  selectedMonth,
  selectedYear,
  monthName,
  daysState,
  theme = 'default',
  onOpenExport,
}) => {
  const [activePopout, setActivePopout] = useState<'lembur' | 'piket' | 'st' | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const isDark = theme === 'dark';
  const isVista = theme === 'vista';
  const isWinamp = theme === 'winamp';

  // 1. Kotak Total Lembur Card
  let lemburCardClass = 'bg-emerald-50 border-emerald-200 hover:border-emerald-400 text-emerald-950';
  let lemburTitleClass = 'text-emerald-800';
  let lemburChevronClass = 'text-emerald-600';
  let lemburHoursClass = 'text-emerald-950';
  let lemburSubtextClass = 'text-emerald-700';

  // 2. Kotak Jam Kerja Biasa Card
  let jamKerjaCardClass = 'bg-[#EDF6F9] border-[#83C5BE] text-[#011627]';
  let jamKerjaTitleClass = 'text-[#006D77]';
  let jamKerjaHoursClass = 'text-[#011627]';
  let jamKerjaSubtextClass = 'text-[#006D77]/80';

  // 3. Kotak Total Piket & OFF Card
  let piketCardClass = 'bg-[#E2F3FC] border-[#2EC4B6]/40 hover:border-[#2EC4B6] text-[#011627]';
  let piketTitleClass = 'text-[#20A4F3]';
  let piketChevronClass = 'text-[#20A4F3]';
  let piketHoursClass = 'text-[#011627]';
  let piketSubtextClass = 'text-[#006D77]';

  // 4. Kotak Surat Tugas (ST) Card
  let stCardClass = 'bg-purple-50 border-purple-200 hover:border-purple-400 text-purple-950';
  let stTitleClass = 'text-purple-800';
  let stChevronClass = 'text-purple-600';
  let stHoursClass = 'text-purple-950';
  let stSubtextClass = 'text-purple-700';

  // Table & General Container
  let tableCardClass = 'bg-white border-slate-200 text-slate-900';
  let tableHeaderBgClass = 'bg-slate-50 border-slate-200 text-slate-700';
  let tableThBgClass = 'bg-slate-100/90 border-slate-200 text-slate-700';
  let tableRowBorderClass = 'border-slate-100';
  let tableFooterBgClass = 'bg-slate-50 border-slate-300 font-black';

  if (isDark) {
    lemburCardClass = 'bg-[#0d2818] border-emerald-800/80 hover:border-emerald-500 text-emerald-100 shadow-md';
    lemburTitleClass = 'text-emerald-400';
    lemburChevronClass = 'text-emerald-400';
    lemburHoursClass = 'text-emerald-200';
    lemburSubtextClass = 'text-emerald-400/80';

    jamKerjaCardClass = 'bg-[#131b2e] border-indigo-800/80 text-indigo-100 shadow-md';
    jamKerjaTitleClass = 'text-indigo-300';
    jamKerjaHoursClass = 'text-indigo-200';
    jamKerjaSubtextClass = 'text-indigo-400/80';

    piketCardClass = 'bg-[#0f2327] border-teal-800/80 hover:border-teal-500 text-teal-100 shadow-md';
    piketTitleClass = 'text-teal-300';
    piketChevronClass = 'text-teal-400';
    piketHoursClass = 'text-teal-200';
    piketSubtextClass = 'text-teal-400/80';

    stCardClass = 'bg-[#241432] border-purple-800/80 hover:border-purple-500 text-purple-100 shadow-md';
    stTitleClass = 'text-purple-300';
    stChevronClass = 'text-purple-400';
    stHoursClass = 'text-purple-200';
    stSubtextClass = 'text-purple-400/80';

    tableCardClass = 'bg-[#181818] border-[#333333] text-slate-200 shadow-lg';
    tableHeaderBgClass = 'bg-[#202020] border-[#333333] text-slate-300';
    tableThBgClass = 'bg-[#1E1E1E] border-[#333333] text-slate-300';
    tableRowBorderClass = 'border-[#2A2A2A]';
    tableFooterBgClass = 'bg-[#202020] border-[#333333] font-black text-slate-100';
  } else if (isVista) {
    lemburCardClass = 'bg-gradient-to-b from-emerald-500/25 to-emerald-900/40 backdrop-blur-md border-white/50 hover:border-white/80 text-white shadow-[0_4px_16px_rgba(16,185,129,0.25)]';
    lemburTitleClass = 'text-emerald-200';
    lemburChevronClass = 'text-emerald-200';
    lemburHoursClass = 'text-white drop-shadow-xs';
    lemburSubtextClass = 'text-emerald-100/90';

    jamKerjaCardClass = 'bg-gradient-to-b from-sky-500/25 to-blue-900/40 backdrop-blur-md border-white/50 text-white shadow-[0_4px_16px_rgba(56,189,248,0.25)]';
    jamKerjaTitleClass = 'text-sky-200';
    jamKerjaHoursClass = 'text-white drop-shadow-xs';
    jamKerjaSubtextClass = 'text-sky-100/90';

    piketCardClass = 'bg-gradient-to-b from-teal-500/25 to-teal-900/40 backdrop-blur-md border-white/50 hover:border-white/80 text-white shadow-[0_4px_16px_rgba(45,212,191,0.25)]';
    piketTitleClass = 'text-teal-200';
    piketChevronClass = 'text-teal-200';
    piketHoursClass = 'text-white drop-shadow-xs';
    piketSubtextClass = 'text-teal-100/90';

    stCardClass = 'bg-gradient-to-b from-purple-500/25 to-purple-900/40 backdrop-blur-md border-white/50 hover:border-white/80 text-white shadow-[0_4px_16px_rgba(168,85,247,0.25)]';
    stTitleClass = 'text-purple-200';
    stChevronClass = 'text-purple-200';
    stHoursClass = 'text-white drop-shadow-xs';
    stSubtextClass = 'text-purple-100/90';

    tableCardClass = 'bg-white/40 backdrop-blur-md border-white/60 text-[#0F172A] shadow-[0_8px_30px_rgb(0,0,0,0.12)]';
    tableHeaderBgClass = 'bg-white/50 backdrop-blur-xs border-white/50 text-slate-800';
    tableThBgClass = 'bg-white/60 border-white/50 text-slate-900';
    tableRowBorderClass = 'border-white/40';
    tableFooterBgClass = 'bg-white/70 border-white/60 font-black text-slate-900';
  } else if (isWinamp) {
    lemburCardClass = 'bg-black border-2 border-[#00FF00] hover:border-white text-[#00FF00] font-mono rounded-none shadow-[0_0_8px_rgba(0,255,0,0.3)]';
    lemburTitleClass = 'text-[#00FF00]';
    lemburChevronClass = 'text-[#00FF00]';
    lemburHoursClass = 'text-[#00FF00]';
    lemburSubtextClass = 'text-[#00FF00]/80';

    jamKerjaCardClass = 'bg-black border-2 border-[#00E5FF] text-[#00E5FF] font-mono rounded-none shadow-[0_0_8px_rgba(0,229,255,0.3)]';
    jamKerjaTitleClass = 'text-[#00E5FF]';
    jamKerjaHoursClass = 'text-[#00E5FF]';
    jamKerjaSubtextClass = 'text-[#00E5FF]/80';

    piketCardClass = 'bg-black border-2 border-[#FFCC00] hover:border-white text-[#FFCC00] font-mono rounded-none shadow-[0_0_8px_rgba(255,204,0,0.3)]';
    piketTitleClass = 'text-[#FFCC00]';
    piketChevronClass = 'text-[#FFCC00]';
    piketHoursClass = 'text-[#FFCC00]';
    piketSubtextClass = 'text-[#FFCC00]/80';

    stCardClass = 'bg-black border-2 border-[#FF0055] hover:border-white text-[#FF0055] font-mono rounded-none shadow-[0_0_8px_rgba(255,0,85,0.3)]';
    stTitleClass = 'text-[#FF0055]';
    stChevronClass = 'text-[#FF0055]';
    stHoursClass = 'text-[#FF0055]';
    stSubtextClass = 'text-[#FF0055]/80';

    tableCardClass = 'bg-black border-2 border-[#333333] text-[#00FF00] font-mono rounded-none shadow-none';
    tableHeaderBgClass = 'bg-[#1C1C1E] border-[#333333] text-[#FACC15] font-mono';
    tableThBgClass = 'bg-[#000000] border-[#333333] text-[#00FF00] font-mono';
    tableRowBorderClass = 'border-[#222222]';
    tableFooterBgClass = 'bg-[#1C1C1E] border-[#444444] font-mono font-black text-[#00FF00]';
  }

  const thHoverClass = isDark
    ? 'hover:bg-[#2A2A2A]'
    : isWinamp
    ? 'hover:bg-[#1A1A1A]'
    : isVista
    ? 'hover:bg-white/70'
    : 'hover:bg-slate-200/80';

  const rowHoverClass = isDark
    ? 'hover:bg-[#222222]'
    : isWinamp
    ? 'hover:bg-[#151515]'
    : isVista
    ? 'hover:bg-white/50'
    : 'hover:bg-slate-50/80';

  const holidayRowClass = isDark
    ? 'bg-rose-950/20'
    : isWinamp
    ? 'bg-[#2A1111]'
    : isVista
    ? 'bg-rose-500/10'
    : 'bg-rose-50/40';

  const dayBadgeClass = isDark
    ? 'bg-[#2A2A2A] text-slate-300'
    : isWinamp
    ? 'bg-[#1A1A1A] text-[#00FF00] border border-[#00FF00]/40'
    : isVista
    ? 'bg-white/60 text-slate-800'
    : 'bg-slate-100 text-slate-600';

  const timeBadgeClass = isDark
    ? 'font-semibold text-slate-200 bg-[#252525] px-2 py-0.5 rounded border border-white/10'
    : isWinamp
    ? 'font-semibold text-[#00FF00] bg-black px-2 py-0.5 rounded-none border border-[#00FF00]/60'
    : isVista
    ? 'font-semibold text-slate-900 bg-white/70 px-2 py-0.5 rounded border border-white/40'
    : 'font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded';

  const ceisaBadgeClass = isDark
    ? 'font-semibold text-blue-300 bg-blue-950/70 px-2 py-0.5 rounded border border-blue-800/60'
    : isWinamp
    ? 'font-semibold text-[#00E5FF] bg-black px-2 py-0.5 rounded-none border border-[#00E5FF]/60'
    : isVista
    ? 'font-semibold text-blue-950 bg-blue-500/20 px-2 py-0.5 rounded border border-white/40'
    : 'font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100';

  const piketBadgeClass = isDark
    ? 'bg-teal-950/70 text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-800/60'
    : isWinamp
    ? 'bg-black text-[#FFCC00] text-[10px] font-bold px-2 py-0.5 rounded-none border border-[#FFCC00]/60 font-mono'
    : isVista
    ? 'bg-teal-500/20 text-teal-950 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/40'
    : 'bg-teal-100 text-teal-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-300';

  const lemburBadgeClass = isDark
    ? 'bg-emerald-950/70 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-800/60'
    : isWinamp
    ? 'bg-black text-[#00FF00] font-bold px-2 py-0.5 rounded-none border border-[#00FF00]/60 font-mono'
    : isVista
    ? 'bg-emerald-500/20 text-emerald-950 font-bold px-2 py-0.5 rounded-md border border-white/40'
    : 'bg-emerald-100 text-emerald-950 font-bold px-2 py-0.5 rounded-md border border-emerald-300';

  const biasaBadgeClass = isDark
    ? 'bg-indigo-950/70 text-indigo-300 font-bold px-2 py-0.5 rounded-md border border-indigo-800/60'
    : isWinamp
    ? 'bg-black text-[#00E5FF] font-bold px-2 py-0.5 rounded-none border border-[#00E5FF]/60 font-mono'
    : isVista
    ? 'bg-indigo-500/20 text-indigo-950 font-bold px-2 py-0.5 rounded-md border border-white/40'
    : 'bg-indigo-50 text-indigo-950 font-bold px-2 py-0.5 rounded-md border border-indigo-200';

  const popoutModalClass = isDark
    ? 'bg-[#181818] border border-[#333333] text-slate-100 shadow-2xl'
    : isWinamp
    ? 'bg-black border-2 border-zinc-700 text-[#00FF00] font-mono rounded-none shadow-none'
    : isVista
    ? 'bg-white/85 backdrop-blur-xl border border-white/60 text-slate-900 shadow-2xl'
    : 'bg-white border border-slate-200 text-slate-900 shadow-2xl';

  const popoutTableWrapperClass = isDark
    ? 'rounded-xl border border-[#333333] overflow-x-auto bg-[#141414]'
    : isWinamp
    ? 'rounded-none border-2 border-zinc-800 overflow-x-auto bg-black font-mono'
    : isVista
    ? 'rounded-xl border border-white/40 overflow-x-auto bg-white/40'
    : 'rounded-xl border border-slate-200 overflow-x-auto bg-white';

  const popoutFooterClass = isDark
    ? 'p-3.5 bg-[#1E1E1E] border-t border-[#333333] flex justify-end'
    : isWinamp
    ? 'p-3.5 bg-black border-t-2 border-zinc-800 flex justify-end font-mono'
    : isVista
    ? 'p-3.5 bg-white/60 border-t border-white/40 flex justify-end'
    : 'p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end';

  const popoutCloseBtnClass = isWinamp
    ? 'rounded-none bg-zinc-800 text-[#00FF00] border border-[#00FF00]/60 font-mono px-4 py-2 text-xs font-bold hover:bg-zinc-700 cursor-pointer'
    : isDark
    ? 'rounded-xl bg-[#2A2A2A] text-white border border-white/20 px-4 py-2 text-xs font-bold hover:bg-[#333333] cursor-pointer'
    : 'rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 cursor-pointer';

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  const getDayData = (d: number): DayData => {
    const key = `${selectedYear}-${selectedMonth}-${d}`;
    return (
      daysState[key] || {
        shift: 'Graha',
        isLocked: false,
        note: '',
        isMasuk: false,
        tipeMasukLibur: 'piket',
        isHoldDokumen: false,
        jamMasuk: '',
        jamPulang: '',
        absenCeisa: '',
        isSuratTugasTambahan: false,
        isManualHoliday: false,
      }
    );
  };

  const summary = calculateMonthSummary(daysState, selectedYear, selectedMonth);

  // Generate table rows
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const fullDayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const rows = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = new Date(selectedYear, selectedMonth - 1, day);
    const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const data = getDayData(day);
    const isHoliday = isWeekend || data.isManualHoliday;
    const calc = calculateDayResult(data, date);

    let jamBiasa = 0;
    if (data.isMasuk && calc.durasiKerja > 0) {
      if (isHoliday && data.shift === 'OFF' && calc.isLembur) {
        jamBiasa = 0;
      } else if (isHoliday && data.tipeMasukLibur === 'lembur' && calc.isLembur) {
        jamBiasa = 0;
      } else {
        jamBiasa = calc.durasiKerja > 8.5 ? 8.5 : calc.durasiKerja;
      }
    }

    return {
      day,
      dayName: dayNames[dayOfWeek],
      fullDayName: fullDayNames[dayOfWeek],
      isWeekend,
      isHoliday,
      data,
      calc,
      jamBiasa,
    };
  });

  // Client-side Sorting Logic (Handles Numbers, Strings, and Dates)
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedRows = useMemo(() => {
    if (!sortConfig) return rows;
    const { key, direction } = sortConfig;
    const modifier = direction === 'asc' ? 1 : -1;

    return [...rows].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (key) {
        case 'day':
          aVal = a.day;
          bVal = b.day;
          break;
        case 'shift':
          aVal = (a.data.shift || '').toLowerCase();
          bVal = (b.data.shift || '').toLowerCase();
          break;
        case 'jamMasuk':
          aVal = a.data.jamMasuk || '';
          bVal = b.data.jamMasuk || '';
          break;
        case 'absenCeisa':
          aVal = a.data.absenCeisa || '';
          bVal = b.data.absenCeisa || '';
          break;
        case 'piket':
          aVal = a.calc.isPiket ? 1 : 0;
          bVal = b.calc.isPiket ? 1 : 0;
          break;
        case 'lembur':
          aVal = a.calc.isLembur ? a.calc.jamLembur : 0;
          bVal = b.calc.isLembur ? b.calc.jamLembur : 0;
          break;
        case 'jamBiasa':
          aVal = a.jamBiasa;
          bVal = b.jamBiasa;
          break;
        case 'keterangan':
          aVal = (a.calc.keteranganStatus || a.data.note || '').toLowerCase();
          bVal = (b.calc.keteranganStatus || b.data.note || '').toLowerCase();
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
  }, [rows, sortConfig]);

  const renderSortIndicator = (colKey: string) => {
    if (sortConfig?.key !== colKey) {
      return (
        <span className="inline-block ml-1 text-slate-400 opacity-40 group-hover:opacity-100 text-[10px] select-none transition-opacity">
          ⇅
        </span>
      );
    }
    return (
      <span className="inline-block ml-1 text-[#297373] font-black text-xs select-none">
        {sortConfig.direction === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  const totalJamBiasa = rows.reduce((acc, r) => acc + r.jamBiasa, 0);

  // Data for Lembur Popout
  const lemburRows = rows.filter((r) => r.calc.isLembur && r.calc.jamLembur > 0);

  // Data for Piket & OFF Popout
  const piketRows = rows.filter(
    (r) => r.calc.isPiket || r.calc.isDapatGeserOff || r.calc.isOffDiambil || r.data.isGunakanOffGeser
  );

  // Data for Surat Tugas / CP Popout
  const stRows = rows.filter(
    (r) => r.calc.isCutiPengganti || r.data.isSuratTugasTambahan || r.calc.isCPDiambil || r.data.isGunakanCP
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Table className="h-5 w-5 text-[#297373]" />
            Tabel Rekapitulasi: {monthName} {selectedYear}
          </h2>
          <p className="text-xs text-slate-500">
            Rekap kehadiran, jam kerja normal, piket, dan akumulasi lembur
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onOpenExport}
            className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Ekspor Rekapitulasi</span>
          </button>
        </div>
      </div>

      {/* Interactive Summary Cards (Buttons with Popouts) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Lembur Button Card */}
        <button
          type="button"
          onClick={() => setActivePopout('lembur')}
          className={`text-left border rounded-2xl p-3.5 transition-all shadow-xs hover:shadow-md cursor-pointer group ${lemburCardClass} ${isWinamp ? 'rounded-none font-mono' : ''}`}
        >
          <div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${lemburTitleClass}`}>
            <span>Total Lembur</span>
            <ChevronRight className={`h-3.5 w-3.5 ${lemburChevronClass} group-hover:translate-x-0.5 transition-transform`} />
          </div>
          <div className={`text-xl font-black mt-1 ${lemburHoursClass}`}>
            {summary.totalLemburHours.toFixed(1)} Jam
          </div>
          <div className={`text-[11px] font-semibold mt-0.5 ${lemburSubtextClass}`}>
            {summary.totalLemburDays} Hari Lembur (Klik Detail)
          </div>
        </button>

        {/* Jam Kerja Biasa Card */}
        <div className={`border rounded-2xl p-3.5 shadow-xs ${jamKerjaCardClass} ${isWinamp ? 'rounded-none font-mono' : ''}`}>
          <div className={`text-[10px] font-bold uppercase tracking-wider ${jamKerjaTitleClass}`}>
            Jam Kerja Biasa
          </div>
          <div className={`text-xl font-black mt-1 ${jamKerjaHoursClass}`}>
            {totalJamBiasa.toFixed(1)} Jam
          </div>
          <div className={`text-[11px] font-semibold mt-0.5 ${jamKerjaSubtextClass}`}>
            Jam Reguler / Normal
          </div>
        </div>

        {/* Total Piket Button Card */}
        <button
          type="button"
          onClick={() => setActivePopout('piket')}
          className={`text-left border rounded-2xl p-3.5 transition-all shadow-xs hover:shadow-md cursor-pointer group ${piketCardClass} ${isWinamp ? 'rounded-none font-mono' : ''}`}
        >
          <div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${piketTitleClass}`}>
            <span>Total Piket & OFF</span>
            <ChevronRight className={`h-3.5 w-3.5 ${piketChevronClass} group-hover:translate-x-0.5 transition-transform`} />
          </div>
          <div className={`text-xl font-black mt-1 ${piketHoursClass}`}>
            {summary.totalPiketDays} Hari
          </div>
          <div className={`text-[11px] font-semibold mt-0.5 ${piketSubtextClass}`}>
            Piket / Geser OFF (Klik Detail)
          </div>
        </button>

        {/* Surat Tugas (ST) Button Card */}
        <button
          type="button"
          onClick={() => setActivePopout('st')}
          className={`text-left border rounded-2xl p-3.5 transition-all shadow-xs hover:shadow-md cursor-pointer group ${stCardClass} ${isWinamp ? 'rounded-none font-mono' : ''}`}
        >
          <div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${stTitleClass}`}>
            <span>Surat Tugas (ST)</span>
            <ChevronRight className={`h-3.5 w-3.5 ${stChevronClass} group-hover:translate-x-0.5 transition-transform`} />
          </div>
          <div className={`text-xl font-black mt-1 ${stHoursClass}`}>
            {summary.totalCutiPengganti} ST
          </div>
          <div className={`text-[11px] font-semibold mt-0.5 ${stSubtextClass}`}>
            Cuti Pengganti (Klik Detail)
          </div>
        </button>
      </div>

      {/* Table Container */}
      <div className={`rounded-2xl border shadow-xs overflow-hidden ${tableCardClass} ${isWinamp ? 'rounded-none font-mono' : ''}`}>
        <div className={`p-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${tableHeaderBgClass}`}>
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>Keterangan: Lembur ≤ 1 jam tidak masuk rekapitulasi. Lembur libur terhitung 2-8 jam.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {sortConfig && (
              <button
                type="button"
                onClick={() => setSortConfig(null)}
                className="flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                title="Kembalikan urutan tanggal normal"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Urutan</span>
              </button>
            )}
            <div className="text-xs text-slate-500 font-medium">
              Total {daysInMonth} Hari
            </div>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className={`sticky top-0 z-10 border-b ${tableThBgClass} shadow-2xs`}>
              <tr>
                <th
                  onClick={() => handleSort('day')}
                  className={`py-2.5 px-3 whitespace-nowrap cursor-pointer ${thHoverClass} transition-colors select-none group`}
                  title="Klik untuk mengurutkan berdasarkan Tanggal"
                >
                  <div className="flex items-center space-x-1">
                    <span>Tanggal</span>
                    {renderSortIndicator('day')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('shift')}
                  className={`py-2.5 px-3 text-center whitespace-nowrap cursor-pointer ${thHoverClass} transition-colors select-none group`}
                  title="Klik untuk mengurutkan berdasarkan Jadwal Shift"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Jadwal (Shift)</span>
                    {renderSortIndicator('shift')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('jamMasuk')}
                  className={`py-2.5 px-3 text-center whitespace-nowrap cursor-pointer ${thHoverClass} transition-colors select-none group`}
                  title="Klik untuk mengurutkan berdasarkan Absen Masuk & Pulang"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Absen Masuk - Pulang</span>
                    {renderSortIndicator('jamMasuk')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('absenCeisa')}
                  className={`py-2.5 px-3 text-center whitespace-nowrap cursor-pointer ${thHoverClass} transition-colors select-none group`}
                  title="Klik untuk mengurutkan berdasarkan Absen CEISA"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Absen CEISA</span>
                    {renderSortIndicator('absenCeisa')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('piket')}
                  className={`py-2.5 px-3 text-center whitespace-nowrap cursor-pointer ${thHoverClass} transition-colors select-none group`}
                  title="Klik untuk mengurutkan berdasarkan Status Piket"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Status Piket</span>
                    {renderSortIndicator('piket')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('lembur')}
                  className={`py-2.5 px-3 text-center whitespace-nowrap cursor-pointer ${thHoverClass} transition-colors select-none group`}
                  title="Klik untuk mengurutkan berdasarkan Durasi Lembur"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Lembur (Hitungan Jam)</span>
                    {renderSortIndicator('lembur')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('jamBiasa')}
                  className={`py-2.5 px-3 text-center whitespace-nowrap cursor-pointer ${thHoverClass} transition-colors select-none group`}
                  title="Klik untuk mengurutkan berdasarkan Jam Kerja Normal"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Biasa (Jam Kerja Normal)</span>
                    {renderSortIndicator('jamBiasa')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('keterangan')}
                  className={`py-2.5 px-3 whitespace-nowrap cursor-pointer ${thHoverClass} transition-colors select-none group`}
                  title="Klik untuk mengurutkan berdasarkan Keterangan"
                >
                  <div className="flex items-center space-x-1">
                    <span>Keterangan</span>
                    {renderSortIndicator('keterangan')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#2A2A2A] text-slate-200' : isWinamp ? 'divide-zinc-800 text-[#00FF00]' : isVista ? 'divide-white/30 text-slate-900' : 'divide-slate-100 text-slate-700'} font-medium`}>
              {sortedRows.map(({ day, dayName, isWeekend, isHoliday, data, calc, jamBiasa }) => {
                const normShift = normalizeShift(data.shift);
                const shiftStyle = SHIFT_COLORS[normShift] || (normShift === '' ? SHIFT_COLORS[''] : SHIFT_COLORS.Graha);
                const hasTime = data.jamMasuk.trim().length > 0 || data.jamPulang.trim().length > 0;

                return (
                  <tr
                    key={day}
                    className={`${rowHoverClass} transition-colors ${
                      isHoliday ? holidayRowClass : ''
                    }`}
                  >
                    {/* Tanggal */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isHoliday ? (isWinamp ? 'text-[#FF3366]' : 'text-rose-500') : (isWinamp ? 'text-[#00FF00]' : isDark ? 'text-slate-100' : 'text-slate-900')
                          }`}
                        >
                          {String(day).padStart(2, '0')}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                            isHoliday
                              ? (isWinamp ? 'bg-[#331111] text-[#FF8A8A] border border-[#FF3366]/40' : isDark ? 'bg-rose-950/60 text-rose-300' : 'bg-rose-100 text-rose-800')
                              : dayBadgeClass
                          }`}
                        >
                          {dayName}
                        </span>
                        {data.isManualHoliday && (
                          <span className="text-[9px] bg-rose-600 text-white px-1 py-0.2 rounded font-bold">
                            Libur
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Jadwal Shift */}
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-black border ${shiftStyle.bg} ${shiftStyle.text} ${shiftStyle.border}`}
                      >
                        {normShift || '-'}
                      </span>
                    </td>

                    {/* Jam Masuk - Pulang */}
                    <td className="py-2 px-3 text-center whitespace-nowrap font-mono text-[11px]">
                      {hasTime ? (
                        <span className={timeBadgeClass}>
                          {data.jamMasuk || '--:--'} - {data.jamPulang || '--:--'}
                        </span>
                      ) : (
                        <span className="text-slate-400 opacity-60">-</span>
                      )}
                    </td>

                    {/* Absen CEISA */}
                    <td className="py-2 px-3 text-center whitespace-nowrap font-mono text-[11px]">
                      {data.absenCeisa ? (
                        <span className={ceisaBadgeClass}>
                          {data.absenCeisa}
                        </span>
                      ) : (
                        <span className="text-slate-400 opacity-60">-</span>
                      )}
                    </td>

                    {/* Status Piket */}
                    <td className="py-2 px-3 text-center whitespace-nowrap">
                      {calc.isPiket ? (
                        <span className={piketBadgeClass}>
                          Piket
                        </span>
                      ) : (
                        <span className="text-slate-400 opacity-60">-</span>
                      )}
                    </td>

                    {/* Lembur (Hitungan Jam) */}
                    <td className="py-2 px-3 text-center whitespace-nowrap font-mono">
                      {calc.isLembur && calc.jamLembur > 0 ? (
                        <span className={lemburBadgeClass}>
                          {calc.jamLembur.toFixed(1)} Jam
                        </span>
                      ) : (
                        <span className="text-slate-400 opacity-60">-</span>
                      )}
                    </td>

                    {/* Biasa (Jam Kerja Normal) */}
                    <td className="py-2 px-3 text-center whitespace-nowrap font-mono">
                      {jamBiasa > 0 ? (
                        <span className={biasaBadgeClass}>
                          {jamBiasa.toFixed(1)} Jam
                        </span>
                      ) : (
                        <span className="text-slate-400 opacity-60">-</span>
                      )}
                    </td>

                    {/* Keterangan */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : isWinamp ? 'text-[#00FF00]/80' : 'text-slate-600'}`}>
                          {calc.keteranganStatus || (data.note ? data.note : '-')}
                        </span>
                        {data.isSuratTugasTambahan && (
                          <span className={isWinamp ? 'bg-black text-[#FF0055] text-[9px] font-bold px-1.5 py-0.5 rounded-none border border-[#FF0055]/60 font-mono' : 'bg-purple-100 text-purple-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-purple-200'}>
                            ST
                          </span>
                        )}
                        {data.isHoldDokumen && (
                          <span className={isWinamp ? 'bg-black text-[#FFCC00] text-[9px] font-bold px-1.5 py-0.5 rounded-none border border-[#FFCC00]/60 font-mono' : 'bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-200'}>
                            HOLD
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Footer Summary Row */}
            <tfoot className={`${tableFooterBgClass} sticky bottom-0 z-10`}>
              <tr>
                <td className="py-2.5 px-3 uppercase text-xs" colSpan={4}>
                  TOTAL REKAPITULASI ({monthName} {selectedYear})
                </td>
                <td className={`py-2.5 px-3 text-center font-mono text-xs ${isDark ? 'text-teal-300' : isWinamp ? 'text-[#FFCC00]' : 'text-teal-900'}`}>
                  {summary.totalPiketDays} Hari
                </td>
                <td className={`py-2.5 px-3 text-center font-mono text-xs ${isDark ? 'text-emerald-300' : isWinamp ? 'text-[#00FF00]' : 'text-emerald-950'}`}>
                  {summary.totalLemburHours.toFixed(1)} Jam
                </td>
                <td className={`py-2.5 px-3 text-center font-mono text-xs ${isDark ? 'text-indigo-300' : isWinamp ? 'text-[#00E5FF]' : 'text-indigo-950'}`}>
                  {totalJamBiasa.toFixed(1)} Jam
                </td>
                <td className={`py-2.5 px-3 text-xs ${isDark ? 'text-slate-300' : isWinamp ? 'text-[#00FF00]/80' : 'text-slate-600'}`}>
                  {summary.totalLemburDays} Hari Lembur, {summary.totalCutiPengganti} ST
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Popout Layer 1: Detail Total Lembur */}
      {activePopout === 'lembur' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setActivePopout(null)}
          />
          <div className={`relative z-10 w-full max-w-2xl rounded-3xl ${popoutModalClass} overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col`}>
            <div className="flex items-center justify-between bg-gradient-to-r from-emerald-800 to-teal-900 p-4 sm:p-5 text-white">
              <div className="flex items-center space-x-3">
                <div className="rounded-2xl bg-white/10 p-2.5 border border-white/20">
                  <Zap className="h-6 w-6 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black">
                    Detail Jam Lembur: {monthName} {selectedYear}
                  </h3>
                  <p className="text-xs text-emerald-100 font-medium">
                    Total {summary.totalLemburHours.toFixed(1)} Jam dari {lemburRows.length} Hari Lembur
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePopout(null)}
                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {lemburRows.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-medium text-sm">
                  Tidak ada data lembur pada bulan {monthName} {selectedYear}.
                </div>
              ) : (
                <div className={popoutTableWrapperClass}>
                  <table className="w-full text-left text-xs">
                    <thead className={`${tableThBgClass} font-bold border-b`}>
                      <tr>
                        <th className="py-2.5 px-3">Tanggal</th>
                        <th className="py-2.5 px-3 text-center">Shift</th>
                        <th className="py-2.5 px-3 text-center">Jam Masuk</th>
                        <th className="py-2.5 px-3 text-center">Jam Pulang</th>
                        <th className="py-2.5 px-3 text-center">Hitungan Lembur</th>
                        <th className="py-2.5 px-3">Catatan / Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-[#2A2A2A] text-slate-200' : isWinamp ? 'divide-zinc-800 text-[#00FF00]' : 'divide-slate-100 text-slate-700'} font-medium`}>
                      {lemburRows.map((r) => {
                        const normShift = normalizeShift(r.data.shift);
                        const shiftStyle = SHIFT_COLORS[normShift] || SHIFT_COLORS.Graha;
                        return (
                          <tr key={r.day} className={`${rowHoverClass} transition-colors`}>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className={`font-bold ${isDark ? 'text-slate-100' : isWinamp ? 'text-[#00FF00]' : 'text-slate-900'}`}>{r.fullDayName}, {r.day} {monthName}</span>
                            </td>
                            <td className="py-2 px-3 text-center whitespace-nowrap">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black border ${shiftStyle.bg} ${shiftStyle.text} ${shiftStyle.border}`}>
                                {normShift || '-'}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-bold">{r.data.jamMasuk || '--:--'}</td>
                            <td className="py-2 px-3 text-center font-mono font-bold">{r.data.jamPulang || '--:--'}</td>
                            <td className="py-2 px-3 text-center font-mono font-black text-emerald-600 dark:text-emerald-400">
                              {r.calc.jamLembur.toFixed(1)} Jam
                            </td>
                            <td className={`py-2 px-3 ${isDark ? 'text-slate-400' : isWinamp ? 'text-[#00FF00]/80' : 'text-slate-600'}`}>{r.data.note || r.calc.keteranganStatus || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className={`${isWinamp ? 'bg-black border-t-2 border-emerald-500 text-[#00FF00]' : isDark ? 'bg-[#18281d] border-t border-emerald-800 text-emerald-300' : 'bg-emerald-50 font-bold border-t border-emerald-200 text-emerald-950'} font-bold`}>
                      <tr>
                        <td colSpan={4} className="py-2.5 px-3 uppercase text-xs">Total Jam Lembur Bulan Ini</td>
                        <td className="py-2.5 px-3 text-center font-mono font-black text-sm text-emerald-500">
                          {summary.totalLemburHours.toFixed(1)} Jam
                        </td>
                        <td className="py-2.5 px-3 text-xs">{summary.totalLemburDays} Hari</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            <div className={popoutFooterClass}>
              <button
                type="button"
                onClick={() => setActivePopout(null)}
                className={popoutCloseBtnClass}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popout Layer 2: Detail Total Piket & Status OFF */}
      {activePopout === 'piket' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setActivePopout(null)}
          />
          <div className={`relative z-10 w-full max-w-2xl rounded-3xl ${popoutModalClass} overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col`}>
            <div className="flex items-center justify-between bg-gradient-to-r from-teal-800 to-cyan-900 p-4 sm:p-5 text-white">
              <div className="flex items-center space-x-3">
                <div className="rounded-2xl bg-white/10 p-2.5 border border-white/20">
                  <ShieldCheck className="h-6 w-6 text-teal-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black">
                    Detail Piket & Status Geser OFF: {monthName} {selectedYear}
                  </h3>
                  <p className="text-xs text-teal-100 font-medium">
                    Piket, Tabungan OFF, dan Pengambilan OFF
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePopout(null)}
                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {piketRows.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-medium text-sm">
                  Tidak ada catatan piket atau geser OFF pada bulan {monthName} {selectedYear}.
                </div>
              ) : (
                <div className={popoutTableWrapperClass}>
                  <table className="w-full text-left text-xs">
                    <thead className={`${tableThBgClass} font-bold border-b`}>
                      <tr>
                        <th className="py-2.5 px-3">Tanggal</th>
                        <th className="py-2.5 px-3 text-center">Status Piket / Kehadiran</th>
                        <th className="py-2.5 px-3 text-center">Status OFF</th>
                        <th className="py-2.5 px-3">Referensi Tanggal OFF</th>
                        <th className="py-2.5 px-3">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-[#2A2A2A] text-slate-200' : isWinamp ? 'divide-zinc-800 text-[#00FF00]' : 'divide-slate-100 text-slate-700'} font-medium`}>
                      {piketRows.map((r) => {
                        let statusPiketBadge = <span className="text-slate-400 opacity-60">-</span>;
                        if (r.calc.isPiket) {
                          statusPiketBadge = (
                            <span className={piketBadgeClass}>
                              Piket
                            </span>
                          );
                        } else if (r.data.shift === 'OFF' && r.data.isMasuk) {
                          statusPiketBadge = (
                            <span className={lemburBadgeClass}>
                              Masuk Saat Jadwal OFF
                            </span>
                          );
                        }

                        let statusOffBadge = <span className="text-slate-400 opacity-60">-</span>;
                        if (r.calc.isDapatGeserOff) {
                          statusOffBadge = (
                            <span className={lemburBadgeClass}>
                              OFF Ditabung (+1)
                            </span>
                          );
                        } else if (r.calc.isOffDiambil || r.data.isGunakanOffGeser) {
                          statusOffBadge = (
                            <span className={isWinamp ? 'bg-black text-[#FFCC00] font-bold px-2 py-0.5 rounded-none border border-[#FFCC00]/60 font-mono text-[10.5px]' : isDark ? 'bg-amber-950/70 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-800/60 text-[10.5px]' : 'bg-amber-100 text-amber-950 font-bold px-2 py-0.5 rounded-md border border-amber-300 text-[10.5px]'}>
                              OFF Terpakai (-1)
                            </span>
                          );
                        }

                        return (
                          <tr key={r.day} className={`${rowHoverClass} transition-colors`}>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className={`font-bold ${isDark ? 'text-slate-100' : isWinamp ? 'text-[#00FF00]' : 'text-slate-900'}`}>{r.fullDayName}, {r.day} {monthName}</span>
                            </td>
                            <td className="py-2 px-3 text-center whitespace-nowrap">{statusPiketBadge}</td>
                            <td className="py-2 px-3 text-center whitespace-nowrap">{statusOffBadge}</td>
                            <td className={`py-2 px-3 font-medium ${isWinamp ? 'text-[#00E5FF]' : isDark ? 'text-indigo-300' : 'text-indigo-900'}`}>{r.data.referensiTglOff || '-'}</td>
                            <td className={`py-2 px-3 ${isDark ? 'text-slate-400' : isWinamp ? 'text-[#00FF00]/80' : 'text-slate-600'}`}>{r.data.note || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className={popoutFooterClass}>
              <button
                type="button"
                onClick={() => setActivePopout(null)}
                className={popoutCloseBtnClass}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popout Layer 3: Detail Surat Tugas (ST) & Cuti Pengganti */}
      {activePopout === 'st' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="fixed inset-0"
            onClick={() => setActivePopout(null)}
          />
          <div className={`relative z-10 w-full max-w-2xl rounded-3xl ${popoutModalClass} overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col`}>
            <div className="flex items-center justify-between bg-gradient-to-r from-purple-900 to-indigo-950 p-4 sm:p-5 text-white">
              <div className="flex items-center space-x-3">
                <div className="rounded-2xl bg-white/10 p-2.5 border border-white/20">
                  <Palmtree className="h-6 w-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black">
                    Detail Surat Tugas (ST) & Cuti Pengganti: {monthName} {selectedYear}
                  </h3>
                  <p className="text-xs text-purple-200 font-medium">
                    Daftar Surat Tugas Libur & Penggunaan Kuota Cuti Pengganti
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePopout(null)}
                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {stRows.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-medium text-sm">
                  Tidak ada data Surat Tugas atau Cuti Pengganti pada bulan {monthName} {selectedYear}.
                </div>
              ) : (
                <div className={popoutTableWrapperClass}>
                  <table className="w-full text-left text-xs">
                    <thead className={`${tableThBgClass} font-bold border-b`}>
                      <tr>
                        <th className="py-2.5 px-3">Tanggal</th>
                        <th className="py-2.5 px-3 text-center">Status ST / CP</th>
                        <th className="py-2.5 px-3 text-center">Hak Cuti</th>
                        <th className="py-2.5 px-3">Referensi Tanggal ST / CP</th>
                        <th className="py-2.5 px-3">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-[#2A2A2A] text-slate-200' : isWinamp ? 'divide-zinc-800 text-[#00FF00]' : 'divide-slate-100 text-slate-700'} font-medium`}>
                      {stRows.map((r) => {
                        let statusBadge = <span className="text-slate-400 opacity-60">-</span>;
                        let hakBadge = <span className="text-slate-400 opacity-60">-</span>;

                        if (r.calc.isCutiPengganti || r.data.isSuratTugasTambahan) {
                          statusBadge = (
                            <span className={isWinamp ? 'bg-black text-[#FF0055] font-bold px-2 py-0.5 rounded-none border border-[#FF0055]/60 font-mono text-[10.5px]' : isDark ? 'bg-purple-950/70 text-purple-300 font-bold px-2 py-0.5 rounded-md border border-purple-800/60 text-[10.5px]' : 'bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-md border border-purple-300 text-[10.5px]'}>
                              Surat Tugas Hari Libur
                            </span>
                          );
                          hakBadge = (
                            <span className={lemburBadgeClass}>
                              +1 Cuti Pengganti
                            </span>
                          );
                        } else if (r.calc.isCPDiambil || r.data.isGunakanCP) {
                          statusBadge = (
                            <span className={isWinamp ? 'bg-black text-[#FFCC00] font-bold px-2 py-0.5 rounded-none border border-[#FFCC00]/60 font-mono text-[10.5px]' : isDark ? 'bg-amber-950/70 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-800/60 text-[10.5px]' : 'bg-amber-100 text-amber-950 font-bold px-2 py-0.5 rounded-md border border-amber-300 text-[10.5px]'}>
                              Gunakan Cuti Pengganti
                            </span>
                          );
                          hakBadge = (
                            <span className={isWinamp ? 'bg-black text-[#FF3366] font-bold px-2 py-0.5 rounded-none border border-[#FF3366]/60 font-mono text-[10.5px]' : isDark ? 'bg-rose-950/70 text-rose-300 font-bold px-2 py-0.5 rounded-md border border-rose-800/60 text-[10.5px]' : 'bg-rose-100 text-rose-900 font-bold px-2 py-0.5 rounded-md border border-rose-300 text-[10.5px]'}>
                              -1 Cuti Terpakai
                            </span>
                          );
                        }

                        return (
                          <tr key={r.day} className={`${rowHoverClass} transition-colors`}>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className={`font-bold ${isDark ? 'text-slate-100' : isWinamp ? 'text-[#00FF00]' : 'text-slate-900'}`}>{r.fullDayName}, {r.day} {monthName}</span>
                            </td>
                            <td className="py-2 px-3 text-center whitespace-nowrap">{statusBadge}</td>
                            <td className="py-2 px-3 text-center whitespace-nowrap">{hakBadge}</td>
                            <td className={`py-2 px-3 font-medium ${isWinamp ? 'text-[#FF0055]' : isDark ? 'text-purple-300' : 'text-purple-900'}`}>{r.data.referensiTglCP || '-'}</td>
                            <td className={`py-2 px-3 ${isDark ? 'text-slate-400' : isWinamp ? 'text-[#00FF00]/80' : 'text-slate-600'}`}>{r.data.note || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className={popoutFooterClass}>
              <button
                type="button"
                onClick={() => setActivePopout(null)}
                className={popoutCloseBtnClass}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
