(() => {
  const containerId = 'toastContainer';

  const showToast = (message, type = 'info') => {
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.className = 'toast-container';
      document.body.append(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    if (type === 'error') {
      toast.style.borderColor = 'var(--danger)';
      toast.style.color = 'var(--danger)';
    } else if (type === 'success') {
      toast.style.borderColor = 'var(--accent)';
      toast.style.color = 'var(--text)';
    }

    container.append(toast);
    setTimeout(() => toast.remove(), 3200);
    return toast;
  };

  window.trackettaToast = { showToast };
})();
