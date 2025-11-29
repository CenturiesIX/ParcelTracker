(() => {
  const createModal = ({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm }) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'modal';

    const heading = document.createElement('h3');
    heading.textContent = title;
    const body = document.createElement('p');
    body.className = 'muted';
    body.textContent = message;

    const actions = document.createElement('div');
    actions.className = 'modal-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = cancelText;
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'primary';
    confirmBtn.textContent = confirmText;

    const close = () => overlay.remove();

    cancelBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    confirmBtn.addEventListener('click', () => {
      onConfirm?.();
      close();
    });

    actions.append(cancelBtn, confirmBtn);
    modal.append(heading, body, actions);
    overlay.append(modal);

    const mountPoint = document.getElementById('modalRoot') || document.body;
    mountPoint.append(overlay);
    return overlay;
  };

  window.trackettaModal = { createModal };
})();
