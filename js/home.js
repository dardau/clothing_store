'use strict';

// A fixed selection from the shared catalog, without shopping controls on Home.
const trends = document.createElement('section');
trends.className = 'my-5';
trends.setAttribute('aria-labelledby', 'home-trends-title');
const heading = document.createElement('h2');
heading.id = 'home-trends-title';
heading.textContent = 'Trends';
const intro = document.createElement('p');
intro.textContent = 'Discover our edit of everyday styles.';
const grid = document.createElement('div');
grid.className = 'row g-4';
for (const id of ['tops-2', 'outerwear-1', 'accessories-2']) {
  const product = findProductById(products, id);
  if (!product) continue;
  const column = document.createElement('div');
  column.className = 'col-12 col-md-4';
  const card = document.createElement('article');
  card.className = 'card h-100';
  const image = document.createElement('img');
  image.src = product.image;
  image.alt = product.name;
  image.className = 'card-img-top home-trend-image';
  image.loading = 'lazy';
  const body = document.createElement('div');
  body.className = 'card-body d-flex flex-column align-items-start';
  const title = document.createElement('h3');
  title.className = 'h5';
  title.textContent = product.name;
  const price = document.createElement('p');
  price.textContent = product.price.toLocaleString('en-US') + ' KZT';
  const link = document.createElement('a');
  link.href = 'catalog.html';
  link.className = 'btn btn-outline-dark mt-auto';
  link.textContent = 'Explore catalog';
  body.append(title, price, link);
  card.append(image, body);
  column.append(card);
  grid.append(column);
}
trends.append(heading, intro, grid);
document.querySelector('main').append(trends);
