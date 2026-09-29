import React, { useState } from 'react';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Trash2,
    KeyRound,
    UserCheck,
    Filter,
    Search,
    ShieldAlert,
    AlertTriangle,
    User,
    Building2,
    Fingerprint,
} from 'lucide-react';
import { UserAccount, UserApprovalRequest } from '../../types/admin';
import { AppTheme } from '../../types';
import { getApprovalRequests, saveApprovalRequests } from '../../utils/adminStorage';

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

    const [requests, setRequests] = useState<UserApprovalRequest[]>(() => getApprovalRequests());
    const [typeFilter, setTypeFilter] = useState<'all' | 'delete_account' | 'reset_password'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const handleApprove = (req: UserApprovalRequest) => {
        const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

        if (req.requestType === 'delete_account') {
            // Remove user from user list
            const updatedUsers = users.filter((u) => u.nip !== req.userNip);
            onUpdateUsers(updatedUsers);
            onShowToast(`Permintaan Hapus Akun ${req.userName} (NIP: ${req.userNip}) telah disetujui & akun dihapus.`);
        } else if (req.requestType === 'reset_password') {
            // Clear password for user
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
        }

        // Update request record
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

    const filteredRequests = requests.filter((r) => {
        const matchesType = typeFilter === 'all' || r.requestType === typeFilter;
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        const matchesSearch =
            r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.userNip.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.unitPosko.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesStatus && matchesSearch;
    });

    const pendingCount = requests.filter((r) => r.status === 'pending').length;

    return (
        <div className="space-y-4">
            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
                                Halaman Persetujuan Permintaan Pengguna
                            </h3>
                            {pendingCount > 0 ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500 text-white animate-pulse">
                                    {pendingCount} Menunggu Tindakan
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                    Semua Selesai
                                </span>
                            )}
                        </div>
                        <p className="text-xs opacity-70">
                            Daftar antrean verifikasi permintaan penghapusan akun dan reset password dari pengguna posko
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
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
                        placeholder="Cari permohonan berdasarkan Nama, NIP, atau Posko..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-current/20 bg-current/5 outline-none font-bold focus:border-amber-500"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <div className="flex items-center gap-1 text-xs shrink-0">
                        <Filter className="w-3.5 h-3.5 opacity-60" />
                        <span className="opacity-70 font-medium">Tipe:</span>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as any)}
                            className="text-xs p-1.5 rounded-lg border border-current/20 bg-current/5 font-bold outline-none cursor-pointer"
                        >
                            <option value="all">Semua Tipe</option>
                            <option value="delete_account">Hapus Akun</option>
                            <option value="reset_password">Reset Password</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1 text-xs shrink-0">
                        <span className="opacity-70 font-medium">Status:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="text-xs p-1.5 rounded-lg border border-current/20 bg-current/5 font-bold outline-none cursor-pointer"
                        >
                            <option value="all">Semua Status</option>
                            <option value="pending">Menunggu (Pending)</option>
                            <option value="approved">Disetujui</option>
                            <option value="rejected">Ditolak</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List Permintaan Persetujuan */}
            <div className="space-y-3">
                {filteredRequests.map((req) => {
                    const isPending = req.status === 'pending';
                    const isDelete = req.requestType === 'delete_account';

                    return (
                        <div
                            key={req.id}
                            className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3.5 transition-all ${
                                isPending
                                    ? isDelete
                                        ? isIndustrial
                                            ? 'bg-[#1A1D23] border-rose-500/40'
                                            : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                                        : isIndustrial
                                        ? 'bg-[#1A1D23] border-amber-500/40'
                                        : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                                    : 'opacity-70 bg-current/5 border-current/10'
                            }`}
                        >
                            <div className="flex items-start space-x-3 min-w-0">
                                <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                                    isDelete
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-amber-500 text-white'
                                }`}>
                                    {isDelete ? <Trash2 className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
                                </div>

                                <div className="min-w-0 space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-xs sm:text-sm font-black truncate">{req.userName}</h4>
                                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                                            isDelete
                                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                        }`}>
                                            {isDelete ? 'Permintaan Hapus Akun' : 'Permintaan Reset Password'}
                                        </span>

                                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                                            req.status === 'pending'
                                                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                                : req.status === 'approved'
                                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                                : 'bg-slate-500/20 text-slate-700 dark:text-slate-300 border border-slate-500/30'
                                        }`}>
                                            {req.status === 'pending' ? 'Menunggu Persetujuan' : req.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs opacity-75 font-mono flex-wrap">
                                        <span>NIP: <strong>{req.userNip}</strong></span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1 font-sans">
                                            <Building2 className="w-3 h-3 text-current/60" />
                                            {req.unitPosko}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Diajukan: {req.requestedAt}
                                        </span>
                                    </div>

                                    {req.reason && (
                                        <p className="text-xs opacity-80 pt-0.5">
                                            Alasan: <em>"{req.reason}"</em>
                                        </p>
                                    )}

                                    {req.processedAt && (
                                        <p className="text-[11px] opacity-60 font-mono">
                                            Diproses pada {req.processedAt} oleh {req.processedBy}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {isPending && (
                                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                                    <button
                                        type="button"
                                        onClick={() => handleReject(req)}
                                        className="px-3 py-1.5 text-xs font-bold rounded-lg border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer flex items-center gap-1 transition-all"
                                    >
                                        <XCircle className="w-3.5 h-3.5" />
                                        <span>Tolak</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleApprove(req)}
                                        className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Setujui</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredRequests.length === 0 && (
                    <div className="p-8 text-center rounded-xl border border-dashed border-current/20 opacity-60">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-1" />
                        <p className="text-xs font-bold">Tidak ada pengajuan persetujuan yang sesuai filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
