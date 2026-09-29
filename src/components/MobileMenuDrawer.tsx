import React from 'react';
import { X, Flag, Sliders, History, ListTodo, ShieldAlert, User, Fingerprint, Shield } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { AppTheme } from '../types';

type PageTabType = 'calendar' | 'holiday' | 'settings' | 'version' | 'roadmap' | 'admin';

interface MobileMenuDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    pageTab: PageTabType;
    onSelectTab: (tab: PageTabType) => void;
    currentTheme: AppTheme;
    appVersion: string;
    isAdmin?: boolean;
    userName?: string;
    userNip?: string;
    userRole?: 'admin' | 'end-user';
}

export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
    isOpen,
    onClose,
    pageTab,
    onSelectTab,
    currentTheme,
    appVersion,
    isAdmin = true,
    userName,
    userNip,
    userRole,
}) => {
    if (!isOpen) return null;

    const activeUserName = userName || localStorage.getItem('jadwalpriok_user_name') || 'Petugas Posko Shift';
    const activeUserNip = userNip || localStorage.getItem('jadwalpriok_user_nip') || '199208152015021002';
    const activeRole = userRole || (isAdmin ? 'admin' : 'end-user');

    return (
        <div className="fixed inset-0 z-[99990] flex items-end justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
                className="fixed inset-0"
                onClick={onClose}
            />
            <div
                className={`relative z-10 w-full max-w-lg rounded-t-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto ${
                    currentTheme === 'paperSketch'
                        ? 'bg-[#ffffff] text-[#2b2b2b] border-t-[3.5px] border-[#2b2b2b] shadow-[0_-8px_0px_#2b2b2b] font-[\'Gaegu\'] text-base'
                        : currentTheme === 'winamp'
                        ? 'bg-[#1C1C1E] text-[#00FF00] border-2 border-[#555555] font-mono'
                        : currentTheme === 'dark'
                        ? 'bg-[#1E1E1E] text-[#E0E0E0] border-t border-slate-700'
                        : currentTheme === 'vista'
                        ? 'bg-white/75 backdrop-blur-2xl text-slate-900 border-t border-white/80 shadow-2xl'
                        : 'bg-white text-slate-900'
                }`}
            >
                <div className={`mx-auto mb-3 h-1.5 w-12 rounded-full ${currentTheme === 'paperSketch' ? 'bg-[#2b2b2b]' : 'bg-slate-300'}`} />

                {/* Drawer Header */}
                <div className={`flex items-center justify-between border-b pb-3 ${currentTheme === 'paperSketch' ? 'border-b-2 border-dashed border-[#2b2b2b]' : 'border-slate-100 dark:border-slate-800'}`}>
                    <div className="flex items-center space-x-2.5">
                        <AppLogo className="h-9 w-9 rounded-xl shadow-xs shrink-0" />
                        <div>
                            <h3 className={`text-base font-extrabold ${currentTheme === 'paperSketch' ? 'font-[\'Gochi_Hand\'] text-xl text-[#2b2b2b]' : currentTheme === 'winamp' ? 'text-[#00FF00]' : 'text-[#39393A] dark:text-slate-100'}`}>
                                Menu Kalender
                            </h3>
                            <p className={`text-xs font-medium ${currentTheme === 'paperSketch' ? 'text-[#2b2b2b]/70 font-mono' : currentTheme === 'winamp' ? 'text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                JadwalPriok
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`rounded-full p-1.5 ${currentTheme === 'paperSketch' ? 'border-2 border-[#2b2b2b] bg-white text-[#2b2b2b] hover:bg-[#ff4747] hover:text-white shadow-[1px_1px_0px_#2b2b2b]' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700'}`}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* User Profile Card: Nama dan NIP Pengguna (Statis) */}
                <div className="mt-3">
                    <div
                        className={`w-full text-left p-2.5 rounded-xl border flex items-center space-x-3 select-none ${
                            currentTheme === 'paperSketch'
                                ? 'bg-white border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                                : currentTheme === 'winamp'
                                ? 'bg-black border border-[#00FF00]/50 text-[#00FF00]'
                                : 'bg-current/5 border-current/10'
                        }`}
                    >
                        <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                            {activeRole === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold truncate">{activeUserName}</div>
                            <div className="flex items-center gap-1 opacity-75 mt-0.5">
                                <Fingerprint className="w-3 h-3 text-current/60" />
                                <span className="text-[11px] font-mono font-bold tracking-wider">{activeUserNip}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Tools Grid */}
                <div className="mt-3 space-y-2">
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
                            className={`flex items-center justify-center space-x-2 rounded-xl border p-2.5 text-center text-xs font-bold transition-all shadow-xs cursor-pointer ${
                                pageTab === 'version'
                                    ? 'border-teal-400 bg-teal-600 text-white ring-2 ring-teal-300/40'
                                    : 'border-teal-500/30 bg-[#1e4d4d] hover:bg-[#285e5e] text-teal-100'
                            }`}
                        >
                            <History className="h-4 w-4 text-teal-200 shrink-0" />
                            <span>Versi (v{appVersion})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                onSelectTab('roadmap');
                                onClose();
                            }}
                            className={`flex items-center justify-center space-x-2 rounded-xl border p-2.5 text-center text-xs font-bold transition-all shadow-xs cursor-pointer ${
                                pageTab === 'roadmap'
                                    ? 'border-amber-400 bg-amber-600 text-white ring-2 ring-amber-300/40'
                                    : 'border-amber-500/30 bg-[#4d3a1e] hover:bg-[#5e4728] text-amber-100'
                            }`}
                        >
                            <ListTodo className="h-4 w-4 text-amber-200 shrink-0" />
                            <span>Rencana Fitur</span>
                        </button>

                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => {
                                    onSelectTab('admin');
                                    onClose();
                                }}
                                className={`col-span-2 flex items-center justify-center space-x-2 rounded-xl border p-2.5 text-center text-xs font-bold transition-all shadow-xs cursor-pointer ${
                                    pageTab === 'admin'
                                        ? 'border-rose-400 bg-rose-600 text-white ring-2 ring-rose-300/40'
                                        : 'border-rose-500/40 bg-rose-950/60 hover:bg-rose-900/60 text-rose-200'
                                }`}
                            >
                                <ShieldAlert className="h-4 w-4 text-rose-300 shrink-0" />
                                <span>Dashboard Administrator Posko</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
