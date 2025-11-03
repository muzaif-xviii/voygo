/* bookings.js - create and manage bookings */
async function createBooking(payload){
  const res = await fetch('/api/bookings', {
    method:'POST',
    headers:{'Content-Type':'application/json', 'Authorization':'Bearer '+ getToken()},
    body: JSON.stringify(payload)
  });
  return res.json();
}
async function getMyBookings(){
  return fetchJSON('/api/bookings/mine');
}
