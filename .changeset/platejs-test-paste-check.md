---
'@platejs/test': patch
---

- Fix `clipboard.pasteText` and `clipboard.pasteHtml` in `@platejs/test/playwright` to pass a paste that a later commit follows, such as a paste rule's, and to fail a paste that landed in another editor root. Use `@platejs/test` with the `platejs` release of the same version.
