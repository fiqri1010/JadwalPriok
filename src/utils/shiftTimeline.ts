import { ShiftGroupProfile, ShiftItemConfig, ShiftType } from '../types';
import { DEFAULT_SHIFT_GROUP } from '../data/defaultShifts';

const SHIFT_GROUPS_STORAGE_KEY = 'jadwal_priok_shift_groups_v1';

export function loadShiftGroups(): ShiftGroupProfile[] {
    try {
        const stored = localStorage.getItem(SHIFT_GROUPS_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.map((grp: ShiftGroupProfile) => ({
                    ...grp,
                    shifts: Array.isArray(grp.shifts)
                        ? grp.shifts.map((s) => ({
                              ...s,
                              naming: {
                                  ...s.naming,
                                  displayBadge: s.naming?.displayBadge ? s.naming.displayBadge.toUpperCase() : '',
                              },
                          }))
                        : grp.shifts,
                }));
            }
        }
    } catch (e) {
        console.error('Failed to load shift groups from storage:', e);
    }
    return [DEFAULT_SHIFT_GROUP];
}

export function saveShiftGroups(groups: ShiftGroupProfile[]): void {
    try {
        localStorage.setItem(SHIFT_GROUPS_STORAGE_KEY, JSON.stringify(groups));
    } catch (e) {
        console.error('Failed to save shift groups to storage:', e);
    }
}

/**
 * Get active shift group for a given date (YYYY-MM-DD or year/month)
 */
export function getEffectiveShiftGroup(dateStr: string, groups: ShiftGroupProfile[]): ShiftGroupProfile {
    if (!groups || groups.length === 0) return DEFAULT_SHIFT_GROUP;
    if (groups.length === 1) return groups[0];

    // 1. Check explicit active date ranges first
    for (const grp of groups) {
        if (grp.dateRanges && grp.dateRanges.length > 0) {
            for (const range of grp.dateRanges) {
                const startsOk = !range.startDate || dateStr >= range.startDate;
                const endsOk = !range.endDate || dateStr <= range.endDate;
                if (startsOk && endsOk) {
                    return grp;
                }
            }
        }
    }

    // 2. Fallback: Sort by effectiveStartDate descending
    const sorted = [...groups].sort((a, b) => b.effectiveStartDate.localeCompare(a.effectiveStartDate));

    for (const grp of sorted) {
        if (dateStr >= grp.effectiveStartDate) {
            return grp;
        }
    }

    return sorted[sorted.length - 1] || DEFAULT_SHIFT_GROUP;
}

export function findShiftConfig(shiftKey: string, group: ShiftGroupProfile): ShiftItemConfig | undefined {
    return group.shifts.find(
        (s) => s.id === shiftKey || s.key === shiftKey || s.naming.displayBadge === shiftKey || s.naming.copyCode === shiftKey
    );
}
