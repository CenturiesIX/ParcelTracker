const themeToggle = document.getElementById('themeToggle');
const animationToggle = document.getElementById('animationToggle');
const defaultCarrierSelect = document.getElementById('defaultCarrier');
const saveSettingsBtn = document.getElementById('saveSettings');
const clearDataBtn = document.getElementById('clearData');
const modalMountSettings = document.getElementById('modalMount');

const applyTheme = (theme) => {
  document.body.classList.toggle('dark', theme === 'dark');
};

const applyAnimations = (enabled) => {
  document.body.style.setProperty('scroll-behavior', enabled ? 'smooth' : 'auto');
};

const loadSettings = async () => {
  const res = await api.getSettings();
  if (res.success && res.data) {
    const { theme, animationsEnabled, defaultCarrier } = res.data;
    themeToggle.checked = theme === 'dark';
    animationToggle.checked = animationsEnabled === 1;
    defaultCarrierSelect.value = defaultCarrier || 'auto';
    applyTheme(theme);
    applyAnimations(animationsEnabled === 1);
  }
};

saveSettingsBtn.addEventListener('click', async () => {
  const payload = {
    theme: themeToggle.checked ? 'dark' : 'light',
    animationsEnabled: animationToggle.checked ? 1 : 0,
    defaultCarrier: defaultCarrierSelect.value,
  };
  const res = await api.saveSettings(payload);
  if (res.success) {
    applyTheme(payload.theme);
    applyAnimations(payload.animationsEnabled === 1);
    Toast.show('Settings saved', 'success');
  } else {
    Toast.show(res.message || 'Failed to save settings', 'error');
  }
});

clearDataBtn.addEventListener('click', () => {
  Modal.confirm(modalMountSettings, {
    title: 'Clear data',
    body: 'Reset settings to defaults?',
    confirmLabel: 'Clear',
    onConfirm: async () => {
      const res = await api.saveSettings({ theme: 'light', animationsEnabled: 1, defaultCarrier: 'auto' });
      if (res.success) {
        themeToggle.checked = false;
        animationToggle.checked = true;
        defaultCarrierSelect.value = 'auto';
        applyTheme('light');
        applyAnimations(true);
        Toast.show('Settings cleared', 'success');
      }
    },
  });
});

themeToggle.addEventListener('change', () => applyTheme(themeToggle.checked ? 'dark' : 'light'));
animationToggle.addEventListener('change', () => applyAnimations(animationToggle.checked));

loadSettings();
