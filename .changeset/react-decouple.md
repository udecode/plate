---
'@platejs/core': patch
---

Decouple `createSlateEditor` from React:

- `createZustandStore` from `@platejs/core` (or `platejs`) is now a vanilla store without React-specific functionality (hooks).
- The previous behavior of `createZustandStore` is now available in `@platejs/core/react` (or `platejs/react`). This is not part of our public API so it won't be a breaking change, but if you're using it, you'll need to import it from `@platejs/core/react` (or `platejs/react`) instead.
