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

## Lookbook and Reviews JavaScript compliance review (2026-10-22)

Baseline: tag `midterm` (`9c4d016`). The integrated team baseline is `origin/main` at `6a202a3`.
Only the Lookbook/Reviews feature changes are proposed for this series;
Catalog, Contacts and Login changes are separate team work.

- Removed this feature's appended rules from `css/alina.css`. The team's
  committed stylesheet is preserved exactly; it is not reset to midterm.
- Size panels now use Bootstrap 5 utilities already available through the
  midterm CDN: absolute positioning, constrained height, scrolling and a white
  background with opacity. Custom blur and animation are intentionally removed.
  Close controls and form buttons remain opaque. No inline styles, CSS generation
  or `element.style` are used.
- Long review text uses Bootstrap `text-break` / `text-wrap`, without new CSS.
- Lookbook and Reviews retain the team's layout, with the essential source HTML
  corrections documented below. Enabling the Cozy ADD button and updating
  explanatory text still happen through DOM operations at startup.
- Random Look renders through one reusable DOM function. It chooses a separate
  top and bottom, excludes sets, avoids the previous pair when alternatives
  exist, validates both sizes inline, and persists both products atomically via
  `instyle-cart-v1`. Favorites use the existing `instyle-favorites-v1` functions.
- Reviews and drafts are local to the browser and are not posted to 2GIS.
  User text is assigned through `textContent`. Availability checks are validation
  demos only and do not send messages to the shop.

### Existing team differences from midterm (not reverted)

The team's HEAD already changes `css/alina.css`, Lookbook and Reviews layout,
Catalog markup and Order markup compared with midterm. These historical changes
are outside this feature cleanup. In particular the committed alina.css rewrite
and non-script HTML differences remain baseline compliance issues. The review
also found pre-existing duplicate review forms/IDs and an unmatched Lookbook
closing form tag; these are now corrected in source as documented below.
Historical assignment restrictions are documented separately from the runtime
feature behavior.

### Essential midterm corrections

These are corrections to pre-existing midterm HTML errors, not assessed assignment
features:

- `reviews.html` contained three identical review forms with duplicate IDs.
  Kept the first original `review-form` and its heading, removed the two repeated
  forms and their headings, and retained the deferred `js/reviews.js` include.
  The script now selects the single `#review-form` directly; only its obsolete
  duplicate-form/heading removal logic was deleted.
- `lookbook.html` contained an unmatched `</form>` after the availability section.
  Removed that extra closing tag. The `availability-form` still closes directly
  after its result messages, inside its own section; forms are not nested.

Removing duplicates through JavaScript only changes the live DOM after parsing;
validation of the original HTML still sees repeated IDs. Browsers discard an
unmatched closing form tag during error recovery, so it never becomes a DOM node
that JavaScript could remove. Valid source requires editing the HTML itself.

New browser reviews display the saved ISO creation timestamp as local date and
time. Creation time is assigned only on submission and reused after reload.
Legacy date-only records retain date-only output, without an invented time.

### Manual verification

Serve the project over HTTP and use a single browser origin. In Lookbook choose
sizes for individual items or an entire look; inspect the cart in Catalog and
then Order, and reload. Check favorites in Catalog. Generate Random Look twice,
validate missing sizes, add both items and close with the cross or Escape.
In Reviews submit invalid and valid values, restore a draft after reload, toggle
Helpful and delete your own review. Confirm a single live review form and no
uncaught console errors. Storage failure must not report a successful cart save.

### Verification results for this cleanup

Chrome headless completed 26 interaction assertions: Cozy enabled at runtime,
size validation and persistence, picker close/Escape and keyboard focus return,
favorites persistence, both Random Look size errors, complete-look cart save,
regeneration and Escape, availability field errors, Catalog and Order restore,
reload counter, runtime duplicate form removal (before the source corrections),
draft restore, review validation,
literal user markup, review restore, Helpful and deletion.
The extended run used same-origin iframe documents with external CDN assets and
initial images omitted to avoid network waits. It validates JavaScript behavior,
not responsive appearance or full visual equivalence. A normal-page headless run
also completed the core cart/reviews flow. Syntax and static compliance checks
passed; at the time of that run, CSS matched team HEAD exactly and feature HTML
changes were script tags only. The subsequent essential source corrections are
documented above.

### Essential corrections verification (2026-10-23)

Source checks passed for both pages: all IDs are unique, each page has one form,
and there are no nested forms or unmatched form tags. `node --check js/reviews.js`
passed. Chrome headless passed 14 assertions, including real form submission,
stored creation time, date/time display, an actual page reload after a delay,
legacy date-only records, unchanged original dates, Helpful rerender, runtime
IDs and availability form ownership. No uncaught JavaScript errors were reported.
The browser run used a separate test profile and local HTTP server; external CDN
assets and images were omitted to avoid network waits. This checks behavior and
form structure, not visual appearance.

### Feature commit boundaries

1. Shared feature hunks only: five Lookbook products in `main.js`, plus reusable
   inline validation. Preserve the team's shared navigation/cart prerequisite
   separately; do not stage all of `main.js` indiscriminately.
2. `lookbook.js` and the Lookbook script includes: size selection, complete looks,
   shared favorites/cart, Random Look, size helper and availability validation.
3. `reviews.js`, Reviews script includes and this documentation: essential source corrections,
   local review/draft storage, preview, validation, Helpful and deletion.

The shared favorites and cart navigation prerequisites are already available
in origin/main (`6a202a3`). This series is based on that version and does not
repeat team Catalog, Contacts, Login or Order changes. No CSS file belongs in
this series.
