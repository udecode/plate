---
'platejs': patch
---

Remove `RawHtmlPlugin` from `platejs/markdown`. Unmapped raw HTML stays plain text on import and escapes on export, and HTML comments drop with a lossless `markdown-unsupported-node` warning.

**Migration:**

- Remove `RawHtmlPlugin` from your `platejs/markdown` imports and plugin lists.
- If your app saved beta v54 documents containing `rawHtml: true` on text leaves, strip the `rawHtml` property from text leaves before opening them under the updated schema (or increment your named schema `version` and strip `rawHtml` in a migration step).
- Update saved `{ document, schema }` fingerprints, Yjs rooms, and saved `History` snapshots that included `RawHtmlPlugin` in their schema fingerprint.
