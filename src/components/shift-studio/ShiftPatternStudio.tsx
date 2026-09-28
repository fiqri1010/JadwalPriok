import React, { useRef, useState } from 'react';
import { ShiftVisualStyle, PresetPatternType } from '../../types';
import { BADGE_PATTERNS, isCustomPatternImage, parseCssPatternToStyle } from './patterns';
import { Upload, Trash2, Layers, Check, Code2, ExternalLink } from 'lucide-react';

interface ShiftPatternStudioProps {
    visual: ShiftVisualStyle;
    onChange: (visual: ShiftVisualStyle) => void;
}

export const ShiftPatternStudio: React.FC<ShiftPatternStudioProps> = ({ visual, onChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isCssInputOpen, setIsCssInputOpen] = useState(false);
    const [cssPatternInput, setCssPatternInput] = useState(
        visual.customPatternUrl && !isCustomPatternImage(visual.customPatternUrl)
            ? visual.customPatternUrl
            : ''
    );

    const motifColor = visual.patternColor || '#FFFFFF';

    // Opacity value normalized (0.05 to 1.0, default 100%)
    const opacityVal = visual.patternOpacity !== undefined
        ? (visual.patternOpacity > 1 ? visual.patternOpacity / 100 : visual.patternOpacity)
        : 1.0;

    // Scale value (0.5 to 3.0, default 1.0)
    const scaleVal = visual.patternScale !== undefined ? visual.patternScale : 1.0;

    // Stroke width value (0.5 to 4.0, default 1.2px)
    const strokeWidthVal = visual.patternStrokeWidth !== undefined ? visual.patternStrokeWidth : 1.2;

    const handleOpacityChange = (newVal: number) => {
        const percent = Math.round(newVal * 100);
        onChange({ ...visual, patternOpacity: percent });
    };

    const handleScaleChange = (newVal: number) => {
        onChange({ ...visual, patternScale: Number(newVal.toFixed(1)) });
    };

    const handleStrokeWidthChange = (newVal: number) => {
        onChange({ ...visual, patternStrokeWidth: Number(newVal.toFixed(1)) });
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

    // Helper to render mini SVG pattern box inside tile (always clean distinct preview per item)
    const renderTilePatternSvg = (patternId: PresetPatternType) => {
        const item = BADGE_PATTERNS.find((p) => p.id === patternId);
        if (!item || item.id === 'none') {
            return (
                <div className="w-full h-full bg-slate-100/30 dark:bg-zinc-800/30" />
            );
        }

        const patWidth = Math.max(4, Math.round(item.defaultWidth));
        const patHeight = Math.max(4, Math.round(item.defaultHeight));
        // Use fixed crisp standard preview stroke and white color for the catalog sample so each tile shows its own unique pattern
        const svgStr = item.svgContent('#FFFFFF', 1.2);

        return (
            <svg className="w-full h-full">
                <defs>
                    <pattern
                        id={`catalog-preview-pat-${item.id}`}
                        width={patWidth}
                        height={patHeight}
                        patternUnits="userSpaceOnUse"
                    >
                        <g dangerouslySetInnerHTML={{ __html: svgStr }} />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#catalog-preview-pat-${item.id})`} opacity="0.85" />
            </svg>
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

    const handleSliderWheelStrokeWidth = (e: React.WheelEvent<HTMLInputElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const step = 0.1;
        const delta = e.deltaY < 0 ? step : -step;
        const updated = Math.min(4.0, Math.max(0.5, strokeWidthVal + delta));
        handleStrokeWidthChange(updated);
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
        <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#161616] border border-slate-200/80 dark:border-zinc-800 space-y-2 font-sans shadow-2xs w-full min-w-0 lg:h-full lg:min-h-[445px] flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span className="text-xs sm:text-[13px] font-black">Katalog Motif Pola (Hero Patterns by Steve Schoger):</span>
                </div>
            </div>

            {/* Pattern Tile Grid Catalog */}
            <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                <span className="text-[10px] font-bold opacity-75 uppercase tracking-wider block">
                    Pilih Motif Pola (30 Koleksi Grid):
                </span>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-1.5 max-h-36 sm:max-h-40 lg:max-h-[195px] lg:h-[185px] overflow-y-auto p-1 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl bg-slate-50/50 dark:bg-zinc-900/50 custom-scrollbar flex-1">
                    {BADGE_PATTERNS.map((pattern) => {
                        const isSelected = (visual.patternType || 'none') === pattern.id && !visual.customPatternUrl;
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
                                }}
                                className={`p-1 rounded-lg border flex flex-col items-center justify-between text-center transition-all cursor-pointer relative group min-w-0 h-[50px] sm:h-[56px] shrink-0 ${
                                    isSelected
                                        ? 'border-2 border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400 font-extrabold shadow-xs scale-[1.01]'
                                        : 'border-slate-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-800/60 hover:bg-slate-100 dark:hover:bg-zinc-700/80 text-slate-700 dark:text-zinc-300'
                                }`}
                                title={pattern.name}
                            >
                                {/* Checkmark indicator on active tile */}
                                {isSelected && (
                                    <div className="absolute top-0.5 right-0.5 z-10 w-3.5 h-3.5 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-xs">
                                        <Check className="w-2 h-2 stroke-[3]" />
                                    </div>
                                )}

                                {/* Mini Pattern Box */}
                                <div className="w-full h-5.5 sm:h-6 rounded-md border border-slate-200/40 dark:border-zinc-700/40 bg-[#161616] overflow-hidden shadow-3xs relative shrink-0">
                                    {renderTilePatternSvg(pattern.id)}
                                </div>

                                {/* Short Name Label Underneath */}
                                <span className="text-[9px] sm:text-[9.5px] font-bold truncate w-full mt-1 leading-tight text-slate-700 dark:text-zinc-300">
                                    {pattern.shortName || pattern.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Dynamic Sliders Section: Opasitas, Skala/Kepadatan & Ketebalan Motif */}
            <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-zinc-800/80">
                {/* Row 1: Opasitas & Skala/Kepadatan Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                    {/* Slider 1: Opasitas Motif */}
                    <div
                        className="space-y-1 p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-800 shadow-3xs"
                        title="Hover & Scroll mouse untuk mengubah opasitas motif"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className="flex justify-between items-center text-[10.5px] font-bold">
                            <span className="opacity-75">Opasitas Motif:</span>
                            <span className="font-mono text-teal-600 dark:text-teal-400 font-extrabold">{Math.round(opacityVal * 100)}%</span>
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
                        className="space-y-1 p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-800 shadow-3xs"
                        title="Hover & Scroll mouse untuk mengubah skala/kepadatan motif"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className="flex justify-between items-center text-[10.5px] font-bold">
                            <span className="opacity-75">Skala / Kepadatan:</span>
                            <span className="font-mono text-teal-600 dark:text-teal-400 font-extrabold">{scaleVal.toFixed(1)}x</span>
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

                {/* Row 2: Slider 3 Ketebalan Motif */}
                <div
                    className="space-y-1 p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-800 w-full shadow-3xs"
                    title="Hover & Scroll mouse untuk mengubah ketebalan motif"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="flex justify-between items-center text-[10.5px] font-bold">
                        <span className="opacity-75">Ketebalan Motif:</span>
                        <span className="font-mono text-teal-600 dark:text-teal-400 font-extrabold">{strokeWidthVal.toFixed(1)}px</span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="4.0"
                        step="0.1"
                        value={strokeWidthVal}
                        onChange={(e) => handleStrokeWidthChange(parseFloat(e.target.value))}
                        onWheel={handleSliderWheelStrokeWidth}
                        className="w-full accent-teal-600 cursor-pointer h-1.5"
                    />
                </div>
            </div>

            {/* Custom Pattern Upload & CSS */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[10.5px] font-bold truncate">Pola Kustom:</span>
                    <input
                        type="file"
                        accept="image/png,image/svg+xml,image/jpeg,image/webp"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <div className="flex items-center space-x-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1.5 text-[10.5px] font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center space-x-1.5 cursor-pointer shrink-0 transition-all active:scale-95 shadow-2xs"
                            title="Unggah berkas gambar/SVG pola"
                        >
                            <Upload className="w-3 h-3" />
                            <span>Pilih Gambar</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsCssInputOpen(!isCssInputOpen)}
                            className={`px-2.5 py-1.5 text-[10.5px] font-bold rounded-lg border flex items-center space-x-1.5 cursor-pointer shrink-0 transition-all active:scale-95 ${
                                isCssInputOpen
                                    ? 'bg-teal-600 border-teal-500 text-white shadow-2xs'
                                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'
                            }`}
                            title="Tulis pola motif dengan CSS"
                        >
                            <Code2 className="w-3 h-3" />
                            <span>CSS</span>
                        </button>
                    </div>
                </div>

                {/* Inline CSS Pattern Editor */}
                {isCssInputOpen && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                            <div className="flex items-center space-x-1.5 flex-wrap">
                                <span className="text-[10px] font-bold opacity-75">Preset CSS Pola:</span>
                                <span className="text-[9.5px] opacity-40">•</span>
                                <span className="text-[9.5px] text-slate-500 dark:text-zinc-400 font-medium font-sans">Tools</span>
                                <span className="text-[9.5px] text-slate-400">→</span>
                                <a
                                    href="https://www.magicpattern.design/tools/css-backgrounds"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-0.5 text-[9.5px] font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 underline decoration-teal-400/50 underline-offset-2 transition-colors cursor-pointer"
                                    title="Buka generator CSS Background di MagicPattern"
                                >
                                    <span>MagicPattern</span>
                                    <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                                </a>
                            </div>
                            <div className="flex gap-1 text-[9px] flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const sample = 'repeating-linear-gradient(45deg, rgba(255,255,255,0.45) 0, rgba(255,255,255,0.45) 2px, transparent 2px, transparent 8px)';
                                        setCssPatternInput(sample);
                                        onChange({ ...visual, customPatternUrl: sample });
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-slate-200 dark:border-zinc-600 cursor-pointer font-mono"
                                    title="Pola Garis Diagonal"
                                >
                                    Garis
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const sample = 'radial-gradient(circle, rgba(255,255,255,0.6) 1.5px, transparent 1.5px)';
                                        setCssPatternInput(sample);
                                        onChange({ ...visual, customPatternUrl: sample });
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-slate-200 dark:border-zinc-600 cursor-pointer font-mono"
                                    title="Pola Titik Bintik Halus"
                                >
                                    Titik
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const sample = 'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)';
                                        setCssPatternInput(sample);
                                        onChange({ ...visual, customPatternUrl: sample });
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-slate-200 dark:border-zinc-600 cursor-pointer font-mono"
                                    title="Pola Kisi / Jaring (Mesh Grid)"
                                >
                                    Kisi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const sample = 'linear-gradient(45deg, rgba(255,255,255,0.3) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.3) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.3) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.3) 75%)';
                                        setCssPatternInput(sample);
                                        onChange({ ...visual, customPatternUrl: sample });
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-700 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-slate-200 dark:border-zinc-600 cursor-pointer font-mono"
                                    title="Pola Papan Catur (Checkerboard)"
                                >
                                    Catur
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-1.5 items-center">
                            <input
                                type="text"
                                value={cssPatternInput}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setCssPatternInput(val);
                                    if (val.trim()) {
                                        onChange({ ...visual, customPatternUrl: val.trim() });
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (cssPatternInput.trim()) {
                                            onChange({ ...visual, customPatternUrl: cssPatternInput.trim() });
                                        }
                                    }
                                }}
                                placeholder="repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 8px)"
                                className="flex-1 px-2.5 py-1.5 text-[10px] font-mono rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 focus:outline-none focus:border-teal-500"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (cssPatternInput.trim()) {
                                        onChange({ ...visual, customPatternUrl: cssPatternInput.trim() });
                                    }
                                }}
                                className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shrink-0 cursor-pointer transition-all active:scale-95 shadow-2xs"
                            >
                                Pasang
                            </button>
                        </div>
                    </div>
                )}

                {visual.customPatternUrl && (
                    <div className="flex items-center justify-between p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30">
                        <div className="flex items-center space-x-2 truncate min-w-0">
                            {isCustomPatternImage(visual.customPatternUrl) ? (
                                <img
                                    src={visual.customPatternUrl}
                                    alt="Custom Pattern"
                                    className="w-5 h-5 rounded object-cover border border-teal-500/30 shrink-0"
                                />
                            ) : (
                                <div
                                    className="w-5 h-5 rounded border border-teal-500/30 shrink-0 overflow-hidden bg-slate-800"
                                    style={parseCssPatternToStyle(visual.customPatternUrl, 0.5)}
                                />
                            )}
                            <span className="text-[10px] font-bold truncate">
                                {isCustomPatternImage(visual.customPatternUrl) ? 'Pola Gambar Kustom Aktif' : 'Pola CSS Kustom Aktif'}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                onChange({ ...visual, customPatternUrl: undefined });
                                setCssPatternInput('');
                            }}
                            className="p-1 rounded text-rose-500 hover:bg-rose-500/10 cursor-pointer shrink-0"
                            title="Hapus pola kustom"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
