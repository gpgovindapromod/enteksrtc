import jwt from "jsonwebtoken";
import User from "../database/models/User.js";

export const protect = async (req, res, next) => {
    try {
        const header = req.headers.authorization || "";
        const bearerToken = header.startsWith("Bearer ") ? header.slice(7) : null;
        const token = bearerToken || req.cookies?.jwt || req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, token missing."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
        const userId = decoded.sub || decoded.id;
        const user = await User.findById(userId);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, user not found."
            });
        }

        req.user = {
            id: user._id.toString(),
            role: user.role || "USER",
            email: user.email
        };
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, token invalid."
        });
    }
};

export default protect;