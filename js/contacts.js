'use strict';

// jQuery 3.7.1 is loaded before this file. This ready wrapper waits until the contact card exists.
$(function () {
  const $card = $('.visit-section .card-body').first();
  const $addressLine = $card.find('.fw-semibold').first();
  if (!$card.length || !$addressLine.length) return;

  // This replaces querySelector, textContent and classList updates. The jQuery chain is longer, but keeps the status styling together.
  const address = $addressLine.text().replace(/\s+/g, ' ').trim();
  const $hoursStatus = $('<p>')
    .addClass('small border rounded p-2 mt-3 mb-0')
    .attr('role', 'status')
    .insertAfter($addressLine);

  function getStoreSchedule(date) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Almaty',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    }).formatToParts(date);
    const hour = Number(parts.find((part) => part.type === 'hour').value);
    const minute = Number(parts.find((part) => part.type === 'minute').value);
    const minutes = hour * 60 + minute;
    const isOpen = minutes >= 11 * 60 && minutes < 21 * 60;
    const targetMinutes = isOpen ? 21 * 60 : minutes < 11 * 60 ? 11 * 60 : 35 * 60;
    const difference = targetMinutes - minutes;
    const hoursLeft = Math.floor(difference / 60);
    const minutesLeft = difference % 60;
    const countdown = hoursLeft + ' h ' + minutesLeft + ' min';
    const message = isOpen
      ? 'Open now — closes in ' + countdown + '.'
      : minutes < 11 * 60
        ? 'Closed now — opens in ' + countdown + '.'
        : 'Closed now — opens tomorrow in ' + countdown + '.';

    return { isOpen, message: message + ' Astana time.' };
  }

  function updateHours() {
    const schedule = getStoreSchedule(new Date());
    $hoursStatus
      .text(schedule.message)
      .toggleClass('text-success', schedule.isOpen)
      .toggleClass('text-body-secondary', !schedule.isOpen);
  }

  updateHours();
  window.setInterval(updateHours, 60000);
  $(window).on('pageshow', updateHours);
  $(document).on('visibilitychange', function () {
    if (!document.hidden) updateHours();
  });

  const $copyButton = $('<button>')
    .attr({ type: 'button', 'aria-controls': 'contact-copy-status' })
    .addClass('btn btn-outline-dark btn-sm text-wrap')
    .text('Copy address');
  const $copyStatus = $('<p>')
    .attr({ id: 'contact-copy-status', role: 'status' })
    .addClass('small text-body-secondary mt-2 mb-3');

  $addressLine.removeClass('mb-4').addClass('mb-2').after($copyButton, $copyStatus);

  let $manualCopy = $();
  function showManualCopy() {
    if (!$manualCopy.length) {
      const $label = $('<label>')
        .attr('for', 'contact-address-copy')
        .addClass('form-label small')
        .text('Address to copy');
      const $field = $('<textarea>')
        .attr({ id: 'contact-address-copy', rows: 3, readonly: true })
        .addClass('form-control')
        .val(address);
      $manualCopy = $('<div>').addClass('mb-3').hide().append($label, $field);
      $copyStatus.after($manualCopy);

      // The field exists in the document now; slideDown reveals a manual fallback only when automatic copy is unavailable.
      $manualCopy.slideDown(180, function () {
        $field.trigger('focus');
        $field[0].select();
      });
    }

    showCopyStatus('<strong>Automatic copying is unavailable.</strong> Copy the address below.');
  }

  function showCopyStatus(trustedMessageHtml) {
    $copyStatus.stop(true, true).fadeOut(100, function () {
      // This HTML is a fixed message authored in this script; visitor-provided text is inserted with .text() elsewhere.
      $copyStatus.html(trustedMessageHtml).fadeIn(160);
    });
  }

  $copyButton.on('click', async function () {
    const $button = $(this);
    $button.prop('disabled', true);
    showCopyStatus('Copying address…');

    try {
      if (!window.isSecureContext || !navigator.clipboard?.writeText) {
        showManualCopy();
        return;
      }

      await navigator.clipboard.writeText(address);
      showCopyStatus('<strong>Address copied.</strong>');

      if ($manualCopy.length) {
        $manualCopy.stop(true, true).slideUp(140, function () {
          $(this).remove();
          $manualCopy = $();
        });
      }
    } catch {
      showManualCopy();
    } finally {
      $button.prop('disabled', false);
    }
  });
});
