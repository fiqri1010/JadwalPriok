import { AppTheme } from './types';

export interface PenugasanColors {
    ST_PERIKSA_FISIK_LUAR_KAWASAN: string;
    ST_ATA_CARNET: string;
    ST_LAINNYA: string;
}

export const penugasanColors: PenugasanColors = {
    ST_PERIKSA_FISIK_LUAR_KAWASAN: '#6366F1', // Indigo
    ST_ATA_CARNET: '#F59E0B',                 // Amber
    ST_LAINNYA: '#14B8A6',                    // Teal
};

export interface ThemePalette {
    name: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    status: {
        piket: string;
        off: string;
        cuti: string;
        penugasan: string;
    };
    penugasanColors: PenugasanColors;
}

export const themes: Record<'light' | 'dark' | 'paperSketch' | 'technical' | 'editorial' | 'industrial' | 'dashboard', ThemePalette> = {
    light: {
        name: 'Default Light',
        background: '#F6F7F8',
        surface: '#FFFFFF',
        text: '#011627',
        textSecondary: '#64748B',
        primary: '#20A4F3',
        status: {
            piket: '#2EC4B6',
            off: '#BE1A1A',
            cuti: '#0B0909',
            penugasan: '#F59E0B',
        },
        penugasanColors: {
            ST_PERIKSA_FISIK_LUAR_KAWASAN: '#6366F1', // Indigo
            ST_ATA_CARNET: '#F59E0B',                 // Amber
            ST_LAINNYA: '#14B8A6',                    // Teal
        },
    },
    dark: {
        name: 'Dark Mode',
        background: '#121212',
        surface: '#1E1E1E',
        text: '#E0E0E0',
        textSecondary: '#94A3B8',
        primary: '#2563EB',
        status: {
            piket: '#3B82F6',
            off: '#EF4444',
            cuti: '#8B5CF6',
            penugasan: '#F59E0B',
        },
        penugasanColors: {
            ST_PERIKSA_FISIK_LUAR_KAWASAN: '#6366F1', // Indigo
            ST_ATA_CARNET: '#F59E0B',                 // Amber
            ST_LAINNYA: '#14B8A6',                    // Teal
        },
    },
    paperSketch: {
        name: 'Paper Sketch',
        background: '#f2efeb',
        surface: '#ffffff',
        text: '#2b2b2b',
        textSecondary: '#555555',
        primary: '#ff4747',
        status: {
            piket: '#2ec4b6',
            off: '#ff4747',
            cuti: '#2b2b2b',
            penugasan: '#f59e0b',
        },
        penugasanColors: {
            ST_PERIKSA_FISIK_LUAR_KAWASAN: '#6366f1',
            ST_ATA_CARNET: '#f59e0b',
            ST_LAINNYA: '#2ec4b6',
        },
    },
    technical: {
        name: 'Systematic Technical',
        background: '#F8F7F4',
        surface: '#FFFFFF',
        text: '#111113',
        textSecondary: 'rgba(17, 17, 19, 0.6)',
        primary: '#0D9488',
        status: {
            piket: '#0D9488',
            off: '#BE1A1A',
            cuti: '#111113',
            penugasan: '#E29578',
        },
        penugasanColors: {
            ST_PERIKSA_FISIK_LUAR_KAWASAN: '#0D9488',
            ST_ATA_CARNET: '#E29578',
            ST_LAINNYA: '#111113',
        },
    },
    editorial: {
        name: 'Editorial Clarity',
        background: '#fcfbf9',
        surface: '#ffffff',
        text: '#1a1a1a',
        textSecondary: 'rgba(26, 26, 26, 0.6)',
        primary: '#2a7373',
        status: {
            piket: '#2a7373',
            off: '#cc3333',
            cuti: '#1a1a1a',
            penugasan: '#b87333',
        },
        penugasanColors: {
            ST_PERIKSA_FISIK_LUAR_KAWASAN: '#2a7373',
            ST_ATA_CARNET: '#b87333',
            ST_LAINNYA: '#555555',
        },
    },
    industrial: {
        name: 'Industrial Systematic',
        background: '#0F1115',
        surface: '#1A1D23',
        text: '#E2E8F0',
        textSecondary: 'rgba(226, 232, 240, 0.6)',
        primary: '#2DD4BF',
        status: {
            piket: '#2DD4BF',
            off: '#BE1A1A',
            cuti: '#1A1D23',
            penugasan: '#F59E0B',
        },
        penugasanColors: {
            ST_PERIKSA_FISIK_LUAR_KAWASAN: '#2DD4BF',
            ST_ATA_CARNET: '#F59E0B',
            ST_LAINNYA: '#83C5BE',
        },
    },
    dashboard: {
        name: 'Clean SaaS Dashboard',
        background: '#F6F7F8',
        surface: '#FFFFFF',
        text: '#011627',
        textSecondary: 'rgba(1, 22, 39, 0.6)',
        primary: '#297373',
        status: {
            piket: '#297373',
            off: '#BE1A1A',
            cuti: '#011627',
            penugasan: '#E29578',
        },
        penugasanColors: {
            ST_PERIKSA_FISIK_LUAR_KAWASAN: '#297373',
            ST_ATA_CARNET: '#E29578',
            ST_LAINNYA: '#83C5BE',
        },
    },
};

export interface ThemeConfig {
    theme: AppTheme;
    isDefault: boolean;
    isDark: boolean;
    isVista: boolean;
    isWinamp: boolean;
    isPaperSketch: boolean;
    isTechnical: boolean;
    isEditorial: boolean;
    isIndustrial: boolean;
    isDashboard: boolean;

    // Palet warna & warna penugasan
    palette?: ThemePalette;
    penugasanColors: PenugasanColors;

    // 1. Kanvas Utama (App Wrapper)
    wrapperClass: string;

    // 2. Top Header / Navbar
    navbarClass: string;
    logoContainerClass: string;
    titleClass: string;
    versionBadgeClass: string;
    subtitleClass: string;
    supabaseBadgeClass: string;
    holidayBtnClass: string;
    themeDropdownBtnClass: string;
    themeDropdownMenuClass: string;
    settingsBtnClass: string;
    syncBtnClass: string;
    saveBtnClass: string;

    // 3. View Switcher (Tab Navigasi) & Navigasi Bulan
    viewSwitcherCardClass: string;
    viewSwitcherPillsWrapperClass: string;
    tabActiveClass: string;
    tabInactiveClass: string;
    monthNavBtnClass: string;
    monthDisplayBtnClass: string;
    todayBtnClass: string;

    // 4. Sub-toolbar Aksi Kalender
    subToolbarCardClass: string;
    subToolbarTitleClass: string;
    subToolbarDotClass: string;
    pasteBtnClass: string;
    undoBtnClass: string;
    resetBtnClass: string;
    lockBtnClass: string;
    expandBtnClass: string;

    // 5. Area Grid Kalender
    calendarContainerCardClass: string;
    dayNamesHeaderClass: string;
    weekdayNameTextClass: string;
    weekendNameTextClass: string;
    emptyCellClass: string;

    // 6. Summary Cards Panel
    summaryPanelCardClass: string;
    summaryTitleClass: string;
    summaryHeaderBorderClass: string;
    summarySubtextClass: string;

    // 7. Modal & Pop-up
    modalCardClass: string;
    modalHeaderClass: string;
    modalTitleClass: string;
    modalBodyClass: string;

    // 8. Mobile Drawer & FAB
    mobileFabClass: string;
    mobileDrawerClass: string;
    mobileDrawerHeaderClass: string;
    mobileDrawerTitleClass: string;
    mobileDrawerSubtextClass: string;
    mobileDrawerNavBtnActive: string;
    mobileDrawerNavBtnInactive: string;
    mobileNavItemActiveClass: string;
    mobileNavItemInactiveClass: string;

    // 9. Desktop Left Side Menu
    sidebarClass: string;
    sidebarItemActiveClass: string;
    sidebarItemInactiveClass: string;
    sidebarDividerClass: string;
}

