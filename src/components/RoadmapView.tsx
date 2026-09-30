import React, { useState } from 'react';
import {
    ListTodo,
    Sparkles,
    Shield,
    Calendar,
    Cloud,
    Sliders,
    Bell,
    KeyRound,
    UserCheck,
    CheckCircle2,
    Clock,
    Layers,
    Tag,
    AlertCircle,
    ChevronRight,
    Search,
    Filter,
} from 'lucide-react';
import { AppTheme } from '../types';

interface RoadmapViewProps {
    theme?: AppTheme;
}

interface FeatureItem {
    id: string;
    title: string;
    description: string;
    category: 'auth' | 'shift' | 'sync' | 'ui';
    priority: 'high' | 'medium' | 'low';
    status: 'planned' | 'in-design' | 'ready';
    targetRelease: string;
    notes?: string[];
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ theme = 'default' }) => {
    const isIndustrial = theme === 'industrial';
    const isPaperSketch = theme === 'paperSketch';
    const isEditorial = theme === 'editorial';
    const isTechnical = theme === 'technical';
    const isWinamp = theme === 'winamp';
    const isDark = theme === 'dark';

    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        { id: 'all', label: 'Semua Kategori', icon: Layers },
        { id: 'auth', label: 'Autentikasi & Akun', icon: Shield },
        { id: 'shift', label: 'Manajemen Shift & Kalender', icon: Calendar },
        { id: 'sync', label: 'Sinkronisasi & Cloud', icon: Cloud },
        { id: 'ui', label: 'Antarmuka & Pengalaman', icon: Sliders },
    ];

    const featureList: FeatureItem[] = [
        {
            id: 'feat-02',
            title: 'Dashboard Manajemen User & Audit Sesi Komputer untuk Admin Posko',
            description: 'Panel khusus Administrator untuk melihat seluruh daftar pegawai, status NIP aktif, log sesi komputer yang terhubung, dan pengaturan otorisasi hak akses.',
            category: 'auth',
            priority: 'high',
            status: 'in-design',
            targetRelease: 'v0.5.0',
            notes: [
                'Audit log perangkat masuk per NIP pegawai.',
                'Deteksi anomali login dari jaringan di luar posko / kantor.',
                'Pengaturan role supervisor shift dan petugas lapangan.',
            ],
        },
        {
            id: 'feat-03',
            title: 'Generator Otomasi Pola Rotasi Shift Multi-Regu',
            description: 'Algoritma pembuat rotasi shift otomatis untuk 4 regu kerja (Regu A, B, C, D) dengan pola 2 Pagi - 2 Malam - 2 Libur atau rotasi khusus kantor pabean.',
            category: 'shift',
            priority: 'medium',
            status: 'in-design',
            targetRelease: 'v0.5.1',
            notes: [
                'Pemilihan pola rotasi bawaan (Standard 4-Squad 24/7).',
                'Simulasi penanggalan hingga 1 tahun ke depan.',
                'Pencegahan bentrok lembur dan cuti bersama.',
            ],
        },
        {
            id: 'feat-04',
            title: 'Fitur Tukar Shift & Laporan Penggantian Petugas Posko',
            description: 'Antarmuka untuk mencatat tukar jadwal jaga piket antar rekan kerja dengan persetujuan kepala seksi / koordinator shift.',
            category: 'shift',
            priority: 'medium',
            status: 'planned',
            targetRelease: 'v0.5.2',
            notes: [
                'Log riwayat pergantian jadwal dan alasan dinas.',
                'Pembaruan otomatis pada perhitungan jam piket & OFF.',
            ],
        },
        {
            id: 'feat-05',
            title: 'Sinkronisasi Jadwal Google Calendar 2-Arah Otomatis',
            description: 'Ekspor dan sinkronisasi real-time jadwal shift kerja pegawai langsung ke aplikasi Google Calendar di smartphone tanpa ekspor berkas manual.',
            category: 'sync',
            priority: 'high',
            status: 'in-design',
            targetRelease: 'v0.5.3',
            notes: [
                'Koneksi client-side Google Calendar OAuth.',
                'Pengingat alarm notifikasi sebelum jam masuk shift dimulai.',
            ],
        },
        {
            id: 'feat-supabase-sync',
            title: 'Penambahan Cloud Sync dengan Supabase',
            description: 'Integrasi sinkronisasi cloud terpusat berbasis Supabase database & auth untuk backup data jadwal, persistensi lintas perangkat gawai/PC posko, dan kolaborasi multi-user realtime.',
            category: 'sync',
            priority: 'high',
            status: 'planned',
            targetRelease: 'v0.5.5',
            notes: [
                'Penyimpanan database PostgreSQL Supabase untuk data jadwal dan profil posko.',
                'Sinkronisasi instan antar perangkat komputer posko dan gawai mobile.',
                'Dukungan mode offline-first dengan sinkronisasi otomatis saat online.',
            ],
        },
        {
            id: 'feat-06',
            title: 'Ekspor Format PDF Rekapitulasi Kehadiran Dinas Siap Cetak',
            description: 'Menghasilkan dokumen PDF rekapitulasi kehadiran bulanan, total jam kerja, dan tanggal piket posko dengan layout resmi siap print.',
            category: 'ui',
            priority: 'low',
            status: 'planned',
            targetRelease: 'v0.5.4',
            notes: [
                'Header resmi dokumen dan tabel tanda tangan atasan.',
                'Format ukuran kertas A4 & Folio.',
            ],
        },
    ];

    const filteredFeatures = featureList.filter((item) => {
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        const matchesSearch =
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getPriorityBadge = (p: string) => {
        switch (p) {
            case 'high':
                return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
            case 'medium':
                return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
            default:
                return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
        }
    };

    const getStatusBadge = (s: string) => {
        switch (s) {
            case 'ready':
                return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
            case 'in-design':
                return 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
            default:
                return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30';
        }
    };

    const getStatusLabel = (s: string) => {
        switch (s) {
            case 'ready': return 'Siap Diimplementasi';
            case 'in-design': return 'Tahap Desain & Spesifikasi';
            default: return 'Rencana Pengembangan';
        }
    };

    return (
        <div className="space-y-4 max-w-[1490px] mx-auto animate-in fade-in duration-200">
            {/* Page Header */}
            <div className={`p-4 sm:p-5 rounded-2xl border ${
                isIndustrial
                    ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.15)] text-[#E2E8F0] font-[\'JetBrains_Mono\']'
                    : isPaperSketch
                    ? 'bg-[#ffffff] border-2 border-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b] font-[\'Gaegu\'] text-base'
                    : isTechnical
                    ? 'bg-[#F8F7F4] dark:bg-[#0D1117] border-[1.5px] border-[#111113] dark:border-slate-700 font-mono'
                    : isWinamp
                    ? 'bg-black border-2 border-[#00FF00] text-[#00FF00] font-mono'
                    : isDark
                    ? 'bg-[#1E1E1E] border-slate-800 text-slate-100'
                    : 'bg-white border-slate-200/90 text-slate-900 shadow-sm'
            }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3.5">
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                            isIndustrial
                                ? 'bg-[#0F1115] text-[#2DD4BF] border border-[#2DD4BF]/40'
                                : 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/50'
                        }`}>
                            <ListTodo className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base sm:text-lg font-black tracking-tight">
                                    Rencana Fitur & Catatan Pengembangan
                                </h2>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                                    Roadmap
                                </span>
                            </div>
                            <p className="text-xs opacity-70 mt-0.5">
                                Daftar backlog fitur yang sedang dirancang dan dikembangkan untuk pembaruan versi JadwalPriok selanjutnya.
                            </p>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="relative min-w-[240px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari rencana fitur..."
                            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-current/20 bg-current/5 outline-none focus:border-teal-500 font-bold"
                        />
                    </div>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-4 mt-4 border-t border-current/15 pb-1 no-scrollbar">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 shrink-0 transition-all cursor-pointer ${
                                    isSelected
                                        ? isIndustrial
                                            ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40'
                                            : 'bg-teal-600 text-white shadow-xs'
                                        : 'hover:bg-current/10 border border-current/15 opacity-70 hover:opacity-100'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredFeatures.map((item) => (
                    <div
                        key={item.id}
                        className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between transition-all hover:shadow-md ${
                            isIndustrial
                                ? 'bg-[#1A1D23] border-[rgba(226,232,240,0.15)] text-[#E2E8F0]'
                                : isPaperSketch
                                ? 'bg-[#ffffff] border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b]'
                                : isTechnical
                                ? 'bg-[#F8F7F4] dark:bg-[#0D1117] border-[1.5px] border-[#111113] dark:border-slate-700'
                                : isWinamp
                                ? 'bg-black border border-[#00FF00] text-[#00FF00]'
                                : isDark
                                ? 'bg-[#1E1E1E] border-slate-800 text-slate-100'
                                : 'bg-white border-slate-200/90 text-slate-900 shadow-2xs'
                        }`}
                    >
                        <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${getStatusBadge(item.status)}`}>
                                        {getStatusLabel(item.status)}
                                    </span>
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${getPriorityBadge(item.priority)}`}>
                                        Prioritas: {item.priority.toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-[10px] font-mono opacity-60 font-bold shrink-0">
                                    Target: {item.targetRelease}
                                </span>
                            </div>

                            <h3 className="text-sm sm:text-base font-extrabold leading-snug">
                                {item.title}
                            </h3>

                            <p className="text-xs opacity-80 leading-relaxed">
                                {item.description}
                            </p>

                            {item.notes && item.notes.length > 0 && (
                                <div className="p-3 rounded-xl bg-current/5 border border-current/10 space-y-1.5">
                                    <span className="text-[10.5px] font-bold uppercase tracking-wider opacity-70 block">
                                        Poin Desain Implementasi:
                                    </span>
                                    <ul className="space-y-1 text-xs opacity-85">
                                        {item.notes.map((note, nIdx) => (
                                            <li key={nIdx} className="flex items-start space-x-2">
                                                <ChevronRight className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                                                <span className="leading-tight">{note}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="pt-3 mt-3 border-t border-current/10 flex items-center justify-between text-[11px] opacity-70">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Kategori: {categories.find((c) => c.id === item.category)?.label}</span>
                            </span>
                            <span className="font-mono text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400">
                                #{item.id}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredFeatures.length === 0 && (
                <div className="p-8 text-center rounded-2xl border border-dashed border-current/20 opacity-60 space-y-2">
                    <AlertCircle className="w-8 h-8 mx-auto text-amber-500" />
                    <p className="text-xs font-bold">Tidak ada rencana fitur yang cocok dengan kata kunci pencarian.</p>
                </div>
            )}
        </div>
    );
};
