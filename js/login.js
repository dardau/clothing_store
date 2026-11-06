'use strict';

// jQuery 3.7.1 is loaded before this file. Ready wrapper keeps all account-page code in one place.
$(function () {
  const passwordRules = [
    { text: 'At least 8 characters', pattern: /^[\s\S]{8,}$/ },
    { text: 'An uppercase letter (A–Z)', pattern: /[A-Z]/ },
    { text: 'A lowercase letter (a–z)', pattern: /[a-z]/ },
    { text: 'A number (0–9)', pattern: /[0-9]/ },
    { text: 'A special character, for example ! or @', pattern: /[^A-Za-z0-9\s]/ }
  ];

  function isStrongPassword(value) {
    return passwordRules.every((rule) => rule.pattern.test(value));
  }

  // The former version used createElement, insertAfter and addEventListener.
  // These generated buttons now use jQuery creation and .on(); the result is shorter and easier to follow.
  function addPasswordToggle(id) {
    const $input = $('#' + id);
    if (!$input.length) return;

    const fieldName = $('label[for="' + id + '"]').text().trim();
    const $button = $('<button>')
      .attr({ type: 'button', 'aria-controls': id })
      .addClass('btn btn-outline-secondary btn-sm mt-2 text-wrap')
      .insertAfter($input);

    function updateButton() {
      const action = $input.prop('type') === 'password' ? 'Show' : 'Hide';
      $button
        .text(action + ' password')
        .attr('aria-label', action + ' password: ' + fieldName);
    }

    $button.on('click', function () {
      const $clicked = $(this);
      $input.prop('type', $input.prop('type') === 'password' ? 'text' : 'password');
      $clicked.text($input.prop('type') === 'password' ? 'Show password' : 'Hide password');
      updateButton();
    });

    $input.closest('form').on('reset', function () {
      window.setTimeout(function () {
        $input.prop('type', 'password');
        updateButton();
      }, 0);
    });

    updateButton();
  }

  $.each(['acc-password', 'acc-password-confirm', 'signin-password'], function (_, id) {
    addPasswordToggle(id);
  });

  // Build the existing size control from code so no new hand-written HTML or CSS is needed.
  const $oldSize = $('#acc-size');
  if ($oldSize.length) {
    const $sizeSelect = $('<select>')
      .attr({ id: 'acc-size', name: 'acc-size', 'aria-describedby': 'acc-size-error' })
      .addClass('form-select');
    $.each(['', 'S', 'M', 'L'], function (_, size) {
      $sizeSelect.append(
        $('<option>').val(size).text(size === '' ? 'Choose a size (optional)' : size)
      );
    });
    $oldSize.replaceWith($sizeSelect);
    $('#acc-size-error').text('Choose S, M or L, or leave the size unselected.');
  }

  const $password = $('#acc-password');
  if ($password.length) {
    const checklistId = 'acc-password-checklist';
    const $checklist = $('<ul>')
      .attr('id', checklistId)
      .addClass('list-unstyled small mt-2 mb-0');

    $.each(passwordRules, function () {
      $checklist.append($('<li>'));
    });
    $password.parent().append($checklist);

    const descriptions = ($password.attr('aria-describedby') || '').split(/\s+/).filter(Boolean);
    if (!descriptions.includes(checklistId)) descriptions.push(checklistId);
    $password.attr('aria-describedby', descriptions.join(' '));

    function updateChecklist() {
      $checklist.find('li').each(function (index) {
        const passed = passwordRules[index].pattern.test(String($password.val() || ''));
        $(this)
          .text((passed ? '✓ Met: ' : '○ Needed: ') + passwordRules[index].text)
          .toggleClass('text-success', passed)
          .toggleClass('text-body-secondary', !passed);
      });
    }

    $password.on('input change', updateChecklist);
    $(window).on('pageshow', updateChecklist);
    $password.closest('form').on('reset', function () {
      window.setTimeout(updateChecklist, 0);
    });
    updateChecklist();
  }

  // The endterm freeze does not allow new hand-written page HTML. Build the extra
  // confirmation field in code and reuse Bootstrap's existing form classes.
  const $accountEmail = $('#acc-email');
  if ($accountEmail.length && !$('#acc-email-confirm').length) {
    const $confirmField = $('<input>')
      .attr({
        class: 'form-control', type: 'email', id: 'acc-email-confirm', name: 'acc-email-confirm',
        autocomplete: 'email', placeholder: 'Repeat your email',
        'aria-describedby': 'acc-email-confirm-error', required: true
      });
    const $confirmGroup = $('<p>')
      .addClass('col-12 col-md-6 mb-0')
      .append(
        $('<label>').addClass('form-label').attr('for', 'acc-email-confirm').text('Confirm email*'),
        $confirmField,
        $('<span>').attr('id', 'acc-email-confirm-error').addClass('invalid-feedback')
          .text('Enter the same email in both fields.')
      );
    $accountEmail.closest('p').after($confirmGroup);
  }

  // Registration checks replace getElementById/value/classList updates with jQuery selectors, .val(), .prop(), .text() and class methods; the field-feedback code is shorter than the previous DOM version.
  function showAccountFieldError($field, message) {
    const errorId = $field.attr('id') + '-error';
    let $feedback = $field.attr('id') === 'acc-agree'
      ? $field.parent().find('.invalid-feedback').first()
      : $field.siblings('.invalid-feedback').first();

    if (!$feedback.length) {
      $feedback = $('<span>').attr('id', errorId).addClass('invalid-feedback').insertAfter($field);
      const describedBy = ($field.attr('aria-describedby') || '').trim();
      $field.attr('aria-describedby', (describedBy + ' ' + errorId).trim());
    }

    const hasError = message !== '';
    const value = String($field.val() || '').trim();
    $feedback.text(message).toggleClass('d-block', hasError);
    $field
      .toggleClass('is-invalid', hasError)
      .toggleClass('is-valid', !hasError && value !== '')
      .attr('aria-invalid', String(hasError));

    return !hasError;
  }

  const $registrationForm = $('#registration-form');
  if ($registrationForm.length) {
    const $registrationStatus = $('#registration-status');
    const $registrationError = $('#registration-error').prop('hidden', false).addClass('d-none');
    const $registrationSuccess = $('#registration-success').prop('hidden', false).addClass('d-none');
    const registrationIds = [
      'acc-name', 'acc-email', 'acc-email-confirm', 'acc-phone', 'acc-password',
      'acc-password-confirm', 'acc-birthdate', 'acc-size', 'acc-agree'
    ];
    const registrationFields = registrationIds.map((id) => $('#' + id));
    let attemptedRegistration = false;
    let nativeInvalidBatch = false;
    let preserveRegistrationSuccess = false;

    $('#registration-note').text(
      'Front-end demo: use sample details. No data is sent to a server, and no real account is created.'
    );

    function getRegistrationError($field) {
      const id = $field.attr('id');
      const value = String($field.val() || '').trim();

      switch (id) {
        case 'acc-name':
          return value === '' ? 'Enter your full name.' : '';
        case 'acc-email':
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
            ? '' : 'Enter a valid email, for example name@example.com.';
        case 'acc-email-confirm':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return 'Enter a valid email, for example name@example.com.';
          }
          return value.toLowerCase() === String($('#acc-email').val() || '').trim().toLowerCase()
            ? '' : 'Email addresses must match.';
        case 'acc-phone': {
          const digits = value.replace(/\D/g, '');
          return /^\+?[0-9 ()-]+$/.test(value) && digits.length >= 10 && digits.length <= 15
            ? '' : 'Enter a phone number containing 10–15 digits.';
        }
        case 'acc-password':
          return isStrongPassword(String($field.val() || ''))
            ? '' : 'Meet all five password requirements below.';
        case 'acc-password-confirm':
          if (String($field.val() || '') === '') return 'Repeat your password.';
          return $field.val() === $password.val() ? '' : 'Passwords must match exactly.';
        case 'acc-birthdate': {
          if ($field.prop('validity').badInput) return 'Enter a valid date.';
          if (value === '') return '';
          const now = new Date();
          const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
          return Number.isFinite($field.prop('valueAsNumber')) && $field.prop('valueAsNumber') <= today
            ? '' : 'Choose a date of birth that is not in the future.';
        }
        case 'acc-size':
          return value === '' || ['S', 'M', 'L'].includes(value)
            ? '' : 'Choose S, M or L, or leave the size unselected.';
        case 'acc-agree':
          // .prop('checked') reads the checkbox's current state; .attr('checked') only reads its initial HTML value.
          return $field.prop('checked') ? '' : 'Confirm your agreement to continue.';
        default:
          return '';
      }
    }

    function validateRegistration() {
      let $firstInvalid = $();
      $.each(registrationFields, function (_, $field) {
        const valid = showAccountFieldError($field, getRegistrationError($field));
        if (!valid && !$firstInvalid.length) $firstInvalid = $field;
      });
      return $firstInvalid;
    }

    function hideResult($box) {
      $box.stop(true, true).fadeOut(120, function () {
        $(this).addClass('d-none');
      });
    }

    function showResult($box) {
      // The alert uses an existing Bootstrap class; fadeIn makes validation feedback visible after submit.
      $box.stop(true, true).prop('hidden', false).removeClass('d-none').hide().fadeIn(180);
    }

    function clearRegistrationResults() {
      hideResult($registrationError);
      hideResult($registrationSuccess);
    }

    function showNativeInvalidFields() {
      if (nativeInvalidBatch) return;
      nativeInvalidBatch = true;
      attemptedRegistration = true;
      clearRegistrationResults();
      const $firstInvalid = validateRegistration();
      $registrationStatus.text('The form needs corrections.');
      $registrationError.text('Correct the marked fields and try again.');
      showResult($registrationError);
      if ($firstInvalid.length) $firstInvalid.trigger('focus');
      window.setTimeout(function () { nativeInvalidBatch = false; }, 0);
    }

    // Keep native required/type checks enabled. Client checks still explain each field; a server must repeat them because browser checks can be bypassed.
    $registrationForm.find(':input').on('invalid', function (event) {
      event.preventDefault();
      showNativeInvalidFields();
    });
    $('#registration-submit').prop('type', 'submit');

    $registrationForm.on('submit', function (event) {
      // Without preventDefault(), action="#" reloads the page instead of showing this local demo result.
      event.preventDefault();
      attemptedRegistration = true;
      clearRegistrationResults();
      const $firstInvalid = validateRegistration();

      if ($firstInvalid.length) {
        $registrationStatus.text('The form needs corrections.');
        $registrationError.text('Correct the marked fields and try again.');
        showResult($registrationError);
        $firstInvalid.trigger('focus');
        return;
      }

      const contactMethod = $registrationForm.find('input[name="acc-contact"]:checked').val() || 'email';
      const summary = [
        ['Name', String($('#acc-name').val() || '').trim()],
        ['Email', String($('#acc-email').val() || '').trim()],
        ['Phone', String($('#acc-phone').val() || '').trim()],
        ['Date of birth', String($('#acc-birthdate').val() || '').trim() || 'Not provided'],
        ['Clothing size', String($('#acc-size').val() || '').trim() || 'Not provided'],
        ['Heard about us', $('#acc-referral').find('option:selected').text()],
        ['Preferred contact', contactMethod === 'email' ? 'Email' : 'Phone'],
        ['Notes', String($('#acc-notes').val() || '').trim() || 'None']
      ];
      const $notice = $('<p>').addClass('mb-3').html(
        '<strong>Demo validation passed.</strong> No data was sent to a server and no real account was created.'
      );
      // .html() parses this fixed, trusted label; visitor input is always inserted with .text() so it stays literal text.
      const $details = $('<dl>').addClass('mb-0');
      $.each(summary, function (_, pair) {
        $details.append($('<dt>').text(pair[0]), $('<dd>').text(pair[1]));
      });
      $registrationSuccess.empty().append($notice, $details);
      showResult($registrationSuccess);
      $registrationStatus.text('Demo validation complete. Review your details below.');
      preserveRegistrationSuccess = true;
      $registrationForm.trigger('reset');
      preserveRegistrationSuccess = false;
    });

    function handleRegistrationEdit(event) {
      const $edited = $(this);
      const id = $edited.attr('id');
      if (!registrationIds.includes(id)) return;

      if (!$registrationError.hasClass('d-none') || !$registrationSuccess.hasClass('d-none')) {
        clearRegistrationResults();
        $registrationStatus.text('Details changed. Submit again to check the form.');
      }

      if (attemptedRegistration || $edited.hasClass('is-invalid') || $edited.hasClass('is-valid')) {
        showAccountFieldError($edited, getRegistrationError($edited));
      }
      if (id === 'acc-password' && (attemptedRegistration || $('#acc-password-confirm').val() !== '')) {
        showAccountFieldError($('#acc-password-confirm'), getRegistrationError($('#acc-password-confirm')));
      }
      if (id === 'acc-email' && (attemptedRegistration || $('#acc-email-confirm').val() !== '')) {
        showAccountFieldError($('#acc-email-confirm'), getRegistrationError($('#acc-email-confirm')));
      }
    }

    $registrationForm.on('input change', ':input', handleRegistrationEdit);
    $registrationForm.on('reset', function () {
      const preserveSuccess = preserveRegistrationSuccess;
      attemptedRegistration = false;
      nativeInvalidBatch = false;
      if (!preserveSuccess) {
        clearRegistrationResults();
        $registrationStatus.text('The form has been cleared.');
      } else {
        hideResult($registrationError);
      }
      window.setTimeout(function () {
        $.each(registrationFields, function (_, $field) {
          $field.removeClass('is-valid is-invalid').removeAttr('aria-invalid');
          $field.siblings('.invalid-feedback').text('').removeClass('d-block');
          if ($field.attr('id') === 'acc-agree') $field.parent().find('.invalid-feedback').text('').removeClass('d-block');
        });
        if (!preserveSuccess) $registrationSuccess.empty();
      }, 0);
    });
  }

  const $signinForm = $('#signin-form');
  if ($signinForm.length) {
    const $email = $('#signin-email');
    const $signinPassword = $('#signin-password');
    const $signinStatus = $('#signin-status');
    const $signinError = $('#signin-error').prop('hidden', false).addClass('d-none');
    const $signinSuccess = $('#signin-success').prop('hidden', false).addClass('d-none');
    let attemptedSignin = false;
    let nativeSigninBatch = false;
    let preserveSigninSuccess = false;

    $('#signin > p').first().text('Try the sign-in form with sample details.');
    $('#signin-note').text(
      'Front-end demo: only the email format and password presence are checked. No data is sent to a server and no user is authenticated.'
    );
    $signinStatus.text('The demo form has not been checked yet.');

    function getSigninError($field) {
      const value = String($field.val() || '');
      if ($field.attr('id') === 'signin-email') {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
          ? '' : 'Enter a valid email address.';
      }
      return value.trim() === '' ? 'Enter your password.' : '';
    }

    function validateSignin() {
      let $firstInvalid = $();
      [$email, $signinPassword].forEach(function ($field) {
        const valid = showAccountFieldError($field, getSigninError($field));
        if (!valid && !$firstInvalid.length) $firstInvalid = $field;
      });
      return $firstInvalid;
    }

    function hideSigninResult($box) {
      $box.stop(true, true).fadeOut(120, function () { $(this).addClass('d-none'); });
    }
    function showSigninResult($box) {
      $box.stop(true, true).prop('hidden', false).removeClass('d-none').hide().fadeIn(180);
    }
    function clearSigninResults() {
      hideSigninResult($signinError);
      hideSigninResult($signinSuccess);
    }

    $signinForm.find(':input').on('invalid', function (event) {
      event.preventDefault();
      if (nativeSigninBatch) return;
      nativeSigninBatch = true;
      attemptedSignin = true;
      clearSigninResults();
      const $firstInvalid = validateSignin();
      $signinStatus.text('The form needs corrections.');
      $signinError.text('Correct the marked fields and try again.');
      showSigninResult($signinError);
      if ($firstInvalid.length) $firstInvalid.trigger('focus');
      window.setTimeout(function () { nativeSigninBatch = false; }, 0);
    });

    $('#signin-submit').prop('type', 'submit');
    $signinForm.on('submit', function (event) {
      event.preventDefault();
      attemptedSignin = true;
      clearSigninResults();
      const $firstInvalid = validateSignin();
      if ($firstInvalid.length) {
        $signinStatus.text('The form needs corrections.');
        $signinError.text('Correct the marked fields and try again.');
        showSigninResult($signinError);
        $firstInvalid.trigger('focus');
        return;
      }

      $signinSuccess.text(
        'Demo validation passed for ' + String($email.val() || '').trim() +
        '. No data was sent to a server and no user was authenticated.'
      );
      showSigninResult($signinSuccess);
      $signinStatus.text('Demo validation complete.');
      preserveSigninSuccess = true;
      $signinForm.trigger('reset');
      preserveSigninSuccess = false;
    });

    $signinForm.on('input change', ':input', function () {
      const $edited = $(this);
      if (![$email[0], $signinPassword[0]].includes(this)) return;
      if (!$signinError.hasClass('d-none') || !$signinSuccess.hasClass('d-none')) {
        clearSigninResults();
        $signinStatus.text('Details changed. Submit again to check the form.');
      }
      if (attemptedSignin || $edited.hasClass('is-invalid') || $edited.hasClass('is-valid')) {
        showAccountFieldError($edited, getSigninError($edited));
      }
    });

    $signinForm.on('reset', function () {
      const preserveSuccess = preserveSigninSuccess;
      attemptedSignin = false;
      nativeSigninBatch = false;
      if (!preserveSuccess) {
        clearSigninResults();
        $signinStatus.text('The form has been cleared.');
      } else {
        hideSigninResult($signinError);
      }
      window.setTimeout(function () {
        $signinForm.find('.is-valid, .is-invalid').removeClass('is-valid is-invalid').removeAttr('aria-invalid');
        $signinForm.find('.invalid-feedback').text('').removeClass('d-block');
        if (!preserveSuccess) $signinSuccess.empty();
      }, 0);
    });
  }
});
