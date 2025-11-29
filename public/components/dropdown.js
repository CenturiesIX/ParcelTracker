(() => {
  const enhance = (select) => {
    if (!select || select.dataset.enhanced) return;
    select.dataset.enhanced = 'true';
    select.addEventListener('focus', () => select.classList.add('focused'));
    select.addEventListener('blur', () => select.classList.remove('focused'));
  };

  const initAllDropdowns = () => {
    document.querySelectorAll('select').forEach(enhance);
  };

  window.trackettaDropdowns = { initAllDropdowns };
})();
