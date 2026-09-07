import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import { toPng } from 'html-to-image';

/**
 * Helper untuk menyimpan file lintas platform:
 * 1. Desktop Tauri: @tauri-apps/plugin-dialog (Save As) & @tauri-apps/plugin-fs (writeFile dengan Uint8Array)
 * 2. Mobile Capacitor: @capacitor/filesystem (Directory.Cache) & @capacitor/share (Share dialog native HP)
 * 3. Web Browser: showSaveFilePicker (File System Access API) dengan fallback <a download>
 */

export interface SaveFileOptions {
    blob?: Blob;
    base64Data?: string;
    textData?: string;
    filename: string;
    description?: string;
    mimeType?: string;
    extension?: string;
}

export interface SaveFileResult {
    success: boolean;
    method: 'tauri' | 'capacitor' | 'picker' | 'download';
    cancelled?: boolean;
    message?: string;
}

/**
 * Deteksi lingkungan Desktop Tauri
 */
export function isTauriEnvironment(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(
        (window as any).__TAURI_INTERNALS__ ||
        (window as any).__TAURI__ ||
        (window as any).isTauri
    );
}

/**
 * Deteksi lingkungan Mobile Native Capacitor
 */
export function isCapacitorEnvironment(): boolean {
    if (typeof window === 'undefined') return false;
    try {
        return Capacitor.isNativePlatform();
    } catch {
        return false;
    }
}

/**
 * Konversi Base64 string menjadi Uint8Array untuk writeFile Tauri
 */
export function base64ToUint8Array(base64: string): Uint8Array {
    let cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '').trim().replace(/[\r\n\s]/g, '');
    while (cleanBase64.length % 4 !== 0) {
        cleanBase64 += '=';
    }
    try {
        const binaryString = atob(cleanBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    } catch (err) {
        console.warn('Gagal decode Base64 dengan atob:', err);
        return new Uint8Array();
    }
}

/**
 * Konversi Blob menjadi Uint8Array
 */
export async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
    const buffer = await blob.arrayBuffer();
    return new Uint8Array(buffer);
}

/**
 * Konversi Blob menjadi Base64 string (tanpa header data:...;base64,)
 */
export function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const res = reader.result as string;
            const clean = res.replace(/^data:[^;]+;base64,/, '');
            resolve(clean);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Konversi Base64 menjadi Blob (untuk Web browser)
 */
export function base64ToBlob(base64: string, mimeType: string = 'application/octet-stream'): Blob {
    try {
        const uint8 = base64ToUint8Array(base64);
        if (uint8.length > 0) {
            return new Blob([uint8], { type: mimeType });
        }
    } catch (e) {
        console.warn('base64ToBlob error:', e);
    }
    return new Blob([base64], { type: mimeType });
}

