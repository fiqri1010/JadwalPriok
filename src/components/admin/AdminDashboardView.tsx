import React, { useState, useEffect } from 'react';
import {
    ShieldAlert,
    Users,
    FileSpreadsheet,
    Shield,
    Sliders,
    UserCheck,
    UserX,
    Lock,
    Unlock,
    Info,
    RefreshCw,
    Layers,
    ChevronRight,
    ClipboardCheck,
} from 'lucide-react';
import { AppTheme, DayData } from '../../types';
import { UserAccount, AuthorityProfile, UserSessionRecord, UserRole, UserApprovalRequest } from '../../types/admin';
import {
    getAdminUsers,
    saveAdminUsers,
    getAuthorityProfiles,
    saveAuthorityProfiles,
    getAllUserSessions,
    saveAllUserSessions,
    getApprovalRequests,
    getCurrentUserRole,
    setCurrentUserRole,
} from '../../utils/adminStorage';
import { AdminUserListTab } from './AdminUserListTab';
import { AdminScheduleBroadcastTab } from './AdminScheduleBroadcastTab';
import { AdminAuthorityProfilesTab } from './AdminAuthorityProfilesTab';
import { AdminApprovalsTab } from './AdminApprovalsTab';

interface AdminDashboardViewProps {
    theme?: AppTheme;
    daysState: Record<string, DayData>;
    onShowToast: (msg: string) => void;
    currentRole: UserRole;
    onRoleChange: (role: UserRole) => void;
}

