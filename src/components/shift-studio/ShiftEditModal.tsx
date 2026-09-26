import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Palette, Layers, Tag, Clock, Briefcase, Smile, Upload } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState<EditTabType>('visual');
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

    React.useEffect(() => {
        if (shift) {
            setDraftShift(JSON.parse(JSON.stringify(shift)));
        } else {
            setDraftShift(null);
        }
    }, [shift, isOpen]);

    if (!isOpen || !draftShift) return null;

    const handleSave = () => {
        onSaveShift(draftShift);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="fixed inset-0" onClick={onClose} />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200/90 dark:border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-current/10 shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-xs">
                            {draftShift.naming.displayBadge || 'SHIFT'}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="text-sm sm:text-base font-bold">
                                    {draftShift.isSystemDefault ? 'Konfigurasi Shift' : 'Edit Aturan Shift'}
                                </h3>
                                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold border border-slate-200 dark:border-zinc-700">
                                    ID: {draftShift.id}
                                </span>
                            </div>
                            <p className="text-[11px] opacity-60 truncate max-w-[260px]">
                                {draftShift.naming.fullName || 'Shift Baru'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer text-current/70 hover:text-current transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Live Preview Persistent Bar */}
                <div className="p-3 bg-current/5 border-b border-current/10 shrink-0">
                    <ShiftLiveBadgePreview
                        visual={draftShift.visual}
                        naming={draftShift.naming}
                        isPiket={draftShift.isPiket}
                    />
                </div>

                {/* Tab Navigation */}
                <div className="flex p-1 gap-1 mx-4 mt-3 border-b border-slate-200/80 dark:border-slate-700 text-xs shrink-0 overflow-x-auto no-scrollbar">
                    <button
                        type="button"
                        onClick={() => setActiveTab('visual')}
                        className={`py-2 px-3 font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border-b-2 ${
                            activeTab === 'visual' ? 'border-teal-600 text-teal-700 dark:text-teal-400' : 'border-transparent opacity-70 hover:opacity-100 hover:text-teal-600'
                        }`}
                    >
                        <Palette className="w-3.5 h-3.5" />
                        <span>Desain Visual</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('naming')}
                        className={`py-2 px-3 font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border-b-2 ${
                            activeTab === 'naming' ? 'border-teal-600 text-teal-700 dark:text-teal-400' : 'border-transparent opacity-70 hover:opacity-100 hover:text-teal-600'
                        }`}
                    >
                        <Tag className="w-3.5 h-3.5" />
                        <span>Nama & Dropdown</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('worktime')}
                        className={`py-2 px-3 font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border-b-2 ${
                            activeTab === 'worktime' ? 'border-teal-600 text-teal-700 dark:text-teal-400' : 'border-transparent opacity-70 hover:opacity-100 hover:text-teal-600'
                        }`}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Jam Kerja & Lembur</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('piket')}
                        className={`py-2 px-3 font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer border-b-2 ${
                            activeTab === 'piket' ? 'border-teal-600 text-teal-700 dark:text-teal-400' : 'border-transparent opacity-70 hover:opacity-100 hover:text-teal-600'
                        }`}
                    >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Status Piket</span>
                    </button>
                </div>

                {/* Body Content Tabs */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Tab 1: Desain Visual */}
                    {activeTab === 'visual' && (
                        <div className="space-y-4">
                            {/* Color Studio */}
                            <ShiftColorStudio
                                visual={draftShift.visual}
                                onChange={(visual) => setDraftShift({ ...draftShift, visual })}
                            />

                            {/* Pattern Studio */}
                            <ShiftPatternStudio
                                visual={draftShift.visual}
                                onChange={(visual) => setDraftShift({ ...draftShift, visual })}
                            />

                            {/* Icon Picker Trigger Card */}
                            <div className="p-3.5 rounded-2xl bg-current/5 border border-current/10 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-bold">Logo & Ikon Shift:</h4>
                                    <p className="text-[10px] opacity-60">
                                        {draftShift.visual.iconType === 'svg' && draftShift.visual.iconName
                                            ? `Ikon Vektor SVG: ${draftShift.visual.iconName}`
                                            : draftShift.visual.iconType === 'emoji' && draftShift.visual.emoji
                                            ? `Emoji: ${draftShift.visual.emoji}`
                                            : draftShift.visual.iconType === 'customImage'
                                            ? 'Gambar Kustom Aktif'
                                            : 'Tanpa Ikon'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsIconPickerOpen(true)}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                                >
                                    <Smile className="w-3.5 h-3.5" />
                                    <span>Pilih Ikon (100+ SVG)</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Naming & Dropdown */}
                    {activeTab === 'naming' && (
                        <ShiftNamingInput
                            naming={draftShift.naming}
                            onChange={(naming) => setDraftShift({ ...draftShift, naming })}
                            currentShiftId={draftShift.id}
                            existingShifts={existingShifts}
                        />
                    )}

                    {/* Tab 3: Jam Kerja & Lembur */}
                    {activeTab === 'worktime' && (
                        <ShiftWorkTimeConfigComponent
                            workTime={draftShift.workTime}
                            onChange={(workTime) => setDraftShift({ ...draftShift, workTime })}
                        />
                    )}

                    {/* Tab 4: Piket Tag */}
                    {activeTab === 'piket' && (
                        <ShiftPiketTagConfig
                            isPiket={draftShift.isPiket}
                            onChange={(isPiket) => setDraftShift({ ...draftShift, isPiket })}
                            shiftKey={draftShift.key}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-current/10 flex justify-between items-center bg-current/5 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 cursor-pointer transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-5 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                    >
                        <Save className="w-4 h-4" />
                        <span>Simpan Perubahan</span>
                    </button>
                </div>
            </div>

            {/* Sub-modal: Icon Picker */}
            <ShiftIconPickerModal
                isOpen={isIconPickerOpen}
                onClose={() => setIsIconPickerOpen(false)}
                visual={draftShift.visual}
                onChange={(visual) => setDraftShift({ ...draftShift, visual })}
            />
        </div>,
        document.body
    );
};
