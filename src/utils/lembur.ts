import { DayData, normalizeShift } from '../types';

export interface LemburResult {
    lemburMinutes: number; // e.g. 120, 135, 180
    hours: number;         // e.g. 2, 3
    minutes: number;       // e.g. 0, 15, 30
    shortText: string;     // e.g. "2j", "2j 15m", "3j"
    fullText: string;      // e.g. "Lembur 2 Jam 15 Menit"
}

/**
 * Konversi string waktu "HH:mm" atau "HH.mm" ke menit dari 00:00
 */
export function parseTimeToMinutes(timeStr: string | undefined | null): number | null {
    if (!timeStr) return null;
    const clean = timeStr.trim().replace('.', ':');
    const match = clean.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
}

/**
 * Ketentuan Fleksibel 30 Menit:
 * Jika masuk lebih dari baseTime sampai batas baseTime + 30 menit,
 * waktu pulang ditambahkan selisih waktu tersebut.
 */
export function getFlexibleAddedMinutes(jamMasukStr: string | undefined | null, baseStartMinutes: number): number {
    const masukMin = parseTimeToMinutes(jamMasukStr);
    if (masukMin === null) return 0;
    
    // Jika masuk tepat atau sebelum jam dasar, tidak ada tambahan waktu pulang
    if (masukMin <= baseStartMinutes) return 0;
    
    // Tambahkan selisih waktu, dibatasi maksimal 30 menit (misal masuk 07:45 -> 15 menit, masuk 08:15 -> 30 menit)
    const diff = masukMin - baseStartMinutes;
    return Math.min(30, Math.max(0, diff));
}

/**
 * Hitung durasi lembur:
 * Dari target jam pulang (waktu pulang dasar + waktu fleksibel) s.d. jam absen pulang.
 * Syarat: Jika >= 2 jam (120 menit) terhitung lembur. Maksimal 3 jam (180 menit). Kurang dari 2 jam tidak dihitung.
 */
export function calculateOvertimeDuration(
    absenPulangStr: string | undefined | null,
    baseEndMinutes: number,
    flexAddedMinutes: number
): number {
    const pulangMin = parseTimeToMinutes(absenPulangStr);
    if (pulangMin === null) return 0;

    const targetEndMinutes = baseEndMinutes + flexAddedMinutes;
    let diff = pulangMin - targetEndMinutes;

    // Handle pergantian hari / lewat tengah malam (misal shift malam selesai subuh 00:30 - 05:00)
    if (diff < 0 && pulangMin < 360 && targetEndMinutes > 720) {
        diff = (pulangMin + 1440) - targetEndMinutes;
    }

    if (diff >= 120) {
        return Math.min(180, diff);
    }
    return 0;
}

/**
 * Hitung kalkulasi lembur harian berdasarkan shift dan jam absen masuk/pulang:
 * 1. Graha, NPCT, TPSL: dari 17:30 (+ flex masuk 07:30) s.d. absen pulang. Min 2 jam, maks 3 jam.
 * 2. SM: dari 22:00 (+ flex masuk 12:30) s.d. absen pulang. Min 2 jam, maks 3 jam.
 * 3. PM:
 *    - Hitungan 1: dari 17:00 (+ flex masuk 07:30) s.d. absen pulang (min 2 jam, maks 3 jam).
 *    - Hitungan 2: dari 04:30 esok hari (+ flex esok hari) s.d. absen pulang (min 2 jam, maks 3 jam).
 * 4. M (Malam):
 *    - Hitungan 2: dari 04:30 esok hari (+ flex) s.d. absen pulang (min 2 jam, maks 3 jam).
 */
