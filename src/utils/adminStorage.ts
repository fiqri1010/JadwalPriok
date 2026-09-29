import { UserAccount, AuthorityProfile, UserSessionRecord, UserRole } from '../types/admin';

export const LOCAL_STORAGE_USERS_KEY = 'jadwalpriok_admin_users';
export const LOCAL_STORAGE_PROFILES_KEY = 'jadwalpriok_admin_authority_profiles';
export const LOCAL_STORAGE_USER_SESSIONS_KEY = 'jadwalpriok_admin_all_sessions';
export const LOCAL_STORAGE_CURRENT_ROLE_KEY = 'jadwalpriok_current_user_role';
export const LOCAL_STORAGE_CURRENT_NIP_KEY = 'jadwalpriok_user_nip';
export const LOCAL_STORAGE_CURRENT_NAME_KEY = 'jadwalpriok_user_name';
export const LOCAL_STORAGE_CURRENT_PASS_KEY = 'jadwalpriok_user_pass';

// Profil Otoritas Standar
export const DEFAULT_AUTHORITY_PROFILES: AuthorityProfile[] = [
    {
        id: 'prof-superadmin',
        name: 'Super Admin & Koordinator Posko',
        description: 'Akses penuh ke dashboard admin, manajemen seluruh user, reset password, dan broadcast salin jadwal posko.',
        roleType: 'admin',
        badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
        isSystemDefault: true,
        permissions: {
            canAccessAdminDashboard: true,
            canManageUsers: true,
            canResetUserPassword: true,
            canBroadcastSchedule: true,
            canViewAllSessions: true,
            canEditOwnSchedule: true,
            canDeleteAdminAuthority: true,
            canEditAuthorities: true,
        },
    },
    {
        id: 'prof-admin-shift',
        name: 'Admin Shift & Supervisor',
        description: 'Dapat mengelola user shift dan melihat log sesi perangkat seluruh petugas.',
        roleType: 'admin',
        badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
        isSystemDefault: true,
        permissions: {
            canAccessAdminDashboard: true,
            canManageUsers: true,
            canResetUserPassword: true,
            canBroadcastSchedule: true,
            canViewAllSessions: true,
            canEditOwnSchedule: true,
            canDeleteAdminAuthority: false,
            canEditAuthorities: true,
        },
    },
    {
        id: 'prof-petugas-posko',
        name: 'Petugas Posko Graha & TPSL',
        description: 'End-user posko reguler untuk mencatat jadwal mandiri, tukar shift, dan mengecek kalender piket.',
        roleType: 'end-user',
        badgeColor: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30',
        isSystemDefault: true,
        permissions: {
            canAccessAdminDashboard: false,
            canManageUsers: false,
            canResetUserPassword: false,
            canBroadcastSchedule: false,
            canViewAllSessions: false,
            canEditOwnSchedule: true,
            canDeleteAdminAuthority: false,
            canEditAuthorities: false,
        },
    },
    {
        id: 'prof-posko-luar',
        name: 'Petugas Posko Luar / Non-Pengguna',
        description: 'Personel posko di luar terminal (NPCT/TPS) yang jadwalnya disalin & diimpor secara terpusat untuk statistik.',
        roleType: 'end-user',
        badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
        isSystemDefault: true,
        permissions: {
            canAccessAdminDashboard: false,
            canManageUsers: false,
            canResetUserPassword: false,
            canBroadcastSchedule: false,
            canViewAllSessions: false,
            canEditOwnSchedule: false,
            canDeleteAdminAuthority: false,
            canEditAuthorities: false,
        },
    },
];

// Helper generator for default end-user profiles
const createStaffUser = (idNum: number, name: string, nip: string, unitPosko: string): UserAccount => ({
    id: `usr-staff-${String(idNum).padStart(3, '0')}`,
    nip,
    name,
    unitPosko,
    role: 'end-user',
    authorityProfileId: 'prof-petugas-posko',
    authorityName: 'Petugas Posko Graha & TPSL',
    isActive: true,
    hasPassword: true,
    passwordValue: 'posko2026',
    isExternalNonAppUser: false,
    createdAt: '10 Jan 2026',
    lastActive: 'Aktif',
});

