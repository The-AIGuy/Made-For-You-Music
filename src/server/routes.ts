/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { db, dbManager, hashPassword, verifyPassword } from './db.js';
import {
  requireAuth,
  requireAdmin,
  optionalAuth,
  createSession,
  revokeSession,
  findAccountByEmail,
  insertAccount,
  updateAccount,
  type AuthRequest,
} from './auth.js';
import type {
  OrderStatus,
  OrderPackageId,
  Order,
  LyricVersion,
  RevisionRequest,
  StatusHistory,
  OrderFile,
  OrderMessage,
  Notification,
  Enquiry,
  AuditLogEntry,
  SongLibraryItem,
} from '../types.js';

export const apiRouter = Router();

const authAttemptWindow = new Map<string, { count: number; resetAt: number }>();
function limitAuthAttempts(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) {
  const key = String(req.ip || req.socket.remoteAddress || 'unknown');
  const now = Date.now();
  const current = authAttemptWindow.get(key);
  if (!current || current.resetAt <= now) {
    authAttemptWindow.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return next();
  }
  if (current.count >= 12) {
    res.setHeader('Retry-After', String(Math.ceil((current.resetAt - now) / 1000)));
    return res.status(429).json({ error: 'Too many account attempts. Please wait 15 minutes and try again.' });
  }
  current.count += 1;
  next();
}
apiRouter.use('/auth/register', limitAuthAttempts);
apiRouter.use('/auth/login', limitAuthAttempts);

apiRouter.get('/order-readiness', async (_req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseSecretKey) {
    return res.status(503).json({ ready: false, reason: 'Order storage configuration is missing.' });
  }
  try {
    const response = await fetch(`${(supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl)}/rest/v1/m4um_orders?select=id&limit=1`, {
      headers: { apikey: supabaseSecretKey },
    });
    if (!response.ok) {
      console.error('[M4UM] Order readiness check failed:', response.status);
      return res.status(503).json({ ready: false, reason: 'Secure order storage is not reachable.' });
    }
    return res.json({ ready: true, mode: 'order-request-only', payment: 'not-configured' });
  } catch (error) {
    console.error('[M4UM] Order readiness check failed:', error);
    return res.status(503).json({ ready: false, reason: 'Secure order storage is not reachable.' });
  }
});

// Helper to record audit log
function recordAudit(adminId: string, adminName: string, action: string, details: string, affectedRecordId?: string) {
  const entry: AuditLogEntry = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    adminId,
    adminName,
    action,
    details,
    affectedRecordId,
    createdAt: new Date().toISOString(),
  };
  db.auditLogs.unshift(entry);
  dbManager.persist();
}

// Helper to send notification
function sendNotification(userId: string, type: Notification['type'], title: string, message: string, orderId?: string) {
  const notif: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    type,
    title,
    message,
    orderId,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.unshift(notif);
  dbManager.persist();
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

apiRouter.post('/auth/register', async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.toLowerCase().trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';

  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  if (password.length < 12) return res.status(400).json({ error: 'Password must be at least 12 characters long.' });
  if (name.length > 100 || email.length > 254 || phone.length > 40) return res.status(400).json({ error: 'One or more fields are too long.' });

  try {
    if (await findAccountByEmail(email)) return res.status(409).json({ error: 'An account with this email address already exists.' });
    const { hash, salt } = hashPassword(password);
    const newUser = {
      id: `user_${crypto.randomUUID()}`,
      name,
      email,
      role: 'customer' as const,
      phone: phone || undefined,
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString(),
    };
    await insertAccount(newUser);
    const token = await createSession(newUser.id);
    return res.status(201).json({
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, phone: newUser.phone, createdAt: newUser.createdAt },
    });
  } catch (error) {
    console.error('[M4UM] Registration failed:', error);
    return res.status(503).json({ error: 'Account creation is temporarily unavailable. Please try again later.' });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.toLowerCase().trim() : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  try {
    const user = await findAccountByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = await createSession(user.id);
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, createdAt: user.createdAt },
    });
  } catch (error) {
    console.error('[M4UM] Login failed:', error);
    return res.status(503).json({ error: 'Login is temporarily unavailable. Please try again later.' });
  }
});

apiRouter.post('/auth/google', (_req, res) => {
  return res.status(503).json({ error: 'Google sign-in is temporarily disabled until server-side identity-token verification is implemented.' });
});

apiRouter.post('/auth/logout', requireAuth, async (req: AuthRequest, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    await revokeSession(authHeader.substring(7));
  }
  return res.json({ message: 'Logged out successfully.' });
});

apiRouter.get('/auth/me', requireAuth, (req: AuthRequest, res) => {
  return res.json({ user: req.user });
});

apiRouter.patch('/auth/update-profile', requireAuth, async (req: AuthRequest, res) => {
  const { name, phone, email } = req.body;
  const user = await findAccountByEmail(req.user!.email);
  if (!user || user.id !== req.user!.id) return res.status(404).json({ error: 'User not found.' });

  if (email && email.toLowerCase() !== user.email.toLowerCase()) {
    const existing = await findAccountByEmail(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ error: 'Email address is already taken by another account.' });
    }
    user.email = email.toLowerCase().trim();
  }

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();

  await updateAccount(user);
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
    },
  });
});

