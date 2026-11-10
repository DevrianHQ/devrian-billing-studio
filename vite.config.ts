import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function localDiskStoragePlugin(): Plugin {
  const dataDir = path.resolve(__dirname, 'data');
  const dbFile = path.join(dataDir, 'devrian_database.json');
  const backupsDir = path.join(dataDir, 'backups');

  const handleStorageMiddleware = (req: any, res: any, next: any) => {
    if (!req.url) return next();
    const url = req.url.split('?')[0];

    // GET /api/storage -> load permanent database from local disk
    if (url === '/api/storage' && req.method === 'GET') {
      try {
        if (fs.existsSync(dbFile)) {
          const content = fs.readFileSync(dbFile, 'utf-8');
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          return res.end(content);
        }
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        return res.end(JSON.stringify({ exists: false }));
      } catch (err: any) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: err.message }));
      }
    }

    // POST /api/storage -> save permanent database directly to local disk
    if (url === '/api/storage' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: any) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
          if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

          const parsed = JSON.parse(body);
          fs.writeFileSync(dbFile, JSON.stringify(parsed, null, 2), 'utf-8');

          // Daily backup snapshot
          const todayStr = new Date().toISOString().slice(0, 10);
          const backupFile = path.join(backupsDir, `devrian_backup_${todayStr}.json`);
          fs.writeFileSync(backupFile, JSON.stringify(parsed, null, 2), 'utf-8');

          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, savedAt: new Date().toISOString() }));
        } catch (err: any) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    next();
  };

  return {
    name: 'local-disk-storage-api',
    configureServer(server) {
      server.middlewares.use(handleStorageMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleStorageMiddleware);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), localDiskStoragePlugin()],
  server: {
    port: 4173,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
