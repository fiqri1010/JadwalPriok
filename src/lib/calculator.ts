import {
    DayData,
    DayCalculationResult,
    ShiftType,
    CeisaScoreResult,
    PeriodPerformanceSummary,
    normalizeShift,
    LiburNasional,
    CeisaRule
} from '../types';
import { getIndonesianHoliday } from '../data/holidays';

export const DEFAULT_CEISA_RULE: CeisaRule = {
    id: 'default-ceisa-rule',
    nama_rule: 'Aturan CEISA Default',
    tanggal_berlaku_efektif: '2020-01-01',
    metode_kalkulasi: 'AVERAGE',
    tipe_nilai: 'SKALA',
    rule_detail: {
        shifts: {
            Graha: { multiplier: 1, thresholds: [] },
            NPCT: { multiplier: 1, thresholds: [] },
            TPSL: { multiplier: 1, thresholds: [] },
            SM: { multiplier: 1, thresholds: [] },
            PM: { multiplier: 1, thresholds: [] },
            Malam: { multiplier: 1, thresholds: [] },
        },
    },
};

export function calculateWorkDuration(jamMasuk: string, jamPulang: string): number {
    if (!jamMasuk || !jamPulang || !jamMasuk.includes(':') || !jamPulang.includes(':')) {
        return 0;
    }
    try {
        const [hIn, mIn] = jamMasuk.split(':').map(Number);
        const [hOut, mOut] = jamPulang.split(':').map(Number);
        if (isNaN(hIn) || isNaN(mIn) || isNaN(hOut) || isNaN(mOut)) return 0;

        let diffMinutes = (hOut * 60 + mOut) - (hIn * 60 + mIn);
        if (diffMinutes < 0) {
            diffMinutes += 24 * 60; // shift malam lintas hari
        }
        return diffMinutes / 60;
    } catch {
        return 0;
    }
}

/**
 * Logika Penilaian Absen CEISA Berdasarkan Shift, Jam Absensi, dan Status Hold Dokumen
 */
