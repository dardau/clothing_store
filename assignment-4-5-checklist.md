# Assignments 4 and 5 checklist

Checked on 22 October 2026 against local files and the site served on `127.0.0.1:8001`. This is a record of observed behavior, not a claim that the whole team submission is complete.

| Requirement | Implementation / evidence | Status |
|---|---|---|
| Shared product data, lookup and totals | `js/main.js:3`, `js/main.js:145`, `js/main.js:166`, `js/main.js:290` | Done |
| Add, update, remove and clear cart | `js/main.js:185`, `js/main.js:231`, `js/main.js:255`, `js/main.js:274`; controls in `js/catalog.js:209–421` | Done |
| Shared cart badge | `js/main.js:414–512`; observed count `1` on Home, About and Order | Done |
| Order item name, size, quantity, subtotal, total and count | `js/order.js:146–182`; observed one item, size M, quantity 1 and 20,500 KZT | Done |
| Empty cart and disabled submission | `js/order.js:134–139`, `js/order.js:185–213`; observed `0` items and disabled Submit | Done |
| Six field checks, including trim, email, phone, related fields, date and agreement | `js/order.js:13–58`, `js/order.js:216–228`; empty form showed field errors | Done |
| Field errors, first invalid focus and stale error removal | `js/order.js:231–274`, `js/order.js:307–330`; blank submit focused Name | Done |
| Demo result and no-server notice | `js/order.js:332–377`; observed a `DEMO-` number, item summary and explicit no-order/no-payment notice | Done |
| Reset and repeat | `js/order.js:379–400`; observed cleared fields/result and enabled Submit with the cart intact | Done |
| Re-read cart after changes | `js/order.js:185–213`, `js/order.js:408–414` | Code reviewed; cross-tab change needs a manual check |
| About links | 28 static links checked; no missing local file or fragment target | Local links done; Instagram destination not live-tested |
| About information and search | `js/about.js:3–130`; observed `delivery` returning one answer | Done |
| Home featured product | `js/main.js:327–335`, `js/home.js:3–92`; observed add to cart and badge update | Done |
| Phone, tablet and desktop | Home, About and Order at 390, 768 and 1366 px; document width matched viewport in all nine cases | Done for overflow; further visual review recommended |
| HTML/CSS freeze from `midterm` | `git diff midterm -- '*.html' 'css/*.css'` lists many already changed files | **Not satisfied by current branch** |
| Four substantive commits over three days per student | Git log includes multiple authors and dates, but each student's submission period and commit quality need team verification | Pending |
| Alina's two substantial JavaScript functions | Ownership and evidence need confirmation | Pending |
| Assignment tags | Only `midterm` currently exists | Pending until project versions pass review |
| Screenshots or recording for submission | Browser scenarios were observed, but no new screenshot files were saved | Pending |

## Freeze audit

The `midterm` tag points to `9c4d016`. Before this pass, the branch already differed from that tag in `about.html`, `catalog.html`, `contacts.html`, `index.html`, `login.html`, `lookbook.html`, `order.html`, `reviews.html` and several CSS files. This pass repaired six locally broken About lines back to their committed form, added only `js/about.js` and `js/home.js` script references to HTML, and left CSS untouched. The pre-existing difference prevents a truthful claim that the whole project follows the stated freeze rule. A team decision is needed on how to reconcile the post-`midterm` markup with the assignment brief without discarding working functionality.

## Manual evidence to capture before tagging

1. Capture the Catalog cart with quantity changes and clear action.
2. Capture Order with an empty cart, then with field errors and first-field focus.
3. Capture a valid demo confirmation and the cleared form ready for another submission.
4. Capture Home featured add-to-cart and About search at phone and desktop widths.
5. Review the freeze audit and each student's authentic commit history, then tag approved whole-project versions as `assignment-4` and `assignment-5`.
