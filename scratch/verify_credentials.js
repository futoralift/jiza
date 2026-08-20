import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import Razorpay from 'razorpay';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('====================================================');
console.log('🔍 VERIFYING PRODUCTION CREDENTIALS');
console.log('====================================================');

// 1. Check Razorpay Live Credentials
async function testRazorpay() {
  console.log('\n💳 [1/2] Testing Razorpay Live Credentials...');
  console.log(`Key ID: ${process.env.RAZORPAY_KEY_ID}`);
  
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    // Test creating a minimal order
    const order = await razorpay.orders.create({
      amount: 10000, // ₹100 in paise
      currency: 'INR',
      receipt: `test_verify_${Date.now()}`,
      notes: { purpose: 'Credentials Live Verification Test' }
    });

    console.log('✅ RAZORPAY LIVE CREDENTIALS VALID & ACTIVE!');
    console.log(`   Sample Order ID Generated: ${order.id}`);
    console.log(`   Order Status: ${order.status}`);
    console.log(`   Amount: ₹${order.amount / 100} ${order.currency}`);
    return true;
  } catch (err) {
    console.error('❌ RAZORPAY VERIFICATION FAILED:', err.message || err);
    if (err.error) console.error('   Details:', err.error);
    return false;
  }
}

// 2. Check SMTP Mailer
async function testSmtp() {
  console.log('\n📧 [2/2] Testing Gmail SMTP Mailer Credentials...');
  console.log(`Host: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
  console.log(`User: ${process.env.SMTP_USER}`);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS
      }
    });

    await transporter.verify();
    console.log('✅ GMAIL SMTP SERVER CONNECTED & AUTHENTICATED SUCCESSFULLY!');
    console.log(`   Ready to send transactional order receipts from: ${process.env.SMTP_FROM_EMAIL}`);
    return true;
  } catch (err) {
    console.error('❌ SMTP VERIFICATION FAILED:', err.message || err);
    return false;
  }
}

async function run() {
  const rzpOk = await testRazorpay();
  const smtpOk = await testSmtp();

  console.log('\n====================================================');
  console.log(`SUMMARY: Razorpay=${rzpOk ? 'PASS ✅' : 'FAIL ❌'} | SMTP=${smtpOk ? 'PASS ✅' : 'FAIL ❌'}`);
  console.log('====================================================\n');
  process.exit(rzpOk && smtpOk ? 0 : 1);
}

run();
