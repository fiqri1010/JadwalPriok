import { UserAccount, AuthorityProfile, UserSessionRecord, UserRole } from '../types/admin';

export const LOCAL_STORAGE_USERS_KEY = 'jadwalpriok_admin_users';
export const LOCAL_STORAGE_PROFILES_KEY = 'jadwalpriok_admin_authority_profiles';
export const LOCAL_STORAGE_USER_SESSIONS_KEY = 'jadwalpriok_admin_all_sessions';
export const LOCAL_STORAGE_CURRENT_ROLE_KEY = 'jadwalpriok_current_user_role';
export const LOCAL_STORAGE_CURRENT_NIP_KEY = 'jadwalpriok_user_nip';
export const LOCAL_STORAGE_CURRENT_NAME_KEY = 'jadwalpriok_user_name';
export const LOCAL_STORAGE_CURRENT_PASS_KEY = 'jadwalpriok_user_pass';
export const LOCAL_STORAGE_SUPERADMIN_EMAIL_KEY = 'jadwalpriok_superadmin_email';

// Profil Otoritas Standar
export const DEFAULT_AUTHORITY_PROFILES: AuthorityProfile[] = [
    {
        id: 'prof-superadmin',
        name: 'Super Admin',
        description: 'Akses penuh ke dashboard admin, manajemen seluruh user, reset password, dan broadcast salin jadwal posko.',
        roleType: 'admin',
        badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
        isSystemDefault: true,
        permissions: {
            canLoginToApp: true,
            canAccessAdminDashboard: true,
            canManageUsers: true,
            canResetUserPassword: true,
            canBroadcastSchedule: true,
            canViewAllSessions: true,
            canEditOwnSchedule: true,
            canDeleteAdminAuthority: true,
            canEditAuthorities: true,
            canEditHolidays: true,
            canAccessApprovals: true,
            canEditAllShifts: true,
            canEditSomeShifts: false,
        },
    },
    {
        id: 'prof-admin-shift',
        name: 'Admin',
        description: 'Dapat mengelola user shift dan melihat log sesi perangkat seluruh petugas.',
        roleType: 'admin',
        badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
        isSystemDefault: true,
        permissions: {
            canLoginToApp: true,
            canAccessAdminDashboard: true,
            canManageUsers: true,
            canResetUserPassword: true,
            canBroadcastSchedule: true,
            canViewAllSessions: true,
            canEditOwnSchedule: true,
            canDeleteAdminAuthority: false,
            canEditAuthorities: true,
            canEditHolidays: true,
            canAccessApprovals: true,
            canEditAllShifts: true,
            canEditSomeShifts: false,
        },
    },
    {
        id: 'prof-petugas-posko',
        name: 'PPF',
        description: 'End-user posko reguler untuk mencatat jadwal mandiri, tukar shift, dan mengecek kalender piket.',
        roleType: 'end-user',
        badgeColor: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30',
        isSystemDefault: true,
        permissions: {
            canLoginToApp: true,
            canAccessAdminDashboard: false,
            canManageUsers: false,
            canResetUserPassword: false,
            canBroadcastSchedule: false,
            canViewAllSessions: false,
            canEditOwnSchedule: true,
            canDeleteAdminAuthority: false,
            canEditAuthorities: false,
            canEditHolidays: false,
            canAccessApprovals: false,
            canEditAllShifts: true,
            canEditSomeShifts: false,
        },
    },
    {
        id: 'prof-posko-luar',
        name: 'PPF non User',
        description: 'Personel posko di luar terminal (NPCT/TPS) yang jadwalnya disalin & diimpor secara terpusat untuk statistik.',
        roleType: 'end-user',
        badgeColor: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
        isSystemDefault: true,
        permissions: {
            canLoginToApp: false, // Hanya pendukung data/statistik, tidak bisa login ke aplikasi
            canAccessAdminDashboard: false,
            canManageUsers: false,
            canResetUserPassword: false,
            canBroadcastSchedule: false,
            canViewAllSessions: false,
            canEditOwnSchedule: false,
            canDeleteAdminAuthority: false,
            canEditAuthorities: false,
            canEditHolidays: false,
            canAccessApprovals: false,
            canEditAllShifts: false,
            canEditSomeShifts: false,
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
    authorityName: 'PPF',
    isActive: true,
    hasPassword: false,
    passwordValue: '',
    isExternalNonAppUser: false,
    createdAt: '10 Jan 2026',
    lastActive: 'Aktif',
});

// Daftar User Bawaan (Admin & 120 Petugas Posko) - Secara default seluruh user adalah tanpa password
export const DEFAULT_USERS: UserAccount[] = [
    {
        id: 'usr-admin-01',
        nip: '199510102015121002',
        name: 'Ahmad Fiqri',
        unitPosko: 'Graha Segara Lt. 1',
        role: 'admin',
        authorityProfileId: 'prof-superadmin',
        authorityName: 'Super Admin',
        isActive: true,
        hasPassword: false,
        passwordValue: '',
        isExternalNonAppUser: false,
        createdAt: '10 Jan 2026',
        lastActive: 'Sedang Aktif (Admin)',
    },
    // Graha Segara Lt. 1
    createStaffUser(2, 'Aldo Monang Simanjuntak', '199503212016121001', 'Graha Segara Lt. 1'),
    createStaffUser(3, 'Ardhiansyah Fuad Asrurrosyid', '199204222012101001', 'Graha Segara Lt. 1'),
    createStaffUser(4, 'Billfrit Gregerius Situmorang', '200001222018121001', 'Graha Segara Lt. 1'),
    createStaffUser(5, 'Dio Wijayanto Nugroho', '199111142013101002', 'Graha Segara Lt. 1'),
    createStaffUser(6, 'Eko David Prasetiyo', '199501052015021002', 'Graha Segara Lt. 1'),
    createStaffUser(7, 'Galih Bekti Prabowo', '199601172015021002', 'Graha Segara Lt. 1'),
    createStaffUser(8, 'Hafiizh Ha Razzaag', '199504242015021007', 'Graha Segara Lt. 1'),
    createStaffUser(9, 'Herbet Alfrin Simanjuntak', '199503232015021003', 'Graha Segara Lt. 1'),
    createStaffUser(10, 'Hilman Nuzzy Al Mustaqim', '199502172015021007', 'Graha Segara Lt. 1'),
    createStaffUser(11, 'Muhammad Alfath Wijayanto', '199509052015021001', 'Graha Segara Lt. 1'),
    createStaffUser(12, 'Nopia Setia Putra', '199211022013101001', 'Graha Segara Lt. 1'),
    createStaffUser(13, 'Putra Aji Nugroho', '198912232010011002', 'Graha Segara Lt. 1'),
    createStaffUser(14, 'Raden Muhammad Raka A P', '199511132015021002', 'Graha Segara Lt. 1'),
    createStaffUser(15, 'Rian Ajiwijaya', '199209062012101002', 'Graha Segara Lt. 1'),
    createStaffUser(16, 'Rian Surya Angga Permana', '199602182015121003', 'Graha Segara Lt. 1'),
    createStaffUser(17, 'Ridho Moch. Zain', '199509182015021003', 'Graha Segara Lt. 1'),
    createStaffUser(18, 'Rully Achmad Upoyo', '199512202015021001', 'Graha Segara Lt. 1'),
    createStaffUser(19, 'Suryadin Sanusi', '199507022015021001', 'Graha Segara Lt. 1'),
    createStaffUser(20, 'Wahyu Pahlawan', '199307142013101001', 'Graha Segara Lt. 1'),
    createStaffUser(21, 'Weby Ulul Albab', '199803142018011001', 'Graha Segara Lt. 1'),
    createStaffUser(22, 'Wisnu Wahyu Wardhana', '199111272013101001', 'Graha Segara Lt. 1'),
    createStaffUser(23, 'Yusri Mahendra', '199905072018121005', 'Graha Segara Lt. 1'),
    createStaffUser(24, 'Ulwan Zaki', '199310282013101001', 'Graha Segara Lt. 1'),
    createStaffUser(25, 'Husnan Lazuardhy', '199207072012101002', 'Graha Segara Lt. 1'),
    createStaffUser(26, 'Erwin Adi Yulianto', '199507232015021006', 'Graha Segara Lt. 1'),

    // Graha Ground
    createStaffUser(27, 'Achmad Dzulfikar Maulidi', '199807192018011001', 'Graha Ground'),
    createStaffUser(28, 'Adhitya Gabe Butar Butar', '199901012018121002', 'Graha Ground'),
    createStaffUser(29, 'Arifan Anwar Pandia', '199601092015121002', 'Graha Ground'),
    createStaffUser(30, 'Brian Prasetya Kurniawan', '199511122015021002', 'Graha Ground'),
    createStaffUser(31, 'Chairul Rizka Harahap', '199402102015021001', 'Graha Ground'),
    createStaffUser(32, 'Dahlan Pamuji', '199202072013101001', 'Graha Ground'),
    createStaffUser(33, 'Faisal Ahmad Ilhami', '199604242015021001', 'Graha Ground'),
    createStaffUser(34, 'Forester Sianipar', '199609082015121001', 'Graha Ground'),
    createStaffUser(35, 'Friski Alexander Siburian', '199511042018011002', 'Graha Ground'),
    createStaffUser(36, 'Hashry Rizaddin Ahmad', '199607292015021001', 'Graha Ground'),
    createStaffUser(37, 'Henok Ginda Morgan Simarmata', '199703142015121001', 'Graha Ground'),
    createStaffUser(38, 'Muhammad Fahmi Pratama Putra', '199703142016121001', 'Graha Ground'),
    createStaffUser(39, 'Moch. Zainudin Efendi', '199001192010011001', 'Graha Ground'),
    createStaffUser(40, 'Mochammad Falah Akbar', '199611152018121001', 'Graha Ground'),
    createStaffUser(41, 'Muhammad Arsyvivaldi', '200006202019121002', 'Graha Ground'),
    createStaffUser(42, 'Muhammad Dzulham Fadhil', '199604082015121002', 'Graha Ground'),
    createStaffUser(43, 'Muhammad Fahrul Al Qadri', '199702102016121002', 'Graha Ground'),
    createStaffUser(44, 'Muhammad Farhan', '199809252019121001', 'Graha Ground'),
    createStaffUser(45, 'Muhammad Farhan Habibi', '200006082019121001', 'Graha Ground'),
    createStaffUser(46, 'Agung Muhamad Reza', '199505102015021005', 'Graha Ground'),
    createStaffUser(47, 'Nara Praba Wardaya', '199405232015021003', 'Graha Ground'),
    createStaffUser(48, 'Ngabdul Khakim', '199404252015021004', 'Graha Ground'),
    createStaffUser(49, 'Pademak Siringo Ringo', '199105182012101002', 'Graha Ground'),
    createStaffUser(50, 'Putut Nur Alfianto', '199602282015021001', 'Graha Ground'),
    createStaffUser(51, 'Rifan Dwi Darmawan', '199606202018121002', 'Graha Ground'),
    createStaffUser(52, 'Rizki Ferdian Syah', '198901172010011004', 'Graha Ground'),
    createStaffUser(53, 'Shofwan Zuhdi, A.Md.', '199509222018011003', 'Graha Ground'),
    createStaffUser(54, 'Muhammad Reza', '199510212015121001', 'Graha Ground'),

    // CDC
    createStaffUser(55, 'Agung Tri Wibowo', '199503252015021002', 'CDC'),
    createStaffUser(56, 'Ardhi Febri Ferdyan', '199602182015121004', 'CDC'),
    createStaffUser(57, 'Arpan Hidayat', '199310042015021001', 'CDC'),
    createStaffUser(58, 'Bagas Fathoni Mirhan', '199709182018011002', 'CDC'),
    createStaffUser(59, 'Deandro Mikail Sebriano', '199709172019121001', 'CDC'),
    createStaffUser(60, 'Dwicky Sofyan Hardhini', '198902162010011002', 'CDC'),
    createStaffUser(61, 'Fazlur Rahman', '199408252015021002', 'CDC'),
    createStaffUser(62, 'Indra Mangapon Purba', '199401252015021001', 'CDC'),
    createStaffUser(63, 'Irvan Setyo Pratama Sunarko Putro', '199810282018011001', 'CDC'),
    createStaffUser(64, 'Natanael Ignasio Ronoko', '199512132015021001', 'CDC'),
    createStaffUser(65, 'Panji Erindra Hanggoro Raras', '199508112015021003', 'CDC'),
    createStaffUser(66, 'Puspita Adhi Nugraha', '199111062012101001', 'CDC'),
    createStaffUser(67, 'R. Kautsar Firdausi', '199112112012101001', 'CDC'),
    createStaffUser(68, 'Rizky Eka Pradana', '199410022015021002', 'CDC'),
    createStaffUser(69, 'Robby Maulana', '199109212010121002', 'CDC'),
    createStaffUser(70, 'Wage Brantiawan Vaksiandra', '199309272015021002', 'CDC'),
    createStaffUser(71, 'Barnabas Sipayung', '199004032010011003', 'CDC'),
    createStaffUser(72, 'Wisnu Albar Dwiwibowo', '199506102015021001', 'CDC'),
    createStaffUser(73, 'Edika Natanael Christofer Singarimbun', '199212112013101002', 'CDC'),
    createStaffUser(74, 'Abu Hanifa Al Ubaydah', '199606132015121002', 'CDC'),

    // NPCT
    createStaffUser(75, 'A. Basofi', '199504142015021001', 'NPCT'),
    createStaffUser(76, 'Anhar Prasetya', '199304262013101001', 'NPCT'),
    createStaffUser(77, 'Aris Aditya', '199211102013101002', 'NPCT'),
    createStaffUser(78, 'Christy Agustian Situmorang', '199208082013101001', 'NPCT'),
    createStaffUser(79, 'Dody Krisna Rianto', '199605312015121002', 'NPCT'),
    createStaffUser(80, 'Dwi Artha Oky Setyawan', '199510212015021001', 'NPCT'),
    createStaffUser(81, 'Edi Saputro', '199301102013101004', 'NPCT'),
    createStaffUser(82, 'Muhammad Fakhri Ramadhandy', '199901152018011002', 'NPCT'),
    createStaffUser(83, 'Faisal Bustanul Arifin', '199604262018011004', 'NPCT'),
    createStaffUser(84, 'Hedi Maulana', '199309022013101002', 'NPCT'),
    createStaffUser(85, 'Irwan Ardiansyah', '199405242015021003', 'NPCT'),
    createStaffUser(86, 'Muchamad Dwi Susilo', '199202242013101003', 'NPCT'),
    createStaffUser(87, 'Muhamad Umar Sena', '199801062018011001', 'NPCT'),
    createStaffUser(88, 'Muhammad Alif Amidhan G W', '199506032015021001', 'NPCT'),
    createStaffUser(89, 'Radheva Hafizh Kurniawan', '199901252018011001', 'NPCT'),
    createStaffUser(90, 'Syaefullah Nur Ahmad P', '199308072013101001', 'NPCT'),
    createStaffUser(91, 'Teuku Muhammad Ridha', '199111282012101001', 'NPCT'),
    createStaffUser(92, 'Yehezkiel Christian Prasetyo', '199809022018011001', 'NPCT'),
    createStaffUser(93, 'Darma Setiawan', '199101142012101002', 'NPCT'),
    createStaffUser(94, 'Andhika Kusuma Putra Utama', '199907132018011001', 'NPCT'),
    createStaffUser(95, 'Muhammad Rafii Hidayat', '199605242018011004', 'NPCT'),
    createStaffUser(96, 'Iqbal Imaduddin', '199304242013101004', 'NPCT'),

    // Koja
    createStaffUser(97, 'Adi Suhardi', '198912312012101001', 'Koja'),
    createStaffUser(98, 'Azi Iqdam Firdaus', '199007212010011001', 'Koja'),
    createStaffUser(99, 'Sihar Alberd', '199809182018011001', 'Koja'),
    createStaffUser(100, 'Teguh Fragma Sakti', '199309302013101002', 'Koja'),
    createStaffUser(101, 'Alvin Ryanda Tarigan', '199612022018011001', 'Koja'),
    createStaffUser(102, 'Febri Ramadhoni Saputra', '199412162015021002', 'Koja'),
    createStaffUser(103, 'Ibnu Sholeh Nurul Firdaus', '199510282015021004', 'Koja'),
    createStaffUser(104, 'Pri Adiyanto', '199404242013101001', 'Koja'),
    createStaffUser(105, 'Muhammad Sahal Savana', '199507182015121001', 'Koja'),
    createStaffUser(106, 'Allamaski Mochammad', '199107232010121002', 'Koja'),
    createStaffUser(107, 'M. Akmal', '198910272012101001', 'Koja'),
    createStaffUser(108, 'Rama Saputra', '199402162015021001', 'Koja'),
    createStaffUser(109, 'Santonius', '199403102013101001', 'Koja'),
    createStaffUser(110, 'Andi Rizki Saputra', '199411182015021002', 'Koja'),
    createStaffUser(111, 'Nurmawan Agus', '199508202015021005', 'Koja'),
    createStaffUser(112, 'Anugrah Permana', '199509122015021003', 'Koja'),
    createStaffUser(113, 'Mas Septa Arta Daniel Manik', '199509282015021003', 'Koja'),
    createStaffUser(114, 'Fiqri Alfarisi', '199512052015021001', 'Koja'),
    createStaffUser(115, 'M. Terry Dwito Pangestu', '199603212015021002', 'Koja'),
    createStaffUser(116, 'Ahmad Fauzi Razna Sidakkal Harahap', '199605032015121001', 'Koja'),
    createStaffUser(117, 'Nadhif An Naufal Azmi', '199903012019121001', 'Koja'),
    createStaffUser(118, 'Himawan Arya Prayuga', '200003032022011002', 'Koja'),
    createStaffUser(119, 'Muhammad Pantoko', '199312092015021002', 'Koja'),
    createStaffUser(120, 'Yusri Muhammad', '199412312015021005', 'Koja'),
];

// Daftar Sesi Pengguna Awal (Menggunakan NIP dan Nama resmi yang terdaftar di sistem posko)
export const DEFAULT_USER_SESSIONS: UserSessionRecord[] = [
    {
        id: 'sess-01',
        userNip: '199510102015121002',
        userName: 'Ahmad Fiqri',
        unitPosko: 'Graha Segara Lt. 1',
        deviceName: 'PC Graha Utama',
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
        userNip: '199503212016121001',
        userName: 'Aldo Monang Simanjuntak',
        unitPosko: 'Graha Segara Lt. 1',
        deviceName: 'Laptop Graha Segara Lt. 1',
        deviceType: 'laptop',
        browser: 'Google Chrome',
        os: 'Windows 11',
        ipAddress: '192.168.10.48',
        macAddress: '00:1B:44:11:3A:B7',
        location: 'Tanjung Priok, Jakarta Utara',
        loginTime: '29 Sep 2026, 08:00 WIB',
        lastActive: '2 jam yang lalu',
        isOnline: true,
    },
    {
        id: 'sess-03',
        userNip: '199807192018011001',
        userName: 'Achmad Dzulfikar Maulidi',
        unitPosko: 'Graha Ground',
        deviceName: 'Workstation Graha Ground',
        deviceType: 'desktop',
        browser: 'Google Chrome',
        os: 'Windows 10',
        ipAddress: '192.168.10.72',
        macAddress: 'E4:54:E8:29:9C:12',
        location: 'Tanjung Priok, Jakarta Utara',
        loginTime: '29 Sep 2026, 08:15 WIB',
        lastActive: '1 jam yang lalu',
        isOnline: true,
    },
    {
        id: 'sess-04',
        userNip: '199503252015021002',
        userName: 'Agung Tri Wibowo',
        unitPosko: 'CDC',
        deviceName: 'Smartphone Android Lapangan CDC',
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
        userNip: '199504142015021001',
        userName: 'A. Basofi',
        unitPosko: 'NPCT',
        deviceName: 'Tablet iPad Pemeriksaan NPCT',
        deviceType: 'tablet',
        browser: 'Mobile Safari',
        os: 'iOS 18',
        ipAddress: '192.168.12.55',
        macAddress: 'F0:18:98:C3:7E:01',
        location: 'NPCT 1 Tanjung Priok',
        loginTime: '26 Sep 2026, 09:30 WIB',
        lastActive: '3 hari yang lalu',
        isOnline: false,
    },
    {
        id: 'sess-06',
        userNip: '198912312012101001',
        userName: 'Adi Suhardi',
        unitPosko: 'Koja',
        deviceName: 'PC Terminal Koja',
        deviceType: 'desktop',
        browser: 'Microsoft Edge',
        os: 'Windows 11',
        ipAddress: '192.168.15.22',
        macAddress: '28:D0:EA:44:B1:99',
        location: 'Koja, Jakarta Utara',
        loginTime: '29 Sep 2026, 07:45 WIB',
        lastActive: 'Sedang Aktif',
        isOnline: true,
    },
];

/**
 * Mengambil daftar seluruh pengguna dari localStorage (mengkombinasikan data tersimpan & staff default)
 * Dilengkapi proteksi mandiri (self-healing) untuk memastikan kelima posko resmi
 * (Graha Segara Lt. 1, Graha Ground, CDC, NPCT, Koja) tidak pernah kosong.
 */
export function getAdminUsers(): UserAccount[] {
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
        const defaultByNip = new Map(DEFAULT_USERS.map((u) => [u.nip, u]));
        const defaultById = new Map(DEFAULT_USERS.map((u) => [u.id, u]));
        const defaultByName = new Map(DEFAULT_USERS.map((u) => [u.name.toLowerCase().trim(), u]));

        const findDefault = (u: UserAccount) => {
            return defaultByNip.get(u.nip) || (u.id ? defaultById.get(u.id) : undefined) || (u.name ? defaultByName.get(u.name.toLowerCase().trim()) : undefined);
        };

        if (saved) {
            let parsed: UserAccount[] = JSON.parse(saved);
            
            // Clean up old "Afiqri" / "199208152015021002" if present in cached data
            parsed = parsed.filter((u) => u.nip !== '199208152015021002' && u.id !== 'usr-admin-01');

            // Hapus data dummy posko di luar 5 posko resmi (JICT, TPSL, Posko Luar dummy) dan kembalikan ke tepat 120 pegawai resmi
            parsed = parsed.filter((u) => {
                if (u.unitPosko === 'JICT' || u.unitPosko === 'TPSL' || u.unitPosko === 'Posko Luar (PPF non User)') return false;
                const matchStaffId = u.id?.match(/^usr-staff-(\d+)$/);
                if (matchStaffId && parseInt(matchStaffId[1], 10) > 120) return false;
                return true;
            });

            // Sinkronkan authorityName ke nama resmi default aplikasi dan pastikan user default tanpa password jika belum diatur manual
            parsed = parsed.map((u) => {
                let updatedUser = { ...u };
                const defaultUser = findDefault(u);

                // Hapus password dummy template bawaan lama jika ada
                if (updatedUser.passwordValue === 'posko2026' || (updatedUser.passwordValue === 'admin123' && updatedUser.nip === '199510102015121002' && !localStorage.getItem('jadwalpriok_user_pass'))) {
                    updatedUser.hasPassword = false;
                    updatedUser.passwordValue = '';
                }

                // Untuk seluruh 120 staf resmi, selalu sinkronkan unit posko dan nama ke posko master resminya
                if (defaultUser) {
                    updatedUser.id = defaultUser.id;
                    updatedUser.unitPosko = defaultUser.unitPosko;
                    updatedUser.name = defaultUser.name;
                    // Hanya NIP Ahmad Fiqri yang mutlak dikunci sebagai Super Admin
                    if (defaultUser.nip === '199510102015121002' || updatedUser.nip === '199510102015121002') {
                        updatedUser.role = 'admin';
                        updatedUser.authorityProfileId = 'prof-superadmin';
                        updatedUser.authorityName = 'Super Admin';
                    }
                }

                // Pertahankan role dan profil otoritas yang telah diatur oleh admin (jangan di-override ke default)
                if (updatedUser.role === 'admin') {
                    if (updatedUser.nip === '199510102015121002' || updatedUser.authorityProfileId === 'prof-superadmin') {
                        updatedUser.authorityProfileId = 'prof-superadmin';
                        updatedUser.authorityName = 'Super Admin';
                    } else {
                        updatedUser.authorityProfileId = updatedUser.authorityProfileId || 'prof-admin-shift';
                        updatedUser.authorityName = updatedUser.authorityName || 'Admin';
                    }
                } else if (
                    updatedUser.authorityProfileId === 'prof-posko-luar' ||
                    updatedUser.authorityName === 'PPF non User' ||
                    updatedUser.authorityName === 'Petugas Posko Luar / Non-Pengguna' ||
                    updatedUser.authorityName === 'Petugas Posko Luar / Non Pengguna' ||
                    updatedUser.role === 'non-user'
                ) {
                    updatedUser.role = 'non-user';
                    updatedUser.authorityProfileId = 'prof-posko-luar';
                    updatedUser.authorityName = 'PPF non User';
                } else {
                    // Akun reguler end-user PPF
                    updatedUser.role = 'end-user';
                    updatedUser.authorityProfileId = updatedUser.authorityProfileId || 'prof-petugas-posko';
                    updatedUser.authorityName = updatedUser.authorityName || 'PPF';
                }

                // Hapus kata Posko dari nama posko dan sinkronkan nama unit
                if (updatedUser.unitPosko) {
                    updatedUser.unitPosko = updatedUser.unitPosko.replace(/^Posko\s+/i, '').trim();
                }

                return updatedUser;
            });

            // Periksa apakah seluruh 5 posko resmi memiliki personel
            const OFFICIAL_POSKOS = ['Graha Segara Lt. 1', 'Graha Ground', 'CDC', 'NPCT', 'Koja'];
            const poskoCounts: Record<string, number> = {};
            parsed.forEach((u) => {
                const p = u.unitPosko || 'Lainnya';
                poskoCounts[p] = (poskoCounts[p] || 0) + 1;
            });
            const hasAllPoskos = OFFICIAL_POSKOS.every((p) => (poskoCounts[p] || 0) > 0);

            // Jika cache lama tidak lengkap (hanya 26 user / posko lain 0 / kurang dari 120 user), lakukan restorasi mandiri
            // dengan tetap menjaga role, authorityProfile, dan password user yang telah dimodifikasi
            if (!hasAllPoskos || parsed.length < 120) {
                const customUserMap = new Map(parsed.map((u) => [u.nip, u]));
                const healedUsers: UserAccount[] = DEFAULT_USERS.map((def) => {
                    const existing = customUserMap.get(def.nip) || parsed.find((p) => p.id === def.id || (p.name && p.name.toLowerCase().trim() === def.name.toLowerCase().trim()));
                    if (existing) {
                        return {
                            ...def,
                            role: existing.role || def.role,
                            authorityProfileId: existing.authorityProfileId || def.authorityProfileId,
                            authorityName: existing.authorityName || def.authorityName,
                            assignedSquad: existing.assignedSquad || def.assignedSquad,
                            isExternalNonAppUser: existing.isExternalNonAppUser !== undefined ? existing.isExternalNonAppUser : def.isExternalNonAppUser,
                            hasPassword: existing.hasPassword || false,
                            passwordValue: existing.passwordValue || '',
                            isActive: existing.isActive !== undefined ? existing.isActive : def.isActive,
                            lastActive: existing.lastActive || def.lastActive,
                        };
                    }
                    return def;
                });

                // Pertahankan user custom baru yang ditambahkan manual oleh admin
                const defaultNipSet = new Set(DEFAULT_USERS.map((u) => u.nip));
                const extraCustomUsers = parsed.filter((u) => !defaultNipSet.has(u.nip) && u.id?.startsWith('usr-custom-'));
                const finalResult = [...healedUsers, ...extraCustomUsers];
                saveAdminUsers(finalResult);
                return finalResult;
            }

            const savedNips = new Set(parsed.map((u) => u.nip));
            const missingDefaultUsers = DEFAULT_USERS.filter((u) => !savedNips.has(u.nip));
            
            if (missingDefaultUsers.length > 0 || parsed.length !== JSON.parse(saved).length) {
                const merged = [...parsed, ...missingDefaultUsers];
                saveAdminUsers(merged);
                return merged;
            }
            saveAdminUsers(parsed);
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
 * Menjamin profil standar sistem selalu mengikuti nama default resmi aplikasi (Super Admin, Admin, PPF, PPF non User)
 */
export function getAuthorityProfiles(): AuthorityProfile[] {
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);
        if (saved) {
            const parsed: AuthorityProfile[] = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Lengkapi jika ada field permission yang undefined dari versi lama
                const normalized = parsed.map((p) => {
                    const defaultMatch = DEFAULT_AUTHORITY_PROFILES.find((d) => d.id === p.id);
                    return {
                        ...p,
                        name: p.name || defaultMatch?.name || 'Role',
                        description: p.description !== undefined ? p.description : (defaultMatch?.description || ''),
                        roleType: p.roleType || defaultMatch?.roleType || 'end-user',
                        badgeColor: p.badgeColor || (defaultMatch?.badgeColor || 'bg-teal-500/15 text-teal-600 border-teal-500/30'),
                        permissions: {
                            canLoginToApp: true,
                            canAccessAdminDashboard: false,
                            canManageUsers: false,
                            canResetUserPassword: false,
                            canBroadcastSchedule: false,
                            canViewAllSessions: false,
                            canEditOwnSchedule: true,
                            canDeleteAdminAuthority: false,
                            canEditAuthorities: false,
                            ...(defaultMatch ? defaultMatch.permissions : {}),
                            ...p.permissions,
                        },
                    };
                });

                // Tambahkan jika ada profil default yang belum ada sama sekali
                const existingIds = new Set(normalized.map((p) => p.id));
                const missing = DEFAULT_AUTHORITY_PROFILES.filter((d) => !existingIds.has(d.id));
                const fullList = [...normalized, ...missing];
                return fullList;
            }
        }
    } catch {}
    saveAuthorityProfiles(DEFAULT_AUTHORITY_PROFILES);
    return DEFAULT_AUTHORITY_PROFILES;
}

