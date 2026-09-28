import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckSquare,
  Copy,
  ClipboardPaste,
  Undo2,
  Redo2,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppTheme } from '../types';

export interface ContextMenuPosition {
  x: number;
  y: number;
  targetDay?: number;
}

interface CalendarContextMenuProps {
  isOpen: boolean;
  position: ContextMenuPosition | null;
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

export const CalendarContextMenu: React.FC<CalendarContextMenuProps> = ({
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

  // Handle click outside, resize, and Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      // Ignore right click button
      if ('button' in e && e.button === 2) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const timer = setTimeout(() => {
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      window.addEventListener('resize', onClose);
    }, 40);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('resize', onClose);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !position) return null;

  // Viewport boundary clamping so menu never overflows screen
  const menuWidth = 210;
  const menuHeight = hasSelection ? 250 : 210;
  const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const winHeight = typeof window !== 'undefined' ? window.innerHeight : 768;

  const left = Math.min(Math.max(8, position.x), Math.max(8, winWidth - menuWidth - 12));
  const top = Math.min(Math.max(8, position.y), Math.max(8, winHeight - menuHeight - 12));

  // Theme-specific Card & Item Stylings conforming to the requested UI/UX design
  const getThemeStyling = () => {
    if (isPaperSketch) {
      return {
        cardStyle: {
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          border: '2.5px solid #2b2b2b',
          boxShadow: '4px 4px 0px #2b2b2b',
          fontFamily: 'inherit',
        },
        separatorStyle: {
          borderTop: '2px dashed #2b2b2b',
        },
        itemClass: 'text-[#2b2b2b] hover:bg-[#2ec4b6] hover:text-[#2b2b2b]',
        deleteItemClass: 'text-[#2b2b2b] hover:bg-[#ff4747] hover:text-white',
        iconColor: '#2b2b2b',
        shortcutColor: 'opacity-60',
      };
    }
    if (isWinamp) {
      return {
        cardStyle: {
          backgroundColor: '#141414',
          borderRadius: '0px',
          border: '1.5px solid #00FF00',
          boxShadow: 'inset 1px 1px 0 #2a2a2a, 3px 3px 0 #000000',
          fontFamily: 'monospace',
        },
        separatorStyle: {
          borderTop: '1.5px solid #333333',
        },
        itemClass: 'text-[#00FF00] hover:bg-[#00FF00] hover:text-black',
        deleteItemClass: 'text-rose-500 hover:bg-rose-600 hover:text-white',
        iconColor: '#00FF00',
        shortcutColor: 'text-[#00FF00]/60',
      };
    }
    if (isVista) {
      return {
        cardStyle: {
          backgroundColor: 'rgba(235, 246, 255, 0.94)',
          backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(224, 242, 254, 0.90) 100%)',
          borderRadius: '10px',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 20px 40px -10px rgba(14, 116, 224, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px) saturate(190%)',
          WebkitBackdropFilter: 'blur(20px) saturate(190%)',
        },
        separatorStyle: {
          borderTop: '1.5px solid rgba(186, 230, 253, 0.85)',
        },
        itemClass: 'text-[#334155] hover:bg-[#2563eb] hover:text-white',
        deleteItemClass: 'text-rose-700 hover:bg-[#dc2626] hover:text-white',
        iconColor: '#64748B',
        shortcutColor: 'opacity-60',
      };
    }
    if (isDark || isDarkFluid) {
      return {
        cardStyle: {
          backgroundColor: 'rgba(36, 40, 50, 1)',
          backgroundImage: 'linear-gradient(139deg, rgba(36, 40, 50, 1) 0%, rgba(36, 40, 50, 1) 40%, rgba(37, 28, 40, 1) 100%)',
          borderRadius: '10px',
          border: '1px solid #42434a',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        },
        separatorStyle: {
          borderTop: '1.5px solid #42434a',
        },
        itemClass: 'text-[#7e8590] hover:bg-[#5353ff] hover:text-white',
        deleteItemClass: 'text-[#7e8590] hover:bg-[#8e2a2a] hover:text-white',
        iconColor: '#7e8590',
        shortcutColor: 'opacity-60 text-slate-400',
      };
    }
    // Default light theme
    return {
      cardStyle: {
        backgroundColor: '#ffffff',
        backgroundImage: 'linear-gradient(139deg, #ffffff 0%, #ffffff 40%, #f8fafc 100%)',
        borderRadius: '10px',
        border: '1.5px solid #cbd5e1',
        boxShadow: '0 20px 35px -8px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 23, 42, 0.06)',
      },
      separatorStyle: {
        borderTop: '1.5px solid #e2e8f0',
      },
      itemClass: 'text-[#475569] hover:bg-[#0e7c7b] hover:text-white',
      deleteItemClass: 'text-rose-600 hover:bg-[#e11d48] hover:text-white',
      iconColor: '#64748b',
      shortcutColor: 'opacity-60',
    };
  };

  const themeStyle = getThemeStyling();

