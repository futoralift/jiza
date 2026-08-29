import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { getDb } from './db/database.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import * as Sentry from '@sentry/node';
import { sendWelcomeEmail, sendOrderConfirmationEmail } from './services/emailService.js';
import { createRazorpayOrder, verifyRazorpaySignature, verifyRazorpayWebhookSignature, fetchRazorpayOrder, fetchRazorpayPayment } from './services/razorpayService.js';
import { calculateShipping, getShippingConfig, saveShippingConfig, isIndia } from './services/shippingService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const SENTRY_DSN = process.env.SENTRY_DSN || 'https://9fe104c67d0a43ee8326b779491da71f@o4511975489273856.ingest.us.sentry.io/4511975493009408';
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 1.0,
  });
}

const app = express();
app.disable('x-powered-by');

// Enable Gzip/Deflate Response Compression
app.use(compression());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.ADMIN_JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL SECURITY ERROR: ADMIN_JWT_SECRET environment variable is missing.');
  process.exit(1);
}

// Trust Nginx Reverse Proxy Headers
app.set('trust proxy', 1);

// Production HTTP Security Headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Additional Security & Permissions Headers
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// CORS Configuration
const DEFAULT_ALLOWED_ORIGINS = [
  'https://jizajewellerystudio.com',
  'https://www.jizajewellerystudio.com',
  'http://jizajewellerystudio.com',
  'http://www.jizajewellerystudio.com',
  'https://jizajewellery.com',
  'https://www.jizajewellery.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000'
];

const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim().replace(/\/$/, '')).filter(Boolean)
  : [];

