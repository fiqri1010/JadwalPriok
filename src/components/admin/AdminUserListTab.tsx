import React, { useState } from 'react';
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
} from 'lucide-react';
import { UserAccount, AuthorityProfile, UserRole } from '../../types/admin';
import { AppTheme } from '../../types';

interface AdminUserListTabProps {
    users: UserAccount[];
    authorityProfiles: AuthorityProfile[];
    onUpdateUsers: (users: UserAccount[]) => void;
    onShowToast: (msg: string) => void;
    theme?: AppTheme;
}

export const AdminUserListTab: React.FC<AdminUserListTabProps> = ({
    users,
    authorityProfiles,
    onUpdateUsers,
    onShowToast,
    theme = 'default',
}) => {
    const isIndustrial = theme === 'industrial';
    const isPaperSketch = theme === 'paperSketch';
    const isTechnical = theme === 'technical';
    const isWinamp = theme === 'winamp';
    const isDark = theme === 'dark';

    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | UserRole | 'external'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
    const [resettingUser, setResettingUser] = useState<UserAccount | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);

    // Form state for Add/Edit
    const [formNip, setFormNip] = useState('');
    const [formName, setFormName] = useState('');
    const [formUnit, setFormUnit] = useState('Posko Pelayanan Graha Lantai 2');
    const [formProfileId, setFormProfileId] = useState(authorityProfiles[0]?.id || 'prof-petugas-posko');
    const [formSquad, setFormSquad] = useState<'Regu A' | 'Regu B' | 'Regu C' | 'Regu D' | 'Non-Regu'>('Regu A');
    const [formIsExternal, setFormIsExternal] = useState(false);
    const [formIsActive, setFormIsActive] = useState(true);

    const openAddModal = () => {
        setFormNip('');
        setFormName('');
        setFormUnit('Posko Pelayanan Graha Lantai 2');
        setFormProfileId(authorityProfiles.find(p => p.roleType === 'end-user')?.id || authorityProfiles[0]?.id || '');
        setFormSquad('Regu A');
        setFormIsExternal(false);
        setFormIsActive(true);
        setIsAddModalOpen(true);
    };

    const openEditModal = (user: UserAccount) => {
        setEditingUser(user);
        setFormNip(user.nip);
        setFormName(user.name);
        setFormUnit(user.unitPosko);
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
            unitPosko: formUnit.trim() || 'Posko Pelayanan Graha',
            role: selectedProfile?.roleType || 'end-user',
            authorityProfileId: selectedProfile?.id || '',
            authorityName: selectedProfile?.name || 'Petugas Posko',
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
        if (!formName.trim()) {
            onShowToast('Nama pengguna tidak boleh kosong.');
            return;
        }

        const selectedProfile = authorityProfiles.find((p) => p.id === formProfileId) || authorityProfiles[0];
        const updated = users.map((u) => {
            if (u.id === editingUser.id) {
                return {
                    ...u,
                    name: formName.trim(),
                    unitPosko: formUnit.trim() || u.unitPosko,
                    role: selectedProfile?.roleType || u.role,
                    authorityProfileId: selectedProfile?.id || u.authorityProfileId,
                    authorityName: selectedProfile?.name || u.authorityName,
                    assignedSquad: formSquad,
                    isExternalNonAppUser: formIsExternal,
                    isActive: formIsActive,
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
        const nextState = !user.isActive;
        const updated = users.map((u) => (u.id === user.id ? { ...u, isActive: nextState } : u));
        onUpdateUsers(updated);
        onShowToast(`Akun ${user.name} (NIP: ${user.nip}) ${nextState ? 'diaktifkan' : 'dinonaktifkan'}.`);
    };

    // Eksekusi Reset Password (langsung mengosongkan password)
    const handleExecuteResetPassword = () => {
        if (!resettingUser) return;
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
        setResettingUser(null);
        onShowToast(`Password pengguna ${resettingUser.name} (NIP: ${resettingUser.nip}) berhasil direset & dikosongkan.`);
    };

    // Eksekusi Hapus User
    const handleExecuteDelete = () => {
        if (!deletingUser) return;
        const updated = users.filter((u) => u.id !== deletingUser.id);
        onUpdateUsers(updated);
        setDeletingUser(null);
        onShowToast(`Pengguna ${deletingUser.name} berhasil dihapus dari sistem posko.`);
    };

    // Filter pengguna
    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.unitPosko.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesRole = true;
        if (roleFilter === 'admin') matchesRole = u.role === 'admin';
        else if (roleFilter === 'end-user') matchesRole = u.role === 'end-user' && !u.isExternalNonAppUser;
        else if (roleFilter === 'external') matchesRole = Boolean(u.isExternalNonAppUser);

        let matchesStatus = true;
        if (statusFilter === 'active') matchesStatus = u.isActive;
        else if (statusFilter === 'inactive') matchesStatus = !u.isActive;

        return matchesSearch && matchesRole && matchesStatus;
    });

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
                                Daftar Pengguna Posko
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                                {users.length} Total Pegawai
                            </span>
                        </div>
                        <p className="text-xs opacity-70">
                            Kelola akun, status aktif akun, reset password, dan perizinan akses petugas
                        </p>
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
                        placeholder="Cari berdasarkan Nama, NIP, atau Posko..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-current/20 bg-current/5 outline-none font-bold focus:border-teal-500"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <div className="flex items-center gap-1 text-xs shrink-0">
                        <Filter className="w-3.5 h-3.5 opacity-60" />
                        <span className="opacity-70 font-medium">Otoritas:</span>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as any)}
                            className="text-xs p-1.5 rounded-lg border border-current/20 bg-current/5 font-bold outline-none cursor-pointer"
                        >
                            <option value="all">Semua Tipe</option>
                            <option value="admin">Admin</option>
                            <option value="end-user">End-User Posko</option>
                            <option value="external">Posko Luar (Non-User)</option>
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
                            <option value="active">Hanya Aktif</option>
                            <option value="inactive">Nonaktif</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* TABEL LIST PENGGUNA (No. | Nama | NIP | Posko | Checkbox Aktif | Reset Pass | Edit | Hapus) */}
            <div className={`rounded-xl border overflow-hidden ${
                isIndustrial
                    ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                    : isPaperSketch
                    ? 'bg-white border-2 border-[#2b2b2b]'
                    : isDark
                    ? 'bg-[#161616] border-slate-800'
                    : 'bg-white border-slate-200'
            }`}>
                <div className="overflow-x-auto select-none no-scrollbar">
                    <table className="w-full border-collapse text-xs">
                        <thead>
                            <tr className="bg-current/5 border-b border-current/15 text-left font-bold text-[11px] uppercase tracking-wider">
                                <th className="p-3 text-center w-12 min-w-[48px]">No.</th>
                                <th className="p-3 min-w-[200px]">Nama</th>
                                <th className="p-3 min-w-[150px]">NIP</th>
                                <th className="p-3 min-w-[180px]">Posko</th>
                                <th className="p-3 text-center min-w-[110px]">Aktif</th>
                                <th className="p-3 text-center min-w-[120px]">Reset Pass</th>
                                <th className="p-3 text-center min-w-[90px]">Edit</th>
                                <th className="p-3 text-center min-w-[90px]">Hapus</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-current/10 font-sans">
                            {filteredUsers.map((u, idx) => {
                                const prof = authorityProfiles.find((p) => p.id === u.authorityProfileId);

                                return (
                                    <tr
                                        key={u.id}
                                        className={`hover:bg-current/5 transition-colors ${
                                            !u.isActive ? 'opacity-55 bg-current/2' : ''
                                        }`}
                                    >
                                        {/* 1. No. */}
                                        <td className="p-3 text-center font-mono font-bold opacity-70">
                                            {idx + 1}
                                        </td>

                                        {/* 2. Nama */}
                                        <td className="p-3 font-bold">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="truncate">{u.name}</span>
                                                <span className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded font-bold uppercase border ${
                                                    prof?.badgeColor || (u.role === 'admin' ? 'bg-teal-500/15 text-teal-600 border-teal-500/30' : 'bg-slate-500/15 text-slate-600 border-slate-500/30')
                                                }`}>
                                                    {u.authorityName || (u.role === 'admin' ? 'ADMIN' : 'END-USER')}
                                                </span>
                                                {u.isExternalNonAppUser && (
                                                    <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded font-bold bg-indigo-500/15 text-indigo-600 border border-indigo-500/30">
                                                        Luar
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* 3. NIP */}
                                        <td className="p-3 font-mono font-bold opacity-85 tracking-wide">
                                            {u.nip}
                                        </td>

                                        {/* 4. Posko */}
                                        <td className="p-3 opacity-80">
                                            <div className="flex items-center gap-1.5">
                                                <Building2 className="w-3.5 h-3.5 opacity-60 shrink-0" />
                                                <span className="truncate">{u.unitPosko}</span>
                                            </div>
                                        </td>

                                        {/* 5. Checkbox Aktif (Untuk mengaktifkan akun) */}
                                        <td className="p-3 text-center">
                                            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={u.isActive}
                                                    onChange={() => handleToggleCheckbox(u)}
                                                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                                                />
                                                <span className={`text-[11px] font-bold ${
                                                    u.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'opacity-50'
                                                }`}>
                                                    {u.isActive ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </label>
                                        </td>

                                        {/* 6. Tombol Reset Pass */}
                                        <td className="p-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => setResettingUser(u)}
                                                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer inline-flex items-center gap-1 transition-all"
                                                title="Reset dan kosongkan password akun ini"
                                            >
                                                <KeyRound className="w-3.5 h-3.5" />
                                                <span>Reset Pass</span>
                                            </button>
                                        </td>

                                        {/* 7. Tombol Edit */}
                                        <td className="p-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(u)}
                                                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-current/20 hover:bg-current/10 cursor-pointer inline-flex items-center gap-1 transition-all"
                                                title="Edit Akun Pengguna"
                                            >
                                                <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                                                <span>Edit</span>
                                            </button>
                                        </td>

                                        {/* 8. Tombol Hapus */}
                                        <td className="p-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => setDeletingUser(u)}
                                                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-rose-500/40 text-rose-600 hover:bg-rose-500/10 cursor-pointer inline-flex items-center gap-1 transition-all"
                                                title="Hapus Akun Pengguna"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Hapus</span>
                                            </button>
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
                                className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs flex items-center gap-1.5"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Hapus Pengguna</span>
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
                                <input
                                    type="text"
                                    value={formUnit}
                                    onChange={(e) => setFormUnit(e.target.value)}
                                    placeholder="Contoh: Posko Pelayanan Graha Lantai 2"
                                    className="w-full p-2 text-xs rounded-lg border border-current/20 bg-current/5 outline-none focus:border-teal-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold block mb-1">Profil Hak Akses & Otoritas:</label>
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

                            <div className="p-3 rounded-xl bg-current/5 border border-current/10 space-y-2">
                                <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formIsActive}
                                        onChange={(e) => setFormIsActive(e.target.checked)}
                                        className="rounded text-teal-600 focus:ring-teal-500"
                                    />
                                    <span>Akun Langsung Aktif</span>
                                </label>

                                <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formIsExternal}
                                        onChange={(e) => setFormIsExternal(e.target.checked)}
                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>Petugas Posko Luar (Data jadwal disalin terpusat untuk statistik)</span>
                                </label>
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
                                <input
                                    type="text"
                                    value={formUnit}
                                    onChange={(e) => setFormUnit(e.target.value)}
                                    className="w-full p-2 text-xs rounded-lg border border-current/20 bg-current/5 outline-none focus:border-teal-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold block mb-1">Profil Hak Akses & Otoritas:</label>
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

                            <div className="p-3 rounded-xl bg-current/5 border border-current/10 space-y-2">
                                <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formIsActive}
                                        onChange={(e) => setFormIsActive(e.target.checked)}
                                        className="rounded text-teal-600 focus:ring-teal-500"
                                    />
                                    <span>Status Akun Aktif</span>
                                </label>

                                <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formIsExternal}
                                        onChange={(e) => setFormIsExternal(e.target.checked)}
                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>Petugas Posko Luar (Non-User)</span>
                                </label>
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
        </div>
    );
};
