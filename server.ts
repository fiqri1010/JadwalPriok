import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { handleApiRequest } from './server/apiRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
    const app = express();
    const port = Number(process.env.PORT) || 3000;
    const isDev = process.env.NODE_ENV !== 'production' && !fs.existsSync(path.join(__dirname, 'dist', 'index.html'));

    // 1. Health check endpoints
    app.get(['/healthz', '/_health', '/health', '/api/health'], (req, res) => {
        res.status(200).send('OK');
    });

    // 2. Data management API routes
    app.use('/api', (req, res, next) => {
        handleApiRequest(req, res, next);
    });

    if (isDev) {
        // Mount Vite middleware for dev mode
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
            server: { middlewareMode: true, host: '0.0.0.0', port },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        // Production: serve static build files
        const staticDir = fs.existsSync(path.join(__dirname, 'dist'))
            ? path.join(__dirname, 'dist')
            : fs.existsSync(path.join(__dirname, 'build'))
            ? path.join(__dirname, 'build')
            : path.join(__dirname, 'dist');
        const indexPath = path.join(staticDir, 'index.html');

        app.use(express.static(staticDir, {
            maxAge: '1d',
            setHeaders: (res, filePath) => {
                if (filePath.endsWith('index.html')) {
                    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                }
            }
        }));

        app.get('*', (req, res) => {
            if (fs.existsSync(indexPath)) {
                res.sendFile(indexPath);
            } else {
                res.status(200).send('<!doctype html><html lang="en"><head><title>JadwalPriok</title></head><body><div id="root">Loading JadwalPriok...</div></body></html>');
            }
        });
    }

    const server = app.listen(port, '0.0.0.0', () => {
        console.log(`JadwalPriok local data server running at http://0.0.0.0:${port}`);
    });

    const shutdown = () => {
        console.log('Received shutdown signal, closing server gracefully...');
        server.close(() => {
            process.exit(0);
        });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
}

startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
