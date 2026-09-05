import { DayData } from '../types';

export const SUPABASE_SQL_SETUP_SCRIPT = `-- ==============================================================================
-- 1. TABEL LIBUR NASIONAL / TANGGAL MERAH (Fitur Baru: Bebas Konflik State)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.libur_nasional (
  tanggal TEXT PRIMARY KEY, -- Format YYYY-MM-DD (e.g. '2026-08-17')
  keterangan TEXT NOT NULL,  -- Keterangan libur (e.g. 'Hari Kemerdekaan RI')
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Hak akses schema public & tabel libur_nasional (PENTING untuk PostgREST)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.libur_nasional TO anon, authenticated, service_role;

-- Row Level Security (RLS) untuk libur_nasional (Izin Akses Penuh)
ALTER TABLE public.libur_nasional ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Akses Penuh Publik Libur Nasional" ON public.libur_nasional;
CREATE POLICY "Akses Penuh Publik Libur Nasional"
ON public.libur_nasional
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- 2. TABEL SHIFTS (Jadwal Kalender)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.shifts (
  id TEXT PRIMARY KEY,
  date_key TEXT,
  shift TEXT,
  is_masuk BOOLEAN DEFAULT FALSE,
  jam_masuk TEXT DEFAULT '',
  jam_pulang TEXT DEFAULT '',
  absen_ceisa TEXT DEFAULT '',
  is_hold_dokumen BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  is_manual_holiday BOOLEAN DEFAULT FALSE,
  is_surat_tugas_tambahan BOOLEAN DEFAULT FALSE,
  is_gunakan_off_geser BOOLEAN DEFAULT FALSE,
  referensi_tgl_off TEXT DEFAULT '',
  is_gunakan_cp BOOLEAN DEFAULT FALSE,
  referensi_tgl_cp TEXT DEFAULT '',
  note TEXT DEFAULT '',
  tipe_masuk_libur TEXT DEFAULT 'piket',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Pastikan seluruh kolom tersedia jika tabel sudah dibuat sebelumnya
ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS is_manual_holiday BOOLEAN DEFAULT FALSE;
ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS is_surat_tugas_tambahan BOOLEAN DEFAULT FALSE;
ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS is_gunakan_off_geser BOOLEAN DEFAULT FALSE;
ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS referensi_tgl_off TEXT DEFAULT '';
ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS is_gunakan_cp BOOLEAN DEFAULT FALSE;
ALTER TABLE public.shifts ADD COLUMN IF NOT EXISTS referensi_tgl_cp TEXT DEFAULT '';

-- Berikan hak akses penuh ke schema public dan tabel shifts
GRANT ALL ON TABLE public.shifts TO anon, authenticated, service_role;

-- Aktifkan Row Level Security (RLS) & Berikan Izin Akses Penuh
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Akses Penuh Publik Kalender Shift" ON public.shifts;
CREATE POLICY "Akses Penuh Publik Kalender Shift"
ON public.shifts
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- 3. Paksa Supabase memuat ulang Schema Cache API secara instan
-- ==============================================================================
NOTIFY pgrst, 'reload schema';
`;

