import React, { useState, useEffect } from 'react';
import { AppLogo } from './AppLogo';
import { FULL_APP_TITLE } from '../version';
import {
    Minus,
    Plus,
    Square,
    Copy,
    X,
    Zap,
    Maximize2,
    Minimize2,
    Percent
} from 'lucide-react';
import { AppTheme } from '../types';
import { isTauriEnvironment } from '../lib/fileDownload';

export const LOCAL_STORAGE_UI_ZOOM_KEY = 'jadwalpriok_ui_zoom_level';

export function getInitialZoom(): number {
    if (typeof window === 'undefined') return 100;
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_UI_ZOOM_KEY);
        if (saved) {
            const parsed = parseInt(saved, 10);
            if (!isNaN(parsed) && parsed >= 60 && parsed <= 160) {
                return parsed;
            }
        }
    } catch {}
    return 100;
}

export function applyUiZoom(zoomLevel: number) {
    if (typeof document === 'undefined') return;
    try {
        (document.documentElement.style as any).zoom = `${zoomLevel}%`;
        localStorage.setItem(LOCAL_STORAGE_UI_ZOOM_KEY, String(zoomLevel));
    } catch (e) {
        console.warn('Gagal mengubah zoom UI:', e);
    }
}

interface WindowTitleBarProps {
    theme: AppTheme;
    appTitle?: string;
    appVersion?: string;
    onClose?: () => void;
    title?: string;
    subtitle?: string;
}

