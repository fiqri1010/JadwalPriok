import React, { useState } from 'react';
import { ShiftVisualStyle, ShiftNamingConfig } from '../../types';
import { ICON_CATALOG } from './ShiftIconPickerModal';
import { Smartphone, Monitor } from 'lucide-react';

interface ShiftLiveBadgePreviewProps {
    visual: ShiftVisualStyle;
    naming: ShiftNamingConfig;
    isPiket?: boolean;
}

export const ShiftLiveBadgePreview: React.FC<ShiftLiveBadgePreviewProps> = ({
    visual,
    naming,
    isPiket = false,
}) => {
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

    // Build background CSS style based on visual config
    const getBackgroundStyle = (): React.CSSProperties => {
        if (visual.colorMode === 'customCss' && visual.customCss) {
            // For custom CSS, parse simple background property or raw style
            return { background: visual.customCss.replace(/background(-color)?:\s*|;/g, '').trim() };
        }

        if (visual.colorMode === 'radial') {
            const stopsStr = visual.colorStops.map((s) => `${s.color} ${s.position}%`).join(', ');
            return { background: `radial-gradient(circle at center, ${stopsStr})` };
        }

        if (visual.colorMode === 'linear') {
            const stopsStr = visual.colorStops.map((s) => `${s.color} ${s.position}%`).join(', ');
            return { background: `linear-gradient(${visual.gradientAngle || 135}deg, ${stopsStr})` };
        }

        // Solid color fallback
        return { backgroundColor: visual.solidColor || '#EDF6F9' };
    };

    // Render Pattern Overlay
    const renderPatternOverlay = () => {
        if (visual.customPatternUrl) {
            return (
                <div
                    className="absolute inset-0 pointer-events-none rounded-inherit bg-repeat"
                    style={{
                        backgroundImage: `url(${visual.customPatternUrl})`,
                        backgroundSize: '16px 16px',
                        opacity: (visual.patternOpacity || 20) / 100,
                    }}
                />
            );
        }

        if (visual.patternType === 'stripes') {
            return (
                <div
                    className="absolute inset-0 pointer-events-none rounded-inherit"
                    style={{
                        backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0, rgba(255,255,255,0.25) 3px, transparent 0, transparent 6px)`,
                        opacity: (visual.patternOpacity || 20) / 100,
                    }}
                />
            );
        }

        if (visual.patternType === 'dots') {
            return (
                <div
                    className="absolute inset-0 pointer-events-none rounded-inherit"
                    style={{
                        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)`,
                        backgroundSize: '6px 6px',
                        opacity: (visual.patternOpacity || 20) / 100,
                    }}
                />
            );
        }

        if (visual.patternType === 'grid') {
            return (
                <div
                    className="absolute inset-0 pointer-events-none rounded-inherit"
                    style={{
                        backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)`,
                        backgroundSize: '8px 8px',
                        opacity: (visual.patternOpacity || 20) / 100,
                    }}
                />
            );
        }

        if (visual.patternType === 'honeycomb') {
            return (
                <div
                    className="absolute inset-0 pointer-events-none rounded-inherit"
                    style={{
                        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 2px, transparent 3px)`,
                        backgroundSize: '10px 10px',
                        opacity: (visual.patternOpacity || 20) / 100,
                    }}
                />
            );
        }

        if (visual.patternType === 'waves') {
            return (
                <div
                    className="absolute inset-0 pointer-events-none rounded-inherit"
                    style={{
                        backgroundImage: `radial-gradient(ellipse at center, rgba(255,255,255,0.25) 0%, transparent 70%)`,
                        backgroundSize: '12px 6px',
                        opacity: (visual.patternOpacity || 20) / 100,
                    }}
                />
            );
        }

        if (visual.patternType === 'carbon') {
            return (
                <div
                    className="absolute inset-0 pointer-events-none rounded-inherit"
                    style={{
                        backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0.3) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.3) 25%, transparent 25%)`,
                        backgroundSize: '6px 6px',
                        opacity: (visual.patternOpacity || 20) / 100,
                    }}
                />
            );
        }

        return null;
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
        <div className="p-3.5 rounded-2xl bg-current/5 border border-current/10 space-y-2.5">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Pratinjau Badge Shift (Live):</span>
                <div className="flex p-0.5 rounded-lg bg-current/10 text-[10px]">
                    <button
                        type="button"
                        onClick={() => setPreviewDevice('desktop')}
                        className={`px-2 py-0.5 rounded font-bold flex items-center space-x-1 cursor-pointer ${
                            previewDevice === 'desktop' ? 'bg-indigo-600 text-white shadow-xs' : 'opacity-70'
                        }`}
                    >
                        <Monitor className="w-3 h-3" />
                        <span>Desktop</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setPreviewDevice('mobile')}
                        className={`px-2 py-0.5 rounded font-bold flex items-center space-x-1 cursor-pointer ${
                            previewDevice === 'mobile' ? 'bg-indigo-600 text-white shadow-xs' : 'opacity-70'
                        }`}
                    >
                        <Smartphone className="w-3 h-3" />
                        <span>Mobile</span>
                    </button>
                </div>
            </div>

            {/* Container Preview Area */}
            <div className="flex items-center justify-center p-4 rounded-xl bg-slate-900/10 dark:bg-black/40 border border-current/10 min-h-[70px]">
                {previewDevice === 'desktop' ? (
                    /* Desktop Preview Card Badge */
                    <div
                        className="relative px-3 py-1.5 rounded-lg font-black text-xs shadow-md border flex items-center space-x-2 select-none overflow-hidden transition-all max-w-full"
                        style={{
                            ...getBackgroundStyle(),
                            color: visual.textColor || '#FFFFFF',
                            borderColor: visual.borderColor || '#83C5BE',
                        }}
                    >
                        {renderPatternOverlay()}
                        <div className="relative z-10 flex items-center space-x-1.5">
                            {renderIcon('w-4 h-4')}
                            <span className="tracking-wide">{naming.displayBadge || 'SHIFT'}</span>
                        </div>
                    </div>
                ) : (
                    /* Mobile Preview Card Badge */
                    <div className="flex items-center space-x-2">
                        <div
                            className="relative w-8 h-8 rounded-lg font-black text-xs shadow-sm border flex items-center justify-center select-none overflow-hidden"
                            style={{
                                ...getBackgroundStyle(),
                                color: visual.textColor || '#FFFFFF',
                                borderColor: visual.borderColor || '#83C5BE',
                            }}
                        >
                            {renderPatternOverlay()}
                            <span className="relative z-10">{naming.copyCode || (naming.displayBadge || 'S').slice(0, 1)}</span>
                        </div>
                        <div className="text-[11px] opacity-70">
                            <span className="font-bold">{naming.fullName || 'Nama Shift'}</span>
                            <span className="block text-[10px] opacity-60">Kode Salin: &apos;{naming.copyCode || 'S'}&apos;</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
