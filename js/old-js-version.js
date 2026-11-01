// Архив JavaScript до jQuery. Не подключать к страницам.
// Lookbook: прежняя реализация и помощники.
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

// Прежняя реализация и её помощники.
'use strict';
(() => {
  const KEY = 'instyle-reviews-v1';
  const DRAFT = 'instyle-review-draft-v1';
  const VOTES = 'instyle-review-helpful-v1';
  const list = document.querySelector('#review-list');
  const form = document.querySelector('#review-form');
  form.querySelector('#review-note').textContent = 'New reviews are saved only in this browser and are not published on 2GIS.';
  const name = form.querySelector('#review-name');
  const rating = form.querySelector('#review-rating');
  const text = form.querySelector('#review-text');
  const result = form.querySelector('#review-result');
  const error = form.querySelector('#review-error');
  const originals = [...list.querySelectorAll('article')].map((card, index) => ({
    id: 'original-' + index,
    name: card.querySelector('h3').textContent.trim(),
    text: card.querySelector('.review-body').textContent.trim(),
    rating: (card.querySelector('.review-stars-date').textContent.match(/★/g) || []).length,
    date: card.querySelector('time').dateTime,
    original: true,
    node: card.parentElement.cloneNode(true)
  }));
  function status(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
    element.classList.toggle('d-none', !message);
  }
  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
    catch { status(error, 'Saved browser data could not be loaded.'); return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { status(error, 'Could not save in this browser. Your changes have not been saved.'); return false; }
  }
  function validReview(review) {
    return review && typeof review.id === 'string' && review.id.startsWith('local-') &&
      typeof review.name === 'string' && review.name.trim().length >= 2 && review.name.length <= 60 &&
      typeof review.text === 'string' && review.text.trim().length >= 10 && review.text.length <= 2000 &&
      Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5 &&
      typeof review.date === 'string' && Number.isFinite(Date.parse(review.date));
  }
  function loadReviews() {
    const saved = read(KEY, []);
    if (!Array.isArray(saved) || !saved.every(validReview) || new Set(saved.map(item => item.id)).size !== saved.length) {
      status(error, 'Saved reviews are invalid. They cannot be loaded.'); return [];
    }
    // Keep browser data separate from the trusted HTML review records.
    return saved.map(({ id, name, text, rating, date }) => ({ id, name, text, rating, date }));
  }
  let own = loadReviews();
  let votes = read(VOTES, []);
  if (!Array.isArray(votes)) votes = [];
  votes = votes.filter(id => typeof id === 'string');
  name.minLength = 2; name.maxLength = 60;
  text.minLength = 10; text.maxLength = 2000;
  rating.required = true;
  rating.insertBefore(new Option('Choose a rating', ''), rating.firstChild);
  rating.value = '';
  const count = document.createElement('p');
  count.id = 'review-character-count'; count.classList.add('small', 'text-secondary');
  text.setAttribute('aria-describedby', count.id);
  text.after(count);
  const preview = document.createElement('article');
  preview.classList.add('review-text-card', 'rounded-2', 'p-3', 'mb-3');
  const previewTitle = document.createElement('h4'); previewTitle.textContent = 'Review preview';
  const previewName = document.createElement('p');
  const previewText = document.createElement('p'); previewText.classList.add('text-break', 'text-wrap');
  preview.append(previewTitle, previewName, previewText);
  form.querySelector('#review-submit').before(preview);
  const draftStatus = document.createElement('p');
  draftStatus.classList.add('small', 'text-secondary'); draftStatus.setAttribute('role', 'status');
  preview.after(draftStatus);
  const draft = read(DRAFT, null);
  if (draft && typeof draft.name === 'string' && typeof draft.text === 'string') {
    name.value = draft.name.slice(0, 60); text.value = draft.text.slice(0, 2000);
    rating.value = /^[1-5]$/.test(String(draft.rating)) ? String(draft.rating) : '';
  }
  function updatePreview(save) {
    count.textContent = text.value.length + ' / 2000 characters (minimum 10)';
    previewName.textContent = (name.value.trim() || 'Your name') + ' · ' + (rating.value ? rating.value + '/5' : 'No rating selected');
    previewText.textContent = text.value || 'Your review will appear here.';
    if (save) draftStatus.textContent = write(DRAFT, { name: name.value, rating: rating.value, text: text.value }) ? 'Draft saved in this browser.' : 'Draft could not be saved.';
  }
  function formatReviewDate(date) {
    const created = new Date(date);
    // Date-only records have no known creation time; keep their calendar date.
    return /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? created.toLocaleDateString('en-GB', { timeZone: 'UTC' })
      : created.toLocaleString('en-GB');
  }
  function render() {
    const shown = [...originals, ...own].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    list.replaceChildren();
    for (const review of shown) {
      let column;
      if (review.original) column = review.node.cloneNode(true);
      else {
        column = document.createElement('div'); column.classList.add('col-12', 'col-md-6', 'col-lg-4');
        const card = document.createElement('article'); card.classList.add('review-text-card', 'rounded-2', 'p-3', 'h-100');
        const heading = document.createElement('h3'); heading.classList.add('text-break'); heading.textContent = review.name;
        const stars = document.createElement('p'); stars.classList.add('review-stars-date', 'small');
        stars.textContent = '★'.repeat(review.rating) + ' · ' + formatReviewDate(review.date);
        const body = document.createElement('p'); body.classList.add('small', 'text-break', 'text-wrap'); body.textContent = review.text;
        const badge = document.createElement('p'); badge.classList.add('small', 'text-secondary'); badge.textContent = 'Your review · saved only in this browser';
        card.append(heading, stars, body, badge); column.append(card);
      }
      const card = column.querySelector('article');
      const actions = document.createElement('div'); actions.classList.add('d-flex', 'flex-wrap', 'gap-2', 'mt-3');
      const helpful = document.createElement('button'); helpful.type = 'button'; helpful.classList.add('btn', 'btn-outline-dark', 'btn-sm');
      helpful.textContent = 'Helpful (' + (votes.includes(review.id) ? 1 : 0) + ')';
      helpful.setAttribute('aria-pressed', String(votes.includes(review.id)));
      helpful.addEventListener('click', () => {
        const savedVotes = read(VOTES, []);
        const current = Array.isArray(savedVotes) ? savedVotes.filter(id => typeof id === 'string') : [];
        const next = current.includes(review.id) ? current.filter(id => id !== review.id) : [...current, review.id];
        if (!write(VOTES, next)) return;
        votes = next; render();
        [...list.querySelectorAll('[data-review-id]')].find(button => button.dataset.reviewId === review.id)?.focus();
      });
      helpful.dataset.reviewId = review.id; actions.append(helpful);
      if (!review.original) {
        const remove = document.createElement('button'); remove.type = 'button'; remove.classList.add('btn', 'btn-outline-danger', 'btn-sm'); remove.textContent = 'Delete my review';
        remove.addEventListener('click', () => {
          const next = loadReviews().filter(item => item.id !== review.id);
          if (!write(KEY, next)) return;
          own = next; render(); status(result, 'Your review was deleted from this browser.');
        }); actions.append(remove);
      }
      card.append(actions); list.append(column);
    }
  }
  prepareInlineForm(form);
  form.addEventListener('input', event => {
    event.target.setCustomValidity(''); status(result, ''); updatePreview(true);
  });
  form.addEventListener('submit', event => {
    event.preventDefault(); status(error, ''); status(result, '');
    name.setCustomValidity(name.value.trim().length >= 2 && name.value.trim().length <= 60 ? '' : 'Enter a name with 2–60 characters.');
    text.setCustomValidity(text.value.trim().length >= 10 && text.value.trim().length <= 2000 ? '' : 'Write a review with 10–2000 characters.');
    rating.setCustomValidity(/^[1-5]$/.test(rating.value) ? '' : 'Choose a rating from 1 to 5.');
    if (!validateInlineForm(form)) return;
    const review = { id: 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2), name: name.value.trim(), text: text.value.trim(), rating: Number(rating.value), date: new Date().toISOString() };
    // Reload before mutation to retain reviews added in other tabs.
    const next = [...loadReviews(), review];
    if (!write(KEY, next)) return;
    own = next;
    form.reset();
    render(); status(result, 'Review saved only in this browser. It has not been published on 2GIS.');
  });
  form.addEventListener('reset', () => {
    [name, rating, text].forEach(field => field.setCustomValidity(''));
    status(error, ''); status(result, '');
    // A reset cancels the draft; persist an empty draft even if removeItem is unavailable.
    if (write(DRAFT, { name: '', rating: '', text: '' })) draftStatus.textContent = 'Draft cleared.';
    setTimeout(() => { rating.value = ''; updatePreview(false); }, 0);
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) { own = loadReviews(); render(); }
  });
  window.addEventListener('storage', event => {
    if (event.key === KEY || event.key === VOTES || event.key === null) {
      own = loadReviews();
      const saved = read(VOTES, []); votes = Array.isArray(saved) ? saved.filter(id => typeof id === 'string') : [];
      render();
    }
  });
  updatePreview(false); render();
})();