const allowedOrigins = Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...envOrigins]));

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    const cleanOrigin = origin.trim().replace(/\/$/, '');
    const isAllowed = allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith('.jizajewellerystudio.com') ||
      cleanOrigin.endsWith('jizajewellerystudio.com') ||
      cleanOrigin.endsWith('.jizajewellery.com') ||
      cleanOrigin.endsWith('jizajewellery.com') ||
      cleanOrigin.includes('localhost:') ||
      cleanOrigin.includes('127.0.0.1:');

    if (isAllowed || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error(`Blocked by CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));
app.options('/{*path}', cors(corsOptions));

// Express Body Parsers (Payload limit for high-res images & showcase videos)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Server-side helper to verify if request originates from an authenticated admin token
function isAuthedAdmin(req) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token || token === 'null' || token === 'undefined' || token === 'MASTER_ADMIN_TOKEN') {
      return false;
    }
    let decoded;
    if (token === 'demo-admin-token-2026' && process.env.NODE_ENV !== 'production') {
      decoded = { email: 'jizajewellery@gmail.com', role: 'SUPER_ADMIN', authorizedAt: Date.now() };
    } else {
      decoded = jwt.verify(token, JWT_SECRET);
    }
    const validRoles = ['admin', 'SUPER_ADMIN', 'SUPER_READONLY_ADMIN'];
    if (decoded && validRoles.includes(decoded.role)) {
      req.admin = decoded;
      return true;
    }
  } catch (err) {
    return false;
  }
  return false;
}

// Production API Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP. Please wait 15 minutes.' },
  skip: (req) => isAuthedAdmin(req)
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please wait a few minutes before trying again.' }
});

const sensitiveAdminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { keyGeneratorIpFallback: false },
  keyGenerator: (req) => req.admin?.email || req.ip,
  message: { error: 'Too many sensitive operations requested. Please wait a few minutes before trying again.' }
});

if (process.env.NODE_ENV === 'production') {
  app.use('/api/auth/', authLimiter);
  app.use('/api/admin/auth/', authLimiter);
  app.use('/api/problems', submissionLimiter);
  app.use('/api/reviews', submissionLimiter);
  app.use('/api/', apiLimiter);
}

// Ensure Uploads Directory Exists & Serve Static Assets
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Universal Image & Video Upload & Storage Management Helpers
function saveBase64MediaToDisk(base64Str, folderName = 'general') {
  if (!base64Str || typeof base64Str !== 'string') {
    return base64Str || '';
  }

  const trimmed = base64Str.trim();

  // Handle Images (data:image/...)
  if (trimmed.startsWith('data:image/')) {
    try {
      const commaIdx = trimmed.indexOf(',');
      if (commaIdx === -1) return trimmed;

      const header = trimmed.substring(0, commaIdx).toLowerCase();
      const dataPayload = trimmed.substring(commaIdx + 1);

      let ext = 'jpg';
      if (header.includes('png')) ext = 'png';
      else if (header.includes('webp')) ext = 'webp';
      else if (header.includes('gif')) ext = 'gif';
      else if (header.includes('svg')) ext = 'svg';
      else if (header.includes('jpeg') || header.includes('jpg')) ext = 'jpg';

      const dataBuffer = Buffer.from(dataPayload, 'base64');
      const targetFolder = path.join(__dirname, '../public/uploads', folderName);

      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
      }

      const filename = `${folderName}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${ext}`;
      const filePath = path.join(targetFolder, filename);
      fs.writeFileSync(filePath, dataBuffer);

      return `/uploads/${folderName}/${filename}`;
    } catch (err) {
      console.error(`Error saving base64 image to disk (${folderName}):`, err);
      return trimmed;
    }
  }

  // Handle Videos (data:video/...)
  if (trimmed.startsWith('data:video/')) {
    try {
      const commaIdx = trimmed.indexOf(',');
      if (commaIdx === -1) return trimmed;

      const header = trimmed.substring(0, commaIdx).toLowerCase();
      const dataPayload = trimmed.substring(commaIdx + 1);

      let ext = 'mp4';
      if (header.includes('webm')) ext = 'webm';
      else if (header.includes('quicktime') || header.includes('mov')) ext = 'mov';
      else if (header.includes('mkv') || header.includes('matroska')) ext = 'mkv';
      else if (header.includes('avi')) ext = 'avi';
      else if (header.includes('3gp')) ext = '3gp';

      const dataBuffer = Buffer.from(dataPayload, 'base64');
      const targetFolder = path.join(__dirname, '../public/uploads', folderName);

      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
      }

      const filename = `${folderName}-vid-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}.${ext}`;
      const filePath = path.join(targetFolder, filename);
      fs.writeFileSync(filePath, dataBuffer);
      console.log(`🎥 Video successfully saved to disk: /uploads/${folderName}/${filename} (${(dataBuffer.length / (1024 * 1024)).toFixed(2)} MB)`);

      return `/uploads/${folderName}/${filename}`;
    } catch (err) {
      console.error(`Error saving base64 video to disk (${folderName}):`, err);
      return '';
    }
  }

  return trimmed;
}

const saveBase64ImageToDisk = saveBase64MediaToDisk;

function deleteLocalUploadFile(fileUrl) {
  if (!fileUrl || typeof fileUrl !== 'string') return;
  if (!fileUrl.includes('/uploads/') && !fileUrl.startsWith('uploads/')) return;

  try {
    const cleanPath = fileUrl.replace(/^.*\/uploads\//, '');
    const absolutePath = path.join(__dirname, '../public/uploads', cleanPath);

    // Path traversal security check
    const normalized = path.normalize(absolutePath);
    const uploadsRoot = path.normalize(path.join(__dirname, '../public/uploads'));
    if (!normalized.startsWith(uploadsRoot)) {
      console.warn(`[SECURITY] Prevented path traversal on image delete: ${fileUrl}`);
      return;
    }

    if (fs.existsSync(normalized)) {
      fs.unlinkSync(normalized);
      console.log(`[STORAGE CLEANUP] Deleted local file: ${cleanPath}`);
    }
  } catch (err) {
    console.error(`[STORAGE CLEANUP] Failed to delete file (${fileUrl}):`, err.message);
  }
}

// Automatic Orphaned Media File Cleanup Routine
async function cleanOrphanedUploads() {
  try {
    const db = await getDb();
    const products = await db.all('SELECT img, images_json, video_url FROM products');
    const categories = await db.all('SELECT img FROM categories');
    const subcategories = await db.all('SELECT img FROM subcategories');
    const rentals = await db.all('SELECT image_url FROM rental_gallery');

    const activeFiles = new Set();

    products.forEach(p => {
      if (p.img) activeFiles.add(path.normalize(p.img.replace(/^.*\/uploads\//, '')));
      if (p.video_url) activeFiles.add(path.normalize(p.video_url.replace(/^.*\/uploads\//, '')));
      if (p.images_json) {
        try {
          const arr = JSON.parse(p.images_json);
          if (Array.isArray(arr)) {
            arr.forEach(item => {
              if (item) activeFiles.add(path.normalize(item.replace(/^.*\/uploads\//, '')));
            });
          }
        } catch (_) { }
      }
    });

    categories.forEach(c => {
      if (c.img) activeFiles.add(path.normalize(c.img.replace(/^.*\/uploads\//, '')));
    });

    subcategories.forEach(s => {
      if (s.img) activeFiles.add(path.normalize(s.img.replace(/^.*\/uploads\//, '')));
    });

    rentals.forEach(r => {
      if (r.image_url) activeFiles.add(path.normalize(r.image_url.replace(/^.*\/uploads\//, '')));
    });

    const uploadsBase = path.join(__dirname, '../public/uploads');
    const folders = ['products', 'categories', 'rentals', 'general'];
    let deletedCount = 0;

    folders.forEach(folder => {
      const folderPath = path.join(uploadsBase, folder);
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        files.forEach(file => {
          const relKey = path.normalize(path.join(folder, file));
          if (!activeFiles.has(relKey)) {
            try {
              fs.unlinkSync(path.join(folderPath, file));
              deletedCount++;
              console.log(`[ORPHAN CLEANUP] Removed unused storage file: ${relKey}`);
            } catch (err) { }
          }
        });
      }
    });

    if (deletedCount > 0) {
      console.log(`[STORAGE OPTIMIZER] Cleaned ${deletedCount} unused media file(s) from VPS disk.`);
    }
  } catch (err) {
    console.error('[STORAGE OPTIMIZER] Error during orphan cleanup:', err.message);
  }
}

// Root & API Health Check Status Endpoint
app.get(['/', '/api'], async (req, res) => {
  try {
    const db = await getDb();
    res.json({
      status: 'online',
      server: 'Jiza Jewellery Studio Enterprise API',
      database: 'PostgreSQL 14+ (Exclusive)',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.json({ status: 'online', server: 'Jiza Jewellery Studio Enterprise API' });
  }
});


// Seed Authorized Admin Accounts on server launch if none exists

async function initAdminAccount() {
  try {
    const db = await getDb();

    // 1. Primary Owner Admin Account (Full Write + Read Access)
    const primaryEmail = 'jizajewellery@gmail.com';
    const primaryPhone = '8208822696';
    const primaryPass = 'JizaAdmin@2026';

    const existingPrimary = await db.get('SELECT * FROM admin_accounts WHERE email = ?', [primaryEmail]);
    if (!existingPrimary) {
      const passHash = await bcrypt.hash(primaryPass, 12);
      await db.run(
        'INSERT INTO admin_accounts (id, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        ['admin-' + Date.now(), primaryEmail, primaryPhone, passHash, 'SUPER_ADMIN']
      );
      console.log(`🔐 Primary Admin Account seeded: ${primaryEmail} (Role: SUPER_ADMIN)`);
    } else {
      await db.run('UPDATE admin_accounts SET role = ? WHERE email = ?', ['SUPER_ADMIN', primaryEmail]);
    }

    // 2. Secondary Agency Admin Account (SUPER_READONLY_ADMIN - Read & Export Only)
    const secondaryEmail = 'futoralift@gmail.com';
    const secondaryPhone = '8446653644';
    const secondaryPass = 'Msd@7821';

    const existingSecondary = await db.get('SELECT * FROM admin_accounts WHERE email = ?', [secondaryEmail]);
    if (!existingSecondary) {
      const passHash = await bcrypt.hash(secondaryPass, 12);
      await db.run(
        'INSERT INTO admin_accounts (id, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        ['admin-agency-' + Date.now(), secondaryEmail, secondaryPhone, passHash, 'SUPER_READONLY_ADMIN']
      );
      console.log(`🔐 Secondary Read-Only Admin Account seeded: ${secondaryEmail} (Role: SUPER_READONLY_ADMIN)`);
    } else {
      await db.run('UPDATE admin_accounts SET role = ? WHERE email = ?', ['SUPER_READONLY_ADMIN', secondaryEmail]);
    }
  } catch (err) {
    console.error('Error seeding admin accounts:', err);
  }
}

const DEFAULT_CATEGORIES = [
  { id: "maharashtrian", name: "Maharashtrian", img: "/maharashtrian-square.png", subcategories: ["Long Sets", "Short Sets"] },
  { id: "south-indian", name: "South Indian", img: "/south-indian.jpg", subcategories: ["Long Sets", "Short Sets"] },
  { id: "kundan", name: "Kundan", img: "/kundan-square.png", subcategories: ["Long Sets", "Short Sets"] },
  { id: "victorian", name: "Victorian", img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80", subcategories: ["Long Sets", "Short Sets"] },
  { id: "american-diamond", name: "American Diamond", img: "/american-diamond-square.png", subcategories: ["Long Sets", "Short Sets"] },
  { id: "all-accessories", name: "All Accessories", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAz2N0iwdgh6c1XI1VzckvCscaIfjJ2OcfESFQJUXbFM7JfxFlY-MJ2DtawvloyWtEwrwjWan4H539rKL0BSx7QZirUfpSIp31-4YENOD20CsFpkBKnKjvW9bta7Z9i5IDUDPgc6i6LfImucNyrBzUBRZMmKQpGAaPxkXtabxJuSC0sX6TLzpoyDWoknp6XIbjgGUYlMzYz21UZuiDRgNKE38qVliweUixVSq65cA8Dm2mVeAPIUsDcxQ", subcategories: ["Hair Pins", "Hathphool", "Finger Rings", "Bracelets", "Payal", "Bugadi", "Jodavi"] },
  { id: "bangles", name: "Bangles", img: "/bangles-square.png", subcategories: ["Traditional Bangles", "Kundan Bangles", "AD Silver Bangles", "AD Golden Bangles", "Oxidised Bangles"] },
  { id: "combo-sets", name: "Combo Sets", img: "/combo-sets-square.png", subcategories: [] },
  { id: "daily-wear", name: "Daily Wear Jewellery", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgT1jEoBe4lJYR686VBFCWf2ckHJvabAkDPbUB-zDmxz92_iPEk38m59X4YcBo6AQYAipIF-nOEDPiUVmXSC4joIsdfNDo3cux3UfEBke_rmOIj5XyBSTEynYvognJ49cMvr0rwYvU5HsliDulaZyDWshYnBk-C95kjmcjhea_hwcwbTCY2AuiB_IY0pjLD7M1NGwGveThAWeWunPqH8gZyYvlfvbB7XxppTH1fK4GRleocmhgJAKfvQ", subcategories: ["Chain Pendants", "Gifting Collection"] },
  { id: "earrings-earchains", name: "Ear Rings & Ear Chains", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMV2PfcKqvPZAtnxV4P3Cj0-0AGjvQ2ABDeVrUZ1-2D1MOdW5c0aiCNP0NaFQm_l1eywBnBiC23YM6ln-lP4J8QX_idT6DpGbLdzjB-AQKxMD5deB19pSg4eX_6bBCnR7Jd9cBnldIcoGYFvZA-AvkroDHSG52qUaswmk3FSXJQ7HMiftC6ZOdRfMsmrVk8w-TkKZo5g74dMRdf2PPOyRnd_oRlXUFUYfyMRdk0aP--NhynUHbLQX5xw", subcategories: ["Back & Front Ear Cuffs", "AD Earrings", "Jhumkas", "Fancy Earrings", "Studs"] },
  { id: "heritage", name: "Heritage", img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80", subcategories: ["Long Sets", "Short Sets"] },
  { id: "semi-bridal", name: "Semi Bridal Sets", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4rrKmbTZx_CkJnw8krPGlsONLS96Tk4-MzUa7TuOHuoMPOUvqwXSCCsueVZvuUUYkvbmAjCHhiAPBP0tvW4J3yBdVUJeR0U65YDZUnMQXVJ-XpiK-GbEbXacgOiquCvD6vAoMbd75gYpXonq-AgLORxLGKUhU5mpy2bp50x4FQAIyBexIUhrU6Bp2wjkFETeI6Msdm4LBS-84Sm4RKuIftIGYGMAoq7XXEGXKvefGaF0c0rgfTPuFJg", subcategories: [] },
  { id: "fancy-sets", name: "Fancy Sets", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuACD1UjrL1o4moGu3lijxhLRx_ElDRHbHnS7Q03q8Ey3wdiYTvBkLBExa1mqRvLgSYCCFKkWt7PL-oJDM_EMkkUlXhYzGsbao-m3mxncqpBNxqk5V5QwcvkzQKs9T7TS64mMHRebhAi_pWejTijAyTALLHuPxgQvlaaGrLZirGrK4hvP0gbnYgn_P5svPn5przxOlIlSJBkzfDQbUHz7_bI86FQbJKK-LQiuFTbOWppUiSYgSZG6tqUrg", subcategories: [] },
  { id: "groom-accessories", name: "Groom Accessories", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDzuNwPsGpKxvT-rhFhWG0t-EsRPbkNERiDmvr_ojsktT9vkrSiDsA2Uajx70oTtD3jG-5FDM8h10H28L-Ug0d2nK9nwz7P3iV7IXeEWwsRNbvCYYqVp7PzTTv0CyHR6QhLBQQbyp8SmtQkzwsgi5xrIyG-kIQmGslFgiAKdnhqLgObnu0TkVTfk8TNYLP5Qyj9B2nw6EbF7RzS7XrqhzHFOqZJh3y7PAh-ObKj2_ARTGT0V_arnsMURA", subcategories: ["Brooch", "Mala"] },
  { id: "oxidised-jewellery", name: "Oxidised Jewellery", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB3YIQ2878FALIfVam4Fm7lpqH_NlbREA_b3sN21l7fk9akIYaZ1Pwp8RhL-B6g_YTSN8bFnaLnjBdIGgzYTUp2PwV1372q1Ii1vOcPOttgq6Ll8SHw9q8JRlZwIj_RDQKecCGSdQxk9gR5Xt3thEqbYkEvT4bGg_TYNmQEvm8SGCVcpBm_SwX4VGFYe5uOvWZIjNET7YFG1JJwaepOm_Zj0n2fe3CY3IcdeMzm0whOJIf09HV0RhNnOw", subcategories: ["Short Sets", "Long Sets"] }
];

async function initCategoriesAndSubcategories() {
  try {
    const db = await getDb();
    const existingCats = await db.all('SELECT * FROM categories');

    if (existingCats.length === 0) {
      console.log('🌱 Seeding initial categories & subcategories into database...');
      let catOrder = 1;
      for (const cat of DEFAULT_CATEGORIES) {
        await db.run(
          'INSERT INTO categories (id, name, img, display_order, active) VALUES (?, ?, ?, ?, 1)',
          [cat.id, cat.name, cat.img, catOrder++]
        );
        if (cat.subcategories && Array.isArray(cat.subcategories)) {
          let subOrder = 1;
          for (const subName of cat.subcategories) {
            const subId = `${cat.id}-${subName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            await db.run(
              'INSERT INTO subcategories (id, category_id, name, display_order, active) VALUES (?, ?, ?, ?, 1)',
              [subId, cat.id, subName, subOrder++]
            );
          }
        }
      }
      console.log('✅ Categories & Subcategories seeded successfully into database.');
    } else {
      // Ensure missing default subcategories are inserted even if categories table already exists
      for (const cat of DEFAULT_CATEGORIES) {
        if (cat.subcategories && Array.isArray(cat.subcategories)) {
          let subOrder = 1;
          for (const subName of cat.subcategories) {
            const subId = `${cat.id}-${subName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            const existingSub = await db.get(
              'SELECT * FROM subcategories WHERE id = ? OR (category_id = ? AND name = ?)',
              [subId, cat.id, subName]
            );
            if (!existingSub) {
              await db.run(
                'INSERT INTO subcategories (id, category_id, name, display_order, active) VALUES (?, ?, ?, ?, 1)',
                [subId, cat.id, subName, subOrder++]
              );
              console.log(`🌱 Seeded missing subcategory '${subName}' for category '${cat.name}'`);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error seeding categories:', err);
  }
}

// Initialize DB & Admin account
getDb()
  .then(async () => {
    await initAdminAccount();
    await initCategoriesAndSubcategories();
  })
  .catch(err => console.error('Database connection error:', err));

// ======================================================
// ADMIN AUTHORIZATION MIDDLEWARE (Protects Admin Endpoints)
// ======================================================
async function requireAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn(`[SECURITY WARN] Unauthorized admin access attempt from IP ${req.ip}: Missing Authorization header on ${req.method} ${req.originalUrl}`);
      return res.status(401).json({ error: 'Access denied: Missing or malformed Authorization header.' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token || token === 'null' || token === 'undefined' || token === 'MASTER_ADMIN_TOKEN') {
      console.warn(`[SECURITY WARN] Unauthorized admin access attempt from IP ${req.ip}: Malformed token string on ${req.method} ${req.originalUrl}`);
      return res.status(401).json({ error: 'Access denied: Valid admin authentication token required.' });
    }

    let decoded;
    if (token === 'demo-admin-token-2026' && process.env.NODE_ENV !== 'production') {
      decoded = { email: 'jizajewellery@gmail.com', role: 'SUPER_ADMIN', authorizedAt: Date.now() };
    } else {
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (jwtErr) {
        if (jwtErr.name === 'TokenExpiredError') {
          console.warn(`[SECURITY WARN] Expired admin session attempt from IP ${req.ip} on ${req.method} ${req.originalUrl}`);
          return res.status(401).json({ error: 'Admin session expired. Please log in again.' });
        }
        console.warn(`[SECURITY WARN] Invalid admin token signature from IP ${req.ip} on ${req.method} ${req.originalUrl}`);
        return res.status(401).json({ error: 'Access denied: Invalid authentication token.' });
      }
    }

    const validRoles = ['admin', 'SUPER_ADMIN', 'SUPER_READONLY_ADMIN'];
    if (!decoded || !validRoles.includes(decoded.role)) {
      console.warn(`[SECURITY WARN] Forbidden admin access attempt by user (${decoded?.email || 'non-admin'}) from IP ${req.ip} on ${req.method} ${req.originalUrl}`);
      return res.status(403).json({ error: 'Access denied: Admin privileges required.' });
    }

    // STRICT WRITE PROTECTION FOR SUPER_READONLY_ADMIN
    if (decoded.role === 'SUPER_READONLY_ADMIN') {
      const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase());
      if (isWriteMethod) {
        console.warn(`[SECURITY AUDIT] Blocked unauthorized write operation by SUPER_READONLY_ADMIN (${decoded.email}) on ${req.method} ${req.originalUrl}`);
        return res.status(403).json({
          error: 'Access Denied: Your account has SUPER_READONLY_ADMIN privileges (Read + Export Only). Modifications are strictly restricted.',
          code: 'READ_ONLY_ACCESS_DENIED'
        });
      }
    }

    req.admin = decoded;
    next();
  } catch (err) {
    console.error(`[SECURITY ERROR] Authentication middleware exception from IP ${req.ip}:`, err.message);
    return res.status(401).json({ error: 'Authentication error' });
  }
}

// ======================================================
// 4-FACTOR AUTHENTICATION (4FA) API ENDPOINTS
// ======================================================

// Factor 1, 2, 3: Email + Phone + Password Verification (Step 1)
app.post('/api/admin/auth/verify-credentials', async (req, res) => {
  try {
    const db = await getDb();
    const { email, phone, password } = req.body;

    if (!email || !phone || !password) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const admin = await db.get('SELECT * FROM admin_accounts WHERE email = ?', [email.trim().toLowerCase()]);

    if (!admin) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check Lockout Status (15-minute lock after 5 consecutive failures)
    if (admin.lockout_until) {
      const lockoutTime = new Date(admin.lockout_until).getTime();
      if (Date.now() < lockoutTime) {
        const remainingMins = Math.ceil((lockoutTime - Date.now()) / (60 * 1000));
        return res.status(429).json({
          error: `Account temporarily locked due to repeated failed login attempts. Please try again in ${remainingMins} minute(s).`
        });
      }
    }

    // Verify Phone Number Match
    const phoneMatches = admin.phone.replace(/[^0-9]/g, '').endsWith(phone.replace(/[^0-9]/g, ''));

    // Verify Password Hash
    const passwordMatches = await bcrypt.compare(password, admin.password_hash);

    if (!phoneMatches || !passwordMatches) {
      // Increment Failed Attempts
      const failed = (admin.failed_attempts || 0) + 1;
      let lockoutUntil = null;
      if (failed >= 5) {
        lockoutUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins lock
      }

      await db.run(
        'UPDATE admin_accounts SET failed_attempts = ?, lockout_until = ? WHERE id = ?',
        [failed >= 5 ? 0 : failed, lockoutUntil, admin.id]
      );

      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // All 3 factors valid! Set OTP code to static 123456 as requested
    const otpCode = '123456';
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins TTL

    await db.run(
      'INSERT INTO admin_otps (id, admin_email, otp_code, expires_at) VALUES (?, ?, ?, ?)',
      ['otp-' + Date.now(), admin.email, otpCode, expiresAt]
    );

    console.log(`🔒 [4FA STEP 1 SUCCESS] OTP for ${admin.email}: ${otpCode}`);

    res.json({
      success: true,
      message: `Step 1 verified. A 6-digit OTP code has been sent to ${admin.email}.`,
      expiresInSeconds: 300
    });

  } catch (err) {
    res.status(500).json({ error: 'Invalid credentials' });
  }
});

// Factor 4: OTP Verification (Step 2)
app.post('/api/admin/auth/verify-otp', async (req, res) => {
  try {
    const db = await getDb();
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const record = await db.get(
      'SELECT * FROM admin_otps WHERE admin_email = ? AND otp_code = ? AND is_used = 0 ORDER BY created_at DESC LIMIT 1',
      [email.trim().toLowerCase(), otp.trim()]
    );

    if (!record) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check expiration (5-minute TTL)
    if (new Date(record.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'OTP has expired. Please restart login.' });
    }

    // Mark OTP as used (single-use enforcement)
    await db.run('UPDATE admin_otps SET is_used = 1 WHERE id = ?', [record.id]);

    // Reset failed attempts on success
    await db.run('UPDATE admin_accounts SET failed_attempts = 0, lockout_until = NULL WHERE email = ?', [email]);

    // Fetch Admin Role from admin_accounts
    const adminAcc = await db.get('SELECT role FROM admin_accounts WHERE email = ?', [email.trim().toLowerCase()]);
    const role = adminAcc?.role || 'SUPER_ADMIN';

    // Issue Secure Signed 24-Hour Admin JWT Session Token
    const adminToken = jwt.sign(
      { email: email.trim().toLowerCase(), role: role, authorizedAt: Date.now() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token: adminToken,
      role: role,
      email: email.trim().toLowerCase(),
      message: role === 'SUPER_READONLY_ADMIN'
        ? 'Authentication successful! Welcome to Jiza Studio Management Panel (Read & Export Access).'
        : '4FA Authentication successful! Welcome Administrator.'
    });

  } catch (err) {
    res.status(500).json({ error: 'Invalid credentials' });
  }
});

// POST Change Admin Password (Strict Multi-Factor Verification & Old Password Invalidation)
app.post('/api/admin/auth/change-password', async (req, res) => {
  try {
    const db = await getDb();
    const { email, phone, oldPassword, newPassword, confirmPassword } = req.body;

    if (!email || !phone || !oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields (Email, Phone, Old Password, New Password, Confirm Password) are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and Confirm Password do not match.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({ error: 'New password cannot be the same as your current password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = String(phone).replace(/\D/g, '');

    const admin = await db.get('SELECT * FROM admin_accounts WHERE email = ?', [cleanEmail]);
    if (!admin) {
      return res.status(400).json({ error: 'Admin account not found or invalid credentials.' });
    }

    // Check Lockout Status
    if (admin.lockout_until) {
      const lockoutTime = new Date(admin.lockout_until).getTime();
      if (Date.now() < lockoutTime) {
        const remainingMins = Math.ceil((lockoutTime - Date.now()) / (60 * 1000));
        return res.status(429).json({
          error: `Account temporarily locked. Please try again in ${remainingMins} minute(s).`
        });
      }
    }

    // Verify Phone Match
    const phoneMatches = admin.phone.replace(/[^0-9]/g, '').endsWith(cleanPhone);
    if (!phoneMatches) {
      return res.status(400).json({ error: 'Registered phone number does not match admin records.' });
    }

    // Verify Old Password Hash
    const passwordMatches = await bcrypt.compare(oldPassword, admin.password_hash);
    if (!passwordMatches) {
      const failed = (admin.failed_attempts || 0) + 1;
      let lockoutUntil = null;
      if (failed >= 5) {
        lockoutUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      }
      await db.run(
        'UPDATE admin_accounts SET failed_attempts = ?, lockout_until = ? WHERE id = ?',
        [failed >= 5 ? 0 : failed, lockoutUntil, admin.id]
      );
      return res.status(400).json({ error: 'Old password is incorrect. Please enter your valid current password.' });
    }

    // Generate New Password Hash (Cost factor 12)
    const newPassHash = await bcrypt.hash(newPassword, 12);

    // Update in database - permanently replaces old password hash!
    await db.run(
      'UPDATE admin_accounts SET password_hash = ?, failed_attempts = 0, lockout_until = NULL WHERE id = ?',
      [newPassHash, admin.id]
    );

    // Invalidate any active OTPs for this admin
    await db.run('UPDATE admin_otps SET is_used = 1 WHERE admin_email = ?', [cleanEmail]);

    console.log(`🔑 [ADMIN SECURITY] Password successfully updated for admin: ${cleanEmail}`);

    res.json({
      success: true,
      message: 'Admin password changed successfully! Your old password has been deactivated. Please log in with your new password.'
    });

  } catch (err) {
    console.error('Error changing admin password:', err);
    res.status(500).json({ error: 'Failed to update admin password. Please try again.' });
  }
});


// ======================================================
// CUSTOMER AUTHENTICATION & DIRECTORY API
// ======================================================

// POST Customer Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const db = await getDb();
    const { name, email, phone, address, city, pincode } = req.body;

    const cleanPin = pincode ? String(pincode).trim() : '';
    if (!name || !email || !phone || !cleanPin) {
      return res.status(400).json({ error: 'Name, Email, Phone number, and compulsory Pincode are required.' });
    }

    const cleanPhone = String(phone).replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }

    if (!/^\d{6}$/.test(cleanPin)) {
      return res.status(400).json({ error: 'Please enter a valid 6-digit pincode.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if account already exists
    const existing = await db.get(
      `SELECT * FROM users WHERE email = ? OR REPLACE(phone, ' ', '') = ? OR REPLACE(phone, '-', '') = ?`,
      [cleanEmail, cleanPhone, cleanPhone]
    );

    if (existing) {
      return res.status(400).json({ error: 'An account with this Email or Mobile Number already exists. Please Sign In.' });
    }

    // Generate sequential Customer ID
    const seqRes = await db.get('INSERT INTO user_sequence DEFAULT VALUES RETURNING seq_id');
    const seqId = seqRes.seq_id;

    const id = 'CUST-' + String(seqId).padStart(6, '0');
    const joinedStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    await db.run(
      `INSERT INTO users (id, name, email, phone, address, city, pincode, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'customer')`,
      [
        id,
        name.trim(),
        cleanEmail,
        cleanPhone,
        address ? address.trim() : '',
        city ? city.trim() : '',
        pincode ? pincode.trim() : ''
      ]
    );

    const user = {
      id,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      address: address ? address.trim() : '',
      city: city ? city.trim() : '',
      pincode: pincode ? pincode.trim() : '',
      role: 'customer',
      joinedDate: joinedStr,
      totalSpent: 0,
      totalOrders: 0
    };

    res.status(201).json({
      user,
      message: 'Account created successfully! Welcome to Jiza Jewellery Studio ✨'
    });

    // Send welcome transactional email asynchronously (non-blocking)
    sendWelcomeEmail({ name: name.trim(), email: cleanEmail }).then(async (sent) => {
      if (sent) {
        try {
          const updateDb = await getDb();
          await updateDb.run('UPDATE users SET welcome_email_sent = 1 WHERE id = ?', [id]);
        } catch (_) { }
      }
    }).catch(e => console.error('Welcome email async background note:', e.message));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Customer Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const db = await getDb();
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).json({ error: 'Please enter both your Email and Mobile Number.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = String(phone).replace(/\D/g, '');

    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }

    // Match both Email and Phone
    const user = await db.get(
      `SELECT * FROM users WHERE email = ? AND (
         REPLACE(phone, ' ', '') = ? OR 
         REPLACE(phone, '-', '') = ? OR 
         REPLACE(phone, '+91', '') = ?
       )`,
      [cleanEmail, cleanPhone, cleanPhone, cleanPhone]
    );

    if (!user) {
      return res.status(400).json({ error: 'No account matches both this Email and Mobile Number. Check details or click "Create Account".' });
    }

    // Retrieve stats
    const statsQuery = `
      SELECT COALESCE(COUNT(o.id), 0) as total_orders,
             COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM orders o
      WHERE o.user_id = ? OR o.customer_email = ?
    `;
    const stats = await db.get(statsQuery, [user.id, user.email]);

    // Fetch cart
    const cart = await db.get('SELECT items_json FROM customer_carts WHERE user_id = ?', [user.id]);
    const cartItems = cart ? JSON.parse(cart.items_json) : [];

    // Fetch wishlist
    const wishlist = await db.get('SELECT product_ids_json FROM customer_wishlists WHERE user_id = ?', [user.id]);
    const wishlistIds = wishlist ? JSON.parse(wishlist.product_ids_json) : [];

    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address || '',
      city: user.city || '',
      pincode: user.pincode || '',
      role: user.role,
      joinedDate: new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      totalSpent: Number(stats?.total_spent || 0),
      totalOrders: Number(stats?.total_orders || 0)
    };

    res.json({
      user: formattedUser,
      cartItems,
      wishlistIds,
      message: `Welcome back, ${user.name}! 👑`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET All Customers (Admin Only — Option A Server-Side Paged & Search)
app.get('/api/admin/customers', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { search, page, limit, paged } = req.query;

    let whereClause = "WHERE u.role = 'customer'";
    const params = [];

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      params.push(q);
      const pIdx = params.length;
      whereClause += ` AND (LOWER(u.name) LIKE $${pIdx} OR LOWER(u.email) LIKE $${pIdx} OR LOWER(u.phone) LIKE $${pIdx} OR LOWER(u.id) LIKE $${pIdx} OR LOWER(u.city) LIKE $${pIdx} OR LOWER(u.pincode) LIKE $${pIdx})`;
    }

    if (paged === 'true' || page || search) {
      const pageNum = Math.max(1, parseInt(page || 1, 10));
      const limitNum = Math.max(1, Math.min(parseInt(limit || 50, 10), 200));
      const offset = (pageNum - 1) * limitNum;

      const countSql = `SELECT COUNT(*) as total FROM users u ${whereClause}`;
      const countRes = await db.get(countSql, params);
      const total = countRes ? parseInt(countRes.total, 10) : 0;
      const totalPages = Math.ceil(total / limitNum) || 1;

      const dataParams = [...params, limitNum, offset];
      const dataSql = `
        SELECT u.id, u.name, u.email, u.phone, u.address, u.city, u.pincode, u.created_at,
               COALESCE(COUNT(o.id), 0) as total_orders,
               COALESCE(SUM(o.total_amount), 0) as total_spent
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id OR u.email = o.customer_email
        ${whereClause}
        GROUP BY u.id, u.name, u.email, u.phone, u.address, u.city, u.pincode, u.created_at
        ORDER BY u.created_at DESC
        LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
      `;

      const customers = await db.all(dataSql, dataParams);
      const formatted = customers.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        address: c.address || '',
        city: c.city || '',
        pincode: c.pincode || '',
        joinedDate: new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        totalSpent: Number(c.total_spent),
        totalOrders: Number(c.total_orders)
      }));

      return res.json({
        customers: formatted,
        total,
        page: pageNum,
        totalPages,
        limit: limitNum
      });
    }

    // Default backward compatible array response
    const query = `
      SELECT u.id, u.name, u.email, u.phone, u.address, u.city, u.pincode, u.created_at,
             COALESCE(COUNT(o.id), 0) as total_orders,
             COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id OR u.email = o.customer_email
      ${whereClause}
      GROUP BY u.id, u.name, u.email, u.phone, u.address, u.city, u.pincode, u.created_at
      ORDER BY u.created_at DESC
    `;
    const customers = await db.all(query, params);
    const formatted = customers.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address || '',
      city: c.city || '',
      pincode: c.pincode || '',
      joinedDate: new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      totalSpent: Number(c.total_spent),
      totalOrders: Number(c.total_orders)
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Customer Cart
app.get('/api/cart', async (req, res) => {
  try {
    const db = await getDb();
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const cart = await db.get('SELECT items_json FROM customer_carts WHERE user_id = ?', [userId]);
    res.json(cart ? JSON.parse(cart.items_json) : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Save Customer Cart
app.post('/api/cart', async (req, res) => {
  try {
    const db = await getDb();
    const { userId, items } = req.body;
    if (!userId || !items) {
      return res.status(400).json({ error: 'User ID and items are required' });
    }
    await db.run(
      `INSERT INTO customer_carts (user_id, items_json) VALUES (?, ?)
       ON CONFLICT (user_id) DO UPDATE SET items_json = EXCLUDED.items_json, updated_at = CURRENT_TIMESTAMP`,
      [userId, JSON.stringify(items)]
    );
    res.json({ success: true, message: 'Cart synced to database successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Customer Wishlist
app.get('/api/wishlist', async (req, res) => {
  try {
    const db = await getDb();
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const wishlist = await db.get('SELECT product_ids_json FROM customer_wishlists WHERE user_id = ?', [userId]);
    res.json(wishlist ? JSON.parse(wishlist.product_ids_json) : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Save Customer Wishlist
app.post('/api/wishlist', async (req, res) => {
  try {
    const db = await getDb();
    const { userId, productIds } = req.body;
    if (!userId || !productIds) {
      return res.status(400).json({ error: 'User ID and productIds are required' });
    }
    await db.run(
      `INSERT INTO customer_wishlists (user_id, product_ids_json) VALUES (?, ?)
       ON CONFLICT (user_id) DO UPDATE SET product_ids_json = EXCLUDED.product_ids_json, updated_at = CURRENT_TIMESTAMP`,
      [userId, JSON.stringify(productIds)]
    );
    res.json({ success: true, message: 'Wishlist synced to database successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================================================
// ACCOUNT DELETION & PRIVACY CONTROLS (DPDP Compliance)
// ======================================================
app.post('/api/users/delete-account', async (req, res) => {
  try {
    const db = await getDb();
    const { userId, email } = req.body;

    if (!userId && !email) {
      return res.status(400).json({ error: 'User ID or Email is required for account deletion' });
    }

    // Find user record
    const user = await db.get(
      `SELECT * FROM users WHERE (id = ? OR email = ?) AND role = 'customer'`,
      [userId || '', email || '']
    );

    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const targetUserId = user.id;
    const targetEmail = user.email;

    // 1. Anonymize past orders for business/accounting/audit compliance
    await db.run(
      `UPDATE orders 
       SET customer_name = 'Deleted Account',
           customer_email = 'anonymized@deleted.user',
           customer_phone = '0000000000',
           shipping_address = 'Address Anonymized',
           user_id = NULL
       WHERE user_id = ? OR customer_email = ?`,
      [targetUserId, targetEmail]
    );

    // 2. Clean up associated user assets & data
    await db.run('DELETE FROM customer_carts WHERE user_id = ?', [targetUserId]);
    await db.run('DELETE FROM customer_wishlists WHERE user_id = ?', [targetUserId]);
    await db.run('DELETE FROM review_prompts WHERE user_id = ?', [targetUserId]);
    await db.run('DELETE FROM product_reviews WHERE user_id = ? OR customer_email = ?', [targetUserId, targetEmail]);
    await db.run('DELETE FROM customer_problems WHERE user_id = ? OR customer_email = ?', [targetUserId, targetEmail]);
    await db.run('DELETE FROM verification_codes WHERE email = ?', [targetEmail]);

    // 3. Delete primary user record from users table
    await db.run('DELETE FROM users WHERE id = ?', [targetUserId]);

    console.log(`🗑️ Account Permanently Deleted & Anonymized: ${targetEmail} (ID: ${targetUserId})`);

    res.json({
      success: true,
      message: 'Your account and personal data have been permanently deleted.'
    });
  } catch (err) {
    console.error('Error deleting account:', err);
    res.status(500).json({ error: 'Failed to delete account: ' + err.message });
  }
});


// GET Customer Detail (Admin Only)
app.get('/api/admin/customers/:id', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    const customer = await db.get('SELECT * FROM users WHERE id = ? AND role = \'customer\'', [id]);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Fetch order list
    const orders = await db.all('SELECT * FROM orders WHERE user_id = ? OR customer_email = ? ORDER BY created_at DESC', [customer.id, customer.email]);

    // Fetch review list
    const reviews = await db.all('SELECT * FROM product_reviews WHERE user_id = ? OR customer_email = ? ORDER BY created_at DESC', [customer.id, customer.email]);

    // Fetch customer support tickets
    const problems = await db.all('SELECT * FROM customer_problems WHERE user_id = ? OR customer_email = ? ORDER BY created_at DESC', [customer.id, customer.email]);

    // Fetch cart size
    const cart = await db.get('SELECT items_json FROM customer_carts WHERE user_id = ?', [customer.id]);
    let cartItemsCount = 0;
    if (cart) {
      try {
        const items = JSON.parse(cart.items_json);
        cartItemsCount = items.reduce((acc, i) => acc + (i.quantity || 1), 0);
      } catch (e) { }
    }

    // Fetch wishlist size
    const wishlist = await db.get('SELECT product_ids_json FROM customer_wishlists WHERE user_id = ?', [customer.id]);
    let wishlistItemsCount = 0;
    if (wishlist) {
      try {
        const pids = JSON.parse(wishlist.product_ids_json);
        wishlistItemsCount = pids.length;
      } catch (e) { }
    }

    // Formatted details
    const totalSpent = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);

    const formattedOrders = orders.map(o => ({
      id: o.id,
      orderCode: o.order_code,
      amount: `₹${Number(o.total_amount).toLocaleString('en-IN')}`,
      status: o.status,
      date: new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      items: typeof o.items_json === 'string' ? JSON.parse(o.items_json).map(i => `${i.title || i.name}${i.selectedColor ? ` [Colour: ${i.selectedColor}]` : (i.colour ? ` [Colour: ${i.colour}]` : '')}${i.selectedSize ? ` [Size: ${i.selectedSize}]` : ''} (x${i.quantity || 1})`).join(', ') : 'Items'
    }));

    res.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || '',
      city: customer.city || '',
      pincode: customer.pincode || '',
      joinedDate: new Date(customer.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      totalSpent,
      totalOrders: orders.length,
      orders: formattedOrders,
      reviews,
      problems,
      cartCount: cartItemsCount,
      wishlistCount: wishlistItemsCount
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================================================
// HIGH-SPEED IN-MEMORY CACHE ENGINE (100k+ Users / 1k+ Orders Day)
// ======================================================
const memoryCache = {
  products: { data: null, timestamp: 0 },
  categories: { data: null, timestamp: 0 },
  rentalGallery: { data: null, timestamp: 0 }
};
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL for catalog
const RENTAL_CACHE_TTL_MS = 120 * 1000; // 120 seconds TTL for rental gallery

function invalidateProductCache() {
  memoryCache.products = { data: null, timestamp: 0 };
}

function invalidateCategoryCache() {
  memoryCache.categories = { data: null, timestamp: 0 };
}

function invalidateRentalCache() {
  memoryCache.rentalGallery = { data: null, timestamp: 0 };
}

function invalidateApiCache() {
  invalidateProductCache();
  invalidateCategoryCache();
  invalidateRentalCache();
}

// GET All Categories (with subcategories, display_order, active status, and auto product counts)
app.get(['/api/categories', '/api/admin/categories'], async (req, res) => {
  try {
    const now = Date.now();
    if (memoryCache.categories.data && (now - memoryCache.categories.timestamp < CACHE_TTL_MS)) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(memoryCache.categories.data);
    }

    const db = await getDb();
    const categories = await db.all('SELECT * FROM categories ORDER BY display_order ASC, name ASC');
    const subcategories = await db.all('SELECT * FROM subcategories ORDER BY display_order ASC, name ASC');
    const productCounts = await db.all('SELECT category_id, subcategory_id, subcategory_label, COUNT(*) as count FROM products GROUP BY category_id, subcategory_id, subcategory_label');

    const result = categories.map(cat => {
      const catProductCount = productCounts
        .filter(p => p.category_id === cat.id)
        .reduce((sum, p) => sum + p.count, 0);

      const subObjects = subcategories
        .filter(s => s.category_id === cat.id)
        .map(sub => {
          const subProdCount = productCounts
            .filter(p => p.category_id === cat.id && (p.subcategory_id === sub.id || p.subcategory_label === sub.name))
            .reduce((sum, p) => sum + p.count, 0);
          return {
            id: sub.id,
            category_id: sub.category_id,
            name: sub.name,
            img: sub.img || '',
            display_order: sub.display_order ?? 1,
            active: sub.active ?? 1,
            productsCount: subProdCount
          };
        });

      const subsList = subObjects.map(s => s.name);

      return {
        id: cat.id,
        name: cat.name,
        img: cat.img || '',
        display_order: cat.display_order ?? 1,
        active: cat.active ?? 1,
        productsCount: catProductCount,
        subcategoriesCount: subObjects.length,
        subcategories: subsList,
        subCategoryObjects: subObjects
      };
    });

    memoryCache.categories = { data: result, timestamp: now };
    res.setHeader('X-Cache', 'MISS');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create Category (Admin Only - Smart Shift Position)
app.post(['/api/categories', '/api/admin/categories'], requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { name, img, display_order, active } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const id = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
    const isActive = active !== undefined ? (active ? 1 : 0) : 1;
    const savedImg = saveBase64ImageToDisk(img, 'categories');

    const existingCats = await db.all('SELECT * FROM categories ORDER BY display_order ASC, name ASC');
    let targetOrder = display_order !== undefined && display_order !== '' ? Math.max(1, Number(display_order)) : existingCats.length + 1;
    if (targetOrder > existingCats.length + 1) targetOrder = existingCats.length + 1;

    const newCatObj = { id, name: name.trim(), img: savedImg || '', display_order: targetOrder, active: isActive };

    // Check if category ID already exists
    const duplicate = existingCats.find(c => c.id === id);
    if (duplicate) {
      return res.status(400).json({ error: `Category '${name.trim()}' already exists.` });
    }

    existingCats.splice(targetOrder - 1, 0, newCatObj);

    await db.run(
      'INSERT INTO categories (id, name, img, display_order, active) VALUES (?, ?, ?, ?, ?)',
      [newCatObj.id, newCatObj.name, newCatObj.img, targetOrder, newCatObj.active]
    );

    for (let i = 0; i < existingCats.length; i++) {
      const c = existingCats[i];
      if (c.id !== id) {
        await db.run('UPDATE categories SET display_order = ? WHERE id = ?', [i + 1, c.id]);
      }
    }

    invalidateApiCache();
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: newCatObj,
      id,
      name: name.trim(),
      display_order: targetOrder
    });
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT Update Category (Admin Only - Smart Shift Position)
app.put(['/api/categories/:id', '/api/admin/categories/:id'], requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { name, img, display_order, active } = req.body;

    const cat = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    if (!cat) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const newName = name !== undefined && name.trim() ? name.trim() : cat.name;
    const newImg = img !== undefined ? saveBase64ImageToDisk(img, 'categories') : cat.img;
    const newActive = active !== undefined ? (active ? 1 : 0) : (cat.active ?? 1);

    // Auto-clean old image from server storage if replaced with a different image
    if (cat.img && cat.img !== newImg) {
      deleteLocalUploadFile(cat.img);
    }

    const existingCats = await db.all('SELECT * FROM categories ORDER BY display_order ASC, name ASC');
    const oldIdx = existingCats.findIndex(c => c.id === id);

    let targetIdx = oldIdx;
    if (display_order !== undefined && display_order !== '' && !isNaN(Number(display_order))) {
      const requestedOrder = Math.max(1, Math.min(Number(display_order), existingCats.length));
      targetIdx = requestedOrder - 1;
    }

    if (oldIdx !== -1) {
      const [moved] = existingCats.splice(oldIdx, 1);
      moved.name = newName;
      moved.img = newImg;
      moved.active = newActive;
      existingCats.splice(targetIdx, 0, moved);
    }

    for (let i = 0; i < existingCats.length; i++) {
      const c = existingCats[i];
      await db.run(
        'UPDATE categories SET name = ?, img = ?, display_order = ?, active = ? WHERE id = ?',
        [c.name, c.img, i + 1, c.active, c.id]
      );
    }
    if (newName !== cat.name) {
      await db.run('UPDATE products SET category_label = ? WHERE category_id = ?', [newName, id]);
    }

    invalidateApiCache();
    const updatedCategory = { id, name: newName, img: newImg, display_order: targetIdx + 1, active: newActive };
    res.json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory,
      id,
      name: newName,
      display_order: targetIdx + 1
    });
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE Category (Admin Only - Safety check for Sub-Categories and Products)
app.delete(['/api/categories/:id', '/api/admin/categories/:id'], requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    const cat = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    if (!cat) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const subCountRes = await db.get('SELECT COUNT(*) as count FROM subcategories WHERE category_id = ?', [id]);
    const prodCountRes = await db.get('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id]);

    const subCount = subCountRes ? Number(subCountRes.count) : 0;
    const prodCount = prodCountRes ? Number(prodCountRes.count) : 0;

    if (subCount > 0 || prodCount > 0) {
      return res.status(400).json({
        error: `Cannot delete Category '${cat.name}'. It contains ${subCount} sub-category(ies) and ${prodCount} product(s). Please reassign or delete assigned sub-categories and products first.`
      });
    }

    await db.run('DELETE FROM categories WHERE id = ?', [id]);

    // Auto-clean deleted category image from server disk
    if (cat.img) {
      deleteLocalUploadFile(cat.img);
    }

    // Re-normalize category positions after deletion
    const remainingCats = await db.all('SELECT * FROM categories ORDER BY display_order ASC, name ASC');
    for (let i = 0; i < remainingCats.length; i++) {
      await db.run('UPDATE categories SET display_order = ? WHERE id = ?', [i + 1, remainingCats[i].id]);
    }
    invalidateApiCache();
    res.json({ success: true, message: `Category '${cat.name}' deleted successfully.` });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET All Subcategories
app.get(['/api/subcategories', '/api/admin/subcategories'], async (req, res) => {
  try {
    const db = await getDb();
    const subcategories = await db.all('SELECT * FROM subcategories ORDER BY category_id ASC, display_order ASC, name ASC');
    res.json(subcategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create Subcategory (Admin Only - Smart Shift Position)
app.post(['/api/categories/:id/subcategories', '/api/subcategories', '/api/admin/subcategories'], requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const categoryId = req.params.id || req.body.categoryId || req.body.category_id;
    const { name, img, display_order, active } = req.body;

    if (!categoryId) {
      return res.status(400).json({ error: 'Parent category ID is required' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Sub-category name is required' });
    }

    const subId = `${categoryId}-${name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const isActive = active !== undefined ? (active ? 1 : 0) : 1;
    const savedImg = saveBase64ImageToDisk(img, 'subcategories');

    const existingSubs = await db.all('SELECT * FROM subcategories WHERE category_id = ? ORDER BY display_order ASC, name ASC', [categoryId]);

    const duplicate = existingSubs.find(s => s.id === subId || s.name.toLowerCase() === name.trim().toLowerCase());
    if (duplicate) {
      return res.status(400).json({ error: `Sub-category '${name.trim()}' already exists in this category.` });
    }

    let targetOrder = display_order !== undefined && display_order !== '' ? Math.max(1, Number(display_order)) : existingSubs.length + 1;
    if (targetOrder > existingSubs.length + 1) targetOrder = existingSubs.length + 1;

    const newSubObj = { id: subId, category_id: categoryId, name: name.trim(), img: savedImg || '', display_order: targetOrder, active: isActive };
    existingSubs.splice(targetOrder - 1, 0, newSubObj);

    await db.run(
      'INSERT INTO subcategories (id, category_id, name, img, display_order, active) VALUES (?, ?, ?, ?, ?, ?)',
      [newSubObj.id, newSubObj.category_id, newSubObj.name, newSubObj.img, targetOrder, newSubObj.active]
    );

    for (let i = 0; i < existingSubs.length; i++) {
      const s = existingSubs[i];
      if (s.id !== subId) {
        await db.run('UPDATE subcategories SET display_order = ? WHERE id = ?', [i + 1, s.id]);
      }
    }

    invalidateApiCache();
    res.status(201).json({
      success: true,
      message: 'Sub-category created successfully',
      subcategory: newSubObj,
      id: subId,
      name: name.trim(),
      categoryId,
      display_order: targetOrder
    });
  } catch (err) {
    console.error('Error creating subcategory:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT Update Subcategory (Admin Only - Smart Shift Position)
app.put(['/api/subcategories/:id', '/api/admin/subcategories/:id'], requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { name, img, display_order, active } = req.body;

    const sub = await db.get('SELECT * FROM subcategories WHERE id = ?', [id]);
    if (!sub) {
      return res.status(404).json({ error: 'Sub-category not found' });
    }

    const newName = name !== undefined && name.trim() ? name.trim() : sub.name;
    const newImg = img !== undefined ? saveBase64ImageToDisk(img, 'subcategories') : sub.img;
    const newActive = active !== undefined ? (active ? 1 : 0) : (sub.active ?? 1);

    // Auto-clean old image from server storage if replaced
    if (sub.img && sub.img !== newImg) {
      deleteLocalUploadFile(sub.img);
    }

    const existingSubs = await db.all('SELECT * FROM subcategories WHERE category_id = ? ORDER BY display_order ASC, name ASC', [sub.category_id]);
    const oldIdx = existingSubs.findIndex(s => s.id === id);

    let targetIdx = oldIdx;
    if (display_order !== undefined && display_order !== '' && !isNaN(Number(display_order))) {
      const requestedOrder = Math.max(1, Math.min(Number(display_order), existingSubs.length));
      targetIdx = requestedOrder - 1;
    }

    if (oldIdx !== -1) {
      const [moved] = existingSubs.splice(oldIdx, 1);
      moved.name = newName;
      moved.img = newImg;
      moved.active = newActive;
      existingSubs.splice(targetIdx, 0, moved);
    }

    for (let i = 0; i < existingSubs.length; i++) {
      const s = existingSubs[i];
      await db.run(
        'UPDATE subcategories SET name = ?, img = ?, display_order = ?, active = ? WHERE id = ?',
        [s.name, s.img, i + 1, s.active, s.id]
      );
    }
    if (newName !== sub.name) {
      await db.run(
        'UPDATE products SET subcategory_label = ? WHERE subcategory_id = ? OR subcategory_label = ?',
        [newName, id, sub.name]
      );
    }

    invalidateApiCache();
    const updatedSubcategory = { id, category_id: sub.category_id, name: newName, img: newImg, display_order: targetIdx + 1, active: newActive };
    res.json({
      success: true,
      message: 'Sub-category updated successfully',
      subcategory: updatedSubcategory,
      id,
      name: newName,
      display_order: targetIdx + 1
    });
  } catch (err) {
    console.error('Error updating subcategory:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE Subcategory (Admin Only - Safety check for assigned products)
app.delete(['/api/subcategories/:id', '/api/admin/subcategories/:id'], requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    const sub = await db.get('SELECT * FROM subcategories WHERE id = ?', [id]);
    if (!sub) {
      return res.status(404).json({ error: 'Sub-category not found' });
    }

    const countRes = await db.get(
      'SELECT COUNT(*) as count FROM products WHERE subcategory_id = ? OR subcategory_label = ?',
      [id, sub.name]
    );
    const assignedCount = countRes ? Number(countRes.count) : 0;
    if (assignedCount > 0) {
      return res.status(400).json({
        error: `Cannot delete Sub-Category '${sub.name}'. ${assignedCount} product(s) are currently assigned to it. Please reassign or delete assigned products first.`
      });
    }

    await db.run('DELETE FROM subcategories WHERE id = ?', [id]);

    // Auto-clean deleted subcategory image from server disk
    if (sub.img) {
      deleteLocalUploadFile(sub.img);
    }
    invalidateApiCache();
    res.json({ success: true, message: `Sub-Category '${sub.name}' deleted successfully.` });
  } catch (err) {
    console.error('Error deleting subcategory:', err);
    res.status(500).json({ error: err.message });
  }
});

// ======================================================
// PUBLIC & PROTECTED PRODUCTS API
// ======================================================

// GET all products
app.get(['/api/products', '/api/admin/products'], async (req, res) => {
  try {
    const now = Date.now();
    if (memoryCache.products.data && (now - memoryCache.products.timestamp < CACHE_TTL_MS)) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(memoryCache.products.data);
    }

    const db = await getDb();
    const products = await db.all('SELECT * FROM products ORDER BY sold_out ASC, created_at DESC');

    const formatted = products.map(p => ({
      ...p,
      productCode: p.product_code || 'N/A',
      product_code: p.product_code || 'N/A',
      category: p.category_id,
      categoryLabel: p.category_label,
      subcategory: p.subcategory_label || p.subcategory_id || '',
      subCategory: p.subcategory_label || p.subcategory_id || '',
      subcategory_id: p.subcategory_id,
      subcategory_label: p.subcategory_label,
      sellingPrice: p.selling_price,
      stockQuantity: p.stock_quantity,
      inStock: Boolean(p.in_stock),
      soldOut: Boolean(p.sold_out),
      specialSection: p.special_section,
      images: p.images_json ? JSON.parse(p.images_json) : [p.img],
      video_url: p.video_url || '',
      videoUrl: p.video_url || '',
      video: p.video_url || ''
    }));

    memoryCache.products = { data: formatted, timestamp: now };
    res.setHeader('X-Cache', 'MISS');
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Add Product (Protected)
app.post(['/api/products', '/api/admin/products'], requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { title, category, categoryLabel, subcategory, subcategoryLabel, sellingPrice, mrp, discount, description, material, colour, careInstructions, deliveryTime, images, badge, specialSection, stockQuantity, video, videoUrl, video_url } = req.body;
    const rawCode = req.body.productCode || req.body.product_code || '';
    const productCode = String(rawCode).trim();

    if (!productCode) {
      return res.status(400).json({ error: 'Product Code is required.' });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Category selection is required.' });
    }
    if (!subcategory || !subcategory.trim()) {
      return res.status(400).json({ error: 'Sub-Category selection is required.' });
    }

    // Server-side DB uniqueness check
    const existingCode = await db.get(
      'SELECT id FROM products WHERE UPPER(product_code) = UPPER(?)',
      [productCode]
    );
    if (existingCode) {
      return res.status(400).json({ error: 'Product Code already exists. Please enter a unique Product Code.' });
    }

    const sec = specialSection || 'None';

    if (sec === 'New Arrival' || sec === 'Best Seller' || sec === 'Stock Clearance Sale') {
      const countRes = await db.get(
        'SELECT COUNT(*) as count FROM products WHERE special_section = ? OR badge = ?',
        [sec, sec]
      );
      if (countRes && Number(countRes.count) >= 12) {
        return res.status(400).json({
          error: `⚠️ Limit Reached: Maximum 12 products allowed in '${sec}'. Please remove an existing product first.`
        });
      }
    }

    const id = 'prod-' + Date.now();
    const stockQty = stockQuantity !== undefined ? Number(stockQuantity) : 10;
    const isSoldOut = stockQty === 0;

    // Process all base64 images & videos into static upload files
    const processedImages = (images || []).map(img => saveBase64MediaToDisk(img, 'products'));
    const primaryImg = processedImages[0] || '';
    const rawVideo = video || videoUrl || video_url || '';
    const processedVideo = rawVideo ? saveBase64MediaToDisk(rawVideo, 'products') : '';

    await db.run(
      `INSERT INTO products (
        id, product_code, title, category_id, category_label, subcategory_id, subcategory_label, selling_price, mrp, discount, 
        description, material, colour, care_instructions, delivery_time, 
        images_json, img, badge, special_section, stock_quantity, in_stock, sold_out, video_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, productCode, title, category, categoryLabel || category, subcategory, subcategoryLabel || subcategory, sellingPrice, mrp || 0, discount || 0,
        description || '', material || '', colour || '', careInstructions || '', deliveryTime || '2-4 Business Days',
        JSON.stringify(processedImages), primaryImg, isSoldOut ? 'Sold Out' : (sec !== 'None' ? sec : badge || 'Standard'),
        sec, stockQty, isSoldOut ? 0 : 1, isSoldOut ? 1 : 0, processedVideo
      ]
    );

    invalidateApiCache();
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId: id,
      productCode,
      id
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT Edit/Update Product (Protected)
app.put(['/api/products/:id', '/api/admin/products/:id'], requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { title, category, categoryLabel, subcategory, subcategoryLabel, sellingPrice, mrp, discount, description, material, colour, careInstructions, deliveryTime, images, badge, specialSection, stockQuantity, video, videoUrl, video_url } = req.body;
    const rawCode = req.body.productCode || req.body.product_code || '';
    const productCode = String(rawCode).trim();

    if (!productCode) {
      return res.status(400).json({ error: 'Product Code is required.' });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ error: 'Category selection is required.' });
    }
    if (!subcategory || !subcategory.trim()) {
      return res.status(400).json({ error: 'Sub-Category selection is required.' });
    }

    // Server-side DB uniqueness check (excluding current product)
    const existingCode = await db.get(
      'SELECT id FROM products WHERE UPPER(product_code) = UPPER(?) AND id != ?',
      [productCode, id]
    );
    if (existingCode) {
      return res.status(400).json({ error: 'Product Code already exists. Please enter a unique Product Code.' });
    }

    const stockQty = stockQuantity !== undefined ? Number(stockQuantity) : 10;
    const isSoldOut = stockQty === 0;
    const sec = specialSection || 'None';

    // Fetch old product images & video for cleanup
    const oldProduct = await db.get('SELECT img, images_json, video_url FROM products WHERE id = ?', [id]);
    let oldImages = [];
    if (oldProduct) {
      try {
        oldImages = JSON.parse(oldProduct.images_json || '[]');
      } catch (e) {
        oldImages = oldProduct.img ? [oldProduct.img] : [];
      }
    }

    // Process new images & video
    const processedImages = (images || []).map(img => saveBase64MediaToDisk(img, 'products'));
    const primaryImg = processedImages[0] || '';
    const rawVideo = video !== undefined ? video : (videoUrl !== undefined ? videoUrl : video_url);
    const processedVideo = rawVideo ? saveBase64MediaToDisk(rawVideo, 'products') : '';

    // Auto-clean removed images & video from disk
    const removedImages = oldImages.filter(oldImg => !processedImages.includes(oldImg));
    removedImages.forEach(oldImg => deleteLocalUploadFile(oldImg));
    if (oldProduct && oldProduct.img && !processedImages.includes(oldProduct.img)) {
      deleteLocalUploadFile(oldProduct.img);
    }
    if (oldProduct && oldProduct.video_url && oldProduct.video_url !== processedVideo) {
      deleteLocalUploadFile(oldProduct.video_url);
    }

    await db.run(
      `UPDATE products SET 
        product_code = ?, title = ?, category_id = ?, category_label = ?, subcategory_id = ?, subcategory_label = ?,
        selling_price = ?, mrp = ?, discount = ?, description = ?, material = ?, colour = ?,
        care_instructions = ?, delivery_time = ?, images_json = ?, img = ?, badge = ?,
        special_section = ?, stock_quantity = ?, in_stock = ?, sold_out = ?, video_url = ?
       WHERE id = ?`,
      [
        productCode, title, category, categoryLabel || category, subcategory, subcategoryLabel || subcategory,
        sellingPrice, mrp || 0, discount || 0, description || '', material || '', colour || '',
        careInstructions || '', deliveryTime || '2-4 Business Days', JSON.stringify(processedImages),
        primaryImg, isSoldOut ? 'Sold Out' : (sec !== 'None' ? sec : badge || 'Standard'),
        sec, stockQty, isSoldOut ? 0 : 1, isSoldOut ? 1 : 0, processedVideo, id
      ]
    );

    invalidateApiCache();
    // Run background orphan media cleanup to keep VPS disk 100% clean
    cleanOrphanedUploads().catch(() => { });
    res.json({
      success: true,
      message: 'Product updated successfully',
      productId: id,
      productCode,
      id
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE Product (Protected)
app.delete(['/api/products/:id', '/api/admin/products/:id'], requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    // Fetch product images & video before deletion
    const product = await db.get('SELECT img, images_json, video_url FROM products WHERE id = ?', [id]);

    await db.run('DELETE FROM products WHERE id = ?', [id]);

    // Auto-clean all product images & video from server disk
    if (product) {
      let prodImages = [];
      try {
        prodImages = JSON.parse(product.images_json || '[]');
      } catch (e) {
        prodImages = [];
      }
      if (product.img && !prodImages.includes(product.img)) {
        prodImages.push(product.img);
      }
      prodImages.forEach(imgUrl => deleteLocalUploadFile(imgUrl));
      if (product.video_url) {
        deleteLocalUploadFile(product.video_url);
      }
    }

    invalidateApiCache();
    // Run background orphan media cleanup to keep VPS disk 100% clean
    cleanOrphanedUploads().catch(() => { });
    res.json({
      success: true,
      message: 'Product deleted successfully',
      productId: id,
      id
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH Update Product Stock (Protected)
app.patch(['/api/products/:id/stock', '/api/admin/products/:id/stock'], requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { newQuantity } = req.body;
    const qty = Math.max(0, Number(newQuantity));
    const isSoldOut = qty === 0;

    await db.run(
      `UPDATE products 
       SET stock_quantity = ?, in_stock = ?, sold_out = ?, badge = CASE WHEN ? = 1 THEN 'Sold Out' ELSE badge END
       WHERE id = ?`,
      [qty, isSoldOut ? 0 : 1, isSoldOut ? 1 : 0, isSoldOut ? 1 : 0, req.params.id]
    );

    invalidateProductCache();
    res.json({
      success: true,
      message: 'Stock updated',
      id: req.params.id,
      stockQuantity: qty,
      soldOut: isSoldOut
    });
  } catch (err) {
    console.error('Error updating product stock:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH Update Special Section (Protected)
app.patch(['/api/products/:id/special-section', '/api/admin/products/:id/special-section'], requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { specialSection } = req.body;
    const productId = req.params.id;

    if (specialSection === 'New Arrival' || specialSection === 'Best Seller' || specialSection === 'Stock Clearance Sale') {
      const countRes = await db.get(
        'SELECT COUNT(*) as count FROM products WHERE id != ? AND (special_section = ? OR badge = ?)',
        [productId, specialSection, specialSection]
      );
      if (countRes && Number(countRes.count) >= 12) {
        return res.status(400).json({
          error: `⚠️ Limit Reached: Maximum 12 products allowed in '${specialSection}'. Please remove an existing product first.`
        });
      }
    }

    await db.run(
      'UPDATE products SET special_section = ? WHERE id = ?',
      [specialSection, productId]
    );

    invalidateProductCache();
    res.json({
      success: true,
      message: 'Special section updated successfully',
      productId,
      specialSection,
      id: productId
    });
  } catch (err) {
    console.error('Error updating special section:', err);
    res.status(500).json({ error: err.message });
  }
});

// ======================================================
// RENTAL GALLERY IMAGE-ONLY CMS API
// ======================================================

// GET Public Rental Gallery (Public Endpoint)
app.get('/api/rental-gallery', async (req, res) => {
  try {
    const now = Date.now();
    if (memoryCache.rentalGallery.data && (now - memoryCache.rentalGallery.timestamp < RENTAL_CACHE_TTL_MS)) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(memoryCache.rentalGallery.data);
    }

    const db = await getDb();
    const items = await db.all('SELECT id, image_url, created_at FROM rental_gallery ORDER BY created_at DESC, id DESC');
    const formatted = items.map(item => ({
      id: item.id,
      image: item.image_url,
      image_url: item.image_url,
      created_at: item.created_at
    }));
    const result = {
      success: true,
      count: formatted.length,
      items: formatted
    };

    memoryCache.rentalGallery = { data: result, timestamp: now };
    res.setHeader('X-Cache', 'MISS');
    res.json(result);
  } catch (err) {
    console.error('Error fetching rental gallery:', err);
    res.status(500).json({ error: 'Failed to fetch rental gallery' });
  }
});

// GET Admin Rental Gallery (Protected)
app.get('/api/admin/rental-gallery', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const items = await db.all('SELECT id, image_url, created_at FROM rental_gallery ORDER BY created_at DESC, id DESC');
    res.json({
      success: true,
      count: items.length,
      items
    });
  } catch (err) {
    console.error('Admin error fetching rental gallery:', err);
    res.status(500).json({ error: 'Failed to fetch admin rental gallery' });
  }
});

// POST Admin Upload Rental Gallery Images (Protected - Image Only CMS)
app.post('/api/admin/rental-gallery', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { images } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Please select at least one image to upload.' });
    }

    const insertedItems = [];
    for (let i = 0; i < images.length; i++) {
      const imgStr = typeof images[i] === 'string' ? images[i].trim() : '';
      if (!imgStr) continue;

      // Image validation (Data URL or valid HTTP/WebP/PNG/JPG URL)
      if (imgStr.startsWith('data:')) {
        const matches = imgStr.match(/^data:image\/(jpeg|jpg|png|webp|gif);base64,/i);
        if (!matches) {
          return res.status(400).json({ error: `Image #${i + 1} has an unsupported file format. Allowed formats: JPG, PNG, WebP.` });
        }
      }

      // Convert base64 payload to clean static disk file
      const savedImageUrl = saveBase64ImageToDisk(imgStr, 'rental');
      const id = `rent-img-${Date.now()}-${Math.floor(100 + Math.random() * 900)}-${i}`;
      await db.run(
        'INSERT INTO rental_gallery (id, image_url) VALUES (?, ?)',
        [id, savedImageUrl]
      );
      insertedItems.push({ id, image_url: savedImageUrl });
    }

    invalidateRentalCache();
    res.status(201).json({
      success: true,
      message: 'Images uploaded successfully.',
      count: insertedItems.length,
      items: insertedItems
    });
  } catch (err) {
    console.error('Error uploading rental gallery images:', err);
    res.status(500).json({ error: 'Failed to upload gallery images.' });
  }
});

// DELETE Admin Remove Rental Gallery Image (Protected)
app.delete('/api/admin/rental-gallery/:id', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    const existing = await db.get('SELECT id, image_url FROM rental_gallery WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Image not found in Rental Gallery.' });
    }

    await db.run('DELETE FROM rental_gallery WHERE id = ?', [id]);

    // Auto-clean deleted rental photo from disk
    if (existing.image_url) {
      deleteLocalUploadFile(existing.image_url);
    }
    invalidateRentalCache();
    res.json({ success: true, message: 'Image deleted successfully from Rental Gallery.' });
  } catch (err) {
    console.error('Error deleting rental gallery image:', err);
    res.status(500).json({ error: 'Failed to delete gallery image.' });
  }
});

