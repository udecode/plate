---
'platejs': patch
---

Fix plain vertical arrow navigation to move directly between table cells without painting an intermediate caret.

Avoid recalculating table cell coordinates for text-only editor updates.

Define table Markdown conversion on the table plugins.

Write line breaks inside Markdown table cells as `<br/>`, so each row stays on one line and the breaks read back.
