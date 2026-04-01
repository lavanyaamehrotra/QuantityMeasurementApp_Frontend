// ============================================================
// profile.js — Profile display and token status
// ============================================================

function populateProfileCard(profile) {
  if (!profile) return;
  const el = id => document.getElementById(id);
  const avatar = (profile.Username || 'U')[0].toUpperCase();

  if (el('profileAvatarBig')) el('profileAvatarBig').innerText = avatar;
  if (el('profileFullName'))  el('profileFullName').innerText  = profile.Username || '—';
  if (el('profileUserId'))    el('profileUserId').innerText    = profile.Id || '—';
  if (el('profileEmail'))     el('profileEmail').innerText     = profile.Email || '—';
  if (el('profileRole'))      el('profileRole').innerText      = (profile.Role || 'USER').toUpperCase();

  const tokenMsg = el('tokenStatusMsg');
  if (tokenMsg) {
    tokenMsg.innerText = getToken() ? '🟢 Active' : '🔴 Not signed in';
  }
}

async function refreshProfile() {
  try {
    const profile = await apiCall('/users/profile', {}, true);
    populateProfileCard(profile);
    toast('Profile refreshed', 'success');
  } catch (e) {
    toast(e.message, 'error');
  }
}
