import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    User,
    signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { DayData } from '../types';

// Initialize Firebase App safely (singleton)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Provider with Google Calendar scope
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar.events');
provider.setCustomParameters({
    prompt: 'consent',
});

// Flag and in-memory access token cache (no localStorage per security guidelines)
let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initGoogleAuth = (
    onAuthSuccess?: (user: User, token: string) => void,
    onAuthFailure?: () => void
) => {
    return onAuthStateChanged(auth, async (user: User | null) => {
        if (user) {
            if (cachedAccessToken) {
                if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
            } else if (!isSigningIn) {
                // If user is remembered by Firebase but token is not in memory, user will click to re-authenticate
                if (onAuthFailure) onAuthFailure();
            }
        } else {
            cachedAccessToken = null;
            if (onAuthFailure) onAuthFailure();
        }
    });
};

// Sign in with Google Popup
export const signInWithGoogleCalendar = async (): Promise<{ user: User; accessToken: string }> => {
    try {
        isSigningIn = true;
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (!credential?.accessToken) {
            throw new Error('Gagal mendapatkan token akses Google Calendar dari autentikasi.');
        }

        cachedAccessToken = credential.accessToken;
        return { user: result.user, accessToken: cachedAccessToken };
    } catch (error: any) {
        console.error('Google Sign-in error:', error);
        throw error;
    } finally {
        isSigningIn = false;
    }
};

export const getCachedAccessToken = (): string | null => {
    return cachedAccessToken;
};

export const logoutGoogle = async () => {
    try {
        await signOut(auth);
    } catch (e) {
        console.warn('Signout error:', e);
    }
    cachedAccessToken = null;
};

export interface ShiftCalendarEntry {
    dateKey: string; // YYYY-MM-DD
    dayName?: string;
    data: DayData;
}

export interface GoogleCalendarExportOptions {
    includeOffDays?: boolean;
    calendarId?: string;
    onProgress?: (current: number, total: number, shiftName: string) => void;
}

export interface GoogleCalendarExportResult {
    success: boolean;
    exportedCount: number;
    errorCount: number;
    message: string;
    calendarLink?: string;
}

// Map shift to default work hours and Google Calendar Color IDs
const getShiftDetails = (shift: string, customJamMasuk?: string, customJamPulang?: string) => {
    const s = (shift || '').toUpperCase().trim();

    if (s === 'GRAHA' || s === 'G') {
        return {
            title: 'Shift Graha Segara',
            startHour: customJamMasuk || '07:30',
            endHour: customJamPulang || '17:00',
            isOvernight: false,
            colorId: '2', // Sage / Green
            isAllDay: false,
        };
    }
    if (s === 'NPCT' || s === 'NPCS' || s === 'N') {
        return {
            title: 'Shift NPCT1 Terminal',
            startHour: customJamMasuk || '08:00',
            endHour: customJamPulang || '17:00',
            isOvernight: false,
            colorId: '1', // Lavender / Blue
            isAllDay: false,
        };
    }
    if (s === 'TPSL' || s === 'TP' || s === 'T') {
        return {
            title: 'Shift TPSL Posko',
            startHour: customJamMasuk || '07:30',
            endHour: customJamPulang || '17:00',
            isOvernight: false,
            colorId: '6', // Tangerine / Orange
            isAllDay: false,
        };
    }
    if (s === 'SM' || s === 'S1') {
        return {
            title: 'Shift Siang Menengah (SM)',
            startHour: customJamMasuk || '13:00',
            endHour: customJamPulang || '21:00',
            isOvernight: false,
            colorId: '5', // Yellow
            isAllDay: false,
        };
    }
    if (s === 'PM' || s === 'S2') {
        return {
            title: 'Shift Pagi Madya (PM)',
            startHour: customJamMasuk || '07:00',
            endHour: customJamPulang || '15:00',
            isOvernight: false,
            colorId: '10', // Basil / Dark Green
            isAllDay: false,
        };
    }
    if (s === 'MALAM' || s === 'MLM' || s === 'M' || s === '3') {
        return {
            title: 'Shift Malam (Posko)',
            startHour: customJamMasuk || '20:00',
            endHour: customJamPulang || '08:00',
            isOvernight: true,
            colorId: '3', // Grape / Purple
            isAllDay: false,
        };
    }
    if (s === 'OFF' || s === 'LIBUR' || s === 'L' || s === 'FREE') {
        return {
            title: 'Hari OFF / Libur Shift',
            startHour: '',
            endHour: '',
            isOvernight: false,
            colorId: '8', // Graphite / Grey
            isAllDay: true,
        };
    }
    if (s === 'CUTI' || s === 'CT' || s === 'C') {
        return {
            title: 'Cuti Kerja',
            startHour: '',
            endHour: '',
            isOvernight: false,
            colorId: '4', // Flamingo / Pink
            isAllDay: true,
        };
    }

    if (s) {
        return {
            title: `Shift ${shift}`,
            startHour: customJamMasuk || '08:00',
            endHour: customJamPulang || '16:00',
            isOvernight: false,
            colorId: '9', // Blueberry / Deep Blue
            isAllDay: false,
        };
    }

    return null;
};

