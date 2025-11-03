/* main.js - common helpers for pages */
const API = (path) => `/api${path}`;

function showToast(msg, type = 'info') {
  const t = document.createElement('div');
  t.style.position = 'fixed';
  t.style.right = '20px';
  t.style.bottom = '20px';
  t.style.padding = '12px 16px';
  t.style.borderRadius = '10px';
  t.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
  t.style.background = type === 'error' ? '#ffefef' : '#e8f3ff';
  t.style.color = '#07243a';
  t.style.fontWeight = '500';
  t.style.transition = 'opacity 0.6s ease';
  t.textContent = msg;
  document.body.appendChild(t);

  // stay visible for 5s, then fade out over 0.6s
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 600);
  }, 5000);
}


function getToken(){ return localStorage.getItem('voygo_token'); }
function setToken(t){ localStorage.setItem('voygo_token', t); }
function clearSession(){ localStorage.removeItem('voygo_token'); localStorage.removeItem('voygo_user'); }
async function fetchJSON(url, opts={}){
  opts.headers = opts.headers || {};
  if(getToken()) opts.headers['Authorization'] = 'Bearer ' + getToken();
  const res = await fetch(url, opts);
  if(res.status===401){ clearSession(); window.location='/frontend/login.html'; throw new Error('Unauthorized');}
  return res.json();
}

function updateNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const userData = localStorage.getItem('voygo_user');
  nav.innerHTML = '';

  if (userData) {
    const u = JSON.parse(userData);
    nav.innerHTML = `
      <a href="flights.html" class="btn ghost">Flights</a>
      <a href="hotels.html" class="btn ghost">Hotels</a>
      <a href="transport.html" class="btn ghost">Transport</a>
      <a href="planner.html" class="btn ghost">Planner</a>
      <a href="budget.html" class="btn ghost">Budget</a>
      <a href="profile.html" class="btn ghost">${u.name}</a>
      <button class="btn" onclick="clearSession(); location='login.html'">Logout</button>
    `;
  } else {
    nav.innerHTML = `
      <a href="flights.html" class="btn ghost">Flights</a>
      <a href="hotels.html" class="btn ghost">Hotels</a>
      <a href="transport.html" class="btn ghost">Transport</a>
      <a href="login.html" class="btn">Login</a>
      <a href="signup.html" class="btn ghost">Signup</a>
    `;
  }
}

document.addEventListener('DOMContentLoaded', updateNav);
