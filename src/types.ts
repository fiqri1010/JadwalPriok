export const SHIFT_OPTIONS = ['Graha', 'NPCT', 'TPSL', 'OFF', 'SM', 'PM', 'Malam', 'CUTI'] as const;
export type ShiftType = typeof SHIFT_OPTIONS[number] | '';
export type AppTheme = 'default' | 'dark' | 'vista' | 'winamp' | 'paperSketch' | 'technical' | 'editorial' | 'industrial' | 'dashboard';

// --- Visual Studio & Shift Configuration Models ---
export type VisualColorMode = 'solid' | 'linear' | 'radial' | 'customCss';
export type PresetPatternType =
    | 'none'
    | 'topography'
    | 'circuit'
    | 'plus'
    | 'dots'
    | 'zigzag'
    | 'wavy'
    | 'stripes'
    | 'honeycomb'
    | 'grid'
    | 'waves'
    | 'carbon'
    | 'bubbles'
    | 'hexagons'
    | 'diagonal'
    | 'cross'
    | 'diamonds'
    | 'stars'
    | 'triangles'
    | 'chevron'
    | 'concentric'
    | 'isometric'
    | 'scales'
    | 'waves_ocean'
    | 'bricks'
    | 'houndstooth'
    | 'lines_vertical'
    | 'polka_dense'
    | 'sunburst'
    | 'cross_dots'
    | 'zigzag_dense'
    | string;

export interface GradientColorStop {
    color: string;
    position: number; // 0 - 100%
}

export interface ShiftVisualStyle {
    colorMode: VisualColorMode;
    solidColor: string;
    textColor: string;
    borderColor: string;
    patternColor?: string;
    gradientType: 'linear' | 'radial';
    gradientAngle: number; // 0 - 360 deg
    colorStops: GradientColorStop[]; // 2 to 4 stops
    patternType: PresetPatternType;
    patternOpacity: number; // 10 - 100% or 0.05 - 1.0
    patternScale?: number; // 0.5 - 3.0 (scale/density factor)
    patternStrokeWidth?: number; // 0.5 - 4.0 (Ketebalan motif stroke)
    customPatternUrl?: string;
    iconType: 'svg' | 'customImage' | 'emoji' | 'none';
    iconName?: string;
    customIconUrl?: string;
    emoji?: string;
    customCss?: string;
}

export interface ShiftWorkTimeConfig {
    jamMasukDasar: string; // HH:mm
    jamPulangDasar: string; // HH:mm
    earliestFlexiIn: string; // HH:mm
    latestFlexiIn: string; // HH:mm
    earliestFlexiOut: string; // HH:mm
    latestFlexiOut: string; // HH:mm
    minLemburMinutes: number; // e.g. 120
    maxLemburMinutes: number; // e.g. 180
    isOvernight?: boolean;
    isSplitShift?: boolean;
    splitSession1?: { masuk: string; pulang: string };
    splitSession2?: { masuk: string; pulang: string };
}

export interface ShiftNamingConfig {
    fullName: string; // e.g. "Terminal Peti Kemas Surabaya Lapangan"
    displayBadge: string; // 2 - 5 characters, e.g. "TPSL"
    copyCode: string; // 1 - 3 characters, e.g. "L"
    dropdownSublabel: string; // e.g. "FCL/LCL 07.30 - 17.00"
}

export interface ShiftItemConfig {
    id: string; // Permanent Unique ID e.g. "SHIFT_GRAHA_001"
    key: ShiftType | string;
    naming: ShiftNamingConfig;
    workTime: ShiftWorkTimeConfig;
    visual: ShiftVisualStyle;
    isPiket: boolean;
    piketHariKerja?: boolean;           // Piket pada hari kerja biasa (Senin - Jumat)
    piketHariLibur?: boolean;           // Piket pada hari libur / tanggal merah / akhir pekan
    piketHariKerjaDenganOff?: boolean;  // Piket hari kerja yang berhak mendapatkan jatah OFF pengganti
    isVisibleInDropdown: boolean;
    isSystemDefault?: boolean;
}

export interface ActiveDateRange {
    id: string;
    startDate: string; // YYYY-MM-DD
    endDate?: string | null; // YYYY-MM-DD or null/empty for infinity (batas tak hingga)
}