export function getThemeConfig(theme: AppTheme): ThemeConfig {
    const isDefault = theme === 'default';
    const isDark = theme === 'dark';
    const isVista = theme === 'vista';
    const isWinamp = theme === 'winamp';
    const isPaperSketch = theme === 'paperSketch';
    const isTechnical = theme === 'technical';
    const isEditorial = theme === 'editorial';
    const isIndustrial = theme === 'industrial';
    const isDashboard = theme === 'dashboard';

    if (isDashboard) {
        return {
            theme,
            isDefault: false,
            isDark: false,
            isVista: false,
            isWinamp: false,
            isPaperSketch: false,
            isTechnical: false,
            isEditorial: false,
            isIndustrial: false,
            isDashboard: true,
            palette: themes.dashboard,
            penugasanColors: themes.dashboard.penugasanColors,

            // 1. Kanvas Utama (Clean SaaS Dashboard: #F6F7F8 bg, #011627 ink, Inter font)
            wrapperClass: 'min-h-screen min-h-[100dvh] w-full bg-[#F6F7F8] text-[#011627] flex flex-col font-[\'Inter\'] relative selection:bg-[#297373] selection:text-white md:h-screen md:max-h-screen md:overflow-hidden',

            // 2. Top Header / Navbar (Clean white 64px, subtle border)
            navbarClass: 'sticky top-0 z-50 bg-[#FFFFFF] text-[#011627] border-b border-[rgba(1,22,39,0.08)] shadow-none shrink-0 font-[\'Inter\']',
            logoContainerClass: 'flex h-8 w-8 items-center justify-center bg-[#297373] text-white rounded-[8px] shrink-0 shadow-2xs',
            titleClass: 'text-xs sm:text-[13px] lg:text-[14px] font-extrabold tracking-tight truncate text-[#011627] font-[\'Inter\']',
            versionBadgeClass: 'bg-[#F1F5F9] text-[#011627]/70 border border-[rgba(1,22,39,0.08)] text-[9px] sm:text-[10px] px-2 py-0.5 rounded-[6px] font-[\'JetBrains_Mono\'] font-medium uppercase tracking-wider',
            subtitleClass: 'hidden sm:block text-[11px] text-[#011627]/60 font-[\'JetBrains_Mono\'] tracking-wider uppercase',
            supabaseBadgeClass: 'hidden lg:flex items-center space-x-1.5 bg-[#FFFFFF] px-2.5 py-1 text-xs border border-[rgba(1,22,39,0.08)] text-[#011627] font-[\'JetBrains_Mono\'] uppercase tracking-wider rounded-[6px]',
            holidayBtnClass: 'flex items-center space-x-1.5 bg-[#BE1A1A] hover:bg-[#a51515] px-3 py-1.5 text-xs font-bold text-white transition-all cursor-pointer border border-[#BE1A1A]/30 font-[\'Inter\'] rounded-[6px]',
            themeDropdownBtnClass: 'h-8 sm:h-9 flex items-center justify-center gap-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] px-3 text-xs font-bold text-[#011627] transition-all duration-150 cursor-pointer border border-[rgba(1,22,39,0.08)] select-none font-[\'Inter\'] rounded-[6px] shadow-none',
            themeDropdownMenuClass: 'absolute right-[-3rem] sm:right-0 mt-1.5 z-50 w-64 bg-[#FFFFFF] p-2 flex flex-col gap-1 text-[#011627] border border-[rgba(1,22,39,0.08)] shadow-xl animate-in fade-in zoom-in-95 duration-150 font-[\'Inter\'] rounded-[8px]',
            settingsBtnClass: 'flex items-center justify-center space-x-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] px-2.5 py-1.5 text-xs font-bold text-[#011627] transition-all cursor-pointer border border-[rgba(1,22,39,0.08)] font-[\'Inter\'] rounded-[6px]',
            syncBtnClass: 'flex items-center justify-center space-x-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] px-2.5 py-1.5 text-xs font-bold text-[#011627] transition-all cursor-pointer border border-[rgba(1,22,39,0.08)] font-[\'Inter\'] rounded-[6px]',
            saveBtnClass: 'flex items-center justify-center space-x-1.5 bg-[#297373] hover:bg-[#236060] text-white px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer border border-[#297373] font-[\'Inter\'] rounded-[6px]',

            // 3. View Switcher & Navigasi Bulan
            viewSwitcherCardClass: 'flex flex-col md:flex-row md:items-center justify-between gap-1.5 sm:gap-2 bg-[#FFFFFF] p-2 border border-[rgba(1,22,39,0.08)] font-[\'Inter\'] rounded-[8px]',
            viewSwitcherPillsWrapperClass: 'flex flex-row flex-nowrap items-center overflow-x-auto no-scrollbar scroll-smooth p-1 gap-1 bg-[#F6F7F8] border border-[rgba(1,22,39,0.08)] max-w-full min-w-0 shrink flex-1 rounded-[6px]',
            tabActiveClass: 'bg-[#297373] text-white font-bold border border-[#297373] font-[\'Inter\'] text-xs rounded-[6px] shadow-2xs',
            tabInactiveClass: 'text-[#011627]/60 hover:text-[#011627] hover:bg-black/5 transition-colors duration-150 font-[\'Inter\'] text-xs rounded-[6px]',
            monthNavBtnClass: 'border border-[rgba(1,22,39,0.08)] bg-[#F1F5F9] p-1.5 sm:p-2 text-[#011627] hover:bg-[#E2E8F0] transition-colors cursor-pointer shrink-0 rounded-[6px]',
            monthDisplayBtnClass: 'flex items-center justify-center space-x-1.5 sm:space-x-2 border border-[rgba(1,22,39,0.08)] bg-[#FFFFFF] hover:bg-[#F6F7F8] px-3 py-1 text-sm sm:text-base font-extrabold text-[#011627] transition-all cursor-pointer w-[150px] sm:w-[176px] shrink-0 font-[\'Inter\'] tracking-tight rounded-[6px]',
            todayBtnClass: 'flex items-center space-x-1 border border-[#297373]/30 bg-[#297373]/10 hover:bg-[#297373]/20 text-[#297373] px-2.5 py-1 text-xs font-bold transition-all cursor-pointer shrink-0 font-[\'Inter\'] rounded-[6px]',

            // 4. Sub-toolbar Aksi Kalender
            subToolbarCardClass: 'flex items-center justify-between bg-[#FFFFFF] p-2 border border-[rgba(1,22,39,0.08)] gap-2 font-[\'Inter\'] rounded-[8px]',
            subToolbarTitleClass: 'text-sm font-bold text-[#011627] truncate font-[\'Inter\'] tracking-tight',
            subToolbarDotClass: 'flex h-2 w-2 rounded-full bg-[#297373] shrink-0',
            pasteBtnClass: 'flex items-center space-x-1.5 border border-[rgba(1,22,39,0.08)] bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#011627] px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer font-[\'Inter\'] rounded-[6px]',
            undoBtnClass: 'flex items-center space-x-1.5 border border-[rgba(1,22,39,0.08)] bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#011627] px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer font-[\'Inter\'] rounded-[6px]',
            resetBtnClass: 'flex items-center space-x-1.5 border border-[#BE1A1A]/30 bg-[#F1F5F9] hover:bg-[#BE1A1A] hover:text-white text-[#BE1A1A] px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer font-[\'Inter\'] rounded-[6px]',
            lockBtnClass: 'flex items-center space-x-1.5 border border-[rgba(1,22,39,0.08)] bg-[#F1F5F9] text-[#011627] hover:bg-[#297373] hover:text-white px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer font-[\'Inter\'] rounded-[6px]',
            expandBtnClass: 'flex items-center space-x-1.5 border border-[rgba(1,22,39,0.08)] bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#011627] px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer font-[\'Inter\'] rounded-[6px]',

            // 5. Area Grid Kalender
            calendarContainerCardClass: 'bg-[#FFFFFF] p-2 border border-[rgba(1,22,39,0.08)] rounded-[12px]',
            dayNamesHeaderClass: 'grid grid-cols-7 gap-0 py-2 text-center text-[11px] font-[\'JetBrains_Mono\'] font-bold uppercase tracking-[0.1em] text-[#011627]/60 border-b border-[rgba(1,22,39,0.08)] bg-[#F6F7F8] rounded-t-[8px]',
            weekdayNameTextClass: 'text-[#011627]/70',
            weekendNameTextClass: 'text-[#BE1A1A]',
            emptyCellClass: 'bg-[#F6F7F8]/70 border border-dashed border-[rgba(1,22,39,0.06)] p-1 rounded-[6px]',

            // 6. Summary Cards Panel
            summaryPanelCardClass: 'bg-[#F6F7F8] p-3.5 border border-[rgba(1,22,39,0.08)] font-[\'Inter\'] rounded-[12px]',
            summaryTitleClass: 'text-sm font-bold text-[#011627] flex items-center font-[\'Inter\'] tracking-tight',
            summaryHeaderBorderClass: 'border-b border-[rgba(1,22,39,0.08)] pb-2',
            summarySubtextClass: 'text-xs text-[#011627]/60 font-[\'JetBrains_Mono\'] tracking-widest uppercase',

            // 7. Modal & Pop-up
            modalCardClass: 'bg-[#FFFFFF] border border-[rgba(1,22,39,0.12)] shadow-2xl text-[#011627] font-[\'Inter\'] rounded-[12px]',
            modalHeaderClass: 'border-b border-[rgba(1,22,39,0.08)] bg-[#F6F7F8] px-4 py-3 font-[\'Inter\'] rounded-t-[12px]',
            modalTitleClass: 'text-base sm:text-lg font-bold text-[#011627] font-[\'Inter\'] tracking-tight',
            modalBodyClass: 'bg-[#FFFFFF] text-[#011627]',

            // 8. Mobile Drawer & FAB
            mobileFabClass: 'flex h-13 w-13 items-center justify-center bg-[#297373] text-white shadow-lg border border-[#297373] active:scale-95 transition-all cursor-pointer rounded-[10px]',
            mobileDrawerClass: 'relative z-10 w-full max-w-lg bg-[#FFFFFF] p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto border-t border-[rgba(1,22,39,0.15)] text-[#011627] font-[\'Inter\'] rounded-t-[16px]',
            mobileDrawerHeaderClass: 'border-b border-[rgba(1,22,39,0.08)] pb-3 bg-[#F6F7F8]',
            mobileDrawerTitleClass: 'text-base font-bold text-[#011627] font-[\'Inter\'] tracking-tight',
            mobileDrawerSubtextClass: 'text-xs text-[#011627]/60 font-[\'JetBrains_Mono\']',
            mobileDrawerNavBtnActive: 'bg-[#297373] text-white font-bold border border-[#297373] font-[\'Inter\'] text-xs rounded-[6px]',
            mobileDrawerNavBtnInactive: 'text-[#011627] hover:bg-black/5 font-[\'Inter\'] text-xs rounded-[6px]',
            mobileNavItemActiveClass: 'bg-[#297373] text-white border border-[#297373] font-[\'Inter\'] rounded-[6px]',
            mobileNavItemInactiveClass: 'text-[#011627] hover:bg-black/5 font-[\'Inter\'] rounded-[6px]',

            // 9. Desktop Left Side Menu
            sidebarClass: 'border-r border-[rgba(1,22,39,0.08)] bg-[#FFFFFF] text-[#011627] font-[\'Inter\']',
            sidebarItemActiveClass: 'bg-[#297373] text-white font-semibold shadow-xs font-[\'Inter\'] text-xs rounded-[8px]',
            sidebarItemInactiveClass: 'text-[#011627]/70 hover:text-[#297373] hover:bg-[rgba(41,115,115,0.05)] border border-transparent transition-all font-[\'Inter\'] text-xs rounded-[8px]',
            sidebarDividerClass: 'border-b border-[rgba(1,22,39,0.08)]',
        };
    }

    if (isIndustrial) {
        return {
            theme,
            isDefault: false,
            isDark: false,
            isVista: false,
            isWinamp: false,
            isPaperSketch: false,
            isTechnical: false,
            isEditorial: false,
            isIndustrial: true,
            isDashboard: false,
            palette: themes.industrial,
            penugasanColors: themes.industrial.penugasanColors,

            // 1. Kanvas Utama (#0F1115 bg, #E2E8F0 ink, Inter & Syne typography)
            wrapperClass: 'min-h-screen min-h-[100dvh] w-full bg-[#0F1115] text-[#E2E8F0] flex flex-col font-[\'Inter\'] relative selection:bg-[#2DD4BF] selection:text-[#0F1115] md:h-screen md:max-h-screen md:overflow-hidden',

            // 2. Top Header / Navbar
            navbarClass: 'sticky top-0 z-50 bg-[#0F1115]/90 backdrop-blur-md text-[#E2E8F0] border-b-[1.5px] border-[rgba(226,232,240,0.1)] shrink-0 font-[\'Inter\']',
            logoContainerClass: 'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center bg-[#1A1D23] text-[#2DD4BF] border border-[rgba(226,232,240,0.15)] shrink-0 rounded-none',
            titleClass: 'text-[8px] sm:text-[9.5px] lg:text-[11px] font-extrabold uppercase tracking-tight text-[#E2E8F0] font-[\'Syne\']',
            versionBadgeClass: 'bg-[#1A1D23] text-[#E2E8F0]/70 border border-[rgba(226,232,240,0.15)] text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-[4px] font-[\'JetBrains_Mono\'] tracking-widest uppercase',
            subtitleClass: 'hidden sm:block text-[10.5px] text-[#E2E8F0]/60 font-[\'JetBrains_Mono\'] tracking-wider uppercase',
            supabaseBadgeClass: 'hidden lg:flex items-center space-x-1.5 bg-[#1A1D23] px-2.5 py-1 text-xs border border-[rgba(226,232,240,0.1)] text-[#E2E8F0] font-[\'JetBrains_Mono\'] uppercase tracking-wider rounded-[4px]',
            holidayBtnClass: 'flex items-center space-x-1.5 bg-[#BE1A1A] hover:bg-[#a51515] px-3 py-1.5 text-xs font-bold text-white transition-all cursor-pointer border border-[#BE1A1A]/40 font-[\'JetBrains_Mono\'] uppercase tracking-wider rounded-[4px]',
            themeDropdownBtnClass: 'h-8 sm:h-9 flex items-center justify-center gap-2 bg-[#1A1D23] hover:bg-[#252932] px-3 text-xs font-bold text-[#E2E8F0] transition-all duration-150 cursor-pointer border border-[rgba(226,232,240,0.15)] select-none font-[\'JetBrains_Mono\'] uppercase tracking-wider shadow-none rounded-[4px]',
            themeDropdownMenuClass: 'absolute right-[-3rem] sm:right-0 mt-1.5 z-50 w-64 bg-[#1A1D23] p-2 flex flex-col gap-1 text-[#E2E8F0] border border-[rgba(226,232,240,0.15)] shadow-2xl animate-in fade-in zoom-in-95 duration-150 font-[\'JetBrains_Mono\'] rounded-[4px]',
            settingsBtnClass: 'flex items-center justify-center space-x-1.5 bg-[#1A1D23] hover:bg-[#252932] px-2.5 py-1.5 text-xs font-semibold text-[#E2E8F0] transition-all cursor-pointer border border-[rgba(226,232,240,0.15)] font-[\'JetBrains_Mono\'] uppercase tracking-wider rounded-[4px]',
            syncBtnClass: 'flex items-center justify-center space-x-1.5 bg-[#1A1D23] hover:bg-[#252932] px-2.5 py-1.5 text-xs font-semibold text-[#E2E8F0] transition-all cursor-pointer border border-[rgba(226,232,240,0.15)] font-[\'JetBrains_Mono\'] uppercase tracking-wider rounded-[4px]',
            saveBtnClass: 'flex items-center justify-center space-x-1.5 bg-[#2DD4BF]/10 hover:bg-[#2DD4BF]/20 text-[#2DD4BF] px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer border border-[#2DD4BF]/30 font-[\'JetBrains_Mono\'] uppercase tracking-wider rounded-[4px]',

            // 3. View Switcher & Navigasi Bulan
            viewSwitcherCardClass: 'flex flex-col md:flex-row md:items-center justify-between gap-1.5 sm:gap-2 bg-[#1A1D23] p-2 border border-[rgba(226,232,240,0.1)] font-[\'JetBrains_Mono\'] rounded-[6px]',
            viewSwitcherPillsWrapperClass: 'flex flex-row flex-nowrap items-center overflow-x-auto no-scrollbar scroll-smooth p-1 gap-1 bg-[#0F1115] border border-[rgba(226,232,240,0.1)] max-w-full min-w-0 shrink flex-1 rounded-[4px]',
            tabActiveClass: 'bg-[#2DD4BF]/15 text-[#2DD4BF] font-bold border border-[#2DD4BF]/30 font-[\'JetBrains_Mono\'] text-xs tracking-wider uppercase rounded-[4px]',
            tabInactiveClass: 'text-[#E2E8F0]/60 hover:text-[#E2E8F0] hover:bg-white/5 transition-colors duration-150 font-[\'JetBrains_Mono\'] text-xs tracking-wider uppercase rounded-[4px]',
            monthNavBtnClass: 'border border-[rgba(226,232,240,0.15)] bg-[#1A1D23] p-1.5 sm:p-2 text-[#E2E8F0] hover:bg-white/5 transition-colors cursor-pointer shrink-0 rounded-[4px]',
            monthDisplayBtnClass: 'flex items-center justify-center space-x-1.5 sm:space-x-2 border border-[rgba(226,232,240,0.15)] bg-[#0F1115] hover:bg-[#1A1D23] px-3 py-1 text-sm sm:text-base font-extrabold text-[#E2E8F0] transition-all cursor-pointer w-[150px] sm:w-[176px] shrink-0 font-[\'Syne\'] tracking-tight rounded-[4px]',
            todayBtnClass: 'flex items-center space-x-1 border border-[#2DD4BF]/30 bg-[#2DD4BF]/20 hover:bg-[#2DD4BF]/30 text-[#2DD4BF] px-2.5 py-1 text-xs font-bold transition-all cursor-pointer shrink-0 font-[\'JetBrains_Mono\'] uppercase tracking-wider rounded-[4px]',

            // 4. Sub-toolbar Aksi Kalender
            subToolbarCardClass: 'flex items-center justify-between bg-[#1A1D23] p-2 border border-[rgba(226,232,240,0.1)] gap-2 font-[\'JetBrains_Mono\'] rounded-[6px]',
            subToolbarTitleClass: 'text-sm font-bold text-[#E2E8F0] truncate font-[\'Syne\'] tracking-tight',
            subToolbarDotClass: 'flex h-2 w-2 rounded-full bg-[#2DD4BF] shrink-0',
            pasteBtnClass: 'flex items-center space-x-1.5 border border-[rgba(226,232,240,0.15)] bg-[#0F1115] hover:bg-white/5 text-[#E2E8F0] px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer font-[\'JetBrains_Mono\'] uppercase tracking-wider rounded-[4px]',
            undoBtnClass: 'flex items-center space-x-1.5 border border-[rgba(226,232,240,0.15)] bg-[#0F1115] hover:bg-white/5 text-[#E2E8F0] px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer font-[\'JetBrains_Mono\'] uppercase tracking-wider rounded-[4px]',
            resetBtnClass: 'flex items-center space-x-1.5 border border-[#BE1A1A]/40 bg-[#0F1115] hover:bg-[#BE1A1A] hover:text-white text-[#BE1A1A] px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer font-[\'JetBrains_Mono\'] uppercase tracking-wider rounded-[4px]',
            lockBtnClass: 'flex items-center space-x-1.5 border border-[rgba(226,232,240,0.15)] bg-[#0F1115] text-[#E2E8F0] hover:bg-[#2DD4BF] hover:text-[#0F1115] px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer font-[\'JetBrains_Mono\'] uppercase tracking-wider rounded-[4px]',
            expandBtnClass: 'flex items-center space-x-1.5 border border-[rgba(226,232,240,0.15)] bg-[#0F1115] hover:bg-white/5 text-[#E2E8F0] px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer font-[\'JetBrains_Mono\'] uppercase tracking-wider rounded-[4px]',

            // 5. Area Grid Kalender
            calendarContainerCardClass: 'bg-[#1A1D23] p-2 border border-[rgba(226,232,240,0.1)] rounded-[8px]',
            dayNamesHeaderClass: 'grid grid-cols-7 gap-0 py-1.5 text-center text-[10.5px] font-[\'JetBrains_Mono\'] font-bold uppercase tracking-[0.1em] text-[#E2E8F0]/60 border-b border-[rgba(226,232,240,0.1)] bg-white/[0.03]',
            weekdayNameTextClass: 'text-[#E2E8F0]/70',
            weekendNameTextClass: 'text-[#BE1A1A]',
            emptyCellClass: 'bg-[#0F1115]/50 border border-dashed border-[rgba(226,232,240,0.06)] p-1',

            // 6. Summary Cards Panel
            summaryPanelCardClass: 'bg-[#1A1D23] p-3.5 border border-[rgba(226,232,240,0.1)] font-[\'Inter\'] rounded-[8px]',
            summaryTitleClass: 'text-sm font-bold text-[#E2E8F0] flex items-center font-[\'Syne\'] tracking-tight',
            summaryHeaderBorderClass: 'border-b border-[rgba(226,232,240,0.1)] pb-2',
            summarySubtextClass: 'text-xs text-[#E2E8F0]/60 font-[\'JetBrains_Mono\'] tracking-widest uppercase',

            // 7. Modal & Pop-up
            modalCardClass: 'bg-[#1A1D23] border border-[rgba(226,232,240,0.15)] shadow-2xl text-[#E2E8F0] font-[\'Inter\'] rounded-[8px]',
            modalHeaderClass: 'border-b border-[rgba(226,232,240,0.1)] bg-[#0F1115] px-4 py-3 font-[\'JetBrains_Mono\']',
            modalTitleClass: 'text-base sm:text-lg font-bold text-[#E2E8F0] font-[\'Syne\'] tracking-tight',
            modalBodyClass: 'bg-[#1A1D23] text-[#E2E8F0]',

            // 8. Mobile Drawer & FAB
            mobileFabClass: 'flex h-13 w-13 items-center justify-center bg-[#2DD4BF] text-[#0F1115] shadow-lg border border-[#2DD4BF] active:scale-95 transition-all cursor-pointer rounded-[6px]',
            mobileDrawerClass: 'relative z-10 w-full max-w-lg bg-[#1A1D23] p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto border-t border-[rgba(226,232,240,0.2)] text-[#E2E8F0] font-[\'Inter\'] rounded-t-[12px]',
            mobileDrawerHeaderClass: 'border-b border-[rgba(226,232,240,0.1)] pb-3 bg-[#0F1115]',
            mobileDrawerTitleClass: 'text-base font-bold text-[#E2E8F0] font-[\'Syne\'] tracking-tight',
            mobileDrawerSubtextClass: 'text-xs text-[#E2E8F0]/60 font-[\'JetBrains_Mono\']',
            mobileDrawerNavBtnActive: 'bg-[#2DD4BF]/15 text-[#2DD4BF] font-bold border border-[#2DD4BF]/30 font-[\'JetBrains_Mono\'] text-xs tracking-wider uppercase rounded-[4px]',
            mobileDrawerNavBtnInactive: 'text-[#E2E8F0] hover:bg-white/5 font-[\'JetBrains_Mono\'] text-xs tracking-wider uppercase rounded-[4px]',
            mobileNavItemActiveClass: 'bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30 font-[\'JetBrains_Mono\'] rounded-[4px]',
            mobileNavItemInactiveClass: 'text-[#E2E8F0] hover:bg-white/5 font-[\'JetBrains_Mono\'] rounded-[4px]',

            // 9. Desktop Left Side Menu
            sidebarClass: 'border-r-[1.5px] border-[rgba(226,232,240,0.1)] bg-[#14171C]/80 text-[#E2E8F0] font-[\'Inter\']',
            sidebarItemActiveClass: 'bg-[#2DD4BF]/10 text-[#2DD4BF] font-bold border border-[#2DD4BF]/20 font-[\'JetBrains_Mono\'] text-xs uppercase tracking-wider rounded-[6px]',
            sidebarItemInactiveClass: 'text-[#E2E8F0]/70 hover:text-[#E2E8F0] hover:bg-white/5 border border-transparent hover:border-[rgba(226,232,240,0.1)] transition-all font-[\'JetBrains_Mono\'] text-xs uppercase tracking-wider rounded-[6px]',
            sidebarDividerClass: 'border-b border-[rgba(226,232,240,0.1)]',
        };
    }

    if (isEditorial) {
        return {
            theme,
            isDefault: false,
            isDark: false,
            isVista: false,
            isWinamp: false,
            isPaperSketch: false,
            isTechnical: false,
            isEditorial: true,
            isIndustrial: false,
            isDashboard: false,
            palette: themes.editorial,
            penugasanColors: themes.editorial.penugasanColors,

            // 1. Kanvas Utama (Warm cream #fcfbf9, ink #1a1a1a, Geist font)
            wrapperClass: 'min-h-screen min-h-[100dvh] w-full bg-[#fcfbf9] text-[#1a1a1a] flex flex-col font-[\'Geist\'] relative selection:bg-[#2a7373] selection:text-white md:h-screen md:max-h-screen md:overflow-hidden',

            // 2. Top Header / Navbar
            navbarClass: 'sticky top-0 z-50 bg-[#fcfbf9]/95 backdrop-blur-md text-[#1a1a1a] border-b border-[#1a1a1a]/10 shrink-0 font-[\'Geist\']',
            logoContainerClass: 'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center bg-transparent text-[#2a7373] border border-[#1a1a1a]/15 shrink-0',
            titleClass: 'text-base sm:text-lg md:text-2xl font-semibold italic tracking-tight truncate text-[#1a1a1a] font-[\'Cormorant_Garamond\']',
            versionBadgeClass: 'bg-[#1a1a1a]/[0.06] text-[#1a1a1a] border border-[#1a1a1a]/15 text-[9px] sm:text-[10px] px-2 py-0.5 font-[\'Geist_Mono\'] font-medium uppercase tracking-widest',
            subtitleClass: 'hidden sm:block text-[10.5px] text-[#1a1a1a]/60 font-[\'Geist_Mono\'] tracking-widest uppercase',
            supabaseBadgeClass: 'hidden lg:flex items-center space-x-1.5 bg-[#ffffff] px-2.5 py-1 text-xs border border-[#1a1a1a]/10 text-[#1a1a1a] font-[\'Geist_Mono\'] uppercase tracking-wider',
            holidayBtnClass: 'flex items-center space-x-1.5 bg-[#cc3333] hover:bg-[#b02a2a] px-3 py-1.5 text-xs font-semibold text-white transition-all cursor-pointer border border-[#cc3333]/30 font-[\'Geist_Mono\'] uppercase tracking-wider',
            themeDropdownBtnClass: 'h-8 sm:h-9 flex items-center justify-center gap-2 bg-[#ffffff] hover:bg-[#fcfbf9] px-3 text-xs font-medium text-[#1a1a1a] transition-all duration-150 cursor-pointer border border-[#1a1a1a]/15 select-none font-[\'Geist_Mono\'] uppercase tracking-wider shadow-none',
            themeDropdownMenuClass: 'absolute right-[-3rem] sm:right-0 mt-1.5 z-50 w-64 bg-[#fcfbf9] p-2 flex flex-col gap-1 text-[#1a1a1a] border border-[#1a1a1a]/15 shadow-xl animate-in fade-in zoom-in-95 duration-150 font-[\'Geist_Mono\']',
            settingsBtnClass: 'flex items-center justify-center space-x-1.5 bg-[#ffffff] hover:bg-[#1a1a1a]/[0.05] px-2.5 py-1.5 text-xs font-medium text-[#1a1a1a] transition-all cursor-pointer border border-[#1a1a1a]/15 font-[\'Geist_Mono\'] uppercase tracking-wider',
            syncBtnClass: 'flex items-center justify-center space-x-1.5 bg-[#ffffff] hover:bg-[#1a1a1a]/[0.05] px-2.5 py-1.5 text-xs font-medium text-[#1a1a1a] transition-all cursor-pointer border border-[#1a1a1a]/15 font-[\'Geist_Mono\'] uppercase tracking-wider',
            saveBtnClass: 'flex items-center justify-center space-x-1.5 bg-[#ffffff] hover:bg-[#1a1a1a]/[0.05] px-2.5 py-1.5 text-xs font-medium text-[#1a1a1a] transition-all cursor-pointer border border-[#1a1a1a]/15 font-[\'Geist_Mono\'] uppercase tracking-wider',

            // 3. View Switcher & Navigasi Bulan
            viewSwitcherCardClass: 'flex flex-col md:flex-row md:items-center justify-between gap-1.5 sm:gap-2 bg-[#ffffff] p-2 border border-[#1a1a1a]/10 font-[\'Geist_Mono\']',
            viewSwitcherPillsWrapperClass: 'flex flex-row flex-nowrap items-center overflow-x-auto no-scrollbar scroll-smooth p-1 gap-1 bg-[#fcfbf9] border border-[#1a1a1a]/10 max-w-full min-w-0 shrink flex-1',
            tabActiveClass: 'bg-[#1a1a1a] text-[#fcfbf9] font-medium border border-[#1a1a1a] font-[\'Geist_Mono\'] text-xs tracking-wider uppercase',
            tabInactiveClass: 'text-[#1a1a1a]/60 hover:text-[#1a1a1a] hover:bg-[#1a1a1a]/[0.05] transition-colors duration-150 font-[\'Geist_Mono\'] text-xs tracking-wider uppercase',
            monthNavBtnClass: 'border border-[#1a1a1a]/15 bg-[#ffffff] p-1.5 sm:p-2 text-[#1a1a1a] hover:bg-[#1a1a1a]/[0.05] transition-colors cursor-pointer shrink-0',
            monthDisplayBtnClass: 'flex items-center justify-center space-x-1.5 sm:space-x-2 border border-[#1a1a1a]/15 bg-[#ffffff] hover:bg-[#fcfbf9] px-3 py-1 text-sm sm:text-base font-semibold italic text-[#1a1a1a] transition-all cursor-pointer w-[150px] sm:w-[176px] shrink-0 font-[\'Cormorant_Garamond\'] tracking-tight',
            todayBtnClass: 'flex items-center space-x-1 border border-[#2a7373]/30 bg-[#2a7373] hover:bg-[#236060] text-white px-2.5 py-1 text-xs font-medium transition-all cursor-pointer shrink-0 font-[\'Geist_Mono\'] uppercase tracking-wider',

            // 4. Sub-toolbar Aksi Kalender
            subToolbarCardClass: 'flex items-center justify-between bg-[#ffffff] p-2 border border-[#1a1a1a]/10 gap-2 font-[\'Geist_Mono\']',
            subToolbarTitleClass: 'text-sm font-semibold italic text-[#1a1a1a] truncate font-[\'Cormorant_Garamond\'] tracking-tight',
            subToolbarDotClass: 'flex h-2 w-2 rounded-full bg-[#2a7373] shrink-0',
            pasteBtnClass: 'flex items-center space-x-1.5 border border-[#1a1a1a]/15 bg-[#ffffff] hover:bg-[#1a1a1a]/[0.05] text-[#1a1a1a] px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer font-[\'Geist_Mono\'] uppercase tracking-wider',
            undoBtnClass: 'flex items-center space-x-1.5 border border-[#1a1a1a]/15 bg-[#ffffff] hover:bg-[#1a1a1a]/[0.05] text-[#1a1a1a] px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer font-[\'Geist_Mono\'] uppercase tracking-wider',
            resetBtnClass: 'flex items-center space-x-1.5 border border-[#1a1a1a]/15 bg-[#ffffff] hover:bg-[#cc3333] hover:text-white text-[#1a1a1a] px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer font-[\'Geist_Mono\'] uppercase tracking-wider',
            lockBtnClass: 'flex items-center space-x-1.5 border border-[#1a1a1a]/15 bg-[#ffffff] text-[#1a1a1a] hover:bg-[#2a7373] hover:text-white px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer font-[\'Geist_Mono\'] uppercase tracking-wider',
            expandBtnClass: 'flex items-center space-x-1.5 border border-[#1a1a1a]/15 bg-[#ffffff] hover:bg-[#1a1a1a]/[0.05] text-[#1a1a1a] px-2.5 py-1.5 text-xs font-medium transition-all cursor-pointer font-[\'Geist_Mono\'] uppercase tracking-wider',

            // 5. Area Grid Kalender
            calendarContainerCardClass: 'bg-[#ffffff] p-2 border-t border-[#1a1a1a] border-b border-x border-[#1a1a1a]/10',
            dayNamesHeaderClass: 'grid grid-cols-7 gap-0 py-1.5 text-center text-[10.5px] font-[\'Geist_Mono\'] font-medium uppercase tracking-[0.1em] text-[#1a1a1a]/60 border-b border-[#1a1a1a]/10 bg-[#fcfbf9]',
            weekdayNameTextClass: 'text-[#1a1a1a]/70',
            weekendNameTextClass: 'text-[#cc3333]',
            emptyCellClass: 'bg-[#1a1a1a]/[0.02] border border-dashed border-[#1a1a1a]/10 p-1',

            // 6. Summary Cards Panel
            summaryPanelCardClass: 'bg-[#ffffff] p-3.5 border border-[#1a1a1a]/10 font-[\'Geist\']',
            summaryTitleClass: 'text-sm font-semibold italic text-[#1a1a1a] flex items-center font-[\'Cormorant_Garamond\'] tracking-tight',
            summaryHeaderBorderClass: 'border-b border-[#1a1a1a]/10 pb-2',
            summarySubtextClass: 'text-xs text-[#1a1a1a]/60 font-[\'Geist_Mono\'] tracking-widest uppercase',

            // 7. Modal & Pop-up
            modalCardClass: 'bg-[#ffffff] border border-[#1a1a1a]/15 shadow-2xl text-[#1a1a1a] font-[\'Geist\']',
            modalHeaderClass: 'border-b border-[#1a1a1a]/10 bg-[#fcfbf9] px-4 py-3 font-[\'Geist_Mono\']',
            modalTitleClass: 'text-base sm:text-lg font-semibold italic text-[#1a1a1a] font-[\'Cormorant_Garamond\'] tracking-tight',
            modalBodyClass: 'bg-[#ffffff] text-[#1a1a1a]',

            // 8. Mobile Drawer & FAB
            mobileFabClass: 'flex h-13 w-13 items-center justify-center bg-[#2a7373] text-white shadow-lg border border-[#2a7373] active:scale-95 transition-all cursor-pointer',
            mobileDrawerClass: 'relative z-10 w-full max-w-lg bg-[#ffffff] p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto border-t border-[#1a1a1a]/20 text-[#1a1a1a] font-[\'Geist\']',
            mobileDrawerHeaderClass: 'border-b border-[#1a1a1a]/10 pb-3 bg-[#fcfbf9]',
            mobileDrawerTitleClass: 'text-base font-semibold italic text-[#1a1a1a] font-[\'Cormorant_Garamond\'] tracking-tight',
            mobileDrawerSubtextClass: 'text-xs text-[#1a1a1a]/60 font-[\'Geist_Mono\']',
            mobileDrawerNavBtnActive: 'bg-[#1a1a1a] text-[#fcfbf9] font-medium border border-[#1a1a1a] font-[\'Geist_Mono\'] text-xs tracking-wider uppercase',
            mobileDrawerNavBtnInactive: 'text-[#1a1a1a] hover:bg-[#1a1a1a]/[0.05] font-[\'Geist_Mono\'] text-xs tracking-wider uppercase',
            mobileNavItemActiveClass: 'bg-[#1a1a1a] text-[#fcfbf9] border border-[#1a1a1a] font-[\'Geist_Mono\']',
            mobileNavItemInactiveClass: 'text-[#1a1a1a] hover:bg-[#1a1a1a]/[0.05] font-[\'Geist_Mono\']',

            // 9. Desktop Left Side Menu
            sidebarClass: 'border-r border-[#1a1a1a]/10 bg-[#fcfbf9] text-[#1a1a1a] font-[\'Geist\']',
            sidebarItemActiveClass: 'bg-[#1a1a1a] text-[#fcfbf9] font-medium border border-[#1a1a1a] font-[\'Geist_Mono\'] text-xs uppercase tracking-wider',
            sidebarItemInactiveClass: 'text-[#1a1a1a] hover:bg-[#1a1a1a]/[0.05] border border-transparent hover:border-[#1a1a1a]/10 transition-all font-[\'Geist_Mono\'] text-xs uppercase tracking-wider',
            sidebarDividerClass: 'border-b border-[#1a1a1a]/10',
        };
    }

    if (isTechnical) {
        return {
            theme,
            isDefault: false,
            isDark: false,
            isVista: false,
            isWinamp: false,
            isPaperSketch: false,
            isTechnical: true,
            isEditorial: false,
            isIndustrial: false,
            isDashboard: false,
            palette: themes.technical,
            penugasanColors: themes.technical.penugasanColors,

            // 1. Kanvas Utama (Systematic Technical #F8F7F4, Ink #111113, Inter font)
            wrapperClass: 'min-h-screen min-h-[100dvh] w-full bg-[#F8F7F4] text-[#111113] flex flex-col font-[\'Inter\'] relative selection:bg-[#0D9488] selection:text-white md:h-screen md:max-h-screen md:overflow-hidden',

            // 2. Top Header / Navbar
            navbarClass: 'sticky top-0 z-50 bg-[#F8F7F4] text-[#111113] border-b-[1.5px] border-[#111113] shrink-0 font-[\'Inter\']',
            logoContainerClass: 'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center bg-[#111113] text-[#F8F7F4] border-[1.5px] border-[#111113] shrink-0',
            titleClass: 'text-base sm:text-lg md:text-xl font-extrabold tracking-tight truncate text-[#111113] font-[\'Syne\']',
            versionBadgeClass: 'bg-[#111113] text-[#F8F7F4] border border-[#111113] text-[9px] sm:text-[10px] px-2 py-0.5 font-[\'JetBrains_Mono\'] font-bold tracking-widest uppercase',
            subtitleClass: 'hidden sm:block text-[11px] text-[#111113]/60 font-[\'JetBrains_Mono\'] tracking-wider uppercase',
            supabaseBadgeClass: 'hidden lg:flex items-center space-x-1.5 bg-[#FFFFFF] px-2.5 py-1 text-xs border-[1.5px] border-[#111113] text-[#111113] font-[\'JetBrains_Mono\'] font-bold uppercase tracking-wider',
            holidayBtnClass: 'flex items-center space-x-1.5 bg-[#BE1A1A] hover:bg-[#a01515] px-3 py-1.5 text-xs font-bold text-white transition-all cursor-pointer border-[1.5px] border-[#111113] font-[\'JetBrains_Mono\'] uppercase tracking-wider',
            themeDropdownBtnClass: 'h-8 sm:h-9 flex items-center justify-center gap-2 bg-[#FFFFFF] hover:bg-[#111113] hover:text-[#F8F7F4] px-3 text-xs font-bold text-[#111113] transition-all duration-150 cursor-pointer border-[1.5px] border-[#111113] select-none font-[\'JetBrains_Mono\'] uppercase tracking-wider',
            themeDropdownMenuClass: 'absolute right-[-3rem] sm:right-0 mt-1.5 z-50 w-64 bg-[#F8F7F4] p-2 flex flex-col gap-1 text-[#111113] border-[1.5px] border-[#111113] shadow-[4px_4px_0px_#111113] animate-in fade-in zoom-in-95 duration-150 font-[\'JetBrains_Mono\']',
            settingsBtnClass: 'flex items-center justify-center space-x-1.5 bg-[#FFFFFF] hover:bg-[#111113] hover:text-[#F8F7F4] px-2.5 py-1.5 text-xs font-bold text-[#111113] transition-all cursor-pointer border-[1.5px] border-[#111113] font-[\'JetBrains_Mono\'] uppercase tracking-wider',
            syncBtnClass: 'flex items-center justify-center space-x-1.5 bg-[#FFFFFF] hover:bg-[#111113] hover:text-[#F8F7F4] px-2.5 py-1.5 text-xs font-bold text-[#111113] transition-all cursor-pointer border-[1.5px] border-[#111113] font-[\'JetBrains_Mono\'] uppercase tracking-wider',
            saveBtnClass: 'flex items-center justify-center space-x-1.5 bg-[#FFFFFF] hover:bg-[#111113] hover:text-[#F8F7F4] px-2.5 py-1.5 text-xs font-bold text-[#111113] transition-all cursor-pointer border-[1.5px] border-[#111113] font-[\'JetBrains_Mono\'] uppercase tracking-wider',

            // 3. View Switcher & Navigasi Bulan
            viewSwitcherCardClass: 'flex flex-col md:flex-row md:items-center justify-between gap-1.5 sm:gap-2 bg-[#FFFFFF] p-2 border-[1.5px] border-[#111113] font-[\'JetBrains_Mono\']',
            viewSwitcherPillsWrapperClass: 'flex flex-row flex-nowrap items-center overflow-x-auto no-scrollbar scroll-smooth p-1 gap-1 bg-[#F8F7F4] border-[1.5px] border-[#111113] max-w-full min-w-0 shrink flex-1',
            tabActiveClass: 'bg-[#111113] text-[#F8F7F4] font-bold border border-[#111113] font-[\'JetBrains_Mono\'] text-xs tracking-wider uppercase',
            tabInactiveClass: 'text-[#111113]/70 hover:text-[#111113] hover:bg-black/5 transition-colors duration-150 font-[\'JetBrains_Mono\'] text-xs tracking-wider uppercase',
            monthNavBtnClass: 'border-[1.5px] border-[#111113] bg-[#FFFFFF] p-1.5 sm:p-2 text-[#111113] hover:bg-[#111113] hover:text-[#F8F7F4] transition-colors cursor-pointer shrink-0',
            monthDisplayBtnClass: 'flex items-center justify-center space-x-1.5 sm:space-x-2 border-[1.5px] border-[#111113] bg-[#FFFFFF] hover:bg-[#F8F7F4] px-3 py-1 text-sm sm:text-base font-bold text-[#111113] transition-all cursor-pointer w-[150px] sm:w-[176px] shrink-0 font-[\'JetBrains_Mono\'] tracking-tight uppercase',
            todayBtnClass: 'flex items-center space-x-1 border-[1.5px] border-[#111113] bg-[#0D9488] hover:bg-[#0b7a70] text-white px-2.5 py-1 text-xs font-bold transition-all cursor-pointer shrink-0 font-[\'JetBrains_Mono\'] uppercase tracking-wider',

            // 4. Sub-toolbar Aksi Kalender
            subToolbarCardClass: 'flex items-center justify-between bg-[#FFFFFF] p-2 border-[1.5px] border-[#111113] gap-2 font-[\'JetBrains_Mono\']',
            subToolbarTitleClass: 'text-sm font-bold text-[#111113] truncate font-[\'JetBrains_Mono\'] uppercase tracking-wider',
            subToolbarDotClass: 'flex h-2.5 w-2.5 bg-[#0D9488] border border-[#111113] shrink-0',
            pasteBtnClass: 'flex items-center space-x-1.5 border-[1.5px] border-[#111113] bg-[#FFFFFF] hover:bg-[#111113] hover:text-[#F8F7F4] text-[#111113] px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer font-[\'JetBrains_Mono\'] uppercase tracking-wider',
            undoBtnClass: 'flex items-center space-x-1.5 border-[1.5px] border-[#111113] bg-[#FFFFFF] hover:bg-[#111113] hover:text-[#F8F7F4] text-[#111113] px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer font-[\'JetBrains_Mono\'] uppercase tracking-wider',
            resetBtnClass: 'flex items-center space-x-1.5 border-[1.5px] border-[#111113] bg-[#FFFFFF] hover:bg-[#BE1A1A] hover:text-white text-[#111113] px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer font-[\'JetBrains_Mono\'] uppercase tracking-wider',
            lockBtnClass: 'flex items-center space-x-1.5 border-[1.5px] border-[#111113] bg-[#FFFFFF] text-[#111113] hover:bg-[#0D9488] hover:text-white px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer font-[\'JetBrains_Mono\'] uppercase tracking-wider',
            expandBtnClass: 'flex items-center space-x-1.5 border-[1.5px] border-[#111113] bg-[#FFFFFF] hover:bg-[#111113] hover:text-[#F8F7F4] text-[#111113] px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer font-[\'JetBrains_Mono\'] uppercase tracking-wider',

            // 5. Area Grid Kalender
            calendarContainerCardClass: 'bg-[#FFFFFF] p-2 border-[1.5px] border-[#111113]',
            dayNamesHeaderClass: 'grid grid-cols-7 gap-1 mb-1.5 bg-[#F8F7F4] py-1.5 text-center text-xs font-[\'JetBrains_Mono\'] font-bold border-b-[1.5px] border-[#111113] tracking-widest uppercase',
            weekdayNameTextClass: 'text-[#111113]',
            weekendNameTextClass: 'text-[#BE1A1A]',
            emptyCellClass: 'bg-[#111113]/5 border border-dashed border-[#111113]/20 p-1',

            // 6. Summary Cards Panel
            summaryPanelCardClass: 'bg-[#FFFFFF] p-3.5 border-[1.5px] border-[#111113] font-[\'Inter\']',
            summaryTitleClass: 'text-sm font-bold text-[#111113] flex items-center font-[\'JetBrains_Mono\'] uppercase tracking-wider',
            summaryHeaderBorderClass: 'border-b-[1.5px] border-[#111113] pb-2',
            summarySubtextClass: 'text-xs text-[#111113]/60 font-[\'JetBrains_Mono\'] tracking-wider',

            // 7. Modal & Pop-up
            modalCardClass: 'bg-[#FFFFFF] border-[2px] border-[#111113] shadow-[8px_8px_0px_#111113] text-[#111113] font-[\'Inter\']',
            modalHeaderClass: 'border-b-[1.5px] border-[#111113] bg-[#F8F7F4] px-4 py-3 font-[\'JetBrains_Mono\']',
            modalTitleClass: 'text-base font-bold text-[#111113] font-[\'Syne\'] tracking-tight',
            modalBodyClass: 'bg-[#FFFFFF] text-[#111113]',

            // 8. Mobile Drawer & FAB
            mobileFabClass: 'flex h-13 w-13 items-center justify-center bg-[#0D9488] text-white shadow-[3px_3px_0px_#111113] border-[1.5px] border-[#111113] active:scale-95 transition-all cursor-pointer',
            mobileDrawerClass: 'relative z-10 w-full max-w-lg bg-[#FFFFFF] p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto border-t-[2px] border-[#111113] text-[#111113] font-[\'Inter\']',
            mobileDrawerHeaderClass: 'border-b-[1.5px] border-[#111113] pb-3 bg-[#F8F7F4]',
            mobileDrawerTitleClass: 'text-base font-bold text-[#111113] font-[\'Syne\'] tracking-tight',
            mobileDrawerSubtextClass: 'text-xs text-[#111113]/70 font-[\'JetBrains_Mono\']',
            mobileDrawerNavBtnActive: 'bg-[#111113] text-[#F8F7F4] font-bold border border-[#111113] font-[\'JetBrains_Mono\'] text-xs tracking-wider uppercase',
            mobileDrawerNavBtnInactive: 'text-[#111113] hover:bg-[#111113]/5 font-[\'JetBrains_Mono\'] text-xs tracking-wider uppercase',
            mobileNavItemActiveClass: 'bg-[#111113] text-[#F8F7F4] border border-[#111113] font-[\'JetBrains_Mono\']',
            mobileNavItemInactiveClass: 'text-[#111113] hover:bg-[#111113]/5 font-[\'JetBrains_Mono\']',

            // 9. Desktop Left Side Menu
            sidebarClass: 'border-r-[1.5px] border-[#111113] bg-[#F8F7F4] text-[#111113] font-[\'Inter\']',
            sidebarItemActiveClass: 'bg-[#111113] text-[#F8F7F4] font-bold border-[1.5px] border-[#111113] font-[\'JetBrains_Mono\'] text-xs uppercase tracking-wider',
            sidebarItemInactiveClass: 'text-[#111113] hover:bg-[#111113]/5 border-[1.5px] border-transparent hover:border-[#111113]/20 transition-all font-[\'JetBrains_Mono\'] text-xs uppercase tracking-wider',
            sidebarDividerClass: 'border-b-[1.5px] border-[#111113]',
        };
    }

    if (isPaperSketch) {
        return {
            theme,
            isDefault: false,
            isDark: false,
            isVista: false,
            isWinamp: false,
            isPaperSketch: true,
            isTechnical: false,
            isEditorial: false,
            isIndustrial: false,
            isDashboard: false,
            palette: themes.paperSketch,
            penugasanColors,

            // 1. Kanvas Utama (Paper sketch grid background, ink text)
            wrapperClass: 'min-h-screen min-h-[100dvh] w-full bg-[#f2efeb] text-[#2b2b2b] flex flex-col font-[\'Gaegu\'] font-bold relative selection:bg-[#2ec4b6] selection:text-[#2b2b2b] md:h-screen md:max-h-screen md:overflow-hidden',

            // 2. Top Header / Navbar: paper background, ink borders, Gochi Hand title & Space Mono build badge
            navbarClass: 'sticky top-0 z-50 bg-[#ffffff] text-[#2b2b2b] border-b-[3px] border-[#2b2b2b] shadow-[0_4px_0px_#2b2b2b] shrink-0 font-[\'Gaegu\']',
            logoContainerClass: 'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-[6px] bg-[#ffffff] text-[#2b2b2b] border-[2.5px] border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] shrink-0',
            titleClass: 'text-base sm:text-lg md:text-2xl font-bold tracking-tight truncate text-[#2b2b2b] font-[\'Gochi_Hand\'] tracking-wide',
            versionBadgeClass: 'bg-[#f2efeb] text-[#2b2b2b] border-2 border-[#2b2b2b] text-[10px] sm:text-[11px] px-1.5 py-0.2 rounded-md font-mono font-bold shadow-[1px_1px_0px_#2b2b2b]',
            subtitleClass: 'hidden sm:block text-xs text-[#2b2b2b]/70 font-mono tracking-wider line-clamp-1 uppercase',
            supabaseBadgeClass: 'hidden lg:flex items-center space-x-1.5 rounded-lg bg-[#ffffff] px-2.5 py-1 text-xs border-2 border-[#2b2b2b] text-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] font-mono',
            holidayBtnClass: 'flex items-center space-x-1.5 rounded-lg bg-[#ff4747] hover:bg-[#ff3333] px-2.5 py-1.5 text-sm font-bold text-white transition-all cursor-pointer border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5 font-[\'Gaegu\'] tracking-wide',
            themeDropdownBtnClass: 'h-8 sm:h-9 flex items-center justify-center gap-2 rounded-lg bg-[#ffffff] hover:bg-[#2ec4b6] px-3 text-sm font-bold text-[#2b2b2b] transition-all duration-150 cursor-pointer border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] select-none font-[\'Gaegu\'] active:translate-x-0.5 active:translate-y-0.5',
            themeDropdownMenuClass: 'absolute right-[-3rem] sm:right-0 mt-1.5 z-50 w-60 rounded-xl bg-[#ffffff] p-2 flex flex-col gap-1 text-[#2b2b2b] shadow-[5px_5px_0px_#2b2b2b] border-[2.5px] border-[#2b2b2b] animate-in fade-in zoom-in-95 duration-150 font-[\'Gaegu\'] font-bold',
            settingsBtnClass: 'flex items-center justify-center space-x-1.5 rounded-lg bg-[#ffffff] hover:bg-[#2ec4b6] px-2.5 py-1.5 text-xs font-bold text-[#2b2b2b] transition-all cursor-pointer border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5 font-[\'Gaegu\']',
            syncBtnClass: 'flex items-center justify-center space-x-1.5 rounded-lg bg-[#ffffff] hover:bg-[#2ec4b6] px-2.5 py-1.5 text-xs font-bold text-[#2b2b2b] transition-all cursor-pointer border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5 font-[\'Gaegu\']',
            saveBtnClass: 'flex items-center justify-center space-x-1.5 rounded-lg bg-[#ffffff] hover:bg-[#2ec4b6] px-2.5 py-1.5 text-xs font-bold text-[#2b2b2b] transition-all cursor-pointer border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5 font-[\'Gaegu\']',

            // 3. View Switcher & Navigasi Bulan: Card putih dengan border sketch
            viewSwitcherCardClass: 'flex flex-col md:flex-row md:items-center justify-between gap-1.5 sm:gap-2 bg-[#ffffff] p-1.5 sm:p-2 rounded-xl border-2 border-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b] font-[\'Gaegu\']',
            viewSwitcherPillsWrapperClass: 'flex flex-row flex-nowrap items-center overflow-x-auto no-scrollbar scroll-smooth p-1 gap-1 rounded-lg bg-[#f2efeb] border-2 border-[#2b2b2b] max-w-full min-w-0 shrink flex-1 font-[\'Gaegu\']',
            tabActiveClass: 'bg-[#ff4747] text-white shadow-[2px_2px_0px_#2b2b2b] font-bold rounded-md font-[\'Gaegu\'] text-base tracking-wide',
            tabInactiveClass: 'text-[#2b2b2b] hover:text-[#2b2b2b] hover:bg-[#2ec4b6]/25 rounded-md transition-colors duration-150 font-[\'Gaegu\'] text-base',
            monthNavBtnClass: 'rounded-lg border-2 border-[#2b2b2b] bg-[#ffffff] p-1.5 sm:p-2 text-[#2b2b2b] hover:bg-[#2ec4b6] transition-colors cursor-pointer shrink-0 shadow-[2px_2px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5',
            monthDisplayBtnClass: 'flex items-center justify-center space-x-1.5 sm:space-x-2 rounded-lg border-2 border-[#2b2b2b] bg-[#ffffff] hover:bg-[#f2efeb] px-2 sm:px-3 py-1 sm:py-1.5 text-base sm:text-lg font-bold text-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] transition-all cursor-pointer w-[140px] min-[380px]:w-[150px] sm:w-[176px] shrink-0 font-[\'Gochi_Hand\'] tracking-wide',
            todayBtnClass: 'flex items-center space-x-1 rounded-lg border-2 border-[#2b2b2b] bg-[#2ec4b6] hover:bg-[#26a89c] text-[#2b2b2b] px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-[2px_2px_0px_#2b2b2b] font-[\'Gaegu\'] text-base tracking-wide active:translate-x-0.5 active:translate-y-0.5',

            // 4. Sub-toolbar Aksi Kalender
            subToolbarCardClass: 'flex items-center justify-between rounded-xl bg-[#ffffff] p-1.5 sm:p-2.5 lg:px-3.5 shadow-[4px_4px_0px_#2b2b2b] border-2 border-[#2b2b2b] gap-2 font-[\'Gaegu\']',
            subToolbarTitleClass: 'text-sm sm:text-base font-bold text-[#2b2b2b] truncate font-[\'Gochi_Hand\'] tracking-wide',
            subToolbarDotClass: 'flex h-2.5 w-2.5 rounded-full bg-[#ff4747] border border-[#2b2b2b] shrink-0',
            pasteBtnClass: 'flex items-center space-x-1.5 rounded-lg border-2 border-[#2b2b2b] bg-[#ffffff] hover:bg-[#2ec4b6] text-[#2b2b2b] px-2 sm:px-2.5 py-1 sm:py-1.5 text-sm font-bold transition-all cursor-pointer shadow-[2px_2px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5 font-[\'Gaegu\']',
            undoBtnClass: 'flex items-center space-x-1.5 rounded-lg border-2 border-[#2b2b2b] bg-[#ffffff] hover:bg-[#2ec4b6] text-[#2b2b2b] px-2 sm:px-2.5 py-1 sm:py-1.5 text-sm font-bold transition-all cursor-pointer shadow-[2px_2px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5 font-[\'Gaegu\']',
            resetBtnClass: 'flex items-center space-x-1.5 rounded-lg border-2 border-[#2b2b2b] bg-[#ffffff] hover:bg-[#ff4747] hover:text-white text-[#2b2b2b] px-2 sm:px-2.5 py-1 sm:py-1.5 text-sm font-bold transition-all shadow-[2px_2px_0px_#2b2b2b] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 font-[\'Gaegu\']',
            lockBtnClass: 'flex items-center space-x-1.5 rounded-lg border-2 border-[#2b2b2b] bg-[#ffffff] text-[#2b2b2b] hover:bg-[#2ec4b6] px-2 sm:px-2.5 py-1 sm:py-1.5 text-sm font-bold transition-all cursor-pointer shadow-[2px_2px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5 font-[\'Gaegu\']',
            expandBtnClass: 'flex items-center space-x-1.5 rounded-lg border-2 border-[#2b2b2b] bg-[#ffffff] hover:bg-[#2ec4b6] text-[#2b2b2b] px-2 sm:px-2.5 py-1 sm:py-1.5 text-sm font-bold transition-all cursor-pointer shadow-[2px_2px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5 font-[\'Gaegu\']',

            // 5. Area Grid Kalender
            calendarContainerCardClass: 'rounded-xl sm:rounded-2xl bg-[#ffffff] p-1.5 sm:p-2.5 lg:p-3 shadow-[6px_6px_0px_#2b2b2b] border-[2.5px] border-[#2b2b2b] font-[\'Gaegu\']',
            dayNamesHeaderClass: 'grid grid-cols-7 gap-1 sm:gap-1.5 mb-1.5 sm:mb-2 rounded-lg bg-[#f2efeb] py-1.5 text-center text-sm sm:text-base font-[\'Gochi_Hand\'] font-bold border-2 border-[#2b2b2b]',
            weekdayNameTextClass: 'text-[#2b2b2b]',
            weekendNameTextClass: 'text-[#ff4747]',
            emptyCellClass: 'rounded-lg bg-[#f2efeb]/80 border-2 border-dashed border-[#2b2b2b]/30 p-1',

            // 6. Summary Cards Panel
            summaryPanelCardClass: 'rounded-xl sm:rounded-2xl bg-[#ffffff] p-3 sm:p-3.5 shadow-[4px_4px_0px_#2b2b2b] border-2 border-[#2b2b2b] font-[\'Gaegu\']',
            summaryTitleClass: 'text-sm sm:text-base font-bold text-[#2b2b2b] flex items-center font-[\'Gochi_Hand\'] tracking-wide',
            summaryHeaderBorderClass: 'border-b-2 border-dashed border-[#2b2b2b] pb-2',
            summarySubtextClass: 'text-xs text-[#2b2b2b]/70 font-mono',

            // 7. Modal & Pop-up
            modalCardClass: 'rounded-2xl bg-[#ffffff] border-[3px] border-[#2b2b2b] shadow-[8px_8px_0px_#2b2b2b] text-[#2b2b2b] font-[\'Gaegu\']',
            modalHeaderClass: 'border-b-2 border-[#2b2b2b] bg-[#f2efeb] px-4 py-3 font-[\'Gochi_Hand\']',
            modalTitleClass: 'text-base sm:text-lg font-bold text-[#2b2b2b] font-[\'Gochi_Hand\'] tracking-wide',
            modalBodyClass: 'bg-[#ffffff] text-[#2b2b2b] font-[\'Gaegu\']',

            // 8. Mobile Drawer & FAB
            mobileFabClass: 'flex h-13 w-13 items-center justify-center rounded-2xl bg-[#ff4747] text-white shadow-[3px_3px_0px_#2b2b2b] border-2 border-[#2b2b2b] active:scale-95 transition-all cursor-pointer',
            mobileDrawerClass: 'relative z-10 w-full max-w-lg rounded-t-3xl bg-[#ffffff] p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto border-t-[3px] border-[#2b2b2b] text-[#2b2b2b] font-[\'Gaegu\']',
            mobileDrawerHeaderClass: 'border-b-2 border-[#2b2b2b] pb-3 bg-[#f2efeb]',
            mobileDrawerTitleClass: 'text-base font-bold text-[#2b2b2b] font-[\'Gochi_Hand\'] tracking-wide',
            mobileDrawerSubtextClass: 'text-xs text-[#2b2b2b]/70 font-mono',
            mobileDrawerNavBtnActive: 'bg-[#ff4747] text-white font-bold rounded-lg border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] font-[\'Gaegu\'] text-sm tracking-wide',
            mobileDrawerNavBtnInactive: 'text-[#2b2b2b] hover:bg-[#2ec4b6]/20 rounded-lg font-[\'Gaegu\'] text-sm tracking-wide',
            mobileNavItemActiveClass: 'bg-[#ff4747] text-white border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] font-[\'Gaegu\']',
            mobileNavItemInactiveClass: 'text-[#2b2b2b] hover:bg-[#2ec4b6]/20 font-[\'Gaegu\']',

            // 9. Desktop Left Side Menu
            sidebarClass: 'border-r-[2.5px] border-[#2b2b2b] shadow-[4px_0_0px_#2b2b2b] text-[#2b2b2b] relative overflow-hidden font-[\'Gaegu\']',
            sidebarItemActiveClass: 'bg-[#ff4747] text-white font-bold rounded-[5px] border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] font-[\'Gaegu\'] text-xs min-[1400px]:text-sm tracking-wide',
            sidebarItemInactiveClass: 'text-[#2b2b2b] hover:bg-[#2ec4b6] rounded-[5px] border-2 border-transparent hover:border-[#2b2b2b] hover:shadow-[1px_1px_0px_#2b2b2b] transition-all font-[\'Gaegu\'] text-xs min-[1400px]:text-sm tracking-wide',
            sidebarDividerClass: 'border-b-2 border-dashed border-[#2b2b2b]',
        };
    }

    if (isDark) {
        return {
            theme,
            isDefault: false,
            isDark: true,
            isVista: false,
            isWinamp: false,
            isPaperSketch: false,
            isTechnical: false,
            isEditorial: false,
            isIndustrial: false,
            isDashboard: false,
            palette: themes.dark,
            penugasanColors,

            // 1. Kanvas Utama: #121212 bg, #E0E0E0 text
            wrapperClass: 'min-h-screen min-h-[100dvh] w-full bg-[#121212] text-[#E0E0E0] flex flex-col font-sans relative selection:bg-slate-700 selection:text-white md:h-screen md:max-h-screen md:overflow-hidden',

            // 2. Top Header / Navbar: #1A1A1A, border #333333
            navbarClass: 'sticky top-0 z-50 bg-[#1A1A1A] text-[#E0E0E0] border-b border-[#333333] shadow-[0_4px_20px_rgba(0,0,0,0.8)] shrink-0',
            logoContainerClass: 'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#252525] text-white shadow-sm ring-1 ring-white/10 shrink-0',
            titleClass: 'text-xs sm:text-sm md:text-base font-extrabold tracking-tight truncate text-[#FFFFFF]',
            versionBadgeClass: 'bg-[#2A2A2A] text-slate-300 border border-[#444444] text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-bold',
            subtitleClass: 'hidden sm:block text-[10.5px] text-slate-400 font-medium line-clamp-1',
            supabaseBadgeClass: 'hidden lg:flex items-center space-x-1.5 rounded-lg bg-[#252525] px-2.5 py-1 text-xs border border-[#444444] text-[#E0E0E0]',
            holidayBtnClass: 'flex items-center space-x-1.5 rounded-lg bg-[#991B1B] hover:bg-[#B91C1C] px-2.5 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer border border-[#EF4444]/30 shadow-xs',
            themeDropdownBtnClass: 'h-8 sm:h-9 flex items-center justify-center gap-2 rounded-lg bg-[#2a2f3b] hover:bg-[#323741] px-3 text-xs font-bold text-white transition-all duration-200 cursor-pointer border border-[#3e4452] shadow-xs select-none',
            themeDropdownMenuClass: 'absolute right-[-3rem] sm:right-0 mt-1.5 z-50 w-56 rounded-[5px] bg-[#2a2f3b] p-[5px] flex flex-col gap-1 text-white shadow-2xl ring-1 ring-white/10 border border-[#3e4452] animate-in fade-in zoom-in-95 duration-200',
            settingsBtnClass: 'flex items-center justify-center space-x-1.5 rounded-lg bg-[#252525] hover:bg-[#333333] px-2.5 py-1.5 text-xs font-bold text-slate-100 transition-colors cursor-pointer border border-[#444444] shadow-xs',
            syncBtnClass: 'flex items-center justify-center space-x-1.5 rounded-lg bg-[#252525] hover:bg-[#333333] px-2.5 py-1.5 text-xs font-bold text-slate-100 transition-colors cursor-pointer border border-[#444444] shadow-xs',
            saveBtnClass: 'flex items-center justify-center space-x-1.5 rounded-lg bg-[#252525] hover:bg-[#333333] px-2.5 py-1.5 text-xs font-bold text-slate-100 transition-colors cursor-pointer border border-[#444444] shadow-xs',

            // 3. View Switcher & Navigasi Bulan: #1E1E1E card, #333333 border
            viewSwitcherCardClass: 'flex flex-col md:flex-row md:items-center justify-between gap-1.5 sm:gap-2 bg-[#1E1E1E] p-1 sm:p-1.5 lg:p-1.5 rounded-xl sm:rounded-2xl border border-[#333333] shadow-md',
            viewSwitcherPillsWrapperClass: 'flex flex-row flex-nowrap items-center overflow-x-auto no-scrollbar scroll-smooth p-1 gap-0.5 sm:gap-1 lg:gap-1.5 rounded-xl bg-[#141414] border border-[#2B2B2B] max-w-full min-w-0 shrink flex-1',
            tabActiveClass: 'bg-violet-600 text-white shadow-2xs font-extrabold rounded-lg',
            tabInactiveClass: 'text-slate-400 hover:text-white hover:bg-[#2A2A2A] rounded-lg transition-colors duration-150',
            monthNavBtnClass: 'rounded-lg sm:rounded-xl border border-[#333333] bg-[#252525] p-1.5 sm:p-2 text-[#E0E0E0] hover:bg-[#333333] hover:text-white transition-colors cursor-pointer shrink-0 shadow-2xs',
            monthDisplayBtnClass: 'flex items-center justify-center space-x-1.5 sm:space-x-2 rounded-lg sm:rounded-xl border border-[#444444] bg-[#252525] hover:bg-[#303030] px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-extrabold text-[#FFFFFF] shadow-xs transition-all cursor-pointer w-[132px] min-[380px]:w-[142px] sm:w-[168px] shrink-0',
            todayBtnClass: 'flex items-center space-x-1 rounded-lg sm:rounded-xl border border-blue-500/30 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs',

            // 4. Sub-toolbar Aksi Kalender
            subToolbarCardClass: 'flex items-center justify-between rounded-xl sm:rounded-2xl bg-[#1E1E1E] p-1.5 sm:p-2.5 lg:px-3.5 shadow-xs border border-[#333333] gap-2',
            subToolbarTitleClass: 'text-xs sm:text-sm font-extrabold text-[#E0E0E0] truncate',
            subToolbarDotClass: 'flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-blue-500 shrink-0',
            pasteBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-[#444444] bg-[#252525] hover:bg-[#333333] text-[#E0E0E0] px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs',
            undoBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-[#444444] bg-[#252525] hover:bg-[#333333] text-[#E0E0E0] px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs',
            resetBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-[#444444] bg-[#252525] hover:bg-[#333333] text-[#E0E0E0] px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer',
            lockBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-[#444444] bg-[#252525] text-[#E0E0E0] hover:bg-[#333333] px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs',
            expandBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-[#444444] bg-[#252525] hover:bg-[#333333] text-[#E0E0E0] px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs',

            // 5. Area Grid Kalender
            calendarContainerCardClass: 'rounded-xl sm:rounded-2xl bg-[#1E1E1E] p-1 sm:p-2 lg:p-2.5 shadow-lg border border-[#333333]',
            dayNamesHeaderClass: 'grid grid-cols-7 gap-1 sm:gap-1.5 mb-1 sm:mb-1.5 rounded-lg sm:rounded-xl bg-[#151515] py-1 sm:py-1 text-center text-[10.5px] min-[380px]:text-[11.5px] sm:text-xs lg:text-sm font-black border border-[#2B2B2B]',
            weekdayNameTextClass: 'text-[#B0B0B0]',
            weekendNameTextClass: 'text-[#FF6B6B]',
            emptyCellClass: 'rounded-lg sm:rounded-xl bg-[#141414] p-1',

            // 6. Summary Cards Panel
            summaryPanelCardClass: 'rounded-xl sm:rounded-2xl bg-[#1E1E1E] p-2.5 sm:p-3 lg:p-3.5 shadow-lg border border-[#333333]',
            summaryTitleClass: 'text-xs sm:text-sm font-extrabold text-[#FFFFFF] flex items-center',
            summaryHeaderBorderClass: 'border-b border-[#333333] pb-1.5',
            summarySubtextClass: 'text-[10px] sm:text-xs text-slate-400 font-medium',

            // 7. Modal & Pop-up
            modalCardClass: 'bg-[#1E1E1E] border border-[#333333] text-[#E0E0E0] shadow-2xl rounded-2xl',
            modalHeaderClass: 'border-b border-[#333333]',
            modalTitleClass: 'text-sm sm:text-base font-extrabold text-white',
            modalBodyClass: 'text-[#E0E0E0]',

            // 8. Mobile Drawer & FAB
            mobileFabClass: 'flex h-14 w-14 items-center justify-center rounded-full bg-[#252525] text-white shadow-xl hover:bg-[#333333] active:scale-95 transition-all border-2 border-[#444444] cursor-pointer',
            mobileDrawerClass: 'relative z-10 w-full max-w-lg rounded-t-3xl bg-[#1E1E1E] p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto border-t border-[#333333] text-[#E0E0E0]',
            mobileDrawerHeaderClass: 'border-b border-[#333333] pb-3',
            mobileDrawerTitleClass: 'text-sm font-extrabold text-white',
            mobileDrawerSubtextClass: 'text-[11px] text-slate-400 font-medium',
            mobileDrawerNavBtnActive: 'bg-[#121214] text-emerald-400 font-extrabold border border-emerald-500/40 shadow-[inset_0_3px_6px_rgba(0,0,0,0.8)] translate-y-0.5 rounded-xl',
            mobileDrawerNavBtnInactive: 'bg-[#222224] text-zinc-300 hover:text-white hover:bg-[#2A2A2E] shadow-md shadow-black/50 border border-[#333338] hover:-translate-y-0.5 active:translate-y-0.5 rounded-xl font-semibold transition-all duration-150',
            mobileNavItemActiveClass: 'bg-[#121214] text-emerald-400 font-extrabold border border-emerald-500/40 shadow-[inset_0_3px_6px_rgba(0,0,0,0.8)] translate-y-0.5 rounded-xl',
            mobileNavItemInactiveClass: 'bg-[#222224] text-zinc-300 hover:text-white hover:bg-[#2A2A2E] shadow-md shadow-black/50 border border-[#333338] hover:-translate-y-0.5 active:translate-y-0.5 rounded-xl font-semibold transition-all duration-150',

            // 9. Desktop Left Side Menu
            sidebarClass: 'bg-[#161618]/95 backdrop-blur-md border-r border-zinc-800/80 shadow-2xl z-20',
            sidebarItemActiveClass: 'bg-[#121214] text-emerald-400 font-extrabold border border-emerald-500/40 shadow-[inset_0_3px_6px_rgba(0,0,0,0.8)] translate-y-0.5 rounded-[7px]',
            sidebarItemInactiveClass: 'bg-[#222224] text-zinc-300 hover:text-white hover:bg-[#2A2A2E] shadow-md shadow-black/50 border border-[#333338] hover:-translate-y-0.5 rounded-[7px] font-semibold transition-all duration-150',
            sidebarDividerClass: 'border-t border-zinc-800/80',
        };
    }

    if (isVista) {
        return {
            theme,
            isDefault: false,
            isDark: false,
            isVista: true,
            isWinamp: false,
            isPaperSketch: false,
            isTechnical: false,
            isEditorial: false,
            isIndustrial: false,
            isDashboard: false,
            penugasanColors,

            // 1. Kanvas Utama: Radial gradient aero glass
            wrapperClass: 'min-h-screen min-h-[100dvh] w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-blue-200 to-indigo-100 text-[#0F172A] flex flex-col font-sans relative selection:bg-sky-200 selection:text-sky-900 md:h-screen md:max-h-screen md:overflow-hidden',

            // 2. Top Header / Navbar: Translucent Aero Glass
            navbarClass: 'sticky top-0 z-50 bg-sky-950/45 backdrop-blur-xl text-white border-b border-white/25 shadow-lg shrink-0',
            logoContainerClass: 'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-xs border border-white/40 shrink-0',
            titleClass: 'text-xs sm:text-sm md:text-base font-extrabold tracking-tight truncate text-white drop-shadow-xs',
            versionBadgeClass: 'bg-white/20 text-sky-200 border border-white/30 text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-bold backdrop-blur-xs',
            subtitleClass: 'hidden sm:block text-[10.5px] text-sky-100/90 font-medium line-clamp-1',
            supabaseBadgeClass: 'hidden lg:flex items-center space-x-1.5 rounded-lg bg-white/10 backdrop-blur-xs px-2.5 py-1 text-xs border border-white/20 text-white',
            holidayBtnClass: 'flex items-center space-x-1.5 rounded-lg bg-rose-600/85 hover:bg-rose-700 px-2.5 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer border border-rose-300/40 shadow-xs backdrop-blur-xs',
            themeDropdownBtnClass: 'h-8 sm:h-9 flex items-center justify-center gap-2 rounded-lg bg-white/70 hover:bg-white px-3 text-xs font-bold text-slate-900 transition-all duration-200 cursor-pointer border border-sky-300 backdrop-blur-md shadow-xs select-none',
            themeDropdownMenuClass: 'absolute right-[-3rem] sm:right-0 mt-1.5 z-50 w-56 rounded-[5px] bg-white/95 backdrop-blur-2xl p-[5px] flex flex-col gap-1 text-[#0F172A] shadow-2xl ring-1 ring-sky-300/40 border border-sky-200 animate-in fade-in zoom-in-95 duration-200',
            settingsBtnClass: 'flex items-center justify-center space-x-1.5 rounded-lg bg-white/15 hover:bg-white/25 px-2.5 py-1.5 text-xs font-bold text-white transition-all cursor-pointer border border-white/30 backdrop-blur-xs shadow-xs',
            syncBtnClass: 'flex items-center justify-center space-x-1.5 rounded-lg bg-white/15 hover:bg-white/25 px-2.5 py-1.5 text-xs font-bold text-white transition-all cursor-pointer border border-white/30 backdrop-blur-xs shadow-xs',
            saveBtnClass: 'flex items-center justify-center space-x-1.5 rounded-lg bg-white/15 hover:bg-white/25 px-2.5 py-1.5 text-xs font-bold text-white transition-all cursor-pointer border border-white/30 backdrop-blur-xs shadow-xs',

            // 3. View Switcher & Navigasi Bulan: Glassmorphism
            viewSwitcherCardClass: 'flex flex-col md:flex-row md:items-center justify-between gap-1.5 sm:gap-2 bg-white/45 backdrop-blur-xl p-1 sm:p-1.5 lg:p-1.5 rounded-xl sm:rounded-2xl border border-white/70 shadow-xs',
            viewSwitcherPillsWrapperClass: 'flex flex-row flex-nowrap items-center overflow-x-auto no-scrollbar scroll-smooth p-1 gap-0.5 sm:gap-1 lg:gap-1.5 rounded-xl bg-white/30 backdrop-blur-xs border border-white/40 max-w-full min-w-0 shrink flex-1',
            tabActiveClass: 'bg-white/95 border border-white text-sky-950 shadow-2xs font-extrabold rounded-lg',
            tabInactiveClass: 'text-slate-800 hover:bg-white/50 rounded-lg transition-colors duration-150 font-semibold',
            monthNavBtnClass: 'rounded-lg sm:rounded-xl border border-white/80 bg-white/85 text-slate-900 hover:bg-white transition-all cursor-pointer shrink-0 shadow-sm backdrop-blur-md',
            monthDisplayBtnClass: 'flex items-center justify-center space-x-1.5 sm:space-x-2 rounded-lg sm:rounded-xl border border-white/90 bg-white/90 hover:bg-white px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-extrabold text-sky-950 shadow-md backdrop-blur-md transition-all cursor-pointer w-[132px] min-[380px]:w-[142px] sm:w-[168px] shrink-0',
            todayBtnClass: 'flex items-center space-x-1 rounded-lg sm:rounded-xl border border-white/80 bg-white/85 hover:bg-white text-sky-950 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold backdrop-blur-md transition-all cursor-pointer shrink-0 shadow-sm',

            // 4. Sub-toolbar Aksi Kalender
            subToolbarCardClass: 'flex items-center justify-between rounded-xl sm:rounded-2xl bg-white/45 backdrop-blur-xl p-1.5 sm:p-2.5 lg:px-3.5 shadow-xs border border-white/70 gap-2',
            subToolbarTitleClass: 'text-xs sm:text-sm font-extrabold text-white truncate drop-shadow-md',
            subToolbarDotClass: 'flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-sky-400 shrink-0 shadow-[0_0_8px_rgba(56,189,248,0.8)]',
            pasteBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-white/80 bg-white/80 hover:bg-white text-slate-900 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shadow-sm backdrop-blur-md',
            undoBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-white/80 bg-white/80 hover:bg-white text-slate-900 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shadow-sm backdrop-blur-md',
            resetBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-white/80 bg-white/80 hover:bg-white text-slate-900 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer backdrop-blur-md',
            lockBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-white/80 bg-white/80 text-slate-900 hover:bg-white px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shadow-sm backdrop-blur-md',
            expandBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-white/80 bg-white/80 hover:bg-white text-slate-900 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shadow-sm backdrop-blur-md',

            // 5. Area Grid Kalender
            calendarContainerCardClass: 'rounded-xl sm:rounded-2xl bg-white/45 backdrop-blur-xl p-1 sm:p-2 lg:p-2.5 shadow-[0_8px_30px_rgba(14,116,224,0.12)] border border-white/70',
            dayNamesHeaderClass: 'grid grid-cols-7 gap-1 sm:gap-1.5 mb-1 sm:mb-1.5 rounded-lg sm:rounded-xl bg-white/85 backdrop-blur-md py-1 sm:py-1 text-center text-[10.5px] min-[380px]:text-[11.5px] sm:text-xs lg:text-sm font-black border border-white/60 shadow-2xs',
            weekdayNameTextClass: 'text-slate-800',
            weekendNameTextClass: 'text-[#BE1A1A]',
            emptyCellClass: 'rounded-lg sm:rounded-xl bg-white/25 backdrop-blur-xs p-1 border border-white/30',

            // 6. Summary Cards Panel
            summaryPanelCardClass: 'rounded-xl sm:rounded-2xl bg-white/45 backdrop-blur-xl p-2.5 sm:p-3 lg:p-3.5 shadow-[0_8px_30px_rgba(14,116,224,0.12)] border border-white/70',
            summaryTitleClass: 'text-xs sm:text-sm font-extrabold text-[#0F172A] flex items-center',
            summaryHeaderBorderClass: 'border-b border-white/50 pb-1.5',
            summarySubtextClass: 'text-[10px] sm:text-xs text-slate-600 font-medium',

            // 7. Modal & Pop-up
            modalCardClass: 'bg-white/75 backdrop-blur-2xl border border-white/80 text-[#0F172A] shadow-[0_25px_60px_rgba(14,116,224,0.3)] rounded-2xl',
            modalHeaderClass: 'border-b border-white/40',
            modalTitleClass: 'text-sm sm:text-base font-extrabold text-[#0F172A]',
            modalBodyClass: 'text-[#0F172A]',

            // 8. Mobile Drawer & FAB
            mobileFabClass: 'flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/90 backdrop-blur-md text-white shadow-xl hover:bg-sky-600 active:scale-95 transition-all border-2 border-white/60 cursor-pointer',
            mobileDrawerClass: 'relative z-10 w-full max-w-lg rounded-t-3xl bg-white/75 backdrop-blur-2xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto border-t border-white/80 text-[#0F172A]',
            mobileDrawerHeaderClass: 'border-b border-white/50 pb-3',
            mobileDrawerTitleClass: 'text-sm font-extrabold text-[#0F172A]',
            mobileDrawerSubtextClass: 'text-[11px] text-slate-600 font-medium',
            mobileDrawerNavBtnActive: 'bg-sky-100/95 text-sky-950 font-extrabold border border-sky-400 shadow-[inset_0_3px_6px_rgba(0,0,0,0.15)] translate-y-0.5 rounded-xl',
            mobileDrawerNavBtnInactive: 'bg-white/60 backdrop-blur-md text-slate-700 hover:text-slate-950 hover:bg-white/90 shadow-md shadow-sky-900/10 border border-white/80 hover:-translate-y-0.5 active:translate-y-0.5 rounded-xl font-semibold transition-all duration-150',
            mobileNavItemActiveClass: 'bg-sky-100/95 text-sky-950 font-extrabold border border-sky-400 shadow-[inset_0_3px_6px_rgba(0,0,0,0.15)] translate-y-0.5 rounded-xl',
            mobileNavItemInactiveClass: 'bg-white/60 backdrop-blur-md text-slate-700 hover:text-slate-950 hover:bg-white/90 shadow-md shadow-sky-900/10 border border-white/80 hover:-translate-y-0.5 active:translate-y-0.5 rounded-xl font-semibold transition-all duration-150',

            // 9. Desktop Left Side Menu
            sidebarClass: 'bg-white/60 backdrop-blur-2xl border-r border-white/70 shadow-[8px_0_30px_rgba(14,116,224,0.12)] z-20',
            sidebarItemActiveClass: 'bg-gradient-to-r from-sky-400/30 to-blue-500/20 text-sky-950 font-extrabold border border-white/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_4px_12px_rgba(14,116,224,0.15)] rounded-[7px]',
            sidebarItemInactiveClass: 'bg-white/40 backdrop-blur-md text-slate-700 hover:text-slate-950 hover:bg-white/70 shadow-xs border border-white/60 hover:-translate-y-0.5 rounded-[7px] font-semibold transition-all duration-150',
            sidebarDividerClass: 'border-t border-white/50',
        };
    }

    if (isWinamp) {
        return {
            theme,
            isDefault: false,
            isDark: false,
            isVista: false,
            isWinamp: true,
            isPaperSketch: false,
            isTechnical: false,
            isEditorial: false,
            isIndustrial: false,
            isDashboard: false,
            penugasanColors,

            // 1. Kanvas Utama: #2C2E3B, text #00FF00, font-mono, rounded-none!
            wrapperClass: 'min-h-screen min-h-[100dvh] w-full bg-[#2C2E3B] text-[#00FF00] flex flex-col font-mono relative rounded-none selection:bg-[#00FF00] selection:text-black md:h-screen md:max-h-screen md:overflow-hidden',

            // 2. Top Header / Navbar: Gradient #4A4D64 -> #2D2E40, border #000000
            navbarClass: 'sticky top-0 z-50 bg-gradient-to-b from-[#4A4D64] to-[#2D2E40] text-[#FACC15] border-b-2 border-[#000000] font-mono shadow-none shrink-0',
            logoContainerClass: 'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-none bg-[#000000] text-[#FACC15] border border-[#555555] shrink-0',
            titleClass: 'text-xs sm:text-sm md:text-base font-bold tracking-tight truncate text-[#FACC15] font-mono',
            versionBadgeClass: 'bg-[#000000] text-[#00FF00] border border-[#00FF00]/50 text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-none font-mono font-bold',
            subtitleClass: 'hidden sm:block text-[10.5px] text-slate-300 font-mono line-clamp-1',
            supabaseBadgeClass: 'hidden lg:flex items-center space-x-1.5 rounded-none bg-[#000000] px-2.5 py-1 text-xs border border-[#00FF00]/60 text-[#00FF00] font-mono',
            holidayBtnClass: 'flex items-center space-x-1.5 rounded-none bg-[#FF3366] hover:bg-rose-700 px-2.5 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer border border-black font-mono shadow-none',
            themeDropdownBtnClass: 'h-8 sm:h-9 flex items-center justify-center gap-2 rounded-none bg-[#000000] hover:bg-[#00FF00] hover:text-black px-3 text-xs font-bold text-[#00FF00] transition-all duration-200 cursor-pointer border border-[#00FF00] font-mono shadow-none select-none',
            themeDropdownMenuClass: 'absolute right-[-3rem] sm:right-0 mt-1.5 z-50 w-56 rounded-none bg-[#1C1C1E] p-[5px] flex flex-col gap-1 text-[#00FF00] shadow-none border-2 border-[#00FF00] font-mono animate-in fade-in duration-75',
            settingsBtnClass: 'flex items-center justify-center space-x-1.5 rounded-none bg-[#000000] hover:bg-[#00FF00] hover:text-black px-2.5 py-1.5 text-xs font-bold text-[#00FF00] transition-colors cursor-pointer border border-[#00FF00] font-mono shadow-none',
            syncBtnClass: 'flex items-center justify-center space-x-1.5 rounded-none bg-[#000000] hover:bg-[#00FF00] hover:text-black px-2.5 py-1.5 text-xs font-bold text-[#00FF00] transition-colors cursor-pointer shadow-none border border-[#00FF00] font-mono',
            saveBtnClass: 'flex items-center justify-center space-x-1.5 rounded-none bg-[#000000] hover:bg-[#00FF00] hover:text-black px-2.5 py-1.5 text-xs font-bold text-[#00FF00] transition-colors cursor-pointer shadow-none border border-[#00FF00] font-mono',

            // 3. View Switcher & Navigasi Bulan: Boxy retro
            viewSwitcherCardClass: 'flex flex-col md:flex-row md:items-center justify-between gap-1.5 sm:gap-2 bg-[#1C1C1E] p-1 sm:p-1.5 lg:p-1.5 rounded-none border-2 border-[#555555] font-mono shadow-none',
            viewSwitcherPillsWrapperClass: 'flex flex-row flex-nowrap items-center overflow-x-auto no-scrollbar scroll-smooth p-1 gap-0.5 sm:gap-1 lg:gap-1.5 rounded-none bg-[#000000] border border-[#333333] max-w-full min-w-0 shrink flex-1',
            tabActiveClass: 'bg-[#000000] border border-[#00FF00] text-[#00FF00] rounded-none font-mono font-bold shadow-none',
            tabInactiveClass: 'text-slate-300 hover:bg-[#333333] hover:text-[#00FF00] rounded-none font-mono transition-colors duration-150',
            monthNavBtnClass: 'rounded-none border border-[#555555] bg-[#000000] p-1.5 sm:p-2 text-[#00FF00] hover:bg-[#00FF00] hover:text-black transition-colors cursor-pointer shrink-0 shadow-none font-mono',
            monthDisplayBtnClass: 'flex items-center justify-center space-x-1.5 sm:space-x-2 rounded-none border border-[#00FF00] bg-[#000000] hover:bg-[#00FF00]/20 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-bold text-[#FACC15] shadow-none transition-all cursor-pointer font-mono w-[132px] min-[380px]:w-[142px] sm:w-[168px] shrink-0',
            todayBtnClass: 'flex items-center space-x-1 rounded-none border border-[#00FF00] bg-[#000000] hover:bg-[#00FF00] hover:text-black text-[#00FF00] px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-none font-mono',

            // 4. Sub-toolbar Aksi Kalender
            subToolbarCardClass: 'flex items-center justify-between rounded-none bg-[#1C1C1E] p-1.5 sm:p-2.5 lg:px-3.5 shadow-none border-2 border-[#555555] gap-2 font-mono',
            subToolbarTitleClass: 'text-xs sm:text-sm font-bold text-[#FACC15] truncate font-mono',
            subToolbarDotClass: 'flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-none bg-[#00FF00] shrink-0',
            pasteBtnClass: 'flex items-center space-x-1.5 rounded-none border border-[#555555] bg-[#000000] hover:bg-[#00FF00] hover:text-black text-[#00FF00] px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shadow-none font-mono',
            undoBtnClass: 'flex items-center space-x-1.5 rounded-none border border-[#555555] bg-[#000000] hover:bg-[#00FF00] hover:text-black text-[#00FF00] px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shadow-none font-mono',
            resetBtnClass: 'flex items-center space-x-1.5 rounded-none border border-[#555555] bg-[#000000] hover:bg-[#00FF00] hover:text-black text-[#00FF00] px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all shadow-none cursor-pointer font-mono',
            lockBtnClass: 'flex items-center space-x-1.5 rounded-none border border-[#555555] bg-[#000000] text-[#00FF00] hover:bg-[#00FF00] hover:text-black px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shadow-none font-mono',
            expandBtnClass: 'flex items-center space-x-1.5 rounded-none border border-[#555555] bg-[#000000] hover:bg-[#00FF00] hover:text-black px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold text-[#00FF00] transition-all cursor-pointer font-mono',

            // 5. Area Grid Kalender
            calendarContainerCardClass: 'rounded-none bg-[#1C1C1E] p-1 sm:p-2 lg:p-2.5 shadow-none border-2 border-[#555555] font-mono',
            dayNamesHeaderClass: 'grid grid-cols-7 gap-1 sm:gap-1.5 mb-1 sm:mb-1.5 rounded-none bg-[#000000] py-1 sm:py-1 text-center text-[10.5px] min-[380px]:text-[11.5px] sm:text-xs lg:text-sm font-black border border-[#555555] font-mono',
            weekdayNameTextClass: 'text-[#00FF00]',
            weekendNameTextClass: 'text-[#FF3333]',
            emptyCellClass: 'rounded-none bg-[#000000] p-1 border border-[#333333]',

            // 6. Summary Cards Panel
            summaryPanelCardClass: 'rounded-none bg-[#1C1C1E] p-2.5 sm:p-3 lg:p-3.5 shadow-none border-2 border-[#555555] font-mono',
            summaryTitleClass: 'text-xs sm:text-sm font-bold text-[#00FF00] flex items-center font-mono',
            summaryHeaderBorderClass: 'border-b border-[#555555] pb-1.5',
            summarySubtextClass: 'text-[10px] sm:text-xs text-[#FACC15] font-mono',

            // 7. Modal & Pop-up
            modalCardClass: 'bg-[#1C1C1E] border-2 border-[#555555] text-[#00FF00] rounded-none font-mono shadow-none',
            modalHeaderClass: 'border-b border-[#555555]',
            modalTitleClass: 'text-sm sm:text-base font-bold text-[#FACC15] font-mono',
            modalBodyClass: 'text-[#00FF00] font-mono',

            // 8. Mobile Drawer & FAB
            mobileFabClass: 'flex h-14 w-14 items-center justify-center rounded-none bg-[#000000] text-[#00FF00] shadow-none hover:bg-[#00FF00] hover:text-black active:scale-95 transition-all border-2 border-[#00FF00] cursor-pointer font-mono',
            mobileDrawerClass: 'relative z-10 w-full max-w-lg rounded-none bg-[#1C1C1E] p-5 shadow-none animate-in slide-in-from-bottom duration-150 max-h-[90vh] overflow-y-auto border-t-2 border-[#555555] text-[#00FF00] font-mono',
            mobileDrawerHeaderClass: 'border-b border-[#555555] pb-3',
            mobileDrawerTitleClass: 'text-sm font-bold text-[#FACC15] font-mono',
            mobileDrawerSubtextClass: 'text-[11px] text-[#00FF00]/80 font-mono',
            mobileDrawerNavBtnActive: 'bg-[#002200] text-[#00FF00] font-black border-2 border-[#00FF00] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] translate-y-0.5 rounded-none font-mono',
            mobileDrawerNavBtnInactive: 'bg-[#000000] text-emerald-400 hover:text-[#00FF00] hover:bg-[#111111] shadow-[2px_2px_0px_#555555] border-2 border-[#555555] rounded-none font-bold transition-all font-mono',
            mobileNavItemActiveClass: 'bg-[#002200] text-[#00FF00] font-black border-2 border-[#00FF00] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] translate-y-0.5 rounded-none font-mono',
            mobileNavItemInactiveClass: 'bg-[#000000] text-emerald-400 hover:text-[#00FF00] hover:bg-[#111111] shadow-[2px_2px_0px_#555555] border-2 border-[#555555] rounded-none font-bold transition-all font-mono',

            // 9. Desktop Left Side Menu
            sidebarClass: 'bg-[#1C1C1E] border-r-2 border-[#00FF00]/50 font-mono shadow-2xl z-20',
            sidebarItemActiveClass: 'bg-[#002200] text-[#00FF00] font-black border-2 border-[#00FF00] shadow-[inset_0_3px_6px_rgba(0,0,0,0.9)] translate-y-0.5 rounded-none',
            sidebarItemInactiveClass: 'bg-[#000000] text-emerald-400 hover:text-[#00FF00] hover:bg-[#111111] shadow-[2px_2px_0px_#555555] border-2 border-[#555555] rounded-none font-bold transition-all',
            sidebarDividerClass: 'border-t-2 border-[#555555]',
        };
    }

    // 0. TEMA DEFAULT (BRAND BARU)
    return {
        theme: 'default',
        isDefault: true,
        isDark: false,
        isVista: false,
        isWinamp: false,
        isPaperSketch: false,
        isTechnical: false,
        isEditorial: false,
        isIndustrial: false,
        isDashboard: false,
        palette: themes.light,
        penugasanColors,

        // 1. Kanvas Utama: #F6F7F8 bg, #011627 text
        wrapperClass: 'min-h-screen min-h-[100dvh] w-full bg-[#F6F7F8] text-[#011627] flex flex-col font-sans relative selection:bg-[#2EC4B6]/30 selection:text-[#011627] md:h-screen md:max-h-screen md:overflow-hidden',

        // 2. Top Header / Navbar: Light clean #FFFFFF, soft elevated drop shadow without static bottom border
        navbarClass: 'sticky top-0 z-50 bg-white/95 backdrop-blur-md text-[#011627] shadow-[0_1px_4px_rgba(0,0,0,0.08)] shrink-0',
        logoContainerClass: 'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-teal-50 text-[#0E7C7B] border border-teal-200/80 shadow-2xs shrink-0',
        titleClass: 'text-xs sm:text-sm md:text-base font-extrabold tracking-tight truncate text-[#011627]',
        versionBadgeClass: 'bg-teal-50 text-[#0E7C7B] border border-teal-200 text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-bold',
        subtitleClass: 'hidden sm:block text-[10.5px] text-[#666666] font-medium line-clamp-1',
        supabaseBadgeClass: 'hidden lg:flex items-center space-x-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs border border-slate-200 text-[#011627]',
        holidayBtnClass: 'flex items-center space-x-1.5 rounded-lg bg-[#FF3366] hover:bg-[#e02555] px-2.5 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer border border-[#FF3366]/40 shadow-xs',
        themeDropdownBtnClass: 'h-8 sm:h-9 flex items-center justify-center gap-2 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] px-3 text-xs font-bold text-[#011627] transition-all duration-200 cursor-pointer border border-[#CBD5E1] shadow-2xs select-none',
        themeDropdownMenuClass: 'absolute right-[-3rem] sm:right-0 mt-1.5 z-50 w-56 rounded-[5px] bg-[#FFFFFF] p-[5px] flex flex-col gap-1 text-[#011627] shadow-2xl ring-1 ring-black/10 border border-[#CBD5E1] animate-in fade-in zoom-in-95 duration-200',
        settingsBtnClass: 'flex items-center justify-center space-x-1.5 rounded-lg bg-[#F6F7F8] hover:bg-[#E2E8F0] px-3 py-1.5 text-xs font-bold text-[#011627] transition-all cursor-pointer border border-[#E2E8F0] shadow-2xs',
        syncBtnClass: 'flex items-center justify-center space-x-1.5 rounded-lg bg-[#F6F7F8] hover:bg-[#E2E8F0] px-3 py-1.5 text-xs font-bold text-[#011627] transition-all cursor-pointer border border-[#E2E8F0] shadow-2xs',
        saveBtnClass: 'flex items-center justify-center space-x-1.5 rounded-lg bg-[#F6F7F8] hover:bg-[#E2E8F0] px-3 py-1.5 text-xs font-bold text-[#011627] transition-all cursor-pointer border border-[#E2E8F0] shadow-2xs',

        // 3. View Switcher & Navigasi Bulan: Card putih #FFFFFF, border #E2E8F0
        viewSwitcherCardClass: 'flex flex-col md:flex-row md:items-center justify-between gap-1.5 sm:gap-2 bg-white p-1 sm:p-1.5 lg:p-1.5 rounded-lg border border-[#E2E8F0] shadow-xs',
        viewSwitcherPillsWrapperClass: 'flex flex-row flex-nowrap items-center overflow-x-auto no-scrollbar scroll-smooth p-1 gap-0.5 sm:gap-1 lg:gap-1.5 rounded-lg bg-[#F6F7F8] border border-[#E2E8F0] max-w-full min-w-0 shrink flex-1',
        tabActiveClass: 'bg-[#2EC4B6] text-white shadow-2xs font-extrabold rounded-lg',
        tabInactiveClass: 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-zinc-800/60 rounded-lg transition-colors duration-150',
        monthNavBtnClass: 'rounded-lg border border-[#E2E8F0] bg-[#F6F7F8] p-1.5 sm:p-2 text-[#011627] hover:bg-[#E2E8F0] transition-colors cursor-pointer shrink-0 shadow-2xs',
        monthDisplayBtnClass: 'flex items-center justify-center space-x-1.5 sm:space-x-2 rounded-lg border border-[#20A4F3]/30 bg-[#20A4F3]/10 hover:bg-[#20A4F3]/20 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-extrabold text-[#20A4F3] shadow-xs transition-all cursor-pointer w-[132px] min-[380px]:w-[142px] sm:w-[168px] shrink-0',
        todayBtnClass: 'flex items-center space-x-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-[#011627] px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs',

        // 4. Sub-toolbar Aksi Kalender
        subToolbarCardClass: 'flex items-center justify-between rounded-lg bg-white p-1.5 sm:p-2.5 lg:px-3.5 shadow-xs border border-[#E2E8F0] gap-2',
        subToolbarTitleClass: 'text-xs sm:text-sm font-extrabold text-[#011627] truncate',
        subToolbarDotClass: 'flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#20A4F3] shrink-0',
        pasteBtnClass: 'flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-[#011627] px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs',
        undoBtnClass: 'flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-[#011627] px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs',
        resetBtnClass: 'flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-[#011627] px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer',
        lockBtnClass: 'flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white text-[#011627] hover:bg-slate-100 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs',
        expandBtnClass: 'flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 px-2.5 py-1 sm:py-1.5 text-xs font-bold text-[#011627] transition-all cursor-pointer shadow-xs',

        // 5. Area Grid Kalender
        calendarContainerCardClass: 'rounded-lg bg-white p-1 sm:p-2 lg:p-2.5 shadow-xs border border-[#E2E8F0]',
        dayNamesHeaderClass: 'grid grid-cols-7 gap-1 sm:gap-1.5 mb-1 sm:mb-1.5 rounded-lg bg-[#F6F7F8] py-1 sm:py-1 text-center text-[10.5px] min-[380px]:text-[11.5px] sm:text-xs lg:text-sm font-black border border-[#E2E8F0]',
        weekdayNameTextClass: 'text-[#011627]',
        weekendNameTextClass: 'text-[#FF3366]',
        emptyCellClass: 'rounded-lg bg-[#F6F7F8]/60 p-1',

        // 6. Summary Cards Panel
        summaryPanelCardClass: 'rounded-lg bg-white p-2.5 sm:p-3 lg:p-3.5 shadow-xs border border-[#E2E8F0]',
        summaryTitleClass: 'text-xs sm:text-sm font-extrabold text-[#011627] flex items-center',
        summaryHeaderBorderClass: 'border-b border-[#E2E8F0] pb-1.5',
        summarySubtextClass: 'text-[10px] sm:text-xs text-slate-500 font-medium',

        // 7. Modal & Pop-up
        modalCardClass: 'bg-white border border-[#E2E8F0] text-[#011627] shadow-2xl rounded-lg',
        modalHeaderClass: 'border-b border-[#E2E8F0]',
        modalTitleClass: 'text-sm sm:text-base font-extrabold text-[#011627]',
        modalBodyClass: 'text-[#011627]',

        // 8. Mobile Drawer & FAB
        mobileFabClass: 'flex h-14 w-14 items-center justify-center rounded-full bg-[#20A4F3] text-white shadow-xl shadow-blue-500/30 hover:bg-[#198fd4] active:scale-95 transition-all border-2 border-white cursor-pointer',
        mobileDrawerClass: 'relative z-10 w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto border-t border-[#E2E8F0] text-[#011627]',
        mobileDrawerHeaderClass: 'border-b border-[#E2E8F0] pb-3',
        mobileDrawerTitleClass: 'text-sm font-extrabold text-[#011627]',
        mobileDrawerSubtextClass: 'text-[11px] text-slate-500 font-medium',
        mobileDrawerNavBtnActive: 'bg-slate-100 text-[#0E7C7B] font-extrabold border border-[#2EC4B6]/50 shadow-[inset_0_3px_6px_rgba(0,0,0,0.12)] translate-y-0.5 rounded-lg',
        mobileDrawerNavBtnInactive: 'bg-white/90 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-md shadow-slate-200/80 border border-slate-200/80 hover:-translate-y-0.5 active:translate-y-0.5 rounded-lg font-semibold transition-all duration-150',
        mobileNavItemActiveClass: 'bg-slate-100 text-[#0E7C7B] font-extrabold border border-[#2EC4B6]/50 shadow-[inset_0_3px_6px_rgba(0,0,0,0.12)] translate-y-0.5 rounded-lg',
        mobileNavItemInactiveClass: 'bg-white/90 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-md shadow-slate-200/80 border border-slate-200/80 hover:-translate-y-0.5 active:translate-y-0.5 rounded-lg font-semibold transition-all duration-150',

        // 9. Desktop Left Side Menu
        sidebarClass: 'bg-white/95 backdrop-blur-md border-r border-slate-200/90 shadow-2xl z-20',
        sidebarItemActiveClass: 'bg-slate-100 text-[#0E7C7B] font-extrabold border border-[#2EC4B6]/50 shadow-[inset_0_3px_6px_rgba(0,0,0,0.12)] translate-y-0.5 rounded-[5px]',
        sidebarItemInactiveClass: 'bg-white/90 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-md shadow-slate-200/80 border border-slate-200/80 hover:-translate-y-0.5 rounded-[5px] font-semibold transition-all duration-150',
        sidebarDividerClass: 'border-t border-slate-200/80',
    };
}
