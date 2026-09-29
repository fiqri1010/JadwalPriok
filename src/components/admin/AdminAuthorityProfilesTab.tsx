import React, { useState } from 'react';
import {
    Shield,
    ShieldPlus,
    Check,
    CheckSquare,
    Square,
    Users,
    Sliders,
    Info,
    X,
    Lock,
    Key,
    Share2,
    Activity,
    Calendar,
    CheckCircle2,
    Edit,
    Trash2,
    AlertTriangle,
} from 'lucide-react';
import { AuthorityProfile, UserRole, UserAccount } from '../../types/admin';
import { AppTheme } from '../../types';

interface AdminAuthorityProfilesTabProps {
    profiles: AuthorityProfile[];
    users: UserAccount[];
    onUpdateProfiles: (profiles: AuthorityProfile[]) => void;
    onShowToast: (msg: string) => void;
    theme?: AppTheme;
}

export const AdminAuthorityProfilesTab: React.FC<AdminAuthorityProfilesTabProps> = ({
    profiles,
    users,
    onUpdateProfiles,
    onShowToast,
    theme = 'default',
}) => {
    const isIndustrial = theme === 'industrial';
    const isPaperSketch = theme === 'paperSketch';
    const isTechnical = theme === 'technical';
    const isWinamp = theme === 'winamp';
    const isDark = theme === 'dark';

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [activeProfile, setActiveProfile] = useState<AuthorityProfile | null>(null);

    // Form Fields
    const [name, setName] = useState('');
    const [roleType, setRoleType] = useState<UserRole>('end-user');
    const [description, setDescription] = useState('');
    const [canAccessAdmin, setCanAccessAdmin] = useState(false);
    const [canManageUsers, setCanManageUsers] = useState(false);
    const [canResetPassword, setCanResetPassword] = useState(false);
    const [canBroadcastSchedule, setCanBroadcastSchedule] = useState(false);
    const [canViewAllSessions, setCanViewAllSessions] = useState(false);
    const [canEditOwnSchedule, setCanEditOwnSchedule] = useState(true);
    const [canDeleteAdminAuthority, setCanDeleteAdminAuthority] = useState(false);
    const [canEditAuthorities, setCanEditAuthorities] = useState(false);

    const openAddModal = () => {
        setName('');
        setRoleType('end-user');
        setDescription('');
        setCanAccessAdmin(false);
        setCanManageUsers(false);
        setCanResetPassword(false);
        setCanBroadcastSchedule(false);
        setCanViewAllSessions(false);
        setCanEditOwnSchedule(true);
        setCanDeleteAdminAuthority(false);
        setCanEditAuthorities(false);
        setIsAddModalOpen(true);
    };

    const openEditModal = (prof: AuthorityProfile) => {
        setActiveProfile(prof);
        setName(prof.name);
        setRoleType(prof.roleType);
        setDescription(prof.description);
        setCanAccessAdmin(Boolean(prof.permissions.canAccessAdminDashboard));
        setCanManageUsers(Boolean(prof.permissions.canManageUsers));
        setCanResetPassword(Boolean(prof.permissions.canResetUserPassword));
        setCanBroadcastSchedule(Boolean(prof.permissions.canBroadcastSchedule));
        setCanViewAllSessions(Boolean(prof.permissions.canViewAllSessions));
        setCanEditOwnSchedule(Boolean(prof.permissions.canEditOwnSchedule));
        setCanDeleteAdminAuthority(Boolean(prof.permissions.canDeleteAdminAuthority));
        setCanEditAuthorities(Boolean(prof.permissions.canEditAuthorities));
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (prof: AuthorityProfile) => {
        setActiveProfile(prof);
        setIsDeleteModalOpen(true);
    };

    const handleRoleTypeChange = (newRole: UserRole) => {
        setRoleType(newRole);
        if (newRole === 'admin') {
            setCanAccessAdmin(true);
            setCanManageUsers(true);
            setCanResetPassword(true);
            setCanBroadcastSchedule(true);
            setCanViewAllSessions(true);
            setCanEditAuthorities(true);
        } else {
            setCanAccessAdmin(false);
            setCanManageUsers(false);
            setCanResetPassword(false);
            setCanBroadcastSchedule(false);
            setCanViewAllSessions(false);
            setCanDeleteAdminAuthority(false);
            setCanEditAuthorities(false);
        }
    };

    const handleSaveNewProfile = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            onShowToast('Nama profil otoritas wajib diisi.');
            return;
        }

        const badgeColor =
            roleType === 'admin'
                ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
                : 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30';

        const newProf: AuthorityProfile = {
            id: `prof-${Date.now()}`,
            name: name.trim(),
            description: description.trim() || 'Profil hak akses kustom posko.',
            roleType,
            badgeColor,
            isSystemDefault: false,
            permissions: {
                canAccessAdminDashboard: canAccessAdmin,
                canManageUsers,
                canResetUserPassword: canResetPassword,
                canBroadcastSchedule,
                canViewAllSessions,
                canEditOwnSchedule,
                canDeleteAdminAuthority,
                canEditAuthorities,
            },
        };

        const updated = [...profiles, newProf];
        onUpdateProfiles(updated);
        setIsAddModalOpen(false);
        onShowToast(`Profil otoritas baru "${newProf.name}" berhasil dibuat.`);
    };

    const handleUpdateProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeProfile || !name.trim()) return;

        const updatedList = profiles.map((p) => {
            if (p.id === activeProfile.id) {
                return {
                    ...p,
                    name: name.trim(),
                    description: description.trim() || p.description,
                    roleType,
                    badgeColor:
                        roleType === 'admin'
                            ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
                            : 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30',
                    permissions: {
                        canAccessAdminDashboard: canAccessAdmin,
                        canManageUsers,
                        canResetUserPassword: canResetPassword,
                        canBroadcastSchedule,
                        canViewAllSessions,
                        canEditOwnSchedule,
                        canDeleteAdminAuthority,
                        canEditAuthorities,
                    },
                };
            }
            return p;
        });

        onUpdateProfiles(updatedList);
        setIsEditModalOpen(false);
        onShowToast(`Profil otoritas "${name.trim()}" berhasil diperbarui.`);
    };

    const handleDeleteProfileSubmit = () => {
        if (!activeProfile) return;

        // Check if any user is currently assigned to this profile
        const assignedCount = users.filter((u) => u.authorityProfileId === activeProfile.id).length;
        if (assignedCount > 0) {
            onShowToast(`Tidak dapat menghapus profil ini karena masih digunakan oleh ${assignedCount} pengguna.`);
            setIsDeleteModalOpen(false);
            return;
        }

        const updatedList = profiles.filter((p) => p.id !== activeProfile.id);
        onUpdateProfiles(updatedList);
        setIsDeleteModalOpen(false);
        onShowToast(`Profil otoritas "${activeProfile.name}" berhasil dihapus.`);
    };

    return (
        <div className="space-y-4">
            {/* Header & Add Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
                                Profil Tingkat Otoritas & Hak Akses
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                                {profiles.length} Profil
                            </span>
                        </div>
                        <p className="text-xs opacity-70">
                            Atur izin akses, pembagian role admin/end-user, dan hak istimewa pengelolaan posko
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={openAddModal}
                    className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center space-x-2 active:scale-95 transition-all"
                >
                    <ShieldPlus className="w-4 h-4" />
                    <span>Tambah Profil Otoritas Baru</span>
                </button>
            </div>

            {/* List Profil Otoritas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profiles.map((prof) => {
                    const assignedUsersCount = users.filter((u) => u.authorityProfileId === prof.id).length;
                    return (
                        <div
                            key={prof.id}
                            className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                                isIndustrial
                                    ? 'bg-[#0F1115] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                                    : isPaperSketch
                                    ? 'bg-white border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
                                    : isDark
                                    ? 'bg-[#1E1E1E] border-slate-800'
                                    : 'bg-white border-slate-200'
                            }`}
                        >
                            <div className="space-y-2.5">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center space-x-2">
                                        <div className={`p-1.5 rounded-lg ${
                                            prof.roleType === 'admin' ? 'bg-rose-600 text-white' : 'bg-teal-600 text-white'
                                        }`}>
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs sm:text-sm font-black">{prof.name}</h4>
                                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${prof.badgeColor}`}>
                                                Role: {prof.roleType.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(prof)}
                                            className="p-1.5 rounded-lg hover:bg-current/10 text-teal-600 dark:text-teal-400 cursor-pointer transition-all"
                                            title="Edit Otoritas"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        {!prof.isSystemDefault && (
                                            <button
                                                type="button"
                                                onClick={() => openDeleteModal(prof)}
                                                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 cursor-pointer transition-all"
                                                title="Hapus Otoritas"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded bg-current/10 opacity-80 ml-1">
                                            {assignedUsersCount} Pengguna
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs opacity-75 leading-relaxed">
                                    {prof.description}
                                </p>

                                {/* Permission Matrix Pills */}
                                <div className="p-3 rounded-xl bg-current/5 border border-current/10 space-y-1.5">
                                    <span className="text-[10.5px] font-bold uppercase tracking-wider opacity-60 block">
                                        Hak Akses & Otoritas:
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                                        <div className={`flex items-center space-x-1.5 ${prof.permissions.canAccessAdminDashboard ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'opacity-40'}`}>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Dashboard Admin</span>
                                        </div>
                                        <div className={`flex items-center space-x-1.5 ${prof.permissions.canManageUsers ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'opacity-40'}`}>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Kelola Pengguna</span>
                                        </div>
                                        <div className={`flex items-center space-x-1.5 ${prof.permissions.canResetUserPassword ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'opacity-40'}`}>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Reset Password</span>
                                        </div>
                                        <div className={`flex items-center space-x-1.5 ${prof.permissions.canBroadcastSchedule ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'opacity-40'}`}>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Impor Jadwal Pengguna</span>
                                        </div>
                                        <div className={`flex items-center space-x-1.5 ${prof.permissions.canViewAllSessions ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'opacity-40'}`}>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Lihat Sesi Pengguna</span>
                                        </div>
                                        <div className={`flex items-center space-x-1.5 ${prof.permissions.canEditAuthorities ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'opacity-40'}`}>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Edit Otoritas</span>
                                        </div>
                                        <div className={`flex items-center space-x-1.5 ${prof.permissions.canDeleteAdminAuthority ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'opacity-40'}`}>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Hapus Otoritas Admin</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-current/10 flex items-center justify-between text-[11px] opacity-65 font-mono">
                                <span>ID: {prof.id}</span>
                                {prof.isSystemDefault && <span>(Bawaan Sistem)</span>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL TAMBAH PROFIL OTORITAS BARU */}
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
                                <ShieldPlus className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
                                    Tambah Profil Otoritas Baru
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

                        <form onSubmit={handleSaveNewProfile} className="space-y-3.5">
                            <div>
                                <label className="text-xs font-bold block mb-1">Nama Profil Otoritas:</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Contoh: Koordinator Lapangan TPS Koja..."
                                    className="w-full p-2 text-xs rounded-lg border border-current/20 bg-current/5 font-bold outline-none focus:border-teal-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold block mb-1">Kelompok Tingkat Role:</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleRoleTypeChange('end-user')}
                                        className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                                            roleType === 'end-user'
                                                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                                                : 'border-current/20 hover:bg-current/5'
                                        }`}
                                    >
                                        2. End-User (Petugas Posko)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRoleTypeChange('admin')}
                                        className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                                            roleType === 'admin'
                                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                                : 'border-current/20 hover:bg-current/5'
                                        }`}
                                    >
                                        1. Admin (Administrator Posko)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold block mb-1">Deskripsi Peran & Tanggung Jawab:</label>
                                <textarea
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Jelaskan peran tugas profil otoritas ini..."
                                    className="w-full p-2 text-xs rounded-lg border border-current/20 bg-current/5 outline-none focus:border-teal-500"
                                />
                            </div>

                            {/* Permission Checklist */}
                            <div className="p-3 rounded-xl bg-current/5 border border-current/10 space-y-2">
                                <span className="text-xs font-extrabold uppercase tracking-wider block">
                                    Konfigurasi Hak Izin (Permissions):
                                </span>

                                <div className="space-y-1.5">
                                    <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={canAccessAdmin}
                                            onChange={(e) => setCanAccessAdmin(e.target.checked)}
                                            className="rounded text-teal-600 focus:ring-teal-500"
                                        />
                                        <span>Dapat Mengakses Dashboard Admin Posko</span>
                                    </label>

                                    <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={canManageUsers}
                                            onChange={(e) => setCanManageUsers(e.target.checked)}
                                            className="rounded text-teal-600 focus:ring-teal-500"
                                        />
                                        <span>Dapat Menambah, Edit, dan Hapus Pengguna</span>
                                    </label>

                                    <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={canResetPassword}
                                            onChange={(e) => setCanResetPassword(e.target.checked)}
                                            className="rounded text-teal-600 focus:ring-teal-500"
                                        />
                                        <span>Dapat Mereset & Mengosongkan Password User</span>
                                    </label>

                                    <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={canBroadcastSchedule}
                                            onChange={(e) => setCanBroadcastSchedule(e.target.checked)}
                                            className="rounded text-teal-600 focus:ring-teal-500"
                                        />
                                        <span>Dapat Mengimpor Jadwal Pengguna dari Excel</span>
                                    </label>

                                    <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={canViewAllSessions}
                                            onChange={(e) => setCanViewAllSessions(e.target.checked)}
                                            className="rounded text-teal-600 focus:ring-teal-500"
                                        />
                                        <span>Dapat Melihat Log Sesi Seluruh Pengguna</span>
                                    </label>

                                    {/* HAK IZIN BARU */}
                                    <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={canEditAuthorities}
                                            onChange={(e) => setCanEditAuthorities(e.target.checked)}
                                            className="rounded text-teal-600 focus:ring-teal-500"
                                        />
                                        <span>Edit Otoritas (Ubah Nama, Role, & Hak Akses)</span>
                                    </label>

                                    <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={canDeleteAdminAuthority}
                                            onChange={(e) => setCanDeleteAdminAuthority(e.target.checked)}
                                            className="rounded text-rose-600 focus:ring-rose-500"
                                        />
                                        <span className="text-rose-600 dark:text-rose-400">Hapus Otoritas Admin (Izin Menghapus Profil Admin)</span>
                                    </label>
                                </div>
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
                                    <span>Simpan Profil Otoritas</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDIT PROFIL OTORITAS */}
            {isEditModalOpen && activeProfile && (
                <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="fixed inset-0" onClick={() => setIsEditModalOpen(false)} />
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
                                <Edit className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide">
                                    Edit Otoritas: {activeProfile.name}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-1 rounded-lg hover:bg-current/10 opacity-70 hover:opacity-100 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProfileSubmit} className="space-y-3.5">
                            <div>
                                <label className="text-xs font-bold block mb-1">Nama Profil Otoritas:</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-2 text-xs rounded-lg border border-current/20 bg-current/5 font-bold outline-none focus:border-teal-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold block mb-1">Kelompok Tingkat Role:</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setRoleType('end-user')}
                                        className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                                            roleType === 'end-user'
                                                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                                                : 'border-current/20 hover:bg-current/5'
                                        }`}
                                    >
                                        2. End-User
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRoleType('admin')}
                                        className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                                            roleType === 'admin'
                                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                                : 'border-current/20 hover:bg-current/5'
                                        }`}
                                    >
                                        1. Admin
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold block mb-1">Deskripsi Peran & Tanggung Jawab:</label>
                                <textarea
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-2 text-xs rounded-lg border border-current/20 bg-current/5 outline-none focus:border-teal-500"
                                />
                            </div>

                            {/* Permission Checklist */}
                            <div className="p-3 rounded-xl bg-current/5 border border-current/10 space-y-2">
                                <span className="text-xs font-extrabold uppercase tracking-wider block">
                                    Konfigurasi Hak Izin (Permissions):
                                </span>

                                <div className="space-y-1.5">
                                    <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={canAccessAdmin}
                                            onChange={(e) => setCanAccessAdmin(e.target.checked)}
                                            className="rounded text-teal-600 focus:ring-teal-500"
                                        />
                                        <span>Dapat Mengakses Dashboard Admin Posko</span>
                                    </label>

                                    <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={canManageUsers}
                                            onChange={(e) => setCanManageUsers(e.target.checked)}
                                            className="rounded text-teal-600 focus:ring-teal-500"
                                        />
                                        <span>Dapat Menambah, Edit, dan Hapus Pengguna</span>
                                    </label>

                                    <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={canResetPassword}
                                            onChange={(e) => setCanResetPassword(e.target.checked)}
                                            className="rounded text-teal-600 focus:ring-teal-500"
                                        />
                                        <span>Dapat Mereset & Mengosongkan Password User</span>
                                    </label>

                                    <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={canBroadcastSchedule}
                                            onChange={(e) => setCanBroadcastSchedule(e.target.checked)}
                                            className="rounded text-teal-600 focus:ring-teal-500"
                                        />
                                        <span>Dapat Mengimpor Jadwal Pengguna dari Excel</span>
                                    </label>

                                    <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={canViewAllSessions}
                                            onChange={(e) => setCanViewAllSessions(e.target.checked)}
                                            className="rounded text-teal-600 focus:ring-teal-500"
                                        />
                                        <span>Dapat Melihat Log Sesi Seluruh Pengguna</span>
                                    </label>

                                    {/* HAK IZIN BARU */}
                                    <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={canEditAuthorities}
                                            onChange={(e) => setCanEditAuthorities(e.target.checked)}
                                            className="rounded text-teal-600 focus:ring-teal-500"
                                        />
                                        <span>Edit Otoritas (Ubah Nama, Role, & Hak Akses)</span>
                                    </label>

                                    <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={canDeleteAdminAuthority}
                                            onChange={(e) => setCanDeleteAdminAuthority(e.target.checked)}
                                            className="rounded text-rose-600 focus:ring-rose-500"
                                        />
                                        <span className="text-rose-600 dark:text-rose-400">Hapus Otoritas Admin (Izin Menghapus Profil Admin)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-current/10">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
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

            {/* MODAL HAPUS PROFIL OTORITAS */}
            {isDeleteModalOpen && activeProfile && (
                <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="fixed inset-0" onClick={() => setIsDeleteModalOpen(false)} />
                    <div className={`relative z-10 w-full max-w-md p-5 rounded-2xl border space-y-4 shadow-2xl ${
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
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-extrabold">Hapus Profil Otoritas</h3>
                                <p className="text-xs opacity-75 font-mono">{activeProfile.name}</p>
                            </div>
                        </div>

                        <p className="text-xs opacity-85 leading-relaxed">
                            Apakah Anda yakin ingin menghapus profil otoritas <strong>{activeProfile.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </p>

                        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-current/10">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-3.5 py-2 text-xs font-bold rounded-lg border border-current/20 hover:bg-current/10 cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteProfileSubmit}
                                className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs flex items-center gap-1.5"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Hapus Otoritas</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