export interface ShiftGroupProfile {
    id: string;
    name: string; // e.g. "Aturan Standar 2026"
    effectiveStartDate: string; // YYYY-MM-DD
    dateRanges?: ActiveDateRange[]; // One or more active date ranges
    isActive: boolean;
    shifts: ShiftItemConfig[];
}

export const SHIFT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    Graha: { bg: 'bg-[#EDF6F9]', text: 'text-[#011627]', border: 'border-[#83C5BE]' },
    NPCT: { bg: 'bg-[#FFDDD2]', text: 'text-[#011627]', border: 'border-[#E29578]' },
    TPSL: { bg: 'bg-[#E29578]', text: 'text-white', border: 'border-[#C8775B]' },
    OFF: { bg: 'bg-[#BE1A1A]', text: 'text-white', border: 'border-[#BE1A1A]' },
    SM: { bg: 'bg-[#83C5BE]', text: 'text-[#0B0909]', border: 'border-[#006D77]' },
    S2: { bg: 'bg-[#83C5BE]', text: 'text-[#0B0909]', border: 'border-[#006D77]' },
    PM: { bg: 'bg-[#006D77]', text: 'text-white', border: 'border-[#004D54]' },
    Malam: { bg: 'bg-[#2C4251]', text: 'text-white', border: 'border-[#1B2A35]' },
    M: { bg: 'bg-[#2C4251]', text: 'text-white', border: 'border-[#1B2A35]' },
    CUTI: { bg: 'bg-[#0B0909]', text: 'text-white', border: 'border-[#0B0909]' },
    '': { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-300' },
    // Aliases
    G: { bg: 'bg-[#EDF6F9]', text: 'text-[#011627]', border: 'border-[#83C5BE]' },
    L: { bg: 'bg-[#E29578]', text: 'text-white', border: 'border-[#C8775B]' },
    N: { bg: 'bg-[#FFDDD2]', text: 'text-[#011627]', border: 'border-[#E29578]' },
    NPCS: { bg: 'bg-[#FFDDD2]', text: 'text-[#011627]', border: 'border-[#E29578]' },
    C: { bg: 'bg-[#0B0909]', text: 'text-white', border: 'border-[#0B0909]' },
    CT: { bg: 'bg-[#0B0909]', text: 'text-white', border: 'border-[#0B0909]' },
};

export const EXCEL_SHIFT_MAPPING: Record<string, ShiftType> = {
    G: 'Graha',
    GRAHA: 'Graha',
    L: 'TPSL',
    TPSL: 'TPSL',
    N: 'NPCT',
    NPCT: 'NPCT',
    NPCS: 'NPCT',
    O: 'OFF',
    OFF: 'OFF',
    SM: 'SM',
    S2: 'SM',
    P: 'PM',
    PM: 'PM',
    M: 'Malam',
    MALAM: 'Malam',
    C: 'CUTI',
    CT: 'CUTI',
    CUTI: 'CUTI',
    '-': '',
    '': '',
};

export const MOBILE_SHIFT_LABELS: Record<string, string> = {
    Graha: 'G',
    G: 'G',
    TPSL: 'L',
    L: 'L',
    NPCT: 'N',
    NPCS: 'N',
    N: 'N',
    OFF: 'O',
    O: 'O',
    SM: 'SM',
    S2: 'SM',
    PM: 'PM',
    Malam: 'M',
    M: 'M',
    CUTI: 'C',
    C: 'C',
    CT: 'C',
    '': '-',
};

export function getMobileShiftLabel(shift: string | undefined | null): string {
    if (!shift) return '-';
    return MOBILE_SHIFT_LABELS[shift] || shift;
}

export function normalizeShift(val: string | undefined | null): ShiftType {
    if (val === '' || val === null || val === undefined) return '';
    const clean = val.trim().toUpperCase();
    if (clean === '' || clean === '-') return '';
    if (clean === 'O' || clean === 'OFF') return 'OFF';
    if (EXCEL_SHIFT_MAPPING[clean] !== undefined) {
        return EXCEL_SHIFT_MAPPING[clean];
    }
    const found = SHIFT_OPTIONS.find((s) => s.toUpperCase() === clean);
    if (found) return found;
    return '';
}

/**
 * Deteksi Piket:
 * 1. Shift pada hari libur/tanggal merah/sabtu/minggu bukan OFF & CUTI (atau sesuai piketHariLibur)
 * 2. Shift pada hari kerja adalah M (Malam), PM, SM (atau sesuai piketHariKerja)
 */
