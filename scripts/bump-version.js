import fs from 'node:fs';
import path from 'node:path';

const bumpType = process.argv[2] || 'patch';

// 1. Baca dan update package.json
const pkgPath = path.resolve('package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const parts = (pkg.version || '1.0.0').split('.').map(Number);
if (bumpType === 'major') {
    parts[0]++;
    parts[1] = 0;
    parts[2] = 0;
} else if (bumpType === 'minor') {
    parts[1]++;
    parts[2] = 0;
} else {
    parts[2]++; // patch: 1.0.0 -> 1.0.1
}

const newVersion = parts.join('.');
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`\n📦 Versi aplikasi otomatis dinaikkan ke: v${newVersion}`);

// 2. Buat Timestamp Build: YYYYMMDD.HHmm (Waktu Lokal)
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const yyyy = now.getFullYear();
const mm = pad(now.getMonth() + 1);
const dd = pad(now.getDate());
const hh = pad(now.getHours());
const min = pad(now.getMinutes());
const buildTimestamp = `${yyyy}${mm}${dd}.${hh}${min}`;
const fullTitle = `JadwalPriok v${newVersion} build ${buildTimestamp}`;

// 3. Sinkronkan src/types.ts (aman: jika belum ada, otomatis ditambahkan)
const typesPath = path.resolve('src/types.ts');
if (fs.existsSync(typesPath)) {
    try {
        let types = fs.readFileSync(typesPath, 'utf8');

        if (/export const APP_VERSION = '[^']+';/.test(types)) {
            types = types.replace(/export const APP_VERSION = '[^']+';/, `export const APP_VERSION = '${newVersion}';`);
        } else {
            types += `\nexport const APP_VERSION = '${newVersion}';`;
        }

        if (/export const APP_VERSION_DISPLAY = '[^']+';/.test(types)) {
            types = types.replace(/export const APP_VERSION_DISPLAY = '[^']+';/, `export const APP_VERSION_DISPLAY = 'v${newVersion}';`);
        } else {
            types += `\nexport const APP_VERSION_DISPLAY = 'v${newVersion}';`;
        }

        fs.writeFileSync(typesPath, types, 'utf8');
        console.log(`✓ src/types.ts disinkronkan ke v${newVersion}`);
    } catch (err) {
        console.warn('Gagal memperbarui types.ts:', err.message);
    }
}

// 4. Sinkronkan src/version.ts (Sumber utama WindowTitleBar)
const versionTsPath = path.resolve('src/version.ts');
try {
    const versionTsContent = `// File ini diperbarui otomatis saat npm run release / build
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
  return \`\${yyyy}\${mm}\${dd}.\${hh}\${min}\`;
}

export const APP_VERSION: string = 
  typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '${newVersion}';

export const BUILD_TIMESTAMP: string = 
  typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : '${buildTimestamp}';

/**
 * Format judul lengkap aplikasi pada titlebar:
 * Contoh: "${fullTitle}"
 */
export const FULL_APP_TITLE: string = \`JadwalPriok v\${APP_VERSION} build \${BUILD_TIMESTAMP}\`;
`;
    fs.writeFileSync(versionTsPath, versionTsContent, 'utf8');
    console.log(`✓ src/version.ts disinkronkan -> ${fullTitle}`);
} catch (err) {
    console.warn('Gagal memperbarui version.ts:', err.message);
}

// 5. Sinkronkan src-tauri/tauri.conf.json jika ada
const tauriPath = path.resolve('src-tauri/tauri.conf.json');
if (fs.existsSync(tauriPath)) {
    try {
        const tauri = JSON.parse(fs.readFileSync(tauriPath, 'utf8'));
        if (tauri.version !== undefined) {
            tauri.version = newVersion;
        } else if (tauri.package?.version !== undefined) {
            tauri.package.version = newVersion;
        }
        fs.writeFileSync(tauriPath, JSON.stringify(tauri, null, 2) + '\n');
        console.log(`✓ src-tauri/tauri.conf.json disinkronkan ke v${newVersion}`);
    } catch (err) {
        console.warn('Gagal memperbarui tauri.conf.json:', err.message);
    }
}

// 6. Sinkronkan src-tauri/Cargo.toml jika ada
const cargoPath = path.resolve('src-tauri/Cargo.toml');
if (fs.existsSync(cargoPath)) {
    try {
        let cargo = fs.readFileSync(cargoPath, 'utf8');
        cargo = cargo.replace(/version\s*=\s*"[^"]+"/, `version = "${newVersion}"`);
        fs.writeFileSync(cargoPath, cargo, 'utf8');
        console.log(`✓ src-tauri/Cargo.toml disinkronkan ke v${newVersion}`);
    } catch (err) {
        console.warn('Gagal memperbarui Cargo.toml:', err.message);
    }
}

console.log(`🚀 Selesai! Titlebar akan menampilkan: "${fullTitle}"\n`);