apiRouter.post('/auth/change-password', requireAuth, async (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required.' });
  }
  if (newPassword.length < 12) {
    return res.status(400).json({ error: 'New password must be at least 12 characters long.' });
  }

  const user = await findAccountByEmail(req.user!.email);
  if (!user || user.id !== req.user!.id) return res.status(404).json({ error: 'User not found.' });

  if (!verifyPassword(currentPassword, user.passwordHash, user.salt)) {
    return res.status(401).json({ error: 'Current password does not match.' });
  }

  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.salt = salt;
  await updateAccount(user);

  return res.json({ message: 'Password updated successfully.' });
});

apiRouter.post('/auth/reset-password-request', (_req, res) => {
  return res.status(503).json({ error: 'Password reset is temporarily unavailable until secure email delivery is configured.' });
});

apiRouter.post('/auth/reset-password', (_req, res) => {
  return res.status(503).json({ error: 'Password reset is temporarily unavailable until secure email delivery is configured.' });
});

// Secure Administrator Setup endpoint (Requires authorized setup secret key)
apiRouter.post('/auth/setup-admin', async (req, res) => {
  const { secretKey, setupKey, email, password, name } = req.body;
  const key = setupKey || secretKey;
  const REQUIRED_SECRET = process.env.ADMIN_SETUP_KEY;

  if (!REQUIRED_SECRET || !key || key !== REQUIRED_SECRET) {
    return res.status(403).json({ error: 'Invalid administrator setup secret key.' });
  }

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required for admin setup.' });
  }

  if (password.length < 12) {
    return res.status(400).json({ error: 'Admin password must be at least 12 characters long.' });
  }

  let adminUser = await findAccountByEmail(email.toLowerCase().trim());
  const { hash, salt } = hashPassword(password);

  if (adminUser) {
    adminUser.role = 'admin';
    adminUser.name = name.trim();
    adminUser.passwordHash = hash;
    adminUser.salt = salt;
  } else {
    adminUser = {
      id: `user_admin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: 'admin',
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString(),
    };
    // Insert the first administrator directly into persistent account storage.
  }

  if (await findAccountByEmail(adminUser.email)) await updateAccount(adminUser);
  else await insertAccount(adminUser);
  recordAudit(adminUser.id, adminUser.name, 'ADMIN_SETUP', 'Administrator account configured via secure key setup', adminUser.id);

  const token = await createSession(adminUser.id);
  return res.status(200).json({
    message: 'Administrator account configured securely.',
    token,
    user: {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      createdAt: adminUser.createdAt,
    },
  });
});

// ==========================================
// PACKAGES ROUTES
// ==========================================

apiRouter.get('/packages', (_req, res) => {
  return res.json({ packages: db.packages });
});

apiRouter.patch('/packages/:id', requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;
  const pkg = db.packages.find((p) => p.id === id);
  if (!pkg) return res.status(404).json({ error: 'Package not found.' });

  const { name, price, description, inclusions, active } = req.body;
  if (name !== undefined) pkg.name = name;
  if (price !== undefined) pkg.price = Number(price);
  if (description !== undefined) pkg.description = description;
  if (inclusions !== undefined && Array.isArray(inclusions)) pkg.inclusions = inclusions;
  if (active !== undefined) pkg.active = Boolean(active);

  dbManager.persist();
  recordAudit(req.user!.id, req.user!.name, 'UPDATE_PACKAGE', `Updated package settings for ${pkg.name}`, pkg.id);
  return res.json({ package: pkg });
});

// ==========================================
// ORDER SUBMISSION & RETRIEVAL
// ==========================================

apiRouter.post('/orders', optionalAuth, async (req: AuthRequest, res) => {
  const {
    packageId,
    occasion,
    occasionCustom,
    recipientName,
    relationship,
    nickname,
    personality,
    interests,
    memories,
    funnyStories,
    insideJokes,
    specialPhrases,
    includedDetails,
    excludedDetails,
    genre,
    genreCustom,
    mood,
    vocalPreference,
    energy,
    length,
    creativeDirection,
    photos,
    customerName,
    customerEmail,
    customerPhone,
  } = req.body;

  // Validation
  if (!packageId || !occasion || !recipientName || !relationship || !personality || !memories || !genre || !mood || !customerName || !customerEmail) {
    return res.status(400).json({ error: 'Please fill in all required fields to submit your order.' });
  }

  const pkg = db.packages.find((p) => p.id === packageId);
  if (!pkg) {
    return res.status(400).json({ error: 'The selected package is invalid.' });
  }

  // Public checkout must never create an account with a shared/default password.
  // Guest orders are stored independently and can be claimed only after verified authentication.
  const customerId = req.user?.id || 'guest';

  // Generate unique order reference M4UM-2026-XXXX
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const reference = `M4UM-${new Date().getFullYear()}-${randomNum}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    reference,
    customerId,
    customerName: customerName.trim(),
    customerEmail: customerEmail.toLowerCase().trim(),
    customerPhone: customerPhone?.trim(),
    packageId: pkg.id as OrderPackageId,
    packageName: pkg.name,
    price: pkg.price,
    occasion,
    occasionCustom: occasion === 'Other' ? occasionCustom : undefined,
    recipientName: recipientName.trim(),
    relationship: relationship.trim(),
    nickname: nickname?.trim(),
    personality: personality.trim(),
    interests: interests?.trim() || '',
    memories: memories.trim(),
    funnyStories: funnyStories?.trim(),
    insideJokes: insideJokes?.trim(),
    specialPhrases: specialPhrases?.trim(),
    includedDetails: includedDetails?.trim(),
    excludedDetails: excludedDetails?.trim(),
    genre,
    genreCustom: genre === 'Other' ? genreCustom : undefined,
    mood,
    vocalPreference: vocalPreference || 'No preference',
    energy: energy || 'Warm and uplifting',
    length: length || 'Approximately 2–3 minutes',
    creativeDirection: creativeDirection?.trim() || '',
    photos: Array.isArray(photos) ? photos : [],
    status: 'New Order',
    paymentStatus: 'Not Recorded',
    assignedCreator: 'TMG Creative Director',
    createdAt: now,
    updatedAt: now,
  };

  // Persist customer orders directly to the private Supabase table. The secret key
  // is server-only; RLS denies direct access from browser clients.
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseSecretKey) {
    return res.status(503).json({ error: 'Secure order storage is not configured yet. Please try again later.' });
  }

  try {
    const supabaseResponse = await fetch(`${(supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl)}/rest/v1/m4um_orders`, {
      method: 'POST',
      headers: {
        'apikey': supabaseSecretKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        reference: newOrder.reference,
        customer_email: newOrder.customerEmail,
        order_data: newOrder,
      }),
    });

    if (!supabaseResponse.ok) {
      const responseText = await supabaseResponse.text();
      console.error('[M4UM] Supabase order insert failed:', supabaseResponse.status, responseText.slice(0, 500));
      return res.status(503).json({ error: 'We could not securely save your order. No payment has been taken. Please try again later.' });
    }
  } catch (error) {
    console.error('[M4UM] Supabase order storage unavailable:', error);
    return res.status(503).json({ error: 'Order storage is temporarily unavailable. No payment has been taken.' });
  }

  // Keep in-memory state only for this running instance. Supabase is the source of truth.
  db.orders.unshift(newOrder);

  // Record initial status history
  const statusRecord: StatusHistory = {
    id: `sh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orderId: newOrder.id,
    previousStatus: 'None',
    newStatus: 'New Order',
    changedBy: customerName,
    note: 'Order submitted online by customer',
    createdAt: now,
  };
  db.statusHistory.unshift(statusRecord);

  // Notify customer
  sendNotification(
    customerId,
    'order',
    'Order Received!',
    `Your order for ${recipientName} (${pkg.name}) has been received. Reference: ${reference}.`,
    newOrder.id
  );

  // Notify administrators
  db.users
    .filter((u) => u.role === 'admin')
    .forEach((admin) => {
      sendNotification(
        admin.id,
        'order',
        'New Song Order Placed',
        `New order ${reference} by ${customerName} for ${recipientName} (${pkg.name}).`,
        newOrder.id
      );
    });

  // Order data has already been durably saved to Supabase above.
  return res.status(201).json({
    order: newOrder,
    message: 'Your order request has been received. Payment has not been taken; we will contact you with next steps.',
  });
});

apiRouter.get('/orders', requireAuth, async (req: AuthRequest, res) => {
  const user = req.user!;
  const { search, status, packageId, sortBy } = req.query;

  // Guest submissions are stored in Supabase, not the process memory database.
  // Only administrators may read the full incoming-order queue.
  let orders: Order[];
  if (user.role === 'admin') {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
    if (!supabaseUrl || !supabaseSecretKey) {
      return res.status(503).json({ error: 'Secure order storage is not configured.' });
    }
    try {
      const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;
      const response = await fetch(`${baseUrl}/rest/v1/m4um_orders?select=order_data&order=created_at.desc`, {
        headers: { apikey: supabaseSecretKey },
      });
      if (!response.ok) {
        console.error('[M4UM] Admin order list read failed:', response.status, (await response.text()).slice(0, 500));
        return res.status(503).json({ error: 'Could not load the secure order queue.' });
      }
      const rows = await response.json() as Array<{ order_data?: Order }>;
      orders = rows.map((row) => row.order_data).filter((order): order is Order => Boolean(order && order.id && order.reference));
    } catch (error) {
      console.error('[M4UM] Admin order list read failed:', error);
      return res.status(503).json({ error: 'Could not load the secure order queue.' });
    }
  } else {
    orders = db.orders.filter((order) => order.customerId === user.id);
  }

  if (user.role === 'admin') {
    if (status && status !== 'All') orders = orders.filter((order) => order.status === status);
    if (packageId && packageId !== 'All') orders = orders.filter((order) => order.packageId === packageId);
    if (search) {
      const q = String(search).toLowerCase();
      orders = orders.filter((order) =>
        order.reference.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerEmail.toLowerCase().includes(q) ||
        order.recipientName.toLowerCase().includes(q)
      );
    }
  }

  if (sortBy === 'oldest') {
    orders = [...orders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (sortBy === 'price_high') {
    orders = [...orders].sort((a, b) => b.price - a.price);
  } else {
    orders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return res.json({ orders });
});

apiRouter.get('/orders/:id', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const user = req.user!;
  let order = db.orders.find((o) => o.id === id);
  if (!order && user.role === 'admin') {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
    if (!supabaseUrl || !supabaseSecretKey) return res.status(503).json({ error: 'Secure order storage is not configured.' });
    try {
      const baseUrl = supabaseUrl.endsWith('/') ? supabaseUrl.slice(0, -1) : supabaseUrl;
      const query = new URLSearchParams({ select: 'order_data', 'order_data->>id': `eq.${id}`, limit: '1' });
      const response = await fetch(`${baseUrl}/rest/v1/m4um_orders?${query.toString()}`, { headers: { apikey: supabaseSecretKey } });
      if (!response.ok) return res.status(503).json({ error: 'Could not load this secure order.' });
      const rows = await response.json() as Array<{ order_data?: Order }>;
      order = rows[0]?.order_data;
    } catch (error) {
      console.error('[M4UM] Admin order detail read failed:', error);
      return res.status(503).json({ error: 'Could not load this secure order.' });
    }
  }

  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  // Security: Customer can ONLY access their own orders
  if (user.role === 'customer' && order.customerId !== user.id) {
    return res.status(403).json({ error: 'Access denied. You do not have permission to view this order.' });
  }

  // Get status history
  const history = db.statusHistory
    .filter((h) => h.orderId === order.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Get customer-visible messages vs all messages
  let messages = db.messages.filter((m) => m.orderId === order.id);
  if (user.role === 'customer') {
    // Strict requirement: Never accidentally expose internal notes to customers
    messages = messages.filter((m) => !m.isInternal);
  }

  // Get lyrics
  const lyrics = db.lyrics
    .filter((l) => l.orderId === order.id)
    .sort((a, b) => a.versionNumber - b.versionNumber);

  // Get revisions
  const revisions = db.revisions.filter((r) => r.orderId === order.id);

  // Get files
  let files = db.files.filter((f) => f.orderId === order.id);
  if (user.role === 'customer') {
    // Customer-visible files only become available when order is Ready for Delivery, Delivered, or Completed
    const isDeliverable = ['Ready for Delivery', 'Delivered', 'Completed'].includes(order.status);
    files = files.filter((f) => f.isCustomerVisible && isDeliverable);
  }

  return res.json({
    order,
    history,
    messages,
    lyrics,
    revisions,
    files,
  });
});

apiRouter.patch('/orders/:id', requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;
  const order = db.orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  const { assignedCreator, paymentStatus, paymentReference, recipientName, occasion, genre, mood } = req.body;

  if (assignedCreator !== undefined) order.assignedCreator = assignedCreator;
  if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;
  if (paymentReference !== undefined) order.paymentReference = paymentReference;
  if (recipientName !== undefined) order.recipientName = recipientName;
  if (occasion !== undefined) order.occasion = occasion;
  if (genre !== undefined) order.genre = genre;
  if (mood !== undefined) order.mood = mood;

  order.updatedAt = new Date().toISOString();
  dbManager.persist();

  recordAudit(req.user!.id, req.user!.name, 'UPDATE_ORDER', `Updated order details for ${order.reference}`, order.id);
  return res.json({ order });
});

// Update Order Status (Enforces Lyric Approval Rule!)
apiRouter.post('/orders/:id/status', requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const admin = req.user!;

  const order = db.orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  const validStatuses: OrderStatus[] = [
    'New Order',
    'Reviewing Order',
    'Writing Lyrics',
    'Awaiting Customer Lyric Approval',
    'Lyrics Approved',
    'Song in Production',
    'Quality Check',
    'Ready for Delivery',
    'Delivered',
    'Completed',
    'On Hold',
    'Cancelled',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status specified.' });
  }

  // =========================================================================
  // CRITICAL BUSINESS RULE:
  // "Final song production must not begin until lyrics are approved.
  //  The system must enforce this rule in the backend, not just visually."
  // =========================================================================
  if (status === 'Song in Production' || status === 'Quality Check' || status === 'Ready for Delivery' || status === 'Delivered') {
    const hasApprovedLyrics = db.lyrics.some((l) => l.orderId === order.id && l.status === 'approved');
    if (!hasApprovedLyrics && order.status !== 'Lyrics Approved') {
      return res.status(400).json({
        error:
          'Production Blocked: Final song production cannot begin until lyrics have been formally approved by the customer.',
      });
    }
  }

  const previousStatus = order.status;
  order.status = status;
  order.updatedAt = new Date().toISOString();

  // Record history
  const historyEntry: StatusHistory = {
    id: `sh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orderId: order.id,
    previousStatus,
    newStatus: status,
    changedBy: admin.name,
    note: note || `Status changed from ${previousStatus} to ${status}`,
    createdAt: new Date().toISOString(),
  };
  db.statusHistory.push(historyEntry);

  // Notify customer of important status transitions
  let notifTitle = `Order Status: ${status}`;
  let notifMessage = `Your order ${order.reference} status has been updated to "${status}".`;

  if (status === 'Writing Lyrics') {
    notifTitle = 'Lyrics Drafting Started';
    notifMessage = `Our songwriters have started crafting original lyrics for ${order.recipientName}.`;
  } else if (status === 'Awaiting Customer Lyric Approval') {
    notifTitle = 'Lyrics Ready for Your Review!';
    notifMessage = `Your personalized lyrics for ${order.recipientName} are ready for your review and approval.`;
  } else if (status === 'Song in Production') {
    notifTitle = 'Song in Production!';
    notifMessage = `Your approved lyrics are now in audio production and sound engineering.`;
  } else if (status === 'Ready for Delivery' || status === 'Delivered') {
    notifTitle = 'Your Finished Song is Ready!';
    notifMessage = `The finished song for ${order.recipientName} is ready for download in your dashboard!`;
  }

  sendNotification(order.customerId, 'order', notifTitle, notifMessage, order.id);
  recordAudit(admin.id, admin.name, 'STATUS_CHANGE', `Changed status of ${order.reference} from ${previousStatus} to ${status}`, order.id);

  dbManager.persist();
  return res.json({ order, historyEntry });
});

