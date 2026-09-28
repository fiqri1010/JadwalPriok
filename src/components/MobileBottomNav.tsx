import React from 'react';
import {
    Calendar as CalendarIcon,
    Flag,
    Sliders,
    History,
} from 'lucide-react';
import { AppTheme } from '../types';
import { ThemeConfig } from '../themeConfig';

type PageTabType = 'calendar' | 'holiday' | 'settings' | 'version';

interface MobileBottomNavProps {
    pageTab: PageTabType;
    onTabChange: (tab: PageTabType) => void;
    onOpenMobileMenu?: () => void;
    theme: AppTheme;
    themeConfig: ThemeConfig;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
    pageTab,
    onTabChange,
    theme,
    themeConfig,
}) => {
    return (
        <nav
            className={`fixed bottom-0 left-0 right-0 w-full z-50 md:hidden px-1.5 py-1.5 transition-all duration-300 ease-in-out ${
                theme === 'paperSketch'
                    ? 'bg-[#ffffff] border-t-[3px] border-[#2b2b2b] text-[#2b2b2b] shadow-[0_-4px_0px_#2b2b2b] font-[\'Gaegu\'] text-base'
                    : theme === 'winamp'
                    ? 'bg-[#000000] border-t border-[#555555] text-[#00FF00] font-mono shadow-[0_-4px_20px_rgba(0,0,0,0.1)]'
                    : theme === 'dark'
                    ? 'bg-[#18181B]/95 border-t border-[#333333] backdrop-blur-md text-[#E0E0E0] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]'
                    : theme === 'vista'
                    ? 'bg-white/75 border-t border-white/70 backdrop-blur-xl text-[#0F172A] shadow-[0_-4px_25px_rgba(14,116,224,0.15)]'
                    : theme === 'darkFluid'
                    ? 'bg-[#1D1B20]/95 border-t border-white/5 backdrop-blur-md text-[#E6E0E9] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]'
                    : 'bg-white/95 border-t border-slate-200 backdrop-blur-md text-[#011627] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]'
            }`}
        >
            <div className="flex items-center justify-between gap-1 max-w-md mx-auto">
                <button
                    type="button"
                    onClick={() => onTabChange('calendar')}
                    className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 transition-all duration-200 cursor-pointer ${
                        pageTab === 'calendar'
                            ? themeConfig.mobileNavItemActiveClass
                            : themeConfig.mobileNavItemInactiveClass
                    }`}
                >
                    <CalendarIcon className={`h-4 w-4 ${pageTab === 'calendar' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                    <span className="text-[9.5px] mt-0.5 tracking-tight font-bold">Kalender</span>
                </button>

                <button
                    type="button"
                    onClick={() => onTabChange('holiday')}
                    className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 transition-all duration-200 cursor-pointer ${
                        pageTab === 'holiday'
                            ? themeConfig.mobileNavItemActiveClass
                            : themeConfig.mobileNavItemInactiveClass
                    }`}
                >
                    <Flag className={`h-4 w-4 ${pageTab === 'holiday' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                    <span className="text-[9.5px] mt-0.5 tracking-tight font-bold">Libur</span>
                </button>

                <button
                    type="button"
                    onClick={() => onTabChange('settings')}
                    className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 transition-all duration-200 cursor-pointer ${
                        pageTab === 'settings'
                            ? themeConfig.mobileNavItemActiveClass
                            : themeConfig.mobileNavItemInactiveClass
                    }`}
                >
                    <Sliders className={`h-4 w-4 ${pageTab === 'settings' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                    <span className="text-[9.5px] mt-0.5 tracking-tight font-bold">Pengaturan</span>
                </button>

                <button
                    type="button"
                    onClick={() => onTabChange('version')}
                    className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 transition-all duration-200 cursor-pointer ${
                        pageTab === 'version'
                            ? themeConfig.mobileNavItemActiveClass
                            : themeConfig.mobileNavItemInactiveClass
                    }`}
                >
                    <History className={`h-4 w-4 ${pageTab === 'version' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                    <span className="text-[9.5px] mt-0.5 tracking-tight font-bold">Versi</span>
                </button>
            </div>
        </nav>
    );
};
