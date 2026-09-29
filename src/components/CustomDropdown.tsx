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
    const isPaperSketch = theme === 'paperSketch';
    const isIndustrial = theme === 'industrial';
    const isTechnical = theme === 'technical';
    const isEditorial = theme === 'editorial';
    const isDashboard = theme === 'dashboard';

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
                optionSelected: 'bg-[#00FF00]/25 text-[#00FF00] font-black border border-[#00FF00]/50 font-mono',
                arrowFill: '#00FF00',
                activeBg: '#000000',
            };
        }
        if (isVista) {
            return {
                triggerBg: 'bg-white text-slate-900 border border-sky-300/80 shadow-xs',
                optionsBg: 'bg-white text-slate-900 border border-sky-300 shadow-2xl ring-1 ring-sky-100',
                optionHover: 'hover:bg-sky-100 hover:text-slate-950',
                optionSelected: 'bg-sky-100/90 text-sky-950 font-black border border-sky-300',
                arrowFill: '#0284c7',
                activeBg: '#ffffff',
            };
        }
        if (isPaperSketch) {
            return {
                triggerBg: 'bg-white text-[#2b2b2b] border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] font-[\'Gaegu\'] font-bold',
                optionsBg: 'bg-white text-[#2b2b2b] border-[2.5px] border-[#2b2b2b] shadow-[5px_5px_0px_#2b2b2b] font-[\'Gaegu\'] rounded-xl',
                optionHover: 'hover:bg-[#2ec4b6]/25 hover:text-[#2b2b2b]',
                optionSelected: 'bg-[#ff4747] text-white font-bold border border-[#2b2b2b] shadow-[1.5px_1.5px_0px_#2b2b2b]',
                arrowFill: '#2b2b2b',
                activeBg: '#ffffff',
            };
        }
        if (isIndustrial) {
            return {
                triggerBg: 'bg-[#1A1D23] text-[#E2E8F0] border border-[rgba(226,232,240,0.15)] shadow-md font-[\'JetBrains_Mono\'] uppercase tracking-wider',
                optionsBg: 'bg-[#1A1D23] text-[#E2E8F0] border border-[rgba(226,232,240,0.15)] shadow-2xl font-[\'JetBrains_Mono\'] rounded-[4px]',
                optionHover: 'hover:bg-white/10 hover:text-[#2DD4BF]',
                optionSelected: 'bg-[#2DD4BF]/20 text-[#2DD4BF] font-black border border-[#2DD4BF]/40',
                arrowFill: '#2DD4BF',
                activeBg: '#1A1D23',
            };
        }
        if (isTechnical) {
            return {
                triggerBg: 'bg-[#FFFFFF] text-[#111113] border border-[#111113]/20 shadow-xs font-[\'JetBrains_Mono\']',
                optionsBg: 'bg-[#FFFFFF] text-[#111113] border border-[#111113]/20 shadow-xl font-[\'JetBrains_Mono\'] rounded-[4px]',
                optionHover: 'hover:bg-[#0D9488]/10 hover:text-[#0D9488]',
                optionSelected: 'bg-[#0D9488]/15 text-[#0D9488] font-bold border border-[#0D9488]/30',
                arrowFill: '#0D9488',
                activeBg: '#FFFFFF',
            };
        }
        if (isEditorial) {
            return {
                triggerBg: 'bg-[#ffffff] text-[#1a1a1a] border border-[#1a1a1a]/20 shadow-xs font-[\'Geist_Mono\']',
                optionsBg: 'bg-[#ffffff] text-[#1a1a1a] border border-[#1a1a1a]/20 shadow-xl font-[\'Geist_Mono\'] rounded-[4px]',
                optionHover: 'hover:bg-[#2a7373]/10 hover:text-[#2a7373]',
                optionSelected: 'bg-[#2a7373]/15 text-[#2a7373] font-bold border border-[#2a7373]/30',
                arrowFill: '#2a7373',
                activeBg: '#ffffff',
            };
        }
        if (isDashboard) {
            return {
                triggerBg: 'bg-white text-[#011627] border border-[rgba(1,22,39,0.12)] shadow-2xs font-[\'Inter\']',
                optionsBg: 'bg-white text-[#011627] border border-[rgba(1,22,39,0.12)] shadow-xl font-[\'Inter\'] rounded-[8px]',
                optionHover: 'hover:bg-[#F6F7F8] hover:text-[#297373]',
                optionSelected: 'bg-[#297373]/10 text-[#297373] font-extrabold border border-[#297373]/20',
                arrowFill: '#297373',
                activeBg: '#ffffff',
            };
        }
        if (isDark) {
            return {
                triggerBg: 'bg-[#2a2f3b] text-white border border-[#3e4452] shadow-md',
                optionsBg: 'bg-[#2a2f3b] text-white border border-[#3e4452] shadow-2xl ring-1 ring-white/10',
                optionHover: 'hover:bg-[#323741] hover:text-white',
                optionSelected: 'bg-teal-500/20 text-teal-400 font-black border border-teal-500/30',
                arrowFill: '#ffffff',
                activeBg: '#2a2f3b',
            };
        }
        // Default Light Mode (Premium light gray/white theme)
        return {
            triggerBg: 'bg-white text-slate-800 border border-slate-200/90 hover:border-slate-300 shadow-3xs',
            optionsBg: 'bg-white text-slate-800 border border-slate-200 shadow-xl ring-1 ring-black/5',
            optionHover: 'hover:bg-slate-100 hover:text-slate-900',
            optionSelected: 'bg-teal-50 text-teal-700 font-black border border-teal-500/20',
            arrowFill: '#475569',
            activeBg: '#ffffff',
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
                                        ? styles.optionSelected
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
