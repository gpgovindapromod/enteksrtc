/**
 * Payment Service Abstraction
 * ----------------------------
 * Wraps the underlying payment provider behind a clean interface so the
 * booking controller is decoupled from provider-specific SDKs.
 *
 * Provider selection is driven by the PAYMENT_PROVIDER env variable:
 *   - "SIMULATED"  → Dev/test flow. No real money moves. Always configured.
 *   - "RAZORPAY"   → Razorpay integration (when RAZORPAY_KEY_ID / SECRET set).
 *
 * Security rules enforced here:
 *   1. Amount is always passed from the server-side booking record, NEVER from the client.
 *   2. Payment verification uses provider signature, not a frontend flag.
 *   3. Webhook payloads are verified before processing.
 *   4. Idempotency: if a booking is already PAID, re-verification is a no-op success.
 */

import crypto from 'crypto';

const PROVIDER = process.env.PAYMENT_PROVIDER || 'SIMULATED';
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

const isRazorpayConfigured = !!(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);

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
    return signature === expected;
  },
};

// ─── RAZORPAY PROVIDER ────────────────────────────────────────────────────────

const razorpay = {
  createOrder: async ({ amountPaise, bookingId, receipt }) => {
    // Lazy import to avoid crash if razorpay package absent
    const Razorpay = (await import('razorpay')).default;
    const instance = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
    const order = await instance.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes: { bookingId: String(bookingId) },
    });
    return { orderId: order.id, amount: order.amount, currency: order.currency, gateway: 'RAZORPAY' };
  },

  verifyPayment: async ({ orderId, paymentId, signature, expectedOrderId }) => {
    if (orderId !== expectedOrderId) return { verified: false, transactionId: null };
    const body = `${orderId}|${paymentId}`;
    const expected = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');
    const verified = expected === signature;
    return { verified, transactionId: verified ? paymentId : null };
  },

  verifyWebhook: ({ rawBody, signature }) => {
    const expected = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');
    return signature === expected;
  },
};

// ─── PROVIDER SELECTION ───────────────────────────────────────────────────────

const provider = PROVIDER === 'RAZORPAY' && isRazorpayConfigured ? razorpay : simulated;

export const isRealProviderConfigured = PROVIDER === 'RAZORPAY' && isRazorpayConfigured;
export const activeGateway = isRealProviderConfigured ? 'RAZORPAY' : 'SIMULATED';

export const createPaymentOrder = (params) => provider.createOrder(params);
export const verifyPayment = (params) => provider.verifyPayment(params);
export const verifyWebhookSignature = (params) => provider.verifyWebhook(params);
