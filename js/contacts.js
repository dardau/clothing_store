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