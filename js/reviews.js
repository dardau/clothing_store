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
