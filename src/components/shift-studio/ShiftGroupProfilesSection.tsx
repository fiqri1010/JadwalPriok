import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ShiftGroupProfile, ShiftItemConfig, AppTheme, ActiveDateRange, SHIFT_COLORS, normalizeShift } from '../../types';
import {
    Layers,
    Calendar,
    Check,
    Edit3,
    Trash2,
    Copy,
    Plus,
    Clock,
    ChevronDown,
    Eye,
    Infinity as InfinityIcon,
    CalendarRange,
    X,
    Building2,
    Container,
    Ship,
    Sun,
    Sunset,
    Moon,
    Palmtree,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
    Pencil,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OffRelaxIcon } from '../OffRelaxIcon';
import { CustomDatePicker } from '../CustomDatePicker';

interface ShiftGroupProfilesSectionProps {
    groups: ShiftGroupProfile[];
    activeGroupId: string;
    theme?: AppTheme;
    onSelectGroup: (groupId: string) => void;
    onEditGroup: (group: ShiftGroupProfile) => void;
    onDeleteGroup: (group: ShiftGroupProfile) => void;
    onCopyGroup: (sourceGroup: ShiftGroupProfile, newName: string, startDate: string) => void;
    onCreateNewGroup: (name: string, startDate: string) => void;
    onUpdateGroupDateRanges?: (groupId: string, ranges: ActiveDateRange[]) => void;
    onRenameGroup?: (groupId: string, newName: string) => void;
}

// Icon mapper for shift icons
const getShiftIconComponent = (shiftNameOrKey: string, customIconName?: string) => {
    const key = (shiftNameOrKey || '').toLowerCase();
    if (key.includes('graha') || key === 'g') return Building2;
    if (key.includes('npct') || key === 'n') return Container;
    if (key.includes('tpsl') || key === 'l') return Ship;
    if (key.includes('sm') || key.includes('siang')) return Sun;
    if (key.includes('pm') || key.includes('pagi-malam')) return Sunset;
    if (key.includes('malam') || key === 'm') return Moon;
    if (key.includes('off') || key === 'o') return OffRelaxIcon;
    if (key.includes('cuti') || key === 'c' || key === 'ct') return Palmtree;
    return Sparkles;
};

/**
 * Dropdown Popover "Lihat Shift" murni yang selalu bertindak sebagai dropdown anchored ke tombol
 */
