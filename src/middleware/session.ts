// middleware/session.ts
import { RequestHandler } from "express";
import { $session } from "../service.ts/session";
import { Admin } from "../generated/prisma/client";

// extend express Request type to include admin
declare global {
    namespace Express {
        interface Request {
            admin?: Admin;
        }
    }
}

export const SESSION_MIDDLEWARE: RequestHandler = async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        console.log("TOKEN:", token); 

        if (!token) {
            return next();
        }

        const admin = await $session.getUserFromToken(token);
        console.log("ADMIN:", admin); 
        req.admin = admin;

        return next();
    } catch (err) {
        console.error("SESSION_MIDDLEWARE ERROR:", err);
        return next();
    }
};