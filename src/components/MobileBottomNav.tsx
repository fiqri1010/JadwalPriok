import React from 'react';
import {
    Calendar as CalendarIcon,
    Users,
    Flag,
    Sliders,
    History,
    ShieldAlert,
} from 'lucide-react';
import { AppTheme } from '../types';
import { ThemeConfig } from '../themeConfig';
import { getCurrentUserRoleInfo, getCurrentUserPermissions } from '../utils/adminStorage';
import { UserRole } from '../types/admin';

type PageTabType = 'calendar' | 'team-schedule' | 'holiday' | 'settings' | 'version' | 'roadmap' | 'admin' | 'landing';

interface MobileBottomNavProps {
    pageTab: PageTabType;
    onTabChange: (tab: PageTabType) => void;
    onCalendarTabClick?: () => void;
    calendarViewMode?: 'grid' | 'list';
    onOpenMobileMenu?: () => void;
    theme: AppTheme;
    themeConfig: ThemeConfig;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
    pageTab,
    onTabChange,
    onCalendarTabClick,
    calendarViewMode = 'grid',
    theme,
    themeConfig,
}) => {
    const activeUserName = localStorage.getItem('jadwalpriok_user_name') || 'Ahmad Fiqri';
    const activeUserNip = localStorage.getItem('jadwalpriok_user_nip') || '199510102015121002';
    const isSuperAdminAccount = activeUserName === 'Ahmad Fiqri' || activeUserNip === '199510102015121002';
    const roleInfo = isSuperAdminAccount
        ? { role: 'superadmin' as UserRole, authorityName: 'Super Admin' }
        : getCurrentUserRoleInfo();
    const permissions = getCurrentUserPermissions();
    const canAccessAdmin = isSuperAdminAccount || permissions.canAccessAdminDashboard;
    const isPPFNonUser = roleInfo.authorityName === 'PPF non User';
    const canAccessTeamSchedule = isSuperAdminAccount || (!isPPFNonUser);

    return (
        <nav
            className={`fixed bottom-0 left-0 right-0 w-full z-50 md:hidden px-1.5 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] transition-all duration-300 ease-in-out ${
                theme === 'paperSketch'
                    ? 'bg-[#ffffff] border-t-[3px] border-[#2b2b2b] text-[#2b2b2b] shadow-[0_-4px_0px_#2b2b2b] font-[\'Gaegu\'] text-base'
                    : theme === 'winamp'
                    ? 'bg-[#000000] border-t border-[#555555] text-[#00FF00] font-mono shadow-[0_-4px_20px_rgba(0,0,0,0.1)]'
                    : theme === 'dark'
                    ? 'bg-[#18181B]/95 border-t border-[#333333] backdrop-blur-md text-[#E0E0E0] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]'
                    : theme === 'vista'
                    ? 'bg-white/75 border-t border-white/70 backdrop-blur-xl text-[#0F172A] shadow-[0_-4px_25px_rgba(14,116,224,0.15)]'
                    : theme === 'dashboard'
                    ? 'bg-[#FFF6D6] border-t border-[#4D2A00]/30 text-[#4D2A00] font-[\'Inter\'] shadow-none'
                    : 'bg-white/95 border-t border-slate-200 backdrop-blur-md text-[#011627] shadow-[0_-4px_20px_rgba(0,0,0,0.1)]'
            }`}
        >
            <div className="flex items-center justify-between gap-1 max-w-md mx-auto">
                <button
                    type="button"
                    onClick={() => {
                        if (onCalendarTabClick) {
                            onCalendarTabClick();
                        } else {
                            onTabChange('calendar');
                        }
                    }}
                    className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 transition-all duration-200 cursor-pointer relative ${
                        pageTab === 'calendar'
                            ? themeConfig.mobileNavItemActiveClass
                            : themeConfig.mobileNavItemInactiveClass
                    }`}
                >
                    <CalendarIcon className={`h-4 w-4 ${pageTab === 'calendar' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                    <span className="text-[9.5px] mt-0.5 tracking-tight font-bold flex items-center gap-0.5">
                        <span>Kalender</span>
                        {pageTab === 'calendar' && (
                            <span className="text-[8px] opacity-80 uppercase font-mono">({calendarViewMode})</span>
                        )}
                    </span>
                </button>

                {canAccessTeamSchedule && (
                    <button
                        type="button"
                        onClick={() => onTabChange('team-schedule')}
                        className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 transition-all duration-200 cursor-pointer ${
                            pageTab === 'team-schedule'
                                ? themeConfig.mobileNavItemActiveClass
                                : themeConfig.mobileNavItemInactiveClass
                        }`}
                    >
                        <Users className={`h-4 w-4 ${pageTab === 'team-schedule' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                        <span className="text-[9.5px] mt-0.5 tracking-tight font-bold">Rekan</span>
                    </button>
                )}

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

                {canAccessAdmin && (
                    <button
                        type="button"
                        onClick={() => onTabChange('admin')}
                        className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 transition-all duration-200 cursor-pointer ${
                            pageTab === 'admin'
                                ? themeConfig.mobileNavItemActiveClass
                                : themeConfig.mobileNavItemInactiveClass
                        }`}
                    >
                        <ShieldAlert className={`h-4 w-4 ${pageTab === 'admin' ? 'stroke-[2.5]' : 'stroke-2'}`} />
                        <span className="text-[9.5px] mt-0.5 tracking-tight font-bold">Dasbor</span>
                    </button>
                )}
            </div>
        </nav>
    );
};
