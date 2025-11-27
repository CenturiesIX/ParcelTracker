const Dropdown = {
  enhance(select) {
    if (!select) return;
    select.addEventListener('focus', () => select.classList.add('active'));
    select.addEventListener('blur', () => select.classList.remove('active'));
  },
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('select').forEach((select) => Dropdown.enhance(select));
});