// Public Order Tracking by Reference and Customer Email
apiRouter.post('/orders/track', (req, res) => {
  const { reference, email } = req.body;
  if (!reference || !email) {
    return res.status(400).json({ error: 'Order reference and customer email are required.' });
  }

  const order = db.orders.find(
    (o) =>
      o.reference.toLowerCase().trim() === reference.toLowerCase().trim() &&
      o.customerEmail.toLowerCase().trim() === email.toLowerCase().trim()
  );

  if (!order) {
    return res.status(404).json({ error: 'No matching order found with the provided reference and email.' });
  }

  // Return public tracking info without sensitive internal notes
  const history = db.statusHistory
    .filter((h) => h.orderId === order.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const publicUpdates = db.messages
    .filter((m) => m.orderId === order.id && !m.isInternal)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return res.json({
    order: {
      reference: order.reference,
      recipientName: order.recipientName,
      packageName: order.packageName,
      occasion: order.occasion,
      genre: order.genre,
      mood: order.mood,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    },
    history,
    publicUpdates,
  });
});

// ==========================================
// LYRIC WRITING & APPROVAL SYSTEM
// ==========================================

apiRouter.post('/orders/:id/lyrics', requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { title, content, notes } = req.body;
  const admin = req.user!;

  const order = db.orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  if (!title || !content) {
    return res.status(400).json({ error: 'Lyric title and content are required.' });
  }

  const existingLyrics = db.lyrics.filter((l) => l.orderId === order.id);
  const nextVersion = existingLyrics.length + 1;

  const newLyric: LyricVersion = {
    id: `lyr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orderId: order.id,
    versionNumber: nextVersion,
    title: title.trim(),
    content: content.trim(),
    status: 'draft',
    notes: notes?.trim(),
    createdBy: admin.name,
    createdAt: new Date().toISOString(),
  };

  db.lyrics.push(newLyric);
  recordAudit(admin.id, admin.name, 'CREATE_LYRIC_DRAFT', `Created draft version ${nextVersion} for ${order.reference}`, order.id);
  dbManager.persist();

  return res.status(201).json({ lyric: newLyric });
});

apiRouter.post('/orders/:id/lyrics/:versionId/share', requireAdmin, (req: AuthRequest, res) => {
  const { id, versionId } = req.params;
  const admin = req.user!;

  const order = db.orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  const lyric = db.lyrics.find((l) => l.id === versionId && l.orderId === order.id);
  if (!lyric) return res.status(404).json({ error: 'Lyric version not found.' });

  lyric.status = 'shared';
  lyric.sharedAt = new Date().toISOString();

  // Move order status to Awaiting Customer Lyric Approval
  order.status = 'Awaiting Customer Lyric Approval';
  order.updatedAt = new Date().toISOString();

  db.statusHistory.push({
    id: `sh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orderId: order.id,
    previousStatus: order.status,
    newStatus: 'Awaiting Customer Lyric Approval',
    changedBy: admin.name,
    note: `Shared lyrics version ${lyric.versionNumber} ("${lyric.title}") with customer for approval.`,
    createdAt: new Date().toISOString(),
  });

  sendNotification(
    order.customerId,
    'lyric',
    'Lyrics Ready for Review!',
    `Your lyrics for ${order.recipientName} (Version ${lyric.versionNumber}) are ready to review and approve.`,
    order.id
  );

  recordAudit(admin.id, admin.name, 'SHARE_LYRIC', `Shared version ${lyric.versionNumber} for ${order.reference}`, order.id);
  dbManager.persist();

  return res.json({ lyric, order });
});