// Прежняя реализация и её помощники.
// Shared validation helpers.
const inlineFormMessages = new WeakMap();
let inlineMessageNumber = 0;
function clearInlineFieldError(field) {
  const message = inlineFormMessages.get(field);
  field.classList.remove('error', 'is-invalid');
  field.removeAttribute('aria-invalid');
  if (message) { message.textContent = ''; message.hidden = true; message.classList.add('d-none'); }
}
function prepareInlineForm(form) {
  form.noValidate = true;
  function edit(event) {
    if (!event.target.matches('input, select, textarea')) return;
    event.target.setCustomValidity('');
    clearInlineFieldError(event.target);
    if (event.target.type === 'radio') {
      [...form.elements].filter(field => field.name === event.target.name).forEach(clearInlineFieldError);
    }
  }
  form.addEventListener('input', edit);
  form.addEventListener('change', edit);
  form.addEventListener('reset', () => {
    [...form.elements].filter(field => field.willValidate).forEach(field => {
      field.setCustomValidity(''); clearInlineFieldError(field);
    });
  });
}
function validateInlineForm(form, focus = true) {
  let first = null;
  for (const field of form.elements) {
    if (!field.willValidate) continue;
    clearInlineFieldError(field);
    let text = '';
    if (!field.validity.valid) {
      if (field.validity.customError) text = field.validationMessage;
      else if (field.validity.valueMissing) {
        if (field.tagName === 'SELECT') text = /size/i.test(field.id + ' ' + field.getAttribute('aria-label')) ? 'Choose a size.' : 'Choose an option.';
        else if (field.type === 'radio') text = 'Choose a notification method.';
        else if (field.type === 'email') text = 'Enter your email.';
        else if (field.type === 'tel') text = 'Enter your phone number.';
        else text = 'Complete this field.';
      } else if (field.type === 'email') text = 'Enter a valid email address.';
      else if (field.type === 'number') text = 'Enter a number within the allowed range.';
      else text = field.validationMessage;
    }
    if (!text) continue;
    let message = inlineFormMessages.get(field);
    if (!message) {
      message = document.createElement('span');
      message.id = 'inline-field-error-' + (++inlineMessageNumber);
      message.classList.add('text-danger', 'small', 'd-block', 'mt-1');
      message.setAttribute('aria-live', 'polite');
      field.after(message);
      const described = field.getAttribute('aria-describedby');
      field.setAttribute('aria-describedby', [described, message.id].filter(Boolean).join(' '));
      inlineFormMessages.set(field, message);
    }
    message.textContent = text; message.hidden = false;
    // Bootstrap d-block has !important; use the existing hidden class as well.
    message.classList.remove('hidden', 'd-none');
    field.classList.add('is-invalid'); field.setAttribute('aria-invalid', 'true');
    if (!first) first = field;
  }
  if (first && focus) first.focus();
  return first === null;
}

