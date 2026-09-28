import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DayData, normalizeShift, getMobileShiftLabel, SHIFT_COLORS, LiburNasional, isPiketShift } from '../types';
import { PiketMatchInfo, OffMatchInfo } from '../utils/piket';
import { calculateDayLembur } from '../utils/lembur';
import {
    Building2,
    Container,
    Ship,
    Sun,
    Sunset,
    Moon,
    Coffee,
    Palmtree,
    X,
    Clock,
    Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ShiftDropdown } from './ShiftDropdown';
import { OffRelaxIcon } from './OffRelaxIcon';
import { BriefcaseIcon } from './BriefcaseIcon';
import { Tooltip } from './Tooltip';
import { BorderBeam } from './ui/border-beam';

interface DayCellProps {
    year: number;
    month: number;
    dayNumber: number;
    data: DayData;
    isLocked: boolean;
    holiday?: LiburNasional;
    theme: string;
    isExpandedDesktop?: boolean;
    isRightEdge?: boolean;
    isBottomEdge?: boolean;
    isSelected?: boolean;
    onToggleExpandDesktop?: (dayNumber: number) => void;
    onCloseExpandDesktop?: () => void;
    onUpdate?: (newData: Partial<DayData>) => void;
    onRequestTimePick?: (field: 'jamMasuk' | 'jamPulang' | 'absenCeisa', title: string, currentValue: string) => void;
    onOpenDetail?: (dayNumber: number) => void;
    onSelectDay?: (dayNumber: number, e: React.MouseEvent) => void;
    piketMatchInfo?: PiketMatchInfo;
    offMatchInfo?: OffMatchInfo;
    nextDayData?: DayData;
    dateKey?: string;
    onUpdateDay?: (dateKey: string, partial: Partial<DayData>) => void;
    onRequestTimePickDay?: (field: 'jamMasuk' | 'jamPulang' | 'absenCeisa', title: string, currentValue: string, dateKey: string) => void;
}

const INDONESIAN_DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const INDONESIAN_MONTH_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Komponen teks berjalan (marquee) halus tanpa glitch otomatis aktif ketika teks melebihi lebar kontainer kartu
 */
const MarqueeText: React.FC<{
    text: string;
    className?: string;
}> = React.memo(({ text, className = '' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLSpanElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        // Teks pendek (<= 6 karakter) dipastikan muat tanpa perlu ResizeObserver
        if (!text || text.length <= 6) {
            setIsOverflowing(false);
            return;
        }

        let animationFrameId: number;
        const checkOverflow = () => {
            if (containerRef.current && measureRef.current) {
                setIsOverflowing(measureRef.current.scrollWidth > containerRef.current.clientWidth + 2);
            }
        };
        checkOverflow();

        let ro: ResizeObserver | null = null;
        if (typeof window !== 'undefined' && 'ResizeObserver' in window && containerRef.current) {
            ro = new ResizeObserver(() => {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = requestAnimationFrame(checkOverflow);
            });
            ro.observe(containerRef.current);
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
            ro?.disconnect();
        };
    }, [text]);

    if (!text) return null;

    return (
        <div ref={containerRef} className={`w-full overflow-hidden whitespace-nowrap relative note-marquee-container ${className}`}>
            {/* Hidden measurement element to avoid layout flicker */}
            <span ref={measureRef} className="absolute invisible pointer-events-none opacity-0 whitespace-nowrap -z-50" aria-hidden="true">
                {text}
            </span>

            {isOverflowing ? (
                <div className="inline-flex w-max note-marquee-content animate-marquee">
                    <span className="inline-block px-2 sm:px-3">{text}</span>
                    <span className="inline-block px-2 sm:px-3" aria-hidden="true">{text}</span>
                </div>
            ) : (
                <span className="block truncate text-center w-full px-1">{text}</span>
            )}
        </div>
    );
});

/**
 * Textarea catatan yang ringkas dan proporsional (tinggi default 28px sejajar dengan input absen)
 * dan auto-expand secara terukur (maksimal 72px) jika teks memiliki beberapa baris.
 */
export const AutoResizingTextarea: React.FC<{
    value: string;
    onChange: (val: string) => void;
    onEnterSubmit: () => void;
    placeholder?: string;
    className?: string;
}> = ({ value, onChange, onEnterSubmit, placeholder = 'Catatan...', className = '' }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = () => {
        const el = textareaRef.current;
        if (!el) return;

        // Reset height terlebih dahulu agar scrollHeight terhitung akurat sesuai lebar kontainer saat ini
        el.style.height = 'auto';

        // Teks satu baris atau tanpa newline tetap berukuran ringkas 28px
        const isMultiLine = value && (value.includes('\n') || el.scrollHeight > 32);
        if (!isMultiLine) {
            el.style.height = '28px';
        } else {
            // Jika multi-baris, ekspansi proporsional dibatasi maksimal 72px agar tidak membesarkan kartu secara berlebihan
            const targetHeight = Math.min(Math.max(el.scrollHeight, 28), 72);
            el.style.height = `${targetHeight}px`;
        }
    };

    useEffect(() => {
        adjustHeight();

        // Hitung ulang dengan requestAnimationFrame dan setelah transisi kartu selesai (260ms)
        const rafId = requestAnimationFrame(adjustHeight);
        const timer = setTimeout(adjustHeight, 260);

        const handleResize = () => {
            adjustHeight();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(rafId);
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    textareaRef.current?.blur();
                    onEnterSubmit();
                }
            }}
            style={{ scrollbarWidth: 'thin' }}
            className={`w-full py-1 px-2.5 text-xs rounded-[6px] border transition-[border-color,background] resize-none overflow-y-auto leading-normal min-h-[28px] max-h-[72px] ${className}`}
        />
    );
};

