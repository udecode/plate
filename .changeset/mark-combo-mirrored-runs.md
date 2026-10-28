---
'platejs': patch
---

Fix `MarkComboRules.markdown` so typing `***text***`, `__**text**__`, `__*text*__` or `___***text***___` applies its combined marks instead of staying literal, applying bold alone or leaving stray delimiters.
