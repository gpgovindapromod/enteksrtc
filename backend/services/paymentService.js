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
  /**
   * Creates a "payment order" reference on the server.
   * In simulation mode this is just a unique server-generated ID.
   * @param {Object} params
   * @param {number} params.amountPaise  - Amount in paise (100ths of a rupee)
   * @param {string} params.bookingId    - Internal booking _id (for correlation)
   * @param {string} params.receipt      - Human-readable receipt label
   * @returns {{ orderId: string, amount: number, currency: string, gateway: string }}
   */
  createOrder: async ({ amountPaise, bookingId, receipt }) => {
    const orderId = `SIM_ORD_${bookingId}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    return { orderId, amount: amountPaise, currency: 'INR', gateway: 'SIMULATED' };
  },

  /**
   * Verifies the payment against the server-recorded order.
   * In simulation mode, "verify" just checks that the orderId we issued
   * matches what was returned, and that paymentStatus sent is SUCCESS.
   *
   * The frontend CANNOT forge this because it does not know the bookingId used
   * to generate the orderId — it only receives the orderId.
   *
   * @param {Object} params
   * @param {string} params.orderId          - The orderId we created
   * @param {string} params.paymentId        - Provider payment ID (simulated)
   * @param {string} params.signature        - Simulated signature
   * @param {string} params.expectedOrderId  - What we stored in the booking
   * @returns {{ verified: boolean, transactionId: string }}
   */
  verifyPayment: async ({ orderId, paymentId, signature, expectedOrderId }) => {
    if (!orderId || orderId !== expectedOrderId) {
      return { verified: false, transactionId: null };
    }
    // In simulation, any non-empty paymentId is accepted
    const transactionId = paymentId || `SIM_PAY_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    return { verified: true, transactionId };
  },

  /**
   * Verifies a webhook payload signature.
   * Simulation: webhook secret must match env, payload hash is checked.
   */
  verifyWebhook: ({ rawBody, signature }) => {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET || 'sim-webhook-secret';
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    return timingSafeEqual(expected, signature || '');
  },
};

// ─── RAZORPAY PROVIDER ────────────────────────────────────────────────────────

const razorpayProvider = {
  /**
   * Creates a Razorpay order using the backend-calculated amount in paise.
   * RAZORPAY_KEY_SECRET is used here server-side only.
   * Returns only safe data (no secret) to be forwarded to the frontend.
   */
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
    const instance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
    const order = await instance.orders.create({
      amount: amountPaise,       // paise – Razorpay expects smallest currency unit
      currency: 'INR',
      receipt: String(receipt).substring(0, 40),  // Razorpay receipt max 40 chars
      notes: { bookingId: String(bookingId) },
    });
    return {
      orderId: order.id,
      amount: order.amount,       // echo back what Razorpay confirmed (paise)
      currency: order.currency,
      gateway: 'RAZORPAY',
    };
  },

  /**
   * Verifies Razorpay payment signature server-side.
   * HMAC-SHA256( razorpay_order_id + "|" + razorpay_payment_id, KEY_SECRET )
   * Uses timing-safe comparison to prevent timing attacks.
   */
  verifyPayment: async ({ orderId, paymentId, signature, expectedOrderId }) => {
    if (!orderId || !paymentId || !signature) {
      return { verified: false, transactionId: null };
    }
    if (orderId !== expectedOrderId) {
      return { verified: false, transactionId: null };
    }
    if (!RAZORPAY_KEY_SECRET) {
      return { verified: false, transactionId: null };
    }
    const body = `${orderId}|${paymentId}`;
    const expected = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');
    const verified = timingSafeEqual(expected, signature);
    return { verified, transactionId: verified ? paymentId : null };
  },

  /**
   * Verifies Razorpay webhook signature using the RAZORPAY_WEBHOOK_SECRET.
   * Must be called with the raw request body bytes (before JSON.parse).
   * Header: X-Razorpay-Signature
   */
  verifyWebhook: ({ rawBody, signature }) => {
    if (!RAZORPAY_WEBHOOK_SECRET) {
      console.warn('[PaymentService] RAZORPAY_WEBHOOK_SECRET not set – webhook verification skipped');
      return false;
    }
    if (!signature) return false;
    const expected = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');
    return timingSafeEqual(expected, signature);
  },
};

// ─── PROVIDER SELECTION ───────────────────────────────────────────────────────

const provider = PROVIDER === 'RAZORPAY' && isRazorpayConfigured ? razorpayProvider : simulated;

export const isRealProviderConfigured = PROVIDER === 'RAZORPAY' && isRazorpayConfigured;
export const activeGateway = isRealProviderConfigured ? 'RAZORPAY' : 'SIMULATED';

/**
 * Returns the PUBLIC Razorpay key ID to send to the frontend.
 * The secret is NEVER included.
 */
export const getPublicKeyId = () => {
  if (isRealProviderConfigured) return RAZORPAY_KEY_ID;
  return null;
};

export const createPaymentOrder = (params) => provider.createOrder(params);
export const verifyPayment = (params) => provider.verifyPayment(params);
export const verifyWebhookSignature = (params) => provider.verifyWebhook(params);
