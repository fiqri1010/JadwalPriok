import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Maximize2, 
  Minimize2, 
  CalendarDays, 
  Download, 
  Upload,
  Flag, 
  Lock, 
  Unlock, 
  Table as TableIcon, 
  Award, 
  ClipboardPaste, 
  Menu, 
  X, 
  RotateCcw, 
  Undo2, 
  AlertTriangle,
  BookOpen,
  Sliders,
  Database,
  ShieldCheck,
  Save,
  RefreshCw,
  Moon,
  Sun,
  Cloud,
  Palette,
  Sparkles,
  Radio
} from 'lucide-react';
import { SHIFT_OPTIONS, DayData, ShiftType, EXCEL_SHIFT_MAPPING, LiburNasional, AppTheme, APP_VERSION_DISPLAY } from './types';
import { getThemeConfig } from './themeConfig';
import { calculateDayResult, calculateMonthSummary } from './lib/calculator';
import { DayCell } from './components/DayCell';
import { DayDetailModal } from './components/DayDetailModal';
import { SummaryCards } from './components/SummaryCards';
import { RecapTable } from './components/RecapTable';
import { PerformanceView } from './components/PerformanceView';
import { SettingsModal } from './components/SettingsModal';
import { TimePickerModal } from './components/TimePickerModal';
import { MonthYearPickerModal } from './components/MonthYearPickerModal';
import { HolidayManagerModal } from './components/HolidayManagerModal';
import { GuideView } from './components/GuideView';
import { PasteExcelModal } from './components/PasteExcelModal';
import { WindowTitleBar } from './components/WindowTitleBar';
import { AppLogo } from './components/AppLogo';
import { 
  syncTwoWaySupabase, 
  pushSingleDaySupabase, 
  pushAllToSupabase,
  pullAllFromSupabase 
} from './lib/supabaseSync';

/**
 * ==============================================================================
 * INSTRUKSI SQL UNTUK TABEL libur_nasional DI SUPABASE SQL EDITOR:
 * Jalankan script SQL berikut di Supabase Console -> SQL Editor:
 * ------------------------------------------------------------------------------
 * CREATE TABLE IF NOT EXISTS public.libur_nasional (
 *   tanggal TEXT PRIMARY KEY, -- Format YYYY-MM-DD (e.g. '2026-08-17')
 *   keterangan TEXT NOT NULL,  -- Keterangan libur (e.g. 'Hari Kemerdekaan RI')
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
 * );
 * 
 * -- Hak akses publik & service role
 * GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
 * GRANT ALL ON TABLE public.libur_nasional TO anon, authenticated, service_role;
 * 
 * -- Aktifkan RLS & izinkan pembacaan serta penulisan publik (anon key)
 * ALTER TABLE public.libur_nasional ENABLE ROW LEVEL SECURITY;
 * 
 * DROP POLICY IF EXISTS "Akses Penuh Publik Libur Nasional" ON public.libur_nasional;
 * CREATE POLICY "Akses Penuh Publik Libur Nasional"
 * ON public.libur_nasional
 * FOR ALL
 * TO public
 * USING (true)
 * WITH CHECK (true);
 * 
 * NOTIFY pgrst, 'reload schema';
 * ==============================================================================
 */
