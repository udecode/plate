---
"@platejs/plite-react": patch
---

- Preserve focused-root selection across child editors and lifecycle target changes
- Coordinate DOM reads, writes, selection repair, Android input latency, and external mutation recovery through one bounded scheduler per mounted root
- Isolate optional decoration, annotation, and widget provider failures
- Isolate render callbacks behind React component boundaries and preserve inline decorated-range data in projection slices
- Expose transaction announcements through one `aria-live` host per logical editor
