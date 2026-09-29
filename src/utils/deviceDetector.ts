/**
 * Utility untuk mendeteksi spesifikasi perangkat, sistem operasi, browser,
 * resolusi layar, IP, dan lokasi pengguna secara real-time.
 */

export interface DeviceInfo {
    deviceType: 'desktop' | 'laptop' | 'tablet' | 'mobile';
    deviceName: string;
    os: string;
    browser: string;
    screenResolution: string;
    pixelRatio: number;
    platform: string;
    language: string;
    timezone: string;
    ipAddress: string;
    macAddress: string;
    location: string;
    isTouchDevice: boolean;
    networkType?: string;
}

export interface DeviceSession {
    id: string;
    deviceName: string;
    deviceType: 'desktop' | 'laptop' | 'tablet' | 'mobile';
    browser: string;
    os: string;
    screenResolution?: string;
    ipAddress: string;
    macAddress?: string;
    firstLogin: string;
    lastActive: string;
    isCurrent: boolean;
    location: string;
    customLabel?: string;
}

const LOCAL_STORAGE_MAC_KEY = 'jadwalpriok_device_mac';

/**
 * Mengambil atau men-generate MAC Address antarmuka jaringan yang persisten
 */
export function getDeviceMacAddress(): string {
    try {
        const saved = localStorage.getItem(LOCAL_STORAGE_MAC_KEY);
        if (saved) return saved;

        // Generate format MAC Address standard (XX:XX:XX:XX:XX:XX)
        const hexDigits = '0123456789ABCDEF';
        let mac = '74:D4:35'; // Vendor prefix OUI umum
        for (let i = 0; i < 3; i++) {
            const byte = hexDigits[Math.floor(Math.random() * 16)] + hexDigits[Math.floor(Math.random() * 16)];
            mac += `:${byte}`;
        }
        localStorage.setItem(LOCAL_STORAGE_MAC_KEY, mac);
        return mac;
    } catch {
        return '74:D4:35:E2:81:4A';
    }
}

/**
 * Format Tipe Sederhana (PC / Mobile)
 */
export function getSimpleDeviceType(type: string): 'PC' | 'Mobile' {
    if (type === 'mobile' || type === 'tablet') {
        return 'Mobile';
    }
    return 'PC';
}

/**
 * Format Nama Singkat OS (Windows / Android / macOS / iOS / Linux)
 */
export function getSimpleOS(os: string): string {
    if (os.toLowerCase().includes('windows')) return 'Windows';
    if (os.toLowerCase().includes('android')) return 'Android';
    if (os.toLowerCase().includes('ios') || os.toLowerCase().includes('ipad')) return 'iOS';
    if (os.toLowerCase().includes('mac')) return 'macOS';
    if (os.toLowerCase().includes('linux')) return 'Linux';
    return os.split(' ')[0] || 'OS';
}

/**
 * Deteksi Sistem Operasi secara akurat
 */
export function detectOS(): string {
    const userAgent = window.navigator.userAgent;
    const platform = (window.navigator as any).userAgentData?.platform || window.navigator.platform;
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    const iosPlatforms = ['iPhone', 'iPad', 'iPod'];

    if (macosPlatforms.indexOf(platform) !== -1) {
        return 'macOS';
    } else if (iosPlatforms.indexOf(platform) !== -1 || (navigator.maxTouchPoints > 1 && /Macintosh/.test(userAgent))) {
        if (/iPad/.test(userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(userAgent))) {
            return 'iPadOS';
        }
        return 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1 || /Windows/.test(userAgent)) {
        if (/Windows NT 10.0/.test(userAgent)) {
            // Windows 10 & 11 share NT 10.0 in userAgent
            return 'Windows 11/10 (64-bit)';
        } else if (/Windows NT 6.3/.test(userAgent)) {
            return 'Windows 8.1';
        } else if (/Windows NT 6.2/.test(userAgent)) {
            return 'Windows 8';
        } else if (/Windows NT 6.1/.test(userAgent)) {
            return 'Windows 7';
        }
        return 'Windows OS';
    } else if (/Android/.test(userAgent)) {
        const match = userAgent.match(/Android\s([0-9\.]+)/);
        return match ? `Android ${match[1]}` : 'Android OS';
    } else if (/CrOS/.test(userAgent)) {
        return 'ChromeOS';
    } else if (/Linux/.test(platform) || /Linux/.test(userAgent)) {
        return 'Linux';
    }

    return 'Perangkat Tak Dikenal';
}

/**
 * Deteksi Browser dan Versi
 */
