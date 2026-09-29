import React, { useState, useRef } from 'react';
import {
    Upload,
    Trash2,
    Sliders,
    X,
    AlertTriangle,
} from 'lucide-react';
import { DayData, normalizeShift, LiburNasional, AppTheme } from '../types';
import { ShiftSettingsTab } from './shift-studio/ShiftSettingsTab';
import { AccountSettingsTab } from './account/AccountSettingsTab';

export type SettingsTab = 'account' | 'shift' | 'import_reset';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    daysState: Record<string, DayData>;
    selectedMonth?: number;
    selectedYear?: number;
    monthName?: string;
    onImportDays: (importedData: Record<string, DayData>, mode: 'merge' | 'replace') => void;
    onClearAllData?: () => void;
    onShowToast: (msg: string) => void;
    theme?: AppTheme;
    daftarLibur?: LiburNasional[];
    isPageView?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    daysState,
    onImportDays,
    onClearAllData,
    onShowToast,
    theme = 'default',
    isPageView = false,
}) => {
    const isDark = theme === 'dark';
    const isVista = theme === 'vista';
    const isWinamp = theme === 'winamp';
    const isPaperSketch = theme === 'paperSketch';
    const isIndustrial = theme === 'industrial';
    const isTechnical = theme === 'technical';
    const isEditorial = theme === 'editorial';
    const isDashboard = theme === 'dashboard';

    const [activeTab, setActiveTab] = useState<SettingsTab>('account');
    const [pastedJson, setPastedJson] = useState('');
    const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
    const [importError, setImportError] = useState<string | null>(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen && !isPageView) return null;

    // Import Handlers
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result as string;
            setPastedJson(text);
        };
        reader.readAsText(file);
    };

    const handleExecuteImport = () => {
        setImportError(null);
        if (!pastedJson.trim()) {
            setImportError('Silakan masukkan atau tempel JSON cadangan.');
            return;
        }

        try {
            const parsed = JSON.parse(pastedJson);
            const dataToImport = parsed.days || parsed;

            if (typeof dataToImport !== 'object' || dataToImport === null) {
                throw new Error('Format cadangan JSON tidak valid.');
            }

            const cleanResult: Record<string, DayData> = {};
            Object.entries(dataToImport).forEach(([key, val]: [string, any]) => {
                if (val && typeof val === 'object') {
                    cleanResult[key] = {
                        shift: normalizeShift(val.shift),
                        isLocked: Boolean(val.isLocked),
                        note: String(val.note || ''),
                        isMasuk: Boolean(val.isMasuk),
                        jamMasuk: String(val.jamMasuk || ''),
                        jamPulang: String(val.jamPulang || ''),
                        absenCeisa: String(val.absenCeisa || ''),
                        isManualHoliday: Boolean(val.isManualHoliday),
                    };
                }
            });

            onImportDays(cleanResult, importMode);
            onShowToast(`Berhasil mengimpor ${Object.keys(cleanResult).length} hari data jadwal.`);
            if (!isPageView) onClose();
        } catch (err: any) {
            setImportError(`Gagal membaca JSON: ${err.message}`);
        }
    };

    // Styling configuration per theme
    const getThemeStyles = () => {
        if (isPaperSketch) {
            return {
                cardOuter: 'bg-white border-2 border-[#2b2b2b] rounded-2xl p-4 shadow-[6px_6px_0px_#2b2b2b]',
                cardInner: 'bg-white text-[#2b2b2b]',
                tabActive: 'bg-[#ff4747] text-white font-bold rounded-lg border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] font-[\'Gaegu\'] text-base',
                tabInactive: 'text-[#2b2b2b] hover:bg-[#2ec4b6]/20 rounded-lg font-[\'Gaegu\'] text-base',
                accentBtn: 'bg-[#ff4747] hover:bg-[#ff3333] text-white font-bold rounded-lg border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b] active:translate-x-0.5 active:translate-y-0.5',
                outlineBtn: 'bg-white text-[#2b2b2b] border-2 border-[#2b2b2b] hover:bg-[#2ec4b6]/20 rounded-lg shadow-[2px_2px_0px_#2b2b2b]',
                insetBox: 'bg-[#f2efeb] border-2 border-[#2b2b2b] rounded-lg text-[#2b2b2b]',
            };
        }
        if (isWinamp) {
            return {
                cardOuter: 'bg-black border-2 border-[#00FF00] rounded-none p-4 shadow-[4px_4px_0_#00FF00] font-mono',
                cardInner: 'bg-[#121212] text-[#00FF00]',
                tabActive: 'bg-[#00FF00] text-black font-bold rounded-none',
                tabInactive: 'text-[#00FF00] hover:bg-zinc-800 rounded-none',
                accentBtn: 'bg-[#00FF00] hover:bg-[#00cc00] text-black font-bold rounded-none',
                outlineBtn: 'bg-black text-[#00FF00] border border-[#00FF00] hover:bg-zinc-900 rounded-none',
                insetBox: 'bg-black border border-zinc-700 rounded-none text-[#00FF00]',
            };
        }
        if (isIndustrial) {
            return {
                cardOuter: 'bg-[#1A1D23] border border-[rgba(226,232,240,0.15)] rounded-[8px] p-1 shadow-2xl font-[\'JetBrains_Mono\']',
                cardInner: 'bg-[#1A1D23] text-[#E2E8F0] rounded-[6px] p-4 sm:p-5',
                tabActive: 'bg-[#2DD4BF]/20 text-[#2DD4BF] font-bold border border-[#2DD4BF]/40 rounded-[4px] uppercase tracking-wider',
                tabInactive: 'text-[#E2E8F0]/60 hover:text-[#E2E8F0] hover:bg-white/5 rounded-[4px] uppercase tracking-wider',
                accentBtn: 'bg-[#2DD4BF] hover:bg-[#26b8a8] text-[#0F1115] font-bold rounded-[4px] uppercase tracking-wider transition-all',
                outlineBtn: 'bg-[#0F1115] text-[#E2E8F0] border border-[rgba(226,232,240,0.15)] hover:bg-white/5 rounded-[4px] uppercase tracking-wider',
                insetBox: 'bg-[#0F1115] border border-[rgba(226,232,240,0.1)] rounded-[4px] text-[#E2E8F0]',
            };
        }
        if (isDark) {
            return {
                cardOuter: 'bg-linear-to-br from-blue-600/30 to-[#64ffda]/30 rounded-lg p-[1px] shadow-sm',
                cardInner: 'bg-[#1E1E1E] text-[#E0E0E0] rounded-lg p-4 sm:p-5',
                tabActive: 'bg-blue-600 text-white font-bold rounded-lg shadow-xs',
                tabInactive: 'text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg',
                accentBtn: 'bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md active:scale-95',
                outlineBtn: 'bg-[#252525] text-slate-200 border border-slate-700 hover:bg-[#303030] rounded-lg',
                insetBox: 'bg-[#161616] border border-slate-800 rounded-lg text-[#E0E0E0]',
            };
        }
        if (isVista) {
            return {
                cardOuter: 'bg-gradient-to-br from-white/90 via-sky-300/60 to-blue-500/50 rounded-lg p-[1px] shadow-sm',
                cardInner: 'bg-white/75 backdrop-blur-2xl text-slate-900 rounded-lg p-4 sm:p-5 border border-white/80',
                tabActive: 'bg-gradient-to-b from-sky-400 to-blue-600 text-white font-bold rounded-lg shadow-md border border-white/50',
                tabInactive: 'text-slate-700 hover:text-slate-950 hover:bg-white/60 rounded-lg font-medium',
                accentBtn: 'bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white font-bold rounded-lg shadow-md border border-white/50 active:scale-95',
                outlineBtn: 'bg-white/70 backdrop-blur-xs text-sky-950 border border-white/80 hover:bg-white rounded-lg shadow-2xs',
                insetBox: 'bg-white/50 backdrop-blur-md border border-white/70 rounded-lg text-slate-900',
            };
        }
        // Default Light Theme
        return {
            cardOuter: 'bg-white rounded-lg shadow-sm border border-slate-200/90',
            cardInner: 'bg-white text-[#011627] rounded-lg p-4 sm:p-5',
            tabActive: 'text-teal-700 font-bold border-b-2 border-teal-600 rounded-none bg-transparent',
            tabInactive: 'text-slate-600 hover:text-slate-900 border-b-2 border-transparent rounded-none hover:bg-slate-50',
            accentBtn: 'bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-xs active:scale-95 transition-all',
            outlineBtn: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition-all',
            insetBox: 'bg-[#F8FAFC] border border-slate-200/80 rounded-lg text-[#011627]',
        };
    };

    const s = getThemeStyles();

    const modalContent = (
        <div className={s.cardOuter}>
            <div className={s.cardInner}>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200/70 dark:border-slate-800">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 shrink-0">
                            <Sliders className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-black">Pengaturan Aplikasi</h2>
                            <p className="text-xs opacity-60">Ekspor, Impor, & Cadangan Jadwal</p>
                        </div>
                    </div>
                    {!isPageView && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-current/70 hover:text-current transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Modern Segmented Tab Container with Grid 3-Columns for Perfect Tab Alignment */}
                <div className="flex justify-center my-3 sm:my-4">
                    <div
                        className={`relative p-[3px] rounded-[10px] grid grid-cols-3 items-center select-none w-full max-w-[360px] sm:max-w-[480px] ${
                            isWinamp
                                ? 'bg-black border border-zinc-700 rounded-none'
                                : isDark
                                ? 'bg-[#161616] border border-slate-800'
                                : isVista
                                ? 'bg-sky-100/70 border border-sky-200/80 backdrop-blur-xs'
                                : isPaperSketch
                                ? 'bg-[#fdfcf0] border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                                : isIndustrial
                                ? 'bg-[#0F1115] border border-[rgba(226,232,240,0.15)] font-["JetBrains_Mono"]'
                                : isTechnical
                                ? 'bg-[#F8F7F4] border-[1.5px] border-[#111113] font-["JetBrains_Mono"]'
                                : isEditorial
                                ? 'bg-[#fcfbf9] border border-slate-300 font-serif'
                                : isDashboard
                                ? 'bg-slate-100 border border-slate-200'
                                : 'bg-[#dadadb]'
                        }`}
                    >
                        {/* Animated Sliding Indicator Pill */}
                        <div
                            className={`absolute top-[3px] bottom-[3px] transition-transform duration-200 ease-out pointer-events-none z-0 ${
                                isWinamp
                                    ? 'bg-[#00FF00] rounded-none'
                                    : isDark
                                    ? 'bg-[#2a2f3b] border border-white/10 shadow-[0px_3px_8px_rgba(0,0,0,0.35)] rounded-[8px]'
                                    : isVista
                                    ? 'bg-white/95 border border-white/80 shadow-[0px_3px_8px_rgba(14,116,224,0.18)] rounded-[8px]'
                                    : isPaperSketch
                                    ? 'bg-[#ff4747] border-2 border-[#2b2b2b] rounded-lg'
                                    : isIndustrial
                                    ? 'bg-[#2DD4BF]/20 border border-[#2DD4BF]/40 rounded-[4px]'
                                    : isTechnical
                                    ? 'bg-[#111113] rounded-none'
                                    : isEditorial
                                    ? 'bg-[#2a7373] rounded-lg'
                                    : isDashboard
                                    ? 'bg-[#297373] rounded-lg shadow-xs'
                                    : 'bg-white border-[0.5px] border-black/5 shadow-[0px_3px_8px_rgba(0,0,0,0.12),0px_3px_1px_rgba(0,0,0,0.04)] rounded-[8px]'
                            }`}
                            style={{
                                left: '3px',
                                width: 'calc((100% - 6px) / 3)',
                                transform: `translateX(${
                                    activeTab === 'account'
                                        ? '0%'
                                        : activeTab === 'shift'
                                        ? '100%'
                                        : '200%'
                                })`,
                            }}
                        />

                        {/* Tab 1: Akun */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('account')}
                            className={`relative z-10 w-full py-2 text-[11px] sm:text-xs font-bold text-center flex items-center justify-center transition-all duration-200 cursor-pointer whitespace-nowrap px-1 ${
                                activeTab === 'account'
                                    ? isWinamp
                                        ? 'text-black font-mono'
                                        : isDark
                                        ? 'text-white'
                                        : isVista
                                        ? 'text-sky-950'
                                        : isPaperSketch
                                        ? 'text-white font-["Gochi_Hand"] text-sm'
                                        : isIndustrial
                                        ? 'text-[#2DD4BF] font-["JetBrains_Mono"] uppercase'
                                        : isTechnical
                                        ? 'text-white font-["JetBrains_Mono"] uppercase'
                                        : isEditorial
                                        ? 'text-white'
                                        : isDashboard
                                        ? 'text-white'
                                        : 'text-slate-900'
                                    : isPaperSketch
                                    ? 'text-[#2b2b2b] font-["Gochi_Hand"] text-sm'
                                    : isIndustrial
                                    ? 'text-[#E2E8F0]/70 font-["JetBrains_Mono"] uppercase'
                                    : isTechnical
                                    ? 'text-[#111113]/70 font-["JetBrains_Mono"] uppercase'
                                    : 'opacity-60 hover:opacity-90'
                            }`}
                        >
                            Akun
                        </button>

                        {/* Tab 2: Shift */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('shift')}
                            className={`relative z-10 w-full py-2 text-[11px] sm:text-xs font-bold text-center flex items-center justify-center transition-all duration-200 cursor-pointer whitespace-nowrap px-1 ${
                                activeTab === 'shift'
                                    ? isWinamp
                                        ? 'text-black font-mono'
                                        : isDark
                                        ? 'text-white'
                                        : isVista
                                        ? 'text-sky-950'
                                        : isPaperSketch
                                        ? 'text-white font-["Gochi_Hand"] text-sm'
                                        : isIndustrial
                                        ? 'text-[#2DD4BF] font-["JetBrains_Mono"] uppercase'
                                        : isTechnical
                                        ? 'text-white font-["JetBrains_Mono"] uppercase'
                                        : isEditorial
                                        ? 'text-white'
                                        : isDashboard
                                        ? 'text-white'
                                        : 'text-slate-900'
                                    : isPaperSketch
                                    ? 'text-[#2b2b2b] font-["Gochi_Hand"] text-sm'
                                    : isIndustrial
                                    ? 'text-[#E2E8F0]/70 font-["JetBrains_Mono"] uppercase'
                                    : isTechnical
                                    ? 'text-[#111113]/70 font-["JetBrains_Mono"] uppercase'
                                    : 'opacity-60 hover:opacity-90'
                            }`}
                        >
                            Shift
                        </button>

                        {/* Tab 3: Impor & Reset (Digabung) */}
                        <button
                            type="button"
                            onClick={() => setActiveTab('import_reset')}
                            className={`relative z-10 w-full py-2 text-[11px] sm:text-xs font-bold text-center flex items-center justify-center transition-all duration-200 cursor-pointer whitespace-nowrap px-1 ${
                                activeTab === 'import_reset'
                                    ? isWinamp
                                        ? 'text-black font-mono'
                                        : isDark
                                        ? 'text-white'
                                        : isVista
                                        ? 'text-sky-950'
                                        : isPaperSketch
                                        ? 'text-white font-["Gochi_Hand"] text-sm'
                                        : isIndustrial
                                        ? 'text-[#2DD4BF] font-["JetBrains_Mono"] uppercase'
                                        : isTechnical
                                        ? 'text-white font-["JetBrains_Mono"] uppercase'
                                        : isEditorial
                                        ? 'text-white'
                                        : isDashboard
                                        ? 'text-white'
                                        : 'text-slate-900'
                                    : isPaperSketch
                                    ? 'text-[#2b2b2b] font-["Gochi_Hand"] text-sm'
                                    : isIndustrial
                                    ? 'text-[#E2E8F0]/70 font-["JetBrains_Mono"] uppercase'
                                    : isTechnical
                                    ? 'text-[#111113]/70 font-["JetBrains_Mono"] uppercase'
                                    : 'opacity-60 hover:opacity-90'
                            }`}
                        >
                            Impor & Reset
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="space-y-4">
                    {/* Tab 1: Akun Pegawai & Sesi Perangkat */}
                    {activeTab === 'account' && (
                        <AccountSettingsTab
                            theme={theme}
                            onShowToast={onShowToast}
                        />
                    )}

                    {/* Tab 2: Shift Studio & Konfigurasi Shift */}
                    {activeTab === 'shift' && (
                        <ShiftSettingsTab
                            daysState={daysState}
                            onShowToast={onShowToast}
                            theme={theme}
                        />
                    )}

                    {/* Tab 3: Impor Data Cadangan & Reset Hapus Data (Gabungan) */}
                    {activeTab === 'import_reset' && (
                        <div className="space-y-6">
                            {/* Bagian 1: Impor Data Cadangan JSON */}
                            <div className="p-4 rounded-xl border border-current/15 bg-current/5 space-y-3.5">
                                <div className="flex items-center justify-between border-b border-current/10 pb-2.5">
                                    <div className="flex items-center space-x-2">
                                        <Upload className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                        <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                                            Impor Data Cadangan (JSON)
                                        </h4>
                                    </div>
                                    <span className="text-[11px] opacity-70">
                                        Pulihkan Jadwal Shift
                                    </span>
                                </div>

                                <p className="text-xs opacity-75">
                                    Unggah berkas cadangan JSON atau tempel teks JSON untuk memulihkan jadwal shift kerja posko.
                                </p>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        accept=".json"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`px-4 py-2 text-xs font-bold flex items-center space-x-1.5 cursor-pointer ${s.accentBtn}`}
                                    >
                                        <Upload className="w-4 h-4" />
                                        <span>Pilih File JSON</span>
                                    </button>
                                </div>

                                <textarea
                                    rows={4}
                                    placeholder="Atau tempel isi file JSON cadangan di sini..."
                                    value={pastedJson}
                                    onChange={(e) => setPastedJson(e.target.value)}
                                    className={`w-full p-3 text-xs font-mono rounded-lg outline-none ${s.insetBox}`}
                                />

                                {importError && (
                                    <p className="text-xs text-rose-500 font-bold">{importError}</p>
                                )}

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                                    <div className="flex items-center space-x-4 text-xs opacity-80">
                                        <label className="flex items-center space-x-1.5 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="importMode"
                                                value="merge"
                                                checked={importMode === 'merge'}
                                                onChange={() => setImportMode('merge')}
                                            />
                                            <span>Gabungkan (Merge)</span>
                                        </label>
                                        <label className="flex items-center space-x-1.5 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="importMode"
                                                value="replace"
                                                checked={importMode === 'replace'}
                                                onChange={() => setImportMode('replace')}
                                            />
                                            <span>Timpa (Replace)</span>
                                        </label>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleExecuteImport}
                                        className={`px-5 py-2 text-xs font-bold cursor-pointer ${s.accentBtn}`}
                                    >
                                        Proses Impor
                                    </button>
                                </div>
                            </div>

                            {/* Bagian 2: Reset & Hapus Data Lokal */}
                            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-3.5">
                                <div className="flex items-center justify-between border-b border-rose-500/20 pb-2.5">
                                    <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
                                        <Trash2 className="w-4 h-4" />
                                        <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                                            Reset & Bersihkan Data Lokal
                                        </h4>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 uppercase border border-rose-500/30">
                                        Zona Berbahaya
                                    </span>
                                </div>

                                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 space-y-1">
                                    <div className="flex items-center space-x-2">
                                        <AlertTriangle className="w-4 h-4 shrink-0" />
                                        <h5 className="text-xs font-bold">Hapus Seluruh Data Jadwal Shift Lokal</h5>
                                    </div>
                                    <p className="text-xs opacity-90 leading-relaxed">
                                        Tindakan ini akan mengosongkan seluruh data jadwal shift lokal yang tersimpan di peramban ini. Pastikan Anda sudah mengekspor cadangan JSON sebelum melanjutkan.
                                    </p>
                                </div>

                                {!showResetConfirm ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowResetConfirm(true)}
                                        className="btn-glitch-delete px-4 py-2.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
                                        data-text="Hapus Seluruh Data"
                                    >
                                        <Trash2 className="w-4 h-4 shrink-0 relative z-10" />
                                        <span className="relative z-10">Hapus Seluruh Data</span>
                                    </button>
                                ) : (
                                    <div className="space-y-3 pt-1">
                                        <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                            Apakah Anda yakin ingin menghapus semua data jadwal secara permanen?
                                        </p>
                                        <div className="flex space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (onClearAllData) onClearAllData();
                                                    setShowResetConfirm(false);
                                                    onShowToast('Seluruh data lokal berhasil dibersihkan.');
                                                }}
                                                className="btn-glitch-delete px-4 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
                                                data-text="Ya, Hapus Semua"
                                            >
                                                <span className="relative z-10">Ya, Hapus Semua</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowResetConfirm(false)}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer ${s.outlineBtn}`}
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (isPageView) {
        return modalContent;
    }

    return (
        <div className="fixed inset-0 sm:top-7 z-150 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="fixed inset-0 sm:top-7" onClick={onClose} />
            <div className="relative z-10 w-full max-w-3xl">{modalContent}</div>
        </div>
    );
};

export default SettingsModal;
