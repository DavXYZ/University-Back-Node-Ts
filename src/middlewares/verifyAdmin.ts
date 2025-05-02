import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_ACCESS_SECRET || "yourSecretKey";
export const verifyAdmin = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = req.cookies.token;
        if (!token)  res.status(401).json({ message: "Unauthorized" });

        const decoded: any = jwt.verify(token, SECRET_KEY);
        if (decoded.role !== "admin")  res.status(403).json({ message: "Forbidden" });

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized" });
    }
};