/**
 * Menyimpan daftar profil otoritas
 */
export function saveAuthorityProfiles(profiles: AuthorityProfile[]): void {
    localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(profiles));
}

/**
 * Mengambil riwayat sesi seluruh user yang tersinkronisasi penuh dengan sesi perangkat riil di Pengaturan
 */
export function getAllUserSessions(): UserSessionRecord[] {
    let list: UserSessionRecord[] = DEFAULT_USER_SESSIONS;
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_USER_SESSIONS_KEY);
        if (saved) {
            const parsed: UserSessionRecord[] = JSON.parse(saved);
            // Bersihkan NIP lama atau dummy yang tidak terdaftar di daftar pengguna
            const validUsers = getAdminUsers();
            const validNips = new Set(validUsers.map((u) => u.nip));
            const cleaned = parsed.filter((s) => validNips.has(s.userNip));

            // Pastikan sesi default minimal selalu ada
            const existingNips = new Set(cleaned.map((s) => s.userNip));
            const missingDefaults = DEFAULT_USER_SESSIONS.filter((d) => !existingNips.has(d.userNip) && validNips.has(d.userNip));
            list = [...cleaned, ...missingDefaults];
        }
    } catch {}

    // Sinkronkan sesi perangkat riil milik pengguna yang sedang aktif (misalnya Ahmad Fiqri atau user login)
    try {
        const currentNip = localStorage.getItem(LOCAL_STORAGE_CURRENT_NIP_KEY) || '199510102015121002';
        const currentName = localStorage.getItem(LOCAL_STORAGE_CURRENT_NAME_KEY) || 'Ahmad Fiqri';
        const deviceSessionsRaw = localStorage.getItem('jadwalpriok_device_sessions');

        if (deviceSessionsRaw) {
            const parsedDeviceSessions = JSON.parse(deviceSessionsRaw);
            if (Array.isArray(parsedDeviceSessions) && parsedDeviceSessions.length > 0) {
                const currentSession = parsedDeviceSessions.find((s: any) => s.isCurrent) || parsedDeviceSessions[0];
                if (currentSession) {
                    const users = getAdminUsers();
                    const matchedUser = users.find((u) => u.nip === currentNip);
                    const unitPosko = (matchedUser?.unitPosko || 'Graha Segara Lt. 1').replace(/^Posko\s+/i, '').trim();

                    const syncedRecord: UserSessionRecord = {
                        id: `sess-real-${currentNip}`,
                        userNip: currentNip,
                        userName: currentName,
                        unitPosko,
                        deviceName: currentSession.deviceName || 'Perangkat Pengguna',
                        deviceType: (currentSession.deviceType as any) || 'desktop',
                        browser: currentSession.browser || 'Google Chrome',
                        os: currentSession.os || 'Windows 11',
                        ipAddress: currentSession.ipAddress || '192.168.10.45',
                        macAddress: currentSession.macAddress || '74:D4:35:E2:81:4A',
                        location: currentSession.location || 'Tanjung Priok, Jakarta Utara',
                        loginTime: currentSession.firstLogin || 'Hari Ini, 07:30 WIB',
                        lastActive: currentSession.lastActive || 'Sedang Aktif',
                        isOnline: true,
                    };

                    const others = list.filter((s) => s.userNip !== currentNip);
                    const merged = [syncedRecord, ...others];
                    localStorage.setItem(LOCAL_STORAGE_USER_SESSIONS_KEY, JSON.stringify(merged));
                    return merged;
                }
            }
        }
    } catch (e) {
        console.error('Error synchronizing user session with settings:', e);
    }

    return list;
}

