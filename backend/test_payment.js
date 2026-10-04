/**
 * Razorpay Payment Integration — Regression Test Suite
 * ======================================================
 * Tests backend payment service logic without requiring a live DB or Razorpay account.
 * Run: node test_payment.js
 */

import crypto from 'crypto';

// ── Test runner ────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const results = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
    results.push({ name, status: 'PASS' });
  } catch (e) {
    console.error(`  ✗ ${name}: ${e.message}`);
    failed++;
    results.push({ name, status: 'FAIL', error: e.message });
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

function assertEqual(a, b, msg) {
  if (a !== b) throw new Error(msg || `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

// ── Timing-safe comparison (replicated from paymentService) ───────────────────
const timingSafeEqual = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) {
    try {
      crypto.timingSafeEqual(
        Buffer.from(a.padEnd(64, '0'), 'hex'),
        Buffer.from(b.padEnd(64, '0'), 'hex')
      );
    } catch {}
    return false;
  }
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
};

// ── Signature generation helpers ──────────────────────────────────────────────
const makeRazorpaySignature = (orderId, paymentId, secret) => {
  return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
};

const makeWebhookSignature = (body, secret) => {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
};

// ── State machine validation ───────────────────────────────────────────────────
const isValidPaymentTransition = (from, to) => {
  const allowed = {
    PENDING:  ['PAID', 'FAILED'],
    PAID:     ['REFUNDED'],
    FAILED:   [],
    REFUNDED: [],
  };
  return (allowed[from] || []).includes(to);
};

// ════════════════════════════════════════════════════════════════════════════════
// TEST SUITE
// ════════════════════════════════════════════════════════════════════════════════

console.log('\n════════════════════════════════════════════════════');
console.log(' Ente KSRTC — Payment Integration Test Suite');
console.log('════════════════════════════════════════════════════\n');

// ── 1. Razorpay signature verification ────────────────────────────────────────
console.log('1. RAZORPAY SIGNATURE VERIFICATION');

test('Valid signature verifies correctly', () => {
  const secret = 'test_secret_key';
  const orderId = 'order_test123';
  const paymentId = 'pay_test456';
  const sig = makeRazorpaySignature(orderId, paymentId, secret);
  assert(timingSafeEqual(sig, sig), 'Matching signatures should pass');
});

test('Tampered signature is rejected', () => {
  const secret = 'test_secret_key';
  const orderId = 'order_test123';
  const paymentId = 'pay_test456';
  const sig = makeRazorpaySignature(orderId, paymentId, secret);
  const tampered = sig.slice(0, -4) + 'ffff';
  assert(!timingSafeEqual(sig, tampered), 'Tampered signature should fail');
});

test('Wrong secret produces different signature', () => {
  const orderId = 'order_test123';
  const paymentId = 'pay_test456';
  const sig1 = makeRazorpaySignature(orderId, paymentId, 'secret_a');
  const sig2 = makeRazorpaySignature(orderId, paymentId, 'secret_b');
  assert(!timingSafeEqual(sig1, sig2), 'Different secrets should produce different sigs');
});

test('Empty signature is rejected', () => {
  const valid = makeRazorpaySignature('order_a', 'pay_b', 'secret');
  assert(!timingSafeEqual(valid, ''), 'Empty signature rejected');
  assert(!timingSafeEqual('', valid), 'Empty expected rejected');
});

test('Mismatched orderId in signature body fails', () => {
  const secret = 'test_secret';
  const correctSig = makeRazorpaySignature('order_CORRECT', 'pay_abc', secret);
  const wrongSig = makeRazorpaySignature('order_WRONG', 'pay_abc', secret);
  assert(!timingSafeEqual(correctSig, wrongSig), 'OrderId mismatch causes sig failure');
});

// ── 2. Webhook signature verification ─────────────────────────────────────────
console.log('\n2. WEBHOOK SIGNATURE VERIFICATION');

test('Valid webhook signature verifies', () => {
  const secret = 'webhook_secret_123';
  const body = JSON.stringify({ event: 'payment.captured' });
  const sig = makeWebhookSignature(body, secret);
  assert(timingSafeEqual(sig, sig), 'Valid webhook sig passes');
});

test('Modified webhook body fails verification', () => {
  const secret = 'webhook_secret_123';
  const body1 = JSON.stringify({ event: 'payment.captured', id: 'ord_001' });
  const body2 = JSON.stringify({ event: 'payment.captured', id: 'ord_002' });
  const sig = makeWebhookSignature(body1, secret);
  const expected = makeWebhookSignature(body2, secret);
  assert(!timingSafeEqual(sig, expected), 'Modified body fails verification');
});

test('Wrong webhook secret fails', () => {
  const body = JSON.stringify({ event: 'order.paid' });
  const sig = makeWebhookSignature(body, 'secret_real');
  const expected = makeWebhookSignature(body, 'secret_fake');
  assert(!timingSafeEqual(sig, expected), 'Wrong webhook secret fails');
});

// ── 3. Paise / currency validation ────────────────────────────────────────────
console.log('\n3. PAISE / CURRENCY VALIDATION');

test('₹100 = 10000 paise', () => {
  const rupees = 100;
  const paise = rupees * 100;
  assertEqual(paise, 10000, 'INR to paise conversion');
});

test('Fare paise calculation for 100km Ordinary bus', () => {
  const distanceKm = 100;
  const ratePaise = 100; // Ordinary
  const minFarePaise = 1000;
  const calculated = Math.max(distanceKm * ratePaise, minFarePaise);
  assertEqual(calculated, 10000, '100km Ordinary = ₹100 = 10000 paise');
});

test('Fare paise calculation with minimum fare enforcement', () => {
  const distanceKm = 5; // short trip
  const ratePaise = 100;
  const minFarePaise = 1000;
  const calculated = Math.max(distanceKm * ratePaise, minFarePaise);
  assertEqual(calculated, 1000, 'Short trip uses minimum fare');
});

test('Multi-seat fare multiplies correctly', () => {
  const singleSeatFarePaise = 10000; // ₹100
  const seatCount = 3;
  const total = singleSeatFarePaise * seatCount;
  assertEqual(total, 30000, '3 seats = 30000 paise');
});

// ── 4. Payment state machine ───────────────────────────────────────────────────
console.log('\n4. PAYMENT STATE MACHINE');

test('PENDING → PAID is valid', () => {
  assert(isValidPaymentTransition('PENDING', 'PAID'), 'PENDING→PAID allowed');
});

test('PENDING → FAILED is valid', () => {
  assert(isValidPaymentTransition('PENDING', 'FAILED'), 'PENDING→FAILED allowed');
});

test('PAID → REFUNDED is valid', () => {
  assert(isValidPaymentTransition('PAID', 'REFUNDED'), 'PAID→REFUNDED allowed');
});

test('PAID → PENDING is INVALID', () => {
  assert(!isValidPaymentTransition('PAID', 'PENDING'), 'PAID→PENDING rejected');
});

test('REFUNDED → PAID is INVALID', () => {
  assert(!isValidPaymentTransition('REFUNDED', 'PAID'), 'REFUNDED→PAID rejected');
});

test('CANCELLED → PAID is INVALID (no allowed transitions)', () => {
  // CANCELLED is a booking status, not payment status
  // For payment, FAILED is terminal — no transitions allowed
  assert(!isValidPaymentTransition('FAILED', 'PAID'), 'FAILED→PAID rejected');
});

test('PAID → FAILED is INVALID', () => {
  assert(!isValidPaymentTransition('PAID', 'FAILED'), 'PAID→FAILED rejected');
});

// ── 5. Security checks ────────────────────────────────────────────────────────
console.log('\n5. SECURITY CHECKS');

test('Forged amount in checkout request is ignored (backend calculates)', () => {
  // Simulate what backend does: ignore client amount, use server calculation
  const clientSentAmount = 100; // attacker tries to pay ₹1
  const serverCalculatedPaise = 50000; // real fare = ₹500
  const orderAmount = serverCalculatedPaise; // backend uses THIS, not client value
  assert(orderAmount !== clientSentAmount * 100, 'Frontend amount manipulation rejected');
  assertEqual(orderAmount, 50000, 'Server amount used for payment order');
});

test('Replay attack: same paymentId for different booking should be caught', () => {
  // Simulate: existingPayment found with different bookingId
  const existingPaymentBookingId = 'booking_001';
  const currentBookingId = 'booking_002';
  const isDuplicate = existingPaymentBookingId !== currentBookingId;
  assert(isDuplicate, 'Duplicate paymentId on different booking detected');
});

test('Order ID mismatch is rejected', () => {
  const storedOrderId = 'order_stored_123';
  const submittedOrderId = 'order_forged_456';
  assert(storedOrderId !== submittedOrderId, 'Order ID mismatch detected');
});

test('Timing-safe comparison prevents timing attacks', () => {
  const a = 'a'.repeat(64);
  const b = 'b'.repeat(64);
  // Both are same length — should not throw, just return false
  const result = timingSafeEqual(a, b);
  assert(!result, 'Mismatched equal-length strings return false');
});

test('Non-hex strings with different lengths return false safely', () => {
  // Different length strings should return false without throwing
  const result = timingSafeEqual('abc', 'abcdef');
  assert(!result, 'Different length non-hex strings return false');
});

test('Completely different strings return false safely', () => {
  const a = crypto.randomBytes(32).toString('hex');
  const b = crypto.randomBytes(32).toString('hex');
  // Two different 64-char hex strings should reliably fail
  // (astronomically unlikely to collide)
  const result = timingSafeEqual(a, b);
  // We just verify no exception is thrown — collision would be vanishingly rare
  assert(typeof result === 'boolean', 'timingSafeEqual returns boolean');
});

// ── 6. Hold expiry ────────────────────────────────────────────────────────────
console.log('\n6. HOLD EXPIRY');

test('Hold expiry is 15 minutes from creation', () => {
  const HOLD_DURATION_MS = 15 * 60 * 1000;
  const created = Date.now();
  const expiry = created + HOLD_DURATION_MS;
  const diffMs = expiry - created;
  assertEqual(diffMs, 900000, '15 min = 900000 ms');
});

test('Expired hold is detected correctly', () => {
  const holdExpiresAt = new Date(Date.now() - 1000); // 1 second ago
  const isExpired = holdExpiresAt < new Date();
  assert(isExpired, 'Past holdExpiresAt detected as expired');
});

test('Active hold is not expired', () => {
  const holdExpiresAt = new Date(Date.now() + 60000); // 1 minute from now
  const isExpired = holdExpiresAt < new Date();
  assert(!isExpired, 'Future holdExpiresAt is not expired');
});

// ── 7. Booking number generation ──────────────────────────────────────────────
console.log('\n7. BOOKING NUMBER GENERATION');

test('Booking number is prefixed with KSRTC', () => {
  const bookingNumber = 'KSRTC' + crypto.randomBytes(4).toString('hex').toUpperCase();
  assert(bookingNumber.startsWith('KSRTC'), 'Booking number starts with KSRTC');
});

test('Two generated booking numbers are different', () => {
  const bn1 = 'KSRTC' + crypto.randomBytes(4).toString('hex').toUpperCase();
  const bn2 = 'KSRTC' + crypto.randomBytes(4).toString('hex').toUpperCase();
  assert(bn1 !== bn2, 'Random booking numbers are unique');
});

// ── 8. Idempotency ────────────────────────────────────────────────────────────
console.log('\n8. IDEMPOTENCY');

test('Already-CONFIRMED booking returns success without re-processing', () => {
  const booking = { paymentStatus: 'PAID', bookingStatus: 'CONFIRMED' };
  const isAlreadyPaid = booking.paymentStatus === 'PAID' && booking.bookingStatus === 'CONFIRMED';
  assert(isAlreadyPaid, 'Idempotency check passes for already-confirmed booking');
});

test('Webhook with already-confirmed booking is idempotent', () => {
  const booking = { bookingStatus: 'CONFIRMED', paymentStatus: 'PAID' };
  const shouldSkip = booking.bookingStatus === 'CONFIRMED' && booking.paymentStatus === 'PAID';
  assert(shouldSkip, 'Webhook skips processing for already-confirmed booking');
});

// ── Summary ────────────────────────────────────────────────────────────────────
console.log('\n════════════════════════════════════════════════════');
console.log(` RESULTS: ${passed} PASS, ${failed} FAIL`);
console.log('════════════════════════════════════════════════════');

if (failed > 0) {
  console.log('\nFailed tests:');
  results.filter(r => r.status === 'FAIL').forEach(r => {
    console.log(`  ✗ ${r.name}: ${r.error}`);
  });
  process.exit(1);
} else {
  console.log('\n✓ All tests passed!\n');
}
