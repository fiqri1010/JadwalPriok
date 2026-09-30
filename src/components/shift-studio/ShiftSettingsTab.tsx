import React, { useState } from 'react';
import { ShiftGroupProfile, ShiftItemConfig, AppTheme, DayData, ActiveDateRange } from '../../types';
import { loadShiftGroups, saveShiftGroups } from '../../utils/shiftTimeline';
import { DEFAULT_SHIFT_GROUP } from '../../data/defaultShifts';
import { ShiftGroupProfilesSection } from './ShiftGroupProfilesSection';
import { ShiftListView } from './ShiftListView';
import { ShiftEditModal } from './ShiftEditModal';
import { ShiftDeleteConfirmModal } from './ShiftDeleteConfirmModal';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShiftSettingsTabProps {
    daysState: Record<string, DayData>;
    onShowToast: (msg: string) => void;
    theme?: AppTheme;
}

export const ShiftSettingsTab: React.FC<ShiftSettingsTabProps> = ({
    daysState,
    onShowToast,
    theme = 'default',
}) => {
    const [groups, setGroups] = useState<ShiftGroupProfile[]>(() => loadShiftGroups());
    const [activeGroupId, setActiveGroupId] = useState<string>(() => groups[0]?.id || DEFAULT_SHIFT_GROUP.id);

    // Level Navigasi: 'profiles' (Level 1: Profil Aturan Shift) | 'edit-profile' (Level 2: Edit List Shift Profil)
    // Diatur default membuka langsung daftar shift di dalam profil shift aktif
    const [editingGroupId, setEditingGroupId] = useState<string | null>(() => groups[0]?.id || DEFAULT_SHIFT_GROUP.id);

    // Modals untuk shift individual
    const [editingShift, setEditingShift] = useState<ShiftItemConfig | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [shiftToDelete, setShiftToDelete] = useState<ShiftItemConfig | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPetunjukExpanded, setIsPetunjukExpanded] = useState(false);

    // Profil yang sedang diedit (atau aktif jika belum dipilih)
    const currentGroupToEdit = groups.find((g) => g.id === (editingGroupId || activeGroupId)) || groups[0] || DEFAULT_SHIFT_GROUP;

    const handleUpdateGroupShifts = (groupId: string, newShifts: ShiftItemConfig[]) => {
        const updatedGroups = groups.map((g) => {
            if (g.id === groupId) {
                return { ...g, shifts: newShifts };
            }
            return g;
        });
        setGroups(updatedGroups);
        saveShiftGroups(updatedGroups);
    };

    const handleUpdateGroupDateRanges = (groupId: string, newRanges: ActiveDateRange[]) => {
        const updatedGroups = groups.map((g) => {
            if (g.id === groupId) {
                const earliestStart = newRanges.length > 0 ? newRanges[0].startDate : g.effectiveStartDate;
                return {
                    ...g,
                    dateRanges: newRanges,
                    effectiveStartDate: earliestStart || g.effectiveStartDate,
                };
            }
            return g;
        });
        setGroups(updatedGroups);
        saveShiftGroups(updatedGroups);
        onShowToast('Rentang tanggal aktivasi profil shift berhasil diperbarui.');
    };

    // Simpan hasil edit shift
    const handleSaveShift = (updatedShift: ShiftItemConfig) => {
        if (!currentGroupToEdit) return;
        const exists = currentGroupToEdit.shifts.some((s) => s.id === updatedShift.id);
        let newShifts: ShiftItemConfig[];
        if (exists) {
            newShifts = currentGroupToEdit.shifts.map((s) => (s.id === updatedShift.id ? updatedShift : s));
            onShowToast(`Shift "${updatedShift.naming.displayBadge}" berhasil diperbarui.`);
        } else {
            newShifts = [...currentGroupToEdit.shifts, updatedShift];
            onShowToast(`Shift baru "${updatedShift.naming.displayBadge}" berhasil ditambahkan.`);
        }
        handleUpdateGroupShifts(currentGroupToEdit.id, newShifts);
    };

    // Hapus shift
    const handleConfirmDelete = (shiftId: string, action: 'delete_all' | 'migrate', targetShiftId?: string) => {
        if (!currentGroupToEdit) return;
        const newShifts = currentGroupToEdit.shifts.filter((s) => s.id !== shiftId);
        handleUpdateGroupShifts(currentGroupToEdit.id, newShifts);
        onShowToast('Shift berhasil dihapus.');
    };

    // Toggle visibilitas shift
    const handleToggleVisibility = (shiftId: string) => {
        if (!currentGroupToEdit) return;
        const newShifts = currentGroupToEdit.shifts.map((s) => {
            if (s.id === shiftId) {
                return { ...s, isVisibleInDropdown: !s.isVisibleInDropdown };
            }
            return s;
        });
        handleUpdateGroupShifts(currentGroupToEdit.id, newShifts);
    };

    // Tambah shift baru
    const handleAddNewShift = () => {
        const newId = `SHIFT_CUSTOM_${Date.now()}`;
        const newShift: ShiftItemConfig = {
            id: newId,
            key: `CUSTOM_${Date.now()}`,
            naming: {
                fullName: 'Shift Kustom Baru',
                displayBadge: 'NEW',
                copyCode: 'NW',
                dropdownSublabel: '08.00 - 17.00',
            },
            workTime: {
                jamMasukDasar: '08:00',
                jamPulangDasar: '17:30',
                earliestFlexiIn: '07:30',
                latestFlexiIn: '08:30',
                earliestFlexiOut: '17:00',
                latestFlexiOut: '18:00',
                minLemburMinutes: 120,
                maxLemburMinutes: 180,
            },
            visual: {
                colorMode: 'solid',
                solidColor: '#0E7C7B',
                textColor: '#FFFFFF',
                borderColor: '#2EC4B6',
                gradientType: 'linear',
                gradientAngle: 135,
                colorStops: [
                    { color: '#2EC4B6', position: 0 },
                    { color: '#0E7C7B', position: 100 },
                ],
                patternType: 'none',
                patternOpacity: 20,
                iconType: 'svg',
                iconName: 'Sparkles',
            },
            isPiket: false,
            isVisibleInDropdown: true,
        };
        setEditingShift(newShift);
        setIsEditModalOpen(true);
    };

    // Kembalikan ke default di dalam menu edit
    const handleResetGroupToDefault = () => {
        if (!currentGroupToEdit) return;
        handleUpdateGroupShifts(currentGroupToEdit.id, JSON.parse(JSON.stringify(DEFAULT_SHIFT_GROUP.shifts)));
        onShowToast(`Daftar shift pada "${currentGroupToEdit.name}" dikembalikan ke standar bawaan.`);
    };

    // Duplikasi kelompok profil
    const handleCopyGroup = (sourceGroup: ShiftGroupProfile, newName: string, startDate?: string) => {
        const effectiveStart = startDate?.trim() || new Date().toISOString().split('T')[0];
        const newGroup: ShiftGroupProfile = {
            id: `GROUP_${Date.now()}`,
            name: newName,
            effectiveStartDate: effectiveStart,
            isActive: true,
            shifts: JSON.parse(JSON.stringify(sourceGroup.shifts)),
        };
        const updated = [...groups, newGroup];
        setGroups(updated);
        setActiveGroupId(newGroup.id);
        saveShiftGroups(updated);
        onShowToast(`Profil baru "${newName}" berhasil dibuat.`);
    };

    // Buat profil kelompok baru dari kosong/standar
    const handleCreateNewGroup = (name: string, startDate?: string) => {
        const effectiveStart = startDate?.trim() || new Date().toISOString().split('T')[0];
        const newGroup: ShiftGroupProfile = {
            id: `GROUP_${Date.now()}`,
            name,
            effectiveStartDate: effectiveStart,
            isActive: true,
            shifts: JSON.parse(JSON.stringify(DEFAULT_SHIFT_GROUP.shifts)),
        };
        const updated = [...groups, newGroup];
        setGroups(updated);
        setActiveGroupId(newGroup.id);
        saveShiftGroups(updated);
        onShowToast(`Profil "${name}" berhasil dibuat.`);
    };

    // Hapus profil kelompok
    const handleDeleteGroup = (groupToDelete: ShiftGroupProfile) => {
        if (groups.length <= 1) {
            onShowToast('Tidak dapat menghapus satu-satunya profil yang tersisa.');
            return;
        }
        const filtered = groups.filter((g) => g.id !== groupToDelete.id);
        setGroups(filtered);
        if (activeGroupId === groupToDelete.id) {
            setActiveGroupId(filtered[0]?.id || DEFAULT_SHIFT_GROUP.id);
        }
        if (editingGroupId === groupToDelete.id) {
            setEditingGroupId(null);
        }
        saveShiftGroups(filtered);
        onShowToast(`Profil "${groupToDelete.name}" berhasil dihapus.`);
    };

    // Ubah nama profil kelompok
    const handleRenameGroup = (groupId: string, newName: string) => {
        const trimmed = newName.trim();
        if (!trimmed) {
            onShowToast('Nama profil shift tidak boleh kosong.');
            return;
        }
        const updated = groups.map((g) => {
            if (g.id === groupId) {
                return { ...g, name: trimmed };
            }
            return g;
        });
        setGroups(updated);
        saveShiftGroups(updated);
        onShowToast(`Nama profil berhasil diubah menjadi "${trimmed}".`);
    };

    // Ekspor JSON
    const handleExportJson = () => {
        const jsonStr = JSON.stringify(groups, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Konfigurasi_Shift_Priok_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        onShowToast('Konfigurasi shift berhasil diekspor.');
    };

    // Impor JSON
    const handleImportJson = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const parsed = JSON.parse(evt.target?.result as string);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setGroups(parsed);
                        setActiveGroupId(parsed[0].id);
                        saveShiftGroups(parsed);
                        onShowToast('Konfigurasi shift berhasil diimpor.');
                    }
                } catch (err) {
                    onShowToast('Gagal membaca file JSON konfigurasi shift.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const isIndustrial = theme === 'industrial';
    const isPaperSketch = theme === 'paperSketch';
    const isEditorial = theme === 'editorial';
    const isTechnical = theme === 'technical';
    const isDashboard = theme === 'dashboard';

    return (
        <div className="space-y-4">
            {/* Tampilan Level 1: Profil Aturan Shift ATAU Level 2: Edit List Shift */}
            {editingGroupId ? (
                <ShiftListView
                    groupName={currentGroupToEdit.name}
                    effectiveStartDate={currentGroupToEdit.effectiveStartDate}
                    shifts={currentGroupToEdit.shifts}
                    onBack={() => setEditingGroupId(null)}
                    onEditShift={(s) => {
                        setEditingShift(s);
                        setIsEditModalOpen(true);
                    }}
                    onDeleteShift={(s) => {
                        setShiftToDelete(s);
                        setIsDeleteModalOpen(true);
                    }}
                    onToggleVisibility={handleToggleVisibility}
                    onAddNewShift={handleAddNewShift}
                    onResetToDefault={handleResetGroupToDefault}
                    onExportJson={handleExportJson}
                    onImportJson={handleImportJson}
                    onRenameProfile={(newName) => handleRenameGroup(currentGroupToEdit.id, newName)}
                    theme={theme}
                />
            ) : (
                <ShiftGroupProfilesSection
                    groups={groups}
                    activeGroupId={activeGroupId}
                    theme={theme}
                    onSelectGroup={(id) => {
                        setActiveGroupId(id);
                        onShowToast('Profil aturan shift aktif berhasil diperbarui.');
                    }}
                    onEditGroup={(grp) => {
                        setEditingGroupId(grp.id);
                    }}
                    onDeleteGroup={handleDeleteGroup}
                    onCopyGroup={handleCopyGroup}
                    onCreateNewGroup={handleCreateNewGroup}
                    onUpdateGroupDateRanges={handleUpdateGroupDateRanges}
                    onRenameGroup={handleRenameGroup}
                />
            )}

            {/* Petunjuk Absensi Collapsible / Folded Section */}
            <div className={`overflow-hidden transition-all border ${
                isIndustrial
                    ? 'bg-[#1A1D23] text-[#E2E8F0] border-[rgba(226,232,240,0.18)] font-[\'JetBrains_Mono\'] rounded-xl'
                    : isPaperSketch
                    ? 'bg-[#fdfcf0] text-[#2b2b2b] border-2 border-[#2b2b2b] font-[\'Gaegu\'] text-base rounded-2xl shadow-[4px_4px_0px_#2b2b2b]'
                    : isEditorial
                    ? 'bg-[#FCFBF9] text-[#1a1a1a] border border-[#1a1a1a]/25 font-serif rounded-xl shadow-xs'
                    : isTechnical
                    ? 'bg-[#F8F7F4] dark:bg-[#0D1117] text-[#111113] dark:text-[#E6EDF3] border border-slate-300 dark:border-slate-800 font-mono rounded-lg'
                    : isDashboard
                    ? 'bg-[#FFFBF0] text-[#4D2A00] border border-[#4D2A00]/25 rounded-xl shadow-2xs font-["Inter"]'
                    : 'rounded-xl border border-teal-200/80 dark:border-zinc-800 overflow-hidden bg-teal-50/40 dark:bg-zinc-800/40'
            }`}>
                <div
                    onClick={() => setIsPetunjukExpanded((prev) => !prev)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors select-none"
                >
                    <div className="flex items-center space-x-2.5">
                        <div className={`p-2 rounded-lg ${
                            isIndustrial
                                ? 'bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30'
                                : isPaperSketch
                                ? 'bg-[#ff4747] text-white border-2 border-[#2b2b2b]'
                                : isDashboard
                                ? 'bg-[#4D2A00] text-[#F9E6A8]'
                                : 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                        }`}>
                            <HelpCircle className="w-4 h-4" />
                        </div>
                        <div className="text-xs">
                            <span className="font-extrabold block">Petunjuk Absensi Kantor</span>
                            <span className="block text-[10.5px] opacity-75">Panduan bagaimana sistem membaca jam masuk & pulang serta dinas malam</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsPetunjukExpanded((prev) => !prev);
                        }}
                        className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-bold cursor-pointer shadow-xs transition-all active:scale-95 border ${
                            isIndustrial
                                ? 'bg-[#2DD4BF] text-[#0F1115] border-[#2DD4BF] rounded-[4px] font-extrabold'
                                : isPaperSketch
                                ? 'bg-[#ff4747] text-white border-2 border-[#2b2b2b] rounded-lg shadow-[2px_2px_0px_#2b2b2b]'
                                : isDashboard
                                ? 'bg-[#4D2A00] hover:bg-[#381B00] text-[#F9E6A8] border-[#4D2A00] rounded-none'
                                : 'bg-teal-600 hover:bg-teal-700 text-white rounded-lg border-teal-600'
                        }`}
                    >
                        <span>{isPetunjukExpanded ? 'Tutup Petunjuk' : 'Buka Petunjuk'}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isPetunjukExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Folded Body: Tampil Langsung di Bawah Section */}
                <AnimatePresence>
                    {isPetunjukExpanded && (
                        <motion.div
                            key="petunjuk-accordion-body"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                            className={`overflow-hidden border-t ${
                                isDashboard ? 'border-[#4D2A00]/20' : 'border-teal-200/60 dark:border-zinc-700/60'
                            }`}
                        >
                            <div className={`p-3.5 sm:p-4 space-y-3 ${
                                isDashboard ? 'bg-[#FFF0BE]/40' : 'bg-white/70 dark:bg-zinc-900/60'
                            }`}>
                                {/* Skenario 1 */}
                                <div className={`p-3 rounded-lg border space-y-2 ${
                                    isDashboard
                                        ? 'bg-[#FFFBF0] border-[#4D2A00]/25 text-[#4D2A00]'
                                        : 'bg-teal-50/50 dark:bg-zinc-800/50 border-teal-200/60 dark:border-zinc-700/60'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <h4 className={`text-xs font-bold ${isDashboard ? 'text-[#4D2A00]' : 'text-teal-700 dark:text-teal-400'}`}>
                                            Skenario 1: Hari OFF Setelah Shift Malam
                                        </h4>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                            isDashboard ? 'bg-[#4D2A00]/15 text-[#4D2A00]' : 'bg-teal-500/15 text-teal-700 dark:text-teal-400'
                                        }`}>
                                            Jam Pulang Kemarin
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                                        <div className={`p-2 rounded-lg border ${
                                            isDashboard ? 'bg-[#FFF0BE] border-[#4D2A00]/20' : 'bg-white/80 dark:bg-zinc-800 border-slate-200/70 dark:border-zinc-700'
                                        }`}>
                                            <span className="opacity-60 block text-[9px]">Data Mentah Kantor:</span>
                                            <div className="font-mono mt-0.5 font-bold">04:30</div>
                                        </div>
                                        <div className={`p-2 rounded-lg border ${
                                            isDashboard ? 'bg-[#FFF5D0] border-[#4D2A00]/30 text-[#4D2A00]' : 'bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-400'
                                        }`}>
                                            <span className="opacity-80 block text-[9px]">Hasil Terjemahan:</span>
                                            <div className="font-bold mt-0.5">Penutup Shift Kemarin & Tetap OFF</div>
                                        </div>
                                    </div>
                                    <p className="text-[10.5px] opacity-75 leading-relaxed">
                                        Sistem mengenali jam 04:30 sebagai jam pulang dinas shift malam kemarin, sehingga jadwal hari ini tetap murni OFF tanpa dianggap masuk kerja.
                                    </p>
                                </div>

                                {/* Skenario 2 */}
                                <div className={`p-3 rounded-lg border space-y-2 ${
                                    isDashboard
                                        ? 'bg-[#FFFBF0] border-[#4D2A00]/25 text-[#4D2A00]'
                                        : 'bg-amber-50/50 dark:bg-zinc-800/50 border-amber-200/60 dark:border-zinc-700/60'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <h4 className={`text-xs font-bold ${isDashboard ? 'text-[#4D2A00]' : 'text-amber-600 dark:text-amber-400'}`}>
                                            Skenario 2: Masuk Ekstra di Hari OFF / Libur
                                        </h4>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                            isDashboard ? 'bg-[#4D2A00]/15 text-[#4D2A00]' : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                                        }`}>
                                            Dinas di Hari Libur
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                                        <div className={`p-2 rounded-lg border ${
                                            isDashboard ? 'bg-[#FFF0BE] border-[#4D2A00]/20' : 'bg-white/80 dark:bg-zinc-800 border-slate-200/70 dark:border-zinc-700'
                                        }`}>
                                            <span className="opacity-60 block text-[9px]">Data Mentah Kantor:</span>
                                            <div className="font-mono mt-0.5 font-bold">Masuk: 08:00 | Pulang: 17:30</div>
                                        </div>
                                        <div className={`p-2 rounded-lg border ${
                                            isDashboard ? 'bg-[#FFF5D0] border-[#4D2A00]/30 text-[#4D2A00]' : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
                                        }`}>
                                            <span className="opacity-80 block text-[9px]">Hasil Terjemahan:</span>
                                            <div className="font-bold mt-0.5">Lembur Hari Libur Diaktifkan</div>
                                        </div>
                                    </div>
                                    <p className="text-[10.5px] opacity-75 leading-relaxed">
                                        Ketika terdapat pencatatan jam masuk dan pulang dinas pada hari libur, sistem mengenali Anda masuk dinas dan otomatis mengaktifkan perhitungan lembur hari libur.
                                    </p>
                                </div>

                                {/* Skenario 3 */}
                                <div className={`p-3 rounded-lg border space-y-2 ${
                                    isDashboard
                                        ? 'bg-[#FFFBF0] border-[#4D2A00]/25 text-[#4D2A00]'
                                        : 'bg-teal-50/50 dark:bg-zinc-800/50 border-teal-200/60 dark:border-zinc-700/60'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <h4 className={`text-xs font-bold ${isDashboard ? 'text-[#4D2A00]' : 'text-teal-700 dark:text-teal-400'}`}>
                                            Skenario 3: Shift Beruntun (Malam lanjut Pagi)
                                        </h4>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                            isDashboard ? 'bg-[#4D2A00]/15 text-[#4D2A00]' : 'bg-teal-500/15 text-teal-700 dark:text-teal-400'
                                        }`}>
                                            Transisi Flexi
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                                        <div className={`p-2 rounded-lg border ${
                                            isDashboard ? 'bg-[#FFF0BE] border-[#4D2A00]/20' : 'bg-white/80 dark:bg-zinc-800 border-slate-200/70 dark:border-zinc-700'
                                        }`}>
                                            <span className="opacity-60 block text-[9px]">Data Mentah Kantor:</span>
                                            <div className="font-mono mt-0.5 font-bold">Masuk: 04:30 | Pulang: 17:30</div>
                                        </div>
                                        <div className={`p-2 rounded-lg border ${
                                            isDashboard ? 'bg-[#FFF5D0] border-[#4D2A00]/30 text-[#4D2A00]' : 'bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-400'
                                        }`}>
                                            <span className="opacity-80 block text-[9px]">Hasil Terjemahan:</span>
                                            <div className="font-bold mt-0.5">04:30 Kemarin, 07:30-17:30 Hari Ini</div>
                                        </div>
                                    </div>
                                    <p className="text-[10.5px] opacity-75 leading-relaxed">
                                        Jam 04:30 dialokasikan menutup shift malam kemarin, sedangkan jam masuk hari ini dipatok ke batas awal flexi (07:30/08:00) sehingga total jam kerja 9.5 jam tercapai sempurna.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modals */}
            <ShiftEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                shift={editingShift}
                existingShifts={currentGroupToEdit.shifts}
                onSaveShift={handleSaveShift}
                theme={theme}
            />

            <ShiftDeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                shiftToDelete={shiftToDelete}
                availableShifts={currentGroupToEdit.shifts}
                onConfirmDelete={handleConfirmDelete}
                theme={theme}
            />
        </div>
    );
};

