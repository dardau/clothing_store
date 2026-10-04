# Instyle.zh2 — Midterm Project

The same clothing-store website developed since Assignment 1, for Introduction to Web Technologies.
The documented boutique is at 5/5 Ryskulov Street, Office 3, Astana; opening hours are 11:00–21:00 daily.

## Open the website

Open `index.html` in a browser. Bootstrap CSS is loaded from its CDN, so an internet connection is needed.
No JavaScript, server or database is included. At this stage forms and their result states are prepared;
submission buttons do not yet generate results. Later JavaScript will update the existing elements.

## Page list

| Page | Purpose | Original responsibility |
|---|---|---|
| index.html | Home and links to the collection | Shared |
| catalog.html | Product photos, prices, sizes and order links | Zhansaya |
| lookbook.html | Styled outfits, favorites area, size chart and product-request form | Alina |
| order.html | Pickup-order form, summary, total and result areas | Dariya |
| about.html | Store information, photographs and ordering instructions | Dariya |
| reviews.html | Customer reviews and ratings | Alina |
| contacts.html | Address, opening hours, contact links and directions | Zhansaya |
| login.html | Local visitor registration, sign-in and profile states | Zhansaya |

All pages have the same main navigation and footer. Bootstrap provides the grid, responsive columns,
buttons, form controls and alerts. `css/base.css` provides shared design; the personal stylesheets
contain page corrections. `css/readiness.css` prepares shared states and narrow-screen corrections;
`css/information.css` handles About and Contacts details.

## Three visitor journeys

### 1. Find the address and plan a visit

- Start: Home (`index.html`).
- Steps: choose Contacts in the navigation; read Address and opening hours; read Getting here.
- End: the visitor has the full address and daily opening hours. Open in 2GIS is an optional external map.

### 2. Choose a product and prepare a pickup order

- Start: Catalog (`catalog.html`), or Lookbook (`lookbook.html`).
- Steps: compare product photographs and prices; use Order to reach `order.html#order-form`;
  choose the product, size and quantity; enter contact details and an optional pickup date;
  read the local data notice; review the existing summary and total area; use Submit order.
- End: the prepared Order status, success and error containers are the destination for the result.
  The HTML/CSS stage does not react to submission yet, as permitted by the brief.
  Future JavaScript will prepare the result locally; no staff approval, online payment or server is required.
  Pickup instructions are already present on the page.

### 3. Prepare a visitor profile and continue shopping

- Start: About (`about.html`).
- Steps: read about the store; choose Login in the navigation; read the local profile data notice;
  fill the registration form; use Create account; use the existing Sign in section;
  continue from the prepared profile panel to Catalog, or use Sign out.
- End: registration and sign-in status areas, a profile panel and a sign-out button are already built.
  Future JavaScript will update those states on the same visitor's device; no admin or employee flow exists.
  At this stage the profile panel is hidden and submission buttons have no behavior.

## JavaScript preparation

- Every form, input, select, textarea and button has a unique lowercase English id.
- Order: product `data-price` values, summary fields, date/field errors and result containers.
- Lookbook: product ids, favorite buttons with `aria-pressed`, an empty favorites list,
  Order links with `data-product`, request fields, errors and summary/result containers.
- Account: registration/sign-in feedback, field errors, profile fields and sign-out control.
- Shared states: `hidden`, `active`, `selected`, `error`, `success`, and Bootstrap validation/alert classes.
- Hidden and empty dynamic containers are deliberate future result destinations, not empty pages.

## Quality checks and submission

See `quality-pass.md` for actual findings, fixes, completed source checks and outstanding team/browser checks.
See `ai-log.md` for assistance history. Photographs must be confirmed as the team's own work; see `images/README.md`.
Existing screenshots predate these edits. Capture every final page at phone and desktop width (16 images total).

The repository already has a `midterm` tag at `9c4d016`. These local corrections are newer than that snapshot.
The tag has not been rewritten. After the real browser/team quality pass and final review, commit the accepted
version and agree on the correct freeze snapshot before submission. Do not add handwritten HTML/CSS after that freeze.
Every student must retain their own genuine commits across at least four different days and understand all pages.
