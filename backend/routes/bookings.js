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
    const p = jwt.verify(token, JWT_SECRET);
    req.user = p;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

router.post("/", auth, async (req, res) => {
  try {
    const { type, item, price, details } = req.body;
    const dbConn = await db;
    const result = await dbConn.run(
      "INSERT INTO bookings (user_id, type, item, price, details) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, type, item, price, JSON.stringify(details || {})]
    );
    res.json({ ok: true, id: result.lastID });
  } catch (err) {
    console.error("Booking insert error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/mine", auth, async (req, res) => {
  try {
    const dbConn = await db;
    const rows = await dbConn.all(
      "SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    const data = rows.map((r) => ({
      id: r.id,
      type: r.type,
      item: r.item,
      price: r.price,
      details: JSON.parse(r.details),
    }));
    res.json(data);
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
