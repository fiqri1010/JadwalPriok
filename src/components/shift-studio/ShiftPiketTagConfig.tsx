import React from 'react';
import { Briefcase, Info, CheckCircle2 } from 'lucide-react';

interface ShiftPiketTagConfigProps {
    isPiket: boolean;
    onChange: (isPiket: boolean) => void;
    shiftKey?: string;
}

export const ShiftPiketTagConfig: React.FC<ShiftPiketTagConfigProps> = ({
    isPiket,
    onChange,
    shiftKey,
}) => {
    return (
        <div className="p-3.5 rounded-2xl bg-current/5 border border-current/10 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold">Status Penugasan Piket:</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isPiket}
                        onChange={(e) => onChange(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-current/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
            </div>

            <p className="text-[11px] opacity-75 leading-relaxed">
                Centang opsi ini jika shift ini berstatus dinas piket yang berhak mendapatkan <strong>OFF Pengganti</strong> melalui sistem FIFO.
            </p>

            {/* Info Kriteria Otomatis */}
            <div className="p-2.5 rounded-xl bg-current/5 border border-current/10 space-y-1 text-[10px] opacity-80">
                <div className="flex items-center space-x-1.5 font-bold text-indigo-500">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Kriteria Otomatis Penanda Piket Sistem:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 pl-1 leading-relaxed">
                    <li>Shift kerja apapun yang jatuh pada hari <strong>Sabtu</strong>, <strong>Minggu</strong>, atau <strong>Hari Libur Nasional</strong>.</li>
                    <li>Shift khusus: <strong>SM (Shift Siang)</strong>, <strong>PM (Pagi-Malam)</strong>, dan <strong>Malam</strong> pada hari kerja biasa.</li>
                </ul>
            </div>
        </div>
    );
};
