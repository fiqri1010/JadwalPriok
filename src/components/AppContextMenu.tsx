import React, { useEffect, useRef } from 'react';
import {
    CheckSquare,
    Copy,
    ClipboardPaste,
    Undo2,
    Redo2,
    RotateCcw,
    X,
} from 'lucide-react';
import { AppTheme } from '../types';

export interface ContextMenuPosition {
    x: number;
    y: number;
}

export interface AppContextMenuProps {
    isOpen: boolean;
    position: ContextMenuPosition;
    onClose: () => void;
    theme: AppTheme;
    hasSelection: boolean;
    selectedCount: number;
    canUndo: boolean;
    canRedo: boolean;
    onSelectAll: () => void;
    onCopy: () => void;
    onPaste: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onReset: () => void;
}

export const AppContextMenu: React.FC<AppContextMenuProps> = ({
    isOpen,
    position,
    onClose,
    theme,
    hasSelection,
    selectedCount,
    canUndo,
    canRedo,
    onSelectAll,
    onCopy,
    onPaste,
    onUndo,
    onRedo,
    onReset,
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    const isWinamp = theme === 'winamp';
    const isDarkFluid = theme === 'darkFluid';
    const isDark = theme === 'dark';
    const isVista = theme === 'vista';
    const isPaperSketch = theme === 'paperSketch';

    // Close on outside click or Escape
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Viewport clamping to prevent layout overflow or bleeding
    const menuWidth = isPaperSketch ? 250 : 235;
    const menuHeight = hasSelection ? 305 : 265;
    const padding = 10;

    let left = position.x;
    let top = position.y;

    if (typeof window !== 'undefined') {
        if (left + menuWidth > window.innerWidth - padding) {
            left = window.innerWidth - menuWidth - padding;
        }
        if (left < padding) left = padding;

        if (top + menuHeight > window.innerHeight - padding) {
            top = window.innerHeight - menuHeight - padding;
        }
        if (top < padding) top = padding;
    }

    // Theme container styles
    const getContainerStyles = () => {
        if (isPaperSketch) {
            return 'bg-white text-[#2b2b2b] border-[2.5px] border-[#2b2b2b] shadow-[5px_5px_0px_#2b2b2b] rounded-xl font-[\'Gaegu\'] text-base';
        }
        if (isWinamp) {
            return 'bg-black text-[#00FF00] border-2 border-[#00FF00] font-mono shadow-[0_0_15px_rgba(0,255,0,0.4)] rounded-none';
        }
        if (isDarkFluid) {
            return 'bg-[#1D1B20]/95 backdrop-blur-xl text-[#E6E0E9] border border-white/10 shadow-2xl rounded-2xl';
        }
        if (isDark) {
            return 'bg-[#1E1E1E]/95 backdrop-blur-xl text-slate-100 border border-slate-700 shadow-2xl rounded-2xl';
        }
        if (isVista) {
            return 'bg-white/85 backdrop-blur-2xl text-slate-900 border border-white/90 shadow-[0_20px_50px_rgba(14,116,224,0.25)] ring-1 ring-sky-300/30 rounded-2xl';
        }
        return 'bg-white/95 backdrop-blur-md text-[#011627] border border-slate-200/90 shadow-2xl rounded-xl';
    };

    const getItemStyles = (disabled: boolean = false) => {
        if (disabled) {
            return 'opacity-40 cursor-not-allowed pointer-events-none';
        }
        if (isPaperSketch) {
            return 'hover:bg-[#2ec4b6]/25 hover:text-[#2b2b2b] active:bg-[#ff4747] active:text-white rounded-lg transition-colors cursor-pointer';
        }
        if (isWinamp) {
            return 'hover:bg-[#00FF00] hover:text-black active:brightness-90 rounded-none transition-colors cursor-pointer';
        }
        if (isDarkFluid) {
            return 'hover:bg-white/10 active:bg-[#D0BCFF]/20 text-[#E6E0E9] hover:text-[#D0BCFF] rounded-xl transition-all cursor-pointer';
        }
        if (isDark) {
            return 'hover:bg-white/10 active:bg-indigo-500/20 text-slate-100 hover:text-white rounded-xl transition-all cursor-pointer';
        }
        if (isVista) {
            return 'hover:bg-sky-100/90 hover:text-sky-950 active:bg-sky-200 rounded-xl transition-all cursor-pointer';
        }
        return 'hover:bg-teal-50 hover:text-[#0D7C7B] active:bg-teal-100/80 rounded-lg transition-colors cursor-pointer';
    };

    const getDividerClass = () => {
        if (isPaperSketch) return 'border-b-2 border-dashed border-[#2b2b2b] my-1';
        if (isWinamp) return 'border-b border-[#00FF00]/40 my-1';
        if (isDarkFluid || isDark) return 'border-b border-white/10 my-1';
        if (isVista) return 'border-b border-sky-200/60 my-1';
        return 'border-b border-slate-100 dark:border-slate-800 my-1';
    };

    return (
        <div
            ref={menuRef}
            style={{
                position: 'fixed',
                top: `${top}px`,
                left: `${left}px`,
                width: `${menuWidth}px`,
                zIndex: 100050,
            }}
            className={`p-1.5 select-none animate-in fade-in zoom-in-95 duration-150 ${getContainerStyles()}`}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Header info */}
            <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider opacity-60">
                <span>Menu Shift & Presensi</span>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-0.5 rounded hover:opacity-100 transition-opacity cursor-pointer"
                    title="Tutup"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>

            <div className={getDividerClass()} />

            {/* 1. Select All */}
            <button
                type="button"
                onClick={() => {
                    onSelectAll();
                    onClose();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold ${getItemStyles()}`}
            >
                <div className="flex items-center space-x-2">
                    <CheckSquare className="w-3.5 h-3.5 shrink-0 text-teal-600 dark:text-teal-400" />
                    <span>Select All</span>
                </div>
                <span className="text-[10px] opacity-60 font-mono">Ctrl+A</span>
            </button>

            {/* 2. Copy (Muncul jika ada data terselect) */}
            {hasSelection && (
                <button
                    type="button"
                    onClick={() => {
                        onCopy();
                        onClose();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold animate-in fade-in duration-150 ${getItemStyles()}`}
                >
                    <div className="flex items-center space-x-2">
                        <Copy className="w-3.5 h-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
                        <span>Copy ({selectedCount})</span>
                    </div>
                    <span className="text-[10px] opacity-60 font-mono">Ctrl+C</span>
                </button>
            )}

            {/* 3. Paste */}
            <button
                type="button"
                onClick={() => {
                    onPaste();
                    onClose();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold ${getItemStyles()}`}
            >
                <div className="flex items-center space-x-2">
                    <ClipboardPaste className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <span>Paste</span>
                </div>
                <span className="text-[10px] opacity-60 font-mono">Ctrl+V</span>
            </button>

            <div className={getDividerClass()} />

            {/* 4. Undo */}
            <button
                type="button"
                disabled={!canUndo}
                onClick={() => {
                    onUndo();
                    onClose();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold ${getItemStyles(!canUndo)}`}
            >
                <div className="flex items-center space-x-2">
                    <Undo2 className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>Undo</span>
                </div>
                <span className="text-[10px] opacity-60 font-mono">Ctrl+Z</span>
            </button>

            {/* 5. Redo */}
            <button
                type="button"
                disabled={!canRedo}
                onClick={() => {
                    onRedo();
                    onClose();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold ${getItemStyles(!canRedo)}`}
            >
                <div className="flex items-center space-x-2">
                    <Redo2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>Redo</span>
                </div>
                <span className="text-[10px] opacity-60 font-mono">Ctrl+Y</span>
            </button>

            <div className={getDividerClass()} />

            {/* 6. Reset */}
            <button
                type="button"
                onClick={() => {
                    onReset();
                    onClose();
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-bold ${getItemStyles()}`}
            >
                <div className="flex items-center space-x-2">
                    <RotateCcw className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span className="text-rose-600 dark:text-rose-400">Reset</span>
                </div>
                <span className="text-[10px] opacity-60 font-mono">
                    {hasSelection ? 'Hari Terpilih' : 'Bulan Ini'}
                </span>
            </button>
        </div>
    );
};
