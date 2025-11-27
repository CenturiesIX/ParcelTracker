document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const trackingNumber = params.get('trackingNumber');
  const carrier = params.get('carrier') || 'auto';
  const loading = document.getElementById('loadingState');
  const errorState = document.getElementById('errorState');
  const card = document.getElementById('resultCard');
  const summaryGrid = document.getElementById('summaryGrid');
  const statusBadge = document.getElementById('statusBadge');
  const carrierLabel = document.getElementById('carrierLabel');
  const trackingLabel = document.getElementById('trackingNumberLabel');
  const timelineContainer = document.getElementById('timelineContainer');
  const lastUpdatedLabel = document.getElementById('lastUpdatedLabel');

  if (!trackingNumber) {
    errorState.style.display = 'block';
    errorState.textContent = 'Missing tracking number';
    card.style.display = 'none';
    return;
  }

  const renderSummary = (data) => {
    carrierLabel.textContent = data.carrierName;
    trackingLabel.textContent = data.trackingNumber;
    statusBadge.textContent = data.currentStatus;

    summaryGrid.innerHTML = '';
    const items = [
      { label: 'Estimated delivery', value: data.estimatedDelivery || 'Not available' },
      { label: 'Origin', value: data.origin || 'Not available' },
      { label: 'Destination', value: data.destination || 'Not available' },
    ];
    items.forEach((item) => {
      const wrap = document.createElement('div');
      wrap.className = 'summary-item';
      wrap.innerHTML = `<strong>${item.label}</strong><p class="subtle-text">${item.value}</p>`;
      summaryGrid.append(wrap);
    });
  };

  const showError = (msg) => {
    errorState.style.display = 'block';
    errorState.textContent = msg;
    card.style.display = 'none';
  };

  const setLoading = (isLoading) => {
    loading.style.display = isLoading ? 'block' : 'none';
    card.style.opacity = isLoading ? 0.5 : 1;
  };

  setLoading(true);
  try {
    const response = await api.track(trackingNumber, carrier);
    if (!response.success || !response.data) throw new Error(response.message || 'Unable to load results');
    const data = response.data;
    renderSummary(data);
    lastUpdatedLabel.textContent = data.lastUpdated ? `Last updated ${data.lastUpdated}` : 'Last update not available';
    trackettaTimeline.renderTimeline(timelineContainer, data.checkpoints || []);
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
});
