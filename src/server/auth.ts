/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import type { DbUser } from './db.js';
import type { UserRole } from '../types.js';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  password_hash: string;
  salt: string;
  created_at: string;
}

interface StoredSession {
  user_id: string;
  expires_at: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('Persistent account storage is not configured.');
  return { baseUrl: url.endsWith('/') ? url.slice(0, -1) : url, key };
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { baseUrl, key } = supabaseConfig();
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    console.error('[M4UM] Account storage request failed:', response.status, detail);
    throw new Error('Persistent account storage request failed.');
  }
  if (response.status === 204) return undefined as T;
  const body = await response.text();
  return (body ? JSON.parse(body) : undefined) as T;
}

export function toDbUser(row: StoredUser): DbUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    phone: row.phone || undefined,
    passwordHash: row.password_hash,
    salt: row.salt,
    createdAt: row.created_at,
  };
}

export async function findAccountByEmail(email: string): Promise<DbUser | null> {
  const query = new URLSearchParams({ select: '*', email: `eq.${email.toLowerCase().trim()}`, limit: '1' });
  const rows = await supabaseRequest<StoredUser[]>(`m4um_users?${query.toString()}`);
  return rows[0] ? toDbUser(rows[0]) : null;
}

export async function hasAdminAccount(): Promise<boolean> {
  const query = new URLSearchParams({ select: 'id', role: 'eq.admin', limit: '1' });
  const rows = await supabaseRequest<Array<{ id: string }>>(`m4um_users?${query.toString()}`);
  return rows.length > 0;
}

export async function insertAccount(user: DbUser): Promise<void> {
  await supabaseRequest('m4um_users', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || null,
      password_hash: user.passwordHash,
      salt: user.salt,
      created_at: user.createdAt,
    }),
  });
}

export async function updateAccount(user: DbUser): Promise<void> {
  const query = new URLSearchParams({ id: `eq.${user.id}` });
  await supabaseRequest(`m4um_users?${query.toString()}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || null,
      password_hash: user.passwordHash,
      salt: user.salt,
    }),
  });
}

export async function createSession(userId: string): Promise<string> {
  const token = `m4um_${crypto.randomBytes(32).toString('hex')}`;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await supabaseRequest('m4um_sessions', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ token_hash: tokenHash, user_id: userId, expires_at: expiresAt }),
  });
  return token;
}

export async function revokeSession(token: string): Promise<void> {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const query = new URLSearchParams({ token_hash: `eq.${tokenHash}` });
  await supabaseRequest(`m4um_sessions?${query.toString()}`, { method: 'DELETE' });
}

export async function getUserByToken(token: string): Promise<DbUser | null> {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const sessionQuery = new URLSearchParams({ select: 'user_id,expires_at', token_hash: `eq.${tokenHash}`, limit: '1' });
  const sessions = await supabaseRequest<StoredSession[]>(`m4um_sessions?${sessionQuery.toString()}`);
  const session = sessions[0];
  if (!session) return null;
  if (Date.now() >= new Date(session.expires_at).getTime()) {
    await revokeSession(token);
    return null;
  }
  const userQuery = new URLSearchParams({ select: '*', id: `eq.${session.user_id}`, limit: '1' });
  const users = await supabaseRequest<StoredUser[]>(`m4um_users?${userQuery.toString()}`);
  return users[0] ? toDbUser(users[0]) : null;
}

function publicUser(user: DbUser): AuthenticatedUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone };
}

export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const user = await getUserByToken(authHeader.substring(7));
      if (user) req.user = publicUser(user);
    }
    next();
  } catch (error) {
    console.error('[M4UM] Optional authentication lookup failed:', error);
    next();
  }
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }
    const user = await getUserByToken(authHeader.substring(7));
    if (!user) return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
    req.user = publicUser(user);
    next();
  } catch (error) {
    console.error('[M4UM] Authentication lookup failed:', error);
    return res.status(503).json({ error: 'Account service is temporarily unavailable.' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  void requireAuth(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }
    next();
  });
}