// Daftar User Bawaan (Admin & 120 Petugas Posko)
export const DEFAULT_USERS: UserAccount[] = [
    {
        id: 'usr-admin-01',
        nip: '199510102015121002',
        name: 'Ahmad Fiqri',
        unitPosko: 'Posko Graha Segara Lt. 1',
        role: 'admin',
        authorityProfileId: 'prof-superadmin',
        authorityName: 'Super Admin & Koordinator Posko',
        isActive: true,
        hasPassword: true,
        passwordValue: 'admin123',
        isExternalNonAppUser: false,
        createdAt: '10 Jan 2026',
        lastActive: 'Sedang Aktif (Admin)',
    },
    // Posko Graha Segara Lt. 1
    createStaffUser(2, 'Aldo Monang Simanjuntak', '199503212016121001', 'Posko Graha Segara Lt. 1'),
    createStaffUser(3, 'Ardhiansyah Fuad Asrurrosyid', '199204222012101001', 'Posko Graha Segara Lt. 1'),
    createStaffUser(4, 'Billfrit Gregerius Situmorang', '200001222018121001', 'Posko Graha Segara Lt. 1'),
    createStaffUser(5, 'Dio Wijayanto Nugroho', '199111142013101002', 'Posko Graha Segara Lt. 1'),
    createStaffUser(6, 'Eko David Prasetiyo', '199501052015021002', 'Posko Graha Segara Lt. 1'),
    createStaffUser(7, 'Galih Bekti Prabowo', '199601172015021002', 'Posko Graha Segara Lt. 1'),
    createStaffUser(8, 'Hafiizh Ha Razzaag', '199504242015021007', 'Posko Graha Segara Lt. 1'),
    createStaffUser(9, 'Herbet Alfrin Simanjuntak', '199503232015021003', 'Posko Graha Segara Lt. 1'),
    createStaffUser(10, 'Hilman Nuzzy Al Mustaqim', '199502172015021007', 'Posko Graha Segara Lt. 1'),
    createStaffUser(11, 'Muhammad Alfath Wijayanto', '199509052015021001', 'Posko Graha Segara Lt. 1'),
    createStaffUser(12, 'Nopia Setia Putra', '199211022013101001', 'Posko Graha Segara Lt. 1'),
    createStaffUser(13, 'Putra Aji Nugroho', '198912232010011002', 'Posko Graha Segara Lt. 1'),
    createStaffUser(14, 'Raden Muhammad Raka A P', '199511132015021002', 'Posko Graha Segara Lt. 1'),
    createStaffUser(15, 'Rian Ajiwijaya', '199209062012101002', 'Posko Graha Segara Lt. 1'),
    createStaffUser(16, 'Rian Surya Angga Permana', '199602182015121003', 'Posko Graha Segara Lt. 1'),
    createStaffUser(17, 'Ridho Moch. Zain', '199509182015021003', 'Posko Graha Segara Lt. 1'),
    createStaffUser(18, 'Rully Achmad Upoyo', '199512202015021001', 'Posko Graha Segara Lt. 1'),
    createStaffUser(19, 'Suryadin Sanusi', '199507022015021001', 'Posko Graha Segara Lt. 1'),
    createStaffUser(20, 'Wahyu Pahlawan', '199307142013101001', 'Posko Graha Segara Lt. 1'),
    createStaffUser(21, 'Weby Ulul Albab', '199803142018011001', 'Posko Graha Segara Lt. 1'),
    createStaffUser(22, 'Wisnu Wahyu Wardhana', '199111272013101001', 'Posko Graha Segara Lt. 1'),
    createStaffUser(23, 'Yusri Mahendra', '199905072018121005', 'Posko Graha Segara Lt. 1'),
    createStaffUser(24, 'Ulwan Zaki', '199310282013101001', 'Posko Graha Segara Lt. 1'),
    createStaffUser(25, 'Husnan Lazuardhy', '199207072012101002', 'Posko Graha Segara Lt. 1'),
    createStaffUser(26, 'Erwin Adi Yulianto', '199507232015021006', 'Posko Graha Segara Lt. 1'),

    // Posko Graha Ground
    createStaffUser(27, 'Achmad Dzulfikar Maulidi', '199807192018011001', 'Posko Graha Ground'),
    createStaffUser(28, 'Adhitya Gabe Butar Butar', '199901012018121002', 'Posko Graha Ground'),
    createStaffUser(29, 'Arifan Anwar Pandia', '199601092015121002', 'Posko Graha Ground'),
    createStaffUser(30, 'Brian Prasetya Kurniawan', '199511122015021002', 'Posko Graha Ground'),
    createStaffUser(31, 'Chairul Rizka Harahap', '199402102015021001', 'Posko Graha Ground'),
    createStaffUser(32, 'Dahlan Pamuji', '199202072013101001', 'Posko Graha Ground'),
    createStaffUser(33, 'Faisal Ahmad Ilhami', '199604242015021001', 'Posko Graha Ground'),
    createStaffUser(34, 'Forester Sianipar', '199609082015121001', 'Posko Graha Ground'),
    createStaffUser(35, 'Friski Alexander Siburian', '199511042018011002', 'Posko Graha Ground'),
    createStaffUser(36, 'Hashry Rizaddin Ahmad', '199607292015021001', 'Posko Graha Ground'),
    createStaffUser(37, 'Henok Ginda Morgan Simarmata', '199703142015121001', 'Posko Graha Ground'),
    createStaffUser(38, 'Muhammad Fahmi Pratama Putra', '199703142016121001', 'Posko Graha Ground'),
    createStaffUser(39, 'Moch. Zainudin Efendi', '199001192010011001', 'Posko Graha Ground'),
    createStaffUser(40, 'Mochammad Falah Akbar', '199611152018121001', 'Posko Graha Ground'),
    createStaffUser(41, 'Muhammad Arsyvivaldi', '200006202019121002', 'Posko Graha Ground'),
    createStaffUser(42, 'Muhammad Dzulham Fadhil', '199604082015121002', 'Posko Graha Ground'),
    createStaffUser(43, 'Muhammad Fahrul Al Qadri', '199702102016121002', 'Posko Graha Ground'),
    createStaffUser(44, 'Muhammad Farhan', '199809252019121001', 'Posko Graha Ground'),
    createStaffUser(45, 'Muhammad Farhan Habibi', '200006082019121001', 'Posko Graha Ground'),
    createStaffUser(46, 'Agung Muhamad Reza', '199505102015021005', 'Posko Graha Ground'),
    createStaffUser(47, 'Nara Praba Wardaya', '199405232015021003', 'Posko Graha Ground'),
    createStaffUser(48, 'Ngabdul Khakim', '199404252015021004', 'Posko Graha Ground'),
    createStaffUser(49, 'Pademak Siringo Ringo', '199105182012101002', 'Posko Graha Ground'),
    createStaffUser(50, 'Putut Nur Alfianto', '199602282015021001', 'Posko Graha Ground'),
    createStaffUser(51, 'Rifan Dwi Darmawan', '199606202018121002', 'Posko Graha Ground'),
    createStaffUser(52, 'Rizki Ferdian Syah', '198901172010011004', 'Posko Graha Ground'),
    createStaffUser(53, 'Shofwan Zuhdi, A.Md.', '199509222018011003', 'Posko Graha Ground'),
    createStaffUser(54, 'Muhammad Reza', '199510212015121001', 'Posko Graha Ground'),

    // Posko CDC
    createStaffUser(55, 'Agung Tri Wibowo', '199503252015021002', 'Posko CDC'),
    createStaffUser(56, 'Ardhi Febri Ferdyan', '199602182015121004', 'Posko CDC'),
    createStaffUser(57, 'Arpan Hidayat', '199310042015021001', 'Posko CDC'),
    createStaffUser(58, 'Bagas Fathoni Mirhan', '199709182018011002', 'Posko CDC'),
    createStaffUser(59, 'Deandro Mikail Sebriano', '199709172019121001', 'Posko CDC'),
    createStaffUser(60, 'Dwicky Sofyan Hardhini', '198902162010011002', 'Posko CDC'),
    createStaffUser(61, 'Fazlur Rahman', '199408252015021002', 'Posko CDC'),
    createStaffUser(62, 'Indra Mangapon Purba', '199401252015021001', 'Posko CDC'),
    createStaffUser(63, 'Irvan Setyo Pratama Sunarko Putro', '199810282018011001', 'Posko CDC'),
    createStaffUser(64, 'Natanael Ignasio Ronoko', '199512132015021001', 'Posko CDC'),
    createStaffUser(65, 'Panji Erindra Hanggoro Raras', '199508112015021003', 'Posko CDC'),
    createStaffUser(66, 'Puspita Adhi Nugraha', '199111062012101001', 'Posko CDC'),
    createStaffUser(67, 'R. Kautsar Firdausi', '199112112012101001', 'Posko CDC'),
    createStaffUser(68, 'Rizky Eka Pradana', '199410022015021002', 'Posko CDC'),
    createStaffUser(69, 'Robby Maulana', '199109212010121002', 'Posko CDC'),
    createStaffUser(70, 'Wage Brantiawan Vaksiandra', '199309272015021002', 'Posko CDC'),
    createStaffUser(71, 'Barnabas Sipayung', '199004032010011003', 'Posko CDC'),
    createStaffUser(72, 'Wisnu Albar Dwiwibowo', '199506102015021001', 'Posko CDC'),
    createStaffUser(73, 'Edika Natanael Christofer Singarimbun', '199212112013101002', 'Posko CDC'),
    createStaffUser(74, 'Abu Hanifa Al Ubaydah', '199606132015121002', 'Posko CDC'),

    // Posko NPCT
    createStaffUser(75, 'A. Basofi', '199504142015021001', 'Posko NPCT'),
    createStaffUser(76, 'Anhar Prasetya', '199304262013101001', 'Posko NPCT'),
    createStaffUser(77, 'Aris Aditya', '199211102013101002', 'Posko NPCT'),
    createStaffUser(78, 'Christy Agustian Situmorang', '199208082013101001', 'Posko NPCT'),
    createStaffUser(79, 'Dody Krisna Rianto', '199605312015121002', 'Posko NPCT'),
    createStaffUser(80, 'Dwi Artha Oky Setyawan', '199510212015021001', 'Posko NPCT'),
    createStaffUser(81, 'Edi Saputro', '199301102013101004', 'Posko NPCT'),
    createStaffUser(82, 'Muhammad Fakhri Ramadhandy', '199901152018011002', 'Posko NPCT'),
    createStaffUser(83, 'Faisal Bustanul Arifin', '199604262018011004', 'Posko NPCT'),
    createStaffUser(84, 'Hedi Maulana', '199309022013101002', 'Posko NPCT'),
    createStaffUser(85, 'Irwan Ardiansyah', '199405242015021003', 'Posko NPCT'),
    createStaffUser(86, 'Muchamad Dwi Susilo', '199202242013101003', 'Posko NPCT'),
    createStaffUser(87, 'Muhamad Umar Sena', '199801062018011001', 'Posko NPCT'),
    createStaffUser(88, 'Muhammad Alif Amidhan G W', '199506032015021001', 'Posko NPCT'),
    createStaffUser(89, 'Radheva Hafizh Kurniawan', '199901252018011001', 'Posko NPCT'),
    createStaffUser(90, 'Syaefullah Nur Ahmad P', '199308072013101001', 'Posko NPCT'),
    createStaffUser(91, 'Teuku Muhammad Ridha', '199111282012101001', 'Posko NPCT'),
    createStaffUser(92, 'Yehezkiel Christian Prasetyo', '199809022018011001', 'Posko NPCT'),
    createStaffUser(93, 'Darma Setiawan', '199101142012101002', 'Posko NPCT'),
    createStaffUser(94, 'Andhika Kusuma Putra Utama', '199907132018011001', 'Posko NPCT'),
    createStaffUser(95, 'Muhammad Rafii Hidayat', '199605242018011004', 'Posko NPCT'),
    createStaffUser(96, 'Iqbal Imaduddin', '199304242013101004', 'Posko NPCT'),

    // Posko Koja
    createStaffUser(97, 'Adi Suhardi', '198912312012101001', 'Posko Koja'),
    createStaffUser(98, 'Azi Iqdam Firdaus', '199007212010011001', 'Posko Koja'),
    createStaffUser(99, 'Sihar Alberd', '199809182018011001', 'Posko Koja'),
    createStaffUser(100, 'Teguh Fragma Sakti', '199309302013101002', 'Posko Koja'),
    createStaffUser(101, 'Alvin Ryanda Tarigan', '199612022018011001', 'Posko Koja'),
    createStaffUser(102, 'Febri Ramadhoni Saputra', '199412162015021002', 'Posko Koja'),
    createStaffUser(103, 'Ibnu Sholeh Nurul Firdaus', '199510282015021004', 'Posko Koja'),
    createStaffUser(104, 'Pri Adiyanto', '199404242013101001', 'Posko Koja'),
    createStaffUser(105, 'Muhammad Sahal Savana', '199507182015121001', 'Posko Koja'),
    createStaffUser(106, 'Allamaski Mochammad', '199107232010121002', 'Posko Koja'),
    createStaffUser(107, 'M. Akmal', '198910272012101001', 'Posko Koja'),
    createStaffUser(108, 'Rama Saputra', '199402162015021001', 'Posko Koja'),
    createStaffUser(109, 'Santonius', '199403102013101001', 'Posko Koja'),
    createStaffUser(110, 'Andi Rizki Saputra', '199411182015021002', 'Posko Koja'),
    createStaffUser(111, 'Nurmawan Agus', '199508202015021005', 'Posko Koja'),
    createStaffUser(112, 'Anugrah Permana', '199509122015021003', 'Posko Koja'),
    createStaffUser(113, 'Mas Septa Arta Daniel Manik', '199509282015021003', 'Posko Koja'),
    createStaffUser(114, 'Fiqri Alfarisi', '199512052015021001', 'Posko Koja'),
    createStaffUser(115, 'M. Terry Dwito Pangestu', '199603212015021002', 'Posko Koja'),
    createStaffUser(116, 'Ahmad Fauzi Razna Sidakkal Harahap', '199605032015121001', 'Posko Koja'),
    createStaffUser(117, 'Nadhif An Naufal Azmi', '199903012019121001', 'Posko Koja'),
    createStaffUser(118, 'Himawan Arya Prayuga', '200003032022011002', 'Posko Koja'),
    createStaffUser(119, 'Muhammad Pantoko', '199312092015021002', 'Posko Koja'),
    createStaffUser(120, 'Yusri Muhammad', '199412312015021005', 'Posko Koja'),
];

