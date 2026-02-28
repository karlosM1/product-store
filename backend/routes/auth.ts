import express, { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { protect } from "../middleware/auth.js";
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayLoad;
    }
  }
}

const router = express.Router();

interface UserLoginBody {
  email: string;
  password: string;
}

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}
interface JWTPayLoad {
  id: number;
}

const cookieOptions: express.CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const generateToken = (id: number): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

router.post(
  "/register",
  async (
    req: Request<{}, {}, RegisterBody>,
    res: Response,
  ): Promise<Response> => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword],
    );

    const user = newUser.rows[0];

    const token = generateToken(user.id);
    res.cookie("token", token, cookieOptions);

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  },
);

router.post(
  "/login",
  async (
    req: Request<{}, {}, UserLoginBody>,
    res: Response,
  ): Promise<Response> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "All fields are required",
        });
      }

      const result = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      if (result.rows.length === 0) {
        return res.status(400).json({
          message: "Invalid credentials",
        });
      }

      const user = result.rows[0];

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          message: "Invalid credentials",
        });
      }

      const token = generateToken(user.id);
      res.cookie("token", token, cookieOptions);

      return res.json({
        id: user.id,
        username: user.username,
        email: user.email,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

router.get("/me", protect, async (req: Request, res: Response) => {
  return res.json(req.user);
});

router.post("/logout", (req: Request, res: Response) => {
  res.cookie("token", "", { ...cookieOptions, maxAge: 1 });
  res.json({ message: "Logged out successfully" });
});

export default router;
