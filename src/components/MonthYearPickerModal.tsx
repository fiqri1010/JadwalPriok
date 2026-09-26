import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppTheme } from '../types';

interface MonthYearPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: number; // 1-12
  selectedYear: number;
  onSelect: (month: number, year: number) => void;
  theme?: AppTheme;
}

const MONTH_DATA = [
  { num: 1, name: 'Januari' },
  { num: 2, name: 'Februari' },
  { num: 3, name: 'Maret' },
  { num: 4, name: 'April' },
  { num: 5, name: 'Mei' },
  { num: 6, name: 'Juni' },
  { num: 7, name: 'Juli' },
  { num: 8, name: 'Agustus' },
  { num: 9, name: 'September' },
  { num: 10, name: 'Oktober' },
  { num: 11, name: 'November' },
  { num: 12, name: 'Desember' },
];

export const MonthYearPickerModal: React.FC<MonthYearPickerModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  selectedYear,
  onSelect,
  theme = 'default',
}) => {
  const [tempYear, setTempYear] = useState<number>(selectedYear);

  const isWinamp = theme === 'winamp';
  const isDarkFluid = theme === 'darkFluid';
  const isDark = theme === 'dark';
  const isVista = theme === 'vista';
  const isDefault = theme === 'default';

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setTempYear(selectedYear);
    }
  }, [isOpen, selectedYear]);

  if (!isOpen) return null;

  const handlePrevYear = () => {
    setTempYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    setTempYear((prev) => prev + 1);
  };

  // Auto-submit instantly when clicking any month
  const handleSelectMonth = (monthNum: number) => {
    onSelect(monthNum, tempYear);
    onClose();
  };

  // Auto-submit instantly to current running month & year
  const handleSelectCurrentMonth = () => {
    const now = new Date();
    onSelect(now.getMonth() + 1, now.getFullYear());
    onClose();
  };

  // Theme styling configurations for frameless minimalist aesthetic
  const getThemeClasses = () => {
    if (isWinamp) {
      return {
        cardBg: 'bg-black text-[#00FF00] border-2 border-[#00FF00] rounded-none shadow-none font-mono',
        headerIconBg: 'bg-[#00FF00]/15 text-[#00FF00] border border-[#00FF00]/40',
        titleColor: 'text-[#00FF00]',
        subtitleColor: 'text-[#00FF00]/70',
        stepperBg: 'bg-zinc-950 border border-zinc-800 text-[#00FF00]',
        stepperBtn: 'hover:bg-[#00FF00]/20 text-[#00FF00]',
        monthGhost: 'text-[#00FF00] hover:bg-[#00FF00]/20 active:bg-[#00FF00]/30 rounded-none',
        monthActive: 'bg-[#00FF00] text-black font-black rounded-none shadow-none',
        footerBtnCancel: 'bg-black text-[#00FF00] border border-[#00FF00] hover:bg-zinc-900 rounded-none',
        todayBtnText: 'text-[#00FF00] hover:underline',
      };
    }

    if (isDarkFluid) {
      return {
        cardBg: 'bg-[#1D1B20] text-[#E6E0E9] border border-white/10 rounded-2xl shadow-2xl',
        headerIconBg: 'bg-[#D0BCFF]/15 text-[#D0BCFF] border border-[#D0BCFF]/30',
        titleColor: 'text-[#E6E0E9]',
        subtitleColor: 'text-[#CAC4D0]',
        stepperBg: 'bg-[#141218] border border-white/10 text-[#E6E0E9]',
        stepperBtn: 'hover:bg-white/10 text-[#E6E0E9]',
        monthGhost: 'text-[#E6E0E9] hover:bg-white/10 active:bg-white/15 rounded-xl',
        monthActive: 'bg-[#D0BCFF] text-[#381E72] font-black rounded-xl shadow-md',
        footerBtnCancel: 'bg-[#2B2930] text-[#CAC4D0] border border-white/10 hover:bg-[#36343B] rounded-xl',
        todayBtnText: 'text-[#D0BCFF] hover:text-[#E8DEF8]',
      };
    }

    if (isDark) {
      return {
        cardBg: 'bg-[#1E1E1E] text-slate-100 border border-[#333333] rounded-2xl shadow-2xl',
        headerIconBg: 'bg-teal-500/15 text-teal-400 border border-teal-500/30',
        titleColor: 'text-white',
        subtitleColor: 'text-slate-400',
        stepperBg: 'bg-[#161616] border border-slate-800 text-slate-100',
        stepperBtn: 'hover:bg-white/10 text-white',
        monthGhost: 'text-slate-300 hover:bg-white/10 active:bg-white/15 rounded-xl',
        monthActive: 'bg-teal-500 text-slate-950 font-black rounded-xl shadow-md',
        footerBtnCancel: 'bg-[#252525] text-slate-300 border border-slate-700 hover:bg-[#303030] rounded-xl',
        todayBtnText: 'text-teal-400 hover:text-teal-300',
      };
    }

    if (isVista) {
      return {
        cardBg: 'bg-white/85 text-slate-900 border border-white/80 rounded-2xl shadow-[0_20px_50px_rgba(14,116,224,0.25)] backdrop-blur-2xl',
        headerIconBg: 'bg-sky-500/15 text-sky-600 border border-sky-400/40',
        titleColor: 'text-slate-900',
        subtitleColor: 'text-slate-600',
        stepperBg: 'bg-sky-50/70 border border-sky-200/80 text-slate-900',
        stepperBtn: 'hover:bg-white/80 text-sky-900',
        monthGhost: 'text-slate-700 hover:bg-sky-100/70 active:bg-sky-200/60 rounded-xl',
        monthActive: 'bg-gradient-to-b from-[#38bdf8] to-[#2563eb] text-white font-black rounded-xl shadow-md border border-white/50',
        footerBtnCancel: 'bg-white/80 text-slate-700 border border-slate-200 hover:bg-white rounded-xl',
        todayBtnText: 'text-sky-600 hover:text-sky-700',
      };
    }

    // Default light / teal theme
    return {
      cardBg: 'bg-white text-[#011627] border border-slate-200/80 rounded-2xl shadow-2xl',
      headerIconBg: 'bg-teal-50 text-[#0E7C7B] border border-teal-200/80',
      titleColor: 'text-[#011627]',
      subtitleColor: 'text-slate-500',
      stepperBg: 'bg-slate-50 border border-slate-200 text-slate-900',
      stepperBtn: 'hover:bg-slate-200 text-slate-700',
      monthGhost: 'text-slate-700 hover:bg-slate-100 active:bg-slate-200 rounded-xl',
      monthActive: 'bg-[#2EC4B6] text-white font-black rounded-xl shadow-md',
      footerBtnCancel: 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 rounded-xl',
      todayBtnText: 'text-teal-700 hover:text-teal-800',
    };
  };

  const c = getThemeClasses();

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-sm flex flex-col p-4 sm:p-5 gap-3.5 transition-all duration-200 overflow-hidden ${c.cardBg}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-0.5">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${c.headerIconBg}`}>
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className={`text-sm sm:text-base font-black tracking-tight leading-tight truncate ${c.titleColor}`}>
                  Pilih Bulan & Tahun
                </h2>
                <p className={`text-[11px] truncate font-medium ${c.subtitleColor}`}>
                  Klik bulan untuk langsung membuka
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              title="Tutup (Esc)"
              className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Clean Year Selector Stepper (Placed cleanly right under title) */}
          <div className={`p-1.5 rounded-xl flex items-center justify-between transition-all ${c.stepperBg}`}>
            <button
              type="button"
              onClick={handlePrevYear}
              title="Tahun Sebelumnya"
              className={`p-1.5 transition-all cursor-pointer rounded-lg hover:scale-105 active:scale-95 ${c.stepperBtn}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-1">
              <input
                type="number"
                value={tempYear}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setTempYear(val);
                }}
                className="w-20 text-center text-sm font-black font-mono bg-transparent border-none outline-none cursor-text select-text"
              />
            </div>

            <button
              type="button"
              onClick={handleNextYear}
              title="Tahun Berikutnya"
              className={`p-1.5 transition-all cursor-pointer rounded-lg hover:scale-105 active:scale-95 ${c.stepperBtn}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Months 3x4 Grid (Floating directly without gray background box or borders) */}
          <div className="grid grid-cols-3 gap-1.5 py-1">
            {MONTH_DATA.map((m) => {
              const isSelected = selectedMonth === m.num && selectedYear === tempYear;
              return (
                <button
                  key={m.num}
                  type="button"
                  onClick={() => handleSelectMonth(m.num)}
                  className={`py-2 px-1 text-center text-xs transition-all duration-150 cursor-pointer flex items-center justify-center active:scale-95 ${
                    isSelected ? c.monthActive : c.monthGhost
                  }`}
                  title={`Buka ${m.name} ${tempYear}`}
                >
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>

          {/* Minimalist Footer with Instant Auto-Submit "Bulan Ini" & "Batal" */}
          <div className="flex items-center justify-between pt-1 border-t border-current/10">
            <button
              type="button"
              onClick={handleSelectCurrentMonth}
              className={`flex items-center space-x-1.5 text-xs font-bold transition-all cursor-pointer ${c.todayBtnText}`}
              title="Langsung buka bulan dan tahun saat ini"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Bulan Ini</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${c.footerBtnCancel}`}
            >
              Batal
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
