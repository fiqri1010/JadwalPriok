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

    const subMenus = [
        {
            id: 'users' as AdminSubMenu,
            label: 'Data Akun',
            icon: Users,
        },
        {
            id: 'broadcast' as AdminSubMenu,
            label: 'Impor Jadwal',
            icon: FileSpreadsheet,
        },
        {
            id: 'authorities' as AdminSubMenu,
            label: 'Role',
            icon: Shield,
        },
        ...(canViewApprovals
            ? [
                  {
                      id: 'approvals' as AdminSubMenu,
                      label: 'Persetujuan',
                      icon: ClipboardCheck,
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
                    : isDashboard
                    ? 'bg-[#FFF5D0] border-[#4D2A00]/25 text-[#4D2A00] shadow-sm'
                    : 'bg-white border-slate-200/90 text-slate-900 shadow-sm'
            }`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                    {/* Sisi Kiri: Judul & Keterangan Dashboard */}
                    <div className="flex items-center space-x-3 shrink-0">
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

                    {/* Sisi Kanan: Sub-menu Navigation Bar (Paling Kanan Header, tanpa pemotongan teks) */}
                    <div className="w-full lg:w-auto overflow-x-auto no-scrollbar shrink-0 pb-1 lg:pb-0">
                        <div
                            className={`relative p-[2.5px] rounded-[8px] grid ${
                                subMenus.length === 4
                                    ? 'grid-cols-4 min-w-[390px] sm:min-w-[440px] md:min-w-[480px] lg:min-w-[500px]'
                                    : 'grid-cols-3 min-w-[300px] sm:min-w-[340px] md:min-w-[370px] lg:min-w-[390px]'
                            } items-center select-none ${
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
                                    ? 'bg-[#FFF0BE] border border-[#4D2A00]/25'
                                    : 'bg-[#dadadb]'
                            }`}
                        >
                            {/* Animated Sliding Indicator Pill */}
                            <div
                                className={`absolute top-[2.5px] bottom-[2.5px] transition-transform duration-200 ease-out pointer-events-none z-0 ${
                                    isWinamp
                                        ? 'bg-[#00FF00] rounded-none'
                                        : isDark
                                        ? 'bg-[#2a2f3b] border border-white/10 shadow-[0px_2px_6px_rgba(0,0,0,0.35)] rounded-[6px]'
                                        : isVista
                                        ? 'bg-white/95 border border-white/80 shadow-[0px_2px_6px_rgba(14,116,224,0.18)] rounded-[6px]'
                                        : isPaperSketch
                                        ? 'bg-[#ff4747] border-2 border-[#2b2b2b] rounded-lg'
                                        : isIndustrial
                                        ? 'bg-[#2DD4BF]/20 border border-[#2DD4BF]/40 rounded-[4px]'
                                        : isTechnical
                                        ? 'bg-[#111113] rounded-none'
                                        : isEditorial
                                        ? 'bg-[#2a7373] rounded-md'
                                        : isDashboard
                                        ? 'bg-[#4D2A00] rounded-md shadow-xs'
                                        : 'bg-white border-[0.5px] border-black/5 shadow-[0px_2px_6px_rgba(0,0,0,0.12)] rounded-[6px]'
                                }`}
                                style={{
                                    left: '2.5px',
                                    width: `calc((100% - 5px) / ${subMenus.length})`,
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
                                        className={`relative z-10 w-full py-1.5 text-[10.5px] sm:text-xs font-bold text-center flex items-center justify-center gap-1 sm:gap-1.5 transition-all duration-200 cursor-pointer px-2 sm:px-2.5 whitespace-nowrap ${
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
                                                    ? 'text-[#FFF9E6]'
                                                    : 'text-slate-900'
                                                : isPaperSketch
                                                ? 'text-[#2b2b2b] font-["Gochi_Hand"] text-sm'
                                                : isIndustrial
                                                ? 'text-[#E2E8F0]/70 font-["JetBrains_Mono"] uppercase'
                                                : isTechnical
                                                ? 'text-[#111113]/70 font-["JetBrains_Mono"] uppercase'
                                                : isDashboard
                                                ? 'text-[#4D2A00]/70 hover:text-[#4D2A00]'
                                                : 'opacity-60 hover:opacity-90'
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5 shrink-0" />
                                        <span className="whitespace-nowrap">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
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
                    : isDashboard
                    ? 'bg-[#FFF5D0] border-[#4D2A00]/25 text-[#4D2A00] shadow-2xs'
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
                        onUpdateUsers={handleUpdateUsers}
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
