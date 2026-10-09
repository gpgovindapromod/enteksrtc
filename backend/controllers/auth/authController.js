import {
    getCurrentUser,
    loginUser,
    registerUser,
    updateUser,
    resetPassword as resetPasswordService
} from "../../services/authService.js";
import { verifyFirebaseIdToken } from "../../services/firebaseAdmin.js";

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

export const updateProfile = async (req, res, next) => {
    try {
        const user = await updateUser(req.user.id, req.body);
        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user
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
    res.clearCookie("token");
    res.status(200).json({
        success: true,
        message: "Logged out successfully."
    });
};

export const verifyOtpStep = async (req, res, next) => {
    try {
        const { idToken } = req.body;
        const decodedToken = await verifyFirebaseIdToken(idToken);

        if (!decodedToken.phone_number) {
            return res.status(401).json({
                success: false,
                message: "The Firebase account is not linked to a phone number."
            });
        }

        res.status(200).json({
            success: true,
            message: "Phone number verified successfully.",
            phone: decodedToken.phone_number
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const result = await resetPasswordService(req.body);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export default {
    register,
    login,
    me,
    logout,
    verifyOtpStep,
    updateProfile,
    resetPassword
};