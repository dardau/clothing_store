'use strict';

const FAVORITES_STORAGE_KEY = 'instyle-favorites-v1';
const initialFavorites = readFavorites();

let favoriteIds = initialFavorites.ids;
let favoritesMessage = initialFavorites.message;

// Загружаем сохранённые ID товаров.
function readFavorites() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]'
    );

    if (!Array.isArray(saved)) {
      throw new Error('Invalid favorites');
    }

    const validIds = saved.filter((id) =>
      products.some((product) => product.id === id)
    );

    return {
      ids: [...new Set(validIds)],
      message: ''
    };
  } catch {
    return {
      ids: [],
      message: 'Saved favorites could not be loaded in this browser.'
    };
  }
}

// Добавляем товар или убираем его из избранного.
function toggleFavorite(product) {
  const wasSaved = favoriteIds.includes(product.id);

  const nextIds = wasSaved
    ? favoriteIds.filter((id) => id !== product.id)
    : [...favoriteIds, product.id];

  try {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(nextIds)
    );
  } catch {
    return {
      success: false,
      message: 'Favorites could not be saved. The list has not changed.'
    };
  }

  favoriteIds = nextIds;

  return {
    success: true,
    message: product.name + (
      wasSaved
        ? ' removed from favorites.'
        : ' added to favorites.'
    )
  };
}

// Создаём сердечко на фотографии.
function createFavoriteButton(product) {
  const button = document.createElement('button');
  const isFavorite = favoriteIds.includes(product.id);

  button.type = 'button';
  button.id = 'favorite-' + product.id;

  button.classList.add(
    'btn', 'btn-light', 'position-absolute',
    'top-0', 'end-0', 'm-2', 'rounded-circle',
    'p-2', 'fs-5', 'lh-1'
  );

  button.textContent = isFavorite ? '♥' : '♡';

  button.setAttribute(
    'aria-label',
    'Favorite: ' + product.name
  );

  button.setAttribute('aria-pressed', String(isFavorite));

  button.title = isFavorite
    ? 'Remove from favorites'
    : 'Save to favorites';

  button.addEventListener('click', () => {
    const result = toggleFavorite(product);
    favoritesMessage = result.message;

    // Сообщаем каталогу, что список изменился.
    document.dispatchEvent(new Event('favoriteschange'));

    // Возвращаем фокус после перерисовки карточек.
    const target = document.getElementById(button.id) ||
      document.getElementById('favorites-only');

    if (target !== null) {
      target.focus({ preventScroll: true });
    }
  });

  return button;
}

// Создаём переключатель «Только избранное».
function createFavoritesFilter(refreshResults) {
  const group = document.createElement('div');
  group.classList.add('form-check', 'mb-0');

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = 'favorites-only';
  input.classList.add('form-check-input');

  const label = document.createElement('label');
  label.htmlFor = input.id;
  label.classList.add('form-check-label');

  group.append(input, label);

  const message = document.createElement('p');

  message.classList.add(
    'small', 'text-body-secondary', 'mb-3'
  );

  message.setAttribute('role', 'status');

  function update() {
    label.textContent =
      'Only favorites (' + favoriteIds.length + ')';

    message.textContent = favoritesMessage;

    message.classList.toggle(
      'd-none',
      favoritesMessage === ''
    );
  }

  input.addEventListener('change', () => {
    favoritesMessage = '';
    refreshResults();
  });

  document.addEventListener(
    'favoriteschange',
    refreshResults
  );

  function reload() {
    const saved = readFavorites();

    favoriteIds = saved.ids;
    favoritesMessage = saved.message;

    refreshResults();
  }

  // Обновляем список при изменениях в другой вкладке.
  window.addEventListener('storage', (event) => {
    if (
      event.key === FAVORITES_STORAGE_KEY ||
      event.key === null
    ) {
      reload();
    }
  });

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) reload();
  });

  return { group, input, message, update };
}