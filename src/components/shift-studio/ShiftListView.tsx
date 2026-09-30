import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShiftItemConfig, ShiftVisualStyle, AppTheme } from '../../types';
import { ICON_CATALOG } from './ShiftIconPickerModal';
import { BADGE_PATTERNS, isCustomPatternImage, parseCssPatternToStyle } from './patterns';
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
    Pencil,
    X,
    Check,
} from 'lucide-react';

import { getCurrentUserPermissions } from '../../utils/adminStorage';

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
    onRenameProfile?: (newName: string) => void;
    theme?: AppTheme;
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
    onRenameProfile,
    theme = 'default',
}) => {
    const isIndustrial = theme === 'industrial';
    const isDashboard = theme === 'dashboard';
    const isDark = theme === 'dark' || isIndustrial;
    const permissions = getCurrentUserPermissions();
    const canEditAllShifts = permissions.canEditAllShifts !== false;
    const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
    const [nameInput, setNameInput] = useState(groupName);
    const [nameError, setNameError] = useState('');

    useEffect(() => {
        setNameInput(groupName);
    }, [groupName]);

    const handleOpenEditName = () => {
        setNameInput(groupName);
        setNameError('');
        setIsEditNameModalOpen(true);
    };

    const handleSaveName = () => {
        const trimmed = nameInput.trim();
        if (!trimmed) {
            setNameError('Nama profil aturan shift tidak boleh kosong.');
            return;
        }
        if (onRenameProfile) {
            onRenameProfile(trimmed);
        }
        setIsEditNameModalOpen(false);
        setNameError('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveName();
        } else if (e.key === 'Escape') {
            setIsEditNameModalOpen(false);
            setNameError('');
        }
    };

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

    const renderPatternOverlay = (vis: ShiftVisualStyle) => {
        if (vis.customPatternUrl) {
            let opacity = vis.patternOpacity !== undefined ? vis.patternOpacity : 1.0;
            if (opacity > 1) opacity = opacity / 100;

            if (isCustomPatternImage(vis.customPatternUrl)) {
                const imgScale = vis.patternScale || 1.0;
                const sizePx = Math.max(8, Math.round(16 * imgScale));
                return (
                    <div
                        className="absolute inset-0 pointer-events-none z-0"
                        style={{
                            backgroundImage: `url(${vis.customPatternUrl})`,
                            backgroundRepeat: 'repeat',
                            backgroundPosition: 'center',
                            backgroundSize: `${sizePx}px ${sizePx}px`,
                            opacity,
                        }}
                    />
                );
            }

            const cssStyle = parseCssPatternToStyle(vis.customPatternUrl, vis.patternScale || 1.0);
            return (
                <div
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{
                        ...cssStyle,
                        opacity,
                    }}
                />
            );
        }

        const patternObj = BADGE_PATTERNS.find((p) => p.id === vis.patternType);
        if (!patternObj || patternObj.id === 'none') return null;

        const patColor = vis.patternColor || '#FFFFFF';
        const strokeWidth = vis.patternStrokeWidth !== undefined ? vis.patternStrokeWidth : 1.2;
        const svgContentStr = patternObj.svgContent(patColor, strokeWidth);
        const scale = vis.patternScale || 1.0;
        const patWidth = Math.max(2, Math.round(patternObj.defaultWidth * scale));
        const patHeight = Math.max(2, Math.round(patternObj.defaultHeight * scale));
        let opacity = vis.patternOpacity !== undefined ? vis.patternOpacity : 1.0;
        if (opacity > 1) opacity = opacity / 100;

        const patId = `list-pat-${vis.patternType || 'pat'}`;
        return (
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0"
                style={{ opacity }}
            >
                <defs>
                    <pattern
                        id={patId}
                        width={patWidth}
                        height={patHeight}
                        patternUnits="userSpaceOnUse"
                    >
                        <g dangerouslySetInnerHTML={{ __html: svgContentStr }} />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${patId})`} />
            </svg>
        );
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
                            <div
                                onClick={onRenameProfile ? handleOpenEditName : undefined}
                                className={`flex items-center space-x-1.5 group ${onRenameProfile ? 'cursor-pointer' : ''}`}
                                title={onRenameProfile ? 'Klik untuk mengubah nama profil shift' : undefined}
                            >
                                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                    {groupName}
                                </h3>
                                {onRenameProfile && (
                                    <Pencil className="w-3 h-3 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors opacity-60 group-hover:opacity-100" />
                                )}
                            </div>
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
                        className={`px-2.5 py-1 text-xs font-medium border flex items-center space-x-1 cursor-pointer transition-colors ${
                            isIndustrial
                                ? 'bg-[#1A1D23] hover:bg-white/10 text-[#E2E8F0] border-[rgba(226,232,240,0.15)] rounded-[4px]'
                                : isDashboard
                                ? 'bg-[#FFF0BE] hover:bg-[#FFE8A3] text-[#4D2A00] border-[#4D2A00]/30 rounded-lg'
                                : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 rounded-lg'
                        }`}
                        title="Ekspor JSON Shift"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Ekspor</span>
                    </button>
                    <button
                        type="button"
                        onClick={onImportJson}
                        className={`px-2.5 py-1 text-xs font-medium border flex items-center space-x-1 cursor-pointer transition-colors ${
                            isIndustrial
                                ? 'bg-[#1A1D23] hover:bg-white/10 text-[#E2E8F0] border-[rgba(226,232,240,0.15)] rounded-[4px]'
                                : isDashboard
                                ? 'bg-[#FFF0BE] hover:bg-[#FFE8A3] text-[#4D2A00] border-[#4D2A00]/30 rounded-lg'
                                : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 rounded-lg'
                        }`}
                        title="Impor JSON Shift"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Impor</span>
                    </button>
                </div>
            </div>

            {/* Actions inside edit menu: Add Shift + Reset to Default + Tools Menu */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-1">
                <div className="flex flex-wrap items-center gap-2">
                    {canEditAllShifts && (
                        <>
                            <button
                                type="button"
                                onClick={onAddNewShift}
                                className={`px-3.5 py-1.5 text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all active:scale-95 ${
                                    isIndustrial
                                        ? 'bg-[#2DD4BF] hover:bg-[#26b8a8] text-[#0F1115] rounded-[4px]'
                                        : isDashboard
                                        ? 'bg-[#4D2A00] hover:bg-[#381B00] text-[#F9E6A8] rounded-lg'
                                        : 'bg-teal-600 hover:bg-teal-700 text-white rounded-lg'
                                }`}
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Shift Baru</span>
                            </button>
                            {/* Tombol default diposisikan di dalam menu edit ini sesuai instruksi */}
                            <button
                                type="button"
                                onClick={onResetToDefault}
                                className={`px-3 py-1.5 text-xs font-medium border flex items-center space-x-1.5 cursor-pointer transition-colors ${
                                    isIndustrial
                                        ? 'bg-[#1A1D23] hover:bg-white/10 text-[#E2E8F0] border-[rgba(226,232,240,0.15)] rounded-[4px]'
                                        : isDashboard
                                        ? 'bg-[#FFF0BE] hover:bg-[#FFE8A3] text-[#4D2A00] border-[#4D2A00]/30 rounded-lg'
                                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 rounded-lg'
                                }`}
                                title="Kembalikan aturan kelompok ini ke konfigurasi bawaan"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Kembalikan Default</span>
                            </button>
                        </>
                    )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Total: <strong className="text-slate-800 dark:text-slate-200">{shifts.length}</strong> Shift Terdaftar
                </div>
            </div>

            {/* Form list baris (bukan grid kotak) */}
            <div className={`border overflow-hidden divide-y ${
                isIndustrial
                    ? 'border-[rgba(226,232,240,0.15)] bg-[#1A1D23] divide-[rgba(226,232,240,0.1)] rounded-[6px]'
                    : isDashboard
                    ? 'border-[#4D2A00]/25 bg-[#FFFBF0] text-[#4D2A00] divide-[#4D2A00]/15 rounded-lg'
                    : 'border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-[#1E1E1E] divide-slate-200/80 dark:divide-zinc-800 rounded-lg'
            }`}>
                {shifts.map((s, idx) => {
                    const isOffOrCuti = s.key === 'OFF' || s.key === 'CUTI';
                    return (
                        <div
                            key={`shift-list-${s.id}-${idx}`}
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
                                        className="relative overflow-hidden w-full text-center py-1 px-1 rounded-md font-black text-xs shadow-2xs border flex items-center justify-center space-x-1"
                                        style={{
                                            ...getBadgeStyle(s.visual),
                                            color: s.visual.textColor || '#FFFFFF',
                                            borderColor: s.visual.borderColor || '#83C5BE',
                                        }}
                                    >
                                        {renderPatternOverlay(s.visual)}
                                        <div className="relative z-10 flex items-center justify-center space-x-1 min-w-0">
                                            {renderIcon(s.visual)}
                                            <span className="truncate">{s.naming.displayBadge}</span>
                                        </div>
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

                                {canEditAllShifts && (
                                    <button
                                        type="button"
                                        onClick={() => onDeleteShift(s)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
                                        title="Hapus shift"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal Dialog Edit Nama Profil Aturan Shift */}
            {isEditNameModalOpen && createPortal(
                <div
                    className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-edit-profile-title"
                >
                    <div
                        className="fixed inset-0"
                        onClick={() => {
                            setIsEditNameModalOpen(false);
                            setNameError('');
                        }}
                    />
                    <div className="relative z-10 w-full max-w-md rounded-xl bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200/90 dark:border-zinc-800 p-5 space-y-4">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-zinc-800">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                                    <Pencil className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 id="modal-edit-profile-title" className="text-sm font-bold text-slate-900 dark:text-white">
                                        Edit Nama Profil Shift
                                    </h3>
                                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                        Perbarui nama profil aturan shift kerja ini
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditNameModalOpen(false);
                                    setNameError('');
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold block text-slate-700 dark:text-zinc-300">
                                    Nama Profil Aturan Shift
                                </label>
                                <input
                                    type="text"
                                    value={nameInput}
                                    onChange={(e) => {
                                        setNameInput(e.target.value);
                                        if (nameError) setNameError('');
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Contoh: Aturan Shift Operasional 2026"
                                    autoFocus
                                    className={`w-full p-2.5 text-xs rounded-lg border bg-slate-50 dark:bg-zinc-800/60 outline-none font-medium transition-all ${
                                        nameError
                                            ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                                            : 'border-slate-200 dark:border-zinc-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20'
                                    }`}
                                />
                                {nameError && (
                                    <p className="text-[11px] text-rose-500 font-medium">
                                        {nameError}
                                    </p>
                                )}
                                <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                                    Tekan <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-mono text-[9px]">Enter</kbd> untuk menyimpan perubahan atau <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-mono text-[9px]">Esc</kbd> untuk membatalkan.
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end items-center space-x-2 pt-3 border-t border-slate-200/80 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditNameModalOpen(false);
                                    setNameError('');
                                }}
                                className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 cursor-pointer transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveName}
                                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-xs transition-all active:scale-95 flex items-center space-x-1.5"
                            >
                                <Check className="w-3.5 h-3.5" />
                                <span>Simpan Nama</span>
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
