const historyTable = document.getElementById('historyTable');
const historyFilter = document.getElementById('historyFilter');
const clearHistoryBtn = document.getElementById('clearHistory');
const modalMount = document.getElementById('modalMount');

let historyData = [];

const applyPreferences = async () => {
  try {
    const res = await api.getSettings();
    if (res.success && res.data) {
      document.body.classList.toggle('dark', res.data.theme === 'dark');
      document.body.style.setProperty('scroll-behavior', res.data.animationsEnabled === 1 ? 'smooth' : 'auto');
    }
  } catch (error) {
    /* ignore */
  }
};

const renderHistory = (items) => {
  if (!items.length) {
    historyTable.innerHTML = '<div class="empty-state">No history yet. Track a package to get started.</div>';
    return;
  }
  const rows = items
    .map(
      (item) => `
      <tr data-carrier="${item.carrier}" data-number="${item.trackingNumber}">
        <td>${item.trackingNumber}</td>
        <td>${item.carrier}</td>
        <td>${item.status || ''}</td>
        <td>${item.lastUpdated || ''}</td>
        <td>${item.createdAt || ''}</td>
      </tr>
    `
    )
    .join('');

  historyTable.innerHTML = `
    <table class="table">
      <thead><tr><th>Tracking #</th><th>Carrier</th><th>Status</th><th>Last updated</th><th>Tracked at</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  historyTable.querySelectorAll('tbody tr').forEach((row) => {
    row.addEventListener('click', () => {
      const number = row.dataset.number;
      const carrier = row.dataset.carrier.toLowerCase();
      const params = new URLSearchParams({ trackingNumber: number, carrier });
      window.location.href = `results.html?${params.toString()}`;
    });
  });
};

const applyFilter = () => {
  const value = historyFilter.value;
  const filtered = value === 'all' ? historyData : historyData.filter((h) => h.carrier === value);
  renderHistory(filtered);
};

const loadHistory = async () => {
  await applyPreferences();
  const res = await api.history();
  if (res.success && res.data) {
    historyData = res.data;
    applyFilter();
  } else {
    historyTable.innerHTML = '<div class="empty-state">Unable to load history.</div>';
  }
};

clearHistoryBtn.addEventListener('click', () => {
  Modal.confirm(modalMount, {
    title: 'Clear history',
    body: 'Are you sure you want to clear all tracking history? This cannot be undone.',
    confirmLabel: 'Clear history',
    onConfirm: async () => {
      const res = await api.clearHistory();
      if (res.success) {
        historyData = [];
        applyFilter();
        Toast.show('History cleared', 'success');
      } else {
        Toast.show(res.message || 'Could not clear history', 'error');
      }
    },
  });
});

historyFilter.addEventListener('change', applyFilter);
loadHistory();
