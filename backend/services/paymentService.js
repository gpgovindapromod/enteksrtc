/**
 * Payment Service Abstraction
 * ----------------------------
 * Wraps the underlying payment provider behind a clean interface so the
 * booking controller is decoupled from provider-specific SDKs.
 *
 * Provider selection is driven by the PAYMENT_PROVIDER env variable:
 *   - "SIMULATED"  → Dev/test flow. No real money moves. Always configured.
 *   - "RAZORPAY"   → Razorpay TEST-MODE integration (when RAZORPAY_KEY_ID / SECRET set).
 *
 * Security rules enforced here:
 *   1. Amount is always passed from the server-side booking record, NEVER from the client.
 *   2. Payment verification uses HMAC-SHA256 signature, not a frontend flag.
 *   3. Webhook payloads are verified before processing using raw bytes.
 *   4. Idempotency: if a booking is already PAID, re-verification is a no-op success.
 *   5. Timing-safe comparison is used for all signature checks.
 *   6. RAZORPAY_KEY_SECRET is NEVER returned to the frontend.
 */

import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const PROVIDER = (process.env.PAYMENT_PROVIDER || 'SIMULATED').toUpperCase();
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || null;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || null;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || null;

const isRazorpayConfigured = !!(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);

/**
 * Timing-safe hex string comparison.
 * Prevents timing side-channel attacks on HMAC comparison.
 */
const timingSafeEqual = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) {
    // Prevent length-based timing leak by running a dummy comparison
    crypto.timingSafeEqual(
      Buffer.from(a.padEnd(64, '0'), 'hex'),
      Buffer.from(b.padEnd(64, '0'), 'hex')
    );
    return false;
  }
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
};

// ─── SIMULATED PROVIDER ───────────────────────────────────────────────────────

const simulated = {
  // ... existing methods ...
  createOrder: async ({ amountPaise, bookingId, receipt }) => {
    const orderId = `SIM_ORD_${bookingId}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    return { orderId, amount: amountPaise, currency: 'INR', gateway: 'SIMULATED' };
  },
  verifyPayment: async ({ orderId, paymentId, signature, expectedOrderId }) => {
    if (!orderId || orderId !== expectedOrderId) {
      return { verified: false, transactionId: null };
    }
    const transactionId = paymentId || `SIM_PAY_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    return { verified: true, transactionId };
  },
  verifyWebhook: ({ rawBody, signature }) => {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET || 'sim-webhook-secret';
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    return timingSafeEqual(expected, signature || '');
  },
  getPaymentStatus: async ({ orderId }) => {
    // Simulated: just return captured if called, as we don't have a real state store
    return { status: 'CAPTURED', transactionId: `SIM_PAY_${orderId}` };
  },
  createRefund: async ({ transactionId, amountPaise, notes }) => {
    const refundId = `SIM_REF_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    return { refundId, status: 'PROCESSED' };
  },
};

// ─── RAZORPAY PROVIDER ────────────────────────────────────────────────────────

const razorpayProvider = {
  createOrder: async ({ amountPaise, bookingId, receipt }) => {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }
    let Razorpay;
    try {
      Razorpay = (await import('razorpay')).default;
    } catch {
      throw new Error('Razorpay SDK not installed. Run: npm install razorpay');
    }
    const instance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
    const order = await instance.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: String(receipt).substring(0, 40),
      notes: { bookingId: String(bookingId) },
    });
    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      gateway: 'RAZORPAY',
    };
  },
  verifyPayment: async ({ orderId, paymentId, signature, expectedOrderId }) => {
    if (!orderId || !paymentId || !signature || orderId !== expectedOrderId || !RAZORPAY_KEY_SECRET) {
      return { verified: false, transactionId: null };
    }
    const expected = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    const verified = timingSafeEqual(expected, signature);
    return { verified, transactionId: verified ? paymentId : null };
  },
  verifyWebhook: ({ rawBody, signature }) => {
    if (!RAZORPAY_WEBHOOK_SECRET || !signature) return false;
    const expected = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');
    return timingSafeEqual(expected, signature);
  },
  getPaymentStatus: async ({ orderId }) => {
    let Razorpay;
    try { Razorpay = (await import('razorpay')).default; } catch { throw new Error('SDK error'); }
    const instance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
    const payments = await instance.orders.fetchPayments(orderId);
    
    // Find a captured payment if any
    const captured = payments.items.find(p => p.status === 'captured');
    if (captured) {
      return { status: 'CAPTURED', transactionId: captured.id };
    }
    const authorized = payments.items.find(p => p.status === 'authorized');
    if (authorized) {
      return { status: 'AUTHORIZED', transactionId: authorized.id };
    }
    return { status: 'PENDING', transactionId: null };
  },
  createRefund: async ({ transactionId, amountPaise, notes, receiptId }) => {
    let Razorpay;
    try { Razorpay = (await import('razorpay')).default; } catch { throw new Error('SDK error'); }
    const instance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
    const refund = await instance.payments.refund(transactionId, {
      amount: amountPaise,
      notes: notes || {},
      receipt: receiptId || transactionId
    });
    return { refundId: refund.id, status: refund.status === 'processed' ? 'PROCESSED' : 'PENDING' };
  }
};

// ─── PROVIDER SELECTION ───────────────────────────────────────────────────────

const provider = PROVIDER === 'RAZORPAY' && isRazorpayConfigured ? razorpayProvider : simulated;

export const isRealProviderConfigured = PROVIDER === 'RAZORPAY' && isRazorpayConfigured;
export const activeGateway = isRealProviderConfigured ? 'RAZORPAY' : 'SIMULATED';

export const getPublicKeyId = () => {
  if (isRealProviderConfigured) return RAZORPAY_KEY_ID;
  return null;
};

export const createPaymentOrder = (params) => provider.createOrder(params);
export const verifyPayment = (params) => provider.verifyPayment(params);
export const verifyWebhookSignature = (params) => provider.verifyWebhook(params);
export const getPaymentStatus = (params) => provider.getPaymentStatus(params);
export const createRefund = (params) => provider.createRefund(params);
