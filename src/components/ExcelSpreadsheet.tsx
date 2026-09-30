import React, { useState, useEffect, useCallback, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
  Sparkles,
  RotateCcw,
  Calendar,
  Palette,
  CornerDownLeft,
  ClipboardPaste,
  Save,
  Check,
} from 'lucide-react';
import { SHIFT_OPTIONS, ShiftType, SHIFT_COLORS, EXCEL_SHIFT_MAPPING, AppTheme, DayData } from '../types';
import { SYSTEM_DEFAULT_EXCEL_MAP } from '../data/excelMappings';
import { CustomDatePicker } from './CustomDatePicker';

export const COLOR_TRANSPARENT_KEY = '__NO_COLOR__';
export const LOCAL_STORAGE_EXCEL_COLOR_MAP_KEY = 'jadwalpriok_excel_colormap_v1';

export interface ExcelSpreadsheetRef {
  pasteClipboard: () => void;
  loadSample: () => void;
  resetGrid: () => void;
  resetColorMap: () => void;
}

/**
 * Memuat pemetaan warna & kode Excel:
 * Selalu memuat kamus bawaan sistem (SYSTEM_DEFAULT_EXCEL_MAP) yang tertanam di aplikasi
 * dan menggabungkannya dengan penyesuaian pengguna.
 */
export function loadSavedExcelColorMap(): Record<string, ShiftType | ''> {
  const baseMap: Record<string, ShiftType | ''> = { ...SYSTEM_DEFAULT_EXCEL_MAP };
  if (typeof window === 'undefined') return baseMap;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_EXCEL_COLOR_MAP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...baseMap, ...parsed };
      }
    }
  } catch (err) {
    console.warn('Gagal membaca saved Excel color map:', err);
  }
  return baseMap;
}

export function saveExcelColorMap(map: Record<string, ShiftType | ''>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_EXCEL_COLOR_MAP_KEY, JSON.stringify(map));
  } catch (err) {
    console.warn('Gagal menyimpan Excel color map:', err);
  }
}

const GRID_ROWS = 5;
const GRID_COLS = 7;
const TOTAL_CELLS = 35;

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// Helper untuk normalisasi warna ke HEX 6-digit standar
export const normalizeColor = (colorStr?: string | null): string | null => {
  if (!colorStr) return null;
  const str = colorStr.trim().toLowerCase();
  if (
    str === '' ||
    str === 'transparent' ||
    str === 'rgba(0, 0, 0, 0)' ||
    str === 'rgba(0,0,0,0)' ||
    str === 'inherit' ||
    str === 'initial' ||
    str === 'unset' ||
    str === 'windowtext' ||
    str === 'auto' ||
    str === 'none' ||
    str === 'canvas' ||
    str === 'canvastext'
  ) {
    return null;
  }

  // Pure white or transparent white
  if (
    str === '#fff' ||
    str === '#ffffff' ||
    str === '#ffffffff' ||
    str === 'rgb(255, 255, 255)' ||
    str === 'rgb(255,255,255)' ||
    str === 'rgba(255, 255, 255, 1)' ||
    str === 'rgba(255,255,255,1)' ||
    str === 'white'
  ) {
    return '#ffffff';
  }

  // Pure black
  if (
    str === '#000' ||
    str === '#000000' ||
    str === '#ff000000' ||
    str === '#000000ff' ||
    str === 'rgb(0, 0, 0)' ||
    str === 'rgb(0,0,0)' ||
    str === 'rgba(0, 0, 0, 1)' ||
    str === 'rgba(0,0,0,1)' ||
    str === 'black'
  ) {
    return '#000000';
  }

  // Hex with leading #
  if (str.startsWith('#')) {
    const raw = str.slice(1);
    if (raw.length === 3) {
      return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`.toLowerCase();
    }
    if (raw.length === 6) {
      return `#${raw}`.toLowerCase();
    }
    if (raw.length === 8) {
      if (raw.startsWith('ff')) {
        return `#${raw.slice(2)}`.toLowerCase();
      }
      if (raw.endsWith('ff')) {
        return `#${raw.slice(0, 6)}`.toLowerCase();
      }
      return `#${raw.slice(2)}`.toLowerCase();
    }
  }

  // Hex WITHOUT leading # (e.g. font color="FF0000" or color="0070C0" or "115E59")
  if (/^[0-9a-f]{6}$/i.test(str)) {
    return `#${str}`.toLowerCase();
  }
  if (/^[0-9a-f]{3}$/i.test(str)) {
    return `#${str[0]}${str[0]}${str[1]}${str[1]}${str[2]}${str[2]}`.toLowerCase();
  }
  if (/^[0-9a-f]{8}$/i.test(str)) {
    if (str.startsWith('ff')) {
      return `#${str.slice(2)}`.toLowerCase();
    }
    return `#${str.slice(0, 6)}`.toLowerCase();
  }

  // RGB / RGBA format
  const rgbMatch = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    const r = Math.min(255, parseInt(rgbMatch[1], 10)).toString(16).padStart(2, '0');
    const g = Math.min(255, parseInt(rgbMatch[2], 10)).toString(16).padStart(2, '0');
    const b = Math.min(255, parseInt(rgbMatch[3], 10)).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toLowerCase();
  }

  // Named HTML colors dictionary
  const namedColors: Record<string, string> = {
    aliceblue: '#f0f8ff', antiquewhite: '#faebd7', aqua: '#00ffff', aquamarine: '#7fffd4',
    azure: '#f0ffff', beige: '#f5f5dc', bisque: '#ffe4c4', black: '#000000',
    blanchedalmond: '#ffebcd', blue: '#0000ff', blueviolet: '#8a2be2', brown: '#a52a2a',
    burlywood: '#deb887', cadetblue: '#5f9ea0', chartreuse: '#7fff00', chocolate: '#d2691e',
    coral: '#ff7f50', cornflowerblue: '#6495ed', cornsilk: '#fff8dc', crimson: '#dc143c',
    cyan: '#00ffff', darkblue: '#00008b', darkcyan: '#008b8b', darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9', darkgreen: '#006400', darkgrey: '#a9a9a9', darkkhaki: '#bdb76b',
    darkmagenta: '#8b008b', darkolivegreen: '#556b2f', darkorange: '#ff8c00', darkorchid: '#9932cc',
    darkred: '#8b0000', darksalmon: '#e9967a', darkseagreen: '#8fbc8f', darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f', darkslategrey: '#2f4f4f', darkturquoise: '#00ced1', darkviolet: '#9400d3',
    deeppink: '#ff1493', deepskyblue: '#00bfff', dimgray: '#696969', dimgrey: '#696969',
    dodgerblue: '#1e90ff', firebrick: '#b22222', floralwhite: '#fffaf0', forestgreen: '#228b22',
    fuchsia: '#ff00ff', gainsboro: '#dcdcdc', ghostwhite: '#f8f8ff', gold: '#ffd700',
    goldenrod: '#daa520', gray: '#808080', green: '#008000', greenyellow: '#adff2f',
    grey: '#808080', honeydew: '#f0fff0', hotpink: '#ff69b4', indianred: '#cd5c5c',
    indigo: '#4b0082', ivory: '#fffff0', khaki: '#f0e68c', lavender: '#e6e6fa',
    lavenderblush: '#fff0f5', lawngreen: '#7cfc00', lemonchiffon: '#fffacd', lightblue: '#add8e6',
    lightcoral: '#f08080', lightcyan: '#e0ffff', lightgoldenrodyellow: '#fafad2', lightgray: '#d3d3d3',
    lightgreen: '#90ee90', lightgrey: '#d3d3d3', lightpink: '#ffb6c1', lightsalmon: '#ffa07a',
    lightseagreen: '#20b2aa', lightskyblue: '#87cefa', lightslategray: '#778899', lightslategrey: '#778899',
    lightsteelblue: '#b0c4de', lightyellow: '#ffffe0', lime: '#00ff00', limegreen: '#32cd32',
    linen: '#faf0e6', magenta: '#ff00ff', maroon: '#800000', mediumaquamarine: '#66cdaa',
    mediumblue: '#0000cd', mediumorchid: '#ba55d3', mediumpurple: '#9370db', mediumseagreen: '#3cb371',
    mediumslateblue: '#7b68ee', mediumspringgreen: '#00fa9a', mediumturquoise: '#48d1cc',
    mediumvioletred: '#c71585', midnightblue: '#191970', mintcream: '#f5fffa', mistyrose: '#ffe4e1',
    moccasin: '#ffe4b5', navajowhite: '#ffdead', navy: '#000080', oldlace: '#fdf5e6',
    olive: '#808000', olivedrab: '#6b8e23', orange: '#ffa500', orangered: '#ff4500',
    orchid: '#da70d6', palegoldenrod: '#eee8aa', palegreen: '#98fb98', paleturquoise: '#afeeee',
    palevioletred: '#db7093', papayawhip: '#ffefd5', peachpuff: '#ffdab9', peru: '#cd853f',
    pink: '#ffc0cb', plum: '#dda0dd', powderblue: '#b0e0e6', purple: '#800080',
    rebeccapurple: '#663399', red: '#ff0000', rosybrown: '#bc8f8f', royalblue: '#4169e1',
    saddlebrown: '#8b4513', salmon: '#fa8072', sandybrown: '#f4a460', seagreen: '#2e8b57',
    seashell: '#fff5ee', sienna: '#a0522d', silver: '#c0c0c0', skyblue: '#87ceeb',
    slateblue: '#6a5acd', slategray: '#708090', slategrey: '#708090', snow: '#fffafa',
    springgreen: '#00ff7f', steelblue: '#4682b4', tan: '#d2b48c', teal: '#008080',
    thistle: '#d8bfd8', tomato: '#ff6347', turquoise: '#40e0d0', violet: '#ee82ee',
    wheat: '#f5deb3', white: '#ffffff', whitesmoke: '#f5f5f5', yellow: '#ffff00',
    yellowgreen: '#9acd32',
  };

  if (namedColors[str]) {
    return namedColors[str];
  }

  return null;
};

