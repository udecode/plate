---
'plitejs': patch
---

Keep direct text edits independent of pending suggestions, and amend an author's own insertion only in Suggesting mode. Preserve proposal originals through decisions, saving, and reload; expose them through `details(id).original` and list proposals with `changes({ proposals: true })`.
