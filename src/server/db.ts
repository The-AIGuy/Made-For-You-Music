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
  const adminCreds = hashPassword('AdminPass2026!');
  const customerCreds = hashPassword('Customer2026!');

  const adminUser: DbUser = {
    id: 'user_admin_01',
    name: 'TMG Music Producer (Admin)',
    email: 'admin@madeforyoumusic.co.nz',
    role: 'admin',
    phone: '+64 21 000 0001',
    passwordHash: adminCreds.hash,
    salt: adminCreds.salt,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  const customerUser: DbUser = {
    id: 'user_cust_01',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    role: 'customer',
    phone: '+64 21 555 4321',
    passwordHash: customerCreds.hash,
    salt: customerCreds.salt,
    createdAt: '2026-02-15T10:00:00.000Z',
  };

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

  const sampleOrder1: Order = {
    id: 'ord_101',
    reference: 'M4UM-2026-1042',
    customerId: 'user_cust_01',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.jenkins@example.com',
    customerPhone: '+64 21 555 4321',
    packageId: 'signature',
    packageName: 'The Signature Song',
    price: 54.99,
    occasion: 'Anniversary',
    recipientName: 'David & Sarah',
    relationship: 'Husband & Wife (10th Anniversary)',
    nickname: 'Davey Bear',
    personality: 'Warm, thoughtful, always loves a bad pun, passionate tramper',
    interests: 'Hiking the Tongariro Crossing, craft beer, indie vinyl records, golden retriever parenting',
    memories: 'Getting caught in sudden rain at Lake Tekapo and making toast on a gas stove in the campervan',
    funnyStories: 'When David accidentally put salt instead of sugar in our first anniversary coffee',
    insideJokes: 'Code orange coffee, always packing 3 beanies',
    specialPhrases: 'Ten years and ten thousand miles',
    includedDetails: 'Mention our golden retriever Buster and our favourite camp spot at Matapouri',
    excludedDetails: 'Do not mention his old beaten-up Subaru',
    genre: 'Acoustic / Folk',
    mood: 'Heartfelt',
    vocalPreference: 'Male vocal',
    energy: 'Warm and uplifting',
    length: 'Approximately 3–4 minutes',
    creativeDirection: 'Gentle fingerpicked acoustic guitar building into an uplifting chorus celebrating a decade of partnership.',
    photos: [],
    status: 'Ready for Delivery',
    paymentStatus: 'Paid',
    paymentReference: 'TXN-NZD-5499-1042',
    assignedCreator: 'TMG Music Producer (Admin)',
    createdAt: '2026-03-01T12:00:00.000Z',
    updatedAt: '2026-03-05T16:30:00.000Z',
  };

  const sampleOrder2: Order = {
    id: 'ord_102',
    reference: 'M4UM-2026-1099',
    customerId: 'user_cust_01',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.jenkins@example.com',
    customerPhone: '+64 21 555 4321',
    packageId: 'personal',
    packageName: 'The Personal Song',
    price: 34.99,
    occasion: 'Birthday',
    recipientName: 'Liam Jenkins',
    relationship: 'Brother',
    nickname: 'Liamo',
    personality: 'Energetic, funny, tech geek, loves rock music',
    interests: 'Gaming, rock climbing, synthesizer jams',
    memories: 'Building tree forts in Piha as kids',
    genre: 'Rock',
    mood: 'Funny',
    vocalPreference: 'Male vocal',
    energy: 'Energetic and exciting',
    length: 'Approximately 2–3 minutes',
    creativeDirection: 'Fast tempo, lighthearted cheeky rock anthem about turning 30 and still playing video games until 2 AM.',
    photos: [],
    status: 'Awaiting Customer Lyric Approval',
    paymentStatus: 'Not Recorded',
    assignedCreator: 'TMG Music Producer (Admin)',
    createdAt: '2026-03-04T09:00:00.000Z',
    updatedAt: '2026-03-05T11:00:00.000Z',
  };

  const sampleLyrics: LyricVersion[] = [
    {
      id: 'lyr_01',
      orderId: 'ord_101',
      versionNumber: 1,
      title: 'Ten Years & Ten Thousand Miles',
      content: `[Verse 1]
From that rainy afternoon up at Tekapo
Making burnt toast on the camping stove
You handed me that coffee with a sideways smile
Said, "Pack another beanie, we've got another mile."

[Chorus]
Ten years, ten thousand miles, and a golden dog named Buster
You're the quiet compass and the light that I can trust in
Through the mountain ridges and the stormy coastal skies
I'd hike every single trail looking in your eyes.

[Verse 2]
Now we laugh about the salty coffee mornings
And the campervan that barely made the climb
At Matapouri beach where the gentle tide is calling
Every single memory feels sweeter over time.

[Bridge]
They say time goes fast when the love is true
I'd walk the crossing all over again with you.

[Chorus]
Ten years, ten thousand miles, and a golden dog named Buster
You're the quiet compass and the light that I can trust in
Through the mountain ridges and the stormy coastal skies
I'd hike every single trail looking in your eyes.

[Outro]
Code orange coffee, laughter in the rain
Here's to ten more years and starting once again.`,
      status: 'approved',
      notes: 'Initial approved version incorporating the campervan and Buster.',
      createdBy: 'TMG Music Producer (Admin)',
      createdAt: '2026-03-02T10:00:00.000Z',
      sharedAt: '2026-03-02T11:00:00.000Z',
      approvedAt: '2026-03-02T15:20:00.000Z',
    },
    {
      id: 'lyr_02',
      orderId: 'ord_102',
      versionNumber: 1,
      title: 'Level Thirty (The Ballad of Liamo)',
      content: `[Verse 1]
Back in Piha treehouse days, you were the captain of the crew
Scraped knees on the pohutukawa, nothing we couldn't do
Now you're turning the big three-zero with a brand new gaming rig
Drinking cold brew in the morning, acting moderately big!

[Chorus]
Happy Birthday Liam, you've unlocked level thirty!
Still climbing up the boulders, still playing dirty
Late night discord lobbies, synthesizers humming loud
Thirty years of being awesome, you make everybody proud!

[Verse 2]
You swear you'll sleep at midnight, but you find another quest
Building synth tracks on the weekend, giving sleep a little rest
From tree forts to tech support, you haven't lost the spark
A little older, just as funny, illuminating the dark!

[Chorus]
Happy Birthday Liam, you've unlocked level thirty!
Still climbing up the boulders, still playing dirty
Late night discord lobbies, synthesizers humming loud
Thirty years of being awesome, you make everybody proud!`,
      status: 'shared',
      notes: 'Shared with Sarah for her review before music production begins.',
      createdBy: 'TMG Music Producer (Admin)',
      createdAt: '2026-03-05T09:30:00.000Z',
      sharedAt: '2026-03-05T10:00:00.000Z',
    },
  ];

  const sampleStatusHistory: StatusHistory[] = [
    {
      id: 'sh_01',
      orderId: 'ord_101',
      previousStatus: 'None',
      newStatus: 'New Order',
      changedBy: 'System',
      note: 'Order submitted online by customer',
      createdAt: '2026-03-01T12:00:00.000Z',
    },
    {
      id: 'sh_02',
      orderId: 'ord_101',
      previousStatus: 'New Order',
      newStatus: 'Writing Lyrics',
      changedBy: 'TMG Music Producer (Admin)',
      note: 'Creative brief assigned and lyric drafting started',
      createdAt: '2026-03-01T14:30:00.000Z',
    },
    {
      id: 'sh_03',
      orderId: 'ord_101',
      previousStatus: 'Writing Lyrics',
      newStatus: 'Awaiting Customer Lyric Approval',
      changedBy: 'TMG Music Producer (Admin)',
      note: 'Shared Version 1 lyrics with Sarah',
      createdAt: '2026-03-02T11:00:00.000Z',
    },
    {
      id: 'sh_04',
      orderId: 'ord_101',
      previousStatus: 'Awaiting Customer Lyric Approval',
      newStatus: 'Lyrics Approved',
      changedBy: 'Sarah Jenkins',
      note: 'Customer approved Version 1 lyrics without revisions',
      createdAt: '2026-03-02T15:20:00.000Z',
    },
    {
      id: 'sh_05',
      orderId: 'ord_101',
      previousStatus: 'Lyrics Approved',
      newStatus: 'Song in Production',
      changedBy: 'TMG Music Producer (Admin)',
      note: 'Audio arrangement and acoustic production in progress',
      createdAt: '2026-03-03T09:00:00.000Z',
    },
    {
      id: 'sh_06',
      orderId: 'ord_101',
      previousStatus: 'Song in Production',
      newStatus: 'Ready for Delivery',
      changedBy: 'TMG Music Producer (Admin)',
      note: 'Master MP3 and lyrics PDF uploaded for customer download',
      createdAt: '2026-03-05T16:30:00.000Z',
    },
    {
      id: 'sh_07',
      orderId: 'ord_102',
      previousStatus: 'None',
      newStatus: 'New Order',
      changedBy: 'System',
      note: 'Order submitted online by customer',
      createdAt: '2026-03-04T09:00:00.000Z',
    },
    {
      id: 'sh_08',
      orderId: 'ord_102',
      previousStatus: 'New Order',
      newStatus: 'Awaiting Customer Lyric Approval',
      changedBy: 'TMG Music Producer (Admin)',
      note: 'Lyrics Version 1 ready for Sarah to review',
      createdAt: '2026-03-05T10:00:00.000Z',
    },
  ];

  const sampleFiles: OrderFile[] = [
    {
      id: 'fl_01',
      orderId: 'ord_101',
      fileName: 'Ten_Years_and_Ten_Thousand_Miles_Master.mp3',
      fileUrl: '/api/files/download/fl_01',
      fileType: 'mp3',
      fileSize: 4890000,
      version: 'v1.0-final',
      isCustomerVisible: true,
      uploadedBy: 'TMG Music Producer (Admin)',
      createdAt: '2026-03-05T16:00:00.000Z',
    },
    {
      id: 'fl_02',
      orderId: 'ord_101',
      fileName: 'Ten_Years_Printable_Lyrics.pdf',
      fileUrl: '/api/files/download/fl_02',
      fileType: 'printable_sheet',
      fileSize: 1240000,
      version: 'v1.0',
      isCustomerVisible: true,
      uploadedBy: 'TMG Music Producer (Admin)',
      createdAt: '2026-03-05T16:15:00.000Z',
    },
    {
      id: 'fl_03',
      orderId: 'ord_101',
      fileName: 'Custom_Digital_Cover_Art.png',
      fileUrl: '/api/files/download/fl_03',
      fileType: 'cover_art',
      fileSize: 2150000,
      version: 'v1.0',
      isCustomerVisible: true,
      uploadedBy: 'TMG Music Producer (Admin)',
      createdAt: '2026-03-05T16:20:00.000Z',
    },
    {
      id: 'fl_04_int',
      orderId: 'ord_101',
      fileName: 'Acoustic_Stems_StemMix_Internal.wav',
      fileUrl: '/api/files/download/fl_04_int',
      fileType: 'wav',
      fileSize: 45000000,
      version: 'stems-internal',
      isCustomerVisible: false, // Internal production file!
      uploadedBy: 'TMG Music Producer (Admin)',
      createdAt: '2026-03-04T15:00:00.000Z',
    },
  ];

  const sampleMessages: OrderMessage[] = [
    {
      id: 'msg_01',
      orderId: 'ord_101',
      senderId: 'user_admin_01',
      senderName: 'TMG Music Producer',
      senderRole: 'admin',
      message: 'Client requested warm folk guitar tone reminiscent of Crowded House meets Vance Joy.',
      isInternal: true, // INTERNAL NOTE
      createdAt: '2026-03-01T14:00:00.000Z',
    },
    {
      id: 'msg_02',
      orderId: 'ord_101',
      senderId: 'user_admin_01',
      senderName: 'M4UM Production Team',
      senderRole: 'admin',
      message: 'Kia ora Sarah! Your song has finished sound engineering and quality check. You can listen and download your finished files now.',
      isInternal: false, // CUSTOMER VISIBLE
      createdAt: '2026-03-05T16:30:00.000Z',
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

  const sampleEnquiries: Enquiry[] = [
    {
      id: 'enq_01',
      name: 'James Wilson',
      email: 'james.wilson@example.nz',
      subject: 'Inquiry regarding 50th golden wedding anniversary',
      message: 'Kia ora team, we are planning a 50th wedding anniversary for our parents in Christchurch. Can we include multiple voice perspectives in The Ultimate Gift package?',
      status: 'new',
      createdAt: '2026-03-06T08:15:00.000Z',
    },
  ];

  const sampleNotifications: Notification[] = [
    {
      id: 'notif_01',
      userId: 'user_cust_01',
      type: 'delivery',
      title: 'Your Song is Ready for Delivery!',
      message: 'Ten Years & Ten Thousand Miles has completed production. Download your finished files now.',
      orderId: 'ord_101',
      isRead: false,
      createdAt: '2026-03-05T16:30:00.000Z',
    },
    {
      id: 'notif_02',
      userId: 'user_cust_01',
      type: 'lyric',
      title: 'Lyrics Ready for Your Review',
      message: 'Lyrics Version 1 for order M4UM-2026-1099 are ready. Please review and approve or request revisions.',
      orderId: 'ord_102',
      isRead: false,
      createdAt: '2026-03-05T10:00:00.000Z',
    },
    {
      id: 'notif_03',
      userId: 'user_admin_01',
      type: 'order',
      title: 'New Order Received',
      message: 'Order M4UM-2026-1099 (The Personal Song) placed by Sarah Jenkins.',
      orderId: 'ord_102',
      isRead: true,
      createdAt: '2026-03-04T09:00:00.000Z',
    },
  ];

  const sampleAuditLogs: AuditLogEntry[] = [
    {
      id: 'aud_01',
      adminId: 'user_admin_01',
      adminName: 'TMG Music Producer (Admin)',
      action: 'STATUS_CHANGE',
      details: 'Changed status of M4UM-2026-1042 to Ready for Delivery',
      affectedRecordId: 'ord_101',
      createdAt: '2026-03-05T16:30:00.000Z',
    },
    {
      id: 'aud_02',
      adminId: 'user_admin_01',
      adminName: 'TMG Music Producer (Admin)',
      action: 'LYRIC_SHARED',
      details: 'Shared lyric draft v1 with customer for M4UM-2026-1099',
      affectedRecordId: 'ord_102',
      createdAt: '2026-03-05T10:00:00.000Z',
    },
  ];

  const settings: BusinessSettings = {
    businessName: 'Made For You Music',
    brandShorthand: 'M4UM',
    brandAttribution: 'By TMG®',
    contactEmail: 'hello@madeforyoumusic.co.nz',
    location: 'Aotearoa New Zealand',
    copyright: '© 2026 TMG Enterprises, LLC. All rights reserved.',
    turnaroundPersonal: '3–5 business days',
    turnaroundSignature: '3–5 business days',
    turnaroundUltimate: '2–3 business days (Priority)',
    enableGmailNotifications: true,
  };

  return {
    users: [adminUser, customerUser],
    packages,
    orders: [sampleOrder1, sampleOrder2],
    lyrics: sampleLyrics,
    revisions: [],
    statusHistory: sampleStatusHistory,
    files: sampleFiles,
    messages: sampleMessages,
    notifications: sampleNotifications,
    enquiries: sampleEnquiries,
    auditLogs: sampleAuditLogs,
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
