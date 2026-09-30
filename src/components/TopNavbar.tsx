import React from 'react';
import {
    Palette,
    Sun,
    Moon,
    Droplets,
    Sparkles,
    Radio,
    PenLine,
    Terminal,
    BookOpen,
    Cpu,
    LayoutDashboard,
    Check,
} from 'lucide-react';
import { AppLogo } from './AppLogo';
import { AppTheme } from '../types';
import { ThemeConfig } from '../themeConfig';
import { HamburgerMenuButton } from './HamburgerMenuButton';
import { Tooltip } from './Tooltip';

interface TopNavbarProps {
    isMobile: boolean;
    isDesktopSidebarOpen: boolean;
    onToggleDesktopSidebar: () => void;
    currentTheme: AppTheme;
    onThemeChange: (theme: AppTheme) => void;
    isThemeDropdownOpen: boolean;
    setIsThemeDropdownOpen: (open: boolean) => void;
    themeConfig: ThemeConfig;
    onOpenMobileMenu?: () => void;
    exportAction?: React.ReactNode;
    pageTab?: 'calendar' | 'holiday' | 'settings' | 'version' | 'roadmap' | 'admin' | 'landing';
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
    isMobile,
    isDesktopSidebarOpen,
    onToggleDesktopSidebar,
    currentTheme,
    onThemeChange,
    isThemeDropdownOpen,
    setIsThemeDropdownOpen,
    themeConfig,
    onOpenMobileMenu,
    exportAction,
    pageTab = 'calendar',
}) => {
    const handleToggle = () => {
        if (isMobile && onOpenMobileMenu) {
            onOpenMobileMenu();
        } else {
            onToggleDesktopSidebar();
        }
    };

    const getThemeDisplayName = (theme: AppTheme) => {
        switch (theme) {
            case 'default': return 'Terang';
            case 'dark': return 'Gelap';
            case 'vista': return 'Old Windows';
            case 'paperSketch': return 'PaperSketch';
            case 'winamp': return 'Winamp';
            case 'dashboard': return 'Warm';
            case 'editorial': return 'Editorial';
            case 'industrial': return 'Industrial';
            case 'technical': return 'Technical';
            default: return theme;
        }
    };

    return (
        <header className={`${themeConfig.navbarClass} min-h-[40px] sm:min-h-[44px] flex items-center`}>
            <div className="flex items-center justify-between py-1 sm:py-1.5 px-2.5 sm:px-4 md:px-5 w-full">
                <div className="flex items-center min-w-0">
                    {/* Tombol Hamburger di Header (Desktop) - Selalu ada di Header dan bertransisi menjadi X saat Sidebar Terbuka */}
                    {!isMobile && (
                        <HamburgerMenuButton
                            id="top-navbar-toggle-btn"
                            isOpen={isDesktopSidebarOpen}
                            onToggle={handleToggle}
                            theme={currentTheme}
                            className="hidden md:flex shrink-0 self-center mr-3.5"
                            title={isDesktopSidebarOpen ? 'Sembunyikan Menu Samping' : 'Tampilkan Menu Samping'}
                        />
                    )}

                    {/* Logo & App Title: Tampil di Navbar pada mode Mobile atau saat Desktop Sidebar tertutup dengan jarak tepat 16px dari hamburger */}
                    {(isMobile || !isDesktopSidebarOpen) && (
                        <div className="flex items-center space-x-2 min-w-0 transition-opacity duration-200 animate-in fade-in">
                            <div className={`${themeConfig.logoContainerClass} shrink-0 self-center`}>
                                <AppLogo className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            <div className="min-w-0 flex flex-col justify-center">
                                <h1 className={`${themeConfig.titleClass} ${themeConfig.isIndustrial ? '' : 'text-xs sm:text-[13px] lg:text-[14px]'} font-black leading-tight truncate`}>
                                    JadwalPriok
                                </h1>
                                <p className={`${themeConfig.subtitleClass} hidden sm:block text-[10px] lg:text-[11px] leading-tight truncate`}>
                                    Kalender Kerja & Jadwal Shift
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Ketika Desktop Sidebar Terbuka: Tampilkan nama halaman / breadcrumb aktif di samping tombol X */}
                    {!isMobile && isDesktopSidebarOpen && (
                        <div className="flex items-center space-x-2 text-[11px] lg:text-xs font-bold select-none truncate transition-opacity duration-200 animate-in fade-in">
                            <span className="opacity-45 hidden lg:inline">Workspace</span>
                            <span className="opacity-30 hidden lg:inline">/</span>
                            <span className="opacity-90 font-extrabold tracking-tight truncate">
                                {pageTab === 'calendar' && 'Kalender Kerja & Shift'}
                                {pageTab === 'holiday' && 'Daftar Libur Nasional & Cuti'}
                                {pageTab === 'settings' && 'Pengaturan Aplikasi'}
                                {pageTab === 'version' && 'Catatan Riwayat Versi'}
                                {pageTab === 'roadmap' && 'Rencana Fitur & Roadmap'}
                                {pageTab === 'admin' && 'Dashboard Administrator'}
                                {pageTab === 'landing' && 'Landing Page & Otentikasi NIP'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Top Actions: Export Button (to the left of Theme Selector) & Theme Selector */}
                <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0 relative z-30">
                    {exportAction && (
                        <div className="flex items-center relative">
                            {exportAction}
                        </div>
                    )}

                    <div className="relative">
                        <Tooltip
                            content={<span><strong>Pilih Tema</strong> Tampilan</span>}
                            placement="bottom"
                        >
                            <button
                                type="button"
                                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                                className={themeConfig.themeDropdownBtnClass}
                                aria-label="Pilih Tema Tampilan"
                            >
                                <Palette className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-current opacity-90" />
                                <span className="hidden sm:inline text-[11px] sm:text-xs font-bold">{getThemeDisplayName(currentTheme)}</span>
                            </button>
                        </Tooltip>

                        {/* Dropdown Popup */}
                        {isThemeDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-50"
                                    onClick={() => setIsThemeDropdownOpen(false)}
                                />
                                <div className={themeConfig.themeDropdownMenuClass}>
                                    {/* 1. Kelompok Tema Final Release */}
                                    <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-black uppercase tracking-wider opacity-60 border-b border-current/10 mb-1">
                                        Tema Final Release
                                    </div>

                                    {/* Terang */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onThemeChange('default');
                                            setIsThemeDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] text-xs font-bold transition-all duration-300 cursor-pointer ${
                                            currentTheme === 'default'
                                                ? 'bg-[#2EC4B6]/20 text-[#2EC4B6]'
                                                : currentTheme === 'industrial' || currentTheme === 'dark' || currentTheme === 'winamp'
                                                ? 'text-slate-100 hover:bg-white/10'
                                                : 'text-slate-800 hover:bg-black/5'
                                        }`}
                                    >
                                        <span className="flex items-center space-x-2">
                                            <Sun className="h-4 w-4 text-amber-500" />
                                            <span>Terang</span>
                                        </span>
                                        {currentTheme === 'default' && <Check className="h-3.5 w-3.5" />}
                                    </button>

                                    {/* Gelap */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onThemeChange('dark');
                                            setIsThemeDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] text-xs font-bold transition-all duration-300 cursor-pointer ${
                                            currentTheme === 'dark'
                                                ? 'bg-slate-700 text-white'
                                                : currentTheme === 'industrial' || currentTheme === 'winamp'
                                                ? 'text-slate-100 hover:bg-white/10'
                                                : 'text-slate-800 hover:bg-black/5'
                                        }`}
                                    >
                                        <span className="flex items-center space-x-2">
                                            <Moon className="h-4 w-4 text-indigo-400" />
                                            <span>Gelap</span>
                                        </span>
                                        {currentTheme === 'dark' && <Check className="h-3.5 w-3.5" />}
                                    </button>

                                    {/* Old Windows */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onThemeChange('vista');
                                            setIsThemeDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] text-xs font-bold transition-all duration-300 cursor-pointer ${
                                            currentTheme === 'vista'
                                                ? 'bg-sky-100 text-sky-900 font-extrabold border border-sky-300'
                                                : currentTheme === 'industrial' || currentTheme === 'dark' || currentTheme === 'winamp'
                                                ? 'text-slate-100 hover:bg-white/10'
                                                : 'text-slate-800 hover:bg-black/5'
                                        }`}
                                    >
                                        <span className="flex items-center space-x-2">
                                            <Sparkles className="h-4 w-4 text-sky-500" />
                                            <span>Old Windows</span>
                                        </span>
                                        {currentTheme === 'vista' && <Check className="h-3.5 w-3.5" />}
                                    </button>

                                    {/* PaperSketch */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onThemeChange('paperSketch');
                                            setIsThemeDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                                            currentTheme === 'paperSketch'
                                                ? 'bg-[#ff4747] text-white shadow-[2px_2px_0px_#2b2b2b] border border-[#2b2b2b]'
                                                : currentTheme === 'industrial' || currentTheme === 'dark' || currentTheme === 'winamp'
                                                ? 'text-slate-100 hover:bg-white/10'
                                                : 'text-slate-800 hover:bg-[#2ec4b6]/20'
                                        }`}
                                    >
                                        <span className="flex items-center space-x-2">
                                            <PenLine className="h-4 w-4 text-[#ff4747]" />
                                            <span className="font-['Gaegu'] text-sm font-bold">PaperSketch</span>
                                        </span>
                                        {currentTheme === 'paperSketch' && <Check className="h-3.5 w-3.5" />}
                                    </button>

                                    {/* Winamp */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onThemeChange('winamp');
                                            setIsThemeDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-none text-xs font-bold font-mono transition-all duration-300 cursor-pointer ${
                                            currentTheme === 'winamp'
                                                ? 'bg-[#000000] text-[#00FF00] border border-[#00FF00]'
                                                : currentTheme === 'industrial' || currentTheme === 'dark'
                                                ? 'text-slate-100 hover:bg-white/10'
                                                : 'hover:bg-[#00FF00]/10 text-slate-800 dark:text-slate-100'
                                        }`}
                                    >
                                        <span className="flex items-center space-x-2">
                                            <Radio className="h-4 w-4 text-emerald-400" />
                                            <span>Winamp</span>
                                        </span>
                                        {currentTheme === 'winamp' && <Check className="h-3.5 w-3.5" />}
                                    </button>

                                    {/* Warm */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onThemeChange('dashboard');
                                            setIsThemeDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-none text-xs font-bold font-['Inter'] transition-all duration-150 cursor-pointer ${
                                            currentTheme === 'dashboard'
                                                ? 'bg-[#4D2A00] text-[#F9E6A8]'
                                                : currentTheme === 'industrial' || currentTheme === 'dark' || currentTheme === 'winamp'
                                                ? 'text-slate-100 hover:bg-white/10'
                                                : 'text-[#4D2A00] hover:bg-[#4D2A00]/10'
                                        }`}
                                    >
                                        <span className="flex items-center space-x-2">
                                            <LayoutDashboard className="h-4 w-4 text-[#4D2A00] group-hover:text-inherit" />
                                            <span>Warm</span>
                                        </span>
                                        {currentTheme === 'dashboard' && <Check className="h-3.5 w-3.5" />}
                                    </button>

                                    {/* 2. Kelompok Tema dalam Pengembangan */}
                                    <div className="px-2.5 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider opacity-60 border-t border-b border-current/10 mt-2 mb-1 flex items-center justify-between">
                                        <span>Tema dalam Pengembangan</span>
                                        <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.2 rounded font-bold">BETA</span>
                                    </div>

                                    {/* Editorial */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onThemeChange('editorial');
                                            setIsThemeDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[4px] text-xs font-medium font-['Geist_Mono'] uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                                            currentTheme === 'editorial'
                                                ? 'bg-[#2a7373] text-white'
                                                : currentTheme === 'industrial' || currentTheme === 'dark' || currentTheme === 'winamp'
                                                ? 'text-slate-100 hover:bg-white/10'
                                                : 'text-[#1a1a1a] hover:bg-[#1a1a1a]/[0.05]'
                                        }`}
                                    >
                                        <span className="flex items-center space-x-2">
                                            <BookOpen className="h-4 w-4 text-[#2a7373]" />
                                            <span className="font-['Cormorant_Garamond'] italic capitalize text-sm font-semibold">Editorial</span>
                                        </span>
                                        {currentTheme === 'editorial' && <Check className="h-3.5 w-3.5" />}
                                    </button>

                                    {/* Industrial */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onThemeChange('industrial');
                                            setIsThemeDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[4px] text-xs font-bold font-['JetBrains_Mono'] uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                                            currentTheme === 'industrial'
                                                ? 'bg-[#1A1D23] text-[#2DD4BF] border border-[#2DD4BF]/40'
                                                : currentTheme === 'dark' || currentTheme === 'winamp'
                                                ? 'text-slate-100 hover:bg-white/10'
                                                : 'text-slate-800 hover:bg-black/5'
                                        }`}
                                    >
                                        <span className="flex items-center space-x-2">
                                            <Cpu className="h-4 w-4 text-[#2DD4BF]" />
                                            <span className="font-['Syne'] font-extrabold normal-case">Industrial</span>
                                        </span>
                                        {currentTheme === 'industrial' && <Check className="h-3.5 w-3.5 text-[#2DD4BF]" />}
                                    </button>

                                    {/* Technical */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onThemeChange('technical');
                                            setIsThemeDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[4px] text-xs font-bold font-['JetBrains_Mono'] uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                                            currentTheme === 'technical'
                                                ? 'bg-[#0D9488] text-white'
                                                : currentTheme === 'industrial' || currentTheme === 'dark' || currentTheme === 'winamp'
                                                ? 'text-slate-100 hover:bg-white/10'
                                                : 'text-[#111113] hover:bg-black/5'
                                        }`}
                                    >
                                        <span className="flex items-center space-x-2">
                                            <Terminal className="h-4 w-4 text-[#0D9488]" />
                                            <span>Technical</span>
                                        </span>
                                        {currentTheme === 'technical' && <Check className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
