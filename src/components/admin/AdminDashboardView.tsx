import React, { useState, useEffect } from 'react';
import {
    ShieldAlert,
    Users,
    FileSpreadsheet,
    Activity,
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
import { AdminUserSessionsTab } from './AdminUserSessionsTab';
import { AdminAuthorityProfilesTab } from './AdminAuthorityProfilesTab';
import { AdminApprovalsTab } from './AdminApprovalsTab';

interface AdminDashboardViewProps {
    theme?: AppTheme;
    daysState: Record<string, DayData>;
    onShowToast: (msg: string) => void;
    currentRole: UserRole;
    onRoleChange: (role: UserRole) => void;
}

export type AdminSubMenu = 'users' | 'broadcast' | 'sessions' | 'authorities' | 'approvals';

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

    const [activeSubMenu, setActiveSubMenu] = useState<AdminSubMenu>('users');

    // Data states
    const [users, setUsers] = useState<UserAccount[]>(() => getAdminUsers());
    const [profiles, setProfiles] = useState<AuthorityProfile[]>(() => getAuthorityProfiles());
    const [sessions, setSessions] = useState<UserSessionRecord[]>(() => getAllUserSessions());
    const [approvals, setApprovals] = useState<UserApprovalRequest[]>(() => getApprovalRequests());

    const handleUpdateUsers = (newUsers: UserAccount[]) => {
        setUsers(newUsers);
        saveAdminUsers(newUsers);
    };

    const handleUpdateProfiles = (newProfiles: AuthorityProfile[]) => {
        setProfiles(newProfiles);
        saveAuthorityProfiles(newProfiles);
    };

    // Check if current user has permission to approve delete account or reset password
    // (For demonstration in UI, all admin users or users with superadmin/canManageUsers/canResetUserPassword have this permission)
    const canViewApprovals = currentRole === 'admin';

    const pendingApprovalsCount = getApprovalRequests().filter((r) => r.status === 'pending').length;

    const subMenus = [
        {
            id: 'users' as AdminSubMenu,
            label: 'Daftar Pengguna',
            icon: Users,
            count: users.length,
        },
        {
            id: 'broadcast' as AdminSubMenu,
            label: 'Impor Jadwal Pengguna',
            icon: FileSpreadsheet,
            count: users.length,
        },
        {
            id: 'sessions' as AdminSubMenu,
            label: 'Sesi Pengguna',
            icon: Activity,
            count: sessions.filter((s) => s.isOnline).length,
        },
        {
            id: 'authorities' as AdminSubMenu,
            label: 'Profil Otoritas',
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

    return (
        <div className="space-y-4 max-w-[1490px] mx-auto animate-in fade-in duration-200">
            {/* Header Dashboard Admin */}
            <div className={`p-4 sm:p-5 rounded-2xl border ${
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3.5">
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                            isIndustrial
                                ? 'bg-[#0F1115] text-[#2DD4BF] border border-[#2DD4BF]/40'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/50'
                        }`}>
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base sm:text-lg font-black tracking-tight">
                                    Dashboard Administrator
                                </h2>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                                    Akses Khusus Admin
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Role Tester Switcher */}
                    <div className="flex items-center gap-2 self-start md:self-center p-1.5 rounded-xl bg-current/5 border border-current/15">
                        <span className="text-[11px] opacity-75 font-bold pl-1.5">Mode Otoritas:</span>
                        <button
                            type="button"
                            onClick={() => {
                                onRoleChange('admin');
                                onShowToast('Mode aktif: ADMINISTRATOR POSKO');
                            }}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                currentRole === 'admin'
                                    ? 'bg-rose-600 text-white shadow-2xs'
                                    : 'opacity-60 hover:opacity-100'
                            }`}
                        >
                            1. Admin
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onRoleChange('end-user');
                                onShowToast('Beralih ke mode END-USER (Dashboard Admin akan tersembunyi).');
                            }}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                                currentRole === 'end-user'
                                    ? 'bg-teal-600 text-white shadow-2xs'
                                    : 'opacity-60 hover:opacity-100'
                            }`}
                        >
                            2. End-User
                        </button>
                    </div>
                </div>

                {/* Sub-menu Navigation Bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-4 mt-4 border-t border-current/15 pb-1 no-scrollbar">
                    {subMenus.map((item) => {
                        const Icon = item.icon;
                        const isSelected = activeSubMenu === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setActiveSubMenu(item.id)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 shrink-0 transition-all cursor-pointer ${
                                    isSelected
                                        ? isIndustrial
                                            ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40'
                                            : 'bg-rose-600 text-white shadow-xs'
                                        : 'hover:bg-current/10 border border-current/15 opacity-70 hover:opacity-100'
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{item.label}</span>
                                {item.count !== undefined && (
                                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                                        (item as any).badgeAlert
                                            ? 'bg-rose-500 text-white animate-pulse'
                                            : isSelected
                                            ? 'bg-white/20 text-white'
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

            {/* Sub-menu View Content */}
            <div className={`p-4 sm:p-5 rounded-2xl border ${
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
                {/* 1. Sub Menu: Daftar Pengguna (Tabel List No | Nama | NIP | Posko | Aktif | Reset | Edit | Hapus) */}
                {activeSubMenu === 'users' && (
                    <AdminUserListTab
                        users={users}
                        authorityProfiles={profiles}
                        onUpdateUsers={handleUpdateUsers}
                        onShowToast={onShowToast}
                        theme={theme}
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

                {/* 3. Sub Menu: Sesi Pengguna */}
                {activeSubMenu === 'sessions' && (
                    <AdminUserSessionsTab
                        users={users}
                        sessions={sessions}
                        theme={theme}
                    />
                )}

                {/* 4. Sub Menu: Profil Otoritas */}
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
