import { z } from 'zod';

export const registerSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    firebaseIdToken: z.string().min(1, "Firebase ID token is required"),
    role: z.string().optional(),
    fullName: z.string().optional()
}).refine((data) => data.firstName || data.fullName, {
    message: "Name is required",
    path: ["fullName"]
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required")
});

export const verifyOtpSchema = z.object({
    idToken: z.string().min(1, "Firebase ID token is required")
});
