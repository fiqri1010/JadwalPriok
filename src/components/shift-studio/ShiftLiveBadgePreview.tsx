import React, { useState } from 'react';
import { ShiftVisualStyle, ShiftNamingConfig } from '../../types';
import { ICON_CATALOG } from './ShiftIconPickerModal';
import { BADGE_PATTERNS, isCustomPatternImage, parseCssPatternToStyle } from './patterns';
import { Smartphone, Monitor } from 'lucide-react';

interface ShiftLiveBadgePreviewProps {
    visual: ShiftVisualStyle;
    naming: ShiftNamingConfig;
    isPiket?: boolean;
}

export const ShiftLiveBadgePreview: React.FC<ShiftLiveBadgePreviewProps> = ({
    visual,
    naming,
}) => {
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

    // Build background CSS style based on visual config from ColorPicker
    const getBackgroundStyle = (): React.CSSProperties => {
        if (visual.colorMode === 'customCss' && visual.customCss) {
            return { background: visual.customCss.replace(/background(-color)?:\s*|;/g, '').trim() };
        }

        if (visual.colorMode === 'radial' && visual.colorStops && visual.colorStops.length > 0) {
            const stopsStr = visual.colorStops.map((s) => `${s.color} ${s.position}%`).join(', ');
            return { background: `radial-gradient(circle at center, ${stopsStr})` };
        }

        if (visual.colorMode === 'linear' && visual.colorStops && visual.colorStops.length > 0) {
            const stopsStr = visual.colorStops.map((s) => `${s.color} ${s.position}%`).join(', ');
            return { background: `linear-gradient(${visual.gradientAngle || 135}deg, ${stopsStr})` };
        }

        // Solid color fallback
        return { backgroundColor: visual.solidColor || '#EDF6F9' };
    };

    // Render Pattern SVG Overlay Layer with dynamic opacity, scale/density & stroke thickness
    const renderPatternOverlay = () => {
        if (visual.customPatternUrl) {
            let opacity = visual.patternOpacity !== undefined ? visual.patternOpacity : 1.0;
            if (opacity > 1) opacity = opacity / 100;

            if (isCustomPatternImage(visual.customPatternUrl)) {
                const imgScale = visual.patternScale || 1.0;
                const sizePx = Math.max(8, Math.round(16 * imgScale));
                return (
                    <div
                        className="absolute inset-0 pointer-events-none rounded-inherit z-0"
                        style={{
                            backgroundImage: `url(${visual.customPatternUrl})`,
                            backgroundRepeat: 'repeat',
                            backgroundPosition: 'center',
                            backgroundSize: `${sizePx}px ${sizePx}px`,
                            opacity,
                        }}
                    />
                );
            }

            // CSS Pattern (gradients, background rules, repeating patterns)
            const patColor = visual.patternColor || '#FFFFFF';
            const strokeWidth = visual.patternStrokeWidth !== undefined ? visual.patternStrokeWidth : 1.2;
            const cssStyle = parseCssPatternToStyle(visual.customPatternUrl, visual.patternScale || 1.0, patColor, strokeWidth);
            return (
                <div
                    className="absolute inset-0 pointer-events-none rounded-inherit z-0"
                    style={{
                        ...cssStyle,
                        opacity,
                    }}
                />
            );
        }

        const patternObj = BADGE_PATTERNS.find((p) => p.id === visual.patternType);
        if (!patternObj || patternObj.id === 'none') return null;

        const patColor = visual.patternColor || '#FFFFFF';
        const strokeWidth = visual.patternStrokeWidth !== undefined ? visual.patternStrokeWidth : 1.2;
        const svgContentStr = patternObj.svgContent(patColor, strokeWidth);

        // Dynamic width & height scaled by patternScale
        const scale = visual.patternScale || 1.0;
        const patWidth = Math.max(2, Math.round(patternObj.defaultWidth * scale));
        const patHeight = Math.max(2, Math.round(patternObj.defaultHeight * scale));

        let opacity = visual.patternOpacity !== undefined ? visual.patternOpacity : 1.0;
        if (opacity > 1) opacity = opacity / 100;

        return (
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none rounded-inherit overflow-hidden z-0"
                style={{ opacity }}
            >
                <defs>
                    <pattern
                        id={`badge-pattern-live-${patternObj.id}`}
                        width={patWidth}
                        height={patHeight}
                        patternUnits="userSpaceOnUse"
                    >
                        <g dangerouslySetInnerHTML={{ __html: svgContentStr }} />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#badge-pattern-live-${patternObj.id})`} />
            </svg>
        );
    };

    // Render Icon or Emoji
    const renderIcon = (sizeClass = 'w-3.5 h-3.5') => {
        if (visual.iconType === 'emoji' && visual.emoji) {
            return <span className="text-xs leading-none">{visual.emoji}</span>;
        }

        if (visual.iconType === 'customImage' && visual.customIconUrl) {
            return <img src={visual.customIconUrl} alt="Icon" className={`${sizeClass} object-contain rounded`} />;
        }

        if (visual.iconType === 'svg' && visual.iconName) {
            const found = ICON_CATALOG.find((i) => i.name === visual.iconName);
            if (found) {
                const IconComp = found.component;
                return <IconComp className={sizeClass} />;
            }
        }

        return null;
    };

    return (
        <div className="p-1.5 rounded-xl bg-white/70 dark:bg-[#161616] border border-slate-200/80 dark:border-zinc-800 shadow-2xs w-full">
            {/* Preview row with compact badge area & device toggle right next to it */}
            <div className="flex items-stretch justify-between gap-1.5 sm:gap-2">
                {/* Container Preview Area - Compact 2x Badge Width & Reduced Height */}
                <div className="flex-1 flex items-center justify-center p-1 sm:p-1.5 rounded-lg bg-slate-50/80 dark:bg-zinc-900/80 border border-slate-200/70 dark:border-zinc-800/80 min-h-[38px] min-w-0">
                    {previewDevice === 'desktop' ? (
                        /* Desktop Preview Card Badge */
                        <div
                            className="relative px-2.5 py-0.5 rounded-[5px] font-black text-[11px] shadow-xs border flex items-center space-x-1 select-none overflow-hidden transition-all max-w-full"
                            style={{
                                ...getBackgroundStyle(),
                                color: visual.textColor || '#FFFFFF',
                                borderColor: visual.borderColor || '#83C5BE',
                            }}
                        >
                            {renderPatternOverlay()}
                            <div className="relative z-10 flex items-center space-x-1">
                                {renderIcon('w-3 h-3')}
                                <span className="tracking-tight">{naming.displayBadge || 'SHIFT'}</span>
                            </div>
                        </div>
                    ) : (
                        /* Mobile Preview Card Badge */
                        <div className="flex items-center space-x-1.5">
                            <div
                                className="relative w-5 h-5 rounded-[4px] font-black text-[9.5px] shadow-2xs border flex items-center justify-center select-none overflow-hidden shrink-0"
                                style={{
                                    ...getBackgroundStyle(),
                                    color: visual.textColor || '#FFFFFF',
                                    borderColor: visual.borderColor || '#83C5BE',
                                }}
                            >
                                {renderPatternOverlay()}
                                <span className="relative z-10">{naming.copyCode || (naming.displayBadge || 'S').slice(0, 1)}</span>
                            </div>
                            <div className="text-[10px] leading-tight text-slate-600 dark:text-zinc-300 min-w-0">
                                <span className="font-bold block truncate max-w-[110px] sm:max-w-[130px]">{naming.fullName || 'Nama Shift'}</span>
                                <span className="block text-[9px] text-slate-400 dark:text-zinc-500">Salin: &apos;{naming.copyCode || 'S'}&apos;</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stacked Device Toggle Buttons */}
                <div className="flex flex-col justify-center gap-0.5 p-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-[9px] border border-slate-200/60 dark:border-zinc-700/50 shrink-0">
                    <button
                        type="button"
                        onClick={() => setPreviewDevice('desktop')}
                        className={`px-1.5 py-0.5 rounded font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors ${
                            previewDevice === 'desktop'
                                ? 'bg-teal-600 text-white shadow-2xs'
                                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Pratinjau Tampilan Desktop"
                    >
                        <Monitor className="w-2.5 h-2.5" />
                        <span className="text-[9px]">Desktop</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setPreviewDevice('mobile')}
                        className={`px-1.5 py-0.5 rounded font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors ${
                            previewDevice === 'mobile'
                                ? 'bg-teal-600 text-white shadow-2xs'
                                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Pratinjau Tampilan Mobile"
                    >
                        <Smartphone className="w-2.5 h-2.5" />
                        <span className="text-[9px]">Mobile</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
