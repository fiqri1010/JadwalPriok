import { DayData, LiburNasional, isPiketShift, normalizeShift, ShiftGroupProfile } from '../types';
import { loadShiftGroups, getEffectiveShiftGroup, findShiftConfig } from './shiftTimeline';

export interface PiketMatchInfo {
    piketDateKey: string;      // e.g. "2026-9-5"
    piketYear: number;
    piketMonth: number;
    piketDay: number;
    piketShift: string;
    piketDateLabel: string;    // e.g. "Sab, 5 Sep 2026"
    offDateKey?: string;       // e.g. "2026-9-8"
    offDateLabel?: string;     // e.g. "Sel, 8 Sep 2026"
    status: 'matched' | 'pending' | 'no_off_entitlement' | 'accumulated_off';
    earnsOff: boolean;
}

export interface OffMatchInfo {
    offDateKey: string;        // e.g. "2026-9-8"
    piketDateKey: string;      // e.g. "2026-9-5"
    piketDateLabel: string;    // e.g. "Sab, 5 Sep 2026"
}

export interface PiketCalculationResult {
    piketMatches: PiketMatchInfo[];
    offMatches: Record<string, OffMatchInfo>; // offDateKey -> OffMatchInfo
    piketByDateKey: Record<string, PiketMatchInfo>; // piketDateKey -> PiketMatchInfo
}

const INDONESIAN_DAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const INDONESIAN_MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

