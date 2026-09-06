/**
 * Helper untuk menyimpan file dengan API Native Tauri (dialog.save + fs.writeBinaryFile),
 * File System Access API (Explorer dialog pemilihan lokasi simpan di browser),
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

    // 0. Cek jika berjalan di lingkungan Tauri Desktop App
    if (typeof window !== 'undefined' && ((window as any).__TAURI__ || (window as any).__TAURI_INTERNALS__)) {
        try {
            const win = window as any;
            let saveDialogFn: any = win.__TAURI__?.dialog?.save;
            let writeBinaryFn: any = win.__TAURI__?.fs?.writeBinaryFile || win.__TAURI__?.fs?.writeFile;

            if (!saveDialogFn) {
                try {
                    const pluginDialogPkg = '@tauri-apps/' + 'plugin-dialog';
                    const dialogModule = await import(/* @vite-ignore */ pluginDialogPkg);
                    saveDialogFn = dialogModule.save;
                } catch (e1) {
                    try {
                        const apiDialogPkg = '@tauri-apps/api/' + 'dialog';
                        const dialogModule = await import(/* @vite-ignore */ apiDialogPkg);
                        saveDialogFn = dialogModule.save;
                    } catch (e2) {
                        // plugin dialog fallback
                    }
                }
            }

            if (!writeBinaryFn) {
                try {
                    const pluginFsPkg = '@tauri-apps/' + 'plugin-fs';
                    const fsModule = await import(/* @vite-ignore */ pluginFsPkg);
                    writeBinaryFn = fsModule.writeFile || fsModule.writeBinaryFile;
                } catch (e1) {
                    try {
                        const apiFsPkg = '@tauri-apps/api/' + 'fs';
                        const fsModule = await import(/* @vite-ignore */ apiFsPkg);
                        writeBinaryFn = fsModule.writeBinaryFile || fsModule.writeFile;
                    } catch (e2) {
                        // plugin fs fallback
                    }
                }
            }

            if (saveDialogFn) {
                const filePath = await saveDialogFn({
                    defaultPath: filename,
                    filters: [
                        {
                            name: description,
                            extensions: [cleanExt],
                        },
                    ],
                });

                if (!filePath) {
                    // Pengguna membatalkan dialog save
                    return {
                        success: false,
                        method: 'picker',
                        cancelled: true,
                        message: 'Penyimpanan file dibatalkan.',
                    };
                }

                const arrayBuffer = await blob.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);

                if (writeBinaryFn) {
                    await writeBinaryFn(filePath, uint8Array);
                    return {
                        success: true,
                        method: 'picker',
                        message: `File "${filename}" berhasil disimpan!`,
                    };
                }
            }
        } catch (err: any) {
            console.warn('Tauri native save dialog/fs failed, falling back to web download:', err);
        }
    }

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