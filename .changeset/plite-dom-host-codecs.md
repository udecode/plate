---
"@platejs/plite-dom": patch
---

- Add prioritized schema-bound host codecs that claim exact schema declarations through `owns` and parse or serialize immutable `ContentSlice` values through read-only state
- Isolate codec query, parse, and serialize failures through the lifecycle error sink while preserving fallback order
- Preserve open slice edges and element-owned named roots in native clipboard payloads
- Own every public `DataTransfer` contract outside headless Plite, including
  typed `clipboardHandler(...)` extension contributions and exact `readSlice` /
  `writeSlice` transport
- Select default editing-action event phases through one host-facts policy,
  retaining only the proven Korean iOS Backspace exception
- Add root-scoped coordinate, caret, visual-line, and rectangle geometry APIs
- Schedule focus, selection, scrolling, and standalone host work through cancellable root-addressed DOM phases
- Cancel stale focus retries when another editor in the same document or shadow
  root takes focus ownership
- Resolve stale DOM path mappings through lifecycle reads and typed domain errors
- Serialize node selections as closed exact-owner slices, including reachable secondary roots
- Resolve iframe and shadow-root input, selection, and shortcut behavior from
  each browser realm
