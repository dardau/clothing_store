
| Date | Student | Question to AI | What AI provided / explained |
|---|---|---|---|
| 12.09.2026 | Zhansaya | Explain the difference between semantic tags (header, nav, section, article, aside, footer) and div — when to use which | Explanation that semantic tags convey meaning to browsers/screen readers, while div is a neutral container with no meaning; examples of when each tag is appropriate |
| 13.09.2026 | Zhansaya | What are HTML entities (&mdash;, &copy;, &nbsp;, etc.) and what are they used for | Explanation of the purpose of HTML entities and which characters they represent |
| 12.09.2026 | Zhansaya | How to analyze the source code of a real website for Task A (what to look for: doctype, meta, semantics, forms) | General guidance on the method for analyzing someone else's HTML code, without analyzing the assignment content itself |
| 13.09.2026 | Dariya | What is the DOM and how is it different from the HTML file itself; why does the browser show `<h1>` large and bold with no CSS at all; in what order does the browser build and render the element tree | Explanation that the DOM is the tree of elements the browser builds by parsing the HTML file, that default bold/large `<h1>` styling comes from the browser's built-in default stylesheet (not CSS I wrote), and that rendering follows the order elements appear in the code, top to bottom |
| 13.09.2026 | Dariya | How is `<section>` different from `<div>` for the browser and screen readers; when is `<div>` actually appropriate if semantic tags exist; why is `<table>` specifically about a header-value relationship rather than just a way to make a grid | Explanation that semantic tags carry meaning (browser/search engine/screen reader understand the role of the content) while `<div>` is a meaningless generic container, appropriate only when no semantic tag fits; explanation of why `<table>` + `th scope` communicates which value belongs to which parameter |
| 13.09.2026 | Dariya | What is the difference between `<blockquote>` and inline `<q>`; what is `<cite>` inside a `<blockquote>` supposed to indicate | Explanation that `<blockquote>` marks a longer quoted passage as someone else's words while `<q>` is for a short inline quote, and that `<cite>` names the source/title being quoted from |
| 13.09.2026 | Dariya | What actually happens when a form is submitted with `action="#"` and no server behind it | Explanation that `action="#"` just points back to the current page, so the browser tries to send the data but there is no real recipient — the page just reloads itself and nothing is actually saved or sent anywhere |