export function calculateCeisaScore(
    shift: ShiftType,
    absenCeisa: string,
    isMasuk: boolean = true,
    isHoldDokumen: boolean = false
): CeisaScoreResult {
    // 1. SYARAT: Jika status Hold Dokumen AKTIF (true), hari TIDAK DIHITUNG sama sekali
    if (isHoldDokumen) {
        return {
            score: 0,
            grade: 'N/A',
            ruleDescription: 'Hold Dokumen (Tidak Masuk Penilaian)',
            isEligible: false,
            colorClass: 'slate',
        };
    }

    // 2. Shift Malam (M): Otomatis mendapat Nilai Skala 4
    if (shift === 'Malam' || (shift as string) === 'M') {
        return {
            score: 4,
            grade: 'Sangat Patuh',
            ruleDescription: 'Shift Malam (Otomatis Skala 4)',
            isEligible: true,
            colorClass: 'emerald',
        };
    }

    // 3. Jika tidak masuk atau shift OFF / CUTI tanpa absen CEISA
    if (!isMasuk || shift === 'OFF' || shift === 'CUTI') {
        return {
            score: 0,
            grade: 'N/A',
            ruleDescription: shift === 'CUTI' ? 'Cuti (Tidak Masuk Penilaian)' : 'OFF / Tidak Bertugas',
            isEligible: false,
            colorClass: 'slate',
        };
    }

    // 4. Jika belum ada jam absen CEISA diinput
    if (!absenCeisa || !absenCeisa.trim() || !absenCeisa.includes(':')) {
        return {
            score: 0,
            grade: 'N/A',
            ruleDescription: 'Belum Ada Absen CEISA',
            isEligible: false,
            colorClass: 'slate',
        };
    }

    const [hStr, mStr] = absenCeisa.trim().split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (isNaN(h) || isNaN(m)) {
        return {
            score: 0,
            grade: 'N/A',
            ruleDescription: 'Format Jam Tidak Valid',
            isEligible: false,
            colorClass: 'slate',
        };
    }

    const totalMinutes = h * 60 + m;

    // 5. Shift SM (Siang - Malam):
    // - Jam <= 13:00 -> Skala 4 (Sangat Patuh)
    // - Jam 13:01 s.d. 13:15 -> Skala 3 (Patuh)
    // - Jam 13:16 s.d. 13:30 -> Skala 2 (Kurang Patuh)
    // - Jam > 13:30 -> Skala 1 (Tidak Patuh)
    if (shift === 'SM' || (shift as string) === 'S2') {
        if (totalMinutes <= 13 * 60 + 0) {
            return {
                score: 4,
                grade: 'Sangat Patuh',
                ruleDescription: 'Tepat Waktu (<= 13:00)',
                isEligible: true,
                colorClass: 'emerald',
            };
        } else if (totalMinutes <= 13 * 60 + 15) {
            return {
                score: 3,
                grade: 'Patuh',
                ruleDescription: 'Standar (13:01 - 13:15)',
                isEligible: true,
                colorClass: 'blue',
            };
        } else if (totalMinutes <= 13 * 60 + 30) {
            return {
                score: 2,
                grade: 'Kurang Patuh',
                ruleDescription: 'Terlambat Ringan (13:16 - 13:30)',
                isEligible: true,
                colorClass: 'amber',
            };
        } else {
            return {
                score: 1,
                grade: 'Tidak Patuh',
                ruleDescription: 'Terlambat Berat (> 13:30)',
                isEligible: true,
                colorClass: 'rose',
            };
        }
    }

    // 6. Shift Pagi / Normal & Shift PM (Graha, NPCT, TPSL, PM, G, L, N):
    // - Jam <= 07:30 -> Skala 4 (Sangat Patuh)
    // - Jam 07:31 s.d. 08:00 -> Skala 3 (Patuh)
    // - Jam 08:01 s.d. 08:45 -> Skala 2 (Kurang Patuh)
    // - Jam > 08:45 -> Skala 1 (Tidak Patuh)
    if (['Graha', 'NPCT', 'TPSL', 'PM', 'G', 'L', 'N'].includes(shift)) {
        if (totalMinutes <= 7 * 60 + 30) {
            return {
                score: 4,
                grade: 'Sangat Patuh',
                ruleDescription: 'Tepat Waktu (<= 07:30)',
                isEligible: true,
                colorClass: 'emerald',
            };
        } else if (totalMinutes <= 8 * 60 + 0) {
            return {
                score: 3,
                grade: 'Patuh',
                ruleDescription: 'Standar (07:31 - 08:00)',
                isEligible: true,
                colorClass: 'blue',
            };
        } else if (totalMinutes <= 8 * 60 + 45) {
            return {
                score: 2,
                grade: 'Kurang Patuh',
                ruleDescription: 'Terlambat Ringan (08:01 - 08:45)',
                isEligible: true,
                colorClass: 'amber',
            };
        } else {
            return {
                score: 1,
                grade: 'Tidak Patuh',
                ruleDescription: 'Terlambat Berat (> 08:45)',
                isEligible: true,
                colorClass: 'rose',
            };
        }
    }

    // 6. Default fallback
    if (totalMinutes <= 7 * 60 + 30) {
        return {
            score: 4,
            grade: 'Sangat Patuh',
            ruleDescription: '<= 07:30',
            isEligible: true,
            colorClass: 'emerald',
        };
    } else if (totalMinutes <= 8 * 60 + 0) {
        return {
            score: 3,
            grade: 'Patuh',
            ruleDescription: '07:31 - 08:00',
            isEligible: true,
            colorClass: 'blue',
        };
    } else if (totalMinutes <= 8 * 60 + 45) {
        return {
            score: 2,
            grade: 'Kurang Patuh',
            ruleDescription: '08:01 - 08:45',
            isEligible: true,
            colorClass: 'amber',
        };
    } else {
        return {
            score: 1,
            grade: 'Tidak Patuh',
            ruleDescription: '> 08:45',
            isEligible: true,
            colorClass: 'rose',
        };
    }
}

