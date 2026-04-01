// ============================================================
// app.js — Entry point: boots app directly to dashboard
// Login/register only triggered when History or Profile clicked
// ============================================================

function init() {

  // ── Theme ───────────────────────────────────────────────────
  loadSavedTheme();
  document.getElementById('globalThemeToggle')
    .addEventListener('click', toggleTheme);

  // ── Auth modal close ─────────────────────────────────────────
  document.getElementById('authModalClose')
    .addEventListener('click', hideAuthModal);
  document.getElementById('authModal')
    .addEventListener('click', function(e) {
      if (e.target === this) hideAuthModal();
    });

  // ── Auth tabs ───────────────────────────────────────────────
  document.querySelectorAll('.auth-tab').forEach(btn =>
    btn.addEventListener('click', function () {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const tab = this.dataset.tab;
      document.getElementById('loginForm').classList.toggle('active', tab === 'login');
      document.getElementById('registerForm').classList.toggle('active', tab === 'register');
    })
  );

  document.querySelectorAll('.switch-link').forEach(btn =>
    btn.addEventListener('click', function () {
      document.querySelector(`.auth-tab[data-tab="${this.dataset.switch}"]`).click();
    })
  );

  // ── Password visibility toggles ─────────────────────────────
  document.querySelectorAll('.toggle-pwd').forEach(btn =>
    btn.addEventListener('click', function () {
      const inp = document.getElementById(this.dataset.target);
      if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
    })
  );

  // ── Login ───────────────────────────────────────────────────
  document.getElementById('doLoginBtn').addEventListener('click', async () => {
    try {
      await loginUser(
        document.getElementById('loginUser').value,
        document.getElementById('loginPass').value
      );
    } catch (e) {
      document.getElementById('loginErr').innerText = e.message;
      toast(e.message, 'error');
    }
  });

  // ── Register ────────────────────────────────────────────────
  document.getElementById('doRegisterBtn').addEventListener('click', async () => {
    try {
      await registerUser(
        document.getElementById('regUser').value,
        document.getElementById('regEmail').value,
        document.getElementById('regPass').value
      );
    } catch (e) {
      document.getElementById('regErr').innerText = e.message;
      toast(e.message, 'error');
    }
  });

  // ── Logout ──────────────────────────────────────────────────
  document.getElementById('globalLogoutBtn')
    .addEventListener('click', logout);

  // ── Sidebar sign-in button (guest mode) ─────────────────────
  document.getElementById('sidebarLoginBtn')
    .addEventListener('click', () => showAuthModal(null));

  // ── Navigation ──────────────────────────────────────────────
  document.querySelectorAll('.nav-item').forEach(btn =>
    btn.addEventListener('click', function () {
      navigateTo(this.dataset.page);
    })
  );

  // ── Login prompts on protected pages ────────────────────────
  document.getElementById('historyLoginBtn')
    .addEventListener('click', () => showAuthModal('history'));
  document.getElementById('profileLoginBtn')
    .addEventListener('click', () => showAuthModal('profile'));

  // ── Measurement type chips ───────────────────────────────────
  document.querySelectorAll('.chip').forEach(btn =>
    btn.addEventListener('click', function () {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      setMeasurementType(this.dataset.type);
    })
  );

  // ── Operation buttons ────────────────────────────────────────
  document.querySelectorAll('.op-btn').forEach(btn =>
    btn.addEventListener('click', function () {
      document.querySelectorAll('.op-btn').forEach(o => o.classList.remove('active'));
      this.classList.add('active');
      setOperation(this.dataset.op);
    })
  );

  // ── Calculator ───────────────────────────────────────────────
  document.getElementById('calcExecBtn')
    .addEventListener('click', calculate);

  // ── History ──────────────────────────────────────────────────
  document.getElementById('fetchHistoryBtn')
    .addEventListener('click', fetchHistory);

  document.getElementById('fetchCountBtn')
    .addEventListener('click', fetchCount);

  document.getElementById('histFilterType')
    .addEventListener('change', updateFilterValVisibility);

  // ── Profile ──────────────────────────────────────────────────
  document.getElementById('refreshProfileBtn')
    .addEventListener('click', refreshProfile);

  // ── Password strength ────────────────────────────────────────
  document.getElementById('regPass')
    .addEventListener('input', e => updatePasswordStrength(e.target.value));

  // ── Boot ─────────────────────────────────────────────────────
  document.getElementById('convertInputs').style.display = '';
  document.getElementById('dualInputs').style.display    = 'none';

  populateUnits('LENGTH');

  // Init history filter visibility
  updateFilterValVisibility();

  // ── UC19: Google Sign-In button initialization ────────────────
  waitForGoogleAndInit();

  // ── Restore session silently (no redirect) ────────────────────
  tryRestoreSession();
}

// ── UC19: Wait for Google library then render button ─────────
function waitForGoogleAndInit() {
  if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
    initGoogleSignIn();
  } else {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        clearInterval(interval);
        initGoogleSignIn();
      } else if (attempts >= 25) {
        clearInterval(interval);
        console.warn('Google Sign-In library failed to load.');
      }
    }, 200);
  }
}

function initGoogleSignIn() {
  google.accounts.id.initialize({
    client_id: CONFIG.GOOGLE_CLIENT_ID,
    callback:  handleGoogleSignIn,
    auto_select: false,
  });

  const loginBtn = document.getElementById('googleSignInBtn');
  if (loginBtn) {
    google.accounts.id.renderButton(loginBtn, {
      theme: 'filled_black', size: 'large', width: 280,
      text: 'signin_with', shape: 'pill', logo_alignment: 'left',
    });
  }

  const regBtn = document.getElementById('googleSignInBtn2');
  if (regBtn) {
    google.accounts.id.renderButton(regBtn, {
      theme: 'filled_black', size: 'large', width: 280,
      text: 'signup_with', shape: 'pill', logo_alignment: 'left',
    });
  }
}

init();
