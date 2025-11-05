import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    let token = req.headers.authorization;
    if (token && token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(401).json({ message: "Not authorized - invalid or expired token" });
        }
    } else {
        return res.status(401).json({ message: "Not authorized - no token provided" });
    }
};

export const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden - insufficient role" });
    }
    next();
};