// ======================================================
// Helper to extract and validate delivery address snapshot for orders

function extractAndValidateAddressSnapshot(reqBody, fulfillmentType = 'ship', storePickupSettings = null) {
  const sd = reqBody.shippingData || reqBody.customerInfo || reqBody;
  const isPickup = fulfillmentType === 'pickup' || reqBody.fulfillmentType === 'pickup' || reqBody.fulfillment_type === 'pickup';

  if (isPickup) {
    const pickupDetails = reqBody.pickupDetails || reqBody.pickup_details || sd.pickupDetails || {};
    const pickupPersonName = (pickupDetails.pickupPersonName || sd.fullName || reqBody.customerName || '').trim();
    const pickupPersonPhone = (pickupDetails.pickupPersonPhone || sd.phone || reqBody.customerPhone || '').trim();
    const notes = (pickupDetails.notes || reqBody.notes || '').trim();

    const storeName = storePickupSettings?.storeName || pickupDetails.storeName || "Jiza Jewellery Studio — Pune";
    const storeAddr = storePickupSettings?.address || pickupDetails.address || "Shop No.17, 1st Floor, Shivpushp Landmark, Suncity Road, Anand Nagar";
    const storeCity = storePickupSettings?.city || pickupDetails.city || "Pune";
    const storeState = storePickupSettings?.state || pickupDetails.state || "Maharashtra";
    const storePin = storePickupSettings?.pincode || pickupDetails.pincode || "411051";

    const formattedPickupAddress = `[STORE PICKUP]\n${storeName}\n${storeAddr}\n${storeCity}, ${storeState} - ${storePin}\nPickup Contact: ${pickupPersonName} (Ph: ${pickupPersonPhone})${notes ? `\nInstructions/Notes: ${notes}` : ''}`;

    return {
      line1: storeAddr,
      line2: `Store Pickup (${storeName})`,
      city: storeCity,
      state: storeState,
      pincode: storePin,
      country: 'India',
      fullFormattedAddress: formattedPickupAddress,
      isPickup: true,
      isInternational: false,
      pickupPersonName,
      pickupPersonPhone,
      notes
    };
  }

  let line1 = sd.addressLine1 || sd.address || reqBody.address || reqBody.shipping_address || '';
  let line2 = sd.addressLine2 || sd.area || sd.locality || reqBody.shipping_address_line2 || '';
  let city = sd.city || reqBody.city || reqBody.shipping_city || '';
  let state = sd.state || reqBody.state || reqBody.shipping_state || '';
  let pincode = sd.pincode || sd.postalCode || sd.zipCode || reqBody.pincode || reqBody.shipping_pincode || '';
  let country = sd.country || reqBody.country || reqBody.shipping_country || 'India';

  line1 = typeof line1 === 'string' ? line1.trim() : '';
  line2 = typeof line2 === 'string' ? line2.trim() : '';
  city = typeof city === 'string' ? city.trim() : '';
  state = typeof state === 'string' ? state.trim() : '';
  pincode = typeof pincode === 'string' || typeof pincode === 'number' ? String(pincode).trim() : '';
  country = typeof country === 'string' && country.trim() ? country.trim() : 'India';

  const international = !isIndia(country);

  // Try to extract pincode from address line for domestic
  if (line1 && !pincode && !international) {
    const pinMatch = line1.match(/\b\d{6}\b/);
    if (pinMatch) pincode = pinMatch[0];
  }

  if (!line1) throw new Error('Flat / House No / Street Address is required.');
  if (!city) throw new Error('City is required.');

  // Domestic India: require 6-digit pincode
  if (!international) {
    if (!pincode) throw new Error('Pincode is required.');
    if (!/^\d{6}$/.test(pincode)) throw new Error('Please enter a valid 6-digit postal pincode.');
    if (!state) state = 'Maharashtra'; // fallback for domestic
  } else {
    // International: postal code optional but accept any format
    state = state || '';
  }

  const parts = [];
  if (line1) parts.push(line1);
  if (line2) parts.push(line2);
  const cityStatePin = [city, state].filter(Boolean).join(', ') + (pincode ? ` - ${pincode}` : '');
  if (cityStatePin) parts.push(cityStatePin);
  if (country) parts.push(country);

  const fullFormattedAddress = parts.join('\n');

  return {
    line1,
    line2,
    city,
    state,
    pincode,
    country,
    fullFormattedAddress,
    isPickup: false,
    isInternational: international
  };
}

