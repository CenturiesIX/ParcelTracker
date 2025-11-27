const Toast = {
  show(message, type = 'info', duration = 3200) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    el.style.borderLeft = `4px solid ${type === 'success' ? '#2fbf71' : type === 'error' ? '#f25f5c' : '#2f7cf6'}`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(6px)';
      setTimeout(() => el.remove(), 240);
    }, duration);
  },
};
