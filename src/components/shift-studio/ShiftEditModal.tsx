import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Palette, Tag, Clock, Briefcase, Smile, Undo2, Redo2, RotateCcw, Check, Settings } from 'lucide-react';
import { ShiftItemConfig, AppTheme } from '../../types';
import { getCurrentUserPermissions } from '../../utils/adminStorage';
import { ShiftColorStudio } from './ShiftColorStudio';
import { ShiftPatternStudio } from './ShiftPatternStudio';
import { ShiftNamingInput } from './ShiftNamingInput';
import { ShiftWorkTimeConfigComponent } from './ShiftWorkTimeConfig';
import { ShiftLiveBadgePreview } from './ShiftLiveBadgePreview';
import { ShiftPiketTagConfig } from './ShiftPiketTagConfig';
import { ShiftIconPickerModal, ICON_CATALOG } from './ShiftIconPickerModal';

interface ShiftEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    shift: ShiftItemConfig | null;
    existingShifts: ShiftItemConfig[];
    onSaveShift: (updatedShift: ShiftItemConfig) => void;
    theme?: AppTheme;
}

export type EditTabType = 'latar' | 'icon_nama' | 'ruleset';

export const ShiftEditModal: React.FC<ShiftEditModalProps> = ({
    isOpen,
    onClose,
    shift,
    existingShifts,
    onSaveShift,
    theme = 'default',
}) => {
    const [draftShift, setDraftShift] = useState<ShiftItemConfig | null>(null);
    const [initialShift, setInitialShift] = useState<ShiftItemConfig | null>(null);
    const [history, setHistory] = useState<ShiftItemConfig[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);

    const permissions = getCurrentUserPermissions();
    const canEditAllShifts = permissions.canEditAllShifts !== false;

    const [activeTab, setActiveTab] = useState<EditTabType>(() => 'latar');
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [isApplied, setIsApplied] = useState(false);

    useEffect(() => {
        if (!canEditAllShifts && activeTab === 'ruleset') {
            setActiveTab('latar');
        }
    }, [canEditAllShifts, activeTab]);

    useEffect(() => {
        if (shift && isOpen) {
            const cloned = JSON.parse(JSON.stringify(shift));
            setInitialShift(cloned);
            setDraftShift(cloned);
            setHistory([cloned]);
            setHistoryIndex(0);
        } else {
            setDraftShift(null);
            setInitialShift(null);
            setHistory([]);
            setHistoryIndex(-1);
        }
    }, [shift, isOpen]);

    if (!isOpen || !draftShift) return null;

    // Record state mutation to history stack
    const updateDraftShift = (newConfig: ShiftItemConfig) => {
        const sliced = history.slice(0, historyIndex + 1);
        const updatedHistory = [...sliced, newConfig];
        setHistory(updatedHistory);
        setHistoryIndex(updatedHistory.length - 1);
        setDraftShift(newConfig);
    };

    // Undo action
    const handleUndo = () => {
        if (historyIndex > 0) {
            const prevIdx = historyIndex - 1;
            setHistoryIndex(prevIdx);
            setDraftShift(history[prevIdx]);
        }
    };

    // Redo action
    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const nextIdx = historyIndex + 1;
            setHistoryIndex(nextIdx);
            setDraftShift(history[nextIdx]);
        }
    };

    // Reset action (revert back to original state before editing started)
    const handleReset = () => {
        if (initialShift) {
            const resetCloned = JSON.parse(JSON.stringify(initialShift));
            updateDraftShift(resetCloned);
        }
    };

    const handleSave = () => {
        onSaveShift(draftShift);
        onClose();
    };

    const handleApply = () => {
        if (!draftShift) return;
        onSaveShift(draftShift);
        setInitialShift(JSON.parse(JSON.stringify(draftShift)));
        setIsApplied(true);
        setTimeout(() => setIsApplied(false), 1500);
    };

    const isModifiedFromInitial = Boolean(
        initialShift && JSON.stringify(draftShift) !== JSON.stringify(initialShift)
    );

    const isIndustrial = theme === 'industrial';
    const isPaperSketch = theme === 'paperSketch';
    const isDashboard = theme === 'dashboard';

    return createPortal(
        <div className="fixed inset-0 sm:top-7 z-[10000] overflow-y-auto p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 flex justify-center items-start sm:items-center">
            <div className="fixed inset-0 sm:top-7" onClick={onClose} />
            <div className={`relative z-10 w-full max-w-5xl my-auto h-[90vh] md:h-[85vh] md:max-h-[660px] md:min-h-[580px] flex flex-col overflow-hidden shadow-2xl ${
                isIndustrial
                    ? 'bg-[#1A1D23] text-[#E2E8F0] border border-[rgba(226,232,240,0.15)] rounded-lg font-[\'JetBrains_Mono\']'
                    : isPaperSketch
                    ? 'bg-[#fdfcf0] text-[#2b2b2b] border-2 border-[#2b2b2b] shadow-[6px_6px_0px_#2b2b2b] rounded-2xl font-[\'Gaegu\'] text-base'
                    : isDashboard
                    ? 'bg-[#FFFBF0] text-[#4D2A00] border border-[#4D2A00]/30 rounded-2xl font-["Inter"] shadow-2xl'
                    : 'rounded-2xl bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700'
            }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-3.5 border-b shrink-0 ${
                    isIndustrial
                        ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.12)]'
                        : isPaperSketch
                        ? 'bg-[#f2efeb] border-[#2b2b2b] border-b-2'
                        : isDashboard
                        ? 'bg-[#FFF0BE] border-[#4D2A00]/25'
                        : 'bg-white dark:bg-[#1E1E1E] border-slate-200/80 dark:border-zinc-800'
                }`}>
                    <div className="flex items-center space-x-2.5">
                        <div className={`p-1.5 rounded-lg font-bold text-xs shrink-0 font-mono uppercase ${
                            isIndustrial
                                ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40'
                                : isPaperSketch
                                ? 'bg-[#ff4747] text-white border-2 border-[#2b2b2b]'
                                : 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                        }`}>
                            {(draftShift.naming.displayBadge || 'SHIFT').toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="text-xs sm:text-sm font-bold">
                                    {draftShift.isSystemDefault ? 'Konfigurasi Shift' : 'Edit Aturan Shift'}
                                </h3>
                                <span className={`font-mono text-[9.5px] px-1.5 py-0.2 rounded font-semibold border ${
                                    isIndustrial
                                        ? 'bg-[#0F1115] text-[#2DD4BF] border-[rgba(226,232,240,0.15)]'
                                        : isPaperSketch
                                        ? 'bg-[#fdfcf0] text-[#2b2b2b] border-2 border-[#2b2b2b]'
                                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                                }`}>
                                    ID: {draftShift.id}
                                </span>
                            </div>
                            <p className="text-[10.5px] opacity-60 truncate max-w-[240px]">
                                {draftShift.naming.fullName || 'Shift Baru'}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer text-current/70 hover:text-current transition-colors"
                        title="Tutup Modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Side-by-Side Flex Layout Body */}
                <div className={`flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden min-h-0 ${
                    isIndustrial
                        ? 'bg-[#0F1115]'
                        : isPaperSketch
                        ? 'bg-[#fdfcf0]'
                        : isDashboard
                        ? 'bg-[#FFF9E6]'
                        : 'bg-slate-50/20 dark:bg-zinc-900/10'
                }`}>
                    
                    {/* Left Sidebar: Preview badge, Vertical Tabs menu, and Undo/Redo/Reset at the bottom */}
                    <div className={`w-full md:w-[200px] lg:w-[215px] shrink-0 border-b md:border-b-0 md:border-r flex flex-col justify-between p-3 py-3.5 gap-3 overflow-visible md:overflow-hidden ${
                        isIndustrial
                            ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.12)]'
                            : isPaperSketch
                            ? 'bg-[#f2efeb] border-[#2b2b2b] md:border-r-2'
                            : isDashboard
                            ? 'bg-[#FFF0BE] border-[#4D2A00]/25'
                            : 'bg-slate-50/60 dark:bg-black/20 border-slate-200/80 dark:border-zinc-800'
                    }`}>
                        
                        <div className="space-y-4">
                            {/* Kotak Pratinjau Badge - Kompak menyamai lebar tab menu */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-black opacity-60 uppercase tracking-wider block">
                                    Pratinjau Badge (Live)
                                </span>
                                <div className="w-full">
                                    <ShiftLiveBadgePreview
                                        visual={draftShift.visual}
                                        naming={draftShift.naming}
                                        isPiket={draftShift.isPiket}
                                        theme={theme}
                                    />
                                </div>
                            </div>

                            {/* Vertical Tab Menu */}
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-black opacity-60 uppercase tracking-wider block">
                                    Sub Menu Konfigurasi
                                </span>
                                <ul className="w-full flex flex-row md:flex-col gap-1.5 md:gap-2 overflow-x-auto md:overflow-visible no-scrollbar pb-1 md:pb-0">
                                    {/* Tab 1: Latar */}
                                    <li className="flex-1 md:w-full shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('latar')}
                                            className={`w-full text-xs font-bold flex items-center justify-center md:justify-start gap-2.5 px-2.5 md:px-3.5 py-2.5 md:py-3 group rounded-xl transition-all duration-150 select-none cursor-pointer border ${
                                                activeTab === 'latar'
                                                    ? isIndustrial
                                                        ? 'bg-[#1A1D23] text-[#2DD4BF] border-[#2DD4BF]/50 shadow-xs font-extrabold rounded-[4px]'
                                                        : isPaperSketch
                                                        ? 'bg-[#ff4747] text-white border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] font-bold rounded-lg'
                                                        : isDashboard
                                                        ? 'bg-[#4D2A00] text-[#FFFBF0] border-[#4D2A00] shadow-xs font-extrabold'
                                                        : 'bg-white dark:bg-zinc-800 text-teal-600 dark:text-teal-400 border-teal-500/80 dark:border-teal-400 shadow-xs ring-1 ring-teal-500/10 font-extrabold'
                                                    : isIndustrial
                                                    ? 'bg-transparent text-[#E2E8F0]/70 hover:text-[#E2E8F0] hover:bg-white/5 border-transparent'
                                                    : isPaperSketch
                                                    ? 'bg-transparent text-[#2b2b2b] hover:bg-[#2ec4b6]/20 border-2 border-transparent font-bold'
                                                    : isDashboard
                                                    ? 'bg-transparent text-[#4D2A00]/70 hover:bg-[#4D2A00]/10 border-transparent'
                                                    : 'bg-transparent text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/40 hover:text-slate-900 dark:hover:text-slate-100 border-transparent'
                                            }`}
                                        >
                                            <Palette className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                                            <span>Latar</span>
                                        </button>
                                    </li>

                                    {/* Tab 2: Icon & Nama */}
                                    <li className="flex-1 md:w-full shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('icon_nama')}
                                            className={`w-full text-xs font-bold flex items-center justify-center md:justify-start gap-2.5 px-2.5 md:px-3.5 py-2.5 md:py-3 group rounded-xl transition-all duration-150 select-none cursor-pointer border ${
                                                activeTab === 'icon_nama'
                                                    ? isIndustrial
                                                        ? 'bg-[#1A1D23] text-[#2DD4BF] border-[#2DD4BF]/50 shadow-xs font-extrabold rounded-[4px]'
                                                        : isPaperSketch
                                                        ? 'bg-[#ff4747] text-white border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] font-bold rounded-lg'
                                                        : isDashboard
                                                        ? 'bg-[#4D2A00] text-[#FFFBF0] border-[#4D2A00] shadow-xs font-extrabold'
                                                        : 'bg-white dark:bg-zinc-800 text-teal-600 dark:text-teal-400 border-teal-500/80 dark:border-teal-400 shadow-xs ring-1 ring-teal-500/10 font-extrabold'
                                                    : isIndustrial
                                                    ? 'bg-transparent text-[#E2E8F0]/70 hover:text-[#E2E8F0] hover:bg-white/5 border-transparent'
                                                    : isPaperSketch
                                                    ? 'bg-transparent text-[#2b2b2b] hover:bg-[#2ec4b6]/20 border-2 border-transparent font-bold'
                                                    : isDashboard
                                                    ? 'bg-transparent text-[#4D2A00]/70 hover:bg-[#4D2A00]/10 border-transparent'
                                                    : 'bg-transparent text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/40 hover:text-slate-900 dark:hover:text-slate-100 border-transparent'
                                            }`}
                                        >
                                            <Smile className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                                            <span>Ikon & Nama</span>
                                        </button>
                                    </li>

                                    {/* Tab 3: Rule Set */}
                                    {canEditAllShifts && (
                                        <li className="flex-1 md:w-full shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('ruleset')}
                                                className={`w-full text-xs font-bold flex items-center justify-center md:justify-start gap-2.5 px-2.5 md:px-3.5 py-2.5 md:py-3 group rounded-xl transition-all duration-150 select-none cursor-pointer border ${
                                                    activeTab === 'ruleset'
                                                        ? isIndustrial
                                                            ? 'bg-[#1A1D23] text-[#2DD4BF] border-[#2DD4BF]/50 shadow-xs font-extrabold rounded-[4px]'
                                                            : isPaperSketch
                                                            ? 'bg-[#ff4747] text-white border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] font-bold rounded-lg'
                                                            : isDashboard
                                                            ? 'bg-[#4D2A00] text-[#FFFBF0] border-[#4D2A00] shadow-xs font-extrabold'
                                                            : 'bg-white dark:bg-zinc-800 text-teal-600 dark:text-teal-400 border-teal-500/80 dark:border-teal-400 shadow-xs ring-1 ring-teal-500/10 font-extrabold'
                                                        : isIndustrial
                                                        ? 'bg-transparent text-[#E2E8F0]/70 hover:text-[#E2E8F0] hover:bg-white/5 border-transparent'
                                                        : isPaperSketch
                                                        ? 'bg-transparent text-[#2b2b2b] hover:bg-[#2ec4b6]/20 border-2 border-transparent font-bold'
                                                        : isDashboard
                                                        ? 'bg-transparent text-[#4D2A00]/70 hover:bg-[#4D2A00]/10 border-transparent'
                                                        : 'bg-transparent text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/40 hover:text-slate-900 dark:hover:text-slate-100 border-transparent'
                                                }`}
                                            >
                                                <Settings className="w-4 h-4 shrink-0 transition-transform group-hover:rotate-45 duration-300" />
                                                <span>Rule Set</span>
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Undo, Redo, Reset at Bottom Left */}
                        <div className="mt-auto pt-4 border-t border-slate-200/80 dark:border-zinc-800/80 flex flex-col gap-1.5 w-full shrink-0">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                                Riwayat Edit
                            </span>
                            <div className="grid grid-cols-3 gap-1.5">
                                <button
                                    type="button"
                                    onClick={handleUndo}
                                    disabled={historyIndex <= 0}
                                    className="py-1.5 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 border border-slate-200/80 dark:border-zinc-700/60"
                                    title="Undo (Urungkan)"
                                >
                                    <Undo2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                    <span className="text-[8.5px] mt-0.5">Undo</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRedo}
                                    disabled={historyIndex >= history.length - 1}
                                    className="py-1.5 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 border border-slate-200/80 dark:border-zinc-700/60"
                                    title="Redo (Ulangi)"
                                >
                                    <Redo2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                    <span className="text-[8.5px] mt-0.5">Redo</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    disabled={!isModifiedFromInitial}
                                    className="py-1.5 text-[10px] font-bold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 border border-amber-500/20"
                                    title="Reset"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span className="text-[8.5px] mt-0.5">Reset</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Content Area: Active Sub Menu Details and Action Buttons at bottom right */}
                    <div className={`flex-1 flex flex-col min-w-0 ${
                        isIndustrial
                            ? 'bg-[#0F1115] text-[#E2E8F0]'
                            : isPaperSketch
                            ? 'bg-[#fdfcf0] text-[#2b2b2b]'
                            : isDashboard
                            ? 'bg-[#FFF9E6] text-[#4D2A00]'
                            : 'bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-slate-100'
                    }`}>
                        
                        {/* Scrollable Content Container */}
                        <div className="flex-1 overflow-y-visible md:overflow-y-auto p-4 sm:p-5 custom-scrollbar min-h-0 font-sans">
                            
                            {/* Tab 1: Latar (Color Picker & Motif Side-by-Side) */}
                            {activeTab === 'latar' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:items-stretch w-full animate-in fade-in duration-150">
                                    {/* Column 1: Color Picker */}
                                    <div className="min-w-0 lg:h-full flex flex-col">
                                        <ShiftColorStudio
                                            visual={draftShift.visual}
                                            onChange={(visual) => updateDraftShift({ ...draftShift, visual })}
                                            theme={theme}
                                        />
                                    </div>
                                    
                                    {/* Column 2: Motif Pattern Selection */}
                                    <div className="min-w-0 lg:h-full flex flex-col">
                                        <ShiftPatternStudio
                                            visual={draftShift.visual}
                                            onChange={(visual) => updateDraftShift({ ...draftShift, visual })}
                                            theme={theme}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Ikon & Nama (Naming rules & Icon Selection) */}
                            {activeTab === 'icon_nama' && (
                                <div className="space-y-4 w-full animate-in fade-in duration-150 max-w-3xl">
                                    {/* Logo & Ikon Selection Card (Ditempatkan di Atas) */}
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs space-y-3.5">
                                        <div className="flex items-center space-x-2.5 border-b border-slate-200/80 dark:border-zinc-800 pb-2">
                                            <Smile className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                            <div>
                                                <h4 className="text-xs sm:text-sm font-black">Logo & Ikon Shift</h4>
                                                <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 font-medium">Tentukan representasi visual ikon pada kartu kalender</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200/60 dark:border-zinc-800/60 shadow-inner">
                                            <div className="flex items-center space-x-4 min-w-0">
                                                {/* Icon Preview Block */}
                                                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 dark:bg-teal-500/5 border border-teal-500/20 flex items-center justify-center shrink-0 shadow-2xs">
                                                    {(() => {
                                                        const vis = draftShift.visual;
                                                        if (vis.iconType === 'svg' && vis.iconName) {
                                                            const found = ICON_CATALOG.find((it) => it.name === vis.iconName);
                                                            if (found) {
                                                                const IconComp = found.component;
                                                                return <IconComp className="w-6 h-6 text-teal-600 dark:text-teal-400" />;
                                                            }
                                                        }
                                                        if (vis.iconType === 'emoji' && vis.emoji) {
                                                            return <span className="text-2xl leading-none">{vis.emoji}</span>;
                                                        }
                                                        return <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold">None</span>;
                                                    })()}
                                                </div>

                                                <div className="space-y-0.5 min-w-0 text-center sm:text-left">
                                                    <h5 className="text-xs font-extrabold text-slate-700 dark:text-zinc-300">Ikon Aktif</h5>
                                                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold truncate">
                                                        {draftShift.visual.iconType === 'svg' && draftShift.visual.iconName
                                                            ? `Ikon Vektor SVG: ${draftShift.visual.iconName}`
                                                            : draftShift.visual.iconType === 'emoji' && draftShift.visual.emoji
                                                            ? `Koleksi Emoji: ${draftShift.visual.emoji}`
                                                            : 'Tanpa Ikon (Hanya Teks)'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 shrink-0">
                                                {draftShift.visual.iconType !== 'none' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => updateDraftShift({
                                                            ...draftShift,
                                                            visual: {
                                                                ...draftShift.visual,
                                                                iconType: 'none',
                                                                iconName: undefined,
                                                                emoji: undefined,
                                                            }
                                                        })}
                                                        className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-all active:scale-95"
                                                        title="Hapus Ikon"
                                                    >
                                                        Hapus Ikon
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setIsIconPickerOpen(true)}
                                                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                                                >
                                                    <Smile className="w-3.5 h-3.5" />
                                                    <span>Ubah Ikon & Logo</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Aturan Penamaan & Kode (Ditempatkan di Bawah Logo) */}
                                    <div className="min-w-0">
                                        <ShiftNamingInput
                                            naming={draftShift.naming}
                                            onChange={(naming) => updateDraftShift({ ...draftShift, naming })}
                                            currentShiftId={draftShift.id}
                                            existingShifts={existingShifts}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Rule Set (Work Time Config & Piket & Off) */}
                            {activeTab === 'ruleset' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start w-full animate-in fade-in duration-150">
                                    {/* Left Column: Jam & Waktu Kerja */}
                                    <div className="bg-slate-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs space-y-3.5 min-w-0">
                                        <div className="flex items-center space-x-2 border-b border-slate-200/80 dark:border-zinc-800 pb-2">
                                            <Clock className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400" />
                                            <h4 className="text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Preferensi Waktu Kerja</h4>
                                        </div>
                                        <ShiftWorkTimeConfigComponent
                                            workTime={draftShift.workTime}
                                            onChange={(workTime) => updateDraftShift({ ...draftShift, workTime })}
                                            theme={theme}
                                        />
                                    </div>

                                    {/* Right Column: Piket & Off Kriteria */}
                                    <div className="bg-slate-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xs space-y-3.5 min-w-0">
                                        <div className="flex items-center space-x-2 border-b border-slate-200/80 dark:border-zinc-800 pb-2">
                                            <Briefcase className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400" />
                                            <h4 className="text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Kriteria Piket & Hari Libur</h4>
                                        </div>
                                        <ShiftPiketTagConfig
                                            isPiket={draftShift.isPiket}
                                            piketHariKerja={draftShift.piketHariKerja}
                                            piketHariLibur={draftShift.piketHariLibur}
                                            piketHariKerjaDenganOff={draftShift.piketHariKerjaDenganOff}
                                            onChange={(updates) =>
                                                updateDraftShift({
                                                    ...draftShift,
                                                    isPiket: updates.isPiket,
                                                    piketHariKerja: updates.piketHariKerja,
                                                    piketHariLibur: updates.piketHariLibur,
                                                    piketHariKerjaDenganOff: updates.piketHariKerjaDenganOff,
                                                })
                                            }
                                            shiftKey={draftShift.key}
                                            theme={theme}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column Bottom Footer containing Batal, Terapkan, Simpan */}
                        <div className="p-3 border-t border-slate-200/80 dark:border-zinc-800 flex justify-end items-center space-x-2.5 bg-slate-50/50 dark:bg-black/20 shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 cursor-pointer transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleApply}
                                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-all active:scale-95 ${
                                    isApplied
                                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 border-teal-500/30'
                                }`}
                                title="Simpan perubahan tanpa menutup jendela"
                            >
                                <Check className={`w-3.5 h-3.5 ${isApplied ? 'text-emerald-500' : ''}`} />
                                <span>{isApplied ? 'Diterapkan!' : 'Terapkan'}</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                                title="Simpan dan tutup jendela"
                            >
                                <Save className="w-3.5 h-3.5" />
                                <span>Simpan</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-modal: Icon Picker */}
            <ShiftIconPickerModal
                isOpen={isIconPickerOpen}
                onClose={() => setIsIconPickerOpen(false)}
                visual={draftShift.visual}
                naming={draftShift.naming}
                onChange={(visual) => updateDraftShift({ ...draftShift, visual })}
            />
        </div>,
        document.body
    );
};

