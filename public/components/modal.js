const Modal = {
  confirm(mount, { title, body, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm }) {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal">
        <h3 style="margin-top:0;">${title}</h3>
        <p class="muted">${body}</p>
        <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:18px;">
          <button class="primary" id="confirmModal">${confirmLabel}</button>
          <button id="cancelModal">${cancelLabel}</button>
        </div>
      </div>
    `;
    const cleanup = () => backdrop.remove();
    backdrop.querySelector('#cancelModal').addEventListener('click', cleanup);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) cleanup(); });
    backdrop.querySelector('#confirmModal').addEventListener('click', async () => {
      if (onConfirm) await onConfirm();
      cleanup();
    });
    mount.appendChild(backdrop);
  },
};