// Unlinked comparison copy for Assignment 6.

// ===== CATALOG — original plain JavaScript =====
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
    viewCart.href = CART_URL;
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

            const savingError = document.querySelector('#cart-error').textContent;

            feedback.textContent = savingError || (
                'Added to cart · Size: ' + size +
                ' · Total items: ' + calculateCartQuantity(cart)
            );

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
    media.append(image, createFavoriteButton(product), panel);
    figure.append(media, caption);
    card.append(figure);
    styleSizePicker(card, product);

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
        const content = row.firstElementChild;
        const information = content.firstElementChild;
        const actions = content.lastElementChild;

        content.classList.remove(
            'd-flex', 'flex-column', 'flex-sm-row',
            'justify-content-between', 'gap-3'
        );

        content.classList.add('row', 'g-3');

        information.classList.remove('flex-grow-1');
        information.classList.add('col-8', 'col-md-6');

        actions.classList.add('col-12', 'col-md-4');

        const photoColumn = document.createElement('div');
        photoColumn.classList.add('col-4', 'col-md-2');

        const photo = document.createElement('img');
        photo.src = product.image;
        photo.alt = '';
        photo.classList.add('img-fluid', 'w-100', 'rounded');

        photoColumn.append(photo);
        content.prepend(photoColumn);

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
    updateCartNavigation();
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
function configureCartView() {
    const cartSection = document.querySelector('#cart');

    // В обычном каталоге полную корзину не показываем.
    if (!isCartView) {
        cartSection.classList.add('d-none');
        return;
    }

    document.title = 'Shopping cart — Instyle.zh2';

    const page = document.createElement('div');
    page.classList.add('container', 'py-4');

    const back = document.createElement('a');
    back.href = 'catalog.html';
    back.classList.add('btn', 'btn-outline-dark', 'text-wrap');
    back.textContent = '← Continue shopping';

    const oldTitle = document.querySelector('#cart-title');

    const title = document.createElement('h2');
    title.id = 'cart-title';
    title.classList.add('h3', 'mb-0');
    title.textContent = 'Your shopping cart';

    oldTitle.replaceWith(title);

    document.querySelector('#cart-empty').textContent =
        'Your cart is empty. Choose Continue shopping to add products.';

    // Переносим существующую корзину в отдельный экран.
    page.append(back, cartSection);
    document.querySelector('main').replaceChildren(page);
}

// Загружаем актуальное содержимое после возвращения на страницу.
function refreshCatalogCart() {
    const storedCart = loadCart(products);

    cart.splice(0, cart.length, ...storedCart.items);

    renderCart();

    showCartMessage(
        storedCart.message || 'Your cart has been updated.'
    );
}

configureCartView();

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        refreshCatalogCart();
    }
});

