import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ClipboardPaste, X, Check, AlertCircle, Sparkles, HelpCircle, FileSpreadsheet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SHIFT_OPTIONS, ShiftType, SHIFT_COLORS, DayData, EXCEL_SHIFT_MAPPING, AppTheme } from '../types';
import { ExcelSpreadsheet, MatchedDayShift } from './ExcelSpreadsheet';

export type PasteTab = 'excel_grid' | 'schedule' | 'absen';

interface PasteExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedYear: number;
  selectedMonth: number;
  onApply: (updates: Record<string, Partial<DayData>>) => void;
  initialText?: string;
  theme?: AppTheme;
}

interface ParsedAbsenResult {
  day: number;
  jamMasuk: string | null;
  jamPulang: string | null;
  raw: string;
}

export const PasteExcelModal: React.FC<PasteExcelModalProps> = ({
  isOpen,
  onClose,
  selectedYear,
  selectedMonth,
  onApply,
  initialText = '',
  theme = 'default',
}) => {
  const [activeTab, setActiveTab] = useState<PasteTab>('excel_grid');

  const [spreadsheetShifts, setSpreadsheetShifts] = useState<MatchedDayShift[]>([]);
  const [spreadsheetValidCount, setSpreadsheetValidCount] = useState<number>(0);

  const handleSpreadsheetParsed = useCallback((matched: MatchedDayShift[], count: number) => {
    setSpreadsheetShifts(matched);
    setSpreadsheetValidCount(count);
  }, []);

  const [inputText, setInputText] = useState(initialText);
  const [inputTextAbsen, setInputTextAbsen] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaAbsenRef = useRef<HTMLTextAreaElement>(null);

  const isWinamp = theme === 'winamp';
  const isDarkFluid = theme === 'darkFluid';
  const isDark = theme === 'dark';
  const isVista = theme === 'vista';
  const isDefault = theme === 'default';
  const isPaperSketch = theme === 'paperSketch';

  const isLightMode = isDefault || isVista || isPaperSketch;

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  useEffect(() => {
    if (isOpen) {
      setInputText(initialText);
      setInputTextAbsen('');
      setErrorMsg(null);
      setTimeout(() => {
        if (activeTab === 'schedule') {
          textareaRef.current?.focus();
          textareaRef.current?.select();
        } else if (activeTab === 'absen') {
          textareaAbsenRef.current?.focus();
          textareaAbsenRef.current?.select();
        }
      }, 120);
    }
  }, [isOpen, initialText, activeTab]);

  if (!isOpen) return null;

  // --- PARSER 1: Salin Jadwal (Shift Codes) ---
  const parseShifts = (text: string) => {
    if (!text || !text.trim()) return [];
    const firstLine = text.replace(/\r/g, '').split('\n').find((l) => l.trim().length > 0) || '';
    let rawCells = firstLine.split('\t');
    if (rawCells.length <= 1 && firstLine.includes(',')) {
      rawCells = firstLine.split(',');
    } else if (rawCells.length <= 1 && firstLine.includes(';')) {
      rawCells = firstLine.split(';');
    } else if (rawCells.length <= 1 && firstLine.includes(' ')) {
      rawCells = firstLine.split(/\s+/);
    }

    return rawCells.map((c) => c.trim().toUpperCase());
  };

  const parsedCells = parseShifts(inputText);
  const matchedDaysSchedule: { day: number; shift: ShiftType | null; raw: string }[] = [];
  let validCountSchedule = 0;

  for (let i = 0; i < daysInMonth; i++) {
    const raw = parsedCells[i] || '';
    let matched: ShiftType | null = null;

    if (raw) {
      if (EXCEL_SHIFT_MAPPING[raw]) {
        matched = EXCEL_SHIFT_MAPPING[raw];
      } else {
        const found = SHIFT_OPTIONS.find((opt) => opt.toUpperCase() === raw);
        if (found) matched = found;
      }
    }

    if (matched) {
      validCountSchedule++;
      matchedDaysSchedule.push({ day: i + 1, shift: matched, raw });
    } else {
      matchedDaysSchedule.push({ day: i + 1, shift: null, raw });
    }
  }

  // --- PARSER 2: Salin Absen (Otomatis Deteksi Jam Masuk & Jam Pulang) ---
  const parseAbsenData = (text: string): { matchedDays: ParsedAbsenResult[]; validCount: number } => {
    if (!text || !text.trim()) return { matchedDays: [], validCount: 0 };

    const monthShorts = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'ags', 'sep', 'okt', 'nov', 'des'];
    const monthFulls = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];

    const selectedMonthShort = monthShorts[selectedMonth - 1];
    const selectedMonthFull = monthFulls[selectedMonth - 1];

    const lines = text.split(/\r?\n/);

    const dayMap: Record<number, { jamMasuk: string | null; jamPulang: string | null; raw: string }> = {};
    let isMultilineDirtyFormat = false;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Detect date pattern e.g., "01 Sep 2026", "1 Sep", "01/09"
      const dateMatch = trimmed.match(/\b(\d{1,2})\s+([a-zA-Z]{3,9})(?:\s+(\d{4}))?\b/i);
      let dayNum: number | null = null;

      if (dateMatch) {
        const d = parseInt(dateMatch[1], 10);
        const mStr = dateMatch[2].toLowerCase();
        const y = dateMatch[3] ? parseInt(dateMatch[3], 10) : selectedYear;

        if (d >= 1 && d <= daysInMonth && (mStr.startsWith(selectedMonthShort) || mStr === selectedMonthFull) && y === selectedYear) {
          dayNum = d;
        }
      } else {
        // Numeric date format DD/MM or DD-MM
        const dateNumMatch = trimmed.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);
        if (dateNumMatch) {
          const d = parseInt(dateNumMatch[1], 10);
          const m = parseInt(dateNumMatch[2], 10);
          if (d >= 1 && d <= daysInMonth && m === selectedMonth) {
            dayNum = d;
          }
        }
      }

      if (dayNum !== null) {
        isMultilineDirtyFormat = true;

        // Extract all time matches like "12.46 WIB", "22.31 WIB", "07:57", "18.43"
        const timeMatches = Array.from(trimmed.matchAll(/\b([0-2]?\d)[.:]([0-5]\d)(?:\s*WIB)?\b/gi));
        const validTimes: string[] = [];

        timeMatches.forEach((m) => {
          const h = parseInt(m[1], 10);
          const min = m[2];
          if (h >= 0 && h <= 23) {
            validTimes.push(`${String(h).padStart(2, '0')}:${min}`);
          }
        });

        let jamMasuk: string | null = null;
        let jamPulang: string | null = null;

        if (validTimes.length >= 2) {
          jamMasuk = validTimes[0];
          jamPulang = validTimes[1];
        } else if (validTimes.length === 1) {
          const singleTime = validTimes[0];
          const hour = parseInt(singleTime.split(':')[0], 10);
          if (hour < 12) {
            jamMasuk = singleTime;
          } else {
            jamPulang = singleTime;
          }
        }

        if (jamMasuk || jamPulang) {
          dayMap[dayNum] = {
            jamMasuk,
            jamPulang,
            raw: trimmed,
          };
        }
      }
    });

    // Fallback: Horizontal row mode (e.g. 07:15 \t 07:30 \t ...)
    if (!isMultilineDirtyFormat) {
      const firstLine = lines.find((l) => l.trim().length > 0) || '';
      let rawCells = firstLine.split('\t');
      if (rawCells.length <= 1 && firstLine.includes(',')) {
        rawCells = firstLine.split(',');
      } else if (rawCells.length <= 1 && firstLine.includes(';')) {
        rawCells = firstLine.split(';');
      } else if (rawCells.length <= 1 && firstLine.includes(' ')) {
        rawCells = firstLine.split(/\s+/);
      }

      rawCells.forEach((cell, idx) => {
        const dayNum = idx + 1;
        if (dayNum <= daysInMonth) {
          const clean = cell.trim().replace('.', ':');
          const match = clean.match(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(?:[\s]*WIB)?$/i);
          if (match) {
            const h = match[1].padStart(2, '0');
            const m = match[2];
            const formatted = `${h}:${m}`;
            const hour = parseInt(h, 10);

            dayMap[dayNum] = {
              jamMasuk: hour < 12 ? formatted : null,
              jamPulang: hour >= 12 ? formatted : null,
              raw: cell.trim(),
            };
          }
        }
      });
    }

    const matchedDays: ParsedAbsenResult[] = [];
    let validCount = 0;

    for (let i = 1; i <= daysInMonth; i++) {
      const data = dayMap[i];
      if (data && (data.jamMasuk || data.jamPulang)) {
        validCount++;
        matchedDays.push({
          day: i,
          jamMasuk: data.jamMasuk,
          jamPulang: data.jamPulang,
          raw: data.raw,
        });
      } else {
        matchedDays.push({
          day: i,
          jamMasuk: null,
          jamPulang: null,
          raw: '',
        });
      }
    }

    return { matchedDays, validCount };
  };

  const { matchedDays: matchedDaysAbsen, validCount: validCountAbsen } = parseAbsenData(inputTextAbsen);

  // --- APPLY ACTION ---
  const handleApply = () => {
    if (activeTab === 'excel_grid') {
      if (spreadsheetValidCount === 0) {
        setErrorMsg('Belum ada kode shift yang cocok terdeteksi dari tabel Excel. Silakan tempel data Excel (Ctrl + V) terlebih dahulu.');
        return;
      }

      const updates: Record<string, Partial<DayData>> = {};
      for (const item of spreadsheetShifts) {
        if (item.shift) {
          const key = `${selectedYear}-${selectedMonth}-${item.day}`;
          updates[key] = { shift: item.shift };
        }
      }

      onApply(updates);
      onClose();
    } else if (activeTab === 'schedule') {
      if (validCountSchedule === 0) {
        setErrorMsg('Tidak ada kode shift yang cocok (Graha/G, NPCT/N, TPSL/L, OFF, SM, PM, Malam/M, CUTI/C). Pastikan data yang disalin berisi kode shift.');
        return;
      }

      const updates: Record<string, Partial<DayData>> = {};
      for (const item of matchedDaysSchedule) {
        if (item.shift) {
          const key = `${selectedYear}-${selectedMonth}-${item.day}`;
          updates[key] = { shift: item.shift };
        }
      }

      onApply(updates);
      onClose();
    } else {
      if (validCountAbsen === 0) {
        setErrorMsg('Tidak ada format jam/laporan absen yang valid ditemukan. Pastikan data memuat tanggal bulan ini dan jam (contoh: 01 Sep 2026 ... 07.57 WIB 18.43 WIB).');
        return;
      }

      const updates: Record<string, Partial<DayData>> = {};
      for (const item of matchedDaysAbsen) {
        if (item.jamMasuk || item.jamPulang) {
          const key = `${selectedYear}-${selectedMonth}-${item.day}`;
          const partial: Partial<DayData> = {};
          if (item.jamMasuk) partial.jamMasuk = item.jamMasuk;
          if (item.jamPulang) partial.jamPulang = item.jamPulang;
          updates[key] = partial;
        }
      }

      onApply(updates);
      onClose();
    }
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  // Theme styling configurations matching theme palettes & card structure
  const getGlowCardStyle = () => {
    if (isPaperSketch) {
      return {
        outerBg: '#ffffff',
        outerRadius: '16px',
        outerShadow: '8px 8px 0px #2b2b2b',
        innerBg: '#ffffff',
        innerRadius: '14px',
        headingColor: '#2b2b2b',
        subtextColor: '#555555',
        fieldBg: '#f2efeb',
        fieldBorder: '2px solid #2b2b2b',
        fieldShadow: 'inset 2px 2px 0px rgba(43,43,43,0.1)',
        accentColor: '#ff4747',
        textColor: '#2b2b2b',
        btnCancelBg: '#ffffff',
        btnCancelBorder: '2px solid #2b2b2b',
        btnCancelText: '#2b2b2b',
        btnApplyBg: '#ff4747',
        btnApplyText: '#ffffff',
        previewBorder: 'border-2 border-[#2b2b2b]',
        tabContainerBg: '#f2efeb',
        tabContainerBorder: '2px solid #2b2b2b',
        tabIndicatorBg: '#ff4747',
        tabIndicatorRadius: '6px',
        tabIndicatorBorder: '1.5px solid #2b2b2b',
        tabIndicatorShadow: '1px 1px 0px #2b2b2b',
        tabTextActive: '#ffffff',
        tabTextInactive: '#2b2b2b',
      };
    }
    if (isWinamp) {
      return {
        outerBg: 'linear-gradient(163deg, #00FF00 0%, #008800 100%)',
        outerRadius: '0px',
        outerShadow: '0px 0px 25px 2px rgba(0, 255, 0, 0.45)',
        innerBg: '#0e0e0e',
        innerRadius: '0px',
        headingColor: '#00FF00',
        subtextColor: '#00FF00',
        fieldBg: '#050505',
        fieldBorder: '1px solid #222222',
        fieldShadow: 'inset 3px 3px 6px #000000, inset -1px -1px 0 #222222',
        accentColor: '#00FF00',
        textColor: '#00FF00',
        btnCancelBg: '#181818',
        btnCancelBorder: '#333333',
        btnCancelText: '#00FF00',
        btnApplyBg: '#00FF00',
        btnApplyText: '#000000',
        previewBorder: 'border-zinc-800',
        tabContainerBg: '#000000',
        tabContainerBorder: '1.5px solid #333333',
        tabIndicatorBg: '#00FF00',
        tabIndicatorRadius: '0px',
        tabTextActive: '#000000',
        tabTextInactive: '#00FF00',
      };
    }
    if (isDarkFluid) {
      return {
        outerBg: 'linear-gradient(163deg, #D0BCFF 0%, #9A82DB 100%)',
        outerRadius: '22px',
        outerShadow: '0px 0px 30px 1px rgba(208, 188, 255, 0.28)',
        innerBg: '#1D1B20',
        innerRadius: '20px',
        headingColor: '#D0BCFF',
        subtextColor: '#CAC4D0',
        fieldBg: '#141218',
        fieldBorder: '1px solid rgba(255, 255, 255, 0.08)',
        fieldShadow: 'inset 2px 5px 10px rgba(5, 5, 5, 0.8)',
        accentColor: '#D0BCFF',
        textColor: '#E6E0E9',
        btnCancelBg: '#2B2930',
        btnCancelBorder: 'rgba(255,255,255,0.1)',
        btnCancelText: '#CAC4D0',
        btnApplyBg: '#D0BCFF',
        btnApplyText: '#381E72',
        previewBorder: 'border-white/10',
        tabContainerBg: '#141218',
        tabContainerBorder: '1px solid rgba(255, 255, 255, 0.08)',
        tabIndicatorBg: '#2B2930',
        tabIndicatorRadius: '7px',
        tabIndicatorBorder: '1px solid rgba(255, 255, 255, 0.12)',
        tabIndicatorShadow: '0 2px 8px rgba(0,0,0,0.5)',
        tabTextActive: '#D0BCFF',
        tabTextInactive: '#CAC4D0',
      };
    }
    if (isDark) {
      return {
        outerBg: 'linear-gradient(163deg, #64ffda 0%, #00b4d8 100%)',
        outerRadius: '22px',
        outerShadow: '0px 0px 32px 1px rgba(100, 255, 218, 0.3)',
        innerBg: '#171717',
        innerRadius: '20px',
        headingColor: '#64ffda',
        subtextColor: '#8892b0',
        fieldBg: '#111111',
        fieldBorder: '1px solid rgba(255, 255, 255, 0.06)',
        fieldShadow: 'inset 2px 5px 10px rgb(5, 5, 5)',
        accentColor: '#64ffda',
        textColor: '#ccd6f6',
        btnCancelBg: '#232323',
        btnCancelBorder: '#333333',
        btnCancelText: '#ccd6f6',
        btnApplyBg: '#64ffda',
        btnApplyText: '#000000',
        previewBorder: 'border-white/10',
        tabContainerBg: '#111111',
        tabContainerBorder: '1px solid rgba(255, 255, 255, 0.08)',
        tabIndicatorBg: '#232323',
        tabIndicatorRadius: '7px',
        tabIndicatorBorder: '1px solid rgba(100, 255, 218, 0.3)',
        tabIndicatorShadow: '0 2px 8px rgba(0,0,0,0.5)',
        tabTextActive: '#64ffda',
        tabTextInactive: '#8892b0',
      };
    }
    if (isVista) {
      return {
        outerBg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(56, 189, 248, 0.7) 45%, rgba(37, 99, 235, 0.8) 100%)',
        outerRadius: '22px',
        outerShadow: '0px 20px 45px -5px rgba(14, 116, 224, 0.35)',
        innerBg: 'rgba(235, 245, 255, 0.75)',
        innerRadius: '20px',
        headingColor: '#0f172a',
        subtextColor: '#334155',
        fieldBg: 'rgba(255, 255, 255, 0.65)',
        fieldBorder: '1px solid rgba(255, 255, 255, 0.85)',
        fieldShadow: 'inset 1px 1px 4px rgba(37, 99, 235, 0.08)',
        accentColor: '#2563eb',
        textColor: '#0f172a',
        btnCancelBg: 'rgba(255, 255, 255, 0.6)',
        btnCancelBorder: 'rgba(255, 255, 255, 0.8)',
        btnCancelText: '#334155',
        btnApplyBg: 'linear-gradient(180deg, #38bdf8 0%, #2563eb 100%)',
        btnApplyText: '#ffffff',
        previewBorder: 'border-white/60',
        tabContainerBg: 'rgba(186, 230, 253, 0.45)',
        tabContainerBorder: '1px solid rgba(255, 255, 255, 0.8)',
        tabIndicatorBg: 'linear-gradient(180deg, #ffffff 0%, #e0f2fe 100%)',
        tabIndicatorRadius: '7px',
        tabIndicatorBorder: '1px solid rgba(255, 255, 255, 0.9)',
        tabIndicatorShadow: '0 2px 6px rgba(14, 116, 224, 0.25)',
        tabTextActive: '#0f172a',
        tabTextInactive: '#334155',
      };
    }
    // Default light / teal theme (#F6F7F8 / #FFFFFF / #2EC4B6 / #011627)
    return {
      outerBg: 'linear-gradient(163deg, #2EC4B6 0%, #20A4F3 100%)',
      outerRadius: '22px',
      outerShadow: '0px 15px 35px -5px rgba(46, 196, 182, 0.35)',
      innerBg: '#ffffff',
      innerRadius: '20px',
      headingColor: '#011627',
      subtextColor: '#64748B',
      fieldBg: '#F6F7F8',
      fieldBorder: '1px solid #E2E8F0',
      fieldShadow: 'inset 1px 2px 6px rgba(0, 0, 0, 0.06)',
      accentColor: '#2EC4B6',
      textColor: '#011627',
      btnCancelBg: '#F1F5F9',
      btnCancelBorder: '#CBD5E1',
      btnCancelText: '#475569',
      btnApplyBg: '#2EC4B6',
      btnApplyText: '#ffffff',
      previewBorder: 'border-slate-200',
      tabContainerBg: '#dadadb',
      tabContainerBorder: 'none',
      tabIndicatorBg: '#ffffff',
      tabIndicatorRadius: '7px',
      tabIndicatorBorder: '0.5px solid rgba(0, 0, 0, 0.04)',
      tabIndicatorShadow: '0px 3px 8px rgba(0, 0, 0, 0.12), 0px 3px 1px rgba(0, 0, 0, 0.04)',
      tabTextActive: '#011627',
      tabTextInactive: '#64748B',
    };
  };

  const currentStyle = getGlowCardStyle();

  const modalContent = (
    <AnimatePresence>
      {/* Backdrop (Latar Belakang Gelap / Buram) */}
      <div
        key="paste-excel-modal-backdrop"
        className="fixed inset-0 sm:top-7 z-[99998] bg-black/75 backdrop-blur-sm select-none"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Viewport Layer */}
      <div
        key="paste-excel-modal-viewport"
        className="fixed inset-0 sm:top-7 z-[99999] flex items-center justify-center p-3 sm:p-5 pointer-events-none select-none"
        data-theme={theme}
      >
        {/* .form-card1 Outer Gradient Glowing Shell */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundImage: currentStyle.outerBg,
            borderRadius: currentStyle.outerRadius,
            boxShadow: currentStyle.outerShadow,
          }}
          className="p-[2px] w-full max-w-xl sm:max-w-2xl transition-all duration-300 max-h-[92vh] flex flex-col pointer-events-auto relative z-[99999]"
        >
          {/* .form-card2 Inner Form Container */}
          <div
            style={{
              backgroundColor: currentStyle.innerBg,
              borderRadius: currentStyle.innerRadius,
              color: currentStyle.textColor,
              ...(isVista ? { backdropFilter: 'blur(24px) saturate(200%)', WebkitBackdropFilter: 'blur(24px) saturate(200%)' } : {})
            }}
            className={`flex flex-col p-3.5 sm:p-5 overflow-hidden max-h-[calc(92vh-4px)] transition-all duration-200 relative ${
              isWinamp ? 'font-mono' : ''
            }`}
          >
            {isVista && (
              <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-[20px]" />
            )}

            {/* Header / Heading (Pinned at top) */}
            <div className="flex items-center justify-between relative pb-2 shrink-0 border-b border-current/10">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div
                  style={{
                    backgroundColor: isLightMode
                      ? isVista
                        ? 'rgba(37,99,235,0.1)'
                        : 'rgba(46,196,182,0.15)'
                      : isWinamp
                      ? 'rgba(0,255,0,0.1)'
                      : 'rgba(255,255,255,0.08)',
                    borderColor: currentStyle.accentColor,
                  }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 shadow-2xs"
                >
                  {activeTab === 'excel_grid' ? (
                    <FileSpreadsheet
                      style={{
                        color: isLightMode
                          ? isVista
                            ? '#2563eb'
                            : '#0e7c7b'
                          : currentStyle.headingColor,
                      }}
                      className="w-5 h-5"
                    />
                  ) : (
                    <ClipboardPaste
                      style={{
                        color: isLightMode
                          ? isVista
                            ? '#2563eb'
                            : '#0e7c7b'
                          : currentStyle.headingColor,
                      }}
                      className="w-5 h-5"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <h2
                    style={{ color: currentStyle.headingColor }}
                    className="text-sm sm:text-base font-black tracking-tight leading-tight truncate"
                  >
                    {activeTab === 'excel_grid'
                      ? 'Paste dari Excel (Spreadsheet)'
                      : activeTab === 'schedule'
                      ? 'Salin Jadwal Shift (Teks)'
                      : 'Salin Presensi (Teks Log)'}
                  </h2>
                  <p
                    style={{ color: currentStyle.subtextColor }}
                    className="text-[11px] truncate font-medium"
                  >
                    Bulan {monthNames[selectedMonth - 1]} {selectedYear} ({daysInMonth} Hari)
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowHelp((prev) => !prev)}
                  title={showHelp ? 'Sembunyikan petunjuk' : 'Tampilkan petunjuk'}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                    showHelp
                      ? isLightMode
                        ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300'
                        : 'bg-white/15 text-white'
                      : isLightMode
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  title="Tutup (Esc)"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isLightMode
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* SEGMENTED 3-TAB SELECTOR (RADIO BUTTONS WITH INDIKATOR ANIMASI - Pinned at top) */}
            <div className="flex items-center justify-center pt-1 pb-1 shrink-0">
              <div
                className="tab-container relative grid grid-cols-3 p-[2px] select-none w-full max-w-[390px]"
                style={{
                  backgroundColor: currentStyle.tabContainerBg,
                  border: currentStyle.tabContainerBorder,
                  borderRadius: isWinamp ? '0px' : '9px',
                }}
              >
                {/* Radio Input 1: Paste dari Excel */}
                <label
                  className="tab_label relative z-30 h-[28px] flex items-center justify-center text-[11px] sm:text-xs font-bold transition-colors cursor-pointer text-center px-1"
                  style={{
                    color: activeTab === 'excel_grid' ? currentStyle.tabTextActive : currentStyle.tabTextInactive,
                    fontFamily: isWinamp ? 'monospace' : 'inherit',
                  }}
                >
                  <input
                    type="radio"
                    name="pasteTabGroup"
                    id="tab0_excel_grid"
                    className="sr-only"
                    checked={activeTab === 'excel_grid'}
                    onChange={() => {
                      setActiveTab('excel_grid');
                      setErrorMsg(null);
                    }}
                  />
                  Paste Excel
                </label>

                {/* Radio Input 2: Salin Shift */}
                <label
                  className="tab_label relative z-30 h-[28px] flex items-center justify-center text-[11px] sm:text-xs font-bold transition-colors cursor-pointer text-center px-1"
                  style={{
                    color: activeTab === 'schedule' ? currentStyle.tabTextActive : currentStyle.tabTextInactive,
                    fontFamily: isWinamp ? 'monospace' : 'inherit',
                  }}
                >
                  <input
                    type="radio"
                    name="pasteTabGroup"
                    id="tab1_schedule"
                    className="sr-only"
                    checked={activeTab === 'schedule'}
                    onChange={() => {
                      setActiveTab('schedule');
                      setErrorMsg(null);
                    }}
                  />
                  Teks Shift
                </label>

                {/* Radio Input 3: Salin Presensi */}
                <label
                  className="tab_label relative z-30 h-[28px] flex items-center justify-center text-[11px] sm:text-xs font-bold transition-colors cursor-pointer text-center px-1"
                  style={{
                    color: activeTab === 'absen' ? currentStyle.tabTextActive : currentStyle.tabTextInactive,
                    fontFamily: isWinamp ? 'monospace' : 'inherit',
                  }}
                >
                  <input
                    type="radio"
                    name="pasteTabGroup"
                    id="tab2_absen"
                    className="sr-only"
                    checked={activeTab === 'absen'}
                    onChange={() => {
                      setActiveTab('absen');
                      setErrorMsg(null);
                    }}
                  />
                  Teks Presensi
                </label>

                {/* Sliding Indicator Pill */}
                <div
                  className="indicator absolute top-[2px] z-10 h-[28px] transition-all duration-200 ease-out pointer-events-none"
                  style={{
                    left:
                      activeTab === 'excel_grid'
                        ? '2px'
                        : activeTab === 'schedule'
                        ? 'calc(33.333% + 1px)'
                        : 'calc(66.666%)',
                    width: 'calc(33.333% - 2px)',
                    backgroundColor: currentStyle.tabIndicatorBg,
                    borderRadius: currentStyle.tabIndicatorRadius,
                    border: currentStyle.tabIndicatorBorder || 'none',
                    boxShadow: currentStyle.tabIndicatorShadow || 'none',
                  }}
                />
              </div>
            </div>

            {/* SCROLLABLE FORM BODY (Allows full viewing of instructions, textarea, and preview on small screens) */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-2.5 sm:space-y-3 pr-1 -mr-1">
              {/* Collapsible / Floating Instructions */}
              {showHelp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 overflow-hidden"
                >
                  <div
                    style={{
                      backgroundColor: currentStyle.fieldBg,
                      border: currentStyle.fieldBorder,
                      boxShadow: currentStyle.fieldShadow,
                      borderRadius: isWinamp ? '0px' : '10px',
                    }}
                    className="p-2.5 sm:p-3 text-[10.5px] sm:text-xs space-y-2"
                  >
                    <div
                      className="flex items-center space-x-1.5 font-bold"
                      style={{
                        color: isLightMode
                          ? isVista
                            ? '#1e3a8a'
                            : '#0e7c7b'
                          : currentStyle.headingColor,
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-bold">
                        {activeTab === 'excel_grid'
                          ? 'Petunjuk Paste dari Excel (Spreadsheet Interaktif):'
                          : activeTab === 'schedule'
                          ? 'Petunjuk Salin Jadwal Shift dari Excel (Teks Baris):'
                          : 'Petunjuk Salin Absen Masuk & Pulang (Smart Auto-Detect):'}
                      </span>
                    </div>

                    {activeTab === 'excel_grid' ? (
                      <div className="space-y-1.5 leading-relaxed" style={{ color: currentStyle.textColor }}>
                        <p className="opacity-95">
                          <strong className="font-bold">1.</strong> Buka file Microsoft Excel atau Google Sheets Anda, lalu sorot area sel jadwal (1 baris atau 1 kolom) dan tekan <kbd className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono font-bold">Ctrl + C</kbd>.
                        </p>
                        <p className="opacity-95">
                          <strong className="font-bold">2.</strong> Klik pada area tabel spreadsheet di bawah lalu tekan <kbd className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono font-bold">Ctrl + V</kbd>. Warna background, warna teks, dan border dari Excel akan otomatis tersalin.
                        </p>
                        <p className="opacity-95">
                          <strong className="font-bold">3.</strong> Sistem akan <strong>otomatis memindai & mendeteksi kode shift</strong> untuk tanggal 1 s.d. {daysInMonth} pada bulan aktif.
                        </p>
                      </div>
                    ) : activeTab === 'schedule' ? (
                      <div className="space-y-1.5 leading-relaxed" style={{ color: currentStyle.textColor }}>
                        <p className="opacity-95">
                          <strong className="font-bold">1.</strong> Buka file Excel, sorot <strong>1 baris horizontal</strong> berisi kode shift tanggal 1 s.d. {daysInMonth}, lalu tekan <strong>Ctrl + C</strong>.
                        </p>
                        <p className="opacity-95">
                          <strong className="font-bold">2.</strong> Tempelkan ke kotak input di bawah menggunakan <strong>Ctrl + V</strong> (atau tombol Paste).
                        </p>
                        <div className="pt-0.5 flex flex-wrap gap-1 items-center">
                          <span style={{ color: currentStyle.subtextColor }} className="text-[9.5px] sm:text-[10px] font-semibold">
                            Format didukung:
                          </span>
                          {SHIFT_OPTIONS.map((s, idx) => (
                            <span
                              key={`${s}-${idx}`}
                              className={`px-1.5 py-0.5 rounded-[4px] text-[9px] sm:text-[9.5px] font-bold ${
                                SHIFT_COLORS[s]?.bg || 'bg-slate-700'
                              } ${SHIFT_COLORS[s]?.text || 'text-white'}`}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 leading-relaxed" style={{ color: currentStyle.textColor }}>
                        <p className="opacity-95">
                          <strong className="font-bold">1.</strong> Salin seluruh tabel/log kehadiran kotor langsung dari sistem/Excel (termasuk tanggal dan tulisan WIB, misal: <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[9.5px] font-mono">01 Sep 2026 WFO 12.46 WIB 22.31 WIB ...</code>).
                        </p>
                        <p className="opacity-95">
                          <strong className="font-bold">2.</strong> Tempelkan di kotak bawah dengan <strong>Ctrl + V</strong>. Sistem akan <strong>otomatis memilah tanggal, Jam Masuk, dan Jam Pulang</strong> sekaligus!
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 1 CONTENT: EXCEL SPREADSHEET (Copy-Paste Format Excel with react-spreadsheet) */}
              {activeTab === 'excel_grid' && (
                <div className="w-full">
                  <ExcelSpreadsheet
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    daysInMonth={daysInMonth}
                    theme={theme}
                    onParsedShiftsChange={handleSpreadsheetParsed}
                  />
                </div>
              )}

              {/* TAB 2 & 3 CONTENT: Debossed Inset Area for Paste Text Input */}
              {activeTab !== 'excel_grid' && (
                <div className="space-y-1 flex flex-col shrink-0">
                  <label style={{ color: currentStyle.subtextColor }} className="text-[10px] font-bold uppercase tracking-wider block">
                    {activeTab === 'schedule'
                      ? 'Kotak Tempel Teks Shift (Ctrl + V):'
                      : 'Kotak Tempel Teks Absen / Laporan Kehadiran (Ctrl + V):'}
                  </label>

                  <div
                    style={{
                      backgroundColor: currentStyle.fieldBg,
                      border: currentStyle.fieldBorder,
                      boxShadow: currentStyle.fieldShadow,
                      borderRadius: isWinamp ? '0px' : '10px',
                    }}
                    className="p-2 sm:p-2.5 flex items-start gap-2 transition-all duration-200"
                  >
                    {activeTab === 'schedule' ? (
                      <textarea
                        id="excel-paste-area"
                        ref={textareaRef}
                        rows={3}
                        value={inputText}
                        onChange={(e) => {
                          setInputText(e.target.value);
                          setErrorMsg(null);
                        }}
                        placeholder="Klik di sini lalu tekan Ctrl+V (Contoh: G	L	N	OFF	SM	PM	M	CUTI ...)"
                        className="w-full bg-transparent border-none outline-none font-mono text-xs leading-relaxed resize-none p-1 placeholder:opacity-50"
                        style={{
                          color: currentStyle.textColor,
                          caretColor: currentStyle.accentColor,
                        }}
                      />
                    ) : (
                      <textarea
                        id="excel-paste-absen-area"
                        ref={textareaAbsenRef}
                        rows={3}
                        value={inputTextAbsen}
                        onChange={(e) => {
                          setInputTextAbsen(e.target.value);
                          setErrorMsg(null);
                        }}
                        placeholder="Klik di sini lalu tekan Ctrl+V (Tempelkan data kotor / laporan log jam kerja contoh:&#10;01 Sep 2026  WFO  12.46 WIB  22.31 WIB  TL3&#10;02 Sep 2026  WFO  07.57 WIB  18.43 WIB  Hadir Normal ...)"
                        className="w-full bg-transparent border-none outline-none font-mono text-xs leading-relaxed resize-none p-1 placeholder:opacity-50"
                        style={{
                          color: currentStyle.textColor,
                          caretColor: currentStyle.accentColor,
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2 shrink-0">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Live Preview Grid of Parsed Days (Schedule Tab) */}
              {activeTab === 'schedule' && inputText.trim().length > 0 && (
                <div className="space-y-1.5 flex flex-col min-h-0 shrink-0">
                  <div className="flex items-center justify-between text-xs font-bold px-0.5">
                    <span style={{ color: currentStyle.subtextColor }} className="text-[11px]">
                      Pratinjau Shift Parsed:
                    </span>
                    <span
                      style={{
                        color:
                          validCountSchedule > 0
                            ? isLightMode
                              ? isVista
                                ? '#2563eb'
                                : '#0e7c7b'
                              : currentStyle.headingColor
                            : '#f59e0b',
                      }}
                      className="text-[11px] font-black"
                    >
                      {validCountSchedule} dari {daysInMonth} hari cocok
                    </span>
                  </div>

                  <div
                    style={{
                      backgroundColor: currentStyle.fieldBg,
                      border: currentStyle.fieldBorder,
                      boxShadow: currentStyle.fieldShadow,
                      borderRadius: isWinamp ? '0px' : '10px',
                    }}
                    className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 max-h-32 sm:max-h-40 overflow-y-auto p-2.5 overscroll-contain"
                  >
                    {matchedDaysSchedule.map((item, idx) => {
                      const isMatched = item.shift !== null;
                      return (
                        <div
                          key={`sched-${item.day}-${idx}`}
                          className={`flex flex-col items-center justify-center p-1 rounded-[6px] border text-center transition-all ${
                            isMatched
                              ? isLightMode
                                ? 'border-teal-300/80 dark:border-blue-300 bg-white shadow-2xs'
                                : 'border-white/20 bg-white/5'
                              : isLightMode
                              ? 'border-slate-300/50 bg-slate-200/40 opacity-50'
                              : 'border-white/5 bg-transparent opacity-40'
                          }`}
                        >
                          <span style={{ color: currentStyle.subtextColor }} className="text-[8.5px] font-bold">
                            Tgl {item.day}
                          </span>
                          {isMatched && item.shift ? (
                            <span
                              className={`mt-0.5 px-1 py-0.2 rounded text-[9.5px] font-black leading-tight ${
                                SHIFT_COLORS[item.shift].bg
                              } ${SHIFT_COLORS[item.shift].text}`}
                            >
                              {item.shift}
                            </span>
                          ) : (
                            <span
                              style={{ color: currentStyle.subtextColor }}
                              className="text-[9.5px] font-mono opacity-60 truncate max-w-full"
                            >
                              {item.raw ? item.raw.slice(0, 3) : '-'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Live Preview Grid for Salin Absen (Masuk & Pulang) */}
              {activeTab === 'absen' && inputTextAbsen.trim().length > 0 && (
                <div className="space-y-1.5 flex flex-col min-h-0 shrink-0">
                  <div className="flex items-center justify-between text-xs font-bold px-0.5">
                    <span style={{ color: currentStyle.subtextColor }} className="text-[11px]">
                      Pratinjau Hasil Ekstraksi Jam (Masuk & Pulang):
                    </span>
                    <span
                      style={{
                        color:
                          validCountAbsen > 0
                            ? isLightMode
                              ? isVista
                                ? '#2563eb'
                                : '#0e7c7b'
                              : currentStyle.headingColor
                            : '#f59e0b',
                      }}
                      className="text-[11px] font-black"
                    >
                      {validCountAbsen} dari {daysInMonth} hari terdeteksi
                    </span>
                  </div>

                  <div
                    style={{
                      backgroundColor: currentStyle.fieldBg,
                      border: currentStyle.fieldBorder,
                      boxShadow: currentStyle.fieldShadow,
                      borderRadius: isWinamp ? '0px' : '10px',
                    }}
                    className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-36 sm:max-h-44 overflow-y-auto p-2.5 overscroll-contain"
                  >
                    {matchedDaysAbsen.map((item, idx) => {
                      const isMatched = item.jamMasuk !== null || item.jamPulang !== null;
                      return (
                        <div
                          key={`absen-${item.day}-${idx}`}
                          className={`flex flex-col items-center justify-between p-1.5 rounded-[6px] border text-center transition-all ${
                            isMatched
                              ? isLightMode
                                ? 'border-teal-300/80 dark:border-blue-300 bg-white shadow-2xs'
                                : 'border-white/20 bg-white/5'
                              : isLightMode
                              ? 'border-slate-300/50 bg-slate-200/40 opacity-40'
                              : 'border-white/5 bg-transparent opacity-30'
                          }`}
                        >
                          <span style={{ color: currentStyle.subtextColor }} className="text-[9px] font-bold border-b border-current/10 w-full pb-0.5 mb-1">
                            Tgl {item.day}
                          </span>

                          {isMatched ? (
                            <div className="flex flex-col items-center gap-0.5 w-full text-[9px] font-mono">
                              <span className={`px-1 py-0.2 rounded w-full truncate font-black ${item.jamMasuk ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' : 'opacity-40'}`}>
                                M: {item.jamMasuk || '-'}
                              </span>
                              <span className={`px-1 py-0.2 rounded w-full truncate font-black ${item.jamPulang ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'opacity-40'}`}>
                                P: {item.jamPulang || '-'}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: currentStyle.subtextColor }} className="text-[9.5px] font-mono opacity-50 py-1">
                              -
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons: Cancel and Apply (Pinned at bottom) */}
            <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-current/10 shrink-0 mt-0.5">
              <button
                type="button"
                onClick={onClose}
                style={{
                  backgroundColor: currentStyle.btnCancelBg,
                  borderColor: currentStyle.btnCancelBorder,
                  color: currentStyle.btnCancelText,
                  borderRadius: isWinamp ? '0px' : '10px',
                }}
                className="px-4 py-2 text-xs font-bold border hover:opacity-90 transition-all cursor-pointer shadow-2xs"
              >
                Batal
              </button>

              {(() => {
                const currentValidCount =
                  activeTab === 'excel_grid'
                    ? spreadsheetValidCount
                    : activeTab === 'schedule'
                    ? validCountSchedule
                    : validCountAbsen;
                const isReady = currentValidCount > 0;

                return (
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={!isReady}
                    style={{
                      color: isReady ? currentStyle.btnApplyText : 'currentColor',
                      backgroundColor: isReady ? currentStyle.btnApplyBg : 'transparent',
                      borderColor: currentStyle.accentColor,
                      borderRadius: isWinamp ? '0px' : '10px',
                      boxShadow: isReady
                        ? isLightMode
                          ? `0 4px 12px ${currentStyle.accentColor}40`
                          : `0 0 15px ${currentStyle.accentColor}55`
                        : 'none',
                    }}
                    className={`flex items-center justify-center space-x-1.5 px-5 py-2 text-xs font-black transition-all duration-300 cursor-pointer border ${
                      isReady
                        ? 'hover:brightness-105 active:scale-[0.98]'
                        : 'opacity-40 cursor-not-allowed border-current'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Terapkan ({currentValidCount} Hari)</span>
                  </button>
                );
              })()}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
