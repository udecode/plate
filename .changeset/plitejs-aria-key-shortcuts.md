---
'plitejs': patch
---

- Add `ariaKeyShortcuts` to `plitejs/dom`. It turns a hotkey into an `aria-keyshortcuts` value for the `'apple'` or `'other'` platform, naming only combos the matcher matches on a US layout, and returns `undefined` when it can name none, such as for a literal digit or punctuation key.
