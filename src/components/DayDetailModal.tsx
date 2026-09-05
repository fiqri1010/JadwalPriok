import React from 'react';
import {
  X,
  Clock,
  Calendar,
  Sparkles,
  ShieldCheck,
  Palmtree,
  Zap,
  Check,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { DayData, DayCalculationResult, SHIFT_OPTIONS, SHIFT_COLORS, ShiftType, normalizeShift, LiburNasional, AppTheme } from '../types';
import { getIndonesianHoliday } from '../data/holidays';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  month: number;
  year: number;
  data: DayData;
  calculation: DayCalculationResult;
  liburNasional?: LiburNasional;
  sisaKuotaOff?: number;
  sisaKuotaCP?: number;
  theme?: AppTheme;
  onUpdate: (partial: Partial<DayData>) => void;
  onRequestTimePick: (field: 'jamMasuk' | 'jamPulang' | 'absenCeisa', title: string, currentValue: string) => void;
}

const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  dayNumber,
  month,
  year,
  data,
  calculation,
  liburNasional,
  sisaKuotaOff = 0,
  sisaKuotaCP = 0,
  theme = 'default',
  onUpdate,
  onRequestTimePick,
}) => {
  if (!isOpen) return null;

  const dateObj = new Date(year, month - 1, dayNumber);
  const dayOfWeek = dateObj.getDay();
  const dayName = INDONESIAN_DAYS[dayOfWeek];
  const monthName = INDONESIAN_MONTHS[month - 1];
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const holidayName = liburNasional?.keterangan || getIndonesianHoliday(year, month, dayNumber);
  const isTanggalMerah = isWeekend || Boolean(data.isManualHoliday) || Boolean(holidayName) || Boolean(liburNasional);

  const normalizedCurrentShift = normalizeShift(data.shift);
  const shiftTheme = SHIFT_COLORS[normalizedCurrentShift] || SHIFT_COLORS.Graha;

  const canHaveST = isTanggalMerah && normalizedCurrentShift !== 'OFF' && normalizedCurrentShift !== 'CUTI';
  const isOffDisabled = (sisaKuotaOff <= 0 && !data.isGunakanOffGeser);
  const isCPDisabled = (sisaKuotaCP <= 0 && !data.isGunakanCP);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-5 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-slate-200 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
            aria-label="Tutup form"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-start space-x-3">
            <div
              style={liburNasional ? { borderColor: '#BE1A1A', backgroundColor: 'rgba(190, 26, 26, 0.25)', color: '#FF9E9E' } : undefined}
              className={`flex flex-col items-center justify-center rounded-2xl px-3.5 py-2 shadow-inner border ${
                isTanggalMerah ? 'bg-rose-500/20 border-rose-400/40 text-rose-300' : 'bg-white/10 border-white/15 text-white'
              }`}
            >
              <span className="text-2xl sm:text-3xl font-black leading-none">{dayNumber}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">{dayName.slice(0, 3)}</span>
            </div>

            <div className="flex-1 pr-6">
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  {dayName}, {dayNumber} {monthName} {year}
                </h2>
              </div>
              
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {isTanggalMerah && (
                  <span
                    style={liburNasional ? { backgroundColor: '#BE1A1A', borderColor: '#FF4D4D', color: '#FFFFFF' } : undefined}
                    className="inline-flex items-center rounded-md bg-rose-500/30 border border-rose-400/40 px-2 py-0.5 text-[10px] font-black text-rose-200 shadow-2xs"
                  >
                    🚩 {liburNasional?.keterangan || holidayName || (data.isManualHoliday ? 'Libur Manual' : 'Hari Libur / Weekend')}
                  </span>
                )}
                {data.isLocked && (
                  <span className="inline-flex items-center rounded-md bg-amber-500/30 border border-amber-400/40 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                    🔒 Terkunci
                  </span>
                )}
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black border ${shiftTheme.bg} ${shiftTheme.text} ${shiftTheme.border}`}>
                  Shift {normalizedCurrentShift || 'Kosong'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          {/* Status Kalkulasi Banner */}
          {calculation.keteranganStatus && (
            <div className={`rounded-2xl p-3 border shadow-xs flex items-center justify-between ${
              calculation.isLembur
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : calculation.isPiket
                ? 'bg-blue-50 border-blue-300 text-blue-950'
                : calculation.isDapatGeserOff
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : calculation.isOffDiambil
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : calculation.isCPDiambil
                ? 'bg-purple-50 border-purple-300 text-purple-950'
                : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-center space-x-2.5">
                <div className={`rounded-xl p-2 ${
                  calculation.isLembur 
                    ? 'bg-emerald-600 text-white' 
                    : calculation.isPiket 
                    ? 'bg-blue-600 text-white' 
                    : calculation.isDapatGeserOff
                    ? 'bg-emerald-600 text-white'
                    : calculation.isOffDiambil
                    ? 'bg-amber-600 text-white'
                    : calculation.isCPDiambil
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-white'
                }`}>
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-black tracking-wider text-slate-500">Status Terkalkulasi</div>
                  <div className="text-sm font-black">{calculation.keteranganStatus}</div>
                </div>
              </div>
              {calculation.jamLembur > 0 && (
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-bold">Jam Lembur</div>
                  <div className="text-base font-mono font-black text-emerald-700">{calculation.jamLembur.toFixed(1)} Jam</div>
                </div>
              )}
            </div>
          )}

          {/* 1. Pemilihan Shift (Touch Pills Grid) */}
          <div className="rounded-2xl bg-white p-2.5 sm:p-3.5 border border-slate-200 shadow-xs space-y-1.5 sm:space-y-2">
            <label className="text-xs font-black text-slate-800 flex items-center justify-between">
              <span>Pilihan Shift Kerja</span>
              <span className="text-[10px] text-slate-400 font-semibold">Tap untuk memilih</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-1.5">
              {SHIFT_OPTIONS.map((opt) => {
                const STATIC_SHIFTS: Record<string, { bg: string; text: string; hexBg: string; hexText: string }> = {
                  Graha: { bg: 'bg-[#EDF6F9]', text: 'text-[#011627]', hexBg: '#EDF6F9', hexText: '#011627' },
                  NPCT: { bg: 'bg-[#FFDDD2]', text: 'text-[#011627]', hexBg: '#FFDDD2', hexText: '#011627' },
                  TPSL: { bg: 'bg-[#E29578]', text: 'text-white', hexBg: '#E29578', hexText: '#FFFFFF' },
                  OFF: { bg: 'bg-[#BE1A1A]', text: 'text-white', hexBg: '#BE1A1A', hexText: '#FFFFFF' },
                  SM: { bg: 'bg-[#83C5BE]', text: 'text-[#0B0909]', hexBg: '#83C5BE', hexText: '#0B0909' },
                  S2: { bg: 'bg-[#83C5BE]', text: 'text-[#0B0909]', hexBg: '#83C5BE', hexText: '#0B0909' },
                  PM: { bg: 'bg-[#006D77]', text: 'text-white', hexBg: '#006D77', hexText: '#FFFFFF' },
                  Malam: { bg: 'bg-[#2C4251]', text: 'text-white', hexBg: '#2C4251', hexText: '#FFFFFF' },
                  M: { bg: 'bg-[#2C4251]', text: 'text-white', hexBg: '#2C4251', hexText: '#FFFFFF' },
                  CUTI: { bg: 'bg-[#0B0909]', text: 'text-white', hexBg: '#0B0909', hexText: '#FFFFFF' },
                };
                const optSpec = STATIC_SHIFTS[opt];
                const isSelected = normalizedCurrentShift === opt;
                
                // Theme gradient overlay & thin white frame for selected shift
                let shiftFrameClass = 'border border-white/70 ring-1 ring-white/30 shadow-2xs';
                let shiftGradientClass = 'bg-gradient-to-b from-white/20 to-transparent';

                if (theme === 'dark') {
                  shiftFrameClass = 'border border-white/50 ring-1 ring-white/20 shadow-xs';
                  shiftGradientClass = 'bg-gradient-to-b from-white/15 via-transparent to-transparent';
                } else if (theme === 'vista') {
                  shiftFrameClass = 'border border-white/80 shadow-[0_1px_4px_rgba(255,255,255,0.35)]';
                  shiftGradientClass = 'bg-gradient-to-b from-white/30 via-white/10 to-transparent backdrop-blur-xs';
                } else if (theme === 'winamp') {
                  shiftFrameClass = 'border border-white/70 rounded-none shadow-none';
                  shiftGradientClass = 'bg-gradient-to-b from-white/20 via-transparent to-transparent';
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={data.isLocked}
                    onClick={() => onUpdate({ shift: opt })}
                    style={isSelected && optSpec ? { backgroundColor: optSpec.hexBg, color: optSpec.hexText } : undefined}
                    className={`relative overflow-hidden h-8 sm:h-10 px-1.5 py-1 ${theme === 'winamp' ? 'rounded-none font-mono' : 'rounded-lg sm:rounded-xl'} font-black text-[10.5px] sm:text-xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSelected
                        ? `${optSpec?.bg || 'bg-indigo-600'} ${optSpec?.text || 'text-white'} ${shiftFrameClass} ring-2 ${theme === 'winamp' ? 'ring-[#00FF00]' : 'ring-indigo-500'} ring-offset-1 shadow-md scale-102`
                        : theme === 'dark'
                        ? 'bg-[#252525] text-slate-300 hover:bg-[#303030] border border-[#444444]'
                        : theme === 'vista'
                        ? 'bg-white/50 text-[#0F172A] hover:bg-white/70 border border-white/60 backdrop-blur-xs font-bold'
                        : theme === 'winamp'
                        ? 'bg-black text-[#00FF00] hover:bg-zinc-900 border border-[#00FF00]/40 font-mono'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                    }`}
                  >
                    {isSelected && (
                      <div className={`absolute inset-0 pointer-events-none ${shiftGradientClass}`} />
                    )}
                    <span className="relative z-10">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Switch Masuk Kerja & Hold Dokumen */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
            <div
              onClick={() => onUpdate({ isMasuk: !data.isMasuk })}
              className={`flex items-center justify-between rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border transition-all cursor-pointer select-none ${
                data.isMasuk
                  ? 'bg-emerald-50/90 border-emerald-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="space-y-0.5">
                <div className="text-[11px] sm:text-xs font-black text-slate-900">Masuk Kerja</div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Hadir bekerja pada hari ini</div>
              </div>
              <div className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                data.isMasuk ? 'bg-emerald-600' : 'bg-slate-300'
              }`}>
                <span
                  className={`pointer-events-none inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    data.isMasuk ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            <div
              onClick={() => onUpdate({ isHoldDokumen: !data.isHoldDokumen })}
              className={`flex items-center justify-between rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border transition-all cursor-pointer select-none ${
                data.isHoldDokumen
                  ? 'bg-orange-50/90 border-orange-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="space-y-0.5">
                <div className="text-[11px] sm:text-xs font-black text-slate-900">Hold Dokumen</div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Terdapat penahanan dokumen</div>
              </div>
              <div className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                data.isHoldDokumen ? 'bg-orange-600' : 'bg-slate-300'
              }`}>
                <span
                  className={`pointer-events-none inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    data.isHoldDokumen ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Opsi Mengambil OFF / CP di Hari Kerja Biasa saat Masuk tidak aktif */}
          {!isTanggalMerah && !data.isMasuk && data.shift !== 'OFF' && (
            <div className="space-y-2">
              {/* Gunakan OFF Button (Locked & greyed out if no quota) */}
              <div
                onClick={() => {
                  if (isOffDisabled) return;
                  if (!data.isGunakanOffGeser) {
                    onUpdate({ isGunakanOffGeser: true, isGunakanCP: false });
                  } else {
                    onUpdate({ isGunakanOffGeser: false });
                  }
                }}
                className={`flex items-center justify-between rounded-2xl p-3.5 border transition-all select-none ${
                  isOffDisabled
                    ? 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-40 cursor-not-allowed'
                    : data.isGunakanOffGeser
                    ? 'bg-amber-50/90 border-amber-300 shadow-xs cursor-pointer'
                    : 'bg-white border-slate-200 hover:bg-slate-50 cursor-pointer'
                }`}
              >
                <div className="space-y-0.5">
                  <div className={`text-xs font-black flex items-center ${isOffDisabled ? 'text-slate-400' : 'text-amber-950'}`}>
                    <ShieldCheck className={`h-3.5 w-3.5 mr-1.5 ${isOffDisabled ? 'text-slate-400' : 'text-amber-600'}`} />
                    Gunakan OFF {sisaKuotaOff !== 0 ? `(Sisa Kuota: ${sisaKuotaOff > 0 ? '+' : ''}${sisaKuotaOff})` : '(Kuota Habis / 0)'}
                  </div>
                  <div className={`text-[11px] font-medium ${isOffDisabled ? 'text-slate-400' : 'text-amber-800'}`}>
                    {isOffDisabled ? 'Kuota tabungan OFF tidak tersedia / sudah habis' : 'Gunakan kuota tabungan OFF untuk libur pada jadwal ini'}
                  </div>
                </div>
                <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  isOffDisabled ? 'bg-slate-200 opacity-60' : data.isGunakanOffGeser ? 'bg-amber-600' : 'bg-slate-300'
                }`}>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      data.isGunakanOffGeser ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* Gunakan CP (Cuti Pengganti) Button (Locked & greyed out if no quota) */}
              <div
                onClick={() => {
                  if (isCPDisabled) return;
                  if (!data.isGunakanCP) {
                    onUpdate({ isGunakanCP: true, isGunakanOffGeser: false });
                  } else {
                    onUpdate({ isGunakanCP: false });
                  }
                }}
                className={`flex items-center justify-between rounded-2xl p-3.5 border transition-all select-none ${
                  isCPDisabled
                    ? 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-40 cursor-not-allowed'
                    : data.isGunakanCP
                    ? 'bg-purple-50/90 border-purple-300 shadow-xs cursor-pointer'
                    : 'bg-white border-slate-200 hover:bg-slate-50 cursor-pointer'
                }`}
              >
                <div className="space-y-0.5">
                  <div className={`text-xs font-black flex items-center ${isCPDisabled ? 'text-slate-400' : 'text-purple-950'}`}>
                    <Palmtree className={`h-3.5 w-3.5 mr-1.5 ${isCPDisabled ? 'text-slate-400' : 'text-purple-600'}`} />
                    Gunakan CP {sisaKuotaCP !== 0 ? `(Sisa Kuota: ${sisaKuotaCP > 0 ? '+' : ''}${sisaKuotaCP})` : '(Kuota Habis / 0)'}
                  </div>
                  <div className={`text-[11px] font-medium ${isCPDisabled ? 'text-slate-400' : 'text-purple-800'}`}>
                    {isCPDisabled ? 'Kuota Cuti Pengganti tidak tersedia / sudah habis' : 'Gunakan kuota Cuti Pengganti Surat Tugas untuk libur'}
                  </div>
                </div>
                <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  isCPDisabled ? 'bg-slate-200 opacity-60' : data.isGunakanCP ? 'bg-purple-600' : 'bg-slate-300'
                }`}>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      data.isGunakanCP ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Banner Menabung OFF Geser di Hari Kerja saat Jadwal OFF & Masuk */}
          {!isTanggalMerah && data.isMasuk && data.shift === 'OFF' && (
            <div className="rounded-2xl p-3.5 border border-emerald-300 bg-emerald-50/90 shadow-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-black text-emerald-950">OFF Ditabung (+1)</div>
                <div className="text-[11px] text-emerald-800 font-medium">
                  Menabung 1 kuota OFF geser karena hadir bekerja pada hari kerja jadwal OFF.
                </div>
              </div>
              <span className="rounded-xl bg-emerald-600 px-2.5 py-1 text-xs font-black text-white shadow-2xs">
                +1 Kuota
              </span>
            </div>
          )}

          {/* 3. Pilihan Masuk Tanggal Merah / Libur (Piket vs Lembur) */}
          {isTanggalMerah && data.isMasuk && data.shift !== 'OFF' && (
            <div className="rounded-2xl bg-amber-50/90 p-3.5 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950">Jenis Kehadiran Hari Libur:</span>
                <span className="text-[10px] text-amber-800 font-bold">Pilih salah satu</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdate({ tipeMasukLibur: 'piket' })}
                  className={`flex items-center justify-center space-x-2 rounded-xl py-2.5 px-3 text-xs font-black transition-all cursor-pointer ${
                    (!data.tipeMasukLibur || data.tipeMasukLibur === 'piket')
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Piket</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ tipeMasukLibur: 'lembur' })}
                  className={`flex items-center justify-center space-x-2 rounded-xl py-2.5 px-3 text-xs font-black transition-all cursor-pointer ${
                    data.tipeMasukLibur === 'lembur'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Zap className="h-4 w-4" />
                  <span>Lembur Hari Libur</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. Jam Absen Masuk, Pulang & CEISA (Dial Clock Triggers) */}
          <div className="rounded-2xl bg-white p-3.5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                Jam Kerja & Absensi
              </span>
              {calculation.durasiKerja > 0 && (
                <span className="text-xs font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                  Total: {calculation.durasiKerja.toFixed(1)} Jam
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block">Jam Masuk</label>
                <button
                  type="button"
                  onClick={() =>
                    onRequestTimePick('jamMasuk', `Jam Masuk - Tgl ${dayNumber}`, data.jamMasuk)
                  }
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/80 px-2 text-center font-mono text-sm font-black text-slate-900 hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors flex items-center justify-center cursor-pointer"
                >
                  {data.jamMasuk || '--:--'}
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block">Jam Pulang</label>
                <button
                  type="button"
                  onClick={() =>
                    onRequestTimePick('jamPulang', `Jam Pulang - Tgl ${dayNumber}`, data.jamPulang)
                  }
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/80 px-2 text-center font-mono text-sm font-black text-slate-900 hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors flex items-center justify-center cursor-pointer"
                >
                  {data.jamPulang || '--:--'}
                </button>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] font-bold text-blue-700 mb-1 block">Absen CEISA</label>
                <button
                  type="button"
                  onClick={() =>
                    onRequestTimePick('absenCeisa', `Absen CEISA - Tgl ${dayNumber}`, data.absenCeisa)
                  }
                  className="w-full h-11 rounded-xl border border-blue-200 bg-blue-50/60 px-2 text-center font-mono text-sm font-black text-blue-950 hover:bg-blue-100 transition-colors flex items-center justify-center cursor-pointer"
                >
                  {data.absenCeisa || '--:--'}
                </button>
              </div>
            </div>
          </div>

          {/* 5. Surat Tugas / Cuti Pengganti (ST CP) */}
          <div
            onClick={() => {
              if (canHaveST) {
                onUpdate({ isSuratTugasTambahan: !data.isSuratTugasTambahan });
              }
            }}
            className={`flex items-center justify-between rounded-2xl p-3.5 border transition-all select-none ${
              !canHaveST
                ? 'bg-slate-100/60 border-slate-200 opacity-50 cursor-not-allowed pointer-events-none'
                : data.isSuratTugasTambahan
                ? 'bg-purple-50/90 border-purple-300 shadow-xs cursor-pointer'
                : 'bg-white border-slate-200 hover:bg-slate-50 cursor-pointer'
            }`}
          >
            <div className="space-y-0.5">
              <div className="text-xs font-black text-slate-900 flex items-center">
                <Palmtree className="h-3.5 w-3.5 mr-1.5 text-purple-600" />
                ST CP (Surat Tugas / Cuti Pengganti)
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {canHaveST
                  ? 'Menghasilkan hak cuti pengganti (+1 CP) untuk dinas di hari libur'
                  : 'Hanya aktif pada hari libur (Weekend / Tanggal Merah) dan bukan shift OFF/CUTI'}
              </div>
            </div>
            <div className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              data.isSuratTugasTambahan && canHaveST ? 'bg-purple-600' : 'bg-slate-300'
            }`}>
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  data.isSuratTugasTambahan && canHaveST ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* 6. Catatan / Keterangan (batas ditingkatkan) */}
          <div className="rounded-2xl bg-white p-3.5 border border-slate-200 shadow-xs space-y-1.5">
            <label className="text-xs font-black text-slate-800 block">
              Catatan / Keterangan Harian
            </label>
            <input
              type="text"
              maxLength={33}
              placeholder="Contoh: Piket Bandara, Tukar Shift, Dinas Luar..."
              value={data.note}
              onChange={(e) => onUpdate({ note: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>

          {/* 7. Kotak Khusus Referensi Tgl OFF (Jika Menabung atau Mengambil OFF) */}
          {!isTanggalMerah && (
            (data.shift === 'OFF' && data.isMasuk) ||
            (data.shift !== 'OFF' && !data.isMasuk && data.isGunakanOffGeser)
          ) && (
            <div className="rounded-2xl bg-indigo-50/80 p-3.5 border border-indigo-200 shadow-xs space-y-1.5">
              <label className="text-xs font-black text-indigo-950 block">
                Referensi Tgl OFF
              </label>
              <input
                type="text"
                maxLength={33}
                placeholder="Contoh: Ganti tgl 12 / Potong kuota tgl..."
                value={data.referensiTglOff || ''}
                onChange={(e) => onUpdate({ referensiTglOff: e.target.value })}
                className="w-full rounded-xl border border-indigo-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-indigo-950 placeholder:text-indigo-300 focus:border-indigo-600 focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* 8. Kotak Khusus Referensi Tgl CP */}
          {!isTanggalMerah && !data.isMasuk && data.shift !== 'OFF' && data.isGunakanCP && (
            <div className="rounded-2xl bg-purple-50/80 p-3.5 border border-purple-200 shadow-xs space-y-1.5">
              <label className="text-xs font-black text-purple-950 block">
                Referensi Tanggal ST / Cuti Pengganti
              </label>
              <input
                type="text"
                maxLength={33}
                placeholder="Contoh: Dari ST Tgl 15 / Cuti libur..."
                value={data.referensiTglCP || ''}
                onChange={(e) => onUpdate({ referensiTglCP: e.target.value })}
                className="w-full rounded-xl border border-purple-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-purple-950 placeholder:text-purple-300 focus:border-purple-600 focus:outline-none transition-colors"
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 bg-white p-3.5 sm:p-4 flex items-center justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl bg-indigo-600 px-6 py-2.5 text-xs sm:text-sm font-black text-white hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
          >
            Selesai & Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
