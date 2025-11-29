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
    checkpoints.forEach((cp, index) => {
      const item = document.createElement('div');
      item.className = 'timeline-item';

      const marker = document.createElement('div');
      marker.className = 'timeline-marker';
      marker.innerHTML = '<span></span>';

      const content = document.createElement('div');
      content.className = 'timeline-content';
      const title = document.createElement('h4');
      title.textContent = cp.description || 'Update available';
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.textContent = [cp.time, cp.location].filter(Boolean).join(' · ') || 'Time and location pending';

      content.append(title, meta);
      item.append(marker, content);
      item.style.setProperty('--delay', `${index * 60}ms`);
      container.append(item);
    });
  };

  window.trackettaTimeline = { renderTimeline };
})();
