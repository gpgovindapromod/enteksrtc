import jwt from "jsonwebtoken";
import User from "../database/models/User.js";
export const SERVER_RUNTIME_ID = Date.now().toString();

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
        
        if (decoded.runtimeId !== SERVER_RUNTIME_ID) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, session expired due to server restart."
            });
        }

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
            role: user.role || "passenger",
            email: user.email,
            depotId: user.depotId ? user.depotId.toString() : null
        };
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, token invalid."
        });
    }
};

export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: insufficient permissions."
            });
        }
        next();
    };
};

export const checkDepotAssignment = (req, res, next) => {
    if (!req.user || !req.user.depotId) {
        return res.status(403).json({
            success: false,
            message: "Forbidden: No depot assigned to this account."
        });
    }
    next();
};

export default { protect, requireRole, checkDepotAssignment };