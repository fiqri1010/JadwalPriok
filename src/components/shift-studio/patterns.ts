import type React from 'react';
import { PresetPatternType } from '../../types';

export interface BadgePatternItem {
    id: PresetPatternType;
    name: string;
    shortName: string;
    defaultWidth: number;
    defaultHeight: number;
    svgContent: (color: string, strokeWidth?: number) => string;
}

export const BADGE_PATTERNS: BadgePatternItem[] = [
    {
        id: 'none',
        name: 'Polos (Tanpa Motif)',
        shortName: 'Polos',
        defaultWidth: 10,
        defaultHeight: 10,
        svgContent: () => '',
    },
    {
        id: 'topography',
        name: 'Topography (Kontur Peta)',
        shortName: 'Kontur',
        defaultWidth: 32,
        defaultHeight: 32,
        svgContent: (color, sw = 1.2) =>
            `<path d="M0 10 Q 8 2, 16 10 T 32 10 M0 22 Q 8 14, 16 22 T 32 22 M0 30 Q 16 20, 32 30" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`,
    },
    {
        id: 'circuit',
        name: 'Circuit Board (Jalur Sirkuit)',
        shortName: 'Sirkuit',
        defaultWidth: 24,
        defaultHeight: 24,
        svgContent: (color, sw = 1.2) =>
            `<path d="M0 12 H8 L12 4 H24 M12 20 H4 M16 12 V24" fill="none" stroke="${color}" stroke-width="${sw}"/><circle cx="8" cy="12" r="${Math.max(0.8, sw * 1.1)}" fill="${color}"/><circle cx="12" cy="4" r="${Math.max(0.8, sw * 1.1)}" fill="${color}"/><circle cx="16" cy="12" r="${Math.max(0.8, sw * 1.1)}" fill="${color}"/>`,
    },
    {
        id: 'plus',
        name: 'Plus (Simbol Plus)',
        shortName: 'Plus',
        defaultWidth: 16,
        defaultHeight: 16,
        svgContent: (color, sw = 1.2) =>
            `<path d="M8 4 V12 M4 8 H12" fill="none" stroke="${color}" stroke-width="${Math.max(0.8, sw * 1.2)}" stroke-linecap="round"/>`,
    },
    {
        id: 'dots',
        name: 'Polka Dots (Titik Halus)',
        shortName: 'Titik',
        defaultWidth: 10,
        defaultHeight: 10,
        svgContent: (color, sw = 1.2) => `<circle cx="5" cy="5" r="${Math.max(0.8, (sw / 1.2) * 1.8)}" fill="${color}"/>`,
    },
    {
        id: 'zigzag',
        name: 'ZigZag (Garis Siku)',
        shortName: 'ZigZag',
        defaultWidth: 16,
        defaultHeight: 10,
        svgContent: (color, sw = 1.2) =>
            `<path d="M0 8 L4 2 L8 8 L12 2 L16 8" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    {
        id: 'wavy',
        name: 'Wavy Lines (Gelombang Halus)',
        shortName: 'Wave',
        defaultWidth: 20,
        defaultHeight: 10,
        svgContent: (color, sw = 1.2) =>
            `<path d="M0 5 Q 5 0, 10 5 T 20 5" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`,
    },
    {
        id: 'stripes',
        name: 'Diagonal Stripes (Garis Miring)',
        shortName: 'Miring',
        defaultWidth: 12,
        defaultHeight: 12,
        svgContent: (color, sw = 1.2) =>
            `<path d="M0 12 L12 0 M-3 3 L3 -3 M9 15 L15 9" fill="none" stroke="${color}" stroke-width="${Math.max(0.8, sw * 1.2)}" stroke-linecap="square"/>`,
    },
    {
        id: 'honeycomb',
        name: 'Honeycomb (Sarang Lebah)',
        shortName: 'Sarang',
        defaultWidth: 16,
        defaultHeight: 28,
        svgContent: (color, sw = 1.2) =>
            `<path d="M8 0 L16 4.5 V13.5 L8 18 L0 13.5 V4.5 Z M8 28 L16 23.5 V14.5 M0 14.5 L8 28" fill="none" stroke="${color}" stroke-width="${sw}"/>`,
    },
    {
        id: 'grid',
        name: 'Box Grid (Kisi-kisi Persegi)',
        shortName: 'Grid',
        defaultWidth: 12,
        defaultHeight: 12,
        svgContent: (color, sw = 1.2) =>
            `<path d="M 12 0 L 0 0 0 12" fill="none" stroke="${color}" stroke-width="${sw}"/>`,
    },
    {
        id: 'carbon',
        name: 'Carbon Fiber (Serat Karbon)',
        shortName: 'Karbon',
        defaultWidth: 10,
        defaultHeight: 10,
        svgContent: (color, sw = 1.2) => {
            const pad = Math.max(0.2, (sw - 1.2) * 0.5);
            return `<rect x="${pad}" y="${pad}" width="${Math.max(1, 5 - pad)}" height="${Math.max(1, 5 - pad)}" fill="${color}" fill-opacity="0.85"/><rect x="${5 + pad}" y="${5 + pad}" width="${Math.max(1, 5 - pad)}" height="${Math.max(1, 5 - pad)}" fill="${color}" fill-opacity="0.85"/>`;
        },
    },
    {
        id: 'bubbles',
        name: 'Bubbles (Gelembung Air)',
        shortName: 'Gelembung',
        defaultWidth: 20,
        defaultHeight: 20,
        svgContent: (color, sw = 1.2) =>
            `<circle cx="6" cy="6" r="3" fill="none" stroke="${color}" stroke-width="${sw}"/><circle cx="15" cy="14" r="4.5" fill="none" stroke="${color}" stroke-width="${sw}"/><circle cx="16" cy="4" r="${Math.max(0.8, (sw / 1.2) * 1.5)}" fill="${color}"/>`,
    },
    {
        id: 'hexagons',
        name: 'Hexagon Mesh (Segienam Modern)',
        shortName: 'Segienam',
        defaultWidth: 18,
        defaultHeight: 18,
        svgContent: (color, sw = 1.2) =>
            `<path d="M9 0 L18 5 V13 L9 18 L0 13 V5 Z" fill="none" stroke="${color}" stroke-width="${sw}"/>`,
    },
    {
        id: 'diagonal',
        name: 'Diagonal Weave (Anyaman Cross)',
        shortName: 'Anyaman',
        defaultWidth: 14,
        defaultHeight: 14,
        svgContent: (color, sw = 1.2) =>
            `<path d="M0 0 L14 14 M14 0 L0 14" fill="none" stroke="${color}" stroke-width="${sw}"/>`,
    },
    {
        id: 'cross',
        name: 'Crosshatch (Arsiran Silang)',
        shortName: 'Silang',
        defaultWidth: 10,
        defaultHeight: 10,
        svgContent: (color, sw = 1.2) =>
            `<path d="M0 5 H10 M5 0 V10" fill="none" stroke="${color}" stroke-width="${sw}"/>`,
    },
    {
        id: 'diamonds',
        name: 'Diamond Lattice (Belah Ketupat)',
        shortName: 'Ketupat',
        defaultWidth: 16,
        defaultHeight: 16,
        svgContent: (color, sw = 1.2) =>
            `<path d="M8 0 L16 8 L8 16 L0 8 Z" fill="none" stroke="${color}" stroke-width="${sw}"/>`,
    },
    {
        id: 'stars',
        name: 'Tiny Stars (Bintang Mini)',
        shortName: 'Bintang',
        defaultWidth: 18,
        defaultHeight: 18,
        svgContent: (color, sw = 1.2) =>
            `<path d="M9 2 L11 7 L16 7 L12 10 L14 15 L9 12 L4 15 L6 10 L2 7 L7 7 Z" fill="${color}" stroke="${color}" stroke-width="${Math.max(0, sw - 1.0)}"/>`,
    },
    {
        id: 'triangles',
        name: 'Triangle Mesh (Segitiga)',
        shortName: 'Segitiga',
        defaultWidth: 16,
        defaultHeight: 16,
        svgContent: (color, sw = 1.2) =>
            `<path d="M8 0 L16 16 H0 Z M0 0 L16 16" fill="none" stroke="${color}" stroke-width="${sw}"/>`,
    },
    {
        id: 'chevron',
        name: 'Chevron V-Pattern (Sisik V)',
        shortName: 'Sisik V',
        defaultWidth: 16,
        defaultHeight: 12,
        svgContent: (color, sw = 1.2) =>
            `<path d="M0 2 L8 8 L16 2 M0 6 L8 12 L16 6" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    {
        id: 'concentric',
        name: 'Concentric Circles (Konsentris)',
        shortName: 'Konsentris',
        defaultWidth: 20,
        defaultHeight: 20,
        svgContent: (color, sw = 1.2) =>
            `<circle cx="10" cy="10" r="3" fill="none" stroke="${color}" stroke-width="${sw}"/><circle cx="10" cy="10" r="7" fill="none" stroke="${color}" stroke-width="${sw}"/><circle cx="10" cy="10" r="10" fill="none" stroke="${color}" stroke-width="${sw}"/>`,
    },
    {
        id: 'isometric',
        name: 'Isometric Cubes (Kubus 3D)',
        shortName: 'Kubus',
        defaultWidth: 20,
        defaultHeight: 34,
        svgContent: (color, sw = 1.2) =>
            `<path d="M10 0 L20 6 V18 L10 24 L0 18 V6 Z M10 0 V12 M0 6 L10 12 L20 6 M10 24 V34" fill="none" stroke="${color}" stroke-width="${sw}"/>`,
    },
    {
        id: 'scales',
        name: 'Fish Scales (Sisik Ikan)',
        shortName: 'Sisik',
        defaultWidth: 24,
        defaultHeight: 12,
        svgContent: (color, sw = 1.2) =>
            `<path d="M0 12 A 12 12 0 0 1 24 12 M-12 12 A 12 12 0 0 1 12 12 M12 12 A 12 12 0 0 1 36 12 M0 0 A 12 12 0 0 1 24 0" fill="none" stroke="${color}" stroke-width="${sw}"/>`,
    },
    {
        id: 'waves_ocean',
        name: 'Ocean Waves (Ombak Laut)',
        shortName: 'Ombak',
        defaultWidth: 20,
        defaultHeight: 12,
        svgContent: (color, sw = 1.2) =>
            `<path d="M0 6 C 5 0, 8 12, 12 6 C 16 0, 18 12, 20 6 M0 12 C 5 6, 8 18, 12 12 C 16 6, 18 18, 20 12" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`,
    },
    {
        id: 'bricks',
        name: 'Brick Wall (Susunan Bata)',
        shortName: 'Bata',
        defaultWidth: 24,
        defaultHeight: 12,
        svgContent: (color, sw = 1.2) =>
            `<path d="M0 0 H24 V12 H0 Z M0 6 H24 M12 0 V6 M0 6 V12 M24 6 V12 M6 6 V12 M18 6 V12" fill="none" stroke="${color}" stroke-width="${sw}"/>`,
    },
    {
        id: 'houndstooth',
        name: 'Houndstooth (Anyaman Tartan)',
        shortName: 'Tartan',
        defaultWidth: 16,
        defaultHeight: 16,
        svgContent: (color, sw = 1.2) =>
            `<path d="M0 0 H8 V8 H0 Z M8 8 H16 V16 H8 Z M8 0 L16 8 M0 8 L8 16" fill="none" stroke="${color}" stroke-width="${sw}"/>`,
    },
    {
        id: 'lines_vertical',
        name: 'Vertical Pinstripe (Garis Tegak)',
        shortName: 'Tegak',
        defaultWidth: 10,
        defaultHeight: 10,
        svgContent: (color, sw = 1.2) =>
            `<path d="M3 0 V10 M7 0 V10" fill="none" stroke="${color}" stroke-width="${sw}"/>`,
    },
    {
        id: 'polka_dense',
        name: 'Dense Matrix (Matriks Titik)',
        shortName: 'Matriks',
        defaultWidth: 12,
        defaultHeight: 12,
        svgContent: (color, sw = 1.2) =>
            `<circle cx="3" cy="3" r="${Math.max(0.6, (sw / 1.2) * 1.2)}" fill="${color}"/><circle cx="9" cy="3" r="${Math.max(0.6, (sw / 1.2) * 1.2)}" fill="${color}"/><circle cx="3" cy="9" r="${Math.max(0.6, (sw / 1.2) * 1.2)}" fill="${color}"/><circle cx="9" cy="9" r="${Math.max(0.6, (sw / 1.2) * 1.2)}" fill="${color}"/><circle cx="6" cy="6" r="${Math.max(0.6, (sw / 1.2) * 1.0)}" fill="${color}"/>`,
    },
    {
        id: 'sunburst',
        name: 'Sunburst (Pancaran Sinar)',
        shortName: 'Sinar',
        defaultWidth: 20,
        defaultHeight: 20,
        svgContent: (color, sw = 1.2) =>
            `<path d="M10 0 V20 M0 10 H20 M3 3 L17 17 M17 3 L3 17" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`,
    },
    {
        id: 'cross_dots',
        name: 'Cross & Dots (Bintik Salib)',
        shortName: 'Bintik',
        defaultWidth: 16,
        defaultHeight: 16,
        svgContent: (color, sw = 1.2) =>
            `<path d="M8 2 V14 M2 8 H14" fill="none" stroke="${color}" stroke-width="${sw}"/><circle cx="3" cy="3" r="${Math.max(0.6, (sw / 1.2) * 1.2)}" fill="${color}"/><circle cx="13" cy="3" r="${Math.max(0.6, (sw / 1.2) * 1.2)}" fill="${color}"/><circle cx="3" cy="13" r="${Math.max(0.6, (sw / 1.2) * 1.2)}" fill="${color}"/><circle cx="13" cy="13" r="${Math.max(0.6, (sw / 1.2) * 1.2)}" fill="${color}"/>`,
    },
    {
        id: 'zigzag_dense',
        name: 'Herringbone (Tulang Ikan)',
        shortName: 'Tulang',
        defaultWidth: 16,
        defaultHeight: 16,
        svgContent: (color, sw = 1.2) =>
            `<path d="M0 0 L8 8 L16 0 M0 8 L8 16 L16 8 M0 16 L8 24 L16 16" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`,
    },
];

/**
 * Detect if customPatternUrl is an image file / URL or CSS code
 */
export function isCustomPatternImage(url?: string): boolean {
    if (!url) return false;
    const trimmed = url.trim();
    return (
        trimmed.startsWith('data:image/') ||
        trimmed.startsWith('blob:') ||
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('/') ||
        /\.(png|jpe?g|svg|webp|gif)$/i.test(trimmed)
    );
}

/**
 * Helper to convert Hex/RGB color to RGB tuple [r, g, b]
 */
function parseColorToRgb(colorStr: string): [number, number, number] | null {
    if (!colorStr) return null;
    const trimmed = colorStr.trim();
    if (trimmed.startsWith('#')) {
        let hex = trimmed.substring(1);
        if (hex.length === 3) {
            hex = hex.split('').map((c) => c + c).join('');
        }
        if (hex.length === 6) {
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return [r, g, b];
        }
    }
    if (trimmed.startsWith('rgb(') || trimmed.startsWith('rgba(')) {
        const parts = trimmed.match(/\d+/g);
        if (parts && parts.length >= 3) {
            return [parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2], 10)];
        }
    }
    return null;
}

