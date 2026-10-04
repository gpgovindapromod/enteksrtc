import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./database/db.js";
import { cleanupExpiredHolds } from "./controllers/booking/bookingController.js";
import { activeGateway } from "./services/paymentService.js";

const PORT = process.env.PORT || 5011;

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Payment gateway: ${activeGateway}`);

    // ── Scheduled hold cleanup ─────────────────────────────────────────────
    // Runs every 5 minutes to mark expired PENDING bookings as FAILED.
    // This frees up seats for other passengers without waiting for payment verification.
    // Payment provider verification remains the authoritative source for payment status.
    const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
    setInterval(async () => {
        try {
            await cleanupExpiredHolds(null, null);
        } catch (err) {
            console.error('[Server] Hold cleanup error:', err.message);
        }
    }, CLEANUP_INTERVAL_MS);

    console.log(`Hold cleanup scheduled every ${CLEANUP_INTERVAL_MS / 60000} minutes`);
});