import React from 'react';
import styled from 'styled-components';
import {
    Calendar as CalendarIcon,
    Flag,
    Sliders,
    History,
    ListTodo,
    ShieldAlert,
    User,
    Fingerprint,
    Shield,
    Sparkles,
    Users,
} from 'lucide-react';
import { ThemeConfig } from '../themeConfig';
import { AppTheme } from '../types';
import { UserRole } from '../types/admin';
import { getCurrentUserRoleInfo, getCurrentUserPermissions } from '../utils/adminStorage';
import { Tooltip } from './Tooltip';
import { AppLogo } from './AppLogo';
import { APP_VERSION } from '../version';
import { formatDisplayName } from './admin/AdminUserListTab';

const StyledSidebarWrapper = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;

  .container {
    width: 100%;
    height: 100%;
    background: #f1f1f1;
    background-image: linear-gradient(
        90deg,
        transparent 50px,
        #ffb4b8 50px,
        #ffb4b8 52px,
        transparent 52px
      ),
      linear-gradient(#e1e1e1 0.1em, transparent 0.1em);
    background-size: 100% 30px;
  }
`;

interface DesktopSidebarProps {
    isOpen: boolean;
    pageTab: 'calendar' | 'team-schedule' | 'holiday' | 'settings' | 'version' | 'roadmap' | 'admin' | 'landing';
    setPageTab: (tab: 'calendar' | 'team-schedule' | 'holiday' | 'settings' | 'version' | 'roadmap' | 'admin' | 'landing') => void;
    themeConfig: ThemeConfig;
    currentTheme?: AppTheme;
    isAdmin?: boolean;
    userName?: string;
    userNip?: string;
    userRole?: UserRole;
    calendarViewMode?: 'grid' | 'list';
    onCalendarMenuClick?: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
    isOpen,
    pageTab,
    setPageTab,
    themeConfig,
    currentTheme = 'industrial',
    isAdmin = true,
    userName,
    userNip,
    userRole,
    calendarViewMode = 'grid',
    onCalendarMenuClick,
}) => {
    const generalSettings = React.useMemo(() => {
        try {
            const saved = localStorage.getItem('jadwalpriok_general_settings');
            if (saved) return JSON.parse(saved);
        } catch {}
        return { showSidebar: true };
    }, []);

    // Memoized User Info & Permissions to prevent sync localStorage read jank on render
    const { activeUserName, activeUserNip, roleInfo, canAccessAdmin, canAccessTeamSchedule } = React.useMemo(() => {
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

        return {
            activeUserName,
            activeUserNip,
            roleInfo,
            canAccessAdmin,
            canAccessTeamSchedule
        };
    }, [userName, userNip, userRole]);

    const getDasborButtonClass = React.useCallback((isActive: boolean) => {
        const base = 'inline-flex items-center justify-center gap-1 px-2.5 py-1 text-[11px] font-bold font-mono uppercase tracking-tight transition-all duration-150 cursor-pointer shrink-0 whitespace-nowrap select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500/50 sidebar-admin-btn';

        if (themeConfig.isPaperSketch) {
            if (isActive) {
                return `${base} rounded-none border-2 border-[#2b2b2b] bg-[#ff4747] text-white shadow-[2px_2px_0px_#2b2b2b] translate-x-[0.5px] translate-y-[0.5px]`;
            }
            return `${base} rounded-none border-2 border-[#2b2b2b] bg-white hover:bg-[#ffe8a3] text-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] hover:shadow-[2.5px_2.5px_0px_#2b2b2b] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none`;
        }

        if (themeConfig.isTechnical) {
            if (isActive) {
                return `${base} rounded-none border-[1.5px] border-[#111113] bg-[#111113] text-[#F8F7F4] shadow-[1.5px_1.5px_0px_#111113]`;
            }
            return `${base} rounded-none border-[1.5px] border-[#111113] bg-[#FFFFFF] hover:bg-[#111113] text-[#111113] hover:text-[#F8F7F4] shadow-[1.5px_1.5px_0px_#111113] hover:shadow-[2px_2px_0px_#111113] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none`;
        }

        if (themeConfig.isEditorial) {
            if (isActive) {
                return `${base} rounded-none border border-[#1a1a1a] bg-[#1a1a1a] text-[#fcfbf9] shadow-xs`;
            }
            return `${base} rounded-none border border-[#1a1a1a]/30 bg-[#ffffff] hover:bg-[#1a1a1a]/[0.08] text-[#1a1a1a] shadow-2xs hover:shadow-xs active:scale-95`;
        }

        if (themeConfig.isIndustrial) {
            if (isActive) {
                return `${base} rounded-[4px] border border-rose-500/80 bg-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.4),0_2px_4px_rgba(0,0,0,0.5)] font-bold`;
            }
            return `${base} rounded-[4px] border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 shadow-[0_2px_5px_rgba(0,0,0,0.3)] hover:shadow-[0_0_10px_rgba(244,63,94,0.25)] hover:border-rose-500/50 active:scale-95`;
        }

        if (currentTheme === 'winamp') {
            if (isActive) {
                return `${base} rounded-none border border-[#00FF00] bg-[#00FF00] text-black shadow-[2px_2px_0_#00FF00]`;
            }
            return `${base} rounded-none border border-[#00FF00] bg-black text-[#00FF00] hover:bg-[#00FF00]/20 shadow-[2px_2px_0_#00FF00] active:scale-95`;
        }

        if (currentTheme === 'vista') {
            if (isActive) {
                return `${base} rounded-lg border border-rose-400/80 bg-rose-500 text-white shadow-[0_4px_14px_rgba(225,29,72,0.35)]`;
            }
            return `${base} rounded-lg border border-rose-200/80 bg-rose-50/80 hover:bg-rose-100/90 text-rose-700 shadow-sm hover:shadow-[0_4px_12px_rgba(225,29,72,0.2)] hover:-translate-y-0.5 active:scale-95 backdrop-blur-xs`;
        }

        if (currentTheme === 'dashboard') {
            if (isActive) {
                return `${base} rounded-[4px] border border-[#4D2A00] bg-[#4D2A00] text-[#F9E6A8] shadow-xs`;
            }
            return `${base} rounded-[4px] border border-[#4D2A00]/40 bg-[#FFF5D0] hover:bg-[#FFF0BE] text-[#4D2A00] shadow-2xs hover:shadow-xs active:scale-95`;
        }

        if (currentTheme === 'dark') {
            if (isActive) {
                return `${base} rounded-lg border border-rose-500 bg-rose-600 text-white shadow-md shadow-rose-900/30`;
            }
            return `${base} rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 shadow-xs hover:shadow-sm hover:border-rose-500/50 active:scale-95`;
        }

        // Default / Light
        if (isActive) {
            return `${base} rounded-lg border border-rose-600 bg-rose-600 text-white shadow-sm`;
        }
        return `${base} rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 shadow-xs hover:shadow-sm hover:border-rose-300 active:scale-95`;
    }, [themeConfig, currentTheme]);

    if (generalSettings.showSidebar === false) {
        return null;
    }

    return (
        <aside
            id="desktop-side-menu"
            aria-label="Side Menu"
            className={`hidden md:flex flex-col shrink-0 sidebar-transition will-change-[width,opacity] transition-all duration-200 ease-in-out select-none relative z-30 overflow-hidden ${
                isOpen
                    ? 'w-52 lg:w-56 xl:w-60 opacity-100'
                    : 'w-0 opacity-0 pointer-events-none border-r-transparent shadow-none'
            } ${themeConfig.sidebarClass}`}
        >
            {themeConfig.isPaperSketch && (
                <StyledSidebarWrapper>
                    <div className="container" />
                </StyledSidebarWrapper>
            )}
            <div className={`w-52 lg:w-56 xl:w-60 min-w-[13rem] lg:min-w-[14rem] xl:min-w-[15rem] flex flex-col h-full justify-between relative z-10 shrink-0 sidebar-inner-content ${
                isOpen ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-60'
            }`}>
                <div className="flex flex-col">
                    {/* 1. Top Brand Header: Logo dan Nama Aplikasi di paling atas Sidebar - Terbuka utuh menyatu sampai atas */}
                    <div className="flex items-center min-h-[40px] sm:min-h-[44px] px-3.5 lg:px-4 py-1 shrink-0">
                        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                            <div className={`${themeConfig.isIndustrial ? 'flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-[6px] bg-[#1A1D23] text-[#2DD4BF] border border-[#2DD4BF]/40' : themeConfig.logoContainerClass} shrink-0 self-center`}>
                                <AppLogo className={themeConfig.isIndustrial ? "h-4 w-4 sm:h-4.5 sm:w-4.5 text-[#2DD4BF]" : "h-5 w-5 lg:h-6 lg:w-6"} />
                            </div>
                            <div className="min-w-0 flex flex-col justify-center">
                                {themeConfig.isTechnical && (
                                    <span className="text-[8px] font-['JetBrains_Mono'] font-bold text-[#111113]/70 uppercase tracking-widest leading-none mb-0.5">
                                        v{APP_VERSION}
                                    </span>
                                )}
                                {themeConfig.isEditorial && (
                                    <span className="text-[8px] font-['Geist_Mono'] font-medium text-[#1a1a1a]/60 uppercase tracking-widest leading-none mb-0.5">
                                        v{APP_VERSION}
                                    </span>
                                )}
                                {themeConfig.isIndustrial && (
                                    <span className="text-[8px] font-['JetBrains_Mono'] font-bold text-[#2DD4BF]/80 uppercase tracking-widest leading-none mb-0.5">
                                        v{APP_VERSION}
                                    </span>
                                )}
                                <h1 style={themeConfig.isIndustrial ? { fontFamily: "'Industry Test', sans-serif" } : undefined} className={`${
                                    themeConfig.isIndustrial
                                        ? 'text-[23px] tracking-tight leading-none whitespace-nowrap overflow-visible text-[#E2E8F0] uppercase'
                                        : themeConfig.titleClass
                                } font-black leading-tight truncate`}>
                                    JadwalPriok
                                </h1>
                                <p className={`${themeConfig.subtitleClass} leading-tight truncate opacity-75 ${themeConfig.isPaperSketch ? 'text-xs' : 'text-[10px]'}`}>
                                    Kalender Kerja
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Informasi Nama dan NIP Pengguna Aktif (Tanpa SVG Profil Samping) */}
                    <div className="px-2.5 lg:px-3 pt-0.5 pb-1">
                        <div
                            className={`w-full text-left p-2.5 rounded-lg border flex flex-col select-none ${
                                themeConfig.isIndustrial
                                    ? 'bg-[#1A1D23]/90 border-[rgba(226,232,240,0.12)] text-[#E2E8F0] shadow-sm'
                                    : themeConfig.isPaperSketch
                                    ? 'bg-[#ffffff] border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] rounded-none'
                                    : themeConfig.isTechnical
                                    ? 'bg-[#FFFFFF] dark:bg-[#0D1117] border-[1.5px] border-[#111113] dark:border-slate-700 font-[\'JetBrains_Mono\'] rounded-none'
                                    : themeConfig.isEditorial
                                    ? 'bg-[#ffffff] border border-[#1a1a1a]/25 text-[#1a1a1a] font-[\'Geist_Mono\'] rounded-none shadow-2xs'
                                    : currentTheme === 'winamp'
                                    ? 'bg-black border border-[#00FF00]/60 text-[#00FF00] font-mono rounded-none'
                                    : currentTheme === 'dark'
                                    ? 'bg-[#181818] border-zinc-800 text-slate-100 shadow-sm'
                                    : currentTheme === 'dashboard'
                                    ? 'bg-[#FFF0BE] border border-[#4D2A00]/30 text-[#4D2A00] shadow-2xs'
                                    : 'bg-slate-50/90 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-slate-100 shadow-2xs'
                            }`}
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <span className={`text-xs font-black whitespace-normal break-words block leading-tight ${themeConfig.isEditorial ? 'font-medium font-[\'Geist_Mono\']' : themeConfig.isTechnical ? 'font-[\'JetBrains_Mono\']' : ''}`} title={activeUserName}>
                                        {formatDisplayName(activeUserName)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 mt-0.5 opacity-75">
                                    <Fingerprint className="w-3 h-3 shrink-0 text-current/60" />
                                    <span className="text-[10.5px] lg:text-[11px] font-mono font-bold tracking-tight truncate leading-none">
                                        {activeUserNip}
                                    </span>
                                </div>
                                {/* Baris Bawah: Indikator Role di Kiri & Tombol Dashboard di Sudut Kanan Bawah Sejajar */}
                                <div className="mt-2 pt-1.5 border-t border-current/10 flex items-center justify-between gap-1 w-full min-w-0">
                                    <span
                                        style={{
                                            fontSize: '11.5px',
                                            lineHeight: '19.6333px',
                                            textAlign: 'justify',
                                        }}
                                        className={`text-[11.5px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-tight border truncate min-w-0 max-w-[55%] text-justify sidebar-user-badge ${
                                            themeConfig.isPaperSketch ? 'px-2 py-0.5 border-[#2b2b2b] rounded-none' : themeConfig.isEditorial ? 'rounded-none border-[#1a1a1a]/30' : themeConfig.isTechnical ? 'rounded-none border-[#111113]' : ''
                                        } ${roleInfo.badgeColor}`}
                                        title={roleInfo.authorityName}
                                    >
                                        {roleInfo.authorityName}
                                    </span>

                                    {canAccessAdmin && (
                                        <Tooltip
                                            content={<span>Akses <strong>Dashboard Administrator</strong></span>}
                                            placement="right"
                                        >
                                            <button
                                                type="button"
                                                id="side-menu-admin"
                                                onClick={() => setPageTab('admin')}
                                                className={getDasborButtonClass(pageTab === 'admin')}
                                                title="Buka Dashboard Administrator"
                                            >
                                                <ShieldAlert className={`w-3.5 h-3.5 shrink-0 transition-transform ${pageTab === 'admin' ? 'text-white' : 'text-rose-500'}`} />
                                                <span className="whitespace-nowrap font-bold">Dasbor</span>
                                            </button>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Menu Navigasi Utama */}
                    <nav className="flex flex-col space-y-1.5 p-2 lg:p-3">
                        {/* Section Header: Menu Utama */}
                        <div className="px-3 pt-0.5 pb-1 text-[10px] lg:text-[11px] font-black uppercase tracking-wider opacity-60">
                            Menu Utama
                        </div>

                        {/* 1. Kalender */}
                        <Tooltip
                            content={
                                pageTab === 'calendar'
                                    ? <span>Klik lagi untuk beralih ke <strong>{calendarViewMode === 'list' ? 'Tampilan Kalender (Grid)' : 'Tampilan List (Daftar)'}</strong></span>
                                    : <span>Lihat <strong>Kalender Kerja & Shift</strong></span>
                            }
                            placement="right"
                            containerClassName="w-full"
                        >
                            <button
                                type="button"
                                id="side-menu-kalender"
                                onClick={() => {
                                    if (onCalendarMenuClick) {
                                        onCalendarMenuClick();
                                    } else {
                                        setPageTab('calendar');
                                    }
                                }}
                                className={`w-full flex items-center justify-between space-x-2.5 px-3 py-2 text-xs lg:text-[13px] xl:text-sm font-bold rounded-[5px] lg:rounded-[7px] transition-all cursor-pointer ${
                                    pageTab === 'calendar'
                                        ? themeConfig.sidebarItemActiveClass
                                        : themeConfig.sidebarItemInactiveClass
                                }`}
                            >
                                <div className="flex items-center space-x-2.5 min-w-0">
                                    <CalendarIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px] shrink-0" />
                                    <span className="truncate text-left">Kalender Kerja</span>
                                </div>
                                {pageTab === 'calendar' && (
                                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase tracking-tight shrink-0 border ${
                                        calendarViewMode === 'list'
                                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                                            : 'bg-teal-500/20 text-teal-400 border-teal-500/40'
                                    }`}>
                                        {calendarViewMode === 'list' ? 'List' : 'Grid'}
                                    </span>
                                )}
                            </button>
                        </Tooltip>

                        {/* 2. Jadwal Rekan (Matriks Shift Tim) */}
                        {canAccessTeamSchedule && (
                            <Tooltip
                                content={<span>Lihat <strong>Jadwal Rekan (Matriks Shift Tim)</strong></span>}
                                placement="right"
                                containerClassName="w-full"
                            >
                                <button
                                    type="button"
                                    id="side-menu-jadwal-rekan"
                                    onClick={() => setPageTab('team-schedule')}
                                    className={`w-full flex items-center space-x-2.5 px-3 py-2 mt-1 text-xs lg:text-[13px] xl:text-sm font-bold rounded-[5px] lg:rounded-[7px] transition-all cursor-pointer ${
                                        pageTab === 'team-schedule'
                                            ? themeConfig.sidebarItemActiveClass
                                            : themeConfig.sidebarItemInactiveClass
                                    }`}
                                >
                                    <Users className="h-4 w-4 lg:h-[18px] lg:w-[18px] shrink-0" />
                                    <span className="truncate flex-1 text-left">Jadwal Rekan</span>
                                </button>
                            </Tooltip>
                        )}

                        {/* <- Garis Batas -> */}
                        <div className={`my-2 lg:my-2.5 ${themeConfig.sidebarDividerClass}`} />

                        {/* Section Header: Pengaturan & Lainnya */}
                        <div className="px-3 pt-0.5 pb-1 text-[10px] lg:text-[11px] font-black uppercase tracking-wider opacity-60">
                            Konfigurasi & Info
                        </div>

                        {/* 2. Libur */}
                        <Tooltip
                            content={<span>Kelola <strong>Libur Nasional & Cuti</strong></span>}
                            placement="right"
                            containerClassName="w-full"
                        >
                            <button
                                type="button"
                                id="side-menu-libur"
                                onClick={() => setPageTab('holiday')}
                                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs lg:text-[13px] xl:text-sm font-bold rounded-[5px] lg:rounded-[7px] transition-all cursor-pointer ${
                                    pageTab === 'holiday'
                                        ? themeConfig.sidebarItemActiveClass
                                        : themeConfig.sidebarItemInactiveClass
                                }`}
                            >
                                <Flag className="h-4 w-4 lg:h-[18px] lg:w-[18px] text-rose-500 fill-rose-500 shrink-0" />
                                <span className="truncate flex-1 text-left">Daftar Libur</span>
                            </button>
                        </Tooltip>

                        {/* 3. Pengaturan */}
                        <Tooltip
                            content={<span>Buka <strong>Pengaturan Aplikasi</strong></span>}
                            placement="right"
                            containerClassName="w-full"
                        >
                            <button
                                type="button"
                                id="side-menu-pengaturan"
                                onClick={() => setPageTab('settings')}
                                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs lg:text-[13px] xl:text-sm font-bold rounded-[5px] lg:rounded-[7px] transition-all cursor-pointer ${
                                    pageTab === 'settings'
                                        ? themeConfig.sidebarItemActiveClass
                                        : themeConfig.sidebarItemInactiveClass
                                }`}
                            >
                                <Sliders className="h-4 w-4 lg:h-[18px] lg:w-[18px] text-indigo-500 shrink-0" />
                                <span className="truncate flex-1 text-left">Pengaturan</span>
                            </button>
                        </Tooltip>

                        {/* 4. Versi */}
                        <Tooltip
                            content={<span>Lihat <strong>Riwayat Pembaruan</strong></span>}
                            placement="right"
                            containerClassName="w-full"
                        >
                            <button
                                type="button"
                                id="side-menu-versi"
                                onClick={() => setPageTab('version')}
                                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs lg:text-[13px] xl:text-sm font-bold rounded-[5px] lg:rounded-[7px] transition-all cursor-pointer ${
                                    pageTab === 'version'
                                        ? themeConfig.sidebarItemActiveClass
                                        : themeConfig.sidebarItemInactiveClass
                                }`}
                            >
                                <History className="h-4 w-4 lg:h-[18px] lg:w-[18px] text-emerald-500 shrink-0" />
                                <span className="truncate flex-1 text-left">Catatan Versi</span>
                            </button>
                        </Tooltip>

                        {/* 5. Rencana Fitur (Roadmap) */}
                        <Tooltip
                            content={<span>Lihat <strong>Rencana Fitur & Roadmap</strong></span>}
                            placement="right"
                            containerClassName="w-full"
                        >
                            <button
                                type="button"
                                id="side-menu-roadmap"
                                onClick={() => setPageTab('roadmap')}
                                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs lg:text-[13px] xl:text-sm font-bold rounded-[5px] lg:rounded-[7px] transition-all cursor-pointer ${
                                    pageTab === 'roadmap'
                                        ? themeConfig.sidebarItemActiveClass
                                        : themeConfig.sidebarItemInactiveClass
                                }`}
                            >
                                <ListTodo className="h-4 w-4 lg:h-[18px] lg:w-[18px] text-amber-500 shrink-0" />
                                <span className="truncate flex-1 text-left">Rencana Fitur</span>
                            </button>
                        </Tooltip>

                        {/* 6. Landing Page (Ujicoba Onboarding & Otentikasi) */}
                        <Tooltip
                            content={<span>Buka <strong>Landing Page & Otentikasi NIP</strong></span>}
                            placement="right"
                            containerClassName="w-full"
                        >
                            <button
                                type="button"
                                id="side-menu-landing"
                                onClick={() => setPageTab('landing')}
                                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs lg:text-[13px] xl:text-sm font-bold rounded-[5px] lg:rounded-[7px] transition-all cursor-pointer ${
                                    pageTab === 'landing'
                                        ? themeConfig.sidebarItemActiveClass
                                        : themeConfig.sidebarItemInactiveClass
                                }`}
                            >
                                <Sparkles className="h-4 w-4 lg:h-[18px] lg:w-[18px] text-teal-500 shrink-0" />
                                <span className="truncate flex-1 text-left">Landing Page</span>
                            </button>
                        </Tooltip>
                    </nav>
                </div>

                {themeConfig.isIndustrial && (
                    <div className="p-2.5 mt-auto border-t border-[rgba(226,232,240,0.1)]">
                        <div className="text-[7.5px] font-['JetBrains_Mono'] font-bold text-[#2DD4BF] uppercase tracking-widest mb-1">
                            Industrial Systematic
                        </div>
                        <div className="px-2 py-1 bg-[#1A1D23] border border-[#2DD4BF]/30 text-[8.5px] font-['JetBrains_Mono'] font-bold text-[#2DD4BF] text-center uppercase tracking-wider select-none rounded-[3px]">
                            TEMA: INDUSTRIAL
                        </div>
                    </div>
                )}

                {themeConfig.isTechnical && (
                    <div className="p-3 mt-auto border-t-[1.5px] border-[#111113]">
                        <div className="text-[9px] font-['JetBrains_Mono'] font-bold text-[#111113]/70 uppercase tracking-widest mb-1.5">
                            Appearance
                        </div>
                        <div className="px-2.5 py-1.5 bg-[#FFFFFF] border-[1.5px] border-[#111113] text-[10px] font-['JetBrains_Mono'] font-bold text-[#111113] text-center uppercase tracking-wider select-none">
                            TEMA: TECHNICAL
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};
