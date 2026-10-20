'use strict';

function createProductCard(product) {
  const card = document.createElement('li');
  card.classList.add('product-card', 'col-12', 'col-sm-6', 'col-lg-3');

  const figure = document.createElement('figure');
  figure.classList.add('card', 'h-100', 'mb-0', 'border-0', 'rounded-0');

  // Фотография и панель размеров поверх неё.
  const media = document.createElement('div');
  media.classList.add('position-relative', 'overflow-hidden');

  const image = document.createElement('img');
  image.classList.add('d-block', 'w-100', 'object-fit-cover');
  image.src = product.image;
  image.alt = product.name;

  const caption = document.createElement('figcaption');
  caption.classList.add('pt-2', 'pb-3');

  const details = document.createElement('div');
  details.classList.add('d-flex', 'align-items-start', 'gap-2');

  const text = document.createElement('div');
  text.classList.add('flex-grow-1');

  const name = document.createElement('p');
  name.classList.add('small', 'mb-1');
  name.textContent = product.name;

  const price = document.createElement('p');
  price.classList.add('small', 'mb-0');
  price.textContent = product.price.toLocaleString('en-US') + ' KZT';

  // Плюс открывает размеры.
  const button = document.createElement('button');
  button.type = 'button';
  button.id = 'add-' + product.id;
  button.classList.add('btn', 'btn-outline-dark', 'p-2', 'flex-shrink-0');
  button.textContent = '+';
  button.setAttribute('aria-label', 'Choose size for ' + product.name);
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'sizes-' + product.id);

  const panel = document.createElement('div');
  panel.id = 'sizes-' + product.id;
  panel.classList.add(
    'position-absolute', 'top-0', 'start-0', 'w-100', 'h-100',
    'bg-white', 'border', 'p-2', 'overflow-auto',
    'flex-column', 'gap-2', 'd-none'
  );
  panel.setAttribute('role', 'group');
  panel.setAttribute('aria-label', 'Choose size for ' + product.name);

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.classList.add(
    'btn', 'btn-outline-dark', 'btn-sm',
    'align-self-end', 'flex-shrink-0'
  );
  closeButton.textContent = '×';
  closeButton.setAttribute('aria-label', 'Close size selection');
  panel.append(closeButton);

  const heading = document.createElement('p');
  heading.classList.add('small', 'mb-1', 'flex-shrink-0');
  heading.textContent = 'Choose your size';
  panel.append(heading);

  // Сообщение после добавления.
  const feedback = document.createElement('p');
  feedback.classList.add('small', 'mb-0');
  feedback.setAttribute('role', 'status');

  const viewCart = document.createElement('a');
  viewCart.href = '#cart';
  viewCart.classList.add(
    'btn', 'btn-outline-dark', 'btn-sm', 'mt-2', 'd-none'
  );
  viewCart.textContent = 'View cart';

  function setPickerOpen(isOpen) {
    panel.classList.toggle('d-none', !isOpen);
    panel.classList.toggle('d-flex', isOpen);
    button.setAttribute('aria-expanded', String(isOpen));
    button.textContent = isOpen ? '−' : '+';

    if (isOpen) {
      panel.querySelector('[data-size]').focus({ preventScroll: true });
    } else {
      button.focus({ preventScroll: true });
    }
  }

  // Создаём кнопку для каждого доступного размера.
  for (const size of product.sizes) {
    const sizeButton = document.createElement('button');
    sizeButton.type = 'button';
    sizeButton.dataset.size = size;
    sizeButton.classList.add(
      'btn', 'btn-outline-dark', 'text-start',
      'text-wrap', 'flex-shrink-0'
    );
    sizeButton.textContent = size;
    sizeButton.setAttribute(
      'aria-label',
      'Add ' + product.name + ', size ' + size
    );

    sizeButton.addEventListener('click', () => {
      const result = addToCart(products, cart, product.id, size, 1);

      showCartMessage(result.message);
      feedback.classList.add('mt-2');

      if (!result.success) {
        feedback.textContent = result.message;
        return;
      }

      renderCart();

      feedback.textContent =
        'Added to cart · Size: ' + size +
        ' · Total items: ' + calculateCartQuantity(cart);

      viewCart.classList.remove('d-none');
      setPickerOpen(false);
    });

    panel.append(sizeButton);
  }

  button.addEventListener('click', () => {
    setPickerOpen(button.getAttribute('aria-expanded') === 'false');
  });

  closeButton.addEventListener('click', () => {
    setPickerOpen(false);
  });

  // Панель можно закрыть клавишей Escape.
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setPickerOpen(false);
    }
  });

  text.append(name, price);
  details.append(text, button);
  caption.append(details, feedback, viewCart);
  media.append(image, panel);
  figure.append(media, caption);
  card.append(figure);

  return card;
}

function renderProductList(items, listElement) {
  const fragment = document.createDocumentFragment();

  if (items.length === 0) {
    const message = document.createElement('li');
    message.classList.add('col-12', 'text-body-secondary');
    message.textContent = 'No products found.';

    fragment.append(message);
  } else {
    for (const product of items) {
      const card = createProductCard(product);
      fragment.append(card);
    }
  }

  listElement.replaceChildren(fragment);

  return items.length;
}

// Выводим товары в существующие разделы каталога.
const productCategories = [
  'tops',
  'bottoms',
  'outerwear',
  'accessories'
];

for (const category of productCategories) {
  const listElement = document.querySelector(
    '#' + category + ' .product-grid'
  );

  if (listElement !== null) {
    const categoryProducts = filterProducts(products, '', category);

    renderProductList(categoryProducts, listElement);
  }
}
function showCartMessage(message) {
  document.querySelector('#cart-status').textContent = message;
}

