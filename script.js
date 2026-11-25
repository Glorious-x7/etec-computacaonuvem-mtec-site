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
  status.textContent = 'Dados válidos! Este formulário é apenas uma demonstração e não envia mensagens.';
  form.reset();
  fields.forEach((field) => field.removeAttribute('aria-invalid'));
});

form.querySelectorAll('input, textarea').forEach((field) => {
  field.addEventListener('blur', () => validateField(field));
});
