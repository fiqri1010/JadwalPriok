import React, { useState, useEffect } from 'react';
import { AppLogo } from './AppLogo';
import { FULL_APP_TITLE } from '../version';
import {
    Minus,
    Square,
    X,
    Copy,
    Sparkles,
    Zap,
    Maximize2,
    Minimize2
} from 'lucide-react';
import {
    startWindowDragging,
    minimizeAppWindow,
    toggleMaximizeAppWindow,
    closeAppWindow
} from '../lib/tauriBridge';

interface WindowTitleBarProps {
    theme: 'default' | 'dark' | 'vista' | 'winamp';
    onClose?: () => void;
    title?: string;
    subtitle?: string;
}

export const WindowTitleBar: React.FC<WindowTitleBarProps> = ({
    theme,
    onClose,
    title = FULL_APP_TITLE,
    subtitle = 'Jadwal Pemeriksa Fisik dan Performance View'
}) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleToggleMaximize = async () => {
        const isMax = await toggleMaximizeAppWindow();
        setIsFullscreen(isMax);
    };

    const handleMinimize = async () => {
        await minimizeAppWindow();
    };

    const handleClose = async () => {
        if (onClose) {
            onClose();
        } else {
            await closeAppWindow();
        }
    };

    const handleMouseDownOnBar = (e: React.MouseEvent) => {
        // Jangan trigger drag jika yang diklik adalah button window control
        if ((e.target as HTMLElement).closest('button')) return;
        // Hanya tombol kiri mouse
        if (e.button === 0) {
            startWindowDragging();
        }
    };

    // 1. WINDOWS VISTA (ALPHA) THEMED TITLE BAR
    if (theme === 'vista') {
        return (
            <div
                data-tauri-drag-region
                onMouseDown={handleMouseDownOnBar}
                onDoubleClick={handleToggleMaximize}
                className="w-full shrink-0 select-none font-sans text-xs shadow-md border-b border-sky-300/30 cursor-default"
            >
                <div
                    data-tauri-drag-region
                    className="h-8 px-3 flex items-center justify-between text-white relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(180deg, rgba(160, 205, 240, 0.85) 0%, rgba(65, 125, 175, 0.9) 45%, rgba(15, 55, 90, 0.95) 50%, rgba(30, 85, 130, 0.95) 100%)',
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 2px 8px rgba(0, 20, 40, 0.4)'
                    }}
                >
                    {/* Glass reflection top highlight */}
                    <div className="absolute top-0 left-0 right-0 h-3.5 bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />

                    {/* Left: Vista Orb Icon + AppLogo + Glowing Title */}
                    <div data-tauri-drag-region className="flex items-center space-x-2 z-10 min-w-0 pr-2">
                        <AppLogo className="h-5 w-5 rounded-md shadow-xs drop-shadow-xs shrink-0" />
                        <span
                            data-tauri-drag-region
                            className="font-bold tracking-wide text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)] truncate"
                            style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif" }}
                        >
                            {title} <span className="text-[10px] font-normal text-sky-200 hidden md:inline">({subtitle})</span>
                        </span>
                    </div>

                    {/* Right: Authentic Windows Vista 3 Window Buttons */}
                    <div className="flex items-center space-x-1 z-10 shrink-0 -mr-1">
                        {/* Minimize */}
                        <button
                            type="button"
                            onClick={handleMinimize}
                            title="Minimize Window"
                            className="h-5 w-7 rounded-sm flex items-center justify-center bg-white/10 hover:bg-white/30 border border-white/30 text-white shadow-2xs transition-all cursor-pointer active:scale-95"
                        >
                            <Minus className="h-3 w-3 drop-shadow-xs" />
                        </button>

                        {/* Maximize / Restore */}
                        <button
                            type="button"
                            onClick={handleToggleMaximize}
                            title={isFullscreen ? 'Restore' : 'Maximize'}
                            className="h-5 w-7 rounded-sm flex items-center justify-center bg-white/10 hover:bg-white/30 border border-white/30 text-white shadow-2xs transition-all cursor-pointer active:scale-95"
                        >
                            {isFullscreen ? (
                                <Copy className="h-2.5 w-2.5 drop-shadow-xs rotate-90" />
                            ) : (
                                <Square className="h-2.5 w-2.5 drop-shadow-xs" />
                            )}
                        </button>

                        {/* Vista Glossy Red Close Button */}
                        <button
                            type="button"
                            onClick={handleClose}
                            title="Close Window (Exit)"
                            className="h-5 w-11 rounded-sm flex items-center justify-center bg-gradient-to-b from-rose-400 via-rose-600 to-rose-800 hover:from-rose-300 hover:via-rose-500 hover:to-rose-700 border border-rose-300/80 text-white shadow-sm transition-all cursor-pointer active:scale-95 hover:shadow-[0_0_8px_rgba(244,63,94,0.9)]"
                        >
                            <X className="h-3.5 w-3.5 stroke-[2.5] drop-shadow-xs" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. WINAMP CLASSIC (ALPHA) THEMED TITLE BAR
    if (theme === 'winamp') {
        return (
            <div
                data-tauri-drag-region
                onMouseDown={handleMouseDownOnBar}
                onDoubleClick={handleToggleMaximize}
                className="w-full shrink-0 select-none font-mono text-[11px] bg-[#1a1e22] border-b-2 border-[#0a0d0f] cursor-default"
            >
                <div
                    data-tauri-drag-region
                    className="h-7 px-2 flex items-center justify-between text-emerald-400 relative"
                    style={{
                        background: 'linear-gradient(180deg, #444f59 0%, #2c343b 50%, #1a1e22 100%)',
                        borderTop: '1px solid #7d90a0',
                        borderLeft: '1px solid #7d90a0',
                        borderRight: '1px solid #080a0c',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}
                >
                    {/* Left: Winamp Lightning Bolt Icon + Retro LCD Text */}
                    <div data-tauri-drag-region className="flex items-center space-x-2 min-w-0 pr-2">
                        <div className="h-4 w-4 bg-[#0a0d0f] border border-[#00ff66]/50 flex items-center justify-center text-amber-400 shrink-0">
                            <Zap className="h-3 w-3 fill-amber-400" />
                        </div>
                        <span
                            data-tauri-drag-region
                            className="font-mono font-bold tracking-widest text-[#00ff66] drop-shadow-[0_0_4px_rgba(0,255,100,0.6)] uppercase truncate"
                        >
                            *** WINAMP - {title} ***
                        </span>
                    </div>

                    {/* Right: Retro Winamp 3D Buttons */}
                    <div className="flex items-center space-x-1 shrink-0">
                        {/* Minimize */}
                        <button
                            type="button"
                            onClick={handleMinimize}
                            title="Minimize Winamp"
                            className="h-4 w-4 bg-[#323b42] hover:bg-[#485560] border-t border-l border-[#6a7d8d] border-b border-r border-[#0a0d0f] text-slate-200 flex items-center justify-center text-[9px] active:translate-y-px cursor-pointer"
                        >
                            _
                        </button>

                        {/* Windowshade / Maximize */}
                        <button
                            type="button"
                            onClick={handleToggleMaximize}
                            title={isFullscreen ? 'Restore Screen' : 'Fullscreen / Shade'}
                            className="h-4 w-4 bg-[#323b42] hover:bg-[#485560] border-t border-l border-[#6a7d8d] border-b border-r border-[#0a0d0f] text-slate-200 flex items-center justify-center text-[9px] active:translate-y-px cursor-pointer"
                        >
                            {isFullscreen ? '▼' : '▲'}
                        </button>

                        {/* Close */}
                        <button
                            type="button"
                            onClick={handleClose}
                            title="Close Winamp (Exit)"
                            className="h-4 w-4 bg-[#323b42] hover:bg-rose-700 border-t border-l border-[#6a7d8d] border-b border-r border-[#0a0d0f] text-rose-300 hover:text-white flex items-center justify-center text-[9px] font-bold active:translate-y-px cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 3. DARK MODE (ALPHA) THEMED TITLE BAR
    if (theme === 'dark') {
        return (
            <div
                data-tauri-drag-region
                onMouseDown={handleMouseDownOnBar}
                onDoubleClick={handleToggleMaximize}
                className="w-full shrink-0 select-none font-sans text-xs bg-[#0b0f19] border-b border-slate-800 cursor-default"
            >
                <div
                    data-tauri-drag-region
                    className="h-7 px-3 flex items-center justify-between text-slate-300 bg-[#111827]/90"
                >
                    <div data-tauri-drag-region className="flex items-center space-x-2 min-w-0 pr-2">
                        <AppLogo className="h-4 w-4 rounded-xs shrink-0" />
                        <span data-tauri-drag-region className="font-semibold text-slate-200 text-[11px] truncate">
                            {title}
                        </span>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                        <button
                            type="button"
                            onClick={handleMinimize}
                            className="h-5 w-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Minimize"
                        >
                            <Minus className="h-3 w-3" />
                        </button>
                        <button
                            type="button"
                            onClick={handleToggleMaximize}
                            className="h-5 w-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title={isFullscreen ? 'Restore' : 'Maximize'}
                        >
                            {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="h-5 w-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-600 transition-colors cursor-pointer"
                            title="Close (Exit)"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 4. STANDAR (BRAND BARU) THEMED TITLE BAR: #011627 with #2EC4B6 accent
    return (
        <div
            data-tauri-drag-region
            onMouseDown={handleMouseDownOnBar}
            onDoubleClick={handleToggleMaximize}
            className="w-full shrink-0 select-none font-sans text-xs bg-[#011627] border-b border-[#0d2a45] cursor-default"
        >
            <div
                data-tauri-drag-region
                className="h-7 px-3 flex items-center justify-between text-[#F6F7F8] bg-[#021f37]"
            >
                <div data-tauri-drag-region className="flex items-center space-x-2 min-w-0 pr-2">
                    <AppLogo className="h-4 w-4 rounded-xs shrink-0" />
                    <span data-tauri-drag-region className="font-semibold text-[#F6F7F8] text-[11px] truncate">
                        {title}
                    </span>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                    <button
                        type="button"
                        onClick={handleMinimize}
                        className="h-5 w-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="Minimize"
                    >
                        <Minus className="h-3 w-3" />
                    </button>
                    <button
                        type="button"
                        onClick={handleToggleMaximize}
                        className="h-5 w-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title={isFullscreen ? 'Restore' : 'Maximize'}
                    >
                        {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                    </button>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="h-5 w-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#FF3366] transition-colors cursor-pointer"
                        title="Close (Exit)"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
