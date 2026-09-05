import fs from 'node:fs';
import path from 'node:path';

const bumpType = process.argv[2] || 'patch';

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

// Sinkronkan src-tauri/tauri.conf.json jika ada
const tauriPath = path.resolve('src-tauri/tauri.conf.json');
if (fs.existsSync(tauriPath)) {
  try {
    const tauri = JSON.parse(fs.readFileSync(tauriPath, 'utf8'));
    tauri.version = newVersion;
    fs.writeFileSync(tauriPath, JSON.stringify(tauri, null, 2) + '\n');
    console.log(`✓ src-tauri/tauri.conf.json disinkronkan ke v${newVersion}`);
  } catch (err) {
    console.warn('Gagal memperbarui tauri.conf.json:', err.message);
  }
}

// Sinkronkan src-tauri/Cargo.toml jika ada
const cargoPath = path.resolve('src-tauri/Cargo.toml');
if (fs.existsSync(cargoPath)) {
  try {
    let cargo = fs.readFileSync(cargoPath, 'utf8');
    cargo = cargo.replace(/version\s*=\s*"[^"]+"/, `version = "${newVersion}"`);
    fs.writeFileSync(cargoPath, cargo);
    console.log(`✓ src-tauri/Cargo.toml disinkronkan ke v${newVersion}`);
  } catch (err) {
    console.warn('Gagal memperbarui Cargo.toml:', err.message);
  }
}