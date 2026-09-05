/**
 * Helper untuk menyimpan file dengan File System Access API (Explorer dialog pemilihan lokasi simpan)
 * dengan fallback otomatis ke download browser standar.
 */

export interface SaveFileOptions {
  blob: Blob;
  filename: string;
  description?: string;
  mimeType?: string;
  extension?: string;
}

export async function saveFileWithDialog({
  blob,
  filename,
  description = 'File Laporan',
  mimeType = 'application/octet-stream',
  extension = 'txt',
}: SaveFileOptions): Promise<{ success: boolean; method: 'picker' | 'download'; cancelled?: boolean; message?: string }> {
  const cleanExt = extension.replace(/^\./, '');
  
  // 1. Cek dukungan File System Access API (Menampilkan dialog Windows Explorer / macOS Finder)
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const pickerOptions: any = {
        suggestedName: filename,
        types: [
          {
            description: `${description} (*.${cleanExt})`,
            accept: {
              [mimeType]: [`.${cleanExt}`],
            },
          },
        ],
      };

      const handle = await (window as any).showSaveFilePicker(pickerOptions);
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return { 
        success: true, 
        method: 'picker', 
        message: `File "${filename}" berhasil disimpan di lokasi pilihan Anda!` 
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Pengguna membatalkan dialog pemilihan lokasi file
        return { 
          success: false, 
          method: 'picker', 
          cancelled: true, 
          message: 'Penyimpanan file dibatalkan.' 
        };
      }
      console.warn('showSaveFilePicker tidak diizinkan atau gagal, menggunakan fallback unduhan otomatis:', err);
    }
  }

  // 2. Fallback standar (Unduh langsung ke folder Downloads)
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 1500);
    return { 
      success: true, 
      method: 'download', 
      message: `File "${filename}" berhasil diunduh ke folder Downloads!` 
    };
  } catch (err: any) {
    console.error('Download fallback failed:', err);
    return { 
      success: false, 
      method: 'download', 
      message: `Gagal mengunduh file: ${err?.message || 'Kesalahan browser'}` 
    };
  }
}
