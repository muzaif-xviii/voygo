import express from "express";
import Amadeus from "amadeus";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const airportData = JSON.parse(fs.readFileSync("./data/airports.json", "utf8"));

// ✅ initialize Amadeus with .env values
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
});

// 🌍 Airport autocomplete (for text like “London” → “LHR”)
router.get("/airports", async (req, res) => {
  const { keyword } = req.query;
  if (!keyword) return res.status(400).json({ error: "Missing keyword" });

  try {
    // 1️⃣ Try Amadeus first
    const response = await amadeus.referenceData.locations.get({
      keyword,
      subType: "AIRPORT",
    });
    if (response.data && response.data.length > 0) {
      const results = response.data.map(a => ({
        name: a.name,
        iataCode: a.iataCode,
        city: a.address?.cityName,
        country: a.address?.countryName,
      }));
      return res.json(results);
    }
  } catch (err) {
    console.warn("⚠️ Amadeus lookup failed, falling back to local data.");
  }

  // 2️⃣ Local offline fallback search
  const q = keyword.toLowerCase();
  const results = Object.values(airportData)
    .filter(a =>
      a.name?.toLowerCase().includes(q) ||
      a.city?.toLowerCase().includes(q) ||
      a.country?.toLowerCase().includes(q) ||
      a.iata?.toLowerCase().includes(q)
    )
    .slice(0, 10)
    .map(a => ({
      name: a.name,
      iataCode: a.iata,
      city: a.city,
      country: a.country,
    }));

  res.json(results);
});

// 🛫 Flight search (supports round-trip)
router.get("/flights", async (req, res) => {
  const { from, to, depart, returnDate } = req.query;
  if (!from || !to || !depart)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    const query = {
      originLocationCode: from.toUpperCase(),
      destinationLocationCode: to.toUpperCase(),
      departureDate: depart,
      adults: 1,
      max: 5,
    };

    if (returnDate) query.returnDate = returnDate;

    const response = await amadeus.shopping.flightOffersSearch.get(query);

    const flights = response.data.map((f) => ({
      airline: f.validatingAirlineCodes?.[0] || "Unknown Airline",
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      duration: f.itineraries[0].duration.replace("PT", "").toLowerCase(),
      price: `₹${f.price.total}`,
    }));

    res.json(flights);
  }    catch (err) {
      // 🛑 Handle specific Amadeus bad requests
      if (err.response?.statusCode === 400) {
        console.warn("⚠️ Amadeus rejected a bad request (400). Probably missing or invalid params.");
        return res.json([]); // Don’t crash app, just return empty list
      }

      console.error("Amadeus API error:", err.response?.data || err);
      res.status(500).json({ error: "Failed to fetch flights" });
    }
});  
    

// 🏨 Hotels (demo data for now)
router.get("/hotels", async (req, res) => {
  const { city = "Mumbai" } = req.query;
  const hotels = ["Hotel Azure", "SeaView Suites", "City Lights Hotel", "ComfyStay"];
  const out = hotels.map((name, i) => ({
    name,
    stars: 3 + (i % 2),
    location: city,
    price: Math.floor(2000 + Math.random() * 5000),
  }));
  res.json(out);
});

// 🚕 Transport (demo data)
router.get("/transport", async (req, res) => {
  const { city = "Mumbai" } = req.query;
  const out = [
    { provider: "QuickCab", type: "Sedan", price: Math.floor(400 + Math.random() * 400) },
    { provider: "LocalTaxi", type: "Hatchback", price: Math.floor(200 + Math.random() * 200) },
    { provider: "AirportShuttle", type: "Shuttle", price: Math.floor(600 + Math.random() * 300) },
  ];
  res.json(out);
});

export default router;
