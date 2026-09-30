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
    const [roleRequestSuccess, setRoleRequestSuccess] = useState<boolean>(false);

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

    const isNonUserAccount = Boolean(
        detectedUser && (
            detectedUser.authorityProfileId === 'prof-posko-luar' ||
            detectedUser.authorityName === 'PPF non User' ||
            detectedUser.role === 'non-user'
        )
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
                unitPosko: 'Graha Segara Lt. 1',
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

    const handleRequestRoleChange = () => {
        if (!detectedUser) return;
        addApprovalRequest({
            userNip: detectedUser.nip,
            userName: detectedUser.name,
            unitPosko: detectedUser.unitPosko,
            requestType: 'change_role_ppf',
            reason: 'Pengajuan perubahan role dari PPF non User ke Role User PPF',
        });
        setRoleRequestSuccess(true);
        onShowToast('Permintaan perubahan role berhasil dikirim ke Admin.');
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            onComplete();
        }
    };

    const getCardStyles = () => {
        if (isIndustrial) {
            return 'bg-[#1A1D23] border border-[rgba(226,232,240,0.18)] text-[#E2E8F0] shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_16px_rgba(45,212,191,0.06)] font-["Inter"] rounded-xl sm:rounded-2xl';
        }
        if (isPaperSketch) {
            return 'bg-white border-2 border-[#2b2b2b] text-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] font-["Gaegu"] rounded-xl';
        }
        if (isTechnical) {
            return 'bg-[#F8F7F4] dark:bg-[#0D1117] border-[1.5px] border-[#111113] dark:border-slate-700 text-[#111113] dark:text-slate-100 shadow-[3px_3px_0px_#111113] font-["Inter"] rounded-xl';
        }
        if (isEditorial) {
            return 'bg-[#fcfbf9] border border-[#1a1a1a]/15 text-[#1a1a1a] shadow-lg font-["Geist"] rounded-xl';
        }
        if (isDashboard) {
            return 'bg-white border border-[rgba(1,22,39,0.08)] text-[#011627] shadow-md font-["Inter"] rounded-xl';
        }
        if (isVista) {
            return 'bg-white/85 backdrop-blur-2xl border border-white/90 text-slate-900 shadow-[0_12px_36px_rgba(14,116,224,0.16)] rounded-xl';
        }
        if (isWinamp) {
            return 'bg-[#000000] border-2 border-[#00FF00] text-[#00FF00] shadow-[2px_2px_0_#00FF00] font-mono rounded-none';
        }
        if (isDark) {
            return 'bg-[#1E1E1E] border border-slate-800 text-slate-100 shadow-xl rounded-xl';
        }
        return 'bg-white border border-slate-200/90 text-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.06)] rounded-xl sm:rounded-2xl';
    };

    return (
        <div className="w-full flex items-center justify-center p-2 sm:p-3 my-auto relative">
            <div className={`relative w-full max-w-[340px] sm:max-w-[360px] p-3.5 sm:p-4.5 transition-all duration-200 ${getCardStyles()}`}>
                {/* X CLOSE BUTTON REMOVED TO ENFORCE MANDATORY PASSWORD ENTRY/LOGIN */}

                {/* Visual Header Brand - Ultra Minimalis & Ringkas */}
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-current/10 pr-6">
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                        isIndustrial
                            ? 'bg-[#0F1115] border border-[#2DD4BF]/40 text-[#2DD4BF]'
                            : isWinamp
                            ? 'bg-black border border-[#00FF00] text-[#00FF00]'
                            : isPaperSketch
                            ? 'bg-white border-2 border-[#2b2b2b] shadow-[1.5px_1.5px_0px_#2b2b2b]'
                            : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20'
                    }`}>
                        <AppLogo className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-sm sm:text-base font-black tracking-tight leading-none truncate">
                                JadwalPriok
                            </h1>
                            <span className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold uppercase border leading-none shrink-0 ${
                                isIndustrial
                                    ? 'bg-[#2DD4BF]/15 text-[#2DD4BF] border-[#2DD4BF]/30'
                                    : 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20'
                            }`}>
                                v{APP_VERSION}
                            </span>
                        </div>
                        <p className="text-[10px] opacity-65 font-medium leading-tight mt-0.5 truncate">
                            Portal Masuk Kalender Kerja Posko
                        </p>
                    </div>
                </div>

                {/* Body Form */}
                <div className="pt-2.5 space-y-2.5">
                    {/* 1. INPUT NIP PEGAWAI */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-bold flex items-center justify-between">
                            <span className="flex items-center gap-1">
                                <Fingerprint className="w-3 h-3 text-teal-500 shrink-0" />
                                <span>NIP Pegawai:</span>
                            </span>
                            <span className="text-[9.5px] opacity-50 font-mono">
                                {cleanNip.length}/18
                            </span>
                        </label>

                        <div className="relative">
                            <input
                                type="text"
                                inputMode="numeric"
                                value={nipInput}
                                onChange={(e) => setNipInput(e.target.value)}
                                placeholder="18 digit NIP pegawai..."
                                maxLength={18}
                                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all focus:outline-none focus:ring-1.5 ${
                                    isIndustrial
                                        ? 'bg-[#0F1115] border-[rgba(226,232,240,0.2)] text-[#E2E8F0] focus:ring-[#2DD4BF]/40 focus:border-[#2DD4BF]'
                                        : isPaperSketch
                                        ? 'bg-white border-2 border-[#2b2b2b] text-[#2b2b2b] shadow-[1.5px_1.5px_0px_#2b2b2b]'
                                        : isWinamp
                                        ? 'bg-black border border-[#00FF00] text-[#00FF00] focus:ring-[#00FF00]'
                                        : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-teal-500/40 focus:border-teal-500'
                                }`}
                            />
                        </div>
                    </div>

                    {/* DETECTED USER INFO CARD - COMPACT */}
                    {detectedUser ? (
                        <>
                            <div className={`p-1.5 px-2 rounded-lg border flex items-center justify-between gap-2 animate-in fade-in duration-150 ${
                                isIndustrial
                                    ? 'bg-[#0F1115] border-[#2DD4BF]/30'
                                    : isWinamp
                                    ? 'bg-black border border-[#00FF00]/50 text-[#00FF00]'
                                    : isPaperSketch
                                    ? 'bg-[#ffffff] border border-[#2b2b2b]'
                                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                            }`}>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1">
                                        <UserCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                                        <span className="text-[11px] font-extrabold truncate block">
                                            {detectedUser.name}
                                        </span>
                                    </div>
                                    <div className="text-[9px] opacity-70 font-mono truncate">
                                        {detectedUser.unitPosko} • {detectedUser.authorityName}
                                    </div>
                                </div>

                                <span className={`text-[8.5px] font-mono px-1 py-0.2 rounded font-bold uppercase shrink-0 border ${
                                    userHasPassword
                                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                }`}>
                                    {userHasPassword ? 'Terdaftar' : 'Buat Pass'}
                                </span>
                            </div>

                            {/* Tombol pengajuan ubah role bagi PPF non User */}
                            {detectedUser.authorityProfileId === 'prof-posko-luar' && (
                                <div className="space-y-2 pt-1 animate-in fade-in">
                                    {!roleRequestSuccess ? (
                                        <button
                                            type="button"
                                            onClick={handleRequestRoleChange}
                                            className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-98 ${
                                                isIndustrial
                                                    ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40 hover:bg-[#2DD4BF]/30'
                                                    : isPaperSketch
                                                    ? 'bg-[#ffe8a3] hover:bg-[#ffd15c] text-[#2b2b2b] border-2 border-[#2b2b2b] shadow-[1.5px_1.5px_0px_#2b2b2b]'
                                                    : isWinamp
                                                    ? 'bg-black border border-[#00FF00] text-[#00FF00] hover:bg-[#00FF00]/10'
                                                    : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                                            }`}
                                        >
                                            <span>Ajukan <i>Role User</i> PPF</span>
                                        </button>
                                    ) : (
                                        <div className="p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10.5px] flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                                            <span>Pengajuan <i>Role User</i> PPF berhasil dikirim.</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : cleanNip.length >= 8 ? (
                        <div className="p-1.5 px-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] flex items-center gap-1.5">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>NIP belum terdaftar, didaftarkan sebagai akun baru.</span>
                        </div>
                    ) : null}

                    {/* NOTIFIKASI SUKSES RESET PASSWORD JIKA DIKIRIM */}
                    {resetSuccessNotice && (
                        <div className="p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10.5px] flex items-start gap-1.5 animate-in fade-in">
                            <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" />
                            <div>
                                <strong className="font-bold block">Permintaan Reset Terkirim!</strong>
                                <span className="text-[9.5px]">Telah diteruskan ke Dashboard Admin tab Persetujuan.</span>
                            </div>
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* BLOKIR AKSES BAGI PPF NON USER                                             */}
                    {/* ========================================================================= */}
                    {isNonUserAccount ? (
                        <div className="space-y-2.5 pt-1 animate-in fade-in">
                            <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs flex flex-col gap-2">
                                <div className="flex items-center gap-1.5 font-bold">
                                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                                    <span>Akses Aplikasi Diblokir</span>
                                </div>
                                <p className="text-[10.5px] leading-relaxed text-rose-600 dark:text-rose-300">
                                    NIP Anda terdaftar sebagai <span className="font-bold text-rose-700 dark:text-rose-400">PPF non User</span>. Akun tipe ini tidak diperkenankan melakukan set password atau masuk ke aplikasi secara mandiri.
                                </p>
                            </div>

                            <div className={`p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center space-y-2`}>
                                <p className="text-[10.5px] text-amber-700 dark:text-amber-300 leading-relaxed font-medium">
                                    Silakan ajukan permintaan aktivasi akun atau perubahan status ke Admin untuk membuka akses login Anda.
                                </p>
                                {!roleRequestSuccess ? (
                                    <button
                                        type="button"
                                        onClick={handleRequestRoleChange}
                                        className={`w-full py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-98 ${
                                            isIndustrial
                                                ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40 hover:bg-[#2DD4BF]/30'
                                                : isPaperSketch
                                                ? 'bg-[#ffe8a3] hover:bg-[#ffd15c] text-[#2b2b2b] border-2 border-[#2b2b2b] shadow-[1.5px_1.5px_0px_#2b2b2b]'
                                                : isWinamp
                                                ? 'bg-black border border-[#00FF00] text-[#00FF00] hover:bg-[#00FF00]/10'
                                                : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                                        }`}
                                    >
                                        <span>Ajukan Perubahan Role</span>
                                    </button>
                                ) : (
                                    <div className="p-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10.5px] flex items-center justify-center gap-1.5 font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                                        <span>Pengajuan Dikirim ke Admin</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : !userHasPassword ? (
                        <form onSubmit={handleSetNewPassword} className="space-y-2 pt-0.5 animate-in fade-in">
                            <div className="space-y-2">
                                <div className="space-y-0.5">
                                    <label className="text-[11px] font-bold flex items-center gap-1">
                                        <KeyRound className="w-3 h-3 text-amber-500 shrink-0" />
                                        <span>Buat Password Baru:</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPasswordInput}
                                            onChange={(e) => setNewPasswordInput(e.target.value)}
                                            placeholder="Min. 4 - 12 karakter..."
                                            maxLength={12}
                                            required
                                            className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all focus:outline-none focus:ring-1.5 ${
                                                isIndustrial
                                                    ? 'bg-[#0F1115] border-[rgba(226,232,240,0.2)] text-[#E2E8F0] focus:ring-[#2DD4BF]/40 focus:border-[#2DD4BF]'
                                                    : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-teal-500'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 p-0.5 cursor-pointer"
                                        >
                                            {showNewPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-0.5">
                                    <label className="text-[11px] font-bold flex items-center gap-1">
                                        <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                                        <span>Konfirmasi Password:</span>
                                    </label>
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={confirmPasswordInput}
                                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                                        placeholder="Ketik ulang password..."
                                        maxLength={12}
                                        required
                                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all focus:outline-none focus:ring-1.5 ${
                                            isIndustrial
                                                ? 'bg-[#0F1115] border-[rgba(226,232,240,0.2)] text-[#E2E8F0] focus:ring-[#2DD4BF]/40 focus:border-[#2DD4BF]'
                                                : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-teal-500'
                                        }`}
                                    />
                                </div>
                            </div>

                            {/* DESKRIPSI KEAMANAN MANDATORI RINGKAS */}
                            <div className={`p-1.5 px-2 rounded-lg border text-[9.5px] leading-tight space-y-0.5 ${
                                isIndustrial
                                    ? 'bg-[#0F1115]/80 border-[rgba(226,232,240,0.15)] text-[#E2E8F0]/80'
                                    : isWinamp
                                    ? 'bg-black border border-[#00FF00]/40 text-[#00FF00]'
                                    : isPaperSketch
                                    ? 'bg-[#ffffff] border border-[#2b2b2b] text-[#2b2b2b]'
                                    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                            }`}>
                                <span>* Password untuk melindungi akun saat install ulang / ganti perangkat.</span>
                            </div>

                            {errorMsg && (
                                <div className="p-1.5 px-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-semibold flex items-center gap-1.5">
                                    <AlertCircle className="w-3 h-3 shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {successMsg && (
                                <div className="p-1.5 px-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                                    <span>{successMsg}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-98 ${
                                    isIndustrial
                                        ? 'bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0F1115]'
                                        : isPaperSketch
                                        ? 'bg-[#2ec4b6] hover:bg-[#25a99c] text-white border-2 border-[#2b2b2b] shadow-[1.5px_1.5px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5'
                                        : isWinamp
                                        ? 'bg-[#00FF00] hover:bg-[#00DD00] text-black font-mono'
                                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                                }`}
                            >
                                <Sparkles className="w-3 h-3 shrink-0" />
                                <span>Simpan & Masuk</span>
                                <ArrowRight className="w-3 h-3 shrink-0" />
                            </button>
                        </form>
                    ) : (
                        /* ========================================================================= */
                        /* KASUS B: AKUN TERDAFTAR DENGAN PASSWORD (PASSWORD INPUT & RESET BUTTON)   */
                        /* ========================================================================= */
                        <form onSubmit={handleLoginExisting} className="space-y-2 pt-0.5 animate-in fade-in">
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-bold flex items-center gap-1">
                                        <Lock className="w-3 h-3 text-teal-500 shrink-0" />
                                        <span>Password:</span>
                                    </label>

                                    {/* TOMBOL LUPA / RESET PASSWORD */}
                                    <button
                                        type="button"
                                        onClick={() => setIsResetModalOpen(true)}
                                        className="text-[10px] font-bold text-rose-500 hover:text-rose-600 underline underline-offset-2 transition-colors cursor-pointer"
                                    >
                                        Lupa Password?
                                    </button>
                                </div>

                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={passwordInput}
                                        onChange={(e) => setPasswordInput(e.target.value)}
                                        placeholder="Password akun Anda..."
                                        maxLength={12}
                                        required
                                        className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all focus:outline-none focus:ring-1.5 ${
                                            isIndustrial
                                                ? 'bg-[#0F1115] border-[rgba(226,232,240,0.2)] text-[#E2E8F0] focus:ring-[#2DD4BF]/40 focus:border-[#2DD4BF]'
                                                : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-teal-500'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 p-0.5 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                    </button>
                                </div>
                            </div>

                            {errorMsg && (
                                <div className="p-1.5 px-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-semibold flex items-center gap-1.5">
                                    <AlertCircle className="w-3 h-3 shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            {successMsg && (
                                <div className="p-1.5 px-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                                    <span>{successMsg}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-98 ${
                                    isIndustrial
                                        ? 'bg-[#2DD4BF] hover:bg-[#26b8a5] text-[#0F1115]'
                                        : isPaperSketch
                                        ? 'bg-[#2ec4b6] hover:bg-[#25a99c] text-white border-2 border-[#2b2b2b] shadow-[1.5px_1.5px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5'
                                        : isWinamp
                                        ? 'bg-[#00FF00] hover:bg-[#00DD00] text-black font-mono'
                                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                                }`}
                            >
                                <Lock className="w-3 h-3 shrink-0" />
                                <span>Masuk ke Kalender</span>
                                <ArrowRight className="w-3 h-3 shrink-0" />
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer Ujicoba Helpers - Compact */}
                <div className="mt-2.5 pt-2 border-t border-current/10 flex items-center justify-center text-xs">
                    <button
                        type="button"
                        onClick={() => {
                            localStorage.removeItem(LOCAL_STORAGE_ONBOARDING_DONE_KEY);
                            onShowToast('Status onboarding direset.');
                        }}
                        className="opacity-50 hover:opacity-100 flex items-center gap-1 transition-opacity cursor-pointer text-[9.5px] font-mono"
                        title="Reset flag onboarding agar halaman ini muncul kembali saat startup"
                    >
                        <RotateCcw className="w-2.5 h-2.5 shrink-0" />
                        <span>Mulai Ulang Onboarding</span>
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
