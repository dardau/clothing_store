'use strict';

// Keep the old descriptive text aligned with the demo pickup workflow.
const aboutOrderIntro = document.querySelector('#about-order-intro');
aboutOrderIntro.replaceChildren(document.createTextNode(
  'New pieces arrive almost every week. Ask about sizing through WhatsApp or ' +
  'Instagram Direct. For this website demo, choose items in the catalog, ' +
  'review your cart, then choose store pickup or courier delivery within Astana. ' +
  'The demo does not send an order or take payment. '
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
  'Choose store pickup or courier delivery in Astana, then create a demo summary.'
));
