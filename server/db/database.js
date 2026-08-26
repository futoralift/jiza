import pkg from 'pg';
const { Pool } = pkg;
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbWrapper = null;

function convertSqlToPg(sql) {
  let paramIndex = 1;
  let inString = false;
  let result = '';

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    if (char === "'") {
      if (inString && sql[i + 1] === "'") {
        result += "''";
        i++;
        continue;
      }
      inString = !inString;
      result += char;
    } else if (char === '?' && !inString) {
      result += `$${paramIndex++}`;
    } else {
      result += char;
    }
  }
  return result;
}

export async function getDb() {
  if (dbWrapper) return dbWrapper;

  const config = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT) || 5432,
        database: process.env.PGDATABASE || 'jiza_store',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      };

  const pool = new Pool(config);

  // Verify PostgreSQL connection
  const client = await pool.connect();
  console.log('✅ PostgreSQL Database connected successfully to:', config.database || 'PostgreSQL');

  // Automatic schema migrations for existing databases
  try {
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS welcome_email_sent INTEGER DEFAULT 0;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_email_sent INTEGER DEFAULT 0;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address_line1 TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address_line2 TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_pincode VARCHAR(20);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_country VARCHAR(100) DEFAULT 'India';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS fulfillment_type VARCHAR(50) DEFAULT 'ship';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_details_json TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS modification_history_json TEXT DEFAULT '[]';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP WITH TIME ZONE;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS product_code VARCHAR(100);
      ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT;
      ALTER TABLE admin_accounts ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'SUPER_ADMIN';
      CREATE TABLE IF NOT EXISTS store_settings (
          key VARCHAR(100) PRIMARY KEY,
          value_json TEXT NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS rental_gallery (
          id VARCHAR(100) PRIMARY KEY,
          image_url TEXT NOT NULL,
          storage_path TEXT,
          display_order INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_type ON orders(fulfillment_type);
    `);

    // Seed default pickup settings in store_settings if not present
    const pickupSetting = await client.query("SELECT key FROM store_settings WHERE key = 'pickup_settings'");
    if (!pickupSetting.rows || pickupSetting.rows.length === 0) {
      const defaultPickupSettings = {
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
      await client.query(
        "INSERT INTO store_settings (key, value_json) VALUES ($1, $2)",
        ['pickup_settings', JSON.stringify(defaultPickupSettings)]
      );
      console.log('✅ Default Store Pickup settings seeded successfully.');
    }

    // Backfill product_code for existing products if missing
    const uncodded = await client.query("SELECT id FROM products WHERE product_code IS NULL OR TRIM(product_code) = '' ORDER BY created_at ASC");
    if (uncodded.rows && uncodded.rows.length > 0) {
      console.log(`🌱 Migration: Backfilling product_code for ${uncodded.rows.length} existing products...`);
      let counter = 101;
      for (const prod of uncodded.rows) {
        const code = `PRD-${counter++}`;
        await client.query("UPDATE products SET product_code = $1 WHERE id = $2", [code, prod.id]);
      }
      console.log(`✅ Backfilled product_code for existing products.`);
    }

    // Seed initial Rental Gallery images if empty
    const rentalCountRes = await client.query("SELECT COUNT(*) as count FROM rental_gallery");
    if (parseInt(rentalCountRes.rows[0].count, 10) === 0) {
      console.log(`🌱 Migration: Seeding initial 10 Rental Gallery images...`);
      const defaultRentalImages = [
        "/rental1.webp",
        "/rental2.webp",
        "/kundan-square.webp",
        "/maharashtrian-square.webp",
        "/south-indian.webp",
        "/american-diamond-square.webp",
        "/combo-sets-square.webp",
        "/bangles-square.webp",
        "/banner1.webp",
        "/banner2.webp"
      ];
      for (let i = 0; i < defaultRentalImages.length; i++) {
        const rentId = `rent-init-${i + 1}`;
        await client.query(
          "INSERT INTO rental_gallery (id, image_url, display_order) VALUES ($1, $2, $3)",
          [rentId, defaultRentalImages[i], i + 1]
        );
      }
      console.log(`✅ Initial Rental Gallery images seeded successfully.`);
    }
  } catch (migErr) {
    console.error('Schema migration note:', migErr.message);
  }

  // Initialize PostgreSQL Schema
  const schemaPgPath = path.join(__dirname, 'schema_pg.sql');
  if (fs.existsSync(schemaPgPath)) {
    const schemaSql = fs.readFileSync(schemaPgPath, 'utf8');
    await client.query(schemaSql);
  }
  client.release();

  dbWrapper = {
    type: 'postgres',
    pool,
    all: async (sql, params = []) => {
      const pgSql = convertSqlToPg(sql);
      const res = await pool.query(pgSql, params);
      return res.rows;
    },
    get: async (sql, params = []) => {
      const pgSql = convertSqlToPg(sql);
      const res = await pool.query(pgSql, params);
      return res.rows[0];
    },
    run: async (sql, params = []) => {
      const pgSql = convertSqlToPg(sql);
      if (pgSql.trim().toUpperCase().startsWith('BEGIN')) return { changes: 0 };
      if (pgSql.trim().toUpperCase().startsWith('COMMIT')) return { changes: 0 };
      if (pgSql.trim().toUpperCase().startsWith('ROLLBACK')) return { changes: 0 };

      const res = await pool.query(pgSql, params);
      return { lastID: res.rows?.[0]?.id || null, changes: res.rowCount };
    },
    exec: async (sql) => {
      await pool.query(sql);
    },
    transaction: async (callback) => {
      const txClient = await pool.connect();
      const txWrapper = {
        all: async (sql, params = []) => (await txClient.query(convertSqlToPg(sql), params)).rows,
        get: async (sql, params = []) => (await txClient.query(convertSqlToPg(sql), params)).rows[0],
        run: async (sql, params = []) => {
          const res = await txClient.query(convertSqlToPg(sql), params);
          return { lastID: res.rows?.[0]?.id || null, changes: res.rowCount };
        }
      };
      try {
        await txClient.query('BEGIN');
        const res = await callback(txWrapper);
        await txClient.query('COMMIT');
        return res;
      } catch (err) {
        await txClient.query('ROLLBACK');
        throw err;
      } finally {
        txClient.release();
      }
    }
  };

  return dbWrapper;
}