window.addEventListener('storage', (event) => {
    if (event.key === 'instyle-cart-v1' || event.key === null) {
        refreshCatalogCart();
    }
});
function setupCatalogControls() {
    // На отдельном экране корзины поиск не нужен.
    if (isCartView) return;

    const firstCategory = document.querySelector('#tops');

    const section = document.createElement('section');
    section.id = 'catalog-products';
    section.classList.add('my-5');
    section.setAttribute('aria-labelledby', 'catalog-products-title');

    const heading = document.createElement('h2');
    heading.id = 'catalog-products-title';
    heading.classList.add('h3', 'mb-4');
    heading.textContent = 'Shop the collection';
    heading.tabIndex = -1;

    const form = document.createElement('form');
    form.classList.add('row', 'g-3', 'mb-3');
    form.setAttribute('role', 'search');
    form.setAttribute('aria-label', 'Find products');

    // Создаёт поле вместе с подписью и колонкой Bootstrap.
    function createControl(tag, id, labelText, columns) {
        const group = document.createElement('div');
        group.classList.add(...columns);

        const label = document.createElement('label');
        label.htmlFor = id;
        label.classList.add('form-label');
        label.textContent = labelText;

        const control = document.createElement(tag);
        control.id = id;

        control.classList.add(
            tag === 'input' ? 'form-control' : 'form-select'
        );

        group.append(label, control);
        form.append(group);

        return control;
    }

    // Добавляет варианты в выпадающий список.
    function addOptions(select, options) {
        for (const [value, text] of options) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = text;
            select.append(option);
        }
    }

    const search = createControl(
        'input',
        'catalog-search',
        'Search by name',
        ['col-12', 'col-md-6']
    );

    search.type = 'search';
    search.placeholder = 'For example: jacket';

    const category = createControl(
        'select',
        'catalog-category',
        'Category',
        ['col-12', 'col-sm-6', 'col-md-3']
    );

    addOptions(category, [
        ['all', 'All categories'],
        ['tops', 'Tops'],
        ['bottoms', 'Bottoms'],
        ['outerwear', 'Outerwear'],
        ['accessories', 'Accessories']
    ]);

    const sort = createControl(
        'select',
        'catalog-sort',
        'Sort by',
        ['col-12', 'col-sm-6', 'col-md-3']
    );

    addOptions(sort, [
        ['default', 'Default order'],
        ['price-asc', 'Price: low to high'],
        ['price-desc', 'Price: high to low']
    ]);

    const toolbar = document.createElement('div');
    toolbar.classList.add(
        'd-flex', 'flex-wrap', 'align-items-center',
        'justify-content-between', 'gap-2', 'mb-3'
    );

    const count = document.createElement('p');
    count.classList.add('small', 'text-body-secondary', 'mb-0');
    count.setAttribute('role', 'status');
    count.setAttribute('aria-atomic', 'true');

    const reset = document.createElement('button');
    reset.type = 'button';
    reset.classList.add(
        'btn', 'btn-outline-dark', 'btn-sm', 'text-wrap'
    );
    reset.textContent = 'Reset filters';

    const results = document.createElement('ul');
    results.classList.add(
        'product-grid', 'row', 'g-2',
        'g-md-4', 'list-unstyled', 'mb-5'
    );

    const favoritesFilter = createFavoritesFilter(updateResults);

    toolbar.append(count, favoritesFilter.group, reset);

    section.append(
        heading,
        form,
        toolbar,
        favoritesFilter.message,
        results
    );

    firstCategory.before(section);

    // Заменяем старые списки одним общим списком результатов.
    for (const categoryName of productCategories) {
        const oldSection = document.getElementById(categoryName);

        oldSection.querySelector('.product-grid').replaceChildren();
        oldSection.classList.add('d-none');
    }

    function updateResults() {
        // Выбираем, среди каких товаров искать.
        const source = favoritesFilter.input.checked
            ? products.filter((product) => favoriteIds.includes(product.id))
            : products;

        const filtered = filterProducts(
            source,
            search.value,
            category.value
        );

        const sorted = sortProducts(filtered, sort.value);
        const amount = renderProductList(sorted, results);

        count.textContent =
            'Showing ' + amount + ' of ' + source.length +
            (favoritesFilter.input.checked
                ? ' saved products'
                : ' products');

        if (amount === 0) {
            count.textContent +=
                favoritesFilter.input.checked && favoriteIds.length === 0
                    ? '. Turn off Only favorites and use ♡ to save products.'
                    : '. Change your search or reset the filters.';
        }

        favoritesFilter.update();
    }

    search.addEventListener('input', updateResults);
    category.addEventListener('change', updateResults);
    sort.addEventListener('change', updateResults);

    // Enter применяет поиск без перезагрузки страницы.
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        updateResults();
    });

    reset.addEventListener('click', () => {
        search.value = '';
        category.value = 'all';
        sort.value = 'default';

        favoritesFilter.input.checked = false;
        favoritesMessage = '';

        updateResults();
        search.focus();
    });

    // Плитки категорий сверху тоже включают фильтр.
    for (const categoryName of productCategories) {
        document.querySelectorAll('a[href="#' + categoryName + '"]')
            .forEach((link) => {
                link.href = '#catalog-products';

                link.addEventListener('click', () => {
                    search.value = '';
                    category.value = categoryName;

                    updateResults();
                    heading.focus({ preventScroll: true });
                });
            });
    }

    updateResults();
}

