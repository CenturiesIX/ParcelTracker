const containerEl = document.getElementById('resultsContainer');

const params = new URLSearchParams(window.location.search);
const trackingNumber = params.get('trackingNumber');
const carrier = params.get('carrier') || 'auto';

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

const renderError = (message) => {
  containerEl.innerHTML = `
    <div class="card">
      <h2>We hit a snag</h2>
      <p class="muted">${message || 'Unable to load tracking details right now.'}</p>
      <a class="primary" href="index.html" style="display:inline-flex;align-items:center;justify-content:center;margin-top:12px;">Back to search</a>
    </div>
  `;
};

const renderSummary = (data) => {
  const badgeClass = data.currentStatus && /delivered|out for delivery|available/i.test(data.currentStatus)
    ? 'success' : /exception|delay/i.test(data.currentStatus) ? 'warning' : 'muted';

  const timelineHtml = Timeline.render(data.checkpoints || []);

  containerEl.innerHTML = `
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div>
          <h2 style="margin:0">${data.carrierName}</h2>
          <p class="muted" style="margin:4px 0 0">Tracking #${data.trackingNumber}</p>
        </div>
        <span class="badge ${badgeClass}">${data.currentStatus || 'Status unavailable'}</span>
      </div>
      <div class="summary-grid">
        <div class="summary-item"><strong>Estimated</strong><br/>${data.estimatedDelivery || 'N/A'}</div>
        <div class="summary-item"><strong>Origin</strong><br/>${data.origin || 'Unknown'}</div>
        <div class="summary-item"><strong>Destination</strong><br/>${data.destination || 'Unknown'}</div>
        <div class="summary-item"><strong>Last updated</strong><br/>${data.lastUpdated || 'Not available'}</div>
      </div>
    </div>
    <div class="card">
      <h3 style="margin-top:0">Timeline</h3>
      ${timelineHtml}
    </div>
  `;
};

const load = async () => {
  if (!trackingNumber) {
    renderError('Missing tracking number.');
    return;
  }
  await applyPreferences();
  try {
    const res = await api.track(trackingNumber, carrier);
    if (!res.success || !res.data) {
      renderError(res.message || 'Failed to fetch tracking.');
      return;
    }
    renderSummary(res.data);
  } catch (error) {
    renderError('Failed to reach server.');
  }
};

load();
