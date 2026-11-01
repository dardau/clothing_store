// Catalog browsing was rewritten with jQuery from the previous createElement,
// classList, fragments and per-card addEventListener version. .append() and delegated .on() make generated cards clearer, though the builder is not shorter.
'use strict';

$(function () {
const productCategories = ['tops', 'bottoms', 'outerwear', 'accessories'];

function createProductCard(product) {
    const $card = $('<li>')
        .addClass('product-card col-12 col-sm-6 col-lg-3')
        .attr('data-product-id', product.id);
    const $figure = $('<figure>').addClass('card h-100 mb-0 border-0 rounded-0');
    const $media = $('<div>').addClass('position-relative overflow-hidden');

    // addClass applies the existing layout classes, attr sets the source/alt text, and prop enables lazy loading.
    const $image = $('<img>')
        .addClass('d-block w-100 object-fit-cover')
        .attr({ src: product.image, alt: product.name })
        .prop('loading', 'lazy');

    const $caption = $('<figcaption>').addClass('pt-2 pb-3');
    const $details = $('<div>').addClass('d-flex align-items-start gap-2');
    const $text = $('<div>').addClass('flex-grow-1');
    const $name = $('<p>').addClass('small mb-1').text(product.name);
    const $price = $('<p>')
        .addClass('small mb-0')
        .text(product.price.toLocaleString('en-US') + ' KZT');

    const $open = $('<button>')
        .attr({
            type: 'button',
            'data-action': 'open-size',
            'aria-label': 'Choose size for ' + product.name,
            'aria-expanded': 'false',
            'aria-controls': 'sizes-' + product.id
        })
        .addClass('btn btn-outline-dark p-2 flex-shrink-0')
        .text('+');

    const $panel = $('<div>')
        .attr({
            id: 'sizes-' + product.id,
            'data-role': 'size-panel',
            role: 'group',
            'aria-label': 'Choose size for ' + product.name
        })
        .addClass('position-absolute bottom-0 start-0 w-100 mh-100 bg-white border-top shadow-sm p-2 p-sm-3 overflow-auto d-none');

    const $panelHeader = $('<div>').addClass('d-flex justify-content-between align-items-center gap-2 flex-shrink-0');
    const $heading = $('<p>').addClass('small mb-0 fw-semibold text-uppercase').text('Select size');
    const $close = $('<button>')
        .attr({ type: 'button', 'data-action': 'close-size', 'aria-label': 'Close size selection' })
        .addClass('btn btn-light btn-sm rounded-circle px-2 py-1 flex-shrink-0')
        .text('×');
    const $sizes = $('<div>').addClass('row g-2 flex-shrink-0');

    // [data-size] is an attribute selector used later by the delegated click handler.
    $.each(product.sizes, function (_, size) {
        const $sizeButton = $('<button>')
            .attr({
                type: 'button',
                'data-size': size,
                'aria-label': 'Add ' + product.name + ', size ' + size
            })
            .addClass('btn btn-outline-dark w-100 py-2 rounded-0 text-wrap');
        const $column = $('<div>').addClass(product.sizes.length === 1 ? 'col-12' : 'col-4');
        $column.append($sizeButton.text(size));
        $sizes.append($column);
    });

    const $hint = $('<p>').addClass('small text-body-secondary mb-0 flex-shrink-0')
        .text('Select a size to add it to your cart.');
    $panelHeader.append($heading, $close);
    $panel.append($panelHeader, $sizes, $hint);

    const $feedback = $('<p>').addClass('small mb-0 product-feedback').attr('role', 'status');
    const $viewCart = $('<a>')
        .attr('href', CART_URL)
        .addClass('btn btn-outline-dark btn-sm mt-2 d-none')
        .text('View cart');

    $text.append($name, $price);
    $details.append($text, $open);
    $caption.append($details, $feedback, $viewCart);
    $media.append($image, createFavoriteButton(product), $panel);
    $figure.append($media, $caption);
    $card.append($figure);
    return $card;
}

function renderProductList(items, $list) {
    // Empty the old result, then append each card created from the products array.
    $list.empty();
    if (items.length === 0) {
        $list.append($('<li>').addClass('col-12 text-body-secondary').text('No products found.'));
        return 0;
    }

    $.each(items, function (_, product) {
        $list.append(createProductCard(product));
    });
    return items.length;
}

function showCartMessage(message) {
    $('#cart-status').text(message);
}

function renderCart() {
    const $list = $('#cart-items').empty();

    $.each(cart, function (index, cartItem) {
        const product = findProductById(products, cartItem.productId);
        const $row = $('<li>')
            .addClass('border-top py-3')
            .attr({ 'data-product-id': cartItem.productId, 'data-size': cartItem.size });
        const $content = $('<div>').addClass('row g-3');
        const $photoColumn = $('<div>').addClass('col-4 col-md-2');
        const $photo = $('<img>')
            .attr({ src: product.image, alt: '' })
            .addClass('img-fluid w-100 rounded');
        const $information = $('<div>').addClass('col-8 col-md-6');
        const $name = $('<h4>').addClass('h6').text(product.name);
        const $size = $('<p>').addClass('small mb-2').text('Size: ' + cartItem.size);
        const $price = $('<p>').addClass('small mb-0')
            .append('Unit price: ', $('<span>').text(product.price.toLocaleString('en-US')), ' KZT');
        const $actions = $('<div>').addClass('col-12 col-md-4');
        const $controls = $('<div>')
            .attr({ role: 'group', 'aria-label': 'Quantity for ' + product.name + ', ' + cartItem.size })
            .addClass('d-inline-flex align-items-center gap-2');
        const $minus = $('<button>')
            .attr({ type: 'button', id: 'cart-minus-' + index, 'data-quantity-change': '-1', 'aria-label': 'Decrease quantity' })
            .addClass('btn btn-outline-dark btn-sm')
            .prop('disabled', cartItem.quantity === 1)
            .text('−');
        const $count = $('<span>').text(cartItem.quantity);
        const $plus = $('<button>')
            .attr({ type: 'button', id: 'cart-plus-' + index, 'data-quantity-change': '1', 'aria-label': 'Increase quantity' })
            .addClass('btn btn-outline-dark btn-sm')
            .text('+');
        const $remove = $('<button>')
            .attr({ type: 'button', 'aria-label': 'Remove ' + product.name + ' ' + cartItem.size })
            .addClass('btn btn-outline-dark btn-sm text-wrap mt-2 cart-item-remove')
            .text('Remove');
        const subtotal = calculateSubtotal(product.price, cartItem.quantity).toLocaleString('en-US');
        const $subtotal = $('<p>').addClass('fw-bold mt-3 mb-0')
            .append('Subtotal: ', $('<span>').text(subtotal), ' KZT');

        $photoColumn.append($photo);
        $information.append($name, $size, $price);
        $controls.append($minus, $count, $plus);
        $actions.append($controls, $('<div>').append($remove));
        $content.append($photoColumn, $information, $actions);
        $row.append($content, $subtotal);
        $list.append($row);
    });

    const isEmpty = cart.length === 0;
    $('#cart-count').text(calculateCartQuantity(cart));
    $('#cart-total').text(calculateCartTotal(products, cart).toLocaleString('en-US'));
    $('#cart-empty').toggleClass('d-none', !isEmpty);
    $('#cart-summary').prop('hidden', false).toggleClass('d-none', isEmpty);

    const allSizesSelected = cart.every(function (item) {
        const product = findProductById(products, item.productId);
        return product.sizes.includes(item.size);
    });
    const isSaved = saveCart(cart);
    $('#cart-error')
        .prop('hidden', false)
        .toggleClass('d-none', isSaved)
        .text(isSaved ? '' : 'Your cart could not be saved in this browser. Checkout is unavailable.');

    setCheckoutAvailable(!isEmpty && allSizesSelected && isSaved);
    updateCartNavigation();
}

// Delegated handlers keep quantity and remove controls working after each array-based redraw.
$('#cart-items').on('click', 'button[data-quantity-change]', function () {
    const $button = $(this);
    const $row = $button.closest('li[data-product-id]');
    const productId = $row.attr('data-product-id');
    const size = $row.attr('data-size');
    const item = cart.find((entry) => entry.productId === productId && entry.size === size);
    if (!item) return;

    const change = Number($button.attr('data-quantity-change'));
    const quantity = item.quantity + change;
    const result = updateCartQuantity(cart, productId, size, quantity);
    if (!result.success) {
        showCartMessage(result.message);
        return;
    }

    const product = findProductById(products, productId);
    const index = $row.index();
    renderCart();
    showCartMessage(product.name + ', ' + size + ': ' + quantity);

    const focusId = change < 0 && quantity > 1 ? 'cart-minus-' : 'cart-plus-';
    $('#' + focusId + index).trigger('focus');
});

$('#cart-items').on('click', '.cart-item-remove', function () {
    const $row = $(this).closest('li[data-product-id]');
    const result = removeFromCart(cart, $row.attr('data-product-id'), $row.attr('data-size'));
    renderCart();
    showCartMessage(result.message);
    focusCartTitle();
});

function setCheckoutAvailable(available) {
    const $checkout = $('#cart-checkout');
    $checkout
        .toggleClass('disabled', !available)
        .attr('aria-disabled', String(!available));
    if (available) $checkout.removeAttr('tabindex');
    else $checkout.attr('tabindex', '-1');
}

function focusCartTitle() {
    $('#cart-title').attr('tabindex', '-1').trigger('focus');
}

$('#cart-clear').on('click', function () {
    const result = clearCart(cart);
    renderCart();
    showCartMessage(result.message);
    focusCartTitle();
});

$('#cart-checkout').on('click', function (event) {
    if ($(this).attr('aria-disabled') === 'true') {
        event.preventDefault();
        showCartMessage('Add products and select their sizes before ordering.');
    }
});

// Keep the cart hint in JavaScript; the list content itself is generated from the cart array.
$('<p>')
    .addClass('small text-body-secondary mb-3')
    .text('Sizes are chosen in the catalog. Use − and + to change quantities.')
    .insertBefore('#cart-items');

// Начальное состояние корзины.
renderCart();
if (loadedCart.message !== '') {
    showCartMessage(loadedCart.message);
}
function configureCartView() {
    const $cartSection = $('#cart');
    if (!isCartView) {
        $cartSection.addClass('d-none');
        return;
    }

    document.title = 'Shopping cart — Instyle.zh2';
    const $page = $('<div>').addClass('container py-4');
    const $back = $('<a>')
        .attr('href', 'catalog.html')
        .addClass('btn btn-outline-dark text-wrap')
        .text('← Continue shopping');
    const $title = $('<h2>')
        .attr({ id: 'cart-title', tabindex: '-1' })
        .addClass('h3 mb-0')
        .text('Your shopping cart');

    $('#cart-title').replaceWith($title);
    $('#cart-empty').text('Your cart is empty. Choose Continue shopping to add products.');
    $page.append($back, $cartSection);
    $('main').empty().append($page);
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

$(window).on('pageshow', (event) => {
    if (event.originalEvent && event.originalEvent.persisted) {
        refreshCatalogCart();
    }
});

$(window).on('storage', (event) => {
    const storageEvent = event.originalEvent;
    if (storageEvent && (storageEvent.key === 'instyle-cart-v1' || storageEvent.key === null)) {
        refreshCatalogCart();
    }
});
function setupCatalogControls() {
    // The full cart view has its own list; catalog filters belong to the product page.
    if (isCartView) return;

    const $firstCategory = $('#tops');
    if (!$firstCategory.length) return;

    const $section = $('<section>')
        .attr({ id: 'catalog-products', 'aria-labelledby': 'catalog-products-title' })
        .addClass('my-5');
    const $heading = $('<h2>')
        .attr('id', 'catalog-products-title')
        .addClass('h3 mb-4')
        .prop('tabIndex', -1)
        .text('Shop the collection');
    const $form = $('<form>')
        .attr({ id: 'catalog-search-form', role: 'search', 'aria-label': 'Find products' })
        .addClass('row g-3 mb-3');

    function createControl(tag, id, labelText, columns) {
        const $group = $('<div>').addClass(columns.join(' '));
        const $label = $('<label>').attr('for', id).addClass('form-label').text(labelText);
        const $control = $('<' + tag + '>')
            .attr('id', id)
            .addClass(tag === 'input' ? 'form-control' : 'form-select');
        $group.append($label, $control);
        $form.append($group);
        return $control;
    }

    function addOptions($select, options) {
        $.each(options, function (_, option) {
            $select.append($('<option>').val(option[0]).text(option[1]));
        });
    }

    const $search = createControl('input', 'catalog-search', 'Search by name', ['col-12', 'col-md-6'])
        .attr({ type: 'search', placeholder: 'For example: jacket', autocomplete: 'off' });
    const $category = createControl('select', 'catalog-category', 'Category', ['col-12', 'col-sm-6', 'col-md-3']);
    addOptions($category, [
        ['all', 'All categories'], ['tops', 'Tops'], ['bottoms', 'Bottoms'],
        ['outerwear', 'Outerwear'], ['accessories', 'Accessories']
    ]);
    const $sort = createControl('select', 'catalog-sort', 'Sort by', ['col-12', 'col-sm-6', 'col-md-3']);
    addOptions($sort, [
        ['default', 'Default order'], ['price-asc', 'Price: low to high'],
        ['price-desc', 'Price: high to low']
    ]);

    const $toolbar = $('<div>').addClass('d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3');
    const $count = $('<p>').attr({ role: 'status', 'aria-atomic': 'true' })
        .addClass('small text-body-secondary mb-0');
    const $favoriteGroup = $('<div>').addClass('form-check mb-0');
    const $favoriteInput = $('<input>')
        .attr({ type: 'checkbox', id: 'favorites-only', 'aria-label': 'Show only saved products' })
        .addClass('form-check-input');
    const $favoriteLabel = $('<label>').attr('for', 'favorites-only').addClass('form-check-label');
    const $favoriteMessage = $('<p>').attr('role', 'status')
        .addClass('small text-body-secondary mb-3 d-none');
    const $reset = $('<button>').attr('type', 'button')
        .addClass('btn btn-outline-dark btn-sm text-wrap')
        .text('Reset filters');
    const $results = $('<ul>').addClass('product-grid row g-2 g-md-4 list-unstyled mb-5');

    $favoriteGroup.append($favoriteInput, $favoriteLabel);
    $toolbar.append($count, $favoriteGroup, $reset);
    $section.append($heading, $form, $toolbar, $favoriteMessage, $results);
    $firstCategory.before($section);

    // Existing category lists are emptied and hidden; the cards now come only from the JavaScript array.
    $.each(productCategories, function (_, categoryName) {
        const $oldSection = $('#' + categoryName);
        $oldSection.find('.product-grid').empty();
        $oldSection.addClass('d-none');
    });

    function updateFavoritesLabel() {
        $favoriteLabel.text('Only favorites (' + favoriteIds.length + ')');
        $favoriteMessage
            .text(favoritesMessage)
            .toggleClass('d-none', favoritesMessage === '');
    }

    function updateResults() {
        const onlyFavorites = $favoriteInput.prop('checked');
        const source = onlyFavorites
            ? products.filter((product) => favoriteIds.includes(product.id))
            : products;
        const filtered = filterProducts(source, String($search.val() || '').trim(), $category.val());
        const sorted = sortProducts(filtered, $sort.val());
        const amount = renderProductList(sorted, $results);

        $count.text(
            'Showing ' + amount + ' of ' + source.length +
            (onlyFavorites ? ' saved products' : ' products') +
            (amount === 0
                ? onlyFavorites && favoriteIds.length === 0
                    ? '. Turn off Only favorites and use ♡ to save products.'
                    : '. Change your search or reset the filters.'
                : '')
        );
        updateFavoritesLabel();
    }

    // Delegation catches size controls in cards appended after this parent was created.
    $section.on('click', 'button[data-action=\"open-size\"]', function () {
        const $button = $(this);
        const $panel = $button.closest('figure').find('[data-role=\"size-panel\"]');
        $panel.removeClass('d-none').hide().stop(true, true).slideDown(180, function () {
            $button.attr('aria-expanded', 'true').text('−');
            $panel.find('[data-size]:first').trigger('focus');
        });
    });

    $section.on('click', 'button[data-action=\"close-size\"]', function () {
        const $button = $(this);
        const $panel = $button.closest('[data-role=\"size-panel\"]');
        const $openButton = $button.closest('figure').find('button[data-action=\"open-size\"]');
        $panel.stop(true, true).slideUp(180, function () {
            $(this).addClass('d-none');
            $openButton.attr('aria-expanded', 'false').text('+').trigger('focus');
        });
    });

    $section.on('click', 'button[data-size]', function () {
        const $button = $(this);
        const $card = $button.closest('li.product-card');
        const productId = $card.attr('data-product-id');
        const size = $button.attr('data-size');
        const result = addToCart(products, cart, productId, size, 1);
        const $feedback = $card.find('.product-feedback').first();

        showCartMessage(result.message);
        if (!result.success) {
            $feedback.text(result.message).addClass('mt-2');
            return;
        }

        renderCart();
        const savingError = $('#cart-error').text();
        $feedback
            .text(savingError || ('Added to cart · Size: ' + size + ' · Total items: ' + calculateCartQuantity(cart)))
            .addClass('mt-2');
        $card.find('a[href=\"' + CART_URL + '\"]').removeClass('d-none');

        const $panel = $button.closest('[data-role=\"size-panel\"]');
        $panel.stop(true, true).slideUp(180, function () {
            $(this).addClass('d-none');
            $card.find('button[data-action=\"open-size\"]').attr('aria-expanded', 'false').text('+').trigger('focus');
        });
    });

    $section.on('keydown', '[data-role=\"size-panel\"]', function (event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            $(this).find('button[data-action=\"close-size\"]').trigger('click');
        }
    });

    $form.on('input', 'input', updateResults);
    $form.on('change', 'select', updateResults);
    $favoriteInput.on('change', function () {
        favoritesMessage = '';
        updateResults();
    });
    $form.on('submit', function (event) {
        // Without preventDefault(), the search form submits to # and reloads the page.
        event.preventDefault();
        updateResults();
    });

    $reset.on('click', function () {
        $search.val('');
        $category.val('all');
        $sort.val('default');
        $favoriteInput.prop('checked', false);
        favoritesMessage = '';
        updateResults();
        $search.trigger('focus');
    });

    // Filter selectors include id, class and attribute hooks; each category link is mapped to its filter.
    $.each(productCategories, function (_, categoryName) {
        $('a[href=\"#' + categoryName + '\"]').each(function () {
            $(this)
                .attr({ href: '#catalog-products', 'data-category': categoryName });
        });
    });
    $('main').on('click', 'a[data-category][href=\"#catalog-products\"]', function () {
        const $link = $(this);
        $search.val('');
        $category.val($link.attr('data-category'));
        updateResults();
        $heading.trigger('focus');
    });

    $(document).on('favoriteschange', updateResults);
    $(window).on('storage', function (event) {
        const storageEvent = event.originalEvent;
        if (storageEvent && (storageEvent.key === 'instyle-favorites-v1' || storageEvent.key === null)) {
            const saved = readFavorites();
            favoriteIds = saved.ids;
            favoritesMessage = saved.message;
            updateResults();
        }
    });
    $(window).on('pageshow', function (event) {
        if (event.originalEvent && event.originalEvent.persisted) updateResults();
    });

    updateResults();
}

setupCatalogControls();
});
