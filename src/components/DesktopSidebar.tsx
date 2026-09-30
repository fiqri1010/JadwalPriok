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
} from 'lucide-react';
import { ThemeConfig } from '../themeConfig';
import { AppTheme } from '../types';
import { Tooltip } from './Tooltip';
import { AppLogo } from './AppLogo';
import { APP_VERSION } from '../version';

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
    pageTab: 'calendar' | 'holiday' | 'settings' | 'version' | 'roadmap' | 'admin';
    setPageTab: (tab: 'calendar' | 'holiday' | 'settings' | 'version' | 'roadmap' | 'admin') => void;
    themeConfig: ThemeConfig;
    currentTheme?: AppTheme;
    isAdmin?: boolean;
    userName?: string;
    userNip?: string;
    userRole?: 'admin' | 'end-user' | 'non-user';
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
    const activeUserName = userName || localStorage.getItem('jadwalpriok_user_name') || 'Petugas Posko Shift';
    const activeUserNip = userNip || localStorage.getItem('jadwalpriok_user_nip') || '199208152015021002';
    const activeRole = userRole || (isAdmin ? 'admin' : 'end-user');

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
                    <div className="flex items-center min-h-[48px] sm:min-h-[52px] px-3.5 lg:px-4 pt-2.5 pb-1 shrink-0">
                        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                            <div className={`${themeConfig.isIndustrial ? 'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-[6px] bg-[#1A1D23] text-[#2DD4BF] border border-[#2DD4BF]/40' : themeConfig.logoContainerClass} shrink-0 self-center`}>
                                <AppLogo className={themeConfig.isIndustrial ? "h-4.5 w-4.5 sm:h-5 sm:w-5 text-[#2DD4BF]" : "h-6 w-6 lg:h-7 lg:w-7"} />
                            </div>
                            <div className="min-w-0 flex flex-col justify-center">
                                {themeConfig.isTechnical && (
                                    <span className="text-[9px] font-['JetBrains_Mono'] font-bold text-[#111113]/70 uppercase tracking-widest leading-none mb-0.5">
                                        v{APP_VERSION}
                                    </span>
                                )}
                                {themeConfig.isEditorial && (
                                    <span className="text-[9px] font-['Geist_Mono'] font-medium text-[#1a1a1a]/60 uppercase tracking-widest leading-none mb-0.5">
                                        v{APP_VERSION}
                                    </span>
                                )}
                                {themeConfig.isIndustrial && (
                                    <span className="text-[9px] font-['JetBrains_Mono'] font-bold text-[#2DD4BF]/80 uppercase tracking-widest leading-none mb-0.5">
                                        v{APP_VERSION}
                                    </span>
                                )}
                                {themeConfig.isDashboard && (
                                    <span className="text-[9px] font-['JetBrains_Mono'] font-bold text-[#297373] uppercase tracking-widest leading-none mb-0.5">
                                        v{APP_VERSION}
                                    </span>
                                )}
                                <h1 className={`${themeConfig.titleClass} font-black leading-tight truncate`}>
                                    JadwalPriok
                                </h1>
                                <p className={`${themeConfig.subtitleClass} leading-tight truncate opacity-75`}>
                                    Kalender Kerja
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Informasi Nama dan NIP Pengguna Aktif (Di bawah Judul & Logo, di atas Menu Utama) - Komponen Statis */}
                    <div className="px-2.5 lg:px-3 pt-1 pb-1.5">
                        <div
                            className={`w-full text-left p-2 rounded-lg border flex items-center space-x-2.5 select-none ${
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
                                    : 'bg-slate-50/90 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-slate-100'
                            }`}
                        >
                            <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-md flex items-center justify-center shrink-0 border ${
                                themeConfig.isIndustrial
                                    ? 'bg-[#0F1115] border-[#2DD4BF]/40 text-[#2DD4BF]'
                                    : themeConfig.isPaperSketch
                                    ? 'bg-[#ffeedd] border border-[#2b2b2b] text-[#2b2b2b]'
                                    : currentTheme === 'winamp'
                                    ? 'bg-zinc-900 border-[#00FF00] text-[#00FF00]'
                                    : 'bg-teal-500/15 border-teal-500/30 text-teal-600 dark:text-teal-400'
                            }`}>
                                {activeRole === 'admin' ? (
                                    <Shield className="w-4 h-4" />
                                ) : (
                                    <User className="w-4 h-4" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1 overflow-hidden">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-black truncate block leading-tight">
                                        {activeUserName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 mt-0.5 opacity-75">
                                    <Fingerprint className="w-3 h-3 shrink-0 text-current/60" />
                                    <span className="text-[10px] lg:text-[10.5px] font-mono font-bold tracking-tight truncate leading-none">
                                        {activeUserNip}
                                    </span>
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

                        {/* 6. Dashboard Administrator (Khusus Admin) */}
                        {isAdmin && (
                            <Tooltip
                                content={<span>Akses <strong>Dashboard Administrator Posko</strong></span>}
                                placement="right"
                                containerClassName="w-full"
                            >
                                <button
                                    type="button"
                                    id="side-menu-admin"
                                    onClick={() => setPageTab('admin')}
                                    className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs lg:text-[13px] xl:text-sm font-bold rounded-[5px] lg:rounded-[7px] transition-all cursor-pointer ${
                                        pageTab === 'admin'
                                            ? 'bg-rose-600 text-white shadow-xs'
                                            : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                                    }`}
                                >
                                    <ShieldAlert className="h-4 w-4 lg:h-[18px] lg:w-[18px] text-rose-500 shrink-0" />
                                    <span className="truncate flex-1 text-left">Dashboard Admin</span>
                                </button>
                            </Tooltip>
                        )}
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
