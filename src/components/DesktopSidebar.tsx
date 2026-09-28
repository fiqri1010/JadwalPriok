import React from 'react';
import styled from 'styled-components';
import {
    Calendar as CalendarIcon,
    Flag,
    Sliders,
    History,
} from 'lucide-react';
import { ThemeConfig } from '../themeConfig';
import { Tooltip } from './Tooltip';

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
    pageTab: 'calendar' | 'holiday' | 'settings' | 'version';
    setPageTab: (tab: 'calendar' | 'holiday' | 'settings' | 'version') => void;
    themeConfig: ThemeConfig;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
    isOpen,
    pageTab,
    setPageTab,
    themeConfig,
}) => {
    return (
        <aside
            id="desktop-side-menu"
            aria-label="Side Menu"
            className={`hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out select-none relative z-30 ${
                isOpen ? 'w-40 lg:w-44 xl:w-48 p-1.5 lg:p-2.5 opacity-100 overflow-visible' : 'w-0 p-0 border-r-0 opacity-0 pointer-events-none overflow-hidden'
            } ${themeConfig.sidebarClass}`}
        >
            {themeConfig.isPaperSketch && (
                <StyledSidebarWrapper>
                    <div className="container" />
                </StyledSidebarWrapper>
            )}
            {isOpen && (
                <div className="flex flex-col h-full justify-between overflow-visible space-y-3 relative z-10">
                    {/* Top Group: Menu Navigasi Utama */}
                    <nav className="flex flex-col space-y-1">
                        {/* Section Header: Menu Utama */}
                        <div className="px-2.5 pt-0.5 pb-1 text-[9.5px] font-black uppercase tracking-wider opacity-60">
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
                                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold rounded-lg lg:rounded-xl transition-all cursor-pointer ${
                                    pageTab === 'calendar'
                                        ? themeConfig.sidebarItemActiveClass
                                        : themeConfig.sidebarItemInactiveClass
                                }`}
                            >
                                <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate flex-1 text-left">Kalender Kerja</span>
                            </button>
                        </Tooltip>

                        {/* <- Garis Batas -> */}
                        <div className={`my-1.5 ${themeConfig.sidebarDividerClass}`} />

                        {/* Section Header: Pengaturan & Lainnya */}
                        <div className="px-2.5 pt-0.5 pb-1 text-[9.5px] font-black uppercase tracking-wider opacity-60">
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
                                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold rounded-lg lg:rounded-xl transition-all cursor-pointer ${
                                    pageTab === 'holiday'
                                        ? themeConfig.sidebarItemActiveClass
                                        : themeConfig.sidebarItemInactiveClass
                                }`}
                            >
                                <Flag className="h-3.5 w-3.5 text-rose-500 fill-rose-500 shrink-0" />
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
                                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold rounded-lg lg:rounded-xl transition-all cursor-pointer ${
                                    pageTab === 'settings'
                                        ? themeConfig.sidebarItemActiveClass
                                        : themeConfig.sidebarItemInactiveClass
                                }`}
                            >
                                <Sliders className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
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
                                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-bold rounded-lg lg:rounded-xl transition-all cursor-pointer ${
                                    pageTab === 'version'
                                        ? themeConfig.sidebarItemActiveClass
                                        : themeConfig.sidebarItemInactiveClass
                                }`}
                            >
                                <History className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                <span className="truncate flex-1 text-left">Catatan Versi</span>
                            </button>
                        </Tooltip>
                    </nav>
                </div>
            )}
        </aside>
    );
};
