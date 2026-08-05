---
"@platejs/core": patch
---

Fix HTML deserialization returning bare `Text` nodes at document root when parsing inline-only content. `deserializeHtml` now wraps root-level inline descendants in a default block element (`p`), preserving Plate's block-root document invariant and preventing editor crashes when chunking is enabled.
