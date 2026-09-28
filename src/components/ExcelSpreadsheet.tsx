import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Spreadsheet, { Matrix } from 'react-spreadsheet';
import {
  Table,
  Sparkles,
  RotateCcw,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Copy,
  Info,
  Calendar,
  Layers,
  Palette,
  ChevronDown,
  Check,
} from 'lucide-react';
import { SHIFT_OPTIONS, ShiftType, SHIFT_COLORS, EXCEL_SHIFT_MAPPING, AppTheme, DayData } from '../types';

export const COLOR_TRANSPARENT_KEY = '__NO_COLOR__';

// Helper untuk normalisasi warna ke HEX 6-digit standar
export const normalizeColor = (colorStr?: string): string | null => {
  if (!colorStr) return null;
  const str = colorStr.trim().toLowerCase();
  if (
    str === 'transparent' ||
    str === 'rgba(0, 0, 0, 0)' ||
    str === 'rgba(0,0,0,0)' ||
    str === 'inherit' ||
    str === 'initial' ||
    str === 'none'
  ) {
    return null;
  }

  // Pure white or transparent white
  if (
    str === '#fff' ||
    str === '#ffffff' ||
    str === 'rgb(255, 255, 255)' ||
    str === 'rgb(255,255,255)' ||
    str === 'rgba(255, 255, 255, 1)' ||
    str === 'white'
  ) {
    return '#ffffff';
  }

  // Hex format
  if (str.startsWith('#')) {
    if (str.length === 4) {
      return `#${str[1]}${str[1]}${str[2]}${str[2]}${str[3]}${str[3]}`;
    }
    return str.slice(0, 7);
  }

  // RGB / RGBA format
  const rgbMatch = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2], 10).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3], 10).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  // Named HTML colors common in Excel
  const namedColors: Record<string, string> = {
    red: '#ff0000',
    green: '#008000',
    blue: '#0000ff',
    yellow: '#ffff00',
    orange: '#ffa500',
    purple: '#800080',
    cyan: '#00ffff',
    magenta: '#ff00ff',
    pink: '#ffc0cb',
    gray: '#808080',
    grey: '#808080',
    lightgray: '#d3d3d3',
    lightgrey: '#d3d3d3',
  };

  if (namedColors[str]) {
    return namedColors[str];
  }

  return str;
};

// Estimasi otomatis Shift berdasarkan warna sel Excel
export const guessShiftFromColor = (hexColor: string | null, cellText?: string): ShiftType | null => {
  // 1. Cek teks sel secara presisi menggunakan mapping resmi EXCEL_SHIFT_MAPPING
  if (cellText) {
    const clean = cellText.trim().toUpperCase();
    if (EXCEL_SHIFT_MAPPING[clean]) return EXCEL_SHIFT_MAPPING[clean];
    const directMatch = SHIFT_OPTIONS.find((s) => s.toUpperCase() === clean);
    if (directMatch) return directMatch;
  }

  // Untuk sel tanpa warna latar (transparan atau putih bersih)
  if (!hexColor || hexColor === '#ffffff' || hexColor === COLOR_TRANSPARENT_KEY) {
    return null;
  }

  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return null;

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // 1. Merah / Pink / Coral / Rose -> OFF
  if (r > 180 && g < 160 && b < 160) return 'OFF';
  if (r > 200 && (r - g > 40) && (r - b > 40)) return 'OFF';

  // 2. Ungu / Magenta / Lilac -> CUTI
  if (r > 150 && b > 150 && g < 150) return 'CUTI';
  if (r > 190 && b > 180 && g < 180) return 'CUTI';

  // 3. Biru / Indigo / Navy / Sky -> PM atau TPSL
  if (b > 170 && b > r + 30 && b > g + 20) return 'PM';
  if (b > 140 && g > 120 && r < 120) return 'TPSL';

  // 4. Hijau / Mint / Teal / Lime -> Graha atau NPCT atau SM
  if (g > 160 && g > r + 20 && g > b + 20) return 'SM';
  if (g > 140 && b > 140 && r < 120) return 'Graha';
  if (g > 130 && r > 130 && b < 100) return 'NPCT';

  // 5. Kuning / Amber / Oranye -> SM
  if (r > 200 && g > 170 && b < 140) return 'SM';
  if (r > 210 && g > 130 && b < 100) return 'PM';

  // 6. Abu-abu gelap / Gelap -> Malam
  if (r < 100 && g < 100 && b < 100 && (r + g + b > 50)) return 'Malam';

  return null;
};

