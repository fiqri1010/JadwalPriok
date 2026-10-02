import React, { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    X,
    Check,
    AlertCircle,
    Loader2,
    ExternalLink,
    LogOut,
    CheckCircle2,
    Shield,
    Sparkles,
    CalendarCheck,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { DayData, AppTheme } from '../types';
import {
    signInWithGoogleCalendar,
    exportShiftsToGoogleCalendar,
    getCachedAccessToken,
    logoutGoogle,
    auth,
    ShiftCalendarEntry,
} from '../lib/googleCalendarExport';
import { Checkbox } from './ui/Checkbox';

interface GoogleCalendarExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    filteredEntries: Array<{
        day: number;
        month: number;
        year: number;
        dateKey: string;
        dayName: string;
        data: DayData;
    }>;
    rangeLabel: string;
    currentTheme?: string;
    onShowToast: (msg: string) => void;
}

export const GoogleCalendarExportModal: React.FC<GoogleCalendarExportModalProps> = ({
    isOpen,
    onClose,
    filteredEntries,
    rangeLabel,
    currentTheme = 'default',
    onShowToast,
}) => {
    const isIndustrial = currentTheme === 'industrial';
    const isPaperSketch = currentTheme === 'paperSketch';
    const isWinamp = currentTheme === 'winamp';
    const isDark = currentTheme === 'dark' || currentTheme === 'darkFluid';
    const isDashboard = currentTheme === 'dashboard';

    const [user, setUser] = useState<User | null>(() => auth.currentUser);
    const [token, setToken] = useState<string | null>(() => getCachedAccessToken());
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [includeOffDays, setIncludeOffDays] = useState(true);
    const [progress, setProgress] = useState<{ current: number; total: number; shiftName: string } | null>(null);
    const [exportSuccessResult, setExportSuccessResult] = useState<{
        count: number;
        errorCount: number;
        calendarLink?: string;
    } | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
            setToken(getCachedAccessToken());
        });
        return () => unsubscribe();
    }, []);

    if (!isOpen) return null;

    // Calculate shift counts
    const workShiftEntries = filteredEntries.filter((e) => {
        const s = (e.data.shift || '').toUpperCase().trim();
        return s && s !== 'OFF' && s !== 'LIBUR';
    });
    const offEntries = filteredEntries.filter((e) => {
        const s = (e.data.shift || '').toUpperCase().trim();
        return s === 'OFF' || s === 'LIBUR';
    });

    const totalToExport = includeOffDays ? workShiftEntries.length + offEntries.length : workShiftEntries.length;

    const handleGoogleSignIn = async () => {
        try {
            setIsAuthenticating(true);
            const result = await signInWithGoogleCalendar();
            setUser(result.user);
            setToken(result.accessToken);
            onShowToast(`Berhasil terhubung dengan Google Calendar (${result.user.email || 'Akun Google'}).`);
        } catch (err: any) {
            console.error('Google Sign in failed:', err);
            onShowToast(`Gagal login Google: ${err?.message || 'Izin ditolak'}`);
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleLogout = async () => {
        await logoutGoogle();
        setUser(null);
        setToken(null);
        onShowToast('Akun Google Calendar telah diputuskan.');
    };

    const handleExecuteExport = async () => {
        let currentToken = token || getCachedAccessToken();

        // If not authenticated or token missing, trigger Google Sign in first
        if (!currentToken) {
            try {
                setIsAuthenticating(true);
                const result = await signInWithGoogleCalendar();
                setUser(result.user);
                setToken(result.accessToken);
                currentToken = result.accessToken;
            } catch (err: any) {
                setIsAuthenticating(false);
                onShowToast(`Harap hubungkan akun Google Calendar terlebih dahulu.`);
                return;
            } finally {
                setIsAuthenticating(false);
            }
        }

        if (!currentToken) return;

        try {
            setIsExporting(true);
            setProgress({ current: 0, total: totalToExport, shiftName: 'Menyiapkan sinkronisasi...' });

            const entriesPayload: ShiftCalendarEntry[] = filteredEntries.map((e) => ({
                dateKey: e.dateKey,
                dayName: e.dayName,
                data: e.data,
            }));

            const res = await exportShiftsToGoogleCalendar(entriesPayload, currentToken, {
                includeOffDays,
                onProgress: (current, total, shiftName) => {
                    setProgress({ current, total, shiftName });
                },
            });

            if (res.success) {
                setExportSuccessResult({
                    count: res.exportedCount,
                    errorCount: res.errorCount,
                    calendarLink: res.calendarLink,
                });
                onShowToast(res.message);
            } else {
                onShowToast(res.message);
            }
        } catch (err: any) {
            console.error('Export Google Calendar error:', err);
            onShowToast(`Gagal mengekspor ke Google Calendar: ${err?.message || 'Kesalahan sistem'}`);
        } finally {
            setIsExporting(false);
            setProgress(null);
        }
    };

    return (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="fixed inset-0" onClick={() => !isExporting && onClose()} />
            
            <div
                className={`relative z-10 w-full max-w-lg p-5 sm:p-6 rounded-2xl border space-y-4 shadow-2xl ${
                    isIndustrial
                        ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.2)] text-[#E2E8F0]'
                        : isPaperSketch
                        ? 'bg-white border-2 border-[#2b2b2b] shadow-[5px_5px_0px_#2b2b2b] text-[#2b2b2b]'
                        : isWinamp
                        ? 'bg-[#191919] text-[#00FF00] font-mono border-2 border-zinc-700 shadow-[2px_2px_0_#000]'
                        : isDark
                        ? 'bg-[#1E1E1E] border-slate-800 text-slate-100'
                        : isDashboard
                        ? 'bg-[#FFF5D0] text-[#4D2A00] border-[#4D2A00]/25'
                        : 'bg-white border-slate-200 text-slate-900'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-current/10 pb-3">
                    <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                            <CalendarIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
                                Ekspor ke Google Calendar
                            </h3>
                            <p className="text-[11px] opacity-70">
                                Sinkronisasi jadwal shift kerja ke akun Google Calendar Anda
                            </p>
                        </div>
                    </div>
                    {!isExporting && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-current/10 opacity-70 hover:opacity-100 cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Body Content */}
                {exportSuccessResult ? (
                    /* Success Screen */
                    <div className="space-y-4 text-center py-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-xs">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                                Berhasil Diekspor!
                            </h4>
                            <p className="text-xs opacity-80 max-w-sm mx-auto leading-relaxed">
                                Sebanyak <strong>{exportSuccessResult.count} shift kerja</strong> telah ditambahkan langsung ke Google Calendar utama Anda.
                            </p>
                        </div>

                        <div className="p-3 rounded-xl bg-current/5 border border-current/10 text-xs font-mono text-left space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="opacity-70">Rentang Waktu:</span>
                                <span className="font-bold">{rangeLabel}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="opacity-70">Status Sync:</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">Tersinkronisasi</span>
                            </div>
                            {user?.email && (
                                <div className="flex items-center justify-between">
                                    <span className="opacity-70">Akun Google:</span>
                                    <span className="font-bold truncate max-w-[200px]">{user.email}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-center gap-2 pt-2">
                            <a
                                href={exportSuccessResult.calendarLink || 'https://calendar.google.com'}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center space-x-1.5 active:scale-95 transition-all"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Buka Google Calendar</span>
                            </a>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl border border-current/20 hover:bg-current/10 text-xs font-bold cursor-pointer active:scale-95 transition-all"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Configuration & Confirmation Screen */
                    <div className="space-y-3.5">
                        {/* 1. Account Section */}
                        <div className="p-3 rounded-xl bg-current/5 border border-current/10 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold flex items-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5 text-blue-500" />
                                    Akun Google Terhubung:
                                </span>
                                {user && token && (
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="text-[10.5px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                                        title="Putuskan sambungan akun"
                                    >
                                        <LogOut className="w-3 h-3" />
                                        <span>Ganti Akun</span>
                                    </button>
                                )}
                            </div>

                            {user && token ? (
                                <div className="flex items-center space-x-2.5 pt-1">
                                    {user.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt={user.displayName || 'Google User'}
                                            className="w-8 h-8 rounded-full border border-blue-500/40 object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                                            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'G'}
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-bold truncate">
                                            {user.displayName || 'Pengguna Google'}
                                        </div>
                                        <div className="text-[10px] font-mono opacity-70 truncate">
                                            {user.email || 'Akun Google'}
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                        Terhubung
                                    </span>
                                </div>
                            ) : (
                                <div className="pt-1">
                                    <button
                                        type="button"
                                        disabled={isAuthenticating}
                                        onClick={handleGoogleSignIn}
                                        className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border border-current/20 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-98"
                                    >
                                        {isAuthenticating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                                <span>Menghubungkan Akun Google...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                                    <path
                                                        fill="#4285F4"
                                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                    />
                                                    <path
                                                        fill="#34A853"
                                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                    />
                                                    <path
                                                        fill="#FBBC05"
                                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                                    />
                                                    <path
                                                        fill="#EA4335"
                                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                                    />
                                                </svg>
                                                <span>Masuk dengan Akun Google</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 2. Export Preview Details */}
                        <div className="p-3 rounded-xl bg-current/5 border border-current/10 space-y-2 text-xs">
                            <div className="flex items-center justify-between border-b border-current/10 pb-1.5">
                                <span className="opacity-75">Periode Jadwal:</span>
                                <span className="font-extrabold">{rangeLabel}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="opacity-75">Shift Kerja (Graha/NPCT/TPSL/Malam):</span>
                                <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">
                                    {workShiftEntries.length} Event
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="opacity-75">Hari Libur / OFF Shift:</span>
                                <span className="font-bold text-slate-500 font-mono">
                                    {offEntries.length} Event
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-t border-current/10 pt-1.5">
                                <span className="font-bold">Total yang akan diekspor:</span>
                                <span className="font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                                    {totalToExport} Event
                                </span>
                            </div>
                        </div>

                        {/* 3. Export Options */}
                        <div className="p-3 rounded-xl bg-current/5 border border-current/10 space-y-2">
                            <Checkbox
                                id="google-export-include-off"
                                theme={currentTheme as AppTheme}
                                checked={includeOffDays}
                                onChange={(e) => setIncludeOffDays(e.target.checked)}
                                label={
                                    <span className="text-xs font-bold leading-tight">
                                        Sertakan hari OFF / Cuti sebagai event seharian penuh
                                    </span>
                                }
                            />
                            <p className="text-[10px] opacity-65 leading-relaxed pl-6">
                                Shift kerja akan disetel otomatis dengan jam masuk dan jam pulang sesuai posko (WIB), sedangkan hari OFF akan dicatat sebagai event kalender seharian.
                            </p>
                        </div>

                        {/* Progress Indicator when exporting */}
                        {isExporting && progress && (
                            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 space-y-2 animate-in fade-in duration-150">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                                        <span>Menyinkronkan ke Google Calendar...</span>
                                    </div>
                                    <span className="font-mono text-blue-600 dark:text-blue-400">
                                        {progress.current} / {progress.total}
                                    </span>
                                </div>
                                <div className="w-full bg-current/10 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-150"
                                        style={{
                                            width: `${Math.round((progress.current / Math.max(progress.total, 1)) * 100)}%`,
                                        }}
                                    />
                                </div>
                                <div className="text-[10px] font-mono opacity-70 truncate">
                                    {progress.shiftName}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-current/10">
                            <button
                                type="button"
                                disabled={isExporting}
                                onClick={onClose}
                                className="px-3.5 py-2 text-xs font-bold rounded-xl border border-current/20 hover:bg-current/10 cursor-pointer disabled:opacity-50 transition-all"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={isExporting || totalToExport === 0}
                                onClick={handleExecuteExport}
                                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs flex items-center space-x-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isExporting ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Mengekspor...</span>
                                    </>
                                ) : (
                                    <>
                                        <CalendarCheck className="w-3.5 h-3.5" />
                                        <span>Konfirmasi & Ekspor ke Google</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
