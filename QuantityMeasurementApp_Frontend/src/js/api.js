// ============================================================
// api.js — Base HTTP client with automatic token refresh
// ============================================================

async function apiCall(endpoint, opts = {}, auth = true) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth && getToken()) {
    headers['Authorization'] = `Bearer ${getToken()}`;
  }

  let res = await fetch(`${CONFIG.API}${endpoint}`, { ...opts, headers });

  // Auto-refresh on 401
  if (res.status === 401 && auth) {
    const rt = getRefresh();

    if (rt) {
      const refRes = await fetch(`${CONFIG.API}/users/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ RefreshToken: rt }),
      });

      if (refRes.ok) {
        const refData = await refRes.json();
        saveToken(refData.AccessToken, refData.RefreshToken);
        headers['Authorization'] = `Bearer ${refData.AccessToken}`;
        res = await fetch(`${CONFIG.API}${endpoint}`, { ...opts, headers });
      } else {
        clearTokens();
        throw new Error('Session expired');
      }
    } else {
      throw new Error('Unauthorized');
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.Message || data.message || 'Request failed');
  return data;
}