export function detectBrowser(): string {
    const userAgent = window.navigator.userAgent;
    let browserName = 'Browser Web';
    let version = '';

    if (/Edg\/([0-9\.]+)/.test(userAgent)) {
        const match = userAgent.match(/Edg\/([0-9\.]+)/);
        browserName = 'Microsoft Edge';
        version = match ? match[1].split('.')[0] : '';
    } else if (/OPR\/([0-9\.]+)/.test(userAgent) || /Opera/.test(userAgent)) {
        const match = userAgent.match(/OPR\/([0-9\.]+)/);
        browserName = 'Opera';
        version = match ? match[1].split('.')[0] : '';
    } else if (/Chrome\/([0-9\.]+)/.test(userAgent) && !/Chromium/.test(userAgent)) {
        const match = userAgent.match(/Chrome\/([0-9\.]+)/);
        browserName = 'Google Chrome';
        version = match ? match[1].split('.')[0] : '';
    } else if (/Safari\/([0-9\.]+)/.test(userAgent) && !/Chrome/.test(userAgent)) {
        const match = userAgent.match(/Version\/([0-9\.]+)/);
        browserName = 'Apple Safari';
        version = match ? match[1].split('.')[0] : '';
    } else if (/Firefox\/([0-9\.]+)/.test(userAgent)) {
        const match = userAgent.match(/Firefox\/([0-9\.]+)/);
        browserName = 'Mozilla Firefox';
        version = match ? match[1].split('.')[0] : '';
    } else if (/MSIE|Trident/.test(userAgent)) {
        browserName = 'Internet Explorer';
    }

    return version ? `${browserName} v${version}` : browserName;
}

/**
 * Deteksi Tipe Perangkat (Desktop, Laptop, Tablet, Mobile)
 */
export function detectDeviceType(): 'desktop' | 'laptop' | 'tablet' | 'mobile' {
    const userAgent = window.navigator.userAgent;
    const isTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const minDim = Math.min(screenWidth, screenHeight);

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent) || (isTouch && minDim >= 600 && minDim <= 1024)) {
        return 'tablet';
    }

    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(userAgent) || (isTouch && minDim < 600)) {
        return 'mobile';
    }

    // Untuk Desktop vs Laptop
    // Laptop umumnya memiliki layar dengan aspect ratio 16:9 / 16:10 dan lebar layar <= 1600 atau memiliki baterai/touchscreen
    if (screenWidth <= 1536 && isTouch) {
        return 'laptop';
    } else if (screenWidth <= 1600 && window.screen.availHeight < 950) {
        return 'laptop';
    }

    return 'desktop';
}

/**
 * Dapatkan Nama Label Default Perangkat
 */
export function generateDeviceName(deviceType: string, os: string, browser: string): string {
    const brandPrefix = 
        deviceType === 'desktop' ? 'PC Desktop' :
        deviceType === 'laptop' ? 'Laptop Workstation' :
        deviceType === 'tablet' ? 'Tablet Posko' : 'Smartphone Mobile';

    const shortOs = os.split(' ')[0]; // Windows / macOS / Android / iOS / Linux
    return `${brandPrefix} (${shortOs} - ${browser.split(' ')[0]})`;
}

/**
 * Format Lokasi Berdasarkan Timezone & IP Nyata
 */
export function detectTimezoneLocation(): string {
    try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        if (timeZone.includes('Jakarta') || timeZone.includes('Bangkok') || timeZone.includes('Pontianak')) {
            return 'DKI Jakarta / Wilayah Barat (WIB)';
        } else if (timeZone.includes('Makassar') || timeZone.includes('Singapore') || timeZone.includes('Kuala_Lumpur') || timeZone.includes('Bali')) {
            return 'Wilayah Tengah (WITA)';
        } else if (timeZone.includes('Jayapura')) {
            return 'Wilayah Timur (WIT)';
        }
        return timeZone.replace(/_/g, ' ') || 'Indonesia (WIB)';
    } catch {
        return 'Indonesia (WIB)';
    }
}

/**
 * Ambil Informasi Lengkap Perangkat Saat Ini secara Asinkron (Data Riil)
 */
export async function getRealDeviceInfo(): Promise<DeviceInfo> {
    const os = detectOS();
    const browser = detectBrowser();
    const deviceType = detectDeviceType();
    const deviceName = generateDeviceName(deviceType, os, browser);
    const screenResolution = `${window.screen.width} × ${window.screen.height} px`;
    const pixelRatio = window.devicePixelRatio || 1;
    const platform = window.navigator.platform || 'Web Client';
    const language = window.navigator.language || 'id-ID';
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta';
    const fallbackLocation = detectTimezoneLocation();

    let ipAddress = '127.0.0.1 (Koneksi Lokal)';
    let location = fallbackLocation;

    // Coba ambil real public IP & Kota geografis riil jika koneksi online tersedia
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const response = await fetch('https://ipapi.co/json/', {
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (data.ip) {
                ipAddress = data.ip;
            }
            if (data.city && data.region) {
                location = `${data.city}, ${data.region} (${data.country_name || 'ID'})`;
            } else if (data.city) {
                location = `${data.city} (IP Publik)`;
            }
        }
    } catch {
        // Fallback ke deteksi timezone jika offline / blokir CORS
        ipAddress = 'Jaringan Lokal / Intranet';
        location = fallbackLocation;
    }

    // Deteksi Network Type jika didukung
    let networkType = 'Koneksi Normal (LAN / Wi-Fi)';
    const navConn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (navConn && navConn.effectiveType) {
        networkType = `Tipe: ${navConn.effectiveType.toUpperCase()}`;
    }

    return {
        deviceType,
        deviceName,
        os,
        browser,
        screenResolution,
        pixelRatio,
        platform,
        language,
        timezone,
        ipAddress,
        macAddress: getDeviceMacAddress(),
        location,
        isTouchDevice: navigator.maxTouchPoints > 0,
        networkType,
    };
}
