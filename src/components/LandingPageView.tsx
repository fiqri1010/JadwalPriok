import React, { useState, useEffect, useMemo } from 'react';
import {
    Shield,
    KeyRound,
    UserCheck,
    AlertCircle,
    CheckCircle2,
    Lock,
    Eye,
    EyeOff,
    Sparkles,
    ArrowRight,
    RotateCcw,
    Fingerprint,
    ShieldAlert,
    Send,
    X
} from 'lucide-react';
import { AppLogo } from './AppLogo';
import { AppTheme } from '../types';
import { UserAccount, UserRole } from '../types/admin';
import {
    getAdminUsers,
    saveAdminUsers,
    addApprovalRequest,
    LOCAL_STORAGE_CURRENT_NIP_KEY,
    LOCAL_STORAGE_CURRENT_NAME_KEY,
    LOCAL_STORAGE_CURRENT_ROLE_KEY,
    LOCAL_STORAGE_CURRENT_PASS_KEY
} from '../utils/adminStorage';
import { APP_VERSION } from '../version';

export const LOCAL_STORAGE_ONBOARDING_DONE_KEY = 'jadwalpriok_onboarding_completed';

interface LandingPageViewProps {
    theme?: AppTheme;
    onComplete: () => void;
    onClose?: () => void;
    onShowToast: (message: string) => void;
    onNavigateToTab?: (tab: 'calendar' | 'admin' | 'settings') => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
    theme = 'industrial',
    onComplete,
    onClose,
    onShowToast,
    onNavigateToTab,
}) => {
    const isIndustrial = theme === 'industrial';
    const isPaperSketch = theme === 'paperSketch';
    const isTechnical = theme === 'technical';
    const isEditorial = theme === 'editorial';
    const isDashboard = theme === 'dashboard';
    const isVista = theme === 'vista';
    const isWinamp = theme === 'winamp';
    const isDark = theme === 'dark';

    // State Input
    const [nipInput, setNipInput] = useState<string>('199510102015121002');
    const [passwordInput, setPasswordInput] = useState<string>('');
    const [newPasswordInput, setNewPasswordInput] = useState<string>('');
    const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

    // Error & Success Feedback
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Reset Password Modal
    const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
    const [resetReason, setResetReason] = useState<string>('Lupa kata sandi saat install ulang di perangkat');
    const [isSubmittingReset, setIsSubmittingReset] = useState<boolean>(false);
    const [resetSuccessNotice, setResetSuccessNotice] = useState<boolean>(false);

    // Users Database
    const [usersList, setUsersList] = useState<UserAccount[]>(() => getAdminUsers());

    const refreshUsers = () => {
        setUsersList(getAdminUsers());
    };

    // Detected user record based on entered NIP
    const cleanNip = nipInput.replace(/\D/g, '');
    const detectedUser = useMemo(() => {
        if (!cleanNip || cleanNip.length < 5) return null;
        return usersList.find((u) => u.nip === cleanNip) || null;
    }, [usersList, cleanNip]);

    // Determine state: whether this user already has a password or needs to set one
    const userHasPassword = Boolean(
        detectedUser && detectedUser.hasPassword && detectedUser.passwordValue && detectedUser.passwordValue.trim().length > 0
    );

    // Reset messages when NIP changes
    useEffect(() => {
        setErrorMsg(null);
        setSuccessMsg(null);
        setPasswordInput('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
        setResetSuccessNotice(false);
    }, [nipInput]);

    // Handler Submit Login (Kasus B: Untuk user yang sudah punya password)
    const handleLoginExisting = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!cleanNip || cleanNip.length < 8) {
            setErrorMsg('Harap masukkan NIP pegawai yang valid.');
            return;
        }

        if (!passwordInput) {
            setErrorMsg('Harap masukkan password Anda.');
            return;
        }

        const expectedPass = detectedUser?.passwordValue || '';
        
        if (!expectedPass || passwordInput !== expectedPass) {
            setErrorMsg('Password yang Anda masukkan tidak sesuai. Silakan coba lagi atau klik Reset Password.');
            return;
        }

        // Set active session
        const activeName = detectedUser?.name || 'Ahmad Fiqri';
        const activeRole: UserRole = (detectedUser?.nip === '199510102015121002' || detectedUser?.authorityProfileId === 'prof-superadmin')
            ? 'superadmin'
            : (detectedUser?.role || 'end-user');

        localStorage.setItem(LOCAL_STORAGE_CURRENT_NIP_KEY, cleanNip);
        localStorage.setItem(LOCAL_STORAGE_CURRENT_NAME_KEY, activeName);
        localStorage.setItem(LOCAL_STORAGE_CURRENT_ROLE_KEY, activeRole);
        localStorage.setItem(LOCAL_STORAGE_CURRENT_PASS_KEY, passwordInput);
        localStorage.setItem(LOCAL_STORAGE_ONBOARDING_DONE_KEY, 'true');

        setSuccessMsg(`Login berhasil! Selamat datang kembali, ${activeName}.`);
        onShowToast(`Selamat datang kembali, ${activeName}!`);
        setTimeout(() => {
            onComplete();
        }, 600);
    };

    // Handler Submit Set Password Baru (Kasus A: Untuk user baru / belum ada password)
    const handleSetNewPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!cleanNip || cleanNip.length < 8) {
            setErrorMsg('Harap masukkan NIP pegawai yang valid.');
            return;
        }

        const trimmedPass = newPasswordInput.trim();
        if (trimmedPass.length < 4 || trimmedPass.length > 12) {
            setErrorMsg('Password harus berukuran antara 4 hingga 12 karakter.');
            return;
        }

        if (trimmedPass !== confirmPasswordInput.trim()) {
            setErrorMsg('Konfirmasi password tidak cocok dengan password baru.');
            return;
        }

        // Update database user
        const currentUsers = getAdminUsers();
        let targetUser = currentUsers.find((u) => u.nip === cleanNip);

        const activeRole: UserRole = (cleanNip === '199510102015121002') ? 'superadmin' : (targetUser?.role || 'end-user');
        const activeName = targetUser?.name || (cleanNip === '199510102015121002' ? 'Ahmad Fiqri' : `Petugas Posko (${cleanNip})`);

        if (targetUser) {
            targetUser.hasPassword = true;
            targetUser.passwordValue = trimmedPass;
            saveAdminUsers(currentUsers);
        } else {
            // Buat record user baru jika NIP belum ada di database
            const newUser: UserAccount = {
                id: `usr-new-${Date.now()}`,
                nip: cleanNip,
                name: activeName,
                unitPosko: 'Posko Pelayanan Graha & TPSL',
                role: activeRole,
                authorityProfileId: cleanNip === '199510102015121002' ? 'prof-superadmin' : 'prof-petugas-posko',
                authorityName: cleanNip === '199510102015121002' ? 'Super Admin' : 'PPF',
                isActive: true,
                hasPassword: true,
                passwordValue: trimmedPass,
                createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                lastActive: 'Baru saja diaktifkan',
            };
            saveAdminUsers([newUser, ...currentUsers]);
        }

        // Simpan sesi aktif
        localStorage.setItem(LOCAL_STORAGE_CURRENT_NIP_KEY, cleanNip);
        localStorage.setItem(LOCAL_STORAGE_CURRENT_NAME_KEY, activeName);
        localStorage.setItem(LOCAL_STORAGE_CURRENT_ROLE_KEY, activeRole);
        localStorage.setItem(LOCAL_STORAGE_CURRENT_PASS_KEY, trimmedPass);
        localStorage.setItem(LOCAL_STORAGE_ONBOARDING_DONE_KEY, 'true');

        refreshUsers();
        setSuccessMsg(`Password berhasil disimpan! Selamat datang di JadwalPriok, ${activeName}.`);
        onShowToast(`Password berhasil dikonfigurasi untuk NIP ${cleanNip}!`);
        setTimeout(() => {
            onComplete();
        }, 700);
    };

    // Handler Kirim Pengajuan Reset Password ke Admin
    const handleSendResetApproval = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingReset(true);

        const targetName = detectedUser?.name || (cleanNip === '199510102015121002' ? 'Ahmad Fiqri' : `Pegawai NIP ${cleanNip}`);
        const targetUnit = detectedUser?.unitPosko || 'Posko Pelayanan Graha & TPSL';

        addApprovalRequest({
            userNip: cleanNip || '199510102015121002',
            userName: targetName,
            unitPosko: targetUnit,
            requestType: 'reset_password',
            reason: resetReason.trim() || 'Pengajuan reset password saat login di perangkat',
        });

        setIsSubmittingReset(false);
        setIsResetModalOpen(false);
        setResetSuccessNotice(true);
        onShowToast(`Permintaan reset password untuk ${targetName} berhasil dikirim ke Admin.`);
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            onComplete();
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center py-6 px-3 sm:px-6 relative">
            <div className={`relative w-full max-w-lg p-6 sm:p-8 rounded-3xl border shadow-2xl transition-all ${
                isIndustrial
                    ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                    : isPaperSketch
                    ? 'bg-[#ffffff] border-3 border-[#2b2b2b] shadow-[6px_6px_0px_#2b2b2b]'
                    : isTechnical
                    ? 'bg-[#FFFFFF] border-[2px] border-[#111113] shadow-[4px_4px_0px_#111113]'
                    : isEditorial
                    ? 'bg-[#ffffff] border border-[#1a1a1a]/15 shadow-xl'
                    : isWinamp
                    ? 'bg-[#141416] border-2 border-[#00FF00] text-[#00FF00]'
                    : isDark
                    ? 'bg-[#1E1E1E] border-zinc-800 text-slate-100'
                    : isVista
                    ? 'bg-white/85 backdrop-blur-2xl border-white/90 text-slate-900 shadow-[0_20px_60px_rgba(14,116,224,0.15)]'
                    : 'bg-white border-slate-200 text-slate-900'
            }`}>
                {/* TOMBOL X CLOSE UNTUK UJICOBA */}
                <button
                    type="button"
                    onClick={handleClose}
                    className={`absolute top-4 right-4 p-2 rounded-xl transition-all cursor-pointer z-20 ${
                        isIndustrial
                            ? 'text-slate-400 hover:text-white hover:bg-white/10'
                            : isPaperSketch
                            ? 'text-[#2b2b2b] hover:bg-[#2b2b2b]/10 border border-[#2b2b2b]'
                            : isWinamp
                            ? 'text-[#00FF00] hover:bg-[#00FF00]/20 border border-[#00FF00]'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Tutup & Lanjutkan ke Kalender Kerja"
                    aria-label="Tutup Halaman Landing Page"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Visual Header Brand */}
                <div className="flex flex-col items-center text-center pb-5 sm:pb-6 border-b border-current/10">
                    <div className={`p-2.5 sm:p-3 rounded-2xl mb-3 ${
                        isIndustrial
                            ? 'bg-[#0F1115] border border-[#2DD4BF]/40 text-[#2DD4BF]'
                            : isWinamp
                            ? 'bg-black border border-[#00FF00] text-[#00FF00]'
                            : isPaperSketch
                            ? 'bg-white border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                            : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20'
                    }`}>
                        <AppLogo className="w-10 h-10 sm:w-12 sm:h-12" />
                    </div>

                    <div className="flex items-center gap-2">
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                            JadwalPriok
                        </h1>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase border ${
                            isIndustrial
                                ? 'bg-[#2DD4BF]/15 text-[#2DD4BF] border-[#2DD4BF]/30'
                                : 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20'
                        }`}>
                            v{APP_VERSION}
                        </span>
                    </div>

                    <p className="text-xs sm:text-sm opacity-75 mt-1 font-medium max-w-sm">
                        Portal Otentikasi & Masuk Kalender Kerja Posko
                    </p>

                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold tracking-wide uppercase border bg-current/5 border-current/10">
                        <Shield className="w-3 h-3 text-teal-500 shrink-0" />
                        <span>Autentikasi Akun NIP Pegawai</span>
                    </div>
                </div>

                {/* Body Form */}
                <div className="pt-5 sm:pt-6 space-y-4">
                    {/* 1. INPUT NIP PEGAWAI */}
                    <div className="space-y-1.5">
                        <label className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                            <Fingerprint className="w-3.5 h-3.5 text-teal-500" />
                            <span>Nomor Induk Pegawai (NIP):</span>
                        </label>

                        <div className="relative">
                            <input
                                type="text"
                                inputMode="numeric"
                                value={nipInput}
                                onChange={(e) => setNipInput(e.target.value)}
                                placeholder="Masukkan 18 digit NIP pegawai..."
                                maxLength={18}
                                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm sm:text-base font-mono font-bold transition-all focus:outline-none focus:ring-2 ${
                                    isIndustrial
                                        ? 'bg-[#0F1115] border-[rgba(226,232,240,0.2)] text-[#E2E8F0] focus:ring-[#2DD4BF]/50 focus:border-[#2DD4BF]'
                                        : isPaperSketch
                                        ? 'bg-white border-2 border-[#2b2b2b] text-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                                        : isWinamp
                                        ? 'bg-black border border-[#00FF00] text-[#00FF00] focus:ring-[#00FF00]'
                                        : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-teal-500/50 focus:border-teal-500'
                                }`}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50 font-mono">
                                {cleanNip.length}/18
                            </div>
                        </div>
                    </div>

                    {/* DETECTED USER INFO CARD */}
                    {detectedUser ? (
                        <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 animate-in fade-in duration-150 ${
                            isIndustrial
                                ? 'bg-[#0F1115] border-[#2DD4BF]/30'
                                : isWinamp
                                ? 'bg-black border border-[#00FF00]/50 text-[#00FF00]'
                                : isPaperSketch
                                ? 'bg-[#ffffff] border-2 border-[#2b2b2b]'
                                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        }`}>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                    <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span className="text-xs sm:text-sm font-extrabold truncate block">
                                        {detectedUser.name}
                                    </span>
                                </div>
                                <div className="text-[10px] sm:text-[11px] opacity-75 font-mono mt-0.5 truncate">
                                    {detectedUser.unitPosko} • Role: {detectedUser.authorityName}
                                </div>
                            </div>

                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase shrink-0 border ${
                                userHasPassword
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            }`}>
                                {userHasPassword ? 'Password Terdaftar' : 'Belum Ada Password'}
                            </span>
                        </div>
                    ) : cleanNip.length >= 8 ? (
                        <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>NIP belum ada di daftar petugas, Anda akan didaftarkan sebagai akun baru.</span>
                        </div>
                    ) : null}

                    {/* NOTIFIKASI SUKSES RESET PASSWORD JIKA DIKIRIM */}
                    {resetSuccessNotice && (
                        <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                                <strong className="font-bold block">Permintaan Reset Password Terkirim!</strong>
                                <span>Notifikasi telah diteruskan ke Dashboard Administrator. Administrator dapat menyetujui permintaan Anda di menu Persetujuan.</span>
                            </div>
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* KASUS A: AKUN BARU / BELUM ADA PASSWORD (SET PASSWORD BARU & DESKRIPSI)   */}
                    {/* ========================================================================= */}
                    {!userHasPassword ? (
                        <form onSubmit={handleSetNewPassword} className="space-y-4 pt-1 animate-in fade-in">
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                                        <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Buat Password Baru:</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPasswordInput}
                                            onChange={(e) => setNewPasswordInput(e.target.value)}
                                            placeholder="Minimal 4 - 12 karakter (angka/huruf)..."
                                            maxLength={12}
                                            required
                                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm sm:text-base font-mono transition-all focus:outline-none focus:ring-2 ${
                                                isIndustrial
                                                    ? 'bg-[#0F1115] border-[rgba(226,232,240,0.2)] text-[#E2E8F0] focus:ring-[#2DD4BF]/50 focus:border-[#2DD4BF]'
                                                    : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-teal-500'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 p-1 cursor-pointer"
                                        >
                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Konfirmasi Password:</span>
                                    </label>
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={confirmPasswordInput}
                                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                                        placeholder="Ketik ulang password baru..."
                                        maxLength={12}
                                        required
                                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm sm:text-base font-mono transition-all focus:outline-none focus:ring-2 ${
                                            isIndustrial
                                                ? 'bg-[#0F1115] border-[rgba(226,232,240,0.2)] text-[#E2E8F0] focus:ring-[#2DD4BF]/50 focus:border-[#2DD4BF]'
                                                : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-teal-500'
                                        }`}
                                    />
                                </div>
                            </div>

                            {/* DESKRIPSI KEAMANAN MANDATORI */}
                            <div className={`p-3.5 rounded-xl border text-xs sm:text-xs leading-relaxed space-y-1.5 ${
                                isIndustrial
                                    ? 'bg-[#0F1115]/80 border-[rgba(226,232,240,0.15)] text-[#E2E8F0]/90'
                                    : isWinamp
                                    ? 'bg-black border border-[#00FF00]/40 text-[#00FF00]'
                                    : isPaperSketch
                                    ? 'bg-[#ffffff] border-2 border-[#2b2b2b] text-[#2b2b2b]'
                                    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                            }`}>
                                <div className="flex items-start gap-1.5 font-medium">
                                    <span className="font-bold text-amber-500 shrink-0">*</span>
                                    <span>Password ini digunakan untuk membatasi pengguna lain masuk ke akun Anda.</span>
                                </div>
                                <div className="flex items-start gap-1.5 font-medium">
                                    <span className="font-bold text-amber-500 shrink-0">*</span>
                                    <span>Jika Anda install di device lain/install ulang aplikasi, password ini akan dibutuhkan.</span>
                                </div>
                            </div>

                            {errorMsg && (
                                <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {successMsg && (
                                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    <span>{successMsg}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                                    isIndustrial
                                        ? 'bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0F1115]'
                                        : isPaperSketch
                                        ? 'bg-[#2ec4b6] hover:bg-[#25a99c] text-white border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5'
                                        : isWinamp
                                        ? 'bg-[#00FF00] hover:bg-[#00DD00] text-black font-mono'
                                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                                }`}
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>Simpan Password & Masuk ke Aplikasi</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    ) : (
                        /* ========================================================================= */
                        /* KASUS B: AKUN TERDAFTAR DENGAN PASSWORD (PASSWORD INPUT & RESET BUTTON)   */
                        /* ========================================================================= */
                        <form onSubmit={handleLoginExisting} className="space-y-4 pt-1 animate-in fade-in">
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                                        <Lock className="w-3.5 h-3.5 text-teal-500" />
                                        <span>Password Akun:</span>
                                    </label>

                                    {/* TOMBOL LUPA / RESET PASSWORD */}
                                    <button
                                        type="button"
                                        onClick={() => setIsResetModalOpen(true)}
                                        className="text-[11px] sm:text-xs font-bold text-rose-500 hover:text-rose-600 underline underline-offset-2 transition-colors cursor-pointer"
                                    >
                                        Lupa / Reset Password?
                                    </button>
                                </div>

                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={passwordInput}
                                        onChange={(e) => setPasswordInput(e.target.value)}
                                        placeholder="Masukkan password akun Anda..."
                                        maxLength={12}
                                        required
                                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm sm:text-base font-mono transition-all focus:outline-none focus:ring-2 ${
                                            isIndustrial
                                                ? 'bg-[#0F1115] border-[rgba(226,232,240,0.2)] text-[#E2E8F0] focus:ring-[#2DD4BF]/50 focus:border-[#2DD4BF]'
                                                : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-teal-500'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 p-1 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {errorMsg && (
                                <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {successMsg && (
                                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    <span>{successMsg}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                                    isIndustrial
                                        ? 'bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0F1115]'
                                        : isPaperSketch
                                        ? 'bg-[#2ec4b6] hover:bg-[#25a99c] text-white border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5'
                                        : isWinamp
                                        ? 'bg-[#00FF00] hover:bg-[#00DD00] text-black font-mono'
                                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                                }`}
                            >
                                <Lock className="w-4 h-4" />
                                <span>Masuk ke Akun & Kalender</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer Ujicoba Helpers */}
                <div className="mt-6 pt-4 border-t border-current/10 flex items-center justify-center text-xs">
                    <button
                        type="button"
                        onClick={() => {
                            localStorage.removeItem(LOCAL_STORAGE_ONBOARDING_DONE_KEY);
                            onShowToast('Status onboarding direset. Landing page akan muncul otomatis saat aplikasi dibuka kembali.');
                        }}
                        className="opacity-60 hover:opacity-100 flex items-center gap-1.5 transition-opacity cursor-pointer text-[11px] font-mono"
                        title="Reset flag onboarding agar halaman ini muncul kembali saat startup"
                    >
                        <RotateCcw className="w-3 h-3" />
                        <span>Mulai Ulang Alur Onboarding (Ujicoba)</span>
                    </button>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* MODAL PENGAJUAN RESET PASSWORD KE DASHBOARD ADMINISTRATOR                 */}
            {/* ========================================================================= */}
            {isResetModalOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
                    <div className={`w-full max-w-md p-5 sm:p-6 rounded-2xl border shadow-2xl space-y-4 ${
                        isIndustrial
                            ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.2)] text-[#E2E8F0]'
                            : isWinamp
                            ? 'bg-black border-2 border-[#00FF00] text-[#00FF00]'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
                    }`}>
                        <div className="flex items-center space-x-2.5 pb-2 border-b border-current/10">
                            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-extrabold">Pengajuan Reset Password</h3>
                                <p className="text-[11px] opacity-60">Kirim notifikasi reset ke Dashboard Admin</p>
                            </div>
                        </div>

                        <form onSubmit={handleSendResetApproval} className="space-y-3 text-xs sm:text-sm">
                            <div className="p-3 rounded-xl bg-current/5 border border-current/10 space-y-1">
                                <div className="text-[11px] font-mono opacity-70">Identitas Pemohon:</div>
                                <div className="font-extrabold">{detectedUser?.name || 'Ahmad Fiqri'}</div>
                                <div className="font-mono text-[11px] opacity-80">NIP: {cleanNip || '199510102015121002'}</div>
                            </div>

                            <div className="space-y-1">
                                <label className="font-bold block">Alasan Permintaan Reset:</label>
                                <textarea
                                    value={resetReason}
                                    onChange={(e) => setResetReason(e.target.value)}
                                    rows={3}
                                    required
                                    placeholder="Tuliskan alasan reset password..."
                                    className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                                        isIndustrial
                                            ? 'bg-[#0F1115] border-[rgba(226,232,240,0.2)] text-[#E2E8F0] focus:ring-[#2DD4BF]'
                                            : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                                    }`}
                                />
                            </div>

                            <div className="text-[11px] opacity-70 leading-relaxed">
                                Setelah dikirim, notifikasi akan langsung muncul pada sub-menu <strong>Persetujuan</strong> di Dashboard Administrator Posko untuk ditinjau.
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsResetModalOpen(false)}
                                    className="px-3 py-2 rounded-xl font-bold border hover:bg-current/5 transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingReset}
                                    className="px-4 py-2 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>{isSubmittingReset ? 'Mengirim...' : 'Kirim Permintaan Reset'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