  const menuContent = (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.92, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -4 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          left: `${left}px`,
          top: `${top}px`,
          width: `${menuWidth}px`,
          zIndex: 999999,
          padding: '10px 0px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          ...themeStyle.cardStyle,
        }}
        className="select-none overflow-hidden text-xs"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Info Header */}
        <div className="px-3 pb-1 mb-0.5 flex items-center justify-between text-[10px] font-bold opacity-75 border-b border-current/10">
          <span className="tracking-wider uppercase">Menu Kalender</span>
          {selectedCount > 0 ? (
            <span className="font-mono text-[9.5px] px-1 py-0.2 rounded bg-teal-500/15 text-teal-600 dark:text-teal-300 font-bold">
              {selectedCount} hari
            </span>
          ) : position.targetDay ? (
            <span className="font-mono text-[9.5px]">Tgl {position.targetDay}</span>
          ) : null}
        </div>

        {/* Group 1: Select All & Copy & Paste */}
        <ul className="list-none flex flex-col gap-1 px-2 m-0 p-0">
          {/* 1. Select All */}
          <li
            onClick={() => {
              onSelectAll();
              onClose();
            }}
            className={`group flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-[6px] cursor-pointer transition-all duration-250 ease-out hover:translate-x-[1px] hover:-translate-y-[1px] active:scale-[0.99] ${themeStyle.itemClass}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckSquare className="w-[18px] h-[18px] shrink-0 transition-colors duration-250" />
              <p className="label font-semibold text-xs leading-none truncate m-0">Select All</p>
            </div>
            <span className={`text-[10px] font-mono shrink-0 ${themeStyle.shortcutColor}`}>Ctrl+A</span>
          </li>

          {/* 2. Copy (Muncul jika ada data yang terselect) */}
          {hasSelection && (
            <li
              onClick={() => {
                onCopy();
                onClose();
              }}
              className={`group flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-[6px] cursor-pointer transition-all duration-250 ease-out hover:translate-x-[1px] hover:-translate-y-[1px] active:scale-[0.99] ${themeStyle.itemClass}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Copy className="w-[18px] h-[18px] shrink-0 transition-colors duration-250" />
                <p className="label font-semibold text-xs leading-none truncate m-0">
                  Copy ({selectedCount > 0 ? selectedCount : 1})
                </p>
              </div>
              <span className={`text-[10px] font-mono shrink-0 ${themeStyle.shortcutColor}`}>Ctrl+C</span>
            </li>
          )}

          {/* 3. Paste */}
          <li
            onClick={() => {
              onPaste();
              onClose();
            }}
            className={`group flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-[6px] cursor-pointer transition-all duration-250 ease-out hover:translate-x-[1px] hover:-translate-y-[1px] active:scale-[0.99] ${themeStyle.itemClass}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ClipboardPaste className="w-[18px] h-[18px] shrink-0 transition-colors duration-250" />
              <p className="label font-semibold text-xs leading-none truncate m-0">Paste</p>
            </div>
            <span className={`text-[10px] font-mono shrink-0 ${themeStyle.shortcutColor}`}>Ctrl+V</span>
          </li>
        </ul>

        {/* Separator */}
        <div className="separator w-full my-0.5" style={themeStyle.separatorStyle} />

        {/* Group 2: Undo & Redo */}
        <ul className="list-none flex flex-col gap-1 px-2 m-0 p-0">
          {/* 4. Undo */}
          <li
            onClick={() => {
              if (canUndo) {
                onUndo();
                onClose();
              }
            }}
            className={`group flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-[6px] transition-all duration-250 ease-out ${
              !canUndo
                ? 'opacity-35 cursor-not-allowed pointer-events-none'
                : `cursor-pointer hover:translate-x-[1px] hover:-translate-y-[1px] active:scale-[0.99] ${themeStyle.itemClass}`
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Undo2 className="w-[18px] h-[18px] shrink-0 transition-colors duration-250" />
              <p className="label font-semibold text-xs leading-none truncate m-0">Undo</p>
            </div>
            <span className={`text-[10px] font-mono shrink-0 ${themeStyle.shortcutColor}`}>Ctrl+Z</span>
          </li>

          {/* 5. Redo */}
          <li
            onClick={() => {
              if (canRedo) {
                onRedo();
                onClose();
              }
            }}
            className={`group flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-[6px] transition-all duration-250 ease-out ${
              !canRedo
                ? 'opacity-35 cursor-not-allowed pointer-events-none'
                : `cursor-pointer hover:translate-x-[1px] hover:-translate-y-[1px] active:scale-[0.99] ${themeStyle.itemClass}`
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Redo2 className="w-[18px] h-[18px] shrink-0 transition-colors duration-250" />
              <p className="label font-semibold text-xs leading-none truncate m-0">Redo</p>
            </div>
            <span className={`text-[10px] font-mono shrink-0 ${themeStyle.shortcutColor}`}>Ctrl+Y</span>
          </li>
        </ul>

        {/* Separator */}
        <div className="separator w-full my-0.5" style={themeStyle.separatorStyle} />

        {/* Group 3: Reset */}
        <ul className="list-none flex flex-col gap-1 px-2 m-0 p-0">
          <li
            onClick={() => {
              onReset();
              onClose();
            }}
            className={`group delete flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-[6px] cursor-pointer transition-all duration-250 ease-out hover:translate-x-[1px] hover:-translate-y-[1px] active:scale-[0.99] ${themeStyle.deleteItemClass}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <RotateCcw className="w-[18px] h-[18px] shrink-0 transition-colors duration-250" />
              <p className="label font-semibold text-xs leading-none truncate m-0">Reset Jadwal</p>
            </div>
          </li>
        </ul>
      </motion.div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(menuContent, document.body) : menuContent;
};