apiRouter.post('/orders/:id/lyrics/:versionId/approve', requireAuth, (req: AuthRequest, res) => {
  const { id, versionId } = req.params;
  const user = req.user!;

  const order = db.orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  if (user.role === 'customer' && order.customerId !== user.id) {
    return res.status(403).json({ error: 'Access denied. You can only approve lyrics for your own orders.' });
  }

  const lyric = db.lyrics.find((l) => l.id === versionId && l.orderId === order.id);
  if (!lyric) return res.status(404).json({ error: 'Lyric version not found.' });

  const now = new Date().toISOString();
  lyric.status = 'approved';
  lyric.approvedAt = now;

  const previousStatus = order.status;
  order.status = 'Lyrics Approved';
  order.updatedAt = now;

  db.statusHistory.push({
    id: `sh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orderId: order.id,
    previousStatus,
    newStatus: 'Lyrics Approved',
    changedBy: user.name,
    note: `Customer approved lyric version ${lyric.versionNumber} ("${lyric.title}").`,
    createdAt: now,
  });

  // Notify admins
  db.users
    .filter((u) => u.role === 'admin')
    .forEach((admin) => {
      sendNotification(
        admin.id,
        'lyric',
        'Lyrics Approved by Customer!',
        `${user.name} approved version ${lyric.versionNumber} for order ${order.reference}. Production can now begin.`,
        order.id
      );
    });

  dbManager.persist();
  return res.json({ lyric, order, message: 'Lyrics approved successfully! Our production team will now begin creating your song.' });
});

apiRouter.post('/orders/:id/lyrics/:versionId/revision', requireAuth, (req: AuthRequest, res) => {
  const { id, versionId } = req.params;
  const { feedback } = req.body;
  const user = req.user!;

  if (!feedback || feedback.trim().length === 0) {
    return res.status(400).json({ error: 'Please provide revision feedback describing what changes you would like.' });
  }

  const order = db.orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  if (user.role === 'customer' && order.customerId !== user.id) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const pkg = db.packages.find((p) => p.id === order.packageId);
  const maxRevisions = pkg ? pkg.maxRevisions : 1;

  // Check revision count
  const existingRevisions = db.revisions.filter((r) => r.orderId === order.id);
  if (existingRevisions.length >= maxRevisions) {
    return res.status(400).json({
      error: `Revision limit reached. Your package (${order.packageName}) includes up to ${maxRevisions} round(s) of lyric changes. Please contact support if additional revisions are needed.`,
    });
  }

  const lyric = db.lyrics.find((l) => l.id === versionId && l.orderId === order.id);
  if (!lyric) return res.status(404).json({ error: 'Lyric version not found.' });

  lyric.status = 'revision_requested';

  const revisionNumber = existingRevisions.length + 1;
  const revisionRecord: RevisionRequest = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orderId: order.id,
    lyricVersionId: lyric.id,
    versionNumber: lyric.versionNumber,
    feedback: feedback.trim(),
    revisionNumber,
    createdAt: new Date().toISOString(),
  };

  db.revisions.push(revisionRecord);

  order.status = 'Writing Lyrics';
  order.updatedAt = new Date().toISOString();

  db.statusHistory.push({
    id: `sh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orderId: order.id,
    previousStatus: 'Awaiting Customer Lyric Approval',
    newStatus: 'Writing Lyrics',
    changedBy: user.name,
    note: `Revision round ${revisionNumber} requested by customer.`,
    createdAt: new Date().toISOString(),
  });

  // Notify admins
  db.users
    .filter((u) => u.role === 'admin')
    .forEach((admin) => {
      sendNotification(
        admin.id,
        'lyric',
        'Revision Requested',
        `${user.name} requested lyric changes for order ${order.reference} (Round ${revisionNumber} of ${maxRevisions}).`,
        order.id
      );
    });

  dbManager.persist();
  return res.json({
    revision: revisionRecord,
    order,
    remainingRevisions: maxRevisions - revisionNumber,
    message: `Revision request submitted. You have ${maxRevisions - revisionNumber} revision round(s) remaining.`,
  });
});

