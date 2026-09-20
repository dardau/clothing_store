# Instyle.zh2 — website (Assignments 1 and 2)

A class project for the "Introduction to Web Technologies" course. The site is built
around a real clothing store: Instyle.zh2, Astana, 5/5 Ryskulov Street, Office 3.

## How to open the site

No installation required. Download or clone the repository and open `index.html`
directly in a browser (double-click the file, or `Ctrl+O` in the browser). No domain
was purchased and no hosting was used — this is a set of local files.

## File structure

```
.
├── index.html          — home page (shared)
├── colophon.html        — how the site was built (shared page)
├── catalog.html          — catalog (Zhansaya)
├── contacts.html         — contacts, item reservation form (Zhansaya)
├── lookbook.html         — lookbook (Alina)
├── reviews.html          — customer reviews (Alina)
├── login.html            — account registration page (Zhansaya)
├── order.html            — order form (Dariya)
├── about.html            — about the store (Dariya)
├── css/base.css           — shared palette, typography and page structure
├── css/dariya.css         — About and Order styles
├── css/alina.css          — reserved for Alina's own work
├── images/                — photos taken by the team in person
├── css-checklist.md       — Assignment 2 CSS evidence with line numbers
├── tag-checklist.md      — required tags checklist with line numbers
├── ai-log.md             — log of AI usage 
└── report.pdf            — Task A and Task B report with screenshots
```

## Team

| Student | Pages |
|---|---|
| Zhansaya | catalog.html, contacts.html |
| Alina | lookbook.html, reviews.html |
| Dariya | order.html, about.html |

index.html и colophon.html — were built jointly. `login.html` was retained from
Assignment 1 as the account page; it is not a new theme or replacement page.


## Assignment 2 constraints

The site uses handwritten external CSS only: no frameworks, downloaded stylesheets,
templates, site builders, or JavaScript. `base.css` is always linked first and the
relevant personal stylesheet second. The single internal style block and single
inline declaration are labelled cascade demonstrations required by the brief.
