"use strict";
$(function () {
  $("#add-set").prop("disabled", false);
  // Сохранение общее, а сообщение здесь выводим через jQuery.
  function commit(selections) {
    const result = commitLookbookItems(selections);
    $("#cart-message").removeClass("hidden").text(result.message);
    return result.success;
  }
  $(".look-product").each(function () {
    const article = $(this);
    const add = article.find("button[id^=add-]").first();
    const product = findProductById(
      products,
      "lookbook-" + add.attr("id").replace("add-", ""),
    );

    const panel = $("<form>")
      .attr({ id: "picker-" + product.id, novalidate: true })
      .addClass(
        "position-absolute top-0 start-0 w-100 mh-100 overflow-auto bg-white bg-opacity-75 border rounded p-2 m-0 z-3",
      );

    const title = $("<span>")
      .attr("id", panel.attr("id") + "-title")
      .addClass("fw-semibold")
      .text("Select size");

    const close = $("<button>")
      .attr({ type: "button", "aria-label": "Close size selection" })
      .addClass(
        "btn btn-light btn-sm position-static border border-dark fs-5 lh-1",
      )
      .text("×");
    panel.attr("aria-labelledby", title.attr("id"));
    panel.append(
      $("<div>")
        .addClass(
          "d-flex align-items-center justify-content-between gap-2 small mb-2",
        )
        .append(title, close),
    );
    const size = $("<select>")
      .attr({
        id: "lookbook-size-" + product.id,
        required: true,
        "aria-label": "Size for " + product.name,
      })
      .addClass("form-select form-select-sm")
      .append($("<option>").val("").text("Choose size"));
    for (const value of product.sizes)
      size.append($("<option>").val(value).text(value));
    panel.append(
      $("<label>")
        .attr("for", size.attr("id"))
        .addClass("form-label d-block small mb-1")
        .text("Size"),
      size,
      $("<button>")
        .attr("type", "submit")
        .addClass("btn btn-dark btn-sm position-static w-100 h-auto mt-2")
        .text("Add to cart"),
    );

    // find ищет контейнер фото, append вставляет панель, end возвращает article.

    article
      .find(".look-product-image")
      .append(panel)
      .end()
      .addClass("position-relative");
    panel.hide();
    add.attr({ "aria-controls": panel.attr("id"), "aria-expanded": "false" });
    function validSize() {
      const valid = product.sizes.includes(size.val());
      showJqueryError(size, valid ? "" : "Choose a size.");
      return valid;
    }
    function open(focus) {
      add.attr("aria-expanded", "true");
      panel.stop(true, true).fadeIn(200, function () {
        if (focus !== false) size.trigger("focus");
      });
    }
    function closePanel() {
      add.attr("aria-expanded", "false");
      panel.stop(true, true).fadeOut(200, function () {
        add.trigger("focus");
      });
    }
    add.on("click", function () {
      if ($(this).attr("aria-expanded") === "true") closePanel();
      else open();
    });
    close.on("click", closePanel);
    size.on("change", validSize);

    panel.on("submit", function (event) {
      // preventDefault отменяет переход/отправку формы: корзина хранится в браузере.
      event.preventDefault();
      if (validSize())
        commit([{ productId: product.id, size: size.val(), quantity: 1 }]);
      else size.trigger("focus");
    });
    article.data("picker", {
      product: product,
      open: open,
      close: closePanel,
      size: size,
      valid: validSize,
    });
  });

  $(document).on("keydown", function (event) {
    if (!$(event.target).closest(".look-product").length) return;
    if (event.key !== "Escape") return;
    const opened = $('.look-product button[aria-expanded="true"]');
    if (!opened.length) return;
    event.preventDefault();
    // Сначала закрываем остальные панели, последней — панель с текущим фокусом.
    let active = opened.first().closest(".look-product");
    $(".look-product").each(function () {
      if ($(this).find(":focus").length) active = $(this);
    });
    opened.each(function () {
      const article = $(this).closest(".look-product");
      if (!article.is(active)) article.data("picker").close();
    });
    active.data("picker").close();
  });
  $(".look-section").each(function () {
    const section = $(this);
    $("<button>")
      .attr("type", "button")
      .addClass("btn btn-outline-dark mt-3")
      .text("Add entire look")
      .appendTo(section.find(".look-products"))
      .on("click", function () {
        const selections = [];
        let firstInvalid = null;
        section.find(".look-product").each(function () {
          const picker = $(this).data("picker");
          const valid = picker.valid();
          // open ставит фокус после fadeIn: отдельный таймер не нужен.
          if (!valid && !firstInvalid) {
            firstInvalid = picker.size;
            picker.open(true);
          } else {
            picker.open(false);
          }
          selections.push({
            productId: picker.product.id,
            size: picker.size.val(),
            quantity: 1,
          });
        });
        if (!firstInvalid) commit(selections);
      });
  });
});
