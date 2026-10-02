import { UserAccount } from '../types/admin';
import { DEFAULT_USERS, LOCAL_STORAGE_USERS_KEY, saveAdminUsers, getAdminUsers } from './adminStorage';

export interface PoskoStatInfo {
    id: string;
    name: string;
    category: string;
    staffCount: number;
    location: string;
}

export interface PoskoSummary {
    poskos: PoskoStatInfo[];
    totalStaff: number;
    lastSyncedAt: string;
}

/**
 * Mengambil daftar 120 personel resmi dari backend server lokal.
 * Jika koneksi server berhasil, data disinkronkan ke localStorage dengan mempertahankan modifikasi role & password lokal.
 */
export async function fetchServerUsers(): Promise<UserAccount[]> {
    try {
        const res = await fetch('/api/users');
        if (res.ok) {
            const serverUsers: UserAccount[] = await res.json();
            if (Array.isArray(serverUsers) && serverUsers.length > 0) {
                const currentLocal = getAdminUsers();
                const localMap = new Map(currentLocal.map((u) => [u.nip, u]));
                const merged = serverUsers.map((su) => {
                    const lu = localMap.get(su.nip);
                    if (lu) {
                        return {
                            ...su,
                            role: lu.role !== 'end-user' ? lu.role : su.role,
                            authorityProfileId: lu.authorityProfileId !== 'prof-petugas-posko' ? lu.authorityProfileId : su.authorityProfileId,
                            authorityName: lu.authorityName !== 'PPF' ? lu.authorityName : su.authorityName,
                            hasPassword: lu.hasPassword || su.hasPassword,
                            passwordValue: lu.passwordValue || su.passwordValue,
                            isActive: lu.isActive !== undefined ? lu.isActive : su.isActive,
                        };
                    }
                    return su;
                });
                saveAdminUsers(merged);
                return merged;
            }
        }
    } catch {
        // Fallback jika mode offline / fetch gagal
    }
    return getAdminUsers();
}

/**
 * Menyimpan data pengguna ke server backend lokal
 */
export async function saveServerUsers(users: UserAccount[]): Promise<boolean> {
    try {
        const res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(users),
        });
        return res.ok;
    } catch {
        return false;
    }
}

/**
 * Mengambil informasi statistik 5 posko resmi dari server backend lokal
 */
export async function fetchServerPoskos(): Promise<PoskoSummary | null> {
    try {
        const res = await fetch('/api/poskos');
        if (res.ok) {
            return await res.json();
        }
    } catch {}
    return null;
}

/**
 * Memaksa sinkronisasi master data 120 staf di server dan klien
 */
export async function resetServerMasterData(): Promise<UserAccount[]> {
    try {
        const res = await fetch('/api/reset-master-data', { method: 'POST' });
        if (res.ok) {
            const data: UserAccount[] = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                saveAdminUsers(data);
                return data;
            }
        }
    } catch {}
    saveAdminUsers(DEFAULT_USERS);
    return DEFAULT_USERS;
}

/**
 * Mengambil custom schedules dari server backend lokal
 */
export async function fetchServerSchedules(): Promise<Record<string, Record<string, string>>> {
    try {
        const res = await fetch('/api/schedules');
        if (res.ok) {
            return await res.json();
        }
    } catch {}
    return {};
}

/**
 * Menyimpan custom schedules ke server backend lokal
 */
export async function saveServerSchedules(schedules: Record<string, Record<string, string>>): Promise<boolean> {
    try {
        const res = await fetch('/api/schedules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(schedules),
        });
        return res.ok;
    } catch {
        return false;
    }
}