/**
 * Sinkronisasi eksplisit dari Pengaturan Akun ke Sesi Admin
 */
export function syncDeviceSessionToAdminSessions(currentNip: string, currentName: string, deviceSession: any): void {
    try {
        let list: UserSessionRecord[] = DEFAULT_USER_SESSIONS;
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_USER_SESSIONS_KEY);
            if (saved) list = JSON.parse(saved);
        } catch {}

        const users = getAdminUsers();
        const matchedUser = users.find((u) => u.nip === currentNip);
        const unitPosko = (matchedUser?.unitPosko || 'Graha Segara Lt. 1').replace(/^Posko\s+/i, '').trim();

        const syncedRecord: UserSessionRecord = {
            id: `sess-real-${currentNip}`,
            userNip: currentNip,
            userName: currentName,
            unitPosko,
            deviceName: deviceSession.deviceName || 'Perangkat Pengguna',
            deviceType: deviceSession.deviceType || 'desktop',
            browser: deviceSession.browser || 'Google Chrome',
            os: deviceSession.os || 'Windows 11',
            ipAddress: deviceSession.ipAddress || '192.168.10.45',
            macAddress: deviceSession.macAddress || '74:D4:35:E2:81:4A',
            location: deviceSession.location || 'Tanjung Priok, Jakarta Utara',
            loginTime: deviceSession.firstLogin || 'Hari Ini, 07:30 WIB',
            lastActive: deviceSession.lastActive || 'Sedang Aktif',
            isOnline: true,
        };

        const others = list.filter((s) => s.userNip !== currentNip);
        const merged = [syncedRecord, ...others];
        localStorage.setItem(LOCAL_STORAGE_USER_SESSIONS_KEY, JSON.stringify(merged));
    } catch {}
}

