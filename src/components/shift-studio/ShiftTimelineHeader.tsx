import React, { useState } from 'react';
import { ShiftGroupProfile } from '../../types';
import { Layers, Copy, History, ChevronDown, ChevronUp, Calendar, Plus, Check } from 'lucide-react';

interface ShiftTimelineHeaderProps {
    activeGroup: ShiftGroupProfile;
    allGroups: ShiftGroupProfile[];
    onSelectGroup: (groupId: string) => void;
    onCopyGroup: (sourceGroup: ShiftGroupProfile, newName: string, startDate: string) => void;
}

export const ShiftTimelineHeader: React.FC<ShiftTimelineHeaderProps> = ({
    activeGroup,
    allGroups,
    onSelectGroup,
    onCopyGroup,
}) => {
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
    const [copyName, setCopyName] = useState('');
    const [copyDate, setCopyDate] = useState('');

    const handleOpenCopy = () => {
        setCopyName(`${activeGroup.name} (Salinan)`);
        const today = new Date().toISOString().split('T')[0];
        setCopyDate(today);
        setIsCopyModalOpen(true);
    };

    const handleExecuteCopy = () => {
        if (!copyName.trim() || !copyDate) return;
        onCopyGroup(activeGroup, copyName.trim(), copyDate);
        setIsCopyModalOpen(false);
    };

    return (
        <div className="space-y-3">
            {/* Active Group Banner Card */}
            <div className="p-4 rounded-lg bg-teal-50/50 dark:bg-zinc-800/50 border border-teal-200/70 dark:border-zinc-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-teal-600 text-white shadow-xs shrink-0">
                        <Layers className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h3 className="text-sm sm:text-base font-black tracking-tight">{activeGroup.name}</h3>
                            <span className="px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-teal-500/15 text-teal-700 dark:text-teal-400 border border-teal-500/30 flex items-center space-x-1">
                                <Check className="w-3 h-3" />
                                <span>Aktif</span>
                            </span>
                        </div>
                        <p className="text-xs opacity-70 flex items-center space-x-1.5 mt-0.5">
                            <Calendar className="w-3.5 h-3.5 opacity-60" />
                            <span>Berlaku efektif sejak: <strong>{activeGroup.effectiveStartDate}</strong></span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={handleOpenCopy}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                    >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Kelompok Ini</span>
                    </button>
                    {allGroups.length > 1 && (
                        <button
                            type="button"
                            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 flex items-center space-x-1 cursor-pointer transition-colors"
                        >
                            <History className="w-3.5 h-3.5" />
                            <span>Riwayat ({allGroups.length})</span>
                            {isHistoryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                    )}
                </div>
            </div>

            {/* Collapsible History Table */}
            {isHistoryExpanded && allGroups.length > 1 && (
                <div className="p-3.5 rounded-2xl bg-current/5 border border-current/10 space-y-2 animate-in fade-in duration-200">
                    <span className="text-[10px] font-bold opacity-60 uppercase tracking-wider block">Linimasa Kelompok Shift:</span>
                    <div className="divide-y divide-current/10">
                        {allGroups.map((grp) => {
                            const isSelected = grp.id === activeGroup.id;
                            return (
                                <div
                                    key={grp.id}
                                    className="py-2 flex items-center justify-between text-xs"
                                >
                                    <div className="space-y-0.5">
                                        <span className="font-bold">{grp.name}</span>
                                        <span className="block text-[10px] opacity-60">Mulai berlaku: {grp.effectiveStartDate} ({grp.shifts.length} Shift)</span>
                                    </div>
                                    {isSelected ? (
                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/15 text-indigo-500">
                                            Sedang Diedit
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => onSelectGroup(grp.id)}
                                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-current/10 hover:bg-current/20 cursor-pointer"
                                        >
                                            Pilih & Edit
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Copy Group Modal */}
            {isCopyModalOpen && (
                <div className="fixed inset-0 z-160 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="fixed inset-0" onClick={() => setIsCopyModalOpen(false)} />
                    <div className="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
                        <div className="flex items-center space-x-2.5">
                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                                <Copy className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold">Salin Kelompok Shift Baru</h3>
                                <p className="text-[11px] opacity-60">Duplikasi seluruh konfigurasi shift aktif</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold block">Nama Kelompok Baru:</label>
                                <input
                                    type="text"
                                    value={copyName}
                                    onChange={(e) => setCopyName(e.target.value)}
                                    placeholder="Contoh: Aturan Jam Kerja Juni 2026"
                                    className="w-full p-2.5 text-xs rounded-xl border border-current/20 bg-current/5 outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold block">Tanggal Mulai Berlaku:</label>
                                <input
                                    type="date"
                                    value={copyDate}
                                    onChange={(e) => setCopyDate(e.target.value)}
                                    className="w-full p-2.5 text-xs rounded-xl border border-current/20 bg-current/5 outline-none focus:border-indigo-500 font-mono"
                                />
                                <p className="text-[10px] opacity-60">
                                    Kalender mulai tanggal ini ke depan akan otomatis menerapkan aturan baru ini.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <button
                                type="button"
                                onClick={() => setIsCopyModalOpen(false)}
                                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-current/10 hover:bg-current/20 cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleExecuteCopy}
                                className="px-5 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                            >
                                Buat Kelompok
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