// Daftar Sesi Pengguna Awal
export const DEFAULT_USER_SESSIONS: UserSessionRecord[] = [
    {
        id: 'sess-01',
        userNip: '199510102015121002',
        userName: 'Ahmad Fiqri',
        unitPosko: 'Posko Graha Segara Lt. 1',
        deviceName: 'PC Posko Graha Utama',
        deviceType: 'desktop',
        browser: 'Google Chrome',
        os: 'Windows 11',
        ipAddress: '192.168.10.45',
        macAddress: '74:D4:35:E2:81:4A',
        location: 'Tanjung Priok, Jakarta Utara',
        loginTime: '29 Sep 2026, 07:30 WIB',
        lastActive: 'Sedang Aktif',
        isOnline: true,
    },
    {
        id: 'sess-02',
        userNip: '199510102015121002',
        userName: 'Ahmad Fiqri',
        unitPosko: 'Posko Graha Segara Lt. 1',
        deviceName: 'Laptop Pengawas Lapangan',
        deviceType: 'laptop',
        browser: 'Microsoft Edge',
        os: 'Windows 11',
        ipAddress: '10.20.14.88',
        macAddress: '00:1B:44:11:3A:B7',
        location: 'Tanjung Priok, Jakarta Utara',
        loginTime: '25 Sep 2026, 19:15 WIB',
        lastActive: '3 jam yang lalu',
        isOnline: false,
    },
    {
        id: 'sess-03',
        userNip: '198905202012011001',
        userName: 'Budi Santoso (Supervisor Shift)',
        unitPosko: 'Posko Terminal Petikemas TPSL',
        deviceName: 'Workstation Posko TPSL',
        deviceType: 'desktop',
        browser: 'Google Chrome',
        os: 'Windows 10',
        ipAddress: '192.168.12.10',
        macAddress: 'E4:54:E8:29:9C:12',
        location: 'Koja, Jakarta Utara',
        loginTime: '29 Sep 2026, 08:00 WIB',
        lastActive: '2 jam yang lalu',
        isOnline: true,
    },
    {
        id: 'sess-04',
        userNip: '199503112019021003',
        userName: 'Rian Pratama',
        unitPosko: 'Posko Graha Utama',
        deviceName: 'Smartphone Android Lapangan',
        deviceType: 'mobile',
        browser: 'Chrome Mobile',
        os: 'Android 14',
        ipAddress: '182.253.11.45',
        macAddress: 'BC:D0:74:66:FA:89',
        location: 'Cilincing, Jakarta Utara',
        loginTime: '28 Sep 2026, 14:00 WIB',
        lastActive: 'Kemarin, 16:45 WIB',
        isOnline: false,
    },
    {
        id: 'sess-05',
        userNip: '199612042020012004',
        userName: 'Dewi Lestari',
        unitPosko: 'Posko TPSL Gate 3',
        deviceName: 'Tablet iPad Pemeriksaan',
        deviceType: 'tablet',
        browser: 'Mobile Safari',
        os: 'iOS 18',
        ipAddress: '192.168.12.55',
        macAddress: 'F0:18:98:C3:7E:01',
        location: 'Tanjung Priok, Jakarta Utara',
        loginTime: '26 Sep 2026, 09:30 WIB',
        lastActive: '3 hari yang lalu',
        isOnline: false,
    },
];

