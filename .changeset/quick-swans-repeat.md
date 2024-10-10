---
'@udecode/plate-core': patch
---

`PlateContent`:

- When `disabled=true`, `readOnly` should be `true`
- Add prop `aria-disabled=true` and `data-readonly=true` when `readOnly=true`
- Add class `slate-editor`, `ignore-click-outside/toolbar` (used by floating toolbar)
