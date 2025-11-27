document.addEventListener('DOMContentLoaded', () => {
  const themeLightBtn = document.getElementById('lightThemeBtn');
  const themeDarkBtn = document.getElementById('darkThemeBtn');
  const animationToggle = document.getElementById('animationToggle');
  const defaultCarrier = document.getElementById('defaultCarrierSelect');
  const clearBtn = document.getElementById('clearDataBtn');

  const syncUI = (settings) => {
    if (!settings) return;
    themeLightBtn.classList.toggle('primary', settings.theme === 'light');
    themeDarkBtn.classList.toggle('primary', settings.theme === 'dark');
    animationToggle.classList.toggle('active', !!settings.animationsEnabled);
    defaultCarrier.value = settings.defaultCarrier || 'auto';
    applyTheme(settings.theme);
    applyAnimations(!!settings.animationsEnabled);
  };

  const saveSettings = async (payload) => {
    try {
      const res = await api.saveSettings(payload);
      if (!res.success) throw new Error(res.message || 'Unable to save');
      state.settings = res.data;
      syncUI(res.data);
      trackettaToast.showToast('Settings saved', 'success');
    } catch (err) {
      trackettaToast.showToast(err.message, 'error');
    }
  };

  themeLightBtn.addEventListener('click', () => saveSettings({ theme: 'light' }));
  themeDarkBtn.addEventListener('click', () => saveSettings({ theme: 'dark' }));
  animationToggle.addEventListener('click', () => saveSettings({ animationsEnabled: animationToggle.classList.toggle('active') ? 1 : 0 }));
  defaultCarrier.addEventListener('change', () => saveSettings({ defaultCarrier: defaultCarrier.value }));

  clearBtn.addEventListener('click', () => {
    saveSettings({ theme: 'light', animationsEnabled: 1, defaultCarrier: 'auto' });
  });

  // initial data
  api.getSettings().then((res) => {
    if (res.success && res.data) {
      state.settings = res.data;
      syncUI(res.data);
    }
  });
});
