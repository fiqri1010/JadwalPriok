import React, { useState, useMemo } from 'react';
import {
    History,
    Sparkles,
    CheckCircle2,
    Calendar,
    ChevronDown,
    ChevronUp,
    Terminal,
    ChevronsUpDown,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppTheme } from '../types';
import { APP_VERSION, BUILD_TIMESTAMP } from '../version';

export interface VersionItem {
    version: string;
    releaseDate: string;
    title: string;
    isLatest?: boolean;
    isMajor?: boolean;
    changes: string[];
    tag?: string;
}

export const VERSION_HISTORY: VersionItem[] = [
    {
        version: '0.5.8',
        releaseDate: '1 Oktober 2026',
        title: 'Integrasi Lipatan Seamless "Perubahan" pada Kartu Tanggal Desktop',
        isLatest: true,
        isMajor: false,
        tag: 'Seamless Folded Date Card, In-Card Cuti ST & Geser Off, Clean Minimalist UI',
        changes: [
            'Penghapusan Tombol Akses Cepat Eksternal: Menghapus bar tombol akses cepat di atas kalender dan di sidebar sesuai instruksi agar antarmuka kerja tetap bersih dan rapi.',
            'Ekspansi Seamless "Perubahan" pada Kartu Desktop: Pada kartu tanggal mode expanded (desktop), ditambahkan tombol "Perubahan" di bawah form jam kerja yang ketika dibuka mengekspansi bagian kartu secara menyatu (seamless) tanpa garis pembatas kasar.',
            'Input Cuti, ST, dan Geser Off Terintegrasi: Bagian folded menyediakan 3 sub-pilihan terpadu untuk pengaturan jenis Cuti (termasuk setengah hari), Surat Tugas/ST dinas (termasuk kepastian & kompensasi), dan Geser Off (tanggal asal piket & jatah hari) yang langsung tersimpan secara instan.'
        ]
    },
    {
        version: '0.5.7',
        releaseDate: '1 Oktober 2026',
        title: 'Penataan Posisi Toggle Tanpa Password & Form Authentication',
        isLatest: false,
        isMajor: false,
        tag: 'Login UX Enhancements, Landing Page Clean Architecture',
        changes: [
            'Penataan Posisi Toggle Masuk Tanpa Password: Memindahkan switch toggle ke bagian atas sebelum form password pada Landing Page. Saat diaktifkan, form password disembunyikan secara otomatis, aturan wajib password ditiadakan, muncul kotak peringatan risiko keamanan, dan disediakan tombol aksi masuk langsung ke kalender.'
        ]
    },
    {
        version: '0.5.6',
        releaseDate: '1 Oktober 2026',
        title: 'Perbaikan Skema Tema Warm pada Segmen Libur & Ringkasan Piket',
        isLatest: false,
        isMajor: false,
        tag: 'Warm Theme Complete Fidelity, Sidebar Cards Alignment',
        changes: [
            'Penyelarasan Warna Segmen Libur Nasional (`MonthlyHolidaySegment`): Mengganti warna badge tanggal dan chip kategori dari warna mawar/merah dingin menjadi skema cokelat/krem hangat khas Tema Warm (`#78350F`, `#4D2A00`).',
            'Penyelarasan Ringkasan Piket (`MonthlyPiketSummarySegment`): Menyelaraskan seluruh 4 kartu status piket (Piket-Off, Piket-no OFF, Off Ready, Off Delay) dan badge jumlah piket agar serasi dengan Tema Warm.',
            'Penyelarasan Modal Pengelola Libur (`HolidayManagerModal`): Menyelaraskan ikon Flag header dan badge kategori libur saat Tema Warm diaktifkan.'
        ]
    },
    {
        version: '0.5.5',
        releaseDate: '1 Oktober 2026',
        title: 'Penyempurnaan Kalender Mode List, Tombol Detail, dan Performa Menu Samping',
        isLatest: false,
        isMajor: false,
        tag: 'List Mode Clean UI, Detail Modal Restored, Sidebar Speed Optimization',
        changes: [
            'Filter Kalender Mode List: Memastikan opsi filter di Kalender Kerja mode list bersih dengan kategori Utama (Semua, Piket, Off, CUTI).',
            'Pembersihan Keterangan Teks Samping Badge Shift: Menyembunyikan blok teks tanggal/hari di sebelah kiri badge shift sehingga tampilan baris mode list menjadi rapi dan fokus.',
            'Restorasi Tombol Detail: Memperbaiki tombol Detail pada mode list & desktop agar selalu membuka modal dialog popup detail hari secara langsung dan interaktif.',
            'Optimalisasi Performa & Respon Menu Samping: Mememoisasi pembacaan preferensi pengguna dan mengoptimalkan transisi CSS menu samping serta tombol Dasbor agar pembukaan menu berlangsung cepat tanpa glitch.'
        ]
    },
    {
        version: '0.5.4',
        releaseDate: '1 Oktober 2026',
        title: 'Penyesuaian Rentang Tampilan Jadwal Rekan (Mode 3 Hari Operasional)',
        isLatest: false,
        isMajor: false,
        tag: 'Team Schedule 3-Day Scope, Mobile UX Optimization',
        changes: [
            'Pembaruan Rentang Tampilan Ringkas: Mengubah opsi filter rentang tampilan cepat dari sebelumnya "2 Hari" menjadi "3 Hari" (Hari ini s.d. Lusa) pada matriks jadwal rekan.',
            'Optimalisasi Tampilan Mobile & Tablet: Memfasilitasi petugas posko untuk meninjau proyeksi shift 3 hari berturut-turut secara kompak dan responsif di layar ponsel tanpa scroll horizontal berlebih.',
            'Sinkronisasi Navigasi Tanggal: Menyelaraskan pemotongan tanggal dinamis (visible dates) agar selalu mencakup 3 hari aktif berturut-turut dari tanggal hari ini.'
        ]
    },
    {
        version: '0.5.3',
        releaseDate: '1 Oktober 2026',
        title: 'Pengelolaan Data Server Lokal & Pemulihan Mandiri 5 Posko Resmi (120 Staf)',
        isLatest: false,
        isMajor: false,
        tag: 'Local Server Data Store, 5 Poskos Restored, Self-Healing Cache',
        changes: [
            'Pengelolaan Data Server Backend Lokal: Menjadikan komputer lokal ini sebagai server data utama aplikasi dengan penyimpanan persisten di `/data/users.json` dan `/data/poskos.json` serta endpoint API `/api/users`, `/api/poskos`, dan `/api/schedules` agar data tidak lagi bergantung semata pada cache peramban.',
            'Pemulihan Mandiri (Self-Healing) 5 Posko Resmi: Memastikan seluruh 5 posko Pelabuhan Tanjung Priok (Graha Segara Lt. 1: 26 pegawai, Graha Ground: 28 pegawai, CDC: 20 pegawai, NPCT: 22 pegawai, dan Koja: 24 pegawai = tepat 120 personel) selalu terdistribusi lengkap dan tidak akan pernah kosong atau tertimpa.',
            'Tombol Aksi Sinkron Server di Matriks Jadwal Rekan: Menyediakan tombol status dan pembaruan instan "Server Lokal (120 Staf)" pada bilah atas Jadwal Rekan untuk sinkronisasi data master secara langsung kapan saja.',
            'Sinkronisasi Otomatis Aplikasi: Aplikasi langsung memuat data master 120 staf posko resmi dari server backend lokal saat pertama kali diinisialisasi.'
        ]
    },
    {
        version: '0.5.2',
        releaseDate: '1 Oktober 2026',
        title: 'Restorasi & Sinkronisasi 5 Posko Resmi Tanjung Priok (Tepat 120 Pegawai)',
        isLatest: false,
        isMajor: false,
        tag: 'Official 120 Personnel, 5 Real Poskos Sync, Team Matrix',
        changes: [
            'Sinkronisasi 5 Unit Posko Resmi: Menyelaraskan 120 pegawai resmi ke dalam 5 posko utama Bea Cukai Tanjung Priok (Graha Segara Lt. 1: 26 pegawai, Graha Ground: 28 pegawai, CDC: 20 pegawai, NPCT: 22 pegawai, dan Koja: 24 pegawai) agar tidak lagi terkunci ke default "Graha Segara Lt. 1".',
            'Penegakan Batas Data 120 Pegawai Resmi: Membersihkan data dan posko di luar 5 posko resmi, memastikan daftar rekan kerja murni memuat 120 personel resmi tanpa data tambahan.',
            'Filter Posko Sesuai Roster: Dropdown filter pada Matriks Jadwal Rekan kini memuat tepat 5 posko resmi Pelabuhan Tanjung Priok.'
        ]
    },
    {
        version: '0.5.1',
        releaseDate: '1 Oktober 2026',
        title: 'Penyertaan Data PPF non User pada Matriks Jadwal Rekan & Lencana Posko Luar',
        isLatest: false,
        isMajor: false,
        tag: 'PPF non User Data Inclusion, External Post Badge, Team Matrix',
        changes: [
            'Inklusi Lengkap Data PPF non User: Menampilkan seluruh data shift rekan kerja berstatus PPF non User (personel posko luar / data terpusat) ke dalam spreadsheet matriks Jadwal Rekan agar sebaran dinas seluruh personel posko tetap transparan dan dapat dipantau.',
            'Lencana Status Posko Luar: Menyematkan lencana khusus "PPF non User" bergradasi lembut pada baris nama dan kartu detail modal untuk memperjelas status kepemilikan akun pegawai bersangkutan.'
        ]
    },
    {
        version: '0.5.0',
        releaseDate: '1 Oktober 2026',
        title: 'Halaman Baru "Jadwal Rekan": Spreadsheet Matriks Shift Tim, Freeze Panes, Filter Posko, Pin Rekan Favorit, Alur Tukar Shift, & Ekspor Excel/PDF',
        isLatest: false,
        isMajor: false,
        tag: 'Team Schedule Matrix, Freeze Panes, Shift Swap, Excel & PDF Export, Mobile Responsive',
        changes: [
            'Halaman Baru "Jadwal Rekan" (Matriks Shift Tim): Menghadirkan halaman baru berformat spreadsheet matriks (Gantt/Grid Calendar) di bawah menu Kalender Kerja pada sidebar dan navigasi mobile untuk memantau sebaran dinas seluruh rekan posko.',
            'Struktur Grid Spreadsheet (Sumbu X & Y): Sumbu Y menyajikan daftar nama pegawai lengkap dengan NIP dan unit posko; Sumbu X memuat tanggal 1 sampai akhir bulan berjalan beserta inisial hari (Sen, Sel, Rab, Kam, Jum, Sab, Min).',
            'Ergonomi Spreadsheet Freeze Panes: Mengunci kolom nama pegawai (sticky left) dan baris tanggal/hari (sticky top) saat digulir, dilengkapi aksen penanda vertikal "Hari Ini" serta pembeda visual lembut untuk akhir pekan dan hari libur nasional.',
            'Badge Shift Ringkas & Kompatibilitas Tema: Menampilkan kode shift ringkas (G, SM, M, L, N, OFF, CUTI) dengan palet visual dinamis yang mematuhi tema aktif (Industrial, PaperSketch, Technical, Editorial, Winamp, Dashboard, Light, Dark).',
            'Filter Posko & Search Bar Instan: Memfasilitasi filter unit posko (Graha Segara Lt. 1, Graha Ground, CDC, dsb) serta kolom pencarian real-time berdasarkan nama atau NIP rekan kerja.',
            'Pin Rekan Favorit / Partner Kerja: Fitur bintang semat (⭐) yang tersimpan otomatis di localStorage untuk menempatkan rekan kerja langganan tim di baris teratas matriks.',
            'Detail Shift & Formulir Pengajuan Tukar Shift: Klik pada sel mana saja untuk memunculkan modal popover rincian jam kerja, posko, dan tombol "Ajak Tukar Shift" untuk mengirimkan permohonan pertukaran dinas terstruktur.',
            'Ekspor Spreadsheet (.xlsx) & Cetak / PDF Landscape: Dukungan unduh instan ke format Excel SheetJS dengan penataan kolom rapi serta opsi cetak print-ready landscape untuk papan pengumuman ruang jaga.',
            'Solusi UX Layar Ponsel: Fitur segmented switch (2 Hari / 7 Hari / 1 Bulan) dan horizontal smooth swipe dengan indikator geser agar tabel tidak berdesakan di layar HP.',
            'Pengaturan Hak Akses (Access Control): Halaman terbuka untuk semua pengguna (End-User, Admin, Super Admin), serta dilindungi dari akun PPF non User.'
        ]
    },
    {
        version: '0.4.60',
        releaseDate: '30 September 2026',
        title: 'Auto-Apply Libur Nasional Pegawai, Default Tahun Berjalan, Penyelarasan Title Bar Seamless, & Navigasi Scroll Keyboard',
        isLatest: false,
        isMajor: false,
        tag: 'Auto-Apply Holidays, Keyboard Scroll Tables, Clean Window Title Bar',
        changes: [
            'Auto-Apply Libur Nasional Saat Login: Menambahkan fungsi registrasi otomatis hari libur resmi nasional sepanjang 3 tahun (tahun berjalan, setahun sebelum, dan setahun sesudah) ke dalam database lokal saat pengguna masuk ke aplikasi.',
            'Default Tahun Berjalan Pada Daftar Libur: Menjamin halaman daftar libur kustom otomatis menampilkan dan memfilter tahun berjalan secara default tanpa harus menyesuaikan selektor manual.',
            'Akses Navigasi Keyboard Scroll Tabel Admin: Mengintegrasikan event listener tombol arah kiri (ArrowLeft) dan arah kanan (ArrowRight) untuk mempermudah scrolling horizontal tabel pada dashboard administrator posko.',
            'Pembersihan Title Bar Sempurna: Menghapus teks redundan "(Kalender Kerja)" di samping judul utama aplikasi pada komponen WindowTitleBar di seluruh tema desktop.',
            'Penegakan Login Password Landing Page: Menghapus tombol X (Close/Skip) pada Landing Page untuk mewajibkan otentikasi NIP & password/set password bagi seluruh pengguna posko yang diizinkan.',
            'Fleksibilitas Hak Izin Non-User: Membuka kunci seluruh checkbox permission kustom pada role bertipe Non-User agar hak izinnya tetap dapat diatur dan dipantau secara granular.'
        ]
    },
    {
        version: '0.4.59',
        releaseDate: '30 September 2026',
        title: 'Pembatasan Ukuran Layar Jendela Desktop, Sinkronisasi Sempurna Tema Warm di Pengeditan Shift, Proteksi PPF non User, & Update Peta Jalan',
        isLatest: false,
        isMajor: false,
        tag: 'Desktop Screen Limit, Warm Theme Edit Shift, PPF non User Block, Roadmap Update',
        changes: [
            'Pembatasan Ukuran Layar Jendela Desktop: Membatasi dimensi ukuran layar jendela aplikasi desktop minimal 960x640px di tingkat Tauri (programmatic) serta menambahkan overlay peringatan web-fallback interaktif bagi pengguna desktop browser jika ukuran jendela berada di bawah standar tersebut.',
            'Penyelarasan Sempurna Tema Warm (Edit Shift): Memperbaiki dan menyelaraskan antarmuka modal edit shift agar sepenuhnya mematuhi palet warna Warm (isDashboard) termasuk warna latar belakang sidebar, panel katalog pola, borders motif aktif, tombol range sliders, serta ikon-ikon penanda tab.',
            'Warm Theme pada Halaman Pilih Ikon & Emoji: Menyelaraskan seluruh tab 260+ Ikon SVG dan 300+ koleksi Emoji pada modal picker ikon dengan aksen warna dark espresso (#4D2A00), pasta lezat (#E65F2B), dan latar krem lembut.',
            'Proteksi Akses Akun PPF non User: Melarang akun bertipe PPF non-user melakukan set password atau login mandiri di halaman Landing Page, dengan menampilkan panel pemblokiran visual, deskripsi larangan, dan menaruh tombol pengajuan perubahan role ke admin secara kohesif.',
            'Tata Kelola Otoritas Tingkat Non-User: Membuka dan menampilkan checkbox hak izin konfigurasi (Permissions) pada tingkat role non-user di dashboard admin agar tetap dapat dipantau dan diatur hak khususnya secara granular.',
            'Pembaruan Peta Jalan Pengembang (Roadmap): Menghapus baris rencana pengembangan "Fitur Reset Password dari Halaman Login" dari peta jalan karena telah sukses diselesaikan dan diimplementasikan.'
        ]
    },
    {
        version: '0.4.58',
        releaseDate: '30 September 2026',
        title: 'Highlight Hari Ini Tema Warm Sudut Tajam, Gradiasi Oranye Pasta & Tombol Mass Apply Otoritas',
        isLatest: false,
        isMajor: false,
        tag: 'Warm Theme Today Highlight Sharp Border & Mass Apply Buttons',
        changes: [
            'Sorotan Hari Ini Tema Warm Sudut Tajam: Menyelaraskan border beam pada tanggal hari ini di tema Warm agar berbentuk kotak sudut tajam (border-radius 0px) sesuai dengan karakteristik minimalis tema.',
            'Skema Gradiasi Cokelat & Oranye Pasta: Mengembangkan preset conic-gradient "warm" baru pada komponen BorderBeam yang menggabungkan cokelat pekat espresso (#4D2A00), oranye pasta lezat (#E65F2B), dan latar krem (#FFF5D0) untuk perpendaran yang serasi.',
            'Redesain Tombol Terapkan Role Massal: Mengubah radio button mass apply di submenu Pilih Pengguna menjadi tombol interaktif biasa dan menambahkan "jejak visual" (efek sorotan dan indikator pulsasi) pada tombol peran yang terakhir kali diklik.',
            'Pembersihan Keterangan Deskripsi Mass Apply: Menghapus teks instruksi pembantu di atas daftar role mass apply agar antarmuka lebih bersih dan bebas dari clutter.'
        ]
    },
    {
        version: '0.4.57',
        releaseDate: '30 September 2026',
        title: 'Penghapusan Deskripsi Pengaturan & Penyelarasan Tema Terang Minimalis Kontrol & Submenu Shift',
        isLatest: false,
        isMajor: false,
        tag: 'Penyelarasan UI Pengaturan & Tema Terang Minimalis',
        changes: [
            'Penghapusan Deskripsi Pengaturan Aplikasi: Menghapus teks deskripsi "Ekspor, Impor, & Cadangan Jadwal" pada header Pengaturan Aplikasi.',
            'Penyelarasan Tema Terang Minimalis di Tombol Kontrol Kalender: Menerapkan warna tema Terang Minimalis (#FFF0BE) pada wadah dan tombol-tombol Kontrol Kalender (Salin, Undo, Reset, Kunci).',
            'Penyelarasan Tema Terang Minimalis pada Dropdown Ekspor: Menyesuaikan dialog popup ekspor beserta tombol format unduhan (PDF, PNG, Excel, JSON) dengan tema Terang Minimalis.',
            'Penyelarasan Tema Terang Minimalis pada Sub-menu Shift & Alat Konfigurasi: Memastikan halaman daftar shift, tombol navigasi, serta dropdown preview shift menerapkan aksen krem espresso Terang Minimalis.'
        ]
    },
    {
        version: '0.4.56',
        releaseDate: '30 September 2026',
        title: 'Halaman "Pilih Pengguna" di Menu Role, Filter Posko, & Penyelarasan Tema Terang Minimalis',
        isLatest: false,
        isMajor: false,
        tag: 'User Role Selection Page & Posko Filter Feature',
        changes: [
            'Halaman Pilih Pengguna di Menu Role: Menambahkan tab "Pilih Pengguna" di dalam modal Tambah / Edit Role Otoritas untuk mengubah role pengguna secara cepat langsung dari menu role.',
            'Fitur Filter berdasarkan Posko: Menyediakan dropdown Filter Posko dan pencarian Nama/NIP pada tab Pilih Pengguna untuk kemudahan penyaringan personel.',
            'Tampilan Minimalis Radio Button Role: Menampilkan tabel ringkas dengan kolom Nama, NIP, dan pilihan Radio Button untuk seluruh role otoritas yang tersedia.',
            'Penyelarasan Tema Terang Minimalis: Menyempurnakan tema Terang Minimalis di modal MonthPicker, DatePicker, TimePicker, dialog konfirmasi reset/hapus, serta popup role.'
        ]
    },
    {
        version: '0.4.55',
        releaseDate: '30 September 2026',
        title: 'Checkbox Hak Izin "Masuk ke Aplikasi" & Kondisional Hak Reset Password Role',
        isLatest: false,
        isMajor: false,
        tag: 'Role Permission Granularity & Security Access Control',
        changes: [
            'Penambahan Hak Izin "Masuk ke Aplikasi": Menambahkan checkbox "Masuk ke Aplikasi" pada modal edit/tambah role otoritas untuk membatasi akun pendukung data/statistik dan mencegah user tanpa NIP masuk ke sistem.',
            'Penataan Kondisional Reset Password: Memastikan checkbox Reset Password pada edit/tambah otoritas role otomatis dinonaktifkan (greyed out) jika "Akses Dashboard" tidak dichecklist.',
            'Pembaruan Tampilan Otoritas Role: Menyelaraskan tata letak grid 4-kolom pada grup Administrasi & Akses Sistem di modal edit/tambah role.'
        ]
    },
    {
        version: '0.4.54',
        releaseDate: '30 September 2026',
        title: 'Penerapan Tema Terang Minimalis Komprehensif & Fit Ukuran Judul Sidebar Industrial',
        isLatest: false,
        isMajor: false,
        tag: 'Terang Minimalis Comprehensive Theming & Sidebar Font Sizing',
        changes: [
            'Penerapan Tema Terang Minimalis di Dashboard Administrator: Menyelaraskan seluruh kontainer header, sub-menu switcher, filter bar, tabel akun, dan kartu role otoritas ke palet warna krem hangat emas (#FFF5D0 / #FFF0BE) dengan batas & teks espresso (#4D2A00).',
            'Penerapan Tema Terang Minimalis di Popup Salin Excel: Mengubah modal salin jadwal & absen menggunakan Glowing Shell espresso #4D2A00 dan latar inner krem emas #FFF5D0.',
            'Penerapan Tema Terang Minimalis di Catatan Versi & Daftar Libur: Menyelaraskan tampilan kartu riwayat versi, badge versi, modal daftar hari libur, dan dropdown pemilih tahun ke Tema Terang Minimalis.',
            'Optimalisasi Ukuran Judul Sidebar Tema Industrial: Menyelaraskan ukuran teks "JadwalPriok" di sidebar tema Industrial agar seluruh huruf muat sempurna tanpa terpotong.'
        ]
    },
    {
        version: '0.4.53',
        releaseDate: '30 September 2026',
        title: 'Proporsi Komponen Sidebar, Redesain Grid Role & Compact TimePicker',
        isLatest: false,
        isMajor: false,
        tag: 'Sidebar Ratio Alignment, Multi-Column Role Grid & Compact TimePicker',
        changes: [
            'Penyelarasan Rasio Komponen Sidebar: Menyesuaikan proporsi tombol, badge role, dan font pada sidebar agar seimbang dengan komponen utama.',
            'Grid Role User Multi-Kolom & Minimalis: Merombak tampilan role otoritas di dashboard admin menjadi grid responsif 2-3 kolom untuk menghemat ruang.',
            'Textarea Deskripsi Role: Memperbaiki simpan perubahan deskripsi peran & tanggung jawab di modal edit/tambah role menggunakan input textarea.',
            'Penanganan Month Navigation Truncation: Memperbaiki batas lebar tombol bulan pada tema Paper Sketch dan Industrial agar nama bulan panjang tidak terpotong.',
            'Redesain Halaman TimePicker Minimalis: Memperkecil diameter jam analog dan tinggi modal timepicker secara konsisten pada seluruh tema.'
        ]
    },
    {
        version: '0.4.52',
        releaseDate: '30 September 2026',
        title: 'Koreksi Rentang Tanggal Riwayat Prototipe Awal',
        isLatest: false,
        isMajor: false,
        tag: 'Prototype Chronology Adjustment',
        changes: [
            'Koreksi Rentang Waktu Prototipe: Memperbarui tanggal rilis dan rentang waktu fase awal prototipe (Pre-Alpha) pada catatan versi menjadi 08 - 20 September 2026, merefleksikan jejak awal inisiasi proyek JadwalPriok secara akurat.'
        ]
    },
    {
        version: '0.4.51',
        releaseDate: '30 September 2026',
        title: 'Dokumentasi Catatan Sejarah Prototipe Awal pada Riwayat Versi',
        isLatest: false,
        isMajor: false,
        tag: 'Prototype Historical Archive & Version Chronology',
        changes: [
            'Arsip Sejarah Versi Prototipe Awal: Menambahkan catatan resmi fase awal prototipe (Pre-Alpha) dengan judul "Prototype" di bagian terbawah riwayat versi.',
            'Dokumentasi Evolusi v1.0.0 s.d. v3.0.0: Menyajikan poin-poin ringkas jejak pengembangan kalender shift, integrasi presensi CEISA, mutasi OFF geser, sinkronisasi Supabase, widget Android, hingga keputusan rekonstruksi ulang aplikasi dari fondasi v0.1.0-alpha.'
        ]
    },
    {
        version: '0.4.50',
        releaseDate: '30 September 2026',
        title: 'Transformasi Visual Tema Terang Minimalis & Optimalisasi Keterbacaan Tombol Dasbor',
        isLatest: false,
        isMajor: false,
        tag: 'Terang Minimalis Colorway, Flat Calendar Grid & Dasbor Button Sizing',
        changes: [
            'Palet Warna Baru Tema Terang Minimalis: Merombak skema warna tema Terang Minimalis dari kombinasi putih-hijau menjadi latar belakang krem hangat bernuansa emas #F9E6A8 dengan teks dan aksen cokelat pekat espresso #4D2A00, memberikan estetika modern, hangat, dan kontras tinggi.',
            'Grid Kalender Terintegrasi & Garis Border Bersatu: Menghapus seluruh margin/celah pemisah (gap-0) antar kartu tanggal dan menggabungkan garis batas menjadi border tabel monolitik 1px yang rapi dan presisi.',
            'Penghapusan Sudut Lengkung (Flat Rounded-None): Menghilangkan sudut tumpul (rounded corner) pada kartu tanggal, badge shift, dan kontainer kalender sehingga menghadirkan gaya desain minimalis yang tegas dan berstruktur.',
            'Optimalisasi Ruang Layar & Skala Kalender Otomatis (Autoscale): Memaksimalkan pemanfaatan ruang kosong layar aplikasi dengan menghilangkan pembatas lebar kaku dan menyelaraskan aspect ratio sel tanggal dinamis agar mengisi penuh bidang vertikal dan horizontal layar.',
            'Penyempurnaan Keterbacaan Tombol Dasbor: Memperbaiki ukuran dan ruang tombol "Dasbor" di kartu profil pengguna pada Desktop Sidebar dan Mobile Menu Drawer, memastikan seluruh teks terbaca utuh tanpa terpotong (truncated) di semua resolusi dan tema.'
        ]
    },
    {
        version: '0.4.49',
        releaseDate: '30 September 2026',
        title: 'Penyesuaian Label Tombol Dasbor di Kartu Profil Sidebar & Mobile Drawer',
        isLatest: false,
        isMajor: false,
        tag: 'Sidebar User Card Dasbor Button Label',
        changes: [
            'Penyesuaian Label Tombol Dasbor: Mengubah nama tombol pembuka halaman dashboard administrator pada kartu profil pengguna di Desktop Sidebar dan Mobile Menu Drawer menjadi "Dasbor".',
            'Kerapian & Keterbacaan Antarmuka: Teks "Dasbor" berpasangan presisi dengan ikon perisai dan berdampingan seimbang dengan badge role otoritas tanpa memicu truncation atau overflow pada seluruh tema aplikasi.'
        ]
    },
    {
        version: '0.4.48',
        releaseDate: '30 September 2026',
        title: 'Penyempurnaan Auto-Sizing Tabel Admin & Optimasi Indikator Super Admin Tema Paper Sketch',
        isLatest: false,
        isMajor: false,
        tag: 'Admin Table Auto Column Sizing & Sidebar Badge Fit',
        changes: [
            'Auto-Sizing Kolom Tabel Akun Dashboard Admin: Mengubah sistem lebar kolom tabel dari pembatas kaku (fixed/min-width) menjadi layout table-auto dinamis. Lebar kolom secara otomatis menyesuaikan isi data terpanjang pada tiap kolom (Nama, NIP, Posko, Sesi, Status, dan Tombol Aksi) serta mengisi seluruh bidang layar 1 layar penuh tanpa scroll horizontal pada layar PC kantor.',
            'Optimasi Indikator Super Admin & Tombol Admin di Tema Paper/Pencil Sketch: Menata ulang tata letak dan ukuran font/padding badge otoritas "SUPER ADMIN" dan tombol "Admin" di kartu profil pengguna pada Desktop Sidebar dan Mobile Menu Drawer agar keduanya tampil sejajar rapi, proporsional, dan presisi di dalam ruang yang tersedia tanpa melewati garis tepi border kartu.'
        ]
    },
    {
        version: '0.4.47',
        releaseDate: '30 September 2026',
        title: 'Penerapan Aturan Singkatan Nama Tengah Pengguna pada Sidebar & Mobile Drawer',
        isLatest: false,
        isMajor: false,
        tag: 'Sidebar User Name Middle Initial Formatting',
        changes: [
            'Format Nama Display Sidebar Konsisten: Menerapkan fungsi aturan inisial nama tengah formatDisplayName ke tampilan nama pengguna pada kartu profil di Desktop Sidebar dan Mobile Menu Drawer.',
            'Pencegahan Text Truncation: Nama yang memiliki 4 kata akan menginisialkan kata ke-2 dan ke-3, serta nama 5 kata menginisialkan kata ke-2, ke-3, dan ke-4, memastikan nama tampil utuh, rapi, dan tidak terpotong (truncated) pada kartu sidebar, lengkap dengan atribut tooltip nama asli.'
        ]
    },
    {
        version: '0.4.46',
        releaseDate: '30 September 2026',
        title: 'Perbaikan Scrollbar Mengambang & Optimalisasi Toolbar Filter Dashboard Admin',
        isLatest: false,
        isMajor: false,
        tag: 'Filter Toolbar Scrollbar Overlay Fix',
        changes: [
            'Penghapusan Scrollbar Menutupi UI Filter: Menerapkan utility no-scrollbar pada toolbar filter di tab Akun Pengguna dan Persetujuan sehingga tidak ada scrollbar horizontal bawaan OS yang menimpa dropdown pilihan Role, Status, dan Posko.',
            'Tata Letak Filter Adaptif & Responsif: Mengubah kontainer filter menjadi flex-wrap adaptif dengan batas lebar input pencarian terstruktur, memastikan dropdown filter tidak bertumpuk atau terpotong pada berbagai resolusi layar.'
        ]
    },
    {
        version: '0.4.45',
        releaseDate: '30 September 2026',
        title: 'Penempatan Tombol Dashboard Sejajar Indikator Admin di DIV Pengguna Sidebar',
        isLatest: false,
        isMajor: false,
        tag: 'Sidebar User Card Admin Button Integration',
        changes: [
            'Integrasi Tombol Dashboard Admin ke Dalam DIV User: Memindahkan tombol Dashboard Administrator langsung ke dalam kotak/DIV kartu profil nama user di sidebar (desktop maupun drawer mobile), terletak di sudut kanan bawah sejajar dengan indikator/badge role admin.',
            'Penyederhanaan Label Tombol & Breadcrumb: Mengubah label tombol menjadi "Dashboard" agar hemat ruang dan presisi berdampingan dengan badge role, serta memperbarui judul breadcrumb navbar menjadi "Dashboard Administrator".'
        ]
    },
    {
        version: '0.4.44',
        releaseDate: '30 September 2026',
        title: 'Optimalisasi Lebar Kolom Nama Dashboard Admin & Reposisi Tombol Menu Admin di Sidebar',
        isLatest: false,
        isMajor: false,
        tag: 'Compact Name Column & Sidebar Admin Button Relocation',
        changes: [
            'Optimalisasi Lebar Kolom Nama: Memperkecil lebar kolom Nama pada tabel Akun Pengguna dan tabel Pratinjau Jadwal di Dashboard Administrator secara proporsional agar tabel lebih efisien dan ruang horizontal kolom lainnya lebih lega.',
            'Reposisi Tombol Dashboard Administrator: Memindahkan tombol menu Dashboard Admin pada Sidebar (Desktop) dan Mobile Menu Drawer tepat ke bawah kotak profil/DIV nama pengguna yang sedang aktif sehingga akses navigasi admin menjadi jauh lebih cepat dan intuitif.'
        ]
    },
    {
        version: '0.4.43',
        releaseDate: '30 September 2026',
        title: 'Penyempurnaan Pembacaan Paste Excel: Pengabaian Border & Dukungan Sel Shift Tanpa Warna',
        isLatest: false,
        isMajor: false,
        tag: 'Excel Paste Border Stripping & Uncolored Shift Recognition',
        changes: [
            'Pengabaian Format Border Sel: Seluruh styling border dan garis bingkai kotak dari Excel/Google Sheets diabaikan secara total saat menempel data, sehingga antarmuka grid jadwal tetap rapi dan bersih.',
            'Dukungan Sel Shift Tanpa Warna / Latar Putih: Memperbaiki logika deteksi kode shift (seperti "P" -> PM, "G" -> Graha, "N" -> NPCT, dll.) pada sel tanpa warna latar atau sel dengan warna putih bawaan Excel sehingga terbaca sempurna sebagai badge shift.',
            'Pembersihan Karakter Non-Breaking Space: Menghapus spasi non-standar (NBSP) dari hasil salinan Excel agar pencocokan teks kode shift selalu akurat.'
        ]
    },
    {
        version: '0.4.42',
        releaseDate: '30 September 2026',
        title: 'Perbaikan Penyimpanan & Sinkronisasi Data Edit/Tambah Role Otoritas',
        isLatest: false,
        isMajor: false,
        tag: 'Role Management Persistence & Cross-User Sync Fix',
        changes: [
            'Perbaikan Penyimpanan Profil Otoritas: Memperbaiki logika getter dan normalisasi profil otoritas pada adminStorage agar tidak menimpa modifikasi nama, deskripsi, tingkat role, dan izin kustom dengan nilai bawaan sistem.',
            'Sinkronisasi Akun Pengguna Real-Time: Saat admin mengubah nama profil atau tingkat role otoritas, seluruh akun pengguna yang terikat pada role tersebut otomatis tersinkronisasi secara langsung.',
            'Penyempurnaan Form Handler Modal: Menjamin penanganan submit form dan tombol Simpan Role / Simpan Perubahan berjalan responsif dan akurat.'
        ]
    },
    {
        version: '0.4.41',
        releaseDate: '30 September 2026',
        title: 'Penyederhanaan Header Impor Jadwal & Penyesuaian Label Tombol Terapkan',
        isLatest: false,
        isMajor: false,
        tag: 'Clean Import Header & Apply Button Label Customization',
        changes: [
            'Pembersihan Header Impor: Menghapus badge indikator "150 Rows × 40 Cols" dan teks deskripsi penjelasan di bawah judul sub menu Impor Jadwal Pengguna sehingga tampilan lebih bersih dan lapang.',
            'Penyesuaian Label Tombol Terapkan: Mengubah label tombol eksekusi impor menjadi "Terapkan semua ke <jumlah> Pengguna" secara dinamis sesuai total pengguna terpilih.'
        ]
    },
    {
        version: '0.4.40',
        releaseDate: '30 September 2026',
        title: 'Penataan Tombol Toolbar Impor Jadwal & Pemindahan Tombol Muat Contoh Data',
        isLatest: false,
        isMajor: false,
        tag: 'Import Toolbar Button Organization & Sample Data Button Relocation',
        changes: [
            'Penataan Ulang Tombol Toolbar Impor: Mengubah nama "Impor dari File Langsung" menjadi "Impor dari File", mengubah nama "Tempel Excel (Clipboard)" menjadi "Tempel Data", dan memposisikan tombol "Tempel Data" di sebelah kiri tombol "Impor dari File".',
            'Pemindahan Tombol Muat Contoh Data: Memindahkan tombol "Muat Contoh Data Grid" tepat ke sebelah kanan pemilih Target Tahun untuk alur kerja yang lebih ergonomis dan rapi.'
        ]
    },
    {
        version: '0.4.39',
        releaseDate: '30 September 2026',
        title: 'Pelipatan Sasaran Pengguna Penerapan Jadwal & Penyesuaian Judul Pratinjau',
        isLatest: false,
        isMajor: false,
        tag: 'Collapsible Schedule Target Selection & Preview Label Refinement',
        changes: [
            'Pelipatan Sasaran Penerapan Jadwal: Mengubah tampilan target pengguna menjadi komponen akordeon/lipatan (collapsible) yang ringkas dengan status bawaan terlipat (folded), dilengkapi ringkasan jumlah personel terpilih dan tombol buka/tutup lipatan.',
            'Penyesuaian Label Bagian: Mengubah nama "Pilih Sasaran Pengguna / Posko Penerima" menjadi "Pilih Pengguna Penerapan Jadwal".',
            'Pembaruan Judul Pratinjau Jadwal: Mengubah label "Pratinjau Jadwal (5 Personel Posko Terpilih Otomatis)" menjadi "Pratinjau Jadwal 5 Pengguna Acak".'
        ]
    },
    {
        version: '0.4.38',
        releaseDate: '30 September 2026',
        title: 'Penghapusan Kata "Posko", Inisialisasi Nama Tengah di Tabel, & Minimalisasi Halaman Role',
        isLatest: false,
        isMajor: false,
        tag: 'Posko Naming Cleanup, Name Middle Initials & Minimalist Role Management',
        changes: [
            'Penghapusan Kata "Posko": Menghapus kata "Posko" pada seluruh data unit posko (Graha Lt. 1, Graha Ground, CDC, NPCT, Koja) di database, sesi perangkat, dan dropdown pilihan.',
            'Penyingkatan Inisial Nama Tengah: Pada tabel akun pengguna, nama dengan lebih dari 3 kata secara otomatis mengaliaskan nama tengah menjadi inisial (misal: 4 kata -> kata ke-2 & ke-3 diinisialkan, 5 kata -> kata ke-2, ke-3 & ke-4 diinisialkan) tanpa mengubah data nama riil saat diedit.',
            'Pengosongan Search Box Placeholder: Mengosongkan placeholder teks pada kotak pencarian akun pengguna agar lebih bersih dan rapi.',
            'Minimalisasi Halaman Pengaturan Role: Menghapus logo/ikon dan badge role pada daftar role otoritas serta memadatkan tampilan kartu role menjadi lebih ringkas dan hemat ruang.'
        ]
    },
    {
        version: '0.4.37',
        releaseDate: '30 September 2026',
        title: 'Integrasi Logika Pemetaan Otomatis Pewarnaan Shift Cerdas pada Impor Jadwal Dashboard Admin',
        isLatest: false,
        isMajor: false,
        tag: 'Intelligent Shift Color Heuristics & Large Volume Schedule Mapping Engine',
        changes: [
            'Integrasi Logika Pemetaan Shift Cerdas: Mengadopsi mesin pencocokan warna dan heuristik RGB dari Salin Shift by Text (ExcelSpreadsheet) ke dalam grid impor jadwal dashboard admin (150 baris × 40 kolom).',
            'Pencocokan Multi-Dimensi: Mendeteksi warna latar sel (background color), warna font teks (text color), kode teks shift, serta kamus sistem bawaan (SYSTEM_DEFAULT_EXCEL_MAP) dan aturan kustom pengguna secara otomatis.',
            'Visualisasi Warna Shift Instan: Setiap sel jadwal dalam grid 150 baris otomatis menampilkan lencana/tema warna shift secara real-time saat terdeteksi.',
            'Panel Aturan Warna & Kode Terpadu: Mendeteksi seluruh varian warna dan kode pada data impor volume besar secara otomatis dan menyediakan opsi penyesuaian serta penyimpanan aturan kustom.'
        ]
    },
    {
        version: '0.4.36',
        releaseDate: '30 September 2026',
        title: 'Minimalisasi Ukuran & Tata Letak Tabel Menu Akun Pengguna',
        isLatest: false,
        isMajor: false,
        tag: 'Minimalist User Accounts Table & High Information Density',
        changes: [
            'Minimalisasi Ukuran Tabel Akun Pengguna: Memadatkan padding vertikal/horizontal sel tabel (th dan td) untuk mencapai densitas informasi tinggi yang rapi dan elegan.',
            'Optimalisasi Komponen Sel Tabel: Memperkecil proporsi badge role, status sesi perangkat (online/offline), ukuran checkbox status aktif, dan tombol aksi (Reset, Edit, Hapus) agar lebih proporsional dan hemat ruang.',
            'Penyempurnaan Bar Filter & Pencarian: Menata input pencarian dan dropdown filter (Role, Status, Posko) menjadi lebih ringkas dan hemat ruang vertikal.'
        ]
    },
    {
        version: '0.4.35',
        releaseDate: '30 September 2026',
        title: 'Dependensi Hak Izin Role & Optimalisasi Tata Letak Popup Edit/Tambah Role Hemat Ruang',
        isLatest: false,
        isMajor: false,
        tag: 'Permission Cascading Logic & Ultra-Compact Modal Layout',
        changes: [
            'Dependensi Hak Izin Role: Checkbox "Akses Dashboard Admin" otomatis dinonaktifkan (greyed-out) untuk kelompok tingkat role End-User dan Non-User.',
            'Kaskade Hak Izin Admin: Jika checkbox "Akses Dashboard Admin" tidak dicentang, 5 hak izin turunannya (Kelola Pengguna, Impor Jadwal Shift, Lihat Sesi Perangkat, Edit Otoritas, Hapus Otoritas Admin) secara otomatis di-greyed out dan dinonaktifkan.',
            'Optimalisasi Popup Modal Hemat Ruang: Merestrukturisasi antarmuka modal Tambah/Edit Role menjadi 2-kolom ringkas pada header, memperluas lebar kontainer, dan memadatkan matriks permission sehingga sangat hemat ruang dan tidak terpotong pendek.',
            'Perbaikan Teks Tab Sub-Menu: Memperluas lebar minimum kontainer sub-menu dan menerapkan whitespace-nowrap agar teks "Impor Jadwal" tidak lagi terpotong (truncated) saat mengubah ukuran layar.'
        ]
    },
    {
        version: '0.4.34',
        releaseDate: '30 September 2026',
        title: 'Tab Arsip Persetujuan Pengguna, Pembersihan Menyeluruh Data User Terhapus, & Perapian Konfigurasi Hak Izin',
        isLatest: false,
        isMajor: false,
        tag: 'Approval Archive Tab, Deep User Purge, & Permission Matrix Redesign',
        changes: [
            'Tab Arsip Persetujuan: Menambahkan pemisah tab "Menunggu" dan "Arsip" di sisi paling kanan header halaman Persetujuan Permintaan Pengguna, dengan pemindahan data otomatis saat permohonan disetujui atau ditolak.',
            'Tata Letak Baris Minimalis: Merapikan tampilan data permohonan persetujuan dengan posisi waktu "Diajukan" di kanan atas dan status "Diproses" atau tombol aksi di bawahnya.',
            'Pembersihan Menyeluruh Data User: Menghapus akun pengguna kini secara otomatis mentrigger pembersihan total seluruh data terkait di aplikasi (daftar akun, sesi login aktif, riwayat permohonan, dan penyimpanan lokal pengguna).',
            'Perapian Konfigurasi Hak Izin: Mengelompokkan pengaturan permission ke dalam 3 kategori terstruktur (Administrasi, Operasional Shift & Sesi, Tata Kelola & Keamanan) dengan kartu interaktif yang modern dan rapi.'
        ]
    },
    {
        version: '0.4.33',
        releaseDate: '30 September 2026',
        title: 'Reposisi Tombol Terapkan Semua & Pembaruan Mikrokopi Impor Format CSV Hari Libur',
        isLatest: false,
        isMajor: false,
        tag: 'Holiday Action Buttons Alignment & Refined CSV Copywriting',
        changes: [
            'Reposisi Tombol Aksi: Memindahkan tombol "Terapkan Semua" ke sebelah kanan tombol hapus pada footer daftar hari libur agar tata letak aksi menjadi lebih terpusat dan ergonomis.',
            'Pembaruan Teks Antarmuka CSV: Menyesuaikan judul panel menjadi "Impor Data CSV Libur" dan deskripsi petunjuk menjadi "Tambahkan data libur nasional menggunakan Format CSV".'
        ]
    },
    {
        version: '0.4.32',
        releaseDate: '30 September 2026',
        title: 'Reposisi Tombol Sub-Menu Dashboard Admin ke Sisi Kanan Header & Eliminasi Indikator Angka',
        isLatest: false,
        isMajor: false,
        tag: 'Header Sub-Menu Right Alignment & Clean Minimalist Tab Design',
        changes: [
            'Reposisi Sub-Menu Header: Memindahkan kelompok tombol sub-menu dashboard admin (Data Akun, Impor Jadwal, Role, Persetujuan) langsung ke sisi paling kanan dalam kartu header, berdampingan dengan judul Dashboard Administrator.',
            'Pembersihan Indikator Angka: Menghapus seluruh badge angka/kuantitas pada tombol sub-menu untuk tampilan antarmuka yang bersih, ringkas, dan selaras dengan desain tab Pengaturan Aplikasi.'
        ]
    },
    {
        version: '0.4.31',
        releaseDate: '30 September 2026',
        title: 'Pembaruan Standarisasi Nama Posko (Graha Segara Lt. 1 -> Graha Lt. 1)',
        isLatest: false,
        isMajor: false,
        tag: 'Posko Standard Naming Refinement',
        changes: [
            'Penyeragaman Nama Posko: Mengubah nama posko penugasan "Graha Segara Lt. 1" menjadi "Graha Lt. 1" pada seluruh master data pengguna bawaan, sesi perangkat, pilihan form penugasan, dan logika migrasi data tersimpan.'
        ]
    },
    {
        version: '0.4.30',
        releaseDate: '30 September 2026',
        title: 'Optimalisasi Desain Ultra Minimalis Landing Page & Perbaikan Posisi Kontainer di Bawah Title Bar',
        isLatest: false,
        isMajor: false,
        tag: 'Compact Minimalist Landing Page Card & Safe Title Bar Viewport Boundary',
        changes: [
            'Dimensi Ultra Minimalis: Memperkecil tinggi dan lebar kartu Landing Page (max-w-[360px]) dengan tipografi proporsional, padding ramping, dan komponen input yang ringkas tanpa mengurangi kejelasan fungsi.',
            'Perbaikan Posisi Viewport: Menyesuaikan kontainer flex dan margin layout sehingga bagian atas kartu Landing Page selalu berada aman di bawah Window Title Bar dan tidak pernah terpotong atau melewati batas header.',
            'Deskripsi & Tombol Kompak: Menyederhanakan mikrokopi keamanan, notifikasi reset, dan tombol aksi ke dalam format ringkas yang responsif di seluruh tema aplikasi.'
        ]
    },
    {
        version: '0.4.29',
        releaseDate: '30 September 2026',
        title: 'Sinkronisasi Real-Time Sesi Perangkat & Optimasi Responsif Sub-Menu Dashboard Admin',
        isLatest: false,
        isMajor: false,
        tag: 'Device Session Consistency & Responsive Admin Sub-Menu Navigation',
        changes: [
            'Sinkronisasi Sesi Akurat: Menyelaraskan seluruh data sesi perangkat (Tipe, OS, Browser, IP Address, MAC Address, Lokasi, dan Status Online) antara tab Akun di Pengaturan dan tabel Data Akun di Dashboard Administrator.',
            'Modal Inspeksi Sesi Perangkat: Menambahkan modal detail sesi perangkat interaktif saat mengklik sel sesi di tabel pengguna posko dengan opsi pemutusan sesi secara paksa (force logout) dan sinkronisasi status.',
            'Optimasi Sub-Menu Layar Sempit: Memperbaiki kontainer navigasi sub-menu dashboard admin agar adaptif dan utuh pada layar ponsel atau layar sempit tanpa ada menu yang terpotong atau tertutup.'
        ]
    },
    {
        version: '0.4.28',
        releaseDate: '30 September 2026',
        title: 'Penyempurnaan Tampilan Penuh Landing Page, Tombol Tutup X, & Eliminasi Navigasi Pengganggu',
        isLatest: false,
        isMajor: false,
        tag: 'Full-View Landing Page, Close Trigger & Clean Onboarding Experience',
        changes: [
            'Sembunyikan Sidebar & Header: Ketika Landing Page dibuka, sidebar dan header (navbar atas) serta navigasi bawah disembunyikan sepenuhnya untuk memberikan pengalaman onboarding yang terisolasi dan fokus.',
            'Penegasan Kasus A & B: Kasus A (Akun Baru) langsung memuat form Buat Password Baru + Konfirmasi beserta deskripsi keamanan mandatori; Kasus B (Akun Terdaftar) memuat input Password dan tombol Pengajuan Reset Password ke Dashboard Admin.',
            'Tombol Tutup (X): Menambahkan tombol "X" di pojok kanan atas kartu Landing Page sebagai pengaman akses langsung ke kalender kerja selama masa pengujian.',
            'Pembersihan Antarmuka: Menghapus tombol lewati dan tombol pemilih contoh pegawai untuk tampilan yang lebih bersih, profesional, dan realistis.'
        ]
    },
    {
        version: '0.4.27',
        releaseDate: '30 September 2026',
        title: 'Status Default Akun Tanpa Password & Pemicu Reset Pengosongan Password di Daftar Pengguna',
        isLatest: false,
        isMajor: false,
        tag: 'Default Passwordless Accounts & User List Password Clear Trigger',
        changes: [
            'Default Akun Tanpa Password: Menetapkan status bawaan seluruh user/pegawai (termasuk Super Admin dan seluruh staf posko) tanpa password awal (hasPassword: false).',
            'Alur Onboarding & Login Adaptif: Pengguna pertama kali dapat langsung memasukkan NIP dan diarahkan ke form pembuatan password baru.',
            'Pemicu Reset Pengosongan Password: Tombol Reset Password pada tabel Daftar Pengguna Posko berfungsi langsung sebagai pemicu untuk mengosongkan kata sandi (hasPassword: false), membersihkan cache sesi kata sandi lokal, dan otomatis menyetujui pengajuan reset yang tertunda di Dashboard Admin.'
        ]
    },
    {
        version: '0.4.26',
        releaseDate: '30 September 2026',
        title: 'Fitur Onboarding Landing Page, Otentikasi NIP, & Alur Pengajuan Reset Password',
        isLatest: false,
        isMajor: false,
        tag: 'First-Run Onboarding Landing Page, NIP Password Auth & Admin Reset Notification',
        changes: [
            'Halaman Landing Page Onboarding Sekali Muncul: Menampilkan portal autentikasi NIP saat pertama kali aplikasi diinstal (atau dibuka sebelum status onboarding selesai), dan dapat diuji coba kapan saja melalui menu di Sidebar.',
            'Alur Set Password Baru Pegawai: Pegawai baru yang memasukkan 18 digit NIP diminta mengatur password dengan deskripsi keamanan mandatori: "* Password ini digunakan untuk membatasi pengguna lain masuk ke akun Anda. * Jika Anda install di device lain/install ulang aplikasi, password ini akan dibutuhkan."',
            'Form Login Akun Terdaftar: Jika akun terdeteksi sudah memiliki password di database, kolom isian password akan muncul secara otomatis di bawah NIP.',
            'Integrasi Pengajuan Reset Password: Menyediakan tombol "Lupa / Reset Password?" pada Landing Page yang langsung mengirimkan notifikasi pengajuan ke Dashboard Administrator Posko (tab Persetujuan) untuk ditinjau.',
            'Peralihan Cepat & Alat Ujicoba: Menyediakan menu popover pemilih contoh pegawai dan tombol mulai ulang alur onboarding untuk fleksibilitas pengujian pengembang.'
        ]
    },
    {
        version: '0.4.25',
        releaseDate: '30 September 2026',
        title: 'Penskalaan Tombol Header, Transisi Modal Salin Tanpa Kedip, & Sinkronisasi Super Admin',
        isLatest: false,
        isMajor: false,
        tag: 'Header Sizing, Smooth Bounce Transition & Role Persistence',
        changes: [
            'Penskalaan Tombol Header: Mengurangi tinggi tombol Ekspor dan tombol Pemilih Tema di Top Navbar sebesar ~12% (h-7 sm:h-8) untuk proporsi visual yang lebih rapi dan ringkas di seluruh tema.',
            'Eliminasi Kedipan Modal Salin: Menghapus re-render ganda pada saat membuka modal Salin Jadwal & Presensi, menyempurnakan transisi spring bounce yang lembut, stabil, dan tidak berlebihan.',
            'Sinkronisasi Mutlak Akun Super Admin: Memastikan profil pengguna utama (Ahmad Fiqri / 199510102015121002) tersimpan dan teridentifikasi secara permanen sebagai Super Admin baik di Dashboard Administrator, Pengaturan Akun, maupun di Sidebar & Mobile Drawer.',
            'Klarifikasi Sekuensi Penomoran Versi: Menegaskan skema Semantic Versioning di mana rilis v0.3.99 dilanjutkan dengan kenaikan minor v0.4.0, disusul rilis patch berurutan v0.4.1 hingga v0.4.25.'
        ]
    },
    {
        version: '0.4.24',
        releaseDate: '30 September 2026',
        title: 'Optimalisasi Antarmuka Kalender, Penyatuan Sub Menu Pengaturan, & Efek Glitch',
        isLatest: false,
        isMajor: false,
        tag: 'UI & Animation Refinement, Settings Integration & Glitch Effects',
        changes: [
            'Perbaikan Transisi Popover Salin: Menghilangkan kedipan ganda pada modal Salin Jadwal & Presensi dengan transisi spring bounce yang lembut, proporsional, dan stabil.',
            'Penyatuan Sub Menu Pengaturan: Menempatkan navigasi tab Akun, Shift, dan Impor & Reset pada baris header yang sama dengan judul Pengaturan di sisi kanan secara vertikal presisi.',
            'Restrukturisasi Halaman Hari Libur: Menghapus label judul di atas tabel libur, memindahkan indikator jumlah hari libur ke sisi kanan selektor tahun, dan menambahkan tombol "Hapus Libur Tahun Ini" di bagian footer data baris libur.',
            'Efek Glitch Tombol Hapus: Mengintegrasikan efek hover glitch yang konsisten pada tombol Hapus Libur Tahun Ini dan Kirim Permintaan Hapus Akun.',
            'Koreksi dan Standarisasi Penomoran Versi: Menyelaraskan seluruh urutan nomor versi secara sekuensial dan konsisten (0.4.22-beta -> 0.4.23 -> 0.4.24).'
        ]
    },
    {
        version: '0.4.23',
        releaseDate: '29 September 2026',
        title: 'Sinkronisasi Real-Time Nama Role Pengguna',
        isLatest: false,
        isMajor: false,
        tag: 'Dynamic Role Name Synchronization & Real-time Profile Hooking',
        changes: [
            'Sinkronisasi Real-Time Nama Peran/Otoritas Pengguna: Mengubah indikator peran di bawah nama lengkap pada tabel daftar pengguna agar selalu tersinkronisasi secara dinamis dengan nama peran terbaru di tab Role Otoritas. Kini, setiap perubahan nama peran akan langsung ter-update otomatis pada semua pengguna yang memegangnya tanpa lag.'
        ]
    },
    {
        version: '0.4.22-beta',
        releaseDate: '29 September 2026',
        title: 'Integrasi "Non User" ke Form Tambah & Edit Peran Otoritas',
        isLatest: false,
        isMajor: false,
        tag: 'Non-User Role Type Integration & Permissions Disabling',
        changes: [
            'Integrasi Tingkat Peran "Non User" Baru: Memindahkan pilihan tingkat peran "3. Non User" ke dalam formulir Tambah Peran dan Edit Peran di tab Role Otoritas.',
            'Disabling Konfigurasi Hak Akses (Permissions Checklist): Jika jenis peran "Non User" dipilih dalam formulir, seluruh pilihan hak izin (permissions checklist) di bawahnya secara dinamis langsung dinonaktifkan (disabled), di-grayscale, diturunkan opasitasnya (opacity-40), serta diatur tidak memiliki hak akses apa pun (unchecked) secara otomatis.'
        ]
    },
    {
        version: '0.4.21-beta',
        releaseDate: '29 September 2026',
        title: 'Perlindungan Menonaktifkan Super Admin & Penambahan Mode Otoritas "Non User"',
        isLatest: false,
        isMajor: false,
        tag: 'Super Admin Disabling Protection & "Non User" Testing Mode with Greyed Out Submenus',
        changes: [
            'Perlindungan Akun Utama Super Admin: Membatasi akun Utama Super Admin agar tidak dapat dinonaktifkan (checkbox dinonaktifkan baik di tabel maupun modal edit) untuk mencegah penguncian sistem admin secara tidak sengaja.',
            'Penambahan Mode Otoritas "3. Non User": Menyediakan tombol opsi pengujian peran baru "3. Non User" pada Panel Atas Dashboard Admin.',
            'Efek Menonaktifkan Seluruh Submenu & Konten (Greyed Out): Ketika mode "Non User" diaktifkan, seluruh navigasi sub-menu admin dan panel konten di bawahnya langsung mengalami grayscale filter, opasitas rendah (opacity-30), dinonaktifkan dari klik, serta tidak dapat diinteraksi sama sekali.'
        ]
    },
    {
        version: '0.4.20-beta',
        releaseDate: '29 September 2026',
        title: 'Penyelarasan Terminologi Filter Peran menjadi "Role"',
        isLatest: false,
        isMajor: false,
        tag: 'Role Filter Label Terminology Swapping',
        changes: [
            'Pembaruan Terminologi Filter "Otoritas": Mengubah teks filter "Otoritas:" di atas tabel manajemen pengguna menjadi "Role:" guna menyelaraskan dengan terminologi Peran Pengguna secara konsisten.'
        ]
    },
    {
        version: '0.4.19-beta',
        releaseDate: '29 September 2026',
        title: 'Perbaikan Fungsionalitas Checkbox, Penyelarasan Posisi Role, Dropdown Posko Standard & Filter Posko Baru',
        isLatest: false,
        isMajor: false,
        tag: 'Checkbox State Fix, Role Badge Alignment, Posko Filter & Standardized Dropdown',
        changes: [
            'Perbaikan Checkbox "Aktif" di Daftar Pengguna: Mengatasi bug double-firing click pada komponen Checkbox dengan menghapus redundansi atribut "htmlFor" pada label bersarang, mengembalikan responsivitas toggle akun secara instan.',
            'Penyelarasan Posisi "Role User": Memindahkan lencana indikator role/otoritas agar tampil tepat di bawah nama lengkap pada daftar pengguna, memberikan tata letak yang bersih dan rapi.',
            'Filter Berdasarkan Unit Posko: Menambahkan selektor filter drop-down dinamis berbasis Unit Posko untuk menyaring daftar pengguna secara instan di dashboard admin.',
            'Standardisasi Dropdown Pilihan Posko: Mengubah form unit penugasan posko pada modal tambah & edit pengguna dari input teks bebas menjadi dropdown select dengan 5 opsi standar (Posko Graha Lt. 1, Graha Ground, CDC, NPCT, Koja) dengan penanganan kompatibilitas data lama.'
        ]
    },
    {
        version: '0.4.18-beta',
        releaseDate: '29 September 2026',
        title: 'Perbaikan Prioritas Pemetaan Warna, Penyelarasan Indeks Jadwal, & Filter Identitas Impor Excel',
        isLatest: false,
        isMajor: false,
        tag: 'Color Mapping Priority, Day Alignment Fix, Identity Data Filtering',
        changes: [
            'Perbaikan Prioritas Pemetaan Warna: Menentukan prioritas utama bagi aturan warna latar Excel di atas teks agar sel dengan teks "P" (tanpa warna => Graha) tidak menimpa sel "P" berwarna kuning (dengan warna => TPSL).',
            'Penyelesaian Masalah Indeks Jadwal Pratinjau: Memperbaiki pergeseran pencocokan kolom 1-2 (Nama & NIP) ke kolom 3 s.d 33 sehingga pratinjau tanggal 1 s.d 31 selaras sempurna dengan isi grid data.',
            'Filter Otomatis Identitas Pegawai (Nama & NIP): Menyaring entri Nama (>5 karakter) dan NIP (18 digit angka) agar tidak masuk ke daftar aturan pemetaan warna maupun jatuh ke fallback default shift.',
            'Grouping Konsistensi Warna Putih: Mengelompokkan warna putih (#ffffff) atau tanpa warna secara otomatis di bawah aturan teks "P" (Graha) demi menyederhanakan konfigurasi pemetaan rules.'
        ]
    },
    {
        version: '0.4.17-beta',
        releaseDate: '29 September 2026',
        title: 'Optimasi Paste Excel, Perlindungan Super Admin, Terminology Role User, & Standardisasi Checkbox',
        isLatest: false,
        isMajor: false,
        tag: 'Excel Paste Performance, Role Alignment, Checkbox Standardisation',
        changes: [
            'Optimasi Performa Paste Excel (CTRL+V): Memperkenalkan komponen memoized GridRow dan GridCell pada Grid Impor (150 baris × 40 kolom) mengurangi re-render dari 6.000 sel menjadi <100 sel per perubahan. Sensitivitas dan waktu respon meningkat drastis.',
            'Akses Tempel Clipboard Instan: Menambahkan tombol "Tempel Excel (Clipboard)" yang memungkinkah pengimporan tabel Excel berserta format warnanya secara instan via klik tombol.',
            'Pengecualian Pemetaan Warna Kolom Identitas: Mencegah pemetaan aturan warna merusak atau mengubah sel pada kolom identitas Nama & NIP (Kolom 1 & 2) saat menempel data.',
            'Perlindungan Akun Super Admin: Memastikan Super Admin tidak dapat dihapus dan menyembunyikan tombol permintaan hapus akun / reset password untuk seluruh Admin.',
            'Terminologi Peran "Role User": Menyelaraskan menu "Profil Tingkat Otoritas dan Hak Akses" menjadi "Role User" dan menyajikan daftar dalam tampilan grid 1 kolom.',
            'Standardisasi Checkbox Komponen: Menerapkan komponen UI kustom Checkbox di seluruh form dan list sasaran impor untuk menyinkronkan tema terang/gelap/pencilsketch secara global.',
            'Penyelarasan Form Akun Pegawai: Mengubah susunan form identitas pada tab Akun menjadi Nama Pegawai terlebih dahulu, disusul oleh NIP Pegawai.'
        ]
    },
    {
        version: '0.4.16-beta',
        releaseDate: '29 September 2026',
        title: 'Responsivitas Judul Tema Industrial, Integrasi 120 Profil Pegawai, dan Perapihan Form Admin',
        isLatest: false,
        isMajor: false,
        tag: 'Industrial Theme UI Fix, Staff Profiles Pre-population, Title Scaling & Admin Form Cleanup',
        changes: [
            'Responsivitas Judul Tema Industrial: Memperkecil dan memproporsionalkan ukuran judul "JadwalPriok" pada sidebar agar tidak terpotong di tema Industrial.',
            'Integrasi 120 Profil Pegawai Posko: Menambahkan daftar lengkap 120 personel petugas posko (Posko Graha Lt. 1, Ground, CDC, NPCT, Koja) secara default dan aktif di database admin.',
            'Perapihan Form Profil Pengguna: Menghapus pilihan kelompok regu dan checkbox petugas luar dari modal tambah & edit pengguna di dashboard admin.',
            'Pembaruan Judul Dashboard Admin: Mengubah nama header menjadi "Dashboard Administrator" secara bersih tanpa deskripsi tambahan.'
        ]
    },
    {
        version: '0.4.15-beta',
        releaseDate: '29 September 2026',
        title: 'Tabel List Pengguna, Halaman Persetujuan Admin, Komponen Profil Sidebar Statis, dan Rencana Cloud Sync Supabase',
        isLatest: false,
        isMajor: false,
        tag: 'Table User List, Admin Approvals Page, Static Sidebar Identity & Supabase Roadmap',
        changes: [
            'Tampilan Manajemen Pengguna Berformat Tabel List: Menyajikan daftar pengguna dalam struktur tabel (No. | Nama | NIP | Posko | Checkbox Aktif | Reset Pass | Edit | Hapus).',
            'Halaman Persetujuan Permintaan Pengguna: Menyediakan submenu khusus persetujuan bagi admin berotoritas untuk memverifikasi dan mengeksekusi permintaan penghapusan akun serta reset password pengguna.',
            'Identitas Pengguna Sidebar Statis: Mengubah komponen Nama dan NIP di desktop sidebar dan mobile drawer menjadi kartu statis non-interaktif tanpa tautan.',
            'Pembaruan Roadmap / Rencana Fitur: Menambahkan rencana integrasi Cloud Sync dengan Supabase untuk backup dan persistensi data multi-user.'
        ]
    },
    {
        version: '0.4.14-beta',
        releaseDate: '29 September 2026',
        title: 'Hak Izin Otoritas Baru, Grid Impor Excel 150x40 dengan Deteksi Warna, dan Pratinjau 5 Pegawai Acak',
        isLatest: false,
        isMajor: false,
        tag: 'New Authority Permissions, 150x40 Excel Grid with Color Detection & 5-Person Preview',
        changes: [
            'Penambahan Hak Izin Otoritas Baru: Menambahkan izin "Hapus otoritas admin" dan "Edit Otoritas" lengkap dengan aksi edit profil dan hapus profil berizin.',
            'Penghapusan Fitur Pola Master Regu: Menghilangkan opsi pola master statis untuk memfokuskan impor pada data riil matriks Excel.',
            'Grid Tabel Impor Data 150×40: Menyediakan spreadsheet interaktif berukuran 150 baris (Row 1-150 di sebelah kiri) dan 40 kolom (Col 1-40 di bagian atas) dengan sticky header.',
            'Impor Berkas Langsung & Deteksi Warna Paste: Mendukung unggah berkas langsung (.xlsx, .csv, .txt, .json) serta event paste yang membaca warna latar HTML/CSS dan teks shift secara otomatis.',
            'Pratinjau Jadwal 5 Pegawai Acak: Menampilkan susunan matriks jadwal horizontal 1 bulan penuh untuk 5 personel yang diacak otomatis oleh aplikasi (Nama Pegawai | Tgl 1 s.d. 31).'
        ]
    },
    {
        version: '0.4.13-beta',
        releaseDate: '29 September 2026',
        title: 'Penyempurnaan Sub Menu Dashboard Admin & Fitur Impor Jadwal Pengguna dari Excel',
        isLatest: false,
        isMajor: false,
        tag: 'Admin Excel Schedule Importer & Submenu Refinement',
        changes: [
            'Pembaruan Nama Sub Menu Dashboard Admin: Mengubah "Salin jadwal massal" menjadi "Impor Jadwal Pengguna" dan "Sesi Pengguna (Folded)" menjadi "Sesi Pengguna".',
            'Mesin Impor Jadwal dari Excel pada Dashboard Admin: Membangun fitur impor jadwal shift kerja berbasis data deretan kode Excel (TSV/teks) menyerupai fitur salin jadwal pada kalender kerja.',
            'Pilihan Kalender Target & Live Shift Preview: Mendukung pemilihan target bulan dan tahun jadwal, dilengkapi live preview kode shift dengan badge warna posko per tanggal.',
            'Penargetan Personel & Posko Luar: Mendukung distribusi impor jadwal ke seluruh pengguna aplikasi maupun personel posko luar untuk kebutuhan data operasional dan rekapitulasi kehadiran posko.'
        ]
    },
    {
        version: '0.4.12-beta',
        releaseDate: '29 September 2026',
        title: 'Pembaruan Aturan Validasi Password Akun, Penyederhanaan Keterangan & Antarmuka Akun',
        isLatest: false,
        isMajor: false,
        tag: 'Password Security Policy & Account UI Simplification',
        changes: [
            'Aturan Validasi Password Baru: Panjang minimal 4 karakter dan maksimal 12 karakter; mendukung angka saja (PIN numerik), huruf, dan simbol !@#$%^&*_+. tanpa peka huruf besar-kecil (case-insensitive).',
            'Pembaruan Deskripsi Pengaturan Password: Mengubah deskripsi menjadi fokus penguncian akun untuk proteksi login dan pengajuan reset password saat lupa ke admin.',
            'Pembersihan Keterangan & Bantuan Bawah: Menghapus keterangan penyimpanan lokal dan kartu petunjuk lupa password di bagian bawah tab Pengaturan Akun.'
        ]
    },
    {
        version: '0.4.11-beta',
        releaseDate: '29 September 2026',
        title: 'Fitur Pengguna Admin, Tampilan Nama & NIP di Sidebar, dan Penyempurnaan Manajemen Akun Posko',
        isLatest: false,
        isMajor: false,
        tag: 'Admin RBAC, Sidebar Identity & User Management',
        changes: [
            'Tampilan Nama & NIP Pengguna di Sidebar: Menampilkan identitas profil Nama dan NIP pegawai di bilah sisi (sidebar) tepat di bawah logo/judul aplikasi dan di atas menu utama.',
            'Dukungan Dua Kelompok Pengguna (Role-Based Access Control): Memisahkan hak akses antara 1. Admin dan 2. End-User.',
            'Dashboard Administrator Terpadu: Menyediakan panel khusus admin berisi 4 sub-menu: 1. Daftar Pengguna (Reset Password langsung mengosongkan password, Tambah, Edit, Hapus, Nonaktifkan, dan Otoritas Pengguna); 2. Salin Jadwal Massal untuk seluruh pengguna dan non-pengguna (posko luar untuk statistik); 3. Sesi Pengguna dengan tampilan kartu lipat (folded page / accordion per user); 4. Role Otoritas.',
            'Penataan Ulang & Klarifikasi Label Nama: Menyertakan label "Nama" dan "NIP" secara eksplisit dan rapi pada daftar pengguna di Dashboard Admin dan tab Akun.',
            'Deteksi Geografis & Sesi Riil: Menggunakan deteksi lokasi riil berbasis timezone & jaringan serta membersihkan log simulasi/shift.'
        ]
    },
    {
        version: '0.4.10-beta',
        releaseDate: '29 September 2026',
        title: 'Penataan Ulang Sub Menu Pengaturan: Akun, Shift, serta Penggabungan Impor & Reset',
        isLatest: false,
        isMajor: false,
        tag: 'Settings Navigation & Sub-Menu Consolidation',
        changes: [
            'Urutan Sub Menu Pengaturan Baru: Menyusun ulang urutan navigasi tab Pengaturan menjadi 3 bagian utama yang teratur: "Akun" (pertama), "Shift" (kedua), dan "Impor & Reset" (ketiga).',
            'Penggabungan Fitur Impor & Reset: Menggabungkan sub-menu pemulihan berkas cadangan JSON (Impor Data) dan pembersihan data lokal (Reset Data) ke dalam satu tab terpadu.',
            'Optimasi Segmented Tab Control: Menyelaraskan lebar pil geser segmented tab 3-kolom dengan transisi responsif dan kompatibilitas tema penuh.'
        ]
    },
    {
        version: '0.4.9-beta',
        releaseDate: '29 September 2026',
        title: 'Penyempurnaan Deteksi Perangkat, Lokasi, dan Spesifikasi Hardware Komputer',
        isLatest: false,
        isMajor: false,
        tag: 'Device & Location Detection Patch',
        changes: [
            'Deteksi Perangkat Nyata (Live Detection): Membaca secara real-time sistem operasi (Windows 11/10, macOS, Linux, Android, iOS), varian browser, dan form factor perangkat (Desktop, Laptop, Tablet, Mobile).',
            'Resolusi Layar & Rasio Skala: Menampilkan resolusi layar aktif perangkat dan rasio pixel/skalasi monitor secara presisi.',
            'Deteksi Lokasi & Alamat IP Jaringan: Menghubungkan metadata zona waktu (WIB/WITA/WIT) dan pemindaian IP publik/LAN posko secara akurat.',
            'Penamaan & Label Kustom Komputer: Pegawai dapat memberikan label/nama panggilan khusus pada komputer/laptop yang sedang digunakan.',
            'Tombol Pindai Ulang Hardware: Menyediakan tombol refresh untuk memeriksa ulang kondisi koneksi jaringan dan status perangkat secara langsung.'
        ]
    },
    {
        version: '0.4.8-beta',
        releaseDate: '29 September 2026',
        title: 'Fitur Akun Pegawai di Pengaturan, Log Sesi Perangkat, & Halaman Rencana Fitur (Roadmap)',
        isLatest: false,
        isMajor: false,
        tag: 'Account Management & Feature Roadmap',
        changes: [
            'Halaman Akun di Pengaturan: Memindahkan konfigurasi pengguna dari tombol header ke tab "Akun" di menu Pengaturan Aplikasi.',
            'Identitas NIP Pegawai & Password Mandiri: Pengguna dapat mengonfigurasi/mengubah password langsung dari profil tanpa memerlukan password lama.',
            'Log Sesi Perangkat Terhubung (Audit Trail): Menyediakan daftar riwayat perangkat/komputer yang login dengan NIP tersebut yang dapat diketahui oleh Administrator Posko.',
            'Halaman Rencana Fitur (Roadmap): Menyediakan halaman backlog catatan pengembangan terstruktur berdasarkan kelompok kategori fitur (Autentikasi & Akun, Manajemen Shift, Sinkronisasi Cloud, dan Antarmuka).',
            'Koreksi Penomoran Versi: Memperbaiki urutan penomoran versi mayor/minor dari v0.3.99 langsung ke v0.4.0 dan seterusnya secara konsisten.'
        ]
    },
    {
        version: '0.4.7-beta',
        releaseDate: '29 September 2026',
        title: 'Penamaan Ulang Tema "Dashboard" Menjadi "Terang Minimalis"',
        isLatest: false,
        isMajor: false,
        tag: 'Theme Label Rename Patch',
        changes: [
            'Penamaan Ulang Opsi Tema: Mengubah label tampilan tema "Dashboard" menjadi "Terang Minimalis" pada menu dropdown pemilih tema di navbar atas aplikasi.'
        ]
    },
    {
        version: '0.4.6-beta',
        releaseDate: '29 September 2026',
        title: 'Fitur Komponen Tombol User (UserButton) & Modal Profil Akun Pengguna',
        isLatest: false,
        isMajor: false,
        tag: 'UserButton & Account Management',
        changes: [
            'Komponen UserButton pada Header: Menambahkan tombol USER dengan avatar placeholder kosong tepat di sebelah kanan tombol pemilih tema pada header aplikasi.',
            'Dropdown Menu Manajemen Akun: Menyediakan menu popover dropdown interaktif dengan opsi Kelola Akun, Tambah Akun Lain, dan Keluar yang menyesuaikan tema aplikasi aktif.',
            'Modal Profil Pengguna (UserProfile): Menyediakan antarmuka modal terstruktur untuk mengelola profil pengguna, preferensi email, peran hak akses, keamanan sandi, dan sesi perangkat.'
        ]
    },
    {
        version: '0.4.5-beta',
        releaseDate: '29 September 2026',
        title: 'Desain Kartu Profil Shift Terstruktur & Dukungan Tema Lengkap Shift Studio',
        isLatest: false,
        isMajor: false,
        tag: 'Shift Profile Cards & Full Theme Support',
        changes: [
            'Kartu Profil Aturan Shift Terstruktur: Merombak tampilan daftar profil shift dari deretan baris polos menjadi kartu profil berdiri sendiri yang rapi, berbatas tegas, memiliki bayangan halus, dan tata letak tombol aksi serta metadata periode yang presisi.',
            'Dukungan Tema Lengkap Shift Studio: Menerapkan skema warna, font, dan batas kontras secara menyeluruh untuk tema Industrial, Dashboard, Editorial, Technical, PaperSketch, Terang, dan Gelap pada modul konfigurasi shift.',
            'Peningkatan Kerapian Antarmuka Tema Terang: Memastikan profil shift dan petunjuk absensi kantor tampil kontras dan jelas sebagai kartu profil profesional pada tema Terang.'
        ]
    },
    {
        version: '0.4.4-beta',
        releaseDate: '29 September 2026',
        title: 'Peningkatan Tema Industrial & Penerapan Tema Konfigurasi Shift & Checkbox PaperSketch',
        isLatest: false,
        isMajor: false,
        tag: 'Theme Fixes & Checkbox UX Patch',
        changes: [
            'Perbaikan Tampilan Tema Industrial: Menyesuaikan gaya tombol sub-menu di Pengaturan Aplikasi, font, badge, dan kontras komponen pada tema Industrial agar terbaca dengan jelas.',
            'Skala Tipografi Sidebar Industrial: Memperkecil judul "JadwalPriok" dan subtitle "Kalender Kerja" sebesar 40% lebih ringkas agar rasionya presisi dengan komponen UI lain.',
            'Penerapan Tema PaperSketch pada Konfigurasi Shift & Pilih Ikon: Memastikan modal/halaman konfigurasi shift, pemilih ikon, dan sub-halaman menggunakan tema PaperSketch dengan sketsa pensil yang konsisten.',
            'Custom UI/UX Checkbox PaperSketch: Menerapkan gaya animasi kustom checkbox dengan efek rotasi sketsa pensil di seluruh aplikasi khusus untuk tema PaperSketch.'
        ]
    },
    {
        version: '0.4.3-beta',
        releaseDate: '29 September 2026',
        title: 'Pengelompokan Dropdown Tema & Skala Kompak Sidebar Tema Industrial',
        isLatest: false,
        isMajor: false,
        tag: 'Dropdown Grouping & Industrial Scaling Patch',
        changes: [
            'Pengelompokan & Pembatas Dropdown Tema: Membagi opsi tema ke dalam dua kelompok terstruktur ("Tema Final Release": Terang, Gelap, Old Windows, PaperSketch, Winamp dan "Tema dalam Pengembangan": Dashboard, Editorial, Industrial, Technical).',
            'Penamaan Ulang Opsi Tema: Mengubah label "Default" menjadi "Terang" dan "Dark Mode" menjadi "Gelap" untuk konsistensi Bahasa Indonesia.',
            'Skala Kompak Sidebar Tema Industrial: Memperkecil proporsi tipografi judul "JadwalPriok", logo, tag versi, subtitle, header section, dan tombol menu navigasi sidebar pada tema Industrial sebesar 40% agar lebih estetik dan proporsional.'
        ]
    },
    {
        version: '0.4.2-beta',
        releaseDate: '29 September 2026',
        title: 'Penamaan Ulang Tema: Vista Menjadi Old Windows',
        isLatest: false,
        isMajor: false,
        tag: 'Theme Rebranding Patch',
        changes: [
            'Penamaan Ulang Tema Old Windows: Memperbarui nama tampilan tema "Vista" di dropdown pemilih tema pada header navigasi utama menjadi "Old Windows" secara konsisten.'
        ]
    },
    {
        version: '0.4.1-beta',
        releaseDate: '29 September 2026',
        title: 'Perbaikan Tema Industrial, Dropdown Tema Gelap, Ukuran Judul & Sorotan Border Hari Ini',
        isLatest: false,
        isMajor: false,
        tag: 'Theme & UI Refinement Patch',
        changes: [
            'Penerapan Warna Tema Industrial Menyeluruh: Memperbarui sub-menu, toolbar header, komponen dropdown, modal pengaturan, dan modal libur nasional agar konsisten menggunakan skema warna Industrial Systematic (mint teal #2DD4BF & dark slate #1A1D23).',
            'Sistem Kontras Dropdown Tema Gelap: Memperbaiki keterbacaan opsi dropdown (Dashboard, Vista, Editorial, Technical, Paper Sketch) pada tema gelap sehingga seluruh pilihan teks kontras dan terlihat dengan jelas.',
            'Optimasi Ukuran Judul Header & Sidebar: Menyesuaikan proporsi tipografi judul "JadwalPriok" di top navbar dan sidebar desktop agar tidak terlalu besar dan bebas dari truncation pada semua mode tampilan.',
            'Animasi Sorotan Hari Ini (Border Only): Mengisolasi animasi sorotan tanggal hari ini pada tema Dashboard, Editorial, Industrial, dan Technical agar hanya muncul di bagian tepi border kartu (border beam/glow) tanpa mengisi/mewarnai latar belakang kartu.'
        ]
    },
    {
        version: '0.4.0-beta',
        releaseDate: '29 September 2026',
        title: 'Optimasi Konfigurasi Build & Artefak Deployment',
        isLatest: false,
        isMajor: false,
        tag: 'Build & Deployment Artifact Fix',
        changes: [
            'Perbaikan Konfigurasi Output Build: Mengatur konfigurasi build eksplisit di vite.config.ts dengan outDir dist, emptyOutDir true, dan penyisipan manualChunks vendor untuk optimasi ukuran paket.',
            'Sinkronisasi Direktori Output Artefak: Memperbarui skrip build pada package.json agar menghasilkan artefak konsisten di direktori dist dan build secara bersamaan, memastikan kompabilitas penuh saat proses upload artefak deployment.',
            'Optimasi Pembersihan Artefak: Mengamankan skrip clean agar hanya membersihkan folder artefak hasil kompilasi tanpa mengganggu berkas runtime server.'
        ]
    },
    {
        version: '0.3.99-beta',
        releaseDate: '29 September 2026',
        title: 'Penerapan Variasi Desain 6: Industrial Systematic Edition',
        isLatest: false,
        isMajor: false,
        tag: 'Variation 6 - Industrial Systematic Design',
        changes: [
            'Penerapan Tema Baru "Industrial Systematic": Mengintegrasikan estetika dark technical industrial dengan palet deep charcoal (#0F1115), elevated slate surface (#1A1D23), light crisp slate text (#E2E8F0), dan aksen mint teal (#2DD4BF).',
            'Sistem Tipografi Presisi: Menggabungkan Syne (800) untuk display heading logo & nama bulan, JetBrains Mono untuk penomoran tanggal, label metadata, durasi waktu jam kerja, dan lencana shift, serta Inter untuk navigasi dan konten utama.',
            'Grid Kalender Industrial & Lencana Shift Tematik: Sel kalender bergaris batas halus 1px (rgba(226,232,240,0.1)), lencana shift kontras tinggi (SM #83C5BE, TPSL #E29578, OFF #BE1A1A, NPCT #FFDDD2, GRAHA #EDF6F9), dan indikator lembur amber (#F59E0B).',
            'Sidebar & Panel Statistik Terintegrasi: Navigasi modular dengan status aktif teal transparan, bar metrik status piket kompak dengan dot indikator warna tematik, serta dukungan penuh responsive auto-scaling.'
        ]
    },
    {
        version: '0.3.98-beta',
        releaseDate: '29 September 2026',
        title: 'Penerapan Variasi Desain 11: Editorial Clarity Edition',
        isLatest: false,
        isMajor: false,
        tag: 'Variation 11 - Editorial Clarity Design',
        changes: [
            'Penerapan Tema Baru "Editorial Clarity": Mengusung tipografi editorial majalah klasik modern dengan palet warna natural hangat (#fcfbf9), deep charcoal (#1a1a1a), dan aksen spruce teal (#2a7373).',
            'Integrasi Tipografi Editorial Eksklusif: Menggabungkan Cormorant Garamond serif berkarakter miring (italic) untuk heading nama bulan, Geist untuk body text, dan Geist Mono untuk label tanggal, status, dan metrik.',
            'Grid Kalender Editorial Minimalis: Garis tepi halus (fine hairline border 1px), indikator titik status (status dot) piket, kontras tipografi angka tanggal yang elegan, dan lencana shift bernuansa editorial.',
            'Dashboard Ringkasan 4 Kolom: Panel statistik terstruktur rapi dengan tata letak modular 4 kolom, metrik monospasi presisi, dan proporsi responsif pada seluruh ukuran layar.'
        ]
    },
    {
        version: '0.3.97-beta',
        releaseDate: '29 September 2026',
        title: 'Penerapan Variasi Desain 13: Systematic Technical Edition',
        isLatest: false,
        isMajor: false,
        tag: 'Variation 13 - Systematic Technical Design',
        changes: [
            'Penerapan Tema Baru "Systematic Technical": Mengintegrasikan estetika teknis Swiss/Brutalist presisi dengan palet warm parchment (#F8F7F4), deep ink (#111113), dan aksen teal (#0D9488).',
            'Integrasi Tipografi Khusus: Menggabungkan font display Syne (800) untuk judul dan angka metrik besar, JetBrains Mono untuk label metadata dan shift tags, serta Inter untuk teks konten yang sangat mudah dibaca.',
            'Kartu Kalender & Shift Tags Presisi: Mendesain ulang sel kalender dengan batas garis tegas 1.5px, sudut siku bersih (0px radius), serta lencana shift warna tematik (SM teal, TPSL terakota, OFF merah, NPCT, dan GRAHA).',
            'Panel Navigasi & Metrik Ringkasan Teknis: Sidebar kiri dan panel ringkasan kanan dilengkapi label monospasi, nilai statistik tipografi besar, dan navigasi modular yang responsif.'
        ]
    },
    {
        version: '0.3.96-beta',
        releaseDate: '29 September 2026',
        title: 'Perbaikan Konfigurasi Deployment Cloud Run & Otomasi Build Produksi',
        isLatest: false,
        isMajor: false,
        tag: 'Cloud Run Deployment & Health Checks Fix',
        changes: [
            'Otomasi Build Cloud Run (gcp-build & prestart): Menambahkan skrip gcp-build dan prestart pada package.json untuk memastikan direktori /dist selalu dikompilasi secara otomatis sebelum server produksi dijalankan oleh Google Cloud Buildpack.',
            'Penyediaan Endpoint Health Check Mandiri: Menyediakan rute /healthz, /_health, dan /health dengan respon 200 OK pada server.js agar Cloud Run liveness dan readiness probes berhasil secara instan saat inisialisasi kontainer.',
            'Penanganan Routing SPA yang Kokoh: Memastikan fallback index.html tidak melempar pengecualian unhandled error jika proses pembacaan file terganggu dan menyediakan fallback markup HTML yang aman.',
            'Manajemen Siklus Hidup SIGTERM: Mengimplementasikan graceful shutdown handling pada proses Express untuk penyesuaian penskalaan instans Cloud Run tanpa gangguan koneksi.'
        ]
    },
    {
        version: '0.3.95-beta',
        releaseDate: '29 September 2026',
        title: 'Optimasi Kehalusan (Smoothness) Transisi Buka/Tutup Sidebar & Navigasi Header',
        isLatest: false,
        isMajor: false,
        tag: '60fps Butter-Smooth Sidebar Transition',
        changes: [
            'Kurva Akselerasi Hardware (Cubic-Bezier): Menerapkan kelas animasi terdedikasi (.sidebar-transition) dengan kurva cubic-bezier(0.4, 0, 0.2, 1) serta will-change: width, opacity dan contain: layout style untuk eliminasi lag dan stuttering frame.',
            'Efek Geser Menu Selembut Sutra (.sidebar-inner-content): Mengintegrasikan translasi horizontal halus 12px (-translate-x-3) secara sinkron pada konten menu sidebar saat membuka dan menutup untuk sensasi drawer fisik yang sangat responsif.',
            'Stabilitas Posisi Tombol Hamburger: Mengunci margin-right tombol hamburger di header tepat pada 16px secara konsisten sehingga tidak ada pergeseran 2px saat ditekan.',
            'Transisi Lintas Header yang Halus: Menambahkan animasi fade-in pada pergantian nama aplikasi dan breadcrumb halaman saat sidebar diciutkan maupun dimekarkan.'
        ]
    },
    {
        version: '0.3.94-beta',
        releaseDate: '29 September 2026',
        title: 'Penyatuan Terbuka Komponen Sidebar Sampai Atas Tanpa Potongan Garis Horizontal',
        isLatest: false,
        isMajor: false,
        tag: 'Seamless Full-Height Sidebar Surface',
        changes: [
            'Penghapusan Garis Potongan Horizontal pada Sidebar: Menghilangkan border bawah dan warna latar kontras pada area brand header di pucuk DesktopSidebar sehingga sidebar kini tampil utuh, terbuka, dan menyatu alami dari batas paling atas hingga ke bawah.',
            'Penyatuan Visual Logo & Menu Navigasi: Menata integrasi area logo dan judul aplikasi agar mengalir langsung ke bagian menu navigasi tanpa adanya sekat garis yang membuat komponen terlihat terpotong.',
            'Hierarki Antarmuka yang Jernih: Memastikan garis pemisah header utama (TopNavbar) tetap berada di kolom kanan dan bertumpu rapi pada sisi kanan sidebar, menciptakan arsitektur tata letak modern yang bersih dan proporsional.'
        ]
    },
    {
        version: '0.3.93-beta',
        releaseDate: '29 September 2026',
        title: 'Perbaikan Glitch Transisi Buka/Tutup Sidebar & Animasi Transformasi Tombol Close (X)',
        isLatest: false,
        isMajor: false,
        tag: 'Smooth 60fps Sidebar & Button Morphing Fix',
        changes: [
            'Perbaikan Glitch Buka/Tutup Sidebar: Menghilangkan unmount mendadak dengan mempertahankan inner container berukuran tetap dan aside berstatus overflow-hidden, sehingga transisi pelebaran/penyempitan sidebar berjalan selembut tirai tanpa re-flow teks atau flicker.',
            'Perbaikan Animasi Tombol Close (X): Mendesain ulang kalkulasi transform tombol hamburger dengan koordinat titik tengah presisi (transform-origin: center) sehingga baris atas dan bawah menyatu sempurna tepat di tengah membentuk silang "X" tanpa pergeseran diagonal atau subpixel glitch.',
            'Optimasi Hardware-Accelerated Transforms: Menerapkan will-change: transform, opacity dan cubic-bezier(0.4, 0, 0.2, 1) untuk memastikan animasi berjalan konsisten di 60 FPS tanpa jeda frame.',
            'Penghalusan Elemen Header: Menambahkan transisi fade-in mulus saat pergantian antara breadcrumb halaman aktif dan logo aplikasi pada header.'
        ]
    },
    {
        version: '0.3.92-beta',
        releaseDate: '29 September 2026',
        title: 'Penetapan Tombol Hamburger & Animasi Transisi X di Header dengan Jarak Presisi 16px',
        isLatest: false,
        isMajor: false,
        tag: 'Header-Anchored Hamburger Toggle & Precision Spacing',
        changes: [
            'Penetapan Tombol Hamburger di Header: Mengunci posisi tombol hamburger menu secara permanen di baris header (TopNavbar) baik saat sidebar terbuka maupun tersembunyi, dan menghapus tombol toggle dari badan sidebar.',
            'Animasi Transisi Ikon X Mulus: Memanfaatkan morphing dinamis di header di mana tombol bertransformasi menjadi ikon "X" saat sidebar aktif/terbuka dan bertransformasi kembali menjadi 3 garis hamburger saat sidebar tersembunyi.',
            'Jarak Presisi 16px: Menerapkan margin jarak tepat 16px (mr-4) antara tombol hamburger dengan ikon logo dan judul aplikasi di header saat sidebar dalam kondisi tersembunyi.',
            'Konsistensi UI Responsif & Multi-Tema: Memastikan interaksi toggle bekerja selaras pada seluruh 5 tema tampilan tanpa pergeseran tata letak maupun overflow.'
        ]
    },
    {
        version: '0.3.91-beta',
        releaseDate: '29 September 2026',
        title: 'Penataan Ulang Sidebar: Ekstensi Batas Atas Header, Logo & Judul di Sidebar, serta Penyesuaian Lebar Header',
        isLatest: false,
        isMajor: false,
        tag: 'Full-Height Sidebar & Adaptive Header Layout',
        changes: [
            'Ekstensi Sidebar Penuh ke Batas Atas Header: Menata ulang grid desktop sehingga DesktopSidebar membentang vertikal penuh dari batas atas header (tepat di bawah Title Bar) hingga ke dasar layar.',
            'Pemindahan Logo & Nama Aplikasi ke Paling Atas Sidebar: Menempatkan logo aplikasi (AppLogo), nama "JadwalPriok", serta subjudul "Kalender Kerja" pada baris brand header terdedikasi di pucuk sidebar bersama tombol toggle lipat.',
            'Penyesuaian Lebar Header (TopNavbar): Menempatkan header di sisi kanan mendampingi sidebar, sehingga lebarnya secara dinamis mengisi sisa ruang konten yang tersedia tanpa menumpuk atau merusak rasio visual.',
            'Tipografi Breadcrumb Adaptif: Menampilkan indikator halaman aktif (e.g. Workspace / Kalender Kerja) di TopNavbar saat sidebar terbuka, dan menampilkan kembali logo + nama saat sidebar diciutkan atau pada layar seluler.'
        ]
    },
    {
        version: '0.3.90-beta',
        releaseDate: '29 September 2026',
        title: 'Refaktorisasi Arsitektur Kode: Eliminasi Dead Code, Optimasi Performa Render & Aksesibilitas Checkbox',
        isLatest: false,
        isMajor: false,
        tag: 'Clean Architecture & Performance Refactoring',
        changes: [
            'Eliminasi Dead Code & Pembersihan Berkas: Menghapus komponen tak terpakai (MobileFloatingToolsMenu) dan sisa kalkulasi memo props yang tidak lagi dikonsumsi di App.tsx.',
            'Optimasi Render Komponen UI Checkbox: Membungkus komponen Checkbox dengan React.memo untuk mencegah siklus re-render yang tidak perlu saat form induk atau daftar shift diperbarui.',
            'Aksesibilitas & Navigasi Keyboard: Menambahkan styling fokus (:focus-within) dengan outline tematik adaptif pada Checkbox SVG dan Paper Sketch, serta menyetel touch-action: manipulation untuk respon sentuhan instan di seluler.',
            'Integritas UI/UX & Backend: Memastikan seluruh fitur kalender, pengelolaan shift, sistem absensi, ekspor dokumen, dan persistensi LocalStorage tetap bekerja 100% presisi tanpa degradasi visual.'
        ]
    },
    {
        version: '0.3.89-beta',
        releaseDate: '29 September 2026',
        title: 'Penghapusan Menu Tools pada Konfigurasi Shift',
        isLatest: false,
        isMajor: false,
        tag: 'Shift Studio Cleanup & Tools Menu Removal',
        changes: [
            'Pembersihan Toolbar Konfigurasi Shift: Menghapus tombol dan dropdown menu "Alat Edit" (Batalkan/Undo, Kembalikan/Redo, dan Reset Jadwal Bulan Ini) dari daftar shift di menu Konfigurasi Shift sesuai permintaan pengguna.',
            'Optimalisasi Komponen Shift Studio: Merampingkan antarmuka ShiftListView dan ShiftSettingsTab agar fokus murni pada pengelolaan dan kustomisasi profil shift.',
            'Pembersihan Kode & Properti Terkait: Menghapus dependensi ikon serta passing props toolsProps dari hierarki komponen induk secara rapi.'
        ]
    },
    {
        version: '0.3.88-beta',
        releaseDate: '29 September 2026',
        title: 'Komponen UI Checkbox Bertema Adaptif: Animasi SVG (Default/Dark) & Hand-Drawn Sketch (Paper Sketch)',
        isLatest: false,
        isMajor: false,
        tag: 'Theme-Aware Animated Checkbox Suite',
        changes: [
            'Checkbox Animasi SVG (Tema Default & Dark): Mengintegrasikan komponen Checkbox berbasis Styled-Components dengan transisi garis SVG dinamis yang mulus mentransformasi kotak menjadi tanda centang.',
            'Penyelarasan Warna Tema Default & Dark: Menerapkan palet warna stroke kontras tinggi (slate-500/teal-600 untuk tema Default cerah, dan zinc-500/teal-400 untuk tema Dark).',
            'Checkbox Hand-Drawn Sketch (Tema Paper Sketch): Menghadirkan kotak centang sketsa organik dengan bayangan tebal (box-shadow 3.5px), rotasi dinamis saat di-hover, dan efek animasi splash warna oranye menyala saat tercentang.',
            'Integrasi Global di Seluruh Aplikasi: Menerapkan komponen Checkbox terpadu pada konfigurasi sesi ganda Shift Kerja dan panel kriteria Piket & Hari Libur.'
        ]
    },
    {
        version: '0.3.87-beta',
        releaseDate: '29 September 2026',
        title: 'Autoscale Jam Masuk & Pulang Kartu Tanggal Responsif',
        isLatest: false,
        isMajor: false,
        tag: 'Autoscale Attendance Hours & Responsive UI',
        changes: [
            'Autoscale Jam Masuk & Pulang Kartu Tanggal: Menyesuaikan ukuran teks, padding, dan jarak badge jam masuk/pulang secara dinamis dan proporsional seiring melebarnya kartu tanggal di layar tablet, desktop, dan resolusi tinggi.',
            'Tampilan Cerdas pada Layar Ponsel: Mengaktifkan badge jam masuk & pulang secara otomatis pada kartu seluler saat lebar kartu mencukupi (>=350px) dengan format pemisah rentang adaptif.',
            'Format Tipografi Tabular-Nums: Menggunakan pemisahan titik dua dan tanda pisah yang nyaman dibaca dengan font Bell Address berbasis angka tabular untuk keterbacaan presisi tanpa pergeseran tata letak.',
            'Tooltip Detail Jam Kerja Terintegrasi: Menampilkan deskripsi lengkap waktu masuk dan pulang saat pengguna mengarahkan kursor ke atas lencana jam absen.'
        ]
    },
    {
        version: '0.3.86-beta',
        releaseDate: '29 September 2026',
        title: 'Pemindahan Tombol Tools ke Menu Konfigurasi Shift & Akses Langsung Daftar Shift Profil',
        isLatest: false,
        isMajor: false,
        tag: 'Mobile Tools Relocation & Direct Shift List',
        changes: [
            'Pemindahan Tombol Tools Mobile ke Konfigurasi Shift: Menghapus tombol melayang (floating FAB) dari viewport seluler dan memindahkannya menjadi tombol aksi "Alat Edit" terpadu di dalam menu konfigurasi shift / halaman edit shift.',
            'Akses Langsung Daftar Shift Profil: Mengatur menu Konfigurasi Shift agar saat dibuka langsung menampilkan daftar shift di dalam profil shift aktif (Level 2: ShiftListView) tanpa perlu langkah perantara.',
            'Menu Dropdown Alat Jadwal Lengkap: Menyediakan aksi Batalkan (Undo) dengan penghitung langkah, Kembalikan (Redo), dan Reset Jadwal Bulan Ini langsung dari toolbar daftar shift profil.',
            'Optimalisasi Tampilan Mobile: Mencegah tombol melayang menutupi elemen tanggal atau tombol navigasi bawah pada layar ponsel.'
        ]
    },
    {
        version: '0.3.85-beta',
        releaseDate: '28 September 2026',
        title: 'Layar Utama Konfigurasi Shift, Indikator Lembur Multi-Format, Pembersihan DarkFluid & Perbaikan Kontras Dropdown Paper Sketch',
        isLatest: false,
        isMajor: false,
        tag: 'Shift Studio Main Page & Overtime Indicator Fix',
        changes: [
            'Penyetelan Layar Utama ke Konfigurasi Shift: Mengatur halaman utama default aplikasi saat pertama kali dimuat langsung membuka halaman Konfigurasi Shift (Shift Studio).',
            'Perbaikan Indikator Hitungan Lembur: Memperbaiki logika kalkulasi lembur harian agar indikator langsung muncul secara responsif untuk setiap durasi lembur positif.',
            'Format Indikator Lembur Desktop & Seluler: Menampilkan durasi lembur dalam format h.mm pada tampilan desktop dan logo jam berwarna kuning/sesuai tema pada kartu tanggal seluler.',
            'Pembersihan Total Tema DarkFluid: Menghapus seluruh variabel, CSS, dan kode yang berkaitan dengan tema DarkFluid secara permanen dari direktori kode.',
            'Perbaikan Kontras Opsi Paper Sketch di Tema Gelap: Memperbaiki warna teks pilihan Paper Sketch pada menu dropdown pilihan tema agar selalu kontras tajam dan terbaca jelas pada skema tema gelap.'
        ]
    },
    {
        version: '0.3.84-beta',
        releaseDate: '28 September 2026',
        title: 'Floating Radial Tools Menu Mobile & Perbaikan Kontras Tinggi Tema Vista',
        isLatest: false,
        isMajor: false,
        tag: 'Mobile Tools FAB & Vista Contrast',
        changes: [
            'Floating Radial Tools Menu Mobile: Menambahkan tombol melayang (FAB) alat edit di sudut kanan bawah tampilan seluler yang memekarkan tombol aksi Undo, Redo, Reset, dan Salin/Tempel secara radial saat diklik.',
            'Integrasi Desain Radial Theme-Aware: Menyesuaikan animasi rotasi, transisi melayang, dan skema warna tombol alat melayang agar selaras dengan semua pilihan tema (Winamp, Vista, Dark, DarkFluid, Paper Sketch, Default).',
            'Penyempurnaan Kontras Tema Vista: Memperbarui warna teks, tombol navigasi bulan, dan tombol aksi pada tema Vista agar kontras tajam (WCAG AA compliant) dan tidak lagi menyatu/samu dengan latar belakang kaca aero gelap.',
            'Indikator Lencana Langkah Riwayat: Menambahkan indikator jumlah lencana aktif pada tombol alat melayang yang memberikan umpan balik visual instan terkait riwayat perubahan yang dapat dibatalkan.'
        ]
    },
    {
        version: '0.3.83-beta',
        releaseDate: '28 September 2026',
        title: 'Notifikasi Bertingkat Mirrored, Auto-Size Toast, Simpan Aturan Excel, Anti-Truncation & Corner Rounding',
        isLatest: false,
        isMajor: false,
        tag: 'Stacked Notifications & UI Enhancement',
        changes: [
            'Notifikasi In-App Bertingkat (Stacked Notifications): Mengaktifkan sistem notifikasi bertingkat dengan animasi layout shift berbasis Motion di mana notifikasi lama bergeser ke atas secara lembut dengan transisi slide 0.6 detik.',
            'Penghilangan Otomatis 3 Detik (Auto-Dismiss): Setiap kartu notifikasi otomatis menghilang setelah tepat 3 detik sejak pertama kali muncul secara mandiri.',
            'Reposisi Kiri Bawah & Mirrored UI: Memposisikan notifikasi in-app di sudut kiri bawah layar dengan struktur elemen UI yang dicerminkan (tombol dismiss/undo di kiri, status teks di tengah, dan badge centang di kanan) serta aman dari tab bar mobile.',
            'Dimensi Kotak Notifikasi Fleksibel (Auto-Sized): Menyesuaikan lebar kotak notifikasi secara dinamis mengikuti panjang data teks tanpa lebar statis yang kaku.',
            'Pencegahan Pemotongan Teks Judul Versi (Anti-Truncation): Menghilangkan kelas truncate pada judul catatan versi dan menerapkan word-wrapping responsif agar seluruh judul terbaca utuh di semua resolusi layar (mobile, tablet, desktop).',
            'Pengurangan Corner Radius Border Menu Sidebar 40%: Menyesuaikan kehalusan sudut tombol menu navigasi desktop sidebar sebesar 40% lebih tegas dan presisi di semua varian tema.',
            'Tombol Simpan Aturan & Database Pemetaan Excel Sistem: Menyediakan tombol aksi "Simpan Aturan" pada panel pemetaan shift Excel dan mengintegrasikan kamus aturan bawaan sistem (SYSTEM_DEFAULT_EXCEL_MAP).',
            'Penyusutan Corner Radius Kartu Tanggal 70%: Menyesuaikan sudut kartu tanggal kalender pada tema default menjadi lebih proporsional dan padat informasi.'
        ]
    },
    {
        version: '0.3.68-beta',
        releaseDate: '28 September 2026',
        title: 'Ultra-Snug Settings, Theme-Aligned CustomDropdown & Compact Export Menu',
        isLatest: false,
        isMajor: false,
        tag: 'Compact UI & Theme Refinement',
        changes: [
            'Pengecilan & Kompaktifikasi Dropdown Ekspor: Mengurangi lebar modal dialog ekspor menjadi lebih ramping (max-w-[295px]), menyusutkan padding (p-2.5 sm:p-3) serta merampingkan tombol opsi format (PDF, PNG, Excel, JSON) dan ukuran ikon untuk mencegah pemotongan (truncation/clipping) saat diskalakan otomatis.',
            'Optimalisasi Layout Katalog Motif Pola: Memperbaiki grid motif pola menggunakan minmax(60px, 1fr) dan menetapkan tinggi tile statis (h-[50px] sm:h-[56px]) agar tulisan label dan ikon checkmark tidak menumpuk (overlay), terpotong, atau meluap.',
            'Pemutakhiran Warna Pilihan Aktif CustomDropdown: Menambahkan status highlight warna item terpilih (optionSelected) yang adaptif dan lolos uji kontras tinggi pada masing-masing tema (Winamp, Vista, Dark, Light) untuk memproses kegunaan estetika antarmuka.',
            'Penyusutan Kepadatan Form Preferensi Shift: Merampingkan ukuran padding dan margin (p-2) pada menu Preferensi Waktu Kerja (ShiftWorkTimeConfig) dan Kriteria Piket (ShiftPiketTagConfig) agar memprioritaskan tinggi yang lebih pendek demi memaksimalkan ruang layar kecil.'
        ]
    },
    {
        version: '0.3.67-beta',
        releaseDate: '28 September 2026',
        title: 'Seamless Color Picker Theming System',
        isLatest: false,
        isMajor: false,
        tag: 'Theming & Color Picker Integration',
        changes: [
            'Sistem Penyesuaian Tema Color Picker (Theme-Aware Color Picker): Menghapus warna background gelap hardcoded pada studio pemilih warna (ShiftColorStudio) dan mengintegrasikan state observer dinamis untuk mendeteksi perubahan tema global (Default/Light, Dark, Dark Fluid, Vista, Winamp).',
            'Sinkronisasi Desain Kontrol Pemilih Warna: Menambahkan aturan override CSS khusus pada selector .rbgcp-wrapper di index.css untuk menyelaraskan skema warna, input teks, slider, tombol, dan border color picker secara mulus dengan tema aktif.'
        ]
    },
    {
        version: '0.3.66-beta',
        releaseDate: '28 September 2026',
        title: 'Auto-Filling Pattern Grid & Autoscale Protection',
        isLatest: false,
        isMajor: false,
        tag: 'Responsive Grid & Auto-Scaling',
        changes: [
            'Optimalisasi Grid Motif Pola (Auto-Filling): Mengonversi baris kolom grid motif pola menggunakan CSS Grid auto-fill minmax(54px, 1fr) sehingga rasio visual tile motif dapat menyesuaikan ukuran layar secara fleksibel (autoscale) tanpa mengalami kepatuhan truncation, clipping, maupun overflow.'
        ]
    },
    {
        version: '0.3.65-beta',
        releaseDate: '28 September 2026',
        title: 'Reordering Piket Config Toggles for Superior UX Flow',
        isLatest: false,
        isMajor: false,
        tag: 'UX Form Reordering & Logical Sequence',
        changes: [
            'Reposisional Kriteria Piket & Hari Libur: Memindahkan kriteria "Piket Hari Kerja Dengan OFF" ke posisi tengah (di antara "Piket Hari Kerja" dan "Piket Hari Libur / Tanggal Merah") untuk menyajikan alur pemahaman konfigurasi yang lebih runtut dan logis.'
        ]
    },
    {
        version: '0.3.64-beta',
        releaseDate: '28 September 2026',
        title: 'Snug Sidebar Layout, Compact Pattern Tile Grid & Anti-Truncation Flexi-Time Inputs',
        isLatest: false,
        isMajor: false,
        tag: 'UI Spacing & Form Layout Optimization',
        changes: [
            'Optimalisasi Lebar Panel Sidebar Modal Shift: Memperkecil lebar panel sidebar kiri pratinjau dan tab menu konfigurasi agar proporsional dan hemat ruang pada monitor desktop.',
            'Katalog Motif Pola Bebas Overlay: Menghilangkan teks "Polos" ganda pada tile kosong dan memperkecil padding serta ukuran preview motif agar hemat ruang dan bebas tumpang tindih.',
            'Tata Letak Kolom Penamaan Baru: Menata "Nama Lengkap" sejajar dengan "Nama di Badge" di Row 1, serta "Kode Singkat Salin" sejajar dengan "Sublabel Dropdown" di Row 2 dengan deskripsi petunjuk baru.',
            'Input Jam Batas Flexi Bebas Terpotong: Mendesain ulang layout input Batas Flexi Masuk dan Pulang menggunakan list-layout vertikal terkompresi dengan lebar input w-24 yang longgar agar menit jam tidak terpotong oleh browser clock icon.',
            'Peringatan Durasi Kerja Lebih Ringkas: Memperpendek pesan deskripsi total jam kerja pada validator box agar tidak meluber keluar layar pada resolusi laptop kecil.'
        ]
    },
    {
        version: '0.3.63-beta',
        releaseDate: '28 September 2026',
        title: 'Penamaan Badge Shift & Kepatuhan Huruf Kapital Otomatis',
        isLatest: false,
        isMajor: false,
        tag: 'Form Control & Capitalization Rule',
        changes: [
            'Pengubahan Label Konfigurasi Shift: Mengubah label form "Tampilan Kalender" menjadi "Nama di Badge" agar lebih intuitif bagi pengguna.',
            'Kapitalisasi Otomatis Nama di Badge: Menambahkan aturan paksa huruf besar (uppercase) otomatis pada input "Nama di Badge" baik saat mengetik maupun nilai yang disimpan dalam konfigurasi shift.'
        ]
    },
    {
        version: '0.3.62-beta',
        releaseDate: '27 September 2026',
        title: 'Harmonisasi Rasio UI, Font Sans-Serif Jam Lembur/Masuk-Pulang & Caching Model AI',
        isLatest: false,
        isMajor: true,
        tag: 'UI/UX Harmonisasi & Cache Storage AI',
        changes: [
            'Harmonisasi Rasio & Proporsi Ukuran UI (UI Scale Balance): Menyelaraskan proporsi modal popup, color picker target elemen, kartu tanggal, font jam, dan komponen input agar tampil imbang, simetris, dan elegan di seluruh tema.',
            'Font Sans-Serif Tabular Jam Absen & Lembur: Menggunakan font sans-serif tabular (ui-sans-serif, system-ui) dengan ukuran rapat dan presisi untuk jam masuk, jam pulang, dan jam lembur pada kartu tanggal.',
            'Optimalisasi Permanent Cache Model AI Background Removal: Mengintegrasikan Cache Storage browser (caches.open) untuk menyimpan berkas ONNX & WASM secara permanen sehingga proses AI hapus latar belakang gambar instan tanpa unduhan berulang.',
            'Kerapian Popover Color Picker & Studio Motif: Menyempurnakan pemilih warna dengan latar belakang hitam kontras, kontrol opasitas/kepadatan motif yang sinkron dengan Preset CSS, dan area preview sticky pada editor gambar shift.'
        ]
    },
    {
        version: '0.3.09 - 0.3.33 Beta Vers.',
        releaseDate: '26 September 2026',
        title: 'Konsolidasi Fitur & UI: Studio Shift Modern, Tipografi Digital 7-Segment, Highlight Hari Ini & Integrasi Ekspor',
        isLatest: false,
        isMajor: false,
        tag: 'Tahap Rilis Beta',
        changes: [
            'Studio Shift & Pemilih Warna Modern: Pemilih warna melayang dengan tab warna solid, gradien, dan motif pola, panel properti ramping, serta tata letak 2-kolom asimetris untuk konfigurasi shift.',
            'Penataan Formulir Shift Efisien: Input jam masuk/pulang berdampingan, pelestarian huruf kapital pada badge, penataan berdampingan nama badge dan kode singkat, serta tombol pratinjau perangkat bertingkat.',
            'Tipografi Jam Digital 7-Segment: Penerapan font jam digital monospace pada kartu tanggal dan panel presensi dengan perataan tabular yang rapi dan presisi.',
            'Sorotan Animasi Tanggal Hari Ini: Animasi border beam berpendar yang mengitari kartu tanggal hari ini dengan warna adaptif mengikuti tema aktif.',
            'Rasio Kalender & Tata Letak Responsif: Rasio sel kalender proporsional, bilah kontrol kalender ramping satu baris, catatan berjalan marquee, serta keterbacaan teks shift 5 huruf di ponsel tanpa terpotong.',
            'Fitur Ekspor & Pemilih Tanggal Kalender: Integrasi pemilih tanggal interaktif pada tab ekspor, pembatasan gulir menu filter, dan penataan tombol terapkan di bawah pilihan periode.',
            'Manajemen Data Libur Fleksibel: Input teks multi-baris dinamis yang menyesuaikan volume data tempel, parser tanggal multi-format, serta penghapusan data libur permanen dengan modal konfirmasi aman.',
            'Penyelarasan Menu & Elemen Antarmuka: Ikon judul halaman yang seragam dengan navigasi, menu dropdown yang melekat pada tombol pemicu, serta standarisasi tombol aksi pada header.'
        ]
    },
    {
        version: '0.2.64 - 0.2.99 Beta Vers.',
        releaseDate: '25 - 26 September 2026',
        title: 'Konsolidasi Siklus Rilis Beta: Studio Shift, Lembur Otomatis, Theming Terpadu & Optimasi Antarmuka',
        isLatest: false,
        isMajor: false,
        tag: 'Tahap Rilis Beta',
        changes: [
            'Studio Desain Shift & Visual Kustom: Editor kustomisasi warna, gradien, motif garis/titik, serta koleksi 250+ ikon vektor SVG dan 150+ emoji.',
            'Profil & Manajemen Aturan Shift: Pengaturan kelompok shift bertingkat, format tampilan daftar hemat ruang, dan penyesuaian toleransi batas jam flexi.',
            'Kalkulasi Lembur Otomatis: Perhitungan durasi lembur presisi berbasis absensi lengkap, dukungan lintas hari untuk shift malam, serta tampilan info lembur rapi di mobile.',
            'Standarisasi UI & Theming Terpadu: Penyeragaman sudut lengkung 8px, integrasi variabel tema CSS pada modul libur dan pemilih waktu, serta styling khusus tema Winamp.',
            'Optimasi Antarmuka Mobile: Prioritas segmen libur nasional di atas piket, penyederhanaan indikator status, dan penyembunyian menu yang tidak diperlukan.',
            'Penyempurnaan Tooltip & Layering Modal: Penyesuaian arah dan batas viewport tooltip, batas durasi tampil 2 detik, serta pemisahan lapisan modal agar tidak saling menumpuk.',
            'Penyelarasan Layout Kalender Desktop: Skala antarmuka otomatis proporsional, penyesuaian lebar sidebar, dan tampilan teks shift utuh tanpa terpotong.'
        ]
    },
    {
        version: '0.1.0 - 0.2.63 Alpha Vers.',
        releaseDate: '23 - 25 September 2026',
        title: 'Konsolidasi Rilis Alpha: Fondasi Kalender Shift & Multi-Tema',
        isLatest: false,
        isMajor: false,
        tag: 'Tahap Rilis Alpha',
        changes: [
            'Fondasi Kalender Shift Mandiri: Kalender jadwal kerja offline tanpa dependensi server.',
            '5 Tema Dinamis: Dukungan penuh tema Default, Dark, Dark Fluid, Vista, dan Winamp.',
            'Presensi Terpadu: Input jam masuk, jam pulang, absen CEISA, dan catatan harian.',
            'Ekspor Multi-Format: Ekspor jadwal kalender ke dokumen Excel (.xlsx), PDF, dan PNG.',
            'Fitur Libur & Piket: Integrasi hari libur nasional, cuti bersama, dan statistik piket.',
            'Navigasi Cepat: Dukungan gesture swipe mobile, shortcut keyboard, dan auto-scale 1 layar.'
        ]
    },
    {
        version: 'Prototype',
        releaseDate: '08 - 20 September 2026',
        title: 'Prototype',
        isLatest: false,
        isMajor: false,
        tag: 'Fase Prototipe Awal (v1.0.0 – v3.0.0)',
        changes: [
            'v1.0.0 — Fondasi Kalender Shift & Lembur: Kalender shift interaktif (Graha, TPSL, NPCT, SM, PM, Malam, OFF, CUTI), kalkulator otomatis jam lembur (durasi harian ≥ 10,5 jam & dinas tanggal merah), tabel rekapitulasi bulanan, dan penyimpanan lokal (LocalStorage).',
            'v1.1.0 — Produktivitas & Integrasi Kedisiplinan CEISA: Tempel satu baris kode shift Excel sebulan penuh, evaluasi kedisiplinan absen CEISA (Skala 1–4) dengan toleransi shift & saklar Hold Dokumen, manajemen libur nasional CSV/AI, tombol Reset berproteksi Lock & Undo, serta sistem multi-tema awal.',
            'v1.2.0 — Mutasi OFF Geser & Desktop Tauri: Sistem tabungan (+1) dan penarikan (-1) hak libur OFF geser hari kerja, dukungan Surat Tugas (ST) libur pengganti, integrasi aplikasi desktop Tauri dengan WindowTitleBar kustom build timestamp, serta navigasi gesture swipe & pintasan keyboard.',
            'v1.2.1 – v1.2.3 — Cloud Sync Supabase & Android Widget: Sinkronisasi cloud dua arah (Pull & Push) lintas HP Android, laptop/PC, dan browser, modul widget home screen Android harian, serta panduan fitur dan SQL setup interaktif.',
            'v1.2.4 — Ketahanan Sinkronisasi & Android Modern: Graceful schema fallback penanganan payload Supabase (mencegah error 400), kesiapan Android 12+ API 31–35 (receiver & izin widget), dan sinkronisasi konfigurasi versi lintas platform.',
            'Evolusi Hingga v3.0.0 & Rekonstruksi Ulang: Versi prototipe ini sempat terus dikembangkan hingga versi 3.0.0 tanpa pencatatan riwayat perubahan terperinci. Mempertimbangkan performa, modularitas kode, skalabilitas jangka panjang, dan arsitektur visual modern, aplikasi kemudian dibangun ulang secara terstruktur dari awal (ground-up rewrite) mulai versi 0.1.0-alpha.'
        ]
    }
];

