---
'platejs': major
---

Replace flat Toggle blocks with semantic nested Details and Summary nodes.

**Migration:** Import `BaseDetailsPlugin` from `platejs/details` and `DetailsPlugin` from `platejs/details/react`. Persist one `details` element whose first child is a `summary` text block and whose remaining children are direct body blocks. Read and update transient disclosure state through `editor.plugin(BaseDetailsPlugin)`.

Add the v55 document migration when loading v54 Toggle values:

```tsx
import { defineDocumentMigrations, migratePlateV55 } from 'platejs/migrations';

const migrations = defineDocumentMigrations(EditorSchema, {
  steps: { 55: migratePlateV55 },
  unversioned: 54,
});
```