// ==========================================
// FILES & DIGITAL DELIVERABLES
// ==========================================

apiRouter.post('/orders/:id/files', requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { fileName, fileUrl, fileType, fileSize, version, isCustomerVisible } = req.body;
  const admin = req.user!;

  const order = db.orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  if (!fileName || !fileType) {
    return res.status(400).json({ error: 'File name and file type are required.' });
  }

  const newFile: OrderFile = {
    id: `fl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orderId: order.id,
    fileName: fileName.trim(),
    fileUrl: fileUrl || `/api/files/download/${Date.now()}`,
    fileType,
    fileSize: Number(fileSize) || 2500000,
    version: version || '1.0',
    isCustomerVisible: Boolean(isCustomerVisible),
    uploadedBy: admin.name,
    createdAt: new Date().toISOString(),
  };

  db.files.push(newFile);
  recordAudit(admin.id, admin.name, 'UPLOAD_FILE', `Uploaded file ${fileName} (${fileType}) for ${order.reference}`, order.id);
  dbManager.persist();

  return res.status(201).json({ file: newFile });
});

apiRouter.get('/files/download/:fileId', requireAuth, (req: AuthRequest, res) => {
  const { fileId } = req.params;
  const user = req.user!;

  const file = db.files.find((f) => f.id === fileId);
  if (!file) return res.status(404).json({ error: 'File not found.' });

  const order = db.orders.find((o) => o.id === file.orderId);
  if (!order) return res.status(404).json({ error: 'Associated order not found.' });

  // Security check: Customer can only access their own files if customer-visible and ready for delivery
  if (user.role === 'customer') {
    if (order.customerId !== user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    if (!file.isCustomerVisible) {
      return res.status(403).json({ error: 'This file is internal and not accessible.' });
    }
    if (!['Ready for Delivery', 'Delivered', 'Completed'].includes(order.status)) {
      return res.status(403).json({ error: 'Digital deliverables are not yet available for download.' });
    }
  }

  // File download response (serves audio or text payload)
  res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
  res.setHeader('Content-Type', file.fileType === 'mp3' ? 'audio/mpeg' : file.fileType === 'lyrics_pdf' ? 'application/pdf' : 'application/octet-stream');
  return res.send(`M4UM Deliverable: ${file.fileName} for ${order.reference}`);
});

// ==========================================
// MESSAGES & NOTES
// ==========================================

apiRouter.post('/orders/:id/messages', requireAuth, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { message, isInternal } = req.body;
  const user = req.user!;

  const order = db.orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  if (user.role === 'customer' && order.customerId !== user.id) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  // Customers can NEVER post internal notes
  const internalFlag = user.role === 'admin' ? Boolean(isInternal) : false;

  const newMsg: OrderMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orderId: order.id,
    senderId: user.id,
    senderName: user.name,
    senderRole: user.role,
    message: message.trim(),
    isInternal: internalFlag,
    createdAt: new Date().toISOString(),
  };

  db.messages.push(newMsg);

  // If customer visible from admin, notify customer
  if (!internalFlag && user.role === 'admin') {
    sendNotification(order.customerId, 'order', 'Update on Your Song Order', `New message from the M4UM production team for ${order.reference}.`, order.id);
  } else if (user.role === 'customer') {
    // Notify admin
    db.users
      .filter((u) => u.role === 'admin')
      .forEach((admin) => {
        sendNotification(admin.id, 'order', 'Customer Message Received', `${user.name} sent a message regarding ${order.reference}.`, order.id);
      });
  }

  dbManager.persist();
  return res.status(201).json({ message: newMsg });
});

// ==========================================
// SONG LIBRARY (SHOWCASE)
// ==========================================

apiRouter.get('/song-library', optionalAuth, (req: AuthRequest, res) => {
  const isAdmin = req.user?.role === 'admin';
  if (isAdmin) {
    return res.json({ songs: db.songLibrary });
  }
  // Public only sees songs approved for public listening
  const publicSongs = db.songLibrary.filter((s) => s.isPublic);
  return res.json({ songs: publicSongs });
});

apiRouter.post('/song-library', requireAdmin, (req: AuthRequest, res) => {
  const { title, recipientName, occasion, genre, mood, audioUrl, duration, coverUrl, sampleLyricsSnippet, isPublic, orderId } = req.body;
  const admin = req.user!;

  if (!title || !genre || !mood || !audioUrl) {
    return res.status(400).json({ error: 'Title, genre, mood, and audio URL are required.' });
  }

  const newSong: SongLibraryItem = {
    id: `song_lib_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orderId,
    title: title.trim(),
    recipientName: recipientName?.trim(),
    occasion: occasion?.trim(),
    genre: genre.trim(),
    mood: mood.trim(),
    audioUrl: audioUrl.trim(),
    duration: duration || '3:00',
    coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    sampleLyricsSnippet: sampleLyricsSnippet?.trim() || '',
    isPublic: Boolean(isPublic),
    createdAt: new Date().toISOString(),
  };

  db.songLibrary.push(newSong);
  recordAudit(admin.id, admin.name, 'ADD_SONG_LIBRARY', `Added song "${title}" to library`, newSong.id);
  dbManager.persist();

  return res.status(201).json({ song: newSong });
});

