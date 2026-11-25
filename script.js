const filterButtons = [...document.querySelectorAll('[data-filter]')];
const menuItems = [...document.querySelectorAll('.menu-item')];
const menuCount = document.querySelector('#menu-count');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const chosen = button.dataset.filter;
    filterButtons.forEach((option) => {
      const active = option === button;
      option.classList.toggle('active', active);
      option.setAttribute('aria-pressed', String(active));
    });
    menuItems.forEach((item) => {
      item.hidden = chosen !== 'todos' && item.dataset.kind !== chosen;
    });
    const total = menuItems.filter((item) => !item.hidden).length;
    menuCount.textContent = `${total} ${total === 1 ? 'opção' : 'opções'} no cardápio`;
  });
});

const form = document.querySelector('#contact-form');
const status = document.querySelector('#form-status');

function validateField(field) {
  const value = field.value.trim();
  const error = document.querySelector(`#${field.id}-error`);
  let message = '';

  if (!value) {
    message = 'Este campo é obrigatório.';
  } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    message = 'Digite um e-mail válido.';
  }

  error.textContent = message;
  field.setAttribute('aria-invalid', String(Boolean(message)));
  return !message;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const fields = [...form.querySelectorAll('input, textarea')];
  const valid = fields.map(validateField).every(Boolean);
  if (!valid) {
    status.textContent = 'Confira os campos marcados.';
    fields.find((field) => field.getAttribute('aria-invalid') === 'true').focus();
    return;
  }
  status.textContent = 'Tudo certo! Este formulário é só uma demonstração e não envia mensagens.';
  form.reset();
  fields.forEach((field) => field.removeAttribute('aria-invalid'));
});

form.querySelectorAll('input, textarea').forEach((field) => {
  field.addEventListener('blur', () => validateField(field));
});
