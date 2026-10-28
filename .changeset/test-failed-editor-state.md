---
'@platejs/test': patch
---

Add `test` and `expect` to `@platejs/test/playwright`. When a test that uses this `test` fails or times out, it saves `editor-state.json` in the test's results folder with each editor's value, selections, focus and input state.
