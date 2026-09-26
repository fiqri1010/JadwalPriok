import { DayData, LiburNasional, normalizeShift } from '../types';

interface RenderCalendarOptions {
    daysState: Record<string, DayData>;
    year: number;
    month: number; // 1 - 12
    monthName: string;
    daftarLibur?: LiburNasional[];
}

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
};

const DAY_HEADERS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

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

export function drawCalendarToCanvas(options: RenderCalendarOptions): HTMLCanvasElement {
    const { daysState, year, month, monthName, daftarLibur = [] } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
        throw new Error('Canvas 2D context tidak didukung.');
    }

    const scale = 2;
    const canvasWidth = 1400;
    const padding = 28;
    const gridWidth = canvasWidth - padding * 2;
    const colWidth = gridWidth / 7;

    const headerHeight = 80;
    const dayNameHeaderHeight = 44;
    const cellHeight = 140;

    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayRaw = new Date(year, month - 1, 1).getDay();
    const firstDayOffset = (firstDayRaw + 6) % 7;
    const totalCells = firstDayOffset + daysInMonth;
    const totalRows = Math.ceil(totalCells / 7);

    const footerHeight = 40;
    const canvasHeight = padding * 2 + headerHeight + dayNameHeaderHeight + totalRows * cellHeight + footerHeight;

    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;
    ctx.scale(scale, scale);

    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 1. Banner Header
    const bannerY = padding;
    const bannerHeight = headerHeight - 12;

    const grad = ctx.createLinearGradient(padding, bannerY, padding + gridWidth, bannerY);
    grad.addColorStop(0, '#0F766E');
    grad.addColorStop(1, '#115E59');
    drawRoundedRect(ctx, padding, bannerY, gridWidth, bannerHeight, 16, undefined, undefined);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('KALENDER JADWAL KERJA', padding + 24, bannerY + 16);

    ctx.fillStyle = '#CCFBF1';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Periode: ${monthName} ${year}`, padding + 24, bannerY + 44);

    // 2. Day Headers
    const dayNamesY = bannerY + bannerHeight + 12;
    DAY_HEADERS.forEach((name, i) => {
        const x = padding + i * colWidth;
        const isWeekend = i === 5 || i === 6;

        const bgHeader = isWeekend ? '#FFE4E6' : '#E2E8F0';
        const borderHeader = isWeekend ? '#FDA4AF' : '#CBD5E1';
        drawRoundedRect(ctx, x + 2, dayNamesY, colWidth - 4, dayNameHeaderHeight - 4, 10, bgHeader, borderHeader, 1);

        ctx.fillStyle = isWeekend ? '#BE123C' : '#1E293B';
        ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, x + colWidth / 2, dayNamesY + (dayNameHeaderHeight - 4) / 2);
    });

    // 3. Cells
    const gridStartY = dayNamesY + dayNameHeaderHeight + 6;

    for (let cellIndex = 0; cellIndex < totalRows * 7; cellIndex++) {
        const col = cellIndex % 7;
        const row = Math.floor(cellIndex / 7);
        const dayNumber = cellIndex - firstDayOffset + 1;
        const x = padding + col * colWidth;
        const y = gridStartY + row * cellHeight;
        const w = colWidth - 4;
        const h = cellHeight - 6;

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
            isLocked: false,
            isManualHoliday: false,
        };

        const paddedD = String(dayNumber).padStart(2, '0');
        const paddedM = String(month).padStart(2, '0');
        const isoDate = `${year}-${paddedM}-${paddedD}`;
        const holidayItem = daftarLibur.find((l) => l.tanggal === isoDate || l.tanggal === dayKey);
        const isWeekend = col === 5 || col === 6;
        const isHoliday = isWeekend || Boolean(dayData.isManualHoliday) || Boolean(holidayItem);

        const cardBg = isHoliday ? '#FFFBFB' : '#FFFFFF';
        const cardBorder = isHoliday ? '#FECDD3' : '#E2E8F0';
        drawRoundedRect(ctx, x + 2, y + 2, w, h, 12, cardBg, cardBorder, 1.2);

        ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillStyle = isHoliday ? '#E11D48' : '#0F172A';
        ctx.fillText(`${dayNumber}`, x + 10, y + 9);

        if (holidayItem && holidayItem.keterangan) {
            ctx.fillStyle = '#E11D48';
            ctx.font = 'italic 8px system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            const ketTruncated = holidayItem.keterangan.length > 20 ? holidayItem.keterangan.substring(0, 18) + '..' : holidayItem.keterangan;
            ctx.fillText(ketTruncated, x + 10, y + 27);
        }

        const shiftName = normalizeShift(dayData.shift);
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
            drawRoundedRect(ctx, x + 8, pillY, pillW, pillH, 8, '#F8FAFC', '#E2E8F0', 1);
            ctx.fillStyle = '#94A3B8';
            ctx.font = '11px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('-', x + 8 + pillW / 2, pillY + pillH / 2);
        }

        let lineY = pillY + pillH + 8;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        if (dayData.jamMasuk || dayData.jamPulang) {
            ctx.fillStyle = '#1E293B';
            ctx.font = 'bold 9px system-ui, sans-serif';
            ctx.fillText(`🕒 ${dayData.jamMasuk || '--:--'} - ${dayData.jamPulang || '--:--'}`, x + 9, lineY);
            lineY += 14;
        }

        if (dayData.absenCeisa) {
            ctx.fillStyle = '#0284C7';
            ctx.font = 'bold 8.5px system-ui, sans-serif';
            ctx.fillText(`📝 Ceisa: ${dayData.absenCeisa}`, x + 9, lineY);
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

    // Footer
    const footerY = canvasHeight - footerHeight + 10;
    ctx.fillStyle = '#64748B';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Aplikasi Kalender Kerja`, padding + 4, footerY + 12);

    return canvas;
}

export function getCalendarPngBlob(options: RenderCalendarOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
        try {
            const canvas = drawCalendarToCanvas(options);
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Gagal menghasilkan blob PNG.'));
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
