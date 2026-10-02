import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
    FileSpreadsheet,
    Calendar,
    Users,
    Check,
    CheckSquare,
    Square,
    AlertCircle,
    Info,
    Building2,
    Layers,
    Clock,
    Sparkles,
    Send,
    Database,
    CheckCircle2,
    ClipboardPaste,
    RotateCcw,
    FileText,
    Upload,
    Table,
    Shuffle,
    Save,
    Palette,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { UserAccount, ScheduleCopyTarget } from '../../types/admin';
import { DayData, AppTheme, ShiftType, SHIFT_COLORS, EXCEL_SHIFT_MAPPING, SHIFT_OPTIONS } from '../../types';
import { SYSTEM_DEFAULT_EXCEL_MAP } from '../../data/excelMappings';
import { getCurrentUserPermissions } from '../../utils/adminStorage';
import {
    loadSavedExcelColorMap,
    saveExcelColorMap,
    normalizeColor,
    guessShiftFromColor,
    parseInlineStyle,
    parseExcelStylesheet,
} from '../ExcelSpreadsheet';

// Helper normalisasi kode shift dari teks
export const matchShiftCode = (cellVal: string): ShiftType | null => {
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

    const directMatch = SHIFT_OPTIONS.find((s) => s.toUpperCase() === clean);
    if (directMatch) return directMatch;

    return null;
};

// Fungsi terpadu untuk mem-parsing HTML tabel dari Excel / Google Sheets ke format 2D dengan mempertahankan format gaya warna
export const parseExcelHtmlTo2DCells = (htmlText: string): { value: string; bgColor: string | null; textColor: string | null }[][] => {
    const matrix: { value: string; bgColor: string | null; textColor: string | null }[][] = [];
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const excelStyles = parseExcelStylesheet(doc);
        const rows = doc.querySelectorAll('tr');

        if (rows.length > 0) {
            Array.from(rows).forEach((row) => {
                const rowBg = row.getAttribute('bgcolor');
                const cells = row.querySelectorAll('td, th');
                const rowCells: { value: string; bgColor: string | null; textColor: string | null }[] = [];
                
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

                    // 5. Cek seluruh child element di dalam sel
                    const styledChildren = cell.querySelectorAll('span, b, strong, font, p, div, em, i, u');
                    styledChildren.forEach((child) => {
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

                    rowCells.push({
                        value: cellText,
                        bgColor: finalBg,
                        textColor: normalizedTextColor,
                    });
                });
                if (rowCells.length > 0) {
                    matrix.push(rowCells);
                }
            });
        }
    } catch (err) {
        console.warn('Gagal mem-parsing HTML table Excel:', err);
    }
    return matrix;
};

interface AdminScheduleBroadcastTabProps {
    users: UserAccount[];
    daysState: Record<string, DayData>;
    onShowToast: (msg: string) => void;
    theme?: AppTheme;
}

export interface BroadcastGridCell {
    value: string;
    bgColor?: string | null;
    textColor?: string | null;
}

const TOTAL_GRID_ROWS = 150;
const TOTAL_GRID_COLS = 40;

const MONTH_NAMES_ID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const DAY_NAMES_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// Convert RGB/RGBA/HEX color string to standardized 6-digit hex
function parseColorToHex(colorStr: string): string | null {
    if (!colorStr) return null;
    const clean = colorStr.trim().toLowerCase();
    if (clean.startsWith('#')) {
        if (clean.length === 4) {
            return `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}`;
        }
        return clean.slice(0, 7);
    }
    const rgbMatch = clean.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1], 10).toString(16).padStart(2, '0');
        const g = parseInt(rgbMatch[2], 10).toString(16).padStart(2, '0');
        const b = parseInt(rgbMatch[3], 10).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }
    return null;
}

// Convert raw text or color to recognized ShiftType (supporting custom map, full system map & RGB heuristics)
export function resolveShiftFromCell(
    rawText: string,
    colorHex?: string | null,
    customMap?: Record<string, ShiftType | ''>,
    textColorHex?: string | null
): ShiftType | '' {
    const textClean = (rawText || '').replace(/\u00a0/g, ' ').trim().toUpperCase();

    // Deteksi tipe data sesuai spesifikasi:
    // Nama: Karakter lebih dari 5 (kecuali nama shift seperti 'GRAHA', 'MALAM')
    // NIP: berupa angka 18 digit
    const isNip = /^\d{18}$/.test(textClean);
    const isNamaNonShift = textClean.length > 5 && !['MALAM', 'GRAHA'].includes(textClean);

    // Jika berupa Nama atau NIP (bukan shift), abaikan dan kembalikan kosong!
    if (isNamaNonShift || isNip) {
        return '';
    }

    const normalizedBg = normalizeColor(colorHex);
    const normalizedTextCol = normalizeColor(textColorHex);
    const hasRealBg = normalizedBg && 
                      normalizedBg !== '#ffffff' && 
                      normalizedBg !== '#fff' && 
                      normalizedBg !== 'transparent';

    // 1. PRIORITAS UTAMA: Aturan Warna Latar Kustom Pengguna
    if (hasRealBg && customMap && customMap[normalizedBg] !== undefined) {
        return customMap[normalizedBg];
    }

    // 2. Aturan Warna Teks Kustom (Font Color)
    if (normalizedTextCol && customMap && customMap[`TEXT_COLOR_${normalizedTextCol}`] !== undefined) {
        return customMap[`TEXT_COLOR_${normalizedTextCol}`];
    }

    // 3. Aturan Kode Teks Kustom (misal TEXT_P, TEXT_O, TEXT_G)
    if (textClean && customMap && customMap[`TEXT_${textClean}`] !== undefined) {
        return customMap[`TEXT_${textClean}`];
    }

    // 4. Sistem Kamus Bawaan (SYSTEM_DEFAULT_EXCEL_MAP) untuk Warna Latar
    if (hasRealBg && SYSTEM_DEFAULT_EXCEL_MAP[normalizedBg]) {
        return SYSTEM_DEFAULT_EXCEL_MAP[normalizedBg];
    }

    // 5. Sistem Kamus Bawaan untuk Font Color
    if (normalizedTextCol && SYSTEM_DEFAULT_EXCEL_MAP[`TEXT_COLOR_${normalizedTextCol}`]) {
        return SYSTEM_DEFAULT_EXCEL_MAP[`TEXT_COLOR_${normalizedTextCol}`];
    }

    // 6. Sistem Kamus Bawaan untuk Kode Teks (misal TEXT_P -> PM)
    if (textClean && SYSTEM_DEFAULT_EXCEL_MAP[`TEXT_${textClean}`]) {
        return SYSTEM_DEFAULT_EXCEL_MAP[`TEXT_${textClean}`];
    }

    // 7. Match Shift Code dari Teks (EXCEL_SHIFT_MAPPING / Aliases / 'P' -> 'PM')
    if (textClean) {
        const matched = matchShiftCode(textClean);
        if (matched) return matched;
    }

    // 8. Estimasi Spektrum RGB Warna (guessShiftFromColor)
    if (hasRealBg) {
        const guessed = guessShiftFromColor(normalizedBg, rawText);
        if (guessed) return guessed;
    }
    if (normalizedTextCol) {
        const guessed = guessShiftFromColor(normalizedTextCol, rawText);
        if (guessed) return guessed;
    }

    // 9. Jika ada mapping untuk warna putih/default
    if (normalizedBg && customMap && customMap[normalizedBg] !== undefined) {
        return customMap[normalizedBg];
    }

    // Hanya jika benar-benar merupakan format teks shift yang valid (1-5 karakter) barulah default 'Graha'
    const isShiftText = textClean.length >= 1 && textClean.length <= 5;
    return isShiftText ? 'Graha' : '';
}

