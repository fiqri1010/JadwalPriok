import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

// Resolve static build directory (supports dist or build)
const staticDir = fs.existsSync(path.join(__dirname, 'dist'))
  ? path.join(__dirname, 'dist')
  : fs.existsSync(path.join(__dirname, 'build'))
  ? path.join(__dirname, 'build')
  : path.join(__dirname, 'dist');

const indexPath = path.join(staticDir, 'index.html');

// 1. Health check endpoints for Cloud Run liveness and readiness probes
app.get(['/healthz', '/_health', '/health', '/api/health'], (req, res) => {
  res.status(200).send('OK');
});

// 2. Serve static assets with caching headers
app.use(express.static(staticDir, {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// 3. Fallback to index.html for Single Page Application client-side routing
app.get('*', (req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath, (err) => {
      if (err && !res.headersSent) {
        res.status(500).send('Internal Server Error loading index.html');
      }
    });
  } else {
    res.status(200).send('<!doctype html><html lang="en"><head><title>JadwalPriok</title></head><body><div id="root">Loading JadwalPriok...</div></body></html>');
  }
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Cloud Run server listening on http://0.0.0.0:${port}`);
});

// Graceful shutdown handling for Cloud Run instance lifecycle
const shutdown = () => {
  console.log('Received shutdown signal, closing server gracefully...');
  server.close(() => {
    console.log('Server closed successfully.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