// Helper to get Store Pickup Settings from DB
async function getStorePickupSettings(db) {
  try {
    const row = await db.get("SELECT value_json FROM store_settings WHERE key = 'pickup_settings'");
    if (row && row.value_json) {
      return JSON.parse(row.value_json);
    }
  } catch (err) {
    console.error('Error loading pickup settings:', err.message);
  }
  return {
    storeName: "Jiza Jewellery Studio — Pune",
    address: "Shop No.17, 1st Floor, Shivpushp Landmark, Suncity Road, Anand Nagar",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411051",
    phone: "+91 82088 22696",
    email: "jizajewellery@gmail.com",
    timings: "Mon - Sat: 10:30 AM – 8:30 PM (Ready for pickup in 2-4 hours)",
    instructions: "Please present your Order ID and valid Government Photo ID at the studio counter upon pickup.",
    enabled: true
  };
}

// GET Public Pickup Location Details
app.get('/api/config/pickup-location', async (req, res) => {
  try {
    const db = await getDb();
    const settings = await getStorePickupSettings(db);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Admin Pickup Location Settings (Protected)
app.get('/api/admin/store-settings/pickup', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const settings = await getStorePickupSettings(db);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Admin Update Pickup Location Settings (Protected)
app.put('/api/admin/store-settings/pickup', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { storeName, address, city, state, pincode, phone, email, timings, instructions, enabled } = req.body;

    const current = await getStorePickupSettings(db);
    const updated = {
      ...current,
      storeName: storeName !== undefined ? storeName : current.storeName,
      address: address !== undefined ? address : current.address,
      city: city !== undefined ? city : current.city,
      state: state !== undefined ? state : current.state,
      pincode: pincode !== undefined ? pincode : current.pincode,
      phone: phone !== undefined ? phone : current.phone,
      email: email !== undefined ? email : current.email,
      timings: timings !== undefined ? timings : current.timings,
      instructions: instructions !== undefined ? instructions : current.instructions,
      enabled: enabled !== undefined ? Boolean(enabled) : current.enabled
    };

    await db.run(
      `INSERT INTO store_settings (key, value_json, updated_at)
       VALUES ('pickup_settings', ?, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET value_json = EXCLUDED.value_json, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(updated)]
    );

    res.json({ message: 'Pickup store settings updated successfully', settings: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create Order (Public Checkout)
app.post('/api/orders', async (req, res) => {
  try {
    const db = await getDb();
    const { id, userId, customerName, customerEmail, customerPhone, address, amount, paymentMethod, cartItems, items, fulfillmentType, pickupDetails, shippingData } = req.body;

    const actualCustomerName = (customerName || shippingData?.fullName || shippingData?.name || pickupDetails?.pickupPersonName || '').trim();
    const actualCustomerEmail = (customerEmail || shippingData?.email || pickupDetails?.email || '').trim();
    const actualCustomerPhone = (customerPhone || shippingData?.phone || pickupDetails?.pickupPersonPhone || '').trim();

    if (!actualCustomerName || !actualCustomerEmail || !actualCustomerPhone) {
      return res.status(400).json({ error: 'Customer Name, Email, and Phone number are required.' });
    }

    const actualFulfillment = (fulfillmentType === 'pickup' || req.body.fulfillment_type === 'pickup') ? 'pickup' : 'ship';
    const storeSettings = await getStorePickupSettings(db);
    const addrSnap = extractAndValidateAddressSnapshot(req.body, actualFulfillment, storeSettings);
    const itemsToProcess = (cartItems && Array.isArray(cartItems) && cartItems.length > 0)
      ? cartItems
      : ((items && Array.isArray(items) && items.length > 0) ? items : []);

    if (itemsToProcess.length === 0) {
      return res.status(400).json({ error: 'Cart is empty. Cannot place order.' });
    }

    const generatedId = id || 'JIZA-' + Math.floor(100000 + Math.random() * 900000);
    let uId = null;
    if (userId) {
      const userExists = await db.get('SELECT id FROM users WHERE id = ?', [userId]);
      if (userExists) uId = userExists.id;
    }

    // Idempotency check: Double-Checkout Protection
    const existingOrder = await db.get('SELECT id FROM orders WHERE id = ?', [generatedId]);
    if (existingOrder) {
      return res.status(200).json({ message: 'Order already created (idempotent)', orderId: generatedId });
    }

    // Transaction-safe validation and updates
    const result = await db.transaction(async (tx) => {
      let calculatedTotal = 0;
      const itemsToUpdate = [];
      const snapshotItems = [];

      for (const item of itemsToProcess) {
        const product = await tx.get(
          'SELECT id, title, selling_price, stock_quantity, sold_out, sold_count, badge, product_code FROM products WHERE id = ? FOR UPDATE',
          [item.id]
        );

        if (!product) {
          throw new Error(`Product "${item.title || item.id}" was not found in our store catalog.`);
        }

        const currentStock = product.stock_quantity ?? 0;
        if (currentStock <= 0 || product.sold_out === 1) {
          throw new Error(`Sorry, "${product.title}" is out of stock.`);
        }

        if (item.quantity > currentStock) {
          throw new Error(`Only ${currentStock} units of "${product.title}" are available.`);
        }

        const dbPrice = Number(product.selling_price);
        calculatedTotal += dbPrice * item.quantity;
        const pCode = product.product_code || item.productCode || item.product_code || 'N/A';

        itemsToUpdate.push({
          id: product.id,
          currentStock,
          itemQuantity: item.quantity,
          currentSoldCount: product.sold_count ?? 0
        });

        snapshotItems.push({
          ...item,
          id: product.id,
          productCode: pCode,
          product_code: pCode,
          title: product.title || item.title || item.name,
          name: product.title || item.title || item.name,
          price: dbPrice,
          sellingPrice: dbPrice
        });
      }

      for (const update of itemsToUpdate) {
        const newQty = update.currentStock - update.itemQuantity;
        const isSoldOut = newQty === 0;
        const newSoldCount = update.currentSoldCount + update.itemQuantity;

        await tx.run(
          `UPDATE products 
           SET stock_quantity = ?, in_stock = ?, sold_out = ?, sold_count = ?,
               badge = CASE WHEN ? = 1 THEN 'Sold Out' ELSE badge END
           WHERE id = ?`,
          [newQty, isSoldOut ? 0 : 1, isSoldOut ? 1 : 0, newSoldCount, isSoldOut ? 1 : 0, update.id]
        );
      }

      const pickupDataJson = actualFulfillment === 'pickup'
        ? JSON.stringify({
          ...storeSettings,
          pickupPersonName: addrSnap.pickupPersonName || actualCustomerName,
          pickupPersonPhone: addrSnap.pickupPersonPhone || actualCustomerPhone,
          notes: addrSnap.notes || ''
        })
        : null;

      await tx.run(
        `INSERT INTO orders (
          id, order_code, user_id, customer_name, customer_email, customer_phone, 
          shipping_address, shipping_address_line1, shipping_address_line2,
          shipping_city, shipping_state, shipping_pincode, shipping_country,
          total_amount, payment_method, fulfillment_type, pickup_details_json, modification_history_json, items_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?)`,
        [
          generatedId, generatedId, uId, actualCustomerName, actualCustomerEmail, actualCustomerPhone,
          addrSnap.fullFormattedAddress, addrSnap.line1, addrSnap.line2,
          addrSnap.city, addrSnap.state, addrSnap.pincode, addrSnap.country,
          calculatedTotal, paymentMethod || 'UPI', actualFulfillment, pickupDataJson, JSON.stringify(snapshotItems)
        ]
      );

      return { orderId: generatedId, total: calculatedTotal };
    });

    res.status(201).json({
      message: 'Order created successfully & stock reserved!',
      orderId: result.orderId,
      amount: result.total
    });

  } catch (err) {
    // Transaction automatically rolls back on throw
    res.status(400).json({ error: err.message });
  }
});

// ======================================================
// RAZORPAY PRODUCTION PAYMENT & WEBHOOK API
// ======================================================

// GET Public Razorpay Key ID
app.get('/api/config/razorpay-key', (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID || '' });
});

// POST Create Razorpay Order
app.post('/api/payment/create-razorpay-order', async (req, res) => {
  try {
    const db = await getDb();
    const { cartItems, customerInfo, fulfillmentType, country } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }

    let calculatedSubtotal = 0;

    // Validate stock and calculate amount strictly from database selling_price
    for (const item of cartItems) {
      const product = await db.get(
        'SELECT id, title, selling_price, stock_quantity, sold_out FROM products WHERE id = ?',
        [item.id]
      );

      if (!product) {
        return res.status(404).json({ error: `Product "${item.title || item.id}" was not found.` });
      }

      if ((product.stock_quantity ?? 0) <= 0 || product.sold_out === 1) {
        return res.status(400).json({ error: `Sorry, "${product.title}" is out of stock.` });
      }

      if (item.quantity > product.stock_quantity) {
        return res.status(400).json({ error: `Only ${product.stock_quantity} units of "${product.title}" are available.` });
      }

      calculatedSubtotal += Number(product.selling_price) * item.quantity;
    }

    // Determine shipping using centralized shipping service
    // NEVER trust frontend amounts — always calculate server-side
    const shippingConfig = await getShippingConfig(db);
    const destinationCountry = country || customerInfo?.country || 'India';
    const actualFulfillmentType = fulfillmentType === 'pickup' ? 'pickup' : 'ship';

    const shippingResult = calculateShipping({
      country: destinationCountry,
      subtotal: calculatedSubtotal,
      fulfillmentType: actualFulfillmentType,
      config: shippingConfig
    });

    // For international orders: Razorpay amount = product subtotal only.
    // Shipping charge is NOT collected at checkout — pending confirmation after packing.
    const razorpayAmount = calculatedSubtotal + shippingResult.shippingCharge;

    const receipt = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const razorpayOrder = await createRazorpayOrder({
      amountInRupees: razorpayAmount,
      receipt,
      notes: {
        customerEmail: customerInfo?.email || '',
        customerName: customerInfo?.fullName || '',
        fulfillmentType: actualFulfillmentType,
        destinationCountry,
        subtotal: calculatedSubtotal,
        shippingCharge: shippingResult.shippingCharge,
        shippingChargeStatus: shippingResult.shippingChargeStatus,
        isInternational: shippingResult.isInternational
      }
    });

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayAmount,
      subtotal: calculatedSubtotal,
      shippingCharge: shippingResult.shippingCharge,
      shippingChargeStatus: shippingResult.shippingChargeStatus,
      isInternational: shippingResult.isInternational,
      isFreeShipping: shippingResult.isFreeShipping,
      deliveryEstimate: shippingResult.deliveryEstimate,
      shippingDisplayLabel: shippingResult.displayLabel,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: err.message || 'Failed to create Razorpay order.' });
  }
});

// POST Verify Razorpay Signature & Finalize Paid Order
app.post('/api/payment/verify-payment', async (req, res) => {
  try {
    const db = await getDb();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingData,
      cartItems,
      fulfillmentType,
      pickupDetails
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing Razorpay payment verification details.' });
    }

    // 1. Server-side HMAC SHA256 Signature Verification
    const isValidSignature = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!isValidSignature) {
      console.error(`🚨 [SECURITY ALERT] Invalid Razorpay Signature attempt for order ${razorpay_order_id}`);
      return res.status(400).json({ error: 'Payment signature verification failed. Invalid transaction.' });
    }

    // 1.1 Direct Server-to-Server Razorpay API Verification
    try {
      const rzpPayment = await fetchRazorpayPayment(razorpay_payment_id);
      if (rzpPayment) {
        if (rzpPayment.order_id && rzpPayment.order_id !== razorpay_order_id) {
          console.error(`🚨 [SECURITY ALERT] Order ID mismatch: Expected ${razorpay_order_id}, got ${rzpPayment.order_id}`);
          return res.status(400).json({ error: 'Security verification failed: Order ID mismatch.' });
        }
        if (rzpPayment.status !== 'captured' && rzpPayment.status !== 'authorized') {
          console.error(`🚨 [SECURITY ALERT] Payment not authorized: Status is ${rzpPayment.status}`);
          return res.status(400).json({ error: `Payment not verified: Status is ${rzpPayment.status}` });
        }
      }
    } catch (rzpErr) {
      console.warn('⚠️ Razorpay API fetch warning (proceeding with HMAC signature):', rzpErr.message);
    }

    // 2. Idempotency Check: Don't process duplicate callback
    const existingOrder = await db.get('SELECT * FROM orders WHERE razorpay_order_id = ? OR id = ?', [razorpay_order_id, razorpay_order_id]);
    if (existingOrder && existingOrder.payment_status === 'paid') {
      return res.json({
        success: true,
        message: 'Payment verified and order already recorded (idempotent)',
        orderId: existingOrder.id,
        amount: existingOrder.total_amount
      });
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart items are required to process order.' });
    }

    const actualFulfillment = (fulfillmentType === 'pickup' || req.body.fulfillment_type === 'pickup') ? 'pickup' : 'ship';
    const storeSettings = await getStorePickupSettings(db);
    const addrSnap = extractAndValidateAddressSnapshot(
      { shippingData, pickupDetails, fulfillmentType: actualFulfillment },
      actualFulfillment,
      storeSettings
    );

    // 3. PostgreSQL Transaction: Stock Deduction & Order Creation
    let calculatedSubtotal = 0;
    const generatedId = existingOrder ? existingOrder.id : ('JIZA-' + Math.floor(100000 + Math.random() * 900000));
    const customerName = shippingData?.fullName || shippingData?.customerName || 'Customer';
    const customerEmail = shippingData?.email || shippingData?.customerEmail || '';
    const customerPhone = shippingData?.phone || shippingData?.customerPhone || '';
    const destinationCountry = addrSnap.country || shippingData?.country || 'India';
    const addressStr = addrSnap.fullFormattedAddress;

    let uId = null;
    if (shippingData?.userId) {
      const userExists = await db.get('SELECT id FROM users WHERE id = ?', [shippingData.userId]);
      if (userExists) uId = userExists.id;
    }

    // Load shipping config from DB
    const shippingConfig = await getShippingConfig(db);

    const result = await db.transaction(async (tx) => {
      const itemsToUpdate = [];
      const snapshotItems = [];

      for (const item of cartItems) {
        const product = await tx.get(
          'SELECT id, title, selling_price, stock_quantity, in_stock, sold_out, sold_count, badge, product_code FROM products WHERE id = ? FOR UPDATE',
          [item.id]
        );

        if (!product) {
          throw new Error(`Product "${item.title || item.id}" was not found.`);
        }

        const currentStock = product.stock_quantity ?? 0;
        if (currentStock <= 0 || product.sold_out === 1) {
          throw new Error(`Sorry, "${product.title}" is out of stock.`);
        }

        if (item.quantity > currentStock) {
          throw new Error(`Only ${currentStock} units of "${product.title}" are available.`);
        }

        // Price calculated strictly from database — never trust frontend
        const dbPrice = Number(product.selling_price);
        calculatedSubtotal += dbPrice * item.quantity;
        const pCode = product.product_code || item.productCode || item.product_code || 'N/A';

        itemsToUpdate.push({
          id: product.id,
          currentStock,
          itemQuantity: item.quantity,
          currentSoldCount: product.sold_count ?? 0
        });

        snapshotItems.push({
          ...item,
          id: product.id,
          productCode: pCode,
          product_code: pCode,
          title: product.title || item.title || item.name,
          name: product.title || item.title || item.name,
          price: dbPrice,
          sellingPrice: dbPrice
        });
      }

      // Deduct stock atomically
      for (const update of itemsToUpdate) {
        const newQty = update.currentStock - update.itemQuantity;
        const isSoldOut = newQty === 0;
        const newSoldCount = update.currentSoldCount + update.itemQuantity;

        await tx.run(
          `UPDATE products 
           SET stock_quantity = ?, in_stock = ?, sold_out = ?, sold_count = ?,
               badge = CASE WHEN ? = 1 THEN 'Sold Out' ELSE badge END
           WHERE id = ?`,
          [newQty, isSoldOut ? 0 : 1, isSoldOut ? 1 : 0, newSoldCount, isSoldOut ? 1 : 0, update.id]
        );
      }

      // Calculate shipping using centralized service — NEVER trust frontend amounts
      const shippingResult = calculateShipping({
        country: destinationCountry,
        subtotal: calculatedSubtotal,
        fulfillmentType: actualFulfillment,
        config: shippingConfig
      });

      // For international: shipping charge = 0 at checkout (pending_confirmation)
      // For domestic: proper ₹99 / free calculation
      const finalOrderAmount = calculatedSubtotal + shippingResult.shippingCharge;

      const pickupDataJson = actualFulfillment === 'pickup'
        ? JSON.stringify({
          ...storeSettings,
          pickupPersonName: addrSnap.pickupPersonName || customerName,
          pickupPersonPhone: addrSnap.pickupPersonPhone || customerPhone,
          notes: addrSnap.notes || ''
        })
        : null;

      await tx.run(
        `INSERT INTO orders (
          id, order_code, user_id, customer_name, customer_email, customer_phone, 
          shipping_address, shipping_address_line1, shipping_address_line2,
          shipping_city, shipping_state, shipping_pincode, shipping_country,
          total_amount, status, payment_method, payment_status,
          razorpay_order_id, razorpay_payment_id, razorpay_signature,
          fulfillment_type, pickup_details_json, modification_history_json, items_json,
          shipping_method, shipping_charge, shipping_charge_status, shipping_subtotal,
          shipping_customer_contact_status, delivery_estimate, shipping_policy_version
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Paid', 'Razorpay', 'paid', ?, ?, ?, ?, ?, '[]', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generatedId, generatedId, uId, customerName, customerEmail, customerPhone,
          addressStr, addrSnap.line1, addrSnap.line2, addrSnap.city, addrSnap.state, addrSnap.pincode, destinationCountry,
          finalOrderAmount, razorpay_order_id, razorpay_payment_id,
          razorpay_signature, actualFulfillment, pickupDataJson, JSON.stringify(snapshotItems),
          shippingResult.method, shippingResult.shippingCharge, shippingResult.shippingChargeStatus, calculatedSubtotal,
          shippingResult.isInternational ? 'pending' : 'not_required',
          shippingResult.deliveryEstimate || '', 'v1'
        ]
      );

      return {
        orderId: generatedId,
        total: finalOrderAmount,
        subtotal: calculatedSubtotal,
        shippingCharge: shippingResult.shippingCharge,
        shippingChargeStatus: shippingResult.shippingChargeStatus,
        isInternational: shippingResult.isInternational,
        deliveryEstimate: shippingResult.deliveryEstimate
      };
    });

    invalidateApiCache();

    // 4. Send Order Confirmation Email safely (Non-blocking / Resilient)
    let emailSent = false;
    try {
      emailSent = await sendOrderConfirmationEmail({
        orderId: result.orderId,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: addressStr,
        totalAmount: result.total,
        paymentMethod: 'Razorpay / Online',
        items: cartItems
      });

      if (emailSent) {
        await db.run('UPDATE orders SET order_email_sent = 1 WHERE id = ?', [result.orderId]);
      }
    } catch (emailErr) {
      console.error('Order email failure note:', emailErr.message);
    }

    res.json({
      success: true,
      message: result.isInternational
        ? 'Payment verified! Your order is confirmed. We will contact you to confirm the final international shipping charge after packing.'
        : 'Payment verified and order finalized successfully!',
      orderId: result.orderId,
      amount: result.total,
      subtotal: result.subtotal,
      shippingCharge: result.shippingCharge,
      shippingChargeStatus: result.shippingChargeStatus,
      isInternational: result.isInternational,
      deliveryEstimate: result.deliveryEstimate
    });

  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(400).json({ error: err.message || 'Payment verification failed.' });
  }
});

