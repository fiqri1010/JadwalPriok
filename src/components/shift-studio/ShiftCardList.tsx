import React from 'react';
import { ShiftItemConfig } from '../../types';
import { ICON_CATALOG } from './ShiftIconPickerModal';
import {
    Edit3,
    Trash2,
    Eye,
    EyeOff,
    Briefcase,
    Clock,
    Layers,
    Plus,
    RotateCcw,
    Download,
    Upload,
    ChevronRight,
} from 'lucide-react';

interface ShiftCardListProps {
    shifts: ShiftItemConfig[];
    onEditShift: (shift: ShiftItemConfig) => void;
    onDeleteShift: (shift: ShiftItemConfig) => void;
    onToggleVisibility: (shiftId: string) => void;
    onAddNewShift: () => void;
    onResetToDefault: () => void;
    onExportJson: () => void;
    onImportJson: () => void;
}

export const ShiftCardList: React.FC<ShiftCardListProps> = ({
    shifts,
    onEditShift,
    onDeleteShift,
    onToggleVisibility,
    onAddNewShift,
    onResetToDefault,
    onExportJson,
    onImportJson,
}) => {
    // Helper to get background style
    const getBadgeStyle = (visual: ShiftItemConfig['visual']): React.CSSProperties => {
        if (visual.colorMode === 'customCss' && visual.customCss) {
            return { background: visual.customCss.replace(/background(-color)?:\s*|;/g, '').trim() };
        }
        if (visual.colorMode === 'radial') {
            const stopsStr = visual.colorStops.map((s) => `${s.color} ${s.position}%`).join(', ');
            return { background: `radial-gradient(circle at center, ${stopsStr})` };
        }
        if (visual.colorMode === 'linear') {
            const stopsStr = visual.colorStops.map((s) => `${s.color} ${s.position}%`).join(', ');
            return { background: `linear-gradient(${visual.gradientAngle || 135}deg, ${stopsStr})` };
        }
        return { backgroundColor: visual.solidColor || '#EDF6F9' };
    };

    const renderIcon = (visual: ShiftItemConfig['visual']) => {
        if (visual.iconType === 'emoji' && visual.emoji) {
            return <span className="text-xs">{visual.emoji}</span>;
        }
        if (visual.iconType === 'customImage' && visual.customIconUrl) {
            return <img src={visual.customIconUrl} alt="Icon" className="w-3.5 h-3.5 rounded object-contain" />;
        }
        if (visual.iconType === 'svg' && visual.iconName) {
            const found = ICON_CATALOG.find((i) => i.name === visual.iconName);
            if (found) {
                const IconComp = found.component;
                return <IconComp className="w-3.5 h-3.5" />;
            }
        }
        return null;
    };

    return (
        <div className="space-y-4">
            {/* Top Toolbar Action Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                        type="button"
                        onClick={onAddNewShift}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Shift Baru</span>
                    </button>
                    <button
                        type="button"
                        onClick={onResetToDefault}
                        className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center space-x-1.5 cursor-pointer transition-colors"
                        title="Kembalikan konfigurasi shift bawaan"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reset Default</span>
                    </button>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={onExportJson}
                        className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center space-x-1 cursor-pointer transition-colors"
                        title="Ekspor JSON Shift"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Ekspor</span>
                    </button>
                    <button
                        type="button"
                        onClick={onImportJson}
                        className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center space-x-1 cursor-pointer transition-colors"
                        title="Impor JSON Shift"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Impor</span>
                    </button>
                </div>
            </div>

            {/* List of Shift Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {shifts.map((s) => {
                    const isOffOrCuti = s.key === 'OFF' || s.key === 'CUTI';
                    return (
                        <div
                            key={s.id}
                            className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between space-y-3 ${
                                s.isVisibleInDropdown
                                    ? 'bg-white dark:bg-[#1E1E1E] border-slate-200/90 dark:border-zinc-800 hover:border-teal-500/50 shadow-xs'
                                    : 'bg-slate-50/50 dark:bg-zinc-900/50 border-slate-200/60 dark:border-zinc-800/60 opacity-60'
                            }`}
                        >
                            {/* Card Top: Badge & Name */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center space-x-2.5 truncate">
                                    {/* Shift Visual Badge */}
                                    <div
                                        className="px-2.5 py-1 rounded-md font-black text-xs shadow-2xs border flex items-center space-x-1.5 shrink-0"
                                        style={{
                                            ...getBadgeStyle(s.visual),
                                            color: s.visual.textColor || '#FFFFFF',
                                            borderColor: s.visual.borderColor || '#83C5BE',
                                        }}
                                    >
                                        {renderIcon(s.visual)}
                                        <span>{s.naming.displayBadge}</span>
                                    </div>

                                    <div className="truncate">
                                        <h4 className="text-xs font-bold truncate flex items-center space-x-1.5">
                                            <span>{s.naming.fullName}</span>
                                            {s.isPiket && (
                                                <span className="px-1.5 py-0.2 rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-400 text-[9px] font-bold shrink-0">
                                                    Piket
                                                </span>
                                            )}
                                        </h4>
                                        <p className="text-[10px] opacity-60 truncate">
                                            {s.naming.dropdownSublabel || 'Tidak ada deskripsi'}
                                        </p>
                                    </div>
                                </div>

                                {/* Visibility Toggle */}
                                <button
                                    type="button"
                                    onClick={() => onToggleVisibility(s.id)}
                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                        s.isVisibleInDropdown
                                            ? 'text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30'
                                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                                    }`}
                                    title={s.isVisibleInDropdown ? 'Tampil di Dropdown' : 'Disembunyikan'}
                                >
                                    {s.isVisibleInDropdown ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Card Mid: Work Time Info */}
                            <div className="text-[11px] p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/70 dark:border-zinc-700/60 flex items-center justify-between">
                                <div className="flex items-center space-x-1.5 opacity-80">
                                    <Clock className="w-3.5 h-3.5 opacity-60" />
                                    {isOffOrCuti ? (
                                        <span>Status Libur / Non-Dinas</span>
                                    ) : (
                                        <span>
                                            {s.workTime.jamMasukDasar} – {s.workTime.jamPulangDasar}
                                            {s.workTime.isOvernight && <span className="font-bold text-[9px] ml-1 text-teal-600 dark:text-teal-400">(+1)</span>}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] font-mono opacity-60">Kode Salin: &apos;{s.naming.copyCode}&apos;</span>
                            </div>

                            {/* Card Bottom: Ghost Action Buttons */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 dark:border-zinc-800 text-xs">
                                <div className="text-[10px] opacity-60">
                                    {s.visual.colorMode === 'linear' || s.visual.colorMode === 'radial'
                                        ? 'Gradien'
                                        : s.visual.colorMode === 'customCss'
                                        ? 'Kustom CSS'
                                        : 'Warna Solid'}
                                </div>

                                <div className="flex items-center space-x-1">
                                    <button
                                        type="button"
                                        onClick={() => onEditShift(s)}
                                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center space-x-1 cursor-pointer transition-colors"
                                        title="Edit shift"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span>Edit</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onDeleteShift(s)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
                                        title="Hapus shift"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
