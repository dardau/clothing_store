# Midterm quality pass — source checks, 2026-10-05

## Found and fixed

- Lookbook: an unclosed layout div; Reviews: a stray closing div.
- Different mobile navigation contents and footer contact details: unified across all eight pages.
- Mixed-case and transliterated ids: normalized to lowercase English names, with references updated.
- Lookbook Order buttons had no next destination; linked to the order form and added the five existing products/prices to its select.
- Favorite controls lacked ids and result destinations: added hooks, pressed-state CSS, an empty list and feedback.
- Lookbook request form lacked a result area: rebuilt as a local product-preference request with errors, status and summary.
- Order instructions required a consultant to approve the path: replaced with a visitor-only local pickup summary.
- Order date had no prepared validation message: added a date error area.
- Order and account consent referred to absent terms: linked to the actual local data notices.
- About's estimated average check and unfinished editorial note: removed; added opening hours and image captions.
- About/Contacts paths lacked direct catalog/order links: connected them.
- Home's handwritten navigation grid: replaced with Bootstrap columns.
- Very narrow layouts: wrap long text, reduce nested spacing, stack the About table and fit tips, and put the back-to-top link in normal flow.
- README still described Assignment 2 and a deleted page: replaced with current page list and three journeys.
- Shared hidden/active/selected/error/success styles: prepared in advance.

## Completed checks

- W3C Nu validation of all eight final HTML files: zero errors and warnings.
- Local page/image/stylesheet paths, anchor targets, unique ids and ARIA references.
- Every form control has an id; no scripts or empty href links.
- Common main navigation and footer content.
- Git whitespace checks.

## Team/browser checks still outstanding

These are not marked completed because this session could not access local pages through the browser tool.

- A teammate reviews pages written by someone else at least two days before the deadline and records actual findings/fixes here.
- Click all three journeys, fill/reset every form and check keyboard navigation.
- Inspect every page at 240, 280, 320, 375 and 1440 px; open/close mobile navigation; check text zoom and horizontal overflow.
- Check browser console and external links.
- Confirm real prices, hours, address, phone, photo ownership and quoted reviews against the team's store evidence.
- Capture final phone and desktop screenshots for all eight pages.
- Commit the reviewed version and settle the freeze tag. The existing published midterm tag was not moved.

This file records a source correction pass, not a fabricated peer or device review.
