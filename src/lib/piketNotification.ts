import { DayData, LiburNasional } from '../types';
import { calculateDayResult } from './calculator';

export interface PiketReminderSettings {
    enabled: boolean;
    eveningTime: string; // e.g. "20:00" for H-1
    morningTime: string; // e.g. "06:00" for Hari H
    soundEnabled: boolean;
    vibrate: boolean;
}

const SETTINGS_KEY = 'piket_reminder_settings_v1';
const SENT_LOG_KEY = 'piket_reminder_sent_log_v1';

export const DEFAULT_PIKET_REMINDER_SETTINGS: PiketReminderSettings = {
    enabled: true,
    eveningTime: '20:00',
    morningTime: '06:00',
    soundEnabled: true,
    vibrate: true,
};

export function getPiketReminderSettings(): PiketReminderSettings {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (raw) {
            return { ...DEFAULT_PIKET_REMINDER_SETTINGS, ...JSON.parse(raw) };
        }
    } catch (e) {
        console.warn('Gagal membaca pengaturan pengingat piket:', e);
    }
    return DEFAULT_PIKET_REMINDER_SETTINGS;
}

export function savePiketReminderSettings(settings: Partial<PiketReminderSettings>): PiketReminderSettings {
    const current = getPiketReminderSettings();
    const updated = { ...current, ...settings };
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch (e) {
        console.warn('Gagal menyimpan pengaturan pengingat piket:', e);
    }
    return updated;
}

// Helper untuk deteksi Capacitor LocalNotifications Native
function getCapacitorLocalNotifications() {
    if (typeof window === 'undefined') return null;
    return (window as any).Capacitor?.Plugins?.LocalNotifications || null;
}

function isCapacitorNative() {
    if (typeof window === 'undefined') return false;
    return Boolean((window as any).Capacitor?.isNativePlatform?.());
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined') return 'unsupported';

    // Jika Web Notification API tersedia di browser
    if ('Notification' in window) {
        return Notification.permission;
    }

    // Jika di lingkungan Capacitor Native Android
    if (isCapacitorNative()) {
        const ln = getCapacitorLocalNotifications();
        if (ln) {
            return 'default';
        }
        return 'unsupported';
    }

    return 'unsupported';
}

export async function requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // 1. Capacitor Native Android
    if (isCapacitorNative()) {
        const ln = getCapacitorLocalNotifications();
        if (ln) {
            try {
                const res = await ln.requestPermissions();
                return res?.display === 'granted';
            } catch (err) {
                console.error('Error meminta izin LocalNotifications Capacitor:', err);
                return false;
            }
        }
    }

    // 2. Web Notification API
    if ('Notification' in window) {
        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (err) {
            console.error('Error saat meminta izin notifikasi:', err);
            return false;
        }
    }

    return false;
}

/**
 * Mengirim notifikasi visual ke HP / Komputer
 */
export async function dispatchNativeNotification(
    title: string,
    options: NotificationOptions
): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // 1. Prioritas di Capacitor Android Native jika plugin terpasang
    if (isCapacitorNative()) {
        const ln = getCapacitorLocalNotifications();
        if (ln) {
            try {
                await ln.schedule({
                    notifications: [
                        {
                            title,
                            body: options.body || '',
                            id: Math.floor(Math.random() * 1000000),
                            schedule: { at: new Date(Date.now() + 500) },
                            sound: 'default',
                            smallIcon: 'ic_stat_icon',
                        },
                    ],
                });
                return true;
            } catch (err) {
                console.warn('Gagal memicu LocalNotifications Capacitor:', err);
            }
        }
    }

    // 2. Web Notification API
    if ('Notification' in window) {
        if (Notification.permission !== 'granted') {
            const granted = await requestNotificationPermission();
            if (!granted) return false;
        }

        try {
            // Coba lewat Service Worker jika ada (mendukung Android lock screen & sound lebih baik)
            if ('serviceWorker' in navigator) {
                try {
                    const registration = await navigator.serviceWorker.getRegistration();
                    if (registration && registration.showNotification) {
                        await (registration as any).showNotification(title, {
                            icon: '/icon.png',
                            badge: '/icon.png',
                            vibrate: [200, 100, 200, 100, 200],
                            ...options,
                        });
                        return true;
                    }
                } catch (swErr) {
                    console.warn('Service worker notification fallback:', swErr);
                }
            }

            // Fallback ke standard Web Notification API
            new Notification(title, {
                icon: '/icon.png',
                ...options,
            });
            return true;
        } catch (err) {
            console.error('Gagal memicu notifikasi:', err);
            return false;
        }
    }

    return false;
}