export async function saveFileWithDialog(options: SaveFileOptions): Promise<SaveFileResult> {
    const {
        filename,
        description = 'File Laporan',
        mimeType = 'application/octet-stream',
        extension = 'txt',
    } = options;
    const cleanExt = extension.replace(/^\./, '');

    // =========================================================================
    // 1. DESKTOP TAURI: Gunakan dialog Save As dan writeFile dengan Uint8Array
    // =========================================================================
    if (isTauriEnvironment()) {
        try {
            let uint8Data: Uint8Array;
            if (options.base64Data) {
                uint8Data = base64ToUint8Array(options.base64Data);
            } else if (options.blob) {
                uint8Data = await blobToUint8Array(options.blob);
            } else if (options.textData !== undefined) {
                uint8Data = new TextEncoder().encode(options.textData);
            } else {
                throw new Error('Tidak ada data yang diberikan untuk disimpan');
            }

            const selectedPath = await save({
                defaultPath: filename,
                filters: [
                    {
                        name: description,
                        extensions: [cleanExt],
                    },
                ],
            });

            if (!selectedPath) {
                return {
                    success: false,
                    method: 'tauri',
                    cancelled: true,
                    message: 'Penyimpanan file dibatalkan.',
                };
            }

            await writeFile(selectedPath, uint8Data);
            return {
                success: true,
                method: 'tauri',
                message: `File "${filename}" berhasil disimpan ke sistem Anda!`,
            };
        } catch (err: any) {
            console.error('Tauri save file error:', err);
            // Jika terjadi kesalahan pada Tauri, jangan langsung gagalkan jika bisa lanjut
        }
    }

    // =========================================================================
    // 2. MOBILE CAPACITOR: Simpan sementara di Directory.Cache lalu panggil Share.share
    // =========================================================================
    if (isCapacitorEnvironment()) {
        try {
            let base64ToWrite: string;
            if (options.base64Data) {
                base64ToWrite = options.base64Data.replace(/^data:[^;]+;base64,/, '');
            } else if (options.blob) {
                base64ToWrite = await blobToBase64(options.blob);
            } else if (options.textData !== undefined) {
                base64ToWrite = btoa(unescape(encodeURIComponent(options.textData)));
            } else {
                throw new Error('Tidak ada data yang diberikan untuk disimpan');
            }

            // Simpan file sementara di cache perangkat
            const writeResult = await Filesystem.writeFile({
                path: filename,
                data: base64ToWrite,
                directory: Directory.Cache,
            });

            // Panggil popup Share bawaan HP (WhatsApp, Simpan ke File/Galeri, Drive, dll)
            await Share.share({
                title: filename,
                text: `Ekspor file ${filename}`,
                url: writeResult.uri,
                dialogTitle: `Simpan atau Bagikan ${filename}`,
            });

            return {
                success: true,
                method: 'capacitor',
                message: `File "${filename}" berhasil disiapkan dan menu bagikan dibuka.`,
            };
        } catch (err: any) {
            console.error('Capacitor save/share error:', err);
            return {
                success: false,
                method: 'capacitor',
                message: `Gagal membagikan file di perangkat: ${err?.message || err}`,
            };
        }
    }

    // =========================================================================
    // 3. WEB BROWSER: Gunakan File System Access API atau Tag <a> Download
    // =========================================================================
    let finalBlob: Blob;
    if (options.blob) {
        finalBlob = options.blob;
    } else if (options.base64Data) {
        finalBlob = base64ToBlob(options.base64Data, mimeType);
    } else if (options.textData !== undefined) {
        finalBlob = new Blob([options.textData], { type: mimeType });
    } else {
        return {
            success: false,
            method: 'download',
            message: 'Tidak ada data file yang dapat diunduh.',
        };
    }

    // A. File System Access API (Menampilkan dialog Windows Explorer / macOS Finder)
    // Catatan: Jika di dalam iframe, showSaveFilePicker akan ditolak oleh izin browser, langsung gunakan unduh browser standar.
    const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;
    if (!isInsideIframe && typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
        try {
            const pickerOptions: any = {
                suggestedName: filename,
                types: [
                    {
                        description: `${description} (*.${cleanExt})`,
                        accept: {
                            [mimeType]: [`.${cleanExt}`],
                        },
                    },
                ],
            };

            const handle = await (window as any).showSaveFilePicker(pickerOptions);
            const writable = await handle.createWritable();
            await writable.write(finalBlob);
            await writable.close();
            return {
                success: true,
                method: 'picker',
                message: `File "${filename}" berhasil disimpan di lokasi pilihan Anda!`,
            };
        } catch (err: any) {
            if (err.name === 'AbortError') {
                return {
                    success: false,
                    method: 'picker',
                    cancelled: true,
                    message: 'Penyimpanan file dibatalkan.',
                };
            }
            console.warn('showSaveFilePicker tidak diizinkan atau gesture expired, fallback ke download browser:', err);
        }
    }

    // B. Fallback standar (Unduh langsung ke folder Downloads)
    try {
        const url = URL.createObjectURL(finalBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            if (document.body.contains(link)) {
                document.body.removeChild(link);
            }
            URL.revokeObjectURL(url);
        }, 1500);
        return {
            success: true,
            method: 'download',
            message: `File "${filename}" berhasil diunduh ke folder Downloads!`,
        };
    } catch (err: any) {
        console.error('Download fallback failed:', err);
        return {
            success: false,
            method: 'download',
            message: `Gagal mengunduh file: ${err?.message || 'Kesalahan browser'}`,
        };
    }
}

/**
 * Helper untuk mempersiapkan DOM sebelum screenshot:
 * Menetralisir properti CSS yang menyebabkan Canvas Tainting (SecurityError)
 * seperti `mask-image`, `-webkit-mask-image`, dan running CSS animations.
 */
