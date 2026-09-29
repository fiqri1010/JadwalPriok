import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ClipboardPaste,
  Sparkles,
  CheckSquare,
  Trash2,
  RotateCcw,
  X,
} from 'lucide-react';
import { AppTheme } from '../types';

export interface PasteContextMenuPosition {
  x: number;
  y: number;
  tabType: 'excel_grid' | 'schedule' | 'absen';
}

interface PasteContextMenuProps {
  isOpen: boolean;
  position: PasteContextMenuPosition | null;
  onClose: () => void;
  theme: AppTheme;
  onPasteClipboard: () => void;
  onLoadSample: () => void;
  onSelectAll?: () => void;
  onClear: () => void;
  onResetColorMap?: () => void;
}

export const PasteContextMenu: React.FC<PasteContextMenuProps> = ({
  isOpen,
  position,
  onClose,
  theme,
  onPasteClipboard,
  onLoadSample,
  onSelectAll,
  onClear,
  onResetColorMap,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const isWinamp = theme === 'winamp';
  const isDark = theme === 'dark';
  const isVista = theme === 'vista';
  const isPaperSketch = theme === 'paperSketch';
  const isIndustrial = theme === 'industrial';
  const isTechnical = theme === 'technical';
  const isEditorial = theme === 'editorial';
  const isDashboard = theme === 'dashboard';

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', onClose);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', onClose);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !position) return null;

  const menuWidth = 230;
  const menuHeight = position.tabType === 'excel_grid' ? 220 : 200;
  const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const winHeight = typeof window !== 'undefined' ? window.innerHeight : 768;

  const left = Math.min(Math.max(8, position.x), Math.max(8, winWidth - menuWidth - 12));
  const top = Math.min(Math.max(8, position.y), Math.max(8, winHeight - menuHeight - 12));

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
          backgroundColor: 'rgba(235, 246, 255, 0.96)',
          backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(224, 242, 254, 0.92) 100%)',
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
    if (isIndustrial) {
      return {
        cardStyle: {
          backgroundColor: '#1A1D23',
          borderRadius: '6px',
          border: '1px solid rgba(226, 232, 240, 0.15)',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.8)',
          fontFamily: "'JetBrains Mono', monospace",
        },
        separatorStyle: {
          borderTop: '1px solid rgba(226, 232, 240, 0.1)',
        },
        itemClass: 'text-[#E2E8F0] hover:bg-white/10 hover:text-[#2DD4BF]',
        deleteItemClass: 'text-[#BE1A1A] hover:bg-[#BE1A1A] hover:text-white',
        iconColor: '#2DD4BF',
        shortcutColor: 'text-[#E2E8F0]/60',
      };
    }
    if (isDark) {
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
        itemClass: 'text-[#cacfd6] hover:bg-[#5353ff] hover:text-white',
        deleteItemClass: 'text-rose-400 hover:bg-[#8e2a2a] hover:text-white',
        iconColor: '#7e8590',
        shortcutColor: 'opacity-60 text-slate-400',
      };
    }
    // Default light
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

  const tabTitle =
    position.tabType === 'excel_grid'
      ? 'Shift by Excel'
      : position.tabType === 'schedule'
      ? 'Shift by Text'
      : 'Data Presensi';

  const menuContent = (
    <div className="fixed inset-0 z-[999999] pointer-events-auto select-none">
      {/* Invisible Fullscreen Backdrop to close menu on click outside */}
      <div
        className="fixed inset-0 bg-transparent cursor-default"
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />

      {/* Menu Container */}
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          left: `${left}px`,
          top: `${top}px`,
          width: `${menuWidth}px`,
          zIndex: 1000000,
          padding: '8px 0px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          ...themeStyle.cardStyle,
        }}
        className="select-none overflow-hidden text-xs shadow-2xl transition-all duration-150 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* Header Title */}
        <div className="px-3 pb-1.5 mb-0.5 flex items-center justify-between text-[10px] font-bold opacity-75 border-b border-current/10">
          <span className="tracking-wider uppercase">Menu {tabTitle}</span>
          <button
            type="button"
            onClick={onClose}
            className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        <ul className="list-none flex flex-col gap-0.5 px-2 m-0 p-0">
          {/* 1. Tempel dari Clipboard (Ctrl+V) */}
          <li
            onClick={() => {
              onPasteClipboard();
              onClose();
            }}
            className={`group flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-[6px] cursor-pointer transition-all duration-200 ease-out hover:translate-x-[1px] hover:-translate-y-[1px] active:scale-[0.99] ${themeStyle.itemClass}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ClipboardPaste className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <p className="label font-semibold text-xs leading-none truncate m-0">Tempel dari Clipboard</p>
            </div>
            <span className={`text-[10px] font-mono shrink-0 ${themeStyle.shortcutColor}`}>Ctrl+V</span>
          </li>

          {/* 2. Muat Contoh Data */}
          <li
            onClick={() => {
              onLoadSample();
              onClose();
            }}
            className={`group flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-[6px] cursor-pointer transition-all duration-200 ease-out hover:translate-x-[1px] hover:-translate-y-[1px] active:scale-[0.99] ${themeStyle.itemClass}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="label font-semibold text-xs leading-none truncate m-0">Muat Format Contoh</p>
            </div>
          </li>

          {/* 3. Pilih Semua Teks (Hanya untuk Teks / Presensi) */}
          {position.tabType !== 'excel_grid' && onSelectAll && (
            <li
              onClick={() => {
                onSelectAll();
                onClose();
              }}
              className={`group flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-[6px] cursor-pointer transition-all duration-200 ease-out hover:translate-x-[1px] hover:-translate-y-[1px] active:scale-[0.99] ${themeStyle.itemClass}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <CheckSquare className="w-4 h-4 shrink-0 transition-colors duration-200" />
                <p className="label font-semibold text-xs leading-none truncate m-0">Pilih Semua Teks</p>
              </div>
              <span className={`text-[10px] font-mono shrink-0 ${themeStyle.shortcutColor}`}>Ctrl+A</span>
            </li>
          )}

          {/* 4. Reset Pemetaan Warna (Khusus Excel Grid) */}
          {position.tabType === 'excel_grid' && onResetColorMap && (
            <li
              onClick={() => {
                onResetColorMap();
                onClose();
              }}
              className={`group flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-[6px] cursor-pointer transition-all duration-200 ease-out hover:translate-x-[1px] hover:-translate-y-[1px] active:scale-[0.99] ${themeStyle.itemClass}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <RotateCcw className="w-4 h-4 text-indigo-500 shrink-0" />
                <p className="label font-semibold text-xs leading-none truncate m-0">Reset Aturan Warna</p>
              </div>
            </li>
          )}
        </ul>

        {/* Separator */}
        <div className="separator w-full my-0.5" style={themeStyle.separatorStyle} />

        {/* Clear Area */}
        <ul className="list-none flex flex-col gap-0.5 px-2 m-0 p-0">
          <li
            onClick={() => {
              onClear();
              onClose();
            }}
            className={`group delete flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-[6px] cursor-pointer transition-all duration-200 ease-out hover:translate-x-[1px] hover:-translate-y-[1px] active:scale-[0.99] ${themeStyle.deleteItemClass}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Trash2 className="w-4 h-4 shrink-0 transition-colors duration-200" />
              <p className="label font-semibold text-xs leading-none truncate m-0">
                {position.tabType === 'excel_grid' ? 'Bersihkan Spreadsheet' : 'Bersihkan Teks'}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(menuContent, document.body) : menuContent;
};
