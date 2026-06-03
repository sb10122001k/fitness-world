// middleware/auth.ts
import { RequestHandler } from "express";

export const CAN_MANAGE_USER: RequestHandler = (req: any, res, next) => {
    const adminId = req.params.adminId;

    if (!req.admin) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.admin.id !== adminId) {
        return res.status(403).json({ message: "Forbidden" });
    }

    return next();
};