function cleanEndpoint(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

/**
 * Uji koneksi ke Supabase dan verifikasi kesiapan tabel shifts
 */
export async function testSupabaseConnection(
  url: string,
  key: string
): Promise<{ success: boolean; ms?: number; message: string; tableReady?: boolean; rawError?: string }> {
  if (!url || !key) {
    return { success: false, message: 'URL atau Anon Key Supabase belum diisi.' };
  }

  const cleanUrl = cleanEndpoint(url);
  const start = performance.now();

  try {
    // 1. Cek endpoint shifts
    const res = await fetch(`${cleanUrl}/rest/v1/shifts?select=id&limit=1`, {
      headers: {
        apikey: key.trim(),
        Authorization: `Bearer ${key.trim()}`,
      },
    });

    const end = performance.now();
    const elapsed = Math.round(end - start);

    if (res.ok) {
      return {
        success: true,
        ms: elapsed,
        tableReady: true,
        message: `Koneksi berhasil (${elapsed}ms). Tabel shifts aktif dan siap sinkronisasi!`,
      };
    }

    let errorDetail = '';
    try {
      const errJson = await res.json();
      errorDetail = errJson.message || errJson.hint || JSON.stringify(errJson);
    } catch {
      errorDetail = await res.text();
    }

    if (res.status === 404 || res.status === 400) {
      return {
        success: true,
        ms: elapsed,
        tableReady: false,
        rawError: errorDetail,
        message: `Koneksi terhubung (${elapsed}ms), namun tabel 'shifts' belum terdeteksi di cache API Supabase. Penyebab: Supabase PostgREST belum memuat ulang skema. Jalankan SQL setup yang diperbarui di bawah (termasuk perintah NOTIFY pgrst, 'reload schema').`,
      };
    }

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        ms: elapsed,
        rawError: errorDetail,
        message: `Akses ditolak (${res.status}). Anon Key salah atau izin RLS belum diberikan. Salin Script SQL terbaru di bawah.`,
      };
    }

    return {
      success: false,
      ms: elapsed,
      rawError: errorDetail,
      message: `Supabase merespons status ${res.status}: ${errorDetail || 'Periksa konfigurasi proyek'}`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menghubungi Supabase: ${err?.message || 'Periksa koneksi internet dan format URL.'}`,
    };
  }
}

/**
 * Kirim / Simpan seluruh data lokal ke tabel shifts di Supabase (Upsert)
 */
export async function pushAllToSupabase(
  url: string,
  key: string,
  daysState: Record<string, DayData>
): Promise<{ success: boolean; count: number; message: string }> {
  if (!url || !key) {
    return { success: false, count: 0, message: 'Supabase URL dan Anon Key belum dikonfigurasi.' };
  }

  const cleanUrl = cleanEndpoint(url);
  const keys = Object.keys(daysState);

  if (keys.length === 0) {
    return { success: true, count: 0, message: 'Tidak ada data jadwal untuk dikirim.' };
  }

  const payload = keys.map((dateKey) => {
    const data = daysState[dateKey];
    return {
      id: dateKey,
      date_key: dateKey,
      shift: data.shift || '',
      is_masuk: Boolean(data.isMasuk),
      jam_masuk: data.jamMasuk || '',
      jam_pulang: data.jamPulang || '',
      absen_ceisa: data.absenCeisa || '',
      is_hold_dokumen: Boolean(data.isHoldDokumen),
      is_locked: Boolean(data.isLocked),
      is_manual_holiday: Boolean(data.isManualHoliday),
      is_surat_tugas_tambahan: Boolean(data.isSuratTugasTambahan),
      is_gunakan_off_geser: Boolean(data.isGunakanOffGeser),
      referensi_tgl_off: data.referensiTglOff || '',
      is_gunakan_cp: Boolean(data.isGunakanCP),
      referensi_tgl_cp: data.referensiTglCP || '',
      note: data.note || '',
      tipe_masuk_libur: data.tipeMasukLibur || 'piket',
      updated_at: new Date().toISOString(),
    };
  });

  try {
    const res = await fetch(`${cleanUrl}/rest/v1/shifts`, {
      method: 'POST',
      headers: {
        apikey: key.trim(),
        Authorization: `Bearer ${key.trim()}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return {
        success: true,
        count: payload.length,
        message: `Berhasil mengunggah ${payload.length} data jadwal ke Supabase Cloud!`,
      };
    }

    const errorBody = await res.text();
    let detailMsg = errorBody;
    try {
      const parsed = JSON.parse(errorBody);
      detailMsg = parsed.message || parsed.hint || errorBody;
    } catch {}

    if (res.status === 404 || detailMsg.includes('relation "public.shifts" does not exist')) {
      return {
        success: false,
        count: 0,
        message: `Tabel 'shifts' belum dibuat di Supabase. Buka menu Penyimpanan ➔ Salin Script SQL dan jalankan di SQL Editor Supabase.`,
      };
    }

    return {
      success: false,
      count: 0,
      message: `Gagal menyimpan ke Supabase (${res.status}): ${detailMsg}`,
    };
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      message: `Koneksi gagal: ${err?.message || 'Periksa jaringan internet Anda.'}`,
    };
  }
}

/**
 * Tarik seluruh data dari tabel shifts di Supabase ke lokal
 */
