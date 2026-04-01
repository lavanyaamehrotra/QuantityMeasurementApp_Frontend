// ============================================================
// token.js — Token storage helpers (sessionStorage wrappers)
// ============================================================

function saveToken(accessToken, refreshToken) {
  sessionStorage.setItem(CONFIG.TOKEN_KEY, accessToken);
  sessionStorage.setItem(CONFIG.REFRESH_KEY, refreshToken);
}

function getToken() {
  return sessionStorage.getItem(CONFIG.TOKEN_KEY);
}

function getRefresh() {
  return sessionStorage.getItem(CONFIG.REFRESH_KEY);
}

function clearTokens() {
  sessionStorage.removeItem(CONFIG.TOKEN_KEY);
  sessionStorage.removeItem(CONFIG.REFRESH_KEY);
}
