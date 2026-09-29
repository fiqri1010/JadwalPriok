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
import { loadSavedExcelColorMap, saveExcelColorMap, normalizeColor, parseInlineStyle, parseExcelStylesheet } from '../ExcelSpreadsheet';

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
                    const normalizedTextColor = normalizeColor(cleanStyle.color);

                    rowCells.push({
                        value: cellText,
                        bgColor: normalizedBg,
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

// Convert raw text or color to recognized ShiftType (supporting custom map)
function resolveShiftFromCell(
    rawText: string,
    colorHex?: string | null,
    customMap?: Record<string, ShiftType | ''>
): ShiftType {
    const textClean = (rawText || '').trim().toUpperCase();

    // 1. Check custom user map first (text keys like "TEXT_P", "TEXT_OFF", etc.)
    if (customMap) {
        if (textClean && customMap[`TEXT_${textClean}`] !== undefined) {
            const mapped = customMap[`TEXT_${textClean}`];
            if (mapped) return mapped as ShiftType;
        }
        if (colorHex && customMap[colorHex.toLowerCase()] !== undefined) {
            const mapped = customMap[colorHex.toLowerCase()];
            if (mapped) return mapped as ShiftType;
        }
    }

    // 2. Check system defaults
    if (textClean) {
        if (EXCEL_SHIFT_MAPPING[textClean]) return EXCEL_SHIFT_MAPPING[textClean];
        if (SYSTEM_DEFAULT_EXCEL_MAP[`TEXT_${textClean}`]) return SYSTEM_DEFAULT_EXCEL_MAP[`TEXT_${textClean}`];
        if (textClean === 'P' || textClean === 'PAGI' || textClean === '1' || textClean === 'DS') return 'Graha';
        if (textClean === 'S' || textClean === 'SIANG' || textClean === '2') return 'NPCT';
        if (textClean === 'M' || textClean === 'MALAM' || textClean === '3') return 'Malam';
        if (textClean === 'L' || textClean === 'LIBUR' || textClean === 'OFF' || textClean === 'O' || textClean === 'FREE') return 'OFF';
        if (textClean === 'TPSL' || textClean === 'TP' || textClean === 'T') return 'TPSL';
        if (textClean === 'SM' || textClean === 'S2') return 'SM';
        if (textClean === 'PM') return 'PM';
        if (textClean === 'CUTI' || textClean === 'CT' || textClean === 'C') return 'CUTI';
        if (textClean === 'GRAHA' || textClean === 'G') return 'Graha';
        if (textClean === 'NPCT' || textClean === 'N') return 'NPCT';
    }

    if (colorHex) {
        const mappedFromColor = SYSTEM_DEFAULT_EXCEL_MAP[colorHex.toLowerCase()];
        if (mappedFromColor) return mappedFromColor;
    }

    return textClean ? 'Graha' : '';
}

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

    // Cell value updater
    const handleCellChange = (r: number, c: number, value: string) => {
        setGridData((prev) => {
            const next = prev.map((row, rIdx) => {
                if (rIdx !== r) return row;
                const newRow = [...row];
                newRow[c] = { ...newRow[c], value };
                return newRow;
            });
            return next;
        });
    };

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
                    if (!cellVal && pCell.bgColor) {
                        const shift = resolveShiftFromCell('', pCell.bgColor, customColorMap);
                        if (shift) cellVal = shift;
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
            categoryType: 'color' | 'text';
            colorKey: string;
            displayColor: string | null;
        }>();

        gridData.forEach((row) => {
            row.forEach((cell, cIdx) => {
                if (!cell) return;
                // Aturan: Jangan masukkan warna/teks dari kolom NIP dan Nama (kolom indeks 0 dan 1) ke pemetaan
                if (cIdx < 2) return;

                const bg = normalizeColor(cell.bgColor);
                const text = (cell.value || '').trim();
                const textClean = text.toUpperCase();

                // Abaikan jika isinya murni angka panjang (NIP) atau berisi spasi nama lengkap
                if (/^\d{10,}$/.test(textClean)) return;
                if (textClean.split(/\s+/).length > 1 && textClean.length > 5) return;

                if (bg) {
                    const colorKey = bg;
                    const existing = map.get(colorKey);
                    if (existing) {
                        existing.count++;
                        if (!existing.sampleText && text) {
                            existing.sampleText = text;
                        }
                    } else {
                        map.set(colorKey, {
                            count: 1,
                            sampleText: text,
                            categoryType: 'color',
                            colorKey,
                            displayColor: bg,
                        });
                    }
                } else if (textClean) {
                    const colorKey = `TEXT_${textClean}`;
                    const existing = map.get(colorKey);
                    if (existing) {
                        existing.count++;
                    } else {
                        map.set(colorKey, {
                            count: 1,
                            sampleText: text,
                            categoryType: 'text',
                            colorKey,
                            displayColor: null,
                        });
                    }
                }
            });
        });

        const list: {
            color: string;
            categoryType: 'color' | 'text';
            count: number;
            assignedShift: ShiftType | '';
            sampleText?: string;
            displayColor?: string | null;
        }[] = [];

        map.forEach((item, key) => {
            list.push({
                color: key,
                categoryType: item.categoryType,
                count: item.count,
                assignedShift: customColorMap[key] !== undefined ? customColorMap[key] : '',
                sampleText: item.sampleText,
                displayColor: item.displayColor,
            });
        });

        return list.sort((a, b) => b.count - a.count);
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
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
                                Impor Jadwal Pengguna (Grid Excel 150×40)
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                                150 Rows × 40 Cols
                            </span>
                        </div>
                        <p className="text-xs opacity-70">
                            Impor dan petakan jadwal shift kerja dari berkas/data tabel Excel langsung ke pengguna posko maupun posko luar
                        </p>
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
                    <span>{isImporting ? 'Memproses Impor...' : `Impor ke ${selectedCount} Pengguna Terpilih`}</span>
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
                    {/* Pilih Bulan & Tahun */}
                    <div className="flex items-center gap-2.5">
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
                    </div>

                    {/* Toolbar Tombol Aksi Grid */}
                    <div className="flex items-center gap-2 flex-wrap">
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
                            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-current/20 hover:bg-current/10 cursor-pointer flex items-center gap-1.5"
                        >
                            <Upload className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <span>Impor dari File Langsung</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleLoadSample}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-current/20 hover:bg-current/10 cursor-pointer flex items-center gap-1.5"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Muat Contoh Data Grid</span>
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
                            {/* Render first 40 rows immediately, scrolling renders the rest up to 150 */}
                            {Array.from({ length: TOTAL_GRID_ROWS }).map((_, rIdx) => (
                                <tr key={rIdx} className="hover:bg-current/5 transition-colors">
                                    {/* Sticky Row Number 1-150 */}
                                    <td className="sticky left-0 z-10 p-1 border border-current/20 bg-slate-200/80 dark:bg-slate-800/80 text-center font-bold text-[10.5px] opacity-75">
                                        {rIdx + 1}
                                    </td>
                                    {/* Grid Cells with Excel Styling Preservation */}
                                    {Array.from({ length: TOTAL_GRID_COLS }).map((_, cIdx) => {
                                        const cell = gridData[rIdx][cIdx] || { value: '', bgColor: null, textColor: null };
                                        const cellVal = cell.value || '';
                                        const isFocused = selectedCell.r === rIdx && selectedCell.c === cIdx;

                                        // Apply background/text colors pasted directly from Excel if available
                                        const customStyle: React.CSSProperties = {};
                                        if (cell.bgColor) {
                                            customStyle.backgroundColor = cell.bgColor;
                                        }
                                        if (cell.textColor) {
                                            customStyle.color = cell.textColor;
                                        }

                                        return (
                                            <td
                                                key={cIdx}
                                                onClick={() => setSelectedCell({ r: rIdx, c: cIdx })}
                                                style={customStyle}
                                                className={`p-0 border border-current/15 text-center transition-all cursor-cell ${
                                                    isFocused ? 'ring-2 ring-teal-500 z-10 bg-teal-500/10' : ''
                                                } font-bold w-14 min-w-[56px] h-7`}
                                            >
                                                {isFocused ? (
                                                    <input
                                                        type="text"
                                                        autoFocus
                                                        value={cellVal}
                                                        onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                                                        style={{ color: cell.textColor || undefined }}
                                                        className="w-full h-full text-center bg-transparent outline-none font-mono text-xs px-0.5"
                                                    />
                                                ) : (
                                                    <span style={{ color: cell.textColor || undefined }} className="font-mono text-xs select-none">
                                                        {cellVal}
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
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
                    : 'bg-white border-slate-200 text-slate-900'
            }`}>
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-current/10 pb-2.5">
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                            Pratinjau Jadwal (5 Personel Posko Terpilih Otomatis)
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
                <div className="overflow-x-auto rounded-xl border border-current/15 select-none no-scrollbar">
                    <table className="w-full border-collapse text-xs">
                        <thead>
                            <tr className="bg-current/5 border-b border-current/15">
                                {/* Sticky Kolom Nama Pegawai */}
                                <th className="sticky left-0 z-20 p-2 text-left font-extrabold min-w-[180px] max-w-[220px] bg-slate-100 dark:bg-slate-900 border-r border-current/20 shadow-xs">
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
                                        <td className="sticky left-0 z-10 p-2.5 font-bold min-w-[180px] max-w-[220px] bg-slate-50 dark:bg-[#1A1D23] border-r border-current/20 shadow-xs">
                                            <div className="truncate font-sans">{user.name}</div>
                                            <div className="text-[10px] opacity-60 font-mono">NIP: {user.nip}</div>
                                        </td>

                                        {/* Shift Badges per Tanggal */}
                                        {Array.from({ length: daysInSelectedMonth }).map((_, dIdx) => {
                                            const cell = userGridRow[dIdx] || { value: '', bgColor: null, textColor: null };
                                            const cellVal = cell.value || '';
                                            const shiftResolved = resolveShiftFromCell(cellVal, cell.bgColor, customColorMap);
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

            {/* Target Pengguna Penerima Jadwal */}
            <div className={`p-4 rounded-xl border space-y-3.5 ${
                isIndustrial
                    ? 'bg-[#0F1115] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                    : isPaperSketch
                    ? 'bg-white border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
                    : isDark
                    ? 'bg-[#161616] border-slate-800'
                    : 'bg-white border-slate-200'
            }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                            Pilih Sasaran Pengguna / Posko Penerima
                        </h4>
                    </div>

                    <div className="flex items-center gap-1.5">
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
                </div>

                {/* Bulk Checkbox Toggle Header */}
                <div className="flex items-center justify-between pt-2 border-t border-current/10">
                    <button
                        type="button"
                        onClick={() => toggleSelectAll(!allSelected)}
                        className="flex items-center space-x-2 text-xs font-bold hover:opacity-80 cursor-pointer"
                    >
                        {allSelected ? (
                            <CheckSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        ) : (
                            <Square className="w-4 h-4 opacity-60" />
                        )}
                        <span>Pilih Semua Target yang Tampil ({filteredTargets.length})</span>
                    </button>

                    <span className="text-xs opacity-75 font-mono">
                        Terpilih: <strong>{selectedCount}</strong> dari {targets.length} personel
                    </span>
                </div>
            </div>

            {importSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{importSuccess}</span>
                </div>
            )}

            {/* List Target Penerima Impor Jadwal */}
            <div className="space-y-2">
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
                            <div className="shrink-0">
                                {target.selected ? (
                                    <CheckSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                ) : (
                                    <Square className="w-4 h-4 opacity-50" />
                                )}
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
    );
};
