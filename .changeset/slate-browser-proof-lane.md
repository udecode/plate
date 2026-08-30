---
'@platejs/test': patch
---

Add the `@platejs/test` distribution with a Node-safe fixture root and explicit React, DOM, Playwright, and proof entrypoints. The proof surfaces include typed editor harnesses, replay and reduction helpers, DOM and selection assertions, native traces, screenshots, and raw-mobile receipt validation.

**Migration:** Replace `@platejs/test-utils` with `@platejs/test`. Replace `@platejs/playwright` with `@platejs/test/playwright`; React test helpers use `@platejs/test/react`.
