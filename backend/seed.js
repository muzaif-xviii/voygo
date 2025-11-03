import bcrypt from "bcrypt";
import dbPromise from "./db.js";

async function seed() {
  const db = await dbPromise;

  console.log("✅ Database initialized successfully");

  try {
    // Check if demo user already exists
    const existing = await db.get("SELECT * FROM users WHERE email = ?", [
      "demo@voygo.test",
    ]);

    if (existing) {
      console.log("Demo user already exists.");
      return;
    }

    // Hash password
    const pass = await bcrypt.hash("pass123", 10);

    // Insert demo user
    await db.run(
      "INSERT INTO users (name, email, password, premium) VALUES (?, ?, ?, ?)",
      ["Demo User", "demo@voygo.test", pass, 1]
    );

    console.log("✨ Demo user created: demo@voygo.test / pass123");
  } catch (e) {
    console.error("❌ Seeding error:", e);
  }
}

seed();
