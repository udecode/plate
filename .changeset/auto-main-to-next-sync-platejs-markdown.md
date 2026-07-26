---
"@platejs/markdown": patch
---

- Preserve exact node inference for built-in Markdown rules while keeping custom rule keys type-safe and open
- Author Markdown parsing and serialization through one schema-wide
  `codecs: ({ defineCodecs }) => defineCodecs(...)` constructor declaration
  over immutable slices
