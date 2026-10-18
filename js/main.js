'use strict';

const products = [
  {
    id: 'tops-1',
    name: 'Layered long-sleeve top',
    price: 12000,
    category: 'tops',
    sizes: ['S', 'M', 'L'],
    image: 'images/tops1.jpg'
  },
  {
    id: 'tops-2',
    name: 'Long-sleeve top with ribbons',
    price: 12500,
    category: 'tops',
    sizes: ['S', 'M', 'L'],
    image: 'images/tops2.jpg'
  },
  {
    id: 'tops-3',
    name: 'Turquoise sweater',
    price: 9000,
    category: 'tops',
    sizes: ['S', 'M', 'L'],
    image: 'images/tops3.jpg'
  },
  {
    id: 'tops-4',
    name: 'Denim shirt',
    price: 18000,
    category: 'tops',
    sizes: ['S', 'M', 'L'],
    image: 'images/tops4.jpg'
  },
  {
    id: 'bottoms-1',
    name: 'Denim bermuda shorts',
    price: 18000,
    category: 'bottoms',
    sizes: ['S', 'M', 'L'],
    image: 'images/bottoms1.jpg'
  },
  {
    id: 'bottoms-2',
    name: 'Light-colored jeans',
    price: 20500,
    category: 'bottoms',
    sizes: ['S', 'M', 'L'],
    image: 'images/bottoms2.jpg'
  },
  {
    id: 'bottoms-3',
    name: 'Oversized joggers',
    price: 13000,
    category: 'bottoms',
    sizes: ['S', 'M', 'L'],
    image: 'images/bottoms3.jpg'
  },
  {
    id: 'bottoms-4',
    name: 'White lace skirt',
    price: 12500,
    category: 'bottoms',
    sizes: ['S', 'M', 'L'],
    image: 'images/bottoms4.jpg'
  },
  {
    id: 'outerwear-1',
    name: 'Black oversized eco-leather jacket',
    price: 42000,
    category: 'outerwear',
    sizes: ['S', 'M', 'L'],
    image: 'images/outerwear1.jpg'
  },
  {
    id: 'outerwear-2',
    name: 'Black eco-leather bomber jacket',
    price: 36000,
    category: 'outerwear',
    sizes: ['S', 'M', 'L'],
    image: 'images/outerwear2.jpg'
  },
  {
    id: 'outerwear-3',
    name: 'Faux suede jacket',
    price: 39500,
    category: 'outerwear',
    sizes: ['S', 'M', 'L'],
    image: 'images/outerwear3.jpg'
  },
  {
    id: 'outerwear-4',
    name: 'Oversized belted coat',
    price: 42000,
    category: 'outerwear',
    sizes: ['S', 'M', 'L'],
    image: 'images/outerwear4.jpg'
  },
  {
    id: 'accessories-1',
    name: 'Striped tie',
    price: 4000,
    category: 'accessories',
    sizes: ['One size'],
    image: 'images/access1.jpg'
  },
  {
    id: 'accessories-2',
    name: 'Beige eco-leather bag',
    price: 15000,
    category: 'accessories',
    sizes: ['One size'],
    image: 'images/access2.jpg'
  },
  {
    id: 'accessories-3',
    name: 'Black-stone pendant',
    price: 6500,
    category: 'accessories',
    sizes: ['One size'],
    image: 'images/access3.jpg'
  },
  {
    id: 'accessories-4',
    name: 'Small mixed-material bag',
    price: 11000,
    category: 'accessories',
    sizes: ['One size'],
    image: 'images/access4.jpg'
  }
];
function findProductById(items, productId) {
  for (const item of items) {
    if (item.id === productId) {
      return item;
    }
  }

  return null;
}
function calculateSubtotal(price, quantity) {
  if (
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    return null;
  }

  return price * quantity;
}
function calculateProductTotal(items, productId, quantity) {
  const product = findProductById(items, productId);

  if (product === null) {
    return null;
  }

  return calculateSubtotal(product.price, quantity);
}
const loadedCart = loadCart(products);
const cart = loadedCart.items;

