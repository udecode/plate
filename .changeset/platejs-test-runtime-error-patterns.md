---
'@platejs/test': patch
---

Export `DEFAULT_RUNTIME_ERROR_PATTERNS` from `@platejs/test/playwright`, so a spec can extend the runtime errors `recordBrowserRuntimeErrors` fails on instead of replacing them.
