'use strict';

// Сегодняшняя дата в формате YYYY-MM-DD.
function localDateString(date = new Date()) {
  return [
    String(date.getFullYear()).padStart(4, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

// Ограничиваем число цифр, сохраняя привычное оформление номера.
function limitPhoneDigits(value) {
  let digits = 0;
  return value.replace(/\d/g, (digit) => {
    digits += 1;
    return digits <= 11 ? digit : '';
  });
}

// Проверяем значения формы и возвращаем ошибки.
function validateOrder(values, today) {
  const errors = {};

  if (values.name === '') {
    errors.name = 'Enter your name.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email, for example name@mail.com.';
  }

  if (values.confirm === '' || values.confirm !== values.email) {
    errors.confirm = 'Enter the same email in both fields.';
  }

  const digits = values.phone.replace(/\D/g, '');

  if (
    !/^\+?[0-9\s()-]+$/.test(values.phone) ||
    digits.length !== 11
  ) {
    errors.phone =
      'Enter 11 digits, for example +7 700 000 00 00.';
  }

  if (values.badDate) {
    errors.date = 'Enter a complete, valid date.';
  } else if (values.date === '') {
    errors.date = 'Choose a pickup date.';
  } else {
    const date = new Date(values.date + 'T00:00:00');

    if (
      Number.isNaN(date.getTime()) ||
      localDateString(date) !== values.date ||
      values.date < today
    ) {
      errors.date = 'Choose today or a future date.';
    }
  }

  if (values.comment.length > 1000) {
    errors.comment = 'Keep the comment within 1000 characters.';
  }

  if (!values.agree) {
    errors.agree = 'Confirm your agreement before submitting.';
  }

  return errors;
}

const orderForm = document.querySelector('#order-form');
const orderStatus = document.querySelector('#order-status');
const orderSubmit = document.querySelector('#order-submit');
const pickupDate = document.querySelector('#pickup-date');
const orderError = document.querySelector('#order-error');
const orderSuccess = document.querySelector('#order-success');

pickupDate.required = true;
document.querySelector('label[for="pickup-date"]').textContent =
  'Desired pickup date*';

// Создаём поле подтверждения email.
const confirmGroup = document.createElement('p');
confirmGroup.classList.add('col-12', 'col-md-6', 'mb-3');

const confirmLabel = document.createElement('label');
confirmLabel.classList.add('form-label');
confirmLabel.htmlFor = 'email-confirm';
confirmLabel.textContent = 'Confirm email*';

const confirmInput = document.createElement('input');
confirmInput.classList.add('form-control');
confirmInput.type = 'email';
confirmInput.id = 'email-confirm';
confirmInput.name = 'email-confirm';
confirmInput.required = true;
confirmInput.autocomplete = 'off';

const confirmError = document.createElement('span');
confirmError.id = 'order-confirm-error';
confirmError.classList.add('invalid-feedback');

confirmGroup.append(confirmLabel, confirmInput, confirmError);

document.querySelector('#email').closest('p').after(confirmGroup);
document.querySelector('#name').closest('p')
  .classList.remove('col-md-6');

// Создаём место для ошибки даты.
const dateError = document.createElement('span');
dateError.id = 'order-date-error';
dateError.classList.add('invalid-feedback');
pickupDate.after(dateError);

const commentInput = document.querySelector('#comment');
const commentError = document.createElement('span');
commentError.id = 'order-comment-error';
commentError.classList.add('invalid-feedback');
commentInput.after(commentError);

// Собираем проверяемые поля.
const fields = {
  name: document.querySelector('#name'),
  email: document.querySelector('#email'),
  confirm: confirmInput,
  phone: document.querySelector('#phone'),
  date: pickupDate,
  agree: document.querySelector('#agree'),
  comment: commentInput
};

fields.phone.addEventListener('input', () => {
  const position = fields.phone.selectionStart;
  const value = fields.phone.value;
  const limited = limitPhoneDigits(value);
  if (limited !== value) {
    fields.phone.value = limited;
    const newPosition = limitPhoneDigits(value.slice(0, position)).length;
    fields.phone.setSelectionRange(newPosition, newPosition);
  }
});

for (const [key, input] of Object.entries(fields)) {
  input.setAttribute('aria-describedby', 'order-' + key + '-error');
}

const quantitySummary = document.createElement('p');
quantitySummary.classList.add('small', 'fw-bold');
document.querySelector('#order-items').after(quantitySummary);

const discountSummary = document.createElement('p');
discountSummary.classList.add('small', 'mb-2');
quantitySummary.after(discountSummary);

let demoComplete = false;
let cartLoadError = '';

function showMessage(element, message) {
  element.removeAttribute('hidden');
  element.classList.toggle('d-none', message === '');
  element.textContent = message;
}

function updateSubmitButton() {
  orderSubmit.disabled =
    cart.length === 0 ||
    demoComplete ||
    cartLoadError !== '';
}

function updateDateSummary() {
  document.querySelector('#summary-pickup-date').textContent =
    pickupDate.value || 'Not selected';
}

// Показываем товары и итоговую стоимость.
function renderOrderSummary() {
  const list = document.querySelector('#order-items');
  const fragment = document.createDocumentFragment();

  for (const item of cart) {
    const product = findProductById(products, item.productId);
    const row = document.createElement('li');
    row.className = 'order-review-item';
    const image = document.createElement('img');
    image.src = product.image;
    image.alt = product.name;
    image.className = 'order-review-image rounded';
    const details = document.createElement('div');
    const title = document.createElement('h5');
    title.className = 'h6';
    title.textContent = product.name;
    const options = document.createElement('p');
    options.className = 'order-review-options';
    options.textContent = 'Size: ' + item.size + ' · Qty: ' + item.quantity;
    const price = document.createElement('p');
    price.className = 'order-review-price';
    price.textContent = product.price.toLocaleString('en-US') + ' KZT';
    const priceLabel = document.createElement('span');
    priceLabel.textContent = 'per item';
    price.append(priceLabel);
    details.append(title, options);
    row.append(image, details, price);

    fragment.append(row);
  }

  list.replaceChildren(fragment);

  document.querySelector('#order-cart-empty')
    .classList.toggle('d-none', cart.length > 0);

  quantitySummary.textContent =
    'Total items: ' + calculateCartQuantity(cart);

  const subtotal = calculateCartTotal(products, cart);
  const discount = calculateCartDiscount(subtotal);
  discountSummary.classList.toggle('d-none', cart.length === 0);
  discountSummary.textContent = discount.amount > 0
    ? 'Original total: ' + subtotal.toLocaleString('en-US') +
      ' KZT. 5% discount: −' + discount.amount.toLocaleString('en-US') + ' KZT.'
    : 'Add ' + discount.remaining.toLocaleString('en-US') +
      ' KZT more to receive a 5% discount.';
  document.querySelector('#summary-total').textContent =
    discount.finalTotal.toLocaleString('en-US');

  updateDateSummary();
}

// Проверяем, не изменилась ли сохранённая корзина.
function refreshOrderCart() {
  const saved = loadCart(products);

  const changed =
    JSON.stringify(cart) !== JSON.stringify(saved.items);

  cart.splice(0, cart.length, ...saved.items);
  cartLoadError = saved.message;

  if (changed || cartLoadError !== '') {
    demoComplete = false;
    showMessage(orderSuccess, '');
  }

  pickupDate.min = localDateString();

  renderOrderSummary();
  showMessage(orderError, cartLoadError);

  if (!demoComplete) {
    orderStatus.textContent = cart.length > 0
      ? 'Review your items and complete the form for a demo preview.'
      : 'Add products in the catalog before submitting.';
  }

  updateSubmitButton();

  return changed;
}

// Читаем поля и убираем пробелы по краям.
function readOrderValues() {
  const values = {};

  for (const [key, input] of Object.entries(fields)) {
    values[key] = input.type === 'checkbox'
      ? input.checked
      : input.value.trim();
  }

  values.badDate = pickupDate.validity.badInput;

  return values;
}

// Показываем ошибку возле конкретного поля.
function showFieldError(key, message) {
  const input = fields[key];

  input.classList.toggle('is-invalid', message !== '');
  input.classList.toggle('is-valid', message === '');

  input.setAttribute('aria-invalid', String(message !== ''));

  document.getElementById('order-' + key + '-error').textContent =
    message;
}

// Обновляем ошибки, когда пользователь исправляет данные.
function handleFormEdit(event) {
  demoComplete = false;

  showMessage(orderSuccess, '');
  showMessage(orderError, cartLoadError);

  const errors = validateOrder(
    readOrderValues(),
    localDateString()
  );

  for (const [key, input] of Object.entries(fields)) {
    if (
      input === event.target ||
      input.classList.contains('is-invalid') ||
      (
        key === 'confirm' &&
        event.target === fields.email &&
        confirmInput.value !== ''
      )
    ) {
      showFieldError(key, errors[key] || '');
    }
  }

  orderStatus.textContent =
    'Details changed. Review the form before submitting.';

  updateDateSummary();
  updateSubmitButton();
}

// Используем свои сообщения об ошибках.
orderForm.noValidate = true;
orderSubmit.type = 'submit';

orderForm.addEventListener('input', handleFormEdit);
orderForm.addEventListener('change', handleFormEdit);

// Проверка и демонстрационное оформление.
orderForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (demoComplete) return;

  const cartChanged = refreshOrderCart();

  if (cartLoadError !== '' || cart.length === 0 || cartChanged) {
    showMessage(
      orderError,
      cartLoadError || (
        cart.length === 0
          ? 'Your cart is empty. Add products in the catalog.'
          : 'Your cart has changed. Review the updated items and submit again.'
      )
    );

    orderError.tabIndex = -1;
    orderError.focus();

    return;
  }

  const values = readOrderValues();

  for (const key of ['name', 'email', 'confirm', 'phone', 'comment']) {
    fields[key].value = values[key];
  }

  const errors = validateOrder(values, localDateString());
  let firstInvalid = null;

  for (const [key, input] of Object.entries(fields)) {
    showFieldError(key, errors[key] || '');

    if (errors[key] && firstInvalid === null) {
      firstInvalid = input;
    }
  }

  if (firstInvalid !== null) {
    showMessage(orderError, 'Correct the highlighted fields.');
    firstInvalid.focus();

    return;
  }

  // Случайный номер демонстрационного примера.
  const reference =
    'DEMO-' + Math.floor(100000 + Math.random() * 900000);

  const chosenItems = cart.map((item) => {
    const product = findProductById(products, item.productId);

    return product.name + ' (' + item.size + ') × ' + item.quantity;
  }).join('; ');

  showMessage(orderError, '');

  showMessage(
    orderSuccess,
    'Demo reference: ' + reference + '. No data was sent to a server. ' +
    'No real order or payment was created.'
  );

  const subtotal = calculateCartTotal(products, cart);
  const discount = calculateCartDiscount(subtotal);
  const summaryLines = [
    'Items: ' + chosenItems,
    'Collection: store pickup — 5/5 Ryskulov Street, Office 3, Astana.',
    'Preferred pickup date: ' + (values.date || 'Not selected'),
    'Total items: ' + calculateCartQuantity(cart),
    'Original total: ' + subtotal.toLocaleString('en-US') + ' KZT',
    'Discount: ' + discount.amount.toLocaleString('en-US') + ' KZT',
    'Total: ' + discount.finalTotal.toLocaleString('en-US') + ' KZT',
    'Comment: ' +
      (values.comment || 'None')
  ];

  for (const line of summaryLines) {
    const paragraph = document.createElement('p');
    paragraph.classList.add('mb-1', 'text-break');
    paragraph.textContent = line;

    orderSuccess.append(paragraph);
  }

  const download = document.createElement('button');
  download.type = 'button';
  download.classList.add('btn', 'btn-outline-dark', 'mt-2');
  download.textContent = 'Download demo summary';
  download.addEventListener('click', () => {
    const text = 'Demo reference: ' + reference +
      '\nNo real order or payment was created.\n\n' + summaryLines.join('\n');
    const url = URL.createObjectURL(new Blob([text], {type: 'text/plain;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = reference + '.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  orderSuccess.append(download);

  demoComplete = true;
  updateSubmitButton();

  orderStatus.textContent = 'Demo summary created.';

  orderSuccess.tabIndex = -1;
  orderSuccess.focus();
});

// Очищаем форму, ошибки и результат.
orderForm.addEventListener('reset', () => {
  demoComplete = false;

  for (const [key, input] of Object.entries(fields)) {
    input.classList.remove('is-invalid', 'is-valid');
    input.removeAttribute('aria-invalid');

    document.getElementById('order-' + key + '-error').textContent = '';
  }

  showMessage(orderSuccess, '');
  showMessage(orderError, cartLoadError);

  // Ждём, пока браузер сбросит значения полей.
  setTimeout(() => {
    updateDateSummary();
    updateSubmitButton();

    orderStatus.textContent = 'Form cleared.';
  }, 0);
});

document.querySelector('#order-instructions').textContent =
  'Review your cart and complete the required fields. ' +
  'Choose today or a future pickup date. ' +
  'Submitting creates a demonstration summary only. ' +
  'No order is sent to the store.';

window.addEventListener('pageshow', refreshOrderCart);

window.addEventListener('storage', (event) => {
  if (event.key === 'instyle-cart-v1' || event.key === null) {
    refreshOrderCart();
  }
});

showMessage(orderSuccess, '');
refreshOrderCart();
