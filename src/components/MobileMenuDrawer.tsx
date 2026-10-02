import React from 'react';
import { X, Flag, Sliders, History, ListTodo, ShieldAlert, User, Fingerprint, Shield, Sparkles, Users } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { AppTheme } from '../types';
import { UserRole } from '../types/admin';
import { getCurrentUserRoleInfo, getCurrentUserPermissions } from '../utils/adminStorage';
import { formatDisplayName } from './admin/AdminUserListTab';

type PageTabType = 'calendar' | 'team-schedule' | 'holiday' | 'settings' | 'version' | 'roadmap' | 'admin' | 'landing';

interface MobileMenuDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    pageTab: PageTabType;
    onSelectTab: (tab: PageTabType) => void;
    currentTheme: AppTheme;
    appVersion: string;
    isAdmin?: boolean;
    userName?: string;
    userNip?: string;
    userRole?: UserRole;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
    isOpen,
    onClose,
    pageTab,
    onSelectTab,
    currentTheme,
    appVersion,
    isAdmin = true,
    userName,
    userNip,
    userRole,
}) => {
    if (!isOpen) return null;

    const activeUserName = userName || localStorage.getItem('jadwalpriok_user_name') || 'Ahmad Fiqri';
    const activeUserNip = userNip || localStorage.getItem('jadwalpriok_user_nip') || '199510102015121002';
    const isSuperAdminAccount = activeUserName === 'Ahmad Fiqri' || activeUserNip === '199510102015121002';
    const permissions = getCurrentUserPermissions();
    const roleInfo = isSuperAdminAccount
        ? { role: 'superadmin' as UserRole, authorityName: 'Super Admin', badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' }
        : getCurrentUserRoleInfo();
    const activeRole = isSuperAdminAccount ? 'superadmin' : (userRole || roleInfo.role);
    const canAccessAdmin = isSuperAdminAccount || permissions.canAccessAdminDashboard;
    const isPPFNonUser = roleInfo.authorityName === 'PPF non User' || activeRole === 'non-user';
    const canAccessTeamSchedule = isSuperAdminAccount || (!isPPFNonUser);

    const getDasborButtonClass = (isActive: boolean) => {
        const base = 'inline-flex items-center justify-center gap-1 px-2.5 py-1 text-[10px] font-bold font-mono uppercase tracking-tight transition-all duration-150 cursor-pointer shrink-0 whitespace-nowrap select-none active:scale-95 sidebar-admin-btn';

        if (currentTheme === 'paperSketch') {
            if (isActive) {
                return `${base} rounded-none border-2 border-[#2b2b2b] bg-[#ff4747] text-white shadow-[1.5px_1.5px_0px_#2b2b2b] translate-x-[0.5px] translate-y-[0.5px]`;
            }
            return `${base} rounded-none border-2 border-[#2b2b2b] bg-white hover:bg-[#ffe8a3] text-[#2b2b2b] shadow-[1.5px_1.5px_0px_#2b2b2b] active:shadow-none`;
        }

        if (currentTheme === 'technical') {
            if (isActive) {
                return `${base} rounded-none border-[1.5px] border-[#111113] bg-[#111113] text-[#F8F7F4] shadow-[1.5px_1.5px_0px_#111113]`;
            }
            return `${base} rounded-none border-[1.5px] border-[#111113] bg-[#FFFFFF] text-[#111113] shadow-[1.5px_1.5px_0px_#111113] active:shadow-none`;
        }

        if (currentTheme === 'editorial') {
            if (isActive) {
                return `${base} rounded-none border border-[#1a1a1a] bg-[#1a1a1a] text-[#fcfbf9] shadow-xs`;
            }
            return `${base} rounded-none border border-[#1a1a1a]/30 bg-[#ffffff] text-[#1a1a1a] shadow-2xs`;
        }

        if (currentTheme === 'industrial') {
            if (isActive) {
                return `${base} rounded-[4px] border border-rose-500/80 bg-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)] font-bold`;
            }
            return `${base} rounded-[4px] border border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[0_2px_4px_rgba(0,0,0,0.3)]`;
        }

        if (currentTheme === 'winamp') {
            if (isActive) {
                return `${base} rounded-none border border-[#00FF00] bg-[#00FF00] text-black shadow-[2px_2px_0_#00FF00]`;
            }
            return `${base} rounded-none border border-[#00FF00] bg-black text-[#00FF00] shadow-[2px_2px_0_#00FF00]`;
        }

        if (currentTheme === 'vista') {
            if (isActive) {
                return `${base} rounded-lg border border-rose-400/80 bg-rose-500 text-white shadow-[0_4px_14px_rgba(225,29,72,0.35)]`;
            }
            return `${base} rounded-lg border border-rose-200/80 bg-rose-50/80 text-rose-700 shadow-sm`;
        }

        if (currentTheme === 'dashboard') {
            if (isActive) {
                return `${base} rounded-[4px] border border-[#4D2A00] bg-[#4D2A00] text-[#F9E6A8] shadow-xs`;
            }
            return `${base} rounded-[4px] border border-[#4D2A00]/40 bg-[#FFF5D0] text-[#4D2A00] shadow-2xs`;
        }

        if (currentTheme === 'dark') {
            if (isActive) {
                return `${base} rounded-lg border border-rose-500 bg-rose-600 text-white shadow-md shadow-rose-900/30`;
            }
            return `${base} rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-xs`;
        }

        // Default / Light
        if (isActive) {
            return `${base} rounded-lg border border-rose-600 bg-rose-600 text-white shadow-sm`;
        }
        return `${base} rounded-lg border border-rose-200 bg-rose-50 text-rose-700 shadow-xs`;
    };

    return (
        <div className="fixed inset-0 z-[99990] flex items-end justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
                className="fixed inset-0"
                onClick={onClose}
            />
            <div
                className={`relative z-10 w-full max-w-lg rounded-t-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto ${
                    currentTheme === 'paperSketch'
                        ? 'bg-[#ffffff] text-[#2b2b2b] border-t-[3.5px] border-[#2b2b2b] shadow-[0_-8px_0px_#2b2b2b] font-[\'Gaegu\'] text-base'
                        : currentTheme === 'winamp'
                        ? 'bg-[#1C1C1E] text-[#00FF00] border-2 border-[#555555] font-mono'
                        : currentTheme === 'dark'
                        ? 'bg-[#1E1E1E] text-[#E0E0E0] border-t border-slate-700'
                        : currentTheme === 'vista'
                        ? 'bg-white/75 backdrop-blur-2xl text-slate-900 border-t border-white/80 shadow-2xl'
                        : currentTheme === 'dashboard'
                        ? 'bg-[#FFF5D0] text-[#4D2A00] border-t-2 border-[#4D2A00]/40'
                        : 'bg-white text-slate-900'
                }`}
            >
                <div className={`mx-auto mb-3 h-1.5 w-12 rounded-full ${currentTheme === 'paperSketch' ? 'bg-[#2b2b2b]' : 'bg-slate-300'}`} />

                {/* Drawer Header */}
                <div className={`flex items-center justify-between border-b pb-3 ${currentTheme === 'paperSketch' ? 'border-b-2 border-dashed border-[#2b2b2b]' : 'border-slate-100 dark:border-slate-800'}`}>
                    <div className="flex items-center space-x-2.5">
                        <AppLogo className="h-9 w-9 rounded-xl shadow-xs shrink-0" />
                        <div>
                            <h3 className={`text-base font-extrabold ${currentTheme === 'paperSketch' ? 'font-[\'Gochi_Hand\'] text-xl text-[#2b2b2b]' : currentTheme === 'winamp' ? 'text-[#00FF00]' : 'text-[#39393A] dark:text-slate-100'}`}>
                                Menu Kalender
                            </h3>
                            <p className={`text-xs font-medium ${currentTheme === 'paperSketch' ? 'text-[#2b2b2b]/70 font-mono' : currentTheme === 'winamp' ? 'text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                JadwalPriok
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`rounded-full p-1.5 ${currentTheme === 'paperSketch' ? 'border-2 border-[#2b2b2b] bg-white text-[#2b2b2b] hover:bg-[#ff4747] hover:text-white shadow-[1px_1px_0px_#2b2b2b]' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700'}`}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* User Profile Card: Nama dan NIP Pengguna (Statis) */}
                <div className="mt-3">
                    <div
                        className={`w-full text-left p-2.5 rounded-xl border flex flex-col select-none ${
                            currentTheme === 'paperSketch'
                                ? 'bg-white border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                                : currentTheme === 'winamp'
                                ? 'bg-black border border-[#00FF00]/50 text-[#00FF00]'
                                : currentTheme === 'dashboard'
                                ? 'bg-[#FFF0BE] border border-[#4D2A00]/30 text-[#4D2A00]'
                                : 'bg-current/5 border-current/10'
                        }`}
                    >
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold truncate" title={activeUserName}>
                                {formatDisplayName(activeUserName)}
                            </div>
                            <div className="flex items-center gap-1 opacity-75 mt-0.5">
                                <Fingerprint className="w-3 h-3 text-current/60" />
                                <span className="text-[11px] font-mono font-bold tracking-wider">{activeUserNip}</span>
                            </div>
                            {/* Baris Bawah: Indikator Role di Kiri & Tombol Dashboard di Sudut Kanan Bawah Sejajar */}
                            <div className="mt-2 pt-1.5 border-t border-current/10 flex items-center justify-between gap-1 w-full min-w-0">
                                <span
                                    className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-tight border truncate min-w-0 max-w-[55%] sidebar-user-badge ${
                                        currentTheme === 'paperSketch' ? 'text-[7.5px] px-1 py-0 leading-tight border-[#2b2b2b]' : ''
                                    } ${roleInfo.badgeColor}`}
                                    title={roleInfo.authorityName}
                                >
                                    {roleInfo.authorityName}
                                </span>

                                {canAccessAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onSelectTab('admin');
                                            onClose();
                                        }}
                                        className={getDasborButtonClass(pageTab === 'admin')}
                                    >
                                        <ShieldAlert className={`w-3 h-3 shrink-0 ${pageTab === 'admin' ? 'text-white' : 'text-rose-400'}`} />
                                        <span className="whitespace-nowrap font-bold">Dasbor</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Tools Grid */}
                <div className="mt-3 space-y-2">
                    {canAccessTeamSchedule && (
                        <button
                            type="button"
                            onClick={() => {
                                onSelectTab('team-schedule');
                                onClose();
                            }}
                            className={`w-full flex items-center justify-between rounded-xl border p-2.5 text-left text-xs font-bold transition-colors ${
                                pageTab === 'team-schedule'
                                    ? 'border-teal-300 bg-teal-700 text-white ring-2 ring-teal-300/40'
                                    : 'border-teal-500/40 bg-teal-800/70 hover:bg-teal-700 text-white'
                            }`}
                        >
                            <div className="flex items-center space-x-2.5">
                                <Users className="h-4 w-4 text-teal-200 shrink-0" />
                                <span>Jadwal Rekan (Matriks Shift Tim)</span>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-900/60 text-teal-200 font-bold">
                                Spreadsheet
                            </span>
                        </button>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                onSelectTab('holiday');
                                onClose();
                            }}
                            className={`flex items-center space-x-2.5 rounded-xl border p-2.5 text-left text-xs font-bold transition-colors ${
                                pageTab === 'holiday'
                                    ? 'border-rose-300 bg-[#BE1A1A] text-white ring-2 ring-rose-300/40'
                                    : 'border-rose-400 bg-[#DC2626] hover:bg-[#B91C1C] text-white'
                            }`}
                        >
                            <Flag className="h-4 w-4 fill-white shrink-0" />
                            <span>Hari Libur</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                onSelectTab('settings');
                                onClose();
                            }}
                            className={`flex items-center space-x-2.5 rounded-xl border p-2.5 text-left text-xs font-bold transition-colors ${
                                pageTab === 'settings'
                                    ? 'border-teal-300 bg-[#1b4b4b] text-white ring-2 ring-teal-300/40'
                                    : 'border-white/20 bg-[#225e5e] hover:bg-[#1b4b4b] text-white'
                            }`}
                        >
                            <Sliders className="h-4 w-4 text-teal-200 shrink-0" />
                            <span>Pengaturan</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                onSelectTab('version');
                                onClose();
                            }}
                            className={`flex items-center justify-center space-x-2 rounded-xl border p-2.5 text-center text-xs font-bold transition-all shadow-xs cursor-pointer ${
                                pageTab === 'version'
                                    ? 'border-teal-400 bg-teal-600 text-white ring-2 ring-teal-300/40'
                                    : 'border-teal-500/30 bg-[#1e4d4d] hover:bg-[#285e5e] text-teal-100'
                            }`}
                        >
                            <History className="h-4 w-4 text-teal-200 shrink-0" />
                            <span>Versi (v{appVersion})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                onSelectTab('roadmap');
                                onClose();
                            }}
                            className={`flex items-center justify-center space-x-2 rounded-xl border p-2.5 text-center text-xs font-bold transition-all shadow-xs cursor-pointer ${
                                pageTab === 'roadmap'
                                    ? 'border-amber-400 bg-amber-600 text-white ring-2 ring-amber-300/40'
                                    : 'border-amber-500/30 bg-[#4d3a1e] hover:bg-[#5e4728] text-amber-100'
                            }`}
                        >
                            <ListTodo className="h-4 w-4 text-amber-200 shrink-0" />
                            <span>Rencana Fitur</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                onSelectTab('landing');
                                onClose();
                            }}
                            className={`col-span-2 flex items-center justify-center space-x-2 rounded-xl border p-2.5 text-center text-xs font-bold transition-all shadow-xs cursor-pointer ${
                                pageTab === 'landing'
                                    ? 'border-teal-400 bg-teal-600 text-white ring-2 ring-teal-300/40'
                                    : 'border-teal-500/40 bg-teal-950/60 hover:bg-teal-900/60 text-teal-200'
                            }`}
                        >
                            <Sparkles className="h-4 w-4 text-teal-300 shrink-0" />
                            <span>Landing Page (Ujicoba Onboarding)</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
