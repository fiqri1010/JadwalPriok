import React, { useState, useMemo, useEffect } from 'react';
import {
    Users,
    UserPlus,
    KeyRound,
    UserCheck,
    UserX,
    Edit3,
    Trash2,
    Shield,
    Search,
    Filter,
    Check,
    AlertCircle,
    CheckCircle2,
    Lock,
    Unlock,
    Building2,
    X,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Laptop,
    Radio,
    PowerOff,
    RefreshCw,
    Globe,
    Wifi,
} from 'lucide-react';
import { UserAccount, AuthorityProfile, UserRole, UserSessionRecord } from '../../types/admin';
import { AppTheme } from '../../types';
import { Checkbox } from '../ui/Checkbox';
import {
    getAllUserSessions,
    saveAllUserSessions,
    getApprovalRequests,
    saveApprovalRequests,
    purgeUserDataCompletely,
    LOCAL_STORAGE_CURRENT_NIP_KEY,
    LOCAL_STORAGE_CURRENT_PASS_KEY,
} from '../../utils/adminStorage';

export const POSKO_OPTIONS = [
    'Graha Segara Lt. 1',
    'Graha Ground',
    'CDC',
    'NPCT',
    'Koja',
];

/**
 * Hapus kata 'Posko' dari nama posko untuk konsistensi dan tampilan bersih
 */
export const cleanPoskoName = (name?: string): string => {
    if (!name) return '';
    return name.replace(/^Posko\s+/i, '').replace(/\bPosko\b/gi, '').trim() || name;
};

/**
 * Format nama display jika lebih dari 3 kata, inisialkan nama tengah.
 * Contoh: "Ahmad Fauzi Razna Sidakkal Harahap" -> "Ahmad F. R. S. Harahap"
 * Contoh: "Raden Muhammad Raka Pratama" -> "Raden M. R. Pratama"
 * Contoh: "Aldo Monang Simanjuntak" -> "Aldo Monang Simanjuntak" (3 kata tetap utuh)
 */
export const formatDisplayName = (fullName: string): string => {
    if (!fullName) return '';
    const trimmed = fullName.trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length <= 3) {
        return trimmed;
    }
    const first = parts[0];
    const last = parts[parts.length - 1];
    const middleInitials = parts
        .slice(1, parts.length - 1)
        .map((w) => {
            const cleanWord = w.replace(/[^a-zA-Z0-9]/g, '');
            return cleanWord ? `${cleanWord.charAt(0).toUpperCase()}.` : '';
        })
        .filter(Boolean)
        .join(' ');

    return `${first} ${middleInitials} ${last}`;
};

interface AdminUserListTabProps {
    users: UserAccount[];
    authorityProfiles: AuthorityProfile[];
    sessions?: UserSessionRecord[];
    onUpdateUsers: (users: UserAccount[]) => void;
    onShowToast: (msg: string) => void;
    theme?: AppTheme;
    currentRole?: UserRole;
}

