import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Image, 
  Database, 
  FileCode, 
  X, 
  Download, 
  Check, 
  Loader2,
  Calendar,
  Sparkles,
  CalendarRange,
  Layers,
  Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DayData, normalizeShift } from '../types';
import { calculateDayResult } from '../lib/calculator';
import { saveFileWithDialog } from '../lib/fileDownload';

export type ExportRangeType = 'month_active' | 'month_filled' | 'quarter' | 'semester' | 'year' | 'custom';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: number;
  selectedYear: number;
  monthName: string;
  daysState: Record<string, DayData>;
  targetRefId?: string; // ID elemen kalender untuk screenshot PNG/PDF
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  selectedYear,
  monthName,
  daysState,
  targetRefId = 'calendar-grid-capture'
}) => {
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [successType, setSuccessType] = useState<string | null>(null);

  // Range Filter State
  const [rangeType, setRangeType] = useState<ExportRangeType>('month_active');
  const [selectedQuarter, setSelectedQuarter] = useState<number>(() => Math.ceil(selectedMonth / 3));
  const [selectedSemester, setSelectedSemester] = useState<number>(() => (selectedMonth <= 6 ? 1 : 2));
  
  // Custom Date Range (default to current month bounds)
  const defaultStartDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
  const defaultEndDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(
    new Date(selectedYear, selectedMonth, 0).getDate()
  ).padStart(2, '0')}`;

  const [customStartDate, setCustomStartDate] = useState<string>(defaultStartDate);
  const [customEndDate, setCustomEndDate] = useState<string>(defaultEndDate);

  // Derivasi bulan yang memiliki data di tahun terpilih
  const filledMonths = useMemo(() => {
    const months = new Set<number>();
    Object.keys(daysState).forEach((key) => {
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
      const monthLabels = activeMonthsList.map((m) => MONTH_NAMES[m - 1]).join(', ');
      label = `Bulan Terisi Data (${monthLabels}) ${selectedYear}`;
      suffix = `Bulan_Terisi_${selectedYear}`;

      activeMonthsList.forEach((m) => {
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

      qMonths.forEach((m) => {
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
      label = `Semester ${selectedSemester} (${selectedSemester === 1 ? 'Jan - Jun' : 'Jul - Des'}) ${selectedYear}`;
      suffix = `Semester_${selectedSemester}_${selectedYear}`;

      sMonths.forEach((m) => {
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
      label = `Tahun ${selectedYear} Penuh`;
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
      const start = new Date(customStartDate || defaultStartDate);
      const end = new Date(customEndDate || defaultEndDate);
      label = `Rentang ${customStartDate} s/d ${customEndDate}`;
      suffix = `Rentang_${customStartDate}_sd_${customEndDate}`;

      const cur = new Date(start);
      // Safety guard against infinite loops
      let count = 0;
      while (cur <= end && count < 1000) {
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
        count++;
      }
    }

    return { filteredEntries: entries, rangeLabel: label, filenameSuffix: suffix };
  }, [
    rangeType,
    selectedMonth,
    selectedYear,
    selectedQuarter,
    selectedSemester,
    customStartDate,
    customEndDate,
    defaultStartDate,
    defaultEndDate,
    filledMonths,
    daysState,
  ]);

  if (!isOpen) return null;

  // 1. Ekspor Excel (.xlsx) dengan rentang terpilih
  const handleExportExcel = async () => {
    try {
      setLoadingType('xlsx');
      const rows = filteredEntries.map((item) => ({
        'Tanggal': `${String(item.day).padStart(2, '0')}/${String(item.month).padStart(2, '0')}/${item.year}`,
        'Hari': item.dayName,
        'Shift': normalizeShift(item.data.shift),
        'Status Masuk': item.data.isMasuk ? 'Masuk' : 'Tidak Masuk',
        'Tipe Hari Libur':
          item.dateObj.getDay() === 0 || item.dateObj.getDay() === 6 || item.data.isManualHoliday
            ? item.data.tipeMasukLibur === 'lembur'
              ? 'Lembur Libur'
              : 'Piket'
            : '-',
        'Jam Masuk': item.data.jamMasuk || '-',
        'Jam Pulang': item.data.jamPulang || '-',
        'Absen Ceisa': item.data.absenCeisa || '-',
        'Durasi Kerja (Jam)': item.calc.durasiKerja > 0 ? Number(item.calc.durasiKerja.toFixed(2)) : 0,
        'Jam Lembur': item.calc.jamLembur > 0 ? Number(item.calc.jamLembur.toFixed(1)) : 0,
        'Status/Keterangan': item.calc.keteranganStatus || '-',
        'ST Tambahan (Cuti)': item.data.isSuratTugasTambahan ? 'Ya' : 'Tidak',
        'Gunakan Off Geser': item.data.isGunakanOffGeser ? 'Ya' : 'Tidak',
        'Gunakan Cuti Pengganti': item.data.isGunakanCP ? 'Ya' : 'Tidak',
        'Hold Dokumen': item.data.isHoldDokumen ? 'Ya' : 'Tidak',
        'Catatan': item.data.note || '',
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Jadwal_${filenameSuffix.substring(0, 25)}`);

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
        setSuccessType('xlsx');
        setTimeout(() => setSuccessType(null), 2500);
      }
    } catch (e) {
      console.error('Export Excel failed:', e);
    } finally {
      setLoadingType(null);
    }
  };

  // 2. Ekspor PDF (.pdf) dengan rentang terpilih dan auto-pagination
  const handleExportPDF = async () => {
    try {
      setLoadingType('pdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

      const totalLembur = filteredEntries.reduce((acc, item) => acc + (item.calc.isLembur ? item.calc.jamLembur : 0), 0);
      const totalPiket = filteredEntries.filter((item) => item.calc.isPiket).length;
      const totalMasuk = filteredEntries.filter((item) => item.data.isMasuk).length;

      // Header Laporan
      const drawHeader = (pageNumber: number, totalPages?: number) => {
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        doc.text(`Laporan Jadwal Shift & Lembur - ${rangeLabel}`, 40, 35);

        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(
          `Total: ${filteredEntries.length} hari (${totalMasuk} Masuk) | Lembur: ${totalLembur.toFixed(1)} Jam | Piket: ${totalPiket} Hari | Export: ${new Date().toLocaleString('id-ID')}`,
          40,
          50
        );

        let y = 65;
        doc.setFillColor(41, 115, 115); // #297373
        doc.setTextColor(255, 255, 255);
        doc.rect(40, y, 762, 18, 'F');

        doc.setFontSize(8.5);
        doc.text('Tgl', 45, y + 12);
        doc.text('Hari', 75, y + 12);
        doc.text('Shift', 125, y + 12);
        doc.text('Masuk', 165, y + 12);
        doc.text('Jam Kerja', 220, y + 12);
        doc.text('Ceisa', 295, y + 12);
        doc.text('Durasi', 345, y + 12);
        doc.text('Lembur', 390, y + 12);
        doc.text('Status/Keterangan', 440, y + 12);
        doc.text('ST / Cuti', 580, y + 12);
        doc.text('Catatan', 640, y + 12);

        return y + 18;
      };

      let currentY = drawHeader(1);
      const dayNamesShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

      filteredEntries.forEach((item, idx) => {
        const isWeekend = item.dateObj.getDay() === 0 || item.dateObj.getDay() === 6;

        // Background alternate row
        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(40, currentY, 762, 13, 'F');
        }

        doc.setFontSize(8);
        doc.setTextColor(isWeekend ? 225 : 30, isWeekend ? 29 : 41, isWeekend ? 72 : 59);

        const dateFormatted = `${String(item.day).padStart(2, '0')}/${String(item.month).padStart(2, '0')}`;
        doc.text(dateFormatted, 45, currentY + 9.5);
        doc.text(dayNamesShort[item.dateObj.getDay()], 75, currentY + 9.5);
        doc.text(normalizeShift(item.data.shift), 125, currentY + 9.5);
        doc.text(item.data.isMasuk ? 'Ya' : '-', 165, currentY + 9.5);
        doc.text(item.data.isMasuk && item.data.jamMasuk ? `${item.data.jamMasuk}-${item.data.jamPulang}` : '-', 220, currentY + 9.5);
        doc.text(item.data.absenCeisa || '-', 295, currentY + 9.5);
        doc.text(item.calc.durasiKerja > 0 ? `${item.calc.durasiKerja.toFixed(1)}h` : '-', 345, currentY + 9.5);
        doc.text(item.calc.jamLembur > 0 ? `${item.calc.jamLembur.toFixed(1)}h` : '-', 390, currentY + 9.5);
        doc.text(item.calc.keteranganStatus || '-', 440, currentY + 9.5);
        doc.text(item.data.isSuratTugasTambahan ? 'ST (+)' : item.data.isGunakanCP ? 'CP (-)' : '-', 580, currentY + 9.5);
        doc.text(item.data.note.length > 24 ? `${item.data.note.substring(0, 24)}...` : item.data.note || '-', 640, currentY + 9.5);

        currentY += 13;

        if (currentY > 540 && idx < filteredEntries.length - 1) {
          doc.addPage();
          currentY = drawHeader(doc.getNumberOfPages());
        }
      });

      const pdfBlob = doc.output('blob');
      const res = await saveFileWithDialog({
        blob: pdfBlob,
        filename: `Laporan_Shift_${filenameSuffix}.pdf`,
        description: 'PDF Document',
        mimeType: 'application/pdf',
        extension: 'pdf',
      });

      if (res.success) {
        setSuccessType('pdf');
        setTimeout(() => setSuccessType(null), 2500);
      }
    } catch (e) {
      console.error('Export PDF failed:', e);
    } finally {
      setLoadingType(null);
    }
  };

  // 3. Ekspor PNG Screenshot
  const handleExportPNG = async () => {
    try {
      setLoadingType('png');
      const element = document.getElementById(targetRefId);
      if (!element) {
        throw new Error('Element kalender tidak ditemukan');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (blob) {
          const res = await saveFileWithDialog({
            blob,
            filename: `Kalender_Shift_${monthName}_${selectedYear}.png`,
            description: 'PNG Image',
            mimeType: 'image/png',
            extension: 'png',
          });

          if (res.success) {
            setSuccessType('png');
            setTimeout(() => setSuccessType(null), 2500);
          }
        }
      }, 'image/png');
    } catch (e) {
      console.error('Export PNG failed:', e);
    } finally {
      setLoadingType(null);
    }
  };

  // 4. Ekspor JSON (.json) dengan filter rentang
  const handleExportJSON = async () => {
    try {
      setLoadingType('json');
      const filteredDaysMap: Record<string, DayData> = {};
      filteredEntries.forEach((item) => {
        filteredDaysMap[item.dateKey] = item.data;
      });

      const exportObject = {
        app: 'Jadwal Shift & Lembur',
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        rangeType,
        rangeLabel,
        totalDaysExported: filteredEntries.length,
        days: filteredDaysMap,
      };

      const jsonStr = JSON.stringify(exportObject, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const res = await saveFileWithDialog({
        blob,
        filename: `Backup_Jadwal_${filenameSuffix}.json`,
        description: 'JSON Backup Data',
        mimeType: 'application/json',
        extension: 'json',
      });

      if (res.success) {
        setSuccessType('json');
        setTimeout(() => setSuccessType(null), 2500);
      }
    } catch (e) {
      console.error('Export JSON failed:', e);
    } finally {
      setLoadingType(null);
    }
  };

  // 5. Ekspor SQL Dump (.sql) dengan skema tabel shifts
  const handleExportSQL = async () => {
    try {
      setLoadingType('sql');
      let sql = `-- ==========================================================\n`;
      sql += `-- DUMP DATA JADWAL SHIFT & LEMBUR\n`;
      sql += `-- Periode: ${rangeLabel}\n`;
      sql += `-- Generated: ${new Date().toISOString()}\n`;
      sql += `-- Database: PostgreSQL / Supabase Table: public.shifts\n`;
      sql += `-- ==========================================================\n\n`;

      sql += `CREATE TABLE IF NOT EXISTS public.shifts (\n`;
      sql += `  id TEXT PRIMARY KEY,\n`;
      sql += `  date_key TEXT,\n`;
      sql += `  shift TEXT,\n`;
      sql += `  is_masuk BOOLEAN DEFAULT FALSE,\n`;
      sql += `  jam_masuk TEXT DEFAULT '',\n`;
      sql += `  jam_pulang TEXT DEFAULT '',\n`;
      sql += `  absen_ceisa TEXT DEFAULT '',\n`;
      sql += `  is_hold_dokumen BOOLEAN DEFAULT FALSE,\n`;
      sql += `  is_locked BOOLEAN DEFAULT FALSE,\n`;
      sql += `  is_manual_holiday BOOLEAN DEFAULT FALSE,\n`;
      sql += `  is_surat_tugas_tambahan BOOLEAN DEFAULT FALSE,\n`;
      sql += `  is_gunakan_off_geser BOOLEAN DEFAULT FALSE,\n`;
      sql += `  referensi_tgl_off TEXT DEFAULT '',\n`;
      sql += `  is_gunakan_cp BOOLEAN DEFAULT FALSE,\n`;
      sql += `  referensi_tgl_cp TEXT DEFAULT '',\n`;
      sql += `  note TEXT DEFAULT '',\n`;
      sql += `  tipe_masuk_libur TEXT DEFAULT 'piket',\n`;
      sql += `  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())\n`;
      sql += `);\n\n`;

      filteredEntries.forEach((item) => {
        const dateKey = item.dateKey;
        const data = item.data;
        const safeNote = (data.note || '').replace(/'/g, "''");
        const safeRefOff = (data.referensiTglOff || '').replace(/'/g, "''");
        const safeRefCp = (data.referensiTglCP || '').replace(/'/g, "''");

        sql += `INSERT INTO public.shifts (id, date_key, shift, is_masuk, jam_masuk, jam_pulang, absen_ceisa, is_hold_dokumen, is_locked, is_manual_holiday, is_surat_tugas_tambahan, is_gunakan_off_geser, referensi_tgl_off, is_gunakan_cp, referensi_tgl_cp, note, tipe_masuk_libur, updated_at)\n`;
        sql += `VALUES ('${dateKey}', '${dateKey}', '${data.shift || 'G'}', ${Boolean(data.isMasuk)}, '${data.jamMasuk || ''}', '${data.jamPulang || ''}', '${data.absenCeisa || ''}', ${Boolean(data.isHoldDokumen)}, ${Boolean(data.isLocked)}, ${Boolean(data.isManualHoliday)}, ${Boolean(data.isSuratTugasTambahan)}, ${Boolean(data.isGunakanOffGeser)}, '${safeRefOff}', ${Boolean(data.isGunakanCP)}, '${safeRefCp}', '${safeNote}', '${data.tipeMasukLibur || 'piket'}', NOW())\n`;
        sql += `ON CONFLICT (id) DO UPDATE SET\n`;
        sql += `  shift = EXCLUDED.shift,\n`;
        sql += `  is_masuk = EXCLUDED.is_masuk,\n`;
        sql += `  jam_masuk = EXCLUDED.jam_masuk,\n`;
        sql += `  jam_pulang = EXCLUDED.jam_pulang,\n`;
        sql += `  absen_ceisa = EXCLUDED.absen_ceisa,\n`;
        sql += `  is_hold_dokumen = EXCLUDED.is_hold_dokumen,\n`;
        sql += `  is_locked = EXCLUDED.is_locked,\n`;
        sql += `  is_manual_holiday = EXCLUDED.is_manual_holiday,\n`;
        sql += `  is_surat_tugas_tambahan = EXCLUDED.is_surat_tugas_tambahan,\n`;
        sql += `  is_gunakan_off_geser = EXCLUDED.is_gunakan_off_geser,\n`;
        sql += `  referensi_tgl_off = EXCLUDED.referensi_tgl_off,\n`;
        sql += `  is_gunakan_cp = EXCLUDED.is_gunakan_cp,\n`;
        sql += `  referensi_tgl_cp = EXCLUDED.referensi_tgl_cp,\n`;
        sql += `  note = EXCLUDED.note,\n`;
        sql += `  tipe_masuk_libur = EXCLUDED.tipe_masuk_libur,\n`;
        sql += `  updated_at = NOW();\n\n`;
      });

      const blob = new Blob([sql], { type: 'application/sql' });
      const res = await saveFileWithDialog({
        blob,
        filename: `Dump_Jadwal_Shift_${filenameSuffix}.sql`,
        description: 'PostgreSQL SQL Dump',
        mimeType: 'text/plain',
        extension: 'sql',
      });

      if (res.success) {
        setSuccessType('sql');
        setTimeout(() => setSuccessType(null), 2500);
      }
    } catch (e) {
      console.error('Export SQL failed:', e);
    } finally {
      setLoadingType(null);
    }
  };

  const exportOptions = [
    {
      id: 'xlsx',
      title: 'Microsoft Excel (.xlsx)',
      desc: 'Tabel lengkap dengan jam kerja, durasi lembur, dan status',
      icon: FileSpreadsheet,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      action: handleExportExcel,
    },
    {
      id: 'pdf',
      title: 'Dokumen PDF (.pdf)',
      desc: 'Laporan resmi siap cetak format A4 Landscape multi-halaman',
      icon: FileText,
      color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
      action: handleExportPDF,
    },
    {
      id: 'sql',
      title: 'SQL Dump (.sql)',
      desc: 'Kueri CREATE & UPSERT tabel shifts untuk PostgreSQL/Supabase',
      icon: Database,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
      action: handleExportSQL,
    },
    {
      id: 'png',
      title: 'Screenshot Kalender (.png)',
      desc: 'Tangkapan layar kalender visual bulan aktif',
      icon: Image,
      color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
      action: handleExportPNG,
    },
    {
      id: 'json',
      title: 'JSON Raw Backup (.json)',
      desc: 'Cadangan data terstruktur mentah untuk migrasi & restore',
      icon: FileCode,
      color: 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200',
      action: handleExportJSON,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-4 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#297373] text-white shadow-xs">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">Ekspor Data Jadwal</h2>
              <p className="text-xs text-slate-500 font-medium">
                Pilih rentang tanggal dan format file untuk diunduh
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 1. SELEKSI RENTANG EKSPOR */}
        <div className="my-4 rounded-2xl bg-slate-50 p-3.5 sm:p-4 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <CalendarRange className="h-4 w-4 text-[#297373]" />
              Pilihan Rentang Data Ekspor:
            </label>
            <span className="text-[11px] font-bold text-[#297373] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              {filteredEntries.length} Hari Terpilih
            </span>
          </div>

          {/* Grid Pilihan Rentang */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setRangeType('month_active')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
                rangeType === 'month_active'
                  ? 'bg-[#297373] text-white border-[#297373] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div>Bulan Aktif</div>
              <div className={`text-[10px] ${rangeType === 'month_active' ? 'text-teal-100' : 'text-slate-400'}`}>
                {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRangeType('month_filled')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
                rangeType === 'month_filled'
                  ? 'bg-[#297373] text-white border-[#297373] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div>Bulan Terisi Data</div>
              <div className={`text-[10px] ${rangeType === 'month_filled' ? 'text-teal-100' : 'text-slate-400'}`}>
                {filledMonths.length} Bulan Aktif
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRangeType('quarter')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
                rangeType === 'quarter'
                  ? 'bg-[#297373] text-white border-[#297373] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div>Kuartal (Q1-Q4)</div>
              <div className={`text-[10px] ${rangeType === 'quarter' ? 'text-teal-100' : 'text-slate-400'}`}>
                Q{selectedQuarter} {selectedYear}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRangeType('semester')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
                rangeType === 'semester'
                  ? 'bg-[#297373] text-white border-[#297373] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div>Semester (S1/S2)</div>
              <div className={`text-[10px] ${rangeType === 'semester' ? 'text-teal-100' : 'text-slate-400'}`}>
                Semester {selectedSemester}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRangeType('year')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
                rangeType === 'year'
                  ? 'bg-[#297373] text-white border-[#297373] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div>Satu Tahun Penuh</div>
              <div className={`text-[10px] ${rangeType === 'year' ? 'text-teal-100' : 'text-slate-400'}`}>
                Tahun {selectedYear}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRangeType('custom')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
                rangeType === 'custom'
                  ? 'bg-[#297373] text-white border-[#297373] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div>Rentang Tanggal</div>
              <div className={`text-[10px] ${rangeType === 'custom' ? 'text-teal-100' : 'text-slate-400'}`}>
                Pilih Tgl Bebas
              </div>
            </button>
          </div>

          {/* Sub-controls based on Range Type */}
          {rangeType === 'quarter' && (
            <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Pilih Kuartal:</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setSelectedQuarter(q)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      selectedQuarter === q
                        ? 'bg-[#297373] text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Q{q} {q === 1 ? '(Jan-Mar)' : q === 2 ? '(Apr-Jun)' : q === 3 ? '(Jul-Sep)' : '(Okt-Des)'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {rangeType === 'semester' && (
            <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Pilih Semester:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedSemester(1)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    selectedSemester === 1
                      ? 'bg-[#297373] text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Semester 1 (Januari - Juni)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSemester(2)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    selectedSemester === 2
                      ? 'bg-[#297373] text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Semester 2 (Juli - Desember)
                </button>
              </div>
            </div>
          )}

          {rangeType === 'custom' && (
            <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Dari Tanggal:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#297373]/30"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Sampai Tanggal:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#297373]/30"
                />
              </div>
            </div>
          )}

          <div className="text-[11px] text-slate-600 font-medium pt-1 border-t border-slate-200/60 flex items-center justify-between">
            <span>
              Target Ekspor: <strong className="text-slate-900">{rangeLabel}</strong>
            </span>
          </div>
        </div>

        {/* 2. DAFTAR FORMAT EKSPOR */}
        <div className="space-y-2">
          {exportOptions.map((opt) => {
            const Icon = opt.icon;
            const isLoading = loadingType === opt.id;
            const isSuccess = successType === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={opt.action}
                disabled={loadingType !== null}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${opt.color} disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-white/90 shadow-2xs">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black">{opt.title}</h4>
                    <p className="text-[11px] opacity-80 line-clamp-1">{opt.desc}</p>
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-700" />
                  ) : isSuccess ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-white/90 px-2 py-1 rounded-md shadow-2xs">
                      <Check className="h-3.5 w-3.5" />
                      Tersimpan
                    </span>
                  ) : (
                    <Download className="h-4 w-4 opacity-60" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
