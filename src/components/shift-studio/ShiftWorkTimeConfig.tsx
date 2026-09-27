import React from 'react';
import { ShiftWorkTimeConfig } from '../../types';
import { Clock, Moon, CheckCircle2, AlertTriangle, Sparkles, Layers } from 'lucide-react';

interface ShiftWorkTimeConfigProps {
    workTime: ShiftWorkTimeConfig;
    onChange: (workTime: ShiftWorkTimeConfig) => void;
    isSplitShiftAllowed?: boolean;
}

// Helper to calculate total hours between two HH:mm times
function calculateDurationHours(start: string, end: string, isOvernight = false): number | null {
    if (!start || !end || start === '-' || end === '-') return null;
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return null;

    let startMins = h1 * 60 + m1;
    let endMins = h2 * 60 + m2;
    if (isOvernight || endMins < startMins) {
        endMins += 24 * 60;
    }
    return (endMins - startMins) / 60;
}

export const ShiftWorkTimeConfigComponent: React.FC<ShiftWorkTimeConfigProps> = ({
    workTime,
    onChange,
    isSplitShiftAllowed = true,
}) => {
    const isOffOrCuti = workTime.jamMasukDasar === '-' || workTime.jamPulangDasar === '-';

    // Auto-detect overnight
    const isAutoOvernight = () => {
        if (isOffOrCuti) return false;
        const [h1, m1] = (workTime.jamMasukDasar || '').split(':').map(Number);
        const [h2, m2] = (workTime.jamPulangDasar || '').split(':').map(Number);
        if (isNaN(h1) || isNaN(h2)) return false;
        return h2 * 60 + (m2 || 0) < h1 * 60 + (m1 || 0);
    };

    const isOvernightActive = workTime.isOvernight ?? isAutoOvernight();
    const durationHours = calculateDurationHours(workTime.jamMasukDasar, workTime.jamPulangDasar, isOvernightActive);

    const handleTimeChange = (field: keyof ShiftWorkTimeConfig, val: string) => {
        const updated = { ...workTime, [field]: val };
        // Auto check overnight
        if (field === 'jamMasukDasar' || field === 'jamPulangDasar') {
            const [h1, m1] = (field === 'jamMasukDasar' ? val : workTime.jamMasukDasar).split(':').map(Number);
            const [h2, m2] = (field === 'jamPulangDasar' ? val : workTime.jamPulangDasar).split(':').map(Number);
            if (!isNaN(h1) && !isNaN(h2)) {
                updated.isOvernight = h2 * 60 + (m2 || 0) < h1 * 60 + (m1 || 0);
            }
        }
        onChange(updated);
    };

    return (
        <div className="space-y-4">
            {/* Work Time Section */}
            <div className="p-3.5 rounded-2xl bg-current/5 border border-current/10 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-bold">Jam Kerja Dasar & Fleksibilitas (Per-Shift):</span>
                    </div>
                    {isOvernightActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-500 flex items-center space-x-1">
                            <Moon className="w-3 h-3" />
                            <span>Shift Lintas Hari</span>
                        </span>
                    )}
                </div>

                {/* Primary In & Out (Kiri - Kanan berdampingan di mobile & desktop) */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="space-y-1">
                        <label className="text-[11px] sm:text-xs font-bold block truncate">
                            Jam Masuk Dasar:
                        </label>
                        <input
                            type="time"
                            value={workTime.jamMasukDasar === '-' ? '' : workTime.jamMasukDasar}
                            onChange={(e) => handleTimeChange('jamMasukDasar', e.target.value || '-')}
                            className="w-full p-2 text-xs rounded-xl border border-current/20 bg-current/5 outline-none focus:border-teal-500 font-mono text-center sm:text-left"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] sm:text-xs font-bold block truncate">
                            Jam Pulang Dasar:
                        </label>
                        <input
                            type="time"
                            value={workTime.jamPulangDasar === '-' ? '' : workTime.jamPulangDasar}
                            onChange={(e) => handleTimeChange('jamPulangDasar', e.target.value || '-')}
                            className="w-full p-2 text-xs rounded-xl border border-current/20 bg-current/5 outline-none focus:border-teal-500 font-mono text-center sm:text-left"
                        />
                    </div>
                </div>

                {/* Flexi In & Flexi Out Limits */}
                {!isOffOrCuti && (
                    <div className="space-y-2.5 pt-2 border-t border-current/10">
                        <span className="text-[11px] font-semibold opacity-75 block">Batas Toleransi Waktu Fleksibel (Flexi In / Out):</span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Flexi In */}
                            <div className="p-2.5 rounded-xl bg-current/5 border border-current/10 space-y-1.5">
                                <span className="text-[10px] font-bold uppercase opacity-75 block">Batas Flexi Masuk (In):</span>
                                <div className="grid grid-cols-2 gap-1.5">
                                    <div>
                                        <span className="text-[9px] opacity-60">Terawal:</span>
                                        <input
                                            type="time"
                                            value={workTime.earliestFlexiIn === '-' ? '' : workTime.earliestFlexiIn}
                                            onChange={(e) => handleTimeChange('earliestFlexiIn', e.target.value || '-')}
                                            className="w-full p-1.5 text-xs font-mono rounded-lg border border-current/20 bg-current/5"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[9px] opacity-60">Terakhir:</span>
                                        <input
                                            type="time"
                                            value={workTime.latestFlexiIn === '-' ? '' : workTime.latestFlexiIn}
                                            onChange={(e) => handleTimeChange('latestFlexiIn', e.target.value || '-')}
                                            className="w-full p-1.5 text-xs font-mono rounded-lg border border-current/20 bg-current/5"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Flexi Out */}
                            <div className="p-2.5 rounded-xl bg-current/5 border border-current/10 space-y-1.5">
                                <span className="text-[10px] font-bold uppercase opacity-75 block">Batas Flexi Pulang (Out):</span>
                                <div className="grid grid-cols-2 gap-1.5">
                                    <div>
                                        <span className="text-[9px] opacity-60">Terawal:</span>
                                        <input
                                            type="time"
                                            value={workTime.earliestFlexiOut === '-' ? '' : workTime.earliestFlexiOut}
                                            onChange={(e) => handleTimeChange('earliestFlexiOut', e.target.value || '-')}
                                            className="w-full p-1.5 text-xs font-mono rounded-lg border border-current/20 bg-current/5"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[9px] opacity-60">Terakhir:</span>
                                        <input
                                            type="time"
                                            value={workTime.latestFlexiOut === '-' ? '' : workTime.latestFlexiOut}
                                            onChange={(e) => handleTimeChange('latestFlexiOut', e.target.value || '-')}
                                            className="w-full p-1.5 text-xs font-mono rounded-lg border border-current/20 bg-current/5"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Overtime Minimum & Maximum limits */}
                <div className="space-y-2 pt-2 border-t border-current/10">
                    <span className="text-[11px] font-semibold opacity-75 block">Batas Jumlah Jam Lembur:</span>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] opacity-70 block">Minimal Lembur (Menit):</label>
                            <input
                                type="number"
                                min={0}
                                max={480}
                                step={15}
                                value={workTime.minLemburMinutes}
                                onChange={(e) => onChange({ ...workTime, minLemburMinutes: Number(e.target.value) })}
                                className="w-full p-2 text-xs font-mono rounded-xl border border-current/20 bg-current/5"
                            />
                            <p className="text-[9px] opacity-60">{Math.floor(workTime.minLemburMinutes / 60)} Jam {workTime.minLemburMinutes % 60} Menit</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] opacity-70 block">Maksimal Lembur (Menit):</label>
                            <input
                                type="number"
                                min={0}
                                max={720}
                                step={15}
                                value={workTime.maxLemburMinutes}
                                onChange={(e) => onChange({ ...workTime, maxLemburMinutes: Number(e.target.value) })}
                                className="w-full p-2 text-xs font-mono rounded-xl border border-current/20 bg-current/5"
                            />
                            <p className="text-[9px] opacity-60">{Math.floor(workTime.maxLemburMinutes / 60)} Jam {workTime.maxLemburMinutes % 60} Menit</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Shift / PM Multi-Session Configuration */}
            {isSplitShiftAllowed && (
                <div className="p-3.5 rounded-2xl bg-current/5 border border-current/10 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Layers className="w-4 h-4 text-cyan-500" />
                            <span className="text-xs font-bold">Multi-Sesi / Shift PM (Pagi - Malam):</span>
                        </div>
                        <label className="flex items-center space-x-1.5 text-xs font-bold cursor-pointer">
                            <input
                                type="checkbox"
                                checked={Boolean(workTime.isSplitShift)}
                                onChange={(e) => onChange({ ...workTime, isSplitShift: e.target.checked })}
                                className="rounded text-indigo-600 cursor-pointer"
                            />
                            <span>Aktifkan Sesi Ganda</span>
                        </label>
                    </div>

                    {workTime.isSplitShift && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div className="p-2.5 rounded-xl bg-current/5 border border-current/10 space-y-1.5">
                                <span className="text-[10px] font-bold text-amber-500 block">Sesi 1 (Pagi):</span>
                                <div className="grid grid-cols-2 gap-1.5">
                                    <div>
                                        <span className="text-[9px] opacity-60">Masuk:</span>
                                        <input
                                            type="time"
                                            value={workTime.splitSession1?.masuk || '07:30'}
                                            onChange={(e) =>
                                                onChange({
                                                    ...workTime,
                                                    splitSession1: {
                                                        masuk: e.target.value,
                                                        pulang: workTime.splitSession1?.pulang || '17:00',
                                                    },
                                                })
                                            }
                                            className="w-full p-1.5 text-xs font-mono rounded-lg border border-current/20 bg-current/5"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[9px] opacity-60">Pulang:</span>
                                        <input
                                            type="time"
                                            value={workTime.splitSession1?.pulang || '17:00'}
                                            onChange={(e) =>
                                                onChange({
                                                    ...workTime,
                                                    splitSession1: {
                                                        masuk: workTime.splitSession1?.masuk || '07:30',
                                                        pulang: e.target.value,
                                                    },
                                                })
                                            }
                                            className="w-full p-1.5 text-xs font-mono rounded-lg border border-current/20 bg-current/5"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-current/5 border border-current/10 space-y-1.5">
                                <span className="text-[10px] font-bold text-indigo-400 block">Sesi 2 (Malam Lanjut Subuh):</span>
                                <div className="grid grid-cols-2 gap-1.5">
                                    <div>
                                        <span className="text-[9px] opacity-60">Masuk:</span>
                                        <input
                                            type="time"
                                            value={workTime.splitSession2?.masuk || '20:00'}
                                            onChange={(e) =>
                                                onChange({
                                                    ...workTime,
                                                    splitSession2: {
                                                        masuk: e.target.value,
                                                        pulang: workTime.splitSession2?.pulang || '04:30',
                                                    },
                                                })
                                            }
                                            className="w-full p-1.5 text-xs font-mono rounded-lg border border-current/20 bg-current/5"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[9px] opacity-60">Pulang:</span>
                                        <input
                                            type="time"
                                            value={workTime.splitSession2?.pulang || '04:30'}
                                            onChange={(e) =>
                                                onChange({
                                                    ...workTime,
                                                    splitSession2: {
                                                        masuk: workTime.splitSession2?.masuk || '20:00',
                                                        pulang: e.target.value,
                                                    },
                                                })
                                            }
                                            className="w-full p-1.5 text-xs font-mono rounded-lg border border-current/20 bg-current/5"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Live Validator Indicator Box */}
            {!isOffOrCuti && durationHours !== null && (
                <div className={`p-3 rounded-2xl border flex items-start space-x-2.5 transition-all ${
                    durationHours >= 9 && durationHours <= 10
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                        : durationHours < 9
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
                        : 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400'
                }`}>
                    {durationHours >= 9 && durationHours <= 10 ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                    ) : (
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <div className="text-xs space-y-0.5">
                        <div className="flex items-center space-x-2">
                            <span className="font-bold">Total Durasi Bersih: {durationHours.toFixed(1)} Jam</span>
                            {isOvernightActive && <span className="font-bold text-[10px] bg-blue-500/20 px-1.5 py-0.2 rounded-md">🌙 Lintas Hari (+1)</span>}
                        </div>
                        <p className="text-[11px] opacity-90 leading-relaxed">
                            {durationHours >= 9 && durationHours <= 10
                                ? 'Durasi kerja sesuai standar jam operasional kantor (9.5 Jam).'
                                : durationHours < 9
                                ? `⚠️ Durasi kerja ${durationHours.toFixed(1)} jam lebih pendek dari standar 9.5 jam.`
                                : `Shift panjang (${durationHours.toFixed(1)} jam). Kelebihan jam akan dihitung sebagai lembur.`}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