function getSentLogs(): Record<string, boolean> {
    try {
        const raw = localStorage.getItem(SENT_LOG_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function markAsSent(key: string) {
    try {
        const logs = getSentLogs();
        logs[key] = true;
        // Jaga ukuran log agar tidak membengkak (simpan 30 entri terakhir)
        const keys = Object.keys(logs);
        if (keys.length > 30) {
            const trimmed: Record<string, boolean> = {};
            keys.slice(-25).forEach((k) => {
                trimmed[k] = true;
            });
            localStorage.setItem(SENT_LOG_KEY, JSON.stringify(trimmed));
            return;
        }
        localStorage.setItem(SENT_LOG_KEY, JSON.stringify(logs));
    } catch (e) {
        console.warn('Gagal menandai log notifikasi terkirim:', e);
    }
}

/**
 * Cek jadwal piket hari ini dan besok, lalu kirimkan pengingat jika saatnya tiba.
 */
export async function checkAndSendPiketReminders(
    daysState: Record<string, DayData>,
    daftarLibur: LiburNasional[] = []
): Promise<{ sentToday: boolean; sentTomorrow: boolean }> {
    const settings = getPiketReminderSettings();
    if (!settings.enabled) {
        return { sentToday: false, sentTomorrow: false };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;

    // Parse waktu reminder
    const [mHour, mMin] = settings.morningTime.split(':').map(Number);
    const [eHour, eMin] = settings.eveningTime.split(':').map(Number);

    const isTimeForMorning = currentHours > mHour || (currentHours === mHour && currentMinutes >= mMin);
    const isTimeForEvening = currentHours > eHour || (currentHours === eHour && currentMinutes >= eMin);

    const todayKey = `${currentYear}-${currentMonth}-${currentDay}`;
    const sentLogs = getSentLogs();

    let sentToday = false;
    let sentTomorrow = false;

    // 1. CEK HARI INI (Pengingat Jam 06:00 Pagi)
    if (isTimeForMorning) {
        const morningLogKey = `today_${todayKey}_morning`;
        if (!sentLogs[morningLogKey]) {
            const todayData: DayData = daysState[todayKey] || {
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
            const todayCellDate = new Date(currentYear, currentMonth - 1, currentDay);
            const paddedD = String(currentDay).padStart(2, '0');
            const paddedM = String(currentMonth).padStart(2, '0');
            const isoDate = `${currentYear}-${paddedM}-${paddedD}`;
            const holidayItem = daftarLibur.find((l) => l.tanggal === isoDate || l.tanggal === todayKey);
            const todayCalc = calculateDayResult(todayData, todayCellDate, holidayItem?.keterangan);

            if (todayCalc.isPiket) {
                const shiftName = todayData.shift || 'Piket';
                const hours = todayData.jamMasuk && todayData.jamPulang ? `(${todayData.jamMasuk} - ${todayData.jamPulang})` : '';
                const title = '⏰ Pengingat Piket Hari Ini (06:00 Pagi)';
                const body = `Hari ini Anda ada jadwal dinas PIKET [Shift: ${shiftName}] ${hours}. Selamat bertugas & utamakan keselamatan kerja!`;

                const ok = await dispatchNativeNotification(title, {
                    body,
                    tag: 'piket-reminder-today',
                    requireInteraction: true,
                });

                if (ok) {
                    markAsSent(morningLogKey);
                    sentToday = true;
                }
            }
        }
    }

    // 2. CEK BESOK (Pengingat H-1 Sore / Malam bahwa Besok Ada Piket)
    if (isTimeForEvening) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomYear = tomorrow.getFullYear();
        const tomMonth = tomorrow.getMonth() + 1;
        const tomDay = tomorrow.getDate();
        const tomorrowKey = `${tomYear}-${tomMonth}-${tomDay}`;

        const eveningLogKey = `tomorrow_${tomorrowKey}_evening`;
        if (!sentLogs[eveningLogKey]) {
            const tomData: DayData = daysState[tomorrowKey] || {
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
            const tomCellDate = new Date(tomYear, tomMonth - 1, tomDay);
            const paddedTomD = String(tomDay).padStart(2, '0');
            const paddedTomM = String(tomMonth).padStart(2, '0');
            const tomIsoDate = `${tomYear}-${paddedTomM}-${paddedTomD}`;
            const tomHolidayItem = daftarLibur.find((l) => l.tanggal === tomIsoDate || l.tanggal === tomorrowKey);
            const tomCalc = calculateDayResult(tomData, tomCellDate, tomHolidayItem?.keterangan);

            if (tomCalc.isPiket) {
                const shiftName = tomData.shift || 'Piket';
                const dateStr = tomorrow.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
                const hours = tomData.jamMasuk && tomData.jamPulang ? `(${tomData.jamMasuk} - ${tomData.jamPulang})` : '';
                const title = '🚨 Pengingat: Besok Anda Ada Piket!';
                const body = `Besok (${dateStr}) ada jadwal dinas PIKET [Shift: ${shiftName}] ${hours}. Siapkan fisik, seragam, dan istirahat yang cukup malam ini.`;

                const ok = await dispatchNativeNotification(title, {
                    body,
                    tag: 'piket-reminder-tomorrow',
                    requireInteraction: true,
                });

                if (ok) {
                    markAsSent(eveningLogKey);
                    sentTomorrow = true;
                }
            }
        }
    }

    return { sentToday, sentTomorrow };
}

/**
 * Mengirim notifikasi uji coba langsung ke layar handphone
 */
export async function sendTestPiketNotification(type: 'today' | 'tomorrow'): Promise<{ success: boolean; message: string }> {
    // Jika di Capacitor Native Android
    if (isCapacitorNative()) {
        const ln = getCapacitorLocalNotifications();
        if (ln) {
            try {
                const granted = await requestNotificationPermission();
                if (!granted) {
                    return {
                        success: false,
                        message: 'Izin notifikasi ditolak di perangkat Android. Pastikan izin notifikasi diizinkan di Pengaturan Aplikasi HP.',
                    };
                }
            } catch (err) {
                console.warn('Izin notifikasi:', err);
            }
        } else {
            return {
                success: false,
                message: 'Aplikasi Android belum memiliki plugin LocalNotifications. Tambahkan POST_NOTIFICATIONS di AndroidManifest.xml atau pasang @capacitor/local-notifications untuk mengaktifkan alarm bilah notifikasi.',
            };
        }
    } else {
        const perm = getNotificationPermission();
        if (perm === 'unsupported') {
            return {
                success: false,
                message: 'Browser perangkat ini tidak mendukung Web Notification API. Gunakan browser modern (Chrome / Edge) atau buka di handphone Android.',
            };
        }

        if (perm !== 'granted') {
            const granted = await requestNotificationPermission();
            if (!granted) {
                return {
                    success: false,
                    message: 'Izin notifikasi belum diizinkan oleh sistem/browser. Mohon izinkan notifikasi pada setelan situs/browser Anda.',
                };
            }
        }
    }

    const title =
        type === 'today'
            ? '⏰ Pengingat Piket Hari Ini (Simulasi 06:00)'
            : '🚨 Pengingat Piket Besok (Simulasi H-1 Malam)';

    const body =
        type === 'today'
            ? 'Hari ini Anda ada jadwal dinas PIKET [Shift: Graha] (07:30 - 17:00). Selamat bertugas & utamakan keselamatan kerja!'
            : 'Besok Anda ada jadwal dinas PIKET [Shift: NPCT] (08:00 - 20:00). Siapkan fisik & perlengkapan dinas!';

    const success = await dispatchNativeNotification(title, {
        body,
        tag: `test-piket-${type}-${Date.now()}`,
        requireInteraction: true,
    });

    return {
        success,
        message: success
            ? 'Notifikasi pengingat berhasil dikirim ke perangkat Anda!'
            : 'Gagal memicu notifikasi visual.',
    };
}

export interface UpcomingPiketItem {
    dateKey: string;
    dayNumber: number;
    month: number;
    year: number;
    dateFormatted: string;
    dayName: string;
    shift: string;
    hours: string;
    isToday: boolean;
    isTomorrow: boolean;
}

/**
 * Mengambil daftar jadwal piket terdekat (mulai hari ini ke depan)
 */
export function getUpcomingPikets(
    daysState: Record<string, DayData>,
    daftarLibur: LiburNasional[] = [],
    limit = 7
): UpcomingPiketItem[] {
    const results: UpcomingPiketItem[] = [];
    const now = new Date();
    const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Periksa 45 hari ke depan
    for (let i = 0; i < 45; i++) {
        const targetDate = new Date(todayZero);
        targetDate.setDate(todayZero.getDate() + i);

        const y = targetDate.getFullYear();
        const m = targetDate.getMonth() + 1;
        const d = targetDate.getDate();
        const dateKey = `${y}-${m}-${d}`;

        const dayData: DayData = daysState[dateKey] || {
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

        const cellDate = new Date(y, m - 1, d);
        const paddedTargetD = String(d).padStart(2, '0');
        const paddedTargetM = String(m).padStart(2, '0');
        const targetIsoDate = `${y}-${paddedTargetM}-${paddedTargetD}`;
        const targetHolidayItem = daftarLibur.find((l) => l.tanggal === targetIsoDate || l.tanggal === dateKey);
        const calc = calculateDayResult(dayData, cellDate, targetHolidayItem?.keterangan);
        if (calc.isPiket) {
            const isToday = i === 0;
            const isTomorrow = i === 1;
            const dayName = targetDate.toLocaleDateString('id-ID', { weekday: 'long' });
            const dateFormatted = targetDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            const hours = dayData.jamMasuk && dayData.jamPulang ? `${dayData.jamMasuk} - ${dayData.jamPulang}` : 'Sesuai shift';

            results.push({
                dateKey,
                dayNumber: d,
                month: m,
                year: y,
                dateFormatted,
                dayName,
                shift: dayData.shift || 'Piket',
                hours,
                isToday,
                isTomorrow,
            });

            if (results.length >= limit) break;
        }
    }

    return results;
}
