import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    Calendar as CalendarIcon,
    X,
    Check,
    Plus,
    Trash2,
    Sparkles,
    Upload,
    FileText,
    AlertCircle,
    Copy,
    Download,
    Info,
    ChevronDown,
    Search,
    ArrowRight,
    Eye,
    EyeOff,
    Flag,
} from 'lucide-react';
import { getIndonesianHoliday } from '../data/holidays';
import { AppTheme, LiburNasional, HolidayCategory, resolveHolidayCategory } from '../types';
import { CustomDatePicker } from './CustomDatePicker';

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const formatTanggalIndo = (tglIso: string): string => {
    if (!tglIso) return '';
    const parts = tglIso.split('-');
    if (parts.length !== 3) return tglIso;
    const day = parseInt(parts[2], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const year = parts[0];
    const monthName = MONTH_NAMES[monthIdx] || parts[1];
    return `${day} ${monthName} ${year}`;
};

interface HolidayManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedMonth: number;
    selectedYear: number;
    monthName: string;
    daftarLibur: LiburNasional[];
    onAddLibur: (tanggal: string, keterangan: string, kategori?: string) => Promise<boolean>;
    onDeleteLibur: (tanggal: string) => Promise<boolean>;
    onToggleDisableLibur?: (tanggal: string) => Promise<boolean>;
    onRefreshLibur?: () => Promise<void>;
    isCloudConnected?: boolean;
    theme?: AppTheme;
    isPageView?: boolean;
}

