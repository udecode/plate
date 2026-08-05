---
"www": patch
---

Fix homepage playground typing latency by memoizing the `plugins` array and `overrideEnabled` configuration outside `usePlateEditor` in `playground-demo.tsx`. Prevents `usePlateEditor` from re-initializing the plugin array on every keystroke render.
