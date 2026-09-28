// File ini diperbarui otomatis saat npm run release / build
declare const __APP_VERSION__: string | undefined;
declare const __BUILD_TIMESTAMP__: string | undefined;

function getFallbackBuildTime(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const min = pad(now.getMinutes());
  return `${yyyy}${mm}${dd}.${hh}${min}`;
}

export const APP_VERSION: string = 
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.3.68-beta';

export const BUILD_TIMESTAMP: string = 
  typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : getFallbackBuildTime();

/**
 * Format judul lengkap aplikasi pada titlebar:
 * Contoh: "JadwalPriok v0.1.0-alpha build 20260923.0001"
 */
export const FULL_APP_TITLE: string = `JadwalPriok v${APP_VERSION} build ${BUILD_TIMESTAMP}`;
