'use strict';
// Полная jQuery 3.7.1 нужна для slideDown; ready ждёт готовую форму.
$(function () {
  // .val(), .prop(), .on() заменили чтение полей и native-обработчики.
  // Код не короче: отдельные сообщения и проверки делают его понятнее для защиты.
  const form = $('#availability-form').attr('novalidate', true);
  const result = $('#availability-result').removeClass('hidden d-none').hide();
  const email = $('#customer-email');
  const phone = $('<input>').attr({ id: 'customer-phone', name: 'customer-phone', type: 'tel', autocomplete: 'tel' })
    .addClass('form-control form-control-lg');
  $('<div>').addClass('mb-3').append(
    $('<label>').attr('for', 'customer-phone').addClass('form-label').text('Your phone'), phone
  ).insertAfter(email.closest('.row'));
  $('#item-name').attr({ minlength: 2, maxlength: 100 });
  $('#color').attr('maxlength', 60);
  $('#comment').attr('maxlength', 1000);
  $('#size-select').prop('required', true);
  $('#notify-email').prop('required', true);
  const demo = 'Demo only: data was not sent to a server. No real reservation, order or payment is created.';
  $('#availability-note').text(demo);
  $('#availability-submit').text('Check details');

  function contactMode() {
    email.prop('required', $('#notify-email').prop('checked'));
    phone.prop('required', $('#notify-phone').prop('checked'));
  }
  function fieldMessage(field) {
    const value = String(field.val() || '').trim();
    const id = field.attr('id');
    if (id === 'item-name' && (value.length < 2 || value.length > 100)) return 'Enter an item name of 2–100 characters.';
    if (id === 'size-select' && !['s', 'm', 'l'].includes(value)) return 'Choose S, M or L.';
    if (field.attr('name') === 'notify' && !form.find('[name="notify"]:checked').length) return 'Choose Email or Phone.';
    if (id === 'customer-email') {
      if (!value && field.prop('required')) return 'Enter your email.';
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
    }
    if (id === 'customer-phone') {
      if (!value && field.prop('required')) return 'Enter your phone number.';
      const digits = value.replace(/\D/g, '').length;
      if (value && (!/^\+?[\d\s()-]+$/.test(value) || digits < 10 || digits > 15)) return 'Use 10–15 digits; only +, spaces, parentheses and hyphens are allowed.';
    }
    const maximum = Number(field.attr('maxlength'));
    if (maximum && String(field.val()).length > maximum) return 'Use no more than ' + maximum + ' characters.';
    if (field.prop('required') && field.attr('type') !== 'radio' && !value) return 'Complete this field.';
    return '';
  }
  contactMode();
  form.on('input change', 'input, select, textarea', function () {
    contactMode();
    const field = $(this);
    if (field.hasClass('error')) showJqueryError(field, fieldMessage(field));
    // При смене способа связи повторно проверяем связанные ошибки.
    form.find('.error').each(function () { showJqueryError($(this), fieldMessage($(this))); });
  });
  form.on('submit', function (event) {
    // preventDefault отменяет стандартную отправку и перезагрузку страницы.
    event.preventDefault();
    contactMode();
    result.stop(true, true).hide();
    let first = null;
    form.find('input, select, textarea').each(function () {
      const field = $(this);
      const message = fieldMessage(field);
      showJqueryError(field, message);
      if (message && !first) first = field;
    });
    if (first) { first.trigger('focus'); return; }
    const contact = form.find('[name="notify"]:checked').val() === 'email' ? email.val().trim() : phone.val().trim();
    const summary = $('#item-name').val().trim() + ' · Size ' + $('#size-select').val().toUpperCase() + ' · ' + contact;
    // Проверку браузера можно обойти; реальный сервер обязан снова проверить все данные.
    form.trigger('reset');
    result.text(summary + '. ' + demo).stop(true, true).slideDown(200);
  });
  form.on('reset', function () {
    clearJqueryErrors(form);
    result.stop(true, true).hide().text('');
    // Событие reset приходит до восстановления начальных значений полей.
    setTimeout(contactMode, 0);
  });
});
