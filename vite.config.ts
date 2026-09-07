import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

// Baca versi package.json dan buat timestamp build YYYYMMDD.HHmm
const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'));

function getBuildTimestamp(): string {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = now.getFullYear();
    const mm = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const hh = pad(now.getHours());
    const min = pad(now.getMinutes());
    return `${yyyy}${mm}${dd}.${hh}${min}`;
}

export default defineConfig(() => {
    return {
        plugins: [react(), tailwindcss()],
        define: {
            '__APP_VERSION__': JSON.stringify(pkg.version),
            '__BUILD_TIMESTAMP__': JSON.stringify(getBuildTimestamp()),
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            },
            dedupe: ['react', 'react-dom'],
        },
        server: {
            // HMR is disabled in AI Studio via DISABLE_HMR env var.
            // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
            hmr: process.env.DISABLE_HMR !== 'true',
            // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
            watch: process.env.DISABLE_HMR === 'true' ? null : {
                ignored: [
                    '**/.vs/**',
                    '**/src-tauri/target/**',
                    '**/.git/**',
                    '**/dist/**',
                    '**/*.vsidx'
                ],
            },
        },
    };
});