/**
 * Menyimpan riwayat sesi seluruh user
 */
export function saveAllUserSessions(sessions: UserSessionRecord[]): void {
    localStorage.setItem(LOCAL_STORAGE_USER_SESSIONS_KEY, JSON.stringify(sessions));
}

/**
 * Mengambil Role Pengguna Aktif Saat Ini ('superadmin' | 'admin' | 'end-user' | 'non-user')
 */
export function getCurrentUserRole(): UserRole {
    try {
        const currentName = typeof window !== 'undefined' ? (localStorage.getItem(LOCAL_STORAGE_CURRENT_NAME_KEY) || 'Ahmad Fiqri') : 'Ahmad Fiqri';
        const currentNip = typeof window !== 'undefined' ? (localStorage.getItem(LOCAL_STORAGE_CURRENT_NIP_KEY) || '199510102015121002') : '199510102015121002';

        // Akun utama Ahmad Fiqri secara mutlak adalah Super Admin di aplikasi
        if (currentName === 'Ahmad Fiqri' || currentNip === '199510102015121002') {
            return 'superadmin';
        }

        // Cek langsung dari database pengguna terkini berdasarkan NIP aktif
        const users = getAdminUsers();
        const found = users.find((u) => u.nip === currentNip);
        if (found) {
            if (found.authorityProfileId === 'prof-superadmin' || found.nip === '199510102015121002') {
                return 'superadmin';
            }
            if (typeof window !== 'undefined') {
                localStorage.setItem(LOCAL_STORAGE_CURRENT_ROLE_KEY, found.role);
            }
            return found.role;
        }

        const saved = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_CURRENT_ROLE_KEY) : null;
        if (saved === 'superadmin' || saved === 'admin' || saved === 'end-user' || saved === 'non-user') {
            return saved as UserRole;
        }
    } catch {}
    return 'end-user';
}

