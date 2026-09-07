import { AppTheme } from './types';

export interface ThemeConfig {
    theme: AppTheme;
    isDefault: boolean;
    isDark: boolean;
    isVista: boolean;
    isWinamp: boolean;

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

    // 3. View Switcher (Tab Navigasi) & Navigasi Bulan
    viewSwitcherCardClass: string;
    viewSwitcherPillsWrapperClass: string;
    tabActiveClass: string;
    tabInactiveClass: string;
    monthNavBtnClass: string;
    monthDisplayBtnClass: string;

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
}

export function getThemeConfig(theme: AppTheme): ThemeConfig {
    const isDefault = theme === 'default';
    const isDark = theme === 'dark';
    const isVista = theme === 'vista';
    const isWinamp = theme === 'winamp';

    if (isDark) {
        return {
            theme,
            isDefault: false,
            isDark: true,
            isVista: false,
            isWinamp: false,

            // 1. Kanvas Utama: #121212 bg, #E0E0E0 text
            wrapperClass: 'min-h-screen bg-[#121212] text-[#E0E0E0] flex flex-col font-sans relative selection:bg-slate-700 selection:text-white',

            // 2. Top Header / Navbar: #1A1A1A, border #333333
            navbarClass: 'sticky top-0 z-40 bg-[#1A1A1A] text-[#E0E0E0] border-b border-[#333333] shadow-[0_4px_20px_rgba(0,0,0,0.8)]',
            logoContainerClass: 'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#252525] text-white shadow-sm ring-1 ring-white/10 shrink-0',
            titleClass: 'text-xs sm:text-sm md:text-base font-extrabold tracking-tight truncate text-[#FFFFFF]',
            versionBadgeClass: 'bg-[#2A2A2A] text-slate-300 border border-[#444444] text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-bold',
            subtitleClass: 'hidden sm:block text-[10.5px] text-slate-400 font-medium line-clamp-1',
            supabaseBadgeClass: 'hidden lg:flex items-center space-x-1.5 rounded-lg bg-[#252525] px-2.5 py-1 text-xs border border-[#444444] text-[#E0E0E0]',
            holidayBtnClass: 'flex items-center space-x-1.5 rounded-lg bg-[#991B1B] hover:bg-[#B91C1C] px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-bold text-white transition-colors cursor-pointer border border-[#EF4444]/30 shadow-xs',
            themeDropdownBtnClass: 'flex items-center justify-center rounded-lg bg-[#2A2A2A] hover:bg-[#333333] p-1.5 text-slate-300 transition-colors cursor-pointer border border-[#444444] shadow-xs',
            themeDropdownMenuClass: 'absolute right-0 mt-2 z-50 w-56 rounded-2xl bg-[#1E1E1E] p-1.5 text-[#E0E0E0] shadow-2xl ring-1 ring-white/10 border border-[#333333] animate-in fade-in zoom-in-95 duration-100',
            settingsBtnClass: 'flex items-center justify-center rounded-lg bg-[#2A2A2A] hover:bg-[#333333] p-1.5 sm:p-2 text-[#E0E0E0] transition-colors cursor-pointer border border-[#444444] shadow-xs',
            syncBtnClass: 'flex items-center justify-center rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] p-1.5 sm:p-2 text-white transition-colors cursor-pointer shadow-xs border border-blue-400/30',

            // 3. View Switcher & Navigasi Bulan: #1E1E1E card, #333333 border
            viewSwitcherCardClass: 'flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#1E1E1E] p-1.5 sm:p-2 lg:p-2.5 rounded-xl sm:rounded-2xl border border-[#333333] shadow-lg',
            viewSwitcherPillsWrapperClass: 'flex flex-wrap rounded-xl bg-[#141414] p-1 gap-1 border border-[#2B2B2B]',
            tabActiveClass: 'bg-[#39393A] text-white shadow-xs',
            tabInactiveClass: 'text-[#A0A0A0] hover:text-white hover:bg-[#2A2A2A]',
            monthNavBtnClass: 'rounded-lg sm:rounded-xl border border-[#333333] bg-[#252525] p-1.5 sm:p-2 text-[#E0E0E0] hover:bg-[#333333] hover:text-white transition-colors cursor-pointer shrink-0 shadow-2xs',
            monthDisplayBtnClass: 'flex items-center space-x-1.5 sm:space-x-2 rounded-lg sm:rounded-xl border border-[#444444] bg-[#252525] hover:bg-[#303030] px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-extrabold text-[#FFFFFF] shadow-xs transition-all cursor-pointer',

            // 4. Sub-toolbar Aksi Kalender
            subToolbarCardClass: 'flex items-center justify-between rounded-xl sm:rounded-2xl bg-[#1E1E1E] p-1.5 sm:p-2.5 lg:px-3.5 shadow-xs border border-[#333333] gap-2',
            subToolbarTitleClass: 'text-xs sm:text-sm font-extrabold text-[#E0E0E0] truncate',
            subToolbarDotClass: 'flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-blue-500 shrink-0',
            pasteBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-[#444444] bg-[#252525] hover:bg-[#303030] text-[#E0E0E0] p-1.5 sm:px-2.5 sm:py-1 text-xs font-bold transition-colors cursor-pointer shadow-2xs',
            undoBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-amber-600/40 bg-amber-600 hover:bg-amber-700 text-white p-1.5 sm:px-2.5 sm:py-1 text-xs font-bold transition-all cursor-pointer shadow-xs animate-pulse',
            resetBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-[#552222] bg-[#331111] hover:bg-[#441818] text-[#FF8A8A] p-1.5 sm:px-2.5 sm:py-1 text-xs font-bold transition-colors shadow-2xs cursor-pointer',
            lockBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-[#444444] bg-[#252525] text-[#E0E0E0] hover:bg-[#303030] p-1.5 sm:px-2.5 sm:py-1 text-xs font-bold transition-colors cursor-pointer shadow-2xs',
            expandBtnClass: 'hidden sm:flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-[#444444] bg-[#252525] hover:bg-[#303030] px-2.5 py-1 text-xs font-bold text-[#E0E0E0] transition-colors cursor-pointer',

            // 5. Area Grid Kalender
            calendarContainerCardClass: 'rounded-xl sm:rounded-2xl bg-[#1E1E1E] p-1.5 sm:p-2.5 lg:p-3 shadow-lg border border-[#333333]',
            dayNamesHeaderClass: 'grid grid-cols-7 gap-1 sm:gap-1.5 lg:gap-2 mb-1 sm:mb-1.5 rounded-lg sm:rounded-xl bg-[#151515] p-1 sm:p-1.5 text-center text-[11px] sm:text-xs font-black border border-[#2B2B2B]',
            weekdayNameTextClass: 'text-[#B0B0B0]',
            weekendNameTextClass: 'text-[#FF6B6B]',
            emptyCellClass: 'rounded-lg sm:rounded-xl bg-[#141414] p-1 min-h-[40px] sm:min-h-[55px] lg:min-h-[64px]',

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
            mobileDrawerNavBtnActive: 'bg-[#39393A] text-white shadow-xs',
            mobileDrawerNavBtnInactive: 'bg-[#252525] text-slate-300 hover:bg-[#303030]',
        };
    }

    if (isVista) {
        return {
            theme,
            isDefault: false,
            isDark: false,
            isVista: true,
            isWinamp: false,

            // 1. Kanvas Utama: Radial gradient aero glass
            wrapperClass: 'min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-blue-200 to-emerald-100 text-[#0F172A] flex flex-col font-sans relative selection:bg-sky-200 selection:text-sky-900',

            // 2. Top Header / Navbar: Slate-900/60 backdrop-blur-lg
            navbarClass: 'sticky top-0 z-40 bg-slate-900/70 backdrop-blur-lg text-white border-b border-white/20 shadow-lg',
            logoContainerClass: 'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-xs border border-white/40 shrink-0',
            titleClass: 'text-xs sm:text-sm md:text-base font-extrabold tracking-tight truncate text-white drop-shadow-xs',
            versionBadgeClass: 'bg-white/20 text-sky-200 border border-white/30 text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-bold backdrop-blur-xs',
            subtitleClass: 'hidden sm:block text-[10.5px] text-sky-100/90 font-medium line-clamp-1',
            supabaseBadgeClass: 'hidden lg:flex items-center space-x-1.5 rounded-lg bg-white/10 backdrop-blur-xs px-2.5 py-1 text-xs border border-white/20 text-white',
            holidayBtnClass: 'flex items-center space-x-1.5 rounded-lg bg-rose-600/85 hover:bg-rose-700 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-bold text-white transition-colors cursor-pointer border border-rose-300/40 shadow-xs backdrop-blur-xs',
            themeDropdownBtnClass: 'flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 p-1.5 text-white transition-colors cursor-pointer border border-white/20 shadow-xs backdrop-blur-xs',
            themeDropdownMenuClass: 'absolute right-0 mt-2 z-50 w-56 rounded-2xl bg-white/85 backdrop-blur-xl p-1.5 text-[#0F172A] shadow-2xl ring-1 ring-black/10 border border-white/60 animate-in fade-in zoom-in-95 duration-100',
            settingsBtnClass: 'flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 p-1.5 sm:p-2 text-white transition-colors cursor-pointer border border-white/20 shadow-xs backdrop-blur-xs',
            syncBtnClass: 'flex items-center justify-center rounded-lg bg-sky-600/85 hover:bg-sky-700 p-1.5 sm:p-2 text-white transition-colors cursor-pointer shadow-xs border border-sky-300/40 backdrop-blur-xs',

            // 3. View Switcher & Navigasi Bulan: Glassmorphism
            viewSwitcherCardClass: 'flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/40 backdrop-blur-md p-1.5 sm:p-2 lg:p-2.5 rounded-xl sm:rounded-2xl border border-white/60 shadow-[0_4px_20px_rgb(0,0,0,0.08)]',
            viewSwitcherPillsWrapperClass: 'flex flex-wrap rounded-xl bg-white/30 backdrop-blur-xs p-1 gap-1 border border-white/40',
            tabActiveClass: 'bg-white/80 border border-white/80 text-[#0F172A] shadow-xs font-extrabold',
            tabInactiveClass: 'text-[#0F172A] hover:bg-white/40',
            monthNavBtnClass: 'rounded-lg sm:rounded-xl border border-white/60 bg-white/50 backdrop-blur-xs p-1.5 sm:p-2 text-[#0F172A] hover:bg-white/70 transition-colors cursor-pointer shrink-0 shadow-2xs',
            monthDisplayBtnClass: 'flex items-center space-x-1.5 sm:space-x-2 rounded-lg sm:rounded-xl border border-white/70 bg-white/60 hover:bg-white/80 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-extrabold text-[#0F172A] shadow-xs backdrop-blur-xs transition-all cursor-pointer',

            // 4. Sub-toolbar Aksi Kalender
            subToolbarCardClass: 'flex items-center justify-between rounded-xl sm:rounded-2xl bg-white/40 backdrop-blur-md p-1.5 sm:p-2.5 lg:px-3.5 shadow-xs border border-white/60 gap-2',
            subToolbarTitleClass: 'text-xs sm:text-sm font-extrabold text-[#0F172A] truncate drop-shadow-xs',
            subToolbarDotClass: 'flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-sky-600 shrink-0',
            pasteBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-white/60 bg-white/50 backdrop-blur-xs hover:bg-white/70 text-[#0F172A] p-1.5 sm:px-2.5 sm:py-1 text-xs font-bold transition-colors cursor-pointer shadow-2xs',
            undoBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-amber-400 bg-amber-500/90 backdrop-blur-xs hover:bg-amber-600 text-white p-1.5 sm:px-2.5 sm:py-1 text-xs font-bold transition-all cursor-pointer shadow-xs animate-pulse',
            resetBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-rose-300/60 bg-rose-100/50 backdrop-blur-xs hover:bg-rose-200/60 text-rose-900 p-1.5 sm:px-2.5 sm:py-1 text-xs font-bold transition-colors shadow-2xs cursor-pointer',
            lockBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-white/60 bg-white/50 backdrop-blur-xs text-[#0F172A] hover:bg-white/70 p-1.5 sm:px-2.5 sm:py-1 text-xs font-bold transition-colors cursor-pointer shadow-2xs',
            expandBtnClass: 'hidden sm:flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-white/60 bg-white/50 backdrop-blur-xs hover:bg-white/70 px-2.5 py-1 text-xs font-bold text-[#0F172A] transition-colors cursor-pointer',

            // 5. Area Grid Kalender
            calendarContainerCardClass: 'rounded-xl sm:rounded-2xl bg-white/40 backdrop-blur-md p-1.5 sm:p-2.5 lg:p-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/60',
            dayNamesHeaderClass: 'grid grid-cols-7 gap-1 sm:gap-1.5 lg:gap-2 mb-1 sm:mb-1.5 rounded-lg sm:rounded-xl bg-white/40 backdrop-blur-xs p-1 sm:p-1.5 text-center text-[11px] sm:text-xs font-black border border-white/50',
            weekdayNameTextClass: 'text-slate-800',
            weekendNameTextClass: 'text-[#BE1A1A]',
            emptyCellClass: 'rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-2xs p-1 min-h-[40px] sm:min-h-[55px] lg:min-h-[64px] border border-white/30',

            // 6. Summary Cards Panel
            summaryPanelCardClass: 'rounded-xl sm:rounded-2xl bg-white/40 backdrop-blur-md p-2.5 sm:p-3 lg:p-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/60',
            summaryTitleClass: 'text-xs sm:text-sm font-extrabold text-[#0F172A] flex items-center',
            summaryHeaderBorderClass: 'border-b border-white/50 pb-1.5',
            summarySubtextClass: 'text-[10px] sm:text-xs text-slate-600 font-medium',

            // 7. Modal & Pop-up
            modalCardClass: 'bg-white/80 backdrop-blur-xl border border-white/80 text-[#0F172A] shadow-2xl rounded-2xl',
            modalHeaderClass: 'border-b border-white/40',
            modalTitleClass: 'text-sm sm:text-base font-extrabold text-[#0F172A]',
            modalBodyClass: 'text-[#0F172A]',

            // 8. Mobile Drawer & FAB
            mobileFabClass: 'flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/90 backdrop-blur-md text-white shadow-xl hover:bg-sky-600 active:scale-95 transition-all border-2 border-white/60 cursor-pointer',
            mobileDrawerClass: 'relative z-10 w-full max-w-lg rounded-t-3xl bg-white/85 backdrop-blur-xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto border-t border-white/60 text-[#0F172A]',
            mobileDrawerHeaderClass: 'border-b border-white/50 pb-3',
            mobileDrawerTitleClass: 'text-sm font-extrabold text-[#0F172A]',
            mobileDrawerSubtextClass: 'text-[11px] text-slate-600 font-medium',
            mobileDrawerNavBtnActive: 'bg-white/80 border border-white/80 text-[#0F172A] shadow-xs',
            mobileDrawerNavBtnInactive: 'bg-white/40 text-slate-800 hover:bg-white/60',
        };
    }

    if (isWinamp) {
        return {
            theme,
            isDefault: false,
            isDark: false,
            isVista: false,
            isWinamp: true,

            // 1. Kanvas Utama: #2C2E3B, text #00FF00, font-mono, rounded-none!
            wrapperClass: 'min-h-screen bg-[#2C2E3B] text-[#00FF00] flex flex-col font-mono relative rounded-none selection:bg-[#00FF00] selection:text-black',

            // 2. Top Header / Navbar: Gradient #4A4D64 -> #2D2E40, border #000000
            navbarClass: 'sticky top-0 z-40 bg-gradient-to-b from-[#4A4D64] to-[#2D2E40] text-[#FACC15] border-b-2 border-[#000000] font-mono shadow-none',
            logoContainerClass: 'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-none bg-[#000000] text-[#FACC15] border border-[#555555] shrink-0',
            titleClass: 'text-xs sm:text-sm md:text-base font-bold tracking-tight truncate text-[#FACC15] font-mono',
            versionBadgeClass: 'bg-[#000000] text-[#00FF00] border border-[#00FF00]/50 text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-none font-mono font-bold',
            subtitleClass: 'hidden sm:block text-[10.5px] text-slate-300 font-mono line-clamp-1',
            supabaseBadgeClass: 'hidden lg:flex items-center space-x-1.5 rounded-none bg-[#000000] px-2.5 py-1 text-xs border border-[#00FF00]/60 text-[#00FF00] font-mono',
            holidayBtnClass: 'flex items-center space-x-1.5 rounded-none bg-[#FF3366] hover:bg-rose-700 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-bold text-white transition-colors cursor-pointer border border-black font-mono shadow-none',
            themeDropdownBtnClass: 'flex items-center justify-center rounded-none bg-[#2D2E40] hover:bg-[#4A4D64] p-1.5 text-[#FACC15] transition-colors cursor-pointer border border-[#555555] font-mono shadow-none',
            themeDropdownMenuClass: 'absolute right-0 mt-2 z-50 w-56 rounded-none bg-[#1C1C1E] p-1.5 text-[#00FF00] shadow-none border-2 border-[#555555] font-mono animate-in fade-in duration-75',
            settingsBtnClass: 'flex items-center justify-center rounded-none bg-[#2D2E40] hover:bg-[#4A4D64] p-1.5 sm:p-2 text-[#FACC15] transition-colors cursor-pointer border border-[#555555] font-mono shadow-none',
            syncBtnClass: 'flex items-center justify-center rounded-none bg-[#000000] hover:bg-[#00FF00] hover:text-black p-1.5 sm:p-2 text-[#00FF00] transition-colors cursor-pointer shadow-none border border-[#00FF00] font-mono',

            // 3. View Switcher & Navigasi Bulan: Boxy retro
            viewSwitcherCardClass: 'flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#1C1C1E] p-1.5 sm:p-2 lg:p-2.5 rounded-none border-2 border-[#555555] font-mono shadow-none',
            viewSwitcherPillsWrapperClass: 'flex flex-wrap rounded-none bg-[#000000] p-1 gap-1 border border-[#333333]',
            tabActiveClass: 'bg-[#000000] border border-[#00FF00] text-[#00FF00] rounded-none font-mono font-bold shadow-none',
            tabInactiveClass: 'text-slate-300 hover:bg-[#333333] hover:text-[#00FF00] rounded-none font-mono',
            monthNavBtnClass: 'rounded-none border border-[#555555] bg-[#000000] p-1.5 sm:p-2 text-[#00FF00] hover:bg-[#00FF00] hover:text-black transition-colors cursor-pointer shrink-0 shadow-none font-mono',
            monthDisplayBtnClass: 'flex items-center space-x-1.5 sm:space-x-2 rounded-none border border-[#00FF00] bg-[#000000] hover:bg-[#00FF00]/20 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-bold text-[#FACC15] shadow-none transition-all cursor-pointer font-mono',

            // 4. Sub-toolbar Aksi Kalender
            subToolbarCardClass: 'flex items-center justify-between rounded-none bg-[#1C1C1E] p-1.5 sm:p-2.5 lg:px-3.5 shadow-none border-2 border-[#555555] gap-2 font-mono',
            subToolbarTitleClass: 'text-xs sm:text-sm font-bold text-[#FACC15] truncate font-mono',
            subToolbarDotClass: 'flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-none bg-[#00FF00] shrink-0',
            pasteBtnClass: 'flex items-center space-x-1.5 rounded-none border border-[#555555] bg-[#000000] hover:bg-[#00FF00] hover:text-black text-[#00FF00] p-1.5 sm:px-2.5 sm:py-1 text-xs font-bold transition-colors cursor-pointer shadow-none font-mono',
            undoBtnClass: 'flex items-center space-x-1.5 rounded-none border border-[#FACC15] bg-[#000000] hover:bg-[#FACC15] hover:text-black text-[#FACC15] p-1.5 sm:px-2.5 sm:py-1 text-xs font-bold transition-all cursor-pointer shadow-none font-mono animate-pulse',
            resetBtnClass: 'flex items-center space-x-1.5 rounded-none border border-[#FF3333] bg-[#000000] hover:bg-[#FF3333] hover:text-white text-[#FF3333] p-1.5 sm:px-2.5 sm:py-1 text-xs font-bold transition-colors shadow-none cursor-pointer font-mono',
            lockBtnClass: 'flex items-center space-x-1.5 rounded-none border border-[#555555] bg-[#000000] text-[#00FF00] hover:bg-[#00FF00] hover:text-black p-1.5 sm:px-2.5 sm:py-1 text-xs font-bold transition-colors cursor-pointer shadow-none font-mono',
            expandBtnClass: 'hidden sm:flex items-center space-x-1.5 rounded-none border border-[#555555] bg-[#000000] hover:bg-[#00FF00] hover:text-black px-2.5 py-1 text-xs font-bold text-[#00FF00] transition-colors cursor-pointer font-mono',

            // 5. Area Grid Kalender
            calendarContainerCardClass: 'rounded-none bg-[#1C1C1E] p-1.5 sm:p-2.5 lg:p-3 shadow-none border-2 border-[#555555] font-mono',
            dayNamesHeaderClass: 'grid grid-cols-7 gap-1 sm:gap-1.5 lg:gap-2 mb-1 sm:mb-1.5 rounded-none bg-[#000000] p-1 sm:p-1.5 text-center text-[11px] sm:text-xs font-bold border border-[#555555] font-mono',
            weekdayNameTextClass: 'text-[#00FF00]',
            weekendNameTextClass: 'text-[#FF3333]',
            emptyCellClass: 'rounded-none bg-[#000000] p-1 min-h-[40px] sm:min-h-[55px] lg:min-h-[64px] border border-[#333333]',

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
            mobileDrawerNavBtnActive: 'bg-[#000000] border border-[#00FF00] text-[#00FF00] rounded-none font-mono font-bold',
            mobileDrawerNavBtnInactive: 'bg-[#2D2E40] text-slate-300 hover:bg-[#333333] hover:text-[#00FF00] rounded-none font-mono',
        };
    }

    // 0. TEMA DEFAULT (BRAND BARU)
    return {
        theme: 'default',
        isDefault: true,
        isDark: false,
        isVista: false,
        isWinamp: false,

        // 1. Kanvas Utama: #F6F7F8 bg, #011627 text
        wrapperClass: 'min-h-screen bg-[#F6F7F8] text-[#011627] flex flex-col font-sans relative selection:bg-[#2EC4B6]/30 selection:text-[#011627]',

        // 2. Top Header / Navbar: #011627 (Ink Black) dengan teks #F6F7F8 (Bright Snow)
        navbarClass: 'sticky top-0 z-40 bg-[#011627] text-[#F6F7F8] border-b border-[#0d2a45] shadow-md',
        logoContainerClass: 'flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#2EC4B6]/20 text-[#2EC4B6] shadow-sm ring-1 ring-[#2EC4B6]/40 shrink-0',
        titleClass: 'text-xs sm:text-sm md:text-base font-extrabold tracking-tight truncate text-[#F6F7F8]',
        versionBadgeClass: 'bg-[#0d2a45] text-[#2EC4B6] border border-[#2EC4B6]/30 text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-bold',
        subtitleClass: 'hidden sm:block text-[10.5px] text-slate-300 font-medium line-clamp-1',
        supabaseBadgeClass: 'hidden lg:flex items-center space-x-1.5 rounded-lg bg-[#0d2a45] px-2.5 py-1 text-xs border border-[#2EC4B6]/30 text-[#F6F7F8]',
        holidayBtnClass: 'flex items-center space-x-1.5 rounded-lg bg-[#FF3366] hover:bg-[#e02555] px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-bold text-white transition-colors cursor-pointer border border-[#FF3366]/40 shadow-xs',
        themeDropdownBtnClass: 'flex items-center justify-center rounded-lg bg-[#0d2a45] hover:bg-[#163e60] p-1.5 text-slate-200 transition-colors cursor-pointer border border-[#2EC4B6]/30 shadow-xs',
        themeDropdownMenuClass: 'absolute right-0 mt-2 z-50 w-56 rounded-2xl bg-white p-1.5 text-[#011627] shadow-2xl ring-1 ring-black/10 border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-100',
        settingsBtnClass: 'flex items-center justify-center rounded-lg bg-[#0d2a45] hover:bg-[#163e60] p-1.5 sm:p-2 text-slate-200 transition-colors cursor-pointer border border-[#2EC4B6]/30 shadow-xs',
        syncBtnClass: 'flex items-center justify-center rounded-lg bg-[#20A4F3] hover:bg-[#198fd4] p-1.5 sm:p-2 text-white transition-colors cursor-pointer shadow-xs border border-sky-400/40',

        // 3. View Switcher & Navigasi Bulan: Card putih #FFFFFF, border #E2E8F0
        viewSwitcherCardClass: 'flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-1.5 sm:p-2 lg:p-2.5 rounded-xl sm:rounded-2xl border border-[#E2E8F0] shadow-xs',
        viewSwitcherPillsWrapperClass: 'flex flex-wrap rounded-xl bg-[#F6F7F8] p-1 gap-1 border border-[#E2E8F0]',
        tabActiveClass: 'bg-[#2EC4B6] text-white shadow-xs font-extrabold',
        tabInactiveClass: 'text-[#011627] hover:text-[#011627] hover:bg-[#E2E8F0]',
        monthNavBtnClass: 'rounded-lg sm:rounded-xl border border-[#E2E8F0] bg-[#F6F7F8] p-1.5 sm:p-2 text-[#011627] hover:bg-[#E2E8F0] transition-colors cursor-pointer shrink-0 shadow-2xs',
        monthDisplayBtnClass: 'flex items-center space-x-1.5 sm:space-x-2 rounded-lg sm:rounded-xl border border-[#20A4F3]/30 bg-[#20A4F3]/10 hover:bg-[#20A4F3]/20 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-extrabold text-[#20A4F3] shadow-xs transition-all cursor-pointer',

        // 4. Sub-toolbar Aksi Kalender
        subToolbarCardClass: 'flex items-center justify-between rounded-xl sm:rounded-2xl bg-white p-1.5 sm:p-2.5 lg:px-3.5 shadow-xs border border-[#E2E8F0] gap-2',
        subToolbarTitleClass: 'text-xs sm:text-sm font-extrabold text-[#011627] truncate',
        subToolbarDotClass: 'flex h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#20A4F3] shrink-0',
        pasteBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-[#20A4F3] bg-[#20A4F3] hover:bg-[#198fd4] text-white p-1.5 sm:px-2.5 sm:py-1 text-xs font-bold transition-colors cursor-pointer shadow-2xs',
        undoBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-amber-400 bg-amber-500 hover:bg-amber-600 text-white p-1.5 sm:px-2.5 sm:py-1 text-xs font-bold transition-all cursor-pointer shadow-xs animate-pulse',
        resetBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-[#FF3366]/30 bg-[#FF3366]/10 hover:bg-[#FF3366] hover:text-white text-[#FF3366] p-1.5 sm:px-2.5 sm:py-1 text-xs font-bold transition-colors shadow-2xs cursor-pointer',
        lockBtnClass: 'flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-[#20A4F3]/30 bg-[#20A4F3]/10 text-[#20A4F3] hover:bg-[#20A4F3]/20 p-1.5 sm:px-2.5 sm:py-1 text-xs font-bold transition-colors cursor-pointer shadow-2xs',
        expandBtnClass: 'hidden sm:flex items-center space-x-1.5 rounded-lg sm:rounded-xl border border-[#E2E8F0] bg-[#F6F7F8] hover:bg-[#E2E8F0] px-2.5 py-1 text-xs font-bold text-[#011627] transition-colors cursor-pointer',

        // 5. Area Grid Kalender
        calendarContainerCardClass: 'rounded-xl sm:rounded-2xl bg-white p-1.5 sm:p-2.5 lg:p-3 shadow-xs border border-[#E2E8F0]',
        dayNamesHeaderClass: 'grid grid-cols-7 gap-1 sm:gap-1.5 lg:gap-2 mb-1 sm:mb-1.5 rounded-lg sm:rounded-xl bg-[#F6F7F8] p-1 sm:p-1.5 text-center text-[11px] sm:text-xs font-black border border-[#E2E8F0]',
        weekdayNameTextClass: 'text-[#011627]',
        weekendNameTextClass: 'text-[#FF3366]',
        emptyCellClass: 'rounded-lg sm:rounded-xl bg-[#F6F7F8]/60 p-1 min-h-[40px] sm:min-h-[55px] lg:min-h-[64px]',

        // 6. Summary Cards Panel
        summaryPanelCardClass: 'rounded-xl sm:rounded-2xl bg-white p-2.5 sm:p-3 lg:p-3.5 shadow-xs border border-[#E2E8F0]',
        summaryTitleClass: 'text-xs sm:text-sm font-extrabold text-[#011627] flex items-center',
        summaryHeaderBorderClass: 'border-b border-[#E2E8F0] pb-1.5',
        summarySubtextClass: 'text-[10px] sm:text-xs text-slate-500 font-medium',

        // 7. Modal & Pop-up
        modalCardClass: 'bg-white border border-[#E2E8F0] text-[#011627] shadow-2xl rounded-2xl',
        modalHeaderClass: 'border-b border-[#E2E8F0]',
        modalTitleClass: 'text-sm sm:text-base font-extrabold text-[#011627]',
        modalBodyClass: 'text-[#011627]',

        // 8. Mobile Drawer & FAB
        mobileFabClass: 'flex h-14 w-14 items-center justify-center rounded-full bg-[#20A4F3] text-white shadow-xl shadow-blue-500/30 hover:bg-[#198fd4] active:scale-95 transition-all border-2 border-white cursor-pointer',
        mobileDrawerClass: 'relative z-10 w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto border-t border-[#E2E8F0] text-[#011627]',
        mobileDrawerHeaderClass: 'border-b border-[#E2E8F0] pb-3',
        mobileDrawerTitleClass: 'text-sm font-extrabold text-[#011627]',
        mobileDrawerSubtextClass: 'text-[11px] text-slate-500 font-medium',
        mobileDrawerNavBtnActive: 'bg-[#2EC4B6] text-white shadow-xs',
        mobileDrawerNavBtnInactive: 'bg-[#F6F7F8] text-[#011627] hover:bg-[#E2E8F0]',
    };
}
