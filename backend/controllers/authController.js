import {
    getCurrentUser,
    loginUser,
    registerUser
} from "../services/authService.js";

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

export default {
    register,
    login,
    me,
    logout
};