/**
 * Mengambil daftar seluruh pengguna dari localStorage (mengkombinasikan data tersimpan & staff default)
 */
export function getAdminUsers(): UserAccount[] {
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
        if (saved) {
            let parsed: UserAccount[] = JSON.parse(saved);
            
            // Clean up old "Afiqri" / "199208152015021002" if present in cached data
            parsed = parsed.filter((u) => u.nip !== '199208152015021002' && u.id !== 'usr-admin-01');

            const savedNips = new Set(parsed.map((u) => u.nip));
            const missingDefaultUsers = DEFAULT_USERS.filter((u) => !savedNips.has(u.nip));
            
            if (missingDefaultUsers.length > 0 || parsed.length !== JSON.parse(saved).length) {
                const merged = [...parsed, ...missingDefaultUsers];
                saveAdminUsers(merged);
                return merged;
            }
            return parsed;
        }
    } catch {}
    saveAdminUsers(DEFAULT_USERS);
    return DEFAULT_USERS;
}

/**
 * Menyimpan daftar pengguna ke localStorage
 */
export function saveAdminUsers(users: UserAccount[]): void {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
}

/**
 * Mengambil daftar profil otoritas
 */
export function getAuthorityProfiles(): AuthorityProfile[] {
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);
        if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_AUTHORITY_PROFILES;
}

