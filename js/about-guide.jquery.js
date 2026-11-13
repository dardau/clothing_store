// jQuery 3.7.1: store guide and expandable answers.
$(function () {
  'use strict';
  const answers = [
  {
    title: 'Where are your stores located?',
    answer: 'Visit our three locations in Astana. All three are open daily from 11:00 to 21:00.',
    locations: [
      '11 Respublika Avenue — 11:00–21:00.',
      '5/5 Turar Ryskulov Street, Nexpo City residential complex — 11:00–21:00.',
      '5 Dostyk Street, Severnoye Siyanie residential complex, boutique B13, 1st floor — 11:00–21:00.'
    ],
    href: 'https://2gis.kz/astana/firm/70000001032452316',
    action: 'View Respublika Avenue store on 2GIS'
  },
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
  const results = $('<ul>').addClass('list-unstyled row g-3 mb-0');
  guide.append($('<h3>').addClass('h4').text('Frequently asked questions'), results);
  $('#store-details').after(guide);

  function renderAnswers() {
    results.empty();
    answers.forEach(function (entry, index) {
      const item = $('<li>').addClass('col-12 col-md-6');
      const card = $('<article>').addClass('border rounded p-3 h-100');
      const button = $('<button>', {type: 'button', 'aria-expanded': 'false',
        'aria-controls': 'about-answer-' + index})
        .addClass('btn btn-outline-dark text-start text-wrap').text(entry.title);
      const answer = $('<div>', {id: 'about-answer-' + index}).addClass('d-none');
      answer.append($('<p>').addClass('small mt-2').text(entry.answer));
      if (entry.locations) {
        const locations = $('<ul>').addClass('small mb-3');
        entry.locations.forEach(function (location) {
          locations.append($('<li>').text(location));
        });
        answer.append(locations);
      }
      answer.append($('<a>', {href: entry.href}).text(entry.action));
      card.append($('<h4>').addClass('h6').append(button), answer);
      results.append(item.append(card));
    });
  }

  // Handle clicks on question buttons within the FAQ.
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
  renderAnswers();
});
