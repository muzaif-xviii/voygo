/* search.js - flight/hotel/transport searches (connects to backend) */
async function searchFlights(criteria){
  const q = new URLSearchParams(criteria).toString();
  const res = await fetch(`/api/search/flights?${q}`);
  return res.json();
}
async function searchHotels(criteria){
  const q = new URLSearchParams(criteria).toString();
  const res = await fetch(`/api/search/hotels?${q}`);
  return res.json();
}
async function searchTransport(criteria){
  const q = new URLSearchParams(criteria).toString();
  const res = await fetch(`/api/search/transport?${q}`);
  return res.json();
}
