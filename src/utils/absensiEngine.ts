import { DayData, ShiftItemConfig, normalizeShift } from '../types';

export interface RawAttendanceEntry {
    dateKey: string; // YYYY-MM-DD
    jamMasukRaw?: string;
    jamPulangRaw?: string;
}

export interface AttendanceResolutionResult {
    resolvedDays: Record<string, Partial<DayData>>;
}

/**
 * Translates 2-column raw attendance from office copy data:
 * - Scenario 1: OFF day after overnight shift: 1 tap (jam masuk raw) is used as yesterday's jam pulang. Today stays pure OFF.
 * - Scenario 2: OFF day with 2 taps (jam masuk & pulang) -> Recognized as holiday extra duty (lembur hari libur).
 * - Scenario 3: Consecutive work shifts -> Early morning tap closes yesterday, today's entry defaults to earliest flexi.
 */
export function resolveOfficeAttendance(
    entries: RawAttendanceEntry[],
    currentDays: Record<string, DayData>,
    shiftsConfig: ShiftItemConfig[]
): AttendanceResolutionResult {
    const resolved: Record<string, Partial<DayData>> = {};

    // Sort entries chronologically
    const sorted = [...entries].sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    for (let i = 0; i < sorted.length; i++) {
        const entry = sorted[i];
        const prevEntry = sorted[i - 1];
        const dateKey = entry.dateKey;
        const currentDay = currentDays[dateKey];
        const shiftType = normalizeShift(currentDay?.shift);
        const shiftCfg = shiftsConfig.find((s) => s.key === shiftType || s.naming.displayBadge === shiftType);

        const masukRaw = entry.jamMasukRaw?.trim();
        const pulangRaw = entry.jamPulangRaw?.trim();

        // Check if yesterday was an overnight shift
        const prevDay = prevEntry ? currentDays[prevEntry.dateKey] : null;
        const prevShiftType = prevDay ? normalizeShift(prevDay.shift) : null;
        const prevShiftCfg = prevShiftType ? shiftsConfig.find((s) => s.key === prevShiftType || s.naming.displayBadge === prevShiftType) : null;
        const isPrevOvernight = prevShiftCfg?.workTime.isOvernight || prevShiftType === 'SM' || prevShiftType === 'PM' || prevShiftType === 'Malam';

        if (shiftType === 'OFF' || !shiftType) {
            // Case 1: 1 single tap on an OFF day after overnight shift
            if (masukRaw && !pulangRaw && isPrevOvernight && prevEntry) {
                // Allocate masukRaw as yesterday's jamPulang
                if (!resolved[prevEntry.dateKey]) resolved[prevEntry.dateKey] = {};
                resolved[prevEntry.dateKey].jamPulang = masukRaw;
                // Today remains OFF without work hours
                resolved[dateKey] = {
                    isMasuk: false,
                    jamMasuk: '',
                    jamPulang: '',
                };
            } else if (masukRaw && pulangRaw) {
                // Case 2: 2 taps on OFF day -> Holiday Extra Overtime
                resolved[dateKey] = {
                    isMasuk: true,
                    jamMasuk: masukRaw,
                    jamPulang: pulangRaw,
                };
            }
        } else {
            // Normal work shift
            if (masukRaw && pulangRaw) {
                resolved[dateKey] = {
                    isMasuk: true,
                    jamMasuk: masukRaw,
                    jamPulang: pulangRaw,
                };
            } else if (masukRaw && !pulangRaw && isPrevOvernight && prevEntry) {
                // Only 1 tap: close yesterday, set today to standard flexi in
                if (!resolved[prevEntry.dateKey]) resolved[prevEntry.dateKey] = {};
                resolved[prevEntry.dateKey].jamPulang = masukRaw;

                resolved[dateKey] = {
                    isMasuk: true,
                    jamMasuk: shiftCfg?.workTime.earliestFlexiIn || '07:30',
                    jamPulang: shiftCfg?.workTime.jamPulangDasar || '17:30',
                };
            }
        }
    }

    return { resolvedDays: resolved };
}
