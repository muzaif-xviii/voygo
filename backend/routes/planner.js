import express from "express";
import db from "../db.js";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { JWT_SECRET } from "../config.js";

dotenv.config();
const router = express.Router();

// ✅ Helper to calculate days
function calcTripDays(start, end) {
  try {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.max((e - s) / (1000 * 60 * 60 * 24) + 1, 1);
    return Math.round(diff);
  } catch {
    return 3;
  }
}

// ✅ AI Planner (Gemini)
router.post("/create", async (req, res) => {
  const h = req.headers.authorization;
  let userId = 0;

  if (h) {
    try {
      userId = jwt.verify(h.split(" ")[1], JWT_SECRET).id;
    } catch {
      userId = 0;
    }
  }

  const { destination = "Unknown", start, end, budget } = req.body;
  const days = start && end ? calcTripDays(start, end) : 3;

  const prompt = `
You are VoyGo, an AI travel planner assistant.
Create a detailed ${days}-day itinerary for ${destination}, India.
Include:
• Day-by-day schedule with morning/afternoon/evening ideas.
• Local food suggestions, transport tips, and approximate daily cost considering the total trip budget as - (₹${budget || "flexible"}).
• Finish with a short overall summary and estimated total trip cost.
Respond in clear English text with section headings.
`;

  try {
    const geminiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.OPENAI_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    // ✅ Parse safely
    let data;
    try {
      const raw = await geminiResponse.text();
      data = JSON.parse(raw);
    } catch (err) {
      console.error("❌ Failed to parse Gemini JSON:", err);
      return res.status(500).json({
        error: "Gemini returned invalid JSON",
      });
    }

    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't create a plan right now.";

    // ✅ Save in database
    const dbConn = await db;
    const result = await dbConn.run(
      "INSERT INTO plans (user_id, name, plan_json) VALUES (?, ?, ?)",
      [userId, `Plan for ${destination}`, JSON.stringify({ plan: aiText })]
    );

    res.json({ planId: result.lastID, plan: aiText });
  } catch (err) {
    console.error("AI Planner error:", err);
    res.status(500).json({ error: "AI Planner failed." });
  }
});

// ✅ Execute plan (demo)
router.post("/execute/:id", async (req, res) => {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: "Login required" });

  let uid;
  try {
    uid = jwt.verify(h.split(" ")[1], JWT_SECRET).id;
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    const dbConn = await db;
    const row = await dbConn.get(
      "SELECT * FROM plans WHERE id=? AND user_id = ?",
      [req.params.id, uid]
    );
    if (!row) return res.status(404).json({ error: "Plan not found" });

    res.json({
      message: "Execution requested. VoyGo will ask for approval before booking.",
    });
  } catch (err) {
    console.error("Planner execute error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