export function getCurrentUserRoleInfo(): { role: UserRole; authorityName: string; badgeColor: string } {
    const currentName = typeof window !== 'undefined' ? (localStorage.getItem(LOCAL_STORAGE_CURRENT_NAME_KEY) || 'Ahmad Fiqri') : 'Ahmad Fiqri';
    const currentNip = typeof window !== 'undefined' ? (localStorage.getItem(LOCAL_STORAGE_CURRENT_NIP_KEY) || '199510102015121002') : '199510102015121002';

    if (currentName === 'Ahmad Fiqri' || currentNip === '199510102015121002') {
        return {
            role: 'superadmin',
            authorityName: 'Super Admin',
            badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
        };
    }

    const users = getAdminUsers();
    const foundUser = users.find((u) => u.nip === currentNip);
    const profiles = getAuthorityProfiles();

    if (foundUser) {
        const prof = profiles.find((p) => p.id === foundUser.authorityProfileId) || profiles.find((p) => p.roleType === foundUser.role);
        if (prof) {
            return {
                role: (prof.roleType || foundUser.role) as UserRole,
                authorityName: prof.name || foundUser.authorityName,
                badgeColor: prof.badgeColor || (foundUser.role === 'admin' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' : 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30'),
            };
        }
        return {
            role: foundUser.role,
            authorityName: foundUser.authorityName || (foundUser.role === 'admin' ? 'Admin' : 'PPF'),
            badgeColor: foundUser.role === 'admin' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' : 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30',
        };
    }

    const role = getCurrentUserRole();
    if (role === 'superadmin') {
        const prof = profiles.find((p) => p.roleType === 'superadmin' || p.id === 'prof-superadmin');
        return {
            role: 'superadmin',
            authorityName: prof?.name || 'Super Admin',
            badgeColor: prof?.badgeColor || 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
        };
    }
    if (role === 'admin') {
        const prof = profiles.find((p) => p.roleType === 'admin');
        return {
            role: 'admin',
            authorityName: prof?.name || 'Admin',
            badgeColor: prof?.badgeColor || 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
        };
    }
    if (role === 'non-user') {
        const prof = profiles.find((p) => p.name.toLowerCase().includes('non user'));
        return {
            role: 'non-user',
            authorityName: prof?.name || 'PPF non User',
            badgeColor: prof?.badgeColor || 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
        };
    }
    const prof = profiles.find((p) => p.roleType === 'end-user');
    return {
        role: 'end-user',
        authorityName: prof?.name || 'PPF',
        badgeColor: prof?.badgeColor || 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30',
    };
}

