import React from 'react';
import {
    Palette,
    Sun,
    Moon,
    Droplets,
    Sparkles,
    Radio,
    PenLine,
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
}) => {
    const handleToggle = () => {
        if (isMobile && onOpenMobileMenu) {
            onOpenMobileMenu();
        } else {
            onToggleDesktopSidebar();
        }
    };

    const getThemeIcon = (theme: AppTheme) => {
        switch (theme) {
            case 'paperSketch':
                return <PenLine className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#ff4747]" />;
            case 'dark':
                return <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-400" />;
            case 'darkFluid':
                return <Droplets className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#D0BCFF]" />;
            case 'vista':
                return <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sky-400" />;
            case 'winamp':
                return <Radio className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#00FF00]" />;
            case 'default':
            default:
                return <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />;
        }
    };

    return (
        <header className={themeConfig.navbarClass}>
            <div className="flex items-center justify-between py-1.5 sm:py-2 px-2.5 sm:px-4 md:px-6 w-full">
                <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0">
                    {/* Hamburger Menu Button (Uiverse Cevorob & Winamp Switch) - Hidden on mobile view */}
                    {!isMobile && (
                        <HamburgerMenuButton
                            isOpen={isDesktopSidebarOpen}
                            onToggle={handleToggle}
                            theme={currentTheme}
                            className="hidden md:flex shrink-0 mr-3.5 sm:mr-4 self-center"
                            title={isDesktopSidebarOpen ? 'Sembunyikan Menu Samping' : 'Tampilkan Menu Samping'}
                        />
                    )}
                    <div className={`${themeConfig.logoContainerClass} shrink-0 self-center`}>
                        <AppLogo className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                        <h1 className={`${themeConfig.titleClass} leading-tight`}>JadwalPriok</h1>
                        <p className={`${themeConfig.subtitleClass} hidden sm:block leading-normal`}>
                            Kalender Kerja & Jadwal Shift
                        </p>
                    </div>
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
                                <Palette className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-current opacity-90" />
                                <span className="hidden sm:inline text-xs font-bold capitalize">{currentTheme}</span>
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
                                    <div className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider opacity-60">
                                        Pilihan Tema Tampilan
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onThemeChange('default');
                                            setIsThemeDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] text-xs font-bold transition-all duration-300 cursor-pointer ${
                                            currentTheme === 'default'
                                                ? 'bg-[#2EC4B6]/20 text-[#2EC4B6]'
                                                : 'hover:bg-black/5 dark:hover:bg-white/10'
                                        }`}
                                    >
                                        <span className="flex items-center space-x-2">
                                            <Sun className="h-4 w-4 text-amber-500" />
                                            <span>Default</span>
                                        </span>
                                        {currentTheme === 'default' && <Check className="h-3.5 w-3.5" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onThemeChange('dark');
                                            setIsThemeDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] text-xs font-bold transition-all duration-300 cursor-pointer ${
                                            currentTheme === 'dark'
                                                ? 'bg-slate-700 text-white'
                                                : 'hover:bg-black/5 dark:hover:bg-white/10'
                                        }`}
                                    >
                                        <span className="flex items-center space-x-2">
                                            <Moon className="h-4 w-4 text-indigo-400" />
                                            <span>Dark Mode</span>
                                        </span>
                                        {currentTheme === 'dark' && <Check className="h-3.5 w-3.5" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onThemeChange('darkFluid');
                                            setIsThemeDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] text-xs font-bold transition-all duration-300 ease-in-out cursor-pointer ${
                                            currentTheme === 'darkFluid'
                                                ? 'bg-[#D0BCFF]/20 text-[#D0BCFF]'
                                                : 'hover:bg-black/5 dark:hover:bg-white/10'
                                        }`}
                                    >
                                        <span className="flex items-center space-x-2">
                                            <Droplets className="h-4 w-4 text-[#D0BCFF]" />
                                            <span>Dark Fluid</span>
                                        </span>
                                        {currentTheme === 'darkFluid' && <Check className="h-3.5 w-3.5" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onThemeChange('vista');
                                            setIsThemeDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[5px] text-xs font-bold transition-all duration-300 cursor-pointer ${
                                            currentTheme === 'vista'
                                                ? 'bg-sky-100 text-sky-800'
                                                : 'hover:bg-black/5 dark:hover:bg-white/10'
                                        }`}
                                    >
                                        <span className="flex items-center space-x-2">
                                            <Sparkles className="h-4 w-4 text-sky-500" />
                                            <span>Vista</span>
                                        </span>
                                        {currentTheme === 'vista' && <Check className="h-3.5 w-3.5" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onThemeChange('paperSketch');
                                            setIsThemeDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                                            currentTheme === 'paperSketch'
                                                ? 'bg-[#ff4747] text-white shadow-[2px_2px_0px_#2b2b2b] border border-[#2b2b2b]'
                                                : 'hover:bg-[#2ec4b6]/20 text-[#2b2b2b]'
                                        }`}
                                    >
                                        <span className="flex items-center space-x-2">
                                            <PenLine className="h-4 w-4 text-[#ff4747]" />
                                            <span className="font-['Gaegu'] text-sm font-bold">Paper Sketch (Var. 5)</span>
                                        </span>
                                        {currentTheme === 'paperSketch' && <Check className="h-3.5 w-3.5" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onThemeChange('winamp');
                                            setIsThemeDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-none text-xs font-bold font-mono transition-all duration-300 cursor-pointer ${
                                            currentTheme === 'winamp'
                                                ? 'bg-[#000000] text-[#00FF00] border border-[#00FF00]'
                                                : 'hover:bg-[#00FF00]/10 text-[#00FF00]'
                                        }`}
                                    >
                                        <span className="flex items-center space-x-2">
                                            <Radio className="h-4 w-4 text-emerald-400" />
                                            <span>Winamp</span>
                                        </span>
                                        {currentTheme === 'winamp' && <Check className="h-3.5 w-3.5" />}
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
