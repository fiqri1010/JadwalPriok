import React, { useState } from 'react';
import {
    Sliders,
    Plus,
    Trash2,
    Edit3,
    Check,
    X,
    Clock,
    AlertCircle
} from 'lucide-react';
import {
    CustomShiftType,
    CeisaRule,
    CalculationMode,
    ValueType,
    AppTheme
} from '../types';
import { DEFAULT_CEISA_RULE } from '../lib/calculator';

interface RuleManagementViewProps {
    shiftTypes: CustomShiftType[];
    ceisaRules: CeisaRule[];
    theme?: AppTheme;
    onSaveShiftTypes: (list: CustomShiftType[]) => void;
    onSaveCeisaRules: (rules: CeisaRule[]) => void;
    onShowToast: (msg: string) => void;
}

export const RuleManagementView: React.FC<RuleManagementViewProps> = ({
    shiftTypes,
    ceisaRules,
    theme = 'default',
    onSaveShiftTypes,
    onSaveCeisaRules,
    onShowToast,
}) => {
    const [activeSubTab, setActiveSubTab] = useState<'shifts' | 'rules'>('shifts');

    // Edit / Add Shift State
    const [editingShift, setEditingShift] = useState<CustomShiftType | null>(null);
    const [isAddingShift, setIsAddingShift] = useState<boolean>(false);

    // Edit / Add Rule State
    const [editingRule, setEditingRule] = useState<CeisaRule | null>(null);
    const [isAddingRule, setIsAddingRule] = useState<boolean>(false);
    const [selectedShiftForRule, setSelectedShiftForRule] = useState<string>('Graha');

    const isDark = theme === 'dark';
    const isVista = theme === 'vista';
    const isWinamp = theme === 'winamp';

    // Theme-aware tokens
    const containerClass = isWinamp
        ? 'bg-black border-2 border-[#333333] text-[#00FF00] font-mono rounded-none'
        : isDark
            ? 'bg-[#181818] border-[#333333] text-slate-100 rounded-2xl'
            : isVista
                ? 'bg-white/40 backdrop-blur-md border-white/60 text-[#0F172A] rounded-2xl shadow-lg'
                : 'bg-white border-[#E2E8F0] text-[#011627] rounded-2xl shadow-xs';

    const subCardClass = isWinamp
        ? 'bg-black border border-zinc-700 text-[#00FF00] rounded-none'
        : isDark
            ? 'bg-[#202020] border-[#333333] text-slate-100 rounded-xl'
            : isVista
                ? 'bg-white/60 backdrop-blur-xs border-white/50 text-slate-900 rounded-xl'
                : 'bg-slate-50 border-slate-200 text-slate-900 rounded-xl';

    const tabActiveClass = isWinamp
        ? 'bg-[#00FF00] text-black font-black rounded-none'
        : isDark
            ? 'bg-indigo-600 text-white font-bold rounded-lg'
            : isVista
                ? 'bg-white/80 text-blue-900 font-black rounded-lg shadow-xs'
                : 'bg-[#2EC4B6] text-white font-bold rounded-lg shadow-xs';

    const tabInactiveClass = isWinamp
        ? 'text-[#00FF00] hover:bg-zinc-900 rounded-none'
        : isDark
            ? 'text-slate-400 hover:text-white rounded-lg'
            : isVista
                ? 'text-slate-700 hover:text-slate-950 rounded-lg'
                : 'text-slate-600 hover:text-slate-900 rounded-lg';

    // -------------------------------------------------------------
    // SHIFT MANAGEMENT HANDLERS
    // -------------------------------------------------------------
    const handleSaveShift = (shift: CustomShiftType) => {
        const list = [...shiftTypes];
        const idx = list.findIndex((s) => s.id === shift.id);
        if (idx >= 0) {
            list[idx] = shift;
        } else {
            list.push(shift);
        }
        onSaveShiftTypes(list);
        setEditingShift(null);
        setIsAddingShift(false);
        onShowToast(`Shift "${shift.name}" berhasil disimpan.`);
    };

    const handleDeleteShift = (id: string) => {
        if (window.confirm(`Hapus shift "${id}"?`)) {
            const list = shiftTypes.filter((s) => s.id !== id);
            onSaveShiftTypes(list);
            onShowToast(`Shift "${id}" telah dihapus.`);
        }
    };

    // -------------------------------------------------------------
    // CEISA RULE MANAGEMENT HANDLERS (EFFECTIVE DATING)
    // -------------------------------------------------------------
    const handleSaveRule = (rule: CeisaRule) => {
        const list = [...ceisaRules];
        const idx = list.findIndex((r) => r.id === rule.id);
        if (idx >= 0) {
            list[idx] = rule;
        } else {
            list.push(rule);
        }
        // Urutkan berdasarkan tanggal berlaku efektif ascending
        list.sort((a, b) => a.tanggal_berlaku_efektif.localeCompare(b.tanggal_berlaku_efektif));
        onSaveCeisaRules(list);
        setEditingRule(null);
        setIsAddingRule(false);
        onShowToast(`Aturan "${rule.nama_rule}" berhasil disimpan.`);
    };

    const handleDeleteRule = (id: string) => {
        if (ceisaRules.length <= 1) {
            alert('Minimal harus ada 1 aturan CEISA yang aktif.');
            return;
        }
        if (window.confirm(`Hapus aturan evaluasi ini?`)) {
            const list = ceisaRules.filter((r) => r.id !== id);
            onSaveCeisaRules(list);
            onShowToast(`Aturan telah dihapus.`);
        }
    };

    return (
        <div className="space-y-4 max-w-6xl mx-auto animate-in fade-in duration-200">
            {/* 1. Top Header & Sub-Tab Switcher */}
            <div className={`p-4 sm:p-5 border ${containerClass}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-2.5">
                        <span className={`p-2 ${isWinamp ? 'bg-black border border-[#00FF00]' : 'rounded-xl bg-[#2EC4B6]/20 text-[#2EC4B6]'}`}>
                            <Sliders className="h-5 w-5" />
                        </span>
                        <div>
                            <h2 className="text-base sm:text-lg font-black tracking-tight">
                                Hyper-Dynamic Rule & Shift Engine
                            </h2>
                            <p className="text-xs opacity-75">
                                Konfigurasi dinamis jenis shift, warna tampilan, dan aturan penilaian CEISA berintegritas historis
                            </p>
                        </div>
                    </div>

                    <div className={`flex items-center p-1 border rounded-xl shrink-0 ${isWinamp ? 'rounded-none border-zinc-700 bg-black' : 'bg-slate-100/80 border-slate-200'}`}>
                        <button
                            type="button"
                            onClick={() => setActiveSubTab('shifts')}
                            className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'shifts' ? tabActiveClass : tabInactiveClass
                                }`}
                        >
                            Manajemen Shift ({shiftTypes.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveSubTab('rules')}
                            className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'rules' ? tabActiveClass : tabInactiveClass
                                }`}
                        >
                            Aturan Penilaian CEISA ({ceisaRules.length})
                        </button>
                    </div>
                </div>
            </div>

            {/* =============================================================
          SUB-TAB 1: MANAJEMEN SHIFT DINAMIS (CRUD)
          ============================================================= */}
            {activeSubTab === 'shifts' && (
                <div className={`p-4 sm:p-5 border space-y-4 ${containerClass}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm sm:text-base font-black">Daftar Jenis Shift & Warna</h3>
                            <p className="text-xs opacity-75">
                                Nilai dan warna ini otomatis digunakan di seluruh dropdown kalender, form detail, dan tabel rekapitulasi.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setEditingShift({
                                    id: `SHIFT_${Date.now().toString().slice(-4)}`,
                                    name: '',
                                    shortCode: '',
                                    bgColor: '#EDF6F9',
                                    textColor: '#011627',
                                    orderIndex: shiftTypes.length + 1,
                                    isActive: true,
                                });
                                setIsAddingShift(true);
                            }}
                            className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${isWinamp
                                    ? 'bg-black border-2 border-[#00FF00] text-[#00FF00] rounded-none hover:bg-[#00FF00] hover:text-black'
                                    : 'rounded-xl bg-[#2EC4B6] hover:bg-[#25a397] text-white shadow-xs'
                                }`}
                        >
                            <Plus className="h-4 w-4" />
                            <span>Tambah Shift Baru</span>
                        </button>
                    </div>

                    {/* Form Modal / Inline Editor untuk Shift */}
                    {(isAddingShift || editingShift) && editingShift && (
                        <div className={`p-4 border animate-in zoom-in-95 duration-150 space-y-3 ${subCardClass}`}>
                            <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-xs font-black">
                                    {isAddingShift ? 'Tambah Jenis Shift Baru' : `Edit Shift: ${editingShift.name}`}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingShift(null);
                                        setIsAddingShift(false);
                                    }}
                                    className="text-xs font-bold text-slate-400 hover:text-rose-500 cursor-pointer"
                                >
                                    Batal
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold block mb-1">ID Shift (Unik / Huruf Besar)</label>
                                    <input
                                        type="text"
                                        value={editingShift.id}
                                        disabled={!isAddingShift}
                                        onChange={(e) => setEditingShift({ ...editingShift, id: e.target.value.trim() })}
                                        className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border bg-white text-slate-900 border-slate-300 outline-none"
                                        placeholder="Contoh: GRAHA"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold block mb-1">Nama Tampilan Shift</label>
                                    <input
                                        type="text"
                                        value={editingShift.name}
                                        onChange={(e) => setEditingShift({ ...editingShift, name: e.target.value })}
                                        className="w-full px-2.5 py-1.5 text-xs font-bold rounded border bg-white text-slate-900 border-slate-300 outline-none"
                                        placeholder="Contoh: Graha"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold block mb-1">Kode Singkat (Mobile / Excel)</label>
                                    <input
                                        type="text"
                                        maxLength={4}
                                        value={editingShift.shortCode}
                                        onChange={(e) => setEditingShift({ ...editingShift, shortCode: e.target.value.toUpperCase() })}
                                        className="w-full px-2.5 py-1.5 text-xs font-bold font-mono text-center rounded border bg-white text-slate-900 border-slate-300 outline-none"
                                        placeholder="G"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold block mb-1">Warna Background & Teks (Hex)</label>
                                    <div className="flex items-center space-x-1.5">
                                        <input
                                            type="color"
                                            value={editingShift.bgColor}
                                            onChange={(e) => setEditingShift({ ...editingShift, bgColor: e.target.value })}
                                            className="h-8 w-10 rounded border border-slate-300 p-0.5 cursor-pointer"
                                            title="Warna Background"
                                        />
                                        <input
                                            type="color"
                                            value={editingShift.textColor}
                                            onChange={(e) => setEditingShift({ ...editingShift, textColor: e.target.value })}
                                            className="h-8 w-10 rounded border border-slate-300 p-0.5 cursor-pointer"
                                            title="Warna Teks"
                                        />
                                        {/* Preview Chip */}
                                        <span
                                            style={{ backgroundColor: editingShift.bgColor, color: editingShift.textColor }}
                                            className="flex-1 text-center py-1.5 px-2 rounded text-xs font-black truncate shadow-2xs border border-white/40"
                                        >
                                            {editingShift.name || 'Preview'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!editingShift.id || !editingShift.name) {
                                            alert('ID dan Nama Shift tidak boleh kosong!');
                                            return;
                                        }
                                        handleSaveShift(editingShift);
                                    }}
                                    className={`px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${isWinamp
                                            ? 'bg-black border border-[#00FF00] text-[#00FF00]'
                                            : 'rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                        }`}
                                >
                                    Simpan Jenis Shift
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tabel Shift */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b font-black opacity-80">
                                    <th className="py-2.5 px-3">No</th>
                                    <th className="py-2.5 px-3">ID Shift</th>
                                    <th className="py-2.5 px-3">Nama Shift</th>
                                    <th className="py-2.5 px-3 text-center">Singkatan</th>
                                    <th className="py-2.5 px-3 text-center">Tampilan Chip Kalender</th>
                                    <th className="py-2.5 px-3">Warna Hex</th>
                                    <th className="py-2.5 px-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/50">
                                {shiftTypes.map((sh, idx) => (
                                    <tr key={sh.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                        <td className="py-2.5 px-3 font-mono opacity-60">{idx + 1}</td>
                                        <td className="py-2.5 px-3 font-mono font-bold">{sh.id}</td>
                                        <td className="py-2.5 px-3 font-bold">{sh.name}</td>
                                        <td className="py-2.5 px-3 text-center font-mono font-black">{sh.shortCode}</td>
                                        <td className="py-2.5 px-3 text-center">
                                            <span
                                                style={{ backgroundColor: sh.bgColor, color: sh.textColor }}
                                                className="inline-block px-2.5 py-0.5 rounded text-[11px] font-black border border-white/40 shadow-2xs"
                                            >
                                                {sh.name}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-3 font-mono text-[11px]">
                                            Bg: {sh.bgColor} | Teks: {sh.textColor}
                                        </td>
                                        <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingShift({ ...sh });
                                                    setIsAddingShift(false);
                                                }}
                                                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-indigo-500 cursor-pointer"
                                                title="Edit Shift"
                                            >
                                                <Edit3 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteShift(sh.id)}
                                                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-rose-500 cursor-pointer"
                                                title="Hapus Shift"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* =============================================================
          SUB-TAB 2: ATURAN PENILAIAN CEISA (EFFECTIVE DATING ENGINE)
          ============================================================= */}
            {activeSubTab === 'rules' && (
                <div className={`p-4 sm:p-5 border space-y-4 ${containerClass}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h3 className="text-sm sm:text-base font-black">
                                Daftar Aturan Evaluasi CEISA (Integritas Historis)
                            </h3>
                            <p className="text-xs opacity-75">
                                Setiap aturan memiliki tanggal berlaku efektif. Penilaian bulan lalu akan selalu menggunakan aturan yang aktif di masa lalu.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setEditingRule({
                                    id: `rule-${Date.now().toString().slice(-4)}`,
                                    nama_rule: 'Aturan Baru 2026',
                                    tanggal_berlaku_efektif: new Date().toISOString().slice(0, 10),
                                    metode_kalkulasi: 'AVERAGE',
                                    tipe_nilai: 'SKALA',
                                    rule_detail: JSON.parse(JSON.stringify(DEFAULT_CEISA_RULE.rule_detail)),
                                });
                                setIsAddingRule(true);
                            }}
                            className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${isWinamp
                                    ? 'bg-black border-2 border-[#00FF00] text-[#00FF00] rounded-none hover:bg-[#00FF00] hover:text-black'
                                    : 'rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                                }`}
                        >
                            <Plus className="h-4 w-4" />
                            <span>Buat Aturan Baru</span>
                        </button>
                    </div>

                    {/* Form Editor Rule CEISA */}
                    {(isAddingRule || editingRule) && editingRule && (
                        <div className={`p-4 border animate-in zoom-in-95 duration-150 space-y-4 ${subCardClass}`}>
                            <div className="flex items-center justify-between border-b pb-2">
                                <span className="text-xs font-black">
                                    {isAddingRule ? 'Buat Aturan Evaluasi Baru' : `Edit Aturan: ${editingRule.nama_rule}`}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingRule(null);
                                        setIsAddingRule(false);
                                    }}
                                    className="text-xs font-bold text-slate-400 hover:text-rose-500 cursor-pointer"
                                >
                                    Batal
                                </button>
                            </div>

                            {/* Parameter Pokok Rule */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <div>
                                    <label className="text-[10px] font-bold block mb-1">Nama Aturan</label>
                                    <input
                                        type="text"
                                        value={editingRule.nama_rule}
                                        onChange={(e) => setEditingRule({ ...editingRule, nama_rule: e.target.value })}
                                        className="w-full px-2.5 py-1.5 text-xs font-bold rounded border bg-white text-slate-900 border-slate-300 outline-none"
                                        placeholder="Contoh: Aturan CEISA 2026"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold block mb-1">Tanggal Berlaku Efektif</label>
                                    <input
                                        type="date"
                                        value={editingRule.tanggal_berlaku_efektif}
                                        onChange={(e) => setEditingRule({ ...editingRule, tanggal_berlaku_efektif: e.target.value })}
                                        className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border bg-white text-slate-900 border-slate-300 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold block mb-1">Metode Kalkulasi</label>
                                    <select
                                        value={editingRule.metode_kalkulasi}
                                        onChange={(e) => setEditingRule({ ...editingRule, metode_kalkulasi: e.target.value as CalculationMode })}
                                        className="w-full px-2.5 py-1.5 text-xs font-bold rounded border bg-white text-slate-900 border-slate-300 outline-none cursor-pointer"
                                    >
                                        <option value="AVERAGE">RATA-RATA (AVERAGE)</option>
                                        <option value="SUM">TOTAL AKUMULASI (SUM)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold block mb-1">Tipe Nilai</label>
                                    <select
                                        value={editingRule.tipe_nilai}
                                        onChange={(e) => setEditingRule({ ...editingRule, tipe_nilai: e.target.value as ValueType })}
                                        className="w-full px-2.5 py-1.5 text-xs font-bold rounded border bg-white text-slate-900 border-slate-300 outline-none cursor-pointer"
                                    >
                                        <option value="SKALA">SKALA NILAI (misal: 1 s.d. 4)</option>
                                        <option value="PERSENTASE">PERSENTASE (misal: 0% s.d. 100%)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Thresholds Builder Per Shift */}
                            <div className="pt-2 border-t space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs font-bold">Pilih Shift yang Dikonfigurasi:</span>
                                        <select
                                            value={selectedShiftForRule}
                                            onChange={(e) => setSelectedShiftForRule(e.target.value)}
                                            className="px-2 py-1 text-xs font-bold rounded border bg-white text-slate-900 border-slate-300 outline-none cursor-pointer"
                                        >
                                            {shiftTypes.map((s) => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            const currentDetail = { ...editingRule.rule_detail };
                                            if (!currentDetail.shifts[selectedShiftForRule]) {
                                                currentDetail.shifts[selectedShiftForRule] = { multiplier: 1.0, thresholds: [] };
                                            }
                                            currentDetail.shifts[selectedShiftForRule].thresholds.push({
                                                max_time: '08:00',
                                                score: editingRule.tipe_nilai === 'PERSENTASE' ? 100 : 4,
                                                name: 'Tepat Waktu',
                                            });
                                            setEditingRule({ ...editingRule, rule_detail: currentDetail });
                                        }}
                                        className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded border border-indigo-200 cursor-pointer"
                                    >
                                        <Plus className="h-3 w-3" />
                                        <span>Tambah Batas Waktu ({selectedShiftForRule})</span>
                                    </button>
                                </div>

                                {/* Daftar Batas Waktu (Thresholds) untuk Shift Terpilih */}
                                {(() => {
                                    const shiftConfig = editingRule.rule_detail?.shifts?.[selectedShiftForRule] || {
                                        multiplier: 1.0,
                                        thresholds: [],
                                    };

                                    return (
                                        <div className="space-y-2 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-slate-200/60">
                                            <div className="flex items-center space-x-4 text-xs font-bold">
                                                <label className="flex items-center space-x-1.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(shiftConfig.is_exempt)}
                                                        onChange={(e) => {
                                                            const currentDetail = { ...editingRule.rule_detail };
                                                            if (!currentDetail.shifts[selectedShiftForRule]) {
                                                                currentDetail.shifts[selectedShiftForRule] = { multiplier: 1.0, thresholds: [] };
                                                            }
                                                            currentDetail.shifts[selectedShiftForRule].is_exempt = e.target.checked;
                                                            setEditingRule({ ...editingRule, rule_detail: currentDetail });
                                                        }}
                                                    />
                                                    <span>Kecualikan dari Penilaian (Tidak Dinilai)</span>
                                                </label>

                                                <label className="flex items-center space-x-1.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(shiftConfig.is_auto_max)}
                                                        onChange={(e) => {
                                                            const currentDetail = { ...editingRule.rule_detail };
                                                            if (!currentDetail.shifts[selectedShiftForRule]) {
                                                                currentDetail.shifts[selectedShiftForRule] = { multiplier: 1.0, thresholds: [] };
                                                            }
                                                            currentDetail.shifts[selectedShiftForRule].is_auto_max = e.target.checked;
                                                            setEditingRule({ ...editingRule, rule_detail: currentDetail });
                                                        }}
                                                    />
                                                    <span>Otomatis Nilai Maksimum (Bebas Jam Absen)</span>
                                                </label>
                                            </div>

                                            {!shiftConfig.is_exempt && !shiftConfig.is_auto_max && (
                                                <div className="space-y-2 pt-1">
                                                    {shiftConfig.thresholds.length === 0 ? (
                                                        <p className="text-[11px] text-slate-400 italic">Belum ada batas waktu. Klik &quot;Tambah Batas Waktu&quot; di atas.</p>
                                                    ) : (
                                                        shiftConfig.thresholds.map((th, thIdx) => (
                                                            <div key={thIdx} className="flex items-center gap-2">
                                                                <span className="text-xs font-bold w-12">Batas {thIdx + 1}:</span>
                                                                <input
                                                                    type="time"
                                                                    value={th.max_time}
                                                                    onChange={(e) => {
                                                                        const currentDetail = { ...editingRule.rule_detail };
                                                                        currentDetail.shifts[selectedShiftForRule].thresholds[thIdx].max_time = e.target.value;
                                                                        setEditingRule({ ...editingRule, rule_detail: currentDetail });
                                                                    }}
                                                                    className="px-2 py-1 text-xs font-mono font-bold rounded border bg-white text-slate-900 border-slate-300"
                                                                />
                                                                <span className="text-xs font-bold">Skor:</span>
                                                                <input
                                                                    type="number"
                                                                    value={th.score}
                                                                    onChange={(e) => {
                                                                        const currentDetail = { ...editingRule.rule_detail };
                                                                        currentDetail.shifts[selectedShiftForRule].thresholds[thIdx].score = parseFloat(e.target.value) || 0;
                                                                        setEditingRule({ ...editingRule, rule_detail: currentDetail });
                                                                    }}
                                                                    className="w-20 px-2 py-1 text-xs font-mono font-bold text-center rounded border bg-white text-slate-900 border-slate-300"
                                                                />
                                                                <span className="text-xs font-bold">Label Grade:</span>
                                                                <input
                                                                    type="text"
                                                                    value={th.name}
                                                                    onChange={(e) => {
                                                                        const currentDetail = { ...editingRule.rule_detail };
                                                                        currentDetail.shifts[selectedShiftForRule].thresholds[thIdx].name = e.target.value;
                                                                        setEditingRule({ ...editingRule, rule_detail: currentDetail });
                                                                    }}
                                                                    className="flex-1 px-2 py-1 text-xs font-bold rounded border bg-white text-slate-900 border-slate-300"
                                                                    placeholder="Contoh: Sangat Patuh"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const currentDetail = { ...editingRule.rule_detail };
                                                                        currentDetail.shifts[selectedShiftForRule].thresholds.splice(thIdx, 1);
                                                                        setEditingRule({ ...editingRule, rule_detail: currentDetail });
                                                                    }}
                                                                    className="p-1 text-rose-500 hover:bg-rose-100 rounded cursor-pointer"
                                                                    title="Hapus Batas"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!editingRule.nama_rule || !editingRule.tanggal_berlaku_efektif) {
                                            alert('Nama aturan dan tanggal berlaku efektif wajib diisi!');
                                            return;
                                        }
                                        handleSaveRule(editingRule);
                                    }}
                                    className={`px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${isWinamp
                                            ? 'bg-black border border-[#00FF00] text-[#00FF00]'
                                            : 'rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                                        }`}
                                >
                                    Simpan Aturan CEISA
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Tabel Daftar Aturan Aktif */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b font-black opacity-80">
                                    <th className="py-2.5 px-3">Tanggal Efektif</th>
                                    <th className="py-2.5 px-3">Nama Aturan</th>
                                    <th className="py-2.5 px-3 text-center">Tipe Nilai</th>
                                    <th className="py-2.5 px-3 text-center">Metode</th>
                                    <th className="py-2.5 px-3">Shift Dikonfigurasi</th>
                                    <th className="py-2.5 px-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/50">
                                {ceisaRules.map((rule) => {
                                    const shiftCount = Object.keys(rule.rule_detail?.shifts || {}).length;
                                    return (
                                        <tr key={rule.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                                {rule.tanggal_berlaku_efektif}
                                            </td>
                                            <td className="py-2.5 px-3 font-bold">{rule.nama_rule}</td>
                                            <td className="py-2.5 px-3 text-center">
                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${rule.tipe_nilai === 'PERSENTASE' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-blue-100 text-blue-900 border border-blue-300'
                                                    }`}>
                                                    {rule.tipe_nilai}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 text-center font-mono font-bold">{rule.metode_kalkulasi}</td>
                                            <td className="py-2.5 px-3 font-medium opacity-80">{shiftCount} Jenis Shift</td>
                                            <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingRule(JSON.parse(JSON.stringify(rule)));
                                                        setIsAddingRule(false);
                                                    }}
                                                    className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-indigo-500 cursor-pointer"
                                                    title="Edit Aturan"
                                                >
                                                    <Edit3 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteRule(rule.id)}
                                                    className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-rose-500 cursor-pointer"
                                                    title="Hapus Aturan"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};