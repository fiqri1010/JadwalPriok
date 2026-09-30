import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { DayData, LiburNasional, AppTheme } from './types';
import { getThemeConfig } from './themeConfig';
import { DayCell } from './components/DayCell';
import { DayDetailModal } from './components/DayDetailModal';
import { TimePickerModal } from './components/TimePickerModal';
import { MonthYearPickerModal } from './components/MonthYearPickerModal';
import { HolidayManagerModal } from './components/HolidayManagerModal';
import { VersionView } from './components/VersionView';
import { RoadmapView } from './components/RoadmapView';
import { DesktopSidebar } from './components/DesktopSidebar';
import { PasteExcelModal } from './components/PasteExcelModal';
import { WindowTitleBar } from './components/WindowTitleBar';
import { ExportDropdown } from './components/ExportDropdown';
import { TopNavbar } from './components/TopNavbar';
import { SubToolbarHeader } from './components/SubToolbarHeader';
import { CalendarActionToolbar } from './components/CalendarActionToolbar';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileMenuDrawer } from './components/MobileMenuDrawer';
import { ToastNotification } from './components/ToastNotification';
import { SettingsModal } from './components/SettingsModal';
import { MonthlyHolidaySegment } from './components/MonthlyHolidaySegment';
import { MonthlyPiketSummarySegment } from './components/MonthlyPiketSummarySegment';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { LandingPageView, LOCAL_STORAGE_ONBOARDING_DONE_KEY } from './components/LandingPageView';
import { getCurrentUserRole, setCurrentUserRole, getCurrentUserRoleInfo, getCurrentUserPermissions } from './utils/adminStorage';
import { UserRole } from './types/admin';
import { calculatePiketMatches } from './utils/piket';
import { FULL_APP_TITLE, APP_VERSION } from './version';
import { DEFAULT_HOLIDAYS, getIndonesianHoliday } from './data/holidays';

const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const INDONESIAN_DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const DEFAULT_DAY_DATA: DayData = Object.freeze({
    shift: '',
    isLocked: true,
    note: '',
    isMasuk: false,
    jamMasuk: '',
    jamPulang: '',
    absenCeisa: '',
    isManualHoliday: false,
});

const LOCAL_STORAGE_DAYS_KEY = 'jadwalpriok_days_data_v2';
const LOCAL_STORAGE_THEME_KEY = 'jadwalpriok_theme';
const LOCAL_STORAGE_HOLIDAYS_KEY = 'jadwalpriok_custom_holidays';

