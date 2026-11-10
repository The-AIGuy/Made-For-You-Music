/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  User,
  PackageInfo,
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
  BusinessSettings,
  OrderStatus,
  OrderPackageId,
} from '../types.js';

export interface DbUser extends User {
  passwordHash: string;
  salt: string;
  resetToken?: string;
  resetExpires?: number;
}

export interface DatabaseSchema {
  users: DbUser[];
  packages: PackageInfo[];
  orders: Order[];
  lyrics: LyricVersion[];
  revisions: RevisionRequest[];
  statusHistory: StatusHistory[];
  files: OrderFile[];
  messages: OrderMessage[];
  notifications: Notification[];
  enquiries: Enquiry[];
  auditLogs: AuditLogEntry[];
  songLibrary: SongLibraryItem[];
  settings: BusinessSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'm4um-database.json');

// Password utility
export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): { hash: string; salt: string } {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return checkHash === hash;
}

// Initial seed data
function getDefaultDatabase(): DatabaseSchema {
  const packages: PackageInfo[] = [
    {
      id: 'personal',
      name: 'The Personal Song',
      price: 34.99,
      description: 'One personalised song, approx 2–3 minutes with original lyrics based on your story.',
      inclusions: [
        'One personalised song (approx. 2–3 minutes)',
        'Original lyrics based on your submitted story',
        'Choice of music genre & mood',
        '1 round of lyric changes before production',
        'Finished high-quality MP3 download',
        'Custom digital cover artwork',
      ],
      maxRevisions: 1,
      isPopular: false,
      active: true,
    },
    {
      id: 'signature',
      name: 'The Signature Song',
      price: 54.99,
      description: 'Our most popular tier with two musical versions and two rounds of lyric refinement.',
      inclusions: [
        'Everything in The Personal Song',
        'More detailed story personalization',
        'Up to 2 rounds of lyric changes before production',
        'Two musical versions to choose between',
        'Printable lyrics sheet (PDF)',
      ],
      maxRevisions: 2,
      isPopular: true,
      active: true,
    },
    {
      id: 'ultimate',
      name: 'The Ultimate Gift',
      price: 85.0,
      description: 'The complete musical keepsake with photo lyric video, gift card, and priority production.',
      inclusions: [
        'Everything in The Signature Song',
        'Personalised photo lyric video (up to 10 photos)',
        'Custom digital gift card with QR code',
        'Private digital gift celebration page',
        'Priority production & express turnaround',
      ],
      maxRevisions: 2,
      isPopular: false,
      active: true,
    },
  ];

  const sampleSongLibrary: SongLibraryItem[] = [
    {
      id: 'song_lib_01',
      title: 'Ten Years & Ten Thousand Miles',
      recipientName: 'David',
      occasion: 'Anniversary',
      genre: 'Acoustic / Folk',
      mood: 'Heartfelt',
      audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=acoustic-guitars-ambient-112349.mp3',
      duration: '3:18',
      coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
      sampleLyricsSnippet: 'Ten years, ten thousand miles, and a golden dog named Buster...',
      isPublic: true,
      createdAt: '2026-03-05T16:45:00.000Z',
    },
    {
      id: 'song_lib_02',
      title: 'Forever In The Bay',
      recipientName: 'Chloe & Ben',
      occasion: 'Wedding',
      genre: 'Pop',
      mood: 'Romantic',
      audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=inspire-109406.mp3',
      duration: '3:45',
      coverUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
      sampleLyricsSnippet: 'From the sands of Mount Maunganui to this moment holding hands...',
      isPublic: true,
      createdAt: '2026-02-14T11:00:00.000Z',
    },
    {
      id: 'song_lib_03',
      title: 'Coach Mike Always Said',
      recipientName: 'Mike',
      occasion: 'Thank You',
      genre: 'Rock',
      mood: 'Triumphant',
      audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c0765d75.mp3?filename=energy-sport-106519.mp3',
      duration: '2:52',
      coverUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80',
      sampleLyricsSnippet: 'Whistle at six sharp in the winter fog, teaching us what courage means...',
      isPublic: true,
      createdAt: '2026-02-28T09:00:00.000Z',
    },
  ];

  const settings: BusinessSettings = {
    businessName: 'Made For You Music',
    brandShorthand: 'M4UM',
    brandAttribution: 'By TMG™',
    contactEmail: '',
    location: 'Aotearoa New Zealand',
    copyright: '',
    turnaroundPersonal: '3–5 business days',
    turnaroundSignature: '3–5 business days',
    turnaroundUltimate: '2–3 business days (Priority)',
    enableGmailNotifications: true,
  };

  return {
    users: [],
    packages,
    orders: [],
    lyrics: [],
    revisions: [],
    statusHistory: [],
    files: [],
    messages: [],
    notifications: [],
    enquiries: [],
    auditLogs: [],
    songLibrary: sampleSongLibrary,
    settings,
  };
}

// Database singleton
class DatabaseManager {
  private db: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.db = this.load();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading persistent database, seeding defaults:', err);
    }
    const initial = getDefaultDatabase();
    this.saveData(initial);
    return initial;
  }

  private saveData(data: DatabaseSchema) {
    this.ensureDataDir();
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  public persist() {
    this.saveData(this.db);
  }

  public get data(): DatabaseSchema {
    return this.db;
  }
}

export const dbManager = new DatabaseManager();
export const db = dbManager.data;
