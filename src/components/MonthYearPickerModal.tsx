import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, X, Sparkles } from 'lucide-react';

interface MonthYearPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: number; // 1-12
  selectedYear: number;
  onSelect: (month: number, year: number) => void;
}

const MONTH_DATA = [
  { num: 1, name: 'Januari', short: 'Jan' },
  { num: 2, name: 'Februari', short: 'Feb' },
  { num: 3, name: 'Maret', short: 'Mar' },
  { num: 4, name: 'April', short: 'Apr' },
  { num: 5, name: 'Mei', short: 'Mei' },
  { num: 6, name: 'Juni', short: 'Jun' },
  { num: 7, name: 'Juli', short: 'Jul' },
  { num: 8, name: 'Agustus', short: 'Agu' },
  { num: 9, name: 'September', short: 'Sep' },
  { num: 10, name: 'Oktober', short: 'Okt' },
  { num: 11, name: 'November', short: 'Nov' },
  { num: 12, name: 'Desember', short: 'Des' },
];

export const MonthYearPickerModal: React.FC<MonthYearPickerModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  selectedYear,
  onSelect,
}) => {
  const [tempMonth, setTempMonth] = useState<number>(selectedMonth);
  const [tempYear, setTempYear] = useState<number>(selectedYear);

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setTempMonth(selectedMonth);
      setTempYear(selectedYear);
    }
  }, [isOpen, selectedMonth, selectedYear]);

  if (!isOpen) return null;

  const handlePrevYear = () => {
    setTempYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    setTempYear((prev) => prev + 1);
  };

  const handleSetCurrentMonthYear = () => {
    const now = new Date();
    setTempMonth(now.getMonth() + 1);
    setTempYear(now.getFullYear());
  };

  const handleApply = (m: number = tempMonth, y: number = tempYear) => {
    onSelect(m, y);
    onClose();
  };

  // Generate dynamic year pills centered around current tempYear
  const startYear = Math.max(2020, tempYear - 4);
  const quickYears = Array.from({ length: 12 }, (_, i) => startYear + i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xs sm:max-w-sm rounded-xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Compact Header */}
        <div className="flex items-center justify-between bg-[#297373] px-3.5 py-2.5 text-white">
          <div className="flex items-center space-x-1.5">
            <CalendarIcon className="h-4 w-4 text-teal-200" />
            <h3 className="text-xs font-bold tracking-tight">Pilih Bulan & Tahun</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-teal-200 hover:bg-teal-700 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3.5 space-y-3">
          {/* Year Navigation Bar */}
          <div className="flex items-center justify-between bg-slate-100 rounded-lg p-1.5 border border-slate-200">
            <button
              type="button"
              onClick={handlePrevYear}
              className="rounded p-1 text-slate-700 hover:bg-white hover:text-slate-900 shadow-2xs transition-colors cursor-pointer"
              title="Tahun Sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center space-x-1.5">
              <input
                type="number"
                value={tempYear}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) setTempYear(val);
                }}
                className="w-18 text-center text-sm font-extrabold font-mono text-slate-900 bg-white border border-slate-300 rounded px-1 py-0.5 focus:outline-teal-600"
              />
            </div>

            <button
              type="button"
              onClick={handleNextYear}
              className="rounded p-1 text-slate-700 hover:bg-white hover:text-slate-900 shadow-2xs transition-colors cursor-pointer"
              title="Tahun Berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Year Scrollable Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {quickYears.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setTempYear(yr)}
                className={`rounded px-2 py-0.5 font-mono font-bold transition-all shrink-0 cursor-pointer ${
                  tempYear === yr
                    ? 'bg-[#297373] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* 12 Months Grid - Compact 3 columns */}
          <div>
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Bulan
              </span>
              <button
                type="button"
                onClick={handleSetCurrentMonthYear}
                className="flex items-center space-x-1 text-[11px] font-bold text-[#297373] hover:underline cursor-pointer"
              >
                <Sparkles className="h-3 w-3" />
                <span>Bulan Ini</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {MONTH_DATA.map((m) => {
                const isSelected = tempMonth === m.num;
                return (
                  <button
                    key={m.num}
                    type="button"
                    onClick={() => {
                      setTempMonth(m.num);
                      handleApply(m.num, tempYear);
                    }}
                    className={`rounded-lg py-2 px-1.5 text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#297373] text-white border-teal-800 shadow-xs ring-1.5 ring-teal-400'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-teal-50 hover:border-teal-300'
                    }`}
                  >
                    <div className="text-xs font-black leading-tight">{m.short}</div>
                    <div className="text-[10px] font-medium opacity-90 truncate leading-tight mt-0.5">
                      {m.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between bg-slate-50 px-3.5 py-2 border-t border-slate-200">
          <span className="text-xs font-bold text-slate-700">
            {MONTH_DATA.find((m) => m.num === tempMonth)?.name} {tempYear}
          </span>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => handleApply(tempMonth, tempYear)}
              className="flex items-center space-x-1 rounded bg-[#297373] px-3 py-1 text-xs font-bold text-white shadow-2xs hover:bg-teal-800 transition-colors cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Pilih</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