// Estimasi otomatis Shift berdasarkan warna sel atau teks Excel
export const guessShiftFromColor = (hexColor: string | null, cellText?: string): ShiftType | null => {
  if (cellText) {
    const clean = cellText.trim().toUpperCase();
    if (EXCEL_SHIFT_MAPPING[clean]) return EXCEL_SHIFT_MAPPING[clean];
    if (clean === 'P') return 'PM';
    const directMatch = SHIFT_OPTIONS.find((s) => s.toUpperCase() === clean);
    if (directMatch) return directMatch;
  }

  if (!hexColor || hexColor === '#ffffff' || hexColor === COLOR_TRANSPARENT_KEY) {
    return null;
  }

  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return null;

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // 1. Merah / Pink / Coral / Rose / Maroon / Crimson -> OFF
  if (r > 160 && g < 150 && b < 150) return 'OFF';
  if (r > 190 && r - g > 30 && r - b > 30) return 'OFF';
  if (r > 120 && g < 70 && b < 70) return 'OFF'; // dark red / crimson / maroon (#991b1b, #800000, #8b0000)

  // 2. Ungu / Magenta / Lilac / Violet / Indigo -> CUTI
  if (r > 130 && b > 130 && g < 140) return 'CUTI';
  if (r > 160 && b > 150 && g < 170) return 'CUTI';
  if (r > 90 && b > 120 && g < 80) return 'CUTI'; // dark purple (#6b21a8, #7e22ce, #800080)

  // 3. Biru / Indigo / Navy / Sky -> PM atau TPSL
  if (b > 150 && b > r + 20 && b > g + 10) return 'PM';
  if (b > 120 && g > 100 && r < 100) return 'TPSL'; // cyan/sky blue
  if (b > 100 && r < 80 && g < 100) return 'PM'; // navy/dark blue (#000080, #3730a3, #1e3a8a)

  // 4. Hijau / Mint / Teal / Lime -> Graha atau NPCT atau SM
  if (g > 140 && g > r + 15 && g > b + 15) return 'SM';
  if (g > 110 && b > 110 && r < 90) return 'Graha'; // teal / cyan (#115e59, #0f766e, #14b8a6)
  if (g > 110 && r > 110 && b < 80) return 'NPCT'; // lime / olive
  if (g > 80 && r < 80 && b < 80) return 'SM'; // dark green (#166534, #006400, #15803d)

  // 5. Kuning / Amber / Oranye -> SM atau PM
  if (r > 180 && g > 150 && b < 130) return 'SM';
  if (r > 190 && g > 110 && b < 90) return 'PM';

  // 6. Abu-abu gelap / Gelap -> Malam
  if (r < 110 && g < 110 && b < 110 && r + g + b > 30) return 'Malam';

  return null;
};

// Fungsi helper untuk membersihkan inline CSS (mengabaikan seluruh border, outline, dan style vendor)
export const parseInlineStyle = (cssText: string): React.CSSProperties => {
  const styleObj: Record<string, string> = {};
  if (!cssText) return styleObj;

  cssText.split(';').forEach((rule) => {
    const parts = rule.split(':');
    if (parts.length >= 2) {
      const property = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      const propLower = property.toLowerCase();
      // Abaikan semua style border dan outline sesuai instruksi
      if (
        propLower.startsWith('border') ||
        propLower.startsWith('outline') ||
        propLower.startsWith('vnd.') ||
        propLower.startsWith('mso-border')
      ) {
        return;
      }
      // Khusus mso background/color
      if (propLower === 'mso-pattern' || propLower === 'mso-background-source') {
        const msoBgMatch = value.match(/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)/);
        if (msoBgMatch) {
          styleObj['backgroundColor'] = msoBgMatch[0];
        }
        return;
      }
      if (propLower.startsWith('mso-')) {
        return;
      }
      const camelCaseProp = propLower.replace(/-./g, (c) => c.toUpperCase().replace('-', ''));
      if (!camelCaseProp.toLowerCase().startsWith('border') && !camelCaseProp.toLowerCase().startsWith('outline')) {
        styleObj[camelCaseProp] = value;
      }
    }
  });
  return styleObj as React.CSSProperties;
};

// Fungsi helper untuk mengekstrak class-based styles dari tag <style> bawaan Excel
export const parseExcelStylesheet = (doc: Document): Record<string, React.CSSProperties> => {
  const stylesMap: Record<string, React.CSSProperties> = {};
  const styleElements = doc.querySelectorAll('style');
  if (!styleElements || styleElements.length === 0) return stylesMap;

  styleElements.forEach((styleEl) => {
    const cssText = styleEl.textContent || '';
    const regex = /([^{]+)\{([^}]+)\}/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(cssText)) !== null) {
      const selectors = match[1].split(',');
      const properties = match[2];
      const parsedStyle = parseInlineStyle(properties);

      selectors.forEach((sel) => {
        const cleanSel = sel.trim();
        // Match class names like .xl65 or td.xl65 or .font5
        const classMatch = cleanSel.match(/\.([a-zA-Z0-9_-]+)/);
        if (classMatch) {
          const cls = classMatch[1];
          stylesMap[cls] = { ...(stylesMap[cls] || {}), ...parsedStyle };
        }
      });
    }
  });

  return stylesMap;
};

