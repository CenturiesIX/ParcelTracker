const Timeline = {
  render(checkpoints) {
    if (!checkpoints || !checkpoints.length) {
      return '<div class="empty-state">No checkpoints yet.</div>';
    }
    const items = checkpoints
      .map(
        (cp) => `
        <div class="timeline-item">
          <h4>${cp.description || 'Update'}</h4>
          <p>${cp.location || 'Unknown location'}</p>
          <p>${cp.time || ''}</p>
        </div>
      `
      )
      .join('');
    return `<div class="timeline">${items}</div>`;
  },
};
