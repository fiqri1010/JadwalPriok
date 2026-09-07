import { DayData, LiburNasional } from '../types';
import { calculateDayResult } from './calculator';

interface RenderCalendarOptions {
    daysState: Record<string, DayData>;
    year: number;
    month: number; // 1 - 12
    monthName: string;
    daftarLibur?: LiburNasional[];
    theme?: string;
}

// Skema Palet Warna Shift yang persis sama dengan tampilan kalender web
const SHIFT_PALETTES: Record<string, { bg: string; text: string; border: string }> = {
    Graha: { bg: '#EDF6F9', text: '#011627', border: '#83C5BE' },
    G: { bg: '#EDF6F9', text: '#011627', border: '#83C5BE' },
    NPCT: { bg: '#FFDDD2', text: '#011627', border: '#E29578' },
    N: { bg: '#FFDDD2', text: '#011627', border: '#E29578' },
    NPCS: { bg: '#FFDDD2', text: '#011627', border: '#E29578' },
    TPSL: { bg: '#E29578', text: '#FFFFFF', border: '#C8775B' },
    L: { bg: '#E29578', text: '#FFFFFF', border: '#C8775B' },
    OFF: { bg: '#BE1A1A', text: '#FFFFFF', border: '#9B111E' },
    O: { bg: '#BE1A1A', text: '#FFFFFF', border: '#9B111E' },
    SM: { bg: '#83C5BE', text: '#0B0909', border: '#006D77' },
    S2: { bg: '#83C5BE', text: '#0B0909', border: '#006D77' },
    PM: { bg: '#006D77', text: '#FFFFFF', border: '#004D54' },
    Malam: { bg: '#2C4251', text: '#FFFFFF', border: '#1B2A35' },
    M: { bg: '#2C4251', text: '#FFFFFF', border: '#1B2A35' },
    CUTI: { bg: '#0B0909', text: '#FFFFFF', border: '#000000' },
    C: { bg: '#0B0909', text: '#FFFFFF', border: '#000000' },
    CT: { bg: '#0B0909', text: '#FFFFFF', border: '#000000' },
};

// Senin - Minggu sesuai kalender operasional kerja Indonesia
const DAY_HEADERS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

/**
 * Helper menggambar persegi dengan sudut membulat dengan beginPath bersih.
 * Mencegah akumulasi path canvas yang dapat menyebabkan render saling tumpuk atau terhapus.
 */
function drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fillColor?: string,
    strokeColor?: string,
    lineWidth: number = 1
) {
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, w, h, r);
    } else {
        // Fallback manual rounded rect jika browser lama
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }
}

/**
 * Menggambar kalender shift bulanan secara presisi langsung ke HTML5 Canvas 2D.
 * Kebal terhadap masalah CSS OKLCH, font cross-origin, tainted canvas, dan iFrame sandbox.
 */
