import React, { useState } from 'react';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Trash2,
    KeyRound,
    Filter,
    Search,
    ShieldAlert,
    Archive,
    Check,
    X,
    Building2,
    UserCheck,
} from 'lucide-react';
import { UserAccount, UserApprovalRequest } from '../../types/admin';
import { AppTheme } from '../../types';
import { getApprovalRequests, saveApprovalRequests, purgeUserDataCompletely } from '../../utils/adminStorage';

interface AdminApprovalsTabProps {
    users: UserAccount[];
    onUpdateUsers: (users: UserAccount[]) => void;
    onShowToast: (msg: string) => void;
    theme?: AppTheme;
}

export const AdminApprovalsTab: React.FC<AdminApprovalsTabProps> = ({
    users,
    onUpdateUsers,
    onShowToast,
    theme = 'default',
}) => {
    const isIndustrial = theme === 'industrial';
    const isPaperSketch = theme === 'paperSketch';
    const isTechnical = theme === 'technical';
    const isWinamp = theme === 'winamp';
    const isDark = theme === 'dark';
    const isVista = theme === 'vista';
    const isEditorial = theme === 'editorial';
    const isDashboard = theme === 'dashboard';

    const [requests, setRequests] = useState<UserApprovalRequest[]>(() => getApprovalRequests());
    const [viewMode, setViewMode] = useState<'pending' | 'archive'>('pending');
    const [typeFilter, setTypeFilter] = useState<'all' | 'delete_account' | 'reset_password' | 'change_role_ppf'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'rejected'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const handleApprove = (req: UserApprovalRequest) => {
        const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

        if (req.requestType === 'delete_account') {
            // Hapus seluruh data terkait pengguna secara menyeluruh dari aplikasi
            purgeUserDataCompletely(req.userNip);
            const updatedUsers = users.filter((u) => u.nip !== req.userNip);
            onUpdateUsers(updatedUsers);
            onShowToast(`Permintaan Hapus Akun ${req.userName} (NIP: ${req.userNip}) telah disetujui & seluruh data akun telah dihapus.`);
        } else if (req.requestType === 'reset_password') {
            // Kosongkan password untuk user
            const updatedUsers = users.map((u) => {
                if (u.nip === req.userNip) {
                    return {
                        ...u,
                        hasPassword: false,
                        passwordValue: '',
                    };
                }
                return u;
            });
            onUpdateUsers(updatedUsers);
            onShowToast(`Permintaan Reset Password ${req.userName} (NIP: ${req.userNip}) disetujui. Password berhasil dikosongkan.`);
        } else if (req.requestType === 'change_role_ppf') {
            // Ubah role pengguna ke PPF (User)
            const updatedUsers = users.map((u) => {
                if (u.nip === req.userNip) {
                    return {
                        ...u,
                        role: 'end-user' as const,
                        authorityProfileId: 'prof-petugas-posko',
                        authorityName: 'PPF',
                        isExternalNonAppUser: false,
                        isActive: true,
                    };
                }
                return u;
            });
            onUpdateUsers(updatedUsers);
            onShowToast(`Pengajuan Role User PPF untuk ${req.userName} (NIP: ${req.userNip}) disetujui. Role pengguna berhasil diubah ke PPF.`);
        }

        // Perbarui data pengajuan & otomatis pindah ke arsip
        const updatedRequests = requests.map((r) => {
            if (r.id === req.id) {
                return {
                    ...r,
                    status: 'approved' as const,
                    processedAt: nowStr,
                    processedBy: 'Admin Posko',
                };
            }
            return r;
        });

        setRequests(updatedRequests);
        saveApprovalRequests(updatedRequests);
    };

    const handleReject = (req: UserApprovalRequest) => {
        const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

        const updatedRequests = requests.map((r) => {
            if (r.id === req.id) {
                return {
                    ...r,
                    status: 'rejected' as const,
                    processedAt: nowStr,
                    processedBy: 'Admin Posko',
                };
            }
            return r;
        });

        setRequests(updatedRequests);
        saveApprovalRequests(updatedRequests);
        onShowToast(`Permintaan ${req.requestType === 'delete_account' ? 'Hapus Akun' : 'Reset Password'} dari ${req.userName} ditolak.`);
    };

    const pendingRequests = requests.filter((r) => r.status === 'pending');
    const archiveRequests = requests.filter((r) => r.status === 'approved' || r.status === 'rejected');

    const displayedRequests = (viewMode === 'pending' ? pendingRequests : archiveRequests).filter((r) => {
        const matchesType = typeFilter === 'all' || r.requestType === typeFilter;
        const matchesStatus = viewMode === 'pending' || statusFilter === 'all' || r.status === statusFilter;
        const matchesSearch =
            r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.userNip.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.unitPosko.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.reason && r.reason.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesType && matchesStatus && matchesSearch;
    });

    const pendingCount = pendingRequests.length;
    const archiveCount = archiveRequests.length;

    return (
        <div className="space-y-3.5">
            {/* Header: Judul di Kiri & Tab Arsip di Kanan */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`p-2 rounded-xl shrink-0 ${
                        isIndustrial
                            ? 'bg-[#0F1115] text-[#2DD4BF] border border-[#2DD4BF]/40'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    }`}>
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide truncate">
                                Persetujuan Permintaan Pengguna
                            </h3>
                            {pendingCount > 0 && viewMode === 'pending' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500 text-white animate-pulse">
                                    {pendingCount} Menunggu
                                </span>
                            ) : null}
                        </div>
                        <p className="text-xs opacity-70 truncate">
                            Daftar permintaan reset password dan hapus akun user
                        </p>
                    </div>
                </div>

                {/* Tab Switcher: Menunggu vs Arsip (Diletakkan di paling kanan div) */}
                <div
                    className={`relative p-[2.5px] rounded-[8px] flex items-center select-none shrink-0 self-start sm:self-center ${
                        isWinamp
                            ? 'bg-black border border-zinc-700'
                            : isDark
                            ? 'bg-[#161616] border border-slate-800'
                            : isVista
                            ? 'bg-sky-100/70 border border-sky-200/80'
                            : isPaperSketch
                            ? 'bg-[#fdfcf0] border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                            : isIndustrial
                            ? 'bg-[#0F1115] border border-[rgba(226,232,240,0.15)] font-["JetBrains_Mono"]'
                            : isTechnical
                            ? 'bg-[#F8F7F4] border-[1.5px] border-[#111113] font-["JetBrains_Mono"]'
                            : isEditorial
                            ? 'bg-[#fcfbf9] border border-slate-300 font-serif'
                            : isDashboard
                            ? 'bg-[#FFF0BE] border border-[#4D2A00]/25 text-[#4D2A00]'
                            : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700'
                    }`}
                >
                    {/* Tab 1: Menunggu */}
                    <button
                        type="button"
                        onClick={() => setViewMode('pending')}
                        className={`relative z-10 px-3 py-1.5 text-xs font-bold rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 ${
                            viewMode === 'pending'
                                ? isIndustrial
                                    ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40 shadow-xs'
                                    : isPaperSketch
                                    ? 'bg-[#ff4747] text-white border-2 border-[#2b2b2b]'
                                    : isTechnical
                                    ? 'bg-[#111113] text-white'
                                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                                : 'opacity-65 hover:opacity-100'
                        }`}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Menunggu</span>
                        {pendingCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black bg-rose-500 text-white">
                                {pendingCount}
                            </span>
                        )}
                    </button>

                    {/* Tab 2: Arsip */}
                    <button
                        type="button"
                        onClick={() => setViewMode('archive')}
                        className={`relative z-10 px-3 py-1.5 text-xs font-bold rounded-[6px] transition-all cursor-pointer flex items-center gap-1.5 ${
                            viewMode === 'archive'
                                ? isIndustrial
                                    ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40 shadow-xs'
                                    : isPaperSketch
                                    ? 'bg-[#ff4747] text-white border-2 border-[#2b2b2b]'
                                    : isTechnical
                                    ? 'bg-[#111113] text-white'
                                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                                : 'opacity-65 hover:opacity-100'
                        }`}
                    >
                        <Archive className="w-3.5 h-3.5" />
                        <span>Arsip</span>
                        {archiveCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black bg-slate-400/20 text-current border border-current/20">
                                {archiveCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar (Minimalist) */}
            <div className={`p-2.5 sm:p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                isIndustrial
                    ? 'bg-[#0F1115] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                    : isPaperSketch
                    ? 'bg-white border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                    : isDark
                    ? 'bg-[#161616] border-slate-800'
                    : isDashboard
                    ? 'bg-[#FFF0BE] border-[#4D2A00]/25 text-[#4D2A00]'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
            }`}>
                <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari Nama, NIP, Posko, atau Alasan..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-current/15 bg-current/5 outline-none font-medium focus:border-amber-500 transition-colors"
                    />
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-x-auto no-scrollbar py-0.5">
                    <div className="flex items-center gap-1 text-xs shrink-0">
                        <Filter className="w-3.5 h-3.5 opacity-60" />
                        <span className="opacity-70 font-medium">Tipe:</span>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as any)}
                            className="text-xs py-1 px-2 rounded-lg border border-current/20 bg-current/5 font-semibold outline-none cursor-pointer"
                        >
                            <option value="all">Semua Tipe</option>
                            <option value="delete_account">Hapus Akun</option>
                            <option value="reset_password">Reset Password</option>
                        </select>
                    </div>

                    {viewMode === 'archive' && (
                        <div className="flex items-center gap-1 text-xs shrink-0">
                            <span className="opacity-70 font-medium">Status:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="text-xs py-1 px-2 rounded-lg border border-current/20 bg-current/5 font-semibold outline-none cursor-pointer"
                            >
                                <option value="all">Semua Status</option>
                                <option value="approved">Disetujui</option>
                                <option value="rejected">Ditolak</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* List Permintaan / Arsip (Minimalist Card Row Layout) */}
            <div className="space-y-2.5">
                {displayedRequests.map((req) => {
                    const isPending = req.status === 'pending';
                    const isApproved = req.status === 'approved';
                    const isRejected = req.status === 'rejected';
                    const isDelete = req.requestType === 'delete_account';

                    return (
                        <div
                            key={req.id}
                            className={`p-3 sm:p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                isPending
                                    ? isIndustrial
                                        ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.18)] hover:border-[#2DD4BF]/50'
                                        : isDashboard
                                        ? 'bg-[#FFF9E6] border-[#4D2A00]/25 text-[#4D2A00] shadow-xs'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                                    : isIndustrial
                                    ? 'bg-[#0F1115]/80 border-[rgba(226,232,240,0.08)] opacity-85'
                                    : isDashboard
                                    ? 'bg-[#FFF4CE]/80 border-[#4D2A00]/15 text-[#4D2A00] opacity-90'
                                    : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 opacity-90'
                            }`}
                        >
                            {/* Kiri: Ikon & Informasi Pengguna */}
                            <div className="flex items-start space-x-3 min-w-0 flex-1">
                                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                                    isDelete
                                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                }`}>
                                    {isDelete ? <Trash2 className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
                                </div>

                                <div className="min-w-0 space-y-1 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-xs sm:text-sm font-black tracking-tight text-current truncate">
                                            {req.userName}
                                        </span>

                                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                                            isDelete
                                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25'
                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                                        }`}>
                                            {isDelete ? 'Hapus Akun' : 'Reset Password'}
                                        </span>

                                        {isApproved && (
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                                <Check className="w-2.5 h-2.5" />
                                                Disetujui
                                            </span>
                                        )}

                                        {isRejected && (
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                                                <X className="w-2.5 h-2.5" />
                                                Ditolak
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-[11px] opacity-75 font-mono flex-wrap">
                                        <span>NIP: <strong>{req.userNip}</strong></span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1 font-sans">
                                            <Building2 className="w-3 h-3 opacity-60" />
                                            {req.unitPosko}
                                        </span>
                                    </div>

                                    {req.reason && (
                                        <p className="text-[11px] opacity-75 italic line-clamp-2">
                                            Alasan: "{req.reason}"
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Kanan: Tanggal "Diajukan" di Kanan Atas, dan "Diproses" / Tombol Aksi di Bawahnya */}
                            <div className="flex flex-col sm:items-end justify-between gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-current/10">
                                {/* Kanan Atas: Diajukan */}
                                <div className="flex items-center sm:justify-end gap-1 text-[11px] font-mono opacity-70">
                                    <Clock className="w-3 h-3 opacity-60 shrink-0" />
                                    <span>Diajukan: {req.requestedAt}</span>
                                </div>

                                {/* Kanan Bawah (Dibawahnya): Diproses / Tombol Aksi */}
                                {isPending ? (
                                    <div className="flex items-center gap-1.5 sm:justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleReject(req)}
                                            className="px-2.5 py-1 text-xs font-bold rounded-lg border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer flex items-center gap-1 transition-all active:scale-95"
                                        >
                                            <XCircle className="w-3.5 h-3.5" />
                                            <span>Tolak</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleApprove(req)}
                                            className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer flex items-center gap-1 transition-all active:scale-95"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>Setujui</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center sm:justify-end gap-1 text-[10px] font-mono opacity-60">
                                        <span>Diproses: {req.processedAt || '-'}</span>
                                        {req.processedBy && <span className="opacity-75">({req.processedBy})</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {displayedRequests.length === 0 && (
                    <div className="py-10 text-center rounded-xl border border-dashed border-current/20 opacity-60">
                        {viewMode === 'pending' ? (
                            <>
                                <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-500 mb-1.5" />
                                <p className="text-xs font-bold">Tidak ada permohonan yang menunggu persetujuan.</p>
                            </>
                        ) : (
                            <>
                                <Archive className="w-7 h-7 mx-auto opacity-40 mb-1.5" />
                                <p className="text-xs font-bold">Arsip persetujuan kosong atau tidak sesuai filter.</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
