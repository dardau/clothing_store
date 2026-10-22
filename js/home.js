'use strict';

// A product from the shared catalog gives Home a direct shopping action.
const homeFeaturedProduct = getFeaturedProduct(products);
const homeFeaturedSection = document.createElement('section');
homeFeaturedSection.classList.add('row', 'g-4', 'align-items-center', 'border', 'rounded', 'p-3', 'p-md-4', 'my-5');
homeFeaturedSection.setAttribute('aria-labelledby', 'home-featured-title');

const homeFeaturedHeading = document.createElement('h2');
homeFeaturedHeading.id = 'home-featured-title';
homeFeaturedHeading.classList.add('h3', 'col-12', 'mb-0');
homeFeaturedHeading.textContent = 'Discover a product';
homeFeaturedSection.append(homeFeaturedHeading);

if (homeFeaturedProduct === null) {
  const empty = document.createElement('p');
  empty.classList.add('col-12', 'mb-0');
  empty.textContent = 'No products are available to feature right now.';
  homeFeaturedSection.append(empty);
} else {
  const picture = document.createElement('img');
  picture.classList.add('col-12', 'col-md-4', 'img-fluid', 'rounded');
  picture.src = homeFeaturedProduct.image;
  picture.alt = homeFeaturedProduct.name;

  const details = document.createElement('div');
  details.classList.add('col-12', 'col-md-8');

  const name = document.createElement('h3');
  name.classList.add('h4');
  name.textContent = homeFeaturedProduct.name;

  const price = document.createElement('p');
  price.textContent = homeFeaturedProduct.price.toLocaleString('en-US') + ' KZT';

  const sizeLabel = document.createElement('label');
  sizeLabel.classList.add('form-label');
  sizeLabel.htmlFor = 'home-featured-size';
  sizeLabel.textContent = 'Choose size';

  const sizeSelect = document.createElement('select');
  sizeSelect.id = 'home-featured-size';
  sizeSelect.classList.add('form-select', 'mb-3');
  for (const size of homeFeaturedProduct.sizes) {
    const option = document.createElement('option');
    option.value = size;
    option.textContent = size;
    sizeSelect.append(option);
  }

  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.classList.add('btn', 'btn-dark', 'me-2', 'mb-2');
  addButton.textContent = 'Add to cart';

  const catalogLink = document.createElement('a');
  catalogLink.classList.add('btn', 'btn-outline-dark', 'mb-2');
  catalogLink.href = 'catalog.html';
  catalogLink.textContent = 'Browse catalog';

  const feedback = document.createElement('p');
  feedback.classList.add('mb-0');
  feedback.setAttribute('role', 'status');

  addButton.addEventListener('click', () => {
    const latestCart = loadCart(products);
    if (latestCart.message !== '') {
      feedback.textContent = latestCart.message + ' Reload the page before adding an item.';
      return;
    }
    cart.splice(0, cart.length, ...latestCart.items);
    const previousCart = cart.map((item) => ({ ...item }));
    const result = addToCart(
      products, cart, homeFeaturedProduct.id, sizeSelect.value, 1
    );
    if (result.success && !saveCart(cart)) {
      cart.splice(0, cart.length, ...previousCart);
      feedback.textContent = 'Could not save the cart. Check browser storage settings.';
      return;
    }
    updateCartNavigation();
    feedback.replaceChildren();
    feedback.append(document.createTextNode(
      result.success
        ? homeFeaturedProduct.name + ' (' + sizeSelect.value + ') added to cart. '
        : result.message + ' '
    ));
    if (result.success) {
      const viewCart = document.createElement('a');
      viewCart.href = CART_URL;
      viewCart.textContent = 'View cart';
      feedback.append(viewCart);
    }
  });

  details.append(name, price, sizeLabel, sizeSelect, addButton, catalogLink, feedback);
  homeFeaturedSection.append(picture, details);
}

document.querySelector('.home-links').before(homeFeaturedSection);
