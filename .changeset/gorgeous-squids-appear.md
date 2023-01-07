---
'@udecode/plate': major
---

- due to esm issues, dnd plugin is not part of plate package anymore. To use it, install `@udecode/plate-ui-dnd` 
```ts
// before
import { createDndPlugin } from '@udecode/plate'
// after
import { createDndPlugin } from '@udecode/plate-ui-dnd'
```
- upgrade peerDeps:
```json
// from
"slate": ">=0.78.0",
"slate-history": ">=0.66.0",
"slate-react": ">=0.79.0"
// to
"slate": ">=0.87.0",
"slate-history": ">=0.86.0",
"slate-react": ">=0.88.0"
```