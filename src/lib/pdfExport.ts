import { jsPDF } from 'jspdf';
import { DayData, LiburNasional, normalizeShift } from '../types';
import { drawCalendarToCanvas } from './calendarImageGenerator';

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export interface ExportPdfOptions {
    daysState: Record<string, DayData>;
    filteredEntries: Array<{
        day: number;
        month: number;
        year: number;
        dateKey: string;
        dayName: string;
        data: DayData;
    }>;
    rangeLabel: string;
    filenameSuffix: string;
    daftarLibur?: LiburNasional[];
    monthsToInclude?: Array<{ year: number; month: number }>;
}

export async function generateSchedulePdf(options: ExportPdfOptions): Promise<Blob> {
    const {
        daysState,
        filteredEntries,
        rangeLabel,
        daftarLibur = [],
        monthsToInclude = [],
    } = options;

    // A4 Landscape dimensions in mm: 297 x 210
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 297
    const pageHeight = pdf.internal.pageSize.getHeight(); // 210

    // If monthsToInclude is specified, render each month visual calendar
    if (monthsToInclude.length > 0) {
        for (let i = 0; i < monthsToInclude.length; i++) {
            const { year: mYear, month: mMonth } = monthsToInclude[i];
            const mName = MONTH_NAMES[mMonth - 1];

            if (i > 0) {
                pdf.addPage('a4', 'landscape');
            }

            try {
                const canvas = drawCalendarToCanvas({
                    daysState,
                    year: mYear,
                    month: mMonth,
                    monthName: mName,
                    daftarLibur,
                });

                const imgData = canvas.toDataURL('image/png');
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const aspect = canvasWidth / canvasHeight;

                // Fit nicely on A4 landscape with 10mm side margins and 8mm top/bottom
                const marginX = 10;
                const renderWidth = pageWidth - marginX * 2; // 277mm
                let renderHeight = renderWidth / aspect;
                let marginY = (pageHeight - renderHeight) / 2;

                if (renderHeight > pageHeight - 16) {
                    renderHeight = pageHeight - 16;
                    const fittedWidth = renderHeight * aspect;
                    const fittedMarginX = (pageWidth - fittedWidth) / 2;
                    pdf.addImage(imgData, 'PNG', fittedMarginX, 8, fittedWidth, renderHeight, undefined, 'FAST');
                } else {
                    pdf.addImage(imgData, 'PNG', marginX, marginY, renderWidth, renderHeight, undefined, 'FAST');
                }
            } catch (err) {
                console.error(`Gagal render visual canvas untuk bulan ${mName} ${mYear}:`, err);
            }
        }

        // Add a clean Summary & Roster Table Page at the end
        pdf.addPage('a4', 'portrait');
        renderRosterTablePage(pdf, filteredEntries, rangeLabel);
    } else {
        // Custom Date Range: Render executive report in portrait
        renderRosterTablePage(pdf, filteredEntries, rangeLabel);
    }

    return pdf.output('blob');
}

/**
 * Render halaman tabel daftar shift & ringkasan statistik (Portrait A4: 210 x 297 mm)
 */
