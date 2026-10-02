import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const usersFilePath = path.join(dataDir, 'users.json');
const schedulesFilePath = path.join(dataDir, 'schedules.json');
const poskosFilePath = path.join(dataDir, 'poskos.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

function readJsonFile(filePath, fallback = null) {
    try {
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(raw);
        }
    } catch (e) {
        console.error(`Error reading ${filePath}:`, e);
    }
    return fallback;
}

function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (e) {
        console.error(`Error writing ${filePath}:`, e);
        return false;
    }
}

export function handleApiRequest(req, res, next) {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname.replace(/^\/api/, '');
    const method = req.method;

    const sendJson = (statusCode, data) => {
        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.end(JSON.stringify(data));
    };

    // 1. GET /api/users
    if (pathname === '/users' && method === 'GET') {
        const users = readJsonFile(usersFilePath, []);
        return sendJson(200, users);
    }

    // 2. POST /api/users
    if (pathname === '/users' && method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const users = JSON.parse(body);
                if (Array.isArray(users)) {
                    writeJsonFile(usersFilePath, users);
                    return sendJson(200, { success: true, count: users.length });
                }
                return sendJson(400, { error: 'Expected JSON array of users' });
            } catch (err) {
                return sendJson(400, { error: 'Invalid JSON payload' });
            }
        });
        return;
    }

    // 3. GET /api/poskos
    if (pathname === '/poskos' && method === 'GET') {
        const poskos = readJsonFile(poskosFilePath, { poskos: [], totalStaff: 0 });
        return sendJson(200, poskos);
    }

    // 4. GET /api/schedules
    if (pathname === '/schedules' && method === 'GET') {
        const schedules = readJsonFile(schedulesFilePath, {});
        return sendJson(200, schedules);
    }

    // 5. POST /api/schedules
    if (pathname === '/schedules' && method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const schedules = JSON.parse(body);
                writeJsonFile(schedulesFilePath, schedules);
                return sendJson(200, { success: true });
            } catch (err) {
                return sendJson(400, { error: 'Invalid JSON payload' });
            }
        });
        return;
    }

    // 6. POST /api/reset-master-data
    if (pathname === '/reset-master-data' && method === 'POST') {
        // Re-read or restore from default users
        const users = readJsonFile(usersFilePath, []);
        return sendJson(200, users);
    }

    // 7. GET /api/health
    if (pathname === '/health' && method === 'GET') {
        return sendJson(200, { status: 'OK', server: 'local-jadwalpriok-server' });
    }

    if (next) {
        return next();
    }
    return sendJson(404, { error: 'Not Found' });
}
