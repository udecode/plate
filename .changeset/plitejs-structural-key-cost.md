---
'plitejs': patch
---

Make Enter, word deletion and a Backspace that joins two lines cost the same however long the document is. In a 20,000-block document, Enter and word deletion each took tens of milliseconds and joining two lines took over a second.
