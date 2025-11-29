document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('historyList');
  const emptyState = document.getElementById('historyEmpty');
  const filter = document.getElementById('carrierFilter');
  const clearBtn = document.getElementById('clearHistoryBtn');

  const renderHistory = (items) => {
    list.innerHTML = '';
    if (!items.length) {
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';
    items.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'history-item';
      const header = document.createElement('div');
      header.className = 'space-between';
      header.innerHTML = `<strong>${item.trackingNumber}</strong><span class="tag">${item.carrier}</span>`;
      const status = document.createElement('div');
      status.className = 'muted';
      status.textContent = item.status || 'No status available';
      const meta = document.createElement('div');
      meta.className = 'muted';
      meta.textContent = `${item.lastUpdated || 'No timestamp'} · ${new Date(item.createdAt).toLocaleString()}`;
      card.append(header, status, meta);
      card.addEventListener('click', () => {
        const params = new URLSearchParams({ trackingNumber: item.trackingNumber, carrier: item.carrier.toLowerCase() });
        window.location.href = `results.html?${params.toString()}`;
      });
      list.append(card);
    });
  };

  const loadHistory = async () => {
    try {
      const res = await api.history();
      if (!res.success) throw new Error(res.message || 'Unable to load history');
      const filtered = res.data.filter((item) => filter.value === 'all' || item.carrier.toLowerCase() === filter.value);
      renderHistory(filtered);
    } catch (err) {
      trackettaToast.showToast(err.message, 'error');
    }
  };

  filter.addEventListener('change', loadHistory);

  clearBtn.addEventListener('click', () => {
    trackettaModal.createModal({
      title: 'Clear history',
      message: 'Remove all tracked items? This cannot be undone.',
      confirmText: 'Clear',
      onConfirm: async () => {
        try {
          const res = await api.clearHistory();
          if (!res.success) throw new Error(res.message || 'Unable to clear history');
          renderHistory([]);
          trackettaToast.showToast('History cleared', 'success');
        } catch (err) {
          trackettaToast.showToast(err.message, 'error');
        }
      },
    });
  });

  loadHistory();
});
