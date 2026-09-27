import { PresetPatternType } from '../../types';

export interface BadgePatternItem {
    id: PresetPatternType;
    name: string;
    defaultWidth: number;
    defaultHeight: number;
    svgContent: (color: string) => string;
}

export const BADGE_PATTERNS: BadgePatternItem[] = [
    {
        id: 'none',
        name: 'Polos (Tanpa Motif)',
        defaultWidth: 10,
        defaultHeight: 10,
        svgContent: () => '',
    },
    {
        id: 'topography',
        name: 'Topography (Kontur Peta)',
        defaultWidth: 32,
        defaultHeight: 32,
        svgContent: (color) =>
            `<path d="M0 10 Q 8 2, 16 10 T 32 10 M0 22 Q 8 14, 16 22 T 32 22 M0 30 Q 16 20, 32 30" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round"/>`,
    },
    {
        id: 'circuit',
        name: 'Circuit Board (Jalur Sirkuit)',
        defaultWidth: 24,
        defaultHeight: 24,
        svgContent: (color) =>
            `<path d="M0 12 H8 L12 4 H24 M12 20 H4 M16 12 V24" fill="none" stroke="${color}" stroke-width="1.2"/><circle cx="8" cy="12" r="1.5" fill="${color}"/><circle cx="12" cy="4" r="1.5" fill="${color}"/><circle cx="16" cy="12" r="1.5" fill="${color}"/>`,
    },
    {
        id: 'plus',
        name: 'Plus (Simbol Plus)',
        defaultWidth: 16,
        defaultHeight: 16,
        svgContent: (color) =>
            `<path d="M8 4 V12 M4 8 H12" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>`,
    },
    {
        id: 'dots',
        name: 'Polka Dots (Titik Halus)',
        defaultWidth: 10,
        defaultHeight: 10,
        svgContent: (color) => `<circle cx="5" cy="5" r="1.8" fill="${color}"/>`,
    },
    {
        id: 'zigzag',
        name: 'ZigZag (Garis Siku)',
        defaultWidth: 16,
        defaultHeight: 10,
        svgContent: (color) =>
            `<path d="M0 8 L4 2 L8 8 L12 2 L16 8" fill="none" stroke="${color}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    {
        id: 'wavy',
        name: 'Wavy Lines (Gelombang Halus)',
        defaultWidth: 20,
        defaultHeight: 10,
        svgContent: (color) =>
            `<path d="M0 5 Q 5 0, 10 5 T 20 5" fill="none" stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>`,
    },
    {
        id: 'stripes',
        name: 'Diagonal Stripes (Garis Miring)',
        defaultWidth: 12,
        defaultHeight: 12,
        svgContent: (color) =>
            `<path d="M0 12 L12 0 M-3 3 L3 -3 M9 15 L15 9" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="square"/>`,
    },
    {
        id: 'honeycomb',
        name: 'Honeycomb (Sarang Lebah)',
        defaultWidth: 16,
        defaultHeight: 28,
        svgContent: (color) =>
            `<path d="M8 0 L16 4.5 V13.5 L8 18 L0 13.5 V4.5 Z M8 28 L16 23.5 V14.5 M0 14.5 L8 28" fill="none" stroke="${color}" stroke-width="1.2"/>`,
    },
    {
        id: 'grid',
        name: 'Box Grid (Kisi-kisi Persegi)',
        defaultWidth: 12,
        defaultHeight: 12,
        svgContent: (color) =>
            `<path d="M 12 0 L 0 0 0 12" fill="none" stroke="${color}" stroke-width="1.2"/>`,
    },
    {
        id: 'carbon',
        name: 'Carbon Fiber (Serat Karbon)',
        defaultWidth: 10,
        defaultHeight: 10,
        svgContent: (color) =>
            `<rect x="0" y="0" width="5" height="5" fill="${color}" fill-opacity="0.85"/><rect x="5" y="5" width="5" height="5" fill="${color}" fill-opacity="0.85"/>`,
    },
    {
        id: 'bubbles',
        name: 'Bubbles (Gelembung Air)',
        defaultWidth: 20,
        defaultHeight: 20,
        svgContent: (color) =>
            `<circle cx="6" cy="6" r="3" fill="none" stroke="${color}" stroke-width="1.2"/><circle cx="15" cy="14" r="4.5" fill="none" stroke="${color}" stroke-width="1.2"/><circle cx="16" cy="4" r="1.5" fill="${color}"/>`,
    },
    {
        id: 'hexagons',
        name: 'Hexagon Mesh (Segienam Modern)',
        defaultWidth: 18,
        defaultHeight: 18,
        svgContent: (color) =>
            `<path d="M9 0 L18 5 V13 L9 18 L0 13 V5 Z" fill="none" stroke="${color}" stroke-width="1.2"/>`,
    },
    {
        id: 'diagonal',
        name: 'Diagonal Weave (Anyaman Cross)',
        defaultWidth: 14,
        defaultHeight: 14,
        svgContent: (color) =>
            `<path d="M0 0 L14 14 M14 0 L0 14" fill="none" stroke="${color}" stroke-width="1"/>`,
    },
    {
        id: 'cross',
        name: 'Crosshatch (Arsiran Silang)',
        defaultWidth: 10,
        defaultHeight: 10,
        svgContent: (color) =>
            `<path d="M0 5 H10 M5 0 V10" fill="none" stroke="${color}" stroke-width="1"/>`,
    },
    {
        id: 'diamonds',
        name: 'Diamond Lattice (Belah Ketupat)',
        defaultWidth: 16,
        defaultHeight: 16,
        svgContent: (color) =>
            `<path d="M8 0 L16 8 L8 16 L0 8 Z" fill="none" stroke="${color}" stroke-width="1.2"/>`,
    },
    {
        id: 'stars',
        name: 'Tiny Stars (Bintang Mini)',
        defaultWidth: 18,
        defaultHeight: 18,
        svgContent: (color) =>
            `<path d="M9 2 L11 7 L16 7 L12 10 L14 15 L9 12 L4 15 L6 10 L2 7 L7 7 Z" fill="${color}"/>`,
    },
    {
        id: 'triangles',
        name: 'Triangle Mesh (Segitiga)',
        defaultWidth: 16,
        defaultHeight: 16,
        svgContent: (color) =>
            `<path d="M8 0 L16 16 H0 Z M0 0 L16 16" fill="none" stroke="${color}" stroke-width="1"/>`,
    },
    {
        id: 'chevron',
        name: 'Chevron V-Pattern (Sisik V)',
        defaultWidth: 16,
        defaultHeight: 12,
        svgContent: (color) =>
            `<path d="M0 2 L8 8 L16 2 M0 6 L8 12 L16 6" fill="none" stroke="${color}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    {
        id: 'concentric',
        name: 'Concentric Circles (Konsentris)',
        defaultWidth: 20,
        defaultHeight: 20,
        svgContent: (color) =>
            `<circle cx="10" cy="10" r="3" fill="none" stroke="${color}" stroke-width="1"/><circle cx="10" cy="10" r="7" fill="none" stroke="${color}" stroke-width="1"/><circle cx="10" cy="10" r="10" fill="none" stroke="${color}" stroke-width="1"/>`,
    },
];