function renderCart() {
  const list = document.querySelector('#cart-items');
  const template = document.querySelector('#cart-item-template');
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < cart.length; index += 1) {
    const cartItem = cart[index];
    const product = findProductById(products, cartItem.productId);

    const row = template.content.firstElementChild.cloneNode(true);

    row.querySelector('.cart-item-name').textContent = product.name;

    row.querySelector('.cart-item-price').textContent =
      product.price.toLocaleString('en-US');

    row.querySelector('.cart-item-subtotal').textContent =
      calculateSubtotal(
        product.price,
        cartItem.quantity
      ).toLocaleString('en-US');

        // Размер уже выбран в карточке товара.
    const sizeText = document.createElement('p');
    sizeText.classList.add('small', 'mb-2');
    sizeText.textContent = 'Size: ' + cartItem.size;

    row.querySelector('.cart-item-size')
      .closest('label')
      .replaceWith(sizeText);

    // Компактный счётчик вместо поля Quantity.
    const controls = document.createElement('div');
    controls.classList.add(
      'd-inline-flex', 'align-items-center', 'gap-2'
    );
    controls.setAttribute('role', 'group');
    controls.setAttribute(
      'aria-label',
      'Quantity for ' + product.name + ', ' + cartItem.size
    );

    const minus = document.createElement('button');
    minus.type = 'button';
    minus.id = 'cart-minus-' + index;
    minus.classList.add('btn', 'btn-outline-dark', 'btn-sm');
    minus.textContent = '−';
    minus.disabled = cartItem.quantity === 1;
    minus.setAttribute('aria-label', 'Decrease quantity');

    const count = document.createElement('span');
    count.textContent = cartItem.quantity;

    const plus = document.createElement('button');
    plus.type = 'button';
    plus.id = 'cart-plus-' + index;
    plus.classList.add('btn', 'btn-outline-dark', 'btn-sm');
    plus.textContent = '+';
    plus.setAttribute('aria-label', 'Increase quantity');

    function changeQuantity(change) {
      const quantity = cartItem.quantity + change;

      const result = updateCartQuantity(
        cart,
        cartItem.productId,
        cartItem.size,
        quantity
      );

      if (!result.success) {
        showCartMessage(result.message);
        return;
      }

      renderCart();

      showCartMessage(
        product.name + ', ' + cartItem.size + ': ' + quantity
      );

      // После перерисовки возвращаем фокус на доступную кнопку.
      const prefix = change < 0 && quantity > 1
        ? 'cart-minus-'
        : 'cart-plus-';

      document.getElementById(prefix + index)
        .focus({ preventScroll: true });
    }

    minus.addEventListener('click', () => changeQuantity(-1));
    plus.addEventListener('click', () => changeQuantity(1));

    controls.append(minus, count, plus);

    row.querySelector('.cart-item-quantity')
      .closest('label')
      .replaceWith(controls);

    // Удаление позиции.
    const removeButton = row.querySelector('.cart-item-remove');

    removeButton.setAttribute(
      'aria-label',
      'Remove ' + product.name + ' ' + cartItem.size
    );

    removeButton.addEventListener('click', () => {
      const result = removeFromCart(
        cart,
        cartItem.productId,
        cartItem.size
      );

      renderCart();
      showCartMessage(result.message);
      focusCartTitle();
    });

    fragment.append(row);
  }

  list.replaceChildren(fragment);

  const isEmpty = cart.length === 0;

  document.querySelector('#cart-count').textContent =
    calculateCartQuantity(cart);

  document.querySelector('#cart-total').textContent =
    calculateCartTotal(products, cart).toLocaleString('en-US');

  document.querySelector('#cart-empty')
    .classList.toggle('d-none', !isEmpty);

  const summary = document.querySelector('#cart-summary');
  summary.removeAttribute('hidden');
  summary.classList.toggle('d-none', isEmpty);

  const allSizesSelected = cart.every((item) => {
    const product = findProductById(products, item.productId);
    return product.sizes.includes(item.size);
  });

    const isSaved = saveCart(cart);

  const storageError = document.querySelector('#cart-error');

  storageError.removeAttribute('hidden');
  storageError.classList.toggle('d-none', isSaved);

  storageError.textContent = isSaved
    ? ''
    : 'Your cart could not be saved in this browser. Checkout is unavailable.';

  setCheckoutAvailable(!isEmpty && allSizesSelected && isSaved);
}

function setCheckoutAvailable(available) {
  const checkout = document.querySelector('#cart-checkout');

  checkout.classList.toggle('disabled', !available);
  checkout.setAttribute('aria-disabled', String(!available));

  if (available) {
    checkout.removeAttribute('tabindex');
  } else {
    checkout.setAttribute('tabindex', '-1');
  }
}

function focusCartTitle() {
  const title = document.querySelector('#cart-title');
  title.setAttribute('tabindex', '-1');
  title.focus();
}

document.querySelector('#cart-clear').addEventListener('click', () => {
  const result = clearCart(cart);

  renderCart();
  showCartMessage(result.message);
  focusCartTitle();
});

document.querySelector('#cart-checkout').addEventListener('click', (event) => {
  const checkout = event.currentTarget;

  if (checkout.getAttribute('aria-disabled') === 'true') {
    event.preventDefault();
    showCartMessage('Add products and select their sizes before ordering.');
  }
});

// Пояснение для посетителя.
const sizeHint = document.createElement('p');
sizeHint.classList.add('small', 'text-body-secondary', 'mb-3');
sizeHint.textContent =
  'Sizes are chosen in the catalog. Use − and + to change quantities.';

document.querySelector('#cart-items').before(sizeHint);

// Начальное состояние корзины.
renderCart();
if (loadedCart.message !== '') {
  showCartMessage(loadedCart.message);
}