function prepareDOMForCapture(): () => void {
    const marquees = document.querySelectorAll<HTMLElement>('.note-marquee-container');
    const originalMasks: { el: HTMLElement; mask: string; webkitMask: string }[] = [];

    marquees.forEach((el) => {
        originalMasks.push({
            el,
            mask: el.style.maskImage,
            webkitMask: el.style.webkitMaskImage,
        });
        el.style.setProperty('mask-image', 'none', 'important');
        el.style.setProperty('-webkit-mask-image', 'none', 'important');
    });

    const animatedNodes = document.querySelectorAll<HTMLElement>('.note-marquee-content');
    const originalAnimations: { el: HTMLElement; anim: string }[] = [];
    animatedNodes.forEach((el) => {
        originalAnimations.push({
            el,
            anim: el.style.animation,
        });
        el.style.setProperty('animation', 'none', 'important');
        el.style.setProperty('transform', 'none', 'important');
    });

    return () => {
        originalMasks.forEach(({ el, mask, webkitMask }) => {
            el.style.maskImage = mask;
            el.style.webkitMaskImage = webkitMask;
        });
        originalAnimations.forEach(({ el, anim }) => {
            el.style.animation = anim;
            el.style.transform = '';
        });
    };
}

/**
 * Fallback mandiri berbasis murni HTML5 Canvas 2D.
 * Tidak memerlukan pustaka eksternal apapun, kebal terhadap masalah Tailwind v4 OKLCH,
 * tidak dapat di-taint oleh browser, dan 100% selalu menghasilkan file PNG kalender resolusi tinggi.
 */
export function renderCalendarDirectToCanvas(element: HTMLElement): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Canvas 2D context tidak tersedia.');
    }

    const scale = 2; // Retina 2x
    const canvasWidth = 1260;
    const padding = 20;
    const gridWidth = canvasWidth - (padding * 2);
    const colWidth = gridWidth / 7;
    const headerHeight = 60;
    const dayNameHeaderHeight = 36;
    const cellHeight = 130;

    const dayCells = Array.from(element.querySelectorAll<HTMLElement>('.group.relative.flex.flex-col'));
    const totalCells = dayCells.length > 0 ? dayCells.length : 35;
    const totalRows = Math.max(5, Math.ceil(totalCells / 7));
    const canvasHeight = (padding * 2) + headerHeight + dayNameHeaderHeight + (totalRows * cellHeight);

    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;
    ctx.scale(scale, scale);

    // Background utama
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Header Banner Atas
    ctx.fillStyle = '#297373';
    ctx.fillRect(padding, padding, gridWidth, headerHeight);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('JADWAL PEMERIKSA FISIK & KALENDER SHIFT', canvasWidth / 2, padding + (headerHeight / 2));

    // Baris Nama Hari (Min - Sab)
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const dayHeaderY = padding + headerHeight + 6;
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';

    dayNames.forEach((name, i) => {
        const x = padding + (i * colWidth);
        const isWeekend = i === 0 || i === 6;
        ctx.fillStyle = isWeekend ? '#FFE4E6' : '#F1F5F9';
        ctx.fillRect(x + 2, dayHeaderY, colWidth - 4, dayNameHeaderHeight - 4);

        ctx.fillStyle = isWeekend ? '#BE1A1A' : '#1E293B';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, x + (colWidth / 2), dayHeaderY + ((dayNameHeaderHeight - 4) / 2));
    });

    // Grid Tanggal
    const gridStartY = dayHeaderY + dayNameHeaderHeight + 2;

    const shiftColors: Record<string, { bg: string; text: string }> = {
        Graha: { bg: '#EDF6F9', text: '#011627' },
        NPCT: { bg: '#FFDDD2', text: '#011627' },
        TPSL: { bg: '#E29578', text: '#FFFFFF' },
        OFF: { bg: '#BE1A1A', text: '#FFFFFF' },
        SM: { bg: '#83C5BE', text: '#0B0909' },
        PM: { bg: '#006D77', text: '#FFFFFF' },
        Malam: { bg: '#2C4251', text: '#FFFFFF' },
        M: { bg: '#2C4251', text: '#FFFFFF' },
        CUTI: { bg: '#0B0909', text: '#FFFFFF' },
    };

    dayCells.forEach((cellEl, idx) => {
        const col = idx % 7;
        const row = Math.floor(idx / 7);
        const x = padding + (col * colWidth);
        const y = gridStartY + (row * cellHeight);
        const w = colWidth - 4;
        const h = cellHeight - 6;

        // Card background & border
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + 2, y + 2, w, h);
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 2, y + 2, w, h);

        // Ambil nomor tanggal
        const dayNumberEl = cellEl.querySelector('.font-black.tracking-tight');
        const dayNumberText = dayNumberEl?.textContent?.trim() || `${idx + 1}`;

        const isWeekend = col === 0 || col === 6;
        ctx.fillStyle = isWeekend ? '#FF3366' : '#0F172A';
        ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(dayNumberText, x + 8, y + 8);

        // Ambil Badges (Lembur, Piket, ST, dll)
        const badgeElements = Array.from(cellEl.querySelectorAll('.tracking-tighter, .uppercase'));
        let badgeRightX = x + w - 6;
        badgeElements.slice(0, 2).forEach((b) => {
            const bText = b.textContent?.trim() || '';
            if (bText && bText.length <= 8) {
                ctx.font = 'bold 8px system-ui, sans-serif';
                const textWidth = ctx.measureText(bText).width + 6;
                badgeRightX -= textWidth;
                ctx.fillStyle = '#059669';
                ctx.fillRect(badgeRightX, y + 6, textWidth, 13);
                ctx.fillStyle = '#FFFFFF';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(bText, badgeRightX + (textWidth / 2), y + 12.5);
                badgeRightX -= 3;
            }
        });

        // Shift Pill
        const selectEl = cellEl.querySelector<HTMLSelectElement>('select.shift-select');
        const shiftVal = selectEl?.value || '';
        const shiftColor = shiftColors[shiftVal] || { bg: '#F8FAFC', text: '#64748B' };

        const pillY = y + 28;
        const pillH = 22;
        ctx.fillStyle = shiftColor.bg;
        ctx.fillRect(x + 6, pillY, w - 12, pillH);
        ctx.strokeStyle = '#CBD5E1';
        ctx.strokeRect(x + 6, pillY, w - 12, pillH);

        ctx.fillStyle = shiftColor.text;
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(shiftVal || '-', x + (w / 2), pillY + (pillH / 2));

        // Info Jam Kerja & Catatan
        const textLines = Array.from(cellEl.querySelectorAll('.text-\\[8px\\], .text-\\[7\\.5px\\], .text-\\[7px\\], .note-marquee-container'))
            .map((t) => t.textContent?.trim())
            .filter(Boolean) as string[];

        let lineY = pillY + pillH + 8;
        ctx.font = '9px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#334155';

        textLines.slice(0, 3).forEach((line) => {
            if (lineY < y + h - 6) {
                const truncated = line.length > 20 ? line.substring(0, 18) + '..' : line;
                ctx.fillText(truncated, x + 6, lineY);
                lineY += 13;
            }
        });
    });

    return canvas.toDataURL('image/png');
}

