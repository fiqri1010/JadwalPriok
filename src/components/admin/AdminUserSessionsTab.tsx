import React, { useState } from 'react';
import {
    Laptop,
    Smartphone,
    Monitor,
    Tablet,
    ChevronDown,
    ChevronUp,
    Clock,
    Search,
    Filter,
    Shield,
    CheckCircle2,
    Users,
    Activity,
    MapPin,
    Globe,
    Layers,
} from 'lucide-react';
import { UserAccount, UserSessionRecord } from '../../types/admin';
import { AppTheme } from '../../types';
import { getSimpleDeviceType, getSimpleOS, getDeviceMacAddress } from '../../utils/deviceDetector';

interface AdminUserSessionsTabProps {
    users: UserAccount[];
    sessions: UserSessionRecord[];
    theme?: AppTheme;
}

export const AdminUserSessionsTab: React.FC<AdminUserSessionsTabProps> = ({
    users,
    sessions,
    theme = 'default',
}) => {
    const isIndustrial = theme === 'industrial';
    const isPaperSketch = theme === 'paperSketch';
    const isTechnical = theme === 'technical';
    const isWinamp = theme === 'winamp';
    const isDark = theme === 'dark';

    const [searchQuery, setSearchQuery] = useState('');
    // Accordion folded states (User NIP keys mapped to boolean isFolded)
    const [foldedUsers, setFoldedUsers] = useState<Record<string, boolean>>(() => {
        // Default: buka lipatan user pertama, lipat yang lain
        const initial: Record<string, boolean> = {};
        users.forEach((u, idx) => {
            initial[u.nip] = idx !== 0; // True means folded (tertutup)
        });
        return initial;
    });

    const toggleFold = (nip: string) => {
        setFoldedUsers((prev) => ({
            ...prev,
            [nip]: !prev[nip],
        }));
    };

    const expandAll = () => {
        const allOpen: Record<string, boolean> = {};
        users.forEach((u) => {
            allOpen[u.nip] = false;
        });
        setFoldedUsers(allOpen);
    };

    const collapseAll = () => {
        const allClosed: Record<string, boolean> = {};
        users.forEach((u) => {
            allClosed[u.nip] = true;
        });
        setFoldedUsers(allClosed);
    };

    const getDeviceIcon = (type: string, className = 'w-4 h-4') => {
        switch (type) {
            case 'desktop':
                return <Monitor className={className} />;
            case 'laptop':
                return <Laptop className={className} />;
            case 'tablet':
                return <Tablet className={className} />;
            default:
                return <Smartphone className={className} />;
        }
    };

    // Filter users
    const filteredUsers = users.filter((u) => {
        const matchesQuery =
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.unitPosko.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesQuery;
    });

    // Summary counts
    const totalSessions = sessions.length;
    const onlineSessions = sessions.filter((s) => s.isOnline).length;

    return (
        <div className="space-y-4">
            {/* Header & Global Session Statistics */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
                                Pemantauan Sesi Pengguna Posko
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                {onlineSessions} Online
                            </span>
                        </div>
                        <p className="text-xs opacity-70">
                            Log audit perangkat komputer & gawai yang terhubung per pengguna dengan tampilan lipatan interaktif (Folded Cards)
                        </p>
                    </div>
                </div>

                {/* Accordion Global Controls */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={expandAll}
                        className="px-3 py-1.5 rounded-lg border border-current/20 hover:bg-current/10 text-xs font-bold cursor-pointer transition-all"
                    >
                        Buka Semua Lipatan
                    </button>
                    <button
                        type="button"
                        onClick={collapseAll}
                        className="px-3 py-1.5 rounded-lg border border-current/20 hover:bg-current/10 text-xs font-bold cursor-pointer transition-all"
                    >
                        Tutup Semua Lipatan
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                isIndustrial
                    ? 'bg-[#0F1115] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                    : isPaperSketch
                    ? 'bg-white border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                    : isDark
                    ? 'bg-[#161616] border-slate-800'
                    : 'bg-white border-slate-200'
            }`}>
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari sesi berdasarkan Nama Pegawai, NIP, atau Posko..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-current/20 bg-current/5 outline-none font-bold focus:border-teal-500"
                    />
                </div>
                <div className="text-xs opacity-75 font-mono shrink-0">
                    Total: <strong>{totalSessions} Sesi Terdaftar</strong>
                </div>
            </div>

            {/* Folded Cards List per User */}
            <div className="space-y-3">
                {filteredUsers.map((user) => {
                    const userSessions = sessions.filter((s) => s.userNip === user.nip);
                    const isFolded = foldedUsers[user.nip] ?? false;
                    const hasActiveSession = userSessions.some((s) => s.isOnline);

                    return (
                        <div
                            key={user.id}
                            className={`rounded-xl border overflow-hidden transition-all ${
                                isIndustrial
                                    ? 'bg-[#0F1115] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                                    : isPaperSketch
                                    ? 'bg-white border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
                                    : isDark
                                    ? 'bg-[#1E1E1E] border-slate-800'
                                    : 'bg-white border-slate-200'
                            }`}
                        >
                            {/* Folded Card Header (Click to Toggle) */}
                            <button
                                type="button"
                                onClick={() => toggleFold(user.nip)}
                                className={`w-full p-3.5 sm:p-4 text-left flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                                    !isFolded ? 'bg-current/5 border-b border-current/10' : 'hover:bg-current/5'
                                }`}
                            >
                                <div className="flex items-center space-x-3 min-w-0">
                                    <div className={`p-2 rounded-xl shrink-0 ${
                                        hasActiveSession
                                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                            : 'bg-current/10 opacity-70'
                                    }`}>
                                        <Users className="w-4 h-4" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-xs sm:text-sm font-extrabold truncate">{user.name}</h4>
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-current/10">
                                                {user.authorityName}
                                            </span>
                                            {userSessions.length > 0 ? (
                                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                                    hasActiveSession
                                                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                                        : 'bg-slate-500/15 text-slate-600 border border-slate-500/30'
                                                }`}>
                                                    {userSessions.length} Sesi Perangkat
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 border border-amber-500/30 font-bold">
                                                    Belum Ada Sesi
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] opacity-75 font-mono">
                                            NIP: {user.nip} • {user.unitPosko}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 shrink-0">
                                    <span className="text-xs opacity-60 font-bold hidden sm:inline">
                                        {isFolded ? 'Buka Detail Sesi' : 'Tutup Lipatan'}
                                    </span>
                                    {isFolded ? (
                                        <ChevronDown className="w-5 h-5 opacity-70" />
                                    ) : (
                                        <ChevronUp className="w-5 h-5 opacity-70 text-teal-500" />
                                    )}
                                </div>
                            </button>

                            {/* Folded Body: Device Sessions Breakdown */}
                            {!isFolded && (
                                <div className="p-3.5 sm:p-4 space-y-2.5 animate-in fade-in duration-150">
                                    {userSessions.length > 0 ? (
                                        userSessions.map((session) => (
                                            <div
                                                key={session.id}
                                                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                                                    session.isOnline
                                                        ? isIndustrial
                                                            ? 'bg-[#1A1D23] border-[#2DD4BF]/40'
                                                            : 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-300/50 dark:border-teal-700/50'
                                                        : 'bg-current/5 border-current/10'
                                                }`}
                                            >
                                                <div className="space-y-1 text-xs font-mono flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <span className="text-xs font-bold font-sans">
                                                            {session.deviceName}
                                                        </span>
                                                        {session.isOnline && (
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500 text-white shadow-2xs">
                                                                Sedang Aktif
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold font-sans opacity-75">Tipe & OS : </span>
                                                        <span className="font-bold text-teal-600 dark:text-teal-400">{getSimpleDeviceType(session.deviceType)}</span>
                                                        <span className="opacity-75 font-sans"> & </span>
                                                        <span className="font-bold text-teal-600 dark:text-teal-400">{getSimpleOS(session.os)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-bold font-sans opacity-75">Browser: </span>
                                                        <span className="font-bold">{session.browser}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-bold font-sans opacity-75">IP & Lokasi: </span>
                                                        <span className="font-bold">{session.ipAddress}</span>
                                                        <span className="opacity-75 font-sans"> | </span>
                                                        <span className="font-bold">{session.location.includes(',') ? session.location : `Tanjung Priok, ${session.location}`}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-bold font-sans opacity-75">MAC Address: </span>
                                                        <span className="font-bold tracking-wider">{session.macAddress || getDeviceMacAddress()}</span>
                                                    </div>
                                                </div>

                                                <div className="text-right shrink-0 self-end sm:self-start pt-0.5">
                                                    <span className={`text-[11px] font-mono font-bold block ${
                                                        session.isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'opacity-60'
                                                    }`}>
                                                        {session.lastActive}
                                                    </span>
                                                    <span className="text-[10px] opacity-60 font-mono block mt-0.5">
                                                        Login: {session.loginTime}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center rounded-lg border border-dashed border-current/15 opacity-60 text-xs font-bold">
                                            Pengguna ini belum pernah mencatatkan sesi login aktif di sistem.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
