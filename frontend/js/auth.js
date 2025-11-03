/* auth.js — handles login, signup, and session persistence */

async function login(form){
  const data = Object.fromEntries(new FormData(form));
  const res = await fetch('/api/auth/login', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
  const j = await res.json();
  if(!res.ok) { showToast(j.message || 'Login failed','error'); return; }

  setToken(j.token);
  localStorage.setItem('voygo_user', JSON.stringify(j.user));
  showToast('Welcome back, ' + j.user.name + ' 🎉');

  // 👇 stay on index instead of going to dashboard
  window.location = '/frontend/index.html';
}

async function signup(form){
  const data = Object.fromEntries(new FormData(form));
  const res = await fetch('/api/auth/signup', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
  const j = await res.json();
  if(!res.ok){ showToast(j.message || 'Signup failed','error'); return; }
  showToast('Signup successful! Please login.');
  window.location = '/frontend/login.html';
}

/* ✅ Check authentication before accessing protected pages */
function checkAuth() {
  const token = localStorage.getItem("voygo_token");
  if (!token) {
    showToast("Please log in first", "error");
    window.location = "/frontend/login.html";
  }
}

/* ✅ Logout */
function logout() {
  localStorage.removeItem("voygo_token");
  localStorage.removeItem("voygo_user");
  showToast("Logged out successfully!");
  window.location = "/frontend/login.html";
}

/* ✅ Helper to include token in API requests */
function authFetch(url, options = {}) {
  const token = localStorage.getItem("voygo_token");
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

/* ✅ Make these available globally */
window.login = login;
window.signup = signup;
window.checkAuth = checkAuth;
window.logout = logout;
window.authFetch = authFetch;
