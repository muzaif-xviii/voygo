import dotenv from "dotenv";
dotenv.config();

export const DB_FILE = process.env.DB_FILE || "voygo.db";
export const PORT = process.env.PORT || 4000;
export const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
export const OPENAI_KEY = process.env.OPENAI_KEY || "";
export const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;
export const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET;