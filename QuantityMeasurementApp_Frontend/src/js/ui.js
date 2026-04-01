// ============================================================
// ui.js — Theme toggle, toast notifications, password strength, navigation
// ============================================================

// ─── Toast ───────────────────────────────────────────────────
function toast(msg, type = 'info') {
  const root = document.getElementById('toastRoot');
  const t    = document.createElement('div');
  t.className  = `toast-msg ${type}`;
  t.innerText  = msg;
  root.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'none';
    t.style.opacity = '0';
    t.style.transform = 'translateX(30px)';
    t.style.transition = 'all 0.3s ease';
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

// ─── Theme ───────────────────────────────────────────────────
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('qm_theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  setTheme(current === 'dark' ? 'light' : 'dark');
}

function loadSavedTheme() {
  const saved = localStorage.getItem('qm_theme') || 'dark';
  setTheme(saved);
}

// ─── Password strength ───────────────────────────────────────
function updatePasswordStrength(password) {
  let score = 0;
  if (password.length >= 6)           score++;
  if (password.length >= 10)          score++;
  if (/[A-Z]/.test(password))         score++;
  if (/[0-9]/.test(password))         score++;
  if (/[^a-zA-Z0-9]/.test(password))  score++;

  const percent = (score / 5) * 100;
  const fill    = document.getElementById('strengthFill');

  if (fill) {
    fill.style.width = `${percent}%`;
    if (score <= 1) {
      fill.style.background = 'linear-gradient(135deg, #ef4444, #f97316)';
    } else if (score <= 2) {
      fill.style.background = 'linear-gradient(135deg, #f97316, #eab308)';
    } else if (score <= 3) {
      fill.style.background = 'linear-gradient(135deg, #eab308, #10b981)';
    } else {
      fill.style.background = 'linear-gradient(135deg, #10b981, #06b6d4, #7c3aed)';
    }
  }
}

// ─── Navigation (with auth guard for history & profile) ──────
function navigateTo(page) {
  const isLoggedIn = !!getToken();

  // Auth-guard: history and profile require login
  if ((page === 'history' || page === 'profile') && !isLoggedIn) {
    // Still switch the visual nav highlight
    _setActivePage(page);
    if (page === 'history') showHistoryPrompt();
    if (page === 'profile') showProfilePrompt();
    return;
  }

  _setActivePage(page);

  // If navigating to a protected page while logged in, reveal content
  if (page === 'history' && isLoggedIn) revealHistoryContent();
  if (page === 'profile' && isLoggedIn) {
    // Fetch fresh profile data
    apiCall('/users/profile', {}, true)
      .then(profile => revealProfileContent(profile))
      .catch(() => revealProfileContent(null));
  }
}

function _setActivePage(page) {
  document.querySelectorAll('.nav-item').forEach(n =>
    n.classList.toggle('active', n.dataset.page === page)
  );
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pageMap = { calc: 'calcPage', history: 'historyPage', profile: 'profilePage' };
  const target  = document.getElementById(pageMap[page]);
  if (target) target.classList.add('active');
}
