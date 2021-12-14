---
'@udecode/plate-core': patch
---

- fix performance issue with hundreds of Plate editors
- fix a bug where `editor.plugins` was reversed
- `Plate`
  - `editor.plugins` were missing plugins on `plugins` prop change
- `withInlineVoid`:
  - use `plugin.type` instead of `plugin.key`