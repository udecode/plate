---
'plitejs': patch
---

Refuse an edit inside a table or row whose deletion is pending, in Suggesting and Editing. Typing there, deleting or typing over a range with an end there or over part of it, a Backspace, Delete or range edit that would join the lines on either side of such a table or row, and a table command aimed at it or at a table, row or cell selected there now save nothing and reach `subscribeRefusals` as `unrepresentable` with `reasons` `['grid']`. Decide that table or row first. A delete across a live table still records and takes any struck row inside it with the table, and collaboration and history replays apply as before.

A suggestion, or a write under `tx.authored.propose`, also saves nothing and reaches `subscribeRefusals` as `unrepresentable` with `reasons` `['grid']` when review could not show it in the table: one that adds or removes single cells, as a column change does, turns a cell into another element or another element into a cell, changes a cell's span as the schema reads it, splits or joins a table, row or cell, or adds a row to a table that holds a pending column change. A write inside a table, row or cell that the same author's pending suggestion added still records, so a ragged table or a short row records with the cells the table repair adds. This refusal holds with `vetoes: false` too. An Editing write is never refused this way.