/**
 * Menyimpan daftar profil otoritas
 */
export function saveAuthorityProfiles(profiles: AuthorityProfile[]): void {
    localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(profiles));
}

/**
 * Mengambil riwayat sesi seluruh user
 */
export function getAllUserSessions(): UserSessionRecord[] {
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_USER_SESSIONS_KEY);
        if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_USER_SESSIONS;
}

/**
 * Menyimpan riwayat sesi seluruh user
 */
export function saveAllUserSessions(sessions: UserSessionRecord[]): void {
    localStorage.setItem(LOCAL_STORAGE_USER_SESSIONS_KEY, JSON.stringify(sessions));
}

/**
 * Mengambil Role Pengguna Aktif Saat Ini ('admin' | 'end-user')
 */
export function getCurrentUserRole(): UserRole {
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_CURRENT_ROLE_KEY);
        if (saved === 'admin' || saved === 'end-user') {
            return saved;
        }
        // Cek apakah NIP yang aktif terdaftar sebagai role admin di list users
        const currentNip = localStorage.getItem(LOCAL_STORAGE_CURRENT_NIP_KEY);
        const users = getAdminUsers();
        const found = users.find((u) => u.nip === currentNip);
        if (found) {
            return found.role;
        }
    } catch {}
    return 'admin'; // Default sebagai Admin untuk kemudahan demonstrasi
}

