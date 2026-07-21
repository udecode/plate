---
"@platejs/plite-dom": patch
---

- Add prioritized schema-bound host codecs that parse and serialize immutable `ContentSlice` values through read-only state
- Isolate codec query, parse, and serialize failures through the lifecycle error sink while preserving fallback order
- Preserve open slice edges in native clipboard payloads
- Add root-scoped coordinate, caret, visual-line, and rectangle geometry APIs
- Schedule focus, selection, scrolling, and standalone host work through cancellable root-addressed DOM phases
- Resolve stale DOM path mappings through lifecycle reads and typed domain errors