setupCatalogControls();
function styleSizePicker(card, product) {
    const panel = card.querySelector('#sizes-' + product.id);

    // Компактная панель внизу фотографии.
    panel.classList.remove('top-0', 'h-100', 'border');

    panel.classList.add(
        'bottom-0', 'mh-100', 'border-top',
        'shadow-sm', 'p-sm-3'
    );

    const closeButton = panel.querySelector('button');

    closeButton.classList.remove(
        'btn-outline-dark',
        'align-self-end'
    );

    closeButton.classList.add(
        'btn-light', 'rounded-circle', 'px-2', 'py-1'
    );

    const heading = panel.querySelector('p');
    heading.textContent = 'Select size';
    heading.classList.remove('mb-1');

    heading.classList.add(
        'mb-0', 'fw-semibold', 'text-uppercase'
    );

    const header = document.createElement('div');

    header.classList.add(
        'd-flex', 'justify-content-between',
        'align-items-center', 'gap-2', 'flex-shrink-0'
    );

    header.append(heading, closeButton);

    const sizes = document.createElement('div');
    sizes.classList.add('row', 'g-2', 'flex-shrink-0');

    for (const sizeButton of panel.querySelectorAll('[data-size]')) {
        sizeButton.classList.remove(
            'text-start',
            'flex-shrink-0'
        );

        sizeButton.classList.add(
            'w-100', 'py-2', 'rounded-0'
        );

        const column = document.createElement('div');

        column.classList.add(
            product.sizes.length === 1 ? 'col-12' : 'col-4'
        );

        // Переносим кнопку вместе с её обработчиком нажатия.
        column.append(sizeButton);
        sizes.append(column);
    }

    const hint = document.createElement('p');

    hint.classList.add(
        'small', 'text-body-secondary',
        'mb-0', 'flex-shrink-0'
    );

    hint.textContent = 'Select a size to add it to your cart.';

    panel.replaceChildren(header, sizes, hint);
}

// ===== CONTACTS — original plain JavaScript =====
'use strict';

// Проверяем указанное расписание по времени Астаны.
function getStoreSchedule(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Almaty',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);

  const hour = Number(
    parts.find((part) => part.type === 'hour').value
  );

  const minute = Number(
    parts.find((part) => part.type === 'minute').value
  );

  const minutes = hour * 60 + minute;

  // С 11:00 включительно до 21:00.
  const isOpen = minutes >= 11 * 60 && minutes < 21 * 60;

  let message;

  if (isOpen) {
    message = 'According to listed hours: open until 21:00 today.';
  } else if (minutes < 11 * 60) {
    message = 'According to listed hours: closed; opens today at 11:00.';
  } else {
    message = 'According to listed hours: closed; opens tomorrow at 11:00.';
  }

  return {
    isOpen,
    message: message + ' Astana time.'
  };
}

function setupContactDetails() {
  const card = document.querySelector('.visit-section .card-body');
  const addressLine = card.querySelector('.fw-semibold');

  // Берём адрес из существующей карточки.
  const address = addressLine.textContent
    .replace(/\s+/g, ' ')
    .trim();

  // Создаём сообщение о расписании.
  const hoursStatus = document.createElement('p');

  hoursStatus.classList.add(
    'small', 'border', 'rounded', 'p-2', 'mt-3', 'mb-0'
  );

  hoursStatus.setAttribute('role', 'status');
  card.append(hoursStatus);

  function updateHours() {
    const schedule = getStoreSchedule(new Date());

    if (hoursStatus.textContent !== schedule.message) {
      hoursStatus.textContent = schedule.message;
    }

    hoursStatus.classList.toggle('text-success', schedule.isOpen);

    hoursStatus.classList.toggle(
      'text-body-secondary',
      !schedule.isOpen
    );
  }

  updateHours();

  // Обновляем каждую минуту и после возвращения на страницу.
  window.setInterval(updateHours, 60000);
  window.addEventListener('pageshow', updateHours);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) updateHours();
  });

  // Создаём кнопку копирования.
  const copyButton = document.createElement('button');

  copyButton.type = 'button';
  copyButton.textContent = 'Copy address';

  copyButton.classList.add(
    'btn', 'btn-outline-dark', 'btn-sm', 'text-wrap'
  );

  const copyStatus = document.createElement('p');

  copyStatus.classList.add(
    'small', 'text-body-secondary', 'mt-2', 'mb-3'
  );

  copyStatus.setAttribute('role', 'status');

  addressLine.classList.replace('mb-4', 'mb-2');
  addressLine.after(copyButton, copyStatus);

  let manualCopy = null;

  // Запасной вариант, если браузер запрещает автоматическое копирование.
  function showManualCopy() {
    if (manualCopy === null) {
      manualCopy = document.createElement('div');
      manualCopy.classList.add('mb-3');

      const label = document.createElement('label');

      label.htmlFor = 'contact-address-copy';
      label.textContent = 'Address to copy';
      label.classList.add('form-label', 'small');

      const field = document.createElement('textarea');

      field.id = label.htmlFor;
      field.classList.add('form-control');
      field.value = address;
      field.readOnly = true;
      field.rows = 3;

      manualCopy.append(label, field);
      copyStatus.after(manualCopy);
    }

    copyStatus.textContent =
      'Automatic copying is unavailable. Copy the selected address manually.';

    const field = manualCopy.querySelector('textarea');

    field.focus();
    field.select();
  }

  copyButton.addEventListener('click', async () => {
    copyButton.disabled = true;
    copyStatus.textContent = 'Copying address…';

    try {
      if (!window.isSecureContext || !navigator.clipboard?.writeText) {
        showManualCopy();
        return;
      }

      await navigator.clipboard.writeText(address);

      copyStatus.textContent = 'Address copied.';

      if (manualCopy !== null) {
        manualCopy.remove();
        manualCopy = null;
      }
    } catch {
      showManualCopy();
    } finally {
      copyButton.disabled = false;
    }
  });
}

