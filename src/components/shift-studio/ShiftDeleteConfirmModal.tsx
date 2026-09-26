import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Trash2, ArrowRightLeft } from 'lucide-react';
import { ShiftItemConfig } from '../../types';
import { CustomDropdown } from '../common/CustomDropdown';

interface ShiftDeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    shiftToDelete: ShiftItemConfig | null;
    availableShifts: ShiftItemConfig[];
    onConfirmDelete: (shiftId: string, action: 'delete_all' | 'migrate', targetShiftId?: string) => void;
}

export const ShiftDeleteConfirmModal: React.FC<ShiftDeleteConfirmModalProps> = ({
    isOpen,
    onClose,
    shiftToDelete,
    availableShifts,
    onConfirmDelete,
}) => {
    const [action, setAction] = useState<'delete_all' | 'migrate'>('migrate');
    const [targetShiftId, setTargetShiftId] = useState<string>('');

    if (!isOpen || !shiftToDelete) return null;

    const remainingShifts = availableShifts.filter((s) => s.id !== shiftToDelete.id);

    const handleExecute = () => {
        onConfirmDelete(shiftToDelete.id, action, action === 'migrate' ? (targetShiftId || remainingShifts[0]?.id) : undefined);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="fixed inset-0" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md rounded-lg bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200/90 dark:border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-current/10">
                    <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-bold">Konfirmasi Hapus Shift</h3>
                            <p className="text-[11px] opacity-60 truncate max-w-[240px]">{shiftToDelete.naming.fullName}</p>
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

                {/* Body Content */}
                <div className="p-4 space-y-3.5">
                    <p className="text-xs leading-relaxed opacity-85">
                        Apakah Anda ingin menghapus shift <strong>{shiftToDelete.naming.fullName} ({shiftToDelete.naming.displayBadge})</strong>? Jika shift ini sudah pernah dicatat di kalender, silakan tentukan tindakan:
                    </p>

                    <div className="space-y-2">
                        {/* Opsi 1: Alihkan ke Shift Lain */}
                        <label className="flex items-start space-x-3 p-3 rounded-lg border border-current/15 hover:border-teal-500 cursor-pointer transition-all">
                            <input
                                type="radio"
                                name="deleteAction"
                                checked={action === 'migrate'}
                                onChange={() => setAction('migrate')}
                                className="mt-0.5 text-teal-600"
                            />
                            <div className="space-y-1.5 flex-1">
                                <div className="text-xs font-bold flex items-center space-x-1.5">
                                    <ArrowRightLeft className="w-3.5 h-3.5 text-teal-600" />
                                    <span>Alihkan Jadwal yang Ada ke Shift Lain (Disarankan)</span>
                                </div>
                                <p className="text-[10px] opacity-60">
                                    Semua tanggal di kalender yang memakai shift ini akan otomatis diubah ke shift tujuan di bawah.
                                </p>

                                {action === 'migrate' && remainingShifts.length > 0 && (
                                    <div className="mt-1.5">
                                        <CustomDropdown
                                            value={targetShiftId || remainingShifts[0]?.id || ''}
                                            onChange={(val) => setTargetShiftId(String(val))}
                                            options={remainingShifts.map((s) => ({
                                                value: s.id,
                                                label: `${s.naming.displayBadge} - ${s.naming.fullName}`,
                                            }))}
                                            hideSelectedInList={false}
                                        />
                                    </div>
                                )}
                            </div>
                        </label>

                        {/* Opsi 2: Hapus Seluruh Riwayat Terkait */}
                        <label className="flex items-start space-x-3 p-3 rounded-lg border border-current/15 hover:border-rose-500 cursor-pointer transition-all">
                            <input
                                type="radio"
                                name="deleteAction"
                                checked={action === 'delete_all'}
                                onChange={() => setAction('delete_all')}
                                className="mt-0.5 text-rose-600"
                            />
                            <div className="space-y-1 flex-1">
                                <div className="text-xs font-bold text-rose-500 flex items-center space-x-1.5">
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus Seluruh Jadwal Terkait (Kosongkan Tanggal)</span>
                                </div>
                                <p className="text-[10px] opacity-60">
                                    Tanggal yang memakai shift ini di kalender akan diubah menjadi jadwal kosong.
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-current/10 flex justify-between items-center bg-current/5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 cursor-pointer transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleExecute}
                        className="px-5 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs transition-all active:scale-95"
                    >
                        Ya, Hapus Shift
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
