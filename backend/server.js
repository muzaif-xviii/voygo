import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import open from "open";
import { PORT, JWT_SECRET } from "./config.js";
import authRoutes from "./routes/auth.js";
import searchRoutes from "./routes/search.js";
import bookings from "./routes/bookings.js";
import planner from "./routes/planner.js";
import budget from "./routes/budget.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { path: "/socket.io" });

app.use(cors());
app.use(express.json());
app.use("/frontend", express.static(new URL("../frontend", import.meta.url).pathname));
app.use("/socket.io", express.static(new URL("../node_modules/socket.io/client-dist", import.meta.url).pathname));

app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/bookings", bookings);
app.use("/api/planner", planner);
app.use("/api/budget", budget);

app.use(express.static(new URL("../frontend", import.meta.url).pathname));
app.use("/socket.io", express.static(new URL("../node_modules/socket.io/client-dist", import.meta.url).pathname));

// Simple socket namespace for realtime
const rt = io.of("/realtime");
rt.on("connection", (socket) => {
  console.log("Realtime client connected", socket.id);
});

// serve index.html when visiting root URL
app.get("/", (req, res) => {
  res.sendFile(new URL("../frontend/index.html", import.meta.url).pathname);
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}/`;
  console.log(`🚀 VoyGo backend running on port ${PORT}`);
  console.log(`🌐 Opening ${url}`);
  open(url); // automatically open in browser
});

// Emit random price changes every 12s for demo
setInterval(() => {
  const sample = [
    { type: "flight", id: "AI-101", price: Math.floor(4000 + Math.random() * 4000) },
    { type: "hotel", id: "Hotel-A", price: Math.floor(2000 + Math.random() * 3000) },
  ];
  sample.forEach((s) => rt.emit("price_update", s));
}, 12000);
