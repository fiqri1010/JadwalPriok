// Data Hari Libur Nasional Indonesia (2024, 2025, 2026)
export interface HolidayInfo {
  date: string; // YYYY-MM-DD
  name: string;
}

export const INDONESIAN_HOLIDAYS: Record<string, string> = {
  // 2024
  '2024-01-01': 'Tahun Baru 2024 Masehi',
  '2024-02-08': 'Isra Mikraj Nabi Muhammad SAW',
  '2024-02-09': 'Cuti Bersama Tahun Baru Imlek',
  '2024-02-10': 'Tahun Baru Imlek 2575 Kongzili',
  '2024-03-11': 'Hari Suci Nyepi Tahun Baru Saka 1946',
  '2024-03-12': 'Cuti Bersama Hari Suci Nyepi',
  '2024-03-29': 'Wafat Yesus Kristus',
  '2024-03-31': 'Hari Paskah',
  '2024-04-08': 'Cuti Bersama Idul Fitri 1445 H',
  '2024-04-09': 'Cuti Bersama Idul Fitri 1445 H',
  '2024-04-10': 'Hari Raya Idul Fitri 1445 H',
  '2024-04-11': 'Hari Raya Idul Fitri 1445 H',
  '2024-04-12': 'Cuti Bersama Idul Fitri 1445 H',
  '2024-04-15': 'Cuti Bersama Idul Fitri 1445 H',
  '2024-05-01': 'Hari Buruh Internasional',
  '2024-05-09': 'Kenaikan Yesus Kristus',
  '2024-05-10': 'Cuti Bersama Kenaikan Yesus Kristus',
  '2024-05-23': 'Hari Raya Waisak 2568 BE',
  '2024-05-24': 'Cuti Bersama Hari Raya Waisak',
  '2024-06-01': 'Hari Lahir Pancasila',
  '2024-06-17': 'Hari Raya Idul Adha 1445 H',
  '2024-06-18': 'Cuti Bersama Hari Raya Idul Adha',
  '2024-07-07': 'Tahun Baru Islam 1446 H',
  '2024-08-17': 'Hari Kemerdekaan RI Ke-79',
  '2024-09-16': 'Maulid Nabi Muhammad SAW',
  '2024-12-25': 'Hari Raya Natal',
  '2024-12-26': 'Cuti Bersama Hari Raya Natal',

  // 2025
  '2025-01-01': 'Tahun Baru 2025 Masehi',
  '2025-01-27': 'Isra Mikraj Nabi Muhammad SAW',
  '2025-01-28': 'Cuti Bersama Tahun Baru Imlek',
  '2025-01-29': 'Tahun Baru Imlek 2576 Kongzili',
  '2025-03-28': 'Cuti Bersama Hari Suci Nyepi',
  '2025-03-29': 'Hari Suci Nyepi Tahun Baru Saka 1947',
  '2025-03-31': 'Hari Raya Idul Fitri 1446 H',
  '2025-04-01': 'Hari Raya Idul Fitri 1446 H',
  '2025-04-02': 'Cuti Bersama Idul Fitri 1446 H',
  '2025-04-03': 'Cuti Bersama Idul Fitri 1446 H',
  '2025-04-04': 'Cuti Bersama Idul Fitri 1446 H',
  '2025-04-07': 'Cuti Bersama Idul Fitri 1446 H',
  '2025-04-18': 'Wafat Yesus Kristus',
  '2025-04-20': 'Kebangkitan Yesus Kristus (Paskah)',
  '2025-05-01': 'Hari Buruh Internasional',
  '2025-05-12': 'Hari Raya Waisak 2569 BE',
  '2025-05-13': 'Cuti Bersama Hari Raya Waisak',
  '2025-05-29': 'Kenaikan Yesus Kristus',
  '2025-05-30': 'Cuti Bersama Kenaikan Yesus Kristus',
  '2025-06-01': 'Hari Lahir Pancasila',
  '2025-06-06': 'Hari Raya Idul Adha 1446 H',
  '2025-06-09': 'Cuti Bersama Hari Raya Idul Adha',
  '2025-06-27': 'Tahun Baru Islam 1447 H',
  '2025-08-17': 'Hari Kemerdekaan RI Ke-80',
  '2025-09-05': 'Maulid Nabi Muhammad SAW',
  '2025-12-25': 'Hari Raya Natal',
  '2025-12-26': 'Cuti Bersama Hari Raya Natal',

  // 2026
  '2026-01-01': 'Tahun Baru 2026 Masehi',
  '2026-01-16': 'Isra Mikraj Nabi Muhammad SAW',
  '2026-02-17': 'Tahun Baru Imlek 2577 Kongzili',
  '2026-03-20': 'Hari Raya Idul Fitri 1447 H',
  '2026-03-21': 'Hari Raya Idul Fitri 1447 H',
  '2026-03-22': 'Hari Suci Nyepi Tahun Baru Saka 1948',
  '2026-04-03': 'Wafat Yesus Kristus (Jumat Agung)',
  '2026-04-05': 'Hari Paskah',
  '2026-05-01': 'Hari Buruh Internasional',
  '2026-05-14': 'Kenaikan Yesus Kristus',
  '2026-05-27': 'Hari Raya Idul Adha 1447 H',
  '2026-05-31': 'Hari Raya Waisak 2570 BE',
  '2026-06-01': 'Hari Lahir Pancasila',
  '2026-06-16': 'Tahun Baru Islam 1448 H',
  '2026-08-17': 'Hari Kemerdekaan RI Ke-81',
  '2026-08-25': 'Maulid Nabi Muhammad SAW',
  '2026-12-25': 'Hari Raya Natal',
};

export function getIndonesianHoliday(
  yearOrDate: number | Date,
  month?: number,
  day?: number
): string | null {
  if (yearOrDate instanceof Date) {
    const y = yearOrDate.getFullYear();
    const m = String(yearOrDate.getMonth() + 1).padStart(2, '0');
    const d = String(yearOrDate.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;
    return INDONESIAN_HOLIDAYS[key] || null;
  }
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  const key = `${yearOrDate}-${m}-${d}`;
  return INDONESIAN_HOLIDAYS[key] || null;
}
