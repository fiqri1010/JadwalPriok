import React from 'react';
import { ShiftItemConfig } from '../../types';
import { ICON_CATALOG } from './ShiftIconPickerModal';
import {
    Edit3,
    Trash2,
    Eye,
    EyeOff,
    Clock,
    Plus,
    RotateCcw,
    Download,
    Upload,
    ArrowLeft,
    Layers,
    Calendar,
} from 'lucide-react';

interface ShiftListViewProps {
    groupName: string;
    effectiveStartDate: string;
    shifts: ShiftItemConfig[];
    onBack: () => void;
    onEditShift: (shift: ShiftItemConfig) => void;
    onDeleteShift: (shift: ShiftItemConfig) => void;
    onToggleVisibility: (shiftId: string) => void;
    onAddNewShift: () => void;
    onResetToDefault: () => void;
    onExportJson: () => void;
    onImportJson: () => void;
}

export const ShiftListView: React.FC<ShiftListViewProps> = ({
    groupName,
    effectiveStartDate,
    shifts,
    onBack,
    onEditShift,
    onDeleteShift,
    onToggleVisibility,
    onAddNewShift,
    onResetToDefault,
    onExportJson,
    onImportJson,
}) => {
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
        <div className="space-y-3.5 animate-in fade-in duration-200">
            {/* Breadcrumb & Sub-header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-200/80 dark:border-zinc-800">
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={onBack}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 cursor-pointer transition-colors"
                        title="Kembali ke Daftar Profil Aturan Shift"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                                Profil Aturan Shift
                            </span>
                            <span className="text-xs text-slate-400">/</span>
                            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                                {groupName}
                            </h3>
                        </div>
                        <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 flex items-center space-x-1.5 mt-0.5">
                            <Calendar className="w-3 h-3 opacity-60" />
                            <span>Mulai berlaku: {effectiveStartDate} • {shifts.length} shift</span>
                        </p>
                    </div>
                </div>

                {/* Import / Export Utility */}
                <div className="flex items-center space-x-1.5 self-end sm:self-auto">
                    <button
                        type="button"
                        onClick={onExportJson}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center space-x-1 cursor-pointer transition-colors"
                        title="Ekspor JSON Shift"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Ekspor</span>
                    </button>
                    <button
                        type="button"
                        onClick={onImportJson}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center space-x-1 cursor-pointer transition-colors"
                        title="Impor JSON Shift"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Impor</span>
                    </button>
                </div>
            </div>

            {/* Actions inside edit menu: Add Shift + Reset to Default */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-1">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onAddNewShift}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Shift Baru</span>
                    </button>
                    {/* Tombol default diposisikan di dalam menu edit ini sesuai instruksi */}
                    <button
                        type="button"
                        onClick={onResetToDefault}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center space-x-1.5 cursor-pointer transition-colors"
                        title="Kembalikan aturan kelompok ini ke konfigurasi bawaan"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Kembalikan Default</span>
                    </button>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Total: <strong className="text-slate-800 dark:text-slate-200">{shifts.length}</strong> Shift Terdaftar
                </div>
            </div>

            {/* Form list baris (bukan grid kotak) */}
            <div className="border border-slate-200/90 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-[#1E1E1E] divide-y divide-slate-200/80 dark:divide-zinc-800">
                {shifts.map((s) => {
                    const isOffOrCuti = s.key === 'OFF' || s.key === 'CUTI';
                    return (
                        <div
                            key={s.id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-2.5 sm:px-3.5 sm:py-2.5 gap-2 sm:gap-4 transition-colors ${
                                s.isVisibleInDropdown
                                    ? 'hover:bg-slate-50/70 dark:hover:bg-zinc-800/40'
                                    : 'bg-slate-50/50 dark:bg-zinc-900/50 opacity-60'
                            }`}
                        >
                            {/* Kolom 1: Badge visual (lebar tetap/fixed width) dan Nama + ID shift */}
                            <div className="flex items-center space-x-3 min-w-0 sm:w-2/5">
                                {/* Fixed Width Container untuk Badge agar perataan kiri teks nama shift seragam */}
                                <div className="w-18 sm:w-20 shrink-0 flex items-center justify-center">
                                    <div
                                        className="w-full text-center py-1 px-1 rounded-md font-black text-xs shadow-2xs border flex items-center justify-center space-x-1"
                                        style={{
                                            ...getBadgeStyle(s.visual),
                                            color: s.visual.textColor || '#FFFFFF',
                                            borderColor: s.visual.borderColor || '#83C5BE',
                                        }}
                                    >
                                        {renderIcon(s.visual)}
                                        <span className="truncate">{s.naming.displayBadge}</span>
                                    </div>
                                </div>

                                {/* Area Teks - Rata kiri presisi dan menampilkan ID shift */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                            {s.naming.fullName}
                                        </h4>
                                        {s.isPiket && (
                                            <span className="px-1.5 py-0.2 rounded-md bg-teal-500/15 text-teal-700 dark:text-teal-400 text-[9px] font-bold shrink-0">
                                                Piket
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                                        <span className="font-mono text-[9.5px] px-1 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold border border-slate-200 dark:border-zinc-700 shrink-0">
                                            ID: {s.id}
                                        </span>
                                        <span className="truncate">
                                            {s.naming.dropdownSublabel || 'Tanpa sublabel'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Kolom 2: Jam Kerja */}
                            <div className="flex items-center space-x-1.5 text-[11px] text-slate-600 dark:text-zinc-300 sm:w-1/4">
                                <Clock className="w-3.5 h-3.5 opacity-60 shrink-0" />
                                {isOffOrCuti ? (
                                    <span className="text-[11px] font-medium text-slate-500">Non-Dinas / Libur</span>
                                ) : (
                                    <span className="font-mono font-medium">
                                        {s.workTime.jamMasukDasar} – {s.workTime.jamPulangDasar}
                                        {s.workTime.isOvernight && (
                                            <span className="font-bold text-[9.5px] ml-1 text-teal-600 dark:text-teal-400 font-sans">
                                                (+1)
                                            </span>
                                        )}
                                    </span>
                                )}
                            </div>

                            {/* Kolom 3: Kode Salin */}
                            <div className="hidden md:flex items-center text-[10.5px] text-slate-500 dark:text-zinc-400 font-mono sm:w-1/6">
                                <span>Salin: &apos;{s.naming.copyCode}&apos;</span>
                            </div>

                            {/* Kolom 4: Aksi Tombol List */}
                            <div className="flex items-center justify-end space-x-1.5 shrink-0 self-end sm:self-auto">
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

                                <button
                                    type="button"
                                    onClick={() => onEditShift(s)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center space-x-1 cursor-pointer transition-colors border border-slate-200 dark:border-zinc-700 shadow-2xs"
                                    title="Edit rincian shift"
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
                    );
                })}
            </div>
        </div>
    );
};