// Helper: Calculate next day ISO string (YYYY-MM-DD)
const getNextDateIso = (dateIso: string): string => {
    const parts = dateIso.split('-');
    if (parts.length !== 3) return dateIso;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const dateObj = new Date(y, m, d + 1);
    const nextY = dateObj.getFullYear();
    const nextM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const nextD = String(dateObj.getDate()).padStart(2, '0');
    return `${nextY}-${nextM}-${nextD}`;
};

// Export shifts to Google Calendar API
export const exportShiftsToGoogleCalendar = async (
    entries: ShiftCalendarEntry[],
    accessToken: string,
    options: GoogleCalendarExportOptions = {}
): Promise<GoogleCalendarExportResult> => {
    const { includeOffDays = true, calendarId = 'primary', onProgress } = options;

    // Filter valid entries to export
    const validEntries = entries.filter((entry) => {
        const shift = (entry.data.shift || '').trim();
        if (!shift && !entry.data.note) return false;
        if (!includeOffDays && (shift.toUpperCase() === 'OFF' || shift.toUpperCase() === 'LIBUR')) {
            return false;
        }
        return true;
    });

    if (validEntries.length === 0) {
        return {
            success: false,
            exportedCount: 0,
            errorCount: 0,
            message: 'Tidak ada jadwal shift yang valid untuk diekspor pada rentang terpilih.',
        };
    }

    let exportedCount = 0;
    let errorCount = 0;
    const total = validEntries.length;

    for (let i = 0; i < validEntries.length; i++) {
        const entry = validEntries[i];
        const dateKey = entry.dateKey; // YYYY-MM-DD
        const shift = entry.data.shift || '';
        const details = getShiftDetails(shift, entry.data.jamMasuk, entry.data.jamPulang);

        if (!details && !entry.data.note) {
            continue;
        }

        const summary = details ? details.title : `Jadwal Priok (${entry.data.note || 'Tugas'})`;

        if (onProgress) {
            onProgress(i + 1, total, summary);
        }

        let eventPayload: any = {
            summary: `⚓ ${summary}`,
            description: `Jadwal Shift Kerja - JadwalPriok\n• Shift: ${shift || '-'}\n• Jam Masuk: ${entry.data.jamMasuk || (details?.startHour || '-')}\n• Jam Pulang: ${entry.data.jamPulang || (details?.endHour || '-')}\n• Status Absen CEISA: ${entry.data.absenCeisa || 'Belum'}${entry.data.note ? `\n• Catatan: ${entry.data.note}` : ''}`,
            colorId: details?.colorId || '9',
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: 60 }, // 1 hour before
                    { method: 'popup', minutes: 15 }, // 15 mins before
                ],
            },
        };

        if (details?.isAllDay) {
            eventPayload.start = { date: dateKey };
            eventPayload.end = { date: getNextDateIso(dateKey) };
        } else if (details?.isOvernight) {
            const nextDate = getNextDateIso(dateKey);
            eventPayload.start = {
                dateTime: `${dateKey}T${details.startHour}:00+07:00`,
                timeZone: 'Asia/Jakarta',
            };
            eventPayload.end = {
                dateTime: `${nextDate}T${details.endHour}:00+07:00`,
                timeZone: 'Asia/Jakarta',
            };
        } else {
            const startH = details?.startHour || '08:00';
            const endH = details?.endHour || '17:00';
            eventPayload.start = {
                dateTime: `${dateKey}T${startH}:00+07:00`,
                timeZone: 'Asia/Jakarta',
            };
            eventPayload.end = {
                dateTime: `${dateKey}T${endH}:00+07:00`,
                timeZone: 'Asia/Jakarta',
            };
        }

        try {
            const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(eventPayload),
                }
            );

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error(`Failed to export event on ${dateKey}:`, errData);
                errorCount++;
            } else {
                exportedCount++;
            }

            // Small delay to prevent API rate limiting
            await new Promise((resolve) => setTimeout(resolve, 60));
        } catch (err) {
            console.error(`Error exporting event for ${dateKey}:`, err);
            errorCount++;
        }
    }

    const success = exportedCount > 0;
    const message = success
        ? `Berhasil mengekspor ${exportedCount} jadwal shift ke Google Calendar!`
        : `Gagal mengekspor jadwal shift ke Google Calendar.`;

    return {
        success,
        exportedCount,
        errorCount,
        message,
        calendarLink: 'https://calendar.google.com',
    };
};
