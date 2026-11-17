---
'plitejs': patch
---

Refuse an edit inside a table or row whose deletion is pending, in Suggesting and Editing. Typing there, deleting or typing over a range with an end there or over part of it, a Backspace, Delete or range edit that would join the lines on either side of such a table or row, and a table command aimed at it or at a table, row or cell selected there now save nothing and reach `subscribeRefusals` as `unrepresentable` with `reasons` `['grid']`. Decide that table or row first. A delete across a live table still records and takes any struck row inside it with the table, and collaboration and history replays apply as before.
