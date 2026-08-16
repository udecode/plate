---
"@platejs/cursor": major
---

Accept the minimal Plite DOM and read capabilities used by cursor geometry
helpers, including layered Plate editors, instead of requiring or rebuilding a
complete `DOMEditor`. Own generic cursor overlay state, positioning, resize
refresh, and minimum-width normalization in `@platejs/cursor`.

**Migration:** Replace `Editor` annotations used with cursor geometry helpers
with `DOMEditor` from `@platejs/plite-dom`.
