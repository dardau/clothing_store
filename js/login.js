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