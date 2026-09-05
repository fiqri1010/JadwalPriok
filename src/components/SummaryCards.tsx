import React from 'react';
import { Timer, ArrowLeftRight, UserCheck, Palmtree } from 'lucide-react';
import { AppTheme } from '../types';

interface SummaryCardsProps {
  totalLemburHours: number;
  totalLemburDays: number;
  totalPiketDays: number;
  totalGeserOffDays: number;
  totalOffDiambilDays: number;
  totalCutiPenggantiDays: number;
  theme?: AppTheme;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalLemburHours,
  totalLemburDays,
  totalPiketDays,
  totalGeserOffDays,
  totalOffDiambilDays,
  totalCutiPenggantiDays,
  theme = 'default',
}) => {
  const kuotaOffGeser = totalGeserOffDays - totalOffDiambilDays;

  // Theme-specific styling tokens for cards
  const isWinamp = theme === 'winamp';
  const isDark = theme === 'dark';
  const isVista = theme === 'vista';

  // Base card styling
  let cardBaseClass = 'rounded-xl border p-2.5 sm:p-3 transition-all';
  let titleColor = 'text-[#011627]';
  let valueColor = 'text-[#011627]';
  let subtitleColor = 'text-slate-500';

  if (isDark) {
    cardBaseClass = 'rounded-xl border border-[#333333] bg-[#1A1A1A] p-2.5 sm:p-3 transition-all';
    titleColor = 'text-slate-300';
    valueColor = 'text-white';
    subtitleColor = 'text-slate-400';
  } else if (isVista) {
    cardBaseClass = 'rounded-xl bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2.5 sm:p-3 transition-all';
    titleColor = 'text-[#0F172A]';
    valueColor = 'text-[#0F172A]';
    subtitleColor = 'text-slate-700';
  } else if (isWinamp) {
    cardBaseClass = 'rounded-none border-2 border-[#555555] bg-[#1C1C1E] p-2.5 sm:p-3 transition-all font-mono';
    titleColor = 'text-[#FACC15]';
    valueColor = 'text-[#00FF00]';
    subtitleColor = 'text-slate-400';
  } else {
    // Default (Brand Baru)
    cardBaseClass = 'rounded-xl border border-[#E2E8F0] bg-white p-2.5 sm:p-3 transition-all shadow-xs';
    titleColor = 'text-[#011627]';
    valueColor = 'text-[#011627]';
    subtitleColor = 'text-slate-600';
  }

  const cards = [
    {
      title: 'Total Jam Lembur',
      value: `${totalLemburHours.toFixed(1)} Jam`,
      subtitle: `${totalLemburDays} hari terhitung lembur`,
      icon: Timer,
      iconColor: isDark ? 'text-[#2EC4B6]' : isWinamp ? 'text-[#00FF00]' : 'text-[#2EC4B6]',
      iconBg: isDark ? 'bg-[#2EC4B6]/20' : isWinamp ? 'bg-[#000000] border border-[#00FF00]' : 'bg-[#2EC4B6]/15',
    },
    {
      title: 'Kuota OFF Geser',
      value: `${kuotaOffGeser >= 0 ? '+' : ''}${kuotaOffGeser} Hari`,
      subtitle: `Ditabung: +${totalGeserOffDays} | Diambil: -${totalOffDiambilDays}`,
      icon: ArrowLeftRight,
      iconColor: kuotaOffGeser >= 0 ? (isWinamp ? 'text-[#00FF00]' : 'text-[#2EC4B6]') : (isWinamp ? 'text-[#FF3366]' : 'text-[#FF3366]'),
      iconBg: kuotaOffGeser >= 0 
        ? (isDark ? 'bg-[#2EC4B6]/20' : isWinamp ? 'bg-[#000000] border border-[#00FF00]' : 'bg-[#2EC4B6]/15')
        : (isDark ? 'bg-[#FF3366]/20' : isWinamp ? 'bg-[#000000] border border-[#FF3366]' : 'bg-[#FF3366]/15'),
    },
    {
      title: 'Piket',
      value: `${totalPiketDays} Hari`,
      subtitle: 'Jadwal piket aktif (Weekdays & Libur)',
      icon: UserCheck,
      iconColor: isDark ? 'text-[#20A4F3]' : isWinamp ? 'text-[#FACC15]' : 'text-[#20A4F3]',
      iconBg: isDark ? 'bg-[#20A4F3]/20' : isWinamp ? 'bg-[#000000] border border-[#FACC15]' : 'bg-[#20A4F3]/15',
    },
    {
      title: 'Cuti Pengganti',
      value: `${totalCutiPenggantiDays} Hari`,
      subtitle: 'ST (Surat Tugas) di hari libur',
      icon: Palmtree,
      iconColor: isDark ? 'text-[#FF3366]' : isWinamp ? 'text-[#FF3366]' : 'text-[#FF3366]',
      iconBg: isDark ? 'bg-[#FF3366]/20' : isWinamp ? 'bg-[#000000] border border-[#FF3366]' : 'bg-[#FF3366]/15',
    },
  ];

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3 ${isWinamp ? 'font-mono' : ''}`}>
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.title}
            className={cardBaseClass}
          >
            <div className="flex items-center space-x-2 mb-1">
              <div className={`p-1 sm:p-1.5 ${isWinamp ? 'rounded-none' : 'rounded-lg'} ${card.iconBg} ${card.iconColor} shrink-0`}>
                <IconComponent className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <h4 className={`text-[11px] sm:text-xs font-bold tracking-tight truncate ${titleColor}`}>
                {card.title}
              </h4>
            </div>
            <div className="mt-0.5">
              <div className={`text-base sm:text-lg lg:text-xl font-black tracking-tight leading-tight ${valueColor}`}>
                {card.value}
              </div>
              <div className={`text-[10px] sm:text-[11px] font-medium mt-0.5 leading-tight truncate ${subtitleColor}`}>
                {card.subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

