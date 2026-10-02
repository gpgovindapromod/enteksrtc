import twilio from "twilio";
import crypto from "crypto";

// In-memory store: { "phone": { otp: "123456", expiresAt: 1620000000000 } }
const otpStore = new Map();

// Normalize Indian mobile numbers to E.164. International numbers must already
// include a country code, for example +14155552671.
export const cleanPhone = (phone) => {
    const value = String(phone || "").trim().replace(/[\s()-]/g, "");

    if (/^\d{10}$/.test(value)) {
        return `+91${value}`;
    }

    if (/^\+\d{8,15}$/.test(value)) {
        return value;
    }

    const error = new Error("Enter a valid mobile number with country code.");
    error.statusCode = 400;
    throw error;
};

// Generate a random 6-digit OTP
const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

export const generateAndSendOtp = async (phone) => {
    const cleanNumber = cleanPhone(phone);
    const otp = generateOtp();

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhone) {
        const error = new Error("OTP service is not configured. Contact support.");
        error.statusCode = 503;
        throw error;
    }

    try {
        const client = twilio(accountSid, authToken);
        await client.messages.create({
            body: `Your Ente KSRTC verification code is ${otp}. It expires in 5 minutes.`,
            from: twilioPhone,
            to: cleanNumber
        });
    } catch (error) {
        console.error("Twilio OTP delivery failed:", error.message || error);
        const deliveryError = new Error("Unable to send OTP. Please try again.");
        deliveryError.statusCode = 502;
        throw deliveryError;
    }

    // Only make an OTP valid after the SMS provider confirms the message.
    otpStore.set(cleanNumber, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000,
        attempts: 0
    });

    return { phone: cleanNumber };
};

export const verifyOtp = (phone, providedOtp, { markAsVerified = false, deleteAfterVerify = true } = {}) => {
    if (!phone || !providedOtp) return false;

    let cleanNumber;
    try {
        cleanNumber = cleanPhone(phone);
    } catch {
        return false;
    }
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

    if (record.otp === String(providedOtp).trim()) {
        if (markAsVerified) {
            record.verified = true;
            otpStore.set(cleanNumber, record);
        }
        if (deleteAfterVerify && !markAsVerified) {
            otpStore.delete(cleanNumber);
        }
        return true;
    }

    record.attempts = (record.attempts || 0) + 1;
    if (record.attempts >= 3) {
        otpStore.delete(cleanNumber); // Max attempts reached, invalidate OTP
    } else {
        otpStore.set(cleanNumber, record);
    }

    return false;
};

export const setVerifiedOtp = (phone, otp) => {
    const cleanNumber = cleanPhone(phone);
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins
    otpStore.set(cleanNumber, { otp, expiresAt, verified: true });
};
