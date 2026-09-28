import React, { useState } from 'react';
import { X, FileSpreadsheet, CheckCircle2, AlertCircle, Palette } from 'lucide-react';
import { ShiftItemConfig } from '../../types';
import { CustomDropdown } from '../common/CustomDropdown';

interface DetectedExcelColor {
    hex: string;
    sampleText?: string;
    matchedShiftId?: string;
    count: number;
}

interface ExcelColorMappingDialogProps {
    isOpen: boolean;
    onClose: () => void;
    detectedColors: DetectedExcelColor[];
    availableShifts: ShiftItemConfig[];
    onApplyMapping: (mapping: Record<string, string>) => void;
}

export const ExcelColorMappingDialog: React.FC<ExcelColorMappingDialogProps> = ({
    isOpen,
    onClose,
    detectedColors,
    availableShifts,
    onApplyMapping,
}) => {
    const [mapping, setMapping] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        detectedColors.forEach((dc) => {
            if (dc.matchedShiftId) {
                initial[dc.hex] = dc.matchedShiftId;
            }
        });
        return initial;
    });

    if (!isOpen) return null;

    const handleSelectShift = (hex: string, shiftId: string) => {
        setMapping((prev) => ({
            ...prev,
            [hex]: shiftId,
        }));
    };

    const handleSave = () => {
        onApplyMapping(mapping);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-160 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="fixed inset-0" onClick={onClose} />
            <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-current/10 shrink-0">
                    <div className="flex items-center space-x-2.5">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                            <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-bold">Pemetaan Warna Excel</h3>
                            <p className="text-[11px] opacity-60">Pencocokan Otomatis Warna Sel Excel ke Shift</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-current/10 cursor-pointer text-current/70 hover:text-current"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <p className="text-xs opacity-75">
                        Sistem mendeteksi warna sel berikut dari salinan tabel Excel Anda. Silakan tentukan pasangan shift untuk masing-masing warna:
                    </p>

                    <div className="space-y-2.5">
                        {detectedColors.map((dc, idx) => {
                            const selectedId = mapping[dc.hex] || dc.matchedShiftId || '';
                            return (
                                <div
                                    key={`${dc.hex}-${idx}`}
                                    className="p-3 rounded-2xl bg-current/5 border border-current/10 flex items-center justify-between space-x-3"
                                >
                                    <div className="flex items-center space-x-2.5 truncate">
                                        <div
                                            className="w-7 h-7 rounded-lg border border-black/20 shadow-2xs shrink-0"
                                            style={{ backgroundColor: dc.hex }}
                                        />
                                        <div className="truncate text-xs">
                                            <div className="font-mono font-bold uppercase">{dc.hex}</div>
                                            <div className="text-[10px] opacity-60 truncate">
                                                {dc.count} sel terdeteksi {dc.sampleText ? `(Teks: "${dc.sampleText}")` : ''}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dropdown Selector */}
                                    <div className="w-[170px] shrink-0">
                                        <CustomDropdown
                                            value={selectedId}
                                            onChange={(val) => handleSelectShift(dc.hex, String(val))}
                                            options={[
                                                { value: '', label: '-- Lewati / Abaikan --' },
                                                ...availableShifts.map((s) => ({
                                                    value: s.id,
                                                    label: `${s.naming.displayBadge} - ${s.naming.fullName}`,
                                                })),
                                            ]}
                                            hideSelectedInList={false}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        {detectedColors.length === 0 && (
                            <p className="text-center py-6 text-xs opacity-50">Tidak ada warna sel khusus yang terdeteksi.</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-current/10 flex justify-between items-center bg-current/5 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-bold rounded-xl bg-current/10 hover:bg-current/20 cursor-pointer"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-5 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    >
                        Terapkan Pemetaan
                    </button>
                </div>
            </div>
        </div>
    );
};
