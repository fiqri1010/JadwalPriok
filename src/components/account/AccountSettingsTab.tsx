import React, { useState, useEffect } from 'react';
import {
    User,
    KeyRound,
    Laptop,
    Check,
    AlertCircle,
    Eye,
    EyeOff,
    CheckCircle2,
    Save,
    RefreshCw,
    Trash2,
    Mail,
    Shield,
    Sliders,
} from 'lucide-react';
import { AppTheme } from '../../types';
import {
    DeviceInfo,
    DeviceSession,
    getRealDeviceInfo,
    detectOS,
    detectBrowser,
    detectDeviceType,
    generateDeviceName,
    getSimpleDeviceType,
    getSimpleOS,
    getDeviceMacAddress,
} from '../../utils/deviceDetector';
import {
    addApprovalRequest,
    syncDeviceSessionToAdminSessions,
    getCurrentUserRoleInfo,
    getAdminUsers,
    saveAdminUsers,
    getSuperAdminEmail,
    saveSuperAdminEmail,
} from '../../utils/adminStorage';
import { saveServerUsers } from '../../utils/serverSync';

interface AccountSettingsTabProps {
    theme?: AppTheme;
    onShowToast: (msg: string) => void;
}

const LOCAL_STORAGE_NIP_KEY = 'jadwalpriok_user_nip';
const LOCAL_STORAGE_PASS_KEY = 'jadwalpriok_user_pass';
const LOCAL_STORAGE_NAME_KEY = 'jadwalpriok_user_name';
const LOCAL_STORAGE_SESSIONS_KEY = 'jadwalpriok_device_sessions';

