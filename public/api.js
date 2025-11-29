const api = {
  async track(trackingNumber, carrier) {
    const response = await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingNumber, carrier }),
    });
    return response.json();
  },
  async history() {
    const res = await fetch('/api/history');
    return res.json();
  },
  async clearHistory() {
    const res = await fetch('/api/history', { method: 'DELETE' });
    return res.json();
  },
  async getSettings() {
    const res = await fetch('/api/settings');
    return res.json();
  },
  async saveSettings(payload) {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
};