function calculateCartTotal(items, cartItems) {
  let total = 0;

  for (const cartItem of cartItems) {
    const subtotal = calculateProductTotal(
      items,
      cartItem.productId,
      cartItem.quantity
    );

    if (subtotal === null) {
      return null;
    }

    total += subtotal;
  }

  return total;
}
function addToCart(items, cartItems, productId, size, quantity) {
  const product = findProductById(items, productId);

  if (product === null) {
    return {
      success: false,
      message: 'Product not found.'
    };
  }

  if (!product.sizes.includes(size)) { 
    return {
      success: false,
      message: 'Choose an available size.'
    };
  }

  if (calculateSubtotal(product.price, quantity) === null) {
    return {
      success: false,
      message: 'Enter a whole number of items, at least 1.'
    };
  }

  for (const cartItem of cartItems) {
    if (cartItem.productId === productId && cartItem.size === size) {
      cartItem.quantity += quantity;

      return {
        success: true,
        message: 'Quantity updated.'
      };
    }
  }

  cartItems.push({
    productId: productId,
    size: size,
    quantity: quantity
  });

  return {
    success: true,
    message: 'Product added to cart.'
  };
}
function updateCartQuantity(cartItems, productId, size, quantity) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return {
      success: false,
      message: 'Enter a whole number of items, at least 1.'
    };
  }

  for (const cartItem of cartItems) {
    if (cartItem.productId === productId && cartItem.size === size) {
      cartItem.quantity = quantity;

      return {
        success: true,
        message: 'Quantity updated.'
      };
    }
  }

  return {
    success: false,
    message: 'This item is not in your cart.'
  };
}
function removeFromCart(cartItems, productId, size) {
  for (let index = 0; index < cartItems.length; index += 1) {
    const cartItem = cartItems[index];

    if (cartItem.productId === productId && cartItem.size === size) {
      cartItems.splice(index, 1);

      return {
        success: true,
        message: 'Product removed from cart.'
      };
    }
  }

  return {
    success: false,
    message: 'This item is not in your cart.'
  };
}
function clearCart(cartItems) {
  if (cartItems.length === 0) {
    return {
      success: true,
      message: 'Your cart is already empty.'
    };
  }

  cartItems.length = 0;

  return {
    success: true,
    message: 'Your cart has been cleared.'
  };
}

function calculateCartQuantity(cartItems) {
  let totalQuantity = 0;

  for (const cartItem of cartItems) {
    totalQuantity += cartItem.quantity;
  }

  return totalQuantity;
}
function filterProducts(items, searchText, category) {
  const query = searchText.trim().toLowerCase();
  const results = [];

  for (const product of items) {
    const matchesSearch = product.name.toLowerCase().includes(query);

    const matchesCategory =
      category === 'all' || product.category === category;

    if (matchesSearch && matchesCategory) {
      results.push(product);
    }
  }

  return results;
}
function sortProducts(items, sortOrder) {
  const sortedItems = items.slice();

  if (sortOrder === 'price-asc') {
    sortedItems.sort((first, second) => first.price - second.price);
  } else if (sortOrder === 'price-desc') {
    sortedItems.sort((first, second) => second.price - first.price);
  }

  return sortedItems;
}
function getFeaturedProduct(items) {
  if (items.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * items.length);

  return items[randomIndex];
}
function saveCart(cartItems) {
  try {
    const savedItems = cartItems.map((item) => ({
      productId: item.productId,
      size: item.size,
      quantity: item.quantity
    }));

    localStorage.setItem(
      'instyle-cart-v1',
      JSON.stringify(savedItems)
    );

    return true;
  } catch {
    return false;
  }
}

function loadCart(items) {
  try {
    const savedText = localStorage.getItem('instyle-cart-v1');

    if (savedText === null) {
      return { items: [], message: '' };
    }

    const savedItems = JSON.parse(savedText);

    if (!Array.isArray(savedItems)) {
      throw new Error('Invalid cart');
    }

    const restoredItems = [];

    for (const item of savedItems) {
      if (
        item === null ||
        typeof item !== 'object' ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1
      ) {
        throw new Error('Invalid cart item');
      }

      const result = addToCart(
        items,
        restoredItems,
        item.productId,
        item.size,
        item.quantity
      );

      if (
        !result.success ||
        !Number.isSafeInteger(calculateCartQuantity(restoredItems)) ||
        !Number.isSafeInteger(calculateCartTotal(items, restoredItems))
      ) {
        throw new Error('Invalid cart item');
      }
    }

    return { items: restoredItems, message: '' };
  } catch {
    return {
      items: [],
      message:
        'The saved cart could not be loaded. Please add your items again.'
    };
  }
}