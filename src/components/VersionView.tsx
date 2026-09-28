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
        version: '0.3.62-beta',
        releaseDate: '27 September 2026',
        title: 'Harmonisasi Rasio UI, Font Sans-Serif Jam Lembur/Masuk-Pulang & Caching Model AI',
        isLatest: true,
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
        version: '0.3.33-beta',
        releaseDate: '26 September 2026',
        title: 'Integrasi Custom Popover Color Picker (Figma Style) & Sleek Property Panel',
        isLatest: false,
        isMajor: false,
        tag: 'UI/UX Modern Color Picker & Property Panel',
        changes: [
            'Komponen CustomColorPicker (src/components/shift-studio/CustomColorPicker.tsx): Membuat pemilih warna melayang modern bergaya Figma/Webflow dengan tab Solid, Gradien, dan Motif, area canvas gradien, slider hue pelangi, slider opasitas, input Hex & %, serta palet cepat.',
            'Sleek Property Panel: Merombak modal utama Konfigurasi Shift menjadi panel properti ringkas dengan tombol Color Swatches (Latar Shift, Teks, Garis Tepi) yang memanggil CustomColorPicker secara melayang.',
            'Eliminasi Native Input Color: Menyingkirkan input warna bawaan browser untuk pengalaman UI profesional dan konsisten di seluruh platform.'
        ]
    },
    {
        version: '0.3.32-beta',
        releaseDate: '26 September 2026',
        title: 'Revamp Layout Modal Konfigurasi Shift Asimetris 2-Kolom & Pelestarian Kapitalisasi Teks',
        isLatest: false,
        isMajor: false,
        tag: 'UI/UX Layout Revamp & Badge Casing',
        changes: [
            'Revamp Modal Konfigurasi Shift 2 Kolom Asimetris: Mengubah tata letak tab "Desain Visual" pada modal Konfigurasi Shift menjadi dua kolom rapat (45% : 55%) tanpa perlu scroll ke bawah.',
            'Kolom Kiri Ramping: Memposisikan Pratinjau Live Badge, Pemilih Warna Latar, dan Opacity Slider secara vertikal rapat di sebelah kiri.',
            'Kolom Kanan Katalog Motif & Ikon: Menata ulang katalog motif pola menjadi grid Ramping 2-kolom, tombol unggah gambar kustom, dan pemicu pemilih ikon SVG di sebelah kanan.',
            'Pelestarian Kapitalisasi Teks (Case Preservation): Mengizinkan input huruf kapital campuran/sebagian/sepenuhnya pada Tampilan Kalender (displayBadge) dan mempertahankan format casing asli pada badge kartu tanggal.'
        ]
    },
    {
        version: '0.3.31-beta',
        releaseDate: '26 September 2026',
        title: 'Penyelarasan Konsistensi Tema, Ikon Judul Halaman, & Tipografi Sistem',
        isLatest: false,
        isMajor: false,
        tag: 'UI/UX System & Theme Consistency',
        changes: [
            'Konsistensi Ikon Judul Halaman: Menambahkan dan menyelaraskan ikon visual pada setiap judul halaman utama (Kalender Kerja, Daftar Hari Libur, Pengaturan Aplikasi, dan Catatan Versi) agar identik dengan menu navigasi.',
            'Penerapan Tema Terpadu: Memperbaiki kontras warna, border, dan kontainer elemen UI di seluruh tema (Default, Dark, Vista, Winamp, DarkFluid) agar tampil harmonis dan konsisten.',
            'Penataan Tipografi & Font Khusus: Menjaga kerapian hierarki font sans utama sembari melestarikan font digital jam (.font-digital-7), font terminal hijau catatan versi (font-mono), dan gaya badge shift.'
        ]
    },
    {
        version: '0.3.30-beta',
        releaseDate: '26 September 2026',
        title: 'Penetapan Tampilan Dropdown Murni untuk Fitur Lihat Shift Profil',
        isLatest: false,
        isMajor: false,
        tag: 'UI/UX Dropdown Consistency',
        changes: [
            'Dropdown Murni Anchored: Menetapkan tampilan "Lihat Shift" pada profil aturan shift sebagai dropdown murni yang melekat langsung ke tombol pemicu (anchored), tanpa menggunakan modal popup atau backdrop layar penuh.',
            'Kalkulasi Batas Viewport Pintar: Mengatur batas tinggi maksimal (max-height) dan arah buka otomatis (atas/bawah) agar daftar shift dapat digulir dengan mulus dan tidak terpotong tepi layar.'
        ]
    },
    {
        version: '0.3.29-beta',
        releaseDate: '26 September 2026',
        title: 'Penataan Bertingkat Tombol Pratinjau Perangkat di Samping Kotak Badge',
        isLatest: false,
        isMajor: false,
        tag: 'UI Shift Studio & Layout Refinement',
        changes: [
            'Tombol Pratinjau Perangkat Bertingkat: Memposisikan tombol beralih tampilan Desktop dan Mobile secara bertingkat (atas-bawah) di sisi kanan kotak pratinjau badge.',
            'Area Pratinjau Lebih Lega: Memberikan ruang horizontal (flex-1) yang lebih lega bagi kartu badge shift agar nama, ikon, dan kode salin tampil leluasa tanpa desak-desakan.'
        ]
    },
    {
        version: '0.3.28-beta',
        releaseDate: '26 September 2026',
        title: 'Optimalisasi Layout Shift Berdampingan, Pembersihan Penomoran & Teks 5 Huruf Mobile',
        isLatest: false,
        isMajor: false,
        tag: 'UI/UX Mobile & Form Layout',
        changes: [
            'Pencegahan Overflow Teks Shift 5 Huruf: Menyesuaikan skala tipografi, tracking huruf, dan visibilitas ikon pada kata shift 5 huruf (seperti GRAHA, MALAM) di tampilan mobile agar teks pas sempurna di dalam kotak tanpa disingkat.',
            'Tata Letak Berdampingan Tampilan Kalender & Kode Singkat: Menata input form "Tampilan Kalender" dan "Kode Singkat Salin" pada pengaturan shift menjadi 2 kolom berdampingan (kiri - kanan) pada seluruh resolusi layar.',
            'Pembersihan Penomoran Form: Menghilangkan angka penomoran prefix (1., 2., 3.) pada judul form pengaturan shift agar desain lebih bersih, minimalis, dan modern.'
        ]
    },
    {
        version: '0.3.27-beta',
        releaseDate: '26 September 2026',
        title: 'Penataan Berdampingan (Kiri-Kanan) Jam Masuk & Jam Pulang Dasar',
        isLatest: false,
        isMajor: false,
        tag: 'UI Layout & Form Optimization',
        changes: [
            'Tata Letak Berdampingan (2 Kolom): Mengubah form input "Jam Masuk Dasar" dan "Jam Pulang Dasar" pada konfigurasi shift agar selalu tampil berdampingan (kiri - kanan) pada layar HP/mobile maupun desktop.',
            'Penghematan Ruang Vertikal Form: Menghilangkan penumpukan baris vertikal (stacking) sehingga form jam kerja lebih ringkas, hemat ruang, dan nyaman diakses tanpa banyak scrolling.',
            'Penyesuaian Tipografi & Input: Menyelaraskan teks label dan font monospace jam digital agar tetap proporsional dan presisi pada layar resolusi kecil.'
        ]
    },
    {
        version: '0.3.26-beta',
        releaseDate: '26 September 2026',
        title: 'Optimalisasi Responsivitas Dropdown Lihat Shift & Pratinjau Badge Kompak',
        isLatest: false,
        isMajor: false,
        tag: 'UI/UX Mobile & Shift Studio',
        changes: [
            'Tampilan Utuh Dropdown Lihat Shift (Mobile): Mengubah dropdown "Lihat Shift" di Profil Aturan Shift menjadi popup modal responsif di layar mobile, memastikan seluruh daftar shift (termasuk OFF, CUTI, dan kustom) tampil penuh tanpa terpotong batas bawah jendela.',
            'Pencegahan Clipping Viewport: Menghitung ketinggian dinamis dan batas atas/bawah secara pintar pada tampilan desktop dan mobile agar tidak melampaui viewport perangkat.',
            'Pratinjau Badge Live Kompak: Memperkecil tinggi section pratinjau badge di modal Edit Shift pada desktop maupun mobile, menghemat lebih dari 50% ruang vertikal sehingga pengaturan warna dan tab langsung terlihat.',
            'Kemudahan Navigasi & Dismiss: Menambahkan tombol tutup (X) serta penutup otomatis saat klik backdrop/luar dan tombol Escape.'
        ]
    },
    {
        version: '0.3.25-beta',
        releaseDate: '26 September 2026',
        title: 'Perbaikan Tampilan Petunjuk Lengkap Salin Shift & Presensi Layar Kecil',
        isLatest: false,
        isMajor: false,
        tag: 'UI Bugfix & Mobile Responsive',
        changes: [
            'Tampilan Petunjuk Utuh (Poin 1 & 2): Memperbaiki petunjuk Salin Shift dan Salin Presensi pada layar kecil agar seluruh poin (poin 1 dan poin 2 serta format didukung) tampil lengkap tanpa terpotong.',
            'Pencegahan Clipping Flexbox: Menambahkan shrink-0 pada kontainer petunjuk agar flexbox tidak menekan/memotong konten petunjuk saat tinggi layar terbatas.',
            'Kontainer Form Scrollable: Menata ulang struktur modal dengan header dan tombol aksi yang tetap tersemat (pinned), serta bodi tengah yang dapat digulir (scrollable) dengan mulus pada layar HP/viewport sempit.',
            'Pengoptimalan Baris Input Textarea: Mengadaptasi tinggi baris input textarea secara responsif (rows=3 pada mobile) untuk memberikan visibilitas maksimal bagi panduan dan pratinjau.'
        ]
    },
    {
        version: '0.3.24-beta',
        releaseDate: '26 September 2026',
        title: 'Pemulihan Tampilan Catatan Kartu Tanggal (Marquee & Border)',
        isLatest: false,
        isMajor: false,
        tag: 'UI Bugfix & Notes Visibility',
        changes: [
            'Restorasi Rasio Sel Kalender (Aspect Square): Mengembalikan rasio 1:1 (aspect-square) pada kartu tanggal desktop dan tablet agar seluruh elemen (tanggal, shift, jam absen, dan catatan) memiliki ruang vertikal yang cukup tanpa terpotong.',
            'Tampilan Catatan Utuh & Berjalan: Memastikan catatan tanggal (MarqueeText) di bagian bawah kartu selalu tampil jelas dengan garis batas atas-bawah dan animasi teks berjalan yang halus.',
            'Dukungan Catatan & Jam Absen di Tampilan Mobile: Menambahkan komponen catatan marquee dan jam absen pada kartu tanggal versi layar ringkas (mobile).',
            'Pencegahan Text Clipping: Menata ulang struktur flexbox dengan shrink-0 pada header dan mt-auto pada bilah catatan sehingga tidak terpotong oleh overflow kontainer.'
        ]
    },
    {
        version: '0.3.23-beta',
        releaseDate: '26 September 2026',
        title: 'Optimalisasi Rasio & Komposisi Tampilan Layar Kecil / Windowed Desktop',
        isLatest: false,
        isMajor: false,
        tag: 'UI/UX Layout Optimization',
        changes: [
            'Rasio Sel Kalender Proporsional: Mengganti rasio kaku aspect-square pada layar desktop/tablet dengan aspect-[1.18/1] yang seimbang, mencegah kotak tanggal terlalu tinggi dan menghilangkan ruang kosong berlebih di dalam kartu.',
            'Toolbar Aksi Kalender Ramping (Compact Mode): Mengoptimalkan Kontrol Kalender di atas grid tanggal dengan desain horizontal satu baris (~32px) tanpa kartu tebal redundan, menghemat ruang vertikal secara drastis.',
            'Eliminasi Transform Scaling Buatan: Menghapus CSS transform: scale() yang sebelumnya membuat teks buram/bergerigi dan merusak rasio elemen pada lebar layar < 1360px.',
            'Sidebar Ramping & Seimbang: Menyelaraskan lebar dan padding desktop sidebar pada breakpoint medium sehingga area kalender mendapatkan ruang horizontal maksimal.'
        ]
    },
    {
        version: '0.3.22-beta',
        releaseDate: '26 September 2026',
        title: 'Perbaikan Rendering & Pendaran BorderBeam Tanggal Hari Ini',
        isLatest: false,
        isMajor: false,
        tag: 'UI Bugfix & Optimization',
        changes: [
            'Optimasi Komponen BorderBeam: Memperbaiki arsitektur pembungkus border beam dengan layer pendaran rotasi ganda dan bloom halo 360 derajat.',
            'Sinkronisasi Prop dateKey: Menghubungkan dateKey secara presisi dari grid kalender ke DayCell untuk deteksi akurat hari ini (today detection).',
            'Pendaran Neon Tajam & Responsif: Efek berkas cahaya kini tampil jelas mengitari kartu tanggal hari ini di semua tema dan ukuran layar.'
        ]
    },
    {
        version: '0.3.21-beta',
        releaseDate: '26 September 2026',
        title: 'Integrasi Border Beam Animated Highlight untuk Hari Ini',
        isLatest: false,
        isMajor: false,
        tag: 'UI Animated Component',
        changes: [
            'Komponen BorderBeam (/components/ui/border-beam.tsx): Mengintegrasikan paket border-beam resmi untuk animasi sorotan bingkai kartu tanggal hari ini.',
            'Adaptasi Tema Dinamis: Efek pendaran beam menyesuaikan warna tema otomatis (Forest neon untuk Winamp, Ocean untuk Vista, Candy untuk Dark/DarkFluid, Colorful untuk Default).',
            'Desain Halus & Elegan: Efek berkilau mengitari kontur kartu tanggal dengan sudut membulat rapi pada mode desktop maupun mobile.'
        ]
    },
    {
        version: '0.3.20-beta',
        releaseDate: '26 September 2026',
        title: 'Penyesuaian Skala Font Jam Digital pada Kartu Tanggal (+0.5px)',
        isLatest: false,
        isMajor: false,
        tag: 'UI Typography Enhancement',
        changes: [
            'Ukuran Font Jam Digital: Meningkatkan ukuran font jam presensi di kartu tanggal sebesar +0.5px (menjadi 10.3px mobile, 10.8px tablet, 11.3px desktop).',
            'Keterbacaan Presisi: Memastikan angka jam digital 7-segment terbaca jelas dan tegas di semua resolusi dan tema.'
        ]
    },
    {
        version: '0.3.19-beta',
        releaseDate: '26 September 2026',
        title: 'Pembaruan Ikon Palet Warna Tema & Pola Dropdown Kustom',
        isLatest: false,
        isMajor: false,
        tag: 'UI Header & Dropdown Pattern',
        changes: [
            'Ikon Palet Warna Tema: Mengganti ikon dinamis tombol tema di header dengan ikon palet warna permanen (Palette) yang lebih representatif.',
            'Pola Dropdown Animatif 300ms: Memperbarui CustomDropdown dengan transisi slide mulus, rotasi panah -90deg ke 0deg, dan penataan sudut rounded-5px.',
            'Solid Opaque Theming: Menjamin latar dropdown selalu solid tanpa tembus pandang pada seluruh tema aplikasi.'
        ]
    },
    {
        version: '0.3.18-beta',
        releaseDate: '26 September 2026',
        title: 'Penerapan Font Digital-7 Regular pada Jam Kartu Tanggal',
        isLatest: false,
        isMajor: false,
        tag: 'Tipografi & Digital-7 Regular',
        changes: [
            'Font Digital-7 Regular: Mengintegrasikan varian Digital-7 Regular standar 7-segment (font-weight: 400 normal).',
            'Override Protection: Menambahkan proteksi CSS spesifisitas tinggi agar font jam digital pada kartu tanggal tidak tertimpa oleh tema sistem.',
            'Presensi Multi-Tema: Memastikan font Digital-7 tampil optimal di semua mode tema (Winamp, Vista, Dark, DarkFluid, Default).'
        ]
    },
    {
        version: '0.3.17-beta',
        releaseDate: '26 September 2026',
        title: 'Penerapan Font Digital Mono-7 Segment pada Kartu Tanggal',
        isLatest: false,
        isMajor: false,
        tag: 'Tipografi & Digital 7-Segment',
        changes: [
            'Font Digital Mono-7 (DSEG7 & Digital-7): Menginstal dan mengintegrasikan font 7-segment monospace asli (@fontsource/dseg7-modern, classic, dan Digital-7 Mono).',
            'Tampilan Jam Presensi Kartu: Mengubah font jam masuk-pulang di bawah shift kalender menjadi font digital 7-segment yang presisi dan autentik.',
            'Letter-Spacing & Tabular Alignment: Mengatur proporsi letter-spacing 0.08em agar angka jam dan titik dua sejajar rapi tanpa bergeser.',
            'Optimasi Offline & Desktop: Paket font terbundel lokal memastikan tampilan digital clock aktif sempurna tanpa ketergantungan koneksi internet.'
        ]
    },
    {
        version: '0.3.16-beta',
        releaseDate: '26 September 2026',
        title: 'Font Jam Digital pada Kartu Tanggal & Panel Presensi',
        isLatest: false,
        isMajor: false,
        tag: 'Tipografi & Visual Presensi',
        changes: [
            'Font Jam Digital LCD: Mengintegrasikan font jam digital (Orbitron, Share Tech Mono, Chakra Petch) dengan dukungan tabular-nums.',
            'Badge Presensi Bawah Shift: Mengganti font teks jam masuk-pulang (M: HH:mm / P: HH:mm / HH:mm - HH:mm) di bawah shift kartu tanggal menjadi tampilan jam digital yang tajam dan kontras.',
            'Penyesuaian Multi-Tema: Tampilan glow hijau retro pada tema Winamp, dark-neon pada tema Dark/DarkFluid, serta kartu kristal pada tema Vista dan Default.',
            'Konsistensi Input Presensi: Menerapkan font digital clock pada tombol dan input Jam Masuk, Pulang, dan Absen CEISA di kartu detail dan picker.'
        ]
    },
    {
        version: '0.3.15-beta',
        releaseDate: '26 September 2026',
        title: 'Modernisasi Tombol Aksi Header (Ekspor & Pemilih Tema)',
        isLatest: false,
        isMajor: false,
        tag: 'UI Header & UX Navigasi',
        changes: [
            'Standarisasi Ikon Dropdown: Mengubah arah panah tombol pemilih tema dari chevron-right menjadi chevron-down untuk menandakan aksi dropdown ke bawah.',
            'Dimensi Seragam: Menyamakan tinggi tombol (h-9), padding horizontal (px-3), dan perataan vertikal presisi.',
            'Estetika Minimalis: Menerapkan garis tepi halus border-gray-200 dark:border-gray-700 dengan transisi warna hover yang mulus.',
            'Kontras Warna Ikon: Ikon tema dan unduh mengonsumsi variabel tema aktif sehingga kontras terjaga optimal di mode terang dan gelap.'
        ]
    },
    {
        version: '0.3.14-beta',
        releaseDate: '26 September 2026',
        title: 'Pembatasan Scroll & Z-Index Dropdown Filter Bulan/Tahun',
        isLatest: false,
        isMajor: false,
        tag: 'Dropdown & Stacking Context',
        changes: [
            'Batas Tinggi Maksimal (Max-Height): Menambahkan kelas max-h-60 overflow-y-auto pada menu dropdown pemilih bulan & tahun di modal Ekspor agar tidak meluber ke bawah.',
            'Latar Belakang Solid & Bayangan Tebal: Memberikan background solid 100% opaque dengan shadow-2xl ring-1 dan garis tepi halus agar tidak tembus pandang.',
            'Elevasi Lapisan Z-Index: Memastikan pembungkus menu opsi melayang memiliki z-[99999] dan container induk memiliki relative z-50.',
            'Pembersihan Overflow: Memastikan kontainer induk modal bebas dari pemotongan visual overflow-hidden.'
        ]
    },
    {
        version: '0.3.13-beta',
        releaseDate: '26 September 2026',
        title: 'Integrasi Komponen Custom DatePicker pada Tab Ekspor',
        isLatest: false,
        isMajor: false,
        tag: 'DatePicker & Filter Ekspor',
        changes: [
            'Penggantian Input Tanggal: Menggantikan input HTML date bawaan browser dengan modal/popover CustomDatePicker kustom aplikasi.',
            'Navigasi Interaktif: Memungkinkan pemilihan tanggal awal dan akhir dengan kalender interaktif, navigasi bulan/tahun cepat, dan preset rentang.',
            'Desain Responsif Terpadu: Popover datepicker menyesuaikan posisi secara pintar pada layar mobile dan desktop tanpa terpotong batas modal.'
        ]
    },
    {
        version: '0.3.12-beta',
        releaseDate: '26 September 2026',
        title: 'Penyesuaian Tata Letak Rentang Periode & Kuartal Ekspor',
        isLatest: false,
        isMajor: false,
        tag: 'UX Form & Layout',
        changes: [
            'Posisi Tombol Terapkan: Memindahkan tombol aksi "Terapkan Pilihan" ke bagian luar dan di bawah kotak pilihan kuartal/semester.',
            'Status Default Folded: Mengatur panel kuartal dan semester dalam keadaan terlipat (collapsed) secara default saat modal dibuka.',
            'Penyelarasan Rentang Tanggal: Mengelompokkan input rentang tanggal dan tombol pintasan "Bulan Ini" & "30 Hari Terakhir" secara rapi dengan tombol terapkan di bagian bawah.'
        ]
    },
    {
        version: '0.3.11-beta',
        releaseDate: '26 September 2026',
        title: 'Penghapusan Data Libur Permanen & Mutlak',
        isLatest: false,
        isMajor: false,
        tag: 'Manajemen Data Libur',
        changes: [
            'Hapus Baris Permanen: Tombol hapus data libur kini menghapus entri libur secara tuntas dari state dan penyimpanan lokal (bukan sekadar menonaktifkan).',
            'Modal Konfirmasi Aman: Menampilkan konfirmasi interaktif sebelum penghapusan data libur permanen untuk mencegah ketidaksengajaan.',
            'Sinkronisasi Kalender Seketika: Penanda hari libur pada grid kalender langsung diperbarui seketika setelah data dihapus.'
        ]
    },
    {
        version: '0.3.10-beta',
        releaseDate: '26 September 2026',
        title: 'Area Teks Multi-Baris Dinamis & Parser CSV Libur Fleksibel',
        isLatest: false,
        isMajor: false,
        tag: 'CSV Importer & Form UX',
        changes: [
            'Textarea Auto-Grow: Mengganti input single-line dengan textarea dinamis yang bertambah tinggi otomatis mengikuti volume baris data yang ditempel (paste).',
            'Format Multi-Baris Utuh: Mempertahankan struktur baris-demi-baris dari file spreadsheet tanpa memanjang ke kanan atau merusak format.',
            'Parser Multi-Format Tanggal: Mendukung format tanggal Indonesia DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY, serta standar internasional YYYY-MM-DD.',
            'Dukungan Delimiter Lengkap: Mampu memproses pemisah tab (Excel), koma, dan titik koma secara otomatis.'
        ]
    },
    {
        version: 'v.0.3.09',
        releaseDate: '26 September 2026',
        title: 'Peningkatan Lapisan Z-Index Dropdown Ekspor Header',
        isLatest: false,
        isMajor: false,
        tag: 'Layout Stacking & Overlay',
        changes: [
            'Elevasi Menu Ekspor: Menetapkan z-index dropdown menu Ekspor menjadi z-[9999] di atas seluruh elemen header dan tabel kalender.',
            'Fixed Backdrop Klik Luar: Menambahkan layer penangkap klik luar z-[9998] transparan yang menutup menu dengan mulus saat pengguna mengklik area luar.'
        ]
    },
    {
        version: '0.2.99-beta',
        releaseDate: '26 September 2026',
        title: 'Modernisasi UI Kelola Libur & Konsolidasi Catatan Versi',
        isLatest: false,
        isMajor: false,
        tag: 'UI Libur & Data Changelog',
        changes: [
            'Border Radius 8px: Menyeragamkan sudut modul Kelola Libur menjadi rounded-lg konsisten.',
            'Theming CSS Dinamis: Tombol aksi libur terhubung langsung ke variabel tema aktif.',
            'Palet Ramah Dark Mode: Mengatur opasitas penanda libur agar tidak menyilaukan saat tema gelap.',
            'Reduksi Visual Noise: Indikator status lebih subtil dan tombol hapus berubah abu-abu muted.',
            'Konsolidasi Alpha: Merangkum seluruh catatan versi 0.1.0 s.d 0.2.63 menjadi satu rilis ringkas.'
        ]
    },
    {
        version: '0.2.98-beta',
        releaseDate: '26 September 2026',
        title: 'Hierarki Z-Index & Portal Modal Salin Jadwal',
        isLatest: false,
        isMajor: false,
        tag: 'Z-Index & Modal Portal',
        changes: [
            'React Portal Modal Salin: Merender modal Salin Jadwal via portal bebas batasan z-index.',
            'Pemisahan Lapisan: Backdrop z-[99998] dan dialog modal mengambang pada z-[99999].',
            'Normalisasi Z-Index: Menjaga toolbar dan header tetap pada lapisan z-index stabil.'
        ]
    },
    {
        version: '0.2.97-beta',
        releaseDate: '26 September 2026',
        title: 'Theming Variabel CSS & Desain Bersih Time Picker',
        isLatest: false,
        isMajor: false,
        tag: 'UI & Theming Time Picker',
        changes: [
            'Theming Variabel CSS: Menghapus warna hardcoded pada time picker ke variabel --tp-*.',
            'Visual Bersih Terang: Latar header dan dial analog putih bersih dengan angka kontras.',
            'Aksen Teal Selaras: Mengganti aksen aktif menjadi teal (#0D9488) konsisten dengan tema.',
            'Tombol Presisi 8px: Menyeragamkan kelengkungan tombol preset waktu menjadi rounded-lg.'
        ]
    },
    {
        version: '0.2.96-beta',
        releaseDate: '26 September 2026',
        title: 'Profil Aturan Shift & Format List Edit Shift',
        isLatest: false,
        isMajor: false,
        tag: 'Struktur Manajemen Shift',
        changes: [
            'Profil Aturan Shift: Menampilkan daftar profil shift dalam kartu ringkas beserta tanggal berlaku.',
            'Tampilan Format List: Mengubah kartu edit shift menjadi baris list hemat ruang vertikal.',
            'Sub-Toolbar Menu Edit: Menyatukan tombol Tambah Shift dan Kembalikan Default.'
        ]
    },
    {
        version: '0.2.95-beta',
        releaseDate: '26 September 2026',
        title: 'Harmonisasi Desain Minimalis & Standarisasi 8px',
        isLatest: false,
        isMajor: false,
        tag: 'Penyempurnaan UI/UX',
        changes: [
            'Header & Hamburger: Penyelarasan vertikal presisi dengan efek hover transparan.',
            'Indikator Tema Dinamis: Ikon pemilih tema menyesuaikan tema aktif secara otomatis.',
            'Standarisasi 8px: Menyeragamkan seluruh radius bingkai luar dan tombol menjadi rounded-lg.',
            'Aksen Teal & Tab Underline: Mengubah tombol aksi ke gaya ghost dan tab flat underline.'
        ]
    },
    {
        version: '0.2.94-beta',
        releaseDate: '26 September 2026',
        title: 'Validasi Data Absen Masuk & Pulang untuk Lembur',
        isLatest: false,
        isMajor: false,
        tag: 'Kalkulasi Lembur',
        changes: [
            'Validasi Absensi Lembur: Lembur hanya dihitung jika data absen masuk dan pulang terisi lengkap.'
        ]
    },
    {
        version: '0.2.93-beta',
        releaseDate: '26 September 2026',
        title: 'Penyesuaian Proporsi Lebar Sidebar Desktop',
        isLatest: false,
        isMajor: false,
        tag: 'Layout Desktop',
        changes: [
            'Proporsi Sidebar Desktop: Memperlebar sidebar kanan (w-72) dan merapikan sidebar kiri.'
        ]
    },
    {
        version: '0.2.92-beta',
        releaseDate: '25 September 2026',
        title: 'Pembatasan Maksimal 2 Ikon Kartu Tanggal Mobile',
        isLatest: false,
        isMajor: false,
        tag: 'Optimasi Mobile',
        changes: [
            'Batas Ikon Mobile: Membatasi maksimal 2 ikon terdepan pada sudut kartu tanggal mobile.'
        ]
    },
    {
        version: '0.2.91-beta',
        releaseDate: '25 September 2026',
        title: 'Ikon Jam Indikator Lembur pada Kartu Mobile',
        isLatest: false,
        isMajor: false,
        tag: 'Visual Lembur Mobile',
        changes: [
            'Ikon Indikator Lembur: Mengganti ikon petir menjadi ikon jam (Clock) yang representatif.'
        ]
    },
    {
        version: '0.2.90-beta',
        releaseDate: '25 September 2026',
        title: 'Penyederhanaan Tampilan Badge Lembur Mobile',
        isLatest: false,
        isMajor: false,
        tag: 'Info Lembur Mobile',
        changes: [
            'Banner Lembur Bersih: Menampilkan format tunggal rapi "Lembur <h> Jam <mm> Menit".'
        ]
    },
    {
        version: '0.2.89-beta',
        releaseDate: '25 September 2026',
        title: 'Tata Letak Jumlah Lembur di Bawah Catatan Mobile',
        isLatest: false,
        isMajor: false,
        tag: 'Tata Letak Mobile',
        changes: [
            'Tata Letak Info Lembur: Memposisikan teks lembur presisi di bawah input catatan.'
        ]
    },
    {
        version: '0.2.88-beta',
        releaseDate: '25 September 2026',
        title: 'Optimalisasi Layering Z-Index Modal Salin Jadwal',
        isLatest: false,
        isMajor: false,
        tag: 'Z-Index Modal',
        changes: [
            'Layering Z-Index Modal: Mengangkat modal Salin Jadwal ke z-[99999] agar tidak tertutup.'
        ]
    },
    {
        version: '0.2.87-beta',
        releaseDate: '25 September 2026',
        title: 'Kalkulasi Lembur Lintas Hari & Shift Malam',
        isLatest: false,
        isMajor: false,
        tag: 'Perhitungan Lembur',
        changes: [
            'Kalkulasi Lintas Hari: Menghitung lembur shift PM & Malam secara akurat lintas tanggal.'
        ]
    },
    {
        version: '0.2.86-beta',
        releaseDate: '25 September 2026',
        title: 'Reposisi Libur Nasional di Atas Jadwal Piket Mobile',
        isLatest: false,
        isMajor: false,
        tag: 'Layout Mobile',
        changes: [
            'Prioritas Segmen Mobile: Menempatkan daftar Libur Nasional di atas Jadwal Piket pada mobile.'
        ]
    },
    {
        version: '0.2.85-beta',
        releaseDate: '25 September 2026',
        title: 'Galeri 250+ Ikon Vektor SVG & 150+ Koleksi Emoji',
        isLatest: false,
        isMajor: false,
        tag: 'Galeri Ikon & Emoji',
        changes: [
            'Ekspansi 250+ Ikon SVG: Menambahkan ikon tematik kategori santai, kerja, dan medis.',
            '150+ Emoji & Pencarian: Menyediakan tab emoji dan pencarian pintar dwibahasa.'
        ]
    },
    {
        version: '0.2.84-beta',
        releaseDate: '25 September 2026',
        title: 'Studio Desain Visual Shift & Linimasa Aturan',
        isLatest: false,
        isMajor: false,
        tag: 'Studio Desain Shift',
        changes: [
            'Studio Desain Shift: Editor warna, gradien, motif garis/titik, dan 100+ ikon SVG kustom.',
            'Aturan 3-Tier & Fleksibilitas: Penamaan inisial, aturan jam kerja, dan batas toleransi flexi.',
            'Linimasa Kelompok Shift: Pengelolaan kelompok shift lengkap dengan tanggal mulai berlaku.'
        ]
    },
    {
        version: '0.2.83-beta',
        releaseDate: '25 September 2026',
        title: 'Arah Tooltip Mobile & Posisi Kontrol Kalender',
        isLatest: false,
        isMajor: false,
        tag: 'Tooltip Mobile',
        changes: [
            'Arah Tooltip Mobile: Memastikan tooltip pada perangkat layar sentuh mengarah ke atas.'
        ]
    },
    {
        version: '0.2.82-beta',
        releaseDate: '25 September 2026',
        title: 'Pembersihan Tombol Menu Hamburger di Mobile',
        isLatest: false,
        isMajor: false,
        tag: 'Pembersihan UI Mobile',
        changes: [
            'Header Mobile Rapi: Menyembunyikan tombol menu hamburger pada tampilan ponsel.'
        ]
    },
    {
        version: '0.2.81-beta',
        releaseDate: '25 September 2026',
        title: 'Kalkulasi Lembur Otomatis & Tab Shift Pengaturan',
        isLatest: false,
        isMajor: false,
        tag: 'Fitur Lembur & Tab Shift',
        changes: [
            'Kalkulasi Lembur Otomatis: Menghitung durasi lembur presisi dengan toleransi 30 menit.',
            'Submenu Shift di Pengaturan: Menambahkan tab khusus manajemen shift di panel Pengaturan.'
        ]
    },
    {
        version: '0.2.80-beta',
        releaseDate: '25 September 2026',
        title: 'Ukuran Input Catatan Kompak & Auto-Expand',
        isLatest: false,
        isMajor: false,
        tag: 'Input Catatan',
        changes: [
            'Input Catatan Kompak: Tinggi default kotak catatan 28px dan auto-expand saat teks panjang.'
        ]
    },
    {
        version: '0.2.79-beta',
        releaseDate: '25 September 2026',
        title: 'Ikon OFF Tidur Berbantal Adaptif Multi-Tema',
        isLatest: false,
        isMajor: false,
        tag: 'Ikon OFF Sleep',
        changes: [
            'Ikon Tidur Berbantal: Memperbarui visual ikon OFF Sleep adaptif ke seluruh tema.'
        ]
    },
    {
        version: '0.2.78-beta',
        releaseDate: '25 September 2026',
        title: 'Ikon OFF Kursi Santai & Integrasi Zoom Browser',
        isLatest: false,
        isMajor: false,
        tag: 'Ikon & Zoom',
        changes: [
            'Ikon OFF Kursi Santai: Ilustrasi kursi malas dengan pewarnaan tema dinamis.',
            'Dukungan Zoom Browser: Sinkronisasi zoom keyboard (Ctrl +/-) dengan layout kalender.'
        ]
    },
    {
        version: '0.2.77-beta',
        releaseDate: '25 September 2026',
        title: 'Elevasi Z-Index Tooltip Sidebar Kalender',
        isLatest: false,
        isMajor: false,
        tag: 'Tooltip Kalender',
        changes: [
            'Z-Index Tooltip Kalender: Mengangkat lapisan tooltip agar tidak tertimpa kartu kalender.'
        ]
    },
    {
        version: '0.2.76-beta',
        releaseDate: '25 September 2026',
        title: 'Presisi Posisi Tooltip Tombol Hamburger',
        isLatest: false,
        isMajor: false,
        tag: 'Tooltip Navbar',
        changes: [
            'Presisi Tooltip Hamburger: Menjaga posisi tooltip tombol menu tepat di bawah ikon.'
        ]
    },
    {
        version: '0.2.75-beta',
        releaseDate: '25 September 2026',
        title: 'Batas Viewport Tooltip Kolom Kiri Kalender',
        isLatest: false,
        isMajor: false,
        tag: 'Batas Tooltip',
        changes: [
            'Batas Tooltip Kolom Kiri: Mencegah tooltip kolom terdepan tertutup oleh sidebar.'
        ]
    },
    {
        version: '0.2.74-beta',
        releaseDate: '25 September 2026',
        title: 'Pembaruan Ikon Vektor Piket & Santai',
        isLatest: false,
        isMajor: false,
        tag: 'Vektor Ikon',
        changes: [
            'Ikon Briefcase & Fishing: Pembaruan vektor visual piket dan relaksasi OFF.'
        ]
    },
    {
        version: '0.2.73-beta',
        releaseDate: '25 September 2026',
        title: 'Penampilan Teks Nama Shift Utuh di Desktop',
        isLatest: false,
        isMajor: false,
        tag: 'Tipografi Shift',
        changes: [
            'Teks Shift Utuh: Menampilkan label nama shift penuh tanpa terpotong di desktop.'
        ]
    },
    {
        version: '0.2.72-beta',
        releaseDate: '25 September 2026',
        title: 'Penyelarasan Font & Jarak Tombol Shift Desktop',
        isLatest: false,
        isMajor: false,
        tag: 'Layout Tombol Shift',
        changes: [
            'Optimasi Tombol Shift: Penyesuaian ukuran font dan padding tombol shift desktop.'
        ]
    },
    {
        version: '0.2.71-beta',
        releaseDate: '25 September 2026',
        title: 'Auto-Scale Tata Letak Kalender Desktop',
        isLatest: false,
        isMajor: false,
        tag: 'Auto-Scale UI',
        changes: [
            'Auto-Scale Responsif: Menjaga rasio grid kalender tetap proporsional saat resize.'
        ]
    },
    {
        version: '0.2.70-beta',
        releaseDate: '25 September 2026',
        title: 'Pembatasan Durasi Tampil Tooltip Maksimal 2 Detik',
        isLatest: false,
        isMajor: false,
        tag: 'Durasi Tooltip',
        changes: [
            'Batas Durasi Tooltip: Tooltip otomatis hilang setelah 2 detik untuk kenyamanan visual.'
        ]
    },
    {
        version: '0.2.69-beta',
        releaseDate: '25 September 2026',
        title: 'Tinggi Dinamis Tabel Daftar Jadwal Piket',
        isLatest: false,
        isMajor: false,
        tag: 'Tabel Piket',
        changes: [
            'Tinggi Dinamis Tabel Piket: Tabel otomatis menyesuaikan data dengan batas default 5 baris.'
        ]
    },
    {
        version: '0.2.68-beta',
        releaseDate: '25 September 2026',
        title: 'Ikon Vektor OFF & OFF Pengganti Responsif Tema',
        isLatest: false,
        isMajor: false,
        tag: 'Ikon OFF Vektor',
        changes: [
            'Ikon OFF Vektor Baru: Menggunakan stick figure santai dengan pewarnaan adaptif tema.'
        ]
    },
    {
        version: '0.2.67-beta',
        releaseDate: '25 September 2026',
        title: 'Auto-Dismiss Instan Tooltip Saat Kursor Bergeser',
        isLatest: false,
        isMajor: false,
        tag: 'Auto-Dismiss Tooltip',
        changes: [
            'Auto-Dismiss Tooltip: Tooltip langsung menghilang seketika saat kursor digeser.'
        ]
    },
    {
        version: '0.2.66-beta',
        releaseDate: '25 September 2026',
        title: 'Efek Animasi Glitch Hover Tombol Hapus Data',
        isLatest: false,
        isMajor: false,
        tag: 'Animasi Glitch',
        changes: [
            'Efek Glitch Hover: Animasi transisi futuristik pada tombol hapus data di Pengaturan.'
        ]
    },
    {
        version: '0.2.65-beta',
        releaseDate: '25 September 2026',
        title: 'Styling Tooltip Retro Tema Winamp Klasik',
        isLatest: false,
        isMajor: false,
        tag: 'Tema Winamp',
        changes: [
            'Tooltip Retro Winamp: Styling khusus tema Winamp beraksen neon hijau dan scanline.'
        ]
    },
    {
        version: '0.2.64-beta',
        releaseDate: '25 September 2026',
        title: 'Rilis Stabil Beta: Optimalisasi UI & Akselerasi GPU',
        isLatest: false,
        isMajor: false,
        tag: 'Rilis Stabil Beta',
        changes: [
            'Rilis Stabil Beta: Konsolidasi stabilitas fitur kalender shift dan manajemen presensi.',
            'Akselerasi GPU 60fps: Animasi mulus bebas glitch di seluruh komponen antarmuka.'
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
    const isDarkFluid = theme === 'darkFluid';
    const isDark = theme === 'dark';
    const isVista = theme === 'vista';
    const isDefault = theme === 'default';

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
                    isWinamp
                        ? 'rounded-none bg-[#191919] border-2 border-zinc-700 text-[#00FF00] font-mono shadow-[2px_2px_0_#000]'
                        : isDarkFluid
                        ? 'rounded-lg bg-[#1D1B20] border-white/10 text-[#E6E0E9]'
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
                                isWinamp
                                    ? 'rounded-none bg-black border border-[#00FF00] text-[#00FF00]'
                                    : isDarkFluid
                                    ? 'rounded-md bg-white/5 text-[#D0BCFF] border border-white/10'
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
                                <h2 className="text-base sm:text-lg font-black tracking-tight">
                                    Riwayat Perkembangan Versi
                                </h2>
                                <span
                                    className={`px-2 py-0.5 text-xs font-mono font-bold ${
                                        isWinamp
                                            ? 'rounded-none bg-[#00FF00] text-black'
                                            : isDarkFluid
                                            ? 'rounded-md bg-white/10 text-[#D0BCFF] border border-white/10'
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
                                    isWinamp
                                        ? 'text-[#00FF00]/80 font-mono'
                                        : isDarkFluid
                                        ? 'text-[#CAC4D0]'
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
                            isWinamp
                                ? 'rounded-none bg-black border-[#00FF00] text-[#00FF00] font-mono'
                                : isDarkFluid
                                ? 'rounded-md bg-[#2B2930] border-white/10 text-[#D0BCFF]'
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
                            : isDarkFluid
                            ? 'bg-[#2B2930] border-white/10 text-[#D0BCFF] hover:bg-[#36343B]'
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
                                            isWinamp
                                                ? 'rounded-none bg-[#191919] border-2 border-zinc-700 text-[#00FF00] font-mono shadow-[2px_2px_0_#000]'
                                                : isDarkFluid
                                                ? 'rounded-lg bg-[#1D1B20] border-white/10 text-[#E6E0E9] shadow-xs hover:border-white/20'
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
                                                isWinamp
                                                    ? 'hover:bg-zinc-900/60'
                                                    : isDarkFluid
                                                    ? 'hover:bg-white/5'
                                                    : isDark
                                                    ? 'hover:bg-slate-800/40'
                                                    : isVista
                                                    ? 'hover:bg-blue-50/50'
                                                    : 'hover:bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
                                                <div className="flex items-center space-x-2 shrink-0">
                                                    {/* Subtle Version Badge */}
                                                    <span
                                                        className={`px-2 py-0.5 text-xs font-mono font-bold tracking-tight shrink-0 border ${
                                                            isWinamp
                                                                ? 'rounded-none bg-[#00FF00] text-black border-[#00FF00]'
                                                                : isDarkFluid
                                                                ? 'rounded-md bg-white/10 text-[#D0BCFF] border-white/15'
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
                                                            className={`px-2 py-0.5 text-[10px] font-semibold tracking-wide flex items-center space-x-1 shrink-0 border ${
                                                                isWinamp
                                                                    ? 'rounded-none bg-black text-[#00FF00] border-[#00FF00]'
                                                                    : isDarkFluid
                                                                    ? 'rounded-md bg-white/5 text-[#CAC4D0] border-white/10'
                                                                    : isDark
                                                                    ? 'rounded-md bg-slate-800/50 text-slate-400 border-slate-700/80'
                                                                    : isVista
                                                                    ? 'rounded-md bg-sky-50 text-sky-800 border-sky-200'
                                                                    : 'rounded-md bg-slate-50 text-slate-600 border-slate-200'
                                                            }`}
                                                        >
                                                            <Sparkles className="h-2.5 w-2.5 opacity-70" />
                                                            <span>{item.tag}</span>
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-xs sm:text-sm font-bold truncate">
                                                        {item.title}
                                                    </h3>
                                                </div>
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
                                                    key="content"
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
                                                                : isDarkFluid
                                                                ? 'border-white/10'
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
                                                                                : isDarkFluid
                                                                                ? 'bg-[#D0BCFF]'
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
                                : isDarkFluid
                                ? 'bg-[#2B2930] text-[#D0BCFF] border-white/10 hover:bg-[#36343B]'
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