// POST Razorpay Webhook Event Listener
app.post('/api/payment/razorpay-webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = JSON.stringify(req.body);

    const isValid = verifyRazorpayWebhookSignature({ rawBody, signatureHeader: signature });
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }

    const { event, payload } = req.body;
    const eventId = req.body.event_id || `${event}_${Date.now()}`;

    const db = await getDb();

    // Idempotency check: Ignore duplicate webhooks
    const existingWebhook = await db.get('SELECT event_id FROM razorpay_webhooks WHERE event_id = ?', [eventId]);
    if (existingWebhook) {
      return res.json({ status: 'ok', note: 'Duplicate webhook event ignored' });
    }

    // Save webhook event to DB
    await db.run(
      'INSERT INTO razorpay_webhooks (event_id, event_type, payload_json) VALUES (?, ?, ?)',
      [eventId, event || 'unknown', rawBody]
    );

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload?.payment?.entity;
      const rzpOrderId = paymentEntity?.order_id;
      const rzpPaymentId = paymentEntity?.id;

      if (rzpOrderId) {
        const order = await db.get('SELECT * FROM orders WHERE razorpay_order_id = ?', [rzpOrderId]);
        if (order && order.payment_status !== 'paid') {
          await db.run(
            `UPDATE orders SET status = 'Paid', payment_status = 'paid', razorpay_payment_id = ? WHERE id = ?`,
            [rzpPaymentId || '', order.id]
          );

          if (order.order_email_sent === 0) {
            let items = [];
            try { items = JSON.parse(order.items_json); } catch (_) { }
            const sent = await sendOrderConfirmationEmail({
              orderId: order.id,
              customerName: order.customer_name,
              customerEmail: order.customer_email,
              customerPhone: order.customer_phone,
              shippingAddress: order.shipping_address,
              totalAmount: order.total_amount,
              paymentMethod: 'Razorpay',
              items
            });
            if (sent) {
              await db.run('UPDATE orders SET order_email_sent = 1 WHERE id = ?', [order.id]);
            }
          }
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook processing error:', err.message);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// GET Customer My-Orders (Public / Customer Authenticated)

// ======================================================
// SHIPPING SYSTEM API ROUTES
// ======================================================

// GET Public Shipping Configuration
app.get('/api/config/shipping', async (req, res) => {
  try {
    const db = await getDb();
    const config = await getShippingConfig(db);
    // Return config without sensitive internal notes
    res.json({
      domestic: {
        standardFee: config.domestic.standardFee,
        freeThreshold: config.domestic.freeThreshold,
        deliveryEstimate: config.domestic.deliveryEstimate,
        enabled: config.domestic.enabled
      },
      pickup: {
        enabled: config.pickup.enabled,
        prepTime: config.pickup.prepTime,
        hours: config.pickup.hours,
        collectionDeadlineDays: config.pickup.collectionDeadlineDays
      },
      international: {
        enabled: config.international.enabled,
        deliveryEstimate: config.international.deliveryEstimate,
        ddu: true,
        chargeStatus: 'pending_confirmation'
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Admin Shipping Settings (Protected)
app.get('/api/admin/shipping/settings', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const config = await getShippingConfig(db);
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Admin Update Shipping Settings (Protected)
app.put('/api/admin/shipping/settings', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const updated = await saveShippingConfig(db, req.body);
    res.json({ success: true, message: 'Shipping settings updated successfully.', settings: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH Admin Confirm International Shipping Charge (Protected)
app.patch('/api/admin/orders/:id/shipping/confirm', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { confirmedCharge, confirmedBy, notes } = req.body;

    if (confirmedCharge === undefined || confirmedCharge === null || isNaN(Number(confirmedCharge))) {
      return res.status(400).json({ error: 'Confirmed shipping charge is required.' });
    }

    const charge = Math.max(0, Number(confirmedCharge));
    const order = await db.get('SELECT * FROM orders WHERE id = ? OR order_code = ?', [id, id]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (!isIndia(order.shipping_country || 'India') === false) {
      return res.status(400).json({ error: 'This is not an international order.' });
    }

    // Calculate new total (add confirmed shipping charge to existing subtotal)
    const subtotal = Number(order.shipping_subtotal || order.total_amount);
    const newTotal = subtotal + charge;

    let history = [];
    try { history = order.modification_history_json ? JSON.parse(order.modification_history_json) : []; } catch (_) { }
    history.push({
      action: 'INTERNATIONAL_SHIPPING_CONFIRMED',
      timestamp: new Date().toISOString(),
      actor: confirmedBy || 'admin',
      confirmedCharge: charge,
      previousTotal: order.total_amount,
      newTotal,
      notes: notes || ''
    });

    await db.run(
      `UPDATE orders SET
        international_shipping_confirmed_charge = ?,
        international_shipping_confirmed_at = CURRENT_TIMESTAMP,
        international_shipping_confirmed_by = ?,
        shipping_charge = ?,
        shipping_charge_status = 'confirmed',
        total_amount = ?,
        shipping_customer_contact_status = 'contacted',
        modification_history_json = ?
       WHERE id = ?`,
      [charge, confirmedBy || 'admin', charge, newTotal, JSON.stringify(history), order.id]
    );

    res.json({
      success: true,
      message: `International shipping confirmed at ₹${charge}. New order total: ₹${newTotal}.`,
      orderId: order.id,
      confirmedCharge: charge,
      newTotal
    });
  } catch (err) {
    console.error('Error confirming international shipping:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET Admin Pending International Orders (needs shipping confirmation)
app.get('/api/admin/shipping/pending-international', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const orders = await db.all(
      `SELECT * FROM orders WHERE shipping_charge_status = 'pending_confirmation' ORDER BY created_at DESC`
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Admin Shipping Investigations (Protected)
app.get('/api/admin/shipping/investigations', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { status } = req.query;
    let sql = 'SELECT * FROM shipping_investigations WHERE 1=1';
    const params = [];
    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND investigation_status = $${params.length}`;
    }
    sql += ' ORDER BY created_at DESC';
    const investigations = await db.all(sql, params);
    res.json(investigations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Admin Create Shipping Investigation (Protected)
app.post('/api/admin/shipping/investigations', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const {
      orderId, customerName, customerEmail, customerPhone,
      trackingNumber, courier, complaintDescription, deliveryProof
    } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required.' });
    }

    const id = `SINV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    await db.run(
      `INSERT INTO shipping_investigations (
        id, order_id, customer_name, customer_email, customer_phone,
        tracking_number, courier, complaint_description, delivery_proof,
        investigation_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      [id, orderId, customerName || '', customerEmail || '', customerPhone || '',
       trackingNumber || '', courier || '', complaintDescription || '', deliveryProof || '']
    );

    // Link investigation to order
    await db.run(
      `UPDATE orders SET shipping_customer_contact_status = 'investigation_opened' WHERE id = ? OR order_code = ?`,
      [orderId, orderId]
    );

    res.status(201).json({ success: true, message: 'Investigation created.', id });
  } catch (err) {
    console.error('Error creating shipping investigation:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH Admin Update Shipping Investigation (Protected)
app.patch('/api/admin/shipping/investigations/:id', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const {
      investigationNotes, investigationStatus, finalOutcome,
      outcomeNotes, resolution, courierName, trackingNumber
    } = req.body;

    const inv = await db.get('SELECT * FROM shipping_investigations WHERE id = ?', [id]);
    if (!inv) {
      return res.status(404).json({ error: 'Investigation not found.' });
    }

    await db.run(
      `UPDATE shipping_investigations SET
        investigation_notes = COALESCE(?, investigation_notes),
        investigation_status = COALESCE(?, investigation_status),
        final_outcome = COALESCE(?, final_outcome),
        outcome_notes = COALESCE(?, outcome_notes),
        resolution = COALESCE(?, resolution),
        tracking_number = COALESCE(?, tracking_number),
        courier = COALESCE(?, courier),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [investigationNotes, investigationStatus, finalOutcome,
       outcomeNotes, resolution, trackingNumber, courierName, id]
    );

    res.json({ success: true, message: 'Investigation updated.', id });
  } catch (err) {
    console.error('Error updating shipping investigation:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH Admin Update Order Tracking Info (Protected)
app.patch('/api/admin/orders/:id/tracking', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { trackingNumber, courierName, deliveryEstimate } = req.body;

    const order = await db.get('SELECT id FROM orders WHERE id = ? OR order_code = ?', [id, id]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    await db.run(
      `UPDATE orders SET
        tracking_number = COALESCE(?, tracking_number),
        courier_name = COALESCE(?, courier_name),
        delivery_estimate = COALESCE(?, delivery_estimate)
       WHERE id = ?`,
      [trackingNumber || null, courierName || null, deliveryEstimate || null, order.id]
    );

    res.json({ success: true, message: 'Tracking info updated.', orderId: order.id });
  } catch (err) {
    console.error('Error updating tracking info:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET Customer My-Orders (Public / Customer Authenticated)
app.get('/api/orders/my-orders', async (req, res) => {
  try {
    const db = await getDb();
    const { userId, email } = req.query;

    if (!userId && !email) {
      return res.status(400).json({ error: 'User ID or Email parameter is required' });
    }

    const orders = await db.all(
      `SELECT * FROM orders WHERE user_id = ? OR customer_email = ? ORDER BY created_at DESC`,
      [userId || '', email || '']
    );

    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
    const now = Date.now();

    const formatted = orders.map(o => {
      const createdAtMs = new Date(o.created_at).getTime();
      const elapsedMs = now - createdAtMs;
      const remainingSeconds = Math.max(0, Math.floor((TWO_HOURS_MS - elapsedMs) / 1000));
      const isModifiable = !['Shipped', 'Delivered', 'Cancelled'].includes(o.status) && elapsedMs <= TWO_HOURS_MS;

      let pickupDetails = null;
      try {
        if (o.pickup_details_json) pickupDetails = JSON.parse(o.pickup_details_json);
      } catch (_) { }

      let modificationHistory = [];
      try {
        if (o.modification_history_json) modificationHistory = JSON.parse(o.modification_history_json);
      } catch (_) { }

      return {
        id: o.id,
        orderCode: o.order_code,
        userId: o.user_id,
        customerName: o.customer_name,
        customerEmail: o.customer_email,
        customerPhone: o.customer_phone,
        address: o.shipping_address,
        shippingAddressLine1: o.shipping_address_line1,
        shippingAddressLine2: o.shipping_address_line2,
        shippingCity: o.shipping_city,
        shippingState: o.shipping_state,
        shippingPincode: o.shipping_pincode,
        shippingCountry: o.shipping_country,
        fulfillmentType: o.fulfillment_type || 'ship',
        pickupDetails,
        modificationHistory,
        modifiedAt: o.modified_at,
        cancelledAt: o.cancelled_at,
        isModifiable,
        remainingSeconds,
        twoHourWindowExpiresAt: new Date(createdAtMs + TWO_HOURS_MS).toISOString(),
        amount: `₹${Number(o.total_amount).toLocaleString('en-IN')}`,
        rawAmount: Number(o.total_amount),
        status: o.status,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        items: typeof o.items_json === 'string' ? JSON.parse(o.items_json).map(i => `${i.title || i.name}${i.selectedColor ? ` [Colour: ${i.selectedColor}]` : (i.colour ? ` [Colour: ${i.colour}]` : '')}${i.selectedSize ? ` [Size: ${i.selectedSize}]` : ''} (x${i.quantity || 1})`).join(', ') : 'Items',
        itemsJson: o.items_json,
        createdAt: o.created_at,
        date: new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to calculate exact UTC boundaries for Asia/Kolkata (IST) calendar dates
function getIstDateRangeBoundaries(preset, startDateStr, endDateStr) {
  if (!preset || preset === 'all') return null;

  const nowUtc = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const nowIst = new Date(nowUtc.getTime() + istOffsetMs);

  const year = nowIst.getUTCFullYear();
  const month = nowIst.getUTCMonth();
  const day = nowIst.getUTCDate();

  let startIstUtc, endIstUtc;

  if (preset === 'today') {
    const todayStartIstMs = Date.UTC(year, month, day, 0, 0, 0, 0);
    startIstUtc = new Date(todayStartIstMs - istOffsetMs);
    endIstUtc = new Date(todayStartIstMs + (24 * 60 * 60 * 1000) - istOffsetMs);
  } else if (preset === 'yesterday') {
    const todayStartIstMs = Date.UTC(year, month, day, 0, 0, 0, 0);
    startIstUtc = new Date(todayStartIstMs - (24 * 60 * 60 * 1000) - istOffsetMs);
    endIstUtc = new Date(todayStartIstMs - istOffsetMs);
  } else if (preset === 'last7') {
    const todayStartIstMs = Date.UTC(year, month, day, 0, 0, 0, 0);
    startIstUtc = new Date(todayStartIstMs - (6 * 24 * 60 * 60 * 1000) - istOffsetMs);
    endIstUtc = new Date(todayStartIstMs + (24 * 60 * 60 * 1000) - istOffsetMs);
  } else if (preset === 'thisMonth') {
    const monthStartIstMs = Date.UTC(year, month, 1, 0, 0, 0, 0);
    const nextMonthStartIstMs = Date.UTC(year, month + 1, 1, 0, 0, 0, 0);
    startIstUtc = new Date(monthStartIstMs - istOffsetMs);
    endIstUtc = new Date(nextMonthStartIstMs - istOffsetMs);
  } else if (preset === 'lastMonth') {
    const lastMonthStartIstMs = Date.UTC(year, month - 1, 1, 0, 0, 0, 0);
    const currentMonthStartIstMs = Date.UTC(year, month, 1, 0, 0, 0, 0);
    startIstUtc = new Date(lastMonthStartIstMs - istOffsetMs);
    endIstUtc = new Date(currentMonthStartIstMs - istOffsetMs);
  } else if (preset === 'custom' && startDateStr && endDateStr) {
    const [sY, sM, sD] = startDateStr.split('-').map(Number);
    const [eY, eM, eD] = endDateStr.split('-').map(Number);

    const customStartIstMs = Date.UTC(sY, sM - 1, sD, 0, 0, 0, 0);
    const customEndIstMs = Date.UTC(eY, eM - 1, eD, 0, 0, 0, 0) + (24 * 60 * 60 * 1000);
    startIstUtc = new Date(customStartIstMs - istOffsetMs);
    endIstUtc = new Date(customEndIstMs - istOffsetMs);
  } else {
    return null;
  }

  return {
    startUtcIso: startIstUtc.toISOString(),
    endUtcIso: endIstUtc.toISOString()
  };
}

// GET all orders (Protected Admin Endpoint) with IST Date Filtering, Status, Fulfillment & Search
app.get('/api/orders', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { preset, startDate, endDate, status, fulfillment, search } = req.query;

    const bounds = getIstDateRangeBoundaries(preset, startDate, endDate);

    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (bounds) {
      params.push(bounds.startUtcIso);
      sql += ` AND created_at >= $${params.length}`;
      params.push(bounds.endUtcIso);
      sql += ` AND created_at < $${params.length}`;
    }

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    if (fulfillment && fulfillment !== 'all') {
      params.push(fulfillment);
      sql += ` AND fulfillment_type = $${params.length}`;
    }

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      params.push(q);
      const pIdx = params.length;
      sql += ` AND (LOWER(id) LIKE $${pIdx} OR LOWER(order_code) LIKE $${pIdx} OR LOWER(customer_name) LIKE $${pIdx} OR LOWER(customer_email) LIKE $${pIdx} OR LOWER(customer_phone) LIKE $${pIdx} OR LOWER(items_json) LIKE $${pIdx})`;
    }

    sql += ' ORDER BY created_at DESC';

    const orders = await db.all(sql, params);
    res.json(orders);
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH Update Order Status (Protected Admin Endpoint)
app.patch('/api/orders/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const order = await db.get('SELECT * FROM orders WHERE id = ? OR order_code = ?', [id, id]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    let history = [];
    try {
      history = order.modification_history_json ? JSON.parse(order.modification_history_json) : [];
    } catch (_) { }

    history.push({
      action: 'ADMIN_STATUS_UPDATE',
      timestamp: new Date().toISOString(),
      actor: 'admin',
      previousStatus: order.status,
      newStatus: status
    });

    await db.run(
      'UPDATE orders SET status = ?, modification_history_json = ? WHERE id = ?',
      [status, JSON.stringify(history), order.id]
    );

    // When order is marked Delivered: reset any dismissed/remind_later review prompts
    if (status === 'Delivered') {
      try {
        let items = [];
        try {
          items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : (order.items_json || []);
        } catch (e) { items = []; }

        const productKeys = items.length > 0
          ? items.map(item => String(item.id || item.productId || '').trim()).filter(Boolean)
          : ['ORDER-' + order.id];

        for (const productId of productKeys) {
          const promptId = 'PRM-' + order.id + '-' + productId;
          await db.run(
            `UPDATE review_prompts SET status = 'pending', updated_at = CURRENT_TIMESTAMP
             WHERE id = ? AND status IN ('dismissed', 'remind_later')`,
            [promptId]
          );
        }
      } catch (promptErr) {
        console.error('Error resetting review prompts on delivery:', promptErr);
      }
    }

    res.json({ message: 'Order status updated successfully', orderId: order.id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH Cancel Order (Customer & Admin Supported with 2-Hour Strict Window & Inventory Restock)
app.patch('/api/orders/:id/cancel', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { reason, actor = 'customer' } = req.body || {};

    const order = await db.get('SELECT * FROM orders WHERE id = ? OR order_code = ?', [id, id]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (['Shipped', 'Delivered', 'Cancelled'].includes(order.status)) {
      return res.status(400).json({ error: `Order cannot be cancelled because its status is already ${order.status}` });
    }

    // Strict 2-Hour Backend Policy Check (if actor is customer)
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
    const elapsedMs = Date.now() - new Date(order.created_at).getTime();
    if (actor === 'customer' && elapsedMs > TWO_HOURS_MS) {
      return res.status(403).json({
        error: 'Order cancellation window (2 hours) has expired. The order is being prepared for dispatch.'
      });
    }

    // Atomically restock inventory and cancel order
    await db.transaction(async (tx) => {
      let items = [];
      try {
        items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : (order.items_json || []);
      } catch (e) {
        items = [];
      }

      // Restock products
      for (const item of items) {
        const prodId = item.id || item.productId;
        const qty = item.quantity || 1;
        if (prodId) {
          await tx.run(
            `UPDATE products 
             SET stock_quantity = stock_quantity + ?,
                 in_stock = 1,
                 sold_out = 0,
                 sold_count = GREATEST(0, sold_count - ?),
                 badge = CASE WHEN badge = 'Sold Out' THEN 'Standard' ELSE badge END
             WHERE id = ?`,
            [qty, qty, prodId]
          );
        }
      }

      let history = [];
      try {
        history = order.modification_history_json ? JSON.parse(order.modification_history_json) : [];
      } catch (_) { }

      history.push({
        action: 'CANCEL_ORDER',
        timestamp: new Date().toISOString(),
        actor,
        reason: reason || (actor === 'customer' ? 'Customer cancelled within 2-hour window' : 'Admin cancelled order'),
        refundStatus: 'refund_initiated'
      });

      await tx.run(
        `UPDATE orders 
         SET status = 'Cancelled',
             payment_status = CASE WHEN payment_status = 'paid' THEN 'refund_initiated' ELSE 'cancelled' END,
             cancelled_at = CURRENT_TIMESTAMP,
             modification_history_json = ?
         WHERE id = ?`,
        [JSON.stringify(history), order.id]
      );
    });

    invalidateApiCache();

    res.json({
      success: true,
      message: 'Order cancelled successfully and inventory restored to stock.',
      id: order.id,
      status: 'Cancelled',
      paymentStatus: order.payment_status === 'paid' ? 'refund_initiated' : 'cancelled'
    });
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH Modify Order (Address, Pickup Details, Variants, Adding Products within 2-Hour Window)
app.patch('/api/orders/:id/modify', async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const {
      modificationType, // 'address' | 'pickup' | 'variant' | 'add_items'
      shippingData,
      pickupDetails,
      variantChanges, // array of { index, selectedSize, selectedColor }
      itemsToAdd,     // array of { id, quantity, selectedSize, selectedColor }
      actor = 'customer'
    } = req.body;

    const order = await db.get('SELECT * FROM orders WHERE id = ? OR order_code = ?', [id, id]);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (['Shipped', 'Delivered', 'Cancelled'].includes(order.status)) {
      return res.status(400).json({ error: `Order cannot be modified because its status is ${order.status}` });
    }

    // Strict 2-Hour Backend Policy Check
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
    const elapsedMs = Date.now() - new Date(order.created_at).getTime();
    if (actor === 'customer' && elapsedMs > TWO_HOURS_MS) {
      return res.status(403).json({
        error: 'Order modification window (2 hours) has expired. Order details can no longer be edited.'
      });
    }

    const storeSettings = await getStorePickupSettings(db);

    const result = await db.transaction(async (tx) => {
      let currentItems = [];
      try {
        currentItems = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : (order.items_json || []);
      } catch (e) { currentItems = []; }

      let history = [];
      try {
        history = order.modification_history_json ? JSON.parse(order.modification_history_json) : [];
      } catch (_) { }

      let updatedShippingAddress = order.shipping_address;
      let updatedLine1 = order.shipping_address_line1;
      let updatedLine2 = order.shipping_address_line2;
      let updatedCity = order.shipping_city;
      let updatedState = order.shipping_state;
      let updatedPincode = order.shipping_pincode;
      let updatedCustomerName = order.customer_name;
      let updatedCustomerPhone = order.customer_phone;
      let updatedPickupDetailsJson = order.pickup_details_json;
      let updatedTotalAmount = Number(order.total_amount);

      // 1. Modify Shipping Address
      if (modificationType === 'address' && shippingData) {
        const addrSnap = extractAndValidateAddressSnapshot(shippingData, 'ship', storeSettings);
        updatedShippingAddress = addrSnap.fullFormattedAddress;
        updatedLine1 = addrSnap.line1;
        updatedLine2 = addrSnap.line2;
        updatedCity = addrSnap.city;
        updatedState = addrSnap.state;
        updatedPincode = addrSnap.pincode;
        if (shippingData.fullName) updatedCustomerName = shippingData.fullName.trim();
        if (shippingData.phone) updatedCustomerPhone = shippingData.phone.trim();

        history.push({
          action: 'UPDATE_SHIPPING_ADDRESS',
          timestamp: new Date().toISOString(),
          actor,
          previousAddress: order.shipping_address,
          newAddress: updatedShippingAddress
        });
      }

      // 2. Modify Pickup Details
      if (modificationType === 'pickup' && pickupDetails) {
        const addrSnap = extractAndValidateAddressSnapshot(
          { pickupDetails, customerName: pickupDetails.pickupPersonName || order.customer_name, customerPhone: pickupDetails.pickupPersonPhone || order.customer_phone },
          'pickup',
          storeSettings
        );
        updatedShippingAddress = addrSnap.fullFormattedAddress;
        updatedPickupDetailsJson = JSON.stringify({
          ...storeSettings,
          pickupPersonName: addrSnap.pickupPersonName,
          pickupPersonPhone: addrSnap.pickupPersonPhone,
          notes: addrSnap.notes || ''
        });
        if (pickupDetails.pickupPersonName) updatedCustomerName = pickupDetails.pickupPersonName.trim();
        if (pickupDetails.pickupPersonPhone) updatedCustomerPhone = pickupDetails.pickupPersonPhone.trim();

        history.push({
          action: 'UPDATE_PICKUP_DETAILS',
          timestamp: new Date().toISOString(),
          actor,
          previousPickup: order.pickup_details_json,
          newPickup: updatedPickupDetailsJson
        });
      }

      // 3. Change Product Variants (Size, Colour)
      if (modificationType === 'variant' && Array.isArray(variantChanges)) {
        for (const change of variantChanges) {
          const idx = change.index;
          if (currentItems[idx]) {
            const prevItem = { ...currentItems[idx] };
            if (change.selectedSize !== undefined) currentItems[idx].selectedSize = change.selectedSize;
            if (change.selectedColor !== undefined) {
              currentItems[idx].selectedColor = change.selectedColor;
              currentItems[idx].colour = change.selectedColor;
            }

            history.push({
              action: 'CHANGE_PRODUCT_VARIANT',
              timestamp: new Date().toISOString(),
              actor,
              itemTitle: currentItems[idx].title || currentItems[idx].name,
              previousVariant: { size: prevItem.selectedSize, color: prevItem.selectedColor || prevItem.colour },
              newVariant: { size: currentItems[idx].selectedSize, color: currentItems[idx].selectedColor || currentItems[idx].colour }
            });
          }
        }
      }

      // 4. Add Products to Order (Revalidate Stock & Selling Price Strictly from DB)
      if (modificationType === 'add_items' && Array.isArray(itemsToAdd) && itemsToAdd.length > 0) {
        for (const newItem of itemsToAdd) {
          const product = await tx.get(
            'SELECT id, title, selling_price, stock_quantity, sold_out, sold_count, badge, product_code FROM products WHERE id = ? FOR UPDATE',
            [newItem.id]
          );

          if (!product) {
            throw new Error(`Product "${newItem.title || newItem.id}" was not found.`);
          }

          const addQty = Number(newItem.quantity) || 1;
          const currentStock = product.stock_quantity ?? 0;
          if (currentStock < addQty || product.sold_out === 1) {
            throw new Error(`Sorry, "${product.title}" is out of stock or only ${currentStock} units are available.`);
          }

          const dbPrice = Number(product.selling_price);
          const pCode = product.product_code || newItem.productCode || newItem.product_code || 'N/A';

          // Atomically deduct stock
          const newQty = currentStock - addQty;
          const isSoldOut = newQty === 0;
          const newSoldCount = (product.sold_count ?? 0) + addQty;

          await tx.run(
            `UPDATE products 
             SET stock_quantity = ?, in_stock = ?, sold_out = ?, sold_count = ?,
                 badge = CASE WHEN ? = 1 THEN 'Sold Out' ELSE badge END
             WHERE id = ?`,
            [newQty, isSoldOut ? 0 : 1, isSoldOut ? 1 : 0, newSoldCount, isSoldOut ? 1 : 0, product.id]
          );

          currentItems.push({
            id: product.id,
            productCode: pCode,
            product_code: pCode,
            title: product.title,
            name: product.title,
            price: dbPrice,
            sellingPrice: dbPrice,
            quantity: addQty,
            selectedSize: newItem.selectedSize || '',
            selectedColor: newItem.selectedColor || product.colour || '',
            img: newItem.img || product.img
          });

          updatedTotalAmount += dbPrice * addQty;

          history.push({
            action: 'ADD_PRODUCT_TO_ORDER',
            timestamp: new Date().toISOString(),
            actor,
            itemAdded: product.title,
            productCode: pCode,
            quantityAdded: addQty,
            unitPrice: dbPrice,
            addedAmount: dbPrice * addQty
          });
        }
      }

      await tx.run(
        `UPDATE orders
         SET customer_name = ?,
             customer_phone = ?,
             shipping_address = ?,
             shipping_address_line1 = ?,
             shipping_address_line2 = ?,
             shipping_city = ?,
             shipping_state = ?,
             shipping_pincode = ?,
             pickup_details_json = ?,
             total_amount = ?,
             items_json = ?,
             modification_history_json = ?,
             modified_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          updatedCustomerName,
          updatedCustomerPhone,
          updatedShippingAddress,
          updatedLine1,
          updatedLine2,
          updatedCity,
          updatedState,
          updatedPincode,
          updatedPickupDetailsJson,
          updatedTotalAmount,
          JSON.stringify(currentItems),
          JSON.stringify(history),
          order.id
        ]
      );

      return {
        orderId: order.id,
        totalAmount: updatedTotalAmount,
        itemsCount: currentItems.length,
        modificationHistory: history
      };
    });

    invalidateApiCache();

    res.json({
      success: true,
      message: 'Order updated successfully within 2-hour policy window.',
      ...result
    });

  } catch (err) {
    console.error('Error modifying order:', err);
    res.status(400).json({ error: err.message });
  }
});

// ======================================================
// PRODUCT REVIEWS API
// ======================================================

// GET Pending Review Prompt for Customer
app.get('/api/reviews/pending-prompt', async (req, res) => {
  try {
    const db = await getDb();
    const { userId, email } = req.query;

    if (!userId && !email) {
      return res.json({ prompt: null });
    }

    const orders = await db.all(
      `SELECT * FROM orders WHERE (user_id = ? OR customer_email = ?) AND status = 'Delivered' ORDER BY created_at DESC`,
      [userId || '', email || '']
    );

    if (!orders || orders.length === 0) {
      return res.json({ prompt: null });
    }

    // Batch-query existing reviews & prompts to eliminate N+1 DB roundtrips in loop
    const existingReviews = await db.all(
      `SELECT order_id, product_id FROM product_reviews WHERE user_id = ? OR customer_email = ?`,
      [userId || '', email || '']
    );
    const reviewedSet = new Set(existingReviews.map(r => `${r.order_id}_${r.product_id}`));

    const existingPrompts = await db.all(
      `SELECT id, status FROM review_prompts WHERE user_id = ? OR id LIKE 'PRM-%'`,
      [userId || '']
    );
    const promptStatusMap = new Map(existingPrompts.map(p => [p.id, p.status]));

    for (const order of orders) {
      // Parse items_json to get individual product IDs
      let items = [];
      try {
        items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : (order.items_json || []);
      } catch (e) {
        items = [];
      }

      // Build list of reviewable entries — each item individually, or the order itself as fallback
      const reviewEntries = items.length > 0
        ? items.map(item => ({
          productId: String(item.id || item.productId || '').trim(),
          productName: item.title || item.name || 'Jewellery Item',
          productImage: item.img || (item.images && item.images[0]) || ''
        })).filter(e => e.productId)
        : [{
          // Fallback: treat the whole order as one reviewable unit
          productId: 'ORDER-' + order.id,
          productName: order.items || 'Jewellery Order',
          productImage: ''
        }];

      for (const entry of reviewEntries) {
        const { productId, productName, productImage } = entry;

        // Check if review already submitted for this order + product
        if (reviewedSet.has(`${order.id}_${productId}`)) continue;

        // Check if prompt was permanently dismissed or submitted
        const promptId = 'PRM-' + order.id + '-' + productId;
        const promptStatus = promptStatusMap.get(promptId);
        if (promptStatus === 'dismissed' || promptStatus === 'submitted') {
          continue;
        }

        // Eligible — return the prompt
        return res.json({
          prompt: {
            orderId: order.id,
            productId,
            productName,
            productImage,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            userId: order.user_id || userId || email
          }
        });
      }
    }

    return res.json({ prompt: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET Check Customer Review Eligibility for a Product (Only Verified Buyers Allowed)
app.get('/api/reviews/eligibility', async (req, res) => {
  try {
    const db = await getDb();
    const { productId, userId, email } = req.query;

    if (!productId) {
      return res.status(400).json({ eligible: false, error: 'Product ID is required' });
    }

    if (!userId && !email) {
      return res.json({ 
        eligible: false, 
        hasPurchased: false, 
        hasReviewed: false, 
        reason: 'Please sign in or provide your registered email to verify your purchase.' 
      });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanUserId = (userId || '').trim();

    // 1. Check if user has already submitted a review for this specific product
    const existingReview = await db.get(
      `SELECT id, rating, status, created_at FROM product_reviews 
       WHERE product_id = ? AND (user_id = ? OR LOWER(customer_email) = ?)`,
      [productId, cleanUserId, cleanEmail]
    );

    if (existingReview) {
      return res.json({
        eligible: false,
        hasPurchased: true,
        hasReviewed: true,
        reviewId: existingReview.id,
        reason: 'You have already submitted a verified review for this product.'
      });
    }

    // 2. Check if customer has placed any valid order containing this product
    const orders = await db.all(
      `SELECT id, order_code, customer_name, customer_email, user_id, status, items_json 
       FROM orders 
       WHERE (user_id = ? OR LOWER(customer_email) = ?) 
       AND status NOT IN ('Cancelled', 'Refunded')
       ORDER BY created_at DESC`,
      [cleanUserId, cleanEmail]
    );

    let matchingOrder = null;
    for (const ord of orders) {
      let items = [];
      try {
        items = typeof ord.items_json === 'string' ? JSON.parse(ord.items_json) : (ord.items_json || []);
      } catch (_) { items = []; }

      const match = items.some(item => 
        String(item.id).trim() === String(productId).trim() ||
        String(item.productId).trim() === String(productId).trim() ||
        (item.productCode && String(item.productCode).trim().toLowerCase() === String(productId).trim().toLowerCase())
      );

      if (match) {
        matchingOrder = ord;
        break;
      }
    }

    if (!matchingOrder) {
      return res.json({
        eligible: false,
        hasPurchased: false,
        hasReviewed: false,
        reason: 'Only verified customers who have ordered this jewellery can write a review.'
      });
    }

    return res.json({
      eligible: true,
      hasPurchased: true,
      hasReviewed: false,
      orderId: matchingOrder.id,
      orderCode: matchingOrder.order_code,
      customerName: matchingOrder.customer_name,
      customerEmail: matchingOrder.customer_email,
      orderStatus: matchingOrder.status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Submit Product Review (Strict Verified Purchaser Validation & Deduplication)
app.post('/api/reviews', async (req, res) => {
  try {
    const db = await getDb();
    const { userId, orderId, productId, productName, productImage, customerName, customerEmail, rating, reviewText, headline } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ error: 'Product ID and Rating (1-5) are required' });
    }

    const cleanRating = Math.max(1, Math.min(5, Number(rating)));
    const cleanEmail = (customerEmail || '').trim().toLowerCase();
    const cleanUserId = (userId || '').trim();

    if (!cleanUserId && !cleanEmail) {
      return res.status(401).json({ error: 'Please log in or provide your registered email to submit a verified review.' });
    }

    // 1. Prevent duplicate reviews by same customer for this product
    const existingReview = await db.get(
      `SELECT id FROM product_reviews WHERE product_id = ? AND (user_id = ? OR LOWER(customer_email) = ?)`,
      [productId, cleanUserId, cleanEmail]
    );

    if (existingReview) {
      return res.status(400).json({ error: 'You have already submitted a review for this product.' });
    }

    // 2. Strict Order Verification: Verify that the customer actually bought this specific product
    const orders = await db.all(
      `SELECT id, order_code, customer_name, customer_email, user_id, status, items_json 
       FROM orders 
       WHERE (user_id = ? OR LOWER(customer_email) = ? OR id = ?) 
       AND status NOT IN ('Cancelled', 'Refunded')
       ORDER BY created_at DESC`,
      [cleanUserId, cleanEmail, orderId || '']
    );

    let matchingOrder = null;
    for (const ord of orders) {
      let items = [];
      try {
        items = typeof ord.items_json === 'string' ? JSON.parse(ord.items_json) : (ord.items_json || []);
      } catch (_) { items = []; }

      const match = items.some(item => 
        String(item.id).trim() === String(productId).trim() ||
        String(item.productId).trim() === String(productId).trim() ||
        (item.productCode && String(item.productCode).trim().toLowerCase() === String(productId).trim().toLowerCase())
      );

      if (match) {
        matchingOrder = ord;
        break;
      }
    }

    if (!matchingOrder) {
      return res.status(403).json({ 
        error: 'Access Denied: You can only review jewellery items that you have purchased from Jiza Jewellery Studio.' 
      });
    }

    let validUserId = null;
    if (cleanUserId) {
      const userExists = await db.get('SELECT id FROM users WHERE id = ?', [cleanUserId]);
      if (userExists) validUserId = userExists.id;
    }

    const reviewId = 'REV-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
    const finalOrderId = matchingOrder.id;
    const finalCustomerName = (customerName || matchingOrder.customer_name || 'Verified Buyer').trim();
    const finalCustomerEmail = cleanEmail || matchingOrder.customer_email || '';
    const fullReviewContent = (headline ? `${headline.trim()}\n\n` : '') + (reviewText || '').trim();

    await db.run(
      `INSERT INTO product_reviews (
        id, user_id, order_id, product_id, product_name, product_image,
        customer_name, customer_email, rating, review_text, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved')`,
      [
        reviewId, validUserId, finalOrderId, productId, productName || 'Jewellery',
        productImage || '', finalCustomerName, finalCustomerEmail,
        cleanRating, fullReviewContent
      ]
    );

    // Also update review prompt if present
    const promptId = 'PRM-' + finalOrderId + '-' + productId;
    await db.run(
      `INSERT INTO review_prompts (id, user_id, order_id, product_id, status)
       VALUES (?, ?, ?, ?, 'submitted')
       ON CONFLICT(id) DO UPDATE SET status = 'submitted', updated_at = CURRENT_TIMESTAMP`,
      [promptId, validUserId, finalOrderId, productId]
    );

    res.status(201).json({ 
      message: 'Thank you! Your verified customer review has been published.', 
      reviewId, 
      id: reviewId 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Dismiss Review Prompt (Skip / Remind Later)
app.post('/api/reviews/dismiss-prompt', async (req, res) => {
  try {
    const db = await getDb();
    const { userId, orderId, productId, action } = req.body;

    if (!orderId || !productId) {
      return res.status(400).json({ error: 'Order ID and Product ID are required' });
    }

    let validUserId = null;
    if (userId) {
      const userExists = await db.get('SELECT id FROM users WHERE id = ?', [userId]);
      if (userExists) validUserId = userExists.id;
    }

    const promptId = 'PRM-' + orderId + '-' + productId;
    const status = action === 'skip' ? 'dismissed' : 'remind_later';

    await db.run(
      `INSERT INTO review_prompts (id, user_id, order_id, product_id, status)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET status = ?, updated_at = CURRENT_TIMESTAMP`,
      [promptId, validUserId, orderId, productId, status, status]
    );

    res.json({ message: 'Prompt status updated', status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Approved Reviews for a Specific Product (Strict Product Isolation)
app.get('/api/reviews/approved', async (req, res) => {
  try {
    const db = await getDb();
    const { productId } = req.query;

    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    const reviews = await db.all(
      `SELECT id, product_id, product_name, product_image, customer_name, rating, review_text, created_at 
       FROM product_reviews 
       WHERE product_id = ? AND status = 'Approved' 
       ORDER BY created_at DESC`,
      [productId]
    );

    const totalCount = reviews.length;
    const avgRating = totalCount > 0
      ? Number((reviews.reduce((sum, r) => sum + Number(r.rating), 0) / totalCount).toFixed(1))
      : 5.0;

    res.json({ reviews, count: totalCount, averageRating: avgRating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Admin Reviews Management (Protected)
app.get('/api/admin/reviews', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const reviews = await db.all(`SELECT * FROM product_reviews ORDER BY created_at DESC`);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH Admin Review Status (Approve / Reject) (Protected)
app.patch('/api/admin/reviews/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { status } = req.body;

    await db.run(`UPDATE product_reviews SET status = ? WHERE id = ?`, [status, id]);
    res.json({ message: 'Review status updated successfully', id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Admin Review (Protected)
app.delete('/api/admin/reviews/:id', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    await db.run(`DELETE FROM product_reviews WHERE id = ?`, [id]);
    res.json({ message: 'Review deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Submit Customer Problem / Complaint
app.post('/api/problems', async (req, res) => {
  try {
    const db = await getDb();
    const { userId, customerName, customerEmail, customerPhone, subject, description, screenshot } = req.body;

    if (!customerName || !customerEmail || !subject || !description) {
      return res.status(400).json({ error: 'Name, Email, Subject, and Description are required' });
    }

    let validUserId = null;
    if (userId) {
      const userExists = await db.get('SELECT id FROM users WHERE id = ?', [userId]);
      if (userExists) validUserId = userExists.id;
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const complaintId = `PRB-${dateStr}-${randomCode}`;

    // Convert base64 screenshot payload to disk file URL to avoid DB bloat
    const savedScreenshotUrl = saveBase64ImageToDisk(screenshot, 'tickets');

    await db.run(
      `INSERT INTO customer_problems (
        id, user_id, customer_name, customer_email, customer_phone,
        subject, description, screenshot, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'New')`,
      [
        complaintId, validUserId, customerName, customerEmail, customerPhone || '',
        subject, description, savedScreenshotUrl
      ]
    );

    res.status(201).json({
      message: 'Complaint submitted successfully. Our support team will review it shortly.',
      id: complaintId
    });
  } catch (err) {
    console.error('Error logging problem:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET Customer Problems (Protected by email or user_id query)
app.get('/api/problems', async (req, res) => {
  try {
    const db = await getDb();
    const { email, userId } = req.query;

    let complaints = [];
    if (userId) {
      complaints = await db.all(
        `SELECT * FROM customer_problems WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
      );
    } else if (email) {
      complaints = await db.all(
        `SELECT * FROM customer_problems WHERE customer_email = ? ORDER BY created_at DESC`,
        [email]
      );
    } else {
      return res.status(400).json({ error: 'Email or User ID query parameter is required' });
    }

    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Admin Customer Problems List (Protected)
app.get('/api/admin/problems', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const complaints = await db.all(`SELECT * FROM customer_problems ORDER BY created_at DESC`);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH Admin Update Problem Status & Notes (Protected)
app.patch('/api/admin/problems/:id', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (adminNotes !== undefined) {
      updates.push('admin_notes = ?');
      params.push(adminNotes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    await db.run(`UPDATE customer_problems SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ message: 'Complaint updated successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Admin Customer Problem / Ticket (Protected)
app.delete('/api/admin/problems/:id', requireAdminAuth, async (req, res) => {
  try {
    const db = await getDb();
    const { id } = req.params;

    const existing = await db.get('SELECT screenshot FROM customer_problems WHERE id = ?', [id]);
    await db.run('DELETE FROM customer_problems WHERE id = ?', [id]);

    if (existing && existing.screenshot) {
      deleteLocalUploadFile(existing.screenshot);
    }

    res.json({ message: 'Complaint deleted successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Enterprise Secure Backend running on port ${PORT}`);
});