import { Checkbox } from '../ui/Checkbox';

const GridCell = React.memo(({
    rIdx,
    cIdx,
    cell,
    isFocused,
    customColorMap,
    onSelect,
    onChange
}: {
    rIdx: number;
    cIdx: number;
    cell: BroadcastGridCell;
    isFocused: boolean;
    customColorMap?: Record<string, ShiftType | ''>;
    onSelect: (r: number, c: number) => void;
    onChange: (r: number, c: number, value: string) => void;
}) => {
    const cellVal = cell.value || '';
    const isShiftCol = cIdx >= 2;
    
    // Resolve shift styling if this is a shift column (cIdx >= 2) or contains shift data
    const shiftResolved = isShiftCol ? resolveShiftFromCell(cellVal, cell.bgColor, customColorMap, cell.textColor) : null;
    const shiftStyle = shiftResolved ? SHIFT_COLORS[shiftResolved] : null;

    const hasRealBg = cell.bgColor && cell.bgColor !== '#ffffff' && cell.bgColor !== 'transparent';
    const customStyle: React.CSSProperties = {};
    if (hasRealBg && cell.bgColor) {
        customStyle.backgroundColor = cell.bgColor;
    }
    if (cell.textColor && cell.textColor !== '#000000' && cell.textColor !== '#011627') {
        customStyle.color = cell.textColor;
    }

    return (
        <td
            onClick={() => onSelect(rIdx, cIdx)}
            style={customStyle}
            className={`p-0 border border-current/15 text-center transition-all cursor-cell relative ${
                isFocused ? 'ring-2 ring-teal-500 z-10 bg-teal-500/10' : ''
            } font-bold w-14 min-w-[56px] h-7`}
        >
            {isFocused ? (
                <input
                    type="text"
                    autoFocus
                    value={cellVal}
                    onChange={(e) => onChange(rIdx, cIdx, e.target.value)}
                    style={{ color: cell.textColor || undefined }}
                    className="w-full h-full text-center bg-transparent outline-none font-mono text-xs px-0.5 animate-none"
                />
            ) : hasRealBg ? (
                <span style={{ color: cell.textColor || undefined }} className="font-mono text-xs select-none">
                    {cellVal || (shiftResolved ? shiftResolved.slice(0, 4) : '')}
                </span>
            ) : shiftResolved && shiftStyle ? (
                <span
                    className={`inline-block w-[calc(100%-4px)] py-0.5 px-0.5 rounded text-[10px] font-mono font-bold border truncate select-none ${shiftStyle.bg} ${shiftStyle.text} ${shiftStyle.border}`}
                    title={shiftResolved}
                >
                    {cellVal || shiftResolved.slice(0, 4)}
                </span>
            ) : (
                <span style={{ color: cell.textColor || undefined }} className="font-mono text-xs select-none">
                    {cellVal}
                </span>
            )}
        </td>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.isFocused === nextProps.isFocused &&
        prevProps.cell.value === nextProps.cell.value &&
        prevProps.cell.bgColor === nextProps.cell.bgColor &&
        prevProps.cell.textColor === nextProps.cell.textColor &&
        prevProps.customColorMap === nextProps.customColorMap &&
        prevProps.onSelect === nextProps.onSelect &&
        prevProps.onChange === nextProps.onChange
    );
});

const GridRow = React.memo(({
    rIdx,
    rowCells,
    selectedCol,
    customColorMap,
    onSelect,
    onChange
}: {
    rIdx: number;
    rowCells: BroadcastGridCell[];
    selectedCol: number | null;
    customColorMap?: Record<string, ShiftType | ''>;
    onSelect: (r: number, c: number) => void;
    onChange: (r: number, c: number, value: string) => void;
}) => {
    return (
        <tr className="hover:bg-current/5 transition-colors">
            {/* Sticky Row Number 1-150 */}
            <td className="sticky left-0 z-10 p-1 border border-current/20 bg-slate-200/80 dark:bg-slate-800/80 text-center font-bold text-[10.5px] opacity-75">
                {rIdx + 1}
            </td>
            {rowCells.map((cell, cIdx) => {
                const isFocused = selectedCol === cIdx;
                return (
                    <GridCell
                        key={cIdx}
                        rIdx={rIdx}
                        cIdx={cIdx}
                        cell={cell}
                        isFocused={isFocused}
                        customColorMap={customColorMap}
                        onSelect={onSelect}
                        onChange={onChange}
                    />
                );
            })}
        </tr>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.rIdx === nextProps.rIdx &&
        prevProps.selectedCol === nextProps.selectedCol &&
        prevProps.rowCells === nextProps.rowCells &&
        prevProps.customColorMap === nextProps.customColorMap &&
        prevProps.onSelect === nextProps.onSelect &&
        prevProps.onChange === nextProps.onChange
    );
});