interface VersionViewProps {
    theme?: AppTheme;
}

const getMonthYear = (dateStr: string): string => {
    const parts = dateStr.trim().split(' ');
    if (parts.length >= 2) {
        const year = parts[parts.length - 1];
        const month = parts[parts.length - 2];
        return `${month} ${year}`;
    }
    return 'Lainnya';
};

export const VersionView: React.FC<VersionViewProps> = ({ theme = 'default' }) => {
    const isWinamp = theme === 'winamp';
    const isDark = theme === 'dark';
    const isVista = theme === 'vista';
    const isPaperSketch = theme === 'paperSketch';
    const isDefault = theme === 'default';
    const isIndustrial = theme === 'industrial';
    const isTechnical = theme === 'technical';
    const isEditorial = theme === 'editorial';
    const isDashboard = theme === 'dashboard';

    // Pagination: Start with first 10 items (or latest releases)
    const [visibleLimit, setVisibleLimit] = useState<number>(10);

    // Track open/collapsed state of each version card
    const [openVersions, setOpenVersions] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        VERSION_HISTORY.forEach((item, idx) => {
            initial[item.version] = idx === 0; // Only latest version is expanded by default
        });
        return initial;
    });

    const toggleVersion = (v: string) => {
        setOpenVersions((prev) => ({
            ...prev,
            [v]: !prev[v],
        }));
    };

    const visibleVersions = useMemo(() => {
        return VERSION_HISTORY.slice(0, visibleLimit);
    }, [visibleLimit]);

    // Grouping by Month and Year
    const groups = useMemo(() => {
        const map = new Map<string, VersionItem[]>();
        visibleVersions.forEach((item) => {
            const key = getMonthYear(item.releaseDate);
            if (!map.has(key)) {
                map.set(key, []);
            }
            map.get(key)!.push(item);
        });
        return Array.from(map.entries()).map(([monthYear, items]) => ({
            monthYear,
            items,
        }));
    }, [visibleVersions]);

    const allExpanded = visibleVersions.every((item) => openVersions[item.version]);

    const toggleAll = () => {
        const newState = !allExpanded;
        const updated: Record<string, boolean> = { ...openVersions };
        visibleVersions.forEach((item) => {
            updated[item.version] = newState;
        });
        setOpenVersions(updated);
    };

    const hasMore = visibleLimit < VERSION_HISTORY.length;
    const handleLoadMore = () => {
        setVisibleLimit((prev) => Math.min(prev + 15, VERSION_HISTORY.length));
    };

    return (
        <div className="space-y-4 sm:space-y-5 pb-12 animate-in fade-in duration-200 select-none">
            {/* Header Card Halaman Versi - Clean & Minimal Design */}
            <div
                className={`p-4 sm:p-5 transition-all duration-200 shadow-xs border ${
                    isPaperSketch
                        ? 'rounded-xl bg-white border-2 border-[#2b2b2b] text-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b]'
                        : isWinamp
                        ? 'rounded-none bg-[#191919] border-2 border-zinc-700 text-[#00FF00] font-mono shadow-[2px_2px_0_#000]'
                        : isIndustrial
                        ? 'rounded-[8px] bg-[#1A1D23] border-[rgba(226,232,240,0.15)] text-[#E2E8F0] font-[\'JetBrains_Mono\']'
                        : isDark
                        ? 'rounded-lg bg-[#1E1E1E] border-slate-800 text-[#E0E0E0]'
                        : isVista
                        ? 'rounded-lg bg-white/90 backdrop-blur-md border-sky-200 text-slate-900'
                        : isDashboard
                        ? 'rounded-lg bg-[#FFF5D0] border-[#4D2A00]/25 text-[#4D2A00]'
                        : 'rounded-lg bg-white border-slate-200 text-slate-800'
                }`}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center space-x-3">
                        <div
                            className={`p-2 shrink-0 ${
                                isPaperSketch
                                    ? 'rounded-lg bg-[#ff4747] text-white border-2 border-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                                    : isWinamp
                                    ? 'rounded-none bg-black border border-[#00FF00] text-[#00FF00]'
                                    : isDark
                                    ? 'rounded-md bg-slate-800/80 text-blue-400 border border-slate-700'
                                    : isVista
                                    ? 'rounded-md bg-blue-50 text-blue-600 border border-blue-200'
                                    : isDashboard
                                    ? 'rounded-md bg-[#FFF0BE] text-[#4D2A00] border border-[#4D2A00]/30'
                                    : 'rounded-md bg-teal-50 text-teal-700 border border-teal-200'
                            }`}
                        >
                            {isWinamp ? (
                                <Terminal className="h-5 w-5" />
                            ) : (
                                <History className="h-5 w-5" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <h2 className={`text-base sm:text-lg font-black tracking-tight ${isPaperSketch ? 'font-[\'Gochi_Hand\'] text-xl' : ''}`}>
                                    Riwayat Perkembangan Versi
                                </h2>
                                <span
                                    className={`px-2 py-0.5 text-xs font-mono font-bold ${
                                        isPaperSketch
                                            ? 'rounded-md bg-[#2ec4b6] text-[#2b2b2b] border border-[#2b2b2b] shadow-[1px_1px_0px_#2b2b2b]'
                                            : isWinamp
                                            ? 'rounded-none bg-[#00FF00] text-black'
                                            : isDark
                                            ? 'rounded-md bg-slate-800 text-slate-300 border border-slate-700'
                                            : isVista
                                            ? 'rounded-md bg-blue-50 text-blue-700 border border-blue-200'
                                            : isDashboard
                                            ? 'rounded-md bg-[#4D2A00] text-[#FFF9E6] border border-[#4D2A00]'
                                            : 'rounded-md bg-slate-100 text-slate-700 border border-slate-200'
                                    }`}
                                >
                                    v{APP_VERSION}
                                </span>
                            </div>
                            <p
                                className={`text-xs mt-0.5 font-medium ${
                                    isPaperSketch
                                        ? 'text-[#2b2b2b]/70 font-mono'
                                        : isWinamp
                                        ? 'text-[#00FF00]/80 font-mono'
                                        : isDark
                                        ? 'text-slate-400'
                                        : isVista
                                        ? 'text-slate-600'
                                        : 'text-slate-500'
                                }`}
                            >
                                Catatan pembaruan, evolusi fitur, dan siklus rilis bertahap aplikasi JadwalPriok.
                            </p>
                        </div>
                    </div>

                    <div
                        className={`px-3 py-1.5 text-xs font-semibold border self-start sm:self-auto shrink-0 ${
                            isPaperSketch
                                ? 'rounded-lg bg-[#f2efeb] border-2 border-[#2b2b2b] text-[#2b2b2b] shadow-[2px_2px_0px_#2b2b2b]'
                                : isWinamp
                                ? 'rounded-none bg-black border-[#00FF00] text-[#00FF00] font-mono'
                                : isDark
                                ? 'rounded-md bg-slate-900 border-slate-800 text-slate-400'
                                : isVista
                                ? 'rounded-md bg-blue-50/80 border-blue-200 text-blue-900'
                                : 'rounded-md bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                    >
                        <div className="text-[9px] uppercase font-bold tracking-wider opacity-75">Build Runtime</div>
                        <div className="font-mono font-bold text-xs">{BUILD_TIMESTAMP}</div>
                    </div>
                </div>
            </div>

            {/* Quick Action Bar: Buka Semua / Lipat Semua & Count */}
            <div className="flex items-center justify-between px-1 text-xs">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Menampilkan {visibleVersions.length} dari {VERSION_HISTORY.length} Rilis Versi
                </span>
                <button
                    type="button"
                    onClick={toggleAll}
                    className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer border ${
                        isWinamp
                            ? 'rounded-none bg-black border-zinc-700 text-[#00FF00] hover:bg-zinc-900'
                            : isDark
                            ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                            : isVista
                            ? 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    <ChevronsUpDown className="w-3.5 h-3.5" />
                    <span>{allExpanded ? 'Lipat Semua' : 'Buka Semua'}</span>
                </button>
            </div>

            {/* Timeline Daftar Versi Dikelompokkan per Bulan (Accordion Style) */}
            <div className="space-y-6">
                {groups.map((group) => (
                    <div key={group.monthYear} className="space-y-2.5">
                        {/* Monthly Grouping Sub-heading / Divider */}
                        <div className="flex items-center gap-3 pt-1 pb-0.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                <span>{group.monthYear}</span>
                            </div>
                            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                {group.items.length} versi
                            </span>
                        </div>

                        {/* Accordion Cards for this Month */}
                        <div className="space-y-2">
                            {group.items.map((item) => {
                                const isOpen = Boolean(openVersions[item.version]);
                                return (
                                    <div
                                        key={item.version}
                                        id={`version-card-${item.version.replace(/\./g, '-')}`}
                                        className={`border transition-all duration-200 overflow-hidden ${
                                            isPaperSketch
                                                ? 'rounded-xl bg-white border-2 border-[#2b2b2b] text-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
                                                : isWinamp
                                                ? 'rounded-none bg-[#191919] border-2 border-zinc-700 text-[#00FF00] font-mono shadow-[2px_2px_0_#000]'
                                                : isIndustrial
                                                ? 'rounded-[6px] bg-[#1A1D23] border-[rgba(226,232,240,0.12)] text-[#E2E8F0] shadow-xs hover:border-[#2DD4BF]/40 font-[\'JetBrains_Mono\']'
                                                : isDark
                                                ? 'rounded-lg bg-[#1E1E1E] border-slate-800 text-[#E0E0E0] shadow-xs hover:border-slate-700'
                                                : isVista
                                                ? 'rounded-lg bg-white/80 backdrop-blur-md border-sky-200/80 text-slate-900 shadow-xs hover:border-sky-300'
                                                : isDashboard
                                                ? 'rounded-lg bg-[#FFF5D0] border-[#4D2A00]/25 text-[#4D2A00] shadow-xs hover:border-[#4D2A00]/40'
                                                : 'rounded-lg bg-white border-slate-200 text-slate-800 shadow-xs hover:border-slate-300'
                                        }`}
                                    >
                                        {/* Card Header (Clickable Trigger for Fold/Unfold) */}
                                        <button
                                            type="button"
                                            onClick={() => toggleVersion(item.version)}
                                            className={`w-full text-left p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                                                isPaperSketch
                                                    ? 'hover:bg-[#2ec4b6]/20'
                                                    : isWinamp
                                                    ? 'hover:bg-zinc-900/60'
                                                    : isDark
                                                    ? 'hover:bg-slate-800/40'
                                                    : isVista
                                                    ? 'hover:bg-blue-50/50'
                                                    : isDashboard
                                                    ? 'hover:bg-[#FFF0BE]/60'
                                                    : 'hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                                                {/* Version & Tag Badges Header */}
                                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                                    {/* Subtle Version Badge */}
                                                    <span
                                                        className={`px-2 py-0.5 text-xs font-mono font-bold tracking-tight shrink-0 border ${
                                                            isPaperSketch
                                                                ? 'rounded-md bg-[#ff4747] text-white border-[#2b2b2b] shadow-[1px_1px_0px_#2b2b2b]'
                                                                : isWinamp
                                                                ? 'rounded-none bg-[#00FF00] text-black border-[#00FF00]'
                                                                : isDark
                                                                ? 'rounded-md bg-slate-800 text-slate-200 border-slate-700'
                                                                : isVista
                                                                ? 'rounded-md bg-blue-50 text-blue-800 border-blue-200'
                                                                : isDashboard
                                                                ? 'rounded-md bg-[#4D2A00] text-[#FFF9E6] border-[#4D2A00]'
                                                                : 'rounded-md bg-slate-100 text-slate-800 border-slate-200'
                                                        }`}
                                                    >
                                                        v{item.version}
                                                    </span>

                                                    {/* Subtle Tag Badge */}
                                                    {item.tag && (
                                                        <span
                                                            className={`px-2 py-0.5 text-[10px] font-semibold tracking-wide flex items-center space-x-1 shrink-0 max-w-full border ${
                                                                isPaperSketch
                                                                    ? 'rounded-md bg-[#2ec4b6]/30 text-[#2b2b2b] border-[#2b2b2b]'
                                                                    : isWinamp
                                                                    ? 'rounded-none bg-black text-[#00FF00] border-[#00FF00]'
                                                                    : isDark
                                                                    ? 'rounded-md bg-slate-800/50 text-slate-400 border-slate-700/80'
                                                                    : isVista
                                                                    ? 'rounded-md bg-sky-50 text-sky-800 border-sky-200'
                                                                    : isDashboard
                                                                    ? 'rounded-md bg-[#FFF0BE] text-[#4D2A00] border-[#4D2A00]/30'
                                                                    : 'rounded-md bg-slate-50 text-slate-600 border-slate-200'
                                                            }`}
                                                        >
                                                            <Sparkles className="h-2.5 w-2.5 opacity-70 shrink-0" />
                                                            <span className="truncate">{item.tag}</span>
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Release Title - Takes full available width */}
                                                <h3 className="text-xs sm:text-sm font-bold leading-snug min-w-0 text-balance">
                                                    {item.title}
                                                </h3>
                                            </div>

                                            <div className="flex items-center space-x-2 shrink-0">
                                                <span className="hidden sm:flex items-center space-x-1 text-[11px] opacity-60 font-medium">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{item.releaseDate}</span>
                                                </span>

                                                {item.isLatest && (
                                                    <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        Aktif
                                                    </span>
                                                )}

                                                <div
                                                    className={`p-1 rounded-full transition-transform duration-200 ${
                                                        isOpen ? 'rotate-180' : ''
                                                    }`}
                                                >
                                                    <ChevronDown className="w-4 h-4 opacity-60" />
                                                </div>
                                            </div>
                                        </button>

                                        {/* Foldable Content Container */}
                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    key={`version-content-${item.version}`}
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                                    className="overflow-hidden"
                                                >
                                                    <div
                                                        className={`p-3 sm:p-3.5 pt-0 border-t space-y-2 text-xs sm:text-sm ${
                                                            isWinamp
                                                                ? 'border-zinc-800'
                                                                : isDark
                                                                ? 'border-slate-800'
                                                                : isVista
                                                                ? 'border-sky-100'
                                                                : 'border-slate-100'
                                                        }`}
                                                    >
                                                        <div className="sm:hidden flex items-center justify-between pb-1.5 text-[11px] opacity-60 font-medium border-b border-dashed border-current/20">
                                                            <span>Rilis: {item.releaseDate}</span>
                                                            {item.isLatest && (
                                                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Aktif Digunakan</span>
                                                            )}
                                                        </div>

                                                        <ul className="space-y-1.5 pt-1">
                                                            {item.changes.map((change, cIdx) => (
                                                                <li
                                                                    key={cIdx}
                                                                    className="flex items-start space-x-2 leading-relaxed"
                                                                >
                                                                    <span
                                                                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                                                                            isWinamp
                                                                                ? 'rounded-none bg-[#00FF00]'
                                                                                : isDark
                                                                                ? 'bg-slate-400'
                                                                                : isVista
                                                                                ? 'bg-blue-500'
                                                                                : 'bg-teal-600'
                                                                        }`}
                                                                    />
                                                                    <span className="opacity-90">{change}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
                <div className="pt-2 flex justify-center">
                    <button
                        type="button"
                        onClick={handleLoadMore}
                        className={`px-5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer shadow-xs active:scale-95 ${
                            isWinamp
                                ? 'rounded-none bg-black border-[#00FF00] text-[#00FF00] hover:bg-zinc-900'
                                : isDark
                                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                                : isVista
                                ? 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                                : isDashboard
                                ? 'bg-[#FFF0BE] text-[#4D2A00] border-[#4D2A00]/30 hover:bg-[#FFF5D0]'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        Muat Riwayat Lama ({VERSION_HISTORY.length - visibleLimit} rilis tersisa)
                    </button>
                </div>
            )}
        </div>
    );
};

export default VersionView;
