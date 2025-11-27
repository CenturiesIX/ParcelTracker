const carrierLabels = {
  auto: 'Auto detect',
  ups: 'UPS',
  fedex: 'FedEx',
  usps: 'USPS',
  dhl: 'DHL',
  lasership: 'LaserShip',
  amazon: 'Amazon Logistics',
};

const state = {
  settings: { theme: 'light', animationsEnabled: 1, defaultCarrier: 'auto' },
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
};

const applyAnimations = (enabled) => {
  document.body.classList.toggle('animations-off', !enabled);
};

const hydrateNav = () => {
  const page = document.body.dataset.page;
  document.querySelectorAll('.nav-links a').forEach((link) => {
    const href = link.getAttribute('href');
    const key = href.replace('.html', '').replace('index', 'home');
    if (page === key) link.classList.add('active');
  });
};

const loadSettings = async () => {
  try {
    const res = await api.getSettings();
    if (res.success && res.data) {
      state.settings = res.data;
      applyTheme(state.settings.theme);
      applyAnimations(!!state.settings.animationsEnabled);
      document.dispatchEvent(new CustomEvent('settingsLoaded', { detail: state.settings }));
    }
  } catch (err) {
    console.error(err);
    trackettaToast.showToast('Unable to load settings, using defaults', 'error');
  }
};

const initGlobalUI = () => {
  trackettaDropdowns.initAllDropdowns();
  hydrateNav();
};

document.addEventListener('DOMContentLoaded', loadSettings);
document.addEventListener('DOMContentLoaded', initGlobalUI);

// Home page logic
if (document.body.dataset.page === 'home') {
  document.addEventListener('DOMContentLoaded', () => {
    const trackingInput = document.getElementById('trackingNumber');
    const carrierSelect = document.getElementById('carrierSelect');
    const trackBtn = document.getElementById('trackBtn');
    const detectedCarrier = document.getElementById('detectedCarrier');
    const trackBtnText = document.getElementById('trackBtnText');

    const assignDefaultCarrier = (settings) => {
      carrierSelect.value = (settings && settings.defaultCarrier) || 'auto';
    };

    assignDefaultCarrier(state.settings);
    document.addEventListener('settingsLoaded', (event) => assignDefaultCarrier(event.detail));

    const setButtonState = () => {
      trackBtn.disabled = !trackingInput.value.trim();
    };

    const detectCarrier = (value) => {
      const patterns = {
        ups: /\b1Z[0-9A-Z]{16}\b/i,
        fedex: /\b(\d{12}|\d{15}|\d{20})\b/,
        usps: /\b\d{20,22}\b/,
        dhl: /\b\d{10}\b/,
        lasership: /\b(LL|LX)[0-9]{8,}/i,
        amazon: /\b(TBA|QX)[A-Z0-9]{12}\b/i,
      };
      const cleaned = value.replace(/\s+/g, '');
      const matched = Object.entries(patterns).find(([, regex]) => regex.test(cleaned));
      return matched ? matched[0] : null;
    };

    const updateDetected = () => {
      const value = trackingInput.value.trim();
      const manual = carrierSelect.value !== 'auto';
      if (!value) {
        detectedCarrier.textContent = '';
        return;
      }
      const detected = detectCarrier(value);
      if (manual) {
        detectedCarrier.textContent = `Using ${carrierLabels[carrierSelect.value]}`;
      } else if (detected) {
        detectedCarrier.textContent = `Detected ${carrierLabels[detected]}`;
      } else {
        detectedCarrier.textContent = 'Carrier not detected yet';
      }
    };

    trackingInput.addEventListener('input', () => {
      setButtonState();
      updateDetected();
    });

    carrierSelect.addEventListener('change', updateDetected);

    const setLoading = (loading) => {
      trackBtn.disabled = loading || !trackingInput.value.trim();
      trackBtnText.textContent = loading ? 'Preparing...' : 'Track package';
    };

    trackBtn.addEventListener('click', () => {
      const trackingNumber = trackingInput.value.trim();
      if (!trackingNumber) return;
      setLoading(true);
      detectedCarrier.textContent = '';
      const detected = carrierSelect.value !== 'auto' ? carrierSelect.value : detectCarrier(trackingNumber) || 'auto';
      const params = new URLSearchParams({ trackingNumber, carrier: detected });
      window.location.href = `results.html?${params.toString()}`;
    });

    setButtonState();
    updateDetected();
  });
}
