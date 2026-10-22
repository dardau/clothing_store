'use strict';

function createProductCard(product) {
    const card = document.createElement('li');
    card.classList.add('product-card', 'col-12', 'col-sm-6', 'col-lg-3');

    const figure = document.createElement('figure');
    figure.classList.add('card', 'h-100', 'mb-0', 'border-0', 'rounded-0');

    // Фотография и панель размеров поверх неё.
    const media = document.createElement('div');
    media.classList.add('position-relative', 'overflow-hidden');

    const image = document.createElement('img');
    image.classList.add('d-block', 'w-100', 'object-fit-cover');
    image.src = product.image;
    image.alt = product.name;

    const caption = document.createElement('figcaption');
    caption.classList.add('pt-2', 'pb-3');

    const details = document.createElement('div');
    details.classList.add('d-flex', 'align-items-start', 'gap-2');

    const text = document.createElement('div');
    text.classList.add('flex-grow-1');

    const name = document.createElement('p');
    name.classList.add('small', 'mb-1');
    name.textContent = product.name;

    const price = document.createElement('p');
    price.classList.add('small', 'mb-0');
    price.textContent = product.price.toLocaleString('en-US') + ' KZT';

    // Плюс открывает размеры.
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'add-' + product.id;
    button.classList.add('btn', 'btn-outline-dark', 'p-2', 'flex-shrink-0');
    button.textContent = '+';
    button.setAttribute('aria-label', 'Choose size for ' + product.name);
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'sizes-' + product.id);

    const panel = document.createElement('div');
    panel.id = 'sizes-' + product.id;
    panel.classList.add(
        'position-absolute', 'top-0', 'start-0', 'w-100', 'h-100',
        'bg-white', 'border', 'p-2', 'overflow-auto',
        'flex-column', 'gap-2', 'd-none'
    );
    panel.setAttribute('role', 'group');
    panel.setAttribute('aria-label', 'Choose size for ' + product.name);

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.classList.add(
        'btn', 'btn-outline-dark', 'btn-sm',
        'align-self-end', 'flex-shrink-0'
    );
    closeButton.textContent = '×';
    closeButton.setAttribute('aria-label', 'Close size selection');
    panel.append(closeButton);

    const heading = document.createElement('p');
    heading.classList.add('small', 'mb-1', 'flex-shrink-0');
    heading.textContent = 'Choose your size';
    panel.append(heading);

    // Сообщение после добавления.
    const feedback = document.createElement('p');
    feedback.classList.add('small', 'mb-0');
    feedback.setAttribute('role', 'status');

    const viewCart = document.createElement('a');
    viewCart.href = CART_URL;
    viewCart.classList.add(
        'btn', 'btn-outline-dark', 'btn-sm', 'mt-2', 'd-none'
    );
    viewCart.textContent = 'View cart';

    function setPickerOpen(isOpen) {
        panel.classList.toggle('d-none', !isOpen);
        panel.classList.toggle('d-flex', isOpen);
        button.setAttribute('aria-expanded', String(isOpen));
        button.textContent = isOpen ? '−' : '+';

        if (isOpen) {
            panel.querySelector('[data-size]').focus({ preventScroll: true });
        } else {
            button.focus({ preventScroll: true });
        }
    }

    // Создаём кнопку для каждого доступного размера.
    for (const size of product.sizes) {
        const sizeButton = document.createElement('button');
        sizeButton.type = 'button';
        sizeButton.dataset.size = size;
        sizeButton.classList.add(
            'btn', 'btn-outline-dark', 'text-start',
            'text-wrap', 'flex-shrink-0'
        );
        sizeButton.textContent = size;
        sizeButton.setAttribute(
            'aria-label',
            'Add ' + product.name + ', size ' + size
        );

        sizeButton.addEventListener('click', () => {
            const result = addToCart(products, cart, product.id, size, 1);

            showCartMessage(result.message);
            feedback.classList.add('mt-2');

            if (!result.success) {
                feedback.textContent = result.message;
                return;
            }

            renderCart();

            const savingError = document.querySelector('#cart-error').textContent;

            feedback.textContent = savingError || (
                'Added to cart · Size: ' + size +
                ' · Total items: ' + calculateCartQuantity(cart)
            );

            viewCart.classList.remove('d-none');
            setPickerOpen(false);
        });

        panel.append(sizeButton);
    }

    button.addEventListener('click', () => {
        setPickerOpen(button.getAttribute('aria-expanded') === 'false');
    });

    closeButton.addEventListener('click', () => {
        setPickerOpen(false);
    });

    // Панель можно закрыть клавишей Escape.
    panel.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            setPickerOpen(false);
        }
    });

    text.append(name, price);
    details.append(text, button);
    caption.append(details, feedback, viewCart);
    media.append(image, createFavoriteButton(product), panel);
    figure.append(media, caption);
    card.append(figure);
    styleSizePicker(card, product);

    return card;
}

