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
} from 'lucide-react';
import { ThemeConfig } from '../themeConfig';
import { AppTheme } from '../types';
import { UserRole } from '../types/admin';
import { getCurrentUserRoleInfo } from '../utils/adminStorage';
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
    pageTab: 'calendar' | 'holiday' | 'settings' | 'version' | 'roadmap' | 'admin' | 'landing';
    setPageTab: (tab: 'calendar' | 'holiday' | 'settings' | 'version' | 'roadmap' | 'admin' | 'landing') => void;
    themeConfig: ThemeConfig;
    currentTheme?: AppTheme;
    isAdmin?: boolean;
    userName?: string;
    userNip?: string;
    userRole?: UserRole;
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
}) => {
    // Dynamic Fallback from localStorage
    const activeUserName = userName || localStorage.getItem('jadwalpriok_user_name') || 'Ahmad Fiqri';
    const activeUserNip = userNip || localStorage.getItem('jadwalpriok_user_nip') || '199510102015121002';
    const isSuperAdminAccount = activeUserName === 'Ahmad Fiqri' || activeUserNip === '199510102015121002';
    const roleInfo = isSuperAdminAccount
        ? { role: 'superadmin' as UserRole, authorityName: 'Super Admin', badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' }
        : getCurrentUserRoleInfo();
    const activeRole = isSuperAdminAccount ? 'superadmin' : (userRole || roleInfo.role);
    const canAccessAdmin = isSuperAdminAccount || activeRole === 'admin' || activeRole === 'superadmin' || userRole === 'admin' || userRole === 'superadmin' || isAdmin;

    return (
        <aside
            id="desktop-side-menu"
            aria-label="Side Menu"
            className={`hidden md:flex flex-col shrink-0 sidebar-transition select-none relative z-30 overflow-hidden ${
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
                                <h1 className={`${
                                    themeConfig.isIndustrial
                                        ? 'text-[11px] sm:text-xs lg:text-[13px] tracking-tight text-[#E2E8F0] font-[\'Syne\'] uppercase'
                                        : themeConfig.titleClass
                                } font-black leading-tight truncate`}>
                                    JadwalPriok
                                </h1>
                                <p className={`${themeConfig.subtitleClass} leading-tight truncate opacity-75 text-[10px]`}>
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
                                    ? 'bg-[#1A1D23]/90 border-[rgba(226,232,240,0.12)] text-[#E2E8F0]'
                                    : themeConfig.isPaperSketch
                                    ? 'bg-[#ffffff] border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                                    : themeConfig.isTechnical
                                    ? 'bg-[#FFFFFF] dark:bg-[#0D1117] border-[1.5px] border-[#111113] dark:border-slate-700'
                                    : currentTheme === 'winamp'
                                    ? 'bg-black border border-[#00FF00]/60 text-[#00FF00]'
                                    : currentTheme === 'dark'
                                    ? 'bg-[#181818] border-zinc-800 text-slate-100'
                                    : currentTheme === 'dashboard'
                                    ? 'bg-[#FFF0BE] border border-[#4D2A00]/30 text-[#4D2A00] shadow-2xs'
                                    : 'bg-slate-50/90 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-slate-100'
                            }`}
                        >
                            <div className="min-w-0 flex-1 overflow-hidden">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-black truncate block leading-tight" title={activeUserName}>
                                        {formatDisplayName(activeUserName)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 mt-0.5 opacity-75">
                                    <Fingerprint className="w-3 h-3 shrink-0 text-current/60" />
                                    <span className="text-[10px] lg:text-[10.5px] font-mono font-bold tracking-tight truncate leading-none">
                                        {activeUserNip}
                                    </span>
                                </div>
                                {/* Baris Bawah: Indikator Role di Kiri & Tombol Dashboard di Sudut Kanan Bawah Sejajar */}
                                <div className="mt-2 pt-1.5 border-t border-current/10 flex items-center justify-between gap-1 w-full min-w-0">
                                    <span
                                        className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-tight border truncate min-w-0 max-w-[55%] sidebar-user-badge ${
                                            themeConfig.isPaperSketch ? 'text-[7.5px] px-1 py-0 leading-tight border-[#2b2b2b]' : ''
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
                                                className={`inline-flex items-center justify-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded font-mono uppercase tracking-tight transition-all cursor-pointer border shrink-0 whitespace-nowrap sidebar-admin-btn ${
                                                    themeConfig.isPaperSketch ? 'text-[8px] px-1.5 py-0.5 leading-tight border-[#2b2b2b]' : ''
                                                } ${
                                                    pageTab === 'admin'
                                                        ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                                                        : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/25'
                                                }`}
                                                title="Buka Dashboard Administrator"
                                            >
                                                <ShieldAlert className={`w-2.5 h-2.5 shrink-0 ${pageTab === 'admin' ? 'text-white' : 'text-rose-500'}`} />
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
                            content={<span>Lihat <strong>Kalender Kerja & Shift</strong></span>}
                            placement="right"
                            containerClassName="w-full"
                        >
                            <button
                                type="button"
                                id="side-menu-kalender"
                                onClick={() => setPageTab('calendar')}
                                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs lg:text-[13px] xl:text-sm font-bold rounded-[5px] lg:rounded-[7px] transition-all cursor-pointer ${
                                    pageTab === 'calendar'
                                        ? themeConfig.sidebarItemActiveClass
                                        : themeConfig.sidebarItemInactiveClass
                                }`}
                            >
                                <CalendarIcon className="h-4 w-4 lg:h-[18px] lg:w-[18px] shrink-0" />
                                <span className="truncate flex-1 text-left">Kalender Kerja</span>
                            </button>
                        </Tooltip>

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