export function calculatePiketMatches(
    daysState: Record<string, DayData>,
    daftarLibur: LiburNasional[],
    focusYear?: number,
    focusMonth?: number,
    shiftGroups?: ShiftGroupProfile[]
): PiketCalculationResult {
    const groups = shiftGroups || loadShiftGroups();

    // 1. Build a map of holidays for O(1) lookup
    const holidayMap = new Map<string, LiburNasional>();
    for (const h of daftarLibur) {
        holidayMap.set(h.tanggal, h);
    }

    // 2. Determine date range to scan
    const currentYear = focusYear || new Date().getFullYear();
    const years = new Set<number>([currentYear]);

    for (const key of Object.keys(daysState)) {
        const hyphenIdx = key.indexOf('-');
        if (hyphenIdx > 0) {
            const y = parseInt(key.substring(0, hyphenIdx), 10);
            if (!isNaN(y)) years.add(y);
        }
    }

    const sortedYears = Array.from(years).sort((a, b) => a - b);
    const minYear = sortedYears[0];
    const maxYear = sortedYears[sortedYears.length - 1];

    interface DateItem {
        dateKey: string; // "YYYY-M-D"
        isoDateStr: string; // "YYYY-MM-DD"
        year: number;
        month: number;
        day: number;
        timeVal: number;
        dayOfWeek: number; // 0 = Sun, 6 = Sat
        isWeekend: boolean;
        isHoliday: boolean;
        isWeekendOrHoliday: boolean;
        isWorkday: boolean;
        shift: string;
        isPiket: boolean;
        isOffWorkday: boolean;
        formattedLabel: string;
    }

    const timeline: DateItem[] = [];

    for (let y = minYear; y <= maxYear; y++) {
        for (let m = 1; m <= 12; m++) {
            const daysInMonth = new Date(y, m, 0).getDate();
            const firstDayOfWeek = new Date(y, m - 1, 1).getDay();

            for (let d = 1; d <= daysInMonth; d++) {
                const dateKey = `${y}-${m}-${d}`;
                const dayOfWeek = (firstDayOfWeek + d - 1) % 7;
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const itemData = daysState[dateKey];

                const mm = m < 10 ? `0${m}` : `${m}`;
                const dd = d < 10 ? `0${d}` : `${d}`;
                const isoDateStr = `${y}-${mm}-${dd}`;

                const isHoliday = Boolean(holidayMap.has(isoDateStr)) || Boolean(itemData?.isManualHoliday);
                const isWeekendOrHoliday = isWeekend || isHoliday;
                const isWorkday = !isWeekend && !isHoliday;

                const rawShift = itemData?.shift || '';
                const shift = normalizeShift(rawShift);

                const effectiveGroup = getEffectiveShiftGroup(isoDateStr, groups);
                const isPiket = isPiketShift(rawShift, isWeekendOrHoliday, effectiveGroup?.shifts);
                const isOffWorkday = isWorkday && shift === 'OFF';

                const formattedLabel = `${INDONESIAN_DAY_SHORT[dayOfWeek]}, ${d} ${INDONESIAN_MONTH_SHORT[m - 1]} ${y}`;
                const timeVal = y * 10000 + m * 100 + d;

                timeline.push({
                    dateKey,
                    isoDateStr,
                    year: y,
                    month: m,
                    day: d,
                    timeVal,
                    dayOfWeek,
                    isWeekend,
                    isHoliday,
                    isWeekendOrHoliday,
                    isWorkday,
                    shift,
                    isPiket,
                    isOffWorkday,
                    formattedLabel,
                });
            }
        }
    }

    // 3. Separate Pikets and available Workday OFFs
    const piketItems = timeline.filter((t) => t.isPiket);
    const availableOffs = timeline.filter((t) => t.isOffWorkday);

    const piketMatches: PiketMatchInfo[] = [];
    const offMatches: Record<string, OffMatchInfo> = {};
    const piketByDateKey: Record<string, PiketMatchInfo> = {};

    const usedOffKeys = new Set<string>();

    // 4. Chronological Matching (FIFO for earlier Pikets)
    for (const piket of piketItems) {
        const effectiveGroup = getEffectiveShiftGroup(piket.isoDateStr, groups);
        const shiftCfg = findShiftConfig(piket.shift, effectiveGroup);

        // Jika piket jatuh pada hari kerja (weekdays):
        // Cek apakah shift ini berhak mendapatkan OFF pengganti
        if (piket.isWorkday) {
            const earnsOffOnWorkday = shiftCfg !== undefined && shiftCfg.piketHariKerjaDenganOff !== undefined
                ? Boolean(shiftCfg.piketHariKerjaDenganOff)
                : (piket.shift !== 'SM');

            if (!earnsOffOnWorkday) {
                const matchInfo: PiketMatchInfo = {
                    piketDateKey: piket.dateKey,
                    piketYear: piket.year,
                    piketMonth: piket.month,
                    piketDay: piket.day,
                    piketShift: piket.shift,
                    piketDateLabel: piket.formattedLabel,
                    offDateLabel: 'Tanpa OFF (Piket Hari Kerja)',
                    status: 'no_off_entitlement',
                    earnsOff: false,
                };

                piketMatches.push(matchInfo);
                piketByDateKey[piket.dateKey] = matchInfo;
                continue;
            }
        }

        // Find first available OFF on a workday strictly AFTER piket.timeVal
        const matchedOff = availableOffs.find((off) => {
            return !usedOffKeys.has(off.dateKey) && off.timeVal > piket.timeVal;
        });

        if (matchedOff) {
            usedOffKeys.add(matchedOff.dateKey);

            const matchInfo: PiketMatchInfo = {
                piketDateKey: piket.dateKey,
                piketYear: piket.year,
                piketMonth: piket.month,
                piketDay: piket.day,
                piketShift: piket.shift,
                piketDateLabel: piket.formattedLabel,
                offDateKey: matchedOff.dateKey,
                offDateLabel: matchedOff.formattedLabel,
                status: 'matched',
                earnsOff: true,
            };

            piketMatches.push(matchInfo);
            piketByDateKey[piket.dateKey] = matchInfo;

            offMatches[matchedOff.dateKey] = {
                offDateKey: matchedOff.dateKey,
                piketDateKey: piket.dateKey,
                piketDateLabel: piket.formattedLabel,
            };
        } else {
            // Unmatched / Pending carry-over to next month
            // Check if there are no available workday OFFs in the next month to cover this piket
            const nextMonth = piket.month === 12 ? 1 : piket.month + 1;
            const nextYear = piket.month === 12 ? piket.year + 1 : piket.year;
            
            const hasWorkdayOffNextMonth = availableOffs.some((off) => {
                return off.year === nextYear && off.month === nextMonth && off.timeVal > piket.timeVal && !usedOffKeys.has(off.dateKey);
            });

            const calculatedStatus = !hasWorkdayOffNextMonth ? 'accumulated_off' : 'pending';

            const matchInfo: PiketMatchInfo = {
                piketDateKey: piket.dateKey,
                piketYear: piket.year,
                piketMonth: piket.month,
                piketDay: piket.day,
                piketShift: piket.shift,
                piketDateLabel: piket.formattedLabel,
                status: calculatedStatus,
                earnsOff: true,
            };

            piketMatches.push(matchInfo);
            piketByDateKey[piket.dateKey] = matchInfo;
        }
    }

    return {
        piketMatches,
        offMatches,
        piketByDateKey,
    };
}
