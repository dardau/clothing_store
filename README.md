# Instyle.zh2 — clothing store demo

Open `index.html` through a local web server. The site uses Bootstrap from a CDN and stores the cart in this browser's `localStorage`. It has no backend. Submitting the Order form creates a demonstration summary only; it sends no data and creates no real order or payment.

## Functionality Plan — Assignments 4 and 5

Assignment 4 covers data, calculations and validation. Assignment 5 connects those functions to visible controls and updates the DOM. The `assignment-4` and `assignment-5` Git tags must point to reviewed versions of the entire project, not individual pages.

| Page / scope | Visitor goal | Assignment 4 logic and Assignment 5 action | Expected result | Responsible student |
|---|---|---|---|---|
| Site-wide cart | Keep chosen products while navigating | Validate sizes, calculate and persist cart; show shared badge | Accurate item count on every page | Zhansaya |
| Catalog | Find, choose and edit products | Search, category filter, price sort; add, update, remove and clear | Matching count, empty state, accurate totals and checkout path | Zhansaya |
| Login | Check details before a demo profile | Validate registration and sign-in fields; show password checklist | Specific feedback without claiming real authentication | Zhansaya |
| Order | Prepare a demo pickup summary | Calculate cart totals, validate six fields and create a random reference; render errors and confirmation | Clear invalid states or itemized demo summary with no-server notice | Dariya |
| About | Find store and pickup information | Filter answer data; render results, count, reset and links | Relevant answer or useful no-results path | Dariya |
| Home | Start shopping from a featured item | Choose an item from the common array; select size and add it | Updated cart and direct route to review it | Shared page; Dariya's area |
| Lookbook and Reviews | Explore looks and submit feedback | Planned feature ownership and implementation need team confirmation | Complete actions on both pages | Alina — pending |

The featured product is chosen at random from the shared catalog. It does not imply a discount or stock guarantee. If the array is empty, Home shows an explanatory message. About describes three physical store locations, while this website's demo order path shows pickup at **5/5 Ryskulov Street, Office 3, Astana** only; no delivery is arranged by the site.

## Visitor path

1. Choose a product and size on Home or in Catalog.
2. Open the cart badge to review items, quantities, subtotals and total.
3. Continue to Order. Empty carts disable submission.
4. Enter a name, email, matching confirmation email, phone, pickup date, and agreement. The date must be today or later.
5. Correct any highlighted fields. A valid form shows the items, total and a random `DEMO-` reference. Clear form to prepare another demo summary.

## Submission evidence and remaining work

See [Assignment 4/5 checklist](assignment-4-5-checklist.md) for file and line references, observed browser outcomes and unresolved submission gates. See [AI log](ai-log.md) for assistance history. Each student must provide genuine commits across at least three days, with four substantive commits each; Git history must not be fabricated.

The `midterm` tag exists. The current branch already contains substantial HTML/CSS changes after that tag. The correction of six locally broken About tags was essential to restore valid page structure and receives no assignment credit. The Order, About and Home changes in this work add only two script references to HTML and no CSS rules. The `assignment-4` and `assignment-5` tags label project snapshots; they do not certify that the remaining pages, freeze history or individual contribution rules are satisfied.

The assignment text forbids AI-generated code. The AI log records assistance in the Order, About and Home implementation; students must review the work and follow the course's authorship rule before using it for submission.
