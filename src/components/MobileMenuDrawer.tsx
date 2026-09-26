import React from 'react';
import { X, Flag, Sliders, History } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { AppTheme } from '../types';

type PageTabType = 'calendar' | 'holiday' | 'settings' | 'version';

interface MobileMenuDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    pageTab: PageTabType;
    onSelectTab: (tab: PageTabType) => void;
    currentTheme: AppTheme;
    appVersion: string;
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
    isOpen,
    onClose,
    pageTab,
    onSelectTab,
    currentTheme,
    appVersion,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[99990] flex items-end justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
                className="fixed inset-0"
                onClick={onClose}
            />
            <div
                className={`relative z-10 w-full max-w-lg rounded-t-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto ${
                    currentTheme === 'darkFluid'
                        ? 'bg-[#1D1B20] text-[#E6E0E9] border-t border-white/10'
                        : currentTheme === 'winamp'
                        ? 'bg-[#1C1C1E] text-[#00FF00] border-2 border-[#555555] font-mono'
                        : currentTheme === 'dark'
                        ? 'bg-[#1E1E1E] text-[#E0E0E0] border-t border-slate-700'
                        : currentTheme === 'vista'
                        ? 'bg-white/75 backdrop-blur-2xl text-slate-900 border-t border-white/80 shadow-2xl'
                        : 'bg-white text-slate-900'
                }`}
            >
                <div className={`mx-auto mb-3 h-1.5 w-12 rounded-full ${currentTheme === 'darkFluid' ? 'bg-white/20' : 'bg-slate-300'}`} />

                {/* Drawer Header */}
                <div className={`flex items-center justify-between border-b pb-3 ${currentTheme === 'darkFluid' ? 'border-white/10' : 'border-slate-100'}`}>
                    <div className="flex items-center space-x-2.5">
                        <AppLogo className="h-9 w-9 rounded-xl shadow-xs shrink-0" />
                        <div>
                            <h3 className={`text-sm font-extrabold ${currentTheme === 'darkFluid' ? 'text-[#E6E0E9]' : currentTheme === 'winamp' ? 'text-[#00FF00]' : 'text-[#39393A]'}`}>
                                Menu Kalender
                            </h3>
                            <p className={`text-[11px] font-medium ${currentTheme === 'darkFluid' ? 'text-[#CAC4D0]' : currentTheme === 'winamp' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                JadwalPriok
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`rounded-full p-1.5 ${currentTheme === 'darkFluid' ? 'text-[#CAC4D0] hover:bg-white/10 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Action Tools Grid */}
                <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                onSelectTab('holiday');
                                onClose();
                            }}
                            className={`flex items-center space-x-2.5 rounded-xl border p-2.5 text-left text-xs font-bold transition-colors ${
                                pageTab === 'holiday'
                                    ? 'border-rose-300 bg-[#BE1A1A] text-white ring-2 ring-rose-300/40'
                                    : 'border-rose-400 bg-[#DC2626] hover:bg-[#B91C1C] text-white'
                            }`}
                        >
                            <Flag className="h-4 w-4 fill-white shrink-0" />
                            <span>Hari Libur</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                onSelectTab('settings');
                                onClose();
                            }}
                            className={`flex items-center space-x-2.5 rounded-xl border p-2.5 text-left text-xs font-bold transition-colors ${
                                pageTab === 'settings'
                                    ? 'border-teal-300 bg-[#1b4b4b] text-white ring-2 ring-teal-300/40'
                                    : 'border-white/20 bg-[#225e5e] hover:bg-[#1b4b4b] text-white'
                            }`}
                        >
                            <Sliders className="h-4 w-4 text-teal-200 shrink-0" />
                            <span>Pengaturan</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                onSelectTab('version');
                                onClose();
                            }}
                            className={`col-span-2 flex items-center justify-center space-x-2 rounded-xl border p-2.5 text-center text-xs font-bold transition-all shadow-xs cursor-pointer ${
                                pageTab === 'version'
                                    ? 'border-teal-400 bg-teal-600 text-white ring-2 ring-teal-300/40'
                                    : 'border-teal-500/30 bg-[#1e4d4d] hover:bg-[#285e5e] text-teal-100'
                            }`}
                        >
                            <History className="h-4 w-4 text-teal-200 shrink-0" />
                            <span>Menu Versi Aplikasi (v{appVersion})</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
