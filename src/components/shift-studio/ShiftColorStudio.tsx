import React from 'react';
import { ShiftVisualStyle, VisualColorMode, GradientColorStop } from '../../types';
import { Plus, Trash2, Palette, Sparkles, Code2, RotateCw } from 'lucide-react';

interface ShiftColorStudioProps {
    visual: ShiftVisualStyle;
    onChange: (visual: ShiftVisualStyle) => void;
    theme?: string;
}

const PRESET_SOLID_COLORS = [
    '#EDF6F9', '#FFDDD2', '#E29578', '#83C5BE', '#006D77', '#2C4251',
    '#BE1A1A', '#0B0909', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
    '#10B981', '#F59E0B', '#EF4444', '#14B8A6', '#64748B', '#1E293B',
];

const PRESET_GRADIENTS: { name: string; stops: GradientColorStop[]; angle: number }[] = [
    { name: 'Priok Teal Ocean', angle: 135, stops: [{ color: '#006D77', position: 0 }, [{ color: '#83C5BE', position: 100 }][0]] },
    { name: 'Sunset Terminal', angle: 135, stops: [{ color: '#E29578', position: 0 }, [{ color: '#FFDDD2', position: 100 }][0]] },
    { name: 'Night Shift Indigo', angle: 135, stops: [{ color: '#1E1B4B', position: 0 }, [{ color: '#312E81', position: 50 }, { color: '#4338CA', position: 100 }][1]] },
    { name: 'Emerald Wave', angle: 90, stops: [{ color: '#065F46', position: 0 }, { color: '#10B981', position: 100 }] },
    { name: 'Aurora Borealis (3 Warna)', angle: 45, stops: [{ color: '#006D77', position: 0 }, { color: '#83C5BE', position: 50 }, { color: '#FFDDD2', position: 100 }] },
    { name: 'Hyper Matrix (4 Warna)', angle: 135, stops: [{ color: '#0F172A', position: 0 }, { color: '#047857', position: 35 }, { color: '#10B981', position: 70 }, { color: '#6EE7B7', position: 100 }] },
];

