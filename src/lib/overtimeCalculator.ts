import { normalizeShift } from '../types';
import { parseTimeToMinutes } from '../utils/lembur';

export interface OvertimeResult {
    isEligible: boolean;
    isLembur: boolean;
    overtimeMinutes: number;
    overtimeHoursFormatted: string;
    basePulangStr: string;
    flexibleMinutes: number;
    effectivePulangStr: string;
    explanation: string;
}

/**
 * Format minutes into "HH:MM"
 */
function formatMinutesToTime(minutes: number): string {
    const normalized = ((minutes % 1440) + 1440) % 1440;
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Hitung kalkulasi lembur harian untuk DayDetailModal & komponen terkait
 */
export function calculateOvertime(
    shiftStr: string | undefined | null,
    jamMasukStr: string | undefined | null,
    jamPulangStr: string | undefined | null
): OvertimeResult {
    const emptyResult: OvertimeResult = {
        isEligible: false,
        isLembur: false,
        overtimeMinutes: 0,
        overtimeHoursFormatted: '0j',
        basePulangStr: '--:--',
        flexibleMinutes: 0,
        effectivePulangStr: '--:--',
        explanation: 'Shift tidak memenuhi kriteria lembur.',
    };

    if (!shiftStr) return emptyResult;
    const shift = normalizeShift(shiftStr);
    if (!shift || shift === 'CUTI') return emptyResult;

    // Tentukan konfigurasi shift dasar
    let baseStartMin = 7 * 60 + 30; // 07:30
    let baseEndMin = 17 * 60 + 30;  // 17:30
    let maxFlexMinutes = 30;

    if (shift === 'Graha' || shift === 'NPCT' || shift === 'TPSL') {
        baseStartMin = 7 * 60 + 30;
        baseEndMin = 17 * 60 + 30;
    } else if (shift === 'SM') {
        baseStartMin = 12 * 60 + 30;
        baseEndMin = 22 * 60;
    } else if (shift === 'PM') {
        baseStartMin = 7 * 60 + 30;
        baseEndMin = 17 * 60;
    } else if (shift === 'Malam') {
        baseStartMin = 19 * 60 + 30;
        baseEndMin = 4 * 60 + 30; // Subuh esok hari
    } else if (shift === 'OFF') {
        // Shift OFF pada hari libur / tanggal merah jika hadir kerja
        if (jamMasukStr && jamPulangStr) {
            const masuk = parseTimeToMinutes(jamMasukStr);
            const pulang = parseTimeToMinutes(jamPulangStr);
            if (masuk !== null && pulang !== null) {
                let diff = pulang - masuk;
                if (diff < 0 && pulang < 360) {
                    diff += 1440;
                }
                const isLembur = diff >= 180; // Min 3 jam untuk OFF
                const hours = Math.floor(diff / 60);
                const mins = diff % 60;
                return {
                    isEligible: true,
                    isLembur,
                    overtimeMinutes: isLembur ? diff : 0,
                    overtimeHoursFormatted: isLembur ? `${hours}j${mins > 0 ? ` ${mins}m` : ''}` : '0j',
                    basePulangStr: jamMasukStr,
                    flexibleMinutes: 0,
                    effectivePulangStr: jamMasukStr,
                    explanation: isLembur
                        ? `Lembur jadwal OFF: Total kerja ${hours} jam ${mins} menit (memenuhi syarat min 3 jam).`
                        : `Jadwal OFF belum mencapai batas minimum lembur (minimal 3 jam).`,
                };
            }
        }
        return emptyResult;
    } else {
        // Shift kustom / lainnya
        return emptyResult;
    }

    const basePulangStr = formatMinutesToTime(baseEndMin);
    const masukMin = parseTimeToMinutes(jamMasukStr);
    const pulangMin = parseTimeToMinutes(jamPulangStr);

    // Syarat Mutlak: Harus ada 2 data lengkap (absen masuk dan absen pulang)
    if (masukMin === null || pulangMin === null) {
        let explanation = 'Belum lengkap absen masuk dan absen pulang. Lembur hanya dihitung jika kedua data terisi.';
        if (masukMin === null && pulangMin === null) {
            explanation = 'Belum ada data absen masuk dan pulang.';
        } else if (masukMin === null) {
            explanation = 'Belum ada data absen masuk (lembur tidak dihitung jika hanya ada absen pulang).';
        } else {
            explanation = `Jam pulang efektif: ${basePulangStr}. Belum ada data absen pulang.`;
        }

        return {
            isEligible: true,
            isLembur: false,
            overtimeMinutes: 0,
            overtimeHoursFormatted: '0j',
            basePulangStr,
            flexibleMinutes: 0,
            effectivePulangStr: basePulangStr,
            explanation,
        };
    }

    // Hitung fleksibilitas jam masuk
    let flexibleMinutes = 0;
    if (masukMin > baseStartMin) {
        flexibleMinutes = Math.min(maxFlexMinutes, Math.max(0, masukMin - baseStartMin));
    }

    const effectiveEndMin = baseEndMin + flexibleMinutes;
    const effectivePulangStr = formatMinutesToTime(effectiveEndMin);

    let diff = pulangMin - effectiveEndMin;
    if (diff < 0 && pulangMin < 360 && effectiveEndMin > 720) {
        diff = (pulangMin + 1440) - effectiveEndMin;
    }

    const isLembur = diff >= 120; // Min 2 jam (120 menit)
    const cappedMinutes = isLembur ? Math.min(180, diff) : 0; // Maksimal 3 jam (180 menit)
    const hours = Math.floor(cappedMinutes / 60);
    const mins = cappedMinutes % 60;

    let explanation = '';
    if (isLembur) {
        explanation = `Lembur terhitung ${hours} jam ${mins > 0 ? `${mins} menit ` : ''}(kelebihan ${Math.floor(diff / 60)}j ${diff % 60}m setelah ${effectivePulangStr}, dibatasi maks 3 jam).`;
    } else if (diff > 0) {
        explanation = `Kelebihan kerja ${Math.floor(diff / 60)}j ${diff % 60}m belum mencapai batas minimum lembur (minimal 2 jam setelah ${effectivePulangStr}).`;
    } else {
        explanation = `Pulang sebelum atau tepat pada jam pulang efektif (${effectivePulangStr}). Tidak ada lembur.`;
    }

    return {
        isEligible: true,
        isLembur,
        overtimeMinutes: cappedMinutes,
        overtimeHoursFormatted: isLembur ? `${hours}j${mins > 0 ? ` ${mins}m` : ''}` : '0j',
        basePulangStr,
        flexibleMinutes,
        effectivePulangStr,
        explanation,
    };
}
