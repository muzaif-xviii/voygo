import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dbPromise from "../db.js";
import { JWT_SECRET } from "../config.js";
import dotenv from "dotenv";
import Brevo from "@getbrevo/brevo";

dotenv.config();

const router = express.Router();

// Initialize Brevo client
const brevo = new Brevo.TransactionalEmailsApi();
brevo.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

const OTP_STORE = new Map(); // Temporary in-memory store

// 🧠 Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await dbPromise;
    const row = await db.get("SELECT * FROM users WHERE email = ?", [email]);

    if (!row) return res.status(401).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(password, row.password);
    if (!match) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { id: row.id, email: row.email, role: row.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: row.id,
        name: row.name,
        email: row.email,
        premium: row.premium,
        role: row.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 📨 Step 1: Send OTP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const db = await dbPromise;

    const exists = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (exists) return res.status(400).json({ error: "Email already exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    OTP_STORE.set(email, { otp, name, password, createdAt: Date.now() });

    const emailData = {
      sender: { email: process.env.BREVO_FROM_EMAIL, name: "VoyGo Verification" },
      to: [{ email }],
      subject: "Your VoyGo verification code",
      htmlContent: `
        <h2>Welcome to VoyGo 🌍</h2>
        <p>Hi ${name || "traveler"},</p>
        <p>Your OTP for VoyGo signup is:</p>
        <h1 style="letter-spacing:4px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p style="color:gray;">If you didn’t request this, please ignore this email.</p>
      `,
    };

    await brevo.sendTransacEmail(emailData);
    console.log("✅ OTP sent to", email);

    res.json({ success: true, message: "OTP sent to email" });

    // auto-expire OTP after 10 minutes
    setTimeout(() => OTP_STORE.delete(email), 10 * 60 * 1000);
  } catch (err) {
    console.error("Signup OTP error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// ✅ Step 2: Verify OTP and create account
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = OTP_STORE.get(email);

    if (!record) return res.status(400).json({ error: "No OTP found for this email" });
    if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (Date.now() - record.createdAt > 10 * 60 * 1000)
      return res.status(400).json({ error: "OTP expired" });

    const db = await dbPromise;
    const hashed = await bcrypt.hash(record.password, 10);
    await db.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [record.name, email, hashed]
    );

    OTP_STORE.delete(email);
    res.json({ success: true, message: "Account created successfully!" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
