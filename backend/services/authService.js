import jwt from "jsonwebtoken";
import User from "../database/models/User.js";

const normalizeEmail = (value) => (value ? String(value).trim().toLowerCase() : "");

const splitName = (value) => {
    const name = String(value || "").trim().replace(/\s+/g, " ");

    if (!name) {
        return { firstName: "", lastName: "", fullName: "" };
    }

    const [firstName, ...rest] = name.split(" ");
    const lastName = rest.join(" ");

    return {
        firstName,
        lastName,
        fullName: name
    };
};

const buildUserPayload = (user) => {
    if (typeof user.toSafeJSON === "function") {
        return user.toSafeJSON();
    }

    const plain = user.toObject ? user.toObject() : { ...user };
    delete plain.password;
    return plain;
};

const signToken = (user) =>
    jwt.sign(
        {
            sub: user._id.toString(),
            role: user.role || "USER",
            email: user.email
        },
        process.env.JWT_SECRET || "dev-secret",
        { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

export const registerUser = async (payload = {}) => {
    const email = normalizeEmail(payload.email);
    const password = payload.password;

    if (!email || !password) {
        const error = new Error("Email and password are required.");
        error.statusCode = 400;
        throw error;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        const error = new Error("A user with this email already exists.");
        error.statusCode = 409;
        throw error;
    }

    const nameSource = payload.fullName || payload.name || payload.firstName || "";
    const parsedName = splitName(nameSource);
    const firstName = String(payload.firstName || parsedName.firstName || "").trim();
    const lastName = String(payload.lastName || parsedName.lastName || "").trim();

    if (!firstName) {
        const error = new Error("Name is required.");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.create({
        role: payload.role || "USER",
        depotId: payload.depotId || undefined,
        fullName: payload.fullName || parsedName.fullName || `${firstName} ${lastName}`.trim(),
        firstName,
        lastName: lastName || undefined,
        email,
        phone: payload.phone || undefined,
        password,
        age: payload.age || undefined,
        employeeId: payload.employeeId || undefined,
        gender: payload.gender || undefined,
        dob: payload.dob || payload.dateOfBirth || undefined,
        profileImage: payload.profileImage || undefined,
        isVerified: payload.isVerified ?? false,
        isActive: payload.isActive ?? true
    });

    return {
        user: buildUserPayload(user),
        token: signToken(user)
    };
};

export const loginUser = async (payload = {}) => {
    const email = normalizeEmail(payload.email);
    const password = payload.password;

    if (!email || !password) {
        const error = new Error("Email and password are required.");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    if (!user.isActive) {
        const error = new Error("This account is inactive.");
        error.statusCode = 403;
        throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        const error = new Error("Invalid email or password.");
        error.statusCode = 401;
        throw error;
    }

    return {
        user: buildUserPayload(user),
        token: signToken(user)
    };
};

export const getCurrentUser = async (userId) => {
    if (!userId) {
        const error = new Error("User ID is required.");
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findById(userId);

    if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
    }

    return buildUserPayload(user);
};
