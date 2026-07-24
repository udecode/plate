---
"@platejs/plite-react": patch
---

- Preserve focused-root selection across child editors and lifecycle target changes
- Coordinate DOM reads, writes, selection repair, Android input latency, and external mutation recovery through one bounded scheduler per mounted root
- Re-export the model-owned caret after composition repair renders only while the focused snapshot version and selection remain current
- Isolate optional decoration, annotation, and widget provider failures
- Isolate render callbacks behind React component boundaries and preserve inline decorated-range data in projection slices
- Infer React editor values from complete installed schemas and expose typed interactive content-root slots
- Preserve element-owned named roots through projected clipboard serialization and insertion
- Expose transaction announcements through one `aria-live` host per logical editor