export const LOCAL_STORAGE_APPROVALS_KEY = 'jadwalpriok_admin_approval_requests';

// Daftar Pengajuan Bawaan
export const DEFAULT_APPROVAL_REQUESTS: import('../types/admin').UserApprovalRequest[] = [
    {
        id: 'req-01',
        userNip: '199708222021021005',
        userName: 'Fajar Nugraha',
        unitPosko: 'Pelayanan Graha Lantai 2',
        requestType: 'reset_password',
        reason: 'Lupa password setelah restart perangkat',
        requestedAt: '29 Sep 2026, 09:15 WIB',
        status: 'pending',
    },
    {
        id: 'req-02',
        userNip: '199805122022031006',
        userName: 'Siti Rahmawati',
        unitPosko: 'TPSL Gate 1',
        requestType: 'delete_account',
        reason: 'Pindah tugas dinas ke luar wilayah posko',
        requestedAt: '28 Sep 2026, 14:20 WIB',
        status: 'pending',
    },
    {
        id: 'req-03',
        userNip: '199905072018121005',
        userName: 'Yusri Mahendra',
        unitPosko: 'Graha Segara Lt. 1',
        requestType: 'change_role_ppf',
        reason: 'Pengajuan perubahan role dari PPF non User ke Role User PPF untuk akses aplikasi mandiri',
        requestedAt: '30 Sep 2026, 10:20 WIB',
        status: 'pending',
    },
];