setupContactDetails();

// ===== LOGIN — original plain JavaScript =====
'use strict';

// Требования к паролю.
const passwordRules = [
    {
        text: 'At least 8 characters',
        pattern: /^[\s\S]{8,}$/
    },
    {
        text: 'An uppercase letter (A–Z)',
        pattern: /[A-Z]/
    },
    {
        text: 'A lowercase letter (a–z)',
        pattern: /[a-z]/
    },
    {
        text: 'A number (0–9)',
        pattern: /[0-9]/
    },
    {
        text: 'A special character, for example ! or @',
        pattern: /[^A-Za-z0-9\s]/
    }
];

// Позже используем эту функцию при отправке формы.
function isStrongPassword(value) {
    return passwordRules.every((rule) => rule.pattern.test(value));
}

// Добавляет кнопку Show / Hide password.
function addPasswordToggle(input) {
    const button = document.createElement('button');

    const fieldName = document.querySelector(
        'label[for="' + input.id + '"]'
    ).textContent.trim();

    button.type = 'button';

    button.classList.add(
        'btn',
        'btn-outline-secondary',
        'btn-sm',
        'mt-2',
        'text-wrap'
    );

    button.setAttribute('aria-controls', input.id);

    function updateButton() {
        const action = input.type === 'password' ? 'Show' : 'Hide';

        button.textContent = action + ' password';

        button.setAttribute(
            'aria-label',
            action + ' password: ' + fieldName
        );
    }

    button.addEventListener('click', () => {
        input.type = input.type === 'password' ? 'text' : 'password';
        updateButton();
    });

    // После очистки формы снова скрываем пароль.
    input.form.addEventListener('reset', () => {
        input.type = 'password';
        updateButton();
    });

    input.after(button);
    updateButton();
}

// Добавляет список требований под полем пароля.
function addPasswordChecklist(input) {
    const list = document.createElement('ul');

    list.id = input.id + '-checklist';
    list.classList.add('list-unstyled', 'small', 'mt-2', 'mb-0');

    const items = [];

    for (const rule of passwordRules) {
        const item = document.createElement('li');

        list.append(item);
        items.push({ item, rule });
    }

    // Связываем поле со списком, сохраняя связь с сообщением ошибки.
    const description = input.getAttribute('aria-describedby') || '';

    input.setAttribute(
        'aria-describedby',
        (description + ' ' + list.id).trim()
    );

    input.parentElement.append(list);

    function updateChecklist() {
        for (const { item, rule } of items) {
            const passed = rule.pattern.test(input.value);

            item.textContent =
                (passed ? '✓ Met: ' : '○ Needed: ') + rule.text;

            item.classList.toggle('text-success', passed);
            item.classList.toggle('text-body-secondary', !passed);
        }
    }

    input.addEventListener('input', updateChecklist);
    input.addEventListener('change', updateChecklist);
    window.addEventListener('pageshow', updateChecklist);

    input.form.addEventListener('reset', () => {
        // Ждём, пока браузер очистит поля формы.
        queueMicrotask(updateChecklist);
    });

    updateChecklist();
}

// Кнопки показа для всех трёх полей пароля.
for (const id of [
    'acc-password',
    'acc-password-confirm',
    'signin-password'
]) {
    addPasswordToggle(document.getElementById(id));
}

