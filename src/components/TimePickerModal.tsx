import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Check, 
  X, 
  Trash2, 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  RotateCcw,
  AlertTriangle,
  Info
} from 'lucide-react';

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  value: string; // HH:mm or ""
  onSelect: (timeStr: string) => void;
  field?: 'jamMasuk' | 'jamPulang' | 'absenCeisa';
  existingJamMasuk?: string;
  existingJamPulang?: string;
}

const PRESET_TIMES = ['07:30', '08:00', '08:30', '16:00', '16:30', '17:00', '19:30', '05:00'];

const parseTimeToMinutes = (timeStr?: string): number | null => {
  if (!timeStr || !timeStr.trim() || !timeStr.includes(':')) return null;
  const [h, m] = timeStr.trim().split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
};

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  isOpen,
  onClose,
  title,
  value,
  onSelect,
  field,
  existingJamMasuk,
  existingJamPulang,
}) => {
  const [hour, setHour] = useState<number>(8);
  const [minute, setMinute] = useState<number>(0);
  const [mode, setMode] = useState<'hour' | 'minute'>('hour');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showWarningFeedback, setShowWarningFeedback] = useState<boolean>(false);
  const clockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (value && value.includes(':')) {
        const [h, m] = value.split(':');
        const parsedH = parseInt(h, 10);
        const parsedM = parseInt(m, 10);
        setHour(isNaN(parsedH) ? 8 : Math.max(0, Math.min(23, parsedH)));
        setMinute(isNaN(parsedM) ? 0 : Math.max(0, Math.min(59, parsedM)));
      } else {
        // If field is jamPulang and existingJamMasuk exists, default to something reasonable after jamMasuk
        if (field === 'jamPulang' && existingJamMasuk && existingJamMasuk.includes(':')) {
          const [h, m] = existingJamMasuk.split(':').map(Number);
          if (!isNaN(h)) {
            setHour(Math.min(23, (h + 8) % 24));
            setMinute(isNaN(m) ? 0 : m);
          } else {
            setHour(16);
            setMinute(30);
          }
        } else if (field === 'jamPulang') {
          setHour(16);
          setMinute(30);
        } else {
          setHour(8);
          setMinute(0);
        }
      }
      setMode('hour');
      setShowWarningFeedback(false);
    }
  }, [isOpen, value, field, existingJamMasuk]);

  if (!isOpen) return null;

  const formatHour = String(hour).padStart(2, '0');
  const formatMinute = String(minute).padStart(2, '0');
  const currentTimeStr = `${formatHour}:${formatMinute}`;
  const currentMinutes = hour * 60 + minute;

  // Validasi: jamMasuk < jamPulang
  let validationError: string | null = null;
  let validationRuleSubtext: string | null = null;

  if (field === 'jamPulang' && existingJamMasuk) {
    const masukMinutes = parseTimeToMinutes(existingJamMasuk);
    if (masukMinutes !== null) {
      if (currentMinutes <= masukMinutes) {
        validationError = `Jam pulang (${currentTimeStr}) tidak boleh lebih awal atau sama dengan jam masuk (${existingJamMasuk})!`;
        validationRuleSubtext = `Aturan kehadiran: Jam Masuk (${existingJamMasuk}) harus lebih awal dari Jam Pulang (${currentTimeStr}).`;
      }
    }
  } else if (field === 'jamMasuk' && existingJamPulang) {
    const pulangMinutes = parseTimeToMinutes(existingJamPulang);
    if (pulangMinutes !== null) {
      if (currentMinutes >= pulangMinutes) {
        validationError = `Jam masuk (${currentTimeStr}) tidak boleh lebih lambat atau sama dengan jam pulang (${existingJamPulang})!`;
        validationRuleSubtext = `Aturan kehadiran: Jam Masuk (${currentTimeStr}) harus lebih awal dari Jam Pulang (${existingJamPulang}).`;
      }
    }
  }

  const isInvalid = validationError !== null;

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
    } else {
      // Minute Logic: Bebas 0 sampai 59 (tiap 6 derajat = 1 menit)
      let rawMin = Math.round(angleDeg / 6) % 60;
      if (rawMin < 0) rawMin += 60;
      setMinute(rawMin);
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
  };

  const adjustHour = (delta: number) => {
    setHour((prev) => (prev + delta + 24) % 24);
  };

  const handleSetNow = () => {
    const now = new Date();
    setHour(now.getHours());
    setMinute(now.getMinutes());
  };

  const handleApply = () => {
    if (isInvalid) {
      setShowWarningFeedback(true);
      return;
    }
    onSelect(`${formatHour}:${formatMinute}`);
    onClose();
  };

  const handleClear = () => {
    onSelect('');
    onClose();
  };

  const handlePreset = (time: string) => {
    const [h, m] = time.split(':');
    const parsedH = parseInt(h, 10);
    const parsedM = parseInt(m, 10);
    setHour(parsedH);
    setMinute(parsedM);

    // Cek apakah preset ini valid terhadap aturan jamMasuk < jamPulang
    const presetMinutes = parsedH * 60 + parsedM;
    let presetInvalid = false;

    if (field === 'jamPulang' && existingJamMasuk) {
      const masukMinutes = parseTimeToMinutes(existingJamMasuk);
      if (masukMinutes !== null && presetMinutes <= masukMinutes) {
        presetInvalid = true;
      }
    } else if (field === 'jamMasuk' && existingJamPulang) {
      const pulangMinutes = parseTimeToMinutes(existingJamPulang);
      if (pulangMinutes !== null && presetMinutes >= pulangMinutes) {
        presetInvalid = true;
      }
    }

    if (presetInvalid) {
      setShowWarningFeedback(true);
    } else {
      onSelect(time);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-xs animate-in fade-in duration-150 select-none"
      onMouseUp={handleMouseUp}
    >
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-slate-900 px-5 py-3 text-white">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-bold tracking-wide uppercase">{title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-3.5">
          {/* Reference Info Pill (Jika ada pasangan jam masuk / pulang) */}
          {(field === 'jamPulang' && existingJamMasuk) && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-indigo-900 text-xs">
              <div className="flex items-center space-x-1.5 font-medium">
                <Info className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span>Jam Masuk: <strong className="font-mono">{existingJamMasuk}</strong></span>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight bg-indigo-100/70 px-1.5 py-0.5 rounded">
                Target: &gt; {existingJamMasuk}
              </span>
            </div>
          )}

          {(field === 'jamMasuk' && existingJamPulang) && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-indigo-900 text-xs">
              <div className="flex items-center space-x-1.5 font-medium">
                <Info className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span>Jam Pulang: <strong className="font-mono">{existingJamPulang}</strong></span>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight bg-indigo-100/70 px-1.5 py-0.5 rounded">
                Target: &lt; {existingJamPulang}
              </span>
            </div>
          )}

          {/* Warning Banner Jika Tidak Valid */}
          {isInvalid && (
            <div className="flex items-start space-x-2.5 rounded-2xl bg-rose-50 border-2 border-rose-300 p-3 text-rose-900 animate-in fade-in zoom-in-95 duration-150">
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
              <div className="text-xs space-y-1">
                <div className="font-black text-rose-900 flex items-center space-x-1">
                  <span>Waktu Tidak Valid!</span>
                  <span className="text-[10px] font-mono bg-rose-200/80 text-rose-950 px-1.5 py-0.2 rounded font-bold">
                    jamMasuk &lt; jamPulang
                  </span>
                </div>
                <p className="text-[11.5px] text-rose-800 leading-snug font-medium">
                  {validationError}
                </p>
                {validationRuleSubtext && (
                  <p className="text-[10px] text-rose-700 font-semibold">
                    💡 {validationRuleSubtext}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Digital Time Display & Mode Switcher */}
          <div className={`flex items-center justify-between rounded-2xl p-3 shadow-inner transition-colors ${
            isInvalid ? 'bg-rose-950 ring-2 ring-rose-500' : 'bg-slate-950'
          }`}>
            <div className="flex items-center space-x-1.5">
              {/* Hour Box */}
              <button
                type="button"
                onClick={() => setMode('hour')}
                className={`relative px-3 py-1.5 rounded-xl font-mono text-2xl font-black transition-all cursor-pointer ${
                  mode === 'hour'
                    ? isInvalid 
                      ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400/60'
                      : 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/50'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {formatHour}
                <span className="block text-[8px] tracking-wider text-slate-400 font-sans uppercase font-bold text-center">
                  Jam
                </span>
              </button>

              <span className={`text-2xl font-mono font-bold animate-pulse ${isInvalid ? 'text-rose-400' : 'text-indigo-400'}`}>:</span>

              {/* Minute Box */}
              <button
                type="button"
                onClick={() => setMode('minute')}
                className={`relative px-3 py-1.5 rounded-xl font-mono text-2xl font-black transition-all cursor-pointer ${
                  mode === 'minute'
                    ? isInvalid
                      ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400/60'
                      : 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/50'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {formatMinute}
                <span className="block text-[8px] tracking-wider text-slate-400 font-sans uppercase font-bold text-center">
                  Menit
                </span>
              </button>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => adjustMinute(-1)}
                className="rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-1.5 text-xs font-bold font-mono transition-colors cursor-pointer"
                title="Kurangi 1 Menit"
              >
                -1m
              </button>
              <button
                type="button"
                onClick={() => adjustMinute(1)}
                className="rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-400 px-2 py-1.5 text-xs font-bold font-mono transition-colors cursor-pointer"
                title="Tambah 1 Menit"
              >
                +1m
              </button>
              <button
                type="button"
                onClick={handleSetNow}
                className="flex items-center space-x-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 px-2 py-1.5 text-xs font-semibold transition-colors border border-indigo-800/40 cursor-pointer"
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
              className="relative w-52 h-52 sm:w-56 sm:h-56 rounded-full bg-linear-to-b from-slate-900 via-slate-950 to-slate-900 border-4 border-slate-800 shadow-xl cursor-pointer select-none touch-none"
              style={{
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4), inset 0 0 15px rgba(0,0,0,0.8)',
              }}
            >
              {/* Watch Bezel Ticks (60 Menit / Detik) */}
              {Array.from({ length: 60 }).map((_, i) => {
                const isMajor = i % 5 === 0;
                const deg = i * 6;
                return (
                  <div
                    key={i}
                    className="absolute top-0 left-1/2 -translate-x-1/2 origin-bottom pointer-events-none"
                    style={{
                      height: '50%',
                      transform: `rotate(${deg}deg)`,
                    }}
                  >
                    <div
                      className={`w-[1.5px] rounded-full mx-auto ${
                        isMajor ? 'h-2 bg-indigo-400' : 'h-1 bg-slate-700'
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
                        key={h}
                        className={`absolute w-6 h-6 -ml-3 -mt-3 flex items-center justify-center rounded-full text-xs font-bold transition-transform ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-lg scale-110'
                            : 'text-slate-300 hover:text-white'
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
                        key={h}
                        className={`absolute w-5 h-5 -ml-2.5 -mt-2.5 flex items-center justify-center rounded-full text-[10px] font-semibold transition-transform ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md scale-110'
                            : 'text-slate-500 hover:text-slate-300'
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
                        className={`absolute w-6 h-6 -ml-3 -mt-3 flex items-center justify-center rounded-full text-xs font-bold transition-transform ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-lg scale-110'
                            : 'text-slate-300 hover:text-white'
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
                className="absolute top-1/2 left-1/2 origin-bottom transition-all duration-75 pointer-events-none"
                style={{
                  width: '4px',
                  height: '42px',
                  backgroundColor: '#818cf8', // indigo-400
                  borderRadius: '3px',
                  transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
                  boxShadow: '0 0 8px rgba(129, 140, 248, 0.6)',
                }}
              />

              {/* JARUM MENIT (Minute Hand) */}
              <div
                className="absolute top-1/2 left-1/2 origin-bottom transition-all duration-75 pointer-events-none"
                style={{
                  width: '2.5px',
                  height: '68px',
                  backgroundColor: mode === 'minute' ? '#a855f7' : '#e2e8f0', // purple / slate
                  borderRadius: '2px',
                  transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
                  boxShadow: mode === 'minute' ? '0 0 10px rgba(168, 85, 247, 0.8)' : 'none',
                }}
              />

              {/* Center Pivot Pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-400 border-2 border-slate-900 shadow-md pointer-events-none" />
            </div>

            {/* Hint Navigation Label */}
            <p className="mt-2 text-[11px] text-slate-500 font-medium text-center">
              Sentuh & putar dial jam di atas untuk mengatur waktu secara bebas (0–59 menit)
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Preset Shift Populer
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {PRESET_TIMES.map((preset) => {
                const isSelected = `${formatHour}:${formatMinute}` === preset;
                const pMinutes = parseTimeToMinutes(preset);
                let pInvalid = false;
                if (field === 'jamPulang' && existingJamMasuk) {
                  const mMin = parseTimeToMinutes(existingJamMasuk);
                  if (mMin !== null && pMinutes !== null && pMinutes <= mMin) {
                    pInvalid = true;
                  }
                } else if (field === 'jamMasuk' && existingJamPulang) {
                  const pMin = parseTimeToMinutes(existingJamPulang);
                  if (pMin !== null && pMinutes !== null && pMinutes >= pMin) {
                    pInvalid = true;
                  }
                }

                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePreset(preset)}
                    className={`relative rounded-lg py-1.5 text-xs font-mono font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? isInvalid
                          ? 'bg-rose-50 border-rose-500 text-rose-700 font-bold'
                          : 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold'
                        : pInvalid
                          ? 'bg-slate-50 border-slate-200 text-slate-400 line-through opacity-70 hover:opacity-100 hover:bg-rose-50'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-indigo-50/50'
                    }`}
                    title={pInvalid ? `Preset ${preset} melanggar aturan jamMasuk < jamPulang` : `Pilih ${preset}`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-3">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center space-x-1 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Kosongkan</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isInvalid}
              className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-all ${
                isInvalid
                  ? 'bg-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer active:scale-95'
              }`}
              title={isInvalid ? validationError || 'Jam masuk harus lebih awal dari jam pulang' : `Terapkan ${formatHour}:${formatMinute}`}
            >
              <Check className="h-4 w-4" />
              <span>
                {isInvalid ? 'Waktu Tidak Valid' : `Terapkan (${formatHour}:${formatMinute})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