/**
 * Mengambil daftar pengajuan persetujuan (hapus akun, reset password, & pengajuan role user)
 */
export function getApprovalRequests(): import('../types/admin').UserApprovalRequest[] {
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_APPROVALS_KEY);
        if (saved) {
            const parsed: import('../types/admin').UserApprovalRequest[] = JSON.parse(saved);
            // Pastikan minimal ada 1 sampel pengajuan change_role_ppf untuk percobaan jika belum ada
            if (!parsed.some((r) => r.requestType === 'change_role_ppf')) {
                const sampleReq: import('../types/admin').UserApprovalRequest = {
                    id: 'req-03-trial',
                    userNip: '199905072018121005',
                    userName: 'Yusri Mahendra',
                    unitPosko: 'Graha Segara Lt. 1',
                    requestType: 'change_role_ppf',
                    reason: 'Pengajuan percobaan perubahan role dari PPF non User ke Role User PPF',
                    requestedAt: '30 Sep 2026, 10:20 WIB',
                    status: 'pending',
                };
                const updated = [sampleReq, ...parsed];
                localStorage.setItem(LOCAL_STORAGE_APPROVALS_KEY, JSON.stringify(updated));
                return updated;
            }
            return parsed;
        }
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

/**
 * Menghapus seluruh data terkait pengguna secara menyeluruh dari aplikasi:
 * 1. Akun pengguna dari database admin (LOCAL_STORAGE_USERS_KEY)
 * 2. Log sesi & perangkat aktif pengguna (LOCAL_STORAGE_USER_SESSIONS_KEY & LOCAL_STORAGE_SESSIONS_KEY)
 * 3. Pembersihan sesi lokal jika pengguna tersebut sedang login di browser ini
 * 4. Pembersihan data kalender kustom/catatan pribadi jika ada
 */
