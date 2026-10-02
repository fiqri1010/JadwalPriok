import React, { useState, useEffect } from 'react';
import { DayData, normalizeShift, LiburNasional, isPiketShift } from '../types';
import { PiketMatchInfo, OffMatchInfo } from '../utils/piket';
import { Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { ShiftDropdown } from './ShiftDropdown';
import { OffRelaxIcon } from './OffRelaxIcon';
import { BriefcaseIcon } from './BriefcaseIcon';
import { AutoResizingTextarea } from './DayCell';
import { calculateDayLembur } from '../utils/lembur';

export interface DayDetailModalProps {
    isOpen: boolean;
    dayNumber: number;
    year: number;
    month: number;
    daysInMonth: number;
    data: DayData;
    nextDayData?: DayData | null;
    isLocked: boolean;
    holiday?: LiburNasional;
    theme: string;
    onClose: () => void;
    onNavigateDay: (targetDay: number) => void;
    onUpdate: (newData: Partial<DayData>) => void;
    onRequestTimePick?: (field: 'jamMasuk' | 'jamPulang' | 'absenCeisa', title: string, currentValue: string) => void;
    piketMatchInfo?: PiketMatchInfo;
    offMatchInfo?: OffMatchInfo;
    initialSubTab?: 'shift' | 'geser_off' | 'st' | 'leave';
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
    isOpen,
    dayNumber,
    year,
    month,
    daysInMonth,
    data,
    nextDayData,
    isLocked,
    holiday,
    theme,
    onClose,
    onNavigateDay,
    onUpdate,
    onRequestTimePick,
    piketMatchInfo,
    offMatchInfo,
    initialSubTab = 'shift',
}) => {
    const [activeSubTab, setActiveSubTab] = useState<'shift' | 'geser_off' | 'st' | 'leave'>(initialSubTab);

    useEffect(() => {
        if (initialSubTab) {
            setActiveSubTab(initialSubTab);
        }
    }, [initialSubTab, dayNumber]);
    const [geserSourceDate, setGeserSourceDate] = useState(data?.geserOffInfo?.sourceDate || '');
    const [geserEarnedDays, setGeserEarnedDays] = useState<number>(data?.geserOffInfo?.earnedDays || 1);

    const [stCat, setStCat] = useState<string>(data?.stInfo?.stType || 'Pemeriksaan Luar Kawasan Pabean');
    const [stTentative, setStTentative] = useState<boolean>(data?.stInfo?.isTentative ?? false);
    const [stReward, setStReward] = useState<'Cuti Bersama' | 'Off Pengganti' | 'None'>(data?.stInfo?.rewardType || 'Off Pengganti');

    const [leaveCat, setLeaveCat] = useState<string>(data?.leaveInfo?.leaveType || 'Cuti Tahunan');
    const [halfDay, setHalfDay] = useState<'pagi' | 'siang'>(data?.leaveInfo?.halfDayType || 'pagi');
    const dateObj = new Date(year, month - 1, dayNumber);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 6 = Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = Boolean(holiday) || Boolean(data?.isManualHoliday);
    const isWeekendOrHoliday = isWeekend || isHoliday;
    const isPiket = isPiketShift(data?.shift, isWeekendOrHoliday);

    const isWinamp = theme === 'winamp';
    const isDark = theme === 'dark';
    const isVista = theme === 'vista';
    const isPaperSketch = theme === 'paperSketch';
    const isIndustrial = theme === 'industrial';
    const isTechnical = theme === 'technical';
    const isEditorial = theme === 'editorial';
    const isDashboard = theme === 'dashboard';

    const normalizedShift = normalizeShift(data?.shift || '');

    const indonesianDayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const indonesianMonthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const fullDateLabel = `${indonesianDayNames[dayOfWeek]}, ${dayNumber} ${indonesianMonthNames[month - 1]} ${year}`;

    const dateNumberColor = isHoliday || isWeekend
        ? isPaperSketch
            ? 'text-[#ff4747] font-[\'Gochi_Hand\']'
            : 'text-rose-500 font-black'
        : isPaperSketch
        ? 'text-[#2b2b2b] font-[\'Gochi_Hand\']'
        : isWinamp
        ? 'text-[#00FF00] font-black'
        : isDark
        ? 'text-white font-black'
        : 'text-slate-900 font-black';

    // Theme-specific modal card styles
    const getCardStyle = (): React.CSSProperties => {
        if (isPaperSketch) {
            return {
                borderRadius: '16px',
                backgroundColor: '#ffffff',
                color: '#2b2b2b',
                border: '3px solid #2b2b2b',
                boxShadow: '8px 8px 0px #2b2b2b',
                fontFamily: "'Gaegu', cursive, sans-serif",
            };
        }
        if (isWinamp) {
            return {
                borderRadius: '0px',
                backgroundColor: '#121212',
                color: '#00FF00',
                boxShadow: 'inset 2px 2px 0 #2a2a2a, inset -2px -2px 0 #000000, 6px 6px 0px #000000',
                border: '2px solid #00FF00',
            };
        }
        if (isIndustrial) {
            return {
                borderRadius: '8px',
                backgroundColor: '#1A1D23',
                border: '1px solid rgba(226, 232, 240, 0.15)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                color: '#E2E8F0',
                fontFamily: "'JetBrains Mono', monospace",
            };
        }
        if (isDark) {
            return {
                borderRadius: '12px',
                backgroundColor: '#1E1E24',
                backgroundImage: 'linear-gradient(139deg, #262732 0%, #1A1A20 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                color: '#F1F5F9',
            };
        }
        if (isVista) {
            return {
                borderRadius: '12px',
                backgroundColor: 'rgba(235, 245, 255, 0.85)',
                backgroundImage:
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(224, 242, 254, 0.82) 35%, rgba(186, 230, 253, 0.70) 70%, rgba(215, 238, 255, 0.90) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                boxShadow:
                    '0 30px 60px -12px rgba(10, 45, 95, 0.42), 0 12px 28px -6px rgba(14, 116, 224, 0.26), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.98), inset 0 0 24px rgba(186, 230, 253, 0.45)',
                backdropFilter: 'blur(28px) saturate(210%) brightness(104%)',
                WebkitBackdropFilter: 'blur(28px) saturate(210%) brightness(104%)',
                color: '#0F172A',
            };
        }
        if (isDashboard) {
            return {
                borderRadius: '12px',
                backgroundColor: '#FFFBF0',
                backgroundImage: 'linear-gradient(139deg, #FFFBF0 0%, #FFF5D0 100%)',
                border: '1px solid rgba(77, 42, 0, 0.3)',
                boxShadow: '0 20px 45px -10px rgba(77, 42, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                color: '#4D2A00',
                fontFamily: '"Inter", sans-serif',
            };
        }
        // Default light theme
        return {
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            backgroundImage: 'linear-gradient(139deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #cbd5e1',
            boxShadow: '0 20px 45px -10px rgba(50, 50, 93, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
            color: '#0F172A',
        };
    };

    const handlePrev = () => {
        if (dayNumber > 1) {
            onNavigateDay(dayNumber - 1);
        }
    };

    const handleNext = () => {
        if (dayNumber < daysInMonth) {
            onNavigateDay(dayNumber + 1);
        }
    };

    // Keyboard navigation (ArrowLeft & ArrowRight & Escape)
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                handlePrev();
            } else if (e.key === 'ArrowRight') {
                handleNext();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, dayNumber, daysInMonth]);

    // High performance Framer Motion Drag Handler
    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 35;
        const velocityThreshold = 200;

        if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
            handleNext();
        } else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
            handlePrev();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div
                key="day-detail-modal-root"
                className="fixed inset-0 sm:top-7 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm select-none"
                onClick={onClose}
            >
                {/* Hardware-accelerated Swipeable Card */}
                <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.12}
                    onDragEnd={handleDragEnd}
                    initial={{ opacity: 0, scale: 0.96, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 6 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        ...getCardStyle(),
                        willChange: 'transform, opacity',
                    }}
                    className={`w-[92vw] max-w-[325px] sm:max-w-[345px] p-4 sm:p-5 flex flex-col justify-between space-y-3 relative overflow-visible transform-gpu cursor-grab active:cursor-grabbing ${
                        isWinamp
                            ? 'text-[#00FF00] font-mono'
                            : isDark
                            ? 'text-[#E6E0E9]'
                            : isVista
                            ? 'text-sky-950'
                            : isDashboard
                            ? 'text-[#4D2A00]'
                            : 'text-slate-900'
                    }`}
                >
                    {/* Vista Aero Glass Specular Sheen Overlay */}
                    {isVista && (
                        <div
                            aria-hidden="true"
                            className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-white/60 via-white/20 to-transparent rounded-t-[11px] pointer-events-none"
                        />
                    )}

                    {/* Header Navigasi Tanggal */}
                    <div className={`flex items-start justify-between pb-2 border-b relative z-10 ${
                        isWinamp
                            ? 'border-zinc-800'
                            : isDark
                            ? 'border-white/10'
                            : isVista
                            ? 'border-sky-300/40'
                            : isDashboard
                            ? 'border-[#4D2A00]/25'
                            : 'border-slate-200'
                    }`}>
                        <div className="flex items-center space-x-2 min-w-0">
                            {/* Tombol Navigasi Tanggal Sebelumnya */}
                            <button
                                type="button"
                                disabled={dayNumber <= 1}
                                onClick={handlePrev}
                                className={`p-1.5 rounded-[6px] border transition-colors cursor-pointer shrink-0 ${
                                    dayNumber <= 1
                                        ? 'opacity-25 cursor-not-allowed border-transparent'
                                        : isWinamp
                                        ? 'border-zinc-700 bg-black text-[#00FF00] hover:border-[#00FF00]'
                                        : isDark
                                        ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white'
                                        : isVista
                                        ? 'border-sky-300/80 bg-white/80 hover:bg-white text-sky-900 shadow-xs'
                                        : isDashboard
                                        ? 'border-[#4D2A00]/30 bg-[#FFF0BE]/80 hover:bg-[#FFF0BE] text-[#4D2A00] shadow-xs'
                                        : 'border-slate-300 bg-white/90 hover:bg-white text-slate-700 shadow-2xs'
                                }`}
                                title="Tanggal sebelumnya (Geser kanan)"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <div className="min-w-0">
                                <h3 className={`text-xs sm:text-sm font-black leading-tight truncate ${dateNumberColor}`}>
                                    {fullDateLabel}
                                </h3>
                                {holiday && (
                                    <span className="inline-block mt-0.5 text-[9.5px] px-1.5 py-0.5 rounded-[4px] bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold truncate max-w-[160px] mr-1">
                                        {holiday.keterangan}
                                    </span>
                                )}
                                {isPiket && (
                                    <span className={`inline-flex items-center gap-1 mt-0.5 text-[9.5px] px-1.5 py-0.5 rounded-[4px] font-bold border ${
                                        piketMatchInfo?.status === 'no_off_entitlement'
                                            ? 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30'
                                            : piketMatchInfo?.status === 'matched'
                                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                    }`}>
                                        <BriefcaseIcon theme={theme} className="w-3.5 h-3.5 shrink-0" />
                                        <span>
                                            Piket {
                                                piketMatchInfo?.status === 'no_off_entitlement'
                                                    ? '(Tanpa OFF)'
                                                    : piketMatchInfo?.status === 'matched'
                                                    ? `(OFF: ${piketMatchInfo.offDateLabel})`
                                                    : '(OFF Dijatahkan)'
                                            }
                                        </span>
                                    </span>
                                )}
                                {offMatchInfo && (
                                    <span className="inline-flex items-center gap-1 mt-0.5 text-[9.5px] px-1.5 py-0.5 rounded-[4px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 ml-1">
                                        <OffRelaxIcon theme={theme} className="w-3.5 h-3.5 shrink-0" />
                                        <span>OFF Pengganti Piket ({offMatchInfo.piketDateLabel})</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0 ml-1">
                            {/* Tombol Navigasi Tanggal Berikutnya */}
                            <button
                                type="button"
                                disabled={dayNumber >= daysInMonth}
                                onClick={handleNext}
                                className={`p-1.5 rounded-[6px] border transition-colors cursor-pointer ${
                                    dayNumber >= daysInMonth
                                        ? 'opacity-25 cursor-not-allowed border-transparent'
                                        : isWinamp
                                        ? 'border-zinc-700 bg-black text-[#00FF00] hover:border-[#00FF00]'
                                        : isDark
                                        ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white'
                                        : isVista
                                        ? 'border-sky-300/80 bg-white/80 hover:bg-white text-sky-900 shadow-xs'
                                        : isDashboard
                                        ? 'border-[#4D2A00]/30 bg-[#FFF0BE]/80 hover:bg-[#FFF0BE] text-[#4D2A00] shadow-xs'
                                        : 'border-slate-300 bg-white/90 hover:bg-white text-slate-700 shadow-2xs'
                                }`}
                                title="Tanggal berikutnya (Geser kiri)"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>

                            <button
                                type="button"
                                onClick={onClose}
                                className={`p-1.5 rounded-[6px] transition-colors cursor-pointer ${
                                    isPaperSketch
                                        ? 'border-2 border-[#2b2b2b] bg-white text-[#2b2b2b] hover:bg-[#ff4747] hover:text-white shadow-[1px_1px_0px_#2b2b2b]'
                                        : isWinamp
                                        ? 'hover:bg-zinc-800 text-[#00FF00]'
                                        : isVista
                                        ? 'hover:bg-rose-500/20 hover:text-rose-600 text-sky-800'
                                        : isDashboard
                                        ? 'hover:bg-[#4D2A00]/10 text-[#4D2A00]/70 hover:text-[#4D2A00]'
                                        : 'hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white'
                                }`}
                                title="Tutup kartu (Esc)"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Swipe Hint Pill */}
                    <div className="flex items-center justify-center relative z-10">
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                            isPaperSketch
                                ? 'text-[#2b2b2b] bg-[#f2efeb] border-2 border-[#2b2b2b] font-[\'Gaegu\'] text-xs font-bold'
                                : isWinamp
                                ? 'text-[#00FF00]/70 bg-black border border-zinc-800'
                            : isDark
                                ? 'text-slate-300 bg-white/5 border border-white/10'
                            : isVista
                                ? 'text-sky-900 bg-sky-500/15 border border-sky-300/40'
                            : isDashboard
                                ? 'text-[#4D2A00]/80 bg-[#4D2A00]/10 border border-[#4D2A00]/20'
                                : 'text-slate-600 bg-black/5 border border-slate-200'
                        }`}>
                            ◄ Geser kartu untuk ganti tanggal ►
                        </span>
                    </div>

                    {/* Sub-Tabs Navigation for Advanced Features */}
                    <div className="grid grid-cols-4 gap-1 relative z-30 mb-1">
                        <button
                            type="button"
                            onClick={() => setActiveSubTab('shift')}
                            className={`py-1 text-[10px] font-bold rounded-[6px] border transition-all cursor-pointer ${
                                activeSubTab === 'shift'
                                    ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                            }`}
                        >
                            Shift
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveSubTab('geser_off')}
                            className={`py-1 text-[10px] font-bold rounded-[6px] border transition-all cursor-pointer ${
                                activeSubTab === 'geser_off'
                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                            }`}
                        >
                            Geser Off
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveSubTab('st')}
                            className={`py-1 text-[10px] font-bold rounded-[6px] border transition-all cursor-pointer ${
                                activeSubTab === 'st'
                                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                            }`}
                        >
                            ST (Tugas)
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveSubTab('leave')}
                            className={`py-1 text-[10px] font-bold rounded-[6px] border transition-all cursor-pointer ${
                                activeSubTab === 'leave'
                                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                            }`}
                        >
                            Cuti
                        </button>
                    </div>

                    {/* Conditional Panel based on activeSubTab */}
                    {activeSubTab === 'shift' && (
                        <div className="space-y-1 relative z-30">
                            <label className={`text-[9.5px] font-bold uppercase tracking-wider block ${
                                isWinamp
                                    ? 'text-[#00FF00]/70'
                                    : isDark
                                    ? 'text-slate-400'
                                    : isVista
                                    ? 'text-sky-900/80'
                                    : isDashboard
                                    ? 'text-[#4D2A00]/70'
                                    : 'text-slate-500'
                            }`}>
                                Shift Kerja
                            </label>
                            <ShiftDropdown
                                value={normalizedShift}
                                disabled={isLocked}
                                theme={theme}
                                onChange={(val) => onUpdate({ shift: val })}
                                align="left"
                            />
                        </div>
                    )}

                    {activeSubTab === 'geser_off' && (
                        <div className="p-2 rounded-[8px] bg-emerald-500/10 border border-emerald-500/30 space-y-2 relative z-30">
                            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                                🔄 Atur Geser Off (Tabungan Piket)
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9.5px] font-semibold text-slate-600 dark:text-slate-400 block">
                                    Tanggal Asal Piket (YYYY-MM-DD):
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: 2026-05-12"
                                    value={geserSourceDate}
                                    onChange={(e) => {
                                        setGeserSourceDate(e.target.value);
                                        onUpdate({
                                            shift: 'OFF',
                                            geserOffInfo: {
                                                isGeserOff: true,
                                                sourceDate: e.target.value,
                                                earnedDays: geserEarnedDays,
                                            },
                                        });
                                    }}
                                    className="w-full py-1 px-2 text-xs font-mono rounded border border-emerald-300 bg-white dark:bg-slate-900 dark:text-white"
                                />
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="text-slate-600 dark:text-slate-400">Jatah Hari Off:</span>
                                <div className="space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setGeserEarnedDays(1);
                                            onUpdate({
                                                shift: 'OFF',
                                                geserOffInfo: { isGeserOff: true, sourceDate: geserSourceDate, earnedDays: 1 },
                                            });
                                        }}
                                        className={`px-2 py-0.5 rounded font-bold ${geserEarnedDays === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                                    >
                                        1 Hari
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setGeserEarnedDays(2);
                                            onUpdate({
                                                shift: 'OFF',
                                                geserOffInfo: { isGeserOff: true, sourceDate: geserSourceDate, earnedDays: 2 },
                                            });
                                        }}
                                        className={`px-2 py-0.5 rounded font-bold ${geserEarnedDays === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                                    >
                                        2 Hari (PM Libur/Wknd)
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSubTab === 'st' && (
                        <div className="p-2 rounded-[8px] bg-amber-500/10 border border-amber-500/30 space-y-2 relative z-30">
                            <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                                📋 Penugasan / Surat Tugas (ST)
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9.5px] font-semibold text-slate-600 dark:text-slate-400 block">
                                    Pilih Jenis ST:
                                </label>
                                <select
                                    value={stCat}
                                    onChange={(e) => {
                                        setStCat(e.target.value);
                                        onUpdate({
                                            stInfo: {
                                                isSt: true,
                                                stType: e.target.value,
                                                isTentative: stTentative,
                                                rewardType: stReward,
                                            },
                                        });
                                    }}
                                    className="w-full py-1 px-2 text-xs rounded border border-amber-300 bg-white dark:bg-slate-900 dark:text-white"
                                >
                                    <option value="Pemeriksaan Luar Kawasan Pabean">ST Pemeriksaan Luar Kawasan Pabean</option>
                                    <option value="Pemeriksaan Barang di Lokasi">ST Pemeriksaan Barang di Lokasi</option>
                                    <option value="Pemeriksaan ATA Carnet">ST Pemeriksaan ATA Carnet</option>
                                    <option value="Piket">ST Piket</option>
                                    <option value="Dinas Luar">ST Dinas Luar</option>
                                    <option value="Lainnya">ST Lainnya</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                                <label className="flex items-center space-x-1.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={stTentative}
                                        onChange={(e) => {
                                            setStTentative(e.target.checked);
                                            onUpdate({
                                                stInfo: { isSt: true, stType: stCat, isTentative: e.target.checked, rewardType: stReward },
                                            });
                                        }}
                                        className="rounded border-amber-400 text-amber-600"
                                    />
                                    <span className="text-slate-700 dark:text-slate-300 font-semibold">ST Belum Terbit (Tentative)</span>
                                </label>
                            </div>
                        </div>
                    )}

{activeSubTab === 'leave' && (
                        <div className="p-2 rounded-[8px] bg-indigo-500/10 border border-indigo-500/30 space-y-2 relative z-30">
                            <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                                🌴 Cuti Perubahan (Setelah Jadwal Terbit)
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9.5px] font-semibold text-slate-600 dark:text-slate-400 block">
                                    Pilih Jenis Cuti:
                                </label>
                                <select
                                    value={leaveCat}
                                    onChange={(e) => {
                                        setLeaveCat(e.target.value);
                                        onUpdate({
                                            shift: 'CUTI',
                                            leaveInfo: { isLeave: true, leaveType: e.target.value, halfDayType: e.target.value.includes('Setengah') || e.target.value.includes('Pagi') || e.target.value.includes('Siang') ? halfDay : undefined },
                                        });
                                    }}
                                    className="w-full py-1 px-2 text-xs rounded border border-indigo-300 bg-white dark:bg-slate-900 dark:text-white"
                                >
                                    <option value="Cuti Pagi">Cuti Pagi (Masuk maks 12.30 s.d. pulang min 17.00)</option>
                                    <option value="Cuti Siang">Cuti Siang (Masuk maks 07.30 s.d. pulang min 11.30)</option>
                                    <option value="Cuti Tahunan">Cuti Tahunan</option>
                                    <option value="Cuti Besar">Cuti Besar</option>
                                    <option value="Cuti Sakit">Cuti Sakit</option>
                                    <option value="Cuti CAP">Cuti Karena Alasan Penting (CAP)</option>
                                    <option value="Cuti Bersama ST">Cuti Bersama (dari ST)</option>
                                    <option value="Cuti Luar Tanggungan Negara">Cuti Luar Tanggungan Negara</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Separator Line */}
                    <div
                        className={`border-t my-0.5 relative z-10 ${
                            isWinamp
                                ? 'border-zinc-800'
                                : isDark
                                ? 'border-white/10'
                                : isVista
                                ? 'border-sky-200/80'
                                : isDashboard
                                ? 'border-[#4D2A00]/25'
                                : 'border-slate-200'
                        }`}
                    />

                    {/* Jam Masuk & Jam Pulang */}
                    <div className="grid grid-cols-2 gap-2 relative z-10">
                        <div className="space-y-1">
                            <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${
                                isWinamp
                                    ? 'text-[#00FF00]/70'
                                    : isDark
                                    ? 'text-slate-400'
                                    : isVista
                                    ? 'text-sky-900/80'
                                    : isDashboard
                                    ? 'text-[#4D2A00]/70'
                                    : 'text-slate-500'
                            }`}>
                                Masuk
                            </span>
                            {onRequestTimePick ? (
                                <button
                                    type="button"
                                    onClick={() => onRequestTimePick('jamMasuk', `Jam Masuk - Tgl ${dayNumber}`, data?.jamMasuk || '')}
                                    className={`w-full py-1.5 px-1.5 text-center font-bell-address text-xs font-bold rounded-[6px] border transition-colors cursor-pointer ${
                                        isPaperSketch
                                            ? 'bg-white text-[#2b2b2b] border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] hover:bg-[#2ec4b6]/25 font-mono'
                                            : isWinamp
                                            ? 'bg-black text-[#00FF00] border-zinc-700 hover:border-[#00FF00]'
                                            : isDark
                                            ? 'bg-[#2B2930] text-[#E6E0E9] border-white/10 hover:border-indigo-400/50'
                                            : isVista
                                            ? 'bg-white/90 text-sky-950 border-sky-300/80 hover:border-sky-400 shadow-xs'
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
                                    onChange={(e) => onUpdate({ jamMasuk: e.target.value })}
                                    className={`w-full py-1.5 px-1.5 text-center font-bell-address text-xs rounded-[6px] border ${
                                        isPaperSketch
                                            ? 'border-2 border-[#2b2b2b] bg-white text-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                                            : isWinamp
                                            ? 'bg-black border-zinc-700 text-[#00FF00]'
                                            : isDark
                                            ? 'bg-[#2B2930] border-white/10 text-[#E6E0E9]'
                                            : isVista
                                            ? 'border-sky-300/80 bg-white/90 text-sky-950 shadow-xs'
                                            : 'border-slate-300 bg-white/90 text-slate-800'
                                    }`}
                                />
                            )}
                        </div>

                        <div className="space-y-1">
                            <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${
                                isWinamp
                                    ? 'text-[#00FF00]/70'
                                    : isDark
                                    ? 'text-slate-400'
                                    : isVista
                                    ? 'text-sky-900/80'
                                    : 'text-slate-500'
                            }`}>
                                Pulang
                            </span>
                            {onRequestTimePick ? (
                                <button
                                    type="button"
                                    onClick={() => onRequestTimePick('jamPulang', `Jam Pulang - Tgl ${dayNumber}`, data?.jamPulang || '')}
                                    className={`w-full py-1.5 px-1.5 text-center font-bell-address text-xs font-bold rounded-[6px] border transition-colors cursor-pointer ${
                                        isPaperSketch
                                            ? 'bg-white text-[#2b2b2b] border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] hover:bg-[#2ec4b6]/25 font-mono'
                                            : isWinamp
                                            ? 'bg-black text-[#00FF00] border-zinc-700 hover:border-[#00FF00]'
                                            : isDark
                                            ? 'bg-[#2B2930] text-[#E6E0E9] border-white/10 hover:border-indigo-400/50'
                                            : isVista
                                            ? 'bg-white/90 text-sky-950 border-sky-300/80 hover:border-sky-400 shadow-xs'
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
                                    onChange={(e) => onUpdate({ jamPulang: e.target.value })}
                                    className={`w-full py-1.5 px-1.5 text-center font-bell-address text-xs rounded-[6px] border ${
                                        isPaperSketch
                                            ? 'border-2 border-[#2b2b2b] bg-white text-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                                            : isWinamp
                                            ? 'bg-black border-zinc-700 text-[#00FF00]'
                                            : isDark
                                            ? 'bg-[#2B2930] border-white/10 text-[#E6E0E9]'
                                            : isVista
                                            ? 'border-sky-300/80 bg-white/90 text-sky-950 shadow-xs'
                                            : 'border-slate-300 bg-white/90 text-slate-800'
                                    }`}
                                />
                            )}
                        </div>
                    </div>

                    {/* Absen CEISA (Time Picker) */}
                    <div className="space-y-1 relative z-10">
                        <div className="flex items-center justify-between">
                            <span className={`text-[9.5px] font-bold uppercase tracking-wider ${
                                isWinamp
                                    ? 'text-[#00FF00]/70'
                                    : isDark
                                    ? 'text-slate-400'
                                    : isVista
                                    ? 'text-sky-900/80'
                                    : 'text-slate-500'
                            }`}>
                                Absen CEISA
                            </span>
                            {data?.absenCeisa && (
                                <span className={`text-[9px] font-black ${
                                    isWinamp
                                        ? 'text-[#00FF00]'
                                        : isDark
                                        ? 'text-indigo-300'
                                        : isVista
                                        ? 'text-blue-700'
                                        : 'text-sky-600'
                                }`}>
                                    Tercatat ({data.absenCeisa})
                                </span>
                            )}
                        </div>
                        {onRequestTimePick ? (
                            <button
                                type="button"
                                onClick={() => onRequestTimePick('absenCeisa', `Absen CEISA - Tgl ${dayNumber}`, data?.absenCeisa || '')}
                                className={`w-full py-1.5 px-2.5 text-center font-mono text-xs rounded-[6px] border transition-colors flex items-center justify-center space-x-1.5 cursor-pointer ${
                                    data?.absenCeisa
                                        ? isPaperSketch
                                            ? 'bg-[#2ec4b6]/25 border-2 border-[#2b2b2b] text-[#2b2b2b] font-bold shadow-[2px_2px_0px_#2b2b2b]'
                                            : isWinamp
                                            ? 'bg-black border-[#00FF00] text-[#00FF00] font-bold'
                                            : isDark
                                            ? 'bg-indigo-600/30 border-indigo-500/40 text-indigo-200 font-bold'
                                            : isVista
                                            ? 'bg-sky-400/25 border-sky-400/80 text-sky-950 font-bold shadow-xs'
                                            : 'bg-sky-500/20 border-sky-400/50 text-sky-800 font-bold shadow-2xs'
                                        : isPaperSketch
                                        ? 'bg-white text-[#2b2b2b] border-2 border-[#2b2b2b] hover:bg-[#2ec4b6]/25 shadow-[2px_2px_0px_#2b2b2b]'
                                        : isWinamp
                                        ? 'bg-black text-zinc-500 border-zinc-700 hover:border-[#00FF00]'
                                        : isDark
                                        ? 'bg-[#2B2930] text-slate-300 border-white/10 hover:border-indigo-400/50'
                                        : isVista
                                        ? 'bg-white/90 text-sky-800 border-sky-300/80 hover:border-sky-400 shadow-xs'
                                        : 'bg-white/90 text-slate-600 border-slate-300 hover:border-sky-400 shadow-2xs'
                                }`}
                            >
                                <Clock className="w-3 h-3 opacity-70 shrink-0" />
                                <span>{data?.absenCeisa || 'Absen CEISA (--:--)'}</span>
                            </button>
                        ) : (
                            <input
                                type="text"
                                placeholder="07:30"
                                value={data?.absenCeisa || ''}
                                onChange={(e) => onUpdate({ absenCeisa: e.target.value })}
                                className={`w-full py-1.5 px-2.5 text-center font-mono text-xs rounded-[6px] border ${
                                    isPaperSketch
                                        ? 'border-2 border-[#2b2b2b] bg-white text-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                                        : isWinamp
                                        ? 'bg-black border-zinc-700 text-[#00FF00]'
                                        : isDark
                                        ? 'bg-[#2B2930] border-white/10 text-[#E6E0E9]'
                                        : isVista
                                        ? 'border-sky-300/80 bg-white/90 text-sky-950 shadow-xs'
                                        : 'border-slate-300 bg-white/90 text-slate-800'
                                }`}
                            />
                        )}
                    </div>

                    {/* Catatan (Note) Input */}
                    <div className="space-y-1 relative z-10">
                        <span className={`text-[9.5px] font-bold uppercase tracking-wider block ${
                            isWinamp
                                ? 'text-[#00FF00]/70'
                                : isDark
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
                            onChange={(val) => onUpdate({ note: val })}
                            onEnterSubmit={onClose}
                            className={
                                isPaperSketch
                                    ? 'bg-white border-2 border-[#2b2b2b] text-[#2b2b2b] placeholder-slate-400 focus:border-[#ff4747] shadow-[2px_2px_0px_#2b2b2b] font-[\'Gaegu\'] text-base'
                                    : isWinamp
                                    ? 'bg-black border-zinc-700 text-[#00FF00] placeholder-zinc-600 focus:border-[#00FF00] font-mono'
                                    : isDark
                                    ? 'bg-[#2B2930] border-white/10 text-slate-100 placeholder-slate-500 focus:border-indigo-400'
                                    : isVista
                                    ? 'bg-white/90 border-sky-300/80 text-sky-950 placeholder-sky-700/50 focus:border-sky-500 shadow-2xs'
                                    : 'bg-white/90 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-indigo-500 shadow-2xs'
                            }
                        />
                    </div>

                    {/* Jumlah Lembur di Bawah Catatan */}
                    {(() => {
                        const lemburInfo = calculateDayLembur(data, nextDayData, isWeekendOrHoliday);
                        if (!lemburInfo) return null;

                        const mm = String(lemburInfo.minutes).padStart(2, '0');
                        const lemburFormatted = `Lembur ${lemburInfo.hours} Jam ${mm} Menit`;

                        return (
                            <div className="relative z-10">
                                <div
                                    className={`w-full py-2 px-3 rounded-[6px] border flex items-center justify-center font-bold text-xs transition-all ${
                                        isPaperSketch
                                            ? 'bg-[#2ec4b6]/20 border-2 border-[#2b2b2b] text-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                                            : isWinamp
                                            ? 'bg-black border-[#00FF00] text-[#00FF00] font-mono'
                                            : isDark
                                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                                            : isVista
                                            ? 'bg-sky-100/90 border-sky-300 text-sky-950 shadow-xs'
                                            : 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                                    }`}
                                >
                                    <div className="flex items-center space-x-1.5">
                                        <Clock className="w-3.5 h-3.5 shrink-0" />
                                        <span className="font-black tracking-wide">{lemburFormatted}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Footer Tombol Selesai */}
                    <div className="pt-1 relative z-10">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`w-full py-2 rounded-[6px] text-xs font-black transition-all shadow-md cursor-pointer ${
                                isPaperSketch
                                    ? 'bg-[#ff4747] text-white hover:bg-[#ff3333] border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] font-[\'Gaegu\'] text-base font-bold active:translate-x-0.5 active:translate-y-0.5'
                                    : isWinamp
                                    ? 'bg-[#00FF00] text-black hover:bg-emerald-400 font-mono'
                                    : isDark
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                                    : isVista
                                    ? 'bg-gradient-to-b from-[#4facfe] via-[#00a2ff] to-[#0072ff] text-white shadow-[0_4px_12px_rgba(0,114,255,0.35),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:brightness-110 active:brightness-95 border border-sky-300/60'
                                    : 'bg-[#2EC4B6] text-white hover:bg-[#25a89c]'
                            }`}
                        >
                            Selesai
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
