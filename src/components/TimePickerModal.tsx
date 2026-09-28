import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Clock, 
  Check, 
  X, 
  Trash2, 
  Sparkles, 
  AlertTriangle,
  Info,
  Keyboard
} from 'lucide-react';
import { AppTheme } from '../types';

interface UnifiedTimeValues {
  jamMasuk?: string;
  jamPulang?: string;
  absenCeisa?: string;
}

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value?: string; // HH:mm or ""
  onSelect?: (timeStr: string) => void;
  onApplyUnified?: (values: UnifiedTimeValues) => void;
  field?: 'jamMasuk' | 'jamPulang' | 'absenCeisa' | 'unified';
  existingJamMasuk?: string;
  existingJamPulang?: string;
  existingAbsenCeisa?: string;
  theme?: AppTheme;
}

const PRESET_TIMES = ['07:30', '08:00', '08:30', '12:30', '16:00', '17:00', '20:00', '22:00'];

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  isOpen,
  onClose,
  title,
  value = '',
  onSelect,
  onApplyUnified,
  field = 'unified',
  existingJamMasuk = '',
  existingJamPulang = '',
  existingAbsenCeisa = '',
  theme,
}) => {
  const isWinamp = theme === 'winamp';
  const isVista = theme === 'vista';
  const isDark = theme === 'dark';
  const isDarkFluid = theme === 'darkFluid';

  // Active target field being edited on clock face: 'jamMasuk' | 'jamPulang' | 'absenCeisa'
  const [activeTab, setActiveTab] = useState<'jamMasuk' | 'jamPulang' | 'absenCeisa'>(() => {
    if (field === 'jamPulang') return 'jamPulang';
    if (field === 'absenCeisa') return 'absenCeisa';
    return 'jamMasuk';
  });

  // State for all 3 time values in unified mode
  const [jamMasukVal, setJamMasukVal] = useState<string>(existingJamMasuk || (field === 'jamMasuk' ? value : ''));
  const [jamPulangVal, setJamPulangVal] = useState<string>(existingJamPulang || (field === 'jamPulang' ? value : ''));
  const [absenCeisaVal, setAbsenCeisaVal] = useState<string>(existingAbsenCeisa || (field === 'absenCeisa' ? value : ''));

  const [hour, setHour] = useState<number>(8);
  const [minute, setMinute] = useState<number>(0);
  const [hourInput, setHourInput] = useState<string>('08');
  const [minuteInput, setMinuteInput] = useState<string>('00');
  const [mode, setMode] = useState<'hour' | 'minute'>('hour');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showWarningFeedback, setShowWarningFeedback] = useState<boolean>(false);

  const clockRef = useRef<HTMLDivElement>(null);
  const hourInputRef = useRef<HTMLInputElement>(null);
  const minuteInputRef = useRef<HTMLInputElement>(null);
  const handleApplyRef = useRef<() => void>(() => {});

  // Sync internal hour/minute with activeTab value
  const syncClockWithActiveValue = useCallback((activeTarget: 'jamMasuk' | 'jamPulang' | 'absenCeisa', valStr: string) => {
    let initH = 8;
    let initM = 0;
    if (valStr && valStr.includes(':')) {
      const [h, m] = valStr.split(':').map(Number);
      initH = isNaN(h) ? 8 : Math.max(0, Math.min(23, h));
      initM = isNaN(m) ? 0 : Math.max(0, Math.min(59, m));
    } else {
      if (activeTarget === 'jamPulang') {
        initH = 17;
        initM = 0;
      } else if (activeTarget === 'absenCeisa') {
        initH = 7;
        initM = 30;
      } else {
        initH = 7;
        initM = 30;
      }
    }
    setHour(initH);
    setMinute(initM);
    setHourInput(String(initH).padStart(2, '0'));
    setMinuteInput(String(initM).padStart(2, '0'));
  }, []);

  // Initialize values when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      const initialMasuk = existingJamMasuk || (field === 'jamMasuk' ? value : '');
      const initialPulang = existingJamPulang || (field === 'jamPulang' ? value : '');
      const initialCeisa = existingAbsenCeisa || (field === 'absenCeisa' ? value : '');

      setJamMasukVal(initialMasuk);
      setJamPulangVal(initialPulang);
      setAbsenCeisaVal(initialCeisa);

      const targetTab = field === 'jamPulang' ? 'jamPulang' : field === 'absenCeisa' ? 'absenCeisa' : 'jamMasuk';
      setActiveTab(targetTab);

      const activeVal = targetTab === 'jamPulang' ? initialPulang : targetTab === 'absenCeisa' ? initialCeisa : initialMasuk;
      syncClockWithActiveValue(targetTab, activeVal);
      setMode('hour');
      setShowWarningFeedback(false);

      const timer = setTimeout(() => {
        if (hourInputRef.current) {
          hourInputRef.current.focus();
          hourInputRef.current.select();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, field, value, existingJamMasuk, existingJamPulang, existingAbsenCeisa, syncClockWithActiveValue]);

  // Update active tab value whenever hour/minute changes
  const updateActiveTabValue = (newH: number, newM: number) => {
    const formatted = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    if (activeTab === 'jamMasuk') {
      setJamMasukVal(formatted);
    } else if (activeTab === 'jamPulang') {
      setJamPulangVal(formatted);
    } else if (activeTab === 'absenCeisa') {
      setAbsenCeisaVal(formatted);
    }
  };

  const handleSwitchTab = (target: 'jamMasuk' | 'jamPulang' | 'absenCeisa') => {
    setActiveTab(target);
    const targetVal = target === 'jamMasuk' ? jamMasukVal : target === 'jamPulang' ? jamPulangVal : absenCeisaVal;
    syncClockWithActiveValue(target, targetVal);
  };

  const formatHour = String(hour).padStart(2, '0');
  const formatMinute = String(minute).padStart(2, '0');
  const currentTimeStr = `${formatHour}:${formatMinute}`;

  // Validation: Check if jamMasuk < jamPulang (except for overnight shifts like 17:00 - 04:30)
  let validationError: string | null = null;
  let validationRuleSubtext: string | null = null;

  const isInvalid = false; // Allow all shift timings including overnight

  // Kalkulasi sudut jarum jam & jarum menit
  // Jam: 12 jam putaran (30 deg per jam) + pergeseran menit
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  // Menit: 360 / 60 = 6 deg per menit
  const minuteAngle = minute * 6;

  // Interaksi Drag/Click pada Dial Jam Tangan
  const handleDialInteraction = (clientX: number, clientY: number) => {
    if (!clockRef.current) return;
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = clientX - centerX;
    const y = clientY - centerY;

    // Jarak dari pusat
    const radius = Math.sqrt(x * x + y * y);
    const maxRadius = rect.width / 2;

    // Hitung sudut (0 derajat di jam 12 / atas)
    let angleRad = Math.atan2(y, x); // -PI to PI
    let angleDeg = (angleRad * 180) / Math.PI + 90;
    if (angleDeg < 0) angleDeg += 360;

    if (mode === 'hour') {
      // 24 Hour Logic: Jika radius di dalam lingkaran kecil (inner circle) -> 13..00/23
      const isInner = radius < maxRadius * 0.65;
      let rawHour = Math.round(angleDeg / 30) % 12; // 0..11
      if (rawHour === 0) rawHour = 12; // 12 standard

      let finalH: number;
      if (isInner) {
        // Inner circle: 13..23, 00
        finalH = rawHour === 12 ? 0 : rawHour + 12;
      } else {
        // Outer circle: 1..12 (atau pertahankan PM jika sebelumnya > 12)
        finalH = rawHour === 12 ? 12 : rawHour;
      }
      setHour(finalH);
      setHourInput(String(finalH).padStart(2, '0'));
      updateActiveTabValue(finalH, minute);
    } else {
      // Minute Logic: Bebas 0 sampai 59 (tiap 6 derajat = 1 menit)
      let rawMin = Math.round(angleDeg / 6) % 60;
      if (rawMin < 0) rawMin += 60;
      setMinute(rawMin);
      setMinuteInput(String(rawMin).padStart(2, '0'));
      updateActiveTabValue(hour, rawMin);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleDialInteraction(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleDialInteraction(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && mode === 'hour') {
      // Otomatis pindah ke pemilihan menit setelah memilih jam
      setMode('minute');
    }
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      handleDialInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length > 0) {
      handleDialInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging && mode === 'hour') {
      setMode('minute');
    }
    setIsDragging(false);
  };

  // Adjustments & Steppers
  const adjustMinute = (delta: number) => {
    let newM = minute + delta;
    let newH = hour;
    while (newM < 0) {
      newM += 60;
      newH = (newH - 1 + 24) % 24;
    }
    while (newM >= 60) {
      newM -= 60;
      newH = (newH + 1) % 24;
    }
    setMinute(newM);
    setHour(newH);
    setMinuteInput(String(newM).padStart(2, '0'));
    setHourInput(String(newH).padStart(2, '0'));
    updateActiveTabValue(newH, newM);
  };

  const adjustHour = (delta: number) => {
    const newH = (hour + delta + 24) % 24;
    setHour(newH);
    setHourInput(String(newH).padStart(2, '0'));
    updateActiveTabValue(newH, minute);
  };

  const handleSetNow = () => {
    const now = new Date();
    const newH = now.getHours();
    const newM = now.getMinutes();
    setHour(newH);
    setMinute(newM);
    setHourInput(String(newH).padStart(2, '0'));
    setMinuteInput(String(newM).padStart(2, '0'));
    updateActiveTabValue(newH, newM);
  };

  const handleApply = () => {
    if (isInvalid) {
      setShowWarningFeedback(true);
      return;
    }
    if (onApplyUnified) {
      onApplyUnified({
        jamMasuk: jamMasukVal,
        jamPulang: jamPulangVal,
        absenCeisa: absenCeisaVal,
      });
    } else if (onSelect) {
      onSelect(`${formatHour}:${formatMinute}`);
    }
    onClose();
  };

  const handleClear = () => {
    let newMasuk = jamMasukVal;
    let newPulang = jamPulangVal;
    let newCeisa = absenCeisaVal;

    if (activeTab === 'jamMasuk') {
      newMasuk = '';
      setJamMasukVal('');
    } else if (activeTab === 'jamPulang') {
      newPulang = '';
      setJamPulangVal('');
    } else if (activeTab === 'absenCeisa') {
      newCeisa = '';
      setAbsenCeisaVal('');
    }

    if (onApplyUnified) {
      onApplyUnified({
        jamMasuk: newMasuk,
        jamPulang: newPulang,
        absenCeisa: newCeisa,
      });
    } else if (onSelect) {
      onSelect('');
    }
    onClose();
  };

  const handleClearAll = () => {
    setJamMasukVal('');
    setJamPulangVal('');
    setAbsenCeisaVal('');
    if (onApplyUnified) {
      onApplyUnified({ jamMasuk: '', jamPulang: '', absenCeisa: '' });
    } else if (onSelect) {
      onSelect('');
    }
    onClose();
  };

  const handlePreset = (time: string) => {
    const [h, m] = time.split(':');
    const parsedH = parseInt(h, 10);
    const parsedM = parseInt(m, 10);
    setHour(parsedH);
    setMinute(parsedM);
    setHourInput(String(parsedH).padStart(2, '0'));
    setMinuteInput(String(parsedM).padStart(2, '0'));
    updateActiveTabValue(parsedH, parsedM);
  };

  // Keyboard Typing Handlers for Hour Input
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw === '') {
      setHourInput('');
      return;
    }
    const val = parseInt(raw, 10);
    if (isNaN(val)) return;

    let finalVal = val;
    if (finalVal > 23) {
      finalVal = Math.min(23, val % 100);
      if (finalVal > 23) finalVal = 23;
    }

    setHour(finalVal);
    setHourInput(raw.length === 1 ? raw : String(finalVal).padStart(2, '0'));

    // Auto-advance ke input menit jika sudah 2 digit atau jika angka awal >= 3
    if (raw.length >= 2 || val >= 3) {
      setMode('minute');
      setTimeout(() => {
        if (minuteInputRef.current) {
          minuteInputRef.current.focus();
          minuteInputRef.current.select();
        }
      }, 10);
    }
  };

  const handleHourKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      adjustHour(1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      adjustHour(-1);
    } else if (e.key === ':' || e.key === 'ArrowRight' || e.key === 'Tab') {
      if (e.key !== 'Tab') e.preventDefault();
      setMode('minute');
      minuteInputRef.current?.focus();
      minuteInputRef.current?.select();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Keyboard Typing Handlers for Minute Input
  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw === '') {
      setMinuteInput('');
      return;
    }
    const val = parseInt(raw, 10);
    if (isNaN(val)) return;

    let finalVal = val;
    if (finalVal > 59) {
      finalVal = 59;
    }

    setMinute(finalVal);
    setMinuteInput(raw.length === 1 ? raw : String(finalVal).padStart(2, '0'));
  };

  const handleMinuteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      adjustMinute(1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      adjustMinute(-1);
    } else if (
      e.key === 'ArrowLeft' ||
      (e.key === 'Backspace' && (minuteInput === '' || e.currentTarget.selectionStart === 0))
    ) {
      e.preventDefault();
      setMode('hour');
      hourInputRef.current?.focus();
      hourInputRef.current?.select();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  handleApplyRef.current = handleApply;

  // Global keydown di level modal untuk tombol Escape dan Enter
  useEffect(() => {
    if (!isOpen) return;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        const activeTag = (document.activeElement?.tagName || '').toLowerCase();
        if (activeTag !== 'button') {
          e.preventDefault();
          handleApplyRef.current();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 sm:top-7 z-[100000] flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-sm animate-in fade-in duration-150 select-none"
      onMouseUp={handleMouseUp}
    >
      <div 
        className={`w-full max-w-sm overflow-hidden tp-modal-card shadow-2xl ${
          isWinamp ? 'font-mono shadow-[4px_4px_0_#000]' : isVista ? 'backdrop-blur-2xl shadow-[0_25px_60px_rgba(14,116,224,0.3)] ring-1 ring-sky-300/30' : ''
        }`}
        data-theme={theme}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 tp-header">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 tp-header-icon" />
            <span className="text-xs font-bold tracking-wide uppercase">{title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 transition-colors cursor-pointer tp-header-close-btn"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-3.5">
          {/* Multi-Field Tab Selector (Masuk / Pulang / Absen CEISA) */}
          <div className="grid grid-cols-3 gap-1 p-1 tp-tabs-container">
            <button
              type="button"
              onClick={() => handleSwitchTab('jamMasuk')}
              className={`py-1.5 px-2 text-xs font-bold transition-all text-center cursor-pointer tp-tab-btn ${
                activeTab === 'jamMasuk' ? 'tp-tab-active shadow-xs' : ''
              }`}
            >
              <div className="text-[9.5px] opacity-75 uppercase tracking-wider font-semibold">Masuk</div>
              <div className="font-mono text-xs font-black">{jamMasukVal || '--:--'}</div>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab('jamPulang')}
              className={`py-1.5 px-2 text-xs font-bold transition-all text-center cursor-pointer tp-tab-btn ${
                activeTab === 'jamPulang' ? 'tp-tab-active shadow-xs' : ''
              }`}
            >
              <div className="text-[9.5px] opacity-75 uppercase tracking-wider font-semibold">Pulang</div>
              <div className="font-mono text-xs font-black">{jamPulangVal || '--:--'}</div>
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab('absenCeisa')}
              className={`py-1.5 px-2 text-xs font-bold transition-all text-center cursor-pointer tp-tab-btn ${
                activeTab === 'absenCeisa' ? 'tp-tab-active shadow-xs' : ''
              }`}
            >
              <div className="text-[9.5px] opacity-75 uppercase tracking-wider font-semibold">CEISA</div>
              <div className="font-mono text-xs font-black">{absenCeisaVal || '--:--'}</div>
            </button>
          </div>

          {/* Warning Banner Jika Tidak Valid */}
          {isInvalid && (
            <div className={`flex items-start space-x-2.5 p-3 duration-150 ${
              isWinamp 
                ? 'rounded-none bg-black border-2 border-rose-500 text-rose-400 font-mono' 
                : 'rounded-lg bg-rose-50 border border-rose-300 text-rose-900 animate-in fade-in zoom-in-95'
            }`}>
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
              <div className="text-xs space-y-1">
                <div className="font-black text-rose-600 flex items-center space-x-1">
                  <span>Waktu Tidak Valid!</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 font-bold ${
                    isWinamp ? 'rounded-none bg-rose-950 text-rose-300 border border-rose-700' : 'rounded bg-rose-200/80 text-rose-950'
                  }`}>
                    jamMasuk &lt; jamPulang
                  </span>
                </div>
                <p className="text-[11.5px] leading-snug font-medium">
                  {validationError}
                </p>
                {validationRuleSubtext && (
                  <p className="text-[10px] font-semibold">
                    💡 {validationRuleSubtext}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Digital Time Display & Mode Switcher */}
          <div className="flex items-center justify-between p-3 transition-colors tp-digital-container">
            <div className="flex items-center space-x-1.5">
              {/* Hour Input Box */}
              <div
                className={`relative flex flex-col items-center justify-center px-2.5 py-1 transition-all cursor-text tp-digital-box ${
                  mode === 'hour'
                    ? (isInvalid ? '!bg-rose-600 !text-white !border-rose-500 shadow-md ring-2 ring-rose-400/60' : 'tp-digital-active shadow-md')
                    : ''
                }`}
                onClick={() => {
                  setMode('hour');
                  hourInputRef.current?.focus();
                  hourInputRef.current?.select();
                }}
              >
                <input
                  ref={hourInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  value={hourInput}
                  onFocus={(e) => {
                    setMode('hour');
                    e.target.select();
                  }}
                  onBlur={() => {
                    setHourInput(String(hour).padStart(2, '0'));
                  }}
                  onChange={handleHourChange}
                  onKeyDown={handleHourKeyDown}
                  className="w-11 text-center font-mono text-2xl font-black bg-transparent border-none outline-none p-0 selection:bg-white/30 cursor-text text-inherit"
                  aria-label="Ketik Jam (00-23)"
                  title="Klik untuk ketik jam lewat keyboard (00-23)"
                />
                <span className="block text-[8px] tracking-wider font-sans uppercase font-bold text-center select-none tp-digital-subtext">
                  Jam
                </span>
              </div>

              <span className={`text-2xl font-mono font-bold select-none animate-pulse ${
                isInvalid ? 'text-rose-500' : 'tp-colon'
              }`}>:</span>

              {/* Minute Input Box */}
              <div
                className={`relative flex flex-col items-center justify-center px-2.5 py-1 transition-all cursor-text tp-digital-box ${
                  mode === 'minute'
                    ? (isInvalid ? '!bg-rose-600 !text-white !border-rose-500 shadow-md ring-2 ring-rose-400/60' : 'tp-digital-active shadow-md')
                    : ''
                }`}
                onClick={() => {
                  setMode('minute');
                  minuteInputRef.current?.focus();
                  minuteInputRef.current?.select();
                }}
              >
                <input
                  ref={minuteInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  value={minuteInput}
                  onFocus={(e) => {
                    setMode('minute');
                    e.target.select();
                  }}
                  onBlur={() => {
                    setMinuteInput(String(minute).padStart(2, '0'));
                  }}
                  onChange={handleMinuteChange}
                  onKeyDown={handleMinuteKeyDown}
                  className="w-11 text-center font-mono text-2xl font-black bg-transparent border-none outline-none p-0 selection:bg-white/30 cursor-text text-inherit"
                  aria-label="Ketik Menit (00-59)"
                  title="Klik untuk ketik menit lewat keyboard (00-59)"
                />
                <span className="block text-[8px] tracking-wider font-sans uppercase font-bold text-center select-none tp-digital-subtext">
                  Menit
                </span>
              </div>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => adjustMinute(-1)}
                className="px-2 py-1.5 text-xs font-bold font-mono transition-colors cursor-pointer tp-stepper-btn"
                title="Kurangi 1 Menit"
              >
                -1m
              </button>
              <button
                type="button"
                onClick={() => adjustMinute(1)}
                className="px-2 py-1.5 text-xs font-bold font-mono transition-colors cursor-pointer tp-stepper-btn tp-stepper-btn-accent"
                title="Tambah 1 Menit"
              >
                +1m
              </button>
              <button
                type="button"
                onClick={handleSetNow}
                className="flex items-center space-x-1 px-2 py-1.5 text-xs font-semibold transition-colors cursor-pointer tp-stepper-btn tp-stepper-btn-accent"
                title="Set Waktu Saat Ini"
              >
                <Sparkles className="h-3 w-3" />
                <span className="text-[10px]">Now</span>
              </button>
            </div>
          </div>

          {/* Interactive Analog Watch Face (Dial Jam Tangan) */}
          <div className="flex flex-col items-center justify-center pt-1">
            <div
              ref={clockRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative w-52 h-52 sm:w-56 sm:h-56 rounded-full cursor-pointer select-none touch-none tp-dial-surface shadow-xl"
            >
              {/* Watch Bezel Ticks (60 Menit / Detik) */}
              {Array.from({ length: 60 }).map((_, i) => {
                const isMajor = i % 5 === 0;
                const deg = i * 6;
                return (
                  <div
                    key={`tick-${i}`}
                    className="absolute top-0 left-1/2 -translate-x-1/2 origin-bottom pointer-events-none"
                    style={{
                      height: '50%',
                      transform: `rotate(${deg}deg)`,
                    }}
                  >
                    <div
                      className={`w-[1.5px] rounded-full mx-auto ${
                        isMajor ? 'h-2 tp-dial-tick-major' : 'h-1 tp-dial-tick-minor'
                      }`}
                    />
                  </div>
                );
              })}

              {/* Mode: JAM (Hour Dial 1-12 & 13-24) */}
              {mode === 'hour' && (
                <>
                  {/* Outer Circle (1-12) */}
                  {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h, idx) => {
                    const angle = idx * 30; // 0 to 330 deg
                    const rad = (angle - 90) * (Math.PI / 180);
                    const r = 80; // pixel distance from center
                    const isSelected = (hour % 12 === 0 ? 12 : hour % 12) === h && hour <= 12;
                    return (
                      <div
                        key={`h-outer-${h}`}
                        className={`absolute w-6 h-6 -ml-3 -mt-3 flex items-center justify-center text-xs font-bold transition-transform rounded-full tp-dial-num ${
                          isSelected ? 'tp-dial-num-active shadow-md scale-110' : ''
                        }`}
                        style={{
                          left: `calc(50% + ${Math.cos(rad) * r}px)`,
                          top: `calc(50% + ${Math.sin(rad) * r}px)`,
                        }}
                      >
                        {h}
                      </div>
                    );
                  })}

                  {/* Inner Circle (13-00 / 24) */}
                  {[0, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((h, idx) => {
                    const angle = idx * 30;
                    const rad = (angle - 90) * (Math.PI / 180);
                    const r = 52;
                    const isSelected = hour === h;
                    return (
                      <div
                        key={`h-inner-${h}`}
                        className={`absolute w-5 h-5 -ml-2.5 -mt-2.5 flex items-center justify-center text-[10px] font-semibold transition-transform rounded-full tp-dial-sub-num ${
                          isSelected ? 'tp-dial-sub-active font-black shadow-md scale-110' : ''
                        }`}
                        style={{
                          left: `calc(50% + ${Math.cos(rad) * r}px)`,
                          top: `calc(50% + ${Math.sin(rad) * r}px)`,
                        }}
                      >
                        {h === 0 ? '00' : h}
                      </div>
                    );
                  })}
                </>
              )}

              {/* Mode: MENIT (Minute Dial 00-55 per 5m) */}
              {mode === 'minute' && (
                <>
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m, idx) => {
                    const angle = idx * 30;
                    const rad = (angle - 90) * (Math.PI / 180);
                    const r = 78;
                    const isSelected = minute === m;
                    return (
                      <div
                        key={m}
                        className={`absolute w-6 h-6 -ml-3 -mt-3 flex items-center justify-center text-xs font-bold transition-transform rounded-full tp-dial-num ${
                          isSelected ? 'tp-dial-num-active shadow-md scale-110' : ''
                        }`}
                        style={{
                          left: `calc(50% + ${Math.cos(rad) * r}px)`,
                          top: `calc(50% + ${Math.sin(rad) * r}px)`,
                        }}
                      >
                        {String(m).padStart(2, '0')}
                      </div>
                    );
                  })}
                </>
              )}

              {/* JARUM JAM (Hour Hand) */}
              <div
                className="absolute top-1/2 left-1/2 origin-bottom transition-all duration-75 pointer-events-none tp-hand-hour-elem"
                style={{
                  width: '4px',
                  height: '42px',
                  borderRadius: isWinamp ? '0' : '3px',
                  transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
                  boxShadow: 'var(--tp-hand-shadow, 0 0 6px rgba(0, 0, 0, 0.25))',
                }}
              />

              {/* JARUM MENIT (Minute Hand) */}
              <div
                className="absolute top-1/2 left-1/2 origin-bottom transition-all duration-75 pointer-events-none tp-hand-minute-elem"
                style={{
                  width: '2.5px',
                  height: '68px',
                  borderRadius: isWinamp ? '0' : '2px',
                  transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
                  boxShadow: 'var(--tp-hand-shadow, 0 0 8px rgba(0, 0, 0, 0.25))',
                }}
              />

              {/* Center Pivot Pin */}
              <div 
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none tp-pivot-elem ${
                  isWinamp ? 'rounded-none' : 'rounded-full shadow-md'
                }`} 
              />
            </div>

            {/* Hint Navigation Label */}
            <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium text-center tp-hint-text">
              <Keyboard className="h-3.5 w-3.5 shrink-0 tp-colon" />
              <span>
                Ketik langsung via keyboard <kbd className="px-1 py-0.2 text-[10px] font-mono tp-hint-kbd">00-23</kbd> / <kbd className="px-1 py-0.2 text-[10px] font-mono tp-hint-kbd">00-59</kbd> atau putar dial jam
              </span>
            </div>
          </div>

          {/* Quick Preset Buttons (8px border-radius) */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block mb-1.5 tp-preset-label">
              {activeTab === 'absenCeisa' ? 'Preset Waktu CEISA' : `Preset Waktu ${activeTab === 'jamMasuk' ? 'Masuk' : 'Pulang'}`}
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {(activeTab === 'absenCeisa'
                ? ['07:15', '07:30', '07:45', '08:00', '16:00', '16:30', '17:00', '19:30']
                : PRESET_TIMES
              ).map((preset) => {
                const isSelected = `${formatHour}:${formatMinute}` === preset;

                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePreset(preset)}
                    className={`relative py-1.5 text-xs font-mono font-semibold transition-all cursor-pointer tp-preset-btn ${
                      isSelected ? 'tp-preset-active font-bold shadow-xs' : ''
                    }`}
                    title={`Pilih ${preset}`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-3.5 tp-footer">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center space-x-1 px-3 py-2 text-xs font-semibold transition-colors cursor-pointer tp-btn-clear"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Kosongkan</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer tp-btn-secondary"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isInvalid}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 tp-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              title="Simpan waktu untuk semua field"
            >
              <Check className="h-4 w-4" />
              <span>Simpan Waktu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
