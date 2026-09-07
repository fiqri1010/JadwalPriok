export const SHIFT_OPTIONS = ['Graha', 'NPCT', 'TPSL', 'OFF', 'SM', 'PM', 'Malam', 'CUTI'] as const;
export type ShiftType = typeof SHIFT_OPTIONS[number] | '';
export type AppTheme = 'default' | 'dark' | 'vista' | 'winamp';

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
    // Backward compatibility alias for legacy data
    G: { bg: 'bg-[#EDF6F9]', text: 'text-[#011627]', border: 'border-[#83C5BE]' },
    L: { bg: 'bg-[#E29578]', text: 'text-white', border: 'border-[#C8775B]' },
    N: { bg: 'bg-[#FFDDD2]', text: 'text-[#011627]', border: 'border-[#E29578]' },
    NPCS: { bg: 'bg-[#FFDDD2]', text: 'text-[#011627]', border: 'border-[#E29578]' },
    C: { bg: 'bg-[#0B0909]', text: 'text-white', border: 'border-[#0B0909]' },
    CT: { bg: 'bg-[#0B0909]', text: 'text-white', border: 'border-[#0B0909]' },
};

/**
 * Pemetaan kode singkatan Excel (G, L, N, OFF, SM, PM, M, CUTI/C) ke nama lengkap Shift
 */
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
    S2: 'SM', // Map legacy S2 to SM
    PM: 'PM',
    M: 'Malam',
    MALAM: 'Malam',
    C: 'CUTI',
    CT: 'CUTI',
    CUTI: 'CUTI',
    '-': '',
    '': '',
};

/**
 * Singkatan Shift untuk tampilan di perangkat Mobile (Otomatis)
 * SM = SM, TPSL = L, Graha = G, OFF = O, NPCS/NPCT = N, PM = PM, Malam = M, CUTI = C
 */
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
    return 'Graha';
}

export interface LiburNasional {
    tanggal: string; // YYYY-MM-DD
    keterangan: string;
}

export interface DayData {
    shift: ShiftType;
    isLocked: boolean;
    note: string;
    isMasuk: boolean;
    tipeMasukLibur?: 'piket' | 'lembur'; // Opsi eksplisit saat masuk di hari libur: Piket atau Lembur
    isHoldDokumen: boolean;
    jamMasuk: string; // HH:mm
    jamPulang: string; // HH:mm
    absenCeisa: string; // HH:mm
    isSuratTugasTambahan: boolean; // ST di Tanggal Merah -> Cuti Pengganti
    isManualHoliday: boolean; // Tanggal merah di hari kerja
    isGunakanOffGeser?: boolean; // Mengambil OFF di hari kerja biasa saat isMasuk === false
    referensiTglOff?: string; // Kotak referensi tanggal ganti OFF (e.g. "Ganti tgl 12")
    isGunakanCP?: boolean; // Mengambil Cuti Pengganti di hari kerja saat isMasuk === false
    referensiTglCP?: string; // Kotak referensi tanggal Cuti Pengganti (e.g. "ST Tgl 15")
}

export interface DayCalculationResult {
    isLembur: boolean;
    jamLembur: number;
    durasiKerja: number;
    isPiket: boolean;
    isDapatGeserOff: boolean;
    isOffDiambil: boolean;
    isCutiPengganti: boolean;
    isCPDiambil: boolean;
    keteranganStatus: string;
}

export interface CeisaScoreResult {
    score: number; // 1, 2, 3, 4, or 0 (unrated)
    grade: 'Sangat Patuh' | 'Patuh' | 'Kurang Patuh' | 'Tidak Patuh' | 'N/A';
    ruleDescription: string;
    isEligible: boolean; // whether this entry counts towards score/scale calculations
    colorClass: 'emerald' | 'blue' | 'amber' | 'rose' | 'slate';
}

export interface PeriodPerformanceSummary {
    periodLabel: string;
    periodType: 'month' | 'quarter' | 'semester' | 'year';
    totalDaysEvaluated: number;
    totalScore: number;
    averageScore: number;
    countScore4: number; // Sangat Patuh (4)
    countScore3: number; // Patuh (3)
    countScore2: number; // Kurang Patuh (2)
    countScore1: number; // Tidak Patuh (1)
    predikat: string;
}

export interface CustomShiftType {
    id: string;
    name: string;
    shortCode: string;
    bgColor: string;
    textColor: string;
    orderIndex: number;
    isActive: boolean;
}

export type CalculationMode = 'AVERAGE' | 'SUM';
export type ValueType = 'SKALA' | 'PERSENTASE';

export interface CeisaThreshold {
    max_time: string;
    score: number;
    name: string;
}

export interface CeisaShiftRule {
    multiplier: number;
    thresholds: CeisaThreshold[];
    is_exempt?: boolean;
    is_auto_max?: boolean;
}

export interface CeisaRuleDetail {
    shifts: Record<string, CeisaShiftRule>;
}

export interface CeisaRule {
    id: string;
    nama_rule: string;
    tanggal_berlaku_efektif: string;
    metode_kalkulasi: CalculationMode;
    tipe_nilai: ValueType;
    rule_detail: CeisaRuleDetail;
}

export const APP_VERSION = '1.2.4';
export const APP_VERSION_DISPLAY = 'v1.2.4';


