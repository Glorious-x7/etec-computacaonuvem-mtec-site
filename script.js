const filterButtons = [...document.querySelectorAll('[data-filter]')];
const menuCategories = [...document.querySelectorAll('[data-category]')];
const menuCount = document.querySelector('#menu-count');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const chosen = button.dataset.filter;

    filterButtons.forEach((option) => {
      const active = option === button;
      option.classList.toggle('active', active);
      option.setAttribute('aria-pressed', String(active));
    });

    menuCategories.forEach((category) => {
      category.hidden = chosen !== 'todos' && category.dataset.category !== chosen;
    });

    const total = menuCategories
      .filter((category) => !category.hidden)
      .reduce((sum, category) => sum + category.querySelectorAll('.menu-item').length, 0);
    menuCount.textContent = `${total} ${total === 1 ? 'opção' : 'opções'} no cardápio`;
  });
});

const cartDialog = document.querySelector('#cart-dialog');

if (cartDialog) {
  const products = new Map();
  const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const cartBar = document.querySelector('#cart-bar');
  const cartItems = document.querySelector('#cart-items');
  const orderStatus = document.querySelector('#order-status');
  let cart = {};

  try {
    cart = JSON.parse(localStorage.getItem('intervalo-cart') || '{}') || {};
  } catch {
    cart = {};
  }

  document.querySelectorAll('.menu-item').forEach((row, index) => {
    const name = row.querySelector('h3').textContent.trim();
    const price = Number(row.querySelector(':scope > span').textContent.replace(/[^\d,]/g, '').replace(',', '.'));
    const id = `item-${index}`;
    products.set(id, { name, price });
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'add-item';
    add.textContent = 'Adicionar +';
    add.setAttribute('aria-label', `Adicionar ${name} ao carrinho`);
    add.addEventListener('click', () => {
      cart[id] = (cart[id] || 0) + 1;
      orderStatus.textContent = '';
      renderCart();
    });
    row.append(add);
  });

  function renderCart() {
    const selected = [...products].filter(([id]) => cart[id] > 0);
    const count = selected.reduce((sum, [id]) => sum + cart[id], 0);
    const total = selected.reduce((sum, [id, product]) => sum + cart[id] * product.price, 0);
    cartBar.hidden = count === 0;
    document.querySelector('#cart-summary').textContent = `${count} ${count === 1 ? 'item' : 'itens'} no carrinho`;
    document.querySelector('#cart-total-short').textContent = currency.format(total);
    document.querySelector('#cart-total').textContent = currency.format(total);
    document.querySelector('#finish-order').disabled = count === 0;
    cartItems.replaceChildren();
    if (!count) {
      const empty = document.createElement('p');
      empty.className = 'cart-empty';
      empty.textContent = 'Seu carrinho está vazio. Escolha algo no cardápio.';
      cartItems.append(empty);
    }
    selected.forEach(([id, product]) => {
      const row = document.createElement('div');
      row.className = 'cart-row';
      const label = document.createElement('strong');
      label.textContent = product.name;
      const price = document.createElement('span');
      price.textContent = currency.format(product.price * cart[id]);
      const controls = document.createElement('div');
      controls.className = 'quantity-controls';
      for (const [symbol, change, name] of [['−', -1, 'Diminuir'], ['+', 1, 'Aumentar']]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = symbol;
        button.setAttribute('aria-label', `${name} quantidade de ${product.name}`);
        button.addEventListener('click', () => {
          cart[id] = Math.max(0, cart[id] + change);
          renderCart();
        });
        controls.append(button);
        if (change < 0) {
          const quantity = document.createElement('span');
          quantity.textContent = String(cart[id]);
          controls.append(quantity);
        }
      }
      row.append(label, controls, price);
      cartItems.append(row);
    });
    try { localStorage.setItem('intervalo-cart', JSON.stringify(cart)); } catch { /* O carrinho ainda funciona nesta aba. */ }
  }

  document.querySelector('#open-cart').addEventListener('click', () => cartDialog.showModal());
  document.querySelector('#close-cart').addEventListener('click', () => cartDialog.close());
  cartDialog.addEventListener('click', (event) => { if (event.target === cartDialog) cartDialog.close(); });
  document.querySelector('#finish-order').addEventListener('click', () => {
    const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
    if (!count) return;
    cart = {};
    renderCart();
    orderStatus.textContent = 'Pedido de demonstração concluído! Nenhum pagamento foi feito.';
  });
  renderCart();
}

const form = document.querySelector('#contact-form');

if (form) {
  const status = document.querySelector('#form-status');
  const fields = [...form.querySelectorAll('input, textarea')];

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

  fields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
  });
}
