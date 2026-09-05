import React, { useState, useEffect, useRef } from 'react';
import { ClipboardPaste, X, Check, AlertCircle, Sparkles } from 'lucide-react';
import { SHIFT_OPTIONS, ShiftType, SHIFT_COLORS, DayData, EXCEL_SHIFT_MAPPING } from '../types';

interface PasteExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedYear: number;
  selectedMonth: number;
  onApply: (updates: Record<string, Partial<DayData>>) => void;
  initialText?: string;
}

export const PasteExcelModal: React.FC<PasteExcelModalProps> = ({
  isOpen,
  onClose,
  selectedYear,
  selectedMonth,
  onApply,
  initialText = '',
}) => {
  const [inputText, setInputText] = useState(initialText);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  useEffect(() => {
    if (isOpen) {
      setInputText(initialText);
      setErrorMsg(null);
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 100);
    }
  }, [isOpen, initialText]);

  if (!isOpen) return null;

  // Parse items from input text
  const parseShifts = (text: string) => {
    if (!text || !text.trim()) return [];
    // Prioritaskan baris pertama jika dicopy 1 baris horizontal
    const firstLine = text.replace(/\r/g, '').split('\n').find((l) => l.trim().length > 0) || '';
    // Support tab (\t), comma (,), semicolon (;), or multiple spaces
    let rawCells = firstLine.split('\t');
    if (rawCells.length <= 1 && firstLine.includes(',')) {
      rawCells = firstLine.split(',');
    } else if (rawCells.length <= 1 && firstLine.includes(';')) {
      rawCells = firstLine.split(';');
    } else if (rawCells.length <= 1 && firstLine.includes(' ')) {
      rawCells = firstLine.split(/\s+/);
    }

    return rawCells.map((c) => c.trim().toUpperCase());
  };

  const parsedCells = parseShifts(inputText);

  // Match and map against EXCEL_SHIFT_MAPPING or SHIFT_OPTIONS
  const matchedDays: { day: number; shift: ShiftType | null; raw: string }[] = [];
  let validCount = 0;

  for (let i = 0; i < daysInMonth; i++) {
    const raw = parsedCells[i] || '';
    let matched: ShiftType | null = null;

    if (raw) {
      if (EXCEL_SHIFT_MAPPING[raw]) {
        matched = EXCEL_SHIFT_MAPPING[raw];
      } else {
        const found = SHIFT_OPTIONS.find((opt) => opt.toUpperCase() === raw);
        if (found) matched = found;
      }
    }

    if (matched) {
      validCount++;
      matchedDays.push({ day: i + 1, shift: matched, raw });
    } else {
      matchedDays.push({ day: i + 1, shift: null, raw });
    }
  }

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setInputText(text);
          setErrorMsg(null);
          return;
        }
      }
    } catch {
      // If browser blocked programmatic read, give helpful guidance
      setErrorMsg('Iframe browser membatasi akses clipboard otomatis. Silakan tekan Ctrl+V (atau Cmd+V di Mac) pada kotak input di bawah.');
      textareaRef.current?.focus();
    }
  };

  const handleApply = () => {
    if (validCount === 0) {
      setErrorMsg('Tidak ada kode shift yang cocok (Graha/G, NPCT/N, TPSL/L, OFF, SM, PM, Malam/M, CUTI/C). Pastikan data yang dicopy berisi kode shift.');
      return;
    }

    const updates: Record<string, Partial<DayData>> = {};
    for (const item of matchedDays) {
      if (item.shift) {
        const key = `${selectedYear}-${selectedMonth}-${item.day}`;
        updates[key] = { shift: item.shift };
      }
    }

    onApply(updates);
    onClose();
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-300">
              <ClipboardPaste className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Tempel Jadwal Shift Excel</h2>
              <p className="text-xs text-teal-200/80">
                Periode {monthNames[selectedMonth - 1]} {selectedYear} ({daysInMonth} Hari)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-800">
          {/* Instructions */}
          <div className="rounded-xl bg-teal-50/80 p-3.5 border border-teal-200/80 text-xs space-y-1.5">
            <div className="font-bold text-teal-950 flex items-center space-x-1.5">
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span>Petunjuk Tempel Jadwal (Copy-Paste):</span>
            </div>
            <p className="text-teal-900 leading-relaxed">
              1. Buka file Excel jadwal Anda, sorot <strong>1 baris horizontal</strong> berisi kode shift tanggal 1 s.d. {daysInMonth}, lalu tekan <strong>Ctrl + C</strong>.
            </p>
            <p className="text-teal-900 leading-relaxed">
              2. Tempelkan ke kotak di bawah menggunakan <strong>Ctrl + V</strong> (atau klik tombol &quot;Ambil dari Clipboard&quot;).
            </p>
            <div className="pt-1 flex flex-wrap gap-1 items-center">
              <span className="font-semibold text-slate-700">Kode Shift yang dikenali:</span>
              {SHIFT_OPTIONS.map((s) => (
                <span
                  key={s}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${SHIFT_COLORS[s]?.bg || 'bg-slate-700'} ${SHIFT_COLORS[s]?.text || 'text-white'}`}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="excel-paste-area" className="text-xs font-bold text-slate-700">
                Tempelkan Teks Hasil Copy Excel di Sini:
              </label>
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="text-[11px] font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1 hover:underline cursor-pointer"
              >
                <ClipboardPaste className="h-3.5 w-3.5" />
                <span>Ambil dari Clipboard</span>
              </button>
            </div>
            <textarea
              id="excel-paste-area"
              ref={textareaRef}
              rows={3}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setErrorMsg(null);
              }}
              placeholder="Tekan Ctrl+V di sini (Contoh: G	L	N	OFF	SM	PM	M	CUTI ...)"
              className="w-full rounded-xl border border-slate-300 p-3 font-mono text-xs focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-slate-50/50"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="rounded-xl bg-rose-50 p-3 border border-rose-200 text-xs text-rose-800 flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Live Preview */}
          {inputText.trim().length > 0 && (
            <div className="space-y-2 pt-1 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Hasil Pemindaian Jadwal:</span>
                <span className={`font-bold ${validCount > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {validCount} dari {daysInMonth} hari cocok
                </span>
              </div>
              <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 max-h-48 overflow-y-auto p-2 bg-slate-100/70 rounded-xl border border-slate-200">
                {matchedDays.map((item) => {
                  const isMatched = item.shift !== null;
                  return (
                    <div
                      key={item.day}
                      className={`flex flex-col items-center justify-center p-1 rounded-lg border text-center transition-all ${
                        isMatched
                          ? 'bg-white border-emerald-300 shadow-2xs'
                          : 'bg-slate-200/50 border-slate-300 text-slate-400'
                      }`}
                    >
                      <span className="text-[9px] font-bold text-slate-500">Tgl {item.day}</span>
                      {isMatched && item.shift ? (
                        <span
                          className={`mt-0.5 px-1 rounded text-[10px] font-black ${
                            SHIFT_COLORS[item.shift].bg
                          } ${SHIFT_COLORS[item.shift].text}`}
                        >
                          {item.shift}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-full">
                          {item.raw ? item.raw.slice(0, 4) : '-'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 border-t border-slate-200 px-5 py-3.5 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={validCount === 0}
            className={`flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer ${
              validCount > 0
                ? 'bg-teal-600 hover:bg-teal-500 cursor-pointer'
                : 'bg-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <Check className="h-4 w-4" />
            <span>Terapkan ({validCount} Hari)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