// Список требований нужен под новым паролем при регистрации.
addPasswordChecklist(document.getElementById('acc-password'));
// Возвращает текст ошибки или пустую строку.
function getRegistrationError(input) {
    const value = input.value.trim();

    switch (input.id) {
        case 'acc-name':
            return value === '' ? 'Enter your full name.' : '';

        case 'acc-email':
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                ? ''
                : 'Enter a valid email, for example name@example.com.';

        case 'acc-phone': {
            const digits = value.replace(/\D/g, '');

            return /^\+?[0-9 ()-]+$/.test(value) &&
                digits.length >= 10 && digits.length <= 15
                ? ''
                : 'Enter a phone number containing 10–15 digits.';
        }

        case 'acc-password':
            return isStrongPassword(input.value)
                ? ''
                : 'Meet all five password requirements below.';

        case 'acc-password-confirm':
            if (input.value === '') return 'Repeat your password.';

            return input.value === document.getElementById('acc-password').value
                ? ''
                : 'Passwords must match exactly.';

        case 'acc-birthdate': {
            if (input.validity.badInput) return 'Enter a valid date.';
            if (value === '') return '';

            const now = new Date();

            const today = Date.UTC(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );

            return Number.isFinite(input.valueAsNumber) &&
                input.valueAsNumber <= today
                ? ''
                : 'Choose a date of birth that is not in the future.';
        }

        case 'acc-size':
            return value === '' || ['S', 'M', 'L'].includes(value)
                ? ''
                : 'Choose S, M or L, or leave the size unselected.';

        case 'acc-agree':
            return input.checked
                ? ''
                : 'Confirm your agreement to continue.';

        default:
            return '';
    }
}

// Показывает ошибку рядом с полем.
function showAccountFieldError(input, message) {
    const errorId = input.id + '-error';
    let error = document.getElementById(errorId);

    // У даты рождения пока нет блока ошибки — создаём его.
    if (error === null) {
        error = document.createElement('span');
        error.id = errorId;
        error.classList.add('invalid-feedback');

        input.after(error);

        const description = input.getAttribute('aria-describedby') || '';

        input.setAttribute(
            'aria-describedby',
            (description + ' ' + errorId).trim()
        );
    }

    const valid = message === '';

    error.textContent = message;

    input.classList.toggle('is-invalid', !valid);
    input.classList.toggle('is-valid', valid && input.value !== '');

    input.setAttribute('aria-invalid', String(!valid));

    return valid;
}

// Подключает поведение формы регистрации.
function setupRegistration() {
    const form = document.getElementById('registration-form');
    const status = document.getElementById('registration-status');
    const errorBox = document.getElementById('registration-error');
    const successBox = document.getElementById('registration-success');

    const fields = [
        'acc-name',
        'acc-email',
        'acc-phone',
        'acc-password',
        'acc-password-confirm',
        'acc-birthdate',
        'acc-size',
        'acc-agree'
    ].map((id) => document.getElementById(id));

    let attempted = false;

    // Показываем собственные сообщения вместо всплывающих подсказок браузера.
    form.noValidate = true;

    document.getElementById('registration-note').textContent =
        'Front-end demo: use sample details. No data is sent to a server, ' +
        'and no real account is created.';

    for (const box of [errorBox, successBox]) {
        box.classList.add('d-none');
        box.removeAttribute('hidden');
    }

    function clearResult() {
        errorBox.classList.add('d-none');
        successBox.classList.add('d-none');

        errorBox.textContent = '';
        successBox.textContent = '';
    }

    form.addEventListener('submit', (event) => {
        // Останавливаем настоящую отправку формы.
        event.preventDefault();

        attempted = true;
        clearResult();

        let firstInvalid = null;

        for (const field of fields) {
            const valid = showAccountFieldError(
                field,
                getRegistrationError(field)
            );

            if (!valid && firstInvalid === null) {
                firstInvalid = field;
            }
        }

        if (firstInvalid !== null) {
            status.textContent = 'The form needs corrections.';

            errorBox.textContent =
                'Correct the marked fields and try again.';

            errorBox.classList.remove('d-none');

            // Переводим курсор в первое неправильное поле.
            firstInvalid.focus();
            return;
        }

        const valueOf = (id) =>
            document.getElementById(id).value.trim();

        const referral = document.getElementById('acc-referral');

        const contact = form.querySelector(
            'input[name="acc-contact"]:checked'
        );

        // В итоговый список пароль не добавляем.
        const summary = [
            ['Name', valueOf('acc-name')],
            ['Email', valueOf('acc-email')],
            ['Phone', valueOf('acc-phone')],
            ['Date of birth', valueOf('acc-birthdate') || 'Not provided'],
            ['Clothing size', valueOf('acc-size') || 'Not provided'],
            ['Heard about us', referral.selectedOptions[0].textContent],
            ['Preferred contact', contact.value === 'email' ? 'Email' : 'Phone'],
            ['Notes', valueOf('acc-notes') || 'None']
        ];

        const notice = document.createElement('p');

        notice.textContent =
            'Demo validation passed. No data was sent to a server ' +
            'and no real account was created.';

        const details = document.createElement('dl');
        details.classList.add('mb-0');

        for (const [label, value] of summary) {
            const term = document.createElement('dt');
            const description = document.createElement('dd');

            term.textContent = label;
            description.textContent = value;

            details.append(term, description);
        }

        successBox.append(notice, details);
        successBox.classList.remove('d-none');

        status.textContent =
            'Demo validation complete. Review your details below.';
    });

    // Кнопка и Enter запускают обработчик submit выше.
    document.getElementById('registration-submit').type = 'submit';

    function handleEdit(event) {
        // После изменения данных предыдущий результат уже не актуален.
        if (
            !successBox.classList.contains('d-none') ||
            !errorBox.classList.contains('d-none')
        ) {
            clearResult();

            status.textContent =
                'Details changed. Submit again to check the form.';
        }

        if (
            fields.includes(event.target) &&
            (
                attempted ||
                event.target.classList.contains('is-invalid') ||
                event.target.classList.contains('is-valid')
            )
        ) {
            showAccountFieldError(
                event.target,
                getRegistrationError(event.target)
            );
        }

        // Если изменился первый пароль, заново проверяем его повтор.
        const confirmation = document.getElementById('acc-password-confirm');

        if (
            event.target.id === 'acc-password' &&
            (attempted || confirmation.value !== '')
        ) {
            showAccountFieldError(
                confirmation,
                getRegistrationError(confirmation)
            );
        }
    }

    form.addEventListener('input', handleEdit);
    form.addEventListener('change', handleEdit);

    form.addEventListener('reset', () => {
        attempted = false;
        clearResult();

        status.textContent = 'The form has been cleared.';

        for (const field of fields) {
            field.classList.remove('is-valid', 'is-invalid');
            field.removeAttribute('aria-invalid');

            const error = document.getElementById(field.id + '-error');

            if (error !== null) {
                error.textContent = '';
            }
        }
    });
}
function setupClothingSize() {
  const oldInput = document.getElementById('acc-size');
  const select = document.createElement('select');

  // Сохраняем связь с подписью и сообщением ошибки.
  select.id = oldInput.id;
  select.name = oldInput.name;

  select.classList.add('form-select');
  select.setAttribute('aria-describedby', 'acc-size-error');

  for (const size of ['', 'S', 'M', 'L']) {
    const option = document.createElement('option');

    option.value = size;
    option.textContent =
      size === '' ? 'Choose a size (optional)' : size;

    select.append(option);
  }

  oldInput.replaceWith(select);

  document.getElementById('acc-size-error').textContent =
    'Choose S, M or L, or leave the size unselected.';
}

