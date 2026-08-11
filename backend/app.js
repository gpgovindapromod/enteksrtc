import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import notFoundMiddleware from "./middleware/notFoundMiddleware.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

const configuredOrigins = (process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const defaultAllowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const allowedOrigins = configuredOrigins.length ? configuredOrigins : defaultAllowedOrigins;

const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const privateNetworkPattern =
    /^https?:\/\/(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

const isOriginAllowed = (origin) => {
    if (!origin) return true;
    if (allowedOrigins.includes("*")) return true;
    if (allowedOrigins.includes(origin)) return true;
    if (localhostPattern.test(origin)) return true;

    if (process.env.NODE_ENV !== "production" && privateNetworkPattern.test(origin)) {
        return true;
    }

    return false;
};

app.use(
    cors({
        credentials: true,
        origin(origin, callback) {
            if (isOriginAllowed(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error("CORS origin not allowed."));
        }
    })
);

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Ente KSRTC Backend Running"
    });
});

app.use("/api/auth", authRoutes);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export default app;