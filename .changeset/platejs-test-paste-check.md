---
'@platejs/test': patch
---

- Fix `clipboard.pasteText` and `clipboard.pasteHtml` in `@platejs/test/playwright` to pass a paste that a later commit follows, such as a follow-up paste rule's, and to fail a paste that reached another editor root. Pair `@platejs/test` with the `platejs` release of its own version.
