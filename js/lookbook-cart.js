"use strict";
// Обе версии Lookbook вызывают общую корзину через эту функцию без DOM-кода.
function commitLookbookItems(selections) {
  const saved = loadCart(products);
  if (saved.message) return { success: false, message: saved.message };
  const next = saved.items;
  // Сначала меняем загруженную копию. При ошибке сохранённая корзина не меняется.
  for (const selection of selections) {
    const result = addToCart(products, next, selection.productId, selection.size, selection.quantity);
    if (!result.success) return result;
  }
  if (
    !Number.isSafeInteger(calculateCartTotal(products, next)) ||
    !Number.isSafeInteger(calculateCartQuantity(next))
  )
    return { success: false, message: "Quantity is too large." };
  // Сохраняем после всех проверок, затем обновляем корзину на странице.
  if (!saveCart(next))
    return { success: false, message: "Your cart could not be saved. No items were added." };
  cart.splice(0, cart.length, ...next);
  updateCartNavigation();
  return { success: true, message: "Added to your shared cart. Review your items in Catalog or Order." };
}