// Fungsi helper untuk membersihkan inline CSS agar tidak terjadi benturan React shorthand property
export const parseInlineStyle = (cssText: string): React.CSSProperties => {
  const styleObj: Record<string, string> = {};
  if (!cssText) return styleObj;

  cssText.split(';').forEach((rule) => {
    const [property, value] = rule.split(':');
    if (property && value) {
      const propLower = property.trim().toLowerCase();
      // Cegah konflik border individual vs border shorthand
      if (
        propLower.startsWith('border-top') ||
        propLower.startsWith('border-right') ||
        propLower.startsWith('border-bottom') ||
        propLower.startsWith('border-left') ||
        propLower.startsWith('mso-') ||
        propLower.startsWith('vnd.')
      ) {
        return;
      }
      const camelCaseProp = propLower.replace(/-./g, (c) => c.toUpperCase().replace('-', ''));
      styleObj[camelCaseProp] = value.trim();
    }
  });
  return styleObj as React.CSSProperties;
};

// Fungsi helper untuk mengekstrak class-based styles dari tag <style> bawaan Excel
export const parseExcelStylesheet = (doc: Document): Record<string, React.CSSProperties> => {
  const stylesMap: Record<string, React.CSSProperties> = {};
  const styleElement = doc.querySelector('style');
  if (!styleElement) return stylesMap;

  const cssText = styleElement.textContent || '';
  const regex = /\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(cssText)) !== null) {
    const className = match[1];
    const properties = match[2];
    stylesMap[className] = parseInlineStyle(properties);
  }
  return stylesMap;
};

export interface ExcelCellData {
  value: string;
  style?: React.CSSProperties;
  raw?: string;
  bgColor?: string | null;
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
  isNoColor?: boolean;
  count: number;
  assignedShift: ShiftType | '';
  sampleText?: string;
}

interface ExcelSpreadsheetProps {
  selectedYear: number;
  selectedMonth: number;
  daysInMonth: number;
  theme?: AppTheme;
  onParsedShiftsChange?: (matchedDays: MatchedDayShift[], validCount: number) => void;
  onApplyDirect?: (updates: Record<string, Partial<DayData>>) => void;
}

