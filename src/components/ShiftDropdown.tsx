import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ShiftType, SHIFT_COLORS, normalizeShift } from '../types';
import {
    ChevronDown,
    Building2,
    Container,
    Ship,
    Sun,
    Sunset,
    Moon,
    Coffee,
    Palmtree,
    Trash2,
    Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { OffRelaxIcon } from './OffRelaxIcon';

interface ShiftDropdownProps {
    value: string;
    disabled?: boolean;
    theme: string;
    onChange: (val: ShiftType) => void;
    compact?: boolean;
    align?: 'left' | 'right' | 'center';
    onOpenChange?: (isOpen: boolean) => void;
}

interface ShiftItemConfig {
    key: ShiftType;
    label: string;
    sublabel?: string;
    icon: React.ComponentType<{ className?: string; theme?: string }>;
}

const REGULAR_SHIFTS: ShiftItemConfig[] = [
    { key: 'Graha', label: 'Graha', sublabel: 'FCL 07.30 - 17.00', icon: Building2 },
    { key: 'NPCT', label: 'NPCT', sublabel: 'FCL 07.30 - 17.00', icon: Container },
    { key: 'TPSL', label: 'TPSL', sublabel: 'FCL/LCL 07.30 - 17.00', icon: Ship },
    { key: 'SM', label: 'SM (Shift Siang)', sublabel: '12.30 - 22.00', icon: Sun },
    { key: 'PM', label: 'PM (Pagi-Malam)', sublabel: '07.30-20.00 & 04.30', icon: Sunset },
    { key: 'Malam', label: 'Malam', sublabel: '17.00-20.00 & 04.30', icon: Moon },
];

const REST_SHIFTS: ShiftItemConfig[] = [
    { key: 'OFF', label: 'OFF (Libur Shift)', sublabel: 'Hari Libur', icon: OffRelaxIcon },
    { key: 'CUTI', label: 'CUTI (Izin Cuti)', sublabel: 'Cuti Resmi', icon: Palmtree },
];

export const ShiftDropdown: React.FC<ShiftDropdownProps> = ({
    value,
    disabled = false,
    theme,
    onChange,
    compact = false,
    align = 'left',
    onOpenChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number; openUpward: boolean }>({
        top: 0,
        left: 0,
        width: 220,
        openUpward: false,
    });
    const containerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleOpen = (nextState?: boolean) => {
        const newState = nextState !== undefined ? nextState : !isOpen;
        setIsOpen(newState);
        onOpenChange?.(newState);
    };

    const normalizedValue = normalizeShift(value);
    const currentShiftColor = SHIFT_COLORS[normalizedValue] || SHIFT_COLORS[''];
    const currentShiftConfig = [...REGULAR_SHIFTS, ...REST_SHIFTS].find((s) => s.key === normalizedValue);
    const SelectedShiftIcon = currentShiftConfig?.icon;

    const isWinamp = theme === 'winamp';
    const isDarkFluid = theme === 'darkFluid';
    const isDark = theme === 'dark';
    const isVista = theme === 'vista';

    // Auto calculate position and upward/downward direction based on trigger position in viewport
    const updateCoords = useCallback(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        const menuWidth = compact ? Math.max(rect.width, 210) : Math.max(rect.width, 235);
        const estimatedHeight = 295;

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const openUpward = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

        let top = openUpward ? rect.top - 6 : rect.bottom + 6;
        if (openUpward) {
            top = Math.max(8, rect.top - 6);
        } else {
            top = Math.min(window.innerHeight - 20, rect.bottom + 6);
        }

        let left = rect.left;
        if (align === 'right') {
            left = rect.right - menuWidth;
        } else if (align === 'center') {
            left = rect.left + rect.width / 2 - menuWidth / 2;
        }

        // Clamp left coordinate to prevent screen overflowing
        const padding = 8;
        if (left + menuWidth > window.innerWidth - padding) {
            left = window.innerWidth - menuWidth - padding;
        }
        if (left < padding) {
            left = padding;
        }

        setCoords({
            top,
            left,
            width: menuWidth,
            openUpward,
        });
    }, [align, compact]);

    useEffect(() => {
        if (!isOpen) return;

        updateCoords();

        const handleScrollOrResize = () => {
            updateCoords();
        };

        window.addEventListener('scroll', handleScrollOrResize, true);
        window.addEventListener('resize', handleScrollOrResize);

        return () => {
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    }, [isOpen, updateCoords]);

    // Close on click outside & Escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            const target = e.target as Node;
            const inContainer = containerRef.current && containerRef.current.contains(target);
            const inMenu = menuRef.current && menuRef.current.contains(target);
            if (!inContainer && !inMenu) {
                toggleOpen(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                toggleOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const handleSelect = (shift: ShiftType) => {
        onChange(shift);
        toggleOpen(false);
    };

    // Styling container for dropdown menu card
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
                backgroundColor: isDarkFluid ? '#1D1B20' : '#2a2f3b',
                borderRadius: '5px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7)',
                color: '#E0E0E0',
            };
        }
        if (isVista) {
            return {
                backgroundColor: 'rgba(235, 245, 255, 0.94)',
                backgroundImage: 'linear-gradient(139deg, rgba(255, 255, 255, 0.98) 0%, rgba(220, 240, 255, 0.90) 40%, rgba(186, 230, 253, 0.85) 100%)',
                borderRadius: '5px',
                border: '1.5px solid rgba(255, 255, 255, 0.95)',
                boxShadow: '0 25px 50px -10px rgba(14, 116, 224, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(28px) saturate(200%)',
                WebkitBackdropFilter: 'blur(28px) saturate(200%)',
            };
        }
        // Default light theme
        return {
            backgroundColor: '#ffffff',
            backgroundImage: 'linear-gradient(139deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '5px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 20px 45px -10px rgba(50, 50, 93, 0.3), 0 10px 20px -6px rgba(0, 0, 0, 0.18)',
        };
    };

    const getItemWrapperClass = (isSelected: boolean) => {
        if (isWinamp) {
            return isSelected
                ? 'bg-[#00FF00] text-black font-bold border border-[#00FF00]'
                : 'text-[#00FF00] hover:bg-zinc-800 border border-transparent';
        }
        if (isDark || isDarkFluid) {
            return isSelected
                ? 'bg-[#323741] text-white border border-slate-600 font-bold'
                : 'text-slate-100 hover:bg-[#323741] border border-transparent';
        }
        if (isVista) {
            return isSelected
                ? 'bg-sky-200/80 text-sky-950 border border-sky-400/60 shadow-xs font-bold'
                : 'text-sky-950 hover:bg-sky-500/15 border border-transparent font-medium';
        }
        // Default Light theme
        return isSelected
            ? 'bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs font-bold'
            : 'text-slate-900 hover:bg-slate-100/90 border border-transparent';
    };

    return (
        <div 
            ref={containerRef} 
            className={`relative w-full ${isOpen ? 'z-50' : ''}`}
            onClick={(e) => {
                if (!disabled) {
                    e.stopPropagation();
                }
            }}
        >
            {/* Trigger Button */}
            <button
                type="button"
                disabled={disabled}
                title={`Shift: ${normalizedValue ? normalizedValue.toUpperCase() : 'Belum dipilih'}`}
                onClick={(e) => {
                    if (disabled) return;
                    e.stopPropagation();
                    toggleOpen();
                }}
                className={`w-full flex items-center ${
                    compact ? 'justify-center text-center' : 'justify-between'
                } transition-all duration-300 select-none ${disabled ? 'cursor-default' : 'cursor-pointer'} ${
                    compact
                        ? 'py-0.5 px-0.5 sm:px-1 text-[9.5px] min-[400px]:text-[10px] sm:text-[10.5px] lg:text-[11.5px]'
                        : 'py-1.5 px-2.5 text-xs sm:text-sm'
                } font-extrabold uppercase tracking-tight rounded-[5px] border ${
                    normalizedValue
                        ? `${currentShiftColor.bg} ${currentShiftColor.text} ${currentShiftColor.border} shadow-2xs`
                        : isWinamp
                        ? 'bg-black text-[#00FF00] border-zinc-700 font-mono'
                        : isDarkFluid
                        ? 'bg-[#2B2930] text-[#E6E0E9] border-white/10 hover:border-white/20'
                        : isDark
                        ? 'bg-[#2a2f3b] text-white border-slate-700 hover:bg-[#323741]'
                        : 'bg-white/90 text-slate-800 border-slate-300 hover:border-slate-400 shadow-2xs'
                }`}
            >
                <div className={`flex items-center justify-center gap-0.5 min-w-0 ${compact ? 'flex-1' : ''}`}>
                    {SelectedShiftIcon && (
                        <SelectedShiftIcon theme={theme} className={`${compact ? ((normalizedValue || '').length >= 5 ? 'hidden min-[1400px]:inline-block' : 'hidden min-[1280px]:inline-block') + ' w-2.5 h-2.5' : 'w-3.5 h-3.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5'} shrink-0 opacity-80`} />
                    )}
                    <span className={`whitespace-nowrap uppercase font-black ${
                        compact
                            ? (normalizedValue || '').length >= 5
                                ? 'text-[7.5px] min-[360px]:text-[8px] min-[400px]:text-[9px] sm:text-[10px] lg:text-[11px] tracking-[-0.05em] leading-tight'
                                : (normalizedValue || '').length === 4
                                ? 'text-[8.5px] min-[360px]:text-[9px] min-[400px]:text-[10px] sm:text-[10.5px] lg:text-[11.5px] tracking-tighter leading-tight'
                                : 'text-[9.5px] min-[400px]:text-[10px] sm:text-[10.5px] lg:text-[11.5px] tracking-tight leading-tight'
                            : ''
                    }`}>
                        {normalizedValue ? normalizedValue.toUpperCase() : (compact ? '-' : '-- SHIFT --')}
                    </span>
                </div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className={`${compact ? 'w-2 h-2 ml-0.5' : 'w-3 h-3 ml-1'} shrink-0 transition-transform duration-300 ease-in-out ${
                        isOpen ? 'rotate-180' : 'rotate-0'
                    } opacity-80`}
                    fill="currentColor"
                >
                    <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
                </svg>
            </button>

            {/* Portalled Dropdown Popover: Floats on document.body to prevent clipping inside card or folded menu boundaries */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            key="shift-dropdown-popover"
                            ref={menuRef}
                            initial={{ opacity: 0, y: coords.openUpward ? 6 : -6, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: coords.openUpward ? 6 : -6, scale: 0.96 }}
                            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            onTouchMove={(e) => e.stopPropagation()}
                            onWheel={(e) => e.stopPropagation()}
                            style={{
                                ...getDropdownCardStyle(),
                                position: 'fixed',
                                top: coords.openUpward ? undefined : coords.top,
                                bottom: coords.openUpward ? window.innerHeight - coords.top : undefined,
                                left: coords.left,
                                width: coords.width,
                                zIndex: 10000,
                                transformOrigin: coords.openUpward ? 'bottom center' : 'top center',
                                willChange: 'transform, opacity',
                                scrollbarWidth: 'thin',
                                WebkitOverflowScrolling: 'touch',
                            }}
                            className={`max-h-[55vh] sm:max-h-[310px] overflow-y-auto overscroll-contain py-2 flex flex-col gap-1 select-none transform-gpu touch-pan-y ${
                                isWinamp ? 'font-mono' : ''
                            }`}
                        >
                            {/* List 1: Regular Working Shifts */}
                            <ul className="flex flex-col gap-0.5 px-1.5 list-none m-0 p-0">
                                {REGULAR_SHIFTS.map((item) => {
                                    const IconComponent = item.icon;
                                    const isSelected = normalizedValue === item.key;

                                    return (
                                        <li
                                            key={item.key}
                                            onClick={() => handleSelect(item.key)}
                                            className={`group flex items-center justify-between px-2.5 py-1.5 rounded-[6px] cursor-pointer transition-all duration-150 active:scale-[0.99] shrink-0 ${getItemWrapperClass(isSelected)}`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                <IconComponent
                                                    theme={theme}
                                                    className={`w-4 h-4 shrink-0 ${
                                                        isWinamp ? 'text-current' : 'opacity-85 text-current'
                                                    }`}
                                                />
                                                <div className="flex flex-col min-w-0 text-left py-0.5">
                                                    <span className="text-xs font-bold leading-normal pb-0.5 truncate">
                                                        {item.label}
                                                    </span>
                                                    {item.sublabel && (
                                                        <span
                                                            className={`text-[10px] truncate leading-normal pb-0.5 ${
                                                                isWinamp
                                                                    ? 'text-zinc-400'
                                                                    : isDark || isDarkFluid
                                                                    ? 'text-slate-400'
                                                                    : isVista
                                                                    ? 'text-sky-800/80'
                                                                    : 'text-slate-500'
                                                            }`}
                                                        >
                                                            {item.sublabel}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <Check
                                                    className={`w-3.5 h-3.5 shrink-0 ml-1.5 ${
                                                        isWinamp
                                                            ? 'text-black font-black'
                                                            : isDark || isDarkFluid
                                                            ? 'text-indigo-400'
                                                            : isVista
                                                            ? 'text-sky-700'
                                                            : 'text-teal-600'
                                                    }`}
                                                />
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>

                            {/* Separator 1 */}
                            <div
                                className={`border-t my-0.5 shrink-0 ${
                                    isWinamp
                                        ? 'border-zinc-800'
                                        : isDark || isDarkFluid
                                        ? 'border-white/10'
                                        : isVista
                                        ? 'border-sky-200/80'
                                        : 'border-slate-200'
                                }`}
                            />

                            {/* List 2: Rest & Cuti */}
                            <ul className="flex flex-col gap-0.5 px-1.5 list-none m-0 p-0">
                                {REST_SHIFTS.map((item) => {
                                    const IconComponent = item.icon;
                                    const isSelected = normalizedValue === item.key;

                                    return (
                                        <li
                                            key={item.key}
                                            onClick={() => handleSelect(item.key)}
                                            className={`group flex items-center justify-between px-2.5 py-1.5 rounded-[6px] cursor-pointer transition-all duration-150 active:scale-[0.99] shrink-0 ${getItemWrapperClass(isSelected)}`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                <IconComponent
                                                    theme={theme}
                                                    className={`w-4 h-4 shrink-0 ${
                                                        isWinamp ? 'text-current' : 'opacity-85 text-current'
                                                    }`}
                                                />
                                                <div className="flex flex-col min-w-0 text-left py-0.5">
                                                    <span className="text-xs font-bold leading-normal pb-0.5 truncate">
                                                        {item.label}
                                                    </span>
                                                    {item.sublabel && (
                                                        <span
                                                            className={`text-[10px] truncate leading-normal pb-0.5 ${
                                                                isWinamp
                                                                    ? 'text-zinc-400'
                                                                    : isDark || isDarkFluid
                                                                    ? 'text-slate-400'
                                                                    : isVista
                                                                    ? 'text-sky-800/80'
                                                                    : 'text-slate-500'
                                                            }`}
                                                        >
                                                            {item.sublabel}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <Check
                                                    className={`w-3.5 h-3.5 shrink-0 ml-1.5 ${
                                                        isWinamp
                                                            ? 'text-black font-black'
                                                            : isDark || isDarkFluid
                                                            ? 'text-indigo-400'
                                                            : isVista
                                                            ? 'text-sky-700'
                                                            : 'text-teal-600'
                                                    }`}
                                                />
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>

                            {/* Separator 2 */}
                            <div
                                className={`border-t my-0.5 shrink-0 ${
                                    isWinamp
                                        ? 'border-zinc-800'
                                        : isDark || isDarkFluid
                                        ? 'border-white/10'
                                        : isVista
                                        ? 'border-sky-200/80'
                                        : 'border-slate-200'
                                }`}
                            />

                            {/* Delete / Reset Action */}
                            <div className="px-1.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => handleSelect('')}
                                    className={`w-full group flex items-center justify-between px-2.5 py-1.5 rounded-[6px] cursor-pointer transition-all duration-150 active:scale-[0.99] ${
                                        isWinamp
                                            ? 'hover:bg-red-950 text-red-500 font-mono text-xs'
                                            : isDark || isDarkFluid
                                            ? 'hover:bg-rose-500/15 text-rose-400 text-xs font-bold'
                                            : 'hover:bg-rose-50 text-rose-600 text-xs font-bold'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                        <span className="text-xs font-bold truncate">Kosongkan Shift (-)</span>
                                    </div>
                                    {!normalizedValue && (
                                        <Check className="w-3.5 h-3.5 shrink-0 text-rose-500 ml-1" />
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

