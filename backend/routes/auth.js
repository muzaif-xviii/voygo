import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dbPromise from "../db.js";
import { JWT_SECRET } from "../config.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await dbPromise;
    const row = await db.get("SELECT * FROM users WHERE email = ?", [email]);

    if (!row) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, row.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: row.id, email: row.email, role: row.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ include user info along with the token
    res.json({
      token,
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        premium: row.premium,
        role: row.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const db = await dbPromise;

    const hashed = await bcrypt.hash(password, 10);
    await db.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashed]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
