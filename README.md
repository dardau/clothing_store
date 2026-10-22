# Instyle.zh2 — clothing store demo

Open `index.html` through a local web server. The site uses Bootstrap from a CDN and stores the cart in this browser's `localStorage`. It has no backend. Submitting the Order form creates a demonstration summary only; it sends no data and creates no real order or payment.

## Functionality Plan — Assignments 4 and 5

Assignment 4 covers data, calculations and validation. Assignment 5 connects those functions to visible controls and updates the DOM. The `assignment-4` and `assignment-5` Git tags must point to reviewed versions of the entire project, not individual pages.

| Responsibility | Assignment 4: logic | Assignment 5: visible behavior | Owner |
|---|---|---|---|
| Shared cart | Product data, size checks, cart totals, quantity changes, persistence | Cart badge on every page; add, edit, remove and clear in Catalog | Zhansaya (shared function) |
| Catalog | Search, category filter and price sort | Search and filter controls, product cards and cart actions | Zhansaya |
| Account | Registration and sign-in validation | Field feedback and local profile states | Zhansaya |
| Order | Cart summary, empty state, form validation, date comparison and demo number | Item list, errors, focus, totals, reset and demo confirmation | Dariya |
| About | Filter store answers by text | Search field, result count, empty result and links | Dariya |
| Home | Choose a product from the shared array | Product card, size selection and add-to-cart action | Shared page; Dariya implemented this feature |
| Lookbook and Reviews | Team must identify and document two substantial functions | Team must verify their page actions | Alina — evidence still needed |

The featured product is chosen at random from the shared catalog. It does not imply a discount or stock guarantee. If the array is empty, Home shows an explanatory message. About describes three physical store locations, while this website's demo order path shows pickup at **5/5 Ryskulov Street, Office 3, Astana** only; no delivery is arranged by the site.

## Visitor path

1. Choose a product and size on Home or in Catalog.
2. Open the cart badge to review items, quantities, subtotals and total.
3. Continue to Order. Empty carts disable submission.
4. Enter a name, email, matching confirmation email, phone, pickup date, and agreement. The date must be today or later.
5. Correct any highlighted fields. A valid form shows the items, total and a random `DEMO-` reference. Clear form to prepare another demo summary.

## Submission evidence and remaining work

See [Assignment 4/5 checklist](assignment-4-5-checklist.md) for file and line references, observed browser outcomes and unresolved submission gates. See [AI log](ai-log.md) for assistance history. Each student must provide genuine commits across at least three days, with four substantive commits each; Git history must not be fabricated.

The `midterm` tag exists. The current branch already contains substantial HTML/CSS changes after that tag, so the project's freeze rule needs a team review before either assignment completion tag can truthfully mark a ready version. The changes in this pass add only two script references to HTML and no CSS rules.
