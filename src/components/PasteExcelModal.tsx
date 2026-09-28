import React, { useState, useEffect, useRef } from 'react';
import { ClipboardPaste, X, Check, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SHIFT_OPTIONS, ShiftType, SHIFT_COLORS, DayData, EXCEL_SHIFT_MAPPING, AppTheme } from '../types';

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
  const [activeTab, setActiveTab] = useState<'schedule' | 'absen'>('schedule');

  const [inputText, setInputText] = useState(initialText);
  const [inputTextAbsen, setInputTextAbsen] = useState('');
  const [parsedCellItems, setParsedCellItems] = useState<{ text: string; bgColor: string }[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaAbsenRef = useRef<HTMLTextAreaElement>(null);

  const isWinamp = theme === 'winamp';
  const isDarkFluid = theme === 'darkFluid';
  const isDark = theme === 'dark';
  const isVista = theme === 'vista';
  const isDefault = theme === 'default';

  const isLightMode = isDefault || isVista;

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  useEffect(() => {
    if (isOpen) {
      setInputText(initialText);
      setInputTextAbsen('');
      setParsedCellItems([]);
      setErrorMsg(null);
      setTimeout(() => {
        if (activeTab === 'schedule') {
          textareaRef.current?.focus();
          textareaRef.current?.select();
        } else {
          textareaAbsenRef.current?.focus();
          textareaAbsenRef.current?.select();
        }
      }, 120);
    }
  }, [isOpen, initialText, activeTab]);

  if (!isOpen) return null;

  // --- HTML Clipboard Paste Handler (Cell Background Color Support) ---
  const handlePasteTextarea = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const htmlData = e.clipboardData.getData('text/html');
    if (htmlData) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlData, 'text/html');
        const cells = Array.from(doc.querySelectorAll('td, th'));
        if (cells.length > 0) {
          e.preventDefault();
          const items: { text: string; bgColor: string }[] = [];
          cells.forEach((cell) => {
            const text = cell.textContent?.trim() || '';
            const style = (cell as HTMLElement).getAttribute('style') || '';
            const bgcolor = (cell as HTMLElement).getAttribute('bgcolor') || '';
            let bgColor = bgcolor;
            if (!bgColor && style) {
              const bgMatch = style.match(/(?:background-color|background)\s*:\s*([^;]+)/i);
              if (bgMatch) {
                bgColor = bgMatch[1].trim();
              }
            }
            items.push({ text, bgColor });
          });
          setParsedCellItems(items);
          setInputText(items.map((i) => i.text).join('\t'));
          setErrorMsg(null);
          return;
        }
      } catch (err) {
        console.error('HTML paste parse error:', err);
      }
    }
  };

  // --- PARSER 1: Salin Jadwal (Shift Codes for horizontal/vertical layouts) ---
  const getParsedScheduleItems = (): { text: string; bgColor: string }[] => {
    if (parsedCellItems && parsedCellItems.length > 0) {
      return parsedCellItems;
    }
    if (!inputText || !inputText.trim()) return [];

    const lines = inputText.replace(/\r/g, '').split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const allItems: { text: string; bgColor: string }[] = [];

    if (lines.length === 1 || (lines.length > 1 && lines[0].includes('\t'))) {
      lines.forEach((line) => {
        let rowCells = line.split('\t');
        if (rowCells.length <= 1 && line.includes(',')) {
          rowCells = line.split(',');
        } else if (rowCells.length <= 1 && line.includes(';')) {
          rowCells = line.split(';');
        } else if (rowCells.length <= 1 && line.includes(' ')) {
          rowCells = line.split(/\s+/);
        }
        rowCells.forEach((rc) => {
          const cleaned = rc.trim().replace(/^["']|["']$/g, '');
          if (cleaned) {
            allItems.push({ text: cleaned.toUpperCase(), bgColor: '' });
          }
        });
      });
    } else {
      lines.forEach((line) => {
        const cleaned = line.trim().replace(/^["']|["']$/g, '');
        if (cleaned) {
          allItems.push({ text: cleaned.toUpperCase(), bgColor: '' });
        }
      });
    }

    return allItems;
  };

  const scheduleItems = getParsedScheduleItems();
  const matchedDaysSchedule: { day: number; shift: ShiftType | null; raw: string }[] = [];
  let validCountSchedule = 0;

  for (let i = 0; i < daysInMonth; i++) {
    const cellItem = scheduleItems[i] || { text: '', bgColor: '' };
    const raw = cellItem.text;
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
    if (activeTab === 'schedule') {
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

  const getGlowCardStyle = () => {
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
        tabContainerBg: '#121212',
        tabContainerBorder: '1px solid #282828',
        tabTextActive: '#000000',
        tabTextInactive: '#00FF00',
        tabIndicatorBg: '#00FF00',
        tabIndicatorRadius: '0px',
      };
    }
    if (isVista) {
      return {
        outerBg: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(220,235,255,0.9) 100%)',
        outerRadius: '20px',
        outerShadow: '0 25px 50px -12px rgba(37, 99, 235, 0.25)',
        innerBg: 'rgba(255, 255, 255, 0.85)',
        innerRadius: '18px',
        headingColor: '#1e3a8a',
        subtextColor: '#475569',
        fieldBg: 'rgba(240, 246, 255, 0.7)',
        fieldBorder: '1px solid rgba(147, 197, 253, 0.5)',
        fieldShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)',
        accentColor: '#2563eb',
        textColor: '#0f172a',
        btnCancelBg: 'rgba(255,255,255,0.9)',
        btnCancelBorder: 'rgba(147, 197, 253, 0.6)',
        btnCancelText: '#1e3a8a',
        btnApplyBg: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        btnApplyText: '#ffffff',
        tabContainerBg: 'rgba(226, 232, 240, 0.7)',
        tabContainerBorder: '1px solid rgba(147, 197, 253, 0.4)',
        tabTextActive: '#ffffff',
        tabTextInactive: '#334155',
        tabIndicatorBg: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        tabIndicatorRadius: '7px',
        tabIndicatorShadow: '0 2px 8px rgba(37,99,235,0.3)',
      };
    }
    if (isDarkFluid) {
      return {
        outerBg: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.02) 100%)',
        outerRadius: '24px',
        outerShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        innerBg: '#1D1B20',
        innerRadius: '22px',
        headingColor: '#E6E0E9',
        subtextColor: '#CAC4D0',
        fieldBg: '#141218',
        fieldBorder: '1px solid rgba(255,255,255,0.1)',
        fieldShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
        accentColor: '#D0BCFF',
        textColor: '#E6E0E9',
        btnCancelBg: '#2B2930',
        btnCancelBorder: 'rgba(255,255,255,0.1)',
        btnCancelText: '#E6E0E9',
        btnApplyBg: '#D0BCFF',
        btnApplyText: '#381E72',
        tabContainerBg: '#2B2930',
        tabContainerBorder: '1px solid rgba(255,255,255,0.1)',
        tabTextActive: '#381E72',
        tabTextInactive: '#CAC4D0',
        tabIndicatorBg: '#D0BCFF',
        tabIndicatorRadius: '8px',
        tabIndicatorShadow: '0 2px 8px rgba(208,188,255,0.3)',
      };
    }
    if (isDark) {
      return {
        outerBg: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.5) 100%)',
        outerRadius: '20px',
        outerShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        innerBg: '#18181b',
        innerRadius: '18px',
        headingColor: '#f43f5e',
        subtextColor: '#a1a1aa',
        fieldBg: '#09090b',
        fieldBorder: '1px solid #27272a',
        fieldShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
        accentColor: '#f43f5e',
        textColor: '#f4f4f5',
        btnCancelBg: '#27272a',
        btnCancelBorder: '#3f3f46',
        btnCancelText: '#f4f4f5',
        btnApplyBg: '#f43f5e',
        btnApplyText: '#ffffff',
        tabContainerBg: '#27272a',
        tabContainerBorder: '1px solid #3f3f46',
        tabTextActive: '#ffffff',
        tabTextInactive: '#a1a1aa',
        tabIndicatorBg: '#f43f5e',
        tabIndicatorRadius: '7px',
        tabIndicatorShadow: '0 2px 8px rgba(244,63,94,0.3)',
      };
    }
    // Default (Light)
    return {
      outerBg: 'linear-gradient(135deg, rgba(14,124,123,0.3) 0%, rgba(20,184,166,0.1) 100%)',
      outerRadius: '20px',
      outerShadow: '0 25px 50px -12px rgba(14, 124, 123, 0.25)',
      innerBg: '#ffffff',
      innerRadius: '18px',
      headingColor: '#0e7c7b',
      subtextColor: '#64748b',
      fieldBg: '#f8fafc',
      fieldBorder: '1px solid #e2e8f0',
      fieldShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
      accentColor: '#0e7c7b',
      textColor: '#1e293b',
      btnCancelBg: '#f1f5f9',
      btnCancelBorder: '#cbd5e1',
      btnCancelText: '#475569',
      btnApplyBg: '#0e7c7b',
      btnApplyText: '#ffffff',
      tabContainerBg: '#f1f5f9',
      tabContainerBorder: '1px solid #cbd5e1',
      tabTextActive: '#ffffff',
      tabTextInactive: '#64748b',
      tabIndicatorBg: '#0e7c7b',
      tabIndicatorRadius: '7px',
      tabIndicatorShadow: '0 2px 8px rgba(14,124,123,0.3)',
    };
  };

  const currentStyle = getGlowCardStyle();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{
            background: currentStyle.outerBg,
            borderRadius: isWinamp ? '0px' : '22px',
            boxShadow: currentStyle.outerShadow,
          }}
          className="relative w-full max-w-lg sm:max-w-xl p-[2px] shadow-2xl my-auto"
        >
          <div
            style={{
              backgroundColor: currentStyle.innerBg,
              borderRadius: isWinamp ? '0px' : '20px',
            }}
            className="flex flex-col p-4 sm:p-5 max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-current/10 shrink-0">
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
                </div>
                <div className="min-w-0">
                  <h2
                    style={{ color: currentStyle.headingColor }}
                    className="text-sm sm:text-base font-black tracking-tight leading-tight truncate"
                  >
                    {activeTab === 'schedule' ? 'Salin Jadwal Shift' : 'Salin Presensi'}
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

            {/* SEGMENTED TAB SELECTOR (RADIO BUTTONS WITH 2 COLUMNS) */}
            <div className="flex items-center justify-center pt-2 pb-1.5 shrink-0">
              <div
                className="tab-container relative grid grid-cols-2 p-[2px] select-none w-full max-w-[360px]"
                style={{
                  backgroundColor: currentStyle.tabContainerBg,
                  border: currentStyle.tabContainerBorder,
                  borderRadius: isWinamp ? '0px' : '9px',
                }}
              >
                {/* Radio Input 1: Salin Shift */}
                <label
                  className="tab_label relative z-30 h-[28px] flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
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
                  Salin Shift
                </label>

                {/* Radio Input 2: Salin Presensi */}
                <label
                  className="tab_label relative z-30 h-[28px] flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
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
                  Salin Presensi
                </label>

                {/* Sliding Indicator Pill */}
                <div
                  className="indicator absolute top-[2px] z-10 h-[28px] transition-all duration-200 ease-out pointer-events-none"
                  style={{
                    left: activeTab === 'schedule' ? '2px' : '50%',
                    width: 'calc(50% - 2px)',
                    backgroundColor: currentStyle.tabIndicatorBg,
                    borderRadius: currentStyle.tabIndicatorRadius,
                    boxShadow: currentStyle.tabIndicatorShadow || 'none',
                  }}
                />
              </div>
            </div>

            {/* SCROLLABLE FORM BODY */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-2.5 sm:space-y-3 pr-1 -mr-1">
              {/* Collapsible Instructions */}
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
                        {activeTab === 'schedule'
                          ? 'Petunjuk Salin Jadwal Shift dari Excel:'
                          : 'Petunjuk Salin Absen Masuk & Pulang (Smart Auto-Detect):'}
                      </span>
                    </div>

                    {activeTab === 'schedule' ? (
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

              {/* Paste Input Area */}
              <div className="space-y-1 flex flex-col shrink-0">
                <label style={{ color: currentStyle.subtextColor }} className="text-[10px] font-bold uppercase tracking-wider block">
                  {activeTab === 'schedule' ? 'Kotak Tempel Teks Shift (Ctrl + V):' : 'Kotak Tempel Teks Absen / Laporan Kehadiran (Ctrl + V):'}
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
                      onPaste={handlePasteTextarea}
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

              {/* Error Message */}
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2 shrink-0">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Live Preview Grid for Schedule Text */}
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
                          <span style={{ color: currentStyle.subtextColor }} className="text-[8.5px] font-bold">
                            Tgl {item.day}
                          </span>
                          <div className="my-0.5 space-y-0.5 w-full">
                            <div className="text-[9px] font-mono font-bold flex items-center justify-between px-1 bg-black/5 dark:bg-white/5 rounded">
                              <span className="opacity-60 text-[8px]">IN</span>
                              <span className={item.jamMasuk ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'opacity-30'}>
                                {item.jamMasuk || '--:--'}
                              </span>
                            </div>
                            <div className="text-[9px] font-mono font-bold flex items-center justify-between px-1 bg-black/5 dark:bg-white/5 rounded">
                              <span className="opacity-60 text-[8px]">OUT</span>
                              <span className={item.jamPulang ? 'text-blue-600 dark:text-blue-400 font-black' : 'opacity-30'}>
                                {item.jamPulang || '--:--'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 pt-3 mt-3 border-t border-current/10 shrink-0">
              <button
                type="button"
                onClick={onClose}
                style={{
                  backgroundColor: currentStyle.btnCancelBg,
                  borderColor: currentStyle.btnCancelBorder,
                  color: currentStyle.btnCancelText,
                  borderRadius: isWinamp ? '0px' : '10px',
                }}
                className="px-3.5 py-2 text-xs font-bold border transition-colors cursor-pointer hover:opacity-90"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleApply}
                style={{
                  backgroundColor: currentStyle.btnApplyBg,
                  color: currentStyle.btnApplyText,
                  borderRadius: isWinamp ? '0px' : '10px',
                }}
                className="px-4 py-2 text-xs font-black shadow-md transition-all cursor-pointer hover:opacity-95 flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Terapkan Jadwal</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
