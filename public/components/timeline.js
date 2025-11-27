(() => {
  const renderTimeline = (container, checkpoints = []) => {
    container.innerHTML = '';
    if (!checkpoints.length) {
      container.classList.remove('timeline');
      container.classList.add('empty-state');
      container.textContent = 'No checkpoints available yet.';
      return;
    }
    container.classList.add('timeline');
    checkpoints.forEach((cp) => {
      const item = document.createElement('div');
      item.className = 'timeline-item';
      const title = document.createElement('h4');
      title.textContent = cp.description || 'Update available';
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = [cp.time, cp.location].filter(Boolean).join(' · ');
      item.append(title, meta);
      container.append(item);
    });
  };

  window.trackettaTimeline = { renderTimeline };
})();