export const ShiftColorStudio: React.FC<ShiftColorStudioProps> = ({ visual, onChange }) => {
    const handleModeChange = (mode: VisualColorMode) => {
        onChange({
            ...visual,
            colorMode: mode,
            gradientType: mode === 'radial' ? 'radial' : 'linear',
        });
    };

    const handleAddStop = () => {
        if (visual.colorStops.length >= 4) return;
        const newPos = Math.min(100, Math.max(0, Math.round(100 / visual.colorStops.length)));
        const newStops = [...visual.colorStops, { color: '#6366F1', position: newPos }].sort((a, b) => a.position - b.position);
        onChange({ ...visual, colorStops: newStops });
    };

    const handleRemoveStop = (index: number) => {
        if (visual.colorStops.length <= 2) return;
        const newStops = visual.colorStops.filter((_, i) => i !== index);
        onChange({ ...visual, colorStops: newStops });
    };

    const handleStopColorChange = (index: number, newColor: string) => {
        const newStops = [...visual.colorStops];
        newStops[index] = { ...newStops[index], color: newColor };
        onChange({ ...visual, colorStops: newStops });
    };

    const handleStopPosChange = (index: number, newPos: number) => {
        const newStops = [...visual.colorStops];
        newStops[index] = { ...newStops[index], position: newPos };
        onChange({ ...visual, colorStops: newStops });
    };

    return (
        <div className="space-y-4">
            {/* Mode Switcher Tabs */}
            <div className="flex p-1 gap-1 rounded-xl bg-current/5 border border-current/10 text-xs">
                <button
                    type="button"
                    onClick={() => handleModeChange('solid')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        visual.colorMode === 'solid' ? 'bg-indigo-600 text-white shadow-xs' : 'opacity-70 hover:opacity-100 hover:bg-current/5'
                    }`}
                >
                    <Palette className="w-3.5 h-3.5" />
                    <span>Solid</span>
                </button>
                <button
                    type="button"
                    onClick={() => handleModeChange('linear')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        visual.colorMode === 'linear' ? 'bg-indigo-600 text-white shadow-xs' : 'opacity-70 hover:opacity-100 hover:bg-current/5'
                    }`}
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gradien Linear</span>
                </button>
                <button
                    type="button"
                    onClick={() => handleModeChange('radial')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        visual.colorMode === 'radial' ? 'bg-indigo-600 text-white shadow-xs' : 'opacity-70 hover:opacity-100 hover:bg-current/5'
                    }`}
                >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Gradien Radial</span>
                </button>
                <button
                    type="button"
                    onClick={() => handleModeChange('customCss')}
                    className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        visual.colorMode === 'customCss' ? 'bg-indigo-600 text-white shadow-xs' : 'opacity-70 hover:opacity-100 hover:bg-current/5'
                    }`}
                >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Kustom CSS</span>
                </button>
            </div>

            {/* Solid Mode */}
            {visual.colorMode === 'solid' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-current/5 border border-current/10">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold">Warna Latar Shift (Solid):</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="color"
                                value={visual.solidColor}
                                onChange={(e) => onChange({ ...visual, solidColor: e.target.value })}
                                className="w-8 h-8 rounded-lg cursor-pointer border border-current/20 bg-transparent p-0.5"
                            />
                            <span className="text-xs font-mono uppercase opacity-80">{visual.solidColor}</span>
                        </div>
                    </div>

                    {/* Presets Grid */}
                    <div>
                        <span className="text-[10px] font-semibold opacity-60 block mb-1.5 uppercase tracking-wider">Palet Cepat:</span>
                        <div className="flex flex-wrap gap-1.5">
                            {PRESET_SOLID_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => onChange({ ...visual, solidColor: c })}
                                    className={`w-6 h-6 rounded-md border transition-transform hover:scale-110 cursor-pointer ${
                                        visual.solidColor.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-indigo-500 scale-110' : 'border-black/10'
                                    }`}
                                    style={{ backgroundColor: c }}
                                    title={c}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Gradient Mode (Linear or Radial) */}
            {(visual.colorMode === 'linear' || visual.colorMode === 'radial') && (
                <div className="space-y-3.5 p-3.5 rounded-2xl bg-current/5 border border-current/10">
                    {/* Angle Controller (Linear Only) */}
                    {visual.colorMode === 'linear' && (
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold flex items-center space-x-1">
                                    <RotateCw className="w-3.5 h-3.5 text-indigo-500" />
                                    <span>Sudut Arah Gradien:</span>
                                </span>
                                <span className="font-mono font-bold text-indigo-500">{visual.gradientAngle}°</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <input
                                    type="range"
                                    min="0"
                                    max="360"
                                    step="5"
                                    value={visual.gradientAngle}
                                    onChange={(e) => onChange({ ...visual, gradientAngle: Number(e.target.value) })}
                                    className="w-full accent-indigo-600 cursor-pointer"
                                />
                                <div className="flex gap-1 shrink-0">
                                    {[0, 45, 90, 135, 180].map((deg) => (
                                        <button
                                            key={deg}
                                            type="button"
                                            onClick={() => onChange({ ...visual, gradientAngle: deg })}
                                            className={`px-1.5 py-0.5 text-[9.5px] rounded font-mono border cursor-pointer ${
                                                visual.gradientAngle === deg ? 'bg-indigo-600 text-white border-indigo-600 font-bold' : 'border-current/20 hover:bg-current/10'
                                            }`}
                                        >
                                            {deg}°
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Color Stops List (2 to 4 Colors) */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold">Titik Perpaduan Warna ({visual.colorStops.length}/4 Warna):</span>
                            {visual.colorStops.length < 4 && (
                                <button
                                    type="button"
                                    onClick={handleAddStop}
                                    className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 flex items-center space-x-1 cursor-pointer"
                                >
                                    <Plus className="w-3 h-3" />
                                    <span>Tambah Warna</span>
                                </button>
                            )}
                        </div>

                        <div className="space-y-2">
                            {visual.colorStops.map((stop, idx) => (
                                <div key={idx} className="flex items-center space-x-2.5 p-2 rounded-xl bg-current/5 border border-current/10">
                                    <span className="text-[10px] font-bold opacity-60 w-4">#{idx + 1}</span>
                                    <input
                                        type="color"
                                        value={stop.color}
                                        onChange={(e) => handleStopColorChange(idx, e.target.value)}
                                        className="w-7 h-7 rounded-md cursor-pointer border border-current/20 bg-transparent p-0.5 shrink-0"
                                    />
                                    <div className="flex-1 space-y-0.5">
                                        <div className="flex justify-between text-[10px] opacity-70">
                                            <span>Posisi Stop</span>
                                            <span className="font-mono font-bold">{stop.position}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={stop.position}
                                            onChange={(e) => handleStopPosChange(idx, Number(e.target.value))}
                                            className="w-full accent-indigo-600 cursor-pointer h-1.5"
                                        />
                                    </div>
                                    {visual.colorStops.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveStop(idx)}
                                            className="p-1 rounded-md text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                            title="Hapus titik warna"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gradient Presets */}
                    <div>
                        <span className="text-[10px] font-semibold opacity-60 block mb-1.5 uppercase tracking-wider">Preset Gradien Populer:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                            {PRESET_GRADIENTS.map((p, idx) => {
                                const gradCss = `linear-gradient(${p.angle}deg, ${p.stops.map((s) => `${s.color} ${s.position}%`).join(', ')})`;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() =>
                                            onChange({
                                                ...visual,
                                                colorMode: 'linear',
                                                gradientType: 'linear',
                                                gradientAngle: p.angle,
                                                colorStops: p.stops,
                                            })
                                        }
                                        className="flex items-center space-x-2 p-1.5 rounded-lg border border-current/15 hover:border-indigo-500 transition-all text-left cursor-pointer"
                                    >
                                        <div className="w-5 h-5 rounded-md shrink-0 shadow-2xs border border-white/20" style={{ background: gradCss }} />
                                        <span className="text-[10px] font-medium truncate">{p.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Custom CSS Mode */}
            {visual.colorMode === 'customCss' && (
                <div className="space-y-2 p-3.5 rounded-2xl bg-current/5 border border-current/10">
                    <div className="flex justify-between items-center text-xs">
                        <label className="font-bold flex items-center space-x-1.5">
                            <Code2 className="w-4 h-4 text-indigo-500" />
                            <span>Kustom CSS / Tailwind Styling:</span>
                        </label>
                    </div>
                    <textarea
                        rows={3}
                        placeholder="Contoh: background: linear-gradient(135deg, #1e3a8a 0%, #06b6d4 100%);"
                        value={visual.customCss || ''}
                        onChange={(e) => onChange({ ...visual, customCss: e.target.value })}
                        className="w-full p-2.5 text-xs font-mono rounded-xl border border-current/20 bg-current/5 outline-none focus:border-indigo-500"
                    />
                    <p className="text-[10px] opacity-60">
                        Anda dapat memasukkan kode CSS background kustom secara leluasa.
                    </p>
                </div>
            )}

            {/* Text & Border Color Config */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-current/5 border border-current/10">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold">Warna Teks Shift:</label>
                    <div className="flex items-center space-x-1.5">
                        <input
                            type="color"
                            value={visual.textColor.startsWith('#') ? visual.textColor : '#FFFFFF'}
                            onChange={(e) => onChange({ ...visual, textColor: e.target.value })}
                            className="w-7 h-7 rounded-md cursor-pointer border border-current/20 bg-transparent p-0.5"
                        />
                        <button
                            type="button"
                            onClick={() => onChange({ ...visual, textColor: '#FFFFFF' })}
                            className="px-1.5 py-0.5 text-[9px] rounded bg-white text-black font-bold border cursor-pointer"
                        >
                            Putih
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange({ ...visual, textColor: '#011627' })}
                            className="px-1.5 py-0.5 text-[9px] rounded bg-slate-900 text-white font-bold border cursor-pointer"
                        >
                            Gelap
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold">Warna Garis Tepi (Border):</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="color"
                            value={visual.borderColor.startsWith('#') ? visual.borderColor : '#83C5BE'}
                            onChange={(e) => onChange({ ...visual, borderColor: e.target.value })}
                            className="w-7 h-7 rounded-md cursor-pointer border border-current/20 bg-transparent p-0.5"
                        />
                        <span className="text-[10px] font-mono uppercase opacity-80">{visual.borderColor}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