export const WindowTitleBar: React.FC<WindowTitleBarProps> = ({
    theme,
    title = FULL_APP_TITLE,
    subtitle = 'Kalender Jadwal Kerja',
    onClose
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState<number>(getInitialZoom);

    // Apply zoom and keep in sync
    useEffect(() => {
        applyUiZoom(zoomLevel);
    }, [zoomLevel]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Get Tauri AppWindow safely
    const getTauriAppWindow = async () => {
        if (!isTauriEnvironment()) return null;
        try {
            const { getCurrentWindow } = await import('@tauri-apps/api/window');
            return getCurrentWindow();
        } catch (e) {
            console.warn('Gagal memuat instance jendela Tauri:', e);
            return null;
        }
    };

    // Native Window Dragging for PC / Tauri
    const handleStartDragging = async (e: React.MouseEvent) => {
        // Only drag with left mouse button and not when clicking controls
        if (e.button === 0 && !(e.target as HTMLElement).closest('button, a, input, select')) {
            const appWindow = await getTauriAppWindow();
            if (appWindow) {
                try {
                    await appWindow.startDragging();
                } catch (err) {
                    console.warn('Tauri startDragging error:', err);
                }
            }
        }
    };

    const handleZoomIn = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoomLevel((prev) => Math.min(150, prev + 10));
    };

    const handleZoomOut = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoomLevel((prev) => Math.max(70, prev - 10));
    };

    const handleResetZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoomLevel(100);
    };

    const handleMinimize = async () => {
        const appWindow = await getTauriAppWindow();
        if (appWindow) {
            try {
                await appWindow.minimize();
                return;
            } catch (err) {
                console.warn('Tauri minimize error:', err);
            }
        }

        // Web Fallback
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
            setIsFullscreen(false);
        }
    };

    const handleToggleMaximize = async () => {
        const appWindow = await getTauriAppWindow();
        if (appWindow) {
            try {
                await appWindow.toggleMaximize();
                const isMax = await appWindow.isMaximized();
                setIsFullscreen(isMax);
                return;
            } catch (err) {
                console.warn('Tauri toggleMaximize error:', err);
            }
        }

        // Web Fallback (Fullscreen API)
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }
            setIsFullscreen(false);
        }
    };

    const handleClose = async () => {
        const appWindow = await getTauriAppWindow();
        if (appWindow) {
            try {
                await appWindow.close();
                return;
            } catch (err) {
                console.warn('Tauri close error:', err);
            }
        }

        if (onClose) {
            onClose();
            return;
        }

        // Standard browser fallback
        try {
            window.close();
        } catch {
            // Ignored if browser prevents window.close on user-opened tabs
        }
    };

    // Paper Sketch Edition Title Bar
    if (theme === 'paperSketch') {
        return (
            <div
                data-tauri-drag-region="true"
                onMouseDown={handleStartDragging}
                className="hidden sm:block w-full shrink-0 select-none font-['Gaegu'] text-sm bg-[#ffffff] border-b-[2.5px] border-[#2b2b2b] shadow-[0_2px_0px_#2b2b2b] cursor-default relative z-[999999]"
            >
                <div data-tauri-drag-region="true" className="h-7.5 px-3 flex items-center justify-between text-[#2b2b2b] bg-[#ffffff]">
                    <div data-tauri-drag-region="true" className="flex items-center space-x-2 min-w-0 pr-2 pointer-events-none">
                        <AppLogo className="h-4.5 w-4.5 rounded-sm border border-[#2b2b2b] shrink-0" />
                        <span data-tauri-drag-region="true" className="font-['Gochi_Hand'] font-bold text-[#2b2b2b] text-base truncate">
                            {title} <span className="text-xs font-mono opacity-60 hidden md:inline">({subtitle})</span>
                        </span>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                        {/* Zoom Controls: "-", "%", "+" (6px jarak ke tombol minimize) */}
                        <div className="flex items-center space-x-0.5 mr-[6px]">
                            <button
                                type="button"
                                onClick={handleZoomOut}
                                className="h-5 w-5 rounded-sm border-2 border-[#2b2b2b] bg-white text-[#2b2b2b] hover:bg-[#2ec4b6]/30 shadow-[1px_1px_0px_#2b2b2b] flex items-center justify-center transition-all cursor-pointer font-bold active:translate-x-0.5 active:translate-y-0.5"
                                title="Perkecil Ukuran Tampilan UI (-)"
                            >
                                <Minus className="h-2.5 w-2.5" />
                            </button>
                            <button
                                type="button"
                                onClick={handleResetZoom}
                                className="h-5 px-1.5 rounded-sm border-2 border-[#2b2b2b] bg-white text-[#2b2b2b] hover:bg-[#2ec4b6]/30 shadow-[1px_1px_0px_#2b2b2b] flex items-center justify-center text-[10px] font-mono font-bold transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                                title="Reset Ukuran UI ke 100%"
                            >
                                {zoomLevel}%
                            </button>
                            <button
                                type="button"
                                onClick={handleZoomIn}
                                className="h-5 w-5 rounded-sm border-2 border-[#2b2b2b] bg-white text-[#2b2b2b] hover:bg-[#2ec4b6]/30 shadow-[1px_1px_0px_#2b2b2b] flex items-center justify-center transition-all cursor-pointer font-bold active:translate-x-0.5 active:translate-y-0.5"
                                title="Perbesar Ukuran Tampilan UI (+)"
                            >
                                <Plus className="h-2.5 w-2.5" />
                            </button>
                        </div>

                        {/* Window Controls */}
                        <button
                            type="button"
                            onClick={handleMinimize}
                            className="h-5 w-6 rounded-sm border-2 border-[#2b2b2b] bg-white text-[#2b2b2b] hover:bg-[#2ec4b6]/30 shadow-[1px_1px_0px_#2b2b2b] flex items-center justify-center transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                            title="Minimize"
                        >
                            <Minus className="h-3 w-3" />
                        </button>
                        <button
                            type="button"
                            onClick={handleToggleMaximize}
                            className="h-5 w-6 rounded-sm border-2 border-[#2b2b2b] bg-white text-[#2b2b2b] hover:bg-[#2ec4b6]/30 shadow-[1px_1px_0px_#2b2b2b] flex items-center justify-center transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                            title={isFullscreen ? 'Restore' : 'Maximize'}
                        >
                            {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="h-5 w-6 rounded-sm border-2 border-[#2b2b2b] bg-white text-[#2b2b2b] hover:bg-[#ff4747] hover:text-white shadow-[1px_1px_0px_#2b2b2b] flex items-center justify-center transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                            title="Tutup Jendela"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Windows Vista Aero Glass Title Bar
    if (theme === 'vista') {
        return (
            <div
                data-tauri-drag-region="true"
                onMouseDown={handleStartDragging}
                className="hidden sm:block w-full shrink-0 select-none font-sans text-xs shadow-md border-b border-white/35 cursor-default relative z-[999999]"
            >
                <div
                    data-tauri-drag-region="true"
                    className="h-8 px-3 flex items-center justify-between text-white relative overflow-hidden backdrop-blur-xl"
                    style={{
                        background:
                            'linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(186, 230, 253, 0.35) 45%, rgba(56, 189, 248, 0.25) 50%, rgba(14, 116, 224, 0.38) 100%)',
                        boxShadow:
                            'inset 0 1px 1px rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(255, 255, 255, 0.3), 0 2px 10px rgba(0, 50, 120, 0.15)',
                        backdropFilter: 'blur(20px) saturate(190%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(190%)',
                    }}
                >
                    {/* Aero Specular Sheen Overlay */}
                    <div className="absolute top-0 left-0 right-0 h-3.5 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
                    
                    <div data-tauri-drag-region="true" className="flex items-center space-x-2 z-10 min-w-0 pr-2">
                        <AppLogo className="h-5 w-5 rounded-md shadow-xs drop-shadow-xs shrink-0 border border-white/40 pointer-events-none" />
                        <span data-tauri-drag-region="true" className="font-extrabold tracking-wide text-sky-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)] truncate pointer-events-none">
                            {title} <span className="text-[10px] font-semibold text-sky-900/80 hidden md:inline">({subtitle})</span>
                        </span>
                    </div>

                    {/* Window Controls: Minimize, Maximize, Close */}
                    <div className="flex items-center space-x-1.5 z-10 shrink-0 -mr-1">
                        {/* Zoom Controls: "-", "%", "+" (6px jarak ke tombol minimize) */}
                        <div className="flex items-center space-x-0.5 mr-[6px]">
                            <button
                                type="button"
                                onClick={handleZoomOut}
                                title="Perkecil Ukuran Tampilan UI (-)"
                                className="h-5 w-5 rounded-xs flex items-center justify-center bg-white/40 hover:bg-white/70 border border-white/70 text-sky-950 shadow-2xs transition-all cursor-pointer active:scale-95"
                            >
                                <Minus className="h-2.5 w-2.5" />
                            </button>
                            <button
                                type="button"
                                onClick={handleResetZoom}
                                title="Reset Ukuran UI ke 100%"
                                className="h-5 px-1.5 rounded-xs flex items-center justify-center bg-white/40 hover:bg-white/70 border border-white/70 text-sky-950 text-[10px] font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
                            >
                                {zoomLevel}%
                            </button>
                            <button
                                type="button"
                                onClick={handleZoomIn}
                                title="Perbesar Ukuran Tampilan UI (+)"
                                className="h-5 w-5 rounded-xs flex items-center justify-center bg-white/40 hover:bg-white/70 border border-white/70 text-sky-950 shadow-2xs transition-all cursor-pointer active:scale-95"
                            >
                                <Plus className="h-2.5 w-2.5" />
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleMinimize}
                            title="Minimize"
                            className="h-5 w-7 rounded-xs flex items-center justify-center bg-white/40 hover:bg-white/70 border border-white/70 text-sky-950 shadow-2xs transition-all cursor-pointer active:scale-95"
                        >
                            <Minus className="h-3 w-3" />
                        </button>
                        <button
                            type="button"
                            onClick={handleToggleMaximize}
                            title={isFullscreen ? 'Restore' : 'Maximize'}
                            className="h-5 w-7 rounded-xs flex items-center justify-center bg-white/40 hover:bg-white/70 border border-white/70 text-sky-950 shadow-2xs transition-all cursor-pointer active:scale-95"
                        >
                            {isFullscreen ? <Copy className="h-2.5 w-2.5 rotate-90" /> : <Square className="h-2.5 w-2.5" />}
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            title="Tutup Jendela"
                            className="h-5 w-7 rounded-xs flex items-center justify-center bg-white/40 hover:bg-rose-500/90 hover:text-white border border-white/70 hover:border-rose-400 text-sky-950 shadow-2xs transition-all cursor-pointer active:scale-95"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Winamp Classic Retro Title Bar
    if (theme === 'winamp') {
        return (
            <div
                data-tauri-drag-region="true"
                onMouseDown={handleStartDragging}
                className="hidden sm:block w-full shrink-0 select-none font-mono text-[11px] bg-[#1a1e22] border-b-2 border-[#0a0d0f] cursor-default relative z-[999999]"
            >
                <div
                    data-tauri-drag-region="true"
                    className="h-7 px-2 flex items-center justify-between text-emerald-400 relative"
                    style={{
                        background: 'linear-gradient(180deg, #444f59 0%, #2c343b 50%, #1a1e22 100%)',
                        borderTop: '1px solid #7d90a0',
                        borderLeft: '1px solid #7d90a0',
                        borderRight: '1px solid #080a0c',
                    }}
                >
                    <div data-tauri-drag-region="true" className="flex items-center space-x-2 min-w-0 pr-2 pointer-events-none">
                        <div className="h-4 w-4 bg-[#0a0d0f] border border-[#00ff66]/50 flex items-center justify-center text-amber-400 shrink-0">
                            <Zap className="h-3 w-3 fill-amber-400" />
                        </div>
                        <span data-tauri-drag-region="true" className="font-mono font-bold tracking-widest text-[#00ff66] uppercase truncate">
                            *** WINAMP - {title} ***
                        </span>
                    </div>

                    {/* Winamp Controls: Minimize, Maximize, Close */}
                    <div className="flex items-center space-x-1 shrink-0">
                        {/* Zoom Controls: "-", "%", "+" (6px jarak ke tombol minimize) */}
                        <div className="flex items-center space-x-0.5 mr-[6px]">
                            <button
                                type="button"
                                onClick={handleZoomOut}
                                title="Perkecil Ukuran Tampilan UI (-)"
                                className="h-4 w-4 bg-[#323b42] hover:bg-[#485560] border-t border-l border-[#6a7d8d] border-b border-r border-[#0a0d0f] text-[#00ff66] flex items-center justify-center text-[10px] font-mono font-bold cursor-pointer"
                            >
                                -
                            </button>
                            <button
                                type="button"
                                onClick={handleResetZoom}
                                title="Reset Ukuran UI ke 100%"
                                className="h-4 px-1 bg-[#323b42] hover:bg-[#485560] border-t border-l border-[#6a7d8d] border-b border-r border-[#0a0d0f] text-[#00ff66] flex items-center justify-center text-[9px] font-mono font-bold cursor-pointer"
                            >
                                {zoomLevel}%
                            </button>
                            <button
                                type="button"
                                onClick={handleZoomIn}
                                title="Perbesar Ukuran Tampilan UI (+)"
                                className="h-4 w-4 bg-[#323b42] hover:bg-[#485560] border-t border-l border-[#6a7d8d] border-b border-r border-[#0a0d0f] text-[#00ff66] flex items-center justify-center text-[10px] font-mono font-bold cursor-pointer"
                            >
                                +
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleMinimize}
                            title="Minimize"
                            className="h-4 w-4 bg-[#323b42] hover:bg-[#485560] border-t border-l border-[#6a7d8d] border-b border-r border-[#0a0d0f] text-slate-200 flex items-center justify-center text-[9px] cursor-pointer"
                        >
                            _
                        </button>
                        <button
                            type="button"
                            onClick={handleToggleMaximize}
                            title={isFullscreen ? 'Restore' : 'Maximize'}
                            className="h-4 w-4 bg-[#323b42] hover:bg-[#485560] border-t border-l border-[#6a7d8d] border-b border-r border-[#0a0d0f] text-slate-200 flex items-center justify-center text-[9px] cursor-pointer"
                        >
                            {isFullscreen ? '▼' : '▲'}
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            title="Tutup Jendela"
                            className="h-4 w-4 bg-[#323b42] hover:bg-rose-700 hover:text-white border-t border-l border-[#6a7d8d] border-b border-r border-[#0a0d0f] text-slate-200 flex items-center justify-center text-[9px] cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Dark Fluid Material Title Bar
    if (theme === 'darkFluid') {
        return (
            <div
                data-tauri-drag-region="true"
                onMouseDown={handleStartDragging}
                className="hidden sm:block w-full shrink-0 select-none font-sans text-xs bg-[#141218] border-b border-white/5 cursor-default relative z-[999999]"
            >
                <div data-tauri-drag-region="true" className="h-7 px-3 flex items-center justify-between text-[#E6E0E9] bg-[#1D1B20]">
                    <div data-tauri-drag-region="true" className="flex items-center space-x-2 min-w-0 pr-2 pointer-events-none">
                        <AppLogo className="h-4 w-4 rounded-xs shrink-0" />
                        <span data-tauri-drag-region="true" className="font-semibold text-[#E6E0E9] text-[11px] truncate">
                            {title}
                        </span>
                    </div>

                    <div className="flex items-center space-x-0.5 shrink-0">
                        {/* Zoom Controls: "-", "%", "+" (6px jarak ke tombol minimize) */}
                        <div className="flex items-center space-x-0.5 mr-[6px]">
                            <button
                                type="button"
                                onClick={handleZoomOut}
                                className="h-5 w-5 rounded flex items-center justify-center text-[#CAC4D0] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Perkecil Ukuran Tampilan UI (-)"
                            >
                                <Minus className="h-2.5 w-2.5" />
                            </button>
                            <button
                                type="button"
                                onClick={handleResetZoom}
                                className="h-5 px-1.5 rounded flex items-center justify-center text-[#CAC4D0] hover:text-white hover:bg-white/10 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                                title="Reset Ukuran UI ke 100%"
                            >
                                {zoomLevel}%
                            </button>
                            <button
                                type="button"
                                onClick={handleZoomIn}
                                className="h-5 w-5 rounded flex items-center justify-center text-[#CAC4D0] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Perbesar Ukuran Tampilan UI (+)"
                            >
                                <Plus className="h-2.5 w-2.5" />
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleMinimize}
                            className="h-5 w-6 rounded flex items-center justify-center text-[#CAC4D0] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Minimize"
                        >
                            <Minus className="h-3 w-3" />
                        </button>
                        <button
                            type="button"
                            onClick={handleToggleMaximize}
                            className="h-5 w-6 rounded flex items-center justify-center text-[#CAC4D0] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title={isFullscreen ? 'Restore' : 'Maximize'}
                        >
                            {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="h-5 w-6 rounded flex items-center justify-center text-[#CAC4D0] hover:text-white hover:bg-[#B3261E] transition-colors cursor-pointer"
                            title="Tutup Jendela"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Dark Mode Title Bar
    if (theme === 'dark') {
        return (
            <div
                data-tauri-drag-region="true"
                onMouseDown={handleStartDragging}
                className="hidden sm:block w-full shrink-0 select-none font-sans text-xs bg-[#121212] border-b border-[#333333] cursor-default relative z-[999999]"
            >
                <div data-tauri-drag-region="true" className="h-7 px-3 flex items-center justify-between text-[#E0E0E0] bg-[#1A1A1A]">
                    <div data-tauri-drag-region="true" className="flex items-center space-x-2 min-w-0 pr-2 pointer-events-none">
                        <AppLogo className="h-4 w-4 rounded-xs shrink-0" />
                        <span data-tauri-drag-region="true" className="font-semibold text-[#E0E0E0] text-[11px] truncate">
                            {title}
                        </span>
                    </div>

                    <div className="flex items-center space-x-0.5 shrink-0">
                        {/* Zoom Controls: "-", "%", "+" (6px jarak ke tombol minimize) */}
                        <div className="flex items-center space-x-0.5 mr-[6px]">
                            <button
                                type="button"
                                onClick={handleZoomOut}
                                className="h-5 w-5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Perkecil Ukuran Tampilan UI (-)"
                            >
                                <Minus className="h-2.5 w-2.5" />
                            </button>
                            <button
                                type="button"
                                onClick={handleResetZoom}
                                className="h-5 px-1.5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                                title="Reset Ukuran UI ke 100%"
                            >
                                {zoomLevel}%
                            </button>
                            <button
                                type="button"
                                onClick={handleZoomIn}
                                className="h-5 w-5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Perbesar Ukuran Tampilan UI (+)"
                            >
                                <Plus className="h-2.5 w-2.5" />
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleMinimize}
                            className="h-5 w-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Minimize"
                        >
                            <Minus className="h-3 w-3" />
                        </button>
                        <button
                            type="button"
                            onClick={handleToggleMaximize}
                            className="h-5 w-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title={isFullscreen ? 'Restore' : 'Maximize'}
                        >
                            {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="h-5 w-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 transition-colors cursor-pointer"
                            title="Tutup Jendela"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Default Light Clean Title Bar (Matching #F6F7F8 / #FFFFFF & Ink Black #011627)
    return (
        <div
            data-tauri-drag-region="true"
            onMouseDown={handleStartDragging}
            className="hidden sm:block w-full shrink-0 select-none font-sans text-xs bg-[#F6F7F8] border-b border-[#E2E8F0] cursor-default relative z-[999999]"
        >
            <div data-tauri-drag-region="true" className="h-7 px-3 flex items-center justify-between text-[#011627] bg-[#FFFFFF]">
                <div data-tauri-drag-region="true" className="flex items-center space-x-2 min-w-0 pr-2 pointer-events-none">
                    <AppLogo className="h-4 w-4 rounded-xs shrink-0" />
                    <span data-tauri-drag-region="true" className="font-bold text-[#011627] text-[11px] truncate">
                        {title}
                    </span>
                </div>

                <div className="flex items-center space-x-0.5 shrink-0">
                    {/* Zoom Controls: "-", "%", "+" (6px jarak ke tombol minimize) */}
                    <div className="flex items-center space-x-0.5 mr-[6px]">
                        <button
                            type="button"
                            onClick={handleZoomOut}
                            className="h-5 w-5 rounded flex items-center justify-center text-slate-500 hover:text-[#011627] hover:bg-slate-100 transition-colors cursor-pointer font-bold"
                            title="Perkecil Ukuran Tampilan UI (-)"
                        >
                            <Minus className="h-2.5 w-2.5" />
                        </button>
                        <button
                            type="button"
                            onClick={handleResetZoom}
                            className="h-5 px-1.5 rounded flex items-center justify-center text-slate-600 hover:text-[#011627] hover:bg-slate-100 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                            title="Reset Ukuran UI ke 100%"
                        >
                            {zoomLevel}%
                        </button>
                        <button
                            type="button"
                            onClick={handleZoomIn}
                            className="h-5 w-5 rounded flex items-center justify-center text-slate-500 hover:text-[#011627] hover:bg-slate-100 transition-colors cursor-pointer font-bold"
                            title="Perbesar Ukuran Tampilan UI (+)"
                        >
                            <Plus className="h-2.5 w-2.5" />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleMinimize}
                        className="h-5 w-6 rounded flex items-center justify-center text-slate-500 hover:text-[#011627] hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Minimize"
                    >
                        <Minus className="h-3 w-3" />
                    </button>
                    <button
                        type="button"
                        onClick={handleToggleMaximize}
                        className="h-5 w-6 rounded flex items-center justify-center text-slate-500 hover:text-[#011627] hover:bg-slate-100 transition-colors cursor-pointer"
                        title={isFullscreen ? 'Restore' : 'Maximize'}
                    >
                        {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                    </button>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="h-5 w-6 rounded flex items-center justify-center text-slate-500 hover:text-white hover:bg-rose-500 transition-colors cursor-pointer"
                        title="Tutup Jendela"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </div>
    );
};
