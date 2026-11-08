// jQuery 3.7.1: searchable store guide and expandable answers.
$(function () {
  'use strict';
  const answers = [
  {
    title: 'Where can I collect a demo order?',
    answer: 'The website shows pickup at 5/5 Ryskulov Street, Office 3, Astana.',
    href: 'contacts.html#visit-title',
    action: 'See contact details'
  },
  {
    title: 'When is the store open?',
    answer: 'The listed opening hours are 11:00–21:00 every day.',
    href: 'contacts.html#visit-title',
    action: 'See opening hours'
  },
  {
    title: 'How do I prepare an order?',
    answer: 'Choose a product and size in Catalog, review the cart, then complete the Order form.',
    href: 'catalog.html',
    action: 'Open catalog'
  },
  {
    title: 'Is delivery or payment available here?',
    answer: 'No. This website creates a demo pickup summary; it does not arrange delivery or payment.',
    href: 'order.html#order-form',
    action: 'Read order details'
  },
  {
    title: 'How can I ask about size and availability?',
    answer: 'Contact the store through Instagram Direct or the details on the Contacts page.',
    href: 'contacts.html',
    action: 'Open contacts'
  }
];

  const guide = $('<section>').addClass('border rounded p-3 p-lg-4 my-5');
  const search = $('<input>', {id: 'about-guide-search', type: 'search',
    placeholder: 'Try pickup, hours, size or delivery'}).addClass('form-control mb-2');
  const count = $('<p>', {role: 'status'}).addClass('small text-body-secondary');
  const results = $('<ul>').addClass('list-unstyled row g-3 mb-0');
  guide.append($('<h3>').addClass('h4').text('Find a quick answer'),
    $('<label>', {for: 'about-guide-search'}).addClass('form-label').text('Search store information'),
    search, $('<button>', {type: 'button', 'data-reset': ''})
      .addClass('btn btn-outline-dark btn-sm mb-2').text('Show all answers'), count, results);
  $('#store-details').after(guide);

  function renderAnswers(query) {
    const word = query.trim().toLowerCase();
    const matches = answers.filter(function (entry) {
      return (entry.title + ' ' + entry.answer).toLowerCase().includes(word);
    });
    results.empty();
    count.text(matches.length + ' answers found.');
    if (matches.length === 0) {
      results.append($('<li>').addClass('col-12').text('No matches. Try another word or ')
        .append($('<a>', {href: 'contacts.html'}).text('open Contacts')));
    }
    matches.forEach(function (entry, index) {
      const item = $('<li>').addClass('col-12 col-md-6');
      const card = $('<article>').addClass('border rounded p-3 h-100');
      const button = $('<button>', {type: 'button', 'aria-expanded': 'false',
        'aria-controls': 'about-answer-' + index})
        .addClass('btn btn-outline-dark text-start text-wrap').text(entry.title);
      const answer = $('<div>', {id: 'about-answer-' + index}).addClass('d-none');
      answer.append($('<p>').addClass('small mt-2').text(entry.answer),
        $('<a>', {href: entry.href}).text(entry.action));
      card.append($('<h4>').addClass('h6').append(button), answer);
      results.append(item.append(card));
    });
  }

  search.on('input', function () { renderAnswers($(this).val()); });
  guide.on('click', 'button[data-reset]', function () {
    guide.find('input[type="search"]').val('').trigger('input').trigger('focus');
  });
  // Delegation works for new buttons recreated by every search.
  results.on('click', 'button[aria-controls]', function () {
    const button = $(this);
    const answer = button.closest('h4').siblings('div');
    const opening = button.attr('aria-expanded') === 'false';
    button.attr('aria-expanded', String(opening));
    // Finish the previous animation before a rapid second click.
    answer.stop(true, true);
    if (opening) {
      answer.removeClass('d-none').hide().slideDown(180);
    } else {
      answer.slideUp(180, function () { $(this).addClass('d-none'); });
    }
  });
  renderAnswers('');
});
