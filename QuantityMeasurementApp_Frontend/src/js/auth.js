// ============================================================
// auth.js — Login, register, Google login, logout, session restore
// Auth modal is shown ONLY when user tries to access protected features
// ============================================================

// Track where user wanted to go before being asked to log in
let _pendingNav = null;

// ── Show / hide auth modal ────────────────────────────────────
function showAuthModal(returnToPage) {
  _pendingNav = returnToPage || null;
  document.getElementById('authModal').style.display = 'flex';
  // Reset error messages
  document.getElementById('loginErr').innerText = '';
  document.getElementById('regErr').innerText = '';
}

function hideAuthModal() {
  document.getElementById('authModal').style.display = 'none';
}

// ── Login ─────────────────────────────────────────────────────
async function loginUser(username, password) {
  const data = await apiCall(
    '/users/login',
    { method: 'POST', body: JSON.stringify({ Username: username, Password: password }) },
    false
  );
  saveToken(data.AccessToken, data.RefreshToken);
  const profile = await apiCall('/users/profile', { method: 'GET' }, true);
  onLoginSuccess(profile);
}

// ── Register ──────────────────────────────────────────────────
async function registerUser(username, email, password) {
  const data = await apiCall(
    '/users/register',
    { method: 'POST', body: JSON.stringify({ Username: username, Email: email, Password: password }) },
    false
  );
  saveToken(data.AccessToken, data.RefreshToken);
  const profile = await apiCall('/users/profile', { method: 'GET' }, true);
  onLoginSuccess(profile);
}

// ── UC19: Google OAuth Login ──────────────────────────────────
async function handleGoogleSignIn(googleResponse) {
  try {
    const data = await apiCall(
      '/users/google-login',
      { method: 'POST', body: JSON.stringify({ IdToken: googleResponse.credential }) },
      false
    );
    saveToken(data.AccessToken, data.RefreshToken);
    const profile = await apiCall('/users/profile', { method: 'GET' }, true);
    onLoginSuccess(profile);
    toast(`🔵 Welcome ${profile.Username} (Google)`, 'success');
  } catch (e) {
    document.getElementById('loginErr').innerText = '🔴 Google login failed: ' + e.message;
    toast('Google login failed: ' + e.message, 'error');
  }
}

// ── Called after any successful auth ─────────────────────────
function onLoginSuccess(profile) {
  updateDashboardUI(profile);
  hideAuthModal();
  toast(`⚡ Welcome ${profile.Username}`, 'success');
  // Navigate to the page they originally wanted
  if (_pendingNav) {
    navigateTo(_pendingNav);
    _pendingNav = null;
  }
}

// ── Logout ────────────────────────────────────────────────────
function logout() {
  clearTokens();
  if (typeof google !== 'undefined' && google.accounts) {
    google.accounts.id.disableAutoSelect();
  }
  updateGuestUI();
  navigateTo('calc');
  toast('Signed out', 'info');
}

// ── Session restore (silent — no redirect to auth portal) ─────
async function tryRestoreSession() {
  if (!getToken()) {
    updateGuestUI();
    return;
  }
  try {
    const profile = await apiCall('/users/profile', {}, true);
    updateDashboardUI(profile);
  } catch {
    clearTokens();
    updateGuestUI();
  }
}

// ── Update sidebar UI for logged-in user ─────────────────────
function updateDashboardUI(profile) {
  const loggedInEl = document.getElementById('userLoggedIn');
  const guestEl    = document.getElementById('userGuest');
  if (loggedInEl) loggedInEl.style.display = 'flex';
  if (guestEl)    guestEl.style.display    = 'none';

  const navAvatar   = document.getElementById('navAvatar');
  const navUsername = document.getElementById('navUsername');
  if (navAvatar)   navAvatar.innerText   = (profile.Username || 'U')[0].toUpperCase();
  if (navUsername) navUsername.innerText = profile.Username || 'User';

  // If currently on a protected page, reveal its content
  const currentPage = document.querySelector('.nav-item.active')?.dataset?.page;
  if (currentPage === 'history') revealHistoryContent();
  if (currentPage === 'profile') revealProfileContent(profile);
}

// ── Update sidebar UI for guest ──────────────────────────────
function updateGuestUI() {
  const loggedInEl = document.getElementById('userLoggedIn');
  const guestEl    = document.getElementById('userGuest');
  if (loggedInEl) loggedInEl.style.display = 'none';
  if (guestEl)    guestEl.style.display    = 'flex';
}

// ── Reveal protected page content ────────────────────────────
function revealHistoryContent() {
  const prompt  = document.getElementById('historyLoginPrompt');
  const content = document.getElementById('historyContent');
  if (prompt)  prompt.style.display  = 'none';
  if (content) content.style.display = 'block';
}

function showHistoryPrompt() {
  const prompt  = document.getElementById('historyLoginPrompt');
  const content = document.getElementById('historyContent');
  if (prompt)  prompt.style.display  = 'block';
  if (content) content.style.display = 'none';
}

function revealProfileContent(profile) {
  const prompt  = document.getElementById('profileLoginPrompt');
  const content = document.getElementById('profileContent');
  if (prompt)  prompt.style.display  = 'none';
  if (content) content.style.display = 'grid';
  if (profile) populateProfileCard(profile);
}

function showProfilePrompt() {
  const prompt  = document.getElementById('profileLoginPrompt');
  const content = document.getElementById('profileContent');
  if (prompt)  prompt.style.display  = 'block';
  if (content) content.style.display = 'none';
}
