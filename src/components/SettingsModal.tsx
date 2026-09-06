import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  Check,
  AlertCircle,
  Loader2,
  Copy,
  RefreshCw,
  Server,
  Key,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  FileCode,
  Sparkles,
  ExternalLink,
  Save,
  CheckCircle2,
  Trash2,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  Layers,
  Filter,
  Calendar
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DayData, normalizeShift } from '../types';
import { calculateDayResult } from '../lib/calculator';
import { saveFileWithDialog } from '../lib/fileDownload';
import {
  SUPABASE_SQL_SETUP_SCRIPT,
  testSupabaseConnection,
  pushAllToSupabase,
  syncTwoWaySupabase
} from '../lib/supabaseSync';

export type ExportRangeType = 'month_active' | 'month_filled' | 'quarter' | 'semester' | 'year' | 'custom';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

interface ExportEntry {
  day: number;
  month: number;
  year: number;
  dateKey: string;
  dateObj: Date;
  dayName: string;
  data: DayData;
  calc: ReturnType<typeof calculateDayResult>;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  daysState: Record<string, DayData>;
  selectedMonth: number;
  selectedYear: number;
  monthName: string;
  supabaseUrl: string;
  supabaseKey: string;
  isAutoSync: boolean;
  onSaveSupabaseConfig: (url: string, key: string, autoSync: boolean) => void;
  onImportDays: (importedData: Record<string, DayData>, mode: 'merge' | 'replace') => void;
  onRefreshData: () => void;
  onClearAllData?: () => void;
  onShowToast: (msg: string) => void;
  targetRefId?: string;
  initialTab?: 'storage' | 'export' | 'import';
  theme?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = (props: SettingsModalProps) => {
  const {
    isOpen,
    onClose,
    daysState,
    selectedMonth,
    selectedYear,
    monthName,
    supabaseUrl,
    supabaseKey,
    isAutoSync,
    onSaveSupabaseConfig,
    onImportDays,
    onRefreshData,
    onClearAllData,
    onShowToast,
    targetRefId = 'calendar-grid-capture',
    initialTab = 'storage',
    theme = 'default',
  } = props;
  const isDark = theme === 'dark';
  const isVista = theme === 'vista';
  const isWinamp = theme === 'winamp';

  const [activeTab, setActiveTab] = useState<'storage' | 'export' | 'import'>(initialTab);

  // Tab 1: Storage States
  const [urlInput, setUrlInput] = useState(supabaseUrl);
  const [keyInput, setKeyInput] = useState(supabaseKey);
  const [autoSyncInput, setAutoSyncInput] = useState(isAutoSync);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    ms?: number;
    tableReady?: boolean;
    rawError?: string;
  } | null>(null);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isCopiedSql, setIsCopiedSql] = useState(false);
  const [isSqlExpanded, setIsSqlExpanded] = useState(false);

  // Tab 2: Export States & Date Range Filter
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [rangeType, setRangeType] = useState<ExportRangeType>('month_active');
  const [selectedQuarter, setSelectedQuarter] = useState<number>(() => Math.ceil(selectedMonth / 3));
  const [selectedSemester, setSelectedSemester] = useState<number>(() => (selectedMonth <= 6 ? 1 : 2));

  // Custom Date Range
  const defaultStartDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
  const defaultEndDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(
    new Date(selectedYear, selectedMonth, 0).getDate()
  ).padStart(2, '0')}`;
  const [customStartDate, setCustomStartDate] = useState<string>(defaultStartDate);
  const [customEndDate, setCustomEndDate] = useState<string>(defaultEndDate);

  // Tab 3: Import States
  const [importType, setImportType] = useState<'json' | 'sql'>('json');
  const [pastedText, setPastedText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, DayData> | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importError, setImportError] = useState<string | null>(null);
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export PNG States
  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Derivasi bulan yang memiliki data di tahun terpilih
  const filledMonths = useMemo(() => {
    const months = new Set<number>();
    Object.keys(daysState).forEach((key: string) => {
      const parts = key.split('-');
      if (parts.length >= 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const val = daysState[key];
        if (
          y === selectedYear &&
          !isNaN(m) &&
          val &&
          (val.shift || val.isMasuk || val.jamMasuk || val.note || val.absenCeisa)
        ) {
          months.add(m);
        }
      }
    });
    return Array.from(months).sort((a, b) => a - b);
  }, [daysState, selectedYear]);

  // Derivasi Entries dan Label berdasarkan Range Filter
  const { filteredEntries, rangeLabel, filenameSuffix } = useMemo(() => {
    let entries: Array<{
      day: number;
      month: number;
      year: number;
      dateKey: string;
      dateObj: Date;
      dayName: string;
      data: DayData;
      calc: ReturnType<typeof calculateDayResult>;
    }> = [];

    let label = '';
    let suffix = '';

    const defaultDayData: DayData = {
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
    };

    if (rangeType === 'month_active') {
      label = `Bulan ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;
      suffix = `${MONTH_NAMES[selectedMonth - 1]}_${selectedYear}`;
      const daysCount = new Date(selectedYear, selectedMonth, 0).getDate();
      for (let d = 1; d <= daysCount; d++) {
        const dateKey = `${selectedYear}-${selectedMonth}-${d}`;
        const dateObj = new Date(selectedYear, selectedMonth - 1, d);
        const data = daysState[dateKey] || defaultDayData;
        entries.push({
          day: d,
          month: selectedMonth,
          year: selectedYear,
          dateKey,
          dateObj,
          dayName: INDONESIAN_DAYS[dateObj.getDay()],
          data,
          calc: calculateDayResult(data, dateObj),
        });
      }
    } else if (rangeType === 'month_filled') {
      const activeMonthsList = filledMonths.length > 0 ? filledMonths : [selectedMonth];
      const monthLabels = activeMonthsList.map((m: number) => MONTH_NAMES[m - 1]).join(', ');
      label = `Bulan Terisi Data (${monthLabels}) ${selectedYear}`;
      suffix = `Bulan_Terisi_${selectedYear}`;

      activeMonthsList.forEach((m: number) => {
        const daysCount = new Date(selectedYear, m, 0).getDate();
        for (let d = 1; d <= daysCount; d++) {
          const dateKey = `${selectedYear}-${m}-${d}`;
          const dateObj = new Date(selectedYear, m - 1, d);
          const data = daysState[dateKey] || defaultDayData;
          entries.push({
            day: d,
            month: m,
            year: selectedYear,
            dateKey,
            dateObj,
            dayName: INDONESIAN_DAYS[dateObj.getDay()],
            data,
            calc: calculateDayResult(data, dateObj),
          });
        }
      });
    } else if (rangeType === 'quarter') {
      const qMonths =
        selectedQuarter === 1
          ? [1, 2, 3]
          : selectedQuarter === 2
          ? [4, 5, 6]
          : selectedQuarter === 3
          ? [7, 8, 9]
          : [10, 11, 12];
      label = `Kuartal ${selectedQuarter} (Q${selectedQuarter}) ${selectedYear}`;
      suffix = `Kuartal_${selectedQuarter}_${selectedYear}`;

      qMonths.forEach((m: number) => {
        const daysCount = new Date(selectedYear, m, 0).getDate();
        for (let d = 1; d <= daysCount; d++) {
          const dateKey = `${selectedYear}-${m}-${d}`;
          const dateObj = new Date(selectedYear, m - 1, d);
          const data = daysState[dateKey] || defaultDayData;
          entries.push({
            day: d,
            month: m,
            year: selectedYear,
            dateKey,
            dateObj,
            dayName: INDONESIAN_DAYS[dateObj.getDay()],
            data,
            calc: calculateDayResult(data, dateObj),
          });
        }
      });
    } else if (rangeType === 'semester') {
      const sMonths = selectedSemester === 1 ? [1, 2, 3, 4, 5, 6] : [7, 8, 9, 10, 11, 12];
      label = `Semester ${selectedSemester} (S${selectedSemester}) ${selectedYear}`;
      suffix = `Semester_${selectedSemester}_${selectedYear}`;

      sMonths.forEach((m: number) => {
        const daysCount = new Date(selectedYear, m, 0).getDate();
        for (let d = 1; d <= daysCount; d++) {
          const dateKey = `${selectedYear}-${m}-${d}`;
          const dateObj = new Date(selectedYear, m - 1, d);
          const data = daysState[dateKey] || defaultDayData;
          entries.push({
            day: d,
            month: m,
            year: selectedYear,
            dateKey,
            dateObj,
            dayName: INDONESIAN_DAYS[dateObj.getDay()],
            data,
            calc: calculateDayResult(data, dateObj),
          });
        }
      });
    } else if (rangeType === 'year') {
      label = `Tahun Penuh ${selectedYear}`;
      suffix = `Tahun_${selectedYear}`;

      for (let m = 1; m <= 12; m++) {
        const daysCount = new Date(selectedYear, m, 0).getDate();
        for (let d = 1; d <= daysCount; d++) {
          const dateKey = `${selectedYear}-${m}-${d}`;
          const dateObj = new Date(selectedYear, m - 1, d);
          const data = daysState[dateKey] || defaultDayData;
          entries.push({
            day: d,
            month: m,
            year: selectedYear,
            dateKey,
            dateObj,
            dayName: INDONESIAN_DAYS[dateObj.getDay()],
            data,
            calc: calculateDayResult(data, dateObj),
          });
        }
      }
    } else if (rangeType === 'custom') {
      label = `Rentang ${customStartDate} s/d ${customEndDate}`;
      suffix = `Rentang_${customStartDate}_sd_${customEndDate}`;

      const start = new Date(customStartDate);
      const end = new Date(customEndDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
        const cur = new Date(start);
        while (cur <= end) {
          const y = cur.getFullYear();
          const m = cur.getMonth() + 1;
          const d = cur.getDate();
          const dateKey = `${y}-${m}-${d}`;
          const dateObj = new Date(cur);
          const data = daysState[dateKey] || defaultDayData;

          entries.push({
            day: d,
            month: m,
            year: y,
            dateKey,
            dateObj,
            dayName: INDONESIAN_DAYS[dateObj.getDay()],
            data,
            calc: calculateDayResult(data, dateObj),
          });

          cur.setDate(cur.getDate() + 1);
        }
      }
    }

    return { filteredEntries: entries, rangeLabel: label, filenameSuffix: suffix };
  }, [rangeType, selectedMonth, selectedYear, selectedQuarter, selectedSemester, customStartDate, customEndDate, daysState, filledMonths]);

  if (!isOpen) return null;

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const totalDaysStored = Object.keys(daysState).length;

  // --- STORAGE ACTIONS ---
  const handleSaveConfig = () => {
    onSaveSupabaseConfig(urlInput.trim(), keyInput.trim(), autoSyncInput);
    onShowToast('Pengaturan database berhasil disimpan!');
  };

  const handleTestConnection = async () => {
    if (!urlInput.trim() || !keyInput.trim()) {
      setTestResult({
        success: false,
        message: 'Harap isi URL dan Anon Key Supabase terlebih dahulu.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(urlInput, keyInput);
    setTestResult(res);
    setIsTesting(false);
  };

  const handlePushToCloud = async () => {
    if (!urlInput.trim() || !keyInput.trim()) {
      onShowToast('Konfigurasi URL dan Key Supabase belum disimpan.');
      return;
    }

    setIsPushing(true);
    const res = await pushAllToSupabase(urlInput, keyInput, daysState);
    setIsPushing(false);

    if (res.success) {
      onShowToast(res.message);
    } else {
      alert(`Gagal Sinkronisasi: ${res.message}`);
    }
  };

  const handlePullFromCloud = async () => {
    if (!urlInput.trim() || !keyInput.trim()) {
      onShowToast('Konfigurasi URL dan Key Supabase belum disimpan.');
      return;
    }

    setIsPulling(true);
    const res = await syncTwoWaySupabase(urlInput, keyInput, daysState);
    setIsPulling(false);

    if (res.success && res.mergedData) {
      onImportDays(res.mergedData, 'merge');
      onShowToast(res.message);
    } else {
      alert(`Gagal Mengambil Data: ${res.message}`);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP_SCRIPT);
    setIsCopiedSql(true);
    setTimeout(() => setIsCopiedSql(false), 2500);
    onShowToast('Script SQL Supabase berhasil disalin ke clipboard!');
  };

  // --- EXPORT ACTIONS ---
  const handleExportExcel = async (): Promise<void> => {
    try {
      setExportLoading('xlsx');
      const rows = filteredEntries.map((item: ExportEntry) => {
        const { day, month, year, dayName, data, calc, dateObj } = item;
        return {
          'Tanggal': `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
          'Hari': dayName,
          'Shift': normalizeShift(data.shift),
          'Status Masuk': data.isMasuk ? 'Masuk' : 'Tidak Masuk',
          'Tipe Hari Libur':
            dateObj.getDay() === 0 || dateObj.getDay() === 6 || data.isManualHoliday
              ? data.tipeMasukLibur === 'lembur'
                ? 'Lembur Libur'
                : 'Piket'
              : '-',
          'Jam Masuk': data.jamMasuk || '-',
          'Jam Pulang': data.jamPulang || '-',
          'Absen Ceisa': data.absenCeisa || '-',
          'Durasi Kerja (Jam)': calc.durasiKerja > 0 ? Number(calc.durasiKerja.toFixed(2)) : 0,
          'Jam Lembur': calc.jamLembur > 0 ? Number(calc.jamLembur.toFixed(1)) : 0,
          'Status/Keterangan': calc.keteranganStatus || '-',
          'ST Tambahan (Cuti)': data.isSuratTugasTambahan ? 'Ya' : 'Tidak',
          'Hold Dokumen': data.isHoldDokumen ? 'Ya' : 'Tidak',
          'Catatan': data.note || '',
        };
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Jadwal_${filenameSuffix}`);

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
      }
    } catch (e) {
      console.error('Export Excel failed:', e);
      onShowToast('Gagal mengekspor file Excel.');
    } finally {
      setExportLoading(null);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExportLoading('pdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

      doc.setFontSize(15);
      doc.setTextColor(30, 41, 59);
      doc.text(`Laporan Jadwal Shift & Lembur - ${rangeLabel}`, 40, 36);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Digenerate: ${new Date().toLocaleString('id-ID')} | Total: ${filteredEntries.length} Hari`, 40, 50);

      let y = 68;
      const renderHeader = () => {
        doc.setFillColor(41, 115, 115);
        doc.setTextColor(255, 255, 255);
        doc.rect(40, y, 762, 18, 'F');
        doc.setFontSize(8.5);
        doc.text('Tgl', 45, y + 12);
        doc.text('Hari', 105, y + 12);
        doc.text('Shift', 155, y + 12);
        doc.text('Status', 195, y + 12);
        doc.text('Jam Kerja', 255, y + 12);
        doc.text('Ceisa', 335, y + 12);
        doc.text('Durasi', 385, y + 12);
        doc.text('Lembur', 435, y + 12);
        doc.text('Keterangan', 485, y + 12);
        doc.text('ST', 635, y + 12);
        doc.text('Catatan', 665, y + 12);
        y += 18;
      };

      renderHeader();

      for (let i = 0; i < filteredEntries.length; i++) {
        const item = filteredEntries[i];
        const { day, month, year, dayName, data, calc } = item;

        if (y > 540) {
          doc.addPage();
          y = 35;
          renderHeader();
        }

        if (i % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(40, y, 762, 15, 'F');
        }

        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        const tglStr = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
        doc.text(tglStr, 45, y + 11);
        doc.text(dayName.substring(0, 3), 105, y + 11);
        doc.text(normalizeShift(data.shift), 155, y + 11);
        doc.text(data.isMasuk ? 'Masuk' : 'Libur', 195, y + 11);
        doc.text(data.jamMasuk ? `${data.jamMasuk} - ${data.jamPulang}` : '-', 255, y + 11);
        doc.text(data.absenCeisa || '-', 335, y + 11);
        doc.text(calc.durasiKerja > 0 ? `${calc.durasiKerja.toFixed(1)}j` : '0', 385, y + 11);
        doc.text(calc.jamLembur > 0 ? `${calc.jamLembur.toFixed(1)}j` : '-', 435, y + 11);
        doc.text(calc.keteranganStatus || '-', 485, y + 11);
        doc.text(data.isSuratTugasTambahan ? 'Ya' : '-', 635, y + 11);
        doc.text((data.note || '').substring(0, 18) || '-', 665, y + 11);

        y += 15;
      }

      const pdfBlob = doc.output('blob');
      const res = await saveFileWithDialog({
        blob: pdfBlob,
        filename: `Laporan_Shift_${filenameSuffix}.pdf`,
        description: 'PDF Document',
        mimeType: 'application/pdf',
        extension: 'pdf',
      });

      if (res.success) {
        setExportSuccess('pdf');
        setTimeout(() => setExportSuccess(null), 2500);
        if (res.message) onShowToast(res.message);
      }
    } catch (e) {
      console.error('Export PDF failed:', e);
      onShowToast('Gagal mengekspor file PDF.');
    } finally {
      setExportLoading(null);
    }
  };

  const handleExportPNG = async (): Promise<void> => {
    try {
      setIsExportingPNG(true);

      // Target elemen kalender
      const el =
        calendarRef?.current ||
        document.getElementById(targetRefId) ||
        document.getElementById('calendar-grid-container') ||
        document.getElementById('main-calendar-content') ||
        document.querySelector('main') ||
        document.querySelector('.calendar-view-container');

      if (!el) {
        throw new Error('Element kalender tidak ditemukan di DOM. Pastikan kalender sedang aktif.');
      }

      // Render elemen kalender menjadi canvas
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );

      if (blob) {
        const res = await saveFileWithDialog({
          blob,
          filename: `Kalender_Shift_${filenameSuffix || `${monthName}_${selectedYear}`}.png`,
          description: 'PNG Image',
          mimeType: 'image/png',
          extension: 'png',
        });

        if (res.success) {
          onShowToast('File PNG berhasil diunduh!');
        }
      }
    } catch (e) {
      console.error('Export PNG failed:', e);
      onShowToast('Gagal mengekspor file PNG.');
    } finally {
      setIsExportingPNG(false);
    }
  };

    const base64ToUint8Array = (base64: string): Uint8Array => {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    };

    // 2. Fungsi Utama Ekspor PNG Kalender
    const handleExportCalendarPNG = async () => {
        try {
            setIsExportingPNG(true);

            // Target elemen kalender utama yang berada di luar modal
            const el =
                calendarRef?.current ||
                document.getElementById('calendar-grid-container') ||
                document.getElementById('main-calendar-content') ||
                document.querySelector('main') ||
                document.querySelector('.calendar-view-container');

            if (!el) {
                throw new Error('Element kalender tidak ditemukan di DOM. Pastikan kalender sedang aktif.');
            }

            // Render elemen kalender menjadi canvas
            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
            });

            const defaultFileName = `Tampilan_Kalender_${monthName}_${selectedYear}.png`;

            // Konversi canvas -> data URL Base64 murni -> Uint8Array
            const rawBase64 = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
            const imageBytes = base64ToUint8Array(rawBase64);

            // Cek apakah aplikasi berjalan di lingkungan Desktop Tauri
            const win = window as any;
            if (win.__TAURI__ || win.__TAURI_INTERNALS__) {
                let saveFn: any = win.__TAURI__?.dialog?.save;
                let writeFn: any = win.__TAURI__?.fs?.writeFile || win.__TAURI__?.fs?.writeBinaryFile;

                // Dynamic fallback jika modul plugin terinstal
                if (!saveFn) {
                    try {
                        const dialogMod = await import(/* @vite-ignore */ '@tauri-apps/' + 'plugin-dialog');
                        saveFn = dialogMod.save;
                    } catch (e) {
                        console.debug('Tauri plugin-dialog import fallback:', e);
                    }
                }

                if (!writeFn) {
                    try {
                        const fsMod = await import(/* @vite-ignore */ '@tauri-apps/' + 'plugin-fs');
                        writeFn = fsMod.writeFile;
                    } catch (e) {
                        console.debug('Tauri plugin-fs import fallback:', e);
                    }
                }

                // Jalankan dialog Save As native Windows
                if (saveFn && writeFn) {
                    const filePath = await saveFn({
                        filters: [{ name: 'Image', extensions: ['png'] }],
                        defaultPath: defaultFileName,
                    });

                    // Jika pengguna memilih path dan klik "Save"
                    if (filePath) {
                        await writeFn(filePath, imageBytes);
                        setExportSuccess('png');
                        setTimeout(() => setExportSuccess(null), 2500);
                        onShowToast(`Gambar kalender berhasil disimpan ke: ${filePath}`);
                        return;
                    } else {
                        // Pengguna membatalkan (klik Cancel)
                        return;
                    }
                }
            }

            // Fallback untuk Web Browser / File System Access API biasa
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                await saveFileWithDialog({
                    blob,
                    filename: defaultFileName,
                    description: 'PNG Image',
                    mimeType: 'image/png',
                    extension: 'png',
                });
                setExportSuccess('png');
                setTimeout(() => setExportSuccess(null), 2500);
                onShowToast('Gambar kalender berhasil diunduh!');
            }, 'image/png');

        } catch (error) {
            // Menampilkan detail error lengkap di Console DevTools untuk debugging
            console.error('Detail Error PNG:', error);
            onShowToast(`Gagal mengekspor gambar kalender: ${(error as any)?.message || 'Kesalahan tak dikenal'}`);
        } finally {
            setIsExportingPNG(false);
        }
    };

  const handleExportJSON = async () => {
    try {
      const exportPayload: Record<string, DayData> = {};
      filteredEntries.forEach((item: ExportEntry) => {
        exportPayload[item.dateKey] = item.data;
      });

      const jsonStr = JSON.stringify(
        {
          version: '1.0',
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
      }
    } catch (e) {
      console.error('Export JSON failed:', e);
      onShowToast('Gagal mengekspor file JSON.');
    }
  };

  const handleExportSQL = async () => {
    try {
      if (filteredEntries.length === 0) {
        alert('Belum ada data untuk diekspor ke SQL.');
        return;
      }

      let sql = `-- Backup Data Shifts SQL (${rangeLabel})\n`;
      sql += `INSERT INTO public.shifts (id, date_key, shift, is_masuk, jam_masuk, jam_pulang, absen_ceisa, is_hold_dokumen, is_locked, is_manual_holiday, is_surat_tugas_tambahan, is_gunakan_off_geser, referensi_tgl_off, is_gunakan_cp, referensi_tgl_cp, note, tipe_masuk_libur)\nVALUES\n`;

      const valuesArr = filteredEntries.map((item: ExportEntry) => {
        const key = item.dateKey;
        const d = item.data;
        return `  ('${key}', '${key}', '${d.shift}', ${d.isMasuk}, '${d.jamMasuk || ''}', '${d.jamPulang || ''}', '${d.absenCeisa || ''}', ${d.isHoldDokumen}, ${d.isLocked}, ${d.isManualHoliday}, ${d.isSuratTugasTambahan}, ${d.isGunakanOffGeser || false}, '${d.referensiTglOff || ''}', ${d.isGunakanCP || false}, '${d.referensiTglCP || ''}', '${(d.note || '').replace(/'/g, "''")}', '${d.tipeMasukLibur || 'piket'}')`;
      });

      sql += valuesArr.join(',\n') + ';\n';

      const blob = new Blob([sql], { type: 'text/plain' });
      const res = await saveFileWithDialog({
        blob,
        filename: `Backup_Shifts_Dump_${filenameSuffix}.sql`,
        description: 'PostgreSQL SQL Dump',
        mimeType: 'text/plain',
        extension: 'sql',
      });

      if (res.success) {
        setExportSuccess('sql');
        setTimeout(() => setExportSuccess(null), 2500);
        if (res.message) onShowToast(res.message);
      }
    } catch (e) {
      console.error('Export SQL failed:', e);
      onShowToast('Gagal mengekspor file SQL.');
    }
  };

  // --- IMPORT PARSING & ACTIONS ---
  const handleParseAndReview = () => {
    setImportError(null);
    setParsedData(null);

    if (!pastedText.trim()) {
      setImportError('Harap tempel teks atau unggah file terlebih dahulu.');
      return;
    }

    try {
      if (importType === 'json') {
        const parsed = JSON.parse(pastedText);
        let resultDays: Record<string, any> = {};

        if (parsed.days && typeof parsed.days === 'object') {
          resultDays = parsed.days;
        } else if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          resultDays = parsed;
        } else if (Array.isArray(parsed)) {
          parsed.forEach((item: Record<string, unknown>) => {
            const key = item.date_key || item.dateKey || item.id || item.Tanggal;
            if (key) resultDays[key] = item;
          });
        }

        const cleanResult: Record<string, DayData> = {};
        Object.keys(resultDays).forEach((key: string) => {
          const item = resultDays[key];
          if (item && typeof item === 'object') {
            cleanResult[key] = {
              shift: normalizeShift(item.shift || item.Shift || 'Graha'),
              isLocked: Boolean(item.isLocked ?? item.is_locked),
              note: String(item.note || item.Catatan || ''),
              isMasuk: Boolean(item.isMasuk ?? item.is_masuk ?? item.StatusMasuk),
              tipeMasukLibur: (item.tipeMasukLibur || item.tipe_masuk_libur) === 'lembur' ? 'lembur' : 'piket',
              isHoldDokumen: Boolean(item.isHoldDokumen ?? item.is_hold_dokumen),
              jamMasuk: String(item.jamMasuk || item.jam_masuk || ''),
              jamPulang: String(item.jamPulang || item.jam_pulang || ''),
              absenCeisa: String(item.absenCeisa || item.absen_ceisa || ''),
              isSuratTugasTambahan: Boolean(item.isSuratTugasTambahan ?? item.is_surat_tugas_tambahan),
              isManualHoliday: Boolean(item.isManualHoliday ?? item.is_manual_holiday),
              isGunakanOffGeser: Boolean(item.isGunakanOffGeser ?? item.is_gunakan_off_geser),
              referensiTglOff: String(item.referensiTglOff || item.referensi_tgl_off || ''),
              isGunakanCP: Boolean(item.isGunakanCP ?? item.is_gunakan_cp),
              referensiTglCP: String(item.referensiTglCP || item.referensi_tgl_cp || ''),
            };
          }
        });

        if (Object.keys(cleanResult).length === 0) {
          throw new Error('Tidak ditemukan entri tanggal yang valid dalam JSON.');
        }

        setParsedData(cleanResult);
      } else {
        // SQL Parse
        const cleanResult: Record<string, DayData> = {};
        const lines = pastedText.split('\n');
        lines.forEach((line: string) => {
          const dateMatch = line.match(/'(\d{4}-\d{1,2}-\d{1,2})'/);
          if (dateMatch) {
            const dateKey = dateMatch[1];
            cleanResult[dateKey] = {
              shift: 'Graha',
              isLocked: false,
              note: '',
              isMasuk: !line.includes('false'),
              tipeMasukLibur: 'piket',
              isHoldDokumen: false,
              jamMasuk: '',
              jamPulang: '',
              absenCeisa: '',
              isSuratTugasTambahan: false,
              isManualHoliday: false,
              isGunakanOffGeser: false,
              referensiTglOff: '',
              isGunakanCP: false,
              referensiTglCP: '',
            };
          }
        });

        if (Object.keys(cleanResult).length === 0) {
          throw new Error('Tidak ada baris data INSERT tanggal SQL yang dapat dikenali.');
        }

        setParsedData(cleanResult);
      }
    } catch (err: any) {
      setImportError(`Format tidak valid: ${err.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setPastedText(text);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (!parsedData) return;

    setIsProcessingImport(true);
    setTimeout(() => {
      onImportDays(parsedData, importMode);
      setIsProcessingImport(false);
      onShowToast(`Berhasil mengimpor ${Object.keys(parsedData).length} data jadwal!`);
      onClose();
    }, 400);
  };

  // Dynamic Theme Tokens for Modal Shell and Content
  const modalShellClass = isWinamp
    ? 'bg-black text-[#00FF00] font-mono border-2 border-zinc-700 rounded-none shadow-none w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200'
    : isDark
    ? 'bg-[#181818] text-slate-100 border border-[#333333] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200'
    : isVista
    ? 'bg-white/90 backdrop-blur-xl text-slate-900 border border-white/60 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200'
    : 'bg-white text-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200';

  const modalHeaderClass = isWinamp
    ? 'p-4 sm:p-5 border-b-2 border-zinc-800 flex items-center justify-between bg-black font-mono'
    : isDark
    ? 'p-4 sm:p-5 border-b border-[#2A2A2A] flex items-center justify-between bg-[#141414]'
    : isVista
    ? 'p-4 sm:p-5 border-b border-white/30 flex items-center justify-between bg-white/40'
    : 'p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50';

  const modalHeaderTitleClass = isWinamp
    ? 'text-base sm:text-lg font-black text-[#00FF00] tracking-tight font-mono uppercase'
    : isDark
    ? 'text-base sm:text-lg font-black text-slate-100 tracking-tight'
    : 'text-base sm:text-lg font-black text-slate-900 tracking-tight';

  const modalHeaderSubClass = isWinamp
    ? 'text-xs text-zinc-400 font-mono'
    : isDark
    ? 'text-xs text-slate-400 font-medium'
    : 'text-xs text-slate-500 font-medium';

  const modalCloseBtnClass = isWinamp
    ? 'p-2 text-[#00FF00] hover:bg-zinc-800 border border-[#00FF00]/60 rounded-none transition-colors cursor-pointer font-mono'
    : isDark
    ? 'p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer'
    : isVista
    ? 'p-2 text-slate-700 hover:text-slate-900 hover:bg-white/60 rounded-xl transition-colors cursor-pointer'
    : 'p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer';

  const tabNavContainerClass = isWinamp
    ? 'flex border-b-2 border-zinc-800 px-4 sm:px-6 bg-black overflow-x-auto gap-2 scrollbar-none items-center font-mono'
    : isDark
    ? 'flex border-b border-[#2A2A2A] px-4 sm:px-6 bg-[#161616] overflow-x-auto gap-2 scrollbar-none items-center'
    : isVista
    ? 'flex border-b border-white/30 px-4 sm:px-6 bg-white/30 overflow-x-auto gap-2 scrollbar-none items-center'
    : 'flex border-b border-slate-200 px-4 sm:px-6 bg-slate-50/50 overflow-x-auto gap-2 scrollbar-none items-center';

  const getTabBtnClass = (tab: 'storage' | 'export' | 'import') => {
    const isActive = activeTab === tab;
    if (isWinamp) {
      return `flex items-center space-x-2 py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 font-mono rounded-none ${
        isActive
          ? 'border-[#00FF00] text-[#00FF00] bg-zinc-900'
          : 'border-transparent text-zinc-500 hover:text-[#00FF00] hover:bg-zinc-950'
      }`;
    }
    if (isDark) {
      return `flex items-center space-x-2 py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
        isActive
          ? 'border-emerald-500 text-emerald-400 bg-[#222222] rounded-t-xl'
          : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
      }`;
    }
    if (isVista) {
      return `flex items-center space-x-2 py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
        isActive
          ? 'border-[#297373] text-[#297373] bg-white/80 rounded-t-xl'
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
      }`;
    }
    return `flex items-center space-x-2 py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
      isActive
        ? 'border-[#297373] text-[#297373] bg-white rounded-t-xl'
        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
    }`;
  };

  const modalBodyClass = isWinamp
    ? 'flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-black font-mono text-[#00FF00]'
    : isDark
    ? 'flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#181818] text-slate-100'
    : isVista
    ? 'flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-white/20 text-slate-900'
    : 'flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-white text-slate-900';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={modalShellClass}>
        {/* Header Modal with Tabs */}
        <div className={modalHeaderClass}>
          <div className="flex items-center space-x-3">
            <span className={`flex h-10 w-10 items-center justify-center ${isWinamp ? 'rounded-none bg-zinc-900 text-[#00FF00] border border-[#00FF00]/50' : isDark ? 'rounded-2xl bg-[#252525] text-emerald-400 border border-white/10' : 'rounded-2xl bg-gradient-to-br from-[#601700] to-[#8c2200] text-white shadow-xs'}`}>
              <Database className="h-5 w-5" />
            </span>
            <div>
              <h2 className={modalHeaderTitleClass}>
                Pusat Pengaturan & Sinkronisasi
              </h2>
              <p className={modalHeaderSubClass}>
                Penyimpanan Cloud, Ekspor/Impor data, dan Ekspor Kode Mobile
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={modalCloseBtnClass}
            aria-label="Tutup Pengaturan"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation - Flawlessly Aligned */}
        <div className={tabNavContainerClass}>
          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={getTabBtnClass('storage')}
          >
            <Server className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Penyimpanan & Supabase</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={getTabBtnClass('export')}
          >
            <Download className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Ekspor Data</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={getTabBtnClass('import')}
          >
            <Upload className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Impor Data</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className={modalBodyClass}>
          {/* =========================================================
              TAB 1: STORAGE & SUPABASE CLOUD
              ========================================================= */}
          {activeTab === 'storage' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Stat Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-4 ${isWinamp ? 'rounded-none bg-black border-2 border-zinc-700 text-[#00FF00]' : isDark ? 'rounded-2xl bg-[#202020] border border-[#333333] text-slate-100' : 'rounded-2xl bg-slate-50 border border-slate-200'}`}>
                  <div className={`text-[11px] font-bold ${isWinamp ? 'text-zinc-400' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>Data Tersimpan Lokal</div>
                  <div className={`text-xl font-black mt-1 ${isWinamp ? 'text-[#00FF00]' : isDark ? 'text-white' : 'text-slate-900'}`}>{totalDaysStored} Hari</div>
                  <div className={`text-[10px] mt-0.5 ${isWinamp ? 'text-zinc-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>Disimpan di Browser Storage</div>
                </div>

                <div className={`p-4 ${isWinamp ? 'rounded-none bg-black border-2 border-[#00FF00]/50 text-[#00FF00]' : isDark ? 'rounded-2xl bg-[#0d2818] border border-emerald-700/60 text-emerald-300' : 'rounded-2xl bg-emerald-50/70 border border-emerald-200'}`}>
                  <div className={`text-[11px] font-bold ${isWinamp ? 'text-emerald-400' : isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>Status Supabase Cloud</div>
                  <div className={`text-xl font-black mt-1 ${isWinamp ? 'text-[#00FF00]' : isDark ? 'text-emerald-200' : 'text-emerald-950'}`}>
                    {supabaseUrl ? 'Terkonfigurasi' : 'Belum Terhubung'}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${isWinamp ? 'text-emerald-500' : isDark ? 'text-emerald-400/80' : 'text-emerald-700'}`}>
                    {isAutoSync ? 'Auto-sync Aktif' : 'Manual Sync'}
                  </div>
                </div>

                <div className={`p-4 flex flex-col justify-between ${isWinamp ? 'rounded-none bg-black border-2 border-zinc-700 text-[#00FF00]' : isDark ? 'rounded-2xl bg-[#1a1c2e] border border-indigo-700/60 text-indigo-200' : 'rounded-2xl bg-indigo-50/70 border border-indigo-200'}`}>
                  <div>
                    <div className={`text-[11px] font-bold ${isWinamp ? 'text-indigo-400' : isDark ? 'text-indigo-300' : 'text-indigo-800'}`}>Sinkronisasi Instan</div>
                    <div className={`text-xs font-semibold mt-1 ${isWinamp ? 'text-[#00FF00]' : isDark ? 'text-indigo-100' : 'text-indigo-950'}`}>Push & Pull Cloud</div>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      type="button"
                      onClick={handlePushToCloud}
                      disabled={isPushing}
                      className={`flex-1 text-xs font-bold py-1.5 transition-colors flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50 ${isWinamp ? 'rounded-none bg-zinc-900 hover:bg-zinc-800 text-[#00FF00] border border-[#00FF00]/60' : 'rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                    >
                      {isPushing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                      <span>Push</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePullFromCloud}
                      disabled={isPulling}
                      className={`flex-1 text-xs font-bold py-1.5 transition-colors flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50 ${isWinamp ? 'rounded-none bg-black hover:bg-zinc-900 text-[#00FF00] border border-zinc-700' : isDark ? 'rounded-xl bg-[#282a3e] hover:bg-[#33364f] text-indigo-200 border border-indigo-500/30' : 'rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-800'}`}
                    >
                      {isPulling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                      <span>Pull</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Konfigurasi Supabase */}
              <div className={`p-4 sm:p-5 space-y-4 shadow-xs ${isWinamp ? 'rounded-none border-2 border-zinc-700 bg-black text-[#00FF00]' : isDark ? 'rounded-2xl border border-[#333333] bg-[#202020] text-slate-100' : 'rounded-2xl border border-slate-200 bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className={`h-4 w-4 ${isWinamp ? 'text-[#00FF00]' : isDark ? 'text-emerald-400' : 'text-[#601700]'}`} />
                    <h3 className={`text-sm font-black ${isWinamp ? 'text-[#00FF00]' : isDark ? 'text-white' : 'text-slate-900'}`}>Kredensial API Supabase</h3>
                  </div>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className={`text-xs font-bold flex items-center space-x-1 ${isWinamp ? 'text-[#00FF00] hover:underline' : isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-indigo-600 hover:text-indigo-800'}`}
                  >
                    <span>Buka Dashboard</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isWinamp ? 'text-zinc-400' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Project URL Supabase
                    </label>
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrlInput(e.target.value)}
                      placeholder="https://xyzcompany.supabase.co"
                      className={`w-full px-3.5 py-2 text-xs font-medium focus:outline-none ${isWinamp ? 'rounded-none border-2 border-zinc-700 bg-black text-[#00FF00] focus:border-[#00FF00] placeholder:text-zinc-600' : isDark ? 'rounded-xl border border-[#3a3a3a] bg-[#2a2a2a] text-slate-100 focus:bg-[#303030] focus:ring-2 focus:ring-emerald-500/30 placeholder:text-slate-500' : 'rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#601700]/30'}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isWinamp ? 'text-zinc-400' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Anon / Public API Key
                    </label>
                    <input
                      type="text"
                      value={keyInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyInput(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className={`w-full px-3.5 py-2 text-xs font-mono focus:outline-none ${isWinamp ? 'rounded-none border-2 border-zinc-700 bg-black text-[#00FF00] focus:border-[#00FF00] placeholder:text-zinc-600' : isDark ? 'rounded-xl border border-[#3a3a3a] bg-[#2a2a2a] text-slate-100 focus:bg-[#303030] focus:ring-2 focus:ring-emerald-500/30 placeholder:text-slate-500' : 'rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#601700]/30'}`}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-3">
                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={autoSyncInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAutoSyncInput(e.target.checked)}
                        className={`h-4 w-4 rounded ${isWinamp ? 'accent-[#00FF00]' : isDark ? 'accent-emerald-500' : 'border-slate-300 text-[#601700] focus:ring-[#601700]'} cursor-pointer`}
                      />
                      <span className={`text-xs font-bold ${isWinamp ? 'text-zinc-300' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Otomatis Sinkronisasi (Auto-sync saat jadwal diubah)
                      </span>
                    </label>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={isTesting}
                        className={`px-3 py-1.5 text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer ${isWinamp ? 'rounded-none border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-[#00FF00]' : isDark ? 'rounded-xl border border-[#444444] bg-[#2a2a2a] hover:bg-[#333333] text-slate-200' : 'rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                      >
                        {isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        <span>Uji Koneksi</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveConfig}
                        className={`px-4 py-1.5 text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs ${isWinamp ? 'rounded-none bg-zinc-900 hover:bg-zinc-800 text-[#00FF00] border border-[#00FF00]/60' : isDark ? 'rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white' : 'rounded-xl bg-[#601700] hover:bg-[#7a1e00] text-white'}`}
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>Simpan Kredensial</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hasil Uji Koneksi */}
                {testResult && (
                  <div
                    className={`p-3.5 text-xs font-medium border animate-in fade-in duration-150 ${
                      isWinamp
                        ? 'rounded-none bg-black border-2 border-zinc-700 text-[#00FF00]'
                        : testResult.success
                        ? testResult.tableReady
                          ? isDark ? 'rounded-xl bg-[#0d2818] border-emerald-700/60 text-emerald-300' : 'rounded-xl bg-emerald-50 border-emerald-200 text-emerald-900'
                          : isDark ? 'rounded-xl bg-[#2b2413] border-amber-700/60 text-amber-300' : 'rounded-xl bg-amber-50 border-amber-200 text-amber-900'
                        : isDark ? 'rounded-xl bg-[#2c1317] border-rose-700/60 text-rose-300' : 'rounded-xl bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {testResult.success ? (
                        testResult.tableReady ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        )
                      ) : (
                        <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold">{testResult.message}</div>
                        {testResult.rawError && (
                          <div className={`mt-1 font-mono text-[11px] opacity-90 p-1.5 rounded-lg ${isDark || isWinamp ? 'bg-black/60' : 'bg-white/70'}`}>
                            Detail: {testResult.rawError}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Petunjuk SQL Setup Supabase - Foldable */}
              <div className={`overflow-hidden ${isWinamp ? 'rounded-none border-2 border-zinc-700 bg-black text-[#00FF00]' : isDark ? 'rounded-2xl border border-[#333333] bg-[#202020]' : 'rounded-2xl border border-slate-200 bg-slate-50'}`}>
                <div
                  onClick={() => setIsSqlExpanded(!isSqlExpanded)}
                  className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-colors select-none ${isWinamp ? 'hover:bg-zinc-900' : isDark ? 'hover:bg-[#282828]' : 'hover:bg-slate-100/70'}`}
                >
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                    <div>
                      <h3 className={`text-sm font-black ${isWinamp ? 'text-[#00FF00]' : isDark ? 'text-white' : 'text-slate-900'}`}>
                        Script SQL Supabase Setup (Schema & Permissions)
                      </h3>
                      <p className={`text-[11px] mt-0.5 ${isWinamp ? 'text-zinc-400' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Klik untuk {isSqlExpanded ? 'melipat' : 'membuka'} kode SQL lengkap
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopySql();
                      }}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${isWinamp ? 'rounded-none bg-black border border-zinc-700 text-[#00FF00] hover:bg-zinc-900' : isDark ? 'rounded-xl bg-[#2a2a2a] border border-[#444444] text-slate-200 hover:bg-[#333333]' : 'rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'}`}
                    >
                      {isCopiedSql ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{isCopiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
                    </button>
                    <div className="p-1 text-slate-400">
                      {isSqlExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>

                {isSqlExpanded && (
                  <div className={`p-4 sm:p-5 pt-0 border-t space-y-3 animate-in fade-in duration-150 ${isWinamp ? 'border-zinc-800' : isDark ? 'border-[#333333]' : 'border-slate-200'}`}>
                    <p className={`text-xs mt-3 ${isWinamp ? 'text-zinc-400' : isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Jalankan script berikut di menu <b>SQL Editor</b> di Supabase:
                    </p>
                    <pre className={`p-3 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed ${isWinamp ? 'rounded-none bg-black border border-zinc-800 text-[#00FF00]' : isDark ? 'rounded-xl bg-black/60 border border-[#333333] text-emerald-400' : 'rounded-xl bg-slate-900 text-emerald-400'}`}>
                      {SUPABASE_SQL_SETUP_SCRIPT}
                    </pre>
                  </div>
                )}
              </div>

              {/* Clear All Data Safety Control */}
              {onClearAllData && (
                <div className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isWinamp ? 'rounded-none border-2 border-rose-900 bg-black text-rose-400' : isDark ? 'rounded-2xl border border-rose-900/60 bg-[#241215]' : 'rounded-2xl border border-rose-200 bg-rose-50/50'}`}>
                  <div>
                    <h4 className={`text-xs font-black ${isWinamp ? 'text-rose-400' : isDark ? 'text-rose-300' : 'text-rose-900'}`}>Reset Semua Data Lokal</h4>
                    <p className={`text-[11px] ${isWinamp ? 'text-rose-400/80' : isDark ? 'text-rose-400' : 'text-rose-700'}`}>
                      Menghapus seluruh entri jadwal lokal dari memori browser.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Apakah Anda yakin ingin menghapus SEMUA data jadwal lokal? Pastikan sudah melakukan backup.')) {
                        onClearAllData();
                        onClose();
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto ${isWinamp ? 'rounded-none border border-rose-600 bg-black hover:bg-zinc-900 text-rose-400' : isDark ? 'rounded-xl border border-rose-800 bg-[#2e1519] hover:bg-[#3a191f] text-rose-300' : 'rounded-xl border border-rose-300 bg-white hover:bg-rose-100 text-rose-700'}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Hapus Semua Data</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =========================================================
              TAB 2: EKSPOR DATA DENGAN PILIHAN RENTANG
              ========================================================= */}
          {activeTab === 'export' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Range Selector Filter */}
              <div className={`p-4 space-y-3.5 ${isWinamp ? 'rounded-none border-2 border-zinc-700 bg-black text-[#00FF00]' : isDark ? 'rounded-2xl border border-[#333333] bg-[#202020] text-slate-100' : 'rounded-2xl border border-slate-200 bg-slate-50/80'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CalendarRange className={`h-4 w-4 ${isWinamp ? 'text-[#00FF00]' : isDark ? 'text-emerald-400' : 'text-[#297373]'}`} />
                    <h4 className={`text-xs sm:text-sm font-black ${isWinamp ? 'text-[#00FF00]' : isDark ? 'text-white' : 'text-slate-900'}`}>Pilih Rentang Waktu Ekspor</h4>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 ${isWinamp ? 'text-[#00FF00] bg-black rounded-none border border-[#00FF00]/60' : isDark ? 'text-emerald-400 bg-[#2a2a2a] rounded-lg border border-emerald-600/40' : 'text-indigo-700 bg-indigo-50 rounded-lg border border-indigo-100'}`}>
                    {filteredEntries.length} Hari Terpilih
                  </span>
                </div>

                {/* Range Type Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRangeType('month_active')}
                    className={`p-2.5 text-left border transition-all cursor-pointer ${
                      isWinamp
                        ? `rounded-none ${rangeType === 'month_active' ? 'bg-zinc-900 border-[#00FF00] text-[#00FF00]' : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-[#00FF00]'}`
                        : isDark
                        ? `rounded-xl ${rangeType === 'month_active' ? 'bg-[#2A2A2A] border-emerald-500 text-emerald-400 ring-1 ring-emerald-500' : 'bg-[#181818] border-[#333333] text-slate-300 hover:bg-[#252525]'}`
                        : `rounded-xl ${rangeType === 'month_active' ? 'bg-white border-[#297373] text-[#297373] ring-1 ring-[#297373] shadow-xs' : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'}`
                    }`}
                  >
                    <div className="text-xs font-black">Bulan Aktif</div>
                    <div className={`text-[10px] truncate ${isWinamp ? 'text-zinc-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRangeType('month_filled')}
                    className={`p-2.5 text-left border transition-all cursor-pointer ${
                      isWinamp
                        ? `rounded-none ${rangeType === 'month_filled' ? 'bg-zinc-900 border-[#00FF00] text-[#00FF00]' : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-[#00FF00]'}`
                        : isDark
                        ? `rounded-xl ${rangeType === 'month_filled' ? 'bg-[#2A2A2A] border-emerald-500 text-emerald-400 ring-1 ring-emerald-500' : 'bg-[#181818] border-[#333333] text-slate-300 hover:bg-[#252525]'}`
                        : `rounded-xl ${rangeType === 'month_filled' ? 'bg-white border-[#297373] text-[#297373] ring-1 ring-[#297373] shadow-xs' : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'}`
                    }`}
                  >
                    <div className="text-xs font-black">Bulan Terisi Data</div>
                    <div className={`text-[10px] truncate ${isWinamp ? 'text-zinc-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {filledMonths.length > 0 ? `${filledMonths.length} bulan di ${selectedYear}` : 'Belum ada data'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRangeType('quarter')}
                    className={`p-2.5 text-left border transition-all cursor-pointer ${
                      isWinamp
                        ? `rounded-none ${rangeType === 'quarter' ? 'bg-zinc-900 border-[#00FF00] text-[#00FF00]' : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-[#00FF00]'}`
                        : isDark
                        ? `rounded-xl ${rangeType === 'quarter' ? 'bg-[#2A2A2A] border-emerald-500 text-emerald-400 ring-1 ring-emerald-500' : 'bg-[#181818] border-[#333333] text-slate-300 hover:bg-[#252525]'}`
                        : `rounded-xl ${rangeType === 'quarter' ? 'bg-white border-[#297373] text-[#297373] ring-1 ring-[#297373] shadow-xs' : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'}`
                    }`}
                  >
                    <div className="text-xs font-black">Kuartal (Triwulan)</div>
                    <div className={`text-[10px] truncate ${isWinamp ? 'text-zinc-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>Q{selectedQuarter} {selectedYear}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRangeType('semester')}
                    className={`p-2.5 text-left border transition-all cursor-pointer ${
                      isWinamp
                        ? `rounded-none ${rangeType === 'semester' ? 'bg-zinc-900 border-[#00FF00] text-[#00FF00]' : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-[#00FF00]'}`
                        : isDark
                        ? `rounded-xl ${rangeType === 'semester' ? 'bg-[#2A2A2A] border-emerald-500 text-emerald-400 ring-1 ring-emerald-500' : 'bg-[#181818] border-[#333333] text-slate-300 hover:bg-[#252525]'}`
                        : `rounded-xl ${rangeType === 'semester' ? 'bg-white border-[#297373] text-[#297373] ring-1 ring-[#297373] shadow-xs' : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'}`
                    }`}
                  >
                    <div className="text-xs font-black">Semester</div>
                    <div className={`text-[10px] truncate ${isWinamp ? 'text-zinc-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>Semester {selectedSemester} {selectedYear}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRangeType('year')}
                    className={`p-2.5 text-left border transition-all cursor-pointer ${
                      isWinamp
                        ? `rounded-none ${rangeType === 'year' ? 'bg-zinc-900 border-[#00FF00] text-[#00FF00]' : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-[#00FF00]'}`
                        : isDark
                        ? `rounded-xl ${rangeType === 'year' ? 'bg-[#2A2A2A] border-emerald-500 text-emerald-400 ring-1 ring-emerald-500' : 'bg-[#181818] border-[#333333] text-slate-300 hover:bg-[#252525]'}`
                        : `rounded-xl ${rangeType === 'year' ? 'bg-white border-[#297373] text-[#297373] ring-1 ring-[#297373] shadow-xs' : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'}`
                    }`}
                  >
                    <div className="text-xs font-black">Tahun Penuh</div>
                    <div className={`text-[10px] truncate ${isWinamp ? 'text-zinc-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>12 Bulan ({selectedYear})</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRangeType('custom')}
                    className={`p-2.5 text-left border transition-all cursor-pointer ${
                      isWinamp
                        ? `rounded-none ${rangeType === 'custom' ? 'bg-zinc-900 border-[#00FF00] text-[#00FF00]' : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-[#00FF00]'}`
                        : isDark
                        ? `rounded-xl ${rangeType === 'custom' ? 'bg-[#2A2A2A] border-emerald-500 text-emerald-400 ring-1 ring-emerald-500' : 'bg-[#181818] border-[#333333] text-slate-300 hover:bg-[#252525]'}`
                        : `rounded-xl ${rangeType === 'custom' ? 'bg-white border-[#297373] text-[#297373] ring-1 ring-[#297373] shadow-xs' : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'}`
                    }`}
                  >
                    <div className="text-xs font-black">Rentang Khusus</div>
                    <div className={`text-[10px] truncate ${isWinamp ? 'text-zinc-500' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pilih Tgl Bebas</div>
                  </button>
                </div>

                {/* Sub-selector conditional */}
                {rangeType === 'quarter' && (
                  <div className="flex items-center space-x-2 pt-1">
                    <span className={`text-xs font-bold ${isWinamp ? 'text-zinc-300' : isDark ? 'text-slate-300' : 'text-slate-600'}`}>Pilih Kuartal:</span>
                    {[1, 2, 3, 4].map((q: number) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setSelectedQuarter(q)}
                        className={`px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                          isWinamp
                            ? `rounded-none ${selectedQuarter === q ? 'bg-[#00FF00] text-black font-black' : 'bg-black border border-zinc-700 text-[#00FF00]'}`
                            : isDark
                            ? `rounded-lg ${selectedQuarter === q ? 'bg-emerald-600 text-white' : 'bg-[#2a2a2a] border border-[#444444] text-slate-300 hover:bg-[#333333]'}`
                            : `rounded-lg ${selectedQuarter === q ? 'bg-[#297373] text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`
                        }`}
                      >
                        Q{q} {q === 1 ? '(Jan-Mar)' : q === 2 ? '(Apr-Jun)' : q === 3 ? '(Jul-Sep)' : '(Okt-Des)'}
                      </button>
                    ))}
                  </div>
                )}

                {rangeType === 'semester' && (
                  <div className="flex items-center space-x-2 pt-1">
                    <span className={`text-xs font-bold ${isWinamp ? 'text-zinc-300' : isDark ? 'text-slate-300' : 'text-slate-600'}`}>Pilih Semester:</span>
                    {[1, 2].map((s: number) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSemester(s)}
                        className={`px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                          isWinamp
                            ? `rounded-none ${selectedSemester === s ? 'bg-[#00FF00] text-black font-black' : 'bg-black border border-zinc-700 text-[#00FF00]'}`
                            : isDark
                            ? `rounded-lg ${selectedSemester === s ? 'bg-emerald-600 text-white' : 'bg-[#2a2a2a] border border-[#444444] text-slate-300 hover:bg-[#333333]'}`
                            : `rounded-lg ${selectedSemester === s ? 'bg-[#297373] text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`
                        }`}
                      >
                        Semester {s} ({s === 1 ? 'Jan - Jun' : 'Jul - Des'})
                      </button>
                    ))}
                  </div>
                )}

                {rangeType === 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className={`block text-[11px] font-bold mb-1 ${isWinamp ? 'text-zinc-400' : isDark ? 'text-slate-300' : 'text-slate-600'}`}>Dari Tanggal:</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className={`w-full px-3 py-1.5 text-xs font-medium focus:outline-none ${isWinamp ? 'rounded-none border-2 border-zinc-700 bg-black text-[#00FF00] focus:border-[#00FF00]' : isDark ? 'rounded-xl border border-[#444444] bg-[#2a2a2a] text-slate-100 focus:ring-2 focus:ring-emerald-500/30' : 'rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-[#297373]/30'}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[11px] font-bold mb-1 ${isWinamp ? 'text-zinc-400' : isDark ? 'text-slate-300' : 'text-slate-600'}`}>Sampai Tanggal:</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className={`w-full px-3 py-1.5 text-xs font-medium focus:outline-none ${isWinamp ? 'rounded-none border-2 border-zinc-700 bg-black text-[#00FF00] focus:border-[#00FF00]' : isDark ? 'rounded-xl border border-[#444444] bg-[#2a2a2a] text-slate-100 focus:ring-2 focus:ring-emerald-500/30' : 'rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-[#297373]/30'}`}
                      />
                    </div>
                  </div>
                )}

                <div className={`text-[11px] font-medium ${isWinamp ? 'text-zinc-400' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Rentang aktif: <span className={`font-bold ${isWinamp ? 'text-[#00FF00]' : isDark ? 'text-white' : 'text-slate-800'}`}>{rangeLabel}</span>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Excel Export */}
                <div className={`p-4 flex flex-col justify-between space-y-3 transition-colors ${isWinamp ? 'rounded-none border-2 border-zinc-700 bg-black text-[#00FF00]' : isDark ? 'rounded-2xl border border-[#333333] bg-[#202020] text-slate-100 hover:border-emerald-500/50 shadow-xs' : 'rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 shadow-2xs'}`}>
                  <div className="flex items-start space-x-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center ${isWinamp ? 'rounded-none bg-zinc-900 text-[#00FF00] border border-zinc-700' : isDark ? 'rounded-2xl bg-[#172c1e] text-emerald-400 border border-emerald-600/40' : 'rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                      <FileSpreadsheet className="h-5 w-5" />
                    </span>
                    <div>
                      <h4 className={`text-xs sm:text-sm font-black ${isWinamp ? 'text-[#00FF00]' : isDark ? 'text-white' : 'text-slate-900'}`}>Spreadsheet Excel (.xlsx)</h4>
                      <p className={`text-[11px] mt-0.5 ${isWinamp ? 'text-zinc-400' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Rekap jadwal lengkap jam kerja, lembur, dan status sesuai rentang yang dipilih.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    disabled={exportLoading === 'xlsx'}
                    className={`w-full text-xs font-bold py-2 transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 ${isWinamp ? 'rounded-none bg-zinc-900 hover:bg-zinc-800 text-[#00FF00] border border-[#00FF00]/60' : 'rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'}`}
                  >
                    {exportLoading === 'xlsx' ? <Loader2 className="h-4 w-4 animate-spin" /> : exportSuccess === 'xlsx' ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                    <span>{exportSuccess === 'xlsx' ? 'Berhasil Diunduh!' : 'Unduh File Excel'}</span>
                  </button>
                </div>

                {/* PDF Report Export */}
                <div className={`p-4 flex flex-col justify-between space-y-3 transition-colors ${isWinamp ? 'rounded-none border-2 border-zinc-700 bg-black text-[#00FF00]' : isDark ? 'rounded-2xl border border-[#333333] bg-[#202020] text-slate-100 hover:border-rose-500/50 shadow-xs' : 'rounded-2xl border border-slate-200 bg-white hover:border-rose-300 shadow-2xs'}`}>
                  <div className="flex items-start space-x-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center ${isWinamp ? 'rounded-none bg-zinc-900 text-rose-400 border border-zinc-700' : isDark ? 'rounded-2xl bg-[#2e171a] text-rose-400 border border-rose-600/40' : 'rounded-2xl bg-rose-50 text-rose-600 border border-rose-200'}`}>
                      <FileText className="h-5 w-5" />
                    </span>
                    <div>
                      <h4 className={`text-xs sm:text-sm font-black ${isWinamp ? 'text-[#00FF00]' : isDark ? 'text-white' : 'text-slate-900'}`}>Dokumen PDF Laporan</h4>
                      <p className={`text-[11px] mt-0.5 ${isWinamp ? 'text-zinc-400' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Format tabel landscape multi-halaman siap cetak sesuai rentang yang dipilih.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportPDF}
                    disabled={exportLoading === 'pdf'}
                    className={`w-full text-xs font-bold py-2 transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 ${isWinamp ? 'rounded-none bg-zinc-900 hover:bg-zinc-800 text-[#00FF00] border border-[#00FF00]/60' : 'rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs'}`}
                  >
                    {exportLoading === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : exportSuccess === 'pdf' ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                    <span>{exportSuccess === 'pdf' ? 'Berhasil Diunduh!' : 'Unduh Laporan PDF'}</span>
                  </button>
                </div>

                {/* SQL Dump Export */}
                <div className={`p-4 flex flex-col justify-between space-y-3 transition-colors ${isWinamp ? 'rounded-none border-2 border-zinc-700 bg-black text-[#00FF00]' : isDark ? 'rounded-2xl border border-[#333333] bg-[#202020] text-slate-100 hover:border-indigo-500/50 shadow-xs' : 'rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 shadow-2xs'}`}>
                  <div className="flex items-start space-x-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center ${isWinamp ? 'rounded-none bg-zinc-900 text-indigo-400 border border-zinc-700' : isDark ? 'rounded-2xl bg-[#1b1c30] text-indigo-300 border border-indigo-600/40' : 'rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200'}`}>
                      <Database className="h-5 w-5" />
                    </span>
                    <div>
                      <h4 className={`text-xs sm:text-sm font-black ${isWinamp ? 'text-[#00FF00]' : isDark ? 'text-white' : 'text-slate-900'}`}>Ekspor SQL Dump (.sql)</h4>
                      <p className={`text-[11px] mt-0.5 ${isWinamp ? 'text-zinc-400' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Kueri CREATE & UPSERT tabel shifts untuk PostgreSQL/Supabase.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportSQL}
                    disabled={exportLoading === 'sql'}
                    className={`w-full text-xs font-bold py-2 transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 ${isWinamp ? 'rounded-none bg-zinc-900 hover:bg-zinc-800 text-[#00FF00] border border-[#00FF00]/60' : 'rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'}`}
                  >
                    {exportLoading === 'sql' ? <Loader2 className="h-4 w-4 animate-spin" /> : exportSuccess === 'sql' ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                    <span>{exportSuccess === 'sql' ? 'Berhasil Diunduh!' : 'Unduh File SQL'}</span>
                  </button>
                </div>

                {/* JSON Backup */}
                <div className={`p-4 flex flex-col justify-between space-y-3 transition-colors ${isWinamp ? 'rounded-none border-2 border-zinc-700 bg-black text-[#00FF00]' : isDark ? 'rounded-2xl border border-[#333333] bg-[#202020] text-slate-100 hover:border-amber-500/50 shadow-xs' : 'rounded-2xl border border-slate-200 bg-white hover:border-amber-300 shadow-2xs'}`}>
                  <div className="flex items-start space-x-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center ${isWinamp ? 'rounded-none bg-zinc-900 text-amber-400 border border-zinc-700' : isDark ? 'rounded-2xl bg-[#2e2413] text-amber-300 border border-amber-600/40' : 'rounded-2xl bg-amber-50 text-amber-600 border border-amber-200'}`}>
                      <FileCode className="h-5 w-5" />
                    </span>
                    <div>
                      <h4 className={`text-xs sm:text-sm font-black ${isWinamp ? 'text-[#00FF00]' : isDark ? 'text-white' : 'text-slate-900'}`}>Cadangan Data (JSON)</h4>
                      <p className={`text-[11px] mt-0.5 ${isWinamp ? 'text-zinc-400' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Cadangan data terstruktur sesuai rentang untuk dipulihkan kapan saja.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className={`w-full text-xs font-bold py-2 transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${isWinamp ? 'rounded-none bg-zinc-900 hover:bg-zinc-800 text-[#00FF00] border border-[#00FF00]/60' : 'rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs'}`}
                  >
                    {exportSuccess === 'json' ? <Check className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                    <span>{exportSuccess === 'json' ? 'Berhasil Diunduh!' : 'Unduh File JSON'}</span>
                  </button>
                </div>
              </div>

              {/* PNG Screenshot Full-width Box */}
              <div className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isWinamp ? 'rounded-none border-2 border-zinc-700 bg-black text-[#00FF00]' : isDark ? 'rounded-2xl border border-[#333333] bg-[#202020] text-slate-100' : 'rounded-2xl border border-slate-200 bg-slate-50'}`}>
                <div className="flex items-start sm:items-center space-x-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center ${isWinamp ? 'rounded-none bg-zinc-900 text-indigo-400 border border-zinc-700' : isDark ? 'rounded-xl bg-[#1d1f35] text-indigo-300 border border-indigo-600/40' : 'rounded-xl bg-indigo-100 text-indigo-600 border border-indigo-200'}`}>
                    <ImageIcon className="h-4.5 w-4.5" />
                  </span>
                  <div className="space-y-0.5">
                    <div className={`text-xs font-black ${isWinamp ? 'text-[#00FF00]' : isDark ? 'text-white' : 'text-slate-900'}`}>Tangkapan Layar Kalender (PNG)</div>
                    <div className={`text-[11px] ${isWinamp ? 'text-zinc-400' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Simpan tampilan visual kalender bulan aktif resolusi tinggi untuk dibagikan.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportPNG}
                  disabled={exportLoading === 'png'}
                  className={`px-3.5 py-2 text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 ${isWinamp ? 'rounded-none border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-[#00FF00]' : isDark ? 'rounded-xl border border-[#444444] bg-[#2a2a2a] hover:bg-[#333333] text-slate-200' : 'rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 shadow-2xs'}`}
                >
                  {exportLoading === 'png' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : exportSuccess === 'png' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Download className="h-3.5 w-3.5" />}
                  <span>{exportSuccess === 'png' ? 'Tersimpan!' : 'Ambil Tangkapan Layar'}</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              TAB 3: IMPOR DATA
              ========================================================= */}
          {activeTab === 'import' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Type Switcher */}
              <div className={`flex items-center space-x-2 p-1 w-fit ${isWinamp ? 'bg-black border border-zinc-700 rounded-none' : isDark ? 'bg-[#222222] border border-[#333333] rounded-xl' : 'bg-slate-100 rounded-xl'}`}>
                <button
                  type="button"
                  onClick={() => setImportType('json')}
                  className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    isWinamp
                      ? `rounded-none ${importType === 'json' ? 'bg-zinc-900 text-[#00FF00] border border-[#00FF00]/50' : 'text-zinc-500 hover:text-[#00FF00]'}`
                      : isDark
                      ? `rounded-lg ${importType === 'json' ? 'bg-[#333333] text-emerald-400 shadow-xs' : 'text-slate-400 hover:text-slate-200'}`
                      : `rounded-lg ${importType === 'json' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`
                  }`}
                >
                  Format JSON
                </button>
                <button
                  type="button"
                  onClick={() => setImportType('sql')}
                  className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    isWinamp
                      ? `rounded-none ${importType === 'sql' ? 'bg-zinc-900 text-[#00FF00] border border-[#00FF00]/50' : 'text-zinc-500 hover:text-[#00FF00]'}`
                      : isDark
                      ? `rounded-lg ${importType === 'sql' ? 'bg-[#333333] text-emerald-400 shadow-xs' : 'text-slate-400 hover:text-slate-200'}`
                      : `rounded-lg ${importType === 'sql' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`
                  }`}
                >
                  Format SQL Dump
                </button>
              </div>

              {/* File Drop / Upload */}
              <div className={`border-2 border-dashed p-4 text-center transition-colors ${isWinamp ? 'rounded-none border-zinc-700 hover:border-[#00FF00] bg-black text-[#00FF00]' : isDark ? 'rounded-2xl border-[#444444] hover:border-emerald-400 bg-[#202020] text-slate-200' : 'rounded-2xl border-slate-200 hover:border-indigo-400 bg-slate-50'}`}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept={importType === 'json' ? '.json,application/json' : '.sql,.txt'}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className={`h-6 w-6 ${isWinamp ? 'text-[#00FF00]/60' : isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <div className={`text-xs font-bold ${isWinamp ? 'text-zinc-300' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {fileName ? (
                      <span className={`font-bold ${isWinamp ? 'text-[#00FF00]' : isDark ? 'text-emerald-400' : 'text-indigo-600'}`}>{fileName}</span>
                    ) : (
                      'Tarik file ke sini atau klik untuk memilih file'
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${isWinamp ? 'rounded-none bg-zinc-900 border border-zinc-700 text-[#00FF00] hover:bg-zinc-800' : isDark ? 'rounded-xl bg-[#2a2a2a] border border-[#444444] text-slate-200 hover:bg-[#333333]' : 'rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'}`}
                  >
                    Pilih File Dari Komputer
                  </button>
                </div>
              </div>

              {/* Or Paste Area */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${isWinamp ? 'text-zinc-400' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Atau Tempel Teks Konten Langsung:
                </label>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  rows={4}
                  placeholder={
                    importType === 'json'
                      ? '{"days": { "2026-03-01": { "shift": "Graha", "isMasuk": true } } }'
                      : "INSERT INTO public.shifts ... VALUES ('2026-03-01', ...);"
                  }
                  className={`w-full p-3 text-xs font-mono focus:outline-none ${isWinamp ? 'rounded-none border-2 border-zinc-700 bg-black text-[#00FF00] focus:border-[#00FF00] placeholder:text-zinc-600' : isDark ? 'rounded-xl border border-[#3a3a3a] bg-[#222222] text-slate-100 focus:bg-[#282828] focus:ring-2 focus:ring-emerald-500/30 placeholder:text-slate-500' : 'rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20'}`}
                />
              </div>

              {/* Action Parse */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <label className={`text-xs font-bold ${isWinamp ? 'text-zinc-400' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>Mode Impor:</label>
                  <label className="flex items-center space-x-1.5 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className={isWinamp ? 'accent-[#00FF00]' : isDark ? 'accent-emerald-500' : 'text-indigo-600'}
                    />
                    <span className={isWinamp ? 'text-zinc-300' : isDark ? 'text-slate-200' : 'text-slate-800'}>Gabungkan (Merge)</span>
                  </label>
                  <label className="flex items-center space-x-1.5 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className={isWinamp ? 'accent-[#00FF00]' : isDark ? 'accent-emerald-500' : 'text-indigo-600'}
                    />
                    <span className={isWinamp ? 'text-zinc-300' : isDark ? 'text-slate-200' : 'text-slate-800'}>Gantikan Semua (Replace)</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleParseAndReview}
                  className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer shadow-xs ${isWinamp ? 'rounded-none bg-zinc-900 hover:bg-zinc-800 text-[#00FF00] border border-[#00FF00]/60' : isDark ? 'rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white' : 'rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                >
                  Periksa & Validasi Data
                </button>
              </div>

              {/* Error Box */}
              {importError && (
                <div className={`p-3 text-xs flex items-center space-x-2 ${isWinamp ? 'rounded-none bg-black border border-rose-600 text-rose-400' : isDark ? 'rounded-xl bg-[#2a1317] border border-rose-800 text-rose-300' : 'rounded-xl bg-rose-50 border border-rose-200 text-rose-800'}`}>
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Preview Box */}
              {parsedData && (
                <div className={`p-4 space-y-3 ${isWinamp ? 'rounded-none border-2 border-[#00FF00] bg-black text-[#00FF00]' : isDark ? 'rounded-2xl border border-emerald-700/60 bg-[#0d2818] text-emerald-200' : 'rounded-2xl border border-emerald-200 bg-emerald-50/70'}`}>
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center space-x-2 font-bold text-xs ${isWinamp ? 'text-[#00FF00]' : isDark ? 'text-emerald-300' : 'text-emerald-900'}`}>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>{Object.keys(parsedData).length} hari data jadwal siap diimpor!</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleExecuteImport}
                      disabled={isProcessingImport}
                      className={`px-4 py-1.5 text-xs font-black transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 ${isWinamp ? 'rounded-none bg-[#00FF00] text-black hover:bg-[#00cc00]' : 'rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'}`}
                    >
                      {isProcessingImport ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      <span>Terapkan Impor Sekarang</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
