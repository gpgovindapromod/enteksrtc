import twilio from "twilio";
import crypto from "crypto";

// In-memory store: { "phone": { otp: "123456", expiresAt: 1620000000000 } }
const otpStore = new Map();

// Helper to clean phone numbers (e.g., +91 9876543210 -> +919876543210)
const cleanPhone = (phone) => phone.replace(/\s+/g, "");

// Generate a random 6-digit OTP
const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

export const generateAndSendOtp = async (phone) => {
    if (!phone) {
        const error = new Error("Phone number is required");
        error.statusCode = 400;
        throw error;
    }

    const cleanNumber = cleanPhone(phone);
    const otp = generateOtp();
    
    // OTP expires in 5 minutes
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otpStore.set(cleanNumber, { otp, expiresAt });

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && twilioPhone) {
        try {
            const client = twilio(accountSid, authToken);
            await client.messages.create({
                body: `Your Ente KSRTC verification code is ${otp}. It expires in 5 minutes.`,
                from: twilioPhone,
                to: cleanNumber
            });
            console.log(`[OTP Sent via Twilio] to ${cleanNumber}`);
        } catch (error) {
            console.error("Twilio Error:", error.message || error);
            console.warn(`[OTP Fallback] Twilio failed. OTP for ${cleanNumber} is: ${otp}`);
        }
    } else {
        // Fallback for development/testing if Twilio is not configured
        console.warn(`[OTP Fallback] Twilio not configured. OTP for ${cleanNumber} is: ${otp}`);
    }

    return true;
};

export const verifyOtp = (phone, providedOtp, { markAsVerified = false, deleteAfterVerify = true } = {}) => {
    if (!phone || !providedOtp) return false;

    const cleanNumber = cleanPhone(phone);
    const record = otpStore.get(cleanNumber);

    if (!record) {
        return false;
    }

    if (Date.now() > record.expiresAt) {
        otpStore.delete(cleanNumber);
        return false;
    }

    if (record.verified) {
        if (deleteAfterVerify) {
            otpStore.delete(cleanNumber);
        }
        return true;
    }

    if (record.otp === providedOtp) {
        if (markAsVerified) {
            record.verified = true;
            otpStore.set(cleanNumber, record);
        }
        if (deleteAfterVerify && !markAsVerified) {
            otpStore.delete(cleanNumber);
        }
        return true;
    }

    return false;
};
