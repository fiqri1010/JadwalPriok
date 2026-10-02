import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    Users,
    Search,
    Filter,
    Calendar,
    Star,
    ArrowLeft,
    ArrowRight,
    Download,
    Printer,
    RefreshCw,
    CheckCircle2,
    X,
    Clock,
    MapPin,
    ArrowRightLeft,
    Eye,
    ChevronDown,
    SlidersHorizontal,
    Info,
    Smartphone,
    Share2,
    Server,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { AppTheme, DayData, SHIFT_COLORS, normalizeShift, LiburNasional } from '../../types';
import { ThemeConfig } from '../../themeConfig';
import { UserAccount, UserRole } from '../../types/admin';
import { getAdminUsers } from '../../utils/adminStorage';
import { fetchServerUsers, resetServerMasterData } from '../../utils/serverSync';
import { saveFileWithDialog } from '../../lib/fileDownload';
import { DEFAULT_HOLIDAYS, getIndonesianHoliday, INDONESIAN_HOLIDAYS } from '../../data/holidays';
import { SubToolbarHeader } from '../SubToolbarHeader';
import { MonthYearPickerModal } from '../MonthYearPickerModal';

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const INDONESIAN_DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const LOCAL_STORAGE_PINNED_PEERS_KEY = 'jadwalpriok_pinned_peers';
const LOCAL_STORAGE_PEER_SCHEDULES_KEY = 'jadwalpriok_peer_schedules_v1';
const LOCAL_STORAGE_PEER_SWAPS_KEY = 'jadwalpriok_peer_swaps_v1';

// Pola shift standar operasional Tanjung Priok
const SHIFT_ROTATION_PATTERNS = [
    ['Graha', 'SM', 'Malam', 'OFF', 'Graha', 'Graha', 'OFF'],
    ['SM', 'Malam', 'OFF', 'Graha', 'SM', 'SM', 'OFF'],
    ['Malam', 'OFF', 'Graha', 'SM', 'Malam', 'Malam', 'OFF'],
    ['OFF', 'Graha', 'SM', 'Malam', 'OFF', 'OFF', 'TPSL'],
    ['TPSL', 'TPSL', 'OFF', 'NPCT', 'NPCT', 'OFF', 'Graha'],
    ['NPCT', 'OFF', 'Graha', 'SM', 'OFF', 'Malam', 'OFF'],
];

// Helper singkat untuk jam kerja shift
const SHIFT_HOURS_MAP: Record<string, string> = {
    Graha: '07.30 – 17.00',
    G: '07.30 – 17.00',
    SM: '07.00 – 19.00',
    S2: '07.00 – 19.00',
    PM: '19.00 – 07.00 (+1)',
    Malam: '20.00 – 08.00 (+1)',
    M: '20.00 – 08.00 (+1)',
    TPSL: '08.00 – 17.00',
    L: '08.00 – 17.00',
    NPCT: '07.30 – 16.30',
    N: '07.30 – 16.30',
    OFF: 'Libur / Lepas Piket',
    O: 'Libur / Lepas Piket',
    CUTI: 'Cuti Resmi',
    C: 'Cuti Resmi',
    CT: 'Cuti Resmi',
};

// Singkatan badge ringkas 1-4 huruf
const COMPACT_BADGE_MAP: Record<string, string> = {
    Graha: 'G',
    G: 'G',
    TPSL: 'L',
    L: 'L',
    NPCT: 'N',
    N: 'N',
    OFF: 'OFF',
    O: 'OFF',
    SM: 'SM',
    S2: 'SM',
    PM: 'PM',
    Malam: 'M',
    M: 'M',
    CUTI: 'CUTI',
    C: 'CUTI',
    CT: 'CUTI',
};

interface TeamScheduleViewProps {
    theme: AppTheme;
    themeConfig: ThemeConfig;
    currentUserName: string;
    currentUserNip: string;
    currentUserRole: UserRole;
    daysState: Record<string, DayData>;
    onShowToast: (msg: string) => void;
    onNavigateToTab?: (tab: any) => void;
}