export async function pullAllFromSupabase(
  url: string,
  key: string
): Promise<{ success: boolean; data?: Record<string, DayData>; count: number; message: string }> {
  if (!url || !key) {
    return { success: false, count: 0, message: 'Supabase URL dan Anon Key belum dikonfigurasi.' };
  }

  const cleanUrl = cleanEndpoint(url);

  try {
    const res = await fetch(`${cleanUrl}/rest/v1/shifts?select=*`, {
      headers: {
        apikey: key.trim(),
        Authorization: `Bearer ${key.trim()}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        count: 0,
        message: `Gagal mengambil data dari Supabase (${res.status}): ${errText}`,
      };
    }

    const rows = await res.json();
    if (!Array.isArray(rows)) {
      return { success: false, count: 0, message: 'Format data dari Supabase tidak valid.' };
    }

    const result: Record<string, DayData> = {};
    rows.forEach((row: any) => {
      const rawKey = row.date_key || row.id || row.dateKey;
      if (rawKey) {
        const [y, m, d] = String(rawKey).split('-').map(Number);
        if (y && m && d) {
          const dateKey = `${y}-${m}-${d}`;
          result[dateKey] = {
            shift: row.shift !== undefined ? row.shift : '',
            isMasuk:
              row.is_masuk !== undefined
                ? Boolean(row.is_masuk)
                : row.isMasuk !== undefined
                ? Boolean(row.isMasuk)
                : false,
            jamMasuk: row.jam_masuk || row.jamMasuk || '',
            jamPulang: row.jam_pulang || row.jamPulang || '',
            absenCeisa: row.absen_ceisa || row.absenCeisa || '',
            isHoldDokumen: Boolean(row.is_hold_dokumen ?? row.isHoldDokumen),
            isLocked: Boolean(row.is_locked ?? row.isLocked),
            isManualHoliday: Boolean(row.is_manual_holiday ?? row.isManualHoliday),
            isSuratTugasTambahan: Boolean(row.is_surat_tugas_tambahan ?? row.isSuratTugasTambahan),
            isGunakanOffGeser: Boolean(row.is_gunakan_off_geser ?? row.isGunakanOffGeser),
            referensiTglOff: row.referensi_tgl_off || row.referensiTglOff || '',
            isGunakanCP: Boolean(row.is_gunakan_cp ?? row.isGunakanCP),
            referensiTglCP: row.referensi_tgl_cp || row.referensiTglCP || '',
            note: row.note || '',
            tipeMasukLibur: row.tipe_masuk_libur || row.tipeMasukLibur || 'piket',
          };
        }
      }
    });

    return {
      success: true,
      data: result,
      count: Object.keys(result).length,
      message: `Berhasil menarik ${Object.keys(result).length} data jadwal dari Supabase.`,
    };
  } catch (err: any) {
    return {
      success: false,
      count: 0,
      message: `Koneksi gagal: ${err?.message || 'Periksa jaringan internet.'}`,
    };
  }
}

/**
 * Sinkronisasi Dua Arah (Pull remote changes, gabung dengan local, lalu push kembali)
 */
export async function syncTwoWaySupabase(
  url: string,
  key: string,
  localData: Record<string, DayData>
): Promise<{
  success: boolean;
  mergedData: Record<string, DayData>;
  pushedCount: number;
  pulledCount: number;
  message: string;
}> {
  // 1. Pull dari Cloud
  const pullRes = await pullAllFromSupabase(url, key);
  if (!pullRes.success) {
    return {
      success: false,
      mergedData: localData,
      pushedCount: 0,
      pulledCount: 0,
      message: pullRes.message,
    };
  }

  // 2. Gabungkan data (Remote + Local, local takes precedence for recent edits)
  const remoteData = pullRes.data || {};
  const merged: Record<string, DayData> = {
    ...remoteData,
    ...localData,
  };

  // 3. Push hasil gabungan ke Cloud
  const pushRes = await pushAllToSupabase(url, key, merged);

  return {
    success: pushRes.success,
    mergedData: merged,
    pushedCount: Object.keys(merged).length,
    pulledCount: Object.keys(remoteData).length,
    message: pushRes.success
      ? `Sinkronisasi selesai! ${Object.keys(merged).length} data tersinkron antar perangkat.`
      : pushRes.message,
  };
}

/**
 * Kirim single day update ke Supabase secara background
 */
export async function pushSingleDaySupabase(
  url: string,
  key: string,
  dateKey: string,
  dayData: DayData
): Promise<boolean> {
  if (!url || !key) return false;
  const cleanUrl = cleanEndpoint(url);

  try {
    const payload = [
      {
        id: dateKey,
        date_key: dateKey,
        shift: dayData.shift || '',
        is_masuk: Boolean(dayData.isMasuk),
        jam_masuk: dayData.jamMasuk || '',
        jam_pulang: dayData.jamPulang || '',
        absen_ceisa: dayData.absenCeisa || '',
        is_hold_dokumen: Boolean(dayData.isHoldDokumen),
        is_locked: Boolean(dayData.isLocked),
        is_manual_holiday: Boolean(dayData.isManualHoliday),
        is_surat_tugas_tambahan: Boolean(dayData.isSuratTugasTambahan),
        is_gunakan_off_geser: Boolean(dayData.isGunakanOffGeser),
        referensi_tgl_off: dayData.referensiTglOff || '',
        is_gunakan_cp: Boolean(dayData.isGunakanCP),
        referensi_tgl_cp: dayData.referensiTglCP || '',
        note: dayData.note || '',
        tipe_masuk_libur: dayData.tipeMasukLibur || 'piket',
        updated_at: new Date().toISOString(),
      },
    ];

    const res = await fetch(`${cleanUrl}/rest/v1/shifts`, {
      method: 'POST',
      headers: {
        apikey: key.trim(),
        Authorization: `Bearer ${key.trim()}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch {
    return false;
  }
}
