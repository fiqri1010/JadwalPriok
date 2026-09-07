import React, { useState } from 'react';
import {
    ChevronDown,
    ChevronUp,
    Clock,
    Palmtree,
    ShieldCheck,
    Zap,
    ExternalLink,
    Edit3
} from 'lucide-react';
import { DayData, DayCalculationResult, SHIFT_OPTIONS, SHIFT_COLORS, ShiftType, normalizeShift, getMobileShiftLabel, LiburNasional, AppTheme } from '../types';
import { getIndonesianHoliday } from '../data/holidays';

interface DayCellProps {
    dayNumber: number;
    date: Date;
    data: DayData;
    calculation: DayCalculationResult;
    isExpanded: boolean;
    isMobile?: boolean;
    liburNasional?: LiburNasional;
    sisaKuotaOff?: number;
    sisaKuotaCP?: number;
    theme?: AppTheme;
    onToggleExpand: () => void;
    onOpenModal: () => void;
    onUpdate: (partial: Partial<DayData>) => void;
    onRequestTimePick: (field: 'jamMasuk' | 'jamPulang' | 'absenCeisa', title: string, currentValue: string) => void;
}

export const DayCell: React.FC<DayCellProps> = ({
    dayNumber,
    date,
    data,
    calculation,
    isExpanded,
    isMobile = false,
    liburNasional,
    sisaKuotaOff = 0,
    sisaKuotaCP = 0,
    theme = 'default',
    onToggleExpand,
    onOpenModal,
    onUpdate,
    onRequestTimePick,
}) => {
    const [isEditingNote, setIsEditingNote] = useState(false);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const holidayName = liburNasional?.keterangan || getIndonesianHoliday(date);
    const isTanggalMerah = isWeekend || Boolean(data.isManualHoliday) || Boolean(holidayName) || Boolean(liburNasional);

    const normalizedCurrentShift = normalizeShift(data.shift);
    const shiftTheme = SHIFT_COLORS[normalizedCurrentShift] || (normalizedCurrentShift === '' ? SHIFT_COLORS[''] : SHIFT_COLORS.Graha);
    const canHaveST = isTanggalMerah;

    // Static Shift Specifications (strictly immune to theme changes)
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

    const currentShiftSpec = normalizedCurrentShift ? STATIC_SHIFTS[normalizedCurrentShift] : null;

    // Theme-specific base styling tokens
    const isWinamp = theme === 'winamp';
    const isDark = theme === 'dark';
    const isVista = theme === 'vista';

    let cellBgClass = 'bg-white text-[#011627]';
    let defaultBorder = 'border-[#E2E8F0]';
    let dayNumberColor = isTanggalMerah ? 'text-[#FF3366]' : 'text-[#011627]';
    let roundedClass = 'rounded-lg sm:rounded-xl';
    let fontClass = '';

    if (isDark) {
        cellBgClass = isTanggalMerah ? 'bg-[#2A1616] text-[#E0E0E0]' : 'bg-[#1A1A1A] text-[#E0E0E0]';
        defaultBorder = isTanggalMerah ? 'border-[#4A2525]' : 'border-[#333333]';
        dayNumberColor = isTanggalMerah ? 'text-[#FF8A8A]' : 'text-[#E0E0E0]';
    } else if (isVista) {
        cellBgClass = isTanggalMerah ? 'bg-rose-100/70 backdrop-blur-xs text-slate-900 font-bold' : 'bg-white/60 backdrop-blur-xs text-slate-900 font-bold';
        defaultBorder = isTanggalMerah ? 'border-rose-300/70 shadow-xs' : 'border-white/70 shadow-xs';
        dayNumberColor = isTanggalMerah ? 'text-[#BE1A1A] font-black drop-shadow-md' : 'text-slate-900 font-black drop-shadow-md';
    } else if (isWinamp) {
        cellBgClass = isTanggalMerah ? 'bg-[#3B0000] text-[#FF3333]' : 'bg-[#000000] text-[#00FF00]';
        defaultBorder = isTanggalMerah ? 'border-[#550000]' : 'border-[#333333]';
        dayNumberColor = isTanggalMerah ? 'text-[#FF3333]' : 'text-[#00FF00]';
        roundedClass = 'rounded-none';
        fontClass = 'font-mono';
    } else {
        // Default (Brand Baru)
        cellBgClass = isTanggalMerah ? 'bg-[#FF3366]/10 text-[#011627]' : 'bg-white text-[#011627]';
        defaultBorder = isTanggalMerah ? 'border-[#FF3366]' : 'border-[#E2E8F0]';
        dayNumberColor = isTanggalMerah ? 'text-[#FF3366]' : 'text-[#011627]';
    }

    // Dynamic border & badge colors
    let borderColor = defaultBorder;
    const badges: React.ReactNode[] = [];

    if (calculation.isLembur) {
        borderColor = isWinamp ? 'border-2 border-[#00FF00]' : 'border-emerald-500 ring-1.5 ring-emerald-500/30';
        badges.push(
            <span key="lembur" className={`px-0.5 md:px-1 py-0 md:py-0.5 text-[6px] md:text-[8px] font-black uppercase tracking-tighter leading-none shadow-2xs whitespace-nowrap shrink-0 ${isWinamp ? 'rounded-none bg-[#00FF00] text-black' : 'rounded bg-emerald-600 text-white'}`}>
                <span className="md:hidden">LM</span>
                <span className="hidden md:inline">LMBR {calculation.jamLembur > 0 ? `${calculation.jamLembur.toFixed(1)}h` : ''}</span>
            </span>
        );
    }

    if (calculation.isPiket) {
        if (!calculation.isLembur) {
            borderColor = isWinamp ? 'border-2 border-[#FACC15]' : 'border-blue-500 ring-1.5 ring-blue-500/30';
        }
        badges.push(
            <span key="piket" className={`px-0.5 md:px-1 py-0 md:py-0.5 text-[6px] md:text-[8px] font-black uppercase tracking-tighter leading-none shadow-2xs whitespace-nowrap shrink-0 ${isWinamp ? 'rounded-none bg-[#FACC15] text-black' : 'rounded bg-blue-600 text-white'}`}>
                <span className="md:hidden">PKT</span>
                <span className="hidden md:inline">PIKET</span>
            </span>
        );
    }

    if (data.isSuratTugasTambahan) {
        badges.push(
            <span key="st" className={`px-0.5 md:px-1 py-0 md:py-0.5 text-[6px] md:text-[8px] font-black uppercase tracking-tighter leading-none shadow-2xs whitespace-nowrap shrink-0 ${isWinamp ? 'rounded-none bg-[#FF3366] text-white' : 'rounded bg-purple-700 text-white'}`} title="Surat Tugas Tambahan">
                ST
            </span>
        );
    }

    if (calculation.isDapatGeserOff) {
        if (!calculation.isLembur && !calculation.isPiket) {
            borderColor = isWinamp ? 'border-2 border-[#00FF00]' : 'border-emerald-600 ring-1.5 ring-emerald-600/30';
        }
        badges.push(
            <span key="off1" className={`px-0.5 md:px-1 py-0 md:py-0.5 text-[6px] md:text-[8px] font-black uppercase tracking-tighter leading-none shadow-2xs whitespace-nowrap shrink-0 ${isWinamp ? 'rounded-none bg-[#00FF00] text-black' : 'rounded bg-emerald-600 text-white'}`} title="OFF Ditabung (+1)">
                <span className="md:hidden">+1</span>
                <span className="hidden md:inline">OFF +1</span>
            </span>
        );
    } else if (calculation.isOffDiambil) {
        borderColor = isWinamp ? 'border-2 border-[#FF3366]' : 'border-amber-600 ring-1.5 ring-amber-600/30';
        badges.push(
            <span key="off-1" className={`px-0.5 md:px-1 py-0 md:py-0.5 text-[6px] md:text-[8px] font-black uppercase tracking-tighter leading-none shadow-2xs whitespace-nowrap shrink-0 ${isWinamp ? 'rounded-none bg-[#FF3366] text-white' : 'rounded bg-amber-600 text-white'}`} title="OFF Diambil (-1)">
                <span className="md:hidden">-1</span>
                <span className="hidden md:inline">OFF -1</span>
            </span>
        );
    } else if (calculation.isCPDiambil) {
        borderColor = isWinamp ? 'border-2 border-[#FF3366]' : 'border-purple-600 ring-1.5 ring-purple-600/30';
        badges.push(
            <span key="cp-1" className={`px-0.5 md:px-1 py-0 md:py-0.5 text-[6px] md:text-[8px] font-black uppercase tracking-tighter leading-none shadow-2xs whitespace-nowrap shrink-0 ${isWinamp ? 'rounded-none bg-[#FF3366] text-white' : 'rounded bg-purple-600 text-white'}`} title="Cuti Pengganti Terpakai (-1)">
                <span className="md:hidden">CP-</span>
                <span className="hidden md:inline">CP -1</span>
            </span>
        );
    } else if (calculation.isCutiPengganti && !data.isSuratTugasTambahan) {
        borderColor = isWinamp ? 'border-2 border-[#FACC15]' : 'border-purple-400 ring-1.5 ring-purple-400/30';
        badges.push(
            <span key="cuti-st" className={`px-0.5 md:px-1 py-0 md:py-0.5 text-[6px] md:text-[8px] font-black uppercase tracking-tighter leading-none shadow-2xs whitespace-nowrap shrink-0 ${isWinamp ? 'rounded-none bg-[#FACC15] text-black' : 'rounded bg-purple-600 text-white'}`} title="Cuti Pengganti (+1)">
                <span className="md:hidden">CP</span>
                <span className="hidden md:inline">CUTI ST</span>
            </span>
        );
    }

    // Running text logic: Only active on desktop (not mobile) and note length > 7 chars
    const noteText = (data.note || '').trim();
    const isRunningTextActive = !isMobile && noteText.length > 7;

    // Quota selection logic: check if quota is exhausted
    const isOffDisabled = (sisaKuotaOff <= 0 && !data.isGunakanOffGeser);
    const isCPDisabled = (sisaKuotaCP <= 0 && !data.isGunakanCP);

    // Shift Pill background, text, frame, gradient & inline style
    let pillBgClass = shiftTheme.bg;
    let pillBorderClass = 'border border-white/70 ring-1 ring-white/30 shadow-2xs';
    let pillTextClass = shiftTheme.text;
    let pillTextColorHex: string | undefined = undefined;
    let pillInlineStyle: React.CSSProperties = {};
    let shiftGradientClass = 'bg-gradient-to-b from-white/20 to-transparent';
    let optionBgClass = 'bg-white text-slate-900';

    if (currentShiftSpec) {
        // A shift is selected: Graha, NPCT, TPSL, OFF, SM, PM, Malam, CUTI
        // STATIC COLORS: Strictly immune to theme overrides
        pillBgClass = currentShiftSpec.bg;
        pillTextClass = currentShiftSpec.text;
        pillTextColorHex = currentShiftSpec.hexText;
        pillInlineStyle = { backgroundColor: currentShiftSpec.hexBg, color: currentShiftSpec.hexText };

        if (isWinamp) {
            pillBorderClass = 'border border-white/70 rounded-none shadow-none';
            shiftGradientClass = 'bg-gradient-to-b from-white/20 via-transparent to-transparent';
            optionBgClass = 'bg-black text-[#00FF00] font-mono';
        } else if (isVista) {
            pillBorderClass = 'border border-white/80 ring-1 ring-white/40 shadow-xs rounded-md';
            shiftGradientClass = 'bg-gradient-to-b from-white/30 via-white/10 to-transparent backdrop-blur-xs';
            optionBgClass = 'bg-slate-900 text-white';
        } else if (isDark) {
            pillBorderClass = 'border border-white/50 ring-1 ring-white/20 shadow-xs rounded-md';
            shiftGradientClass = 'bg-gradient-to-b from-white/15 via-transparent to-transparent';
            optionBgClass = 'bg-[#1E1E1E] text-white';
        } else {
            pillBorderClass = 'border border-white/70 ring-1 ring-white/30 shadow-2xs rounded-md';
            shiftGradientClass = 'bg-gradient-to-b from-white/25 to-transparent';
            optionBgClass = 'bg-white text-slate-900';
        }
    } else {
        // Shift is KOSONG
        if (isWinamp) {
            pillBgClass = 'bg-[#000000]';
            pillBorderClass = 'border border-[#00FF00]/50 rounded-none shadow-none';
            pillTextClass = 'text-[#00FF00] font-mono font-bold';
            pillTextColorHex = '#00FF00';
            pillInlineStyle = { backgroundColor: '#000000', color: '#00FF00' };
            shiftGradientClass = 'hidden';
            optionBgClass = 'bg-black text-[#00FF00] font-mono';
        } else if (isVista) {
            pillBgClass = 'bg-white/70 backdrop-blur-xs';
            pillBorderClass = 'border border-white/80 shadow-xs rounded-md';
            pillTextClass = 'text-slate-900 font-black drop-shadow-md';
            pillTextColorHex = '#0F172A';
            pillInlineStyle = { color: '#0F172A' };
            shiftGradientClass = 'bg-gradient-to-b from-white/40 to-transparent';
            optionBgClass = 'bg-slate-900 text-white';
        } else if (isDark) {
            pillBgClass = 'bg-[#1E1E1E]';
            pillBorderClass = 'border border-white/20 rounded-md';
            pillTextClass = 'text-slate-300 font-bold';
            pillTextColorHex = '#CBD5E1';
            pillInlineStyle = { backgroundColor: '#1E1E1E', color: '#CBD5E1' };
            shiftGradientClass = 'hidden';
            optionBgClass = 'bg-[#1E1E1E] text-white';
        } else {
            pillBgClass = 'bg-slate-100';
            pillBorderClass = 'border border-slate-300 rounded-md';
            pillTextClass = 'text-slate-500 font-bold';
            pillTextColorHex = '#475569';
            pillInlineStyle = {};
            shiftGradientClass = 'hidden';
            optionBgClass = 'bg-white text-slate-900';
        }
    }

    return (
        <div
            onClick={(e) => {
                // If on small screen (mobile), clicking the cell opens the pop-out modal directly
                if (window.innerWidth < 640) {
                    onOpenModal();
                }
            }}
            className={`group relative flex flex-col ${roundedClass} ${fontClass} p-1 sm:p-1.5 shadow-2xs transition-all hover:shadow-xs border cursor-pointer sm:cursor-default ${borderColor} ${cellBgClass}`}
        >
            {/* 1. Header: Tanggal + Badges + Toggle Popout/Expand */}
            <div className="flex justify-between items-start gap-1 overflow-hidden w-full mb-0.5 min-w-0">
                <div className="flex items-center gap-0.5 shrink-0">
                    <span
                        className={`text-xs sm:text-sm font-black tracking-tight leading-none shrink-0 ${dayNumberColor}`}
                    >
                        {dayNumber}
                    </span>
                </div>

                <div className="flex items-center justify-end gap-0.5 flex-wrap overflow-hidden min-w-0">
                    {badges}

                    {/* Tombol Pop-out Modal (Icon Edit) - Hanya tampil di Mobile */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenModal();
                        }}
                        className="sm:hidden rounded p-0 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer shrink-0"
                        title="Buka form pop-out tanggal ini"
                    >
                        <Edit3 className="h-2.5 w-2.5" />
                    </button>

                    {/* Tombol Inline Expand (Hanya tampil di Desktop) */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleExpand();
                        }}
                        className={`hidden sm:block ${isWinamp ? 'rounded-none' : 'rounded'} p-0.5 transition-colors ${isExpanded
                                ? (isWinamp ? 'bg-[#00FF00] text-black font-bold' : 'bg-[#20A4F3] text-white')
                                : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700')
                            }`}
                        title={isExpanded ? 'Sembunyikan form detail' : 'Buka form detail inline'}
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-3 w-3" />
                        ) : (
                            <ChevronDown className="h-3 w-3" />
                        )}
                    </button>
                </div>
            </div>

            {/* 1.5. Flag Libur (Di Bawah Tanggal: Tampilkan Keterangan Libur Nasional / Tanggal Merah) */}
            {(liburNasional || holidayName || data.isManualHoliday) && (
                <div className="mb-0.5 min-w-0">
                    <span
                        className={`block w-full truncate ${isWinamp ? 'rounded-none bg-[#FF3366] text-white font-mono' : 'rounded text-white'} px-0.5 py-0.2 text-[5.5px] sm:text-[6.5px] lg:text-[7px] font-black leading-tight text-center shadow-2xs ${isWinamp ? 'bg-[#FF3366]' : liburNasional ? 'bg-[#FF3366]' : 'bg-rose-600'
                            }`}
                        title={liburNasional?.keterangan || holidayName || (data.note ? data.note : (data.isManualHoliday ? 'Libur Manual' : 'Libur Nasional'))}
                    >
                        🚩 {liburNasional?.keterangan || holidayName || (data.note ? data.note : 'Libur')}
                    </span>
                </div>
            )}

            {/* 2. Shift Pill (Per-Tanggal Display) - Taller proportional font styling with theme-based gradient & thin white line frame */}
            <div
                style={pillInlineStyle}
                className={`relative flex h-4.5 sm:h-5.5 lg:h-6 items-center justify-center ${isWinamp ? 'rounded-none font-mono' : 'rounded-md'} transition-colors ${pillBgClass} ${pillBorderClass} overflow-hidden`}
            >
                {/* Subtle Theme Gradient Overlay */}
                <div className={`absolute inset-0 pointer-events-none ${shiftGradientClass}`} />

                <select
                    disabled={data.isLocked}
                    value={normalizedCurrentShift}
                    onChange={(e) => {
                        e.stopPropagation();
                        onUpdate({ shift: e.target.value as ShiftType });
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={`shift-select relative z-10 w-full text-center font-black text-[8.5px] sm:text-[10px] lg:text-[11px] tracking-tight bg-transparent outline-none cursor-pointer disabled:cursor-not-allowed appearance-none px-0.5 uppercase ${pillTextClass} ${isVista ? 'drop-shadow-sm' : ''}`}
                    style={{
                        textAlignLast: 'center',
                        lineHeight: 1.1,
                        transform: 'scaleY(1.12)',
                        transformOrigin: 'center',
                        fontStretch: 'condensed',
                        letterSpacing: '0.02em',
                        background: 'transparent',
                        backgroundColor: 'transparent',
                        color: pillTextColorHex,
                    }}
                >
                    <option value="" className={`${optionBgClass} font-bold text-center`}>
                        {isMobile ? '-' : isWinamp ? '-- KOSONG --' : '-- Kosong --'}
                    </option>
                    {SHIFT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className={`${optionBgClass} font-black text-center`}>
                            {isMobile ? getMobileShiftLabel(opt) : opt}
                        </option>
                    ))}
                </select>
            </div>

            {/* 3. Ringkasan Singkat Jam Masuk/Pulang atau Status (Tampil pada Mobile & Desktop) */}
            <div className={`mt-0.5 flex flex-col items-center justify-center text-[6px] sm:text-[7px] lg:text-[7.5px] font-mono leading-none ${isDark ? 'text-slate-300' : isWinamp ? 'text-[#00FF00]' : isVista ? 'text-slate-900 font-bold drop-shadow-sm' : 'text-slate-700'}`}>
                {data.jamMasuk || data.jamPulang ? (
                    <span className="font-bold truncate w-full text-center">
                        {data.jamMasuk || '--:--'} - {data.jamPulang || '--:--'}
                    </span>
                ) : calculation.keteranganStatus ? (
                    <span className={`font-bold truncate w-full text-center font-sans text-[6px] sm:text-[7px] lg:text-[7.5px] ${isDark ? 'text-teal-300' : isWinamp ? 'text-[#FACC15]' : isVista ? 'text-blue-900 font-black drop-shadow-sm' : 'text-[#20A4F3]'}`}>
                        {calculation.keteranganStatus}
                    </span>
                ) : (
                    <span className="font-sans text-[6.5px] hidden sm:inline text-slate-400">
                        {data.isMasuk ? 'Masuk' : 'Off'}
                    </span>
                )}
            </div>

            {/* 4. Catatan Ringkas dengan Animasi Running Text pada Desktop jika > 7 Karakter */}
            <div className="mt-0.5 hidden sm:block">
                {data.note && !isEditingNote ? (
                    isRunningTextActive ? (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditingNote(true);
                            }}
                            className={`w-full rounded border px-1 py-0.5 text-[7.5px] sm:text-[8px] font-medium transition-colors cursor-text note-marquee-container flex items-center h-[17px] ${isWinamp
                                    ? 'rounded-none border-[#00FF00]/40 bg-black text-[#00FF00] font-mono hover:border-[#00FF00]'
                                    : isVista
                                        ? 'border-white/60 bg-white/70 backdrop-blur-xs text-slate-900 font-bold drop-shadow-sm hover:bg-white'
                                        : isDark
                                            ? 'border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500'
                                            : 'border-slate-200/80 bg-slate-50/80 text-slate-800 hover:border-indigo-400 hover:bg-white'
                                }`}
                            title={`Catatan: ${data.note} (Klik untuk mengedit)`}
                        >
                            <div className="note-marquee-content">
                                <span className="pr-3">{data.note}</span>
                                <span className="pr-3 opacity-60">&bull;</span>
                                <span className="pr-3">{data.note}</span>
                                <span className="pr-3 opacity-60">&bull;</span>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditingNote(true);
                            }}
                            className={`w-full rounded border px-1 py-0.5 text-[7.5px] sm:text-[8px] font-medium transition-colors cursor-text flex items-center justify-center truncate h-[17px] ${isWinamp
                                    ? 'rounded-none border-[#00FF00]/40 bg-black text-[#00FF00] font-mono hover:border-[#00FF00]'
                                    : isVista
                                        ? 'border-white/60 bg-white/70 backdrop-blur-xs text-slate-900 font-bold drop-shadow-sm hover:bg-white'
                                        : isDark
                                            ? 'border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-500'
                                            : 'border-slate-200/80 bg-slate-50/80 text-slate-800 hover:border-indigo-400 hover:bg-white'
                                }`}
                            title={`Catatan: ${data.note} (Klik untuk mengedit)`}
                        >
                            <span className="truncate">{data.note}</span>
                        </div>
                    )
                ) : (
                    <input
                        autoFocus={isEditingNote}
                        type="text"
                        placeholder="Catatan..."
                        maxLength={33}
                        value={data.note}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={() => setIsEditingNote(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'Escape') {
                                setIsEditingNote(false);
                            }
                        }}
                        onChange={(e) => onUpdate({ note: e.target.value })}
                        className={`w-full rounded border px-1 py-0.5 text-[7.5px] sm:text-[8px] font-medium transition-colors focus:outline-none h-[17px] ${isWinamp
                                ? 'rounded-none border-[#00AA50] bg-black text-[#00FF00] placeholder:text-[#00AA50]/60 font-mono focus:bg-black focus:border-[#00FF00]'
                                : isVista
                                    ? 'border-white/70 bg-white/80 backdrop-blur-xs text-slate-900 placeholder:text-slate-500 font-bold drop-shadow-sm focus:bg-white focus:border-blue-400'
                                    : isDark
                                        ? 'border-slate-700 bg-slate-800 text-slate-100 placeholder:text-slate-500 focus:bg-slate-900 focus:border-indigo-400'
                                        : 'border-slate-200 bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500'
                            }`}
                    />
                )}
            </div>

            {/* 5. Form Detail Inline (Hanya bila di-expand pada Desktop) */}
            {isExpanded && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1.5 pt-1.5 border-t border-slate-100 space-y-1 animate-in fade-in duration-100 hidden sm:block"
                >
                    {/* Switch Masuk & Switch Hold Dok */}
                    <div className="flex items-center justify-between gap-1 p-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
                        <label className="flex items-center space-x-1 px-1 py-0.5 rounded hover:bg-slate-100/80 cursor-pointer select-none flex-1 min-w-0">
                            <input
                                type="checkbox"
                                checked={data.isMasuk}
                                onChange={(e) => onUpdate({ isMasuk: e.target.checked })}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
                            />
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 shrink-0 select-none leading-none">Masuk</span>
                        </label>

                        <label className="flex items-center space-x-1 px-1 py-0.5 rounded hover:bg-slate-100/80 cursor-pointer select-none flex-1 min-w-0">
                            <input
                                type="checkbox"
                                checked={data.isHoldDokumen}
                                onChange={(e) => onUpdate({ isHoldDokumen: e.target.checked })}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer shrink-0"
                            />
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-800 shrink-0 select-none leading-none">Hold</span>
                        </label>
                    </div>

                    {/* Opsi Mengambil OFF / CP di Hari Kerja Biasa saat Masuk tidak aktif */}
                    {!isTanggalMerah && !data.isMasuk && data.shift !== 'OFF' && (
                        <div className="space-y-1">
                            {/* Gunakan OFF Button */}
                            <div className={`rounded-lg p-1 border transition-all ${isOffDisabled
                                    ? 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-40 cursor-not-allowed select-none'
                                    : isWinamp
                                        ? 'rounded-none font-mono bg-black text-[#00FF00] border-[#00FF00]/40'
                                        : isDark
                                            ? 'bg-amber-950/40 text-amber-200 border-amber-800/60'
                                            : 'text-amber-900 bg-amber-50/90 border-amber-200'
                                }`}>
                                <label className={`flex items-center justify-between text-[8px] font-black ${isOffDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`} title={isOffDisabled ? 'Kuota tabungan OFF habis / tidak tersedia' : 'Gunakan kuota OFF'}>
                                    <span>Gunakan OFF {sisaKuotaOff !== 0 ? `(${sisaKuotaOff > 0 ? '+' : ''}${sisaKuotaOff})` : '(0)'}</span>
                                    <input
                                        type="checkbox"
                                        disabled={isOffDisabled}
                                        checked={data.isGunakanOffGeser || false}
                                        onChange={(e) => {
                                            if (isOffDisabled && e.target.checked) return;
                                            if (e.target.checked) {
                                                onUpdate({ isGunakanOffGeser: true, isGunakanCP: false });
                                            } else {
                                                onUpdate({ isGunakanOffGeser: false });
                                            }
                                        }}
                                        className={`h-3 w-3 rounded border-amber-400 text-amber-600 focus:ring-amber-500 ${isOffDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                                    />
                                </label>
                            </div>

                            {/* Gunakan CP (Cuti Pengganti) Button */}
                            <div className={`rounded-lg p-1 border transition-all ${isCPDisabled
                                    ? 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-40 cursor-not-allowed select-none'
                                    : isWinamp
                                        ? 'rounded-none font-mono bg-black text-[#00FF00] border-[#00FF00]/40'
                                        : isDark
                                            ? 'bg-purple-950/40 text-purple-200 border-purple-800/60'
                                            : 'text-purple-900 bg-purple-50/90 border-purple-200'
                                }`}>
                                <label className={`flex items-center justify-between text-[8px] font-black ${isCPDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`} title={isCPDisabled ? 'Kuota Cuti Pengganti habis / tidak tersedia' : 'Gunakan kuota Cuti Pengganti'}>
                                    <span>Gunakan CP {sisaKuotaCP !== 0 ? `(${sisaKuotaCP > 0 ? '+' : ''}${sisaKuotaCP})` : '(0)'}</span>
                                    <input
                                        type="checkbox"
                                        disabled={isCPDisabled}
                                        checked={data.isGunakanCP || false}
                                        onChange={(e) => {
                                            if (isCPDisabled && e.target.checked) return;
                                            if (e.target.checked) {
                                                onUpdate({ isGunakanCP: true, isGunakanOffGeser: false });
                                            } else {
                                                onUpdate({ isGunakanCP: false });
                                            }
                                        }}
                                        className={`h-3 w-3 rounded border-purple-400 text-purple-600 focus:ring-purple-500 ${isCPDisabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                                    />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Kotak Referensi Tgl OFF (Jika Menabung atau Mengambil OFF) */}
                    {!isTanggalMerah && (
                        (data.shift === 'OFF' && data.isMasuk) ||
                        (data.shift !== 'OFF' && !data.isMasuk && data.isGunakanOffGeser)
                    ) && (
                            <div className="rounded-lg p-1 border bg-indigo-50/80 border-indigo-200 text-indigo-900">
                                <div className="text-[7.5px] font-black mb-0.5">Referensi Tgl OFF:</div>
                                <input
                                    type="text"
                                    placeholder="Misal: Ganti tgl 12"
                                    maxLength={30}
                                    value={data.referensiTglOff || ''}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => onUpdate({ referensiTglOff: e.target.value })}
                                    className="w-full rounded border border-indigo-200 bg-white px-1 py-0.5 text-[8.5px] font-medium text-slate-900 placeholder:text-indigo-300 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                        )}

                    {/* Kotak Referensi Tgl CP */}
                    {!isTanggalMerah && !data.isMasuk && data.shift !== 'OFF' && data.isGunakanCP && (
                        <div className="rounded-lg p-1 border bg-purple-50/80 border-purple-200 text-purple-900">
                            <div className="text-[7.5px] font-black mb-0.5">Referensi Tanggal ST / CP:</div>
                            <input
                                type="text"
                                placeholder="Misal: ST Tgl 15"
                                maxLength={30}
                                value={data.referensiTglCP || ''}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => onUpdate({ referensiTglCP: e.target.value })}
                                className="w-full rounded border border-purple-200 bg-white px-1 py-0.5 text-[8.5px] font-medium text-slate-900 placeholder:text-purple-300 focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                    )}

                    {/* Opsi Khusus Masuk di Tanggal Merah / Libur (Piket vs Lembur) */}
                    {isTanggalMerah && data.isMasuk && data.shift !== 'OFF' && (
                        <div className="rounded-lg p-1 border border-amber-200 bg-amber-50/80 text-amber-900 space-y-1">
                            <div className="flex items-center justify-between text-[8px] font-black">
                                <span>Jenis Masuk Libur:</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                <button
                                    type="button"
                                    onClick={() => onUpdate({ tipeMasukLibur: 'piket' })}
                                    className={`rounded py-0.5 text-[8px] font-black transition-all cursor-pointer ${(!data.tipeMasukLibur || data.tipeMasukLibur === 'piket')
                                            ? 'bg-blue-600 text-white shadow-xs'
                                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                >
                                    Piket
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onUpdate({ tipeMasukLibur: 'lembur' })}
                                    className={`rounded py-0.5 text-[8px] font-black transition-all cursor-pointer ${data.tipeMasukLibur === 'lembur'
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                        }`}
                                >
                                    Lembur
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Jam Kerja In / Out dengan Modal Dial Jam Tangan */}
                    <div className="rounded-lg p-1 border border-slate-200 bg-slate-50 space-y-1">
                        <div className="flex items-center justify-between text-[8px] font-bold text-slate-600">
                            <span className="flex items-center">
                                <Clock className="h-2 w-2 mr-0.5" />
                                Jam Kerja
                            </span>
                            {calculation.durasiKerja > 0 && (
                                <span className="font-mono text-emerald-600 font-extrabold">
                                    {calculation.durasiKerja.toFixed(1)}h
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-1">
                            <button
                                type="button"
                                onClick={() =>
                                    onRequestTimePick('jamMasuk', `Jam Masuk - Tgl ${dayNumber}`, data.jamMasuk)
                                }
                                className="w-full rounded border border-slate-200 bg-white py-0.5 px-0.5 text-center font-mono text-[9px] font-bold text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors truncate cursor-pointer"
                            >
                                {data.jamMasuk || '--:--'}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    onRequestTimePick('jamPulang', `Jam Pulang - Tgl ${dayNumber}`, data.jamPulang)
                                }
                                className="w-full rounded border border-slate-200 bg-white py-0.5 px-0.5 text-center font-mono text-[9px] font-bold text-slate-800 hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors truncate cursor-pointer"
                            >
                                {data.jamPulang || '--:--'}
                            </button>
                        </div>
                    </div>

                    {/* CEISA & ST */}
                    <div className="grid grid-cols-2 gap-1">
                        {/* Absen CEISA */}
                        <div className="rounded-lg p-1 border border-blue-100 bg-blue-50/70">
                            <div className="text-[7.5px] font-extrabold text-blue-900 mb-0.5">CEISA</div>
                            <button
                                type="button"
                                onClick={() =>
                                    onRequestTimePick('absenCeisa', `Absen CEISA - Tgl ${dayNumber}`, data.absenCeisa)
                                }
                                className="w-full rounded border border-blue-200 bg-white py-0.5 px-0.5 text-center font-mono text-[8.5px] font-bold text-blue-950 hover:bg-blue-50 transition-colors truncate cursor-pointer"
                            >
                                {data.absenCeisa || '--:--'}
                            </button>
                        </div>

                        {/* ST CP (Surat Tugas / Cuti Pengganti) */}
                        <div
                            className={`flex flex-col justify-center rounded-lg p-1 border ${canHaveST
                                    ? 'bg-purple-50 border-purple-200 text-purple-900'
                                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                                }`}
                        >
                            <label
                                className={`flex items-center justify-between ${canHaveST ? 'cursor-pointer' : 'cursor-not-allowed pointer-events-none opacity-50'
                                    }`}
                                title={canHaveST ? "ST CP (Surat Tugas Tambahan - Mendapatkan Cuti Pengganti +1)" : "ST CP hanya aktif di hari libur (Weekend / Tanggal Merah)"}
                            >
                                <span className="text-[8px] font-black">ST CP</span>
                                <input
                                    type="checkbox"
                                    disabled={!canHaveST}
                                    checked={Boolean(canHaveST && data.isSuratTugasTambahan)}
                                    onChange={(e) => {
                                        if (!canHaveST) return;
                                        onUpdate({ isSuratTugasTambahan: e.target.checked });
                                    }}
                                    className="h-3 w-3 rounded border-purple-400 text-purple-600 focus:ring-purple-500 cursor-pointer disabled:cursor-not-allowed"
                                />
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
