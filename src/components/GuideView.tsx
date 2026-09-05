import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  ClipboardPaste,
  Clock,
  ArrowLeftRight,
  Award,
  Database,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Zap,
  Info,
  Copy,
  Check,
  Code
} from 'lucide-react';
import { SUPABASE_SQL_SETUP_SCRIPT } from '../lib/supabaseSync';
import { AppTheme } from '../types';

interface GuideSection {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

interface GuideViewProps {
  theme?: AppTheme;
}

export const GuideView: React.FC<GuideViewProps> = ({ theme = 'default' }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    jadwal: false,
    paste: false,
    liburCsv: false,
    resetUndo: false,
    lembur: false,
    geserOff: false,
    ceisa: false,
    sync: false,
    shortcutsNav: false,
  });

  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSqlExpanded, setIsSqlExpanded] = useState(false);
  const promptText = `Bertindaklah sebagai asisten kalender. Tolong berikan saya data Libur Nasional Indonesia untuk tahun 2026 berdasarkan SKB 3 Menteri terbaru. Berikan HANYA dalam format teks mentah CSV 2 kolom tanpa header, dengan pemisah koma. Format: YYYY-MM-DD,Nama Hari Libur. Jangan tambahkan penjelasan apa pun di awal atau akhir.`;

  const isDark = theme === 'dark';
  const isVista = theme === 'vista';
  const isWinamp = theme === 'winamp';

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 3000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    setOpenSections({
      jadwal: true,
      paste: true,
      liburCsv: true,
      resetUndo: true,
      lembur: true,
      geserOff: true,
      ceisa: true,
      sync: true,
      shortcutsNav: true,
    });
  };

  const collapseAll = () => {
    setOpenSections({
      jadwal: false,
      paste: false,
      liburCsv: false,
      resetUndo: false,
      lembur: false,
      geserOff: false,
      ceisa: false,
      sync: false,
      shortcutsNav: false,
    });
  };

  // --- Theme Tokens ---
  const textMutedClass = isDark
    ? 'text-slate-300'
    : isVista
    ? 'text-slate-700'
    : isWinamp
    ? 'text-slate-300 font-mono'
    : 'text-slate-600';

  const textHeadingClass = isDark
    ? 'text-white'
    : isVista
    ? 'text-slate-900 drop-shadow-xs'
    : isWinamp
    ? 'text-[#00FF00] font-mono uppercase'
    : 'text-slate-900';

  // Sub cards (standard neutral cards inside accordion)
  const neutralSubCardClass = isDark
    ? 'rounded-xl bg-[#222222] p-3.5 border border-white/10 ring-1 ring-white/10'
    : isVista
    ? 'rounded-xl bg-white/70 backdrop-blur-md p-3.5 border border-white/50 shadow-xs'
    : isWinamp
    ? 'rounded-none bg-[#191919] p-3.5 border-2 border-zinc-700 font-mono shadow-[1px_1px_0_#333]'
    : 'rounded-xl bg-slate-50 p-3.5 border border-slate-200';

  // Shift item card in section 1
  const shiftCardClass = isDark
    ? 'flex items-start gap-2.5 p-2 rounded-lg bg-[#222222] border border-white/10 ring-1 ring-white/10'
    : isVista
    ? 'flex items-start gap-2.5 p-2 rounded-lg bg-white/70 backdrop-blur-md border border-white/50 shadow-xs'
    : isWinamp
    ? 'flex items-start gap-2.5 p-2 rounded-none bg-[#191919] border-2 border-zinc-700 font-mono shadow-[1px_1px_0_#333]'
    : 'flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200';

  // 1. Kotak Template Prompt AI
  const promptBoxContainerClass = isDark
    ? 'rounded-2xl p-4 border border-emerald-500/40 bg-[#0d281e] shadow-md space-y-2.5 ring-1 ring-white/10'
    : isVista
    ? 'rounded-2xl p-4 border border-white/60 bg-gradient-to-r from-emerald-500/25 via-teal-500/25 to-cyan-500/25 backdrop-blur-md shadow-md space-y-2.5 ring-1 ring-emerald-400/30'
    : isWinamp
    ? 'rounded-none p-4 border-2 border-[#00FF00] bg-[#0c1a0c] font-mono space-y-2.5 shadow-[2px_2px_0_#00FF00]'
    : 'rounded-2xl p-4 border border-teal-300 shadow-sm space-y-2.5';

  const promptBoxStyle = (isDark || isVista || isWinamp)
    ? undefined
    : { backgroundColor: '#85FFC7' };

  const promptHeaderTitleClass = isDark
    ? 'font-black text-xs flex items-center gap-1.5 text-emerald-300'
    : isVista
    ? 'font-black text-xs flex items-center gap-1.5 text-emerald-950 drop-shadow-xs'
    : isWinamp
    ? 'font-black text-xs flex items-center gap-1.5 text-[#00FF00] uppercase font-mono tracking-wider'
    : 'font-black text-xs flex items-center gap-1.5 text-slate-950';

  const promptCopyBtnClass = isDark
    ? 'flex items-center space-x-1 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 px-3 py-1.5 text-xs font-bold ring-1 ring-emerald-500/40 shadow-xs transition-all cursor-pointer'
    : isVista
    ? 'flex items-center space-x-1 rounded-xl bg-gradient-to-b from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white border border-white/30 px-3 py-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer'
    : isWinamp
    ? 'flex items-center space-x-1 rounded-none bg-[#142614] hover:bg-[#1f3b1f] text-[#00FF00] px-3 py-1.5 text-xs font-bold border border-[#00FF00] uppercase font-mono shadow-[1px_1px_0_#00FF00] transition-all cursor-pointer'
    : 'flex items-center space-x-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer';

  const promptTextInsideClass = isDark
    ? 'p-3 bg-[#07130e] rounded-xl text-emerald-200 font-mono text-[11px] leading-relaxed select-all border border-emerald-500/30 ring-1 ring-white/10 shadow-inner'
    : isVista
    ? 'p-3 bg-white/80 backdrop-blur-md rounded-xl text-slate-900 font-mono text-[11px] leading-relaxed select-all border border-white/60 shadow-xs'
    : isWinamp
    ? 'p-3 bg-black rounded-none text-[#00FF00] font-mono text-[11px] leading-relaxed select-all border border-[#00FF00]/60'
    : 'p-3 bg-white/90 backdrop-blur-xs rounded-xl text-slate-900 font-mono text-[11px] leading-relaxed select-all border border-emerald-300/60 shadow-2xs';

  const promptSubtextClass = isDark
    ? 'text-[10px] text-emerald-400/80 font-medium italic'
    : isVista
    ? 'text-[10px] text-emerald-950 font-medium italic'
    : isWinamp
    ? 'text-[10px] text-[#00FF00]/80 font-mono italic'
    : 'text-[10px] text-slate-800 font-medium italic';

  // 2. Ketentuan Reset
  const ketentuanResetCardClass = isDark
    ? 'rounded-xl bg-[#261316] p-3.5 border border-rose-900/60 ring-1 ring-white/10'
    : isVista
    ? 'rounded-xl bg-rose-500/15 backdrop-blur-md p-3.5 border border-white/40 ring-1 ring-rose-400/20 shadow-xs'
    : isWinamp
    ? 'rounded-none bg-[#200e12] p-3.5 border-2 border-rose-600 font-mono shadow-[1px_1px_0_#BE1A1A]'
    : 'rounded-xl bg-rose-50 p-3.5 border border-rose-200';

  const ketentuanResetTitleClass = isDark
    ? 'font-bold text-rose-300 flex items-center gap-1.5 mb-1.5 text-xs'
    : isVista
    ? 'font-black text-rose-950 drop-shadow-xs flex items-center gap-1.5 mb-1.5 text-xs'
    : isWinamp
    ? 'font-bold text-rose-400 uppercase font-mono tracking-wider flex items-center gap-1.5 mb-1.5 text-xs'
    : 'font-bold text-rose-950 flex items-center gap-1.5 mb-1.5 text-xs';

  const ketentuanResetTextClass = isDark
    ? 'text-xs text-rose-200/90 leading-normal'
    : isVista
    ? 'text-xs text-rose-950 leading-normal'
    : isWinamp
    ? 'text-xs text-rose-200 leading-normal font-mono'
    : 'text-xs text-rose-900 leading-normal';

  // 3. Tombol Batal (Undo)
  const tombolBatalCardClass = isDark
    ? 'rounded-xl bg-[#261e12] p-3.5 border border-amber-900/60 ring-1 ring-white/10'
    : isVista
    ? 'rounded-xl bg-amber-500/15 backdrop-blur-md p-3.5 border border-white/40 ring-1 ring-amber-400/20 shadow-xs'
    : isWinamp
    ? 'rounded-none bg-[#22180a] p-3.5 border-2 border-amber-500 font-mono shadow-[1px_1px_0_#d97706]'
    : 'rounded-xl bg-amber-50 p-3.5 border border-amber-200';

  const tombolBatalTitleClass = isDark
    ? 'font-bold text-amber-300 flex items-center gap-1.5 mb-1.5 text-xs'
    : isVista
    ? 'font-black text-amber-950 drop-shadow-xs flex items-center gap-1.5 mb-1.5 text-xs'
    : isWinamp
    ? 'font-bold text-amber-400 uppercase font-mono tracking-wider flex items-center gap-1.5 mb-1.5 text-xs'
    : 'font-bold text-amber-950 flex items-center gap-1.5 mb-1.5 text-xs';

  const tombolBatalTextClass = isDark
    ? 'text-xs text-amber-200/90 leading-normal'
    : isVista
    ? 'text-xs text-amber-950 leading-normal'
    : isWinamp
    ? 'text-xs text-amber-200 leading-normal font-mono'
    : 'text-xs text-amber-900 leading-normal';

  // 4. Kriteria 1 (Durasi Kerja >= 10.5 Jam)
  const kriteria1CardClass = isDark
    ? 'flex items-start gap-2.5 p-3 rounded-xl bg-[#13241b] border border-emerald-900/60 ring-1 ring-white/10'
    : isVista
    ? 'flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/15 backdrop-blur-md border border-white/40 ring-1 ring-emerald-400/20 shadow-xs'
    : isWinamp
    ? 'flex items-start gap-2.5 p-3 rounded-none bg-[#0e1d14] border-2 border-emerald-500 font-mono shadow-[1px_1px_0_#10b981]'
    : 'flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200';

  const kriteria1TitleClass = isDark
    ? 'font-bold text-emerald-200 text-xs'
    : isVista
    ? 'font-black text-emerald-950 drop-shadow-xs text-xs'
    : isWinamp
    ? 'font-bold text-[#00FF00] uppercase font-mono tracking-wider text-xs'
    : 'font-bold text-emerald-950 text-xs';

  const kriteria1TextClass = isDark
    ? 'text-xs text-emerald-300/90 mt-0.5'
    : isVista
    ? 'text-xs text-emerald-950 mt-0.5'
    : isWinamp
    ? 'text-xs text-emerald-300 mt-0.5 font-mono'
    : 'text-xs text-emerald-800 mt-0.5';

  // 5. Kriteria 2 (Masuk di Tanggal Merah)
  const kriteria2CardClass = isDark
    ? 'flex items-start gap-2.5 p-3 rounded-xl bg-[#171b2e] border border-indigo-900/60 ring-1 ring-white/10'
    : isVista
    ? 'flex items-start gap-2.5 p-3 rounded-xl bg-indigo-500/15 backdrop-blur-md border border-white/40 ring-1 ring-indigo-400/20 shadow-xs'
    : isWinamp
    ? 'flex items-start gap-2.5 p-3 rounded-none bg-[#111425] border-2 border-indigo-500 font-mono shadow-[1px_1px_0_#6366f1]'
    : 'flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50 border border-indigo-200';

  const kriteria2TitleClass = isDark
    ? 'font-bold text-indigo-200 text-xs'
    : isVista
    ? 'font-black text-indigo-950 drop-shadow-xs text-xs'
    : isWinamp
    ? 'font-bold text-indigo-300 uppercase font-mono tracking-wider text-xs'
    : 'font-bold text-indigo-950 text-xs';

  const kriteria2TextClass = isDark
    ? 'text-xs text-indigo-300/90 mt-0.5'
    : isVista
    ? 'text-xs text-indigo-950 mt-0.5'
    : isWinamp
    ? 'text-xs text-indigo-300 mt-0.5 font-mono'
    : 'text-xs text-indigo-800 mt-0.5';

  // 6. Menabung OFF & Menarik OFF
  const menabungOffCardClass = isDark
    ? 'rounded-xl bg-[#20152b] p-3.5 border border-purple-900/60 ring-1 ring-white/10'
    : isVista
    ? 'rounded-xl bg-purple-500/15 backdrop-blur-md p-3.5 border border-white/40 ring-1 ring-purple-400/20 shadow-xs'
    : isWinamp
    ? 'rounded-none bg-[#1c0f2b] p-3.5 border-2 border-purple-500 font-mono shadow-[1px_1px_0_#a855f7]'
    : 'rounded-xl bg-purple-50 p-3.5 border border-purple-200';

  const menabungOffTitleClass = isDark
    ? 'font-black text-purple-200 flex items-center gap-1.5 mb-1 text-xs'
    : isVista
    ? 'font-black text-purple-950 drop-shadow-xs flex items-center gap-1.5 mb-1 text-xs'
    : isWinamp
    ? 'font-bold text-purple-300 uppercase font-mono tracking-wider flex items-center gap-1.5 mb-1 text-xs'
    : 'font-black text-purple-950 flex items-center gap-1.5 mb-1 text-xs';

  const menabungOffTextClass = isDark
    ? 'text-xs text-purple-200/90 leading-normal'
    : isVista
    ? 'text-xs text-purple-950 leading-normal'
    : isWinamp
    ? 'text-xs text-purple-200 leading-normal font-mono'
    : 'text-xs text-purple-900 leading-normal';

  const menarikOffCardClass = isDark
    ? 'rounded-xl bg-[#222222] p-3.5 border border-white/10 ring-1 ring-white/10'
    : isVista
    ? 'rounded-xl bg-white/60 backdrop-blur-md p-3.5 border border-white/40 shadow-xs'
    : isWinamp
    ? 'rounded-none bg-[#191919] p-3.5 border-2 border-zinc-700 font-mono shadow-[1px_1px_0_#444]'
    : 'rounded-xl bg-slate-50 p-3.5 border border-slate-200';

  const menarikOffTitleClass = isDark
    ? 'font-black text-slate-100 flex items-center gap-1.5 mb-1 text-xs'
    : isVista
    ? 'font-black text-slate-900 drop-shadow-xs flex items-center gap-1.5 mb-1 text-xs'
    : isWinamp
    ? 'font-bold text-zinc-300 uppercase font-mono tracking-wider flex items-center gap-1.5 mb-1 text-xs'
    : 'font-black text-slate-900 flex items-center gap-1.5 mb-1 text-xs';

  const menarikOffTextClass = isDark
    ? 'text-xs text-slate-300 leading-normal'
    : isVista
    ? 'text-xs text-slate-800 leading-normal'
    : isWinamp
    ? 'text-xs text-slate-300 leading-normal font-mono'
    : 'text-xs text-slate-700 leading-normal';

  // 7. Project URL Link di menu petunjuk
  const projectUrlCodeClass = isDark
    ? 'bg-[#333333] px-1.5 py-0.5 rounded font-mono text-emerald-400 font-bold border border-emerald-500/40 ring-1 ring-emerald-500/20'
    : isVista
    ? 'bg-white/90 px-1.5 py-0.5 rounded font-mono text-teal-800 font-bold border border-teal-300 shadow-2xs'
    : isWinamp
    ? 'bg-[#333333] px-1.5 py-0.5 rounded-none font-mono text-[#00FF00] font-bold border border-[#00FF00]/60'
    : 'bg-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-800 font-bold border border-slate-300';

  // 8. Keyboard & Code Highlights
  const kbdHighlightClass = isDark
    ? 'px-1.5 py-0.5 rounded font-mono font-bold bg-[#333333] text-white border border-white/20 shadow-xs'
    : isWinamp
    ? 'px-1.5 py-0.5 rounded-none font-mono font-bold bg-[#333333] text-[#00FF00] border border-[#00FF00]/60'
    : isVista
    ? 'px-1.5 py-0.5 rounded font-mono font-bold bg-white/90 text-slate-900 border border-slate-300 shadow-xs'
    : 'px-1.5 py-0.5 rounded font-mono font-bold bg-slate-200 text-slate-800 border border-slate-300 shadow-2xs';

  const codeHighlightClass = isDark
    ? 'px-1.5 py-0.5 rounded font-mono font-bold bg-[#333333] text-emerald-300 border border-white/10'
    : isWinamp
    ? 'px-1.5 py-0.5 rounded-none font-mono font-bold bg-[#333333] text-[#00FF00] border border-[#00FF00]/60'
    : isVista
    ? 'px-1.5 py-0.5 rounded font-mono font-bold bg-white/90 text-slate-900 border border-slate-300 shadow-xs'
    : 'px-1.5 py-0.5 rounded font-mono font-bold bg-slate-200 text-slate-800 border border-slate-300';

  // Sections definition
  const sections: GuideSection[] = [
    {
      id: 'jadwal',
      title: '1. Cara Mengisi & Mengubah Jadwal Shift',
      badge: 'Input Jadwal',
      badgeColor: isWinamp
        ? 'bg-zinc-800 text-[#00FF00] border-[#00FF00]/60'
        : isDark
        ? 'bg-[#252525] text-teal-300 border-teal-500/40'
        : 'bg-teal-100 text-teal-800 border-teal-200',
      icon: Calendar,
      content: (
        <div className={`space-y-4 text-xs sm:text-sm ${textMutedClass} leading-relaxed`}>
          <p>
            Aplikasi menyediakan dua cara fleksibel untuk mengubah jadwal harian:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className={neutralSubCardClass}>
              <span className={`font-bold flex items-center gap-1.5 mb-1.5 text-xs ${textHeadingClass}`}>
                <Zap className="h-4 w-4 text-amber-500" />
                Cara Cepat (Dropdown Kalender)
              </span>
              <p className={`text-xs ${textMutedClass}`}>
                Pilih langsung shift pada tombol dropdown di dalam kotak tanggal pada kalender. Jadwal langsung tersimpan secara otomatis.
              </p>
            </div>
            <div className={neutralSubCardClass}>
              <span className={`font-bold flex items-center gap-1.5 mb-1.5 text-xs ${textHeadingClass}`}>
                <Info className="h-4 w-4 text-indigo-500" />
                Pop-up Detail Lengkap
              </span>
              <p className={`text-xs ${textMutedClass}`}>
                Klik kartu tanggal atau ikon pensil untuk membuka jendela edit lengkap (Jam Masuk, Jam Pulang, Absen CEISA, Kunci Tanggal, Hold Dokumen, dan Catatan).
              </p>
            </div>
          </div>

          <div className="pt-2">
            <h4 className={`font-bold text-xs mb-2 ${textHeadingClass}`}>Daftar Singkatan & Jenis Shift:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div className={shiftCardClass}>
                <span className={`px-2 py-0.5 ${isWinamp ? 'rounded-none' : 'rounded-md'} bg-[#EDF6F9] text-[#1D2A44] border ${isDark || isWinamp ? 'border-white/40 ring-1 ring-white/20' : 'border-[#83C5BE]'} font-black text-xs shrink-0`}>G</span>
                <div>
                  <p className={`font-bold text-xs ${textHeadingClass}`}>Graha</p>
                  <p className={`text-[11px] ${textMutedClass}`}>FCL Graha, Koja, JICT. 07.30 - 17.00 WIB</p>
                </div>
              </div>
              <div className={shiftCardClass}>
                <span className={`px-2 py-0.5 ${isWinamp ? 'rounded-none' : 'rounded-md'} bg-[#E29578] text-white border ${isDark || isWinamp ? 'border-white/40 ring-1 ring-white/20' : 'border-[#C8775B]'} font-black text-xs shrink-0`}>TPSL</span>
                <div>
                  <p className={`font-bold text-xs ${textHeadingClass}`}>TPSL</p>
                  <p className={`text-[11px] ${textMutedClass}`}>TPS Lainnya selain Graha dan NPCT. 07.30 - 17.00 WIB.</p>
                </div>
              </div>
              <div className={shiftCardClass}>
                <span className={`px-2 py-0.5 ${isWinamp ? 'rounded-none' : 'rounded-md'} bg-[#FFDDD2] text-[#39393A] border ${isDark || isWinamp ? 'border-white/40 ring-1 ring-white/20' : 'border-[#E29578]'} font-black text-xs shrink-0`}>N</span>
                <div>
                  <p className={`font-bold text-xs ${textHeadingClass}`}>NPCT</p>
                  <p className={`text-[11px] ${textMutedClass}`}>FCL NPCT. 07.30 - 17.00 WIB</p>
                </div>
              </div>
              <div className={shiftCardClass}>
                <span className={`px-2 py-0.5 ${isWinamp ? 'rounded-none' : 'rounded-md'} bg-[#BE1A1A] text-white border border-white/40 font-black text-xs shrink-0`}>OFF</span>
                <div>
                  <p className={`font-bold text-xs ${textHeadingClass}`}>Libur / OFF</p>
                  <p className={`text-[11px] ${textMutedClass}`}>Hari libur sesuai jadwal atau geser off</p>
                </div>
              </div>
              <div className={shiftCardClass}>
                <span className={`px-2 py-0.5 ${isWinamp ? 'rounded-none' : 'rounded-md'} bg-[#83C5BE] text-[#0B0909] border ${isDark || isWinamp ? 'border-white/40 ring-1 ring-white/20' : 'border-[#006D77]'} font-black text-xs shrink-0`}>SM</span>
                <div>
                  <p className={`font-bold text-xs ${textHeadingClass}`}>Siang - Malam (SM)</p>
                  <p className={`text-[11px] ${textMutedClass}`}>Masuk 12.30 - 22.00 WIB</p>
                </div>
              </div>
              <div className={shiftCardClass}>
                <span className={`px-2 py-0.5 ${isWinamp ? 'rounded-none' : 'rounded-md'} bg-[#006D77] text-white border border-white/40 font-black text-xs shrink-0`}>PM</span>
                <div>
                  <p className={`font-bold text-xs ${textHeadingClass}`}>Pagi - Malam (PM)</p>
                  <p className={`text-[11px] ${textMutedClass}`}>07.30 - 20.00 & 04.30 WIB</p>
                </div>
              </div>
              <div className={shiftCardClass}>
                <span className={`px-2 py-0.5 ${isWinamp ? 'rounded-none' : 'rounded-md'} bg-[#2C4251] text-white border border-white/40 font-black text-xs shrink-0`}>M</span>
                <div>
                  <p className={`font-bold text-xs ${textHeadingClass}`}>Malam</p>
                  <p className={`text-[11px] ${textMutedClass}`}>17.00 - 20.00 & 04.30 WIB</p>
                </div>
              </div>
              <div className={shiftCardClass}>
                <span className={`px-2 py-0.5 ${isWinamp ? 'rounded-none' : 'rounded-md'} bg-[#0B0909] text-white border border-white/40 font-black text-xs shrink-0`}>CUTI</span>
                <div>
                  <p className={`font-bold text-xs ${textHeadingClass}`}>CUTI</p>
                  <p className={`text-[11px] ${textMutedClass}`}>Jadwal cuti yang tertera pada ST bulanan</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'paste',
      title: '2. Fitur Cepat: Tempel Jadwal Satu Baris (Excel / Spreadsheet)',
      badge: 'Impor Otomatis',
      badgeColor: isWinamp
        ? 'bg-zinc-800 text-[#00FF00] border-[#00FF00]/60'
        : isDark
        ? 'bg-[#252525] text-emerald-300 border-emerald-500/40'
        : 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: ClipboardPaste,
      content: (
        <div className={`space-y-3 text-xs sm:text-sm ${textMutedClass} leading-relaxed`}>
          <p>
            Anda dapat menyalin jadwal 1 bulan penuh langsung dari lembar Microsoft Excel atau Google Spreadsheet tanpa perlu mengetik satu per satu.
          </p>
          <div className={`${isWinamp ? 'rounded-none bg-black border-2 border-zinc-700' : 'bg-slate-900 rounded-xl'} text-slate-100 p-3.5 text-xs font-mono`}>
            Contoh baris Excel yang di-copy:
            <div className={`mt-1.5 p-2 ${isWinamp ? 'rounded-none bg-[#121212] border border-[#00FF00]/40' : 'bg-slate-800 rounded'} text-emerald-400 overflow-x-auto`}>
              G	G	OFF	L	L	N	N	OFF	SM	SM	M	CUTI	G	G ...
            </div>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-xs">
            <li>Buka lembar Excel jadwal Anda, lalu blok baris kode jadwal dari tanggal 1 sampai akhir bulan.</li>
            <li>Tekan <kbd className={kbdHighlightClass}>Ctrl+C</kbd> (Salin).</li>
            <li>Buka aplikasi ini dan klik tombol <strong>"Tempel Jadwal"</strong> (atau tekan <kbd className={kbdHighlightClass}>Ctrl+V</kbd> langsung di halaman kalender).</li>
            <li>Aplikasi akan memetakan otomatis singkatan kode (G, L, N, O/OFF, SM, PM, M, CUTI/C) ke seluruh hari pada bulan aktif dengan penyesuaian jam kerja standar.</li>
          </ol>
        </div>
      ),
    },
    {
      id: 'liburCsv',
      title: '3. Fitur Impor Hari Libur Nasional dari File / Teks CSV',
      badge: 'Impor Libur CSV',
      badgeColor: isWinamp
        ? 'bg-zinc-800 text-rose-400 border-rose-600'
        : isDark
        ? 'bg-[#252525] text-rose-300 border-rose-500/40'
        : 'bg-rose-100 text-rose-800 border-rose-200',
      icon: Sparkles,
      content: (
        <div className={`space-y-3.5 text-xs sm:text-sm ${textMutedClass} leading-relaxed`}>
          <p>
            Anda dapat menambahkan daftar Hari Libur Nasional & Cuti Bersama secara massal menggunakan file CSV atau teks dengan <strong>format 2 kolom</strong>: <code className={codeHighlightClass}>YYYY-MM-DD,Keterangan (Contoh: 2026-01-01,Tahun Baru Masehi)</code>.
          </p>

          {/* Kotak Template Prompt AI beserta isinya */}
          <div className={promptBoxContainerClass} style={promptBoxStyle}>
            <div className="flex items-center justify-between">
              <span className={promptHeaderTitleClass}>
                <Sparkles className="h-4 w-4 shrink-0" />
                Template Prompt AI untuk Generate CSV Libur 2026:
              </span>
              <button
                type="button"
                onClick={handleCopyPrompt}
                className={promptCopyBtnClass}
              >
                {copiedPrompt ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <span>Salin Prompt</span>
                  </>
                )}
              </button>
            </div>
            <div className={promptTextInsideClass}>
              {promptText}
            </div>
            <p className={promptSubtextClass}>
              * Salin teks di atas dan berikan ke asisten AI untuk mendapatkan data CSV libur nasional 2026 instan siap tempel.
            </p>
          </div>

          <div className={`${isWinamp ? 'rounded-none bg-black border-2 border-zinc-700' : 'bg-slate-900 rounded-2xl border border-slate-800'} text-slate-100 p-4 font-mono text-xs space-y-2`}>
            <div className="text-amber-400 font-bold flex items-center justify-between">
              <span>Format 2 Kolom CSV:</span>
              <span className="text-[10px] text-slate-400">Pemisah: Koma (,)</span>
            </div>
            <div className={`p-2.5 ${isWinamp ? 'rounded-none bg-[#111111] border border-zinc-700' : 'bg-slate-950 rounded-xl'} text-emerald-300 overflow-x-auto leading-relaxed`}>
              2026-01-01,Tahun Baru 2026 Masehi<br />
              2026-02-17,Tahun Baru Imlek 2577 Kongzili<br />
              2026-03-20,Hari Raya Idul Fitri 1447 H<br />
              2026-05-01,Hari Buruh Internasional<br />
              2026-08-17,Hari Kemerdekaan Republik Indonesia Ke-81
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className={neutralSubCardClass}>
              <span className={`font-black text-xs block mb-1 ${textHeadingClass}`}>Kolom 1: Tanggal</span>
              <p className={`text-xs ${textMutedClass}`}>Format tanggal internasional <code className={codeHighlightClass}>YYYY-MM-DD</code> (contoh: 2026-08-17).</p>
            </div>
            <div className={neutralSubCardClass}>
              <span className={`font-black text-xs block mb-1 ${textHeadingClass}`}>Kolom 2: Keterangan</span>
              <p className={`text-xs ${textMutedClass}`}>Nama resmi hari libur nasional atau cuti bersama (contoh: Tahun Baru Masehi).</p>
            </div>
          </div>

          <div className={`${isDark ? 'rounded-xl bg-[#171b2e] p-3 border border-indigo-900/60 ring-1 ring-white/10 text-indigo-300' : isVista ? 'rounded-xl bg-indigo-500/15 backdrop-blur-md p-3 border border-white/40 ring-1 ring-indigo-400/20 text-indigo-950' : isWinamp ? 'rounded-none bg-[#111425] p-3 border-2 border-indigo-500 font-mono text-indigo-200' : 'rounded-xl bg-indigo-50 p-3 border border-indigo-200 text-indigo-900'} text-xs flex items-start gap-2`}>
            <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <strong>Langkah Impor:</strong> Buka menu <strong>"Libur Nasional"</strong> di atas kalender &rarr; klik tombol <strong>"Impor CSV"</strong> &rarr; pilih file <code className={codeHighlightClass}>.csv</code> atau tempel teks ke kotak dialog &rarr; klik <strong>"Proses & Simpan CSV"</strong>. Seluruh tanggal libur akan otomatis ditandai dan disimpan ke database lokal & cloud.
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'resetUndo',
      title: '4. Fitur Reset Kalender & Keamanan Tombol Batal (Undo)',
      badge: 'Reset & Undo',
      badgeColor: isWinamp
        ? 'bg-zinc-800 text-amber-400 border-amber-500'
        : isDark
        ? 'bg-[#252525] text-amber-300 border-amber-500/40'
        : 'bg-amber-100 text-amber-800 border-amber-200',
      icon: AlertCircle,
      content: (
        <div className={`space-y-3 text-xs sm:text-sm ${textMutedClass} leading-relaxed`}>
          <p>
            Aplikasi menyediakan fitur pengosongan seluruh data kalender dengan proteksi keamanan ganda:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Ketentuan Reset */}
            <div className={ketentuanResetCardClass}>
              <span className={ketentuanResetTitleClass}>
                <AlertCircle className="h-4 w-4 shrink-0" />
                Ketentuan Reset
              </span>
              <p className={ketentuanResetTextClass}>
                Tombol <strong>"Reset"</strong> mengosongkan seluruh shift, jam masuk, jam pulang, absen CEISA, dan catatan untuk seluruh tanggal pada bulan aktif. Tombol ini <strong>hanya dapat diklik saat status kunci data terbuka</strong>.
              </p>
            </div>
            {/* Tombol Batal (Undo) */}
            <div className={tombolBatalCardClass}>
              <span className={tombolBatalTitleClass}>
                <Sparkles className="h-4 w-4 shrink-0" />
                Tombol Batal (Undo)
              </span>
              <p className={tombolBatalTextClass}>
                Setelah reset dieksekusi, pemberitahuan SnackBar & tombol <strong>"Batal Reset"</strong> akan muncul selama data tidak terkunci. Anda dapat mengkliknya seketika untuk memulihkan seluruh data sebelumnya tanpa kehilangan data.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'lembur',
      title: '5. Logika & Perhitungan Lembur Otomatis',
      badge: 'Kalkulasi Lembur',
      badgeColor: isWinamp
        ? 'bg-zinc-800 text-indigo-300 border-indigo-500'
        : isDark
        ? 'bg-[#252525] text-indigo-300 border-indigo-500/40'
        : 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Clock,
      content: (
        <div className={`space-y-3 text-xs sm:text-sm ${textMutedClass} leading-relaxed`}>
          <p>
            Sistem kalkulator akan mendeteksi status lembur secara otomatis berdasarkan kriteria berikut:
          </p>
          <div className="space-y-2.5">
            {/* Kriteria 1 */}
            <div className={kriteria1CardClass}>
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-500" />
              <div>
                <span className={kriteria1TitleClass}>Kriteria 1: Durasi Kerja ≥ 10.5 Jam</span>
                <p className={kriteria1TextClass}>
                  Jika selisih jam masuk dan jam pulang mencapai atau melebihi 10 jam 30 menit (termasuk jeda istirahat), sistem secara otomatis menandai hari tersebut sebagai <strong>Lembur (Indikator Hijau)</strong> dan menghitung jam lembur bersih.
                </p>
              </div>
            </div>
            {/* Kriteria 2 */}
            <div className={kriteria2CardClass}>
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-indigo-500" />
              <div>
                <span className={kriteria2TitleClass}>Kriteria 2: Masuk di Tanggal Merah / Libur Nasional</span>
                <p className={kriteria2TextClass}>
                  Jika Anda masuk bertugas pada hari libur resmi atau tanggal merah dengan opsi <strong>"Lembur"</strong> atau <strong>"Surat Tugas Tambahan"</strong>, seluruh jam dinas akan diakumulasikan ke total lembur bulanan.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'geserOff',
      title: '6. Sistem Tabungan & Pengambilan OFF Geser',
      badge: 'Mutasi OFF',
      badgeColor: isWinamp
        ? 'bg-zinc-800 text-purple-300 border-purple-500'
        : isDark
        ? 'bg-[#252525] text-purple-300 border-purple-500/40'
        : 'bg-purple-100 text-purple-800 border-purple-200',
      icon: ArrowLeftRight,
      content: (
        <div className={`space-y-3 text-xs sm:text-sm ${textMutedClass} leading-relaxed`}>
          <p>
            Sistem OFF Geser memudahkan Anda mencatat kompensasi jadwal ketika diminta masuk di hari libur atau mengambil hak libur di hari kerja:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Menabung OFF */}
            <div className={menabungOffCardClass}>
              <span className={menabungOffTitleClass}>
                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                Menabung OFF (+1 Hari)
              </span>
              <p className={menabungOffTextClass}>
                Pada hari dengan shift <strong>OFF</strong> normal di weekdays, aktifkan saklar <strong>"Masuk"</strong>. Status akan otomatis menjadi <strong>"OFF Ditabung (+1)"</strong> dan menambah kuota saldo OFF Anda.
              </p>
            </div>
            {/* Menarik OFF */}
            <div className={menarikOffCardClass}>
              <span className={menarikOffTitleClass}>
                <span className="h-2 w-2 rounded-full bg-slate-500"></span>
                Menarik / Mengambil OFF (-1 Hari)
              </span>
              <p className={menarikOffTextClass}>
                Pada hari kerja biasa, matikan saklar <strong>"Masuk"</strong> lalu centang <strong>"Ambil OFF Geser"</strong>. Tuliskan catatan tanggal tabungan yang digunakan (contoh: <em>"Ganti tgl 12"</em>). Kuota OFF berkurang 1.
              </p>
            </div>
          </div>
          <div className={`${isDark ? 'rounded-lg bg-[#261e12] p-2.5 border border-amber-900/60 ring-1 ring-white/10 text-amber-200' : isVista ? 'rounded-lg bg-amber-500/15 backdrop-blur-md p-2.5 border border-white/40 text-amber-950' : isWinamp ? 'rounded-none bg-[#22180a] p-2.5 border-2 border-amber-500 font-mono text-amber-200' : 'rounded-lg bg-amber-50 p-2.5 border border-amber-200 text-amber-900'} text-[11px] flex items-center gap-2`}>
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            <span>Rekapitulasi sisa kuota dan rincian OFF ditabung/diambil tersaji terpadu pada kartu ringkasan di bawah kalender.</span>
          </div>
        </div>
      ),
    },
    {
      id: 'ceisa',
      title: '7. Evaluasi & Predikat Performa Absen CEISA',
      badge: 'Skala Absen CEISA',
      badgeColor: isWinamp
        ? 'bg-zinc-800 text-amber-400 border-amber-500'
        : isDark
        ? 'bg-[#252525] text-amber-300 border-amber-500/40'
        : 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Award,
      content: (
        <div className={`space-y-3.5 text-xs sm:text-sm ${textMutedClass} leading-relaxed`}>
          <p>
            Penilaian performa kedisiplinan CEISA dihitung berdasarkan jam absensi masuk sistem:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Shift Pagi / Reguler */}
            <div className={neutralSubCardClass}>
              <h5 className={`font-bold text-xs mb-2 ${isDark ? 'text-indigo-400' : isWinamp ? 'text-[#00FF00]' : 'text-indigo-700'}`}>
                A. Shift Pagi / Normal (Graha, TPSL, NPCT)
              </h5>
              <ul className="space-y-1.5 text-xs">
                <li className={`flex items-center justify-between p-1.5 ${isWinamp ? 'rounded-none' : 'rounded'} ${isDark ? 'bg-emerald-950/60 text-emerald-200' : 'bg-emerald-50 text-emerald-900'} font-medium`}>
                  <span>Absen ≤ 07:30</span>
                  <span className={`px-2 py-0.5 bg-emerald-600 text-white ${isWinamp ? 'rounded-none' : 'rounded-md'} font-bold text-[11px] border border-white/20`}>Skala 4 (Sangat Patuh)</span>
                </li>
                <li className={`flex items-center justify-between p-1.5 ${isWinamp ? 'rounded-none' : 'rounded'} ${isDark ? 'bg-blue-950/60 text-blue-200' : 'bg-blue-50 text-blue-900'} font-medium`}>
                  <span>Absen 07:31 - 08:00</span>
                  <span className={`px-2 py-0.5 bg-blue-600 text-white ${isWinamp ? 'rounded-none' : 'rounded-md'} font-bold text-[11px] border border-white/20`}>Skala 3 (Patuh)</span>
                </li>
                <li className={`flex items-center justify-between p-1.5 ${isWinamp ? 'rounded-none' : 'rounded'} ${isDark ? 'bg-amber-950/60 text-amber-200' : 'bg-amber-50 text-amber-900'} font-medium`}>
                  <span>Absen 08:01 - 08:45</span>
                  <span className={`px-2 py-0.5 bg-amber-600 text-white ${isWinamp ? 'rounded-none' : 'rounded-md'} font-bold text-[11px] border border-white/20`}>Skala 2 (Kurang Patuh)</span>
                </li>
                <li className={`flex items-center justify-between p-1.5 ${isWinamp ? 'rounded-none' : 'rounded'} ${isDark ? 'bg-rose-950/60 text-rose-200' : 'bg-rose-50 text-rose-900'} font-medium`}>
                  <span>Absen &gt; 08:45</span>
                  <span className={`px-2 py-0.5 bg-rose-600 text-white ${isWinamp ? 'rounded-none' : 'rounded-md'} font-bold text-[11px] border border-white/20`}>Skala 1 (Tidak Patuh)</span>
                </li>
              </ul>
            </div>

            {/* Shift Siang */}
            <div className={neutralSubCardClass}>
              <h5 className={`font-bold text-xs mb-2 ${isDark ? 'text-indigo-400' : isWinamp ? 'text-[#00FF00]' : 'text-indigo-700'}`}>
                B. Shift Siang (SM)
              </h5>
              <ul className="space-y-1.5 text-xs">
                <li className={`flex items-center justify-between p-1.5 ${isWinamp ? 'rounded-none' : 'rounded'} ${isDark ? 'bg-emerald-950/60 text-emerald-200' : 'bg-emerald-50 text-emerald-900'} font-medium`}>
                  <span>Absen ≤ 13:00</span>
                  <span className={`px-2 py-0.5 bg-emerald-600 text-white ${isWinamp ? 'rounded-none' : 'rounded-md'} font-bold text-[11px] border border-white/20`}>Skala 4 (Sangat Patuh)</span>
                </li>
                <li className={`flex items-center justify-between p-1.5 ${isWinamp ? 'rounded-none' : 'rounded'} ${isDark ? 'bg-blue-950/60 text-blue-200' : 'bg-blue-50 text-blue-900'} font-medium`}>
                  <span>Absen 13:01 - 13:15</span>
                  <span className={`px-2 py-0.5 bg-blue-600 text-white ${isWinamp ? 'rounded-none' : 'rounded-md'} font-bold text-[11px] border border-white/20`}>Skala 3 (Patuh)</span>
                </li>
                <li className={`flex items-center justify-between p-1.5 ${isWinamp ? 'rounded-none' : 'rounded'} ${isDark ? 'bg-amber-950/60 text-amber-200' : 'bg-amber-50 text-amber-900'} font-medium`}>
                  <span>Absen 13:16 - 13:30</span>
                  <span className={`px-2 py-0.5 bg-amber-600 text-white ${isWinamp ? 'rounded-none' : 'rounded-md'} font-bold text-[11px] border border-white/20`}>Skala 2 (Kurang Patuh)</span>
                </li>
                <li className={`flex items-center justify-between p-1.5 ${isWinamp ? 'rounded-none' : 'rounded'} ${isDark ? 'bg-rose-950/60 text-rose-200' : 'bg-rose-50 text-rose-900'} font-medium`}>
                  <span>Absen &gt; 13:30</span>
                  <span className={`px-2 py-0.5 bg-rose-600 text-white ${isWinamp ? 'rounded-none' : 'rounded-md'} font-bold text-[11px] border border-white/20`}>Skala 1 (Tidak Patuh)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className={`${isDark ? 'rounded-xl bg-[#261e12] p-3 border border-amber-900/60 ring-1 ring-white/10' : isVista ? 'rounded-xl bg-amber-500/15 backdrop-blur-md p-3 border border-white/40' : isWinamp ? 'rounded-none bg-[#22180a] p-3 border-2 border-amber-500 font-mono' : 'rounded-xl bg-amber-50/80 p-3 border border-amber-200'}`}>
            <span className={`font-bold text-xs flex items-center gap-1.5 mb-1 ${isDark ? 'text-amber-300' : isWinamp ? 'text-amber-300' : 'text-amber-900'}`}>
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Ketentuan Khusus "Hold Dokumen":
            </span>
            <p className={`text-xs ${isDark ? 'text-amber-200/90' : isWinamp ? 'text-amber-200 font-mono' : 'text-amber-800'}`}>
              Jika saklar <strong>"Hold Dokumen"</strong> diaktifkan (misal karena antrean CEISA tertahan atau kendala jaringan), hari tersebut <strong>dikecualikan (tidak dihitung)</strong> dari agregat skala performa agar tidak menurunkan nilai rata-rata Anda.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'sync',
      title: '8. Panduan Lengkap Setup Supabase & Akses Data Lintas Aplikasi',
      badge: 'Supabase & Cloud Sync',
      badgeColor: isWinamp
        ? 'bg-zinc-800 text-[#00FF00] border-[#00FF00]/60'
        : isDark
        ? 'bg-[#252525] text-emerald-300 border-emerald-500/40'
        : 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Database,
      content: (
        <div className={`space-y-4 text-xs sm:text-sm ${textMutedClass} leading-relaxed`}>
          <div className={`${isDark ? 'rounded-xl bg-[#171b2e] p-3.5 border border-indigo-900/60 ring-1 ring-white/10 text-indigo-200' : isVista ? 'rounded-xl bg-indigo-500/15 backdrop-blur-md p-3.5 border border-white/40 text-indigo-950' : isWinamp ? 'rounded-none bg-[#111425] p-3.5 border-2 border-indigo-500 font-mono text-indigo-200' : 'rounded-xl bg-indigo-50/80 p-3.5 border border-indigo-200 text-indigo-950'}`}>
            <h4 className={`font-black text-xs sm:text-sm mb-1 ${isDark ? 'text-indigo-200' : isWinamp ? 'text-indigo-300' : 'text-indigo-900'}`}>
              Kenapa Menggunakan Supabase untuk Sinkronisasi Antar Perangkat?
            </h4>
            <p className="text-xs leading-relaxed opacity-90">
              Supabase adalah database cloud berbasis PostgreSQL yang cepat, aman, dan gratis. Dengan menghubungkan Supabase, data jadwal shift Anda akan tersinkron otomatis antar HP Android, Laptop, dan Browser tanpa server perantara berbayar.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className={`font-extrabold text-xs sm:text-sm ${textHeadingClass}`}>
              Langkah Demi Langkah Konfigurasi Supabase:
            </h4>

            {/* Step 1 */}
            <div className={neutralSubCardClass}>
              <span className={`font-bold text-xs flex items-center gap-2 ${textHeadingClass}`}>
                <span className={`flex h-5 w-5 items-center justify-center ${isWinamp ? 'rounded-none' : 'rounded-full'} bg-[#297373] text-white text-[11px] font-black border border-white/20`}>1</span>
                Buat Project Supabase Baru (Gratis)
              </span>
              <p className={`text-xs pl-7 mt-1 ${textMutedClass}`}>
                Buka <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-[#297373] hover:underline font-bold">supabase.com</a>, daftar/login, klik <strong>"New Project"</strong>, beri nama project (misal: <em>Jadwal Shift</em>) dan tentukan Database Password. Tunggu 1-2 menit hingga status project aktif.
              </p>
            </div>

            {/* Step 2 */}
            <div className={neutralSubCardClass}>
              <span className={`font-bold text-xs flex items-center gap-2 ${textHeadingClass}`}>
                <span className={`flex h-5 w-5 items-center justify-center ${isWinamp ? 'rounded-none' : 'rounded-full'} bg-[#297373] text-white text-[11px] font-black border border-white/20`}>2</span>
                Ambil Project URL dan Anon Key
              </span>
              <div className={`text-xs pl-7 space-y-1 mt-1 ${textMutedClass}`}>
                <p>
                  Di dashboard project Supabase Anda:
                </p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Klik ikon <strong>Project Settings (Gerigi)</strong> di sidebar kiri bawah.</li>
                  <li>Pilih menu <strong>API</strong> (atau <em>Data API</em> pada versi dashboard terbaru).</li>
                  <li>Salin <strong>Project URL</strong> (contoh: <code className={projectUrlCodeClass}>https://abcdefgh.supabase.co</code>).</li>
                  <li>Salin <strong>Project API Keys ➔ anon / public key</strong>.</li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className={neutralSubCardClass}>
              <div className="flex items-center justify-between gap-2">
                <span className={`font-bold text-xs flex items-center gap-2 ${textHeadingClass}`}>
                  <span className={`flex h-5 w-5 items-center justify-center ${isWinamp ? 'rounded-none' : 'rounded-full'} bg-[#297373] text-white text-[11px] font-black border border-white/20`}>3</span>
                  Buat Tabel 'shifts', Kolom Baru & Aturan RLS di SQL Editor
                </span>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className={`flex items-center space-x-1 ${isWinamp ? 'rounded-none' : 'rounded-lg'} bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white transition-colors cursor-pointer shadow-2xs border border-white/20`}
                    title="Salin seluruh script SQL setup ke clipboard"
                  >
                    {copiedSql ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSql ? 'Tersalin!' : 'Salin Script SQL'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSqlExpanded(!isSqlExpanded)}
                    className={`flex items-center space-x-1 ${isWinamp ? 'rounded-none bg-[#242424] text-[#00FF00] border-zinc-700' : isDark ? 'rounded-lg bg-[#2b2b2b] text-white border-white/20' : 'rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'} px-2 py-1 text-[11px] font-bold transition-colors cursor-pointer`}
                    title={isSqlExpanded ? 'Lipat tampilan script SQL' : 'Buka tampilan script SQL'}
                  >
                    <Code className="h-3.5 w-3.5 opacity-70" />
                    <span>{isSqlExpanded ? 'Lipat' : 'Lihat Script'}</span>
                    {isSqlExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              <div className={`text-xs pl-7 space-y-1.5 mt-1 ${textMutedClass}`}>
                <p>
                  Supabase memerlukan tabel untuk menyimpan record jadwal. Buka menu <strong>SQL Editor</strong> di sidebar kiri Supabase, buat query baru, klik tombol <strong>"Salin Script SQL"</strong> di atas, tempel lalu klik <strong>"Run"</strong>.
                </p>
                {isSqlExpanded && (
                  <div className={`mt-2 p-3 ${isWinamp ? 'rounded-none bg-black border-2 border-[#00FF00]' : 'bg-slate-900 rounded-xl border border-slate-700'} text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed shadow-inner`}>
                    <pre>{SUPABASE_SQL_SETUP_SCRIPT}</pre>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4 */}
            <div className={neutralSubCardClass}>
              <span className={`font-bold text-xs flex items-center gap-2 ${textHeadingClass}`}>
                <span className={`flex h-5 w-5 items-center justify-center ${isWinamp ? 'rounded-none' : 'rounded-full'} bg-[#297373] text-white text-[11px] font-black border border-white/20`}>4</span>
                Hubungkan & Tekan Tombol "Sync" di Aplikasi
              </span>
              <p className={`text-xs pl-7 mt-1 ${textMutedClass}`}>
                Buka menu <strong>Pengaturan ➔ Cloud Supabase & Sync</strong> di aplikasi ini, tempel Project URL & Anon Key, lalu klik <strong>"Uji Koneksi & Tabel"</strong>. Jika berhasil, tekan tombol <strong>"Sync"</strong> di header atas kapan saja untuk menyelaraskan data!
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'shortcutsNav',
      title: '9. Navigasi Cepat: Gesture Geser (Swipe) & Pintasan Keyboard',
      badge: 'Gesture & Shortcut',
      badgeColor: isWinamp
        ? 'bg-zinc-800 text-[#00FF00] border-[#00FF00]/60'
        : isDark
        ? 'bg-[#252525] text-cyan-300 border-cyan-500/40'
        : 'bg-cyan-100 text-cyan-800 border-cyan-200',
      icon: ArrowLeftRight,
      content: (
        <div className={`space-y-4 text-xs sm:text-sm ${textMutedClass} leading-relaxed`}>
          <p>
            Tingkatkan kenyamanan dan kecepatan operasional Anda dengan navigasi sentuh swipe di layar smartphone serta tombol pintasan (keyboard shortcuts) di perangkat komputer/laptop.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Gesture Geser (Swipe) */}
            <div className={neutralSubCardClass}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 ${isWinamp ? 'rounded-none' : 'rounded-md'} bg-teal-600 text-white font-black text-[10px]`}>
                  TOUCH / MOBILE
                </span>
                <span className={`font-bold text-xs ${textHeadingClass}`}>Navigasi Geser Layar (Swipe)</span>
              </div>
              <ul className="space-y-2 text-xs">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-teal-600 dark:text-teal-400 shrink-0">➔ Geser ke Kanan:</span>
                  <span>Beralih ke <strong>bulan sebelumnya</strong> (Previous Month).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-teal-600 dark:text-teal-400 shrink-0">➔ Geser ke Kiri:</span>
                  <span>Beralih ke <strong>bulan berikutnya</strong> (Next Month).</span>
                </li>
                <li className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <em>*Dilengkapi deteksi arah horizontal presisi (threshold 50px & rasio 1.5x) agar tidak memicu perpindahan bulan secara tidak sengaja saat Anda menggulir halaman ke atas atau ke bawah.</em>
                </li>
              </ul>
            </div>

            {/* Pintasan Keyboard Global */}
            <div className={neutralSubCardClass}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 ${isWinamp ? 'rounded-none' : 'rounded-md'} bg-indigo-600 text-white font-black text-[10px]`}>
                  DESKTOP / LAPTOP
                </span>
                <span className={`font-bold text-xs ${textHeadingClass}`}>Pintasan Keyboard Global</span>
              </div>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-center gap-2.5">
                  <kbd className={kbdHighlightClass}>S</kbd>
                  <span>Membuka modal <strong>Pengaturan</strong> (Database Cloud, Ekspor, Impor, Panduan Flutter).</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <kbd className={kbdHighlightClass}>L</kbd>
                  <span>Membuka modal <strong>Hari Libur Nasional</strong> & Manajemen Tanggal Merah.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <kbd className={kbdHighlightClass}>T</kbd>
                  <span>Memicu fitur cepat <strong>Tempel Jadwal</strong> Excel/Spreadsheet dari clipboard.</span>
                </li>
                <li className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <em>*Pintasan ini otomatis diabaikan saat kursor sedang fokus di dalam kolom isian (input teks, textarea, atau catatan) sehingga pengetikan tetap lancar tanpa gangguan.</em>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Accordion styling classes
  const accordionCardClass = isDark
    ? 'rounded-2xl border border-white/10 ring-1 ring-white/10 bg-[#1A1A1A] text-slate-200 shadow-sm overflow-hidden transition-all'
    : isVista
    ? 'rounded-2xl border border-white/50 bg-white/85 backdrop-blur-xl text-slate-800 shadow-md overflow-hidden transition-all'
    : isWinamp
    ? 'rounded-none border-2 border-zinc-700 bg-[#161616] font-mono text-slate-200 overflow-hidden transition-all shadow-[2px_2px_0_#BE1A1A]'
    : 'rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all';

  const accordionHeaderBtnClass = isDark
    ? 'w-full flex items-center justify-between p-3.5 sm:p-4.5 text-left hover:bg-[#222222] transition-colors cursor-pointer'
    : isVista
    ? 'w-full flex items-center justify-between p-3.5 sm:p-4.5 text-left hover:bg-white/60 transition-colors cursor-pointer'
    : isWinamp
    ? 'w-full flex items-center justify-between p-3.5 sm:p-4.5 text-left hover:bg-[#202020] transition-colors cursor-pointer font-mono'
    : 'w-full flex items-center justify-between p-3.5 sm:p-4.5 text-left hover:bg-slate-50/80 transition-colors cursor-pointer';

  const accordionDividerClass = isDark
    ? 'border-t border-white/10'
    : isVista
    ? 'border-t border-white/40'
    : isWinamp
    ? 'border-t border-zinc-700'
    : 'border-t border-slate-100';

  const headerBannerClass = isDark
    ? 'rounded-2xl bg-[#182322] border border-white/10 ring-1 ring-white/10 p-4 sm:p-6 text-white shadow-lg'
    : isVista
    ? 'rounded-2xl bg-gradient-to-r from-[#297373]/90 via-[#205b5b]/90 to-[#163e3e]/90 backdrop-blur-xl border border-white/40 p-4 sm:p-6 text-white shadow-lg'
    : isWinamp
    ? 'rounded-none bg-[#111f1e] border-2 border-[#00FF00] p-4 sm:p-6 text-white font-mono shadow-[3px_3px_0_#00FF00]'
    : 'rounded-2xl bg-linear-to-r from-[#297373] via-[#205b5b] to-[#163e3e] p-4 sm:p-6 text-white shadow-lg';

  const footerBoxClass = isDark
    ? 'rounded-2xl bg-[#1A1A1A] p-4 border border-white/10 ring-1 ring-white/10 flex items-center justify-between text-xs text-slate-300'
    : isVista
    ? 'rounded-2xl bg-white/70 backdrop-blur-md p-4 border border-white/50 flex items-center justify-between text-xs text-slate-800 shadow-xs'
    : isWinamp
    ? 'rounded-none bg-[#141414] p-4 border-2 border-zinc-700 flex items-center justify-between text-xs text-[#00FF00] font-mono'
    : 'rounded-2xl bg-slate-100 p-4 border border-slate-200 flex items-center justify-between text-xs text-slate-600';

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className={headerBannerClass}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center ${isWinamp ? 'rounded-none' : 'rounded-2xl'} bg-white/10 text-white backdrop-blur-xs ring-1 ring-white/20 shrink-0`}>
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-black tracking-tight ${isWinamp ? 'text-[#00FF00] uppercase font-mono' : 'text-white'}`}>Dokumentasi & Petunjuk Aplikasi</h2>
              <p className={`text-xs sm:text-sm mt-0.5 ${isWinamp ? 'text-[#00FF00]/80 font-mono' : 'text-teal-100'}`}>
                Panduan komprehensif fitur kalender, logika lembur, performa CEISA, dan sistem database
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={expandAll}
              className={`${isWinamp ? 'rounded-none' : 'rounded-lg'} bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer border border-white/20`}
            >
              Buka Semua
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className={`${isWinamp ? 'rounded-none' : 'rounded-lg'} bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer border border-white/20`}
            >
              Tutup Semua
            </button>
          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3">
        {sections.map((sec) => {
          const isOpen = !!openSections[sec.id];
          const IconComp = sec.icon;

          return (
            <div
              key={sec.id}
              className={accordionCardClass}
            >
              <button
                type="button"
                onClick={() => toggleSection(sec.id)}
                className={accordionHeaderBtnClass}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-9 w-9 items-center justify-center ${isWinamp ? 'rounded-none bg-zinc-800 text-[#00FF00] border-zinc-700' : isDark ? 'rounded-xl bg-[#252525] text-teal-300 border-white/10' : isVista ? 'rounded-xl bg-white/70 text-[#297373] border-white/50 shadow-2xs' : 'rounded-xl bg-teal-50 text-[#297373] border-teal-200/70'} shrink-0 border`}>
                    <IconComp className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`font-extrabold text-xs sm:text-sm ${textHeadingClass}`}>{sec.title}</h3>
                      <span className={`px-2 py-0.5 ${isWinamp ? 'rounded-none' : 'rounded-md'} text-[10px] font-bold border ${sec.badgeColor}`}>
                        {sec.badge}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-slate-400 pl-2 shrink-0">
                  {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </button>

              {isOpen && (
                <div className={`px-4 pb-4.5 pt-1 sm:px-5 sm:pb-5 ${accordionDividerClass} animate-in fade-in duration-200`}>
                  {sec.content}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className={footerBoxClass}>
        <div className="flex items-center gap-2">
          <HelpCircle className={`h-4 w-4 shrink-0 ${isWinamp ? 'text-[#00FF00]' : 'text-[#297373]'}`} />
          <span>Aplikasi Kalender Shift & Lembur • Versi 13.0 (Clean Architecture & Performance CEISA)</span>
        </div>
      </div>
    </div>
  );
};