export function purgeUserDataCompletely(userNip: string): void {
    if (!userNip) return;

    // 1. Bersihkan dari daftar pengguna
    try {
        const users = getAdminUsers();
        const updatedUsers = users.filter((u) => u.nip !== userNip);
        saveAdminUsers(updatedUsers);
    } catch {}

    // 2. Bersihkan seluruh sesi perangkat terkait NIP ini
    try {
        const sessions = getAllUserSessions();
        const updatedSessions = sessions.filter((s) => s.userNip !== userNip);
        saveAllUserSessions(updatedSessions);
    } catch {}

    // 3. Bersihkan sesi perangkat lokal jika user yang dihapus adalah user aktif saat ini
    try {
        const currentNip = localStorage.getItem(LOCAL_STORAGE_CURRENT_NIP_KEY);
        if (currentNip === userNip) {
            localStorage.removeItem('jadwalpriok_device_sessions');
            localStorage.removeItem(LOCAL_STORAGE_CURRENT_PASS_KEY);
            // Kembalikan ke akun default admin
            localStorage.setItem(LOCAL_STORAGE_CURRENT_NIP_KEY, '199510102015121002');
            localStorage.setItem(LOCAL_STORAGE_CURRENT_NAME_KEY, 'Ahmad Fiqri');
        }
    } catch {}

    // 4. Bersihkan data preferensi/storage spesifik user jika ada
    try {
        const keysToRemove = [
            `jadwalpriok_notes_${userNip}`,
            `jadwalpriok_schedule_${userNip}`,
            `jadwalpriok_user_state_${userNip}`,
        ];
        keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}
}

export function getCurrentUserPermissions() {
    const activeNip = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_CURRENT_NIP_KEY) : null;
    
    // Superadmin override
    if (activeNip === '199510102015121002') {
        return {
            canLoginToApp: true,
            canAccessAdminDashboard: true,
            canManageUsers: true,
            canResetUserPassword: true,
            canBroadcastSchedule: true,
            canViewAllSessions: true,
            canEditOwnSchedule: true,
            canDeleteAdminAuthority: true,
            canEditAuthorities: true,
            canEditHolidays: true,
            canAccessApprovals: true,
            canEditAllShifts: true,
            canEditSomeShifts: false,
        };
    }

    const users = getAdminUsers();
    const currentUser = users.find((u) => u.nip === activeNip);
    if (!currentUser) {
        // Fallback default permissions
        return {
            canLoginToApp: true,
            canAccessAdminDashboard: false,
            canManageUsers: false,
            canResetUserPassword: false,
            canBroadcastSchedule: false,
            canViewAllSessions: false,
            canEditOwnSchedule: true,
            canDeleteAdminAuthority: false,
            canEditAuthorities: false,
            canEditHolidays: false,
            canAccessApprovals: false,
            canEditAllShifts: true,
            canEditSomeShifts: false,
        };
    }

    const profiles = getAuthorityProfiles();
    const matchedProfile = profiles.find((p) => p.id === currentUser.authorityProfileId) || profiles.find((p) => p.roleType === currentUser.role);
    if (matchedProfile) {
        return {
            canLoginToApp: matchedProfile.permissions.canLoginToApp !== false,
            canAccessAdminDashboard: Boolean(matchedProfile.permissions.canAccessAdminDashboard),
            canManageUsers: Boolean(matchedProfile.permissions.canManageUsers),
            canResetUserPassword: Boolean(matchedProfile.permissions.canResetUserPassword),
            canBroadcastSchedule: Boolean(matchedProfile.permissions.canBroadcastSchedule),
            canViewAllSessions: Boolean(matchedProfile.permissions.canViewAllSessions),
            canEditOwnSchedule: Boolean(matchedProfile.permissions.canEditOwnSchedule),
            canDeleteAdminAuthority: Boolean(matchedProfile.permissions.canDeleteAdminAuthority),
            canEditAuthorities: Boolean(matchedProfile.permissions.canEditAuthorities),
            canEditHolidays: Boolean(matchedProfile.permissions.canEditHolidays),
            canAccessApprovals: Boolean(matchedProfile.permissions.canAccessApprovals),
            canEditAllShifts: matchedProfile.permissions.canEditAllShifts !== false,
            canEditSomeShifts: Boolean(matchedProfile.permissions.canEditSomeShifts),
        };
    }

    // Default staff fallback
    return {
        canLoginToApp: true,
        canAccessAdminDashboard: false,
        canManageUsers: false,
        canResetUserPassword: false,
        canBroadcastSchedule: false,
        canViewAllSessions: false,
        canEditOwnSchedule: true,
        canDeleteAdminAuthority: false,
        canEditAuthorities: false,
        canEditHolidays: false,
        canAccessApprovals: false,
        canEditAllShifts: true,
        canEditSomeShifts: false,
    };
}

// Super Admin Email Recovery helpers
export const getSuperAdminEmail = (): string => {
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_SUPERADMIN_EMAIL_KEY);
        if (saved && saved.trim()) return saved.trim();
        const users = getAdminUsers();
        const superAdmin = users.find((u) => u.nip === '199510102015121002' || u.authorityProfileId === 'prof-superadmin');
        if (superAdmin?.email) return superAdmin.email;
    } catch {}
    return 'afiqri22@gmail.com';
};

export const saveSuperAdminEmail = (email: string) => {
    const clean = email.trim();
    try {
        localStorage.setItem(LOCAL_STORAGE_SUPERADMIN_EMAIL_KEY, clean);
        const users = getAdminUsers();
        const updated = users.map((u) => {
            if (u.nip === '199510102015121002' || u.authorityProfileId === 'prof-superadmin') {
                return { ...u, email: clean };
            }
            return u;
        });
        saveAdminUsers(updated);
    } catch {}
};

