import express from "express";
import db from "../db.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

const router = express.Router();

function auth(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: "Missing token" });
  const token = h.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

router.post("/", auth, async (req, res) => {
  try {
    const { target } = req.body;
    const dbConn = await db;
    const result = await dbConn.run(
      "INSERT INTO budgets (user_id, target, saved) VALUES (?, ?, ?)",
      [req.user.id, target, 0]
    );
    res.json({ ok: true, id: result.lastID, target });
  } catch (err) {
    console.error("Budget insert error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const dbConn = await db;
    const row = await dbConn.get(
      "SELECT * FROM budgets WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(row || {});
  } catch (err) {
    console.error("Budget fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
