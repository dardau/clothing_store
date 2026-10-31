'use strict';
// Полная jQuery 3.7.1 содержит эффекты; ready ждёт готовности формы и списка.
$(function () {
  const KEY = 'instyle-reviews-v1';
  const DRAFT = 'instyle-review-draft-v1';
  const VOTES = 'instyle-review-helpful-v1';
  const list = $('#review-list');
  const form = $('#review-form').attr('novalidate', true);
  const name = $('#review-name').attr({ minlength: 2, maxlength: 60 });
  const rating = $('#review-rating').prop('required', true);
  const text = $('#review-text').attr({ minlength: 10, maxlength: 2000 });
  const result = $('#review-result');
  const error = $('#review-error');
  $('#review-note').text('New reviews are saved only in this browser and are not published on 2GIS.');
  const originals = [];
  list.find('article').each(function (index) {
    const card = $(this);
    originals.push({
      id: 'original-' + index, name: card.find('h3').text().trim(),
      text: card.find('.review-body').text().trim(),
      rating: (card.find('.review-stars-date').text().match(/★/g) || []).length,
      date: card.find('time').attr('datetime'), original: true,
      avatar: card.find('.review-avatar').text(), count: card.find('.review-count').text(),
      language: card.attr('lang')
    });
  });
  function status(element, message) {
    element.removeClass('hidden').toggleClass('d-none', !message).text(message);
  }
  function read(key, fallback) {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved === null) return fallback;
      return saved;
    } catch { status(error, 'Saved browser data could not be loaded.'); return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { status(error, 'Could not save in this browser. Changes were not saved.'); return false; }
  }
  function loadReviews() {
    const saved = read(KEY, []);
    if (!Array.isArray(saved)) { status(error, 'Saved reviews are invalid.'); return []; }
    const valid = [];
    const ids = [];
    for (const review of saved) {
      if (!review || typeof review.id !== 'string' || !review.id.startsWith('local-') || ids.includes(review.id) ||
          typeof review.name !== 'string' || review.name.trim().length < 2 || review.name.length > 60 ||
          typeof review.text !== 'string' || review.text.trim().length < 10 || review.text.length > 2000 ||
          !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5 ||
          typeof review.date !== 'string' || !Number.isFinite(Date.parse(review.date))) {
        status(error, 'Saved reviews are invalid.'); return [];
      }
      ids.push(review.id);
      // Не доверяем признаку original из localStorage.
      valid.push({ id: review.id, name: review.name, text: review.text, rating: review.rating, date: review.date });
    }
    return valid;
  }
  function loadVotes() {
    const saved = read(VOTES, []);
    if (!Array.isArray(saved)) return [];
    return saved.filter(function (id) { return typeof id === 'string'; });
  }
  let own = loadReviews();
  let votes = loadVotes();
  rating.prepend($('<option>').val('').text('Choose a rating')).val('');
  const count = $('<p>').attr('id', 'review-character-count').addClass('small text-secondary').insertAfter(text);
  text.attr('aria-describedby', count.attr('id'));
  const preview = $('<article>').addClass('review-text-card rounded-2 p-3 mb-3').insertBefore('#review-submit');
  // html используется только для постоянной доверенной разметки, без пользовательских значений.
  preview.html('<h4>Review preview</h4>');
  const previewName = $('<p>').appendTo(preview);
  const previewText = $('<p>').addClass('text-break text-wrap').appendTo(preview);
  const draftStatus = $('<p>').addClass('small text-secondary').attr('role', 'status').insertAfter(preview);
  const draft = read(DRAFT, null);
  if (draft && typeof draft.name === 'string' && typeof draft.text === 'string') {
    name.val(draft.name.slice(0, 60)); text.val(draft.text.slice(0, 2000));
    if (/^[1-5]$/.test(String(draft.rating))) rating.val(String(draft.rating));
  }
  function updatePreview(save) {
    count.text(text.val().length + ' / 2000 characters (minimum 10)');
    let score = 'No rating selected';
    if (rating.val()) score = rating.val() + '/5';
    previewName.text((name.val().trim() || 'Your name') + ' · ' + score);
    previewText.text(text.val() || 'Your review will appear here.');
    if (save) {
      if (write(DRAFT, { name: name.val(), rating: rating.val(), text: text.val() })) draftStatus.text('Draft saved in this browser.');
      else draftStatus.text('Draft could not be saved.');
    }
  }
  function formatReviewDate(date) {
    // Если в записи есть только дата, время не добавляем.
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return new Date(date).toLocaleDateString('en-GB', { timeZone: 'UTC' });
    return new Date(date).toLocaleString('en-GB');
  }
  // .append(), .text(), .attr() заменили createElement и textContent.
  // Общий createReviewCard понятнее двух разных веток для исходных и новых отзывов.
  function createReviewCard(review) {
    const column = $('<div>').addClass('col-12 col-md-6 col-lg-4');
    const card = $('<article>').addClass('review-text-card rounded-2 p-3 h-100')
      .attr('data-review-id', review.id).appendTo(column);
    const header = $('<div>').addClass('review-head d-flex align-items-center gap-2 mb-2').appendTo(card);
    if (review.original) {
      card.attr('lang', review.language || 'ru');
      $('<span>').addClass('review-avatar rounded-circle d-flex align-items-center justify-content-center text-white fw-bold small flex-shrink-0')
        .text(review.avatar).appendTo(header);
    }
    const heading = $('<div>').appendTo(header);
    $('<h3>').addClass('text-break').text(review.name).appendTo(heading);
    if (review.count) $('<p>').addClass('review-count small mb-0').text(review.count).appendTo(heading);
    $('<p>').addClass('review-stars-date small mb-2').text('★'.repeat(review.rating)).append(
      $('<time>').addClass('ms-2').attr('datetime', review.date).text(formatReviewDate(review.date))
    ).appendTo(card);
    $('<p>').addClass('review-body small lh-base mb-0 text-break text-wrap').text(review.text).appendTo(card);
    if (!review.original) $('<p>').addClass('small text-secondary').text('Your review · saved only in this browser').appendTo(card);
    const actions = $('<div>').addClass('d-flex flex-wrap gap-2 mt-3').appendTo(card);
    const active = votes.includes(review.id);
    const label = $('<label>').addClass('btn btn-outline-dark btn-sm mb-0').toggleClass('active', active).appendTo(actions);
    // prop('checked') читает текущее состояние checkbox; attr('checked') — начальный HTML-атрибут.
    $('<input>').attr({ type: 'checkbox', 'data-action': 'helpful' }).addClass('form-check-input me-2')
      .prop('checked', active).appendTo(label);
    $('<span>').text('Helpful (' + (active ? 1 : 0) + ')').appendTo(label);
    if (!review.original) $('<button>').attr({ type: 'button', 'data-action': 'delete' })
      .addClass('btn btn-outline-danger btn-sm').text('Delete my review').appendTo(actions);
    return column;
  }
  function render() {
    const shown = originals.concat(own).sort(function (a, b) { return Date.parse(b.date) - Date.parse(a.date); });
    list.empty();
    for (const review of shown) list.append(createReviewCard(review));
  }
  // Родитель существует заранее, кнопки появляются позже: делегирование работает после перерисовки.
  list.on('click', '[data-action="helpful"]', function () {
    const checkbox = $(this);
    const id = checkbox.closest('article').attr('data-review-id');
    const current = loadVotes();
    let next = current.filter(function (vote) { return vote !== id; });
    if (checkbox.prop('checked')) next.push(id);
    if (!write(VOTES, next)) { checkbox.prop('checked', votes.includes(id)); return; }
    votes = next;
    checkbox.siblings('span').text('Helpful (' + (checkbox.prop('checked') ? 1 : 0) + ')');
    checkbox.parent().toggleClass('active', checkbox.prop('checked'));
  });
  list.on('click', '[data-action="delete"]', function () {
    const card = $(this).closest('article');
    const id = card.attr('data-review-id');
    const saved = loadReviews();
    if (!saved.some(function (review) { return review.id === id; })) return;
    const next = saved.filter(function (review) { return review.id !== id; });
    if (!write(KEY, next)) return;
    own = next;
    card.parent().stop(true, true).fadeOut(200, function () {
      $(this).remove();
      $('#review-name').trigger('focus');
    });
    status(result, 'Your review was deleted from this browser.');
  });
  function fieldMessage(field) {
    const value = String(field.val() || '').trim();
    if (field.is(name) && (value.length < 2 || value.length > 60)) return 'Enter a name with 2–60 characters.';
    if (field.is(text) && (value.length < 10 || value.length > 2000)) return 'Write a review with 10–2000 characters.';
    if (field.is(rating) && !/^[1-5]$/.test(value)) return 'Choose a rating from 1 to 5.';
    return '';
  }
  form.on('input change', 'input, select, textarea', function () {
    const field = $(this);
    if (field.hasClass('error')) showJqueryError(field, fieldMessage(field));
    status(result, ''); updatePreview(true);
  });
  form.on('submit', function (event) {
    // preventDefault отменяет отправку формы: отзыв сохраняется только локально.
    event.preventDefault(); status(error, ''); status(result, '');
    let first = null;
    form.find('input, select, textarea').each(function () {
      const field = $(this);
      const message = fieldMessage(field);
      showJqueryError(field, message);
      if (message && !first) first = field;
    });
    if (first) { first.trigger('focus'); return; }
    const review = { id: 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2),
      name: name.val().trim(), text: text.val().trim(), rating: Number(rating.val()), date: new Date().toISOString() };
    const next = loadReviews().concat(review);
    if (!write(KEY, next)) return;
    own = next;
    form.trigger('reset'); render();
    status(result, 'Review saved only in this browser. It has not been published on 2GIS.');
  });
  form.on('reset', function () {
    clearJqueryErrors(form); status(error, ''); status(result, '');
    if (write(DRAFT, { name: '', rating: '', text: '' })) draftStatus.text('Draft cleared.');
    setTimeout(function () { rating.val(''); updatePreview(false); }, 0);
  });
  $(window).on('pageshow', function () { own = loadReviews(); votes = loadVotes(); render(); });
  $(window).on('storage', function (event) {
    const key = event.originalEvent.key;
    if (key === KEY || key === VOTES || key === null) { own = loadReviews(); votes = loadVotes(); render(); }
  });
  updatePreview(false); render();
});
