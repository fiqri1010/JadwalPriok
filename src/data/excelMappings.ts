import { ShiftType } from '../types';

/**
 * Built-in System Mapping Database for Excel Shift Colors & Codes.
 * Tersimpan langsung di dalam sistem aplikasi (Codebase / System Built-in)
 * sehingga tidak bergantung pada cache/localStorage browser.
 */
export const SYSTEM_DEFAULT_EXCEL_MAP: Record<string, ShiftType> = {
  // === 1. KODE TEKS RESMI & ALIAS (TEXT_) ===
  'TEXT_G': 'Graha',
  'TEXT_GRAHA': 'Graha',
  'TEXT_L': 'TPSL',
  'TEXT_TPSL': 'TPSL',
  'TEXT_N': 'NPCT',
  'TEXT_NPCT': 'NPCT',
  'TEXT_NPCS': 'NPCT',
  'TEXT_O': 'OFF',
  'TEXT_OFF': 'OFF',
  'TEXT_SM': 'SM',
  'TEXT_S2': 'SM',
  'TEXT_S1': 'SM',
  'TEXT_P': 'PM',
  'TEXT_PM': 'PM',
  'TEXT_M': 'Malam',
  'TEXT_MLM': 'Malam',
  'TEXT_MALAM': 'Malam',
  'TEXT_C': 'CUTI',
  'TEXT_CT': 'CUTI',
  'TEXT_CUTI': 'CUTI',
  'TEXT_CTI': 'CUTI',

  // === 2. WARNA LATAR STANDAR (BACKGROUND COLORS HEX) ===
  // Graha (Teal / Mint / Cyan lembut)
  '#ccfbf1': 'Graha',
  '#edf6f9': 'Graha',
  '#99f6e4': 'Graha',
  '#5eead4': 'Graha',
  '#2dd4bf': 'Graha',
  '#14b8a6': 'Graha',
  '#0f766e': 'Graha',
  '#115e59': 'Graha',
  '#e6fffa': 'Graha',

  // NPCT (Peach / Light Orange / Lime Green lembut)
  '#dcfce7': 'NPCT',
  '#ffddd2': 'NPCT',
  '#bbf7d0': 'NPCT',
  '#86efac': 'NPCT',
  '#4ade80': 'NPCT',
  '#22c55e': 'NPCT',
  '#166534': 'NPCT',
  '#e29578': 'NPCT',
  '#f0fdf4': 'NPCT',

  // TPSL (Sky Blue / Cyan / Soft Blue)
  '#e0f2fe': 'TPSL',
  '#bae6fd': 'TPSL',
  '#7dd3fc': 'TPSL',
  '#38bdf8': 'TPSL',
  '#0284c7': 'TPSL',
  '#0369a1': 'TPSL',
  '#075985': 'TPSL',
  '#c8775b': 'TPSL',
  '#f0f9ff': 'TPSL',

  // OFF (Merah / Rose / Coral / Pink)
  '#fee2e2': 'OFF',
  '#fecaca': 'OFF',
  '#fca5a5': 'OFF',
  '#f87171': 'OFF',
  '#ef4444': 'OFF',
  '#dc2626': 'OFF',
  '#b91c1c': 'OFF',
  '#991b1b': 'OFF',
  '#be1a1a': 'OFF',
  '#ffe4e6': 'OFF',
  '#fda4af': 'OFF',
  '#e11d48': 'OFF',
  '#9f1239': 'OFF',
  '#881337': 'OFF',

  // SM (Kuning / Amber / Emas / Teal SM)
  '#fef3c7': 'SM',
  '#fde68a': 'SM',
  '#fcd34d': 'SM',
  '#fbbf24': 'SM',
  '#f59e0b': 'SM',
  '#d97706': 'SM',
  '#b45309': 'SM',
  '#92400e': 'SM',
  '#83c5be': 'SM',
  '#fffbeb': 'SM',

  // PM (Biru / Indigo / Navy / Teal Tua)
  '#e0e7ff': 'PM',
  '#c7d2fe': 'PM',
  '#a5b4fc': 'PM',
  '#818cf8': 'PM',
  '#6366f1': 'PM',
  '#4f46e5': 'PM',
  '#4338ca': 'PM',
  '#3730a3': 'PM',
  '#312e81': 'PM',
  '#006d77': 'PM',
  '#004d54': 'PM',
  '#1e3a8a': 'PM',
  '#1e40af': 'PM',
  '#2563eb': 'PM',

  // Malam (Slate / Abu-abu Gelap / Hitam / Dark Charcoal)
  '#f1f5f9': 'Malam',
  '#e2e8f0': 'Malam',
  '#cbd5e1': 'Malam',
  '#94a3b8': 'Malam',
  '#64748b': 'Malam',
  '#475569': 'Malam',
  '#334155': 'Malam',
  '#1e293b': 'Malam',
  '#0f172a': 'Malam',
  '#2c4251': 'Malam',
  '#1b2a35': 'Malam',

  // CUTI (Ungu / Lilac / Violet / Magenta / Hitam CUTI)
  '#f3e8ff': 'CUTI',
  '#e9d5ff': 'CUTI',
  '#d8b4fe': 'CUTI',
  '#c084fc': 'CUTI',
  '#a855f7': 'CUTI',
  '#9333ea': 'CUTI',
  '#7e22ce': 'CUTI',
  '#6b21a8': 'CUTI',
  '#581c87': 'CUTI',
  '#3b0764': 'CUTI',
  '#0b0909': 'CUTI',
  '#fae8ff': 'CUTI',

  // === 3. WARNA TEKS FONT (TEXT_COLOR_ HEX) ===
  'TEXT_COLOR_#115e59': 'Graha',
  'TEXT_COLOR_#0f766e': 'Graha',
  'TEXT_COLOR_#14b8a6': 'Graha',

  'TEXT_COLOR_#166534': 'NPCT',
  'TEXT_COLOR_#15803d': 'NPCT',
  'TEXT_COLOR_#22c55e': 'NPCT',

  'TEXT_COLOR_#075985': 'TPSL',
  'TEXT_COLOR_#0284c7': 'TPSL',
  'TEXT_COLOR_#0369a1': 'TPSL',

  'TEXT_COLOR_#991b1b': 'OFF',
  'TEXT_COLOR_#be1a1a': 'OFF',
  'TEXT_COLOR_#dc2626': 'OFF',
  'TEXT_COLOR_#ef4444': 'OFF',
  'TEXT_COLOR_#b91c1c': 'OFF',
  'TEXT_COLOR_#e11d48': 'OFF',

  'TEXT_COLOR_#92400e': 'SM',
  'TEXT_COLOR_#b45309': 'SM',
  'TEXT_COLOR_#d97706': 'SM',

  'TEXT_COLOR_#3730a3': 'PM',
  'TEXT_COLOR_#312e81': 'PM',
  'TEXT_COLOR_#4338ca': 'PM',
  'TEXT_COLOR_#1e3a8a': 'PM',
  'TEXT_COLOR_#006d77': 'PM',

  'TEXT_COLOR_#334155': 'Malam',
  'TEXT_COLOR_#1e293b': 'Malam',
  'TEXT_COLOR_#0f172a': 'Malam',
  'TEXT_COLOR_#2c4251': 'Malam',

  'TEXT_COLOR_#6b21a8': 'CUTI',
  'TEXT_COLOR_#7e22ce': 'CUTI',
  'TEXT_COLOR_#581c87': 'CUTI',
  'TEXT_COLOR_#0b0909': 'CUTI',
};