export function getPredikatPerformance(avg: number): string {
    if (avg >= 3.75) return 'Sangat Patuh (A)';
    if (avg >= 3.0) return 'Patuh (B)';
    if (avg >= 2.0) return 'Kurang Patuh (C)';
    if (avg > 0) return 'Tidak Patuh (D)';
    return 'Belum Ada Data';
}

/**
 * Kalkulasi Rekapitulasi Periode Performance Absen CEISA
 */
export function calculatePeriodPerformance(
    daysState: Record<string, DayData>,
    year: number,
    months: number[],
    periodLabel: string,
    periodType: 'month' | 'quarter' | 'semester' | 'year'
): PeriodPerformanceSummary {
    let totalDaysEvaluated = 0;
    let totalScore = 0;
    let countScore4 = 0;
    let countScore3 = 0;
    let countScore2 = 0;
    let countScore1 = 0;

    months.forEach((month) => {
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const key = `${year}-${month}-${day}`;
            const data = daysState[key];
            if (data) {
                const result = calculateCeisaScore(data.shift, data.absenCeisa, data.isMasuk, data.isHoldDokumen);
                if (result.isEligible && result.score > 0) {
                    totalDaysEvaluated += 1;
                    totalScore += result.score;
                    if (result.score === 4) countScore4 += 1;
                    else if (result.score === 3) countScore3 += 1;
                    else if (result.score === 2) countScore2 += 1;
                    else if (result.score === 1) countScore1 += 1;
                }
            }
        }
    });

    const averageScore = totalDaysEvaluated > 0 ? totalScore / totalDaysEvaluated : 0;
    const predikat = getPredikatPerformance(averageScore);

    return {
        periodLabel,
        periodType,
        totalDaysEvaluated,
        totalScore,
        averageScore,
        countScore4,
        countScore3,
        countScore2,
        countScore1,
        predikat,
    };
}

