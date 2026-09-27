import React, { useState, useRef, useEffect } from 'react';
import { ShiftVisualStyle, PresetPatternType } from '../../types';
import { BADGE_PATTERNS } from './patterns';
import { Upload, Trash2, Layers, ChevronDown, Check } from 'lucide-react';

interface ShiftPatternStudioProps {
    visual: ShiftVisualStyle;
    onChange: (visual: ShiftVisualStyle) => void;
}

export const ShiftPatternStudio: React.FC<ShiftPatternStudioProps> = ({ visual, onChange }) => {
    const [isDropdownOpen, setIsIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activePattern = BADGE_PATTERNS.find((p) => p.id === (visual.patternType || 'none')) || BADGE_PATTERNS[0];
    const motifColor = visual.patternColor || '#FFFFFF';

    // Opacity value normalized (0.05 to 1.0)
    const opacityVal = visual.patternOpacity !== undefined
        ? (visual.patternOpacity > 1 ? visual.patternOpacity / 100 : visual.patternOpacity)
        : 0.3;

    // Scale value (0.5 to 3.0, default 1.0)
    const scaleVal = visual.patternScale !== undefined ? visual.patternScale : 1.0;

    const handleOpacityChange = (newVal: number) => {
        // Store as percentage (10 to 100) or decimal for compatibility
        const percent = Math.round(newVal * 100);
        onChange({ ...visual, patternOpacity: percent });
    };

    const handleScaleChange = (newVal: number) => {
        onChange({ ...visual, patternScale: Number(newVal.toFixed(1)) });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const dataUrl = evt.target?.result as string;
            onChange({
                ...visual,
                customPatternUrl: dataUrl,
            });
        };
        reader.readAsDataURL(file);
    };

    // Helper to render mini SVG pattern preview box
    const renderMiniPreview = (patternId: PresetPatternType, width = 40, height = 40) => {
        const item = BADGE_PATTERNS.find((p) => p.id === patternId);
        if (!item || item.id === 'none') {
            return (
                <div className="w-9 h-9 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold opacity-40 shrink-0">
                    N/A
                </div>
            );
        }

        const patWidth = Math.max(2, Math.round(item.defaultWidth * 0.8));
        const patHeight = Math.max(2, Math.round(item.defaultHeight * 0.8));
        const svgStr = item.svgContent(motifColor);

        return (
            <div className="w-9 h-9 rounded-lg border border-slate-200 dark:border-zinc-700 bg-[#161616] overflow-hidden relative shrink-0 shadow-2xs">
                <svg className="w-full h-full">
                    <defs>
                        <pattern
                            id={`mini-pat-${item.id}`}
                            width={patWidth}
                            height={patHeight}
                            patternUnits="userSpaceOnUse"
                        >
                            <g dangerouslySetInnerHTML={{ __html: svgStr }} />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#mini-pat-${item.id})`} />
                </svg>
            </div>
        );
    };

    // Wheel scroll handlers for sliders + pause parent scrollbar
    const handleSliderWheelOpacity = (e: React.WheelEvent<HTMLInputElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const step = 0.05;
        const delta = e.deltaY < 0 ? step : -step;
        const updated = Math.min(1.0, Math.max(0.05, opacityVal + delta));
        handleOpacityChange(updated);
    };

    const handleSliderWheelScale = (e: React.WheelEvent<HTMLInputElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const step = 0.1;
        const delta = e.deltaY < 0 ? step : -step;
        const updated = Math.min(3.0, Math.max(0.5, scaleVal + delta));
        handleScaleChange(updated);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        const modalBody = e.currentTarget.closest('.modal-scroll-body') as HTMLElement | null;
        if (modalBody) {
            modalBody.style.overflow = 'hidden';
        }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        const modalBody = e.currentTarget.closest('.modal-scroll-body') as HTMLElement | null;
        if (modalBody) {
            modalBody.style.overflow = 'auto';
        }
    };

    return (
        <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-zinc-800 space-y-3 font-sans shadow-2xs w-full min-w-0">
            {/* Title */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span className="text-xs font-bold">Editor Motif Latar (Hero Patterns):</span>
                </div>
            </div>

            {/* Custom Pattern Selector Dropdown with Mini Visual Previews */}
            <div className="space-y-1 relative" ref={dropdownRef}>
                <label className="text-[10px] font-bold opacity-75 uppercase tracking-wider block">
                    Pilih Jenis Pola Hero (20 Koleksi):
                </label>

                {/* Custom Trigger Button */}
                <button
                    type="button"
                    onClick={() => setIsIsOpen(!isDropdownOpen)}
                    className="w-full p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/90 text-slate-800 dark:text-zinc-100 flex items-center justify-between gap-2 cursor-pointer hover:border-teal-500 dark:hover:border-teal-400 transition-all shadow-2xs"
                >
                    <div className="flex items-center space-x-2.5 min-w-0">
                        {renderMiniPreview(activePattern.id)}
                        <span className="text-xs font-bold truncate">{activePattern.name}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 opacity-60 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Options List Menu */}
                {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 shadow-xl p-1 space-y-1">
                        {BADGE_PATTERNS.map((pattern) => {
                            const isSelected = (visual.patternType || 'none') === pattern.id;
                            return (
                                <button
                                    key={pattern.id}
                                    type="button"
                                    onClick={() => {
                                        onChange({
                                            ...visual,
                                            patternType: pattern.id,
                                            customPatternUrl: undefined,
                                        });
                                        setIsIsOpen(false);
                                    }}
                                    className={`w-full p-1.5 rounded-lg flex items-center justify-between gap-2 transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 font-bold'
                                            : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2.5 min-w-0">
                                        {renderMiniPreview(pattern.id)}
                                        <span className="text-xs truncate">{pattern.name}</span>
                                    </div>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 2 Dynamic Sliders: Opasitas & Skala/Kepadatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center pt-1 border-t border-slate-200/60 dark:border-zinc-800/80">
                {/* Slider 1: Opasitas Motif */}
                <div
                    className="space-y-1 p-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-800"
                    title="Hover & Scroll mouse untuk mengubah opasitas motif"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="opacity-75">Opasitas Motif:</span>
                        <span className="font-mono text-teal-600 dark:text-teal-400">{Math.round(opacityVal * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0.05"
                        max="1.0"
                        step="0.05"
                        value={opacityVal}
                        onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                        onWheel={handleSliderWheelOpacity}
                        className="w-full accent-teal-600 cursor-pointer h-1.5"
                    />
                </div>

                {/* Slider 2: Skala / Kepadatan Motif */}
                <div
                    className="space-y-1 p-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-800"
                    title="Hover & Scroll mouse untuk mengubah skala/kepadatan motif"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="opacity-75">Skala / Kepadatan:</span>
                        <span className="font-mono text-teal-600 dark:text-teal-400">{scaleVal.toFixed(1)}x</span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="3.0"
                        step="0.1"
                        value={scaleVal}
                        onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                        onWheel={handleSliderWheelScale}
                        className="w-full accent-teal-600 cursor-pointer h-1.5"
                    />
                </div>
            </div>

            {/* Custom Pattern Upload */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800 space-y-1">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[10.5px] font-bold truncate">Unggah Gambar Pola Kustom:</span>
                    <input
                        type="file"
                        accept="image/png,image/svg+xml,image/jpeg,image/webp"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center space-x-1 cursor-pointer shrink-0 transition-all active:scale-95"
                    >
                        <Upload className="w-2.5 h-2.5" />
                        <span>Pilih Gambar</span>
                    </button>
                </div>

                {visual.customPatternUrl && (
                    <div className="flex items-center justify-between p-1 rounded-lg bg-teal-500/10 border border-teal-500/30">
                        <div className="flex items-center space-x-2 truncate">
                            <img
                                src={visual.customPatternUrl}
                                alt="Custom Pattern"
                                className="w-4 h-4 rounded object-cover border border-teal-500/30"
                            />
                            <span className="text-[9.5px] font-medium truncate">Pattern Kustom Aktif</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => onChange({ ...visual, customPatternUrl: undefined })}
                            className="p-0.5 rounded text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                            title="Hapus pattern kustom"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