export const LOCAL_STORAGE_APPROVALS_KEY = 'jadwalpriok_admin_approval_requests';

// Daftar Pengajuan Bawaan
export const DEFAULT_APPROVAL_REQUESTS: import('../types/admin').UserApprovalRequest[] = [
    {
        id: 'req-01',
        userNip: '199708222021021005',
        userName: 'Fajar Nugraha',
        unitPosko: 'Posko Pelayanan Graha Lantai 2',
        requestType: 'reset_password',
        reason: 'Lupa password setelah restart perangkat',
        requestedAt: '29 Sep 2026, 09:15 WIB',
        status: 'pending',
    },
    {
        id: 'req-02',
        userNip: '199805122022031006',
        userName: 'Siti Rahmawati',
        unitPosko: 'Posko TPSL Gate 1',
        requestType: 'delete_account',
        reason: 'Pindah tugas dinas ke luar wilayah posko',
        requestedAt: '28 Sep 2026, 14:20 WIB',
        status: 'pending',
    },
];

/**
 * Mengambil daftar pengajuan persetujuan (hapus akun & reset password)
 */
export function getApprovalRequests(): import('../types/admin').UserApprovalRequest[] {
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_APPROVALS_KEY);
        if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_APPROVAL_REQUESTS;
}

/**
 * Menyimpan daftar pengajuan persetujuan
 */
export function saveApprovalRequests(requests: import('../types/admin').UserApprovalRequest[]): void {
    localStorage.setItem(LOCAL_STORAGE_APPROVALS_KEY, JSON.stringify(requests));
}

/**
 * Menambahkan pengajuan baru (misal dari Akun pengguna)
 */
export function addApprovalRequest(req: Omit<import('../types/admin').UserApprovalRequest, 'id' | 'requestedAt' | 'status'>): void {
    const list = getApprovalRequests();
    const newReq: import('../types/admin').UserApprovalRequest = {
        ...req,
        id: `req-${Date.now()}`,
        requestedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
        status: 'pending',
    };
    saveApprovalRequests([newReq, ...list]);
}

/**
 * Mengatur Role Pengguna Aktif
 */
export function setCurrentUserRole(role: UserRole): void {
    localStorage.setItem(LOCAL_STORAGE_CURRENT_ROLE_KEY, role);
}
