'use strict';
// Полная jQuery 3.7.1 поддерживает эффекты; ready ждёт готовности элементов страницы.
$(function () {
  $('#add-set').prop('disabled', false);
  const message = document.querySelector('#cart-message');
  function announce(text) {
    $('#cart-message').removeClass('hidden').text(text);
  }
  // Save a complete candidate first so an outfit is never added partially.
  function commit(selections) {
    const saved = loadCart(products);
    if (saved.message) return announce(saved.message);
    const next = saved.items;
    for (const selection of selections) {
      const result = addToCart(products, next, ...selection);
      if (!result.success) return announce(result.message);
    }
    if (!Number.isSafeInteger(calculateCartTotal(products, next)) ||
        !Number.isSafeInteger(calculateCartQuantity(next))) return announce('Quantity is too large.');
    if (!saveCart(next)) return announce('Your cart could not be saved. No items were added.');
    cart.splice(0, cart.length, ...next);
    updateCartNavigation();
    announce('Added to your shared cart. Review your items in Catalog or Order.');
    return true;
  }
  function node(tag, classes = [], text) {
    const element = document.createElement(tag);
    element.classList.add(...classes);
    if (text !== undefined) element.textContent = text;
    return element;
  }

  // .find(), .append(), .on() заменяют поиск, создание узлов и addEventListener.
  // Работа с панелью стала понятнее; проверка и доступность требуют прежнего объёма кода.
  $('.look-product').each(function () {
    const article = $(this);
    const add = article.find('button').first();
    const product = findProductById(products, 'lookbook-' + add.attr('id').replace('add-', ''));
    article.find('.btn-check').remove();
    article.find('label').replaceWith(createFavoriteButton(product));
    const panel = $('<form>').attr({ id: 'picker-' + product.id, novalidate: true })
      .addClass('position-absolute top-0 start-0 w-100 mh-100 overflow-auto bg-white bg-opacity-75 border rounded p-2 m-0 z-3');
    const title = $('<span>').attr('id', panel.attr('id') + '-title').addClass('fw-semibold').text('Select size');
    const close = $('<button>').attr({ type: 'button', 'aria-label': 'Close size selection' })
      .addClass('btn btn-light btn-sm position-static border border-dark fs-5 lh-1').text('×');
    panel.attr('aria-labelledby', title.attr('id'));
    panel.append($('<div>').addClass('d-flex align-items-center justify-content-between gap-2 small mb-2').append(title, close));
    const size = $('<select>').attr({ id: 'lookbook-size-' + product.id, required: true, 'aria-label': 'Size for ' + product.name })
      .addClass('form-select form-select-sm').append($('<option>').val('').text('Choose size'));
    for (const value of product.sizes) size.append($('<option>').val(value).text(value));
    panel.append($('<label>').attr('for', size.attr('id')).addClass('form-label d-block small mb-1').text('Size'), size,
      $('<button>').attr('type', 'submit').addClass('btn btn-dark btn-sm position-static w-100 h-auto mt-2').text('Add to cart'));
    // find ищет контейнер фото, append вставляет панель, end возвращает article.
    article.find('.look-product-image').append(panel).end().addClass('position-relative');
    panel.hide();
    add.attr({ 'aria-controls': panel.attr('id'), 'aria-expanded': 'false' });
    function validSize() {
      const valid = product.sizes.includes(size.val());
      showJqueryError(size, valid ? '' : 'Choose a size.');
      return valid;
    }
    function open(focus) {
      add.attr('aria-expanded', 'true');
      panel.stop(true, true).fadeIn(200, function () { if (focus !== false) size.trigger('focus'); });
    }
    function closePanel() {
      add.attr('aria-expanded', 'false');
      panel.stop(true, true).fadeOut(200, function () { add.trigger('focus'); });
    }
    add.on('click', function () {
      if ($(this).attr('aria-expanded') === 'true') closePanel();
      else open();
    });
    close.on('click', closePanel);
    size.on('change', validSize);
    panel.on('submit', function (event) {
      // preventDefault отменяет переход/отправку формы: корзина хранится в браузере.
      event.preventDefault();
      if (validSize()) commit([[product.id, size.val(), 1]]);
      else size.trigger('focus');
    });
    article.data('picker', { product: product, open: open, close: closePanel, size: size, valid: validSize });
  });
  $(document).on('keydown', function (event) {
    if (event.key !== 'Escape') return;
    const opened = $('.look-product button[aria-expanded="true"]');
    if (!opened.length) return;
    event.preventDefault();
    // Сначала закрываем остальные панели, последней — панель с текущим фокусом.
    let active = opened.first().closest('.look-product');
    $('.look-product').each(function () {
      if ($(this).find(':focus').length) active = $(this);
    });
    opened.each(function () {
      const article = $(this).closest('.look-product');
      if (!article.is(active)) article.data('picker').close();
    });
    active.data('picker').close();
  });
  $('.look-section').each(function () {
    const section = $(this);
    $('<button>').attr('type', 'button').addClass('btn btn-outline-dark mt-3').text('Add entire look')
      .appendTo(section.find('.look-products')).on('click', function () {
        const selections = [];
        let firstInvalid = null;
        section.find('.look-product').each(function () {
          const picker = $(this).data('picker');
          picker.open(false);
          if (!picker.valid() && !firstInvalid) firstInvalid = picker.size;
          selections.push([picker.product.id, picker.size.val(), 1]);
        });
        if (firstInvalid) firstInvalid.trigger('focus');
        else commit(selections);
      });
  });
  // Random Look uses only existing page/Bootstrap classes and DOM nodes.
  function chooseRandomLook(items, previous = []) {
    const eligible = items.filter(item =>
      !item.isSet && !/\b(set|suit|co-ord|two[ -]piece)\b/i.test(item.name) &&
      Array.isArray(item.sizes) && item.sizes.length > 0
    );
    const tops = eligible.filter(item => item.category === 'tops');
    const bottoms = eligible.filter(item => item.category === 'bottoms');
    const pairs = tops.flatMap(top => bottoms.map(bottom => [top, bottom]));
    const alternatives = pairs.filter(pair => pair.some((item, index) => item.id !== previous[index]));
    const pool = alternatives.length ? alternatives : pairs;
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  }
  function randomNode(tag, classes = [], text) {
    const node = document.createElement(tag);
    node.classList.add(...classes);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function randomButton(text, classes) {
    const button = randomNode('button', classes, text);
    button.type = 'button';
    return button;
  }
  const randomTrigger = randomButton('Random Look', ['btn', 'btn-dark', 'mt-3']);
  const randomBlock = randomNode('section', ['bg-white', 'rounded-4', 'p-3', 'p-md-4', 'mx-3', 'mx-md-5', 'mt-4']);
  randomBlock.id = 'random-look-result';
  randomBlock.hidden = true;
  randomBlock.setAttribute('aria-labelledby', 'random-look-title');
  randomTrigger.setAttribute('aria-controls', randomBlock.id);
  randomTrigger.setAttribute('aria-expanded', 'false');
  const categories = document.querySelector('.style-categories-section');
  categories.append(randomTrigger);
  categories.after(randomBlock);
  let previousRandomPair = [];
  const money = price => price.toLocaleString('en-US') + ' KZT';
  function closeRandomLook() {
    randomBlock.hidden = true;
    randomTrigger.setAttribute('aria-expanded', 'false');
    randomTrigger.focus({ preventScroll: true });
  }
  // The same renderer handles initial generation, regeneration and empty results.
  function renderRandomLook(pair) {
    randomBlock.replaceChildren();
    const header = randomNode('div', ['d-flex', 'flex-wrap', 'align-items-center', 'justify-content-between', 'gap-2', 'mb-3']);
    const title = randomNode('h3', ['fs-4', 'mb-0'], 'Your random look');
    title.id = 'random-look-title'; title.tabIndex = -1;
    const actions = randomNode('div', ['d-flex', 'gap-2', 'align-items-center']);
    const again = randomButton('Generate again', ['btn', 'btn-outline-dark', 'btn-sm']);
    const close = randomButton('\u00d7', ['btn', 'btn-outline-dark', 'fs-4', 'lh-1']);
    close.setAttribute('aria-label', 'Close random look');
    close.title = 'Close random look (Escape)';
    again.addEventListener('click', generateRandomLook);
    close.addEventListener('click', closeRandomLook);
    actions.append(again, close); header.append(title, actions);
    randomBlock.append(header, randomNode('p', ['small', 'text-secondary'], 'A random combination of a top and a bottom. Styling compatibility is not guaranteed.'));
    if (!pair) {
      const empty = randomNode('p', ['mb-0'], 'No suitable combination is available. The catalog needs a separate top and bottom with available sizes.');
      empty.setAttribute('role', 'status'); randomBlock.append(empty);
    } else {
      const form = randomNode('form');
      const grid = randomNode('div', ['row', 'g-3']);
      const fields = [];
      for (const product of pair) {
        const column = randomNode('div', ['col-12', 'col-sm-6']);
        const article = randomNode('article', ['h-100']);
        const media = randomNode('div', ['look-product-image', 'overflow-hidden', 'rounded-3', 'bg-light']);
        const image = randomNode('img', ['w-100', 'h-100', 'd-block', 'object-fit-cover']);
        image.src = product.image; image.alt = product.name;
        media.append(image);
        const name = randomNode('h4', ['fs-6', 'mt-3', 'mb-1'], product.name);
        const price = randomNode('p', ['small', 'mb-2'], money(product.price));
        const label = randomNode('label', ['form-label'], 'Size');
        const size = randomNode('select', ['form-select']);
        size.id = 'random-size-' + product.id;
        size.name = size.id; size.required = true;
        size.setAttribute('aria-label', 'Size for ' + product.name);
        label.htmlFor = size.id;
        for (const value of ['', ...product.sizes]) {
          const option = document.createElement('option');
          option.value = value; option.textContent = value || 'Choose size';
          size.append(option);
        }
        article.append(media, name, price, label, size); column.append(article); grid.append(column);
        fields.push({ product, size });
      }
      const footer = randomNode('div', ['d-flex', 'flex-wrap', 'align-items-center', 'justify-content-between', 'gap-2', 'mt-3', 'pt-3', 'border-top']);
      const total = randomNode('p', ['fw-semibold', 'mb-0'], 'Complete look: ' + money(pair.reduce((sum, item) => sum + item.price, 0)));
      const add = randomNode('button', ['btn', 'btn-dark'], 'Add complete look'); add.type = 'submit';
      const feedback = randomNode('p', ['small', 'mt-2', 'mb-0']); feedback.setAttribute('role', 'status');
      footer.append(total, add); form.append(grid, footer, feedback);
      prepareInlineForm(form);
      form.addEventListener('input', () => { feedback.textContent = ''; });
      form.addEventListener('submit', event => {
        event.preventDefault();
        if (!validateInlineForm(form)) return;
        const saved = commit(fields.map(({ product, size }) => [product.id, size.value, 1]));
        feedback.textContent = saved ? 'Complete look added: one of each item in your selected sizes.' : message.textContent;
      });
      randomBlock.append(form);
    }
    randomBlock.hidden = false;
    randomTrigger.setAttribute('aria-expanded', 'true');
    title.focus();
  }
  function generateRandomLook() {
    const pair = chooseRandomLook(products, previousRandomPair);
    if (pair) previousRandomPair = pair.map(item => item.id);
    renderRandomLook(pair);
  }
  randomTrigger.addEventListener('click', generateRandomLook);
  randomBlock.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    event.preventDefault(); event.stopPropagation(); closeRandomLook();
  });
  function refreshHearts() {
    const saved = readFavorites(); favoriteIds = saved.ids;
    document.querySelectorAll('.look-product').forEach(article => {
      const product = $(article).data('picker').product;
      const button = article.querySelector('[id^="favorite-"]');
      const active = favoriteIds.includes(product.id);
      button.textContent = active ? '♥' : '♡';
      button.setAttribute('aria-pressed', String(active));
      button.title = active ? 'Remove from favorites' : 'Save to favorites';
    });
  }
  document.addEventListener('favoriteschange', () => { refreshHearts(); announce(favoritesMessage); });
  window.addEventListener('pageshow', refreshHearts);
  window.addEventListener('storage', event => {
    if (event.key === FAVORITES_STORAGE_KEY || event.key === null) refreshHearts();
  });
  const helper = document.createElement('form');
  helper.classList.add('border', 'p-3', 'my-3');
  const helperLabel = node('label', ['form-label'], 'Desired garment chest (cm)');
  const helperInput = node('input', ['form-control']);
  helperInput.id = 'size-helper-chest'; helperInput.type = 'number';
  helperInput.min = '1'; helperInput.max = '300'; helperInput.step = '0.1'; helperInput.required = true;
  helperLabel.htmlFor = helperInput.id; helperLabel.append(helperInput);
  const helperSubmit = node('button', ['btn', 'btn-outline-dark', 'ms-2'], 'Find size'); helperSubmit.type = 'submit';
  const helperResult = node('p', ['mt-2', 'mb-0']); helperResult.setAttribute('role', 'status');
  helper.append(node('h4', [], 'Size helper'), node('p', ['small'], 'A guide only for this t-shirt table. Compare garment measurements, not body measurements; this does not predict the fit of other Lookbook items.'), helperLabel, helperSubmit, helperResult);
  document.querySelector('.size-chart').append(helper);
  prepareInlineForm(helper);
  helper.addEventListener('submit', event => {
    event.preventDefault();
    if (!validateInlineForm(helper)) return;
    const chest = Number(helper.querySelector('input').value);
    const rows = [...document.querySelectorAll('.size-chart tbody tr')];
    const row = rows.find(row => Number(row.cells[1].textContent) >= chest);
    helper.querySelector('[role="status"]').textContent = row
      ? 'Table guide: ' + row.cells[0].textContent + ' — chest ' + row.cells[1].textContent + ' cm, length ' + row.cells[2].textContent + ' cm. Confirm fit with the store.'
      : 'Outside this table. Ask the store for measurements.';
  });

});
