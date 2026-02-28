import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import type { NextFunction, Request, Response } from "express";

export interface User {
  id: number;
  name: string;
  email: string;
}

interface JwtPayload {
  id: number;
}
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
    };
    const user = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [decoded.id],
    );

    if (!user.rows.length) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }
    req.user = user.rows[0];
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Not authorized" });
  }
};
