# Dariya endterm checks — 2026-11-08

## Tested in Chromium on a local HTTP server

- Home: select tops, add product, follow Order; select bottoms, Next product changes the displayed item, choose M, add and receive View cart link.
- Order: increase a 12,000 KZT item from one to two; total becomes 24,000. Empty submission produces six required-field errors. Wrong confirmation email, alphabetic phone and a past date produce three separate errors. Correcting these clears errors. A 1,001-character comment is rejected; a short comment is accepted. Valid submission shows the correct total and downloads a DEMO text file. Reset clears errors; removing the last item disables submission.
- About: search hours; expand and collapse the answer; unmatched query shows a Contacts path; reset restores all five questions. jQuery loaded successfully from its CDN.
- All three pages: no uncaught JavaScript page errors; no horizontal overflow at 375, 768 and 1366 CSS pixels.
- W3C Nu HTML validator: all three source pages returned an empty messages array (zero errors/warnings).
- JS syntax and git whitespace checks passed.

## Limits / existing issues

- Fixed the initial missing `/favicon.ico` request by adding a small black/white I monogram asset. No page markup or CSS is needed for this browser icon.
- Existing HTML/CSS differences from `midterm` predate this extension. No CSS is changed here. Adding script references is necessary for the jQuery feature; no new static UI markup is introduced.
- Tests are agent checks, not a teammate review or another physical-device check. External shop contact data, photo ownership and all other team pages were not reverified.
- No claim is made that four personal commits over three actual days, the two-days-before-deadline peer review or whole-site final acceptance are complete.

## Follow-up review — 2026-11-08

Found a checkout integration bug: Catalog discounted 60,000 KZT to 57,000 KZT, but Order and its receipt still showed 60,000 KZT. Moved the existing pure discount calculation from Catalog into shared main.js; both page renderers now use that same function. The discount policy itself was not changed.

Verified in Chromium with fresh script loading:
- Below threshold: 48,000 KZT remains 48,000 on both pages.
- At threshold: 50,000 becomes 47,500 on both pages.
- Above threshold: 60,000 becomes 57,000 on both pages, the success message and the actual downloaded file.
- Decreasing quantity removes the discount below threshold and invalidates the old receipt.
- Changing the cart from another browser tab updates Order; malformed saved JSON displays an error and disables submission.
- Repeated all required-field, correction, comment-length, reset and empty-cart tests successfully.
- About: whitespace/case-insensitive search, rapid open/close/open clicks, no-results state and reset passed.
- Local source links and anchors on the three pages resolve; no duplicate source IDs.
- Home, About and Order: mobile menu opens/closes at 375 px; no horizontal overflow at 320/375/768/1366 px.
- Smoke-loaded all eight HTML pages after moving the shared helper: no console errors or uncaught JavaScript errors during these loads. This is not a full functional review of the other teammates' pages.
