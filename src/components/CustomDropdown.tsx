import React, { useState, useRef, useEffect } from 'react';
import { AppTheme } from '../types';

export interface CustomDropdownOption<T = string | number> {
    value: T;
    label: React.ReactNode;
    textLabel?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}

export interface CustomDropdownProps<T = string | number> {
    value: T;
    options: CustomDropdownOption<T>[];
    onChange: (value: T) => void;
    placeholder?: string;
    className?: string;
    triggerClassName?: string;
    menuClassName?: string;
    optionClassName?: string;
    theme?: AppTheme;
    hideSelectedInList?: boolean; // Sesuai spesifikasi: opsi aktif disembunyikan di daftar
    openOnHover?: boolean;
    disabled?: boolean;
    align?: 'left' | 'right';
    width?: string;
}

export function CustomDropdown<T extends string | number>({
    value,
    options,
    onChange,
    placeholder = 'Pilih...',
    className = '',
    triggerClassName = '',
    menuClassName = '',
    optionClassName = '',
    theme,
    hideSelectedInList = false,
    openOnHover = false,
    disabled = false,
    align = 'left',
    width = 'w-fit min-w-[120px]',
}: CustomDropdownProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Deteksi tema aktif
    const isWinamp = theme === 'winamp';
    const isVista = theme === 'vista';
    const isDark = theme === 'dark';
    const isDarkFluid = theme === 'darkFluid';

    // Dismiss saat klik di luar dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    // Skema warna solid 100% opaque per tema
    const getThemeStyles = () => {
        if (isWinamp) {
            return {
                triggerBg: 'bg-[#000000] text-[#00FF00] border border-[#00FF00] font-mono',
                optionsBg: 'bg-[#000000] text-[#00FF00] border-2 border-[#00FF00] font-mono shadow-[0_4px_16px_rgba(0,255,0,0.3)]',
                optionHover: 'hover:bg-[#00FF00] hover:text-black font-mono',
                arrowFill: '#00FF00',
                activeBg: '#000000',
            };
        }
        if (isVista) {
            return {
                triggerBg: 'bg-white text-slate-900 border border-sky-300/80 shadow-xs',
                optionsBg: 'bg-white text-slate-900 border border-sky-300 shadow-2xl ring-1 ring-sky-100',
                optionHover: 'hover:bg-sky-100 hover:text-slate-950',
                arrowFill: '#0284c7',
                activeBg: '#ffffff',
            };
        }
        if (isDark || isDarkFluid) {
            return {
                triggerBg: 'bg-[#2a2f3b] text-white border border-[#3e4452] shadow-md',
                optionsBg: 'bg-[#2a2f3b] text-white border border-[#3e4452] shadow-2xl ring-1 ring-white/10',
                optionHover: 'hover:bg-[#323741] hover:text-white',
                arrowFill: '#ffffff',
                activeBg: '#2a2f3b',
            };
        }
        // Default Light Mode
        return {
            triggerBg: 'bg-[#2a2f3b] text-white border border-[#3e4452] shadow-md dark:bg-[#2a2f3b] dark:text-white',
            optionsBg: 'bg-[#2a2f3b] text-white border border-[#3e4452] shadow-2xl ring-1 ring-black/10',
            optionHover: 'hover:bg-[#323741] hover:text-white',
            arrowFill: '#ffffff',
            activeBg: '#2a2f3b',
        };
    };

    const styles = getThemeStyles();
    const currentSelectedOption = options.find((opt) => opt.value === value);

    // Opsi yang disaring jika hideSelectedInList aktif
    const visibleOptions = hideSelectedInList
        ? options.filter((opt) => opt.value !== value)
        : options;

    return (
        <div
            ref={dropdownRef}
            className={`select relative inline-block select-none transition-all duration-300 ${
                isOpen ? 'z-[100000]' : 'z-10'
            } ${width} ${className}`}
            onMouseEnter={openOnHover && !disabled ? () => setIsOpen(true) : undefined}
            onMouseLeave={openOnHover && !disabled ? () => setIsOpen(false) : undefined}
        >
            {/* Header Terpilih (.selected) */}
            <div
                role="button"
                tabIndex={disabled ? -1 : 0}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) setIsOpen((prev) => !prev);
                }}
                onKeyDown={(e) => {
                    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsOpen((prev) => !prev);
                    }
                }}
                className={`selected p-[5px] px-2.5 mb-[3px] rounded-[5px] text-xs sm:text-[13px] font-bold flex items-center justify-between gap-2 transition-all duration-300 cursor-pointer relative z-[100000] ${
                    styles.triggerBg
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${triggerClassName}`}
            >
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                    {currentSelectedOption?.icon}
                    <span className="truncate font-semibold">
                        {currentSelectedOption ? currentSelectedOption.label : placeholder}
                    </span>
                </div>

                {/* SVG Panah dengan Transisi Rotasi (-90deg saat tertutup, 0deg saat terbuka) */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="1em"
                    viewBox="0 0 512 512"
                    className={`arrow shrink-0 w-3 h-2.5 transition-transform duration-300 ease-in-out ${
                        isOpen ? 'rotate-0' : '-rotate-90'
                    }`}
                    style={{ fill: styles.arrowFill }}
                    aria-hidden="true"
                >
                    <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
                </svg>
            </div>

            {/* Kotak Daftar Opsi (.options) Melayang dengan Animasi Slide 300ms & Scrollbar */}
            <div
                className={`options absolute z-[100000] ${
                    align === 'right' ? 'right-0' : 'left-0'
                } min-w-[130px] w-full p-[5px] rounded-[5px] flex flex-col gap-1 transition-all duration-300 ease-out max-h-56 overflow-y-auto ${
                    styles.optionsBg
                } ${
                    isOpen
                        ? 'opacity-100 top-full pointer-events-auto translate-y-0 scale-100'
                        : 'opacity-0 top-[-80px] pointer-events-none -translate-y-2 scale-95'
                } ${menuClassName}`}
                style={{
                    backgroundColor: styles.activeBg,
                    scrollbarWidth: 'thin',
                }}
            >
                {visibleOptions.length === 0 ? (
                    <div className="p-2 text-center text-xs opacity-60">Semua opsi telah dipilih</div>
                ) : (
                    visibleOptions.map((opt, idx) => {
                        const isSelected = opt.value === value;
                        return (
                            <div
                                key={`${String(opt.value)}-${idx}`}
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`option p-[5px] px-2.5 rounded-[5px] text-xs font-semibold flex items-center justify-between gap-2 transition-all duration-300 cursor-pointer ${
                                    isSelected
                                        ? 'bg-indigo-600/30 font-bold border border-indigo-500/30'
                                        : styles.optionHover
                                } ${optionClassName}`}
                            >
                                <div className="flex items-center gap-2 min-w-0 truncate">
                                    {opt.icon}
                                    <span className="truncate">{opt.label}</span>
                                </div>
                                {isSelected && (
                                    <span className="text-[10px] opacity-75">✓</span>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default CustomDropdown;