function renderProductList(items, listElement) {
    const fragment = document.createDocumentFragment();

    if (items.length === 0) {
        const message = document.createElement('li');
        message.classList.add('col-12', 'text-body-secondary');
        message.textContent = 'No products found.';

        fragment.append(message);
    } else {
        for (const product of items) {
            const card = createProductCard(product);
            fragment.append(card);
        }
    }

    listElement.replaceChildren(fragment);

    return items.length;
}

// Выводим товары в существующие разделы каталога.
const productCategories = [
    'tops',
    'bottoms',
    'outerwear',
    'accessories'
];

for (const category of productCategories) {
    const listElement = document.querySelector(
        '#' + category + ' .product-grid'
    );

    if (listElement !== null) {
        const categoryProducts = filterProducts(products, '', category);

        renderProductList(categoryProducts, listElement);
    }
}
function showCartMessage(message) {
    document.querySelector('#cart-status').textContent = message;
}

function renderCart() {
    const list = document.querySelector('#cart-items');
    const template = document.querySelector('#cart-item-template');
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < cart.length; index += 1) {
        const cartItem = cart[index];
        const product = findProductById(products, cartItem.productId);

        const row = template.content.firstElementChild.cloneNode(true);
        const content = row.firstElementChild;
        const information = content.firstElementChild;
        const actions = content.lastElementChild;

        content.classList.remove(
            'd-flex', 'flex-column', 'flex-sm-row',
            'justify-content-between', 'gap-3'
        );

        content.classList.add('row', 'g-3');

        information.classList.remove('flex-grow-1');
        information.classList.add('col-8', 'col-md-6');

        actions.classList.add('col-12', 'col-md-4');

        const photoColumn = document.createElement('div');
        photoColumn.classList.add('col-4', 'col-md-2');

        const photo = document.createElement('img');
        photo.src = product.image;
        photo.alt = '';
        photo.classList.add('img-fluid', 'w-100', 'rounded');

        photoColumn.append(photo);
        content.prepend(photoColumn);

        row.querySelector('.cart-item-name').textContent = product.name;

        row.querySelector('.cart-item-price').textContent =
            product.price.toLocaleString('en-US');

        row.querySelector('.cart-item-subtotal').textContent =
            calculateSubtotal(
                product.price,
                cartItem.quantity
            ).toLocaleString('en-US');

        // Размер уже выбран в карточке товара.
        const sizeText = document.createElement('p');
        sizeText.classList.add('small', 'mb-2');
        sizeText.textContent = 'Size: ' + cartItem.size;

        row.querySelector('.cart-item-size')
            .closest('label')
            .replaceWith(sizeText);

        // Компактный счётчик вместо поля Quantity.
        const controls = document.createElement('div');
        controls.classList.add(
            'd-inline-flex', 'align-items-center', 'gap-2'
        );
        controls.setAttribute('role', 'group');
        controls.setAttribute(
            'aria-label',
            'Quantity for ' + product.name + ', ' + cartItem.size
        );

        const minus = document.createElement('button');
        minus.type = 'button';
        minus.id = 'cart-minus-' + index;
        minus.classList.add('btn', 'btn-outline-dark', 'btn-sm');
        minus.textContent = '−';
        minus.disabled = cartItem.quantity === 1;
        minus.setAttribute('aria-label', 'Decrease quantity');

        const count = document.createElement('span');
        count.textContent = cartItem.quantity;

        const plus = document.createElement('button');
        plus.type = 'button';
        plus.id = 'cart-plus-' + index;
        plus.classList.add('btn', 'btn-outline-dark', 'btn-sm');
        plus.textContent = '+';
        plus.setAttribute('aria-label', 'Increase quantity');

        function changeQuantity(change) {
            const quantity = cartItem.quantity + change;

            const result = updateCartQuantity(
                cart,
                cartItem.productId,
                cartItem.size,
                quantity
            );

            if (!result.success) {
                showCartMessage(result.message);
                return;
            }

            renderCart();

            showCartMessage(
                product.name + ', ' + cartItem.size + ': ' + quantity
            );

            // После перерисовки возвращаем фокус на доступную кнопку.
            const prefix = change < 0 && quantity > 1
                ? 'cart-minus-'
                : 'cart-plus-';

            document.getElementById(prefix + index)
                .focus({ preventScroll: true });
        }

        minus.addEventListener('click', () => changeQuantity(-1));
        plus.addEventListener('click', () => changeQuantity(1));

        controls.append(minus, count, plus);

        row.querySelector('.cart-item-quantity')
            .closest('label')
            .replaceWith(controls);

        // Удаление позиции.
        const removeButton = row.querySelector('.cart-item-remove');

        removeButton.setAttribute(
            'aria-label',
            'Remove ' + product.name + ' ' + cartItem.size
        );

        removeButton.addEventListener('click', () => {
            const result = removeFromCart(
                cart,
                cartItem.productId,
                cartItem.size
            );

            renderCart();
            showCartMessage(result.message);
            focusCartTitle();
        });

        fragment.append(row);
    }

    list.replaceChildren(fragment);

    const isEmpty = cart.length === 0;

    document.querySelector('#cart-count').textContent =
        calculateCartQuantity(cart);

    document.querySelector('#cart-total').textContent =
        calculateCartTotal(products, cart).toLocaleString('en-US');

    document.querySelector('#cart-empty')
        .classList.toggle('d-none', !isEmpty);

    const summary = document.querySelector('#cart-summary');
    summary.removeAttribute('hidden');
    summary.classList.toggle('d-none', isEmpty);

    const allSizesSelected = cart.every((item) => {
        const product = findProductById(products, item.productId);
        return product.sizes.includes(item.size);
    });

    const isSaved = saveCart(cart);

    const storageError = document.querySelector('#cart-error');

    storageError.removeAttribute('hidden');
    storageError.classList.toggle('d-none', isSaved);

    storageError.textContent = isSaved
        ? ''
        : 'Your cart could not be saved in this browser. Checkout is unavailable.';

    setCheckoutAvailable(!isEmpty && allSizesSelected && isSaved);
    updateCartNavigation();
}