const ShiftPreviewDropdown: React.FC<{
    shifts: ShiftItemConfig[];
    isOpen: boolean;
    onClose: () => void;
    triggerRef: React.RefObject<HTMLButtonElement | null>;
    theme?: AppTheme;
    groupName: string;
}> = ({ shifts, isOpen, onClose, triggerRef, theme = 'default', groupName }) => {
    const [coords, setCoords] = useState<{
        top?: number;
        bottom?: number;
        left: number;
        width: number;
        maxHeight: number;
        openUpward: boolean;
    }>({
        left: 0,
        width: 270,
        maxHeight: 320,
        openUpward: false,
    });
    const menuRef = useRef<HTMLDivElement>(null);

    const isWinamp = theme === 'winamp';
    const isDarkFluid = theme === 'darkFluid';
    const isDark = theme === 'dark';
    const isVista = theme === 'vista';

    const updateCoords = useCallback(() => {
        if (!triggerRef.current || typeof window === 'undefined') return;
        const rect = triggerRef.current.getBoundingClientRect();
        const menuWidth = Math.min(275, window.innerWidth - 16);
        const padding = 8;

        const spaceBelow = window.innerHeight - rect.bottom - padding;
        const spaceAbove = rect.top - padding;
        const openUpward = spaceBelow < 200 && spaceAbove > spaceBelow;

        const availableHeight = openUpward ? spaceAbove : spaceBelow;
        const maxHeight = Math.max(160, Math.min(availableHeight, 330));

        let top: number | undefined;
        let bottom: number | undefined;

        if (openUpward) {
            bottom = window.innerHeight - rect.top + 4;
        } else {
            top = rect.bottom + 4;
        }

        // Align right relative to button
        let left = rect.right - menuWidth;
        if (left + menuWidth > window.innerWidth - padding) {
            left = window.innerWidth - menuWidth - padding;
        }
        if (left < padding) {
            left = padding;
        }

        setCoords({
            top,
            bottom,
            left,
            width: menuWidth,
            maxHeight,
            openUpward,
        });
    }, [triggerRef]);

    useEffect(() => {
        if (!isOpen) return;
        updateCoords();

        const handleScrollOrResize = () => updateCoords();
        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);

        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            const target = e.target as Node;
            const inTrigger = triggerRef.current && triggerRef.current.contains(target);
            const inMenu = menuRef.current && menuRef.current.contains(target);
            if (!inTrigger && !inMenu) {
                onClose();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, updateCoords, onClose, triggerRef]);

    const getDropdownCardStyle = (): React.CSSProperties => {
        if (isWinamp) {
            return {
                backgroundColor: '#121212',
                border: '2px solid #00FF00',
                borderRadius: '0px',
                boxShadow: '4px 4px 0px #000000',
            };
        }
        if (isDark || isDarkFluid) {
            return {
                backgroundColor: isDarkFluid ? '#1E1B24' : '#1E1E24',
                backgroundImage: isDarkFluid
                    ? 'linear-gradient(139deg, #25232E 0%, #1E1B24 100%)'
                    : 'linear-gradient(139deg, #262730 0%, #1E1E24 100%)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.08)',
            };
        }
        if (isVista) {
            return {
                backgroundColor: 'rgba(235, 245, 255, 0.94)',
                backgroundImage: 'linear-gradient(139deg, rgba(255, 255, 255, 0.98) 0%, rgba(220, 240, 255, 0.90) 40%, rgba(186, 230, 253, 0.85) 100%)',
                borderRadius: '12px',
                border: '1.5px solid rgba(255, 255, 255, 0.95)',
                boxShadow: '0 25px 50px -10px rgba(14, 116, 224, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(28px) saturate(200%)',
            };
        }
        return {
            backgroundColor: '#ffffff',
            backgroundImage: 'linear-gradient(139deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 20px 45px -10px rgba(50, 50, 93, 0.3), 0 10px 20px -6px rgba(0, 0, 0, 0.18)',
        };
    };

    const regularShifts = shifts.filter(
        (s) => !['off', 'cuti', 'c', 'ct', 'o'].includes(s.naming.displayBadge.toLowerCase()) && !s.isPiket
    );
    const restAndPiketShifts = shifts.filter(
        (s) => ['off', 'cuti', 'c', 'ct', 'o'].includes(s.naming.displayBadge.toLowerCase()) || s.isPiket
    );

    return (
        <>
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            key="shift-group-dropdown-popover"
                            ref={menuRef}
                            initial={{ opacity: 0, y: coords.openUpward ? 6 : -6, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: coords.openUpward ? 6 : -6, scale: 0.96 }}
                            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                            style={{
                                ...getDropdownCardStyle(),
                                position: 'fixed',
                                top: coords.top,
                                bottom: coords.bottom,
                                left: coords.left,
                                width: coords.width,
                                maxHeight: `${coords.maxHeight}px`,
                                zIndex: 10000,
                                transformOrigin: coords.openUpward ? 'bottom right' : 'top right',
                                willChange: 'transform, opacity',
                            }}
                            className={`overflow-hidden flex flex-col select-none transform-gpu shadow-2xl ${
                                isWinamp ? 'font-mono' : ''
                            }`}
                        >
                            {/* Header info in dropdown */}
                            <div className="px-3 py-1.5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-white/5">
                                <div className="min-w-0 flex-1 pr-2">
                                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400 block truncate">
                                        Daftar Shift Profil:
                                    </span>
                                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate block">
                                        {groupName}
                                    </span>
                                </div>
                                <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 shrink-0">
                                    {shifts.length} shift
                                </span>
                            </div>

                            {/* Scrollable List Body */}
                            <div className="overflow-y-auto overscroll-contain py-1.5 px-1 flex-1 flex flex-col gap-1">
                                {/* Section 1: Reguler */}
                                <div className="px-2 pt-0.5 pb-0.5">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1">
                                        Shift Operasional / Kantor
                                    </span>
                                </div>
                                <ul className="flex flex-col gap-0.5 px-1 list-none m-0 p-0">
                                    {regularShifts.map((item, idx) => {
                                        const IconComponent = getShiftIconComponent(item.naming.displayBadge, item.visual?.iconName);
                                        const norm = normalizeShift(item.naming.displayBadge);
                                        const col = SHIFT_COLORS[norm] || SHIFT_COLORS['Graha'];

                                        return (
                                            <li
                                                key={`regular-shift-${item.id}-${idx}`}
                                                className="group flex items-center justify-between px-2 py-1.5 rounded-[6px] transition-all duration-150 text-slate-800 dark:text-slate-100 hover:bg-slate-100/90 dark:hover:bg-white/10"
                                            >
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <div className={`p-1 rounded-[4px] shrink-0 ${col.bg} ${col.text} border ${col.border}`}>
                                                        <IconComponent theme={theme} className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0 text-left py-0.5">
                                                        <div className="flex items-center space-x-1.5">
                                                            <span className="text-xs font-bold leading-normal truncate">
                                                                {item.naming.fullName || item.naming.displayBadge}
                                                            </span>
                                                            <span className={`text-[9px] font-mono px-1 rounded uppercase font-black ${col.bg} ${col.text}`}>
                                                                {item.naming.displayBadge}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                                                            {item.naming.dropdownSublabel || `${item.workTime.jamMasukDasar} - ${item.workTime.jamPulangDasar}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>

                                {/* Section 2: Libur & Cuti / Piket */}
                                {restAndPiketShifts.length > 0 && (
                                    <>
                                        <div className="border-t my-1 border-slate-200/80 dark:border-white/10" />
                                        <div className="px-2 pt-0.5 pb-0.5">
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1">
                                                Libur, Cuti & Khusus
                                            </span>
                                        </div>
                                        <ul className="flex flex-col gap-0.5 px-1 list-none m-0 p-0">
                                            {restAndPiketShifts.map((item, idx) => {
                                                const IconComponent = getShiftIconComponent(item.naming.displayBadge, item.visual?.iconName);
                                                const norm = normalizeShift(item.naming.displayBadge);
                                                const col = SHIFT_COLORS[norm] || SHIFT_COLORS['OFF'];

                                                return (
                                                    <li
                                                        key={`rest-shift-${item.id}-${idx}`}
                                                        className="group flex items-center justify-between px-2 py-1.5 rounded-[6px] transition-all duration-150 text-slate-800 dark:text-slate-100 hover:bg-slate-100/90 dark:hover:bg-white/10"
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                                            <div className={`p-1 rounded-[4px] shrink-0 ${col.bg} ${col.text} border ${col.border}`}>
                                                                <IconComponent theme={theme} className="w-3.5 h-3.5" />
                                                            </div>
                                                            <div className="flex flex-col min-w-0 text-left py-0.5">
                                                                <div className="flex items-center space-x-1.5">
                                                                    <span className="text-xs font-bold leading-normal truncate">
                                                                        {item.naming.fullName || item.naming.displayBadge}
                                                                    </span>
                                                                    {item.isPiket && (
                                                                        <span className="text-[8.5px] px-1 py-0.2 rounded font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                                                            Piket
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                                                                    {item.naming.dropdownSublabel || 'Hari Istirahat / Izin'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

/**
 * Modal Tabel Pengaturan Rentang Tanggal Aktivasi Profil
 * Mengizinkan 1, 2, atau lebih rentang tanggal dengan batas tak hingga (~)
 */
const ActivationDateRangesModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    group: ShiftGroupProfile;
    isActiveGroup: boolean;
    onMakeActiveMain: (groupId: string) => void;
    onSaveRanges: (groupId: string, ranges: ActiveDateRange[]) => void;
}> = ({ isOpen, onClose, group, isActiveGroup, onMakeActiveMain, onSaveRanges }) => {
    // Inisialisasi rentang tanggal dari grup atau fallback ke effectiveStartDate
    const [ranges, setRanges] = useState<ActiveDateRange[]>(() => {
        if (group.dateRanges && group.dateRanges.length > 0) {
            return JSON.parse(JSON.stringify(group.dateRanges));
        }
        return [
            {
                id: `RANGE_${Date.now()}_1`,
                startDate: group.effectiveStartDate || new Date().toISOString().split('T')[0],
                endDate: null,
            },
        ];
    });

    useEffect(() => {
        if (group.dateRanges && group.dateRanges.length > 0) {
            setRanges(JSON.parse(JSON.stringify(group.dateRanges)));
        } else {
            setRanges([
                {
                    id: `RANGE_${Date.now()}_1`,
                    startDate: group.effectiveStartDate || new Date().toISOString().split('T')[0],
                    endDate: null,
                },
            ]);
        }
    }, [group]);

    const handleAddRange = () => {
        const today = new Date().toISOString().split('T')[0];
        const newRange: ActiveDateRange = {
            id: `RANGE_${Date.now()}_${ranges.length + 1}`,
            startDate: today,
            endDate: null,
        };
        setRanges([...ranges, newRange]);
    };

    const handleRemoveRange = (id: string) => {
        if (ranges.length <= 1) return;
        setRanges(ranges.filter((r) => r.id !== id));
    };

    const handleUpdateRange = (id: string, partial: Partial<ActiveDateRange>) => {
        setRanges(
            ranges.map((r) => {
                if (r.id === id) {
                    return { ...r, ...partial };
                }
                return r;
            })
        );
    };

    const handleSave = () => {
        // Validasi dan simpan
        const cleaned = ranges.map((r) => ({
            ...r,
            startDate: r.startDate || new Date().toISOString().split('T')[0],
            endDate: r.endDate ? r.endDate : null,
        }));
        onSaveRanges(group.id, cleaned);
        onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="fixed inset-0" onClick={onClose} />
            <div className="relative z-10 w-full max-w-2xl rounded-lg bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200/90 dark:border-slate-700 p-4 sm:p-5 space-y-4">
                {/* Header Modal */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-200/80 dark:border-zinc-800">
                    <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                            <CalendarRange className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    Aktivasi Rentang Tanggal: <span className="text-teal-600 dark:text-teal-400">{group.name}</span>
                                </h3>
                                {isActiveGroup && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-500/15 text-teal-700 dark:text-teal-400 border border-teal-500/30">
                                        Aktif
                                    </span>
                                )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                Tentukan 1 atau beberapa rentang periode tanggal kapan profil shift ini otomatis aktif di kalender.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Info Box */}
                <div className="p-2.5 rounded-lg bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-800/40 text-[11px] text-teal-900 dark:text-teal-300 flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                        <CalendarRange className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400" />
                        <span>
                            Kosongkan tanggal akhir jika ingin profil ini berlaku seterusnya sampai ada rentang baru yang mulai aktif.
                        </span>
                    </div>
                    {!isActiveGroup && (
                        <button
                            type="button"
                            onClick={() => onMakeActiveMain(group.id)}
                            className="px-2.5 py-1 text-[10px] font-bold rounded bg-teal-600 hover:bg-teal-700 text-white cursor-pointer transition-colors shrink-0"
                        >
                            Jadikan Profil Utama
                        </button>
                    )}
                </div>

                {/* Tabel Rentang Tanggal */}
                <div className="border border-slate-200/90 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-[#181818]">
                    <div className="max-h-[260px] overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-100/90 dark:bg-zinc-800/90 text-slate-600 dark:text-zinc-300 border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-bold">
                                    <th className="py-2 px-3 w-12 text-center">No</th>
                                    <th className="py-2 px-3">Tanggal Mulai Berlaku</th>
                                    <th className="py-2 px-3">Sampai Dengan (Akhir)</th>
                                    <th className="py-2 px-3 text-center w-20">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/70 dark:divide-zinc-800">
                                {ranges.map((range, index) => {
                                    return (
                                        <tr key={`date-range-${range.id}-${index}`} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="py-2.5 px-3 text-center font-bold text-slate-400 dark:text-zinc-500 text-[11px]">
                                                {index + 1}
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <input
                                                    type="date"
                                                    value={range.startDate}
                                                    onChange={(e) => handleUpdateRange(range.id, { startDate: e.target.value })}
                                                    className="w-full sm:w-auto p-1.5 text-xs font-mono rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-slate-100 outline-none focus:border-teal-500"
                                                />
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="date"
                                                        value={range.endDate || ''}
                                                        onChange={(e) => handleUpdateRange(range.id, { endDate: e.target.value || null })}
                                                        placeholder="Kosong = seterusnya"
                                                        className="w-full sm:w-auto p-1.5 text-xs font-mono rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-slate-100 outline-none focus:border-teal-500"
                                                    />
                                                    {range.endDate ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateRange(range.id, { endDate: null })}
                                                            className="p-1 rounded text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-[10.5px] flex items-center gap-0.5"
                                                            title="Kosongkan tanggal akhir (berlaku seterusnya)"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                            <span className="hidden sm:inline">Kosongkan</span>
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium whitespace-nowrap bg-teal-50 dark:bg-teal-950/30 px-2 py-0.5 rounded border border-teal-200/50 dark:border-teal-800/40">
                                                            Seterusnya
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                {ranges.length > 1 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveRange(range.id)}
                                                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
                                                        title="Hapus baris rentang tanggal ini"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 dark:text-zinc-600 italic">Utama</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Tombol Tambah Baris Rentang Tanggal */}
                    <div className="p-2 bg-slate-50/70 dark:bg-zinc-900/60 border-t border-slate-200/80 dark:border-zinc-800 flex justify-between items-center">
                        <button
                            type="button"
                            onClick={handleAddRange}
                            className="px-3 py-1 text-xs font-bold rounded-md bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-teal-700 dark:text-teal-400 border border-teal-300/80 dark:border-teal-700/60 flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Tambah Rentang Tanggal Lain</span>
                        </button>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                            Total: <strong>{ranges.length}</strong> rentang
                        </span>
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-200/80 dark:border-zinc-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 cursor-pointer transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-4 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-xs transition-all active:scale-95"
                    >
                        Simpan Rentang Tanggal
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const ShiftGroupProfilesSection: React.FC<ShiftGroupProfilesSectionProps> = ({
    groups,
    activeGroupId,
    theme = 'default',
    onSelectGroup,
    onEditGroup,
    onDeleteGroup,
    onCopyGroup,
    onCreateNewGroup,
    onUpdateGroupDateRanges,
    onRenameGroup,
}) => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'copy' | 'edit'>('create');
    const [targetGroup, setTargetGroup] = useState<ShiftGroupProfile | null>(null);
    const [groupNameInput, setGroupNameInput] = useState('');
    const [startDateInput, setStartDateInput] = useState('');

    // State untuk Dropdown "Lihat Shift"
    const [previewGroupId, setPreviewGroupId] = useState<string | null>(null);
    const previewTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    // State untuk Modal Aktivasi Rentang Tanggal
    const [activationTargetGroup, setActivationTargetGroup] = useState<ShiftGroupProfile | null>(null);

    // State untuk Modal Konfirmasi Hapus Profil
    const [groupToDeleteConfirm, setGroupToDeleteConfirm] = useState<ShiftGroupProfile | null>(null);

    const handleOpenCreate = () => {
        setModalMode('create');
        setTargetGroup(null);
        setGroupNameInput('Kelompok Shift Baru');
        setStartDateInput('');
        setIsCreateModalOpen(true);
    };

    const handleOpenCopy = (grp: ShiftGroupProfile) => {
        setModalMode('copy');
        setTargetGroup(grp);
        setGroupNameInput(`${grp.name} (Salinan)`);
        setStartDateInput('');
        setIsCreateModalOpen(true);
    };

    const handleOpenEditName = (grp: ShiftGroupProfile) => {
        setModalMode('edit');
        setTargetGroup(grp);
        setGroupNameInput(grp.name);
        setStartDateInput('');
        setIsCreateModalOpen(true);
    };

    const handleConfirmSubmit = () => {
        if (!groupNameInput.trim()) return;
        const finalStartDate = startDateInput.trim() || new Date().toISOString().split('T')[0];
        if (modalMode === 'edit' && targetGroup) {
            if (onRenameGroup) {
                onRenameGroup(targetGroup.id, groupNameInput.trim());
            }
        } else if (modalMode === 'copy' && targetGroup) {
            onCopyGroup(targetGroup, groupNameInput.trim(), finalStartDate);
        } else {
            onCreateNewGroup(groupNameInput.trim(), finalStartDate);
        }
        setIsCreateModalOpen(false);
    };

    const handleTogglePreviewDropdown = (groupId: string) => {
        setPreviewGroupId((prev) => (prev === groupId ? null : groupId));
    };

    const previewingGroup = groups.find((g) => g.id === previewGroupId);

    return (
        <div className="space-y-3.5">
            {/* Header Section: Profil Aturan Shift */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-200/80 dark:border-zinc-800">
                <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span>Profil Aturan Shift</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        Kelola daftar profil aturan shift kerja dan linimasa tanggal aktif di kalender
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all active:scale-95 self-start sm:self-auto"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Profil Baru</span>
                </button>
            </div>

            {/* List Tampilan Profil Shift (Bukan Grid Kartu) */}
            <div className="border border-slate-200/90 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-[#1E1E1E] divide-y divide-slate-200/80 dark:divide-zinc-800 shadow-sm">
                {groups.map((grp, idx) => {
                    const isActive = grp.id === activeGroupId;
                    const rangesCount = grp.dateRanges?.length || 1;
                    const primaryRange = grp.dateRanges && grp.dateRanges[0];
                    const rangeLabel = primaryRange
                        ? `${primaryRange.startDate} s/d ${primaryRange.endDate || 'Seterusnya'}`
                        : `${grp.effectiveStartDate} s/d Seterusnya`;

                    return (
                        <div
                            key={`shift-group-${grp.id}-${idx}`}
                            className={`p-3 sm:p-3.5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                                isActive
                                    ? 'bg-teal-50/20 dark:bg-teal-950/10'
                                    : 'hover:bg-slate-50/60 dark:hover:bg-zinc-800/40'
                            }`}
                        >
                            {/* Sisi Kiri: Identitas & Info Profil */}
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center flex-wrap gap-2">
                                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                                        {grp.name}
                                    </h4>
                                    {onRenameGroup && (
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEditName(grp)}
                                            className="p-1 rounded text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                            title={`Ubah nama profil "${grp.name}"`}
                                        >
                                            <Pencil className="w-3 h-3" />
                                        </button>
                                    )}
                                    {isActive ? (
                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-500/15 text-teal-700 dark:text-teal-400 border border-teal-500/30 flex items-center space-x-0.5 shrink-0">
                                            <Check className="w-2.5 h-2.5" />
                                            <span>Aktif</span>
                                        </span>
                                    ) : null}
                                    <span className="font-mono text-[9.5px] px-1 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200/80 dark:border-zinc-700/60">
                                        ID: {grp.id.slice(-8)}
                                    </span>
                                </div>

                                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-zinc-400">
                                    <span className="flex items-center space-x-1">
                                        <Calendar className="w-3 h-3 opacity-60 shrink-0" />
                                        <span>Periode: <strong>{rangeLabel}</strong></span>
                                        {rangesCount > 1 && (
                                            <span className="text-[9.5px] px-1 py-0.2 rounded bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 font-bold border border-teal-200/60 dark:border-teal-800/50">
                                                +{rangesCount - 1} rentang
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-slate-300 dark:text-zinc-700">•</span>
                                    <span>{grp.shifts.length} shift terkonfigurasi</span>
                                </div>
                            </div>

                            {/* Sisi Kanan: Barisan Tombol Aksi Lengkap */}
                            <div className="flex items-center flex-wrap gap-1 sm:gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-zinc-800/80">
                                {/* Tombol "Lihat Shift" (Dropdown persis dengan dropdown kartu kalender) */}
                                <div className="relative">
                                    <button
                                        ref={(el) => {
                                            previewTriggerRefs.current[grp.id] = el;
                                        }}
                                        type="button"
                                        onClick={() => handleTogglePreviewDropdown(grp.id)}
                                        className="px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                                        title="Buka dropdown daftar shift profil ini"
                                    >
                                        <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                                        <span className="hidden sm:inline">Lihat Shift</span>
                                        <ChevronDown className={`w-3 h-3 opacity-70 transition-transform duration-150 ${previewGroupId === grp.id ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                {/* Tombol "Aktivasi" (Tabel Rentang Tanggal Aktif Fleksibel) */}
                                <button
                                    type="button"
                                    onClick={() => setActivationTargetGroup(grp)}
                                    className={`px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs ${
                                        isActive
                                            ? 'bg-teal-600 hover:bg-teal-700 text-white'
                                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700'
                                    }`}
                                    title="Atur rentang tanggal aktivasi profil ini"
                                >
                                    <CalendarRange className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Aktivasi</span>
                                </button>

                                {/* Tombol "Edit Shift" */}
                                <button
                                    type="button"
                                    onClick={() => onEditGroup(grp)}
                                    className="px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200/60 dark:border-teal-700/50 flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                                    title="Edit rincian dan jam kerja shift di profil ini"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Edit Shift</span>
                                </button>

                                {/* Tombol "Salin" */}
                                <button
                                    type="button"
                                    onClick={() => handleOpenCopy(grp)}
                                    className="p-1 sm:px-2 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 flex items-center space-x-1 cursor-pointer transition-colors"
                                    title="Salin konfigurasi profil ini"
                                >
                                    <Copy className="w-3.5 h-3.5 opacity-70" />
                                    <span className="hidden sm:inline">Salin</span>
                                </button>

                                {/* Tombol "Hapus" Profil */}
                                <button
                                    type="button"
                                    disabled={isActive || groups.length <= 1}
                                    onClick={() => {
                                        if (!isActive && groups.length > 1) {
                                            setGroupToDeleteConfirm(grp);
                                        }
                                    }}
                                    className={`p-1 sm:p-1.5 rounded-md flex items-center justify-center transition-all ${
                                        isActive || groups.length <= 1
                                            ? 'opacity-30 cursor-not-allowed text-slate-400 dark:text-zinc-600 border border-transparent'
                                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40 cursor-pointer shadow-2xs active:scale-95'
                                    }`}
                                    title={
                                        isActive
                                            ? 'Profil aturan shift yang sedang aktif tidak dapat dihapus.'
                                            : groups.length <= 1
                                            ? 'Satu-satunya profil aturan shift tidak dapat dihapus.'
                                            : `Hapus profil aturan shift "${grp.name}"`
                                    }
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Dropdown Popover "Lihat Shift" Portalled */}
            {previewingGroup && previewGroupId && (
                <ShiftPreviewDropdown
                    groupName={previewingGroup.name}
                    shifts={previewingGroup.shifts}
                    isOpen={Boolean(previewGroupId)}
                    onClose={() => setPreviewGroupId(null)}
                    triggerRef={{ current: previewTriggerRefs.current[previewGroupId] }}
                    theme={theme}
                />
            )}

            {/* Modal Konfirmasi Hapus Profil Aturan Shift */}
            {groupToDeleteConfirm && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="fixed inset-0" onClick={() => setGroupToDeleteConfirm(null)} />
                    <div className="relative z-10 w-full max-w-sm rounded-lg bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200/90 dark:border-slate-700 p-5 space-y-4">
                        <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-200/80 dark:border-zinc-800">
                            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Hapus Profil Aturan Shift
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate max-w-[200px]">
                                    {groupToDeleteConfirm.name}
                                </p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                            Apakah Anda yakin ingin menghapus profil aturan shift <strong>"{groupToDeleteConfirm.name}"</strong>? Seluruh daftar shift khusus di dalam profil ini akan dihapus secara permanen.
                        </p>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-200/80 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={() => setGroupToDeleteConfirm(null)}
                                className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 cursor-pointer transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onDeleteGroup(groupToDeleteConfirm);
                                    setGroupToDeleteConfirm(null);
                                }}
                                className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs transition-all active:scale-95 flex items-center space-x-1.5"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus Profil</span>
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Modal Tabel Aktivasi Rentang Tanggal */}
            {activationTargetGroup && (
                <ActivationDateRangesModal
                    isOpen={Boolean(activationTargetGroup)}
                    onClose={() => setActivationTargetGroup(null)}
                    group={activationTargetGroup}
                    isActiveGroup={activationTargetGroup.id === activeGroupId}
                    onMakeActiveMain={(groupId) => {
                        onSelectGroup(groupId);
                        setActivationTargetGroup(null);
                    }}
                    onSaveRanges={(groupId, newRanges) => {
                        if (onUpdateGroupDateRanges) {
                            onUpdateGroupDateRanges(groupId, newRanges);
                        }
                    }}
                />
            )}

            {/* Modal Dialog Tambah / Salin Profil */}
            {isCreateModalOpen && createPortal(
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="fixed inset-0" onClick={() => setIsCreateModalOpen(false)} />
                    <div className="relative z-10 w-full max-w-md rounded-lg bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200/90 dark:border-slate-700 p-5 space-y-4">
                        <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-200/80 dark:border-zinc-800">
                            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                                <Layers className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    {modalMode === 'copy'
                                        ? 'Salin Profil Aturan Shift'
                                        : modalMode === 'edit'
                                        ? 'Edit Nama Profil Shift'
                                        : 'Tambah Profil Aturan Shift Baru'}
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                    {modalMode === 'copy'
                                        ? `Menduplikasi aturan dari "${targetGroup?.name}"`
                                        : modalMode === 'edit'
                                        ? `Ubah nama untuk profil "${targetGroup?.name}"`
                                        : 'Buat kelompok aturan shift dengan linimasa baru'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold block text-slate-700 dark:text-zinc-300">
                                    Nama Profil Aturan Shift:
                                </label>
                                <input
                                    type="text"
                                    value={groupNameInput}
                                    onChange={(e) => setGroupNameInput(e.target.value)}
                                    placeholder="Contoh: Aturan Jam Kerja Q3 2026"
                                    autoFocus
                                    className="w-full p-2.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 outline-none focus:border-teal-500 font-medium"
                                />
                                <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                                    {modalMode === 'edit'
                                        ? 'Perubahan nama akan langsung diperbarui pada profil shift dan kalender kerja.'
                                        : 'Profil baru dapat langsung dibuat atau disalin tanpa perlu menginput tanggal berlaku.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-slate-200/80 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 cursor-pointer transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSubmit}
                                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-xs transition-all active:scale-95"
                            >
                                {modalMode === 'edit' ? 'Simpan Nama' : 'Simpan Profil'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