export function calculateDayLembur(
    dayData: DayData | undefined | null,
    nextDayData?: DayData | null,
    isWeekendOrHoliday?: boolean
): LemburResult | null {
    if (!dayData) return null;
    const shift = normalizeShift(dayData.shift);
    if (!shift || shift === 'CUTI') return null;

    // Syarat Mutlak: Harus memiliki 2 data lengkap (absen masuk dan absen pulang).
    // Jika belum lengkap (hanya ada salah satu atau kosong), lembur tidak dihitung.
    const masukMin = parseTimeToMinutes(dayData.jamMasuk);
    const pulangMin = parseTimeToMinutes(dayData.jamPulang) ?? 
        (shift === 'Malam' || shift === 'PM' ? parseTimeToMinutes(nextDayData?.jamPulang) : null);

    if (masukMin === null || pulangMin === null) {
        return null;
    }

    let totalLemburMinutes = 0;

    // Aturan Khusus: Hari dengan jadwal OFF pada tanggal merah/libur/weekend
    // Waktu masuk & pulang bebas. Selisih jam pulang - jam masuk >= 3 jam (180 menit) terhitung lembur.
    if (shift === 'OFF') {
        if (isWeekendOrHoliday && dayData.jamMasuk && dayData.jamPulang) {
            let diff = pulangMin - masukMin;
            if (diff < 0 && pulangMin < 360) {
                diff += 1440; // cross midnight
            }
            if (diff >= 180) { // Lebih dari atau sama dengan 3 jam
                totalLemburMinutes = diff;
            }
        }
        if (totalLemburMinutes === 0) return null;
    } else if (shift === 'Graha' || shift === 'NPCT' || shift === 'TPSL') {
        const flex = getFlexibleAddedMinutes(dayData.jamMasuk, 7 * 60 + 30); // 07:30
        const baseEnd = 17 * 60 + 30; // 17:30
        totalLemburMinutes = calculateOvertimeDuration(dayData.jamPulang, baseEnd, flex);
    } else if (shift === 'SM') {
        const flex = getFlexibleAddedMinutes(dayData.jamMasuk, 12 * 60 + 30); // 12:30
        const baseEnd = 22 * 60; // 22:00
        totalLemburMinutes = calculateOvertimeDuration(dayData.jamPulang, baseEnd, flex);
    } else if (shift === 'PM') {
        // Hitungan 1: dari 17:00 (+ flex) s.d. absen pulang
        const flex1 = getFlexibleAddedMinutes(dayData.jamMasuk, 7 * 60 + 30);
        const lembur1 = calculateOvertimeDuration(dayData.jamPulang, 17 * 60, flex1);

        // Hitungan 2: dari 04:30 esok hari s.d. absen pulang
        let lembur2 = 0;
        const flex2 = getFlexibleAddedMinutes(nextDayData?.jamMasuk, 4 * 60 + 30);
        if (nextDayData?.jamPulang) {
            lembur2 = calculateOvertimeDuration(nextDayData.jamPulang, 4 * 60 + 30, flex2);
        } else if (dayData.absenCeisa && parseTimeToMinutes(dayData.absenCeisa)) {
            const ceisaMin = parseTimeToMinutes(dayData.absenCeisa);
            if (ceisaMin !== null && ceisaMin >= 4 * 60 + 30 && ceisaMin <= 12 * 60) {
                lembur2 = calculateOvertimeDuration(dayData.absenCeisa, 4 * 60 + 30, flex2);
            }
        }

        totalLemburMinutes = lembur1 + lembur2;
    } else if (shift === 'Malam') {
        // Hitungan 2: dari 04:30 esok hari (+ flex) s.d. absen pulang
        const flex = getFlexibleAddedMinutes(
            dayData.jamMasuk || nextDayData?.jamMasuk,
            4 * 60 + 30
        );
        const pulangTarget = dayData.jamPulang || nextDayData?.jamPulang;
        totalLemburMinutes = calculateOvertimeDuration(pulangTarget, 4 * 60 + 30, flex);
    }

    if (totalLemburMinutes < 120) {
        return null;
    }

    const hours = Math.floor(totalLemburMinutes / 60);
    const minutes = totalLemburMinutes % 60;
    const minutesStr = String(minutes).padStart(2, '0');
    const shortText = `${hours}.${minutesStr}`;
    const fullText = `Lembur: ${hours} Jam${minutes > 0 ? ` ${minutes} Menit` : ''}`;

    return {
        lemburMinutes: totalLemburMinutes,
        hours,
        minutes,
        shortText,
        fullText,
    };
}