const getShiftIcon = (shift: string) => {
    switch (shift) {
        case 'Graha':
            return Building2;
        case 'NPCT':
            return Container;
        case 'TPSL':
            return Ship;
        case 'SM':
            return Sun;
        case 'PM':
            return Sunset;
        case 'Malam':
            return Moon;
        case 'OFF':
            return OffRelaxIcon;
        case 'CUTI':
            return Palmtree;
        default:
            return null;
    }
};

export const DayCell = React.memo<DayCellProps>(({
    year,
    month,
    dayNumber,
    data,
    isLocked,
    holiday,
    theme,
    isExpandedDesktop = false,
    isRightEdge = false,
    isBottomEdge = false,
    isSelected = false,
    onToggleExpandDesktop,
    onCloseExpandDesktop,
    onUpdate,
    onRequestTimePick,
    onOpenDetail,
    onSelectDay,
    piketMatchInfo,
    offMatchInfo,
    nextDayData,
    dateKey,
    onUpdateDay,
    onRequestTimePickDay,
}) => {
    const handleUpdate = React.useCallback((partial: Partial<DayData>) => {
        if (onUpdateDay && dateKey) {
            onUpdateDay(dateKey, partial);
        } else if (onUpdate) {
            onUpdate(partial);
        }
    }, [onUpdateDay, dateKey, onUpdate]);

    const handleRequestTimePick = React.useCallback((field: 'jamMasuk' | 'jamPulang' | 'absenCeisa', title: string, currentVal: string) => {
        if (onRequestTimePickDay && dateKey) {
            onRequestTimePickDay(field, title, currentVal, dateKey);
        } else if (onRequestTimePick) {
            onRequestTimePick(field, title, currentVal);
        }
    }, [onRequestTimePickDay, dateKey, onRequestTimePick]);

    const dateObj = new Date(year, month - 1, dayNumber);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 6 = Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = Boolean(holiday) || Boolean(data?.isManualHoliday);
    const isWeekendOrHoliday = isWeekend || isHoliday;
    const isPiket = isPiketShift(data?.shift, isWeekendOrHoliday);
    const lemburInfo = calculateDayLembur(data, nextDayData, isWeekendOrHoliday);

    const isWinamp = theme === 'winamp';
    const isDarkFluid = theme === 'darkFluid';
    const isDark = theme === 'dark';
    const isVista = theme === 'vista';
    const isPaperSketch = theme === 'paperSketch';

    const normalizedShift = normalizeShift(data?.shift || '');
    const shiftColor = SHIFT_COLORS[normalizedShift] || SHIFT_COLORS[''];
    const ShiftIcon = getShiftIcon(normalizedShift);

    const dateNumberColor = isHoliday || isWeekend
        ? isPaperSketch
            ? 'text-[#ff4747] font-[\'Gochi_Hand\'] font-bold text-base sm:text-lg'
            : 'text-rose-500 font-black'
        : isPaperSketch
        ? 'text-[#2b2b2b] font-[\'Gochi_Hand\'] font-bold text-base sm:text-lg'
        : isWinamp
        ? 'text-[#00FF00] font-black'
        : isDarkFluid
        ? 'text-[#E6E0E9] font-black'
        : isDark
        ? 'text-white font-black'
        : 'text-slate-800 font-black';

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const expandedCardRef = useRef<HTMLDivElement>(null);

    const dayOfWeekIndex = (dayOfWeek + 6) % 7; // 0 for Monday (Senin) -> 6 for Sunday (Minggu)
    const dropdownAlign: 'left' | 'right' | 'center' =
        dayOfWeekIndex >= 4 ? 'right' : dayOfWeekIndex >= 2 ? 'center' : 'left';

    const formattedDayLabel = `${INDONESIAN_DAY_NAMES[dayOfWeek]}, ${dayNumber} ${INDONESIAN_MONTH_SHORT[month - 1]}`;

    // Helper to render attendance times (jamMasuk / jamPulang / absenCeisa) in Bell Centennial Address font right under shift
    const renderAttendanceTimeBadge = () => {
        const hasMasuk = Boolean(data?.jamMasuk);
        const hasPulang = Boolean(data?.jamPulang);
        const hasCeisa = Boolean(data?.absenCeisa);

        if (!hasMasuk && !hasPulang && !hasCeisa) return null;

        let timeText = '';
        if (hasMasuk && hasPulang) {
            timeText = `${data.jamMasuk}-${data.jamPulang}`;
        } else if (hasMasuk) {
            timeText = `M:${data.jamMasuk}`;
        } else if (hasPulang) {
            timeText = `P:${data.jamPulang}`;
        } else if (hasCeisa) {
            timeText = `C:${data.absenCeisa}`;
        }

        return (
            <div className="w-full mt-0.5 flex flex-col items-center justify-center pointer-events-none shrink-0">
                <span
                    className={`inline-flex items-center justify-center font-bell-address font-bold text-[7.2px] sm:text-[7.6px] lg:text-[8px] leading-tight px-1 py-[0.5px] rounded-[3px] border tracking-tight truncate max-w-full ${
                        isWinamp
                            ? 'bg-black text-[#00FF00] border-zinc-800 shadow-[0_0_5px_rgba(0,255,0,0.3)]'
                            : isDark || isDarkFluid
                            ? 'bg-black/75 text-teal-300 border-teal-500/40 shadow-xs'
                            : isVista
                            ? 'bg-white/95 text-sky-950 border-sky-300/90 shadow-2xs'
                            : 'bg-white/95 text-teal-950 border-teal-300/80 shadow-2xs'
                    }`}
                    title={`Jam Absen: ${timeText}`}
                >
                    {timeText}
                </span>
            </div>
        );
    };

    // Close expanded desktop card on Escape or outside click
    useEffect(() => {
        if (!isExpandedDesktop) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCloseExpandDesktop?.();
            }
        };

        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (expandedCardRef.current && !expandedCardRef.current.contains(e.target as Node)) {
                onCloseExpandDesktop?.();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isExpandedDesktop, onCloseExpandDesktop]);

    // Standard card styling with theme-based gradients and borders
    const getCardStyle = (elevated: boolean = false): React.CSSProperties => {
        if (isPaperSketch) {
            return {
                borderRadius: '4px 12px 6px 15px / 12px 4px 15px 6px',
                backgroundColor: '#ffffff',
                border: elevated ? '3px solid #ff4747' : isToday ? '2.5px solid #ff4747' : '2.5px solid #2b2b2b',
                boxShadow: elevated
                    ? '6px 6px 0px #2b2b2b'
                    : '3px 3px 0px #2b2b2b',
            };
        }
        if (isWinamp) {
            return {
                borderRadius: '0px',
                background: '#191919',
                boxShadow: elevated
                    ? 'inset 2px 2px 0 #2a2a2a, inset -2px -2px 0 #000000, 8px 8px 0px #000000'
                    : 'inset 3px 3px 0 #000000, inset -2px -2px 0 #2a2a2a',
                border: elevated ? '2px solid #00FF00' : '1.5px solid #333333',
            };
        }
        if (isDark || isDarkFluid) {
            return {
                borderRadius: '8px',
                backgroundColor: 'rgba(36, 40, 50, 1)',
                backgroundImage:
                    'linear-gradient(139deg, rgba(36, 40, 50, 1) 0%, rgba(36, 40, 50, 1) 40%, rgba(37, 28, 40, 1) 100%)',
                border: elevated ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid #42434a',
                boxShadow: elevated
                    ? '0 25px 50px -12px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
                    : '0 4px 18px -2px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            };
        }
        if (isVista) {
            return {
                borderRadius: '8px',
                backgroundColor: elevated ? 'rgba(235, 246, 255, 0.94)' : 'rgba(235, 246, 255, 0.78)',
                backgroundImage: elevated
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(224, 242, 254, 0.88) 40%, rgba(186, 230, 253, 0.80) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(224, 242, 254, 0.7) 40%, rgba(186, 230, 253, 0.55) 100%)',
                border: elevated ? '1.5px solid rgba(255, 255, 255, 0.95)' : '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: elevated
                    ? '0 25px 50px -10px rgba(14, 116, 224, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.95)'
                    : '0 6px 18px -3px rgba(14, 116, 224, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.95), inset 0 0 10px rgba(186, 230, 253, 0.3)',
                backdropFilter: 'blur(20px) saturate(190%)',
                WebkitBackdropFilter: 'blur(20px) saturate(190%)',
            };
        }
        // Default light theme: modern flat/clean solid white with clear crisp border & distinctive elevation shadow
        return {
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            border: elevated ? '1.5px solid #94a3b8' : '1px solid #cbd5e1',
            boxShadow: elevated
                ? '0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                : '0 2px 6px -1px rgba(0, 0, 0, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.05)',
        };
    };

    const isToday = useMemo(() => {
        const now = new Date();
        const curY = now.getFullYear();
        const curM = now.getMonth() + 1;
        const curD = now.getDate();
        if (curY === year && curM === month && curD === dayNumber) {
            return true;
        }
        if (dateKey) {
            const pad = (n: number) => String(n).padStart(2, '0');
            const targetIso = `${year}-${month}-${dayNumber}`;
            const targetIsoPadded = `${year}-${pad(month)}-${pad(dayNumber)}`;
            const todayIso = `${curY}-${curM}-${curD}`;
            const todayIsoPadded = `${curY}-${pad(curM)}-${pad(curD)}`;
            if (dateKey === todayIso || dateKey === todayIsoPadded || dateKey === targetIso || dateKey === targetIsoPadded) {
                return curY === year && curM === month && curD === dayNumber;
            }
        }
        return false;
    }, [year, month, dayNumber, dateKey]);

    const horizontalPositionClass = isRightEdge ? 'right-0' : 'left-0';
    const verticalPositionClass = isBottomEdge ? 'bottom-0' : 'top-0';

    const beamColorVariant = isWinamp ? 'forest' : isVista ? 'ocean' : (isDark || isDarkFluid) ? 'candy' : 'colorful';
    const beamTheme = (isDark || isDarkFluid || isWinamp) ? 'dark' : 'light';

    const innerCardContent = (
        <div
            className={`relative z-10 w-full h-full ${
                isExpandedDesktop ? 'overflow-visible' : 'rounded-[8px] overflow-hidden'
            }`}
        >
            {/* 1. COMPACT VIEW ON MOBILE: 1:1 SQUARE ASPECT RATIO */}
            <div
                data-day-number={dayNumber}
                role="button"
                tabIndex={0}
                aria-label={`Detail tanggal ${dayNumber}`}
                style={getCardStyle(false)}
                onClick={(e) => {
                    onSelectDay?.(dayNumber, e);
                    onOpenDetail?.(dayNumber);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onOpenDetail?.(dayNumber);
                    }
                }}
                className={`md:hidden flex flex-col justify-between p-1 sm:p-1.5 transition-transform duration-150 ease-out select-none w-full h-full cursor-pointer hover:scale-[1.02] active:scale-[0.98] transform-gpu outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 overflow-hidden ${
                    isPaperSketch
                        ? 'text-[#2b2b2b]'
                        : isWinamp
                        ? 'text-[#00FF00] font-mono'
                        : isDark || isDarkFluid
                        ? 'text-slate-200 hover:border-indigo-400/50'
                        : 'text-slate-900 hover:border-indigo-400/50'
                }`}
                title="Klik untuk membuka kartu detail tanggal ini (Klik kanan untuk menu salin/presensi)"
            >
                {/* Top Section: Tanggal & Indikator + Shift langsung di bawah tanggal */}
                <div className="w-full shrink-0">
                    {/* Header: Tanggal & Indikator */}
                    <div className="flex items-start justify-between gap-1">
                        <span className={`text-[13px] sm:text-[15px] font-black leading-none ${dateNumberColor}`}>
                            {dayNumber}
                        </span>
                        <div className="flex items-center gap-1">
                            {(() => {
                                const icons: React.ReactNode[] = [];

                                if (lemburInfo) {
                                    icons.push(
                                        <span
                                            key="lembur"
                                            className={`inline-flex items-center justify-center shrink-0 ${
                                                isWinamp
                                                    ? 'text-[#00FF00]'
                                                    : isDark || isDarkFluid
                                                    ? 'text-amber-400'
                                                    : isVista
                                                    ? 'text-sky-700'
                                                    : 'text-amber-600'
                                            }`}
                                            title={lemburInfo.fullText}
                                        >
                                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-xs" />
                                        </span>
                                    );
                                }

                                if (isPiket) {
                                    icons.push(
                                        <BriefcaseIcon
                                            key="piket"
                                            theme={theme}
                                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-xs shrink-0"
                                            title={
                                                piketMatchInfo?.status === 'no_off_entitlement'
                                                    ? 'Jadwal Piket SM Hari Kerja (Tanpa OFF Pengganti)'
                                                    : piketMatchInfo?.status === 'matched'
                                                    ? `Jadwal Piket (OFF Pengganti: ${piketMatchInfo.offDateLabel})`
                                                    : 'Jadwal Piket (OFF Pengganti dijatahkan ke bulan berikutnya)'
                                            }
                                        />
                                    );
                                }

                                if (offMatchInfo) {
                                    icons.push(
                                        <span
                                            key="off"
                                            className="inline-flex items-center shrink-0"
                                            title={`OFF Pengganti untuk Piket (${offMatchInfo.piketDateLabel})`}
                                        >
                                            <OffRelaxIcon theme={theme} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </span>
                                    );
                                }

                                if (holiday) {
                                    icons.push(
                                        <span
                                            key="holiday"
                                            className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500 animate-pulse shrink-0"
                                            title={holiday.keterangan}
                                        />
                                    );
                                }

                                return icons.slice(0, 2);
                            })()}
                        </div>
                    </div>

                    {/* Shift Badge (di bawah tanggal) */}
                    <div className="w-full mt-1">
                        {normalizedShift ? (
                            <div
                                className={`w-full py-0.5 px-0.5 rounded-[4px] text-center font-black border flex items-center justify-center gap-0.5 shadow-2xs overflow-hidden ${shiftColor.bg} ${shiftColor.text} ${shiftColor.border}`}
                                title={`Shift: ${normalizedShift}`}
                            >
                                {ShiftIcon && (
                                    <ShiftIcon
                                        className={`${
                                            normalizedShift.length >= 5 ? 'hidden min-[480px]:inline-block' : 'inline-block'
                                        } w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 opacity-80`}
                                    />
                                )}
                                <span
                                    className={`font-black text-center whitespace-nowrap uppercase leading-none ${
                                        normalizedShift.length >= 5
                                            ? 'text-[7px] min-[360px]:text-[7.5px] min-[400px]:text-[8.5px] sm:text-[9.5px] lg:text-[11px] tracking-[-0.05em]'
                                            : normalizedShift.length === 4
                                            ? 'text-[8.5px] min-[360px]:text-[9px] min-[400px]:text-[10px] sm:text-[10.5px] lg:text-[11.5px] tracking-tighter'
                                            : 'text-[9.5px] min-[400px]:text-[10px] sm:text-[10.5px] lg:text-[11.5px] tracking-tight'
                                    }`}
                                >
                                    {normalizedShift.toUpperCase()}
                                </span>
                            </div>
                        ) : (
                            <div
                                className={`w-full py-0.5 text-center text-[11px] sm:text-[12px] font-bold rounded-[4px] border border-dashed flex items-center justify-center ${
                                    isWinamp
                                        ? 'border-zinc-700 text-zinc-600 font-mono'
                                        : 'border-slate-500/30 text-slate-400 dark:text-slate-500'
                                }`}
                            >
                                -
                            </div>
                        )}
                    </div>

                    {/* Jam Absen disembunyikan di kartu mobile sesuai permintaan (sudah ada indikator lembur) */}
                </div>

                {/* Bottom area: Catatan disembunyikan pada kartu mobile sesuai permintaan */}
                <div className="h-0.5 shrink-0" aria-hidden="true" />
            </div>

            {/* 2. DESKTOP VIEW: UNIFIED EXPANDING CARD (MORPHS FROM 1:1 TO 4:4 / 2x2 ON CLICK) */}
            <div
                data-day-number={dayNumber}
                ref={expandedCardRef}
                role="button"
                tabIndex={0}
                aria-label={isExpandedDesktop ? `Formulir tanggal ${dayNumber}` : `Buka formulir tanggal ${dayNumber}`}
                style={{
                    ...getCardStyle(isExpandedDesktop),
                    zIndex: isExpandedDesktop ? 70 : isDropdownOpen ? 45 : 1,
                }}
                onClick={(e) => {
                    onSelectDay?.(dayNumber, e);
                    if (!isExpandedDesktop) {
                        onToggleExpandDesktop?.(dayNumber);
                    }
                }}
                onKeyDown={(e) => {
                    if (!isExpandedDesktop && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onToggleExpandDesktop?.(dayNumber);
                    }
                }}
                className={`hidden md:flex flex-col justify-between absolute ${verticalPositionClass} ${horizontalPositionClass} transition-[width,height,min-height,box-shadow,border-color,background] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] select-none transform-gpu outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isExpandedDesktop
                        ? 'overflow-visible w-[calc(200%+0.375rem)] min-h-[max(270px,calc(200%+0.375rem))] p-3 sm:p-3.5 cursor-default'
                        : 'overflow-hidden rounded-[8px] w-full h-full px-1.5 py-1 sm:px-2 sm:py-1.5 cursor-pointer hover:scale-[1.015] active:scale-[0.99] hover:z-40 focus-within:z-40'
                } ${
                    isPaperSketch
                        ? 'text-[#2b2b2b]'
                        : isWinamp
                        ? 'text-[#00FF00] font-mono text-xs'
                        : isDark || isDarkFluid
                        ? 'text-slate-200'
                        : 'text-slate-900'
                }`}
                title={isExpandedDesktop ? undefined : 'Klik untuk membuka formulir kartu tanggal'}
            >
                {/* Top Section */}
                <div className="w-full shrink-0">
                    {/* Header: Tanggal & Indikator (Smoothly adapts header in expanded state) */}
                    <div
                        className={`flex items-start justify-between gap-1 min-w-0 transition-all duration-200 ${
                            isExpandedDesktop
                                ? isPaperSketch
                                    ? 'pb-1.5 border-b-2 border-dashed border-[#2b2b2b]'
                                    : isWinamp
                                    ? 'pb-1.5 border-b border-zinc-800'
                                    : isDark || isDarkFluid
                                    ? 'pb-1.5 border-b border-white/10'
                                    : isVista
                                    ? 'pb-1.5 border-b border-sky-300/40'
                                    : 'pb-1.5 border-b border-slate-200'
                                : ''
                        }`}
                    >
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span
                                className={`leading-none font-black transition-all duration-200 ${
                                    isExpandedDesktop
                                        ? 'text-base sm:text-lg'
                                        : 'text-[13px] sm:text-[14px] lg:text-[15px]'
                                } ${dateNumberColor}`}
                            >
                                {dayNumber}
                            </span>

                            {isExpandedDesktop && (
                                <span
                                    className={`text-xs font-bold truncate transition-opacity duration-200 ${
                                        isWinamp
                                            ? 'text-[#00FF00]/80'
                                            : isDark || isDarkFluid
                                            ? 'text-slate-300'
                                            : 'text-slate-700'
                                    }`}
                                >
                                    — {formattedDayLabel}
                                </span>
                            )}

                            {/* Keterangan hari libur dihapus dari kartu tanggal karena sudah tersedia di sidebar kanan */}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                             {lemburInfo && (
                                <Tooltip
                                    content={<span><strong>{lemburInfo.fullText}</strong></span>}
                                    placement="top"
                                >
                                    <span
                                        className={`font-sans text-[9px] lg:text-[10px] font-bold tracking-tight px-1 py-0.5 rounded-[4px] border tabular-nums shrink-0 leading-none cursor-help ${
                                            isWinamp
                                                ? 'bg-black text-[#00FF00] border-[#00FF00]/80'
                                                : isDark || isDarkFluid
                                                ? 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                                                : isVista
                                                ? 'bg-sky-100/90 text-sky-950 border-sky-300/80'
                                                : 'bg-amber-50 text-amber-900 border-amber-300/80 shadow-2xs'
                                        }`}
                                    >
                                        {lemburInfo.shortText}
                                    </span>
                                </Tooltip>
                            )}
                            {isPiket && (
                                <Tooltip
                                    content={
                                        piketMatchInfo?.status === 'no_off_entitlement' ? (
                                            <span><strong>Piket SM Hari Kerja</strong> (Tanpa OFF)</span>
                                        ) : piketMatchInfo?.status === 'matched' ? (
                                            <span><strong>Jadwal Piket</strong> — OFF: <i>{piketMatchInfo.offDateLabel}</i></span>
                                        ) : (
                                            <span><strong>Jadwal Piket</strong> — OFF: <i>Dijatahkan ke bulan berikutnya</i></span>
                                        )
                                    }
                                    placement="top"
                                >
                                    <BriefcaseIcon
                                        theme={theme}
                                        className="w-3.5 h-3.5 lg:w-4 lg:h-4 drop-shadow-xs shrink-0 cursor-help"
                                    />
                                </Tooltip>
                            )}
                            {offMatchInfo && (
                                <Tooltip
                                    content={<span><strong>OFF Pengganti</strong> untuk Piket <i>{offMatchInfo.piketDateLabel}</i></span>}
                                    placement="top"
                                >
                                    <span className="inline-flex items-center shrink-0 cursor-help">
                                        <OffRelaxIcon theme={theme} className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                                    </span>
                                </Tooltip>
                            )}
                            {isExpandedDesktop && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCloseExpandDesktop?.();
                                    }}
                                    className={`p-1 rounded-[4px] transition-colors cursor-pointer shrink-0 ${
                                        isWinamp
                                            ? 'hover:bg-zinc-800 text-[#00FF00]'
                                            : isVista
                                            ? 'hover:bg-rose-500/20 hover:text-rose-600 text-sky-800'
                                            : 'hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white'
                                    }`}
                                    title="Lipat kartu (Esc)"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Shift Selector directly below date when compact, or in form flow when expanded */}
                    <div
                        className={`w-full relative z-30 transition-all duration-200 ${
                            isExpandedDesktop ? 'my-2' : 'mt-0.5 sm:mt-1'
                        }`}
                    >
                        {isExpandedDesktop && (
                            <label
                                className={`text-[9px] font-bold uppercase tracking-wider block mb-1 ${
                                    isWinamp
                                        ? 'text-[#00FF00]/70'
                                        : isDark || isDarkFluid
                                        ? 'text-slate-400'
                                        : isVista
                                    ? 'text-sky-900/80'
                                    : 'text-slate-500'
                                }`}
                            >
                                Shift Kerja
                            </label>
                        )}
                        <ShiftDropdown
                            value={normalizedShift}
                            disabled={isLocked}
                            theme={theme}
                            compact={!isExpandedDesktop}
                            align={dropdownAlign}
                            onChange={(val) => handleUpdate({ shift: val })}
                            onOpenChange={setIsDropdownOpen}
                        />

                        {/* Jam Absen di Bawah Shift pada kartu terlipat/compact */}
                        {!isExpandedDesktop && renderAttendanceTimeBadge()}
                    </div>
                </div>

                {/* Celah kosong untuk indikator lainnya mendatang (sebesar tampilan icon serta sedikit padding) */}
                {!isExpandedDesktop && (
                    <div
                        className="w-full h-0.5 shrink-0"
                        aria-hidden="true"
                        data-slot="future-indicators"
                    />
                )}

                {/* Bottom area: Catatan teks dengan garis atas & bawah + teks berjalan ketika compact */}
                {!isExpandedDesktop && (
                    data?.note ? (
                        <div className="w-full shrink-0 mt-auto pt-0.5 hidden xl:block">
                            <div
                                className={`w-full py-0.5 border-y text-[8.5px] sm:text-[9.5px] font-semibold transition-colors overflow-hidden ${
                                    isWinamp
                                        ? 'border-zinc-800 text-[#00FF00]/90 font-mono'
                                        : isDark || isDarkFluid
                                        ? 'border-white/10 text-slate-300'
                                        : isVista
                                        ? 'border-sky-300/50 text-sky-950 font-bold'
                                        : 'border-slate-200 text-slate-700'
                                }`}
                                title={data.note}
                            >
                                <MarqueeText text={data.note} />
                            </div>
                        </div>
                    ) : (
                        <div className="h-0.5 shrink-0" aria-hidden="true" />
                    )
                )}

                {/* Detailed Form Elements: Masuk, Pulang, Absen CEISA, Catatan, Selesai */}
                <AnimatePresence>
                    {isExpandedDesktop && (
                        <motion.div
                            key={`expanded-desktop-form-${dateKey || dayNumber}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4, transition: { duration: 0.1 } }}
                            transition={{ duration: 0.2, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
                            className="space-y-2 pt-1 border-t border-black/5 dark:border-white/10 w-full"
                        >
                            {/* Jam Masuk & Jam Pulang */}
                            <div className="grid grid-cols-2 gap-2 relative z-10">
                                <div className="space-y-0.5">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider block ${
                                        isWinamp
                                            ? 'text-[#00FF00]/70'
                                            : isDark || isDarkFluid
                                            ? 'text-slate-400'
                                            : isVista
                                            ? 'text-sky-900/80'
                                            : 'text-slate-500'
                                    }`}>
                                        Masuk
                                    </span>
                                    {onRequestTimePick || onRequestTimePickDay ? (
                                        <button
                                            type="button"
                                            onClick={() => handleRequestTimePick('jamMasuk', `Jam Masuk - Tgl ${dayNumber}`, data?.jamMasuk || '')}
                                            className={`w-full py-1.5 px-1.5 text-center font-bell-address text-xs font-bold rounded-[6px] border transition-colors cursor-pointer ${
                                                isWinamp
                                                    ? 'bg-black text-[#00FF00] border-zinc-700 hover:border-[#00FF00]'
                                                    : isDark || isDarkFluid
                                                    ? 'bg-[#2B2930] text-[#E6E0E9] border-white/10 hover:border-indigo-400/50'
                                                    : isVista
                                                    ? 'bg-white/90 text-sky-950 border-sky-300/80 hover:border-sky-400 shadow-2xs'
                                                    : 'bg-white/90 text-slate-800 border-slate-300 hover:border-indigo-400 shadow-2xs'
                                            }`}
                                        >
                                            {data?.jamMasuk || '--:--'}
                                        </button>
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder="07:30"
                                            value={data?.jamMasuk || ''}
                                            onChange={(e) => handleUpdate({ jamMasuk: e.target.value })}
                                            className={`w-full py-1.5 px-1.5 text-center font-bell-address text-xs rounded-[6px] border ${
                                                isWinamp
                                                    ? 'bg-black border-zinc-700 text-[#00FF00]'
                                                    : isDark || isDarkFluid
                                                    ? 'bg-[#2B2930] border-white/10 text-[#E6E0E9]'
                                                    : isVista
                                                    ? 'border-sky-300/80 bg-white/90 text-sky-950 shadow-2xs'
                                                    : 'border-slate-300 bg-white/90 text-slate-800'
                                            }`}
                                        />
                                    )}
                                </div>

                                <div className="space-y-0.5">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider block ${
                                        isWinamp
                                            ? 'text-[#00FF00]/70'
                                            : isDark || isDarkFluid
                                            ? 'text-slate-400'
                                            : isVista
                                            ? 'text-sky-900/80'
                                            : 'text-slate-500'
                                    }`}>
                                        Pulang
                                    </span>
                                    {onRequestTimePick || onRequestTimePickDay ? (
                                        <button
                                            type="button"
                                            onClick={() => handleRequestTimePick('jamPulang', `Jam Pulang - Tgl ${dayNumber}`, data?.jamPulang || '')}
                                            className={`w-full py-1.5 px-1.5 text-center font-bell-address text-xs font-bold rounded-[6px] border transition-colors cursor-pointer ${
                                                isWinamp
                                                    ? 'bg-black text-[#00FF00] border-zinc-700 hover:border-[#00FF00]'
                                                    : isDark || isDarkFluid
                                                    ? 'bg-[#2B2930] text-[#E6E0E9] border-white/10 hover:border-indigo-400/50'
                                                    : isVista
                                                    ? 'bg-white/90 text-sky-950 border-sky-300/80 hover:border-sky-400 shadow-2xs'
                                                    : 'bg-white/90 text-slate-800 border-slate-300 hover:border-indigo-400 shadow-2xs'
                                            }`}
                                        >
                                            {data?.jamPulang || '--:--'}
                                        </button>
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder="17:00"
                                            value={data?.jamPulang || ''}
                                            onChange={(e) => handleUpdate({ jamPulang: e.target.value })}
                                            className={`w-full py-1.5 px-1.5 text-center font-bell-address text-xs rounded-[6px] border ${
                                                isWinamp
                                                    ? 'bg-black border-zinc-700 text-[#00FF00]'
                                                    : isDark || isDarkFluid
                                                    ? 'bg-[#2B2930] border-white/10 text-[#E6E0E9]'
                                                    : isVista
                                                    ? 'border-sky-300/80 bg-white/90 text-sky-950 shadow-2xs'
                                                    : 'border-slate-300 bg-white/90 text-slate-800'
                                            }`}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Absen CEISA & Catatan */}
                            <div className="grid grid-cols-2 gap-2 relative z-10 items-start">
                                <div className="space-y-0.5">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider block ${
                                        isWinamp
                                            ? 'text-[#00FF00]/70'
                                            : isDark || isDarkFluid
                                            ? 'text-slate-400'
                                            : isVista
                                            ? 'text-sky-900/80'
                                            : 'text-slate-500'
                                    }`}>
                                        Absen CEISA
                                    </span>
                                    {onRequestTimePick || onRequestTimePickDay ? (
                                        <button
                                            type="button"
                                            onClick={() => handleRequestTimePick('absenCeisa', `Absen CEISA - Tgl ${dayNumber}`, data?.absenCeisa || '')}
                                            className={`w-full py-1 px-1.5 text-center font-digital-clock text-xs rounded-[6px] border transition-colors flex items-center justify-center space-x-1 cursor-pointer ${
                                                data?.absenCeisa
                                                    ? isWinamp
                                                        ? 'bg-black border-[#00FF00] text-[#00FF00] font-bold'
                                                        : isDark || isDarkFluid
                                                        ? 'bg-indigo-600/30 border-indigo-500/40 text-indigo-200 font-bold'
                                                        : isVista
                                                        ? 'bg-sky-400/25 border-sky-400/80 text-sky-950 font-bold shadow-2xs'
                                                        : 'bg-sky-500/20 border-sky-400/50 text-sky-800 font-bold shadow-2xs'
                                                    : isWinamp
                                                    ? 'bg-black text-zinc-500 border-zinc-700 hover:border-[#00FF00]'
                                                    : isDark || isDarkFluid
                                                    ? 'bg-[#2B2930] text-slate-300 border-white/10 hover:border-indigo-400/50'
                                                    : isVista
                                                    ? 'bg-white/90 text-sky-800 border-sky-300/80 hover:border-sky-400 shadow-2xs'
                                                    : 'bg-white/90 text-slate-600 border-slate-300 hover:border-sky-400 shadow-2xs'
                                            }`}
                                        >
                                            <Clock className="w-3 h-3 opacity-70 shrink-0" />
                                            <span className="truncate">{data?.absenCeisa || '--:--'}</span>
                                        </button>
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder="07:30"
                                            value={data?.absenCeisa || ''}
                                            onChange={(e) => handleUpdate({ absenCeisa: e.target.value })}
                                            className={`w-full py-1 px-1.5 text-center font-mono text-xs rounded-[6px] border ${
                                                isWinamp
                                                    ? 'bg-black border-zinc-700 text-[#00FF00]'
                                                    : isDark || isDarkFluid
                                                    ? 'bg-[#2B2930] border-white/10 text-[#E6E0E9]'
                                                    : isVista
                                                    ? 'border-sky-300/80 bg-white/90 text-sky-950 shadow-2xs'
                                                    : 'border-slate-300 bg-white/90 text-slate-800'
                                            }`}
                                        />
                                    )}
                                </div>

                                <div className="space-y-0.5">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider block ${
                                        isWinamp
                                            ? 'text-[#00FF00]/70'
                                            : isDark || isDarkFluid
                                            ? 'text-slate-400'
                                            : isVista
                                            ? 'text-sky-900/80'
                                            : 'text-slate-500'
                                    }`}>
                                        Catatan
                                    </span>
                                    <AutoResizingTextarea
                                        value={data?.note || ''}
                                        placeholder="Catatan..."
                                        onChange={(val) => handleUpdate({ note: val })}
                                        onEnterSubmit={() => onCloseExpandDesktop?.()}
                                        className={
                                            isWinamp
                                                ? 'bg-black border-zinc-700 text-[#00FF00] placeholder-zinc-600 focus:border-[#00FF00] font-mono'
                                                : isDark || isDarkFluid
                                                ? 'bg-[#2B2930] border-white/10 text-slate-100 placeholder-slate-500 focus:border-indigo-400'
                                                : isVista
                                                ? 'bg-white/90 border-sky-300/80 text-sky-950 placeholder-sky-700/50 focus:border-sky-500 shadow-2xs'
                                                : 'bg-white/90 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500 shadow-2xs'
                                        }
                                    />
                                </div>
                            </div>

                            {/* Footer: Tombol Selesai */}
                            <div className="pt-1">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCloseExpandDesktop?.();
                                    }}
                                    className={`w-full py-1.5 rounded-[6px] text-xs font-black transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-1 ${
                                        isWinamp
                                            ? 'bg-[#00FF00] text-black hover:bg-emerald-400 font-mono'
                                            : isDarkFluid
                                            ? 'bg-[#D0BCFF] text-[#381E72] hover:bg-[#E8DEF8]'
                                            : isDark
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                                            : isVista
                                            ? 'bg-gradient-to-b from-[#4facfe] via-[#00a2ff] to-[#0072ff] text-white shadow-[0_3px_8px_rgba(0,114,255,0.35)] hover:brightness-110 active:brightness-95 border border-sky-300/60'
                                            : 'bg-[#2EC4B6] text-white hover:bg-[#25a89c]'
                                    }`}
                                >
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    <span>Selesai</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );

    return (
        <div
            data-day-number={dayNumber}
            className={`relative w-full h-full rounded-[8px] transition-all duration-150 ${
                isExpandedDesktop
                    ? 'z-[60] overflow-visible'
                    : isDropdownOpen
                    ? 'z-40'
                    : 'z-[1]'
            } ${
                isToday
                    ? `rounded-[10px] ${isExpandedDesktop ? 'overflow-visible' : ''}`
                    : ''
            }`}
        >
            {isToday && !isExpandedDesktop ? (
                <BorderBeam
                    size="md"
                    colorVariant={beamColorVariant}
                    theme={beamTheme}
                    borderRadius={8}
                    className="w-full h-full"
                >
                    {innerCardContent}
                </BorderBeam>
            ) : (
                innerCardContent
            )}
        </div>
    );
});