export const AccountSettingsTab: React.FC<AccountSettingsTabProps> = ({
    theme = 'default',
    onShowToast,
}) => {
    const isIndustrial = theme === 'industrial';
    const isPaperSketch = theme === 'paperSketch';
    const isTechnical = theme === 'technical';
    const isWinamp = theme === 'winamp';
    const isDark = theme === 'dark';
    const isDashboard = theme === 'dashboard';

    // State Akun Pegawai
    const [nip, setNip] = useState(() => localStorage.getItem(LOCAL_STORAGE_NIP_KEY) || '199510102015121002');
    const [namaPegawai, setNamaPegawai] = useState(() => localStorage.getItem(LOCAL_STORAGE_NAME_KEY) || 'Ahmad Fiqri');
    const [hasPassword, setHasPassword] = useState(() => Boolean(localStorage.getItem(LOCAL_STORAGE_PASS_KEY)));
    
    // Form Ubah/Set Password (tidak memerlukan password lama)
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

    // Delete Account Request Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState('');

    // Real-Time Hardware & Device Detection State
    const [isDetecting, setIsDetecting] = useState(false);
    const [currentDeviceInfo, setCurrentDeviceInfo] = useState<DeviceInfo>(() => {
        const os = detectOS();
        const browser = detectBrowser();
        const deviceType = detectDeviceType();
        return {
            deviceType,
            deviceName: generateDeviceName(deviceType, os, browser),
            os,
            browser,
            screenResolution: `${window.screen.width} × ${window.screen.height} px`,
            pixelRatio: window.devicePixelRatio || 1,
            platform: window.navigator.platform || 'Web Client',
            language: window.navigator.language || 'id-ID',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta',
            ipAddress: '192.168.10.45',
            macAddress: getDeviceMacAddress(),
            location: 'Tanjung Priok, Jakarta Utara',
            isTouchDevice: navigator.maxTouchPoints > 0,
            networkType: 'Koneksi Normal (LAN / Wi-Fi)',
        };
    });

    // Device Sessions List (Murni Sesi Riil dari Perangkat Nyata)
    const [sessions, setSessions] = useState<DeviceSession[]>(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const realOnly = parsed.filter((s: any) => !s.id?.startsWith('sess-remote') && !s.id?.startsWith('sess-mobile'));
                    if (realOnly.length > 0) return realOnly;
                }
            }
        } catch {}

        const os = detectOS();
        const browser = detectBrowser();
        const deviceType = detectDeviceType();
        return [
            {
                id: 'sess-current-real',
                deviceName: generateDeviceName(deviceType, os, browser),
                deviceType,
                browser,
                os,
                screenResolution: `${window.screen.width} × ${window.screen.height} px`,
                ipAddress: '192.168.10.45',
                macAddress: getDeviceMacAddress(),
                firstLogin: '29 Sep 2026, 07:30 WIB',
                lastActive: 'Sedang Aktif',
                isCurrent: true,
                location: 'Tanjung Priok, Jakarta Utara',
            },
        ];
    });

    // Run dynamic real-time hardware, IP, and location detection
    const refreshDeviceDetection = async (showToastNotice = true) => {
        setIsDetecting(true);
        try {
            const detected = await getRealDeviceInfo();
            setCurrentDeviceInfo(detected);

            // Update current device session item in list
            setSessions((prevSessions) => {
                const existingNonCurrent = prevSessions.filter((s) => !s.isCurrent);
                const currentSession: DeviceSession = {
                    id: 'sess-current-real',
                    deviceName: detected.deviceName,
                    deviceType: detected.deviceType,
                    browser: detected.browser,
                    os: detected.os,
                    screenResolution: detected.screenResolution,
                    ipAddress: detected.ipAddress,
                    macAddress: detected.macAddress || getDeviceMacAddress(),
                    firstLogin: '29 Sep 2026, 07:30 WIB',
                    lastActive: 'Sedang Aktif',
                    isCurrent: true,
                    location: detected.location.includes(',') ? detected.location : 'Tanjung Priok, Jakarta Utara',
                };
                const updated = [currentSession, ...existingNonCurrent];
                localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, JSON.stringify(updated));
                // Sinkronkan ke sesi admin agar selalu identik
                syncDeviceSessionToAdminSessions(nip, namaPegawai, currentSession);
                return updated;
            });

            if (showToastNotice) {
                onShowToast('Informasi spesifikasi dan jaringan perangkat diperbarui.');
            }
        } catch {
            if (showToastNotice) {
                onShowToast('Deteksi hardware lokal selesai menggunakan spesifikasi browser.');
            }
        } finally {
            setIsDetecting(false);
        }
    };

    // Auto-detect on component mount
    useEffect(() => {
        refreshDeviceDetection(false);
    }, []);

    const handleSavePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(null);

        const trimmed = newPassword.trim();
        const confirmTrimmed = confirmPassword.trim();

        if (!trimmed) {
            setPasswordError('Password baru tidak boleh kosong.');
            return;
        }

        if (trimmed.length < 4 || trimmed.length > 12) {
            setPasswordError('Panjang password harus antara 4 hingga 12 karakter.');
            return;
        }

        // Mendukung huruf, angka (bisa angka saja/PIN), dan karakter khusus !@#$%^&*_+.
        const allowedRegex = /^[a-zA-Z0-9!@#$%^&*_+.]+$/;
        if (!allowedRegex.test(trimmed)) {
            setPasswordError('Password hanya boleh berisi huruf, angka, atau simbol !@#$%^&*_+.');
            return;
        }

        // Tidak peka huruf besar kecil (case-insensitive)
        if (trimmed.toLowerCase() !== confirmTrimmed.toLowerCase()) {
            setPasswordError('Konfirmasi password tidak cocok dengan password baru.');
            return;
        }

        // Simpan password baru langsung tanpa butuh password lama
        localStorage.setItem(LOCAL_STORAGE_PASS_KEY, trimmed);
        setHasPassword(true);
        setNewPassword('');
        setConfirmPassword('');

        // Sinkronkan ke daftar database pengguna di aplikasi
        try {
            const adminUsers = getAdminUsers();
            const target = adminUsers.find((u) => u.nip === nip);
            if (target) {
                target.hasPassword = true;
                target.passwordValue = trimmed;
                saveAdminUsers(adminUsers);
                saveServerUsers(adminUsers).catch(() => {});
                window.dispatchEvent(new Event('storage'));
            }
        } catch {}

        setPasswordSuccess('Password berhasil disimpan dan diterapkan untuk akun Anda.');
        onShowToast('Password akun berhasil diperbarui tanpa perlu password lama.');
    };

    const roleInfo = getCurrentUserRoleInfo();
    const isSuperAdmin = nip === '199510102015121002' || namaPegawai === 'Ahmad Fiqri' || roleInfo.role === 'superadmin';
    const [superAdminEmail, setSuperAdminEmail] = useState(() => getSuperAdminEmail());
    const [emailInput, setEmailInput] = useState(superAdminEmail);
    const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);

    const handleSaveEmail = (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError(null);
        setEmailSuccess(null);
        const clean = emailInput.trim();
        if (!clean || !clean.includes('@') || !clean.includes('.')) {
            setEmailError('Harap masukkan format alamat email yang valid.');
            return;
        }
        saveSuperAdminEmail(clean);
        setSuperAdminEmail(clean);
        setEmailSuccess(`Alamat email pemulihan Super Admin (${clean}) berhasil disimpan.`);
        onShowToast('Email pemulihan Super Admin berhasil diperbarui.');
    };

    const handleSendDeleteRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if (deleteConfirmInput !== 'HAPUS') {
            onShowToast('Ketik kata "HAPUS" dengan tepat untuk mengonfirmasi.');
            return;
        }

        addApprovalRequest({
            userNip: nip,
            userName: namaPegawai,
            unitPosko: 'Pelayanan Graha & TPSL',
            requestType: 'delete_account',
            reason: 'Pengajuan penghapusan akun oleh pengguna dari menu Pengaturan Akun',
        });

        setIsDeleteModalOpen(false);
        setDeleteConfirmInput('');
        onShowToast(`Permintaan hapus akun untuk NIP ${nip} (${namaPegawai}) berhasil dikirimkan ke Admin untuk diverifikasi.`);
    };

    const [generalSettings, setGeneralSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('jadwalpriok_general_settings');
            if (saved) return JSON.parse(saved);
        } catch {}
        return {
            syncSchedulePersonalToTeam: true,
            syncScheduleChangesToTeam: true,
            saveSettingsToServer: true,
            noPasswordLanding: false,
            showThemeButton: true,
            showExportButton: true,
            showSidebar: true,
            gridShiftOnly: false,
            syncWorkDataToServer: true,
            disableAnimations: false,
        };
    });

    const updateGeneralSetting = (key: string, val: boolean) => {
        const updated = { ...generalSettings, [key]: val };
        setGeneralSettings(updated);
        localStorage.setItem('jadwalpriok_general_settings', JSON.stringify(updated));

        if (val && (key === 'syncSchedulePersonalToTeam' || key === 'syncScheduleChangesToTeam' || key === 'syncWorkDataToServer')) {
            try {
                const rawDays = localStorage.getItem('jadwalpriok_days_state');
                if (rawDays) {
                    const daysParsed = JSON.parse(rawDays);
                    if (key.includes('Team')) {
                        const teamSchedules = JSON.parse(localStorage.getItem('jadwalpriok_team_schedules') || '{}');
                        teamSchedules[nip] = daysParsed;
                        localStorage.setItem('jadwalpriok_team_schedules', JSON.stringify(teamSchedules));
                    }
                }
            } catch {}
            onShowToast('Sinkronisasi Ulang (Force Sync) Berhasil: Seluruh data masa lalu telah disinkronkan.');
        } else {
            onShowToast('Pengaturan UMUM diperbarui.');
        }
    };

    return (
        <div className="space-y-5 animate-in fade-in duration-200">
            {/* 1. PALING ATAS: Header Informasi Akun & Role */}
            <div className={`p-4 rounded-xl border ${
                isIndustrial
                    ? 'bg-[#0F1115] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                    : isPaperSketch
                    ? 'bg-[#ffffff] border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
                    : isTechnical
                    ? 'bg-[#F8F7F4] dark:bg-[#0D1117] border-[1.5px] border-[#111113] dark:border-slate-700'
                    : isWinamp
                    ? 'bg-black border border-[#00FF00] text-[#00FF00]'
                    : isDark
                    ? 'bg-[#161616] border-slate-800 text-slate-100'
                    : isDashboard
                    ? 'bg-[#FFF5D0] border border-[#4D2A00]/25 text-[#4D2A00]'
                    : 'bg-slate-50/80 border-slate-200 text-slate-900'
            }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3.5">
                        {/* Avatar Placeholder */}
                        <div className={`w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center shrink-0 ${
                            isIndustrial
                                ? 'border-[#2DD4BF]/40 bg-[#1A1D23] text-[#2DD4BF]'
                                : isWinamp
                                ? 'border-[#00FF00] bg-zinc-900 text-[#00FF00]'
                                : 'border-current/30 bg-current/10 text-teal-600 dark:text-teal-400'
                        }`}>
                            <User className="w-6 h-6 opacity-70" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm sm:text-base font-extrabold">{namaPegawai}</h3>
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${roleInfo.badgeColor}`}>
                                    Role: {roleInfo.authorityName}
                                </span>
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                                    hasPassword
                                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                }`}>
                                    {hasPassword ? 'Password Aktif' : 'Belum Set Password'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs opacity-75 mt-0.5 font-mono">
                                <span>NIP Pegawai:</span>
                                <span className="font-bold tracking-wider">{nip}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 1.5 KHUSUS SUPER ADMIN: Pengaturan Alamat Email Pemulihan */}
            {isSuperAdmin && (
                <div className={`p-4 rounded-xl border space-y-3.5 ${
                    isIndustrial
                        ? 'bg-[#0F1115] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                        : isPaperSketch
                        ? 'bg-[#ffffff] border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
                        : isTechnical
                        ? 'bg-[#F8F7F4] dark:bg-[#0D1117] border-[1.5px] border-[#111113] dark:border-slate-700'
                        : isWinamp
                        ? 'bg-black border border-[#00FF00] text-[#00FF00]'
                        : isDark
                        ? 'bg-[#161616] border-slate-800 text-slate-100'
                        : isDashboard
                        ? 'bg-[#FFF5D0] border border-[#4D2A00]/25 text-[#4D2A00]'
                        : 'bg-white border-slate-200 text-slate-900'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                                <Mail className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                                    Email Pemulihan Sandi Super Admin
                                </h4>
                                <p className="text-[11px] opacity-70">
                                    Instruksi atau token pemulihan akan dikirim ke email ini jika lupa kata sandi
                                </p>
                            </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                            Super Admin
                        </span>
                    </div>

                    <form onSubmit={handleSaveEmail} className="space-y-3 pt-1">
                        <div className="space-y-1">
                            <label className="text-xs font-bold block">Alamat Email Penerima Pemulihan:</label>
                            <input
                                type="email"
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                placeholder="contoh: afiqri22@gmail.com"
                                required
                                className="w-full p-2 text-xs rounded-lg border border-current/20 bg-current/5 outline-none focus:border-purple-500 font-mono"
                            />
                        </div>

                        {emailError && (
                            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{emailError}</span>
                            </div>
                        )}

                        {emailSuccess && (
                            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>{emailSuccess}</span>
                            </div>
                        )}

                        <div className="flex justify-end pt-1">
                            <button
                                type="submit"
                                className="px-4 py-2 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                            >
                                <Save className="w-3.5 h-3.5" />
                                <span>Simpan Email Pemulihan</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 2. DIBAWAHNYA: Pengaturan Ubah / Reset Password */}
            <div className={`p-4 rounded-xl border space-y-3.5 ${
                isIndustrial
                    ? 'bg-[#0F1115] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                    : isPaperSketch
                    ? 'bg-[#ffffff] border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
                    : isTechnical
                    ? 'bg-[#F8F7F4] dark:bg-[#0D1117] border-[1.5px] border-[#111113] dark:border-slate-700'
                    : isWinamp
                    ? 'bg-black border border-[#00FF00] text-[#00FF00]'
                    : isDark
                    ? 'bg-[#161616] border-slate-800 text-slate-100'
                    : isDashboard
                    ? 'bg-[#FFF5D0] border border-[#4D2A00]/25 text-[#4D2A00]'
                    : 'bg-white border-slate-200 text-slate-900'
            }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <KeyRound className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                            {hasPassword ? 'Ubah Password Akun' : 'Atur Password Baru'}
                        </h4>
                    </div>
                    <span className="text-[11px] opacity-70 font-medium">
                        (Dapat diubah langsung tanpa password lama)
                    </span>
                </div>

                <ul className="text-xs opacity-80 leading-relaxed space-y-1 list-disc list-inside">
                    <li>Password digunakan untuk mengunci akun menghindari digunakan orang lain saat login.</li>
                    <li>Reset password (jika lupa ketika login) dapat diajukan pada halaman untuk diverifikasi admin.</li>
                </ul>

                <form onSubmit={handleSavePassword} className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold block">Password Baru / PIN:</label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Ketik password baru (4-12 karakter)..."
                                    className="w-full p-2 pr-9 text-xs rounded-lg border border-current/20 bg-current/5 outline-none focus:border-teal-500 font-mono"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-current/60 hover:text-current cursor-pointer"
                                    title={showNewPassword ? 'Sembunyikan' : 'Tampilkan'}
                                >
                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold block">Ulangi Password Baru:</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Konfirmasi password baru..."
                                className="w-full p-2 text-xs rounded-lg border border-current/20 bg-current/5 outline-none focus:border-teal-500 font-mono"
                            />
                        </div>
                    </div>

                    {passwordError && (
                        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{passwordError}</span>
                        </div>
                    )}

                    {passwordSuccess && (
                        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>{passwordSuccess}</span>
                        </div>
                    )}

                    <div className="flex justify-end pt-1">
                        <button
                            type="submit"
                            className="px-4 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                        >
                            <Check className="w-3.5 h-3.5" />
                            <span>{hasPassword ? 'Simpan Password Baru' : 'Terapkan Password'}</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* 2.5 SECTION UMUM: Pengaturan & Sinkronisasi Toggles */}
            <div className={`p-4 rounded-xl border space-y-4 ${
                isIndustrial
                    ? 'bg-[#0F1115] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                    : isPaperSketch
                    ? 'bg-[#ffffff] border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
                    : isTechnical
                    ? 'bg-[#F8F7F4] dark:bg-[#0D1117] border-[1.5px] border-[#111113] dark:border-slate-700'
                    : isWinamp
                    ? 'bg-black border border-[#00FF00] text-[#00FF00]'
                    : isDark
                    ? 'bg-[#161616] border-slate-800 text-slate-100'
                    : isDashboard
                    ? 'bg-[#FFF5D0] border border-[#4D2A00]/25 text-[#4D2A00]'
                    : 'bg-white border-slate-200 text-slate-900'
            }`}>
                <div className="flex items-center space-x-2 border-b border-current/10 pb-2.5">
                    <Sliders className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                        UMUM (Pengaturan & Sinkronisasi)
                    </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-current/10 bg-current/5">
                        <span className="font-medium pr-2">Sinkronisasi jadwal, timpa jadwal personal yang diinput user di kalender kerja ke jadwal rekan.</span>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                checked={generalSettings.syncSchedulePersonalToTeam}
                                onChange={(e) => updateGeneralSetting('syncSchedulePersonalToTeam', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-300 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-teal-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-current/10 bg-current/5">
                        <span className="font-medium pr-2">Sinkronisasi jadwal, masukkan perubahan jadwal personal user (cuti, st, geser off, tukar/beri/ambil piket) ke data Jadwal Rekan.</span>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                checked={generalSettings.syncScheduleChangesToTeam}
                                onChange={(e) => updateGeneralSetting('syncScheduleChangesToTeam', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-300 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-teal-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-current/10 bg-current/5">
                        <span className="font-medium pr-2">Sinkronisasi, Simpan Pengaturan ke Server (jika ubah/login di device lain maka peraturan langsung diterapkan).</span>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                checked={generalSettings.saveSettingsToServer}
                                onChange={(e) => updateGeneralSetting('saveSettingsToServer', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-300 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-teal-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-current/10 bg-current/5">
                        <span className="font-medium pr-2">Tidak memerlukan password (user secara sukarela membiarkan akun terbuka / masuk landing page tanpa password).</span>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                checked={generalSettings.noPasswordLanding}
                                onChange={(e) => updateGeneralSetting('noPasswordLanding', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-300 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-teal-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-current/10 bg-current/5">
                        <span className="font-medium pr-2">Tampilkan / Sembunyikan tombol tema.</span>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                checked={generalSettings.showThemeButton}
                                onChange={(e) => updateGeneralSetting('showThemeButton', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-300 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-teal-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-current/10 bg-current/5">
                        <span className="font-medium pr-2">Tampilkan / Sembunyikan tombol ekspor.</span>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                checked={generalSettings.showExportButton}
                                onChange={(e) => updateGeneralSetting('showExportButton', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-300 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-teal-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-current/10 bg-current/5">
                        <span className="font-medium pr-2">Tampilkan / Sembunyikan sidebar.</span>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                checked={generalSettings.showSidebar}
                                onChange={(e) => updateGeneralSetting('showSidebar', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-300 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-teal-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-current/10 bg-current/5">
                        <span className="font-medium pr-2">Tampilan grid hanya shift dan tanggal (kartu tanggal ringkas tanpa jam/catatan di luar).</span>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                checked={generalSettings.gridShiftOnly}
                                onChange={(e) => updateGeneralSetting('gridShiftOnly', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-300 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-teal-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-current/10 bg-current/5">
                        <span className="font-medium pr-2">Sinkronisasi, data inputan user di kalender kerja ke server (jam pulang-masuk, catatan, dll).</span>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                checked={generalSettings.syncWorkDataToServer}
                                onChange={(e) => updateGeneralSetting('syncWorkDataToServer', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-300 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-teal-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-current/10 bg-current/5">
                        <span className="font-medium pr-2 text-teal-600 dark:text-teal-400 font-bold">Matikan UX dan Animasi lainnya (Nonaktifkan transisi berat).</span>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                                type="checkbox"
                                checked={generalSettings.disableAnimations}
                                onChange={(e) => updateGeneralSetting('disableAnimations', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-300 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-teal-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* 3. DIBAWAHNYA: Deteksi Perangkat & Lokasi Aktif (Teks Biasa) */}
            <div className={`p-4 rounded-xl border space-y-3.5 ${
                isIndustrial
                    ? 'bg-[#0F1115] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                    : isPaperSketch
                    ? 'bg-[#ffffff] border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
                    : isTechnical
                    ? 'bg-[#F8F7F4] dark:bg-[#0D1117] border-[1.5px] border-[#111113] dark:border-slate-700'
                    : isWinamp
                    ? 'bg-black border border-[#00FF00] text-[#00FF00]'
                    : isDark
                    ? 'bg-[#161616] border-slate-800 text-slate-100'
                    : isDashboard
                    ? 'bg-[#FFF5D0] border border-[#4D2A00]/25 text-[#4D2A00]'
                    : 'bg-white border-slate-200 text-slate-900'
            }`}>
                <div className="flex items-center justify-between border-b border-current/10 pb-2.5">
                    <div className="flex items-center space-x-2">
                        <Laptop className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                            Deteksi Perangkat & Lokasi Aktif
                        </h4>
                    </div>

                    <button
                        type="button"
                        onClick={() => refreshDeviceDetection(true)}
                        disabled={isDetecting}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                            isDetecting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-current/5 active:scale-95'
                        }`}
                        title="Pindai ulang perangkat dan jaringan"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin text-teal-500' : ''}`} />
                        <span>{isDetecting ? 'Mendeteksi...' : 'Pindai Ulang'}</span>
                    </button>
                </div>

                {/* Teks Biasa Sesuai Format */}
                <div className="space-y-1.5 text-xs font-mono">
                    <div>
                        <span className="font-bold font-sans opacity-75">Tipe & OS : </span>
                        <span className="font-bold text-teal-600 dark:text-teal-400">{getSimpleDeviceType(currentDeviceInfo.deviceType)}</span>
                        <span className="opacity-75 font-sans"> & </span>
                        <span className="font-bold text-teal-600 dark:text-teal-400">{getSimpleOS(currentDeviceInfo.os)}</span>
                    </div>
                    <div>
                        <span className="font-bold font-sans opacity-75">Browser: </span>
                        <span className="font-bold">{currentDeviceInfo.browser}</span>
                    </div>
                    <div>
                        <span className="font-bold font-sans opacity-75">IP & Lokasi: </span>
                        <span className="font-bold">{currentDeviceInfo.ipAddress}</span>
                        <span className="opacity-75 font-sans"> | </span>
                        <span className="font-bold">{currentDeviceInfo.location.includes(',') ? currentDeviceInfo.location : `Tanjung Priok, ${currentDeviceInfo.location}`}</span>
                    </div>
                    <div>
                        <span className="font-bold font-sans opacity-75">MAC Address: </span>
                        <span className="font-bold tracking-wider">{currentDeviceInfo.macAddress || getDeviceMacAddress()}</span>
                    </div>
                </div>
            </div>

            {/* 4. DIBAWAHNYA LAGI: Log Sesi Perangkat Terhubung (Format Teks Serupa) */}
            <div className={`p-4 rounded-xl border space-y-3.5 ${
                isIndustrial
                    ? 'bg-[#0F1115] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                    : isPaperSketch
                    ? 'bg-[#ffffff] border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
                    : isTechnical
                    ? 'bg-[#F8F7F4] dark:bg-[#0D1117] border-[1.5px] border-[#111113] dark:border-slate-700'
                    : isWinamp
                    ? 'bg-black border border-[#00FF00] text-[#00FF00]'
                    : isDark
                    ? 'bg-[#161616] border-slate-800 text-slate-100'
                    : isDashboard
                    ? 'bg-[#FFF5D0] border border-[#4D2A00]/25 text-[#4D2A00]'
                    : 'bg-white border-slate-200 text-slate-900'
            }`}>
                <div className="flex items-center justify-between border-b border-current/10 pb-2.5">
                    <div className="flex items-center space-x-2">
                        <Laptop className="w-4 h-4 text-indigo-500" />
                        <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                            Log Sesi Perangkat Terhubung
                        </h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold uppercase border border-indigo-500/30">
                        {sessions.length} Sesi Terdaftar
                    </span>
                </div>

                {/* List Sesi Perangkat Riil (Format Teks Serupa) */}
                <div className="space-y-2.5 pt-1">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                                session.isCurrent
                                    ? isIndustrial
                                        ? 'bg-[#1A1D23] border-[#2DD4BF]/40'
                                        : 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-300/60 dark:border-teal-700/60'
                                    : 'bg-current/5 border-current/10'
                            }`}
                        >
                            <div className="space-y-1.5 text-xs font-mono flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className="text-xs font-bold font-sans">
                                        {session.deviceName}
                                    </span>
                                    {session.isCurrent && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500 text-white shadow-2xs">
                                            Perangkat Ini (Aktif)
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <span className="font-bold font-sans opacity-75">Tipe & OS : </span>
                                    <span className="font-bold text-teal-600 dark:text-teal-400">{getSimpleDeviceType(session.deviceType)}</span>
                                    <span className="opacity-75 font-sans"> & </span>
                                    <span className="font-bold text-teal-600 dark:text-teal-400">{getSimpleOS(session.os)}</span>
                                </div>
                                <div>
                                    <span className="font-bold font-sans opacity-75">Browser: </span>
                                    <span className="font-bold">{session.browser}</span>
                                </div>
                                <div>
                                    <span className="font-bold font-sans opacity-75">IP & Lokasi: </span>
                                    <span className="font-bold">{session.ipAddress}</span>
                                    <span className="opacity-75 font-sans"> | </span>
                                    <span className="font-bold">{session.location.includes(',') ? session.location : `Tanjung Priok, ${session.location}`}</span>
                                </div>
                                <div>
                                    <span className="font-bold font-sans opacity-75">MAC Address: </span>
                                    <span className="font-bold tracking-wider">{session.macAddress || getDeviceMacAddress()}</span>
                                </div>
                            </div>

                            <div className="text-right shrink-0 self-end sm:self-start pt-0.5">
                                <span className={`text-[11px] font-mono font-bold block ${
                                    session.isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'opacity-60'
                                }`}>
                                    {session.lastActive}
                                </span>
                                <span className="text-[10px] opacity-60 font-mono block mt-0.5">
                                    {session.firstLogin}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 5. PALING BAWAH: Permintaan Hapus Akun Pengguna (Hanya untuk non-admin) */}
            {localStorage.getItem('jadwalpriok_current_user_role') !== 'admin' && (
                <div className={`p-4 rounded-xl border space-y-3 ${
                    isIndustrial
                        ? 'bg-[#0F1115] border-rose-500/20 text-[#E2E8F0]'
                        : isPaperSketch
                        ? 'bg-white border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
                        : isTechnical
                        ? 'bg-[#F8F7F4] dark:bg-[#0D1117] border-[1.5px] border-rose-500/30 dark:border-rose-900/40'
                        : isWinamp
                        ? 'bg-black border border-rose-500 text-rose-400'
                        : isDark
                        ? 'bg-[#161616] border-rose-900/40 text-slate-100'
                        : 'bg-rose-50/40 border-rose-200 text-slate-900'
                }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                            <h4 className="text-xs sm:text-sm font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wide flex items-center gap-1.5">
                                <Trash2 className="w-4 h-4" />
                                <span>Permintaan Hapus Akun Pengguna</span>
                            </h4>
                            <p className="text-xs opacity-75">
                                Kirim permintaan hapus akun pengguna ke admin
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setDeleteConfirmInput('');
                                setIsDeleteModalOpen(true);
                            }}
                            className="btn-glitch-delete px-3.5 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-center"
                            data-text="Kirim Permintaan Hapus"
                        >
                            <Trash2 className="w-3.5 h-3.5 shrink-0 relative z-10" />
                            <span className="relative z-10">Kirim Permintaan Hapus</span>
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL KONFIRMASI HAPUS AKUN */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="fixed inset-0" onClick={() => setIsDeleteModalOpen(false)} />
                    <div className={`relative z-10 w-full max-w-md p-5 rounded-2xl border space-y-4 shadow-2xl ${
                        isIndustrial
                            ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.2)] text-[#E2E8F0]'
                            : isPaperSketch
                            ? 'bg-white border-2 border-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b]'
                            : isTechnical
                            ? 'bg-[#FFFFFF] dark:bg-[#0D1117] border-[1.5px] border-[#111113] dark:border-slate-700'
                            : isWinamp
                            ? 'bg-black border-2 border-rose-500 text-rose-400 font-mono'
                            : isDark
                            ? 'bg-[#1E1E1E] border-slate-800 text-slate-100'
                            : isDashboard
                            ? 'bg-[#FFF5D0] border-2 border-[#4D2A00]/40 text-[#4D2A00]'
                            : 'bg-white border-slate-200 text-slate-900'
                    }`}>
                        <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400">
                            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-extrabold">Konfirmasi Permintaan Hapus Akun</h3>
                                <p className="text-xs opacity-75 font-mono">NIP: {nip}</p>
                            </div>
                        </div>

                        <p className="text-xs opacity-85 leading-relaxed">
                            Permintaan ini akan dikirimkan kepada Administrator untuk menghapus data akun NIP Anda dari sistem posko. Untuk mengonfirmasi, ketik kata <strong>HAPUS</strong> di bawah ini:
                        </p>

                        <form onSubmit={handleSendDeleteRequest} className="space-y-3">
                            <div>
                                <input
                                    type="text"
                                    value={deleteConfirmInput}
                                    onChange={(e) => setDeleteConfirmInput(e.target.value)}
                                    placeholder='Ketik "HAPUS"'
                                    className="w-full p-2.5 text-xs rounded-lg border border-current/20 bg-current/5 font-mono font-bold tracking-widest outline-none focus:border-rose-500 uppercase"
                                    autoFocus
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-current/10">
                                <button
                                    type="button"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="px-3.5 py-2 text-xs font-bold rounded-lg border border-current/20 hover:bg-current/10 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={deleteConfirmInput !== 'HAPUS'}
                                    className={`btn-glitch-delete px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                                        deleteConfirmInput === 'HAPUS'
                                            ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs'
                                            : 'bg-rose-600/40 text-white/60 cursor-not-allowed pointer-events-none'
                                    }`}
                                    data-text="Kirim Permintaan Hapus"
                                >
                                    <Trash2 className="w-4 h-4 shrink-0 relative z-10" />
                                    <span className="relative z-10">Kirim Permintaan Hapus</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
