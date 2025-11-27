const trackingInput = document.getElementById('trackingNumber');
const carrierSelect = document.getElementById('carrierSelect');
const trackBtn = document.getElementById('trackBtn');
const detectedCarrier = document.getElementById('detectedCarrier');

const carrierPatterns = [
  { key: 'ups', name: 'UPS', regex: /\b1Z[0-9A-Z]{16}\b/i },
  { key: 'fedex', name: 'FedEx', regex: /\b(\d{12}|\d{15}|\d{20})\b/ },
  { key: 'usps', name: 'USPS', regex: /\b\d{20,22}\b/ },
  { key: 'dhl', name: 'DHL', regex: /\b\d{10}\b/ },
  { key: 'lasership', name: 'LaserShip', regex: /\b(LL|LX)[0-9]{8,}/i },
  { key: 'amazon', name: 'Amazon Logistics', regex: /\b(TBA|QX)[A-Z0-9]{12}\b/i },
];

let loading = false;

const updateButtonState = () => {
  const hasValue = trackingInput.value.trim().length > 0;
  trackBtn.disabled = !hasValue || loading;
};

const detectCarrier = () => {
  const value = trackingInput.value.trim();
  if (!value) {
    detectedCarrier.textContent = '';
    return null;
  }
  const match = carrierPatterns.find((p) => p.regex.test(value.replace(/\s+/g, '')));
  if (match && carrierSelect.value === 'auto') {
    detectedCarrier.textContent = `Detected carrier: ${match.name}`;
    detectedCarrier.style.color = 'var(--primary)';
    return match.key;
  }
  detectedCarrier.textContent = carrierSelect.value !== 'auto' ? `Manual carrier: ${carrierSelect.options[carrierSelect.selectedIndex].text}` : '';
  detectedCarrier.style.color = 'var(--muted)';
  return carrierSelect.value !== 'auto' ? carrierSelect.value : null;
};

trackingInput.addEventListener('input', () => {
  detectCarrier();
  updateButtonState();
});

carrierSelect.addEventListener('change', () => {
  detectCarrier();
  updateButtonState();
});

trackBtn.addEventListener('click', () => {
  const trackingNumber = trackingInput.value.trim();
  const carrier = detectCarrier() || 'auto';
  loading = true;
  updateButtonState();
  trackBtn.textContent = 'Tracking...';

  const params = new URLSearchParams({ trackingNumber, carrier });
  window.location.href = `results.html?${params.toString()}`;
});

const applyTheme = (theme) => {
  document.body.classList.toggle('dark', theme === 'dark');
};

const applyAnimations = (enabled) => {
  document.body.style.setProperty('scroll-behavior', enabled ? 'smooth' : 'auto');
};

const loadDefaults = async () => {
  try {
    const res = await api.getSettings();
    if (res.success && res.data) {
      const { theme, animationsEnabled, defaultCarrier } = res.data;
      applyTheme(theme);
      applyAnimations(animationsEnabled === 1);
      if (defaultCarrier && carrierSelect.querySelector(`option[value="${defaultCarrier}"]`)) {
        carrierSelect.value = defaultCarrier;
      }
    }
  } catch (error) {
    /* ignore */
  }
};

loadDefaults();
updateButtonState();
detectCarrier();
