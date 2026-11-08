"use strict";
document.addEventListener("DOMContentLoaded", function () {
  function announce(text) {
    const message = document.querySelector("#cart-message");
    message.classList.remove("hidden");
    message.textContent = text;
  }
  document.querySelectorAll(".look-product").forEach(function (article) {
    const id = "lookbook-" + article.querySelector("button[id^=add-]").id.replace("add-", "");
    article.querySelector(".btn-check").remove();
    article.querySelector("label").replaceWith(createFavoriteButton(findProductById(products, id)));
  });
  function node(tag, classes = [], text) {
    const element = document.createElement(tag);
    element.classList.add(...classes);
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function availableRandomItems(items) {
    // Берём отдельные вещи с размерами, исключая готовые комплекты.
    return items.filter(
      (item) =>
        !item.isSet &&
        !/\b(set|suit|co-ord|two[ -]piece)\b/i.test(item.name) &&
        Array.isArray(item.sizes) &&
        item.sizes.length > 0,
    );
  }
  function chooseRandomLook(items, previous = []) {
    const eligible = availableRandomItems(items);
    const tops = eligible.filter((item) => item.category === "tops");
    const bottoms = eligible.filter((item) => item.category === "bottoms");
    const pairs = [];
    const alternatives = [];
    // Соединяем каждый верх с каждым низом. Прошлую пару не повторяем, если есть выбор.
    for (const top of tops) {
      for (const bottom of bottoms) {
        const pair = [top, bottom];
        pairs.push(pair);
        if (top.id !== previous[0] || bottom.id !== previous[1]) {
          alternatives.push(pair);
        }
      }
    }
    let pool = pairs;
    if (alternatives.length > 0) pool = alternatives;
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  // Один расчёт используется при создании образа и при замене вещи.
  function calculateLookTotal(pair) {
    let total = 0;
    for (const product of pair) total += product.price;
    return total;
  }
  function randomButton(text, classes) {
    const button = node("button", classes, text);
    button.type = "button";
    return button;
  }
  const randomTrigger = randomButton("Random Look", [
    "btn",
    "btn-dark",
    "mt-3",
  ]);
  const randomBlock = node("section", [
    "bg-red",
    "rounded-4",
    "p-3",
    "p-md-4",
    "mx-3",
    "mx-md-5",
    "mt-4",
  ]);
  randomBlock.id = "random-look-result";
  randomBlock.hidden = true;
  randomBlock.setAttribute("aria-labelledby", "random-look-title");
  randomTrigger.setAttribute("aria-controls", randomBlock.id);
  randomTrigger.setAttribute("aria-expanded", "false");
  const categories = document.querySelector(".style-categories-section");
  categories.append(randomTrigger);
  categories.after(randomBlock);
  let previousRandomPair = [];
  const money = (price) => price.toLocaleString("en-US") + " KZT";
  function closeRandomLook() {
    randomBlock.hidden = true;
    randomTrigger.setAttribute("aria-expanded", "false");
    randomTrigger.focus({ preventScroll: true });
    announce("Random look closed.");
  }
  // Одна функция создаёт карточку и при первом показе, и при замене.
  function createRandomCard(product, index) {
    const column = node("div", ["col-12", "col-sm-6"]);
    const article = node("article", ["h-100"]);
    const media = node("div", [
      "look-product-image",
      "overflow-hidden",
      "rounded-3",
      "bg-light",
    ]);
    const image = node("img", [
      "w-100",
      "h-100",
      "d-block",
      "object-fit-cover",
    ]);
    image.src = product.image;
    image.alt = product.name;
    media.append(image);
    const name = node("h4", ["fs-6", "mt-3", "mb-1"], product.name);
    const price = node("p", ["small", "mb-2"], money(product.price));
    const label = node("label", ["form-label"], "Size");
    const size = node("select", ["form-select"]);
    size.id = "random-size-" + product.id;
    size.name = size.id;
    size.required = true;
    size.setAttribute("aria-label", "Size for " + product.name);
    label.htmlFor = size.id;
    for (const value of ["", ...product.sizes]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value || "Choose size";
      size.append(option);
    }
    const replace = randomButton("Replace item", ["btn", "btn-outline-dark", "mt-2"]);
    replace.dataset.replaceIndex = String(index);
    article.append(media, name, price, label, size, replace);
    column.append(article);
    return { column, product, size };
  }
  // Генерация строит весь образ заново; замена ниже меняет только одну карточку.
  function renderRandomLook(pair) {
    randomBlock.replaceChildren();
    const header = node("div", [
      "d-flex",
      "flex-wrap",
      "align-items-center",
      "justify-content-between",
      "gap-2",
      "mb-3",
    ]);
    const title = node("h3", ["fs-4", "mb-0"], "Your random look");
    title.id = "random-look-title";
    title.tabIndex = -1;
    const actions = node("div", [
      "d-flex",
      "gap-2",
      "align-items-center",
    ]);
    const again = randomButton("Generate again", [
      "btn",
      "btn-outline-dark",
      "btn-sm",
    ]);
    const close = randomButton("\u00d7", [
      "btn",
      "btn-outline-dark",
      "fs-4",
      "lh-1",
    ]);
    close.setAttribute("aria-label", "Close random look");
    close.title = "Close random look (Escape)";
    again.addEventListener("click", generateRandomLook);
    close.addEventListener("click", closeRandomLook);
    actions.append(again, close);
    header.append(title, actions);
    randomBlock.append(
      header,
      node(
        "p",
        ["small", "text-secondary"],
        "A random combination of a top and a bottom. Styling compatibility is not guaranteed.",
      ),
    );
    if (!pair) {
      const empty = node(
        "p",
        ["mb-0"],
        "No suitable combination is available. The catalog needs a separate top and bottom with available sizes.",
      );
      empty.setAttribute("role", "status");
      randomBlock.append(empty);
    } else {
      const form = node("form");
      const grid = node("div", ["row", "g-3"]);
      const fields = [];
      pair.forEach(function (product, index) {
        const field = createRandomCard(product, index);
        fields.push(field);
        grid.append(field.column);
      });
      const footer = node("div", [
        "d-flex",
        "flex-wrap",
        "align-items-center",
        "justify-content-between",
        "gap-2",
        "mt-3",
        "pt-3",
        "border-top",
      ]);
      const total = node(
        "p",
        ["fw-semibold", "mb-0"],
        "Complete look: " +
          money(calculateLookTotal(pair)),
      );
      const add = node(
        "button",
        ["btn", "btn-dark"],
        "Add complete look",
      );
      add.type = "submit";
      const feedback = node("p", ["small", "mt-2", "mb-0"]);
      feedback.setAttribute("role", "status");
      footer.append(total, add);
      form.append(grid, footer, feedback);
      feedback.textContent = "Look generated. Choose a size for each item.";
      // Обработчик на форме работает и для кнопок в новых карточках.
      form.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-replace-index]");
        if (!button) return;
        const index = Number(button.dataset.replaceIndex);
        const current = fields[index];
        const alternatives = availableRandomItems(products).filter(function (item) {
          return item.category === current.product.category && item.id !== current.product.id;
        });
        if (!alternatives.length) {
          feedback.textContent = "No other available item in this category. Your look and sizes are unchanged.";
          return;
        }
        const product = alternatives[Math.floor(Math.random() * alternatives.length)];
        const replacement = createRandomCard(product, index);
        // У новой карточки размер пустой. Вторую карточку и её размер не трогаем.
        current.column.replaceWith(replacement.column);
        fields[index] = replacement;
        pair[index] = product;
        previousRandomPair = pair.map(item => item.id);
        total.textContent = "Complete look: " + money(calculateLookTotal(pair));
        feedback.textContent = product.name + " selected. Choose its size again; the other item is unchanged.";
        replacement.size.focus();
      });
      prepareInlineForm(form);
      form.addEventListener("change", () => {
        feedback.textContent = "Size selection updated. Choose both sizes before adding.";
      });
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        for (const field of fields) {
          // Размер должен быть доступен именно у этого товара.
          let error = "";
          if (!field.product.sizes.includes(field.size.value)) {
            error = "Choose an available size.";
          }
          field.size.setCustomValidity(error);
        }
        if (!validateInlineForm(form)) {
          feedback.textContent = "Choose an available size for both items. Nothing was added.";
          return;
        }
        const selections = [];
        for (const field of fields) {
          selections.push({ productId: field.product.id, size: field.size.value, quantity: 1 });
        }
        const saved = commitLookbookItems(selections);
        feedback.textContent = saved.success
          ? "Complete look added: one of each item in your selected sizes."
          : saved.message;
      });
      randomBlock.append(form);
    }
    randomBlock.hidden = false;
    randomTrigger.setAttribute("aria-expanded", "true");
    title.focus();
  }
  function generateRandomLook() {
    const pair = chooseRandomLook(products, previousRandomPair);
    if (pair) previousRandomPair = pair.map((item) => item.id);
    renderRandomLook(pair);
  }
  randomTrigger.addEventListener("click", generateRandomLook);
  randomBlock.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    closeRandomLook();
  });
  function refreshHearts() {
    const saved = readFavorites();
    favoriteIds = saved.ids;
    document.querySelectorAll(".look-product").forEach((article) => {
      const product = findProductById(products, "lookbook-" + article.querySelector("button[id^=add-]").id.replace("add-", ""));
      const button = article.querySelector('[id^="favorite-"]');
      const active = favoriteIds.includes(product.id);
      button.textContent = active ? "♥" : "♡";
      button.setAttribute("aria-pressed", String(active));
      button.title = active ? "Remove from favorites" : "Save to favorites";
    });
  }
  document.addEventListener("favoriteschange", () => {
    refreshHearts();
    announce(favoritesMessage);
  });
  window.addEventListener("pageshow", refreshHearts);
  window.addEventListener("storage", (event) => {
    if (event.key === FAVORITES_STORAGE_KEY || event.key === null)
      refreshHearts();
  });
  const helper = document.createElement("form");
  helper.classList.add("border", "p-3", "my-3");
  const helperLabel = node(
    "label",
    ["form-label"],
    "Desired garment chest (cm)",
  );
  const helperInput = node("input", ["form-control"]);
  helperInput.id = "size-helper-chest";
  helperInput.type = "number";
  helperInput.min = "1";
  helperInput.max = "300";
  helperInput.step = "0.1";
  helperInput.required = true;
  helperLabel.htmlFor = helperInput.id;
  helperLabel.append(helperInput);
  const helperSubmit = node(
    "button",
    ["btn", "btn-outline-dark", "ms-2"],
    "Find size",
  );
  helperSubmit.type = "submit";
  const helperResult = node("p", ["mt-2", "mb-0"]);
  helperResult.setAttribute("role", "status");
  helper.append(
    node("h4", [], "Size helper"),
    node(
      "p",
      ["small"],
      "A guide only for this t-shirt table. Compare garment measurements, not body measurements; this does not predict the fit of other Lookbook items.",
    ),
    helperLabel,
    helperSubmit,
    helperResult,
  );
  document.querySelector(".size-chart").append(helper);
  prepareInlineForm(helper);
  helper.addEventListener("input", () => { helperResult.textContent = ""; });
  helper.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateInlineForm(helper)) return;
    const chest = Number(helper.querySelector("input").value);
    const rows = [...document.querySelectorAll(".size-chart tbody tr")];
    const row = rows.find((row) => Number(row.cells[1].textContent) >= chest);
    helper.querySelector('[role="status"]').textContent = row
      ? "Table guide: " +
        row.cells[0].textContent +
        " — chest " +
        row.cells[1].textContent +
        " cm, length " +
        row.cells[2].textContent +
        " cm. Confirm fit with the store."
      : "Outside this table. Ask the store for measurements.";
  });
});
