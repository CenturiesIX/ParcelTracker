document.addEventListener('DOMContentLoaded', () => {
  const themeLightBtn = document.getElementById('lightThemeBtn');
  const themeDarkBtn = document.getElementById('darkThemeBtn');
  const themeSystemBtn = document.getElementById('systemThemeBtn');
  const animationToggle = document.getElementById('animationToggle');
  const defaultCarrier = document.getElementById('defaultCarrierSelect');
  const clearBtn = document.getElementById('clearDataBtn');

  const syncUI = (settings) => {
    if (!settings) return;
    themeLightBtn.classList.toggle('primary', settings.theme === 'light');
    themeDarkBtn.classList.toggle('primary', settings.theme === 'dark');
    themeSystemBtn.classList.toggle('primary', settings.theme === 'system');
    animationToggle.classList.toggle('active', !!settings.animationsEnabled);
    defaultCarrier.value = settings.defaultCarrier || 'auto';
    applyTheme(settings.theme || 'system');
    applyAnimations(!!settings.animationsEnabled);
  };

  const saveSettings = async (payload) => {
    try {
      const body = { ...state.settings, ...payload };
      const res = await api.saveSettings(body);
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
  themeSystemBtn.addEventListener('click', () => saveSettings({ theme: 'system' }));
  animationToggle.addEventListener('click', () =>
    saveSettings({ animationsEnabled: animationToggle.classList.toggle('active') ? 1 : 0 })
  );
  defaultCarrier.addEventListener('change', () => saveSettings({ defaultCarrier: defaultCarrier.value }));

  clearBtn.addEventListener('click', () => {
    saveSettings({ theme: 'system', animationsEnabled: 1, defaultCarrier: 'auto' });
  });

  // initial data
  api.getSettings().then((res) => {
    if (res.success && res.data) {
      state.settings = res.data;
      syncUI(res.data);
    }
  });
});
