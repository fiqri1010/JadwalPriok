import React from 'react';
import { ShiftNamingConfig, ShiftItemConfig } from '../../types';
import { AlertTriangle, Tag, Sparkles } from 'lucide-react';

interface ShiftNamingInputProps {
    naming: ShiftNamingConfig;
    onChange: (naming: ShiftNamingConfig) => void;
    currentShiftId?: string;
    existingShifts?: ShiftItemConfig[];
}

export const ShiftNamingInput: React.FC<ShiftNamingInputProps> = ({
    naming,
    onChange,
    currentShiftId,
    existingShifts = [],
}) => {
    // Collision detection check
    const cleanCode = naming.copyCode.trim().toUpperCase();
    const cleanBadge = naming.displayBadge.trim().toUpperCase();

    const collidingShift = existingShifts.find((s) => {
        if (currentShiftId && s.id === currentShiftId) return false;
        const otherCode = s.naming.copyCode.trim().toUpperCase();
        const otherBadge = s.naming.displayBadge.trim().toUpperCase();
        return (cleanCode !== '' && otherCode === cleanCode) || (cleanBadge !== '' && otherBadge === cleanBadge);
    });

    const handleFullNameChange = (val: string) => {
        const updated = { ...naming, fullName: val };
        // Auto-suggest Display Badge and Copy Code if currently empty or freshly created
        if (!naming.displayBadge || naming.displayBadge === '') {
            const words = val.trim().split(/\s+/).filter(Boolean);
            if (words.length > 1) {
                updated.displayBadge = words.map((w) => w[0]).join('').toUpperCase().slice(0, 5);
            } else if (words.length === 1) {
                updated.displayBadge = words[0].slice(0, 5).toUpperCase();
            }
        }
        if (!naming.copyCode || naming.copyCode === '') {
            updated.copyCode = (updated.displayBadge || val.slice(0, 1)).slice(0, 2).toUpperCase();
        }
        onChange(updated);
    };

    return (
        <div className="space-y-3.5">
            {/* Naming Grid */}
            <div className="space-y-3 p-3.5 rounded-2xl bg-current/5 border border-current/10">
                <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="text-xs font-bold">Sistem Penamaan Shift:</span>
                </div>

                {/* Full Name */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                        <label className="font-bold text-slate-800 dark:text-slate-200">Nama Lengkap (Full Name):</label>
                        <span className="text-[10px] opacity-60">Untuk laporan & detail</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Contoh: Terminal Peti Kemas Surabaya Lapangan / NPCT Pagi"
                        value={naming.fullName}
                        onChange={(e) => handleFullNameChange(e.target.value)}
                        className="w-full p-2.5 text-xs rounded-xl border border-current/20 bg-current/5 outline-none focus:border-teal-500"
                    />
                </div>

                {/* Display Badge & Copy Code (Bersebelahan di mobile & desktop) */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    {/* Display Badge */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                            <label className="font-bold text-slate-800 dark:text-slate-200 truncate">Tampilan Kalender:</label>
                        </div>
                        <input
                            type="text"
                            maxLength={5}
                            placeholder="TPSL, NPCT, Graha"
                            value={naming.displayBadge}
                            onChange={(e) => onChange({ ...naming, displayBadge: e.target.value.slice(0, 5) })}
                            className="w-full p-2.5 text-xs font-bold rounded-xl border border-current/20 bg-current/5 outline-none focus:border-teal-500 text-center sm:text-left font-mono"
                        />
                        <p className="text-[9.5px] opacity-60 leading-tight">Badge di kotak kalender (2–5 huruf).</p>
                    </div>

                    {/* Copy Code */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                            <label className="font-bold text-slate-800 dark:text-slate-200 truncate">Kode Singkat Salin:</label>
                        </div>
                        <input
                            type="text"
                            maxLength={3}
                            placeholder="T, N, G, SM"
                            value={naming.copyCode}
                            onChange={(e) => onChange({ ...naming, copyCode: e.target.value.slice(0, 3).toUpperCase() })}
                            className="w-full p-2.5 text-xs font-bold uppercase rounded-xl border border-current/20 bg-current/5 outline-none focus:border-teal-500 text-center sm:text-left font-mono"
                        />
                        <p className="text-[9.5px] opacity-60 leading-tight">Kode salin teks WA/SMS (1–3 huruf).</p>
                    </div>
                </div>

                {/* Dropdown Sublabel Description */}
                <div className="space-y-1 pt-1">
                    <div className="flex justify-between items-center text-xs">
                        <label className="font-bold text-slate-800 dark:text-slate-200">Sublabel / Deskripsi Dropdown:</label>
                        <span className="text-[10px] opacity-60">Keterangan jam di dropdown</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Contoh: FCL 07.30 - 17.00 / 12.30 - 22.00"
                        value={naming.dropdownSublabel}
                        onChange={(e) => onChange({ ...naming, dropdownSublabel: e.target.value })}
                        className="w-full p-2.5 text-xs rounded-xl border border-current/20 bg-current/5 outline-none focus:border-teal-500"
                    />
                </div>
            </div>

            {/* Live Collision Warning Banner */}
            {collidingShift && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-start space-x-2.5 animate-in fade-in duration-200">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                    <div className="text-xs space-y-0.5">
                        <h5 className="font-bold">Peringatan Kode / Singkatan Bentrok!</h5>
                        <p className="text-[11px] opacity-90 leading-relaxed">
                            Kode &apos;{cleanCode || cleanBadge}&apos; sudah digunakan oleh shift <strong>{collidingShift.naming.fullName}</strong>. Disarankan memakai kode singkatan unik agar jadwal tidak tertukar saat disalin.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