export const HolidayManagerModal: React.FC<HolidayManagerModalProps> = ({
    isOpen,
    onClose,
    selectedMonth,
    selectedYear,
    daftarLibur,
    onAddLibur,
    onDeleteLibur,
    onToggleDisableLibur,
    theme = 'default',
    isPageView = false,
}) => {
    const isWinamp = theme === 'winamp';
    const isDarkFluid = theme === 'darkFluid';
    const isDark = theme === 'dark';
    const isVista = theme === 'vista';
    const isLightMode = theme === 'default' || isVista;

    // Current running year (tahun berjalan secara otomatis)
    const currentRunningYear = useMemo(() => new Date().getFullYear(), []);
    const [activeYear, setActiveYear] = useState<number>(() => selectedYear || currentRunningYear);

    // Year Dropdown / Search Popover state
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState<boolean>(false);
    const [yearSearchQuery, setYearSearchQuery] = useState<string>('');
    const yearDropdownRef = useRef<HTMLDivElement>(null);
    const activeYearBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (selectedYear) {
            setActiveYear(selectedYear);
        }
    }, [selectedYear]);

    // Close year dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
                setIsYearDropdownOpen(false);
                setYearSearchQuery('');
            }
        };
        if (isYearDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isYearDropdownOpen]);

    // Auto-scroll to selected year button when opened
    useEffect(() => {
        if (isYearDropdownOpen) {
            setTimeout(() => {
                activeYearBtnRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }, 60);
        }
    }, [isYearDropdownOpen]);

    // Comprehensive list of years (1970 - 2060)
    const allYears = useMemo(() => {
        const years: number[] = [];
        for (let y = 1970; y <= 2060; y++) {
            years.push(y);
        }
        return years;
    }, []);

    // Filter years by search query
    const filteredYears = useMemo(() => {
        const query = yearSearchQuery.trim();
        if (!query) return allYears;
        return allYears.filter((y) => String(y).includes(query));
    }, [allYears, yearSearchQuery]);

    const parsedQueryYear = parseInt(yearSearchQuery.trim(), 10);
    const isDirectCustomYearValid =
        !isNaN(parsedQueryYear) &&
        parsedQueryYear >= 1900 &&
        parsedQueryYear <= 2200 &&
        !filteredYears.includes(parsedQueryYear);

    const [customDate, setCustomDate] = useState<string>(() => {
        const mStr = String(selectedMonth).padStart(2, '0');
        return `${selectedYear || currentRunningYear}-${mStr}-01`;
    });
    const [customName, setCustomName] = useState<string>('');
    const [categoryOption, setCategoryOption] = useState<'libur_nasional' | 'cuti_bersama' | 'lainnya'>('libur_nasional');
    const [customCategoryName, setCustomCategoryName] = useState<string>('');

    const [isCsvPanelOpen, setIsCsvPanelOpen] = useState<boolean>(false);
    const [csvRawText, setCsvRawText] = useState<string>('');
    const [importStatusMessage, setImportStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [hasCopiedExample, setHasCopiedExample] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const csvTextareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-adjust textarea height according to pasted lines
    useEffect(() => {
        if (csvTextareaRef.current) {
            csvTextareaRef.current.style.height = 'auto';
            const scrollH = csvTextareaRef.current.scrollHeight;
            csvTextareaRef.current.style.height = `${Math.min(Math.max(scrollH, 76), 280)}px`;
        }
    }, [csvRawText, isCsvPanelOpen]);

    // Count candidate valid lines from pasted text
    const parsedLineCount = useMemo(() => {
        if (!csvRawText.trim()) return 0;
        const lines = csvRawText.replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean);
        return lines.filter((line) => {
            const lower = line.toLowerCase();
            return !lower.includes('tanggal') && !lower.includes('yyyy') && !(lower.includes('date') && lower.includes('holiday'));
        }).length;
    }, [csvRawText]);

    useEffect(() => {
        const mStr = String(selectedMonth).padStart(2, '0');
        setCustomDate(`${activeYear}-${mStr}-01`);
    }, [selectedMonth, activeYear]);

    // Daftar semua hari libur yang aktif/tersimpan untuk tahun yang dipilih
    const yearItems = useMemo(() => {
        const items: {
            day: number;
            month: number;
            monthName: string;
            tanggalIso: string;
            keterangan: string;
            kategori?: string;
            isCutiBersama?: boolean;
            isSavedInCloud: boolean;
            isOfficial: boolean;
            isDisabled: boolean;
        }[] = [];

        const registeredDates = new Set<string>();

        (daftarLibur || []).forEach((item) => {
            if (!item.tanggal) return;
            const parts = item.tanggal.split('-');
            if (parts.length === 3 && Number(parts[0]) === activeYear) {
                const m = Number(parts[1]);
                const d = Number(parts[2]);
                const paddedM = String(m).padStart(2, '0');
                const paddedD = String(d).padStart(2, '0');
                const iso = `${activeYear}-${paddedM}-${paddedD}`;

                if (!registeredDates.has(iso)) {
                    registeredDates.add(iso);
                    registeredDates.add(item.tanggal);
                    const isCuti = item.keterangan?.toLowerCase().includes('cuti') || item.isCutiBersama;
                    items.push({
                        day: d,
                        month: m,
                        monthName: MONTH_NAMES[m - 1] || `Bulan ${m}`,
                        tanggalIso: iso,
                        keterangan: item.keterangan || 'Hari Libur',
                        kategori: item.kategori || (isCuti ? 'cuti_bersama' : 'libur_nasional'),
                        isCutiBersama: Boolean(isCuti),
                        isSavedInCloud: true,
                        isOfficial: Boolean(getIndonesianHoliday(activeYear, m, d)),
                        isDisabled: Boolean(item.isDisabled),
                    });
                }
            }
        });

        return items.sort((a, b) => a.tanggalIso.localeCompare(b.tanggalIso));
    }, [activeYear, daftarLibur]);

    // Auto-Terapkan semua libur resmi sepanjang tahun ke daftarLibur
    const handleApplyAllOfficial = async () => {
        setIsProcessing(true);
        let count = 0;
        for (let m = 1; m <= 12; m++) {
            const daysInM = new Date(activeYear, m, 0).getDate();
            for (let d = 1; d <= daysInM; d++) {
                const officialHoliday = getIndonesianHoliday(activeYear, m, d);
                if (officialHoliday) {
                    const paddedM = String(m).padStart(2, '0');
                    const paddedD = String(d).padStart(2, '0');
                    const tanggalIso = `${activeYear}-${paddedM}-${paddedD}`;
                    const alreadyExists = (daftarLibur || []).some((item) => item.tanggal === tanggalIso);
                    if (!alreadyExists) {
                        const isCuti = officialHoliday.toLowerCase().includes('cuti');
                        const kat = isCuti ? 'cuti_bersama' : 'libur_nasional';
                        const success = await onAddLibur(tanggalIso, officialHoliday, kat);
                        if (success) count++;
                    }
                }
            }
        }
        setIsProcessing(false);
        setImportStatusMessage({
            text: count > 0
                ? `Berhasil menerapkan & menyimpan ${count} hari libur resmi untuk tahun ${activeYear}.`
                : `Semua libur resmi tahun ${activeYear} sudah tersimpan sebelumnya.`,
        });
        setTimeout(() => setImportStatusMessage(null), 4000);
    };

    // Tambah Libur Tunggal
    const handleAddCustom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customDate) return;

        setIsProcessing(true);
        const ket = customName.trim() || 'Hari Libur';

        let targetCategory: string = categoryOption;
        if (categoryOption === 'lainnya') {
            targetCategory = customCategoryName.trim() || 'Lainnya';
        }

        const success = await onAddLibur(customDate, ket, targetCategory);
        setIsProcessing(false);

        if (success) {
            setImportStatusMessage({ text: `Libur "${ket}" (${targetCategory}) pada ${customDate} berhasil ditambahkan!` });
            setCustomName('');
            setCustomCategoryName('');
        } else {
            setImportStatusMessage({ text: `Gagal menambahkan libur.`, isError: true });
        }
        setTimeout(() => setImportStatusMessage(null), 4000);
    };

    const [itemToDelete, setItemToDelete] = useState<{ tanggal: string; keterangan: string } | null>(null);
    const [isConfirmingClearAll, setIsConfirmingClearAll] = useState<boolean>(false);
    const [clearAllConfirmInput, setClearAllConfirmInput] = useState<string>('');

    // Hapus Libur secara absolut setelah konfirmasi
    const handleConfirmDeleteItem = async () => {
        if (!itemToDelete) return;
        const { tanggal, keterangan } = itemToDelete;
        setItemToDelete(null);
        setIsProcessing(true);
        const success = await onDeleteLibur(tanggal);
        setIsProcessing(false);
        if (success) {
            setImportStatusMessage({ text: `Libur "${keterangan}" (${tanggal}) berhasil dihapus secara permanen.` });
        } else {
            setImportStatusMessage({ text: `Gagal menghapus libur.`, isError: true });
        }
        setTimeout(() => setImportStatusMessage(null), 3000);
    };

    // Hapus semua libur tahun ini dari daftarLibur setelah konfirmasi pengetikan HAPUS
    const handleConfirmClearYearHolidays = async () => {
        if (yearItems.length === 0 || clearAllConfirmInput.trim() !== 'HAPUS') {
            setIsConfirmingClearAll(false);
            setClearAllConfirmInput('');
            return;
        }

        setIsConfirmingClearAll(false);
        setClearAllConfirmInput('');
        setIsProcessing(true);
        let deletedCount = 0;
        for (const item of yearItems) {
            const success = await onDeleteLibur(item.tanggalIso);
            if (success) deletedCount++;
        }
        setIsProcessing(false);
        setImportStatusMessage({ text: `${deletedCount} hari libur pada tahun ${activeYear} telah dihapus.` });
        setTimeout(() => setImportStatusMessage(null), 3500);
    };

    // Parse CSV
    const parseAndApplyCsvData = async (text: string) => {
        if (!text || !text.trim()) {
            setImportStatusMessage({ text: 'Teks CSV kosong.', isError: true });
            return;
        }

        const lines = text.replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean);
        let parsedCount = 0;
        setIsProcessing(true);

        for (const line of lines) {
            const lower = line.toLowerCase();
            if (
                lower.includes('tanggal') ||
                lower.includes('yyyy') ||
                lower.includes('tahun') ||
                lower.includes('date') ||
                (lower.includes('holiday') && lower.includes('name'))
            ) {
                continue;
            }

            let parts: string[] = [];
            if (line.includes('\t')) {
                parts = line.split('\t').map((p) => p.replace(/^["']|["']$/g, '').trim());
            } else if (line.includes(';')) {
                parts = line.split(';').map((p) => p.replace(/^["']|["']$/g, '').trim());
            } else {
                parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((p) => p.replace(/^["']|["']$/g, '').trim());
            }

            if (parts.length >= 1) {
                const rawDate = parts[0];
                const keterangan = parts[1] || 'Hari Libur';
                let kategori = parts[2] || '';

                if (!kategori) {
                    kategori = keterangan.toLowerCase().includes('cuti') ? 'cuti_bersama' : 'libur_nasional';
                }

                let y: number | null = null;
                let m: string | null = null;
                let d: string | null = null;

                // Format YYYY-MM-DD / YYYY/MM/DD / YYYY.MM.DD
                const isoMatch = rawDate.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
                if (isoMatch) {
                    y = parseInt(isoMatch[1], 10);
                    m = String(parseInt(isoMatch[2], 10)).padStart(2, '0');
                    d = String(parseInt(isoMatch[3], 10)).padStart(2, '0');
                } else {
                    // Format DD-MM-YYYY / DD/MM/YYYY / DD.MM.YYYY
                    const idMatch = rawDate.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
                    if (idMatch) {
                        y = parseInt(idMatch[3], 10);
                        m = String(parseInt(idMatch[2], 10)).padStart(2, '0');
                        d = String(parseInt(idMatch[1], 10)).padStart(2, '0');
                    }
                }

                if (y && m && d) {
                    const tanggalIso = `${y}-${m}-${d}`;
                    const success = await onAddLibur(tanggalIso, keterangan, kategori);
                    if (success) parsedCount++;
                }
            }
        }

        setIsProcessing(false);

        if (parsedCount > 0) {
            setImportStatusMessage({ text: `Berhasil mengimpor & menyimpan ${parsedCount} data hari libur dari CSV!` });
            setCsvRawText('');
            setTimeout(() => setImportStatusMessage(null), 4500);
        } else {
            setImportStatusMessage({
                text: 'Format CSV tidak dikenali. Format yang didukung: YYYY-MM-DD,Keterangan,Kategori atau DD/MM/YYYY,Keterangan',
                isError: true,
            });
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
                parseAndApplyCsvData(content);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const SAMPLE_CSV_CONTENT = `Tanggal,Keterangan,Kategori\n${activeYear}-01-01,Tahun Baru ${activeYear} Masehi,Libur Nasional\n${activeYear}-02-16,Cuti Bersama Tahun Baru Imlek,Cuti Bersama\n${activeYear}-08-17,Hari Kemerdekaan Republik Indonesia,Libur Nasional\n${activeYear}-12-31,Libur Khusus Akhir Tahun,Lainnya`;

    const handleCopySampleCsv = () => {
        navigator.clipboard.writeText(SAMPLE_CSV_CONTENT);
        setHasCopiedExample(true);
        setTimeout(() => setHasCopiedExample(false), 2500);
    };

    const handleDownloadSampleCsv = () => {
        const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `template_libur_nasional_${activeYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Sleek and minimal category badge color with dark-theme adaptation
    const getCategoryBadgeClass = (categoryInfo: { category: HolidayCategory; label: string; isCustom: boolean }) => {
        if (categoryInfo.category === 'cuti_bersama') {
            return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40';
        }
        if (categoryInfo.category === 'lainnya' || categoryInfo.isCustom) {
            return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40';
        }
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/40';
    };

    // Accent button background for Primary Actions
    const getAccentButtonClass = () => {
        if (isWinamp) return 'bg-[#00FF00] text-black hover:bg-emerald-400 font-mono shadow-xs';
        if (isDarkFluid) return 'bg-[#D0BCFF] text-[#381E72] hover:bg-[#E8DEF8] shadow-xs';
        if (isDark) return 'bg-teal-600 hover:bg-teal-500 text-white shadow-xs';
        if (isVista) return 'bg-gradient-to-b from-[#4facfe] via-[#00a2ff] to-[#0072ff] text-white shadow-xs';
        return 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs';
    };

    const content = (
        <div
            className={`rounded-2xl p-6 sm:p-8 space-y-7 font-sans shadow-sm transition-colors border ${
                isWinamp
                    ? 'bg-[#191919] text-[#00FF00] font-mono border-2 border-zinc-700 shadow-[2px_2px_0_#000]'
                    : isDarkFluid
                    ? 'bg-[#1D1B20] text-[#E6E0E9] border-white/10'
                    : isDark
                    ? 'bg-[#1E1E1E] text-[#E0E0E0] border-slate-800'
                    : isVista
                    ? 'bg-white/95 backdrop-blur-md text-slate-900 border-sky-200'
                    : 'bg-white text-slate-800 border-slate-200/70'
            }`}
        >
            {/* 1. Header Minimalis & Elegan */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/70 dark:border-slate-800">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/50 text-rose-500 shrink-0">
                            <Flag className="h-5 w-5 fill-rose-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                            Daftar Hari Libur
                        </h2>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700">
                            {activeYear}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                        Kelola hari libur resmi nasional, cuti bersama, dan penanggalan merah kalender kerja.
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                    {/* Modern & Searchable Year Selector Dropdown */}
                    <div className="relative" ref={yearDropdownRef}>
                        <button
                            type="button"
                            onClick={() => {
                                setIsYearDropdownOpen((prev) => !prev);
                                setYearSearchQuery('');
                            }}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[5px] border text-xs font-medium transition-all duration-300 cursor-pointer ${
                                isYearDropdownOpen
                                    ? 'bg-teal-50 dark:bg-[#323741] border-teal-400 text-teal-800 dark:text-white ring-2 ring-teal-500/10'
                                    : 'bg-slate-100/90 hover:bg-slate-200/80 dark:bg-[#2a2f3b] dark:hover:bg-[#323741] border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-white'
                            }`}
                            title="Pilih atau cari tahun"
                        >
                            <span className="text-slate-400 dark:text-slate-400 font-normal">Tahun:</span>
                            <span className="font-semibold text-slate-900 dark:text-white">{activeYear}</span>
                            {activeYear === currentRunningYear && (
                                <span className="text-[10px] bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 px-1.5 py-0.5 rounded-md font-normal leading-none border border-teal-200/50 dark:border-teal-700/50">
                                    Tahun Ini
                                </span>
                            )}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                className={`w-3 h-3 ml-0.5 shrink-0 transition-transform duration-300 ease-in-out ${
                                    isYearDropdownOpen ? 'rotate-0' : '-rotate-90'
                                } opacity-80`}
                                fill="currentColor"
                            >
                                <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
                            </svg>
                        </button>

                        {/* Dropdown Popover */}
                        {isYearDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-[#2a2f3b] rounded-[5px] shadow-xl border border-slate-200 dark:border-slate-700 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                {/* Search input */}
                                <div className="relative mb-2.5">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="Cari atau ketik tahun..."
                                        value={yearSearchQuery}
                                        onChange={(e) => setYearSearchQuery(e.target.value)}
                                        autoFocus
                                        className="w-full bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 pl-8 pr-7 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-850 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                                    />
                                    {yearSearchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setYearSearchQuery('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>

                                {/* Quick Shortcuts */}
                                <div className="flex items-center gap-1.5 pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar text-[11px]">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveYear(currentRunningYear);
                                            setIsYearDropdownOpen(false);
                                            setYearSearchQuery('');
                                        }}
                                        className={`shrink-0 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                            activeYear === currentRunningYear
                                                ? 'bg-teal-600 text-white font-medium shadow-xs'
                                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300'
                                        }`}
                                    >
                                        Tahun Berjalan ({currentRunningYear})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveYear((prev) => prev - 1);
                                            setIsYearDropdownOpen(false);
                                            setYearSearchQuery('');
                                        }}
                                        className="shrink-0 px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                                    >
                                        -1 Thn
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveYear((prev) => prev + 1);
                                            setIsYearDropdownOpen(false);
                                            setYearSearchQuery('');
                                        }}
                                        className="shrink-0 px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                                    >
                                        +1 Thn
                                    </button>
                                </div>

                                {/* Direct Custom Year Option */}
                                {isDirectCustomYearValid && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveYear(parsedQueryYear);
                                            setIsYearDropdownOpen(false);
                                            setYearSearchQuery('');
                                        }}
                                        className="w-full mb-2 flex items-center justify-between px-3 py-2 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-200 text-xs rounded-xl font-medium transition-colors cursor-pointer border border-teal-200/60 dark:border-teal-700/60"
                                    >
                                        <span>Gunakan tahun <strong>{parsedQueryYear}</strong></span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                )}

                                {/* Scrollable Year Grid */}
                                <div className="max-h-52 overflow-y-auto pr-1 grid grid-cols-4 gap-1.5">
                                    {filteredYears.length === 0 && !isDirectCustomYearValid ? (
                                        <div className="col-span-4 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                                            Tahun tidak ditemukan
                                        </div>
                                    ) : (
                                        filteredYears.map((yr) => {
                                            const isSelected = yr === activeYear;
                                            const isCurrent = yr === currentRunningYear;
                                            return (
                                                <button
                                                    key={yr}
                                                    ref={isSelected ? activeYearBtnRef : undefined}
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveYear(yr);
                                                        setIsYearDropdownOpen(false);
                                                        setYearSearchQuery('');
                                                    }}
                                                    className={`relative p-[5px] rounded-[5px] text-xs text-center transition-all duration-300 cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-teal-600 text-white font-semibold shadow-xs'
                                                            : isCurrent
                                                            ? 'bg-teal-50 dark:bg-[#323741] text-teal-800 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-[#3e4452] font-medium border border-teal-200/60 dark:border-teal-800'
                                                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#323741] font-normal'
                                                    }`}
                                                >
                                                    {yr}
                                                    {isCurrent && !isSelected && (
                                                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-teal-500 rounded-full" />
                                                    )}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {!isPageView && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            aria-label="Tutup"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Status Feedback Message */}
            {importStatusMessage && (
                <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 border animate-in fade-in duration-150 ${
                    importStatusMessage.isError
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/50'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50'
                }`}>
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{importStatusMessage.text}</span>
                </div>
            )}

            {/* 2-Column Responsive Layout: Left = Main Holiday List, Right = Sidebar (Tambah Libur & Auto-Terapkan) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Kolom Kiri / Utama (7 cols): Daftar Hari Libur Terdaftar */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                Daftar Hari Libur {activeYear}
                            </h3>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                {yearItems.length} hari
                            </span>
                        </div>

                        {yearItems.some((h) => h.isSavedInCloud) && (
                            <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => {
                                    setClearAllConfirmInput('');
                                    setIsConfirmingClearAll(true);
                                }}
                                className="btn-glitch-delete px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors shadow-2xs"
                                data-text="Hapus Semua"
                            >
                                <Trash2 className="h-3.5 w-3.5 relative z-10" />
                                <span className="relative z-10">Hapus Semua</span>
                            </button>
                        )}
                    </div>

                    {yearItems.length === 0 ? (
                        <div className="py-16 text-center text-xs text-slate-400 dark:text-slate-500 font-medium bg-slate-50/50 dark:bg-slate-850/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                            Tidak ada hari libur tersimpan untuk tahun {activeYear}.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[60vh] overflow-y-auto pr-1">
                            {yearItems.map((item, idx) => {
                                const catInfo = resolveHolidayCategory({
                                    keterangan: item.keterangan,
                                    kategori: item.kategori,
                                    isCutiBersama: item.isCutiBersama
                                });

                                return (
                                    <div
                                        key={`${item.tanggalIso}-${item.keterangan || ''}-${idx}`}
                                        className={`flex items-center justify-between py-3 px-2 rounded-xl transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${
                                            item.isDisabled ? 'opacity-50 bg-slate-50/40 dark:bg-slate-850/40' : ''
                                        }`}
                                    >
                                        {/* Kolom 1: Tanggal Minimalis & Ikon */}
                                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                                            <div className={`flex flex-col items-center justify-center w-10 py-1 text-center shrink-0 rounded-lg border ${
                                                item.isDisabled
                                                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-900/40 text-rose-600 dark:text-rose-400'
                                            }`}>
                                                <span className="text-[9px] font-bold uppercase tracking-wider block leading-tight">
                                                    {item.monthName.substring(0, 3)}
                                                </span>
                                                <span className="text-sm font-black block leading-tight">
                                                    {item.day}
                                                </span>
                                            </div>

                                            {/* Kolom 2: Nama Libur & Keterangan */}
                                            <div className="min-w-0 flex-1 space-y-0.5">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <p className={`text-xs font-bold text-slate-900 dark:text-slate-100 truncate ${
                                                        item.isDisabled ? 'line-through text-slate-400 dark:text-slate-500' : ''
                                                    }`} title={item.keterangan}>
                                                        {item.keterangan}
                                                    </p>
                                                    <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold ${getCategoryBadgeClass(catInfo)}`}>
                                                        {catInfo.label}
                                                    </span>
                                                    {item.isDisabled && (
                                                        <span className="text-[9px] px-1.5 py-0.2 rounded-md font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                                            Nonaktif
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                                                    {formatTanggalIndo(item.tanggalIso)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Kolom 3: Action Buttons (Toggle Nonaktifkan + Hapus) */}
                                        <div className="flex items-center space-x-1 shrink-0 ml-2">
                                            {onToggleDisableLibur && (
                                                <button
                                                    type="button"
                                                    disabled={isProcessing}
                                                    onClick={() => onToggleDisableLibur(item.tanggalIso)}
                                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                                        item.isDisabled
                                                            ? 'text-amber-500 hover:text-amber-600 bg-amber-500/10 hover:bg-amber-500/20'
                                                            : 'text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                                    }`}
                                                    title={item.isDisabled ? 'Libur ini sedang dinonaktifkan (Klik untuk aktifkan)' : 'Libur ini aktif (Klik untuk nonaktifkan)'}
                                                    aria-label={item.isDisabled ? 'Aktifkan Libur' : 'Nonaktifkan Libur'}
                                                >
                                                    {item.isDisabled ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                disabled={isProcessing}
                                                onClick={() => setItemToDelete({ tanggal: item.tanggalIso, keterangan: item.keterangan })}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                                title="Hapus hari libur ini secara permanen"
                                                aria-label="Hapus Hari Libur"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Kolom Kanan / Sidebar (5 cols): Tambah Hari Libur + Auto Terapkan Libur */}
                <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-slate-200/70 lg:dark:border-slate-800 lg:pl-6">
                    {/* A. Tambah Hari Libur Manual */}
                    <form onSubmit={handleAddCustom} className="space-y-3.5 pb-6 border-b border-slate-200/70 dark:border-slate-800">
                        <div className="space-y-0.5">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                <Plus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                <span>Tambah Hari Libur Manual</span>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                                Tambah libur khusus kantor, piket, atau cuti bersama.
                            </p>
                        </div>

                        {/* Segmented Control Kategori Libur */}
                        <div className="space-y-1">
                            <label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
                                Kategori Libur
                            </label>
                            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setCategoryOption('libur_nasional')}
                                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                                        categoryOption === 'libur_nasional'
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold shadow-xs'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-normal'
                                    }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                    <span className="truncate">Nasional</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCategoryOption('cuti_bersama')}
                                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                                        categoryOption === 'cuti_bersama'
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold shadow-xs'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-normal'
                                    }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                    <span className="truncate">Cuti</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCategoryOption('lainnya')}
                                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                                        categoryOption === 'lainnya'
                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold shadow-xs'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-normal'
                                    }`}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                    <span className="truncate">Lainnya</span>
                                </button>
                            </div>
                        </div>

                        {/* Input Kustom jika memilih 'Lainnya' */}
                        {categoryOption === 'lainnya' && (
                            <div className="space-y-1 animate-in fade-in duration-150">
                                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
                                    Nama Kategori Kustom
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Libur Khusus Perusahaan"
                                    value={customCategoryName}
                                    onChange={(e) => setCustomCategoryName(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/90 outline-none font-normal text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200/60 dark:border-slate-700 transition-all focus:bg-white dark:focus:bg-slate-850 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                    required={categoryOption === 'lainnya'}
                                />
                            </div>
                        )}

                        {/* Form Inputs: Tanggal & Nama Libur */}
                        <div className="space-y-2">
                            <div>
                                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                                    Tanggal Libur
                                </label>
                                <CustomDatePicker
                                    value={customDate}
                                    onChange={(val) => setCustomDate(val)}
                                    placeholder="Pilih tanggal"
                                    theme={theme}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                                    Keterangan Libur
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nama atau keterangan hari libur"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/90 outline-none font-normal text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200/60 dark:border-slate-700 transition-all focus:bg-white dark:focus:bg-slate-850 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-[0.98] ${getAccentButtonClass()}`}
                            >
                                Simpan Hari Libur
                            </button>
                        </div>
                    </form>

                    {/* B. Auto-Terapkan Libur Resmi & CSV */}
                    <div className="space-y-3.5">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                    Auto-Terapkan Libur Resmi {activeYear}
                                </h3>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                                Terapkan otomatis seluruh daftar hari libur resmi & cuti bersama tahun {activeYear}.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                disabled={isProcessing}
                                onClick={handleApplyAllOfficial}
                                className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] ${getAccentButtonClass()}`}
                            >
                                <Check className="h-3.5 w-3.5" />
                                <span>Terapkan Semua</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCsvPanelOpen(!isCsvPanelOpen)}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 rounded-xl transition-all cursor-pointer active:scale-[0.98]"
                            >
                                <Upload className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                                <span>Format CSV</span>
                            </button>
                        </div>

                        {/* CSV Importer Panel */}
                        {isCsvPanelOpen && (
                            <div className="pt-2 space-y-3 animate-in fade-in duration-200">
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                                        <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                            <Info className="w-3.5 h-3.5 text-sky-500" />
                                            Format CSV:
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={handleCopySampleCsv}
                                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                                            >
                                                <Copy className="w-2.5 h-2.5 text-slate-400" />
                                                <span>{hasCopiedExample ? 'Tersalin!' : 'Salin'}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleDownloadSampleCsv}
                                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                                            >
                                                <Download className="w-2.5 h-2.5 text-slate-400" />
                                                <span>Download</span>
                                            </button>
                                        </div>
                                    </div>
                                    <code className="block p-2 rounded-lg bg-white dark:bg-slate-900 font-mono text-[10px] text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800 overflow-x-auto whitespace-pre">
                                        {`Tanggal,Keterangan,Kategori
${activeYear}-01-01,Tahun Baru,Libur Nasional
${activeYear}-08-17,Kemerdekaan RI,Libur Nasional`}
                                    </code>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                            <span>Tempel Data Libur:</span>
                                        </label>
                                        {csvRawText && (
                                            <span className="text-[10px] text-teal-700 dark:text-teal-300 font-bold bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.2 rounded border border-teal-200/50">
                                                {parsedLineCount} baris
                                            </span>
                                        )}
                                    </div>

                                    <textarea
                                        ref={csvTextareaRef}
                                        placeholder={`Tempel baris CSV di sini (1 baris per data)...\n${activeYear}-01-01,Tahun Baru ${activeYear},Libur Nasional`}
                                        value={csvRawText}
                                        onChange={(e) => setCsvRawText(e.target.value)}
                                        rows={3}
                                        className="w-full p-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/90 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200/60 dark:border-slate-700 transition-all focus:bg-white dark:focus:bg-slate-850 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none leading-relaxed whitespace-pre"
                                    />

                                    <div className="flex items-center justify-between gap-2 pt-1">
                                        <input
                                            type="file"
                                            accept=".csv,.txt"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex-1 py-1.5 px-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                                        >
                                            <Upload className="h-3 w-3 text-slate-400" />
                                            <span>Unggah .CSV</span>
                                        </button>

                                        <button
                                            type="button"
                                            disabled={!csvRawText.trim() || isProcessing}
                                            onClick={() => parseAndApplyCsvData(csvRawText)}
                                            className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-40 transition-all flex items-center justify-center gap-1 ${getAccentButtonClass()}`}
                                        >
                                            <Check className="h-3 w-3" />
                                            <span>Impor CSV</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Konfirmasi Hapus Satuan */}
            {itemToDelete && (
                <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-sm p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl space-y-4 text-slate-900 dark:text-slate-100">
                        <div className="flex items-center space-x-2 text-rose-500">
                            <AlertCircle className="h-5 w-5" />
                            <h3 className="text-sm font-bold">Hapus Hari Libur?</h3>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                            Apakah Anda yakin ingin menghapus libur <strong>{itemToDelete.keterangan}</strong> ({formatTanggalIndo(itemToDelete.tanggal)}) secara permanen?
                        </p>
                        <div className="flex items-center justify-end space-x-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setItemToDelete(null)}
                                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDeleteItem}
                                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer transition-all shadow-xs"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dialog Konfirmasi Hapus Semua Libur dengan Pengetikan HAPUS & Cyber Glitch */}
            {isConfirmingClearAll && (
                <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className="w-full max-w-sm p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl space-y-4 text-slate-900 dark:text-slate-100">
                        <div className="flex items-center space-x-2 text-rose-500">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <h3 className="text-sm font-bold">Hapus Semua Libur {activeYear}?</h3>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                            Seluruh hari libur kustom dan libur tersimpan untuk tahun <strong>{activeYear}</strong> akan dihapus permanen dari kalender.
                        </p>
                        <div className="space-y-1.5 pt-1">
                            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                                Ketik <span className="font-bold text-rose-600 dark:text-rose-400">HAPUS</span> untuk mengonfirmasi:
                            </label>
                            <input
                                type="text"
                                value={clearAllConfirmInput}
                                onChange={(e) => setClearAllConfirmInput(e.target.value)}
                                placeholder="Ketik HAPUS"
                                autoFocus
                                className="w-full px-3 py-2 text-xs font-mono font-bold tracking-widest uppercase rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 placeholder:text-rose-300 dark:placeholder:text-rose-800/60 focus:outline-none focus:ring-2 focus:ring-rose-500"
                            />
                        </div>
                        <div className="flex items-center justify-end space-x-2 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsConfirmingClearAll(false);
                                    setClearAllConfirmInput('');
                                }}
                                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={clearAllConfirmInput.trim() !== 'HAPUS' || isProcessing}
                                onClick={handleConfirmClearYearHolidays}
                                className="btn-glitch-delete px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
                                data-text="Ya, Hapus Semua"
                            >
                                <span className="relative z-10">Ya, Hapus Semua</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    if (isPageView) {
        return content;
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {content}
            </div>
        </div>
    );
};
