'use strict';

// Keep the old descriptive text aligned with the demo pickup workflow.
const aboutOrderIntro = document.querySelector('#about-order-intro');
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
