import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay SDK Instance
let razorpayInstance = null;

function getRazorpayInstance() {
  if (razorpayInstance) return razorpayInstance;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.warn('⚠️ Razorpay credentials missing (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).');
    return null;
  }

  razorpayInstance = new Razorpay({
    key_id,
    key_secret
  });

  return razorpayInstance;
}

/**
 * Create a new Razorpay Order server-side
 */
export async function createRazorpayOrder({ amountInRupees, receipt, notes = {} }) {
  const instance = getRazorpayInstance();
  if (!instance) {
    throw new Error('Razorpay payment gateway is not configured on the server.');
  }

  // Amount in Paise (INR smallest sub-unit, 1 INR = 100 Paise)
  const amountInPaise = Math.round(Number(amountInRupees) * 100);

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: receipt || `rcpt_${Date.now()}`,
    notes
  };

  const razorpayOrder = await instance.orders.create(options);
  return razorpayOrder;
}

/**
 * Server-side HMAC SHA256 Signature Verification for Razorpay Checkout
 */
export function verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error('FATAL: RAZORPAY_KEY_SECRET is missing for signature verification.');
    return false;
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  try {
    const a = Buffer.from(generatedSignature, 'utf8');
    const b = Buffer.from(razorpay_signature, 'utf8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (err) {
    return false;
  }
}

/**
 * Server-side Webhook Signature Verification
 */
export function verifyRazorpayWebhookSignature({ rawBody, signatureHeader }) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader || !rawBody) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  try {
    const a = Buffer.from(generatedSignature, 'utf8');
    const b = Buffer.from(signatureHeader, 'utf8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (err) {
    return false;
  }
}
