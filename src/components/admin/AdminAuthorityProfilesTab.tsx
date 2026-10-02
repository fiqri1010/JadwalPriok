import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
    LayoutDashboard,
    UserCheck,
    KeyRound,
    FileSpreadsheet,
    Laptop,
    Settings,
    ShieldAlert,
    Filter,
    Search,
} from 'lucide-react';
import { AuthorityProfile, UserRole, UserAccount } from '../../types/admin';
import { AppTheme } from '../../types';
import { Checkbox } from '../ui/Checkbox';
import { getCurrentUserPermissions } from '../../utils/adminStorage';

interface AdminAuthorityProfilesTabProps {
    profiles: AuthorityProfile[];
    users: UserAccount[];
    onUpdateProfiles: (profiles: AuthorityProfile[]) => void;
    onUpdateUsers?: (users: UserAccount[]) => void;
    onShowToast: (msg: string) => void;
    theme?: AppTheme;
}

export const AdminAuthorityProfilesTab: React.FC<AdminAuthorityProfilesTabProps> = ({
    profiles,
    users,
    onUpdateProfiles,
    onUpdateUsers,
    onShowToast,
    theme = 'default',
}) => {
    const isIndustrial = theme === 'industrial';
    const isPaperSketch = theme === 'paperSketch';
    const isTechnical = theme === 'technical';
    const isWinamp = theme === 'winamp';
    const isDark = theme === 'dark';
    const isDashboard = theme === 'dashboard';

    const permissions = getCurrentUserPermissions();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [showUserSelection, setShowUserSelection] = useState(false);
    const [lastMassAppliedProfileId, setLastMassAppliedProfileId] = useState<string | null>(null);

    const [activeProfile, setActiveProfile] = useState<AuthorityProfile | null>(null);

    // Modal Sub Tab ('permissions' | 'users')
    const [modalTab, setModalTab] = useState<'permissions' | 'users'>('permissions');

    // Filter & Search Pengguna di Modal Role
    const [selectedPoskoFilter, setSelectedPoskoFilter] = useState<string>('Semua');
    const [userSearchQuery, setUserSearchQuery] = useState<string>('');

    // Form Fields
    const [name, setName] = useState('');
    const [roleType, setRoleType] = useState<UserRole>('end-user');
    const [description, setDescription] = useState('');
    const [canLoginToApp, setCanLoginToApp] = useState(true);
    const [canAccessAdmin, setCanAccessAdmin] = useState(false);
    const [canManageUsers, setCanManageUsers] = useState(false);
    const [canResetPassword, setCanResetPassword] = useState(false);
    const [canBroadcastSchedule, setCanBroadcastSchedule] = useState(false);
    const [canViewAllSessions, setCanViewAllSessions] = useState(false);
    const [canEditOwnSchedule, setCanEditOwnSchedule] = useState(true);
    const [canDeleteAdminAuthority, setCanDeleteAdminAuthority] = useState(false);
    const [canEditAuthorities, setCanEditAuthorities] = useState(false);
    const [canEditHolidays, setCanEditHolidays] = useState(false);
    const [canAccessApprovals, setCanAccessApprovals] = useState(false);
    const [canEditAllShifts, setCanEditAllShifts] = useState(true);
    const [canEditSomeShifts, setCanEditSomeShifts] = useState(false);

    const openAddModal = () => {
        if (!permissions.canEditAuthorities) {
            onShowToast('Akses dibatasi: Role Anda tidak memiliki izin menambah role/otoritas baru (canEditAuthorities).');
            return;
        }
        setName('');
        setRoleType('end-user');
        setDescription('');
        setCanLoginToApp(true);
        setCanAccessAdmin(false);
        setCanManageUsers(false);
        setCanResetPassword(false);
        setCanBroadcastSchedule(false);
        setCanViewAllSessions(false);
        setCanEditOwnSchedule(true);
        setCanDeleteAdminAuthority(false);
        setCanEditAuthorities(false);
        setCanEditHolidays(false);
        setCanAccessApprovals(false);
        setCanEditAllShifts(true);
        setCanEditSomeShifts(false);
        setModalTab('permissions');
        setSelectedPoskoFilter('Semua');
        setUserSearchQuery('');
        setIsAddModalOpen(true);
    };

    const openEditModal = (prof: AuthorityProfile) => {
        if (!permissions.canEditAuthorities) {
            onShowToast('Akses dibatasi: Role Anda tidak memiliki izin mengedit role/otoritas (canEditAuthorities).');
            return;
        }
        setActiveProfile(prof);
        setName(prof.name);
        setRoleType(prof.roleType);
        setDescription(prof.description);
        setCanLoginToApp(prof.permissions.canLoginToApp !== false);
        setCanAccessAdmin(Boolean(prof.permissions.canAccessAdminDashboard));
        setCanManageUsers(Boolean(prof.permissions.canManageUsers));
        setCanResetPassword(Boolean(prof.permissions.canResetUserPassword));
        setCanBroadcastSchedule(Boolean(prof.permissions.canBroadcastSchedule));
        setCanViewAllSessions(Boolean(prof.permissions.canViewAllSessions));
        setCanEditOwnSchedule(Boolean(prof.permissions.canEditOwnSchedule));
        setCanDeleteAdminAuthority(Boolean(prof.permissions.canDeleteAdminAuthority));
        setCanEditAuthorities(Boolean(prof.permissions.canEditAuthorities));
        setCanEditHolidays(Boolean(prof.permissions.canEditHolidays));
        setCanAccessApprovals(Boolean(prof.permissions.canAccessApprovals));
        setCanEditAllShifts(prof.permissions.canEditAllShifts !== false);
        setCanEditSomeShifts(Boolean(prof.permissions.canEditSomeShifts));
        setModalTab('permissions');
        setSelectedPoskoFilter('Semua');
        setUserSearchQuery('');
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (prof: AuthorityProfile) => {
        if (!permissions.canEditAuthorities || !permissions.canDeleteAdminAuthority) {
            onShowToast('Akses dibatasi: Role Anda tidak memiliki izin menghapus role/otoritas (canDeleteAdminAuthority).');
            return;
        }
        setActiveProfile(prof);
        setIsDeleteModalOpen(true);
    };

    const handleRoleTypeChange = (newRole: UserRole) => {
        setRoleType(newRole);
        if (newRole === 'admin') {
            setCanLoginToApp(true);
            setCanAccessAdmin(true);
            setCanManageUsers(true);
            setCanResetPassword(true);
            setCanBroadcastSchedule(true);
            setCanViewAllSessions(true);
            setCanEditAuthorities(true);
            setCanEditOwnSchedule(true);
        } else if (newRole === 'non-user') {
            setCanLoginToApp(false);
            setCanAccessAdmin(false);
            setCanManageUsers(false);
            setCanResetPassword(false);
            setCanBroadcastSchedule(false);
            setCanViewAllSessions(false);
            setCanDeleteAdminAuthority(false);
            setCanEditAuthorities(false);
            setCanEditOwnSchedule(false);
        } else {
            // end-user / lainnya
            setCanLoginToApp(true);
            setCanAccessAdmin(false);
            setCanManageUsers(false);
            setCanResetPassword(false);
            setCanBroadcastSchedule(false);
            setCanViewAllSessions(false);
            setCanDeleteAdminAuthority(false);
            setCanEditAuthorities(false);
            setCanEditOwnSchedule(true);
        }
    };

    const handleToggleAccessAdmin = (checked: boolean) => {
        setCanAccessAdmin(checked);
        if (!checked) {
            setCanManageUsers(false);
            setCanResetPassword(false);
            setCanBroadcastSchedule(false);
            setCanViewAllSessions(false);
            setCanEditAuthorities(false);
            setCanDeleteAdminAuthority(false);
        }
    };

    const handleSaveNewProfile = (e?: React.FormEvent) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!name.trim()) {
            onShowToast('Nama profil otoritas wajib diisi.');
            return;
        }

        const trimmedName = name.trim();
        const badgeColor =
            roleType === 'admin'
                ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
                : roleType === 'non-user'
                ? 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30'
                : 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30';

        const newProf: AuthorityProfile = {
            id: `prof-${Date.now()}`,
            name: trimmedName,
            description: description.trim() || 'Profil hak akses kustom posko.',
            roleType,
            badgeColor,
            isSystemDefault: false,
            permissions: {
                canLoginToApp,
                canAccessAdminDashboard: canAccessAdmin,
                canManageUsers,
                canResetUserPassword: canResetPassword,
                canBroadcastSchedule,
                canViewAllSessions,
                canEditOwnSchedule,
                canDeleteAdminAuthority,
                canEditAuthorities,
                canEditHolidays,
                canAccessApprovals,
                canEditAllShifts,
                canEditSomeShifts,
            },
        };

        const updated = [...profiles, newProf];
        onUpdateProfiles(updated);
        setIsAddModalOpen(false);
        onShowToast(`Profil otoritas baru "${newProf.name}" berhasil dibuat.`);
    };

    const handleUpdateProfileSubmit = (e?: React.FormEvent) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!activeProfile || !name.trim()) {
            onShowToast('Nama profil otoritas tidak boleh kosong.');
            return;
        }

        const trimmedName = name.trim();
        const updatedList = profiles.map((p) => {
            if (p.id === activeProfile.id) {
                return {
                    ...p,
                    name: trimmedName,
                    description: description.trim(),
                    roleType,
                    badgeColor:
                        roleType === 'admin'
                            ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
                            : roleType === 'non-user'
                            ? 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30'
                            : 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30',
                    permissions: {
                        canLoginToApp,
                        canAccessAdminDashboard: canAccessAdmin,
                        canManageUsers,
                        canResetUserPassword: canResetPassword,
                        canBroadcastSchedule,
                        canViewAllSessions,
                        canEditOwnSchedule,
                        canDeleteAdminAuthority,
                        canEditAuthorities,
                        canEditHolidays,
                        canAccessApprovals,
                        canEditAllShifts,
                        canEditSomeShifts,
                    },
                };
            }
            return p;
        });

        // Sinkronkan nama wewenang & role pada seluruh akun pengguna yang menggunakan profile ini
        if (onUpdateUsers && users.some((u) => u.authorityProfileId === activeProfile.id)) {
            const updatedUsers = users.map((u) => {
                if (u.authorityProfileId === activeProfile.id) {
                    return {
                        ...u,
                        authorityName: trimmedName,
                        role: roleType,
                    };
                }
                return u;
            });
            onUpdateUsers(updatedUsers);
        }

        onUpdateProfiles(updatedList);
        setIsEditModalOpen(false);
        onShowToast(`Profil otoritas "${trimmedName}" berhasil diperbarui.`);
    };

    const handleDeleteProfileSubmit = () => {
        if (!activeProfile) return;

        if (activeProfile.roleType === 'admin' && !permissions.canDeleteAdminAuthority) {
            onShowToast('Akses dibatasi: Role Anda tidak memiliki izin menghapus role/otoritas admin (canDeleteAdminAuthority).');
            setIsDeleteModalOpen(false);
            return;
        }

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

    const handleAssignUserRole = (userNip: string, targetProfile: AuthorityProfile) => {
        if (!permissions.canEditAuthorities) {
            onShowToast('Akses dibatasi: Role Anda tidak memiliki izin mengubah role pengguna.');
            return;
        }
        const updatedUsers = users.map((u) => {
            if (u.nip === userNip) {
                return {
                    ...u,
                    authorityProfileId: targetProfile.id,
                    authorityName: targetProfile.name,
                    role: targetProfile.roleType,
                };
            }
            return u;
        });
        if (onUpdateUsers) {
            onUpdateUsers(updatedUsers);
        }
        const assignedUser = users.find((u) => u.nip === userNip);
        onShowToast(`Role ${assignedUser?.name || 'Pengguna'} diperbarui ke "${targetProfile.name}"`);
    };

    const renderUserSelectionSection = () => {
        const poskoList = Array.from(new Set(users.map((u) => u.unitPosko).filter(Boolean))).sort();

        const filteredUsers = users.filter((u) => {
            const matchesPosko = selectedPoskoFilter === 'Semua' || u.unitPosko === selectedPoskoFilter;
            const matchesSearch =
                !userSearchQuery.trim() ||
                u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                u.nip.toLowerCase().includes(userSearchQuery.toLowerCase());
            return matchesPosko && matchesSearch;
        });

        const handleMassApplyRole = (targetProfile: AuthorityProfile) => {
            if (!permissions.canEditAuthorities) {
                onShowToast('Akses dibatasi: Role Anda tidak memiliki izin menerapkan role massal.');
                return;
            }
            const affectedNips = new Set(filteredUsers.map((u) => u.nip));
            const updatedUsers = users.map((u) => {
                if (affectedNips.has(u.nip)) {
                    return {
                        ...u,
                        authorityProfileId: targetProfile.id,
                        authorityName: targetProfile.name,
                        role: targetProfile.roleType,
                    };
                }
                return u;
            });
            if (onUpdateUsers) {
                onUpdateUsers(updatedUsers);
            }
            setLastMassAppliedProfileId(targetProfile.id);
            onShowToast(`Berhasil menerapkan role "${targetProfile.name}" secara massal kepada ${affectedNips.size} pegawai di ${selectedPoskoFilter}`);
        };

        return (
            <div className="space-y-3 pt-1">
                {/* Filter Posko & Cari Pengguna */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-current/5 border border-current/10">
                    <div className="flex items-center space-x-2 flex-1">
                        <Filter className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className="text-xs font-bold shrink-0">Filter Posko:</span>
                        <select
                             value={selectedPoskoFilter}
                             onChange={(e) => setSelectedPoskoFilter(e.target.value)}
                             className="px-2.5 py-1.5 text-xs rounded-lg border border-current/20 bg-current/10 font-bold outline-none cursor-pointer focus:border-teal-500 min-w-[140px]"
                        >
                            <option value="Semua">Semua Posko ({users.length})</option>
                            {poskoList.map((posko) => {
                                const count = users.filter((u) => u.unitPosko === posko).length;
                                return (
                                    <option key={posko} value={posko}>
                                        {posko} ({count})
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="relative flex-1 max-w-xs">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
                        <input
                            type="text"
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            placeholder="Cari Nama / NIP..."
                            className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-current/20 bg-current/10 font-medium outline-none focus:border-teal-500"
                        />
                    </div>
                </div>

                {/* Mass Apply Panel (Hanya muncul jika filter posko aktif selain Semua) */}
                {selectedPoskoFilter !== 'Semua' && filteredUsers.length > 0 && (
                    <div className="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in slide-in-from-top duration-150">
                        <div className="min-w-0">
                            <span className="text-[11px] font-black uppercase tracking-wider block text-amber-800 dark:text-amber-400">
                                Terapkan <span className="italic">Role</span> Massal
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {profiles.map((prof) => {
                                const isLastClicked = prof.id === lastMassAppliedProfileId;
                                return (
                                    <button
                                        key={prof.id}
                                        type="button"
                                        onClick={() => handleMassApplyRole(prof)}
                                        className={`px-3 py-1.5 text-[11px] font-black rounded-xl border cursor-pointer transition-all duration-150 flex items-center space-x-1.5 ${
                                            isLastClicked
                                                ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-500/50 scale-[1.03]'
                                                : 'border-amber-500/30 hover:bg-amber-500/10 text-amber-900 dark:text-amber-300'
                                        }`}
                                        title={`Terapkan role ${prof.name} ke seluruh ${filteredUsers.length} pegawai`}
                                    >
                                        {isLastClicked && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                        )}
                                        <span>{prof.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Tabel Pilih Pengguna & Radio Button Pilih Role */}
                <div className="rounded-xl border border-current/10 overflow-hidden bg-current/5">
                    <div className="max-h-[320px] overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-current/15 bg-current/10 text-[10.5px] font-extrabold uppercase tracking-wider opacity-80">
                                    <th className="py-2 px-3">Nama</th>
                                    <th className="py-2 px-3">NIP</th>
                                    <th className="py-2 px-3">Role (Radio Button)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-current/10 text-xs">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="py-6 text-center opacity-60 font-medium">
                                            Tidak ada pengguna ditemukan untuk posko/pencarian ini.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-current/5 transition-colors">
                                            <td className="py-2.5 px-3 font-bold truncate max-w-[160px]">
                                                {u.name}
                                                <span className="block text-[10px] font-normal opacity-60">
                                                    Posko: {u.unitPosko}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 font-mono opacity-80 whitespace-nowrap">
                                                {u.nip || '-'}
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    {profiles.map((prof) => {
                                                        const isChecked = u.authorityProfileId === prof.id || u.authorityName === prof.name;
                                                        return (
                                                            <label
                                                                key={prof.id}
                                                                className={`flex items-center space-x-1 px-2 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                                                                    isChecked
                                                                        ? 'bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300 shadow-2xs'
                                                                        : 'border-current/15 hover:bg-current/10 opacity-70'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name={`role-radio-${u.id}`}
                                                                    checked={isChecked}
                                                                    onChange={() => handleAssignUserRole(u.nip, prof)}
                                                                    className="w-3 h-3 text-teal-600 focus:ring-teal-500 cursor-pointer"
                                                                />
                                                                <span>{prof.name}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    // Subkomponen Checklist Permission yang Rapi & Terstruktur
    const renderPermissionFormSection = (prefix: 'add' | 'edit') => {
        const isNonUser = roleType === 'non-user';
        const isAdminRole = roleType === 'admin';
        const isAccessAdminDisabled = !isAdminRole && !isNonUser;
        const isDependentDisabled = !canAccessAdmin && !isNonUser;

        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-black uppercase tracking-wider block text-current">
                            Konfigurasi Hak Izin (Permissions)
                        </span>
                        <p className="text-[10px] opacity-65">
                            Pilih hak istimewa & wewenang operasional untuk kelompok role ini
                        </p>
                    </div>
                </div>

                {isNonUser && (
                    <div className="p-2.5 rounded-xl border border-dashed border-current/25 bg-current/5 flex items-start space-x-2">
                        <Info className="w-3.5 h-3.5 opacity-70 shrink-0 mt-0.5" />
                        <p className="text-[11px] opacity-80 leading-relaxed">
                            <strong>Role Non-User:</strong> Personel kelompok ini dikoordinasikan secara terpusat oleh Admin. Atur hak izin khusus mereka di bawah ini jika diperlukan.
                        </p>
                    </div>
                )}

                <div className="space-y-2">
                    {/* Grup 1: Administrasi & Akun Pengguna */}
                    <div className="p-2 rounded-xl bg-current/5 border border-current/10 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-65 flex items-center gap-1">
                            <Shield className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                            1. Akses Sistem & Administrasi Akun
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
                            <label className={`p-1.5 rounded-lg border transition-all flex items-start space-x-1.5 ${
                                canLoginToApp
                                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 cursor-pointer'
                                    : 'border-current/15 hover:bg-current/5 cursor-pointer'
                            }`}>
                                <Checkbox
                                    id={`${prefix}-can-login-app`}
                                    theme={theme}
                                    checked={canLoginToApp}
                                    onChange={(e) => setCanLoginToApp(e.target.checked)}
                                />
                                <div className="min-w-0">
                                    <span className="text-[11px] font-bold block leading-tight">Masuk ke Aplikasi</span>
                                    <span className="text-[9.5px] opacity-65 block leading-tight mt-0.5">Izin login user ke aplikasi</span>
                                </div>
                            </label>

                            <label className={`p-1.5 rounded-lg border transition-all flex items-start space-x-1.5 ${
                                isAccessAdminDisabled
                                    ? 'opacity-40 cursor-not-allowed bg-current/5 border-current/10 select-none'
                                    : canAccessAdmin
                                    ? 'bg-teal-500/10 border-teal-500/40 text-teal-700 dark:text-teal-300 cursor-pointer'
                                    : 'border-current/15 hover:bg-current/5 cursor-pointer'
                            }`}>
                                <Checkbox
                                    id={`${prefix}-can-access-admin`}
                                    theme={theme}
                                    checked={canAccessAdmin}
                                    disabled={isAccessAdminDisabled}
                                    onChange={(e) => handleToggleAccessAdmin(e.target.checked)}
                                />
                                <div className="min-w-0">
                                    <span className="text-[11px] font-bold block leading-tight">Akses Dashboard</span>
                                    <span className="text-[9.5px] opacity-65 block leading-tight mt-0.5">
                                        {isAccessAdminDisabled ? 'Khusus role Admin' : 'Buka menu admin posko'}
                                    </span>
                                </div>
                            </label>

                            <label className={`p-1.5 rounded-lg border transition-all flex items-start space-x-1.5 ${
                                isDependentDisabled
                                    ? 'opacity-40 cursor-not-allowed bg-current/5 border-current/10 select-none'
                                    : canManageUsers
                                    ? 'bg-teal-500/10 border-teal-500/40 text-teal-700 dark:text-teal-300 cursor-pointer'
                                    : 'border-current/15 hover:bg-current/5 cursor-pointer'
                            }`}>
                                <Checkbox
                                    id={`${prefix}-can-manage-users`}
                                    theme={theme}
                                    checked={canManageUsers}
                                    disabled={isDependentDisabled}
                                    onChange={(e) => setCanManageUsers(e.target.checked)}
                                />
                                <div className="min-w-0">
                                    <span className="text-[11px] font-bold block leading-tight">Kelola Pengguna</span>
                                    <span className="text-[9.5px] opacity-65 block leading-tight mt-0.5">Tambah, edit, hapus akun</span>
                                </div>
                            </label>

                            <label className={`p-1.5 rounded-lg border transition-all flex items-start space-x-1.5 ${
                                isDependentDisabled
                                    ? 'opacity-40 cursor-not-allowed bg-current/5 border-current/10 select-none'
                                    : canResetPassword
                                    ? 'bg-teal-500/10 border-teal-500/40 text-teal-700 dark:text-teal-300 cursor-pointer'
                                    : 'border-current/15 hover:bg-current/5 cursor-pointer'
                            }`}>
                                <Checkbox
                                    id={`${prefix}-can-reset-password`}
                                    theme={theme}
                                    checked={canResetPassword}
                                    disabled={isDependentDisabled}
                                    onChange={(e) => setCanResetPassword(e.target.checked)}
                                />
                                <div className="min-w-0">
                                    <span className="text-[11px] font-bold block leading-tight">Reset Password</span>
                                    <span className="text-[9.5px] opacity-65 block leading-tight mt-0.5">Reset kata sandi user</span>
                                </div>
                            </label>

                            <label className={`p-1.5 rounded-lg border transition-all flex items-start space-x-1.5 ${
                                isDependentDisabled
                                    ? 'opacity-40 cursor-not-allowed bg-current/5 border-current/10 select-none'
                                    : canAccessApprovals
                                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300 cursor-pointer'
                                    : 'border-current/15 hover:bg-current/5 cursor-pointer'
                            }`}>
                                <Checkbox
                                    id={`${prefix}-can-access-approvals`}
                                    theme={theme}
                                    checked={canAccessApprovals}
                                    disabled={isDependentDisabled}
                                    onChange={(e) => setCanAccessApprovals(e.target.checked)}
                                />
                                <div className="min-w-0">
                                    <span className="text-[11px] font-bold block leading-tight">Akses Persetujuan</span>
                                    <span className="text-[9.5px] opacity-65 block leading-tight mt-0.5">Buka halaman persetujuan</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Grup 2: Operasional Shift & Sesi Perangkat */}
                    <div className="p-2 rounded-xl bg-current/5 border border-current/10 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-65 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            2. Operasional Shift & Sesi
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                            <label className={`p-1.5 rounded-lg border transition-all flex items-start space-x-1.5 ${
                                isDependentDisabled
                                    ? 'opacity-40 cursor-not-allowed bg-current/5 border-current/10 select-none'
                                    : canBroadcastSchedule
                                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-700 dark:text-blue-300 cursor-pointer'
                                    : 'border-current/15 hover:bg-current/5 cursor-pointer'
                            }`}>
                                <Checkbox
                                    id={`${prefix}-can-broadcast`}
                                    theme={theme}
                                    checked={canBroadcastSchedule}
                                    disabled={isDependentDisabled}
                                    onChange={(e) => setCanBroadcastSchedule(e.target.checked)}
                                />
                                <div className="min-w-0">
                                    <span className="text-[11px] font-bold block leading-tight">Impor Jadwal Shift</span>
                                    <span className="text-[9.5px] opacity-65 block leading-tight mt-0.5">Impor jadwal spreadsheet</span>
                                </div>
                            </label>

                            <label className={`p-1.5 rounded-lg border transition-all flex items-start space-x-1.5 ${
                                canEditHolidays
                                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-700 dark:text-blue-300 cursor-pointer'
                                    : 'border-current/15 hover:bg-current/5 cursor-pointer'
                            }`}>
                                <Checkbox
                                    id={`${prefix}-can-edit-holidays`}
                                    theme={theme}
                                    checked={canEditHolidays}
                                    disabled={false}
                                    onChange={(e) => setCanEditHolidays(e.target.checked)}
                                />
                                <div className="min-w-0">
                                    <span className="text-[11px] font-bold block leading-tight">Edit daftar libur</span>
                                    <span className="text-[9.5px] opacity-65 block leading-tight mt-0.5">Edit libur & lembur</span>
                                </div>
                            </label>

                            <label className={`p-1.5 rounded-lg border transition-all flex items-start space-x-1.5 ${
                                canEditAllShifts
                                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-700 dark:text-blue-300 cursor-pointer'
                                    : 'border-current/15 hover:bg-current/5 cursor-pointer'
                            }`}>
                                <Checkbox
                                    id={`${prefix}-can-edit-all-shifts`}
                                    theme={theme}
                                    checked={canEditAllShifts}
                                    disabled={false}
                                    onChange={(e) => {
                                        setCanEditAllShifts(e.target.checked);
                                        if (e.target.checked) {
                                            setCanEditSomeShifts(false);
                                        }
                                    }}
                                />
                                <div className="min-w-0">
                                    <span className="text-[11px] font-bold block leading-tight">Edit Seluruh Shift</span>
                                    <span className="text-[9.5px] opacity-65 block leading-tight mt-0.5">Kelola penuh shift posko</span>
                                </div>
                            </label>

                            <label className={`p-1.5 rounded-lg border transition-all flex items-start space-x-1.5 ${
                                canEditSomeShifts
                                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-700 dark:text-blue-300 cursor-pointer'
                                    : 'border-current/15 hover:bg-current/5 cursor-pointer'
                            }`}>
                                <Checkbox
                                    id={`${prefix}-can-edit-some-shifts`}
                                    theme={theme}
                                    checked={canEditSomeShifts}
                                    disabled={false}
                                    onChange={(e) => {
                                        setCanEditSomeShifts(e.target.checked);
                                        if (e.target.checked) {
                                            setCanEditAllShifts(false);
                                        }
                                    }}
                                />
                                <div className="min-w-0">
                                    <span className="text-[11px] font-bold block leading-tight">Edit Sebagian Shift</span>
                                    <span className="text-[9.5px] opacity-65 block leading-tight mt-0.5">Izin edit detail tanpa tambah/hapus</span>
                                </div>
                            </label>

                            <label className={`p-1.5 rounded-lg border transition-all flex items-start space-x-1.5 ${
                                isDependentDisabled
                                    ? 'opacity-40 cursor-not-allowed bg-current/5 border-current/10 select-none'
                                    : canViewAllSessions
                                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-700 dark:text-blue-300 cursor-pointer'
                                    : 'border-current/15 hover:bg-current/5 cursor-pointer'
                            }`}>
                                <Checkbox
                                    id={`${prefix}-can-view-sessions`}
                                    theme={theme}
                                    checked={canViewAllSessions}
                                    disabled={isDependentDisabled}
                                    onChange={(e) => setCanViewAllSessions(e.target.checked)}
                                />
                                <div className="min-w-0">
                                    <span className="text-[11px] font-bold block leading-tight">Lihat Sesi Perangkat</span>
                                    <span className="text-[9.5px] opacity-65 block leading-tight mt-0.5">Pantau sesi & riwayat login</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Grup 3: Tata Kelola Otoritas & Keamanan */}
                    <div className="p-2 rounded-xl bg-current/5 border border-current/10 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-65 flex items-center gap-1">
                            <Settings className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                            3. Tata Kelola Otoritas & Keamanan
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            <label className={`p-1.5 rounded-lg border transition-all flex items-start space-x-1.5 ${
                                isDependentDisabled
                                    ? 'opacity-40 cursor-not-allowed bg-current/5 border-current/10 select-none'
                                    : canEditAuthorities
                                    ? 'bg-purple-500/10 border-purple-500/40 text-purple-700 dark:text-purple-300 cursor-pointer'
                                    : 'border-current/15 hover:bg-current/5 cursor-pointer'
                            }`}>
                                <Checkbox
                                    id={`${prefix}-can-edit-authorities`}
                                    theme={theme}
                                    checked={canEditAuthorities}
                                    disabled={isDependentDisabled}
                                    onChange={(e) => setCanEditAuthorities(e.target.checked)}
                                />
                                <div className="min-w-0">
                                    <span className="text-[11px] font-bold block leading-tight">Edit Otoritas</span>
                                    <span className="text-[9.5px] opacity-65 block leading-tight mt-0.5">Ubah nama, peran & akses</span>
                                </div>
                            </label>

                            <label className={`p-1.5 rounded-lg border transition-all flex items-start space-x-1.5 ${
                                isDependentDisabled
                                    ? 'opacity-40 cursor-not-allowed bg-current/5 border-current/10 select-none'
                                    : canDeleteAdminAuthority
                                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300 cursor-pointer'
                                    : 'border-current/15 hover:bg-current/5 cursor-pointer'
                            }`}>
                                <Checkbox
                                    id={`${prefix}-can-delete-admin`}
                                    theme={theme}
                                    checked={canDeleteAdminAuthority}
                                    disabled={isDependentDisabled}
                                    onChange={(e) => setCanDeleteAdminAuthority(e.target.checked)}
                                />
                                <div className="min-w-0">
                                    <span className="text-[11px] font-bold block leading-tight text-rose-600 dark:text-rose-400">Hapus Otoritas Admin</span>
                                    <span className="text-[9.5px] opacity-65 block leading-tight mt-0.5">Izin khusus hapus profil admin</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        );
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
                                Role User
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                                {profiles.length} Role
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end">
                    <button
                        type="button"
                        onClick={() => setShowUserSelection(!showUserSelection)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center space-x-2 active:scale-95 transition-all border ${
                            showUserSelection
                                ? 'bg-teal-600/20 text-teal-600 border-teal-500'
                                : 'border-current/25 hover:bg-current/10'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Pilih Pengguna</span>
                    </button>

                    <button
                        type="button"
                        onClick={openAddModal}
                        className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center space-x-2 active:scale-95 transition-all"
                    >
                        <ShieldPlus className="w-4 h-4" />
                        <span>Tambah Role</span>
                    </button>
                </div>
            </div>

            {/* Panel Hubungkan Pengguna ke Role Otoritas (Pilih Pengguna) */}
            {showUserSelection && (
                <div className={`p-4 rounded-2xl border space-y-3 animate-in fade-in duration-200 ${
                    isIndustrial
                        ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.18)] text-[#E2E8F0]'
                        : isPaperSketch
                        ? 'bg-white border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
                        : isDark
                        ? 'bg-[#1E1E1E] border-slate-800 text-slate-100'
                        : isDashboard
                        ? 'bg-[#FFF9E6] border-[#4D2A00]/25 text-[#4D2A00]'
                        : 'bg-white border-slate-200 text-slate-900'
                }`}>
                    <div className="flex items-center justify-between border-b border-current/10 pb-2">
                        <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                                Hubungkan Pengguna ke Role Otoritas
                            </h4>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowUserSelection(false)}
                            className="text-xs font-bold hover:underline opacity-70 cursor-pointer"
                        >
                            Sembunyikan
                        </button>
                    </div>
                    {renderUserSelectionSection()}
                </div>
            )}

            {/* List Profil Otoritas - Minimalis & Tanpa Badge/Logo Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                {profiles.map((prof) => {
                    const assignedUsersCount = users.filter((u) => u.authorityProfileId === prof.id).length;
                    return (
                        <div
                            key={prof.id}
                            className={`p-3 sm:p-3.5 rounded-xl border flex flex-col justify-between space-y-2.5 transition-all ${
                                isIndustrial
                                    ? 'bg-[#0F1115] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                                    : isPaperSketch
                                    ? 'bg-white border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                                    : isDark
                                    ? 'bg-[#1E1E1E] border-slate-800'
                                    : isDashboard
                                    ? 'bg-[#FFF9E6] border-[#4D2A00]/25 text-[#4D2A00]'
                                    : 'bg-white border-slate-200 shadow-2xs'
                            }`}
                        >
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-xs sm:text-sm font-extrabold truncate">{prof.name}</h4>
                                            <span className="text-[10px] font-mono opacity-50 uppercase tracking-wide">
                                                ({prof.roleType})
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(prof)}
                                            className="p-1 rounded-md hover:bg-current/10 text-teal-600 dark:text-teal-400 cursor-pointer transition-all"
                                            title="Edit Otoritas"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </button>
                                        {prof.isSystemDefault ? (
                                            <button
                                                type="button"
                                                disabled
                                                className="p-1 rounded-md text-current opacity-25 cursor-not-allowed"
                                                title="Role bawaan sistem tidak dapat dihapus"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => openDeleteModal(prof)}
                                                className="p-1 rounded-md hover:bg-rose-500/10 text-rose-500 cursor-pointer transition-all"
                                                title="Hapus Otoritas"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-current/10 opacity-75">
                                            {assignedUsersCount} Pengguna
                                        </span>
                                    </div>
                                </div>

                                <p className="text-[11px] opacity-70 leading-relaxed">
                                    {prof.description}
                                </p>

                                {/* Permission Matrix (Minimalis & Rapi) */}
                                <div className="p-2 rounded-lg bg-current/5 border border-current/10 space-y-1">
                                    <span className="text-[9.5px] font-bold uppercase tracking-wider opacity-55 block">
                                        Hak Izin Aktif:
                                    </span>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-[10.5px]">
                                        <div className={`flex items-center space-x-1 p-0.5 rounded ${prof.permissions.canAccessAdminDashboard ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'opacity-30 line-through'}`}>
                                            <Check className="w-3 h-3 shrink-0" />
                                            <span className="truncate">Dashboard Admin</span>
                                        </div>
                                        <div className={`flex items-center space-x-1 p-0.5 rounded ${prof.permissions.canManageUsers ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'opacity-30 line-through'}`}>
                                            <Check className="w-3 h-3 shrink-0" />
                                            <span className="truncate">Kelola Pengguna</span>
                                        </div>
                                        <div className={`flex items-center space-x-1 p-0.5 rounded ${prof.permissions.canResetUserPassword ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'opacity-30 line-through'}`}>
                                            <Check className="w-3 h-3 shrink-0" />
                                            <span className="truncate">Reset Password</span>
                                        </div>
                                        <div className={`flex items-center space-x-1 p-0.5 rounded ${prof.permissions.canBroadcastSchedule ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'opacity-30 line-through'}`}>
                                            <Check className="w-3 h-3 shrink-0" />
                                            <span className="truncate">Impor Jadwal</span>
                                        </div>
                                        <div className={`flex items-center space-x-1 p-0.5 rounded ${prof.permissions.canViewAllSessions ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'opacity-30 line-through'}`}>
                                            <Check className="w-3 h-3 shrink-0" />
                                            <span className="truncate">Log Sesi</span>
                                        </div>
                                        <div className={`flex items-center space-x-1 p-0.5 rounded ${prof.permissions.canEditAuthorities ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'opacity-30 line-through'}`}>
                                            <Check className="w-3 h-3 shrink-0" />
                                            <span className="truncate">Edit Otoritas</span>
                                        </div>
                                        {prof.permissions.canDeleteAdminAuthority && (
                                            <div className="flex items-center space-x-1 p-0.5 rounded text-rose-600 dark:text-rose-400 font-bold col-span-full">
                                                <ShieldAlert className="w-3 h-3 shrink-0" />
                                                <span>Izin Khusus: Hapus Otoritas Admin</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-1.5 border-t border-current/10 flex items-center justify-between text-[10px] opacity-50 font-mono">
                                <span>ID: {prof.id}</span>
                                {prof.isSystemDefault && <span>(Bawaan Sistem)</span>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL TAMBAH PROFIL OTORITAS BARU */}
            {isAddModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="fixed inset-0" onClick={() => setIsAddModalOpen(false)} />
                    <div className={`relative z-10 w-full max-w-2xl p-4 sm:p-5 rounded-2xl border flex flex-col shadow-2xl my-auto max-h-[88vh] sm:max-h-[90vh] overflow-hidden ${
                        isIndustrial
                            ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.2)] text-[#E2E8F0]'
                            : isPaperSketch
                            ? 'bg-white border-2 border-[#2b2b2b] shadow-[5px_5px_0px_#2b2b2b]'
                            : isDark
                            ? 'bg-[#1E1E1E] border-slate-800 text-slate-100'
                            : isDashboard
                            ? 'bg-[#FFF9E6] border-[#4D2A00]/25 text-[#4D2A00]'
                            : 'bg-white border-slate-200 text-slate-900'
                    }`}>
                        <div className="flex items-center justify-between border-b border-current/10 pb-2.5 shrink-0">
                            <div className="flex items-center space-x-2">
                                <ShieldPlus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                                    Tambah Role Baru
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-1 rounded-lg hover:bg-current/10 opacity-70 hover:opacity-100 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveNewProfile} className="flex flex-col flex-1 min-h-0 space-y-3">
                            <div className="flex-1 overflow-y-auto min-h-0 space-y-2.5 pr-1 py-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <div>
                                        <label className="text-[11px] font-bold block mb-1">Nama Role Otoritas:</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Contoh: Koordinator Posko..."
                                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-current/20 bg-current/5 font-bold outline-none focus:border-teal-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold block mb-1">Kelompok Tingkat Role:</label>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleRoleTypeChange('admin')}
                                                className={`py-1.5 px-1 rounded-lg border text-xs font-bold text-center cursor-pointer transition-all ${
                                                    roleType === 'admin'
                                                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                                        : 'border-current/20 hover:bg-current/5'
                                                }`}
                                            >
                                                Admin
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRoleTypeChange('end-user')}
                                                className={`py-1.5 px-1 rounded-lg border text-xs font-bold text-center cursor-pointer transition-all ${
                                                    roleType === 'end-user'
                                                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                                                        : 'border-current/20 hover:bg-current/5'
                                                }`}
                                            >
                                                End-User
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRoleTypeChange('non-user')}
                                                className={`py-1.5 px-1 rounded-lg border text-xs font-bold text-center cursor-pointer transition-all ${
                                                    roleType === 'non-user'
                                                        ? 'bg-slate-600 text-white border-slate-600 shadow-xs'
                                                        : 'border-current/20 hover:bg-current/5'
                                                }`}
                                            >
                                                Non User
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold block mb-1">Deskripsi Peran & Tanggung Jawab:</label>
                                    <textarea
                                        rows={2}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Jelaskan wewenang atau peran tugas..."
                                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-current/20 bg-current/5 outline-none focus:border-teal-500 font-sans resize-y"
                                    />
                                </div>

                                {/* Konfigurasi Hak Izin (Permissions) Form Checklist yang Rapi & Hemat Ruang */}
                                {renderPermissionFormSection('add')}
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-2.5 border-t border-current/10 shrink-0 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-current/20 hover:bg-current/10 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-xs flex items-center gap-1.5"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Simpan Role</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* MODAL EDIT PROFIL OTORITAS */}
            {isEditModalOpen && activeProfile && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-200 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
                    <div className="fixed inset-0" onClick={() => setIsEditModalOpen(false)} />
                    <div className={`relative z-10 w-full max-w-2xl p-4 sm:p-5 rounded-2xl border space-y-3 shadow-2xl my-auto max-h-[92vh] overflow-y-auto ${
                        isIndustrial
                            ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.2)] text-[#E2E8F0]'
                            : isPaperSketch
                            ? 'bg-white border-2 border-[#2b2b2b] shadow-[5px_5px_0px_#2b2b2b]'
                            : isDark
                            ? 'bg-[#1E1E1E] border-slate-800 text-slate-100'
                            : isDashboard
                            ? 'bg-[#FFF9E6] border-[#4D2A00]/25 text-[#4D2A00]'
                            : 'bg-white border-slate-200 text-slate-900'
                    }`}>
                        <div className="flex items-center justify-between border-b border-current/10 pb-2.5">
                            <div className="flex items-center space-x-2">
                                <Edit className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                                    Edit Role: {activeProfile.name}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-1 rounded-lg hover:bg-current/10 opacity-70 hover:opacity-100 cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProfileSubmit} className="space-y-2.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <label className="text-[11px] font-bold block mb-1">Nama Role Otoritas:</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-current/20 bg-current/5 font-bold outline-none focus:border-teal-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold block mb-1">Kelompok Tingkat Role:</label>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => handleRoleTypeChange('admin')}
                                            className={`py-1.5 px-1 rounded-lg border text-xs font-bold text-center cursor-pointer transition-all ${
                                                roleType === 'admin'
                                                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                                    : 'border-current/20 hover:bg-current/5'
                                            }`}
                                        >
                                            Admin
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRoleTypeChange('end-user')}
                                            className={`py-1.5 px-1 rounded-lg border text-xs font-bold text-center cursor-pointer transition-all ${
                                                roleType === 'end-user'
                                                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                                                    : 'border-current/20 hover:bg-current/5'
                                            }`}
                                        >
                                            End-User
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRoleTypeChange('non-user')}
                                            className={`py-1.5 px-1 rounded-lg border text-xs font-bold text-center cursor-pointer transition-all ${
                                                roleType === 'non-user'
                                                    ? 'bg-slate-600 text-white border-slate-600 shadow-xs'
                                                    : 'border-current/20 hover:bg-current/5'
                                            }`}
                                        >
                                            Non User
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold block mb-1">Deskripsi Peran & Tanggung Jawab:</label>
                                <textarea
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Jelaskan wewenang atau peran tugas..."
                                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-current/20 bg-current/5 outline-none focus:border-teal-500 font-sans resize-y"
                                />
                            </div>

                            {/* Konfigurasi Hak Izin (Permissions) Form Checklist yang Rapi & Hemat Ruang */}
                            {renderPermissionFormSection('edit')}

                            <div className="flex items-center justify-end space-x-2 pt-2.5 border-t border-current/10">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-current/20 hover:bg-current/10 cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-xs flex items-center gap-1.5"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Simpan Perubahan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* MODAL HAPUS PROFIL OTORITAS */}
            {isDeleteModalOpen && activeProfile && typeof document !== 'undefined' && createPortal(
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
                                <h3 className="text-sm sm:text-base font-extrabold">Hapus Role</h3>
                                <p className="text-xs opacity-75 font-mono">{activeProfile.name}</p>
                            </div>
                        </div>

                        <p className="text-xs opacity-85 leading-relaxed">
                            Apakah Anda yakin ingin menghapus role otoritas <strong>{activeProfile.name}</strong>? Tindakan ini tidak dapat dibatalkan.
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
                </div>,
                document.body
            )}
        </div>
    );
};
