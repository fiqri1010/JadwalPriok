import React, { useState, useRef, useEffect } from 'react';
import ColorPicker from 'react-best-gradient-color-picker';
import { ShiftVisualStyle } from '../../types';

interface ShiftColorStudioProps {
    visual: ShiftVisualStyle;
    onChange: (visual: ShiftVisualStyle) => void;
    theme?: string;
}

export const ShiftColorStudio: React.FC<ShiftColorStudioProps> = ({ visual, onChange }) => {
    // Selected target mode: 'bg' | 'text' | 'border' | 'motif'
    const [targetMode, setTargetMode] = useState<'bg' | 'text' | 'border' | 'motif'>('bg');
    const colorPickerWrapperRef = useRef<HTMLDivElement>(null);

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
        <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-zinc-800 space-y-2 font-sans shadow-2xs w-full overflow-visible min-w-0">
            {/* Target Selector Tabs (Latar / Teks / Border / Motif) */}
            <div className="space-y-1">
                <span className="text-[10px] font-bold opacity-75 uppercase tracking-wider block">
                    Target Elemen Warna:
                </span>
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-[10px] font-bold">
                    <button
                        type="button"
                        onClick={() => setTargetMode('bg')}
                        className={`flex-1 py-1 px-1 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                            targetMode === 'bg'
                                ? 'bg-white dark:bg-zinc-700 text-teal-600 dark:text-teal-400 shadow-2xs'
                                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
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
                        className={`flex-1 py-1 px-1 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                            targetMode === 'text'
                                ? 'bg-white dark:bg-zinc-700 text-teal-600 dark:text-teal-400 shadow-2xs'
                                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
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
                        className={`flex-1 py-1 px-1 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                            targetMode === 'border'
                                ? 'bg-white dark:bg-zinc-700 text-teal-600 dark:text-teal-400 shadow-2xs'
                                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
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
                        className={`flex-1 py-1 px-1 rounded-lg flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                            targetMode === 'motif'
                                ? 'bg-white dark:bg-zinc-700 text-teal-600 dark:text-teal-400 shadow-2xs'
                                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
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

            {/* Pro-Tool Native Dark Panel Wrapper with Hover Wheel Scroll & Pause Parent Scroll Enabled */}
            <div className="w-full flex justify-center shrink-0 overflow-visible py-0.5">
                <div
                    ref={colorPickerWrapperRef}
                    className="rbgcp-wrapper bg-[#18181b] p-2.5 sm:p-3 rounded-xl shadow-md border border-zinc-800 text-white w-full overflow-visible flex justify-center shrink-0 min-w-0 select-none"
                    title="Hover & Scroll mouse pada slider/angka untuk mengubah nilai"
                >
                    <ColorPicker
                        value={getCurrentValue()}
                        onChange={handleColorChange}
                        width={275}
                        height={100}
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