function getSupabaseClientInstance(url: string, key: string): SupabaseClient | null {
  if (!url?.trim() || !key?.trim()) return null;
  try {
    return createClient(url.trim(), key.trim());
  } catch (err) {
    console.error('Error creating Supabase client instance:', err);
    return null;
  }
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const YEARS = Array.from({ length: 9 }, (_, i) => 2024 + i); // 2024 - 2032

interface ResetBackup {
  year: number;
  month: number;
  backupData: Record<string, DayData>;
}

export default function App() {
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedMonth = localStorage.getItem('last_active_month');
      if (savedMonth) {
        const parsed = parseInt(savedMonth, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 12) return parsed;
      }
    }
    return new Date().getMonth() + 1; // 1-12
  });
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedYear = localStorage.getItem('last_active_year');
      if (savedYear) {
        const parsed = parseInt(savedYear, 10);
        if (!isNaN(parsed) && parsed >= 1970 && parsed <= 2100) return parsed;
      }
    }
    return new Date().getFullYear();
  });

  useEffect(() => {
    localStorage.setItem('last_active_month', selectedMonth.toString());
  }, [selectedMonth]);

  useEffect(() => {
    localStorage.setItem('last_active_year', selectedYear.toString());
  }, [selectedYear]);
  const [pageTab, setPageTab] = useState<'calendar' | 'recap' | 'performance' | 'guide'>('calendar');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'storage' | 'export' | 'import' | 'flutter'>('storage');
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [detailModalDay, setDetailModalDay] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTempelJadwalOpen, setIsTempelJadwalOpen] = useState(false);
  const [pasteInitialText, setPasteInitialText] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [lastResetBackupState, setLastResetBackupState] = useState<ResetBackup | null>(null);

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Time Picker Modal State
  const [timePickerState, setTimePickerState] = useState<{
    isOpen: boolean;
    title: string;
    field: 'jamMasuk' | 'jamPulang' | 'absenCeisa';
    dayKey: string;
    year: number;
    month: number;
    day: number;
    currentValue: string;
  }>({
    isOpen: false,
    title: '',
    field: 'jamMasuk',
    dayKey: '',
    year: selectedYear,
    month: selectedMonth,
    day: 1,
    currentValue: '',
  });

  // Supabase Settings State
  const [supabaseUrl, setSupabaseUrl] = useState<string>(() => localStorage.getItem('supabase_url') || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>(() => localStorage.getItem('supabase_anon_key') || '');
  const [lastPingMs, setLastPingMs] = useState<number | null>(null);
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Theme State: default, dark, vista, winamp
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('app_theme') as AppTheme;
      if (savedTheme && ['default', 'dark', 'vista', 'winamp'].includes(savedTheme)) {
        return savedTheme;
      }
      if (localStorage.getItem('theme_dark_mode') === 'true') {
        return 'dark';
      }
    }
    return 'default';
  });
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  // Centralized Theme Configuration
  const themeConfig = useMemo(() => getThemeConfig(currentTheme), [currentTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('app_theme', currentTheme);
  }, [currentTheme]);

  // Supabase Client instance (terhubung langsung ke Supabase JS SDK)
  const supabase = useMemo(
    () => getSupabaseClientInstance(supabaseUrl, supabaseAnonKey),
    [supabaseUrl, supabaseAnonKey]
  );

  // State daftarLibur: Libur Nasional / Tanggal Merah (Bebas Konflik State)
  const [daftarLibur, setDaftarLibur] = useState<LiburNasional[]>(() => {
    try {
      const saved = localStorage.getItem('libur_nasional_data');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // BACA DATA DARI SUPABASE (READ):
  // Buat fungsi asinkron fetchLibur() yang melakukan await supabase.from('libur_nasional').select('*')
  const fetchLibur = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('libur_nasional').select('*');
      if (error) {
        console.error('Error fetching libur_nasional from Supabase (Periksa RLS Policy):', error);
        return;
      }
      if (data) {
        const formatted: LiburNasional[] = data.map((item: any) => ({
          tanggal: String(item.tanggal || '').trim(),
          keterangan: String(item.keterangan || '').trim(),
        }));
        setDaftarLibur(formatted);
        try {
          localStorage.setItem('libur_nasional_data', JSON.stringify(formatted));
        } catch (e) {
          console.error('Error committing libur_nasional to localStorage:', e);
        }
      }
    } catch (err) {
      console.error('Exception fetching libur_nasional from Supabase:', err);
    }
  }, [supabase]);

  // WAJIB: Panggil fetchLibur() di dalam useEffect saat komponen pertama kali di-mount agar data dari cloud langsung ditarik.
  useEffect(() => {
    fetchLibur();
  }, [fetchLibur]);

  // TAMBAH KE SUPABASE (WRITE):
  // Saat menambah libur, lakukan await supabase.from('libur_nasional').insert(...)
  const handleAddLibur = async (tanggal: string, keterangan: string): Promise<boolean> => {
    const dataBaru: LiburNasional = { tanggal, keterangan };
    if (supabase) {
      try {
        const { error } = await supabase
          .from('libur_nasional')
          .upsert([{ tanggal: dataBaru.tanggal, keterangan: dataBaru.keterangan }]);
        if (error) {
          console.error('Error inserting libur_nasional to Supabase (Periksa RLS Policy Supabase):', error);
          alert(`Gagal menyimpan ke Supabase: ${error.message}\nPastikan SQL tabel libur_nasional & RLS policy sudah dijalankan.`);
          return false;
        }
        // JIKA INSERT BERHASIL (tidak ada error), baru perbarui state lokal:
        setDaftarLibur((prev) => {
          const next = [...prev.filter((item) => item.tanggal !== tanggal), dataBaru];
          try {
            localStorage.setItem('libur_nasional_data', JSON.stringify(next));
          } catch (e) {
            console.error(e);
          }
          return next;
        });
        return true;
      } catch (err) {
        console.error('Exception inserting libur_nasional to Supabase:', err);
        return false;
      }
    } else {
      // Mode Lokal jika Supabase belum terhubung
      setDaftarLibur((prev) => {
        const next = [...prev.filter((item) => item.tanggal !== tanggal), dataBaru];
        try {
          localStorage.setItem('libur_nasional_data', JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });
      return true;
    }
  };

  // HAPUS DARI SUPABASE (DELETE):
  // Saat menghapus, gunakan await supabase.from('libur_nasional').delete().eq('tanggal', tanggalYangDihapus)
  const handleDeleteLibur = async (tanggalYangDihapus: string): Promise<boolean> => {
    if (supabase) {
      try {
        const { error } = await supabase
          .from('libur_nasional')
          .delete()
          .eq('tanggal', tanggalYangDihapus);
        if (error) {
          console.error('Error deleting libur_nasional from Supabase (Periksa RLS Policy Supabase):', error);
          alert(`Gagal menghapus dari Supabase: ${error.message}`);
          return false;
        }
        // JIKA DELETE BERHASIL (tidak ada error), baru perbarui state lokal:
        setDaftarLibur((prev) => {
          const next = prev.filter((item) => item.tanggal !== tanggalYangDihapus);
          try {
            localStorage.setItem('libur_nasional_data', JSON.stringify(next));
          } catch (e) {
            console.error(e);
          }
          return next;
        });
        return true;
      } catch (err) {
        console.error('Exception deleting libur_nasional from Supabase:', err);
        return false;
      }
    } else {
      setDaftarLibur((prev) => {
        const next = prev.filter((item) => item.tanggal !== tanggalYangDihapus);
        try {
          localStorage.setItem('libur_nasional_data', JSON.stringify(next));
        } catch (e) {
          console.error(e);
        }
        return next;
      });
      return true;
    }
  };

  // Days State: Disimpan murni di LocalStorage
  // Clean Reset Default: Semua data awal kosong untuk setiap bulan saat clean install
  const [daysState, setDaysState] = useState<Record<string, DayData>>(() => {
    try {
      if (typeof window !== 'undefined') {
        const isCleanInstalled = localStorage.getItem('app_clean_install_fresh_v1');
        if (!isCleanInstalled) {
          localStorage.removeItem('shift_calendar_data');
          localStorage.setItem('app_clean_install_fresh_v1', 'true');
          return {};
        }
      }
      const saved = localStorage.getItem('shift_calendar_data');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Default: All cells folded on mobile / initially
  const [expandedCells, setExpandedCells] = useState<Record<string, boolean>>({});

  // Desktop Screen Metrics via devicePixelRatio & screen.width
  const [desktopScreenMetrics, setDesktopScreenMetrics] = useState(() => {
    if (typeof window === 'undefined') return { cssWidth: 1280, dpr: 1, physicalWidth: 1280 };
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = window.screen?.width || window.innerWidth || 1280;
    const physicalWidth = cssWidth * dpr;
    return { cssWidth, dpr, physicalWidth };
  });

  useEffect(() => {
    if (isMobile) return;
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const cssWidth = window.screen?.width || window.innerWidth || 1280;
      const physicalWidth = cssWidth * dpr;
      setDesktopScreenMetrics({ cssWidth, dpr, physicalWidth });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Dynamic container class for desktop view based on screen ratio & physical resolution
  const desktopContainerClass = useMemo(() => {
    if (isMobile) return 'w-full px-1.5 sm:px-2.5';
    const { cssWidth, physicalWidth } = desktopScreenMetrics;
    if (physicalWidth >= 1920 || cssWidth >= 1600) {
      return 'max-w-[1700px] mx-auto px-4 lg:px-6';
    } else if (physicalWidth >= 1400 || cssWidth >= 1366) {
      return 'max-w-[1500px] mx-auto px-3 lg:px-5';
    }
    return 'max-w-7xl mx-auto px-2 sm:px-3 lg:px-4';
  }, [isMobile, desktopScreenMetrics]);

  // LocalStorage persistence
  useEffect(() => {
    try {
      localStorage.setItem('shift_calendar_data', JSON.stringify(daysState));
    } catch (e) {
      console.error(e);
    }
  }, [daysState]);

  const handleSaveSupabase = (url: string, key: string) => {
    setSupabaseUrl(url);
    setSupabaseAnonKey(key);
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_anon_key', key);
  };

  const handleCleanResetApp = () => {
    try {
      localStorage.removeItem('shift_calendar_data');
      localStorage.removeItem('libur_nasional_data');
      localStorage.removeItem('last_active_month');
      localStorage.removeItem('last_active_year');
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
    setDaysState({});
    setLastResetBackupState(null);
    setExpandedCells({});
    setToastMessage('Aplikasi berhasil di-reset bersih (Clean Reset)!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTestPing = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      alert('Silakan masukkan Supabase URL dan Anon Key terlebih dahulu.');
      return;
    }
    const cleanUrl = supabaseUrl.trim().replace(/\/+$/, '');
    const endpoint = `${cleanUrl}/rest/v1/`;
    const start = performance.now();
    try {
      const res = await fetch(endpoint, {
        headers: {
          apikey: supabaseAnonKey.trim(),
          Authorization: `Bearer ${supabaseAnonKey.trim()}`,
        },
      });
      const end = performance.now();
      const elapsed = Math.round(end - start);
      setLastPingMs(elapsed);
      if (res.ok || res.status < 500) {
        alert(`Ping berhasil: ${elapsed}ms`);
      } else {
        alert(`Respons status: ${res.status} (${elapsed}ms)`);
      }
    } catch (err) {
      setLastPingMs(null);
      alert('Gagal menghubungi endpoint Supabase. Mode lokal digunakan.');
    }
  };

  const handleSaveAndSync = async () => {
    setIsSavingLocal(true);
    try {
      localStorage.setItem('shift_calendar_data', JSON.stringify(daysState));
    } catch (err) {
      console.error('Save Error:', err);
    }

    if (supabaseUrl.trim() && supabaseAnonKey.trim()) {
      setIsSyncing(true);
      try {
        const res = await syncTwoWaySupabase(supabaseUrl, supabaseAnonKey, daysState);
        if (res.success) {
          setDaysState(res.mergedData);
          setToastMessage('Data tersimpan lokal & sinkron ke Cloud!');
        } else {
          setToastMessage(`Tersimpan lokal. Status Cloud: ${res.message}`);
        }
      } catch (err: any) {
        setToastMessage(`Tersimpan lokal. Gagal Cloud: ${err?.message || 'Periksa koneksi'}`);
      } finally {
        setIsSyncing(false);
      }
    } else {
      setToastMessage('Semua data kalender tersimpan aman di penyimpanan lokal.');
    }
    setTimeout(() => setIsSavingLocal(false), 400);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getDayData = (year: number, month: number, day: number): DayData => {
    const key = `${year}-${month}-${day}`;
    if (daysState[key]) {
      return daysState[key];
    }
    return {
      shift: '', // DEFAULT KOSONG (CLEAR)
      isLocked: true, // DEFAULT TERKUNCI
      note: '',
      isMasuk: false, // DEFAULT TIDAK MASUK
      tipeMasukLibur: 'piket',
      isHoldDokumen: false,
      jamMasuk: '',
      jamPulang: '',
      absenCeisa: '',
      isSuratTugasTambahan: false,
      isManualHoliday: false,
    };
  };

  const updateDayData = (year: number, month: number, day: number, partial: Partial<DayData>) => {
    const key = `${year}-${month}-${day}`;
    setDaysState((prev) => {
      const current = prev[key] || getDayData(year, month, day);
      const updatedObj = { ...current, ...partial };
      const next = {
        ...prev,
        [key]: updatedObj,
      };

      try {
        localStorage.setItem('shift_calendar_data', JSON.stringify(next));
      } catch (e) {
        console.error('Error committing to localStorage:', e);
      }

      if (supabaseUrl.trim() && supabaseAnonKey.trim()) {
        pushSingleDaySupabase(supabaseUrl, supabaseAnonKey, key, updatedObj).catch((err) =>
          console.error('Supabase single day update error:', err)
        );
      }

      return next;
    });
  };

  const handleApplyHolidays = (updates: Record<string, Partial<DayData>>) => {
    setDaysState((prev) => {
      const next = { ...prev };
      for (const [key, partial] of Object.entries(updates)) {
        const [y, m, d] = key.split('-').map(Number);
        if (!y || !m || !d) continue;
        const normalizedKey = `${y}-${m}-${d}`;
        const current = prev[normalizedKey] || prev[key] || getDayData(y, m, d);
        next[normalizedKey] = { ...current, ...partial };
        if (key !== normalizedKey && next[key]) {
          delete next[key];
        }
      }

      // Force immediate full localStorage commit after any holiday array / day modification
      try {
        localStorage.setItem('shift_calendar_data', JSON.stringify(next));
      } catch (e) {
        console.error('Error committing to localStorage:', e);
      }

      // Sync to Supabase cloud if configured, using the updated next state
      if (supabaseUrl.trim() && supabaseAnonKey.trim()) {
        for (const [key, partial] of Object.entries(updates)) {
          const [y, m, d] = key.split('-').map(Number);
          if (!y || !m || !d) continue;
          const normalizedKey = `${y}-${m}-${d}`;
          const updatedObj = next[normalizedKey];
          if (updatedObj) {
            pushSingleDaySupabase(supabaseUrl, supabaseAnonKey, normalizedKey, updatedObj).catch((err) =>
              console.error('Supabase push error:', err)
            );
          }
        }
      }

      return next;
    });
  };

  const handleTempelJadwal = useCallback(async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          // Parse directly
          const firstLine = text.replace(/\r/g, '').split('\n')[0];
          let cells = firstLine.split('\t');
          if (cells.length <= 1 && firstLine.includes(',')) {
            cells = firstLine.split(',');
          } else if (cells.length <= 1 && firstLine.includes(';')) {
            cells = firstLine.split(';');
          } else if (cells.length <= 1 && firstLine.includes(' ')) {
            cells = firstLine.split(/\s+/);
          }

          const daysInCurrentMonth = new Date(selectedYear, selectedMonth, 0).getDate();
          const updates: Record<string, Partial<DayData>> = {};
          let updatedCount = 0;

          for (let i = 0; i < daysInCurrentMonth && i < cells.length; i++) {
            const cellText = cells[i].trim().toUpperCase();
            if (cellText.length > 0) {
              let matched: ShiftType | null = null;
              if (EXCEL_SHIFT_MAPPING[cellText]) {
                matched = EXCEL_SHIFT_MAPPING[cellText];
              } else {
                const found = SHIFT_OPTIONS.find((opt) => opt.toUpperCase() === cellText);
                if (found) matched = found;
              }

              if (matched) {
                const day = i + 1;
                const key = `${selectedYear}-${selectedMonth}-${day}`;
                updates[key] = { shift: matched };
                updatedCount++;
              }
            }
          }

          if (updatedCount > 0) {
            handleApplyHolidays(updates);
            setToastMessage(`Berhasil tempel jadwal (${updatedCount} hari diperbarui)`);
            setTimeout(() => setToastMessage(null), 3500);
            return;
          } else {
            // Text was read, but let user see and adjust in modal
            setPasteInitialText(text);
            setIsTempelJadwalOpen(true);
            return;
          }
        }
      }
      // If clipboard empty or not supported, open modal
      setPasteInitialText('');
      setIsTempelJadwalOpen(true);
    } catch {
      // Permission blocked by iframe policy: open modal directly for Ctrl+V
      setPasteInitialText('');
      setIsTempelJadwalOpen(true);
    }
  }, [selectedYear, selectedMonth, handleApplyHolidays]);

  const handleResetCalendar = () => {
    if (areAllLocked) {
      setToastMessage('Buka kunci data terlebih dahulu untuk melakukan reset');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    setIsResetConfirmOpen(true);
  };

  const executeReset = () => {
    // 1. Simpan backup data kalender khusus untuk bulan yang di-reset agar bisa dibatalkan (Undo)
    const daysInCurrentMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const monthBackup: Record<string, DayData> = {};
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const key = `${selectedYear}-${selectedMonth}-${d}`;
      if (daysState[key]) {
        monthBackup[key] = { ...daysState[key] };
      } else {
        monthBackup[key] = getDayData(selectedYear, selectedMonth, d);
      }
    }

    setLastResetBackupState({
      year: selectedYear,
      month: selectedMonth,
      backupData: monthBackup,
    });

    // 2. Kosongkan semua data di kalender termasuk jadwal shift untuk bulan aktif
    const updates: Record<string, Partial<DayData>> = {};
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const key = `${selectedYear}-${selectedMonth}-${d}`;
      updates[key] = {
        shift: '', // Mengosongkan shift secara eksplisit
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
        isGunakanOffGeser: false,
        referensiTglOff: '',
      };
    }
    handleApplyHolidays(updates);
    setIsResetConfirmOpen(false);
    setToastMessage(`Semua data kalender ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} telah dikosongkan.`);
    setTimeout(() => setToastMessage(null), 6000);
  };

  const handleUndoReset = () => {
    if (!lastResetBackupState) return;
    const { year, month, backupData } = lastResetBackupState;

    setDaysState((prev) => {
      const next = { ...prev };
      for (const [key, rawData] of Object.entries(backupData)) {
        if (rawData && typeof rawData === 'object') {
          next[key] = rawData;
        }
      }
      try {
        localStorage.setItem('shift_calendar_data', JSON.stringify(next));
      } catch (e) {
        console.error('Error committing to localStorage:', e);
      }
      return next;
    });

    setLastResetBackupState(null);
    setToastMessage(`Reset kalender bulan ${MONTH_NAMES[month - 1]} ${year} berhasil dibatalkan. Data dipulihkan.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  // Swipe Navigation untuk Kalender Grid (Layar Sentuh / Mobile)
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches && e.touches.length > 0) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    if (e.changedTouches && e.changedTouches.length > 0) {
      const diffX = e.changedTouches[0].clientX - touchStartX.current;
      const diffY = e.changedTouches[0].clientY - touchStartY.current;

      // Threshold: Minimal geser horizontal 50px, dan gerakan horizontal minimal 1.5x gerakan vertikal
      if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
        if (diffX > 0) {
          // Geser ke kanan -> bulan sebelumnya
          handlePrevMonth();
        } else {
          // Geser ke kiri -> bulan berikutnya
          handleNextMonth();
        }
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Global Keyboard Shortcuts: 'S' (Settings), 'L' (Holiday), 'T' (Paste/Tempel Jadwal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Abaikan jika ada tombol modifier (Ctrl, Meta, Alt) agar tidak bentrok dengan fungsi default browser
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Abaikan jika fokus sedang berada pada elemen form, input, textarea, atau contenteditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Abaikan jika popout modal sedang terbuka yang butuh fokus eksklusif
      if (detailModalDay !== null || timePickerState.isOpen || isMonthPickerOpen || isResetConfirmOpen) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 's') {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
      } else if (key === 'l') {
        e.preventDefault();
        setIsHolidayModalOpen((prev) => !prev);
      } else if (key === 't') {
        e.preventDefault();
        handleTempelJadwal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [detailModalDay, timePickerState.isOpen, isMonthPickerOpen, isResetConfirmOpen, handleTempelJadwal]);

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const firstDayOffset = (firstDay + 6) % 7;

  // Rekapitulasi Bulan Ini menggunakan centralized calculator (terintegrasi libur_nasional)
  const monthSummary = calculateMonthSummary(daysState, selectedYear, selectedMonth, daftarLibur);

  // Toggle All Expand / Collapse
  const areAllExpanded = Array.from({ length: daysInMonth }).every(
    (_, i) => expandedCells[`${selectedYear}-${selectedMonth}-${i + 1}`] === true
  );

  const toggleAllExpand = () => {
    const newState: Record<string, boolean> = {};
    const targetVal = !areAllExpanded;
    for (let d = 1; d <= daysInMonth; d++) {
      newState[`${selectedYear}-${selectedMonth}-${d}`] = targetVal;
    }
    setExpandedCells((prev) => ({ ...prev, ...newState }));
  };

  // Toggle All Lock / Unlock for current month
  const areAllLocked = Array.from({ length: daysInMonth }).every(
    (_, i) => getDayData(selectedYear, selectedMonth, i + 1).isLocked === true
  );

  const toggleAllLock = () => {
    const targetVal = !areAllLocked;
    const updates: Record<string, Partial<DayData>> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      updates[`${selectedYear}-${selectedMonth}-${d}`] = { isLocked: targetVal };
    }
    handleApplyHolidays(updates);
  };

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col ${themeConfig.wrapperClass.replace('min-h-screen', 'h-full')}`}>
      {/* 1. Desktop Window Title Bar: Fixed / Static at top, never scrolls */}
      {!isMobile && (
        <div className="shrink-0 z-50">
          <WindowTitleBar 
            theme={currentTheme} 
            title={`JadwalPriok ${APP_VERSION_DISPLAY}`}
            subtitle="Jadwal Pemeriksa Fisik dan Performance View"
          />
        </div>
      )}

      {/* 2. Scrollable Body: Content scrolls inside here, strictly below the Title Bar */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col">
        {/* Top Navbar: Desktop Header */}
        {!isMobile && (
          <header className={themeConfig.navbarClass}>
            <div className={`flex items-center justify-between py-1.5 sm:py-2 ${desktopContainerClass}`}>
              <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
                <div className={themeConfig.logoContainerClass}>
                  <AppLogo className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h1 className={themeConfig.titleClass}>
                      JadwalPriok
                    </h1>
                    <span className={themeConfig.versionBadgeClass}>
                      {APP_VERSION_DISPLAY}
                    </span>
                  </div>
                <p className={themeConfig.subtitleClass}>
                  Jadwal Pemeriksa Fisik dan Performance View
                </p>
              </div>
            </div>

            {/* Desktop Top Actions */}
            <div className="hidden sm:flex items-center space-x-1.5 sm:space-x-2">
              {/* Storage Mode / Supabase Status Badge */}
              <div className={themeConfig.supabaseBadgeClass}>
                {supabaseUrl ? (
                  <>
                    <Cloud className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="font-semibold text-emerald-100">Supabase Connected</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-300" />
                    <span className="font-semibold text-amber-100">Penyimpanan Lokal Aktif</span>
                  </>
                )}
              </div>

              {/* 1. Tombol Libur */}
              <button
                type="button"
                onClick={() => setIsHolidayModalOpen(true)}
                className={themeConfig.holidayBtnClass}
                title="Kelola & Input Hari Libur Nasional / Cuti Bersama"
              >
                <Flag className="h-3.5 w-3.5 fill-white" />
                <span>Libur</span>
              </button>

              {/* Dropdown Tema */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                  className={themeConfig.themeDropdownBtnClass}
                  title="Pilih Tema Tampilan (Default, Dark Mode (Alpha), Vista (Alpha), Winamp (Beta))"
                  aria-label="Pilih Tema Tampilan"
                >
                  <Palette className="h-4 w-4" />
                </button>

                {/* Dropdown Popup */}
                {isThemeDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsThemeDropdownOpen(false)}
                    />
                    <div className={themeConfig.themeDropdownMenuClass}>
                      <div className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider opacity-60">
                        Pilihan Tema Tampilan
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentTheme('default');
                          setIsThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          currentTheme === 'default' ? 'bg-[#2EC4B6]/20 text-[#2EC4B6]' : 'hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <span className="flex items-center space-x-2">
                          <Sun className="h-4 w-4 text-amber-500" />
                          <span>Default</span>
                        </span>
                        {currentTheme === 'default' && <Check className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentTheme('dark');
                          setIsThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          currentTheme === 'dark' ? 'bg-slate-700 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <span className="flex items-center space-x-2">
                          <Moon className="h-4 w-4 text-indigo-400" />
                          <span>Dark Mode (Alpha)</span>
                        </span>
                        {currentTheme === 'dark' && <Check className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentTheme('vista');
                          setIsThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          currentTheme === 'vista' ? 'bg-sky-100 text-sky-800' : 'hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                      >
                        <span className="flex items-center space-x-2">
                          <Sparkles className="h-4 w-4 text-sky-500" />
                          <span>Vista (Alpha)</span>
                        </span>
                        {currentTheme === 'vista' && <Check className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentTheme('winamp');
                          setIsThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-none text-xs font-bold font-mono transition-colors cursor-pointer ${
                          currentTheme === 'winamp' ? 'bg-[#000000] text-[#00FF00] border border-[#00FF00]' : 'hover:bg-black/20 text-[#00FF00]'
                        }`}
                      >
                        <span className="flex items-center space-x-2">
                          <Radio className="h-4 w-4 text-emerald-400" />
                          <span>Winamp (Beta)</span>
                        </span>
                        {currentTheme === 'winamp' && <Check className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* 2. Tombol Pengaturan */}
              <button
                type="button"
                onClick={() => {
                  setSettingsInitialTab('storage');
                  setIsSettingsOpen(true);
                }}
                className={themeConfig.settingsBtnClass}
                title="Pengaturan Database Cloud, Ekspor & Impor"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Pengaturan</span>
              </button>

              {/* 3. Tombol Sync & Simpan */}
              <button
                type="button"
                onClick={handleSaveAndSync}
                disabled={isSavingLocal || isSyncing}
                title="Simpan data lokal & sinkronisasi dengan Cloud Supabase"
                className={themeConfig.syncBtnClass}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sync Cloud...' : isSavingLocal ? 'Menyimpan...' : 'Sync & Simpan'}</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Mobile Top Navbar with AppLogo */}
      {isMobile && (
        <header className={themeConfig.navbarClass}>
          <div className="flex items-center justify-between py-1.5 px-2.5">
            <div className="flex items-center space-x-2 min-w-0">
              <AppLogo className="h-7 w-7 rounded-lg shadow-xs shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className={themeConfig.titleClass}>
                    JadwalPriok
                  </h1>
                  <span className={themeConfig.versionBadgeClass}>
                    {APP_VERSION_DISPLAY}
                  </span>
                </div>
                <p className={themeConfig.subtitleClass}>
                  Jadwal Pemeriksa Fisik & Perform
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setIsHolidayModalOpen(true)}
                className={themeConfig.holidayBtnClass}
                title="Kelola & Input Hari Libur"
              >
                <Flag className="h-3 w-3 fill-white" />
                <span className="text-[11px]">Libur</span>
              </button>
            </div>
          </div>
        </header>
      )}
      <main className={`flex-1 w-full ${desktopContainerClass}`}>
        <div className="space-y-1.5 sm:space-y-2 lg:space-y-2.5">
            {/* View Switcher Frame: Kalender vs Rekapitulasi vs Perform CEISA vs Petunjuk + Month Selector */}
            <div className={themeConfig.viewSwitcherCardClass}>
              <div className={themeConfig.viewSwitcherPillsWrapperClass}>
                <button
                  type="button"
                  onClick={() => setPageTab('calendar')}
                  className={`flex items-center space-x-1.5 sm:space-x-2 rounded-lg px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs font-black transition-all cursor-pointer ${
                    pageTab === 'calendar'
                      ? themeConfig.tabActiveClass
                      : themeConfig.tabInactiveClass
                  }`}
                >
                  <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Kalender</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPageTab('recap')}
                  className={`flex items-center space-x-1.5 sm:space-x-2 rounded-lg px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs font-black transition-all cursor-pointer ${
                    pageTab === 'recap'
                      ? themeConfig.tabActiveClass
                      : themeConfig.tabInactiveClass
                  }`}
                >
                  <TableIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Rekapitulasi</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPageTab('performance')}
                  className={`flex items-center space-x-1.5 sm:space-x-2 rounded-lg px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs font-black transition-all cursor-pointer ${
                    pageTab === 'performance'
                      ? themeConfig.tabActiveClass
                      : themeConfig.tabInactiveClass
                  }`}
                >
                  <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Perform CEISA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPageTab('guide')}
                  className={`flex items-center space-x-1.5 sm:space-x-2 rounded-lg px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs font-black transition-all cursor-pointer ${
                    pageTab === 'guide'
                      ? themeConfig.tabActiveClass
                      : themeConfig.tabInactiveClass
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Petunjuk</span>
                </button>
              </div>

              {/* Month Navigation integrated directly into the frame for all tabs */}
              <div className="flex items-center space-x-1 sm:space-x-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className={themeConfig.monthNavBtnClass}
                  title="Bulan sebelumnya"
                  aria-label="Bulan sebelumnya"
                >
                  <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsMonthPickerOpen(true)}
                  className={themeConfig.monthDisplayBtnClass}
                  title="Klik untuk memilih bulan & tahun"
                >
                  <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="truncate">
                    {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className={themeConfig.monthNavBtnClass}
                  title="Bulan berikutnya"
                  aria-label="Bulan berikutnya"
                >
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>

            {pageTab === 'guide' ? (
              <GuideView theme={currentTheme} />
            ) : pageTab === 'performance' ? (
              <PerformanceView
                daysState={daysState}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                theme={currentTheme}
                onYearChange={setSelectedYear}
                onMonthChange={setSelectedMonth}
              />
            ) : pageTab === 'recap' ? (
              <RecapTable
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                monthName={MONTH_NAMES[selectedMonth - 1]}
                daysState={daysState}
                theme={currentTheme}
                onBackToCalendar={() => setPageTab('calendar')}
                onOpenExport={() => {
                  setSettingsInitialTab('export');
                  setIsSettingsOpen(true);
                }}
              />
            ) : (
              <>
                {/* Sub-toolbar Kalender: Info & Actions */}
                <div className={themeConfig.subToolbarCardClass}>
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className={themeConfig.subToolbarDotClass}></span>
                    <span className={themeConfig.subToolbarTitleClass}>
                      Jadwal {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                    </span>
                  </div>

                  {/* Action Buttons: Tempel Jadwal, Batal Reset, Reset, Kunci Data & Expand/Collapse */}
                  <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
                    {/* Tombol Tempel Jadwal */}
                    <button
                      type="button"
                      onClick={handleTempelJadwal}
                      className={themeConfig.pasteBtnClass}
                      title="Tempel jadwal dari clipboard Excel (Graha, TPSL, NPCT, OFF, SM, PM, Malam, CUTI)"
                      aria-label="Tempel Jadwal"
                    >
                      <ClipboardPaste className="h-3.5 w-3.5 shrink-0" />
                      <span className="hidden sm:inline">Tempel Jadwal</span>
                    </button>

                    {/* Tombol Batal Reset */}
                    {lastResetBackupState !== null &&
                      lastResetBackupState.year === selectedYear &&
                      lastResetBackupState.month === selectedMonth &&
                      !areAllLocked && (
                        <button
                          type="button"
                          onClick={handleUndoReset}
                          className={themeConfig.undoBtnClass}
                          title={`Batalkan reset dan pulihkan data kalender ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}
                          aria-label="Batal Reset"
                        >
                          <Undo2 className="h-3.5 w-3.5 shrink-0" />
                          <span className="hidden sm:inline">Batal Reset</span>
                        </button>
                      )}

                    {/* Tombol Reset Kalender */}
                    <button
                      type="button"
                      onClick={handleResetCalendar}
                      disabled={areAllLocked}
                      className={themeConfig.resetBtnClass}
                      title={
                        areAllLocked
                          ? 'Buka kunci data terlebih dahulu untuk melakukan reset'
                          : 'Kosongkan semua data di kalender termasuk jadwal shift'
                      }
                      aria-label="Reset Kalender"
                    >
                      <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                      <span className="hidden sm:inline">Reset</span>
                    </button>

                    {/* Tombol Kunci / Buka Kunci Seluruh Shift */}
                    <button
                      type="button"
                      onClick={toggleAllLock}
                      className={themeConfig.lockBtnClass}
                      title={areAllLocked ? 'Buka kunci semua data bulan ini' : 'Kunci semua data bulan ini'}
                      aria-label={areAllLocked ? 'Buka Kunci' : 'Kunci Data'}
                    >
                      {areAllLocked ? (
                        <>
                          <Lock className="h-3.5 w-3.5 shrink-0" />
                          <span className="hidden sm:inline">Terkunci</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="h-3.5 w-3.5 shrink-0" />
                          <span className="hidden sm:inline">Kunci Data</span>
                        </>
                      )}
                    </button>

                    {/* Tombol Buka / Lipat Form Detail */}
                    <button
                      type="button"
                      onClick={toggleAllExpand}
                      className={themeConfig.expandBtnClass}
                      title={areAllExpanded ? 'Lipat semua form detail' : 'Buka semua form detail'}
                    >
                      {areAllExpanded ? (
                        <>
                          <Minimize2 className="h-3.5 w-3.5 shrink-0" />
                          <span>Lipat Semua</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="h-3.5 w-3.5 shrink-0" />
                          <span>Buka Form</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Kalender Grid Container */}
                <div 
                  id="calendar-grid-capture" 
                  className={themeConfig.calendarContainerCardClass}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Hari Headers */}
                  <div className={themeConfig.dayNamesHeaderClass}>
                    {DAY_NAMES.map((name, i) => (
                      <div
                        key={name}
                        className={i === 5 || i === 6 ? themeConfig.weekendNameTextClass : themeConfig.weekdayNameTextClass}
                      >
                        {name}
                      </div>
                    ))}
                  </div>

                  {/* Date Cells */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-1.5 lg:gap-2">
                    {Array.from({ length: firstDayOffset }).map((_, idx) => (
                      <div key={`empty-${idx}`} className={themeConfig.emptyCellClass} />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const dayNumber = idx + 1;
                      const dateObj = new Date(selectedYear, selectedMonth - 1, dayNumber);
                      const dayKey = `${selectedYear}-${selectedMonth}-${dayNumber}`;
                      const paddedDay = String(dayNumber).padStart(2, '0');
                      const paddedMonth = String(selectedMonth).padStart(2, '0');
                      const dateIso = `${selectedYear}-${paddedMonth}-${paddedDay}`;
                      const liburObj = daftarLibur.find(
                        (item) => item.tanggal === dateIso || item.tanggal === dayKey
                      );
                      const data = getDayData(selectedYear, selectedMonth, dayNumber);
                      const calc = calculateDayResult(data, dateObj, liburObj?.keterangan);
                      const isExpanded = expandedCells[dayKey] ?? false;

                      return (
                        <DayCell
                          key={dayKey}
                          dayNumber={dayNumber}
                          date={dateObj}
                          data={data}
                          calculation={calc}
                          isExpanded={isExpanded}
                          isMobile={isMobile}
                          theme={currentTheme}
                          liburNasional={liburObj}
                          sisaKuotaOff={monthSummary.sisaKuotaOff}
                          sisaKuotaCP={monthSummary.sisaKuotaCP}
                          onToggleExpand={() => {
                            setExpandedCells((prev) => ({
                              ...prev,
                              [dayKey]: !isExpanded,
                            }));
                          }}
                          onOpenModal={() => setDetailModalDay(dayNumber)}
                          onUpdate={(partial) => {
                            updateDayData(selectedYear, selectedMonth, dayNumber, partial);
                          }}
                          onRequestTimePick={(field, title, currentValue) => {
                            setTimePickerState({
                              isOpen: true,
                              title,
                              field,
                              dayKey,
                              year: selectedYear,
                              month: selectedMonth,
                              day: dayNumber,
                              currentValue,
                            });
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Summary Cards Panel */}
                <div className={themeConfig.summaryPanelCardClass}>
                  <div className={`flex items-center justify-between mb-2 ${themeConfig.summaryHeaderBorderClass}`}>
                    <h3 className={themeConfig.summaryTitleClass}>
                      <span className={`mr-1.5 inline-block h-2 w-2 ${themeConfig.isWinamp ? 'rounded-none bg-[#00FF00]' : 'rounded-full bg-[#20A4F3]'}`}></span>
                      Rekapitulasi Bulan {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                    </h3>
                    <span className={themeConfig.summarySubtextClass}>Otomatis Terkalkulasi</span>
                  </div>
                  <SummaryCards
                    theme={currentTheme}
                    totalLemburHours={monthSummary.totalJamLembur}
                    totalLemburDays={monthSummary.totalHariLembur}
                    totalPiketDays={monthSummary.totalPiket}
                    totalGeserOffDays={monthSummary.totalDapatGeserOff}
                    totalOffDiambilDays={monthSummary.totalOffDiambil}
                    totalCutiPenggantiDays={monthSummary.totalCutiPengganti}
                  />
                </div>
              </>
            )}
          </div>
      </main>

      {/* Holiday Manager Modal (Terhubung Supabase & Bebas Konflik State) */}
      <HolidayManagerModal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        monthName={MONTH_NAMES[selectedMonth - 1]}
        daftarLibur={daftarLibur}
        onAddLibur={handleAddLibur}
        onDeleteLibur={handleDeleteLibur}
        onRefreshLibur={fetchLibur}
        isCloudConnected={Boolean(supabaseUrl && supabaseAnonKey)}
        theme={currentTheme}
      />

      {/* Month & Year Picker Modal - Fixed onSelect order (month, year) */}
      <MonthYearPickerModal
        isOpen={isMonthPickerOpen}
        onClose={() => setIsMonthPickerOpen(false)}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onSelect={(month, year) => {
          setSelectedMonth(month);
          setSelectedYear(year);
        }}
      />

      {/* Settings Modal (Unifies Database Cloud, Ekspor, Impor, Flutter Code) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        daysState={daysState}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        monthName={MONTH_NAMES[selectedMonth - 1]}
        supabaseUrl={supabaseUrl}
        supabaseKey={supabaseAnonKey}
        isAutoSync={false}
        onSaveSupabaseConfig={(url, key) => handleSaveSupabase(url, key)}
        onImportDays={(importedData, mode) => {
          if (mode === 'replace') {
            setDaysState(importedData);
          } else {
            setDaysState((prev) => ({ ...prev, ...importedData }));
          }
          const count = Object.keys(importedData).length;
          setToastMessage(`Berhasil mengimpor ${count} data jadwal (${mode === 'replace' ? 'Timpa Seluruhnya' : 'Gabungkan'})`);
          setTimeout(() => setToastMessage(null), 3500);
        }}
        onRefreshData={() => {
          handleSaveAndSync();
        }}
        onClearAllData={handleCleanResetApp}
        onShowToast={(msg) => {
          setToastMessage(msg);
          setTimeout(() => setToastMessage(null), 3500);
        }}
        targetRefId="calendar-grid-capture"
        initialTab={settingsInitialTab}
      />

      {/* Day Detail Popout Modal */}
      {detailModalDay !== null && (() => {
        const detailDayKey = `${selectedYear}-${selectedMonth}-${detailModalDay}`;
        const paddedDetailDay = String(detailModalDay).padStart(2, '0');
        const paddedDetailMonth = String(selectedMonth).padStart(2, '0');
        const detailDateIso = `${selectedYear}-${paddedDetailMonth}-${paddedDetailDay}`;
        const detailLibur = daftarLibur.find(
          (item) => item.tanggal === detailDateIso || item.tanggal === detailDayKey
        );
        const detailDayData = getDayData(selectedYear, selectedMonth, detailModalDay);

        return (
          <DayDetailModal
            isOpen={detailModalDay !== null}
            onClose={() => setDetailModalDay(null)}
            dayNumber={detailModalDay}
            month={selectedMonth}
            year={selectedYear}
            data={detailDayData}
            calculation={calculateDayResult(
              detailDayData,
              new Date(selectedYear, selectedMonth - 1, detailModalDay),
              detailLibur?.keterangan
            )}
            liburNasional={detailLibur}
            sisaKuotaOff={monthSummary.sisaKuotaOff}
            sisaKuotaCP={monthSummary.sisaKuotaCP}
            theme={currentTheme}
            onUpdate={(partial) => {
              updateDayData(selectedYear, selectedMonth, detailModalDay, partial);
            }}
            onRequestTimePick={(field, title, currentValue) => {
              setTimePickerState({
                isOpen: true,
                title,
                field,
                dayKey: detailDayKey,
                year: selectedYear,
                month: selectedMonth,
                day: detailModalDay,
                currentValue,
              });
            }}
          />
        );
      })()}

      {/* Time Picker Modal */}
      <TimePickerModal
        isOpen={timePickerState.isOpen}
        onClose={() => setTimePickerState((prev) => ({ ...prev, isOpen: false }))}
        title={timePickerState.title}
        value={timePickerState.currentValue}
        field={timePickerState.field}
        existingJamMasuk={getDayData(timePickerState.year, timePickerState.month, timePickerState.day).jamMasuk}
        existingJamPulang={getDayData(timePickerState.year, timePickerState.month, timePickerState.day).jamPulang}
        onSelect={(timeStr) => {
          updateDayData(timePickerState.year, timePickerState.month, timePickerState.day, {
            [timePickerState.field]: timeStr,
          });
        }}
      />

      {/* Tempel Jadwal Dialog */}
      <PasteExcelModal
        isOpen={isTempelJadwalOpen}
        onClose={() => setIsTempelJadwalOpen(false)}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        initialText={pasteInitialText}
        onApply={(updates) => {
          handleApplyHolidays(updates);
          const count = Object.keys(updates).length;
          setToastMessage(`Berhasil tempel jadwal (${count} hari diperbarui)`);
          setTimeout(() => setToastMessage(null), 3500);
        }}
      />

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsResetConfirmOpen(false)}
          />
          <div className={`relative w-full max-w-md p-6 shadow-2xl border animate-in zoom-in-95 duration-200 ${
            currentTheme === 'winamp'
              ? 'rounded-none bg-[#2C2E3B] border-2 border-[#00FF00] text-[#00FF00] font-mono'
              : currentTheme === 'vista'
              ? 'rounded-2xl bg-white/80 backdrop-blur-xl border-white/60 text-slate-900'
              : currentTheme === 'dark'
              ? 'rounded-2xl bg-[#1E1E1E] border-slate-700 text-[#E0E0E0]'
              : 'rounded-2xl bg-white border-slate-200 text-[#011627]'
          }`}>
            <div className="flex items-start gap-3.5 mb-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className={`text-base font-extrabold ${currentTheme === 'winamp' ? 'text-[#00FF00]' : currentTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Kosongkan Data Kalender?
                </h3>
                <p className={`text-xs mt-0.5 ${currentTheme === 'winamp' ? 'text-emerald-400' : currentTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Bulan {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                </p>
              </div>
            </div>

            <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${currentTheme === 'winamp' ? 'text-emerald-300' : currentTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              Semua data di kalender termasuk jadwal shift, jam masuk, jam pulang, absensi CEISA, dan catatan untuk bulan <strong>{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</strong> akan dikosongkan.
              <br /><br />
              <span className="text-emerald-500 font-semibold">Catatan:</span> Anda dapat membatalkan tindakan ini kapan saja dengan tombol <strong>"Batal Reset"</strong> setelah dikosongkan.
            </p>

            <div className="flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className={`px-4 py-2 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  currentTheme === 'winamp'
                    ? 'rounded-none border border-[#00FF00] bg-black text-[#00FF00] hover:bg-[#00FF00]/10'
                    : currentTheme === 'dark'
                    ? 'rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeReset}
                className="flex items-center space-x-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Ya, Kosongkan Kalender</span>
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Floating Action Button (FAB) on Mobile */}
      <div className="sm:hidden fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FF8552] text-white shadow-xl shadow-orange-600/30 hover:bg-[#e66f3e] active:scale-95 transition-all border-2 border-white cursor-pointer"
          title="Buka Navigasi & Menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Bottom Sheet Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300" />
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <AppLogo className="h-9 w-9 rounded-xl shadow-xs shrink-0" />
                <div>
                  <h3 className="text-sm font-extrabold text-[#39393A]">
                    JadwalPriok
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Jadwal Pemeriksa Fisik dan Performance View
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Options Grid */}
            <div className="mt-4 space-y-2">
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-1">
                Navigasi Halaman
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPageTab('calendar');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 rounded-xl p-2.5 text-xs font-bold transition-colors ${
                    pageTab === 'calendar'
                      ? 'bg-[#297373] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <CalendarIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate">Kalender</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPageTab('recap');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 rounded-xl p-2.5 text-xs font-bold transition-colors ${
                    pageTab === 'recap'
                      ? 'bg-[#297373] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <TableIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate">Rekapitulasi</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPageTab('performance');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 rounded-xl p-2.5 text-xs font-bold transition-colors ${
                    pageTab === 'performance'
                      ? 'bg-[#297373] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Award className="h-4 w-4 shrink-0" />
                  <span className="truncate">Perform CEISA</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPageTab('guide');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 rounded-xl p-2.5 text-xs font-bold transition-colors ${
                    pageTab === 'guide'
                      ? 'bg-[#297373] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span className="truncate">Petunjuk</span>
                </button>
              </div>
            </div>

            {/* Action Tools Grid */}
            <div className="mt-4 space-y-2">
              <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-1">
                Alat & Jadwal
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleTempelJadwal();
                  }}
                  className="flex items-center space-x-2.5 rounded-xl border border-teal-200 bg-teal-50 p-2.5 text-left text-xs font-bold text-teal-800 hover:bg-teal-100"
                >
                  <ClipboardPaste className="h-4 w-4 text-teal-600 shrink-0" />
                  <span>Tempel Jadwal</span>
                </button>

                {lastResetBackupState !== null ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleUndoReset();
                    }}
                    className="flex items-center space-x-2.5 rounded-xl border border-amber-300 bg-amber-500 p-2.5 text-left text-xs font-bold text-white hover:bg-amber-600"
                  >
                    <Undo2 className="h-4 w-4 text-white shrink-0" />
                    <span>Batal Reset</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleResetCalendar();
                    }}
                    disabled={areAllLocked}
                    className={`flex items-center space-x-2.5 rounded-xl border p-2.5 text-left text-xs font-bold ${
                      areAllLocked
                        ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                        : 'border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100'
                    }`}
                  >
                    <RotateCcw className={`h-4 w-4 shrink-0 ${areAllLocked ? 'text-slate-400' : 'text-rose-600'}`} />
                    <span>Reset Kalender</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsHolidayModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2.5 rounded-xl border border-rose-400 bg-[#DC2626] p-2.5 text-left text-xs font-bold text-white hover:bg-[#B91C1C]"
                >
                  <Flag className="h-4 w-4 fill-white shrink-0" />
                  <span>Hari Libur</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSettingsInitialTab('storage');
                    setIsSettingsOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2.5 rounded-xl border border-white/20 bg-[#225e5e] p-2.5 text-left text-xs font-bold text-white hover:bg-[#1b4b4b]"
                >
                  <Sliders className="h-4 w-4 text-teal-200 shrink-0" />
                  <span>Pengaturan</span>
                </button>

                {/* Theme Selector in Mobile Drawer */}
                <div className="col-span-2 rounded-xl bg-slate-100 p-2 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 mb-1.5 flex items-center gap-1.5 px-1">
                    <Palette className="h-3.5 w-3.5 text-teal-600" />
                    <span>Tema Tampilan</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentTheme('default')}
                      className={`p-1.5 rounded-lg text-center text-[9.5px] font-bold transition-all ${
                        currentTheme === 'default' ? 'bg-[#297373] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Default
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentTheme('dark')}
                      className={`p-1.5 rounded-lg text-center text-[8.5px] font-bold transition-all ${
                        currentTheme === 'dark' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Dark Mode (Alpha)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentTheme('vista')}
                      className={`p-1.5 rounded-lg text-center text-[8.5px] font-bold transition-all ${
                        currentTheme === 'vista' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Vista (Alpha)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentTheme('winamp')}
                      className={`p-1.5 rounded-lg text-center text-[8.5px] font-bold font-mono transition-all ${
                        currentTheme === 'winamp' ? 'bg-zinc-900 text-emerald-400 shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Winamp (Beta)
                    </button>
                  </div>
                </div>

                {/* Merged Sync & Simpan Mobile Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSaveAndSync();
                  }}
                  disabled={isSavingLocal || isSyncing}
                  className="col-span-2 flex items-center justify-center space-x-2.5 rounded-xl border border-white/20 bg-[#163e3e] hover:bg-[#102d2d] p-2.5 text-center text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  <RefreshCw className={`h-4 w-4 text-teal-200 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing Cloud...' : isSavingLocal ? 'Menyimpan...' : 'Sync & Simpan Data'}</span>
                </button>
              </div>
            </div>

            {/* Storage Info */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-emerald-800">
                  {supabaseUrl ? 'Supabase Cloud Terhubung & Siap Sync' : 'Mode Penyimpanan Lokal (Aman & Mandiri)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Check className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
          {lastResetBackupState !== null && !areAllLocked && (
            <button
              type="button"
              onClick={handleUndoReset}
              className="ml-2 rounded-lg bg-amber-500 hover:bg-amber-600 px-2.5 py-1 text-xs font-black text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1"
            >
              <Undo2 className="h-3 w-3" />
              <span>Batal</span>
            </button>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
