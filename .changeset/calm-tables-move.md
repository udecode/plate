---
'platejs': patch
---

Fix plain vertical arrow navigation to move directly between table cells without painting an intermediate caret.

Avoid recalculating table cell coordinates for text-only editor updates.

Define table Markdown conversion on the table plugins.

Write line breaks inside Markdown table cells as `<br/>`, so each row stays on one line and the breaks read back.

Write list paragraphs in Markdown table cells as inline `<ul>`, `<ol start>`, and `<li>` HTML, and read that HTML back as list paragraphs when the List plugin is installed.

Write a merged table cell to Markdown in its first slot, with empty cells in the slots it covers, instead of refusing the table. Write a heading, quote, code, or math block in a cell inline with a warning, and drop and report any other cell block.

Add `encodeLine` and `decodeLine` to Markdown mapping contexts for containers Markdown writes on one line.

Keep a trailing line break after bold or link text, and a trailing `<br/>` in a list item, when parsing Markdown.

Keep a bare URL inside a Markdown list item, and write `|` in Markdown tag attribute values as `&#124;`.

Rewrite a `|` or line ending in inline math, inline code, an autolink, or raw HTML so it cannot split a Markdown table row, and report the rewrite as a warning.