function setCheckoutAvailable(available) {
    const checkout = document.querySelector('#cart-checkout');

    checkout.classList.toggle('disabled', !available);
    checkout.setAttribute('aria-disabled', String(!available));

    if (available) {
        checkout.removeAttribute('tabindex');
    } else {
        checkout.setAttribute('tabindex', '-1');
    }
}

function focusCartTitle() {
    const title = document.querySelector('#cart-title');
    title.setAttribute('tabindex', '-1');
    title.focus();
}

document.querySelector('#cart-clear').addEventListener('click', () => {
    const result = clearCart(cart);

    renderCart();
    showCartMessage(result.message);
    focusCartTitle();
});

document.querySelector('#cart-checkout').addEventListener('click', (event) => {
    const checkout = event.currentTarget;

    if (checkout.getAttribute('aria-disabled') === 'true') {
        event.preventDefault();
        showCartMessage('Add products and select their sizes before ordering.');
    }
});

// Пояснение для посетителя.
const sizeHint = document.createElement('p');
sizeHint.classList.add('small', 'text-body-secondary', 'mb-3');
sizeHint.textContent =
    'Sizes are chosen in the catalog. Use − and + to change quantities.';

document.querySelector('#cart-items').before(sizeHint);

// Начальное состояние корзины.
renderCart();
if (loadedCart.message !== '') {
    showCartMessage(loadedCart.message);
}
function configureCartView() {
    const cartSection = document.querySelector('#cart');

    // В обычном каталоге полную корзину не показываем.
    if (!isCartView) {
        cartSection.classList.add('d-none');
        return;
    }

    document.title = 'Shopping cart — Instyle.zh2';

    const page = document.createElement('div');
    page.classList.add('container', 'py-4');

    const back = document.createElement('a');
    back.href = 'catalog.html';
    back.classList.add('btn', 'btn-outline-dark', 'text-wrap');
    back.textContent = '← Continue shopping';

    const oldTitle = document.querySelector('#cart-title');

    const title = document.createElement('h2');
    title.id = 'cart-title';
    title.classList.add('h3', 'mb-0');
    title.textContent = 'Your shopping cart';

    oldTitle.replaceWith(title);

    document.querySelector('#cart-empty').textContent =
        'Your cart is empty. Choose Continue shopping to add products.';

    // Переносим существующую корзину в отдельный экран.
    page.append(back, cartSection);
    document.querySelector('main').replaceChildren(page);
}

