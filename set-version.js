const fs = require('fs');

try {
    // 1. Baca versi dasar dari package.json (misal: 1.0.6)
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const baseVersion = packageJson.version;

    // 2. Buat Timestamp YYYYMMDD.hhmm
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const timestamp = `${year}${month}${day}.${hours}${minutes}`;

    // 3. Gabungkan versi dengan timestamp menggunakan kata 'build'
    const fullVersion = `${baseVersion} build ${timestamp}`;

    // 4. Simpan ke file src/version.json agar bisa dibaca UI React
    fs.writeFileSync('src/version.json', JSON.stringify({ version: fullVersion }));

    console.log(`\nBerhasil! UI React telah diperbarui ke versi: ${fullVersion}`);

} catch (error) {
    console.error("Gagal mengatur versi:", error);
}