export function calculateDayResult(
    data: DayData,
    date: Date,
    liburCustomKeterangan?: string
): DayCalculationResult {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const holidayName = liburCustomKeterangan || getIndonesianHoliday(date);
    const isTanggalMerah = isWeekend || Boolean(data.isManualHoliday) || Boolean(holidayName) || Boolean(liburCustomKeterangan);
    const durasi = calculateWorkDuration(data.jamMasuk, data.jamPulang);
    const hasMasukInput = data.jamMasuk.trim() !== '';
    const isUserMasuk = data.isMasuk;
    const shift = normalizeShift(data.shift);

    let isLembur = false;
    let jamLembur = 0;
    let isPiket = false;
    let isDapatGeserOff = false;
    let isOffDiambil = false;
    let isCutiPengganti = false;
    let isCPDiambil = false;
    let keteranganStatus = '';

    // 1. Cuti Pengganti (ST CP)
    // "Jika ST CP dicentang di hari libur (weekend/tanggal merah), maka mendapatkan CUTI PENGGANTI +1 otomatis."
    if (isTanggalMerah && data.isSuratTugasTambahan) {
        isCutiPengganti = true;
    }

    // 2. Tanggal Merah / Libur (Weekend / Libur Nasional / Libur Manual)
    if (isTanggalMerah) {
        if (shift === 'OFF') {
            if (isUserMasuk) {
                isLembur = true;
                if (hasMasukInput) {
                    if (durasi >= 2.0) {
                        jamLembur = durasi > 8.0 ? 8.0 : durasi;
                        keteranganStatus = `Lembur Libur (${jamLembur.toFixed(1)}h)`;
                    } else {
                        keteranganStatus = 'Lembur Libur Hangus (<2h)';
                    }
                } else {
                    keteranganStatus = 'Lembur Libur';
                }
            }
        } else if (shift === 'CUTI') {
            keteranganStatus = 'Cuti';
        } else if (shift !== '') {
            // Jadwal selain OFF dan CUTI di hari libur:
            // "Jadwal selain OFF dan CUTI di hari libur berarti PIKET (dapat OFF +1, manual)"
            const tipeLibur = data.tipeMasukLibur || 'piket';

            if (tipeLibur === 'lembur' && isUserMasuk) {
                isLembur = true;
                if (durasi >= 2.0) {
                    jamLembur = durasi > 8.0 ? 8.0 : durasi;
                    keteranganStatus = `Lembur Libur (${jamLembur.toFixed(1)}h)`;
                } else if (hasMasukInput) {
                    keteranganStatus = 'Lembur Libur Hangus (<2h)';
                } else {
                    keteranganStatus = 'Lembur Libur';
                }
            } else {
                // Default di hari libur: PIKET
                isPiket = true;
                isDapatGeserOff = false;
                keteranganStatus = 'Piket';

                // Jika kerja > 9.5 jam saat piket di hari libur:
                // Dianggap lembur piket (kelebihan di atas 8.5 jam, minimal >= 1 jam, maks 3 jam)
                if (durasi > 9.5) {
                    const extra = durasi - 8.5;
                    if (extra >= 1.0) {
                        isLembur = true;
                        jamLembur = extra > 3.0 ? 3.0 : extra;
                        keteranganStatus = `Piket + Lembur (${jamLembur.toFixed(1)}h)`;
                    }
                }
            }
        }
    }
    // 3. Hari Kerja Biasa (Senin - Jumat Non-Tanggal Merah)
    else {
        if (shift === 'OFF') {
            if (isUserMasuk) {
                // Jadwal OFF di weekdays non-libur & user masuk -> OFF Ditabung (+1)
                isDapatGeserOff = true;
                keteranganStatus = 'OFF Ditabung (+1)';

                if (durasi > 9.5) {
                    const extra = durasi - 8.5;
                    if (extra >= 1.0) {
                        isLembur = true;
                        jamLembur = extra > 3.0 ? 3.0 : extra;
                        keteranganStatus = `OFF Ditabung (+1) + Lembur (${jamLembur.toFixed(1)}h)`;
                    }
                }
            } else {
                // Tidak masuk di jadwal OFF -> OFF tidak ditabung (0)
                isDapatGeserOff = false;
                keteranganStatus = '';
            }
        } else if (shift === 'CUTI') {
            keteranganStatus = 'Cuti';
        } else if (shift !== '') {
            // Shift Piket (PM, Malam) di weekdays
            if (shift === 'PM' || shift === 'Malam') {
                isPiket = true;
                isDapatGeserOff = false;
                keteranganStatus = 'Piket';

                // Lembur di hari kerja biasa jika kerja > 9.5 jam (min 1h, max 3h)
                if (isUserMasuk && durasi > 9.5) {
                    const extra = durasi - 8.5;
                    if (extra >= 1.0) {
                        isLembur = true;
                        jamLembur = extra > 3.0 ? 3.0 : extra;
                        keteranganStatus = `${keteranganStatus} + Lembur (${jamLembur.toFixed(1)}h)`;
                    }
                }
            } else {
                // Shift reguler lainnya (Pagi, Siang, Graha, dll.)
                if (isUserMasuk) {
                    if (durasi > 9.5) {
                        const extra = durasi - 8.5;
                        if (extra >= 1.0) {
                            isLembur = true;
                            jamLembur = extra > 3.0 ? 3.0 : extra;
                            keteranganStatus = `Lembur (${jamLembur.toFixed(1)}h)`;
                        }
                    }
                } else {
                    // Menggunakan kuota tabungan saat tidak masuk di hari kerja jadwal selain CUTI/OFF
                    if (data.isGunakanCP) {
                        isCPDiambil = true;
                        keteranganStatus = 'Cuti Pengganti (-1)';
                    } else if (data.isGunakanOffGeser) {
                        isOffDiambil = true;
                        keteranganStatus = 'OFF Diambil (-1)';
                    } else {
                        keteranganStatus = '';
                    }
                }
            }
        }
    }

    // Jika ST aktif dan status belum mencantumkan CP +1
    if (isCutiPengganti && !keteranganStatus.includes('Cuti Pengganti') && !keteranganStatus.includes('CP')) {
        if (keteranganStatus) {
            keteranganStatus = `${keteranganStatus} | CP +1`;
        } else {
            keteranganStatus = 'Cuti Pengganti (+1)';
        }
    }

    return {
        isLembur,
        jamLembur,
        durasiKerja: durasi,
        isPiket,
        isDapatGeserOff,
        isOffDiambil,
        isCutiPengganti,
        isCPDiambil,
        keteranganStatus,
    };
}