/**
 * Transforms a raw CSS pattern string according to active motif color, scale, and stroke width.
 */
export function transformCssPatternString(
    cssInput: string,
    scale: number = 1.0,
    color?: string,
    strokeWidth: number = 1.2
): string {
    if (!cssInput) return '';
    let transformed = cssInput;

    // 1. Color Replacement (replace default white/black/rgba in pattern CSS with user's selected motifColor)
    if (color && color !== 'transparent') {
        const rgb = parseColorToRgb(color);
        if (rgb) {
            const [r, g, b] = rgb;
            transformed = transformed.replace(
                /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/gi,
                (_, alpha) => `rgba(${r}, ${g}, ${b}, ${alpha})`
            );
            transformed = transformed.replace(
                /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi,
                `rgb(${r}, ${g}, ${b})`
            );
            transformed = transformed.replace(/#ffffff|#fff|#000000|#000/gi, color);
        }
    }

    // 2. Stroke Width Scaling
    const swRatio = strokeWidth / 1.2;
    if (Math.abs(swRatio - 1.0) > 0.05) {
        transformed = transformed.replace(/stroke-width%3D%22([\d.]+)%22/gi, (_, sw) => {
            const newSw = (parseFloat(sw) * swRatio).toFixed(1);
            return `stroke-width%3D%22${newSw}%22`;
        });
        transformed = transformed.replace(/stroke-width="([\d.]+)"/gi, (_, sw) => {
            const newSw = (parseFloat(sw) * swRatio).toFixed(1);
            return `stroke-width="${newSw}"`;
        });
        if (swRatio !== 1.0) {
            transformed = transformed.replace(/(\b[0-2]\.?\d*px)\s*(,|;|\)|transparent)/gi, (match, valStr, suffix) => {
                const pxVal = parseFloat(valStr);
                if (pxVal > 0 && pxVal <= 2.5) {
                    const newPx = Math.max(0.4, Number((pxVal * swRatio).toFixed(1)));
                    return `${newPx}px${suffix}`;
                }
                return match;
            });
        }
    }

    // 3. Density / Pattern Scale Adjustment inside background-size or repeating stop distances
    if (scale !== 1.0) {
        transformed = transformed.replace(/background-size:\s*([\d.]+)px\s+([\d.]+)px/gi, (_, w, h) => {
            const newW = Math.max(2, Math.round(parseFloat(w) * scale));
            const newH = Math.max(2, Math.round(parseFloat(h) * scale));
            return `background-size: ${newW}px ${newH}px`;
        });

        if (transformed.includes('repeating-linear-gradient') || transformed.includes('repeating-radial-gradient')) {
            transformed = transformed.replace(/(\d+(?:\.\d+)?)px/gi, (match, pxNumStr) => {
                const pxVal = parseFloat(pxNumStr);
                if (pxVal >= 2) {
                    const scaledVal = Math.max(1, Number((pxVal * scale).toFixed(1)));
                    return `${scaledVal}px`;
                }
                return match;
            });
        }
    }

    return transformed;
}