export function isPiketShift(
    shift: string | undefined | null,
    isWeekendOrHoliday: boolean,
    shiftConfigs?: ShiftItemConfig[]
): boolean {
    const normalized = normalizeShift(shift);
    if (!normalized || normalized === 'OFF' || normalized === 'CUTI') {
        return false;
    }
    if (shiftConfigs && shiftConfigs.length > 0) {
        const found = shiftConfigs.find(
            (s) =>
                s.key.toUpperCase() === normalized.toUpperCase() ||
                s.naming.displayBadge.toUpperCase() === normalized.toUpperCase() ||
                s.naming.copyCode.toUpperCase() === normalized.toUpperCase()
        );
        if (found) {
            if (isWeekendOrHoliday) {
                return found.piketHariLibur ?? true;
            }
            return found.piketHariKerja ?? (normalized === 'SM' || normalized === 'PM' || normalized === 'Malam');
        }
    }
    if (isWeekendOrHoliday) {
        return true;
    }
    return normalized === 'SM' || normalized === 'PM' || normalized === 'Malam';
}

export type HolidayCategory = 'libur_nasional' | 'cuti_bersama' | 'lainnya';

export interface LiburNasional {
    tanggal: string; // YYYY-MM-DD
    keterangan: string;
    kategori?: HolidayCategory | string;
    isCutiBersama?: boolean;
    isDisabled?: boolean;
}

export function resolveHolidayCategory(item: { keterangan?: string; kategori?: string; isCutiBersama?: boolean }): {
    category: HolidayCategory;
    label: string;
    shortLabel: string;
    isCustom: boolean;
} {
    const rawKategori = (item.kategori || '').trim();
    const lowerKat = rawKategori.toLowerCase();
    const lowerKet = (item.keterangan || '').toLowerCase();

    if (lowerKat === 'cuti_bersama' || lowerKat === 'cuti bersama' || lowerKat === 'cuti') {
        return { category: 'cuti_bersama', label: 'Cuti Bersama', shortLabel: 'CB', isCustom: false };
    }
    if (lowerKat === 'libur_nasional' || lowerKat === 'libur nasional' || lowerKat === 'nasional') {
        return { category: 'libur_nasional', label: 'Libur Nasional', shortLabel: 'LN', isCustom: false };
    }
    if (rawKategori && rawKategori !== 'lainnya') {
        return { category: 'lainnya', label: rawKategori, shortLabel: 'L', isCustom: true };
    }
    if (lowerKat === 'lainnya') {
        return { category: 'lainnya', label: 'Lainnya', shortLabel: 'L', isCustom: true };
    }

    // Fallback if kategori is not explicitly set
    if (item.isCutiBersama || lowerKet.includes('cuti')) {
        return { category: 'cuti_bersama', label: 'Cuti Bersama', shortLabel: 'CB', isCustom: false };
    }
    return { category: 'libur_nasional', label: 'Libur Nasional', shortLabel: 'LN', isCustom: false };
}

export interface DayData {
    shift: ShiftType;
    isLocked: boolean;
    note: string;
    isMasuk: boolean;
    jamMasuk: string; // HH:mm
    jamPulang: string; // HH:mm
    absenCeisa: string; // HH:mm or 'YA' / time
    isManualHoliday?: boolean;
    updated_at?: string;
}

export function isDayDataFilled(data: DayData | null | undefined): boolean {
    if (!data) return false;
    if (typeof data.shift === 'string' && data.shift.trim() !== '' && data.shift.trim() !== '-') return true;
    if (data.isMasuk === true) return true;
    if (typeof data.jamMasuk === 'string' && data.jamMasuk.trim() !== '') return true;
    if (typeof data.jamPulang === 'string' && data.jamPulang.trim() !== '') return true;
    if (typeof data.absenCeisa === 'string' && data.absenCeisa.trim() !== '') return true;
    if (typeof data.note === 'string' && data.note.trim() !== '') return true;
    if (data.isManualHoliday === true) return true;
    return false;
}

export interface CalendarToolsProps {
    canUndo: boolean;
    canRedo: boolean;
    canReset: boolean;
    historyCount?: number;
    redoCount?: number;
    onUndo: () => void;
    onRedo: () => void;
    onResetCalendar: () => void;
}

