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
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.2.4';

export const BUILD_TIMESTAMP: string = 
  typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : '20260908.0223';

/**
 * Format judul lengkap aplikasi pada titlebar:
 * Contoh: "JadwalPriok v1.2.4 build 20260908.0223"
 */
export const FULL_APP_TITLE: string = `JadwalPriok v${APP_VERSION} build ${BUILD_TIMESTAMP}`;
