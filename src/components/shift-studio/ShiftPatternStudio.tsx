import React from 'react';
import { ShiftVisualStyle, PresetPatternType } from '../../types';
import { Grid, Layers, Upload, Trash2, Eye } from 'lucide-react';

interface ShiftPatternStudioProps {
    visual: ShiftVisualStyle;
    onChange: (visual: ShiftVisualStyle) => void;
}

const PRESET_PATTERNS: { type: PresetPatternType; label: string; desc: string }[] = [
    { type: 'none', label: 'Polos (Tanpa Pola)', desc: 'Warna solid atau gradien bersih' },
    { type: 'stripes', label: 'Garis Miring (Stripes)', desc: 'Motif garis diagonal khas industri' },
    { type: 'dots', label: 'Titik Halus (Polkadot)', desc: 'Motif bintik rapi teratur' },
    { type: 'honeycomb', label: 'Sarang Lebah (Honeycomb)', desc: 'Motif heksagonal modern' },
    { type: 'grid', label: 'Kisi-kisi (Grid)', desc: 'Motif garis kotak presisi' },
    { type: 'waves', label: 'Gelombang (Waves)', desc: 'Motif kurva dinamis dermaga' },
    { type: 'carbon', label: 'Serat Karbon (Carbon)', desc: 'Tekstur anyaman anyaman gelap' },
];

export const ShiftPatternStudio: React.FC<ShiftPatternStudioProps> = ({ visual, onChange }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const dataUrl = evt.target?.result as string;
            onChange({
                ...visual,
                customPatternUrl: dataUrl,
            });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-4">
            {/* Header & Opacity Slider */}
            <div className="p-3.5 rounded-2xl bg-current/5 border border-current/10 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-bold">Lapisan Pola & Tekstur (Overlay):</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-500">{visual.patternOpacity}% Opasitas</span>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] opacity-70">
                        <span>Transparan (Halus)</span>
                        <span>Pekat (Tegas)</span>
                    </div>
                    <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={visual.patternOpacity}
                        onChange={(e) => onChange({ ...visual, patternOpacity: Number(e.target.value) })}
                        className="w-full accent-indigo-600 cursor-pointer h-1.5"
                    />
                </div>
            </div>

            {/* Pattern Presets Grid */}
            <div className="space-y-2">
                <span className="text-[10px] font-semibold opacity-60 block uppercase tracking-wider">Pilih Motif Pola:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRESET_PATTERNS.map((p) => {
                        const isSelected = visual.patternType === p.type && !visual.customPatternUrl;
                        return (
                            <button
                                key={p.type}
                                type="button"
                                onClick={() =>
                                    onChange({
                                        ...visual,
                                        patternType: p.type,
                                        customPatternUrl: undefined,
                                    })
                                }
                                className={`flex items-center space-x-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                    isSelected
                                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-500 shadow-xs'
                                        : 'border-current/15 hover:border-current/30 hover:bg-current/5'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-lg border border-current/20 flex items-center justify-center shrink-0 ${
                                    isSelected ? 'bg-indigo-600 text-white' : 'bg-current/10'
                                }`}>
                                    <Grid className="w-4 h-4" />
                                </div>
                                <div className="truncate">
                                    <h5 className="text-xs font-bold">{p.label}</h5>
                                    <p className="text-[10px] opacity-60 truncate">{p.desc}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Custom Pattern Upload */}
            <div className="p-3.5 rounded-2xl bg-current/5 border border-current/10 space-y-2.5">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Unggah Gambar Pola Kustom:</span>
                    <input
                        type="file"
                        accept="image/png,image/svg+xml,image/jpeg,image/webp"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-1.5 cursor-pointer"
                    >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih Gambar Pattern</span>
                    </button>
                </div>

                {visual.customPatternUrl && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                        <div className="flex items-center space-x-2.5 truncate">
                            <img
                                src={visual.customPatternUrl}
                                alt="Custom Pattern"
                                className="w-7 h-7 rounded-md object-cover border border-indigo-500/30"
                            />
                            <span className="text-xs font-medium truncate">Pattern Kustom Aktif</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => onChange({ ...visual, customPatternUrl: undefined })}
                            className="p-1 rounded-md text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                            title="Hapus pattern kustom"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
