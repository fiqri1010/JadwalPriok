import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    Download,
    FileSpreadsheet,
    Image as ImageIcon,
    FileText,
    Code,
    Calendar,
    CalendarRange,
    Check,
    Loader2,
    ChevronDown,
    ChevronUp,
    Filter,
    CalendarDays,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { DayData, normalizeShift, LiburNasional } from '../types';
import { saveFileWithDialog } from '../lib/fileDownload';
import { getCalendarPngBlob } from '../lib/calendarImageGenerator';
import { generateSchedulePdf } from '../lib/pdfExport';
import { Tooltip } from './Tooltip';
import { CustomDropdown } from './common/CustomDropdown';
import { CustomDatePicker } from './CustomDatePicker';

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

interface ExportDropdownProps {
    daysState: Record<string, DayData>;
    selectedYear: number;
    selectedMonth: number;
    daftarLibur?: LiburNasional[];
    currentTheme?: string;
    onShowToast: (msg: string) => void;
    buttonClass?: string;
}

type PeriodMode = 'specific_month' | 'current_year' | 'specific_year' | 'q1' | 'q2' | 'q3' | 'q4' | 's1' | 's2';

export const ExportDropdown: React.FC<ExportDropdownProps> = ({
    daysState,
    selectedYear: defaultYear,
    selectedMonth: defaultMonth,
    daftarLibur = [],
    currentTheme = 'light',
    onShowToast,
    buttonClass = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Data Selection Dropdown Toggle (Diatas kotak-kotak tombol ekspor)
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'date_range' | 'period_range'>('period_range');

    // Tab 1: Rentang Tanggal
    const defaultStart = `${defaultYear}-${String(defaultMonth).padStart(2, '0')}-01`;
    const lastDayOfMonth = new Date(defaultYear, defaultMonth, 0).getDate();
    const defaultEnd = `${defaultYear}-${String(defaultMonth).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
    const [startDate, setStartDate] = useState<string>(defaultStart);
    const [endDate, setEndDate] = useState<string>(defaultEnd);

    // Tab 2: Rentang Periode
    const currentActualYear = new Date().getFullYear();
    const currentActualMonth = new Date().getMonth() + 1;

    const [periodMode, setPeriodMode] = useState<PeriodMode>('specific_month');
    const [targetSpecificMonth, setTargetSpecificMonth] = useState<number>(defaultMonth);
    const [targetSpecificMonthYear, setTargetSpecificMonthYear] = useState<number>(defaultYear);
    const [targetSpecificYear, setTargetSpecificYear] = useState<number>(defaultYear);

    // Folded Grid 2x3 Toggle (Folded by default)
    const [isFoldedGridOpen, setIsFoldedGridOpen] = useState<boolean>(false);

    // Export Action State
    const [exportLoading, setExportLoading] = useState<string | null>(null);
    const [exportSuccess, setExportSuccess] = useState<string | null>(null);

    // Sync when props change
    useEffect(() => {
        setTargetSpecificMonth(defaultMonth);
        setTargetSpecificMonthYear(defaultYear);
        setTargetSpecificYear(defaultYear);
    }, [defaultMonth, defaultYear]);

    // Close when clicking outside dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setIsSelectorOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Calculate Filtered Entries & Months to Include
    const { filteredEntries, rangeLabel, filenameSuffix, monthsToInclude } = useMemo(() => {
        const defaultDayData: DayData = {
            shift: '',
            isLocked: true,
            note: '',
            isMasuk: false,
            jamMasuk: '',
            jamPulang: '',
            absenCeisa: '',
            isManualHoliday: false,
        };

        const entries: Array<{
            day: number;
            month: number;
            year: number;
            dateKey: string;
            dayName: string;
            data: DayData;
        }> = [];

        let label = '';
        let suffix = '';
        const monthsList: Array<{ year: number; month: number }> = [];

        if (activeTab === 'date_range') {
            // Tab 1: Rentang Tanggal
            label = `Rentang ${startDate} s/d ${endDate}`;
            suffix = `${startDate}_sd_${endDate}`;

            if (startDate && endDate) {
                const s = new Date(startDate);
                const e = new Date(endDate);
                if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && s <= e) {
                    const cur = new Date(s);
                    while (cur <= e) {
                        const y = cur.getFullYear();
                        const m = cur.getMonth() + 1;
                        const d = cur.getDate();
                        const dateKey = `${y}-${m}-${d}`;
                        const curDateObj = new Date(y, m - 1, d);
                        const data = daysState[dateKey] || defaultDayData;

                        entries.push({
                            day: d,
                            month: m,
                            year: y,
                            dateKey,
                            dayName: INDONESIAN_DAYS[curDateObj.getDay()],
                            data,
                        });

                        // Keep track of unique months for PDF visual calendar
                        if (!monthsList.some((it) => it.year === y && it.month === m)) {
                            monthsList.push({ year: y, month: m });
                        }

                        cur.setDate(cur.getDate() + 1);
                    }
                }
            }
        } else {
            // Tab 2: Rentang Periode
            if (periodMode === 'specific_month') {
                label = `Bulan ${MONTH_NAMES[targetSpecificMonth - 1]} ${targetSpecificMonthYear}`;
                suffix = `${MONTH_NAMES[targetSpecificMonth - 1]}_${targetSpecificMonthYear}`;
                monthsList.push({ year: targetSpecificMonthYear, month: targetSpecificMonth });
            } else if (periodMode === 'current_year') {
                label = `Tahun Sekarang (${currentActualYear})`;
                suffix = `Tahun_${currentActualYear}`;
                for (let m = 1; m <= 12; m++) {
                    monthsList.push({ year: currentActualYear, month: m });
                }
            } else if (periodMode === 'specific_year') {
                label = `Tahun ${targetSpecificYear}`;
                suffix = `Tahun_${targetSpecificYear}`;
                for (let m = 1; m <= 12; m++) {
                    monthsList.push({ year: targetSpecificYear, month: m });
                }
            } else if (periodMode === 'q1') {
                label = `Kuartal 1 (Q1) ${targetSpecificYear}`;
                suffix = `Q1_${targetSpecificYear}`;
                [1, 2, 3].forEach((m) => monthsList.push({ year: targetSpecificYear, month: m }));
            } else if (periodMode === 'q2') {
                label = `Kuartal 2 (Q2) ${targetSpecificYear}`;
                suffix = `Q2_${targetSpecificYear}`;
                [4, 5, 6].forEach((m) => monthsList.push({ year: targetSpecificYear, month: m }));
            } else if (periodMode === 'q3') {
                label = `Kuartal 3 (Q3) ${targetSpecificYear}`;
                suffix = `Q3_${targetSpecificYear}`;
                [7, 8, 9].forEach((m) => monthsList.push({ year: targetSpecificYear, month: m }));
            } else if (periodMode === 'q4') {
                label = `Kuartal 4 (Q4) ${targetSpecificYear}`;
                suffix = `Q4_${targetSpecificYear}`;
                [10, 11, 12].forEach((m) => monthsList.push({ year: targetSpecificYear, month: m }));
            } else if (periodMode === 's1') {
                label = `Semester 1 (S1) ${targetSpecificYear}`;
                suffix = `Semester1_${targetSpecificYear}`;
                [1, 2, 3, 4, 5, 6].forEach((m) => monthsList.push({ year: targetSpecificYear, month: m }));
            } else if (periodMode === 's2') {
                label = `Semester 2 (S2) ${targetSpecificYear}`;
                suffix = `Semester2_${targetSpecificYear}`;
                [7, 8, 9, 10, 11, 12].forEach((m) => monthsList.push({ year: targetSpecificYear, month: m }));
            }

            // Populate entries for all months in monthsList
            monthsList.forEach(({ year: y, month: m }) => {
                const daysCount = new Date(y, m, 0).getDate();
                for (let d = 1; d <= daysCount; d++) {
                    const dateKey = `${y}-${m}-${d}`;
                    const dateObj = new Date(y, m - 1, d);
                    const data = daysState[dateKey] || defaultDayData;
                    entries.push({
                        day: d,
                        month: m,
                        year: y,
                        dateKey,
                        dayName: INDONESIAN_DAYS[dateObj.getDay()],
                        data,
                    });
                }
            });
        }

        return {
            filteredEntries: entries,
            rangeLabel: label,
            filenameSuffix: suffix,
            monthsToInclude: monthsList,
        };
    }, [
        activeTab,
        startDate,
        endDate,
        periodMode,
        targetSpecificMonth,
        targetSpecificMonthYear,
        targetSpecificYear,
        defaultMonth,
        defaultYear,
        currentActualYear,
        daysState,
    ]);

    // 1. Export to PDF
    const handleExportPDF = async () => {
        try {
            setExportLoading('pdf');
            const blob = await generateSchedulePdf({
                daysState,
                filteredEntries,
                rangeLabel,
                filenameSuffix,
                daftarLibur,
                monthsToInclude,
            });

            const res = await saveFileWithDialog({
                blob,
                filename: `Jadwal_Kerja_${filenameSuffix}.pdf`,
                description: 'Dokumen PDF Laporan Jadwal',
                mimeType: 'application/pdf',
                extension: 'pdf',
            });

            if (res.success) {
                setExportSuccess('pdf');
                setTimeout(() => setExportSuccess(null), 2500);
                if (res.message) onShowToast(res.message);
                setIsOpen(false);
            }
        } catch (e: any) {
            console.error('Export PDF failed:', e);
            onShowToast(`Gagal mengekspor PDF: ${e?.message || 'Kesalahan'}`);
        } finally {
            setExportLoading(null);
        }
    };

    // 2. Export to PNG
    const handleExportPNG = async () => {
        try {
            setExportLoading('png');
            // Determine primary month for PNG
            const target = monthsToInclude.length > 0 ? monthsToInclude[0] : { year: defaultYear, month: defaultMonth };
            const mName = MONTH_NAMES[target.month - 1];

            const blob = await getCalendarPngBlob({
                daysState,
                year: target.year,
                month: target.month,
                monthName: mName,
                daftarLibur,
            });

            const res = await saveFileWithDialog({
                blob,
                filename: `Tampilan_Kalender_${mName}_${target.year}.png`,
                description: 'Gambar PNG Kalender',
                mimeType: 'image/png',
                extension: 'png',
            });

            if (res.success) {
                setExportSuccess('png');
                setTimeout(() => setExportSuccess(null), 2500);
                if (res.message) onShowToast(res.message);
                setIsOpen(false);
            }
        } catch (e: any) {
            console.error('Export PNG failed:', e);
            onShowToast(`Gagal mengekspor gambar PNG: ${e?.message || 'Kesalahan'}`);
        } finally {
            setExportLoading(null);
        }
    };

    // 3. Export to Excel (.xlsx)
    const handleExportExcel = async () => {
        try {
            setExportLoading('xlsx');
            const rows = filteredEntries.map((item) => {
                const { day, month, year: y, dayName, data } = item;
                return {
                    Tanggal: `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${y}`,
                    Hari: dayName,
                    Shift: normalizeShift(data.shift) || '-',
                    'Jam Masuk': data.jamMasuk || '-',
                    'Jam Pulang': data.jamPulang || '-',
                    'Absen Ceisa': data.absenCeisa || '-',
                    Catatan: data.note || '',
                };
            });

            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, `Jadwal_${filenameSuffix.slice(0, 28)}`);

            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const res = await saveFileWithDialog({
                blob,
                filename: `Jadwal_Shift_${filenameSuffix}.xlsx`,
                description: 'Excel Spreadsheet',
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                extension: 'xlsx',
            });

            if (res.success) {
                setExportSuccess('xlsx');
                setTimeout(() => setExportSuccess(null), 2500);
                if (res.message) onShowToast(res.message);
                setIsOpen(false);
            }
        } catch (e: any) {
            console.error('Export Excel failed:', e);
            onShowToast(`Gagal mengekspor Excel: ${e?.message || 'Kesalahan'}`);
        } finally {
            setExportLoading(null);
        }
    };

    // 4. Export to JSON (.json)
    const handleExportJSON = async () => {
        try {
            setExportLoading('json');
            const exportPayload: Record<string, DayData> = {};
            filteredEntries.forEach((item) => {
                exportPayload[item.dateKey] = item.data;
            });

            const jsonStr = JSON.stringify(
                {
                    exportedAt: new Date().toISOString(),
                    rangeLabel,
                    totalDays: filteredEntries.length,
                    days: exportPayload,
                },
                null,
                2
            );

            const blob = new Blob([jsonStr], { type: 'application/json' });
            const res = await saveFileWithDialog({
                blob,
                filename: `Backup_Jadwal_Shift_${filenameSuffix}.json`,
                description: 'JSON Backup Data',
                mimeType: 'application/json',
                extension: 'json',
            });

            if (res.success) {
                setExportSuccess('json');
                setTimeout(() => setExportSuccess(null), 2500);
                if (res.message) onShowToast(res.message);
                setIsOpen(false);
            }
        } catch (e: any) {
            console.error('Export JSON failed:', e);
            onShowToast(`Gagal mengekspor JSON: ${e?.message || 'Kesalahan'}`);
        } finally {
            setExportLoading(null);
        }
    };

    const isWinamp = currentTheme === 'winamp';
    const isVista = currentTheme === 'vista';
    const isDark = currentTheme === 'dark' || currentTheme === 'darkFluid';

    return (
        <div className={`relative inline-block ${isOpen ? 'z-[9999]' : 'z-20'}`} ref={dropdownRef}>
            {/* Click-outside backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[9998]"
                    onClick={() => {
                        setIsOpen(false);
                        setIsSelectorOpen(false);
                    }}
                />
            )}

            {/* Primary Action Button to Open Export Modal */}
            <Tooltip
                content={<span><strong>Ekspor Data</strong> Kalender & Laporan</span>}
                placement="bottom"
            >
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={buttonClass || 'h-8 sm:h-9 flex items-center justify-center gap-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs'}
                    aria-label="Menu Ekspor Data"
                    aria-expanded={isOpen}
                >
                    <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="hidden sm:inline text-xs font-bold">Ekspor</span>
                </button>
            </Tooltip>

            {/* Main Export Dialog Popup */}
            {isOpen && (
                <div
                    className={`absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-md rounded-2xl p-3.5 sm:p-4 shadow-2xl border z-[9999] animate-in fade-in zoom-in-95 duration-100 origin-top-right select-none max-h-[88vh] overflow-y-auto ${
                        isWinamp
                            ? 'bg-black border-2 border-[#00FF00] font-mono text-[#00FF00]'
                            : isVista
                            ? 'bg-white/85 backdrop-blur-2xl border-white/90 text-slate-900 shadow-[0_20px_60px_rgba(14,116,224,0.3)] ring-1 ring-sky-300/40'
                            : isDark
                            ? 'bg-slate-900 border-slate-700 text-slate-100'
                            : 'bg-white border-slate-200 text-slate-900'
                    }`}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-current/10 mb-3">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                                <Download className="h-4 w-4" />
                            </div>
                            <div>
                                <span className="text-sm font-black block leading-none">Ekspor Jadwal</span>
                                <span className="text-[10px] opacity-60 font-semibold">Pilih periode dan format unduhan</span>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                            {filteredEntries.length} Hari
                        </span>
                    </div>

                    {/* ========================================================================= */}
                    {/* PEMILIHAN DATA YANG AKAN DIEKSPOR (DIATAS KOTAK-KOTAK TOMBOL EKSPOR)      */}
                    {/* ========================================================================= */}
                    <div className="mb-4">
                        <label className="text-[10.5px] font-black uppercase tracking-wider opacity-70 block mb-1.5">
                            Data yang Dipilih untuk Diekspor:
                        </label>

                        {/* Clickable Selector Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                                isSelectorOpen
                                    ? 'ring-2 ring-teal-500/40 border-teal-500/50 bg-teal-500/5'
                                    : 'border-current/15 hover:border-current/30 bg-current/5'
                            }`}
                        >
                            <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                                <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0">
                                    <Filter className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-xs font-bold truncate block text-teal-700 dark:text-teal-300">
                                        {rangeLabel}
                                    </span>
                                    <span className="text-[10px] opacity-60 truncate block font-medium">
                                        {activeTab === 'date_range' ? 'Kustom Rentang Tanggal' : 'Filter Periode Jadwal'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1 shrink-0">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-current/10">
                                    {isSelectorOpen ? 'Tutup' : 'Ubah'}
                                </span>
                                {isSelectorOpen ? (
                                    <ChevronUp className="h-4 w-4 opacity-70" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 opacity-70" />
                                )}
                            </div>
                        </button>

                        {/* Collapsible Dropdown Selection Menu with 2 Tabs */}
                        {isSelectorOpen && (
                            <div className="mt-2 p-3 rounded-xl border border-current/15 bg-current/[0.03] space-y-3 animate-in fade-in duration-150">
                                {/* 2 Tabs: Tab 1 (Rentang Tanggal) & Tab 2 (Rentang Periode) */}
                                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-current/10">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('date_range')}
                                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                                            activeTab === 'date_range'
                                                ? 'bg-teal-600 text-white shadow-xs'
                                                : 'opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <CalendarRange className="h-3.5 w-3.5" />
                                        <span>Rentang Tanggal</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('period_range')}
                                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                                            activeTab === 'period_range'
                                                ? 'bg-teal-600 text-white shadow-xs'
                                                : 'opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>Rentang Periode</span>
                                    </button>
                                </div>

                                {/* Tab 1 Content: Rentang Tanggal */}
                                {activeTab === 'date_range' && (
                                    <div className="space-y-2.5 pt-1">
                                        {/* Kotak Pilihan Rentang Tanggal & Preset */}
                                        <div className="p-2.5 rounded-xl border border-current/15 bg-current/[0.02] space-y-2.5">
                                            <div className="grid grid-cols-2 gap-2 relative z-30">
                                                <div>
                                                    <label className="text-[10px] font-bold opacity-75 block mb-1">Dari Tanggal</label>
                                                    <CustomDatePicker
                                                        value={startDate}
                                                        onChange={(val) => setStartDate(val)}
                                                        placeholder="Pilih tanggal mulai"
                                                        theme={currentTheme as any}
                                                        align="left"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold opacity-75 block mb-1">Sampai Tanggal</label>
                                                    <CustomDatePicker
                                                        value={endDate}
                                                        onChange={(val) => setEndDate(val)}
                                                        placeholder="Pilih tanggal akhir"
                                                        theme={currentTheme as any}
                                                        align="right"
                                                    />
                                                </div>
                                            </div>

                                            {/* Quick Preset Buttons */}
                                            <div className="flex items-center gap-1.5 pt-0.5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setStartDate(defaultStart);
                                                        setEndDate(defaultEnd);
                                                    }}
                                                    className="px-2.5 py-1 rounded-md text-[10.5px] font-bold border border-current/20 hover:bg-current/10 cursor-pointer transition-colors"
                                                >
                                                    Bulan Ini
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const now = new Date();
                                                        const start = new Date(now);
                                                        start.setDate(now.getDate() - 30);
                                                        setStartDate(start.toISOString().split('T')[0]);
                                                        setEndDate(now.toISOString().split('T')[0]);
                                                    }}
                                                    className="px-2.5 py-1 rounded-md text-[10.5px] font-bold border border-current/20 hover:bg-current/10 cursor-pointer transition-colors"
                                                >
                                                    30 Hari Terakhir
                                                </button>
                                            </div>
                                        </div>

                                        {/* Tombol Terapkan Pilihan di LUAR dan di BAWAH kotak rentang tanggal */}
                                        <div className="pt-1 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setIsSelectorOpen(false)}
                                                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95 flex items-center space-x-1.5"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                <span>Terapkan Pilihan ({filteredEntries.length} Hari)</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Tab 2 Content: Rentang Periode */}
                                {activeTab === 'period_range' && (
                                    <div className="space-y-2.5 pt-1">
                                        {/* 1. Dropdown bulan tertentu dengan pilihan tahun */}
                                        <div
                                            onClick={() => setPeriodMode('specific_month')}
                                            className={`p-2 rounded-lg border transition-all relative z-30 ${
                                                periodMode === 'specific_month'
                                                    ? 'border-teal-500 bg-teal-500/10'
                                                    : 'border-current/15 hover:bg-current/5'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-2 mb-1.5 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="period_choice"
                                                    checked={periodMode === 'specific_month'}
                                                    onChange={() => setPeriodMode('specific_month')}
                                                    className="accent-teal-600"
                                                />
                                                <span className="text-xs font-bold">Bulan & Tahun</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 pl-5 relative z-40">
                                                <CustomDropdown
                                                    value={targetSpecificMonth}
                                                    onChange={(val) => {
                                                        setPeriodMode('specific_month');
                                                        setTargetSpecificMonth(Number(val));
                                                    }}
                                                    options={MONTH_NAMES.map((name, i) => ({
                                                        value: i + 1,
                                                        label: name,
                                                    }))}
                                                    theme={currentTheme as any}
                                                    hideSelectedInList={false}
                                                />
                                                <CustomDropdown
                                                    value={targetSpecificMonthYear}
                                                    onChange={(val) => {
                                                        setPeriodMode('specific_month');
                                                        setTargetSpecificMonthYear(Number(val));
                                                    }}
                                                    options={[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => ({
                                                        value: y,
                                                        label: String(y),
                                                    }))}
                                                    theme={currentTheme as any}
                                                    hideSelectedInList={false}
                                                />
                                            </div>
                                        </div>

                                        {/* 2. Dropdown tahun tertentu */}
                                        <div
                                            onClick={() => setPeriodMode('specific_year')}
                                            className={`p-2 rounded-lg border transition-all relative z-20 ${
                                                periodMode === 'specific_year'
                                                    ? 'border-teal-500 bg-teal-500/10'
                                                    : 'border-current/15 hover:bg-current/5'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-2 mb-1.5 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="period_choice"
                                                    checked={periodMode === 'specific_year'}
                                                    onChange={() => setPeriodMode('specific_year')}
                                                    className="accent-teal-600"
                                                />
                                                <span className="text-xs font-bold">Tahun tertentu</span>
                                            </div>
                                            <div className="pl-5 relative z-30">
                                                <CustomDropdown
                                                    value={targetSpecificYear}
                                                    onChange={(val) => {
                                                        setPeriodMode('specific_year');
                                                        setTargetSpecificYear(Number(val));
                                                    }}
                                                    options={[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => ({
                                                        value: y,
                                                        label: String(y),
                                                    }))}
                                                    theme={currentTheme as any}
                                                    hideSelectedInList={false}
                                                />
                                            </div>
                                        </div>

                                        {/* 3. Folded isi pilihan grid 2x3: Q1, Q2, S1 / Q3, Q4, S2 */}
                                        <div className="pt-1 relative z-10">
                                            <button
                                                type="button"
                                                onClick={() => setIsFoldedGridOpen(!isFoldedGridOpen)}
                                                className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg bg-current/5 border border-current/15 text-xs font-bold cursor-pointer"
                                            >
                                                <span className="flex items-center space-x-1.5">
                                                    <CalendarDays className="h-3.5 w-3.5 text-teal-600" />
                                                    <span>Pilihan Kuartal & Semester ({targetSpecificYear})</span>
                                                </span>
                                                {isFoldedGridOpen ? (
                                                    <ChevronUp className="h-3.5 w-3.5 opacity-60" />
                                                ) : (
                                                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                                                )}
                                            </button>

                                            {isFoldedGridOpen && (
                                                <div className="grid grid-cols-3 gap-1.5 pt-2">
                                                    {/* Row 1: Q1, Q2, S1 */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setPeriodMode('q1')}
                                                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                                                            periodMode === 'q1'
                                                                ? 'bg-teal-600 text-white border-teal-700 font-bold shadow-xs'
                                                                : 'border-current/15 hover:bg-current/10 text-xs font-semibold'
                                                        }`}
                                                    >
                                                        <div className="text-xs font-black">Q1</div>
                                                        <div className="text-[9px] opacity-75">Jan - Mar</div>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPeriodMode('q2')}
                                                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                                                            periodMode === 'q2'
                                                                ? 'bg-teal-600 text-white border-teal-700 font-bold shadow-xs'
                                                                : 'border-current/15 hover:bg-current/10 text-xs font-semibold'
                                                        }`}
                                                    >
                                                        <div className="text-xs font-black">Q2</div>
                                                        <div className="text-[9px] opacity-75">Apr - Jun</div>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPeriodMode('s1')}
                                                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                                                            periodMode === 's1'
                                                                ? 'bg-teal-600 text-white border-teal-700 font-bold shadow-xs'
                                                                : 'border-current/15 hover:bg-current/10 text-xs font-semibold'
                                                        }`}
                                                    >
                                                        <div className="text-xs font-black">S1</div>
                                                        <div className="text-[9px] opacity-75">Sem 1 (6 Bln)</div>
                                                    </button>

                                                    {/* Row 2: Q3, Q4, S2 */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setPeriodMode('q3')}
                                                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                                                            periodMode === 'q3'
                                                                ? 'bg-teal-600 text-white border-teal-700 font-bold shadow-xs'
                                                                : 'border-current/15 hover:bg-current/10 text-xs font-semibold'
                                                        }`}
                                                    >
                                                        <div className="text-xs font-black">Q3</div>
                                                        <div className="text-[9px] opacity-75">Jul - Sep</div>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPeriodMode('q4')}
                                                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                                                            periodMode === 'q4'
                                                                ? 'bg-teal-600 text-white border-teal-700 font-bold shadow-xs'
                                                                : 'border-current/15 hover:bg-current/10 text-xs font-semibold'
                                                        }`}
                                                    >
                                                        <div className="text-xs font-black">Q4</div>
                                                        <div className="text-[9px] opacity-75">Okt - Des</div>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPeriodMode('s2')}
                                                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                                                            periodMode === 's2'
                                                                ? 'bg-teal-600 text-white border-teal-700 font-bold shadow-xs'
                                                                : 'border-current/15 hover:bg-current/10 text-xs font-semibold'
                                                        }`}
                                                    >
                                                        <div className="text-xs font-black">S2</div>
                                                        <div className="text-[9px] opacity-75">Sem 2 (6 Bln)</div>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Tombol Terapkan Pilihan di LUAR dan di BAWAH kotak pilihan kuartal */}
                                        <div className="pt-1 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setIsSelectorOpen(false)}
                                                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95 flex items-center space-x-1.5"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                <span>Terapkan Pilihan ({filteredEntries.length} Hari)</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ========================================================================= */}
                    {/* KOTAK-KOTAK TOMBOL EKSPOR (DILETAKKAN DI BAWAH PEMILIHAN DATA)            */}
                    {/* ========================================================================= */}
                    <div className="space-y-1.5">
                        <label className="text-[10.5px] font-black uppercase tracking-wider opacity-70 block mb-1">
                            Pilih Format Ekspor:
                        </label>

                        {/* Kotak 1: Ekspor ke PDF */}
                        <button
                            type="button"
                            disabled={exportLoading !== null}
                            onClick={handleExportPDF}
                            className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl text-xs font-bold transition-all cursor-pointer bg-rose-500/10 hover:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-500/20 disabled:opacity-50 text-left"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div>
                                    <span className="font-extrabold text-xs sm:text-sm block leading-tight">
                                        Ekspor ke PDF (.pdf)
                                    </span>
                                    <span className="text-[10px] opacity-70 block font-normal">
                                        Dokumen laporan visual & tabel jadwal siap cetak
                                    </span>
                                </div>
                            </div>
                            {exportLoading === 'pdf' ? (
                                <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                            ) : exportSuccess === 'pdf' ? (
                                <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <Download className="h-4 w-4 opacity-60" />
                            )}
                        </button>

                        {/* Kotak 2: Ekspor ke PNG */}
                        <button
                            type="button"
                            disabled={exportLoading !== null}
                            onClick={handleExportPNG}
                            className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl text-xs font-bold transition-all cursor-pointer bg-sky-500/10 hover:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-500/20 disabled:opacity-50 text-left"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400 shrink-0">
                                    <ImageIcon className="h-4 w-4" />
                                </div>
                                <div>
                                    <span className="font-extrabold text-xs sm:text-sm block leading-tight">
                                        Ekspor ke PNG (.png)
                                    </span>
                                    <span className="text-[10px] opacity-70 block font-normal">
                                        Gambar kalender resolusi tinggi HD
                                    </span>
                                </div>
                            </div>
                            {exportLoading === 'png' ? (
                                <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                            ) : exportSuccess === 'png' ? (
                                <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <Download className="h-4 w-4 opacity-60" />
                            )}
                        </button>

                        {/* Kotak 3: Ekspor ke Excel (.xlsx) */}
                        <button
                            type="button"
                            disabled={exportLoading !== null}
                            onClick={handleExportExcel}
                            className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl text-xs font-bold transition-all cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 disabled:opacity-50 text-left"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <FileSpreadsheet className="h-4 w-4" />
                                </div>
                                <div>
                                    <span className="font-extrabold text-xs sm:text-sm block leading-tight">
                                        Ekspor ke Excel (.xlsx)
                                    </span>
                                    <span className="text-[10px] opacity-70 block font-normal">
                                        Spreadsheet data jadwal lengkap & catatan
                                    </span>
                                </div>
                            </div>
                            {exportLoading === 'xlsx' ? (
                                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                            ) : exportSuccess === 'xlsx' ? (
                                <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <Download className="h-4 w-4 opacity-60" />
                            )}
                        </button>

                        {/* Kotak 4: Ekspor ke JSON (.json) */}
                        <button
                            type="button"
                            disabled={exportLoading !== null}
                            onClick={handleExportJSON}
                            className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl text-xs font-bold transition-all cursor-pointer bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-500/20 disabled:opacity-50 text-left"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0">
                                    <Code className="h-4 w-4" />
                                </div>
                                <div>
                                    <span className="font-extrabold text-xs sm:text-sm block leading-tight">
                                        Ekspor ke JSON (.json)
                                    </span>
                                    <span className="text-[10px] opacity-70 block font-normal">
                                        Cadangan lengkap data jadwal untuk pemulihan
                                    </span>
                                </div>
                            </div>
                            {exportLoading === 'json' ? (
                                <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                            ) : exportSuccess === 'json' ? (
                                <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <Download className="h-4 w-4 opacity-60" />
                            )}
                        </button>
                    </div>

                    {/* Footer Tip */}
                    <div className="pt-3 mt-3 border-t border-current/10 text-center">
                        <span className="text-[10px] opacity-60 font-medium">
                            📁 File akan disimpan langsung ke sistem Anda menggunakan dialog penyimpanan resmi.
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
