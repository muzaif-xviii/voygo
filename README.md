# 🧭 VoyGo — AI Travel & Budget Planner

VoyGo is a simple full-stack travel planning demo built with **Node.js + Express + SQLite** and a plain **HTML/CSS/JS frontend**.

## Features:
- Login & Signup (JWT auth and BREVO API)
- AI Trip Planner (Google Gemini)
- Budget Tracker
- Real-time flight/hotel price simulation

## Stack
- Backend:  Node.js, Express, SQLite
- Frontend: HTML, CSS, JS
- AI:       Google Gemini API

## Requirements
- Node.js 18+ recommended
- npm

## Install & run
1. Copy the `frontend/` and `backend/` folders into a project folder (this repo layout).
2. In terminal:
```bash
cd backend
npm install
cp ../.env.example .env   # edit values if you wish
npm run seed
npm start
