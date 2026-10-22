# Assignments 4 and 5 checklist

Checked on 22 October 2026 against local files and the site served on `127.0.0.1:8002`. This is a record of observed behavior, not a claim that the whole team submission is complete.

| Requirement | Implementation / evidence | Status |
|---|---|---|
| Shared product data, lookup and totals | `js/main.js:3`, `js/main.js:145`, `js/main.js:166`, `js/main.js:290` | Done |
| Add, update, remove and clear cart | `js/main.js:185`, `js/main.js:231`, `js/main.js:255`, `js/main.js:274`; controls in `js/catalog.js:209–421` | Done |
| Shared cart badge | `js/main.js:414–512`; observed count `1` on Home, About and Order | Done |
| Order item name, size, quantity, unit price, subtotal, total and count | `js/order.js:146–188`; observed one item, size M, unit price 12,000 KZT, quantity 1 and total 12,000 KZT | Done |
| Empty cart and disabled submission | `js/order.js:133–138`, `js/order.js:191–219`; observed `0` items and disabled Submit | Done |
| Six field checks, including trim, email, phone, related fields, date and agreement | `js/order.js:13–58`, `js/order.js:216–228`; empty form showed field errors | Done |
| Field errors, first invalid focus and stale error removal | `js/order.js:237–280`, `js/order.js:313–336`; mismatch focused Confirm email; past date showed a specific error | Done |
| Demo result and no-server notice | `js/order.js:338–383`; observed a `DEMO-` number, item summary and explicit no-order/no-payment notice | Done |
| Reset and repeat | `js/order.js:385–406`; observed cleared fields/result and enabled Submit with the cart intact | Done |
| Re-read cart after changes | `js/order.js:191–219`, `js/order.js:413–420`; a second tab increased quantity to 2 and Order updated to 24,000 KZT; clearing the cart disabled Submit | Done |
| About links | 28 static links checked; no missing local file or fragment target | Local links done; Instagram destination not live-tested |
| About information and search | `js/about.js:3–144`; observed `delivery` returning one answer, no-match link to Contacts and reset restoring five answers | Done |
| Home featured product | `js/main.js:327–335`, `js/home.js:3–100`; observed size M add to cart, named feedback and badge update | Done |
| Phone, tablet and desktop | Home, About and Order at 375, 768 and 1366 px; document width matched viewport in all nine cases | Done for overflow; further visual review recommended |
| HTML/CSS freeze from `midterm` | `git diff midterm -- '*.html' 'css/*.css'` lists many already changed files | **Not satisfied by current branch** |
| Four substantive commits over three days per student | Git log includes multiple authors and dates, but each student's submission period and commit quality need team verification | Pending |
| Alina's two substantial JavaScript functions | Ownership and evidence need confirmation | Pending |
| Assignment tags | `assignment-4` labels the preceding logic snapshot (`498db5b`); `assignment-5` labels the commit containing this checked version | Tagged snapshots, not proof of full project compliance |
| Screenshots or recording for submission | Browser scenarios were observed, but no new screenshot files were saved | Pending |
| AI-generated code prohibition | `ai-log.md` records AI assistance in these implementations | Students must resolve course authorship compliance |

## Freeze audit

The `midterm` tag points to `9c4d016`. Before this pass, the branch already differed from that tag in `about.html`, `catalog.html`, `contacts.html`, `index.html`, `login.html`, `lookbook.html`, `order.html`, `reviews.html` and several CSS files. This pass repaired six locally broken About lines back to their committed form, added only `js/about.js` and `js/home.js` script references to HTML, and left CSS untouched. The pre-existing difference prevents a truthful claim that the whole project follows the stated freeze rule. A team decision is needed on how to reconcile the post-`midterm` markup with the assignment brief without discarding working functionality.

## Manual evidence to capture before tagging

1. Capture the Catalog cart with quantity changes and clear action.
2. Capture Order with an empty cart, then with field errors and first-field focus.
3. Capture a valid demo confirmation and the cleared form ready for another submission.
4. Capture Home featured add-to-cart and About search at phone and desktop widths.
5. Review the freeze audit and each student's authentic commit history before treating the tagged snapshots as final submission versions.