// Fungsi terpadu untuk mem-parsing HTML tabel dari Excel / Google Sheets ke daftar ExcelCellData
export const parseExcelHtmlToCells = (htmlText: string): ExcelCellData[] => {
  const flatCells: ExcelCellData[] = [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const excelStyles = parseExcelStylesheet(doc);
    const rows = doc.querySelectorAll('tr');

    if (rows.length > 0) {
      Array.from(rows).forEach((row) => {
        const rowBg = row.getAttribute('bgcolor');
        const cells = row.querySelectorAll('td, th');
        Array.from(cells).forEach((cell) => {
          let combinedStyle: React.CSSProperties = {};

          // 1. Class styles dari tag <style>
          cell.classList.forEach((className) => {
            if (excelStyles[className]) {
              combinedStyle = { ...combinedStyle, ...excelStyles[className] };
            }
          });

          // 2. Inline styles pada <td> / <th>
          const inlineStyleStr = cell.getAttribute('style') || '';
          const inlineStyleObj = parseInlineStyle(inlineStyleStr);
          combinedStyle = { ...combinedStyle, ...inlineStyleObj };

          // 3. Atribut bgcolor bawaan HTML tabel lama
          const bgcolorAttr = cell.getAttribute('bgcolor') || rowBg;
          if (bgcolorAttr && !combinedStyle.backgroundColor) {
            combinedStyle.backgroundColor = bgcolorAttr;
          }

          // 4. Tag <font color="..."> langsung atau turunan
          const fontChild = cell.querySelector('font[color]');
          if (fontChild && !combinedStyle.color) {
            combinedStyle.color = fontChild.getAttribute('color') || undefined;
          }

          // 5. Cek seluruh child element di dalam sel (span, b, strong, font, div, p, em, i, u)
          const styledChildren = cell.querySelectorAll('span, b, strong, font, p, div, em, i, u');
          styledChildren.forEach((child) => {
            // Cek class styling pada child
            child.classList.forEach((cls) => {
              if (excelStyles[cls]) {
                if (excelStyles[cls].color && !combinedStyle.color) {
                  combinedStyle.color = excelStyles[cls].color;
                }
                if (excelStyles[cls].backgroundColor && !combinedStyle.backgroundColor) {
                  combinedStyle.backgroundColor = excelStyles[cls].backgroundColor;
                }
              }
            });

            // Cek inline style pada child
            const childStyleAttr = child.getAttribute('style');
            if (childStyleAttr) {
              const childStyle = parseInlineStyle(childStyleAttr);
              if (childStyle.color && !combinedStyle.color) {
                combinedStyle.color = childStyle.color;
              }
              if (childStyle.backgroundColor && !combinedStyle.backgroundColor) {
                combinedStyle.backgroundColor = childStyle.backgroundColor;
              }
            }

            // Cek font color attribute pada child
            if (child.tagName.toLowerCase() === 'font' && child.hasAttribute('color') && !combinedStyle.color) {
              combinedStyle.color = child.getAttribute('color') || undefined;
            }
          });

          const cleanStyle: Record<string, any> = {};
          Object.keys(combinedStyle).forEach((key) => {
            const keyLower = key.toLowerCase();
            if (
              !keyLower.startsWith('mso') &&
              !keyLower.startsWith('vnd') &&
              !keyLower.startsWith('border') &&
              !keyLower.startsWith('outline')
            ) {
              cleanStyle[key] = (combinedStyle as any)[key];
            }
          });

          const cellText = ((cell as HTMLElement).innerText ?? cell.textContent ?? '').replace(/\u00a0/g, ' ').trim();
          const rawBg = cleanStyle.backgroundColor || cleanStyle.background || bgcolorAttr;
          const normalizedBg = normalizeColor(rawBg);
          const isWhiteOrTransparent = !normalizedBg || normalizedBg === '#ffffff' || normalizedBg === 'transparent';
          const finalBg = isWhiteOrTransparent ? null : normalizedBg;
          const normalizedTextColor = normalizeColor(cleanStyle.color);

          flatCells.push({
            value: cellText,
            style: { ...cleanStyle, textAlign: 'center' } as React.CSSProperties,
            raw: cellText,
            bgColor: finalBg,
            textColor: normalizedTextColor,
          });
        });
      });
    }
  } catch (err) {
    console.warn('Gagal mem-parsing HTML table Excel:', err);
  }
  return flatCells;
};

export interface ExcelCellData {
  value: string;
  style?: React.CSSProperties;
  raw?: string;
  bgColor?: string | null;
  textColor?: string | null;
}

export interface MatchedDayShift {
  day: number;
  shift: ShiftType | null;
  raw: string;
  style?: React.CSSProperties;
  bgColor?: string | null;
  detectedBy: 'text' | 'color' | 'custom_map' | 'none';
}

export interface DetectedColorItem {
  color: string;
  categoryType: 'color' | 'text_color' | 'text' | 'blank';
  isNoColor?: boolean;
  count: number;
  assignedShift: ShiftType | '';
  sampleText?: string;
  displayColor?: string | null;
}

interface ExcelSpreadsheetProps {
  selectedYear: number;
  selectedMonth: number;
  daysInMonth: number;
  theme?: AppTheme;
  onParsedShiftsChange?: (matchedDays: MatchedDayShift[], validCount: number) => void;
  onApplyDirect?: (updates: Record<string, Partial<DayData>>) => void;
}