export const TeamScheduleView: React.FC<TeamScheduleViewProps> = ({
    theme,
    themeConfig,
    currentUserName,
    currentUserNip,
    currentUserRole,
    daysState,
    onShowToast,
}) => {
    const today = useMemo(() => new Date(), []);
    const [selectedYear, setSelectedYear] = useState<number>(() => today.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(() => today.getMonth() + 1);
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState<boolean>(false);

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPosko, setSelectedPosko] = useState<string>('all');
    const [showOnlyPinned, setShowOnlyPinned] = useState(false);

    // Mobile View Scope: '3days' (Hari ini s.d. lusa), '7days' (7 Hari), 'full' (1 Bulan)
    const [mobileScope, setMobileScope] = useState<'3days' | '7days' | 'full'>('full');

    // Pinned Peers
    const [pinnedNips, setPinnedNips] = useState<string[]>(() => {
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_PINNED_PEERS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    const togglePinPeer = (nip: string) => {
        setPinnedNips((prev) => {
            const next = prev.includes(nip) ? prev.filter((n) => n !== nip) : [nip, ...prev];
            try {
                localStorage.setItem(LOCAL_STORAGE_PINNED_PEERS_KEY, JSON.stringify(next));
            } catch {}
            return next;
        });
    };

    // Load admin / staff users (didukung sinkronisasi server lokal & self-healing)
    const [usersList, setUsersList] = useState<UserAccount[]>(() => getAdminUsers());
    const [isSyncingServer, setIsSyncingServer] = useState(false);

    useEffect(() => {
        // Initial load dari penyimpanan lokal / self-healed
        setUsersList(getAdminUsers());

        // Sinkronkan juga dari server backend lokal (komputer lokal bertindak sebagai server)
        fetchServerUsers().then((serverData) => {
            if (serverData && serverData.length >= 120) {
                setUsersList(serverData);
            }
        }).catch(() => {});

        const handleStorageChange = () => {
            setUsersList(getAdminUsers());
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleSyncFromServer = async () => {
        setIsSyncingServer(true);
        try {
            const data = await resetServerMasterData();
            setUsersList(data);
            onShowToast('Sinkronisasi Berhasil! 120 staf resmi di 5 posko telah dimuat dari server lokal.');
        } catch {
            const fallback = getAdminUsers();
            setUsersList(fallback);
            onShowToast('Data master 120 staf resmi dimuat dari penyimpanan lokal.');
        } finally {
            setIsSyncingServer(false);
        }
    };

    // Filter Posko options (selalu menjamin 5 posko resmi tercantum penuh)
    const poskoOptions = useMemo(() => {
        const OFFICIAL_POSKOS = ['CDC', 'Graha Ground', 'Graha Segara Lt. 1', 'Koja', 'NPCT'];
        const fromUsers = Array.from(new Set(usersList.map((u) => u.unitPosko || 'Posko Umum')));
        return Array.from(new Set([...OFFICIAL_POSKOS, ...fromUsers])).filter(Boolean).sort();
    }, [usersList]);

    // Days in current selected month
    const daysInMonth = useMemo(() => {
        return new Date(selectedYear, selectedMonth, 0).getDate();
    }, [selectedYear, selectedMonth]);

    const dateList = useMemo(() => {
        const list: { dayNum: number; dateStr: string; dayName: string; isWeekend: boolean; holiday: LiburNasional | null; isToday: boolean }[] = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(selectedYear, selectedMonth - 1, d);
            const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayOfWeek = dateObj.getDay(); // 0 is Minggu
            const dayName = INDONESIAN_DAYS[dayOfWeek];
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const holidayText = INDONESIAN_HOLIDAYS[dateStr] || getIndonesianHoliday(dateObj);
            const holiday: LiburNasional | null = holidayText
                ? {
                      tanggal: dateStr,
                      keterangan: holidayText,
                      isCutiBersama: holidayText.toLowerCase().includes('cuti bersama'),
                  }
                : null;
            const isToday =
                today.getFullYear() === selectedYear &&
                today.getMonth() + 1 === selectedMonth &&
                today.getDate() === d;

            list.push({
                dayNum: d,
                dateStr,
                dayName,
                isWeekend,
                holiday,
                isToday,
            });
        }
        return list;
    }, [selectedYear, selectedMonth, daysInMonth, today]);

    // Visible dates based on mobileScope
    const visibleDates = useMemo(() => {
        if (mobileScope === 'full') return dateList;

        const currentDayIndex = dateList.findIndex((d) => d.isToday);
        const startIndex = currentDayIndex >= 0 ? currentDayIndex : 0;

        if (mobileScope === '3days') {
            return dateList.slice(startIndex, Math.min(startIndex + 3, dateList.length));
        }
        if (mobileScope === '7days') {
            return dateList.slice(startIndex, Math.min(startIndex + 7, dateList.length));
        }
        return dateList;
    }, [dateList, mobileScope]);

    // Custom peer schedules from localStorage
    const [customPeerSchedules, setCustomPeerSchedules] = useState<Record<string, Record<string, string>>>(() => {
        try {
            const raw = localStorage.getItem(LOCAL_STORAGE_PEER_SCHEDULES_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    });

    // Helper deterministik generator shift (hanya aktif untuk bulan Oktober 2026, bulan lain kosong jika belum diisi)
    const getShiftForUserAndDate = (user: UserAccount, dateStr: string, dayNum: number): string => {
        // 1. Jika ini akun pengguna aktif yang sedang login, baca dari daysState
        if (user.nip === currentUserNip) {
            const live = daysState[dateStr]?.shift;
            if (live) return live;
        }

        // 2. Jika ada override spesifik di customPeerSchedules
        if (customPeerSchedules[user.nip]?.[dateStr]) {
            return customPeerSchedules[user.nip][dateStr];
        }

        // 3. Batasi fallback deterministik otomatis hanya untuk Bulan Oktober 2026 (2026-10).
        // Untuk bulan lain yang belum diisi oleh pengguna, kembalikan string kosong agar tampil '-' (belum diisi).
        const [yearStr, monthStr] = dateStr.split('-');
        const y = parseInt(yearStr, 10);
        const m = parseInt(monthStr, 10);
        if (y !== 2026 || m !== 10) {
            return '';
        }

        // Fallback deterministik khusus untuk Oktober 2026
        const nipHash = user.nip
            .split('')
            .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const patternIndex = (nipHash + (user.unitPosko.length || 0)) % SHIFT_ROTATION_PATTERNS.length;
        const pattern = SHIFT_ROTATION_PATTERNS[patternIndex];
        const dayOffset = (dayNum + nipHash) % pattern.length;
        return pattern[dayOffset];
    };

    // Filtered & Sorted Users
    const filteredUsers = useMemo(() => {
        return usersList
            .filter((u) => {
                // Tetap sertakan seluruh rekan kerja termasuk PPF non User (hanya filter jika akun nonaktif)
                if (u.isActive === false) return false;

                // Posko Filter
                if (selectedPosko !== 'all' && u.unitPosko !== selectedPosko) return false;

                // Pinned only filter
                if (showOnlyPinned && !pinnedNips.includes(u.nip) && u.nip !== currentUserNip) return false;

                // Search query
                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase().trim();
                    const matchName = u.name.toLowerCase().includes(q);
                    const matchNip = u.nip.includes(q);
                    const matchPosko = (u.unitPosko || '').toLowerCase().includes(q);
                    const matchAuthority = (u.authorityName || '').toLowerCase().includes(q);
                    return matchName || matchNip || matchPosko || matchAuthority;
                }

                return true;
            })
            .sort((a, b) => {
                // 1. Akun pengguna saat ini selalu paling atas
                if (a.nip === currentUserNip) return -1;
                if (b.nip === currentUserNip) return 1;

                // 2. Rekan yang di-pin
                const aPinned = pinnedNips.includes(a.nip);
                const bPinned = pinnedNips.includes(b.nip);
                if (aPinned && !bPinned) return -1;
                if (!aPinned && bPinned) return 1;

                // 3. Kelompokkan berdasarkan unit posko agar setiap posko terhimpun jelas
                if (a.unitPosko !== b.unitPosko) {
                    return a.unitPosko.localeCompare(b.unitPosko);
                }

                // 4. Urut abjad nama
                return a.name.localeCompare(b.name);
            });
    }, [usersList, selectedPosko, showOnlyPinned, pinnedNips, searchQuery, currentUserNip]);

    // Modal Detail Shift Rekan & Ajakan Tukar Shift
    const [selectedCellInfo, setSelectedCellInfo] = useState<{
        user: UserAccount;
        dateStr: string;
        dayNum: number;
        shift: string;
    } | null>(null);

    const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
    const [myOfferDate, setMyOfferDate] = useState<string>('');
    const [swapReason, setSwapReason] = useState<string>('');

    const handleOpenCellDetail = (user: UserAccount, dateStr: string, dayNum: number) => {
        const shift = getShiftForUserAndDate(user, dateStr, dayNum);
        setSelectedCellInfo({
            user,
            dateStr,
            dayNum,
            shift,
        });
        setMyOfferDate(dateStr); // Default offer date
        setSwapReason('');
    };

    const handleConfirmSwapRequest = () => {
        if (!selectedCellInfo) return;

        const swapPayload = {
            id: `swap-${Date.now()}`,
            targetNip: selectedCellInfo.user.nip,
            targetName: selectedCellInfo.user.name,
            targetDate: selectedCellInfo.dateStr,
            targetShift: selectedCellInfo.shift,
            requesterNip: currentUserNip,
            requesterName: currentUserName,
            requesterDate: myOfferDate || selectedCellInfo.dateStr,
            reason: swapReason || 'Penyesuaian jadwal dinas / pertukaran shift jaga.',
            createdAt: new Date().toISOString(),
            status: 'pending',
        };

        try {
            const rawSwaps = localStorage.getItem(LOCAL_STORAGE_PEER_SWAPS_KEY);
            const currentSwaps = rawSwaps ? JSON.parse(rawSwaps) : [];
            currentSwaps.unshift(swapPayload);
            localStorage.setItem(LOCAL_STORAGE_PEER_SWAPS_KEY, JSON.stringify(currentSwaps));
        } catch {}

        onShowToast(`Ajakan tukar shift terkirim ke ${selectedCellInfo.user.name} (${selectedCellInfo.dateStr})!`);
        setIsSwapModalOpen(false);
        setSelectedCellInfo(null);
    };

    // Navigation Month
    const handlePrevMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear((y) => y - 1);
        } else {
            setSelectedMonth((m) => m - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear((y) => y + 1);
        } else {
            setSelectedMonth((m) => m + 1);
        }
    };

    // Export to Excel (.xlsx)
    const handleExportXlsx = async () => {
        try {
            const monthLabel = MONTH_NAMES[selectedMonth - 1];
            const wb = XLSX.utils.book_new();

            // Construct Header Rows
            const headers = ['No', 'Nama Pegawai', 'NIP', 'Unit Posko'];
            for (let d = 1; d <= daysInMonth; d++) {
                headers.push(String(d));
            }

            const dataRows: any[][] = [];

            // Title Block
            dataRows.push([`JADWAL SHIFT OPERASIONAL REKAN KERJA - ${monthLabel.toUpperCase()} ${selectedYear}`]);
            dataRows.push([`Unit Posko: ${selectedPosko === 'all' ? 'Seluruh Posko Pelabuhan Tanjung Priok' : selectedPosko}`]);
            dataRows.push([`Dicetak pada: ${new Date().toLocaleDateString('id-ID')} | Total: ${filteredUsers.length} Pegawai`]);
            dataRows.push([]); // blank line
            dataRows.push(headers);

            filteredUsers.forEach((u, idx) => {
                const row = [idx + 1, u.name, u.nip, u.unitPosko || '-'];
                for (let d = 1; d <= daysInMonth; d++) {
                    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const rawShift = getShiftForUserAndDate(u, dateStr, d);
                    const compact = COMPACT_BADGE_MAP[rawShift] || rawShift || '-';
                    row.push(compact);
                }
                dataRows.push(row);
            });

            const ws = XLSX.utils.aoa_to_sheet(dataRows);

            // Set column widths
            const colWidths = [
                { wch: 4 },  // No
                { wch: 28 }, // Nama
                { wch: 20 }, // NIP
                { wch: 18 }, // Posko
            ];
            for (let d = 1; d <= daysInMonth; d++) {
                colWidths.push({ wch: 5 }); // Hari
            }
            ws['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(wb, ws, `Jadwal_${monthLabel}_${selectedYear}`);

            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const filename = `Jadwal_Rekan_${monthLabel}_${selectedYear}.xlsx`;

            await saveFileWithDialog({
                blob: new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
                filename,
                extension: 'xlsx',
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                description: 'Berkas Spreadsheet Jadwal Shift Tim (.xlsx)',
            });

            onShowToast(`Berhasil mengekspor ${filename}`);
        } catch (err: any) {
            console.error(err);
            onShowToast('Gagal mengekspor file Excel.');
        }
    };

    // Print Spreadsheet
    const handlePrintLandscape = () => {
        window.print();
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto p-2 sm:p-3 lg:p-4 space-y-3 animate-in fade-in duration-200">
            {/* 1. Header Toolbar: Menggunakan SubToolbarHeader standar kalender kerja */}
            <SubToolbarHeader
                title="Jadwal Rekan"
                themeConfig={themeConfig}
                showMonthNavigation={true}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                isCurrentMonthAndYear={selectedMonth === today.getMonth() + 1 && selectedYear === today.getFullYear()}
                onJumpToToday={() => {
                    setSelectedMonth(today.getMonth() + 1);
                    setSelectedYear(today.getFullYear());
                }}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
                onOpenMonthPicker={() => setIsMonthPickerOpen(true)}
                rightContent={
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={handleExportXlsx}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-all active:scale-95 ${
                                themeConfig.isIndustrial
                                    ? 'bg-[#111317] hover:bg-[#1A1D23] border-[#2DD4BF]/40 text-[#2DD4BF]'
                                    : themeConfig.isPaperSketch
                                    ? 'bg-emerald-100 hover:bg-emerald-200 border-2 border-[#2b2b2b] text-[#2b2b2b] rounded-none'
                                    : themeConfig.isDashboard
                                    ? 'bg-[#78350F] hover:bg-[#5B2706] text-[#FFF5D0] border-[#5B2706]'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                            }`}
                            title="Unduh format spreadsheet Excel (.xlsx)"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Ekspor Excel</span>
                        </button>
                        <button
                            type="button"
                            onClick={handlePrintLandscape}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-all active:scale-95 ${
                                themeConfig.isIndustrial
                                    ? 'bg-[#111317] hover:bg-[#1A1D23] border-[rgba(226,232,240,0.2)] text-[#E2E8F0]'
                                    : themeConfig.isPaperSketch
                                    ? 'bg-white hover:bg-slate-100 border-2 border-[#2b2b2b] text-[#2b2b2b] rounded-none'
                                    : themeConfig.isDashboard
                                    ? 'bg-[#FFF0BE] hover:bg-[#FFE8A3] border-[#4D2A00]/30 text-[#4D2A00]'
                                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 border-slate-300 dark:border-zinc-700'
                            }`}
                            title="Cetak matriks atau simpan sebagai PDF Landscape"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Cetak / PDF</span>
                        </button>
                    </div>
                }
            />

            {/* Filter & Kontrol Bar */}
            <div className={`p-3 sm:p-4 rounded-xl border transition-all ${
                themeConfig.isIndustrial
                    ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.12)] text-[#E2E8F0]'
                    : themeConfig.isPaperSketch
                    ? 'bg-[#ffffff] border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] rounded-none'
                    : themeConfig.isTechnical
                    ? 'bg-[#FFFFFF] dark:bg-[#0D1117] border-[1.5px] border-[#111113] dark:border-slate-700 font-[\'JetBrains_Mono\'] rounded-none'
                    : themeConfig.isEditorial
                    ? 'bg-[#ffffff] border border-[#1a1a1a]/25 text-[#1a1a1a] font-[\'Geist_Mono\'] rounded-none shadow-2xs'
                    : theme === 'winamp'
                    ? 'bg-black border border-[#00FF00]/60 text-[#00FF00] font-mono rounded-none'
                    : theme === 'dashboard'
                    ? 'bg-[#FFF0BE] border border-[#4D2A00]/30 text-[#4D2A00]'
                    : 'bg-white dark:bg-[#1E1E1E] border-slate-200 dark:border-zinc-800 shadow-sm'
            }`}>
                {/* Baris Filter & Mode Tampilan */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
                    {/* Search & Filter Posko */}
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                        {/* Search Input */}
                        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari nama atau NIP rekan..."
                                className={`w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border outline-none transition-all ${
                                    themeConfig.isIndustrial
                                        ? 'bg-[#111317] border-[rgba(226,232,240,0.15)] text-[#E2E8F0] focus:border-[#2DD4BF]'
                                        : themeConfig.isPaperSketch
                                        ? 'bg-white border-2 border-[#2b2b2b] text-[#2b2b2b] rounded-none'
                                        : themeConfig.isDashboard
                                        ? 'bg-[#FFF0BE] border-[#4D2A00]/30 text-[#4D2A00] placeholder-[#4D2A00]/60 focus:ring-1 focus:ring-[#78350F]'
                                        : 'bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 focus:ring-1 focus:ring-teal-500'
                                }`}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* Dropdown Posko */}
                        <div className="flex items-center space-x-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <select
                                value={selectedPosko}
                                onChange={(e) => setSelectedPosko(e.target.value)}
                                className={`py-1.5 px-2.5 text-xs font-semibold rounded-lg border outline-none cursor-pointer ${
                                    themeConfig.isIndustrial
                                        ? 'bg-[#111317] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                                        : themeConfig.isPaperSketch
                                        ? 'bg-white border-2 border-[#2b2b2b] text-[#2b2b2b] rounded-none'
                                        : themeConfig.isDashboard
                                        ? 'bg-[#FFF0BE] border-[#4D2A00]/30 text-[#4D2A00]'
                                        : 'bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700'
                                }`}
                            >
                                <option value="all">Semua Posko Unit ({usersList.length})</option>
                                {poskoOptions.map((posko) => (
                                    <option key={posko} value={posko}>
                                        {posko} ({usersList.filter((u) => u.unitPosko === posko).length})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tombol Sinkronisasi Server Lokal */}
                        <button
                            type="button"
                            onClick={handleSyncFromServer}
                            disabled={isSyncingServer}
                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border flex items-center space-x-1.5 transition-colors cursor-pointer ${
                                themeConfig.isIndustrial
                                    ? 'bg-[#15181E] border-[rgba(226,232,240,0.15)] text-emerald-400 hover:bg-[#1A1D23]'
                                    : themeConfig.isPaperSketch
                                    ? 'bg-white border-2 border-[#2b2b2b] text-[#2b2b2b] rounded-none'
                                    : themeConfig.isDashboard
                                    ? 'bg-[#FFF0BE] border-[#4D2A00]/30 text-[#4D2A00] hover:bg-[#FFE8A3]'
                                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/50'
                            }`}
                            title="Sinkronkan data 120 personel di 5 posko resmi langsung dari server lokal"
                        >
                            <Server className={`w-3.5 h-3.5 ${isSyncingServer ? 'animate-spin text-emerald-500' : 'text-emerald-600 dark:text-emerald-400'}`} />
                            <span className="hidden sm:inline">Server Lokal (120 Staf)</span>
                            <span className="sm:hidden">Server</span>
                        </button>

                        {/* Tombol Filter Hanya Pinned / Favorit */}
                        <button
                            type="button"
                            onClick={() => setShowOnlyPinned((prev) => !prev)}
                            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border flex items-center space-x-1 transition-colors cursor-pointer ${
                                showOnlyPinned
                                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold'
                                    : 'bg-transparent border-current/15 text-slate-500 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                            title="Tampilkan hanya rekan yang diberi bintang / di-pin"
                        >
                            <Star className={`w-3.5 h-3.5 ${showOnlyPinned ? 'fill-amber-500 text-amber-500' : ''}`} />
                            <span>Favorit ({pinnedNips.length})</span>
                        </button>
                    </div>

                    {/* Mobile View Scope Segmented Button (Solusi UX Layar Ponsel) */}
                    <div className="flex items-center space-x-1 self-end md:self-auto shrink-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 hidden sm:inline mr-1">
                            Rentang Tampilan:
                        </span>
                        <div className={`p-0.5 rounded-lg border flex items-center text-[10.5px] font-bold ${
                            themeConfig.isIndustrial
                                ? 'bg-[#111317] border-[rgba(226,232,240,0.15)]'
                                : themeConfig.isDashboard
                                ? 'bg-[#FFF0BE] border-[#4D2A00]/30 text-[#4D2A00]'
                                : 'bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'
                        }`}>
                            <button
                                type="button"
                                onClick={() => setMobileScope('3days')}
                                className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                                    mobileScope === '3days'
                                        ? themeConfig.isDashboard ? 'bg-[#4D2A00] text-[#FFF5D0] shadow-xs' : 'bg-teal-600 text-white shadow-xs'
                                        : themeConfig.isDashboard ? 'text-[#4D2A00]/80 hover:bg-[#FFE8A3]' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                                title="Tampilkan 3 hari (Hari ini s.d. Lusa) - Sangat cocok di HP"
                            >
                                3 Hari
                            </button>
                            <button
                                type="button"
                                onClick={() => setMobileScope('7days')}
                                className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                                    mobileScope === '7days'
                                        ? themeConfig.isDashboard ? 'bg-[#4D2A00] text-[#FFF5D0] shadow-xs' : 'bg-teal-600 text-white shadow-xs'
                                        : themeConfig.isDashboard ? 'text-[#4D2A00]/80 hover:bg-[#FFE8A3]' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                                title="Tampilkan 7 hari ke depan"
                            >
                                7 Hari
                            </button>
                            <button
                                type="button"
                                onClick={() => setMobileScope('full')}
                                className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                                    mobileScope === 'full'
                                        ? themeConfig.isDashboard ? 'bg-[#4D2A00] text-[#FFF5D0] shadow-xs' : 'bg-teal-600 text-white shadow-xs'
                                        : themeConfig.isDashboard ? 'text-[#4D2A00]/80 hover:bg-[#FFE8A3]' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                                title="Tampilkan seluruh 31 hari dalam bulan ini (Swipe horizontal)"
                            >
                                1 Bulan Penuh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Petunjuk / Indikator Geser Horizontal di Mobile */}
            {mobileScope === 'full' && (
                <div className="flex md:hidden items-center justify-between px-2 text-[10.5px] text-slate-500 dark:text-zinc-400 bg-teal-500/5 border border-teal-500/15 rounded-lg py-1">
                    <span className="flex items-center gap-1 font-medium">
                        <Smartphone className="w-3 h-3 text-teal-600 shrink-0" />
                        Tabel dapat digeser ke samping untuk melihat seluruh tanggal
                    </span>
                    <span className="font-bold text-teal-600 dark:text-teal-400 shrink-0">Geser ➡️</span>
                </div>
            )}

            {/* 2. Spreadsheet Matrix Table Container (Sticky Freeze Panes) */}
            <div className={`relative border overflow-x-auto overflow-y-auto max-h-[calc(100vh-250px)] min-h-[420px] rounded-xl shadow-xs ${
                themeConfig.isIndustrial
                    ? 'border-[rgba(226,232,240,0.12)] bg-[#111317]'
                    : themeConfig.isPaperSketch
                    ? 'border-2 border-[#2b2b2b] bg-[#ffffff] shadow-[3px_3px_0px_#2b2b2b] rounded-none'
                    : themeConfig.isTechnical
                    ? 'border-[1.5px] border-[#111113] dark:border-slate-700 bg-white dark:bg-[#0D1117] font-[\'JetBrains_Mono\'] rounded-none'
                    : themeConfig.isEditorial
                    ? 'border border-[#1a1a1a]/25 bg-white font-[\'Geist_Mono\'] rounded-none'
                    : theme === 'winamp'
                    ? 'border border-[#00FF00]/60 bg-black font-mono rounded-none'
                    : theme === 'dashboard'
                    ? 'border-[#4D2A00]/25 bg-[#FFFBF0]'
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181B]'
            }`}>
                <table className="w-full border-collapse text-left border-spacing-0 select-none">
                    {/* Table Header (Freeze Header: Sticky Top) */}
                    <thead className="sticky top-0 z-30 shadow-2xs">
                        <tr className={`${
                            themeConfig.isIndustrial
                                ? 'bg-[#1A1D23] text-[#E2E8F0] border-b border-[rgba(226,232,240,0.15)]'
                                : themeConfig.isPaperSketch
                                ? 'bg-[#FFF8E7] text-[#2b2b2b] border-b-2 border-[#2b2b2b]'
                                : themeConfig.isTechnical
                                ? 'bg-[#F4F4F6] dark:bg-[#161B22] text-[#111113] dark:text-[#E6EDF3] border-b border-[#111113] dark:border-slate-700'
                                : theme === 'dashboard'
                                ? 'bg-[#FFF0BE] text-[#4D2A00] border-b border-[#4D2A00]/25'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-zinc-700'
                        }`}>
                            {/* Freeze Corner Top-Left: Kolom Nama & NIP (Sticky Left & Sticky Top) */}
                            <th className="sticky left-0 z-40 bg-inherit px-3 py-2.5 text-xs font-bold w-48 sm:w-60 min-w-[12rem] sm:min-w-[15rem] border-r border-current/15 shadow-[2px_0_5px_rgba(0,0,0,0.04)]">
                                <div className="flex items-center justify-between">
                                    <span>PEGAWAI / POSKO</span>
                                    <span className="text-[10px] font-mono opacity-70">
                                        ({filteredUsers.length})
                                    </span>
                                </div>
                            </th>

                            {/* Kolom Tanggal & Hari (Sumbu X) */}
                            {visibleDates.map((col) => {
                                const isSunday = col.dayName === 'Min';
                                const isSaturday = col.dayName === 'Sab';
                                const isHoliday = Boolean(col.holiday);

                                return (
                                    <th
                                        key={`th-date-${col.dateStr}`}
                                        className={`px-1 py-1.5 text-center min-w-[36px] sm:min-w-[42px] border-r border-current/10 ${
                                            col.isToday
                                                ? themeConfig.isDashboard
                                                    ? 'bg-[#78350F]/20 text-[#4D2A00] ring-2 ring-[#78350F] ring-inset'
                                                    : 'bg-teal-500/20 text-teal-800 dark:text-teal-200 ring-2 ring-teal-500 ring-inset'
                                                : isHoliday
                                                ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
                                                : isSunday || isSaturday
                                                ? 'bg-black/5 dark:bg-white/5 opacity-90'
                                                : ''
                                        }`}
                                        title={col.holiday ? `Libur Nasional: ${col.holiday.keterangan}` : `${col.dayName}, ${col.dayNum} ${MONTH_NAMES[selectedMonth - 1]}`}
                                    >
                                        <div className="flex flex-col items-center justify-center leading-none">
                                            <span className={`text-[11px] sm:text-xs font-black ${
                                                col.isToday
                                                    ? themeConfig.isDashboard
                                                        ? 'text-[#78350F] font-black scale-110'
                                                        : 'text-teal-600 dark:text-teal-300 font-extrabold scale-110'
                                                    : ''
                                            }`}>
                                                {col.dayNum}
                                            </span>
                                            <span className={`text-[8.5px] sm:text-[9px] font-mono mt-0.5 tracking-tight ${
                                                col.isToday
                                                    ? themeConfig.isDashboard
                                                        ? 'text-[#78350F] font-bold'
                                                        : 'text-teal-600 dark:text-teal-300 font-bold'
                                                    : isHoliday || isSunday
                                                    ? 'text-rose-600 dark:text-rose-400 font-bold'
                                                    : 'opacity-70'
                                            }`}>
                                                {col.dayName}
                                            </span>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-current/10 text-xs">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={visibleDates.length + 1}
                                    className="p-8 text-center text-slate-400 dark:text-zinc-500 font-medium"
                                >
                                    Tidak ada data rekan kerja yang cocok dengan filter atau kata kunci &apos;{searchQuery}&apos;.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user, rowIdx) => {
                                const isCurrentUser = user.nip === currentUserNip;
                                const isPinned = pinnedNips.includes(user.nip);

                                return (
                                    <tr
                                        key={`row-${user.nip}-${rowIdx}`}
                                        className={`transition-colors group ${
                                            isCurrentUser
                                                ? themeConfig.isDashboard
                                                    ? 'bg-[#FFE8A3] font-semibold'
                                                    : 'bg-teal-50/70 dark:bg-teal-950/20 font-semibold'
                                                : 'hover:bg-slate-50/80 dark:hover:bg-zinc-800/40'
                                        }`}
                                    >
                                        {/* Freeze Column Kiri: Kolom Nama & NIP (Sticky Left) */}
                                        <td className={`sticky left-0 z-20 px-2.5 py-1.5 sm:px-3 sm:py-2 border-r border-current/15 shadow-[2px_0_5px_rgba(0,0,0,0.04)] ${
                                            isCurrentUser
                                                ? themeConfig.isDashboard
                                                    ? 'bg-[#FFDF8A] text-[#4D2A00]'
                                                    : 'bg-teal-100/80 dark:bg-[#132B2B]'
                                                : themeConfig.isIndustrial
                                                ? 'bg-[#15181E] group-hover:bg-[#1A1D23]'
                                                : themeConfig.isPaperSketch
                                                ? 'bg-[#ffffff] group-hover:bg-[#FFFDF7]'
                                                : themeConfig.isTechnical
                                                ? 'bg-[#FFFFFF] dark:bg-[#0D1117] group-hover:bg-slate-50 dark:group-hover:bg-slate-900'
                                                : theme === 'dashboard'
                                                ? 'bg-[#FFF8E1] group-hover:bg-[#FFF2C4]'
                                                : 'bg-white dark:bg-[#18181B] group-hover:bg-slate-50 dark:group-hover:bg-zinc-800/80'
                                        }`}>
                                            <div className="flex items-center space-x-1.5 min-w-0">
                                                {/* Pin Button */}
                                                {!isCurrentUser && (
                                                    <button
                                                        type="button"
                                                        onClick={() => togglePinPeer(user.nip)}
                                                        className="text-slate-300 hover:text-amber-500 dark:text-zinc-600 dark:hover:text-amber-400 p-0.5 shrink-0 transition-colors cursor-pointer"
                                                        title={isPinned ? 'Lepas Pin Rekan' : 'Sematkan ke atas'}
                                                    >
                                                        <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-500 text-amber-500' : ''}`} />
                                                    </button>
                                                )}

                                                {/* Info Pegawai */}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center space-x-1 truncate">
                                                        <span
                                                            className={`truncate text-xs ${
                                                                isCurrentUser
                                                                    ? themeConfig.isDashboard
                                                                        ? 'text-[#4D2A00] font-black'
                                                                        : 'text-teal-700 dark:text-teal-300 font-extrabold'
                                                                    : 'font-bold text-slate-800 dark:text-slate-100'
                                                            }`}
                                                            title={user.name}
                                                        >
                                                            {user.name}
                                                        </span>
                                                        {isCurrentUser && (
                                                            <span className={`text-[9px] px-1 py-0.2 rounded font-black shrink-0 ${
                                                                themeConfig.isDashboard
                                                                    ? 'bg-[#4D2A00] text-[#FFF5D0]'
                                                                    : 'bg-teal-600 text-white'
                                                            }`}>
                                                                SAYA
                                                            </span>
                                                        )}
                                                        {(user.authorityProfileId === 'prof-posko-luar' || user.authorityName === 'PPF non User' || user.role === 'non-user' || user.isExternalNonAppUser) && (
                                                            <span
                                                                className="text-[8.5px] px-1 py-0.2 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-500/25 shrink-0"
                                                                title="PPF non User (Personel Posko Luar / Data Terpusat)"
                                                            >
                                                                PPF non User
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-1.5 text-[9.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                                        <span className="font-mono tracking-tight shrink-0">
                                                            {user.nip}
                                                        </span>
                                                        <span className="opacity-40">•</span>
                                                        <span className="truncate opacity-80" title={user.unitPosko}>
                                                            {user.unitPosko || 'Posko Umum'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Kolom Intersection Shift Tiap Hari */}
                                        {visibleDates.map((col) => {
                                            const shift = getShiftForUserAndDate(user, col.dateStr, col.dayNum);
                                            const normalized = normalizeShift(shift);
                                            const compactCode = COMPACT_BADGE_MAP[normalized] || COMPACT_BADGE_MAP[shift] || shift || '-';
                                            const colorConfig = SHIFT_COLORS[normalized] || SHIFT_COLORS[shift] || SHIFT_COLORS[''];

                                            const isSunday = col.dayName === 'Min';
                                            const isSaturday = col.dayName === 'Sab';
                                            const isHoliday = Boolean(col.holiday);

                                            return (
                                                <td
                                                    key={`cell-${user.nip}-${col.dateStr}`}
                                                    onClick={() => handleOpenCellDetail(user, col.dateStr, col.dayNum)}
                                                    className={`p-1 text-center border-r border-current/10 cursor-pointer transition-transform active:scale-95 group/cell ${
                                                        col.isToday
                                                            ? themeConfig.isDashboard
                                                                ? 'bg-[#78350F]/20'
                                                                : 'bg-teal-500/10 dark:bg-teal-500/15'
                                                            : isHoliday
                                                            ? 'bg-rose-500/5 dark:bg-rose-950/10'
                                                            : isSunday || isSaturday
                                                            ? 'bg-black/[0.02] dark:bg-white/[0.02]'
                                                            : ''
                                                    }`}
                                                    title={`Klik untuk rincian: ${user.name} - ${shift || 'Tanpa Shift'} (${col.dateStr})`}
                                                >
                                                    <div className="flex items-center justify-center">
                                                        <span
                                                            className={`inline-flex items-center justify-center font-mono font-black text-[10px] sm:text-[10.5px] px-1 py-0.5 rounded sm:rounded-md border shadow-2xs transition-all w-7 sm:w-8 h-6 sm:h-7 ${
                                                                colorConfig.bg
                                                            } ${colorConfig.text} ${colorConfig.border} group-hover/cell:ring-1 group-hover/cell:ring-current group-hover/cell:scale-105`}
                                                        >
                                                            {compactCode}
                                                        </span>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* 3. Ringkasan & Legenda Kode Shift */}
            <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2.5 text-xs ${
                themeConfig.isIndustrial
                    ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.12)] text-[#E2E8F0]'
                    : themeConfig.isPaperSketch
                    ? 'bg-white border-2 border-[#2b2b2b] rounded-none shadow-[2px_2px_0px_#2b2b2b]'
                    : 'bg-white dark:bg-[#1E1E1E] border-slate-200 dark:border-zinc-800'
            }`}>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400 mr-1">
                        Legenda Shift:
                    </span>
                    <div className="flex items-center space-x-1">
                        <span className="px-1.5 py-0.5 rounded font-mono font-black text-[10px] bg-[#EDF6F9] text-[#011627] border border-[#83C5BE]">
                            G
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-zinc-300">Graha Pagi</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span className="px-1.5 py-0.5 rounded font-mono font-black text-[10px] bg-[#83C5BE] text-[#0B0909] border border-[#006D77]">
                            SM
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-zinc-300">Siang-Malam</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span className="px-1.5 py-0.5 rounded font-mono font-black text-[10px] bg-[#2C4251] text-white border border-[#1B2A35]">
                            M
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-zinc-300">Malam</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span className="px-1.5 py-0.5 rounded font-mono font-black text-[10px] bg-[#E29578] text-white border border-[#C8775B]">
                            L
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-zinc-300">TPSL</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span className="px-1.5 py-0.5 rounded font-mono font-black text-[10px] bg-[#FFDDD2] text-[#011627] border border-[#E29578]">
                            N
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-zinc-300">NPCT</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span className="px-1.5 py-0.5 rounded font-mono font-black text-[10px] bg-[#BE1A1A] text-white border border-[#BE1A1A]">
                            OFF
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-zinc-300">Lepas / Libur</span>
                    </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Info className={`w-3.5 h-3.5 shrink-0 ${
                        themeConfig.isDashboard ? 'text-[#78350F]' : 'text-teal-600 dark:text-teal-400'
                    }`} />
                    <span>Klik sel mana saja untuk detail & ajakan tukar shift.</span>
                </div>
            </div>

            {/* 4. Modal Popover Detail Shift & Ajak Tukar Shift */}
            {selectedCellInfo && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="fixed inset-0"
                        onClick={() => setSelectedCellInfo(null)}
                    />
                    <div className={`relative z-10 w-full max-w-md rounded-2xl p-5 border shadow-2xl space-y-4 ${
                        themeConfig.isIndustrial
                            ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                            : themeConfig.isPaperSketch
                            ? 'bg-white border-3 border-[#2b2b2b] text-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b] rounded-none'
                            : themeConfig.isDashboard
                            ? 'bg-[#FFF5D0] border-[#4D2A00]/30 text-[#4D2A00]'
                            : 'bg-white dark:bg-[#1E1E1E] border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-slate-100'
                    }`}>
                        {/* Header Modal */}
                        <div className="flex items-center justify-between pb-3 border-b border-current/10">
                            <div className="flex items-center space-x-2.5">
                                <div className={`p-2 rounded-lg ${
                                    themeConfig.isDashboard ? 'bg-[#4D2A00]/15 text-[#4D2A00]' : 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
                                }`}>
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm sm:text-base font-bold">Rincian Shift Rekan</h3>
                                    <p className="text-[11px] opacity-75">
                                        Informasi penugasan & jam operasional posko
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedCellInfo(null)}
                                className="p-1 rounded-lg opacity-60 hover:opacity-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content Rincian */}
                        <div className="space-y-3 text-xs">
                            {/* Rekan Card */}
                            <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 space-y-1">
                                <div className="text-[10px] uppercase font-bold opacity-60">Pegawai:</div>
                                <div className="font-extrabold text-sm">
                                    {selectedCellInfo.user.name}
                                </div>
                                <div className="flex items-center space-x-2 opacity-80 font-mono text-[11px] flex-wrap gap-y-1">
                                    <span>NIP: {selectedCellInfo.user.nip}</span>
                                    <span>•</span>
                                    <span>{selectedCellInfo.user.unitPosko}</span>
                                    {(selectedCellInfo.user.authorityProfileId === 'prof-posko-luar' || selectedCellInfo.user.authorityName === 'PPF non User' || selectedCellInfo.user.role === 'non-user' || selectedCellInfo.user.isExternalNonAppUser) && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-500/25">
                                            PPF non User (Posko Luar)
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Tanggal & Shift Status */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2.5 rounded-lg border border-current/10 space-y-0.5">
                                    <div className="text-[10px] opacity-60">Tanggal:</div>
                                    <div className="font-bold">
                                        {selectedCellInfo.dayNum} {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                                    </div>
                                </div>
                                <div className="p-2.5 rounded-lg border border-current/10 space-y-0.5">
                                    <div className="text-[10px] opacity-60">Shift Penugasan:</div>
                                    <div className={`font-black ${
                                        themeConfig.isDashboard ? 'text-[#78350F]' : 'text-teal-600 dark:text-teal-400'
                                    }`}>
                                        {selectedCellInfo.shift || 'Non-Dinas'}
                                    </div>
                                </div>
                            </div>

                            {/* Jam Kerja & Lokasi */}
                            <div className="p-3 rounded-lg border border-current/10 space-y-1">
                                <div className="flex items-center space-x-1.5 font-bold">
                                    <Clock className={`w-3.5 h-3.5 shrink-0 ${
                                        themeConfig.isDashboard ? 'text-[#78350F]' : 'text-teal-600'
                                    }`} />
                                    <span>Jam Kerja: {SHIFT_HOURS_MAP[selectedCellInfo.shift] || 'Sesuai Penugasan'}</span>
                                </div>
                                <div className="flex items-center space-x-1.5 opacity-80">
                                    <MapPin className="w-3.5 h-3.5 shrink-0 opacity-60" />
                                    <span>Lokasi: {selectedCellInfo.user.unitPosko || 'Terminal Pelabuhan Tanjung Priok'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer Controls */}
                        <div className="pt-2 border-t border-current/10 flex items-center justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => setSelectedCellInfo(null)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                Tutup
                            </button>

                            {selectedCellInfo.user.nip !== currentUserNip && (
                                <button
                                    type="button"
                                    onClick={() => setIsSwapModalOpen(true)}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all active:scale-95 ${
                                        themeConfig.isIndustrial
                                            ? 'bg-[#2DD4BF] hover:bg-[#26b8a8] text-[#0F1115]'
                                            : themeConfig.isPaperSketch
                                            ? 'bg-amber-300 hover:bg-amber-400 text-[#2b2b2b] border border-[#2b2b2b] rounded-none'
                                            : themeConfig.isDashboard
                                            ? 'bg-[#78350F] hover:bg-[#5B2706] text-[#FFF5D0]'
                                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                                    }`}
                                >
                                    <ArrowRightLeft className="w-3.5 h-3.5" />
                                    <span>Ajak Tukar Shift</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 5. Modal Konfirmasi & Pengajuan Tukar Shift */}
            {isSwapModalOpen && selectedCellInfo && (
                <div
                    className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="fixed inset-0"
                        onClick={() => setIsSwapModalOpen(false)}
                    />
                    <div className={`relative z-10 w-full max-w-md rounded-2xl p-5 border shadow-2xl space-y-4 ${
                        themeConfig.isIndustrial
                            ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                            : themeConfig.isPaperSketch
                            ? 'bg-white border-3 border-[#2b2b2b] text-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b] rounded-none'
                            : 'bg-white dark:bg-[#1E1E1E] border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-slate-100'
                    }`}>
                        {/* Header Modal */}
                        <div className="flex items-center justify-between pb-3 border-b border-current/10">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400">
                                    <ArrowRightLeft className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm sm:text-base font-bold">Formulir Ajakan Tukar Shift</h3>
                                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                        Kirim permohonan pertukaran jadwal kepada rekan
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSwapModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Detail Perbandingan Tukar */}
                        <div className="space-y-3 text-xs">
                            <div className="p-3 rounded-xl border border-current/10 bg-teal-500/5 space-y-2">
                                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                                    <span>Target Rekan:</span>
                                    <strong className="text-slate-900 dark:text-slate-100">{selectedCellInfo.user.name}</strong>
                                </div>
                                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                                    <span>Tanggal Target:</span>
                                    <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                                        {selectedCellInfo.dayNum} {MONTH_NAMES[selectedMonth - 1]} {selectedYear} ({selectedCellInfo.shift})
                                    </span>
                                </div>
                            </div>

                            {/* Pilihan Tanggal Shift Milik Saya yang Ditawarkan */}
                            <div className="space-y-1">
                                <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                                    Pilih Tanggal Shift Anda yang Ditawarkan:
                                </label>
                                <select
                                    value={myOfferDate}
                                    onChange={(e) => setMyOfferDate(e.target.value)}
                                    className={`w-full p-2 text-xs font-semibold rounded-lg border outline-none cursor-pointer ${
                                        themeConfig.isIndustrial
                                            ? 'bg-[#111317] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                                            : themeConfig.isPaperSketch
                                            ? 'bg-white border-2 border-[#2b2b2b] text-[#2b2b2b] rounded-none'
                                            : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'
                                    }`}
                                >
                                    {dateList.map((d) => {
                                        const myShift = daysState[d.dateStr]?.shift || 'Non-Dinas';
                                        return (
                                            <option key={`my-opt-${d.dateStr}`} value={d.dateStr}>
                                                {d.dayName}, {d.dayNum} {MONTH_NAMES[selectedMonth - 1]} — Shift: {myShift}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* Alasan / Catatan */}
                            <div className="space-y-1">
                                <label className="block text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                                    Catatan / Alasan Pertukaran (Opsional):
                                </label>
                                <textarea
                                    value={swapReason}
                                    onChange={(e) => setSwapReason(e.target.value)}
                                    placeholder="Contoh: Ada keperluan dinas luar / mendesak pada tanggal tersebut..."
                                    rows={3}
                                    className={`w-full p-2 text-xs rounded-lg border outline-none ${
                                        themeConfig.isIndustrial
                                            ? 'bg-[#111317] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                                            : themeConfig.isPaperSketch
                                            ? 'bg-white border-2 border-[#2b2b2b] text-[#2b2b2b] rounded-none'
                                            : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'
                                    }`}
                                />
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="pt-2 border-t border-current/10 flex items-center justify-end space-x-2">
                            <button
                                type="button"
                                onClick={() => setIsSwapModalOpen(false)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSwapRequest}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all active:scale-95 ${
                                    themeConfig.isIndustrial
                                        ? 'bg-[#2DD4BF] hover:bg-[#26b8a8] text-[#0F1115]'
                                        : themeConfig.isPaperSketch
                                        ? 'bg-emerald-300 hover:bg-emerald-400 text-[#2b2b2b] border border-[#2b2b2b] rounded-none'
                                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                                }`}
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Kirim Permohonan</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Month-Year Picker Modal */}
            {isMonthPickerOpen && (
                <MonthYearPickerModal
                    isOpen={isMonthPickerOpen}
                    onClose={() => setIsMonthPickerOpen(false)}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onSelect={(m, y) => {
                        setSelectedMonth(m);
                        setSelectedYear(y);
                        setIsMonthPickerOpen(false);
                    }}
                    theme={theme}
                />
            )}
        </div>
    );
};