export function drawCalendarToCanvas(options: RenderCalendarOptions): HTMLCanvasElement {
    const { daysState, year, month, monthName, daftarLibur = [] } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
        throw new Error('Canvas 2D context tidak didukung.');
    }

    const scale = 2; // Retina 2x untuk gambar ultra-tajam
    const canvasWidth = 1400;
    const padding = 28;
    const gridWidth = canvasWidth - padding * 2;
    const colWidth = gridWidth / 7;

    const headerHeight = 94;
    const dayNameHeaderHeight = 44;
    const cellHeight = 146;

    // Hitung offset hari pertama (Senin = index 0, Minggu = index 6)
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayRaw = new Date(year, month - 1, 1).getDay(); // 0 = Min, 1 = Sen, ...
    const firstDayOffset = (firstDayRaw + 6) % 7; // 0 = Sen, 6 = Min
    const totalCells = firstDayOffset + daysInMonth;
    const totalRows = Math.ceil(totalCells / 7);

    const footerHeight = 48;
    const canvasHeight = padding * 2 + headerHeight + dayNameHeaderHeight + totalRows * cellHeight + footerHeight;

    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;
    ctx.scale(scale, scale);

    // Background Kanvas Luar
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // =========================================================================
    // 1. BANNER HEADER UTAMA
    // =========================================================================
    const bannerY = padding;
    const bannerHeight = headerHeight - 12;

    // Background Banner Gradasi Teal Priok
    ctx.beginPath();
    const grad = ctx.createLinearGradient(padding, bannerY, padding + gridWidth, bannerY);
    grad.addColorStop(0, '#0F766E');
    grad.addColorStop(1, '#115E59');
    drawRoundedRect(ctx, padding, bannerY, gridWidth, bannerHeight, 16, undefined, undefined);
    ctx.fillStyle = grad;
    ctx.fill();

    // Judul Aplikasi
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('JADWAL PEMERIKSA FISIK & KALENDER SHIFT', padding + 24, bannerY + 18);

    // Sub-judul Periode Bulan & Tahun
    ctx.fillStyle = '#CCFBF1';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Periode: ${monthName} ${year} • Pelabuhan Tanjung Priok`, padding + 24, bannerY + 48);

    // Hitung Statistik Bulan Ini
    let totalMasuk = 0;
    let totalLembur = 0;
    let totalPiket = 0;
    let totalOff = 0;

    for (let d = 1; d <= daysInMonth; d++) {
        const key = `${year}-${month}-${d}`;
        const dayData: DayData = daysState[key] || {
            shift: '',
            note: '',
            isMasuk: false,
            jamMasuk: '',
            jamPulang: '',
            absenCeisa: '',
            isHoldDokumen: false,
            isLocked: false,
            isManualHoliday: false,
            isSuratTugasTambahan: false,
        };
        const cellDate = new Date(year, month - 1, d);
        const paddedD = String(d).padStart(2, '0');
        const paddedM = String(month).padStart(2, '0');
        const isoDate = `${year}-${paddedM}-${paddedD}`;
        const holidayItem = daftarLibur.find((l) => l.tanggal === isoDate || l.tanggal === key);
        const calc = calculateDayResult(dayData, cellDate, holidayItem?.keterangan);
        if (dayData.isMasuk || (dayData.shift && dayData.shift !== 'OFF' && dayData.shift !== 'CUTI')) {
            totalMasuk++;
        } else {
            totalOff++;
        }
        if (calc.isLembur) totalLembur++;
        if (calc.isPiket) totalPiket++;
    }

    // Pill Statistik di kanan Banner Header
    const statBoxW = 340;
    const statBoxH = bannerHeight - 24;
    const statBoxX = canvasWidth - padding - statBoxW - 16;
    const statBoxY = bannerY + 12;

    drawRoundedRect(ctx, statBoxX, statBoxY, statBoxW, statBoxH, 12, 'rgba(0, 0, 0, 0.25)', 'rgba(255, 255, 255, 0.15)', 1);

    const stats = [
        { label: 'Kerja', val: `${totalMasuk} Hari` },
        { label: 'OFF', val: `${totalOff} Hari` },
        { label: 'Lembur', val: `${totalLembur}` },
        { label: 'Piket', val: `${totalPiket}` },
    ];
    const statColW = statBoxW / stats.length;
    stats.forEach((st, idx) => {
        const cx = statBoxX + idx * statColW + statColW / 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#99F6E4';
        ctx.font = '10px system-ui, sans-serif';
        ctx.fillText(st.label, cx, statBoxY + 16);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillText(st.val, cx, statBoxY + 34);
    });

    // =========================================================================
    // 2. HEADER NAMA HARI (Sen, Sel, Rab, Kam, Jum, Sab, Min)
    // =========================================================================
    const dayNamesY = bannerY + bannerHeight + 12;
    DAY_HEADERS.forEach((name, i) => {
        const x = padding + i * colWidth;
        const isWeekend = i === 5 || i === 6; // Sab & Min

        const bgHeader = isWeekend ? '#FFE4E6' : '#E2E8F0';
        const borderHeader = isWeekend ? '#FDA4AF' : '#CBD5E1';
        drawRoundedRect(ctx, x + 2, dayNamesY, colWidth - 4, dayNameHeaderHeight - 4, 10, bgHeader, borderHeader, 1);

        ctx.fillStyle = isWeekend ? '#BE123C' : '#1E293B';
        ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, x + colWidth / 2, dayNamesY + (dayNameHeaderHeight - 4) / 2);
    });

    // =========================================================================
    // 3. GRID TANGGAL & DATA SHIFT
    // =========================================================================
    const gridStartY = dayNamesY + dayNameHeaderHeight + 6;

    for (let cellIndex = 0; cellIndex < totalRows * 7; cellIndex++) {
        const col = cellIndex % 7;
        const row = Math.floor(cellIndex / 7);
        const dayNumber = cellIndex - firstDayOffset + 1;
        const x = padding + col * colWidth;
        const y = gridStartY + row * cellHeight;
        const w = colWidth - 4;
        const h = cellHeight - 6;

        // Sel kosong sebelum tanggal 1 atau sesudah hari terakhir bulan
        if (dayNumber < 1 || dayNumber > daysInMonth) {
            drawRoundedRect(ctx, x + 2, y + 2, w, h, 12, '#F1F5F9', '#E2E8F0', 1);
            continue;
        }

        const dayKey = `${year}-${month}-${dayNumber}`;
        const dayData: DayData = daysState[dayKey] || {
            shift: '',
            note: '',
            isMasuk: false,
            jamMasuk: '',
            jamPulang: '',
            absenCeisa: '',
            isHoldDokumen: false,
            isLocked: false,
            isManualHoliday: false,
            isSuratTugasTambahan: false,
        };

        const cellDate = new Date(year, month - 1, dayNumber);
        const paddedD = String(dayNumber).padStart(2, '0');
        const paddedM = String(month).padStart(2, '0');
        const isoDate = `${year}-${paddedM}-${paddedD}`;
        const holidayItem = daftarLibur.find((l) => l.tanggal === isoDate || l.tanggal === dayKey);
        const calc = calculateDayResult(dayData, cellDate, holidayItem?.keterangan);
        const isWeekend = col === 5 || col === 6; // Sab & Min
        const isHoliday = isWeekend || Boolean(dayData.isManualHoliday) || Boolean(holidayItem);

        // Card Sel Tanggal
        const cardBg = isHoliday ? '#FFFBFB' : '#FFFFFF';
        const cardBorder = isHoliday ? '#FECDD3' : '#E2E8F0';
        drawRoundedRect(ctx, x + 2, y + 2, w, h, 12, cardBg, cardBorder, 1.2);

        // Nomor Tanggal
        ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = isHoliday ? '#E11D48' : '#0F172A';
        ctx.fillText(`${dayNumber}`, x + 10, y + 9);

        // Badges (Lembur, Piket, ST, Geser, CP)
        let badgeX = x + w - 4;
        const badges: { text: string; bg: string; fg: string }[] = [];

        if (calc.isLembur) {
            const jamLabel = calc.jamLembur > 0 ? `LMBR ${calc.jamLembur.toFixed(1)}H` : 'LEMBUR';
            badges.push({ text: jamLabel, bg: '#059669', fg: '#FFFFFF' });
        }
        if (calc.isPiket) {
            badges.push({ text: 'PIKET', bg: '#2563EB', fg: '#FFFFFF' });
        }
        if (dayData.isSuratTugasTambahan) {
            badges.push({ text: 'ST', bg: '#4F46E5', fg: '#FFFFFF' });
        }
        if (dayData.isGunakanOffGeser) {
            badges.push({ text: 'GESER', bg: '#7C3AED', fg: '#FFFFFF' });
        }
        if (dayData.isGunakanCP) {
            badges.push({ text: 'CP', bg: '#DB2777', fg: '#FFFFFF' });
        }

        badges.slice(0, 2).forEach((b) => {
            ctx.font = 'bold 8px system-ui, sans-serif';
            const bWidth = ctx.measureText(b.text).width + 8;
            badgeX -= bWidth;
            drawRoundedRect(ctx, badgeX, y + 8, bWidth, 15, 4, b.bg);

            ctx.fillStyle = b.fg;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(b.text, badgeX + bWidth / 2, y + 15.5);
            badgeX -= 3;
        });

        // Label Keterangan Libur Nasional (jika ada)
        if (holidayItem && holidayItem.keterangan) {
            ctx.fillStyle = '#E11D48';
            ctx.font = 'italic 8px system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            const ketTruncated = holidayItem.keterangan.length > 20 ? holidayItem.keterangan.substring(0, 18) + '..' : holidayItem.keterangan;
            ctx.fillText(ketTruncated, x + 10, y + 27);
        }

        // Shift Pill
        const shiftName = dayData.shift || (dayData.isMasuk ? 'Masuk' : '');
        const pillY = y + 36;
        const pillH = 28;
        const pillW = w - 16;

        if (shiftName) {
            const palette = SHIFT_PALETTES[shiftName] || {
                bg: '#F1F5F9',
                text: '#475569',
                border: '#CBD5E1',
            };

            drawRoundedRect(ctx, x + 8, pillY, pillW, pillH, 8, palette.bg, palette.border, 1);

            ctx.fillStyle = palette.text;
            ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(shiftName, x + 8 + pillW / 2, pillY + pillH / 2);
        } else {
            // Empty shift dashed placeholder
            drawRoundedRect(ctx, x + 8, pillY, pillW, pillH, 8, '#F8FAFC', '#E2E8F0', 1);
            ctx.fillStyle = '#94A3B8';
            ctx.font = '11px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('-', x + 8 + pillW / 2, pillY + pillH / 2);
        }

        // Detail Jam Kerja & Absen
        let lineY = pillY + pillH + 8;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        if (dayData.isMasuk && (dayData.jamMasuk || dayData.jamPulang)) {
            ctx.fillStyle = '#1E293B';
            ctx.font = 'bold 9px system-ui, sans-serif';
            ctx.fillText(`🕒 ${dayData.jamMasuk || '--:--'} - ${dayData.jamPulang || '--:--'}`, x + 9, lineY);
            lineY += 14;
        } else if (shiftName === 'OFF' || (!dayData.isMasuk && shiftName)) {
            ctx.fillStyle = '#94A3B8';
            ctx.font = '8.5px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Off', x + w / 2, lineY);
            ctx.textAlign = 'left';
            lineY += 13;
        }

        if (dayData.absenCeisa) {
            ctx.fillStyle = '#0284C7';
            ctx.font = 'bold 8.5px system-ui, sans-serif';
            ctx.fillText(`📝 Absen: ${dayData.absenCeisa}`, x + 9, lineY);
            lineY += 13;
        }

        if (dayData.note) {
            ctx.fillStyle = '#64748B';
            ctx.font = 'italic 8px system-ui, sans-serif';
            const maxNoteLen = 22;
            const truncatedNote = dayData.note.length > maxNoteLen ? dayData.note.substring(0, maxNoteLen - 2) + '..' : dayData.note;
            ctx.fillText(`💬 ${truncatedNote}`, x + 9, lineY);
        }
    }

    // =========================================================================
    // 4. FOOTER INFORMASI
    // =========================================================================
    const footerY = canvasHeight - footerHeight + 10;
    ctx.fillStyle = '#64748B';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
    ctx.fillText(`Diekspor: ${nowStr} • Aplikasi Jadwal Shift & Pemeriksa Fisik Priok`, padding + 4, footerY + 12);

    ctx.textAlign = 'right';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillStyle = '#0F766E';
    ctx.fillText(`Total ${daysInMonth} Hari Kalender`, canvasWidth - padding - 4, footerY + 12);

    return canvas;
}

/**
 * Konversi Canvas langsung ke Blob PNG secara native.
 * Menghindari overhead dan potensi kegagalan decoding Base64 atob.
 */
export function getCalendarPngBlob(options: RenderCalendarOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
        try {
            const canvas = drawCalendarToCanvas(options);
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Gagal menghasilkan blob PNG dari canvas.'));
                    }
                },
                'image/png',
                0.95
            );
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Dapatkan data URL string Base64 dari canvas kalender.
 */
export function getCalendarPngDataUrl(options: RenderCalendarOptions): string {
    const canvas = drawCalendarToCanvas(options);
    return canvas.toDataURL('image/png');
}
