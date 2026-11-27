---
'platejs': patch
---

Rename `platejs/react` plugin attributes type `NodeProps` to `NodeAttributes` so `platejs/react` re-exports core `NodeProps`

**Migration:** Update plugin `render.attributes` type annotations from `NodeProps` to `NodeAttributes`:

```tsx
import type { NodeAttributes } from 'platejs/react';
```
