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
        version: '0.4.16-beta',
        releaseDate: '29 September 2026',
        title: 'Responsivitas Judul Tema Industrial, Integrasi 120 Profil Pegawai, dan Perapihan Form Admin',
        isLatest: true,
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
            'Dashboard Administrator Terpadu: Menyediakan panel khusus admin berisi 4 sub-menu: 1. Daftar Pengguna (Reset Password langsung mengosongkan password, Tambah, Edit, Hapus, Nonaktifkan, dan Otoritas Pengguna); 2. Salin Jadwal Massal untuk seluruh pengguna dan non-pengguna (posko luar untuk statistik); 3. Sesi Pengguna dengan tampilan kartu lipat (folded page / accordion per user); 4. Profil Otoritas.',
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
