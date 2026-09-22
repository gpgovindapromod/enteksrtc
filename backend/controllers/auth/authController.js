import {
    getCurrentUser,
    loginUser,
    registerUser
} from "../../services/authService.js";
import { generateAndSendOtp, setVerifiedOtp } from "../../services/otpService.js";
import crypto from "crypto";

const setAuthCookie = (res, token) => {
    res.cookie("jwt", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

export const register = async (req, res, next) => {
    try {
        const result = await registerUser(req.body);
        setAuthCookie(res, result.token);

        res.status(201).json({
            success: true,
            message: "User registered successfully.",
            token: result.token,
            user: result.user
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const result = await loginUser(req.body);
        setAuthCookie(res, result.token);

        res.status(200).json({
            success: true,
            message: "Login successful.",
            token: result.token,
            user: result.user
        });
    } catch (error) {
        next(error);
    }
};

export const me = async (req, res, next) => {
    try {
        const user = await getCurrentUser(req.user.id);

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res) => {
    res.clearCookie("jwt");
    res.status(200).json({
        success: true,
        message: "Logged out successfully."
    });
};

export const sendOtp = async (req, res, next) => {
    try {
        const { phone } = req.body;
        await generateAndSendOtp(phone);
        res.status(200).json({
            success: true,
            message: "OTP sent successfully."
        });
    } catch (error) {
        next(error);
    }
};

export const verifyOtpStep = async (req, res, next) => {
    try {
        const { phone, otp } = req.body;
        const { verifyOtp } = await import("../services/otpService.js");
        
        if (!phone || !otp) {
            return res.status(400).json({ success: false, message: "Phone and OTP are required." });
        }

        const isValid = verifyOtp(phone, otp, { markAsVerified: true, deleteAfterVerify: false });
        if (!isValid) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
        }

        res.status(200).json({ success: true, message: "OTP verified successfully." });
    } catch (error) {
        next(error);
    }
};

export const verifyPhoneEmailUrl = async (req, res, next) => {
    try {
        const { user_json_url } = req.body;
        if (!user_json_url) {
            return res.status(400).json({ success: false, message: "user_json_url is required." });
        }
        
        const response = await fetch(user_json_url);
        if (!response.ok) {
            return res.status(400).json({ success: false, message: "Failed to fetch from phone.email" });
        }
        
        const data = await response.json();
        
        const countryCode = data.user_country_code || "";
        const phoneNumber = data.user_phone_number || "";
        const phone = countryCode + phoneNumber;

        if (!phoneNumber) {
            return res.status(400).json({ success: false, message: "Phone number not found in response." });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        setVerifiedOtp(phone, otp);

        res.status(200).json({
            success: true,
            phone,
            otp
        });
    } catch (error) {
        next(error);
    }
};

export default {
    register,
    login,
    me,
    logout,
    sendOtp,
    verifyOtpStep,
    verifyPhoneEmailUrl
};