/**
 * Parses user input CSS (e.g. gradients, full background declarations, multiple backgrounds, etc.)
 * into a valid React CSSProperties object suitable for inline styling.
 */
export function parseCssPatternToStyle(
    cssInput?: string,
    scale: number = 1.0,
    color?: string,
    strokeWidth: number = 1.2
): React.CSSProperties {
    if (!cssInput) return {};
    const transformedCss = transformCssPatternString(cssInput, scale, color, strokeWidth);
    let clean = transformedCss.trim();

    // 1. If wrapped in CSS selector block e.g. `.class { ... }`, extract inside braces
    if (clean.includes('{') && clean.includes('}')) {
        clean = clean.substring(clean.indexOf('{') + 1, clean.lastIndexOf('}')).trim();
    }

    const style: React.CSSProperties = {};
    let hasExplicitSize = false;

    // 2. Split by semicolon not enclosed in parentheses
    const declarations = clean.split(/;(?![^(]*\))/);

    for (const decl of declarations) {
        const item = decl.trim();
        if (!item) continue;

        const colonIdx = item.indexOf(':');
        // Check if item has a CSS property name before the colon
        if (
            colonIdx !== -1 &&
            !item.startsWith('url(') &&
            !item.startsWith('radial-gradient(') &&
            !item.startsWith('linear-gradient(') &&
            !item.startsWith('repeating-linear-gradient(') &&
            !item.startsWith('repeating-radial-gradient(') &&
            !item.startsWith('conic-gradient(')
        ) {
            const prop = item.substring(0, colonIdx).trim().toLowerCase();
            const val = item.substring(colonIdx + 1).trim();

            if (prop === 'background') {
                style.background = val;
            } else if (prop === 'background-image') {
                style.backgroundImage = val;
            } else if (prop === 'background-size') {
                style.backgroundSize = val;
                hasExplicitSize = true;
            } else if (prop === 'background-position') {
                style.backgroundPosition = val;
            } else if (prop === 'background-repeat') {
                style.backgroundRepeat = val as any;
            } else if (prop === 'background-color') {
                style.backgroundColor = val;
            }
        } else {
            // Raw value without property name (e.g. `repeating-linear-gradient(...)`)
            const val = item.replace(/;+$/, '').trim();
            if (val.includes('gradient') || val.startsWith('url(')) {
                style.backgroundImage = val;
            } else {
                style.background = val;
            }
        }
    }

    // 3. Ensure repeat is set if not already defined
    if (!style.backgroundRepeat) {
        style.backgroundRepeat = 'repeat';
    }

    // 4. If no explicit size was given and it contains radial-gradient or standard linear-gradient,
    // provide a repeating tile size scaled by patternScale so it doesn't span the entire container as a single giant element
    if (!hasExplicitSize && !style.backgroundSize) {
        const baseSize = Math.max(6, Math.round(16 * scale));
        if (
            clean.includes('radial-gradient') ||
            (clean.includes('linear-gradient') && !clean.includes('repeating-linear-gradient'))
        ) {
            style.backgroundSize = `${baseSize}px ${baseSize}px`;
        }
    }

    return style;
}
