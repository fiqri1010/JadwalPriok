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

export const themes: Record<'light' | 'dark' | 'darkFluid', ThemePalette> = {
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
    darkFluid: {
        name: 'Dark Fluid (Pre-Alpha)',
        background: '#141218',
        surface: '#1D1B20',
        text: '#E6E0E9',
        textSecondary: '#CAC4D0',
        primary: '#D0BCFF',
        status: {
            piket: '#AEC6FF',
            off: '#82D9A3',
            cuti: '#FFB4AB',
            penugasan: '#FFB951',
        },
        penugasanColors: {
            ST_PERIKSA_FISIK_LUAR_KAWASAN: '#AEC6FF',
            ST_ATA_CARNET: '#FFB951',
            ST_LAINNYA: '#82D9A3',
        },
    },
};

export interface ThemeConfig {
    theme: AppTheme;
    isDefault: boolean;
    isDark: boolean;
    isVista: boolean;
    isWinamp: boolean;
    isDarkFluid: boolean;

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
    const isDarkFluid = theme === 'darkFluid';

    if (isDark) {
        return {
            theme,
            isDefault: false,
            isDark: true,
            isVista: false,
            isWinamp: false,
            isDarkFluid: false,
            palette: themes.dark,
            penugasanColors,

            // 1. Kanvas Utama: #121212 bg, #E0E0E0 text
            wrapperClass: 'h-[100dvh] max-h-[100dvh] w-full bg-[#121212] text-[#E0E0E0] flex flex-col font-sans relative selection:bg-slate-700 selection:text-white overflow-hidden',

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
            dayNamesHeaderClass: 'grid grid-cols-7 gap-1 sm:gap-1.5 lg:gap-1.5 mb-1 sm:mb-1.5 rounded-lg sm:rounded-xl bg-[#151515] py-1 sm:py-1.5 text-center text-xs sm:text-sm lg:text-base font-black border border-[#2B2B2B]',
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
            sidebarItemActiveClass: 'bg-[#121214] text-emerald-400 font-extrabold border border-emerald-500/40 shadow-[inset_0_3px_6px_rgba(0,0,0,0.8)] translate-y-0.5 rounded-xl',
            sidebarItemInactiveClass: 'bg-[#222224] text-zinc-300 hover:text-white hover:bg-[#2A2A2E] shadow-md shadow-black/50 border border-[#333338] hover:-translate-y-0.5 rounded-xl font-semibold transition-all duration-150',
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
            isDarkFluid: false,
            penugasanColors,

            // 1. Kanvas Utama: Radial gradient aero glass
            wrapperClass: 'h-[100dvh] max-h-[100dvh] w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-blue-200 to-indigo-100 text-[#0F172A] flex flex-col font-sans relative selection:bg-sky-200 selection:text-sky-900 overflow-hidden',

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
            monthNavBtnClass: 'rounded-lg sm:rounded-xl border border-white/70 bg-white/50 backdrop-blur-xs p-1.5 sm:p-2 text-[#0F172A] hover:bg-white/80 transition-colors cursor-pointer shrink-0 shadow-2xs',
            monthDisplayBtnClass: 'flex items-center justify-center space-x-1.5 sm:space-x-2 rounded-lg sm:rounded-xl border border-white/80 bg-white/60 hover:bg-white/85 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-extrabold text-[#0F172A] shadow-xs backdrop-blur-xs transition-all cursor-pointer w-[132px] min-[380px]:w-[142px] sm:w-[168px] shrink-0',
            todayBtnClass: 'flex items-center space-x-1 rounded-lg sm:rounded-xl border border-white/70 bg-white/50 hover:bg-white/80 text-[#0F172A] px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold backdrop-blur-xs transition-all cursor-pointer shrink-0 shadow-2xs',

            // 4. Sub-toolbar Aksi Kalender
            subToolbarCardClass: 'flex items-center justify-between rounded-xl sm:rounded-2xl bg-white/45 backdrop-blur-xl p-1.5 sm:p-2.5 lg:px-3.5 shadow-xs border border-white/70 gap-2',
            subToolbarTitleClass: 'text-xs sm:text-sm font-extrabold text-[#0F172A] truncate drop-shadow-xs',
            subToolbarDotClass: 'flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-sky-600 shrink-0',
            pasteBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-white/70 bg-white/50 backdrop-blur-xs hover:bg-white/80 text-[#0F172A] px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs',
            undoBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-white/70 bg-white/50 backdrop-blur-xs hover:bg-white/80 text-[#0F172A] px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs',
            resetBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-white/70 bg-white/50 backdrop-blur-xs hover:bg-white/80 text-[#0F172A] px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer',
            lockBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-white/70 bg-white/50 backdrop-blur-xs text-[#0F172A] hover:bg-white/80 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs',
            expandBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-white/70 bg-white/50 backdrop-blur-xs hover:bg-white/80 px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-bold text-[#0F172A] transition-all cursor-pointer shadow-xs',

            // 5. Area Grid Kalender
            calendarContainerCardClass: 'rounded-xl sm:rounded-2xl bg-white/45 backdrop-blur-xl p-1 sm:p-2 lg:p-2.5 shadow-[0_8px_30px_rgba(14,116,224,0.12)] border border-white/70',
            dayNamesHeaderClass: 'grid grid-cols-7 gap-1 sm:gap-1.5 lg:gap-1.5 mb-1 sm:mb-1.5 rounded-lg sm:rounded-xl bg-white/85 backdrop-blur-md py-1 sm:py-1.5 text-center text-xs sm:text-sm lg:text-base font-black border border-white/60 shadow-2xs',
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
            sidebarItemActiveClass: 'bg-gradient-to-r from-sky-400/30 to-blue-500/20 text-sky-950 font-extrabold border border-white/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_4px_12px_rgba(14,116,224,0.15)] rounded-xl',
            sidebarItemInactiveClass: 'bg-white/40 backdrop-blur-md text-slate-700 hover:text-slate-950 hover:bg-white/70 shadow-xs border border-white/60 hover:-translate-y-0.5 rounded-xl font-semibold transition-all duration-150',
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
            isDarkFluid: false,
            penugasanColors,

            // 1. Kanvas Utama: #2C2E3B, text #00FF00, font-mono, rounded-none!
            wrapperClass: 'h-[100dvh] max-h-[100dvh] w-full bg-[#2C2E3B] text-[#00FF00] flex flex-col font-mono relative rounded-none selection:bg-[#00FF00] selection:text-black overflow-hidden',

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
            dayNamesHeaderClass: 'grid grid-cols-7 gap-1 sm:gap-1.5 lg:gap-1.5 mb-1 sm:mb-1.5 rounded-none bg-[#000000] py-1 sm:py-1.5 text-center text-xs sm:text-sm lg:text-base font-black border border-[#555555] font-mono',
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

    // Material Design 3 (Material Web - Dark Fluid Pre-Alpha)
    if (isDarkFluid) {
        return {
            theme,
            isDefault: false,
            isDark: false,
            isVista: false,
            isWinamp: false,
            isDarkFluid: true,
            palette: themes.darkFluid,
            penugasanColors,

            // 1. Kanvas Utama: Background (#141218), On-Surface (#E6E0E9)
            wrapperClass: 'h-[100dvh] max-h-[100dvh] w-full bg-[#141218] text-[#E6E0E9] flex flex-col font-sans relative selection:bg-[#D0BCFF]/30 selection:text-[#E6E0E9] overflow-hidden',

            // 2. Top Header / Navbar: Surface Container (#1D1B20), soft border-white/5, Primary (#D0BCFF)
            navbarClass: 'sticky top-0 z-50 bg-[#1D1B20] text-[#E6E0E9] border-b border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.4)] shrink-0 transition-all duration-300 ease-in-out',
            logoContainerClass: 'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-2xl bg-[#D0BCFF]/15 text-[#D0BCFF] shadow-sm ring-1 ring-[#D0BCFF]/30 shrink-0 transition-all duration-300 ease-in-out',
            titleClass: 'text-xs sm:text-sm md:text-base font-extrabold tracking-tight truncate text-[#E6E0E9]',
            versionBadgeClass: 'bg-[#2B2930] text-[#D0BCFF] border border-white/5 text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full font-bold transition-all duration-300 ease-in-out',
            subtitleClass: 'hidden sm:block text-[10.5px] text-[#CAC4D0] font-medium line-clamp-1',
            supabaseBadgeClass: 'hidden lg:flex items-center space-x-1.5 rounded-full bg-[#2B2930] px-3 py-1 text-xs border border-white/5 text-[#E6E0E9] transition-all duration-300 ease-in-out',
            holidayBtnClass: 'flex items-center space-x-1.5 rounded-full bg-[#FFB4AB] hover:bg-[#FFDAD6] px-3 py-1.5 text-xs font-bold text-[#690005] transition-all duration-200 ease-in-out cursor-pointer shadow-sm active:scale-95',
            themeDropdownBtnClass: 'h-8 sm:h-9 flex items-center justify-center gap-2 rounded-lg bg-[#2B2930] hover:bg-[#36343B] px-3 text-xs font-bold text-[#E6E0E9] transition-all duration-200 cursor-pointer border border-white/10 shadow-sm select-none active:scale-98',
            themeDropdownMenuClass: 'absolute right-[-3rem] sm:right-0 mt-1.5 z-50 w-60 rounded-[5px] bg-[#1D1B20] p-[5px] flex flex-col gap-1 text-[#E6E0E9] shadow-2xl ring-1 ring-white/10 border border-white/5 animate-in fade-in zoom-in-95 duration-200',
            settingsBtnClass: 'flex items-center justify-center space-x-1.5 rounded-full bg-[#2B2930] hover:bg-[#36343B] px-3 py-1.5 text-xs font-bold text-[#E6E0E9] transition-all duration-200 ease-in-out cursor-pointer border border-white/10 shadow-sm active:scale-95',
            syncBtnClass: 'flex items-center justify-center space-x-1.5 rounded-full bg-[#2B2930] hover:bg-[#36343B] px-3 py-1.5 text-xs font-bold text-[#E6E0E9] transition-all duration-200 ease-in-out cursor-pointer border border-white/10 shadow-sm active:scale-95',
            saveBtnClass: 'flex items-center justify-center space-x-1.5 rounded-full bg-[#2B2930] hover:bg-[#36343B] px-3 py-1.5 text-xs font-bold text-[#E6E0E9] transition-all duration-200 ease-in-out cursor-pointer border border-white/10 shadow-sm active:scale-95',

            // 3. View Switcher & Navigasi Bulan: Surface Container (#1D1B20) card, rounded-3xl
            viewSwitcherCardClass: 'flex flex-col md:flex-row md:items-center justify-between gap-1.5 sm:gap-2 bg-[#1D1B20] p-1 sm:p-1.5 lg:p-1.5 rounded-3xl border border-white/5 shadow-md transition-all duration-300 ease-in-out',
            viewSwitcherPillsWrapperClass: 'flex flex-row flex-nowrap items-center overflow-x-auto no-scrollbar scroll-smooth p-1 gap-0.5 sm:gap-1 lg:gap-1.5 rounded-full bg-[#2B2930] border border-white/5 max-w-full min-w-0 shrink flex-1',
            tabActiveClass: 'bg-[#D0BCFF] text-[#381E72] shadow-2xs font-extrabold rounded-full transition-all duration-300 ease-in-out',
            tabInactiveClass: 'text-[#CAC4D0] hover:text-[#E6E0E9] hover:bg-white/5 rounded-full transition-all duration-300 ease-in-out',
            monthNavBtnClass: 'rounded-full border border-white/5 bg-[#2B2930] p-2 text-[#E6E0E9] hover:bg-[#36343B] hover:text-[#D0BCFF] transition-all duration-300 ease-in-out cursor-pointer shrink-0 shadow-sm active:scale-95',
            monthDisplayBtnClass: 'flex items-center justify-center space-x-2 rounded-full border border-[#D0BCFF]/30 bg-[#2B2930] hover:bg-[#36343B] px-3.5 py-1.5 text-xs sm:text-sm font-extrabold text-[#D0BCFF] shadow-sm transition-all duration-300 ease-in-out cursor-pointer active:scale-95 w-[132px] min-[380px]:w-[142px] sm:w-[168px] shrink-0',
            todayBtnClass: 'flex items-center space-x-1 rounded-full border border-[#D0BCFF]/30 bg-[#D0BCFF]/15 hover:bg-[#D0BCFF]/25 text-[#D0BCFF] px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-sm active:scale-95',

            // 4. Sub-toolbar Aksi Kalender: rounded-3xl, Surface Container (#1D1B20), pill buttons rounded-full
            subToolbarCardClass: 'flex items-center justify-between rounded-3xl bg-[#1D1B20] p-2 sm:p-2.5 lg:px-4 shadow-sm border border-white/5 gap-2 transition-all duration-300 ease-in-out',
            subToolbarTitleClass: 'text-xs sm:text-sm font-extrabold text-[#E6E0E9] truncate',
            subToolbarDotClass: 'flex h-2.5 w-2.5 rounded-full bg-[#D0BCFF] shrink-0',
            pasteBtnClass: 'flex items-center space-x-1.5 rounded-full border border-white/5 bg-[#2B2930] hover:bg-[#36343B] text-[#E6E0E9] px-3 py-1.5 text-xs font-bold transition-all duration-300 ease-in-out cursor-pointer shadow-sm active:scale-95',
            undoBtnClass: 'flex items-center space-x-1.5 rounded-full border border-white/5 bg-[#2B2930] hover:bg-[#36343B] text-[#E6E0E9] px-3 py-1.5 text-xs font-bold transition-all duration-300 ease-in-out cursor-pointer shadow-sm active:scale-95',
            resetBtnClass: 'flex items-center space-x-1.5 rounded-full border border-white/5 bg-[#2B2930] hover:bg-[#36343B] text-[#E6E0E9] px-3 py-1.5 text-xs font-bold transition-all duration-300 ease-in-out shadow-sm cursor-pointer active:scale-95',
            lockBtnClass: 'flex items-center space-x-1.5 rounded-full border border-white/5 bg-[#2B2930] text-[#E6E0E9] hover:bg-[#36343B] px-3 py-1.5 text-xs font-bold transition-all duration-300 ease-in-out cursor-pointer shadow-sm active:scale-95',
            expandBtnClass: 'flex items-center space-x-1.5 rounded-full border border-white/5 bg-[#2B2930] hover:bg-[#36343B] px-3 py-1.5 text-xs font-bold text-[#E6E0E9] transition-all duration-300 ease-in-out cursor-pointer active:scale-95',

            // 5. Area Grid Kalender: rounded-3xl, Surface Container (#1D1B20)
            calendarContainerCardClass: 'rounded-3xl bg-[#1D1B20] p-1.5 sm:p-2.5 lg:p-3 shadow-lg border border-white/5 transition-all duration-300 ease-in-out',
            dayNamesHeaderClass: 'grid grid-cols-7 gap-1 sm:gap-1.5 lg:gap-1.5 mb-1.5 rounded-2xl bg-[#2B2930] py-1 sm:py-1.5 text-center text-xs sm:text-sm lg:text-base font-black border border-white/5',
            weekdayNameTextClass: 'text-[#CAC4D0]',
            weekendNameTextClass: 'text-[#FFB4AB]',
            emptyCellClass: 'rounded-2xl bg-[#141218]/60 p-1 border border-white/5',

            // 6. Summary Cards Panel: rounded-3xl
            summaryPanelCardClass: 'rounded-3xl bg-[#1D1B20] p-3 sm:p-4 lg:p-4.5 shadow-lg border border-white/5 transition-all duration-300 ease-in-out',
            summaryTitleClass: 'text-xs sm:text-sm font-extrabold text-[#E6E0E9] flex items-center',
            summaryHeaderBorderClass: 'border-b border-white/5 pb-2',
            summarySubtextClass: 'text-[10px] sm:text-xs text-[#CAC4D0] font-medium',

            // 7. Modal & Pop-up: rounded-3xl, Surface Container (#1D1B20), soft elevation
            modalCardClass: 'bg-[#1D1B20] border border-white/5 text-[#E6E0E9] shadow-2xl rounded-3xl',
            modalHeaderClass: 'border-b border-white/5',
            modalTitleClass: 'text-sm sm:text-base font-extrabold text-[#E6E0E9]',
            modalBodyClass: 'text-[#E6E0E9]',

            // 8. Mobile Drawer & FAB: rounded-full FAB with Primary (#D0BCFF)
            mobileFabClass: 'flex h-14 w-14 items-center justify-center rounded-full bg-[#D0BCFF] text-[#381E72] shadow-2xl hover:bg-[#E8DEF8] active:scale-95 transition-all duration-300 ease-in-out border-2 border-white/10 cursor-pointer',
            mobileDrawerClass: 'relative z-10 w-full max-w-lg rounded-t-3xl bg-[#1D1B20] p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 ease-out max-h-[90vh] overflow-y-auto border-t border-white/5 text-[#E6E0E9]',
            mobileDrawerHeaderClass: 'border-b border-white/5 pb-3',
            mobileDrawerTitleClass: 'text-sm font-extrabold text-[#E6E0E9]',
            mobileDrawerSubtextClass: 'text-[11px] text-[#CAC4D0] font-medium',
            mobileDrawerNavBtnActive: 'bg-[#141218] text-[#D0BCFF] font-extrabold border border-[#D0BCFF]/50 shadow-[inset_0_3px_6px_rgba(0,0,0,0.6)] translate-y-0.5 rounded-2xl',
            mobileDrawerNavBtnInactive: 'bg-[#2B2930] text-[#CAC4D0] hover:text-[#E6E0E9] hover:bg-[#36343B] shadow-md shadow-black/40 border border-white/5 hover:-translate-y-0.5 active:translate-y-0.5 rounded-2xl font-semibold transition-all duration-200',
            mobileNavItemActiveClass: 'bg-[#141218] text-[#D0BCFF] font-extrabold border border-[#D0BCFF]/50 shadow-[inset_0_3px_6px_rgba(0,0,0,0.6)] translate-y-0.5 rounded-2xl',
            mobileNavItemInactiveClass: 'bg-[#2B2930] text-[#CAC4D0] hover:text-[#E6E0E9] hover:bg-[#36343B] shadow-md shadow-black/40 border border-white/5 hover:-translate-y-0.5 active:translate-y-0.5 rounded-2xl font-semibold transition-all duration-200',

            // 9. Desktop Left Side Menu
            sidebarClass: 'bg-[#1D1B20]/95 backdrop-blur-md border-r border-white/10 shadow-2xl z-20',
            sidebarItemActiveClass: 'bg-[#141218] text-[#D0BCFF] font-extrabold border border-[#D0BCFF]/50 shadow-[inset_0_3px_6px_rgba(0,0,0,0.6)] translate-y-0.5 rounded-2xl',
            sidebarItemInactiveClass: 'bg-[#2B2930] text-[#CAC4D0] hover:text-[#E6E0E9] hover:bg-[#36343B] shadow-md shadow-black/40 border border-white/5 hover:-translate-y-0.5 rounded-2xl font-semibold transition-all duration-200',
            sidebarDividerClass: 'border-t border-white/10',
        };
    }

    // 0. TEMA DEFAULT (BRAND BARU)
    return {
        theme: 'default',
        isDefault: true,
        isDark: false,
        isVista: false,
        isWinamp: false,
        isDarkFluid: false,
        palette: themes.light,
        penugasanColors,

        // 1. Kanvas Utama: #F6F7F8 bg, #011627 text
        wrapperClass: 'h-[100dvh] max-h-[100dvh] w-full bg-[#F6F7F8] text-[#011627] flex flex-col font-sans relative selection:bg-[#2EC4B6]/30 selection:text-[#011627] overflow-hidden',

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
        dayNamesHeaderClass: 'grid grid-cols-7 gap-1 sm:gap-1.5 lg:gap-1.5 mb-1 sm:mb-1.5 rounded-lg bg-[#F6F7F8] py-1 sm:py-1.5 px-1 text-center text-xs sm:text-sm lg:text-base font-black border border-[#E2E8F0]',
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
        sidebarItemActiveClass: 'bg-slate-100 text-[#0E7C7B] font-extrabold border border-[#2EC4B6]/50 shadow-[inset_0_3px_6px_rgba(0,0,0,0.12)] translate-y-0.5 rounded-lg',
        sidebarItemInactiveClass: 'bg-white/90 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-md shadow-slate-200/80 border border-slate-200/80 hover:-translate-y-0.5 rounded-lg font-semibold transition-all duration-150',
        sidebarDividerClass: 'border-t border-slate-200/80',
    };
}
