---
'platejs': patch
---

While a typed trigger's query is open, the editor root reports itself as a combobox. It takes `role="combobox"`, `aria-haspopup="listbox"`, `aria-autocomplete="list"` and `aria-expanded`, and drops `aria-multiline`. It gets its own attributes back when the query closes.

- `complete` refuses a match offered by an earlier query, even when a newer query has the same text
- Trigger and query reads stay bounded in characters inside long text leaves
