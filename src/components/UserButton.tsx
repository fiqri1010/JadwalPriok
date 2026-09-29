import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    User,
    Settings,
    UserPlus,
    LogOut,
    Shield,
    ChevronRight,
    Check,
    KeyRound,
    Sparkles,
    X,
    Laptop,
    Mail,
    UserCheck,
    CreditCard,
} from 'lucide-react';
import { AppTheme } from '../types';
import { ThemeConfig } from '../themeConfig';
import { Tooltip } from './Tooltip';

export interface UserButtonProps {
    theme?: AppTheme;
    themeConfig?: ThemeConfig;
    showName?: boolean;
    userProfileProps?: {
        additionalOAuthScopes?: Record<string, string[]>;
    };
    onSignOut?: () => void;
}

/**
 * Modal Profil Pengguna (<UserProfile />) yang dibuka saat "Kelola Akun" dipilih
 */
const UserProfileModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    theme?: AppTheme;
}> = ({ isOpen, onClose, theme = 'default' }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions'>('profile');
    const [displayName, setDisplayName] = useState('Pengguna Administrasi');
    const [email, setEmail] = useState('admin@jadwalpriok.id');
    const [isSaved, setIsSaved] = useState(false);

    if (!isOpen) return null;

    const isIndustrial = theme === 'industrial';
    const isPaperSketch = theme === 'paperSketch';
    const isEditorial = theme === 'editorial';
    const isTechnical = theme === 'technical';
    const isWinamp = theme === 'winamp';

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] overflow-y-auto p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 flex justify-center items-center">
            <div className="fixed inset-0" onClick={onClose} />
            <div className={`relative z-10 w-full max-w-2xl my-auto flex flex-col overflow-hidden shadow-2xl ${
                isIndustrial
                    ? 'bg-[#1A1D23] text-[#E2E8F0] border border-[rgba(226,232,240,0.2)] rounded-lg font-[\'JetBrains_Mono\']'
                    : isPaperSketch
                    ? 'bg-[#fdfcf0] text-[#2b2b2b] border-2 border-[#2b2b2b] shadow-[6px_6px_0px_#2b2b2b] rounded-2xl font-[\'Gaegu\'] text-base'
                    : isEditorial
                    ? 'bg-[#FCFBF9] text-[#1a1a1a] border border-[#1a1a1a]/25 rounded-xl font-serif'
                    : isTechnical
                    ? 'bg-[#F8F7F4] dark:bg-[#0D1117] text-[#111113] dark:text-[#E6EDF3] border border-slate-300 dark:border-slate-800 rounded-md font-mono'
                    : isWinamp
                    ? 'bg-black text-[#00FF00] border-2 border-[#00FF00] rounded-none font-mono'
                    : 'rounded-2xl bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700'
            }`}>
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-current/15 shrink-0">
                    <div className="flex items-center space-x-3">
                        {/* Placeholder Foto Profil Kosong */}
                        <div className={`w-10 h-10 rounded-full border-2 border-dashed border-current/30 flex items-center justify-center shrink-0 ${
                            isIndustrial ? 'bg-[#0F1115] text-[#2DD4BF]' : 'bg-slate-100 dark:bg-zinc-800 text-teal-600 dark:text-teal-400'
                        }`}>
                            <User className="w-5 h-5 opacity-80" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-extrabold flex items-center gap-2">
                                <span>Pengaturan Profil Akun</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/15 text-teal-600 dark:text-teal-400 font-bold uppercase border border-teal-500/30">
                                    Aktif
                                </span>
                            </h3>
                            <p className="text-[11px] opacity-70">Kelola identitas pengguna, preferensi keamanan, dan sesi login</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer text-current/70 hover:text-current transition-colors"
                        title="Tutup Modal Profil"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Modal dengan Tab Side Navigation */}
                <div className="flex flex-col md:flex-row min-h-[380px]">
                    {/* Tab List Navigasi */}
                    <div className="w-full md:w-48 p-3 border-b md:border-b-0 md:border-r border-current/15 space-y-1 shrink-0 bg-current/5">
                        <button
                            type="button"
                            onClick={() => setActiveTab('profile')}
                            className={`w-full px-3 py-2 text-xs font-bold rounded-lg flex items-center space-x-2 text-left transition-all ${
                                activeTab === 'profile'
                                    ? isIndustrial
                                        ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40'
                                        : 'bg-teal-600 text-white shadow-xs'
                                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-current/80'
                            }`}
                        >
                            <UserCheck className="w-4 h-4 shrink-0" />
                            <span>Profil Saya</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('security')}
                            className={`w-full px-3 py-2 text-xs font-bold rounded-lg flex items-center space-x-2 text-left transition-all ${
                                activeTab === 'security'
                                    ? isIndustrial
                                        ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40'
                                        : 'bg-teal-600 text-white shadow-xs'
                                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-current/80'
                            }`}
                        >
                            <Shield className="w-4 h-4 shrink-0" />
                            <span>Keamanan & Sandi</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('sessions')}
                            className={`w-full px-3 py-2 text-xs font-bold rounded-lg flex items-center space-x-2 text-left transition-all ${
                                activeTab === 'sessions'
                                    ? isIndustrial
                                        ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40'
                                        : 'bg-teal-600 text-white shadow-xs'
                                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-current/80'
                            }`}
                        >
                            <Laptop className="w-4 h-4 shrink-0" />
                            <span>Sesi Perangkat</span>
                        </button>
                    </div>

                    {/* Tab Content Panel */}
                    <div className="flex-1 p-4 sm:p-5 overflow-y-auto">
                        {activeTab === 'profile' && (
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="p-3.5 rounded-xl bg-current/5 border border-current/10 flex items-center space-x-4">
                                    {/* Placeholder Foto Profil Kosong */}
                                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-current/30 flex items-center justify-center shrink-0 bg-current/10 relative">
                                        <User className="w-7 h-7 opacity-60" />
                                        <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-black" title="Online" />
                                    </div>
                                    <div className="space-y-1 min-w-0 flex-1">
                                        <h4 className="text-xs font-extrabold uppercase tracking-wide opacity-80">Foto Profil</h4>
                                        <p className="text-[11px] opacity-70 leading-tight">Foto profil belum diunggah (Kosong). Fitur unggah foto akan tersedia pada pembaruan mendatang.</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold block">Nama Tampilan:</label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="w-full p-2.5 text-xs rounded-lg border border-current/20 bg-current/5 outline-none focus:border-teal-500 font-bold"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold block">Email / Username:</label>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full p-2.5 text-xs rounded-lg border border-current/20 bg-current/5 outline-none focus:border-teal-500 font-mono"
                                            />
                                            <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                                                Terverifikasi
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold block">Peran & Hak Akses:</label>
                                        <div className="p-2.5 rounded-lg border border-current/20 bg-current/5 text-xs font-mono font-bold flex items-center justify-between">
                                            <span>Administrator Utama (Full Access)</span>
                                            <Shield className="w-4 h-4 text-teal-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-current/15 flex items-center justify-between">
                                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                        {isSaved && <><Check className="w-3.5 h-3.5" /> Profil berhasil diperbarui!</>}
                                    </span>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-xs transition-all active:scale-95"
                                    >
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-3.5 text-xs">
                                <div className="p-3.5 rounded-xl bg-current/5 border border-current/10 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-extrabold flex items-center gap-1.5">
                                            <KeyRound className="w-4 h-4 text-teal-500" />
                                            <span>Kata Sandi & Otentikasi Duo</span>
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/15 text-teal-600 font-bold">Aman</span>
                                    </div>
                                    <p className="text-[11px] opacity-70">Sandi akun dilindungi enkripsi standar industri. Multi-Factor Authentication (2FA) diaktifkan secara otomatis.</p>
                                </div>

                                <div className="p-3.5 rounded-xl bg-current/5 border border-current/10 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-extrabold flex items-center gap-1.5">
                                            <Mail className="w-4 h-4 text-indigo-500" />
                                            <span>Google Workspace OAuth Scope</span>
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-600 font-bold">Terhubung</span>
                                    </div>
                                    <p className="text-[11px] opacity-70">Akses Google Calendar untuk sinkronisasi jadwal shift otomatis.</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'sessions' && (
                            <div className="space-y-3 text-xs">
                                <div className="p-3 rounded-xl bg-current/5 border border-current/10 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Laptop className="w-5 h-5 text-teal-500 shrink-0" />
                                        <div>
                                            <span className="font-extrabold block">Sesi Saat Ini (Browser Browser)</span>
                                            <span className="text-[10.5px] opacity-70 font-mono">Linux • Chrome • IP: 182.253.x.x</span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 font-bold border border-emerald-500/30">
                                        Perangkat Ini
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const UserButton: React.FC<UserButtonProps> = ({
    theme = 'default',
    themeConfig,
    showName = false,
    onSignOut,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isIndustrial = theme === 'industrial';
    const isPaperSketch = theme === 'paperSketch';
    const isEditorial = theme === 'editorial';
    const isTechnical = theme === 'technical';
    const isWinamp = theme === 'winamp';

    // Close dropdown on outside click
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            const target = e.target as Node;
            if (
                triggerRef.current &&
                !triggerRef.current.contains(target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleManageAccount = () => {
        setIsOpen(false);
        setIsProfileModalOpen(true);
    };

    const handleAddAccount = () => {
        setIsOpen(false);
        showToast('Fitur Tambah Akun Lain akan tersedia pada sesi multi-account mendatang.');
    };

    const handleSignOutClick = () => {
        setIsOpen(false);
        if (onSignOut) {
            onSignOut();
        } else {
            showToast('Sesi akun berhasil ditutup (Sign Out).');
        }
    };

    // Button style per theme
    const getTriggerButtonClass = () => {
        if (themeConfig?.themeDropdownBtnClass) {
            return themeConfig.themeDropdownBtnClass;
        }
        if (isIndustrial) {
            return "h-8 sm:h-9 flex items-center justify-center gap-2 bg-[#1A1D23] hover:bg-[#252932] px-2.5 sm:px-3 text-xs font-bold text-[#E2E8F0] cursor-pointer border border-[rgba(226,232,240,0.15)] font-['JetBrains_Mono'] rounded-[4px]";
        }
        if (isPaperSketch) {
            return "h-8 sm:h-9 flex items-center justify-center gap-2 rounded-lg bg-[#ffffff] hover:bg-[#2ec4b6] px-2.5 sm:px-3 text-sm font-bold text-[#2b2b2b] cursor-pointer border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] font-['Gaegu']";
        }
        if (isEditorial) {
            return "h-8 sm:h-9 flex items-center justify-center gap-2 bg-[#ffffff] hover:bg-[#fcfbf9] px-2.5 sm:px-3 text-xs font-medium text-[#1a1a1a] cursor-pointer border border-[#1a1a1a]/15 font-['Geist_Mono']";
        }
        if (isTechnical) {
            return "h-8 sm:h-9 flex items-center justify-center gap-2 bg-[#FFFFFF] hover:bg-[#111113] hover:text-[#F8F7F4] px-2.5 sm:px-3 text-xs font-bold text-[#111113] cursor-pointer border-[1.5px] border-[#111113] font-mono";
        }
        if (isWinamp) {
            return "h-8 sm:h-9 flex items-center justify-center gap-2 bg-[#000000] hover:bg-[#00FF00] hover:text-black px-2.5 sm:px-3 text-xs font-bold text-[#00FF00] cursor-pointer border border-[#00FF00] font-mono";
        }
        return 'h-8 sm:h-9 flex items-center justify-center gap-2 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2.5 sm:px-3 text-xs font-bold text-[#011627] dark:text-zinc-100 cursor-pointer border border-[#CBD5E1] dark:border-zinc-700 shadow-2xs select-none';
    };

    // Dropdown popover menu style per theme
    const getDropdownMenuClass = () => {
        if (themeConfig?.themeDropdownMenuClass) {
            return themeConfig.themeDropdownMenuClass;
        }
        if (isIndustrial) {
            return "absolute right-0 mt-1.5 z-50 w-64 bg-[#1A1D23] p-2 flex flex-col gap-1 text-[#E2E8F0] border border-[rgba(226,232,240,0.18)] shadow-2xl animate-in fade-in zoom-in-95 duration-150 font-['JetBrains_Mono'] rounded-[4px]";
        }
        if (isPaperSketch) {
            return "absolute right-0 mt-1.5 z-50 w-64 rounded-xl bg-[#fdfcf0] p-2 flex flex-col gap-1 text-[#2b2b2b] shadow-[5px_5px_0px_#2b2b2b] border-[2.5px] border-[#2b2b2b] animate-in fade-in zoom-in-95 duration-150 font-['Gaegu'] font-bold";
        }
        if (isEditorial) {
            return "absolute right-0 mt-1.5 z-50 w-64 bg-[#FCFBF9] p-2 flex flex-col gap-1 text-[#1a1a1a] border border-[#1a1a1a]/20 shadow-xl animate-in fade-in zoom-in-95 duration-150 font-serif";
        }
        if (isTechnical) {
            return "absolute right-0 mt-1.5 z-50 w-64 bg-[#F8F7F4] dark:bg-[#0D1117] p-2 flex flex-col gap-1 text-[#111113] dark:text-[#E6EDF3] border-[1.5px] border-[#111113] dark:border-slate-700 shadow-[4px_4px_0px_#111113] animate-in fade-in zoom-in-95 duration-150 font-mono";
        }
        if (isWinamp) {
            return "absolute right-0 mt-1.5 z-50 w-64 rounded-none bg-[#1C1C1E] p-2 flex flex-col gap-1 text-[#00FF00] border-2 border-[#00FF00] font-mono animate-in fade-in duration-75";
        }
        return 'absolute right-0 mt-1.5 z-50 w-64 rounded-xl bg-white dark:bg-[#1E1E1E] p-2 flex flex-col gap-1 text-slate-800 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-150 select-none';
    };

    return (
        <div className="relative inline-block text-left z-30">
            <Tooltip content={<span><strong>Tombol User</strong> & Manajemen Akun</span>} placement="bottom">
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={getTriggerButtonClass()}
                    aria-label="User Menu"
                >
                    {/* Placeholder Foto Profil Kosong (Empty Avatar) */}
                    <div className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full border border-dashed border-current/40 flex items-center justify-center shrink-0 ${
                        isIndustrial ? 'bg-[#0F1115] text-[#2DD4BF]' : 'bg-current/10'
                    }`}>
                        <User className="w-3.5 h-3.5 opacity-80" />
                    </div>

                    {showName && (
                        <span className="hidden sm:inline text-xs font-bold truncate max-w-[90px]">
                            Admin
                        </span>
                    )}
                </button>
            </Tooltip>

            {/* Dropdown Menu User */}
            {isOpen && (
                <div ref={dropdownRef} className={getDropdownMenuClass()}>
                    {/* Header Profil User */}
                    <div className="p-2.5 border-b border-current/15 mb-1 space-y-1 bg-current/5 rounded-lg">
                        <div className="flex items-center space-x-2.5">
                            {/* Placeholder Avatar Circle Kosong */}
                            <div className="w-9 h-9 rounded-full border-2 border-dashed border-current/30 flex items-center justify-center shrink-0 bg-current/10">
                                <User className="w-5 h-5 opacity-70" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-extrabold truncate">
                                    Pengguna Administrasi
                                </h4>
                                <p className="text-[10.5px] opacity-70 truncate font-mono">
                                    admin@jadwalpriok.id
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="space-y-0.5">
                        {/* 1. Kelola Akun */}
                        <button
                            type="button"
                            onClick={handleManageAccount}
                            className="w-full px-2.5 py-2 text-xs font-bold rounded-lg flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
                        >
                            <span className="flex items-center space-x-2">
                                <Settings className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                                <span>Kelola Akun</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                        </button>

                        {/* 2. Tambah Akun Lain */}
                        <button
                            type="button"
                            onClick={handleAddAccount}
                            className="w-full px-2.5 py-2 text-xs font-bold rounded-lg flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
                        >
                            <span className="flex items-center space-x-2">
                                <UserPlus className="w-4 h-4 text-indigo-500 shrink-0" />
                                <span>Tambah Akun Lain</span>
                            </span>
                        </button>
                    </div>

                    {/* Divider & Sign Out */}
                    <div className="border-t border-current/15 pt-1 mt-1">
                        <button
                            type="button"
                            onClick={handleSignOutClick}
                            className="w-full px-2.5 py-2 text-xs font-bold rounded-lg flex items-center space-x-2 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer text-left"
                        >
                            <LogOut className="w-4 h-4 shrink-0" />
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Profil Pengguna (<UserProfile />) */}
            <UserProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                theme={theme}
            />

            {/* Toast Notification */}
            {toastMessage && createPortal(
                <div className="fixed bottom-5 right-5 z-[20000] px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <Sparkles className="w-4 h-4 text-teal-400 dark:text-teal-600 shrink-0" />
                    <span>{toastMessage}</span>
                </div>,
                document.body
            )}
        </div>
    );
};
