/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './src/server/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Basic browser security headers.
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // Keep request bodies small until upload handling is redesigned securely.
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Production API allowlist. Authentication endpoints are enabled only where their
  // handlers perform server-side verification and persistent storage.
  if (process.env.NODE_ENV === 'production') {
    app.use('/api', (req, res, next) => {
      if (req.method === 'GET' && req.path === '/settings') {
        return res.json({ settings: {
          businessName: 'Made For You Music',
          brandShorthand: 'M4UM',
          brandAttribution: 'By TMG™',
          contactEmail: '',
          location: 'Aotearoa New Zealand',
          copyright: '',
          turnaroundPersonal: '3–5 business days',
          turnaroundSignature: '3–5 business days',
          turnaroundUltimate: '2–3 business days (Priority)',
          enableGmailNotifications: false
        }});
      }

      const allowedPost = [
        '/orders',
        '/auth/register',
        '/auth/login',
        '/auth/google',
        '/auth/logout',
        '/auth/change-password',
        '/auth/setup-admin',
        '/auth/reset-password-request',
        '/auth/reset-password',
      ];
      const allowedGet = [
        '/auth/me',
        '/packages',
        '/song-library',
        '/order-readiness',
        '/analytics',
        '/enquiries',
        '/audit-logs',
        '/team-members',
        '/notifications',
      ];
      const allowedPatch = ['/auth/update-profile'];
      const isOrderRead = req.method === 'GET' &&
        (req.path === '/orders' || (req.path.startsWith('/orders/') && req.path.split('/').length === 3));

      const allowed =
        (req.method === 'POST' && allowedPost.includes(req.path)) ||
        (req.method === 'GET' && (allowedGet.includes(req.path) || isOrderRead)) ||
        (req.method === 'PATCH' && allowedPatch.includes(req.path));

      if (!allowed) {
        return res.status(503).json({ error: 'This feature is temporarily unavailable while the service is being secured.' });
      }
      next();
    });
  }

  // API router
  app.use('/api', apiRouter);

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[M4UM Server] Made For You Music running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[M4UM Server] Failed to start:', err);
  process.exit(1);
});