export const ExcelSpreadsheet = forwardRef<ExcelSpreadsheetRef, ExcelSpreadsheetProps>(({
  selectedYear,
  selectedMonth,
  daysInMonth,
  theme = 'default',
  onParsedShiftsChange,
}, ref) => {
  const isWinamp = theme === 'winamp';
  const isDark = theme === 'dark';
  const isVista = theme === 'vista';
  const isPaperSketch = theme === 'paperSketch';
  const isLightMode = !isDark && !isWinamp;

  // Inisialisasi grid tepat 35 sel murni: 5 baris x 7 kolom
  const createDefaultGrid = useCallback((): ExcelCellData[][] => {
    return Array(GRID_ROWS)
      .fill(null)
      .map(() =>
        Array(GRID_COLS)
          .fill(null)
          .map(() => ({
            value: '',
            style: { textAlign: 'center' },
            bgColor: null,
          }))
      );
  }, []);

  const [gridData, setGridData] = useState<ExcelCellData[][]>(createDefaultGrid);
  const [hasPastedData, setHasPastedData] = useState(false);

  // Aturan 3: Pemilihan tanggal awal dimana data pertama akan ditempel (1 s.d. daysInMonth)
  const [startDay, setStartDay] = useState<number>(1);

  const padNumber = useCallback((n: number) => String(n).padStart(2, '0'), []);
  const datepickerValue = useMemo(() => {
    return `${selectedYear}-${padNumber(selectedMonth)}-${padNumber(startDay)}`;
  }, [selectedYear, selectedMonth, startDay, padNumber]);

  const datepickerMin = useMemo(() => {
    return `${selectedYear}-${padNumber(selectedMonth)}-01`;
  }, [selectedYear, selectedMonth, padNumber]);

  const datepickerMax = useMemo(() => {
    return `${selectedYear}-${padNumber(selectedMonth)}-${padNumber(daysInMonth)}`;
  }, [selectedYear, selectedMonth, daysInMonth, padNumber]);

  const handleDatepickerChange = useCallback((newVal: string) => {
    if (!newVal) return;
    const parts = newVal.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      if (!isNaN(day)) {
        setStartDay(day);
      }
    }
  }, []);

  // State Interaktif: Sel yang dipilih & Sel yang sedang diedit
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>({ row: 0, col: 0 });
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editInputVal, setEditInputVal] = useState<string>('');

  // State Pemetaan Warna & Kode Teks Kustom (dimuat dari sistem/localStorage agar otomatis digunakan kembali)
  const [customColorMap, setCustomColorMap] = useState<Record<string, ShiftType | ''>>(() => loadSavedExcelColorMap());
  const [isSaveSuccess, setIsSaveSuccess] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const onParsedShiftsChangeRef = useRef(onParsedShiftsChange);
  onParsedShiftsChangeRef.current = onParsedShiftsChange;

  // Fokuskan input saat sel masuk ke mode edit
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  // Helper normalisasi kode shift dari teks
  const matchShiftCode = useCallback((cellVal: string): ShiftType | null => {
    if (!cellVal) return null;
    const clean = cellVal.replace(/\u00a0/g, ' ').trim().toUpperCase();
    if (!clean) return null;

    if (clean === 'P' || clean === 'PM') return 'PM';
    if (clean === 'G' || clean === 'GRAHA') return 'Graha';
    if (clean === 'N' || clean === 'NPCT' || clean === 'NPCS') return 'NPCT';
    if (clean === 'L' || clean === 'OFF' || clean === 'O' || clean === 'LIBUR' || clean === 'FREE') return 'OFF';
    if (clean === 'TPSL' || clean === 'TP' || clean === 'T') return 'TPSL';
    if (clean === 'SM' || clean === 'S2' || clean === 'S1') return 'SM';
    if (clean === 'M' || clean === 'MALAM' || clean === 'MLM' || clean === '3') return 'Malam';
    if (clean === 'CUTI' || clean === 'CT' || clean === 'C' || clean === 'CTI') return 'CUTI';

    if (EXCEL_SHIFT_MAPPING[clean] !== undefined) {
      return EXCEL_SHIFT_MAPPING[clean] || null;
    }

    const found = SHIFT_OPTIONS.find((opt) => opt.toUpperCase() === clean);
    if (found) return found;

    if (clean.length > 2) {
      for (const opt of SHIFT_OPTIONS) {
        if (clean.startsWith(opt.toUpperCase())) {
          return opt;
        }
      }
    }
    return null;
  }, []);

  // Kumpulkan kategori warna unik dan kode teks unik dari grid data
  // Membaca:
  // 1. Sel berwarna latar (colorKey = hex warna latar)
  // 2. Sel dengan warna teks/font (colorKey = `TEXT_COLOR_${hexWarnaTeks}`)
  // 3. Sel dengan teks tapi tanpa warna (colorKey = `TEXT_${cleanText}`) -> Muncul sebagai Kode Teks "P", "OFF", dll.
  // 4. Sel kosong melompong (colorKey = `__BLANK_EMPTY__`) -> Muncul sebagai Sel Kosong (Polos)
  const detectedColorsList = useMemo((): DetectedColorItem[] => {
    if (!gridData || gridData.length === 0) return [];

    const map = new Map<
      string,
      {
        count: number;
        sampleText: string;
        categoryType: 'color' | 'text_color' | 'text' | 'blank';
        colorKey: string;
        displayColor: string | null;
      }
    >();

    gridData.forEach((row) => {
      row.forEach((cell) => {
        const bg = normalizeColor(cell.bgColor || cell.style?.backgroundColor || (cell.style as any)?.background);
        const textCol = normalizeColor(cell.textColor || cell.style?.color);
        const rawText = cell.value ? cell.value.trim() : '';
        const cleanText = rawText.toUpperCase();
        
        const isNoBg = !bg || bg === '#ffffff' || bg === 'transparent';
        const hasBg = !isNoBg && Boolean(bg);

        const isDefaultTextColor = !textCol || textCol === '#000000' || textCol === '#011627' || textCol === 'black' || textCol === '#333333' || textCol === '#111827';
        const hasCustomTextColor = !isDefaultTextColor && Boolean(textCol);
        const hasText = cleanText.length > 0;

        let key = '';
        let categoryType: 'color' | 'text_color' | 'text' | 'blank' = 'blank';
        let displayColor: string | null = null;

        if (hasBg && bg) {
          key = bg;
          categoryType = 'color';
          displayColor = bg;
        } else if (hasCustomTextColor && textCol) {
          key = `TEXT_COLOR_${textCol}`;
          categoryType = 'text_color';
          displayColor = textCol;
        } else if (hasText) {
          key = `TEXT_${cleanText}`;
          categoryType = 'text';
          displayColor = null;
        } else {
          key = '__BLANK_EMPTY__';
          categoryType = 'blank';
          displayColor = null;
        }

        const prev = map.get(key) || {
          count: 0,
          sampleText: rawText,
          categoryType,
          colorKey: key,
          displayColor,
        };

        map.set(key, {
          count: prev.count + 1,
          sampleText: prev.sampleText || rawText,
          categoryType,
          colorKey: key,
          displayColor,
        });
      });
    });

    const items: DetectedColorItem[] = [];
    map.forEach((val, key) => {
      let defaultAssigned: ShiftType | '' = '';
      if (customColorMap[key] !== undefined) {
        defaultAssigned = customColorMap[key];
      } else if (val.categoryType === 'text') {
        defaultAssigned = matchShiftCode(val.sampleText) || '';
      } else if (val.categoryType === 'color') {
        defaultAssigned =
          guessShiftFromColor(val.colorKey, val.sampleText) ||
          matchShiftCode(val.sampleText) ||
          '';
      } else if (val.categoryType === 'text_color') {
        defaultAssigned =
          guessShiftFromColor(val.displayColor, val.sampleText) ||
          matchShiftCode(val.sampleText) ||
          '';
      } else {
        defaultAssigned = '';
      }

      items.push({
        color: key,
        categoryType: val.categoryType,
        isNoColor: val.categoryType === 'text' || val.categoryType === 'blank',
        count: val.count,
        assignedShift: defaultAssigned,
        sampleText: val.sampleText,
        displayColor: val.displayColor,
      });
    });

    // Urutan tampil:
    // 1. Sel dengan warna latar
    // 2. Sel dengan warna teks (Font Color)
    // 3. Sel dengan teks (tanpa warna latar)
    // 4. Sel kosong melompong (Polos)
    return items.sort((a, b) => {
      const order = { color: 1, text_color: 2, text: 3, blank: 4 };
      return order[a.categoryType] - order[b.categoryType];
    });
  }, [gridData, customColorMap, matchShiftCode]);

  // Aturan 3 & 4: Pemetaan Jadwal Shift Berdasarkan Tanggal Awal & Batas Bulan
  const { detectedShifts, validCount } = useMemo(() => {
    if (!gridData || gridData.length === 0) {
      return { detectedShifts: [], validCount: 0 };
    }

    const resolveCellShift = (
      cell?: ExcelCellData
    ): { shift: ShiftType | null; detectedBy: 'text' | 'color' | 'custom_map' | 'none' } => {
      if (!cell) return { shift: null, detectedBy: 'none' };
      const cellBg = normalizeColor(cell.bgColor || cell.style?.backgroundColor || (cell.style as any)?.background);
      const cellTextColor = normalizeColor(cell.textColor || cell.style?.color);
      const isNoBg = !cellBg || cellBg === '#ffffff' || cellBg === 'transparent';
      const rawText = cell.value ? cell.value.trim() : '';
      const cleanText = rawText.toUpperCase();
      const hasBg = !isNoBg && Boolean(cellBg);
      const isDefaultTextColor = !cellTextColor || cellTextColor === '#000000' || cellTextColor === '#011627' || cellTextColor === 'black' || cellTextColor === '#333333';
      const hasCustomTextColor = !isDefaultTextColor && Boolean(cellTextColor);
      const hasText = cleanText.length > 0;

      // 1. Cek jika pengguna melakukan pemetaan manual pada warna latar
      if (hasBg && cellBg && customColorMap[cellBg] !== undefined) {
        if (customColorMap[cellBg] === '') return { shift: null, detectedBy: 'none' };
        return { shift: customColorMap[cellBg] as ShiftType, detectedBy: 'custom_map' };
      }

      // 2. Cek jika ada pemetaan manual untuk warna teks (Font Color)
      if (hasCustomTextColor && cellTextColor && customColorMap[`TEXT_COLOR_${cellTextColor}`] !== undefined) {
        if (customColorMap[`TEXT_COLOR_${cellTextColor}`] === '') return { shift: null, detectedBy: 'none' };
        return { shift: customColorMap[`TEXT_COLOR_${cellTextColor}`] as ShiftType, detectedBy: 'custom_map' };
      }

      // 3. Cek jika ada pemetaan manual untuk kode teks
      if (hasText && customColorMap[`TEXT_${cleanText}`] !== undefined) {
        if (customColorMap[`TEXT_${cleanText}`] === '') return { shift: null, detectedBy: 'none' };
        return { shift: customColorMap[`TEXT_${cleanText}`] as ShiftType, detectedBy: 'custom_map' };
      }

      // 4. Cek jika ada pemetaan manual untuk sel polos
      if (!hasBg && !hasCustomTextColor && !hasText && customColorMap['__BLANK_EMPTY__'] !== undefined) {
        if (customColorMap['__BLANK_EMPTY__'] === '') return { shift: null, detectedBy: 'none' };
        return { shift: customColorMap['__BLANK_EMPTY__'] as ShiftType, detectedBy: 'custom_map' };
      }

      // 5. Cek apakah teks sel cocok dengan kode shift resmi atau kamus bawaan sistem (misal TEXT_P -> PM)
      if (hasText) {
        if (SYSTEM_DEFAULT_EXCEL_MAP[`TEXT_${cleanText}`]) {
          return { shift: SYSTEM_DEFAULT_EXCEL_MAP[`TEXT_${cleanText}`], detectedBy: 'text' };
        }
        const textMatch = matchShiftCode(cleanText);
        if (textMatch) {
          return { shift: textMatch, detectedBy: 'text' };
        }
      }

      // 6. Cek warna latar belakang sel dari kamus bawaan sistem
      if (hasBg && cellBg && SYSTEM_DEFAULT_EXCEL_MAP[cellBg]) {
        return { shift: SYSTEM_DEFAULT_EXCEL_MAP[cellBg], detectedBy: 'color' };
      }

      // 7. Cek warna latar belakang sel jika memiliki warna
      if (hasBg && cellBg) {
        const colorMatch = guessShiftFromColor(cellBg, rawText);
        if (colorMatch) {
          return { shift: colorMatch, detectedBy: 'color' };
        }
      }

      // 8. Cek warna teks (Font Color) jika memiliki warna khusus
      if (hasCustomTextColor && cellTextColor) {
        if (SYSTEM_DEFAULT_EXCEL_MAP[`TEXT_COLOR_${cellTextColor}`]) {
          return { shift: SYSTEM_DEFAULT_EXCEL_MAP[`TEXT_COLOR_${cellTextColor}`], detectedBy: 'color' };
        }
        const textColorMatch = guessShiftFromColor(cellTextColor, rawText);
        if (textColorMatch) {
          return { shift: textColorMatch, detectedBy: 'color' };
        }
      }

      return { shift: null, detectedBy: 'none' };
    };

    const results: MatchedDayShift[] = [];
    let totalValid = 0;

    // Hitung pemetaan untuk tanggal 1 s.d. daysInMonth (hanya untuk bulan aktif)
    for (let day = 1; day <= daysInMonth; day++) {
      if (day < startDay) {
        // Tanggal sebelum tanggal awal tidak terisi
        results.push({
          day,
          shift: null,
          raw: '',
          detectedBy: 'none',
        });
        continue;
      }

      // Indeks data sel: data pertama (indeks 0) dimulai pada startDay
      const cellIndex = day - startDay;

      if (cellIndex < TOTAL_CELLS) {
        const r = Math.floor(cellIndex / GRID_COLS);
        const c = cellIndex % GRID_COLS;
        const cell = gridData[r]?.[c];
        const raw = cell?.value || '';
        const { shift, detectedBy } = resolveCellShift(cell);

        if (shift) totalValid++;

        results.push({
          day,
          shift,
          raw,
          style: cell?.style,
          bgColor: cell?.bgColor,
          detectedBy,
        });
      } else {
        // Melebihi kapasitas 42 sel
        results.push({
          day,
          shift: null,
          raw: '',
          detectedBy: 'none',
        });
      }
    }

    return { detectedShifts: results, validCount: totalValid };
  }, [gridData, daysInMonth, startDay, matchShiftCode, customColorMap]);

  // Beritahu parent saat terjadi perubahan
  const lastEmittedRef = useRef<string>('');
  useEffect(() => {
    const key = `${validCount}-${startDay}-${detectedShifts.map((d) => `${d.day}:${d.shift || '-'}`).join(',')}`;
    if (lastEmittedRef.current !== key) {
      lastEmittedRef.current = key;
      onParsedShiftsChangeRef.current?.(detectedShifts, validCount);
    }
  }, [detectedShifts, validCount, startDay]);

  // Handler simpan isi sel yang diedit
  const handleCommitCellEdit = useCallback(() => {
    if (!editingCell) return;
    const { row, col } = editingCell;

    setGridData((prev) => {
      const newGrid = prev.map((r) => [...r]);
      if (newGrid[row] && newGrid[row][col]) {
        newGrid[row][col] = {
          ...newGrid[row][col],
          value: editInputVal,
          raw: editInputVal,
        };
      }
      return newGrid;
    });

    setHasPastedData(true);
    setEditingCell(null);
  }, [editingCell, editInputVal]);

  const handleCancelCellEdit = useCallback(() => {
    setEditingCell(null);
    setEditInputVal('');
  }, []);

  const handleStartEdit = useCallback((row: number, col: number) => {
    const currentVal = gridData[row]?.[col]?.value || '';
    setSelectedCell({ row, col });
    setEditingCell({ row, col });
    setEditInputVal(currentVal);
  }, [gridData]);

  // Navigasi Keyboard Interaktif (Panah, Tab, Enter, Delete)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (editingCell) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleCommitCellEdit();
          if (selectedCell && selectedCell.row < GRID_ROWS - 1) {
            setSelectedCell({ row: selectedCell.row + 1, col: selectedCell.col });
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleCancelCellEdit();
        } else if (e.key === 'Tab') {
          e.preventDefault();
          handleCommitCellEdit();
          if (selectedCell) {
            const nextCol = selectedCell.col + 1 < GRID_COLS ? selectedCell.col + 1 : 0;
            const nextRow =
              nextCol === 0 && selectedCell.row + 1 < GRID_ROWS
                ? selectedCell.row + 1
                : selectedCell.row;
            setSelectedCell({ row: nextRow, col: nextCol });
          }
        }
        return;
      }

      if (!selectedCell) return;
      const { row, col } = selectedCell;

      switch (e.key) {
        case 'v':
        case 'V':
          if (e.ctrlKey || e.metaKey) {
            containerRef.current?.focus();
            return;
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (row > 0) setSelectedCell({ row: row - 1, col });
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (row < GRID_ROWS - 1) setSelectedCell({ row: row + 1, col });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (col > 0) setSelectedCell({ row, col: col - 1 });
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (col < GRID_COLS - 1) setSelectedCell({ row, col: col + 1 });
          break;
        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            if (col > 0) setSelectedCell({ row, col: col - 1 });
            else if (row > 0) setSelectedCell({ row: row - 1, col: GRID_COLS - 1 });
          } else {
            if (col < GRID_COLS - 1) setSelectedCell({ row, col: col + 1 });
            else if (row < GRID_ROWS - 1) setSelectedCell({ row: row + 1, col: 0 });
          }
          break;
        case 'Enter':
        case 'F2':
          e.preventDefault();
          handleStartEdit(row, col);
          break;
        case 'Backspace':
        case 'Delete':
          e.preventDefault();
          setGridData((prev) => {
            const newGrid = prev.map((r) => [...r]);
            if (newGrid[row]?.[col]) {
              newGrid[row][col] = { ...newGrid[row][col], value: '', raw: '' };
            }
            return newGrid;
          });
          break;
        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            setSelectedCell({ row, col });
            setEditingCell({ row, col });
            setEditInputVal(e.key);
          }
          break;
      }
    },
    [editingCell, selectedCell, handleCommitCellEdit, handleCancelCellEdit, handleStartEdit]
  );

  // Aturan 1 & 2:
  // - Data paling pertama selalu otomatis dimuat di sel paling pertama (Row 0, Col 0) lalu berurut.
  // - Data yang melebihi 7 kolom otomatis wrap/lanjut ke row di bawahnya (kelipatan 7).
  const populateInto42CellsStrict = useCallback((cellsList: ExcelCellData[]) => {
    const newGrid: ExcelCellData[][] = Array(GRID_ROWS)
      .fill(null)
      .map(() =>
        Array(GRID_COLS)
          .fill(null)
          .map(() => ({
            value: '',
            style: { textAlign: 'center' },
            bgColor: null,
          }))
      );

    for (let i = 0; i < Math.min(cellsList.length, TOTAL_CELLS); i++) {
      const r = Math.floor(i / GRID_COLS);
      const c = i % GRID_COLS;
      newGrid[r][c] = cellsList[i];
    }

    setGridData(newGrid);
    setSelectedCell({ row: 0, col: 0 });
    setHasPastedData(true);
  }, []);

  // Terapkan sel yang ditempel mulai dari sel yang sedang dipilih (selectedCell)
  const applyPastedCells = useCallback(
    (flatCells: ExcelCellData[]) => {
      if (flatCells.length === 0) return;

      const startRow = selectedCell?.row ?? 0;
      const startCol = selectedCell?.col ?? 0;
      const startOffset = startRow * GRID_COLS + startCol;

      setGridData((prevGrid) => {
        // Jika hanya 1 sel yang disalin: Perbarui HANYA sel yang sedang dipilih tanpa menghapus sel lainnya!
        if (flatCells.length === 1) {
          const nextGrid = prevGrid.map((r) => [...r]);
          if (nextGrid[startRow] && nextGrid[startRow][startCol]) {
            nextGrid[startRow][startCol] = flatCells[0];
          }
          return nextGrid;
        }

        // Jika beberapa sel / satu baris / tabel disalin:
        // Tempel sel berurutan mulai dari posisi startOffset
        const baseGrid = hasPastedData
          ? prevGrid.map((r) => [...r])
          : createDefaultGrid();

        for (let i = 0; i < flatCells.length; i++) {
          const targetIdx = startOffset + i;
          if (targetIdx >= TOTAL_CELLS) break;
          const r = Math.floor(targetIdx / GRID_COLS);
          const c = targetIdx % GRID_COLS;
          baseGrid[r][c] = flatCells[i];
        }

        return baseGrid;
      });

      setHasPastedData(true);

      // Pindahkan kursor seleksi setelah penempelan
      if (flatCells.length === 1) {
        const nextCol = startCol + 1 < GRID_COLS ? startCol + 1 : 0;
        const nextRow = nextCol === 0 && startRow + 1 < GRID_ROWS ? startRow + 1 : startRow;
        setSelectedCell({ row: nextRow, col: nextCol });
      } else {
        const lastIdx = Math.min(startOffset + flatCells.length - 1, TOTAL_CELLS - 1);
        setSelectedCell({ row: Math.floor(lastIdx / GRID_COLS), col: lastIdx % GRID_COLS });
      }
    },
    [selectedCell, hasPastedData]
  );

  // Proses data clipboard (baik berformat HTML Excel/Sheets maupun Plain Text TSV/CSV)
  const processClipboardData = useCallback(
    (clipboardData: DataTransfer | null) => {
      if (!clipboardData || editingCell) return;

      let flatCells: ExcelCellData[] = [];

      // 1. Coba baca format HTML dari Excel / Google Sheets
      const htmlData = clipboardData.getData('text/html');
      if (htmlData) {
        flatCells = parseExcelHtmlToCells(htmlData);
      }

      // 2. Fallback jika bukan HTML tabel: baca teks biasa (TSV / CSV / Dipisah Spasi)
      if (flatCells.length === 0) {
        const textData = clipboardData.getData('text');
        if (textData) {
          const lines = textData.replace(/\r/g, '').trim().split('\n');
          lines.forEach((line) => {
            let rawCells = line.split('\t');
            if (rawCells.length <= 1 && line.includes(';')) {
              rawCells = line.split(';');
            } else if (rawCells.length <= 1 && line.includes(',')) {
              rawCells = line.split(',');
            } else if (rawCells.length <= 1 && line.trim().includes(' ')) {
              rawCells = line.trim().split(/\s+/);
            }
            rawCells.forEach((cellVal) => {
              flatCells.push({
                value: cellVal.trim(),
                style: { textAlign: 'center' },
                raw: cellVal.trim(),
                bgColor: null,
                textColor: null,
              });
            });
          });
        }
      }

      if (flatCells.length > 0) {
        applyPastedCells(flatCells);
      }
    },
    [editingCell, applyPastedCells]
  );

  // Handler utama tempel (Paste) clipboard Excel
  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (editingCell) return;
    event.preventDefault();
    processClipboardData(event.clipboardData);
  };

  // Listener paste global: menjamin CTRL+V selalu bekerja saat sel sedang dipilih
  useEffect(() => {
    const handleGlobalPaste = (event: ClipboardEvent) => {
      if (editingCell) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
        target !== editInputRef.current
      ) {
        return;
      }

      if (containerRef.current) {
        event.preventDefault();
        processClipboardData(event.clipboardData);
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => {
      window.removeEventListener('paste', handleGlobalPaste);
    };
  }, [editingCell, processClipboardData]);

  const handleColorMapChange = (mapKey: string, shift: ShiftType | '') => {
    setCustomColorMap((prev) => {
      const next = {
        ...prev,
        [mapKey]: shift,
      };
      saveExcelColorMap(next);
      return next;
    });
  };

  const handleClearSavedColorRules = () => {
    const defaultMap = { ...SYSTEM_DEFAULT_EXCEL_MAP };
    setCustomColorMap(defaultMap);
    saveExcelColorMap(defaultMap);
  };

  const handleManualSaveRules = () => {
    const newMap = { ...customColorMap };
    detectedColorsList.forEach((item) => {
      if (item.assignedShift !== undefined) {
        newMap[item.color] = item.assignedShift;
      }
    });
    setCustomColorMap(newMap);
    saveExcelColorMap(newMap);
    setIsSaveSuccess(true);
    setTimeout(() => {
      setIsSaveSuccess(false);
    }, 2200);
  };

  const handleDirectPasteFromClipboard = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      if (navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          if (item.types.includes('text/html')) {
            const blob = await item.getType('text/html');
            const htmlText = await blob.text();
            if (htmlText) {
              const flatCells = parseExcelHtmlToCells(htmlText);
              if (flatCells.length > 0) {
                applyPastedCells(flatCells);
                return;
              }
            }
          }
          if (item.types.includes('text/plain')) {
            const blob = await item.getType('text/plain');
            const text = await blob.text();
            if (text) {
              const flatCells: ExcelCellData[] = [];
              const lines = text.replace(/\r/g, '').trim().split('\n');
              lines.forEach((line) => {
                let rawCells = line.split('\t');
                if (rawCells.length <= 1 && line.includes(';')) rawCells = line.split(';');
                else if (rawCells.length <= 1 && line.includes(',')) rawCells = line.split(',');
                else if (rawCells.length <= 1 && line.trim().includes(' ')) rawCells = line.trim().split(/\s+/);
                rawCells.forEach((cellVal) => {
                  flatCells.push({
                    value: cellVal.trim(),
                    style: { textAlign: 'center' },
                    raw: cellVal.trim(),
                    bgColor: null,
                    textColor: null,
                  });
                });
              });
              if (flatCells.length > 0) {
                applyPastedCells(flatCells);
                return;
              }
            }
          }
        }
      }

      if (navigator.clipboard.readText) {
        const textData = await navigator.clipboard.readText();
        if (textData) {
          const flatCells: ExcelCellData[] = [];
          const lines = textData.replace(/\r/g, '').trim().split('\n');
          lines.forEach((line) => {
            let rawCells = line.split('\t');
            if (rawCells.length <= 1 && line.includes(';')) rawCells = line.split(';');
            else if (rawCells.length <= 1 && line.includes(',')) rawCells = line.split(',');
            else if (rawCells.length <= 1 && line.trim().includes(' ')) rawCells = line.trim().split(/\s+/);
            rawCells.forEach((cellVal) => {
              flatCells.push({
                value: cellVal.trim(),
                style: { textAlign: 'center' },
                raw: cellVal.trim(),
                bgColor: null,
                textColor: null,
              });
            });
          });
          if (flatCells.length > 0) {
            applyPastedCells(flatCells);
          }
        }
      }
    } catch (err) {
      console.warn('Gagal membaca clipboard langsung:', err);
    }
  }, [applyPastedCells]);

  // Muat contoh format 42 sel (7 kolom x 6 baris)
  const loadExampleTemplate = () => {
    const exampleConfigs: { shift: ShiftType; bg: string; color: string; textVal?: string }[] = [
      { shift: 'Graha', bg: '#ccfbf1', color: '#115e59', textVal: 'G' },
      { shift: 'NPCT', bg: '#dcfce7', color: '#166534', textVal: 'N' },
      { shift: 'TPSL', bg: '#e0f2fe', color: '#075985', textVal: 'L' },
      { shift: 'OFF', bg: '#fee2e2', color: '#991b1b', textVal: 'OFF' },
      { shift: 'SM', bg: '#fef3c7', color: '#92400e', textVal: 'SM' },
      { shift: 'PM', bg: '#e0e7ff', color: '#3730a3', textVal: 'P' },
      { shift: 'Malam', bg: '#f1f5f9', color: '#334155', textVal: 'M' },
      { shift: 'CUTI', bg: '#f3e8ff', color: '#6b21a8', textVal: 'C' },
    ];

    const flatCells: ExcelCellData[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const item = exampleConfigs[(d - 1) % exampleConfigs.length];
      flatCells.push({
        value: item.textVal || item.shift,
        style: {
          fontWeight: 'bold',
          textAlign: 'center',
          backgroundColor: item.bg || 'transparent',
          color: item.color,
        },
        bgColor: item.bg ? item.bg : null,
      });
    }

    setStartDay(1);
    populateInto42CellsStrict(flatCells);
  };

  const handleReset = () => {
    setGridData(createDefaultGrid());
    setHasPastedData(false);
    setSelectedCell({ row: 0, col: 0 });
    setEditingCell(null);
    setStartDay(1);
    // Muat ulang aturan tersimpan dari sistem agar tidak hilang saat reset spreadsheet
    setCustomColorMap(loadSavedExcelColorMap());
  };

  useImperativeHandle(ref, () => ({
    pasteClipboard: () => {
      handleDirectPasteFromClipboard();
    },
    loadSample: () => {
      loadExampleTemplate();
    },
    resetGrid: () => {
      handleReset();
    },
    resetColorMap: () => {
      handleClearSavedColorRules();
    },
  }));

  const getCellBorderClass = () => {
    if (isPaperSketch) return 'border-[1.5px] border-[#2b2b2b]';
    if (isWinamp) return 'border border-[#00FF00]/45';
    if (isDark) return 'border border-slate-700';
    if (isVista) return 'border border-sky-300/90';
    return 'border border-slate-300 dark:border-slate-600';
  };

  return (
    <div className="w-full flex flex-col space-y-2.5 select-none" onKeyDown={handleKeyDown}>
      {/* Top Bar: Quick Action Buttons (Deskripsi Grid dihapus sesuai permintaan) */}
      <div className="flex items-center justify-end gap-2 px-0.5">
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={handleDirectPasteFromClipboard}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer border ${
              isPaperSketch
                ? 'bg-white text-[#2b2b2b] border-2 border-[#2b2b2b] hover:bg-[#2ec4b6] shadow-[2px_2px_0px_#2b2b2b]'
                : isWinamp
                ? 'bg-black text-[#00FF00] border-zinc-700 hover:border-[#00FF00]'
                : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/60'
            }`}
            title="Tempel jadwal/tabel Excel langsung dari clipboard (Ctrl + V)"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="text-[11px]">Tempel Clipboard (Ctrl+V)</span>
          </button>

          <button
            type="button"
            onClick={loadExampleTemplate}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer border ${
              isPaperSketch
                ? 'bg-white text-[#2b2b2b] border-2 border-[#2b2b2b] hover:bg-[#2ec4b6] shadow-[2px_2px_0px_#2b2b2b]'
                : isWinamp
                ? 'bg-black text-[#00FF00] border-zinc-700 hover:border-[#00FF00]'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
            title="Muat contoh format jadwal Excel"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px]">Contoh Format</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer border ${
              isPaperSketch
                ? 'bg-white text-[#ff4747] border-2 border-[#2b2b2b] hover:bg-[#ff4747] hover:text-white shadow-[2px_2px_0px_#2b2b2b]'
                : isWinamp
                ? 'bg-black text-rose-500 border-zinc-800 hover:border-rose-500'
                : 'bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/30'
            }`}
            title="Reset grid ke awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px]">Reset</span>
          </button>
        </div>
      </div>

      {/* THE 35-CELL SPREADSHEET CANVAS (7 KOLOM × 5 BARIS MURNI DENGAN GARIS GRID TEGAS) */}
      <div
        ref={containerRef}
        tabIndex={0}
        onPaste={handlePaste}
        className={`w-full overflow-hidden rounded-xl border transition-all focus:outline-none focus:ring-2 ${
          isPaperSketch
            ? 'bg-white border-2 border-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b] focus:ring-[#ff4747]'
            : isWinamp
            ? 'bg-[#0a0a0a] border-2 border-zinc-700 font-mono text-[#00FF00] focus:ring-[#00FF00]'
            : isDark
            ? 'bg-[#121212] border border-slate-700 text-slate-100 focus:ring-teal-500'
            : isVista
            ? 'bg-white/80 backdrop-blur-md border border-sky-300 text-slate-900 focus:ring-sky-500'
            : 'bg-white border-2 border-slate-300 dark:border-slate-700 text-slate-900 focus:ring-teal-500'
        } relative p-0`}
      >
        <table className="w-full table-fixed border-collapse text-xs select-none">
          <tbody>
            {gridData.map((row, rIdx) => (
              <tr key={`excel-row-${rIdx}`}>
                {row.map((cell, cIdx) => {
                  const isSelected = selectedCell?.row === rIdx && selectedCell?.col === cIdx;
                  const isEditing = editingCell?.row === rIdx && editingCell?.col === cIdx;
                  const cellBg = cell.bgColor || cell.style?.backgroundColor;

                  return (
                    <td
                      key={`excel-cell-${rIdx}-${cIdx}`}
                      onClick={() => {
                        if (!isEditing) {
                          setSelectedCell({ row: rIdx, col: cIdx });
                          containerRef.current?.focus();
                        }
                      }}
                      onDoubleClick={() => handleStartEdit(rIdx, cIdx)}
                      style={{
                        padding: isEditing ? '0' : '4px 6px',
                        width: '14.285%',
                        height: '38px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        textAlign: 'center',
                        boxSizing: 'border-box',
                        ...cell.style,
                        backgroundColor: cellBg || (isPaperSketch ? '#ffffff' : undefined),
                      }}
                      className={`relative transition-colors cursor-cell select-none ${getCellBorderClass()} ${
                        isSelected
                          ? isPaperSketch
                            ? 'ring-2 ring-[#ff4747] z-10'
                            : isWinamp
                            ? 'ring-2 ring-[#00FF00] z-10'
                            : 'ring-2 ring-teal-500 dark:ring-teal-400 z-10 shadow-2xs'
                          : isPaperSketch
                          ? 'hover:bg-[#2ec4b6]/15'
                          : isWinamp
                          ? 'hover:bg-[#00FF00]/10'
                          : 'hover:brightness-95 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {isEditing ? (
                        <div className="relative w-full h-full min-h-[38px] flex items-center">
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editInputVal}
                            onChange={(e) => setEditInputVal(e.target.value)}
                            onBlur={handleCommitCellEdit}
                            className="w-full h-full px-1 text-xs font-mono text-center outline-none bg-white dark:bg-zinc-900 text-slate-900 dark:text-white border-2 border-teal-500 shadow-sm"
                            style={{
                              fontWeight: cell.style?.fontWeight || 'bold',
                              color: cell.style?.color,
                            }}
                          />
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleCommitCellEdit();
                            }}
                            className="absolute right-0.5 p-1 bg-teal-600 text-white rounded hover:bg-teal-700 cursor-pointer shadow-3xs"
                            title="Simpan (Enter)"
                          >
                            <CornerDownLeft className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center truncate">
                          <span
                            className="font-mono text-xs font-bold"
                            style={{
                              color: cell.textColor || cell.style?.color || undefined,
                            }}
                          >
                            {cell.value}
                          </span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ATURAN 3: PEMILIHAN TANGGAL AWAL PENEMPELAN DATA (MUNCUL KETIKA SUDAH ADA DATA) */}
      {(hasPastedData || validCount > 0) && (
        <div
          className={`flex flex-wrap items-center justify-between p-2.5 rounded-xl border gap-2 animate-in fade-in duration-200 ${
            isPaperSketch
              ? 'bg-white border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
              : isWinamp
              ? 'bg-black border border-zinc-700 text-[#00FF00]'
              : isDark
              ? 'bg-slate-900 border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center space-x-2 text-xs">
            <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="font-bold">Data pertama ditempel mulai tanggal:</span>
          </div>

          <div className="w-52 sm:w-60">
            <CustomDatePicker
              value={datepickerValue}
              onChange={handleDatepickerChange}
              min={datepickerMin}
              max={datepickerMax}
              allowClear={false}
              theme={theme}
              align="right"
            />
          </div>
        </div>
      )}

      {/* PANEL PEMETAAN WARNA & KODE TEKS EXCEL ➔ SHIFT */}
      {detectedColorsList.length > 0 && (
        <div
          className={`p-2.5 rounded-xl border space-y-2 animate-in fade-in duration-200 ${
            isPaperSketch
              ? 'bg-white border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
              : isWinamp
              ? 'bg-black border border-zinc-700 text-[#00FF00]'
              : isDark
              ? 'bg-slate-900 border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between text-xs font-bold gap-1.5">
            <div className="flex items-center space-x-1.5 min-w-0">
              <Palette className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="truncate">Pemetaan Warna & Kode Teks Excel ➔ Shift:</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                <span>✓</span>
                <span className="hidden sm:inline">Tersimpan di Sistem</span>
                <span className="sm:hidden">Tersimpan</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="text-[10px] font-normal opacity-75 hidden xs:inline">
                {detectedColorsList.length} Kategori
              </span>
              <button
                type="button"
                onClick={handleManualSaveRules}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all cursor-pointer border ${
                  isSaveSuccess
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : isPaperSketch
                    ? 'bg-[#2ec4b6] text-white border border-[#2b2b2b] shadow-[1px_1px_0px_#2b2b2b] hover:bg-[#25a99d]'
                    : isWinamp
                    ? 'bg-black text-[#00FF00] border border-[#00FF00] hover:bg-[#00FF00]/20'
                    : 'bg-teal-600 hover:bg-teal-700 text-white border-teal-700 shadow-2xs'
                }`}
                title="Simpan pemetaan aturan warna & kode shift saat ini ke sistem aplikasi"
              >
                {isSaveSuccess ? (
                  <>
                    <Check className="w-3 h-3 shrink-0" />
                    <span>Tersimpan!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 shrink-0" />
                    <span>Simpan Aturan</span>
                  </>
                )}
              </button>
              {Object.keys(customColorMap).length > 0 && (
                <button
                  type="button"
                  onClick={handleClearSavedColorRules}
                  className="text-[10px] text-rose-500 hover:text-rose-600 underline cursor-pointer px-1 py-0.5"
                  title="Hapus aturan kustom dan pulihkan ke pemetaan bawaan sistem"
                >
                  Reset Aturan
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {detectedColorsList.map((item) => {
              const currentShift = item.assignedShift;
              const shiftStyle = currentShift ? SHIFT_COLORS[currentShift] : null;

              return (
                <div
                  key={`color-item-${item.color}`}
                  className={`flex items-center justify-between p-2 rounded-xl border gap-2.5 text-xs ${
                    isPaperSketch
                      ? 'bg-[#f2efeb] border-2 border-[#2b2b2b]'
                      : isWinamp
                      ? 'bg-zinc-900 border-zinc-800 text-[#00FF00]'
                      : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 shadow-2xs'
                  }`}
                >
                  {/* Swatch & Keterangan Rapi */}
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                    {item.categoryType === 'color' ? (
                      <div
                        className="w-7 h-7 rounded-lg border border-black/20 shrink-0 shadow-2xs"
                        style={{ backgroundColor: item.displayColor || item.color }}
                        title={`Warna Latar: ${item.color}`}
                      />
                    ) : item.categoryType === 'text_color' ? (
                      <div
                        className="w-7 h-7 rounded-lg border shrink-0 shadow-2xs flex items-center justify-center font-mono font-black text-xs bg-slate-100 dark:bg-slate-900"
                        style={{
                          color: item.displayColor || '#000000',
                          borderColor: item.displayColor ? `${item.displayColor}66` : 'rgba(0,0,0,0.2)',
                        }}
                        title={`Warna Teks (Font): ${item.displayColor}`}
                      >
                        {item.sampleText || 'A'}
                      </div>
                    ) : item.categoryType === 'text' ? (
                      <div
                        className="w-7 h-7 rounded-lg border border-teal-500/40 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 shrink-0 shadow-2xs flex items-center justify-center font-mono font-black text-xs"
                        title={`Kode Teks: ${item.sampleText}`}
                      >
                        {item.sampleText || '?'}
                      </div>
                    ) : (
                      <div
                        className="w-7 h-7 rounded-lg border border-dashed border-slate-400 bg-slate-100 dark:bg-slate-900 shrink-0 shadow-2xs flex items-center justify-center font-bold text-[8.5px] text-slate-500"
                        title="Sel Kosong Tanpa Teks & Tanpa Warna"
                      >
                        Polos
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <span className="block text-[11px] font-bold truncate">
                        {item.categoryType === 'text' ? (
                          <span>
                            Kode Teks <strong className="text-teal-700 dark:text-teal-300 font-mono">"{item.sampleText}"</strong>
                          </span>
                        ) : item.categoryType === 'text_color' ? (
                          <span>
                            Warna Teks <strong className="font-mono" style={{ color: item.displayColor || undefined }}>"{item.sampleText || item.displayColor}"</strong> ({item.displayColor})
                          </span>
                        ) : item.categoryType === 'color' ? (
                          <span>
                            {item.sampleText ? `"${item.sampleText}" (${item.color})` : `Warna ${item.color}`}
                          </span>
                        ) : (
                          <span className="opacity-75">Sel Kosong (Polos)</span>
                        )}
                      </span>
                      <span className="block text-[9.5px] opacity-65">
                        {item.count} sel {item.categoryType === 'text_color' ? '(Font Color)' : item.categoryType === 'text' ? '(Tanpa warna latar)' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Pilihan Shift */}
                  <div className="shrink-0">
                    <select
                      value={currentShift}
                      onChange={(e) => handleColorMapChange(item.color, e.target.value as ShiftType | '')}
                      className={`text-xs font-bold py-1.5 px-2.5 rounded-lg border cursor-pointer outline-none transition-all ${
                        currentShift && shiftStyle
                          ? `${shiftStyle.bg || 'bg-teal-500'} ${shiftStyle.text || 'text-white'} border-current/20`
                          : isPaperSketch
                          ? 'bg-white border-2 border-[#2b2b2b] text-[#2b2b2b]'
                          : isWinamp
                          ? 'bg-black border-zinc-700 text-[#00FF00]'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      <option value="">(Abaikan)</option>
                      {SHIFT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PRATINJAU SHIFT PARSED (SAMA PERSIS DENGAN TAMPILAN SHIFT BY TEXT & MUNCUL KETIKA SUDAH ADA DATA) */}
      {(hasPastedData || validCount > 0) && (
        <div className="space-y-1.5 flex flex-col min-h-0 shrink-0 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-bold px-0.5">
            <span className="text-[11px] opacity-75">Pratinjau Shift Parsed:</span>
            <span
              className={`text-[11px] font-black ${
                validCount > 0
                  ? isPaperSketch
                    ? 'text-[#ff4747]'
                    : isWinamp
                    ? 'text-[#00FF00]'
                    : isVista
                    ? 'text-blue-600'
                    : 'text-teal-600 dark:text-teal-400'
                  : 'text-amber-500'
              }`}
            >
              {validCount} dari {daysInMonth} hari cocok
            </span>
          </div>

          <div
            className={`grid grid-cols-7 sm:grid-cols-10 gap-1.5 max-h-36 sm:max-h-44 overflow-y-auto p-2.5 overscroll-contain rounded-xl border ${
              isPaperSketch
                ? 'bg-white border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
                : isWinamp
                ? 'bg-black border border-zinc-800'
                : isDark
                ? 'bg-[#111111] border-white/10'
                : 'bg-[#F6F7F8] border-slate-200'
            }`}
          >
            {detectedShifts.map((item, idx) => {
              const isMatched = item.shift !== null;
              return (
                <div
                  key={`sched-excel-${item.day}-${idx}`}
                  className={`flex flex-col items-center justify-center p-1 rounded-[6px] border text-center transition-all ${
                    isMatched
                      ? isPaperSketch
                        ? 'border-2 border-[#2b2b2b] bg-white shadow-[1px_1px_0px_#2b2b2b]'
                        : isWinamp
                        ? 'border-[#00FF00]/60 bg-zinc-950 text-[#00FF00]'
                        : isLightMode
                        ? 'border-teal-300/80 dark:border-blue-300 bg-white shadow-2xs'
                        : 'border-white/20 bg-white/5'
                      : isPaperSketch
                      ? 'border border-dashed border-[#2b2b2b]/30 bg-transparent opacity-40'
                      : isWinamp
                      ? 'border-zinc-900 bg-transparent opacity-30 text-zinc-600'
                      : isLightMode
                      ? 'border-slate-300/50 bg-slate-200/40 opacity-50'
                      : 'border-white/5 bg-transparent opacity-40'
                  }`}
                >
                  <span className="text-[8.5px] font-bold opacity-75">Tgl {item.day}</span>
                  {isMatched && item.shift ? (
                    <span
                      className={`mt-0.5 px-1 py-0.2 rounded text-[9.5px] font-black leading-tight ${
                        SHIFT_COLORS[item.shift].bg
                      } ${SHIFT_COLORS[item.shift].text}`}
                    >
                      {item.shift}
                    </span>
                  ) : (
                    <span className="text-[9.5px] font-mono opacity-50 truncate max-w-full">
                      {item.raw ? item.raw.slice(0, 3) : '-'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});