export const ExcelSpreadsheet: React.FC<ExcelSpreadsheetProps> = ({
  selectedYear,
  selectedMonth,
  daysInMonth,
  theme = 'default',
  onParsedShiftsChange,
}) => {
  const isWinamp = theme === 'winamp';
  const isDarkFluid = theme === 'darkFluid';
  const isDark = theme === 'dark';
  const isVista = theme === 'vista';
  const isPaperSketch = theme === 'paperSketch';

  // Inisialisasi grid kosong awal
  const createDefaultGrid = useCallback((): ExcelCellData[][] => {
    return Array(6)
      .fill(null)
      .map((_, rIdx) =>
        Array(Math.max(31, daysInMonth))
          .fill(null)
          .map((_, cIdx) => ({
            value: rIdx === 0 ? `${cIdx + 1}` : '',
            style: rIdx === 0 ? { fontWeight: 'bold', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.03)' } : {},
            bgColor: null,
          }))
      );
  }, [daysInMonth]);

  const [gridData, setGridData] = useState<ExcelCellData[][]>(createDefaultGrid);
  const [hasPastedData, setHasPastedData] = useState(false);
  const [viewMode, setViewMode] = useState<'styled_table' | 'interactive_matrix'>('styled_table');

  // State untuk Pemetaan Warna Kustom (Warna Excel / Kategori Polos -> Shift)
  const [customColorMap, setCustomColorMap] = useState<Record<string, ShiftType | ''>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const onParsedShiftsChangeRef = useRef(onParsedShiftsChange);
  onParsedShiftsChangeRef.current = onParsedShiftsChange;

  // Helper untuk normalisasi kode shift dari teks murni sel
  // Mengikuti EXCEL_SHIFT_MAPPING resmi sistem: G->Graha, L->TPSL, N->NPCT, OFF->OFF, SM->SM, PM->PM, M->Malam, C/CT->CUTI
  const matchShiftCode = useCallback((cellVal: string): ShiftType | null => {
    if (!cellVal) return null;
    const clean = cellVal.trim().toUpperCase();
    if (!clean) return null;

    // 1. Cek pemetaan resmi EXCEL_SHIFT_MAPPING
    if (EXCEL_SHIFT_MAPPING[clean] !== undefined) {
      return EXCEL_SHIFT_MAPPING[clean] || null;
    }

    // 2. Cek kecocokan langsung dengan nama shift
    const found = SHIFT_OPTIONS.find((opt) => opt.toUpperCase() === clean);
    if (found) return found;

    // 3. Cek awalan nama shift jika panjang > 2 karakter (seperti GRAHA-A, MALAM-1)
    if (clean.length > 2) {
      for (const opt of SHIFT_OPTIONS) {
        if (clean.startsWith(opt.toUpperCase())) {
          return opt;
        }
      }
    }
    return null;
  }, []);

  // Kumpulkan seluruh warna unik yang ditemukan dari data grid yang di-paste
  // Termasuk sel TANPA WARNA (polos/putih) agar muncul di daftar pemetaan
  const detectedColorsList = useMemo((): DetectedColorItem[] => {
    if (!gridData || gridData.length === 0 || !hasPastedData) return [];
    const map = new Map<string, { count: number; sampleText?: string; isNoColor: boolean }>();

    gridData.forEach((row) => {
      row.forEach((cell) => {
        const bg = cell.bgColor;
        const isNoColor = !bg || bg === '#ffffff';
        const colorKey = isNoColor ? COLOR_TRANSPARENT_KEY : bg;

        const prev = map.get(colorKey) || { count: 0, sampleText: cell.value, isNoColor };
        map.set(colorKey, {
          count: prev.count + 1,
          sampleText: prev.sampleText || cell.value,
          isNoColor,
        });
      });
    });

    const items: DetectedColorItem[] = [];
    map.forEach((val, colorKey) => {
      const assigned =
        customColorMap[colorKey] !== undefined
          ? customColorMap[colorKey]
          : guessShiftFromColor(val.isNoColor ? null : colorKey, val.sampleText) || '';
      items.push({
        color: colorKey,
        isNoColor: val.isNoColor,
        count: val.count,
        assignedShift: assigned,
        sampleText: val.sampleText,
      });
    });

    // Urutkan: warna terwarnai dulu baru kemudian kategori tanpa warna
    return items.sort((a, b) => (a.isNoColor ? 1 : 0) - (b.isNoColor ? 1 : 0));
  }, [gridData, customColorMap, hasPastedData]);

  // Algorithm cerdas: memindai grid data + teks + warna sel dan mendeteksi jadwal tanggal 1 s.d. daysInMonth
  const { detectedShifts, validCount } = useMemo(() => {
    if (!gridData || gridData.length === 0) {
      return { detectedShifts: [], validCount: 0 };
    }

    // Helper untuk resolve shift pada satu sel:
    // ATURAN:
    // 1. Cek teks sel terlebih dahulu dengan matchShiftCode (misal G->Graha, L->TPSL, N->NPCT, OFF->OFF, SM->SM, PM->PM, M->Malam, C->CUTI). Jika cocok, teks SELALU diprioritaskan.
    // 2. Cek custom color map yang dipilih pengguna (termasuk untuk sel dengan warna tertentu atau sel polos tanpa warna).
    // 3. Jika sel BERWARNA dan teks bukan kode shift baku, gunakan perkiraan warna (guessShiftFromColor).
    // 4. Jika sel TANPA WARNA dan tidak ada teks kode shift yang cocok, MAKA TIDAK MASUK HITUNGAN (null).
    const resolveCellShift = (
      cell?: ExcelCellData
    ): { shift: ShiftType | null; detectedBy: 'text' | 'color' | 'custom_map' | 'none' } => {
      if (!cell) return { shift: null, detectedBy: 'none' };
      const cellBg = cell.bgColor;
      const isNoColor = !cellBg || cellBg === '#ffffff';
      const colorKey = isNoColor ? COLOR_TRANSPARENT_KEY : cellBg;

      // 1. Cek jika teks dalam sel merupakan kode shift yang valid (misal: G, L, N, OFF, SM, PM, M, C, dll.)
      const textMatch = matchShiftCode(cell.value);
      if (textMatch) {
        return { shift: textMatch, detectedBy: 'text' };
      }

      // 2. Cek jika pengguna mengatur mapping warna/kategori ini secara manual
      if (customColorMap[colorKey] !== undefined && customColorMap[colorKey] !== '') {
        return { shift: customColorMap[colorKey] as ShiftType, detectedBy: 'custom_map' };
      }

      // 3. Jika sel BERWARNA (ada warna latar nyata), gunakan estimasi otomatis dari warna
      if (!isNoColor && cellBg) {
        const colorMatch = guessShiftFromColor(cellBg, cell.value);
        if (colorMatch) {
          return { shift: colorMatch, detectedBy: 'color' };
        }
      }

      // 4. Jika sel TANPA WARNA dan TANPA KODE/SINGKATAN TEKS VALID -> Tidak masuk hitungan
      return { shift: null, detectedBy: 'none' };
    };

    // Evaluasi 1: Cari baris yang paling banyak mengandung kecocokan shift
    let bestRowIndex = -1;
    let maxShiftsInRow = 0;

    gridData.forEach((row, rIdx) => {
      let count = 0;
      row.forEach((cell) => {
        const { shift } = resolveCellShift(cell);
        if (shift) {
          count++;
        }
      });

      if (count > maxShiftsInRow) {
        maxShiftsInRow = count;
        bestRowIndex = rIdx;
      }
    });

    // Evaluasi 2: Cari kolom jika tabel dalam format vertikal
    let bestColIndex = -1;
    let maxShiftsInCol = 0;
    const numCols = Math.max(...gridData.map((r) => r.length));

    for (let c = 0; c < numCols; c++) {
      let count = 0;
      for (let r = 0; r < gridData.length; r++) {
        const cell = gridData[r]?.[c];
        if (cell) {
          const { shift } = resolveCellShift(cell);
          if (shift) {
            count++;
          }
        }
      }
      if (count > maxShiftsInCol) {
        maxShiftsInCol = count;
        bestColIndex = c;
      }
    }

    const results: MatchedDayShift[] = [];
    let totalValid = 0;

    if (maxShiftsInRow >= maxShiftsInCol && bestRowIndex !== -1 && maxShiftsInRow > 0) {
      // Horizontal mapping
      const targetRow = gridData[bestRowIndex] || [];
      for (let day = 1; day <= daysInMonth; day++) {
        const cell = targetRow[day - 1];
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
      }
    } else if (maxShiftsInCol > 0 && bestColIndex !== -1) {
      // Vertical mapping
      const colCells = gridData.map((r) => r[bestColIndex]);
      for (let day = 1; day <= daysInMonth; day++) {
        const cell = colCells[day - 1];
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
      }
    } else {
      for (let day = 1; day <= daysInMonth; day++) {
        results.push({
          day,
          shift: null,
          raw: '',
          detectedBy: 'none',
        });
      }
    }

    return { detectedShifts: results, validCount: totalValid };
  }, [gridData, daysInMonth, matchShiftCode, customColorMap]);

  // Beritahu parent secara aman saat hasil deteksi berubah (hanya jika ada perubahan nilai)
  const lastEmittedRef = useRef<string>('');
  useEffect(() => {
    const key = `${validCount}-${detectedShifts.map((d) => `${d.day}:${d.shift || '-'}`).join(',')}`;
    if (lastEmittedRef.current !== key) {
      lastEmittedRef.current = key;
      onParsedShiftsChangeRef.current?.(detectedShifts, validCount);
    }
  }, [detectedShifts, validCount]);

  // Handler utama tempel (Paste) clipboard Excel
  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();

    // 1. Ambil data format HTML dari clipboard (Excel menyertakan stylesheet dan table tags)
    const htmlData = event.clipboardData.getData('text/html');

    if (htmlData) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlData, 'text/html');

        // Ekstrak stylesheet internal jika Excel menggunakan class-based style
        const excelStyles = parseExcelStylesheet(doc);

        const rows = doc.querySelectorAll('tr');
        if (rows.length > 0) {
          const parsedRows: ExcelCellData[][] = Array.from(rows).map((row) => {
            const cells = row.querySelectorAll('td, th');
            return Array.from(cells).map((cell) => {
              let combinedStyle: React.CSSProperties = {};
              cell.classList.forEach((className) => {
                if (excelStyles[className]) {
                  combinedStyle = { ...combinedStyle, ...excelStyles[className] };
                }
              });

              // Inline style attribute
              const inlineStyleStr = cell.getAttribute('style') || '';
              const inlineStyleObj = parseInlineStyle(inlineStyleStr);
              combinedStyle = { ...combinedStyle, ...inlineStyleObj };

              // Check bgcolor attribute
              const bgcolorAttr = cell.getAttribute('bgcolor');
              if (bgcolorAttr && !combinedStyle.backgroundColor) {
                combinedStyle.backgroundColor = bgcolorAttr;
              }

              // Bersihkan properti CSS Excel yang tidak kompatibel atau berkonflik
              const cleanStyle: Record<string, any> = {};
              Object.keys(combinedStyle).forEach((key) => {
                if (
                  !key.startsWith('mso') &&
                  !key.startsWith('vnd') &&
                  !key.startsWith('borderTop') &&
                  !key.startsWith('borderRight') &&
                  !key.startsWith('borderBottom') &&
                  !key.startsWith('borderLeft')
                ) {
                  cleanStyle[key] = (combinedStyle as any)[key];
                }
              });

              const cellText = (cell as HTMLElement).innerText?.trim() || cell.textContent?.trim() || '';
              const rawBg = cleanStyle.backgroundColor || cleanStyle.background || bgcolorAttr;
              const normalizedBg = normalizeColor(rawBg);

              return {
                value: cellText,
                style: cleanStyle as React.CSSProperties,
                raw: cellText,
                bgColor: normalizedBg,
              };
            });
          });

          setGridData(parsedRows);
          setHasPastedData(true);
          return;
        }
      } catch (err) {
        console.warn('Gagal mem-parsing HTML table Excel, beralih ke teks biasa:', err);
      }
    }

    // 2. Fallback jika yang di-paste teks biasa (Plain Text)
    const textData = event.clipboardData.getData('text');
    if (textData) {
      const lines = textData.replace(/\r/g, '').trim().split('\n');
      const parsedRows: ExcelCellData[][] = lines.map((line) => {
        let rawCells = line.split('\t');
        if (rawCells.length <= 1 && line.includes(';')) {
          rawCells = line.split(';');
        } else if (rawCells.length <= 1 && line.includes(',')) {
          rawCells = line.split(',');
        }
        return rawCells.map((cell) => ({
          value: cell.trim(),
          style: {},
          raw: cell.trim(),
          bgColor: null,
        }));
      });

      setGridData(parsedRows);
      setHasPastedData(true);
    }
  };

  // Ubah pemetaan warna tertentu ke shift tertentu
  const handleColorMapChange = (colorKey: string, shift: ShiftType | '') => {
    setCustomColorMap((prev) => ({
      ...prev,
      [colorKey]: shift,
    }));
  };

  // Contoh template jadwal Excel instan untuk demo
  const loadExampleTemplate = () => {
    const exampleConfigs: { shift: ShiftType; bg: string; color: string; textVal?: string }[] = [
      { shift: 'Graha', bg: '#ccfbf1', color: '#115e59', textVal: 'G' },
      { shift: 'NPCT', bg: '#dcfce7', color: '#166534', textVal: 'N' },
      { shift: 'TPSL', bg: '#e0f2fe', color: '#075985', textVal: 'L' },
      { shift: 'OFF', bg: '#fee2e2', color: '#991b1b', textVal: 'OFF' },
      { shift: 'SM', bg: '#fef3c7', color: '#92400e', textVal: 'SM' },
      { shift: 'PM', bg: '#e0e7ff', color: '#3730a3', textVal: 'PM' },
      { shift: 'Malam', bg: '#f1f5f9', color: '#334155', textVal: 'M' },
      { shift: 'CUTI', bg: '#f3e8ff', color: '#6b21a8', textVal: 'C' },
    ];

    const rowDates: ExcelCellData[] = [];
    const rowShifts: ExcelCellData[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const item = exampleConfigs[(d - 1) % exampleConfigs.length];

      rowDates.push({
        value: `Tgl ${d}`,
        style: { fontWeight: 'bold', textAlign: 'center', backgroundColor: '#e2e8f0', color: '#1e293b' },
        bgColor: '#e2e8f0',
      });

      rowShifts.push({
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

    setGridData([rowDates, rowShifts]);
    setHasPastedData(true);
  };

  const handleReset = () => {
    setGridData(createDefaultGrid());
    setHasPastedData(false);
    setCustomColorMap({});
  };

  // Konversi data ke format react-spreadsheet Matrix
  const spreadsheetMatrix: Matrix<{ value: string }> = useMemo(
    () => gridData.map((row) => row.map((cell) => ({ value: cell.value }))),
    [gridData]
  );

  const handleSpreadsheetChange = (newMatrix: Matrix<{ value: string }>) => {
    const updatedGrid: ExcelCellData[][] = newMatrix.map((row, rIdx) =>
      row.map((cell, cIdx) => ({
        value: cell?.value != null ? String(cell.value) : '',
        style: gridData[rIdx]?.[cIdx]?.style || {},
        bgColor: gridData[rIdx]?.[cIdx]?.bgColor || null,
      }))
    );
    setGridData(updatedGrid);
    setHasPastedData(true);
  };

  return (
    <div className="w-full flex flex-col space-y-3 select-none">
      {/* Control Bar: Mode Tampilan & Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => setViewMode('styled_table')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
              viewMode === 'styled_table'
                ? isPaperSketch
                  ? 'bg-[#ff4747] text-white border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                  : isWinamp
                  ? 'bg-[#00FF00] text-black border-[#00FF00]'
                  : 'bg-teal-600 text-white border-teal-700 shadow-xs'
                : isPaperSketch
                ? 'bg-white text-[#2b2b2b] border-2 border-[#2b2b2b] hover:bg-[#2ec4b6]/20'
                : isWinamp
                ? 'bg-black text-[#00FF00] border-zinc-800 hover:border-[#00FF00]'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Format Excel Berwarna</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('interactive_matrix')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
              viewMode === 'interactive_matrix'
                ? isPaperSketch
                  ? 'bg-[#ff4747] text-white border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                  : isWinamp
                  ? 'bg-[#00FF00] text-black border-[#00FF00]'
                  : 'bg-teal-600 text-white border-teal-700 shadow-xs'
                : isPaperSketch
                ? 'bg-white text-[#2b2b2b] border-2 border-[#2b2b2b] hover:bg-[#2ec4b6]/20'
                : isWinamp
                ? 'bg-black text-[#00FF00] border-zinc-800 hover:border-[#00FF00]'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Grid Interaktif</span>
          </button>
        </div>

        <div className="flex items-center space-x-1.5">
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
            <span>Contoh Format</span>
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
            title="Bersihkan isi tabel"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Interactive Paste & Spreadsheet Canvas */}
      <div
        ref={containerRef}
        tabIndex={0}
        onPaste={handlePaste}
        className={`w-full overflow-auto rounded-xl border transition-all focus:outline-none focus:ring-2 ${
          isPaperSketch
            ? 'bg-white border-2 border-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b] focus:ring-[#ff4747]'
            : isWinamp
            ? 'bg-[#0a0a0a] border-2 border-zinc-700 font-mono text-[#00FF00] focus:ring-[#00FF00]'
            : isDarkFluid
            ? 'bg-[#141218] border-white/10 text-[#E6E0E9] focus:ring-[#D0BCFF]'
            : isDark
            ? 'bg-[#121212] border-slate-800 text-slate-100 focus:ring-teal-500'
            : isVista
            ? 'bg-white/80 backdrop-blur-md border-sky-300 text-slate-900 focus:ring-sky-500'
            : 'bg-white border-slate-300 text-slate-900 focus:ring-teal-500'
        } max-h-[240px] sm:max-h-[280px] custom-scrollbar relative p-1.5`}
      >
        {!hasPastedData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-transparent pointer-events-none z-10 opacity-75">
            <div className="p-3 rounded-full bg-teal-500/10 dark:bg-teal-400/10 text-teal-600 dark:text-teal-400 mb-2">
              <Copy className="w-6 h-6 animate-pulse" />
            </div>
            <p className="text-xs sm:text-sm font-bold">
              Klik area ini lalu tekan{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-xs font-black">
                Ctrl + V
              </kbd>
            </p>
            <p className="text-[11px] opacity-75 max-w-sm mt-0.5">
              Salin sel jadwal dari Excel. Sel berwarna maupun tanpa warna akan otomatis terdeteksi dan dapat dipetakan langsung ke kode shift!
            </p>
          </div>
        )}

        {viewMode === 'styled_table' ? (
          <table className="w-full border-collapse text-xs select-text">
            <tbody>
              {gridData.map((row, rIdx) => (
                <tr key={`excel-row-${rIdx}`} className="border-b border-current/10 last:border-b-0">
                  {row.map((cell, cIdx) => (
                    <td
                      key={`excel-cell-${rIdx}-${cIdx}`}
                      style={{
                        padding: '6px 10px',
                        minWidth: '58px',
                        height: '28px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        ...cell.style,
                      }}
                      className={`transition-colors hover:brightness-95 border ${
                        isWinamp ? 'border-zinc-800' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {cell.value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="w-full overflow-x-auto">
            <Spreadsheet
              data={spreadsheetMatrix}
              onChange={handleSpreadsheetChange}
              hideRowIndicators={false}
              hideColumnIndicators={false}
            />
          </div>
        )}
      </div>

      {/* PANEL PEMETAAN WARNA & KATEGORI EXCEL ➔ SHIFT (Muncul jika ada data yang di-paste) */}
      {detectedColorsList.length > 0 && (
        <div
          className={`p-2.5 rounded-xl border space-y-2 ${
            isPaperSketch
              ? 'bg-white border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
              : isWinamp
              ? 'bg-black border border-zinc-700 text-[#00FF00]'
              : isDark
              ? 'bg-slate-900 border-slate-800'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center space-x-1.5">
              <Palette className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Pemetaan Warna Excel ➔ Shift:</span>
            </div>
            <span className="text-[10px] font-normal opacity-75">
              {detectedColorsList.length} Kategori Warna & Polos Terdeteksi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {detectedColorsList.map((item) => {
              const currentShift = item.assignedShift;
              const shiftStyle = currentShift ? SHIFT_COLORS[currentShift] : null;

              return (
                <div
                  key={`color-item-${item.color}`}
                  className={`flex items-center justify-between p-1.5 rounded-lg border gap-2 text-xs ${
                    isPaperSketch
                      ? 'bg-[#f2efeb] border-2 border-[#2b2b2b]'
                      : isWinamp
                      ? 'bg-zinc-900 border-zinc-800 text-[#00FF00]'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {/* Swatch Kotak Warna Excel atau Kotak Tanpa Warna */}
                  <div className="flex items-center space-x-1.5 min-w-0">
                    {item.isNoColor ? (
                      <div
                        className="w-5 h-5 rounded-[4px] border border-dashed border-slate-400 bg-white dark:bg-slate-900 shrink-0 shadow-2xs flex items-center justify-center font-bold text-[8px] text-slate-500"
                        title="Sel Tanpa Warna Latar (Polos / Putih)"
                      >
                        Polos
                      </div>
                    ) : (
                      <div
                        className="w-5 h-5 rounded-[4px] border border-black/20 shrink-0 shadow-2xs flex items-center justify-center font-bold text-[9px]"
                        style={{ backgroundColor: item.color }}
                        title={`Hex: ${item.color}`}
                      />
                    )}

                    <div className="min-w-0">
                      <span className="block text-[11px] font-bold truncate">
                        {item.isNoColor
                          ? 'Tanpa Warna (Polos)'
                          : item.sampleText
                          ? `"${item.sampleText}"`
                          : item.color}
                      </span>
                      <span className="block text-[9.5px] opacity-60">
                        {item.count} sel
                      </span>
                    </div>
                  </div>

                  {/* Dropdown Pemilih Shift untuk Kategori Warna Ini */}
                  <select
                    value={currentShift}
                    onChange={(e) => handleColorMapChange(item.color, e.target.value as ShiftType | '')}
                    className={`text-xs font-bold py-1 px-1.5 rounded-md border cursor-pointer outline-none shrink-0 ${
                      currentShift && shiftStyle
                        ? `${shiftStyle.bg || 'bg-teal-500'} ${shiftStyle.text || 'text-white'} border-current/20`
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <option value="">{item.isNoColor ? '(Abaikan jika kosong)' : '(Abaikan)'}</option>
                    {SHIFT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Bar Deteksi Otomatis Jadwal */}
      <div
        className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
          validCount > 0
            ? isPaperSketch
              ? 'bg-[#2ec4b6]/20 border-2 border-[#2b2b2b] text-[#2b2b2b]'
              : isWinamp
              ? 'bg-black border border-[#00FF00] text-[#00FF00]'
              : 'bg-teal-500/10 dark:bg-teal-950/40 border-teal-500/30 text-teal-800 dark:text-teal-200'
            : isPaperSketch
            ? 'bg-white border-2 border-dashed border-[#2b2b2b] text-[#2b2b2b]/70'
            : isWinamp
            ? 'bg-black border border-zinc-800 text-zinc-400'
            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
        }`}
      >
        <div className="flex items-center space-x-2 min-w-0">
          {validCount > 0 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          <div className="min-w-0">
            <span className="font-bold block truncate">
              {validCount > 0
                ? `${validCount} Hari Shift Berhasil Terdeteksi Otomatis (Teks & Warna)!`
                : 'Belum ada kode shift / warna yang cocok dari tabel Excel'}
            </span>
            <span className="text-[10.5px] opacity-80 block truncate">
              Bulan {selectedMonth}/{selectedYear} ({daysInMonth} Hari)
            </span>
          </div>
        </div>

        {validCount > 0 && (
          <div className="flex items-center space-x-1.5 self-end sm:self-auto shrink-0">
            <span className="text-[10.5px] font-semibold opacity-75">Tinjauan:</span>
            <span
              className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                isPaperSketch
                  ? 'bg-[#ff4747] text-white border border-[#2b2b2b]'
                  : isWinamp
                  ? 'bg-[#00FF00] text-black font-mono'
                  : 'bg-teal-600 text-white shadow-2xs'
              }`}
            >
              {Math.round((validCount / daysInMonth) * 100)}% Lengkap
            </span>
          </div>
        )}
      </div>

      {/* Realtime Detection Preview Strip (Peta Jadwal Tanggal 1 s.d. Akhir Bulan) */}
      {detectedShifts.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold px-0.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Pemetaan Tanggal Otomatis (1 - {daysInMonth}):</span>
            </span>
            <span className="text-[10px] font-normal opacity-70">
              {validCount}/{daysInMonth} Terisi
            </span>
          </div>

          <div
            className={`p-2 rounded-xl border flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth ${
              isPaperSketch
                ? 'bg-[#f2efeb] border-2 border-[#2b2b2b]'
                : isWinamp
                ? 'bg-black border border-zinc-800'
                : 'bg-slate-100/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800'
            }`}
          >
            {detectedShifts.map((item) => {
              const hasShift = Boolean(item.shift);
              const colorInfo = item.shift ? SHIFT_COLORS[item.shift] : null;

              return (
                <div
                  key={`detected-shift-chip-${item.day}`}
                  className={`flex flex-col items-center justify-between p-1 rounded-lg shrink-0 w-[42px] sm:w-[46px] border text-center transition-all ${
                    hasShift
                      ? isPaperSketch
                        ? 'bg-white border-2 border-[#2b2b2b] shadow-[1.5px_1.5px_0px_#2b2b2b]'
                        : isWinamp
                        ? 'bg-zinc-900 border-[#00FF00]/50 text-[#00FF00]'
                        : `${colorInfo?.bg || 'bg-teal-50 dark:bg-teal-950/60'} border-slate-300 dark:border-slate-700`
                      : isPaperSketch
                      ? 'bg-white/60 border border-dashed border-[#2b2b2b]/40 text-[#2b2b2b]/50'
                      : isWinamp
                      ? 'bg-zinc-950 border-zinc-900 text-zinc-600'
                      : 'bg-slate-200/50 dark:bg-slate-800/40 border-slate-300/40 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-0.5 justify-center">
                    <span className="text-[10px] font-black opacity-80 leading-none">
                      {item.day}
                    </span>
                    {item.bgColor && item.bgColor !== '#ffffff' && (
                      <span
                        className="w-1.5 h-1.5 rounded-full inline-block shrink-0 border border-black/20"
                        style={{ backgroundColor: item.bgColor }}
                        title={`Warna Excel: ${item.bgColor}`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-[10px] sm:text-[11px] font-black leading-tight truncate w-full ${
                      hasShift
                        ? colorInfo?.text || 'text-slate-900 dark:text-white'
                        : 'opacity-40'
                    }`}
                  >
                    {item.shift || '-'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
