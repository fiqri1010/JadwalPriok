/**
 * Tauri Bridge & Window Management Utility
 * Mendukung interaksi native desktop window (Tauri v1 / v2) dan fallback browser web.
 */
import { FULL_APP_TITLE } from '../version';

export function isTauriEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    '__TAURI_INTERNALS__' in window ||
    '__TAURI__' in window ||
    (window as any).__TAURI_METADATA__ !== undefined
  );
}

/**
 * Otomatis posisikan jendela di tengah layar (Center Screen)
 */
export async function centerAppWindow(): Promise<void> {
  if (typeof window === 'undefined') return;

  if (isTauriEnvironment()) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();
      await appWindow.center();
      await appWindow.setTitle(FULL_APP_TITLE);
      return;
    } catch (err) {
      console.warn('Tauri center window warning:', err);
    }
  }

  // Fallback untuk Browser / Popup window jika didukung
  try {
    if (window.opener || (window.outerWidth && window.outerHeight && window.screen)) {
      const screenWidth = window.screen.availWidth || window.screen.width;
      const screenHeight = window.screen.availHeight || window.screen.height;
      const left = Math.max(0, Math.round((screenWidth - window.outerWidth) / 2));
      const top = Math.max(0, Math.round((screenHeight - window.outerHeight) / 2));
      window.moveTo(left, top);
    }
  } catch {
    // browser sandbox may restrict moveTo
  }
}

/**
 * Memulai Drag & Move jendela saat Title Bar diklik/tahan
 */
export async function startWindowDragging(): Promise<void> {
  if (typeof window === 'undefined') return;

  if (isTauriEnvironment()) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();
      await appWindow.startDragging();
    } catch (err) {
      console.warn('Tauri drag window warning:', err);
    }
  }
}

/**
 * Minimalkan jendela (Minimize)
 */
export async function minimizeAppWindow(): Promise<void> {
  if (typeof window === 'undefined') return;

  if (isTauriEnvironment()) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();
      await appWindow.minimize();
      return;
    } catch (err) {
      console.warn('Tauri minimize warning:', err);
    }
  }
}

/**
 * Toggle Maximize / Restore jendela
 */
export async function toggleMaximizeAppWindow(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  if (isTauriEnvironment()) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();
      await appWindow.toggleMaximize();
      return await appWindow.isMaximized();
    } catch (err) {
      console.warn('Tauri toggle maximize warning:', err);
    }
  }

  // Fallback browser fullscreen
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      return true;
    } else {
      await document.exitFullscreen();
      return false;
    }
  } catch {
    return false;
  }
}

/**
 * Tutup Aplikasi / Jendela (Close / Exit)
 */
export async function closeAppWindow(): Promise<void> {
  if (typeof window === 'undefined') return;

  if (isTauriEnvironment()) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();
      await appWindow.close();
      return;
    } catch (err) {
      console.warn('Tauri close window warning, trying destroy:', err);
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const appWindow = getCurrentWindow();
        await appWindow.destroy();
        return;
      } catch (e) {
        console.error('Failed to close Tauri window:', e);
      }
    }
  }

  // Fallback browser: Coba window.close()
  try {
    window.close();
  } catch (err) {
    console.warn('window.close() prevented by browser security:', err);
  }

  // Jika window.close() diblokir oleh browser sandbox / tab normal:
  const confirmAction = window.confirm('Apakah Anda ingin mereset/membersihkan sesi kerja atau kembali ke awal?');
  if (confirmAction) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