// Сначала создаём новый select, затем подключаем проверку формы.
setupClothingSize();
setupRegistration();
function getSigninError(input) {
  if (input.id === 'signin-email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())
      ? ''
      : 'Enter a valid email address.';
  }

  if (input.id === 'signin-password') {
    return input.value.trim() === ''
      ? 'Enter your password.'
      : '';
  }

  return '';
}

function setupSignIn() {
  const form = document.getElementById('signin-form');
  const email = document.getElementById('signin-email');
  const password = document.getElementById('signin-password');
  const status = document.getElementById('signin-status');
  const errorBox = document.getElementById('signin-error');
  const successBox = document.getElementById('signin-success');

  // Здесь ссылки на поля, а не сохранённые пароли.
  const fields = [email, password];

  let attempted = false;
  form.noValidate = true;

  document.querySelector('#signin > p').textContent =
    'Try the sign-in form with sample details.';

  document.getElementById('signin-note').textContent =
    'Front-end demo: only the email format and password presence are checked. ' +
    'No data is sent to a server and no user is authenticated.';

  for (const box of [errorBox, successBox]) {
    box.classList.add('d-none');
    box.removeAttribute('hidden');
  }

  status.textContent = 'The demo form has not been checked yet.';

  function clearResult() {
    errorBox.classList.add('d-none');
    successBox.classList.add('d-none');

    errorBox.textContent = '';
    successBox.textContent = '';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    attempted = true;
    clearResult();

    let firstInvalid = null;

    for (const field of fields) {
      const valid = showAccountFieldError(
        field,
        getSigninError(field)
      );

      if (!valid && firstInvalid === null) {
        firstInvalid = field;
      }
    }

    if (firstInvalid !== null) {
      status.textContent = 'The form needs corrections.';

      errorBox.textContent =
        'Correct the marked fields and try again.';

      errorBox.classList.remove('d-none');
      firstInvalid.focus();
      return;
    }

    // Показываем только email и сообщение о демонстрации.
    successBox.textContent =
      'Demo validation passed for ' + email.value.trim() +
      '. No data was sent to a server and no user was authenticated.';

    successBox.classList.remove('d-none');
    status.textContent = 'Demo validation complete.';
  });

  function handleEdit(event) {
    if (!fields.includes(event.target)) return;

    if (
      !successBox.classList.contains('d-none') ||
      !errorBox.classList.contains('d-none')
    ) {
      clearResult();

      status.textContent =
        'Details changed. Submit again to check the form.';
    }

    if (attempted) {
      showAccountFieldError(
        event.target,
        getSigninError(event.target)
      );
    }
  }

  form.addEventListener('input', handleEdit);
  form.addEventListener('change', handleEdit);

  form.addEventListener('reset', () => {
    attempted = false;
    clearResult();

    status.textContent = 'The form has been cleared.';

    for (const field of fields) {
      field.classList.remove('is-valid', 'is-invalid');
      field.removeAttribute('aria-invalid');

      document.getElementById(field.id + '-error').textContent = '';
    }
  });

  document.getElementById('signin-submit').type = 'submit';
}

setupSignIn();
