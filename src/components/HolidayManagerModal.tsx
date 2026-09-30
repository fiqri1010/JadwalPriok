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
    const isDark = theme === 'dark';
    const isVista = theme === 'vista';
    const isIndustrial = theme === 'industrial';
    const isPaperSketch = theme === 'paperSketch';
    const isTechnical = theme === 'technical';
    const isEditorial = theme === 'editorial';
    const isDashboard = theme === 'dashboard';

    // Current running year (tahun berjalan secara otomatis)
    const currentRunningYear = useMemo(() => new Date().getFullYear(), []);
    const [activeYear, setActiveYear] = useState<number>(() => isPageView ? currentRunningYear : (selectedYear || currentRunningYear));

    // Year Dropdown / Search Popover state
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState<boolean>(false);
    const [yearSearchQuery, setYearSearchQuery] = useState<string>('');
    const yearDropdownRef = useRef<HTMLDivElement>(null);
    const activeYearBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (selectedYear && !isPageView) {
            setActiveYear(selectedYear);
        }
    }, [selectedYear, isPageView]);

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

        let successCount = 0;
        for (const item of yearItems) {
            const ok = await onDeleteLibur(item.tanggalIso);
            if (ok) successCount++;
        }

        setIsProcessing(false);
        setImportStatusMessage({
            text: `Berhasil menghapus ${successCount} hari libur untuk tahun ${activeYear}.`,
        });
        setTimeout(() => setImportStatusMessage(null), 4000);
    };

    // Parse CSV data
    const parseAndApplyCsvData = async (rawText: string) => {
        if (!rawText.trim()) return;

        setIsProcessing(true);
        const lines = rawText.replace(/\r/g, '').split('\n');
        let successCount = 0;
        let failCount = 0;

        for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) continue;

            // Skip header lines
            const lower = line.toLowerCase();
            if (lower.includes('tanggal') || lower.includes('yyyy') || (lower.includes('date') && lower.includes('holiday'))) {
                continue;
            }

            // Split by comma or semicolon or tab
            let parts: string[] = [];
            if (line.includes('\t')) {
                parts = line.split('\t');
            } else if (line.includes(';')) {
                parts = line.split(';');
            } else {
                parts = line.split(',');
            }

            parts = parts.map((p) => p.trim().replace(/^["']|["']$/g, ''));

            if (parts.length >= 2) {
                let dateStr = parts[0];
                const ketStr = parts[1] || 'Hari Libur';
                const katStr = parts[2] || (ketStr.toLowerCase().includes('cuti') ? 'cuti_bersama' : 'libur_nasional');

                // Normalize date: support DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
                if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(dateStr)) {
                    const sep = dateStr.includes('/') ? '/' : '-';
                    const dParts = dateStr.split(sep);
                    const d = dParts[0].padStart(2, '0');
                    const m = dParts[1].padStart(2, '0');
                    const y = dParts[2];
                    dateStr = `${y}-${m}-${d}`;
                }

                if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                    const ok = await onAddLibur(dateStr, ketStr, katStr);
                    if (ok) successCount++;
                    else failCount++;
                } else {
                    failCount++;
                }
            } else {
                failCount++;
            }
        }

        setIsProcessing(false);
        setCsvRawText('');
        setIsCsvPanelOpen(false);

        if (successCount > 0) {
            setImportStatusMessage({
                text: `Berhasil mengimpor ${successCount} hari libur${failCount > 0 ? ` (${failCount} baris tidak valid dilewati)` : ''}.`,
            });
        } else {
            setImportStatusMessage({
                text: `Tidak ada data valid yang dapat diimpor dari CSV.`,
                isError: true,
            });
        }
        setTimeout(() => setImportStatusMessage(null), 4000);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const content = evt.target?.result as string;
            if (content) {
                setCsvRawText(content);
            }
        };
        reader.readAsText(file);
    };

    const handleCopySampleCsv = () => {
        const sample = `Tanggal,Keterangan,Kategori\n${activeYear}-01-01,Tahun Baru ${activeYear},Libur Nasional\n${activeYear}-08-17,Hari Kemerdekaan RI,Libur Nasional\n${activeYear}-12-25,Hari Raya Natal,Libur Nasional`;
        navigator.clipboard.writeText(sample);
        setHasCopiedExample(true);
        setTimeout(() => setHasCopiedExample(false), 2000);
    };

    const handleDownloadSampleCsv = () => {
        const sample = `Tanggal,Keterangan,Kategori\n${activeYear}-01-01,Tahun Baru ${activeYear},Libur Nasional\n${activeYear}-08-17,Hari Kemerdekaan RI,Libur Nasional\n${activeYear}-12-25,Hari Raya Natal,Libur Nasional`;
        const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `template_libur_${activeYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Sleek and minimal category badge color with dark-theme adaptation
    const getCategoryBadgeClass = (categoryInfo: { category: HolidayCategory; label: string; isCustom: boolean }) => {
        if (isIndustrial) {
            if (categoryInfo.category === 'cuti_bersama') {
                return 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/40 rounded-[3px] font-mono';
            }
            if (categoryInfo.category === 'lainnya' || categoryInfo.isCustom) {
                return 'bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/40 rounded-[3px] font-mono';
            }
            return 'bg-[#BE1A1A]/15 text-[#FF6B6B] border border-[#BE1A1A]/40 rounded-[3px] font-mono';
        }
        if (isPaperSketch) {
            if (categoryInfo.category === 'cuti_bersama') {
                return 'bg-amber-100 text-[#2b2b2b] border border-[#2b2b2b] rounded-md font-bold';
            }
            if (categoryInfo.category === 'lainnya' || categoryInfo.isCustom) {
                return 'bg-indigo-100 text-[#2b2b2b] border border-[#2b2b2b] rounded-md font-bold';
            }
            return 'bg-rose-100 text-[#2b2b2b] border border-[#2b2b2b] rounded-md font-bold';
        }
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
        if (isIndustrial) return 'bg-[#2DD4BF] hover:bg-[#26b8a8] text-[#0F1115] font-bold rounded-[4px] uppercase tracking-wider transition-all shadow-xs';
        if (isPaperSketch) return 'bg-[#ff4747] hover:bg-[#ff3333] text-white font-bold rounded-xl border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]';
        if (isDark) return 'bg-teal-600 hover:bg-teal-500 text-white shadow-xs';
        if (isVista) return 'bg-gradient-to-b from-[#4facfe] via-[#00a2ff] to-[#0072ff] text-white shadow-xs';
        if (isDashboard) return 'bg-[#4D2A00] hover:bg-[#6E3C00] text-[#FFF9E6] font-bold rounded-lg shadow-xs transition-all';
        return 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs';
    };

    const content = (
        <div
            className={`rounded-2xl p-5 sm:p-7 space-y-6 shadow-sm transition-colors border ${
                isWinamp
                    ? 'bg-[#191919] text-[#00FF00] font-mono border-2 border-zinc-700 shadow-[2px_2px_0_#000]'
                    : isIndustrial
                    ? 'bg-[#1A1D23] text-[#E2E8F0] border-[rgba(226,232,240,0.15)] font-[\'JetBrains_Mono\']'
                    : isDark
                    ? 'bg-[#1E1E1E] text-[#E0E0E0] border-slate-800'
                    : isVista
                    ? 'bg-white/95 backdrop-blur-md text-slate-900 border-sky-200'
                    : isPaperSketch
                    ? 'bg-white text-[#2b2b2b] border-2 border-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b] font-[\'Gaegu\']'
                    : isTechnical
                    ? 'bg-[#F8F7F4] text-[#111113] border-[1.5px] border-[#111113] font-mono'
                    : isDashboard
                    ? 'bg-[#FFF5D0] text-[#4D2A00] border-[#4D2A00]/25'
                    : 'bg-white text-slate-800 border-slate-200/70'
            }`}
        >
            {/* 1. Header Minimalis & Elegan */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b ${
                isIndustrial
                    ? 'border-[rgba(226,232,240,0.12)]'
                    : 'border-slate-200/70 dark:border-slate-800'
            }`}>
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg shrink-0 ${
                            isIndustrial
                                ? 'bg-[#0F1115] text-[#2DD4BF] border border-[#2DD4BF]/40'
                                : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/50 text-rose-500'
                        }`}>
                            <Flag className={`h-5 w-5 ${isIndustrial ? 'text-[#2DD4BF]' : 'fill-rose-500 text-rose-500'}`} />
                        </div>
                        <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${
                            isIndustrial
                                ? 'text-[#E2E8F0] font-[\'Syne\']'
                                : 'text-slate-900 dark:text-slate-100'
                        }`}>
                            Daftar Hari Libur
                        </h2>
                    </div>
                    <p className={`text-xs ${
                        isIndustrial
                            ? 'text-[#E2E8F0]/70 font-mono text-[11px]'
                            : 'text-slate-500 dark:text-slate-400 font-normal'
                    }`}>
                        Kelola hari libur resmi nasional, cuti bersama, dan penanggalan merah kalender kerja.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-start sm:self-center">
                    {/* Modern & Searchable Year Selector Dropdown */}
                    <div className="relative" ref={yearDropdownRef}>
                        <button
                            type="button"
                            onClick={() => {
                                setIsYearDropdownOpen((prev) => !prev);
                                setYearSearchQuery('');
                            }}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-[5px] border text-xs font-medium transition-all duration-300 cursor-pointer ${
                                isIndustrial
                                    ? isYearDropdownOpen
                                        ? 'bg-[#0F1115] border-[#2DD4BF] text-[#2DD4BF] ring-2 ring-[#2DD4BF]/20'
                                        : 'bg-[#0F1115] hover:bg-[#1A1D23] border-[rgba(226,232,240,0.2)] text-[#E2E8F0]'
                                    : isDashboard
                                    ? isYearDropdownOpen
                                        ? 'bg-[#FFF0BE] border-[#4D2A00] text-[#4D2A00] ring-2 ring-[#4D2A00]/20'
                                        : 'bg-[#FFF0BE] border-[#4D2A00]/30 text-[#4D2A00]'
                                    : isYearDropdownOpen
                                    ? 'bg-teal-50 dark:bg-[#323741] border-teal-400 text-teal-800 dark:text-white ring-2 ring-teal-500/10'
                                    : 'bg-slate-100/90 hover:bg-slate-200/80 dark:bg-[#2a2f3b] dark:hover:bg-[#323741] border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-white'
                            }`}
                            title="Pilih atau cari tahun"
                        >
                            <span className={isIndustrial ? 'text-[#E2E8F0]/60' : isDashboard ? 'text-[#4D2A00]/70' : 'text-slate-400 dark:text-slate-400'}>Tahun:</span>
                            <span className={`font-semibold ${isIndustrial ? 'text-[#E2E8F0]' : isDashboard ? 'text-[#4D2A00]' : 'text-slate-900 dark:text-white'}`}>{activeYear}</span>
                            {activeYear === currentRunningYear && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-normal leading-none border ${
                                    isIndustrial
                                        ? 'bg-[#2DD4BF]/15 text-[#2DD4BF] border-[#2DD4BF]/30'
                                        : isDashboard
                                        ? 'bg-[#4D2A00] text-[#FFF9E6] border-[#4D2A00]'
                                        : 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 border-teal-200/50 dark:border-teal-700/50'
                                }`}>
                                    Tahun Ini
                                </span>
                            )}
                            <ChevronDown className={`w-3.5 h-3.5 ml-0.5 transition-transform duration-200 ${isYearDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Popover */}
                        {isYearDropdownOpen && (
                            <div className={`absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-[6px] shadow-2xl border p-3 z-50 animate-in fade-in zoom-in-95 duration-200 ${
                                isIndustrial
                                    ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.2)] text-[#E2E8F0]'
                                    : isDashboard
                                    ? 'bg-[#FFF5D0] border-[#4D2A00]/30 text-[#4D2A00]'
                                    : 'bg-white dark:bg-[#2a2f3b] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                            }`}>
                                {/* Search input */}
                                <div className="relative mb-2">
                                    <Search className="w-3.5 h-3.5 opacity-50 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="Cari atau ketik tahun..."
                                        value={yearSearchQuery}
                                        onChange={(e) => setYearSearchQuery(e.target.value)}
                                        autoFocus
                                        className={`w-full text-xs pl-8 pr-7 py-2 rounded-lg border outline-none transition-all ${
                                            isIndustrial
                                                ? 'bg-[#0F1115] text-[#E2E8F0] placeholder:text-[#E2E8F0]/40 border-[rgba(226,232,240,0.2)] focus:border-[#2DD4BF]'
                                                : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:border-teal-500'
                                        }`}
                                    />
                                    {yearSearchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setYearSearchQuery('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 p-0.5 cursor-pointer"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
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
                                        className={`w-full mb-2 flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition-colors cursor-pointer border ${
                                            isIndustrial
                                                ? 'bg-[#2DD4BF]/15 hover:bg-[#2DD4BF]/25 text-[#2DD4BF] border-[#2DD4BF]/40'
                                                : 'bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-800 dark:text-teal-200 border-teal-200/60'
                                        }`}
                                    >
                                        <span>Gunakan tahun <strong>{parsedQueryYear}</strong></span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                )}

                                {/* Scrollable Year Grid */}
                                <div className="max-h-52 overflow-y-auto pr-1 grid grid-cols-4 gap-1.5">
                                    {filteredYears.length === 0 && !isDirectCustomYearValid ? (
                                        <div className="col-span-4 py-6 text-center text-xs opacity-50">
                                            Tahun tidak ditemukan
                                        </div>
                                    ) : (
                                        filteredYears.map((yr, idx) => {
                                            const isSelected = yr === activeYear;
                                            const isCurrent = yr === currentRunningYear;
                                            return (
                                                <button
                                                    key={`holiday-yr-${yr}-${idx}`}
                                                    ref={isSelected ? activeYearBtnRef : undefined}
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveYear(yr);
                                                        setIsYearDropdownOpen(false);
                                                        setYearSearchQuery('');
                                                    }}
                                                    className={`relative p-1.5 rounded-md text-xs text-center transition-all cursor-pointer ${
                                                        isSelected
                                                            ? isIndustrial
                                                                ? 'bg-[#2DD4BF] text-[#0F1115] font-bold shadow-xs'
                                                                : 'bg-teal-600 text-white font-semibold shadow-xs'
                                                            : isCurrent
                                                            ? isIndustrial
                                                                ? 'bg-[#0F1115] text-[#2DD4BF] hover:bg-[#2DD4BF]/10 font-bold border border-[#2DD4BF]/40'
                                                                : 'bg-teal-50 dark:bg-[#323741] text-teal-800 dark:text-teal-300 hover:bg-teal-100 font-medium border border-teal-200/60'
                                                            : isIndustrial
                                                            ? 'text-[#E2E8F0] hover:bg-white/10'
                                                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    {yr}
                                                    {isCurrent && !isSelected && (
                                                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#2DD4BF] rounded-full" />
                                                    )}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Indikator Jumlah Hari Libur di sebelah kanan selector tahun */}
                    <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-[5px] border shrink-0 ${
                        isIndustrial
                            ? 'bg-[#0F1115] text-[#2DD4BF] border-[#2DD4BF]/30 font-mono'
                            : 'text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-[#2a2f3b] border-slate-200/80 dark:border-slate-700'
                    }`}>
                        {yearItems.length} hari
                    </span>

                    {!isPageView && (
                        <button
                            type="button"
                            onClick={onClose}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isIndustrial
                                    ? 'hover:bg-white/10 text-[#E2E8F0]/70 hover:text-[#E2E8F0]'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700'
                            }`}
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
                        ? isIndustrial
                            ? 'bg-[#BE1A1A]/20 text-[#FF6B6B] border-[#BE1A1A]/40'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/50'
                        : isIndustrial
                        ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border-[#2DD4BF]/40'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50'
                }`}>
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{importStatusMessage.text}</span>
                </div>
            )}

            {/* 2-Column Responsive Layout: Left = Main Holiday List, Right = Sidebar (Tambah Libur & Auto-Terapkan) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Kolom Kiri / Utama (7 cols): Daftar Hari Libur Terdaftar */}
                <div className="lg:col-span-7 space-y-3">
                    {yearItems.length === 0 ? (
                        <div className="space-y-3">
                            <div className={`py-14 text-center text-xs font-medium rounded-xl border border-dashed ${
                                isIndustrial
                                    ? 'bg-[#0F1115]/50 border-[rgba(226,232,240,0.15)] text-[#E2E8F0]/60'
                                    : 'bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                            }`}>
                                Tidak ada hari libur tersimpan untuk tahun {activeYear}.
                            </div>
                            {/* Footer aksi saat daftar kosong */}
                            <div className={`pt-3 border-t flex items-center justify-end gap-2.5 ${
                                isIndustrial ? 'border-[rgba(226,232,240,0.12)]' : 'border-slate-100 dark:border-slate-800'
                            }`}>
                                <button
                                    type="button"
                                    disabled={isProcessing}
                                    onClick={handleApplyAllOfficial}
                                    className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] ${getAccentButtonClass()}`}
                                >
                                    <Check className="h-3.5 w-3.5" />
                                    <span>Terapkan Semua</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className={`divide-y max-h-[60vh] overflow-y-auto pr-1 ${
                                isIndustrial ? 'divide-[rgba(226,232,240,0.08)]' : 'divide-slate-100 dark:divide-slate-800/80'
                            }`}>
                            {yearItems.map((item, idx) => {
                                const catInfo = resolveHolidayCategory({
                                    keterangan: item.keterangan,
                                    kategori: item.kategori,
                                    isCutiBersama: item.isCutiBersama
                                });

                                return (
                                    <div
                                        key={`${item.tanggalIso}-${item.keterangan || ''}-${idx}`}
                                        className={`flex items-center justify-between py-2.5 px-2 rounded-lg transition-colors ${
                                            isIndustrial
                                                ? 'hover:bg-[#0F1115]/70'
                                                : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                                        } ${item.isDisabled ? 'opacity-50' : ''}`}
                                    >
                                        {/* Kolom 1: Tanggal Minimalis & Ikon */}
                                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                                            <div className={`flex flex-col items-center justify-center w-10 py-1 text-center shrink-0 rounded-lg border ${
                                                item.isDisabled
                                                    ? isIndustrial
                                                        ? 'bg-[#0F1115] border-[rgba(226,232,240,0.1)] text-[#E2E8F0]/40'
                                                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                                    : isIndustrial
                                                    ? 'bg-[#0F1115] border-[#BE1A1A]/40 text-[#FF6B6B]'
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
                                                    <p className={`text-xs font-bold truncate ${
                                                        isIndustrial ? 'text-[#E2E8F0]' : 'text-slate-900 dark:text-slate-100'
                                                    } ${item.isDisabled ? 'line-through opacity-50' : ''}`} title={item.keterangan}>
                                                        {item.keterangan}
                                                    </p>
                                                    <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold ${getCategoryBadgeClass(catInfo)}`}>
                                                        {catInfo.label}
                                                    </span>
                                                    {item.isDisabled && (
                                                        <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold ${
                                                            isIndustrial
                                                                ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                                                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300'
                                                        }`}>
                                                            Nonaktif
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`text-[11px] ${
                                                    isIndustrial ? 'text-[#E2E8F0]/65 font-mono' : 'text-slate-500 dark:text-slate-400'
                                                }`}>
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
                                                            ? isIndustrial
                                                                ? 'text-[#F59E0B] hover:bg-[#F59E0B]/20'
                                                                : 'text-amber-500 hover:text-amber-600 bg-amber-500/10'
                                                            : isIndustrial
                                                            ? 'text-[#2DD4BF] hover:bg-[#2DD4BF]/20'
                                                            : 'text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50'
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
                                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                                    isIndustrial
                                                        ? 'text-[#FF6B6B] hover:bg-[#BE1A1A]/20'
                                                        : 'text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50'
                                                }`}
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

                            {/* Footer: Tombol Hapus Libur Tahun Ini & di Samping Kanannya Tombol Terapkan Semua */}
                            <div className={`pt-3 border-t flex flex-wrap items-center justify-end gap-2.5 ${
                                isIndustrial ? 'border-[rgba(226,232,240,0.12)]' : 'border-slate-100 dark:border-slate-800'
                            }`}>
                                <button
                                    type="button"
                                    disabled={isProcessing}
                                    onClick={() => {
                                        setClearAllConfirmInput('');
                                        setIsConfirmingClearAll(true);
                                    }}
                                    className="btn-glitch-delete px-3.5 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                                    data-text="Hapus Libur Tahun Ini"
                                >
                                    <Trash2 className="w-3.5 h-3.5 shrink-0 relative z-10" />
                                    <span className="relative z-10">Hapus Libur Tahun Ini</span>
                                </button>
                                <button
                                    type="button"
                                    disabled={isProcessing}
                                    onClick={handleApplyAllOfficial}
                                    className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] ${getAccentButtonClass()}`}
                                >
                                    <Check className="h-3.5 w-3.5" />
                                    <span>Terapkan Semua</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Kolom Kanan / Sidebar (5 cols): Tambah Hari Libur + Impor CSV */}
                <div className={`lg:col-span-5 space-y-6 lg:border-l lg:pl-6 ${
                    isIndustrial ? 'lg:border-[rgba(226,232,240,0.12)]' : 'lg:border-slate-200/70 lg:dark:border-slate-800'
                }`}>
                    {/* A. Tambah Hari Libur Manual */}
                    <form onSubmit={handleAddCustom} className={`space-y-3.5 pb-6 border-b ${
                        isIndustrial ? 'border-[rgba(226,232,240,0.12)]' : 'border-slate-200/70 dark:border-slate-800'
                    }`}>
                        <div className="space-y-0.5">
                            <h3 className={`text-sm font-bold flex items-center gap-1.5 ${
                                isIndustrial ? 'text-[#E2E8F0] font-[\'Syne\']' : 'text-slate-900 dark:text-slate-100'
                            }`}>
                                <Plus className={`w-4 h-4 ${isIndustrial ? 'text-[#2DD4BF]' : 'text-teal-600 dark:text-teal-400'}`} />
                                <span>Tambah Hari Libur Manual</span>
                            </h3>
                            <p className={`text-xs ${
                                isIndustrial ? 'text-[#E2E8F0]/70 font-mono text-[11px]' : 'text-slate-500 dark:text-slate-400'
                            }`}>
                                Tambah libur khusus kantor, piket, atau cuti bersama.
                            </p>
                        </div>

                        {/* Segmented Control Kategori Libur */}
                        <div className="space-y-1">
                            <label className={`text-[11px] font-semibold block uppercase tracking-wider ${
                                isIndustrial ? 'text-[#E2E8F0]/70 font-mono' : 'text-slate-500 dark:text-slate-400'
                            }`}>
                                Kategori Libur
                            </label>
                            <div className={`grid grid-cols-3 gap-1 p-1 rounded-xl border ${
                                isIndustrial
                                    ? 'bg-[#0F1115] border-[rgba(226,232,240,0.15)]'
                                    : 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-200/60 dark:border-slate-700'
                            }`}>
                                <button
                                    type="button"
                                    onClick={() => setCategoryOption('libur_nasional')}
                                    className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] transition-all cursor-pointer ${
                                        categoryOption === 'libur_nasional'
                                            ? isIndustrial
                                                ? 'bg-[#1A1D23] text-[#2DD4BF] font-bold border border-[#2DD4BF]/40 shadow-xs'
                                                : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold shadow-xs'
                                            : isIndustrial
                                            ? 'text-[#E2E8F0]/60 hover:text-[#E2E8F0]'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
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
                                            ? isIndustrial
                                                ? 'bg-[#1A1D23] text-[#F59E0B] font-bold border border-[#F59E0B]/40 shadow-xs'
                                                : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold shadow-xs'
                                            : isIndustrial
                                            ? 'text-[#E2E8F0]/60 hover:text-[#E2E8F0]'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
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
                                            ? isIndustrial
                                                ? 'bg-[#1A1D23] text-[#2DD4BF] font-bold border border-[#2DD4BF]/40 shadow-xs'
                                                : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold shadow-xs'
                                            : isIndustrial
                                            ? 'text-[#E2E8F0]/60 hover:text-[#E2E8F0]'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
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
                                <label className={`text-[11px] font-semibold block uppercase tracking-wider ${
                                    isIndustrial ? 'text-[#E2E8F0]/70 font-mono' : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                    Nama Kategori Kustom
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Libur Khusus Perusahaan"
                                    value={customCategoryName}
                                    onChange={(e) => setCustomCategoryName(e.target.value)}
                                    className={`w-full px-3 py-2 text-xs rounded-xl outline-none font-normal border transition-all ${
                                        isIndustrial
                                            ? 'bg-[#0F1115] text-[#E2E8F0] placeholder:text-[#E2E8F0]/40 border-[rgba(226,232,240,0.2)] focus:border-[#2DD4BF]'
                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200/60 focus:border-teal-500'
                                    }`}
                                    required={categoryOption === 'lainnya'}
                                />
                            </div>
                        )}

                        {/* Form Inputs: Tanggal & Nama Libur */}
                        <div className="space-y-2">
                            <div>
                                <label className={`text-[11px] font-semibold block mb-1 uppercase tracking-wider ${
                                    isIndustrial ? 'text-[#E2E8F0]/70 font-mono' : 'text-slate-500 dark:text-slate-400'
                                }`}>
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
                                <label className={`text-[11px] font-semibold block mb-1 uppercase tracking-wider ${
                                    isIndustrial ? 'text-[#E2E8F0]/70 font-mono' : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                    Keterangan Libur
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nama atau keterangan hari libur"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl outline-none font-normal border transition-all ${
                                        isIndustrial
                                            ? 'bg-[#0F1115] text-[#E2E8F0] placeholder:text-[#E2E8F0]/40 border-[rgba(226,232,240,0.2)] focus:border-[#2DD4BF]'
                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border-slate-200/60 focus:border-teal-500'
                                    }`}
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

                    {/* B. Impor Hari Libur Format CSV */}
                    <div className="space-y-3.5">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                                <FileText className={`w-4 h-4 ${isIndustrial ? 'text-[#2DD4BF]' : 'text-teal-600 dark:text-teal-400'} shrink-0`} />
                                <h3 className={`text-sm font-bold ${isIndustrial ? 'text-[#E2E8F0] font-[\'Syne\']' : 'text-slate-900 dark:text-slate-100'}`}>
                                    Impor Data CSV Libur
                                </h3>
                            </div>
                            <p className={`text-xs ${
                                isIndustrial ? 'text-[#E2E8F0]/70 font-mono text-[11px]' : 'text-slate-500 dark:text-slate-400'
                            }`}>
                                Tambahkan data libur nasional menggunakan Format CSV
                            </p>
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={() => setIsCsvPanelOpen(!isCsvPanelOpen)}
                                className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-[0.98] border ${
                                    isIndustrial
                                        ? 'bg-[#0F1115] hover:bg-[#1A1D23] text-[#E2E8F0] border-[rgba(226,232,240,0.2)]'
                                        : 'text-slate-700 dark:text-slate-300 bg-slate-100/90 hover:bg-slate-200/90 border-slate-200/60'
                                }`}
                            >
                                <Upload className="h-3.5 w-3.5 opacity-60" />
                                <span>{isCsvPanelOpen ? 'Tutup Panel CSV' : 'Buka Format CSV'}</span>
                            </button>
                        </div>

                        {/* CSV Importer Panel */}
                        {isCsvPanelOpen && (
                            <div className="pt-2 space-y-3 animate-in fade-in duration-200">
                                <div className={`p-3 rounded-xl border space-y-2 text-xs ${
                                    isIndustrial
                                        ? 'bg-[#0F1115] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                                        : 'bg-slate-50 dark:bg-slate-850/80 border-slate-200/60 text-slate-600 dark:text-slate-300'
                                }`}>
                                    <div className="flex items-center justify-between flex-wrap gap-1.5">
                                        <span className="font-semibold flex items-center gap-1">
                                            <Info className="w-3.5 h-3.5 text-sky-500" />
                                            Format CSV:
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={handleCopySampleCsv}
                                                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border shadow-2xs transition-all flex items-center gap-1 cursor-pointer ${
                                                    isIndustrial
                                                        ? 'bg-[#1A1D23] text-[#E2E8F0] hover:bg-white/10 border-[rgba(226,232,240,0.2)]'
                                                        : 'text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border-slate-200/60'
                                                }`}
                                            >
                                                <Copy className="w-2.5 h-2.5 opacity-60" />
                                                <span>{hasCopiedExample ? 'Tersalin!' : 'Salin'}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleDownloadSampleCsv}
                                                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border shadow-2xs transition-all flex items-center gap-1 cursor-pointer ${
                                                    isIndustrial
                                                        ? 'bg-[#1A1D23] text-[#E2E8F0] hover:bg-white/10 border-[rgba(226,232,240,0.2)]'
                                                        : 'text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border-slate-200/60'
                                                }`}
                                            >
                                                <Download className="w-2.5 h-2.5 opacity-60" />
                                                <span>Download</span>
                                            </button>
                                        </div>
                                    </div>
                                    <code className={`block p-2 rounded-lg font-mono text-[10px] border overflow-x-auto whitespace-pre ${
                                        isIndustrial
                                            ? 'bg-[#1A1D23] text-[#2DD4BF] border-[rgba(226,232,240,0.15)]'
                                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200/60'
                                    }`}>
                                        {`Tanggal,Keterangan,Kategori
${activeYear}-01-01,Tahun Baru,Libur Nasional
${activeYear}-08-17,Kemerdekaan RI,Libur Nasional`}
                                    </code>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <label className={`font-semibold flex items-center gap-1.5 ${
                                            isIndustrial ? 'text-[#E2E8F0]' : 'text-slate-700 dark:text-slate-300'
                                        }`}>
                                            <FileText className={`w-3.5 h-3.5 ${isIndustrial ? 'text-[#2DD4BF]' : 'text-teal-600 dark:text-teal-400'}`} />
                                            <span>Tempel Data Libur:</span>
                                        </label>
                                        {csvRawText && (
                                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                                                isIndustrial
                                                    ? 'bg-[#2DD4BF]/15 text-[#2DD4BF] border-[#2DD4BF]/30'
                                                    : 'text-teal-700 dark:text-teal-300 bg-teal-50 border-teal-200/50'
                                            }`}>
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
                                        className={`w-full p-2.5 text-xs font-mono rounded-xl outline-none border transition-all resize-none leading-relaxed whitespace-pre ${
                                            isIndustrial
                                                ? 'bg-[#0F1115] text-[#E2E8F0] placeholder:text-[#E2E8F0]/40 border-[rgba(226,232,240,0.2)] focus:border-[#2DD4BF]'
                                                : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 border-slate-200/60 focus:border-teal-500'
                                        }`}
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
                                            className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                                isIndustrial
                                                    ? 'bg-[#0F1115] text-[#E2E8F0] hover:bg-[#1A1D23] border-[rgba(226,232,240,0.2)]'
                                                    : 'text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 border-slate-200/60'
                                            }`}
                                        >
                                            <Upload className="h-3 w-3 opacity-60" />
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
                <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl space-y-4 ${
                        isIndustrial
                            ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.2)] text-[#E2E8F0]'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                    }`}>
                        <div className="flex items-center space-x-2 text-rose-500">
                            <AlertCircle className="h-5 w-5" />
                            <h3 className="text-sm font-bold">Hapus Hari Libur?</h3>
                        </div>
                        <p className={`text-xs leading-relaxed ${isIndustrial ? 'text-[#E2E8F0]/80' : 'text-slate-600 dark:text-slate-300'}`}>
                            Apakah Anda yakin ingin menghapus libur <strong>{itemToDelete.keterangan}</strong> ({formatTanggalIndo(itemToDelete.tanggal)}) secara permanen?
                        </p>
                        <div className="flex items-center justify-end space-x-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setItemToDelete(null)}
                                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                                    isIndustrial
                                        ? 'bg-[#0F1115] hover:bg-white/10 text-[#E2E8F0] border-[rgba(226,232,240,0.2)]'
                                        : 'text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 border-slate-200/60'
                                }`}
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

            {/* Dialog Konfirmasi Hapus Semua Libur */}
            {isConfirmingClearAll && (
                <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl space-y-4 ${
                        isIndustrial
                            ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.2)] text-[#E2E8F0]'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                    }`}>
                        <div className="flex items-center space-x-2 text-rose-500">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <h3 className="text-sm font-bold">Hapus Semua Libur {activeYear}?</h3>
                        </div>
                        <p className={`text-xs leading-relaxed ${isIndustrial ? 'text-[#E2E8F0]/80' : 'text-slate-600 dark:text-slate-300'}`}>
                            Seluruh hari libur kustom dan libur tersimpan untuk tahun <strong>{activeYear}</strong> akan dihapus permanen dari kalender.
                        </p>
                        <div className="space-y-1.5 pt-1">
                            <label className={`text-[11px] font-semibold block ${isIndustrial ? 'text-[#E2E8F0]/80' : 'text-slate-700 dark:text-slate-300'}`}>
                                Ketik <span className="font-bold text-rose-500">HAPUS</span> untuk mengonfirmasi:
                            </label>
                            <input
                                type="text"
                                value={clearAllConfirmInput}
                                onChange={(e) => setClearAllConfirmInput(e.target.value)}
                                placeholder="Ketik HAPUS"
                                autoFocus
                                className="w-full px-3 py-2 text-xs font-mono font-bold tracking-widest uppercase rounded-xl border border-rose-400 bg-rose-500/10 text-rose-400 placeholder:text-rose-400/40 focus:outline-none focus:ring-2 focus:ring-rose-500"
                            />
                        </div>
                        <div className="flex items-center justify-end space-x-2 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsConfirmingClearAll(false);
                                    setClearAllConfirmInput('');
                                }}
                                className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                                    isIndustrial
                                        ? 'bg-[#0F1115] hover:bg-white/10 text-[#E2E8F0] border-[rgba(226,232,240,0.2)]'
                                        : 'text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 border-slate-200/60'
                                }`}
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={clearAllConfirmInput.trim() !== 'HAPUS' || isProcessing}
                                onClick={handleConfirmClearYearHolidays}
                                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <span>Ya, Hapus Semua</span>
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
        <div className="fixed inset-0 sm:top-7 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {content}
            </div>
        </div>
    );
};
