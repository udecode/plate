---
'platejs': major
---

Replace flat Toggle blocks with semantic nested Details and Summary nodes.

**Migration:** Import `BaseDetailsPlugin` from `platejs/details` and `DetailsPlugin` from `platejs/details/react`. Persist one `details` element whose first child is a `summary` text block and whose remaining children are direct body blocks. Read and update transient disclosure state through `editor.plugin(BaseDetailsPlugin)`.

Add the v54 document migration when loading persisted v53 Toggle values:

```tsx
import { defineDocumentMigrations, migratePlateV54 } from 'platejs/migrations';

const migrations = defineDocumentMigrations(EditorSchema, {
  steps: { 54: migratePlateV54 },
  unversioned: 53,
});
```