export const AdminScheduleBroadcastTab: React.FC<AdminScheduleBroadcastTabProps> = ({
    users,
    daysState,
    onShowToast,
    theme = 'default',
}) => {
    const isIndustrial = theme === 'industrial';
    const isPaperSketch = theme === 'paperSketch';
    const isTechnical = theme === 'technical';
    const isWinamp = theme === 'winamp';
    const isDark = theme === 'dark';
    const isDashboard = theme === 'dashboard';

    // Target Month & Year
    const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());

    // 150 rows x 40 cols grid matrix state
    const [gridData, setGridData] = useState<BroadcastGridCell[][]>(() => {
        return Array.from({ length: TOTAL_GRID_ROWS }, () =>
            Array.from({ length: TOTAL_GRID_COLS }, () => ({ value: '', bgColor: null, textColor: null }))
        );
    });

    const [selectedCell, setSelectedCell] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter scope for targets
    const [targetScope, setTargetScope] = useState<'all' | 'app_users' | 'external_posko'>('all');

    // Targets list
    const [targets, setTargets] = useState<ScheduleCopyTarget[]>(() => {
        return users.map((u) => ({
            userId: u.id,
            nip: u.nip,
            name: u.name,
            unitPosko: u.unitPosko,
            isExternal: Boolean(u.isExternalNonAppUser),
            selected: true,
            shiftPattern: 'Impor Excel Grid',
            statusText: 'Siap Diimpor',
        }));
    });

    const [isImporting, setIsImporting] = useState(false);
    const [importSuccess, setImportSuccess] = useState<string | null>(null);
    const [isTargetsFolded, setIsTargetsFolded] = useState<boolean>(true);

    // State Pemetaan Warna & Kode Teks Kustom (Mendukung integrasi sinkronisasi warna dengan spreadsheet)
    const [customColorMap, setCustomColorMap] = useState<Record<string, ShiftType | ''>>(() => loadSavedExcelColorMap());
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [isSaveSuccess, setIsSaveSuccess] = useState(false);

    const handleColorMapChange = (colorKey: string, val: ShiftType | '') => {
        setCustomColorMap((prev) => {
            const next = { ...prev, [colorKey]: val };
            saveExcelColorMap(next);
            return next;
        });
        setIsSaveSuccess(false);
    };

    const handleManualSaveRules = () => {
        saveExcelColorMap(customColorMap);
        setIsSaveSuccess(true);
        setTimeout(() => setIsSaveSuccess(false), 2000);
        onShowToast('Aturan pemetaan kustom berhasil disimpan ke dalam sistem aplikasi.');
    };

    const handleClearSavedColorRules = () => {
        setCustomColorMap({});
        saveExcelColorMap({});
        onShowToast('Semua aturan kustom dihapus dan dipulihkan ke bawaan sistem.');
    };

    // Days in selected month
    const daysInSelectedMonth = useMemo(() => {
        return new Date(selectedYear, selectedMonth, 0).getDate();
    }, [selectedYear, selectedMonth]);

    // 5 Random Pegawai for Preview
    const [randomPreviewUsers, setRandomPreviewUsers] = useState<UserAccount[]>([]);

    const refreshRandomUsers = useCallback(() => {
        const pool = [...users];
        // Shuffle pool
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        setRandomPreviewUsers(pool.slice(0, 5));
    }, [users]);

    useEffect(() => {
        refreshRandomUsers();
    }, [refreshRandomUsers]);

    const previewScrollRef = useRef<HTMLDivElement>(null);

    // Keyboard scroll for table horizontal navigation using ArrowLeft and ArrowRight
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeEl = document.activeElement;
            const isTyping = activeEl && (
                activeEl.tagName === 'INPUT' ||
                activeEl.tagName === 'TEXTAREA' ||
                activeEl.tagName === 'SELECT' ||
                (activeEl as HTMLElement).isContentEditable
            );

            // Also ignore if the spreadsheet grid has focus
            const isSpreadsheetFocused = activeEl && (
                activeEl.classList.contains('broadcast-grid-table-container') ||
                activeEl.closest('.broadcast-grid-table-container')
            );

            if (isTyping || isSpreadsheetFocused) return;

            if (previewScrollRef.current) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    previewScrollRef.current.scrollBy({ left: -120, behavior: 'smooth' });
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    previewScrollRef.current.scrollBy({ left: 120, behavior: 'smooth' });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Cell value updater
    const handleCellChange = useCallback((r: number, c: number, value: string) => {
        setGridData((prev) => {
            const next = prev.map((row, rIdx) => {
                if (rIdx !== r) return row;
                const newRow = [...row];
                newRow[c] = { ...newRow[c], value };
                return newRow;
            });
            return next;
        });
    }, []);

    const handleSelectCell = useCallback((r: number, c: number) => {
        setSelectedCell({ r, c });
    }, []);

    const containerRef = useRef<HTMLDivElement>(null);

    // Keyboard arrow-key navigation for the 150x40 spreadsheet grid
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        const { r, c } = selectedCell;
        let nextR = r;
        let nextC = c;

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                if (r > 0) nextR = r - 1;
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (r < TOTAL_GRID_ROWS - 1) nextR = r + 1;
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (c > 0) nextC = c - 1;
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (c < TOTAL_GRID_COLS - 1) nextC = c + 1;
                break;
            case 'Tab':
                e.preventDefault();
                if (e.shiftKey) {
                    if (c > 0) nextC = c - 1;
                    else if (r > 0) {
                        nextR = r - 1;
                        nextC = TOTAL_GRID_COLS - 1;
                    }
                } else {
                    if (c < TOTAL_GRID_COLS - 1) nextC = c + 1;
                    else if (r < TOTAL_GRID_ROWS - 1) {
                        nextR = r + 1;
                        nextC = 0;
                    }
                }
                break;
            default:
                return;
        }

        setSelectedCell({ r: nextR, c: nextC });
    }, [selectedCell]);

    // Robust Paste Handler (Supports HTML Background Color detection & TSV text)
    const handlePaste = useCallback((e: React.ClipboardEvent | ClipboardEvent) => {
        const clipboardData = 'clipboardData' in e ? e.clipboardData : null;
        if (!clipboardData) return;

        // Check if user is focused on an input element outside our grid
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
            if (!target.closest('.broadcast-grid-table-container')) {
                return; // Ignore if focused outside the grid
            }
        }

        e.preventDefault();
        const startR = selectedCell.r;
        const startC = selectedCell.c;

        const htmlData = clipboardData.getData('text/html');
        const textData = clipboardData.getData('text/plain');

        let matrix: { value: string; bgColor: string | null; textColor: string | null }[][] = [];

        if (htmlData && htmlData.includes('<tr')) {
            matrix = parseExcelHtmlTo2DCells(htmlData);
        }

        // Fallback or plain text parser
        if (matrix.length === 0 && textData) {
            const lines = textData.split(/\r\n|\n|\r/);
            lines.forEach((line) => {
                if (line.trim().length === 0) return;
                const cells = line.split('\t');
                matrix.push(cells.map((c) => ({ value: c.trim(), bgColor: null, textColor: null })));
            });
        }

        if (matrix.length === 0) return;

        // Apply pasted matrix to grid starting at selectedCell
        setGridData((prev) => {
            const next = prev.map((row) => [...row]);
            matrix.forEach((pRow, rIdx) => {
                const targetR = startR + rIdx;
                if (targetR >= TOTAL_GRID_ROWS) return;
                pRow.forEach((pCell, cIdx) => {
                    const targetC = startC + cIdx;
                    if (targetC >= TOTAL_GRID_COLS) return;

                    // Parse text or map custom color
                    let cellVal = pCell.value || '';
                    if (targetC >= 2) {
                        if (!cellVal && pCell.bgColor) {
                            const shift = resolveShiftFromCell('', pCell.bgColor, customColorMap);
                            if (shift) cellVal = shift;
                        }
                    }

                    next[targetR][targetC] = {
                        value: cellVal,
                        bgColor: pCell.bgColor ? pCell.bgColor : null,
                        textColor: pCell.textColor ? pCell.textColor : null,
                    };
                });
            });
            return next;
        });

        onShowToast(`Berhasil menempel data Excel (${matrix.length} baris × ${matrix[0]?.length || 0} kolom).`);
    }, [selectedCell, customColorMap, onShowToast]);

    // Direct Click Paste Handler (using navigator.clipboard for click event copy-paste from Excel)
    const handleDirectPasteFromClipboard = useCallback(async () => {
        if (typeof navigator === 'undefined' || !navigator.clipboard) {
            onShowToast('Akses clipboard tidak didukung oleh browser Anda.');
            return;
        }
        try {
            const startR = selectedCell.r;
            const startC = selectedCell.c;
            let matrix: { value: string; bgColor: string | null; textColor: string | null }[][] = [];

            if (navigator.clipboard.read) {
                const items = await navigator.clipboard.read();
                for (const item of items) {
                    if (item.types.includes('text/html')) {
                        const blob = await item.getType('text/html');
                        const htmlText = await blob.text();
                        if (htmlText) {
                            matrix = parseExcelHtmlTo2DCells(htmlText);
                            break;
                        }
                    }
                }
            }

            if (matrix.length === 0 && navigator.clipboard.readText) {
                const text = await navigator.clipboard.readText();
                if (text) {
                    const lines = text.split(/\r\n|\n|\r/);
                    lines.forEach((line) => {
                        if (line.trim().length === 0) return;
                        const cells = line.split('\t');
                        matrix.push(cells.map((c) => ({ value: c.trim(), bgColor: null, textColor: null })));
                    });
                }
            }

            if (matrix.length === 0) {
                onShowToast('Clipboard kosong atau tidak berisi format tabel Excel yang valid.');
                return;
            }

            // Apply pasted matrix to grid starting at selectedCell
            setGridData((prev) => {
                const next = prev.map((row) => [...row]);
                matrix.forEach((pRow, rIdx) => {
                    const targetR = startR + rIdx;
                    if (targetR >= TOTAL_GRID_ROWS) return;
                    pRow.forEach((pCell, cIdx) => {
                        const targetC = startC + cIdx;
                        if (targetC >= TOTAL_GRID_COLS) return;

                        // Parse text or map custom color
                        let cellVal = pCell.value || '';
                        if (targetC >= 2) {
                            if (!cellVal && pCell.bgColor) {
                                const shift = resolveShiftFromCell('', pCell.bgColor, customColorMap);
                                if (shift) cellVal = shift;
                            }
                        }

                        next[targetR][targetC] = {
                            value: cellVal,
                            bgColor: pCell.bgColor ? pCell.bgColor : null,
                            textColor: pCell.textColor ? pCell.textColor : null,
                        };
                    });
                });
                return next;
            });

            onShowToast(`Berhasil menempel data Excel (${matrix.length} baris × ${matrix[0]?.length || 0} kolom).`);
        } catch (err) {
            console.warn('Gagal membaca clipboard langsung:', err);
            onShowToast('Harap berikan izin akses clipboard jika diminta oleh sistem browser Anda.');
        }
    }, [selectedCell, customColorMap, onShowToast]);

    // Global Paste Listener for higher sensitivity and instant capture
    useEffect(() => {
        const handleGlobalPaste = (e: ClipboardEvent) => {
            handlePaste(e);
        };
        window.addEventListener('paste', handleGlobalPaste);
        return () => {
            window.removeEventListener('paste', handleGlobalPaste);
        };
    }, [handlePaste]);

    // Direct File Upload (.xlsx, .csv, .txt, .json)
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const content = evt.target?.result as string;
            if (!content) return;

            try {
                // If JSON
                if (file.name.endsWith('.json')) {
                    const parsed = JSON.parse(content);
                    if (Array.isArray(parsed)) {
                        setGridData((prev) => {
                            const next = prev.map((row) => [...row]);
                            parsed.forEach((r, rIdx) => {
                                if (rIdx < TOTAL_GRID_ROWS && Array.isArray(r)) {
                                    r.forEach((val, cIdx) => {
                                        if (cIdx < TOTAL_GRID_COLS) {
                                            next[rIdx][cIdx] = {
                                                value: String(val || ''),
                                                bgColor: null,
                                                textColor: null
                                            };
                                        }
                                    });
                                }
                            });
                            return next;
                        });
                        onShowToast(`Berhasil memuat file JSON ke grid.`);
                        return;
                    }
                }

                // CSV / TSV / TXT
                const lines = content.split(/\r\n|\n|\r/);
                const separator = content.includes('\t') ? '\t' : content.includes(';') ? ';' : ',';

                setGridData((prev) => {
                    const next = prev.map((row) => [...row]);
                    lines.forEach((line, rIdx) => {
                        if (rIdx >= TOTAL_GRID_ROWS || !line.trim()) return;
                        const cells = line.split(separator);
                        cells.forEach((cell, cIdx) => {
                            if (cIdx < TOTAL_GRID_COLS) {
                                next[rIdx][cIdx] = {
                                    value: cell.trim().replace(/^["']|["']$/g, ''),
                                    bgColor: null,
                                    textColor: null
                                };
                            }
                        });
                    });
                    return next;
                });

                onShowToast(`File ${file.name} berhasil diimpor ke grid tabel.`);
            } catch (err: any) {
                onShowToast(`Gagal membaca file: ${err.message}`);
            }
        };
        reader.readAsText(file);
    };

    // Load rich sample schedule into the grid
    const handleLoadSample = () => {
        const sampleSchedules = [
            ['G', 'G', 'N', 'N', 'OFF', 'OFF', 'G', 'G', 'N', 'N', 'OFF', 'OFF', 'TPSL', 'M', 'OFF', 'SM', 'PM', 'OFF', 'G', 'N', 'OFF', 'CUTI', 'CUTI', 'G', 'N', 'OFF', 'TPSL', 'M', 'OFF', 'G', 'N'],
            ['TPSL', 'TPSL', 'M', 'M', 'OFF', 'OFF', 'TPSL', 'TPSL', 'M', 'M', 'OFF', 'OFF', 'G', 'N', 'OFF', 'SM', 'PM', 'OFF', 'TPSL', 'M', 'OFF', 'G', 'N', 'TPSL', 'M', 'OFF', 'CUTI', 'CUTI', 'OFF', 'TPSL', 'M'],
            ['N', 'N', 'G', 'G', 'OFF', 'OFF', 'N', 'N', 'G', 'G', 'OFF', 'OFF', 'SM', 'PM', 'OFF', 'TPSL', 'M', 'OFF', 'N', 'G', 'OFF', 'TPSL', 'M', 'N', 'G', 'OFF', 'G', 'N', 'OFF', 'N', 'G'],
            ['M', 'M', 'SM', 'PM', 'OFF', 'OFF', 'M', 'M', 'SM', 'PM', 'OFF', 'OFF', 'CUTI', 'CUTI', 'OFF', 'G', 'N', 'OFF', 'M', 'M', 'OFF', 'TPSL', 'TPSL', 'M', 'M', 'OFF', 'TPSL', 'M', 'OFF', 'M', 'M'],
            ['SM', 'PM', 'OFF', 'G', 'N', 'OFF', 'SM', 'PM', 'OFF', 'G', 'N', 'OFF', 'TPSL', 'M', 'OFF', 'CUTI', 'CUTI', 'OFF', 'SM', 'PM', 'OFF', 'G', 'N', 'SM', 'PM', 'OFF', 'TPSL', 'M', 'OFF', 'SM', 'PM'],
        ];

        setGridData((prev) => {
            const next = prev.map((row) => [...row]);
            sampleSchedules.forEach((rowShifts, rIdx) => {
                rowShifts.forEach((val, cIdx) => {
                    if (cIdx < TOTAL_GRID_COLS) {
                        next[rIdx][cIdx] = {
                            value: val,
                            bgColor: null,
                            textColor: null
                        };
                    }
                });
            });
            return next;
        });

        onShowToast('Contoh pola shift bulanan posko berhasil dimuat ke baris 1 s.d. 5.');
    };

    // Clear entire grid
    const handleClearGrid = () => {
        setGridData(Array.from({ length: TOTAL_GRID_ROWS }, () =>
            Array.from({ length: TOTAL_GRID_COLS }, () => ({ value: '', bgColor: null, textColor: null }))
        ));
        setImportSuccess(null);
        onShowToast('Grid tabel telah dikosongkan.');
    };

    // Count filled cells
    const filledCellCount = useMemo(() => {
        let count = 0;
        gridData.forEach((row) => {
            row.forEach((cell) => {
                if (cell && cell.value && cell.value.trim()) count++;
            });
        });
        return count;
    }, [gridData]);

    const toggleSelectAll = (checked: boolean) => {
        setTargets((prev) => prev.map((t) => ({ ...t, selected: checked })));
    };

    const toggleTarget = (userId: string) => {
        setTargets((prev) =>
            prev.map((t) => (t.userId === userId ? { ...t, selected: !t.selected } : t))
        );
    };

    const handleExecuteImport = () => {
        const permissions = getCurrentUserPermissions();
        if (!permissions.canBroadcastSchedule) {
            onShowToast('Akses dibatasi: Role Anda tidak memiliki izin broadcast / impor jadwal pengguna (canBroadcastSchedule).');
            return;
        }
        const selectedCount = targets.filter((t) => t.selected).length;
        if (selectedCount === 0) {
            onShowToast('Pilih minimal satu target pengguna/posko untuk mengimpor jadwal.');
            return;
        }

        if (filledCellCount === 0) {
            onShowToast('Isi atau tempel data jadwal ke dalam grid tabel terlebih dahulu.');
            return;
        }

        setIsImporting(true);
        setImportSuccess(null);

        setTimeout(() => {
            setIsImporting(false);
            const externalCount = targets.filter((t) => t.selected && t.isExternal).length;
            const appUserCount = selectedCount - externalCount;
            const monthName = MONTH_NAMES_ID[selectedMonth - 1];
            const msg = `Berhasil mengimpor jadwal dari Grid Excel ke ${selectedCount} target (${appUserCount} Pengguna App, ${externalCount} Personel Posko Luar) untuk periode ${monthName} ${selectedYear}.`;
            setImportSuccess(msg);
            onShowToast(msg);
        }, 700);
    };

    const filteredTargets = targets.filter((t) => {
        if (targetScope === 'app_users') return !t.isExternal;
        if (targetScope === 'external_posko') return t.isExternal;
        return true;
    });

    const allSelected = filteredTargets.length > 0 && filteredTargets.every((t) => t.selected);
    const selectedCount = targets.filter((t) => t.selected).length;

    // Kumpulkan kategori warna unik dan kode teks unik dari grid data untuk pemetaan interaktif
    const detectedColorsList = useMemo(() => {
        const map = new Map<string, {
            count: number;
            sampleText: string;
            categoryType: 'color' | 'text_color' | 'text';
            colorKey: string;
            displayColor: string | null;
        }>();

        gridData.forEach((row) => {
            row.forEach((cell, cIdx) => {
                if (!cell) return;
                // Aturan: Jangan masukkan warna/teks dari kolom NIP dan Nama (kolom indeks 0 dan 1) ke pemetaan jika berupa NIP/Nama
                const bg = normalizeColor(cell.bgColor);
                const textCol = normalizeColor(cell.textColor);
                const text = (cell.value || '').trim();
                const textClean = text.toUpperCase();

                // Deteksi tipe data: Nama > 5 char (kecuali GRAHA/MALAM), NIP 18 digit
                const isNip = /^\d{18}$/.test(textClean);
                const isNama = textClean.length > 5 && !['MALAM', 'GRAHA'].includes(textClean);
                if (isNama || isNip) return;

                const hasRealBg = bg && bg !== '#ffffff' && bg !== '#fff' && bg !== 'transparent';
                const isDefaultTextCol = !textCol || ['#000000', '#011627', 'black', '#333333', '#111827'].includes(textCol);
                const hasCustomTextCol = !isDefaultTextCol && Boolean(textCol);
                const isShiftText = textClean.length >= 1 && textClean.length <= 5;

                if (!isShiftText && !hasRealBg && !hasCustomTextCol) return;

                if (hasRealBg && bg) {
                    const existing = map.get(bg);
                    if (existing) {
                        existing.count++;
                        if (!existing.sampleText && text) existing.sampleText = text;
                    } else {
                        map.set(bg, {
                            count: 1,
                            sampleText: text,
                            categoryType: 'color',
                            colorKey: bg,
                            displayColor: bg,
                        });
                    }
                } else if (hasCustomTextCol && textCol) {
                    const key = `TEXT_COLOR_${textCol}`;
                    const existing = map.get(key);
                    if (existing) {
                        existing.count++;
                        if (!existing.sampleText && text) existing.sampleText = text;
                    } else {
                        map.set(key, {
                            count: 1,
                            sampleText: text,
                            categoryType: 'text_color',
                            colorKey: key,
                            displayColor: textCol,
                        });
                    }
                } else if (textClean && isShiftText) {
                    const key = `TEXT_${textClean}`;
                    const existing = map.get(key);
                    if (existing) {
                        existing.count++;
                    } else {
                        map.set(key, {
                            count: 1,
                            sampleText: text,
                            categoryType: 'text',
                            colorKey: key,
                            displayColor: null,
                        });
                    }
                }
            });
        });

        const list: {
            color: string;
            categoryType: 'color' | 'text_color' | 'text';
            count: number;
            assignedShift: ShiftType | '';
            sampleText?: string;
            displayColor?: string | null;
        }[] = [];

        map.forEach((item, key) => {
            let defaultAssigned: ShiftType | '' = '';
            if (customColorMap[key] !== undefined) {
                defaultAssigned = customColorMap[key];
            } else if (item.categoryType === 'color') {
                defaultAssigned =
                    SYSTEM_DEFAULT_EXCEL_MAP[key] ||
                    guessShiftFromColor(item.colorKey, item.sampleText) ||
                    matchShiftCode(item.sampleText) ||
                    '';
            } else if (item.categoryType === 'text_color') {
                defaultAssigned =
                    SYSTEM_DEFAULT_EXCEL_MAP[key] ||
                    guessShiftFromColor(item.displayColor, item.sampleText) ||
                    matchShiftCode(item.sampleText) ||
                    '';
            } else if (item.categoryType === 'text') {
                defaultAssigned =
                    SYSTEM_DEFAULT_EXCEL_MAP[key] ||
                    matchShiftCode(item.sampleText) ||
                    '';
            }

            list.push({
                color: key,
                categoryType: item.categoryType,
                count: item.count,
                assignedShift: defaultAssigned,
                sampleText: item.sampleText,
                displayColor: item.displayColor,
            });
        });

        const order = { color: 1, text_color: 2, text: 3 };
        return list.sort((a, b) => {
            if (order[a.categoryType] !== order[b.categoryType]) {
                return order[a.categoryType] - order[b.categoryType];
            }
            return b.count - a.count;
        });
    }, [gridData, customColorMap]);

    return (
        <div className="space-y-4">
            {/* Header / Sub Menu Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400">
                        <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
                            Impor Jadwal Pengguna
                        </h3>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleExecuteImport}
                    disabled={isImporting || selectedCount === 0 || filledCellCount === 0}
                    className={`px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center space-x-2 transition-all ${
                        isImporting || selectedCount === 0 || filledCellCount === 0
                            ? 'opacity-50 cursor-not-allowed'
                            : 'active:scale-95'
                    }`}
                >
                    <Send className="w-4 h-4" />
                    <span>{isImporting ? 'Memproses Impor...' : `Terapkan semua ke ${selectedCount} Pengguna`}</span>
                </button>
            </div>

            {/* Target Periode & Toolbar Aksi Impor */}
            <div className={`p-4 rounded-xl border space-y-3.5 ${
                isIndustrial
                    ? 'bg-[#0F1115] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                    : isPaperSketch
                    ? 'bg-white border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
                    : isDark
                    ? 'bg-[#161616] border-slate-800 text-slate-100'
                    : 'bg-white border-slate-200 text-slate-900'
            }`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Pilih Bulan, Tahun & Tombol Muat Contoh Data Grid */}
                    <div className="flex items-end gap-2.5 flex-wrap">
                        <div>
                            <label className="text-[11px] font-bold block mb-1">Target Bulan:</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="p-1.5 text-xs rounded-lg border border-current/20 bg-current/5 font-bold outline-none cursor-pointer focus:border-teal-500"
                            >
                                {MONTH_NAMES_ID.map((name, idx) => (
                                    <option key={name} value={idx + 1}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold block mb-1">Target Tahun:</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="p-1.5 text-xs rounded-lg border border-current/20 bg-current/5 font-bold outline-none cursor-pointer focus:border-teal-500"
                            >
                                <option value={2025}>2025</option>
                                <option value={2026}>2026</option>
                                <option value={2027}>2027</option>
                                <option value={2028}>2028</option>
                            </select>
                        </div>

                        {/* Tombol Muat Contoh Data Grid - Tepat di sebelah kanan Target Tahun */}
                        <button
                            type="button"
                            onClick={handleLoadSample}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-current/20 hover:bg-current/10 cursor-pointer flex items-center gap-1.5 transition-all"
                            title="Muat data contoh sampel jadwal ke dalam grid"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Muat Contoh Data Grid</span>
                        </button>
                    </div>

                    {/* Toolbar Tombol Aksi Grid: Tempel Data di kiri Impor dari File */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={handleDirectPasteFromClipboard}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-current/20 hover:bg-current/10 cursor-pointer flex items-center gap-1.5 transition-all"
                            title="Tempel tabel Excel beserta format warnanya langsung dari clipboard (Ctrl+V)"
                        >
                            <ClipboardPaste className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <span>Tempel Data</span>
                        </button>

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept=".xlsx,.xls,.csv,.txt,.json"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-current/20 hover:bg-current/10 cursor-pointer flex items-center gap-1.5 transition-all"
                        >
                            <Upload className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <span>Impor dari File</span>
                        </button>

                        {detectedColorsList.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setIsMapOpen(!isMapOpen)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg border cursor-pointer flex items-center gap-1.5 transition-all ${
                                    isMapOpen 
                                        ? 'bg-teal-600 text-white border-teal-600' 
                                        : 'border-current/20 hover:bg-current/10'
                                }`}
                            >
                                <Palette className="w-3.5 h-3.5 text-teal-500" />
                                <span>Pemetaan Warna ({detectedColorsList.length})</span>
                                {isMapOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                        )}

                        {filledCellCount > 0 && (
                            <button
                                type="button"
                                onClick={handleClearGrid}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 cursor-pointer flex items-center gap-1.5"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Kosongkan Grid</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="text-[11px] opacity-75 leading-relaxed flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>
                        <strong>Tips Grid:</strong> Klik salah satu sel di bawah, lalu tekan <strong>Ctrl + V</strong> untuk menempel tabel Excel. Sel akan <strong>mempertahankan warna asli Excel</strong> dan mencocokkan shift berdasarkan warna latar/teks yang Anda petakan!
                    </span>
                </div>
            </div>

            {/* COLLAPSIBLE COLOR & TEXT CODE MAPPING PANEL (SAMPAI PERSIS SEPERTI EXCEL SPREADSHEET) */}
            {isMapOpen && detectedColorsList.length > 0 && (
                <div className={`p-4 rounded-xl border space-y-3 animate-in fade-in slide-in-from-top-3 duration-250 ${
                    isIndustrial
                        ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                        : isPaperSketch
                        ? 'bg-white border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
                        : isDark
                        ? 'bg-[#1e1e1e] border-slate-800 text-slate-100'
                        : isDashboard
                        ? 'bg-[#FFF5D0] border-[#4D2A00]/25 text-[#4D2A00]'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                    <div className="flex items-center justify-between border-b border-current/10 pb-2 flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                            <Palette className="w-4 h-4 text-teal-500" />
                            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wide">
                                Pemetaan Aturan Warna & Kode Excel
                            </h4>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={handleManualSaveRules}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                    isSaveSuccess
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : 'bg-teal-600 hover:bg-teal-700 text-white border-teal-700'
                                }`}
                            >
                                <Save className="w-3.5 h-3.5" />
                                <span>{isSaveSuccess ? 'Tersimpan!' : 'Simpan Aturan'}</span>
                            </button>
                            {Object.keys(customColorMap).length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleClearSavedColorRules}
                                    className="text-xs text-rose-500 hover:underline cursor-pointer px-2 py-1"
                                >
                                    Reset Aturan
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                        {detectedColorsList.map((item) => {
                            const currentShift = item.assignedShift;
                            const shiftStyle = currentShift ? SHIFT_COLORS[currentShift] : null;

                            return (
                                <div
                                    key={`color-rule-${item.color}`}
                                    className={`flex items-center justify-between p-2 rounded-lg border gap-2 text-xs ${
                                        isIndustrial
                                            ? 'bg-[#0F1115] border-[rgba(226,232,240,0.1)] text-[#E2E8F0]'
                                            : isDark
                                            ? 'bg-slate-900/60 border-slate-800'
                                            : isDashboard
                                            ? 'bg-[#FFF0BE] border-[#4D2A00]/25 text-[#4D2A00]'
                                            : 'bg-white border-slate-200'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                                        {item.categoryType === 'color' ? (
                                            <div
                                                className="w-7 h-7 rounded-md border border-black/20 shrink-0 shadow-2xs"
                                                style={{ backgroundColor: item.displayColor || item.color }}
                                                title={`Warna Latar: ${item.color}`}
                                            />
                                        ) : item.categoryType === 'text_color' ? (
                                            <div
                                                className="w-7 h-7 rounded-md border border-current/20 bg-current/5 shrink-0 shadow-2xs flex items-center justify-center font-mono font-bold text-xs"
                                                style={{ color: item.displayColor || item.color }}
                                                title={`Warna Font: ${item.color}`}
                                            >
                                                {item.sampleText || 'Aa'}
                                            </div>
                                        ) : (
                                            <div
                                                className="w-7 h-7 rounded-md border border-teal-500/40 bg-teal-500/10 text-teal-600 shrink-0 shadow-2xs flex items-center justify-center font-mono font-bold text-xs"
                                                title={`Kode Teks: ${item.sampleText}`}
                                            >
                                                {item.sampleText || '?'}
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <span className="block text-[11px] font-bold truncate">
                                                {item.categoryType === 'text' ? (
                                                    <span>Kode Teks <strong className="text-teal-500 font-mono">"{item.sampleText}"</strong></span>
                                                ) : item.categoryType === 'text_color' ? (
                                                    <span>Warna Teks <strong className="font-mono">{item.displayColor || item.color}</strong> {item.sampleText ? `("${item.sampleText}")` : ''}</span>
                                                ) : (
                                                    <span>Warna Latar {item.sampleText ? `"${item.sampleText}" (${item.color})` : item.color}</span>
                                                )}
                                            </span>
                                            <span className="block text-[10px] opacity-60">
                                                Terdeteksi di {item.count} sel
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <select
                                            value={currentShift}
                                            onChange={(e) => handleColorMapChange(item.color, e.target.value as ShiftType | '')}
                                            className={`text-xs font-bold py-1 px-2 rounded-lg border cursor-pointer outline-none transition-all ${
                                                currentShift && shiftStyle
                                                    ? `${shiftStyle.bg || 'bg-teal-500'} ${shiftStyle.text || 'text-white'} border-current/25`
                                                    : 'bg-current/10 text-current border-current/15'
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

            {/* GRID TABEL SPREADSHEET 150 ROWS x 40 COLS */}
            <div
                ref={containerRef}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                className={`rounded-xl border overflow-hidden broadcast-grid-table-container outline-none ${
                    isIndustrial
                        ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                        : isPaperSketch
                        ? 'bg-white border-2 border-[#2b2b2b]'
                        : isDark
                        ? 'bg-[#161616] border-slate-800'
                        : isDashboard
                        ? 'bg-[#FFF5D0] border-[#4D2A00]/25 text-[#4D2A00]'
                        : 'bg-white border-slate-200'
                }`}
            >
                <div className="p-2.5 bg-current/5 border-b border-current/10 flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center space-x-2">
                        <Table className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span>Grid Tabel Impor (Batas: Baris 1-150, Kolom 1-40)</span>
                    </div>
                    <span className="text-[11px] font-mono opacity-75">
                        {filledCellCount} Sel Terisi • Sel Aktif: R{selectedCell.r + 1}:C{selectedCell.c + 1}
                    </span>
                </div>

                {/* Table Container with Fixed Headers and Scroll */}
                <div className="max-h-[380px] overflow-auto select-none no-scrollbar">
                    <table className="w-full border-collapse text-xs font-mono">
                        <thead>
                            <tr className="sticky top-0 z-10 bg-slate-200/90 dark:bg-slate-800/95 backdrop-blur-xs text-[11px]">
                                {/* Corner Cell */}
                                <th className="sticky left-0 z-20 w-12 min-w-[48px] p-1 border border-current/20 bg-slate-300 dark:bg-slate-900 text-center font-bold">
                                    #
                                </th>
                                {/* Column Headers 1 s.d. 40 */}
                                {Array.from({ length: TOTAL_GRID_COLS }).map((_, cIdx) => (
                                    <th
                                        key={cIdx}
                                        className="w-14 min-w-[56px] p-1 border border-current/20 text-center font-bold"
                                    >
                                        {cIdx + 1}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {gridData.map((rowCells, rIdx) => {
                                const selectedCol = selectedCell.r === rIdx ? selectedCell.c : null;
                                return (
                                    <GridRow
                                        key={rIdx}
                                        rIdx={rIdx}
                                        rowCells={rowCells}
                                        selectedCol={selectedCol}
                                        customColorMap={customColorMap}
                                        onSelect={handleSelectCell}
                                        onChange={handleCellChange}
                                    />
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PRATINJAU JADWAL: 5 NAMA YANG DIRANDOM (AUTO OLEH APLIKASI) */}
            <div className={`p-4 rounded-xl border space-y-3.5 ${
                isIndustrial
                    ? 'bg-[#0F1115] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                    : isPaperSketch
                    ? 'bg-white border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
                    : isDark
                    ? 'bg-[#161616] border-slate-800 text-slate-100'
                    : isDashboard
                    ? 'bg-[#FFF9E6] border-[#4D2A00]/25 text-[#4D2A00]'
                    : 'bg-white border-slate-200 text-slate-900'
            }`}>
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-current/10 pb-2.5">
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                            Pratinjau Jadwal 5 Pengguna Acak
                        </h4>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono opacity-75">
                            Periode: <strong>{MONTH_NAMES_ID[selectedMonth - 1]} {selectedYear}</strong> ({daysInSelectedMonth} Hari)
                        </span>
                        <button
                            type="button"
                            onClick={refreshRandomUsers}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg border border-current/20 hover:bg-current/10 cursor-pointer flex items-center gap-1 transition-all"
                            title="Acak ulang 5 nama sampel"
                        >
                            <Shuffle className="w-3.5 h-3.5 text-teal-600" />
                            <span>Acak 5 Nama</span>
                        </button>
                    </div>
                </div>

                {/* Horizontal Scroll Matrix: Nama Pegawai | Tanggal 1 s.d. 31 */}
                <div ref={previewScrollRef} className="overflow-x-auto rounded-xl border border-current/15 select-none no-scrollbar">
                    <table className="w-full border-collapse text-xs">
                        <thead>
                            <tr className="bg-current/5 border-b border-current/15">
                                {/* Sticky Kolom Nama Pegawai */}
                                <th className="sticky left-0 z-20 p-2 text-left font-extrabold min-w-[125px] max-w-[155px] bg-slate-100 dark:bg-slate-900 border-r border-current/20 shadow-xs">
                                    Nama Pegawai
                                </th>
                                {/* Kolom Tanggal 1 s.d. 28/29/30/31 */}
                                {Array.from({ length: daysInSelectedMonth }).map((_, dIdx) => {
                                    const dayNum = dIdx + 1;
                                    const dateObj = new Date(selectedYear, selectedMonth - 1, dayNum);
                                    const dayOfWeek = DAY_NAMES_SHORT[dateObj.getDay()];
                                    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

                                    return (
                                        <th
                                            key={dayNum}
                                            className={`p-1.5 text-center min-w-[38px] border-r border-current/10 ${
                                                isWeekend ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : ''
                                            }`}
                                        >
                                            <div className="text-[10px] font-mono font-bold">{dayNum}</div>
                                            <div className="text-[9px] opacity-70 font-sans">{dayOfWeek}</div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {randomPreviewUsers.map((user, uIdx) => {
                                // Map row in grid: user 0 takes Row 0, user 1 takes Row 1, etc.
                                const userGridRow = gridData[uIdx] || gridData[0] || [];

                                return (
                                    <tr key={user.id} className="border-b border-current/10 hover:bg-current/5 transition-colors">
                                        {/* Sticky Kolom Nama Pegawai */}
                                        <td className="sticky left-0 z-10 p-2 font-bold min-w-[125px] max-w-[155px] bg-slate-50 dark:bg-[#1A1D23] border-r border-current/20 shadow-xs">
                                            <div className="truncate font-sans">{user.name}</div>
                                            <div className="text-[10px] opacity-60 font-mono">NIP: {user.nip}</div>
                                        </td>

                                        {/* Shift Badges per Tanggal */}
                                        {Array.from({ length: daysInSelectedMonth }).map((_, dIdx) => {
                                            // Kolom 1 (indeks 0) adalah Nama, Kolom 2 (indeks 1) adalah NIP. Jadwal hari pertama dimulai dari Kolom 3 (indeks 2).
                                            const cell = userGridRow[dIdx + 2] || { value: '', bgColor: null, textColor: null };
                                            const cellVal = cell.value || '';
                                            const shiftResolved = resolveShiftFromCell(cellVal, cell.bgColor, customColorMap, cell.textColor);
                                            const color = shiftResolved ? SHIFT_COLORS[shiftResolved] : null;

                                            return (
                                                <td
                                                    key={dIdx + 1}
                                                    className="p-1 text-center border-r border-current/10"
                                                >
                                                    {shiftResolved ? (
                                                        <span
                                                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-black border ${
                                                                color
                                                                    ? `${color.bg} ${color.text} ${color.border}`
                                                                    : 'bg-slate-200 text-slate-800 border-slate-300'
                                                            }`}
                                                            title={`Tgl ${dIdx + 1}: ${shiftResolved}`}
                                                        >
                                                            {shiftResolved.slice(0, 4)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] opacity-25 font-mono">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Target Pengguna Penerapan Jadwal (Collapsible / Terlipat Bawaan) */}
            <div className={`rounded-xl border overflow-hidden transition-all ${
                isIndustrial
                    ? 'bg-[#0F1115] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                    : isPaperSketch
                    ? 'bg-white border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
                    : isDark
                    ? 'bg-[#161616] border-slate-800'
                    : 'bg-white border-slate-200'
            }`}>
                {/* Collapsible Header */}
                <div 
                    onClick={() => setIsTargetsFolded((prev) => !prev)}
                    className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer hover:bg-current/5 transition-colors select-none"
                >
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <Users className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                            Pilih Pengguna Penerapan Jadwal
                        </h4>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                            {selectedCount} / {targets.length} Terpilih
                        </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <span className="text-[11px] font-medium opacity-70">
                            {isTargetsFolded ? 'Buka Sasaran' : 'Lipat Sasaran'}
                        </span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsTargetsFolded((prev) => !prev);
                            }}
                            className="p-1 rounded-md bg-current/5 hover:bg-current/10 transition-colors"
                            title={isTargetsFolded ? 'Buka Daftar Sasaran' : 'Lipat Daftar Sasaran'}
                        >
                            {isTargetsFolded ? (
                                <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            ) : (
                                <ChevronUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Collapsible Body */}
                {!isTargetsFolded && (
                    <div className="p-3.5 sm:p-4 border-t border-current/10 space-y-3.5 bg-current/2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => setTargetScope('all')}
                                    className={`py-1 px-2.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                        targetScope === 'all'
                                            ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                                            : 'border-current/15 hover:bg-current/5'
                                    }`}
                                >
                                    Semua ({targets.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTargetScope('app_users')}
                                    className={`py-1 px-2.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                        targetScope === 'app_users'
                                            ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                                            : 'border-current/15 hover:bg-current/5'
                                    }`}
                                >
                                    Pengguna App ({targets.filter((t) => !t.isExternal).length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTargetScope('external_posko')}
                                    className={`py-1 px-2.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                        targetScope === 'external_posko'
                                            ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                                            : 'border-current/15 hover:bg-current/5'
                                    }`}
                                >
                                    Posko Luar ({targets.filter((t) => t.isExternal).length})
                                </button>
                            </div>

                            <span className="text-xs opacity-75 font-mono">
                                Terpilih: <strong>{selectedCount}</strong> dari {targets.length} personel
                            </span>
                        </div>

                        {/* Bulk Checkbox Toggle Header */}
                        <div className="flex items-center justify-between pt-2 border-t border-current/10">
                            <Checkbox
                                id="bulk-toggle-targets"
                                theme={theme}
                                checked={allSelected}
                                onChange={() => toggleSelectAll(!allSelected)}
                                label={`Pilih Semua Target yang Tampil (${filteredTargets.length})`}
                            />
                        </div>

                        {/* List Target Penerima Impor Jadwal */}
                        <div className="space-y-2 max-h-[380px] overflow-y-auto no-scrollbar pt-1">
                            {filteredTargets.map((target) => (
                                <div
                                    key={target.userId}
                                    onClick={() => toggleTarget(target.userId)}
                                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                                        target.selected
                                            ? isIndustrial
                                                ? 'bg-[#1A1D23] border-teal-400/50'
                                                : 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-300/60 dark:border-teal-700/60'
                                            : 'bg-current/5 border-current/10 opacity-70'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3 min-w-0">
                                        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                id={`target-select-${target.userId}`}
                                                theme={theme}
                                                checked={target.selected}
                                                onChange={() => toggleTarget(target.userId)}
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-extrabold truncate">{target.name}</span>
                                                {target.isExternal ? (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                                        Posko Luar (Non-User)
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/15 text-teal-700 dark:text-teal-400 border border-teal-500/30">
                                                        Pengguna App Posko
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] opacity-75 font-mono">
                                                NIP: {target.nip} • {target.unitPosko}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                                            target.selected
                                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                                : 'bg-current/10 opacity-60 border-current/15'
                                        }`}>
                                            {target.selected ? 'Siap Diimpor' : 'Dilewati'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {importSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{importSuccess}</span>
                </div>
            )}
        </div>
    );
};
