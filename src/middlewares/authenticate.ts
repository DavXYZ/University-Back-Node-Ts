// src/middlewares/authenticate.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_ACCESS_SECRET || "yourSecretKey";

export const authenticateAccess = (req: Request, res: Response, next: NextFunction): any => {

  const {accessToken} = req.cookies; // Bearer accessToken

  if (!accessToken) {
    return res.status(401).json({ message: "No accessToken provided" });
  }

  jwt.verify(accessToken, SECRET_KEY, (err: any, decoded: Express.User | undefined) => {
    if (err) {
      return res.status(403).json({ message: "Failed to authenticate accessToken" });
    }
    req.user = decoded;
    next();
  });
};
