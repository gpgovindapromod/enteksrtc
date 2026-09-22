import { z } from 'zod';

export const registerSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    otp: z.string().min(6, "OTP is required"),
    role: z.string().optional(),
    fullName: z.string().optional()
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required")
});

export const sendOtpSchema = z.object({
    phone: z.string().min(10, "Phone number must be at least 10 characters")
});

export const verifyOtpSchema = z.object({
    phone: z.string().min(10, "Phone number is required"),
    otp: z.string().min(1, "OTP is required")
});
