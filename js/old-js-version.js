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
