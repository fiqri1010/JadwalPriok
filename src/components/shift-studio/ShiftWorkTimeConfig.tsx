import React from 'react';
import { ShiftWorkTimeConfig } from '../../types';
import { Clock, Moon, CheckCircle2, AlertTriangle, Layers, Timer } from 'lucide-react';

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
        <div className="space-y-3 font-sans max-w-2xl mx-auto">
            {/* Primary Work Time Card - Compact & Sleek */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-white/80 dark:bg-[#161616] border border-slate-200/80 dark:border-zinc-800 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-zinc-800/80">
                    <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                            Jam Kerja Dasar & Fleksibilitas
                        </span>
                    </div>
                    {isOvernightActive && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-500 flex items-center space-x-1">
                            <Moon className="w-3 h-3" />
                            <span>Shift Lintas Hari</span>
                        </span>
                    )}
                </div>

                {/* Primary In & Out (Kiri - Kanan berdampingan kompak) */}
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                    <div className="space-y-1 text-center sm:text-left">
                        <label className="text-[11px] font-bold block text-slate-700 dark:text-zinc-300">
                            Jam Masuk Dasar:
                        </label>
                        <input
                            type="time"
                            value={workTime.jamMasukDasar === '-' ? '' : workTime.jamMasukDasar}
                            onChange={(e) => handleTimeChange('jamMasukDasar', e.target.value || '-')}
                            className="w-full h-8 px-2.5 text-xs rounded-lg border border-slate-200/90 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-800/50 outline-none focus:border-teal-500 font-mono text-center transition-colors shadow-2xs"
                        />
                    </div>

                    <div className="space-y-1 text-center sm:text-left">
                        <label className="text-[11px] font-bold block text-slate-700 dark:text-zinc-300">
                            Jam Pulang Dasar:
                        </label>
                        <input
                            type="time"
                            value={workTime.jamPulangDasar === '-' ? '' : workTime.jamPulangDasar}
                            onChange={(e) => handleTimeChange('jamPulangDasar', e.target.value || '-')}
                            className="w-full h-8 px-2.5 text-xs rounded-lg border border-slate-200/90 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-800/50 outline-none focus:border-teal-500 font-mono text-center transition-colors shadow-2xs"
                        />
                    </div>
                </div>

                {/* Flexi In & Flexi Out Limits */}
                {!isOffOrCuti && (
                    <div className="pt-1.5 border-t border-slate-100 dark:border-zinc-800/80 space-y-1.5">
                        <span className="text-[10.5px] font-semibold opacity-75 block">
                            Batas Toleransi Waktu Fleksibel (Flexi In / Out):
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* Flexi In */}
                            <div className="p-3 rounded-lg bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 space-y-1.5">
                                <span className="text-[10px] sm:text-[10.5px] font-black uppercase tracking-wide text-indigo-600 dark:text-indigo-400 block">
                                    Batas Flexi Masuk (In):
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-[9.5px] font-bold opacity-60 block mb-0.5">Terawal:</span>
                                        <input
                                            type="time"
                                            value={workTime.earliestFlexiIn === '-' ? '' : workTime.earliestFlexiIn}
                                            onChange={(e) => handleTimeChange('earliestFlexiIn', e.target.value || '-')}
                                            className="w-full h-8 px-1 py-0.5 text-xs font-mono rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-center tracking-tight"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[9.5px] font-bold opacity-60 block mb-0.5">Terakhir:</span>
                                        <input
                                            type="time"
                                            value={workTime.latestFlexiIn === '-' ? '' : workTime.latestFlexiIn}
                                            onChange={(e) => handleTimeChange('latestFlexiIn', e.target.value || '-')}
                                            className="w-full h-8 px-1 py-0.5 text-xs font-mono rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-center tracking-tight"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Flexi Out */}
                            <div className="p-3 rounded-lg bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 space-y-1.5">
                                <span className="text-[10px] sm:text-[10.5px] font-black uppercase tracking-wide text-cyan-600 dark:text-cyan-400 block">
                                    Batas Flexi Pulang (Out):
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-[9.5px] font-bold opacity-60 block mb-0.5">Terawal:</span>
                                        <input
                                            type="time"
                                            value={workTime.earliestFlexiOut === '-' ? '' : workTime.earliestFlexiOut}
                                            onChange={(e) => handleTimeChange('earliestFlexiOut', e.target.value || '-')}
                                            className="w-full h-8 px-1 py-0.5 text-xs font-mono rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-center tracking-tight"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[9.5px] font-bold opacity-60 block mb-0.5">Terakhir:</span>
                                        <input
                                            type="time"
                                            value={workTime.latestFlexiOut === '-' ? '' : workTime.latestFlexiOut}
                                            onChange={(e) => handleTimeChange('latestFlexiOut', e.target.value || '-')}
                                            className="w-full h-8 px-1 py-0.5 text-xs font-mono rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-center tracking-tight"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Overtime Minimum & Maximum limits */}
                <div className="pt-1.5 border-t border-slate-100 dark:border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-[10.5px] font-semibold opacity-75">
                        <Timer className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>Batas Jumlah Jam Lembur:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] opacity-75">Minimal (Menit):</label>
                                <span className="text-[9.5px] font-semibold font-mono text-amber-600 dark:text-amber-400">
                                    {Math.floor(workTime.minLemburMinutes / 60)}j {workTime.minLemburMinutes % 60}m
                                </span>
                            </div>
                            <input
                                type="number"
                                min={0}
                                max={480}
                                step={15}
                                value={workTime.minLemburMinutes}
                                onChange={(e) => onChange({ ...workTime, minLemburMinutes: Number(e.target.value) })}
                                className="w-full h-7 px-2 text-xs font-mono rounded-md border border-slate-200 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-800/50"
                            />
                        </div>

                        <div className="space-y-0.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] opacity-75">Maksimal (Menit):</label>
                                <span className="text-[9.5px] font-semibold font-mono text-amber-600 dark:text-amber-400">
                                    {Math.floor(workTime.maxLemburMinutes / 60)}j {workTime.maxLemburMinutes % 60}m
                                </span>
                            </div>
                            <input
                                type="number"
                                min={0}
                                max={720}
                                step={15}
                                value={workTime.maxLemburMinutes}
                                onChange={(e) => onChange({ ...workTime, maxLemburMinutes: Number(e.target.value) })}
                                className="w-full h-7 px-2 text-xs font-mono rounded-md border border-slate-200 dark:border-zinc-700 bg-slate-50/60 dark:bg-zinc-800/50"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Shift / PM Multi-Session Configuration */}
            {isSplitShiftAllowed && (
                <div className="p-2.5 sm:p-3 rounded-xl bg-white/80 dark:bg-[#161616] border border-slate-200/80 dark:border-zinc-800 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                            <Layers className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                                Multi-Sesi / Shift PM (Pagi - Malam):
                            </span>
                        </div>
                        <label className="flex items-center space-x-1.5 text-[11px] font-bold cursor-pointer">
                            <input
                                type="checkbox"
                                checked={Boolean(workTime.isSplitShift)}
                                onChange={(e) => onChange({ ...workTime, isSplitShift: e.target.checked })}
                                className="rounded text-teal-600 cursor-pointer w-3.5 h-3.5"
                            />
                            <span>Aktifkan Sesi Ganda</span>
                        </label>
                    </div>

                    {workTime.isSplitShift && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                            <div className="p-3 rounded-lg bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 space-y-1.5">
                                <span className="text-[10px] font-black text-amber-500 block">Sesi 1 (Pagi):</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-[9.5px] font-bold opacity-60 block mb-0.5">Masuk:</span>
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
                                            className="w-full h-8 px-1 py-0.5 text-xs font-mono rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-center tracking-tight"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[9.5px] font-bold opacity-60 block mb-0.5">Pulang:</span>
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
                                            className="w-full h-8 px-1 py-0.5 text-xs font-mono rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-center tracking-tight"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 rounded-lg bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 space-y-1.5">
                                <span className="text-[10px] font-black text-indigo-400 block">Sesi 2 (Malam - Subuh):</span>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-[9.5px] font-bold opacity-60 block mb-0.5">Masuk:</span>
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
                                            className="w-full h-8 px-1 py-0.5 text-xs font-mono rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-center tracking-tight"
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[9.5px] font-bold opacity-60 block mb-0.5">Pulang:</span>
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
                                            className="w-full h-8 px-1 py-0.5 text-xs font-mono rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-center tracking-tight"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Live Validator Indicator Box - Sleek & Compact */}
            {!isOffOrCuti && durationHours !== null && (
                <div
                    className={`p-2 sm:p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        durationHours >= 9 && durationHours <= 10
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                            : durationHours < 9
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
                            : 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400'
                    }`}
                >
                    <div className="flex items-center space-x-2 min-w-0">
                        {durationHours >= 9 && durationHours <= 10 ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                        ) : (
                            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                        )}
                        <div className="text-xs truncate">
                            <span className="font-bold">Total: {durationHours.toFixed(1)} Jam</span>
                            <span className="opacity-80 text-[11px] ml-1.5 hidden sm:inline">
                                {durationHours >= 9 && durationHours <= 10
                                    ? '(Sesuai standar operasional 9.5 Jam)'
                                    : durationHours < 9
                                    ? '(Lebih pendek dari standar 9.5 jam)'
                                    : '(Shift panjang, kelebihan jam dihitung lembur)'}
                            </span>
                        </div>
                    </div>
                    {isOvernightActive && (
                        <span className="font-bold text-[9.5px] bg-blue-500/20 px-1.5 py-0.5 rounded shrink-0">
                            🌙 Lintas Hari
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};
