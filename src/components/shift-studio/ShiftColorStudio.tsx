import React, { useState, useRef, useEffect } from 'react';
import ColorPicker from 'react-best-gradient-color-picker';
import { ShiftVisualStyle } from '../../types';

interface ShiftColorStudioProps {
    visual: ShiftVisualStyle;
    onChange: (visual: ShiftVisualStyle) => void;
    theme?: string;
}

export const ShiftColorStudio: React.FC<ShiftColorStudioProps> = ({ visual, onChange, theme }) => {
    // Selected target mode: 'bg' | 'text' | 'border' | 'motif'
    const [targetMode, setTargetMode] = useState<'bg' | 'text' | 'border' | 'motif'>('bg');
    const colorPickerWrapperRef = useRef<HTMLDivElement>(null);

    // Dynamic theme state detection
    const [activeTheme, setActiveTheme] = useState<string>(() => {
        return theme || document.documentElement.getAttribute('data-theme') || 'default';
    });

    useEffect(() => {
        if (theme) {
            setActiveTheme(theme);
            return;
        }
        const observer = new MutationObserver(() => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'default';
            setActiveTheme(currentTheme);
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });
        return () => observer.disconnect();
    }, [theme]);

    // Theme style mapping for container and tabs
    const getThemeClasses = () => {
        const effective = theme || activeTheme;
        switch (effective) {
            case 'industrial':
                return {
                    container: "bg-[#0F1115] border border-[rgba(226,232,240,0.15)] text-[#E2E8F0] font-['JetBrains_Mono'] rounded-xl shadow-md",
                    labelSpan: 'text-[#2DD4BF] font-extrabold',
                    tabHeader: 'bg-[#1A1D23] border-[rgba(226,232,240,0.12)]',
                    tabActive: 'bg-[#2DD4BF]/20 text-[#2DD4BF] font-extrabold border-[#2DD4BF]/50 rounded-[4px]',
                    tabInactive: 'text-[#E2E8F0]/70 hover:bg-white/5 border-transparent',
                    pickerWrapper: 'bg-[#1A1D23] border border-[rgba(226,232,240,0.15)] rounded-xl'
                };
            case 'paperSketch':
                return {
                    container: "bg-[#fdfcf0] border-2 border-[#2b2b2b] text-[#2b2b2b] font-['Gaegu'] text-base rounded-2xl shadow-[4px_4px_0px_#2b2b2b]",
                    labelSpan: 'text-[#ff4747] font-extrabold',
                    tabHeader: 'bg-[#f2efeb] border-2 border-[#2b2b2b]',
                    tabActive: 'bg-[#ff4747] text-white font-extrabold border-2 border-[#2b2b2b] rounded-lg shadow-[2px_2px_0px_#2b2b2b]',
                    tabInactive: 'text-[#2b2b2b] hover:bg-[#2ec4b6]/20 border-transparent font-bold',
                    pickerWrapper: 'bg-[#fdfcf0] border-2 border-[#2b2b2b] rounded-xl'
                };
            case 'editorial':
                return {
                    container: 'bg-[#FCFBF9] border border-[#1a1a1a]/25 text-[#1a1a1a] font-serif rounded-xl shadow-xs',
                    labelSpan: 'text-[#2A7373] font-extrabold',
                    tabHeader: 'bg-[#F2EFE9] border-[#1a1a1a]/20',
                    tabActive: 'bg-white text-[#2A7373] font-extrabold border border-[#1a1a1a]/30 rounded-md',
                    tabInactive: 'text-[#1a1a1a]/70 hover:bg-[#1a1a1a]/5 border-transparent',
                    pickerWrapper: 'bg-[#FCFBF9] border border-[#1a1a1a]/25 rounded-xl'
                };
            case 'technical':
                return {
                    container: 'bg-[#F8F7F4] dark:bg-[#0D1117] border border-slate-300 dark:border-slate-800 text-[#111113] dark:text-[#E6EDF3] font-mono rounded-lg',
                    labelSpan: 'text-[#0D9488] dark:text-teal-400 font-extrabold',
                    tabHeader: 'bg-slate-200/80 dark:bg-[#161B22] border-slate-300 dark:border-slate-800',
                    tabActive: 'bg-white dark:bg-[#21262D] text-[#0D9488] dark:text-teal-300 font-extrabold border border-slate-300 dark:border-slate-700 rounded-sm',
                    tabInactive: 'text-slate-600 dark:text-slate-400 hover:bg-slate-300/40 dark:hover:bg-slate-800 border-transparent',
                    pickerWrapper: 'bg-[#F8F7F4] dark:bg-[#0D1117] border border-slate-300 dark:border-slate-800 rounded-lg'
                };
            case 'dashboard':
                return {
                    container: 'bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl shadow-xs',
                    labelSpan: 'text-slate-600 dark:text-slate-400 font-extrabold',
                    tabHeader: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
                    tabActive: 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-300 font-extrabold shadow-2xs border-slate-300 dark:border-slate-600',
                    tabInactive: 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 border-transparent',
                    pickerWrapper: 'bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl'
                };
            case 'winamp':
                return {
                    container: 'bg-black border-[#00FF00] text-[#00FF00] font-mono rounded-none',
                    labelSpan: 'text-[#00FF00] font-bold',
                    tabHeader: 'bg-black border-[#00FF00]',
                    tabActive: 'bg-[#00FF00]/10 text-[#00FF00] border-[#00ff00] font-black rounded-none',
                    tabInactive: 'text-[#00FF00] hover:bg-zinc-900 border-transparent',
                    pickerWrapper: 'bg-black border-[#00FF00] rounded-none'
                };
            case 'vista':
                return {
                    container: 'bg-white/80 backdrop-blur-md border-sky-300/80 text-blue-950 shadow-sm rounded-2xl',
                    labelSpan: 'text-blue-900 font-black',
                    tabHeader: 'bg-sky-50/50 border-sky-100',
                    tabActive: 'bg-white text-blue-700 shadow-2xs font-extrabold border-sky-300/80',
                    tabInactive: 'text-blue-800 hover:bg-sky-100/30 border-transparent',
                    pickerWrapper: 'bg-white/95 border-sky-200 shadow-sm'
                };
            case 'darkFluid':
                return {
                    container: 'bg-[#1C1B1F] border-[#36343B] text-[#E6E1E5] rounded-2xl',
                    labelSpan: 'text-zinc-400 font-black',
                    tabHeader: 'bg-[#25232A] border-[#36343B]',
                    tabActive: 'bg-[#49454F] text-[#D0BCFF] font-extrabold border-transparent',
                    tabInactive: 'text-zinc-400 hover:bg-zinc-800/40 border-transparent',
                    pickerWrapper: 'bg-[#1C1B1F] border-[#36343B]'
                };
            case 'dark':
                return {
                    container: 'bg-[#18181B] border-zinc-800 text-zinc-100 rounded-2xl',
                    labelSpan: 'text-zinc-400 font-black',
                    tabHeader: 'bg-[#09090B] border-zinc-800',
                    tabActive: 'bg-zinc-800 text-teal-400 shadow-3xs font-extrabold border-zinc-700',
                    tabInactive: 'text-zinc-400 hover:bg-zinc-800/30 border-transparent',
                    pickerWrapper: 'bg-[#18181B] border-zinc-800'
                };
            default: // light
                return {
                    container: 'bg-slate-50 border-slate-200 text-slate-800 rounded-2xl shadow-3xs',
                    labelSpan: 'text-slate-500 font-black',
                    tabHeader: 'bg-slate-100/80 border-slate-200',
                    tabActive: 'bg-white text-teal-600 shadow-3xs font-extrabold border-slate-300',
                    tabInactive: 'text-slate-500 hover:bg-slate-200/50 border-transparent',
                    pickerWrapper: 'bg-slate-50 border-slate-200'
                };
        }
    };

    const themeStyles = getThemeClasses();

    // Attach mouse wheel scroll handler to range sliders and numeric inputs inside ColorPicker + pause parent scrollbar
    useEffect(() => {
        const wrapper = colorPickerWrapperRef.current;
        if (!wrapper) return;

        const getModalBody = () => wrapper.closest('.modal-scroll-body') as HTMLElement | null;

        const handleMouseEnter = () => {
            const modalBody = getModalBody();
            if (modalBody) {
                modalBody.style.overflow = 'hidden';
            }
        };

        const handleMouseLeave = () => {
            const modalBody = getModalBody();
            if (modalBody) {
                modalBody.style.overflow = 'auto';
            }
        };

        const handleWheel = (e: WheelEvent) => {
            const target = e.target as HTMLElement;
            if (!target) return;

            // Prevent parent container scrolling
            e.preventDefault();
            e.stopPropagation();

            // Find closest input element if user hovers on input or slider
            const input = target.closest('input') as HTMLInputElement | null;
            if (input) {
                const val = parseFloat(input.value) || 0;
                const step = parseFloat(input.step) || (input.type === 'range' ? 5 : 1);
                const min = input.min !== '' ? parseFloat(input.min) : 0;
                const max = input.max !== '' ? parseFloat(input.max) : (input.type === 'range' ? 100 : 360);

                const delta = e.deltaY < 0 ? step : -step;
                const newVal = Math.min(max, Math.max(min, val + delta));

                // Dispatch native input & change events so react-best-gradient-color-picker updates
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLInputElement.prototype,
                    'value'
                )?.set;
                nativeInputValueSetter?.call(input, newVal.toString());

                const inputEvent = new Event('input', { bubbles: true });
                input.dispatchEvent(inputEvent);
                const changeEvent = new Event('change', { bubbles: true });
                input.dispatchEvent(changeEvent);
            }
        };

        wrapper.addEventListener('mouseenter', handleMouseEnter);
        wrapper.addEventListener('mouseleave', handleMouseLeave);
        wrapper.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            wrapper.removeEventListener('mouseenter', handleMouseEnter);
            wrapper.removeEventListener('mouseleave', handleMouseLeave);
            wrapper.removeEventListener('wheel', handleWheel);
        };
    }, []);

    // Compute active background color/gradient string
    const getBgColorString = (): string => {
        if (visual.customCss) {
            return visual.customCss.replace(/background(-color)?:\s*|;/g, '').trim();
        }
        if (visual.colorMode === 'radial' && visual.colorStops && visual.colorStops.length > 0) {
            const stopsStr = visual.colorStops.map((s) => `${s.color} ${s.position}%`).join(', ');
            return `radial-gradient(circle at center, ${stopsStr})`;
        }
        if (visual.colorMode === 'linear' && visual.colorStops && visual.colorStops.length > 0) {
            const stopsStr = visual.colorStops.map((s) => `${s.color} ${s.position}%`).join(', ');
            return `linear-gradient(${visual.gradientAngle || 135}deg, ${stopsStr})`;
        }
        return visual.solidColor || '#006D77';
    };

    // Get current picker value based on active target
    const getCurrentValue = (): string => {
        if (targetMode === 'bg') return getBgColorString();
        if (targetMode === 'text') return visual.textColor || '#FFFFFF';
        if (targetMode === 'border') return visual.borderColor || '#83C5BE';
        if (targetMode === 'motif') return visual.patternColor || 'rgba(255,255,255,0.4)';
        return '#006D77';
    };

    // Handle color change from react-best-gradient-color-picker
    const handleColorChange = (newColor: string) => {
        if (targetMode === 'bg') {
            const isGradient = newColor.includes('gradient');
            if (isGradient) {
                onChange({
                    ...visual,
                    colorMode: 'customCss',
                    customCss: newColor,
                });
            } else {
                onChange({
                    ...visual,
                    colorMode: 'solid',
                    solidColor: newColor,
                    customCss: newColor,
                });
            }
        } else if (targetMode === 'text') {
            onChange({
                ...visual,
                textColor: newColor,
            });
        } else if (targetMode === 'border') {
            onChange({
                ...visual,
                borderColor: newColor,
            });
        } else if (targetMode === 'motif') {
            onChange({
                ...visual,
                patternColor: newColor,
            });
        }
    };

    return (
        <div className={`p-2 sm:p-2.5 rounded-2xl border space-y-2.5 font-sans shadow-2xs w-full overflow-visible min-w-0 lg:h-full lg:min-h-[445px] flex flex-col justify-between transition-colors ${themeStyles.container}`}>
            {/* Target Selector Tabs (Latar / Teks / Border / Motif) */}
            <div className="space-y-1.5">
                <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider block transition-colors ${themeStyles.labelSpan}`}>
                    Target Elemen Warna:
                </span>
                <div className={`flex items-center gap-1 p-1 rounded-xl border text-[11px] sm:text-xs font-black transition-colors ${themeStyles.tabHeader}`}>
                    <button
                        type="button"
                        onClick={() => setTargetMode('bg')}
                        className={`flex-1 py-1 px-1 sm:py-1.5 sm:px-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer border ${
                            targetMode === 'bg'
                                ? themeStyles.tabActive
                                : themeStyles.tabInactive
                        }`}
                        title="Edit Warna Latar"
                    >
                        <div
                            className="w-2.5 h-2.5 rounded-full border border-white/50 shadow-2xs shrink-0"
                            style={{ background: getBgColorString() }}
                        />
                        <span>Latar</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setTargetMode('text')}
                        className={`flex-1 py-1 px-1 sm:py-1.5 sm:px-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer border ${
                            targetMode === 'text'
                                ? themeStyles.tabActive
                                : themeStyles.tabInactive
                        }`}
                        title="Edit Warna Teks"
                    >
                        <div
                            className="w-2.5 h-2.5 rounded-full border border-white/50 shadow-2xs shrink-0"
                            style={{ backgroundColor: visual.textColor || '#FFFFFF' }}
                        />
                        <span>Teks</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setTargetMode('border')}
                        className={`flex-1 py-1 px-1 sm:py-1.5 sm:px-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer border ${
                            targetMode === 'border'
                                ? themeStyles.tabActive
                                : themeStyles.tabInactive
                        }`}
                        title="Edit Warna Border"
                    >
                        <div
                            className="w-2.5 h-2.5 rounded-full border border-white/50 shadow-2xs shrink-0"
                            style={{ backgroundColor: visual.borderColor || '#83C5BE' }}
                        />
                        <span>Border</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setTargetMode('motif')}
                        className={`flex-1 py-1 px-1 sm:py-1.5 sm:px-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer border ${
                            targetMode === 'motif'
                                ? themeStyles.tabActive
                                : themeStyles.tabInactive
                        }`}
                        title="Edit Warna Pattern Motif"
                    >
                        <div
                            className="w-2.5 h-2.5 rounded-full border border-white/50 shadow-2xs shrink-0"
                            style={{ backgroundColor: visual.patternColor || '#FFFFFF' }}
                        />
                        <span>Motif</span>
                    </button>
                </div>
            </div>

            {/* Pro-Tool Native Panel Wrapper with Hover Wheel Scroll & Pause Parent Scroll Enabled */}
            <div className="w-full flex justify-center shrink-0 overflow-visible py-1 flex-1">
                <div
                    ref={colorPickerWrapperRef}
                    className={`rbgcp-wrapper p-1.5 sm:p-2.5 rounded-xl w-full overflow-visible flex flex-col justify-center items-center shrink-0 min-w-0 select-none border shadow-md flex-1 transition-all ${themeStyles.pickerWrapper}`}
                    title="Hover & Scroll mouse pada slider/angka untuk mengubah nilai"
                >
                    <ColorPicker
                        value={getCurrentValue()}
                        onChange={handleColorChange}
                        width={270}
                        height={80}
                        hidePresets={false}
                        hideInputs={false}
                        hideControls={false}
                        hideOpacity={false}
                        hideEyeDrop={false}
                        hideAdvancedSliders={false}
                        hideColorGuide={false}
                        hideInputType={false}
                        hideColorTypeBtns={false}
                        hideGradientType={false}
                        hideGradientAngle={false}
                        hideGradientStop={false}
                        hideGradientControls={false}
                    />
                </div>
            </div>
        </div>
    );
};