export const AdminUserListTab: React.FC<AdminUserListTabProps> = ({
    users,
    authorityProfiles,
    sessions,
    onUpdateUsers,
    onShowToast,
    theme = 'default',
    currentRole = 'superadmin',
}) => {
    const isIndustrial = theme === 'industrial';
    const isPaperSketch = theme === 'paperSketch';
    const isTechnical = theme === 'technical';
    const isWinamp = theme === 'winamp';
    const isDark = theme === 'dark';
    const isDashboard = theme === 'dashboard';

    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    // Keyboard scroll for table horizontal navigation using ArrowLeft and ArrowRight
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeEl = document.activeElement;
            const isTyping = activeEl && (
                activeEl.tagName === 'INPUT' ||
                activeEl.tagName === 'TEXTAREA' ||
                activeEl.tagName === 'SELECT' ||
                (activeEl as HTMLElement).isContentEditable
            );

            if (isTyping) return;

            if (scrollContainerRef.current) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    scrollContainerRef.current.scrollBy({ left: -120, behavior: 'smooth' });
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    scrollContainerRef.current.scrollBy({ left: 120, behavior: 'smooth' });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Daftar sesi aktif yang tersinkronisasi penuh dengan Pengaturan Akun
    const [localSessions, setLocalSessions] = useState<UserSessionRecord[]>(() => sessions && sessions.length > 0 ? sessions : getAllUserSessions());

    useEffect(() => {
        if (sessions && sessions.length > 0) {
            setLocalSessions(sessions);
        } else {
            setLocalSessions(getAllUserSessions());
        }
    }, [sessions]);

    const activeSessions = localSessions;

    // Helper untuk mengecek apakah akun pengguna adalah Super Admin
    const isSuperAdminUser = (u: UserAccount) => {
        return (
            u.authorityProfileId === 'prof-superadmin' ||
            u.nip === '199510102015121002' ||
            (Boolean(u.authorityName) && u.authorityName.toLowerCase().includes('super admin'))
        );
    };

    // Akses dibekukan jika akun target adalah Super Admin DAN operator yang aktif bukan Super Admin
    // (role admin serta role dibawahnya dibekukan aksesnya ke akun super admin)
    const isAccountFrozen = (u: UserAccount) => {
        return isSuperAdminUser(u) && currentRole !== 'superadmin';
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | UserRole | 'external'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [poskoFilter, setPoskoFilter] = useState<'all' | string>('all');

    // Kumpulkan daftar penugasan Posko unik dari seluruh pengguna secara dinamis
    const uniquePoskoList = useMemo(() => {
        const set = new Set<string>();
        users.forEach((u) => {
            if (u.unitPosko && u.unitPosko.trim()) {
                set.add(cleanPoskoName(u.unitPosko.trim()));
            }
        });
        return Array.from(set).sort();
    }, [users]);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
    const [resettingUser, setResettingUser] = useState<UserAccount | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);
    const [sessionModalData, setSessionModalData] = useState<{ user: UserAccount; session: UserSessionRecord | null } | null>(null);

    // Force disconnect / logout session handler
    const handleTerminateSession = (targetNip: string, userName: string) => {
        const updated = localSessions.map((s) => {
            if (s.userNip === targetNip) {
                return {
                    ...s,
                    isOnline: false,
                    lastActive: 'Sesi diputus oleh Admin',
                };
            }
            return s;
        });
        setLocalSessions(updated);
        saveAllUserSessions(updated);
        if (sessionModalData && sessionModalData.user.nip === targetNip) {
            const updatedSession = updated.find((s) => s.userNip === targetNip) || null;
            setSessionModalData({ ...sessionModalData, session: updatedSession });
        }
        onShowToast(`Sesi perangkat untuk ${userName} (NIP: ${targetNip}) berhasil diputuskan.`);
    };

    // Refresh session data handler
    const handleRefreshSessions = () => {
        const refreshed = getAllUserSessions();
        setLocalSessions(refreshed);
        if (sessionModalData) {
            const updatedSession = refreshed.find((s) => s.userNip === sessionModalData.user.nip) || null;
            setSessionModalData({ ...sessionModalData, session: updatedSession });
        }
        onShowToast('Data sesi seluruh perangkat berhasil disinkronkan kembali.');
    };

    // Form state for Add/Edit
    const [formNip, setFormNip] = useState('');
    const [formName, setFormName] = useState('');
    const [formUnit, setFormUnit] = useState('Graha Segara Lt. 1');
    const [formProfileId, setFormProfileId] = useState(authorityProfiles[0]?.id || 'prof-petugas-posko');
    const [formSquad, setFormSquad] = useState<'Regu A' | 'Regu B' | 'Regu C' | 'Regu D' | 'Non-Regu'>('Regu A');
    const [formIsExternal, setFormIsExternal] = useState(false);
    const [formIsActive, setFormIsActive] = useState(true);

    const openAddModal = () => {
        setFormNip('');
        setFormName('');
        setFormUnit('Graha Segara Lt. 1');
        setFormProfileId(authorityProfiles.find(p => p.roleType === 'end-user')?.id || authorityProfiles[0]?.id || '');
        setFormSquad('Regu A');
        setFormIsExternal(false);
        setFormIsActive(true);
        setIsAddModalOpen(true);
    };

    const openEditModal = (user: UserAccount) => {
        if (isAccountFrozen(user)) {
            onShowToast('Akses edit ke akun Super Admin dibekukan untuk role Admin.');
            return;
        }
        setEditingUser(user);
        setFormNip(user.nip);
        setFormName(user.name);
        setFormUnit(cleanPoskoName(user.unitPosko));
        setFormProfileId(user.authorityProfileId);
        setFormSquad(user.assignedSquad || 'Regu A');
        setFormIsExternal(Boolean(user.isExternalNonAppUser));
        setFormIsActive(user.isActive);
    };

    const handleSaveAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formNip.trim() || !formName.trim()) {
            onShowToast('NIP dan Nama Pengguna wajib diisi.');
            return;
        }

        const selectedProfile = authorityProfiles.find((p) => p.id === formProfileId) || authorityProfiles[0];
        const newUser: UserAccount = {
            id: `usr-${Date.now()}`,
            nip: formNip.trim(),
            name: formName.trim(),
            unitPosko: cleanPoskoName(formUnit.trim()) || 'Graha Segara Lt. 1',
            role: selectedProfile?.roleType || 'end-user',
            authorityProfileId: selectedProfile?.id || '',
            authorityName: selectedProfile?.name || 'PPF',
            isActive: formIsActive,
            hasPassword: false,
            passwordValue: '',
            isExternalNonAppUser: formIsExternal,
            assignedSquad: formSquad,
            createdAt: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
            lastActive: 'Baru Dibuat',
        };

        const updated = [newUser, ...users];
        onUpdateUsers(updated);
        setIsAddModalOpen(false);
        onShowToast(`Pengguna "${newUser.name}" (NIP: ${newUser.nip}) berhasil ditambahkan.`);
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        if (isAccountFrozen(editingUser)) {
            onShowToast('Akses edit ke akun Super Admin dibekukan untuk role Admin.');
            setEditingUser(null);
            return;
        }
        if (!formName.trim()) {
            onShowToast('Nama pengguna tidak boleh kosong.');
            return;
        }

        const selectedProfile = authorityProfiles.find((p) => p.id === formProfileId) || authorityProfiles[0];
        const isSuperAdmin = isSuperAdminUser(editingUser);
        const finalActive = isSuperAdmin ? true : formIsActive;

        const updated = users.map((u) => {
            if (u.id === editingUser.id) {
                return {
                    ...u,
                    name: formName.trim(),
                    unitPosko: cleanPoskoName(formUnit.trim()) || cleanPoskoName(u.unitPosko),
                    role: selectedProfile?.roleType || u.role,
                    authorityProfileId: selectedProfile?.id || u.authorityProfileId,
                    authorityName: selectedProfile?.name || u.authorityName,
                    assignedSquad: formSquad,
                    isExternalNonAppUser: formIsExternal,
                    isActive: finalActive,
                };
            }
            return u;
        });

        onUpdateUsers(updated);
        setEditingUser(null);
        onShowToast(`Data pengguna "${formName}" berhasil diperbarui.`);
    };

    // Toggle Aktif via Checkbox
    const handleToggleCheckbox = (user: UserAccount) => {
        const isSuperAdmin = isSuperAdminUser(user);
        if (isSuperAdmin) {
            onShowToast('Akun Utama Super Admin tidak dapat dinonaktifkan.');
            return;
        }
        const nextState = !user.isActive;
        const updated = users.map((u) => (u.id === user.id ? { ...u, isActive: nextState } : u));
        onUpdateUsers(updated);
        onShowToast(`Akun ${user.name} (NIP: ${user.nip}) ${nextState ? 'diaktifkan' : 'dinonaktifkan'}.`);
    };

    // Eksekusi Reset Password (langsung mengosongkan password)
    const handleExecuteResetPassword = () => {
        if (!resettingUser) return;
        if (isAccountFrozen(resettingUser)) {
            onShowToast('Reset password akun Super Admin dibekukan untuk role Admin.');
            setResettingUser(null);
            return;
        }
        const updated = users.map((u) => {
            if (u.id === resettingUser.id) {
                return {
                    ...u,
                    hasPassword: false,
                    passwordValue: '',
                };
            }
            return u;
        });
        onUpdateUsers(updated);

        // Jika user yang direset sedang aktif di perangkat lokal, bersihkan password sesi
        try {
            const currentNip = localStorage.getItem(LOCAL_STORAGE_CURRENT_NIP_KEY);
            if (currentNip === resettingUser.nip) {
                localStorage.removeItem(LOCAL_STORAGE_CURRENT_PASS_KEY);
            }
        } catch {}

        // Otomatis tandai selesai pengajuan reset password di antrean persetujuan jika ada
        try {
            const pendingReqs = getApprovalRequests();
            const hasPending = pendingReqs.some(
                (r) => r.userNip === resettingUser.nip && r.requestType === 'reset_password' && r.status === 'pending'
            );
            if (hasPending) {
                const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
                const resolved = pendingReqs.map((r) => {
                    if (r.userNip === resettingUser.nip && r.requestType === 'reset_password' && r.status === 'pending') {
                        return { ...r, status: 'approved' as const, processedAt: nowStr, processedBy: 'Admin (Daftar Pengguna)' };
                    }
                    return r;
                });
                saveApprovalRequests(resolved);
            }
        } catch {}

        setResettingUser(null);
        onShowToast(`Password pengguna ${resettingUser.name} (NIP: ${resettingUser.nip}) berhasil direset & dikosongkan.`);
    };

    // Eksekusi Hapus User
    const handleExecuteDelete = () => {
        if (!deletingUser) return;
        if (isSuperAdminUser(deletingUser)) {
            onShowToast('Akun Super Admin tidak dapat dihapus.');
            setDeletingUser(null);
            return;
        }
        // Hapus seluruh data terkait pengguna secara menyeluruh dari aplikasi
        purgeUserDataCompletely(deletingUser.nip);
        const updated = users.filter((u) => u.id !== deletingUser.id);
        onUpdateUsers(updated);
        setDeletingUser(null);
        onShowToast(`Pengguna ${deletingUser.name} beserta seluruh datanya berhasil dihapus dari sistem posko.`);
    };

    // Filter pengguna
    const filteredUsers = users.filter((u) => {
        const cleanedUnit = cleanPoskoName(u.unitPosko);
        const matchesSearch =
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cleanedUnit.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesRole = true;
        if (roleFilter === 'admin') matchesRole = u.role === 'admin';
        else if (roleFilter === 'end-user') matchesRole = u.role === 'end-user' && !u.isExternalNonAppUser;
        else if (roleFilter === 'external') matchesRole = Boolean(u.isExternalNonAppUser);

        let matchesStatus = true;
        if (statusFilter === 'active') matchesStatus = u.isActive;
        else if (statusFilter === 'inactive') matchesStatus = !u.isActive;

        let matchesPosko = true;
        if (poskoFilter !== 'all') matchesPosko = cleanedUnit === poskoFilter;

        return matchesSearch && matchesRole && matchesStatus && matchesPosko;
    });

    // Sorting State
    type SortField = 'no' | 'name' | 'nip' | 'unitPosko' | 'session' | 'isActive' | 'hasPassword' | 'edit' | 'delete';
    type SortDirection = 'asc' | 'desc';

    const [sortField, setSortField] = useState<SortField>('no');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedUsers = useMemo(() => {
        const list = [...filteredUsers];
        if (sortField === 'no') {
            return sortDirection === 'asc' ? list : list.reverse();
        }
        list.sort((a, b) => {
            let valA: any = '';
            let valB: any = '';
            if (sortField === 'name') {
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
            } else if (sortField === 'nip') {
                valA = a.nip;
                valB = b.nip;
            } else if (sortField === 'unitPosko') {
                valA = a.unitPosko.toLowerCase();
                valB = b.unitPosko.toLowerCase();
            } else if (sortField === 'session') {
                const sessA = activeSessions.find((s) => s.userNip === a.nip);
                const sessB = activeSessions.find((s) => s.userNip === b.nip);
                valA = sessA ? (sessA.isOnline ? 2 : 1) : 0;
                valB = sessB ? (sessB.isOnline ? 2 : 1) : 0;
            } else if (sortField === 'isActive') {
                valA = a.isActive ? 1 : 0;
                valB = b.isActive ? 1 : 0;
            } else if (sortField === 'hasPassword') {
                valA = a.hasPassword ? 1 : 0;
                valB = b.hasPassword ? 1 : 0;
            } else if (sortField === 'edit') {
                valA = (a.authorityName || a.role).toLowerCase();
                valB = (b.authorityName || b.role).toLowerCase();
            } else if (sortField === 'delete') {
                valA = isSuperAdminUser(a) ? 0 : 1;
                valB = isSuperAdminUser(b) ? 0 : 1;
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        return list;
    }, [filteredUsers, sortField, sortDirection, activeSessions]);

    const renderSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="w-3 h-3 opacity-30 ml-1 inline-block shrink-0 transition-opacity group-hover:opacity-75" />;
        }
        return sortDirection === 'asc' ? (
            <ArrowUp className="w-3 h-3 text-teal-600 dark:text-teal-400 ml-1 inline-block shrink-0" />
        ) : (
            <ArrowDown className="w-3 h-3 text-teal-600 dark:text-teal-400 ml-1 inline-block shrink-0" />
        );
    };

    return (
        <div className="space-y-4">
            {/* Action Bar Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
                                Akun Pengguna
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                                {users.length} Total Pegawai
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={openAddModal}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center space-x-2 active:scale-95 transition-all self-start sm:self-center"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Tambah Pengguna Baru</span>
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className={`p-2 sm:p-2.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-2.5 ${
                isIndustrial
                    ? 'bg-[#0F1115] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                    : isPaperSketch
                    ? 'bg-white border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                    : isDark
                    ? 'bg-[#161616] border-slate-800'
                    : isDashboard
                    ? 'bg-[#FFF0BE] border-[#4D2A00]/25 text-[#4D2A00]'
                    : 'bg-white border-slate-200'
            }`}>
                <div className="relative flex-1 min-w-[180px] max-w-full md:max-w-xs">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder=""
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-current/20 bg-current/5 outline-none font-bold focus:border-teal-500 transition-colors"
                    />
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap overflow-x-auto no-scrollbar py-0.5">
                    <div className="flex items-center gap-1 text-xs shrink-0">
                        <Filter className="w-3 h-3 opacity-60 shrink-0" />
                        <span className="opacity-70 font-medium text-[11px]">Role:</span>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as any)}
                            className="text-xs py-1 px-1.5 rounded-lg border border-current/20 bg-current/5 font-bold outline-none cursor-pointer"
                        >
                            <option value="all">Semua Tipe</option>
                            <option value="admin">Admin</option>
                            <option value="end-user">End-User Posko</option>
                            <option value="external">Posko Luar (Non-User)</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1 text-xs shrink-0">
                        <span className="opacity-70 font-medium text-[11px]">Status:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="text-xs py-1 px-1.5 rounded-lg border border-current/20 bg-current/5 font-bold outline-none cursor-pointer"
                        >
                            <option value="all">Semua Status</option>
                            <option value="active">Hanya Aktif</option>
                            <option value="inactive">Nonaktif</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1 text-xs shrink-0">
                        <span className="opacity-70 font-medium text-[11px]">Posko:</span>
                        <select
                            value={poskoFilter}
                            onChange={(e) => setPoskoFilter(e.target.value)}
                            className="text-xs py-1 px-1.5 rounded-lg border border-current/20 bg-current/5 font-bold outline-none cursor-pointer max-w-[140px] truncate"
                        >
                            <option value="all">Semua Posko</option>
                            {uniquePoskoList.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* TABEL LIST PENGGUNA (Minimalis & High Information Density) */}
            <div className={`rounded-xl border overflow-hidden ${
                isIndustrial
                    ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                    : isPaperSketch
                    ? 'bg-white border-2 border-[#2b2b2b]'
                    : isDark
                    ? 'bg-[#161616] border-slate-800'
                    : isDashboard
                    ? 'bg-[#FFF9E6] border-[#4D2A00]/25 text-[#4D2A00]'
                    : 'bg-white border-slate-200'
            }`}>
                <div ref={scrollContainerRef} className="overflow-x-auto select-none no-scrollbar max-h-[520px] lg:max-h-[580px] overflow-y-auto">
                    <table className="w-full table-auto border-collapse text-xs">
                        <thead>
                            <tr className={`border-b border-current/15 text-center font-bold text-[10px] sm:text-[11px] uppercase tracking-wider sticky top-0 backdrop-blur-xs z-10 ${
                                isDashboard ? 'bg-[#FFF0BE] text-[#4D2A00]' : 'bg-slate-200/90 dark:bg-[#161616]/95'
                            }`}>
                                {/* 1. No */}
                                <th
                                    onClick={() => handleSort('no')}
                                    className={`py-2 px-1 text-center cursor-pointer hover:bg-current/10 transition-colors select-none group w-1 whitespace-nowrap ${
                                        sortField === 'no' ? 'text-teal-600 dark:text-teal-400 bg-current/5' : ''
                                    }`}
                                    title="Klik untuk mengurutkan No. Urut"
                                >
                                    <div className="inline-flex items-center justify-center gap-0.5 mx-auto text-center">
                                        <span>No.</span>
                                        {renderSortIcon('no')}
                                    </div>
                                </th>

                                {/* 2. Nama */}
                                <th
                                    onClick={() => handleSort('name')}
                                    className={`py-2 px-2 text-left cursor-pointer hover:bg-current/10 transition-colors select-none group whitespace-nowrap ${
                                        sortField === 'name' ? 'text-teal-600 dark:text-teal-400 bg-current/5' : ''
                                    }`}
                                    title="Klik untuk mengurutkan Nama Pengguna"
                                >
                                    <div className="inline-flex items-center gap-0.5">
                                        <span>Nama</span>
                                        {renderSortIcon('name')}
                                    </div>
                                </th>

                                {/* 3. NIP */}
                                <th
                                    onClick={() => handleSort('nip')}
                                    className={`py-2 px-1 text-center cursor-pointer hover:bg-current/10 transition-colors select-none group w-1 whitespace-nowrap ${
                                        sortField === 'nip' ? 'text-teal-600 dark:text-teal-400 bg-current/5' : ''
                                    }`}
                                    title="Klik untuk mengurutkan NIP"
                                >
                                    <div className="inline-flex items-center justify-center gap-0.5 mx-auto text-center">
                                        <span>NIP</span>
                                        {renderSortIcon('nip')}
                                    </div>
                                </th>

                                {/* 4. Posko */}
                                <th
                                    onClick={() => handleSort('unitPosko')}
                                    className={`py-2 px-1.5 text-left cursor-pointer hover:bg-current/10 transition-colors select-none group whitespace-nowrap ${
                                        sortField === 'unitPosko' ? 'text-teal-600 dark:text-teal-400 bg-current/5' : ''
                                    }`}
                                    title="Klik untuk mengurutkan Posko"
                                >
                                    <div className="inline-flex items-center gap-0.5">
                                        <span>Posko</span>
                                        {renderSortIcon('unitPosko')}
                                    </div>
                                </th>

                                {/* 5. Sesi */}
                                <th
                                    onClick={() => handleSort('session')}
                                    className={`py-2 px-1 text-center cursor-pointer hover:bg-current/10 transition-colors select-none group w-1 whitespace-nowrap ${
                                        sortField === 'session' ? 'text-teal-600 dark:text-teal-400 bg-current/5' : ''
                                    }`}
                                    title="Klik untuk mengurutkan status Sesi Perangkat"
                                >
                                    <div className="inline-flex items-center justify-center gap-0.5 mx-auto text-center">
                                        <span>Sesi</span>
                                        {renderSortIcon('session')}
                                    </div>
                                </th>

                                {/* 6. Aktif */}
                                <th
                                    onClick={() => handleSort('isActive')}
                                    className={`py-2 px-1 text-center cursor-pointer hover:bg-current/10 transition-colors select-none group w-1 whitespace-nowrap ${
                                        sortField === 'isActive' ? 'text-teal-600 dark:text-teal-400 bg-current/5' : ''
                                    }`}
                                    title="Klik untuk mengurutkan Status Aktif"
                                >
                                    <div className="inline-flex items-center justify-center gap-0.5 mx-auto text-center">
                                        <span>Aktif</span>
                                        {renderSortIcon('isActive')}
                                    </div>
                                </th>

                                {/* 7. Reset Pass */}
                                <th
                                    onClick={() => handleSort('hasPassword')}
                                    className={`py-2 px-1 text-center cursor-pointer hover:bg-current/10 transition-colors select-none group w-1 whitespace-nowrap ${
                                        sortField === 'hasPassword' ? 'text-teal-600 dark:text-teal-400 bg-current/5' : ''
                                    }`}
                                    title="Klik untuk mengurutkan status password"
                                >
                                    <div className="inline-flex items-center justify-center gap-0.5 mx-auto text-center">
                                        <span>Reset</span>
                                        {renderSortIcon('hasPassword')}
                                    </div>
                                </th>

                                {/* 8. Edit */}
                                <th
                                    onClick={() => handleSort('edit')}
                                    className={`py-2 px-1 text-center cursor-pointer hover:bg-current/10 transition-colors select-none group w-1 whitespace-nowrap ${
                                        sortField === 'edit' ? 'text-teal-600 dark:text-teal-400 bg-current/5' : ''
                                    }`}
                                    title="Klik untuk mengurutkan izin edit"
                                >
                                    <div className="inline-flex items-center justify-center gap-0.5 mx-auto text-center">
                                        <span>Edit</span>
                                        {renderSortIcon('edit')}
                                    </div>
                                </th>

                                {/* 9. Hapus */}
                                <th
                                    onClick={() => handleSort('delete')}
                                    className={`py-2 px-1 text-center cursor-pointer hover:bg-current/10 transition-colors select-none group w-1 whitespace-nowrap ${
                                        sortField === 'delete' ? 'text-teal-600 dark:text-teal-400 bg-current/5' : ''
                                    }`}
                                    title="Klik untuk mengurutkan akun yang dapat dihapus"
                                >
                                    <div className="inline-flex items-center justify-center gap-0.5 mx-auto text-center">
                                        <span>Hapus</span>
                                        {renderSortIcon('delete')}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-current/10 font-sans">
                            {sortedUsers.map((u, idx) => {
                                const prof = authorityProfiles.find((p) => p.id === u.authorityProfileId);
                                const userSession = activeSessions.find((s) => s.userNip === u.nip);
                                const isSuperAdmin = isSuperAdminUser(u);
                                const isFrozen = isAccountFrozen(u);
                                const isPasswordEmpty = !u.hasPassword || (u.passwordValue !== undefined && u.passwordValue.trim() === '');

                                return (
                                    <tr
                                        key={u.id}
                                        className={`hover:bg-current/5 transition-colors ${
                                            !u.isActive ? 'opacity-55 bg-current/2' : ''
                                        }`}
                                    >
                                        {/* 1. No. */}
                                        <td className="py-2 px-1 text-center font-mono font-bold text-xs opacity-75 whitespace-nowrap w-1">
                                            {idx + 1}
                                        </td>

                                        {/* 2. Nama */}
                                        <td className="py-2 px-2 font-bold whitespace-nowrap">
                                            <div className="whitespace-nowrap text-xs sm:text-[13px] font-extrabold leading-tight" title={u.name}>
                                                {formatDisplayName(u.name)}
                                            </div>
                                            <div className="flex items-center gap-1 mt-0.5 whitespace-nowrap">
                                                <span className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded font-bold uppercase border leading-tight ${
                                                    prof?.badgeColor || (u.role === 'admin' ? 'bg-teal-500/15 text-teal-600 border-teal-500/30' : 'bg-slate-500/15 text-slate-600 border-slate-500/30')
                                                }`}>
                                                    {prof?.name || u.authorityName || (u.role === 'admin' ? 'ADMIN' : 'PPF')}
                                                </span>
                                                {u.isExternalNonAppUser && (
                                                    <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded font-bold bg-indigo-500/15 text-indigo-600 border border-indigo-500/30 leading-tight">
                                                        Luar
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* 3. NIP */}
                                        <td className="py-2 px-1 font-mono font-bold text-xs opacity-85 tracking-wide text-center whitespace-nowrap w-1">
                                            {u.nip}
                                        </td>

                                        {/* 4. Posko */}
                                        <td className="py-2 px-1.5 opacity-80 text-xs sm:text-[13px] whitespace-nowrap">
                                            <div className="inline-flex items-center gap-1">
                                                <Building2 className="w-3 h-3 opacity-60 shrink-0" />
                                                <span className="whitespace-nowrap">{cleanPoskoName(u.unitPosko)}</span>
                                            </div>
                                        </td>

                                        {/* 5. Sesi (Online / Offline & Perangkat Riil Tersinkronisasi) */}
                                        <td className="py-2 px-1 text-center whitespace-nowrap w-1">
                                            <button
                                                type="button"
                                                onClick={() => setSessionModalData({ user: u, session: userSession || null })}
                                                className="inline-block p-1 rounded-md hover:bg-current/10 active:scale-95 transition-all cursor-pointer text-center group"
                                                title="Klik untuk melihat spesifikasi detail perangkat & sesi riil"
                                            >
                                                {userSession ? (
                                                    <div className="inline-flex flex-col items-center justify-center text-center mx-auto">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                                                                userSession.isOnline
                                                                    ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)] animate-pulse'
                                                                    : 'bg-slate-400'
                                                            }`} />
                                                            <span className={`text-[10px] sm:text-[11px] font-extrabold leading-none ${
                                                                userSession.isOnline
                                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                                    : 'opacity-55'
                                                            }`}>
                                                                {userSession.isOnline ? 'Online' : 'Offline'}
                                                            </span>
                                                        </div>
                                                        <div
                                                            className="text-[9.5px] font-mono opacity-75 whitespace-nowrap mt-0.5 font-bold group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-tight"
                                                        >
                                                            {userSession.ipAddress || userSession.deviceName}
                                                        </div>
                                                        <div className="text-[8.5px] opacity-50 whitespace-nowrap leading-tight">
                                                            {userSession.lastActive}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center justify-center gap-1 text-[10px] opacity-40 font-mono group-hover:opacity-75 whitespace-nowrap">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400/50" />
                                                        <span>Belum Login</span>
                                                    </div>
                                                )}
                                            </button>
                                        </td>

                                        {/* 6. Checkbox Aktif (Untuk mengaktifkan akun) */}
                                        <td className="py-2 px-1 text-center whitespace-nowrap w-1">
                                            <Checkbox
                                                id={`status-chk-${u.id}`}
                                                theme={theme}
                                                size="13px"
                                                checked={u.isActive}
                                                disabled={isSuperAdmin}
                                                onChange={() => handleToggleCheckbox(u)}
                                                label={
                                                    <span className={`text-[10.5px] sm:text-xs font-bold ${
                                                        u.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'opacity-50'
                                                    }`}>
                                                        {u.isActive ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                }
                                            />
                                        </td>

                                        {/* 7. Tombol Reset Pass - Kompak & Minimalis */}
                                        <td className="py-2 px-1 text-center whitespace-nowrap w-1">
                                            {isFrozen ? (
                                                <button
                                                    type="button"
                                                    disabled
                                                    onClick={() => onShowToast('Reset password akun Super Admin dibekukan untuk role Admin.')}
                                                    className="py-1 px-2 text-[10px] sm:text-xs font-bold rounded border border-current/15 bg-current/5 opacity-40 cursor-not-allowed inline-flex items-center justify-center gap-0.5 select-none"
                                                    title="Reset password dibekukan: Hanya Super Admin yang dapat mereset akun Super Admin"
                                                >
                                                    <Lock className="w-2.5 h-2.5 shrink-0" />
                                                    <span>Beku</span>
                                                </button>
                                            ) : isPasswordEmpty ? (
                                                <button
                                                    type="button"
                                                    disabled
                                                    className="py-1 px-2 text-[10px] sm:text-xs font-bold rounded border border-current/15 bg-current/5 opacity-40 cursor-not-allowed inline-flex items-center justify-center gap-0.5 select-none text-current"
                                                    title="Password masih kosong (belum diatur oleh pengguna)"
                                                >
                                                    <KeyRound className="w-2.5 h-2.5 shrink-0 opacity-50" />
                                                    <span>Reset</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setResettingUser(u)}
                                                    className="py-1 px-2 text-[10px] sm:text-xs font-bold rounded border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 active:scale-95 cursor-pointer inline-flex items-center justify-center gap-0.5 transition-all shadow-2xs"
                                                    title="Reset dan kosongkan password akun ini"
                                                >
                                                    <KeyRound className="w-2.5 h-2.5 shrink-0" />
                                                    <span>Reset</span>
                                                </button>
                                            )}
                                        </td>

                                        {/* 8. Tombol Edit - Kompak & Minimalis */}
                                        <td className="py-2 px-1 text-center whitespace-nowrap w-1">
                                            {isFrozen ? (
                                                <button
                                                    type="button"
                                                    disabled
                                                    onClick={() => onShowToast('Akses edit ke akun Super Admin dibekukan untuk role Admin.')}
                                                    className="py-1 px-2 text-[10px] sm:text-xs font-bold rounded border border-current/15 bg-current/5 opacity-40 cursor-not-allowed inline-flex items-center justify-center gap-0.5 select-none"
                                                    title="Akses edit dibekukan: Hanya Super Admin yang dapat mengubah akun Super Admin"
                                                >
                                                    <Lock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                                    <span>Beku</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(u)}
                                                    className="py-1 px-2 text-[10px] sm:text-xs font-bold rounded border border-current/20 hover:bg-current/10 active:scale-95 cursor-pointer inline-flex items-center justify-center gap-0.5 transition-all"
                                                    title="Edit Akun Pengguna"
                                                >
                                                    <Edit3 className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400 shrink-0" />
                                                    <span>Edit</span>
                                                </button>
                                            )}
                                        </td>

                                        {/* 9. Tombol Hapus - Kompak & Minimalis */}
                                        <td className="py-1.5 px-1 text-center whitespace-nowrap">
                                            {isSuperAdmin ? (
                                                <span className="text-[8.5px] opacity-40 select-none font-bold uppercase tracking-wider inline-flex items-center justify-center gap-0.5 text-center">
                                                    <Lock className="w-2.5 h-2.5 shrink-0" />
                                                    <span>Admin</span>
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setDeletingUser(u)}
                                                    className="btn-glitch-delete py-0.5 px-1.5 text-[8.5px] font-bold rounded border border-rose-500/40 text-rose-600 hover:bg-rose-500/10 active:scale-95 cursor-pointer inline-flex items-center justify-center gap-0.5 transition-all"
                                                    title="Hapus Akun Pengguna"
                                                    data-text="Hapus"
                                                >
                                                    <Trash2 className="w-2.5 h-2.5 shrink-0 relative z-10" />
                                                    <span className="relative z-10">Hapus</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-8 text-center opacity-60">
                        <Users className="w-8 h-8 mx-auto text-amber-500 mb-1" />
                        <p className="text-xs font-bold">Tidak ada data pengguna yang sesuai dengan filter.</p>
                    </div>
                )}
            </div>

            {/* MODAL RESET PASSWORD KONFIRMASI */}
            {resettingUser && (
                <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="fixed inset-0" onClick={() => setResettingUser(null)} />
                    <div className={`relative z-10 w-full max-w-md p-5 rounded-2xl border space-y-4 shadow-xl ${
                        isIndustrial
                            ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.2)] text-[#E2E8F0]'
                            : isPaperSketch
                            ? 'bg-white border-2 border-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b]'
                            : isDark
                            ? 'bg-[#1E1E1E] border-slate-800 text-slate-100'
                            : 'bg-white border-slate-200 text-slate-900'
                    }`}>
                        <div className="flex items-center space-x-3 text-amber-600 dark:text-amber-400">
                            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30">
                                <KeyRound className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-extrabold">Reset Password Pengguna</h3>
                                <p className="text-xs opacity-75 font-mono">NIP: {resettingUser.nip}</p>
                            </div>
                        </div>

                        <div className="space-y-2 text-xs opacity-85 leading-relaxed">
                            <p>
                                Apakah Anda yakin ingin mereset password untuk <strong>{resettingUser.name}</strong>?
                            </p>
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300">
                                <strong>Akibat Reset:</strong> Password pengguna akan langsung dikosongkan. Pengguna dapat login kembali tanpa memasukkan password dan dapat mengatur password baru di tab Akun.
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-current/10">
                            <button
                                type="button"
                                onClick={() => setResettingUser(null)}
                                className="px-3.5 py-2 text-xs font-bold rounded-lg border border-current/20 hover:bg-current/10 cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleExecuteResetPassword}
                                className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-xs flex items-center gap-1.5"
                            >
                                <Check className="w-4 h-4" />
                                <span>Reset & Kosongkan Password</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL HAPUS PENGGUNA */}
            {deletingUser && (
                <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="fixed inset-0" onClick={() => setDeletingUser(null)} />
                    <div className={`relative z-10 w-full max-w-md p-5 rounded-2xl border space-y-4 shadow-xl ${
                        isIndustrial
                            ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.2)] text-[#E2E8F0]'
                            : isPaperSketch
                            ? 'bg-white border-2 border-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b]'
                            : isDark
                            ? 'bg-[#1E1E1E] border-slate-800 text-slate-100'
                            : 'bg-white border-slate-200 text-slate-900'
                    }`}>
                        <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400">
                            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-extrabold">Hapus Akun Pengguna</h3>
                                <p className="text-xs opacity-75 font-mono">NIP: {deletingUser.nip}</p>
                            </div>
                        </div>

                        <p className="text-xs opacity-85 leading-relaxed">
                            Apakah Anda yakin ingin menghapus data akun <strong>{deletingUser.name}</strong> ({deletingUser.unitPosko})? Tindakan ini akan menghapus akun dari daftar pengguna posko.
                        </p>

                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-current/10">
                            <button
                                type="button"
                                onClick={() => setDeletingUser(null)}
                                className="px-3.5 py-2 text-xs font-bold rounded-lg border border-current/20 hover:bg-current/10 cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleExecuteDelete}
                                className="btn-glitch-delete px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs flex items-center gap-1.5"
                                data-text="Hapus Pengguna"
                            >
                                <Trash2 className="w-4 h-4 relative z-10" />
                                <span className="relative z-10">Hapus Pengguna</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL TAMBAH PENGGUNA BARU */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="fixed inset-0" onClick={() => setIsAddModalOpen(false)} />
                    <div className={`relative z-10 w-full max-w-lg p-5 sm:p-6 rounded-2xl border space-y-4 shadow-2xl ${
                        isIndustrial
                            ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.2)] text-[#E2E8F0]'
                            : isPaperSketch
                            ? 'bg-white border-2 border-[#2b2b2b] shadow-[5px_5px_0px_#2b2b2b]'
                            : isDark
                            ? 'bg-[#1E1E1E] border-slate-800 text-slate-100'
                            : 'bg-white border-slate-200 text-slate-900'
                    }`}>
                        <div className="flex items-center justify-between border-b border-current/10 pb-3">
                            <div className="flex items-center space-x-2">
                                <UserPlus className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
                                    Tambah Pengguna Posko Baru
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-1 rounded-lg hover:bg-current/10 opacity-70 hover:opacity-100 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveAdd} className="space-y-3.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold block mb-1">Nama Lengkap Pegawai:</label>
                                    <input
                                        type="text"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        placeholder="Contoh: Ahmad Fauzi"
                                        className="w-full p-2 text-xs rounded-lg border border-current/20 bg-current/5 font-bold outline-none focus:border-teal-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold block mb-1">Nomor Induk Pegawai (NIP):</label>
                                    <input
                                        type="text"
                                        value={formNip}
                                        onChange={(e) => setFormNip(e.target.value)}
                                        placeholder="18 digit NIP..."
                                        className="w-full p-2 text-xs rounded-lg border border-current/20 bg-current/5 font-mono font-bold outline-none focus:border-teal-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold block mb-1">Unit Penugasan Posko:</label>
                                <select
                                    value={cleanPoskoName(formUnit)}
                                    onChange={(e) => setFormUnit(cleanPoskoName(e.target.value))}
                                    className="w-full p-2 text-xs rounded-lg border border-current/20 bg-current/5 font-bold outline-none cursor-pointer focus:border-teal-500"
                                >
                                    {POSKO_OPTIONS.map((p) => (
                                        <option key={p} value={cleanPoskoName(p)}>
                                            {cleanPoskoName(p)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold block mb-1">Role Otoritas:</label>
                                <select
                                    value={formProfileId}
                                    onChange={(e) => setFormProfileId(e.target.value)}
                                    className="w-full p-2 text-xs rounded-lg border border-current/20 bg-current/5 font-bold outline-none cursor-pointer focus:border-teal-500"
                                >
                                    {authorityProfiles.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.roleType.toUpperCase()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="p-3 rounded-xl bg-current/5 border border-current/10 space-y-2 flex flex-col gap-1.5">
                                <Checkbox
                                    id="add-user-form-active"
                                    theme={theme}
                                    checked={formIsActive}
                                    onChange={(e) => setFormIsActive(e.target.checked)}
                                    label="Akun Langsung Aktif"
                                />

                                <Checkbox
                                    id="add-user-form-external"
                                    theme={theme}
                                    checked={formIsExternal}
                                    onChange={(e) => setFormIsExternal(e.target.checked)}
                                    label="PPF non User (Data jadwal disalin terpusat untuk statistik)"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-current/10">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-3.5 py-2 text-xs font-bold rounded-lg border border-current/20 hover:bg-current/10 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-xs flex items-center gap-1.5"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>Simpan Pengguna</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDIT PENGGUNA */}
            {editingUser && (
                <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="fixed inset-0" onClick={() => setEditingUser(null)} />
                    <div className={`relative z-10 w-full max-w-lg p-5 sm:p-6 rounded-2xl border space-y-4 shadow-2xl ${
                        isIndustrial
                            ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.2)] text-[#E2E8F0]'
                            : isPaperSketch
                            ? 'bg-white border-2 border-[#2b2b2b] shadow-[5px_5px_0px_#2b2b2b]'
                            : isDark
                            ? 'bg-[#1E1E1E] border-slate-800 text-slate-100'
                            : 'bg-white border-slate-200 text-slate-900'
                    }`}>
                        <div className="flex items-center justify-between border-b border-current/10 pb-3">
                            <div className="flex items-center space-x-2">
                                <Edit3 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
                                    Edit Data Pengguna
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingUser(null)}
                                className="p-1 rounded-lg hover:bg-current/10 opacity-70 hover:opacity-100 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-3.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold block mb-1">Nama Lengkap Pegawai:</label>
                                    <input
                                        type="text"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        className="w-full p-2 text-xs rounded-lg border border-current/20 bg-current/5 font-bold outline-none focus:border-teal-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold block mb-1">NIP (Tidak dapat diubah):</label>
                                    <input
                                        type="text"
                                        value={formNip}
                                        disabled
                                        className="w-full p-2 text-xs rounded-lg border border-current/20 bg-current/10 font-mono font-bold opacity-75 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold block mb-1">Unit Penugasan Posko:</label>
                                <select
                                    value={formUnit}
                                    onChange={(e) => setFormUnit(e.target.value)}
                                    className="w-full p-2 text-xs rounded-lg border border-current/20 bg-current/5 font-bold outline-none cursor-pointer focus:border-teal-500"
                                >
                                    {(POSKO_OPTIONS.includes(formUnit) ? POSKO_OPTIONS : [formUnit, ...POSKO_OPTIONS]).map((p) => (
                                        <option key={p} value={p}>
                                            {p}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold block mb-1">Role Otoritas:</label>
                                <select
                                    value={formProfileId}
                                    onChange={(e) => setFormProfileId(e.target.value)}
                                    className="w-full p-2 text-xs rounded-lg border border-current/20 bg-current/5 font-bold outline-none cursor-pointer focus:border-teal-500"
                                >
                                    {authorityProfiles.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.roleType.toUpperCase()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="p-3 rounded-xl bg-current/5 border border-current/10 space-y-2 flex flex-col gap-1.5">
                                <Checkbox
                                    id="edit-user-form-active"
                                    theme={theme}
                                    checked={formIsActive}
                                    disabled={editingUser?.authorityProfileId === 'prof-superadmin' || editingUser?.nip === '199510102015121002'}
                                    onChange={(e) => setFormIsActive(e.target.checked)}
                                    label="Status Akun Aktif"
                                />

                                <Checkbox
                                    id="edit-user-form-external"
                                    theme={theme}
                                    checked={formIsExternal}
                                    onChange={(e) => setFormIsExternal(e.target.checked)}
                                    label="PPF non User"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-current/10">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="px-3.5 py-2 text-xs font-bold rounded-lg border border-current/20 hover:bg-current/10 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-xs flex items-center gap-1.5"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>Simpan Perubahan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DETAIL SESI & PERANGKAT PENGGUNA */}
            {sessionModalData && (
                <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="fixed inset-0" onClick={() => setSessionModalData(null)} />
                    <div className={`relative z-10 w-full max-w-lg p-5 sm:p-6 rounded-2xl border space-y-4 shadow-2xl ${
                        isIndustrial
                            ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.2)] text-[#E2E8F0] font-["JetBrains_Mono"]'
                            : isPaperSketch
                            ? 'bg-white border-2 border-[#2b2b2b] shadow-[5px_5px_0px_#2b2b2b]'
                            : isTechnical
                            ? 'bg-[#F8F7F4] dark:bg-[#0D1117] border-[1.5px] border-[#111113] dark:border-slate-700'
                            : isWinamp
                            ? 'bg-black border border-[#00FF00] text-[#00FF00]'
                            : isDark
                            ? 'bg-[#1E1E1E] border-slate-800 text-slate-100'
                            : 'bg-white border-slate-200 text-slate-900 shadow-xl'
                    }`}>
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-current/10 pb-3">
                            <div className="flex items-center space-x-2.5">
                                <div className="p-2 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                                    <Laptop className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
                                            Detail Sesi Perangkat
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase border ${
                                            sessionModalData.session?.isOnline
                                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                                : 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30'
                                        }`}>
                                            {sessionModalData.session?.isOnline ? 'Online' : 'Offline'}
                                        </span>
                                    </div>
                                    <p className="text-xs opacity-75 font-mono">
                                        {sessionModalData.user.name} • NIP: {sessionModalData.user.nip}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSessionModalData(null)}
                                className="p-1 rounded-lg hover:bg-current/10 opacity-70 hover:opacity-100 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Isi Spesifikasi Sesi (Identik dengan format di Pengaturan Akun) */}
                        {sessionModalData.session ? (
                            <div className="space-y-3 text-xs">
                                <div className="p-3.5 rounded-xl border border-current/15 bg-current/5 space-y-2 font-mono">
                                    <div>
                                        <span className="font-bold font-sans opacity-75">Nama Perangkat: </span>
                                        <span className="font-bold text-teal-600 dark:text-teal-400">
                                            {sessionModalData.session.deviceName}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-bold font-sans opacity-75">Tipe & OS: </span>
                                        <span className="font-bold text-teal-600 dark:text-teal-400">
                                            {sessionModalData.session.deviceType.toUpperCase()}
                                        </span>
                                        <span className="opacity-75 font-sans"> & </span>
                                        <span className="font-bold text-teal-600 dark:text-teal-400">
                                            {sessionModalData.session.os}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-bold font-sans opacity-75">Browser: </span>
                                        <span className="font-bold">{sessionModalData.session.browser}</span>
                                    </div>
                                    <div>
                                        <span className="font-bold font-sans opacity-75">IP & Lokasi: </span>
                                        <span className="font-bold">{sessionModalData.session.ipAddress}</span>
                                        <span className="opacity-75 font-sans"> | </span>
                                        <span className="font-bold">
                                            {sessionModalData.session.location.includes(',')
                                                ? sessionModalData.session.location
                                                : `Tanjung Priok, ${sessionModalData.session.location}`}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-bold font-sans opacity-75">MAC Address: </span>
                                        <span className="font-bold tracking-wider">{sessionModalData.session.macAddress}</span>
                                    </div>
                                    <div>
                                        <span className="font-bold font-sans opacity-75">Waktu Login: </span>
                                        <span className="font-bold">{sessionModalData.session.loginTime}</span>
                                    </div>
                                    <div>
                                        <span className="font-bold font-sans opacity-75">Aktivitas Terakhir: </span>
                                        <span className={`font-bold ${
                                            sessionModalData.session.isOnline
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'opacity-65'
                                        }`}>
                                            {sessionModalData.session.lastActive}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 text-center space-y-2 opacity-75">
                                <Laptop className="w-8 h-8 mx-auto opacity-40 mb-1" />
                                <p className="font-bold text-xs">Belum ada riwayat sesi masuk untuk pengguna ini.</p>
                                <p className="text-[11px] opacity-70">
                                    Pengguna belum pernah membuka aplikasi atau login dari perangkat mana pun.
                                </p>
                            </div>
                        )}

                        {/* Footer Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-current/10 gap-2">
                            <button
                                type="button"
                                onClick={handleRefreshSessions}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-current/20 hover:bg-current/10 cursor-pointer flex items-center gap-1.5"
                                title="Perbarui status sesi dari data sistem"
                            >
                                <RefreshCw className="w-3.5 h-3.5 text-teal-500" />
                                <span>Sinkronkan Sesi</span>
                            </button>

                            <div className="flex items-center gap-2">
                                {sessionModalData.session && sessionModalData.session.isOnline && (
                                    <button
                                        type="button"
                                        onClick={() => handleTerminateSession(sessionModalData.user.nip, sessionModalData.user.name)}
                                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
                                        title="Putuskan koneksi perangkat ini secara paksa"
                                    >
                                        <PowerOff className="w-3.5 h-3.5" />
                                        <span>Putuskan Sesi</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setSessionModalData(null)}
                                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-xs active:scale-95 transition-all"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
