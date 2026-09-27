# CSS changes for Assignment 3

- Catalog main width and centering:
  replaced with container; vertical padding with py-4.
  The old main rule temporarily remains for other pages.
- Product grid:
  replaced custom CSS Grid with row and col-12 col-md-6 col-lg-3.
  Replaced gap with g-4.
  Replaced list styling and spacing with list-unstyled, mt-3 and mb-5.
- Category grid:
  replaced custom CSS Grid and column spans with
  row and col-12 col-md-6 col-lg-3.
  Replaced gap and bottom spacing with g-3 and mb-5.
- Price section: replaced custom flex layout with row, g-4,
  col-12 col-md-6 and mb-5.
- Price table: replaced custom table styling with Bootstrap table  classes.
  Legacy base.css table rules now apply only to tables without .table.
- Terms list: added a nested Bootstrap row inside the first price column.
- Ordering tip: replaced .tip-banner rules with Bootstrap spacing,
  background, border, rounding and shadow utilities.
- Product figures: adapted Bootstrap Cards while preserving figure
  and figcaption elements.
- Replaced custom caption and size styling with card-body,
  small, d-block, mt-2 and text-body-secondary.
- Replaced fixed image height with a documented 3:4 portrait ratio.
  Image width and cropping use Bootstrap utilities.
- Removed alternating caption backgrounds.
- Used container-fluid for the full-width hero and an inner container
  for the catalog content.
- Replaced hero positioning, spacing and typography with Bootstrap classes.
- Removed the hero's 100vw width and negative margins.
- Kept only a custom hero image height and brightness correction.
- Replaced catalog back-link flex rules with Bootstrap utilities.
- Added responsive text alignment to the hero and back links.
- Catalog navigation: replaced the checkbox-controlled menu with
  Bootstrap Navbar and Collapse.
- Used navbar-expand-lg to expand navigation from 992px.
- Used the Bootstrap bundle for toggling; no custom JavaScript.
- Removed the catalog's old body top padding with pt-0.
- Legacy navigation CSS remains temporarily for the other pages.
- Replaced the Main Categories custom grid and styling with
  Bootstrap columns, spacing, borders and shadow utilities.
- Replaced custom New badge styling with Bootstrap badge utilities.
- Styled existing navigation actions with Bootstrap button
  variants and sizes.
- Replaced product section margins with my-5.
- Corrected the last product's figcaption markup.
- Consolidated the product image hover effect.

## Dariya — About and Order

- About page wrapper: replaced custom width and page spacing with
  `container-fluid`, a nested `container`, `py-5` and responsive padding utilities.
- Store facts: replaced the custom four-column CSS Grid with
  `row`, `g-3`, `col-12`, `col-sm-6` and `col-lg-3`.
- Store and lookbook galleries: replaced custom gallery grids with responsive
  Bootstrap columns. The lookbook includes a nested `row` inside `col-12`.
- Store facts and information panels: adapted Bootstrap Cards with
  `card`, `card-body`, `h-100`, borders and shadow utilities.
- Store information: replaced custom table layout and striping with
  `table-responsive`, `table`, `table-striped`, `table-hover` and `align-middle`.
- About actions: replaced custom link-button rules with Bootstrap button variants
  and a large button size.
- Order introduction, testimonial and photo: replaced custom widths, alignment,
  margins and padding with the Bootstrap grid and utility classes.
- Order form: replaced the custom form grid with `row`, `g-3`, `col-12` and
  `col-md-6`; controls now use `form-control`, `form-select` and `form-check`.
- Form buttons: replaced custom button rules with `btn-dark`,
  `btn-outline-secondary`, size variants and a genuine disabled control.
- Removed the Order form inline style and replaced it with Bootstrap border,
  spacing and shadow utilities.
- Reduced `css/dariya.css` from 402 lines to a 60-line correction layer containing
  only imagery, brand background and focus/decorative details.