// Загружаем актуальное содержимое после возвращения на страницу.
function refreshCatalogCart() {
    const storedCart = loadCart(products);

    cart.splice(0, cart.length, ...storedCart.items);

    renderCart();

    showCartMessage(
        storedCart.message || 'Your cart has been updated.'
    );
}

configureCartView();

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        refreshCatalogCart();
    }
});

window.addEventListener('storage', (event) => {
    if (event.key === 'instyle-cart-v1' || event.key === null) {
        refreshCatalogCart();
    }
});
function setupCatalogControls() {
    // На отдельном экране корзины поиск не нужен.
    if (isCartView) return;

    const firstCategory = document.querySelector('#tops');

    const section = document.createElement('section');
    section.id = 'catalog-products';
    section.classList.add('my-5');
    section.setAttribute('aria-labelledby', 'catalog-products-title');

    const heading = document.createElement('h2');
    heading.id = 'catalog-products-title';
    heading.classList.add('h3', 'mb-4');
    heading.textContent = 'Shop the collection';
    heading.tabIndex = -1;

    const form = document.createElement('form');
    form.classList.add('row', 'g-3', 'mb-3');
    form.setAttribute('role', 'search');
    form.setAttribute('aria-label', 'Find products');

    // Создаёт поле вместе с подписью и колонкой Bootstrap.
    function createControl(tag, id, labelText, columns) {
        const group = document.createElement('div');
        group.classList.add(...columns);

        const label = document.createElement('label');
        label.htmlFor = id;
        label.classList.add('form-label');
        label.textContent = labelText;

        const control = document.createElement(tag);
        control.id = id;

        control.classList.add(
            tag === 'input' ? 'form-control' : 'form-select'
        );

        group.append(label, control);
        form.append(group);

        return control;
    }

    // Добавляет варианты в выпадающий список.
    function addOptions(select, options) {
        for (const [value, text] of options) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = text;
            select.append(option);
        }
    }

    const search = createControl(
        'input',
        'catalog-search',
        'Search by name',
        ['col-12', 'col-md-6']
    );

    search.type = 'search';
    search.placeholder = 'For example: jacket';

    const category = createControl(
        'select',
        'catalog-category',
        'Category',
        ['col-12', 'col-sm-6', 'col-md-3']
    );

    addOptions(category, [
        ['all', 'All categories'],
        ['tops', 'Tops'],
        ['bottoms', 'Bottoms'],
        ['outerwear', 'Outerwear'],
        ['accessories', 'Accessories']
    ]);

    const sort = createControl(
        'select',
        'catalog-sort',
        'Sort by',
        ['col-12', 'col-sm-6', 'col-md-3']
    );

    addOptions(sort, [
        ['default', 'Default order'],
        ['price-asc', 'Price: low to high'],
        ['price-desc', 'Price: high to low']
    ]);

    const toolbar = document.createElement('div');
    toolbar.classList.add(
        'd-flex', 'flex-wrap', 'align-items-center',
        'justify-content-between', 'gap-2', 'mb-3'
    );

    const count = document.createElement('p');
    count.classList.add('small', 'text-body-secondary', 'mb-0');
    count.setAttribute('role', 'status');
    count.setAttribute('aria-atomic', 'true');

    const reset = document.createElement('button');
    reset.type = 'button';
    reset.classList.add(
        'btn', 'btn-outline-dark', 'btn-sm', 'text-wrap'
    );
    reset.textContent = 'Reset filters';

    const results = document.createElement('ul');
    results.classList.add(
        'product-grid', 'row', 'g-2',
        'g-md-4', 'list-unstyled', 'mb-5'
    );

    const favoritesFilter = createFavoritesFilter(updateResults);

    toolbar.append(count, favoritesFilter.group, reset);

    section.append(
        heading,
        form,
        toolbar,
        favoritesFilter.message,
        results
    );

    firstCategory.before(section);

    // Заменяем старые списки одним общим списком результатов.
    for (const categoryName of productCategories) {
        const oldSection = document.getElementById(categoryName);

        oldSection.querySelector('.product-grid').replaceChildren();
        oldSection.classList.add('d-none');
    }

    function updateResults() {
        // Выбираем, среди каких товаров искать.
        const source = favoritesFilter.input.checked
            ? products.filter((product) => favoriteIds.includes(product.id))
            : products;

        const filtered = filterProducts(
            source,
            search.value,
            category.value
        );

        const sorted = sortProducts(filtered, sort.value);
        const amount = renderProductList(sorted, results);

        count.textContent =
            'Showing ' + amount + ' of ' + source.length +
            (favoritesFilter.input.checked
                ? ' saved products'
                : ' products');

        if (amount === 0) {
            count.textContent +=
                favoritesFilter.input.checked && favoriteIds.length === 0
                    ? '. Turn off Only favorites and use ♡ to save products.'
                    : '. Change your search or reset the filters.';
        }

        favoritesFilter.update();
    }

    search.addEventListener('input', updateResults);
    category.addEventListener('change', updateResults);
    sort.addEventListener('change', updateResults);

    // Enter применяет поиск без перезагрузки страницы.
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        updateResults();
    });

    reset.addEventListener('click', () => {
        search.value = '';
        category.value = 'all';
        sort.value = 'default';

        favoritesFilter.input.checked = false;
        favoritesMessage = '';

        updateResults();
        search.focus();
    });

    // Плитки категорий сверху тоже включают фильтр.
    for (const categoryName of productCategories) {
        document.querySelectorAll('a[href="#' + categoryName + '"]')
            .forEach((link) => {
                link.href = '#catalog-products';

                link.addEventListener('click', () => {
                    search.value = '';
                    category.value = categoryName;

                    updateResults();
                    heading.focus({ preventScroll: true });
                });
            });
    }

    updateResults();
}