apiRouter.patch('/song-library/:id', requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;
  const song = db.songLibrary.find((s) => s.id === id);
  if (!song) return res.status(404).json({ error: 'Song not found.' });

  const { isPublic, title, genre, mood, audioUrl, coverUrl, sampleLyricsSnippet } = req.body;
  if (isPublic !== undefined) song.isPublic = Boolean(isPublic);
  if (title !== undefined) song.title = title;
  if (genre !== undefined) song.genre = genre;
  if (mood !== undefined) song.mood = mood;
  if (audioUrl !== undefined) song.audioUrl = audioUrl;
  if (coverUrl !== undefined) song.coverUrl = coverUrl;
  if (sampleLyricsSnippet !== undefined) song.sampleLyricsSnippet = sampleLyricsSnippet;

  dbManager.persist();
  return res.json({ song });
});

// ==========================================
// CUSTOMER ENQUIRIES & CONTACT
// ==========================================

apiRouter.post('/enquiries', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const newEnquiry: Enquiry = {
    id: `enq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    subject: subject.trim(),
    message: message.trim(),
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  db.enquiries.unshift(newEnquiry);

  // Notify admins
  db.users
    .filter((u) => u.role === 'admin')
    .forEach((admin) => {
      sendNotification(admin.id, 'enquiry', 'New Contact Message', `Enquiry from ${name}: "${subject}"`, undefined);
    });

  dbManager.persist();
  return res.status(201).json({ message: 'Thank you for reaching out. We will get back to you shortly.', enquiry: newEnquiry });
});

apiRouter.get('/enquiries', requireAdmin, (_req, res) => {
  return res.json({ enquiries: db.enquiries });
});

apiRouter.patch('/enquiries/:id', requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;
  const enquiry = db.enquiries.find((e) => e.id === id);
  if (!enquiry) return res.status(404).json({ error: 'Enquiry not found.' });

  const { status, internalNotes } = req.body;
  if (status !== undefined) enquiry.status = status;
  if (internalNotes !== undefined) enquiry.internalNotes = internalNotes;

  dbManager.persist();
  return res.json({ enquiry });
});

// ==========================================
// ANALYTICS & REPORTING
// ==========================================

apiRouter.get('/analytics', requireAdmin, (_req, res) => {
  const orders = db.orders;

  const totalOrders = orders.length;
  const newOrders = orders.filter((o) => o.status === 'New Order').length;
  const reviewingOrders = orders.filter((o) => o.status === 'Reviewing Order' || o.status === 'Writing Lyrics').length;
  const awaitingApproval = orders.filter((o) => o.status === 'Awaiting Customer Lyric Approval').length;
  const inProduction = orders.filter((o) => o.status === 'Song in Production' || o.status === 'Quality Check').length;
  const readyForDelivery = orders.filter((o) => o.status === 'Ready for Delivery').length;
  const completedOrders = orders.filter((o) => o.status === 'Completed' || o.status === 'Delivered').length;
  const cancelledOrders = orders.filter((o) => o.status === 'Cancelled').length;

  // Strict rule: Only count revenue confirmed by payment provider (status: 'Paid')
  const confirmedPaidOrders = orders.filter((o) => o.paymentStatus === 'Paid');
  const confirmedRevenue = confirmedPaidOrders.reduce((sum, o) => sum + o.price, 0);

  const totalPotentialOrderValue = orders.filter((o) => o.status !== 'Cancelled').reduce((sum, o) => sum + o.price, 0);
  const averageOrderValue = totalOrders > 0 ? totalPotentialOrderValue / totalOrders : 0;

  // Distribution by package
  const byPackage: Record<string, number> = {};
  orders.forEach((o) => {
    byPackage[o.packageName] = (byPackage[o.packageName] || 0) + 1;
  });

  // Distribution by occasion
  const byOccasion: Record<string, number> = {};
  orders.forEach((o) => {
    byOccasion[o.occasion] = (byOccasion[o.occasion] || 0) + 1;
  });

  // Distribution by genre
  const byGenre: Record<string, number> = {};
  orders.forEach((o) => {
    byGenre[o.genre] = (byGenre[o.genre] || 0) + 1;
  });

  // Recent activity
  const recentAudit = db.auditLogs.slice(0, 10);

  return res.json({
    metrics: {
      totalOrders,
      newOrders,
      reviewingOrders,
      awaitingApproval,
      inProduction,
      readyForDelivery,
      completedOrders,
      cancelledOrders,
      confirmedRevenue: Number(confirmedRevenue.toFixed(2)),
      totalPotentialOrderValue: Number(totalPotentialOrderValue.toFixed(2)),
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
    },
    byPackage,
    byOccasion,
    byGenre,
    recentAudit,
  });
});

// ==========================================
// NOTIFICATIONS
// ==========================================

apiRouter.get('/notifications', requireAuth, (req: AuthRequest, res) => {
  const user = req.user!;
  const notifs = db.notifications
    .filter((n) => n.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({ notifications: notifs });
});

apiRouter.patch('/notifications/:id/read', requireAuth, (req: AuthRequest, res) => {
  const { id } = req.params;
  const user = req.user!;
  const notif = db.notifications.find((n) => n.id === id && n.userId === user.id);
  if (!notif) return res.status(404).json({ error: 'Notification not found.' });

  notif.isRead = true;
  dbManager.persist();
  return res.json({ notification: notif });
});

apiRouter.post('/notifications/mark-all-read', requireAuth, (req: AuthRequest, res) => {
  const user = req.user!;
  db.notifications
    .filter((n) => n.userId === user.id)
    .forEach((n) => {
      n.isRead = true;
    });
  dbManager.persist();
  return res.json({ message: 'All notifications marked as read.' });
});

// ==========================================
// SETTINGS & AUDIT LOG
// ==========================================

apiRouter.get('/settings', (_req, res) => {
  return res.json({ settings: db.settings });
});

apiRouter.patch('/settings', requireAdmin, (req: AuthRequest, res) => {
  const admin = req.user!;
  const updates = req.body;

  db.settings = {
    ...db.settings,
    ...updates,
  };

  recordAudit(admin.id, admin.name, 'UPDATE_SETTINGS', 'Updated business and production settings');
  dbManager.persist();
  return res.json({ settings: db.settings });
});

apiRouter.get('/audit-logs', requireAdmin, (_req, res) => {
  return res.json({ auditLogs: db.auditLogs });
});

// ==========================================
// GMAIL DISPATCH PREVIEW / LOG
// ==========================================

apiRouter.post('/gmail/log-dispatch', requireAuth, (req: AuthRequest, res) => {
  const { toEmail, subject, type, orderReference } = req.body;
  const user = req.user!;

  recordAudit(user.id, user.name, 'GMAIL_EMAIL_SENT', `Sent email (${type}) to ${toEmail} for order ${orderReference || 'N/A'}`);
  return res.json({ success: true, message: 'Email dispatch recorded.' });
});

// ==========================================
// TEAM / COLLABORATOR MANAGEMENT (Add others into the work)
// ==========================================

apiRouter.get('/team-members', requireAdmin, (_req: AuthRequest, res) => {
  const members = db.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone,
    createdAt: u.createdAt,
  }));
  return res.json({ members });
});

apiRouter.post('/team-members', requireAdmin, (req: AuthRequest, res) => {
  const admin = req.user!;
  const { email, name, role = 'admin', password, phone } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required to add a team member.' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    // Elevate or update role
    existing.role = role === 'admin' ? 'admin' : 'customer';
    if (name) existing.name = name.trim();
    if (phone) existing.phone = phone.trim();
    if (password && password.length >= 8) {
      const { hash, salt } = hashPassword(password);
      existing.passwordHash = hash;
      existing.salt = salt;
    }
    dbManager.persist();

    recordAudit(
      admin.id,
      admin.name,
      'TEAM_MEMBER_UPDATED',
      `Updated team permissions for ${existing.email} (Role: ${existing.role})`
    );

    return res.json({
      message: `User ${existing.email} is now updated with role: ${existing.role}.`,
      member: {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        role: existing.role,
        phone: existing.phone,
        createdAt: existing.createdAt,
      },
    });
  }

  // Create new team member
  if (typeof password !== 'string' || password.length < 12) {
    return res.status(400).json({ error: 'A unique password of at least 12 characters is required.' });
  }
  const { hash, salt } = hashPassword(password);

  const newMember = {
    id: `user_team_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    role: (role === 'admin' ? 'admin' : 'customer') as 'admin' | 'customer',
    phone: phone ? phone.trim() : undefined,
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newMember);
  dbManager.persist();

  recordAudit(
    admin.id,
    admin.name,
    'TEAM_MEMBER_ADDED',
    `Added new team collaborator: ${newMember.name} (${newMember.email}) as ${newMember.role}`
  );

  return res.status(201).json({
    message: `Team collaborator ${newMember.name} (${newMember.email}) added successfully.`,
    member: {
      id: newMember.id,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      phone: newMember.phone,
      createdAt: newMember.createdAt,
    },

  });
});