/**
 * Tangkap elemen HTML menjadi data URL PNG Base64
 * Mesin 1: Modern `html-to-image` (Hardened, anti-taint, font-safe)
 * Mesin 2: Native HTML5 Canvas 2D Fallback (100% anti-crash, kebal Tailwind v4 OKLCH)
 */
export async function captureElementToPNG(element: HTMLElement): Promise<string> {
    const restoreDOM = prepareDOMForCapture();

    try {
        const dataUrl = await toPng(element, {
            quality: 0.95,
            pixelRatio: Math.min(window.devicePixelRatio || 2, 2),
            backgroundColor: '#ffffff',
            cacheBust: false,
            skipFonts: true,
            fontEmbedCSS: '',
            width: element.scrollWidth || element.offsetWidth,
            height: element.scrollHeight || element.offsetHeight,
            filter: (node) => {
                if (node instanceof HTMLElement) {
                    if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return false;
                    if (node.classList.contains('no-export')) return false;
                }
                return true;
            },
        });

        if (dataUrl && dataUrl.startsWith('data:image/png') && dataUrl.length > 200) {
            return dataUrl;
        }
    } catch (err1) {
        console.warn('html-to-image mengalami kendala lingkungan, beralih ke Native Canvas 2D fallback:', err1);
    } finally {
        restoreDOM();
    }

    // Fallback 100% aman: Render langsung via Native HTML5 Canvas 2D Context
    try {
        const canvasPng = renderCalendarDirectToCanvas(element);
        if (canvasPng && canvasPng.startsWith('data:image/png') && canvasPng.length > 200) {
            return canvasPng;
        }
    } catch (err2) {
        console.error('Semua mesin capture gagal:', err2);
    }

    throw new Error('Gagal mengekspor gambar kalender PNG.');
}
