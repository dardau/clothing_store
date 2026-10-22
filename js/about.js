'use strict';

// Keep the old descriptive text aligned with the demo pickup workflow.
const aboutOrderIntro = document.querySelector('#lookbook-preview').previousElementSibling;
aboutOrderIntro.replaceChildren(document.createTextNode(
  'New pieces arrive almost every week. Ask about sizing through WhatsApp or ' +
  'Instagram Direct. For this website demo, choose items in the catalog, ' +
  'review your cart, and prepare a pickup summary at 5/5 Ryskulov Street, ' +
  'Office 3, Astana. The demo does not send an order or arrange delivery. '
));
const aboutOrderLink = document.createElement('a');
aboutOrderLink.href = 'catalog.html';
aboutOrderLink.textContent = 'Start in the catalog.';
aboutOrderIntro.append(aboutOrderLink);

const aboutOrderSteps = document.querySelector('#store-details ol');
aboutOrderSteps.children[0].replaceChildren(document.createTextNode(
  'Browse the catalog and add items with their sizes to the cart.'
));
aboutOrderSteps.children[1].replaceChildren(document.createTextNode(
  'Review quantities in the cart, then open the Order page and enter your contact details.'
));
aboutOrderSteps.children[2].replaceChildren(document.createTextNode(
  'Check the total and create a demo summary. Pickup is shown only at 5/5 Ryskulov Street, Office 3.'
));

const aboutAnswers = [
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

function filterAboutAnswers(entries, query) {
  const normalized = query.trim().toLocaleLowerCase();
  return entries.filter((entry) =>
    (entry.title + ' ' + entry.answer).toLocaleLowerCase().includes(normalized)
  );
}

const guide = document.createElement('section');
guide.classList.add('border', 'rounded', 'p-3', 'p-lg-4', 'my-5');
guide.setAttribute('aria-labelledby', 'about-guide-title');

const heading = document.createElement('h3');
heading.id = 'about-guide-title';
heading.classList.add('h4');
heading.textContent = 'Find a quick answer';

const label = document.createElement('label');
label.htmlFor = 'about-guide-search';
label.classList.add('form-label');
label.textContent = 'Search store information';

const search = document.createElement('input');
search.id = 'about-guide-search';
search.type = 'search';
search.classList.add('form-control', 'mb-2');
search.placeholder = 'Try pickup, hours, size or delivery';

const resetSearch = document.createElement('button');
resetSearch.type = 'button';
resetSearch.classList.add('btn', 'btn-outline-dark', 'btn-sm', 'mb-2');
resetSearch.textContent = 'Show all answers';

const count = document.createElement('p');
count.classList.add('small', 'text-body-secondary');
count.setAttribute('role', 'status');

const results = document.createElement('ul');
results.classList.add('list-unstyled', 'row', 'g-3', 'mb-0');

function renderAboutAnswers() {
  const matches = filterAboutAnswers(aboutAnswers, search.value);
  count.textContent = matches.length + ' answer' + (matches.length === 1 ? '' : 's') + ' found.';
  results.replaceChildren();

  if (matches.length === 0) {
    const empty = document.createElement('li');
    empty.classList.add('col-12');
    empty.append(document.createTextNode('No match. Try another word or '));
    const contactsLink = document.createElement('a');
    contactsLink.href = 'contacts.html';
    contactsLink.textContent = 'open Contacts';
    empty.append(contactsLink, document.createTextNode('.'));
    results.append(empty);
    return;
  }

  for (const entry of matches) {
    const item = document.createElement('li');
    item.classList.add('col-12', 'col-md-6');
    const card = document.createElement('article');
    card.classList.add('border', 'rounded', 'p-3', 'h-100');
    const title = document.createElement('h4');
    title.classList.add('h6');
    title.textContent = entry.title;
    const answer = document.createElement('p');
    answer.classList.add('small');
    answer.textContent = entry.answer;
    const link = document.createElement('a');
    link.href = entry.href;
    link.textContent = entry.action;
    card.append(title, answer, link);
    item.append(card);
    results.append(item);
  }
}

search.addEventListener('input', renderAboutAnswers);
resetSearch.addEventListener('click', () => {
  search.value = '';
  renderAboutAnswers();
  search.focus();
});
guide.append(heading, label, search, resetSearch, count, results);
document.querySelector('#store-details').after(guide);
renderAboutAnswers();