export function calculateMonthSummary(
    daysState: Record<string, DayData>,
    year: number,
    month: number,
    daftarLibur?: LiburNasional[]
) {
    let totalJamLembur = 0;
    let totalHariLembur = 0;
    let totalPiket = 0;
    let totalDapatGeserOff = 0;
    let totalOffDiambil = 0;
    let totalCutiPengganti = 0;
    let totalCPDiambil = 0;
    let totalJamBiasa = 0;

    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const key = `${year}-${month}-${day}`;
        const data: DayData = daysState[key] || {
            shift: '',
            isMasuk: false,
            jamMasuk: '',
            jamPulang: '',
            absenCeisa: '',
            isManualHoliday: false,
            isSuratTugasTambahan: false,
            tipeMasukLibur: 'piket',
            note: '',
            isHoldDokumen: false,
            isLocked: true,
        };

        const date = new Date(year, month - 1, day);
        const padded = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const unpadded = `${year}-${month}-${day}`;
        const liburCustom = daftarLibur?.find((l) => l.tanggal === padded || l.tanggal === unpadded);
        const calc = calculateDayResult(data, date, liburCustom?.keterangan);

        if (calc.isLembur && calc.jamLembur >= 1.0) {
            totalJamLembur += calc.jamLembur;
            totalHariLembur += 1;
        }
        if (calc.isPiket) totalPiket += 1;
        if (calc.isDapatGeserOff) totalDapatGeserOff += 1;
        if (calc.isOffDiambil) totalOffDiambil += 1;
        if (calc.isCutiPengganti) totalCutiPengganti += 1;
        if (calc.isCPDiambil) totalCPDiambil += 1;

        // Normal work hours
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const holidayName = liburCustom?.keterangan || getIndonesianHoliday(date);
        const isTanggalMerah = isWeekend || Boolean(data.isManualHoliday) || Boolean(holidayName) || Boolean(liburCustom);
        if (!isTanggalMerah && data.isMasuk && data.shift !== 'OFF' && calc.durasiKerja > 0) {
            totalJamBiasa += Math.min(calc.durasiKerja, 8.5);
        }
    }

    const sisaKuotaOff = totalDapatGeserOff - totalOffDiambil;
    const sisaKuotaCP = totalCutiPengganti - totalCPDiambil;

    return {
        totalJamLembur,
        totalHariLembur,
        totalPiket,
        totalDapatGeserOff,
        totalOffDiambil,
        totalCutiPengganti,
        totalCPDiambil,
        sisaKuotaOff,
        sisaKuotaCP,
        totalJamBiasa,
        // Aliases for compatibility
        totalLemburHours: totalJamLembur,
        totalLemburDays: totalHariLembur,
        totalPiketDays: totalPiket,
        totalGeserOffDays: totalDapatGeserOff,
        totalOffDiambilDays: totalOffDiambil,
        totalCutiPenggantiDays: totalCutiPengganti,
        totalCPDiambilDays: totalCPDiambil,
    };
}


