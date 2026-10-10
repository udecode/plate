---
'platejs': major
---

Replace flat Toggle blocks with semantic nested Details and Summary nodes.

Keep Details expanded while editing documents with suggested changes, and move the caret to Summary when closing a Details body.

Create a body paragraph when pressing Enter at the end of an expanded Details summary after its last body block is moved out.

**Migration:** Import `BaseDetailsPlugin` from `platejs/details` and `DetailsPlugin` from `platejs/details/react`. Persist one `details` element whose first child is a `summary` text block and whose remaining children are direct body blocks. Read and update transient disclosure state through `editor.plugin(BaseDetailsPlugin)`.

Add the v54 document migration when loading persisted v53 Toggle values:

```tsx
import {
  defineDocumentMigrations,
  migrateDocument,
  migrateV54,
} from 'platejs/migrations';

const migrations = defineDocumentMigrations({
  plugins: EditorKit,
  schema: EditorSchema,
  sourceFingerprints: { 53: v53Fingerprint },
  steps: { 54: migrateV54 },
});

const current = migrateDocument(persisted, { migrations }).output;
```