export type AdminSubMenu = 'users' | 'broadcast' | 'authorities' | 'approvals';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
    theme = 'default',
    daysState,
    onShowToast,
    currentRole,
    onRoleChange,
}) => {
    const isIndustrial = theme === 'industrial';
    const isPaperSketch = theme === 'paperSketch';
    const isTechnical = theme === 'technical';
    const isWinamp = theme === 'winamp';
    const isDark = theme === 'dark';
    const isVista = theme === 'vista';
    const isEditorial = theme === 'editorial';
    const isDashboard = theme === 'dashboard';

    const [activeSubMenu, setActiveSubMenu] = useState<AdminSubMenu>('users');

    // Data states
    const [users, setUsers] = useState<UserAccount[]>(() => getAdminUsers());
    const [profiles, setProfiles] = useState<AuthorityProfile[]>(() => getAuthorityProfiles());
    const [sessions, setSessions] = useState<UserSessionRecord[]>(() => getAllUserSessions());
    const [approvals, setApprovals] = useState<UserApprovalRequest[]>(() => getApprovalRequests());

    // Refresh sesi saat dashboard dibuka agar selalu sinkron dengan Pengaturan
    useEffect(() => {
        setSessions(getAllUserSessions());
    }, [activeSubMenu]);

    const handleUpdateUsers = (newUsers: UserAccount[]) => {
        setUsers(newUsers);
        saveAdminUsers(newUsers);
    };

    const handleUpdateProfiles = (newProfiles: AuthorityProfile[]) => {
        setProfiles(newProfiles);
        saveAuthorityProfiles(newProfiles);
    };

    // Check if current user has permission to approve delete account or reset password
    const canViewApprovals = currentRole === 'admin' || currentRole === 'superadmin';

    const pendingApprovalsCount = getApprovalRequests().filter((r) => r.status === 'pending').length;

    const subMenus = [
        {
            id: 'users' as AdminSubMenu,
            label: 'Data Akun',
            icon: Users,
            count: users.length,
        },
        {
            id: 'broadcast' as AdminSubMenu,
            label: 'Impor Jadwal',
            icon: FileSpreadsheet,
            count: users.length,
        },
        {
            id: 'authorities' as AdminSubMenu,
            label: 'Role',
            icon: Shield,
            count: profiles.length,
        },
        ...(canViewApprovals
            ? [
                  {
                      id: 'approvals' as AdminSubMenu,
                      label: 'Persetujuan',
                      icon: ClipboardCheck,
                      count: pendingApprovalsCount,
                      badgeAlert: pendingApprovalsCount > 0,
                  },
              ]
            : []),
    ];

    const activeIndex = Math.max(0, subMenus.findIndex((m) => m.id === activeSubMenu));

    return (
        <div className="space-y-4 max-w-[1490px] mx-auto animate-in fade-in duration-200">
            {/* Header Dashboard Admin */}
            <div className={`p-3.5 sm:p-4 rounded-2xl border ${
                isIndustrial
                    ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.15)] text-[#E2E8F0] font-[\'JetBrains_Mono\']'
                    : isPaperSketch
                    ? 'bg-white border-2 border-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b] font-[\'Gaegu\'] text-base'
                    : isTechnical
                    ? 'bg-[#F8F7F4] dark:bg-[#0D1117] border-[1.5px] border-[#111113] dark:border-slate-700 font-mono'
                    : isWinamp
                    ? 'bg-black border-2 border-[#00FF00] text-[#00FF00] font-mono'
                    : isDark
                    ? 'bg-[#1E1E1E] border-slate-800 text-slate-100'
                    : 'bg-white border-slate-200/90 text-slate-900 shadow-sm'
            }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl shrink-0 ${
                            isIndustrial
                                ? 'bg-[#0F1115] text-[#2DD4BF] border border-[#2DD4BF]/40'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/50'
                        }`}>
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm sm:text-base font-black tracking-tight">
                                    Dashboard Administrator
                                </h2>
                                <span className="text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                                    Akses Khusus Admin
                                </span>
                            </div>
                            <p className="text-[11px] opacity-65 leading-tight mt-0.5">
                                Manajemen akun posko, impor jadwal shift, dan otoritas pengguna
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sub-menu Navigation Bar - Menggunakan UI/UX Kotak Pilihan Tab Tersegmen dari Sub-Menu Pengaturan */}
                <div className="flex justify-center pt-3 sm:pt-3.5 mt-2.5 sm:mt-3 border-t border-current/15 w-full">
                    <div
                        className={`relative p-[3px] rounded-[10px] grid ${
                            subMenus.length === 4
                                ? 'grid-cols-4 max-w-[540px] sm:max-w-[620px]'
                                : 'grid-cols-3 max-w-[400px] sm:max-w-[480px]'
                        } items-center select-none w-full ${
                            isWinamp
                                ? 'bg-black border border-zinc-700 rounded-none'
                                : isDark
                                ? 'bg-[#161616] border border-slate-800'
                                : isVista
                                ? 'bg-sky-100/70 border border-sky-200/80 backdrop-blur-xs'
                                : isPaperSketch
                                ? 'bg-[#fdfcf0] border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                                : isIndustrial
                                ? 'bg-[#0F1115] border border-[rgba(226,232,240,0.15)] font-["JetBrains_Mono"]'
                                : isTechnical
                                ? 'bg-[#F8F7F4] border-[1.5px] border-[#111113] font-["JetBrains_Mono"]'
                                : isEditorial
                                ? 'bg-[#fcfbf9] border border-slate-300 font-serif'
                                : isDashboard
                                ? 'bg-slate-100 border border-slate-200'
                                : 'bg-[#dadadb]'
                        }`}
                    >
                        {/* Animated Sliding Indicator Pill */}
                        <div
                            className={`absolute top-[3px] bottom-[3px] transition-transform duration-200 ease-out pointer-events-none z-0 ${
                                isWinamp
                                    ? 'bg-[#00FF00] rounded-none'
                                    : isDark
                                    ? 'bg-[#2a2f3b] border border-white/10 shadow-[0px_3px_8px_rgba(0,0,0,0.35)] rounded-[8px]'
                                    : isVista
                                    ? 'bg-white/95 border border-white/80 shadow-[0px_3px_8px_rgba(14,116,224,0.18)] rounded-[8px]'
                                    : isPaperSketch
                                    ? 'bg-[#ff4747] border-2 border-[#2b2b2b] rounded-lg'
                                    : isIndustrial
                                    ? 'bg-[#2DD4BF]/20 border border-[#2DD4BF]/40 rounded-[4px]'
                                    : isTechnical
                                    ? 'bg-[#111113] rounded-none'
                                    : isEditorial
                                    ? 'bg-[#2a7373] rounded-lg'
                                    : isDashboard
                                    ? 'bg-[#297373] rounded-lg shadow-xs'
                                    : 'bg-white border-[0.5px] border-black/5 shadow-[0px_3px_8px_rgba(0,0,0,0.12),0px_3px_1px_rgba(0,0,0,0.04)] rounded-[8px]'
                            }`}
                            style={{
                                left: '3px',
                                width: `calc((100% - 6px) / ${subMenus.length})`,
                                transform: `translateX(${activeIndex * 100}%)`,
                            }}
                        />

                        {subMenus.map((item) => {
                            const Icon = item.icon;
                            const isSelected = activeSubMenu === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setActiveSubMenu(item.id)}
                                    className={`relative z-10 w-full py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-center flex items-center justify-center space-x-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap px-1 sm:px-2 ${
                                        isSelected
                                            ? isWinamp
                                                ? 'text-black font-mono'
                                                : isDark
                                                ? 'text-white'
                                                : isVista
                                                ? 'text-sky-950'
                                                : isPaperSketch
                                                ? 'text-white font-["Gochi_Hand"] text-sm'
                                                : isIndustrial
                                                ? 'text-[#2DD4BF] font-["JetBrains_Mono"] uppercase'
                                                : isTechnical
                                                ? 'text-white font-["JetBrains_Mono"] uppercase'
                                                : isEditorial
                                                ? 'text-white'
                                                : isDashboard
                                                ? 'text-white'
                                                : 'text-slate-900'
                                            : isPaperSketch
                                            ? 'text-[#2b2b2b] font-["Gochi_Hand"] text-sm'
                                            : isIndustrial
                                            ? 'text-[#E2E8F0]/70 font-["JetBrains_Mono"] uppercase'
                                            : isTechnical
                                            ? 'text-[#111113]/70 font-["JetBrains_Mono"] uppercase'
                                            : 'opacity-60 hover:opacity-90'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                                    <span>{item.label}</span>
                                    {item.count !== undefined && (
                                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold shrink-0 ml-0.5 ${
                                            (item as any).badgeAlert
                                                ? 'bg-rose-500 text-white animate-pulse'
                                                : isSelected
                                                ? isIndustrial
                                                    ? 'bg-[#2DD4BF]/20 text-[#2DD4BF]'
                                                    : isTechnical
                                                    ? 'bg-white/20 text-white'
                                                    : 'bg-black/10 dark:bg-white/20 text-current'
                                                : 'bg-current/10 text-current'
                                        }`}>
                                            {item.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Sub-menu View Content */}
            <div className={`relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                currentRole === 'non-user' ? 'opacity-30 pointer-events-none select-none filter grayscale' : ''
            } ${
                isIndustrial
                    ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                    : isPaperSketch
                    ? 'bg-white border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
                    : isTechnical
                    ? 'bg-[#F8F7F4] dark:bg-[#0D1117] border-[1.5px] border-[#111113] dark:border-slate-700'
                    : isWinamp
                    ? 'bg-black border border-[#00FF00] text-[#00FF00]'
                    : isDark
                    ? 'bg-[#1E1E1E] border-slate-800 text-slate-100'
                    : 'bg-white border-slate-200/90 text-slate-900 shadow-2xs'
            }`}>
                {/* 1. Sub Menu: Akun Pengguna (Tabel List No | Nama | NIP | Posko | Sesi | Aktif | Reset | Edit | Hapus) */}
                {activeSubMenu === 'users' && (
                    <AdminUserListTab
                        users={users}
                        authorityProfiles={profiles}
                        sessions={sessions}
                        onUpdateUsers={handleUpdateUsers}
                        onShowToast={onShowToast}
                        theme={theme}
                        currentRole={currentRole}
                    />
                )}

                {/* 2. Sub Menu: Impor Jadwal Pengguna (Grid 150x40) */}
                {activeSubMenu === 'broadcast' && (
                    <AdminScheduleBroadcastTab
                        users={users}
                        daysState={daysState}
                        onShowToast={onShowToast}
                        theme={theme}
                    />
                )}

                {/* 3. Sub Menu: Role Otoritas */}
                {activeSubMenu === 'authorities' && (
                    <AdminAuthorityProfilesTab
                        profiles={profiles}
                        users={users}
                        onUpdateProfiles={handleUpdateProfiles}
                        onShowToast={onShowToast}
                        theme={theme}
                    />
                )}

                {/* 5. Sub Menu: Halaman Persetujuan (Hapus Akun & Reset Password) */}
                {activeSubMenu === 'approvals' && (
                    <AdminApprovalsTab
                        users={users}
                        onUpdateUsers={handleUpdateUsers}
                        onShowToast={onShowToast}
                        theme={theme}
                    />
                )}
            </div>
        </div>
    );
};
