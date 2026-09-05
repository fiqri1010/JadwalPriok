import React, { useState, useRef, useEffect } from 'react';
import { Flag, X, Check, Calendar, Plus, Trash2, Sparkles, Upload, FileText, AlertCircle, RefreshCw, Cloud } from 'lucide-react';
import { getIndonesianHoliday } from '../data/holidays';
import { AppTheme, LiburNasional } from '../types';

interface HolidayManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: number;
  selectedYear: number;
  monthName: string;
  daftarLibur: LiburNasional[];
  onAddLibur: (tanggal: string, keterangan: string) => Promise<boolean>;
  onDeleteLibur: (tanggal: string) => Promise<boolean>;
  onRefreshLibur?: () => Promise<void>;
  isCloudConnected?: boolean;
  theme?: AppTheme;
}

export const HolidayManagerModal: React.FC<HolidayManagerModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  selectedYear,
  monthName,
  daftarLibur,
  onAddLibur,
  onDeleteLibur,
  onRefreshLibur,
  isCloudConnected = false,
  theme = 'default',
}) => {
  const [customDate, setCustomDate] = useState<string>(() => {
    const mStr = String(selectedMonth).padStart(2, '0');
    return `${selectedYear}-${mStr}-01`;
  });
  const [customName, setCustomName] = useState<string>('');
  const [isCsvPanelOpen, setIsCsvPanelOpen] = useState<boolean>(false);
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [importStatusMessage, setImportStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const isDark = theme === 'dark';
  const isVista = theme === 'vista';
  const isWinamp = theme === 'winamp';
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const mStr = String(selectedMonth).padStart(2, '0');
    setCustomDate(`${selectedYear}-${mStr}-01`);
  }, [selectedMonth, selectedYear]);

  if (!isOpen) return null;

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  // List of all holidays in the current month, combining official Indonesian holidays & active daftarLibur
  const monthItems: {
    day: number;
    tanggalIso: string;
    keterangan: string;
    isSavedInCloud: boolean;
    isOfficial: boolean;
  }[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const paddedM = String(selectedMonth).padStart(2, '0');
    const paddedD = String(d).padStart(2, '0');
    const tanggalIso = `${selectedYear}-${paddedM}-${paddedD}`;
    const unpadded = `${selectedYear}-${selectedMonth}-${d}`;

    const savedLibur = daftarLibur.find((item) => item.tanggal === tanggalIso || item.tanggal === unpadded);
    const officialHoliday = getIndonesianHoliday(selectedYear, selectedMonth, d);

    if (savedLibur || officialHoliday) {
      monthItems.push({
        day: d,
        tanggalIso,
        keterangan: savedLibur?.keterangan || officialHoliday || 'Hari Libur Nasional',
        isSavedInCloud: Boolean(savedLibur),
        isOfficial: Boolean(officialHoliday),
      });
    }
  }

  // Auto-Terapkan semua libur resmi ke daftarLibur
  const handleApplyAllOfficial = async () => {
    setIsProcessing(true);
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const officialHoliday = getIndonesianHoliday(selectedYear, selectedMonth, d);
      if (officialHoliday) {
        const paddedM = String(selectedMonth).padStart(2, '0');
        const paddedD = String(d).padStart(2, '0');
        const tanggalIso = `${selectedYear}-${paddedM}-${paddedD}`;
        const alreadyExists = daftarLibur.some((item) => item.tanggal === tanggalIso);
        if (!alreadyExists) {
          const success = await onAddLibur(tanggalIso, officialHoliday);
          if (success) count++;
        }
      }
    }
    setIsProcessing(false);
    setImportStatusMessage({
      text: count > 0
        ? `Berhasil menerapkan & menyimpan ${count} hari libur resmi untuk bulan ${monthName} ${selectedYear}.`
        : `Semua libur resmi bulan ${monthName} sudah tersimpan sebelumnya.`,
    });
    setTimeout(() => setImportStatusMessage(null), 4000);
  };

  // Tambah Libur Tunggal
  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDate) return;

    setIsProcessing(true);
    const ket = customName.trim() || 'Hari Libur Nasional';
    const success = await onAddLibur(customDate, ket);
    setIsProcessing(false);

    if (success) {
      setImportStatusMessage({ text: `Libur "${ket}" pada ${customDate} berhasil ditambahkan!` });
      setCustomName('');
    } else {
      setImportStatusMessage({ text: `Gagal menambahkan libur ke Supabase. Periksa koneksi atau izin RLS.`, isError: true });
    }
    setTimeout(() => setImportStatusMessage(null), 4000);
  };

  // Hapus Libur
  const handleDeleteHoliday = async (tanggal: string, keterangan: string) => {
    setIsProcessing(true);
    const success = await onDeleteLibur(tanggal);
    setIsProcessing(false);
    if (success) {
      setImportStatusMessage({ text: `Libur "${keterangan}" (${tanggal}) berhasil dihapus.` });
    } else {
      setImportStatusMessage({ text: `Gagal menghapus libur dari Supabase.`, isError: true });
    }
    setTimeout(() => setImportStatusMessage(null), 3000);
  };

  // Toggle/Add official holiday to daftarLibur
  const handleToggleOfficial = async (tanggal: string, keterangan: string) => {
    setIsProcessing(true);
    const success = await onAddLibur(tanggal, keterangan);
    setIsProcessing(false);
    if (success) {
      setImportStatusMessage({ text: `Libur resmi "${keterangan}" (${tanggal}) berhasil diaktifkan.` });
    }
    setTimeout(() => setImportStatusMessage(null), 3000);
  };

  // Hapus semua libur bulan ini dari daftarLibur
  const handleClearMonthHolidays = async () => {
    const toDelete = monthItems.filter((m) => m.isSavedInCloud);
    if (toDelete.length === 0) return;

    setIsProcessing(true);
    let deletedCount = 0;
    for (const item of toDelete) {
      const success = await onDeleteLibur(item.tanggalIso);
      if (success) deletedCount++;
    }
    setIsProcessing(false);
    setImportStatusMessage({ text: `${deletedCount} hari libur di bulan ${monthName} telah dihapus.` });
    setTimeout(() => setImportStatusMessage(null), 3500);
  };

  // Parse CSV
  const parseAndApplyCsvData = async (text: string) => {
    if (!text || !text.trim()) {
      setImportStatusMessage({ text: 'Teks CSV kosong. Silakan pilih file atau tempel teks CSV.', isError: true });
      return;
    }

    const lines = text.replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean);
    let parsedCount = 0;
    setIsProcessing(true);

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('tanggal') || lower.includes('yyyy') || (lower.includes('date') && lower.includes('holiday'))) {
        continue;
      }

      let rawDate = '';
      let keterangan = '';

      const firstComma = line.indexOf(',');
      const firstTab = line.indexOf('\t');
      const firstSemicolon = line.indexOf(';');

      let delimiterIdx = -1;
      if (firstComma !== -1 && (firstTab === -1 || firstComma < firstTab) && (firstSemicolon === -1 || firstComma < firstSemicolon)) {
        delimiterIdx = firstComma;
      } else if (firstTab !== -1 && (firstSemicolon === -1 || firstTab < firstSemicolon)) {
        delimiterIdx = firstTab;
      } else if (firstSemicolon !== -1) {
        delimiterIdx = firstSemicolon;
      }

      if (delimiterIdx !== -1) {
        rawDate = line.substring(0, delimiterIdx).replace(/^["']|["']$/g, '').trim();
        keterangan = line.substring(delimiterIdx + 1).replace(/^["']|["']$/g, '').trim();
      } else {
        const parts = line.split(/\s{2,}/);
        if (parts.length >= 2) {
          rawDate = parts[0].trim();
          keterangan = parts.slice(1).join(' ').trim();
        } else {
          rawDate = line;
          keterangan = 'Hari Libur Nasional';
        }
      }

      const dateMatch = rawDate.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
      if (dateMatch) {
        const y = parseInt(dateMatch[1], 10);
        const m = String(parseInt(dateMatch[2], 10)).padStart(2, '0');
        const d = String(parseInt(dateMatch[3], 10)).padStart(2, '0');
        const tanggalIso = `${y}-${m}-${d}`;
        const holidayDesc = keterangan || 'Hari Libur Nasional';

        const success = await onAddLibur(tanggalIso, holidayDesc);
        if (success) parsedCount++;
      }
    }

    setIsProcessing(false);

    if (parsedCount > 0) {
      setImportStatusMessage({ text: `Berhasil mengimpor & menyimpan ${parsedCount} hari libur nasional dari CSV!` });
      setCsvRawText('');
      setTimeout(() => setImportStatusMessage(null), 4500);
    } else {
      setImportStatusMessage({
        text: 'Format CSV tidak dikenali. Pastikan format baris adalah YYYY-MM-DD,Keterangan (contoh: 2026-01-01,Tahun Baru Masehi).',
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
    reader.onerror = () => {
      setImportStatusMessage({ text: 'Gagal membaca file CSV yang dipilih.', isError: true });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Theme-aware style tokens
  const modalContainerClass = isDark
    ? 'relative w-full max-w-lg rounded-3xl bg-[#1A1A1A] p-6 shadow-2xl border border-white/10 ring-1 ring-white/10 text-slate-200 max-h-[90vh] overflow-y-auto'
    : isVista
    ? 'relative w-full max-w-lg rounded-3xl bg-white/85 backdrop-blur-xl p-6 shadow-2xl border border-white/50 text-slate-800 max-h-[90vh] overflow-y-auto'
    : isWinamp
    ? 'relative w-full max-w-lg rounded-none bg-[#191919] p-6 border-2 border-[#BE1A1A] font-mono text-slate-200 max-h-[90vh] overflow-y-auto shadow-[3px_3px_0_#BE1A1A]'
    : 'relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto';

  const headerDividerClass = isDark
    ? 'border-b border-white/10'
    : isVista
    ? 'border-b border-white/40'
    : isWinamp
    ? 'border-b border-zinc-700'
    : 'border-b border-slate-100';

  const headerTitleClass = isDark
    ? 'text-lg font-black text-white'
    : isVista
    ? 'text-lg font-black text-slate-900 drop-shadow-xs'
    : isWinamp
    ? 'text-lg font-black text-[#00FF00] tracking-wide uppercase font-mono'
    : 'text-lg font-black text-slate-900';

  const headerSubtextClass = isDark
    ? 'text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5'
    : isVista
    ? 'text-xs text-slate-700 font-medium flex items-center gap-1 mt-0.5'
    : isWinamp
    ? 'text-xs text-[#00FF00]/80 font-mono flex items-center gap-1 mt-0.5'
    : 'text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5';

  const iconBtnClass = isDark
    ? 'rounded-lg p-1.5 text-slate-400 hover:bg-[#252525] hover:text-white transition-colors cursor-pointer'
    : isVista
    ? 'rounded-lg p-1.5 text-slate-600 hover:bg-white/40 hover:text-slate-900 transition-colors cursor-pointer'
    : isWinamp
    ? 'rounded-none p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-[#00FF00] transition-colors cursor-pointer'
    : 'rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer';

  // Kotak Auto-Terapkan Libur Resmi
  const autoApplyBoxClass = isDark
    ? 'rounded-2xl bg-[#251A1C] p-4 border border-rose-900/60 ring-1 ring-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs'
    : isVista
    ? 'rounded-2xl bg-gradient-to-r from-rose-500/15 to-orange-500/15 backdrop-blur-md p-4 border border-white/40 ring-1 ring-rose-400/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm'
    : isWinamp
    ? 'rounded-none bg-[#1E1315] p-4 border-2 border-[#BE1A1A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono shadow-[inset_1px_1px_0_rgba(255,255,255,0.15)]'
    : 'rounded-2xl bg-linear-to-r from-rose-50 to-orange-50 p-4 border border-rose-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3';

  const autoApplyTitleClass = isDark
    ? 'text-xs font-black text-rose-200'
    : isVista
    ? 'text-xs font-black text-rose-950 drop-shadow-xs'
    : isWinamp
    ? 'text-xs font-black text-rose-400 tracking-wider uppercase font-mono'
    : 'text-xs font-black text-rose-950';

  const autoApplySubtextClass = isDark
    ? 'text-[11px] text-rose-300/80'
    : isVista
    ? 'text-[11px] text-rose-900'
    : isWinamp
    ? 'text-[11px] text-slate-300 font-mono'
    : 'text-[11px] text-rose-800';

  const autoApplyBtnClass = isDark
    ? 'flex items-center space-x-1.5 rounded-xl bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white px-3 py-2 text-xs font-bold ring-1 ring-white/20 shadow-xs transition-colors cursor-pointer'
    : isVista
    ? 'flex items-center space-x-1.5 rounded-xl bg-gradient-to-b from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 disabled:opacity-50 text-white px-3 py-2 text-xs font-bold border border-white/30 shadow-xs transition-colors cursor-pointer'
    : isWinamp
    ? 'flex items-center space-x-1.5 rounded-none bg-[#BE1A1A] hover:bg-red-700 disabled:opacity-50 text-white px-3 py-2 text-xs font-bold border border-white/30 uppercase font-mono shadow-[1px_1px_0_#ffffff] transition-colors cursor-pointer'
    : 'flex items-center space-x-1.5 rounded-xl bg-[#BE1A1A] hover:bg-red-800 disabled:opacity-50 text-white px-3 py-2 text-xs font-bold shadow-xs transition-colors cursor-pointer';

  const csvBtnClass = isDark
    ? `flex items-center space-x-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer shadow-xs border ring-1 ring-white/10 ${
        isCsvPanelOpen
          ? 'bg-indigo-700 text-white border-indigo-500'
          : 'bg-[#282828] text-indigo-300 border-indigo-800/60 hover:bg-[#333333]'
      }`
    : isVista
    ? `flex items-center space-x-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer shadow-xs border ${
        isCsvPanelOpen
          ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white border-white/30'
          : 'bg-white/80 backdrop-blur-xs text-indigo-800 border-indigo-200 hover:bg-white'
      }`
    : isWinamp
    ? `flex items-center space-x-1.5 rounded-none px-3 py-2 text-xs font-bold transition-all cursor-pointer border uppercase font-mono ${
        isCsvPanelOpen
          ? 'bg-indigo-900 text-white border-indigo-400'
          : 'bg-[#242424] text-[#00FF00] border border-[#00FF00]/60 hover:bg-[#303030]'
      }`
    : `flex items-center space-x-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer shadow-xs border ${
        isCsvPanelOpen
          ? 'bg-indigo-600 text-white border-indigo-700'
          : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
      }`;

  const csvPanelBoxClass = isDark
    ? 'p-4 rounded-2xl bg-[#1F222E] border border-indigo-900/60 ring-1 ring-white/10 space-y-3 animate-in fade-in duration-200'
    : isVista
    ? 'p-4 rounded-2xl bg-indigo-500/15 backdrop-blur-md border border-white/40 ring-1 ring-indigo-400/20 space-y-3 animate-in fade-in duration-200'
    : isWinamp
    ? 'p-4 rounded-none bg-[#131627] border-2 border-indigo-500 font-mono space-y-3 animate-in fade-in duration-200'
    : 'p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3 animate-in fade-in duration-200';

  const listContainerClass = isDark
    ? 'divide-y divide-white/10 rounded-2xl border border-white/10 overflow-hidden bg-[#161616]'
    : isVista
    ? 'divide-y divide-white/30 rounded-2xl border border-white/40 overflow-hidden bg-white/40 backdrop-blur-xs'
    : isWinamp
    ? 'divide-y divide-zinc-700 rounded-none border-2 border-zinc-700 overflow-hidden bg-[#141414] font-mono'
    : 'divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/50';

  const listItemHoverClass = isDark
    ? 'hover:bg-[#222222]'
    : isVista
    ? 'hover:bg-white/60'
    : isWinamp
    ? 'hover:bg-[#202020]'
    : 'hover:bg-white';

  const formContainerClass = isDark
    ? 'mt-5 rounded-2xl bg-[#222222] p-3.5 border border-white/10 ring-1 ring-white/10 space-y-2.5'
    : isVista
    ? 'mt-5 rounded-2xl bg-white/60 backdrop-blur-xs p-3.5 border border-white/40 space-y-2.5'
    : isWinamp
    ? 'mt-5 rounded-none bg-[#1C1C1C] p-3.5 border-2 border-zinc-700 font-mono space-y-2.5'
    : 'mt-5 rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-2.5';

  const inputClass = isDark
    ? 'w-full rounded-xl border border-white/20 bg-[#161616] px-3 py-1.5 text-xs text-white outline-none focus:border-rose-500'
    : isVista
    ? 'w-full rounded-xl border border-white/50 bg-white/80 px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-rose-500'
    : isWinamp
    ? 'w-full rounded-none border border-zinc-600 bg-black px-3 py-1.5 text-xs text-[#00FF00] font-mono outline-none focus:border-[#00FF00]'
    : 'w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-[#BE1A1A]';

  const footerCloseBtnClass = isDark
    ? 'rounded-xl bg-[#2A2A2A] hover:bg-[#383838] border border-white/20 px-5 py-2 text-xs font-bold text-white transition-colors cursor-pointer ring-1 ring-white/10'
    : isVista
    ? 'rounded-xl bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 border border-white/30 px-5 py-2 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs'
    : isWinamp
    ? 'rounded-none bg-[#242424] hover:bg-[#343434] border border-[#00FF00] px-5 py-2 text-xs font-bold text-[#00FF00] uppercase font-mono cursor-pointer shadow-[1px_1px_0_#00FF00]'
    : 'rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2 text-xs font-bold text-white transition-colors cursor-pointer';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className={modalContainerClass}>
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 ${headerDividerClass}`}>
          <div className="flex items-center space-x-3">
            <div className={`flex h-10 w-10 items-center justify-center ${isWinamp ? 'rounded-none' : 'rounded-2xl'} bg-[#BE1A1A] text-white shadow-md border border-white/30`}>
              <Flag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className={headerTitleClass}>Kelola Hari Libur Nasional</h2>
                {isCloudConnected ? (
                  <span className={`inline-flex items-center gap-1 ${isWinamp ? 'rounded-none' : 'rounded-full'} bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 border border-emerald-300`}>
                    <Cloud className="h-2.5 w-2.5" /> Supabase
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1 ${isWinamp ? 'rounded-none' : 'rounded-full'} bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 border border-slate-200`}>
                    Mode Lokal
                  </span>
                )}
              </div>
              <p className={headerSubtextClass}>
                <Calendar className="h-3.5 w-3.5 text-[#BE1A1A]" />
                Bulan: {monthName} {selectedYear}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {onRefreshLibur && isCloudConnected && (
              <button
                type="button"
                onClick={() => onRefreshLibur()}
                title="Tarik ulang data libur dari Supabase"
                className={iconBtnClass}
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={iconBtnClass}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Apply Preset Banner & Impor CSV Button */}
        <div className="my-4 space-y-2">
          <div className={autoApplyBoxClass}>
            <div className="flex items-center space-x-2.5">
              <Sparkles className="h-5 w-5 text-[#BE1A1A] shrink-0" />
              <div>
                <h4 className={autoApplyTitleClass}>Auto-Terapkan Libur Resmi</h4>
                <p className={autoApplySubtextClass}>
                  Simpan langsung hari libur resmi RI bulan ini ke database Supabase.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleApplyAllOfficial}
                className={autoApplyBtnClass}
              >
                <Check className="h-3.5 w-3.5" />
                <span>Terapkan Resmi</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCsvPanelOpen(!isCsvPanelOpen)}
                className={csvBtnClass}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Impor CSV</span>
              </button>
            </div>
          </div>

          {/* Feedback message banner */}
          {importStatusMessage && (
            <div className={`p-3 ${isWinamp ? 'rounded-none' : 'rounded-xl'} text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150 ${
              importStatusMessage.isError
                ? 'bg-rose-50 border border-rose-200 text-rose-800'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
            }`}>
              {importStatusMessage.isError ? (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              ) : (
                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              )}
              <span>{importStatusMessage.text}</span>
            </div>
          )}

          {/* Expandable CSV Import Area */}
          {isCsvPanelOpen && (
            <div className={csvPanelBoxClass}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black flex items-center gap-1.5 ${isDark ? 'text-indigo-300' : isWinamp ? 'text-[#00FF00]' : 'text-indigo-950'}`}>
                  <FileText className="h-4 w-4 text-indigo-500" />
                  Impor Daftar Libur dari File CSV
                </span>
                <span className={`text-[10px] font-bold ${isWinamp ? 'rounded-none bg-zinc-800 text-[#00FF00]' : 'rounded-md bg-indigo-100 text-indigo-700'} px-2 py-0.5`}>
                  Format: 2 Kolom
                </span>
              </div>

              <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : isWinamp ? 'text-slate-300' : 'text-slate-600'}`}>
                Unggah file <code className="font-mono font-bold px-1 rounded border border-indigo-200/50 bg-black/20">.csv</code> atau tempel baris data dengan format 2 kolom:
                <br />
                <span className={`font-mono font-bold ${isDark ? 'text-indigo-300' : isWinamp ? 'text-[#00FF00]' : 'text-indigo-900'}`}>YYYY-MM-DD,Keterangan Hari Libur</span>
              </p>

              {/* Upload file button + hidden input */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,text/csv,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center space-x-1.5 ${isWinamp ? 'rounded-none' : 'rounded-xl'} bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-colors cursor-pointer`}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Pilih File CSV (.csv)</span>
                </button>
              </div>

              {/* Multiline textarea for paste */}
              <div className="space-y-1.5">
                <label className={`text-[11px] font-bold flex items-center justify-between ${isDark ? 'text-indigo-200' : isWinamp ? 'text-[#00FF00]' : 'text-indigo-950'}`}>
                  <span>Atau Tempel Teks CSV:</span>
                  <span className={`text-[10px] font-normal ${isDark ? 'text-indigo-400' : isWinamp ? 'text-slate-400' : 'text-indigo-600'}`}>Contoh: 2026-01-01,Tahun Baru Masehi</span>
                </label>
                <textarea
                  rows={3}
                  value={csvRawText}
                  onChange={(e) => setCsvRawText(e.target.value)}
                  placeholder={`2026-01-01,Tahun Baru Masehi\n2026-05-01,Hari Buruh Internasional\n2026-08-17,Hari Kemerdekaan Republik Indonesia`}
                  className={`w-full ${isWinamp ? 'rounded-none bg-black border-zinc-700 text-[#00FF00]' : isDark ? 'rounded-xl bg-[#121212] border-white/20 text-slate-100' : 'rounded-xl border border-indigo-200 bg-white text-slate-800'} p-2.5 text-xs font-mono placeholder:text-slate-500 outline-none focus:border-indigo-500`}
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => parseAndApplyCsvData(csvRawText)}
                    className={`${isWinamp ? 'rounded-none bg-[#292929] hover:bg-[#393939] text-[#00FF00] border border-[#00FF00]' : 'rounded-xl bg-slate-900 hover:bg-slate-800 text-white'} disabled:opacity-50 px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer`}
                  >
                    Proses & Simpan ke Database
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* List Libur di Bulan Ini */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : isWinamp ? 'text-[#00FF00]' : 'text-slate-500'}`}>
              Daftar Libur Bulan Ini ({monthItems.length})
            </h3>
            {monthItems.some((h) => h.isSavedInCloud) && (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleClearMonthHolidays}
                className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-3 w-3" />
                Hapus Semua Libur Bulan Ini
              </button>
            )}
          </div>

          {monthItems.length === 0 ? (
            <div className={`rounded-2xl border border-dashed ${isDark ? 'border-white/10 text-slate-500' : isWinamp ? 'rounded-none border-zinc-700 text-zinc-500' : 'border-slate-200 text-slate-400'} p-6 text-center text-xs`}>
              Tidak ada hari libur nasional bawaan pada bulan {monthName} {selectedYear}. Anda dapat menambahkan tanggal merah kustom melalui formulir di bawah.
            </div>
          ) : (
            <div className={listContainerClass}>
              {monthItems.map((item) => (
                <div
                  key={item.tanggalIso}
                  className={`flex items-center justify-between p-3 transition-colors ${listItemHoverClass}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`flex h-8 w-8 items-center justify-center ${isWinamp ? 'rounded-none bg-zinc-800' : 'rounded-xl bg-rose-100/80'} font-black text-[#BE1A1A] text-sm border border-white/20`}>
                      {item.day}
                    </span>
                    <div>
                      <p className={`text-xs font-extrabold ${isDark ? 'text-white' : isWinamp ? 'text-[#00FF00]' : 'text-slate-900'}`}>{item.keterangan}</p>
                      <p className={`text-[10px] ${isDark || isWinamp ? 'text-slate-400' : 'text-slate-400'}`}>
                        {item.tanggalIso} ({item.day} {monthName} {selectedYear})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {item.isSavedInCloud ? (
                      <span className={`flex items-center space-x-1 ${isWinamp ? 'rounded-none' : 'rounded-xl'} bg-[#BE1A1A] text-white px-2.5 py-1 text-[11px] font-black shadow-2xs border border-white/20`}>
                        <Flag className="h-3 w-3 fill-white" />
                        <span>Libur Aktif</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleToggleOfficial(item.tanggalIso, item.keterangan)}
                        className={`flex items-center space-x-1 ${isWinamp ? 'rounded-none bg-zinc-800 text-zinc-300 hover:text-[#00FF00]' : 'rounded-xl bg-slate-200 text-slate-700 hover:bg-rose-100 hover:text-[#BE1A1A]'} px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer`}
                      >
                        <Plus className="h-3 w-3" />
                        <span>Terapkan</span>
                      </button>
                    )}

                    {item.isSavedInCloud && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleDeleteHoliday(item.tanggalIso, item.keterangan)}
                        className={`rounded-xl p-1.5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors cursor-pointer`}
                        title="Hapus Libur Ini dari Database"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Tambah Libur Kustom */}
        <form onSubmit={handleAddCustom} className={formContainerClass}>
          <div className={`flex items-center space-x-2 text-xs font-bold ${isDark ? 'text-slate-200' : isWinamp ? 'text-[#00FF00]' : 'text-slate-700'}`}>
            <Plus className="h-4 w-4 text-[#BE1A1A]" />
            <span>Tambah Tanggal Merah / Libur Baru</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="w-full sm:w-44">
              <label className={`text-[10px] font-bold block mb-1 ${isDark ? 'text-slate-400' : isWinamp ? 'text-slate-400' : 'text-slate-500'}`}>Pilih Tanggal (Kalender)</label>
              <input
                type="date"
                required
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex-1">
              <label className={`text-[10px] font-bold block mb-1 ${isDark ? 'text-slate-400' : isWinamp ? 'text-slate-400' : 'text-slate-500'}`}>Keterangan Libur</label>
              <input
                type="text"
                required
                placeholder="Contoh: Libur Nasional / Cuti Bersama"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full sm:w-auto ${isWinamp ? 'rounded-none' : 'rounded-xl'} bg-[#BE1A1A] hover:bg-red-800 disabled:opacity-50 text-white px-4 py-1.5 text-xs font-bold transition-colors shrink-0 cursor-pointer h-[34px] flex items-center justify-center gap-1 border border-white/20`}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah</span>
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className={`mt-5 pt-3 ${headerDividerClass} flex justify-end`}>
          <button
            type="button"
            onClick={onClose}
            className={footerCloseBtnClass}
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
