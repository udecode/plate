---
'platejs': patch
---

- Preserve exact node inference for built-in Markdown rules while keeping custom rule keys type-safe and open
- Author Markdown parsing and serialization through one schema-wide `codecs: ({ defineCodecs }) => defineCodecs(...)` constructor declaration over immutable slices
- Compile Markdown conversion from installed feature plugins and keep per-operation rule overrides local to each call