export const App: React.FC = () => {
    const today = useMemo(() => new Date(), []);
    const [selectedYear, setSelectedYear] = useState<number>(() => today.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(() => today.getMonth() + 1);

    // Active page tab (Layar utama: Kalender Kerja atau Landing Page jika baru pertama diinstal)
    const [pageTab, setPageTab] = useState<'calendar' | 'holiday' | 'settings' | 'version' | 'roadmap' | 'admin' | 'landing'>(() => {
        const isDone = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_ONBOARDING_DONE_KEY) : 'true';
        if (!isDone) return 'landing';
        return 'calendar';
    });

    // User & Admin Role State
    const [currentRole, setCurrentRole] = useState<UserRole>(() => getCurrentUserRole());
    const [userName, setUserName] = useState<string>(() => localStorage.getItem('jadwalpriok_user_name') || 'Ahmad Fiqri');
    const [userNip, setUserNip] = useState<string>(() => localStorage.getItem('jadwalpriok_user_nip') || '199510102015121002');

    // Inisialisasi akun Ahmad Fiqri sebagai Super Admin mutlak
    useEffect(() => {
        const savedNip = localStorage.getItem('jadwalpriok_user_nip');
        if (!savedNip || savedNip === '199208152015021002' || savedNip === '199510102015121002') {
            localStorage.setItem('jadwalpriok_user_name', 'Ahmad Fiqri');
            localStorage.setItem('jadwalpriok_user_nip', '199510102015121002');
            localStorage.setItem('jadwalpriok_current_user_role', 'superadmin');
            // Force state refresh
            setUserName('Ahmad Fiqri');
            setUserNip('199510102015121002');
            setCurrentRole('superadmin');
        }
    }, []);

    // Sync user data & role when changed in localStorage
    useEffect(() => {
        const handleSyncUser = () => {
            setUserName(localStorage.getItem('jadwalpriok_user_name') || 'Ahmad Fiqri');
            setUserNip(localStorage.getItem('jadwalpriok_user_nip') || '199510102015121002');
            setCurrentRole(getCurrentUserRole());
        };

        window.addEventListener('storage', handleSyncUser);
        const interval = setInterval(handleSyncUser, 2000);
        return () => {
            window.removeEventListener('storage', handleSyncUser);
            clearInterval(interval);
        };
    }, []);

    // Reset month & year selection to current running month & year whenever any menu/tab changes or user logs in
    useEffect(() => {
        const now = new Date();
        setSelectedMonth(now.getMonth() + 1);
        setSelectedYear(now.getFullYear());
    }, [pageTab]);

    // Block admin tab if user lacks access permission
    useEffect(() => {
        if (pageTab === 'admin') {
            const isSuperAdminAccount = userName === 'Ahmad Fiqri' || userNip === '199510102015121002';
            const roleInfo = getCurrentUserRoleInfo();
            const permissions = getCurrentUserPermissions();
            const canAccessAdmin = isSuperAdminAccount || roleInfo.role === 'admin' || roleInfo.role === 'superadmin' || permissions.canAccessAdminDashboard;
            if (!canAccessAdmin) {
                setPageTab('calendar');
            }
        }
    }, [pageTab, userName, userNip]);

    // Theme state
    const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
        return (saved as AppTheme) || 'industrial';
    });
    const themeConfig = useMemo(() => getThemeConfig(currentTheme), [currentTheme]);
    const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isScreenSizeBlocked, setIsScreenSizeBlocked] = useState(false);

    // Inisialisasi batasan ukuran jendela minimal untuk desktop (Tauri) dan deteksi pemblokiran ukuran layar
    useEffect(() => {
        const initTauriWindowSize = async () => {
            const isTauri = typeof window !== 'undefined' && Boolean(
                (window as any).__TAURI_INTERNALS__ ||
                (window as any).__TAURI__ ||
                (window as any).isTauri
            );
            if (!isTauri) return;
            try {
                const { getCurrentWindow, LogicalSize } = await import('@tauri-apps/api/window');
                const appWindow = getCurrentWindow();
                if (appWindow) {
                    await appWindow.setMinSize(new LogicalSize(960, 640));
                    
                    // Pastikan ukuran jendela saat ini minimal 960x640
                    const size = await appWindow.innerSize();
                    const scaleFactor = await appWindow.scaleFactor();
                    const logicalWidth = size.width / scaleFactor;
                    const logicalHeight = size.height / scaleFactor;
                    
                    if (logicalWidth < 960 || logicalHeight < 640) {
                        await appWindow.setSize(new LogicalSize(
                            Math.max(logicalWidth, 960),
                            Math.max(logicalHeight, 640)
                        ));
                    }
                }
            } catch (err) {
                console.warn('Gagal membatasi ukuran jendela Tauri:', err);
            }
        };

        const checkScreenSize = () => {
            if (typeof window === 'undefined') return;
            
            // Cek apakah di lingkungan Mobile Native Capacitor atau mobile user-agent
            const isMobileUA = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
            const isCapacitor = (window as any).Capacitor?.isNativePlatform?.();
            
            if (isMobileUA || isCapacitor) {
                setIsScreenSizeBlocked(false);
                return;
            }
            
            // Di desktop (browser maupun Tauri), batasi ukuran layar minimal 960 x 640
            const tooSmall = window.innerWidth < 960 || window.innerHeight < 640;
            setIsScreenSizeBlocked(tooSmall);
        };

        initTauriWindowSize();
        checkScreenSize();

        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const winWidth = window.innerWidth;
            setIsMobile(winWidth < 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Tooltip Viewport Boundary Clamping (60fps Optimized)
    useEffect(() => {
        let animationFrameId: number | null = null;

        const adjustTooltipPosition = (e: Event) => {
            if (window.innerWidth < 768) return;
            const target = e.target as HTMLElement;
            if (!target) return;
            const container = target.closest('.tooltip-container') as HTMLElement;
            if (!container) return;

            const tooltip = container.querySelector('.tooltip') as HTMLElement;
            if (!tooltip) return;

            // Reset expired state and clear previous timer
            if ((container as any)._tooltipTimer) {
                clearTimeout((container as any)._tooltipTimer);
            }
            delete container.dataset.tooltipExpired;

            // Set 2-second auto-hide timer
            (container as any)._tooltipTimer = setTimeout(() => {
                container.dataset.tooltipExpired = 'true';
            }, 2000);

            // If tooltip is in sidebar, it is positioned to the right and doesn't need horizontal boundary clamp
            if (container.closest('#desktop-side-menu')) {
                return;
            }

            if (container.dataset.tooltipAdjusted === 'true') return;
            container.dataset.tooltipAdjusted = 'true';

            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => {
                tooltip.style.marginLeft = '';

                const rect = tooltip.getBoundingClientRect();
                if (rect.width === 0) return;

                const pad = 12;
                const winWidth = window.innerWidth;

                // Calculate minimum left boundary (only clamp to sidebar for tooltips inside main content)
                let minLeft = pad;
                const isInsideMain = Boolean(container.closest('main'));

                if (isInsideMain) {
                    const sidebarEl = document.getElementById('desktop-side-menu');
                    const mainEl = document.querySelector('main');

                    if (sidebarEl && sidebarEl.offsetWidth > 0) {
                        const sidebarRect = sidebarEl.getBoundingClientRect();
                        if (sidebarRect.right > 0 && sidebarRect.right < winWidth * 0.5) {
                            minLeft = sidebarRect.right + pad;
                        }
                    } else if (mainEl) {
                        const mainRect = mainEl.getBoundingClientRect();
                        if (mainRect.left > pad && mainRect.left < winWidth * 0.5) {
                            minLeft = mainRect.left + pad;
                        }
                    }
                }

                const maxRight = winWidth - pad;

                // Calculate CSS scale factor if container or parent is scaled
                const scale = container.offsetWidth > 0 
                    ? (container.getBoundingClientRect().width / container.offsetWidth) 
                    : 1;
                const effectiveScale = scale > 0 ? scale : 1;

                if (rect.right > maxRight) {
                    const overflowRight = (rect.right - maxRight) / effectiveScale;
                    tooltip.style.marginLeft = `-${overflowRight}px`;
                } else if (rect.left < minLeft) {
                    const overflowLeft = (minLeft - rect.left) / effectiveScale;
                    tooltip.style.marginLeft = `${overflowLeft}px`;
                }

                if (rect.top < 60) {
                    tooltip.classList.add('tooltip-bottom');
                }
            });
        };

        const resetTooltipPosition = (e: Event) => {
            if (window.innerWidth < 768) return;
            const target = e.target as HTMLElement;
            if (!target) return;
            const container = target.closest('.tooltip-container') as HTMLElement;
            if (!container) return;

            const relatedTarget = (e as MouseEvent).relatedTarget as HTMLElement;
            if (relatedTarget && container.contains(relatedTarget)) return;

            if ((container as any)._tooltipTimer) {
                clearTimeout((container as any)._tooltipTimer);
                delete (container as any)._tooltipTimer;
            }
            delete container.dataset.tooltipExpired;
            delete container.dataset.tooltipAdjusted;

            const tooltip = container.querySelector('.tooltip') as HTMLElement;
            if (tooltip) {
                tooltip.style.marginLeft = '';
            }
        };

        const handleDismissTooltips = () => {
            if (window.innerWidth < 768) return;
            const activeContainers = document.querySelectorAll('.tooltip-container[data-tooltip-adjusted="true"]');
            if (activeContainers.length === 0) return;

            activeContainers.forEach((el) => {
                const container = el as HTMLElement;
                if ((container as any)._tooltipTimer) {
                    clearTimeout((container as any)._tooltipTimer);
                    delete (container as any)._tooltipTimer;
                }
                delete container.dataset.tooltipExpired;
                delete container.dataset.tooltipAdjusted;
                const tt = container.querySelector('.tooltip') as HTMLElement;
                if (tt) tt.style.marginLeft = '';
            });
        };

        document.addEventListener('mouseover', adjustTooltipPosition, { passive: true, capture: true });
        document.addEventListener('focusin', adjustTooltipPosition, { passive: true, capture: true });
        document.addEventListener('mouseout', resetTooltipPosition, { passive: true, capture: true });
        document.addEventListener('focusout', resetTooltipPosition, { passive: true, capture: true });
        document.addEventListener('scroll', handleDismissTooltips, { passive: true, capture: true });
        document.addEventListener('click', handleDismissTooltips, { passive: true, capture: true });

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            document.removeEventListener('mouseover', adjustTooltipPosition, { capture: true });
            document.removeEventListener('focusin', adjustTooltipPosition, { capture: true });
            document.removeEventListener('mouseout', resetTooltipPosition, { capture: true });
            document.removeEventListener('focusout', resetTooltipPosition, { capture: true });
            document.removeEventListener('scroll', handleDismissTooltips, { capture: true });
            document.removeEventListener('click', handleDismissTooltips, { capture: true });
        };
    }, []);

    // Toast state (Dukungan Notifikasi Bertingkat / Stacked Toasts)
    const [toasts, setToasts] = useState<Array<{ id: string; message: string; description?: string; showUndo?: boolean }>>([]);

    const showToast = useCallback((msg: string, description?: string, showUndo: boolean = false) => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        setToasts((prev) => [...prev, { id, message: msg, description, showUndo }]);
    }, []);

    const handleCloseToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // Modals
    const [activeModalDay, setActiveModalDay] = useState<number | null>(null);
    const [expandedDesktopDay, setExpandedDesktopDay] = useState<number | null>(null);
    const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
    const [pasteModalTab, setPasteModalTab] = useState<'excel_grid' | 'schedule' | 'absen'>('excel_grid');
    const [isMonthYearPickerOpen, setIsMonthYearPickerOpen] = useState(false);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
    const [timePickerTarget, setTimePickerTarget] = useState<{
        dateKey: string;
        field: 'jamMasuk' | 'jamPulang' | 'absenCeisa' | 'unified';
        title: string;
        currentTime: string;
        existingJamMasuk?: string;
        existingJamPulang?: string;
        existingAbsenCeisa?: string;
    } | null>(null);

    // Stable callback handlers to optimize DayCell re-renders
    const handleToggleExpandDesktop = useCallback((dayNum: number) => {
        setExpandedDesktopDay((prev) => (prev === dayNum ? null : dayNum));
    }, []);

    const handleCloseExpandDesktop = useCallback(() => {
        setExpandedDesktopDay(null);
    }, []);

    const handleOpenDetail = useCallback((dayNum: number) => {
        if (window.innerWidth < 768) {
            setActiveModalDay(dayNum);
        } else {
            setExpandedDesktopDay((prev) => (prev === dayNum ? null : dayNum));
        }
    }, []);

    // Holiday list state
    const [daftarLibur, setDaftarLibur] = useState<LiburNasional[]>(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_HOLIDAYS_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    const seen = new Set<string>();
                    return parsed.filter((item: LiburNasional) => {
                        const key = `${item.tanggal}_${item.keterangan || ''}`;
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                    });
                }
            }
        } catch (e) {
            console.error('Failed to load holidays:', e);
        }
        return DEFAULT_HOLIDAYS;
    });

    // Automatically apply and register official default holidays for current and neighboring years on startup/login
    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const yearsToApply = [currentYear - 1, currentYear, currentYear + 1];
        
        setDaftarLibur((prev) => {
            const next = [...prev];
            let modified = false;
            
            for (const targetYear of yearsToApply) {
                for (let m = 1; m <= 12; m++) {
                    const daysInM = new Date(targetYear, m, 0).getDate();
                    for (let d = 1; d <= daysInM; d++) {
                        const officialHoliday = getIndonesianHoliday(targetYear, m, d);
                        if (officialHoliday) {
                            const paddedM = String(m).padStart(2, '0');
                            const paddedD = String(d).padStart(2, '0');
                            const tanggalIso = `${targetYear}-${paddedM}-${paddedD}`;
                            
                            const alreadyExists = next.some((item) => item.tanggal === tanggalIso);
                            if (!alreadyExists) {
                                const isCuti = officialHoliday.toLowerCase().includes('cuti');
                                const kat = isCuti ? 'cuti_bersama' : 'libur_nasional';
                                next.push({
                                    tanggal: tanggalIso,
                                    keterangan: officialHoliday,
                                    kategori: kat,
                                    isDisabled: false,
                                    isCustom: false
                                });
                                modified = true;
                            }
                        }
                    }
                }
            }
            
            if (modified) {
                // Sort by date
                next.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
                try {
                    localStorage.setItem(LOCAL_STORAGE_HOLIDAYS_KEY, JSON.stringify(next));
                } catch (e) {
                    console.error('Failed to auto persist holidays:', e);
                }
                return next;
            }
            return prev;
        });
    }, []);

    // Holiday Map O(1) Lookup Memoization
    const holidayMap = useMemo(() => {
        const map = new Map<string, LiburNasional>();
        for (const h of daftarLibur) {
            map.set(h.tanggal, h);
        }
        return map;
    }, [daftarLibur]);

    // Days State
    const [daysState, setDaysState] = useState<Record<string, DayData>>(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_DAYS_KEY);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load days state:', e);
        }
        return {};
    });

    // Calculation of Piket & OFF Pengganti allocation
    const piketCalculation = useMemo(() => {
        return calculatePiketMatches(daysState, daftarLibur, selectedYear, selectedMonth);
    }, [daysState, daftarLibur, selectedYear, selectedMonth]);

    // Selection state for dates in calendar
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [lastSelectedDay, setLastSelectedDay] = useState<number | null>(null);

    // History and Future stacks for Undo / Redo
    const [historyStack, setHistoryStack] = useState<Record<string, DayData>[]>([]);
    const [futureStack, setFutureStack] = useState<Record<string, DayData>[]>([]);

    // Helper to push state before changes
    const pushToHistory = useCallback((stateToSave: Record<string, DayData>) => {
        setHistoryStack((prev) => [...prev.slice(-25), { ...stateToSave }]);
        setFutureStack([]);
    }, []);

    // Undo stack for Reset Bulan
    const [undoBackup, setUndoBackup] = useState<{
        month: number;
        year: number;
        data: Record<string, DayData>;
    } | null>(null);

    // Persist Days State
    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_DAYS_KEY, JSON.stringify(daysState));
        } catch (e) {
            console.error('Failed to persist days:', e);
        }
    }, [daysState]);

    // Persist and Apply Theme
    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_THEME_KEY, currentTheme);
            document.documentElement.setAttribute('data-theme', currentTheme);
            if (currentTheme === 'dark' || currentTheme === 'winamp') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } catch (e) {
            console.error('Failed to persist theme:', e);
        }
    }, [currentTheme]);

    // Persist Holidays
    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_HOLIDAYS_KEY, JSON.stringify(daftarLibur));
        } catch (e) {
            console.error('Failed to persist holidays:', e);
        }
    }, [daftarLibur]);

    // Touch swipe gesture for switching months on mobile/touch devices
    const touchStartXRef = useRef<number | null>(null);
    const touchStartYRef = useRef<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartXRef.current = e.touches[0].clientX;
        touchStartYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartXRef.current === null || touchStartYRef.current === null) return;
        const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
        const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

        const minSwipeDistance = 45; // Minimum horizontal distance
        // Ensure the swipe is primarily horizontal rather than vertical scrolling
        if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
            if (deltaX < 0) {
                // Swiped left -> Go to Next Month
                handleNextMonth();
            } else {
                // Swiped right -> Go to Previous Month
                handlePrevMonth();
            }
        }

        touchStartXRef.current = null;
        touchStartYRef.current = null;
    };

    // Month Navigation
    const handlePrevMonth = useCallback(() => {
        setSelectedMonth((prev) => {
            if (prev === 1) {
                setSelectedYear((prevYear) => prevYear - 1);
                return 12;
            }
            return prev - 1;
        });
    }, []);

    const handleNextMonth = useCallback(() => {
        setSelectedMonth((prev) => {
            if (prev === 12) {
                setSelectedYear((prevYear) => prevYear + 1);
                return 1;
            }
            return prev + 1;
        });
    }, []);

    const handleGoToCurrentMonth = () => {
        setSelectedYear(today.getFullYear());
        setSelectedMonth(today.getMonth() + 1);
    };

    // Keyboard shortcut (ArrowLeft & ArrowRight) for month navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input/textarea or if any modal/folded menu is open
            const activeEl = document.activeElement;
            const isTyping = activeEl && (
                activeEl.tagName === 'INPUT' ||
                activeEl.tagName === 'TEXTAREA' ||
                activeEl.tagName === 'SELECT' ||
                (activeEl as HTMLElement).isContentEditable
            );

            const isFoldedMenuOpen = expandedDesktopDay !== null;

            const isModalOrMenuOpen = Boolean(
                activeModalDay !== null ||
                isPasteModalOpen ||
                isMonthYearPickerOpen ||
                isResetConfirmOpen ||
                timePickerTarget !== null ||
                isFoldedMenuOpen
            );

            if (isTyping || isModalOrMenuOpen) {
                return;
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handlePrevMonth();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                handleNextMonth();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlePrevMonth, handleNextMonth, activeModalDay, expandedDesktopDay, isPasteModalOpen, isMonthYearPickerOpen, isResetConfirmOpen, timePickerTarget]);

    // Update single day data
    const handleUpdateDay = useCallback((dateKey: string, partial: Partial<DayData>) => {
        setDaysState((prev) => {
            const existing = prev[dateKey] || {
                shift: '',
                isLocked: true,
                note: '',
                isMasuk: false,
                jamMasuk: '',
                jamPulang: '',
                absenCeisa: '',
                isManualHoliday: false,
            };

            const updated: DayData = {
                ...existing,
                ...partial,
            };

            return {
                ...prev,
                [dateKey]: updated,
            };
        });
    }, []);

    // Lock / Unlock Month - default is locked
    const isMonthFullyLocked = useMemo(() => {
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const key = `${selectedYear}-${selectedMonth}-${d}`;
            const item = daysState[key];
            const isLocked = item ? (item.isLocked ?? true) : true;
            if (!isLocked) {
                return false;
            }
        }
        return true;
    }, [selectedYear, selectedMonth, daysState]);

    const handleToggleLockMonth = () => {
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const newLockState = !isMonthFullyLocked;

        setDaysState((prev) => {
            const next = { ...prev };
            for (let d = 1; d <= daysInMonth; d++) {
                const key = `${selectedYear}-${selectedMonth}-${d}`;
                const curr = next[key] || {
                    shift: '',
                    isLocked: true,
                    note: '',
                    isMasuk: false,
                    jamMasuk: '',
                    jamPulang: '',
                    absenCeisa: '',
                    isManualHoliday: false,
                };
                next[key] = {
                    ...curr,
                    isLocked: newLockState,
                };
            }
            return next;
        });

        showToast(newLockState ? 'Seluruh jadwal bulan ini dikunci.' : 'Kunci jadwal bulan ini dibuka.');
    };

    // Reset Current Month
    const handleConfirmResetMonth = () => {
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const backupData: Record<string, DayData> = {};

        for (let d = 1; d <= daysInMonth; d++) {
            const key = `${selectedYear}-${selectedMonth}-${d}`;
            if (daysState[key]) {
                backupData[key] = { ...daysState[key] };
            }
        }

        // Push current state to undo history
        pushToHistory(daysState);

        setUndoBackup({
            month: selectedMonth,
            year: selectedYear,
            data: backupData,
        });

        setDaysState((prev) => {
            const next = { ...prev };
            for (let d = 1; d <= daysInMonth; d++) {
                const key = `${selectedYear}-${selectedMonth}-${d}`;
                delete next[key];
            }
            return next;
        });

        setIsResetConfirmOpen(false);
        showToast(`Jadwal bulan ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} berhasil direset.`);
    };

    const handleUndo = useCallback(() => {
        if (historyStack.length > 0) {
            const previousState = historyStack[historyStack.length - 1];
            setHistoryStack((prev) => prev.slice(0, -1));
            setFutureStack((prev) => [...prev, daysState]);
            setDaysState(previousState);
            showToast('Perubahan berhasil dibatalkan (Undo).');
        } else if (undoBackup) {
            setDaysState((prev) => ({
                ...prev,
                ...undoBackup.data,
            }));
            setUndoBackup(null);
            showToast('Reset jadwal berhasil dibatalkan (Undo).');
        }
    }, [historyStack, daysState, undoBackup]);

    const handleRedo = useCallback(() => {
        if (futureStack.length > 0) {
            const nextState = futureStack[futureStack.length - 1];
            setFutureStack((prev) => prev.slice(0, -1));
            setHistoryStack((prev) => [...prev, daysState]);
            setDaysState(nextState);
            showToast('Perubahan berhasil dikembalikan (Redo).');
        }
    }, [futureStack, daysState]);

    const handleUndoReset = () => {
        handleUndo();
    };

    // Selection Handlers
    const handleSelectAll = useCallback(() => {
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        setSelectedDays(allDays);
        showToast(`Seluruh ${daysInMonth} hari bulan ${MONTH_NAMES[selectedMonth - 1]} dipilih.`);
    }, [selectedYear, selectedMonth]);

    const handleSelectDay = useCallback((dayNum: number, e: React.MouseEvent) => {
        if (e.shiftKey && lastSelectedDay !== null) {
            const start = Math.min(lastSelectedDay, dayNum);
            const end = Math.max(lastSelectedDay, dayNum);
            const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
            setSelectedDays((prev) => Array.from(new Set([...prev, ...range])));
        } else if (e.ctrlKey || e.metaKey) {
            setSelectedDays((prev) =>
                prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum]
            );
            setLastSelectedDay(dayNum);
        } else {
            setSelectedDays([dayNum]);
            setLastSelectedDay(dayNum);
        }
    }, [lastSelectedDay]);

    const handleCopySelected = useCallback(() => {
        if (selectedDays.length === 0) {
            showToast('Pilih setidaknya satu tanggal untuk disalin.');
            return;
        }

        const sortedDays = [...selectedDays].sort((a, b) => a - b);
        const rows = sortedDays.map((d) => {
            const key = `${selectedYear}-${selectedMonth}-${d}`;
            const data = daysState[key];
            return `${d}\t${data?.shift || ''}\t${data?.jamMasuk || ''}\t${data?.jamPulang || ''}\t${data?.absenCeisa || ''}\t${data?.note || ''}`;
        });

        const tsvContent = ['Tanggal\tShift\tJam Masuk\tJam Pulang\tAbsen CEISA\tCatatan', ...rows].join('\n');

        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(tsvContent).catch(() => {});
        }
        showToast(`Data shift & presensi ${sortedDays.length} hari berhasil disalin.`);
    }, [selectedDays, selectedYear, selectedMonth, daysState]);

    const handleOpenPasteTab = useCallback((tab: 'excel_grid' | 'schedule' | 'absen') => {
        setPasteModalTab(tab);
        setIsPasteModalOpen(true);
    }, []);

    const handlePasteContext = useCallback(() => {
        setPasteModalTab('excel_grid');
        setIsPasteModalOpen(true);
    }, []);

    // Clear selection on Month or Year change
    useEffect(() => {
        setSelectedDays([]);
        setLastSelectedDay(null);
    }, [selectedYear, selectedMonth]);

    // Import / Paste Handlers
    const handleApplyPastedSchedule = (batchData: Record<string, Partial<DayData>>) => {
        pushToHistory(daysState);
        setDaysState((prev) => {
            const next = { ...prev };
            Object.entries(batchData).forEach(([dateKey, partial]) => {
                const existing = next[dateKey] || {
                    shift: '',
                    isLocked: false,
                    note: '',
                    isMasuk: false,
                    jamMasuk: '',
                    jamPulang: '',
                    absenCeisa: '',
                    isManualHoliday: false,
                };
                next[dateKey] = {
                    ...existing,
                    ...partial,
                };
            });
            return next;
        });
        showToast(`Berhasil menerapkan ${Object.keys(batchData).length} data jadwal.`);
    };

    const handleImportDays = (importedData: Record<string, DayData>, mode: 'merge' | 'replace') => {
        if (mode === 'replace') {
            setDaysState(importedData);
        } else {
            setDaysState((prev) => ({
                ...prev,
                ...importedData,
            }));
        }
    };

    const handleClearAllData = () => {
        setDaysState({});
        setUndoBackup(null);
        localStorage.removeItem(LOCAL_STORAGE_DAYS_KEY);
    };

    // Time Picker handler
    const handleOpenTimePicker = (field: 'jamMasuk' | 'jamPulang' | 'absenCeisa' | 'unified', title: string, currentValue: string, dateKey: string) => {
        const item = daysState[dateKey];
        setTimePickerTarget({
            dateKey,
            field,
            title,
            currentTime: currentValue,
            existingJamMasuk: item?.jamMasuk || '',
            existingJamPulang: item?.jamPulang || '',
            existingAbsenCeisa: item?.absenCeisa || '',
        });
    };

    const handleApplyTimeUnified = (values: { jamMasuk?: string; jamPulang?: string; absenCeisa?: string }) => {
        if (timePickerTarget) {
            handleUpdateDay(timePickerTarget.dateKey, values);
            setTimePickerTarget(null);
        }
    };

    // Holiday management handlers
    const handleAddLibur = async (tanggal: string, keterangan: string, kategori?: string): Promise<boolean> => {
        const isCuti = kategori === 'cuti_bersama' || (keterangan.toLowerCase().includes('cuti') && kategori !== 'libur_nasional');
        setDaftarLibur((prev) => [
            ...prev.filter((l) => l.tanggal !== tanggal),
            {
                tanggal,
                keterangan,
                kategori: kategori || (isCuti ? 'cuti_bersama' : 'libur_nasional'),
                isCutiBersama: isCuti,
            },
        ]);
        showToast('Hari libur berhasil disimpan.');
        return true;
    };

    const handleDeleteLibur = async (tanggal: string): Promise<boolean> => {
        setDaftarLibur((prev) => prev.filter((l) => l.tanggal !== tanggal));
        showToast('Hari libur berhasil dihapus.');
        return true;
    };

    const handleToggleDisableLibur = async (tanggal: string): Promise<boolean> => {
        setDaftarLibur((prev) =>
            prev.map((l) => {
                if (l.tanggal === tanggal) {
                    const nextDisabled = !l.isDisabled;
                    showToast(nextDisabled ? 'Hari libur dinonaktifkan.' : 'Hari libur diaktifkan.');
                    return { ...l, isDisabled: nextDisabled };
                }
                return l;
            })
        );
        return true;
    };

    const daysInCurrentMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const firstDayOfMonthRaw = new Date(selectedYear, selectedMonth - 1, 1).getDay();
    const firstDayOffset = (firstDayOfMonthRaw + 6) % 7;
    const isCurrentMonthAndYear = selectedYear === today.getFullYear() && selectedMonth === today.getMonth() + 1;

    // Keyboard arrow navigation for expanded folded card on desktop
    useEffect(() => {
        if (isMobile || expandedDesktopDay === null) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            const isTyping = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

            if (e.key === 'Escape') {
                setExpandedDesktopDay(null);
                return;
            }

            // If user is editing text in an input/textarea, preserve arrow key caret navigation
            if (isTyping) {
                return;
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setExpandedDesktopDay((prev) => (prev !== null && prev > 1 ? prev - 1 : prev));
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                setExpandedDesktopDay((prev) => (prev !== null && prev < daysInCurrentMonth ? prev + 1 : prev));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setExpandedDesktopDay((prev) => (prev !== null ? Math.max(1, prev - 7) : prev));
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setExpandedDesktopDay((prev) => (prev !== null ? Math.min(daysInCurrentMonth, prev + 7) : prev));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isMobile, expandedDesktopDay, daysInCurrentMonth]);

    // Global keyboard shortcuts for Calendar operations (Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+Z, Ctrl+Y)
    useEffect(() => {
        const handleGlobalKeys = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            const isTyping = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
            if (isTyping) return;

            // Never intercept keys when any modal or spreadsheet is active
            if (isPasteModalOpen || isResetConfirmOpen || isMonthYearPickerOpen || isMobileMenuOpen) return;
            if (pageTab !== 'calendar') return;

            if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
                e.preventDefault();
                handleSelectAll();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
                if (selectedDays.length > 0) {
                    e.preventDefault();
                    handleCopySelected();
                }
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
                e.preventDefault();
                handlePasteContext();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
                if (e.shiftKey) {
                    e.preventDefault();
                    handleRedo();
                } else {
                    e.preventDefault();
                    handleUndo();
                }
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
                e.preventDefault();
                handleRedo();
            }
        };

        window.addEventListener('keydown', handleGlobalKeys);
        return () => window.removeEventListener('keydown', handleGlobalKeys);
    }, [isPasteModalOpen, isResetConfirmOpen, isMonthYearPickerOpen, isMobileMenuOpen, pageTab, selectedDays, handleSelectAll, handleCopySelected, handlePasteContext, handleUndo, handleRedo]);

    return (
        <div
            data-theme={currentTheme}
            className={`h-full h-[100dvh] max-h-[100dvh] w-full flex flex-col overflow-hidden ${themeConfig.wrapperClass} ${
                currentTheme === 'paperSketch' ? "font-['Gaegu']" : 'font-sans'
            } selection:bg-teal-500 selection:text-white`}
        >
            {/* Window Title Bar */}
            <div className="sticky top-0 z-[999999] shrink-0 w-full">
                <WindowTitleBar
                    theme={currentTheme}
                    title={FULL_APP_TITLE}
                    subtitle=""
                />
            </div>

            {/* Main Workspace Layout with Sidebar reaching the top boundary of header */}
            <div className="flex-1 flex min-h-0 overflow-hidden relative">
                {/* Desktop Sidebar (Disembunyikan ketika berada di halaman Landing Page) */}
                {pageTab !== 'landing' && (
                    <DesktopSidebar
                        isOpen={isSidebarOpen}
                        pageTab={pageTab}
                        setPageTab={setPageTab}
                        themeConfig={themeConfig}
                        currentTheme={currentTheme}
                        isAdmin={currentRole === 'admin'}
                        userName={userName}
                        userNip={userNip}
                        userRole={currentRole}
                    />
                )}

                {/* Right Container: Header & Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
                    {/* Top Navbar (Disembunyikan ketika berada di halaman Landing Page) */}
                    {pageTab !== 'landing' && (
                        <TopNavbar
                            isMobile={isMobile}
                            isDesktopSidebarOpen={isSidebarOpen}
                            onToggleDesktopSidebar={() => setIsSidebarOpen((prev) => !prev)}
                            currentTheme={currentTheme}
                            onThemeChange={setCurrentTheme}
                            isThemeDropdownOpen={isThemeDropdownOpen}
                            setIsThemeDropdownOpen={setIsThemeDropdownOpen}
                            themeConfig={themeConfig}
                            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
                            pageTab={pageTab}
                            exportAction={
                                <ExportDropdown
                                    daysState={daysState}
                                    selectedYear={selectedYear}
                                    selectedMonth={selectedMonth}
                                    daftarLibur={daftarLibur}
                                    currentTheme={currentTheme}
                                    onShowToast={showToast}
                                    buttonClass={themeConfig.themeDropdownBtnClass}
                                />
                            }
                        />
                    )}

                    {/* Main Content Area */}
                    <main id="app-main-content" className={`flex-1 flex flex-col overflow-y-auto min-w-0 ${
                        pageTab === 'landing' ? 'p-0 pb-4' : 'pb-20 sm:pb-24 md:pb-8'
                    }`}>
                    {pageTab === 'calendar' && (
                        <div
                            className={`touch-pan-y ${
                                currentTheme === 'dashboard'
                                    ? 'p-1.5 sm:p-2 lg:p-2.5 w-full max-w-none'
                                    : 'p-2 sm:p-2.5 lg:p-2.5 max-w-[1490px] w-full mx-auto'
                            }`}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            <div className="flex flex-col lg:flex-row gap-2.5 xl:gap-3 items-start">
                                {/* Left/Main Column: Calendar & Controls */}
                                <div className="flex-1 min-w-0 w-full space-y-1.5 sm:space-y-2">
                                    {/* Calendar Header Toolbar */}
                                    <SubToolbarHeader
                                        title="Jadwal Kerja"
                                        themeConfig={themeConfig}
                                        showMonthNavigation={true}
                                        selectedMonth={selectedMonth}
                                        selectedYear={selectedYear}
                                        isCurrentMonthAndYear={isCurrentMonthAndYear}
                                        onJumpToToday={handleGoToCurrentMonth}
                                        onPrevMonth={handlePrevMonth}
                                        onNextMonth={handleNextMonth}
                                        onOpenMonthPicker={() => setIsMonthYearPickerOpen(true)}
                                    />

                                     {/* Mobile/Compact View: Kontrol Kalender diletakkan di atas kalender dalam mode ramping */}
                                    <div className="block lg:hidden mb-1 sm:mb-1.5 w-full min-w-0">
                                        <CalendarActionToolbar
                                            selectedMonth={selectedMonth}
                                            selectedYear={selectedYear}
                                            currentTheme={currentTheme}
                                            areAllLocked={isMonthFullyLocked}
                                            lastResetBackupState={undoBackup ? { year: undoBackup.year, month: undoBackup.month } : null}
                                            
                                            onTempelJadwal={() => setIsPasteModalOpen(true)}
                                            onUndoReset={handleUndoReset}
                                            onResetCalendar={() => setIsResetConfirmOpen(true)}
                                            onToggleAllLock={handleToggleLockMonth}
                                            compact={true}
                                        />
                                    </div>

                                    {/* Calendar Day of Week Headers */}
                                    <div className={themeConfig.dayNamesHeaderClass}>
                                        {INDONESIAN_DAYS.map((dayName, idx) => {
                                            const isWeekend = idx === 5 || idx === 6;
                                            return (
                                                <div
                                                    key={`weekday-header-${dayName}-${idx}`}
                                                    className={`${isWeekend ? themeConfig.weekendNameTextClass : themeConfig.weekdayNameTextClass} ${
                                                        currentTheme === 'dashboard' ? 'border-r border-[#4D2A00]/25 last:border-r-0' : ''
                                                    }`}
                                                >
                                                    {dayName}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Calendar Days Grid */}
                                    {(() => {
                                        const totalCells = firstDayOffset + daysInCurrentMonth;
                                        const totalRows = Math.ceil(totalCells / 7);

                                        // Dynamic autoscale aspect ratio and minimum height based on viewport and total rows
                                        const getGridAspectStyle = (rows: number): React.CSSProperties => {
                                            if (currentTheme === 'dashboard') {
                                                if (isMobile) {
                                                    return {
                                                        aspectRatio: '1 / 1',
                                                        minHeight: 'clamp(58px, 13.5vw, 88px)',
                                                    };
                                                }
                                                if (rows >= 6) {
                                                    return {
                                                        aspectRatio: '1.28 / 1',
                                                        minHeight: 'clamp(96px, 13vh, 142px)',
                                                    };
                                                }
                                                if (rows === 5) {
                                                    return {
                                                        aspectRatio: '1.24 / 1',
                                                        minHeight: 'clamp(104px, 14.5vh, 156px)',
                                                    };
                                                }
                                                return {
                                                    aspectRatio: '1.18 / 1',
                                                    minHeight: 'clamp(114px, 16vh, 172px)',
                                                };
                                            }
                                            if (isMobile) {
                                                return {
                                                    aspectRatio: '1 / 1',
                                                    minHeight: 'clamp(54px, 12.5vw, 80px)',
                                                };
                                            }
                                            if (rows >= 6) {
                                                return {
                                                    aspectRatio: '1.2 / 1',
                                                    minHeight: 'clamp(84px, 11vh, 120px)',
                                                };
                                            }
                                            if (rows === 5) {
                                                return {
                                                    aspectRatio: '1.18 / 1',
                                                    minHeight: 'clamp(88px, 12vh, 130px)',
                                                };
                                            }
                                            return {
                                                aspectRatio: '1.12 / 1',
                                                minHeight: 'clamp(94px, 13vh, 140px)',
                                            };
                                        };

                                        const cellAspectStyle = getGridAspectStyle(totalRows);
                                        const isDashboard = currentTheme === 'dashboard';

                                        return (
                                            <div 
                                                className={`grid grid-cols-7 relative w-full ${
                                                    isDashboard
                                                        ? 'gap-0 border-t border-l border-[#4D2A00]/30 bg-[#FFF4CE]'
                                                        : 'gap-1 sm:gap-1.5'
                                                }`}
                                            >
                                                {/* Empty prefix cells to align Day 1 with its correct day of the week */}
                                                {Array.from({ length: firstDayOffset }).map((_, emptyIdx) => (
                                                    <div
                                                        key={`empty-prefix-${emptyIdx}`}
                                                        style={cellAspectStyle}
                                                        className={`w-full ${
                                                            isDashboard
                                                                ? 'bg-[#F9E6A8]/50 border-r border-b border-[#4D2A00]/30 pointer-events-none'
                                                                : 'opacity-0 pointer-events-none'
                                                        }`}
                                                        aria-hidden="true"
                                                    />
                                                ))}

                                                {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
                                                    const dayNumber = idx + 1;
                                                    const cellIndex = firstDayOffset + idx;
                                                    const colIndex = cellIndex % 7;
                                                    const rowIndex = Math.floor(cellIndex / 7);
                                                    const isRightEdge = colIndex >= 6;
                                                    const isBottomEdge = rowIndex >= totalRows - 1;

                                                    const dateKey = `${selectedYear}-${selectedMonth}-${dayNumber}`;
                                                    const dayData = daysState[dateKey] || {
                                                        shift: '',
                                                        isLocked: true,
                                                        note: '',
                                                        isMasuk: false,
                                                        jamMasuk: '',
                                                        jamPulang: '',
                                                        absenCeisa: '',
                                                        isManualHoliday: false,
                                                    };

                                                    const paddedD = String(dayNumber).padStart(2, '0');
                                                    const paddedM = String(selectedMonth).padStart(2, '0');
                                                    const isoDate = `${selectedYear}-${paddedM}-${paddedD}`;
                                                    const holiday = holidayMap.get(isoDate) || holidayMap.get(dateKey);

                                                    const nextDayPaddedD = String(dayNumber + 1).padStart(2, '0');
                                                    const nextDateKey = `${selectedYear}-${paddedM}-${nextDayPaddedD}`;
                                                    const nextDayData = daysState[nextDateKey];

                                                    return (
                                                        <div
                                                            key={dateKey}
                                                            style={cellAspectStyle}
                                                            className={`relative w-full ${
                                                                isDashboard ? 'border-r border-b border-[#4D2A00]/30' : ''
                                                            }`}
                                                        >
                                                            <DayCell
                                                                dateKey={dateKey}
                                                                year={selectedYear}
                                                                month={selectedMonth}
                                                                dayNumber={dayNumber}
                                                                data={dayData}
                                                                nextDayData={nextDayData}
                                                                isLocked={dayData.isLocked ?? true}
                                                                holiday={holiday}
                                                                theme={currentTheme}
                                                                isSelected={selectedDays.includes(dayNumber)}
                                                                onSelectDay={handleSelectDay}
                                                                isExpandedDesktop={!isMobile && expandedDesktopDay === dayNumber}
                                                                isRightEdge={isRightEdge}
                                                                isBottomEdge={isBottomEdge}
                                                                onToggleExpandDesktop={handleToggleExpandDesktop}
                                                                onCloseExpandDesktop={handleCloseExpandDesktop}
                                                                onUpdate={(partial) => handleUpdateDay(dateKey, partial)}
                                                                onRequestTimePick={(field, title, currentVal) =>
                                                                    handleOpenTimePicker(field, title, currentVal, dateKey)
                                                                }
                                                                onOpenDetail={handleOpenDetail}
                                                                piketMatchInfo={piketCalculation.piketByDateKey[dateKey]}
                                                                offMatchInfo={piketCalculation.offMatches[dateKey]}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}

                                     {/* Mobile View: Libur Nasional di Atas & Ringkasan Piket di Bawah Kalender */}
                                    <div className="block lg:hidden pt-2 space-y-3">
                                        <MonthlyHolidaySegment
                                            selectedMonth={selectedMonth}
                                            selectedYear={selectedYear}
                                            daftarLibur={daftarLibur}
                                            theme={currentTheme}
                                            onSelectDate={(dayNum) => {
                                                if (isMobile) {
                                                    setActiveModalDay(dayNum);
                                                } else {
                                                    setExpandedDesktopDay(dayNum);
                                                }
                                            }}
                                        />

                                        <MonthlyPiketSummarySegment
                                            selectedMonth={selectedMonth}
                                            selectedYear={selectedYear}
                                            piketCalculation={piketCalculation}
                                            theme={currentTheme}
                                            layout="wide"
                                            onSelectDate={(dayNum) => {
                                                if (isMobile) {
                                                    setActiveModalDay(dayNum);
                                                } else {
                                                    setExpandedDesktopDay(dayNum);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Desktop View: Right Sidebar with Controls at Very Top & Holiday List */}
                                <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-2 space-y-3 relative z-20">
                                    <CalendarActionToolbar
                                        selectedMonth={selectedMonth}
                                        selectedYear={selectedYear}
                                        currentTheme={currentTheme}
                                        areAllLocked={isMonthFullyLocked}
                                        lastResetBackupState={undoBackup ? { year: undoBackup.year, month: undoBackup.month } : null}
                                        
                                        onTempelJadwal={() => setIsPasteModalOpen(true)}
                                        onUndoReset={handleUndoReset}
                                        onResetCalendar={() => setIsResetConfirmOpen(true)}
                                        onToggleAllLock={handleToggleLockMonth}
                                    />

                                    <MonthlyPiketSummarySegment
                                        selectedMonth={selectedMonth}
                                        selectedYear={selectedYear}
                                        piketCalculation={piketCalculation}
                                        theme={currentTheme}
                                        layout="sidebar"
                                        onSelectDate={(dayNum) => {
                                            if (isMobile) {
                                                setActiveModalDay(dayNum);
                                            } else {
                                                setExpandedDesktopDay(dayNum);
                                            }
                                        }}
                                    />

                                    <MonthlyHolidaySegment
                                        selectedMonth={selectedMonth}
                                        selectedYear={selectedYear}
                                        daftarLibur={daftarLibur}
                                        theme={currentTheme}
                                        onSelectDate={(dayNum) => {
                                            if (isMobile) {
                                                setActiveModalDay(dayNum);
                                            } else {
                                                setExpandedDesktopDay(dayNum);
                                            }
                                        }}
                                    />
                                </aside>
                            </div>
                        </div>
                    )}

                    {pageTab === 'holiday' && (
                        <div className="p-2 sm:p-3 lg:p-3 max-w-[1490px] w-full mx-auto">
                            <HolidayManagerModal
                                isOpen={true}
                                onClose={() => setPageTab('calendar')}
                                isPageView={true}
                                selectedMonth={selectedMonth}
                                selectedYear={selectedYear}
                                monthName={MONTH_NAMES[selectedMonth - 1]}
                                daftarLibur={daftarLibur}
                                onAddLibur={handleAddLibur}
                                onDeleteLibur={handleDeleteLibur}
                                onToggleDisableLibur={handleToggleDisableLibur}
                                theme={currentTheme}
                            />
                        </div>
                    )}

                    {pageTab === 'settings' && (
                        <div className="p-2 sm:p-3 lg:p-3 max-w-[1490px] w-full mx-auto">
                            <SettingsModal
                                isOpen={true}
                                onClose={() => setPageTab('calendar')}
                                isPageView={true}
                                daysState={daysState}
                                selectedMonth={selectedMonth}
                                selectedYear={selectedYear}
                                monthName={MONTH_NAMES[selectedMonth - 1]}
                                onImportDays={handleImportDays}
                                onClearAllData={handleClearAllData}
                                onShowToast={showToast}
                                theme={currentTheme}
                                daftarLibur={daftarLibur}
                            />
                        </div>
                    )}

                    {pageTab === 'version' && (
                        <div className="p-2 sm:p-3 lg:p-3 max-w-[1490px] w-full mx-auto">
                            <VersionView theme={currentTheme} />
                        </div>
                    )}

                    {pageTab === 'roadmap' && (
                        <div className="p-2 sm:p-3 lg:p-3 max-w-[1490px] w-full mx-auto">
                            <RoadmapView theme={currentTheme} />
                        </div>
                    )}

                    {pageTab === 'admin' && (
                        <div className="p-2 sm:p-3 lg:p-3 max-w-[1490px] w-full mx-auto">
                            <AdminDashboardView
                                theme={currentTheme}
                                daysState={daysState}
                                onShowToast={showToast}
                                currentRole={currentRole}
                                onRoleChange={(r) => {
                                    setCurrentRole(r);
                                    setCurrentUserRole(r);
                                }}
                            />
                        </div>
                    )}

                    {pageTab === 'landing' && (
                        <div className="p-2 sm:p-3 w-full max-w-[1490px] mx-auto flex-1 flex flex-col items-center justify-center min-h-0 overflow-y-auto">
                            <LandingPageView
                                theme={currentTheme}
                                onComplete={() => setPageTab('calendar')}
                                onClose={() => setPageTab('calendar')}
                                onShowToast={showToast}
                                onNavigateToTab={(tab) => setPageTab(tab)}
                            />
                        </div>
                    )}
                </main>
                </div>
            </div>

            {/* Mobile Bottom Navigation (Disembunyikan saat Landing Page aktif) */}
            {pageTab !== 'landing' && (
                <MobileBottomNav
                    pageTab={pageTab}
                    onTabChange={setPageTab}
                    onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
                    theme={currentTheme}
                    themeConfig={themeConfig}
                />
            )}

            {/* Mobile Menu Drawer */}
            <MobileMenuDrawer
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                pageTab={pageTab}
                onSelectTab={setPageTab}
                currentTheme={currentTheme}
                appVersion={APP_VERSION}
                isAdmin={currentRole === 'admin'}
                userName={userName}
                userNip={userNip}
                userRole={currentRole}
            />

            {/* Month-Year Picker Modal */}
            {isMonthYearPickerOpen && (
                <MonthYearPickerModal
                    isOpen={isMonthYearPickerOpen}
                    onClose={() => setIsMonthYearPickerOpen(false)}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onSelect={(m, y) => {
                        setSelectedMonth(m);
                        setSelectedYear(y);
                        setIsMonthYearPickerOpen(false);
                    }}
                    theme={currentTheme}
                />
            )}

            {/* Paste from Excel Modal */}
            {isPasteModalOpen && (
                <PasteExcelModal
                    isOpen={isPasteModalOpen}
                    onClose={() => setIsPasteModalOpen(false)}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    onApply={handleApplyPastedSchedule}
                    initialTab={pasteModalTab}
                    theme={currentTheme}
                />
            )}

            {/* Reset Confirmation Modal */}
            {isResetConfirmOpen && (
                <ResetConfirmModal
                    isOpen={isResetConfirmOpen}
                    onClose={() => setIsResetConfirmOpen(false)}
                    onConfirm={handleConfirmResetMonth}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    theme={currentTheme}
                />
            )}

            {/* Time Picker Modal */}
            {timePickerTarget && (
                <TimePickerModal
                    isOpen={Boolean(timePickerTarget)}
                    onClose={() => setTimePickerTarget(null)}
                    value={timePickerTarget.currentTime}
                    title={timePickerTarget.title}
                    field={timePickerTarget.field}
                    existingJamMasuk={daysState[timePickerTarget.dateKey]?.jamMasuk}
                    existingJamPulang={daysState[timePickerTarget.dateKey]?.jamPulang}
                    existingAbsenCeisa={daysState[timePickerTarget.dateKey]?.absenCeisa}
                    onSelect={(timeStr) => {
                        if (timePickerTarget.field && timePickerTarget.field !== 'unified') {
                            handleUpdateDay(timePickerTarget.dateKey, {
                                [timePickerTarget.field]: timeStr,
                            });
                        }
                    }}
                    onApplyUnified={handleApplyTimeUnified}
                    theme={currentTheme}
                />
            )}

            {/* Day Detail Popup Modal with Swipe Gesture Navigation (Mobile Only) */}
            {isMobile && activeModalDay !== null && (
                (() => {
                    const dateKey = `${selectedYear}-${selectedMonth}-${activeModalDay}`;
                    const dayData = daysState[dateKey] || {
                        shift: '',
                        isLocked: false,
                        note: '',
                        isMasuk: false,
                        jamMasuk: '',
                        jamPulang: '',
                        absenCeisa: '',
                        isManualHoliday: false,
                    };
                    const paddedD = String(activeModalDay).padStart(2, '0');
                    const paddedM = String(selectedMonth).padStart(2, '0');
                    const isoDate = `${selectedYear}-${paddedM}-${paddedD}`;
                    const holiday = daftarLibur.find((h) => h.tanggal === isoDate || h.tanggal === dateKey);

                    const nextDateKey = `${selectedYear}-${selectedMonth}-${activeModalDay + 1}`;
                    const nextDayData = daysState[nextDateKey] || null;

                    return (
                        <DayDetailModal
                            isOpen={activeModalDay !== null && isMobile}
                            dayNumber={activeModalDay}
                            year={selectedYear}
                            month={selectedMonth}
                            daysInMonth={daysInCurrentMonth}
                            data={dayData}
                            nextDayData={nextDayData}
                            isLocked={Boolean(dayData.isLocked)}
                            holiday={holiday}
                            theme={currentTheme}
                            onClose={() => setActiveModalDay(null)}
                            onNavigateDay={(targetDay) => setActiveModalDay(targetDay)}
                            onUpdate={(partial) => handleUpdateDay(dateKey, partial)}
                            onRequestTimePick={(field, title, currentVal) =>
                                handleOpenTimePicker(field, title, currentVal, dateKey)
                            }
                            piketMatchInfo={piketCalculation.piketByDateKey[dateKey]}
                            offMatchInfo={piketCalculation.offMatches[dateKey]}
                        />
                    );
                })()
            )}

            {/* Toast Notification (Dukungan Notifikasi Bertingkat) */}
            <ToastNotification
                toasts={toasts}
                lastResetBackupState={undoBackup ? { year: undoBackup.year, month: undoBackup.month } : null}
                areAllLocked={isMonthFullyLocked}
                onUndoReset={handleUndoReset}
                onCloseToast={handleCloseToast}
                theme={currentTheme}
            />
        </div>
    );
};

export default App;
