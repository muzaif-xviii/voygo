import express from "express";
const router = express.Router();

// Demo flight data
router.get("/flights", async (req, res) => {
  const { from = "DEL", to = "BOM", depart } = req.query;
  const airlines = ["AirBlue", "SkyJet", "IndusWings", "NimbusAir"];
  const out = airlines.map((name, i) => ({
    airline: name,
    flight_no: name.slice(0, 2).toUpperCase() + (100 + i),
    from,
    to,
    depart,
    duration: `${2 + i}h ${10 + i * 5}m`,
    price: Math.floor(3000 + Math.random() * 8000),
  }));
  res.json(out);
});

// Demo hotel data
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

// Demo transport data
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
