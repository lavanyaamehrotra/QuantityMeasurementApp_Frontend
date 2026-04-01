// ============================================================
// history.js — Fetch measurement history and counts
// Requires login — auth guard in navigateTo handles the prompt
// ============================================================

function updateFilterValVisibility() {
  const filter   = document.getElementById('histFilterType')?.value;
  const valSel   = document.getElementById('histFilterVal');
  const countBtn = document.getElementById('fetchCountBtn');
  if (!valSel) return;
  const show = filter === 'operation' || filter === 'type';
  valSel.style.display   = show ? '' : 'none';
  if (countBtn) countBtn.style.display = (filter === 'operation') ? '' : 'none';
}

async function fetchHistory() {
  const filter    = document.getElementById('histFilterType').value;
  const val       = document.getElementById('histFilterVal').value;
  const container = document.getElementById('historyList');

  container.innerHTML = '<div class="skeleton-line"></div><div class="skeleton-line"></div><div class="skeleton-line"></div>';

  try {
    let data;
    if (filter === 'me') {
      data = await apiCall('/quantities/history/me', {}, true);
    } else if (filter === 'errored') {
      data = await apiCall('/quantities/history/errored', {}, true);
    } else if (filter === 'operation') {
      data = await apiCall(`/quantities/history/operation/${val}`, {}, true);
    } else {
      data = await apiCall(`/quantities/history/type/${val}`, {}, true);
    }

    if (!data.length) {
      container.innerHTML = '<div class="glass-card" style="text-align:center;padding:2rem;">📭 No records found</div>';
      return;
    }

    container.innerHTML = data.map(h => `
      <div class="hist-item">
        <div>
          <strong>${h.Operation}</strong> <span style="opacity:0.55;font-size:0.7rem;">${h.ThisMeasurementType || ''}</span><br>
          ${h.ThisValue} ${h.ThisUnit}
          ${h.ThatValue != null ? `↔ ${h.ThatValue} ${h.ThatUnit}` : ''}
        </div>
        <div>
          ${h.IsError
            ? `⚠️ ${h.ErrorMessage}`
            : `✔️ ${h.ResultValue != null ? Number(h.ResultValue).toFixed(4) : (h.ResultString === 'true' ? 'EQUAL' : 'NOT EQUAL')} ${h.ResultUnit || ''}`}
          <br>
          <span style="font-size:0.6rem;opacity:0.55;">${new Date(h.Timestamp).toLocaleString()}</span>
        </div>
      </div>
    `).join('');
  } catch (e) {
    if (e.message.includes('Session expired') || e.message.includes('Unauthorized')) {
      clearTokens();
      updateGuestUI();
      showHistoryPrompt();
      showAuthModal('history');
    } else {
      container.innerHTML = `<div class="glass-card">❌ ${e.message}</div>`;
    }
    toast(e.message, 'error');
  }
}

async function fetchCount() {
  const op = document.getElementById('histFilterVal').value;
  try {
    const res   = await apiCall(`/quantities/count/${op}`);
    const badge = document.getElementById('countBadge');
    badge.innerText = `${op}: ${res.count}`;
    setTimeout(() => badge.innerText = '', 4000);
  } catch (e) {
    toast(e.message, 'error');
  }
}
