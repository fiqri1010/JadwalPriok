import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Check, Clock } from 'lucide-react';
import { AppTheme } from '../types';

export interface CustomDatePickerProps {
  value: string; // Format: 'YYYY-MM-DD'
  onChange: (value: string) => void;
  placeholder?: string;
  theme?: AppTheme;
  min?: string; // 'YYYY-MM-DD'
  max?: string; // 'YYYY-MM-DD'
  disabled?: boolean;
  className?: string;
  required?: boolean;
  label?: string;
  allowClear?: boolean;
  align?: 'left' | 'right';
}

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_NAMES_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Pilih tanggal...',
  theme = 'default',
  min,
  max,
  disabled = false,
  className = '',
  required = false,
  label,
  allowClear = true,
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse current value or fallback to today
  const parsedDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m, d);
      }
    }
    return null;
  }, [value]);

  const today = useMemo(() => new Date(), []);
  
  // Viewing month and year state
  const [viewYear, setViewYear] = useState<number>(() => parsedDate?.getFullYear() || today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => parsedDate ? parsedDate.getMonth() : today.getMonth());
  const [isMonthSelectOpen, setIsMonthSelectOpen] = useState(false);
  const [isYearSelectOpen, setIsYearSelectOpen] = useState(false);

  // Coordinate tracking for fixed portal positioning
  const [coords, setCoords] = useState<{ top: number; left: number; openUpward: boolean }>({
    top: 0,
    left: 0,
    openUpward: false,
  });

  const updateCoords = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const popoverWidth = window.innerWidth < 640 ? 288 : 320;
    const popoverHeight = 350;
    const padding = 10;

    const spaceBelow = window.innerHeight - rect.bottom - padding;
    const spaceAbove = rect.top - padding;
    const openUpward = spaceBelow < popoverHeight && spaceAbove > spaceBelow;

    let top = openUpward ? rect.top - popoverHeight - 4 : rect.bottom + 6;
    if (top < padding) top = padding;

    let left = align === 'right' ? rect.right - popoverWidth : rect.left;
    if (left + popoverWidth > window.innerWidth - padding) {
      left = window.innerWidth - popoverWidth - padding;
    }
    if (left < padding) left = padding;

    setCoords({ top, left, openUpward });
  }, [align]);

  // Sync view when value changes or when opened
  useEffect(() => {
    if (parsedDate) {
      setViewYear(parsedDate.getFullYear());
      setViewMonth(parsedDate.getMonth());
    }
  }, [parsedDate]);

  // Close on outside click or escape & update coords on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    updateCoords();

    const handleScrollOrResize = () => updateCoords();
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
        setIsMonthSelectOpen(false);
        setIsYearSelectOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsMonthSelectOpen(false);
        setIsYearSelectOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, updateCoords]);

  const isWinamp = theme === 'winamp';
  const isDark = theme === 'dark';
  const isVista = theme === 'vista';
  const isPaperSketch = theme === 'paperSketch';
  const isDefault = theme === 'default';
  const isIndustrial = theme === 'industrial';
  const isTechnical = theme === 'technical';
  const isEditorial = theme === 'editorial';
  const isDashboard = theme === 'dashboard';

  // Format display text
  const formattedDisplay = useMemo(() => {
    if (!parsedDate) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    const day = pad(parsedDate.getDate());
    const monthName = MONTH_NAMES_ID[parsedDate.getMonth()];
    const year = parsedDate.getFullYear();
    return `${day} ${monthName} ${year}`;
  }, [parsedDate]);

  // Calendar generation helpers
  const daysInViewMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDate = (year: number, month: number, day: number) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatted = `${year}-${pad(month + 1)}-${pad(day)}`;
    onChange(formatted);
    setIsOpen(false);
    setIsMonthSelectOpen(false);
    setIsYearSelectOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const t = new Date();
    handleSelectDate(t.getFullYear(), t.getMonth(), t.getDate());
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  // Generate Year options
  const yearOptions = useMemo(() => {
    const start = 2020;
    const end = 2035;
    const list: number[] = [];
    for (let y = start; y <= end; y++) {
      list.push(y);
    }
    return list;
  }, []);

  // Theme styling definitions
  const getThemeStyles = () => {
    if (isWinamp) {
      return {
        inputWrapper: 'bg-black text-[#00FF00] border-2 border-[#00FF00] font-mono shadow-[0_0_8px_rgba(0,255,0,0.3)]',
        dropdown: 'bg-[#121212] text-[#00FF00] border-2 border-[#00FF00] font-mono shadow-[0_0_15px_rgba(0,255,0,0.4)]',
        header: 'bg-[#1a1e22] border-b border-[#00FF00]/40 text-[#00FF00]',
        daySelected: 'bg-[#00FF00] text-black font-black shadow-[0_0_8px_#00FF00]',
        dayToday: 'border border-[#00FF00] text-[#00FF00] font-bold',
        dayNormal: 'text-[#00FF00] hover:bg-[#00FF00]/20 hover:text-white',
        dayOther: 'text-[#00FF00]/30 hover:bg-[#00FF00]/10',
        btnNav: 'hover:bg-[#00FF00]/20 text-[#00FF00] border border-[#00FF00]/40',
        btnToday: 'bg-[#00FF00] text-black font-bold hover:bg-[#00FF00]/80',
        btnQuick: 'bg-[#1a1e22] text-[#00FF00] border border-[#00FF00]/30 hover:bg-[#00FF00]/20',
      };
    }
    if (isIndustrial) {
      return {
        inputWrapper: 'bg-[#1A1D23] text-[#E2E8F0] border border-[rgba(226,232,240,0.15)] hover:border-[#2DD4BF]/50 focus-within:border-[#2DD4BF] focus-within:ring-2 focus-within:ring-[#2DD4BF]/20 font-[\'JetBrains_Mono\'] uppercase tracking-wider',
        dropdown: 'bg-[#1A1D23] text-[#E2E8F0] border border-[rgba(226,232,240,0.15)] shadow-2xl rounded-[6px] font-[\'JetBrains_Mono\']',
        header: 'bg-[#0F1115] border-b border-[rgba(226,232,240,0.1)] text-[#E2E8F0] font-[\'Syne\']',
        daySelected: 'bg-[#2DD4BF] text-[#0F1115] font-black shadow-md rounded-[4px]',
        dayToday: 'border border-[#2DD4BF] text-[#2DD4BF] font-bold rounded-[4px]',
        dayNormal: 'text-[#E2E8F0] hover:bg-white/10 rounded-[4px]',
        dayOther: 'text-[#E2E8F0]/30 hover:bg-white/5 rounded-[4px]',
        btnNav: 'hover:bg-white/10 text-[#E2E8F0] border border-[rgba(226,232,240,0.15)] rounded-[4px]',
        btnToday: 'bg-[#2DD4BF] text-[#0F1115] font-bold hover:bg-[#26b8a8] rounded-[4px]',
        btnQuick: 'bg-[#0F1115] text-[#E2E8F0] border border-[rgba(226,232,240,0.15)] hover:bg-white/10 rounded-[4px]',
      };
    }
    if (isDark) {
      return {
        inputWrapper: 'bg-[#222222] text-[#E0E0E0] border border-[#333333] hover:border-[#10B981]/50 focus-within:border-[#10B981] focus-within:ring-2 focus-within:ring-[#10B981]/20',
        dropdown: 'bg-[#1E1E1E] text-[#E0E0E0] border border-[#333333] shadow-2xl',
        header: 'bg-[#2A2A2A] border-b border-[#333333] text-white',
        daySelected: 'bg-[#10B981] text-white font-black shadow-md',
        dayToday: 'border border-[#10B981] text-[#10B981] font-bold',
        dayNormal: 'text-[#E0E0E0] hover:bg-white/10',
        dayOther: 'text-white/20 hover:bg-white/5',
        btnNav: 'hover:bg-white/10 text-white/80 hover:text-white border border-[#333333]',
        btnToday: 'bg-[#10B981] text-white font-bold hover:bg-[#059669]',
        btnQuick: 'bg-white/5 text-[#E0E0E0] border border-[#333333] hover:bg-white/10',
      };
    }
    if (isVista) {
      return {
        inputWrapper: 'bg-white/70 text-slate-900 border border-white/80 hover:border-sky-400 focus-within:ring-2 focus-within:ring-sky-400/40 backdrop-blur-md shadow-2xs',
        dropdown: 'bg-white/75 text-slate-900 border border-white/85 shadow-[0_20px_50px_rgba(14,116,224,0.25)] ring-1 ring-sky-300/30 backdrop-blur-2xl rounded-2xl overflow-hidden',
        header: 'bg-gradient-to-r from-sky-200/50 to-blue-100/50 border-b border-white/60 text-sky-950 backdrop-blur-md',
        daySelected: 'bg-gradient-to-b from-sky-400 to-blue-600 text-white font-black shadow-md border border-white/60',
        dayToday: 'border border-sky-500 text-sky-700 font-bold bg-sky-100/40',
        dayNormal: 'text-slate-800 hover:bg-white/80 hover:text-sky-950 hover:shadow-2xs',
        dayOther: 'text-slate-400 hover:bg-white/40',
        btnNav: 'hover:bg-white/80 text-sky-900 border border-white/70 bg-white/40 backdrop-blur-xs',
        btnToday: 'bg-gradient-to-b from-sky-400 to-blue-600 text-white font-bold hover:from-sky-500 hover:to-blue-700 shadow-xs border border-white/50',
        btnQuick: 'bg-white/60 text-sky-900 border border-white/70 hover:bg-white/90 backdrop-blur-xs shadow-2xs',
      };
    }
    if (isPaperSketch) {
      return {
        inputWrapper: 'bg-white text-[#2b2b2b] border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] font-[\'Gaegu\'] font-bold',
        dropdown: 'bg-white text-[#2b2b2b] border-[2.5px] border-[#2b2b2b] shadow-[6px_6px_0px_#2b2b2b] rounded-xl overflow-hidden font-[\'Gaegu\']',
        header: 'bg-[#f2efeb] border-b-2 border-dashed border-[#2b2b2b] text-[#2b2b2b]',
        daySelected: 'bg-[#ff4747] text-white font-black shadow-[2px_2px_0px_#2b2b2b] border border-[#2b2b2b]',
        dayToday: 'border-2 border-[#2ec4b6] text-[#2b2b2b] font-bold bg-[#2ec4b6]/20',
        dayNormal: 'text-[#2b2b2b] hover:bg-[#2ec4b6]/30 hover:text-[#2b2b2b] font-bold',
        dayOther: 'text-[#2b2b2b]/30 hover:bg-[#2b2b2b]/5',
        btnNav: 'hover:bg-[#2ec4b6] text-[#2b2b2b] border-2 border-[#2b2b2b] shadow-[1.5px_1.5px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5',
        btnToday: 'bg-[#2ec4b6] text-[#2b2b2b] font-bold hover:bg-[#26a89c] border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]',
        btnQuick: 'bg-[#f2efeb] text-[#2b2b2b] border-2 border-[#2b2b2b] hover:bg-[#2ec4b6]/30 shadow-[1.5px_1.5px_0px_#2b2b2b]',
      };
    }
    // Default Clean Light Theme
    return {
      inputWrapper: 'bg-white text-[#011627] border border-slate-300 hover:border-[#2EC4B6] focus-within:border-[#2EC4B6] focus-within:ring-2 focus-within:ring-[#2EC4B6]/20 shadow-xs',
      dropdown: 'bg-white text-[#011627] border border-slate-200 shadow-2xl',
      header: 'bg-[#F6F7F8] border-b border-slate-200 text-[#011627]',
      daySelected: 'bg-[#2EC4B6] text-white font-black shadow-md',
      dayToday: 'border-2 border-[#2EC4B6] text-[#2EC4B6] font-bold',
      dayNormal: 'text-slate-700 hover:bg-slate-100 hover:text-[#011627]',
      dayOther: 'text-slate-400 hover:bg-slate-50',
      btnNav: 'hover:bg-slate-200 text-slate-700 border border-slate-200',
      btnToday: 'bg-[#2EC4B6] text-white font-bold hover:bg-[#209c91]',
      btnQuick: 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200',
    };
  };

  const s = getThemeStyles();

  return (
    <div className={`relative inline-block w-full ${isOpen ? 'z-[99999]' : 'z-10'} ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider mb-1 opacity-80">
          {label}
        </label>
      )}

      {/* Trigger Field */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-3 py-2 text-xs rounded-xl cursor-pointer select-none transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${s.inputWrapper}`}
      >
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <CalendarIcon className="h-4 w-4 shrink-0 opacity-70" />
          <span className={`truncate font-medium ${!value ? 'opacity-50' : 'font-bold'}`}>
            {formattedDisplay || placeholder}
          </span>
        </div>

        <div className="flex items-center space-x-1 shrink-0 ml-1.5">
          {value && allowClear && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              title="Hapus tanggal"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Custom Calendar Popover rendered via Portal to avoid overflow clipping */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            zIndex: 100000,
          }}
          className={`w-72 sm:w-80 rounded-2xl p-3.5 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 ${s.dropdown} animate-in fade-in slide-in-from-top-2 duration-150`}
        >
          {/* Header (Bulan, Tahun, Navigasi) */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-current/10">
            <button
              type="button"
              onClick={handlePrevMonth}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${s.btnNav}`}
              title="Bulan sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Selector Bulan & Tahun Dropdown Toggle */}
            <div className="flex items-center space-x-1.5 font-bold text-xs sm:text-sm">
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMonthSelectOpen(!isMonthSelectOpen);
                    setIsYearSelectOpen(false);
                  }}
                  className="p-[5px] px-2 mb-[3px] rounded-[5px] hover:bg-current/10 flex items-center justify-between gap-1.5 cursor-pointer transition-all duration-300"
                >
                  <span>{MONTH_NAMES_ID[viewMonth]}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className={`h-2.5 w-3.5 shrink-0 transition-transform duration-300 ease-in-out ${
                      isMonthSelectOpen ? 'rotate-0' : '-rotate-90'
                    }`}
                    fill="currentColor"
                  >
                    <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
                  </svg>
                </button>

                {isMonthSelectOpen && (
                  <div
                    className={`absolute top-[calc(100%+2px)] left-0 min-w-36 max-h-48 overflow-y-auto p-[5px] rounded-[5px] z-110 shadow-xl border border-current/10 flex flex-col gap-1 transition-all duration-300 ${s.dropdown}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {MONTH_NAMES_ID.map((mName, idx) => (
                      <button
                        key={`${mName}-${idx}`}
                        type="button"
                        onClick={() => {
                          setViewMonth(idx);
                          setIsMonthSelectOpen(false);
                        }}
                        className={`w-full text-left p-[5px] px-2 text-xs rounded-[5px] transition-all duration-300 cursor-pointer flex items-center justify-between gap-2 ${
                          viewMonth === idx ? s.btnToday : 'hover:bg-current/10'
                        }`}
                      >
                        <span>{mName}</span>
                        {viewMonth === idx && <Check className="h-3 w-3" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsYearSelectOpen(!isYearSelectOpen);
                    setIsMonthSelectOpen(false);
                  }}
                  className="p-[5px] px-2 mb-[3px] rounded-[5px] hover:bg-current/10 flex items-center justify-between gap-1.5 cursor-pointer transition-all duration-300"
                >
                  <span>{viewYear}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className={`h-2.5 w-3.5 shrink-0 transition-transform duration-300 ease-in-out ${
                      isYearSelectOpen ? 'rotate-0' : '-rotate-90'
                    }`}
                    fill="currentColor"
                  >
                    <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
                  </svg>
                </button>

                {isYearSelectOpen && (
                  <div
                    className={`absolute top-[calc(100%+2px)] right-0 min-w-28 max-h-48 overflow-y-auto p-[5px] rounded-[5px] z-110 shadow-xl border border-current/10 flex flex-col gap-1 transition-all duration-300 ${s.dropdown}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {yearOptions.map((yr, idx) => (
                      <button
                        key={`${yr}-${idx}`}
                        type="button"
                        onClick={() => {
                          setViewYear(yr);
                          setIsYearSelectOpen(false);
                        }}
                        className={`w-full text-left p-[5px] px-2 text-xs rounded-[5px] transition-all duration-300 cursor-pointer flex items-center justify-between gap-2 ${
                          viewYear === yr ? s.btnToday : 'hover:bg-current/10'
                        }`}
                      >
                        <span>{yr}</span>
                        {viewYear === yr && <Check className="h-3 w-3" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${s.btnNav}`}
              title="Bulan berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Hari dalam seminggu header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1 text-[11px] font-black uppercase opacity-60">
            {DAY_NAMES_SHORT.map((dayName, idx) => (
              <div key={`${dayName}-${idx}`} className={`py-1 ${idx === 0 ? 'text-rose-500' : ''}`}>
                {dayName}
              </div>
            ))}
          </div>

          {/* Grid Tanggal */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Hari bulan sebelumnya */}
            {Array.from({ length: firstDayIndex }).map((_, i) => {
              const dayNum = prevMonthDays - firstDayIndex + i + 1;
              const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
              const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
              return (
                <button
                  key={`prev-${i}`}
                  type="button"
                  onClick={() => handleSelectDate(prevYear, prevMonth, dayNum)}
                  className={`h-8 w-full rounded-lg flex items-center justify-center font-medium transition-colors cursor-pointer ${s.dayOther}`}
                >
                  {dayNum}
                </button>
              );
            })}

            {/* Hari bulan ini */}
            {Array.from({ length: daysInViewMonth }).map((_, i) => {
              const dayNum = i + 1;
              const pad = (n: number) => String(n).padStart(2, '0');
              const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(dayNum)}`;
              const isSelected = value === dateStr;
              const isToday =
                today.getDate() === dayNum &&
                today.getMonth() === viewMonth &&
                today.getFullYear() === viewYear;

              let cellStyle = s.dayNormal;
              if (isSelected) {
                cellStyle = s.daySelected;
              } else if (isToday) {
                cellStyle = s.dayToday;
              }

              return (
                <button
                  key={`curr-${dayNum}`}
                  type="button"
                  onClick={() => handleSelectDate(viewYear, viewMonth, dayNum)}
                  className={`h-8 w-full rounded-lg flex items-center justify-center text-xs transition-all cursor-pointer ${cellStyle}`}
                >
                  {dayNum}
                </button>
              );
            })}

            {/* Hari bulan berikutnya untuk melengkapi baris */}
            {(() => {
              const totalCells = firstDayIndex + daysInViewMonth;
              const remainder = totalCells % 7;
              const trailingCount = remainder > 0 ? 7 - remainder : 0;
              return Array.from({ length: trailingCount }).map((_, i) => {
                const dayNum = i + 1;
                const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
                const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
                return (
                  <button
                    key={`next-${i}`}
                    type="button"
                    onClick={() => handleSelectDate(nextYear, nextMonth, dayNum)}
                    className={`h-8 w-full rounded-lg flex items-center justify-center font-medium transition-colors cursor-pointer ${s.dayOther}`}
                  >
                    {dayNum}
                  </button>
                );
              });
            })()}
          </div>

          {/* Quick Footer Action Buttons */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-current/10">
            <button
              type="button"
              onClick={handleSelectToday}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer ${s.btnQuick}`}
            >
              <Clock className="h-3.5 w-3.5 opacity-70" />
              <span>Hari Ini</span>
            </button>

            {value && allowClear && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
              >
                Hapus
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
