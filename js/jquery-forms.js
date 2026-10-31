'use strict';

// Небольшие помощники только для двух страниц; общая валидация сайта не меняется.
function showJqueryError(field, message) {
  let error = field.siblings('[data-field-error]').first();
  if (!error.length) {
    const id = field.attr('id') + '-error';
    error = $('<span>').attr({ id: id, 'data-field-error': '', 'aria-live': 'polite' })
      .addClass('small text-danger d-block mt-1').insertAfter(field);
    field.attr('aria-describedby', ((field.attr('aria-describedby') || '') + ' ' + id).trim());
  }
  field.toggleClass('error is-invalid', Boolean(message));
  if (message) field.attr('aria-invalid', 'true');
  else field.removeAttr('aria-invalid');
  error.text(message).toggleClass('d-none', !message);
}

function clearJqueryErrors(form) {
  form.find('input, select, textarea').each(function () {
    showJqueryError($(this), '');
  });
}
