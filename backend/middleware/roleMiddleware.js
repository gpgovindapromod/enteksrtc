export const allowRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;

        if (!userRole) {
            return res.status(401).json({
                success: false,
                message: "Not authorized."
            });
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden, insufficient role."
            });
        }

        next();
    };
};

export default allowRoles;