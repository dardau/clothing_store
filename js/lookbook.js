'use strict';

(() => {
  document.querySelector('#add-set').disabled = false;
  const message = document.querySelector('#cart-message');
  function announce(text) {
    message.classList.remove('hidden');
    message.textContent = text;
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
  const panelClosers = new Map();
  function compactSizePanel(panel, trigger, closePanel) {
    prepareInlineForm(panel);
    panel.classList.add('position-absolute', 'top-0', 'start-0', 'w-100',
      'mh-100', 'overflow-auto', 'bg-white', 'bg-opacity-75', 'border', 'rounded', 'p-2', 'm-0', 'z-3');
    const header = node('div', ['d-flex', 'align-items-center', 'justify-content-between', 'gap-2', 'small', 'mb-2']);
    const title = node('span', ['fw-semibold'], 'Select size');
    title.id = panel.id + '-title';
    panel.setAttribute('aria-labelledby', title.id);
    const close = node('button', ['btn', 'btn-light', 'btn-sm', 'position-static', 'flex-shrink-0', 'border', 'border-dark', 'fs-5', 'lh-1'], '\u00d7');
    close.type = 'button'; close.title = 'Close size selection (Escape)';
    close.setAttribute('aria-label', 'Close size selection');
    close.addEventListener('click', closePanel);
    header.append(title, close); panel.prepend(header);
    panelClosers.set(panel, { trigger, closePanel });
  }
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const visible = [...panelClosers].filter(([panel]) => panel.isConnected && !panel.hidden);
    if (!visible.length) return;
    event.preventDefault();
    // Also handles panels opened together while focus stays on Add entire look.
    const active = visible.find(([panel, entry]) => panel.contains(document.activeElement) || entry.trigger === document.activeElement) || visible[0];
    visible.forEach(([panel]) => {
      panel.hidden = true;
      panelClosers.get(panel).trigger.setAttribute('aria-expanded', 'false');
    });
    active[1].closePanel();
  });
  const pickers = new Map();
  for (const article of document.querySelectorAll('.look-product')) {
    const add = article.querySelector('button');
    const product = findProductById(products, 'lookbook-' + add.id.replace('add-', ''));
    const heart = article.querySelector('.btn-check');
    const label = article.querySelector('label');
    heart.remove(); label.replaceWith(createFavoriteButton(product));
    const panel = document.createElement('form');
    panel.id = 'picker-' + product.id;
    panel.hidden = true;
    const sizeLabel = node('label', ['form-label', 'd-block', 'small', 'mb-1'], 'Size');
    const size = node('select', ['form-select', 'form-select-sm']);
    size.id = 'lookbook-size-' + product.id; size.name = size.id; size.required = true;
    sizeLabel.htmlFor = size.id;
    size.append(new Option('Choose size', ''));
    for (const value of product.sizes) size.append(new Option(value, value));
    size.setAttribute('aria-label', 'Size for ' + product.name);
    const submit = node('button', ['btn', 'btn-dark', 'btn-sm', 'position-static', 'w-100', 'h-auto', 'mt-2'], 'Add to cart');
    submit.type = 'submit'; panel.append(sizeLabel, size, submit);
    add.setAttribute('aria-controls', panel.id);
    add.setAttribute('aria-expanded', 'false');
    function open() { panel.hidden = false; add.setAttribute('aria-expanded', 'true'); }
    function closePanel() {
      panel.hidden = true;
      add.setAttribute('aria-expanded', 'false');
      add.focus({ preventScroll: true });
    }
    compactSizePanel(panel, add, closePanel);
    add.addEventListener('click', () => {
      if (panel.hidden) { open(); size.focus({ preventScroll: true }); }
      else closePanel();
    });
    panel.addEventListener('submit', event => {
      event.preventDefault();
      if (validateInlineForm(panel)) commit([[product.id, size.value, 1]]);
    });
    article.querySelector('.look-product-image').append(panel);
    pickers.set(article, { panel, open, size, product });
  }
  for (const section of document.querySelectorAll('.look-section')) {
    const button = document.createElement('button');
    button.type = 'button'; button.classList.add('btn', 'btn-outline-dark', 'mt-3');
    button.textContent = 'Add entire look';
    section.querySelector('.look-products').append(button);
    button.addEventListener('click', () => {
      const selections = [...section.querySelectorAll('.look-product')].map(article => pickers.get(article));
      selections.forEach(picker => picker.open());
      const invalid = selections.filter(picker => !validateInlineForm(picker.panel, false));
      if (invalid.length) {
        invalid[0].panel.querySelector('[aria-invalid="true"]').focus();
        return;
      }
      commit(selections.map(picker => [picker.product.id, picker.size.value, 1]));
    });
  }
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
      const { product } = pickers.get(article);
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
  const form = document.querySelector('#availability-form');
  const availabilityResult = document.querySelector('#availability-result');
  availabilityResult.classList.remove('hidden');
  availabilityResult.classList.add('d-none');
  const email = form.querySelector('#customer-email');
  const phoneGroup = document.createElement('div');
  phoneGroup.classList.add('mb-3');
  const phoneLabel = node('label', ['form-label'], 'Your phone'); phoneLabel.htmlFor = 'customer-phone';
  const phone = node('input', ['form-control']); phone.id = 'customer-phone'; phone.type = 'tel'; phone.autocomplete = 'tel';
  phoneGroup.append(phoneLabel, phone); email.closest('.row').after(phoneGroup);
  form.querySelector('#color').maxLength = 60;
  form.querySelector('#comment').maxLength = 1000;
  form.querySelector('#item-name').maxLength = 100;
  const radios = [...form.querySelectorAll('[name="notify"]')];
  radios[0].required = true;
  function contactMode() {
    email.required = radios[0].checked;
    phone.required = radios[1].checked;
  }
  radios.forEach(radio => radio.addEventListener('change', () => {
    contactMode();
    email.setCustomValidity('');
    phone.setCustomValidity('');
    availabilityResult.classList.add('d-none');
  }));
  contactMode();
  document.querySelector('#availability-note').textContent = 'Demo validation only. No request is sent and availability is not confirmed. Contact the store directly.';
  document.querySelector('#availability-submit').textContent = 'Check details';
  prepareInlineForm(form);
  form.addEventListener('submit', event => {
    event.preventDefault();
    contactMode();
    const item = form.querySelector('#item-name');
    item.setCustomValidity(item.value.trim().length >= 2 && item.value.trim().length <= 100 ? '' : 'Enter an item name of 2–100 characters.');
    email.value = email.value.trim();
    phone.setCustomValidity(!phone.required || (/^\+?[\d\s()-]+$/.test(phone.value) && phone.value.replace(/\D/g, '').length >= 10 && phone.value.replace(/\D/g, '').length <= 15) ? '' : 'Enter a phone number with 10–15 digits.');
    const valid = validateInlineForm(form);
    const result = document.querySelector('#availability-result');
    result.classList.toggle('d-none', !valid);
    result.textContent = valid ? 'Details are valid. Nothing was sent to the store. Please contact the store to check availability.' : '';
  });
  form.addEventListener('input', event => {
    event.target.setCustomValidity('');
    availabilityResult.classList.add('d-none');
  });
  form.addEventListener('reset', () => {
    form.querySelectorAll('input').forEach(input => input.setCustomValidity(''));
    availabilityResult.classList.add('d-none');
    setTimeout(contactMode, 0);
  });
})();