setupCatalogControls();
function styleSizePicker(card, product) {
    const panel = card.querySelector('#sizes-' + product.id);

    // Компактная панель внизу фотографии.
    panel.classList.remove('top-0', 'h-100', 'border');

    panel.classList.add(
        'bottom-0', 'mh-100', 'border-top',
        'shadow-sm', 'p-sm-3'
    );

    const closeButton = panel.querySelector('button');

    closeButton.classList.remove(
        'btn-outline-dark',
        'align-self-end'
    );

    closeButton.classList.add(
        'btn-light', 'rounded-circle', 'px-2', 'py-1'
    );

    const heading = panel.querySelector('p');
    heading.textContent = 'Select size';
    heading.classList.remove('mb-1');

    heading.classList.add(
        'mb-0', 'fw-semibold', 'text-uppercase'
    );

    const header = document.createElement('div');

    header.classList.add(
        'd-flex', 'justify-content-between',
        'align-items-center', 'gap-2', 'flex-shrink-0'
    );

    header.append(heading, closeButton);

    const sizes = document.createElement('div');
    sizes.classList.add('row', 'g-2', 'flex-shrink-0');

    for (const sizeButton of panel.querySelectorAll('[data-size]')) {
        sizeButton.classList.remove(
            'text-start',
            'flex-shrink-0'
        );

        sizeButton.classList.add(
            'w-100', 'py-2', 'rounded-0'
        );

        const column = document.createElement('div');

        column.classList.add(
            product.sizes.length === 1 ? 'col-12' : 'col-4'
        );

        // Переносим кнопку вместе с её обработчиком нажатия.
        column.append(sizeButton);
        sizes.append(column);
    }

    const hint = document.createElement('p');

    hint.classList.add(
        'small', 'text-body-secondary',
        'mb-0', 'flex-shrink-0'
    );

    hint.textContent = 'Select a size to add it to your cart.';

    panel.replaceChildren(header, sizes, hint);
}