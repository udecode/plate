---
"@platejs/markdown": patch
---

Added `spread` option to control list spacing in markdown serialization.

Added a new optional `spread` property to `SerializeMdOptions`:
- When `spread` is `false` (default), lists are rendered compactly
- When `spread` is `true`, lists have double line breaks between items

Before (default):
```markdown
1. Item 1
2. Item 2
```

After (with `spread: true`):
```markdown
1. Item 1

2. Item 2
```