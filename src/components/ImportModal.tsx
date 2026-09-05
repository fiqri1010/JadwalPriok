import React, { useState, useRef } from 'react';
import {
  Upload,
  FileCode,
  Database,
  Check,
  X,
  AlertCircle,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { DayData, normalizeShift } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  daysState: Record<string, DayData>;
  onImport: (importedData: Record<string, DayData>, mode: 'merge' | 'replace') => void;
  onShowToast: (msg: string) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  daysState,
  onImport,
  onShowToast,
}) => {
  const [importType, setImportType] = useState<'json' | 'sql'>('json');
  const [pastedText, setPastedText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, DayData> | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Helper to parse JSON input
  const parseJSON = (text: string): Record<string, DayData> => {
    const parsed = JSON.parse(text);
    let resultDays: Record<string, any> = {};

    if (parsed.days && typeof parsed.days === 'object') {
      resultDays = parsed.days;
    } else if (typeof parsed === 'object' && !Array.isArray(parsed)) {
      resultDays = parsed;
    } else if (Array.isArray(parsed)) {
      parsed.forEach((item) => {
        const key = item.date_key || item.dateKey || item.id || item.Tanggal;
        if (key) {
          resultDays[key] = item;
        }
      });
    }

    const cleanResult: Record<string, DayData> = {};
    Object.keys(resultDays).forEach((key) => {
      const item = resultDays[key];
      if (item && typeof item === 'object') {
        cleanResult[key] = {
          shift: normalizeShift(item.shift || item.Shift || 'Graha'),
          isLocked: Boolean(item.isLocked ?? item.is_locked),
          note: String(item.note || item.Catatan || ''),
          isMasuk: Boolean(item.isMasuk ?? item.is_masuk ?? item.StatusMasuk),
          tipeMasukLibur: (item.tipeMasukLibur || item.tipe_masuk_libur) === 'lembur' ? 'lembur' : 'piket',
          isHoldDokumen: Boolean(item.isHoldDokumen ?? item.is_hold_dokumen),
          jamMasuk: String(item.jamMasuk || item.jam_masuk || ''),
          jamPulang: String(item.jamPulang || item.jam_pulang || ''),
          absenCeisa: String(item.absenCeisa || item.absen_ceisa || ''),
          isSuratTugasTambahan: Boolean(item.isSuratTugasTambahan ?? item.is_surat_tugas_tambahan),
          isManualHoliday: Boolean(item.isManualHoliday ?? item.is_manual_holiday),
          isGunakanOffGeser: Boolean(item.isGunakanOffGeser ?? item.is_gunakan_off_geser),
          referensiTglOff: String(item.referensiTglOff || item.referensi_tgl_off || ''),
          isGunakanCP: Boolean(item.isGunakanCP ?? item.is_gunakan_cp),
          referensiTglCP: String(item.referensiTglCP || item.referensi_tgl_cp || ''),
        };
      }
    });

    return cleanResult;
  };

  // Helper to parse SQL INSERT / UPSERT text
  const parseSQL = (text: string): Record<string, DayData> => {
    const cleanResult: Record<string, DayData> = {};

    // Regex to match VALUES ('dateKey', 'shift', isLocked, 'note', isMasuk, ...)
    // Matches patterns like: VALUES ('2026-03-01', 'Graha', false, '', true, ...)
    const valueRegex = /VALUES\s*\(\s*'([^']+)'\s*,\s*'([^']*)'\s*,\s*(true|false)\s*,\s*'([^']*)'\s*,\s*(true|false)\s*,\s*'([^']*)'\s*,\s*(true|false)\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*(true|false)\s*,\s*(true|false)/gi;

    let match;
    let count = 0;
    while ((match = valueRegex.exec(text)) !== null) {
      count++;
      const [
        _,
        dateKey,
        shift,
        isLocked,
        note,
        isMasuk,
        tipeMasukLibur,
        isHoldDokumen,
        jamMasuk,
        jamPulang,
        absenCeisa,
        isSuratTugasTambahan,
        isManualHoliday
      ] = match;

      cleanResult[dateKey] = {
        shift: normalizeShift(shift),
        isLocked: isLocked.toLowerCase() === 'true',
        note: note.replace(/''/g, "'"),
        isMasuk: isMasuk.toLowerCase() === 'true',
        tipeMasukLibur: tipeMasukLibur === 'lembur' ? 'lembur' : 'piket',
        isHoldDokumen: isHoldDokumen.toLowerCase() === 'true',
        jamMasuk,
        jamPulang,
        absenCeisa,
        isSuratTugasTambahan: isSuratTugasTambahan.toLowerCase() === 'true',
        isManualHoliday: isManualHoliday.toLowerCase() === 'true',
        isGunakanOffGeser: false,
        referensiTglOff: '',
        isGunakanCP: false,
        referensiTglCP: '',
      };
    }

    // Fallback parser if custom column ordering is present
    if (count === 0) {
      // Line by line simple match
      const lines = text.split('\n');
      lines.forEach((line) => {
        const dateMatch = line.match(/'(\d{4}-\d{1,2}-\d{1,2})'/);
        if (dateMatch) {
          const dateKey = dateMatch[1];
          const shiftMatch = line.match(/'(Graha|NPCT|NPCS|TPSL|OFF|SM|PM|Malam|M|CUTI|G|L|N)'/i);
          const shift = shiftMatch ? shiftMatch[1] : 'Graha';
          cleanResult[dateKey] = {
            shift: normalizeShift(shift),
            isLocked: false,
            note: '',
            isMasuk: !line.includes('false'),
            tipeMasukLibur: 'piket',
            isHoldDokumen: false,
            jamMasuk: '',
            jamPulang: '',
            absenCeisa: '',
            isSuratTugasTambahan: false,
            isManualHoliday: false,
          };
        }
      });
    }

    return cleanResult;
  };

  const handleProcessText = () => {
    setErrorMsg(null);
    if (!pastedText.trim()) {
      setErrorMsg('Harap masukkan atau unggah teks/file terlebih dahulu.');
      return;
    }

    setIsProcessing(true);
    try {
      let result: Record<string, DayData> = {};
      if (importType === 'json') {
        result = parseJSON(pastedText);
      } else {
        result = parseSQL(pastedText);
      }

      const count = Object.keys(result).length;
      if (count === 0) {
        throw new Error('Tidak ada data jadwal valid yang dapat diekstrak dari format ini.');
      }

      setParsedData(result);
    } catch (e: any) {
      setErrorMsg(e.message || 'Gagal memproses file. Pastikan format JSON/SQL valid.');
      setParsedData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setPastedText(text);

      if (file.name.endsWith('.sql')) {
        setImportType('sql');
      } else {
        setImportType('json');
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (!parsedData) return;

    onImport(parsedData, importMode);
    const count = Object.keys(parsedData).length;
    onShowToast(`Berhasil mengimpor ${count} data jadwal (${importMode === 'merge' ? 'Digabungkan' : 'Digantikan'})!`);
    onClose();
  };

  const recordCount = parsedData ? Object.keys(parsedData).length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Impor Data Jadwal</h2>
              <p className="text-xs text-slate-500 font-medium">
                Pulihkan data dari cadangan file JSON atau skrip SQL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="mt-4 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setImportType('json');
              setParsedData(null);
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 text-xs font-bold rounded-lg transition-all ${
              importType === 'json'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="h-4 w-4" />
            <span>Format JSON (.json)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setImportType('sql');
              setParsedData(null);
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 text-xs font-bold rounded-lg transition-all ${
              importType === 'sql'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Format SQL Dump (.sql)</span>
          </button>
        </div>

        {/* File Drag/Browse Box */}
        <div className="mt-4 space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-teal-500 bg-slate-50 rounded-2xl p-4 text-center cursor-pointer transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={importType === 'json' ? '.json,application/json' : '.sql,text/plain'}
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 mb-2">
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              {fileName ? `File terpilih: ${fileName}` : 'Klik untuk pilih file atau seret file ke sini'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Mendukung file ekspor dari aplikasi ini (.json atau .sql)
            </p>
          </div>

          {/* Text Area for manual paste */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Atau Tempel Isi Teks Mentah:</span>
              {pastedText && (
                <button
                  type="button"
                  onClick={() => {
                    setPastedText('');
                    setParsedData(null);
                    setFileName(null);
                  }}
                  className="text-[11px] text-rose-500 hover:underline"
                >
                  Bersihkan
                </button>
              )}
            </label>
            <textarea
              rows={4}
              value={pastedText}
              onChange={(e) => {
                setPastedText(e.target.value);
                setParsedData(null);
              }}
              placeholder={
                importType === 'json'
                  ? '{"targetMonth": 3, "days": { "2026-3-1": { "shift": "Graha", ... } }}'
                  : "INSERT INTO public.jadwal_shift (date_key, shift, ...) VALUES ('2026-3-1', 'Graha', ...);"
              }
              className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono text-slate-800 focus:border-teal-500 focus:outline-none"
            />
          </div>

          {/* Process Button */}
          {!parsedData && (
            <button
              type="button"
              onClick={handleProcessText}
              disabled={!pastedText.trim() || isProcessing}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memproses Data...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Periksa & Baca Data</span>
                </>
              )}
            </button>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800 border border-rose-200 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Summary Preview */}
          {parsedData && (
            <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center space-x-2 text-emerald-900">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-extrabold">Data Berhasil Diverifikasi!</h4>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    Ditemukan {recordCount} data tanggal jadwal yang siap dimasukkan.
                  </p>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="pt-2 border-t border-emerald-200/60 space-y-2">
                <span className="text-[11px] font-bold text-slate-700">Metode Penggabungan:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setImportMode('merge')}
                    className={`p-2.5 rounded-lg border text-left text-xs font-bold transition-all cursor-pointer ${
                      importMode === 'merge'
                        ? 'bg-white border-teal-500 text-teal-800 ring-1 ring-teal-500 shadow-2xs'
                        : 'bg-emerald-100/50 border-transparent text-slate-700'
                    }`}
                  >
                    <div>Gabungkan (Merge)</div>
                    <div className="text-[10px] text-slate-500 font-normal">Timpa hari yang ada, pertahankan hari lainnya</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`p-2.5 rounded-lg border text-left text-xs font-bold transition-all cursor-pointer ${
                      importMode === 'replace'
                        ? 'bg-white border-rose-500 text-rose-800 ring-1 ring-rose-500 shadow-2xs'
                        : 'bg-emerald-100/50 border-transparent text-slate-700'
                    }`}
                  >
                    <div>Gantikan Penuh (Replace)</div>
                    <div className="text-[10px] text-slate-500 font-normal">Kosongkan data lama & ganti dengan data impor</div>
                  </button>
                </div>
              </div>

              {/* Confirm Import Button */}
              <button
                type="button"
                onClick={handleExecuteImport}
                className="w-full flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white p-3 text-xs font-black shadow-md transition-colors cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Konfirmasi & Terapkan Data Impor</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
