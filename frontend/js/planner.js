/* planner.js - AI planner stub */
async function createPlan(planDetails){
  const res = await fetch('/api/planner/create', {
    method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(planDetails)
  });
  return res.json();
}
async function confirmAutoBook(planId){
  // ask user for permission in UI before calling
  const res = await fetch(`/api/planner/execute/${planId}`, { method:'POST', headers:{'Authorization':'Bearer '+getToken()}});
  return res.json();
}
