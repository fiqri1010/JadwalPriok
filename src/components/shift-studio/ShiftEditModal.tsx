import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Palette, Tag, Clock, Briefcase, Smile, Undo2, Redo2, RotateCcw } from 'lucide-react';
import { ShiftItemConfig } from '../../types';
import { ShiftColorStudio } from './ShiftColorStudio';
import { ShiftPatternStudio } from './ShiftPatternStudio';
import { ShiftNamingInput } from './ShiftNamingInput';
import { ShiftWorkTimeConfigComponent } from './ShiftWorkTimeConfig';
import { ShiftLiveBadgePreview } from './ShiftLiveBadgePreview';
import { ShiftPiketTagConfig } from './ShiftPiketTagConfig';
import { ShiftIconPickerModal } from './ShiftIconPickerModal';

interface ShiftEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    shift: ShiftItemConfig | null;
    existingShifts: ShiftItemConfig[];
    onSaveShift: (updatedShift: ShiftItemConfig) => void;
}

export type EditTabType = 'visual' | 'naming' | 'worktime' | 'piket';

export const ShiftEditModal: React.FC<ShiftEditModalProps> = ({
    isOpen,
    onClose,
    shift,
    existingShifts,
    onSaveShift,
}) => {
    const [draftShift, setDraftShift] = useState<ShiftItemConfig | null>(null);
    const [initialShift, setInitialShift] = useState<ShiftItemConfig | null>(null);
    const [history, setHistory] = useState<ShiftItemConfig[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);

    const [activeTab, setActiveTab] = useState<EditTabType>('visual');
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

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

    const isModifiedFromInitial = Boolean(
        initialShift && JSON.stringify(draftShift) !== JSON.stringify(initialShift)
    );

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="fixed inset-0" onClick={onClose} />
            <div className="relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200/90 dark:border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-3.5 border-b border-slate-200/80 dark:border-zinc-800 shrink-0">
                    <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-xs shrink-0">
                            {draftShift.naming.displayBadge || 'SHIFT'}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="text-xs sm:text-sm font-bold">
                                    {draftShift.isSystemDefault ? 'Konfigurasi Shift' : 'Edit Aturan Shift'}
                                </h3>
                                <span className="font-mono text-[9.5px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold border border-slate-200 dark:border-zinc-700">
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

                {/* Live Preview Persistent Bar + Undo, Redo, Reset Actions */}
                <div className="p-2 sm:p-2.5 bg-slate-50/80 dark:bg-black/30 border-b border-slate-200/80 dark:border-zinc-800 shrink-0 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex-1 min-w-[200px]">
                        <ShiftLiveBadgePreview
                            visual={draftShift.visual}
                            naming={draftShift.naming}
                            isPiket={draftShift.isPiket}
                        />
                    </div>

                    {/* Undo, Redo & Reset Control Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 bg-white dark:bg-zinc-900/80 p-1 rounded-xl border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
                        <button
                            type="button"
                            onClick={handleUndo}
                            disabled={historyIndex <= 0}
                            className="px-2 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer transition-all active:scale-95 border border-slate-200/80 dark:border-zinc-700"
                            title="Undo (Urungkan Perubahan Terakhir)"
                        >
                            <Undo2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <span className="hidden sm:inline">Undo</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleRedo}
                            disabled={historyIndex >= history.length - 1}
                            className="px-2 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer transition-all active:scale-95 border border-slate-200/80 dark:border-zinc-700"
                            title="Redo (Ulangi Perubahan)"
                        >
                            <Redo2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <span className="hidden sm:inline">Redo</span>
                        </button>

                        <div className="h-4 w-px bg-slate-200 dark:bg-zinc-700 mx-0.5" />

                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={!isModifiedFromInitial}
                            className="px-2 py-1 text-xs font-bold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer transition-all active:scale-95 border border-amber-500/20"
                            title="Reset ke Tampilan Semula Sebelum Edit"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex p-1 gap-1 mx-3 sm:mx-4 mt-2 border-b border-slate-200/80 dark:border-slate-700 text-xs shrink-0 overflow-x-auto no-scrollbar">
                    <button
                        type="button"
                        onClick={() => setActiveTab('visual')}
                        className={`py-1.5 px-3 font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border-b-2 ${
                            activeTab === 'visual'
                                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                                : 'border-transparent opacity-70 hover:opacity-100 hover:text-teal-600'
                        }`}
                    >
                        <Palette className="w-3.5 h-3.5" />
                        <span>Desain Visual</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('naming')}
                        className={`py-1.5 px-3 font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border-b-2 ${
                            activeTab === 'naming'
                                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                                : 'border-transparent opacity-70 hover:opacity-100 hover:text-teal-600'
                        }`}
                    >
                        <Tag className="w-3.5 h-3.5" />
                        <span>Nama & Dropdown</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('worktime')}
                        className={`py-1.5 px-3 font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border-b-2 ${
                            activeTab === 'worktime'
                                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                                : 'border-transparent opacity-70 hover:opacity-100 hover:text-teal-600'
                        }`}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Jam Kerja & Lembur</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('piket')}
                        className={`py-1.5 px-3 font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border-b-2 ${
                            activeTab === 'piket'
                                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                                : 'border-transparent opacity-70 hover:opacity-100 hover:text-teal-600'
                        }`}
                    >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Status Piket</span>
                    </button>
                </div>

                {/* Body Content Tabs (with modal-scroll-body class for hover wheel pause integration) */}
                <div className="flex-1 overflow-y-auto modal-scroll-body p-2 sm:p-2.5 space-y-2 font-sans">
                    {/* Tab 1: Desain Visual - Side-by-Side Compact Layout */}
                    {activeTab === 'visual' && (
                        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-3 items-start">
                            {/* Left Column: Color Studio & Theme-Adaptive Color Picker */}
                            <div className="flex flex-col min-w-0">
                                <ShiftColorStudio
                                    visual={draftShift.visual}
                                    onChange={(visual) => updateDraftShift({ ...draftShift, visual })}
                                />
                            </div>

                            {/* Right Column: Motif Pattern Controls & Icon Picker Card */}
                            <div className="flex flex-col gap-2 min-w-0">
                                <ShiftPatternStudio
                                    visual={draftShift.visual}
                                    onChange={(visual) => updateDraftShift({ ...draftShift, visual })}
                                />

                                {/* Icon Picker Trigger Card */}
                                <div className="p-2 sm:p-2.5 rounded-2xl bg-white/80 dark:bg-[#161616] border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0 shadow-2xs">
                                    <div className="space-y-0.5 min-w-0">
                                        <h4 className="text-xs font-bold truncate">Logo & Ikon Shift:</h4>
                                        <p className="text-[10px] opacity-60 truncate">
                                            {draftShift.visual.iconType === 'svg' && draftShift.visual.iconName
                                                ? `SVG: ${draftShift.visual.iconName}`
                                                : draftShift.visual.iconType === 'emoji' && draftShift.visual.emoji
                                                ? `Emoji: ${draftShift.visual.emoji}`
                                                : draftShift.visual.iconType === 'customImage'
                                                ? 'Gambar Kustom'
                                                : 'Tanpa Ikon'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsIconPickerOpen(true)}
                                        className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all active:scale-95 shrink-0"
                                    >
                                        <Smile className="w-3.5 h-3.5" />
                                        <span>Pilih Ikon (100+ SVG)</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Naming & Dropdown */}
                    {activeTab === 'naming' && (
                        <ShiftNamingInput
                            naming={draftShift.naming}
                            onChange={(naming) => updateDraftShift({ ...draftShift, naming })}
                            currentShiftId={draftShift.id}
                            existingShifts={existingShifts}
                        />
                    )}

                    {/* Tab 3: Jam Kerja & Lembur */}
                    {activeTab === 'worktime' && (
                        <ShiftWorkTimeConfigComponent
                            workTime={draftShift.workTime}
                            onChange={(workTime) => updateDraftShift({ ...draftShift, workTime })}
                        />
                    )}

                    {/* Tab 4: Piket Tag */}
                    {activeTab === 'piket' && (
                        <ShiftPiketTagConfig
                            isPiket={draftShift.isPiket}
                            onChange={(isPiket) => updateDraftShift({ ...draftShift, isPiket })}
                            shiftKey={draftShift.key}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="p-2.5 sm:p-3 border-t border-slate-200/80 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-black/20 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 cursor-pointer transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-4 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span>Simpan Perubahan</span>
                    </button>
                </div>
            </div>

            {/* Sub-modal: Icon Picker */}
            <ShiftIconPickerModal
                isOpen={isIconPickerOpen}
                onClose={() => setIsIconPickerOpen(false)}
                visual={draftShift.visual}
                onChange={(visual) => updateDraftShift({ ...draftShift, visual })}
            />
        </div>,
        document.body
    );
};