function renderRosterTablePage(
    pdf: jsPDF,
    entries: Array<{
        day: number;
        month: number;
        year: number;
        dateKey: string;
        dayName: string;
        data: DayData;
    }>,
    rangeLabel: string
) {
    const pageWidth = pdf.internal.pageSize.getWidth(); // 210
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297

    const marginLeft = 14;
    const marginRight = 14;
    const contentWidth = pageWidth - marginLeft - marginRight; // 182mm

    let currentY = 18;

    // Header Banner
    pdf.setFillColor(15, 118, 110); // #0F766E
    pdf.roundedRect(marginLeft, currentY, contentWidth, 22, 3, 3, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('LAPORAN JADWAL KERJA & SHIFT', marginLeft + 8, currentY + 9);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(`Periode: ${rangeLabel}  |  Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, marginLeft + 8, currentY + 16);

    currentY += 28;

    // Statistics Calculation
    const totalDays = entries.length;
    let totalWork = 0;
    let totalOff = 0;
    let totalCuti = 0;

    entries.forEach((item) => {
        const s = (normalizeShift(item.data.shift) || '').toUpperCase();
        if (s === 'OFF' || s === 'O') {
            totalOff++;
        } else if (s === 'CUTI' || s === 'C') {
            totalCuti++;
        } else if (s) {
            totalWork++;
        }
    });

    // KPI Mini Cards
    const kpiWidth = (contentWidth - 9) / 4;
    const kpis = [
        { label: 'Total Hari', val: totalDays, bg: [241, 245, 249], text: [15, 23, 42] },
        { label: 'Hari Kerja', val: totalWork, bg: [204, 251, 241], text: [15, 118, 110] },
        { label: 'Hari Libur / OFF', val: totalOff, bg: [254, 226, 226], text: [190, 24, 93] },
        { label: 'Cuti', val: totalCuti, bg: [243, 232, 255], text: [126, 34, 206] },
    ];

    kpis.forEach((kpi, idx) => {
        const x = marginLeft + idx * (kpiWidth + 3);
        pdf.setFillColor(kpi.bg[0], kpi.bg[1], kpi.bg[2]);
        pdf.roundedRect(x, currentY, kpiWidth, 14, 2, 2, 'F');

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text(kpi.label, x + 4, currentY + 5);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(kpi.text[0], kpi.text[1], kpi.text[2]);
        pdf.text(String(kpi.val), x + 4, currentY + 11);
    });

    currentY += 18;

    // Table Header
    const colWidths = {
        no: 10,
        tanggal: 24,
        hari: 20,
        shift: 22,
        jam: 32,
        absen: 24,
        catatan: contentWidth - (10 + 24 + 20 + 22 + 32 + 24), // 50mm
    };

    const drawTableHeader = (y: number) => {
        pdf.setFillColor(30, 41, 59); // #1E293B
        pdf.rect(marginLeft, y, contentWidth, 8, 'F');

        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);

        let curX = marginLeft;
        pdf.text('No', curX + 2, y + 5.5);
        curX += colWidths.no;

        pdf.text('Tanggal', curX + 2, y + 5.5);
        curX += colWidths.tanggal;

        pdf.text('Hari', curX + 2, y + 5.5);
        curX += colWidths.hari;

        pdf.text('Shift', curX + 2, y + 5.5);
        curX += colWidths.shift;

        pdf.text('Jam Kerja', curX + 2, y + 5.5);
        curX += colWidths.jam;

        pdf.text('Absen Ceisa', curX + 2, y + 5.5);
        curX += colWidths.absen;

        pdf.text('Catatan', curX + 2, y + 5.5);
    };

    drawTableHeader(currentY);
    currentY += 8;

    // Table Rows
    const rowHeight = 6.5;
    pdf.setFontSize(7.5);

    entries.forEach((item, index) => {
        // Page break if row exceeds page height
        if (currentY + rowHeight > pageHeight - 16) {
            pdf.addPage('a4', 'portrait');
            currentY = 16;
            drawTableHeader(currentY);
            currentY += 8;
        }

        const isEven = index % 2 === 0;
        if (isEven) {
            pdf.setFillColor(248, 250, 252);
            pdf.rect(marginLeft, currentY, contentWidth, rowHeight, 'F');
        }

        const shiftVal = normalizeShift(item.data.shift) || '-';
        const isOff = shiftVal.toUpperCase() === 'OFF' || shiftVal.toUpperCase() === 'O';
        const isCuti = shiftVal.toUpperCase() === 'CUTI' || shiftVal.toUpperCase() === 'C';

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(51, 65, 85);

        let curX = marginLeft;

        // No
        pdf.text(String(index + 1), curX + 2, currentY + 4.5);
        curX += colWidths.no;

        // Tanggal
        const tglStr = `${String(item.day).padStart(2, '0')}/${String(item.month).padStart(2, '0')}/${item.year}`;
        pdf.text(tglStr, curX + 2, currentY + 4.5);
        curX += colWidths.tanggal;

        // Hari
        pdf.text(item.dayName, curX + 2, currentY + 4.5);
        curX += colWidths.hari;

        // Shift Badge Text
        if (isOff) {
            pdf.setTextColor(225, 29, 72);
            pdf.setFont('helvetica', 'bold');
        } else if (isCuti) {
            pdf.setTextColor(147, 51, 234);
            pdf.setFont('helvetica', 'bold');
        } else if (shiftVal !== '-') {
            pdf.setTextColor(15, 118, 110);
            pdf.setFont('helvetica', 'bold');
        }
        pdf.text(shiftVal, curX + 2, currentY + 4.5);

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(51, 65, 85);
        curX += colWidths.shift;

        // Jam Kerja
        const jamStr = (item.data.jamMasuk || item.data.jamPulang)
            ? `${item.data.jamMasuk || '--:--'} - ${item.data.jamPulang || '--:--'}`
            : '-';
        pdf.text(jamStr, curX + 2, currentY + 4.5);
        curX += colWidths.jam;

        // Absen Ceisa
        pdf.text(item.data.absenCeisa || '-', curX + 2, currentY + 4.5);
        curX += colWidths.absen;

        // Catatan
        const noteStr = item.data.note ? item.data.note.slice(0, 32) : '-';
        pdf.text(noteStr, curX + 2, currentY + 4.5);

        // Row bottom line
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.15);
        pdf.line(marginLeft, currentY + rowHeight, marginLeft + contentWidth, currentY + rowHeight);

        currentY += rowHeight;
    });

    // Page Number Footer
    const totalPages = (pdf.internal as any).getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`Halaman ${p} dari ${totalPages}  •  Aplikasi Jadwal Kerja`, marginLeft, pageHeight - 8);
    }
}
