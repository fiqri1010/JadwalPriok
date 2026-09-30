export type UserRole = 'admin' | 'end-user' | 'non-user';

export interface AuthorityProfile {
    id: string;
    name: string;
    description: string;
    roleType: UserRole;
    badgeColor: string;
    isSystemDefault?: boolean;
    permissions: {
        canAccessAdminDashboard: boolean;
        canManageUsers: boolean;
        canResetUserPassword: boolean;
        canBroadcastSchedule: boolean;
        canViewAllSessions: boolean;
        canEditOwnSchedule: boolean;
        canDeleteAdminAuthority: boolean; // Hapus otoritas admin
        canEditAuthorities: boolean; // Edit Otoritas
    };
    userCount?: number;
}

export interface UserAccount {
    id: string;
    nip: string;
    name: string;
    unitPosko: string;
    role: UserRole;
    authorityProfileId: string;
    authorityName: string;
    isActive: boolean;
    hasPassword: boolean;
    passwordValue?: string;
    isExternalNonAppUser?: boolean; // Petugas Posko Luar yang belum punya akun aplikasi
    assignedSquad?: 'Regu A' | 'Regu B' | 'Regu C' | 'Regu D' | 'Non-Regu';
    createdAt: string;
    lastActive?: string;
}

export interface UserSessionRecord {
    id: string;
    userNip: string;
    userName: string;
    unitPosko: string;
    deviceName: string;
    deviceType: 'desktop' | 'laptop' | 'tablet' | 'mobile';
    browser: string;
    os: string;
    ipAddress: string;
    macAddress?: string;
    location: string;
    loginTime: string;
    lastActive: string;
    isOnline: boolean;
}

export interface ScheduleCopyTarget {
    userId: string;
    nip: string;
    name: string;
    unitPosko: string;
    isExternal: boolean;
    selected: boolean;
    shiftPattern: 'Impor Excel' | 'Ikuti Master' | 'Regu A' | 'Regu B' | 'Regu C' | 'Regu D' | 'Piket Khusus' | string;
    statusText?: string;
}

export interface UserApprovalRequest {
    id: string;
    userNip: string;
    userName: string;
    unitPosko: string;
    requestType: 'delete_account' | 'reset_password';
    reason?: string;
    requestedAt: string;
    status: 'pending' | 'approved' | 'rejected';
    processedAt?: string;
    processedBy?: string;
}
