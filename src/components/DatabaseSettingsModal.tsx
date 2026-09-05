import React, { useState } from 'react';
import {
  Database,
  Key,
  Server,
  Check,
  X,
  ShieldCheck,
  Cloud,
  Wifi,
  Trash2,
  HelpCircle,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Code2,
  ExternalLink
} from 'lucide-react';
import { DayData } from '../types';
import {
  testSupabaseConnection,
  pushAllToSupabase,
  pullAllFromSupabase,
  syncTwoWaySupabase,
  SUPABASE_SQL_SETUP_SCRIPT
} from '../lib/supabaseSync';

interface DatabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supabaseUrl: string;
  supabaseAnonKey: string;
  onSaveSupabase: (url: string, key: string) => void;
  daysState: Record<string, DayData>;
  onUpdateDaysState: (data: Record<string, DayData>) => void;
  onShowToast: (msg: string) => void;
}

export const DatabaseSettingsModal: React.FC<DatabaseSettingsModalProps> = ({
  isOpen,
  onClose,
  supabaseUrl,
  supabaseAnonKey,
  onSaveSupabase,
  daysState,
  onUpdateDaysState,
  onShowToast,
}) => {
  const [url, setUrl] = useState(supabaseUrl);
  const [key, setKey] = useState(supabaseAnonKey);
  const [activeTab, setActiveTab] = useState<'supabase' | 'local'>('supabase');
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    tableReady?: boolean;
    ms?: number;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlCode, setShowSqlCode] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveSupabase(url.trim(), key.trim());
    onShowToast('Pengaturan Supabase berhasil disimpan.');
  };

  const handleDisconnectSupabase = () => {
    setUrl('');
    setKey('');
    onSaveSupabase('', '');
    setTestResult(null);
    onShowToast('Koneksi Supabase diputuskan.');
  };

  const handleTestConnection = async () => {
    if (!url.trim() || !key.trim()) {
      setTestResult({
        success: false,
        message: 'Masukkan URL dan Anon Key terlebih dahulu.',
      });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(url.trim(), key.trim());
      setTestResult(res);
      if (res.success) {
        onSaveSupabase(url.trim(), key.trim());
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handlePushAll = async () => {
    if (!url.trim() || !key.trim()) {
      onShowToast('Isi URL dan Anon Key Supabase terlebih dahulu.');
      return;
    }
    setIsSyncing(true);
    try {
      const res = await pushAllToSupabase(url.trim(), key.trim(), daysState);
      if (res.success) {
        onShowToast(res.message);
        setTestResult({ success: true, message: res.message, tableReady: true });
      } else {
        alert(res.message);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullAll = async () => {
    if (!url.trim() || !key.trim()) {
      onShowToast('Isi URL dan Anon Key Supabase terlebih dahulu.');
      return;
    }
    setIsSyncing(true);
    try {
      const res = await pullAllFromSupabase(url.trim(), key.trim());
      if (res.success && res.data) {
        onUpdateDaysState(res.data);
        onShowToast(res.message);
        setTestResult({ success: true, message: res.message, tableReady: true });
      } else {
        alert(res.message);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTwoWaySync = async () => {
    if (!url.trim() || !key.trim()) {
      onShowToast('Isi URL dan Anon Key Supabase terlebih dahulu.');
      return;
    }
    setIsSyncing(true);
    try {
      const res = await syncTwoWaySupabase(url.trim(), key.trim(), daysState);
      if (res.success) {
        onUpdateDaysState(res.mergedData);
        onShowToast(res.message);
        setTestResult({ success: true, message: res.message, tableReady: true });
      } else {
        alert(res.message);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between bg-[#297373] px-5 py-3.5 text-white shrink-0">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-teal-200" />
            <div>
              <h3 className="text-base font-extrabold">Penyimpanan Database & Cloud</h3>
              <p className="text-[11px] text-teal-100 font-medium">Penyimpanan Lokal & Sinkronisasi Supabase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-teal-200 hover:bg-[#1f5858] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-2.5 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('supabase')}
            className={`flex items-center space-x-1.5 border-b-2 px-3 sm:px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'supabase'
                ? 'border-[#297373] text-[#297373] bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="h-3.5 w-3.5 text-emerald-600" />
            <span>Cloud Supabase & Sync</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('local')}
            className={`flex items-center space-x-1.5 border-b-2 px-3 sm:px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'local'
                ? 'border-[#297373] text-[#297373] bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
            <span>Penyimpanan Lokal</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: SUPABASE CLOUD & SYNC */}
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-indigo-50/80 p-3.5 border border-indigo-200 text-xs text-indigo-950 space-y-1.5">
                <p className="font-black text-indigo-900 flex items-center gap-1.5">
                  <Cloud className="h-4 w-4 text-indigo-600" />
                  Koneksi & Sinkronisasi Supabase Real-Time
                </p>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  Data kalender disinkronkan secara langsung ke tabel <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-indigo-950 border border-indigo-200">shifts</code> di project Supabase Anda. Anda dapat mengakses data yang sama dari perangkat mana pun atau aplikasi lain.
                </p>
              </div>

              {/* Form Input URL & Key */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Server className="h-3.5 w-3.5 text-slate-500" />
                      Supabase Project URL
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Contoh: https://xyz.supabase.co</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://your-project-id.supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-[#297373] focus:outline-none focus:ring-1 focus:ring-[#297373] font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-slate-500" />
                      Supabase Project Anon (Public) Key
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">anon / public key</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-[#297373] focus:outline-none focus:ring-1 focus:ring-[#297373] font-mono bg-white resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons: Uji Koneksi, Putuskan, Simpan */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <Wifi className="h-3.5 w-3.5 text-slate-600" />
                    <span>{isTesting ? 'Menguji...' : 'Uji Koneksi & Tabel'}</span>
                  </button>

                  {supabaseUrl && (
                    <button
                      type="button"
                      onClick={handleDisconnectSupabase}
                      className="inline-flex items-center space-x-1 text-rose-600 hover:text-rose-800 text-xs font-bold px-2 py-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Putuskan</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleSave()}
                  className="inline-flex items-center space-x-1.5 rounded-xl bg-[#297373] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#1f5858] shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Simpan Kredensial</span>
                </button>
              </div>

              {/* Live Test Status Banner */}
              {testResult && (
                <div
                  className={`rounded-xl p-3 text-xs border ${
                    testResult.success
                      ? testResult.tableReady !== false
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                        : 'bg-amber-50 text-amber-950 border-amber-300'
                      : 'bg-rose-50 text-rose-950 border-rose-300'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {testResult.success ? (
                      testResult.tableReady !== false ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      )
                    ) : (
                      <X className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="font-extrabold">{testResult.message}</p>
                      {testResult.tableReady === false && (
                        <p className="text-[11px] text-amber-800">
                          Solusi: Buka bagian <strong>"Script SQL Supabase"</strong> di bawah ini, salin dan jalankan di SQL Editor dashboard Supabase.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Data Sync Operations (Push / Pull / Sync) */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">Operasi Sinkronisasi Data:</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Lokal: {Object.keys(daysState).length} record
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleTwoWaySync}
                    disabled={isSyncing}
                    className="flex items-center justify-center space-x-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync 2 Arah</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePushAll}
                    disabled={isSyncing}
                    className="flex items-center justify-center space-x-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Kirim ke Cloud</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePullAll}
                    disabled={isSyncing}
                    className="flex items-center justify-center space-x-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 p-2.5 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <DownloadCloud className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Tarik dari Cloud</span>
                  </button>
                </div>
              </div>

              {/* Collapsible SQL Setup Script Box */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowSqlCode(!showSqlCode)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 text-left hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <Code2 className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-extrabold text-slate-800">
                      Script SQL Pembuatan Tabel & Policy Supabase
                    </span>
                  </div>
                  <span className="text-xs font-bold text-indigo-600">
                    {showSqlCode ? 'Sembunyikan' : 'Lihat Script SQL'}
                  </span>
                </button>

                {showSqlCode && (
                  <div className="p-3 border-t border-slate-200 space-y-2.5 bg-slate-900 text-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">Run di Supabase ➔ SQL Editor</span>
                      <button
                        type="button"
                        onClick={handleCopySql}
                        className="flex items-center space-x-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 text-[11px] font-bold text-white transition-colors cursor-pointer"
                      >
                        {copiedSql ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-48">
                      {SUPABASE_SQL_SETUP_SCRIPT}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PENYIMPANAN LOKAL */}
          {activeTab === 'local' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4 border border-emerald-200">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">Mode Mandiri / Offline Pertama</h4>
                    <p className="text-[11px] text-emerald-700">100% data tersimpan di perangkat masing-masing pengguna</p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                  <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  AKTIF & AMAN
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                  <p className="text-slate-600 leading-relaxed">
                    Saat aplikasi ini dibuka oleh pengguna lain, <strong>jadwal tersimpan aman secara privat</strong> di memori browser lokal (LocalStorage).
                  </p>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Data pengguna tidak akan pernah bercampur. Pengguna dapat mem-backup data mandiri kapan saja lewat tombol <strong>Ekspor ➔ JSON / Excel</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 hover:bg-slate-300 px-4 py-1.5 text-xs font-extrabold text-slate-700 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
